/**
 * src/components/AcademicTheoryView.tsx
 * Doğal Dil İşleme Akademik Teori, Morfoloji ve Yöntembilim Rehberi
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Compass, 
  HelpCircle, 
  Sparkles, 
  FileCheck, 
  GraduationCap, 
  AlertTriangle,
  Code2
} from 'lucide-react';

export const AcademicTheoryView: React.FC = () => {
  const [activeSection, setActiveSection] = useState('speech-acts');

  const sections = [
    { id: 'nlp-foundations', title: '1. Doğal Dil İşleme & Temel Kavramlar' },
    { id: 'speech-acts', title: '2. Austin & Searle Söz Eylemleri Kuramı' },
    { id: 'turkish-morphology', title: '3. Türkçede Emir & Morfolojik Ekler' },
    { id: 'politeness-theory', title: '4. Nezaket & Sosyal Mesafe Analizi' },
    { id: 'word2vec-math', title: '5. Word2Vec Matematiği & Kosinüs Benzerliği' },
    { id: 'hybrid-architecture', title: '6. Kural Tabanlı vs Makine Öğrenmesi (Hibrit)' },
    { id: 'limitations', title: '7. Model Sınırlamaları & İroni Problemi' },
  ];

  return (
    <div className="space-y-6">
      {/* Üst Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-teal-950/30 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <GraduationCap className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">
              Akademik Yöntembilim ve Dilbilimsel Teori
            </h3>
            <p className="text-xs text-slate-400">
              Üniversite Doğal Dil İşleme (NLP) Dersi Raporu ve Kuramsal Altyapı
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl mt-3">
          CümleDedektif, yalnızca yüzey düzeyindeki kelimeleri saymakla kalmaz; biçimbilim (morfoloji),
          sözdizim (sentaks), anlambilim (semantik) ve edimbilim (pragmatik) katmanlarını birbirine bağlayan
          hibrit bir analiz mimarisi sunar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol İçindekiler Menüsü */}
        <div className="lg:col-span-1 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
            Konu Başlıkları
          </div>
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === sec.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>

        {/* Sağ Ayrıntılı İçerik Alanı */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 text-sm text-slate-300 leading-relaxed">
          {activeSection === 'nlp-foundations' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                1. Doğal Dil İşleme ve Temel Kavramlar
              </h4>
              <p>
                <strong>Doğal Dil İşleme (Natural Language Processing - NLP)</strong>; bilgisayarların insan dillerini
                anlamasını, ayrıştırmasını, sentezlemesini ve anlamlandırmasını sağlayan çok disiplinli bir alandır.
              </p>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <strong className="text-white block text-xs uppercase tracking-wider">Metin Sınıflandırması (Text Classification):</strong>
                <p className="text-xs text-slate-300">
                  Verilen bir metin parçasını (cümle, paragraf, belge) önceden belirlenmiş sınıflardan birine veya birkaçına
                  (multi-label) atama sürecidir. Geleneksel yaklaşımlar Bag-of-Words (BoW) ve TF-IDF gibi seyreltik vektörler
                  kullanırken, modern sistemler kelime gömmeleri (Word2Vec) ve dilsel bağlam kurallarını harmanlar.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <strong className="text-white block text-xs uppercase tracking-wider">Duygu Analizi (Sentiment Analysis / Opinion Mining):</strong>
                <p className="text-xs text-slate-300">
                  Metindeki öznel kanıları, tutumları ve duygusal kutupluluğu tespit eder. CümleDedektif'te sadece
                  "olumlu/olumsuz" ikiliği değil; <em>Mutlu, Üzgün, Öfkeli, Korkmuş/Endişeli, Şaşkın, Nötr</em> ve <em>İroni</em> olmak
                  üzere 7 ayrı psikodilbilimsel sınıf modellenmiştir.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'speech-acts' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                2. J.L. Austin ve John Searle Söz Eylemleri Kuramı (Speech Acts)
              </h4>
              <p>
                Geleneksel mantık, cümleleri yalnızca "doğru" ya da "yanlış" olan önermeler olarak değerlendiriyordu.
                Ancak dilbilimci <strong>J.L. Austin (1962 - How to Do Things with Words)</strong> ve öğrencisi <strong>John Searle (1969)</strong>,
                insanların konuşurken yalnızca bilgi aktarmadığını, aynı zamanda eylemde bulunduğunu ortaya koymuştur.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-teal-300 block mb-1">1. Düzsöz (Locutionary Act)</strong>
                  <p className="text-slate-300">Cümlenin fiziksel ses ve sözcük dizimi olarak gramatik ifadesi ("Kapıyı kapatır mısın?").</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-purple-300 block mb-1">2. Edimsöz (Illocutionary Act)</strong>
                  <p className="text-slate-300">Konuşucunun asıl iletişimsel gayesi ve niyeti (Kapının kapatılmasını rica etme eylemi).</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-amber-300 block mb-1">3. Etkisöz (Perlocutionary Act)</strong>
                  <p className="text-slate-300">Cümlenin dinleyicide uyandırdığı etki ve sonuç (Muhatabın kalkıp kapıyı kapatması).</p>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                <strong>Dolaylı Söz Eylemleri (Indirect Speech Acts):</strong> Konuşucu doğrudan "Kapıyı kapat!" demek yerine,
                muhatabın yüzünü korumak (Face Saving) için "Kapıyı kapatır mısın?" veya "Hava biraz soğudu mu?" diyebilir.
                CümleDedektif tam olarak bu pragmatik farkı analiz edebilmek üzere tasarlanmıştır.
              </p>
            </div>
          )}

          {activeSection === 'turkish-morphology' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-400" />
                3. Türkçede Emir Kipleri ve Morfolojik Özellikler
              </h4>
              <p>
                Türkçe, Ural-Altay dil ailesine mensup tipik bir <strong>sondan eklemeli (agglutinative)</strong> dildir.
                Fiil köklerine ardışık olarak gelen çatı, olumsuzluk, kip ve şahıs ekleri anlamı tamamen değiştirebilir.
              </p>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3 text-xs">
                <div>
                  <strong className="text-amber-300 block font-mono">1. Çıplak 2. Tekil Emir: "Kapat", "Gel", "Git"</strong>
                  <p className="text-slate-300 mt-0.5">Eksizdir; hiyerarşik olarak eşit veya alt statüdeki kişilere yöneltilir. Nezaket eksikliği durumunda buyurgan veya kaba algılanır.</p>
                </div>
                <div>
                  <strong className="text-rose-300 block font-mono">2. Olumsuzluk ve Yasaklama: "Gelme!", "Dokunmayın"</strong>
                  <p className="text-slate-300 mt-0.5">'-ma / -me' olumsuzluk eki çıplak emir köküyle birleştiğinde eylemin yapılmasını men eden yasaklama işlevi üstlenir.</p>
                </div>
                <div>
                  <strong className="text-blue-300 block font-mono">3. Saygı ve Çoğul Emir: "Kapatınız", "Açınız", "Bekleyin"</strong>
                  <p className="text-slate-300 mt-0.5">'-iniz / -ınız' ekleri talimat ve resmi yönergelerde doğrudan emri yumuşatarak kurumsal standart sağlar.</p>
                </div>
                <div>
                  <strong className="text-teal-300 block font-mono">4. Soru ile Dolaylı Yönlendirme: "Kapatır mısınız?", "Yardımcı olabilir misiniz?"</strong>
                  <p className="text-slate-300 mt-0.5">Geniş zaman (`-ar/-er/-ır/-ir`) veya yeterlilik (`-abil/-ebil`) eki, soru edatı (`mı/mi`) ile birleştiğinde sentaktik olarak soru, pragmatik olarak nazik ricaya dönüşür.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'politeness-theory' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-300" />
                4. Nezaket Kuramı (Brown & Levinson) ve Sosyal Mesafe
              </h4>
              <p>
                <strong>Penelope Brown ve Stephen Levinson (1987)</strong> tarafından geliştirilen Nezaket Kuramı,
                bireylerin sosyal etkileşimde "yüz" (face) kavramını koruma çabasını modeller:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                <li><strong>Pozitif Yüz (Positive Face):</strong> Bireyin onaylanma, sevilme ve aidiyet isteği ("Canım arkadaşım", "Tebrik ederim").</li>
                <li><strong>Negatif Yüz (Negative Face):</strong> Bireyin engellenmeme, özgür hareket edebilme ve saygı görme isteği ("Zahmet olmazsa", "Mümkünse").</li>
                <li><strong>Yüz Tehdit Edici Eylemler (Face Threatening Acts - FTA):</strong> Doğrudan emirler ve talepler karşı tarafın negatif yüzünü tehdit eder; bu nedenle Türkçe konuşucuları "Lütfen", "Rica etsem" gibi yumuşatıcı belirteçler kullanır.</li>
              </ul>
            </div>
          )}

          {activeSection === 'word2vec-math' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                5. Word2Vec Matematiği ve Kosinüs Benzerliği Formülü
              </h4>
              <p>
                <strong>Tomas Mikolov ve ekibi (Google, 2013)</strong> tarafından geliştirilen Word2Vec algoritması,
                kelimeleri yüksek boyutlu sürekli vektör uzayına yerleştirir.
              </p>
              <div className="p-4 rounded-xl bg-[#080D1A] border border-slate-800 font-mono text-xs space-y-2">
                <div className="text-slate-400">// İki vektör u ve v arasındaki Kosinüs Benzerliği:</div>
                <div className="text-teal-400 text-sm font-bold">
                  cos(θ) = (u · v) / (||u||₂ · ||v||₂) = ∑(uᵢ · vᵢ) / ( √(∑ uᵢ²) · √(∑ vᵢ²) )
                </div>
                <p className="text-slate-400 text-[11px] font-sans mt-2">
                  Sonuç -1.0 ile +1.0 arasındadır. Eğer açı 0° ise cos(0)=1 (tam anlamsal eşdeğerlik); açı 90° ise cos(90)=0 (alakasız); açı 180° ise cos(180)=-1 (anlamsal zıt kutup).
                </p>
              </div>
              <p className="text-xs text-slate-300">
                <strong>Skip-gram vs CBOW:</strong> CBOW (Continuous Bag of Words) çevre kelimelerden hedef kelimeyi tahmin ederken;
                Skip-gram hedef kelimeden çevre kelimeleri tahmin eder. Seyrek kelimelerde ve küçük korpuslarda Skip-gram
                anlamsal ilişkileri daha başarılı yakaladığı için sistemimizde Skip-gram mimarisi tercih edilmiştir.
              </p>
            </div>
          )}

          {activeSection === 'hybrid-architecture' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                6. Kural Tabanlı Yöntemler vs Makine Öğrenmesi (Hibrit Yaklaşım)
              </h4>
              <p>
                Pek çok doğal dil işleme uygulamasında ya sadece kara kutu makine öğrenmesi modelleri ya da sadece katı
                sözlük aramaları kullanılır. CümleDedektif her iki paradigmanın güçlü yönlerini birleştiren <strong>Hibrit Mimari</strong> ile çalışır:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="py-2">Özellik</th>
                      <th className="py-2">Saf Kural Tabanlı</th>
                      <th className="py-2">Saf Makine Öğrenmesi</th>
                      <th className="py-2 text-teal-400">CümleDedektif (Hibrit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-2 font-semibold text-slate-200">Açıklanabilirlik (XAI)</td>
                      <td className="py-2 text-emerald-400">%100 Açık</td>
                      <td className="py-2 text-rose-400">Kara Kutu</td>
                      <td className="py-2 text-teal-300 font-bold">%100 Açıklanabilir Kanıtlar</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-slate-200">Morfolojiye Duyarlılık</td>
                      <td className="py-2 text-emerald-400">Yüksek</td>
                      <td className="py-2 text-amber-400">Veriye Bağımlı</td>
                      <td className="py-2 text-teal-300 font-bold">Kural & Ek Heuristikleri</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-slate-200">Anlamsal Genişleme</td>
                      <td className="py-2 text-rose-400">Sözlükle Sınırlı</td>
                      <td className="py-2 text-emerald-400">Yüksek</td>
                      <td className="py-2 text-teal-300 font-bold">Word2Vec Kosinüs Ağı</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-slate-200">Eğitim Verisi İhtiyacı</td>
                      <td className="py-2 text-emerald-400">Yok</td>
                      <td className="py-2 text-rose-400">Onbinlerce Etiket</td>
                      <td className="py-2 text-teal-300 font-bold">Açıklanabilir Korpus</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'limitations' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                7. Model Sınırlamaları, İroni ve Bağlam Problemi
              </h4>
              <p>
                Akademik dürüstlük gereği her NLP sisteminin sınırları açıkça belirtilmelidir.
                CümleDedektif'in tasarım sınırları şunlardır:
              </p>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40">
                  <strong className="text-amber-300 block mb-1">1. İroni ve Kinaye (Sarcasm Detection):</strong>
                  <p className="text-slate-300">İroni tespiti gerçek dünyada konuşanın ses tonu, mimikleri ve geçmiş diyalog geçmişine dayanır. Yazılı metinde sadece tırnak işaretleri, pekiştirilmiş tezatlar ("Aferin, mahvettin") üzerinden yaklaşık tespit yapılabilir.</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40">
                  <strong className="text-amber-300 block mb-1">2. Küçük Korpus ve Word2Vec:</strong>
                  <p className="text-slate-300">Çok küçük bir eğitim korpusu genel dilin bütün anlamsal çeşitliliğini temsil edemez. Bu nedenle Word2Vec sonuçları genel geçer mutlak hakikat değil; korpusun dağılımsal bir yansıması olarak yorumlanmalıdır.</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40">
                  <strong className="text-amber-300 block mb-1">3. Hiyerarşik Sosyal Bağlam:</strong>
                  <p className="text-slate-300">"Dosyayı getir" cümlesi askeriye veya yoğun cerrahi operasyonda tamamen normal bir talimat iken; sosyal ilişkide kaba algılanabilir. Metin dışı pragmatik bağlam sistem tarafından tahmin edilemez.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
