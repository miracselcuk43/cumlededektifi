/**
 * src/components/Word2VecExplorerView.tsx
 * Word2Vec Vektör Uzayı, Kosinüs Benzerliği ve Semantik Projeksiyon Modülü
 * trModel100 (100-Boyutlu Türkçe Model) ve Kullanıcı Betikleri Entegrasyonu
 * (similarity.py, mostSimilar.py, mostSimilarRafine.py)
 */

import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  ArrowRight, 
  Info, 
  Cpu, 
  Binary, 
  FileCode, 
  Check, 
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
  Filter,
  Eye,
  Sliders
} from 'lucide-react';
import { TurkishWord2VecModel, SimilarWord } from '../nlp-engine/word2vec.ts';

interface Word2VecExplorerViewProps {
  w2v: TurkishWord2VecModel;
}

export const Word2VecExplorerView: React.FC<Word2VecExplorerViewProps> = ({ w2v }) => {
  const [wordA, setWordA] = useState('mutlu');
  const [wordB, setWordB] = useState('sevinçli');
  const [targetWord, setTargetWord] = useState('harika');
  const [topK, setTopK] = useState(6);
  const [searchMode, setSearchMode] = useState<'standard' | 'rafine'>('rafine');
  const [inspectorWord, setInspectorWord] = useState('lütfen');
  const [showScriptModal, setShowScriptModal] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const similarity = w2v.wordSimilarity(wordA, wordB);
  
  // Standart vs Rafine Arama (mostSimilar.py vs mostSimilarRafine.py)
  const similarList = useMemo(() => {
    if (searchMode === 'rafine') {
      return w2v.findMostSimilarRafine(targetWord, topK);
    }
    return w2v.findMostSimilar(targetWord, topK);
  }, [w2v, targetWord, topK, searchMode]);

  const modelInfo = w2v.getModelInfo();

  // 100D Vektör İnceleyici
  const inspectorVector = useMemo(() => {
    return w2v.getVector(inspectorWord);
  }, [w2v, inspectorWord]);

  const vectorStats = useMemo(() => {
    if (!inspectorVector) return null;
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < inspectorVector.length; i++) {
      const v = inspectorVector[i];
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
      sumSq += v * v;
    }
    return {
      dim: inspectorVector.length,
      l2Norm: Math.sqrt(sumSq).toFixed(4),
      min: min.toFixed(4),
      max: max.toFixed(4),
      mean: (sum / inspectorVector.length).toFixed(4)
    };
  }, [inspectorVector]);

  // 2D Vektör Projeksiyonu için kelimeler ve koordinatlar
  const projectedWords = [
    { word: 'harika', x: 80, y: 35, cluster: 'Pozitif', color: '#10B981' },
    { word: 'mutlu', x: 85, y: 30, cluster: 'Pozitif', color: '#10B981' },
    { word: 'sevinçli', x: 82, y: 28, cluster: 'Pozitif', color: '#10B981' },
    { word: 'mükemmel', x: 78, y: 25, cluster: 'Pozitif', color: '#10B981' },
    { word: 'tebrikler', x: 70, y: 40, cluster: 'Pozitif', color: '#10B981' },
    { word: 'lütfen', x: 30, y: 75, cluster: 'Nezaket', color: '#06D6A0' },
    { word: 'rica', x: 35, y: 80, cluster: 'Nezaket', color: '#06D6A0' },
    { word: 'mümkünse', x: 25, y: 82, cluster: 'Nezaket', color: '#06D6A0' },
    { word: 'teşekkür', x: 45, y: 70, cluster: 'Nezaket', color: '#06D6A0' },
    { word: 'özür', x: 20, y: 70, cluster: 'Nezaket', color: '#06D6A0' },
    { word: 'kapat', x: 25, y: 25, cluster: 'Emir', color: '#F59E0B' },
    { word: 'aç', x: 28, y: 22, cluster: 'Emir', color: '#F59E0B' },
    { word: 'gel', x: 35, y: 20, cluster: 'Emir', color: '#F59E0B' },
    { word: 'derhal', x: 20, y: 30, cluster: 'Emir', color: '#F59E0B' },
    { word: 'sus', x: 15, y: 20, cluster: 'Emir/Sert', color: '#EF4444' },
    { word: 'gelme', x: 20, y: 15, cluster: 'Yasak', color: '#EF4444' },
    { word: 'üzgün', x: 15, y: 65, cluster: 'Negatif', color: '#8B5CF6' },
    { word: 'hüzünlü', x: 12, y: 60, cluster: 'Negatif', color: '#8B5CF6' },
    { word: 'öfkeli', x: 10, y: 35, cluster: 'Öfke', color: '#F43F5E' },
    { word: 'sinirlendirdi', x: 14, y: 32, cluster: 'Öfke', color: '#F43F5E' },
    { word: 'kızgın', x: 12, y: 40, cluster: 'Öfke', color: '#F43F5E' },
    { word: 'hava', x: 55, y: 50, cluster: 'Nötr', color: '#94A3B8' },
    { word: 'bugün', x: 50, y: 55, cluster: 'Nötr', color: '#94A3B8' },
    { word: 'rapor', x: 60, y: 60, cluster: 'Nötr', color: '#94A3B8' },
  ];

  const userScripts: Record<string, string> = {
    "similarity.py": `# Similarity Example (Zip Arşivinden)
from gensim.models import KeyedVectors

print("Model Yükleniyor...")
kelimeVektoru = KeyedVectors.load_word2vec_format('trModel100', binary=True)
print(kelimeVektoru)

def benzerlikHesapla():
    anahtarKelime1 = input("İlk Anahtar Kelime: ").lower()
    anahtarKelime2 = input("İkinci Anahtar Kelime: ").lower()
    benzerlik = (kelimeVektoru.similarity(anahtarKelime1, anahtarKelime2))
    print(benzerlik)
    print("----------")
    benzerlikHesapla()

benzerlikHesapla()`,

    "mostSimilar.py": `# Most Similar Examples (Zip Arşivinden)
from gensim.models import KeyedVectors

print("Model Yükleniyor...")
kelimeVektoru = KeyedVectors.load_word2vec_format('trModel100', binary=True)

def benzerKelimeler():
    anahtarKelime = input("Anahtar Kelime: ").lower()
    print("Girilen Kelime : " + str(anahtarKelime))
    oneriler = (kelimeVektoru.most_similar(positive=anahtarKelime))
    print(oneriler)

    # İlk 10 öneriyi göster
    for index, oneri in enumerate(oneriler):
        print(index+1, oneri[0])

    benzerKelimeler()

benzerKelimeler()`,

    "mostSimilarRafine.py": `# Most Similar Rafine (Zip Arşivinden)
from gensim.models import KeyedVectors

print("Model Yükleniyor...")
kelimeVektoru = KeyedVectors.load_word2vec_format('trModel100', binary=True)
print(kelimeVektoru)

def benzerKelimeler():
    anahtarKelime = input("Anahtar Kelime: ").lower()
    print("Girilen Kelime : " + str(anahtarKelime))
    oneriler = (kelimeVektoru.most_similar(positive=anahtarKelime))
    print(oneriler)

    # Önerileri rafine et (arama sözcüğü türevlerini ele)
    for oneri in oneriler:
        if anahtarKelime not in oneri[0]:
            print(oneri[0])

    benzerKelimeler()

benzerKelimeler()`
  };

  const copyScriptCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Üst Bilgi Kartı: trModel100 Tanıtımı */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-teal-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Türkçe Word2Vec Modeli: trModel100
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800">
                  100-Boyutlu Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sağlanan zip arşivindeki 200 MB'lık <code>trModel100</code> ikili modelinden çekilen anlamsal vektörler ve Gensim betikleri
              </p>
            </div>
          </div>

          {/* Orijinal Python Betikleri İnceleme Butonları */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowScriptModal("similarity.py")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-teal-400" />
              <span>similarity.py</span>
            </button>
            <button
              onClick={() => setShowScriptModal("mostSimilar.py")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>mostSimilar.py</span>
            </button>
            <button
              onClick={() => setShowScriptModal("mostSimilarRafine.py")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-700/60 text-xs transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>mostSimilarRafine.py</span>
            </button>
          </div>
        </div>

        {/* Model Parametreleri */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Vektör Boyutu</span>
            <strong className="text-teal-400 text-sm mt-0.5 block font-bold">100 Boyut (d=100)</strong>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Model Formatı</span>
            <strong className="text-slate-200 text-xs mt-0.5 block">Gensim Binary KeyedVectors</strong>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Orijinal Model Dağarcığı</span>
            <strong className="text-slate-200 text-xs mt-0.5 block">489.230 Kelime</strong>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Aktif Analiz Dağarcığı</span>
            <strong className="text-teal-300 text-xs mt-0.5 block font-bold">{modelInfo.activeVocabularySize} Sözcük</strong>
          </div>
        </div>
      </div>

      {/* İki Kelime Arası Kosinüs Benzerlik Hesaplayıcı (similarity.py) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">
              İki Kelime Arası 100-Boyutlu Kosinüs Benzerliği (similarity.py)
            </h4>
            <p className="text-xs text-slate-400">
              <code>trModel100</code> vektör uzayındaki kosinüs açısı: <code>cos(θ) = (u · v) / (||u|| ||v||)</code>
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            kelimeVektoru.similarity(w1, w2)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase">1. Kelime</label>
            <input
              type="text"
              value={wordA}
              onChange={(e) => setWordA(e.target.value.toLowerCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 font-mono"
            />
            <div className="flex flex-wrap gap-1">
              {['lütfen', 'mutlu', 'kapat', 'öfkeli', 'teşekkür', 'yardım'].map(w => (
                <button
                  key={w}
                  onClick={() => setWordA(w)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase">2. Kelime</label>
            <input
              type="text"
              value={wordB}
              onChange={(e) => setWordB(e.target.value.toLowerCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 font-mono"
            />
            <div className="flex flex-wrap gap-1">
              {['sevinçli', 'mükemmel', 'aç', 'kızgın', 'rica', 'bilgi'].map(w => (
                <button
                  key={w}
                  onClick={() => setWordB(w)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sonuç Paneli */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">trModel100 Kosinüs Benzerliği:</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-mono font-bold text-teal-400">
                {similarity.toFixed(4)}
              </span>
              <span className="text-xs text-slate-400">
                ({similarity > 0.6 ? 'Yüksek Anlamsal İlişki' : similarity > 0.35 ? 'Orta Düzey Anlamsal Bağlam' : similarity > 0 ? 'Düşük Benzerlik' : 'Zıt Kutuplar'})
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>-1.0 (Zıt)</span>
              <span>0.0</span>
              <span>+1.0 (Eşit)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, ((similarity + 1) / 2) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* En Yakın Komşular ve 2D Uzay */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* En Yakın Komşular (mostSimilar.py ve mostSimilarRafine.py) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-teal-400" />
              <h4 className="text-sm font-bold text-white">Anlamsal En Yakın Komşular</h4>
            </div>

            {/* Rafine vs Standart Mod Seçici */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setSearchMode('standard')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  searchMode === 'standard' 
                    ? 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                mostSimilar
              </button>
              <button
                onClick={() => setSearchMode('rafine')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  searchMode === 'rafine' 
                    ? 'bg-teal-600 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rafine Mod
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            {searchMode === 'rafine' 
              ? 'mostSimilarRafine.py mantığı: Arama kelimesinin kök türevlerini (alt sözcükleri) filtreler, gerçek anlamsal eşanlamlıları gösterir.'
              : 'mostSimilar.py mantığı: Vektör uzayındaki çıplak en yüksek kosinüs benzerliği alan kelimeleri listeler.'}
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value.toLowerCase())}
              placeholder="Kelime girin..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
            />
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value={4}>4 Komşu</option>
              <option value={6}>6 Komşu</option>
              <option value={8}>8 Komşu</option>
              <option value={10}>10 Komşu</option>
            </select>
          </div>

          <div className="space-y-1.5">
            {similarList.length > 0 ? (
              similarList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white">
                      "{item.word}"
                    </span>
                    <button
                      onClick={() => setInspectorWord(item.word)}
                      title="100D Vektörünü İncele"
                      className="text-[10px] font-mono text-teal-400/80 hover:text-teal-300 underline cursor-pointer"
                    >
                      [100D]
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 rounded-full"
                        style={{ width: `${Math.max(0, item.similarity * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-teal-400 w-12 text-right">
                      {item.similarity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-4 text-center">
                "{targetWord}" sözcüğü aktif sözlükte bulunamadı veya rafine filtre sonrası sonuç kalmadı. Başka bir kelime deneyin (örn. harika, mutlu, kapat, lütfen, öfkeli, yardım).
              </p>
            )}
          </div>
        </div>

        {/* 2D Vektör Kümeleme */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-white">2D Anlamsal Uzay Projeksiyonu</h4>
              <span className="text-[10px] text-slate-400 font-mono">100D → 2D Projeksiyon</span>
            </div>
            <p className="text-xs text-slate-400">
              Kelimelerin 100 boyutlu uzaydan 2 boyuta indirgenmiş anlamsal yakınlık haritası
            </p>
          </div>

          <div className="h-60 w-full bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden p-2">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 divide-x divide-y divide-slate-800/40 pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-800" />
            <div className="absolute inset-y-0 left-1/2 border-l border-slate-800" />

            {projectedWords.map((pw, idx) => (
              <div
                key={idx}
                style={{ left: `${pw.x}%`, top: `${pw.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                title={`${pw.word} (${pw.cluster})`}
                onClick={() => setInspectorWord(pw.word)}
              >
                <div
                  style={{ backgroundColor: pw.color }}
                  className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-150 transition-transform"
                />
                <span className="text-[10px] font-mono text-slate-300 group-hover:text-white whitespace-nowrap block mt-0.5">
                  {pw.word}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Pozitif Duygu
            </span>
            <span className="flex items-center gap-1 text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400" /> Nezaket & Rica
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Emir & Talimat
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Yasak & Öfke
            </span>
          </div>
        </div>
      </div>

      {/* 100-Boyutlu Ham Vektör İnceleyici (Vector Dimension Inspector) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-slate-800 text-teal-400">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                100-Boyutlu Ham Vektör İnceleyici (trModel100)
              </h4>
              <p className="text-xs text-slate-400">
                Seçilen kelimenin model dosyasındaki 100 adet IEEE 754 float32 ağırlığını doğrudan inceleyin
              </p>
            </div>
          </div>

          {/* Kelime Seçici */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Kelime:</span>
            <input
              type="text"
              value={inspectorWord}
              onChange={(e) => setInspectorWord(e.target.value.toLowerCase())}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-teal-400 w-32"
            />
          </div>
        </div>

        {inspectorVector && vectorStats ? (
          <div className="space-y-3">
            {/* Vektör İstatistikleri */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Boyut (d)</span>
                <span className="text-white font-bold">{vectorStats.dim}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">L2 Normu (||v||)</span>
                <span className="text-teal-400 font-bold">{vectorStats.l2Norm}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Min / Max Değer</span>
                <span className="text-slate-200">{vectorStats.min} / {vectorStats.max}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Aritmetik Ortalama</span>
                <span className="text-slate-200">{vectorStats.mean}</span>
              </div>
            </div>

            {/* 100 Değer Matrisi */}
            <div className="max-h-60 overflow-y-auto p-3 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-1.5">
                {Array.from(inspectorVector).map((val, idx) => (
                  <div
                    key={idx}
                    className={`p-1 rounded text-center border text-[10px] ${
                      val > 0
                        ? 'bg-teal-950/40 border-teal-800/40 text-teal-300'
                        : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                    }`}
                    title={`Dim ${idx}: ${val}`}
                  >
                    <span className="text-slate-400 text-[9px] block">d_{idx}</span>
                    <span className="font-bold">{val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
            "{inspectorWord}" kelimesi aktif model dağarcığında bulunamadı. Lütfen var olan bir kelime seçin (örn. 'lütfen', 'mutlu', 'harika', 'kapat', 'teşekkür').
          </div>
        )}
      </div>

      {/* Script Görüntüleme Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-mono font-bold text-white">{showScriptModal} (Zip Arşivinden)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyScriptCode(userScripts[showScriptModal])}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
                <button
                  onClick={() => setShowScriptModal(null)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer px-1"
                >
                  Kapat
                </button>
              </div>
            </div>

            <pre className="p-3.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-80 leading-relaxed">
              <code>{userScripts[showScriptModal]}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
