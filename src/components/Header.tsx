/**
 * src/components/Header.tsx
 * Üst Başlık ve Sistem Durumu Çubuğu
 * Akademik ve temiz dilbilim laboratuvarı arayüzü
 */

import React from 'react';
import { 
  FileSearch, 
  Terminal, 
  BookOpen, 
  Code2, 
  Database,
  Sun, 
  Moon, 
  Binary,
  Layers,
  Rocket,
  Github
} from 'lucide-react';
import { TabType } from './Sidebar.tsx';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenDeployModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  onOpenDeployModal,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Sol Logo ve Başlık */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-teal-400">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">
                CümleDedektif
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                NLP Laboratuvarı
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Türkçe Cümle, Edimbilim ve İletişim Amacı Çözümleme Platformu
            </p>
          </div>
        </div>

        {/* Orta İstatistik & Mimari Rozetleri */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Depo: <strong className="text-slate-200">TÜRK-KORPUS</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Binary className="w-3.5 h-3.5 text-indigo-400" />
            <span>Word2Vec: <strong className="text-slate-200">24-D Skip-gram</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <span>Metot: <strong className="text-slate-200">Kural & İstatistiksel Hibrit</strong></span>
          </div>
        </div>

        {/* Sağ Butonlar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('corpus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'corpus'
                ? 'bg-slate-800 text-teal-300 border border-teal-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Korpus Deposu</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'theory'
                ? 'bg-slate-800 text-slate-100 border border-slate-600'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Metodoloji</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-slate-800 text-slate-100 border border-slate-600'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Python Kodu</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'tests'
                ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>13 Test</span>
          </button>

          {onOpenDeployModal && (
            <button
              onClick={onOpenDeployModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors cursor-pointer"
              title="GitHub ve Vercel Dağıtım Rehberi"
            >
              <Rocket className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">GitHub & Vercel</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Tema Değiştirici */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Açık temaya geç" : "Koyu temaya geç"}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
