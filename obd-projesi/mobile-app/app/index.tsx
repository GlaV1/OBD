import React, { useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  TouchableOpacity, ScrollView, StatusBar, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { initDB } from '../utils/appointmentDb';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Veritabanını başlat
    try {
      initDB();
    } catch (e) {
      console.error('DB Init Error:', e);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>OBD Pro</Text>
          <Text style={styles.subtitle}>Profesyonel Araç Teşhis & Randevu</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => router.push('/connect' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.buttonIcon}>🔌</Text>
            </View>
            <View style={styles.buttonTextContent}>
              <Text style={styles.buttonTitle}>Araca Bağlan</Text>
              <Text style={styles.buttonDesc}>OBD cihazı ile araç verilerini oku</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainButton, styles.mt16]}
            onPress={() => router.push('/appointments' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#4ade8022' }]}>
              <Text style={styles.buttonIcon}>📅</Text>
            </View>
            <View style={styles.buttonTextContent}>
              <Text style={[styles.buttonTitle, { color: '#4ade80' }]}>Randevular</Text>
              <Text style={styles.buttonDesc}>Müşteri randevularını yönet ve ekle</Text>
            </View>
            <Text style={[styles.arrowIcon, { color: '#4ade80' }]}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🛠️</Text>
            <Text style={styles.infoTitle}>Servis Takibi</Text>
            <Text style={styles.infoText}>Randevuları kolayca planlayın.</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🔍</Text>
            <Text style={styles.infoTitle}>Hızlı Teşhis</Text>
            <Text style={styles.infoText}>Hataları saniyeler içinde bulun.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versiyon 1.0.0 — Premium OBD Solutions</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  scrollContent: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#555', marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },
  buttonContainer: { marginBottom: 40 },
  mainButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff11',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  mt16: { marginTop: 16 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#00d2ff22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: { fontSize: 28 },
  buttonTextContent: { flex: 1, marginLeft: 16 },
  buttonTitle: { fontSize: 20, fontWeight: '800', color: '#00d2ff' },
  buttonDesc: { fontSize: 13, color: '#555', marginTop: 2 },
  arrowIcon: { fontSize: 24, color: '#00d2ff', fontWeight: '800' },
  infoSection: { flexDirection: 'row', gap: 16 },
  infoCard: {
    flex: 1,
    backgroundColor: '#ffffff05',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  infoIcon: { fontSize: 24, marginBottom: 12 },
  infoTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  infoText: { color: '#444', fontSize: 12, lineHeight: 18 },
  footer: { padding: 20, alignItems: 'center' },
  footerText: { color: '#222', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});
