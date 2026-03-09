import AsyncStorage from '@react-native-async-storage/async-storage';
import tr, { type Translations } from '../locales/tr';
import en from '../locales/en';

// ─── Desteklenen diller ────────────────────────────────────────
export type AppLanguage = 'tr' | 'en';
const LANG_KEY = 'obd_app_language';

// ─── Aktif dil (bellek içi, uygulama boyunca sabit) ───────────
let _currentLang: AppLanguage = 'tr'; // varsayılan Türkçe

const translations: Record<AppLanguage, Translations> = {
  tr,
  en,
};

export function getCurrentLang(): AppLanguage {
  return _currentLang;
}

// Uygulama açılışında _layout'tan çağrılacak
export async function loadLanguage(): Promise<AppLanguage> {
  try {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved === 'tr' || saved === 'en') {
      _currentLang = saved;
    }
  } catch { }
  return _currentLang;
}

// Ayarlar ekranından çağrılacak — değişince uygulamayı yeniden başlatır
export async function setLanguage(lang: AppLanguage): Promise<void> {
  _currentLang = lang;
  try {
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch { }
}

// ─── UI metinleri çevirisi ─────────────────────────────────────
const UI_STRINGS = {
  // Genel
  connected: { tr: 'Bağlı', en: 'Connected' },
  disconnected: { tr: 'Bağlı Değil', en: 'Disconnected' },
  connecting: { tr: 'Bağlanıyor...', en: 'Connecting...' },
  connectionError: { tr: 'Bağlantı Hatası', en: 'Connection Error' },
  connect: { tr: 'Bağlan', en: 'Connect' },
  retry: { tr: 'Tekrar Dene', en: 'Retry' },
  cancel: { tr: 'İptal', en: 'Cancel' },
  save: { tr: 'Kaydet', en: 'Save' },
  close: { tr: 'Kapat', en: 'Close' },
  back: { tr: 'Geri', en: 'Back' },
  settings: { tr: 'Ayarlar', en: 'Settings' },

  // DTC sayfası
  dtcTitle: { tr: 'Arıza Teşhis (DTC)', en: 'Fault Codes (DTC)' },
  dtcRecords: { tr: 'kayıt', en: 'records' },
  dtcClean: { tr: 'Araç Sistemleri Temiz', en: 'Vehicle Systems Clean' },
  dtcCleanDesc: { tr: 'ECU belleğinde kayıtlı arıza kodu bulunamadı.', en: 'No fault codes found in ECU memory.' },
  dtcUnknown: { tr: 'Bilinmeyen Hata', en: 'Unknown Fault' },
  dtcUnknownDesc: { tr: '⚠️ Bu kod veritabanımızda kayıtlı değil. Yetkili servis ile iletişime geçin.', en: '⚠️ This code is not in our database. Contact an authorized service.' },
  dtcSolution: { tr: '💡 Çözüm Önerisi', en: '💡 Suggested Fix' },
  dtcClearButton: { tr: 'Hata Kodlarını Sil', en: 'Clear Fault Codes' },
  dtcClearing: { tr: 'Siliniyor...', en: 'Clearing...' },
  dtcClearConfirmTitle: { tr: 'Hata Kodlarını Sil', en: 'Clear Fault Codes' },
  dtcClearConfirmMsg: { tr: 'ECU belleğindeki tüm arıza kayıtları silinecek. Emin misiniz?', en: 'All fault records in ECU memory will be deleted. Are you sure?' },
  dtcClearSuccess: { tr: '✅ Tamamlandı', en: '✅ Done' },
  dtcClearSuccessMsg: { tr: 'Arıza kayıtları ECU belleğinden silindi.', en: 'Fault records cleared from ECU memory.' },
  dtcOffline: { tr: 'Çevrimdışı', en: 'Offline' },
  dtcUnknownBrand: { tr: 'Bilinmiyor', en: 'Unknown' },

  // Ayarlar sayfası
  settingsTitle: { tr: 'Ayarlar', en: 'Settings' },
  settingsLang: { tr: 'Uygulama Dili', en: 'App Language' },
  settingsLangTr: { tr: 'Türkçe', en: 'Turkish' },
  settingsLangEn: { tr: 'İngilizce', en: 'English' },
  settingsLangNote: { tr: 'Dil değişikliği için uygulamayı yeniden başlatın.', en: 'Restart the app to apply language change.' },
  settingsServer: { tr: 'OBD Sunucu Adresi', en: 'OBD Server Address' },
  settingsServerSave: { tr: 'Kaydet', en: 'Save' },
  settingsAbout: { tr: 'Hakkında', en: 'About' },
  settingsVersion: { tr: 'Versiyon', en: 'Version' },
} as const;

type StringKey = keyof typeof UI_STRINGS;

// Çeviri fonksiyonu — t('dtcTitle') → "Arıza Teşhis (DTC)" veya "Fault Codes (DTC)"
export function t(key: StringKey): string {
  const entry = UI_STRINGS[key];
  if (!entry) return key;
  return entry[_currentLang] ?? entry['en'];
}

// ─── DTC veritabanı çevirisi ───────────────────────────────────
// dtc-database.json'daki bir entry'den aktif dile göre açıklama al
export function getDTCMeaning(entry: {
  Meaning: string;
  Meaning_tr?: string;
}): string {
  if (_currentLang === 'tr' && entry.Meaning_tr) return entry.Meaning_tr;
  return entry.Meaning;
}

export function getDTCSolution(entry: {
  Solution?: string;
  Solution_tr?: string;
}): string | undefined {
  if (_currentLang === 'tr' && entry.Solution_tr) return entry.Solution_tr;
  return entry.Solution;
}

export function useTranslation() {
  return {
    t: translations[_currentLang],
    lang: _currentLang
  };
}
