import React from 'react';
import {
    StyleSheet, Text, View, SafeAreaView,
    TouchableOpacity, ScrollView, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../utils/i18n';

export default function SettingsScreen() {
    const router = useRouter();
    const { language, setLanguage } = useSettings();
    const { t } = useTranslation();

    const isTurkish = language === 'tr';

    const toggleLanguage = () => {
        setLanguage(isTurkish ? 'en' : 'tr');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>{t.settings.title}</Text>
                    <Text style={styles.headerSubtitle}>{t.settings.subtitle}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.settings.regionLanguage}</Text>

                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>{t.settings.appLanguage}</Text>
                                <Text style={styles.settingDesc}>{t.settings.appLanguageDesc}</Text>
                            </View>
                            <View style={styles.langSwitch}>
                                <Text style={[styles.langText, !isTurkish && styles.langTextActive]}>EN</Text>
                                <Switch
                                    value={isTurkish}
                                    onValueChange={toggleLanguage}
                                    trackColor={{ false: '#333', true: '#f87171' }}
                                    thumbColor={'#fff'}
                                    ios_backgroundColor="#333"
                                />
                                <Text style={[styles.langText, isTurkish && styles.langTextActive]}>TR</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.settings.system}</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>{t.settings.appVersion}</Text>
                                <Text style={styles.settingDesc}>OBD Diagnostics v1.2 (Beta)</Text>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>{t.settings.goBack}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d1a' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    headerContainer: { marginBottom: 32, marginTop: 10 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: '#aaa' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    card: { backgroundColor: '#1a1a2e', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff08', overflow: 'hidden' },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    settingInfo: { flex: 1, paddingRight: 16 },
    settingLabel: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
    settingDesc: { fontSize: 13, color: '#888' },
    langSwitch: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    langText: { fontSize: 12, fontWeight: '700', color: '#555' },
    langTextActive: { color: '#00d2ff' },
    backButton: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff11' },
    backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
