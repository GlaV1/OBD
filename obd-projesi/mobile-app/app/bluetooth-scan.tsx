// app/bluetooth-scan.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  TouchableOpacity, FlatList, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBluetooth, BTDevice, getBTStatusColor, getBTStatusText } from '../context/BluetoothContext';

export default function BluetoothScanScreen() {
  const router = useRouter();
  const { status, devices, connectedDevice, lastError, scan, connect, disconnect } = useBluetooth();
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => { scan(); }, []);

  const handleConnect = async (device: BTDevice) => {
    setConnecting(device.address);
    try {
      await connect(device);
      router.back();
    } catch {
      Alert.alert('Hata', 'Bağlantı kurulamadı.');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = () => {
    Alert.alert('Bağlantıyı Kes', `${connectedDevice?.name} cihazından ayrılınsın mı?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Kes', style: 'destructive', onPress: disconnect },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

      <View style={[styles.statusBar, { borderColor: getBTStatusColor(status) + '44' }]}>
        <View style={[styles.dot, { backgroundColor: getBTStatusColor(status) }]} />
        <Text style={[styles.statusText, { color: getBTStatusColor(status) }]}>
          {lastError ?? getBTStatusText(status)}
        </Text>
      </View>

      {connectedDevice && (
        <View style={styles.connectedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.connectedLabel}>Bağlı Cihaz</Text>
            <Text style={styles.connectedName}>{connectedDevice.name}</Text>
            <Text style={styles.connectedAddr}>{connectedDevice.address}</Text>
          </View>
          <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
            <Text style={styles.disconnectText}>Bağlantıyı Kes</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>EŞLEŞTİRİLMİŞ CİHAZLAR</Text>
        <TouchableOpacity onPress={scan} disabled={status === 'scanning'}>
          <Text style={styles.refreshText}>{status === 'scanning' ? 'Aranıyor...' : '↻ Yenile'}</Text>
        </TouchableOpacity>
      </View>

      {status === 'scanning' ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00d2ff" size="large" />
          <Text style={styles.hint}>Bluetooth cihazları aranıyor...</Text>
        </View>
      ) : devices.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📡</Text>
          <Text style={styles.emptyText}>Eşleştirilmiş cihaz yok</Text>
          <Text style={styles.hint}>Telefon Bluetooth ayarlarından HC-06'yı önce eşleştirin (PIN: 1234)</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={scan}>
            <Text style={styles.retryText}>Tekrar Tara</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={item => item.address}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isConnected = connectedDevice?.address === item.address;
            const isConnecting = connecting === item.address;
            return (
              <TouchableOpacity
                style={[styles.deviceCard, isConnected && styles.deviceCardActive]}
                onPress={() => !isConnected && handleConnect(item)}
                disabled={isConnecting || isConnected}
                activeOpacity={0.75}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 22 }}>📶</Text>
                  <View>
                    <Text style={styles.deviceName}>{item.name}</Text>
                    <Text style={styles.deviceAddr}>{item.address}</Text>
                  </View>
                </View>
                {isConnecting ? (
                  <ActivityIndicator color="#00d2ff" size="small" />
                ) : isConnected ? (
                  <Text style={{ color: '#4ade80', fontWeight: '700' }}>Bağlı ✓</Text>
                ) : (
                  <Text style={{ color: '#00d2ff', fontWeight: '700' }}>Bağlan →</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0d0d1a' },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, padding: 12, borderRadius: 10,
    borderWidth: 1, backgroundColor: '#0f0f1f',
  },
  dot:            { width: 8, height: 8, borderRadius: 4 },
  statusText:     { fontSize: 13, fontWeight: '600', flex: 1 },
  connectedCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 12,
    padding: 14, borderRadius: 12,
    backgroundColor: '#0a2a1a', borderWidth: 1, borderColor: '#4ade8033',
  },
  connectedLabel: { fontSize: 11, color: '#4ade80', fontWeight: '700' },
  connectedName:  { fontSize: 16, color: '#fff', fontWeight: '700' },
  connectedAddr:  { fontSize: 12, color: '#555' },
  disconnectBtn:  { padding: 10, borderRadius: 8, backgroundColor: '#f8717122' },
  disconnectText: { color: '#f87171', fontWeight: '700', fontSize: 13 },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 8,
  },
  listTitle:    { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  refreshText:  { color: '#00d2ff', fontSize: 13, fontWeight: '600' },
  deviceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111122', borderRadius: 12, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#ffffff11',
  },
  deviceCardActive: { borderColor: '#4ade8044', backgroundColor: '#0a1a12' },
  deviceName:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  deviceAddr:   { color: '#555', fontSize: 12 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText:    { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  hint:         { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  retryBtn:     { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: '#00d2ff22' },
  retryText:    { color: '#00d2ff', fontWeight: '700' },
});
