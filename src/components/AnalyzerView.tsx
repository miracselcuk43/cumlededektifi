/**
 * src/components/AnalyzerView.tsx
 * Türkçe Cümle ve İletişim Amacı Çözümleyici
 * Akademik ve temiz dilbilim laboratuvarı arayüzü
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  RotateCcw, 
  Play, 
  Smile, 
  ShieldAlert, 
  HeartHandshake, 
  Target, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check, 
  Info, 
  Database, 
  Shuffle, 
  Binary, 
  Layers, 
  ChevronRight, 
  BookOpen,
  Plus
} from 'lucide-react';
import { TurkishSentenceDetector, SentenceAnalysisResult } from '../nlp-engine/analyzer.ts';
import { ClientCorpusRepository, CorpusRecord } from '../nlp-engine/corpus-repository.ts';

interface AnalyzerViewProps {
  detector: TurkishSentenceDetector;
  initialSentence?: string | null;
  corpusRepo?: ClientCorpusRepository;
  onNavigateToCorpus?: () => void;
}

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({ 
  detector, 
  initialSentence,
  corpusRepo = new ClientCorpusRepository(),
  onNavigateToCorpus
}) => {
  const [inputText, setInputText] = useState(initialSentence || "Lütfen kapıyı kapatır mısın?");
  const [activeCorpusMeta, setActiveCorpusMeta] = useState<CorpusRecord | null>(null);
  const [nearestMatch, setNearestMatch] = useState<{ record: CorpusRecord; score: number } | null>(null);
  const [saveToCorpusFeedback, setSaveToCorpusFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<SentenceAnalysisResult | null>(() => {
    return detector.analyzeSingleSentence(initialSentence || "Lütfen kapıyı kapatır mısın?");
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedWordInfo, setSelectedWordInfo] = useState<string | null>(null);
  const [showCorpusDrawer, setShowCorpusDrawer] = useState(false);

  useEffect(() => {
    const textToAnalyze = initialSentence || "Lütfen kapıyı kapatır mısın?";
    setInputText(textToAnalyze);
    setResult(detector.analyzeSingleSentence(textToAnalyze));
    // Depoda bu cümle var mı kontrol et
    const all = corpusRepo.getAll();
    const found = all.find(r => r.text.trim().toLowerCase() === textToAnalyze.trim().toLowerCase());
    setActiveCorpusMeta(found || null);
    if (!found) {
      setNearestMatch(corpusRepo.findNearestSentence(textToAnalyze));
    } else {
      setNearestMatch(null);
    }
  }, [initialSentence, detector, corpusRepo]);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setSelectedWordInfo(null);
    setSaveToCorpusFeedback(null);
    setTimeout(() => {
      const res = detector.analyzeSingleSentence(inputText);
      setResult(res);
      // Depodaki kaydı eşle
      const all = corpusRepo.getAll();
      const found = all.find(r => r.text.trim().toLowerCase() === inputText.trim().toLowerCase());
      setActiveCorpusMeta(found || null);
      if (!found) {
        setNearestMatch(corpusRepo.findNearestSentence(inputText));
      } else {
        setNearestMatch(null);
      }
      setIsLoading(false);
    }, 80);
  };

  const handleSaveToCorpus = () => {
    if (!inputText.trim() || !result) return;
    const all = corpusRepo.getAll();
    const existing = all.find(r => r.text.trim().toLowerCase() === inputText.trim().toLowerCase());
    if (existing) {
      setSaveToCorpusFeedback(`Bu cümle zaten depoda mevcut: ${existing.id}`);
      setTimeout(() => setSaveToCorpusFeedback(null), 3000);
      return;
    }

    const newRec = corpusRepo.add({
      text: inputText.trim(),
      domain: "Kullanıcı Girişi / Özel Korpus",
      target_intent: result.intent.primary,
      politeness_level: result.politeness.label,
      notes: `Kullanıcı tarafından incelendi. İletişim: ${result.intent.primary}, Nezaket: ${result.politeness.label}, Emir: ${result.imperative.label}`,
      difficulty: "Kullanıcı Cümlesi"
    });

    setActiveCorpusMeta(newRec);
    setNearestMatch(null);
    setSaveToCorpusFeedback(`Cümle TÜRK-KORPUS deposuna eklendi (Kayıt ID: ${newRec.id})`);
    setTimeout(() => setSaveToCorpusFeedback(null), 4000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleSelectFromCorpus = (record: CorpusRecord) => {
    setInputText(record.text);
    setActiveCorpusMeta(record);
    setNearestMatch(null);
    setShowCorpusDrawer(false);
    const res = detector.analyzeSingleSentence(record.text);
    setResult(res);
  };

  const handleRandomFromCorpus = () => {
    const all = corpusRepo.getAll();
    if (all.length === 0) return;
    const randomRec = all[Math.floor(Math.random() * all.length)];
    handleSelectFromCorpus(randomRec);
  };

  const copyAsJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cumle-analizi-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyTextReport = () => {
    if (!result) return;
    const report = `
CÜMLEDEDEKTİF TÜRKÇE NLP ÇÖZÜMLEME RAPORU
=========================================
İncelenen Cümle: "${result.sentence}"
Genel İletişimsel Yorum: ${result.overallSummary}
Dilsel Gerekçe: ${result.synthesisExplanation}

1. DUYGU VE KUTUPSALLIK
- Tahmin: ${result.emotion.label} (Güven Skoru: %${Math.round(result.emotion.confidence * 100)})
- Analiz: ${result.emotion.explanation}

2. EMİR VE YÖNLENDİRME KİPİ
- Sınıf: ${result.imperative.label}
- Alt Tip: ${result.imperative.subType}
- Gerekçe: ${result.imperative.explanation}

3. NEZAKET VE RESMİYET DERECESİ
- Derece: ${result.politeness.label}
- Sürekli Skor: ${result.politeness.score > 0 ? '+' : ''}${result.politeness.score} (Ölçek: -1.0 ile +1.0)
- Gerekçe: ${result.politeness.explanation}

4. EDİMBİLİMSEL İLETİŞİM AMACI (SPEECH ACT)
- Birincil Amaç: ${result.intent.primary} (%${Math.round(result.intent.primaryConfidence * 100)})
${result.intent.secondary ? `- İkincil Amaç: ${result.intent.secondary} (%${Math.round((result.intent.secondaryConfidence || 0) * 100)})` : ''}
- İlgili Tüm İşlevler: ${result.intent.allLabels.join(', ')}

5. MORFOSENTAKTİK CÜMLE YAPISI
- Yapı Türü: ${result.structure.sentenceType}
- Kutup: ${result.structure.polarity}
- Noktalama: ${result.structure.punctuationSummary.join(', ')}
- Kelime / Karakter: ${result.structure.wordCount} kelime, ${result.structure.characterCount} karakter
`.trim();
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Nezaket rozet rengi (sakin, profesyonel)
  const getPolitenessBadge = (label: string) => {
    switch (label) {
      case 'Çok nazik': return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      case 'Nazik': return 'bg-teal-950/60 text-teal-300 border-teal-800';
      case 'Nötr': return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Buyurgan': return 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'Kaba / saldırgan': return 'bg-rose-950/60 text-rose-300 border-rose-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Emir rozet rengi
  const getImperativeBadge = (label: string) => {
    switch (label) {
      case 'Doğrudan emir': return 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'Yasaklama': return 'bg-rose-950/60 text-rose-300 border-rose-800';
      case 'Talimat': return 'bg-blue-950/60 text-blue-300 border-blue-800';
      case 'Dolaylı emir': return 'bg-teal-950/60 text-teal-300 border-teal-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Duygu rozet rengi
  const getEmotionBadge = (label: string) => {
    switch (label) {
      case 'Mutlu / olumlu': return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      case 'Üzgün': return 'bg-indigo-950/60 text-indigo-300 border-indigo-800';
      case 'Öfkeli': return 'bg-rose-950/60 text-rose-300 border-rose-800';
      case 'Korkmuş / endişeli': return 'bg-purple-950/60 text-purple-300 border-purple-800';
      case 'Şaşkın': return 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'Alaycı veya ironi olasılığı': return 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cümle Giriş ve Depodan Çekme Kartı */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-slate-800 border border-slate-700 text-teal-400">
              <FileText className="w-4 h-4" />
            </span>
            <label htmlFor="sentence-input" className="text-sm font-semibold text-white">
              Çözümlenecek Türkçe Cümle
            </label>
          </div>

          {/* Depodan Çekme Hızlı Butonları */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowCorpusDrawer(!showCorpusDrawer)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span>Depodan Cümle Seç</span>
            </button>

            <button
              onClick={handleRandomFromCorpus}
              title="Korpus Deposundan Rastgele Cümle Çek"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Rastgele Çek</span>
            </button>

            <button
              onClick={handleSaveToCorpus}
              title="Bu Cümleyi TÜRK-KORPUS Deposuna Kaydet"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900 text-teal-300 border border-teal-800/80 text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-teal-400" />
              <span>Depoya Kaydet</span>
            </button>
          </div>
        </div>

        {/* Depoya Kaydedildi Geri Bildirimi */}
        {saveToCorpusFeedback && (
          <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-teal-950 border border-teal-700 text-teal-200 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>{saveToCorpusFeedback}</span>
          </div>
        )}

        {/* Depodan Yüklendiyse Doğrulanmış Kayıt Bandı */}
        {activeCorpusMeta && (
          <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-teal-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                {activeCorpusMeta.id}
              </span>
              <span className="text-slate-400">
                Alan: <strong className="text-slate-200">{activeCorpusMeta.domain}</strong>
              </span>
              <span className="hidden md:inline text-slate-500">•</span>
              <span className="hidden md:inline text-slate-400">
                Söz Eylemi: <strong className="text-slate-300">{activeCorpusMeta.speech_act}</strong>
              </span>
            </div>
            <span className="text-[11px] text-teal-400 font-mono font-medium">
              ✓ Doğrulanmış Depo Referansı
            </span>
          </div>
        )}

        {/* Depoda Birebir Yoksa En Yakın Korpus Kaydı Önerisi */}
        {!activeCorpusMeta && nearestMatch && (
          <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                Depodaki En Yakın Örnek (%{Math.round(nearestMatch.score * 100)})
              </span>
              <span className="text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                "{nearestMatch.record.text}"
              </span>
            </div>
            <button
              onClick={() => handleSelectFromCorpus(nearestMatch.record)}
              className="text-teal-400 hover:text-teal-300 text-[11px] font-semibold underline cursor-pointer"
            >
              Depodan Bu Cümleyi Çek
            </button>
          </div>
        )}

        {/* Metin Giriş Alanı */}
        <div className="relative">
          <textarea
            id="sentence-input"
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir Türkçe cümle girin (örnek: 'Lütfen kapıyı kapatır mısın?')..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 text-sm resize-none font-sans leading-relaxed shadow-inner"
          />

          {inputText && (
            <button
              onClick={() => {
                setInputText('');
                setActiveCorpusMeta(null);
              }}
              className="absolute right-3 top-3 p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Temizle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Depo Açılır Çekmecesi (Drawer) */}
        {showCorpusDrawer && (
          <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-300">
                TÜRK-KORPUS Veri Deposundan Hızlı Seçim:
              </span>
              <button
                onClick={() => setShowCorpusDrawer(false)}
                className="hover:text-white"
              >
                Kapat
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {corpusRepo.getAll().map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => handleSelectFromCorpus(rec)}
                  className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800/80 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-teal-400 shrink-0">
                      {rec.id}
                    </span>
                    <span className="text-slate-200 truncate font-medium">
                      "{rec.text}"
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {rec.target_intent}
                    </span>
                    <span className="text-teal-400 font-semibold flex items-center">
                      Çek <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alt Butonlar ve Sayaçlar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="text-slate-400 font-mono">
            <span>{inputText.length} karakter</span>
            <span className="mx-2">•</span>
            <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} kelime</span>
            <span className="mx-2 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Enter ile analiz et</span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!inputText.trim() || isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Çözümleniyor...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Cümleyi Çözümle</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Analiz Çıktı Raporu */}
      {result && (
        <div className="space-y-6">
          {/* Çözümleme ve Dilbilimsel Yorum Özeti */}
          <div className="rounded-xl p-5 bg-slate-900 border border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-slate-800 text-teal-400 border border-slate-700">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Sentaktik & Edimbilimsel Analiz Raporu
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Çözümleme: <strong className="text-teal-400">{result.metadata.executionTimeMs} ms</strong>
                </span>
                <button
                  onClick={copyAsJson}
                  title="JSON Kopyala"
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={downloadJson}
                  title="JSON İndir"
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={copyTextReport}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                >
                  Rapor Kopyala
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Genel İletişimsel Yorum:
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                "{result.overallSummary}"
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                <strong className="text-teal-400">Dilsel Gerekçe:</strong> {result.synthesisExplanation}
              </p>
            </div>
          </div>

          {/* Cümle Anatomisi (Kelimelere Tıklayarak İnceleme) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-300">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Cümle Morfoloji Anatomisi (Sözcük Ayrıştırma)</span>
              </div>
              <span className="text-slate-400">
                {result.linguisticClues.length} dilbilimsel kanıt bulundu
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap gap-2 items-center">
              {result.sentence.split(/\s+/).map((word, idx) => {
                const clean = word.toLowerCase().replace(/[^a-zçğıöşü]/g, '');
                const matchingClue = result.linguisticClues.find(c => 
                  c.target.toLowerCase().includes(clean) || clean.includes(c.target.toLowerCase())
                );

                let badgeClass = "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600";
                if (matchingClue) {
                  if (matchingClue.type === 'politeness') {
                    badgeClass = "bg-teal-950/70 text-teal-300 border-teal-800 font-medium";
                  } else if (matchingClue.type === 'imperative') {
                    badgeClass = "bg-amber-950/70 text-amber-300 border-amber-800 font-medium";
                  } else if (matchingClue.type === 'emotion') {
                    badgeClass = "bg-purple-950/70 text-purple-300 border-purple-800 font-medium";
                  } else if (matchingClue.type === 'intent') {
                    badgeClass = "bg-blue-950/70 text-blue-300 border-blue-800 font-medium";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (matchingClue) {
                        setSelectedWordInfo(`[${matchingClue.category}] "${matchingClue.target}": ${matchingClue.detail || matchingClue.role}`);
                      } else {
                        setSelectedWordInfo(`"${word}" sözcüğü cümlede nötr bağlamsal ya da dolgu ögesi olarak yer almaktadır.`);
                      }
                    }}
                    className={`px-3 py-1 rounded border text-xs transition-colors cursor-pointer ${badgeClass}`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {selectedWordInfo && (
              <div className="mt-2.5 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-start gap-2 animate-fadeIn">
                <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{selectedWordInfo}</span>
              </div>
            )}
          </div>

          {/* 4 Ana Analiz Kartı (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Duygu Analizi */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">Duygu Kutupluluğu</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getEmotionBadge(result.emotion.label)}`}>
                  {result.emotion.label}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Eşleşme Güven Oranı:</span>
                  <span className="font-mono font-bold text-slate-200">
                    %{Math.round(result.emotion.confidence * 100)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${result.emotion.confidence * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {result.emotion.explanation}
                </p>

                {/* Profil Dağılımı */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Sözlük ve Ağırlık Profili
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                    {Object.entries(result.emotion.distribution).map(([key, val]) => (
                      <div key={key} className="p-1 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">{key}</span>
                        <span className="text-teal-400 font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Emir ve Yönlendirme */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">Emir & Kip Durumu</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getImperativeBadge(result.imperative.label)}`}>
                  {result.imperative.label}
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Morfolojik Alt Sınıf:</span>
                  <strong className="text-xs text-amber-300 block mt-0.5">{result.imperative.subType}</strong>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.imperative.explanation}
                </p>

                <div className="pt-1 text-xs text-slate-400 flex justify-between">
                  <span>Kip Güven Skoru:</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    %{Math.round(result.imperative.confidence * 100)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Nezaket ve Sosyal Mesafe */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-bold text-white">Nezaket Düzeyi</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getPolitenessBadge(result.politeness.label)}`}>
                  {result.politeness.label}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Nezaket Skoru (-1.0 ile +1.0):</span>
                  <span className="font-mono font-bold text-teal-400">
                    {result.politeness.score > 0 ? `+${result.politeness.score}` : result.politeness.score}
                  </span>
                </div>

                {/* Sürekli Ölçek */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="w-1/4 h-full bg-rose-600/50" title="Kaba" />
                  <div className="w-1/4 h-full bg-amber-600/50" title="Buyurgan" />
                  <div className="w-1/4 h-full bg-slate-600/50" title="Nötr" />
                  <div className="w-1/4 h-full bg-teal-600/60" title="Nazik" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>-1.0 (Kaba)</span>
                  <span>0.0 (Nötr)</span>
                  <span>+1.0 (Çok Nazik)</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {result.politeness.explanation}
                </p>
              </div>
            </div>

            {/* 4. İletişim Amacı (Pragmatics) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-white">Söz Eylemi & Amaç</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800">
                  {result.intent.primary}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Birincil Amaç</span>
                    <span className="font-bold text-white text-xs">{result.intent.primary}</span>
                  </div>
                  <span className="font-mono text-teal-400 font-bold">
                    %{Math.round(result.intent.primaryConfidence * 100)}
                  </span>
                </div>

                {result.intent.secondary && (
                  <div className="flex justify-between text-slate-300 p-2 rounded bg-slate-950 border border-slate-800">
                    <span>İkincil Fonksiyon: <strong>{result.intent.secondary}</strong></span>
                    <span className="font-mono text-slate-400">%{Math.round((result.intent.secondaryConfidence || 0) * 100)}</span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Çoklu Fonksiyon Etiketleri (Multi-Label):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.intent.allLabels.map((lbl, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Morfosentaktik Cümle Özellikleri Tablosu */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-white">Morfosentaktik ve Yapısal Özellikler</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Cümle Türü</span>
                <strong className="text-white text-xs block mt-0.5">{result.structure.sentenceType}</strong>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Kutup (Polarity)</span>
                <strong className={`text-xs block mt-0.5 ${result.structure.polarity === 'Olumsuz' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.structure.polarity}
                </strong>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Zamirler</span>
                <span className="text-slate-200 text-xs block mt-0.5">
                  {result.structure.pronouns.length > 0 
                    ? result.structure.pronouns.map(p => p.word).join(', ') 
                    : 'Açık zamir yok'}
                </span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Noktalama</span>
                <span className="text-slate-200 text-xs block mt-0.5 truncate">
                  {result.structure.punctuationSummary.join(', ')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              <strong className="text-slate-300">Morfoloji Notu:</strong> {result.structure.morphologyNote}
            </p>
          </div>

          {/* Dilsel Kanıtlar Tablosu */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold text-white mb-1">
              Dilbilimsel Kanıt ve Çıkarım Tablosu
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Kural tabanlı ve sözlük tabanlı algoritmaların karara varırken temel aldığı dilsel kanıtlar
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="pb-2">Kategori</th>
                    <th className="pb-2">Hedef İfade</th>
                    <th className="pb-2">Dilbilimsel Rol</th>
                    <th className="pb-2">Ayrıntılı Gerekçe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {result.linguisticClues.map((clue, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 pr-2 font-medium text-slate-300">{clue.category}</td>
                      <td className="py-2.5 pr-2 font-mono text-teal-300 font-bold">"{clue.target}"</td>
                      <td className="py-2.5 pr-2 text-slate-200">{clue.role}</td>
                      <td className="py-2.5 text-slate-400">{clue.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Belirsizlikler ve Word2Vec */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Belirsizlik & Bağlam Sınırlamaları</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.uncertainties.map((u, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Binary className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Word2Vec Vektör Eşleşmeleri</h4>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">24-D Skip-gram</span>
              </div>

              {result.word2vecSemanticVectors.length > 0 ? (
                <div className="space-y-2">
                  {result.word2vecSemanticVectors.map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-white">"{item.word}"</span>
                        <span className="text-[10px] text-teal-400 font-mono">Vektör Mevcut</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.similarWords.map((sim, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono">
                            {sim.word}: {sim.similarity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-3">
                  Cümledeki kelimelerin gömme vektörleri Word2Vec uzayında hesaplanmaktadır.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
