// ============================================================
// OBD Diagnostics — Merkezi Hata Yönetimi
// Yeni hata eklemek için sadece bu dosyaya obje ekle.
// ============================================================

export type ErrorSeverity = 'error' | 'warning' | 'info';
export type ErrorAction = 'reconnect' | 'go_manual' | 'go_home' | 'retry' | 'dismiss' | 'go_settings';

export interface OBDErrorDef {
  code: string;
  title: string;
  message: string;
  severity: ErrorSeverity;
  primaryAction: ErrorAction;
  primaryActionLabel: string;
  secondaryAction?: ErrorAction;
  secondaryActionLabel?: string;
}

// --- TÜM HATALAR ---
export const ERRORS: Record<string, OBDErrorDef> = {

  // BAĞLANTI
  CONNECTION_LOST: {
    code: 'CONNECTION_LOST',
    title: 'Bağlantı Kesildi',
    message: 'OBD cihazıyla bağlantı koptu. Cihazın açık ve aynı ağda olduğundan emin olun.',
    severity: 'error',
    primaryAction: 'reconnect',
    primaryActionLabel: 'Tekrar Bağlan',
    secondaryAction: 'go_home',
    secondaryActionLabel: 'Ana Ekrana Dön',
  },
  CONNECTION_TIMEOUT: {
    code: 'CONNECTION_TIMEOUT',
    title: 'Bağlantı Zaman Aşımı',
    message: 'OBD cihazı belirtilen sürede cevap vermedi. IP adresini kontrol edin.',
    severity: 'error',
    primaryAction: 'reconnect',
    primaryActionLabel: 'Tekrar Dene',
    secondaryAction: 'go_settings',
    secondaryActionLabel: 'Ayarlara Git',
  },
  NOT_CONNECTED: {
    code: 'NOT_CONNECTED',
    title: 'Bağlantı Yok',
    message: 'Bu işlem için OBD cihazına bağlı olmanız gerekiyor.',
    severity: 'warning',
    primaryAction: 'reconnect',
    primaryActionLabel: 'Bağlan',
    secondaryAction: 'dismiss',
    secondaryActionLabel: 'Kapat',
  },

  // VIN / ARAÇ
  VIN_NOT_FOUND: {
    code: 'VIN_NOT_FOUND',
    title: 'Araç Bulunamadı',
    message: 'Bu VIN/WMI kodu veritabanımızda kayıtlı değil. Manuel seçimi deneyin.',
    severity: 'warning',
    primaryAction: 'go_manual',
    primaryActionLabel: 'Manuel Seçime Geç',
    secondaryAction: 'dismiss',
    secondaryActionLabel: 'Tekrar Dene',
  },
  VIN_INVALID: {
    code: 'VIN_INVALID',
    title: 'Geçersiz VIN',
    message: 'Girilen şasi numarası geçerli değil. VIN 17 haneli olmalı, I/O/Q karakteri içermemeli.',
    severity: 'warning',
    primaryAction: 'dismiss',
    primaryActionLabel: 'Düzelt',
    secondaryAction: 'go_manual',
    secondaryActionLabel: 'Manuel Seçime Geç',
  },
  VIN_READ_FAILED: {
    code: 'VIN_READ_FAILED',
    title: 'VIN Okunamadı',
    message: 'ECU\'dan VIN bilgisi alınamadı. Araç bağlantısını veya OBD portunu kontrol edin.',
    severity: 'error',
    primaryAction: 'retry',
    primaryActionLabel: 'Tekrar Dene',
    secondaryAction: 'go_manual',
    secondaryActionLabel: 'Manuel Seçime Geç',
  },
  ECU_TIMEOUT: {
    code: 'ECU_TIMEOUT',
    title: 'ECU Cevap Vermedi',
    message: 'ECU belirtilen sürede yanıt vermedi. OBD bağlantısını ve araç kontak durumunu kontrol edin.',
    severity: 'error',
    primaryAction: 'retry',
    primaryActionLabel: 'Tekrar Dene',
    secondaryAction: 'go_manual',
    secondaryActionLabel: 'Manuel Seçime Geç',
  },
  MODEL_LIST_EMPTY: {
    code: 'MODEL_LIST_EMPTY',
    title: 'Model Bulunamadı',
    message: 'Bu marka için veritabanımızda model bilgisi yok. Manuel seçimi deneyin.',
    severity: 'warning',
    primaryAction: 'go_manual',
    primaryActionLabel: 'Manuel Seçime Geç',
    secondaryAction: 'go_home',
    secondaryActionLabel: 'Ana Ekrana Dön',
  },

  // VERİTABANI
  DB_LOAD_FAILED: {
    code: 'DB_LOAD_FAILED',
    title: 'Veritabanı Yüklenemedi',
    message: 'Araç veritabanı açılamadı. Uygulamayı yeniden başlatın.',
    severity: 'error',
    primaryAction: 'retry',
    primaryActionLabel: 'Yeniden Dene',
    secondaryAction: 'go_home',
    secondaryActionLabel: 'Ana Ekrana Dön',
  },
  STORAGE_ERROR: {
    code: 'STORAGE_ERROR',
    title: 'Kayıt Hatası',
    message: 'Araç bilgileri kaydedilemedi fakat işleme devam edebilirsiniz.',
    severity: 'info',
    primaryAction: 'dismiss',
    primaryActionLabel: 'Tamam',
  },

  // CANLI VERİ
  DATA_STREAM_LOST: {
    code: 'DATA_STREAM_LOST',
    title: 'Veri Akışı Kesildi',
    message: 'ECU\'dan veri gelmiyor. Bağlantı durumunu kontrol edin.',
    severity: 'error',
    primaryAction: 'reconnect',
    primaryActionLabel: 'Yeniden Bağlan',
    secondaryAction: 'go_home',
    secondaryActionLabel: 'Ana Ekrana Dön',
  },
  DATA_PARSE_ERROR: {
    code: 'DATA_PARSE_ERROR',
    title: 'Veri Okunamadı',
    message: 'ECU\'dan gelen veri işlenemedi. Protokol uyumsuzluğu olabilir.',
    severity: 'warning',
    primaryAction: 'retry',
    primaryActionLabel: 'Tekrar Dene',
    secondaryAction: 'go_home',
    secondaryActionLabel: 'Ana Ekrana Dön',
  },

  // HATA KODLARI (DTC)
  DTC_CLEAR_FAILED: {
    code: 'DTC_CLEAR_FAILED',
    title: 'Kodlar Silinemedi',
    message: 'Arıza kodları ECU\'dan silinemedi. Bağlantıyı kontrol edip tekrar deneyin.',
    severity: 'error',
    primaryAction: 'retry',
    primaryActionLabel: 'Tekrar Dene',
    secondaryAction: 'dismiss',
    secondaryActionLabel: 'Kapat',
  },
  DTC_READ_FAILED: {
    code: 'DTC_READ_FAILED',
    title: 'Kodlar Okunamadı',
    message: 'Arıza kodları ECU\'dan alınamadı. OBD bağlantısını kontrol edin.',
    severity: 'error',
    primaryAction: 'reconnect',
    primaryActionLabel: 'Yeniden Bağlan',
    secondaryAction: 'dismiss',
    secondaryActionLabel: 'Kapat',
  },

  // GENEL
  UNKNOWN: {
    code: 'UNKNOWN',
    title: 'Beklenmeyen Hata',
    message: 'Bilinmeyen bir hata oluştu. Uygulamayı yeniden başlatmayı deneyin.',
    severity: 'error',
    primaryAction: 'go_home',
    primaryActionLabel: 'Ana Ekrana Dön',
    secondaryAction: 'dismiss',
    secondaryActionLabel: 'Kapat',
  },
};

// Hata kodundan tanım al — bilinmiyorsa UNKNOWN döner
export function getError(code: string): OBDErrorDef {
  return ERRORS[code] ?? ERRORS['UNKNOWN'];
}