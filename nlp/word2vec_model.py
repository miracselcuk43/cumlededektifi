"""
nlp/word2vec_model.py
Gensim ve Word2Vec Türkçe Anlamsal Vektör Modeli
CümleDedektif Projesi
trModel100 (100 Boyutlu, 489.230 Kelimelik Türkçe Model) Entegrasyonu
"""

import os
import math
import json
from typing import List, Dict, Tuple, Optional, Any
from .preprocessing import TurkishPreprocessor


class TurkishWord2VecModel:
    """
    Türkçe eğitim modeli (trModel100, 100 Boyut) ve korpusu üzerinde
    sözcükler arasındaki anlamsal kosinüs benzerliğini hesaplayan,
    vektör uzayı projeksiyonları sunan Word2Vec yöneticisi.
    """

    MODEL_100D_JSON = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "word2vec_100d_extracted.json"
    )
    RAW_BINARY_MODEL = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "word2vec_tr", "word2vecTRmodel100", "trModel100"
    )

    VECTOR_DIM = 100

    def __init__(self):
        self.model_source = "trModel100"
        self.vectors: Dict[str, List[float]] = {}
        self.source_vocab_size = 489230
        self._load_model()

    def _load_model(self):
        """
        Kullanıcının yüklediği trModel100 (100 boyutlu Word2Vec) verilerini yükler.
        """
        # 1. Önceden çıkarılmış 100D JSON dosyasını kontrol et
        if os.path.exists(self.MODEL_100D_JSON):
            try:
                with open(self.MODEL_100D_JSON, "r", encoding="utf-8") as f:
                    payload = json.load(f)
                    self.vectors = payload.get("vocabulary", {})
                    self.VECTOR_DIM = payload.get("dimension", 100)
                    self.source_vocab_size = payload.get("source_vocab_size", 489230)
                    self.model_source = "trModel100 (100-Boyutlu Türkçe Word2Vec Modeli)"
                    return
            except Exception as e:
                print(f"[Word2Vec] JSON yükleme hatası: {e}")

        # 2. Gensim kuruluysa ve raw binary varsa doğrudan Gensim ile yüklemeyi dene
        if os.path.exists(self.RAW_BINARY_MODEL):
            try:
                from gensim.models import KeyedVectors  # type: ignore
                kv = KeyedVectors.load_word2vec_format(self.RAW_BINARY_MODEL, binary=True)
                for w in kv.index_to_key[:5000]:
                    self.vectors[w] = list(kv[w])
                self.VECTOR_DIM = kv.vector_size
                self.source_vocab_size = len(kv.index_to_key)
                self.model_source = "trModel100 (Gensim KeyedVectors)"
                return
            except Exception:
                pass

        # 3. Yedek anlamsal uzay oluştur
        self._build_fallback_embeddings()

    def _build_fallback_embeddings(self):
        """Yedek semantik uzay (dosya eksikse devrede kalır)."""
        self.VECTOR_DIM = 24
        self.model_source = "Deterministik Anlamsal Uzay (Yedek)"
        semantic_anchors = {
            "harika": [0.92, 0.70, 0.40, -0.10, 0.20, -0.10, 0.10, 0.30],
            "güzel": [0.85, 0.40, 0.50, -0.05, 0.30, -0.10, 0.00, 0.20],
            "mutlu": [0.95, 0.60, 0.40, -0.20, 0.10, -0.20, -0.10, 0.20],
            "sevinçli": [0.90, 0.75, 0.30, -0.15, 0.10, -0.10, 0.00, 0.20],
            "mükemmel": [0.94, 0.65, 0.45, -0.05, 0.40, -0.10, 0.10, 0.25],
            "tebrikler": [0.88, 0.50, 0.80, 0.00, 0.60, -0.20, 0.00, 0.70],
            "başarılı": [0.85, 0.55, 0.40, -0.10, 0.50, -0.10, 0.10, 0.30],
            "üzgün": [-0.85, -0.50, 0.10, -0.30, 0.00, -0.10, -0.20, 0.00],
            "hüzünlü": [-0.80, -0.60, 0.20, -0.40, 0.10, -0.10, -0.30, 0.00],
            "kederli": [-0.88, -0.55, 0.10, -0.30, 0.20, -0.10, -0.20, 0.00],
            "öfkeli": [-0.90, 0.95, -0.80, 0.70, -0.40, -0.10, 0.60, -0.80],
            "sinirlendirdi": [-0.88, 0.90, -0.70, 0.60, -0.30, -0.10, 0.50, -0.70],
            "kızgın": [-0.85, 0.88, -0.65, 0.65, -0.35, -0.10, 0.55, -0.70],
            "lütfen": [0.40, 0.10, 0.98, -0.20, 0.85, 0.40, 0.10, 0.60],
            "rica": [0.45, 0.10, 0.95, -0.25, 0.80, 0.45, 0.05, 0.70],
            "mümkünse": [0.35, 0.05, 0.92, -0.30, 0.80, 0.50, 0.00, 0.40],
            "teşekkür": [0.85, 0.30, 0.95, -0.40, 0.75, -0.20, -0.10, 0.98],
            "kapat": [-0.10, 0.50, -0.50, 0.95, -0.20, -0.40, 0.70, -0.30],
            "gel": [0.00, 0.40, -0.30, 0.85, -0.30, -0.30, 0.60, -0.20],
            "hava": [0.05, 0.00, 0.10, 0.00, 0.20, 0.00, -0.10, 0.00],
            "bugün": [0.05, 0.10, 0.10, 0.00, 0.10, 0.10, 0.10, 0.00]
        }
        for word, base in semantic_anchors.items():
            expanded = []
            for i, val in enumerate(base):
                expanded.extend([val, val * 0.7 + 0.05 * (i % 3), val * 0.4 - 0.03 * (i % 2)])
            self.vectors[word] = expanded

    def get_vector(self, word: str) -> Optional[List[float]]:
        """Verilen Türkçe kelimenin vektörünü döndürür."""
        clean = TurkishPreprocessor.turkish_lower(word).strip()
        tokens = TurkishPreprocessor.normalize_and_clean_tokens([clean])
        if not tokens:
            return None
        w = tokens[0]

        if w in self.vectors:
            return self.vectors[w]

        stem = TurkishPreprocessor.extract_stem_heuristic(w)
        if stem in self.vectors:
            return self.vectors[stem]

        return None

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """İki kelime vektörü arasındaki kosinüs benzerliği: (A · B) / (||A|| ||B||)"""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        similarity = dot_product / (norm_a * norm_b)
        return max(-1.0, min(1.0, similarity))

    def word_similarity(self, word_a: str, word_b: str) -> float:
        """İki Türkçe kelime arasındaki kosinüs benzerlik skoru."""
        vec_a = self.get_vector(word_a)
        vec_b = self.get_vector(word_b)
        if vec_a is None or vec_b is None:
            return 0.0
        return round(self.cosine_similarity(vec_a, vec_b), 4)

    def find_most_similar(self, target_word: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """Hedef kelimeye en yakın semantik kelimeleri ve benzerlik oranlarını döndürür."""
        target_vec = self.get_vector(target_word)
        if target_vec is None:
            return []

        scored = []
        for word, vec in self.vectors.items():
            if word == target_word:
                continue
            sim = self.cosine_similarity(target_vec, vec)
            scored.append((word, round(sim, 4)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def get_info(self) -> Dict[str, Any]:
        """Model mimarisi ve eğitim parametreleri özeti."""
        return {
            "model_name": "trModel100",
            "model_type": "Gensim Word2Vec (Skip-gram)",
            "vector_dimension": self.VECTOR_DIM,
            "active_vocabulary_size": len(self.vectors),
            "source_corpus_vocab_size": self.source_vocab_size,
            "model_source": self.model_source,
            "similarity_metric": "Cosine Similarity: (u · v) / (||u|| ||v||)",
            "file_origin": "word2vecTRmodel100/trModel100 (Kullanıcı Tarafından Sağlanan Model)"
        }
