import { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import { useTranslation } from '../utils/i18n';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';
import type { Translations } from '../locales/tr';

// ============================================================
// MODÜL SİSTEMİ
// ============================================================
interface Module {
  id: string;
  icon: string;
  moduleKey: keyof Translations['modules'];  // Locale'den çekecek
  route: string;
  color: string;
  available: boolean;
}

interface BrandConfig {
  label: string;
  color: string;
  modules: Module[];
}

const STANDARD_MODULES: Module[] = [
  { id: 'live-data', icon: '📊', moduleKey: 'liveData', route: '/live-data-selection', color: '#00d2ff', available: true },
  { id: 'engine-dtc', icon: '🔧', moduleKey: 'engineDtc', route: '/fault-codes', color: '#f87171', available: true },
  { id: 'freeze-frame', icon: '🧊', moduleKey: 'freezeFrame', route: '/freeze-frame', color: '#818cf8', available: true },
  { id: 'readiness', icon: '✅', moduleKey: 'readiness', route: '/readiness', color: '#4ade80', available: true },
];

const BRAND_MODULES: Record<string, BrandConfig> = {
  GENERIC: { label: 'Genel OBD-II', color: '#00d2ff', modules: [] },
  VW: {
    label: 'VW / Audi / Skoda', color: '#1e88e5',
    modules: [
      { id: 'vw-transmission', icon: '⚙️', moduleKey: 'vwTransmission', route: '/modules/vw-transmission', color: '#fb923c', available: false },
      { id: 'vw-abs', icon: '🛞', moduleKey: 'vwAbs', route: '/modules/vw-abs', color: '#facc15', available: false },
      { id: 'vw-airbag', icon: '💺', moduleKey: 'vwAirbag', route: '/modules/vw-airbag', color: '#f87171', available: false },
      { id: 'vw-dashboard', icon: '🖥️', moduleKey: 'vwDashboard', route: '/modules/vw-dashboard', color: '#a78bfa', available: false },
    ],
  },
  BMW: {
    label: 'BMW', color: '#1d4ed8',
    modules: [
      { id: 'bmw-dme', icon: '🔥', moduleKey: 'bmwDme', route: '/modules/bmw-dme', color: '#00d2ff', available: false },
      { id: 'bmw-egs', icon: '⚙️', moduleKey: 'bmwEgs', route: '/modules/bmw-egs', color: '#fb923c', available: false },
      { id: 'bmw-abs', icon: '🛞', moduleKey: 'bmwAbs', route: '/modules/bmw-abs', color: '#facc15', available: false },
    ],
  },
  RENAULT: {
    label: 'Renault', color: '#fbbf24',
    modules: [
      { id: 'renault-ucam', icon: '⚙️', moduleKey: 'renaultUch', route: '/modules/renault-uch', color: '#fb923c', available: false },
      { id: 'renault-abs', icon: '🛞', moduleKey: 'renaultAbs', route: '/modules/renault-abs', color: '#facc15', available: false },
    ],
  },
  FIAT: {
    label: 'Fiat / Alfa / Jeep', color: '#ef4444',
    modules: [
      { id: 'fiat-ecu', icon: '🔧', moduleKey: 'fiatEcu', route: '/modules/fiat-ecu', color: '#f87171', available: false },
      { id: 'fiat-body', icon: '🚗', moduleKey: 'fiatBody', route: '/modules/fiat-body', color: '#a78bfa', available: false },
    ],
  },
};

function detectBrandKey(brand: string): string {
  const b = brand.toLowerCase();
  if (b.includes('volkswagen') || b.includes('vw') || b.includes('audi') || b.includes('skoda') || b.includes('seat')) return 'VW';
  if (b.includes('bmw') || b.includes('mini')) return 'BMW';
  if (b.includes('renault') || b.includes('dacia')) return 'RENAULT';
  if (b.includes('fiat') || b.includes('alfa') || b.includes('jeep') || b.includes('lancia')) return 'FIAT';
  return 'GENERIC';
}

// ============================================================
// ANA COMPONENT
// ============================================================
export default function DashboardScreen() {
  const router = useRouter();
  const { status } = useConnection();
  const { t } = useTranslation();
  const isConnected = status === 'connected';

  const params = useLocalSearchParams<{ brand: string; model: string; vin: string }>();
  const brand = params.brand || t.dashboard.unknownVehicle;
  const model = params.model || '';
  const vin = params.vin || '';

  const brandKey = detectBrandKey(brand);
  const brandConfig = BRAND_MODULES[brandKey] ?? BRAND_MODULES['GENERIC'];

  const [activeError, setActiveError] = useState<OBDErrorDef | null>(null);

  const allModules = [...STANDARD_MODULES, ...brandConfig.modules];
  const availableCount = allModules.filter(m => m.available).length;

  const handleModulePress = (module: Module) => {
    if (!module.available) return;
    if (!isConnected) {
      setActiveError(getError('NOT_CONNECTED'));
      return;
    }
    try {
      router.push(module.route as any);
    } catch {
      setActiveError(getError('UNKNOWN'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ARAÇ BİLGİ KARTI */}
        <View style={styles.vehicleCard}>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings' as any)}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>

          <View style={styles.vehicleCardTop}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleBrand}>{brand}</Text>
              <TouchableOpacity
                style={styles.infoBadge}
                onPress={() => router.push({ pathname: '/vehicle-info' as any, params: { brand, model, vin, brandKey } })}
              >
                <Text style={styles.infoBadgeText}>{t.dashboard.vehicleInfo}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isConnected ? '#4ade8022' : '#f8717122' }]}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4ade80' : '#f87171' }]} />
              <Text style={[styles.statusText, { color: isConnected ? '#4ade80' : '#f87171' }]}>
                {isConnected ? t.connection.connected : t.connection.disconnected}
              </Text>
            </View>
          </View>

          <View style={[styles.brandBadge, { borderColor: brandConfig.color + '44' }]}>
            <View style={[styles.brandDot, { backgroundColor: brandConfig.color }]} />
            <Text style={[styles.brandBadgeText, { color: brandConfig.color }]}>{brandConfig.label}</Text>
          </View>

          <Text style={styles.moduleCount}>
            {availableCount} {t.dashboard.activeModules} · {allModules.length - availableCount} {t.dashboard.inDevelopment}
          </Text>
        </View>

        {/* HATA — inline göster */}
        <View style={{ paddingHorizontal: 16 }}>
          <ErrorView error={activeError} onDismiss={() => setActiveError(null)} onRetry={() => setActiveError(null)} />
        </View>

        {/* Bağlı değilse uyarı */}
        {!isConnected && (
          <View style={styles.disconnectedBox}>
            <Text style={styles.disconnectedText}>⚠️ {t.connection.noObd}</Text>
          </View>
        )}

        {/* STANDART OBD-II MODÜLLER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.dashboard.standardObd}</Text>
          <Text style={styles.sectionSub}>{t.dashboard.worksOnAll}</Text>
          <View style={styles.grid}>
            {STANDARD_MODULES.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                isConnected={isConnected}
                t={t}
                onPress={() => handleModulePress(module)}
              />
            ))}
          </View>
        </View>

        {/* MARKA ÖZEL MODÜLLER */}
        {brandConfig.modules.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>{brandConfig.label} {t.dashboard.brandModules}</Text>
              <View style={[styles.brandPill, { backgroundColor: brandConfig.color + '22', borderColor: brandConfig.color + '44' }]}>
                <Text style={[styles.brandPillText, { color: brandConfig.color }]}>{t.dashboard.brandSpecific}</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>{t.dashboard.udtProtocol}</Text>
            <View style={styles.grid}>
              {brandConfig.modules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isConnected={isConnected}
                  t={t}
                  onPress={() => handleModulePress(module)}
                />
              ))}
            </View>
          </View>
        )}

        {brandKey === 'GENERIC' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>{t.dashboard.noModules}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t.dashboard.changeVehicle}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// MODÜL KARTI
// ============================================================
function ModuleCard({
  module, isConnected, t, onPress,
}: {
  module: Module;
  isConnected: boolean;
  t: Translations;
  onPress: () => void;
}) {
  const dimmed = module.available && !isConnected;
  const moduleStrings = t.modules[module.moduleKey];

  return (
    <TouchableOpacity
      style={[
        styles.moduleCard,
        !module.available && styles.moduleCardDisabled,
        dimmed && styles.moduleCardDimmed,
      ]}
      onPress={onPress}
      activeOpacity={module.available ? 0.75 : 1}
    >
      {!module.available && (
        <View style={styles.soonBadge}>
          <Text style={styles.soonBadgeText}>{t.common.soon}</Text>
        </View>
      )}
      {dimmed && (
        <View style={styles.soonBadge}>
          <Text style={styles.soonBadgeText}>🔒</Text>
        </View>
      )}

      <Text style={[styles.moduleIcon, (!module.available || dimmed) && { opacity: 0.4 }]}>
        {module.icon}
      </Text>
      <Text style={[styles.moduleTitle, (!module.available || dimmed) && { color: '#444' }]}>
        {moduleStrings.title}
      </Text>
      <Text style={[styles.moduleDesc, (!module.available || dimmed) && { color: '#333' }]}>
        {moduleStrings.desc}
      </Text>

      {module.available && !dimmed && (
        <View style={[styles.moduleActiveDot, { backgroundColor: module.color }]} />
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// STİLLER
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  vehicleCard: {
    margin: 16, marginBottom: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#ffffff08',
  },
  vehicleCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  vehicleInfo: { flex: 1 },
  vehicleBrand: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 2 },
  vehicleModel: { fontSize: 14, color: '#aaa', marginBottom: 2 },
  vehicleVin: { fontSize: 12, color: '#555', fontFamily: 'monospace' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  infoBadge: { backgroundColor: '#33334d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ffffff22' },
  infoBadgeText: { color: '#00d2ff', fontSize: 12, fontWeight: '700' },
  settingsButton: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 4 },
  settingsIcon: { fontSize: 22 },
  brandBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, gap: 6, marginBottom: 8 },
  brandDot: { width: 8, height: 8, borderRadius: 4 },
  brandBadgeText: { fontSize: 12, fontWeight: '700' },
  moduleCount: { fontSize: 12, color: '#333', fontWeight: '600' },
  disconnectedBox: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#f8717108', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f8717133' },
  disconnectedText: { color: '#f87171', fontSize: 13, fontWeight: '500' },
  section: { marginTop: 8, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 2 },
  sectionSub: { fontSize: 12, color: '#555', fontWeight: '500', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  brandPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  brandPillText: { fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moduleCard: { width: '47%', backgroundColor: '#1a1a2e', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#ffffff08', position: 'relative', overflow: 'hidden' },
  moduleCardDisabled: { backgroundColor: '#111119', borderColor: '#1a1a1a' },
  moduleCardDimmed: { opacity: 0.6 },
  soonBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#13131f', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  soonBadgeText: { fontSize: 9, fontWeight: '800', color: '#555' },
  moduleIcon: { fontSize: 28, marginBottom: 10 },
  moduleTitle: { fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 4 },
  moduleDesc: { fontSize: 11, color: '#555', lineHeight: 15 },
  moduleActiveDot: { width: 6, height: 6, borderRadius: 3, position: 'absolute', bottom: 12, right: 12 },
  infoBox: { marginHorizontal: 16, marginTop: 8, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ffffff08', flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, color: '#555', fontSize: 13, lineHeight: 19 },
  backButton: { margin: 16, marginTop: 24, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff08' },
  backButtonText: { color: '#555', fontSize: 14, fontWeight: '600' },
});
