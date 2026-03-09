import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView,
    TouchableOpacity, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import tr from '../locales/tr';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';

const MOCK_MONITORS: { id: keyof typeof import('../locales/tr').default['monitors']; passed: boolean }[] = [
    { id: 'misfire', passed: true },
    { id: 'fuel', passed: true },
    { id: 'comp', passed: true },
    { id: 'cat', passed: false },
    { id: 'htcat', passed: true },
    { id: 'evap', passed: false },
    { id: 'secair', passed: true },
    { id: 'o2', passed: true },
    { id: 'o2heat', passed: true },
    { id: 'egr', passed: true },
];

export default function ReadinessScreen() {
    const router = useRouter();
    const { status } = useConnection();
    const t = tr;
    const isConnected = status === 'connected';

    const [loading, setLoading] = useState(true);
    const [activeError, setActiveError] = useState<OBDErrorDef | null>(null);

    useEffect(() => {
        if (!isConnected) {
            setActiveError(getError('NOT_CONNECTED'));
            setLoading(false);
            return;
        }
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, [isConnected]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>{t.readiness.title}</Text>
                <Text style={styles.subtitle}>{t.readiness.subtitle}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ErrorView
                    error={activeError}
                    onDismiss={() => { setActiveError(null); router.back(); }}
                    onRetry={() => { setActiveError(null); router.back(); }}
                />

                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#4ade80" />
                        <Text style={styles.loadingText}>{t.readiness.loading}</Text>
                    </View>
                ) : !activeError ? (
                    <View style={styles.dataCard}>
                        <View style={styles.summaryBox}>
                            <View style={styles.summaryBadgePassed}>
                                <Text style={styles.summaryCount}>{MOCK_MONITORS.filter(m => m.passed).length}</Text>
                                <Text style={styles.summaryLabel}>{t.readiness.ready}</Text>
                            </View>
                            <View style={styles.summaryBadgeIncomplete}>
                                <Text style={styles.summaryCount}>{MOCK_MONITORS.filter(m => !m.passed).length}</Text>
                                <Text style={styles.summaryLabel}>{t.readiness.incomplete}</Text>
                            </View>
                        </View>

                        <View style={styles.listContainer}>
                            {MOCK_MONITORS.map(monitor => (
                                <View key={monitor.id} style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>{t.monitors[monitor.id]}</Text>
                                    <View style={[styles.statusBadge, monitor.passed ? styles.bgPassed : styles.bgIncomplete]}>
                                        <Text style={[styles.statusText, monitor.passed ? styles.textPassed : styles.textIncomplete]}>
                                            {monitor.passed ? t.readiness.ready : t.readiness.incomplete}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>{t.readiness.note}</Text>
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
    header: { fontSize: 24, fontWeight: '800', color: '#4ade80', marginBottom: 6 },
    subtitle: { fontSize: 13, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
    loadingBox: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
    loadingText: { color: '#4ade80', fontSize: 15, fontWeight: '600' },
    dataCard: { backgroundColor: '#1a1a2e', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff11', padding: 16, marginTop: 10 },
    summaryBox: { flexDirection: 'row', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ffffff11' },
    summaryBadgePassed: { flex: 1, backgroundColor: '#4ade8015', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4ade8033' },
    summaryBadgeIncomplete: { flex: 1, backgroundColor: '#facc1515', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#facc1533' },
    summaryCount: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
    summaryLabel: { fontSize: 12, color: '#aaa', fontWeight: '600', textTransform: 'uppercase' },
    listContainer: { gap: 14 },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dataLabel: { flex: 1, fontSize: 14, color: '#ccc', fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
    bgPassed: { backgroundColor: '#4ade8015', borderColor: '#4ade8033' },
    bgIncomplete: { backgroundColor: '#facc1515', borderColor: '#facc1533' },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    textPassed: { color: '#4ade80' },
    textIncomplete: { color: '#facc15' },
    infoBox: { marginTop: 24, backgroundColor: '#ffffff05', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffffff11' },
    infoText: { color: '#aaa', fontSize: 12, lineHeight: 18 },
    backButton: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff11' },
    backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
