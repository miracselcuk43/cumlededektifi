"""
app.py
CümleDedektif - Flask Web & API Uygulaması
Türkçe Cümle ve İletişim Amacı Analiz Sistemi
"""

import os
from flask import Flask, request, jsonify, render_template, send_from_directory
from nlp.analyzer import TurkishSentenceDetector
from nlp.word2vec_model import TurkishWord2VecModel
from nlp.corpus_repository import TurkishCorpusRepository

app = Flask(__name__, static_folder="static", template_folder="templates")

# NLP Motorunu ve Korpus Deposunu başlat
detector = TurkishSentenceDetector()
w2v_model = detector.w2v
corpus_repo = TurkishCorpusRepository()

# Hazır Örnek Cümleler Koleksiyonu (8 Kategori)
SAMPLE_CATEGORIES = {
    "Günlük konuşma": [
        "Lütfen kapıyı kapatır mısın?",
        "Bugün hava gerçekten çok güzel.",
        "Yarın saat kaçta buluşacağız?",
        "Biraz yorgunum ama yine de mutluyum."
    ],
    "İş hayatı": [
        "Lütfen çeyrek sonu finansal raporunu mesai bitimine kadar iletir misiniz?",
        "Toplantı odası üçüncü katta saat on dörtte hazır olacak.",
        "Önce sunumu güncelleyin, ardından yönetim kuruluna sununuz.",
        "Bu projenin bütçesini onaylamamız mümkün mü?"
    ],
    "Öğretmen ve öğrenci iletişimi": [
        "Hocam, ödev teslim tarihini bir gün uzatabilir misiniz?",
        "Ödevlerinizi cuma gününe kadar sisteme yükleyin.",
        "Dersi dikkatlice dinleyin ve not almayı unutmayın.",
        "Sınav sonuçlarını kütüphanedeki panoda ilan ettim."
    ],
    "Müşteri hizmetleri": [
        "Satın aldığım ürün bozuk çıktı, derhal iade talep ediyorum!",
        "Talebiniz alınmıştır, size en kısa sürede geri dönüş yapacağız.",
        "Bu kadar kalitesiz bir hizmeti asla kabul etmiyorum.",
        "Yardımcı olabileceğim başka bir konu var mıdır acaba?"
    ],
    "Aile ve arkadaş iletişimi": [
        "Canım arkadaşım, iyi ki doğdun ve iyi ki varsın!",
        "Akşam yemeğe bizimle gelir misin?",
        "Sana çok kırıldım, neden böyle davrandın?",
        "Her şey için teşekkür ederim, hakkını helal et."
    ],
    "Resmî yazışmalar": [
        "Bilgilerinize arz ve talep ederim.",
        "İlgili kanun maddesi uyarınca başvurunuz reddedilmiştir.",
        "Sayın Yetkili, kurumunuzdan belge talebinde bulunmaktayım.",
        "Evraklarınızı ivedilikle rektörlüğe teslim ediniz."
    ],
    "Emir ve talimat örnekleri": [
        "Kapıyı kapat.",
        "Buraya gelme!",
        "Önce formu doldur, sonra kaydet butonuna bas.",
        "Kes sesini ve derhal dışarı çık!"
    ],
    "Olumlu ve olumsuz duygu örnekleri": [
        "Bugün harika bir haber aldım, içim kıpır kıpır!",
        "Bu durum beni çok sinirlendirdi ve öfkelendirdi.",
        "Keşke her şey eskisi gibi olsa, içim çok acıyor.",
        "Aferin sana, her şeyi yine mahvettin!"
    ]
}


@app.route("/api/health", methods=["GET"])
def health_check():
    """Sistem sağlık kontrolü endpoint'i."""
    return jsonify({
        "status": "healthy",
        "service": "CümleDedektif NLP Engine",
        "version": "1.0.0",
        "word2vec_status": "active",
        "vocabulary_size": len(w2v_model.vectors)
    }), 200


@app.route("/api/examples", methods=["GET"])
def get_examples():
    """Kategorilere ayrılmış hazır Türkçe örnek cümleleri döndürür."""
    return jsonify({
        "status": "success",
        "categories": SAMPLE_CATEGORIES
    }), 200


@app.route("/api/analyze", methods=["POST"])
def analyze_sentence():
    """
    Tek bir cümlenin analizi:
    Body: {"sentence": "Lütfen kapıyı kapatır mısın?"}
    """
    data = request.get_json(silent=True) or {}
    sentence = data.get("sentence", "").strip()

    if not sentence:
        return jsonify({
            "error": True,
            "message": "Cümle boş olamaz. Lütfen analiz edilecek bir metin girin."
        }), 400

    if len(sentence) > 1000:
        return jsonify({
            "error": True,
            "message": "Girdi çok uzun. Tek cümle için maksimum sınır 1000 karakterdir."
        }), 400

    result = detector.analyze_single_sentence(sentence)
    return jsonify({
        "status": "success",
        "data": result
    }), 200


@app.route("/api/analyze-batch", methods=["POST"])
def analyze_batch_sentences():
    """
    Birden fazla cümlenin toplu analizi:
    Body: {"text": "Bugün hava güzel. Lütfen kapıyı kapatır mısın? Buraya gelme!"}
    """
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()

    if not text:
        return jsonify({
            "error": True,
            "message": "Metin boş olamaz."
        }), 400

    if len(text) > 5000:
        return jsonify({
            "error": True,
            "message": "Toplu metin sınırı 5000 karakterdir."
        }), 400

    batch_result = detector.analyze_batch(text)
    return jsonify({
        "status": "success",
        "data": batch_result
    }), 200


@app.route("/api/word2vec/similar", methods=["GET"])
def word2vec_similar():
    """
    Word2Vec kelime vektör benzerliği sorgulama:
    Query params: ?word=mutlu&top_k=5
    """
    word = request.args.get("word", "").strip()
    top_k = int(request.args.get("top_k", 5))

    if not word:
        return jsonify({"error": True, "message": "Kelime parametresi (word) gereklidir."}), 400

    neighbors = w2v_model.find_most_similar(word, top_k=top_k)
    vec = w2v_model.get_vector(word)

    return jsonify({
        "target_word": word,
        "has_embedding": vec is not None,
        "similar_words": [{"word": n[0], "similarity": n[1]} for n in neighbors],
        "model_info": w2v_model.get_info()
    }), 200


@app.route("/api/corpus", methods=["GET"])
def get_corpus():
    """Tüm korpus kayıtlarını ve veri deposu özetini döndürür."""
    domain = request.args.get("domain")
    intent = request.args.get("intent")
    query = request.args.get("q", "")
    records = corpus_repo.search(query=query, domain=domain, intent=intent)
    return jsonify({
        "status": "success",
        "count": len(records),
        "data": records,
        "stats": corpus_repo.get_stats()
    }), 200


@app.route("/api/corpus/stats", methods=["GET"])
def get_corpus_stats():
    """Korpus veri deposunun dilbilimsel istatistiklerini döndürür."""
    return jsonify({
        "status": "success",
        "stats": corpus_repo.get_stats()
    }), 200


@app.route("/api/corpus/add", methods=["POST"])
def add_corpus_record():
    """Kullanıcının depoya yeni etiketli cümle eklemesini sağlar."""
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": True, "message": "Cümle metni boş olamaz."}), 400
    
    domain = data.get("domain", "Günlük Yaşam & Sosyal")
    target_intent = data.get("target_intent", "Bilgi verme")
    politeness_level = data.get("politeness_level", "Nötr")
    notes = data.get("notes", "")
    difficulty = data.get("difficulty", "Orta")

    record = corpus_repo.add_record(
        text=text,
        domain=domain,
        target_intent=target_intent,
        politeness_level=politeness_level,
        notes=notes,
        difficulty=difficulty
    )
    return jsonify({
        "status": "success",
        "message": "Kayıt veri deposuna eklendi.",
        "record": record
    }), 201


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Statik web arayüzü sunucusu."""
    if path != "" and os.path.exists(os.path.join(app.static_folder or "", path)):
        return send_from_directory(app.static_folder or "", path)
    if os.path.exists("templates/index.html"):
        return render_template("index.html")
    return jsonify({"message": "CümleDedektif API Çevrimiçi."}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
