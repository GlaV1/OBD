import { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  TouchableOpacity, TextInput, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import { t, getCurrentLang, setLanguage, AppLanguage } from '../utils/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { serverUrl, setServerUrl } = useConnection();

  const [urlInput, setUrlInput] = useState(serverUrl);
  const [urlSaved, setUrlSaved] = useState(false);
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(getCurrentLang());
  const [langChanged, setLangChanged] = useState(false);

  const handleSaveUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed.startsWith('http')) {
      Alert.alert('Geçersiz Adres', 'Adres http:// veya https:// ile başlamalıdır.');
      return;
    }
    await setServerUrl(trimmed);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  const handleLangChange = async (lang: AppLanguage) => {
    setSelectedLang(lang);
    await setLanguage(lang);
    setLangChanged(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* ── DİL ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settingsLang')}</Text>

          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, selectedLang === 'tr' && styles.langBtnActive]}
              onPress={() => handleLangChange('tr')}
              activeOpacity={0.75}
            >
              <Text style={styles.langFlag}>🇹🇷</Text>
              <Text style={[styles.langLabel, selectedLang === 'tr' && styles.langLabelActive]}>
                Türkçe
              </Text>
              {selectedLang === 'tr' && <View style={styles.langCheck}><Text style={styles.langCheckText}>✓</Text></View>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langBtn, selectedLang === 'en' && styles.langBtnActive]}
              onPress={() => handleLangChange('en')}
              activeOpacity={0.75}
            >
              <Text style={styles.langFlag}>🇬🇧</Text>
              <Text style={[styles.langLabel, selectedLang === 'en' && styles.langLabelActive]}>
                English
              </Text>
              {selectedLang === 'en' && <View style={styles.langCheck}><Text style={styles.langCheckText}>✓</Text></View>}
            </TouchableOpacity>
          </View>

          {langChanged && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ {t('settingsLangNote')}
              </Text>
            </View>
          )}
        </View>

        {/* ── SUNUCU ADRESİ ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settingsServer')}</Text>
          <Text style={styles.sectionDesc}>Arduino'nun Wi-Fi IP adresi ve portu</Text>

          <TextInput
            style={styles.input}
            value={urlInput}
            onChangeText={t => { setUrlInput(t); setUrlSaved(false); }}
            placeholder="http://192.168.1.1:3000"
            placeholderTextColor="#444"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <TouchableOpacity
            style={[styles.saveBtn, urlSaved && styles.saveBtnDone]}
            onPress={handleSaveUrl}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {urlSaved ? '✓ Kaydedildi' : t('settingsServerSave')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── HAKKINDA ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settingsAbout')}</Text>
          <View style={styles.aboutCard}>
            <Row label="Uygulama" value="OBD Diagnostics" />
            <Row label={t('settingsVersion')} value="0.1.0 (beta)" />
            <Row label="Geliştirici" value="Açık kaynak" />
            <Row label="Protokol" value="OBD-II / CAN Bus" />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  content: { padding: 16, paddingBottom: 40 },

  section: {
    marginBottom: 28,
    backgroundColor: '#1a1a2e',
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#ffffff08',
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: '#aaa',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionDesc: { fontSize: 12, color: '#444', marginBottom: 14 },

  // DİL
  langRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#12121f', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#ffffff08',
  },
  langBtnActive: {
    borderColor: '#00d2ff55',
    backgroundColor: '#00d2ff0a',
  },
  langFlag: { fontSize: 22 },
  langLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#555' },
  langLabelActive: { color: '#00d2ff' },
  langCheck: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#00d2ff', alignItems: 'center', justifyContent: 'center',
  },
  langCheckText: { fontSize: 11, color: '#000', fontWeight: '900' },

  infoBox: {
    marginTop: 12, padding: 12,
    backgroundColor: '#00d2ff08', borderRadius: 10,
    borderWidth: 1, borderColor: '#00d2ff22',
  },
  infoText: { fontSize: 12, color: '#00d2ff', lineHeight: 18 },

  // SUNUCU
  input: {
    backgroundColor: '#12121f', color: '#fff',
    padding: 14, borderRadius: 10, fontSize: 14,
    borderWidth: 1, borderColor: '#2a2a3e',
    fontFamily: 'monospace', marginTop: 12,
  },
  saveBtn: {
    marginTop: 10, backgroundColor: '#00d2ff',
    padding: 14, borderRadius: 10, alignItems: 'center',
  },
  saveBtnDone: { backgroundColor: '#4ade80' },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },

  // HAKKINDA
  aboutCard: { marginTop: 12, gap: 2 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ffffff06',
  },
  rowLabel: { fontSize: 13, color: '#555' },
  rowValue: { fontSize: 13, color: '#fff', fontWeight: '600' },
});
