const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // Telefondan gelecek bağlantılara izin veriyoruz
});

// Senin haritandaki JSON yapısı
let vehicleData = {
  RPM: 800, // Rölanti
  Speed: 0,
  EngineTemp: 20, // Motor soğuk
  FuelLevel: 60,
  DTCs: []
};

// Arabanın sürüş dinamiklerini simüle eden fonksiyon
function updateVehicleData() {
  // Devir (RPM) dalgalanması
  vehicleData.RPM += Math.floor(Math.random() * 300) - 100;
  if(vehicleData.RPM < 800) vehicleData.RPM = 800;
  if(vehicleData.RPM > 4000) vehicleData.RPM = 4000;

  // Hız, devire bağlı olarak artsın veya azalsın
  if(vehicleData.RPM > 1500) {
    vehicleData.Speed += Math.floor(Math.random() * 3);
    if(vehicleData.Speed > 120) vehicleData.Speed = 120;
  } else {
    vehicleData.Speed -= 2;
    if(vehicleData.Speed < 0) vehicleData.Speed = 0;
  }

  // Motor yavaşça 90 dereceye kadar ısınsın
  if(vehicleData.EngineTemp < 90) vehicleData.EngineTemp += 0.5;

  // Yakıt çok yavaş azalsın
  if(vehicleData.FuelLevel > 0) vehicleData.FuelLevel -= 0.01;

  // Rastgele bir hata kodu (DTC) tetikleyelim (Nadir olsun ki gerçekçi dursun)
  if (Math.random() > 0.98 && vehicleData.DTCs.length === 0) {
    vehicleData.DTCs.push({ "Code": "P0301", "Description": "Cylinder 1 Misfire" });
    console.log("⚠️ Hata Kodu Tetiklendi: P0301");
  }
}

// Bir cihaz (Mobil Uygulama) bağlandığında çalışacak kısım
io.on('connection', (socket) => {
  console.log(`🟢 Yeni bir cihaz bağlandı: ${socket.id}`);
  
  // Her 1 saniyede bir veriyi güncelle ve telefona yolla
  const interval = setInterval(() => {
    updateVehicleData();
    socket.emit('vehicleData', vehicleData);
  }, 1000);

  // Cihazın bağlantısı koparsa
  socket.on('disconnect', () => {
    console.log(`🔴 Cihaz ayrıldı: ${socket.id}`);
    clearInterval(interval);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚗 OBD Simülasyon Sunucusu http://localhost:${PORT} adresinde çalışıyor...`);
});