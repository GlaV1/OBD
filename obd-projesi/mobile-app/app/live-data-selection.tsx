import React, { useState } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView,
    TouchableOpacity, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import { useTranslation } from '../utils/i18n';

export interface LiveDataParameter {
    id: string;
    key: keyof typeof import('../locales/tr').default['params'];
    unit: string;
    defaultSelected: boolean;
}

export const AVAILABLE_PARAMETERS: LiveDataParameter[] = [
    { id: 'RPM', key: 'RPM', unit: 'rpm', defaultSelected: true },
    { id: 'Speed', key: 'Speed', unit: 'km/h', defaultSelected: true },
    { id: 'EngineTemp', key: 'EngineTemp', unit: '°C', defaultSelected: true },
    { id: 'OilTemp', key: 'OilTemp', unit: '°C', defaultSelected: false },
    { id: 'TurboBoost', key: 'TurboBoost', unit: 'bar', defaultSelected: false },
    { id: 'O2Voltage', key: 'O2Voltage', unit: 'V', defaultSelected: false },
    { id: 'BatteryVolts', key: 'BatteryVolts', unit: 'V', defaultSelected: false },
    { id: 'FuelLevel', key: 'FuelLevel', unit: '%', defaultSelected: false },
];

export default function LiveDataSelectionScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { status } = useConnection();
    const isConnected = status === 'connected';

    const [selectedIds, setSelectedIds] = useState<string[]>(
        AVAILABLE_PARAMETERS.filter(p => p.defaultSelected).map(p => p.id)
    );

    const toggleParam = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const startStream = () => {
        if (selectedIds.length === 0) return;
        router.push({ pathname: '/live-data', params: { selectedParams: selectedIds.join(',') } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>{t.liveDataSelection.title}</Text>
                <Text style={styles.subtitle}>{t.liveDataSelection.subtitle}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{t.liveDataSelection.available}</Text>
                    <Text style={styles.selectedCount}>{selectedIds.length} {t.liveDataSelection.selected}</Text>

                    {AVAILABLE_PARAMETERS.map(param => {
                        const isSelected = selectedIds.includes(param.id);
                        return (
                            <TouchableOpacity
                                key={param.id}
                                style={[styles.checkboxRow, isSelected && styles.checkboxRowActive]}
                                onPress={() => toggleParam(param.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.checkboxInfo}>
                                    <Text style={[styles.checkboxLabel, isSelected && styles.checkboxLabelActive]}>
                                        {t.params[param.key]}
                                    </Text>
                                    <Text style={styles.checkboxUnit}>({param.unit})</Text>
                                </View>

                                <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>{t.liveDataSelection.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.startButton, (selectedIds.length === 0 || !isConnected) && styles.startButtonDisabled]}
                    onPress={startStream}
                    disabled={selectedIds.length === 0 || !isConnected}
                >
                    <Text style={styles.startButtonText}>{t.liveDataSelection.showData}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d1a' },
    headerContainer: { padding: 20, paddingTop: 10 },
    header: { fontSize: 24, fontWeight: '800', color: '#00d2ff', marginBottom: 6 },
    subtitle: { fontSize: 13, color: '#aaa', lineHeight: 18 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
    card: { backgroundColor: '#1a1a2e', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff08', padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
    selectedCount: { fontSize: 12, color: '#00d2ff', marginBottom: 16 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
    checkboxRowActive: { backgroundColor: '#00d2ff08', borderRadius: 8, paddingHorizontal: 8, marginHorizontal: -8, borderBottomColor: 'transparent' },
    checkboxInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    checkboxLabel: { fontSize: 15, color: '#ccc', fontWeight: '500' },
    checkboxLabelActive: { color: '#00d2ff', fontWeight: '700' },
    checkboxUnit: { fontSize: 13, color: '#666' },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { backgroundColor: '#00d2ff', borderColor: '#00d2ff' },
    checkmark: { color: '#0d0d1a', fontSize: 14, fontWeight: '900' },
    footerContainer: { position: 'absolute', bottom: 30, left: 16, right: 16, flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    cancelButtonText: { color: '#aaa', fontSize: 15, fontWeight: '600' },
    startButton: { flex: 2, backgroundColor: '#00d2ff', padding: 16, borderRadius: 12, alignItems: 'center' },
    startButtonDisabled: { opacity: 0.5 },
    startButtonText: { color: '#0d0d1a', fontSize: 15, fontWeight: '800' },
});
