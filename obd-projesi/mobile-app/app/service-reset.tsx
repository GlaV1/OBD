import React, { useState } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView,
    TouchableOpacity, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import { useTranslation } from '../utils/i18n';

interface ResetFunction {
    id: string;
    key: keyof typeof import('../locales/tr').default['resetFunctions'];
    icon: string;
    command: string;
}

const RESET_FUNCTIONS: Record<string, ResetFunction[]> = {
    GENERIC: [
        { id: 'oil-reset', icon: '🛢️', key: 'oilReset', command: '01 02' },
    ],
    VW: [
        { id: 'vw-oil', icon: '🛢️', key: 'vwOil', command: '2E F1 02 00' },
        { id: 'vw-throttle', icon: '🦋', key: 'vwThrottle', command: '04 06 00' },
        { id: 'vw-epb', icon: '🛞', key: 'vwEpb', command: '04 07 00' },
    ],
    BMW: [
        { id: 'bmw-cbs', icon: '📅', key: 'bmwCbs', command: '31 01 0F' },
        { id: 'bmw-battery', icon: '🔋', key: 'bmwBattery', command: '2E F1 04 01' },
    ],
    RENAULT: [
        { id: 'renault-oil', icon: '🛢️', key: 'renaultOil', command: '10 C0' },
    ],
    FIAT: [
        { id: 'fiat-oil', icon: '🛢️', key: 'fiatOil', command: '31 01 10' },
    ],
};

export default function ServiceResetScreen() {
    const router = useRouter();
    const { status } = useConnection();
    const { t } = useTranslation();
    const isConnected = status === 'connected';

    const params = useLocalSearchParams<{ brandKey: string }>();
    const brandKey = params.brandKey || 'GENERIC';
    const availableResets = RESET_FUNCTIONS[brandKey] || RESET_FUNCTIONS['GENERIC'];

    const [executingId, setExecutingId] = useState<string | null>(null);

    const handleReset = (func: ResetFunction) => {
        const funcDef = t.resetFunctions[func.key];
        if (!isConnected) {
            Alert.alert(t.serviceReset.connectionError, t.serviceReset.connectionErrorDesc);
            return;
        }

        Alert.alert(
            funcDef.name,
            t.serviceReset.confirmDesc(func.command),
            [
                { text: t.common.cancel, style: 'cancel' },
                {
                    text: t.serviceReset.execute, style: 'destructive',
                    onPress: async () => {
                        setExecutingId(func.id);
                        setTimeout(() => {
                            setExecutingId(null);
                            Alert.alert(t.serviceReset.successTitle, t.serviceReset.successDesc(funcDef.name));
                        }, 2500);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>{t.serviceReset.title}</Text>
                <Text style={styles.subtitle}>{brandKey} {t.serviceReset.subtitle}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {!isConnected && (
                    <View style={styles.offlineBox}>
                        <Text style={styles.offlineText}>⚠️ {t.serviceReset.noConnection}</Text>
                    </View>
                )}

                <View style={styles.grid}>
                    {availableResets.map(func => {
                        const funcDef = t.resetFunctions[func.key];
                        return (
                            <TouchableOpacity
                                key={func.id}
                                style={[styles.functionCard, !isConnected && styles.functionCardDisabled]}
                                onPress={() => handleReset(func)}
                                disabled={!isConnected || executingId !== null}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconBox}>
                                    <Text style={styles.icon}>{func.icon}</Text>
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardTitle}>{funcDef.name}</Text>
                                    <Text style={styles.cardDesc}>{funcDef.desc}</Text>
                                    <Text style={styles.commandCode}>CMD: {func.command}</Text>
                                </View>

                                {executingId === func.id ? (
                                    <ActivityIndicator color="#00d2ff" size="small" />
                                ) : (
                                    <Text style={styles.chevron}>→</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>{t.serviceReset.goBack}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d1a' },
    headerContainer: { padding: 20, paddingTop: 10, paddingBottom: 10 },
    header: { fontSize: 24, fontWeight: '800', color: '#facc15', marginBottom: 6 },
    subtitle: { fontSize: 13, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
    offlineBox: { backgroundColor: '#f8717122', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#f8717188', marginBottom: 20 },
    offlineText: { color: '#f87171', fontSize: 13, fontWeight: '600' },
    grid: { gap: 12, marginTop: 10 },
    functionCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ffffff11' },
    functionCardDisabled: { opacity: 0.5 },
    iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#2a2a4a', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    icon: { fontSize: 22 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
    cardDesc: { fontSize: 13, color: '#aaa', marginBottom: 6 },
    commandCode: { fontSize: 11, color: '#00d2ff', fontFamily: 'monospace', fontWeight: 'bold' },
    chevron: { color: '#666', fontSize: 20, paddingLeft: 10 },
    backButton: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff11' },
    backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
