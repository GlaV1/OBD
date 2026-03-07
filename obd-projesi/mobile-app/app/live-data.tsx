import { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  Dimensions, ScrollView, ActivityIndicator
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { ProgressChart } from 'react-native-chart-kit';
import { useConnection } from '../context/ConnectionContext';

const SERVER_URL = 'http://192.168.X.X:3000';
const screenWidth = Dimensions.get('window').width;

interface DTC {
  Code: string;
  Description: string;
}

interface VehicleData {
  RPM: number;
  Speed: number;
  EngineTemp: number;
  FuelLevel: number;
  DTCs: DTC[];
}

const DEFAULT_DATA: VehicleData = {
  RPM: 0, Speed: 0, EngineTemp: 0, FuelLevel: 0, DTCs: [],
};

export default function LiveDataScreen() {
  const { status } = useConnection();
  const isConnected = status === 'connected';

  const [vehicleData, setVehicleData] = useState<VehicleData>(DEFAULT_DATA);
  const [hasReceivedData, setHasReceivedData] = useState(false); // ilk veri geldi mi?

  useEffect(() => {
    if (!isConnected) return;

    const socket: Socket = io(SERVER_URL);

    socket.on('vehicleData', (data: VehicleData) => {
      if (data && typeof data.RPM === 'number') {
        setVehicleData(data);
        setHasReceivedData(true);
      }
    });

    socket.on('disconnect', () => {
      // Bağlantı kopunca son veriyi koru, banner zaten uyarır
    });

    return () => {
      socket.disconnect();
    };
  }, [isConnected]);

  // Grafik için değerleri 0-1 arasına normalize et
  // Sıfır veri gelirse grafik yerine loading göster
  const chartData = {
    labels: ['RPM', 'Yakıt', 'Isı'],
    data: [
      Math.min(Math.max(vehicleData.RPM / 8000, 0.01), 1),   // min 0.01 — grafik 0'da bozulmasın
      Math.min(Math.max(vehicleData.FuelLevel / 100, 0.01), 1),
      Math.min(Math.max(vehicleData.EngineTemp / 120, 0.01), 1),
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* BAĞLANTI DURUMU */}
        <View style={[
          styles.statusBox,
          { borderColor: isConnected ? '#4ade8033' : '#f8717133' }
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isConnected ? '#4ade80' : '#f87171' }
          ]} />
          <Text style={{
            color: isConnected ? '#4ade80' : '#f87171',
            fontWeight: '700', fontSize: 13
          }}>
            {isConnected ? 'ECU Bağlı — Veri Akıyor' : 'ECU Bağlantısı Yok'}
          </Text>
        </View>

        {/* HIZ GÖSTERGESİ */}
        <View style={styles.speedBox}>
          <Text style={styles.speedValue}>{vehicleData.Speed}</Text>
          <Text style={styles.speedLabel}>km/h</Text>
        </View>

        {/* HALKA GRAFİKLER — veri gelene kadar loading göster */}
        <View style={styles.chartBox}>
          {!hasReceivedData ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator color="#00d2ff" size="large" />
              <Text style={styles.chartLoadingText}>Veri bekleniyor...</Text>
            </View>
          ) : (
            <ProgressChart
              data={chartData}
              width={screenWidth - 48}
              height={200}
              strokeWidth={14}
              radius={28}
              chartConfig={{
                backgroundGradientFrom: '#1a1a2e',
                backgroundGradientTo: '#1a1a2e',
                color: (opacity = 1, index) => {
                  if (index === 0) return `rgba(0, 210, 255, ${opacity})`;
                  if (index === 1) return `rgba(74, 222, 128, ${opacity})`;
                  return `rgba(248, 113, 113, ${opacity})`;
                },
                labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
              }}
              hideLegend={false}
              style={{ borderRadius: 12 }}
            />
          )}
        </View>

        {/* DETAY KUTULARI */}
        <View style={styles.grid}>
          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>RPM</Text>
            <Text style={[styles.dataValue, { color: '#00d2ff' }]}>
              {hasReceivedData ? vehicleData.RPM : '—'}
            </Text>
          </View>
          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Motor Isısı</Text>
            <Text style={[styles.dataValue, { color: '#f87171' }]}>
              {hasReceivedData ? `${vehicleData.EngineTemp.toFixed(1)}°C` : '—'}
            </Text>
          </View>
          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Yakıt</Text>
            <Text style={[styles.dataValue, { color: '#4ade80' }]}>
              {hasReceivedData ? `%${vehicleData.FuelLevel.toFixed(1)}` : '—'}
            </Text>
          </View>
          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Hız</Text>
            <Text style={[styles.dataValue, { color: '#facc15' }]}>
              {hasReceivedData ? `${vehicleData.Speed} km/h` : '—'}
            </Text>
          </View>
        </View>

        {/* HATA KODLARI */}
        <View style={styles.dtcContainer}>
          <Text style={styles.dtcHeader}>Arıza Kayıtları</Text>
          {vehicleData.DTCs.length === 0 ? (
            <Text style={styles.noError}>✅ Sistem Temiz</Text>
          ) : (
            vehicleData.DTCs.map((error, index) => (
              <View key={index} style={styles.errorBox}>
                <Text style={styles.errorCode}>⚠️ {error.Code}</Text>
                <Text style={styles.errorDesc}>{error.Description}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  statusBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1a1a2e', paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 20, borderWidth: 1,
    marginBottom: 24, alignSelf: 'stretch', justifyContent: 'center',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  speedBox: {
    alignItems: 'center', justifyContent: 'center',
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 3, borderColor: '#00d2ff',
    backgroundColor: '#1a1a2e', marginBottom: 24,
    shadowColor: '#00d2ff', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  speedValue: { fontSize: 64, fontWeight: '800', color: '#ffffff' },
  speedLabel: { fontSize: 16, color: '#555', fontWeight: '600' },
  chartBox: {
    backgroundColor: '#1a1a2e', borderRadius: 16,
    padding: 8, marginBottom: 16, borderWidth: 1,
    borderColor: '#ffffff08', alignSelf: 'stretch',
    minHeight: 216,
  },
  chartLoading: {
    height: 200, alignItems: 'center',
    justifyContent: 'center', gap: 12,
  },
  chartLoadingText: { color: '#555', fontSize: 13 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, alignSelf: 'stretch', marginBottom: 16,
  },
  dataCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#1a1a2e',
    borderRadius: 12, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#ffffff08',
  },
  dataLabel: {
    fontSize: 11, color: '#555', fontWeight: '600',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  dataValue: { fontSize: 24, fontWeight: '800' },
  dtcContainer: {
    alignSelf: 'stretch', backgroundColor: '#1a1a2e',
    padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: '#ffffff08',
  },
  dtcHeader: {
    fontSize: 14, color: '#ffffff', fontWeight: '700',
    marginBottom: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#ffffff08',
  },
  noError: { color: '#4ade80', fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.08)', padding: 12,
    borderRadius: 10, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#f87171',
  },
  errorCode: { color: '#f87171', fontSize: 15, fontWeight: '700', fontFamily: 'monospace' },
  errorDesc: { color: '#aaa', fontSize: 12, marginTop: 4 },
});
