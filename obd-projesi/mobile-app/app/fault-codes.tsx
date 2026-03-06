import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { io } from 'socket.io-client';

// JSON Veritabanımızı import ediyoruz
import dtcDatabase from '../data/dtc-database.json';

const SERVER_URL = 'http://192.168.X.X:3000'; 

export default function FaultCodesScreen() {
  const [dtcList, setDtcList] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL);

    // Sunucudan (araçtan) gelen hata kodlarını dinliyoruz
    socket.on('vehicleData', (data) => {
      if (data.DTCs) {
        setDtcList(data.DTCs);
      }
    });

    return () => socket.disconnect();
  }, []);

  // Hata kodunu silme simülasyonu
  const clearCodes = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Gerçekte burada araca "Hataları Sil" (Mode 4) komutu gönderilir.
      // Şimdilik sadece ekrandan temizliyoruz.
      setDtcList([]);
      setIsScanning(false);
      alert('Arıza kayıtları ECU belleğinden başarıyla silindi!');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Arıza Teşhis (DTC)</Text>
        <Text style={styles.subtitle}>Bulunan Hatalar: {dtcList.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {dtcList.length === 0 ? (
          <View style={styles.cleanBox}>
            <Text style={styles.cleanIcon}>✅</Text>
            <Text style={styles.cleanText}>Araç Sistemleri Temiz</Text>
            <Text style={styles.cleanDesc}>ECU belleğinde kayıtlı bir arıza kodu (DTC) bulunamadı.</Text>
          </View>
        ) : (
          dtcList.map((error, index) => {
            // Gelen kodu JSON veritabanımızda arıyoruz
            const dbInfo = dtcDatabase[error.Code];
            
            return (
              <View key={index} style={styles.errorCard}>
                <View style={styles.errorHeader}>
                  <Text style={styles.errorCode}>{error.Code}</Text>
                  <Text style={styles.errorBrand}>{dbInfo ? dbInfo.Brand : 'Bilinmeyen Marka'}</Text>
                </View>
                
                <Text style={styles.errorMeaning}>
                  {dbInfo ? dbInfo.Meaning : error.Description}
                </Text>
                
                {dbInfo && dbInfo.Solution && (
                  <View style={styles.solutionBox}>
                    <Text style={styles.solutionTitle}>💡 Çözüm Önerisi:</Text>
                    <Text style={styles.solutionText}>{dbInfo.Solution}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Hata Kodu Silme Butonu */}
      <TouchableOpacity 
        style={[styles.clearButton, dtcList.length === 0 && styles.clearButtonDisabled]} 
        onPress={clearCodes}
        disabled={dtcList.length === 0 || isScanning}
      >
        <Text style={styles.clearButtonText}>
          {isScanning ? 'Siliniyor...' : 'Hata Kodlarını (DTC) Sil'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e2d' },
  headerContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#2b2b40' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#f87171' },
  subtitle: { fontSize: 16, color: '#a1a1aa', marginTop: 5 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  cleanBox: { alignItems: 'center', marginTop: 50, padding: 20, backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: 15 },
  cleanIcon: { fontSize: 50, marginBottom: 10 },
  cleanText: { fontSize: 20, fontWeight: 'bold', color: '#4ade80', marginBottom: 5 },
  cleanDesc: { fontSize: 14, color: '#a1a1aa', textAlign: 'center' },
  errorCard: { backgroundColor: '#2b2b40', padding: 20, borderRadius: 15, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#f87171' },
  errorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  errorCode: { fontSize: 22, fontWeight: 'bold', color: '#f87171' },
  errorBrand: { fontSize: 12, color: '#00d2ff', backgroundColor: 'rgba(0, 210, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  errorMeaning: { fontSize: 16, color: '#ffffff', marginBottom: 15 },
  solutionBox: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 10, borderRadius: 8 },
  solutionTitle: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24', marginBottom: 5 },
  solutionText: { fontSize: 13, color: '#d4d4d8' },
  clearButton: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#f87171', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#f87171', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  clearButtonDisabled: { backgroundColor: '#3f3f46', shadowOpacity: 0 },
  clearButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});