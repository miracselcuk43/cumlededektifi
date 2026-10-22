"""
nlp/imperative.py
Türkçe Emir ve Talimat Kipi Tespit Modülü
CümleDedektif Projesi
"""

import re
from typing import Dict, Any, List
from .preprocessing import TurkishPreprocessor


class ImperativeAnalyzer:
    """
    Cümlenin doğrudan emir, yasaklama, talimat, dolaylı yönlendirme veya
    emir niteliği taşımayan bir ifade olup olmadığını morfolojik ve pragmatik
    (Searle & Austin söz eylemleri kuramı) kurallarla inceler.
    """

    # Doğrudan emir kökleri ve 2. tekil/çoğul fiil biçimleri
    IMPERATIVE_VERB_STEMS = {
        "kapat", "aç", "gel", "git", "otur", "kalk", "dur", "sus", "yap",
        "yaz", "oku", "bak", "ver", "al", "gönder", "ilet", "dinle", "çık",
        "gir", "bırak", "hazırla", "çöz", "bitir", "başla", "ara", "koş"
    }

    # Çoğul/resmi emir ekleri
    IMPERATIVE_PLURAL_SUFFIXES = (
        "iniz", "ınız", "ünüz", "unuz", "yin", "yın", "yün", "yun", "in", "ın", "ün", "un"
    )

    # Talimat bağlaçları ve sıralayıcıları
    INSTRUCTION_MARKERS = {
        "önce", "sonra", "ardından", "daha sonra", "ilk olarak", "adım", "aşama", "sırasıyla"
    }

    # Dolaylı rica/soru belirteçleri
    INDIRECT_REQUEST_PATTERNS = [
        r"(?:kapat|yap|ver|al|gel|git|bak|aç|gönder|oku|yaz|yardım\s+et)(?:ır|ir|ur|ür|ar|er)\s+mısın",
        r"(?:kapat|yap|ver|al|gel|git|bak|aç|gönder|oku|yaz|yardım\s+et)(?:ır|ir|ur|ür|ar|er)\s+misiniz",
        r"(?:abilir|ebilir)\s+misiniz",
        r"(?:abilir|ebilir)\s+misin",
        r"(?:olur\s+mu)",
        r"(?:mümkün\s+mü)",
    ]

    def analyze(self, sentence: str, punctuation_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Emir durumu, tipi, gerekçesi ve güven düzeyini çıkarır.
        """
        raw_text = sentence.strip()
        lower_text = TurkishPreprocessor.turkish_lower(raw_text)
        tokens = TurkishPreprocessor.tokenize(raw_text)
        clean_words = TurkishPreprocessor.normalize_and_clean_tokens(tokens)

        if not clean_words:
            return {
                "label": "Emir niteliği taşımayan ifade",
                "confidence": 0.99,
                "sub_type": "Boş metin",
                "explanation": "Analiz edilecek fiil veya yüklem bulunamadı.",
                "clues": []
            }

        clues = []
        last_word = clean_words[-1]
        has_question = punctuation_features.get("has_question_mark", False) or bool(
            re.search(r'\b(mı|mi|mu|mü|mısın|misin|musun|müsün|mısınız|misiniz)\b', lower_text)
        )

        # 1. Dolaylı Emir / Yönlendirme Kontrolü (Örn: "Kapıyı kapatır mısın?", "Açar mısınız?")
        is_indirect = False
        for pat in self.INDIRECT_REQUEST_PATTERNS:
            if re.search(pat, lower_text):
                is_indirect = True
                clues.append({
                    "word": re.search(pat, lower_text).group(0),
                    "role": "Dolaylı Rica / Geniş Zaman Soru Kipi",
                    "detail": "Geniş zaman veya yeterlilik kipi soru ekiyle birleşerek dolaylı emir/rica işlevi görmektedir."
                })
                break

        if is_indirect or (has_question and any(lower_text.endswith(s) for s in ["misin?", "mısın?", "misiniz?", "mısınız?", "misin", "mısın", "misiniz", "mısınız"])):
            return {
                "label": "Dolaylı emir",
                "sub_type": "Soru biçiminde rica / Dolaylı yönlendirme",
                "confidence": 0.93,
                "explanation": "Cümle biçimsel olarak soru yapısındadır ancak edimbilimsel (pragmatic) açıdan muhataptan bir eylemi gerçekleştirmesini bekleyen dolaylı bir ricadır.",
                "clues": clues
            }

        # 2. Yasaklama Kontrolü (Örn: "Buraya gelme!", "Dokunmayın", "Girmeyiniz")
        is_prohibition = False
        prohibition_word = ""

        # Son kelimede veya yüklemde olumsuz emir kipi (-ma, -me, -mayın, -meyin, -mayınız)
        for w in reversed(clean_words):
            # "gelme", "yapma", "dokunma", "konuşmayın", "girmeyiniz"
            if re.search(r'(?:ma|me|mayın|meyin|mayınız|meyiniz)$', w) and len(w) > 4:
                # Ancak "çalışma", "deneme" gibi isimleşmiş kelimeleri ayırt etmek için kontrol
                stem_candidate = re.sub(r'(?:ma|me|mayın|meyin|mayınız|meyiniz)$', '', w)
                if stem_candidate in self.IMPERATIVE_VERB_STEMS or len(stem_candidate) >= 2:
                    is_prohibition = True
                    prohibition_word = w
                    break

        if "sakın" in clean_words or "yasak" in clean_words:
            is_prohibition = True
            prohibition_word = prohibition_word or "sakın/yasak"

        if is_prohibition and not has_question:
            clues.append({
                "word": prohibition_word,
                "role": "Yasaklama Belirteci / Olumsuz Emir Eki",
                "detail": "'-ma/-me' olumsuzluk ekiyle birleşen eylem muhatabın fiili yapmasını men etmektedir."
            })
            return {
                "label": "Yasaklama",
                "sub_type": "Olumsuz emir kipi",
                "confidence": 0.94,
                "explanation": f"'{prohibition_word}' ifadesi yasaklayıcı emir kipi içermekte ve eylemin yapılmasını engellemektedir.",
                "clues": clues
            }

        # 3. Talimat Kontrolü (Örn: "Önce dosyayı aç, sonra kaydet.", "Formu doldurunuz.")
        has_steps = any(m in clean_words for m in self.INSTRUCTION_MARKERS) or ("," in sentence and len(clean_words) >= 4)
        has_imperative_anywhere = any(w in self.IMPERATIVE_VERB_STEMS for w in clean_words)

        if has_steps and has_imperative_anywhere and not has_question:
            clues.append({
                "word": [w for w in clean_words if w in self.INSTRUCTION_MARKERS or w in self.IMPERATIVE_VERB_STEMS],
                "role": "Sıralı Adım ve Yönerge Belirteçleri",
                "detail": "Cümle adım adım yapılması gereken bir işlem dizisi tarif etmektedir."
            })
            return {
                "label": "Talimat",
                "sub_type": "Prosedürel yönerge",
                "confidence": 0.89,
                "explanation": "Cümledeki ardışık eylemler veya sıralama bağlaçları yönerge/talimat amacını gösterir.",
                "clues": clues
            }

        # 4. Doğrudan Emir Kontrolü (Örn: "Kapıyı kapat.", "Hemen buraya gel.", "Sus!")
        is_direct_imperative = False
        target_verb = ""

        # Son kelime doğrudan emir kökü mü?
        if last_word in self.IMPERATIVE_VERB_STEMS:
            is_direct_imperative = True
            target_verb = last_word
        else:
            # Çoğul/saygı emir eki alıp almadığını kontrol et ("kapatın", "açınız", "oturunuz")
            for suffix in self.IMPERATIVE_PLURAL_SUFFIXES:
                if last_word.endswith(suffix):
                    stem = last_word[:-len(suffix)]
                    if stem in self.IMPERATIVE_VERB_STEMS or len(stem) >= 2:
                        is_direct_imperative = True
                        target_verb = last_word
                        break

        # Tek kelimelik emirler: "Sus!", "Dur!"
        if len(clean_words) == 1 and clean_words[0] in self.IMPERATIVE_VERB_STEMS:
            is_direct_imperative = True
            target_verb = clean_words[0]

        if is_direct_imperative and not has_question:
            clues.append({
                "word": target_verb,
                "role": "Doğrudan Emir Yüklemi (2. Şahıs Emir Kipi)",
                "detail": f"'{target_verb}' eylemi doğrudan muhataba yönelik çıplak emir kipi taşımaktadır."
            })
            # Lütfen ile yumuşatılmış mı?
            has_please = "lütfen" in clean_words or "mümkünse" in clean_words
            sub_type = "Nezaketle yumuşatılmış doğrudan talep" if has_please else "Yalın doğrudan emir"
            conf = 0.95 if not has_please else 0.88

            return {
                "label": "Doğrudan emir",
                "sub_type": sub_type,
                "confidence": conf,
                "explanation": f"Yüklem olan '{target_verb}' doğrudan emir kipi çekimindedir{' (lütfen ifadesiyle nezaket kazandırılmıştır)' if has_please else ''}.",
                "clues": clues
            }

        # 5. Emir Niteliği Taşımayan İfade
        return {
            "label": "Emir niteliği taşımayan ifade",
            "sub_type": "Bildirme veya Yalın Soru",
            "confidence": 0.92,
            "explanation": "Cümle emir, buyruk veya doğrudan/dolaylı yönlendirme eki taşımamakta; durum ya da bilgi aktarımı yapmaktadır.",
            "clues": []
        }
