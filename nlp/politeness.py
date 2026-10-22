"""
nlp/politeness.py
Türkçe Nezaket, Resmiyet ve Nezaketsizlik Düzeyi Analiz Modülü
CümleDedektif Projesi
"""

import re
from typing import Dict, Any, List
from .preprocessing import TurkishPreprocessor


class PolitenessAnalyzer:
    """
    Cümlenin nezaket derecesini; nezaket belirteçleri, rica ekleri,
    hitap biçimleri, buyurganlık veya kaba/saldırgan ifadeler ışığında derecelendirir.
    Sınıflar:
      - Çok nazik
      - Nazik
      - Nötr
      - Buyurgan
      - Kaba / saldırgan
    """

    # Çok nazik belirteçler
    VERY_POLITE_MARKERS = {
        "lütfen": 0.45,
        "zahmet olmazsa": 0.55,
        "mümkünse": 0.40,
        "rica etsem": 0.50,
        "istirham ederim": 0.60,
        "lütfeder misiniz": 0.65,
        "minnettarım": 0.45,
        "saygılarımla": 0.45,
        "hürmetler": 0.45
    }

    # Nazik belirteçler ve kalıplar
    POLITE_MARKERS = {
        "rica ederim": 0.35,
        "teşekkür": 0.40,
        "teşekkürler": 0.35,
        "teşekkür ederim": 0.40,
        "sağol": 0.25,
        "sağolun": 0.30,
        "özür dilerim": 0.40,
        "kusura bakmayın": 0.35,
        "affedersiniz": 0.35,
        "acaba": 0.25,
        "memnun olurum": 0.35,
        "kolay gelsin": 0.30,
        "iyi günler": 0.30,
        "merhaba": 0.20,
        "efendim": 0.30,
        "sayın": 0.35
    }

    # Kaba / saldırgan / aşağılayıcı ifadeler
    RUDE_OFFENSIVE_MARKERS = {
        "defol": 0.85,
        "kes sesini": 0.90,
        "sus be": 0.85,
        "sus": 0.65,
        "cehennem": 0.70,
        "aptal": 0.85,
        "salak": 0.80,
        "ahmak": 0.75,
        "geri zekalı": 0.95,
        "terbiyesiz": 0.75,
        "lanet": 0.70,
        "bıktım senden": 0.75,
        "sen kimsin": 0.65,
        "çık dışarı": 0.65
    }

    def analyze(self, sentence: str, imperative_info: Dict[str, Any], punctuation_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Nezaket sınıfı, puanı (-1.0 ile +1.0 arası) ve gerekçesini üretir.
        """
        raw_text = sentence.strip()
        lower_text = TurkishPreprocessor.turkish_lower(raw_text)
        tokens = TurkishPreprocessor.tokenize(raw_text)
        clean_words = TurkishPreprocessor.normalize_and_clean_tokens(tokens)

        politeness_score = 0.0  # -1.0 (aşırı kaba) ile +1.0 (çok nazik) arası
        clues: List[Dict[str, str]] = []

        # 1. Kaba / Saldırgan kontrolü
        for rude_phrase, weight in self.RUDE_OFFENSIVE_MARKERS.items():
            if rude_phrase in lower_text:
                politeness_score -= weight
                clues.append({
                    "word": rude_phrase,
                    "impact": "Negatif / Kaba",
                    "explanation": f"'{rude_phrase}' ifadesi saldırgan, aşağılayıcı veya kırıcı bir ton taşımaktadır."
                })

        # 2. Çok nazik belirteçler
        for marker, weight in self.VERY_POLITE_MARKERS.items():
            if marker in lower_text:
                politeness_score += weight
                clues.append({
                    "word": marker,
                    "impact": "Pozitif / Yüksek Nezaket",
                    "explanation": f"'{marker}' kullanımı muhataba duyulan derin saygıyı ve yüksek nezaket düzeyini gösterir."
                })

        # 3. Nazik belirteçler
        for marker, weight in self.POLITE_MARKERS.items():
            if marker in lower_text and not any(marker in c["word"] for c in clues):
                politeness_score += weight
                clues.append({
                    "word": marker,
                    "impact": "Pozitif / Nazik",
                    "explanation": f"'{marker}' ifadesi nezaketi ve sosyal uyumu destekler."
                })

        # 4. Soru ve Yeterlilik Kipi ile Dolaylı Rica Etkisi
        # Örn: "kapatır mısın?", "yardımcı olabilir misiniz?"
        is_indirect_req = imperative_info.get("label") == "Dolaylı emir"
        if is_indirect_req:
            # -ebilir misiniz veya -ır mısınız
            if "misiniz" in lower_text or "mısınız" in lower_text:
                politeness_score += 0.40
                clues.append({
                    "word": "çoğul/resmi soru kipi (-misiniz)",
                    "impact": "Pozitif / Saygılı Mesafe",
                    "explanation": "2. çoğul şahıs ekiyle sorulan rica nezaket ve saygı derecesini yükseltir."
                })
            else:
                politeness_score += 0.25
                clues.append({
                    "word": "dolaylı rica yapısı",
                    "impact": "Pozitif / Nezaket",
                    "explanation": "Emir vermek yerine soru kalıbı kullanarak yönlendirme yapmak nezaket göstergesidir."
                })

        # 5. Doğrudan Emir ve Buyurganlık Etkisi
        if imperative_info.get("label") == "Doğrudan emir":
            # Eğer "lütfen" yoksa ve doğrudan çıplak emirse buyurgan puanı alır
            has_softener = any(m in lower_text for m in self.VERY_POLITE_MARKERS) or any(m in lower_text for m in self.POLITE_MARKERS)
            if not has_softener:
                politeness_score -= 0.40
                clues.append({
                    "word": "Çıplak emir yüklemi",
                    "impact": "Negatif / Buyurgan",
                    "explanation": "Nezaket veya rica eki bulunmayan doğrudan emir kipi buyurgan bir etki yaratır."
                })
            else:
                # "Lütfen kapıyı kapat." -> Nezaketle dengelenmiş emir
                clues.append({
                    "word": "Yumuşatılmış emir",
                    "impact": "Dengeli",
                    "explanation": "Doğrudan emir fiili nezaket belirteciyle ('lütfen') dengelenmiştir."
                })

        # Ünlem sayısı ve büyük harf etkisi (bağırma/baskı tonu)
        if punctuation_features.get("is_all_uppercase"):
            politeness_score -= 0.20
            clues.append({"word": "TAMAMI BÜYÜK HARF", "impact": "Negatif", "explanation": "İnternet ve yazışma kültüründe bağırma/agresyon göstergesidir."})

        # 6. Sınıf belirleme
        if politeness_score <= -0.5:
            classification = "Kaba / saldırgan"
            confidence = 0.90
            desc = "Cümle açık veya örtük saygısızlık, hakaret veya aşağılama tonu barındırmaktadır."
        elif politeness_score <= -0.2:
            classification = "Buyurgan"
            confidence = 0.86
            desc = "Cümle nezaket yumuşatıcısı içermeyen, kestirme ve buyurucu bir emir tonuna sahiptir."
        elif politeness_score >= 0.6:
            classification = "Çok nazik"
            confidence = 0.92
            desc = "Cümle birden fazla saygı belirteci, resmiyet ve yüksek nezaket ifadesi içermektedir."
        elif politeness_score >= 0.2:
            classification = "Nazik"
            confidence = 0.88
            desc = "Cümle toplumsal nezaket kalıplarına ve saygılı rica diline uygundur."
        else:
            classification = "Nötr"
            confidence = 0.85
            desc = "Cümle belirgin bir nezaket ya da kabalık ögesi içermemekte, nötr tonda bilgi aktarmaktadır."

        return {
            "label": classification,
            "score": round(max(-1.0, min(1.0, politeness_score)), 2),
            "confidence": confidence,
            "explanation": desc,
            "clues": clues
        }
