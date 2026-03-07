import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ConnectionProvider, useConnection, getStatusColor, getStatusText } from '../context/ConnectionContext';

// --- GLOBAL BAĞLANTI BANNER'I ---
function ConnectionBanner() {
  const { status, lastError, connect } = useConnection();

  if (status === 'connected') return null;

  const color = getStatusColor(status);
  const text = lastError || getStatusText(status);

  return (
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
          headerTitleStyle: {
            fontWeight: '700',
            color: '#ffffff',
            fontSize: 16,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0d0d1a' },
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ title: 'Dashboard', headerBackTitle: 'Araçlar' }} />
        <Stack.Screen name="live-data" options={{ title: 'Canlı Veriler', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="fault-codes" options={{ title: 'Arıza Kodları', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="freeze-frame" options={{ title: 'Freeze Frame', headerBackTitle: 'Geri' }} />
        <Stack.Screen name="readiness" options={{ title: 'Hazırlık Testleri', headerBackTitle: 'Geri' }} />
      </Stack>
    </View>
  );
}

// --- ROOT LAYOUT ---
export default function RootLayout() {
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
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  bannerAction: {
    fontSize: 12,
    color: '#00d2ff',
    fontWeight: '700',
  },
});
