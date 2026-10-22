/**
 * src/nlp-engine/structure.ts
 * Cümle Yapısı, Sözdizimsel Tip ve Morfolojik Özellikler
 */

import { TurkishPreprocessor } from './preprocessing.ts';
import { ImperativeResult } from './imperative.ts';

export interface StructureResult {
  sentenceType: string;
  polarity: string;
  negationEvidence: string[];
  pronouns: Array<{ word: string; type: string }>;
  vocatives: Array<{ word: string; type: string }>;
  punctuationSummary: string[];
  wordCount: number;
  characterCount: number;
  morphologyNote: string;
}

export class SentenceStructureAnalyzer {
  private static PRONOUNS: Record<string, string> = {
    "ben": "1. Tekil (Ben)",
    "sen": "2. Tekil (Sen)",
    "o": "3. Tekil (O)",
    "biz": "1. Çoğul (Biz)",
    "siz": "2. Çoğul (Siz - Saygı/Çoğulluk)",
    "onlar": "3. Çoğul (Onlar)",
    "bana": "1. Tekil Yönelme (Bana)",
    "sana": "2. Tekil Yönelme (Sana)",
    "ona": "3. Tekil Yönelme (Ona)",
    "bize": "1. Çoğul Yönelme (Bize)",
    "size": "2. Çoğul Yönelme (Size)",
    "onlara": "3. Çoğul Yönelme (Onlara)",
    "beni": "1. Tekil Belirtme (Beni)",
    "seni": "2. Tekil Belirtme (Seni)",
    "bizi": "1. Çoğul Belirtme (Bizi)",
    "sizi": "2. Çoğul Belirtme (Sizi)",
    "benim": "1. Tekil İyelik (Benim)",
    "senin": "2. Tekil İyelik (Senin)",
    "bizim": "1. Çoğul İyelik (Bizim)",
    "sizin": "2. Çoğul İyelik (Sizin)"
  };

  private static VOCATIVES: Record<string, string> = {
    "hocam": "Akademik / Saygı Hitabı",
    "efendim": "Nezaket Hitabı",
    "sayın": "Resmi Protokol Hitabı",
    "arkadaşlar": "Topluluk Hitabı",
    "kardeşim": "Samimi Hitap",
    "dostum": "Samimi Hitap",
    "canım": "Şefkat Hitabı",
    "öğretmenim": "Öğrenci Hitabı",
    "müdürüm": "Kurumsal Hitap",
    "bakar mısınız": "Seslenme / Dikkat Çekme"
  };

  private static NEGATION_MARKERS = ["değil", "yok", "hiç", "asla", "katiyen"];

  public analyze(sentence: string, imperativeInfo: ImperativeResult, punctuationFeatures: any): StructureResult {
    const raw = sentence.trim();
    const lower = TurkishPreprocessor.turkishLower(raw);
    const tokens = TurkishPreprocessor.tokenize(raw);
    const cleanWords = TurkishPreprocessor.normalizeAndCleanTokens(tokens);

    let isNegative = false;
    const negationEvidence: string[] = [];

    for (const neg of SentenceStructureAnalyzer.NEGATION_MARKERS) {
      if (cleanWords.includes(neg)) {
        isNegative = true;
        negationEvidence.push(`'${neg}' edatı/sözcüğü`);
      }
    }

    for (const w of cleanWords) {
      if (/(?:mıyor|miyor|muyor|müyor|maz|mez|madım|medim|madı|medi|mam|mem)$/.test(w)) {
        isNegative = true;
        negationEvidence.push(`'${w}' yükleminde fiil olumsuzluk eki`);
        break;
      }
    }

    if (imperativeInfo.label === "Yasaklama") {
      isNegative = true;
      negationEvidence.push("Yasaklayıcı olumsuz emir kipi");
    }

    const polarity = isNegative ? "Olumsuz" : "Olumlu";

    // Cümle Türü
    let sentenceType = "Bildirme";
    const hasQParticle = /\b(mı|mi|mu|mü|mısın|misin|misiniz|mısınız)\b/i.test(lower);

    if (punctuationFeatures.hasQuestionMark || hasQParticle) {
      sentenceType = "Soru";
    } else if (imperativeInfo.label === "Doğrudan emir" || imperativeInfo.label === "Yasaklama") {
      sentenceType = "Emir";
    } else if (punctuationFeatures.hasExclamation) {
      sentenceType = "Ünlem";
    } else {
      sentenceType = "Bildirme";
    }

    const pronouns: Array<{ word: string; type: string }> = [];
    for (const w of cleanWords) {
      if (SentenceStructureAnalyzer.PRONOUNS[w]) {
        pronouns.push({ word: w, type: SentenceStructureAnalyzer.PRONOUNS[w] });
      }
    }

    const vocatives: Array<{ word: string; type: string }> = [];
    for (const [voc, vocType] of Object.entries(SentenceStructureAnalyzer.VOCATIVES)) {
      if (lower.includes(voc)) {
        vocatives.push({ word: voc, type: vocType });
      }
    }

    const punctuationSummary: string[] = [];
    if (punctuationFeatures.hasQuestionMark) {
      punctuationSummary.push(`Soru işareti (?) x${punctuationFeatures.questionCount}`);
    }
    if (punctuationFeatures.hasExclamation) {
      punctuationSummary.push(`Ünlem işareti (!) x${punctuationFeatures.exclamationCount}`);
    }
    if (punctuationFeatures.hasEllipsis) {
      punctuationSummary.push("Üç nokta (...) - Eksiltili/duraksamalı anlatım");
    }
    if (punctuationFeatures.hasQuotes) {
      punctuationSummary.push("Tırnak işareti (\"...\") - Alıntı veya kinaye");
    }
    if (punctuationSummary.length === 0) {
      punctuationSummary.push("Nokta (.) - Standart cümle sonu");
    }

    const morphologyNote =
      "Türkçe sondan eklemeli (agglutinative) yapısı nedeniyle köke eklenen çekim ekleri sentaktik işlevi doğrudan tayin eder. Sistemimiz kök ayıklama ve soru kipi ayrıştırma ile yüksek duyarlılık sağlar.";

    return {
      sentenceType,
      polarity,
      negationEvidence,
      pronouns,
      vocatives,
      punctuationSummary,
      wordCount: cleanWords.length,
      characterCount: raw.length,
      morphologyNote
    };
  }
}
