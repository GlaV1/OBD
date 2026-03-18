// ─── Tüm brand DTC veritabanlarını bir arada topla ───────────────
// Dinamik require yerine statik import ile Expo'da çalışır

import genericDB from './dtc-database.json';
import acura from './brands/acura.json';
import audi from './brands/audi.json';
import bmw from './brands/bmw.json';
import buick from './brands/buick.json';
import cadillac from './brands/cadillac.json';
import chevy from './brands/chevy.json';
import chrysler from './brands/chrysler.json';
import dodge from './brands/dodge.json';
import ford from './brands/ford.json';
import geo from './brands/geo.json';
import gm from './brands/gm.json';
import gmc from './brands/gmc.json';
import honda from './brands/honda.json';
import infiniti from './brands/infiniti.json';
import jaguar from './brands/jaguar.json';
import jeep from './brands/jeep.json';
import kia from './brands/kia.json';
import lexus from './brands/lexus.json';
import lincoln from './brands/lincoln.json';
import mazda from './brands/mazda.json';
import mercedes from './brands/mercedes.json';
import mercury from './brands/mercury.json';
import mitsubishi from './brands/mitsubishi.json';
import nissan from './brands/nissan.json';
import oldsmobile from './brands/oldsmobile.json';
import other from './brands/other.json';
import plymouth from './brands/plymouth.json';
import pontiac from './brands/pontiac.json';
import saturn from './brands/saturn.json';
import subaru from './brands/subaru.json';
import suzuki from './brands/suzuki.json';
import toyota from './brands/toyota.json';
import volkswagen from './brands/volkswagen.json';

// Key'ler getBrandFileName() fonksiyonundan dönen değerlerle eşleşmelidir
export const BRAND_DATABASES: Record<string, any> = {
  acura,
  audi,
  bmw,
  buick,
  cadillac,
  chevy,
  chrysler,
  dodge,
  ford,
  geo,
  gm,
  gmc,
  honda,
  infiniti,
  jaguar,
  jeep,
  kia,
  lexus,
  lincoln,
  mazda,
  mercedes,
  mercury,
  mitsubishi,
  nissan,
  oldsmobile,
  other,
  plymouth,
  pontiac,
  saturn,
  subaru,
  suzuki,
  toyota,
  volkswagen,
};

export { genericDB };
