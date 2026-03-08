import React from 'react';
import {
    StyleSheet, Text, View, SafeAreaView,
    TouchableOpacity, ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '../utils/i18n';

export default function VehicleInfoScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const params = useLocalSearchParams<{ brand: string; model: string; vin: string; brandKey: string }>();
    const brand = params.brand || t.vehicleInfo.unknownVehicle;
    const model = params.model || t.vehicleInfo.unknownModel;
    const vin = params.vin || t.vehicleInfo.vinError;
    const brandKey = params.brandKey || 'GENERIC';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>{t.vehicleInfo.title}</Text>
                <Text style={styles.subtitle}>{t.vehicleInfo.subtitle}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoCard}>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}><Text style={styles.iconText}>🚗</Text></View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>{t.vehicleInfo.brand}</Text>
                            <Text style={styles.infoValue}>{brand}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}><Text style={styles.iconText}>🏷️</Text></View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>{t.vehicleInfo.model}</Text>
                            <Text style={styles.infoValue}>{model}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}><Text style={styles.iconText}>🆔</Text></View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>{t.vehicleInfo.vin}</Text>
                            <Text style={[styles.infoValue, { fontFamily: 'monospace', fontSize: 16 }]}>{vin}</Text>
                        </View>
                    </View>

                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.iconBox}><Text style={styles.iconText}>🔌</Text></View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>{t.vehicleInfo.protocol}</Text>
                            <Text style={styles.infoValue}>{brandKey} (ISO/CAN)</Text>
                        </View>
                    </View>

                </View>

                <TouchableOpacity
                    style={styles.serviceButton}
                    onPress={() => router.push({ pathname: '/service-reset' as any, params: { brandKey } })}
                >
                    <Text style={styles.serviceButtonIcon}>🔧</Text>
                    <View style={styles.serviceButtonTextContainer}>
                        <Text style={styles.serviceButtonTitle}>{t.vehicleInfo.serviceButton}</Text>
                        <Text style={styles.serviceButtonSub}>{brandKey} {t.vehicleInfo.serviceButtonSub}</Text>
                    </View>
                    <Text style={styles.chevron}>→</Text>
                </TouchableOpacity>

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
    header: { fontSize: 24, fontWeight: '800', color: '#a78bfa', marginBottom: 6 },
    subtitle: { fontSize: 13, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

    infoCard: { backgroundColor: '#1a1a2e', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff11', padding: 16, marginTop: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#ffffff11' },
    iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#2a2a4a', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    iconText: { fontSize: 20 },
    textContainer: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    infoValue: { fontSize: 18, color: '#fff', fontWeight: '700' },

    serviceButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#facc1522',
        marginTop: 24, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#facc1555'
    },
    serviceButtonIcon: { fontSize: 24, marginRight: 16 },
    serviceButtonTextContainer: { flex: 1 },
    serviceButtonTitle: { fontSize: 16, fontWeight: '700', color: '#facc15', marginBottom: 4 },
    serviceButtonSub: { fontSize: 12, color: '#ccc' },
    chevron: { color: '#facc15', fontSize: 24, fontWeight: '300' },

    backButton: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff11' },
    backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
