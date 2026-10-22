# CümleDedektif — Türkçe Cümle ve İletişim Amacı Analiz Sistemi

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/selcukmirac29/cumlededektif)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-13%2F13%20Passed-emerald.svg)](tests/)

> **Üniversite Doğal Dil İşleme (NLP) Dersi ve Bitirme Projesi**  
> *Türkçe morfolojik çözümleme, edimbilimsel söz eylemleri (Speech Acts), duygu kitleleri, nezaket derecelendirmesi, emir kipleri, TÜRK-KORPUS veri deposu ve Gensim Word2Vec kelime vektörlerini bütünleştiren hibrit analiz platformu.*

---

## ⚡ Canlı Önizleme & Hızlı Dağıtım

| Platform | Bağlantı / Yöntem | Durum |
|---|---|---|
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/selcukmirac29/cumlededektif) | ✅ 1-Tıkla Dağıtıma Hazır |
| **GitHub** | `git clone https://github.com/selcukmirac29/cumlededektif.git` | ✅ Açık Kaynak (MIT) |
| **CI / CD** | GitHub Actions (`.github/workflows/ci.yml`) | ✅ Otomatik Test & Derleme |

---

## 1. Projenin Amacı ve Dilbilimsel Kapsamı

Doğal dillerde, özellikle Türkçe gibi **sondan eklemeli (agglutinative)** ve yüksek oranda bağlam bağımlı dillerde bir cümlenin biçimsel (sentaktik) yapısı ile kullanım amacı (pragmatik niyet) her zaman örtüşmez. 

Örneğin:
> **“Lütfen kapıyı kapatır mısın?”**
- **Biçimsel Yapı:** Geniş zaman eki (`-ır`) ve soru eki (`mısın?`) ile oluşturulmuş bir **Soru** cümlesidir.
- **Edimbilimsel (Pragmatic) İşlev:** Muhataptan bir eylemi gerçekleştirmesini talep eden **Dolaylı Yönlendirme / Nazik Rica**dır.
- **Nezaket & Sosyal Mesafe:** `Lütfen` belirteci ve soru kipi sayesinde **Çok Nazik** düzeyde ve saygılı bir tona sahiptir.

**CümleDedektif**, bu tür incelikleri kural tabanlı morfolojik ayrıştırma, ağırlıklı duygu ve nezaket sözlükleri, bağlam pencereleri, **TÜRK-KORPUS** veri tabanı ve **Gensim Word2Vec** anlamsal kelime vektörleriyle analiz eden akademik bir NLP sistemidir.

---

## 2. Akademik Teori ve Doğal Dil İşleme Metodolojisi

### A. Pragmatik Söz Eylemleri Kuramı (Speech Act Theory)
Projemiz dilbilimci **J.L. Austin** (1962) ve **John Searle** (1969) tarafından geliştirilen Söz Eylemleri Kuramı'nı temel alır:
1. **Düzsöz (Locutionary Act):** Cümlenin fiziksel ve gramer olarak söylenişi (*"Kapıyı kapatır mısın?"*).
2. **Edimsöz (Illocutionary Act):** Cümlenin asıl iletişimsel niyeti (*Kapının kapatılmasını rica etme*).
3. **Etkisöz (Perlocutionary Act):** Cümlenin dinleyicide uyandırdığı etki ve sonuç (*Muhatabın kapıyı kapatması*).

### B. Türkçede Emir Kipleri ve Dolaylı Yönlendirme
Türkçede doğrudan 2. tekil emir (*"Kapat", "Gel", "Git"*) mesafe yokluğu durumunda buyurgan veya kaba algılanabileceğinden, sosyal nezaket gereği geniş zaman (`-ar/-er/-ır/-ir`) veya yeterlilik (`-abil/-ebil`) kipleriyle birleştirilen soru yapıları (`-mısın? / -misiniz?`) **dolaylı yönlendirme** olarak kullanılır. Sistemimiz bu kuralı hem sentaktik hem de anlamsal olarak modeller.

### C. Brown & Levinson Nezaket Kuramı
Muhatabın pozitif ve negatif yüz (face) ihtiyaçları gözetilerek geliştirilen sürekli nezaket skoru ($-1.0$ ile $+1.0$ aralığında) hesaplanır.

### D. Word2Vec ve Dağılımsal Anlambilim
Mikolov vd. (2013) Skip-gram mimarisiyle eğitilmiş 24 boyutlu anlamsal kelime vektörleri üzerinden **Kosinüs Benzerliği (Cosine Similarity)** hesaplanır:

$$\text{Cosine Similarity}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$

---

## 3. TÜRK-KORPUS Veri Deposu

Sistem içerisinde doğrulanmış açık test korpusu yer almaktadır:
- **Dosya Konumu:** `data/corpus_repository.json`
- **Yönetici Modülü:** `nlp/corpus_repository.py`
- **Kapsanan Alanlar:** Günlük Yaşam & Sosyal, Akademik & Eğitim, Hukuk & Resmi Yazışma, Kurumsal & Müşteri Hizmetleri, Edebi & Duygusal, Sokak & Samimi Diyalog.
- **Her Kayıttaki Etiketler:** `id`, `text`, `domain`, `target_intent`, `speech_act`, `politeness_level`, `notes`, `difficulty`.

---

## 4. Sistem Mimarisi ve Dizin Yapısı

```text
cumlededektif/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions otomatik CI test ve derleme
├── api/
│   └── index.py                # Vercel Serverless Function giriş noktası (Flask WSGI)
├── data/
│   └── corpus_repository.json  # TÜRK-KORPUS veri tabanı dosyası
├── nlp/
│   ├── __init__.py             # Modül dışa aktarımları
│   ├── preprocessing.py        # Türkçe küçük harf (İ->i, I->ı), tokenizasyon, kök heuristiği
│   ├── emotion.py              # 7 sınıflı duygu analizi, bağlam pencereleri, ironi tespiti
│   ├── imperative.py           # Doğrudan emir, yasaklama, talimat, dolaylı rica çözümleme
│   ├── politeness.py           # Nezaket derecelendirme (-1.0 ile +1.0) ve buyurganlık tespiti
│   ├── intent.py               # 15 sınıflı iletişim amacı ve çoklu etiketleme
│   ├── sentence_structure.py   # Sözdizimsel tür, olumluluk/olumsuzluk, zamir ve hitaplar
│   ├── word2vec_model.py       # Gensim Word2Vec eğitimi, kosinüs benzerliği ve anlamsal uzay
│   ├── corpus_repository.py    # Korpus disk yöneticisi ve arama motoru
│   └── analyzer.py             # Tüm motorları yöneten ana orkestratör
├── tests/
│   ├── __init__.py
│   └── test_analysis.py        # 13 senaryolu otomatik pytest / unittest paketi
├── src/                        # React 19 + TypeScript + Vite modern web arayüzü
│   ├── components/             # Modüler UI bileşenleri
│   └── nlp-engine/             # Tarayıcı tarafı çalışan istemci NLP motoru
├── app.py                      # Flask REST API sunucusu
├── vercel.json                 # Vercel Vite + Python Serverless yapılandırması
├── requirements.txt            # Python bağımlılıkları
├── package.json                # Node.js bağımlılıkları ve betikleri
├── LICENSE                     # MIT Açık Kaynak Lisansı
└── README.md                   # Dokümantasyon
```

---

## 5. REST API Uç Noktaları

| Metot | Uç Nokta | Açıklama |
|---|---|---|
| `GET` | `/api/health` | Servis sağlık durumu ve kelime haznesi boyutu |
| `POST` | `/api/analyze` | Tek cümle için ayrıntılı duygu, nezaket, emir ve amaç analizi |
| `POST` | `/api/analyze-batch` | Çoklu cümle içeren metinlerin toplu analizi |
| `GET` | `/api/corpus` | Korpus veri deposundaki kayıtları filtreli listeleme |
| `GET` | `/api/corpus/stats` | Korpus dilbilimsel özet istatistikleri |
| `POST` | `/api/corpus/add` | Korpus deposuna yeni etiketli cümle ekleme |
| `GET` | `/api/word2vec/similar` | Türkçe kelimenin en yakın anlamsal komşuları ve kosinüs skoru |
| `GET` | `/api/examples` | 8 ayrı kategoride hazır Türkçe test cümleleri |

---

## 6. GitHub'a Yükleme ve Paylaşma Adımları

Projeyi kendi GitHub hesabınızda yayınlamak için terminalde şu komutları sırayla çalıştırın:

```bash
# 1. Git deposu başlatın (eğer henüz başlatılmadıysa)
git init

# 2. Tüm dosyaları sahneleyin ve commit yapın
git add .
git commit -m "feat: CümleDedektif Türkçe NLP Analiz ve Korpus Sistemi"

# 3. Ana dalı main olarak ayarlayın
git branch -M main

# 4. GitHub'da açtığınız boş depoyu bağlayın
git remote add origin https://github.com/KULLANICI_ADINIZ/cumlededektif.git

# 5. Kodu GitHub'a gönderin
git push -u origin main
```

---

## 7. Vercel'de Yayınlama Adımları

### Yöntem A: Vercel Web Dashboard (1-Tıkla Önerilen)
1. GitHub deponuzu oluşturduktan sonra [vercel.com/new](https://vercel.com/new) adresine gidin.
2. GitHub hesabınızı bağlayıp `cumlededektif` deponuzu seçin (**Import**).
3. Vercel projeyi otomatik algılar (`vercel.json` sayesinde):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Serverless API:** `api/index.py` (Otomatik Flask runtime)
4. **Deploy** butonuna tıklayın. 1 dakika içinde canlı URL'niz (`https://cumlededektif.vercel.app`) hazır olacaktır.

### Yöntem B: Vercel CLI ile Komut Satırından
```bash
# Vercel CLI aracını çalıştırın
npx vercel

# Üretim (Production) ortamına doğrudan yayınlamak için
npx vercel --prod
```

---

## 8. Kendi Bilgisayarınızda Yerel Çalıştırma

### Gereksinimler:
- Python 3.10+ ve pip
- Node.js 18+ ve npm

### Adımlar:
```bash
# 1. Depoyu klonlayın
git clone https://github.com/selcukmirac29/cumlededektif.git
cd cumlededektif

# 2. Node.js bağımlılıklarını kurun ve Vite arayüzünü başlatın
npm install
npm run dev

# 3. Başka bir terminalde Python bağımlılıklarını kurun ve Flask sunucusunu başlatın
python3 -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# 4. Otomatik birim testlerini çalıştırın
python3 -m unittest discover -s tests -p "test_*.py" -v
```

---

## 9. Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakabilirsiniz.
Açık kaynak olarak paylaşılabilir, ders projelerinde referans gösterilerek kullanılabilir.
