/* ============================================================
   WORLD LIFE — DATA: SHOPPING
   ============================================================
   Pure data. Prefix SHOP_ to avoid collision.
   Base prices in USD; country multipliers + currency conversion
   handled by view. Egyptian electronics get heavy import markup
   to match real 2026 prices.

   PRODUCT TUPLE: [brand, name, cat, subcat, baseUSD, hap, soc, lifeYears, desc, fromYear?, untilYear?]
   ============================================================ */

/* ---------- COUNTRY × CATEGORY MULTIPLIERS ---------- */
const SHOP_MULT = {
  egy: { phone: 1.55, tablet: 1.55, laptop: 1.55, tv: 1.50, audio: 1.50, watch: 1.30, appliances: 1.40, furniture: 1.20, fashion: 1.15, luxury: 1.10, bag: 1.10 },
  usa: { phone: 1.00, tablet: 1.00, laptop: 1.00, tv: 1.00, audio: 1.00, watch: 1.00, appliances: 1.00, furniture: 1.00, fashion: 1.00, luxury: 1.00, bag: 1.00 },
  sau: { phone: 1.15, tablet: 1.15, laptop: 1.15, tv: 1.15, audio: 1.15, watch: 1.05, appliances: 1.10, furniture: 1.05, fashion: 1.10, luxury: 1.05, bag: 1.05 },
  uae: { phone: 1.10, tablet: 1.10, laptop: 1.10, tv: 1.10, audio: 1.10, watch: 1.00, appliances: 1.05, furniture: 1.05, fashion: 1.05, luxury: 1.00, bag: 1.00 },
  uk:  { phone: 1.20, tablet: 1.20, laptop: 1.20, tv: 1.20, audio: 1.20, watch: 1.05, appliances: 1.15, furniture: 1.10, fashion: 1.10, luxury: 1.05, bag: 1.05 },
  deu: { phone: 1.15, tablet: 1.15, laptop: 1.15, tv: 1.15, audio: 1.15, watch: 1.05, appliances: 1.10, furniture: 1.10, fashion: 1.10, luxury: 1.05, bag: 1.05 }
};
/* ---------- WARRANTY DEFAULTS (years) ---------- */
/* Base warranty by category. View adjusts upward for luxury tier. */
const SHOP_WARRANTY_YEARS = {
  phone: 1,
  tablet: 2,
  laptop: 2,
  desktop: 2,
  tv: 2,
  audio: 1,
  watch: 2,
  appliances: 2,
  furniture: 0,
  fashion: 0
};
/* ---------- EXTENDED WARRANTY OPTIONS ---------- */
const SHOP_EXTENDED_WARRANTY = {
  none:    { label: 'None',           multiplier: 0,    extraYears: 0 },
  basic:   { label: '+2 years (+15%)',multiplier: 0.15, extraYears: 2 },
  premium: { label: '+4 years (+30%)',multiplier: 0.30, extraYears: 4 }
};

/* Items eligible for extended warranty (electronics + appliances + TVs + audio) */
const SHOP_WARRANTY_ELIGIBLE = ['phone', 'tablet', 'laptop', 'desktop', 'tv', 'audio', 'watch', 'appliances'];

/* ---------- CARD INSTALLMENT PLANS ---------- */
/* "Real life" credit-card purchase plans */
const SHOP_CARD_INSTALLMENTS = [
  { id: 'full',  months: 0,  fee: 0.00, label: 'Full charge' },
  { id: 'c3mo',  months: 3,  fee: 0.03, label: '3 months (+3%)' },
  { id: 'c6mo',  months: 6,  fee: 0.06, label: '6 months (+6%)' },
  { id: 'c12mo', months: 12, fee: 0.12, label: '12 months (+12%)' }
];
/* ---------- SALES / DISCOUNT EVENTS ---------- */
const SHOP_SALES = [
  { id: 'black_friday', label: 'Black Friday', month: 11, cats: ['phone', 'tablet', 'laptop', 'tv', 'audio', 'appliances', 'fashion'], discount: 0.30 },
  { id: 'white_friday', label: 'White Friday (Noon)', month: 11, cats: ['phone', 'tablet', 'laptop', 'tv', 'audio', 'appliances'], discount: 0.35, countries: ['egy', 'sau', 'uae'] },
  { id: 'ramadan',      label: 'Ramadan Sale',       month: 4,  cats: ['fashion', 'furniture', 'appliances'], discount: 0.20, countries: ['egy', 'sau', 'uae'] },
  { id: 'prime_day',    label: 'Amazon Prime Day',   month: 7,  cats: ['phone', 'tablet', 'laptop', 'tv', 'audio', 'appliances'], discount: 0.25 },
  { id: 'end_summer',   label: 'End of Summer Sale', month: 8,  cats: ['fashion'], discount: 0.40 },
  { id: 'boxing_day',   label: 'Boxing Day',         month: 12, cats: ['phone', 'laptop', 'tv', 'audio', 'appliances', 'fashion', 'furniture'], discount: 0.25, countries: ['uk', 'usa', 'can', 'aus'] },
  { id: 'eid_sale',     label: 'Eid Sale',           month: 6,  cats: ['fashion', 'furniture'], discount: 0.25, countries: ['egy', 'sau', 'uae'] },
  { id: 'back_to_school', label: 'Back to School', month: 8, cats: ['laptop', 'tablet', 'audio', 'fashion', 'bag'], discount: 0.20 }
];

/* ---------- RETAILERS ---------- */
const SHOP_RETAILERS = {
  apple: 'Apple Store',
  samsung: 'Samsung Store',
  google: 'Google Store',
  sony: 'Sony Store',
  lg: 'LG Store',
  bosch: 'Bosch Home',
  smeg: 'SMEG Boutique',
  ikea: 'IKEA',
  home: 'Home Centre',
  amazon: 'Amazon',
  noon: 'Noon',
  jumia: 'Jumia',
  generic: 'Electronics Mall'
};

/* ---------- PHONES ---------- */
const SHOP_PHONES = [
  ['Apple','iPhone 4','phone','smartphone',599,4,4,5,'Retina display, 5MP camera',2010,2013],
  ['Apple','iPhone 4S','phone','smartphone',649,4,4,5,'8MP camera, Siri',2011,2014],
  ['Apple','iPhone 5','phone','smartphone',649,4,4,5,'4" display, LTE',2012,2015],
  ['Apple','iPhone 5s','phone','smartphone',649,4,4,5,'Touch ID, A7 chip',2013,2016],
  ['Apple','iPhone 6','phone','smartphone',649,4,4,6,'4.7" display, NFC',2014,2017],
  ['Apple','iPhone 6 Plus','phone','smartphone',749,4,4,6,'5.5" display',2014,2017],
  ['Apple','iPhone 6s','phone','smartphone',649,4,4,6,'3D Touch, 12MP',2015,2018],
  ['Apple','iPhone SE 2016','phone','smartphone',399,2,2,5,'Compact 4", A9 chip',2016,2019],
  ['Apple','iPhone 7','phone','smartphone',649,4,4,6,'Water resistant, no 3.5mm',2016,2019],
  ['Apple','iPhone 7 Plus','phone','smartphone',769,5,4,6,'Dual camera, portrait mode',2016,2019],
  ['Apple','iPhone 8','phone','smartphone',699,4,4,6,'Wireless charging',2017,2020],
  ['Apple','iPhone X','phone','smartphone',999,6,6,6,'Face ID, OLED',2017,2020],
  ['Apple','iPhone XR','phone','smartphone',749,4,4,6,'6.1" LCD, colours',2018,2021],
  ['Apple','iPhone XS','phone','smartphone',999,5,5,6,'OLED, dual 12MP',2018,2021],
  ['Apple','iPhone XS Max','phone','smartphone',1099,6,5,6,'6.5" OLED',2018,2021],
  ['Apple','iPhone 11','phone','smartphone',699,4,4,6,'Dual camera, night mode',2019,2022],
  ['Apple','iPhone 11 Pro','phone','smartphone',999,5,5,6,'Triple camera, OLED',2019,2022],
  ['Apple','iPhone 11 Pro Max','phone','smartphone',1099,6,5,6,'6.5" OLED',2019,2022],
  ['Apple','iPhone SE 2020','phone','smartphone',399,2,2,5,'A13 chip, compact',2020,2023],
  ['Apple','iPhone 12','phone','smartphone',799,4,4,6,'5G, OLED, MagSafe',2020,2023],
  ['Apple','iPhone 12 Pro','phone','smartphone',999,5,5,6,'LiDAR, ProRAW',2020,2023],
  ['Apple','iPhone 12 Pro Max','phone','smartphone',1099,6,5,6,'6.7" OLED',2020,2023],
  ['Apple','iPhone 13','phone','smartphone',799,4,4,6,'Cinematic mode, A15',2021,2024],
  ['Apple','iPhone 13 Pro','phone','smartphone',999,5,5,6,'120Hz ProMotion',2021,2024],
  ['Apple','iPhone 13 Pro Max','phone','smartphone',1099,6,5,6,'6.7" ProMotion',2021,2024],
  ['Apple','iPhone SE 2022','phone','smartphone',429,2,2,5,'5G, Touch ID',2022,2025],
  ['Apple','iPhone 14','phone','smartphone',799,4,4,6,'Crash detection, satellite SOS',2022,2025],
  ['Apple','iPhone 14 Pro','phone','smartphone',999,5,5,6,'Dynamic Island, 48MP',2022,2025],
  ['Apple','iPhone 14 Pro Max','phone','smartphone',1099,6,5,6,'Always-on display',2022,2025],
  ['Apple','iPhone 15','phone','smartphone',799,4,4,6,'USB-C, 48MP',2023,2026],
  ['Apple','iPhone 15 Pro','phone','smartphone',999,5,5,6,'Titanium, Action button',2023,2026],
  ['Apple','iPhone 15 Pro Max','phone','smartphone',1199,6,5,6,'5x telephoto',2023,2026],
  ['Apple','iPhone 16','phone','smartphone',799,4,4,6,'Camera Control, Apple AI',2024,2027],
  ['Apple','iPhone 16 Plus','phone','smartphone',899,5,4,6,'6.7" display',2024,2027],
  ['Apple','iPhone 16 Pro','phone','smartphone',999,5,5,6,'4K 120fps',2024,2027],
  ['Apple','iPhone 16 Pro Max','phone','smartphone',1199,6,5,6,'6.9" display',2024,2027],
  ['Apple','iPhone 16e','phone','smartphone',599,2,2,6,'Budget modern iPhone',2025,2028],
  ['Apple','iPhone 17','phone','smartphone',799,4,4,6,'6.3" 120Hz, 48MP',2025,2028],
  ['Apple','iPhone 17 Air','phone','smartphone',999,5,5,6,'Ultra-thin design',2025,2028],
  ['Apple','iPhone 17 Pro','phone','smartphone',1099,6,5,6,'48MP triple camera',2025,2028],
  ['Apple','iPhone 17 Pro Max','phone','smartphone',1199,6,6,6,'6.9" longest battery',2025,2028],
  
  ['Samsung','Galaxy S3','phone','smartphone',650,4,4,5,'4.8" AMOLED, S Voice',2012,2015],
  ['Samsung','Galaxy S4','phone','smartphone',650,4,4,5,'5" FHD, 13MP',2013,2016],
  ['Samsung','Galaxy Note 3','phone','smartphone',700,5,4,5,'5.7" display, S Pen',2013,2016],
  ['Samsung','Galaxy S5','phone','smartphone',660,4,4,5,'Water resistant',2014,2017],
  ['Samsung','Galaxy Note 4','phone','smartphone',750,5,4,5,'QHD display',2014,2017],
  ['Samsung','Galaxy S6','phone','smartphone',680,4,4,5,'Glass+metal, 16MP',2015,2018],
  ['Samsung','Galaxy S6 Edge','phone','smartphone',780,5,5,5,'Curved edges',2015,2018],
  ['Samsung','Galaxy S7','phone','smartphone',670,5,4,5,'Water resistant, microSD',2016,2019],
  ['Samsung','Galaxy S7 Edge','phone','smartphone',770,5,5,5,'Curved, larger battery',2016,2019],
  ['Samsung','Galaxy S8','phone','smartphone',720,5,5,5,'Infinity display',2017,2020],
  ['Samsung','Galaxy Note 8','phone','smartphone',930,6,5,5,'Dual cameras, S Pen',2017,2020],
  ['Samsung','Galaxy S9','phone','smartphone',720,5,5,5,'Variable aperture',2018,2021],
  ['Samsung','Galaxy Note 9','phone','smartphone',1000,6,5,5,'Bluetooth S Pen',2018,2021],
  ['Samsung','Galaxy A50','phone','smartphone',349,2,2,5,'6.4" AMOLED',2019,2022],
  ['Samsung','Galaxy S10','phone','smartphone',900,5,5,5,'Triple camera',2019,2022],
  ['Samsung','Galaxy Fold','phone','smartphone',1980,7,7,4,'First foldable, 7.3"',2019,2022],
  ['Samsung','Galaxy S20','phone','smartphone',999,5,5,5,'5G, 120Hz',2020,2023],
  ['Samsung','Galaxy S20 FE','phone','smartphone',699,4,4,5,'Fan Edition, value',2020,2023],
  ['Samsung','Galaxy S20 Ultra','phone','smartphone',1399,6,5,5,'108MP, 100x zoom',2020,2023],
  ['Samsung','Galaxy Z Flip','phone','smartphone',1380,6,6,4,'Clamshell foldable',2020,2023],
  ['Samsung','Galaxy S21','phone','smartphone',799,5,5,5,'Flat 120Hz',2021,2024],
  ['Samsung','Galaxy S21 FE','phone','smartphone',699,4,4,5,'Fan edition',2021,2024],
  ['Samsung','Galaxy S21 Ultra','phone','smartphone',1199,6,5,5,'108MP, S Pen',2021,2024],
  ['Samsung','Galaxy Z Fold 3','phone','smartphone',1799,7,7,5,'Water resistant foldable',2021,2024],
  ['Samsung','Galaxy Z Flip 3','phone','smartphone',999,5,5,5,'Affordable foldable',2021,2024],
  ['Samsung','Galaxy S22','phone','smartphone',799,5,5,5,'50MP, 120Hz',2022,2025],
  ['Samsung','Galaxy S22 Ultra','phone','smartphone',1199,6,6,5,'Built-in S Pen',2022,2025],
  ['Samsung','Galaxy Z Flip 4','phone','smartphone',999,6,6,5,'Slimmer flip',2022,2025],
  ['Samsung','Galaxy Z Fold 4','phone','smartphone',1799,7,7,5,'Refined fold',2022,2025],
  ['Samsung','Galaxy A53','phone','smartphone',449,2,2,5,'6.5" AMOLED',2022,2025],
  ['Samsung','Galaxy S23','phone','smartphone',799,5,5,5,'Snapdragon 8G2',2023,2026],
  ['Samsung','Galaxy S23 FE','phone','smartphone',599,4,4,5,'Fan edition value',2023,2026],
  ['Samsung','Galaxy S23 Ultra','phone','smartphone',1199,6,6,5,'200MP, S Pen',2023,2026],
  ['Samsung','Galaxy Z Fold 5','phone','smartphone',1799,7,7,5,'Thinner hinge',2023,2026],
  ['Samsung','Galaxy Z Flip 5','phone','smartphone',999,6,6,5,'Large cover screen',2023,2026],
  ['Samsung','Galaxy A54','phone','smartphone',449,2,2,5,'Premium mid-range',2023,2026],
  ['Samsung','Galaxy S24','phone','smartphone',799,5,5,5,'Galaxy AI',2024,2027],
  ['Samsung','Galaxy S24+','phone','smartphone',999,5,5,5,'Larger battery, QHD+',2024,2027],
  ['Samsung','Galaxy S24 Ultra','phone','smartphone',1299,6,6,5,'Titanium, AI',2024,2027],
  ['Samsung','Galaxy Z Flip 6','phone','smartphone',1099,6,6,5,'Bigger cover screen, 50MP',2024,2027],
  ['Samsung','Galaxy Z Fold 6','phone','smartphone',1899,7,7,5,'Lighter, brighter',2024,2027],
  ['Samsung','Galaxy A55','phone','smartphone',499,3,2,5,'Metal frame mid-range',2024,2027],
  ['Samsung','Galaxy S25','phone','smartphone',799,5,5,5,'6.2" AMOLED, Snap 8 Elite',2025,2028],
  ['Samsung','Galaxy S25+','phone','smartphone',999,5,5,5,'6.7" QHD+',2025,2028],
  ['Samsung','Galaxy S25 Ultra','phone','smartphone',1299,6,6,5,'200MP quad camera, slim',2025,2028],
  ['Samsung','Galaxy S25 Slim','phone','smartphone',1099,6,6,5,'Ultra thin design',2025,2028],
  ['Samsung','Galaxy Z Fold 7','phone','smartphone',1999,7,7,5,'8" inner display',2025,2028],
  ['Samsung','Galaxy A56','phone','smartphone',449,2,2,5,'6.7" AMOLED',2025,2028],

  ['Google','Nexus 4','phone','smartphone',299,3,2,4,'Glass back, pure Android',2012,2015],
  ['Google','Nexus 5','phone','smartphone',349,3,2,4,'Iconic value flagship',2013,2016],
  ['Google','Nexus 6P','phone','smartphone',499,4,3,4,'Metal body, great camera',2015,2018],
  ['Google','Pixel 1','phone','smartphone',649,4,3,5,'Best camera of its time',2016,2019],
  ['Google','Pixel 2 XL','phone','smartphone',849,4,3,5,'Panda colors, portrait mode',2017,2020],
  ['Google','Pixel 3','phone','smartphone',799,4,3,5,'Night Sight',2018,2021],
  ['Google','Pixel 3a','phone','smartphone',399,2,2,4,'Budget camera king',2019,2022],
  ['Google','Pixel 4 XL','phone','smartphone',899,4,3,5,'Face unlock, telephoto',2019,2022],
  ['Google','Pixel 5','phone','smartphone',699,3,3,5,'5G, compact',2020,2023],
  ['Google','Pixel 6','phone','smartphone',599,4,3,5,'Tensor chip, new design',2021,2024],
  ['Google','Pixel 6 Pro','phone','smartphone',899,5,4,5,'Telephoto, 120Hz',2021,2024],
  ['Google','Pixel 7','phone','smartphone',599,4,3,5,'Refined design',2022,2025],
  ['Google','Pixel 7 Pro','phone','smartphone',899,5,4,5,'Macro focus',2022,2025],
  ['Google','Pixel 8','phone','smartphone',699,4,4,5,'7 years updates',2023,2026],
  ['Google','Pixel 8 Pro','phone','smartphone',999,5,4,5,'Thermometer, AI photo',2023,2026],
  ['Google','Pixel 9','phone','smartphone',799,4,4,5,'Gemini AI',2024,2027],
  ['Google','Pixel 9 Pro','phone','smartphone',999,5,5,5,'Compact Pro',2024,2027],
  ['Google','Pixel 9 Pro XL','phone','smartphone',1099,6,5,5,'Large Pro',2024,2027],
  ['Google','Pixel 9 Pro Fold','phone','smartphone',1799,7,6,5,'Thin foldable',2024,2027],
  ['Google','Pixel 10','phone','smartphone',799,4,4,5,'Tensor G5',2025,2028],
  
  ['OnePlus','OnePlus One','phone','smartphone',299,3,3,4,'Flagship killer',2014,2017],
  ['OnePlus','OnePlus 3T','phone','smartphone',439,3,2,4,'Fast charging',2016,2019],
  ['OnePlus','OnePlus 7 Pro','phone','smartphone',669,4,3,4,'Pop-up camera, 90Hz',2019,2022],
  ['OnePlus','OnePlus 11','phone','smartphone',699,4,3,5,'Hasselblad cameras',2023,2026],
  ['OnePlus','OnePlus 12','phone','smartphone',799,5,4,5,'Huge battery, bright screen',2024,2027],
  ['OnePlus','OnePlus Open','phone','smartphone',1699,6,6,5,'Excellent foldable',2023,2026],
  
  ['Xiaomi','Mi 9','phone','smartphone',450,3,2,4,'Budget flagship',2019,2022],
  ['Xiaomi','Poco X3 Pro','phone','smartphone',250,2,1,4,'Gaming budget',2021,2024],
  ['Xiaomi','Xiaomi 13 Pro','phone','smartphone',1099,5,4,5,'Leica cameras',2023,2026],
  ['Xiaomi','Xiaomi 14 Ultra','phone','smartphone',1499,6,5,5,'Photography beast',2024,2027],
  ['Xiaomi','Redmi Note 13 Pro','phone','smartphone',350,2,1,4,'Value mid-range',2024,2027],

  ['Sony','Xperia 1 V','phone','smartphone',1399,5,4,5,'Pro creator phone',2023,2026],
  ['Motorola','Razr+','phone','smartphone',999,5,5,4,'Stylish flip phone',2023,2026]
];

/* ---------- AUDIO (AirPods, HomePod, headphones, speakers) ---------- */
const SHOP_AUDIO = [
  ['Apple','AirPods 1st gen','audio','earbuds',159,3,3,3,'Wireless earbuds, W1 chip',2016,2019],
  ['Apple','AirPods 2nd gen','audio','earbuds',159,3,3,3,'H1 chip, Hey Siri',2019,2022],
  ['Apple','AirPods Pro 1st gen','audio','earbuds',249,4,4,3,'ANC, transparency mode',2019,2022],
  ['Apple','AirPods 3rd gen','audio','earbuds',179,4,3,3,'Spatial audio',2021,2024],
  ['Apple','AirPods Pro 2nd gen','audio','earbuds',249,5,4,3,'2x ANC, adaptive audio',2022,9999],
  ['Apple','AirPods 4','audio','earbuds',129,3,3,3,'Redesigned fit',2024,9999],
  ['Apple','AirPods 4 with ANC','audio','earbuds',179,4,4,3,'Open-ear ANC',2024,9999],
  ['Apple','AirPods Max','audio','headphones',549,6,5,4,'Over-ear, spatial audio',2020,9999],
  ['Apple','HomePod 1st gen','audio','smart_speaker',349,4,4,5,'High-fidelity smart speaker',2018,2021],
  ['Apple','HomePod Mini','audio','smart_speaker',99,2,2,4,'Compact smart speaker',2020,9999],
  ['Apple','HomePod 2nd gen','audio','smart_speaker',299,4,4,5,'Room-sensing audio',2023,9999],

  ['Samsung','Galaxy Buds2','audio','earbuds',149,3,3,3,'ANC, AKG tuning',2021,2024],
  ['Samsung','Galaxy Buds2 Pro','audio','earbuds',229,4,3,3,'24-bit audio, ANC',2022,2025],
  ['Samsung','Galaxy Buds FE','audio','earbuds',99,2,2,3,'Value ANC buds',2023,9999],
  ['Samsung','Galaxy Buds3 Pro','audio','earbuds',249,4,4,3,'Blade design, ANC',2024,9999],
  
  ['Sony','WH-1000XM3','audio','headphones',349,5,4,4,'Excellent ANC',2018,2021],
  ['Sony','WH-1000XM4','audio','headphones',349,5,4,4,'Industry-leading ANC',2020,2023],
  ['Sony','WH-1000XM5','audio','headphones',399,5,5,4,'Best-in-class ANC',2022,9999],
  ['Sony','WF-1000XM4','audio','earbuds',279,4,3,3,'Premium ANC earbuds',2021,2024],
  ['Sony','WF-1000XM5','audio','earbuds',299,5,4,3,'Smaller premium ANC earbuds',2023,9999],
  
  ['Bose','QuietComfort 35 II','audio','headphones',299,4,3,4,'Classic comfort ANC',2017,2021],
  ['Bose','QuietComfort 45','audio','headphones',329,5,4,4,'Iconic quiet comfort',2021,2024],
  ['Bose','QuietComfort Ultra','audio','headphones',429,6,5,4,'Immersive spatial audio',2023,9999],
  ['Bose','QuietComfort Earbuds II','audio','earbuds',299,5,4,3,'CustomTune ANC',2022,2024],
  
  ['Sennheiser','Momentum 4','audio','headphones',349,5,4,4,'60-hour battery',2022,9999],
  ['Sennheiser','Momentum True Wireless 3','audio','earbuds',249,4,3,3,'Audiophile sound',2022,9999],
  
  ['JBL','Flip 5','audio','portable_speaker',99,2,2,3,'Waterproof BT speaker',2019,2022],
  ['JBL','Flip 6','audio','portable_speaker',129,3,3,3,'Waterproof BT speaker',2021,9999],
  ['JBL','Charge 5','audio','portable_speaker',179,3,3,4,'Powerbank speaker',2021,9999],
  ['JBL','Charge 6','audio','portable_speaker',199,4,3,4,'Loud, waterproof',2024,9999],
  ['JBL','PartyBox 310','audio','party_speaker',499,5,5,5,'Portable party speaker',2020,9999],
  
  ['Marshall','Emberton II','audio','portable_speaker',169,4,4,4,'Vintage design portable',2022,9999],
  ['Marshall','Stanmore III','audio','smart_speaker',379,5,4,5,'Rock-and-roll BT speaker',2022,9999],
  
  ['Sonos','One','audio','smart_speaker',219,4,4,5,'Wi-Fi speaker, Alexa',2017,2023],
  ['Sonos','Era 100','audio','smart_speaker',249,4,4,5,'Next-gen acoustic',2023,9999],
  ['Sonos','Era 300','audio','smart_speaker',449,5,4,5,'Spatial audio speaker',2023,9999],
  ['Sonos','Beam Gen 2','audio','soundbar',499,5,4,6,'Compact Atmos soundbar',2021,9999],
  ['Sonos','Arc','audio','soundbar',899,6,5,6,'Dolby Atmos soundbar',2020,9999],
  
  ['JBL','Bar 5.1','audio','soundbar',499,4,4,5,'Dolby Digital soundbar',2020,9999],
  ['Samsung','HW-Q990C','audio','soundbar',1499,6,5,6,'11.1.4 Atmos system',2023,9999],
  
  ['Beats','Studio 3','audio','headphones',349,4,4,4,'Over-ear W1 chip',2017,2023],
  ['Beats','Studio Pro','audio','headphones',349,5,5,4,'Over-ear premium',2023,9999],
  ['Beats','Fit Pro','audio','earbuds',199,4,4,3,'Sport wingtip buds',2021,9999]
];

/* ---------- WATCHES ---------- */
const SHOP_WATCHES = [
  ['Casio','F-91W','watch','digital',20,1,0,10,'Iconic digital watch'],
  ['Casio','Calculator Watch CA-53W','watch','digital',25,2,1,10,'Retro calculator watch'],
  ['Casio','G-Shock DW-5600','watch','digital',80,2,1,15,'Shock resistant digital'],
  ['Casio','G-Shock GA-2100 "CasiOak"','watch','analog',99,3,2,15,'Octagonal carbon core'],
  ['Casio','Edifice EFR-S108D','watch','analog',200,3,2,12,'Analog chronograph'],
  
  ['Seiko','SNK809','watch','automatic',120,3,2,20,'Entry automatic watch'],
  ['Seiko','5 Sports SRPD','watch','automatic',280,4,2,20,'Automatic dive-style'],
  ['Seiko','Presage Cocktail Time','watch','dress',450,5,3,20,'Stunning dial dress watch'],
  ['Seiko','Prospex "Turtle"','watch','automatic',550,5,3,20,'Professional dive watch'],
  
  ['Tissot','PR 100','watch','quartz',300,3,2,15,'Swiss quartz everyday'],
  ['Tissot','Le Locle','watch','dress',550,4,3,20,'Swiss automatic dress watch'],
  ['Tissot','PRX Powermatic 80','watch','sport',650,5,4,20,'Steel integrated bracelet hit'],
  
  ['Hamilton','Khaki Field Mechanical','watch','mechanical',495,4,3,20,'Classic military watch'],
  ['Citizen','Eco-Drive Promaster','watch','quartz',350,3,2,20,'Solar powered dive watch'],
  ['Orient','Bambino V2','watch','automatic',150,3,2,15,'Budget automatic dress watch'],
  
  ['Apple','Watch Series 3','watch','smartwatch',199,2,2,3,'GPS fitness watch',2017,2022],
  ['Apple','Watch SE','watch','smartwatch',249,3,3,4,'Budget Apple Watch',2020,9999],
  ['Apple','Watch Series 4','watch','smartwatch',399,3,3,4,'ECG, fall detection',2018,2021],
  ['Apple','Watch Series 6','watch','smartwatch',399,4,3,4,'Blood oxygen',2020,2023],
  ['Apple','Watch Series 8','watch','smartwatch',399,4,3,5,'Temp sensor',2022,2024],
  ['Apple','Watch Series 9','watch','smartwatch',399,4,3,5,'Double tap gesture',2023,9999],
  ['Apple','Watch Ultra','watch','smartwatch',799,5,4,5,'Titanium, extreme sports',2022,9999],
  ['Apple','Watch Ultra 2','watch','smartwatch',799,5,5,5,'Brighter screen, S9',2023,9999],
  
  ['Samsung','Galaxy Watch 4','watch','smartwatch',249,3,2,4,'WearOS return',2021,2023],
  ['Samsung','Galaxy Watch 6 Classic','watch','smartwatch',399,4,3,4,'Rotating bezel',2023,9999],
  ['Garmin','Forerunner 265','watch','smartwatch',449,4,2,5,'AMOLED running watch',2023,9999],
  ['Garmin','Fenix 7','watch','smartwatch',699,5,3,6,'Multi-sport GPS',2022,9999],

  ['Azza Fahmi','Silver Engraved Watch','watch','designer',400,4,4,15,'Egyptian designer luxury'],
  
  ['Tudor','Black Bay 58','watch','automatic',3900,7,7,30,'Vintage inspired dive watch'],
  ['Omega','Speedmaster Professional','watch','mechanical',7000,8,8,40,'The Moonwatch'],
  ['Omega','Seamaster 300M','watch','automatic',5800,7,8,30,'Swiss dive watch icon'],
  
  ['Rolex','Oyster Perpetual','watch','automatic',6100,8,9,50,'Entry Rolex'],
  ['Rolex','Submariner','watch','automatic',10500,9,10,50,'Iconic dive watch'],
  ['Rolex','Datejust 36','watch','automatic',9500,9,9,50,'Dress Rolex'],
  ['Rolex','Daytona','watch','automatic',14500,10,10,50,'Grail chronograph'],
  
  ['Cartier','Tank Must','watch','quartz',3200,7,8,30,'Classic rectangular watch'],
  ['Cartier','Santos','watch','dress',7500,8,9,40,'French luxury icon'],
  
  ['Patek Philippe','Calatrava','watch','dress',30000,9,10,100,'Ultimate dress watch'],
  ['Patek Philippe','Nautilus 5711','watch','dress',42000,10,10,100,'Grail watch'],
  ['Audemars Piguet','Royal Oak','watch','sport',32000,10,10,80,'Iconic steel sports watch'],
  ['Vacheron Constantin','Overseas','watch','sport',22500,9,9,80,'Holy Trinity sports watch']
];

/* ---------- TABLETS ---------- */
const SHOP_TABLETS = [
  ['Apple','iPad 1st gen','tablet','ipad',499,3,3,5,'9.7" touchscreen',2010,2013],
  ['Apple','iPad 2','tablet','ipad',499,3,3,5,'Thinner, dual cameras',2011,2014],
  ['Apple','iPad mini','tablet','ipad',329,2,2,5,'7.9" compact',2012,2015],
  ['Apple','iPad Air','tablet','ipad',499,3,2,6,'Thin Retina display',2013,2016],
  ['Apple','iPad Air 2','tablet','ipad',499,3,2,6,'Touch ID, thinner',2014,2018],
  ['Apple','iPad Pro 9.7','tablet','ipad',599,4,3,6,'Apple Pencil support',2016,2019],
  ['Apple','iPad Pro 10.5','tablet','ipad',649,4,3,6,'ProMotion 120Hz',2017,2020],
  ['Apple','iPad Pro 11" (2018)','tablet','ipad',799,5,4,6,'Face ID, USB-C',2018,2021],
  ['Apple','iPad 9th gen','tablet','ipad',329,2,1,6,'A13 chip',2021,2024],
  ['Apple','iPad 10th gen','tablet','ipad',449,2,1,6,'USB-C, 10.9"',2022,9999],
  ['Apple','iPad mini 6','tablet','ipad',499,3,2,6,'USB-C, 8.3"',2021,9999],
  ['Apple','iPad Air M1','tablet','ipad',599,4,2,6,'M1 chip',2022,2025],
  ['Apple','iPad Air M2 (11")','tablet','ipad',599,4,2,6,'M2 chip',2024,9999],
  ['Apple','iPad Air M2 (13")','tablet','ipad',799,5,3,6,'13" M2 Air',2024,9999],
  ['Apple','iPad Air M3','tablet','ipad',599,4,2,6,'M3 chip',2025,9999],
  ['Apple','iPad Pro 11" M4','tablet','ipad',999,5,4,6,'OLED, M4',2024,9999],
  ['Apple','iPad Pro 13" M4','tablet','ipad',1299,6,4,6,'13" OLED, M4',2024,9999],
  ['Apple','iPad Pro 13" M5','tablet','ipad',1299,6,4,7,'Tandem OLED, M5',2025,9999],
  
  ['Samsung','Galaxy Tab A7','tablet','android',229,1,0,4,'Budget media tablet',2020,2023],
  ['Samsung','Galaxy Tab A9+','tablet','android',220,1,0,5,'11" 90Hz',2023,9999],
  ['Samsung','Galaxy Tab S7 FE','tablet','android',529,3,1,5,'Fan Edition Tab',2021,2024],
  ['Samsung','Galaxy Tab S8','tablet','android',699,4,2,5,'11" 120Hz',2022,2025],
  ['Samsung','Galaxy Tab S9','tablet','android',799,4,2,5,'AMOLED, IP68, S Pen',2023,9999],
  ['Samsung','Galaxy Tab S9 Ultra','tablet','android',1199,5,3,5,'14.6" giant tablet',2023,9999],
  ['Samsung','Galaxy Tab S10 Ultra','tablet','android',1199,5,3,6,'14.6" AMOLED, AI',2024,9999],
  
  ['Microsoft','Surface Pro 7','tablet','windows',749,3,2,5,'Intel Core tablet',2019,2022],
  ['Microsoft','Surface Pro 9','tablet','windows',999,4,2,5,'120Hz Windows tablet',2022,9999],
  ['Microsoft','Surface Pro 11','tablet','windows',999,5,3,6,'Snapdragon X Elite',2024,9999],
  
  ['Lenovo','Tab P11 Pro','tablet','android',399,2,1,4,'OLED budget tablet',2022,9999],
  ['Amazon','Fire HD 10','tablet','android',149,1,0,3,'Budget media consumption',2021,9999]
];

/* ---------- LAPTOPS / COMPUTERS ---------- */
const SHOP_COMPUTERS = [
  ['ASUS','Eee PC netbook','laptop','budget',399,1,0,4,'7" screen, Linux',2007,2012],
  ['Dell','Inspiron 1525','laptop','budget',699,1,0,5,'Core 2 Duo, 2GB RAM',2007,2011],
  
  ['Apple','MacBook (white)','laptop','macbook',1099,3,3,6,'Polycarbonate, Core 2 Duo',2007,2011],
  ['Apple','MacBook Pro 15" (2008)','laptop','macbook',1999,4,4,6,'Unibody aluminum',2008,2012],
  ['Apple','MacBook Air 13" (2010)','laptop','macbook',1299,3,4,6,'Flash storage, wedge design',2010,2014],
  ['Apple','MacBook Pro 13" Retina','laptop','macbook',1299,4,3,6,'Retina display',2012,2016],
  ['Apple','MacBook Pro 15" TouchBar','laptop','macbook',2399,4,3,5,'Touch Bar, butterfly keyboard',2016,2020],
  ['Apple','MacBook Air 13" (2018)','laptop','macbook',1199,3,3,5,'Retina Air',2018,2021],
  ['Apple','MacBook Air M1','laptop','macbook',999,4,3,6,'M1 chip, fanless revolution',2020,2023],
  ['Apple','MacBook Pro 14" M1 Pro','laptop','macbook',1999,5,4,6,'Notch, ports return',2021,2024],
  ['Apple','MacBook Air M2','laptop','macbook',1199,5,4,6,'New design, MagSafe',2022,2025],
  ['Apple','MacBook Pro 14" M3 Pro','laptop','macbook',1999,5,4,6,'Space Black, M3',2023,2026],
  ['Apple','MacBook Air 15" M3','laptop','macbook',1299,5,4,6,'15" fanless',2024,9999],
  ['Apple','MacBook Air M5','laptop','macbook',1099,5,3,6,'M5, 18h battery',2025,9999],
  ['Apple','MacBook Pro 14" M5','laptop','macbook',1999,6,4,7,'M5 Pro, mini-LED',2025,9999],
  ['Apple','MacBook Pro 16" M5','laptop','macbook',2499,6,5,7,'M5 Max, 24GB RAM',2025,9999],
  
  ['Lenovo','ThinkPad T61','laptop','business',1299,2,1,6,'Core 2 Duo, 14"',2007,2011],
  ['Lenovo','ThinkPad X1 Carbon Gen 9','laptop','business',1499,4,3,6,'Ultralight business',2021,2024],
  ['Lenovo','ThinkPad E14','laptop','business',950,2,1,6,'Core Ultra 5',2021,9999],
  ['Lenovo','Yoga 9i','laptop','2in1',1399,4,2,5,'Convertible OLED',2023,9999],
  
  ['Dell','XPS 13 (2015)','laptop','premium',999,3,2,5,'InfinityEdge screen',2015,2020],
  ['Dell','XPS 13 Plus','laptop','premium',1299,4,3,5,'Invisible trackpad',2022,2024],
  ['Dell','XPS 14 (2024)','laptop','premium',1700,5,3,6,'OLED, Core Ultra 7',2024,9999],
  ['Dell','XPS 16','laptop','premium',2000,5,4,6,'Large premium Windows',2024,9999],
  
  ['Microsoft','Surface Laptop 3','laptop','premium',999,3,2,5,'Clean alcantara',2019,2022],
  ['Microsoft','Surface Laptop 7','laptop','premium',999,4,3,6,'Snapdragon X Elite',2024,9999],
  
  ['HP','Spectre x360 14','laptop','2in1',1399,4,3,5,'Premium convertible',2024,9999],
  ['HP','Pavilion 15','laptop','budget',750,2,0,5,'Ryzen 7, 16GB',2019,9999],
  
  ['ASUS','ZenBook 14 OLED','laptop','ultrabook',899,4,2,5,'OLED value',2023,9999],
  ['ASUS','ROG Zephyrus G14 (2020)','laptop','gaming',1449,4,3,5,'Lightweight gaming',2020,2023],
  ['ASUS','ROG Zephyrus G14 (2024)','laptop','gaming',1900,5,3,5,'OLED, CNC aluminum',2024,9999],
  ['ASUS','ROG Strix Scar 16','laptop','gaming',2800,6,3,5,'Desktop replacement RTX 4080',2024,9999],
  
  ['Razer','Blade 15','laptop','gaming',2400,5,4,5,'Premium gaming laptop',2020,9999],
  ['Razer','Blade 16','laptop','gaming',2999,6,4,5,'Dual-mode mini-LED',2023,9999],
  
  ['Acer','Aspire 5','laptop','budget',550,1,0,5,'Core i5, 8GB',2019,9999],
  ['Acer','Swift 3','laptop','budget',650,2,1,5,'Evo certified',2021,9999],
  
  ['Google','Pixelbook','laptop','chromebook',999,3,2,5,'Premium ChromeOS',2017,2021],
  ['Google','Chromebook','laptop','budget',349,1,0,5,'Basic ChromeOS',2011,9999],
  
  ['Apple','iMac 24" M1','desktop','allinone',1299,4,3,7,'Thin colorful iMac',2021,2024],
  ['Apple','iMac 24" M3','desktop','allinone',1299,5,3,7,'M3 upgrade',2023,9999],
  ['Apple','Mac mini M2','desktop','mini',599,3,1,7,'Value desktop',2023,2026],
  ['Apple','Mac mini M4','desktop','mini',599,4,1,7,'Redesigned tiny Mac',2024,9999],
  ['Apple','Mac Studio M2 Max','desktop','workstation',1999,5,2,7,'Pro desktop',2023,9999]
];

/* ---------- TVs ---------- */
const SHOP_TVS = [
  ['Samsung','32" LCD 720p','tv','lcd',599,2,1,8,'Basic 720p TV',2007,2012],
  ['Panasonic','42" Plasma','tv','plasma',1199,3,2,8,'Plasma 720p',2007,2012],
  ['Sony','Bravia 46" LCD','tv','lcd',1799,4,2,8,'1080p, 120Hz',2007,2013],
  ['Samsung','46" LED 3D','tv','led',1299,4,2,9,'3D ready',2010,2015],
  ['Samsung','50" Smart TV 1080p','tv','smart',649,3,2,8,'Apps + WiFi',2012,2018],
  
  ['LG','55" 4K UHD','tv','4k',999,4,2,9,'4K webOS',2014,2020],
  ['LG','OLED55 B7','tv','oled',1999,5,3,9,'OLED, HDR',2017,2021],
  ['LG','CX 65" OLED','tv','oled',2200,6,4,9,'HDMI 2.1 OLED',2020,2023],
  ['LG','C3 65" OLED','tv','oled',1800,6,4,9,'Evo panel OLED',2023,9999],
  ['LG','G4 77" OLED evo','tv','oled',3800,7,5,9,'MLA technology OLED',2024,9999],
  ['LG','C5 65" OLED evo','tv','oled',1700,6,4,9,'OLED evo',2025,9999],
  ['LG','B5 55" OLED','tv','oled',1100,5,3,8,'Budget OLED',2025,9999],
  
  ['Samsung','43" Crystal 4K','tv','4k',320,2,1,7,'43" 4K',2020,9999],
  ['Samsung','65" Q80T QLED','tv','qled',1200,4,3,8,'FALD QLED',2020,2023],
  ['Samsung','QN90C 65" Neo QLED','tv','qled',1700,5,4,8,'Mini-LED',2023,9999],
  ['Samsung','S95C 77" OLED','tv','oled',3500,7,5,9,'QD-OLED 144Hz',2023,9999],
  ['Samsung','S90D 65" OLED','tv','oled',1800,6,4,9,'QD-OLED',2024,9999],
  ['Samsung','The Frame 55"','tv','lifestyle',1500,5,5,8,'Art mode TV',2022,9999],
  
  ['Sony','Bravia X900H 65"','tv','led',1000,4,3,8,'PS5 ready LED',2020,2023],
  ['Sony','Bravia 65" X90L','tv','led',1300,5,3,9,'Full Array LED',2023,9999],
  ['Sony','Bravia A80L 65" OLED','tv','oled',1800,6,4,9,'Acoustic surface OLED',2023,9999],
  ['Sony','Bravia 9 75" Mini-LED','tv','led',3300,7,5,9,'Master series mini-LED',2024,9999],
  ['Sony','Bravia 85" 8K','tv','8k',3200,6,5,8,'8K Google TV',2019,9999],
  
  ['TCL','55" 6-Series Mini-LED','tv','qled',600,4,2,7,'Value mini-LED',2021,2024],
  ['TCL','65" Q7 QLED','tv','qled',700,4,2,7,'120Hz QLED value',2023,9999],
  ['TCL','85" QM8 Mini-LED','tv','qled',1800,6,4,8,'Giant bright mini-LED',2023,9999],
  
  ['Hisense','55" U8K','tv','qled',700,4,2,7,'Mini-LED value',2023,9999],
  ['Hisense','100" U8K','tv','qled',4000,7,6,8,'Massive 100" screen',2023,9999]
];

/* ---------- APPLIANCES ---------- */
const SHOP_APPLIANCES = [
  // Washing machines
  ['Beko','7kg Top-Load Washer','appliances','washing',400,2,0,10,'Front-load 7kg'],
  ['Bosch','8kg Front-Load Washer','appliances','washing',800,3,0,12,'Front-load 8kg'],
  ['Bosch','Serie 8 10kg i-DOS Washer','appliances','washing',1200,4,1,12,'Auto-dosing'],
  ['Samsung','9kg EcoBubble Washer','appliances','washing',750,3,0,12,'EcoBubble tech'],
  ['Samsung','11kg Bespoke AI Washer','appliances','washing',1100,4,1,12,'AI wash, smart control'],
  ['LG','10kg Inverter Washer','appliances','washing',900,3,0,12,'Inverter direct drive'],
  ['LG','WashTower 13kg','appliances','washing',1800,5,2,15,'Stacked washer/dryer'],
  ['Whirlpool','8kg Washer','appliances','washing',650,2,0,10,'Reliable washer'],
  
  // Dryers
  ['Bosch','8kg Heat Pump Dryer','appliances','dryer',900,3,0,12,'Energy-efficient dryer'],
  ['LG','9kg Vented Dryer','appliances','dryer',700,3,0,11,'Vented dryer'],
  ['Samsung','9kg Bespoke Heat Pump Dryer','appliances','dryer',1000,4,0,12,'A+++ efficiency'],
  
  // Ovens & microwaves
  ['Beko','Freestanding Oven 60cm','appliances','oven',500,2,0,10,'Gas oven 60cm'],
  ['Bosch','Built-In Oven Serie 8','appliances','oven',1000,3,0,12,'Stainless built-in'],
  ['SMEG','Retro Freestanding Oven','appliances','oven',2200,5,3,15,'Iconic SMEG Italian design'],
  ['SMEG','Victoria Built-in Oven','appliances','oven',1500,4,2,15,'Classic aesthetic'],
  ['Siemens','Built-In Oven iQ700','appliances','oven',1200,4,1,12,'Sensor cooking'],
  ['Miele','Generation 7000 Steam Oven','appliances','oven',3500,6,3,20,'Professional steam oven'],
  
  ['Panasonic','Solo Microwave','appliances','microwave',150,1,0,8,'Basic microwave'],
  ['Samsung','Grill Microwave','appliances','microwave',250,2,0,9,'Grill function'],
  ['Samsung','Bespoke Microwave','appliances','microwave',350,3,1,9,'Color customizable'],
  ['SMEG','Retro Microwave','appliances','microwave',600,4,2,12,'Iconic SMEG microwave'],
  
  // Kettles & toasters
  ['Philips','Electric Kettle','appliances','kettle',40,1,0,5,'Basic stainless kettle'],
  ['Russell Hobbs','Glass Kettle','appliances','kettle',60,1,0,6,'Illuminated glass'],
  ['SMEG','Retro Kettle','appliances','kettle',250,3,2,10,'Iconic SMEG kettle'],
  ['SMEG','Variable Temperature Kettle','appliances','kettle',300,4,2,10,'Precise temp control'],
  ['Fellow','Stagg EKG Electric Kettle','appliances','kettle',165,3,1,8,'Gooseneck pour-over'],
  
  ['Philips','2-Slice Toaster','appliances','toaster',30,0,0,5,'Basic toaster'],
  ['SMEG','2-Slice Retro Toaster','appliances','toaster',200,3,2,10,'Designer toaster'],
  ['SMEG','4-Slice Retro Toaster','appliances','toaster',250,4,2,10,'Large designer toaster'],
  ['Dualit','4-Slice Toaster','appliances','toaster',250,3,2,12,'Hand-built toaster'],
  
  // Grills & coffee
  ['George Foreman','Contact Grill','appliances','grill',80,1,0,6,'Indoor grill'],
  ['Ninja','Foodi Smart Grill','appliances','grill',300,3,1,8,'Air fryer + grill'],
  
  ['Philips','Espresso Machine','appliances','coffee',300,3,1,10,'Espresso maker'],
  ['De\'Longhi','Magnifica S','appliances','coffee',500,4,1,12,'Bean-to-cup'],
  ['De\'Longhi','La Specialista Arte','appliances','coffee',700,5,2,12,'Manual espresso'],
  ['Breville','Barista Express','appliances','coffee',750,5,3,10,'Popular home espresso'],
  ['Nespresso','Vertuo Next','appliances','coffee',200,3,1,8,'Pod-based coffee'],
  ['Nespresso','Creatista Plus','appliances','coffee',600,4,2,10,'Premium pod espresso'],
  ['SMEG','Retro Coffee Machine','appliances','coffee',600,5,2,12,'Iconic SMEG coffee'],
  ['SMEG','Bean to Cup Machine','appliances','coffee',900,6,3,12,'SMEG automatic'],
  
  // Stoves, fridges, dishwashers
  ['Bosch','4-Burner Gas Stove','appliances','stove',700,2,0,12,'Stainless 60cm'],
  ['SMEG','Retro 4-Burner Stove','appliances','stove',1800,5,3,15,'Iconic SMEG stove'],
  ['SMEG','Portofino 90cm Cooker','appliances','stove',4000,7,4,15,'Professional range'],
  ['Miele','Induction Cooktop','appliances','stove',2000,5,2,15,'Flush induction'],
  
  ['Samsung','400L Fridge','appliances','fridge',1200,3,0,15,'Silver 400L'],
  ['Samsung','Bespoke French Door Fridge','appliances','fridge',3000,5,3,15,'Custom panels'],
  ['Samsung','Family Hub Fridge','appliances','fridge',3500,6,4,15,'Smart screen fridge'],
  ['LG','500L Inverter Fridge','appliances','fridge',1400,3,0,15,'Inverter compressor'],
  ['LG','InstaView Door-in-Door','appliances','fridge',2800,5,3,15,'Knock to see inside'],
  ['SMEG','Retro Fridge FAB28','appliances','fridge',3000,6,3,18,'Iconic SMEG fridge'],
  ['SMEG','FAB50 Double Door','appliances','fridge',4500,7,4,18,'Large retro fridge'],
  ['Sub-Zero','Built-in French Door','appliances','fridge',12000,8,6,25,'Luxury built-in'],
  
  ['Bosch','12-Place Dishwasher','appliances','dishwasher',1000,3,0,12,'Quiet dishwasher'],
  ['Bosch','Serie 8 PerfectDry','appliances','dishwasher',1400,4,1,12,'Zeolith drying'],
  ['Siemens','iQ500 Dishwasher','appliances','dishwasher',1200,4,1,12,'Premium dishwasher'],
  ['Miele','G 7000 Dishwasher','appliances','dishwasher',2200,5,2,20,'AutoDos system'],
  ['SMEG','Retro Dishwasher','appliances','dishwasher',1600,5,2,15,'50s style dishwasher'],
  
  // ACs & fans
  ['Carrier','1.5T Split AC','appliances','ac',600,2,0,10,'Standard AC'],
  ['LG','1.5T Inverter AC','appliances','ac',800,3,0,12,'Inverter efficiency'],
  ['LG','Artcool Mirror AC','appliances','ac',1200,4,1,12,'Black mirror design'],
  ['Gree','1.5T Split AC','appliances','ac',500,2,0,10,'Budget AC'],
  ['Midea','2T Split AC','appliances','ac',900,3,0,12,'Large room AC'],
  
  ['generic','Pedestal Fan','appliances','fan',50,1,0,5,'Simple floor fan'],
  ['Dyson','Pure Cool Tower Fan','appliances','fan',500,5,2,10,'Purifier + fan'],
  ['Dyson','TP07 Purifier','appliances','fan',650,5,2,10,'Air purifier fan'],
  ['Dyson','Big+Quiet Formaldehyde','appliances','fan',900,6,3,10,'Large room purifier'],
  
  // Vacuum & air fryer
  ['Dyson','V8 Absolute','appliances','vacuum',400,3,1,7,'Entry cordless'],
  ['Dyson','V15 Detect','appliances','vacuum',750,5,2,8,'Laser dust detection'],
  ['Dyson','Gen5detect','appliances','vacuum',950,6,2,8,'Most powerful cordless'],
  ['iRobot','Roomba j7+','appliances','vacuum',800,4,2,7,'Self-emptying robot'],
  ['Roborock','S8 Pro Ultra','appliances','vacuum',1600,6,3,7,'Vacuum + mop self-cleaning'],
  ['Shark','Navigator Vacuum','appliances','vacuum',300,2,0,8,'Corded upright'],
  
  ['Philips','Air Fryer Essential','appliances','airfryer',150,2,0,6,'Basic air fryer'],
  ['Philips','Air Fryer XXL','appliances','airfryer',250,3,0,6,'Large air fryer'],
  ['Ninja','Air Fryer AF400','appliances','airfryer',180,3,0,6,'Dual-zone fryer'],
  ['Ninja','Speedi Rapid Cooker','appliances','airfryer',200,4,0,6,'10-in-1 cooker'],
  ['Cosori','Air Fryer Pro','appliances','airfryer',120,1,0,6,'Budget air fryer']
];

/* ---------- FURNITURE ---------- */
const SHOP_FURNITURE = [
  // Sofas
  ['IKEA','KIVIK 3-Seat Sofa','furniture','sofa',500,2,1,8,'Budget fabric sofa'],
  ['IKEA','SÖDERHAMN Sectional','furniture','sofa',800,3,1,8,'Deep seating modular'],
  ['Home Centre','L-Shaped Sofa','furniture','sofa',900,3,2,10,'Comfort L-shaped sofa'],
  ['Home Centre','Leather Sofa','furniture','sofa',1500,4,3,15,'Genuine leather sofa'],
  ['West Elm','Harmony Sofa','furniture','sofa',2200,5,4,15,'Deep comfortable couch'],
  ['CB2','Gwyneth Boucle Sofa','furniture','sofa',2500,6,5,15,'Trendy boucle design'],
  ['Roche Bobois','Mah Jong Sofa','furniture','sofa',15000,9,8,25,'Iconic modular lounge'],
  ['Minotti','Italian Designer Sofa','furniture','sofa',8000,8,6,25,'Italian luxury leather'],
  ['B&B Italia','Camaleonda Sofa','furniture','sofa',12000,9,7,25,'Designer modular system'],
  
  // Dining
  ['IKEA','EKEDALEN Dining Table','furniture','dining',300,2,1,8,'Wood 4-6 seat'],
  ['IKEA','MÖRBYLÅNGA Table','furniture','dining',600,3,1,10,'Oak veneer solid table'],
  ['Home Centre','Marble Dining Table','furniture','dining',2000,4,3,15,'Marble 6-seat'],
  ['West Elm','Mid-Century Expandable','furniture','dining',1200,4,3,15,'Walnut wood table'],
  ['Minotti','Designer Dining Table','furniture','dining',6000,7,5,20,'Italian designer'],
  ['Cattelan Italia','Skorpio Table','furniture','dining',5500,8,6,20,'Glass & steel luxury'],
  
  // Beds
  ['IKEA','MALM Queen Bed','furniture','bed',400,2,1,10,'Basic wood bed'],
  ['IKEA','IDANÄS Upholstered Bed','furniture','bed',600,3,1,10,'Classic tufted bed'],
  ['Home Centre','King Bed with Headboard','furniture','bed',900,3,2,12,'Upholstered king'],
  ['West Elm','Mid-Century Bed','furniture','bed',1400,4,3,15,'Acacia wood bed'],
  ['Fendi Casa','Italian Designer Bed','furniture','bed',8000,8,7,25,'Luxury bedroom set'],
  ['Hästens','Maranga Mattress & Bed','furniture','bed',18000,10,6,30,'Ultimate luxury sleep'],
  
  // Wardrobes
  ['IKEA','PAX Wardrobe System','furniture','wardrobe',400,2,0,10,'Customizable wardrobe'],
  ['Home Centre','Sliding Door Wardrobe','furniture','wardrobe',800,3,1,12,'Sliding doors'],
  ['Poliform','Senzafine Closet','furniture','wardrobe',12000,8,7,25,'Italian luxury glass closet'],
  ['Bespoke','Walk-in Closet','furniture','wardrobe',5000,6,5,20,'Custom walk-in'],
  
  // Desks & chairs
  ['IKEA','MICKE Office Desk','furniture','desk',150,1,0,8,'Basic work desk'],
  ['IKEA','IDÅSEN Sit/Stand Desk','furniture','desk',600,3,1,10,'Motorized standing desk'],
  ['Autonomous','SmartDesk Standing','furniture','desk',500,4,2,10,'Sit-stand desk'],
  ['Secretlab','MAGNUS Pro Metal Desk','furniture','desk',800,5,3,10,'Gaming sit-stand desk'],
  
  ['IKEA','MARKUS Office Chair','furniture','chair',200,2,0,8,'Ergonomic budget chair'],
  ['Herman Miller','Aeron Chair','furniture','chair',1500,6,4,15,'Ergonomic icon'],
  ['Herman Miller','Embody Chair','furniture','chair',1800,7,4,15,'Advanced ergonomic'],
  ['Steelcase','Gesture Chair','furniture','chair',1400,6,3,15,'Flexible ergonomic chair'],
  ['Lazyboy','Recliner Chair','furniture','recliner',800,5,2,15,'Lazyboy recliner'],
  ['Eames','Lounge Chair & Ottoman','furniture','recliner',6500,9,8,30,'Mid-century icon'],
  ['Home Centre','Dining Chair (Single)','furniture','chair',50,1,0,8,'Wood chair'],
  ['Custom','Massage Chair','furniture','recliner',3000,7,4,12,'Full-body massage chair'],
  
  // Rugs
  ['IKEA','STOCKHOLM Wool Rug','furniture','rug',250,2,1,8,'Flatwoven striped rug'],
  ['Home Centre','Persian-Style Rug','furniture','rug',600,3,2,10,'Hand-tufted rug'],
  ['West Elm','Souk Wool Rug','furniture','rug',800,4,3,10,'Moroccan style rug'],
  ['The Rug Company','Designer Silk Rug','furniture','rug',4500,7,6,20,'Hand-knotted silk'],
  ['Auction','Antique Persian Rug','furniture','rug',6000,6,5,40,'Genuine Persian'],
  
  // Lamps
  ['IKEA','TERTIAL Table Lamp','furniture','lamp',30,1,0,8,'Simple desk lamp'],
  ['Home Centre','Floor Lamp','furniture','lamp',150,2,1,10,'Reading floor lamp'],
  ['Flos','Arco Floor Lamp','furniture','lamp',3200,7,6,25,'Iconic marble base lamp'],
  ['Artemide','Tolomeo Desk Lamp','furniture','lamp',450,5,3,15,'Italian design lamp'],
  ['Louis Poulsen','PH 5 Pendant','furniture','lamp',1200,6,5,20,'Danish lighting icon'],
  
  // Decor
  ['Home Centre','Ceramic Vase','furniture','vase',40,1,0,5,'Decorative vase'],
  ['Jonathan Adler','Dora Maar Vase','furniture','vase',350,4,3,10,'Surrealist ceramic'],
  ['Antique','Vintage Ottoman Vase','furniture','vase',1500,4,4,50,'Antique collector vase'],
  ['Baccarat','Crystal Eye Vase','furniture','vase',2800,7,6,30,'French crystal luxury'],
  
  ['Local Gallery','Framed Wall Art','furniture','art',100,2,1,15,'Framed art print'],
  ['YellowKorner','Limited Edition Photo','furniture','art',800,5,4,20,'Numbered photography'],
  ['Sotheby\'s','Original Oil Painting','furniture','art',8000,8,7,100,'Original artwork'],
  
  ['Home Centre','Large Wall Mirror','furniture','mirror',200,2,1,10,'Simple wall mirror'],
  ['Anthropologie','Gleaming Primrose Mirror','furniture','mirror',1500,6,5,15,'Viral vintage mirror'],
  ['Bespoke','Venetian Mirror','furniture','mirror',1500,5,3,30,'Hand-crafted Venetian'],
  
  ['Home Centre','Blackout Curtains','furniture','curtain',120,1,0,8,'Simple curtains'],
  ['Bespoke','Custom Linen Drapes','furniture','curtain',600,4,2,15,'Tailored linen'],
  ['Bespoke','Custom Silk Drapes','furniture','curtain',1200,6,4,15,'Tailored silk drapes']
];

/* ---------- FASHION (specific items across tiers) ---------- */
const SHOP_FASHION = [
  // Budget wardrobe sets
  ['LC Waikiki','Essentials Pack','fashion','mens',30,1,0,1,'Basic t-shirts + jeans'],
  ['LC Waikiki','Everyday Set','fashion','womens',30,1,0,1,'Daily casual outfit'],
  ['DeFacto','Casual Wardrobe','fashion','mens',50,1,0,1,'Jeans + 2 t-shirts'],
  ['DeFacto','Weekend Outfit','fashion','womens',50,1,0,1,'Casual outfit'],
  ['H&M','Seasonal Pack','fashion','mens',60,1,0,1,'Trendy basics'],
  ['H&M','Everyday Bundle','fashion','womens',60,1,0,1,'Casual outfit set'],
  ['H&M','Linen Blend Suit','fashion','mens',120,2,1,1,'Summer budget suit'],
  
  // Mid-tier
  ['Bershka','Trendy Look','fashion','mens',80,2,1,1,'Modern streetwear'],
  ['Bershka','Weekend Dress','fashion','womens',80,2,1,1,'Trendy dress'],
  ['Pull and Bear','Casual Set','fashion','mens',70,2,1,1,'Everyday casual'],
  ['Pull and Bear','Denim Set','fashion','womens',70,2,1,1,'Jeans + top'],
  ['Zara','Smart Casual Set','fashion','mens',120,3,2,2,'Modern smart look'],
  ['Zara','Elegant Outfit','fashion','womens',150,3,2,2,'Stylish outfit'],
  ['Zara','Tailored Suit','fashion','mens',200,3,2,2,'Slim fit suit'],
  ['Massimo Dutti','Linen Shirt','fashion','mens',90,3,2,2,'Premium linen'],
  ['Massimo Dutti','Silk Blouse','fashion','womens',110,3,2,2,'Elegant silk'],
  ['American Eagle','Jeans + Tee','fashion','mens',90,2,2,2,'Classic American denim'],
  ['American Eagle','Denim Combo','fashion','womens',100,3,2,2,'Jeans + top'],
  ['Levi\'s','501 Original Jeans','fashion','mens',100,3,2,3,'Classic denim'],
  ['Levi\'s','Ribcage Straight Jeans','fashion','womens',110,3,2,3,'High-rise denim'],
  
  // Sportswear
  ['Nike','Air Force 1','fashion','shoes',110,3,2,2,'Classic white sneakers'],
  ['Nike','Air Max Sneakers','fashion','shoes',130,3,2,2,'Running sneakers'],
  ['Nike','Tech Fleece Set','fashion','mens',200,4,3,2,'Athletic tracksuit'],
  ['Nike','Dri-FIT Leggings','fashion','womens',80,2,2,2,'Activewear'],
  ['Nike','Jordan 1 Retro High','fashion','shoes',180,5,4,3,'Iconic streetwear'],
  
  ['Adidas','Stan Smith','fashion','shoes',100,3,2,2,'Classic leather sneakers'],
  ['Adidas','Ultraboost','fashion','shoes',180,4,3,2,'Premium running shoe'],
  ['Adidas','Samba OG','fashion','shoes',120,4,3,2,'Trendy retro sneakers'],
  ['Adidas','Tracksuit','fashion','mens',120,3,2,2,'Classic 3-stripe'],
  
  ['New Balance','574 Sneakers','fashion','shoes',85,2,1,2,'Iconic sneakers'],
  ['New Balance','990v6 Made in USA','fashion','shoes',200,4,3,3,'Premium dad shoe'],
  ['New Balance','Sport Set','fashion','womens',90,2,2,2,'Athletic set'],
  
  ['Puma','RS-X','fashion','shoes',100,3,1,2,'Retro sneakers'],
  ['Lululemon','Align Leggings','fashion','womens',118,4,3,3,'Buttery soft leggings'],
  ['Lululemon','ABC Pants','fashion','mens',128,4,3,3,'Everyday performance pants'],
  ['On Running','Cloud 5','fashion','shoes',140,3,2,2,'Everyday active shoes'],
  
  // Premium
  ['Tommy Hilfiger','Polo Shirt','fashion','mens',95,3,3,2,'Iconic logo polo'],
  ['Tommy Hilfiger','Tote Bag','fashion','womens',120,3,3,3,'Logo tote'],
  ['Ralph Lauren','Button-Down','fashion','mens',130,3,3,3,'Classic oxford'],
  ['Ralph Lauren','Cable Knit Sweater','fashion','mens',150,4,3,4,'Classic prep'],
  ['Ralph Lauren','Polo Dress','fashion','womens',150,3,3,3,'Iconic polo dress'],
  ['Calvin Klein','Underwear Set','fashion','mens',60,2,2,1,'Cotton basics'],
  ['Calvin Klein','Jeans','fashion','womens',100,3,2,2,'Slim fit jeans'],
  
  ['Hugo Boss','Suit','fashion','mens',800,5,5,4,'Tailored suit'],
  ['Hugo Boss','Blazer','fashion','womens',500,5,4,4,'Designer blazer'],
  ['Armani Exchange','Blazer','fashion','mens',400,4,3,3,'Modern blazer'],
  ['Emporio Armani','Wool Suit','fashion','mens',1200,6,5,5,'Italian tailoring'],
  ['Lacoste','Polo','fashion','mens',110,3,2,2,'Croc logo polo'],
  
  ['Coach','Tabby Shoulder Bag','fashion','bag',450,5,4,5,'Accessible luxury'],
  ['Michael Kors','Jet Set Tote','fashion','bag',300,4,3,4,'Everyday designer tote'],
  ['Tory Burch','Kira Chevron Bag','fashion','bag',550,5,5,5,'Quilted leather bag'],
  
  // Luxury Footwear
  ['Gucci','Ace Sneakers','fashion','shoes',850,7,7,3,'Designer leather sneakers'],
  ['Gucci','Horsebit Loafers','fashion','shoes',950,8,7,5,'Classic leather loafers'],
  ['Balenciaga','Triple S Sneakers','fashion','shoes',1000,7,8,3,'Chunky iconic sneakers'],
  ['Alexander McQueen','Oversized Sneakers','fashion','shoes',600,6,6,3,'Platform leather'],
  ['Christian Louboutin','Pigalle Pumps','fashion','shoes',800,8,8,5,'Red bottom heels'],
  ['Bottega Veneta','Tire Boots','fashion','shoes',1300,8,8,5,'Chunky Chelsea boots'],
  
  // Luxury Bags & Leather Goods
  ['Gucci','Marmont Bag','fashion','bag',1800,8,8,10,'Iconic GG bag'],
  ['Gucci','Leather Belt','fashion','accessory',450,6,6,5,'GG buckle belt'],
  ['Prada','Nylon Backpack','fashion','bag',1400,7,7,8,'Iconic nylon bag'],
  ['Prada','Galleria Tote','fashion','bag',3500,8,8,15,'Saffiano leather tote'],
  ['Prada','Saffiano Wallet','fashion','wallet',550,6,6,5,'Saffiano leather'],
  ['Louis Vuitton','Neverfull Tote','fashion','bag',2200,8,9,15,'Monogram canvas tote'],
  ['Louis Vuitton','Speedy Bandoulière','fashion','bag',2100,8,8,15,'Classic city bag'],
  ['Louis Vuitton','Keepall Bandoulière','fashion','bag',2400,8,9,15,'Weekender bag'],
  ['Louis Vuitton','LV Wallet','fashion','wallet',700,6,7,6,'Monogram wallet'],
  ['Hermes','Birkin Bag','fashion','bag',15000,10,10,50,'Grail bag'],
  ['Hermes','Kelly Bag','fashion','bag',14000,10,10,50,'Iconic bag'],
  ['Hermes','Silk Scarf','fashion','scarf',500,7,8,20,'Silk carré'],
  ['Hermes','H Belt Reversible','fashion','accessory',900,8,9,10,'Classic H buckle'],
  ['Hermes','Leather Wallet','fashion','wallet',1200,7,8,10,'Hand-stitched'],
  ['Chanel','Classic Flap Bag','fashion','bag',10000,10,10,40,'Iconic flap'],
  ['Chanel','Boy Bag','fashion','bag',6500,9,9,20,'Edgy quilted bag'],
  ['Dior','Lady Dior Bag','fashion','bag',5500,9,9,30,'Iconic cannage bag'],
  ['Dior','Saddle Bag','fashion','bag',4200,8,8,20,'Iconic saddle shape'],
  ['Balenciaga','City Bag','fashion','bag',2100,8,9,15,'Motorcycle bag'],
  ['Bottega Veneta','Cassette Bag','fashion','bag',2500,8,8,10,'Intrecciato padded'],
  ['Bottega Veneta','Jodie Bag','fashion','bag',2800,8,8,10,'Knot handle bag'],
  ['Yves Saint Laurent','Loulou Bag','fashion','bag',2900,8,8,15,'Quilted monogram'],
  ['Yves Saint Laurent','Cassandre Wallet','fashion','wallet',450,6,6,8,'YSL logo wallet'],
  ['Goyard','Saint Louis Tote','fashion','bag',2000,8,9,15,'Exclusive canvas tote'],
  ['Celine','Triomphe Bag','fashion','bag',3800,8,8,15,'Classic Parisian style'],
  
  // Luxury Apparel & Accessories
  ['Versace','Medusa Belt','fashion','accessory',450,6,6,5,'Iconic medusa buckle'],
  ['Versace','Silk Shirt','fashion','mens',1200,7,8,3,'Baroque silk shirt'],
  ['Burberry','Trench Coat','fashion','mens',2200,7,7,15,'Iconic trench'],
  ['Burberry','Nova Check Scarf','fashion','scarf',500,6,7,10,'Cashmere scarf'],
  ['Loro Piana','Cashmere Sweater','fashion','mens',2500,8,7,15,'Quiet luxury knitwear'],
  ['Brunello Cucinelli','Blazer','fashion','mens',3500,9,8,15,'Quiet luxury tailoring'],
  ['Tom Ford','Made to Measure Suit','fashion','mens',6000,10,9,15,'Ultimate power suit'],
  
  // Fragrance & Beauty
  ['Chanel','No.5 Perfume','fashion','accessory',150,4,5,1,'Legendary fragrance'],
  ['Chanel','Bleu de Chanel','fashion','accessory',130,4,4,1,'Classic men\'s scent'],
  ['Dior','Sauvage Perfume','fashion','accessory',120,4,4,1,'Masculine scent'],
  ['Tom Ford','Oud Wood Eau de Parfum','fashion','accessory',300,6,6,1,'Luxury niche scent'],
  ['Maison Francis Kurkdjian','Baccarat Rouge 540','fashion','accessory',350,7,7,1,'Viral luxury fragrance'],
  ['Creed','Aventus','fashion','accessory',450,7,7,1,'Status men\'s fragrance'],
  ['Le Labo','Santal 33','fashion','accessory',230,6,6,1,'Trendy cult scent']
];
/* ---------- GOLD & BULLION ---------- */
const SHOP_GOLD = [
  /* --- ORIGINAL ITEMS --- */
  ['Valcambi','1g Gold Bar (24K)','luxury','gold_bar',70,2,4,9999,'999.9 fine gold.',0,9999],
  ['Valcambi','5g Gold Bar (24K)','luxury','gold_bar',340,4,5,9999,'999.9 fine gold.',0,9999],
  ['Valcambi','10g Gold Bar (24K)','luxury','gold_bar',670,6,6,9999,'999.9 fine gold.',0,9999],
  ['PAMP Suisse','50g Gold Bar (24K)','luxury','gold_bar',3300,8,8,9999,'Certified investment bar.',0,9999],
  ['PAMP Suisse','100g Gold Bar (24K)','luxury','gold_bar',6600,10,10,9999,'Heavy investment bar.',0,9999],
  ['South African','Krugerrand 1oz Coin','luxury','gold_coin',2000,5,5,9999,'Classic gold bullion coin.',0,9999],
  ['Canadian','Maple Leaf 1oz Coin','luxury','gold_coin',2000,5,5,9999,'.9999 pure gold coin.',0,9999],
  ['American','Gold Eagle 1oz Coin','luxury','gold_coin',2000,5,5,9999,'US bullion coin.',0,9999],
  ['Tiffany & Co','Gold Chain 18K','fashion','jewelry',1500,8,9,9999,'Iconic gold chain.',0,9999],
  ['Cartier','Love Bracelet 18K','fashion','jewelry',6500,10,10,9999,'Iconic luxury gold.',0,9999],

  /* --- NEW: EXPANDED INVESTMENT BARS --- */
  ['BTC','10g Gold Bar (24K)','luxury','gold_bar',750,5,5,9999,'Billion Trade Co. 999.9 bar, highly liquid in MENA markets.',0,9999],
  ['BTC','20g Gold Bar (24K)','luxury','gold_bar',1500,7,7,9999,'Billion Trade Co. 999.9 investment bar.',0,9999],
  ['PAMP Suisse','1 oz Gold Bar (24K)','luxury','gold_bar',2300,6,7,9999,'World-renowned 31.1g minted gold bar with Lady Fortuna motif.',0,9999],
  ['Valcambi','250g Cast Gold Bar (24K)','luxury','gold_bar',18500,10,12,9999,'Heavy cast investment bar for serious wealth storage.',0,9999],
  ['Credit Suisse','1kg Gold Bar (24K)','luxury','gold_bar',75000,20,20,9999,'The ultimate wealth preserver. A massive 1 kilo gold brick.',0,9999],

  /* --- NEW: GLOBAL & REGIONAL GOLD COINS --- */
  ['Egyptian Mint','Gold Guineh (8g 21K)','luxury','gold_coin',550,4,4,9999,'Traditional Egyptian sovereign. 8 grams of 21-karat gold.',0,9999],
  ['Egyptian Mint','Half Gold Guineh (4g 21K)','luxury','gold_coin',280,2,3,9999,'Traditional 4-gram 21-karat gold coin. Easy to trade.',0,9999],
  ['British Royal Mint','Gold Sovereign (22K)','luxury','gold_coin',500,4,5,9999,'Classic 7.98g British gold coin, historically trusted worldwide.',0,9999],
  ['Austrian Mint','Philharmonic 1oz Coin','luxury','gold_coin',2050,5,5,9999,'Beautiful European .9999 gold coin featuring instruments.',0,9999],
  ['Perth Mint','Kangaroo 1oz Coin','luxury','gold_coin',2050,5,5,9999,'Australian pure gold bullion coin.',0,9999],
  ['Chinese Mint','Gold Panda (30g 24K)','luxury','gold_coin',2000,5,5,9999,'Highly collectible 30-gram Chinese gold coin.',0,9999],

  /* --- NEW: JEWELRY & CULTURAL ASSETS --- */
  ['Generic','18K Gold Wedding Band','fashion','jewelry',350,5,4,9999,'A simple, classic 18K gold wedding ring.',0,9999],
  ['L\'azurde','21K Gold Bangle (Ghaweisha)','fashion','jewelry',1200,8,7,9999,'Traditional 21K gold bangle, heavily traded and gifted in the Middle East.',0,9999],
  ['L\'azurde','21K Bridal Gold Set (Shabka)','fashion','jewelry',4500,15,12,9999,'A complete 21-karat necklace, ring, and earring set for weddings.',0,9999],
  
  /* --- NEW: HIGH-END DESIGNER JEWELRY --- */
  ['Van Cleef & Arpels','Vintage Alhambra Necklace','fashion','jewelry',2900,12,11,9999,'Iconic 18K yellow gold and onyx clover motif.',0,9999],
  ['Cartier','Juste un Clou Bracelet 18K','fashion','jewelry',7300,10,12,9999,'The famous Cartier nail bracelet in 18K yellow gold.',0,9999],
  ['Bvlgari','B.zero1 18K Gold Ring','fashion','jewelry',1800,9,10,9999,'Architectural 18K yellow gold band inspired by the Colosseum.',0,9999],
  ['Rolex','Day-Date 36mm (18K Gold)','luxury','watch',35000,18,20,9999,'The "President". Solid 18K yellow gold luxury timepiece.',0,9999]
];
/* ---------- AUTO-COMBINE ---------- */
const SHOP_ALL = [].concat(
  SHOP_PHONES, SHOP_AUDIO, SHOP_WATCHES, SHOP_TABLETS, SHOP_COMPUTERS, SHOP_TVS,
  SHOP_APPLIANCES, SHOP_FURNITURE, SHOP_FASHION, SHOP_GOLD
);

/* ============================================================
   END OF SHOPPING DATA
   ============================================================ */
