/* =====================================================================
   62. CARS OVERHAUL — Full Egyptian Market Rebuild
   - Driving licence system (required before buying)
   - 30+ brands, 180+ models with realistic Egyptian pricing
   - Detailed configurator: trim, colour, interior, options
   - Insurance (mandatory third-party + comprehensive)
   - Bank financing with real approval logic
   - Depreciation, service costs, random breakdowns
   - Parents may gift a car at certain ages
   - Car-need events (far job, family pressure, tired of transit)
   - New models each game year
   - Full UI with sub-tabs and modals
   Load AFTER 61-inheritance-migrate-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p62Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p62Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p62EGP(usd2026) { return Math.round(usd2026 * 52.7 * p62Idx()); }

/* ============ 1. STATE ============ */
function p62Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p62) o.p62 = {};
  const d = o.p62;
  if (typeof d.hasLicense !== 'boolean') d.hasLicense = false;
  if (typeof d.licenseAttempts !== 'number') d.licenseAttempts = 0;
  if (typeof d.licenseYear !== 'number') d.licenseYear = -1;
  if (typeof d.licenseExpiresYear !== 'number') d.licenseExpiresYear = -1;
  if (!Array.isArray(d.pendingOffers)) d.pendingOffers = [];
  if (typeof d.lastOfferYear !== 'number') d.lastOfferYear = -1;
  if (!d.carCfg) d.carCfg = { brand: null, modelId: null, trim: 0, color: 0, interior: 0, opts: [], homeCity: 'new-cairo' };
  if (typeof d.subTab !== 'string') d.subTab = 'new';
  if (!Array.isArray(d.pendingEvents)) d.pendingEvents = [];
}
const P62_migrate = migrate;
migrate = function (o) { const r = P62_migrate(o); p62Init(r); return r; };
const P62_newGame = newGame;
newGame = function () { P62_newGame.apply(this, arguments); p62Init(S); };

/* ============ 2. BRAND DATA WITH LOGO BADGES ============ */
/* Each brand: { name, origin, tier, badge (emoji or letter), color } */
const P62_BRANDS = {
  toyota:     { name: 'Toyota',        origin: '🇯🇵', tier: 1, badge: 'T', color: '#E60012' },
  hyundai:    { name: 'Hyundai',       origin: '🇰🇷', tier: 1, badge: 'H', color: '#003B7E' },
  kia:        { name: 'Kia',           origin: '🇰🇷', tier: 1, badge: 'K', color: '#05141F' },
  nissan:     { name: 'Nissan',        origin: '🇯🇵', tier: 1, badge: 'N', color: '#C3002F' },
  honda:      { name: 'Honda',         origin: '🇯🇵', tier: 1, badge: 'H', color: '#E40521' },
  mitsubishi: { name: 'Mitsubishi',    origin: '🇯🇵', tier: 2, badge: 'M', color: '#E60012' },
  chevrolet:  { name: 'Chevrolet',     origin: '🇺🇸', tier: 2, badge: 'C', color: '#D1A955' },
  renault:    { name: 'Renault',       origin: '🇫🇷', tier: 2, badge: 'R', color: '#FFCC00' },
  peugeot:    { name: 'Peugeot',       origin: '🇫🇷', tier: 2, badge: 'P', color: '#0068A5' },
  citroen:    { name: 'Citroën',       origin: '🇫🇷', tier: 2, badge: 'C', color: '#C8102E' },
  fiat:       { name: 'Fiat',          origin: '🇮🇹', tier: 2, badge: 'F', color: '#B30014' },
  skoda:      { name: 'Škoda',         origin: '🇨🇿', tier: 2, badge: 'Š', color: '#4BA82E' },
  volkswagen: { name: 'Volkswagen',    origin: '🇩🇪', tier: 2, badge: 'VW', color: '#001E50' },
  suzuki:     { name: 'Suzuki',        origin: '🇯🇵', tier: 2, badge: 'S', color: '#003399' },
  mg:         { name: 'MG',            origin: '🇨🇳', tier: 2, badge: 'MG', color: '#D50000' },
  byd:        { name: 'BYD',           origin: '🇨🇳', tier: 2, badge: 'B', color: '#3E7BCB' },
  jetour:     { name: 'Jetour',        origin: '🇨🇳', tier: 2, badge: 'J', color: '#1B2A54' },
  chery:      { name: 'Chery',         origin: '🇨🇳', tier: 2, badge: 'C', color: '#C8102E' },
  haval:      { name: 'Haval',         origin: '🇨🇳', tier: 2, badge: 'H', color: '#A81616' },
  geely:      { name: 'Geely',         origin: '🇨🇳', tier: 2, badge: 'G', color: '#1E3A8A' },
  changan:    { name: 'Changan',       origin: '🇨🇳', tier: 2, badge: 'C', color: '#003D79' },
  exeed:      { name: 'Exeed',         origin: '🇨🇳', tier: 2, badge: 'E', color: '#1E1E1E' },
  jeep:       { name: 'Jeep',          origin: '🇺🇸', tier: 2, badge: 'J', color: '#3D5C34' },
  mini:       { name: 'MINI',          origin: '🇬🇧', tier: 3, badge: 'M', color: '#000000' },
  bmw:        { name: 'BMW',           origin: '🇩🇪', tier: 3, badge: 'B', color: '#0166B1' },
  mercedes:   { name: 'Mercedes-Benz', origin: '🇩🇪', tier: 3, badge: '★', color: '#000000' },
  audi:       { name: 'Audi',          origin: '🇩🇪', tier: 3, badge: 'A', color: '#BB0A30' },
  volvo:      { name: 'Volvo',         origin: '🇸🇪', tier: 3, badge: 'V', color: '#003057' },
  lexus:      { name: 'Lexus',         origin: '🇯🇵', tier: 3, badge: 'L', color: '#1A1A1A' },
  landrover:  { name: 'Land Rover',    origin: '🇬🇧', tier: 3, badge: 'LR', color: '#005A2B' },
  jaguar:     { name: 'Jaguar',        origin: '🇬🇧', tier: 3, badge: 'J', color: '#9A1B2F' },
  porsche:    { name: 'Porsche',       origin: '🇩🇪', tier: 4, badge: 'P', color: '#B12B28' },
  tesla:      { name: 'Tesla',         origin: '🇺🇸', tier: 4, badge: 'T', color: '#E82127' },
  maserati:   { name: 'Maserati',      origin: '🇮🇹', tier: 4, badge: 'M', color: '#0C2340' },
  bentley:    { name: 'Bentley',       origin: '🇬🇧', tier: 5, badge: 'B', color: '#1E1E1E' },
  rollsroyce: { name: 'Rolls-Royce',   origin: '🇬🇧', tier: 5, badge: 'RR', color: '#6A1B1B' },
  ferrari:    { name: 'Ferrari',       origin: '🇮🇹', tier: 5, badge: 'F', color: '#E31C23' },
  lamborghini:{ name: 'Lamborghini',   origin: '🇮🇹', tier: 5, badge: 'L', color: '#D4A900' },
  astonmartin:{ name: 'Aston Martin',  origin: '🇬🇧', tier: 5, badge: 'AM', color: '#005D55' }
};

/* ============ 3. MODEL CATALOG ============ */
/* [make, model, class, priceUSD, mpg, hap, soc, life, fromYear, toYear, hybridFrom, isElectric] */
const P62_MODELS = [
  /* ---------- TOYOTA ---------- */
  ['toyota','Corolla','compact',22000,33,2,1,13,2007,9999,2020,0],
  ['toyota','Yaris','econ',17000,36,1,0,11,2007,9999,2015,0],
  ['toyota','Camry','mid',28000,31,2,1,14,2007,9999,2007,0],
  ['toyota','RAV4','suv',32000,30,3,2,14,2007,9999,2016,0],
  ['toyota','Land Cruiser','suv',85000,18,5,5,15,2007,9999,0,0],
  ['toyota','Hilux','truck',38000,22,3,3,14,2007,9999,0,0],
  ['toyota','Fortuner','suv',45000,20,3,3,14,2007,9999,0,0],
  ['toyota','Rush','suv',30000,26,2,2,12,2018,9999,0,0],
  ['toyota','Prius','compact',28000,52,2,2,13,2007,9999,2007,0],
  ['toyota','bZ4X','suv',45000,110,4,4,12,2022,9999,0,1],
  /* ---------- HYUNDAI ---------- */
  ['hyundai','Elantra','compact',21000,33,2,1,12,2007,9999,2017,0],
  ['hyundai','Accent','econ',15000,34,1,0,11,2007,9999,0,0],
  ['hyundai','Tucson','suv',30000,27,3,2,13,2007,9999,2016,0],
  ['hyundai','Santa Fe','suv',38000,24,4,3,14,2007,9999,2021,0],
  ['hyundai','Creta','suv',22000,30,2,2,12,2016,9999,0,0],
  ['hyundai','Bayon','suv',20000,32,2,1,11,2021,9999,0,0],
  ['hyundai','i10','econ',13000,38,1,0,10,2007,9999,0,0],
  ['hyundai','i20','econ',16000,35,1,1,11,2007,9999,0,0],
  ['hyundai','Sonata','mid',29000,28,3,2,14,2007,9999,2016,0],
  ['hyundai','Ioniq 5','suv',42000,114,4,4,12,2022,9999,0,1],
  ['hyundai','Ioniq 6','mid',45000,130,4,3,12,2023,9999,0,1],
  /* ---------- KIA ---------- */
  ['kia','Cerato','compact',21000,32,2,1,12,2007,9999,2017,0],
  ['kia','Rio','econ',17000,34,1,1,11,2007,9999,0,0],
  ['kia','Picanto','econ',14000,37,1,0,10,2007,9999,0,0],
  ['kia','Sportage','suv',30000,26,3,2,13,2007,9999,2016,0],
  ['kia','Sorento','suv',38000,24,4,3,14,2007,9999,2021,0],
  ['kia','Seltos','suv',23000,30,2,2,12,2020,9999,0,0],
  ['kia','Carens','suv',24000,28,3,2,12,2022,9999,0,0],
  ['kia','Sonet','suv',21000,31,2,1,11,2021,9999,0,0],
  ['kia','K5','mid',28000,28,3,2,13,2020,9999,0,0],
  ['kia','EV6','suv',48000,117,4,4,12,2022,9999,0,1],
  /* ---------- NISSAN ---------- */
  ['nissan','Sunny','econ',16000,34,1,0,11,2007,9999,0,0],
  ['nissan','Sentra','compact',20000,33,2,1,12,2007,9999,0,0],
  ['nissan','Kicks','suv',22000,31,2,2,12,2018,9999,0,0],
  ['nissan','Qashqai','suv',30000,28,3,2,13,2007,9999,2016,0],
  ['nissan','X-Trail','suv',38000,26,3,3,13,2007,9999,2022,0],
  ['nissan','Juke','suv',24000,29,2,2,12,2011,9999,0,0],
  ['nissan','Patrol','suv',80000,17,5,5,15,2007,9999,0,0],
  ['nissan','Leaf','compact',33000,112,2,2,10,2011,9999,0,1],
  ['nissan','Ariya','suv',50000,110,4,4,12,2022,9999,0,1],
  /* ---------- HONDA ---------- */
  ['honda','Civic','compact',25000,34,2,2,13,2007,9999,2007,0],
  ['honda','Accord','mid',30000,30,2,2,14,2007,9999,2014,0],
  ['honda','CR-V','suv',32000,30,3,2,13,2007,9999,2020,0],
  ['honda','HR-V','suv',26000,32,2,2,12,2015,9999,0,0],
  ['honda','Pilot','suv',48000,22,4,3,14,2007,9999,0,0],
  /* ---------- MITSUBISHI ---------- */
  ['mitsubishi','Attrage','econ',14000,37,1,0,10,2013,9999,0,0],
  ['mitsubishi','Lancer','compact',19000,31,2,1,11,2007,2018,0,0],
  ['mitsubishi','Eclipse Cross','suv',30000,27,3,2,12,2018,9999,0,0],
  ['mitsubishi','Xpander','suv',20000,30,3,2,11,2018,9999,0,0],
  ['mitsubishi','Pajero','suv',45000,20,4,3,14,2007,9999,0,0],
  /* ---------- CHEVROLET ---------- */
  ['chevrolet','Optra','econ',16000,32,1,0,10,2007,9999,0,0],
  ['chevrolet','Aveo','econ',15000,33,1,0,10,2007,9999,0,0],
  ['chevrolet','Captiva','suv',28000,24,3,2,12,2007,2018,0,0],
  ['chevrolet','Groove','suv',22000,28,2,1,11,2020,9999,0,0],
  ['chevrolet','Menlo','suv',38000,105,3,3,11,2020,9999,0,1],
  ['chevrolet','Tahoe','suv',62000,18,4,4,13,2007,9999,0,0],
  ['chevrolet','Silverado','truck',40000,20,3,3,14,2007,9999,0,0],
  ['chevrolet','Corvette','sport',70000,21,6,7,14,2007,9999,0,0],
  /* ---------- RENAULT ---------- */
  ['renault','Logan','econ',13000,34,1,0,10,2007,9999,0,0],
  ['renault','Duster','suv',22000,28,2,1,11,2010,9999,0,0],
  ['renault','Megane','compact',20000,32,2,1,11,2007,9999,0,0],
  ['renault','Captur','suv',24000,30,2,2,12,2013,9999,0,0],
  ['renault','Kadjar','suv',28000,28,3,2,12,2016,9999,0,0],
  ['renault','Austral','suv',32000,32,3,3,12,2022,9999,2022,0],
  /* ---------- PEUGEOT ---------- */
  ['peugeot','208','compact',18000,34,2,1,11,2012,9999,0,0],
  ['peugeot','2008','suv',22000,32,2,2,11,2013,9999,0,0],
  ['peugeot','3008','suv',30000,29,3,2,12,2009,9999,2021,0],
  ['peugeot','5008','suv',36000,27,4,3,13,2010,9999,0,0],
  ['peugeot','301','econ',15000,35,1,0,10,2012,9999,0,0],
  /* ---------- CITROEN ---------- */
  ['citroen','C3','compact',17000,34,1,1,11,2007,9999,0,0],
  ['citroen','C4','compact',20000,32,2,1,11,2007,9999,0,0],
  ['citroen','C5 Aircross','suv',28000,28,3,2,12,2018,9999,0,0],
  ['citroen','C-Elysee','econ',14000,35,1,0,10,2013,9999,0,0],
  /* ---------- FIAT ---------- */
  ['fiat','Tipo','compact',16000,34,1,0,10,2015,9999,0,0],
  ['fiat','500','compact',18000,36,2,2,10,2007,9999,0,0],
  ['fiat','Panda','econ',13000,38,1,0,10,2007,9999,0,0],
  /* ---------- SKODA ---------- */
  ['skoda','Fabia','econ',18000,35,1,1,11,2007,9999,0,0],
  ['skoda','Octavia','mid',26000,32,3,2,13,2007,9999,2019,0],
  ['skoda','Superb','mid',34000,30,3,3,13,2007,9999,2019,0],
  ['skoda','Kodiaq','suv',38000,26,4,3,13,2016,9999,0,0],
  ['skoda','Kamiq','suv',24000,30,2,2,11,2019,9999,0,0],
  ['skoda','Kushaq','suv',23000,31,2,2,11,2021,9999,0,0],
  ['skoda','Scala','compact',22000,33,2,2,11,2019,9999,0,0],
  /* ---------- VOLKSWAGEN ---------- */
  ['volkswagen','Golf','compact',24000,32,3,2,13,2007,9999,2014,0],
  ['volkswagen','Passat','mid',34000,29,3,2,13,2007,9999,2014,0],
  ['volkswagen','Tiguan','suv',38000,26,3,2,13,2007,9999,2016,0],
  ['volkswagen','T-Roc','suv',30000,30,3,2,12,2017,9999,0,0],
  ['volkswagen','Polo','econ',20000,34,2,1,11,2007,9999,0,0],
  ['volkswagen','ID.4','suv',45000,104,4,4,12,2021,9999,0,1],
  /* ---------- SUZUKI ---------- */
  ['suzuki','Swift','econ',16000,36,1,1,11,2007,9999,2020,0],
  ['suzuki','Dzire','econ',15000,35,1,0,10,2012,9999,0,0],
  ['suzuki','Baleno','compact',18000,33,2,1,11,2016,9999,0,0],
  ['suzuki','Vitara','suv',24000,30,2,2,12,2007,9999,2019,0],
  ['suzuki','Jimny','suv',22000,26,3,2,13,2007,9999,0,0],
  ['suzuki','Ertiga','suv',20000,30,3,2,11,2013,9999,0,0],
  /* ---------- MG ---------- */
  ['mg','ZS','suv',22000,30,2,2,11,2018,9999,0,0],
  ['mg','HS','suv',28000,26,3,2,12,2019,9999,2022,0],
  ['mg','RX5','suv',30000,28,3,2,12,2020,9999,2020,0],
  ['mg','5','compact',19000,32,2,1,11,2019,9999,0,0],
  ['mg','6','mid',24000,30,3,2,12,2020,9999,0,0],
  ['mg','7','mid',28000,28,3,2,12,2020,9999,0,0],
  ['mg','Marvel R','suv',42000,110,4,4,11,2020,9999,0,1],
  ['mg','One','suv',40000,108,4,3,11,2022,9999,0,1],
  /* ---------- BYD ---------- */
  ['byd','Atto 3','suv',32000,105,3,3,11,2022,9999,0,1],
  ['byd','Seal','mid',42000,120,4,3,12,2022,9999,0,1],
  ['byd','Dolphin','compact',26000,115,3,2,11,2022,9999,0,1],
  ['byd','Han','exec',60000,105,5,4,12,2020,9999,0,1],
  ['byd','Tang','suv',55000,100,5,4,12,2019,9999,0,1],
  ['byd','Song Plus','suv',40000,105,4,3,12,2021,9999,0,1],
  /* ---------- JETOUR ---------- */
  ['jetour','X70','suv',25000,28,3,2,12,2019,9999,0,0],
  ['jetour','X90','suv',32000,25,4,3,12,2020,9999,0,0],
  ['jetour','X95','suv',38000,24,4,3,12,2021,9999,0,0],
  ['jetour','T2','suv',30000,26,4,3,12,2023,9999,0,0],
  ['jetour','Dashing','suv',28000,27,3,3,12,2022,9999,0,0],
  /* ---------- CHERY ---------- */
  ['chery','Tiggo 4','suv',22000,30,2,2,11,2019,9999,0,0],
  ['chery','Tiggo 7','suv',28000,28,3,2,12,2020,9999,0,0],
  ['chery','Tiggo 8','suv',34000,26,4,3,12,2020,9999,0,0],
  ['chery','Arrizo 5','compact',18000,33,2,1,11,2018,9999,0,0],
  /* ---------- HAVAL ---------- */
  ['haval','Jolion','suv',23000,30,2,2,11,2021,9999,0,0],
  ['haval','H6','suv',30000,28,3,2,12,2018,9999,2022,0],
  ['haval','H9','suv',42000,22,4,3,13,2016,9999,0,0],
  /* ---------- GEELY ---------- */
  ['geely','Coolray','suv',26000,30,3,2,12,2020,9999,0,0],
  ['geely','Okavango','suv',34000,26,4,3,12,2021,9999,0,0],
  ['geely','Emgrand','compact',20000,32,2,1,11,2017,9999,0,0],
  ['geely','Azkarra','suv',32000,27,3,3,12,2020,9999,0,0],
  /* ---------- CHANGAN ---------- */
  ['changan','CS35','suv',22000,30,2,2,11,2019,9999,0,0],
  ['changan','CS55','suv',28000,28,3,2,12,2019,9999,0,0],
  ['changan','CS75','suv',33000,26,4,3,12,2018,9999,0,0],
  ['changan','Eado','compact',19000,32,2,1,11,2018,9999,0,0],
  /* ---------- EXEED ---------- */
  ['exeed','LX','suv',32000,28,3,3,12,2019,9999,0,0],
  ['exeed','TXL','suv',38000,26,4,3,12,2019,9999,0,0],
  ['exeed','VX','suv',45000,24,4,4,12,2020,9999,0,0],
  /* ---------- JEEP ---------- */
  ['jeep','Renegade','suv',28000,26,3,2,12,2014,9999,0,0],
  ['jeep','Compass','suv',32000,25,3,3,12,2017,9999,0,0],
  ['jeep','Wrangler','suv',55000,20,5,5,14,2007,9999,2021,0],
  ['jeep','Grand Cherokee','suv',65000,20,4,4,14,2007,9999,2022,0],
  ['jeep','Cherokee','suv',40000,24,3,3,12,2007,9999,2019,0],
  /* ---------- MINI ---------- */
  ['mini','Cooper','compact',32000,32,4,5,12,2007,9999,0,0],
  ['mini','Clubman','compact',38000,30,4,4,12,2008,9999,0,0],
  ['mini','Countryman','suv',42000,28,4,4,12,2011,9999,0,0],
  ['mini','Cabrio','compact',40000,30,4,5,11,2009,9999,0,0],
  ['mini','Cooper SE','compact',45000,110,4,5,11,2020,9999,0,1],
  /* ---------- BMW ---------- */
  ['bmw','1 Series','compact',38000,30,4,4,12,2007,9999,0,0],
  ['bmw','2 Series','compact',42000,28,4,4,12,2014,9999,0,0],
  ['bmw','3 Series','lux',48000,28,5,5,12,2007,9999,2018,0],
  ['bmw','5 Series','lux',65000,26,5,6,13,2007,9999,2018,0],
  ['bmw','7 Series','exec',95000,22,6,7,14,2007,9999,2020,0],
  ['bmw','X1','suv',45000,28,4,5,12,2009,9999,2020,0],
  ['bmw','X2','suv',48000,27,4,5,12,2018,9999,0,0],
  ['bmw','X3','suv',55000,25,5,5,13,2007,9999,2020,0],
  ['bmw','X4','suv',60000,24,5,5,13,2014,9999,0,0],
  ['bmw','X5','suv',75000,22,5,6,14,2007,9999,2020,0],
  ['bmw','X6','suv',85000,21,6,6,14,2007,9999,2020,0],
  ['bmw','X7','suv',105000,20,6,7,14,2019,9999,0,0],
  ['bmw','XM','suv',160000,22,7,8,12,2023,9999,2023,0],
  ['bmw','i4','exec',65000,120,5,5,12,2022,9999,0,1],
  ['bmw','i5','exec',78000,115,5,6,12,2024,9999,0,1],
  ['bmw','i7','exec',130000,105,7,7,13,2022,9999,0,1],
  ['bmw','iX','suv',95000,100,6,7,13,2022,9999,0,1],
  /* ---------- MERCEDES ---------- */
  ['mercedes','A-Class','compact',42000,30,4,5,12,2013,9999,0,0],
  ['mercedes','C-Class','lux',52000,27,5,5,12,2007,9999,2018,0],
  ['mercedes','E-Class','exec',75000,25,5,6,13,2007,9999,2018,0],
  ['mercedes','S-Class','exec',120000,22,7,8,14,2007,9999,2020,0],
  ['mercedes','CLA','compact',48000,28,5,5,12,2013,9999,0,0],
  ['mercedes','CLS','exec',85000,24,5,6,13,2007,9999,2023,0],
  ['mercedes','GLA','suv',50000,26,5,5,12,2014,9999,0,0],
  ['mercedes','GLB','suv',55000,25,5,5,12,2020,9999,0,0],
  ['mercedes','GLC','suv',65000,24,5,6,13,2015,9999,2019,0],
  ['mercedes','GLE','suv',85000,22,5,6,13,2007,9999,2019,0],
  ['mercedes','GLS','suv',105000,20,6,7,14,2017,9999,0,0],
  ['mercedes','G-Class','suv',140000,17,7,8,15,2007,9999,0,0],
  ['mercedes','EQS','exec',150000,100,7,7,13,2022,9999,0,1],
  ['mercedes','EQE','exec',110000,102,6,6,13,2022,9999,0,1],
  ['mercedes','EQB','suv',80000,105,5,6,12,2022,9999,0,1],
  ['mercedes','EQA','suv',70000,108,5,5,12,2021,9999,0,1],
  ['mercedes','GLC AMG','suv',105000,20,6,7,13,2019,9999,2020,0],
  ['mercedes','AMG GT','sport',160000,18,7,8,14,2017,9999,0,0],
  ['mercedes','Maybach S','exec',220000,19,8,9,15,2016,9999,2020,0],
  /* ---------- AUDI ---------- */
  ['audi','A1','compact',38000,32,4,4,12,2010,9999,0,0],
  ['audi','A3','compact',42000,30,4,5,12,2007,9999,2019,0],
  ['audi','A4','lux',48000,28,5,5,12,2007,9999,2019,0],
  ['audi','A5','lux',55000,27,5,5,12,2007,9999,2019,0],
  ['audi','A6','exec',75000,25,5,6,13,2007,9999,2019,0],
  ['audi','A7','exec',85000,24,6,6,13,2007,9999,2019,0],
  ['audi','A8','exec',105000,22,6,7,14,2007,9999,2020,0],
  ['audi','Q2','suv',40000,30,4,4,12,2017,9999,0,0],
  ['audi','Q3','suv',50000,28,5,5,12,2011,9999,2020,0],
  ['audi','Q5','suv',62000,26,5,6,13,2007,9999,2020,0],
  ['audi','Q7','suv',90000,22,6,6,14,2007,9999,2020,0],
  ['audi','Q8','suv',110000,20,6,7,14,2019,9999,0,0],
  ['audi','e-tron GT','sport',140000,95,7,7,13,2021,9999,0,1],
  ['audi','Q4 e-tron','suv',65000,108,5,6,12,2021,9999,0,1],
  /* ---------- VOLVO ---------- */
  ['volvo','XC40','suv',45000,28,4,4,12,2018,9999,2019,0],
  ['volvo','XC60','suv',60000,26,5,5,13,2007,9999,2017,0],
  ['volvo','XC90','suv',85000,23,6,6,13,2007,9999,2016,0],
  ['volvo','S60','lux',50000,28,4,4,12,2007,9999,2019,0],
  ['volvo','S90','exec',75000,26,5,5,13,2016,9999,2018,0],
  ['volvo','EX30','suv',45000,120,5,5,12,2023,9999,0,1],
  ['volvo','EX90','suv',95000,110,6,6,13,2023,9999,0,1],
  /* ---------- LEXUS ---------- */
  ['lexus','IS','lux',55000,26,5,5,12,2007,9999,2020,0],
  ['lexus','ES','lux',60000,28,5,5,13,2007,9999,2021,0],
  ['lexus','LS','exec',120000,23,6,7,14,2007,9999,2017,0],
  ['lexus','UX','suv',50000,30,4,4,12,2019,9999,0,0],
  ['lexus','NX','suv',65000,27,5,5,13,2015,9999,2021,0],
  ['lexus','RX','suv',80000,25,5,6,13,2007,9999,2022,0],
  ['lexus','GX','suv',95000,20,6,6,14,2007,9999,0,0],
  ['lexus','LX','suv',140000,18,7,7,15,2007,9999,0,0],
  ['lexus','LC','sport',120000,22,6,7,13,2017,9999,0,0],
  ['lexus','RZ','suv',70000,105,5,6,12,2023,9999,0,1],
  /* ---------- LAND ROVER ---------- */
  ['landrover','Discovery Sport','suv',58000,24,5,5,13,2015,9999,0,0],
  ['landrover','Discovery','suv',85000,22,6,6,14,2007,9999,2018,0],
  ['landrover','Defender','suv',95000,20,6,6,14,2020,9999,2021,0],
  ['landrover','Range Rover Evoque','suv',65000,26,5,6,13,2011,9999,2020,0],
  ['landrover','Range Rover Velar','suv',85000,24,5,6,13,2017,9999,2021,0],
  ['landrover','Range Rover Sport','suv',105000,22,6,7,14,2007,9999,2019,0],
  ['landrover','Range Rover','suv',140000,20,7,8,15,2007,9999,2019,0],
  /* ---------- JAGUAR ---------- */
  ['jaguar','XE','lux',60000,26,5,5,12,2015,9999,0,0],
  ['jaguar','XF','lux',75000,25,5,6,13,2007,9999,2020,0],
  ['jaguar','F-Pace','suv',80000,23,5,6,13,2016,9999,2020,0],
  ['jaguar','E-Pace','suv',60000,25,5,5,12,2017,9999,0,0],
  ['jaguar','I-Pace','suv',90000,90,6,6,12,2018,9999,0,1],
  /* ---------- PORSCHE ---------- */
  ['porsche','911','sport',150000,22,7,8,15,2007,9999,0,0],
  ['porsche','Cayenne','suv',105000,20,6,7,14,2007,9999,2019,0],
  ['porsche','Macan','suv',75000,22,5,6,13,2014,9999,2020,0],
  ['porsche','Panamera','exec',140000,22,6,7,14,2009,9999,2019,0],
  ['porsche','Taycan','sport',160000,85,7,7,13,2020,9999,0,1],
  ['porsche','718 Boxster','sport',95000,24,6,7,14,2016,9999,0,0],
  /* ---------- TESLA ---------- */
  ['tesla','Model 3','mid',40000,130,5,5,12,2017,9999,0,1],
  ['tesla','Model Y','suv',45000,120,5,5,12,2020,9999,0,1],
  ['tesla','Model S','exec',90000,100,7,8,12,2012,9999,0,1],
  ['tesla','Model X','suv',105000,95,7,8,12,2015,9999,0,1],
  ['tesla','Cybertruck','truck',80000,90,7,9,12,2023,9999,0,1],
  /* ---------- MASERATI ---------- */
  ['maserati','Ghibli','exec',95000,22,6,6,13,2013,9999,0,0],
  ['maserati','Levante','suv',115000,20,6,7,14,2016,9999,0,0],
  ['maserati','Grecale','suv',90000,22,6,6,13,2022,9999,0,0],
  /* ---------- BENTLEY ---------- */
  ['bentley','Continental GT','exec',220000,18,8,9,16,2007,9999,0,0],
  ['bentley','Bentayga','suv',230000,17,8,9,16,2015,9999,0,0],
  ['bentley','Flying Spur','exec',250000,18,8,9,16,2007,9999,0,0],
  /* ---------- ROLLS-ROYCE ---------- */
  ['rollsroyce','Ghost','exec',350000,15,10,10,20,2010,9999,0,0],
  ['rollsroyce','Phantom','exec',500000,14,10,10,20,2007,9999,0,0],
  ['rollsroyce','Cullinan','suv',450000,14,10,10,20,2018,9999,0,0],
  ['rollsroyce','Spectre','exec',480000,90,10,10,18,2023,9999,0,1],
  /* ---------- FERRARI ---------- */
  ['ferrari','Roma','sport',280000,15,9,10,15,2020,9999,0,0],
  ['ferrari','296 GTB','sport',320000,18,9,10,15,2022,9999,2022,0],
  ['ferrari','SF90','sport',500000,18,10,10,14,2020,9999,2020,0],
  ['ferrari','Purosangue','suv',420000,15,9,10,15,2023,9999,0,0],
  /* ---------- LAMBORGHINI ---------- */
  ['lamborghini','Huracan','sport',280000,15,9,10,15,2014,9999,0,0],
  ['lamborghini','Urus','suv',280000,15,9,10,15,2018,9999,2022,0],
  ['lamborghini','Revuelto','sport',550000,17,10,10,14,2023,9999,2023,0],
  /* ---------- ASTON MARTIN ---------- */
  ['astonmartin','DB12','exec',280000,17,8,9,15,2023,9999,0,0],
  ['astonmartin','Vantage','sport',200000,18,8,9,15,2007,9999,0,0],
  ['astonmartin','DBX','suv',240000,17,8,9,15,2020,9999,0,0]
];

/* ============ 4. CLASSES, TRIMS, COLORS, INTERIORS ============ */
const P62_CLS = {
  econ:     { label: 'Economy',   baseMaintenance: 450,  insurancePct: 0.030 },
  compact:  { label: 'Compact',   baseMaintenance: 500,  insurancePct: 0.032 },
  mid:      { label: 'Mid-size',  baseMaintenance: 600,  insurancePct: 0.035 },
  suv:      { label: 'SUV',       baseMaintenance: 750,  insurancePct: 0.038 },
  truck:    { label: 'Pickup',    baseMaintenance: 800,  insurancePct: 0.040 },
  lux:      { label: 'Luxury',    baseMaintenance: 1400, insurancePct: 0.048 },
  sport:    { label: 'Sports',    baseMaintenance: 1500, insurancePct: 0.055 },
  exec:     { label: 'Executive', baseMaintenance: 3000, insurancePct: 0.062 }
};

const P62_TRIMS = [
  { id: 'base',    label: 'Base',    mult: 1.00, hap: 0, soc: 0, desc: 'Standard equipment' },
  { id: 'comfort', label: 'Comfort', mult: 1.15, hap: 1, soc: 1, desc: 'Better seats, upgraded audio, more safety' },
  { id: 'sport',   label: 'Sport',   mult: 1.28, hap: 1, soc: 2, desc: 'Sport styling, stiffer suspension' },
  { id: 'premium', label: 'Premium', mult: 1.45, hap: 2, soc: 2, desc: 'Full luxury package' }
];

const P62_COLORS = [
  ['White',        0,    0],
  ['Black',        0,    0],
  ['Silver',       550,  0],
  ['Grey',         550,  0],
  ['Red',          900,  1],
  ['Blue',         900,  1],
  ['Green',        900,  1],
  ['Orange',       900,  1],
  ['Pearl White',  1500, 1],
  ['Matte Black',  3000, 1]
];

const P62_INTERIORS = [
  { id: 'cloth',   label: 'Cloth seats',                usd: 0,    hap: 0, soc: 0 },
  { id: 'leather', label: 'Leather seats',              usd: 2500, hap: 1, soc: 0 },
  { id: 'prem',    label: 'Premium leather / Alcantara',usd: 5500, hap: 2, soc: 1 },
  { id: 'sport',   label: 'Sport leather, red stitching',usd: 4000, hap: 1, soc: 1 }
];
const P62_OPTIONS = [
  /* id, label, usd, hap, soc, fromYear, untilYear */
  ['sun',     'Panoramic sunroof',               1800, 1, 0, 2007, 9999],
  ['audio',   'Premium audio system',            1500, 1, 0, 2007, 9999],
  ['nav',     'Built-in navigation',             1200, 1, 0, 2007, 2016],
  ['carplay', 'Apple CarPlay / Android Auto',    400,  1, 0, 2014, 9999],
  ['cam',     'Backup camera',                   700,  0, 0, 2008, 9999],
  ['adas',    'Adaptive cruise + lane assist',   2500, 1, 0, 2015, 9999],
  ['heat',    'Heated seats and steering wheel', 800,  1, 0, 2007, 9999],
  ['remote',  'Remote start',                    500,  1, 0, 2007, 9999],
  ['qi',      'Wireless phone charging',         400,  1, 0, 2017, 9999],
  ['wheels',  '19-inch alloy wheels',            1600, 0, 1, 2007, 9999],
  ['winter',  'Winter package (AWD, snow tyres)',1800, 0, 0, 2007, 9999],
  ['tow',     'Tow package',                     900,  0, 0, 2007, 9999],
  ['hud',     'Head-up display',                 1200, 1, 1, 2013, 9999],
  ['massage', 'Massaging front seats',           2200, 2, 1, 2015, 9999],
  ['air',     'Air suspension',                  3200, 1, 1, 2012, 9999]
];
/* ============ 5. INSURANCE ============ */
const P62_INSURANCE = {
  none:    { label: 'No insurance',                    mult: 0,    desc: '⚠️ Illegal in Egypt. You will be fined.' },
  tp:      { label: 'Third-party (mandatory)',         mult: 0.030, desc: 'Covers damage to others only.' },
  compreh: { label: 'Comprehensive',                   mult: 0.055, desc: 'Covers you and others. Recommended for new cars.' }
};

/* ============ 6. LICENCE SYSTEM ============ */
function p62HasLicense() {
  p62Init();
  return !!(S.p62.hasLicense && (S.p62.licenseExpiresYear < 0 || S.p62.licenseExpiresYear >= gameYear()));
}
function p62LicenceStatus() {
  p62Init();
  if (!S.p62.hasLicense) return 'none';
  if (S.p62.licenseExpiresYear < gameYear()) return 'expired';
  return 'valid';
}
function p62TakeLicenseTest() {
  p62Init();
  if (S.age < 18) return hint('Driving licence requires age 18.');
  if (S.p62.hasLicense && S.p62.licenseExpiresYear >= gameYear()) return hint('You already hold a valid licence.');
  if (S.p62.licenseAttempts >= 4) return hint('You have used your four attempts. Try next year.');
  const rate = p62Rate();
  const testEGP = p62EGP(2800);   /* theoretical + practical + medical */
  const internal = testEGP / rate;
  if (S.wealth < internal) return hint('Licence course and test cost about ' + testEGP.toLocaleString() + ' EGP.');
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.licenseTest = (S.bill.licenseTest || 0) + internal;
  S.p62.licenseAttempts = (S.p62.licenseAttempts || 0) + 1;

  const chance = 0.55 + Math.max(0, (S.smarts - 40) / 200) + Math.max(0, (S.happiness - 40) / 400);
  if (Math.random() < chance) {
    S.p62.hasLicense = true;
    S.p62.licenseYear = gameYear();
    S.p62.licenseExpiresYear = gameYear() + 10;
    fx({ happiness: 6 });
    log('🎉 You passed the driving licence test! Valid until ' + S.p62.licenseExpiresYear + '.');
    if (typeof realismNotice === 'function') {
      realismNotice('Driving licence obtained', 'You now hold a driving licence. You can legally buy, register and drive a car.');
    }
  } else {
    fx({ happiness: -3 });
    log('❌ You failed the driving licence test (attempt ' + S.p62.licenseAttempts + '/4). Try again next year.');
    if (typeof realismNotice === 'function') {
      realismNotice('Licence test failed', 'The examiner failed you. Improve your skills and retry. Each attempt costs ' + testEGP.toLocaleString() + ' EGP.');
    }
  }
  hint();
  render();
}
window.p62TakeLicenseTest = p62TakeLicenseTest;

function p62RenewLicense() {
  p62Init();
  if (!S.p62.hasLicense) return hint('You do not have a licence.');
  if (S.p62.licenseExpiresYear >= gameYear()) return hint('Your licence is still valid.');
  const rate = p62Rate();
  const egp = p62EGP(1200);
  const internal = egp / rate;
  if (S.wealth < internal) return hint('Renewal costs ' + egp.toLocaleString() + ' EGP.');
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.licenseRenewal = (S.bill.licenseRenewal || 0) + internal;
  S.p62.licenseExpiresYear = gameYear() + 10;
  log('🎫 Driving licence renewed. Valid until ' + S.p62.licenseExpiresYear + '.');
  hint();
  render();
}
window.p62RenewLicense = p62RenewLicense;

/* ============ 7. CAR HELPERS ============ */
function p62ModelById(id) {
  if (!id) return null;
  const parts = String(id).split('_');
  const make = parts[0];
  const modelName = parts.slice(1).join(' ');
  return P62_MODELS.find(function (m) {
    return m[0].toLowerCase() === make.toLowerCase() && m[1].toLowerCase() === modelName.toLowerCase();
  }) || null;
}
function p62ModelsForBrand(brand, year) {
  year = year || gameYear();
  return P62_MODELS.filter(function (m) {
    return m[0] === brand && year >= m[9] && year <= m[10];
  });
}
function p62BasePriceUSD(model, year) {
  if (!model) return 0;
  const inflation = (typeof prOf === 'function') ? prOf(year || gameYear(), S) : 1;
  let base = Number(model[3]) || 0;
  /* Egypt import tax premium for luxury tiers */
  if (S.country === 'egy') {
    const brand = P62_BRANDS[model[0]];
    if (brand && brand.tier >= 3) base *= 1.15;
    if (brand && brand.tier === 4) base *= 1.25;
    if (brand && brand.tier === 5) base *= 1.35;
  }
  return Math.round(base * inflation);
}
function p62Depreciation(age) {
  /* Year 1: 15%, Year 2: 12%, Year 3: 10%, Year 4-8: 8% */
  let factor = 1.0;
  for (let i = 0; i < age; i++) {
    if (i === 0) factor *= 0.85;
    else if (i === 1) factor *= 0.88;
    else if (i === 2) factor *= 0.90;
    else factor *= 0.92;
  }
  return factor;
}

/* ============ 8. CONFIGURATOR ============ */
function p62ResetCfg(brand, modelId) {
  p62Init();
  S.p62.carCfg = {
    brand: brand || null,
    modelId: modelId || null,
    trim: 0,
    color: 0,
    interior: 0,
    opts: [],
    insurance: 'compreh',
    payment: 'cash'
  };
}
function p62CfgSet(key, value) {
  p62Init();
  if (key === 'opt') {
    const idx = S.p62.carCfg.opts.indexOf(value);
    if (idx >= 0) S.p62.carCfg.opts.splice(idx, 1);
    else S.p62.carCfg.opts.push(value);
  } else {
    S.p62.carCfg[key] = value;
  }
  render();
}
window.p62CfgSet = p62CfgSet;

function p62CfgPrice() {
  p62Init();
  const cfg = S.p62.carCfg;
  if (!cfg.modelId) return { car: 0, opts: 0, insurance: 0, registration: 0, total: 0, basePrice: 0 };
  const model = p62ModelById(cfg.modelId);
  if (!model) return { car: 0, opts: 0, insurance: 0, registration: 0, total: 0, basePrice: 0 };
  const year = gameYear();
  const base = p62BasePriceUSD(model, year);
  const trim = P62_TRIMS[cfg.trim] || P62_TRIMS[0];
  const colorAdd = P62_COLORS[cfg.color] ? P62_COLORS[cfg.color][1] : 0;
  const interior = P62_INTERIORS[cfg.interior] || P62_INTERIORS[0];
  const optsAdd = (cfg.opts || []).reduce(function (sum, oid) {
    const o = P62_OPTIONS.find(function (x) { return x[0] === oid; });
    if (!o) return sum;
    if (o[5] && year < o[5]) return sum;
    if (o[6] && year > o[6]) return sum;
    return sum + (Number(o[2]) || 0);
  }, 0);
  const carInternal = Math.round((base * trim.mult + colorAdd + interior.usd) * (S.pr || 1) + optsAdd * (S.pr || 1));
  const optsInternal = Math.round(optsAdd * (S.pr || 1));
  const regInternal = Math.round(carInternal * 0.06);
  const cls = P62_CLS[model[3]] || P62_CLS.compact;
  const insRate = (P62_INSURANCE[cfg.insurance] || P62_INSURANCE.compreh).mult;
  const insuranceInternal = Math.round(carInternal * insRate);
  const totalInternal = carInternal + regInternal + insuranceInternal;
  return {
    car: carInternal,
    basePrice: base,
    options: optsInternal,
    registration: regInternal,
    insurance: insuranceInternal,
    total: totalInternal,
    model: model,
    cls: cls
  };
}

/* ============ 9. PURCHASE LOGIC ============ */
function p62PurchaseCar(method) {
  p62Init();
  if (!p62HasLicense()) return hint('You need a valid driving licence first.');
  const price = p62CfgPrice();
  if (!price.model) return hint('No car configured.');
  const rate = p62Rate();

  /* Bank / payment approval */
  if (method !== 'cash') {
    const income = ((S.job && S.job.salary) || S.income || 0);
    const downPct = method === 'loan7' ? 0.10 : 0.15;
    const downInternal = price.car * downPct;
    if (S.wealth < downInternal) return hint('You need ' + Math.round(downInternal * rate).toLocaleString() + ' EGP for the down payment.');
    const creditOK = (S.bank && S.bank.score || 680) >= 620;
    const incomeOK = income * 12 >= price.car * 0.5;
    const employed = !!S.job || !!S.remote || !!(S.remoteJob);
    const chance = (creditOK ? 0.35 : 0) + (incomeOK ? 0.30 : 0) + (employed ? 0.25 : 0);
    if (Math.random() > chance) {
      return hint('❌ The bank declined your financing. Improve your credit score or income and try again. Cash purchase is still available.');
    }
  }

  if (method === 'cash') {
    if (S.wealth < price.total) return hint('You need ' + Math.round(price.total * rate).toLocaleString() + ' EGP total.');
    S.wealth -= price.total;
  } else {
    const downPct = method === 'loan7' ? 0.10 : 0.15;
    const downInternal = price.car * downPct;
    S.wealth -= downInternal;
    const months = method === 'loan7' ? 84 : 60;
    const ratePct = 0.16;
    const financed = price.car - downInternal;
    const totalWithInterest = financed * (1 + ratePct * (months / 12));
    const monthlyPayment = Math.round(totalWithInterest / months);
    if (!S.bank) S.bank = { installments: {}, cardDebt: {}, activeCards: [], primaryCard: null, score: 680, savingsBal: 0, loans: [], missedPmts: 0 };
    if (!S.bank.installments) S.bank.installments = {};
    const key = 'car_loan_' + Date.now();
    S.bank.installments[key] = {
      name: 'Car loan — ' + price.model[1],
      totalBalance: totalWithInterest,
      remaining: totalWithInterest,
      monthlyPayment: monthlyPayment,
      monthsTotal: months,
      monthsLeft: months,
      fee: totalWithInterest - financed,
      startedYear: gameYear()
    };
  }

  /* Register the car */
  const cfg = S.p62.carCfg;
  const model = price.model;
  const newCar = {
    uid: 'c' + Math.random().toString(36).slice(2, 8),
    make: P62_BRANDS[model[0]] ? P62_BRANDS[model[0]].name : model[0],
    name: model[1],
    cls: model[3],
    year: gameYear(),
    trim: cfg.trim,
    color: cfg.color,
    interior: cfg.interior,
    opts: (cfg.opts || []).slice(),
    msrp: price.car,
    paid: method === 'cash' ? price.total : (price.car * (method === 'loan7' ? 0.10 : 0.15) + price.registration + price.insurance),
    insurance: cfg.insurance,
    insuranceExpiry: gameYear() + 1,
    registrationExpiry: gameYear() + 1,
    miles: 0,
    cond: 100,
    age: 0,
    acc: false,
    broken: false,
    fix: 0,
    mods: [],
    modCost: 0,
    seller: 'dealer',
    brand: model[0],
    fuel: model[11] ? 'e' : (model[10] ? 'h' : 'g'),
    life: model[8]
  };
  S.cars = S.cars || [];
  S.cars.push(newCar);
  S.cars = S.cars.slice(-4);   /* garage limit 4 */

  fx({ happiness: 8, social: 6 });
  log('🚗 Purchased a new ' + newCar.year + ' ' + newCar.make + ' ' + newCar.name + ' (' + P62_TRIMS[cfg.trim].label + '). Total: ' + Math.round(price.total * rate).toLocaleString() + ' EGP.');
  if (typeof realismNotice === 'function') {
    realismNotice('Car purchased', newCar.year + ' ' + newCar.make + ' ' + newCar.name + ' — ' + P62_TRIMS[cfg.trim].label + '. Total on the road: ' + Math.round(price.total * rate).toLocaleString() + ' EGP.');
  }
  p62ResetCfg(null, null);
  S.p62.subTab = 'garage';
  render();
}
window.p62PurchaseCar = p62PurchaseCar;

/* ============ 10. SERVICE, INSURANCE, REPAIRS ============ */
function p62RenewInsurance(uid) {
  if (!S || !S.cars) return;
  const car = S.cars.find(function (c) { return c && c.uid === uid; });
  if (!car) return hint('Car not found.');
  const rate = p62Rate();
  const cls = P62_CLS[car.cls] || P62_CLS.compact;
  const insRate = (P62_INSURANCE[car.insurance] || P62_INSURANCE.compreh).mult;
  const egp = Math.round(Number(car.msrp) * insRate * p62Idx());
  const internal = egp / rate;
  if (S.wealth < internal) return hint('Insurance renewal costs ' + egp.toLocaleString() + ' EGP.');
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.carInsurance = (S.bill.carInsurance || 0) + internal;
  car.insuranceExpiry = gameYear() + 1;
  log('🛡 Insurance renewed on ' + car.make + ' ' + car.name + ' for ' + egp.toLocaleString() + ' EGP.');
  render();
}
window.p62RenewInsurance = p62RenewInsurance;

function p62ChangeInsurance(uid, tier) {
  if (!S || !S.cars) return;
  const car = S.cars.find(function (c) { return c && c.uid === uid; });
  if (!car) return hint('Car not found.');
  if (!P62_INSURANCE[tier]) return hint('Invalid tier.');
  car.insurance = tier;
  log('Insurance for ' + car.make + ' ' + car.name + ' set to ' + P62_INSURANCE[tier].label + '.');
  render();
}
window.p62ChangeInsurance = p62ChangeInsurance;

function p62RepairCar(uid) {
  if (!S || !S.cars) return;
  const car = S.cars.find(function (c) { return c && c.uid === uid; });
  if (!car || !car.broken) return hint('This car is not broken.');
  const rate = p62Rate();
  const cost = Number(car.fix) || 0;
  if (S.wealth < cost) return hint('You need ' + Math.round(cost * rate).toLocaleString() + ' EGP for the repair.');
  S.wealth -= cost;
  S.expenses = (S.expenses || 0) + cost;
  S.bill = S.bill || {};
  S.bill.carRepair = (S.bill.carRepair || 0) + cost;
  car.broken = false;
  car.fix = 0;
  car.cond = Math.min(100, (car.cond || 100) + 15);
  log('🔧 Repaired ' + car.make + ' ' + car.name + ' for ' + Math.round(cost * rate).toLocaleString() + ' EGP.');
  render();
}
window.p62RepairCar = p62RepairCar;

/* ============ 11. YEARLY TICK ============ */
function p62YearlyCars() {
  if (!S || !S.cars || !S.cars.length) return;
  const rate = p62Rate();
  const yr = gameYear();
  S.cars.forEach(function (car) {
    if (!car) return;
    const wasLeased = !!car.lease;
    car.age = (Number(car.age) || 0) + 1;
    car.miles = (Number(car.miles) || 0) + (S.transport === 'car' ? 11000 : 1500);
    car.cond = Math.max(15, (Number(car.cond) || 100) - 2.5 - (car.age > 8 ? 1.5 : 0));

    /* Depreciation (value updated on the fly) */
    car.value = Math.round((Number(car.msrp) || 0) * p62Depreciation(car.age));

    /* Insurance renewal reminder */
    if (car.insuranceExpiry < yr && car.insurance !== 'none') {
      car.insuranceExpiry = yr + 1;
      const insEGP = Math.round(Number(car.msrp) * (P62_INSURANCE[car.insurance] || P62_INSURANCE.compreh).mult * p62Idx());
      const insInternal = insEGP / rate;
      if (S.wealth >= insInternal) {
        S.wealth -= insInternal;
        S.expenses = (S.expenses || 0) + insInternal;
        S.bill = S.bill || {};
        S.bill.carInsurance = (S.bill.carInsurance || 0) + insInternal;
        log('🛡 ' + car.make + ' ' + car.name + ' insurance renewed: ' + insEGP.toLocaleString() + ' EGP.');
      }
    }

    /* Registration renewal */
    if (car.registrationExpiry < yr) {
      car.registrationExpiry = yr + 2;
      const regEGP = Math.round(1200 * p62Idx() + Number(car.msrp) * 0.004);
      const regInternal = regEGP / rate;
      if (S.wealth >= regInternal) {
        S.wealth -= regInternal;
        S.expenses = (S.expenses || 0) + regInternal;
        S.bill = S.bill || {};
        S.bill.carRegistration = (S.bill.carRegistration || 0) + regInternal;
        log('🚗 Registration renewed for ' + car.make + ' ' + car.name + ': ' + regEGP.toLocaleString() + ' EGP.');
      }
    }

    /* Random breakdown */
    const breakdownChance = 0.06 + Math.max(0, car.age - 3) * 0.02 + (car.cond < 50 ? 0.1 : 0);
    if (!car.broken && Math.random() < breakdownChance) {
      const cls = P62_CLS[car.cls] || P62_CLS.compact;
      const costEGP = Math.round(cls.baseMaintenance * p62Idx() * (0.5 + Math.random()) * (car.cond < 50 ? 1.5 : 1));
      car.broken = true;
      car.fix = costEGP / rate;
      log('⚠️ ' + car.make + ' ' + car.name + ' broke down. Repair cost: ' + costEGP.toLocaleString() + ' EGP. Check My Garage.');
      if (typeof realismNotice === 'function') {
        realismNotice('Car breakdown', car.make + ' ' + car.name + ' broke down. Repair cost: ' + costEGP.toLocaleString() + ' EGP.');
      }
    }

    /* Annual service cost */
    if (S.age >= 18) {
      const cls = P62_CLS[car.cls] || P62_CLS.compact;
      const servEGP = Math.round(cls.baseMaintenance * p62Idx() * (1 + 0.05 * car.age));
      const servInternal = servEGP / rate;
      if (S.wealth >= servInternal) {
        S.wealth -= servInternal;
        S.expenses = (S.expenses || 0) + servInternal;
        S.bill = S.bill || {};
        S.bill.carService = (S.bill.carService || 0) + servInternal;
      }
    }
  });
}

/* ============ 12. PARENT CAR GIFT ============ */
function p62ParentCarOffer() {
  if (!S || S.age < 18) return;
  p62Init();
  if (S.p62.lastOfferYear === gameYear()) return;
  const parents = (typeof parents === 'function' ? parents() : []).filter(function (p) { return p.alive !== false; });
  if (!parents.length) return;
  const fw = Number(S.famWealth) || 0;
  if (fw === 0) return;   /* modest families don't gift cars */
  if (S.cars && S.cars.length > 0) return;
  if (Math.random() > (fw === 2 ? 0.35 : 0.15)) return;

  S.p62.lastOfferYear = gameYear();
  S.p62.pendingOffers.push({
    year: gameYear(),
    type: 'parent_gift_car',
    wealthTier: fw
  });
}

function p62ShowPendingOffer() {
  if (!S || !S.p62 || !S.p62.pendingOffers || !S.p62.pendingOffers.length) return;
  if (document.getElementById('p62-offer-modal')) return;
  const off = S.p62.pendingOffers[0];
  const rate = p62Rate();

  let title, text;
  if (off.type === 'parent_gift_car') {
    const usedOrNew = off.wealthTier === 2 ? 'a new' : 'a used';
    title = '🚗 Your parents offer you a car';
    text = 'Your parents notice you take public transport everywhere. They offer to give you ' + usedOrNew + ' car to help. ' +
      (off.wealthTier === 2 ? 'They can afford a decent new model.' : 'They will look for a used one within their budget.') +
      ' You will still pay insurance and maintenance yourself.';
  }

  const modal = document.createElement('div');
  modal.id = 'p62-offer-modal';
  modal.className = 'p24-modal-backdrop';
  modal.innerHTML = '<div class="p24-modal" style="max-width:460px">' +
    '<div class="p24-pill">FAMILY OFFER · ' + gameYear() + '</div>' +
    '<h2>' + title + '</h2>' +
    '<p>' + text + '</p>' +
    '<div class="acts" style="margin-top:14px">' +
    '<button class="btn" onclick="p62AcceptParentCar()">Accept the offer</button>' +
    '<button class="btn" onclick="p62DeclineParentCar()">Politely decline</button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(modal);
}
window.p62ShowPendingOffer = p62ShowPendingOffer;

function p62AcceptParentCar() {
  p62Init();
  if (!S.p62.pendingOffers.length) return;
  const off = S.p62.pendingOffers.shift();
  const fw = off.wealthTier;
  const rate = p62Rate();

  /* Pick a car based on family wealth */
  const pool = P62_MODELS.filter(function (m) {
    if (gameYear() < m[9] || gameYear() > m[10]) return false;
    const cls = m[3];
    if (fw === 2) return ['compact', 'mid', 'suv'].indexOf(cls) >= 0 && m[3] !== 'truck';
    return ['econ', 'compact'].indexOf(cls) >= 0;
  });
  const model = pool[Math.floor(Math.random() * pool.length)];
  const brand = P62_BRANDS[model[0]];
  const base = p62BasePriceUSD(model, gameYear());
  const age = fw === 2 ? 0 : 3 + Math.floor(Math.random() * 4);
  const value = Math.round(base * p62Depreciation(age));
  const car = {
    uid: 'cg' + Math.random().toString(36).slice(2, 8),
    make: brand.name,
    name: model[1],
    cls: model[3],
    year: gameYear() - age,
    trim: 0,
    color: 0,
    interior: 0,
    opts: [],
    msrp: base,
    paid: 0,
    insurance: 'tp',
    insuranceExpiry: gameYear() + 1,
    registrationExpiry: gameYear() + 1,
    miles: age * 12000,
    cond: fw === 2 ? 98 : 70,
    age: age,
    acc: false,
    broken: false,
    fix: 0,
    mods: [],
    modCost: 0,
    seller: 'parents',
    brand: model[0],
    fuel: model[11] ? 'e' : (model[10] ? 'h' : 'g'),
    life: model[8],
    value: value
  };
  S.cars = S.cars || [];
  S.cars.push(car);
  S.cars = S.cars.slice(-4);
  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 8);
  });
  fx({ happiness: 6 });
  log('🎁 Your parents gave you a ' + car.year + ' ' + car.make + ' ' + car.name + '. They paid for it; you cover insurance and maintenance.');
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  render();
}
window.p62AcceptParentCar = p62AcceptParentCar;

function p62DeclineParentCar() {
  p62Init();
  if (!S.p62.pendingOffers.length) return;
  S.p62.pendingOffers.shift();
  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 3);
  });
  log('You politely declined your parents\' car offer.');
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  render();
}
window.p62DeclineParentCar = p62DeclineParentCar;

/* ============ 13. CAR NEED EVENTS ============ */
function p62CheckCarNeed() {
  if (!S || S.age < 18) return;
  if (!S.job) return;
  if (S.cars && S.cars.length > 0) return;
  if (S.transport !== 'bus') return;
  if (S.p62.lastNeedYear === gameYear()) return;
  if (Math.random() > 0.10) return;
  S.p62.lastNeedYear = gameYear();
  if (!Array.isArray(S.p67Matters)) S.p67Matters = [];
  if (!S.p23Matters) S.p23Matters = [];
  S.p23Matters.push({
    id: 'p62_carneed_' + gameYear(),
    type: 'p62-car-need',
    title: '🚗 Transport is wearing you down',
    text: 'Commuting to ' + (S.job.company || 'work') + ' by bus is exhausting. Colleagues talk about buying cars. You feel pressure to get one too.',
    createdAge: S.age,
    dueAge: S.age + 1,
    resolved: false
  });
}

/* ============ 14. UI — SUB-TABS + VIEWS ============ */
function p62BrandBadge(brandKey, size) {
  const b = P62_BRANDS[brandKey];
  if (!b) return '';
  const sz = size || 40;
  return '<div style="display:inline-flex;align-items:center;justify-content:center;width:' + sz + 'px;height:' + sz + 'px;border-radius:10px;background:' + b.color + ';color:#fff;font-weight:800;font-size:' + Math.round(sz * 0.4) + 'px;letter-spacing:-.5px">' + b.badge + '</div>';
}

function p62BuildCarsHeader() {
  p62Init();
  const sub = S.p62.subTab || 'new';
  const tabs = [
    ['new', '🆕 New'],
    ['used', '🔄 Used'],
    ['rent', '🔑 Rent'],
    ['garage', '🅿️ My Garage (' + ((S.cars || []).length) + ')'],
    ['license', '🎫 Licence']
  ];
  let html = '<section class="card" style="padding:12px 14px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
    '<div><div class="muted" style="font-size:.7rem;letter-spacing:.06em;font-weight:700">CARS · EGYPT ' + gameYear() + '</div>' +
    '<div style="font-size:1.05rem;font-weight:700;margin-top:4px">' + (p62HasLicense() ? '🎫 Licensed driver' : '⚠️ No driving licence') + '</div>' +
    '<div class="muted" style="font-size:.78rem;margin-top:2px">Fuel $' + ((S.gas || 3.3).toFixed(2)) + '/gal · Registration + insurance required</div></div>' +
    '<span style="font-size:2rem">🚗</span></div></section>';
  html += '<div style="display:flex;gap:6px;overflow-x:auto;margin:10px 0;padding-bottom:2px;scrollbar-width:none">' +
    tabs.map(function (t) {
      return '<button class="sub-tab' + (sub === t[0] ? ' on' : '') + '" style="padding:8px 12px;font-size:.82rem" onclick="p62SetSub(\'' + t[0] + '\')">' + t[1] + '</button>';
    }).join('') + '</div>';
  return html;
}
function p62SetSub(id) {
  p62Init();
  S.p62.subTab = id;
  render();
}
window.p62SetSub = p62SetSub;

function p62BuildLicenseTab() {
  p62Init();
  const status = p62LicenceStatus();
  const rate = p62Rate();
  let html = '<section class="card"><h3>🎫 Driving licence</h3>';
  if (status === 'none') {
    html += '<p class="muted">You must hold a valid Egyptian driving licence before buying and registering a car.</p>' +
      '<div class="row"><span>Cost (course + test + medical)</span><b class="mono">' + p62EGP(2800).toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Attempts used</span><b>' + (S.p62.licenseAttempts || 0) + ' / 4</b></div>' +
      '<button class="btn" onclick="p62TakeLicenseTest()">Take driving test</button>';
  } else if (status === 'expired') {
    html += '<p style="color:var(--rose)">Your licence expired in ' + S.p62.licenseExpiresYear + '.</p>' +
      '<button class="btn" onclick="p62RenewLicense()">Renew licence · ' + p62EGP(1200).toLocaleString() + ' EGP</button>';
  } else {
    html += '<p style="color:var(--mint)">✅ Valid until ' + S.p62.licenseExpiresYear + '.</p>' +
      '<div class="row"><span>Issued</span><b>' + S.p62.licenseYear + '</b></div>' +
      '<div class="row"><span>Expires</span><b>' + S.p62.licenseExpiresYear + '</b></div>';
  }
  html += '</section>';
  return html;
}

function p62BuildNewTab() {
  if (!S.cars) S.cars = [];
  if (S.cars.length >= 4) {
    return '<section class="card" style="text-align:center;padding:32px 16px"><div style="font-size:3rem;opacity:.4">🅿️</div>' +
      '<h3 style="margin-top:12px">Garage full</h3><p class="muted">You can own up to 4 cars. Sell one first.</p></section>';
  }
  const year = gameYear();
  const brands = Object.keys(P62_BRANDS);
  const brandCards = brands.map(function (key) {
    const b = P62_BRANDS[key];
    const models = p62ModelsForBrand(key, year);
    if (!models.length) return '';
    const cheapest = models.reduce(function (min, m) {
      const p = p62BasePriceUSD(m, year);
      return p < min ? p : min;
    }, Infinity);
    const cheapestEGP = Math.round(cheapest * 52.7 * p62Idx());
    return '<button class="btn" style="margin:0;padding:12px;text-align:left;display:flex;align-items:center;gap:10px" onclick="p62OpenBrand(\'' + key + '\')">' +
      p62BrandBadge(key, 36) +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-weight:700">' + b.name + '</div>' +
      '<div class="muted" style="font-size:.72rem">' + models.length + ' models · from ' + cheapestEGP.toLocaleString() + ' EGP</div>' +
      '</div>' +
      '</button>';
  }).join('');

  return '<section class="card"><h3>🆕 New cars — browse brands</h3>' +
    '<p class="muted" style="font-size:.82rem">Egyptian market 2026. All prices are on-the-road before options.</p>' +
    '<div style="display:grid;grid-template-columns:1fr;gap:6px;margin-top:10px">' + brandCards + '</div>' +
    '</section>';
}

function p62OpenBrand(brandKey) {
  const brand = P62_BRANDS[brandKey];
  if (!brand) return;
  const year = gameYear();
  const models = p62ModelsForBrand(brandKey, year);
  if (!models.length) return hint('No models available for this brand this year.');

  const rate = p62Rate();
  const list = models.map(function (m) {
    const baseUSD = p62BasePriceUSD(m, year);
    const baseEGP = Math.round(baseUSD * 52.7 * p62Idx());
    const cls = P62_CLS[m[3]] || P62_CLS.compact;
    const fuel = m[11] ? '⚡ Electric' : (m[10] && year >= m[10] ? '🔋 Hybrid' : '⛽ Gasoline');
    return '<button class="btn" style="text-align:left;padding:12px;margin:0" onclick="p62OpenConfig(\'' + brandKey + '\',\'' + m[0] + '_' + m[1] + '\')">' +
      '<div style="display:flex;justify-content:space-between;gap:8px">' +
      '<div style="min-width:0;flex:1">' +
      '<b>' + m[1] + '</b>' +
      '<div class="muted" style="font-size:.75rem;margin-top:2px">' + cls.label + ' · ' + fuel + ' · ' + m[5] + ' mpg</div>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0">' +
      '<div class="mono" style="font-size:.85rem;font-weight:700">' + baseEGP.toLocaleString() + '</div>' +
      '<div class="muted" style="font-size:.68rem">EGP from</div>' +
      '</div>' +
      '</div>' +
      '</button>';
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'p62-brand-modal';
  modal.className = 'p24-modal-backdrop';
  modal.innerHTML = '<div class="p24-modal" style="max-width:480px;max-height:88vh;overflow-y:auto">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="display:flex;align-items:center;gap:10px">' +
    p62BrandBadge(brandKey, 44) +
    '<div><div class="p24-pill">' + brand.origin + ' ' + brand.name + '</div>' +
    '<h2 style="margin-top:6px">' + models.length + ' models available</h2></div>' +
    '</div>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p62-brand-modal\').remove()">✕</button>' +
    '</div>' +
    '<div style="margin-top:14px;display:flex;flex-direction:column;gap:6px">' + list + '</div>' +
    '</div>';
  document.body.appendChild(modal);
}
window.p62OpenBrand = p62OpenBrand;

function p62OpenConfig(brandKey, modelId) {
  p62ResetCfg(brandKey, modelId);
  const model = p62ModelById(modelId);
  if (!model) return hint('Model not found.');
  p62RenderConfigModal();
}
window.p62OpenConfig = p62OpenConfig;

function p62RenderConfigModal() {
  p62Init();
  const cfg = S.p62.carCfg;
  const model = p62ModelById(cfg.modelId);
  if (!model) return;
  const brand = P62_BRANDS[model[0]];
  const price = p62CfgPrice();
  const rate = p62Rate();
  const year = gameYear();

  /* Trim buttons */
  const trimBtns = P62_TRIMS.map(function (t, i) {
    return '<button class="btn ' + (cfg.trim === i ? 'sel' : '') + '" style="margin:0;padding:8px;font-size:.75rem" onclick="p62CfgSet(\'trim\',' + i + ')">' +
      '<b>' + t.label + '</b><small>' + t.desc + '</small></button>';
  }).join('');

  /* Colors */
  const colorBtns = P62_COLORS.map(function (c, i) {
    const colors = ['#ffffff', '#16161a', '#b9bcc4', '#6b6f7a', '#c8202f', '#2457c5', '#2f7d4f', '#e8731a', '#fbfaf3', '#2a2a2e'];
    return '<button title="' + c[0] + '" onclick="p62CfgSet(\'color\',' + i + ')" style="width:32px;height:32px;border-radius:50%;background:' + colors[i] + ';border:3px solid ' + (cfg.color === i ? 'var(--violet)' : 'var(--line)') + ';cursor:pointer"></button>';
  }).join('');

  /* Interiors */
  const intBtns = P62_INTERIORS.map(function (i, idx) {
    return '<button class="btn ' + (cfg.interior === idx ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.72rem" onclick="p62CfgSet(\'interior\',' + idx + ')">' +
      i.label + (i.usd ? ' · +' + Math.round(i.usd * 52.7 * p62Idx()).toLocaleString() : '') + '</button>';
  }).join('');

  /* Options */
  const optsHtml = P62_OPTIONS.filter(function (o) {
    if (o[5] && year < o[5]) return false;
    if (o[6] && year > o[6]) return false;
    return true;
  }).map(function (o) {
    const on = (cfg.opts || []).indexOf(o[0]) >= 0;
    return '<label class="muted" style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--line);border-radius:6px;font-size:.82rem;cursor:pointer;margin-top:4px">' +
      '<input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="p62CfgSet(\'opt\',\'' + o[0] + '\')">' +
      '<span style="flex:1">' + o[1] + '</span>' +
      '<b class="mono" style="font-size:.8rem">+' + Math.round(o[2] * 52.7 * p62Idx()).toLocaleString() + '</b>' +
      '</label>';
  }).join('');

  /* Insurance options */
  const insBtns = Object.keys(P62_INSURANCE).map(function (k) {
    const ins = P62_INSURANCE[k];
    return '<button class="btn ' + (cfg.insurance === k ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.72rem" onclick="p62CfgSet(\'insurance\',\'' + k + '\')">' +
      ins.label + '</button>';
  }).join('');

  /* Payment */
  const canCash = S.wealth >= price.total;
  const canLoan = p62HasLicense() && (S.job || S.remote || S.remoteJob);

  const html = '<div class="p24-modal" style="max-width:520px;max-height:88vh;overflow-y:auto">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="display:flex;align-items:center;gap:10px">' + p62BrandBadge(model[0], 40) +
    '<div><div class="p24-pill">Configure</div>' +
    '<h2 style="margin-top:6px">' + year + ' ' + brand.name + ' ' + model[1] + '</h2></div></div>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p62-cfg-modal\').remove()">✕</button>' +
    '</div>' +

    '<h4 style="margin-top:14px;font-size:.85rem">Trim</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">' + trimBtns + '</div>' +

    '<h4 style="margin-top:14px;font-size:.85rem">Paint colour</h4>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">' + colorBtns + '</div>' +

    '<h4 style="margin-top:14px;font-size:.85rem">Interior</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">' + intBtns + '</div>' +

    '<h4 style="margin-top:14px;font-size:.85rem">Options</h4>' + optsHtml +

    '<h4 style="margin-top:14px;font-size:.85rem">Insurance</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">' + insBtns + '</div>' +

    '<div style="margin-top:16px;padding:12px;background:rgba(255,255,255,.03);border-radius:10px">' +
    '<div class="row"><span>Base price</span><b class="mono">' + Math.round(price.car * rate).toLocaleString() + ' EGP</b></div>' +
    (price.options > 0 ? '<div class="row"><span>Options</span><b class="mono">+' + Math.round(price.options * rate).toLocaleString() + ' EGP</b></div>' : '') +
    '<div class="row"><span>Registration & tax</span><b class="mono">+' + Math.round(price.registration * rate).toLocaleString() + ' EGP</b></div>' +
    '<div class="row"><span>Insurance (' + (P62_INSURANCE[cfg.insurance] || P62_INSURANCE.compreh).label + ')</span><b class="mono">+' + Math.round(price.insurance * rate).toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>On the road</b></span><b class="mono" style="color:var(--mint)">' + Math.round(price.total * rate).toLocaleString() + ' EGP</b></div>' +
    '</div>' +

    '<div style="margin-top:14px;display:flex;flex-direction:column;gap:6px">' +
    '<button class="btn" ' + (canCash ? '' : 'disabled') + ' onclick="p62PurchaseCar(\'cash\')">' +
    (canCash ? '💵 Pay cash · ' + Math.round(price.total * rate).toLocaleString() + ' EGP' : 'Not enough cash') +
    '</button>' +
    '<button class="btn" ' + (canLoan ? '' : 'disabled') + ' onclick="p62PurchaseCar(\'loan5\')">🏦 Loan 5 years · 15% down<small>Bank approval required</small></button>' +
    '<button class="btn" ' + (canLoan ? '' : 'disabled') + ' onclick="p62PurchaseCar(\'loan7\')">🏦 Loan 7 years · 10% down<small>Bank approval required</small></button>' +
    '</div>' +
    '</div>';

  let modal = document.getElementById('p62-cfg-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'p62-cfg-modal';
    modal.className = 'p24-modal-backdrop';
    document.body.appendChild(modal);
  }
  modal.innerHTML = html;
}
window.p62RenderConfigModal = p62RenderConfigModal;

/* Update modal on any cfg change via p62CfgSet → render() → we watch for cfg changes */
const P62_renderBeforeCfgRefresh = render;
render = function () {
  const r = P62_renderBeforeCfgRefresh.apply(this, arguments);
  if (S && S.p62 && S.p62.carCfg && S.p62.carCfg.modelId && document.getElementById('p62-cfg-modal')) {
    p62RenderConfigModal();
  }
  if (S && S.p62 && S.p62.pendingOffers && S.p62.pendingOffers.length > 0 && !document.getElementById('p62-offer-modal')) {
    setTimeout(p62ShowPendingOffer, 300);
  }
  return r;
};

/* ============ 15. GARAGE TAB ============ */
function p62BuildGarageTab() {
  const cars = S.cars || [];
  if (!cars.length) {
    return '<section class="card" style="text-align:center;padding:32px 16px">' +
      '<div style="font-size:3rem;opacity:.4">🅿️</div>' +
      '<h3 style="margin-top:12px">Your garage is empty</h3>' +
      '<p class="muted">Browse the New or Used tabs to buy your first car.</p>' +
      '</section>';
  }
  const rate = p62Rate();
  const year = gameYear();

  return cars.map(function (car) {
    const cls = P62_CLS[car.cls] || P62_CLS.compact;
    const value = Math.round((Number(car.value) || Number(car.msrp) * p62Depreciation(car.age || 0)) * rate);
    const cond = Math.round(car.cond || 100);
    const condColor = cond < 40 ? 'var(--rose)' : cond < 65 ? 'var(--amber)' : 'var(--mint)';
    const fuel = car.fuel === 'e' ? '⚡' : car.fuel === 'h' ? '🔋' : '⛽';
    const insLabel = (P62_INSURANCE[car.insurance] || P62_INSURANCE.compreh).label;

    return '<section class="card" style="padding:14px;border-left:3px solid ' + condColor + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
      '<div style="min-width:0;flex:1">' +
      '<div style="display:flex;align-items:center;gap:8px">' + p62BrandBadge(car.brand || 'toyota', 32) +
      '<div><b>' + car.year + ' ' + car.make + ' ' + car.name + '</b>' +
      '<div class="muted" style="font-size:.75rem">' + P62_TRIMS[car.trim || 0].label + ' · ' + fuel + ' · ' + (car.miles || 0).toLocaleString() + ' km</div></div>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0">' +
      '<div class="mono" style="font-size:.9rem;font-weight:700">' + Math.round(value / 1000) + 'k EGP</div>' +
      '<div class="muted" style="font-size:.7rem">market value</div>' +
      '</div>' +
      '</div>' +

      '<div style="margin-top:10px;height:4px;background:var(--line);border-radius:2px;overflow:hidden">' +
      '<div style="height:100%;width:' + cond + '%;background:' + condColor + '"></div></div>' +

      (car.broken ? '<div style="margin-top:10px;padding:8px;background:rgba(251,113,133,.1);border-left:3px solid var(--rose);border-radius:6px"><b style="font-size:.82rem;color:var(--rose)">🔧 Broken down</b><div class="muted" style="font-size:.78rem">Repair cost: ' + Math.round((car.fix || 0) * rate).toLocaleString() + ' EGP</div></div>' : '') +

      '<div class="row" style="margin-top:8px"><span>Insurance (' + insLabel + ')</span><b>' + (car.insuranceExpiry || year) + '</b></div>' +
      '<div class="row"><span>Registration</span><b>' + (car.registrationExpiry || year) + '</b></div>' +

      '<div class="acts" style="margin-top:10px">' +
      (car.broken ? '<button class="btn" onclick="p62RepairCar(\'' + car.uid + '\')">🔧 Repair · ' + Math.round((car.fix || 0) * rate).toLocaleString() + ' EGP</button>' : '') +
      '<button class="btn" onclick="p62RenewInsurance(\'' + car.uid + '\')">🛡 Renew insurance</button>' +
      '<button class="btn" onclick="p62ChangeInsurance(\'' + car.uid + '\',\'tp\')">Third-party</button>' +
      '<button class="btn" onclick="p62ChangeInsurance(\'' + car.uid + '\',\'compreh\')">Comprehensive</button>' +
      '</div>' +
      '</section>';
  }).join('');
}

/* ============ 16. USED + RENT TABS (stubs, wire to base if present) ============ */
function p62BuildUsedTab() {
  if (typeof genLot !== 'function' || typeof viewUsedCars !== 'function') {
    return '<section class="card"><p class="muted">Used-car market not available.</p></section>';
  }
  if (!S.lot || !S.lot.length) S.lot = genLot();
  return '<section class="card">' + viewUsedCars() + '</section>';
}

function p62BuildRentTab() {
  if (typeof viewRent === 'function') return '<section class="card">' + viewRent() + '</section>';
  return '<section class="card"><p class="muted">Rental not available.</p></section>';
}

/* ============ 17. MAIN viewCars REPLACEMENT ============ */
const P62_viewCarsBefore = (typeof viewCars === 'function') ? viewCars : null;
viewCars = function () {
  if (!S) return P62_viewCarsBefore ? P62_viewCarsBefore() : '';
  p62Init();
  if (S.age < 18) return '<section class="card"><h3>Vehicles</h3><p class="muted">You need to be 18 to get a driving licence. Until then, ask your parents for rides.</p></section>';

  let html = p62BuildCarsHeader();
  const sub = S.p62.subTab || 'new';
  if (sub === 'new') html += p62BuildNewTab();
  else if (sub === 'used') html += p62BuildUsedTab();
  else if (sub === 'rent') html += p62BuildRentTab();
  else if (sub === 'garage') html += p62BuildGarageTab();
  else if (sub === 'license') html += p62BuildLicenseTab();

  return html;
};

/* ============ 18. HOOKS ============ */
/* Yearly: depreciation, insurance, registration, breakdowns, parent offer, car-need */
const P62_ageUpBefore = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  P62_ageUpBefore.apply(this, arguments);
  if (!S) return;
  if (S.age === ageBefore) return;

  try { p62YearlyCars(); } catch (e) { console.error('p62 yearly cars failed:', e); }
  try { p62ParentCarOffer(); } catch (e) { console.error('p62 parent offer failed:', e); }
  try { p62CheckCarNeed(); } catch (e) { console.error('p62 car need failed:', e); }

  /* Licence expiry check */
  if (S.p62 && S.p62.hasLicense && S.p62.licenseExpiresYear < gameYear()) {
    log('⚠️ Your driving licence expired. Renew it before driving.');
  }
};

/* Init */
p62Init(S);
