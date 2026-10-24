/* ============================================================
   DATA: VACATIONS & TRAVEL
   ============================================================ */

const VAC_COUNTRY_REGION = {
  egy: 'mena', sau: 'mena', uae: 'mena', tur: 'mena', jor: 'mena', lbn: 'mena',
  qat: 'mena', omn: 'mena', mar: 'mena', dza: 'mena',
  usa: 'north_america', can: 'north_america', mex: 'north_america',
  gbr: 'europe', deu: 'europe', fra: 'europe', ita: 'europe', esp: 'europe',
  nld: 'europe', grc: 'europe', prt: 'europe', che: 'europe', aut: 'europe',
  swe: 'europe', nor: 'europe', fin: 'europe', cze: 'europe', hun: 'europe',
  jpn: 'asia', kor: 'asia', chn: 'asia', sgp: 'asia', tha: 'asia', idn: 'asia',
  ind: 'asia', mly: 'asia', vnm: 'asia', phl: 'asia', twn: 'asia',
  aus: 'oceania', nzl: 'oceania', fji: 'oceania',
  bra: 'south_america', arg: 'south_america', per: 'south_america', chl: 'south_america', col: 'south_america',
  zaf: 'africa', ken: 'africa', egy_africa: 'africa', tza: 'africa', mus: 'africa'
};

const VAC_REGION_FACTOR = {
  mena:             { mena: 1.0, europe: 1.3, asia: 1.7, north_america: 2.4, oceania: 2.6, south_america: 2.5, africa: 1.4 },
  europe:           { mena: 1.3, europe: 1.0, asia: 2.0, north_america: 1.7, oceania: 2.5, south_america: 2.2, africa: 1.8 },
  north_america:    { mena: 2.4, europe: 1.7, asia: 2.2, north_america: 1.0, oceania: 2.3, south_america: 1.5, africa: 2.2 },
  asia:             { mena: 1.7, europe: 2.0, asia: 1.0, north_america: 2.2, oceania: 1.8, south_america: 2.5, africa: 2.1 },
  oceania:          { mena: 2.6, europe: 2.5, asia: 1.8, north_america: 2.3, oceania: 1.0, south_america: 2.8, africa: 2.5 },
  south_america:    { mena: 2.5, europe: 2.2, asia: 2.5, north_america: 1.5, oceania: 2.8, south_america: 1.0, africa: 2.3 },
  africa:           { mena: 1.4, europe: 1.8, asia: 2.1, north_america: 2.2, oceania: 2.5, south_america: 2.3, africa: 1.0 }
};

/* ---------- DESTINATIONS — Expanded ---------- */
const VAC_DESTINATIONS = [
  /* ---- EGYPT DOMESTIC ---- */
  { id: 'north_coast',   name: 'North Coast (Sahel)',      country: 'egy', region: 'mena', baseFlightUSD: 120,  tier: 'premium',  days_typical: 7,  best: ['summer'],    safety: 8,  language: 'ar', tag: 'Egypt\'s Riviera. Elite summer spot.' },
  { id: 'sharm',         name: 'Sharm El Sheikh',          country: 'egy', region: 'mena', baseFlightUSD: 180,  tier: 'mid',      days_typical: 5,  best: ['winter','spring'], safety: 8,  language: 'ar', tag: 'Red Sea diving paradise.' },
  { id: 'dahab',         name: 'Dahab',                    country: 'egy', region: 'mena', baseFlightUSD: 160,  tier: 'budget',   days_typical: 5,  best: ['spring','autumn'], safety: 8,  language: 'ar', tag: 'Backpacker bliss on the Red Sea.' },
  { id: 'gouna',         name: 'El Gouna',                 country: 'egy', region: 'mena', baseFlightUSD: 200,  tier: 'luxury',   days_typical: 6,  best: ['spring','autumn'], safety: 9,  language: 'ar', tag: 'European-style resort town.' },
  { id: 'hurghada',      name: 'Hurghada',                 country: 'egy', region: 'mena', baseFlightUSD: 170,  tier: 'mid',      days_typical: 5,  best: ['winter','spring'], safety: 8,  language: 'ar', tag: 'Beaches, diving, nightlife.' },
  { id: 'alexandria',    name: 'Alexandria Weekend',       country: 'egy', region: 'mena', baseFlightUSD: 60,   tier: 'budget',   days_typical: 3,  best: ['spring','autumn'], safety: 7,  language: 'ar', tag: 'Mediterranean charm, Bibliotheca, seafood.' },
  { id: 'luxor_aswan',   name: 'Luxor & Aswan Cruise',     country: 'egy', region: 'mena', baseFlightUSD: 200,  tier: 'premium',  days_typical: 5,  best: ['winter'],    safety: 8,  language: 'ar', tag: 'Ancient temples, Nile cruise.' },
 { id: 'home',    name: ' (Visit Family)',     country: 'egy', region: 'mena', baseFlightUSD: 180,  tier: 'budget',   days_typical: 10, best: ['any'],      safety: 7,  language: 'ar', tag: 'Stay with family, visit old friends, home cooking.' },
  { id: 'siwa',          name: 'Siwa Oasis',               country: 'egy', region: 'mena', baseFlightUSD: 100,  tier: 'mid',      days_typical: 4,  best: ['winter','spring'], safety: 9, language: 'ar', tag: 'Salt lakes, desert springs, ecolodges.' },
  { id: 'marsa_alam',    name: 'Marsa Alam',               country: 'egy', region: 'mena', baseFlightUSD: 220,  tier: 'premium',  days_typical: 6,  best: ['winter','spring'], safety: 8, language: 'ar', tag: 'Pristine reefs, dugongs, quiet luxury.' },

  /* ---- MIDDLE EAST ---- */
  { id: 'turkey',        name: 'Istanbul & Cappadocia',     country: 'tur', region: 'mena', baseFlightUSD: 350,  tier: 'mid',      days_typical: 7,  best: ['spring','autumn'], safety: 8,  language: 'tr', tag: 'Bosphorus, bazaars, hot-air balloons.' },
  { id: 'antalya',       name: 'Antalya Coast',             country: 'tur', region: 'mena', baseFlightUSD: 380,  tier: 'mid',      days_typical: 7,  best: ['summer'], safety: 8, language: 'tr', tag: 'Turkish Riviera, resorts, ruins.' },
  { id: 'dubai',         name: 'Dubai',                     country: 'uae', region: 'mena', baseFlightUSD: 300,  tier: 'luxury',   days_typical: 4,  best: ['winter'],    safety: 10, language: 'ar', tag: 'Ultra-modern, shopping, skyline.' },
  { id: 'abudhabi',      name: 'Abu Dhabi',                 country: 'uae', region: 'mena', baseFlightUSD: 320,  tier: 'premium',  days_typical: 3,  best: ['winter'],    safety: 10, language: 'ar', tag: 'Culture, F1, Louvre.' },
  { id: 'riyadh',        name: 'Riyadh',                    country: 'sau', region: 'mena', baseFlightUSD: 350,  tier: 'premium',  days_typical: 4,  best: ['winter'],    safety: 9,  language: 'ar', tag: 'Diriyah, Boulevard, heritage.' },
  { id: 'jeddah',        name: 'Jeddah',                    country: 'sau', region: 'mena', baseFlightUSD: 340,  tier: 'premium',  days_typical: 3,  best: ['winter'],    safety: 8,  language: 'ar', tag: 'Red Sea coast, Al Balad old town.' },
  { id: 'alula',         name: 'AlUla',                     country: 'sau', region: 'mena', baseFlightUSD: 450,  tier: 'luxury',   days_typical: 4,  best: ['winter'], safety: 9, language: 'ar', tag: 'Ancient desert tombs, luxury retreats.' },
  { id: 'beirut',        name: 'Beirut',                    country: 'lbn', region: 'mena', baseFlightUSD: 280,  tier: 'mid',      days_typical: 5,  best: ['spring','summer'], safety: 5, language: 'ar', tag: 'Food, nightlife, mountains.' },
  { id: 'doha',          name: 'Doha',                      country: 'qat', region: 'mena', baseFlightUSD: 300,  tier: 'premium',  days_typical: 3,  best: ['winter'], safety: 10, language: 'ar', tag: 'Museums, Souq Waqif, modern art.' },
  { id: 'muscat',        name: 'Muscat & Salalah',          country: 'omn', region: 'mena', baseFlightUSD: 380,  tier: 'premium',  days_typical: 6,  best: ['winter'], safety: 10, language: 'ar', tag: 'Mountains, wadis, frankincense.' },
  { id: 'marrakech',     name: 'Marrakech',                 country: 'mar', region: 'mena', baseFlightUSD: 500,  tier: 'mid',      days_typical: 6,  best: ['spring','autumn'], safety: 7, language: 'ar', tag: 'Medina, souks, riads, Atlas mountains.' },

  /* ---- EUROPE ---- */
  { id: 'italy',         name: 'Italy (Rome & Florence)',   country: 'ita', region: 'europe', baseFlightUSD: 700, tier: 'premium',  days_typical: 10, best: ['spring','autumn'], safety: 9,  language: 'it', tag: 'History, art, food. Eternal.' },
  { id: 'amalfi',        name: 'Amalfi Coast & Capri',      country: 'ita', region: 'europe', baseFlightUSD: 850, tier: 'luxury',   days_typical: 7,  best: ['summer'], safety: 9, language: 'it', tag: 'Clifftop views, limoncello, yachts.' },
  { id: 'france',        name: 'France (Paris)',            country: 'fra', region: 'europe', baseFlightUSD: 750, tier: 'premium',  days_typical: 7,  best: ['spring','autumn'], safety: 8,  language: 'fr', tag: 'Romance, cuisine, fashion.' },
  { id: 'riviera',       name: 'French Riviera (Nice, Cannes)', country: 'fra', region: 'europe', baseFlightUSD: 800, tier: 'luxury', days_typical: 8, best: ['summer'], safety: 8, language: 'fr', tag: 'Glamour, beaches, casinos.' },
  { id: 'spain',         name: 'Spain (Barcelona & Madrid)', country: 'esp', region: 'europe', baseFlightUSD: 720, tier: 'premium',  days_typical: 8,  best: ['spring','autumn'], safety: 9,  language: 'es', tag: 'Tapas, Gaudí, flamenco.' },
  { id: 'ibiza',         name: 'Ibiza',                     country: 'esp', region: 'europe', baseFlightUSD: 800, tier: 'luxury',   days_typical: 5,  best: ['summer'], safety: 8, language: 'es', tag: 'World-class clubs, sunsets, beaches.' },
  { id: 'greece',        name: 'Greece (Athens & Islands)', country: 'grc', region: 'europe', baseFlightUSD: 680, tier: 'premium',  days_typical: 8,  best: ['summer'], safety: 9,  language: 'el', tag: 'Santorini, Mykonos, ancient ruins.' },
  { id: 'gbr',           name: 'United Kingdom (London)',   country: 'gbr', region: 'europe', baseFlightUSD: 800, tier: 'premium',  days_typical: 7,  best: ['summer'],  safety: 9,  language: 'en', tag: 'Royal, pubs, West End, museums.' },
  { id: 'scotland',      name: 'Scottish Highlands',        country: 'gbr', region: 'europe', baseFlightUSD: 850, tier: 'mid',      days_typical: 7,  best: ['summer'], safety: 10, language: 'en', tag: 'Castles, lochs, whisky.' },
  { id: 'germany',       name: 'Germany (Berlin & Munich)', country: 'deu', region: 'europe', baseFlightUSD: 780, tier: 'premium',  days_typical: 7,  best: ['summer'],  safety: 9,  language: 'de', tag: 'Beer, history, castles, festivals.' },
  { id: 'switzerland',   name: 'Switzerland (Alps)',        country: 'che', region: 'europe', baseFlightUSD: 900, tier: 'luxury',   days_typical: 6,  best: ['summer','winter'], safety: 10, language: 'de', tag: 'Alpine luxury, skiing, chocolate.' },
  { id: 'amsterdam',     name: 'Amsterdam',                 country: 'nld', region: 'europe', baseFlightUSD: 800, tier: 'premium',  days_typical: 5,  best: ['spring','summer'], safety: 9, language: 'nl', tag: 'Canals, bicycles, Van Gogh.' },
  { id: 'lisbon',        name: 'Lisbon & Porto',            country: 'prt', region: 'europe', baseFlightUSD: 750, tier: 'mid',      days_typical: 7,  best: ['spring','autumn'], safety: 9, language: 'pt', tag: 'Pastéis, tiles, hills, wine.' },
  { id: 'vienna',        name: 'Vienna & Salzburg',         country: 'aut', region: 'europe', baseFlightUSD: 800, tier: 'premium',  days_typical: 6,  best: ['winter','spring'], safety: 10, language: 'de', tag: 'Classical music, palaces, cafes.' },
  { id: 'prague',        name: 'Prague',                    country: 'cze', region: 'europe', baseFlightUSD: 700, tier: 'mid',      days_typical: 4,  best: ['spring','autumn'], safety: 9, language: 'cs', tag: 'Fairy-tale architecture, cheap beer.' },
  { id: 'iceland',       name: 'Iceland',                   country: 'nor', region: 'europe', baseFlightUSD: 1100, tier: 'premium', days_typical: 8, best: ['summer','winter'], safety: 10, language: 'is', tag: 'Northern lights, geysers, waterfalls.' },

  /* ---- ASIA ---- */
  { id: 'japan',         name: 'Japan (Tokyo & Kyoto)',     country: 'jpn', region: 'asia', baseFlightUSD: 1100, tier: 'premium',  days_typical: 10, best: ['spring','autumn'], safety: 10, language: 'ja', tag: 'Cherry blossoms, sushi, bullet trains.' },
  { id: 'hokkaido',      name: 'Hokkaido',                  country: 'jpn', region: 'asia', baseFlightUSD: 1200, tier: 'premium',  days_typical: 7,  best: ['winter'], safety: 10, language: 'ja', tag: 'World-class powder snow, hot springs.' },
  { id: 'korea',         name: 'South Korea (Seoul)',       country: 'kor', region: 'asia', baseFlightUSD: 1050, tier: 'premium',  days_typical: 7,  best: ['spring','autumn'], safety: 10, language: 'ko', tag: 'K-pop, BBQ, palaces, skincare.' },
  { id: 'thailand',      name: 'Thailand (Bangkok & Phuket)', country: 'tha', region: 'asia', baseFlightUSD: 950, tier: 'mid',      days_typical: 8,  best: ['winter'],    safety: 8,  language: 'th', tag: 'Temples, beaches, street food.' },
  { id: 'chiangmai',     name: 'Chiang Mai',                country: 'tha', region: 'asia', baseFlightUSD: 1000, tier: 'budget',   days_typical: 6,  best: ['winter'], safety: 8, language: 'th', tag: 'Digital nomads, temples, elephants.' },
  { id: 'maldives',      name: 'Maldives (Overwater Villas)', country: 'mdv', region: 'asia', baseFlightUSD: 1050, tier: 'luxury',   days_typical: 5,  best: ['winter'],    safety: 10, language: 'dv', tag: 'Honeymoon paradise.' },
  { id: 'bali',          name: 'Bali, Indonesia',            country: 'idn', region: 'asia', baseFlightUSD: 1000, tier: 'mid',      days_typical: 8,  best: ['spring','autumn'], safety: 8,  language: 'id', tag: 'Rice terraces, yoga, surf.' },
  { id: 'singapore',     name: 'Singapore',                  country: 'sgp', region: 'asia', baseFlightUSD: 1080, tier: 'premium',  days_typical: 4,  best: ['winter','spring'], safety: 10, language: 'en', tag: 'Futuristic, hawker food, clean.' },
  { id: 'india',         name: 'India (Delhi & Agra)',       country: 'ind', region: 'asia', baseFlightUSD: 780, tier: 'budget',   days_typical: 7,  best: ['winter'],    safety: 6,  language: 'hi', tag: 'Taj Mahal, colors, spices.' },
  { id: 'goa',           name: 'Goa',                       country: 'ind', region: 'asia', baseFlightUSD: 850, tier: 'budget',   days_typical: 6,  best: ['winter'], safety: 6, language: 'hi', tag: 'Beaches, parties, Portuguese heritage.' },
  { id: 'vietnam',       name: 'Vietnam (Hanoi & Halong)',  country: 'vnm', region: 'asia', baseFlightUSD: 950, tier: 'budget',   days_typical: 10, best: ['spring','autumn'], safety: 8, language: 'vi', tag: 'Pho, karst bays, motorbikes.' },
  { id: 'philippines',   name: 'Philippines (Palawan)',     country: 'phl', region: 'asia', baseFlightUSD: 1100, tier: 'mid',      days_typical: 10, best: ['winter','spring'], safety: 7, language: 'en', tag: 'Pristine beaches, island hopping.' },

  /* ---- AMERICAS ---- */
  { id: 'usa_nyc',       name: 'New York City',              country: 'usa', region: 'north_america', baseFlightUSD: 1300, tier: 'premium', days_typical: 5, best: ['spring','autumn'], safety: 8, language: 'en', tag: 'Broadway, Central Park, SoHo.' },
  { id: 'usa_la',        name: 'Los Angeles & San Diego',    country: 'usa', region: 'north_america', baseFlightUSD: 1250, tier: 'premium', days_typical: 6, best: ['summer'], safety: 8, language: 'en', tag: 'Beaches, Hollywood, Disneyland.' },
  { id: 'usa_vegas',     name: 'Las Vegas & Grand Canyon',   country: 'usa', region: 'north_america', baseFlightUSD: 1200, tier: 'premium', days_typical: 4, best: ['spring','autumn'], safety: 8, language: 'en', tag: 'Strip, shows, desert.' },
  { id: 'usa_miami',     name: 'Miami',                     country: 'usa', region: 'north_america', baseFlightUSD: 1100, tier: 'premium', days_typical: 5, best: ['winter','spring'], safety: 7, language: 'en', tag: 'South Beach, Art Deco, nightlife.' },
  { id: 'usa_hawaii',    name: 'Hawaii (Maui & Oahu)',      country: 'usa', region: 'north_america', baseFlightUSD: 1600, tier: 'luxury',  days_typical: 8, best: ['summer','winter'], safety: 9, language: 'en', tag: 'Volcanoes, surf, luaus.' },
  { id: 'canada',        name: 'Canada (Toronto & Vancouver)', country: 'can', region: 'north_america', baseFlightUSD: 1250, tier: 'premium', days_typical: 7, best: ['summer'], safety: 10, language: 'en', tag: 'Nature, cities, maple.' },
  { id: 'mexico',        name: 'Mexico (Cancun & Tulum)',   country: 'mex', region: 'north_america', baseFlightUSD: 1100, tier: 'mid',     days_typical: 7, best: ['winter','spring'], safety: 6, language: 'es', tag: 'Cenotes, ruins, all-inclusives.' },
  { id: 'brazil',        name: 'Brazil (Rio de Janeiro)',   country: 'bra', region: 'south_america', baseFlightUSD: 1400, tier: 'mid',     days_typical: 7, best: ['winter'], safety: 5, language: 'pt', tag: 'Carnival, Copacabana, Christ the Redeemer.' },
  { id: 'peru',          name: 'Peru (Machu Picchu)',       country: 'per', region: 'south_america', baseFlightUSD: 1500, tier: 'mid',     days_typical: 8, best: ['summer'], safety: 6, language: 'es', tag: 'Inca trail, Andes, ceviche.' },

  /* ---- OCEANIA / AFRICA ---- */
  { id: 'australia',     name: 'Australia (Sydney)',         country: 'aus', region: 'oceania', baseFlightUSD: 1700, tier: 'premium', days_typical: 8, best: ['winter'], safety: 10, language: 'en', tag: 'Opera House, beaches, wildlife.' },
  { id: 'new_zealand',   name: 'New Zealand',               country: 'nzl', region: 'oceania', baseFlightUSD: 1800, tier: 'premium', days_typical: 12, best: ['winter'], safety: 10, language: 'en', tag: 'Fjords, Lord of the Rings, extreme sports.' },
  { id: 'fiji',          name: 'Fiji',                      country: 'fji', region: 'oceania', baseFlightUSD: 1900, tier: 'luxury',  days_typical: 7, best: ['summer'], safety: 9, language: 'en', tag: 'South Pacific tropical paradise.' },
  { id: 'south_africa',  name: 'South Africa (Cape Town)',   country: 'zaf', region: 'africa', baseFlightUSD: 1150, tier: 'mid', days_typical: 7, best: ['winter'], safety: 6, language: 'en', tag: 'Table Mountain, safari, wine.' },
  { id: 'kenya',         name: 'Kenya Safari',               country: 'ken', region: 'africa', baseFlightUSD: 900, tier: 'premium', days_typical: 6, best: ['summer'], safety: 6, language: 'sw', tag: 'Maasai Mara, migration, wildlife.' },
  { id: 'tanzania',      name: 'Tanzania (Serengeti & Zanzibar)', country: 'tza', region: 'africa', baseFlightUSD: 950, tier: 'premium', days_typical: 8, best: ['summer'], safety: 6, language: 'sw', tag: 'Safari and spice island beaches.' },
  { id: 'mauritius',     name: 'Mauritius',                 country: 'mus', region: 'africa', baseFlightUSD: 1000, tier: 'luxury', days_typical: 7, best: ['spring','autumn'], safety: 9, language: 'en', tag: 'Indian Ocean resorts, waterfalls.' },
  { id: 'maldives_honeymoon', name: 'Maldives Honeymoon Package', country: 'mdv', region: 'asia', baseFlightUSD: 1050, tier: 'luxury', days_typical: 7, best: ['winter'], safety: 10, language: 'dv', tag: 'Curated honeymoon escape.' }
];

/* ---------- AIRFARE CLASSES ---------- */
const VAC_AIRFARE_CLASSES = [
  { id: 'economy',  label: 'Economy',          mult: 1.0, comfort: 0,  happiness: 0,  sos: 0 },
  { id: 'premium',  label: 'Premium Economy',  mult: 1.7, comfort: 2,  happiness: 2,  sos: 1 },
  { id: 'business', label: 'Business Class',   mult: 3.5, comfort: 5,  happiness: 5,  sos: 3 },
  { id: 'first',    label: 'First Class',      mult: 6.0, comfort: 8,  happiness: 10, sos: 5 },
  { id: 'private',  label: 'Private Jet Charter', mult: 25.0, comfort: 10, happiness: 15, sos: 10 }
];

/* ---------- ACCOMMODATION TIERS ---------- */
const VAC_HOTEL_TIERS = [
  { id: 'hostel',      label: 'Hostel / Dorm',             mult: 0.20, comfort: 1,  happiness: 0,  sos: 0, perNightUSD: 25,  risks: ['noise', 'shared_bath', 'theft'] },
  { id: 'budget',      label: 'Budget Guesthouse',         mult: 0.35, comfort: 2,  happiness: 1,  sos: 0, perNightUSD: 45,  risks: ['bad_bed'] },
  { id: 'airbnb',      label: 'Airbnb / Apartment',        mult: 0.55, comfort: 4,  happiness: 3,  sos: 1, perNightUSD: 75,  risks: ['cleaning_fee', 'weird_host'] },
  { id: 'hotel3',      label: '3-Star Hotel',              mult: 0.80, comfort: 5,  happiness: 3,  sos: 1, perNightUSD: 110 },
  { id: 'hotel4',      label: '4-Star Hotel',              mult: 1.20, comfort: 7,  happiness: 5,  sos: 2, perNightUSD: 180 },
  { id: 'hotel5',      label: '5-Star Luxury Hotel',       mult: 2.20, comfort: 9,  happiness: 8,  sos: 4, perNightUSD: 380 },
  { id: 'resort',      label: 'Ultra-Luxury Resort / Villa',mult: 3.50, comfort: 10, happiness: 12, sos: 6, perNightUSD: 650 },
  { id: 'overwater',   label: 'Overwater Bungalow',        mult: 5.00, comfort: 10, happiness: 15, sos: 8, perNightUSD: 1200 },
  { id: 'stay_family', label: 'Stay with Family Abroad',   mult: 0,    comfort: 4,  happiness: 4,  sos: 1, perNightUSD: 0, requiresFamilyAbroad: true }
];

/* ---------- ACTIVITIES per destination (grouped by destination country) ---------- */
const VAC_ACTIVITIES = {
  egy: [
    { id: 'pyramids',   label: 'Pyramids & Sphinx tour',   costUSD: 80,  happy: 6,  social: 2, hours: 6 },
    { id: 'nile_cruise',label: 'Nile dinner cruise',       costUSD: 120, happy: 5,  social: 3, hours: 3 },
    { id: 'khan',       label: 'Khan El Khalili bazaar',   costUSD: 40,  happy: 4,  social: 2, hours: 3 },
    { id: 'diving',     label: 'Scuba diving trip',        costUSD: 180, happy: 8,  health: 2, hours: 8 },
    { id: 'desert',     label: 'Desert safari + BBQ',      costUSD: 150, happy: 7,  social: 3, hours: 6 },
    { id: 'museum',     label: 'Grand Egyptian Museum',    costUSD: 70,  happy: 5,  smarts: 4, hours: 5 },
    { id: 'kitesurf',   label: 'Kitesurfing lesson',       costUSD: 100, happy: 6,  health: 3, hours: 4 }
  ],
    home: [
    { id: 'family_time',  label: 'Extended family gathering',  costUSD: 0,   happy: 8,  social: 5, hours: 6 },
    { id: 'old_friends',  label: 'Meet childhood friends',     costUSD: 40,  happy: 7,  social: 4, hours: 4 },
    { id: 'home_food',    label: 'Home-cooked feast',          costUSD: 20,  happy: 6,  health: 2, hours: 3 },
    { id: 'cairo_tour',   label: 'Old Cairo walking tour',     costUSD: 50,  happy: 5,  smarts: 2, hours: 5 },
    { id: 'grandma_time', label: 'Time with grandparents',     costUSD: 0,   happy: 10, social: 2, hours: 8 }
  ],
   tur: [
    { id: 'hagia',      label: 'Hagia Sophia & Blue Mosque', costUSD: 80, happy: 5, smarts: 2, hours: 5 },
    { id: 'balloon',    label: 'Cappadocia hot-air balloon', costUSD: 250, happy: 12, social: 3, hours: 4 },
    { id: 'bosphorus',  label: 'Bosphorus yacht cruise',     costUSD: 120, happy: 6, social: 2, hours: 3 },
    { id: 'bazaar',     label: 'Grand Bazaar shopping',    costUSD: 0,   happy: 3, social: 2, hours: 4 },
    { id: 'hammam',     label: 'Luxury Turkish hammam',    costUSD: 150, happy: 7, health: 4, hours: 3 },
    { id: 'ruins',      label: 'Ephesus ancient ruins',    costUSD: 100, happy: 5, smarts: 3, hours: 6 }
  ],
  uae: [
    { id: 'burj',       label: 'Burj Khalifa VIP Lounge',  costUSD: 150, happy: 8, social: 4, hours: 3 },
    { id: 'desert_uae', label: 'Luxury desert dune bashing',costUSD: 200, happy: 9, social: 3, hours: 6 },
    { id: 'mall',       label: 'Dubai Mall VIP shopper',   costUSD: 50,  happy: 4, social: 3, hours: 5 },
    { id: 'ferrari',    label: 'Ferrari World (Abu Dhabi)',costUSD: 110, happy: 7, social: 3, hours: 8 },
    { id: 'ski',        label: 'Ski Dubai indoor',         costUSD: 90,  happy: 6, health: 2, hours: 4 },
    { id: 'yacht',      label: 'Private yacht rental',     costUSD: 500, happy: 10, social: 8, hours: 4 }
  ],
  sau: [
    { id: 'diriyah',    label: 'At-Turaif & Diriyah Tour', costUSD: 80,  happy: 5, smarts: 3, hours: 4 },
    { id: 'edge',       label: 'Edge of the World trek',   costUSD: 120, happy: 8, health: 2, hours: 6 },
    { id: 'boulevard',  label: 'Boulevard Riyadh City',    costUSD: 50,  happy: 6, social: 4, hours: 4 },
    { id: 'hegra',      label: 'Hegra (AlUla) guided tour',costUSD: 150, happy: 9, smarts: 4, hours: 5 }
  ],
  ita: [
    { id: 'colosseum',  label: 'Colosseum VIP underground',costUSD: 120, happy: 7, smarts: 4, hours: 4 },
    { id: 'vatican',    label: 'Vatican early access',     costUSD: 150, happy: 8, smarts: 4, hours: 5 },
    { id: 'uffizi',     label: 'Uffizi Gallery (Florence)',costUSD: 80,  happy: 5, smarts: 3, hours: 4 },
    { id: 'gondola',    label: 'Gondola ride in Venice',   costUSD: 120, happy: 8, social: 2, hours: 1 },
    { id: 'wine',       label: 'Tuscany vineyard tour',    costUSD: 200, happy: 7, social: 4, hours: 6 },
    { id: 'pompeii',    label: 'Pompeii guided day-trip',  costUSD: 150, happy: 6, smarts: 3, hours: 8 },
    { id: 'cooking',    label: 'Pasta making class',       costUSD: 100, happy: 7, smarts: 2, hours: 4 }
  ],
  fra: [
    { id: 'eiffel',     label: 'Eiffel Tower summit & dine',costUSD: 150, happy: 9, social: 4, hours: 3 },
    { id: 'louvre',     label: 'Louvre private tour',      costUSD: 120, happy: 7, smarts: 4, hours: 4 },
    { id: 'versailles', label: 'Versailles Palace',        costUSD: 80,  happy: 6, smarts: 2, hours: 6 },
    { id: 'riviera',    label: 'Monaco & Riviera day trip',costUSD: 250, happy: 9, social: 5, hours: 10 },
    { id: 'michelin',   label: '3-Star Michelin dinner',   costUSD: 450, happy: 12, social: 7, hours: 4 },
    { id: 'wine_bordeaux',label: 'Bordeaux wine tasting',  costUSD: 180, happy: 7, social: 3, hours: 6 }
  ],
  esp: [
    { id: 'sagrada',    label: 'Sagrada Familia skip-line',costUSD: 80,  happy: 7, smarts: 3, hours: 3 },
    { id: 'flamenco',   label: 'Flamenco show + dinner',   costUSD: 120, happy: 7, social: 4, hours: 3 },
    { id: 'park_guell', label: 'Park Güell guided tour',   costUSD: 90,  happy: 5, smarts: 2, hours: 4 },
    { id: 'tapas',      label: 'Gourmet tapas tour',       costUSD: 120, happy: 8, social: 4, hours: 4 },
    { id: 'ibiza_club', label: 'VIP Club Table (Ibiza)',   costUSD: 500, happy: 10, social: 8, hours: 6 }
  ],
  gbr: [
    { id: 'tower_london', label: 'Tower of London & Jewels',costUSD: 80,  happy: 6, smarts: 3, hours: 4 },
    { id: 'west_end',   label: 'West End premium seats',   costUSD: 220, happy: 9, social: 4, hours: 3 },
    { id: 'afternoon_tea',label: 'Luxury Afternoon Tea',   costUSD: 100, happy: 6, social: 3, hours: 2 },
    { id: 'stonehenge', label: 'Stonehenge inner circle',  costUSD: 180, happy: 7, smarts: 3, hours: 8 },
    { id: 'highlands',  label: 'Loch Ness & Glencoe tour', costUSD: 150, happy: 8, smarts: 2, hours: 10 }
  ],
  deu: [
    { id: 'neuschwanstein', label: 'Neuschwanstein Castle',costUSD: 90,  happy: 7, smarts: 2, hours: 8 },
    { id: 'beer',       label: 'Munich beer garden tour',  costUSD: 80,  happy: 6, social: 5, hours: 4 },
    { id: 'berlin_wall',label: 'Berlin Wall & Cold War',   costUSD: 50,  happy: 5, smarts: 4, hours: 3 },
    { id: 'octoberfest',label: 'Oktoberfest VIP Tent',     costUSD: 300, happy: 12, social: 8, hours: 8, seasonal: ['autumn'] }
  ],
  che: [
    { id: 'jungfrau',   label: 'Jungfraujoch (Top of Europe)', costUSD: 250, happy: 10, health: 2, hours: 10 },
    { id: 'ski_swiss',  label: 'Private Alps ski lesson',  costUSD: 400, happy: 10, health: 5, hours: 6, seasonal: ['winter'] },
    { id: 'chocolate',  label: 'Swiss chocolate making',   costUSD: 120, happy: 7, social: 2, hours: 4 },
    { id: 'glacier',    label: 'Glacier Express first class',costUSD: 350, happy: 9, smarts: 2, hours: 8 }
  ],
  nld: [
    { id: 'canal',      label: 'Amsterdam canal cruise',   costUSD: 40,  happy: 5, social: 2, hours: 2 },
    { id: 'vangogh',    label: 'Van Gogh Museum',          costUSD: 30,  happy: 6, smarts: 4, hours: 3 },
    { id: 'bike',       label: 'Countryside bike tour',    costUSD: 50,  happy: 7, health: 3, hours: 4 }
  ],
  jpn: [
    { id: 'fuji',       label: 'Mount Fuji private tour',  costUSD: 250, happy: 9, smarts: 2, hours: 10 },
    { id: 'sushi',      label: 'Omakase sushi experience', costUSD: 350, happy: 11, social: 4, hours: 2 },
    { id: 'kyoto',      label: 'Geisha district walking tour',costUSD: 150, happy: 8, smarts: 3, hours: 4 },
    { id: 'shinkansen', label: 'Green Car bullet train',   costUSD: 180, happy: 6, smarts: 2, hours: 3 },
    { id: 'onsen',      label: 'Luxury ryokan onsen',      costUSD: 200, happy: 9, health: 5, hours: 4 },
    { id: 'akihabara',  label: 'Akihabara anime & gaming', costUSD: 80,  happy: 7, social: 3, hours: 5 }
  ],
  tha: [
    { id: 'beach',      label: 'Phi Phi Islands speedboat',costUSD: 150, happy: 9, social: 3, hours: 8 },
    { id: 'temple_thai',label: 'Grand Palace & Emerald Buddha',costUSD: 60, happy: 6, smarts: 3, hours: 4 },
    { id: 'massage',    label: 'Luxury Thai spa day',      costUSD: 120, happy: 8, health: 5, hours: 3 },
    { id: 'street_food',label: 'Bangkok midnight food tour',costUSD: 80, happy: 7, social: 3, hours: 4 },
    { id: 'elephants',  label: 'Ethical elephant sanctuary',costUSD: 120, happy: 10, social: 2, hours: 6 }
  ],
  mdv: [
    { id: 'diving_mv',  label: 'Scuba diving with mantas', costUSD: 250, happy: 10, health: 2, hours: 4 },
    { id: 'dolphin',    label: 'Private sunset yacht',     costUSD: 500, happy: 12, social: 5, hours: 3 },
    { id: 'spa_mv',     label: 'Underwater spa treatment', costUSD: 350, happy: 11, health: 4, hours: 2 },
    { id: 'dinner_mv',  label: 'Private sandbank dinner',  costUSD: 400, happy: 10, social: 6, hours: 3 }
  ],
  idn: [
    { id: 'rice',       label: 'Tegallalang rice terraces',costUSD: 40,  happy: 6, social: 2, hours: 4 },
    { id: 'ubud',       label: 'Ubud monkey forest & swing',costUSD: 60, happy: 7, social: 2, hours: 4 },
    { id: 'bali_surf',  label: 'Private surf lesson',      costUSD: 100, happy: 8, health: 4, hours: 3 },
    { id: 'bali_spa',   label: 'Balinese flower bath spa', costUSD: 150, happy: 9, health: 4, hours: 3 },
    { id: 'volcano',    label: 'Mount Batur sunrise trek', costUSD: 150, happy: 9, health: 3, hours: 8 }
  ],
  sgp: [
    { id: 'marina_bay', label: 'Marina Bay Sands SkyPark', costUSD: 30,  happy: 5, hours: 2 },
    { id: 'universal',  label: 'Universal Studios VIP',    costUSD: 250, happy: 10, social: 4, hours: 8 },
    { id: 'gardens',    label: 'Gardens by the Bay domes', costUSD: 50,  happy: 6, smarts: 2, hours: 4 },
    { id: 'hawker',     label: 'Michelin hawker food tour',costUSD: 80,  happy: 7, social: 3, hours: 3 },
    { id: 'night_safari',label: 'Night Safari zoo',        costUSD: 60,  happy: 7, smarts: 2, hours: 4 }
  ],
  ind: [
    { id: 'taj',        label: 'Taj Mahal private sunrise',costUSD: 100, happy: 10, smarts: 3, hours: 5 },
    { id: 'red_fort',   label: 'Old Delhi rickshaw tour',  costUSD: 40,  happy: 6, smarts: 2, hours: 4 },
    { id: 'yoga',       label: 'Rishikesh ashram retreat', costUSD: 150, happy: 8, health: 5, hours: 8 },
    { id: 'safari_ind', label: 'Ranthambore tiger safari', costUSD: 300, happy: 9, social: 2, hours: 6 },
    { id: 'goa_party',  label: 'Goa beach club party',     costUSD: 100, happy: 8, social: 5, hours: 6 }
  ],
  usa: [
    { id: 'statue',     label: 'Statue of Liberty crown',  costUSD: 80,  happy: 6, smarts: 3, hours: 4 },
    { id: 'broadway',   label: 'Broadway premium orchestra',costUSD: 350, happy: 10, social: 4, hours: 3 },
    { id: 'hollywood',  label: 'Warner Bros studio VIP',   costUSD: 150, happy: 8, smarts: 2, hours: 4 },
    { id: 'disney',     label: 'Disneyland VIP tour',      costUSD: 600, happy: 12, social: 5, hours: 10 },
    { id: 'grand_canyon',label: 'Grand Canyon helicopter', costUSD: 450, happy: 12, social: 3, hours: 4 },
    { id: 'vegas_show', label: 'Cirque du Soleil front row',costUSD: 250, happy: 10, social: 5, hours: 3 },
    { id: 'nba_game',   label: 'Courtside NBA tickets',    costUSD: 800, happy: 11, social: 7, hours: 4 },
    { id: 'helicopter', label: 'NYC helicopter night tour',costUSD: 300, happy: 10, social: 4, hours: 2 }
  ],
  can: [
    { id: 'niagara',    label: 'Niagara Falls boat tour',  costUSD: 120, happy: 8, social: 2, hours: 8 },
    { id: 'banff',      label: 'Banff & Lake Louise',      costUSD: 300, happy: 10, health: 2, hours: 10 },
    { id: 'cn_tower',   label: 'CN Tower EdgeWalk',        costUSD: 200, happy: 8, social: 3, hours: 2 },
    { id: 'ski_whistler',label: 'Whistler skiing',         costUSD: 250, happy: 9, health: 4, hours: 8, seasonal: ['winter'] }
  ],
  aus: [
    { id: 'opera',      label: 'Sydney Opera House show',  costUSD: 150, happy: 8, smarts: 3, hours: 3 },
    { id: 'bondi',      label: 'Bondi Beach surf lesson',  costUSD: 90,  happy: 7, health: 3, hours: 4 },
    { id: 'harbour',    label: 'Sydney Harbour bridge climb',costUSD: 250, happy: 10, health: 2, hours: 4 },
    { id: 'blue_mtn',   label: 'Blue Mountains luxury tour',costUSD: 200, happy: 8, smarts: 2, hours: 10 },
    { id: 'reef',       label: 'Great Barrier Reef dive',  costUSD: 450, happy: 12, health: 2, hours: 8 }
  ],
  zaf: [
    { id: 'safari_zaf', label: 'Kruger private lodge safari',costUSD: 600, happy: 12, social: 3, hours: 10 },
    { id: 'table',      label: 'Table Mountain cable car', costUSD: 80,  happy: 6, health: 2, hours: 3 },
    { id: 'wine_zaf',   label: 'Stellenbosch gourmet wine',costUSD: 200, happy: 8, social: 4, hours: 8 },
    { id: 'shark',      label: 'Great White shark cage dive',costUSD: 250, happy: 10, social: 3, hours: 6 }
  ],
  ken: [
    { id: 'maasai',     label: 'Maasai Mara migration safari',costUSD: 800, happy: 15, social: 3, hours: 12 },
    { id: 'balloon_ke', label: 'Hot air balloon + champagne',costUSD: 550, happy: 13, social: 4, hours: 4 },
    { id: 'giraffe',    label: 'Giraffe Manor breakfast',  costUSD: 200, happy: 10, social: 3, hours: 3 }
  ],
  mex: [
    { id: 'chichen',    label: 'Chichen Itza & Cenote',    costUSD: 120, happy: 8, smarts: 4, hours: 8 },
    { id: 'tulum',      label: 'Tulum ruins & beach club', costUSD: 150, happy: 9, social: 4, hours: 8 },
    { id: 'food_mex',   label: 'Authentic street taco tour',costUSD: 60, happy: 7, social: 3, hours: 3 }
  ],
  bra: [
    { id: 'christ',     label: 'Christ the Redeemer train',costUSD: 80, happy: 7, social: 2, hours: 4 },
    { id: 'sugarloaf',  label: 'Sugarloaf Mountain cable car',costUSD: 70, happy: 7, social: 2, hours: 3 },
    { id: 'carnival',   label: 'Sambadrome Parade tickets',costUSD: 400, happy: 12, social: 8, hours: 8, seasonal: ['winter'] },
    { id: 'copacabana', label: 'Copacabana beach day',     costUSD: 30, happy: 6, social: 4, hours: 6 }
  ]
};

/* ---------- VISA POLICIES ---------- */
const VAC_VISA_REQUIREMENTS = {
  /* Destination → which passport tiers need visa */
  /* tier: 'strong' (US/UK/EU/JP), 'mid' (Gulf, Saudi, UAE), 'weak' (Egypt, India) */
  north_coast:  { strong: false, mid: false, weak: false, visa: 'domestic' },
   home:        { strong: false, mid: false, weak: false, visa: 'domestic' },
  sharm:        { strong: false, mid: false, weak: false, visa: 'domestic' },
  dahab:        { strong: false, mid: false, weak: false, visa: 'domestic' },
  gouna:        { strong: false, mid: false, weak: false, visa: 'domestic' },
  hurghada:     { strong: false, mid: false, weak: false, visa: 'domestic' },
  alexandria:   { strong: false, mid: false, weak: false, visa: 'domestic' },
  luxor_aswan:  { strong: false, mid: false, weak: false, visa: 'domestic' },
  siwa:         { strong: false, mid: false, weak: false, visa: 'domestic' },
  marsa_alam:   { strong: false, mid: false, weak: false, visa: 'domestic' },
  turkey:       { strong: false, mid: false, weak: true,  visa: 'evisa' },
  antalya:      { strong: false, mid: false, weak: true,  visa: 'evisa' },
  dubai:        { strong: false, mid: false, weak: true,  visa: 'evisa' },
  abudhabi:     { strong: false, mid: false, weak: true,  visa: 'evisa' },
  riyadh:       { strong: true,  mid: true,  weak: true,  visa: 'evisa' },
  jeddah:       { strong: true,  mid: true,  weak: true,  visa: 'evisa' },
  alula:        { strong: true,  mid: true,  weak: true,  visa: 'evisa' },
  beirut:       { strong: false, mid: false, weak: true,  visa: 'voa' },
  doha:         { strong: false, mid: false, weak: true,  visa: 'evisa' },
  muscat:       { strong: false, mid: false, weak: true,  visa: 'evisa' },
  marrakech:    { strong: false, mid: false, weak: true,  visa: 'evisa' },
  italy:        { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  amalfi:       { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  france:       { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  riviera:      { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  spain:        { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  ibiza:        { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  greece:       { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  gbr:          { strong: false, mid: true,  weak: true,  visa: 'uk_visa' },
  scotland:     { strong: false, mid: true,  weak: true,  visa: 'uk_visa' },
  germany:      { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  switzerland:  { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  amsterdam:    { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  lisbon:       { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  vienna:       { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  prague:       { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  iceland:      { strong: false, mid: true,  weak: true,  visa: 'schengen' },
  japan:        { strong: false, mid: true,  weak: true,  visa: 'standard' },
  hokkaido:     { strong: false, mid: true,  weak: true,  visa: 'standard' },
  korea:        { strong: false, mid: true,  weak: true,  visa: 'standard' },
  thailand:     { strong: false, mid: false, weak: true,  visa: 'voa' },
  chiangmai:    { strong: false, mid: false, weak: true,  visa: 'voa' },
  maldives:     { strong: false, mid: false, weak: false, visa: 'voa' },
  bali:         { strong: false, mid: false, weak: true,  visa: 'voa' },
  singapore:    { strong: false, mid: false, weak: true,  visa: 'standard' },
  india:        { strong: false, mid: false, weak: true,  visa: 'evisa' },
  goa:          { strong: false, mid: false, weak: true,  visa: 'evisa' },
  vietnam:      { strong: false, mid: true,  weak: true,  visa: 'evisa' },
  philippines:  { strong: false, mid: false, weak: true,  visa: 'standard' },
  usa_nyc:      { strong: false, mid: true,  weak: true,  visa: 'usa_b1b2' },
  usa_la:       { strong: false, mid: true,  weak: true,  visa: 'usa_b1b2' },
  usa_vegas:    { strong: false, mid: true,  weak: true,  visa: 'usa_b1b2' },
  usa_miami:    { strong: false, mid: true,  weak: true,  visa: 'usa_b1b2' },
  usa_hawaii:   { strong: false, mid: true,  weak: true,  visa: 'usa_b1b2' },
  canada:       { strong: false, mid: true,  weak: true,  visa: 'canada_visa' },
  mexico:       { strong: false, mid: true,  weak: true,  visa: 'standard' },
  brazil:       { strong: false, mid: true,  weak: true,  visa: 'standard' },
  peru:         { strong: false, mid: true,  weak: true,  visa: 'standard' },
  australia:    { strong: false, mid: true,  weak: true,  visa: 'australia_visa' },
  new_zealand:  { strong: false, mid: true,  weak: true,  visa: 'standard' },
  fiji:         { strong: false, mid: false, weak: true,  visa: 'standard' },
  south_africa: { strong: false, mid: false, weak: true,  visa: 'standard' },
  kenya:        { strong: false, mid: false, weak: true,  visa: 'evisa' },
  tanzania:     { strong: false, mid: false, weak: true,  visa: 'evisa' },
  mauritius:    { strong: false, mid: false, weak: false, visa: 'voa' }
};

const VAC_VISA_WAIT_MONTHS = {
  domestic: 0, evisa: 1, voa: 0, schengen: 3, uk_visa: 2,
  usa_b1b2: 5, canada_visa: 4, australia_visa: 2, standard: 2
};

const VAC_VISA_FEES_USD = {
  domestic: 0, evisa: 90, voa: 40, schengen: 100, uk_visa: 160,
  usa_b1b2: 185, canada_visa: 110, australia_visa: 145, standard: 100
};

/* ---------- TRIP EVENTS — Expanded to 60 events ---------- */
const VAC_TRIP_EVENTS = [
  { id: 'great_sunset',    weight: 10, title: 'Amazing sunset',        happy: 8,  soc: 2, costUSD: 0, text: 'The most beautiful sunset you\'ve seen.' },
  { id: 'lost_luggage',    weight: 5,  title: 'Lost luggage',          happy: -6, costUSD: 200, text: 'Your checked bag never arrived. Had to buy replacements.' },
  { id: 'flight_delay',    weight: 6,  title: 'Flight delayed',        happy: -4, costUSD: 0, text: 'Delayed 6 hours. Sat in the airport.' },
  { id: 'food_poison',     weight: 4,  title: 'Food poisoning',        happy: -10, health: -4, costUSD: 150, text: 'Bad seafood. Sick for two days.' },
  { id: 'made_friend',     weight: 8,  title: 'Made a friend',         happy: 6,  soc: 5, costUSD: 0, text: 'Met someone interesting — swapped numbers.' },
  { id: 'got_scammed',     weight: 5,  title: 'Scammed',               happy: -8, costUSD: 300, text: 'Fell for a common tourist scam.' },
  { id: 'upgraded_room',   weight: 6,  title: 'Room upgraded',         happy: 8,  costUSD: 0, text: 'Hotel overbooked — free upgrade to a suite!' },
  { id: 'perfect_photo',   weight: 8,  title: 'Perfect photo',         happy: 6,  soc: 4, costUSD: 0, text: 'Took a photo that looks like a postcard.' },
  { id: 'local_festival',  weight: 4,  title: 'Local festival',        happy: 8,  soc: 4, costUSD: 0, text: 'Stumbled onto a lively local street festival.' },
  { id: 'museum_closed',   weight: 4,  title: 'Museum closed',         happy: -3, costUSD: 0, text: 'Arrived at the main attraction, but it was closed for renovation.' },
  { id: 'romantic_dinner', weight: 6,  title: 'Romantic dinner',       happy: 6,  soc: 3, costUSD: 150, requiresSpouse: true, text: 'Dinner under the stars with your partner.' },
  { id: 'spouse_engaged',  weight: 5,  title: 'Spouse loved it',       happy: 6,  soc: 3, costUSD: 0, requiresSpouse: true, text: 'Your partner is glowing with joy from the trip.' },
  { id: 'child_happy',     weight: 6,  title: 'Child ecstatic',        happy: 6,  soc: 2, requiresChild: true, text: 'The kids are in absolute heaven.' },
  { id: 'child_scared',    weight: 3,  title: 'Child upset',           happy: -4, requiresChild: true, text: 'One of the kids is homesick and crying constantly.' },
  { id: 'beach_day',       weight: 7,  title: 'Perfect beach day',     happy: 5,  health: 2, costUSD: 0, text: 'Spent a perfect, relaxing day by the sea.' },
  { id: 'bought_souvenir', weight: 8,  title: 'Great souvenir',        happy: 4,  costUSD: 80, text: 'Found the perfect, unique memento to take home.' },
  { id: 'health_issue',    weight: 3,  title: 'Minor health issue',    happy: -4, health: -3, costUSD: 100, text: 'Caught a mild stomach bug or cold.' },
  { id: 'surprise_friend', weight: 3,  title: 'Ran into a friend',     happy: 5,  soc: 3, costUSD: 0, text: 'Crazy coincidence — ran into someone you know from home!' },
  { id: 'street_performer',weight: 6,  title: 'Street performer',      happy: 3,  soc: 1, costUSD: 20, text: 'Watched an absolutely amazing street artist.' },
  { id: 'wrong_hotel',     weight: 3,  title: 'Hotel nightmare',       happy: -7, costUSD: 0, text: 'The hotel photos were a complete lie. It\'s awful.' },
  { id: 'over_budget',     weight: 5,  title: 'Overspent',             happy: -3, costUSD: 400, text: 'Got carried away and went way over budget.' },
  { id: 'stayed_extra',    weight: 3,  title: 'Extended stay',         happy: 5,  costUSD: 300, text: 'Loved the place so much you stayed 2 extra days.' },
  { id: 'phone_lost',      weight: 2,  title: 'Phone lost or stolen',  happy: -8, costUSD: 600, text: 'Lost your phone. Had to buy a replacement mid-trip.' },
  { id: 'coworker_text',   weight: 5,  title: 'Work called',           happy: -5, costUSD: 0, requiresJob: true, text: 'Your boss called with a "quick emergency question." Ruined the afternoon.' },
  { id: 'sunburn',         weight: 6,  title: 'Bad sunburn',           happy: -3, health: -2, costUSD: 20, text: 'Fell asleep in the sun. Peeling and in pain.' },
  { id: 'local_delight',   weight: 7,  title: 'Incredible local dish', happy: 5, soc: 2, costUSD: 40, text: 'Found a local dish you will literally dream about for years.' },
  { id: 'late_return',     weight: 3,  title: 'Flights cancelled',     happy: -6, costUSD: 300, text: 'Stuck an extra day due to cancellations. Bought new tickets.' },
  { id: 'new_skill',       weight: 4,  title: 'Picked up a skill',     happy: 4,  smarts: 4, costUSD: 0, text: 'Learned some of the local language and culture.' },
  { id: 'selfie_viral',    weight: 2,  title: 'Photo went viral',      happy: 8,  soc: 8, costUSD: 0, text: 'Your stunning trip photo blew up on social media!' },
  { id: 'taxi_scam',       weight: 4,  title: 'Taxi scam',             happy: -5, costUSD: 80, text: 'The driver "got lost" and took the very long way.' },
  { id: 'spontaneous',     weight: 5,  title: 'Spontaneous adventure', happy: 7,  soc: 2, costUSD: 120, text: 'Said yes to an unexpected, wild excursion.' },
  { id: 'pet_home',        weight: 3,  title: 'Missing home',          happy: -3, costUSD: 0, text: 'Feeling travel fatigue and just wishing you were in your own bed.' },
  { id: 'upgrade_flight',  weight: 2,  title: 'Free flight upgrade',   happy: 10, soc: 4, costUSD: 0, text: 'The gate agent miraculously upgraded you to Business Class!' },
  { id: 'reconnected',     weight: 4,  title: 'Reconnected with someone', happy: 5, soc: 3, costUSD: 0, text: 'Bumped into an old acquaintance living abroad.' },
  { id: 'peaceful',        weight: 6,  title: 'Deep peace',            happy: 5,  health: 3, costUSD: 0, text: 'Slept better than you have in years. Total reset.' },
  { id: 'spouse_annoyed',  weight: 4,  title: 'Partner irritated',     happy: -4, requiresSpouse: true, text: 'Your partner is tired, cranky, and arguing about the itinerary.' },
  { id: 'spouse_bond_up',  weight: 7,  title: 'Relationship deepened', happy: 6,  soc: 3, requiresSpouse: true, text: 'You feel closer and more connected than ever.' },
  { id: 'child_tantrum',   weight: 4,  title: 'Massive child meltdown',happy: -5, requiresChild: true, text: 'A legendary public tantrum. Everyone stared.' },
  { id: 'child_memory',    weight: 5,  title: 'Core memory made',      happy: 6,  soc: 2, requiresChild: true, text: 'Created a magical memory your child will never forget.' },
  { id: 'spouse_wants_extend', weight: 3, title: 'Partner begs to stay', happy: 3, soc: 1, requiresSpouse: true, text: 'Your partner loves it so much they want to extend the trip.' },
  { id: 'lost_passport',   weight: 1,  title: 'Lost Passport Panic',   happy: -15, costUSD: 400, text: 'Lost your passport. Spent two days at the embassy.' },
  { id: 'stray_animal',    weight: 4,  title: 'Befriended a stray',    happy: 4, soc: 1, costUSD: 0, text: 'A friendly local cat/dog hung out with you all week.' },
  { id: 'epic_view',       weight: 6,  title: 'Breathtaking View',     happy: 7, smarts: 1, costUSD: 0, text: 'Hiked to a viewpoint that literally took your breath away.' },
  { id: 'language_fail',   weight: 4,  title: 'Embarrassing translation', happy: -2, soc: -1, costUSD: 0, text: 'Ordered the completely wrong thing due to a language mix-up.' },
  { id: 'hidden_gem',      weight: 5,  title: 'Found a hidden gem',    happy: 6, soc: 2, costUSD: 30, text: 'Discovered an amazing spot not in any guidebook.' },
  { id: 'pickpocket',      weight: 2,  title: 'Pickpocketed',          happy: -10, costUSD: 500, text: 'Someone swiped your wallet in a crowded tourist area.' },
  { id: 'weather_ruined',  weight: 4,  title: 'Terrible weather',      happy: -6, costUSD: 0, text: 'It rained heavily for 4 days straight. Plans ruined.' },
  { id: 'celebrity_spot',  weight: 2,  title: 'Celebrity sighting',    happy: 5, soc: 4, costUSD: 0, text: 'Spotted a famous actor at a restaurant near you.' },
  { id: 'art_inspiration', weight: 4,  title: 'Artistic inspiration',  happy: 5, smarts: 4, costUSD: 0, text: 'A local museum or gallery deeply inspired you.' },
  { id: 'terrible_tour',   weight: 4,  title: 'Awful tour guide',      happy: -4, costUSD: 60, text: 'The tour guide was rude, boring, and rushed everything.' },
  { id: 'amazing_tour',    weight: 5,  title: 'Incredible tour guide', happy: 6, smarts: 3, costUSD: 20, text: 'The guide was passionate and brought the history to life.' },
  { id: 'transit_strike',  weight: 3,  title: 'Transit strike',        happy: -5, costUSD: 100, text: 'Local trains went on strike. Had to pay for expensive private cabs.' },
  { id: 'cultural_faux_pas', weight: 3, title: 'Cultural faux pas',    happy: -3, soc: -2, costUSD: 0, text: 'Accidentally deeply offended a local due to a cultural misunderstanding.' },
  { id: 'free_drinks',     weight: 5,  title: 'Free drinks!',          happy: 5, soc: 3, costUSD: 0, text: 'The bartender liked you and kept the drinks flowing for free.' },
  { id: 'bed_bugs',        weight: 1,  title: 'Bed bugs',              happy: -15, health: -5, costUSD: 200, text: 'Woke up covered in bites. Had to move hotels and wash everything.' },
  { id: 'lost_in_city',    weight: 4,  title: 'Got beautifully lost',  happy: 5, smarts: 2, costUSD: 0, text: 'Wandered off the map and found the most charming neighborhood.' },
  { id: 'local_wedding',   weight: 2,  title: 'Invited to a wedding',  happy: 8, soc: 6, costUSD: 50, text: 'Locals were so friendly they invited you to a traditional wedding!' },
  { id: 'rental_car_crash', weight: 1, title: 'Rental car scrape',     happy: -8, costUSD: 800, text: 'Scraped the rental car. Insurance didn\'t cover the deductible.' },
  { id: 'spiritual_moment', weight: 3, title: 'Spiritual awakening',   happy: 8, health: 3, costUSD: 0, text: 'Had a moment of profound clarity and peace at a sacred site.' },
  { id: 'overbooked_flight', weight: 3, title: 'Bumped from flight',   happy: -5, costUSD: -400, text: 'Volunteered to be bumped. Delayed a day, but got a $400 voucher!' }
];

/* ---------- MANAGER PERSONALITIES ---------- */
const VAC_MANAGER_STYLES = {
  strict:      { label: 'Strict',        approvalMod: -0.15, desc: 'By the book. No exceptions.' },
  supportive:  { label: 'Supportive',    approvalMod: +0.15, desc: 'Believes in work-life balance.' },
  busy:        { label: 'Always busy',   approvalMod: -0.10, desc: 'Slow to respond to requests. Often forgets.' },
  flexible:    { label: 'Flexible',      approvalMod: +0.10, desc: 'Reasonable about time off.' },
  micromanager:{ label: 'Micromanager',  approvalMod: -0.20, desc: 'Will text you while you are on the beach.' },
  chill:       { label: 'Super Chill',   approvalMod: +0.25, desc: 'Barely tracks PTO. "Just get the work done."' },
  neutral:     { label: 'Neutral',       approvalMod: 0,     desc: 'Fair and predictable.' }
};

/* ---------- NOTICE OPTIONS ---------- */
const VAC_NOTICE_OPTIONS = [
  { id: 'tomorrow',   label: 'Tomorrow (urgent)',    monthsAhead: 0, approvalMod: -0.40, desc: 'Very short notice. Hard to approve.' },
  { id: 'few_days',   label: 'A few days notice',    monthsAhead: 0, approvalMod: -0.30, desc: 'Frustrating for the team.' },
  { id: '1week',      label: '1 week notice',        monthsAhead: 0, approvalMod: -0.15, desc: 'Short but manageable.' },
  { id: '1month',     label: '1 month notice',       monthsAhead: 1, approvalMod: +0.05, desc: 'Standard.' },
  { id: '3months',    label: '3+ months notice',     monthsAhead: 3, approvalMod: +0.20, desc: 'Plenty of time to plan around.' },
  { id: '6months',    label: '6+ months notice',     monthsAhead: 6, approvalMod: +0.30, desc: 'Perfectly planned. Almost guaranteed approval.' }
];

/* ---------- TRIP STYLES ---------- */
const VAC_TRIP_STYLES = [
  { id: 'relaxing',   label: 'Relaxing',    happyMod: +2, healthMod: +4, desc: 'Spa, beach, slow pace. Sleep in.' },
  { id: 'adventure',  label: 'Adventurous', happyMod: +5, healthMod: -1, desc: 'Hiking, diving, exploring. High energy.' },
  { id: 'cultural',   label: 'Cultural',    happyMod: +3, smartsMod: +5, desc: 'Museums, history, architecture, food.' },
  { id: 'party',      label: 'Party',       happyMod: +6, healthMod: -5, desc: 'Nightlife, clubs, late nights, hangovers.' },
  { id: 'romantic',   label: 'Romantic',    happyMod: +4, bondMod: +8, desc: 'Couples-focused. Fine dining, sunsets.' },
  { id: 'family',     label: 'Family Fun',  happyMod: +3, bondMod: +5, desc: 'Theme parks, zoos, kid-friendly resorts.' },
  { id: 'budget',     label: 'Shoestring',  happyMod: -2, smartsMod: +2, desc: 'Hostels, street food, walking everywhere.' },
  { id: 'luxury',     label: 'Ultra-Luxury',happyMod: +8, healthMod: +3, desc: 'First-class everything. Unmatched comfort.' }
];

/* ---------- SPENDING MONEY OPTIONS ---------- */
const VAC_SPENDING_OPTIONS = [
  { id: 'minimal', label: 'Minimalist',  usdPerDay: 20,  happyMod: -2 },
  { id: 'frugal',  label: 'Frugal',      usdPerDay: 50,  happyMod: -1 },
  { id: 'normal',  label: 'Normal',      usdPerDay: 120, happyMod: 0 },
  { id: 'comfy',   label: 'Comfortable', usdPerDay: 300, happyMod: +2 },
  { id: 'lavish',  label: 'Lavish',      usdPerDay: 750, happyMod: +5 },
  { id: 'blank_check', label: 'Blank Check', usdPerDay: 2000, happyMod: +8 }
];

/* ---------- CHILD AGE MULTIPLIERS ---------- */
function vacChildAirfareMult(age) {
  if (age <= 2) return 0.10; /* Lap infant */
  if (age <= 12) return 0.75;
  return 1.00;
}
function vacChildHotelAddPct(age) {
  if (age <= 2) return 0.00; /* Crib */
  if (age <= 12) return 0.15; /* Rollaway bed */
  return 0.30; /* Extra room or suite needed eventually */
}
function vacChildActivityPct(age) {
  if (age <= 2) return 0.00;
  if (age <= 5) return 0.30;
  if (age <= 12) return 0.70;
  return 1.00;
}

window.VAC_DESTINATIONS = VAC_DESTINATIONS;
window.VAC_AIRFARE_CLASSES = VAC_AIRFARE_CLASSES;
window.VAC_HOTEL_TIERS = VAC_HOTEL_TIERS;
window.VAC_ACTIVITIES = VAC_ACTIVITIES;
window.VAC_VISA_REQUIREMENTS = VAC_VISA_REQUIREMENTS;
window.VAC_VISA_WAIT_MONTHS = VAC_VISA_WAIT_MONTHS;
window.VAC_VISA_FEES_USD = VAC_VISA_FEES_USD;
window.VAC_TRIP_EVENTS = VAC_TRIP_EVENTS;
window.VAC_MANAGER_STYLES = VAC_MANAGER_STYLES;
window.VAC_NOTICE_OPTIONS = VAC_NOTICE_OPTIONS;
window.VAC_TRIP_STYLES = VAC_TRIP_STYLES;
window.VAC_SPENDING_OPTIONS = VAC_SPENDING_OPTIONS;
window.vacChildAirfareMult = vacChildAirfareMult;
window.vacChildHotelAddPct = vacChildHotelAddPct;
window.vacChildActivityPct = vacChildActivityPct;
console.log('[World Life] 16-data-vacations.js loaded');
