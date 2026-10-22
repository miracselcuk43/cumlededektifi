/**
 * src/components/SamplesView.tsx
 * 8 Kategoride Hazır Türkçe Örnek Cümleler Modülü
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  Briefcase, 
  GraduationCap, 
  Headphones, 
  Heart, 
  FileText, 
  AlertOctagon, 
  Smile,
  Copy,
  Check
} from 'lucide-react';
import { SAMPLE_CATEGORIES, SampleCategory } from '../nlp-engine/samples.ts';

interface SamplesViewProps {
  onSelectSample: (sentence: string) => void;
}

export const SamplesView: React.FC<SamplesViewProps> = ({ onSelectSample }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'daily': return <MessageCircle className="w-5 h-5 text-teal-400" />;
      case 'business': return <Briefcase className="w-5 h-5 text-blue-400" />;
      case 'education': return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case 'customer': return <Headphones className="w-5 h-5 text-purple-400" />;
      case 'family': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'official': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'imperative': return <AlertOctagon className="w-5 h-5 text-orange-400" />;
      case 'sentiment': return <Smile className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-teal-400" />;
    }
  };

  const copySentence = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const categoriesToRender = selectedCategory === 'all'
    ? Object.entries(SAMPLE_CATEGORIES)
    : Object.entries(SAMPLE_CATEGORIES).filter(([k]) => k === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-teal-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Türkçe Test Koleksiyonu (8 Dilsel Alan)
            </h3>
            <p className="text-xs text-slate-400">
              Farklı sosyodilbilimsel bağlamlar ve iletişim işlevlerine göre kategorize edilmiş cümleler
            </p>
          </div>
        </div>

        {/* Kategori Filtre Butonları */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-teal-600 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tüm Alanlar (32 Cümle)
          </button>
          {Object.entries(SAMPLE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-teal-600 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Kategoriler ve Cümle Kartları */}
      <div className="space-y-6">
        {categoriesToRender.map(([catKey, category]) => (
          <div key={catKey} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                  {getCategoryIcon(catKey)}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">{category.title}</h4>
                  <p className="text-xs text-slate-400">{category.description}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {category.sentences.length} örnek
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.sentences.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectSample(sample.text)}
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white leading-snug">
                      "{sample.text}"
                    </p>
                    <button
                      onClick={(e) => copySentence(sample.text, e)}
                      title="Cümleyi Kopyala"
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 shrink-0"
                    >
                      {copiedText === sample.text ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-300/90">
                      {sample.expectedTag}
                    </span>
                    <span className="text-xs text-teal-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                      Analiz Et <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
