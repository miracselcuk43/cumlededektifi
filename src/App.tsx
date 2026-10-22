/**
 * src/App.tsx
 * CümleDedektif — Türkçe Cümle ve İletişim Amacı Analiz Sistemi
 * Ana Uygulama Kabuğu
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar, TabType } from './components/Sidebar.tsx';
import { AnalyzerView } from './components/AnalyzerView.tsx';
import { BatchAnalyzerView } from './components/BatchAnalyzerView.tsx';
import { Word2VecExplorerView } from './components/Word2VecExplorerView.tsx';
import { SamplesView } from './components/SamplesView.tsx';
import { AcademicTheoryView } from './components/AcademicTheoryView.tsx';
import { CodeExplorerView } from './components/CodeExplorerView.tsx';
import { AutomatedTestsView } from './components/AutomatedTestsView.tsx';
import { CorpusRepositoryView } from './components/CorpusRepositoryView.tsx';
import { DeployGuideModal } from './components/DeployGuideModal.tsx';
import { TurkishSentenceDetector } from './nlp-engine/analyzer.ts';
import { ClientCorpusRepository } from './nlp-engine/corpus-repository.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('analyze');
  const [darkMode, setDarkMode] = useState(true);
  const [initialSentence, setInitialSentence] = useState<string | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // NLP Motoru ve Korpus Veri Deposu örnekleri
  const detector = useMemo(() => new TurkishSentenceDetector(), []);
  const corpusRepo = useMemo(() => new ClientCorpusRepository(), []);

  // Depodan veya örneklerden doğrudan analize yönlendirme
  const handleSelectSample = (sentence: string) => {
    setInitialSentence(sentence);
    setActiveTab('analyze');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#080C18] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200 font-sans`}>
      {/* Üst Çubuk */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* GitHub & Vercel Dağıtım Modalı */}
      <DeployGuideModal 
        isOpen={isDeployModalOpen} 
        onClose={() => setIsDeployModalOpen(false)} 
      />

      {/* Ana Gövde: Sol Menü + Orta İçerik */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sol Menü */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Orta Çalışma Alanı */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'analyze' && (
            <AnalyzerView 
              detector={detector} 
              initialSentence={initialSentence}
              corpusRepo={corpusRepo}
              onNavigateToCorpus={() => setActiveTab('corpus')}
            />
          )}

          {activeTab === 'corpus' && (
            <CorpusRepositoryView 
              repo={corpusRepo} 
              onSelectSentence={handleSelectSample} 
            />
          )}

          {activeTab === 'batch' && (
            <BatchAnalyzerView detector={detector} />
          )}

          {activeTab === 'word2vec' && (
            <Word2VecExplorerView w2v={detector.w2v} />
          )}

          {activeTab === 'samples' && (
            <SamplesView onSelectSample={handleSelectSample} />
          )}

          {activeTab === 'theory' && (
            <AcademicTheoryView />
          )}

          {activeTab === 'code' && (
            <CodeExplorerView />
          )}

          {activeTab === 'tests' && (
            <AutomatedTestsView detector={detector} />
          )}
        </main>
      </div>
    </div>
  );
}
