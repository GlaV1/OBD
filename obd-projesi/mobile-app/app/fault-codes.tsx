import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useLocalSearchParams } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';
import { t, getDTCMeaning, getDTCSolution } from '../utils/i18n';

const SERVER_URL = 'http://192.168.X.X:3000';

interface DTC { Code: string; Description: string; }
interface DTCEntry {
  Meaning: string;
  Meaning_tr?: string;
  Brand: string;
  Solution?: string;
  Solution_tr?: string;
}

// ─── Marka adından dosya adına çevir ──────────────────────────
// dashboard'dan gelen brand: "BMW", "Volkswagen", "Toyota" vs.
function getBrandFileName(brand: string): string | null {
  const b = brand.toLowerCase();
  if (b.includes('acura'))                                    return 'acura';
  if (b.includes('alfa'))                                     return 'alfa_romeo';
  if (b.includes('audi'))                                     return 'audi';
  if (b.includes('bmw') || b.includes('mini'))                return 'bmw';
  if (b.includes('chevrolet') || b.includes('chevy'))         return 'chevrolet';
  if (b.includes('chrysler'))                                  return 'chrysler';
  if (b.includes('citroen') || b.includes('citroën'))         return 'citroen';
  if (b.includes('dacia'))                                    return 'dacia';
  if (b.includes('dodge'))                                    return 'dodge';
  if (b.includes('fiat'))                                     return 'fiat';
  if (b.includes('ford'))                                     return 'ford';
  if (b.includes('gmc'))                                      return 'gmc';
  if (b.includes('honda'))                                    return 'honda';
  if (b.includes('hyundai'))                                  return 'hyundai';
  if (b.includes('infiniti'))                                 return 'infiniti';
  if (b.includes('isuzu'))                                    return 'isuzu';
  if (b.includes('jaguar'))                                   return 'jaguar';
  if (b.includes('jeep'))                                     return 'jeep';
  if (b.includes('kia'))                                      return 'kia';
  if (b.includes('land rover') || b.includes('landrover'))    return 'land_rover';
  if (b.includes('lexus'))                                    return 'lexus';
  if (b.includes('lincoln'))                                  return 'lincoln';
  if (b.includes('mazda'))                                    return 'mazda';
  if (b.includes('mercedes'))                                 return 'mercedes';
  if (b.includes('mitsubishi'))                               return 'mitsubishi';
  if (b.includes('nissan'))                                   return 'nissan';
  if (b.includes('opel') || b.includes('vauxhall'))           return 'opel';
  if (b.includes('peugeot'))                                  return 'peugeot';
  if (b.includes('pontiac'))                                  return 'pontiac';
  if (b.includes('porsche'))                                  return 'porsche';
  if (b.includes('renault'))                                  return 'renault';
  if (b.includes('saab'))                                     return 'saab';
  if (b.includes('saturn'))                                   return 'saturn';
  if (b.includes('seat'))                                     return 'seat';
  if (b.includes('skoda') || b.includes('škoda'))             return 'skoda';
  if (b.includes('subaru'))                                   return 'subaru';
  if (b.includes('suzuki'))                                   return 'suzuki';
  if (b.includes('toyota'))                                   return 'toyota';
  if (b.includes('volkswagen') || b.includes('vw'))           return 'volkswagen';
  if (b.includes('volvo'))                                    return 'volvo';
  return null; // eşleşme yoksa sadece generic kullan
}

// ─── İki katmanlı DTC arama ────────────────────────────────────
// 1. Marka dosyasında ara, 2. Bulamazsan generic'te ara
function loadDTCDatabases(brand: string): {
  brandDB: Record<string, DTCEntry>;
  genericDB: Record<string, DTCEntry>;
} {
  let brandDB: Record<string, DTCEntry> = {};
  let genericDB: Record<string, DTCEntry> = {};

  // Generic (tüm araçlar)
  try { genericDB = require('../data/dtc-database.json'); } catch {}

  // Marka özel
  const fileName = getBrandFileName(brand);
  if (fileName) {
    try {
      brandDB = require(`../data/brands/${fileName}.json`);
    } catch {
      // Dosya yoksa sadece generic kullan, hata verme
    }
  }

  return { brandDB, genericDB };
}

function lookupDTC(
  code: string,
  brandDB: Record<string, DTCEntry>,
  genericDB: Record<string, DTCEntry>,
): DTCEntry | null {
  // Önce marka özel, sonra generic
  return brandDB[code] ?? genericDB[code] ?? null;
}

export default function FaultCodesScreen() {
  const { status } = useConnection();
  const isConnected = status === 'connected';
  const params = useLocalSearchParams<{ brand: string }>();
  const brand = params.brand || '';

  // Marka ve generic veritabanlarını yükle
  const { brandDB, genericDB } = loadDTCDatabases(brand);

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

    socket.on('vehicleData', (data) => {
      if (Array.isArray(data?.DTCs)) {
        setDtcList(data.DTCs);
      } else if (data?.DTCs !== undefined) {
        // Bozuk veri gelirse
        setActiveError(getError('DATA_PARSE_ERROR'));
      }
    });

    socket.on('disconnect', () => {
      setActiveError(getError('CONNECTION_LOST'));
    });

    socket.on('connect_error', () => {
      setActiveError(getError('CONNECTION_LOST'));
    });

    return () => { socket.disconnect(); };
  }, [isConnected]);

  const clearCodes = () => {
    if (clearingRef.current) return;
    if (!isConnected) { setActiveError(getError('NOT_CONNECTED')); return; }

    Alert.alert(
      t('dtcClearConfirmTitle'),
      t('dtcClearConfirmMsg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('dtcClearButton'), style: 'destructive',
          onPress: async () => {
            clearingRef.current = true;
            setIsClearing(true);
            try {
              await new Promise(r => setTimeout(r, 1500));
              setDtcList([]);
              Alert.alert(t('dtcClearSuccess'), t('dtcClearSuccessMsg'));
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
        <Text style={styles.header}>{t('dtcTitle')}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>{dtcList.length} {t('dtcRecords')}</Text>
          {!isConnected && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>{t('dtcOffline')}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Hata varsa göster */}
        <ErrorView
          error={activeError}
          onDismiss={() => setActiveError(null)}
          onRetry={() => setActiveError(null)}
        />

        {dtcList.length === 0 && !activeError ? (
          <View style={styles.cleanBox}>
            <Text style={styles.cleanIcon}>✅</Text>
            <Text style={styles.cleanText}>{t('dtcClean')}</Text>
            <Text style={styles.cleanDesc}>{t('dtcCleanDesc')}</Text>
          </View>
        ) : (
          dtcList.map((error, index) => {
            const dbInfo = lookupDTC(error.Code, brandDB, genericDB);
            const isKnown = !!dbInfo;
            const meaning = isKnown ? getDTCMeaning(dbInfo) : t('dtcUnknown');
            const solution = isKnown ? getDTCSolution(dbInfo) : undefined;
            return (
              <View key={index} style={[styles.errorCard, !isKnown && styles.errorCardUnknown]}>
                <View style={styles.errorHeader}>
                  <Text style={styles.errorCode}>{error.Code}</Text>
                  <Text style={[styles.errorBrand, !isKnown && styles.errorBrandUnknown]}>
                    {isKnown ? dbInfo.Brand : t('dtcUnknownBrand')}
                  </Text>
                </View>
                <Text style={styles.errorMeaning}>{meaning}</Text>
                {!isKnown && (
                  <View style={styles.unknownBox}>
                    <Text style={styles.unknownText}>{t('dtcUnknownDesc')}</Text>
                  </View>
                )}
                {solution && (
                  <View style={styles.solutionBox}>
                    <Text style={styles.solutionTitle}>{t('dtcSolution')}</Text>
                    <Text style={styles.solutionText}>{solution}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.clearButton,
          (dtcList.length === 0 || isClearing || !isConnected) && styles.clearButtonDisabled,
        ]}
        onPress={clearCodes}
        disabled={dtcList.length === 0 || isClearing || !isConnected}
      >
        {isClearing ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.clearButtonText}>{t('dtcClearing')}</Text>
          </View>
        ) : (
          <Text style={styles.clearButtonText}>{t('dtcClearButton')}</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  headerContainer: {
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  header: { fontSize: 22, fontWeight: '800', color: '#f87171' },
  subtitle: { fontSize: 14, color: '#555' },
  offlineBadge: {
    backgroundColor: '#f8717122', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#f8717144',
  },
  offlineBadgeText: { fontSize: 11, color: '#f87171', fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  cleanBox: {
    alignItems: 'center', marginTop: 60, padding: 24,
    backgroundColor: '#4ade8008', borderRadius: 16,
    borderWidth: 1, borderColor: '#4ade8022',
  },
  cleanIcon: { fontSize: 48, marginBottom: 12 },
  cleanText: { fontSize: 18, fontWeight: '700', color: '#4ade80', marginBottom: 6 },
  cleanDesc: { fontSize: 13, color: '#555', textAlign: 'center' },
  errorCard: {
    backgroundColor: '#1a1a2e', padding: 16, borderRadius: 14,
    marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#f87171',
    borderWidth: 1, borderColor: '#ffffff08',
  },
  errorCardUnknown: { borderLeftColor: '#facc15' },
  errorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  errorCode: { fontSize: 20, fontWeight: '800', color: '#f87171', fontFamily: 'monospace' },
  errorBrand: {
    fontSize: 11, color: '#00d2ff', backgroundColor: '#00d2ff15',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden',
  },
  errorBrandUnknown: { color: '#facc15', backgroundColor: '#facc1515' },
  errorMeaning: { fontSize: 14, color: '#ffffff', marginBottom: 10, lineHeight: 20 },
  unknownBox: {
    backgroundColor: '#facc1508', padding: 10,
    borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#facc15',
  },
  unknownText: { fontSize: 12, color: '#facc15', lineHeight: 18 },
  solutionBox: {
    backgroundColor: '#fbbf2408', padding: 12,
    borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#fbbf24',
  },
  solutionTitle: { fontSize: 12, fontWeight: '700', color: '#fbbf24', marginBottom: 4 },
  solutionText: { fontSize: 13, color: '#d4d4d8', lineHeight: 19 },
  clearButton: {
    position: 'absolute', bottom: 30, left: 16, right: 16,
    backgroundColor: '#f87171', padding: 16,
    borderRadius: 12, alignItems: 'center', elevation: 8,
  },
  clearButtonDisabled: { backgroundColor: '#1a1a2e', elevation: 0 },
  clearButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
