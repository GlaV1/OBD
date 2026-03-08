// ============================================================
// TÜRKÇE dil dosyası — Tüm uygulama metinleri burada tutulur
// ============================================================

const tr = {
    // === ORTAK / SHARED ===
    common: {
        goBack: '← Geri Dön',
        cancel: 'İptal',
        confirm: 'Onayla',
        close: 'Kapat',
        soon: 'Yakında',
        unknown: 'Bilinmiyor',
        yes: 'Evet',
        no: 'Hayır',
    },

    // === BAĞLANTI DURUMU ===
    connection: {
        connected: 'Bağlı',
        disconnected: 'Bağlı Değil',
        offline: 'Çevrimdışı',
        noConnection: 'ECU Bağlantısı Yok',
        streaming: 'ECU Bağlı — Veri Akıyor',
        awaiting: 'Veri bekleniyor...',
        noObd: 'OBD bağlantısı yok. Modüllere erişmek için bağlantı gereklidir.',
    },

    // === DASHBOARD ===
    dashboard: {
        unknownVehicle: 'Bilinmeyen Araç',
        vehicleInfo: 'Araç Bilgileri ℹ️',
        activeModules: 'aktif modül',
        inDevelopment: 'geliştirme aşamasında',
        standardObd: 'Standart OBD-II',
        worksOnAll: 'Tüm araçlarda çalışır',
        brandModules: 'Modülleri',
        brandSpecific: 'Marka Özel',
        udtProtocol: 'UDS / KWP2000 protokolü',
        changeVehicle: '← Araç Değiştir',
        noModules: 'Bu araç için marka özel modüller henüz eklenmedi. Standart OBD-II modülleri ile motor verilerini ve hata kodlarını okuyabilirsin.',
    },

    // === AYARLAR ===
    settings: {
        title: 'Ayarlar',
        subtitle: 'Uygulama tercihleri ve dil ayarları',
        regionLanguage: 'Bölge ve Dil',
        appLanguage: 'Uygulama Dili',
        appLanguageDesc: 'DTC Arıza açıklamaları ve arayüz',
        system: 'Sistem',
        appVersion: 'Uygulama Sürümü',
        goBack: '← Geri Dön',
    },

    // === ARAÇ BİLGİLERİ ===
    vehicleInfo: {
        title: 'Araç Bilgileri',
        subtitle: 'OBD üzerinden okunan şasi ve modül verileri',
        brand: 'Marka / Üretici',
        model: 'Model / Yıl',
        vin: 'Şasi Numarası (VIN)',
        protocol: 'Protokol Ailesi',
        unknownVehicle: 'Bilinmeyen Araç',
        unknownModel: 'Bilinmiyor',
        vinError: 'Okunamadı',
        serviceButton: 'Servis Sıfırlama ve Adaptasyon',
        serviceButtonSub: 'özel servis fonksiyonları',
    },

    // === SERVİS SIFIRLAMALARI ===
    serviceReset: {
        title: 'Servis ve Özel Fonksiyonlar',
        subtitle: 'markası için desteklenen işlemler',
        noConnection: 'ECU Bağlantısı Yok. Özellikleri kullanmak için araca bağlanın.',
        connectionError: 'Bağlantı Hatası',
        connectionErrorDesc: 'Bağlantı algılanmadı. Servis işlemleri için araca bağlı olmalısınız.',
        confirmTitle: 'Komutu çalıştır',
        confirmDesc: (cmd: string) => `Bu işlem araç ECU'suna [${cmd}] komutunu gönderecek. İşlemin araç güvenli bir ortamdayken yapıldığından emin olun. Devam edilsin mi?`,
        execute: 'Çalıştır',
        successTitle: '✅ Başarılı',
        successDesc: (name: string) => `${name} başarıyla tamamlandı.`,
        goBack: '← Değişiklik Yapmadan Dön',
    },

    // === CANLI VERİ SEÇİM ===
    liveDataSelection: {
        title: 'Canlı Veri Seçimi',
        subtitle: 'İzlemek istediğiniz sensörleri seçin. En fazla 6 veri seçimi daha sağlıklı bir akış sağlar.',
        available: 'Kullanılabilir Parametreler',
        selected: 'seçildi',
        showData: 'Verileri Göster',
        cancel: 'İptal',
    },

    // === CANLI VERİ ===
    liveData: {
        awaiting: 'Veri bekleniyor...',
        noConnection: 'Bağlantı yok',
    },

    // === ARIZA KODLARI ===
    faultCodes: {
        title: 'Arıza Teşhis (DTC)',
        records: 'kayıt',
        clearCodes: 'Hata Kodlarını Sil',
        confirmClearTitle: 'Hata Kodlarını Sil',
        confirmClearDesc: 'ECU belleğindeki tüm arıza kayıtları silinecek. Emin misiniz?',
        clearing: 'Siliniyor...',
        clearSuccess: '✅ Tamamlandı',
        clearSuccessDesc: 'Arıza kayıtları ECU belleğinden silindi.',
        systemClean: 'Araç Sistemleri Temiz',
        systemCleanDesc: 'ECU belleğinde kayıtlı arıza kodu bulunamadı.',
        unknownCode: 'Bilinmiyor',
        unknownError: 'Bilinmeyen Hata',
        unknownDesc: 'Bu kod veritabanımızda kayıtlı değil. Yetkili servis ile iletişime geçin.',
        solution: 'Çözüm Önerisi',
        delete: 'Sil',
    },

    // === FREEZE FRAME ===
    freezeFrame: {
        title: 'Freeze Frame',
        subtitle: 'Hata anında kaydedilen sistem sensör verileri',
        loading: 'ECU belleğinden okunuyor...',
        note: 'Not: Bu veriler arızanın tetiklendiği saniyede dondurulmuştur ve sorunun kaynağını bulmak için referans olarak kullanılmalıdır.',
    },

    // === HAZIRLIK TESTLERİ ===
    readiness: {
        title: 'Hazırlık Testleri (I/M)',
        subtitle: 'Emisyon muayenesi öncesi sistem hazırbulunuşluk durumu',
        loading: 'Monitör durumu sorgulanıyor...',
        ready: 'Hazır',
        incomplete: 'Tamamlanmadı',
        note: 'Not: "Tamamlanmadı" durumu sistemin hatalı olduğu anlamına gelmez, ilgili sürüş çevriminin henüz bitmediğini gösterir.',
    },

    // === MODÜL KARTLARI ===
    modules: {
        liveData: { title: 'Canlı Veriler', desc: 'RPM, Hız, Isı, Yakıt' },
        engineDtc: { title: 'Motor Arızaları', desc: 'P kodları — tüm araçlar' },
        freezeFrame: { title: 'Freeze Frame', desc: 'Hata anındaki anlık veri' },
        readiness: { title: 'Hazırlık Testleri', desc: 'Emisyon sistem kontrolleri' },
        // VW
        vwTransmission: { title: 'Şanzıman (02)', desc: 'VW Group ECU — UDS protokol' },
        vwAbs: { title: 'ABS / ESP (03)', desc: 'Fren sistemi hata kodları' },
        vwAirbag: { title: 'Airbag (15)', desc: 'Güvenlik sistemi kontrolü' },
        vwDashboard: { title: 'Gösterge Paneli (17)', desc: 'Kilometre, immobilizer' },
        // BMW
        bmwDme: { title: 'DME / DDE Motor', desc: 'BMW motor yönetim sistemi' },
        bmwEgs: { title: 'EGS Şanzıman', desc: 'Otomatik şanzıman modülü' },
        bmwAbs: { title: 'DSC / ABS', desc: 'Dinamik stabilite kontrolü' },
        // Renault
        renaultUch: { title: 'UCH / BSI', desc: 'Merkezi elektrik modülü' },
        renaultAbs: { title: 'ABS Modülü', desc: 'Bosch / Continental ABS' },
        // Fiat
        fiatEcu: { title: 'Marelli ECU', desc: 'Fiat özel motor modülü' },
        fiatBody: { title: 'Body Computer', desc: 'Elektrik / karoser sistemi' },
    },

    // === CANLI VERİ PARAMETRELERİ ===
    params: {
        RPM: 'Motor Devri',
        Speed: 'Araç Hızı',
        EngineTemp: 'Soğutma Suyu',
        OilTemp: 'Yağ Sıcaklığı',
        TurboBoost: 'Turbo Basıncı',
        O2Voltage: 'Oksijen Sensörü (B1S1)',
        BatteryVolts: 'Akü Voltajı',
        FuelLevel: 'Yakıt Seviyesi',
    },

    // === SERVİS FONKSİYONLARI ===
    resetFunctions: {
        oilReset: { name: 'Yağ Bakımı Sıfırlama', desc: 'Standart periyodik bakım sıfırlaması' },
        vwOil: { name: 'Periyodik Bakım Sıfırlama (UDS)', desc: 'Kanal 02 Adaptasyon Değeri = 0' },
        vwThrottle: { name: 'Kelebek Boğazı Adaptasyonu', desc: 'Kanal 060 / 098 Temel Ayarlar' },
        vwEpb: { name: 'Elektronik Park Freni (EPB)', desc: 'Balata değişimi için servis modu' },
        bmwCbs: { name: 'CBS Bakım Sıfırlama', desc: 'Fren sıvı, yağ, araç kontrol sıfırlama' },
        bmwBattery: { name: 'Akü Tanıtma', desc: 'Yeni akü değişimi sonrası kayıt' },
        renaultOil: { name: 'Bakım Aralığı Sıfırlama', desc: 'Gösterge paneli bakım ışığı' },
        fiatOil: { name: 'Yağ Kaçak/Servis Işığı', desc: 'DPF/Multijet motorlar için yağ reset' },
    },

    // === FREEZE FRAME VERİ ETİKETLERİ ===
    freezeFrameLabels: {
        calculatedLoad: 'Hesaplanan Yük',
        coolantTemp: 'Motor Soğutma Suyu Sıcaklığı',
        stft1: 'Kısa Vadeli Yakıt Kesme (Sıra 1)',
        ltft1: 'Uzun Vadeli Yakıt Kesme (Sıra 1)',
        map: 'Manifold Mutlak Basıncı',
        rpm: 'Motor Devri',
        speed: 'Araç Hızı',
    },

    // === HAZIRLIK MONİTÖR ADLARI ===
    monitors: {
        misfire: 'Tekleme Monitörü',
        fuel: 'Yakıt Sistemi',
        comp: 'Kapsamlı Bileşen',
        cat: 'Katalizör Monitörü',
        htcat: 'Isıtıcılı Katalizör',
        evap: 'Buharlaşma Sistemi (EVAP)',
        secair: 'İkincil Hava Sistemi',
        o2: 'Oksijen Sensörü',
        o2heat: 'Oksijen Sensörü Isıtıcı',
        egr: 'EGR Sistemi',
    },
};

export type Translations = typeof tr;
export default tr;
