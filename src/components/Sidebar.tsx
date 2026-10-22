/**
 * src/components/Sidebar.tsx
 * Sol Gezinme Menüsü ve Modül Seçici
 */

import React from 'react';
import { 
  Search, 
  Database,
  Layers, 
  Compass, 
  BookMarked, 
  BookOpen, 
  Code2, 
  CheckSquare, 
  Info,
  ChevronRight
} from 'lucide-react';

export type TabType = 'analyze' | 'corpus' | 'batch' | 'word2vec' | 'samples' | 'theory' | 'code' | 'tests';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: 'analyze' as TabType,
      label: 'Cümle Çözümleyici',
      desc: 'Duygu, niyet, nezaket ve emir ayrıştırma',
      icon: Search,
      badge: 'Çözümleyici',
      badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30'
    },
    {
      id: 'corpus' as TabType,
      label: 'Korpus Veri Deposu',
      desc: 'TÜRK-KORPUS veritabanı & sorgulama',
      icon: Database,
      badge: 'Veri Deposu',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'batch' as TabType,
      label: 'Metin & Paragraf Analizi',
      desc: 'Çoklu cümle ve diyalog ayrıştırma',
      icon: Layers,
      badge: 'Toplu İşlem',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    },
    {
      id: 'word2vec' as TabType,
      label: 'Word2Vec Vektör Uzayı',
      desc: 'Kosinüs benzerliği ve anlamsal uzay',
      icon: Compass,
      badge: '100-D trModel',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30'
    },
    {
      id: 'samples' as TabType,
      label: 'Türkçe Test Koleksiyonu',
      desc: '8 kategoride senaryo cümleleri',
      icon: BookMarked,
      badge: '8 Kategori',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    },
    {
      id: 'theory' as TabType,
      label: 'Dilbilim & NLP Metodolojisi',
      desc: 'Söz eylemleri ve morfolojik kurallar',
      icon: BookOpen,
      badge: 'Akademik',
      badgeColor: 'bg-slate-500/10 text-slate-300 border-slate-500/30'
    },
    {
      id: 'code' as TabType,
      label: 'Python Kodları & GitHub',
      desc: 'Flask, nlp/*.py ve dağıtım dosyaları',
      icon: Code2,
      badge: 'Kaynak Kod',
      badgeColor: 'bg-slate-500/10 text-slate-300 border-slate-500/30'
    },
    {
      id: 'tests' as TabType,
      label: 'Doğrulama & Test Paketi',
      desc: '12 zorunlu senaryo testi',
      icon: CheckSquare,
      badge: '12/12 OK',
      badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30'
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 border-r border-slate-800/80 bg-[#070B16]/60 backdrop-blur-sm p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          NLP Laboratuvar Modülleri
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-purple-900/40 via-purple-900/20 to-transparent border border-purple-500/30 shadow-sm'
                  : 'hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div
                className={`p-2 rounded-lg mt-0.5 shrink-0 transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700/80'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-sm font-semibold truncate ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {item.desc}
                </p>
              </div>

              {isActive && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Alt Bilgi Kutusu */}
      <div className="mt-6 pt-4 border-t border-slate-800/60 px-3">
        <div className="rounded-xl p-3 bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Info className="w-4 h-4 text-teal-400" />
            <span>Doğal Dil İşleme Dersi</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Türkçe dilinin sondan eklemeli yapısına özel morfolojik kurallar ve Word2Vec vektörleri birlikte çalışır.
          </p>
        </div>
      </div>
    </aside>
  );
};
