import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView,
    TouchableOpacity, ScrollView, Alert, StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getAppointmentById, deleteAppointment, Appointment } from '../utils/appointmentDb';

export default function AppointmentDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [data, setData] = useState<Appointment | null>(null);

    const loadData = useCallback(() => {
        if (!id) return;
        try {
            const result = getAppointmentById(parseInt(id));
            if (result) {
                setData(result);
            } else {
                Alert.alert('Hata', 'Randevu bulunamadı.');
                router.back();
            }
        } catch (e) {
            console.error('Load Detail Error:', e);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleDelete = () => {
        if (!data) return;
        Alert.alert(
            'Randevuyu Sil',
            'Bu randevu kalıcı olarak silinecek. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            deleteAppointment(data.id);
                            router.back();
                        } catch (e) {
                            Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
                        }
                    }
                }
            ]
        );
    };

    if (!data) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.headerCard}>
                    <Text style={styles.vehicleTitle}>{data.vehicle}</Text>
                    <Text style={styles.customerName}>{data.name}</Text>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>📞 Telefon</Text>
                        <Text style={styles.value}>{data.phone || 'Belirtilmedi'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>📅 Tarih / Saat</Text>
                        <Text style={styles.value}>{data.date || 'Belirtilmedi'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>📝 Yapılacak İşlem</Text>
                        <View style={styles.notesBox}>
                            <Text style={styles.notesText}>{data.notes || 'Detay girilmedi.'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>🕒 Kayıt Tarihi</Text>
                        <Text style={styles.value}>{new Date(data.created_at).toLocaleString('tr-TR')}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push({ pathname: '/appointment-form', params: { id: data.id } })}
                    >
                        <Text style={styles.editBtnText}>Düzenle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={handleDelete}
                    >
                        <Text style={styles.deleteBtnText}>Randevuyu Sil</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d1a' },
    scrollContent: { padding: 20 },
    headerCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#ffffff11',
        alignItems: 'center',
    },
    vehicleTitle: { color: '#4ade80', fontSize: 24, fontWeight: '900', marginBottom: 4 },
    customerName: { color: '#fff', fontSize: 16, fontWeight: '600', opacity: 0.8 },
    infoSection: { gap: 20 },
    infoRow: { gap: 8 },
    label: { color: '#555', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    value: { color: '#fff', fontSize: 16, fontWeight: '500' },
    notesBox: {
        backgroundColor: '#ffffff05',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ffffff08',
        minHeight: 100,
    },
    notesText: { color: '#ccc', fontSize: 15, lineHeight: 22 },
    actions: { marginTop: 40, gap: 12 },
    editBtn: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#00d2ff44',
    },
    editBtnText: { color: '#00d2ff', fontSize: 16, fontWeight: '800' },
    deleteBtn: {
        padding: 18,
        alignItems: 'center',
    },
    deleteBtnText: { color: '#f87171', fontSize: 15, fontWeight: '600' },
});
