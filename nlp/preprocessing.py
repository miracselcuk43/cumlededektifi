"""
nlp/preprocessing.py
Türkçe Metin Ön İşleme ve Dilsel Morfolojik Ayrıştırma Modülü
CümleDedektif Projesi
"""

import re
from typing import List, Dict, Any, Tuple


class TurkishPreprocessor:
    """
    Türkçe dilinin sondan eklemeli yapısı ve büyük/küçük harf kurallarına uygun
    (İ->i, I->ı gibi) ön işleme ve morfolojik ayıklama motoru.
    """

    # Standart Türkçe stop-words (dolgu kelimeleri)
    STOPWORDS = {
        "ve", "ile", "de", "da", "ki", "bir", "bu", "şu", "o", "için", "gibi",
        "kadar", "daha", "en", "çok", "ise", "diye", "veya", "ya", "yahut",
        "bile", "hem", "ama", "fakat", "lakin", "ancak", "çünkü"
    }

    # Türkçe harf dönüşüm tablosu
    TR_LOWER_MAP = {
        ord('İ'): 'i',
        ord('I'): 'ı',
        ord('Ğ'): 'ğ',
        ord('Ü'): 'ü',
        ord('Ş'): 'ş',
        ord('Ö'): 'ö',
        ord('Ç'): 'ç',
    }

    TR_UPPER_MAP = {
        ord('i'): 'İ',
        ord('ı'): 'I',
        ord('ğ'): 'Ğ',
        ord('ü'): 'Ü',
        ord('ş'): 'Ş',
        ord('ö'): 'Ö',
        ord('ç'): 'Ç',
    }

    @classmethod
    def turkish_lower(cls, text: str) -> str:
        """Türkçe kurallarına uygun küçük harfe dönüştürme."""
        if not text:
            return ""
        return text.translate(cls.TR_LOWER_MAP).lower()

    @classmethod
    def turkish_upper(cls, text: str) -> str:
        """Türkçe kurallarına uygun büyük harfe dönüştürme."""
        if not text:
            return ""
        return text.translate(cls.TR_UPPER_MAP).upper()

    @classmethod
    def split_sentences(cls, text: str) -> List[str]:
        """
        Metni mantıksal cümlelerine ayırır.
        Nokta, soru işareti, ünlem ve üç noktayı dikkate alır.
        Kısaltmaları (örn. 'Dr.', 'Prof.') bozmamaya özen gösterir.
        """
        if not text or not text.strip():
            return []

        cleaned = text.strip()
        # Çoklu cümle bölücü regex
        # Cümle sonu noktalama işaretinden sonra boşluk veya metin sonu
        pattern = r'(?<=[.!?…])\s+(?=[A-ZÇĞİÖŞÜa-zçğıöşü0-9"\'“‘])'
        raw_sentences = re.split(pattern, cleaned)

        sentences = []
        for s in raw_sentences:
            s_clean = s.strip()
            if s_clean:
                sentences.append(s_clean)

        return sentences if sentences else [cleaned]

    @classmethod
    def tokenize(cls, sentence: str) -> List[str]:
        """
        Cümleyi kelime ve noktalama token'larına ayırır.
        """
        if not sentence:
            return []
        # Kelimeleri ve belirgin noktalama işaretlerini ayıkla
        tokens = re.findall(r'[A-Za-zÇĞİÖŞÜçğıöşü]+|[.,!?:;…"\']+', sentence)
        return tokens

    @classmethod
    def normalize_and_clean_tokens(cls, tokens: List[str]) -> List[str]:
        """
        Token'ları küçük harfe çevirir ve saf kelimeleri filtreler.
        """
        words = []
        for tok in tokens:
            lower_tok = cls.turkish_lower(tok)
            # Yalnızca harflerden oluşan kelimeleri al
            clean_word = re.sub(r'[^a-zçğıöşü]', '', lower_tok)
            if clean_word:
                words.append(clean_word)
        return words

    @classmethod
    def extract_punctuation_features(cls, sentence: str) -> Dict[str, Any]:
        """
        Noktalama işaretlerinin sıklık ve konum özelliklerini analiz eder.
        """
        return {
            "has_question_mark": "?" in sentence,
            "question_count": sentence.count("?"),
            "has_exclamation": "!" in sentence,
            "exclamation_count": sentence.count("!"),
            "has_ellipsis": "..." in sentence or "…" in sentence,
            "has_quotes": ('"' in sentence) or ("“" in sentence) or ("'" in sentence),
            "is_all_uppercase": sentence.isupper() and len(re.findall(r'[A-Za-zÇĞİÖŞÜçğıöşü]', sentence)) > 3,
            "elongated_vowels": bool(re.search(r'([aeıioöuü])\1{2,}', cls.turkish_lower(sentence))),
        }

    @classmethod
    def extract_stem_heuristic(cls, word: str) -> str:
        """
        Türkçe sondan eklemeli yapıda çekim eklerini heuristik olarak
        soyutlayıp yaklaşık kök/gövde tahmininde bulunur.
        """
        w = cls.turkish_lower(word)
        if len(w) <= 3:
            return w

        # Çoğul ekleri
        if w.endswith("ler") or w.endswith("lar"):
            w = w[:-3]
        if len(w) <= 3:
            return w

        # İyelik ekleri
        for suffix in ("imiz", "ımız", "ümüz", "umuz", "iniz", "ınız", "ünüz", "unuz", "leri", "ları"):
            if w.endswith(suffix):
                w = w[:-len(suffix)]
                break
        if len(w) <= 3:
            return w

        # Hal ekleri (-de, -da, -den, -dan, -e, -a, -i, -ı, -u, -ü)
        for suffix in ("den", "dan", "ten", "tan", "de", "da", "te", "ta", "ye", "ya", "yi", "yı", "yu", "yü"):
            if w.endswith(suffix):
                w = w[:-len(suffix)]
                break

        return w
