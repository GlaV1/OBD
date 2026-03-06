import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// ============================================================
// MODÜL SİSTEMİ — Yeni marka/modül eklemek için sadece buraya
// yeni bir obje eklemen yeterli, başka hiçbir şeyi değiştirmene gerek yok
// ============================================================

interface Module {
  id: string;
  icon: string;
  title: string;
  desc: string;
  route: string;
  color: string;
  available: boolean; // false = "Yakında" rozeti gösterir
}

interface BrandConfig {
  label: string;
  color: string;
  modules: Module[];
}

// Tüm markalarda ortak olan standart OBD-II modülleri
const STANDARD_MODULES: Module[] = [
  {
    id: 'live-data',
    icon: '📊',
    title: 'Canlı Veriler',
    desc: 'RPM, Hız, Isı, Yakıt',
    route: '/live-data',
    color: '#00d2ff',
    available: true,
  },
  {
    id: 'engine-dtc',
    icon: '🔧',
    title: 'Motor Arızaları',
    desc: 'P kodları — tüm araçlar',
    route: '/fault-codes',
    color: '#f87171',
    available: true,
  },
  {
    id: 'freeze-frame',
    icon: '🧊',
    title: 'Freeze Frame',
    desc: 'Hata anındaki anlık veri',
    route: '/freeze-frame',
    color: '#818cf8',
    available: false,
  },
  {
    id: 'readiness',
    icon: '✅',
    title: 'Hazırlık Testleri',
    desc: 'Emisyon sistem kontrolleri',
    route: '/readiness',
    color: '#4ade80',
    available: false,
  },
];

// Marka bazlı özel modüller
// Yeni marka eklemek için buraya yeni bir key ekle
const BRAND_MODULES: Record<string, BrandConfig> = {
  GENERIC: {
    label: 'Genel OBD-II',
    color: '#00d2ff',
    modules: [],
  },
  VW: {
    label: 'VW / Audi / Skoda',
    color: '#1e88e5',
    modules: [
      {
        id: 'vw-transmission',
        icon: '⚙️',
        title: 'Şanzıman (02)',
        desc: 'VW Group ECU — UDS protokol',
        route: '/modules/vw-transmission',
        color: '#fb923c',
        available: false,
      },
      {
        id: 'vw-abs',
        icon: '🛞',
        title: 'ABS / ESP (03)',
        desc: 'Fren sistemi hata kodları',
        route: '/modules/vw-abs',
        color: '#facc15',
        available: false,
      },
      {
        id: 'vw-airbag',
        icon: '💺',
        title: 'Airbag (15)',
        desc: 'Güvenlik sistemi kontrolü',
        route: '/modules/vw-airbag',
        color: '#f87171',
        available: false,
      },
      {
        id: 'vw-dashboard',
        icon: '🖥️',
        title: 'Gösterge Paneli (17)',
        desc: 'Kilometre, immobilizer',
        route: '/modules/vw-dashboard',
        color: '#a78bfa',
        available: false,
      },
    ],
  },
  BMW: {
    label: 'BMW',
    color: '#1d4ed8',
    modules: [
      {
        id: 'bmw-dme',
        icon: '🔥',
        title: 'DME / DDE Motor',
        desc: 'BMW motor yönetim sistemi',
        route: '/modules/bmw-dme',
        color: '#00d2ff',
        available: false,
      },
      {
        id: 'bmw-egs',
        icon: '⚙️',
        title: 'EGS Şanzıman',
        desc: 'Otomatik şanzıman modülü',
        route: '/modules/bmw-egs',
        color: '#fb923c',
        available: false,
      },
      {
        id: 'bmw-abs',
        icon: '🛞',
        title: 'DSC / ABS',
        desc: 'Dinamik stabilite kontrolü',
        route: '/modules/bmw-abs',
        color: '#facc15',
        available: false,
      },
    ],
  },
  RENAULT: {
    label: 'Renault',
    color: '#fbbf24',
    modules: [
      {
        id: 'renault-ucam',
        icon: '⚙️',
        title: 'UCH / BSI',
        desc: 'Merkezi elektrik modülü',
        route: '/modules/renault-uch',
        color: '#fb923c',
        available: false,
      },
      {
        id: 'renault-abs',
        icon: '🛞',
        title: 'ABS Modülü',
        desc: 'Bosch / Continental ABS',
        route: '/modules/renault-abs',
        color: '#facc15',
        available: false,
      },
    ],
  },
  FIAT: {
    label: 'Fiat / Alfa / Jeep',
    color: '#ef4444',
    modules: [
      {
        id: 'fiat-ecu',
        icon: '🔧',
        title: 'Marelli ECU',
        desc: 'Fiat özel motor modülü',
        route: '/modules/fiat-ecu',
        color: '#f87171',
        available: false,
      },
      {
        id: 'fiat-body',
        icon: '🚗',
        title: 'Body Computer',
        desc: 'Elektrik / karoser sistemi',
        route: '/modules/fiat-body',
        color: '#a78bfa',
        available: false,
      },
    ],
  },
};

// Araç markasından hangi BrandConfig kullanılacağını tahmin et
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
  const params = useLocalSearchParams<{ brand: string; vin: string }>();

  const brand = params.brand || 'Bilinmeyen Araç';
  const vin = params.vin || '';
  const brandKey = detectBrandKey(brand);
  const brandConfig = BRAND_MODULES[brandKey];

  const [connectionStatus] = useState<'connected' | 'disconnected'>('connected');

  const handleModulePress = (module: Module) => {
    if (!module.available) return; // Yakında olan modüller tıklanamaz
    router.push(module.route as any);
  };

  const allModules = [...STANDARD_MODULES, ...brandConfig.modules];
  const availableCount = allModules.filter(m => m.available).length;
  const totalCount = allModules.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ARAÇ BİLGİ KARTI */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleCardTop}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleBrand}>{brand}</Text>
              {vin ? (
                <Text style={styles.vehicleVin}>VIN: {vin}</Text>
              ) : null}
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: connectionStatus === 'connected' ? '#4ade8022' : '#f8717122' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: connectionStatus === 'connected' ? '#4ade80' : '#f87171' }
              ]} />
              <Text style={[
                styles.statusText,
                { color: connectionStatus === 'connected' ? '#4ade80' : '#f87171' }
              ]}>
                {connectionStatus === 'connected' ? 'Bağlı' : 'Bağlı Değil'}
              </Text>
            </View>
          </View>

          {/* Marka rozeti */}
          <View style={[styles.brandBadge, { borderColor: brandConfig.color + '44' }]}>
            <View style={[styles.brandDot, { backgroundColor: brandConfig.color }]} />
            <Text style={[styles.brandBadgeText, { color: brandConfig.color }]}>
              {brandConfig.label}
            </Text>
          </View>

          {/* Modül sayacı */}
          <Text style={styles.moduleCount}>
            {availableCount} aktif modül  ·  {totalCount - availableCount} geliştirme aşamasında
          </Text>
        </View>

        {/* STANDART OBD-II MODÜLLER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standart OBD-II</Text>
          <Text style={styles.sectionSub}>Tüm araçlarda çalışır</Text>
          <View style={styles.grid}>
            {STANDARD_MODULES.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                onPress={() => handleModulePress(module)}
              />
            ))}
          </View>
        </View>

        {/* MARKA ÖZEL MODÜLLER */}
        {brandConfig.modules.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>{brandConfig.label} Modülleri</Text>
              <View style={[styles.brandPill, { backgroundColor: brandConfig.color + '22', borderColor: brandConfig.color + '44' }]}>
                <Text style={[styles.brandPillText, { color: brandConfig.color }]}>Marka Özel</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>UDS / KWP2000 protokolü</Text>
            <View style={styles.grid}>
              {brandConfig.modules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onPress={() => handleModulePress(module)}
                />
              ))}
            </View>
          </View>
        )}

        {/* GENEL ARAÇLAR İÇİN BİLGİ */}
        {brandKey === 'GENERIC' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Bu araç için marka özel modüller henüz eklenmedi. Standart OBD-II modülleri ile motor verilerini ve hata kodlarını okuyabilirsin.
            </Text>
          </View>
        )}

        {/* AYARLAR / GERİ */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Araç Değiştir</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// MODÜL KARTI KOMPONENTI
// ============================================================
function ModuleCard({ module, onPress }: { module: Module; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[
        styles.moduleCard,
        !module.available && styles.moduleCardDisabled,
      ]}
      onPress={onPress}
      activeOpacity={module.available ? 0.75 : 1}
    >
      {/* Yakında rozeti */}
      {!module.available && (
        <View style={styles.soonBadge}>
          <Text style={styles.soonBadgeText}>Yakında</Text>
        </View>
      )}

      <Text style={[styles.moduleIcon, !module.available && { opacity: 0.4 }]}>
        {module.icon}
      </Text>
      <Text style={[styles.moduleTitle, !module.available && { color: '#444' }]}>
        {module.title}
      </Text>
      <Text style={[styles.moduleDesc, !module.available && { color: '#333' }]}>
        {module.desc}
      </Text>

      {module.available && (
        <View style={[styles.moduleAccent, { backgroundColor: module.color + '22' }]}>
          <View style={[styles.moduleAccentDot, { backgroundColor: module.color }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// STİLLER
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },

  // ARAÇ KARTI
  vehicleCard: {
    margin: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  vehicleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  vehicleVin: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginBottom: 8,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  moduleCount: {
    fontSize: 11,
    color: '#444',
    marginTop: 4,
  },

  // BÖLÜMLER
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionSub: {
    fontSize: 12,
    color: '#444',
    marginBottom: 14,
    marginTop: 2,
  },
  brandPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // MODÜL GRID
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moduleCard: {
    width: '47.5%',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff08',
    minHeight: 110,
    position: 'relative',
    overflow: 'hidden',
  },
  moduleCardDisabled: {
    backgroundColor: '#12121f',
    borderColor: '#ffffff04',
  },
  moduleIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
  },
  moduleDesc: {
    fontSize: 11,
    color: '#555',
    lineHeight: 15,
  },
  moduleAccent: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleAccentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  soonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff08',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soonBadgeText: {
    fontSize: 9,
    color: '#444',
    fontWeight: '600',
  },

  // BİLGİ KUTUSU
  infoBox: {
    margin: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ffffff06',
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
  },

  // GERİ BUTONU
  backButton: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
});
