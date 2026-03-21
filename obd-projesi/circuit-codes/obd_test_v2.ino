// ================
// OBD Test Sistemi
// ================
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

#define POT_PIN    A0
#define BT_RX_PIN  10
#define BT_TX_PIN  11

LiquidCrystal_I2C lcd(0x27, 16, 2);
SoftwareSerial bluetooth(BT_RX_PIN, BT_TX_PIN);

bool clientConnected = false;
unsigned long lastSendTime  = 0;
unsigned long lastLcdUpdate = 0;
const int SEND_INTERVAL = 500;
const int LCD_INTERVAL  = 1000;

int rpm          = 0;
int spd          = 0;
float engineTemp = 60.0;
float battery    = 12.4;

// ============================================================
void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("  OBD Pro v1.0  ");   
  lcd.setCursor(0, 1);
  lcd.print(" Baglanti bekle ");   
  delay(2000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Durum: Bekliyor ");
  lcd.setCursor(0, 1);
  lcd.print("HC-06 Hazir     ");

  Serial.println("Sistem hazir, baglanti bekleniyor...");
}

// ============================================================
void loop() {
  unsigned long now = millis();

  // USB Serial test komutu
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "CONNECT") {
      clientConnected = true;
      Serial.println("Baglandi!");
    }
  }

  // Bluetooth komut dinle
  if (bluetooth.available()) {
    String cmd = bluetooth.readStringUntil('\n');
    cmd.trim();

    if (cmd == "CONNECT") {
      clientConnected = true;
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Telefon Baglandi");   
      lcd.setCursor(0, 1);
      lcd.print("Veri akiyor...  ");   
      Serial.println("Telefon baglandi!");
      bluetooth.println("{\"status\":\"connected\"}");
    }
    else if (cmd == "DISCONNECT") {
      clientConnected = false;
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Baglanti Kesildi");  
      lcd.setCursor(0, 1);
      lcd.print("Bekleniyor...   ");
      Serial.println("Baglanti kesildi.");
    }
  }

  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;
    readSensors();
    if (clientConnected) sendData();
  }

  if (now - lastLcdUpdate >= LCD_INTERVAL && clientConnected) {
    lastLcdUpdate = now;
    updateLcd();
  }
}

// ============================================================
void readSensors() {
  int potValue = analogRead(POT_PIN);
  rpm = map(potValue, 0, 1023, 800, 7000);
  spd = map(rpm, 800, 7000, 0, 220);

  float targetTemp = map(rpm, 800, 7000, 60, 105);
  engineTemp += (targetTemp - engineTemp) * 0.05;

  battery = 12.4 + (random(-10, 10) / 100.0);
}

// ============================================================
void sendData() {
  StaticJsonDocument<200> doc;
  doc["rpm"]        = rpm;
  doc["speed"]      = spd;
  doc["engineTemp"] = (int)engineTemp;
  doc["battery"]    = battery;
  doc["throttle"]   = map(rpm, 800, 7000, 0, 100);
  doc["fuelLevel"]  = 75;

  String output;
  serializeJson(doc, output);
  bluetooth.println(output);
  Serial.println(output);
}

// ============================================================
// LCD  16 karakter her satır
// Satır 1  RPM:1284  %7     (rpm + gaz)
// Satır 2 17km/h 68C Bat   (hız + sıcaklık)
// ============================================================
void updateLcd() {
  // --- Satır 1 RPM ve Gaz ---
  lcd.setCursor(0, 0);
  char line1[17];
  int throttle = map(rpm, 800, 7000, 0, 100);
  snprintf(line1, sizeof(line1), "RPM:%-4d Gaz:%-3d", rpm, throttle);
  lcd.print(line1);

  // --- Satır 2 Hız ve Motor Sıcaklığı ---
  lcd.setCursor(0, 1);
  char line2[17];
  snprintf(line2, sizeof(line2), "%-4dkm/h  %2d", spd, (int)engineTemp);
  lcd.print(line2);
  lcd.print((char)223);   // derece 
  lcd.print("C ");
}
