import { useState, useEffect, useRef } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, TextInput,
    TouchableOpacity, FlatList, ScrollView, Animated,
    Dimensions, StatusBar, ActivityIndicator, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    useConnection, getStatusColor, getStatusText,
    safeStorageGet, safeStorageSet,
} from '../context/ConnectionContext';
import ErrorView from '../components/ErrorView';
import { getError, OBDErrorDef } from '../utils/errors';

let vehicleData: VehicleDB = {};
try {
    vehicleData = require('../data/vehicles.json') as VehicleDB;
} catch {
    vehicleData = {};
}

const { width } = Dimensions.get('window');
const STORAGE_KEY = 'obd_recent_vehicles';
const AUTO_SCAN_TIMEOUT_MS = 8000;

interface Vehicle {
    id: string;
    brand: string;
    model: string;
    vin: string;
    lastConnected: string;
}

interface VehicleDB {
    [make: string]: {
        wmi: string[];
        models: { id: string; name: string }[];
    };
}

type Mode = 'home' | 'auto' | 'vin' | 'manual';

const db = vehicleData;

function formatDate(iso: string): string {
    try {
        const d = new Date(iso);
        const now = new Date();
        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (diff === 0) return 'Bugün';
        if (diff === 1) return 'Dün';
        if (diff < 7) return `${diff} gün önce`;
        return d.toLocaleDateString('tr-TR');
    } catch { return ''; }
}

function getMakeFromWMI(wmi: string): string | null {
    if (!wmi || wmi.length < 3) return null;
    try {
        for (const [make, info] of Object.entries(db)) {
            if (info?.wmi?.includes(wmi)) return make;
        }
    } catch { return null; }
    return null;
}

function sanitizeVIN(raw: string): string {
    return raw.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
}

function isValidVINChars(vin: string): boolean {
    return /^[A-HJ-NPR-Z0-9]+$/.test(vin);
}

function generateSimVIN(): string {
    const wmis = ['WVW', 'WBA', 'WAU', 'WDB', 'WDD', 'TM1', 'VF1', 'ZFA', 'WF0', 'W0L'];
    const wmi = wmis[Math.floor(Math.random() * wmis.length)];
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    const rand = (n: number) =>
        Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return wmi + rand(6) + rand(8);
}

export default function VehicleSelectScreen() {
    const router = useRouter();
    const { status, connect, lastError } = useConnection();
    const isOBDConnected = status === 'connected';

    const [mode, setMode] = useState<Mode>('home');
    const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
    const [dbLoaded] = useState(Object.keys(db).length > 0);

    // Merkezi hata state — tüm hatalar buraya düşer
    const [activeError, setActiveError] = useState<OBDErrorDef | null>(null);

    // Otomatik mod
    const [autoScanning, setAutoScanning] = useState(false);
    const [autoVIN, setAutoVIN] = useState('');
    const [autoMake, setAutoMake] = useState('');
    const autoScanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoScanAbortRef = useRef(false);

    // VIN mod
    const [vinInput, setVinInput] = useState('');
    const [vinMake, setVinMake] = useState('');
    const [vinModels, setVinModels] = useState<{ id: string; name: string }[]>([]);

    // Manuel mod
    const [manualMake, setManualMake] = useState('');
    const [manualModel, setManualModel] = useState('');
    const [makeSearch, setMakeSearch] = useState('');
    const [modelSearch, setModelSearch] = useState('');
    const [showMakePicker, setShowMakePicker] = useState(false);
    const [showModelPicker, setShowModelPicker] = useState(false);

    // Model seçim modalı
    const [showModelModal, setShowModelModal] = useState(false);
    const [modalModels, setModalModels] = useState<{ id: string; name: string }[]>([]);
    const [modalMake, setModalMake] = useState('');
    const [modalVIN, setModalVIN] = useState('');

    const [isConnecting, setIsConnecting] = useState(false);
    const connectingRef = useRef(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        safeStorageGet<Vehicle[]>(STORAGE_KEY, []).then(setRecentVehicles);
        if (!dbLoaded) setActiveError(getError('DB_LOAD_FAILED'));
    }, []);

    // Tarama sırasında bağlantı koparsa iptal et
    useEffect(() => {
        if (!isOBDConnected && autoScanning) {
            autoScanAbortRef.current = true;
            if (autoScanTimerRef.current) clearTimeout(autoScanTimerRef.current);
            setAutoScanning(false);
            setActiveError(getError('CONNECTION_LOST'));
        }
    }, [isOBDConnected, autoScanning]);

    const switchMode = (next: Mode) => {
        if (autoScanning) {
            autoScanAbortRef.current = true;
            if (autoScanTimerRef.current) clearTimeout(autoScanTimerRef.current);
            setAutoScanning(false);
        }
        setActiveError(null);
        setVinMake('');
        setVinModels([]);
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setMode(next);
    };

    const goToDashboard = async (brand: string, model: string, vin: string) => {
        if (connectingRef.current) return;
        if (!isOBDConnected) { setActiveError(getError('NOT_CONNECTED')); return; }
        if (!brand || !model) return;

        connectingRef.current = true;
        setIsConnecting(true);

        try {
            await new Promise(r => setTimeout(r, 1000));
            const vehicle: Vehicle = {
                id: Date.now().toString(), brand, model,
                vin: vin || 'Girilmedi', lastConnected: new Date().toISOString(),
            };
            const list = await safeStorageGet<Vehicle[]>(STORAGE_KEY, []);
            const filtered = list.filter(v => !(v.brand === brand && v.model === model));
            filtered.unshift(vehicle);
            const saved = await safeStorageSet(STORAGE_KEY, filtered.slice(0, 10));
            if (!saved) setActiveError(getError('STORAGE_ERROR')); // info seviyesi, devam eder
            setRecentVehicles(filtered.slice(0, 10));
            router.push({ pathname: '/dashboard', params: { brand, model, vin } });
        } catch {
            setActiveError(getError('UNKNOWN'));
        } finally {
            setIsConnecting(false);
            connectingRef.current = false;
        }
    };

    const handleAutoScan = async () => {
        if (!isOBDConnected) { setActiveError(getError('NOT_CONNECTED')); return; }
        if (autoScanning) return;

        autoScanAbortRef.current = false;
        setAutoScanning(true);
        setActiveError(null);
        setAutoVIN('');
        setAutoMake('');

        const timeoutPromise = new Promise<'timeout'>(resolve => {
            autoScanTimerRef.current = setTimeout(() => resolve('timeout'), AUTO_SCAN_TIMEOUT_MS);
        });
        const scanPromise = new Promise<string>(resolve => {
            setTimeout(() => resolve(generateSimVIN()), 2500);
        });

        const result = await Promise.race([scanPromise, timeoutPromise]);
        if (autoScanAbortRef.current) return;
        if (autoScanTimerRef.current) clearTimeout(autoScanTimerRef.current);
        setAutoScanning(false);

        if (result === 'timeout') {
            setActiveError(getError('ECU_TIMEOUT'));
            return;
        }

        const cleanVIN = sanitizeVIN(result as string);
        setAutoVIN(cleanVIN);
        const make = getMakeFromWMI(cleanVIN.substring(0, 3));

        if (!make) { setActiveError(getError('VIN_NOT_FOUND')); return; }

        const models = db[make]?.models || [];
        if (models.length === 0) { setActiveError(getError('MODEL_LIST_EMPTY')); return; }

        setAutoMake(make);
        setModalMake(make);
        setModalModels(models);
        setModalVIN(cleanVIN);
        setShowModelModal(true);
    };

    const handleVinLookup = () => {
        setActiveError(null);
        setVinMake('');
        setVinModels([]);

        const clean = sanitizeVIN(vinInput.trim());

        if (clean.length < 3) { setActiveError(getError('VIN_INVALID')); return; }
        if (!isValidVINChars(clean)) { setActiveError(getError('VIN_INVALID')); return; }
        if (clean.length > 3 && clean.length < 17) { setActiveError(getError('VIN_INVALID')); return; }

        const make = getMakeFromWMI(clean.substring(0, 3));
        if (!make) { setActiveError(getError('VIN_NOT_FOUND')); return; }

        const models = db[make]?.models || [];
        if (models.length === 0) { setActiveError(getError('MODEL_LIST_EMPTY')); return; }

        setVinMake(make);
        setVinModels(models);
        setModalMake(make);
        setModalModels(models);
        setModalVIN(clean);
        setShowModelModal(true);
    };

    const allMakes = Object.keys(db).sort();
    const filteredMakes = makeSearch.trim()
        ? allMakes.filter(m => m.toLowerCase().includes(makeSearch.toLowerCase()))
        : allMakes;
    const manualModels = manualMake ? (db[manualMake]?.models || []) : [];
    const filteredModels = modelSearch.trim()
        ? manualModels.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
        : manualModels;

    // ===================== RENDER HOME =====================
    const renderHome = () => (
        <ScrollView contentContainerStyle={styles.homeContent}>
            <View style={styles.cardRow}>

                <TouchableOpacity
                    style={[styles.modeCard, !isOBDConnected && styles.modeCardDisabled]}
                    onPress={() => isOBDConnected ? switchMode('auto') : setActiveError(getError('NOT_CONNECTED'))}
                    activeOpacity={0.75}
                >
                    <Text style={styles.modeIcon}>🔌</Text>
                    <Text style={styles.modeTitle}>Otomatik</Text>
                    <Text style={styles.modeDesc}>OBD'den VIN oku, araç otomatik tespit edilsin</Text>
                    {!isOBDConnected && (
                        <View style={styles.lockedBadge}>
                            <Text style={styles.lockedText}>Bağlantı Gerekli</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.modeCard} onPress={() => switchMode('vin')} activeOpacity={0.75}>
                    <Text style={styles.modeIcon}>🔢</Text>
                    <Text style={styles.modeTitle}>VIN Gir</Text>
                    <Text style={styles.modeDesc}>Şasi numarasını yaz, araç bilgileri otomatik çıksın</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modeCard} onPress={() => switchMode('manual')} activeOpacity={0.75}>
                    <Text style={styles.modeIcon}>🔧</Text>
                    <Text style={styles.modeTitle}>Manuel</Text>
                    <Text style={styles.modeDesc}>Marka ve modeli listeden kendin seç</Text>
                </TouchableOpacity>

            </View>

            {recentVehicles.length > 0 && (
                <View style={styles.recentSection}>
                    <Text style={styles.recentTitle}>Son Araçlar</Text>
                    {recentVehicles.map((v, i) => (
                        <TouchableOpacity
                            key={v.id}
                            style={[styles.vehicleCard, !isOBDConnected && styles.vehicleCardDisabled]}
                            onPress={() => goToDashboard(v.brand, v.model, v.vin)}
                            activeOpacity={0.75}
                        >
                            <View style={styles.vehicleCardLeft}>
                                <View style={styles.vehicleIndex}>
                                    <Text style={styles.vehicleIndexText}>{i + 1}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.vehicleBrand}>{v.brand}</Text>
                                    <Text style={styles.vehicleModel}>{v.model}</Text>
                                    {v.vin !== 'Girilmedi' && <Text style={styles.vehicleVin}>VIN: {v.vin}</Text>}
                                    <Text style={styles.vehicleDate}>🕐 {formatDate(v.lastConnected)}</Text>
                                </View>
                            </View>
                            <Text style={styles.connectArrow}>⚡</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );

    // ===================== RENDER AUTO =====================
    const renderAuto = () => (
        <ScrollView contentContainerStyle={styles.modeContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => switchMode('home')}>
                <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.modeHeader}>🔌 Otomatik VIN Okuma</Text>
            <Text style={styles.modeSubHeader}>OBD cihazı araca bağlı, VIN ECU'dan otomatik okunacak.</Text>

            <TouchableOpacity
                style={[styles.bigScanButton, autoScanning && styles.bigScanButtonActive]}
                onPress={handleAutoScan}
                disabled={autoScanning}
                activeOpacity={0.8}
            >
                {autoScanning ? (
                    <View style={styles.scanningRow}>
                        <ActivityIndicator color="#00d2ff" size="small" />
                        <Text style={styles.bigScanText}>  ECU'dan VIN Okunuyor...</Text>
                    </View>
                ) : (
                    <Text style={styles.bigScanText}>🔍  VIN Oku ve Bağlan</Text>
                )}
            </TouchableOpacity>

            {autoScanning && (
                <Text style={styles.timeoutHint}>
                    Cevap gelmezse {AUTO_SCAN_TIMEOUT_MS / 1000} saniye sonra otomatik iptal olur
                </Text>
            )}

            {autoVIN !== '' && (
                <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>Okunan VIN</Text>
                    <Text style={styles.resultVin}>{autoVIN}</Text>
                    {autoMake !== '' && (
                        <>
                            <Text style={styles.resultLabel}>Tespit Edilen Marka</Text>
                            <Text style={styles.resultMake}>{autoMake}</Text>
                        </>
                    )}
                </View>
            )}

            <ErrorView
                error={activeError}
                onDismiss={() => setActiveError(null)}
                onRetry={handleAutoScan}
            />
        </ScrollView>
    );

    // ===================== RENDER VIN =====================
    const renderVin = () => (
        <ScrollView contentContainerStyle={styles.modeContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => switchMode('home')}>
                <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.modeHeader}>🔢 VIN ile Ara</Text>
            <Text style={styles.modeSubHeader}>
                Araç şasi numarasını girin. İlk 3 karakter (WMI) ile marka tespit edilir.
            </Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Şasi Numarası (VIN)</Text>
                <View style={styles.vinRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Örn: WVW veya WVWZZZ1KZ8W123456"
                        placeholderTextColor="#444"
                        value={vinInput}
                        onChangeText={t => {
                            setVinInput(sanitizeVIN(t));
                            setActiveError(null);
                            setVinMake('');
                        }}
                        autoCapitalize="characters"
                        maxLength={17}
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={[styles.vinSearchBtn, vinInput.length < 3 && styles.vinSearchBtnDisabled]}
                        onPress={handleVinLookup}
                        disabled={vinInput.length < 3}
                    >
                        <Text style={styles.vinSearchBtnText}>Ara</Text>
                    </TouchableOpacity>
                </View>
                {vinInput.length > 0 && (
                    <Text style={[styles.vinCounter, {
                        color: vinInput.length === 17 ? '#4ade80'
                            : vinInput.length >= 3 ? '#facc15' : '#f87171',
                    }]}>
                        {vinInput.length}/17{vinInput.length >= 3 && vinInput.length < 17 ? ' — İlk 3 ile arama yapılacak' : ''}
                    </Text>
                )}
            </View>

            <ErrorView
                error={activeError}
                onDismiss={() => setActiveError(null)}
                onRetry={handleVinLookup}
            />

            {vinMake !== '' && !showModelModal && (
                <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>Tespit Edilen Marka</Text>
                    <Text style={styles.resultMake}>{vinMake}</Text>
                    <Text style={styles.resultLabel}>{vinModels.length} model listelendi</Text>
                    <TouchableOpacity
                        style={[styles.connectButton, { marginTop: 12 }]}
                        onPress={() => {
                            setModalMake(vinMake);
                            setModalModels(vinModels);
                            setModalVIN(vinInput);
                            setShowModelModal(true);
                        }}
                    >
                        <Text style={styles.connectButtonText}>Model Seç →</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );

    // ===================== RENDER MANUAL =====================
    const renderManual = () => (
        <ScrollView contentContainerStyle={styles.modeContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => switchMode('home')}>
                <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.modeHeader}>🔧 Manuel Seçim</Text>
            <Text style={styles.modeSubHeader}>Marka ve modeli listeden seçin.</Text>

            <ErrorView
                error={activeError}
                onDismiss={() => setActiveError(null)}
            />

            <View style={styles.formGroup}>
                <Text style={styles.label}>Marka *</Text>
                <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => { setMakeSearch(''); setShowMakePicker(true); }}
                    disabled={!dbLoaded}
                >
                    <Text style={[styles.pickerButtonText, !manualMake && styles.pickerPlaceholder]}>
                        {manualMake || 'Marka seçin...'}
                    </Text>
                    <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
            </View>

            {manualMake !== '' && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Model *</Text>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => {
                            if (manualModels.length === 0) {
                                setActiveError(getError('MODEL_LIST_EMPTY'));
                                return;
                            }
                            setModelSearch('');
                            setShowModelPicker(true);
                        }}
                    >
                        <Text style={[styles.pickerButtonText, !manualModel && styles.pickerPlaceholder]}>
                            {manualModel || (manualModels.length === 0 ? 'Model bulunamadı' : 'Model seçin...')}
                        </Text>
                        <Text style={styles.pickerArrow}>▼</Text>
                    </TouchableOpacity>
                </View>
            )}

            {manualMake !== '' && manualModel !== '' && (
                <TouchableOpacity
                    style={[styles.connectButton, (!isOBDConnected || isConnecting) && styles.connectButtonDisabled]}
                    onPress={() => goToDashboard(manualMake, manualModel, '')}
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <View style={styles.scanningRow}>
                            <ActivityIndicator color="#000" size="small" />
                            <Text style={styles.connectButtonText}>  Bağlanıyor...</Text>
                        </View>
                    ) : (
                        <Text style={styles.connectButtonText}>
                            {isOBDConnected ? 'Araca Bağlan 🚀' : 'OBD Bağlantısı Gerekli 🔒'}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </ScrollView>
    );

    // ===================== MODALLER =====================
    const renderModelModal = () => (
        <Modal visible={showModelModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{modalMake} — Model Seçin</Text>
                        <TouchableOpacity onPress={() => setShowModelModal(false)}>
                            <Text style={styles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modalSub}>{modalModels.length} model listelendi</Text>
                    {modalModels.length === 0 ? (
                        <View style={styles.emptyModal}>
                            <Text style={styles.emptyModalIcon}>🔍</Text>
                            <Text style={styles.emptyModalText}>Model listesi boş.</Text>
                            <TouchableOpacity
                                style={styles.modalManualBtn}
                                onPress={() => { setShowModelModal(false); switchMode('manual'); }}
                            >
                                <Text style={styles.modalManualBtnText}>Manuel Seçime Geç →</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={modalModels}
                                keyExtractor={item => item.id}
                                style={{ maxHeight: 380 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modelItem}
                                        onPress={() => { setShowModelModal(false); goToDashboard(modalMake, item.name, modalVIN); }}
                                    >
                                        <Text style={styles.modelItemText}>{item.name}</Text>
                                        <Text style={styles.modelItemArrow}>→</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.modalManualBtn}
                                onPress={() => { setShowModelModal(false); switchMode('manual'); }}
                            >
                                <Text style={styles.modalManualBtnText}>Listede Yok → Manuel Seç</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderMakeModal = () => (
        <Modal visible={showMakePicker} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Marka Seçin</Text>
                        <TouchableOpacity onPress={() => setShowMakePicker(false)}>
                            <Text style={styles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.modalSearch}
                        placeholder="Marka ara..."
                        placeholderTextColor="#444"
                        value={makeSearch}
                        onChangeText={setMakeSearch}
                        autoCapitalize="words"
                    />
                    <FlatList
                        data={filteredMakes}
                        keyExtractor={item => item}
                        style={{ maxHeight: 380 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modelItem}
                                onPress={() => { setManualMake(item); setManualModel(''); setShowMakePicker(false); }}
                            >
                                <Text style={styles.modelItemText}>{item}</Text>
                                <Text style={styles.modelItemArrow}>→</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyModal}>
                                <Text style={styles.emptyModalText}>"{makeSearch}" bulunamadı</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    const renderModelManualModal = () => (
        <Modal visible={showModelPicker} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{manualMake} — Model</Text>
                        <TouchableOpacity onPress={() => setShowModelPicker(false)}>
                            <Text style={styles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.modalSearch}
                        placeholder="Model ara..."
                        placeholderTextColor="#444"
                        value={modelSearch}
                        onChangeText={setModelSearch}
                    />
                    <FlatList
                        data={filteredModels}
                        keyExtractor={item => item.id}
                        style={{ maxHeight: 380 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modelItem}
                                onPress={() => { setManualModel(item.name); setShowModelPicker(false); }}
                            >
                                <Text style={styles.modelItemText}>{item.name}</Text>
                                <Text style={styles.modelItemArrow}>→</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyModal}>
                                <Text style={styles.emptyModalText}>
                                    {modelSearch ? `"${modelSearch}" bulunamadı` : 'Model listesi boş'}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    // ===================== ANA RENDER =====================
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>OBD Diagnostics</Text>
                {mode !== 'home' && <Text style={styles.headerSub}>Araç Tanımlama</Text>}
            </View>

            <TouchableOpacity
                style={[styles.connectionBanner, {
                    borderColor: getStatusColor(status) + '44',
                    backgroundColor: getStatusColor(status) + '11',
                }]}
                onPress={!isOBDConnected ? connect : undefined}
                activeOpacity={isOBDConnected ? 1 : 0.7}
            >
                <View style={[styles.connectionDot, { backgroundColor: getStatusColor(status) }]} />
                <Text style={[styles.connectionText, { color: getStatusColor(status) }]}>
                    {lastError || getStatusText(status)}
                </Text>
                {!isOBDConnected && <Text style={styles.connectionAction}>Bağlan →</Text>}
            </TouchableOpacity>

            {/* Ana ekrandaki hata — modal olarak göster */}
            {mode === 'home' && (
                <ErrorView
                    error={activeError}
                    onDismiss={() => setActiveError(null)}
                    onRetry={() => setActiveError(null)}
                    mode="modal"
                />
            )}

            <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
                {mode === 'home' && renderHome()}
                {mode === 'auto' && renderAuto()}
                {mode === 'vin' && renderVin()}
                {mode === 'manual' && renderManual()}
            </Animated.View>

            {renderModelModal()}
            {renderMakeModal()}
            {renderModelManualModal()}

            {isConnecting && (
                <View style={styles.connectingOverlay}>
                    <ActivityIndicator color="#00d2ff" size="large" />
                    <Text style={styles.connectingText}>Araca Bağlanıyor...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d1a' },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: '#555', marginTop: 2 },
    connectionBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginHorizontal: 16, marginBottom: 10,
        paddingHorizontal: 14, paddingVertical: 9,
        borderRadius: 10, borderWidth: 1,
    },
    connectionDot: { width: 7, height: 7, borderRadius: 4 },
    connectionText: { flex: 1, fontSize: 13, fontWeight: '600' },
    connectionAction: { fontSize: 12, color: '#00d2ff', fontWeight: '700' },
    homeContent: { padding: 16, paddingBottom: 40 },
    cardRow: { gap: 10, marginBottom: 24 },
    modeCard: {
        backgroundColor: '#1a1a2e', borderRadius: 14, padding: 18,
        borderWidth: 1, borderColor: '#ffffff08',
    },
    modeCardDisabled: { opacity: 0.55 },
    modeIcon: { fontSize: 28, marginBottom: 8 },
    modeTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
    modeDesc: { fontSize: 13, color: '#555', lineHeight: 18 },
    lockedBadge: {
        marginTop: 10, alignSelf: 'flex-start',
        backgroundColor: '#f8717122', paddingHorizontal: 10,
        paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#f8717144',
    },
    lockedText: { fontSize: 11, color: '#f87171', fontWeight: '700' },
    recentSection: { gap: 8 },
    recentTitle: { fontSize: 11, color: '#444', fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
    vehicleCard: {
        backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', borderWidth: 1, borderColor: '#ffffff08',
    },
    vehicleCardDisabled: { opacity: 0.4 },
    vehicleCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    vehicleIndex: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: '#00d2ff15', borderWidth: 1, borderColor: '#00d2ff30',
        alignItems: 'center', justifyContent: 'center',
    },
    vehicleIndexText: { color: '#00d2ff', fontWeight: '700', fontSize: 12 },
    vehicleBrand: { color: '#fff', fontSize: 14, fontWeight: '700' },
    vehicleModel: { color: '#aaa', fontSize: 13, marginTop: 1 },
    vehicleVin: { color: '#444', fontSize: 11, fontFamily: 'monospace', marginTop: 1 },
    vehicleDate: { color: '#333', fontSize: 11, marginTop: 2 },
    connectArrow: { fontSize: 18, color: '#00d2ff' },
    modeContent: { padding: 20, paddingBottom: 60 },
    backButton: { marginBottom: 16 },
    backText: { color: '#00d2ff', fontSize: 14, fontWeight: '600' },
    modeHeader: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
    modeSubHeader: { fontSize: 13, color: '#555', marginBottom: 24, lineHeight: 18 },
    bigScanButton: {
        backgroundColor: '#1a1a2e', borderWidth: 1.5,
        borderColor: '#00d2ff55', borderRadius: 14,
        padding: 20, alignItems: 'center', marginBottom: 12, borderStyle: 'dashed',
    },
    bigScanButtonActive: { borderColor: '#00d2ff', backgroundColor: '#00d2ff0a' },
    bigScanText: { color: '#00d2ff', fontSize: 16, fontWeight: '700' },
    scanningRow: { flexDirection: 'row', alignItems: 'center' },
    timeoutHint: { color: '#333', fontSize: 11, textAlign: 'center', marginBottom: 16 },
    resultBox: {
        backgroundColor: '#1a1a2e', borderRadius: 12,
        padding: 16, borderWidth: 1, borderColor: '#4ade8022', marginBottom: 16,
    },
    resultLabel: { fontSize: 10, color: '#444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, marginTop: 8 },
    resultVin: { fontSize: 15, color: '#fff', fontFamily: 'monospace', fontWeight: '700' },
    resultMake: { fontSize: 20, color: '#4ade80', fontWeight: '800' },
    formGroup: { marginBottom: 16 },
    label: { color: '#555', fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        backgroundColor: '#1a1a2e', color: '#fff',
        padding: 14, borderRadius: 10, fontSize: 14,
        borderWidth: 1, borderColor: '#2a2a3e',
    },
    vinRow: { flexDirection: 'row', gap: 8 },
    vinSearchBtn: { backgroundColor: '#00d2ff', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
    vinSearchBtnDisabled: { backgroundColor: '#1a2a2e' },
    vinSearchBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
    vinCounter: { fontSize: 11, marginTop: 4, fontFamily: 'monospace' },
    pickerButton: {
        backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14,
        borderWidth: 1, borderColor: '#2a2a3e',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    pickerButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    pickerPlaceholder: { color: '#444' },
    pickerArrow: { color: '#555', fontSize: 12 },
    connectButton: {
        backgroundColor: '#00d2ff', padding: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 8,
        shadowColor: '#00d2ff', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
    },
    connectButtonDisabled: { backgroundColor: '#1a2a2e', shadowOpacity: 0 },
    connectButtonText: { color: '#000', fontSize: 16, fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end' },
    modalBox: {
        backgroundColor: '#12121f', borderTopLeftRadius: 20,
        borderTopRightRadius: 20, padding: 20, maxHeight: '82%',
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    modalTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
    modalClose: { fontSize: 18, color: '#555', paddingHorizontal: 4 },
    modalSub: { fontSize: 12, color: '#444', marginBottom: 12 },
    modalSearch: {
        backgroundColor: '#1a1a2e', color: '#fff',
        padding: 12, borderRadius: 10, fontSize: 14,
        borderWidth: 1, borderColor: '#2a2a3e', marginBottom: 10,
    },
    modelItem: {
        paddingVertical: 14, paddingHorizontal: 4,
        borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
        flexDirection: 'row', justifyContent: 'space-between',
    },
    modelItemText: { color: '#fff', fontSize: 15 },
    modelItemArrow: { color: '#444', fontSize: 14 },
    emptyModal: { alignItems: 'center', paddingVertical: 30, gap: 8 },
    emptyModalIcon: { fontSize: 32, opacity: 0.4 },
    emptyModalText: { color: '#444', fontSize: 14, textAlign: 'center' },
    modalManualBtn: {
        marginTop: 12, padding: 14, backgroundColor: '#1a1a2e',
        borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a3e',
    },
    modalManualBtnText: { color: '#00d2ff', fontWeight: '700', fontSize: 14 },
    connectingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0d0d1aee',
        justifyContent: 'center', alignItems: 'center', gap: 16,
    },
    connectingText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
