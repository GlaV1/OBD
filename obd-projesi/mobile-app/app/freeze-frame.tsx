import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView,
    TouchableOpacity, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import { useTranslation } from '../utils/i18n';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';

const MOCK_FREEZE_FRAME = {
    dtc: 'P0171',
    descKey: 'System Too Lean (Bank 1)',
    data: [
        { key: 'calculatedLoad', value: '38.4 %' },
        { key: 'coolantTemp', value: '88 °C' },
        { key: 'stft1', value: '18.8 %' },
        { key: 'ltft1', value: '25.0 %' },
        { key: 'map', value: '45.0 kPa' },
        { key: 'rpm', value: '2840 RPM' },
        { key: 'speed', value: '72 km/h' },
    ] as { key: keyof typeof import('../locales/tr').default['freezeFrameLabels']; value: string }[],
};

export default function FreezeFrameScreen() {
    const router = useRouter();
    const { status } = useConnection();
    const { t } = useTranslation();
    const isConnected = status === 'connected';

    const [loading, setLoading] = useState(true);
    const [activeError, setActiveError] = useState<OBDErrorDef | null>(null);

    useEffect(() => {
        if (!isConnected) {
            setActiveError(getError('NOT_CONNECTED'));
            setLoading(false);
            return;
        }
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, [isConnected]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>{t.freezeFrame.title}</Text>
                <Text style={styles.subtitle}>{t.freezeFrame.subtitle}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ErrorView
                    error={activeError}
                    onDismiss={() => { setActiveError(null); router.back(); }}
                    onRetry={() => { setActiveError(null); router.back(); }}
                />

                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#818cf8" />
                        <Text style={styles.loadingText}>{t.freezeFrame.loading}</Text>
                    </View>
                ) : !activeError ? (
                    <View style={styles.dataCard}>
                        <View style={styles.dtcHeader}>
                            <Text style={styles.dtcCode}>⚠️ {MOCK_FREEZE_FRAME.dtc}</Text>
                            <Text style={styles.dtcDesc}>{MOCK_FREEZE_FRAME.descKey}</Text>
                        </View>

                        <View style={styles.listContainer}>
                            {MOCK_FREEZE_FRAME.data.map((item, index) => (
                                <View key={index} style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>{t.freezeFrameLabels[item.key]}</Text>
                                    <Text style={styles.dataValue}>{item.value}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>{t.freezeFrame.note}</Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>{t.common.goBack}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d1a' },
    headerContainer: { padding: 20, paddingTop: 10, paddingBottom: 10 },
    header: { fontSize: 24, fontWeight: '800', color: '#818cf8', marginBottom: 6 },
    subtitle: { fontSize: 13, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
    loadingBox: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
    loadingText: { color: '#818cf8', fontSize: 15, fontWeight: '600' },
    dataCard: { backgroundColor: '#1a1a2e', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff11', padding: 16, marginTop: 10 },
    dtcHeader: { borderBottomWidth: 1, borderBottomColor: '#ffffff11', paddingBottom: 16, marginBottom: 12 },
    dtcCode: { fontSize: 22, fontWeight: '800', color: '#f87171', marginBottom: 4 },
    dtcDesc: { fontSize: 14, color: '#aaa', fontWeight: '500' },
    listContainer: { gap: 12 },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dataLabel: { flex: 1, fontSize: 13, color: '#ccc' },
    dataValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
    infoBox: { marginTop: 24, backgroundColor: '#818cf815', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#818cf833' },
    infoText: { color: '#818cf8', fontSize: 12, lineHeight: 18 },
    backButton: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff11' },
    backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
