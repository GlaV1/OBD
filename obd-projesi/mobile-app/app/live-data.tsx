// app/live-data.tsx
import { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useLocalSearchParams } from 'expo-router';
import { useBluetooth } from '../context/BluetoothContext';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';
import { AVAILABLE_PARAMETERS, LiveDataParameter } from './live-data-selection';
import tr from '../locales/tr';

const screenWidth = Dimensions.get('window').width;
const CHART_HISTORY_LENGTH = 15;

export default function LiveDataScreen() {
  const { status, vehicleData } = useBluetooth();
  const isConnected = status === 'connected';
  const t = tr;

  const params = useLocalSearchParams<{ selectedParams: string }>();
  const selectedParamIds = params.selectedParams
    ? params.selectedParams.split(',')
    : ['rpm', 'speed', 'engineTemp'];

  const [hasReceivedData, setHasReceivedData] = useState(false);
  const [activeError, setActiveError]         = useState<OBDErrorDef | null>(null);
  const [history, setHistory]                 = useState<Record<string, number[]>>({});

  useEffect(() => {
    const initHist: Record<string, number[]> = {};
    selectedParamIds.forEach(id => { initHist[id] = new Array(CHART_HISTORY_LENGTH).fill(0); });
    setHistory(initHist);
  }, []);

  useEffect(() => {
    if (!isConnected) { setActiveError(getError('NOT_CONNECTED')); return; }
    setActiveError(null);
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;
    const data = vehicleData as any;
    if (typeof data?.rpm !== 'number') return;
    setHasReceivedData(true);
    setHistory(prev => {
      const next = { ...prev };
      selectedParamIds.forEach(id => {
        if (!next[id]) next[id] = new Array(CHART_HISTORY_LENGTH).fill(0);
        const val = data[id];
        if (typeof val === 'number') {
          const arr = [...next[id], val];
          if (arr.length > CHART_HISTORY_LENGTH) arr.shift();
          next[id] = arr;
        }
      });
      return next;
    });
  }, [vehicleData, isConnected]);

  const activeParams = selectedParamIds
    .map(id => AVAILABLE_PARAMETERS.find(p => p.id === id))
    .filter((p): p is LiveDataParameter => p !== undefined);

  const data = vehicleData as any;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={[styles.statusBox, { borderColor: isConnected ? '#4ade8033' : '#f8717133' }]}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4ade80' : '#f87171' }]} />
          <Text style={{ color: isConnected ? '#4ade80' : '#f87171', fontWeight: '700', fontSize: 13 }}>
            {isConnected ? t.connection.streaming : t.connection.noConnection}
          </Text>
        </View>

        <ErrorView
          error={activeError}
          onDismiss={() => setActiveError(null)}
          onRetry={() => setActiveError(null)}
        />

        <View style={styles.speedBox}>
          <Text style={styles.speedValue}>{data?.speed ?? 0}</Text>
          <Text style={styles.speedLabel}>km/h</Text>
        </View>

        {!hasReceivedData ? (
          <View style={styles.chartLoading}>
            <ActivityIndicator color="#00d2ff" size="large" />
            <Text style={styles.chartLoadingText}>
              {isConnected ? t.liveData.awaiting : t.liveData.noConnection}
            </Text>
          </View>
        ) : (
          <View style={styles.graphsContainer}>
            {activeParams.map((param, index) => {
              const dataPoints = history[param.id] || new Array(CHART_HISTORY_LENGTH).fill(0);
              const currentValue = data?.[param.id];
              const colors = ['#00d2ff', '#f87171', '#4ade80', '#facc15', '#a78bfa', '#fb923c'];
              const color = colors[index % colors.length];

              return (
                <View key={param.id} style={styles.chartBox}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>{(t.params as any)[param.key] ?? param.id}</Text>
                    <Text style={[styles.currentValue, { color }]}>
                      {typeof currentValue === 'number'
                        ? (Number.isInteger(currentValue) ? currentValue : currentValue.toFixed(1))
                        : '—'} {param.unit}
                    </Text>
                  </View>
                  <LineChart
                    data={{
                      labels: [],
                      datasets: [{ data: dataPoints.map(v => isNaN(v) ? 0 : v), color: () => color }],
                    }}
                    width={screenWidth - 48}
                    height={120}
                    withDots={false}
                    withInnerLines={false}
                    withOuterLines={false}
                    withHorizontalLabels={false}
                    withVerticalLabels={false}
                    chartConfig={{
                      backgroundColor: 'transparent',
                      backgroundGradientFrom: '#111122',
                      backgroundGradientTo: '#111122',
                      color: () => color,
                      strokeWidth: 2,
                      propsForBackgroundLines: { stroke: 'transparent' },
                    }}
                    bezier
                    style={{ borderRadius: 10, marginTop: 8 }}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0d0d1a' },
  scrollContent:    { padding: 16, paddingBottom: 40 },
  statusBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 8, borderWidth: 1,
    backgroundColor: '#0f0f1f', marginBottom: 16,
  },
  statusDot:        { width: 8, height: 8, borderRadius: 4 },
  speedBox:         { alignItems: 'center', marginVertical: 16 },
  speedValue:       { fontSize: 72, fontWeight: '800', color: '#fff' },
  speedLabel:       { fontSize: 16, color: '#555', marginTop: -8 },
  chartLoading:     { alignItems: 'center', paddingVertical: 40 },
  chartLoadingText: { color: '#555', marginTop: 12, fontSize: 14 },
  graphsContainer:  { gap: 16 },
  chartBox:         { backgroundColor: '#111122', borderRadius: 12, padding: 16 },
  chartHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle:       { color: '#aaa', fontSize: 13, fontWeight: '600' },
  currentValue:     { fontSize: 20, fontWeight: '800' },
});
