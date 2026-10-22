/**
 * src/nlp-engine/samples.ts
 * Akademik ve Gerçekçi Türkçe Örnek Cümle Veritabanı
 */

export interface SampleCategory {
  title: string;
  icon: string;
  description: string;
  sentences: Array<{ text: string; expectedTag: string }>;
}

export const SAMPLE_CATEGORIES: Record<string, SampleCategory> = {
  "daily": {
    title: "Günlük Konuşma",
    icon: "MessageCircle",
    description: "Gündelik hayat, sosyal ilişkiler ve rutin iletişim ifadeleri.",
    sentences: [
      { text: "Lütfen kapıyı kapatır mısın?", expectedTag: "Nazik Rica / Dolaylı Emir" },
      { text: "Bugün hava gerçekten çok güzel.", expectedTag: "Nötr / Durum Bildirimi" },
      { text: "Yarın saat kaçta buluşacağız?", expectedTag: "Soru Sorma" },
      { text: "Biraz yorgunum ama yine de mutluyum.", expectedTag: "Olumlu / Karma Duygu" }
    ]
  },
  "business": {
    title: "İş Hayatı & Kurumsal",
    icon: "Briefcase",
    description: "Ofis içi yazışma, yöneticilik, toplantı ve görev yönetimi.",
    sentences: [
      { text: "Lütfen çeyrek sonu finansal raporunu mesai bitimine kadar iletir misiniz?", expectedTag: "Çok Nazik Kurumsal Rica" },
      { text: "Toplantı odası üçüncü katta saat on dörtte hazır olacak.", expectedTag: "Kurumsal Bilgi Verme" },
      { text: "Önce sunumu güncelleyin, ardından yönetim kuruluna sununuz.", expectedTag: "Sıralı Talimat / Yönerge" },
      { text: "Bu projenin bütçesini onaylamamız mümkün mü?", expectedTag: "Nezaketli Soru / Talep" }
    ]
  },
  "education": {
    title: "Öğretmen & Öğrenci",
    icon: "GraduationCap",
    description: "Akademik ortam, ders yönergeleri ve hiyerarşik hitaplar.",
    sentences: [
      { text: "Hocam, ödev teslim tarihini bir gün uzatabilir misiniz?", expectedTag: "Akademik Hitap & Nazik Rica" },
      { text: "Ödevlerinizi cuma gününe kadar sisteme yükleyin.", expectedTag: "Doğrudan Talimat / Emir" },
      { text: "Dersi dikkatlice dinleyin ve not almayı unutmayın.", expectedTag: "Eğitsel Yönerge / Tavsiye" },
      { text: "Sınav sonuçlarını kütüphanedeki panoda ilan ettim.", expectedTag: "Bilgi Verme" }
    ]
  },
  "customer": {
    title: "Müşteri Hizmetleri",
    icon: "Headphones",
    description: "Müşteri şikâyetleri, memnuniyet ve destek ekibi diyalogları.",
    sentences: [
      { text: "Satın aldığım ürün bozuk çıktı, derhal iade talep ediyorum!", expectedTag: "Şikâyet & Öfke" },
      { text: "Talebiniz alınmıştır, size en kısa sürede geri dönüş yapacağız.", expectedTag: "Resmi Bilgi Verme / Destek" },
      { text: "Bu kadar kalitesiz bir hizmeti asla kabul etmiyorum.", expectedTag: "Şikâyet & Olumsuzluk" },
      { text: "Yardımcı olabileceğim başka bir konu var mıdır acaba?", expectedTag: "Nazik Müşteri Desteği" }
    ]
  },
  "family": {
    title: "Aile & Arkadaş",
    icon: "Heart",
    description: "Samimi hitaplar, duygusal paylaşımlar ve kutlamalar.",
    sentences: [
      { text: "Canım arkadaşım, iyi ki doğdun ve iyi ki varsın!", expectedTag: "Kutlama / Tebrik & Sevgi" },
      { text: "Akşam yemeğe bizimle gelir misin?", expectedTag: "Davet Etme / Soru" },
      { text: "Sana çok kırıldım, neden böyle davrandın?", expectedTag: "Üzüntü & Sitem / Soru" },
      { text: "Her şey için teşekkür ederim, hakkını helal et.", expectedTag: "Teşekkür & Minnet" }
    ]
  },
  "official": {
    title: "Resmî Yazışma",
    icon: "FileText",
    description: "Devlet kurumları, dilekçe ve bürokratik dil kalıpları.",
    sentences: [
      { text: "Bilgilerinize arz ve talep ederim.", expectedTag: "Resmi Protokol İfadesi" },
      { text: "İlgili kanun maddesi uyarınca başvurunuz reddedilmiştir.", expectedTag: "Resmi Olumsuz Bildirim" },
      { text: "Sayın Yetkili, kurumunuzdan belge talebinde bulunmaktayım.", expectedTag: "Protokol Hitabı & Talep" },
      { text: "Evraklarınızı ivedilikle rektörlüğe teslim ediniz.", expectedTag: "Resmi Talimat / Çoğul Emir" }
    ]
  },
  "imperative": {
    title: "Emir & Talimat Örnekleri",
    icon: "AlertOctagon",
    description: "Doğrudan emirler, yasaklamalar ve sert buyruklar.",
    sentences: [
      { text: "Kapıyı kapat.", expectedTag: "Yalın Doğrudan Emir" },
      { text: "Buraya gelme!", expectedTag: "Yasaklama / Olumsuz Emir" },
      { text: "Önce formu doldur, sonra kaydet butonuna bas.", expectedTag: "Sıralı Talimat" },
      { text: "Kes sesini ve derhal dışarı çık!", expectedTag: "Kaba / Saldırgan Emir" }
    ]
  },
  "sentiment": {
    title: "Olumlu & Olumsuz Duygular",
    icon: "Smile",
    description: "Aşırı sevinç, hüzün, öfke ve ironi / kinaye cümleleri.",
    sentences: [
      { text: "Bugün harika bir haber aldım, içim kıpır kıpır!", expectedTag: "Yüksek Olumlu / Sevinç" },
      { text: "Bu durum beni çok sinirlendirdi ve öfkelendirdi.", expectedTag: "Öfke / Agresyon" },
      { text: "Keşke her şey eskisi gibi olsa, içim çok acıyor.", expectedTag: "Keder / Üzüntü" },
      { text: "Aferin sana, her şeyi yine mahvettin!", expectedTag: "İroni / Alaycılık / Sitem" }
    ]
  }
};
