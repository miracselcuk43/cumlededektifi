/**
 * src/nlp-engine/preprocessing.ts
 * Türkçe Metin Ön İşleme, Tokenizasyon ve Kök Heuristikleri
 */

export class TurkishPreprocessor {
  private static TR_LOWER_MAP: Record<string, string> = {
    'İ': 'i', 'I': 'ı', 'Ğ': 'ğ', 'Ü': 'ü', 'Ş': 'ş', 'Ö': 'ö', 'Ç': 'ç'
  };

  private static TR_UPPER_MAP: Record<string, string> = {
    'i': 'İ', 'ı': 'I', 'ğ': 'Ğ', 'ü': 'Ü', 'ş': 'Ş', 'ö': 'Ö', 'ç': 'Ç'
  };

  public static turkishLower(text: string): string {
    if (!text) return '';
    return text.replace(/[İIĞÜŞÖÇ]/g, ch => this.TR_LOWER_MAP[ch] || ch).toLowerCase();
  }

  public static turkishUpper(text: string): string {
    if (!text) return '';
    return text.replace(/[iığüşöç]/g, ch => this.TR_UPPER_MAP[ch] || ch).toUpperCase();
  }

  public static splitSentences(text: string): string[] {
    if (!text || !text.trim()) return [];
    const cleaned = text.trim();
    const pattern = /(?<=[.!?…])\s+(?=[A-ZÇĞİÖŞÜa-zçğıöşü0-9"'“‘])/;
    const parts = cleaned.split(pattern);
    return parts.map(s => s.trim()).filter(Boolean);
  }

  public static tokenize(sentence: string): string[] {
    if (!sentence) return [];
    const matches = sentence.match(/[A-Za-zÇĞİÖŞÜçğıöşü]+|[.,!?:;…"'“‘]+/g);
    return matches || [];
  }

  public static normalizeAndCleanTokens(tokens: string[]): string[] {
    const words: string[] = [];
    for (const tok of tokens) {
      const lowerTok = this.turkishLower(tok);
      const cleanWord = lowerTok.replace(/[^a-zçğıöşü]/g, '');
      if (cleanWord) {
        words.push(cleanWord);
      }
    }
    return words;
  }

  public static extractPunctuationFeatures(sentence: string) {
    const lower = this.turkishLower(sentence);
    return {
      hasQuestionMark: sentence.includes('?'),
      questionCount: (sentence.match(/\?/g) || []).length,
      hasExclamation: sentence.includes('!'),
      exclamationCount: (sentence.match(/!/g) || []).length,
      hasEllipsis: sentence.includes('...') || sentence.includes('…'),
      hasQuotes: sentence.includes('"') || sentence.includes('“') || sentence.includes("'"),
      isAllUppercase: sentence.length > 4 && sentence === sentence.toUpperCase() && /[A-ZÇĞİÖŞÜ]/.test(sentence),
      elongatedVowels: /([aeıioöuü])\1{2,}/.test(lower),
    };
  }

  public static extractStemHeuristic(word: string): string {
    let w = this.turkishLower(word);
    if (w.length <= 3) return w;

    if (w.endsWith('ler') || w.endsWith('lar')) {
      w = w.slice(0, -3);
    }
    if (w.length <= 3) return w;

    const possessive = ['imiz', 'ımız', 'ümüz', 'umuz', 'iniz', 'ınız', 'ünüz', 'unuz', 'leri', 'ları'];
    for (const sfx of possessive) {
      if (w.endsWith(sfx)) {
        w = w.slice(0, -sfx.length);
        break;
      }
    }
    if (w.length <= 3) return w;

    const cases = ['den', 'dan', 'ten', 'tan', 'de', 'da', 'te', 'ta', 'ye', 'ya', 'yi', 'yı', 'yu', 'yü'];
    for (const sfx of cases) {
      if (w.endsWith(sfx)) {
        w = w.slice(0, -sfx.length);
        break;
      }
    }
    return w;
  }
}
