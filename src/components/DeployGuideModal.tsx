/**
 * src/components/DeployGuideModal.tsx
 * GitHub ve Vercel Dağıtım ve Paylaşım Merkezi
 * Kullanıcının projeyi GitHub'a yüklemesi ve Vercel'de tek tıkla yayınlaması için kılavuz
 */

import React, { useState } from 'react';
import { 
  X, 
  Github, 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  FolderGit2, 
  Rocket,
  ShieldCheck,
  FileCode2,
  Cpu
} from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'vercel' | 'github' | 'local'>('vercel');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `# 1. Git deposu başlatın (eğer henüz başlatılmadıysa)
git init

# 2. Tüm dosyaları ekleyin ve ilk commit'i oluşturun
git add .
git commit -m "feat: CümleDedektif Türkçe NLP Analiz ve Korpus Sistemi"

# 3. Ana dalı belirleyin
git branch -M main

# 4. GitHub'da oluşturduğunuz boş depoyu bağlayın
# (Kendi kullanıcı adınızı ve repo adınızı girin)
git remote add origin https://github.com/KULLANICI_ADINIZ/cumlededektif.git

# 5. Kodu GitHub'a gönderin
git push -u origin main`;

  const vercelCliCommands = `# Vercel CLI ile tek komutla dağıtmak için:
npx vercel

# Üretim ortamına (Production) doğrudan yayınlamak için:
npx vercel --prod`;

  const localRunCommands = `# 1. Bağımlılıkları yükleyin
npm install
pip install -r requirements.txt

# 2. Geliştirici sunucusunu başlatın
npm run dev

# 3. Arka uç Flask API'sini test edin
python app.py

# 4. Otomatik testleri çalıştırın
python3 -m unittest discover -s tests -p "test_*.py" -v`;

  const checklistItems = [
    { title: "Vercel Yapılandırması", desc: "vercel.json (Vite & Python Serverless hazır)", status: true },
    { title: "GitHub Actions CI", desc: ".github/workflows/ci.yml (Otomatik test ve derleme)", status: true },
    { title: "Vercel API Giriş Noktası", desc: "api/index.py (Flask WSGI Serverless)", status: true },
    { title: "TÜRK-KORPUS Veri Deposu", desc: "data/corpus_repository.json ve nlp/corpus_repository.py", status: true },
    { title: "Açık Kaynak Lisansı", desc: "LICENSE (MIT Lisansı eklendi)", status: true },
    { title: "Kapsamlı README", desc: "README.md (Türkçe/İngilizce kurulum ve Vercel butonu)", status: true },
    { title: "13/13 Birim Test", desc: "Pytest & Unittest tüm testleri başarıyla geçiyor", status: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fadeIn">
        {/* Modal Başlık */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                GitHub & Vercel Dağıtım Merkezi
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Dağıtıma Hazır
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Projeyi GitHub'a yükleme ve Vercel üzerinde ücretsiz canlıya alma adımları
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Seçici */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-4 bg-slate-950/30 text-xs">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'vercel'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Vercel'de Yayınlama</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub'a Yükleme</span>
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'local'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Yerel Kurulum & Test</span>
          </button>
        </div>

        {/* Modal Gövdesi */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Dağıtım Uyumluluk Kontrol Listesi */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-xs">Vercel & GitHub Hazırlık Durumu:</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">7/7 Tamamlandı</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded bg-slate-900 border border-slate-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="text-slate-200 block text-[11px]">{item.title}</strong>
                    <span className="text-slate-400 text-[10px] truncate block">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vercel Sekmesi */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-teal-400" />
                    Yöntem 1: Vercel Web Dashboard ile (Önerilen)
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
                    Tek Tıkla Otomatik
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1 leading-relaxed">
                  <li>
                    GitHub'daki <strong className="text-white">cumlededektif</strong> deponuzu açın.
                  </li>
                  <li>
                    <a
                      href="https://vercel.com/new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-400 underline font-semibold hover:text-teal-300 inline-flex items-center gap-1"
                    >
                      vercel.com/new <ExternalLink className="w-3 h-3" />
                    </a> sayfasına gidip GitHub hesabınızla giriş yapın.
                  </li>
                  <li>
                    GitHub deponuzu listeden seçip <strong className="text-white">"Import"</strong> butonuna basın.
                  </li>
                  <li>
                    Vercel projeyi otomatik tanıyacaktır:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-400 font-mono text-[11px]">
                      <li>Framework Preset: <strong className="text-slate-200">Vite</strong></li>
                      <li>Build Command: <strong className="text-slate-200">npm run build</strong></li>
                      <li>Output Directory: <strong className="text-slate-200">dist</strong></li>
                      <li>Serverless API: <strong className="text-slate-200">api/index.py (Otomatik)</strong></li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-white">"Deploy"</strong> butonuna tıklayın. 1 dakika içinde canlı URL'niz hazır!
                  </li>
                </ol>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    Yöntem 2: Vercel CLI ile Komut Satırından
                  </h3>
                  <button
                    onClick={() => copyToClipboard(vercelCliCommands, 1)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 1 ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto">
                  {vercelCliCommands}
                </pre>
              </div>
            </div>
          )}

          {/* GitHub Sekmesi */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-300" />
                    Projeyi GitHub Deponuza Gönderme
                  </h3>
                  <button
                    onClick={() => copyToClipboard(gitCommands, 2)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 2 ? 'Kopyalandı' : 'Tüm Komutları Kopyala'}</span>
                  </button>
                </div>

                <p className="text-slate-400">
                  Terminalinizde projenin kök dizinindeyken aşağıdaki komutları sırasıyla çalıştırın:
                </p>

                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  {gitCommands}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <strong className="text-slate-200 block">💡 Faydalı İpucu:</strong>
                <p>
                  GitHub'a push ettiğiniz anda <code className="text-teal-400 font-mono">.github/workflows/ci.yml</code> devreye girer; hem Python birim testlerini (13 test) hem de Vite derlemesini otomatik kontrol eder ve yeşil onay rozeti verir.
                </p>
              </div>
            </div>
          )}

          {/* Yerel Çalıştırma Sekmesi */}
          {activeTab === 'local' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Kendi Bilgisayarınızda Yerel Çalıştırma
                  </h3>
                  <button
                    onClick={() => copyToClipboard(localRunCommands, 3)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {copiedIndex === 3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 3 ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  {localRunCommands}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Alt Çubuk */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Tüm dosyalar Vercel ve GitHub yönergelerine göre yapılandırılmıştır.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Tamam, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
