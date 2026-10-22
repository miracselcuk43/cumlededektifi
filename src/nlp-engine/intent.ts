/**
 * src/nlp-engine/intent.ts
 * Türkçe İletişim Amacı ve Söz Eylemleri (Speech Acts) Analiz Motoru
 */

import { TurkishPreprocessor } from './preprocessing.ts';
import { ImperativeResult } from './imperative.ts';
import { EmotionResult } from './emotion.ts';

export interface IntentResult {
  primary: string;
  primaryConfidence: number;
  secondary: string | null;
  secondaryConfidence: number | null;
  allLabels: string[];
  generalComment: string;
  matchedClues: Array<{ phrase: string; intent: string; reason: string }>;
}

export class IntentAnalyzer {
  private static INTENT_RULES: Record<string, { keywords: string[]; baseScore: number }> = {
    "Teşekkür etme": {
      keywords: ["teşekkür", "teşekkürler", "sağol", "sağolun", "minnettarım", "eline sağlık", "ağzına sağlık", "eyvallah", "var ol"],
      baseScore: 0.95
    },
    "Özür dileme": {
      keywords: ["özür", "kusura bakma", "kusura bakmayın", "affedersiniz", "bağışlayın", "özür dilerim", "hakkını helal et"],
      baseScore: 0.95
    },
    "Tebrik etme": {
      keywords: ["tebrik", "tebrikler", "kutlarım", "helal olsun", "başarılar", "kutlu olsun", "maşallah"],
      baseScore: 0.92
    },
    "Uyarma": {
      keywords: ["dikkat", "sakın", "uyarı", "tehlike", "kaygan", "aman ha", "dikkatli ol", "tedbirli ol", "unutma"],
      baseScore: 0.90
    },
    "Tehdit etme": {
      keywords: ["görürsün sen", "hesabını soracağım", "pişman ederim", "gününü göstereceğim", "elimden çekeceğin var", "mahvederim"],
      baseScore: 0.92
    },
    "Şikâyet etme": {
      keywords: ["memnun kalmadım", "şikayetçiyim", "şikayet", "berbat", "rezalet", "bozuk", "mağdur", "hizmet alamadım", "çalışmıyor", "iade"],
      baseScore: 0.88
    },
    "Öneride bulunma": {
      keywords: ["bence", "tavsiye ederim", "öneririm", "iyi olur", "yapabiliriz", "denemelisin", "faydalı olur", "şöyle yapalım"],
      baseScore: 0.82
    },
    "Davet etme": {
      keywords: ["davet", "bekleriz", "bizimle gelir misin", "katılmak ister misin", "buyrun", "uğra", "çay içmeye gel"],
      baseScore: 0.85
    },
  };

  public analyze(
    sentence: string,
    imperativeInfo: ImperativeResult,
    emotionInfo: EmotionResult,
    punctuationFeatures: any
  ): IntentResult {
    const raw = sentence.trim();
    const lower = TurkishPreprocessor.turkishLower(raw);
    const intentScores: Record<string, number> = {};
    const matchedClues: Array<{ phrase: string; intent: string; reason: string }> = [];

    // 1. Kural tabanlı sözlük
    for (const [intentName, config] of Object.entries(IntentAnalyzer.INTENT_RULES)) {
      for (const kw of config.keywords) {
        if (lower.includes(kw)) {
          intentScores[intentName] = Math.max(intentScores[intentName] || 0, config.baseScore);
          matchedClues.push({
            phrase: kw,
            intent: intentName,
            reason: `'${kw}' anahtar kelimesi ${intentName.toLowerCase()} amacını doğrudan belirtir.`
          });
        }
      }
    }

    // 2. Yasaklama
    if (imperativeInfo.label === "Yasaklama") {
      intentScores["Yasaklama"] = 0.94;
      matchedClues.push({
        phrase: "olumsuz emir eki (-ma/-me)",
        intent: "Yasaklama",
        reason: "Fiilin olumsuz emir çekimi yasaklama işlevi görür."
      });
    }

    // 3. Talimat
    if (imperativeInfo.label === "Talimat") {
      intentScores["Talimat verme"] = 0.89;
      matchedClues.push({
        phrase: "ardışık adım / talimat akışı",
        intent: "Talimat verme",
        reason: "Eylemin yapılış sırasını belirten yönerge yapısı."
      });
    }

    // 4. Rica etme
    const isRequest = imperativeInfo.label === "Dolaylı emir" ||
      lower.includes("lütfen") ||
      lower.includes("rica") ||
      lower.includes("mümkünse") ||
      lower.includes("yardımcı olabilir misiniz") ||
      /(?:kapatır|yapar|gelir|verir|açar)\s+mısın/i.test(lower);

    if (isRequest) {
      intentScores["Rica etme"] = 0.93;
      matchedClues.push({
        phrase: "rica belirteci / soru kipiyle yumuşatma",
        intent: "Rica etme",
        reason: "Karşı taraftan bir eylemin nezaketle yapılmasını talep etme."
      });
    }

    // 5. Emir verme
    if (imperativeInfo.label === "Doğrudan emir" && !isRequest) {
      intentScores["Emir verme"] = 0.92;
      matchedClues.push({
        phrase: "2. şahıs doğrudan emir kipi",
        intent: "Emir verme",
        reason: "Doğrudan yönlendirici ve bağlayıcı buyruk ifadesi."
      });
    }

    // 6. Soru sorma
    const hasQuestion = punctuationFeatures.hasQuestionMark ||
      /\b(mı|mi|mu|mü|kim|ne|nerede|nasıl|niçin|neden|kaç|saat\s+kaçta)\b/i.test(lower);

    if (hasQuestion) {
      const qScore = (intentScores["Rica etme"] || intentScores["Davet etme"]) ? 0.70 : 0.90;
      intentScores["Soru sorma"] = qScore;
      matchedClues.push({
        phrase: "soru eki veya soru sözcüğü",
        intent: "Soru sorma",
        reason: "Muhataptan bilgi talep etme veya netleştirme amacı."
      });
    }

    // 7. Duygusal ifade
    if (["Mutlu / olumlu", "Üzgün", "Öfkeli", "Korkmuş / endişeli", "Şaşkın"].includes(emotionInfo.label) && emotionInfo.confidence >= 0.70) {
      intentScores["Duygusal ifade"] = 0.85;
      matchedClues.push({
        phrase: "yoğun duygu yüklemi",
        intent: "Duygusal ifade",
        reason: "Konuşucunun içsel ruh halini ve hislerini dışa vurması."
      });
    }

    // 8. Varsayılan: Bilgi verme
    if (Object.keys(intentScores).length === 0) {
      intentScores["Bilgi verme"] = 0.88;
      matchedClues.push({
        phrase: "bildirme yüklemi",
        intent: "Bilgi verme",
        reason: "Nesnel bir olgu, haber veya durumu muhataba bildirme."
      });
    }

    const sortedIntents = Object.entries(intentScores).sort((a, b) => b[1] - a[1]);
    const primaryIntent = sortedIntents[0][0];
    const primaryConfidence = sortedIntents[0][1];

    let secondaryIntent: string | null = null;
    let secondaryConfidence: number | null = null;
    if (sortedIntents.length > 1 && sortedIntents[1][1] >= 0.65) {
      secondaryIntent = sortedIntents[1][0];
      secondaryConfidence = sortedIntents[1][1];
    }

    const allLabels = sortedIntents.filter(x => x[1] >= 0.65).map(x => x[0]);

    const intentExplanations: Record<string, string> = {
      "Rica etme": "Muhataptan bir isteğin nazik ve yönlendirici bir biçimde yerine getirilmesi talep edilmektedir.",
      "Emir verme": "Muhataba doğrudan bir talimat iletilmekte ve eylemi yapması buyurulmaktadır.",
      "Bilgi verme": "Herhangi bir yönlendirme yapmaksızın bir durum ya da olgu hakkında bilgi paylaşılmaktadır.",
      "Soru sorma": "Bir konu veya durum hakkında karşı taraftan bilgi veya teyit istenmektedir.",
      "Talimat verme": "Yapılması gereken bir işlem adım adım veya yönerge olarak tarif edilmektedir.",
      "Uyarma": "Olası bir olumsuzluk veya tehlikeye karşı dikkatli olunması salık verilmektedir.",
      "Tehdit etme": "Muhataba karşı gözdağı verilmekte veya yaptırım uygulanacağı ifade edilmektedir.",
      "Öneride bulunma": "Kişisel bir görüş veya faydalı olabilecek bir tavsiye sunulmaktadır.",
      "Teşekkür etme": "Yapılan bir iyilik veya yardımdan ötürü memnuniyet ve minnet bildirilmektedir.",
      "Özür dileme": "Oluşan bir kusur veya hatadan ötürü bağışlanma talep edilmektedir.",
      "Tebrik etme": "Elde edilen bir başarı veya mutluluk verici olay kutlanmaktadır.",
      "Şikâyet etme": "Bir ürün, hizmet veya durumdan duyulan memnuniyetsizlik dile getirilmektedir.",
      "Davet etme": "Birlikte bir etkinliğe veya mekâna katılma teklifi sunulmaktadır.",
      "Yasaklama": "Muhatabın belirli bir fiili gerçekleştirmesi kesin olarak men edilmektedir.",
      "Duygusal ifade": "Konuşucunun hissettiği yoğun duygulanım dile getirilmektedir."
    };

    const generalComment = intentExplanations[primaryIntent] || `Cümlenin ana gayesi ${primaryIntent.toLowerCase()} niteliğindedir.`;

    return {
      primary: primaryIntent,
      primaryConfidence: parseFloat(primaryConfidence.toFixed(2)),
      secondary: secondaryIntent,
      secondaryConfidence: secondaryConfidence ? parseFloat(secondaryConfidence.toFixed(2)) : null,
      allLabels,
      generalComment,
      matchedClues
    };
  }
}
