"""
nlp/sentence_structure.py
Türkçe Cümle Yapısı, Sözdizimsel Tip ve Morfolojik Ögeler Modülü
CümleDedektif Projesi
"""

import re
from typing import Dict, Any, List
from .preprocessing import TurkishPreprocessor


class SentenceStructureAnalyzer:
    """
    Cümle yapısını (bildirme, soru, ünlem, emir), olumluluk/olumsuzluk halini,
    zamirleri, hitapları ve dilsel ipuçlarını analiz eder.
    """

    # Kişi zamirleri
    PRONOUNS = {
        "ben": "1. Tekil (Ben)",
        "sen": "2. Tekil (Sen)",
        "o": "3. Tekil (O)",
        "biz": "1. Çoğul (Biz)",
        "siz": "2. Çoğul (Siz - Saygı veya Çoğulluk)",
        "onlar": "3. Çoğul (Onlar)",
        "bana": "1. Tekil Yönelme (Bana)",
        "sana": "2. Tekil Yönelme (Sana)",
        "ona": "3. Tekil Yönelme (Ona)",
        "bize": "1. Çoğul Yönelme (Bize)",
        "size": "2. Çoğul Yönelme (Size)",
        "onlara": "3. Çoğul Yönelme (Onlara)",
        "beni": "1. Tekil Belirtme (Beni)",
        "seni": "2. Tekil Belirtme (Seni)",
        "bizi": "1. Çoğul Belirtme (Bizi)",
        "sizi": "2. Çoğul Belirtme (Sizi)",
        "benim": "1. Tekil İyelik (Benim)",
        "senin": "2. Tekil İyelik (Senin)",
        "bizim": "1. Çoğul İyelik (Bizim)",
        "sizin": "2. Çoğul İyelik (Sizin)"
    }

    # Hitap ifadeleri
    VOCATIVES = {
        "hocam": "Akademik / Saygı Hitabı",
        "efendim": "Nezaket Hitabı",
        "sayın": "Resmi Protokol Hitabı",
        "arkadaşlar": "Topluluk Hitabı",
        "kardeşim": "Samimi Hitap",
        "dostum": "Samimi Hitap",
        "canım": "Şefkat Hitabı",
        "öğretmenim": "Öğrenci Hitabı",
        "müdürüm": "Kurumsal Hitap",
        "bakar mısınız": "Seslenme / Dikkat Çekme"
    }

    # Olumsuzluk ekleri ve belirteçleri
    NEGATION_MARKERS = ["değil", "yok", "hiç", "asla", "katiyen"]

    def analyze(self, sentence: str, imperative_info: Dict[str, Any], punctuation_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sözdizimsel ve morfolojik yapı analizi.
        """
        raw_text = sentence.strip()
        lower_text = TurkishPreprocessor.turkish_lower(raw_text)
        tokens = TurkishPreprocessor.tokenize(raw_text)
        clean_words = TurkishPreprocessor.normalize_and_clean_tokens(tokens)

        # 1. Olumlu / Olumsuz Yapı Tespiti
        is_negative = False
        negation_evidence = []

        for neg in self.NEGATION_MARKERS:
            if neg in clean_words:
                is_negative = True
                negation_evidence.append(f"'{neg}' edatı/sözcüğü")

        # Fiildeki olumsuzluk ekleri (-ma, -me, -mıyor, -miyor, -muyor, -müyor, -maz, -mez)
        for w in clean_words:
            if re.search(r'(?:mıyor|miyor|muyor|müyor|maz|mez|madım|medim|madı|medi|mam|mem)$', w):
                is_negative = True
                negation_evidence.append(f"'{w}' yükleminde fiil olumsuzluk eki")
                break
            # Yasaklama emirleri de olumsuzdur
            if imperative_info.get("label") == "Yasaklama":
                is_negative = True
                negation_evidence.append("Yasaklayıcı olumsuz emir kipi")
                break

        polarity = "Olumsuz" if is_negative else "Olumlu"

        # 2. Cümle Türü (Soru, Ünlem, Emir, Bildirme)
        sentence_type = "Bildirme"
        has_q_mark = punctuation_features.get("has_question_mark", False)
        has_q_particle = bool(re.search(r'\b(mı|mi|mu|mü|mısın|misin|misiniz|mısınız)\b', lower_text))
        has_excl_mark = punctuation_features.get("has_exclamation", False)

        if has_q_mark or has_q_particle:
            sentence_type = "Soru"
        elif imperative_info.get("label") == "Doğrudan emir" or imperative_info.get("label") == "Yasaklama":
            sentence_type = "Emir"
        elif has_excl_mark:
            sentence_type = "Ünlem"
        else:
            sentence_type = "Bildirme"

        # 3. Kişi Zamirleri
        found_pronouns = []
        for word in clean_words:
            if word in self.PRONOUNS:
                found_pronouns.append({
                    "word": word,
                    "type": self.PRONOUNS[word]
                })

        # 4. Hitap İfadeleri
        found_vocatives = []
        for voc, voc_type in self.VOCATIVES.items():
            if voc in lower_text:
                found_vocatives.append({
                    "word": voc,
                    "type": voc_type
                })

        # 5. Noktalama Özeti
        punctuation_summary = []
        if punctuation_features.get("has_question_mark"):
            punctuation_summary.append(f"Soru işareti (?) x{punctuation_features.get('question_count')}")
        if punctuation_features.get("has_exclamation"):
            punctuation_summary.append(f"Ünlem işareti (!) x{punctuation_features.get('exclamation_count')}")
        if punctuation_features.get("has_ellipsis"):
            punctuation_summary.append("Üç nokta (...) - Eksiltili/duraksamalı ifade")
        if punctuation_features.get("has_quotes"):
            punctuation_summary.append("Tırnak işareti (\"...\") - Alıntı veya kinaye")
        if not punctuation_summary:
            punctuation_summary.append("Nokta (.) - Standart cümle sonu")

        # 6. Dilsel Sınırlama ve Morfoloji Notu
        morphology_note = (
            "Türkçe sondan eklemeli (agglutinative) bir dil olduğundan kök ve gövdeye gelen çoklu yapım/çekim ekleri "
            "sözdizimsel işlevi derinden etkiler. Kural tabanlı ayrıştırıcı yaklaşık kök çözümleme "
            "uygulamaktadır; bağlam ve fonetik uyumlar bu heuristiklerle modellenmiştir."
        )

        return {
            "sentence_type": sentence_type,
            "polarity": polarity,
            "negation_evidence": negation_evidence,
            "pronouns": found_pronouns,
            "vocatives": found_vocatives,
            "punctuation_summary": punctuation_summary,
            "word_count": len(clean_words),
            "character_count": len(raw_text),
            "morphology_note": morphology_note
        }
