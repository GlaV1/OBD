// ─── Tüm brand DTC veritabanlarını bir arada topla ───────────────
// Dinamik require yerine statik import ile Expo'da çalışır

import genericDB from './dtc-database.json';
import acura from './brands/acura_codes.json';
import audi from './brands/audi_codes.json';
import bmw from './brands/bmw_codes.json';
import buick from './brands/buick_codes.json';
import cadillac from './brands/cadillac_codes.json';
import chevy from './brands/chevy_codes.json';
import chrysler from './brands/chrysler_codes.json';
import dodge from './brands/dodge_codes.json';
import ford from './brands/ford_codes.json';
import geo from './brands/geo_codes.json';
import gm from './brands/gm_codes.json';
import gmc from './brands/gmc_codes.json';
import honda from './brands/honda_codes.json';
import infiniti from './brands/infiniti_codes.json';
import jaguar from './brands/jaguar_codes.json';
import jeep from './brands/jeep_codes.json';
import kia from './brands/kia_codes.json';
import lexus from './brands/lexus_codes.json';
import lincoln from './brands/lincoln_codes.json';
import mazda from './brands/mazda_codes.json';
import mercedes from './brands/mercedes_codes.json';
import mercury from './brands/mercury_codes.json';
import mitsubishi from './brands/mitsubishi_codes.json';
import nissan from './brands/nissan_codes.json';
import oldsmobile from './brands/oldsmobile_codes.json';
import other from './brands/other_codes.json';
import plymouth from './brands/plymouth_codes.json';
import pontiac from './brands/pontiac_codes.json';
import saturn from './brands/saturn_codes.json';
import subaru from './brands/subaru_codes.json';
import suzuki from './brands/suzuki_codes.json';
import toyota from './brands/toyota_codes.json';
import volkswagen from './brands/volkswagen_codes.json';

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
