import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConnection, getStatusColor, getStatusText } from '../context/ConnectionContext';

const { width } = Dimensions.get('window');

// --- TİPLER ---
interface Vehicle {
  id: string;
  brand: string;
  vin: string;
  lastConnected: string; // ISO date string
}

const STORAGE_KEY = 'obd_recent_vehicles';

// --- YARDIMCI FONKSİYONLAR ---
async function loadVehicles(): Promise<Vehicle[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveVehicle(vehicle: Vehicle): Promise<void> {
  try {
    let list = await loadVehicles();
    // Aynı VIN varsa güncelle, yoksa başa ekle
    list = list.filter(v => v.vin !== vehicle.vin || v.brand !== vehicle.brand);
    list.unshift(vehicle);
    if (list.length > 10) list = list.slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  return d.toLocaleDateString('tr-TR');
}

// --- ANA COMPONENT ---
export default function VehicleSelectScreen() {
  const router = useRouter();
  const { status, connect, lastError } = useConnection();
  const isOBDConnected = status === 'connected';

  const [activeTab, setActiveTab] = useState(0);
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [brand, setBrand] = useState('');
  const [vin, setVin] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Sekme geçiş animasyonu
  const tabAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadVehicles().then(setRecentVehicles);
  }, []);

  const switchTab = (index: number) => {
    Animated.parallel([
      Animated.timing(tabAnim, {
        toValue: index,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.spring(slideAnim, {
        toValue: index,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
    ]).start();
    setActiveTab(index);
  };

  const handleConnect = async (vehicle?: Vehicle) => {
    if (!isOBDConnected) return; // OBD bağlı değilse engelle

    const targetBrand = vehicle?.brand || brand.trim();
    const targetVin = vehicle?.vin || vin.trim();

    if (!targetBrand) return;

    setIsConnecting(true);

    // Simülasyon: Bağlanma animasyonu (gerçekte burada Bluetooth/Wi-Fi bağlantısı olacak)
    await new Promise(r => setTimeout(r, 1500));

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      brand: targetBrand,
      vin: targetVin || 'Girilmedi',
      lastConnected: new Date().toISOString(),
    };

    await saveVehicle(newVehicle);
    setIsConnecting(false);

    // Dashboard'a araç bilgisini params ile gönder
    router.push({
      pathname: '/dashboard',
      params: { brand: targetBrand, vin: targetVin },
    });
  };

  const handleAutoScan = async () => {
    if (!isOBDConnected) return;
    setIsScanning(true);
    // Simülasyon: OBD cihazı taraması (gerçekte Bluetooth scan olacak)
    await new Promise(r => setTimeout(r, 2000));
    setIsScanning(false);
    // Bulunan araç bilgisini forma doldur (mock)
    setBrand('Volkswagen Golf 1.4 TSI');
    setVin('WVWZZZ1KZ8W123456');
    switchTab(1);
  };

  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, width / 2 - 4],
  });

  const slideX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  // --- SON ARAÇLAR SEKMESİ ---
  const renderRecentTab = () => (
    <View style={styles.tabContent}>
      {recentVehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitle}>Henüz araç yok</Text>
          <Text style={styles.emptyDesc}>
            "Yeni Araç" sekmesinden ilk aracını ekle
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => switchTab(1)}
          >
            <Text style={styles.emptyButtonText}>Araç Ekle →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recentVehicles}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.vehicleCard, !isOBDConnected && styles.vehicleCardDisabled]}
              onPress={() => handleConnect(item)}
              activeOpacity={isOBDConnected ? 0.75 : 1}
              disabled={!isOBDConnected}
            >
              <View style={styles.vehicleCardLeft}>
                <View style={styles.vehicleIndex}>
                  <Text style={styles.vehicleIndexText}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.vehicleBrand}>{item.brand}</Text>
                  <Text style={styles.vehicleVin}>
                    {item.vin !== 'Girilmedi' ? `VIN: ${item.vin}` : 'VIN girilmedi'}
                  </Text>
                  <Text style={styles.vehicleDate}>
                    🕐 {formatDate(item.lastConnected)}
                  </Text>
                </View>
              </View>
              <View style={styles.connectArrow}>
                <Text style={styles.connectArrowText}>⚡</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  // --- YENİ ARAÇ SEKMESİ ---
  const renderNewVehicleTab = () => (
    <View style={styles.tabContent}>
      {/* Otomatik Tara Butonu */}
      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanButtonActive]}
        onPress={handleAutoScan}
        disabled={isScanning}
        activeOpacity={0.8}
      >
        {isScanning ? (
          <View style={styles.scanningRow}>
            <ActivityIndicator color="#00d2ff" size="small" />
            <Text style={styles.scanButtonText}>  OBD Cihazı Aranıyor...</Text>
          </View>
        ) : (
          <Text style={styles.scanButtonText}>🔍  Otomatik OBD Tara</Text>
        )}
      </TouchableOpacity>

      {/* Ayırıcı */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>veya manuel gir</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Araç Markası / Modeli *</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Volkswagen Golf 1.4 TSI"
          placeholderTextColor="#555"
          value={brand}
          onChangeText={setBrand}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Şasi Numarası (VIN)</Text>
        <TextInput
          style={styles.input}
          placeholder="17 haneli VIN – opsiyonel"
          placeholderTextColor="#555"
          value={vin}
          onChangeText={setVin}
          autoCapitalize="characters"
          maxLength={17}
        />
        {vin.length > 0 && (
          <Text style={[
            styles.vinCounter,
            { color: vin.length === 17 ? '#4ade80' : '#f87171' }
          ]}>
            {vin.length}/17
          </Text>
        )}
      </View>

      {/* Bağlan Butonu */}
      <TouchableOpacity
        style={[
          styles.connectButton,
          (!brand.trim() || isConnecting || !isOBDConnected) && styles.connectButtonDisabled,
        ]}
        onPress={() => handleConnect()}
        disabled={!brand.trim() || isConnecting || !isOBDConnected}
        activeOpacity={0.85}
      >
        {isConnecting ? (
          <View style={styles.scanningRow}>
            <ActivityIndicator color="#000" size="small" />
            <Text style={styles.connectButtonText}>  Bağlanıyor...</Text>
          </View>
        ) : (
          <Text style={styles.connectButtonText}>Araca Bağlan 🚀</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

      {/* BAŞLIK */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OBD Diagnostics</Text>
        <Text style={styles.headerSub}>Araç seç veya yenisini ekle</Text>
      </View>

      {/* OBD BAĞLANTI DURUMU BANNER */}
      <TouchableOpacity
        style={[
          styles.connectionBanner,
          { borderColor: getStatusColor(status) + '44', backgroundColor: getStatusColor(status) + '11' }
        ]}
        onPress={!isOBDConnected ? connect : undefined}
        activeOpacity={isOBDConnected ? 1 : 0.7}
      >
        <View style={[styles.connectionDot, { backgroundColor: getStatusColor(status) }]} />
        <Text style={[styles.connectionText, { color: getStatusColor(status) }]}>
          {lastError || getStatusText(status)}
        </Text>
        {!isOBDConnected && (
          <Text style={styles.connectionAction}>Bağlan →</Text>
        )}
      </TouchableOpacity>

      {/* BAĞLI DEĞİLSE UYARI */}
      {!isOBDConnected && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ OBD cihazına bağlanmadan araç seçemezsiniz. Yukarıdaki butona basarak bağlanmayı deneyin.
          </Text>
        </View>
      )}

      {/* SEKME ÇUBUĞU */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            { left: tabIndicatorLeft, width: width / 2 - 8 },
          ]}
        />
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => switchTab(0)}
        >
          <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>
            Son Araçlar
            {recentVehicles.length > 0 && (
              <Text style={styles.tabBadge}> {recentVehicles.length}</Text>
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => switchTab(1)}
        >
          <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>
            + Yeni Araç
          </Text>
        </TouchableOpacity>
      </View>

      {/* İÇERİK – Yatay kaydırma */}
      <View style={styles.contentWrapper}>
        <Animated.View
          style={[
            styles.slidingContainer,
            { transform: [{ translateX: slideX }] },
          ]}
        >
          {renderRecentTab()}
          {renderNewVehicleTab()}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// --- STİLLER ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },

  // SEKME ÇUBUĞU
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    marginBottom: 4,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    height: 36,
    backgroundColor: '#00d2ff22',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#00d2ff55',
  },
  tabButton: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  tabLabelActive: {
    color: '#00d2ff',
  },
  tabBadge: {
    fontSize: 12,
    color: '#00d2ff99',
  },

  // KAYAN İÇERİK
  contentWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  slidingContainer: {
    flexDirection: 'row',
    width: width * 2,
    flex: 1,
  },

  // HER SEKMENİN İÇERİĞİ
  tabContent: {
    width: width,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // SON ARAÇLAR – BOŞ DURUM
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#aaa',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#00d2ff22',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00d2ff44',
  },
  emptyButtonText: {
    color: '#00d2ff',
    fontWeight: '600',
  },

  // ARAÇ KARTI
  vehicleCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  vehicleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  vehicleIndex: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#00d2ff15',
    borderWidth: 1,
    borderColor: '#00d2ff30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIndexText: {
    color: '#00d2ff',
    fontWeight: '700',
    fontSize: 13,
  },
  vehicleBrand: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleVin: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  vehicleDate: {
    color: '#444',
    fontSize: 11,
  },
  connectArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#00d2ff20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectArrowText: {
    fontSize: 18,
  },

  // YENİ ARAÇ FORMU
  scanButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#00d2ff44',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderStyle: 'dashed',
  },
  scanButtonActive: {
    borderColor: '#00d2ff',
    backgroundColor: '#00d2ff0a',
  },
  scanButtonText: {
    color: '#00d2ff',
    fontSize: 15,
    fontWeight: '600',
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#222',
  },
  dividerText: {
    color: '#444',
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  vinCounter: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  connectButton: {
    backgroundColor: '#00d2ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00d2ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  connectButtonDisabled: {
    backgroundColor: '#1a2a2e',
    shadowOpacity: 0,
  },
  connectButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },

  // BAĞLANTI BANNER
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  connectionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  connectionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  connectionAction: {
    fontSize: 12,
    color: '#00d2ff',
    fontWeight: '700',
  },

  // UYARI KUTUSU
  warningBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f8717111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f8717133',
  },
  warningText: {
    color: '#f87171',
    fontSize: 12,
    lineHeight: 18,
  },

  // PASIF ARAÇ KARTI
  vehicleCardDisabled: {
    opacity: 0.4,
  },
});
