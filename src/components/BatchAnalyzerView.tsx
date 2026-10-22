/**
 * src/components/BatchAnalyzerView.tsx
 * Çoklu Metin ve Paragraf Analiz Modülü
 */

import React, { useState } from 'react';
import { 
  Layers, 
  Send, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TurkishSentenceDetector, SentenceAnalysisResult } from '../nlp-engine/analyzer.ts';

interface BatchAnalyzerViewProps {
  detector: TurkishSentenceDetector;
}

export const BatchAnalyzerView: React.FC<BatchAnalyzerViewProps> = ({ detector }) => {
  const defaultBatchText = 
`Bugün hava gerçekten harika ve güneşli.
Lütfen kapıyı kapatır mısın?
Önce dosyayı aç, sonra sisteme kaydet.
Buraya kesinlikle gelme!
Bana yardım ettiğiniz için çok teşekkür ederim.`;

  const [text, setText] = useState(defaultBatchText);
  const [results, setResults] = useState<SentenceAnalysisResult[]>(() => {
    return detector.analyzeBatch(defaultBatchText).results;
  });
  const [copied, setCopied] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(0);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    const batch = detector.analyzeBatch(text);
    setResults(batch.results);
    setActiveSentenceIndex(0);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toplu-cumle-analizi-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // İstatistikler
  const totalSentences = results.length;
  const avgPoliteness = totalSentences > 0 
    ? (results.reduce((acc, r) => acc + r.politeness.score, 0) / totalSentences).toFixed(2)
    : '0';

  const emotionCounts: Record<string, number> = {};
  const intentCounts: Record<string, number> = {};
  results.forEach(r => {
    emotionCounts[r.emotion.label] = (emotionCounts[r.emotion.label] || 0) + 1;
    intentCounts[r.intent.primary] = (intentCounts[r.intent.primary] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-white">Çoklu Metin / Paragraf Girişi</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {text.split('\n').filter(Boolean).length} satır
          </span>
        </div>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Her satıra bir cümle yazın veya bir paragraf yapıştırın..."
          className="w-full bg-[#080D1A] border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-sm resize-none font-mono"
        />

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setText('')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Metni Temizle
          </button>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Tüm Cümleleri Ayrıştır ve Analiz Et</span>
          </button>
        </div>
      </div>

      {/* Toplu Özet Metrikleri */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 block">Toplam Cümle</span>
            <strong className="text-xl font-bold text-white font-mono">{totalSentences}</strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 block">Ortalama Nezaket</span>
            <strong className="text-xl font-bold text-teal-400 font-mono">
              {Number(avgPoliteness) > 0 ? `+${avgPoliteness}` : avgPoliteness}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 block">Baskın Duygu</span>
            <strong className="text-sm font-bold text-purple-300 block truncate mt-1">
              {Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Nötr'}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 block">Baskın Amaç</span>
            <strong className="text-sm font-bold text-blue-300 block truncate mt-1">
              {Object.entries(intentCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Bilgi verme'}
            </strong>
          </div>
        </div>
      )}

      {/* Cümle Listesi ve Detay */}
      {results.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h4 className="text-sm font-bold text-white">Ayrıştırılan Cümleler</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={copyJson}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>JSON Kopyala</span>
              </button>
              <button
                onClick={downloadJson}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON İndir</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((res, index) => {
              const isSelected = activeSentenceIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/80 border-purple-500/50 shadow-md'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div
                    onClick={() => setActiveSentenceIndex(isSelected ? null : index)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-white truncate">
                        "{res.sentence}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                        {res.intent.primary}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                        {res.politeness.label}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {isSelected && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-700/60 text-xs space-y-3">
                      <div className="p-3 rounded-lg bg-[#080D1A] border border-slate-800 space-y-1">
                        <strong className="text-teal-400 block font-semibold">Özet ve Yorum:</strong>
                        <p className="text-slate-300">{res.overallSummary}</p>
                        <p className="text-slate-400 mt-1">{res.synthesisExplanation}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Duygu</span>
                          <span className="font-semibold text-white">{res.emotion.label}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Emir Niteliği</span>
                          <span className="font-semibold text-amber-300">{res.imperative.label}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Nezaket Skoru</span>
                          <span className="font-semibold text-teal-300 font-mono">{res.politeness.score}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Cümle Yapısı</span>
                          <span className="font-semibold text-slate-200">{res.structure.sentenceType}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
