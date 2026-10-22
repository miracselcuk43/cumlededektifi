"""
nlp/emotion.py
Türkçe Duygu Analizi Modülü (Hibrit Sözlük, Bağlamsal Belirteçler ve Vektör Uzayı)
CümleDedektif Projesi
"""

from typing import Dict, Any, List, Optional
from .preprocessing import TurkishPreprocessor
from .word2vec_model import TurkishWord2VecModel


class EmotionAnalyzer:
    """
    Girilen Türkçe cümlenin duygusal tonunu analiz eder.
    Sınıflar:
      - Mutlu / olumlu
      - Üzgün
      - Öfkeli
      - Korkmuş / endişeli
      - Şaşkın
      - Nötr
      - Alaycı veya ironi olasılığı
    """

    # Duygu sözlüğü (Ağırlıklı)
    LEXICON = {
        "mutlu": {
            "mutlu": 0.9, "mutluyum": 0.95, "sevinçli": 0.85, "harika": 0.9, "mükemmel": 0.92,
            "şahane": 0.88, "güzel": 0.65, "muhteşem": 0.9, "başarılı": 0.7, "tebrik": 0.8,
            "kutlarım": 0.8, "şükür": 0.65, "huzurlu": 0.75, "neşeli": 0.85, "coşkulu": 0.85,
            "seviyorum": 0.85, "sevdim": 0.8, "bayıldım": 0.9, "keyifli": 0.8, "gururluyum": 0.85
        },
        "üzgün": {
            "üzgün": 0.9, "üzüldüm": 0.9, "hüzünlü": 0.85, "kederli": 0.9, "acı": 0.7,
            "ağladım": 0.85, "ağlamak": 0.8, "kırıldım": 0.8, "yalnızım": 0.75, "çaresiz": 0.85,
            "keşke": 0.6, "özledim": 0.65, "kaybettik": 0.8, "perişan": 0.85, "yıkıldım": 0.9,
            "pişmanım": 0.75, "mutsuz": 0.85, "mutsuzum": 0.9
        },
        "öfkeli": {
            "öfkeli": 0.9, "kızgın": 0.85, "sinirlendirdi": 0.92, "sinir": 0.8, "çıldırtıcı": 0.9,
            "bıktım": 0.85, "sabrettim": 0.6, "nefret": 0.95, "rezalet": 0.9, "tahammül": 0.8,
            "yeter": 0.7, "haksızlık": 0.75, "saygısız": 0.85, "lanet": 0.9, "berbat": 0.8
        },
        "korkmuş_endişeli": {
            "endişeli": 0.85, "korkuyorum": 0.9, "korktum": 0.9, "tedirgin": 0.8, "kaygılı": 0.85,
            "panik": 0.9, "ürperdim": 0.8, "telaş": 0.75, "korkunç": 0.7, "tehlike": 0.75,
            "ürkütücü": 0.8, "çekiniyorum": 0.7
        },
        "şaşkın": {
            "şaşırdım": 0.9, "inanamıyorum": 0.92, "hayret": 0.85, "şaşkınım": 0.9, "sürpriz": 0.75,
            "beklemiyordum": 0.8, "donakaldım": 0.85, "akılalmaz": 0.85, "nasıl": 0.5
        }
    }

    # Pekiştirici sözcükler (Booster)
    BOOSTERS = {"çok": 1.35, "aşırı": 1.45, "fazlasıyla": 1.3, "son": 1.2, "derece": 1.15, "inanılmaz": 1.4, "müthiş": 1.3}

    # Hafifleticiler (Diminisher)
    DIMINISHERS = {"biraz": 0.65, "azıcık": 0.6, "kısmen": 0.7, "pek": 0.75}

    # Olumsuzluk çeviriciler (Negation shifters)
    NEGATORS = {"değil", "yok", "hiç", "asla"}

    def __init__(self, w2v_model: Optional[TurkishWord2VecModel] = None):
        self.w2v = w2v_model or TurkishWord2VecModel()

    def analyze(self, sentence: str, punctuation_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cümlenin duygu profilini ve kanıtlarını çıkarır.
        """
        tokens = TurkishPreprocessor.tokenize(sentence)
        clean_words = TurkishPreprocessor.normalize_and_clean_tokens(tokens)
        lower_full = TurkishPreprocessor.turkish_lower(sentence)

        scores = {
            "mutlu": 0.0,
            "üzgün": 0.0,
            "öfkeli": 0.0,
            "korkmuş_endişeli": 0.0,
            "şaşkın": 0.0,
        }
        clues: List[Dict[str, str]] = []

        # 1. Kelime tabanlı sözlük ve bağlam taraması
        for i, word in enumerate(clean_words):
            # Önceki kelimeleri kontrol et (booster, diminisher, negator)
            multiplier = 1.0
            is_negated = False

            if i > 0:
                prev_word = clean_words[i - 1]
                if prev_word in self.BOOSTERS:
                    multiplier *= self.BOOSTERS[prev_word]
                elif prev_word in self.DIMINISHERS:
                    multiplier *= self.DIMINISHERS[prev_word]
                elif prev_word in self.NEGATORS:
                    is_negated = True

            # Kök veya gövde kontrolü
            stem = TurkishPreprocessor.extract_stem_heuristic(word)

            for emotion, lex_dict in self.LEXICON.items():
                match_val = lex_dict.get(word) or lex_dict.get(stem)
                if match_val is not None:
                    final_val = match_val * multiplier
                    if is_negated:
                        # "Mutlu değilim" -> mutlu puanı düşer, üzgün puanı artar
                        if emotion == "mutlu":
                            scores["üzgün"] += final_val * 0.8
                            clues.append({"word": f"{clean_words[i-1]} {word}", "emotion": "üzgün", "reason": "Olumsuzluk edatı olumlu anlamı tersine çevirdi"})
                        else:
                            scores[emotion] = max(0.0, scores[emotion] - final_val * 0.5)
                    else:
                        scores[emotion] += final_val
                        clues.append({"word": word, "emotion": emotion, "reason": f"Doğrudan {emotion} sözcük kökü (ağırlık: {match_val:.2f})"})

        # 2. İroni / Alaycılık Heuristiği
        is_ironic = False
        irony_confidence = 0.0
        irony_reason = ""

        # Aşırı pozitif kelime + tırnak veya ünlem veya alaycı bağlam
        has_positive = any(w in self.LEXICON["mutlu"] for w in clean_words)
        has_negative_tail = any(w in {"mahvettin", "yine", "becerdin", "berbat", "güzel oldu", "aferin"} for w in clean_words)

        if punctuation_features.get("has_quotes") and has_positive:
            is_ironic = True
            irony_confidence = 0.72
            irony_reason = "Tırnak içine alınan olumlu ifade gizli imâ veya alaycılık (ironi) göstergesi olabilir."
        elif "aferin" in clean_words and (punctuation_features.get("has_exclamation") or has_negative_tail):
            is_ironic = True
            irony_confidence = 0.81
            irony_reason = "'Aferin' hitabı ve bağlamsal zıtlık sitem/alaycılık hissettirmektedir."
        elif "süper" in clean_words and any(w in {"kesildi", "bozuldu", "iptal", "bitti"} for w in clean_words):
            is_ironic = True
            irony_confidence = 0.85
            irony_reason = "Olumlu niteleyici 'süper' ile olumsuz bir durum tezat oluşturmaktadır."

        # 3. Şaşkınlık ve soru işareti kombinasyonu
        if punctuation_features.get("question_count", 0) > 1 and punctuation_features.get("exclamation_count", 0) > 0:
            scores["şaşkın"] += 0.45
            clues.append({"word": "?! kombini", "emotion": "şaşkın", "reason": "Soru ve ünlem işaretinin birleşimi şaşkınlık ve tepki gösterir"})

        # 4. En yüksek duyguyu seç veya Nötr belirle
        max_score = 0.0
        detected_emotion = "Nötr"

        emotion_display_names = {
            "mutlu": "Mutlu / olumlu",
            "üzgün": "Üzgün",
            "öfkeli": "Öfkeli",
            "korkmuş_endişeli": "Korkmuş / endişeli",
            "şaşkın": "Şaşkın",
        }

        for emo, val in scores.items():
            if val > max_score:
                max_score = val
                detected_emotion = emotion_display_names[emo]

        # Güven skoru hesabı (0.0 - 1.0 arası normalizasyon)
        if is_ironic:
            confidence = irony_confidence
            explanation = irony_reason
            detected_emotion = "Alaycı veya ironi olasılığı"
        elif max_score >= 0.6:
            # 0.6 ile 1.8 arası skoru %65 - %95 bandına eşle
            confidence = min(0.96, 0.65 + (max_score / 3.0) * 0.3)
            explanation = f"Cümlede tespit edilen duygu belirteçleri '{detected_emotion}' tonunu desteklemektedir."
        elif max_score > 0.2:
            confidence = 0.58
            explanation = f"Hafif düzeyde '{detected_emotion}' eğilimi saptandı; bağlama göre nötr de yorumlanabilir."
        else:
            detected_emotion = "Nötr"
            confidence = 0.88 if len(clean_words) > 1 else 0.50
            explanation = "Cümlede belirgin duygusal kutup taşıyan yüklem ya da sıfat saptanmadı; ifade nesnel/durum bildirimi niteliğindedir."

        # Skor dağılımı (grafik için)
        distribution = {
            "Olumlu": round(min(1.0, scores["mutlu"]), 2),
            "Üzgün": round(min(1.0, scores["üzgün"]), 2),
            "Öfkeli": round(min(1.0, scores["öfkeli"]), 2),
            "Endişeli": round(min(1.0, scores["korkmuş_endişeli"]), 2),
            "Şaşkın": round(min(1.0, scores["şaşkın"]), 2),
            "Nötr": round(1.0 - min(0.9, max_score), 2) if max_score < 0.9 else 0.05
        }

        return {
            "label": detected_emotion,
            "confidence": round(confidence, 2),
            "explanation": explanation,
            "clues": clues,
            "distribution": distribution,
            "methodology": "Sözcük ağırlıkları, pekiştirici/olumsuzluk bağlam pencereleri ve noktalama heuristikleri."
        }
