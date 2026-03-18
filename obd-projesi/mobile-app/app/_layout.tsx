// app/_layout.tsx
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import {
  BluetoothProvider, useBluetooth,
  getBTStatusColor, getBTStatusText,
} from '../context/BluetoothContext';
import { loadLanguage } from '../utils/i18n';

// Sadece durum gösterir, tıklanamaz
function StatusBanner() {
  const { status } = useBluetooth();
  const color = getBTStatusColor(status);
  const text  = getBTStatusText(status);

  return (
    <View style={[styles.banner, { borderBottomColor: color + '55' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.bannerText, { color }]}>{text}</Text>
    </View>
  );
}

function RootNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
      <StatusBanner />
      <Stack
        screenOptions={{
          headerStyle:      { backgroundColor: '#0d0d1a' },
          headerTintColor:  '#00d2ff',
          headerTitleStyle: { fontWeight: '700', color: '#ffffff', fontSize: 16 },
          headerShadowVisible: false,
          contentStyle:     { backgroundColor: '#0d0d1a' },
          animation:        'slide_from_right',
          gestureEnabled:   true,
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
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor:'#0d0d1a',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 8,
  },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  bannerText: { fontSize: 12, fontWeight: '600' },
});
