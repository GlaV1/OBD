import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BluetoothProvider, useBluetooth, getBTStatusColor, getBTStatusText } from '../context/BluetoothContext';
import { loadLanguage } from '../utils/i18n';

function BluetoothBanner() {
  const { status, lastError, scan } = useBluetooth();
  if (status === 'connected') return null;
  const color = getBTStatusColor(status);
  return (
    <TouchableOpacity
      style={[styles.banner, { borderBottomColor: color }]}
      onPress={status !== 'scanning' && status !== 'connecting' ? scan : undefined}
      activeOpacity={0.7}
    >
      <View style={[styles.bannerDot, { backgroundColor: color }]} />
      <Text style={[styles.bannerText, { color }]}>{lastError ?? getBTStatusText(status)}</Text>
      {(status === 'disconnected' || status === 'error') && (
        <Text style={styles.bannerAction}>Bağlan →</Text>
      )}
    </TouchableOpacity>
  );
}

function RootNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
      <BluetoothBanner />
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
        <Stack.Screen name="index"              options={{ headerShown: false }} />
        <Stack.Screen name="connect"            options={{ headerShown: false }} />
        <Stack.Screen name="dashboard"          options={{ headerShown: false }} />
        <Stack.Screen name="live-data"          options={{ title: 'Canlı Veriler',       headerBackTitle: 'Geri' }} />
        <Stack.Screen name="fault-codes"        options={{ title: 'Arıza Kodları',       headerBackTitle: 'Geri' }} />
        <Stack.Screen name="freeze-frame"       options={{ title: 'Freeze Frame',        headerBackTitle: 'Geri' }} />
        <Stack.Screen name="readiness"          options={{ title: 'Hazırlık Testleri',   headerBackTitle: 'Geri' }} />
        <Stack.Screen name="settings"           options={{ title: 'Ayarlar',             headerBackTitle: 'Geri' }} />
        <Stack.Screen name="appointments"       options={{ title: 'Randevular',          headerBackTitle: 'Geri' }} />
        <Stack.Screen name="appointment-form"   options={{ title: 'Randevu Kaydı',       headerBackTitle: 'İptal' }} />
        <Stack.Screen name="appointment-detail" options={{ title: 'Randevu Detayı',      headerBackTitle: 'Geri' }} />
        <Stack.Screen name="bluetooth-scan"     options={{ title: 'Bluetooth Cihazları', headerBackTitle: 'Geri' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [langReady, setLangReady] = useState(false);
  useEffect(() => { loadLanguage().then(() => setLangReady(true)); }, []);
  if (!langReady) return null;
  return (
    <BluetoothProvider>
      <RootNavigator />
    </BluetoothProvider>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d0d1a', paddingHorizontal: 16,
    paddingVertical: 8, borderBottomWidth: 1, gap: 8,
  },
  bannerDot:    { width: 6, height: 6, borderRadius: 3 },
  bannerText:   { flex: 1, fontSize: 12, fontWeight: '600' },
  bannerAction: { fontSize: 12, color: '#00d2ff', fontWeight: '700' },
});
