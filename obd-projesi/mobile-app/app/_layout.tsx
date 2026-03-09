import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  ConnectionProvider,
  useConnection,
  getStatusColor,
  getStatusText,
} from '../context/ConnectionContext';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';
import { loadLanguage } from '../utils/i18n';

// --- GLOBAL BAĞLANTI BANNER'I ---
function ConnectionBanner() {
  const { status, lastError, connect, reconnectAttempt } = useConnection();
  const [activeError, setActiveError] = useState<OBDErrorDef | null>(null);

  // Bağlantı durumu değişince uygun hatayı göster
  useEffect(() => {
    if (status === 'connected') {
      setActiveError(null);
      return;
    }
    if (status === 'error') {
      if (reconnectAttempt > 0) {
        // Yeniden bağlanmaya çalışıyor — timeout hatası göster
        setActiveError({
          ...getError('CONNECTION_TIMEOUT'),
          message: `Yeniden bağlanılıyor... (${reconnectAttempt}/5)`,
        });
      } else {
        setActiveError(getError('CONNECTION_LOST'));
      }
    }
    if (status === 'disconnected') {
      setActiveError(null); // kasıtlı kesilmede hata gösterme
    }
  }, [status, reconnectAttempt]);

  // Bağlıysa banner yok
  if (status === 'connected') return null;

  const color = getStatusColor(status);
  const text = lastError || getStatusText(status);

  return (
    <View>
      {/* Üst ince banner — her zaman görünür */}
      <TouchableOpacity
        style={[styles.banner, { borderBottomColor: color }]}
        onPress={status === 'error' || status === 'disconnected' ? connect : undefined}
        activeOpacity={0.7}
      >
        <View style={[styles.bannerDot, { backgroundColor: color }]} />
        <Text style={[styles.bannerText, { color }]}>{text}</Text>
        {(status === 'disconnected' || status === 'error') && (
          <Text style={styles.bannerAction}>Bağlan →</Text>
        )}
      </TouchableOpacity>

      {/* Hata detayı — sadece error durumunda, modal olarak */}
      <ErrorView
        error={activeError}
        onDismiss={() => setActiveError(null)}
        onRetry={connect}
        mode="modal"
      />
    </View>
  );
}

// --- NAVIGATOR ---
function RootNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
      <ConnectionBanner />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0d0d1a' },
          headerTintColor: '#00d2ff',
          headerTitleStyle: { fontWeight: '700', color: '#ffffff', fontSize: 16 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0d0d1a' },
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="connect" options={{ headerShown: false }} />
        {/* Dashboard header'ı kapatıyoruz — kendi başlığını kendisi yönetiyor */}
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="live-data" options={{ title: 'Canlı Veriler', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="fault-codes" options={{ title: 'Arıza Kodları', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="freeze-frame" options={{ title: 'Freeze Frame', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="readiness" options={{ title: 'Hazırlık Testleri', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="settings" options={{ title: 'Ayarlar', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="appointments" options={{ title: 'Randevular', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="appointment-form" options={{ title: 'Randevu Kaydı', headerBackTitle: 'İptal' }} />
        <Stack.Screen name="appointment-detail" options={{ title: 'Randevu Detayı', headerBackTitle: 'Geri' }} />
      </Stack>
    </View>
  );
}

// --- ROOT LAYOUT ---
export default function RootLayout() {
  const [langReady, setLangReady] = useState(false);

  useEffect(() => {
    loadLanguage().then(() => setLangReady(true));
  }, []);

  if (!langReady) return null; // dil yüklenene kadar boş ekran (anlık)

  return (
    <ConnectionProvider>
      <RootNavigator />
    </ConnectionProvider>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  bannerDot: { width: 6, height: 6, borderRadius: 3 },
  bannerText: { flex: 1, fontSize: 12, fontWeight: '600' },
  bannerAction: { fontSize: 12, color: '#00d2ff', fontWeight: '700' },
});
