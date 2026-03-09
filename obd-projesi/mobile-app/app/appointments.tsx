import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, TextInput,
    TouchableOpacity, FlatList, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAppointments, deleteAppointment, Appointment } from '../utils/appointmentDb';

export default function AppointmentsScreen() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 15;

    const loadData = (reset = false) => {
        if (loading) return;
        const targetPage = reset ? 0 : page;
        setLoading(true);

        try {
            const results = getAppointments({
                page: targetPage,
                pageSize,
                search
            });

            if (reset) {
                setAppointments(results);
                setPage(1);
            } else {
                setAppointments(prev => [...prev, ...results]);
                setPage(prev => prev + 1);
            }

            setHasMore(results.length === pageSize);
        } catch (e) {
            console.error('Load Appointments Error:', e);
        } finally {
            setLoading(false);
        }
    };

    // Sayfa her odaklandığında (geri dönüldüğünde) listeyi yenile
    useFocusEffect(
        useCallback(() => {
            loadData(true);
        }, [search])
    );

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'Randevuyu Sil',
            `${name} kişisinin randevusu silinecek. Emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            deleteAppointment(id);
                            loadData(true);
                        } catch (e) {
                            Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Appointment }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/appointment-detail' as any, params: { id: item.id.toString() } })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.vehicleName}>{item.vehicle}</Text>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.name)}
                >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.customerName}>{item.name}</Text>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>📅 {item.date}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="İsim, araç, tarih veya işlem ara..."
                    placeholderTextColor="#555"
                    value={search}
                    onChangeText={setSearch}
                />
                {search !== '' && (
                    <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={() => setSearch('')}
                    >
                        <Text style={styles.clearBtnText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={appointments}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                onEndReached={() => hasMore && loadData()}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>Randevu bulunamadı.</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    loading ? <ActivityIndicator color="#4ade80" style={{ margin: 20 }} /> : null
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/appointment-form' as any)}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d1a' },
    searchContainer: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0d0d1a',
        borderBottomWidth: 1,
        borderBottomColor: '#ffffff08',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 14,
        color: '#fff',
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#ffffff11',
    },
    clearBtn: { position: 'absolute', right: 30, padding: 4 },
    clearBtnText: { color: '#555', fontSize: 16, fontWeight: 'bold' },
    listContent: { padding: 16, paddingBottom: 100 },
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ffffff08',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    vehicleName: { color: '#4ade80', fontSize: 16, fontWeight: '800' },
    deleteBtn: { padding: 8, backgroundColor: '#f8717111', borderRadius: 8 },
    deleteIcon: { fontSize: 16 },
    cardBody: { gap: 6 },
    customerName: { color: '#fff', fontSize: 14, fontWeight: '600' },
    dateBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#ffffff05',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ffffff08',
    },
    dateText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
    emptyBox: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.3 },
    emptyText: { color: '#444', fontSize: 16, fontWeight: '600' },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#4ade80',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4ade80',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fabIcon: { fontSize: 32, color: '#000', fontWeight: 'bold' },
});
