import { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { LineChart } from 'react-native-chart-kit';
import { useLocalSearchParams } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import { useTranslation } from '../utils/i18n';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';
import { AVAILABLE_PARAMETERS, LiveDataParameter } from './live-data-selection';

const SERVER_URL = 'http://192.168.X.X:3000';
const screenWidth = Dimensions.get('window').width;

interface DTC { Code: string; Description: string; }
interface VehicleData {
  RPM: number; Speed: number;
  EngineTemp: number; OilTemp: number; TurboBoost: number;
  O2Voltage: number; BatteryVolts: number; FuelLevel: number;
  DTCs: DTC[];
}

const DEFAULT_DATA: VehicleData = {
  RPM: 0, Speed: 0, EngineTemp: 0, OilTemp: 0, TurboBoost: 0,
  O2Voltage: 0, BatteryVolts: 0, FuelLevel: 0, DTCs: [],
};

const CHART_HISTORY_LENGTH = 15;

export default function LiveDataScreen() {
  const { status } = useConnection();
  const { t } = useTranslation();
  const isConnected = status === 'connected';

  const params = useLocalSearchParams<{ selectedParams: string }>();
  const selectedParamIds = params.selectedParams ? params.selectedParams.split(',') : ['RPM', 'Speed', 'EngineTemp'];

  const [vehicleData, setVehicleData] = useState<VehicleData>(DEFAULT_DATA);
  const [hasReceivedData, setHasReceivedData] = useState(false);
  const [activeError, setActiveError] = useState<OBDErrorDef | null>(null);
  const [history, setHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const initHist: Record<string, number[]> = {};
    selectedParamIds.forEach(id => { initHist[id] = new Array(CHART_HISTORY_LENGTH).fill(0); });
    setHistory(initHist);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      setActiveError(getError('NOT_CONNECTED'));
      return;
    }

    setActiveError(null);
    const socket: Socket = io(SERVER_URL);

    socket.on('vehicleData', (data: VehicleData) => {
      try {
        if (data && typeof data.RPM === 'number') {
          setVehicleData(data);
          setHasReceivedData(true);
          setActiveError(null);
          setHistory(prev => {
            const nextHist = { ...prev };
            selectedParamIds.forEach(id => {
              if (!nextHist[id]) nextHist[id] = new Array(CHART_HISTORY_LENGTH).fill(0);
              const val = data[id as keyof VehicleData];
              if (typeof val === 'number') {
                const arr = [...nextHist[id], val];
                if (arr.length > CHART_HISTORY_LENGTH) arr.shift();
                nextHist[id] = arr;
              }
            });
            return nextHist;
          });
        } else {
          setActiveError(getError('DATA_PARSE_ERROR'));
        }
      } catch {
        setActiveError(getError('DATA_PARSE_ERROR'));
      }
    });

    socket.on('disconnect', () => setActiveError(getError('DATA_STREAM_LOST')));
    socket.on('connect_error', () => setActiveError(getError('CONNECTION_LOST')));

    return () => { socket.disconnect(); };
  }, [isConnected]);

  const activeParams = selectedParamIds
    .map(id => AVAILABLE_PARAMETERS.find(p => p.id === id))
    .filter((p): p is LiveDataParameter => p !== undefined);

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
          <Text style={styles.speedValue}>{vehicleData.Speed}</Text>
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
              const currentValue = vehicleData[param.id as keyof VehicleData];
              const colors = ['#00d2ff', '#f87171', '#4ade80', '#facc15', '#a78bfa', '#fb923c'];
              const color = colors[index % colors.length];

              return (
                <View key={param.id} style={styles.chartBox}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>{t.params[param.key]}</Text>
                    <Text style={[styles.currentValue, { color }]}>
                      {typeof currentValue === 'number'
                        ? (Number.isInteger(currentValue) ? currentValue : currentValue.toFixed(2))
                        : String(currentValue)}
                      <Text style={styles.unitText}> {param.unit}</Text>
                    </Text>
                  </View>

                  <LineChart
                    data={{ labels: [], datasets: [{ data: dataPoints }] }}
                    width={screenWidth - 48}
                    height={100}
                    withDots={false}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLabels={false}
                    withHorizontalLabels={false}
                    chartConfig={{
                      backgroundColor: '#1a1a2e',
                      backgroundGradientFrom: '#1a1a2e',
                      backgroundGradientTo: '#1a1a2e',
                      decimalPlaces: 0,
                      color: () => color,
                      labelColor: () => '#555',
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 12, paddingRight: 0 }}
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
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  scrollContent: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16, paddingBottom: 40 },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1a1a2e', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginBottom: 16, alignSelf: 'stretch', justifyContent: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  speedBox: { alignItems: 'center', justifyContent: 'center', width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: '#00d2ff', backgroundColor: '#1a1a2e', marginBottom: 24, shadowColor: '#00d2ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  speedValue: { fontSize: 56, fontWeight: '800', color: '#ffffff' },
  speedLabel: { fontSize: 14, color: '#00d2ff', fontWeight: '700' },
  chartLoading: { height: 200, alignItems: 'center', justifyContent: 'center', gap: 12 },
  chartLoadingText: { color: '#555', fontSize: 13 },
  graphsContainer: { width: '100%', gap: 16 },
  chartBox: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#ffffff08' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chartTitle: { fontSize: 13, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  currentValue: { fontSize: 24, fontWeight: '800' },
  unitText: { fontSize: 12, color: '#666', fontWeight: '600' },
});
