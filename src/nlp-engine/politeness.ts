/**
 * src/nlp-engine/politeness.ts
 * Türkçe Nezaket ve Resmiyet Analiz Motoru
 */

import { TurkishPreprocessor } from './preprocessing.ts';
import { ImperativeResult } from './imperative.ts';

export interface PolitenessResult {
  label: string;
  score: number;
  confidence: number;
  explanation: string;
  clues: Array<{ word: string; impact: string; explanation: string }>;
}

export class PolitenessAnalyzer {
  private static VERY_POLITE_MARKERS: Record<string, number> = {
    "lütfen": 0.45,
    "zahmet olmazsa": 0.55,
    "mümkünse": 0.40,
    "rica etsem": 0.50,
    "istirham ederim": 0.60,
    "lütfeder misiniz": 0.65,
    "minnettarım": 0.45,
    "saygılarımla": 0.45,
    "hürmetler": 0.45
  };

  private static POLITE_MARKERS: Record<string, number> = {
    "rica ederim": 0.35,
    "teşekkür": 0.40,
    "teşekkürler": 0.35,
    "teşekkür ederim": 0.40,
    "sağol": 0.25,
    "sağolun": 0.30,
    "özür dilerim": 0.40,
    "kusura bakmayın": 0.35,
    "affedersiniz": 0.35,
    "acaba": 0.25,
    "memnun olurum": 0.35,
    "kolay gelsin": 0.30,
    "iyi günler": 0.30,
    "merhaba": 0.20,
    "efendim": 0.30,
    "sayın": 0.35
  };

  private static RUDE_MARKERS: Record<string, number> = {
    "defol": 0.85,
    "kes sesini": 0.90,
    "sus be": 0.85,
    "sus": 0.65,
    "cehennem": 0.70,
    "aptal": 0.85,
    "salak": 0.80,
    "ahmak": 0.75,
    "geri zekalı": 0.95,
    "terbiyesiz": 0.75,
    "lanet": 0.70,
    "bıktım senden": 0.75,
    "sen kimsin": 0.65,
    "çık dışarı": 0.65
  };

  public analyze(sentence: string, imperativeInfo: ImperativeResult, punctuationFeatures: any): PolitenessResult {
    const raw = sentence.trim();
    const lower = TurkishPreprocessor.turkishLower(raw);
    let score = 0.0;
    const clues: Array<{ word: string; impact: string; explanation: string }> = [];

    // 1. Kaba / Saldırgan kontrolü
    for (const [rude, weight] of Object.entries(PolitenessAnalyzer.RUDE_MARKERS)) {
      if (lower.includes(rude)) {
        score -= weight;
        clues.push({
          word: rude,
          impact: "Negatif / Kaba",
          explanation: `'${rude}' ifadesi saldırgan, aşağılayıcı veya kırıcı bir ton taşımaktadır.`
        });
      }
    }

    // 2. Çok nazik belirteçler
    for (const [marker, weight] of Object.entries(PolitenessAnalyzer.VERY_POLITE_MARKERS)) {
      if (lower.includes(marker)) {
        score += weight;
        clues.push({
          word: marker,
          impact: "Pozitif / Yüksek Nezaket",
          explanation: `'${marker}' kullanımı muhataba duyulan saygıyı ve yüksek nezaket düzeyini gösterir.`
        });
      }
    }

    // 3. Nazik belirteçler
    for (const [marker, weight] of Object.entries(PolitenessAnalyzer.POLITE_MARKERS)) {
      if (lower.includes(marker) && !clues.some(c => c.word.includes(marker))) {
        score += weight;
        clues.push({
          word: marker,
          impact: "Pozitif / Nazik",
          explanation: `'${marker}' ifadesi nezaketi ve sosyal uyumu destekler.`
        });
      }
    }

    // 4. Dolaylı rica ve -misiniz etkisi
    if (imperativeInfo.label === "Dolaylı emir") {
      if (lower.includes("misiniz") || lower.includes("mısınız")) {
        score += 0.40;
        clues.push({
          word: "çoğul/resmi soru kipi (-misiniz)",
          impact: "Pozitif / Saygılı Mesafe",
          explanation: "2. çoğul şahıs ekiyle sorulan rica nezaket ve saygı derecesini yükseltir."
        });
      } else {
        score += 0.25;
        clues.push({
          word: "dolaylı rica yapısı",
          impact: "Pozitif / Nezaket",
          explanation: "Emir vermek yerine soru kalıbı kullanarak yönlendirme yapmak nezaket göstergesidir."
        });
      }
    }

    // 5. Doğrudan emir etkisi
    if (imperativeInfo.label === "Doğrudan emir") {
      const hasSoftener = Object.keys(PolitenessAnalyzer.VERY_POLITE_MARKERS).some(m => lower.includes(m)) ||
        Object.keys(PolitenessAnalyzer.POLITE_MARKERS).some(m => lower.includes(m));
      if (!hasSoftener) {
        score -= 0.40;
        clues.push({
          word: "Çıplak emir yüklemi",
          impact: "Negatif / Buyurgan",
          explanation: "Nezaket veya rica eki bulunmayan doğrudan emir kipi buyurgan bir etki yaratır."
        });
      } else {
        clues.push({
          word: "Yumuşatılmış emir",
          impact: "Dengeli",
          explanation: "Doğrudan emir fiili nezaket belirteciyle ('lütfen') dengelenmiştir."
        });
      }
    }

    if (punctuationFeatures.isAllUppercase) {
      score -= 0.20;
      clues.push({ word: "TAMAMI BÜYÜK HARF", impact: "Negatif", explanation: "Bağırma/baskı tonu hissettirmektedir." });
    }

    let classification = "Nötr";
    let confidence = 0.85;
    let desc = "Cümle belirgin bir nezaket ya da kabalık ögesi içermemekte, nötr tonda bilgi aktarmaktadır.";

    if (score <= -0.5) {
      classification = "Kaba / saldırgan";
      confidence = 0.90;
      desc = "Cümle açık veya örtük saygısızlık, hakaret veya aşağılama tonu barındırmaktadır.";
    } else if (score <= -0.2) {
      classification = "Buyurgan";
      confidence = 0.86;
      desc = "Cümle nezaket yumuşatıcısı içermeyen, kestirme ve buyurucu bir emir tonuna sahiptir.";
    } else if (score >= 0.6) {
      classification = "Çok nazik";
      confidence = 0.92;
      desc = "Cümle birden fazla saygı belirteci, resmiyet ve yüksek nezaket ifadesi içermektedir.";
    } else if (score >= 0.2) {
      classification = "Nazik";
      confidence = 0.88;
      desc = "Cümle toplumsal nezaket kalıplarına ve saygılı rica diline uygundur.";
    }

    return {
      label: classification,
      score: parseFloat(Math.max(-1.0, Math.min(1.0, score)).toFixed(2)),
      confidence,
      explanation: desc,
      clues
    };
  }
}
