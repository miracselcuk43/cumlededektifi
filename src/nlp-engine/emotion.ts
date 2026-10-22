/**
 * src/nlp-engine/emotion.ts
 * Türkçe Duygu Analizi Motoru
 */

import { TurkishPreprocessor } from './preprocessing.ts';

export interface EmotionResult {
  label: string;
  confidence: number;
  explanation: string;
  clues: Array<{ word: string; emotion: string; reason: string }>;
  distribution: Record<string, number>;
  methodology: string;
}

export class EmotionAnalyzer {
  private static LEXICON: Record<string, Record<string, number>> = {
    mutlu: {
      "mutlu": 0.9, "mutluyum": 0.95, "sevinçli": 0.85, "harika": 0.9, "mükemmel": 0.92,
      "şahane": 0.88, "güzel": 0.65, "muhteşem": 0.9, "başarılı": 0.7, "tebrik": 0.8,
      "kutlarım": 0.8, "şükür": 0.65, "huzurlu": 0.75, "neşeli": 0.85, "coşkulu": 0.85,
      "seviyorum": 0.85, "sevdim": 0.8, "bayıldım": 0.9, "keyifli": 0.8, "gururluyum": 0.85
    },
    üzgün: {
      "üzgün": 0.9, "üzüldüm": 0.9, "hüzünlü": 0.85, "kederli": 0.9, "acı": 0.7,
      "ağladım": 0.85, "ağlamak": 0.8, "kırıldım": 0.8, "yalnızım": 0.75, "çaresiz": 0.85,
      "keşke": 0.6, "özledim": 0.65, "kaybettik": 0.8, "perişan": 0.85, "yıkıldım": 0.9,
      "pişmanım": 0.75, "mutsuz": 0.85, "mutsuzum": 0.9
    },
    öfkeli: {
      "öfkeli": 0.9, "kızgın": 0.85, "sinirlendirdi": 0.92, "sinir": 0.8, "çıldırtıcı": 0.9,
      "bıktım": 0.85, "sabrettim": 0.6, "nefret": 0.95, "rezalet": 0.9, "tahammül": 0.8,
      "yeter": 0.7, "haksızlık": 0.75, "saygısız": 0.85, "lanet": 0.9, "berbat": 0.8
    },
    korkmuş_endişeli: {
      "endişeli": 0.85, "korkuyorum": 0.9, "korktum": 0.9, "tedirgin": 0.8, "kaygılı": 0.85,
      "panik": 0.9, "ürperdim": 0.8, "telaş": 0.75, "korkunç": 0.7, "tehlike": 0.75,
      "ürkütücü": 0.8, "çekiniyorum": 0.7
    },
    şaşkın: {
      "şaşırdım": 0.9, "inanamıyorum": 0.92, "hayret": 0.85, "şaşkınım": 0.9, "sürpriz": 0.75,
      "beklemiyordum": 0.8, "donakaldım": 0.85, "akılalmaz": 0.85, "nasıl": 0.5
    }
  };

  private static BOOSTERS: Record<string, number> = {
    "çok": 1.35, "aşırı": 1.45, "fazlasıyla": 1.3, "son": 1.2, "derece": 1.15, "inanılmaz": 1.4, "müthiş": 1.3
  };

  private static DIMINISHERS: Record<string, number> = {
    "biraz": 0.65, "azıcık": 0.6, "kısmen": 0.7, "pek": 0.75
  };

  private static NEGATORS = new Set(["değil", "yok", "hiç", "asla"]);

  public analyze(sentence: string, punctuationFeatures: any): EmotionResult {
    const tokens = TurkishPreprocessor.tokenize(sentence);
    const cleanWords = TurkishPreprocessor.normalizeAndCleanTokens(tokens);

    const scores: Record<string, number> = {
      mutlu: 0.0,
      üzgün: 0.0,
      öfkeli: 0.0,
      korkmuş_endişeli: 0.0,
      şaşkın: 0.0,
    };
    const clues: Array<{ word: string; emotion: string; reason: string }> = [];

    for (let i = 0; i < cleanWords.length; i++) {
      const word = cleanWords[i];
      let multiplier = 1.0;
      let isNegated = false;

      if (i > 0) {
        const prev = cleanWords[i - 1];
        if (EmotionAnalyzer.BOOSTERS[prev]) {
          multiplier *= EmotionAnalyzer.BOOSTERS[prev];
        } else if (EmotionAnalyzer.DIMINISHERS[prev]) {
          multiplier *= EmotionAnalyzer.DIMINISHERS[prev];
        } else if (EmotionAnalyzer.NEGATORS.has(prev)) {
          isNegated = true;
        }
      }

      const stem = TurkishPreprocessor.extractStemHeuristic(word);

      for (const [emotion, lexDict] of Object.entries(EmotionAnalyzer.LEXICON)) {
        const matchVal = lexDict[word] ?? lexDict[stem];
        if (matchVal !== undefined) {
          const finalVal = matchVal * multiplier;
          if (isNegated) {
            if (emotion === "mutlu") {
              scores["üzgün"] += finalVal * 0.8;
              clues.push({ word: `${cleanWords[i-1]} ${word}`, emotion: "üzgün", reason: "Olumsuzluk belirteci olumlu anlamı tersine çevirdi" });
            } else {
              scores[emotion] = Math.max(0, scores[emotion] - finalVal * 0.5);
            }
          } else {
            scores[emotion] += finalVal;
            clues.push({ word, emotion, reason: `Doğrudan ${emotion} sözcüğü (ağırlık: ${matchVal.toFixed(2)})` });
          }
        }
      }
    }

    // İroni / Alaycılık Heuristiği
    let isIronic = false;
    let ironyConfidence = 0.0;
    let ironyReason = "";

    const hasPositive = cleanWords.some(w => EmotionAnalyzer.LEXICON.mutlu[w] !== undefined);
    const hasNegativeTail = cleanWords.some(w => ["mahvettin", "yine", "becerdin", "berbat", "güzel oldu", "aferin"].includes(w));

    if (punctuationFeatures.hasQuotes && hasPositive) {
      isIronic = true;
      ironyConfidence = 0.72;
      ironyReason = "Tırnak içine alınan olumlu ifade gizli imâ veya alaycılık (ironi) göstergesi olabilir.";
    } else if (cleanWords.includes("aferin") && (punctuationFeatures.hasExclamation || hasNegativeTail)) {
      isIronic = true;
      ironyConfidence = 0.81;
      ironyReason = "'Aferin' hitabı ve bağlamsal zıtlık sitem/alaycılık hissettirmektedir.";
    } else if (cleanWords.includes("süper") && cleanWords.some(w => ["kesildi", "bozuldu", "iptal", "bitti"].includes(w))) {
      isIronic = true;
      ironyConfidence = 0.85;
      ironyReason = "Olumlu niteleyici 'süper' ile olumsuz bir durum tezat oluşturmaktadır.";
    }

    if (punctuationFeatures.questionCount > 1 && punctuationFeatures.exclamationCount > 0) {
      scores["şaşkın"] += 0.45;
      clues.push({ word: "?! işareti", emotion: "şaşkın", reason: "Soru ve ünlem işaretinin birleşimi şaşkınlık ve tepki gösterir" });
    }

    let maxScore = 0.0;
    let detectedEmotion = "Nötr";

    const displayNames: Record<string, string> = {
      mutlu: "Mutlu / olumlu",
      üzgün: "Üzgün",
      öfkeli: "Öfkeli",
      korkmuş_endişeli: "Korkmuş / endişeli",
      şaşkın: "Şaşkın",
    };

    for (const [emo, val] of Object.entries(scores)) {
      if (val > maxScore) {
        maxScore = val;
        detectedEmotion = displayNames[emo];
      }
    }

    let confidence = 0.5;
    let explanation = "";

    if (isIronic) {
      confidence = ironyConfidence;
      explanation = ironyReason;
      detectedEmotion = "Alaycı veya ironi olasılığı";
    } else if (maxScore >= 0.6) {
      confidence = Math.min(0.96, 0.65 + (maxScore / 3.0) * 0.3);
      explanation = `Cümlede tespit edilen duygu belirteçleri '${detectedEmotion}' tonunu desteklemektedir.`;
    } else if (maxScore > 0.2) {
      confidence = 0.58;
      explanation = `Hafif düzeyde '${detectedEmotion}' eğilimi saptandı; bağlama göre nötr de yorumlanabilir.`;
    } else {
      detectedEmotion = "Nötr";
      confidence = cleanWords.length > 1 ? 0.88 : 0.50;
      explanation = "Cümlede belirgin duygusal kutup taşıyan yüklem ya da sıfat saptanmadı; ifade nesnel/durum bildirimi niteliğindedir.";
    }

    const distribution: Record<string, number> = {
      "Olumlu": parseFloat(Math.min(1.0, scores.mutlu).toFixed(2)),
      "Üzgün": parseFloat(Math.min(1.0, scores.üzgün).toFixed(2)),
      "Öfkeli": parseFloat(Math.min(1.0, scores.öfkeli).toFixed(2)),
      "Endişeli": parseFloat(Math.min(1.0, scores.korkmuş_endişeli).toFixed(2)),
      "Şaşkın": parseFloat(Math.min(1.0, scores.şaşkın).toFixed(2)),
      "Nötr": parseFloat((maxScore < 0.9 ? (1.0 - Math.min(0.9, maxScore)) : 0.05).toFixed(2)),
    };

    return {
      label: detectedEmotion,
      confidence: parseFloat(confidence.toFixed(2)),
      explanation,
      clues,
      distribution,
      methodology: "Sözcük ağırlıkları, pekiştirici/olumsuzluk bağlam pencereleri ve noktalama heuristikleri."
    };
  }
}
