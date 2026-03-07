"""
DTC Veritabanı Ayırma Scripti
==============================
Ne yapar:
  1. Her TXT dosyasını okur (bmw.txt, honda.txt vs.)
  2. 18k'lık ana JSON'dan aynı markayla etiketli kodları çeker
  3. TXT + JSON verilerini birleştirip marka özel JSON oluşturur (duplicate yok)
  4. Ana JSON'dan o markanın kodlarını siler
  5. Sonuç: Her marka kendi JSON'unda, ana JSON'da sadece GENERIC kalır

Klasör Yapısı:
  obd-projesi/
  ├── split_dtc.py              ← bu script
  ├── dtc-sources/              ← TXT dosyaları buraya
  │   ├── bmw.txt
  │   ├── honda.txt
  │   └── ...
  └── mobile-app/data/
      ├── dtc-database.json     ← 18k'lık ana veritabanı (GENERIC'ler kalır)
      └── brands/               ← marka JSON'ları buraya oluşturulur
          ├── bmw.json
          ├── honda.json
          └── ...

Kullanım:
  python split_dtc.py
"""

import json
import os
import re
import shutil

# --- AYARLAR ---
TXT_FOLDER    = "./dts-source"
MAIN_JSON     = "./mobile-app/data/dtc-database.json"
BRANDS_FOLDER = "./mobile-app/data/brands"

# Dosya adı → marka etiketi eşleştirme
# TXT dosya adın JSON'daki Brand değeriyle eşleşmesi lazım
# Örnek: bmw.txt → JSON'da "BMW" olarak arayacak
def filename_to_brand(filename: str) -> str:
    name = os.path.splitext(filename)[0]
    name = name.upper().replace("-", "_").replace(" ", "_")
    # bmw_codes → BMW, volkswagen_codes → VOLKSWAGEN
    if name.endswith("_CODES"):
        name = name[:-6]
    return name

# TXT satırını parse et: "P1083 - Fuel Control..." → ("P1083", "Fuel Control...")
def parse_line(line: str):
    line = line.strip()
    if not line:
        return None
    match = re.match(r'^([A-Z][0-9]{4})\s*[-–]\s*(.+)$', line)
    if match:
        return match.group(1).strip().upper(), match.group(2).strip()
    return None

def main():
    # 1. Ana JSON'u yükle
    if not os.path.exists(MAIN_JSON):
        print(f"❌ Ana veritabanı bulunamadı: {MAIN_JSON}")
        return

    with open(MAIN_JSON, "r", encoding="utf-8") as f:
        main_db = json.load(f)
    print(f"✅ Ana veritabanı yüklendi: {len(main_db)} kod\n")

    # 2. TXT dosyalarını kontrol et
    if not os.path.exists(TXT_FOLDER):
        print(f"❌ TXT klasörü bulunamadı: {TXT_FOLDER}")
        return

    txt_files = sorted([f for f in os.listdir(TXT_FOLDER) if f.endswith(".txt")])
    if not txt_files:
        print(f"❌ {TXT_FOLDER} klasöründe .txt dosyası yok")
        return

    # 3. Çıktı klasörünü oluştur
    os.makedirs(BRANDS_FOLDER, exist_ok=True)

    # Ana JSON'dan silinecek kodları takip et
    codes_to_remove_from_main = set()

    print(f"📂 {len(txt_files)} marka işlenecek:\n")
    print(f"{'Dosya':<25} {'Marka':<15} {'TXT':<8} {'JSON':<8} {'Toplam':<8} {'Silinen'}")
    print("-" * 75)

    for txt_file in txt_files:
        brand = filename_to_brand(txt_file)
        filepath = os.path.join(TXT_FOLDER, txt_file)

        # --- TXT'den kodları oku ---
        txt_codes = {}
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                parsed = parse_line(line)
                if parsed:
                    code, meaning = parsed
                    txt_codes[code] = meaning

        # --- Ana JSON'dan bu markanın kodlarını çek ---
        json_brand_codes = {}
        for code, entry in main_db.items():
            if entry.get("Brand", "").upper() == brand:
                json_brand_codes[code] = entry.get("Meaning", "")

        # --- İkisini birleştir (TXT öncelikli, duplicate yok) ---
        # Önce JSON'dakileri al, sonra TXT'dekiler üzerine yaz (TXT daha spesifik)
        merged = {}

        for code, meaning in json_brand_codes.items():
            merged[code] = {"Meaning": meaning, "Brand": brand}

        for code, meaning in txt_codes.items():
            # TXT'de varsa TXT'yi kullan (daha güncel/spesifik)
            merged[code] = {"Meaning": meaning, "Brand": brand}

        # Sıralı kaydet
        sorted_merged = dict(sorted(merged.items()))

        # --- Marka JSON dosyasını oluştur ---
        output_path = os.path.join(BRANDS_FOLDER, f"{brand.lower()}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(sorted_merged, f, indent=2, ensure_ascii=False)

        # --- Ana JSON'dan bu markanın kodlarını işaretle ---
        removed_count = len(json_brand_codes)
        for code in json_brand_codes.keys():
            codes_to_remove_from_main.add(code)

        print(f"  {txt_file:<25} {brand:<15} {len(txt_codes):<8} {len(json_brand_codes):<8} {len(sorted_merged):<8} {removed_count}")

    # 4. Ana JSON'dan işaretlenen kodları sil
    for code in codes_to_remove_from_main:
        if code in main_db:
            del main_db[code]

    # 5. Temizlenmiş ana JSON'u kaydet
    sorted_main = dict(sorted(main_db.items()))
    with open(MAIN_JSON, "w", encoding="utf-8") as f:
        json.dump(sorted_main, f, indent=2, ensure_ascii=False)

    # 6. Özet
    print(f"""
{'='*75}
✅ Tamamlandı!

  Ana JSON (GENERIC):  {len(sorted_main)} kod kaldı
  Silinen (markaya taşınan): {len(codes_to_remove_from_main)} kod
  Oluşturulan marka JSON: {len(txt_files)} dosya → {BRANDS_FOLDER}/
{'='*75}
""")

    # 7. Marka dağılımı
    print("📊 Oluşturulan marka dosyaları:")
    total_brand_codes = 0
    for txt_file in txt_files:
        brand = filename_to_brand(txt_file)
        output_path = os.path.join(BRANDS_FOLDER, f"{brand.lower()}.json")
        with open(output_path, "r", encoding="utf-8") as f:
            count = len(json.load(f))
        total_brand_codes += count
        print(f"   {brand.lower()}.json → {count} kod")

    print(f"\n   Toplam marka kodu : {total_brand_codes}")
    print(f"   Toplam GENERIC    : {len(sorted_main)}")
    print(f"   GENEL TOPLAM      : {total_brand_codes + len(sorted_main)}")

if __name__ == "__main__":
    main()
