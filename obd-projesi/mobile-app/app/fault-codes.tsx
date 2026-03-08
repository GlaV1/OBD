import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useConnection } from '../context/ConnectionContext';
import { useTranslation } from '../utils/i18n';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';
import dtcDatabase from '../data/dtc-database.json';

const SERVER_URL = 'http://192.168.X.X:3000';

interface DTC { Code: string; }
interface DtcEntry { Meaning: string; Solution?: string; Brand: string; }

export default function FaultCodesScreen() {
  const { status } = useConnection();
  const { t } = useTranslation();
  const isConnected = status === 'connected';

  const [dtcList, setDtcList] = useState<DTC[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [activeError, setActiveError] = useState<OBDErrorDef | null>(null);
  const clearingRef = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      setActiveError(getError('NOT_CONNECTED'));
      return;
    }

    setActiveError(null);
    const socket: Socket = io(SERVER_URL);

    socket.on('vehicleData', (data: any) => {
      try {
        if (data?.DTCs && Array.isArray(data.DTCs)) {
          setDtcList(data.DTCs);
          setActiveError(null);
        }
      } catch {
        setActiveError(getError('DATA_PARSE_ERROR'));
      }
    });

    socket.on('disconnect', () => setActiveError(getError('DATA_STREAM_LOST')));
    socket.on('connect_error', () => setActiveError(getError('CONNECTION_LOST')));

    return () => { socket.disconnect(); };
  }, [isConnected]);

  const clearCodes = () => {
    if (clearingRef.current) return;
    if (!isConnected) { setActiveError(getError('NOT_CONNECTED')); return; }

    Alert.alert(
      t.faultCodes.confirmClearTitle,
      t.faultCodes.confirmClearDesc,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.faultCodes.delete, style: 'destructive',
          onPress: async () => {
            clearingRef.current = true;
            setIsClearing(true);
            try {
              await new Promise(r => setTimeout(r, 1500));
              setDtcList([]);
              Alert.alert(t.faultCodes.clearSuccess, t.faultCodes.clearSuccessDesc);
            } catch {
              setActiveError(getError('DTC_CLEAR_FAILED'));
            } finally {
              setIsClearing(false);
              clearingRef.current = false;
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{t.faultCodes.title}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>{dtcList.length} {t.faultCodes.records}</Text>
          {!isConnected && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>{t.connection.offline}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ErrorView
          error={activeError}
          onDismiss={() => setActiveError(null)}
          onRetry={() => setActiveError(null)}
        />

        {dtcList.length === 0 && !activeError ? (
          <View style={styles.cleanBox}>
            <Text style={styles.cleanIcon}>✅</Text>
            <Text style={styles.cleanText}>{t.faultCodes.systemClean}</Text>
            <Text style={styles.cleanDesc}>{t.faultCodes.systemCleanDesc}</Text>
          </View>
        ) : (
          dtcList.map((error, index) => {
            const dbInfo = (dtcDatabase as Record<string, DtcEntry>)[error.Code];
            const isKnown = !!dbInfo;
            const meaning = isKnown ? dbInfo.Meaning : t.faultCodes.unknownError;
            const solution = isKnown ? dbInfo.Solution : null;

            return (
              <View key={index} style={[styles.errorCard, !isKnown && styles.errorCardUnknown]}>
                <View style={styles.errorHeader}>
                  <Text style={styles.errorCode}>{error.Code}</Text>
                  <Text style={[styles.errorBrand, !isKnown && styles.errorBrandUnknown]}>
                    {isKnown ? dbInfo.Brand : t.faultCodes.unknownCode}
                  </Text>
                </View>
                <Text style={styles.errorMeaning}>{meaning}</Text>
                {!isKnown && (
                  <View style={styles.unknownBox}>
                    <Text style={styles.unknownText}>⚠️ {t.faultCodes.unknownDesc}</Text>
                  </View>
                )}
                {isKnown && solution && (
                  <View style={styles.solutionBox}>
                    <Text style={styles.solutionTitle}>💡 {t.faultCodes.solution}</Text>
                    <Text style={styles.solutionText}>{solution}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.clearButton, (dtcList.length === 0 || isClearing || !isConnected) && styles.clearButtonDisabled]}
        onPress={clearCodes}
        disabled={dtcList.length === 0 || isClearing || !isConnected}
      >
        {isClearing ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.clearButtonText}>{t.faultCodes.clearing}</Text>
          </View>
        ) : (
          <Text style={styles.clearButtonText}>{t.faultCodes.clearCodes}</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  header: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: '#555', fontWeight: '600' },
  offlineBadge: { backgroundColor: '#f8717122', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  offlineBadgeText: { color: '#f87171', fontSize: 11, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },
  cleanBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  cleanIcon: { fontSize: 48 },
  cleanText: { fontSize: 18, fontWeight: '700', color: '#4ade80' },
  cleanDesc: { fontSize: 13, color: '#555', textAlign: 'center' },
  errorCard: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f8717122', borderLeftWidth: 4, borderLeftColor: '#f87171' },
  errorCardUnknown: { borderColor: '#ffffff11', borderLeftColor: '#444' },
  errorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  errorCode: { fontSize: 18, fontWeight: '800', color: '#f87171', fontFamily: 'monospace' },
  errorBrand: { fontSize: 12, color: '#aaa', backgroundColor: '#2a2a3e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  errorBrandUnknown: { color: '#444' },
  errorMeaning: { fontSize: 14, color: '#ddd', lineHeight: 20 },
  unknownBox: { marginTop: 10, backgroundColor: '#ffffff08', padding: 10, borderRadius: 8 },
  unknownText: { color: '#666', fontSize: 12 },
  solutionBox: { marginTop: 12, backgroundColor: '#00d2ff0a', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#00d2ff22' },
  solutionTitle: { fontSize: 12, color: '#00d2ff', fontWeight: '700', marginBottom: 6 },
  solutionText: { fontSize: 13, color: '#aaa', lineHeight: 18 },
  clearButton: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: '#f87171', padding: 16, borderRadius: 14, alignItems: 'center' },
  clearButtonDisabled: { opacity: 0.4 },
  clearButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
