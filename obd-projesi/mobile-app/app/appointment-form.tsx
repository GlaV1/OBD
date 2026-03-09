import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, TextInput,
    TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveAppointment, getAppointmentById, updateAppointment, NewAppointment } from '../utils/appointmentDb';

export default function AppointmentFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;

    const [form, setForm] = useState<NewAppointment>({
        name: '',
        vehicle: '',
        phone: '',
        date: '',
        notes: ''
    });

    useEffect(() => {
        if (isEdit && id) {
            try {
                const data = getAppointmentById(parseInt(id));
                if (data) {
                    setForm({
                        name: data.name,
                        vehicle: data.vehicle,
                        phone: data.phone,
                        date: data.date,
                        notes: data.notes
                    });
                }
            } catch (e) {
                Alert.alert('Hata', 'Veri yüklenirken bir sorun oluştu.');
            }
        }
    }, [id]);

    const handleSave = () => {
        if (!form.name.trim() || !form.vehicle.trim()) {
            Alert.alert('Uyarı', 'Lütfen en az Ad Soyad ve Araç bilgilerini doldurun.');
            return;
        }

        try {
            if (isEdit && id) {
                updateAppointment(parseInt(id), form);
            } else {
                saveAppointment(form);
            }
            router.back();
        } catch (e) {
            Alert.alert('Hata', 'Kaydedilirken bir sorun oluştu.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Ad Soyad *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Müşteri adı..."
                            placeholderTextColor="#444"
                            value={form.name}
                            onChangeText={t => setForm(prev => ({ ...prev, name: t }))}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Araç Marka / Model *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: VW Golf 7"
                            placeholderTextColor="#444"
                            value={form.vehicle}
                            onChangeText={t => setForm(prev => ({ ...prev, vehicle: t }))}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Telefon</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="05xx..."
                            placeholderTextColor="#444"
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={t => setForm(prev => ({ ...prev, phone: t }))}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tarih / Saat</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Pazartesi öğleden sonra"
                            placeholderTextColor="#444"
                            value={form.date}
                            onChangeText={t => setForm(prev => ({ ...prev, date: t }))}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Yapılacak İşlem</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="İşlem detayları..."
                            placeholderTextColor="#444"
                            multiline
                            numberOfLines={4}
                            value={form.notes}
                            onChangeText={t => setForm(prev => ({ ...prev, notes: t }))}
                        />
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>{isEdit ? 'Değişiklikleri Kaydet' : 'Randevu Oluştur'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d1a' },
    scrollContent: { padding: 20 },
    formGroup: { marginBottom: 20 },
    label: { color: '#555', fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
    input: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#ffffff11',
    },
    textArea: { height: 120, textAlignVertical: 'top' },
    saveBtn: {
        backgroundColor: '#4ade80',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4ade80',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
