// ============================================================
// useTranslation — Aktif dilin locale nesnesini döndürür.
// SettingsContext'teki dil değerine göre tr.ts veya en.ts seçilir.
// Kullanım: const { t } = useTranslation();
//           t.dashboard.unknownVehicle  → 'Bilinmeyen Araç' veya 'Unknown Vehicle'
// ============================================================
import { useSettings } from '../context/SettingsContext';
import tr from '../locales/tr';
import en from '../locales/en';

export function useTranslation() {
    const { language } = useSettings();
    const t = language === 'tr' ? tr : en;
    return { t, language };
}
