import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useConnection } from '../context/ConnectionContext';
import dtcDatabase from '../data/dtc-database.json';

const SERVER_URL = 'http://192.168.X.X:3000';

interface DTC {
  Code: string;
  Description: string;
}

interface DTCEntry {
  Meaning: string;
  Brand: string;
  Solution?: string;
}

export default function FaultCodesScreen() {
  const { status } = useConnection();
  const isConnected = status === 'connected';

  const [dtcList, setDtcList] = useState<DTC[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const clearingRef = useRef(false); // çift tıklama koruması

  useEffect(() => {
    if (!isConnected) return;

    const socket: Socket = io(SERVER_URL);

    socket.on('vehicleData', (data) => {
      if (Array.isArray(data?.DTCs)) {
        setDtcList(data.DTCs);
      }
    });

    socket.on('disconnect', () => {
      // Bağlantı kopunca listeyi temizleme, son veriyi göster
      // Kullanıcı bağlantı kesildi bilgisini banner'dan görür
    });

    return () => {
      socket.disconnect();
    };
  }, [isConnected]);

  const clearCodes = () => {
    // Çift tıklama koruması
    if (clearingRef.current) return;
    if (!isConnected) {
      Alert.alert('Bağlantı Yok', 'Hata kodlarını silmek için OBD cihazına bağlı olmanız gerekiyor.');
      return;
    }

    Alert.alert(
      'Hata Kodlarını Sil',
      'ECU belleğindeki tüm arıza kayıtları silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            clearingRef.current = true;
            setIsClearing(true);
            setTimeout(() => {
              setDtcList([]);
              setIsClearing(false);
              clearingRef.current = false;
              Alert.alert('✅ Tamamlandı', 'Arıza kayıtları ECU belleğinden silindi.');
            }, 1500);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Arıza Teşhis (DTC)</Text>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>{dtcList.length} kayıt</Text>
          {!isConnected && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>Çevrimdışı</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {dtcList.length === 0 ? (
          <View style={styles.cleanBox}>
            <Text style={styles.cleanIcon}>✅</Text>
            <Text style={styles.cleanText}>Araç Sistemleri Temiz</Text>
            <Text style={styles.cleanDesc}>
              ECU belleğinde kayıtlı arıza kodu bulunamadı.
            </Text>
          </View>
        ) : (
          dtcList.map((error, index) => {
            const dbInfo = (dtcDatabase as Record<string, DTCEntry>)[error.Code];
            const isKnown = !!dbInfo;

            return (
              <View key={index} style={[
                styles.errorCard,
                !isKnown && styles.errorCardUnknown
              ]}>
                <View style={styles.errorHeader}>
                  <Text style={styles.errorCode}>{error.Code}</Text>
                  <Text style={[
                    styles.errorBrand,
                    !isKnown && styles.errorBrandUnknown
                  ]}>
                    {isKnown ? dbInfo.Brand : 'Bilinmiyor'}
                  </Text>
                </View>

                <Text style={styles.errorMeaning}>
                  {isKnown ? dbInfo.Meaning : 'Bilinmeyen Hata'}
                </Text>

                {!isKnown && (
                  <View style={styles.unknownBox}>
                    <Text style={styles.unknownText}>
                      ⚠️ Bu kod veritabanımızda kayıtlı değil. Yetkili servis ile iletişime geçin.
                    </Text>
                  </View>
                )}

                {isKnown && dbInfo.Solution && (
                  <View style={styles.solutionBox}>
                    <Text style={styles.solutionTitle}>💡 Çözüm Önerisi</Text>
                    <Text style={styles.solutionText}>{dbInfo.Solution}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.clearButton,
          (dtcList.length === 0 || isClearing || !isConnected) && styles.clearButtonDisabled
        ]}
        onPress={clearCodes}
        disabled={dtcList.length === 0 || isClearing || !isConnected}
      >
        <Text style={styles.clearButtonText}>
          {isClearing ? 'Siliniyor...' : 'Hata Kodlarını Sil'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  header: { fontSize: 22, fontWeight: '800', color: '#f87171' },
  subtitle: { fontSize: 14, color: '#555' },
  offlineBadge: {
    backgroundColor: '#f8717122',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f8717144',
  },
  offlineBadgeText: { fontSize: 11, color: '#f87171', fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  cleanBox: {
    alignItems: 'center',
    marginTop: 60,
    padding: 24,
    backgroundColor: '#4ade8008',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4ade8022',
  },
  cleanIcon: { fontSize: 48, marginBottom: 12 },
  cleanText: { fontSize: 18, fontWeight: '700', color: '#4ade80', marginBottom: 6 },
  cleanDesc: { fontSize: 13, color: '#555', textAlign: 'center' },
  errorCard: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f87171',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  errorCardUnknown: {
    borderLeftColor: '#facc15',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorCode: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f87171',
    fontFamily: 'monospace',
  },
  errorBrand: {
    fontSize: 11,
    color: '#00d2ff',
    backgroundColor: '#00d2ff15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  errorBrandUnknown: {
    color: '#facc15',
    backgroundColor: '#facc1515',
  },
  errorMeaning: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 10,
    lineHeight: 20,
  },
  unknownBox: {
    backgroundColor: '#facc1508',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#facc15',
  },
  unknownText: {
    fontSize: 12,
    color: '#facc15',
    lineHeight: 18,
  },
  solutionBox: {
    backgroundColor: '#fbbf2408',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
  },
  solutionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 4,
  },
  solutionText: { fontSize: 13, color: '#d4d4d8', lineHeight: 19 },
  clearButton: {
    position: 'absolute',
    bottom: 30, left: 16, right: 16,
    backgroundColor: '#f87171',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 8,
  },
  clearButtonDisabled: {
    backgroundColor: '#1a1a2e',
    elevation: 0,
  },
  clearButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
