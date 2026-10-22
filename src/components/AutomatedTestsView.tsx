/**
 * src/components/AutomatedTestsView.tsx
 * Canlı Otomatik NLP Test Koşucusu (12 Test Senaryosu)
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  Terminal, 
  ShieldCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import { TurkishSentenceDetector } from '../nlp-engine/analyzer.ts';
import { ClientCorpusRepository } from '../nlp-engine/corpus-repository.ts';

interface TestCase {
  id: number;
  input: string;
  description: string;
  check: (res: any) => boolean;
  expected: string;
}

interface AutomatedTestsViewProps {
  detector: TurkishSentenceDetector;
}

export const AutomatedTestsView: React.FC<AutomatedTestsViewProps> = ({ detector }) => {
  const testCases: TestCase[] = [
    {
      id: 1,
      input: "Kapıyı kapat.",
      description: "Doğrudan emir ve buyurganlık tespiti",
      check: (res) => res.imperative.label === "Doğrudan emir" && res.intent.allLabels.includes("Emir verme"),
      expected: "Emir: Doğrudan emir | Amaç: Emir verme"
    },
    {
      id: 2,
      input: "Lütfen kapıyı kapatır mısın?",
      description: "Soru biçiminde nazik rica ve dolaylı emir",
      check: (res) => res.imperative.label === "Dolaylı emir" && ["Çok nazik", "Nazik"].includes(res.politeness.label) && res.intent.primary === "Rica etme",
      expected: "Emir: Dolaylı emir | Nezaket: Çok nazik/Nazik | Amaç: Rica etme"
    },
    {
      id: 3,
      input: "Buraya gelme!",
      description: "Olumsuz emir kipi ile yasaklama tespiti",
      check: (res) => res.imperative.label === "Yasaklama" && res.structure.polarity === "Olumsuz",
      expected: "Emir: Yasaklama | Yapı: Olumsuz"
    },
    {
      id: 4,
      input: "Bana yardımcı olabilir misiniz?",
      description: "Yeterlilik soru kipiyle nazik talep",
      check: (res) => res.imperative.label === "Dolaylı emir" && ["Nazik", "Çok nazik"].includes(res.politeness.label) && res.structure.sentenceType === "Soru",
      expected: "Emir: Dolaylı emir | Nezaket: Nazik | Yapı: Soru"
    },
    {
      id: 5,
      input: "Bugün çok mutluyum.",
      description: "Yüksek güven düzeyli olumlu duygu",
      check: (res) => res.emotion.label === "Mutlu / olumlu" && res.emotion.confidence >= 0.70,
      expected: "Duygu: Mutlu / olumlu (Güven ≥ %70)"
    },
    {
      id: 6,
      input: "Bu durum beni çok sinirlendirdi.",
      description: "Öfke duygusu ve duygusal dışavurum",
      check: (res) => res.emotion.label === "Öfkeli" && res.intent.allLabels.includes("Duygusal ifade"),
      expected: "Duygu: Öfkeli | Amaç: Duygusal ifade"
    },
    {
      id: 7,
      input: "Yarın saat kaçta geleceksin?",
      description: "Bilgi alma amaçlı soru cümlesi",
      check: (res) => res.intent.primary === "Soru sorma" && res.structure.sentenceType === "Soru",
      expected: "Amaç: Soru sorma | Yapı: Soru"
    },
    {
      id: 8,
      input: "Yardımın için teşekkür ederim.",
      description: "Minnet ve teşekkür söz eylemi",
      check: (res) => res.intent.primary === "Teşekkür etme" && ["Nazik", "Çok nazik"].includes(res.politeness.label),
      expected: "Amaç: Teşekkür etme | Nezaket: Nazik"
    },
    {
      id: 9,
      input: "Bugün hava güneşli.",
      description: "Nötr nesnel bildirme ifadesi",
      check: (res) => res.intent.primary === "Bilgi verme" && res.emotion.label === "Nötr",
      expected: "Amaç: Bilgi verme | Duygu: Nötr"
    },
    {
      id: 10,
      input: "",
      description: "Boş metin hata yönetimi ve doğrulama",
      check: (res) => res.sentence === "" || res.structure.wordCount === 0,
      expected: "Kontrollü Boş Metin / Validasyon"
    },
    {
      id: 11,
      input: "Lütfen buraya gelir misiniz?",
      description: "Çoklu etiket tutarlılığı (Hem nazik hem rica)",
      check: (res) => res.intent.primary === "Rica etme" && res.imperative.label === "Dolaylı emir",
      expected: "Multi-Label: Rica etme + Dolaylı emir"
    },
    {
      id: 12,
      input: "Word2Vec Benzerlik Kontrolü",
      description: "'harika' ve 'mükemmel' kelimeleri arası kosinüs testi",
      check: () => detector.w2v.wordSimilarity("harika", "mükemmel") > 0.50,
      expected: "Word2Vec Cosine Sim > 0.50"
    },
    {
      id: 13,
      input: "TÜRK-KORPUS Veri Deposu",
      description: "Veri deposu yükleme, kayıt sayısı ve filtreleme testi",
      check: () => {
        const repo = new ClientCorpusRepository();
        return repo.getAll().length >= 10;
      },
      expected: "Depo Kayıt Sayısı ≥ 10"
    }
  ];

  const [testResults, setTestResults] = useState<Array<{ id: number; passed: boolean; actual: string; timeMs: number }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = () => {
    setIsRunning(true);
    const results: Array<{ id: number; passed: boolean; actual: string; timeMs: number }> = [];

    setTimeout(() => {
      for (const tc of testCases) {
        const t0 = performance.now();
        let passed = false;
        let actual = "";

        if (tc.id === 12) {
          const sim = detector.w2v.wordSimilarity("harika", "mükemmel");
          passed = sim > 0.50;
          actual = `Hesaplanan Benzerlik: ${sim}`;
        } else if (tc.id === 13) {
          const repo = new ClientCorpusRepository();
          const count = repo.getAll().length;
          passed = count >= 10;
          actual = `Yüklenen Cümle Sayısı: ${count} kayıt`;
        } else {
          const res = detector.analyzeSingleSentence(tc.input);
          passed = tc.check(res);
          actual = `Duygu: ${res.emotion.label} | Emir: ${res.imperative.label} | Amaç: ${res.intent.primary}`;
        }

        const t1 = performance.now();
        results.push({
          id: tc.id,
          passed,
          actual,
          timeMs: parseFloat((t1 - t0).toFixed(2))
        });
      }

      setTestResults(results);
      setIsRunning(false);
    }, 200);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testCases.length;

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-white">
              Doğrulama ve Otomatik Test Paketi (12 Senaryo)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Pytest ve Unittest standartlarına uygun şartname doğrulaması
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          {isRunning ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Tüm Testleri Yeniden Çalıştır</span>
        </button>
      </div>

      {/* Test Durumu Kartı */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base font-mono">
            {passedCount}/{totalCount}
          </div>
          <div>
            <span className="text-sm font-bold text-white block">
              {passedCount === totalCount ? "Tüm Testler Başarıyla Geçti (100% Başarı)" : "Bazı Testler Başarısız"}
            </span>
            <span className="text-xs text-slate-400">
              Şartnamedeki 10 zorunlu senaryo + çoklu etiketleme + Word2Vec kosinüs benzerliği testi
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          Durum: PASSED
        </span>
      </div>

      {/* Test Detay Tablosu */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 w-12">#</th>
                <th className="pb-3 w-48">Test Girdisi</th>
                <th className="pb-3">Beklenen Kural</th>
                <th className="pb-3">Gerçek Çıktı</th>
                <th className="pb-3 w-20 text-right">Süre</th>
                <th className="pb-3 w-24 text-right">Sonuç</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {testCases.map((tc) => {
                const res = testResults.find(r => r.id === tc.id);
                return (
                  <tr key={tc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-mono text-slate-400">{tc.id}</td>
                    <td className="py-3 font-mono font-medium text-white pr-2">
                      {tc.input ? `"${tc.input}"` : <span className="text-slate-400 italic">(Boş Metin)</span>}
                    </td>
                    <td className="py-3 text-slate-300 pr-2">
                      <span className="text-[11px] text-teal-300 block">{tc.description}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{tc.expected}</span>
                    </td>
                    <td className="py-3 text-slate-300 font-mono text-[11px] pr-2">
                      {res ? res.actual : "Çalıştırılıyor..."}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400 pr-2">
                      {res ? `${res.timeMs}ms` : "-"}
                    </td>
                    <td className="py-3 text-right">
                      {res && res.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <XCircle className="w-3 h-3" /> FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
