/**
 * src/nlp-engine/imperative.ts
 * Türkçe Emir, Yasaklama ve Talimat Analiz Motoru
 */

import { TurkishPreprocessor } from './preprocessing.ts';

export interface ImperativeResult {
  label: string;
  subType: string;
  confidence: number;
  explanation: string;
  clues: Array<{ word: string | string[]; role: string; detail: string }>;
}

export class ImperativeAnalyzer {
  private static IMPERATIVE_VERB_STEMS = new Set([
    "kapat", "aç", "gel", "git", "otur", "kalk", "dur", "sus", "yap",
    "yaz", "oku", "bak", "ver", "al", "gönder", "ilet", "dinle", "çık",
    "gir", "bırak", "hazırla", "çöz", "bitir", "başla", "ara", "koş"
  ]);

  private static IMPERATIVE_PLURAL_SUFFIXES = [
    "iniz", "ınız", "ünüz", "unuz", "yin", "yın", "yün", "yun", "in", "ın", "ün", "un"
  ];

  private static INSTRUCTION_MARKERS = new Set([
    "önce", "sonra", "ardından", "daha sonra", "ilk olarak", "adım", "aşama", "sırasıyla"
  ]);

  private static INDIRECT_PATTERNS = [
    /(?:kapat|yap|ver|al|gel|git|bak|aç|gönder|oku|yaz|yardım\s+et)(?:ır|ir|ur|ür|ar|er)\s+mısın/i,
    /(?:kapat|yap|ver|al|gel|git|bak|aç|gönder|oku|yaz|yardım\s+et)(?:ır|ir|ur|ür|ar|er)\s+misiniz/i,
    /(?:abilir|ebilir)\s+misiniz/i,
    /(?:abilir|ebilir)\s+misin/i,
    /(?:olur\s+mu)/i,
    /(?:mümkün\s+mü)/i,
  ];

  public analyze(sentence: string, punctuationFeatures: any): ImperativeResult {
    const raw = sentence.trim();
    const lower = TurkishPreprocessor.turkishLower(raw);
    const tokens = TurkishPreprocessor.tokenize(raw);
    const cleanWords = TurkishPreprocessor.normalizeAndCleanTokens(tokens);

    if (cleanWords.length === 0) {
      return {
        label: "Emir niteliği taşımayan ifade",
        subType: "Boş metin",
        confidence: 0.99,
        explanation: "Analiz edilecek yüklem veya eylem bulunamadı.",
        clues: []
      };
    }

    const clues: Array<{ word: string | string[]; role: string; detail: string }> = [];
    const lastWord = cleanWords[cleanWords.length - 1];
    const hasQuestion = punctuationFeatures.hasQuestionMark ||
      /\b(mı|mi|mu|mü|mısın|misin|musun|müsün|mısınız|misiniz)\b/i.test(lower);

    // 1. Dolaylı Emir / Yönlendirme Kontrolü
    let isIndirect = false;
    for (const pat of ImperativeAnalyzer.INDIRECT_PATTERNS) {
      const match = lower.match(pat);
      if (match) {
        isIndirect = true;
        clues.push({
          word: match[0],
          role: "Dolaylı Rica / Geniş Zaman Soru Kipi",
          detail: "Geniş zaman veya yeterlilik kipi soru ekiyle birleşerek dolaylı emir/rica işlevi görmektedir."
        });
        break;
      }
    }

    if (isIndirect || (hasQuestion && /(misin\?|mısın\?|misiniz\?|mısınız\?|misin|mısın|misiniz|mısınız)$/i.test(lower))) {
      return {
        label: "Dolaylı emir",
        subType: "Soru biçiminde rica / Dolaylı yönlendirme",
        confidence: 0.93,
        explanation: "Cümle biçimsel olarak soru yapısındadır ancak edimbilimsel (pragmatic) açıdan muhataptan bir eylemi gerçekleştirmesini bekleyen dolaylı bir ricadır.",
        clues
      };
    }

    // 2. Yasaklama Kontrolü
    let isProhibition = false;
    let prohibitionWord = "";

    for (let i = cleanWords.length - 1; i >= 0; i--) {
      const w = cleanWords[i];
      if (/(?:ma|me|mayın|meyin|mayınız|meyiniz)$/.test(w) && w.length > 4) {
        const stem = w.replace(/(?:ma|me|mayın|meyin|mayınız|meyiniz)$/, '');
        if (ImperativeAnalyzer.IMPERATIVE_VERB_STEMS.has(stem) || stem.length >= 2) {
          isProhibition = true;
          prohibitionWord = w;
          break;
        }
      }
    }

    if (cleanWords.includes("sakın") || cleanWords.includes("yasak")) {
      isProhibition = true;
      prohibitionWord = prohibitionWord || "sakın/yasak";
    }

    if (isProhibition && !hasQuestion) {
      clues.push({
        word: prohibitionWord,
        role: "Yasaklama Belirteci / Olumsuz Emir Eki",
        detail: "'-ma/-me' olumsuzluk ekiyle birleşen eylem muhatabın fiili yapmasını men etmektedir."
      });
      return {
        label: "Yasaklama",
        subType: "Olumsuz emir kipi",
        confidence: 0.94,
        explanation: `'${prohibitionWord}' ifadesi yasaklayıcı emir kipi içermekte ve eylemin yapılmasını men etmektedir.`,
        clues
      };
    }

    // 3. Talimat Kontrolü
    const hasSteps = cleanWords.some(w => ImperativeAnalyzer.INSTRUCTION_MARKERS.has(w)) || (sentence.includes(",") && cleanWords.length >= 4);
    const hasImperativeAnywhere = cleanWords.some(w => ImperativeAnalyzer.IMPERATIVE_VERB_STEMS.has(w));

    if (hasSteps && hasImperativeAnywhere && !hasQuestion) {
      clues.push({
        word: cleanWords.filter(w => ImperativeAnalyzer.INSTRUCTION_MARKERS.has(w) || ImperativeAnalyzer.IMPERATIVE_VERB_STEMS.has(w)),
        role: "Sıralı Adım ve Yönerge Belirteçleri",
        detail: "Cümle adım adım yapılması gereken bir işlem dizisi tarif etmektedir."
      });
      return {
        label: "Talimat",
        subType: "Prosedürel yönerge",
        confidence: 0.89,
        explanation: "Cümledeki ardışık eylemler veya sıralama bağlaçları yönerge/talimat amacını gösterir.",
        clues
      };
    }

    // 4. Doğrudan Emir Kontrolü
    let isDirectImperative = false;
    let targetVerb = "";

    if (ImperativeAnalyzer.IMPERATIVE_VERB_STEMS.has(lastWord)) {
      isDirectImperative = true;
      targetVerb = lastWord;
    } else {
      for (const suffix of ImperativeAnalyzer.IMPERATIVE_PLURAL_SUFFIXES) {
        if (lastWord.endsWith(suffix)) {
          const stem = lastWord.slice(0, -suffix.length);
          if (ImperativeAnalyzer.IMPERATIVE_VERB_STEMS.has(stem) || stem.length >= 2) {
            isDirectImperative = true;
            targetVerb = lastWord;
            break;
          }
        }
      }
    }

    if (cleanWords.length === 1 && ImperativeAnalyzer.IMPERATIVE_VERB_STEMS.has(cleanWords[0])) {
      isDirectImperative = true;
      targetVerb = cleanWords[0];
    }

    if (isDirectImperative && !hasQuestion) {
      clues.push({
        word: targetVerb,
        role: "Doğrudan Emir Yüklemi (2. Şahıs Emir Kipi)",
        detail: `'${targetVerb}' eylemi doğrudan muhataba yönelik çıplak emir kipi taşımaktadır.`
      });
      const hasPlease = cleanWords.includes("lütfen") || cleanWords.includes("mümkünse");
      const subType = hasPlease ? "Nezaketle yumuşatılmış doğrudan talep" : "Yalın doğrudan emir";
      const conf = hasPlease ? 0.88 : 0.95;

      return {
        label: "Doğrudan emir",
        subType,
        confidence: conf,
        explanation: `Yüklem olan '${targetVerb}' doğrudan emir kipi çekimindedir${hasPlease ? ' (lütfen ifadesiyle nezaket kazandırılmıştır)' : ''}.`,
        clues
      };
    }

    return {
      label: "Emir niteliği taşımayan ifade",
      subType: "Bildirme veya Yalın Soru",
      confidence: 0.92,
      explanation: "Cümle emir, buyruk veya doğrudan/dolaylı yönlendirme eki taşımamakta; durum ya da bilgi aktarımı yapmaktadır.",
      clues: []
    };
  }
}
