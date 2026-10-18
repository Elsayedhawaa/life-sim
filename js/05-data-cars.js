/* ============================================================
   WORLD LIFE — DATA: CARS
   ============================================================
   Pure data. No logic, no functions.

   TO ADD A BRAND: add an entry to CAR_BRANDS.
   TO ADD A MODEL: add an array row to CAR_MODELS.
   TO ADD AN OPTION: add an entry to CAR_OPTIONS.

   MODEL ROW FIELDS (index):
   [0] brand · [1] model · [2] class · [3] body · [4] priceUSD
   [5] mpg · [6] hp · [7] seats · [8] reliability(0-10)
   [9] transmission · [10] drivetrain · [11] hap(0-10) · [12] soc(0-10)
   [13] lifeYears · [14] fromYear · [15] toYear · [16] hybridFrom · [17] electric
   [18] markets

   MARKET CODES:
   'G'  = global (egy, usa, sau, uae, uk, can, deu, tur, ind, bra)
   'M'  = middle east (egy, sau, uae, tur)
   'W'  = west (usa, uk, can, deu)
   'ME' = middle east + India
   'WM' = west + middle east
   'E'  = Egypt only
   'AS' = Asia specific (ind, tur, etc.)
   ============================================================ */

const CAR_BRANDS = {
  /* ---------- TIER 1 · BUDGET ---------- */
  toyota:     { name: 'Toyota',        origin: 'JP', tier: 1, reliability: 10, logo: 'T', color: '#E60012' },
  hyundai:    { name: 'Hyundai',       origin: 'KR', tier: 1, reliability: 8,  logo: 'H', color: '#003B7E' },
  kia:        { name: 'Kia',           origin: 'KR', tier: 1, reliability: 8,  logo: 'K', color: '#05141F' },
  nissan:     { name: 'Nissan',        origin: 'JP', tier: 1, reliability: 8,  logo: 'N', color: '#C3002F' },
  honda:      { name: 'Honda',         origin: 'JP', tier: 1, reliability: 10, logo: 'H', color: '#E40521' },
  suzuki:     { name: 'Suzuki',        origin: 'JP', tier: 1, reliability: 8,  logo: 'S', color: '#003399' },
  chevrolet:  { name: 'Chevrolet',     origin: 'US', tier: 1, reliability: 7,  logo: 'C', color: '#D1A955' },
  fiat:       { name: 'Fiat',          origin: 'IT', tier: 1, reliability: 6,  logo: 'F', color: '#B30014' },
  renault:    { name: 'Renault',       origin: 'FR', tier: 1, reliability: 7,  logo: 'R', color: '#FFCC00' },
  dacia:      { name: 'Dacia',         origin: 'RO', tier: 1, reliability: 6,  logo: 'D', color: '#2B2D42' },
  mg:         { name: 'MG',            origin: 'CN', tier: 1, reliability: 6,  logo: 'MG', color: '#D50000' },
  proton:     { name: 'Proton',        origin: 'MY', tier: 1, reliability: 6,  logo: 'P', color: '#1A1A2E' },
  tata:       { name: 'Tata',          origin: 'IN', tier: 1, reliability: 6,  logo: 'T', color: '#0033A0' },
  mahindra:   { name: 'Mahindra',      origin: 'IN', tier: 1, reliability: 7,  logo: 'M', color: '#E31837' },
  lada:       { name: 'Lada',          origin: 'RU', tier: 1, reliability: 4,  logo: 'L', color: '#0054A6' },

  /* ---------- TIER 2 · MID ---------- */
  mitsubishi: { name: 'Mitsubishi',    origin: 'JP', tier: 2, reliability: 8, logo: 'M', color: '#E60012' },
  peugeot:    { name: 'Peugeot',       origin: 'FR', tier: 2, reliability: 6, logo: 'P', color: '#0068A5' },
  citroen:    { name: 'Citroën',       origin: 'FR', tier: 2, reliability: 6, logo: 'C', color: '#C8102E' },
  skoda:      { name: 'Škoda',         origin: 'CZ', tier: 2, reliability: 8, logo: 'Š', color: '#4BA82E' },
  volkswagen: { name: 'Volkswagen',    origin: 'DE', tier: 2, reliability: 7, logo: 'VW', color: '#001E50' },
  seat:       { name: 'SEAT',          origin: 'ES', tier: 2, reliability: 7, logo: 'S', color: '#E30613' },
  opel:       { name: 'Opel',          origin: 'DE', tier: 2, reliability: 6, logo: 'O', color: '#FFC800' },
  ford:       { name: 'Ford',          origin: 'US', tier: 2, reliability: 7, logo: 'F', color: '#003478' },
  jeep:       { name: 'Jeep',          origin: 'US', tier: 2, reliability: 6, logo: 'J', color: '#3D5C34' },
  mazda:      { name: 'Mazda',         origin: 'JP', tier: 2, reliability: 9, logo: 'M', color: '#910A2D' },
  subaru:     { name: 'Subaru',        origin: 'JP', tier: 2, reliability: 9, logo: 'S', color: '#00399A' },
  byd:        { name: 'BYD',           origin: 'CN', tier: 2, reliability: 6, logo: 'B', color: '#3E7BCB' },
  chery:      { name: 'Chery',         origin: 'CN', tier: 2, reliability: 6, logo: 'C', color: '#C8102E' },
  haval:      { name: 'Haval',         origin: 'CN', tier: 2, reliability: 6, logo: 'H', color: '#A81616' },
  geely:      { name: 'Geely',         origin: 'CN', tier: 2, reliability: 6, logo: 'G', color: '#1E3A8A' },
  changan:    { name: 'Changan',       origin: 'CN', tier: 2, reliability: 6, logo: 'C', color: '#003D79' },
  exeed:      { name: 'Exeed',         origin: 'CN', tier: 2, reliability: 6, logo: 'E', color: '#1E1E1E' },
  jetour:     { name: 'Jetour',        origin: 'CN', tier: 2, reliability: 6, logo: 'J', color: '#1B2A54' },
  lynkco:     { name: 'Lynk & Co',     origin: 'CN', tier: 2, reliability: 6, logo: 'L', color: '#003354' },
  dodge:      { name: 'Dodge',         origin: 'US', tier: 2, reliability: 6, logo: 'D', color: '#A6192E' },
  ram:        { name: 'Ram',           origin: 'US', tier: 2, reliability: 7, logo: 'R', color: '#B8232F' },
  gmc:        { name: 'GMC',           origin: 'US', tier: 2, reliability: 7, logo: 'G', color: '#C8102E' },
  isuzu:      { name: 'Isuzu',         origin: 'JP', tier: 2, reliability: 9, logo: 'I', color: '#B01C2F' },
  cupra:      { name: 'Cupra',         origin: 'ES', tier: 2, reliability: 7, logo: 'C', color: '#8F908A' },
  smart:      { name: 'Smart',         origin: 'DE', tier: 2, reliability: 6, logo: 'S', color: '#FFCC00' },
  vinfast:    { name: 'VinFast',       origin: 'VN', tier: 2, reliability: 5, logo: 'V', color: '#000000' },
  gwm:        { name: 'GWM',           origin: 'CN', tier: 2, reliability: 6, logo: 'G', color: '#000000' },

  /* ---------- TIER 3 · PREMIUM ---------- */
  bmw:        { name: 'BMW',           origin: 'DE', tier: 3, reliability: 7, logo: 'B', color: '#0166B1' },
  mercedes:   { name: 'Mercedes-Benz', origin: 'DE', tier: 3, reliability: 7, logo: '★', color: '#000000' },
  audi:       { name: 'Audi',          origin: 'DE', tier: 3, reliability: 7, logo: 'A', color: '#BB0A30' },
  volvo:      { name: 'Volvo',         origin: 'SE', tier: 3, reliability: 8, logo: 'V', color: '#003057' },
  lexus:      { name: 'Lexus',         origin: 'JP', tier: 3, reliability: 10, logo: 'L', color: '#1A1A1A' },
  landrover:  { name: 'Land Rover',    origin: 'UK', tier: 3, reliability: 5, logo: 'LR', color: '#005A2B' },
  jaguar:     { name: 'Jaguar',        origin: 'UK', tier: 3, reliability: 5, logo: 'J', color: '#9A1B2F' },
  mini:       { name: 'MINI',          origin: 'UK', tier: 3, reliability: 6, logo: 'M', color: '#000000' },
  genesis:    { name: 'Genesis',       origin: 'KR', tier: 3, reliability: 8, logo: 'G', color: '#1F1F1F' },
  alfaromeo:  { name: 'Alfa Romeo',    origin: 'IT', tier: 3, reliability: 5, logo: 'A', color: '#004B87' },
  cadillac:   { name: 'Cadillac',      origin: 'US', tier: 3, reliability: 7, logo: 'C', color: '#2D2926' },
  lincoln:    { name: 'Lincoln',       origin: 'US', tier: 3, reliability: 7, logo: 'L', color: '#1B1B1B' },
  infiniti:   { name: 'Infiniti',      origin: 'JP', tier: 3, reliability: 8, logo: 'I', color: '#1A1A1A' },
  acura:      { name: 'Acura',         origin: 'JP', tier: 3, reliability: 9, logo: 'A', color: '#1D252C' },
  polestar:   { name: 'Polestar',      origin: 'SE', tier: 3, reliability: 7, logo: 'P', color: '#101010' },
  nio:        { name: 'NIO',           origin: 'CN', tier: 3, reliability: 6, logo: 'N', color: '#00B4D8' },
  zeekr:      { name: 'Zeekr',         origin: 'CN', tier: 3, reliability: 7, logo: 'Z', color: '#F25220' },
  xpeng:      { name: 'XPeng',         origin: 'CN', tier: 3, reliability: 6, logo: 'X', color: '#00B4D8' },

  /* ---------- TIER 4 · LUXURY/PERFORMANCE ---------- */
  porsche:    { name: 'Porsche',       origin: 'DE', tier: 4, reliability: 7, logo: 'P', color: '#B12B28' },
  tesla:      { name: 'Tesla',         origin: 'US', tier: 4, reliability: 7, logo: 'T', color: '#E82127' },
  maserati:   { name: 'Maserati',      origin: 'IT', tier: 4, reliability: 4, logo: 'M', color: '#0C2340' },
  rivian:     { name: 'Rivian',        origin: 'US', tier: 4, reliability: 5, logo: 'R', color: '#0F2C39' },
  lucid:      { name: 'Lucid',         origin: 'US', tier: 4, reliability: 5, logo: 'L', color: '#1E3A5F' },
  lotus:      { name: 'Lotus',         origin: 'UK', tier: 4, reliability: 5, logo: 'LT', color: '#FFB81C' },
  alpine:     { name: 'Alpine',        origin: 'FR', tier: 4, reliability: 6, logo: 'A', color: '#00529F' },

  /* ---------- TIER 5 · EXOTIC ---------- */
  bentley:    { name: 'Bentley',       origin: 'UK', tier: 5, reliability: 5, logo: 'B', color: '#1E1E1E' },
  rollsroyce: { name: 'Rolls-Royce',   origin: 'UK', tier: 5, reliability: 6, logo: 'RR', color: '#6A1B1B' },
  ferrari:    { name: 'Ferrari',       origin: 'IT', tier: 5, reliability: 5, logo: 'F', color: '#E31C23' },
  lamborghini:{ name: 'Lamborghini',   origin: 'IT', tier: 5, reliability: 4, logo: 'L', color: '#D4A900' },
  astonmartin:{ name: 'Aston Martin',  origin: 'UK', tier: 5, reliability: 4, logo: 'AM', color: '#005D55' },
  mclaren:    { name: 'McLaren',       origin: 'UK', tier: 5, reliability: 4, logo: 'M', color: '#FF6C00' },
  bugatti:    { name: 'Bugatti',       origin: 'FR', tier: 5, reliability: 4, logo: 'B', color: '#0B3D91' },
  pagani:     { name: 'Pagani',        origin: 'IT', tier: 5, reliability: 4, logo: 'P', color: '#000000' },
  koenigsegg: { name: 'Koenigsegg',    origin: 'SE', tier: 5, reliability: 5, logo: 'K', color: '#FFD700' },
  rimac:      { name: 'Rimac',         origin: 'HR', tier: 5, reliability: 5, logo: 'R', color: '#00AEEF' }
};

const CAR_CLASSES = {
  econ:    { label: 'Economy',    maintenance: 450,  insurance: 0.030 },
  compact: { label: 'Compact',    maintenance: 500,  insurance: 0.032 },
  mid:     { label: 'Mid-size',   maintenance: 600,  insurance: 0.035 },
  suv:     { label: 'SUV',        maintenance: 750,  insurance: 0.038 },
  van:     { label: 'Van',        maintenance: 700,  insurance: 0.037 },
  minivan: { label: 'Minivan',    maintenance: 650,  insurance: 0.036 },
  truck:   { label: 'Pickup',     maintenance: 800,  insurance: 0.040 },
  lux:     { label: 'Luxury',     maintenance: 1400, insurance: 0.048 },
  sport:   { label: 'Sports',     maintenance: 1500, insurance: 0.055 },
  exec:    { label: 'Executive',  maintenance: 3000, insurance: 0.062 },
  hyper:   { label: 'Hypercar',   maintenance: 15000, insurance: 0.085 }
};

const CAR_TRIMS = [
  { id: 'base',      label: 'Base',      mult: 1.00, hap: 0, soc: 0, desc: 'Standard equipment' },
  { id: 'comfort',   label: 'Comfort',   mult: 1.15, hap: 1, soc: 1, desc: 'Better seats, upgraded audio, more safety' },
  { id: 'sport',     label: 'Sport',     mult: 1.28, hap: 1, soc: 2, desc: 'Sport styling, stiffer suspension, larger wheels' },
  { id: 'premium',   label: 'Premium',   mult: 1.45, hap: 2, soc: 2, desc: 'Full luxury package: leather, tech, refinement' },
  { id: 'luxury',    label: 'Luxury',    mult: 1.60, hap: 3, soc: 3, desc: 'Top-tier materials, massage seats, max tech' },
  { id: 'offroad',   label: 'Off-Road',  mult: 1.35, hap: 2, soc: 1, desc: 'Skid plates, AT tires, locking diffs, lift' },
  { id: 'track',     label: 'Track',     mult: 1.70, hap: 4, soc: 4, desc: 'Carbon ceramics, bucket seats, aero kit, no back seats' },
  { id: 'signature', label: 'Signature', mult: 2.00, hap: 5, soc: 5, desc: 'Bespoke customization, serialized plaque, VIP treatment' },
  { id: 'black_ed',  label: 'Black Ed.', mult: 1.25, hap: 1, soc: 2, desc: 'Murdered out styling, black badging, tinted windows' }
];

const CAR_COLORS = [
  { id: 'white',        label: 'White',              hex: '#ffffff', costUSD: 0 },
  { id: 'black',        label: 'Black',              hex: '#16161a', costUSD: 0 },
  { id: 'silver',       label: 'Silver',             hex: '#b9bcc4', costUSD: 550 },
  { id: 'grey',         label: 'Grey',               hex: '#6b6f7a', costUSD: 550 },
  { id: 'red',          label: 'Red',                hex: '#c8202f', costUSD: 900 },
  { id: 'blue',         label: 'Blue',               hex: '#2457c5', costUSD: 900 },
  { id: 'green',        label: 'Green',              hex: '#2f7d4f', costUSD: 900 },
  { id: 'orange',       label: 'Orange',             hex: '#e8731a', costUSD: 900 },
  { id: 'pearl_white',  label: 'Pearl White',        hex: '#fbfaf3', costUSD: 1500 },
  { id: 'matte_black',  label: 'Matte Black',        hex: '#2a2a2e', costUSD: 3000 },
  { id: 'nardo_grey',   label: 'Nardo Grey',         hex: '#8A8D8F', costUSD: 2500 },
  { id: 'british_green',label: 'British Racing Gr.', hex: '#004225', costUSD: 2000 },
  { id: 'mid_purple',   label: 'Midnight Purple',    hex: '#2a0033', costUSD: 4000 },
  { id: 'miami_blue',   label: 'Miami Blue',         hex: '#007A99', costUSD: 3500 },
  { id: 'matte_white',  label: 'Matte White',        hex: '#E8E9EB', costUSD: 3000 },
  { id: 'bronze',       label: 'Bronze Metallic',    hex: '#8C7853', costUSD: 1800 },
  { id: 'rose_gold',    label: 'Rose Gold',          hex: '#B76E79', costUSD: 3500 },
  { id: 'rosso',        label: 'Rosso Corsa',        hex: '#B70000', costUSD: 5000, brandOnly: ['ferrari', 'alfaromeo'] },
  { id: 'obsidian',     label: 'Obsidian Black',     hex: '#0A0A0A', costUSD: 1800, brandOnly: ['mercedes'] },
  { id: 'alpine_grey',  label: 'Alpine Grey',        hex: '#7A8B99', costUSD: 1200, brandOnly: ['porsche', 'volvo', 'landrover'] },
  { id: 'yachting',     label: 'Yachting Blue',      hex: '#1E3A8A', costUSD: 2500, brandOnly: ['mercedes', 'rollsroyce'] },
  { id: 'bianco',       label: 'Bianco Avus',        hex: '#F8F8F0', costUSD: 3500, brandOnly: ['ferrari', 'maserati'] },
  { id: 'riviera',      label: 'Riviera Blue',       hex: '#0E7AAB', costUSD: 3500, brandOnly: ['porsche', 'bmw'] },
  { id: 'giallo',       label: 'Giallo Modena',      hex: '#FFD600', costUSD: 4000, brandOnly: ['ferrari', 'lamborghini'] },
  { id: 'verde',        label: 'Verde Mantis',       hex: '#5E9B3D', costUSD: 4500, brandOnly: ['lamborghini'] },
  { id: 'arancia',      label: 'Arancia Borealis',   hex: '#FF6A00', costUSD: 4500, brandOnly: ['mclaren', 'lamborghini'] },
  { id: 'vanta',        label: 'Vantablack',         hex: '#000000', costUSD: 15000, brandOnly: ['rollsroyce', 'bmw'] },
  { id: 'papaya',       label: 'Papaya Orange',      hex: '#FF8700', costUSD: 4000, brandOnly: ['mclaren'] },
  { id: 'chalk',        label: 'Chalk',              hex: '#D1D0CE', costUSD: 3000, brandOnly: ['porsche'] }
];

const CAR_INTERIORS = [
  { id: 'cloth',      label: 'Standard cloth',        costUSD: 0 },
  { id: 'cloth_prem', label: 'Premium cloth',         costUSD: 500 },
  { id: 'leather',    label: 'Standard leather',      costUSD: 2500, hap: 1 },
  { id: 'vegan',      label: 'Vegan leather',         costUSD: 2000, hap: 1 },
  { id: 'leather_red',label: 'Leather, red stitch',   costUSD: 3000, hap: 1, soc: 1 },
  { id: 'alcantara',  label: 'Alcantara sport',       costUSD: 4500, hap: 2, soc: 1 },
  { id: 'carbon_bckt',label: 'Carbon fiber buckets',  costUSD: 6000, hap: 3, soc: 2 },
  { id: 'nappa',      label: 'Nappa leather',         costUSD: 6500, hap: 2, soc: 2 },
  { id: 'merino',     label: 'Merino full leather',   costUSD: 8500, hap: 3, soc: 2 },
  { id: 'semi_anilin',label: 'Semi-aniline leather',  costUSD: 9500, hap: 3, soc: 3 },
  { id: 'wool_blend', label: 'Premium wool blend',    costUSD: 5000, hap: 2, soc: 2 },
  { id: 'bespoke',    label: 'Bespoke, hand-stitched',costUSD: 15000, hap: 5, soc: 4 }
];

const CAR_OPTIONS = [
  /* --- SAFETY --- */
  { id: 'airbag_extra', cat: 'Safety', label: 'Extra airbags (side + curtain)', usd: 800, fromYear: 2007 },
  { id: 'abs',          cat: 'Safety', label: 'ABS + EBD (anti-lock brakes)',   usd: 400, fromYear: 2007 },
  { id: 'esp',          cat: 'Safety', label: 'ESP (electronic stability)',     usd: 700, fromYear: 2010 },
  { id: 'lane_assist',  cat: 'Safety', label: 'Lane-keep assist',               usd: 1200, fromYear: 2015 },
  { id: 'blind_spot',   cat: 'Safety', label: 'Blind-spot monitoring',          usd: 900, fromYear: 2014 },
  { id: 'adas_full',    cat: 'Safety', label: 'Full ADAS (adaptive cruise + AEB)', usd: 2500, fromYear: 2016 },
  { id: 'cam_rear',     cat: 'Safety', label: 'Rear backup camera',             usd: 500, fromYear: 2008 },
  { id: 'cam_360',      cat: 'Safety', label: '360° camera system',             usd: 1200, fromYear: 2016 },
  { id: 'park_sensors', cat: 'Safety', label: 'Parking sensors (front+rear)',   usd: 400, fromYear: 2008 },
  { id: 'night_vis',    cat: 'Safety', label: 'Night vision thermal camera',    usd: 2500, fromYear: 2018 },
  { id: 'rear_cross',   cat: 'Safety', label: 'Rear cross-traffic alert',       usd: 800, fromYear: 2015 },
  { id: 'auto_park',    cat: 'Safety', label: 'Active park assist (self-park)', usd: 1500, fromYear: 2016 },
  { id: 'dashcam_oem',  cat: 'Safety', label: 'Integrated OEM dashcam',         usd: 600, fromYear: 2020 },
  { id: 'safe_exit',    cat: 'Safety', label: 'Safe exit assist (stops doors)', usd: 500, fromYear: 2019 },
  { id: 'driver_mon',   cat: 'Safety', label: 'Driver attention monitor',       usd: 400, fromYear: 2017 },

  /* --- COMFORT --- */
  { id: 'sunroof',      cat: 'Comfort', label: 'Panoramic sunroof',             usd: 1800, fromYear: 2007 },
  { id: 'heat_seats',   cat: 'Comfort', label: 'Heated front seats',            usd: 800, fromYear: 2007 },
  { id: 'cool_seats',   cat: 'Comfort', label: 'Ventilated front seats',        usd: 1200, fromYear: 2012 },
  { id: 'massage',      cat: 'Comfort', label: 'Massaging front seats',         usd: 2200, fromYear: 2015 },
  { id: 'memory_seats', cat: 'Comfort', label: 'Memory seats (driver + mirrors)',usd: 700, fromYear: 2009 },
  { id: 'climate_4zone',cat: 'Comfort', label: '4-zone climate control',        usd: 1600, fromYear: 2013 },
  { id: 'heat_wheel',   cat: 'Comfort', label: 'Heated steering wheel',         usd: 300, fromYear: 2010 },
  { id: 'power_seats',  cat: 'Comfort', label: 'Power-adjustable front seats',  usd: 1000, fromYear: 2007 },
  { id: 'soft_close',   cat: 'Comfort', label: 'Soft-close doors',              usd: 1800, fromYear: 2015 },
  { id: 'cool_cup',     cat: 'Comfort', label: 'Heated/cooled cupholders',      usd: 400, fromYear: 2014 },
  { id: 'starlight',    cat: 'Comfort', label: 'Starlight headliner',           usd: 4000, fromYear: 2015 },
  { id: 'massage_rear', cat: 'Comfort', label: 'Massaging rear executive seats',usd: 3500, fromYear: 2017 },
  { id: 'fragrance',    cat: 'Comfort', label: 'Active fragrance dispenser',    usd: 600, fromYear: 2016 },
  { id: 'anc',          cat: 'Comfort', label: 'Active noise cancellation',     usd: 1200, fromYear: 2018 },
  { id: 'air_purify',   cat: 'Comfort', label: 'HEPA cabin air purifier',       usd: 700, fromYear: 2019 },

  /* --- TECH --- */
  { id: 'audio_prem',   cat: 'Tech',    label: 'Premium audio (Bose / HK)',     usd: 1500, fromYear: 2007 },
  { id: 'audio_lux',    cat: 'Tech',    label: 'Luxury audio (Burmester/B&W)',  usd: 4500, fromYear: 2013 },
  { id: 'carplay',      cat: 'Tech',    label: 'Apple CarPlay / Android Auto',  usd: 400, fromYear: 2014 },
  { id: 'nav',          cat: 'Tech',    label: 'Built-in navigation',           usd: 1200, fromYear: 2007, untilYear: 2018 },
  { id: 'hud',          cat: 'Tech',    label: 'Head-up display',               usd: 1200, fromYear: 2013 },
  { id: 'ar_hud',       cat: 'Tech',    label: 'Augmented Reality HUD',         usd: 2500, fromYear: 2021 },
  { id: 'digital_cock', cat: 'Tech',    label: 'Digital instrument cluster',    usd: 900, fromYear: 2015 },
  { id: 'qi_charge',    cat: 'Tech',    label: 'Wireless phone charging',       usd: 400, fromYear: 2017 },
  { id: 'wifi_hotspot', cat: 'Tech',    label: 'In-car 5G WiFi hotspot',        usd: 500, fromYear: 2016 },
  { id: 'remote_start', cat: 'Tech',    label: 'Remote engine start',           usd: 500, fromYear: 2007 },
  { id: 'keyless',      cat: 'Tech',    label: 'Keyless entry + push start',    usd: 500, fromYear: 2009 },
  { id: 'pass_screen',  cat: 'Tech',    label: 'Passenger-side display screen', usd: 1800, fromYear: 2022 },
  { id: 'gesture',      cat: 'Tech',    label: 'Gesture controls',              usd: 800, fromYear: 2018 },
  { id: 'biometric',    cat: 'Tech',    label: 'Biometric fingerprint start',   usd: 1000, fromYear: 2022 },
  { id: 'digi_mirror',  cat: 'Tech',    label: 'Digital rearview mirror',       usd: 900, fromYear: 2019 },

  /* --- PERFORMANCE --- */
  { id: 'sport_susp',   cat: 'Performance', label: 'Sport suspension',             usd: 1600, fromYear: 2007 },
  { id: 'air_susp',     cat: 'Performance', label: 'Air suspension',               usd: 3200, fromYear: 2012 },
  { id: 'sport_exhaust',cat: 'Performance', label: 'Sport exhaust',                usd: 1400, fromYear: 2007 },
  { id: 'lsd',          cat: 'Performance', label: 'Limited-slip differential',    usd: 1800, fromYear: 2008 },
  { id: 'carbon_trim',  cat: 'Performance', label: 'Carbon-fibre interior trim',   usd: 2200, fromYear: 2010 },
  { id: 'sport_brakes', cat: 'Performance', label: 'Performance brakes (Brembo)',  usd: 2800, fromYear: 2009 },
  { id: 'carbon_brake', cat: 'Performance', label: 'Carbon-ceramic brakes',        usd: 8500, fromYear: 2012 },
  { id: 'launch_ctrl',  cat: 'Performance', label: 'Launch control software',      usd: 1000, fromYear: 2014 },
  { id: 'drift_mode',   cat: 'Performance', label: 'Drift mode functionality',     usd: 1500, fromYear: 2016 },
  { id: 'rear_steer',   cat: 'Performance', label: 'Rear-wheel steering system',   usd: 2500, fromYear: 2017 },
  { id: 'active_aero',  cat: 'Performance', label: 'Active aerodynamics',          usd: 3500, fromYear: 2015 },

  /* --- OFF-ROAD --- */
  { id: 'awd',          cat: 'Off-road', label: 'All-wheel drive',                 usd: 2200, fromYear: 2007 },
  { id: 'lock_diff',    cat: 'Off-road', label: 'Locking differential',            usd: 1800, fromYear: 2007 },
  { id: 'skid_plates',  cat: 'Off-road', label: 'Skid plates / underbody armor',   usd: 900, fromYear: 2008 },
  { id: 'lift_kit',     cat: 'Off-road', label: 'Lift kit (2 inch)',               usd: 1400, fromYear: 2008 },
  { id: 'mud_tyres',    cat: 'Off-road', label: 'All-terrain tyres',               usd: 800, fromYear: 2007 },
  { id: 'winch',        cat: 'Off-road', label: 'Front bumper winch',              usd: 1500, fromYear: 2007 },
  { id: 'snorkel',      cat: 'Off-road', label: 'Air intake snorkel',              usd: 600, fromYear: 2007 },
  { id: 'beadlock',     cat: 'Off-road', label: 'Beadlock-capable wheels',         usd: 1800, fromYear: 2012 },
  { id: 'trail_cam',    cat: 'Off-road', label: 'Trail camera system (underbody)', usd: 1200, fromYear: 2019 },
  { id: 'sway_disc',    cat: 'Off-road', label: 'Electronic sway bar disconnect',  usd: 1600, fromYear: 2010 },

  /* --- TOW --- */
  { id: 'tow_hitch',    cat: 'Tow',      label: 'Tow hitch + wiring',              usd: 900, fromYear: 2007 },
  { id: 'trailer_assist',cat: 'Tow',     label: 'Trailer assist system',           usd: 1400, fromYear: 2016 },
  { id: 'roof_rack',    cat: 'Tow',      label: 'Roof rack / cross bars',          usd: 400, fromYear: 2007 },

  /* --- APPEARANCE & PRACTICALITY --- */
  { id: 'wheels_18',    cat: 'Appearance', label: '18-inch alloy wheels',          usd: 1200, fromYear: 2007 },
  { id: 'wheels_20',    cat: 'Appearance', label: '20-inch alloy wheels',          usd: 2000, fromYear: 2012 },
  { id: 'wheels_22',    cat: 'Appearance', label: '22-inch forged wheels',         usd: 3500, fromYear: 2015 },
  { id: 'blackout',     cat: 'Appearance', label: 'Blackout package (chrome delete)', usd: 1500, fromYear: 2012 },
  { id: 'body_kit',     cat: 'Appearance', label: 'Sport body kit',                usd: 2800, fromYear: 2010 },
  { id: 'spoiler',      cat: 'Appearance', label: 'Rear spoiler',                  usd: 800, fromYear: 2007 },
  { id: 'tint',         cat: 'Appearance', label: 'Window tint (legal 30%)',       usd: 300, fromYear: 2007 },
  { id: 'ambient',      cat: 'Appearance', label: '64-color ambient lighting',     usd: 600, fromYear: 2015 },
  { id: 'carbon_roof',  cat: 'Appearance', label: 'Exposed carbon fiber roof',     usd: 3000, fromYear: 2014 },
  { id: 'laser_lights', cat: 'Appearance', label: 'Laser or Matrix LED headlights',usd: 2500, fromYear: 2016 },
  { id: 'illum_grille', cat: 'Appearance', label: 'Illuminated front grille',      usd: 500, fromYear: 2020 },
  { id: 'fridge',       cat: 'Practical',  label: 'Center console refrigerator',   usd: 800, fromYear: 2010 },
  { id: 'all_weather',  cat: 'Practical',  label: 'All-weather rubber floor mats', usd: 200, fromYear: 2007 },

  /* --- EV-SPECIFIC --- */
  { id: 'home_charger', cat: 'EV',       label: 'Home wall charger (7kW/11kW)',    usd: 1800, fromYear: 2014 },
  { id: 'fast_charge',  cat: 'EV',       label: 'DC fast-charge capability',       usd: 1200, fromYear: 2015 },
  { id: 'heat_pump',    cat: 'EV',       label: 'Heat pump (cold-weather range)',  usd: 900, fromYear: 2018 },
  { id: 'v2l',          cat: 'EV',       label: 'Vehicle-to-Load (V2L) adapter',   usd: 500, fromYear: 2021 },
  { id: 'solar_roof',   cat: 'EV',       label: 'Solar roof panel charging',       usd: 2500, fromYear: 2020 },
  { id: 'dual_motor',   cat: 'EV',       label: 'Dual Motor AWD Upgrade',          usd: 6000, fromYear: 2015 },
  { id: 'tri_motor',    cat: 'EV',       label: 'Tri/Quad Motor Track Upgrade',    usd: 15000, fromYear: 2021 }
];

const CAR_INSURANCE = {
  none:        { label: 'No insurance',                      mult: 0,     illegal: true },
  tp:          { label: 'Third-party (mandatory)',           mult: 0.030, desc: 'Covers damage to others only' },
  tp_fire:     { label: 'Third-party + fire & theft',        mult: 0.038, desc: 'Common in Egypt' },
  compreh:     { label: 'Comprehensive',                     mult: 0.055, desc: 'Covers you and others' },
  compreh_pl:  { label: 'Comprehensive + add-ons',           mult: 0.065, desc: 'Full coverage + add-ons' }
};

const CAR_INSURANCE_ADDONS = [
  { id: 'roadside',   label: 'Roadside assistance',     annualUSD: 200 },
  { id: 'courtesy',   label: 'Courtesy car',            annualUSD: 350 },
  { id: 'tyre',       label: 'Tyre & wheel cover',      annualUSD: 180 },
  { id: 'key',        label: 'Key replacement',         annualUSD: 150 },
  { id: 'personal',   label: 'Personal accident',       annualUSD: 400 },
  { id: 'legal',      label: 'Legal defence',           annualUSD: 250 },
  { id: 'zero_dep',   label: 'Zero depreciation',       annualUSD: 500 },
  { id: 'gap',        label: 'GAP insurance',           annualUSD: 600 },
  { id: 'windshield', label: 'Windshield cover',        annualUSD: 120 },
  { id: 'engine_pro', label: 'Engine protection',       annualUSD: 300 },
  { id: 'rti',        label: 'Return to Invoice (RTI)', annualUSD: 450 },
  { id: 'belongings', label: 'Personal belongings',     annualUSD: 100 }
];

const CAR_LICENCE = {
  egy: { costs: { B: 2800, A: 3200, C: 6500, D: 8000, taxi: 4500, intl: 1200 }, passBase: 0.55, ageMin: { B: 18, A: 18, C: 21, D: 21, taxi: 21, intl: 18 } },
  usa: { costs: { B: 350,  A: 400,  C: 800,  D: 950,  taxi: 600,  intl: 50 },   passBase: 0.65, ageMin: { B: 16, A: 16, C: 18, D: 18, taxi: 18, intl: 18 } },
  sau: { costs: { B: 1200, A: 1400, C: 2800, D: 3500, taxi: 2000, intl: 500 },  passBase: 0.55, ageMin: { B: 18, A: 18, C: 21, D: 21, taxi: 21, intl: 18 } },
  uae: { costs: { B: 3500, A: 4200, C: 7000, D: 9000, taxi: 5500, intl: 800 },  passBase: 0.60, ageMin: { B: 18, A: 18, C: 21, D: 21, taxi: 21, intl: 18 } },
  uk:  { costs: { B: 300,  A: 350,  C: 700,  D: 850,  taxi: 500,  intl: 60 },   passBase: 0.65, ageMin: { B: 17, A: 17, C: 18, D: 18, taxi: 18, intl: 18 } },
  can: { costs: { B: 300,  A: 350,  C: 750,  D: 900,  taxi: 550,  intl: 50 },   passBase: 0.60, ageMin: { B: 16, A: 16, C: 18, D: 18, taxi: 18, intl: 18 } },
  deu: { costs: { B: 1800, A: 1500, C: 2500, D: 3500, taxi: 2200, intl: 80 },   passBase: 0.40, ageMin: { B: 18, A: 18, C: 21, D: 21, taxi: 21, intl: 18 } },
  ind: { costs: { B: 100,  A: 80,   C: 250,  D: 300,  taxi: 200,  intl: 40 },   passBase: 0.80, ageMin: { B: 18, A: 18, C: 20, D: 20, taxi: 20, intl: 18 } },
  bra: { costs: { B: 450,  A: 400,  C: 900,  D: 1100, taxi: 800,  intl: 100 },  passBase: 0.50, ageMin: { B: 18, A: 18, C: 21, D: 21, taxi: 21, intl: 18 } },
  tur: { costs: { B: 600,  A: 550,  C: 1200, D: 1500, taxi: 900,  intl: 150 },  passBase: 0.60, ageMin: { B: 18, A: 18, C: 21, D: 21, taxi: 21, intl: 18 } }
};

const CAR_FUEL_PRICES = {
  egy: { petrol: 15.25, diesel: 13.50, electricity: 2.20 },
  usa: { petrol: 3.30,  diesel: 4.10,  electricity: 0.14 },
  sau: { petrol: 2.18,  diesel: 1.05,  electricity: 0.30 },
  uae: { petrol: 3.05,  diesel: 3.65,  electricity: 0.40 },
  uk:  { petrol: 6.20,  diesel: 6.40,  electricity: 0.30 },
  can: { petrol: 4.50,  diesel: 4.80,  electricity: 0.12 },
  deu: { petrol: 6.80,  diesel: 6.50,  electricity: 0.35 },
  ind: { petrol: 1.25,  diesel: 1.10,  electricity: 0.08 },
  bra: { petrol: 1.10,  diesel: 1.05,  electricity: 0.15 },
  tur: { petrol: 1.30,  diesel: 1.25,  electricity: 0.10 }
};

const CAR_MODS = [
  { id: 'ecu_tune',       label: 'ECU tune (+HP)',             usd: 900,  hap: 1, soc: 1, hpGain: 15 },
  { id: 'intake',         label: 'Cold-air intake',            usd: 400,  hap: 1, hpGain: 5 },
  { id: 'exhaust_after',  label: 'Aftermarket exhaust',        usd: 1200, hap: 2, soc: 2, hpGain: 8 },
  { id: 'susp_coilover',  label: 'Coilover suspension',        usd: 1800, hap: 1, soc: 1 },
  { id: 'brake_big',      label: 'Big brake kit',              usd: 2500, hap: 1, soc: 1 },
  { id: 'wrap',           label: 'Custom vinyl wrap',          usd: 2000, hap: 3, soc: 2 },
  { id: 'tint_premium',   label: 'Premium ceramic tint',       usd: 500,  hap: 1, soc: 1 },
  { id: 'audio_after',    label: 'Aftermarket audio system',   usd: 3000, hap: 3, soc: 2 },
  { id: 'gps_tracker',    label: 'GPS tracker',                usd: 250,  hap: 1 },
  { id: 'dashcam',        label: 'Dashcam (front + rear)',     usd: 350,  hap: 1 },
  { id: 'seat_custom',    label: 'Custom upholstery',          usd: 1500, hap: 2, soc: 1 },
  { id: 'wheel_custom',   label: 'Custom forged wheels',       usd: 4500, hap: 3, soc: 3 },
  { id: 'roof_rack_off',  label: 'Off-road roof rack + LEDs',  usd: 1200, hap: 2 },
  { id: 'lift_after',     label: 'Lift kit (off-road)',        usd: 1800, hap: 2 },
  { id: 'turbo_kit',      label: 'Big Turbo Kit (+HP)',        usd: 6000, hap: 4, soc: 3, hpGain: 100 },
  { id: 'supercharger',   label: 'Supercharger System (+HP)',  usd: 7500, hap: 4, soc: 3, hpGain: 120 },
  { id: 'nitrous',        label: 'Nitrous Oxide System',       usd: 2500, hap: 3, soc: 2, hpGain: 75 },
  { id: 'widebody',       label: 'Widebody Aero Kit',          usd: 8000, hap: 5, soc: 5 },
  { id: 'air_ride',       label: 'Air Ride Suspension System', usd: 4000, hap: 4, soc: 4 },
  { id: 'race_seats',     label: 'Racing Bucket Seats',        usd: 2200, hap: 2, soc: 2 },
  { id: 'roll_cage',      label: 'Bolt-in Roll Cage',          usd: 1800, hap: 2, soc: 3 },
  { id: 'slick_tires',    label: 'Track/Slick Tires',          usd: 1500, hap: 2, soc: 1 },
  { id: 'offroad_bumper', label: 'Steel Off-Road Bumpers',     usd: 2000, hap: 2, soc: 2 },
  { id: 'custom_lights',  label: 'Custom LED/Halo Headlights', usd: 1000, hap: 2, soc: 2 },
  { id: 'underglow',      label: 'Underglow Neon Kit',         usd: 500,  hap: 2, soc: 3 },
  { id: 'engine_swap',    label: 'Full Engine Swap (V8/JZ/LS)',usd: 15000,hap: 6, soc: 5, hpGain: 200 },
  { id: 'forged_internals',label: 'Forged Engine Internals',   usd: 5000, hap: 1, soc: 1, hpGain: 20 },
  { id: 'perf_camshaft',  label: 'Performance Camshafts',      usd: 1500, hap: 2, soc: 2, hpGain: 30 },
  { id: 'meth_inject',    label: 'Methanol Injection System',  usd: 1200, hap: 2, soc: 1, hpGain: 40 },
  { id: 'short_shifter',  label: 'Short Throw Shifter',        usd: 300,  hap: 1, soc: 1 }
];

const CAR_EVENTS = [
  { id: 'breakdown',          weight: 8, title: 'Breakdown',               text: 'Your car won\'t start. The mechanic is on the way.',             costUSD: [300, 1200] },
  { id: 'breakdown_serious',  weight: 3, title: 'Serious breakdown',       text: 'A major mechanical issue appeared. Tow truck needed.',         costUSD: [1500, 4000] },
  { id: 'accident_minor',     weight: 5, title: 'Minor accident',          text: 'A small collision in traffic. Nobody hurt, damage is cosmetic.', costUSD: [500, 1500] },
  { id: 'accident_moderate',  weight: 3, title: 'Moderate accident',       text: 'Rear-ended at a red light. Significant body damage.',          costUSD: [2000, 5000] },
  { id: 'accident_major',     weight: 1, title: 'Major accident',          text: 'A serious collision. Multiple vehicles involved.',             costUSD: [6000, 15000] },
  { id: 'fine_speed',         weight: 8, title: 'Speeding ticket',         text: 'A radar caught you. Fine is due.',                             costUSD: [80, 400] },
  { id: 'fine_parking',       weight: 10, title: 'Parking ticket',         text: 'Meter ran out. Ticket is on your windshield.',                 costUSD: [30, 200] },
  { id: 'vandalism',          weight: 4, title: 'Vandalism',               text: 'Someone scratched your car in the parking lot.',               costUSD: [200, 800] },
  { id: 'theft_attempt',      weight: 3, title: 'Attempted theft',         text: 'Someone tried to break in. Broken window.',                    costUSD: [150, 500] },
  { id: 'theft_full',         weight: 1, title: 'Car stolen',              text: 'Your car is gone from the parking spot. Police report filed.', costUSD: [0, 0], stolen: true },
  { id: 'tyre_puncture',      weight: 12, title: 'Flat tyre',              text: 'Puncture. Roadside assistance or local shop needed.',          costUSD: [40, 200] },
  { id: 'battery_dead',       weight: 6, title: 'Dead battery',            text: 'Battery is dead. Jump-start and replace.',                     costUSD: [100, 350] },
  { id: 'windshield_chip',    weight: 5, title: 'Windshield chip',         text: 'A stone chipped the windshield. Needs repair or replace.',     costUSD: [150, 900] },
  { id: 'proud_moment',       weight: 6, title: 'Proud moment',            text: 'You washed the car yourself. It shines. You smile.',           hap: 3 },
  { id: 'compliment',         weight: 7, title: 'Compliment received',     text: 'Someone at work complimented your car today.',                 hap: 2, soc: 1 },
  { id: 'road_trip',          weight: 4, title: 'Road trip',               text: 'You took the car on a weekend trip. Great weather.',           hap: 4 },
  { id: 'first_rain',         weight: 4, title: 'Caught in the rain',      text: 'A sudden downpour. Your car got dirty again.',                 hap: -1 },
  { id: 'friend_borrow',      weight: 5, title: 'Friend asks to borrow',   text: 'A close friend needs a car for the day. What do you say?',     choice: true },
  { id: 'sibling_needs',      weight: 4, title: 'Sibling needs the car',   text: 'Your sibling needs the car for a family emergency.',           choice: true },
  { id: 'spouse_needs',       weight: 5, title: 'Spouse needs the car',    text: 'Your spouse asks to use the car today.',                       choice: true, requiresSpouse: true },
  { id: 'car_needs_service',  weight: 6, title: 'Service overdue',         text: 'Your car is overdue for maintenance. Dashboard warning lit.',  costUSD: [200, 600] },
  { id: 'recall',             weight: 2, title: 'Manufacturer recall',     text: 'Your model was recalled. Free fix at the dealer.',             costUSD: [0, 0], hap: -1 },
  { id: 'photo_spot',         weight: 3, title: 'Photographed on street',  text: 'A stranger stopped to take photos of your car.',               hap: 2, soc: 2, requiresClass: ['lux', 'sport', 'exec', 'hyper'] },
  { id: 'parking_ding',       weight: 8, title: 'Parking ding',            text: 'Someone dinged your door in a tight lot.',                     costUSD: [100, 400] },
  { id: 'insurance_renew',    weight: 10, title: 'Insurance renewal',      text: 'Renewal reminder. Renew or lose coverage.',                    requiresInsurance: true },
  { id: 'registration_renew', weight: 10, title: 'Registration renewal',   text: 'Vehicle registration expires this year.',                      requiresRegistration: true },
  { id: 'tyres_worn',         weight: 4, title: 'Tyres worn out',          text: 'Your tyres need replacement to stay safe.',                    costUSD: [400, 1200] },
  { id: 'ac_fail',            weight: 4, title: 'AC failure',              text: 'AC stopped working. Not fun in the summer heat.',              costUSD: [300, 900] },
  { id: 'family_visit_trip',  weight: 4, title: 'Family visit',            text: 'You drove to see family out of town.',                         hap: 2 },
  { id: 'photo_online',       weight: 2, title: 'Car goes viral online',   text: 'Someone posted a photo of your car online. Comments are kind.',hap: 3, soc: 3, requiresClass: ['lux', 'sport', 'exec', 'hyper'] },
  { id: 'spilled_coffee',     weight: 6, title: 'Spilled coffee',          text: 'You spilled coffee all over the passenger seat. Annoying.',    costUSD: [50, 150], hap: -2 },
  { id: 'bird_poop',          weight: 10, title: 'Bird attack',            text: 'A flock of birds targeted your freshly washed car.',           costUSD: [20, 50], hap: -1 },
  { id: 'curbed_wheel',       weight: 7, title: 'Curbed a wheel',          text: 'You scraped your rims against the sidewalk while parking.',    costUSD: [150, 400], hap: -2 },
  { id: 'road_rage',          weight: 3, title: 'Road rage incident',      text: 'An aggressive driver shouted at you. Kept your cool, mostly.', hap: -3 },
  { id: 'race_challenge',     weight: 3, title: 'Street race challenge',   text: 'A modified car revved at you at a stoplight.',                 hap: 1, soc: 1, requiresClass: ['sport', 'hyper'] },
  { id: 'valet_joyride',      weight: 1, title: 'Valet joyride',           text: 'Dashcam caught the valet doing burnouts in your car.',         costUSD: [0, 0], hap: -4, requiresClass: ['sport', 'lux', 'exec', 'hyper'] },
  { id: 'car_show_invite',    weight: 2, title: 'Car show invite',         text: 'You were invited to display your car at a local meet.',        hap: 4, soc: 4, requiresClass: ['sport', 'hyper', 'lux'] },
  { id: 'ev_battery_deg',     weight: 3, title: 'Battery degradation',     text: 'You notice your EV range has permanently dropped a bit.',      hap: -2, requiresEV: true },
  { id: 'ev_software_upd',    weight: 5, title: 'OTA Software Update',     text: 'Your car downloaded a new update over night. UI feels snappier.', hap: 2, requiresEV: true },
  { id: 'hit_pothole',        weight: 9, title: 'Hit a massive pothole',   text: 'Thud! You need a wheel alignment and suspension check.',       costUSD: [100, 300], hap: -2 },
  { id: 'mouse_wires',        weight: 2, title: 'Rodent damage',           text: 'A mouse chewed through a wiring harness in the garage.',       costUSD: [400, 1200], hap: -3 },
  { id: 'dead_alternator',    weight: 4, title: 'Dead alternator',         text: 'Car died while driving. Alternator needs replacement.',        costUSD: [250, 700], hap: -2, requiresICE: true },
  { id: 'busted_radiator',    weight: 3, title: 'Overheating engine',      text: 'Coolant leak. Radiator needs to be replaced.',                 costUSD: [300, 800], hap: -2, requiresICE: true },
  { id: 'red_light_cam',      weight: 5, title: 'Red light camera',        text: 'A flash in the intersection. A ticket arrives days later.',    costUSD: [100, 300], hap: -1 },
  { id: 'tint_ticket',        weight: 3, title: 'Illegal tint ticket',     text: 'Pulled over for having window tint too dark.',                 costUSD: [100, 250], hap: -1 }
];

const CAR_NEED_EVENTS = [
  { id: 'commute',         title: 'Long commute',            text: 'You spend 2 hours a day on crowded buses. A car would save you 40 minutes each way.',      flag: 'carNeedCommute' },
  { id: 'job_requires',    title: 'Job requires car',        text: 'Your new job expects you to have a car for field visits.',                                 flag: 'carNeedJob' },
  { id: 'dating',          title: 'Dating life',             text: 'Every date ends with the same awkward bus stop goodbye. A car would help.',                flag: 'carNeedDating' },
  { id: 'family_pressure', title: 'Family pressure',         text: 'Your parents keep asking when you\'ll buy a car "like your cousin".',                      flag: 'carNeedFamily' },
  { id: 'weather',         title: 'Bad weather',             text: 'Rain every morning. Getting to work soaked is embarrassing.',                              flag: 'carNeedWeather' },
  { id: 'sibling_has',     title: 'Sibling got one first',   text: 'Your younger sibling just got a new car. You feel behind.',                                flag: 'carNeedSibling' },
  { id: 'emergency',       title: 'Emergency moment',        text: 'Last week your mother needed a hospital and no car was available.',                        flag: 'carNeedEmergency' },
  { id: 'job_far',         title: 'Job far away',            text: 'The best job offer you got is 35 km away. Only viable with a car.',                        flag: 'carNeedJobFar' },
  { id: 'kids_school',     title: 'School run',              text: 'Taking the kids to school by bus every morning is exhausting for everyone.',               flag: 'carNeedKids', requiresChildren: true },
  { id: 'health',          title: 'Health issue',            text: 'A health condition makes public transport difficult.',                                     flag: 'carNeedHealth' },
  { id: 'wedding_gift',    title: 'Wedding expectations',    text: 'Your fiancé\'s family expects you to show up with a car on the wedding day.',              flag: 'carNeedWedding', requiresSpouse: false, requiresFiance: true },
  { id: 'gym',             title: 'Gym routine',             text: 'You\'ve been consistent at the gym. A car would make the commute easier.',                 flag: 'carNeedGym' },
  { id: 'groceries',       title: 'Heavy groceries',         text: 'Carrying bags of heavy groceries on the bus is breaking your back.',                       flag: 'carNeedGroceries' },
  { id: 'moving_houses',   title: 'Moving apartments',       text: 'You need to move some boxes and small furniture. A car would be a lifesaver.',             flag: 'carNeedMoving' },
  { id: 'promotion_travel',title: 'Promotion means travel',  text: 'You got promoted, but it requires visiting regional offices weekly.',                      flag: 'carNeedPromo' },
  { id: 'late_work',       title: 'Late for work again',     text: 'The train was delayed. You got a warning at work. You need reliable transport.',           flag: 'carNeedLate' },
  { id: 'bus_strike',      title: 'Transit strike',          text: 'Public transport is on strike for the week. You are stranded.',                            flag: 'carNeedStrike' },
  { id: 'adopt_dog',       title: 'Adopted a big dog',       text: 'You got a large dog, and they aren\'t allowed on the local buses.',                        flag: 'carNeedDog' },
  { id: 'roadtrip_dream',  title: 'Roadtrip dream',          text: 'Your friends are planning a cross-country trip and you want to drive.',                    flag: 'carNeedRoadtrip' }
];

const CAR_MODELS = [
  /* ============ TOYOTA (JP, T1) ============ */
  ['toyota','Corolla','compact','sedan',22000,33,140,5,9,'cvt','fwd',2,1,13,2007,9999,2020,false,'G'],
  ['toyota','Yaris','econ','hatch',17000,36,115,5,9,'auto','fwd',1,0,11,2007,9999,2015,false,'G'],
  ['toyota','Camry','mid','sedan',28000,31,200,5,9,'auto','fwd',2,1,14,2007,9999,2007,false,'G'],
  ['toyota','Avalon','mid','sedan',38000,26,300,5,9,'auto','fwd',3,2,14,2007,2022,2019,false,'WM'],
  ['toyota','RAV4','suv','suv',32000,30,200,5,9,'auto','awd',3,2,14,2007,9999,2016,false,'G'],
  ['toyota','Highlander','suv','suv',42000,24,270,7,9,'auto','awd',3,2,14,2007,9999,2017,false,'WM'],
  ['toyota','Land Cruiser','suv','suv',85000,18,400,7,10,'auto','awd',5,5,15,2007,9999,0,false,'G'],
  ['toyota','Prado','suv','suv',55000,20,250,7,10,'auto','awd',4,4,14,2007,9999,0,false,'G'],
  ['toyota','Hilux','truck','pickup',38000,22,220,5,10,'auto','awd',3,3,14,2007,9999,0,false,'G'],
  ['toyota','Fortuner','suv','suv',45000,20,235,7,9,'auto','awd',3,3,14,2007,9999,0,false,'G'],
  ['toyota','Rush','suv','suv',30000,26,140,7,8,'auto','rwd',2,2,12,2018,9999,0,false,'M'],
  ['toyota','Prius','compact','hatch',28000,52,120,5,10,'cvt','fwd',2,2,13,2007,9999,2007,true,'WM'],
  ['toyota','bZ4X','suv','suv',45000,110,215,5,8,'auto','awd',4,4,12,2022,9999,0,true,'WM'],
  ['toyota','GR86','sport','coupe',32000,24,230,4,8,'man','rwd',5,5,12,2012,9999,0,false,'WM'],
  ['toyota','C-HR','suv','cross',28000,28,140,5,9,'auto','fwd',2,2,12,2016,9999,2020,true,'G'],
  ['toyota','Aygo','econ','hatch',14000,45,72,4,8,'man','fwd',1,0,10,2007,9999,0,false,'WM'],
  ['toyota','Yaris Cross','suv','cross',24000,40,115,5,9,'cvt','awd',2,1,12,2020,9999,2020,true,'G'],
  ['toyota','Corolla Cross','suv','cross',27000,32,169,5,9,'cvt','awd',2,2,12,2021,9999,2022,true,'G'],
  ['toyota','Venza','suv','cross',35000,39,219,5,9,'cvt','awd',3,2,13,2009,9999,2021,true,'W'],
  ['toyota','Sequoia','suv','suv',60000,20,437,8,9,'auto','awd',4,3,14,2007,9999,2023,true,'W'],
  ['toyota','Tundra','truck','pickup',45000,18,389,5,9,'auto','awd',4,3,14,2007,9999,2022,true,'W'],
  ['toyota','Tacoma','truck','pickup',35000,20,278,5,10,'auto','awd',3,3,14,2007,9999,2024,true,'W'],
  ['toyota','Sienna','minivan','minivan',36000,36,245,8,9,'cvt','awd',3,2,14,2007,9999,2021,true,'WM'],
  ['toyota','Supra','sport','coupe',55000,25,382,2,8,'auto','rwd',6,6,12,2020,9999,0,false,'WM'],
  ['toyota','GR Yaris','sport','hatch',40000,22,268,4,8,'man','awd',6,5,11,2020,9999,0,false,'WM'],
  ['toyota','Crown','lux','sedan',42000,41,236,5,9,'cvt','awd',4,4,13,2007,9999,2023,true,'WM'],
  ['toyota','Mirai','mid','sedan',50000,65,182,5,8,'auto','rwd',4,4,12,2015,9999,0,true,'W'],

  /* ============ HYUNDAI (KR, T1) ============ */
  ['hyundai','Elantra','compact','sedan',21000,33,147,5,8,'cvt','fwd',2,1,12,2007,9999,2017,false,'G'],
  ['hyundai','Accent','econ','sedan',15000,34,120,5,8,'auto','fwd',1,0,11,2007,9999,0,false,'G'],
  ['hyundai','i10','econ','hatch',13000,38,85,4,8,'auto','fwd',1,0,10,2007,9999,0,false,'M'],
  ['hyundai','i20','econ','hatch',16000,35,100,5,8,'auto','fwd',1,1,11,2007,9999,0,false,'M'],
  ['hyundai','i30','compact','hatch',22000,32,140,5,8,'auto','fwd',2,1,12,2007,9999,0,false,'WM'],
  ['hyundai','Sonata','mid','sedan',29000,28,180,5,8,'auto','fwd',3,2,14,2007,9999,2016,false,'WM'],
  ['hyundai','Tucson','suv','suv',30000,27,187,5,8,'auto','awd',3,2,13,2007,9999,2016,false,'G'],
  ['hyundai','Santa Fe','suv','suv',38000,24,250,7,8,'auto','awd',4,3,14,2007,9999,2021,false,'G'],
  ['hyundai','Creta','suv','suv',22000,30,120,5,8,'auto','fwd',2,2,12,2016,9999,0,false,'G'],
  ['hyundai','Kona','suv','cross',25000,30,147,5,8,'auto','fwd',2,2,12,2018,9999,2020,true,'WM'],
  ['hyundai','Ioniq 5','suv','cross',42000,114,225,5,8,'auto','rwd',4,4,12,2022,9999,0,true,'WM'],
  ['hyundai','Ioniq 6','mid','sedan',45000,130,225,5,8,'auto','rwd',4,3,12,2023,9999,0,true,'WM'],
  ['hyundai','Staria','van','van',35000,22,180,9,8,'auto','fwd',3,2,12,2022,9999,0,false,'M'],
  ['hyundai','Bayon','suv','cross',20000,32,100,5,8,'auto','fwd',2,1,11,2021,9999,0,false,'WM'],
  ['hyundai','Venue','suv','cross',19000,31,121,5,8,'cvt','fwd',1,1,11,2020,9999,0,false,'G'],
  ['hyundai','Palisade','suv','suv',45000,22,291,8,8,'auto','awd',4,3,13,2020,9999,0,false,'WM'],
  ['hyundai','Nexo','suv','suv',60000,60,161,5,7,'auto','fwd',3,3,12,2019,9999,0,true,'W'],
  ['hyundai','Veloster','sport','hatch',25000,28,147,4,7,'auto','fwd',3,3,11,2011,2022,0,false,'WM'],
  ['hyundai','Ioniq (Hybrid)','compact','hatch',24000,55,139,5,8,'auto','fwd',2,2,12,2017,2022,2017,false,'WM'],
  ['hyundai','i40','mid','wagon',26000,30,135,5,7,'auto','fwd',2,2,12,2011,2019,0,false,'W'],
  ['hyundai','Genesis Coupe','sport','coupe',30000,22,348,4,7,'man','rwd',4,4,12,2010,2016,0,false,'WM'],

  /* ============ KIA (KR, T1) ============ */
  ['kia','Cerato','compact','sedan',21000,32,147,5,8,'cvt','fwd',2,1,12,2007,9999,2017,false,'G'],
  ['kia','Rio','econ','hatch',17000,34,120,5,8,'auto','fwd',1,1,11,2007,9999,0,false,'WM'],
  ['kia','Picanto','econ','hatch',14000,37,84,4,8,'auto','fwd',1,0,10,2007,9999,0,false,'G'],
  ['kia','K5','mid','sedan',28000,28,180,5,8,'auto','fwd',3,2,13,2010,9999,2020,false,'WM'],
  ['kia','Sportage','suv','suv',30000,26,187,5,8,'auto','awd',3,2,13,2007,9999,2016,false,'G'],
  ['kia','Sorento','suv','suv',38000,24,281,7,8,'auto','awd',4,3,14,2007,9999,2021,false,'G'],
  ['kia','Seltos','suv','cross',23000,30,147,5,8,'auto','fwd',2,2,12,2020,9999,0,false,'G'],
  ['kia','Carens','minivan','minivan',24000,28,140,7,8,'auto','fwd',3,2,12,2007,9999,0,false,'M'],
  ['kia','Sonet','suv','cross',21000,31,120,5,8,'auto','fwd',2,1,11,2021,9999,0,false,'G'],
  ['kia','EV6','suv','cross',48000,117,225,5,8,'auto','rwd',4,4,12,2022,9999,0,true,'WM'],
  ['kia','EV9','suv','suv',60000,90,380,7,8,'auto','awd',5,4,12,2023,9999,0,true,'WM'],
  ['kia','Carnival','minivan','van',38000,22,290,7,8,'auto','fwd',3,2,13,2007,9999,2021,false,'G'],
  ['kia','Stonic','suv','cross',20000,32,100,5,8,'auto','fwd',2,1,11,2017,9999,0,false,'WM'],
  ['kia','Soul','compact','hatch',20000,30,147,5,8,'auto','fwd',2,2,12,2009,9999,2015,true,'WM'],
  ['kia','Niro','suv','cross',28000,50,139,5,8,'auto','fwd',2,2,12,2017,9999,2017,true,'WM'],
  ['kia','Telluride','suv','suv',45000,23,291,8,8,'auto','awd',4,3,13,2020,9999,0,false,'W'],
  ['kia','Stinger','sport','sedan',40000,20,300,5,8,'auto','rwd',5,5,12,2018,9999,0,false,'WM'],
  ['kia','Forte','compact','sedan',20000,33,147,5,8,'cvt','fwd',2,1,12,2010,9999,0,false,'WM'],
  ['kia','K8','exec','sedan',45000,25,300,5,8,'auto','fwd',4,4,13,2022,9999,2022,false,'M'],
  ['kia','K900','exec','sedan',60000,18,365,5,7,'auto','awd',5,4,13,2015,2021,0,false,'WM'],

  /* ============ NISSAN (JP, T1) ============ */
  ['nissan','Sunny','econ','sedan',16000,34,118,5,8,'auto','fwd',1,0,11,2007,9999,0,false,'G'],
  ['nissan','Sentra','compact','sedan',20000,33,149,5,8,'cvt','fwd',2,1,12,2007,9999,0,false,'G'],
  ['nissan','Altima','mid','sedan',26000,32,188,5,8,'cvt','fwd',2,2,13,2007,9999,2019,false,'W'],
  ['nissan','Maxima','mid','sedan',38000,25,300,5,8,'cvt','fwd',3,2,13,2007,2023,2016,false,'W'],
  ['nissan','Kicks','suv','cross',22000,31,122,5,8,'cvt','fwd',2,2,12,2018,9999,0,false,'G'],
  ['nissan','Qashqai','suv','cross',30000,28,160,5,8,'cvt','fwd',3,2,13,2007,9999,2016,false,'G'],
  ['nissan','X-Trail','suv','suv',38000,26,184,7,8,'cvt','awd',3,3,13,2007,9999,2022,false,'G'],
  ['nissan','Patrol','suv','suv',80000,17,400,7,10,'auto','awd',5,5,15,2007,9999,0,false,'M'],
  ['nissan','Juke','suv','cross',24000,29,117,5,8,'auto','fwd',2,2,12,2011,9999,0,false,'WM'],
  ['nissan','Leaf','compact','hatch',33000,112,147,5,8,'auto','fwd',2,2,10,2011,9999,0,true,'WM'],
  ['nissan','Ariya','suv','cross',50000,110,238,5,8,'auto','rwd',4,4,12,2022,9999,0,true,'WM'],
  ['nissan','Navara','truck','pickup',35000,24,190,5,8,'auto','awd',3,2,13,2007,9999,0,false,'G'],
  ['nissan','Micra','econ','hatch',15000,38,90,5,8,'auto','fwd',1,0,10,2007,9999,0,false,'WM'],
  ['nissan','Note','compact','hatch',18000,40,109,5,8,'cvt','fwd',1,1,11,2007,9999,2017,false,'WM'],
  ['nissan','Pathfinder','suv','suv',40000,23,284,8,8,'auto','awd',3,3,13,2007,9999,0,false,'G'],
  ['nissan','Armada','suv','suv',55000,16,400,8,8,'auto','awd',4,4,14,2007,9999,0,false,'W'],
  ['nissan','Titan','truck','pickup',45000,18,400,6,8,'auto','awd',4,3,14,2007,9999,0,false,'W'],
  ['nissan','Frontier','truck','pickup',32000,20,310,5,8,'auto','awd',3,2,13,2007,9999,0,false,'W'],
  ['nissan','370Z','sport','coupe',35000,21,332,2,8,'man','rwd',5,5,12,2009,2020,0,false,'G'],
  ['nissan','GT-R','sport','coupe',115000,18,565,4,8,'auto','awd',8,9,14,2009,9999,0,false,'G'],
  ['nissan','Z','sport','coupe',45000,22,400,2,8,'man','rwd',6,7,12,2023,9999,0,false,'G'],

  /* ============ HONDA (JP, T1) ============ */
  ['honda','Civic','compact','sedan',25000,34,158,5,10,'cvt','fwd',2,2,13,2007,9999,2007,false,'G'],
  ['honda','Accord','mid','sedan',30000,30,192,5,10,'auto','fwd',2,2,14,2007,9999,2014,false,'G'],
  ['honda','CR-V','suv','suv',32000,30,190,5,10,'cvt','awd',3,2,13,2007,9999,2020,false,'G'],
  ['honda','HR-V','suv','cross',26000,32,141,5,10,'cvt','fwd',2,2,12,2015,9999,0,false,'G'],
  ['honda','Pilot','suv','suv',48000,22,285,7,10,'auto','awd',4,3,14,2007,9999,0,false,'W'],
  ['honda','Jazz','econ','hatch',18000,36,98,5,10,'cvt','fwd',1,1,12,2007,9999,2020,false,'WM'],
  ['honda','City','compact','sedan',19000,34,118,5,10,'cvt','fwd',2,1,12,2007,9999,0,false,'M'],
  ['honda','e:Ny1','suv','cross',42000,110,201,5,9,'auto','fwd',4,3,12,2023,9999,0,true,'WM'],
  ['honda','Fit','compact','hatch',18000,36,130,5,10,'cvt','fwd',1,1,12,2007,2020,0,false,'W'],
  ['honda','Passport','suv','suv',42000,22,280,5,10,'auto','awd',3,3,13,2019,9999,0,false,'W'],
  ['honda','Ridgeline','truck','pickup',40000,21,280,5,10,'auto','awd',3,3,14,2007,9999,0,false,'W'],
  ['honda','Odyssey','minivan','minivan',38000,22,280,8,9,'auto','fwd',3,3,14,2007,9999,0,false,'G'],
  ['honda','S2000','sport','cabrio',25000,23,237,2,10,'man','rwd',7,7,15,2000,2009,0,false,'G'],
  ['honda','NSX','sport','coupe',160000,21,573,2,9,'auto','awd',8,9,13,2017,2022,2017,false,'W'],
  ['honda','Crosstour','mid','wagon',28000,23,278,5,9,'auto','awd',2,2,12,2010,2015,0,false,'W'],

  /* ============ MITSUBISHI (JP, T2) ============ */
  ['mitsubishi','Attrage','econ','sedan',14000,37,78,5,8,'cvt','fwd',1,0,10,2013,9999,0,false,'M'],
  ['mitsubishi','Lancer','compact','sedan',19000,31,148,5,8,'cvt','fwd',2,1,11,2007,2018,0,false,'WM'],
  ['mitsubishi','Eclipse Cross','suv','cross',30000,27,152,5,8,'cvt','awd',3,2,12,2018,9999,0,false,'G'],
  ['mitsubishi','Xpander','minivan','minivan',20000,30,105,7,8,'auto','fwd',3,2,11,2018,9999,0,false,'M'],
  ['mitsubishi','Pajero','suv','suv',45000,20,250,7,8,'auto','awd',4,3,14,2007,9999,0,false,'M'],
  ['mitsubishi','ASX','suv','cross',24000,30,148,5,8,'cvt','fwd',2,2,12,2010,9999,0,false,'G'],
  ['mitsubishi','Outlander','suv','suv',35000,26,181,5,8,'cvt','awd',3,2,13,2007,9999,2018,false,'WM'],
  ['mitsubishi','Mirage','econ','hatch',13000,39,78,5,8,'cvt','fwd',1,0,10,2014,9999,0,false,'WM'],
  ['mitsubishi','Eclipse','sport','coupe',22000,24,162,4,7,'auto','fwd',3,3,11,2007,2012,0,false,'W'],
  ['mitsubishi','Lancer Evo X','sport','sedan',38000,19,291,5,7,'man','awd',6,7,12,2008,2015,0,false,'G'],
  ['mitsubishi','Triton','truck','pickup',32000,24,181,5,8,'auto','awd',3,2,13,2007,9999,0,false,'M'],

  /* ============ CHEVROLET (US, T1) ============ */
  ['chevrolet','Optra','econ','sedan',16000,32,120,5,7,'auto','fwd',1,0,10,2007,9999,0,false,'M'],
  ['chevrolet','Aveo','econ','hatch',15000,33,105,5,7,'auto','fwd',1,0,10,2007,9999,0,false,'M'],
  ['chevrolet','Captiva','suv','suv',28000,24,170,7,7,'auto','awd',3,2,12,2007,2018,0,false,'M'],
  ['chevrolet','Groove','suv','cross',22000,28,110,5,7,'cvt','fwd',2,1,11,2020,9999,0,false,'M'],
  ['chevrolet','Tahoe','suv','suv',62000,18,355,7,7,'auto','awd',4,4,13,2007,9999,0,false,'WM'],
  ['chevrolet','Silverado','truck','pickup',40000,20,355,6,7,'auto','awd',3,3,14,2007,9999,0,false,'W'],
  ['chevrolet','Corvette','sport','coupe',70000,21,495,2,7,'auto','rwd',6,7,14,2007,9999,0,false,'W'],
  ['chevrolet','Trax','suv','cross',22000,30,137,5,7,'auto','fwd',2,1,11,2013,9999,0,false,'WM'],
  ['chevrolet','Trailblazer','suv','suv',30000,27,160,5,7,'cvt','awd',3,2,12,2020,9999,0,false,'WM'],
  ['chevrolet','Menlo','suv','cross',38000,105,150,5,7,'auto','fwd',3,3,11,2020,9999,0,true,'M'],
  ['chevrolet','Spark','econ','hatch',14000,33,98,4,7,'cvt','fwd',1,0,10,2013,2022,0,false,'WM'],
  ['chevrolet','Malibu','mid','sedan',25000,29,160,5,7,'cvt','fwd',2,2,12,2007,9999,2016,false,'WM'],
  ['chevrolet','Impala','mid','sedan',32000,25,305,5,7,'auto','fwd',3,2,13,2007,2020,0,false,'W'],
  ['chevrolet','Equinox','suv','suv',28000,28,170,5,7,'auto','awd',2,2,12,2007,9999,0,false,'WM'],
  ['chevrolet','Traverse','suv','suv',35000,21,310,8,7,'auto','awd',3,2,13,2009,9999,0,false,'W'],
  ['chevrolet','Colorado','truck','pickup',30000,22,200,5,7,'auto','awd',3,2,13,2007,9999,0,false,'W'],
  ['chevrolet','Suburban','suv','suv',65000,16,355,9,7,'auto','awd',4,4,14,2007,9999,0,false,'WM'],
  ['chevrolet','Camaro','sport','coupe',35000,22,275,4,7,'auto','rwd',5,6,13,2010,2024,0,false,'WM'],
  ['chevrolet','Bolt EV','compact','hatch',30000,120,200,5,7,'auto','fwd',3,2,11,2017,9999,0,true,'W'],

  /* ============ RENAULT (FR, T1) ============ */
  ['renault','Logan','econ','sedan',13000,34,90,5,7,'man','fwd',1,0,10,2007,9999,0,false,'M'],
  ['renault','Duster','suv','cross',22000,28,130,5,7,'man','fwd',2,1,11,2010,9999,0,false,'G'],
  ['renault','Megane','compact','hatch',20000,32,115,5,7,'auto','fwd',2,1,11,2007,9999,0,false,'WM'],
  ['renault','Captur','suv','cross',24000,30,150,5,7,'auto','fwd',2,2,12,2013,9999,0,false,'WM'],
  ['renault','Kadjar','suv','cross',28000,28,160,5,7,'auto','fwd',3,2,12,2016,9999,0,false,'WM'],
  ['renault','Austral','suv','cross',32000,32,158,5,7,'auto','fwd',3,3,12,2022,9999,2022,true,'WM'],
  ['renault','Arkana','suv','coupe',28000,30,158,5,7,'auto','fwd',3,3,12,2019,9999,2021,true,'WM'],
  ['renault','Clio','econ','hatch',16000,35,90,5,7,'man','fwd',1,1,11,2007,9999,0,false,'WM'],
  ['renault','Koleos','suv','suv',32000,26,170,5,7,'cvt','awd',3,2,12,2008,9999,0,false,'WM'],
  ['renault','Twingo','econ','hatch',12000,40,70,4,7,'man','rwd',1,1,10,2007,9999,0,false,'WM'],
  ['renault','Zoe','compact','hatch',30000,110,135,5,7,'auto','fwd',2,2,11,2012,9999,0,true,'WM'],

  /* ============ PEUGEOT (FR, T2) ============ */
  ['peugeot','208','compact','hatch',18000,34,100,5,6,'auto','fwd',2,1,11,2012,9999,0,false,'WM'],
  ['peugeot','2008','suv','cross',22000,32,130,5,6,'auto','fwd',2,2,11,2013,9999,0,false,'WM'],
  ['peugeot','3008','suv','cross',30000,29,180,5,6,'auto','fwd',3,2,12,2009,9999,2021,false,'WM'],
  ['peugeot','5008','suv','suv',36000,27,180,7,6,'auto','fwd',4,3,13,2010,9999,0,false,'WM'],
  ['peugeot','301','econ','sedan',15000,35,115,5,6,'auto','fwd',1,0,10,2012,9999,0,false,'M'],
  ['peugeot','508','mid','sedan',32000,28,225,5,6,'auto','fwd',3,3,13,2011,9999,2019,false,'WM'],
  ['peugeot','408','mid','cross',30000,30,130,5,6,'auto','fwd',3,3,12,2022,9999,2022,true,'WM'],
  ['peugeot','Rifter','van','van',24000,32,110,7,6,'auto','fwd',2,1,11,2018,9999,0,false,'WM'],

  /* ============ CITROEN (FR, T2) ============ */
  ['citroen','C3','compact','hatch',17000,34,83,5,6,'auto','fwd',1,1,11,2007,9999,0,false,'WM'],
  ['citroen','C4','compact','hatch',20000,32,130,5,6,'auto','fwd',2,1,11,2007,9999,0,false,'WM'],
  ['citroen','C5 Aircross','suv','suv',28000,28,180,5,6,'auto','fwd',3,2,12,2018,9999,0,false,'WM'],
  ['citroen','C-Elysee','econ','sedan',14000,35,115,5,6,'man','fwd',1,0,10,2013,9999,0,false,'M'],
  ['citroen','Berlingo','van','van',22000,30,130,7,6,'auto','fwd',2,1,11,2007,9999,0,false,'WM'],
  ['citroen','C3 Aircross','suv','cross',21000,32,110,5,6,'auto','fwd',2,2,11,2017,9999,0,false,'WM'],
  ['citroen','C4 Cactus','suv','cross',19000,34,110,5,6,'auto','fwd',2,2,11,2014,2020,0,false,'WM'],
  ['citroen','C5 X','mid','wagon',32000,30,180,5,6,'auto','fwd',3,3,12,2021,9999,2021,false,'WM'],

  /* ============ FIAT (IT, T1) ============ */
  ['fiat','Tipo','compact','sedan',16000,34,95,5,6,'man','fwd',1,0,10,2015,9999,0,false,'WM'],
  ['fiat','500','compact','hatch',18000,36,70,4,6,'auto','fwd',2,2,10,2007,9999,0,false,'WM'],
  ['fiat','Panda','econ','hatch',13000,38,70,4,6,'man','fwd',1,0,10,2007,9999,0,false,'WM'],
  ['fiat','500X','suv','cross',24000,30,150,5,6,'auto','fwd',2,2,11,2014,9999,0,false,'WM'],
  ['fiat','Ducato','van','van',32000,25,130,9,6,'man','fwd',2,1,12,2007,9999,0,false,'WM'],
  ['fiat','Punto','econ','hatch',14000,35,75,5,6,'man','fwd',1,0,10,2007,2018,0,false,'WM'],
  ['fiat','500L','minivan','minivan',20000,32,105,5,6,'auto','fwd',2,1,11,2012,2022,0,false,'WM'],
  ['fiat','124 Spider','sport','cabrio',28000,26,160,2,7,'man','rwd',5,5,12,2016,2020,0,false,'WM'],

  /* ============ SKODA (CZ, T2) ============ */
  ['skoda','Fabia','econ','hatch',18000,35,95,5,8,'auto','fwd',1,1,11,2007,9999,0,false,'WM'],
  ['skoda','Octavia','mid','sedan',26000,32,150,5,8,'auto','fwd',3,2,13,2007,9999,2019,false,'WM'],
  ['skoda','Superb','mid','sedan',34000,30,150,5,8,'auto','fwd',3,3,13,2007,9999,2019,false,'WM'],
  ['skoda','Kodiaq','suv','suv',38000,26,180,7,8,'auto','awd',4,3,13,2016,9999,0,false,'WM'],
  ['skoda','Kamiq','suv','cross',24000,30,115,5,8,'auto','fwd',2,2,11,2019,9999,0,false,'WM'],
  ['skoda','Kushaq','suv','cross',23000,31,150,5,8,'auto','fwd',2,2,11,2021,9999,0,false,'M'],
  ['skoda','Scala','compact','hatch',22000,33,113,5,8,'auto','fwd',2,2,11,2019,9999,0,false,'WM'],
  ['skoda','Enyaq','suv','cross',45000,105,180,5,7,'auto','rwd',4,4,12,2021,9999,0,true,'WM'],
  ['skoda','Karoq','suv','suv',30000,28,150,5,8,'auto','fwd',3,2,12,2017,9999,0,false,'WM'],

  /* ============ VOLKSWAGEN (DE, T2) ============ */
  ['volkswagen','Golf','compact','hatch',24000,32,130,5,7,'auto','fwd',3,2,13,2007,9999,2014,false,'WM'],
  ['volkswagen','Passat','mid','sedan',34000,29,150,5,7,'auto','fwd',3,2,13,2007,9999,2014,false,'WM'],
  ['volkswagen','Tiguan','suv','suv',38000,26,184,5,7,'auto','awd',3,2,13,2007,9999,2016,false,'WM'],
  ['volkswagen','T-Roc','suv','cross',30000,30,150,5,7,'auto','fwd',3,2,12,2017,9999,0,false,'WM'],
  ['volkswagen','T-Cross','suv','cross',24000,31,115,5,7,'auto','fwd',2,2,11,2019,9999,0,false,'WM'],
  ['volkswagen','Polo','econ','hatch',20000,34,95,5,7,'auto','fwd',2,1,11,2007,9999,0,false,'WM'],
  ['volkswagen','ID.4','suv','cross',45000,104,201,5,7,'auto','rwd',4,4,12,2021,9999,0,true,'WM'],
  ['volkswagen','ID.5','suv','cross',52000,105,201,5,7,'auto','rwd',4,4,12,2022,9999,0,true,'WM'],
  ['volkswagen','Touareg','suv','suv',60000,24,286,5,7,'auto','awd',4,4,13,2007,9999,2020,false,'WM'],
  ['volkswagen','Arteon','mid','sedan',42000,28,190,5,7,'auto','fwd',4,3,13,2017,9999,0,false,'WM'],
  ['volkswagen','Up!','econ','hatch',15000,42,60,4,7,'man','fwd',1,0,10,2011,9999,0,false,'WM'],
  ['volkswagen','Taigo','suv','coupe',26000,31,110,5,7,'auto','fwd',2,2,11,2021,9999,0,false,'WM'],
  ['volkswagen','Touran','minivan','minivan',32000,28,150,7,7,'auto','fwd',3,2,12,2007,9999,0,false,'WM'],
  ['volkswagen','Sharan','minivan','minivan',38000,26,150,7,7,'auto','fwd',3,2,12,2007,2022,0,false,'WM'],
  ['volkswagen','Amarok','truck','pickup',45000,24,200,5,7,'auto','awd',3,3,13,2010,9999,0,false,'G'],
  ['volkswagen','Multivan','van','van',50000,25,150,7,7,'auto','fwd',3,3,13,2007,9999,2021,false,'WM'],
  ['volkswagen','Scirocco','sport','coupe',30000,28,200,4,7,'auto','fwd',4,4,11,2008,2017,0,false,'WM'],
  ['volkswagen','ID.3','compact','hatch',40000,120,201,5,7,'auto','rwd',3,3,12,2020,9999,0,true,'WM'],
  ['volkswagen','Jetta','compact','sedan',23000,33,150,5,7,'auto','fwd',2,1,12,2007,9999,0,false,'W'],
  ['volkswagen','Atlas','suv','suv',40000,22,235,7,7,'auto','awd',3,3,13,2018,9999,0,false,'W'],

  /* ============ SUZUKI (JP, T1) ============ */
  ['suzuki','Swift','econ','hatch',16000,36,90,5,8,'auto','fwd',1,1,11,2007,9999,2020,false,'WM'],
  ['suzuki','Dzire','econ','sedan',15000,35,90,5,8,'auto','fwd',1,0,10,2012,9999,0,false,'M'],
  ['suzuki','Baleno','compact','hatch',18000,33,90,5,8,'auto','fwd',2,1,11,2016,9999,0,false,'M'],
  ['suzuki','Vitara','suv','cross',24000,30,140,5,8,'auto','fwd',2,2,12,2007,9999,2019,false,'WM'],
  ['suzuki','Jimny','suv','suv',22000,26,102,4,8,'auto','awd',3,2,13,2007,9999,0,false,'G'],
  ['suzuki','Ertiga','minivan','minivan',20000,30,105,7,8,'auto','fwd',3,2,11,2013,9999,0,false,'M'],
  ['suzuki','S-Cross','suv','cross',26000,30,140,5,8,'auto','fwd',2,2,12,2013,9999,2020,false,'WM'],
  ['suzuki','Ignis','econ','hatch',15000,40,83,4,8,'man','fwd',1,1,11,2016,9999,2020,false,'WM'],
  ['suzuki','Celerio','econ','hatch',12000,42,67,5,8,'man','fwd',1,0,10,2014,9999,0,false,'M'],

  /* ============ MG (CN, T1) ============ */
  ['mg','ZS','suv','cross',22000,30,115,5,6,'auto','fwd',2,2,11,2018,9999,0,false,'G'],
  ['mg','HS','suv','cross',28000,26,160,5,6,'auto','fwd',3,2,12,2019,9999,2022,false,'G'],
  ['mg','RX5','suv','cross',30000,28,180,5,6,'auto','fwd',3,2,12,2020,9999,2020,true,'G'],
  ['mg','5','compact','hatch',19000,32,160,5,6,'auto','fwd',2,1,11,2019,9999,0,false,'WM'],
  ['mg','6','mid','sedan',24000,30,180,5,6,'auto','fwd',3,2,12,2020,9999,0,false,'WM'],
  ['mg','7','mid','sedan',28000,28,180,5,6,'auto','fwd',3,2,12,2020,9999,0,false,'WM'],
  ['mg','Marvel R','suv','cross',42000,110,180,5,6,'auto','rwd',4,4,11,2020,9999,0,true,'WM'],
  ['mg','One','suv','cross',40000,108,200,5,6,'auto','rwd',4,3,11,2022,9999,0,true,'WM'],
  ['mg','4','compact','hatch',34000,115,200,5,6,'auto','rwd',4,3,11,2023,9999,0,true,'WM'],
  ['mg','ZS EV','suv','cross',35000,120,143,5,6,'auto','fwd',3,2,11,2019,9999,0,true,'WM'],
  ['mg','MG5 EV','mid','wagon',32000,115,156,5,6,'auto','fwd',3,2,11,2020,9999,0,true,'WM'],
  ['mg','Cyberster','sport','cabrio',60000,100,536,2,6,'auto','awd',6,6,12,2024,9999,0,true,'WM'],

  /* ============ BYD (CN, T2) ============ */
  ['byd','Atto 3','suv','cross',32000,105,200,5,6,'auto','fwd',3,3,11,2022,9999,0,true,'WM'],
  ['byd','Seal','mid','sedan',42000,120,313,5,6,'auto','rwd',4,3,12,2022,9999,0,true,'WM'],
  ['byd','Dolphin','compact','hatch',26000,115,204,5,6,'auto','fwd',3,2,11,2022,9999,0,true,'WM'],
  ['byd','Han','exec','sedan',60000,105,500,5,6,'auto','awd',5,4,12,2020,9999,0,true,'WM'],
  ['byd','Tang','suv','suv',55000,100,510,7,6,'auto','awd',5,4,12,2019,9999,0,true,'M'],
  ['byd','Song Plus','suv','cross',40000,105,218,5,6,'auto','fwd',4,3,12,2021,9999,0,true,'M'],
  ['byd','Qin Plus','compact','sedan',22000,110,136,5,6,'auto','fwd',2,2,11,2021,9999,2021,true,'M'],
  ['byd','Yuan Plus','suv','cross',28000,110,204,5,6,'auto','fwd',3,2,11,2022,9999,0,true,'M'],
  ['byd','Frigate 07','suv','suv',45000,100,395,5,6,'auto','awd',4,3,12,2022,9999,2022,true,'M'],
  ['byd','Seagull','econ','hatch',15000,125,74,4,6,'auto','fwd',2,1,10,2023,9999,0,true,'M'],

  /* ============ CHERY (CN, T2) ============ */
  ['chery','Tiggo 4','suv','cross',22000,30,147,5,6,'cvt','fwd',2,2,11,2019,9999,0,false,'M'],
  ['chery','Tiggo 7','suv','cross',28000,28,147,5,6,'cvt','fwd',3,2,12,2020,9999,0,false,'M'],
  ['chery','Tiggo 8','suv','suv',34000,26,254,7,6,'auto','awd',4,3,12,2020,9999,0,false,'M'],
  ['chery','Arrizo 5','compact','sedan',18000,33,116,5,6,'cvt','fwd',2,1,11,2018,9999,0,false,'M'],
  ['chery','Arrizo 8','mid','sedan',26000,30,197,5,6,'auto','fwd',3,2,12,2022,9999,0,false,'M'],
  ['chery','Omoda 5','suv','cross',25000,30,197,5,6,'auto','fwd',3,2,12,2022,9999,0,false,'M'],
  ['chery','Tiggo 9','suv','suv',42000,24,260,7,6,'auto','awd',4,3,12,2023,9999,0,false,'M'],
  ['chery','eQ1','econ','hatch',12000,130,41,4,6,'auto','rwd',1,0,10,2017,9999,0,true,'M'],

  /* ============ HAVAL (CN, T2) ============ */
  ['haval','Jolion','suv','cross',23000,30,143,5,6,'auto','fwd',2,2,11,2021,9999,0,false,'M'],
  ['haval','H6','suv','suv',30000,28,201,5,6,'auto','awd',3,2,12,2018,9999,2022,false,'M'],
  ['haval','H9','suv','suv',42000,22,245,7,6,'auto','awd',4,3,13,2016,9999,0,false,'M'],
  ['haval','Dargo','suv','cross',28000,28,190,5,6,'auto','awd',3,3,12,2021,9999,0,false,'M'],
  ['haval','H6 GT','suv','coupe',34000,26,220,5,6,'auto','awd',4,3,12,2022,9999,0,false,'M'],
  ['haval','Shenshou','suv','cross',32000,28,224,5,6,'auto','fwd',3,3,12,2021,9999,0,false,'M'],
  ['haval','H2','suv','cross',18000,30,150,5,6,'auto','fwd',2,1,11,2014,2020,0,false,'M'],

  /* ============ GEELY (CN, T2) ============ */
  ['geely','Coolray','suv','cross',26000,30,177,5,6,'auto','fwd',3,2,12,2020,9999,0,false,'M'],
  ['geely','Okavango','suv','suv',34000,26,184,7,6,'auto','fwd',4,3,12,2021,9999,0,false,'M'],
  ['geely','Emgrand','compact','sedan',20000,32,114,5,6,'cvt','fwd',2,1,11,2017,9999,0,false,'M'],
  ['geely','Azkarra','suv','suv',32000,27,177,7,6,'auto','fwd',3,3,12,2020,9999,0,false,'M'],
  ['geely','Tugella','suv','coupe',36000,26,238,5,6,'auto','awd',4,3,12,2020,9999,0,false,'M'],
  ['geely','Geometry C','suv','cross',38000,108,204,5,6,'auto','fwd',4,3,11,2022,9999,0,true,'M'],
  ['geely','Monjaro','suv','suv',40000,25,238,5,6,'auto','awd',4,3,12,2022,9999,0,false,'M'],
  ['geely','Preface','mid','sedan',30000,28,190,5,6,'auto','fwd',3,2,12,2020,9999,0,false,'M'],
  ['geely','X7 Sport','suv','suv',25000,26,160,5,6,'auto','fwd',2,2,11,2016,2021,0,false,'M'],

  /* ============ CHANGAN (CN, T2) ============ */
  ['changan','CS35','suv','cross',22000,30,158,5,6,'auto','fwd',2,2,11,2019,9999,0,false,'M'],
  ['changan','CS55','suv','cross',28000,28,188,5,6,'auto','fwd',3,2,12,2019,9999,0,false,'M'],
  ['changan','CS75','suv','suv',33000,26,188,7,6,'auto','awd',4,3,12,2018,9999,0,false,'M'],
  ['changan','Eado','compact','sedan',19000,32,128,5,6,'auto','fwd',2,1,11,2018,9999,0,false,'M'],
  ['changan','UNI-K','suv','suv',38000,26,226,7,6,'auto','awd',4,3,12,2021,9999,0,false,'M'],
  ['changan','UNI-T','suv','cross',30000,28,177,5,6,'auto','fwd',3,3,12,2020,9999,0,false,'M'],
  ['changan','UNI-V','mid','sedan',28000,30,188,5,6,'auto','fwd',3,2,12,2022,9999,0,false,'M'],
  ['changan','CS95','suv','suv',42000,22,233,7,6,'auto','awd',4,3,13,2017,9999,0,false,'M'],
  ['changan','Alsvin','econ','sedan',15000,35,105,5,6,'auto','fwd',1,0,10,2018,9999,0,false,'M'],

  /* ============ EXEED (CN, T2) ============ */
  ['exeed','LX','suv','cross',32000,28,197,5,6,'auto','fwd',3,3,12,2019,9999,0,false,'M'],
  ['exeed','TXL','suv','suv',38000,26,224,7,6,'auto','awd',4,3,12,2019,9999,0,false,'M'],
  ['exeed','VX','suv','suv',45000,24,261,7,6,'auto','awd',4,4,12,2020,9999,0,false,'M'],
  ['exeed','RX','suv','coupe',42000,26,261,5,6,'auto','awd',4,4,12,2022,9999,0,false,'M'],

  /* ============ JETOUR (CN, T2) ============ */
  ['jetour','X70','suv','suv',25000,28,147,7,6,'auto','fwd',3,2,12,2019,9999,0,false,'M'],
  ['jetour','X90','suv','suv',32000,25,177,7,6,'auto','fwd',4,3,12,2020,9999,0,false,'M'],
  ['jetour','X95','suv','suv',38000,24,197,7,6,'auto','awd',4,3,12,2021,9999,0,false,'M'],
  ['jetour','T2','suv','suv',30000,26,197,5,6,'auto','awd',4,3,12,2023,9999,0,false,'M'],
  ['jetour','Dashing','suv','cross',28000,27,197,5,6,'auto','fwd',3,3,12,2022,9999,0,false,'M'],

  /* ============ LYNK & CO (CN, T2) ============ */
  ['lynkco','01','suv','cross',36000,28,250,5,6,'auto','awd',4,3,12,2020,9999,2022,true,'WM'],
  ['lynkco','02','suv','cross',30000,30,190,5,6,'auto','fwd',3,3,12,2023,9999,2023,true,'WM'],
  ['lynkco','08','suv','suv',42000,26,340,5,6,'auto','awd',5,4,12,2022,9999,0,true,'WM'],
  ['lynkco','03','compact','sedan',28000,32,180,5,6,'auto','fwd',3,3,12,2018,9999,0,false,'WM'],
  ['lynkco','05','suv','coupe',38000,26,254,5,6,'auto','awd',4,3,12,2020,9999,0,false,'WM'],
  ['lynkco','09','suv','suv',55000,24,254,7,6,'auto','awd',5,4,13,2021,9999,2021,true,'WM'],

  /* ============ FORD (US, T2) ============ */
  ['ford','Focus','compact','hatch',20000,34,123,5,7,'auto','fwd',2,1,12,2007,9999,0,false,'WM'],
  ['ford','Fiesta','econ','hatch',17000,36,100,5,7,'man','fwd',1,1,11,2007,9999,0,false,'WM'],
  ['ford','Mondeo','mid','sedan',30000,30,175,5,7,'auto','fwd',3,2,13,2007,9999,2022,false,'WM'],
  ['ford','F-150','truck','pickup',45000,20,290,6,7,'auto','awd',4,3,14,2007,9999,2021,false,'W'],
  ['ford','Mustang','sport','coupe',42000,22,310,4,7,'auto','rwd',6,6,13,2007,9999,0,false,'W'],
  ['ford','Explorer','suv','suv',45000,24,300,7,7,'auto','awd',4,3,13,2007,9999,2020,false,'W'],
  ['ford','Kuga','suv','cross',32000,28,180,5,7,'auto','fwd',3,2,13,2007,9999,2021,true,'WM'],
  ['ford','Puma','suv','cross',26000,30,155,5,7,'auto','fwd',2,2,12,2019,9999,2021,true,'WM'],
  ['ford','Ranger','truck','pickup',35000,24,210,5,7,'auto','awd',3,3,13,2007,9999,0,false,'G'],
  ['ford','Bronco','suv','suv',42000,22,300,5,7,'auto','awd',4,4,13,2021,9999,0,false,'W'],
  ['ford','Edge','suv','suv',38000,24,250,5,7,'auto','awd',3,2,13,2007,9999,0,false,'W'],
  ['ford','Escape','suv','suv',30000,28,181,5,7,'auto','fwd',3,2,12,2007,9999,2020,true,'W'],
  ['ford','Expedition','suv','suv',60000,18,375,8,7,'auto','awd',4,4,14,2007,9999,0,false,'W'],
  ['ford','Maverick','truck','pickup',25000,30,191,5,7,'auto','fwd',3,2,12,2022,9999,2022,true,'W'],
  ['ford','F-250','truck','pickup',55000,16,385,6,7,'auto','awd',4,4,14,2007,9999,0,false,'W'],
  ['ford','Mustang Mach-E','suv','cross',48000,105,266,5,7,'auto','rwd',5,5,12,2021,9999,0,true,'WM'],
  ['ford','GT','sport','coupe',500000,14,647,2,7,'auto','rwd',9,10,15,2017,2022,0,false,'W'],

  /* ============ MAZDA (JP, T2) ============ */
  ['mazda','Mazda2','econ','hatch',17000,36,90,5,9,'auto','fwd',1,1,11,2007,9999,0,false,'WM'],
  ['mazda','Mazda3','compact','sedan',22000,33,155,5,9,'auto','fwd',2,2,12,2007,9999,0,false,'WM'],
  ['mazda','Mazda6','mid','sedan',28000,31,187,5,9,'auto','fwd',3,2,13,2007,9999,2019,false,'WM'],
  ['mazda','CX-3','suv','cross',24000,30,148,5,9,'auto','fwd',2,2,12,2015,9999,0,false,'WM'],
  ['mazda','CX-5','suv','suv',32000,28,187,5,9,'auto','awd',3,2,13,2012,9999,0,false,'G'],
  ['mazda','CX-9','suv','suv',42000,24,250,7,9,'auto','awd',4,3,13,2007,9999,2023,false,'W'],
  ['mazda','MX-5','sport','cabrio',32000,30,181,2,9,'man','rwd',5,5,13,2007,9999,0,false,'WM'],
  ['mazda','CX-30','suv','cross',26000,29,186,5,9,'auto','awd',3,2,12,2020,9999,0,false,'WM'],
  ['mazda','CX-50','suv','cross',30000,28,187,5,9,'auto','awd',3,2,12,2023,9999,0,false,'WM'],
  ['mazda','CX-70','suv','suv',45000,26,280,5,9,'auto','awd',4,3,13,2024,9999,2024,true,'WM'],
  ['mazda','CX-90','suv','suv',50000,25,280,8,9,'auto','awd',4,3,13,2024,9999,2024,true,'WM'],

  /* ============ SUBARU (JP, T2) ============ */
  ['subaru','Impreza','compact','sedan',24000,32,152,5,9,'cvt','awd',2,2,12,2007,9999,0,false,'W'],
  ['subaru','Legacy','mid','sedan',30000,30,182,5,9,'cvt','awd',3,2,13,2007,9999,2022,false,'W'],
  ['subaru','Outback','suv','wagon',36000,28,182,5,9,'cvt','awd',3,2,13,2007,9999,0,false,'W'],
  ['subaru','Forester','suv','cross',32000,28,182,5,9,'cvt','awd',3,2,13,2007,9999,0,false,'G'],
  ['subaru','XV','suv','cross',26000,30,152,5,9,'cvt','awd',2,2,12,2012,9999,0,false,'WM'],
  ['subaru','Crosstrek','suv','cross',27000,30,152,5,9,'cvt','awd',2,2,12,2013,9999,2019,true,'WM'],
  ['subaru','WRX','sport','sedan',32000,24,271,5,8,'man','awd',5,4,12,2007,9999,0,false,'W'],
  ['subaru','BRZ','sport','coupe',30000,24,228,4,8,'man','rwd',5,4,12,2012,9999,0,false,'W'],
  ['subaru','Ascent','suv','suv',40000,23,260,8,9,'cvt','awd',3,3,13,2019,9999,0,false,'W'],
  ['subaru','Solterra','suv','cross',45000,105,215,5,8,'auto','awd',4,3,12,2023,9999,0,true,'W'],

  /* ============ JEEP (US, T2) ============ */
  ['jeep','Renegade','suv','cross',28000,26,180,5,6,'auto','fwd',3,2,12,2014,9999,0,false,'WM'],
  ['jeep','Compass','suv','cross',32000,25,180,5,6,'auto','awd',3,3,12,2017,9999,0,false,'WM'],
  ['jeep','Wrangler','suv','suv',55000,20,285,5,6,'auto','awd',5,5,14,2007,9999,2021,false,'W'],
  ['jeep','Grand Cherokee','suv','suv',65000,20,293,5,6,'auto','awd',4,4,14,2007,9999,2022,false,'WM'],
  ['jeep','Cherokee','suv','suv',40000,24,271,5,6,'auto','awd',3,3,12,2007,9999,2019,false,'W'],
  ['jeep','Gladiator','truck','pickup',55000,19,285,5,6,'auto','awd',4,4,13,2020,9999,0,false,'W'],
  ['jeep','Wagoneer','suv','suv',70000,18,392,8,6,'auto','awd',5,4,14,2022,9999,0,false,'W'],
  ['jeep','Avenger','suv','cross',35000,110,154,5,6,'auto','fwd',3,3,11,2023,9999,0,true,'WM'],

  /* ============ DODGE (US, T2) ============ */
  ['dodge','Charger','mid','sedan',40000,24,292,5,6,'auto','rwd',4,3,13,2007,9999,0,false,'W'],
  ['dodge','Challenger','sport','coupe',40000,23,303,4,6,'auto','rwd',6,6,13,2007,9999,2023,false,'W'],
  ['dodge','Durango','suv','suv',50000,22,293,7,6,'auto','awd',4,3,13,2007,9999,0,false,'W'],
  ['dodge','Hornet','suv','cross',32000,28,177,5,6,'auto','awd',3,2,12,2023,9999,0,false,'W'],
  ['dodge','Journey','suv','suv',25000,23,173,7,6,'auto','fwd',2,1,11,2009,2020,0,false,'W'],
  ['dodge','Viper','sport','coupe',100000,15,645,2,5,'man','rwd',8,9,14,2007,2017,0,false,'W'],

  /* ============ RAM (US, T2) ============ */
  ['ram','1500','truck','pickup',45000,22,305,6,7,'auto','awd',4,3,14,2007,9999,0,false,'W'],
  ['ram','2500','truck','pickup',55000,20,410,6,7,'auto','awd',4,4,14,2007,9999,0,false,'W'],
  ['ram','ProMaster','van','van',35000,20,276,2,7,'auto','fwd',2,1,13,2014,9999,0,false,'W'],
  ['ram','TRX','truck','pickup',85000,12,702,5,6,'auto','awd',7,7,14,2021,2024,0,false,'W'],

  /* ============ GMC (US, T2) ============ */
  ['gmc','Sierra','truck','pickup',48000,21,355,6,7,'auto','awd',4,3,14,2007,9999,0,false,'W'],
  ['gmc','Yukon','suv','suv',65000,20,420,7,7,'auto','awd',4,4,13,2007,9999,0,false,'W'],
  ['gmc','Acadia','suv','suv',45000,24,310,7,7,'auto','awd',3,3,13,2007,9999,0,false,'W'],
  ['gmc','Terrain','suv','suv',32000,26,170,5,7,'auto','awd',3,2,12,2010,9999,0,false,'W'],
  ['gmc','Hummer EV','truck','pickup',110000,90,1000,5,6,'auto','awd',8,8,13,2022,9999,0,true,'W'],

  /* ============ ISUZU (JP, T2) ============ */
  ['isuzu','D-Max','truck','pickup',32000,25,163,5,9,'auto','awd',3,2,14,2007,9999,0,false,'G'],
  ['isuzu','MU-X','suv','suv',42000,22,163,7,9,'auto','awd',3,2,14,2013,9999,0,false,'G'],

  /* ============ TATA / MAHINDRA (IN, T1) ============ */
  ['tata','Nexon','suv','cross',18000,35,118,5,6,'man','fwd',2,1,11,2017,9999,0,false,'M'],
  ['tata','Harrier','suv','suv',25000,28,167,5,6,'auto','fwd',3,2,12,2019,9999,0,false,'M'],
  ['tata','Safari','suv','suv',28000,26,167,7,6,'auto','fwd',3,3,12,2021,9999,0,false,'M'],
  ['mahindra','Thar','suv','suv',19000,25,130,4,7,'man','awd',3,2,12,2010,9999,0,false,'M'],
  ['mahindra','Scorpio','suv','suv',22000,24,130,7,7,'man','awd',3,2,12,2007,9999,0,false,'M'],
  ['mahindra','XUV700','suv','suv',26000,28,197,7,7,'auto','fwd',3,3,12,2021,9999,0,false,'M'],

  /* ============ LADA (RU, T1) ============ */
  ['lada','Niva','suv','suv',12000,22,83,4,5,'man','awd',2,1,15,2007,9999,0,false,'M'],
  ['lada','Granta','econ','sedan',10000,36,87,5,4,'man','fwd',1,0,10,2011,9999,0,false,'M'],
  ['lada','Vesta','compact','sedan',14000,34,106,5,4,'man','fwd',1,1,10,2015,9999,0,false,'M'],

  /* ============ MINI (UK, T3) ============ */
  ['mini','Cooper','compact','hatch',32000,32,136,4,6,'auto','fwd',4,5,12,2007,9999,0,false,'WM'],
  ['mini','Clubman','compact','wagon',38000,30,136,5,6,'auto','fwd',4,4,12,2008,9999,0,false,'WM'],
  ['mini','Countryman','suv','cross',42000,28,136,5,6,'auto','fwd',4,4,12,2011,9999,0,false,'WM'],
  ['mini','Cabrio','compact','cabrio',40000,30,136,4,6,'auto','fwd',4,5,11,2009,9999,0,false,'WM'],
  ['mini','Cooper SE','compact','hatch',45000,110,184,4,6,'auto','fwd',4,5,11,2020,9999,0,true,'WM'],
  ['mini','JCW','compact','hatch',48000,28,231,4,6,'auto','fwd',5,6,12,2015,9999,0,false,'WM'],
  ['mini','Paceman','suv','coupe',35000,29,122,4,6,'auto','awd',3,4,11,2013,2016,0,false,'WM'],

  /* ============ SMART (DE, T2) ============ */
  ['smart','Fortwo','econ','hatch',15000,40,89,2,6,'auto','rwd',2,2,10,2007,9999,2020,true,'WM'],
  ['smart','Forfour','econ','hatch',17000,38,89,4,6,'auto','rwd',2,2,10,2014,9999,2020,true,'WM'],
  ['smart','#1','suv','cross',40000,115,268,5,6,'auto','rwd',4,4,11,2023,9999,0,true,'WM'],

  /* ============ BMW (DE, T3) ============ */
  ['bmw','1 Series','compact','hatch',38000,30,136,5,7,'auto','rwd',4,4,12,2007,9999,0,false,'WM'],
  ['bmw','2 Series','compact','coupe',42000,28,184,4,7,'auto','rwd',4,4,12,2014,9999,0,false,'WM'],
  ['bmw','3 Series','lux','sedan',48000,28,255,5,7,'auto','rwd',5,5,12,2007,9999,2018,false,'G'],
  ['bmw','4 Series','lux','coupe',55000,27,255,4,7,'auto','rwd',5,5,12,2013,9999,0,false,'WM'],
  ['bmw','5 Series','lux','sedan',65000,26,255,5,7,'auto','rwd',5,6,13,2007,9999,2018,false,'G'],
  ['bmw','7 Series','exec','sedan',95000,22,375,5,7,'auto','rwd',6,7,14,2007,9999,2020,false,'G'],
  ['bmw','8 Series','exec','coupe',110000,22,335,4,7,'auto','rwd',6,7,13,2018,9999,0,false,'WM'],
  ['bmw','X1','suv','cross',45000,28,228,5,7,'auto','rwd',4,5,12,2009,9999,2020,false,'WM'],
  ['bmw','X2','suv','cross',48000,27,228,5,7,'auto','rwd',4,5,12,2018,9999,0,false,'WM'],
  ['bmw','X3','suv','suv',55000,25,248,5,7,'auto','rwd',5,5,13,2007,9999,2020,false,'G'],
  ['bmw','X4','suv','coupe',60000,24,248,5,7,'auto','rwd',5,5,13,2014,9999,0,false,'WM'],
  ['bmw','X5','suv','suv',75000,22,335,5,7,'auto','awd',5,6,14,2007,9999,2020,false,'G'],
  ['bmw','X6','suv','coupe',85000,21,335,5,7,'auto','awd',6,6,14,2007,9999,2020,false,'WM'],
  ['bmw','X7','suv','suv',105000,20,375,7,7,'auto','awd',6,7,14,2019,9999,0,false,'WM'],
  ['bmw','XM','suv','suv',160000,22,644,5,7,'auto','awd',7,8,12,2023,9999,2023,true,'WM'],
  ['bmw','Z4','sport','cabrio',65000,26,255,2,7,'auto','rwd',6,6,13,2007,9999,0,false,'WM'],
  ['bmw','M2','sport','coupe',65000,22,405,4,7,'auto','rwd',7,6,13,2016,9999,0,false,'WM'],
  ['bmw','M3','sport','sedan',85000,20,473,5,7,'auto','rwd',7,7,13,2007,9999,0,false,'WM'],
  ['bmw','M4','sport','coupe',88000,20,473,4,7,'auto','rwd',7,7,13,2015,9999,0,false,'WM'],
  ['bmw','M5','sport','sedan',120000,18,600,5,7,'auto','awd',8,8,13,2007,9999,0,false,'WM'],
  ['bmw','M8','sport','coupe',135000,17,617,4,7,'auto','awd',8,9,13,2020,9999,0,false,'WM'],
  ['bmw','i3','compact','hatch',45000,115,170,4,7,'auto','rwd',4,4,11,2014,2022,0,true,'WM'],
  ['bmw','i4','exec','sedan',65000,120,335,5,7,'auto','rwd',5,5,12,2022,9999,0,true,'WM'],
  ['bmw','i5','exec','sedan',78000,115,335,5,7,'auto','rwd',5,6,12,2024,9999,0,true,'WM'],
  ['bmw','i7','exec','sedan',130000,105,536,5,7,'auto','awd',7,7,13,2022,9999,0,true,'WM'],
  ['bmw','iX','suv','suv',95000,100,516,5,7,'auto','awd',6,7,13,2022,9999,0,true,'WM'],
  ['bmw','i8','sport','coupe',140000,45,369,4,6,'auto','awd',7,8,12,2014,2020,2014,true,'WM'],
  ['bmw','Z3','sport','cabrio',20000,25,190,2,6,'man','rwd',5,5,13,1996,2002,0,false,'WM'],
  ['bmw','6 Series','lux','coupe',75000,24,315,4,7,'auto','rwd',5,6,13,2007,2019,0,false,'WM'],

  /* ============ MERCEDES (DE, T3) ============ */
  ['mercedes','A-Class','compact','hatch',42000,30,136,5,7,'auto','fwd',4,5,12,2013,9999,0,false,'WM'],
  ['mercedes','C-Class','lux','sedan',52000,27,255,5,7,'auto','rwd',5,5,12,2007,9999,2018,false,'G'],
  ['mercedes','E-Class','exec','sedan',75000,25,255,5,7,'auto','rwd',5,6,13,2007,9999,2018,false,'G'],
  ['mercedes','S-Class','exec','sedan',120000,22,429,5,7,'auto','rwd',7,8,14,2007,9999,2020,false,'G'],
  ['mercedes','CLA','compact','coupe',48000,28,221,5,7,'auto','fwd',5,5,12,2013,9999,0,false,'WM'],
  ['mercedes','CLS','exec','sedan',85000,24,362,5,7,'auto','rwd',5,6,13,2007,9999,2023,false,'WM'],
  ['mercedes','GLA','suv','cross',50000,26,221,5,7,'auto','fwd',5,5,12,2014,9999,0,false,'WM'],
  ['mercedes','GLB','suv','cross',55000,25,221,7,7,'auto','fwd',5,5,12,2020,9999,0,false,'WM'],
  ['mercedes','GLC','suv','suv',65000,24,255,5,7,'auto','rwd',5,6,13,2015,9999,2019,false,'G'],
  ['mercedes','GLE','suv','suv',85000,22,255,5,7,'auto','awd',5,6,13,2007,9999,2019,false,'G'],
  ['mercedes','GLS','suv','suv',105000,20,362,7,7,'auto','awd',6,7,14,2017,9999,0,false,'WM'],
  ['mercedes','G-Class','suv','suv',140000,17,416,5,7,'auto','awd',7,8,15,2007,9999,0,false,'WM'],
  ['mercedes','EQS','exec','sedan',150000,100,516,5,7,'auto','rwd',7,7,13,2022,9999,0,true,'WM'],
  ['mercedes','EQE','exec','sedan',110000,102,402,5,7,'auto','rwd',6,6,13,2022,9999,0,true,'WM'],
  ['mercedes','EQB','suv','cross',80000,105,268,7,7,'auto','fwd',5,6,12,2022,9999,0,true,'WM'],
  ['mercedes','EQA','suv','cross',70000,108,190,5,7,'auto','fwd',5,5,12,2021,9999,0,true,'WM'],
  ['mercedes','EQC','suv','suv',85000,100,402,5,7,'auto','awd',5,6,12,2020,9999,0,true,'WM'],
  ['mercedes','AMG GT','sport','coupe',160000,18,577,2,7,'auto','rwd',7,8,14,2017,9999,0,false,'WM'],
  ['mercedes','AMG GT 4-Door','sport','sedan',180000,17,630,4,7,'auto','awd',7,8,13,2019,9999,0,false,'WM'],
  ['mercedes','Maybach S','exec','sedan',220000,19,496,4,7,'auto','awd',8,9,15,2016,9999,2020,false,'WM'],
  ['mercedes','Maybach GLS','exec','suv',200000,18,550,4,7,'auto','awd',8,9,15,2021,9999,0,false,'WM'],
  ['mercedes','SL','sport','cabrio',140000,20,476,2,7,'auto','rwd',7,8,14,2007,9999,0,false,'WM'],
  ['mercedes','SLC','sport','cabrio',60000,26,241,2,7,'auto','rwd',5,6,12,2016,2020,0,false,'WM'],
  ['mercedes','GLK','suv','suv',40000,25,268,5,7,'auto','awd',4,5,13,2010,2015,0,false,'WM'],
  ['mercedes','V-Class','van','van',65000,22,237,8,7,'auto','rwd',4,5,13,2014,9999,0,false,'WM'],
  ['mercedes','G63 6x6','suv','pickup',500000,10,536,4,6,'auto','awd',9,10,15,2013,2015,0,false,'WM'],

  /* ============ AUDI (DE, T3) ============ */
  ['audi','A1','compact','hatch',38000,32,116,5,7,'auto','fwd',4,4,12,2010,9999,0,false,'WM'],
  ['audi','A2','compact','hatch',25000,38,75,4,6,'man','fwd',2,2,11,2000,2005,0,false,'WM'],
  ['audi','A3','compact','hatch',42000,30,150,5,7,'auto','fwd',4,5,12,2007,9999,2019,false,'WM'],
  ['audi','A4','lux','sedan',48000,28,201,5,7,'auto','fwd',5,5,12,2007,9999,2019,false,'WM'],
  ['audi','A5','lux','coupe',55000,27,201,4,7,'auto','fwd',5,5,12,2007,9999,2019,false,'WM'],
  ['audi','A6','exec','sedan',75000,25,255,5,7,'auto','fwd',5,6,13,2007,9999,2019,false,'WM'],
  ['audi','A7','exec','sedan',85000,24,255,5,7,'auto','fwd',6,6,13,2007,9999,2019,false,'WM'],
  ['audi','A8','exec','sedan',105000,22,335,5,7,'auto','awd',6,7,14,2007,9999,2020,false,'WM'],
  ['audi','Q2','suv','cross',40000,30,150,5,7,'auto','fwd',4,4,12,2017,9999,0,false,'WM'],
  ['audi','Q3','suv','cross',50000,28,184,5,7,'auto','fwd',5,5,12,2011,9999,2020,false,'WM'],
  ['audi','Q5','suv','suv',62000,26,261,5,7,'auto','fwd',5,6,13,2007,9999,2020,false,'WM'],
  ['audi','Q7','suv','suv',90000,22,335,7,7,'auto','awd',6,6,14,2007,9999,2020,false,'WM'],
  ['audi','Q8','suv','suv',110000,20,335,5,7,'auto','awd',6,7,14,2019,9999,0,false,'WM'],
  ['audi','TT','sport','coupe',55000,26,228,2,7,'auto','awd',5,6,13,2007,9999,2023,false,'WM'],
  ['audi','RS3','sport','sedan',65000,22,401,5,7,'auto','awd',6,6,12,2011,9999,0,false,'WM'],
  ['audi','RS4','sport','wagon',85000,20,444,5,7,'auto','awd',7,6,13,2007,9999,0,false,'WM'],
  ['audi','RS5','sport','coupe',90000,20,444,4,7,'auto','awd',7,7,13,2010,9999,0,false,'WM'],
  ['audi','RS6 Avant','sport','wagon',125000,18,591,5,7,'auto','awd',8,8,13,2007,9999,0,false,'WM'],
  ['audi','RS7','sport','sedan',130000,18,591,4,7,'auto','awd',8,8,13,2014,9999,0,false,'WM'],
  ['audi','R8 V8','sport','coupe',115000,18,420,2,7,'auto','awd',7,8,13,2007,2015,0,false,'WM'],
  ['audi','R8 V10','sport','coupe',150000,17,540,2,7,'auto','awd',8,9,13,2009,9999,0,false,'WM'],
  ['audi','e-tron','suv','suv',90000,90,402,5,7,'auto','awd',6,6,12,2019,9999,0,true,'WM'],
  ['audi','Q4 e-tron','suv','cross',65000,108,282,5,7,'auto','rwd',5,6,12,2021,9999,0,true,'WM'],
  ['audi','Q8 e-tron','suv','suv',100000,95,402,5,7,'auto','awd',6,6,12,2024,9999,0,true,'WM'],
  ['audi','e-tron GT','sport','sedan',140000,95,522,4,7,'auto','awd',7,7,13,2021,9999,0,true,'WM'],

  /* ============ VOLVO (SE, T3) ============ */
  ['volvo','XC40','suv','cross',45000,28,248,5,8,'auto','fwd',4,4,12,2018,9999,2019,false,'WM'],
  ['volvo','XC60','suv','suv',60000,26,250,5,8,'auto','awd',5,5,13,2007,9999,2017,false,'WM'],
  ['volvo','XC90','suv','suv',85000,23,250,7,8,'auto','awd',6,6,13,2007,9999,2016,false,'WM'],
  ['volvo','S60','lux','sedan',50000,28,250,5,8,'auto','fwd',4,4,12,2007,9999,2019,false,'WM'],
  ['volvo','S90','exec','sedan',75000,26,295,5,8,'auto','fwd',5,5,13,2016,9999,2018,false,'WM'],
  ['volvo','V60','lux','wagon',52000,28,250,5,8,'auto','fwd',4,4,12,2012,9999,0,false,'WM'],
  ['volvo','V90','exec','wagon',70000,26,295,5,8,'auto','fwd',5,5,13,2016,9999,0,false,'WM'],
  ['volvo','C30','compact','hatch',28000,30,227,4,8,'man','fwd',3,3,12,2007,2013,0,false,'WM'],
  ['volvo','EX30','suv','cross',45000,120,422,5,8,'auto','rwd',5,5,12,2023,9999,0,true,'WM'],
  ['volvo','EX90','suv','suv',95000,110,510,7,8,'auto','awd',6,6,13,2023,9999,0,true,'WM'],
  ['volvo','C40','suv','cross',55000,100,402,5,8,'auto','rwd',5,5,12,2022,9999,0,true,'WM'],

  /* ============ LEXUS (JP, T3) ============ */
  ['lexus','IS','lux','sedan',55000,26,311,5,10,'auto','rwd',5,5,12,2007,9999,2020,false,'WM'],
  ['lexus','ES','lux','sedan',60000,28,302,5,10,'auto','fwd',5,5,13,2007,9999,2021,false,'WM'],
  ['lexus','GS','exec','sedan',75000,24,311,5,10,'auto','rwd',5,6,13,2007,2020,0,false,'WM'],
  ['lexus','LS','exec','sedan',120000,23,416,5,10,'auto','rwd',6,7,14,2007,9999,2017,false,'WM'],
  ['lexus','UX','suv','cross',50000,30,169,5,10,'auto','fwd',4,4,12,2019,9999,0,false,'WM'],
  ['lexus','NX','suv','cross',65000,27,275,5,10,'auto','fwd',5,5,13,2015,9999,2021,false,'G'],
  ['lexus','RX','suv','suv',80000,25,295,5,10,'auto','awd',5,6,13,2007,9999,2022,false,'G'],
  ['lexus','GX','suv','suv',95000,20,301,7,10,'auto','awd',6,6,14,2007,9999,0,false,'M'],
  ['lexus','LX','suv','suv',140000,18,409,7,10,'auto','awd',7,7,15,2007,9999,0,false,'M'],
  ['lexus','RC','sport','coupe',55000,24,311,4,10,'auto','rwd',5,6,12,2015,9999,0,false,'WM'],
  ['lexus','LC','sport','coupe',120000,22,471,4,10,'auto','rwd',6,7,13,2017,9999,0,false,'WM'],
  ['lexus','LFA','sport','coupe',400000,14,552,2,9,'auto','rwd',9,10,15,2011,2012,0,false,'WM'],
  ['lexus','RZ','suv','cross',70000,105,313,5,10,'auto','awd',5,6,12,2023,9999,0,true,'WM'],
  ['lexus','LM','exec','minivan',120000,26,250,4,10,'auto','fwd',7,8,13,2020,9999,2020,true,'M'],

  /* ============ LAND ROVER (UK, T3) ============ */
  ['landrover','Discovery Sport','suv','suv',58000,24,246,5,5,'auto','awd',5,5,13,2015,9999,0,false,'WM'],
  ['landrover','Discovery','suv','suv',85000,22,355,7,5,'auto','awd',6,6,14,2007,9999,2018,false,'WM'],
  ['landrover','Defender','suv','suv',95000,20,395,5,5,'auto','awd',6,6,14,2020,9999,2021,true,'WM'],
  ['landrover','Range Rover Evoque','suv','cross',65000,26,246,5,5,'auto','awd',5,6,13,2011,9999,2020,false,'WM'],
  ['landrover','Range Rover Velar','suv','suv',85000,24,246,5,5,'auto','awd',5,6,13,2017,9999,2021,false,'WM'],
  ['landrover','Range Rover Sport','suv','suv',105000,22,355,5,5,'auto','awd',6,7,14,2007,9999,2019,false,'WM'],
  ['landrover','Range Rover','suv','suv',140000,20,395,5,5,'auto','awd',7,8,15,2007,9999,2019,false,'WM'],
  ['landrover','Defender 130','suv','suv',110000,18,395,8,5,'auto','awd',6,6,14,2022,9999,0,false,'WM'],
  ['landrover','Freelander','suv','suv',35000,22,230,5,5,'auto','awd',3,4,12,2007,2015,0,false,'WM'],

  /* ============ JAGUAR (UK, T3) ============ */
  ['jaguar','XE','lux','sedan',60000,26,247,5,5,'auto','rwd',5,5,12,2015,9999,0,false,'WM'],
  ['jaguar','XF','lux','sedan',75000,25,296,5,5,'auto','rwd',5,6,13,2007,9999,2020,false,'WM'],
  ['jaguar','XJ','exec','sedan',95000,22,340,5,5,'auto','rwd',6,7,14,2007,2019,0,false,'WM'],
  ['jaguar','F-Type','sport','coupe',75000,22,296,2,5,'auto','rwd',6,7,13,2014,9999,0,false,'WM'],
  ['jaguar','F-Pace','suv','suv',80000,23,246,5,5,'auto','awd',5,6,13,2016,9999,2020,false,'WM'],
  ['jaguar','E-Pace','suv','cross',60000,25,246,5,5,'auto','awd',5,5,12,2017,9999,0,false,'WM'],
  ['jaguar','I-Pace','suv','cross',90000,90,394,5,5,'auto','awd',6,6,12,2018,9999,0,true,'WM'],

  /* ============ CUPRA (ES, T2) ============ */
  ['cupra','Formentor','suv','cross',42000,28,306,5,7,'auto','awd',4,5,12,2020,9999,0,false,'WM'],
  ['cupra','Leon','compact','hatch',35000,30,296,5,7,'auto','fwd',4,4,12,2020,9999,2020,false,'WM'],
  ['cupra','Born','compact','hatch',45000,110,201,5,7,'auto','rwd',4,4,11,2021,9999,0,true,'WM'],
  ['cupra','Ateca','suv','suv',48000,26,296,5,7,'auto','awd',4,4,12,2018,9999,0,false,'WM'],

  /* ============ GENESIS (KR, T3) ============ */
  ['genesis','G70','lux','sedan',45000,26,252,5,8,'auto','rwd',5,5,12,2019,9999,0,false,'WM'],
  ['genesis','G80','exec','sedan',60000,24,300,5,8,'auto','rwd',5,6,13,2016,9999,0,false,'WM'],
  ['genesis','G90','exec','sedan',85000,22,375,5,8,'auto','rwd',6,6,13,2017,9999,0,false,'WM'],
  ['genesis','GV70','suv','suv',55000,24,300,5,8,'auto','awd',5,6,12,2021,9999,0,false,'WM'],
  ['genesis','GV80','suv','suv',70000,22,375,7,8,'auto','awd',6,6,13,2020,9999,0,false,'WM'],
  ['genesis','GV60','suv','cross',65000,105,314,5,8,'auto','awd',5,6,12,2023,9999,0,true,'WM'],

  /* ============ ALFA ROMEO (IT, T3) ============ */
  ['alfaromeo','Giulia','lux','sedan',55000,26,280,5,5,'auto','rwd',5,6,13,2016,9999,0,false,'WM'],
  ['alfaromeo','Stelvio','suv','suv',65000,24,280,5,5,'auto','awd',5,6,13,2017,9999,0,false,'WM'],
  ['alfaromeo','Tonale','suv','cross',45000,28,256,5,5,'auto','awd',4,5,12,2023,9999,2023,true,'WM'],
  ['alfaromeo','Giulietta','compact','hatch',38000,28,240,5,5,'auto','fwd',4,4,12,2010,2020,0,false,'WM'],
  ['alfaromeo','4C','sport','coupe',70000,28,237,2,5,'auto','rwd',6,7,12,2014,2020,0,false,'WM'],

  /* ============ CADILLAC (US, T3) ============ */
  ['cadillac','CT4','lux','sedan',45000,24,237,5,7,'auto','rwd',5,6,12,2020,9999,0,false,'W'],
  ['cadillac','CT5','lux','sedan',55000,23,237,5,7,'auto','rwd',5,6,13,2020,9999,0,false,'W'],
  ['cadillac','CTS','lux','sedan',48000,22,268,5,7,'auto','rwd',4,5,13,2007,2019,0,false,'W'],
  ['cadillac','Escalade','suv','suv',85000,18,420,7,7,'auto','awd',6,7,14,2007,9999,0,false,'WM'],
  ['cadillac','XT4','suv','cross',40000,26,237,5,7,'auto','fwd',4,4,12,2019,9999,0,false,'W'],
  ['cadillac','XT5','suv','suv',52000,24,235,5,7,'auto','fwd',5,5,13,2017,9999,0,false,'W'],
  ['cadillac','XT6','suv','suv',58000,22,310,7,7,'auto','awd',5,5,13,2020,9999,0,false,'W'],
  ['cadillac','Lyriq','suv','cross',65000,95,340,5,7,'auto','rwd',5,6,12,2023,9999,0,true,'W'],

  /* ============ LINCOLN (US, T3) ============ */
  ['lincoln','Corsair','suv','cross',45000,26,250,5,7,'auto','fwd',5,5,12,2020,9999,0,false,'W'],
  ['lincoln','Nautilus','suv','suv',55000,24,250,5,7,'auto','awd',5,5,13,2019,9999,0,false,'W'],
  ['lincoln','Aviator','suv','suv',65000,22,400,7,7,'auto','awd',5,6,13,2020,9999,2020,true,'W'],
  ['lincoln','Navigator','suv','suv',90000,18,440,7,7,'auto','awd',6,7,14,2007,9999,0,false,'W'],
  ['lincoln','Continental','exec','sedan',60000,20,305,5,7,'auto','awd',5,6,13,2017,2020,0,false,'W'],

  /* ============ INFINITI (JP, T3) ============ */
  ['infiniti','Q50','lux','sedan',48000,26,300,5,8,'auto','rwd',5,6,12,2014,9999,0,false,'WM'],
  ['infiniti','Q60','lux','coupe',52000,24,300,4,8,'auto','rwd',5,6,12,2017,2022,0,false,'WM'],
  ['infiniti','QX50','suv','cross',45000,25,268,5,8,'cvt','fwd',4,5,12,2014,9999,0,false,'WM'],
  ['infiniti','QX60','suv','suv',60000,23,295,7,8,'auto','awd',5,5,13,2014,9999,0,false,'WM'],
  ['infiniti','QX80','suv','suv',80000,18,400,7,8,'auto','awd',6,6,14,2014,9999,0,false,'M'],

  /* ============ ACURA (JP, T3) ============ */
  ['acura','TLX','lux','sedan',48000,26,272,5,9,'auto','fwd',5,5,12,2015,9999,0,false,'W'],
  ['acura','RDX','suv','suv',50000,24,272,5,9,'auto','fwd',5,5,13,2007,9999,0,false,'W'],
  ['acura','MDX','suv','suv',60000,22,290,7,9,'auto','awd',5,6,13,2007,9999,0,false,'W'],
  ['acura','Integra','compact','sedan',35000,32,200,5,9,'man','fwd',4,4,12,2023,9999,0,false,'W'],

  /* ============ POLESTAR (SE, T3) ============ */
  ['polestar','1','sport','coupe',150000,45,600,4,7,'auto','awd',7,7,12,2020,2022,2020,true,'WM'],
  ['polestar','2','lux','sedan',55000,105,299,5,7,'auto','rwd',5,5,12,2020,9999,0,true,'WM'],
  ['polestar','3','suv','suv',80000,100,489,5,7,'auto','awd',5,6,12,2024,9999,0,true,'WM'],
  ['polestar','4','suv','coupe',65000,102,272,5,7,'auto','rwd',5,5,12,2024,9999,0,true,'WM'],

  /* ============ NIO / XPENG / ZEEKR (CN, T3) ============ */
  ['nio','ES8','suv','suv',65000,95,536,7,6,'auto','awd',5,5,12,2018,9999,0,true,'WM'],
  ['nio','ET7','exec','sedan',70000,100,644,5,6,'auto','awd',6,6,12,2022,9999,0,true,'WM'],
  ['xpeng','P7','lux','sedan',45000,110,262,5,6,'auto','rwd',5,4,12,2020,9999,0,true,'WM'],
  ['xpeng','G9','suv','suv',60000,105,308,5,6,'auto','rwd',5,5,12,2022,9999,0,true,'WM'],
  ['zeekr','001','exec','wagon',55000,115,268,5,7,'auto','rwd',5,5,12,2021,9999,0,true,'WM'],
  ['zeekr','X','suv','cross',42000,110,268,5,7,'auto','rwd',4,4,12,2023,9999,0,true,'WM'],

  /* ============ OPEL (DE, T2) ============ */
  ['opel','Corsa','econ','hatch',17000,35,75,5,6,'man','fwd',1,1,11,2007,9999,0,false,'WM'],
  ['opel','Astra','compact','hatch',22000,32,130,5,6,'auto','fwd',2,2,12,2007,9999,0,false,'WM'],
  ['opel','Mokka','suv','cross',24000,30,100,5,6,'auto','fwd',2,2,11,2012,9999,0,false,'WM'],
  ['opel','Crossland','suv','cross',23000,31,110,5,6,'auto','fwd',2,2,11,2017,9999,0,false,'WM'],
  ['opel','Grandland','suv','suv',30000,28,130,5,6,'auto','fwd',3,2,12,2017,9999,0,false,'WM'],
  ['opel','Insignia','mid','sedan',32000,28,170,5,6,'auto','fwd',3,2,13,2008,9999,0,false,'WM'],

  /* ============ SEAT (ES, T2) ============ */
  ['seat','Ibiza','econ','hatch',18000,33,95,5,7,'auto','fwd',2,1,11,2007,9999,0,false,'WM'],
  ['seat','Leon','compact','hatch',24000,31,150,5,7,'auto','fwd',3,2,12,2007,9999,0,false,'WM'],
  ['seat','Ateca','suv','cross',32000,28,150,5,7,'auto','fwd',3,2,12,2016,9999,0,false,'WM'],
  ['seat','Tarraco','suv','suv',42000,25,190,7,7,'auto','awd',4,3,13,2018,9999,0,false,'WM'],
  ['seat','Arona','suv','cross',22000,32,115,5,7,'auto','fwd',2,1,11,2017,9999,0,false,'WM'],

  /* ============ SSANGYONG / KGM (KR, T2) ============ */
  ['ssangyong','Tivoli','suv','cross',22000,28,128,5,6,'auto','fwd',2,2,11,2015,9999,0,false,'WM'],
  ['ssangyong','Korando','suv','cross',26000,26,148,5,6,'auto','fwd',3,2,12,2019,9999,0,false,'WM'],
  ['ssangyong','Rexton','suv','suv',38000,22,202,7,6,'auto','awd',4,3,13,2017,9999,0,false,'WM'],
  ['ssangyong','Musso','truck','pickup',30000,23,181,5,6,'auto','awd',3,2,13,2018,9999,0,false,'WM'],

  /* ============ PORSCHE (DE, T4) ============ */
  ['porsche','911 Carrera','sport','coupe',130000,22,379,4,7,'auto','rwd',7,8,15,2007,9999,0,false,'WM'],
  ['porsche','911 Turbo','sport','coupe',220000,18,572,4,7,'auto','awd',9,9,15,2007,9999,0,false,'WM'],
  ['porsche','911 GT3','sport','coupe',200000,18,502,2,7,'auto','rwd',8,9,15,2014,9999,0,false,'WM'],
  ['porsche','911 GT3 RS','sport','coupe',260000,16,518,2,7,'auto','rwd',9,10,15,2015,9999,0,false,'WM'],
  ['porsche','Cayenne','suv','suv',105000,20,335,5,7,'auto','awd',6,7,14,2007,9999,2019,false,'WM'],
  ['porsche','Macan','suv','cross',75000,22,261,5,7,'auto','awd',5,6,13,2014,9999,2020,false,'WM'],
  ['porsche','Macan EV','suv','cross',85000,105,402,5,7,'auto','awd',6,6,12,2024,9999,0,true,'WM'],
  ['porsche','Panamera','exec','sedan',140000,22,325,4,7,'auto','rwd',6,7,14,2009,9999,2019,false,'WM'],
  ['porsche','Taycan','sport','sedan',160000,85,402,4,7,'auto','rwd',7,7,13,2020,9999,0,true,'WM'],
  ['porsche','Taycan Cross Turismo','sport','wagon',170000,82,469,4,7,'auto','awd',7,7,13,2021,9999,0,true,'WM'],
  ['porsche','718 Boxster','sport','cabrio',95000,24,300,2,7,'auto','rwd',6,7,14,2016,9999,0,false,'WM'],
  ['porsche','718 Cayman','sport','coupe',95000,24,300,2,7,'auto','rwd',6,7,14,2016,9999,0,false,'WM'],
  ['porsche','918 Spyder','hyper','cabrio',1500000,30,887,2,6,'auto','awd',10,10,15,2013,2015,2013,false,'WM'],
  ['porsche','Carrera GT','hyper','cabrio',1200000,12,605,2,6,'man','rwd',10,10,15,2004,2007,0,false,'WM'],

  /* ============ TESLA (US, T4) ============ */
  ['tesla','Model 3','mid','sedan',40000,130,271,5,7,'auto','rwd',5,5,12,2017,9999,0,true,'WM'],
  ['tesla','Model Y','suv','cross',45000,120,384,5,7,'auto','rwd',5,5,12,2020,9999,0,true,'WM'],
  ['tesla','Model S','exec','sedan',90000,100,670,5,7,'auto','rwd',7,8,12,2012,9999,0,true,'WM'],
  ['tesla','Model S Plaid','exec','sedan',120000,95,1020,5,7,'auto','awd',8,9,12,2021,9999,0,true,'WM'],
  ['tesla','Model X','suv','suv',105000,95,670,7,7,'auto','awd',7,8,12,2015,9999,0,true,'WM'],
  ['tesla','Cybertruck','truck','pickup',80000,90,600,6,6,'auto','awd',7,9,12,2023,9999,0,true,'W'],
  ['tesla','Roadster','sport','cabrio',150000,110,248,2,6,'auto','rwd',7,8,11,2008,2012,0,true,'W'],

  /* ============ RIVIAN / LUCID (US, T4) ============ */
  ['rivian','R1T','truck','pickup',75000,70,835,5,5,'auto','awd',6,8,12,2022,9999,0,true,'W'],
  ['rivian','R1S','suv','suv',80000,70,835,7,5,'auto','awd',6,8,12,2022,9999,0,true,'W'],
  ['lucid','Air','exec','sedan',90000,120,620,5,5,'auto','rwd',7,8,12,2021,9999,0,true,'W'],
  ['lucid','Air Sapphire','exec','sedan',250000,110,1234,5,5,'auto','awd',9,9,12,2023,9999,0,true,'W'],

  /* ============ MASERATI (IT, T4) ============ */
  ['maserati','Ghibli','exec','sedan',95000,22,345,5,4,'auto','rwd',6,6,13,2013,9999,0,false,'WM'],
  ['maserati','Levante','suv','suv',115000,20,345,5,4,'auto','awd',6,7,14,2016,9999,0,false,'WM'],
  ['maserati','Grecale','suv','cross',90000,22,296,5,4,'auto','awd',6,6,13,2022,9999,0,false,'WM'],
  ['maserati','Quattroporte','exec','sedan',130000,20,424,5,4,'auto','rwd',7,7,14,2007,9999,2023,false,'WM'],
  ['maserati','MC20','sport','coupe',250000,18,621,2,4,'auto','rwd',8,9,14,2021,9999,0,false,'WM'],
  ['maserati','GranTurismo','sport','coupe',170000,18,483,4,4,'auto','awd',7,8,14,2007,9999,0,false,'WM'],

  /* ============ LOTUS / ALPINE (UK/FR, T4) ============ */
  ['lotus','Evora','sport','coupe',100000,21,400,4,5,'man','rwd',7,7,14,2009,2021,0,false,'WM'],
  ['lotus','Emira','sport','coupe',95000,22,360,2,5,'man','rwd',7,8,14,2022,9999,0,false,'WM'],
  ['lotus','Eletre','suv','suv',120000,95,603,5,5,'auto','awd',6,7,12,2023,9999,0,true,'WM'],
  ['alpine','A110','sport','coupe',75000,32,248,2,6,'auto','rwd',7,7,13,2017,9999,0,false,'WM'],

  /* ============ BENTLEY (UK, T5) ============ */
  ['bentley','Continental GT','exec','coupe',220000,18,542,4,5,'auto','awd',8,9,16,2007,9999,0,false,'WM'],
  ['bentley','Bentayga','suv','suv',230000,17,542,5,5,'auto','awd',8,9,16,2015,9999,0,false,'WM'],
  ['bentley','Flying Spur','exec','sedan',250000,18,542,5,5,'auto','awd',8,9,16,2007,9999,0,false,'WM'],
  ['bentley','Continental GTC','exec','cabrio',240000,18,542,4,5,'auto','awd',8,9,15,2007,9999,0,false,'WM'],
  ['bentley','Mulsanne','exec','sedan',350000,15,505,5,5,'auto','rwd',9,9,16,2010,2020,0,false,'WM'],

  /* ============ ROLLS-ROYCE (UK, T5) ============ */
  ['rollsroyce','Ghost','exec','sedan',350000,15,563,5,6,'auto','rwd',10,10,20,2010,9999,0,false,'WM'],
  ['rollsroyce','Phantom','exec','sedan',500000,14,563,5,6,'auto','rwd',10,10,20,2007,9999,0,false,'WM'],
  ['rollsroyce','Cullinan','suv','suv',450000,14,563,5,6,'auto','awd',10,10,20,2018,9999,0,false,'WM'],
  ['rollsroyce','Spectre','exec','coupe',480000,90,577,4,6,'auto','awd',10,10,18,2023,9999,0,true,'WM'],
  ['rollsroyce','Wraith','exec','coupe',400000,15,624,4,6,'auto','rwd',10,10,19,2013,9999,2023,false,'WM'],
  ['rollsroyce','Dawn','exec','cabrio',420000,15,563,4,6,'auto','rwd',10,10,19,2015,2023,0,false,'WM'],

  /* ============ FERRARI (IT, T5) ============ */
  ['ferrari','F430','sport','coupe',180000,13,483,2,5,'auto','rwd',8,9,15,2004,2009,0,false,'WM'],
  ['ferrari','458 Italia','sport','coupe',250000,14,562,2,5,'auto','rwd',9,10,15,2009,2015,0,false,'WM'],
  ['ferrari','488 GTB','sport','coupe',280000,16,661,2,5,'auto','rwd',9,10,15,2015,2019,0,false,'WM'],
  ['ferrari','F8 Tributo','sport','coupe',300000,15,710,2,5,'auto','rwd',9,10,15,2019,9999,2023,false,'WM'],
  ['ferrari','Roma','sport','coupe',280000,15,611,4,5,'auto','rwd',9,10,15,2020,9999,0,false,'WM'],
  ['ferrari','296 GTB','sport','coupe',320000,18,819,2,5,'auto','rwd',9,10,15,2022,9999,2022,true,'WM'],
  ['ferrari','SF90','sport','coupe',500000,18,986,2,5,'auto','awd',10,10,14,2020,9999,2020,true,'WM'],
  ['ferrari','Purosangue','suv','suv',420000,15,715,4,5,'auto','awd',9,10,15,2023,9999,0,false,'WM'],
  ['ferrari','812 Superfast','sport','coupe',400000,13,789,2,5,'auto','rwd',9,10,15,2017,9999,2024,false,'WM'],
  ['ferrari','Enzo','hyper','coupe',3000000,10,651,2,5,'auto','rwd',10,10,15,2002,2004,0,false,'WM'],
  ['ferrari','LaFerrari','hyper','coupe',4000000,14,950,2,5,'auto','rwd',10,10,15,2013,2016,2013,false,'WM'],

  /* ============ LAMBORGHINI (IT, T5) ============ */
  ['lamborghini','Gallardo','sport','coupe',180000,14,500,2,4,'auto','awd',8,9,15,2003,2013,0,false,'WM'],
  ['lamborghini','Huracan','sport','coupe',280000,15,631,2,4,'auto','awd',9,10,15,2014,9999,0,false,'WM'],
  ['lamborghini','Urus','suv','suv',280000,15,641,5,4,'auto','awd',9,10,15,2018,9999,2022,false,'WM'],
  ['lamborghini','Murcielago','sport','coupe',350000,11,631,2,4,'man','awd',9,10,15,2001,2010,0,false,'WM'],
  ['lamborghini','Aventador','sport','coupe',450000,12,769,2,4,'auto','awd',10,10,15,2011,9999,2023,false,'WM'],
  ['lamborghini','Revuelto','sport','coupe',550000,17,1001,2,4,'auto','awd',10,10,14,2023,9999,2023,true,'WM'],
  ['lamborghini','Countach LPI','hyper','coupe',2600000,13,803,2,4,'auto','awd',10,10,15,2022,2022,2022,false,'WM'],

  /* ============ ASTON MARTIN (UK, T5) ============ */
  ['astonmartin','Vantage','sport','coupe',200000,18,656,2,4,'auto','rwd',8,9,15,2007,9999,0,false,'WM'],
  ['astonmartin','DB11','exec','coupe',250000,17,600,4,4,'auto','rwd',8,9,15,2016,9999,2023,false,'WM'],
  ['astonmartin','DB12','exec','coupe',280000,17,671,4,4,'auto','rwd',8,9,15,2023,9999,0,false,'WM'],
  ['astonmartin','DBS','exec','coupe',330000,15,715,4,4,'auto','rwd',9,10,15,2018,9999,0,false,'WM'],
  ['astonmartin','DBX','suv','suv',240000,17,542,5,4,'auto','awd',8,9,15,2020,9999,0,false,'WM'],
  ['astonmartin','Valkyrie','hyper','coupe',3000000,15,1140,2,4,'auto','rwd',10,10,15,2021,9999,2021,false,'WM'],

  /* ============ MCLAREN (UK, T5) ============ */
  ['mclaren','570S','sport','coupe',190000,18,562,2,4,'auto','rwd',8,9,14,2015,2021,0,false,'WM'],
  ['mclaren','650S','sport','coupe',260000,16,641,2,4,'auto','rwd',8,9,14,2014,2017,0,false,'WM'],
  ['mclaren','720S','sport','coupe',320000,15,710,2,4,'auto','rwd',9,10,14,2017,9999,2023,false,'WM'],
  ['mclaren','750S','sport','coupe',340000,16,740,2,4,'auto','rwd',9,10,14,2023,9999,0,false,'WM'],
  ['mclaren','Artura','sport','coupe',240000,20,671,2,4,'auto','rwd',9,10,14,2021,9999,2023,true,'WM'],
  ['mclaren','P1','hyper','coupe',1500000,16,903,2,4,'auto','rwd',10,10,14,2013,2015,2013,false,'WM'],
  ['mclaren','Senna','hyper','coupe',1000000,14,789,2,4,'auto','rwd',10,10,14,2018,2020,0,false,'WM'],
  ['mclaren','Speedtail','hyper','coupe',2200000,15,1036,3,4,'auto','rwd',10,10,14,2020,2021,2020,false,'WM'],

  /* ============ BUGATTI (FR, T5) ============ */
  ['bugatti','Veyron','hyper','coupe',2000000,10,1001,2,4,'auto','awd',10,10,20,2005,2015,0,false,'WM'],
  ['bugatti','Chiron','hyper','coupe',3000000,12,1479,2,4,'auto','awd',10,10,20,2016,9999,2024,false,'WM'],
  ['bugatti','Divo','hyper','coupe',5800000,11,1479,2,4,'auto','awd',10,10,20,2019,2021,0,false,'WM'],
  ['bugatti','Tourbillon','hyper','coupe',4000000,15,1800,2,4,'auto','awd',10,10,20,2024,9999,2024,false,'WM'],

  /* ============ PAGANI / KOENIGSEGG / RIMAC (T5) ============ */
  ['pagani','Zonda','hyper','coupe',2500000,11,749,2,4,'man','rwd',10,10,20,1999,2019,0,false,'WM'],
  ['pagani','Huayra','hyper','coupe',3500000,12,730,2,4,'auto','rwd',10,10,20,2011,2022,0,false,'WM'],
  ['pagani','Utopia','hyper','coupe',2500000,13,852,2,4,'man','rwd',10,10,20,2023,9999,0,false,'WM'],
  ['koenigsegg','Agera RS','hyper','coupe',2500000,12,1160,2,5,'auto','rwd',10,10,15,2015,2018,0,false,'WM'],
  ['koenigsegg','Regera','hyper','coupe',2000000,15,1500,2,5,'auto','rwd',10,10,15,2016,2022,2016,false,'WM'],
  ['koenigsegg','Jesko','hyper','coupe',3000000,11,1600,2,5,'auto','rwd',10,10,15,2020,9999,0,false,'WM'],
  ['koenigsegg','Gemera','hyper','coupe',1700000,18,1700,4,5,'auto','awd',10,10,15,2022,9999,2022,false,'WM'],
  ['rimac','Nevera','hyper','coupe',2400000,110,1914,2,5,'auto','awd',10,10,12,2021,9999,0,true,'WM']

];

/* ============================================================
   Lookup helpers (used by view)
   ============================================================ */
const CAR_MARKETS = {
  G:  ['egy','usa','sau','uae','uk','can','deu','tur','ind','bra'],
  M:  ['egy','sau','uae','tur'],
  W:  ['usa','uk','can','deu'],
  ME: ['egy','sau','uae','tur','ind'],
  WM: ['usa','uk','can','deu','egy','sau','uae'],
  E:  ['egy'],
  AS: ['ind','tur']
};

// All pure functions - no state
function carModelById(brand, modelName) {
  return CAR_MODELS.find(function(m) { return m[0] === brand && m[1] === modelName; }) || null;
}
function carModelsByBrand(brand, year) {
  year = year || 2026;
  return CAR_MODELS.filter(function(m) {
    return m[0] === brand && year >= m[14] && year <= m[15];
  });
}
function carModelInMarket(model, country) {
  if (!model) return false;
  var markets = CAR_MARKETS[model[18]] || CAR_MARKETS.G;
  return markets.indexOf(country) >= 0;
}
