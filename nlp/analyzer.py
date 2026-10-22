"""
nlp/analyzer.py
CümleDedektif Ana Analiz Orkestratörü
Tüm NLP Modüllerinin Bütünleşik Entegrasyonu
"""

import time
from typing import Dict, Any, List
from .preprocessing import TurkishPreprocessor
from .word2vec_model import TurkishWord2VecModel
from .emotion import EmotionAnalyzer
from .imperative import ImperativeAnalyzer
from .politeness import PolitenessAnalyzer
from .intent import IntentAnalyzer
from .sentence_structure import SentenceStructureAnalyzer


class TurkishSentenceDetector:
    """
    CümleDedektif sisteminin tüm NLP motorunu koordine eden ana sınıf.
    Kural tabanlı morfoloji, anlamsal sözlükler ve Gensim Word2Vec vektör uzayını
    bütünleştirerek sonuç üretir.
    """

    def __init__(self):
        self.w2v = TurkishWord2VecModel()
        self.emotion_engine = EmotionAnalyzer(self.w2v)
        self.imperative_engine = ImperativeAnalyzer()
        self.politeness_engine = PolitenessAnalyzer()
        self.intent_engine = IntentAnalyzer()
        self.structure_engine = SentenceStructureAnalyzer()

    def analyze_single_sentence(self, sentence: str) -> Dict[str, Any]:
        """
        Tek bir Türkçe cümlenin uçtan uca ayrıntılı analizini gerçekleştirir.
        """
        start_time = time.time()
        raw_text = sentence.strip() if sentence else ""

        if not raw_text:
            return {
                "error": True,
                "message": "Analiz edilecek cümle boş olamaz.",
                "status_code": 400
            }

        # 1. Ön İşleme & Noktalama
        punctuation_features = TurkishPreprocessor.extract_punctuation_features(raw_text)
        tokens = TurkishPreprocessor.tokenize(raw_text)
        clean_words = TurkishPreprocessor.normalize_and_clean_tokens(tokens)

        # 2. Emir Durumu Analizi
        imperative_res = self.imperative_engine.analyze(raw_text, punctuation_features)

        # 3. Nezaket Analizi (Emir durumunu bağlamsal girdi olarak alır)
        politeness_res = self.politeness_engine.analyze(raw_text, imperative_res, punctuation_features)

        # 4. Duygu Analizi
        emotion_res = self.emotion_engine.analyze(raw_text, punctuation_features)

        # 5. İletişim Amacı Analizi (Emir ve Duyguyu girdi olarak alır)
        intent_res = self.intent_engine.analyze(raw_text, imperative_res, emotion_res, punctuation_features)

        # 6. Cümle Yapısı ve Morfolojik Özellikler
        structure_res = self.structure_engine.analyze(raw_text, imperative_res, punctuation_features)

        # 7. Word2Vec Anlamsal Vektör Analizi (Cümledeki kelimelerin semantik komşuları)
        semantic_vectors = []
        for word in clean_words[:6]:  # İlk 6 anlamlı kelimeyi al
            neighbors = self.w2v.find_most_similar(word, top_k=3)
            vec = self.w2v.get_vector(word)
            if vec is not None:
                semantic_vectors.append({
                    "word": word,
                    "has_embedding": True,
                    "similar_words": [{"word": n[0], "similarity": n[1]} for n in neighbors]
                })

        # 8. Dilsel Kanıtlar ve Vurgulama
        linguistic_clues = []
        # Emir ipuçları
        for c in imperative_res.get("clues", []):
            linguistic_clues.append({
                "type": "imperative",
                "category": "Emir / Kip",
                "target": str(c.get("word")),
                "role": c.get("role", "Emir göstergesi"),
                "detail": c.get("detail", "")
            })
        # Nezaket ipuçları
        for c in politeness_res.get("clues", []):
            linguistic_clues.append({
                "type": "politeness",
                "category": "Nezaket",
                "target": str(c.get("word")),
                "role": c.get("impact", "Nezaket belirteci"),
                "detail": c.get("explanation", "")
            })
        # Duygu ipuçları
        for c in emotion_res.get("clues", []):
            linguistic_clues.append({
                "type": "emotion",
                "category": "Duygu",
                "target": str(c.get("word")),
                "role": c.get("emotion", "Duygusal kutup"),
                "detail": c.get("reason", "")
            })
        # İletişim amacı ipuçları
        for c in intent_res.get("matched_clues", []):
            linguistic_clues.append({
                "type": "intent",
                "category": "İletişim Amacı",
                "target": str(c.get("phrase")),
                "role": c.get("intent", "Amaç"),
                "detail": c.get("reason", "")
            })

        # 9. Belirsizlik Değerlendirmesi (Uncertainty Analysis)
        uncertainties = []
        if imperative_res["label"] == "Dolaylı emir":
            uncertainties.append("Cümle biçimsel olarak 'soru' yapısında olmasına karşın pragmatik olarak 'rica/yönlendirme' işlevi görmektedir; samimiyet veya hiyerarşik bağlama göre algı değişebilir.")
        if emotion_res["label"] == "Alaycı veya ironi olasılığı":
            uncertainties.append("İroni tespiti saf metin ortamında ses tonu ve yüz mimikleri olmaksızın yapılmıştır; bağlama göre gerçek bir takdir ifadesi de olabilir.")
        if politeness_res["label"] == "Nötr" and imperative_res["label"] == "Doğrudan emir":
            uncertainties.append("Kısa ve doğrudan emirler iş ortamında pratik talimat, samimi ilişkilerde doğal yönlendirme, resmi ortamda ise buyurgan algılanabilir.")
        if not uncertainties:
            uncertainties.append("Cümle açık ve belirgin dilsel ipuçları taşımaktadır; çoklu yoruma açıklık düzeyi düşüktür.")

        # 10. Bütünleşik Açıklama (Synthesis)
        # Örnek: “Lütfen” ifadesi nezaket gösterirken “kapatır mısın?” yapısı dolaylı rica işlevi görür.
        synthesis_parts = []
        if "lütfen" in raw_text.lower():
            synthesis_parts.append("“Lütfen” ifadesi nezaket gösterirken")
        elif "yardımcı olabilir misiniz" in raw_text.lower():
            synthesis_parts.append("“yardımcı olabilir misiniz?” kalıbı saygılı rica tonu sağlarken")
        elif "teşekkür" in raw_text.lower():
            synthesis_parts.append("“Teşekkür” ifadesi minnet ve nezaket göstergesi iken")

        if imperative_res["label"] == "Dolaylı emir":
            synthesis_parts.append("soru kipi dolaylı rica/yönlendirme işlevi görür.")
        elif imperative_res["label"] == "Doğrudan emir":
            synthesis_parts.append(f"doğrudan emir kipi talimatı muhataba buyruk olarak iletir.")
        elif imperative_res["label"] == "Yasaklama":
            synthesis_parts.append("olumsuz emir kipi eylemin yapılmasını kesin olarak engeller.")
        else:
            synthesis_parts.append(f"ifade '{emotion_res['label'].lower()}' duygusuyla birleştirilmiş bir bildirim niteliğindedir.")

        synthesis_explanation = " ".join(synthesis_parts)

        elapsed = round((time.time() - start_time) * 1000, 2)

        return {
            "sentence": raw_text,
            "overall_summary": intent_res["general_comment"],
            "synthesis_explanation": synthesis_explanation,
            "emotion": {
                "label": emotion_res["label"],
                "confidence": emotion_res["confidence"],
                "explanation": emotion_res["explanation"],
                "distribution": emotion_res["distribution"],
                "methodology": emotion_res["methodology"]
            },
            "imperative": {
                "label": imperative_res["label"],
                "sub_type": imperative_res["sub_type"],
                "confidence": imperative_res["confidence"],
                "explanation": imperative_res["explanation"]
            },
            "politeness": {
                "label": politeness_res["label"],
                "score": politeness_res["score"],
                "confidence": politeness_res["confidence"],
                "explanation": politeness_res["explanation"]
            },
            "intent": {
                "primary": intent_res["primary"],
                "primary_confidence": intent_res["primary_confidence"],
                "secondary": intent_res["secondary"],
                "secondary_confidence": intent_res["secondary_confidence"],
                "all_labels": intent_res["all_labels"],
                "general_comment": intent_res["general_comment"]
            },
            "structure": {
                "sentence_type": structure_res["sentence_type"],
                "polarity": structure_res["polarity"],
                "negation_evidence": structure_res["negation_evidence"],
                "pronouns": structure_res["pronouns"],
                "vocatives": structure_res["vocatives"],
                "punctuation_summary": structure_res["punctuation_summary"],
                "word_count": structure_res["word_count"],
                "character_count": structure_res["character_count"],
                "morphology_note": structure_res["morphology_note"]
            },
            "linguistic_clues": linguistic_clues,
            "uncertainties": uncertainties,
            "word2vec_semantic_vectors": semantic_vectors,
            "metadata": {
                "execution_time_ms": elapsed,
                "academic_framework": "Austin & Searle Speech Act Theory + Turkish Agglutinative Morphology Heuristics + Word2Vec Embeddings"
            }
        }

    def analyze_batch(self, text: str) -> Dict[str, Any]:
        """
        Metin içindeki tüm cümleleri ayrı ayrı tespit edip toplu analiz eder.
        """
        if not text or not text.strip():
            return {
                "error": True,
                "message": "Girdi metni boş olamaz.",
                "status_code": 400
            }

        sentences = TurkishPreprocessor.split_sentences(text)
        results = []
        for s in sentences:
            if s.strip():
                results.append(self.analyze_single_sentence(s))

        return {
            "sentence_count": len(results),
            "results": results
        }
