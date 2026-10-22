"""
nlp/corpus_repository.py
Türkçe Korpus Veri Deposu Yöneticisi
Dosya tabanlı (JSON) gerçek korpus yönetimi, filtreleme, arama ve veri çekme motoru.
"""

import os
import json
from typing import List, Dict, Any, Optional


class TurkishCorpusRepository:
    """
    TÜRK-KORPUS veri tabanını diskten okuyan, sorgulayan, yeni kayıt ekleyen
    ve dilbilimsel filtreleme sunan gerçek depo yöneticisi.
    """

    DEFAULT_FILEPATH = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "corpus_repository.json"
    )

    def __init__(self, filepath: Optional[str] = None):
        self.filepath = filepath or self.DEFAULT_FILEPATH
        self.data: Dict[str, Any] = {}
        self.records: List[Dict[str, Any]] = []
        self.load()

    def load(self) -> bool:
        """JSON korpus dosyasını diskten yükler."""
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
                    self.records = self.data.get("records", [])
                    return True
            except Exception as e:
                print(f"[CorpusRepository] Hata: {e}")
        self.records = []
        return False

    def save(self) -> bool:
        """Mevcut kayıtları korpus dosyasına kaydeder."""
        try:
            self.data["records"] = self.records
            self.data["metadata"]["total_records"] = len(self.records)
            os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"[CorpusRepository] Kayıt hatası: {e}")
            return False

    def get_all(self) -> List[Dict[str, Any]]:
        """Tüm korpus kayıtlarını döndürür."""
        return self.records

    def get_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        """Belirli ID'ye sahip kaydı getirir."""
        for r in self.records:
            if r.get("id") == record_id:
                return r
        return None

    def search(
        self,
        query: str = "",
        domain: Optional[str] = None,
        intent: Optional[str] = None,
        politeness: Optional[str] = None,
        difficulty: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Filtreli arama gerçekleştirir."""
        results = []
        q_lower = query.lower().strip() if query else ""

        for r in self.records:
            if q_lower:
                text_match = q_lower in r.get("text", "").lower()
                note_match = q_lower in r.get("notes", "").lower()
                if not (text_match or note_match):
                    continue

            if domain and domain != "Tümü" and r.get("domain") != domain:
                continue

            if intent and intent != "Tümü" and r.get("target_intent") != intent:
                continue

            if politeness and politeness != "Tümü" and r.get("politeness_level") != politeness:
                continue

            if difficulty and difficulty != "Tümü" and r.get("difficulty") != difficulty:
                continue

            results.append(r)

        return results

    def add_record(
        self,
        text: str,
        domain: str = "Günlük Yaşam & Sosyal",
        target_intent: str = "Bilgi verme",
        politeness_level: str = "Nötr",
        notes: str = "",
        difficulty: str = "Orta",
    ) -> Dict[str, Any]:
        """Depoya yeni doğrulanmış korpus cümlesi ekler."""
        new_id = f"CORP-TR-{len(self.records) + 1:03d}"
        new_record = {
            "id": new_id,
            "text": text.strip(),
            "domain": domain,
            "target_intent": target_intent,
            "speech_act": f"Kullanıcı Tanımlı ({target_intent})",
            "target_emotion": "Nötr",
            "politeness_level": politeness_level,
            "imperative_status": "Analiz Edilecek",
            "polarity": "Olumlu",
            "notes": notes.strip() or "Araştırmacı tarafından veri deposuna eklendi.",
            "difficulty": difficulty,
        }
        self.records.append(new_record)
        self.save()
        return new_record

    def get_stats(self) -> Dict[str, Any]:
        """Korpus veri deposu özet istatistiklerini hesaplar."""
        domains: Dict[str, int] = {}
        intents: Dict[str, int] = {}
        politeness_dist: Dict[str, int] = {}
        total_words = 0

        for r in self.records:
            d = r.get("domain", "Diğer")
            domains[d] = domains.get(d, 0) + 1

            i = r.get("target_intent", "Diğer")
            intents[i] = intents.get(i, 0) + 1

            p = r.get("politeness_level", "Diğer")
            politeness_dist[p] = politeness_dist.get(p, 0) + 1

            total_words += len(r.get("text", "").split())

        return {
            "total_records": len(self.records),
            "total_words": total_words,
            "average_length": round(total_words / max(1, len(self.records)), 1),
            "domain_breakdown": domains,
            "intent_breakdown": intents,
            "politeness_breakdown": politeness_dist,
            "version": self.data.get("version", "2.1.0"),
            "name": self.data.get("name", "TÜRK-KORPUS"),
        }
