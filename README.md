# 🔧 OBD Diagnostics

Tamirciler ve araç meraklıları için geliştirilmiş, açık kaynaklı OBD-II araç teşhis uygulaması. Tek bir uygulama ile birden fazla marka ve modele ait araçların motor, şanzıman, ABS ve elektrik sistemlerini okuyup analiz etmeyi hedefler.

> **Not:** Proje aktif geliştirme aşamasındadır. Şu an simülasyon modunda çalışmaktadır, gerçek donanım entegrasyonu devam etmektedir.

---

## 📱 Özellikler

### Şu An Çalışanlar
- Araç profili kaydetme (son 10 araç, AsyncStorage)
- Marka bazlı otomatik modül seçimi (VW/Audi/Skoda, BMW, Renault, Fiat)
- Canlı araç verileri: RPM, Hız, Motor Sıcaklığı, Yakıt Seviyesi
- DTC hata kodu okuma ve silme simülasyonu
- Kapsamlı DTC veritabanı (P, C, B, U kodları)

### Geliştirme Aşamasında
- VW/Audi/Skoda özel modülleri (Şanzıman, ABS, Airbag, Gösterge Paneli)
- BMW DME/EGS/DSC modülleri
- Renault UCH/ABS modülleri
- Fiat Marelli ECU modülü
- Freeze Frame veri okuma
- Emisyon hazırlık testleri
- Gerçek donanım (Arduino + MCP2515 veya ESP32) entegrasyonu

### Planlanan Gelişmiş Özellikler 🌟
- **Yapay Zeka Destekli Arıza Çözümü:** Gemini AI entegrasyonu ile DTC kodları için sadece arıza tanımını değil, mekanik ustalara özel adım adım Türkçe çözüm yolları ve olası arıza sebepleri üretme.
- **Tüm Sistemleri Tarama (All-System Scan):** Sadece OBD2 motor (P) kodları değil, marka-özel paketler ile ABS, Airbag, Şanzıman gibi diğer modüllere bağlanma.
- **Gelişmiş Canlı Veri ve Tekleme (Misfire) Takibi:** Canlı motor verilerini grafiksel olarak izleme ve silindir bazlı tekleme (misfire) sorunlarını tespit etme.
- **Servis ve Adaptasyon İşlemleri:** Yağ bakımı sıfırlama, kelebek adaptasyonu gibi sanayide sıkça ihtiyaç duyulan tek tuşla çözüm fonksiyonları.

---

## 🗂️ Proje Yapısı

```
obd-projesi/
├── mobile-app/               # React Native (Expo) uygulaması
│   ├── app/
│   │   ├── index.tsx         # Araç seçim ekranı (2 sekmeli)
│   │   ├── dashboard.tsx     # Ana panel — marka bazlı modül sistemi
│   │   ├── live-data.tsx     # Canlı araç verileri
│   │   ├── fault-codes.tsx   # DTC hata kodu okuma/silme
│   │   └── _layout.tsx       # Expo Router layout
│   └── data/
│       └── dtc-database.json # DTC hata kodu veritabanı
│
└── simulation-backend/       # Geliştirme aşaması simülasyon sunucusu
    └── server.js             # Socket.IO — sahte araç verisi üretir
```

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Expo CLI
- Android veya iOS cihaz / emülatör

### Mobil Uygulama

```bash
cd mobile-app
npm install
npx expo install @react-native-async-storage/async-storage
npx expo start
```

### Simülasyon Sunucusu

```bash
cd simulation-backend
npm install
node server.js
```

Sunucu başladıktan sonra `mobile-app/app/live-data.tsx` ve `fault-codes.tsx` dosyalarındaki `SERVER_URL` satırını kendi bilgisayarının IP adresiyle güncelle:

```typescript
const SERVER_URL = 'http://192.168.X.X:3000';
```

---

## 🔌 Donanım Mimarisi (Planlanan)

```
Araç OBD-II Portu (16 pin)
        │
        ▼
  Arduino Mega
  + MCP2515 CAN modülü      ← CAN Bus protokolü
        │
        ▼
  Wi-Fi Modülü (ESP8266)    ← Socket.IO üzerinden veri akışı
        │
        ▼
  React Native Uygulama     ← Telefon / tablet
```

### Planlanan Donanım Listesi (Mevcut Başlangıç Kurulumu)
| Parça | Açıklama |
|---|---|
| Arduino Mega 2560 | Ana mikrodenetleyici |
| MCP2515 CAN Modülü | CAN Bus iletişimi (2008+ araçlar) |
| ESP8266 Wi-Fi Modülü | Telefona kablosuz veri aktarımı |
| OBD-II 16 Pin Konnektör | Araca fiziksel bağlantı |

### ⚡ Alternatif / Gelişmiş Donanım Hedefi (V2)
İlk aşamada eldeki Arduino Mega sistemiyle bir **MVP (Minimum Çalışan Ürün)** oluşturulacaktır. Ancak sistemin kararlılığını artırmak, devreyi küçültmek ve veri iletim darboğazlarını aşmak için daha sonraki aşamalarda aşağıdaki donanım mimarisine geçilmesi planlanmaktadır:

| Parça | Açıklama |
|---|---|
| **ESP32** | İçerisinde dahili CAN (TWAI) kontrolcüsü, Wi-Fi ve Bluetooth barındıran, çok daha hızlı ve kompakt ana denetleyici. |
| **CAN Transceiver (Örn: SN65HVD230)** | ESP32'nin dahili CAN donanımını fiziksel CAN hattına bağlamak için küçük ve ucuz entegre. |
| **K-Line Çipi (Örn: L9637D)** | Eski araçlara (2006 öncesi) veya ABS/Airbag gibi CAN hattında olmayan modüllere bağlanmak için eklenecek KWP2000/ISO9141 protokol entegresi. |

---

## 🏗️ Mimari — Modül Sistemi

Uygulama, yeni marka ve protokol eklenmeye hazır bir modül mimarisiyle tasarlanmıştır.

```
Uygulama (React Native)
        │
        ▼
  Protokol Katmanı (Arduino)
  ├── Standart OBD-II    → Tüm araçlar (Motor P kodları, canlı veriler)
  ├── VW/Audi/Skoda      → UDS protokolü
  ├── BMW                → BMW özel protokolü
  ├── Renault            → OpenDiag tabanlı
  └── Fiat               → Marelli protokolü
        │
        ▼
    CAN Bus → Araç ECU'ları
```

### Yeni Marka Eklemek

`dashboard.tsx` içindeki `BRAND_MODULES` objesine yeni bir key eklemek yeterlidir:

```typescript
MERCEDES: {
  label: 'Mercedes-Benz',
  color: '#aaaaaa',
  modules: [
    {
      id: 'mb-das',
      icon: '⭐',
      title: 'DAS Modülü',
      desc: 'Mercedes motor yönetimi',
      route: '/modules/mb-das',
      color: '#00d2ff',
      available: false,
    }
  ]
}
```

`detectBrandKey` fonksiyonuna da bir satır ekle:

```typescript
if (b.includes('mercedes') || b.includes('benz')) return 'MERCEDES';
```

---

## 🛣️ Yol Haritası

- [x] Simülasyon sunucusu (Socket.IO)
- [x] Canlı veri ekranı
- [x] DTC veritabanı entegrasyonu
- [x] Araç profili kaydetme (AsyncStorage)
- [x] Marka bazlı modül sistemi
- [ ] DTC Türkçe açıklamalar (İlk Aşama)
- [ ] **Gemini AI Entegrasyonu ile Akıllı Arıza Çözüm Rehberi**
- [ ] Freeze Frame veri okuma
- [ ] Arduino + MCP2515 donanım entegrasyonu (MVP Aşama 1)
- [ ] Wi-Fi üzerinden gerçek araç bağlantısı
- [ ] **Tekleme (Misfire) Sayacı ve Gelişmiş Canlı Veri Grafikleri**
- [ ] VW/Audi UDS protokol modülleri ve Servis Sıfırlama
- [ ] BMW özel protokol modülleri
- [ ] Renault / Fiat modülleri
- [ ] **K-Line ve ESP32 Donanım Yükseltmesi (Aşama 2)**
- [ ] Hata kodu geçmişi, araç cari/raporlama sistemi

---

## ⚠️ Sorumluluk Reddi

Bu uygulama araştırma ve kişisel kullanım amaçlıdır. Araç ECU'larına yapılan müdahaleler garanti kapsamını etkileyebilir. Kullanım sorumluluğu kullanıcıya aittir.

---

## 📜 Lisans
Bu proje MIT Lisansı ile lisanslanmıştır. Eğitim ve geliştirme amaçlıdır.
