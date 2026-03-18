// app/freeze-frame.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useBluetooth } from '../context/BluetoothContext';
import tr from '../locales/tr';

const t = tr;

interface FrameItem { label: string; value: string; unit: string; }

export default function FreezeFrameScreen() {
  const { status, vehicleData } = useBluetooth();
  const isConnected = status === 'connected';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const data = vehicleData as any;

  const frameItems: FrameItem[] = [
    { label: t.freezeFrameLabels.rpm,         value: String(data?.rpm ?? '—'),                     unit: 'RPM' },
    { label: t.freezeFrameLabels.speed,        value: String(data?.speed ?? '—'),                   unit: 'km/h' },
    { label: t.freezeFrameLabels.coolantTemp,  value: String(data?.engineTemp ?? '—'),              unit: '°C' },
    { label: t.freezeFrameLabels.calculatedLoad, value: String(data?.throttle ?? '—'),              unit: '%' },
    { label: 'Akü Voltajı',                    value: String(data?.battery ?? '—'),                 unit: 'V' },
    { label: 'Yakıt Seviyesi',                 value: String(data?.fuelLevel ?? '—'),               unit: '%' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t.freezeFrame.title}</Text>
        <Text style={styles.subtitle}>{t.freezeFrame.subtitle}</Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#818cf8" size="large" />
            <Text style={styles.loadingText}>{t.freezeFrame.loading}</Text>
          </View>
        ) : !isConnected ? (
          <View style={styles.loadingBox}>
            <Text style={{ fontSize: 36 }}>🔌</Text>
            <Text style={styles.loadingText}>{t.connection.noConnection}</Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {frameItems.map((item, i) => (
                <View key={i} style={styles.card}>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                  <Text style={styles.cardValue}>{item.value}</Text>
                  <Text style={styles.cardUnit}>{item.unit}</Text>
                </View>
              ))}
            </View>
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{t.freezeFrame.note}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0d0d1a' },
  content:     { padding: 20, paddingBottom: 40 },
  title:       { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle:    { fontSize: 13, color: '#555', marginBottom: 24 },
  loadingBox:  { alignItems: 'center', paddingVertical: 60, gap: 16 },
  loadingText: { color: '#555', fontSize: 14 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%', backgroundColor: '#111122',
    borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#ffffff11',
  },
  cardLabel: { fontSize: 11, color: '#555', fontWeight: '600', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
  cardUnit:  { fontSize: 12, color: '#818cf8', marginTop: 2 },
  noteBox:   { marginTop: 20, padding: 14, borderRadius: 10, backgroundColor: '#818cf811', borderWidth: 1, borderColor: '#818cf822' },
  noteText:  { fontSize: 12, color: '#818cf8', lineHeight: 18 },
});
