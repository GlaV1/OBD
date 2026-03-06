import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardMenu() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Ana Menü</Text>
        <Text style={styles.subtitle}>Bağlantı Aktif 🟢</Text>
      </View>

      <View style={styles.grid}>
        {/* Canlı Veriler Butonu */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/live-data')}
        >
          <Text style={styles.icon}>📊</Text>
          <Text style={styles.cardTitle}>Canlı Veriler</Text>
          <Text style={styles.cardDesc}>RPM, Hız, Isı ve Yakıt</Text>
        </TouchableOpacity>

        {/* Hata Kodları Butonu */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/fault-codes')}
        >
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.cardTitle}>Hata Kodları</Text>
          <Text style={styles.cardDesc}>DTC Oku ve Sil</Text>
        </TouchableOpacity>

        {/* Araç Bilgileri Butonu */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => console.log('Araç Bilgilerine tıklandı')}
        >
          <Text style={styles.icon}>🚘</Text>
          <Text style={styles.cardTitle}>Araç Bilgileri</Text>
          <Text style={styles.cardDesc}>VIN, ECU Versiyonu</Text>
        </TouchableOpacity>

        {/* Ayarlar Butonu */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => console.log('Ayarlara tıklandı')}
        >
          <Text style={styles.icon}>⚙️</Text>
          <Text style={styles.cardTitle}>Ayarlar</Text>
          <Text style={styles.cardDesc}>Bağlantı ve Birimler</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2d',
    padding: 20,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#4ade80', // Yeşil renk
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#2b2b40',
    width: '47%', // Yanyana iki kutu sığması için
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 12,
    color: '#a1a1aa',
    textAlign: 'center',
  }
});