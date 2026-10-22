"""
tests/test_analysis.py
CümleDedektif NLP Sistemi Otomatik Test Paketi
Pytest ve Unittest uyumlu
"""

import unittest
from nlp.analyzer import TurkishSentenceDetector
from nlp.preprocessing import TurkishPreprocessor
from nlp.word2vec_model import TurkishWord2VecModel


class TestTurkishSentenceDetector(unittest.TestCase):
    """
    Şartnamedeki zorunlu 10 test senaryosu ve çoklu etiket kontrolleri.
    """

    @classmethod
    def setUpClass(cls):
        cls.detector = TurkishSentenceDetector()

    def test_direct_imperative(self):
        """'Kapıyı kapat.' -> Doğrudan emir, Buyurgan veya doğrudan yönlendirici"""
        res = self.detector.analyze_single_sentence("Kapıyı kapat.")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["imperative"]["label"], "Doğrudan emir")
        self.assertIn("Emir verme", res["intent"]["all_labels"])
        self.assertIn(res["politeness"]["label"], ["Buyurgan", "Nötr"])

    def test_polite_request(self):
        """'Lütfen kapıyı kapatır mısın?' -> Dolaylı emir / Rica, Çok nazik / Nazik"""
        res = self.detector.analyze_single_sentence("Lütfen kapıyı kapatır mısın?")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["imperative"]["label"], "Dolaylı emir")
        self.assertIn(res["politeness"]["label"], ["Çok nazik", "Nazik"])
        self.assertEqual(res["intent"]["primary"], "Rica etme")
        # Hem rica hem soru sorma niteliği barındırabilir
        self.assertIn("Rica etme", res["intent"]["all_labels"])

    def test_prohibition(self):
        """'Buraya gelme!' -> Yasaklama, Olumsuz yapı, Ünlem"""
        res = self.detector.analyze_single_sentence("Buraya gelme!")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["imperative"]["label"], "Yasaklama")
        self.assertEqual(res["structure"]["polarity"], "Olumsuz")
        self.assertIn("Yasaklama", res["intent"]["all_labels"])

    def test_polite_assistance_request(self):
        """'Bana yardımcı olabilir misiniz?' -> Nazik rica, Dolaylı emir, Soru yapısı"""
        res = self.detector.analyze_single_sentence("Bana yardımcı olabilir misiniz?")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["imperative"]["label"], "Dolaylı emir")
        self.assertIn(res["politeness"]["label"], ["Nazik", "Çok nazik"])
        self.assertEqual(res["intent"]["primary"], "Rica etme")
        self.assertEqual(res["structure"]["sentence_type"], "Soru")

    def test_positive_emotion(self):
        """'Bugün çok mutluyum.' -> Mutlu / olumlu duygu, Yüksek güven düzeyi"""
        res = self.detector.analyze_single_sentence("Bugün çok mutluyum.")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["emotion"]["label"], "Mutlu / olumlu")
        self.assertGreaterEqual(res["emotion"]["confidence"], 0.70)
        self.assertEqual(res["imperative"]["label"], "Emir niteliği taşımayan ifade")

    def test_anger_emotion(self):
        """'Bu durum beni çok sinirlendirdi.' -> Öfkeli duygu, Duygusal ifade amacı"""
        res = self.detector.analyze_single_sentence("Bu durum beni çok sinirlendirdi.")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["emotion"]["label"], "Öfkeli")
        self.assertGreaterEqual(res["emotion"]["confidence"], 0.70)
        self.assertIn("Duygusal ifade", res["intent"]["all_labels"])

    def test_question_intent(self):
        """'Yarın saat kaçta geleceksin?' -> Soru sorma amacı, Soru cümle tipi"""
        res = self.detector.analyze_single_sentence("Yarın saat kaçta geleceksin?")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["intent"]["primary"], "Soru sorma")
        self.assertEqual(res["structure"]["sentence_type"], "Soru")
        self.assertEqual(res["imperative"]["label"], "Emir niteliği taşımayan ifade")

    def test_gratitude_intent(self):
        """'Yardımın için teşekkür ederim.' -> Teşekkür etme, Nazik, Olumlu/Nötr"""
        res = self.detector.analyze_single_sentence("Yardımın için teşekkür ederim.")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["intent"]["primary"], "Teşekkür etme")
        self.assertIn(res["politeness"]["label"], ["Nazik", "Çok nazik"])

    def test_statement_neutral(self):
        """'Bugün hava güneşli.' -> Bildirme, Nötr duygu, Emir niteliği taşımayan"""
        res = self.detector.analyze_single_sentence("Bugün hava güneşli.")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["intent"]["primary"], "Bilgi verme")
        self.assertEqual(res["emotion"]["label"], "Nötr")
        self.assertEqual(res["imperative"]["label"], "Emir niteliği taşımayan ifade")

    def test_empty_string_handling(self):
        """Boş metin -> Kontrollü hata ve 400 durum kodu"""
        res = self.detector.analyze_single_sentence("")
        self.assertTrue(res.get("error", False))
        self.assertEqual(res.get("status_code"), 400)
        self.assertIn("boş olamaz", res.get("message", ""))

    def test_multi_label_consistency(self):
        """Tek bir cümlenin birden fazla niteliğe sahip olması (hem nazik hem rica)"""
        res = self.detector.analyze_single_sentence("Lütfen buraya gelir misiniz?")
        self.assertFalse(res.get("error", False))
        self.assertEqual(res["intent"]["primary"], "Rica etme")
        self.assertIn("Rica etme", res["intent"]["all_labels"])
        self.assertEqual(res["imperative"]["label"], "Dolaylı emir")
        self.assertIn(res["politeness"]["label"], ["Çok nazik", "Nazik"])

    def test_word2vec_similarity(self):
        """Word2Vec modelinde anlamsal kosinüs benzerliği testi"""
        w2v = TurkishWord2VecModel()
        # 'mutlu' ile 'sevinçli' benzerliği yüksek olmalı
        sim_pos = w2v.word_similarity("mutlu", "sevinçli")
        self.assertGreater(sim_pos, 0.40)
        # 'harika' ile 'mükemmel'
        sim_super = w2v.word_similarity("harika", "mükemmel")
        self.assertGreater(sim_super, 0.50)

    def test_corpus_repository_loading(self):
        """Korpus veri deposunun diskten yüklenmesi ve sorgulanması testi"""
        from nlp.corpus_repository import TurkishCorpusRepository
        repo = TurkishCorpusRepository()
        self.assertGreaterEqual(len(repo.records), 10)
        found = repo.search(query="kapat")
        self.assertGreaterEqual(len(found), 1)
        stats = repo.get_stats()
        self.assertIn("total_records", stats)
        self.assertIn("total_words", stats)


if __name__ == "__main__":
    unittest.main()
