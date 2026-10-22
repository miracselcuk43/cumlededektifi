"""
nlp/intent.py
Türkçe İletişim Amacı ve Pragmatik Söz Eylemi (Speech Act) Tespit Modülü
CümleDedektif Projesi
"""

import re
from typing import Dict, Any, List
from .preprocessing import TurkishPreprocessor


class IntentAnalyzer:
    """
    Cümlenin temel ve ikincil iletişim amaçlarını tespit eder (Pragmatik niyet çözümleme).
    Sınıflar:
      - Bilgi verme
      - Soru sorma
      - Rica etme
      - Emir verme
      - Talimat verme
      - Uyarma
      - Tehdit etme
      - Öneride bulunma
      - Teşekkür etme
      - Özür dileme
      - Tebrik etme
      - Şikâyet etme
      - Davet etme
      - Yasaklama
      - Duygusal ifade
    """

    # Anahtar kelimeler ve düzenli ifadeler
    INTENT_RULES = {
        "Teşekkür etme": {
            "keywords": ["teşekkür", "teşekkürler", "sağol", "sağolun", "minnettarım", "eline sağlık", "ağzına sağlık", "eyvallah", "var ol"],
            "base_score": 0.95
        },
        "Özür dileme": {
            "keywords": ["özür", "kusura bakma", "kusura bakmayın", "affedersiniz", "bağışlayın", "özür dilerim", "hakkını helal et"],
            "base_score": 0.95
        },
        "Tebrik etme": {
            "keywords": ["tebrik", "tebrikler", "kutlarım", "helal olsun", "başarılar", "kutlu olsun", "maşallah"],
            "base_score": 0.92
        },
        "Uyarma": {
            "keywords": ["dikkat", "sakın", "uyarı", "tehlike", "kaygan", "aman ha", "dikkatli ol", "tedbirli ol", "unutma"],
            "base_score": 0.90
        },
        "Tehdit etme": {
            "keywords": ["görürsün sen", "hesabını soracağım", "pişman ederim", "gününü göstereceğim", "elimden çekeceğin var", "mahvederim"],
            "base_score": 0.92
        },
        "Şikâyet etme": {
            "keywords": ["memnun kalmadım", "şikayetçiyim", "şikayet", "berbat", "rezalet", "bozuk", "mağdur", "hizmet alamadım", "çalışmıyor", "iade"],
            "base_score": 0.88
        },
        "Öneride bulunma": {
            "keywords": ["bence", "tavsiye ederim", "öneririm", "iyi olur", "yapabiliriz", "denemelisin", "faydalı olur", "şöyle yapalım"],
            "base_score": 0.82
        },
        "Davet etme": {
            "keywords": ["davet", "bekleriz", "bizimle gelir misin", "katılmak ister misin", "buyrun", "uğra", "çay içmeye gel"],
            "base_score": 0.85
        },
    }

    def analyze(self, sentence: str, imperative_info: Dict[str, Any], emotion_info: Dict[str, Any], punctuation_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Birincil ve ikincil iletişim amaçlarını tespit eder.
        """
        lower_text = TurkishPreprocessor.turkish_lower(sentence.strip())
        tokens = TurkishPreprocessor.tokenize(sentence)
        clean_words = TurkishPreprocessor.normalize_and_clean_tokens(tokens)

        intent_scores: Dict[str, float] = {}
        matched_clues: List[Dict[str, str]] = []

        # 1. Kural tabanlı sözlük taraması
        for intent_name, config in self.INTENT_RULES.items():
            for kw in config["keywords"]:
                if kw in lower_text:
                    intent_scores[intent_name] = max(intent_scores.get(intent_name, 0.0), config["base_score"])
                    matched_clues.append({
                        "phrase": kw,
                        "intent": intent_name,
                        "reason": f"'{kw}' anahtar kelimesi {intent_name.lower()} amacını doğrudan belirtir."
                    })

        # 2. Yasaklama kontrolü
        if imperative_info.get("label") == "Yasaklama":
            intent_scores["Yasaklama"] = 0.94
            matched_clues.append({
                "phrase": "olumsuz emir eki (-ma/-me)",
                "intent": "Yasaklama",
                "reason": "Fiilin olumsuz emir çekimi yasaklama işlevi görür."
            })

        # 3. Talimat verme kontrolü
        if imperative_info.get("label") == "Talimat":
            intent_scores["Talimat verme"] = 0.89
            matched_clues.append({
                "phrase": "ardışık adım / talimat akışı",
                "intent": "Talimat verme",
                "reason": "Eylemin yapılış sırasını belirten yönerge yapısı."
            })

        # 4. Rica etme kontrolü
        is_request = (
            imperative_info.get("label") == "Dolaylı emir" or
            "lütfen" in lower_text or
            "rica" in lower_text or
            "mümkünse" in lower_text or
            "yardımcı olabilir misiniz" in lower_text or
            bool(re.search(r'(?:kapatır|yapar|gelir|verir|açar)\s+mısın', lower_text))
        )
        if is_request:
            intent_scores["Rica etme"] = 0.93
            matched_clues.append({
                "phrase": "rica belirteci / soru kipiyle yumuşatma",
                "intent": "Rica etme",
                "reason": "Karşı taraftan bir eylemin nezaketle yapılmasını talep etme."
            })

        # 5. Emir verme kontrolü
        if imperative_info.get("label") == "Doğrudan emir" and not is_request:
            intent_scores["Emir verme"] = 0.92
            matched_clues.append({
                "phrase": "2. şahıs doğrudan emir kipi",
                "intent": "Emir verme",
                "reason": "Doğrudan yönlendirici ve bağlayıcı buyruk ifadesi."
            })

        # 6. Soru sorma kontrolü
        has_question = punctuation_features.get("has_question_mark", False) or bool(
            re.search(r'\b(mı|mi|mu|mü|kim|ne|nerede|nasıl|niçin|neden|kaç|saat\s+kaçta)\b', lower_text)
        )
        if has_question:
            # Eğer zaten 'Rica etme' veya 'Davet etme' olarak etiketlenmişse soru sorma ikincil işlev olabilir
            current_q_score = 0.70 if ("Rica etme" in intent_scores or "Davet etme" in intent_scores) else 0.90
            intent_scores["Soru sorma"] = current_q_score
            matched_clues.append({
                "phrase": "soru eki veya soru sözcüğü",
                "intent": "Soru sorma",
                "reason": "Muhataptan bilgi talep etme veya netleştirme amacı."
            })

        # 7. Duygusal ifade kontrolü
        if emotion_info.get("label") in ["Mutlu / olumlu", "Üzgün", "Öfkeli", "Korkmuş / endişeli", "Şaşkın"] and emotion_info.get("confidence", 0) >= 0.70:
            intent_scores["Duygusal ifade"] = 0.85
            matched_clues.append({
                "phrase": "yoğun duygu yüklemi",
                "intent": "Duygusal ifade",
                "reason": "Konuşucunun içsel ruh halini ve hislerini dışa vurması."
            })

        # 8. Hiçbir özel niyet tetiklenmediyse -> Bilgi verme (Bildirme)
        if not intent_scores:
            intent_scores["Bilgi verme"] = 0.88
            matched_clues.append({
                "phrase": "bildirme yüklemi",
                "intent": "Bilgi verme",
                "reason": "Nesnel bir olgu, haber veya durumu muhataba bildirme."
            })

        # Sırala ve birincil / ikincil amaçları belirle
        sorted_intents = sorted(intent_scores.items(), key=lambda x: x[1], reverse=True)
        primary_intent = sorted_intents[0][0]
        primary_confidence = sorted_intents[0][1]

        secondary_intent = None
        secondary_confidence = None
        if len(sorted_intents) > 1 and sorted_intents[1][1] >= 0.65:
            secondary_intent = sorted_intents[1][0]
            secondary_confidence = sorted_intents[1][1]

        # Çoklu etiketler listesi
        all_labels = [k for k, v in sorted_intents if v >= 0.65]

        # Tek cümlelik genel yorum oluşturma
        intent_explanations = {
            "Rica etme": "Muhataptan bir isteğin nazik ve yönlendirici bir biçimde yerine getirilmesi talep edilmektedir.",
            "Emir verme": "Muhataba doğrudan bir talimat iletilmekte ve eylemi yapması buyurulmaktadır.",
            "Bilgi verme": "Herhangi bir yönlendirme yapmaksızın bir durum ya da olgu hakkında bilgi paylaşılmaktadır.",
            "Soru sorma": "Bir konu veya durum hakkında karşı taraftan bilgi veya teyit istenmektedir.",
            "Talimat verme": "Yapılması gereken bir işlem adım adım veya yönerge olarak tarif edilmektedir.",
            "Uyarma": "Olası bir olumsuzluk veya tehlikeye karşı dikkatli olunması salık verilmektedir.",
            "Tehdit etme": "Muhataba karşı gözdağı verilmekte veya yaptırım uygulanacağı ifade edilmektedir.",
            "Öneride bulunma": "Kişisel bir görüş veya faydalı olabilecek bir tavsiye sunulmaktadır.",
            "Teşekkür etme": "Yapılan bir iyilik veya yardımdan ötürü memnuniyet ve minnet bildirilmektedir.",
            "Özür dileme": "Oluşan bir kusur veya hatadan ötürü bağışlanma talep edilmektedir.",
            "Tebrik etme": "Elde edilen bir başarı veya mutluluk verici olay kutlanmaktadır.",
            "Şikâyet etme": "Bir ürün, hizmet veya durumdan duyulan memnuniyetsizlik dile getirilmektedir.",
            "Davet etme": "Birlikte bir etkinliğe veya mekâna katılma teklifi sunulmaktadır.",
            "Yasaklama": "Muhatabın belirli bir fiili gerçekleştirmesi kesin olarak men edilmektedir.",
            "Duygusal ifade": "Konuşucunun hissettiği yoğun duygulanım dile getirilmektedir."
        }

        general_comment = intent_explanations.get(
            primary_intent,
            f"Cümlenin ana gayesi {primary_intent.lower()} niteliğindedir."
        )

        return {
            "primary": primary_intent,
            "primary_confidence": round(primary_confidence, 2),
            "secondary": secondary_intent,
            "secondary_confidence": round(secondary_confidence, 2) if secondary_confidence else None,
            "all_labels": all_labels,
            "general_comment": general_comment,
            "matched_clues": matched_clues
        }
