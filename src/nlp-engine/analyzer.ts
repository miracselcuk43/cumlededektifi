/**
 * src/nlp-engine/analyzer.ts
 * CümleDedektif TypeScript Analiz Orkestratörü
 */

import { TurkishPreprocessor } from './preprocessing.ts';
import { TurkishWord2VecModel, SimilarWord } from './word2vec.ts';
import { EmotionAnalyzer, EmotionResult } from './emotion.ts';
import { ImperativeAnalyzer, ImperativeResult } from './imperative.ts';
import { PolitenessAnalyzer, PolitenessResult } from './politeness.ts';
import { IntentAnalyzer, IntentResult } from './intent.ts';
import { SentenceStructureAnalyzer, StructureResult } from './structure.ts';

export interface LinguisticClue {
  type: 'imperative' | 'politeness' | 'emotion' | 'intent';
  category: string;
  target: string;
  role: string;
  detail: string;
}

export interface SentenceAnalysisResult {
  sentence: string;
  overallSummary: string;
  synthesisExplanation: string;
  emotion: EmotionResult;
  imperative: ImperativeResult;
  politeness: PolitenessResult;
  intent: IntentResult;
  structure: StructureResult;
  linguisticClues: LinguisticClue[];
  uncertainties: string[];
  word2vecSemanticVectors: Array<{
    word: string;
    hasEmbedding: boolean;
    similarWords: SimilarWord[];
  }>;
  metadata: {
    executionTimeMs: number;
    academicFramework: string;
  };
}

export class TurkishSentenceDetector {
  public w2v: TurkishWord2VecModel;
  private emotionEngine: EmotionAnalyzer;
  private imperativeEngine: ImperativeAnalyzer;
  private politenessEngine: PolitenessAnalyzer;
  private intentEngine: IntentAnalyzer;
  private structureEngine: SentenceStructureAnalyzer;

  constructor() {
    this.w2v = new TurkishWord2VecModel();
    this.emotionEngine = new EmotionAnalyzer();
    this.imperativeEngine = new ImperativeAnalyzer();
    this.politenessEngine = new PolitenessAnalyzer();
    this.intentEngine = new IntentAnalyzer();
    this.structureEngine = new SentenceStructureAnalyzer();
  }

  public analyzeSingleSentence(sentence: string): SentenceAnalysisResult {
    const startTime = performance.now();
    const raw = sentence.trim();

    const punctuationFeatures = TurkishPreprocessor.extractPunctuationFeatures(raw);
    const tokens = TurkishPreprocessor.tokenize(raw);
    const cleanWords = TurkishPreprocessor.normalizeAndCleanTokens(tokens);

    // 1. Emir Durumu
    const imperativeRes = this.imperativeEngine.analyze(raw, punctuationFeatures);

    // 2. Nezaket Durumu
    const politenessRes = this.politenessEngine.analyze(raw, imperativeRes, punctuationFeatures);

    // 3. Duygu Durumu
    const emotionRes = this.emotionEngine.analyze(raw, punctuationFeatures);

    // 4. İletişim Amacı
    const intentRes = this.intentEngine.analyze(raw, imperativeRes, emotionRes, punctuationFeatures);

    // 5. Cümle Yapısı
    const structureRes = this.structureEngine.analyze(raw, imperativeRes, punctuationFeatures);

    // 6. Word2Vec Anlamsal Vektörler
    const semanticVectors: Array<{ word: string; hasEmbedding: boolean; similarWords: SimilarWord[] }> = [];
    for (const word of cleanWords.slice(0, 6)) {
      const neighbors = this.w2v.findMostSimilar(word, 3);
      const vec = this.w2v.getVector(word);
      if (vec) {
        semanticVectors.push({
          word,
          hasEmbedding: true,
          similarWords: neighbors
        });
      }
    }

    // 7. Dilsel Kanıtlar
    const linguisticClues: LinguisticClue[] = [];

    for (const c of imperativeRes.clues) {
      linguisticClues.push({
        type: 'imperative',
        category: 'Emir / Kip',
        target: Array.isArray(c.word) ? c.word.join(', ') : c.word,
        role: c.role,
        detail: c.detail
      });
    }

    for (const c of politenessRes.clues) {
      linguisticClues.push({
        type: 'politeness',
        category: 'Nezaket',
        target: c.word,
        role: c.impact,
        detail: c.explanation
      });
    }

    for (const c of emotionRes.clues) {
      linguisticClues.push({
        type: 'emotion',
        category: 'Duygu',
        target: c.word,
        role: c.emotion,
        detail: c.reason
      });
    }

    for (const c of intentRes.matchedClues) {
      linguisticClues.push({
        type: 'intent',
        category: 'İletişim Amacı',
        target: c.phrase,
        role: c.intent,
        detail: c.reason
      });
    }

    // 8. Belirsizlikler (Uncertainty Analysis)
    const uncertainties: string[] = [];
    if (imperativeRes.label === "Dolaylı emir") {
      uncertainties.push("Cümle biçimsel olarak soru yapısındadır ancak pragmatik açıdan rica/yönlendirme işlevi görmektedir; samimiyet veya hiyerarşik bağlama göre algı değişebilir.");
    }
    if (emotionRes.label === "Alaycı veya ironi olasılığı") {
      uncertainties.push("İroni tespiti saf metin ortamında ses tonu ve yüz mimikleri olmaksızın yapılmıştır; bağlama göre gerçek bir takdir ifadesi de olabilir.");
    }
    if (politenessRes.label === "Nötr" && imperativeRes.label === "Doğrudan emir") {
      uncertainties.push("Kısa ve doğrudan emirler iş ortamında pratik talimat, samimi ilişkilerde doğal yönlendirme, resmi ortamda ise buyurgan algılanabilir.");
    }
    if (uncertainties.length === 0) {
      uncertainties.push("Cümle açık ve belirgin dilsel ipuçları taşımaktadır; çoklu yoruma açıklık düzeyi düşüktür.");
    }

    // 9. Bütünleşik Açıklama (Synthesis)
    const parts: string[] = [];
    const lower = raw.toLowerCase();
    if (lower.includes("lütfen")) {
      parts.push("“Lütfen” ifadesi nezaket gösterirken");
    } else if (lower.includes("yardımcı olabilir misiniz")) {
      parts.push("“yardımcı olabilir misiniz?” kalıbı saygılı rica tonu sağlarken");
    } else if (lower.includes("teşekkür")) {
      parts.push("“Teşekkür” ifadesi minnet ve nezaket göstergesi iken");
    }

    if (imperativeRes.label === "Dolaylı emir") {
      parts.push("soru kipi dolaylı rica/yönlendirme işlevi görür.");
    } else if (imperativeRes.label === "Doğrudan emir") {
      parts.push("doğrudan emir kipi talimatı muhataba buyruk olarak iletir.");
    } else if (imperativeRes.label === "Yasaklama") {
      parts.push("olumsuz emir kipi eylemin yapılmasını kesin olarak engeller.");
    } else {
      parts.push(`ifade '${emotionRes.label.toLowerCase()}' duygusuyla birleştirilmiş bir bildirim niteliğindedir.`);
    }

    const synthesisExplanation = parts.join(' ');
    const elapsed = parseFloat((performance.now() - startTime).toFixed(2));

    return {
      sentence: raw,
      overallSummary: intentRes.generalComment,
      synthesisExplanation,
      emotion: emotionRes,
      imperative: imperativeRes,
      politeness: politenessRes,
      intent: intentRes,
      structure: structureRes,
      linguisticClues,
      uncertainties,
      word2vecSemanticVectors: semanticVectors,
      metadata: {
        executionTimeMs: elapsed,
        academicFramework: "Austin & Searle Speech Act Theory + Turkish Agglutinative Morphology Heuristics + Word2Vec Embeddings"
      }
    };
  }

  public analyzeBatch(text: string): { sentenceCount: number; results: SentenceAnalysisResult[] } {
    const sentences = TurkishPreprocessor.splitSentences(text);
    const results = sentences.map(s => this.analyzeSingleSentence(s));
    return {
      sentenceCount: results.length,
      results
    };
  }
}
