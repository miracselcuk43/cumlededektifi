/**
 * src/components/CorpusRepositoryView.tsx
 * Türkçe Dilbilim Korpus Veri Deposu Modülü
 * Gerçek veri tabanından cümle çekme, filtreleme, inceleme ve yeni kayıt ekleme
 */

import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  ArrowRight, 
  Plus, 
  Download, 
  RotateCcw, 
  Check, 
  Copy,
  Tag,
  BookOpen,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { ClientCorpusRepository, CorpusRecord } from '../nlp-engine/corpus-repository.ts';

interface CorpusRepositoryViewProps {
  repo: ClientCorpusRepository;
  onSelectSentence: (sentence: string) => void;
}

export const CorpusRepositoryView: React.FC<CorpusRepositoryViewProps> = ({ repo, onSelectSentence }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('Tümü');
  const [selectedIntent, setSelectedIntent] = useState('Tümü');
  const [records, setRecords] = useState<CorpusRecord[]>(() => repo.getAll());
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Yeni Cümle Ekleme Form State
  const [newText, setNewText] = useState('');
  const [newDomain, setNewDomain] = useState('Günlük Yaşam & Sosyal');
  const [newIntent, setNewIntent] = useState('Rica etme');
  const [newPoliteness, setNewPoliteness] = useState('Nazik');
  const [newNotes, setNewNotes] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('Kolay');

  const stats = repo.getStats();

  const handleSearch = () => {
    const res = repo.search(searchQuery, selectedDomain, selectedIntent);
    setRecords(res);
  };

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    const res = repo.search(searchQuery, domain, selectedIntent);
    setRecords(res);
  };

  const handleIntentChange = (intent: string) => {
    setSelectedIntent(intent);
    const res = repo.search(searchQuery, selectedDomain, intent);
    setRecords(res);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    repo.add({
      text: newText.trim(),
      domain: newDomain,
      target_intent: newIntent,
      politeness_level: newPoliteness,
      notes: newNotes.trim() || 'Araştırmacı tarafından veri deposuna eklendi.',
      difficulty: newDifficulty
    });

    setRecords(repo.getAll());
    setNewText('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleResetRepo = () => {
    if (window.confirm("Veri deposunu orijinal akademik benchmark sürümüne sıfırlamak istiyor musunuz?")) {
      const def = repo.resetToDefault();
      setRecords(def);
      setSearchQuery('');
      setSelectedDomain('Tümü');
      setSelectedIntent('Tümü');
    }
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turk-korpus-deposu-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const domainList = [
    'Tümü',
    'Günlük Yaşam & Sosyal',
    'Akademik & Eğitim',
    'Hukuk & Resmi Yazışma',
    'Kurumsal & Müşteri Hizmetleri',
    'Edebi & Duygusal',
    'Sokak & Samimi Diyalog'
  ];

  const intentList = [
    'Tümü',
    'Rica etme',
    'Emir verme',
    'Yasaklama',
    'Bilgi verme',
    'Soru sorma',
    'Teşekkür etme',
    'Özür dileme',
    'Tebrik etme',
    'Şikâyet etme',
    'Uyarma',
    'Tehdit etme',
    'Öneride bulunma',
    'Davet etme',
    'Duygusal ifade'
  ];

  return (
    <div className="space-y-6">
      {/* Depo Başlık & Metrik Paneli */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  TÜRK-KORPUS Veri Deposu
                </h2>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  v2.1.0 JSON Veritabanı
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sentaktik ve edimbilimsel olarak etiketlenmiş açık Türkçe test korpusu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Depoya Cümle Ekle</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON İndir</span>
            </button>
            <button
              onClick={handleResetRepo}
              title="Varsayılan Veri Kümesine Sıfırla"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Depo Metrikleri */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Kayıtlı Cümle</span>
            <strong className="text-lg font-bold text-white font-mono mt-0.5 block">{stats.totalRecords}</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Toplam Sözcük Hacmi</span>
            <strong className="text-lg font-bold text-teal-400 font-mono mt-0.5 block">{stats.totalWords} kelime</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Ortalama Cümle Boyu</span>
            <strong className="text-lg font-bold text-slate-200 font-mono mt-0.5 block">{stats.avgWords} kelime/cümle</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Dilsel Alan Çeşitliliği</span>
            <strong className="text-lg font-bold text-purple-300 font-mono mt-0.5 block">6 Alan / Domain</strong>
          </div>
        </div>
      </div>

      {/* Arama & Filtreleme Çubuğu */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Depoda ara (örn: kapat, rica, sınav, tebrik)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedDomain}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
            >
              {domainList.map(d => (
                <option key={d} value={d}>Alan: {d}</option>
              ))}
            </select>

            <select
              value={selectedIntent}
              onChange={(e) => handleIntentChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
            >
              {intentList.map(i => (
                <option key={i} value={i}>Amaç: {i}</option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              Filtrele
            </button>
          </div>
        </div>
      </div>

      {/* Cümle Veri Listesi / Tablo */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Depodaki Kayıtlar ({records.length} sonuç listeleniyor)
          </span>
          <span className="text-slate-500">
            İstediğiniz cümlenin sağındaki butona tıklayarak analiz motoruna çekebilirsiniz
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {records.length > 0 ? (
            records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {rec.id}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-teal-300 border border-slate-700">
                      {rec.domain}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-purple-300 border border-slate-700">
                      {rec.target_intent}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-amber-300 border border-slate-700">
                      Nezaket: {rec.politeness_level}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-white leading-relaxed">
                    "{rec.text}"
                  </p>

                  <p className="text-xs text-slate-400 leading-snug">
                    <strong className="text-slate-300">Dilbilim Notu:</strong> {rec.notes}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleCopyText(rec.text, rec.id)}
                    title="Cümleyi Kopyala"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                  >
                    {copiedId === rec.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onSelectSentence(rec.text)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Depodan Çek & Analiz Et</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Arama kriterlerine uygun korpus kaydı bulunamadı. Filtreleri temizleyebilirsiniz.
            </div>
          )}
        </div>
      </div>

      {/* Depoya Yeni Cümle Ekleme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Depoya Yeni Korpus Cümlesi Ekle</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Cümle Metni</label>
                <textarea
                  rows={2}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Analiz edilecek Türkçe cümleyi girin..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dilsel Alan</label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    {domainList.filter(d => d !== 'Tümü').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hedef İletişim Amacı</label>
                  <select
                    value={newIntent}
                    onChange={(e) => setNewIntent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    {intentList.filter(i => i !== 'Tümü').map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nezaket Düzeyi</label>
                  <select
                    value={newPoliteness}
                    onChange={(e) => setNewPoliteness(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Çok nazik">Çok nazik</option>
                    <option value="Nazik">Nazik</option>
                    <option value="Nötr">Nötr</option>
                    <option value="Buyurgan">Buyurgan</option>
                    <option value="Kaba / saldırgan">Kaba / saldırgan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Zorluk Derecesi</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Kolay">Kolay</option>
                    <option value="Orta">Orta</option>
                    <option value="Zor">Zor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Dilbilimsel Açıklama / Not</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Kip, edimbilim veya sözcük özelliklerine dair not..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold"
                >
                  Depoya Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
