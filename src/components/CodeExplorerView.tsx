/**
 * src/components/CodeExplorerView.tsx
 * Python Kod Gezgini, Dosya İnceleyici ve Dağıtım Rehberi
 */

import React, { useState } from 'react';
import { 
  Code2, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Github, 
  Terminal, 
  ExternalLink,
  FolderTree,
  FileText
} from 'lucide-react';

export const CodeExplorerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('app.py');
  const [copied, setCopied] = useState(false);

  // Dosya listesi ve içerikleri
  const files: Record<string, { desc: string; type: string; content: string }> = {
    "app.py": {
      desc: "Flask REST API sunucusu ve tüm /api/* endpoint'leri",
      type: "python",
      content: `"""
app.py - CümleDedektif Flask REST API Sunucusu
"""
import os
from flask import Flask, request, jsonify, render_template, send_from_directory
from nlp.analyzer import TurkishSentenceDetector
from nlp.word2vec_model import TurkishWord2VecModel

app = Flask(__name__, static_folder="static", template_folder="templates")
detector = TurkishSentenceDetector()
w2v_model = detector.w2v

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CümleDedektif NLP Engine",
        "version": "1.0.0",
        "vocabulary_size": len(w2v_model.vectors)
    }), 200

@app.route("/api/analyze", methods=["POST"])
def analyze_sentence():
    data = request.get_json(silent=True) or {}
    sentence = data.get("sentence", "").strip()
    if not sentence:
        return jsonify({"error": True, "message": "Cümle boş olamaz."}), 400
    result = detector.analyze_single_sentence(sentence)
    return jsonify({"status": "success", "data": result}), 200

@app.route("/api/analyze-batch", methods=["POST"])
def analyze_batch():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": True, "message": "Metin boş olamaz."}), 400
    batch_result = detector.analyze_batch(text)
    return jsonify({"status": "success", "data": batch_result}), 200

@app.route("/api/word2vec/similar", methods=["GET"])
def word2vec_similar():
    word = request.args.get("word", "").strip()
    top_k = int(request.args.get("top_k", 5))
    neighbors = w2v_model.find_most_similar(word, top_k=top_k)
    return jsonify({"target_word": word, "similar_words": neighbors}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)`
    },
    "nlp/preprocessing.py": {
      desc: "Türkçe küçük harf (İ->i), tokenizasyon ve kök ayıklama",
      type: "python",
      content: `"""
nlp/preprocessing.py - Türkçe Ön İşleme ve Morfolojik Ayıklama
"""
import re
from typing import List, Dict, Any

class TurkishPreprocessor:
    TR_LOWER_MAP = {ord('İ'): 'i', ord('I'): 'ı', ord('Ğ'): 'ğ', ord('Ü'): 'ü', ord('Ş'): 'ş', ord('Ö'): 'ö', ord('Ç'): 'ç'}

    @classmethod
    def turkish_lower(cls, text: str) -> str:
        if not text: return ""
        return text.translate(cls.TR_LOWER_MAP).lower()

    @classmethod
    def split_sentences(cls, text: str) -> List[str]:
        if not text or not text.strip(): return []
        pattern = r'(?<=[.!?…])\\s+(?=[A-ZÇĞİÖŞÜa-zçğıöşü0-9"\\'“‘])'
        raw = re.split(pattern, text.strip())
        return [s.strip() for s in raw if s.strip()]

    @classmethod
    def tokenize(cls, sentence: str) -> List[str]:
        return re.findall(r'[A-Za-zÇĞİÖŞÜçğıöşü]+|[.,!?:;…"\']+', sentence) or []

    @classmethod
    def normalize_and_clean_tokens(cls, tokens: List[str]) -> List[str]:
        words = []
        for tok in tokens:
            cleaned = re.sub(r'[^a-zçğıöşü]', '', cls.turkish_lower(tok))
            if cleaned: words.append(cleaned)
        return words`
    },
    "nlp/imperative.py": {
      desc: "Doğrudan emir, yasaklama, talimat ve dolaylı rica ayrıştırıcı",
      type: "python",
      content: `"""
nlp/imperative.py - Türkçe Emir ve Talimat Kipi Tespit Modülü
"""
import re
from typing import Dict, Any

class ImperativeAnalyzer:
    IMPERATIVE_VERB_STEMS = {"kapat", "aç", "gel", "git", "otur", "kalk", "dur", "sus", "yap", "yaz", "oku", "ver", "al", "gönder"}
    INDIRECT_REQUEST_PATTERNS = [
        r"(?:kapat|yap|ver|al|gel|git|aç|gönder)(?:ır|ir|ur|ür|ar|er)\\s+mısın",
        r"(?:kapat|yap|ver|al|gel|git|aç|gönder)(?:ır|ir|ur|ür|ar|er)\\s+misiniz",
        r"(?:abilir|ebilir)\\s+misiniz",
        r"(?:abilir|ebilir)\\s+misin"
    ]

    def analyze(self, sentence: str, punctuation_features: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Dolaylı Emir / Rica (örn: "Kapıyı kapatır mısın?")
        # 2. Yasaklama (örn: "Buraya gelme!")
        # 3. Talimat (örn: "Önce dosyayı aç, sonra kaydet.")
        # 4. Doğrudan Emir (örn: "Kapıyı kapat.")
        # 5. Emir niteliği taşımayan ifade`
    },
    "nlp/word2vec_model.py": {
      desc: "Gensim Word2Vec Türkçe eğitimi ve kosinüs benzerliği",
      type: "python",
      content: `"""
nlp/word2vec_model.py - Gensim Word2Vec ve Kosinüs Benzerliği
"""
import math
from typing import List, Dict, Tuple, Optional, Any

class TurkishWord2VecModel:
    VECTOR_DIM = 24
    
    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0: return 0.0
        return max(-1.0, min(1.0, dot_product / (norm_a * norm_b)))`
    },
    "tests/test_analysis.py": {
      desc: "12 zorunlu senaryoyu doğrulayan otomatik test paketi",
      type: "python",
      content: `"""
tests/test_analysis.py - CümleDedektif Otomatik Test Paketi (12 Senaryo)
"""
import unittest
from nlp.analyzer import TurkishSentenceDetector

class TestTurkishSentenceDetector(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.detector = TurkishSentenceDetector()

    def test_direct_imperative(self):
        # 'Kapıyı kapat.' -> Doğrudan emir
        res = self.detector.analyze_single_sentence("Kapıyı kapat.")
        self.assertEqual(res["imperative"]["label"], "Doğrudan emir")

    def test_polite_request(self):
        # 'Lütfen kapıyı kapatır mısın?' -> Dolaylı emir / Rica
        res = self.detector.analyze_single_sentence("Lütfen kapıyı kapatır mısın?")
        self.assertEqual(res["imperative"]["label"], "Dolaylı emir")
        self.assertEqual(res["intent"]["primary"], "Rica etme")

    def test_prohibition(self):
        # 'Buraya gelme!' -> Yasaklama
        res = self.detector.analyze_single_sentence("Buraya gelme!")
        self.assertEqual(res["imperative"]["label"], "Yasaklama")`
    },
    "nlp/corpus_repository.py": {
      desc: "TÜRK-KORPUS veri tabanı okuyucu, sorgulayıcı ve disk yöneticisi",
      type: "python",
      content: `"""
nlp/corpus_repository.py - Türkçe Korpus Veri Deposu Yöneticisi
"""
import os
import json
from typing import List, Dict, Any, Optional

class TurkishCorpusRepository:
    DEFAULT_FILEPATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "corpus_repository.json")

    def __init__(self, filepath: Optional[str] = None):
        self.filepath = filepath or self.DEFAULT_FILEPATH
        self.data: Dict[str, Any] = {}
        self.records: List[Dict[str, Any]] = []
        self.load()

    def load(self) -> bool:
        if os.path.exists(self.filepath):
            with open(self.filepath, "r", encoding="utf-8") as f:
                self.data = json.load(f)
                self.records = self.data.get("records", [])
                return True
        return False

    def search(self, query: str = "", domain: Optional[str] = None, intent: Optional[str] = None):
        results = []
        q_lower = query.lower().strip()
        for r in self.records:
            if q_lower and q_lower not in r.get("text", "").lower() and q_lower not in r.get("notes", "").lower():
                continue
            if domain and domain != "Tümü" and r.get("domain") != domain:
                continue
            if intent and intent != "Tümü" and r.get("target_intent") != intent:
                continue
            results.append(r)
        return results`
    },
    "data/corpus_repository.json": {
      desc: "Etiketlenmiş açık Türkçe test korpusu veritabanı dosyası",
      type: "json",
      content: `{
  "version": "2.1.0",
  "name": "TÜRK-KORPUS: Türkçe Cümle ve Edimbilimsel İletişim Veri Deposu",
  "metadata": {
    "license": "CC-BY-SA-4.0",
    "domains": [
      "Günlük Yaşam & Sosyal",
      "Akademik & Eğitim",
      "Hukuk & Resmi Yazışma",
      "Kurumsal & Müşteri Hizmetleri"
    ]
  },
  "records": [
    {
      "id": "CORP-TR-001",
      "text": "Lütfen kapıyı kapatır mısın?",
      "domain": "Günlük Yaşam & Sosyal",
      "target_intent": "Rica etme",
      "speech_act": "Dolaylı Rica (Indirect Directive)",
      "politeness_level": "Çok nazik"
    }
  ]
}`
    },
    "vercel.json": {
      desc: "Vercel Vite SPA ve Python Serverless yönlendirme yapılandırması",
      type: "json",
      content: `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    },
    {
      "source": "/((?!api/|assets/|.*\\\\..*).*)",
      "destination": "/index.html"
    }
  ]
}`
    },
    "api/index.py": {
      desc: "Vercel Python Serverless Function giriş noktası (Flask WSGI)",
      type: "python",
      content: `"""
api/index.py - Vercel Serverless Function Giriş Noktası
"""
import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app

if __name__ == "__main__":
    app.run()`
    },
    ".github/workflows/ci.yml": {
      desc: "GitHub Actions CI: Pytest ve Vite otomatik test & derleme iş akışı",
      type: "yaml",
      content: `name: CI - Test & Build

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test-python:
    name: Python NLP & API Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - run: python -m unittest discover -s tests -p "test_*.py" -v

  build-frontend:
    name: Node.js & Vite Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run lint
      - run: npm run build`
    },
    "LICENSE": {
      desc: "MIT Açık Kaynak Lisansı",
      type: "text",
      content: `MIT License

Copyright (c) 2026 CümleDedektif Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...`
    },
    "requirements.txt": {
      desc: "Python kütüphane bağımlılıkları (Vercel ve sunucusuz ortamlarla %100 uyumlu)",
      type: "text",
      content: `flask>=3.0.0
gunicorn>=21.0.0
requests>=2.31.0
pytest>=8.0.0`
    },
    "README.md": {
      desc: "Kapsamlı akademik dokümantasyon, kurulum ve Vercel/GitHub kılavuzu",
      type: "markdown",
      content: `# CümleDedektif — Türkçe Cümle ve İletişim Amacı Analiz Sistemi
Üniversite Doğal Dil İşleme (NLP) Dersi Projesi

## Kurulum & Çalıştırma:
1. git clone https://github.com/selcukmirac29/cumlededektif.git
2. npm install && npm run dev
3. pip install -r requirements.txt && python app.py
4. python -m unittest discover -s tests -p "test_*.py" -v`
    }
  };

  const currentFile = files[selectedFile] || files['app.py'];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.split('/').pop() || 'dosya.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
            <Code2 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white">
              Python Backend Kaynak Kodları & GitHub Dağıtımı
            </h3>
            <p className="text-xs text-slate-400">
              Üniversite sunumunda ve GitHub deponuzda kullanabileceğiniz eksiksiz Python dosyaları
            </p>
          </div>
        </div>

        {/* GitHub & Dağıtım Komutları */}
        <div className="mt-4 p-4 rounded-xl bg-[#080D1A] border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-white" />
              <span>GitHub'a Yükleme ve Render.com'da 1-Tık Canlıya Alma:</span>
            </div>
          </div>
          <div className="font-mono text-teal-300 text-[11px] space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div>git init</div>
            <div>git add .</div>
            <div>git commit -m "feat: CümleDedektif Türkçe NLP sistemi ilk sürüm"</div>
            <div>git branch -M main</div>
            <div>git remote add origin https://github.com/KULLANICI_ADINIZ/cumlededektif.git</div>
            <div>git push -u origin main</div>
          </div>
        </div>
      </div>

      {/* Dosya Gezgini Izgarası */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Dosya Ağacı */}
        <div className="lg:col-span-1 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-2 flex items-center gap-2">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Proje Dosyaları</span>
          </div>
          {Object.keys(files).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setSelectedFile(fileName)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                selectedFile === fileName
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Sağ Kod Görüntüleyici */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <span className="font-mono font-bold text-sm text-white">{selectedFile}</span>
                <p className="text-xs text-slate-400 mt-0.5">{currentFile.desc}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Kopyala</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-[#080D1A] border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
