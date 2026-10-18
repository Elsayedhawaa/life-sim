/* ============================================================
   WORLD LIFE — VIEW: HOME MANAGEMENT (Ultra-Detailed v2)
   ============================================================
   Companion to 15-view-realestate.js.
   Adds 4 sub-tabs: Renovate, Furnish, Staff, Bills.
   Extends year tick: utilities, degradation, staff drama,
   tax, maintenance, appliance life, random events.

   Fix: taxes/utilities/staff now use h.country (property location),
   not S.country (player location). Works when you own property abroad.
   ============================================================ */

/* ============================================================
   UPGRADES CATALOG — 28 upgrades across 10 categories
   ============================================================ */
const HOME_UPGRADES_CATALOG = [
  /* ---------- CLIMATE ---------- */
  { id: 'central_ac', category: 'Climate', name: 'VRF Central AC',
    brands: ['Daikin', 'Mitsubishi Electric', 'LG', 'Samsung'],
    cost: { egy: 250000, usa: 15000, sau: 35000 }, moodBonus: 4, valueAdd: 1.05,
    energyMultiplier: 1.3, maintenancePerYear: { egy: 12000, usa: 800, sau: 1800 } },
  { id: 'ductless_ac', category: 'Climate', name: 'Ductless Split AC',
    brands: ['Carrier', 'Trane', 'Gree'],
    cost: { egy: 80000, usa: 6000, sau: 12000 }, moodBonus: 2, valueAdd: 1.02,
    energyMultiplier: 1.15, maintenancePerYear: { egy: 4000, usa: 300, sau: 700 } },
  { id: 'fireplace', category: 'Climate', name: 'Gas Fireplace',
    brands: ['Napoleon', 'Heat & Glo'],
    cost: { egy: 120000, usa: 8000, sau: 16000 }, moodBonus: 3, valueAdd: 1.03,
    energyMultiplier: 1.05, maintenancePerYear: { egy: 3000, usa: 200, sau: 500 } },

  /* ---------- POWER / WATER ---------- */
  { id: 'solar_power', category: 'Power', name: 'On-Grid Solar System',
    brands: ['JinkoSolar', 'Canadian Solar', 'SunPower'],
    cost: { egy: 350000, usa: 22000, sau: 40000 }, moodBonus: 1, valueAdd: 1.06,
    energyMultiplier: 0.3, maintenancePerYear: { egy: 8000, usa: 500, sau: 1000 } },
  { id: 'generator', category: 'Power', name: 'Backup Generator',
    brands: ['Caterpillar', 'Cummins', 'Perkins'],
    cost: { egy: 200000, usa: 12000, sau: 25000 }, moodBonus: 2, valueAdd: 1.03,
    energyMultiplier: 1.1, maintenancePerYear: { egy: 10000, usa: 700, sau: 1500 } },
  { id: 'tesla_wall', category: 'Power', name: 'Home Battery Storage',
    brands: ['Tesla Powerwall', 'LG RESU', 'Sonnen'],
    cost: { egy: 450000, usa: 18000, sau: 55000 }, moodBonus: 2, valueAdd: 1.04,
    energyMultiplier: 0.85, maintenancePerYear: { egy: 5000, usa: 300, sau: 900 } },
  { id: 'water_treatment', category: 'Water', name: 'Whole-House Water Filtration',
    brands: ['Culligan', 'Kinetico', '3M'],
    cost: { egy: 90000, usa: 6000, sau: 12000 }, moodBonus: 2, valueAdd: 1.03,
    energyMultiplier: 1.0, maintenancePerYear: { egy: 4000, usa: 300, sau: 800 } },
  { id: 'water_heater', category: 'Water', name: 'Tankless Water Heater',
    brands: ['Rinnai', 'Navien', 'Bosch'],
    cost: { egy: 60000, usa: 4000, sau: 9000 }, moodBonus: 1, valueAdd: 1.02,
    energyMultiplier: 0.9, maintenancePerYear: { egy: 2000, usa: 150, sau: 400 } },

  /* ---------- SECURITY ---------- */
  { id: 'smart_security', category: 'Security', name: 'Smart Security System',
    brands: ['Ring', 'ADT', 'Vivint', 'SimpliSafe'],
    cost: { egy: 80000, usa: 5000, sau: 12000 }, moodBonus: 3, valueAdd: 1.04,
    energyMultiplier: 1.02, maintenancePerYear: { egy: 3000, usa: 300, sau: 600 } },
  { id: 'panic_room', category: 'Security', name: 'Steel-Reinforced Panic Room',
    brands: ['Custom'],
    cost: { egy: 600000, usa: 35000, sau: 70000 }, moodBonus: 1, valueAdd: 1.03,
    energyMultiplier: 1.0, maintenancePerYear: { egy: 8000, usa: 500, sau: 1200 } },

  /* ---------- WELLNESS / LEISURE ---------- */
  { id: 'sauna', category: 'Wellness', name: 'Finnish Sauna',
    brands: ['Harvia', 'Helo', 'Finlandia'],
    cost: { egy: 250000, usa: 12000, sau: 28000 }, moodBonus: 4, valueAdd: 1.04,
    energyMultiplier: 1.15, maintenancePerYear: { egy: 6000, usa: 400, sau: 1000 } },
  { id: 'jacuzzi', category: 'Wellness', name: 'Hot Tub / Jacuzzi',
    brands: ['Jacuzzi', 'Hot Spring', 'Sundance'],
    cost: { egy: 180000, usa: 10000, sau: 22000 }, moodBonus: 4, valueAdd: 1.03,
    energyMultiplier: 1.2, maintenancePerYear: { egy: 5000, usa: 400, sau: 900 } },
  { id: 'home_gym', category: 'Wellness', name: 'Home Gym',
    brands: ['Technogym', 'Life Fitness', 'Peloton', 'NordicTrack'],
    cost: { egy: 200000, usa: 15000, sau: 35000 }, moodBonus: 3, valueAdd: 1.03,
    energyMultiplier: 1.1, maintenancePerYear: { egy: 4000, usa: 300, sau: 800 } },
  { id: 'massage_room', category: 'Wellness', name: 'Dedicated Massage Room',
    brands: ['Custom'],
    cost: { egy: 300000, usa: 18000, sau: 40000 }, moodBonus: 5, valueAdd: 1.04,
    energyMultiplier: 1.05, maintenancePerYear: { egy: 5000, usa: 400, sau: 1000 } },
  { id: 'heated_pool', category: 'Leisure', name: 'Infinity Heated Pool',
    brands: ['Custom'],
    cost: { egy: 850000, usa: 45000, sau: 85000 }, moodBonus: 8, valueAdd: 1.12,
    energyMultiplier: 1.5, maintenancePerYear: { egy: 35000, usa: 2500, sau: 5500 }, requiresVilla: true },
  { id: 'tennis_court', category: 'Leisure', name: 'Tennis Court',
    brands: ['Custom'],
    cost: { egy: 1200000, usa: 60000, sau: 140000 }, moodBonus: 6, valueAdd: 1.10,
    energyMultiplier: 1.0, maintenancePerYear: { egy: 20000, usa: 1500, sau: 3500 }, requiresMansion: true },
  { id: 'bbq_station', category: 'Leisure', name: 'Outdoor BBQ Station',
    brands: ['Weber', 'Traeger', 'Kamado Joe'],
    cost: { egy: 80000, usa: 6000, sau: 12000 }, moodBonus: 3, valueAdd: 1.02,
    energyMultiplier: 1.0, maintenancePerYear: { egy: 2000, usa: 150, sau: 400 } },
  { id: 'garden_fountain', category: 'Leisure', name: 'Garden Fountain & Pond',
    brands: ['Custom'],
    cost: { egy: 150000, usa: 8000, sau: 18000 }, moodBonus: 3, valueAdd: 1.03,
    energyMultiplier: 1.05, maintenancePerYear: { egy: 5000, usa: 400, sau: 900 }, requiresGarden: true },

  /* ---------- ENTERTAINMENT ---------- */
  { id: 'cinema', category: 'Entertainment', name: 'Dolby Atmos Home Cinema',
    brands: ['Dolby', 'Sony', 'JBL Synthesis'],
    cost: { egy: 400000, usa: 25000, sau: 50000 }, moodBonus: 6, valueAdd: 1.05,
    energyMultiplier: 1.1, maintenancePerYear: { egy: 4000, usa: 300, sau: 800 } },
  { id: 'game_room', category: 'Entertainment', name: 'Dedicated Game Room',
    brands: ['Custom'],
    cost: { egy: 300000, usa: 18000, sau: 40000 }, moodBonus: 5, valueAdd: 1.03,
    energyMultiplier: 1.15, maintenancePerYear: { egy: 3000, usa: 200, sau: 700 } },
  { id: 'music_room', category: 'Entertainment', name: 'Music Room / Studio',
    brands: ['Yamaha', 'Steinway', 'Fender'],
    cost: { egy: 350000, usa: 20000, sau: 45000 }, moodBonus: 5, valueAdd: 1.03,
    energyMultiplier: 1.05, maintenancePerYear: { egy: 3000, usa: 200, sau: 600 } },
  { id: 'wine_cellar', category: 'Entertainment', name: 'Climate-Controlled Wine Cellar',
    brands: ['EuroCave', 'VintageView', 'Custom'],
    cost: { egy: 300000, usa: 20000, sau: 45000 }, moodBonus: 3, valueAdd: 1.04,
    energyMultiplier: 1.1, maintenancePerYear: { egy: 6000, usa: 400, sau: 1000 }, requiresVilla: true },
  { id: 'library', category: 'Entertainment', name: 'Home Library',
    brands: ['Custom shelving', 'Stikwood'],
    cost: { egy: 220000, usa: 12000, sau: 25000 }, moodBonus: 4, valueAdd: 1.03,
    energyMultiplier: 1.0, maintenancePerYear: { egy: 2000, usa: 150, sau: 400 } },
  { id: 'prayer_room', category: 'Entertainment', name: 'Dedicated Prayer Room',
    brands: ['Custom'],
    cost: { egy: 100000, usa: 5000, sau: 20000 }, moodBonus: 3, valueAdd: 1.02,
    energyMultiplier: 1.0, maintenancePerYear: { egy: 1000, usa: 100, sau: 300 } },

  /* ---------- ELEVATED (requires mansion) ---------- */
  { id: 'elevator', category: 'Elevated', name: 'Private Elevator',
    brands: ['KONE', 'Otis', 'Schindler', 'ThyssenKrupp'],
    cost: { egy: 800000, usa: 40000, sau: 90000 }, moodBonus: 3, valueAdd: 1.06,
    energyMultiplier: 1.15, maintenancePerYear: { egy: 25000, usa: 1500, sau: 3500 }, requiresVilla: true },
  { id: 'helipad', category: 'Elevated', name: 'Rooftop Helipad',
    brands: ['Custom'],
    cost: { egy: 1500000, usa: 100000, sau: 200000 }, moodBonus: 5, valueAdd: 1.15,
    energyMultiplier: 1.0, maintenancePerYear: { egy: 40000, usa: 3000, sau: 7000 }, requiresMansion: true },
  { id: 'panic_room_exp', category: 'Elevated', name: 'Underground Bunker',
    brands: ['Custom'],
    cost: { egy: 2500000, usa: 150000, sau: 300000 }, moodBonus: 2, valueAdd: 1.12,
    energyMultiplier: 1.05, maintenancePerYear: { egy: 30000, usa: 2000, sau: 5000 }, requiresMansion: true }
];

/* ============================================================
   FURNITURE CATALOG — 15 categories × 4 tiers each
   ============================================================ */
const DETAILED_FURNITURE = {

  /* ---------- LIVING ROOM ---------- */
  living: {
    label: 'Living & Reception',
    icon: '🛋',
    tiers: [
      { id: 'f_liv_1', name: 'Budget (IKEA / Home Centre)',
        brands: ['IKEA', 'Home Centre', 'Al Araby'],
        cost: { egy: 60000, usa: 4000, sau: 9000 },
        moodBonus: 2, maintenancePerYear: { egy: 2000, usa: 150, sau: 400 },
        desc: 'Flat-pack sofas, basic 55" TV, coffee table, rug.' },
      { id: 'f_liv_2', name: 'Premium (Ethan Allen / Pottery Barn)',
        brands: ['Ethan Allen', 'Pottery Barn', 'Crate & Barrel', 'Marina Home'],
        cost: { egy: 250000, usa: 15000, sau: 32000 },
        moodBonus: 5, valueAdd: 1.02, maintenancePerYear: { egy: 8000, usa: 600, sau: 1500 },
        desc: 'Solid wood, 75" OLED, plush sofas, wool rugs, marble coffee table.' },
      { id: 'f_liv_3', name: 'Luxury (Minotti / B&B Italia)',
        brands: ['Minotti', 'B&B Italia', 'Poltrona Frau', 'Cassina'],
        cost: { egy: 800000, usa: 45000, sau: 95000 },
        moodBonus: 10, valueAdd: 1.05, maintenancePerYear: { egy: 20000, usa: 1500, sau: 3500 },
        desc: 'Italian designer sofas, 85" 8K TV, custom marble, luxury textiles.' },
      { id: 'f_liv_4', name: 'Ultra (Bespoke / Commissioned)',
        brands: ['Bespoke', 'Fendi Casa', 'Versace Home'],
        cost: { egy: 3000000, usa: 180000, sau: 380000 },
        moodBonus: 18, valueAdd: 1.12, maintenancePerYear: { egy: 60000, usa: 4500, sau: 10000 },
        desc: 'Commissioned pieces by world-renowned designers. Museum-grade.' }
    ]
  },

  /* ---------- DINING ROOM ---------- */
  dining: {
    label: 'Dining Room',
    icon: '🍽',
    tiers: [
      { id: 'f_din_1', name: 'Budget (IKEA)',
        brands: ['IKEA', 'Home Centre'],
        cost: { egy: 30000, usa: 2000, sau: 5000 },
        moodBonus: 1, desc: '6-seat wooden table, fabric chairs.' },
      { id: 'f_din_2', name: 'Premium (Crate & Barrel)',
        brands: ['Crate & Barrel', 'Marina Home', 'Ethan Allen'],
        cost: { egy: 120000, usa: 8000, sau: 18000 },
        moodBonus: 3, valueAdd: 1.01, desc: '8-seat oak table, upholstered chairs, sideboard.' },
      { id: 'f_din_3', name: 'Luxury (B&B Italia)',
        brands: ['B&B Italia', 'Poltrona Frau', 'Minotti'],
        cost: { egy: 400000, usa: 25000, sau: 55000 },
        moodBonus: 6, valueAdd: 1.03, desc: '10-seat marble table, Italian leather chairs, silver service.' },
      { id: 'f_din_4', name: 'Ultra (Bespoke Dining Suite)',
        brands: ['Bespoke', 'Fendi Casa'],
        cost: { egy: 1200000, usa: 75000, sau: 160000 },
        moodBonus: 12, valueAdd: 1.06, desc: '12-seat custom table, crystal chandelier, full china service.' }
    ]
  },

  /* ---------- MASTER BEDROOM ---------- */
  bedroom: {
    label: 'Master Bedroom',
    icon: '🛏',
    tiers: [
      { id: 'f_bed_1', name: 'Budget Set',
        brands: ['IKEA', 'Home Centre'],
        cost: { egy: 40000, usa: 2500, sau: 6000 },
        moodBonus: 1, desc: 'Queen bed, basic wardrobe, nightstands.' },
      { id: 'f_bed_2', name: 'Premium Set',
        brands: ['Ethan Allen', 'Marina Home', 'Pottery Barn'],
        cost: { egy: 150000, usa: 10000, sau: 22000 },
        moodBonus: 4, valueAdd: 1.02, desc: 'King bed with memory foam, sliding wardrobe, seating area.' },
      { id: 'f_bed_3', name: 'Luxury Suite',
        brands: ['Frette bedding', 'Poltrona Frau', 'Minotti'],
        cost: { egy: 500000, usa: 30000, sau: 65000 },
        moodBonus: 8, valueAdd: 1.04, desc: 'Italian king bed, walk-in closet, marble vanity, lounge area.' },
      { id: 'f_bed_4', name: 'Presidential Suite',
        brands: ['Bespoke', 'Frette', 'Savoir Beds'],
        cost: { egy: 1500000, usa: 90000, sau: 200000 },
        moodBonus: 15, valueAdd: 1.08, desc: 'Savoir custom bed, full marble ensuite, private dressing room.' }
    ]
  },

  /* ---------- KIDS ROOM ---------- */
  kids: {
    label: "Kids' Room",
    icon: '🧸',
    requiresChildren: true,
    tiers: [
      { id: 'f_kid_1', name: 'Budget',
        brands: ['IKEA', 'Home Centre'],
        cost: { egy: 20000, usa: 1500, sau: 3500 },
        moodBonus: 1, desc: 'Single bed, small wardrobe, basic desk.' },
      { id: 'f_kid_2', name: 'Premium',
        brands: ['Pottery Barn Kids', 'Land of Nod', 'Marina Home'],
        cost: { egy: 80000, usa: 5000, sau: 12000 },
        moodBonus: 3, valueAdd: 1.01, desc: 'Bunk or twin bed, full wardrobe, study setup, toy storage.' },
      { id: 'f_kid_3', name: 'Luxury Theme',
        brands: ['Bespoke', 'Pottery Barn Kids'],
        cost: { egy: 250000, usa: 15000, sau: 32000 },
        moodBonus: 6, valueAdd: 1.02, desc: 'Custom theme room, designer furniture, integrated play area.' },
      { id: 'f_kid_4', name: 'Ultra Kids Suite',
        brands: ['Bespoke'],
        cost: { egy: 700000, usa: 40000, sau: 85000 },
        moodBonus: 12, valueAdd: 1.04, desc: 'Multi-room suite with playroom, study, ensuite bath.' }
    ]
  },

  /* ---------- GUEST ROOM ---------- */
  guest: {
    label: 'Guest Bedroom',
    icon: '🚪',
    tiers: [
      { id: 'f_gst_1', name: 'Budget',
        brands: ['IKEA', 'Home Centre'],
        cost: { egy: 25000, usa: 1500, sau: 4000 },
        moodBonus: 1, desc: 'Double bed, basic wardrobe, small desk.' },
      { id: 'f_gst_2', name: 'Premium',
        brands: ['Ethan Allen', 'Pottery Barn'],
        cost: { egy: 90000, usa: 6000, sau: 14000 },
        moodBonus: 3, desc: 'Queen bed, quality linens, hotel-style amenities.' },
      { id: 'f_gst_3', name: 'Luxury Hotel Suite',
        brands: ['Frette', 'Bespoke'],
        cost: { egy: 300000, usa: 18000, sau: 38000 },
        moodBonus: 5, valueAdd: 1.02, desc: 'King bed, marble ensuite, walk-in closet, private balcony.' }
    ]
  },

  /* ---------- KITCHEN ---------- */
  kitchen: {
    label: 'Kitchen & Appliances',
    icon: '🍳',
    tiers: [
      { id: 'f_kit_1', name: 'Standard Setup',
        brands: ['Bosch', 'Beko', 'Siemens basic'],
        cost: { egy: 60000, usa: 4000, sau: 9000 },
        moodBonus: 1, maintenancePerYear: { egy: 3000, usa: 250, sau: 600 },
        desc: 'Local brand fridge, basic stove, laminate counters.' },
      { id: 'f_kit_2', name: 'Smart Kitchen',
        brands: ['Bosch', 'Siemens', 'Samsung', 'LG'],
        cost: { egy: 200000, usa: 15000, sau: 32000 },
        moodBonus: 4, valueAdd: 1.02, maintenancePerYear: { egy: 8000, usa: 600, sau: 1400 },
        desc: 'Double-door smart fridge, built-in ovens, granite counters.' },
      { id: 'f_kit_3', name: "Chef's Kitchen",
        brands: ['Sub-Zero', 'Wolf', 'Gaggenau', 'Miele'],
        cost: { egy: 700000, usa: 50000, sau: 105000 },
        moodBonus: 8, valueAdd: 1.05, maintenancePerYear: { egy: 20000, usa: 1500, sau: 3500 },
        desc: 'Sub-Zero & Wolf professional appliances, marble counters, butler pantry.' },
      { id: 'f_kit_4', name: 'Professional Chef Kitchen',
        brands: ['Gaggenau', 'La Cornue', 'Rational'],
        cost: { egy: 2000000, usa: 130000, sau: 280000 },
        moodBonus: 15, valueAdd: 1.10, maintenancePerYear: { egy: 45000, usa: 3000, sau: 7000 },
        desc: 'Restaurant-grade equipment, La Cornue range, two islands, walk-in pantry.' }
    ]
  },

  /* ---------- BATHROOM ---------- */
  bathroom: {
    label: 'Bathrooms',
    icon: '🚿',
    tiers: [
      { id: 'f_bth_1', name: 'Standard Fixtures',
        brands: ['Grohe', 'Roca', 'Ideal Standard'],
        cost: { egy: 50000, usa: 4000, sau: 10000 },
        moodBonus: 1, maintenancePerYear: { egy: 2000, usa: 150, sau: 400 },
        desc: 'Standard ceramics, single shower, basic vanity.' },
      { id: 'f_bth_2', name: 'Designer Fixtures',
        brands: ['Grohe', 'Hansgrohe', 'Kohler', 'Duravit'],
        cost: { egy: 180000, usa: 12000, sau: 28000 },
        moodBonus: 4, valueAdd: 1.03, maintenancePerYear: { egy: 5000, usa: 400, sau: 1000 },
        desc: 'Rain shower, freestanding tub, marble tiles, heated floors.' },
      { id: 'f_bth_3', name: 'Spa-Grade Bathroom',
        brands: ['Kohler', 'Duravit', 'Villeroy & Boch', 'TOTO'],
        cost: { egy: 500000, usa: 35000, sau: 75000 },
        moodBonus: 8, valueAdd: 1.05, maintenancePerYear: { egy: 12000, usa: 900, sau: 2200 },
        desc: 'Multi-jet shower, soaking tub, smart toilet, backlit mirrors, onyx tiles.' },
      { id: 'f_bth_4', name: 'Marble Spa Suite',
        brands: ['Bespoke', 'Dornbracht', 'Gessi'],
        cost: { egy: 1500000, usa: 90000, sau: 200000 },
        moodBonus: 15, valueAdd: 1.10, maintenancePerYear: { egy: 30000, usa: 2000, sau: 5000 },
        desc: 'Full Italian marble, freestanding stone tub, hammam, steam shower, dual rain heads.' }
    ]
  },

  /* ---------- HOME OFFICE ---------- */
  office: {
    label: 'Home Office',
    icon: '💼',
    tiers: [
      { id: 'f_off_1', name: 'Basic Desk Setup',
        brands: ['IKEA', 'Home Centre'],
        cost: { egy: 20000, usa: 1200, sau: 3000 },
        moodBonus: 1, desc: 'Simple desk, office chair, bookshelf.' },
      { id: 'f_off_2', name: 'Professional Office',
        brands: ['Herman Miller', 'Steelcase', 'Autonomous'],
        cost: { egy: 80000, usa: 6000, sau: 14000 },
        moodBonus: 3, valueAdd: 1.01, desc: 'Height-adjustable desk, Herman Miller Aeron, ergonomic setup.' },
      { id: 'f_off_3', name: 'Executive Office',
        brands: ['Bespoke', 'Herman Miller', 'Knoll'],
        cost: { egy: 250000, usa: 15000, sau: 35000 },
        moodBonus: 5, valueAdd: 1.02, desc: 'Walnut executive desk, leather chair, custom shelving, video-conference setup.' },
      { id: 'f_off_4', name: 'CEO Suite',
        brands: ['Bespoke', 'Poltrona Frau', 'Rimadesio'],
        cost: { egy: 800000, usa: 50000, sau: 105000 },
        moodBonus: 10, valueAdd: 1.05, desc: 'Full executive suite with meeting area, private lounge, marble accents.' }
    ]
  },

  /* ---------- ART & COLLECTIBLES ---------- */
  art: {
    label: 'Art & Collectibles',
    icon: '🎨',
    tiers: [
      { id: 'f_art_1', name: 'Local Gallery Pieces',
        brands: ['Egyptian modern artists', 'Regional galleries'],
        cost: { egy: 100000, usa: 6000, sau: 15000 },
        moodBonus: 3, valueAdd: 1.02, appreciationRate: 0.06,
        desc: 'Originals by emerging local artists. Appreciates 6% per year.' },
      { id: 'f_art_2', name: 'Blue-Chip Artists',
        brands: ['Christie\'s', 'Sotheby\'s', 'Phillips'],
        cost: { egy: 800000, usa: 50000, sau: 110000 },
        moodBonus: 6, valueAdd: 1.06, appreciationRate: 0.10,
        desc: 'Works by established contemporary artists. Appreciates 10% per year.' },
      { id: 'f_art_3', name: 'Museum Masterpieces',
        brands: ['Christie\'s', 'Sotheby\'s'],
        cost: { egy: 5000000, usa: 300000, sau: 650000 },
        moodBonus: 12, valueAdd: 1.15, appreciationRate: 0.15,
        desc: 'Auction-house certified masterpieces. Appreciates 15% per year.' }
    ]
  },

  /* ---------- FLOORING ---------- */
  flooring: {
    label: 'Flooring',
    icon: '🪵',
    tiers: [
      { id: 'f_flr_1', name: 'Ceramic Tiles',
        brands: ['Cleopatra', 'Ceramica Cleopatra', 'Emirates Ceramics'],
        cost: { egy: 80000, usa: 5000, sau: 12000 },
        moodBonus: 1, desc: 'Standard ceramic tiles, functional, easy maintenance.' },
      { id: 'f_flr_2', name: 'Laminate Wood',
        brands: ['Quick-Step', 'Pergo', 'Tarkett'],
        cost: { egy: 180000, usa: 12000, sau: 28000 },
        moodBonus: 3, valueAdd: 1.02, desc: 'Wood-look laminate, modern aesthetic, warm feel.' },
      { id: 'f_flr_3', name: 'Engineered Wood',
        brands: ['Havwoods', 'Kährs', 'Bauwerk'],
        cost: { egy: 400000, usa: 25000, sau: 55000 },
        moodBonus: 6, valueAdd: 1.04, desc: 'Real wood veneer, premium feel, durable.' },
      { id: 'f_flr_4', name: 'Italian Marble / Solid Hardwood',
        brands: ['Marazzi', 'Florim', 'Porcelanosa'],
        cost: { egy: 1200000, usa: 70000, sau: 160000 },
        moodBonus: 12, valueAdd: 1.08, desc: 'Full Italian marble or solid oak throughout, museum-grade.' }
    ]
  },

  /* ---------- WALLS & PAINT ---------- */
  walls: {
    label: 'Walls & Paint',
    icon: '🎨',
    tiers: [
      { id: 'f_wll_1', name: 'Standard Emulsion',
        brands: ['Jotun', 'Dulux', 'Sipes'],
        cost: { egy: 20000, usa: 1500, sau: 3500 },
        moodBonus: 0, desc: 'Basic flat paint, standard colors.' },
      { id: 'f_wll_2', name: 'Designer Paint',
        brands: ['Farrow & Ball', 'Benjamin Moore', 'Little Greene'],
        cost: { egy: 80000, usa: 5000, sau: 12000 },
        moodBonus: 2, valueAdd: 1.01, desc: 'Premium colors, curated palette, washable finish.' },
      { id: 'f_wll_3', name: 'Textured & Wallpaper',
        brands: ['Cole & Son', 'Arte', 'Élitis'],
        cost: { egy: 200000, usa: 12000, sau: 28000 },
        moodBonus: 4, valueAdd: 1.03, desc: 'Designer wallpaper, plaster textures, custom accent walls.' },
      { id: 'f_wll_4', name: 'Bespoke Plaster & Murals',
        brands: ['Bespoke', 'De Gournay'],
        cost: { egy: 600000, usa: 35000, sau: 80000 },
        moodBonus: 8, valueAdd: 1.05, desc: 'Hand-painted murals, Venetian plaster, gold leaf accents.' }
    ]
  },

  /* ---------- LIGHTING ---------- */
  lighting: {
    label: 'Lighting',
    icon: '💡',
    tiers: [
      { id: 'f_lgt_1', name: 'Basic Fixtures',
        brands: ['IKEA', 'Home Centre'],
        cost: { egy: 15000, usa: 1000, sau: 3000 },
        moodBonus: 1, desc: 'Standard ceiling fixtures, LED bulbs.' },
      { id: 'f_lgt_2', name: 'Designer Fixtures',
        brands: ['Tom Dixon', 'Flos', 'Artemide'],
        cost: { egy: 80000, usa: 5000, sau: 12000 },
        moodBonus: 3, valueAdd: 1.01, desc: 'Designer pendant lights, dimmable, statement pieces.' },
      { id: 'f_lgt_3', name: 'Smart Lighting System',
        brands: ['Lutron', 'Philips Hue', 'Control4'],
        cost: { egy: 200000, usa: 12000, sau: 28000 },
        moodBonus: 5, valueAdd: 1.03, desc: 'Automated scenes, voice control, circadian tuning.' },
      { id: 'f_lgt_4', name: 'Museum-Grade Lighting',
        brands: ['Bespoke', 'Viabizzuno', 'L&L Luce'],
        cost: { egy: 500000, usa: 30000, sau: 65000 },
        moodBonus: 8, valueAdd: 1.05, desc: 'Architectural lighting design, art-grade spots, hidden cove lighting.' }
    ]
  },

  /* ---------- CURTAINS & BLINDS ---------- */
  curtains: {
    label: 'Curtains & Blinds',
    icon: '🪟',
    tiers: [
      { id: 'f_cur_1', name: 'Standard Blinds',
        brands: ['IKEA', 'Local makers'],
        cost: { egy: 12000, usa: 800, sau: 2500 },
        moodBonus: 0, desc: 'Roller blinds or basic curtains.' },
      { id: 'f_cur_2', name: 'Premium Curtains',
        brands: ['Clarence House', 'Zimmer + Rohde', 'Marina Home'],
        cost: { egy: 60000, usa: 4000, sau: 10000 },
        moodBonus: 2, valueAdd: 1.01, desc: 'Custom blackout curtains, luxury fabrics, blackout + privacy.' },
      { id: 'f_cur_3', name: 'Motorized Smart Blinds',
        brands: ['Somfy', 'Hunter Douglas', 'Lutron'],
        cost: { egy: 180000, usa: 12000, sau: 28000 },
        moodBonus: 4, valueAdd: 1.02, desc: 'Motorized blinds, app-controlled, scene integration.' }
    ]
  },

  /* ---------- RUGS ---------- */
  rugs: {
    label: 'Rugs & Carpets',
    icon: '🧶',
    tiers: [
      { id: 'f_rug_1', name: 'Machine-Made',
        brands: ['IKEA', 'Home Centre'],
        cost: { egy: 8000, usa: 600, sau: 1800 },
        moodBonus: 0, desc: 'Synthetic rugs, basic patterns.' },
      { id: 'f_rug_2', name: 'Hand-Tufted Wool',
        brands: ['West Elm', 'Restoration Hardware'],
        cost: { egy: 40000, usa: 2500, sau: 6500 },
        moodBonus: 2, desc: 'Hand-tufted wool rugs, modern patterns.' },
      { id: 'f_rug_3', name: 'Hand-Knotted Persian',
        brands: ['Persian workshops', 'Auction houses'],
        cost: { egy: 250000, usa: 15000, sau: 35000 },
        moodBonus: 4, valueAdd: 1.02, appreciationRate: 0.04,
        desc: 'Genuine hand-knotted Persian rugs. Appreciate 4% per year.' }
    ]
  },

  /* ---------- OUTDOOR ---------- */
  outdoor: {
    label: 'Outdoor & Garden',
    icon: '🌳',
    requiresGarden: true,
    tiers: [
      { id: 'f_out_1', name: 'Basic Outdoor',
        brands: ['IKEA', 'Home Centre'],
        cost: { egy: 20000, usa: 1500, sau: 3500 },
        moodBonus: 1, desc: 'Basic patio furniture, plastic chairs.' },
      { id: 'f_out_2', name: 'Premium Teak',
        brands: ['Gloster', 'Barlow Tyrie', 'Kettal'],
        cost: { egy: 120000, usa: 8000, sau: 18000 },
        moodBonus: 3, valueAdd: 1.01, desc: 'Teak dining set, BBQ grill, outdoor rug, landscaping.' },
      { id: 'f_out_3', name: 'Luxury Outdoor Living',
        brands: ['Roda', 'Paola Lenti', 'Exteta'],
        cost: { egy: 400000, usa: 25000, sau: 55000 },
        moodBonus: 6, valueAdd: 1.03, desc: 'Designer outdoor lounge, pergola, fire pit, outdoor kitchen.' },
      { id: 'f_out_4', name: 'Resort-Style Garden',
        brands: ['Bespoke', 'Custom landscape design'],
        cost: { egy: 1200000, usa: 70000, sau: 160000 },
        moodBonus: 12, valueAdd: 1.08, desc: 'Full landscape architecture, koi pond, zen garden, lighting design.' }
    ]
  }
};

/* ============================================================
   STAFF CATALOG — 12 categories × 2-3 variants each
   ============================================================ */
const DETAILED_STAFF = {

  maid: {
    label: 'Cleaning & Housekeeping',
    icon: '🧹',
    variants: [
      { id: 'maid_pt', name: 'Part-time Maid (2x/week)',
        brands: ['Individual', 'Agency: MaidPro Egypt'],
        cost: { egy: 3000, usa: 400, sau: 1200 }, type: 'Hourly',
        desc: 'Cleans common areas twice a week.' },
      { id: 'maid_ft', name: 'Full-time Live-out Maid',
        brands: ['Agency', 'Individual'],
        cost: { egy: 8000, usa: 2000, sau: 3500 }, type: 'Live-out',
        desc: 'Daily cleaning, laundry, basic meal prep.' },
      { id: 'maid_live', name: 'Full-time Live-in Maid',
        brands: ['Agency', 'Filipino/Ethiopian/Nigerian placement'],
        cost: { egy: 12000, usa: 2800, sau: 5000 }, type: 'Live-in', reqVilla: true,
        desc: 'Lives at the home, full housekeeping + childcare support.' }
    ]
  },

  nanny: {
    label: 'Childcare',
    icon: '👶',
    variants: [
      { id: 'nan_std', name: 'Standard Nanny',
        brands: ['Agency', 'Individual'],
        cost: { egy: 10000, usa: 2500, sau: 3000 }, type: 'Live-out', reqChild: true,
        desc: 'Supervises children during daytime.' },
      { id: 'nan_elite', name: 'Certified Elite Governess',
        brands: ['Norland College', 'Agency: Elite Nannies'],
        cost: { egy: 35000, usa: 6000, sau: 9000 }, type: 'Live-in', reqChild: true,
        smartsBonus: true,
        desc: 'Trained governess. Passively +2 smarts to children per year.' },
      { id: 'nan_au_pair', name: 'Au Pair',
        brands: ['Aupair.com', 'Agency'],
        cost: { egy: 6000, usa: 1500, sau: 2500 }, type: 'Live-in', reqChild: true, reqVilla: true,
        desc: 'Young international au pair. Affordable, live-in.' }
    ]
  },

  chef: {
    label: 'Culinary',
    icon: '👨‍🍳',
    variants: [
      { id: 'chef_std', name: 'Family Cook',
        brands: ['Individual', 'Local chef agencies'],
        cost: { egy: 15000, usa: 3000, sau: 4000 }, type: 'Daily',
        healthBonus: 1, desc: 'Prepares family meals daily.' },
      { id: 'chef_elite', name: 'Private Michelin-trained Chef',
        brands: ['Le Cordon Bleu', 'Institut Paul Bocuse'],
        cost: { egy: 60000, usa: 10000, sau: 15000 }, type: 'Live-in', reqVilla: true,
        healthBonus: 5, desc: 'Michelin-trained chef. +5 health per year from exceptional nutrition.' }
    ]
  },

  security: {
    label: 'Security',
    icon: '🛡',
    variants: [
      { id: 'sec_std', name: 'Gate Guard (Bawab)',
        brands: ['Local', 'G4S Egypt'],
        cost: { egy: 5000, usa: 2000, sau: 2500 }, type: 'Live-in', reqVilla: true,
        desc: 'Traditional bawab / gate security.' },
      { id: 'sec_elite', name: '24/7 Armed Security Team',
        brands: ['G4S', 'Control Risks', 'Pinkerton'],
        cost: { egy: 80000, usa: 15000, sau: 25000 }, type: 'Shift Team', reqVilla: true,
        desc: 'Rotating armed team. Maximum security.' }
    ]
  },

  butler: {
    label: 'Butler & Household Management',
    icon: '🎩',
    variants: [
      { id: 'btl_std', name: 'Household Manager',
        brands: ['Agency', 'Individual'],
        cost: { egy: 20000, usa: 3500, sau: 5000 }, type: 'Live-out', reqVilla: true,
        desc: 'Manages other staff, schedules, and household operations.' },
      { id: 'btl_elite', name: 'English-trained Butler',
        brands: ['Ivor Spencer Butler School', 'Guild of Professional English Butlers'],
        cost: { egy: 50000, usa: 8000, sau: 12000 }, type: 'Live-in', reqMansion: true,
        desc: 'English-trained butler. Reduces stress, manages all household matters.' }
    ]
  },

  chauffeur: {
    label: 'Driver & Chauffeur',
    icon: '🚗',
    variants: [
      { id: 'drv_std', name: 'Personal Driver',
        brands: ['Individual', 'Agency'],
        cost: { egy: 8000, usa: 2500, sau: 4000 }, type: 'Live-out',
        desc: 'Daily driver for family errands and commutes.' },
      { id: 'drv_elite', name: 'Executive Chauffeur',
        brands: ['Agency: Elite Chauffeurs'],
        cost: { egy: 20000, usa: 4000, sau: 7000 }, type: 'Live-in', reqVilla: true,
        desc: 'Professional chauffeur with luxury vehicle experience.' }
    ]
  },

  gardener: {
    label: 'Gardener & Landscaping',
    icon: '🌱',
    variants: [
      { id: 'grd_std', name: 'Weekly Gardener',
        brands: ['Individual', 'Agency'],
        cost: { egy: 3000, usa: 500, sau: 1500 }, type: 'Part-time', reqGarden: true,
        desc: 'Weekly garden maintenance.' },
      { id: 'grd_ft', name: 'Full-time Gardener',
        brands: ['Individual', 'Agency'],
        cost: { egy: 7000, usa: 2000, sau: 3500 }, type: 'Full-time', reqGarden: true,
        desc: 'Daily garden care, pruning, seasonal plantings.' }
    ]
  },

  personal_assistant: {
    label: 'Personal Assistant',
    icon: '📋',
    variants: [
      { id: 'pa_std', name: 'Part-time PA',
        brands: ['Individual', 'Agency'],
        cost: { egy: 10000, usa: 2000, sau: 3000 }, type: 'Part-time',
        desc: 'Handles scheduling and errands 20h/week.' },
      { id: 'pa_elite', name: 'Executive Assistant',
        brands: ['Agency: Executive PA'],
        cost: { egy: 25000, usa: 5000, sau: 8000 }, type: 'Full-time',
        desc: 'Full executive assistant. Manages inbox, travel, and business tasks.' }
    ]
  },

  tutor: {
    label: 'Tutor',
    icon: '📚',
    variants: [
      { id: 'tut_std', name: 'School Subject Tutor',
        brands: ['Local tutors', 'Agency'],
        cost: { egy: 4000, usa: 800, sau: 1500 }, type: 'Weekly', reqChild: true,
        desc: 'Weekly tutoring in core subjects.' },
      { id: 'tut_elite', name: 'Ivy League Admissions Tutor',
        brands: ['Crimson Education', 'Ivy Coach'],
        cost: { egy: 30000, usa: 5000, sau: 10000 }, type: 'Weekly', reqChild: true,
        smartsBonus: true,
        desc: 'Prep for elite university admissions. Children +3 smarts/year.' }
    ]
  },

  personal_trainer: {
    label: 'Personal Trainer',
    icon: '💪',
    variants: [
      { id: 'pt_std', name: 'Personal Trainer (2x/week)',
        brands: ['Individual', 'Agency'],
        cost: { egy: 5000, usa: 800, sau: 1500 }, type: 'Weekly',
        healthBonus: 1, desc: 'Personal training twice a week.' },
      { id: 'pt_elite', name: 'Elite Performance Coach',
        brands: ['EXOS', 'Athletes\' Performance'],
        cost: { egy: 20000, usa: 3500, sau: 6000 }, type: 'Weekly',
        healthBonus: 3, desc: 'Elite performance coaching. +3 health per year.' }
    ]
  },

  massage_therapist: {
    label: 'Massage Therapist',
    icon: '💆',
    variants: [
      { id: 'mt_std', name: 'On-call Massage Therapist',
        brands: ['Agency', 'Individual'],
        cost: { egy: 4000, usa: 800, sau: 1500 }, type: 'On-call',
        healthBonus: 1, moodBonus: 2, desc: 'Home massage sessions on request.' }
    ]
  },

  pool_cleaner: {
    label: 'Pool Cleaner',
    icon: '🏊',
    variants: [
      { id: 'pc_std', name: 'Weekly Pool Service',
        brands: ['Agency', 'Individual'],
        cost: { egy: 2000, usa: 400, sau: 900 }, type: 'Weekly', reqPool: true,
        desc: 'Weekly pool cleaning and chemical balancing.' }
    ]
  }
};

/* ============================================================
   HELPERS
   ============================================================ */
function getActiveHome() {
  if (!S || !S.ownedHomes || !S.ownedHomes.length) return null;
  const id = S.realEstateActiveHomeId;
  return S.ownedHomes.find(h => h.id === id) || S.ownedHomes[0];
}

function homeSelector() {
  if (!S || !S.ownedHomes || S.ownedHomes.length <= 1) return '';
  const active = S.realEstateActiveHomeId;
  return `<div class="card" style="padding:8px">
    <p class="muted small" style="margin-bottom:6px">Active home:</p>
    <div style="display:flex;gap:4px;flex-wrap:wrap">
      ${S.ownedHomes.map(h => `<button class="pill ${active === h.id ? 'on' : ''}" style="padding:4px 8px;font-size:.72rem" onclick="S.realEstateActiveHomeId='${h.id}';render()">${h.name}</button>`).join('')}
    </div>
  </div>`;
}

function isVilla(h) { return ['standalone_s', 'standalone_l', 'mansion', 'palace', 'villa', 'villa_l'].includes(h.unitId); }
function isMansion(h) { return ['mansion', 'palace'].includes(h.unitId); }
function hasGarden(h) { return isVilla(h) || ['duplex', 'penthouse', 'townhouse', 'townhouse_l', 'twinhouse'].includes(h.unitId); }
function hasPool(h) { return (h.upgrades || []).includes('heated_pool'); }
function homeCountry(h) { return h.country || S.country || 'egy'; }

/* ============================================================
   RENOVATE TAB
   ============================================================ */
function renovateSection() {
  const h = getActiveHome();
  if (!h) return `<div class="card"><h3>No homes</h3></div>`;
  if (typeof h.condition !== 'number') h.condition = 100;
  const country = homeCountry(h);

  let html = homeSelector();

  const condColor = h.condition > 80 ? '#34d399' : h.condition > 40 ? '#fbbf24' : '#fb7185';
  const repairCost = Math.round((100 - h.condition) * (h.area * (country === 'egy' ? 200 : 5)));

  html += `<div class="card">
    <h3>Property Condition</h3>
    <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:4px">
      <span>Wear & Tear</span><span style="color:${condColor};font-weight:bold">${h.condition}%</span>
    </div>
    <div style="height:6px;background:#25253a;border-radius:3px;margin-bottom:10px">
      <div style="height:100%;width:${h.condition}%;background:${condColor};border-radius:3px"></div>
    </div>
    <p class="muted small">Condition drops 2-5% per year. Below 50%, comfort drops and tenants may leave. Below 20%, random disasters occur.</p>
    ${h.condition < 100 ? `<button class="opt" style="margin-top:8px" onclick="repairHome('${h.id}')" ${S.wealth < repairCost ? 'disabled' : ''}>Full Repair — ${money(repairCost)}</button>` : `<button class="opt" style="margin-top:8px" disabled>In perfect condition</button>`}
  </div>`;

  const grouped = {};
  HOME_UPGRADES_CATALOG.forEach(u => {
    if (!grouped[u.category]) grouped[u.category] = [];
    grouped[u.category].push(u);
  });

  Object.entries(grouped).forEach(([cat, list]) => {
    html += `<div class="card"><h4 style="font-size:.9rem;color:#8b5cf6;margin-top:0">${cat}</h4>`;
    list.forEach(u => {
      const applied = (h.upgrades || []).includes(u.id);
      const blockedVilla = u.requiresVilla && !isVilla(h);
      const blockedMansion = u.requiresMansion && !isMansion(h);
      const blockedGarden = u.requiresGarden && !hasGarden(h);
      const blocked = blockedVilla || blockedMansion || blockedGarden;
      const cost = (u.cost && u.cost[country]) || 0;
      const canAfford = S.wealth >= cost;
      if (applied) {
        html += `<div class="row" style="padding:6px 0"><span>${u.name}</span><b class="good">✓ Installed</b></div>`;
        return;
      }
      const maint = (u.maintenancePerYear && u.maintenancePerYear[country]) || 0;
      const blockers = [];
      if (blockedVilla) blockers.push('Requires Villa');
      if (blockedMansion) blockers.push('Requires Mansion');
      if (blockedGarden) blockers.push('Requires Garden');
      html += `<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between"><b>${u.name}</b><b class="mono">${money(cost)}</b></div>
        <div class="muted small">${u.brands ? u.brands.slice(0, 2).join(', ') + ' · ' : ''}Mood +${u.moodBonus} · Value +${Math.round((u.valueAdd - 1) * 100)}%${maint > 0 ? ` · Maint ${money(maint)}/yr` : ''}${blockers.length ? ' · <span class="bad">' + blockers.join(', ') + '</span>' : ''}</div>
        ${!blocked ? `<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" ${canAfford ? '' : 'disabled'} onclick="buyUpgrade('${h.id}','${u.id}')">${canAfford ? 'Install' : 'Cannot afford'}</button>` : ''}
      </div>`;
    });
    html += `</div>`;
  });
  return html;
}

window.repairHome = function(homeId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  if (!h) return;
  const country = homeCountry(h);
  const cost = Math.round((100 - h.condition) * (h.area * (country === 'egy' ? 200 : 5)));
  if (S.wealth < cost) return;
  S.wealth -= cost;
  h.condition = 100;
  log(`Repaired ${h.name} to perfect condition for ${money(cost)}.`);
  render();
};

window.buyUpgrade = function(homeId, upgradeId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  if (!h) return;
  if (!h.upgrades) h.upgrades = [];
  if (h.upgrades.includes(upgradeId)) return;
  const up = HOME_UPGRADES_CATALOG.find(u => u.id === upgradeId);
  const country = homeCountry(h);
  const cost = (up.cost && up.cost[country]) || 0;
  if (S.wealth < cost) return;
  S.wealth -= cost;
  h.upgrades.push(upgradeId);
  if (up.valueAdd) {
    h.value = Math.round(h.value * up.valueAdd);
    if (typeof h.baseValue === 'number') h.baseValue = Math.round(h.baseValue * up.valueAdd);
  }
  if (up.moodBonus) h.homeComfort = (h.homeComfort || 0) + up.moodBonus;
  log(`Installed ${up.name} at ${h.name} for ${money(cost)}.`);
  render();
};

/* ============================================================
   FURNISH TAB
   ============================================================ */
function furnishSection() {
  const h = getActiveHome();
  if (!h) return `<div class="card"><h3>No homes</h3></div>`;
  if (!h.furniture) h.furniture = {};
  const country = homeCountry(h);

  let html = homeSelector();
  html += `<div class="card"><h3>Furnish · ${h.name}</h3>
    <p class="muted small">Comfort score: <b class="gold">${h.homeComfort || 0}</b></p>
  </div>`;

  Object.entries(DETAILED_FURNITURE).forEach(([catId, cat]) => {
    if (cat.requiresChildren && S.children === 0) return;
    if (cat.requiresGarden && !hasGarden(h)) return;
    const currentTier = h.furniture[catId];
    html += `<div class="card">
      <h4 style="font-size:.9rem;color:#8b5cf6;margin-top:0">${cat.icon || ''} ${cat.label}</h4>
      ${cat.tiers.map(t => {
        const isCurrent = currentTier === t.id;
        const cost = (t.cost && t.cost[country]) || 0;
        const canAfford = S.wealth >= cost;
        const maint = (t.maintenancePerYear && t.maintenancePerYear[country]) || 0;
        return `<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">
          <div style="display:flex;justify-content:space-between"><b>${t.name}${isCurrent ? ' ✓' : ''}</b><b class="mono">${money(cost)}</b></div>
          <div class="muted small">${t.brands ? t.brands.join(', ') + ' · ' : ''}Mood +${t.moodBonus}${t.appreciationRate ? ` · Appreciates ${Math.round(t.appreciationRate * 100)}%/yr` : ''}${maint > 0 ? ` · Maint ${money(maint)}/yr` : ''}</div>
          <div class="muted small" style="font-style:italic">${t.desc || ''}</div>
          ${!isCurrent ? `<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" ${canAfford ? '' : 'disabled'} onclick="buyFurniture('${h.id}','${catId}','${t.id}')">${canAfford ? 'Purchase' : 'Cannot afford'}</button>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  });
  return html;
}

window.buyFurniture = function(homeId, categoryId, tierId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  if (!h) return;
  const cat = DETAILED_FURNITURE[categoryId];
  const newTier = cat.tiers.find(t => t.id === tierId);
  const prevTierId = h.furniture[categoryId];
  const prevTier = prevTierId ? cat.tiers.find(t => t.id === prevTierId) : null;
  const country = homeCountry(h);
  const cost = (newTier.cost && newTier.cost[country]) || 0;
  if (S.wealth < cost) return;
  S.wealth -= cost;
  const prevBonus = prevTier ? prevTier.moodBonus : 0;
  h.homeComfort = (h.homeComfort || 0) - prevBonus + newTier.moodBonus;
  if (newTier.valueAdd) h.value = Math.round(h.value * newTier.valueAdd);
  h.furniture[categoryId] = tierId;
  log(`Purchased ${newTier.name} for ${h.name} (${money(cost)}).`);
  render();
};

/* ============================================================
   STAFF TAB
   ============================================================ */
function staffSection() {
  const h = getActiveHome();
  if (!h) return `<div class="card"><h3>No homes</h3></div>`;
  if (!h.staff) h.staff = [];
  const country = homeCountry(h);

  let html = homeSelector();

  if (h.staff.length > 0) {
    const totalMonthly = h.staff.reduce((sum, s) => sum + s.monthlyCost, 0);
    html += `<div class="card">
      <h3>Active Payroll · ${h.name}</h3>
      ${h.staff.map((s, i) => {
        const def = DETAILED_STAFF[s.staffId];
        const variant = def.variants.find(v => v.id === s.variantId);
        return `<div class="row" style="padding:6px 0">
          <span>${def.icon || ''} ${def.label}: ${variant ? variant.name : 'Staff'}</span>
          <span><b class="mono">${money(s.monthlyCost)}/mo</b>
          <button class="pill" style="padding:2px 6px;font-size:.7rem;margin-left:6px;border-color:#fb7185;color:#fb7185" onclick="fireStaff('${h.id}',${i})">Fire</button></span>
        </div>`;
      }).join('')}
      <div class="row" style="border-top:1px solid #1a1a2a;margin-top:6px;padding-top:6px">
        <b>Total Annual Payroll</b><b class="mono bad">${money(totalMonthly * 12)}/yr</b>
      </div>
    </div>`;
  }

  Object.entries(DETAILED_STAFF).forEach(([staffId, def]) => {
    html += `<div class="card">
      <h4 style="font-size:.9rem;color:#8b5cf6;margin-top:0">${def.icon || ''} ${def.label}</h4>
      ${def.variants.map(v => {
        if (h.staff.some(s => s.staffId === staffId && s.variantId === v.id)) return '';
        const monthly = (v.cost && v.cost[country]) || 0;
        const canAfford = S.wealth >= (monthly * 2);
        const blockedVilla = v.reqVilla && !isVilla(h);
        const blockedMansion = v.reqMansion && !isMansion(h);
        const blockedChild = v.reqChild && (S.children || 0) === 0;
        const blockedGarden = v.reqGarden && !hasGarden(h);
        const blockedPool = v.reqPool && !hasPool(h);
        const blocked = blockedVilla || blockedMansion || blockedChild || blockedGarden || blockedPool;
        const reasons = [];
        if (blockedVilla) reasons.push('Requires Villa');
        if (blockedMansion) reasons.push('Requires Mansion');
        if (blockedChild) reasons.push('Requires Children');
        if (blockedGarden) reasons.push('Requires Garden');
        if (blockedPool) reasons.push('Requires Pool');
        return `<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">
          <div style="display:flex;justify-content:space-between"><b>${v.name}</b><b class="mono">${money(monthly)}/mo</b></div>
          <div class="muted small">${v.type} · ${v.desc || ''}${reasons.length ? ` · <span class="bad">${reasons.join(', ')}</span>` : ''}</div>
          ${!blocked ? `<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" ${canAfford ? '' : 'disabled'} onclick="hireStaff('${h.id}','${staffId}','${v.id}')">${canAfford ? 'Hire' : 'Insufficient Funds'}</button>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  });
  return html;
}

window.hireStaff = function(homeId, staffId, variantId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  const def = DETAILED_STAFF[staffId];
  const variant = def.variants.find(v => v.id === variantId);
  const country = homeCountry(h);
  const cost = (variant.cost && variant.cost[country]) || 0;
  if (S.wealth < cost) return;
  h.staff.push({ staffId, variantId, monthlyCost: cost, hiredYear: gameYear() });
  log(`Hired ${variant.name} at ${h.name} for ${money(cost)}/mo.`);
  render();
};

window.fireStaff = function(homeId, index) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  if (!h || !h.staff[index]) return;
  const released = h.staff[index];
  const def = DETAILED_STAFF[released.staffId];
  const variant = def.variants.find(v => v.id === released.variantId);
  h.staff.splice(index, 1);
  log(`Released ${variant ? variant.name : released.staffId} from ${h.name}.`);
  render();
};

/* ============================================================
   BILLS & OPS TAB
   ============================================================ */
function billsSection() {
  const h = getActiveHome();
  if (!h) return `<div class="card"><h3>No homes</h3></div>`;
  const country = homeCountry(h);
  let html = homeSelector();

  const bills = calculateAnnualBills(h);

  html += `<div class="card">
    <h3>Annual Operations · ${h.name}</h3>
    <p class="muted small">Property in ${country.toUpperCase()} · ${h.area} m²</p>
    <div class="row"><span>Utilities (water/electricity/gas)</span><b class="mono bad">−${money(bills.util)}</b></div>
    <div class="row"><span>Property Taxes</span><b class="mono bad">−${money(bills.tax)}</b></div>
    <div class="row"><span>HOA / Compound fees</span><b class="mono bad">−${money(bills.hoa)}</b></div>
    <div class="row"><span>Staff Payroll</span><b class="mono bad">−${money(bills.staff)}</b></div>
    <div class="row"><span>Upgrade maintenance</span><b class="mono bad">−${money(bills.upgradeMaint)}</b></div>
    <div class="row"><span>Furniture maintenance</span><b class="mono bad">−${money(bills.furnMaint)}</b></div>
    <div class="row" style="border-top:2px solid #1a1a2a;margin-top:10px;padding-top:10px">
      <b>Total Annual Cost</b><b class="mono bad" style="font-size:1.1rem">−${money(bills.total)}</b>
    </div>
    ${h.status === 'rented' ? `<div class="row" style="border-top:1px solid #1a1a2a;margin-top:10px;padding-top:6px"><span>Rental income</span><b class="mono good">+${money(h.monthlyRent * 12)}</b></div>
    <div class="row"><b>Net</b><b class="mono ${(h.monthlyRent * 12 - bills.total) >= 0 ? 'good' : 'bad'}">${money(h.monthlyRent * 12 - bills.total)}</b></div>` : ''}
  </div>`;

  return html;
}

function calculateAnnualBills(h) {
  const country = homeCountry(h);

  // Utilities: base per area, adjusted by upgrades
  const basePerM2 = { egy: 30, usa: 2, sau: 8, uae: 12, uk: 2.5, can: 2.2, deu: 3, tur: 20 }[country] || 30;
  let utilMultiplier = 1.0;
  (h.upgrades || []).forEach(upId => {
    const up = HOME_UPGRADES_CATALOG.find(u => u.id === upId);
    if (up && up.energyMultiplier) utilMultiplier *= up.energyMultiplier;
  });
  const monthlyUtil = Math.round(h.area * basePerM2 * utilMultiplier);
  const util = monthlyUtil * 12;

  // Tax: country-specific
  let tax = 0;
  if (country === 'usa') tax = Math.round(h.value * 0.015);
  else if (country === 'egy') tax = h.value >= 2000000 ? Math.round(h.value * 0.001) : 0;
  else if (country === 'sau') tax = Math.round(h.value * 0.025);
  else if (country === 'uk') tax = Math.round(h.value * 0.005);
  else if (country === 'uae') tax = 0;

  // HOA
  const hoa = h.hoaFee || 0;

  // Staff
  const staff = (h.staff || []).reduce((sum, s) => sum + s.monthlyCost, 0) * 12;

  // Upgrade maintenance
  const upgradeMaint = (h.upgrades || []).reduce((sum, upId) => {
    const up = HOME_UPGRADES_CATALOG.find(u => u.id === upId);
    return sum + ((up && up.maintenancePerYear && up.maintenancePerYear[country]) || 0);
  }, 0);

  // Furniture maintenance
  const furnMaint = Object.entries(h.furniture || {}).reduce((sum, [catId, tierId]) => {
    const cat = DETAILED_FURNITURE[catId];
    if (!cat) return sum;
    const tier = cat.tiers.find(t => t.id === tierId);
    return sum + ((tier && tier.maintenancePerYear && tier.maintenancePerYear[country]) || 0);
  }, 0);

  return {
    util, tax, hoa, staff, upgradeMaint, furnMaint,
    total: util + tax + hoa + staff + upgradeMaint + furnMaint
  };
}

/* ============================================================
   YEAR TICK — condition, bills, comfort, staff perks, art, events
   ============================================================ */
GameHooks.on('year', () => {
  if (!S || S.age < 18 || !S.ownedHomes) return;

  S.ownedHomes.forEach(h => {
    if (!h.upgrades) h.upgrades = [];
    if (!h.staff) h.staff = [];
    if (typeof h.condition !== 'number') h.condition = 100;
    if (!h.furniture) h.furniture = {};
    const country = homeCountry(h);

    // 1. Degradation
    const decay = Math.floor(Math.random() * 4) + 2;
    h.condition = Math.max(0, h.condition - decay);

    // 2. Condition consequences
    if (h.condition < 40 && h.status === 'rented') {
      log(`⚠️ Tenants at ${h.name} are complaining about poor condition!`);
      if (Math.random() < 0.3) {
        h.status = 'vacant';
        h.tenant = null;
        log(`❌ Tenants at ${h.name} broke the lease and left due to disrepair.`);
      }
    }
    if (h.condition < 20 && Math.random() < 0.2) {
      const repair = Math.round(h.value * 0.02);
      S.wealth -= repair;
      log(`🚨 Emergency! Pipe burst at ${h.name} due to lack of maintenance. Forced repair: ${money(repair)}`);
    }

    // 3. Bills
    const bills = calculateAnnualBills(h);
    S.wealth -= bills.total;

    // 4. Staff broke check
    if (S.wealth < 0 && h.staff.length > 0) {
      log(`💸 You couldn't make payroll! All staff at ${h.name} quit.`);
      h.staff = [];
      fx({ happiness: -15, social: -10 });
    }

    // 5. Comfort bonus if occupied
    if (h.status === 'occupied') {
      let effectiveComfort = h.homeComfort || 0;
      if (h.condition < 50) effectiveComfort = Math.floor(effectiveComfort / 2);
      if (effectiveComfort > 0) fx({ happiness: Math.min(15, effectiveComfort) });

      // Staff perks
      h.staff.forEach(s => {
        const def = DETAILED_STAFF[s.staffId];
        const variant = def.variants.find(v => v.id === s.variantId);
        if (!variant) return;
        if (variant.smartsBonus && S.children > 0) fx({ smarts: 2 });
        if (variant.healthBonus) fx({ health: variant.healthBonus });
        if (variant.moodBonus) fx({ happiness: variant.moodBonus });
      });
    }

    // 6. Art appreciation
    Object.entries(h.furniture).forEach(([catId, tierId]) => {
      const cat = DETAILED_FURNITURE[catId];
      if (!cat) return;
      const tier = cat.tiers.find(t => t.id === tierId);
      if (tier && tier.appreciationRate) {
        h.value = Math.round(h.value * (1 + tier.appreciationRate));
      }
    });
  });
});

/* ============================================================
   REGISTER SUB-TABS + INJECT MANAGE BUTTONS
   ============================================================ */
registerRealEstateTab({ id: 'renovate', label: '🔧 Renovate', order: 10, requiresHome: true, render: renovateSection });
registerRealEstateTab({ id: 'furnish', label: '🛋 Furnish', order: 11, requiresHome: true, render: furnishSection });
registerRealEstateTab({ id: 'staff', label: '👥 Staff', order: 12, requiresHome: true, render: staffSection });
registerRealEstateTab({ id: 'bills', label: '🧾 Bills & Ops', order: 13, requiresHome: true, render: billsSection });

GameHooks.on('render', () => {
  if (!S || typeof activeTab === 'undefined' || activeTab !== 'realestate' || S.realEstateTab !== 'mine') return;
  const view = document.getElementById('view');
  if (!view) return;
  view.querySelectorAll('button[onclick]').forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';
    const m = onclick.match(/^sellHome\('([^']+)'\)$/);
    if (!m) return;
    if (btn.dataset.manageAdded === '1') return;
    btn.dataset.manageAdded = '1';
    const homeId = m[1];
    const wrap = btn.parentElement;
    [['🔧 Renovate', 'renovate'], ['🛋 Furnish', 'furnish'], ['👥 Staff', 'staff'], ['🧾 Bills', 'bills']].forEach(([label, tabId]) => {
      const b = document.createElement('button');
      b.className = 'pill';
      b.style.cssText = 'padding:4px 8px;font-size:.72rem;margin-right:4px;margin-bottom:4px';
      b.textContent = label;
      b.setAttribute('onclick', `S.realEstateActiveHomeId='${homeId}';S.realEstateTab='${tabId}';render()`);
      wrap.insertBefore(b, btn);
    });
  });
});
