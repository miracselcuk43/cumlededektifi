/**
 * src/nlp-engine/corpus-repository.ts
 * Türkçe Korpus Veri Deposu (Client-Side Storage & Search Engine)
 * Gerçek dosya/veri deposundan okur ve yerel depolama ile senkronize eder.
 */

export interface CorpusRecord {
  id: string;
  text: string;
  domain: string;
  target_intent: string;
  speech_act: string;
  target_emotion: string;
  politeness_level: string;
  imperative_status: string;
  polarity: string;
  notes: string;
  difficulty: string;
}

export interface CorpusMetadata {
  created_by: string;
  license: string;
  total_records: number;
  domains: string[];
}

export const INITIAL_CORPUS_RECORDS: CorpusRecord[] = [
  {
    id: "CORP-TR-001",
    text: "Lütfen kapıyı kapatır mısın?",
    domain: "Günlük Yaşam & Sosyal",
    target_intent: "Rica etme",
    speech_act: "Dolaylı Rica (Indirect Directive)",
    target_emotion: "Nötr",
    politeness_level: "Çok nazik",
    imperative_status: "Dolaylı emir",
    polarity: "Olumlu",
    notes: "Geniş zaman soru kipiyle muhatabın negatif yüzü korunmuştur (Brown & Levinson).",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-002",
    text: "Kapıyı kapat.",
    domain: "Günlük Yaşam & Sosyal",
    target_intent: "Emir verme",
    speech_act: "Doğrudan Emir (Direct Directive)",
    target_emotion: "Nötr",
    politeness_level: "Buyurgan",
    imperative_status: "Doğrudan emir",
    polarity: "Olumlu",
    notes: "2. tekil çıplak emir kipi; mesafe yokluğu durumunda buyurgan algılanır.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-003",
    text: "Buraya kesinlikle gelme!",
    domain: "Günlük Yaşam & Sosyal",
    target_intent: "Yasaklama",
    speech_act: "Yasaklama (Prohibition)",
    target_emotion: "Öfkeli",
    politeness_level: "Kaba / saldırgan",
    imperative_status: "Yasaklama",
    polarity: "Olumsuz",
    notes: "'-me' olumsuzluk eki + ünlem + kesinlik belirteci.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-004",
    text: "Bana yardımcı olabilir misiniz?",
    domain: "Kurumsal & Müşteri Hizmetleri",
    target_intent: "Rica etme",
    speech_act: "Nazik Talep (Polite Inquiry)",
    target_emotion: "Nötr",
    politeness_level: "Nazik",
    imperative_status: "Dolaylı emir",
    polarity: "Olumlu",
    notes: "Yeterlilik kipi (-ebil) ve 2. çoğul şahıs eki (-siniz) ile saygılı resmiyet.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-005",
    text: "Bugün sınavı kazandığım için o kadar çok mutluyum ki anlatamam!",
    domain: "Akademik & Eğitim",
    target_intent: "Duygusal ifade",
    speech_act: "Dışavurum (Expressive)",
    target_emotion: "Mutlu / olumlu",
    politeness_level: "Nötr",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "Yüksek uyarılmışlık (high arousal) ve pozitif kutupluluk taşıyan yüklem.",
    difficulty: "Orta"
  },
  {
    id: "CORP-TR-006",
    text: "Bu sorumsuz tavrınız beni gerçekten çok sinirlendirdi.",
    domain: "Kurumsal & Müşteri Hizmetleri",
    target_intent: "Şikâyet etme",
    speech_act: "Şikâyet & Dışavurum (Complaint)",
    target_emotion: "Öfkeli",
    politeness_level: "Nötr",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "Öfke sözlük kökü ('sinirlendirdi') pekiştirici 'çok' ile desteklenmiştir.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-007",
    text: "Yarınki seminer tam olarak saat kaçta başlayacak?",
    domain: "Akademik & Eğitim",
    target_intent: "Soru sorma",
    speech_act: "Bilgi İstemi (Information Request)",
    target_emotion: "Nötr",
    politeness_level: "Nötr",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "Yalın soru sözcüğü ('kaçta') ile oluşturulmuş nesnel bilgi istemi.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-008",
    text: "Zor zamanımda bana vakit ayırdığınız ve destek olduğunuz için gönülden teşekkür ederim.",
    domain: "Günlük Yaşam & Sosyal",
    target_intent: "Teşekkür etme",
    speech_act: "Teşekkür & Minnet (Gratitude)",
    target_emotion: "Mutlu / olumlu",
    politeness_level: "Çok nazik",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "'Gönülden teşekkür ederim' bileşik yapısı yüksek nezaket ve olumlu ton taşır.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-009",
    text: "Meteoroloji raporuna göre yarın öğleden sonra hava güneşli olacak.",
    domain: "Günlük Yaşam & Sosyal",
    target_intent: "Bilgi verme",
    speech_act: "Bildirim (Representative / Assertive)",
    target_emotion: "Nötr",
    politeness_level: "Nötr",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "Duygusuz, emir içermeyen standart üçüncü şahıs nesnel durum cümlesi.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-010",
    text: "Aferin sana, bütün projeyi tek bir gecede mahvetmeyi başardın!",
    domain: "Sokak & Samimi Diyalog",
    target_intent: "Şikâyet etme",
    speech_act: "İroni & Sitem (Sarcastic Criticism)",
    target_emotion: "Alaycı veya ironi olasılığı",
    politeness_level: "Kaba / saldırgan",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "Olumlu hitap ('Aferin') ile olumsuz yüklem ('mahvetmeyi başardın') arasındaki pragmatik tezat.",
    difficulty: "Zor"
  },
  {
    id: "CORP-TR-011",
    text: "Önce başvuru formunu doldurun, ardından ekli belgeleri sisteme yükleyiniz.",
    domain: "Hukuk & Resmi Yazışma",
    target_intent: "Talimat verme",
    speech_act: "Yönerge (Instruction)",
    target_emotion: "Nötr",
    politeness_level: "Nazik",
    imperative_status: "Talimat",
    polarity: "Olumlu",
    notes: "Sıralı işlem bağlaçları ('önce', 'ardından') + saygılı emir eki (-iniz).",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-012",
    text: "Hocam, yüksek lisans tez teslim tarihini bir hafta uzatmamız mümkün olabilir mi?",
    domain: "Akademik & Eğitim",
    target_intent: "Rica etme",
    speech_act: "Hiyerarşik Rica (Academic Request)",
    target_emotion: "Nötr",
    politeness_level: "Çok nazik",
    imperative_status: "Dolaylı emir",
    polarity: "Olumlu",
    notes: "Akademik hitap ('Hocam') + modalite ('mümkün olabilir mi') ile azami saygı mesafesi.",
    difficulty: "Orta"
  },
  {
    id: "CORP-TR-013",
    text: "Dikkat et, yerler yeni paspaslandı ve zemin aşırı kaygan!",
    domain: "Günlük Yaşam & Sosyal",
    target_intent: "Uyarma",
    speech_act: "İkaz (Warning)",
    target_emotion: "Korkmuş / endişeli",
    politeness_level: "Nötr",
    imperative_status: "Talimat",
    polarity: "Olumlu",
    notes: "'Dikkat et' uyarısı muhatabı olası bir tehlikeden koruma amaçlıdır.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-014",
    text: "Eğer bu belgeyi teslim etmezseniz sonucuna katlanırsınız, görürsün sen!",
    domain: "Sokak & Samimi Diyalog",
    target_intent: "Tehdit etme",
    speech_act: "Gözdağı (Threat)",
    target_emotion: "Öfkeli",
    politeness_level: "Kaba / saldırgan",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumsuz",
    notes: "'Görürsün sen' deyimsel tehdit kalıbı ve şart kipiyle açık gözdağı.",
    difficulty: "Orta"
  },
  {
    id: "CORP-TR-015",
    text: "Bence bu algoritmayı Python yerine C++ ile yazarsak bellek tüketimini ciddi oranda düşürürüz.",
    domain: "Akademik & Eğitim",
    target_intent: "Öneride bulunma",
    speech_act: "Öneri / Tavsiye (Suggestion)",
    target_emotion: "Nötr",
    politeness_level: "Nazik",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "'Bence' öznel niteleyicisi + şart kipiyle yapıcı teknik tavsiye.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-016",
    text: "İstemeden de olsa sizi beklettiğim ve toplantıyı aksattığım için en içten özürlerimi dilerim.",
    domain: "Hukuk & Resmi Yazışma",
    target_intent: "Özür dileme",
    speech_act: "Özür (Apology)",
    target_emotion: "Üzgün",
    politeness_level: "Çok nazik",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "'En içten özürlerimi dilerim' resmi protokol özür yapısıdır.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-017",
    text: "TÜBİTAK yarışmasında birincilik ödülünü kazandığınızı öğrendim, sizi ve ekibinizi yürekten kutlarım!",
    domain: "Akademik & Eğitim",
    target_intent: "Tebrik etme",
    speech_act: "Kutlama (Congratulation)",
    target_emotion: "Mutlu / olumlu",
    politeness_level: "Çok nazik",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "'Yürekten kutlarım' ifadesi yüksek onay ve pozitif duygu taşır.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-018",
    text: "Üç hafta önce verdiğim sipariş hala kargoya verilmedi ve çağrı merkeziniz telefonları açmıyor, derhal paramı iade edin!",
    domain: "Kurumsal & Müşteri Hizmetleri",
    target_intent: "Şikâyet etme",
    speech_act: "Şikâyet ve Sert Talep (Aggressive Claim)",
    target_emotion: "Öfkeli",
    politeness_level: "Buyurgan",
    imperative_status: "Doğrudan emir",
    polarity: "Olumsuz",
    notes: "Hizmet kusuru şikayeti ile 'derhal iade edin' doğrudan buyruğu birleşmiştir.",
    difficulty: "Orta"
  },
  {
    id: "CORP-TR-019",
    text: "Bu hafta sonu bizimle birlikte doğa yürüyüşüne gelmek ister misin?",
    domain: "Günlük Yaşam & Sosyal",
    target_intent: "Davet etme",
    speech_act: "Davet (Invitation)",
    target_emotion: "Mutlu / olumlu",
    politeness_level: "Nazik",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumlu",
    notes: "Geniş zaman soru kalıbı 'ister misin?' sosyal davet işlevi görür.",
    difficulty: "Kolay"
  },
  {
    id: "CORP-TR-020",
    text: "Keşke o gün seninle tartışmak yerine sakin kalabilseydim, içimdeki vicdan azabı hiç dinmiyor.",
    domain: "Edebi & Duygusal",
    target_intent: "Duygusal ifade",
    speech_act: "Pişmanlık & İtiraf (Regret)",
    target_emotion: "Üzgün",
    politeness_level: "Nötr",
    imperative_status: "Emir niteliği taşımayan ifade",
    polarity: "Olumsuz",
    notes: "'Keşke' dilek şartı ve 'vicdan azabı' keder/üzüntü kutbunu belirler.",
    difficulty: "Orta"
  }
];

const STORAGE_KEY = "cumlededektif_corpus_records";

export class ClientCorpusRepository {
  private records: CorpusRecord[] = [];
  private isLoadedFromRemote = false;

  constructor() {
    this.loadFromStorage();
    // Tarayıcı ortamında varsa public/data/corpus-repository.json dosyasından depoyu çek
    this.loadFromRemoteFile();
  }

  private async loadFromRemoteFile() {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    try {
      const res = await fetch('/data/corpus-repository.json');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.records) && data.records.length > 0) {
          // Depodaki yeni kayıtları yerel depolama ile birleştir (ID bazlı tekleştir)
          const existingIds = new Set(this.records.map(r => r.id));
          let added = false;
          for (const item of data.records) {
            if (!existingIds.has(item.id)) {
              this.records.push(item);
              existingIds.add(item.id);
              added = true;
            }
          }
          if (added) {
            this.saveToStorage();
          }
          this.isLoadedFromRemote = true;
        }
      }
    } catch {
      // Çevrimdışı veya dosya erişilemezse yerel depodan devam et
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.records = JSON.parse(stored);
      } else {
        this.records = [...INITIAL_CORPUS_RECORDS];
        this.saveToStorage();
      }
    } catch {
      this.records = [...INITIAL_CORPUS_RECORDS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch {
      // ignore
    }
  }

  public getAll(): CorpusRecord[] {
    return [...this.records];
  }

  public getById(id: string): CorpusRecord | undefined {
    return this.records.find(r => r.id === id);
  }

  public search(query: string, domain?: string, intent?: string): CorpusRecord[] {
    const q = query.toLowerCase().trim();
    return this.records.filter(r => {
      if (q) {
        const textMatch = r.text.toLowerCase().includes(q);
        const noteMatch = r.notes.toLowerCase().includes(q);
        const idMatch = r.id.toLowerCase().includes(q);
        if (!textMatch && !noteMatch && !idMatch) return false;
      }
      if (domain && domain !== 'Tümü' && r.domain !== domain) return false;
      if (intent && intent !== 'Tümü' && r.target_intent !== intent) return false;
      return true;
    });
  }

  /**
   * Girilen cümlenin depodaki en yakın referans cümleyle benzerliğini hesaplar (Jaccard + Levenshtein)
   */
  public findNearestSentence(text: string): { record: CorpusRecord; score: number } | null {
    if (!text || !text.trim() || this.records.length === 0) return null;
    const cleanInput = text.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    const inputWords = new Set(cleanInput.split(/\s+/).filter(Boolean));

    let bestRecord: CorpusRecord | null = null;
    let bestScore = 0;

    for (const rec of this.records) {
      const cleanRec = rec.text.toLowerCase().replace(/[.,!?;:]/g, '').trim();
      if (cleanInput === cleanRec) {
        return { record: rec, score: 1.0 };
      }

      const recWords = new Set(cleanRec.split(/\s+/).filter(Boolean));
      // Jaccard similarity
      let intersection = 0;
      inputWords.forEach(w => {
        if (recWords.has(w)) intersection++;
      });
      const union = new Set([...inputWords, ...recWords]).size;
      const jaccard = union > 0 ? intersection / union : 0;

      if (jaccard > bestScore) {
        bestScore = jaccard;
        bestRecord = rec;
      }
    }

    if (bestRecord && bestScore >= 0.25) {
      return { record: bestRecord, score: parseFloat(bestScore.toFixed(2)) };
    }
    return null;
  }

  public add(record: Omit<CorpusRecord, 'id' | 'speech_act' | 'target_emotion' | 'imperative_status' | 'polarity'>): CorpusRecord {
    const id = `CORP-TR-${String(this.records.length + 1).padStart(3, '0')}`;
    const newRecord: CorpusRecord = {
      ...record,
      id,
      speech_act: `Araştırmacı Notu (${record.target_intent})`,
      target_emotion: "Nötr",
      imperative_status: "Kayıtlı",
      polarity: "Olumlu"
    };
    this.records.unshift(newRecord);
    this.saveToStorage();
    return newRecord;
  }

  public delete(id: string): boolean {
    const prevLen = this.records.length;
    this.records = this.records.filter(r => r.id !== id);
    if (this.records.length !== prevLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public resetToDefault() {
    this.records = [...INITIAL_CORPUS_RECORDS];
    this.saveToStorage();
    return this.records;
  }

  public exportJson(): string {
    return JSON.stringify({
      metadata: {
        exported_at: new Date().toISOString(),
        total_records: this.records.length,
        repository_source: "CümleDedektif Veri Deposu"
      },
      records: this.records
    }, null, 2);
  }

  public importJson(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      const incoming: CorpusRecord[] = Array.isArray(parsed) ? parsed : (parsed.records || []);
      if (!Array.isArray(incoming) || incoming.length === 0) {
        return { success: false, count: 0, error: "Geçerli bir kayıt dizisi bulunamadı." };
      }
      const existingIds = new Set(this.records.map(r => r.id));
      let added = 0;
      for (const item of incoming) {
        if (item.text && item.domain) {
          const id = item.id || `CORP-TR-${String(this.records.length + 1).padStart(3, '0')}`;
          if (!existingIds.has(id)) {
            this.records.push({ ...item, id });
            existingIds.add(id);
            added++;
          }
        }
      }
      this.saveToStorage();
      return { success: true, count: added };
    } catch (e) {
      return { success: false, count: 0, error: (e as Error).message };
    }
  }

  public getStats() {
    const domains: Record<string, number> = {};
    const intents: Record<string, number> = {};
    let totalWords = 0;

    this.records.forEach(r => {
      domains[r.domain] = (domains[r.domain] || 0) + 1;
      intents[r.target_intent] = (intents[r.target_intent] || 0) + 1;
      totalWords += r.text.split(/\s+/).length;
    });

    return {
      totalRecords: this.records.length,
      totalWords,
      avgWords: Math.round(totalWords / Math.max(1, this.records.length)),
      domains,
      intents,
      isLoadedFromRemote: this.isLoadedFromRemote
    };
  }
}
