import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { io } from 'socket.io-client';
import { ProgressChart } from 'react-native-chart-kit'; // Grafik kütüphanemiz eklendi

// DİKKAT: Buraya kendi bilgisayarının IP adresini yazmayı unutma!
const SERVER_URL = 'http://192.168.1.101';
const screenWidth = Dimensions.get("window").width;

export default function App() {
  const [vehicleData, setVehicleData] = useState({
    RPM: 0,
    Speed: 0,
    EngineTemp: 0,
    FuelLevel: 0,
    DTCs: [] // Hata kodları dizisi
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL);

    socket.on('connect', () => setIsConnected(true));
    
    socket.on('vehicleData', (data) => {
      setVehicleData(data);
    });

    socket.on('disconnect', () => setIsConnected(false));

    return () => socket.disconnect();
  }, []);

  // Grafikler için verileri 0 ile 1 arasına (yüzdeye) çevirmemiz gerekiyor
  // Varsayım: Max RPM: 8000, Max Temp: 120, Max Fuel: 100
  const chartData = {
    labels: ["RPM", "Yakıt", "Isı"],
    data: [
      Math.min(vehicleData.RPM / 8000, 1), 
      Math.min(vehicleData.FuelLevel / 100, 1), 
      Math.min(vehicleData.EngineTemp / 120, 1)
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
        
        <Text style={styles.header}>OBD Canlı Veri</Text>
        
        <View style={styles.statusBox}>
          <Text style={{ color: isConnected ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
            {isConnected ? '🟢 ECU Bağlı ve Veri Akıyor' : '🔴 ECU Bağlantısı Yok'}
          </Text>
        </View>

        {/* --- DİJİTAL HIZ GÖSTERGESİ --- */}
        <View style={styles.speedBox}>
          <Text style={styles.speedValue}>{vehicleData.Speed}</Text>
          <Text style={styles.speedLabel}>km/h</Text>
        </View>

        {/* --- HALKA GRAFİKLER (RPM, Yakıt, Isı) --- */}
        <ProgressChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            backgroundGradientFrom: "#1e1e2d",
            backgroundGradientTo: "#1e1e2d",
            color: (opacity = 1, index) => {
              // Halka renkleri: RPM Mavi, Yakıt Yeşil/Sarı, Isı Kırmızı/Turuncu
              if (index === 0) return `rgba(0, 210, 255, ${opacity})`; 
              if (index === 1) return `rgba(74, 222, 128, ${opacity})`;
              return `rgba(248, 113, 113, ${opacity})`;
            },
            labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
          }}
          hideLegend={false}
          style={{ borderRadius: 16, marginVertical: 20 }}
        />

        {/* --- HATA KODLARI (DTC) MODÜLÜ --- */}
        <View style={styles.dtcContainer}>
          <Text style={styles.dtcHeader}>Arıza Kayıtları (DTC)</Text>
          
          {vehicleData.DTCs.length === 0 ? (
            <Text style={styles.noError}>Sistem Temiz, Arıza Yok 🟢</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#1e1e2d', // Lacivert/Siyah koyu tema
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  statusBox: {
    marginBottom: 20,
    backgroundColor: '#2b2b40',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  speedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#00d2ff',
    backgroundColor: '#2b2b40',
    marginBottom: 10,
    shadowColor: '#00d2ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  speedValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  speedLabel: {
    fontSize: 20,
    color: '#a1a1aa',
  },
  dtcContainer: {
    width: '90%',
    backgroundColor: '#2b2b40',
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
  },
  dtcHeader: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
    paddingBottom: 5,
  },
  noError: {
    color: '#4ade80',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)', // Hafif kırmızı arka plan
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f87171',
  },
  errorCode: {
    color: '#f87171',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorDesc: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 5,
  }
});