/* ============================================================
   WORLD LIFE — DATA: REAL ESTATE & HOUSING SYSTEM v2 (EXPANDED)
   ============================================================
   ~180 compounds across 8 countries · 40 neighborhoods ·
   40 land plots · 26 unit types · 15 payment plans ·
   8 finishing tiers · 25 upgrades · 8 staff types ·
   Full furniture & appliance catalogs · 12 mortgage products ·
   10 construction styles · 15 property events.

   ALL PRICES IN EACH COUNTRY'S OWN CURRENCY.
   ============================================================ */

/* ============================================================
   0. CONFIG
   ============================================================ */
const REAL_ESTATE_CONFIG = {
  appreciationRates: {
    egy: 0.18, usa: 0.04, sau: 0.06, uae: 0.07, uk: 0.035,
    can: 0.045, deu: 0.03, tur: 0.22
  },
  buildCostPerM2: {
    egy: 18000, usa: 2800, sau: 4500, uae: 5500, uk: 3200,
    can: 3000, deu: 3500, tur: 8000
  },
  defaultMaintenanceDepositPct: 0.08,
  compoundServiceChargePerM2PerMonth: {
    egy: 25, usa: 3, sau: 8, uae: 15, uk: 4, can: 3.5, deu: 4, tur: 20
  }
};

/* ============================================================
   1. DEVELOPERS — structured registry
   ============================================================ */
const DEVELOPERS = {
  egy: [
    { id: 'tmg', name: 'Talaat Moustafa Group', nameAr: 'طلعت مصطفى', founded: 1967, reputation: 5, listed: true, projects: ['madinaty','noor','southmed','celia','rehab','telal_sokhna'] },
    { id: 'emaar_misr', name: 'Emaar Misr', nameAr: 'إعمار مصر', founded: 2005, reputation: 5, listed: true, projects: ['marassi','mivida','cairogate','aeon'] },
    { id: 'sodic', name: 'SODIC', nameAr: 'سوديك', founded: 1996, reputation: 5, listed: true, projects: ['villette','allegria','eastown','westown','zed_east','june','vye','karmell','mizar','village_gate'] },
    { id: 'palmhills', name: 'Palm Hills Developments', nameAr: 'بالم هيلز', founded: 1997, reputation: 4, listed: true, projects: ['palmhills_nc','badya','palmhills_alex','hacienda_waters','hacienda_bay'] },
    { id: 'mountain_view', name: 'Mountain View (DMG)', nameAr: 'ماونتن فيو', founded: 2006, reputation: 4, listed: false, projects: ['mvic_nc','mv_ras_elhekma'] },
    { id: 'ora', name: 'ORA Developers', nameAr: 'أورا', founded: 2016, reputation: 4, listed: false, projects: ['zed_zayed','silversands','oia'] },
    { id: 'hassan_allam', name: 'Hassan Allam Properties', nameAr: 'حسن علام', founded: 2016, reputation: 4, listed: false, projects: ['swanlake_residence','swanlake_west'] },
    { id: 'orascom', name: 'Orascom Development', nameAr: 'أوراسكوم', founded: 1989, reputation: 5, listed: true, projects: ['gouna_enclave','owest','makadi'] },
    { id: 'city_edge', name: 'City Edge Developments', nameAr: 'سيتي إيدج', founded: 2017, reputation: 4, listed: false, projects: ['north_edge_towers','new_alamein_towers','al_maqsad','mazarine'] },
    { id: 'misr_italia', name: 'Misr Italia Properties', nameAr: 'مصر إيطاليا', founded: 1998, reputation: 4, listed: false, projects: ['el_patio','el_patio_oro','il_bosco','cairo_business_plaza'] },
    { id: 'tatweer', name: 'Tatweer Misr', nameAr: 'تطوير مصر', founded: 2014, reputation: 4, listed: false, projects: ['il_monte_galala','bloomfields','salt'] },
    { id: 'la_vista', name: 'La Vista Developments', nameAr: 'لافيستا', founded: 2001, reputation: 4, listed: false, projects: ['la_vista', 'la_vista_topaz','la_vista_city'] },
    { id: 'al_futtaim', name: 'Al Futtaim Group', nameAr: 'الفطيم', founded: 1930, reputation: 5, listed: true, projects: ['cairo_festival','may_fair','iconic_tower'] },
    { id: 'madinet_nasr', name: 'Madinet Nasr for Housing', nameAr: 'مدينة نصر', founded: 1959, reputation: 4, listed: true, projects: ['sarai','taj_city'] },
    { id: 'inertia', name: 'Inertia', nameAr: 'إنيرشيا', founded: 2017, reputation: 3, listed: false, projects: ['jefaira','rokn','the_hive'] },
    { id: 'sed', name: 'Saudi Egyptian Developers (SED)', nameAr: 'سيد', founded: 2004, reputation: 3, listed: false, projects: ['sawary'] },
    { id: 'hyde_park_dev', name: 'Hyde Park Developments', nameAr: 'هايد بارك', founded: 2007, reputation: 4, listed: false, projects: ['hyde_park_nc','hyde_park_west'] }
  ],
  usa: [
    { id: 'related', name: 'Related Companies', founded: 1972, reputation: 5, listed: false, projects: ['hudson_yards'] },
    { id: 'toll', name: 'Toll Brothers', founded: 1967, reputation: 5, listed: true, projects: ['estates_at_westwood'] },
    { id: 'lennar', name: 'Lennar', founded: 1954, reputation: 4, listed: true, projects: [] },
    { id: 'swire', name: 'Swire Properties', founded: 1972, reputation: 5, listed: true, projects: ['brickell_city_centre'] },
    { id: 'dezer', name: 'Dezer Development', founded: 1980, reputation: 4, listed: false, projects: ['porsche_design_tower'] },
    { id: 'hines', name: 'Hines', founded: 1957, reputation: 5, listed: false, projects: ['wolf_point'] },
    { id: 'tishman', name: 'Tishman Speyer', founded: 1978, reputation: 5, listed: false, projects: [] }
  ],
  sau: [
    { id: 'roshn', name: 'ROSHN Group (PIF)', founded: 2019, reputation: 5, listed: true, projects: ['roshn_sedra'] },
    { id: 'diriyah', name: 'Diriyah Gate Development Authority', founded: 2017, reputation: 5, listed: false, projects: ['diriyah_residences'] },
    { id: 'dar_arkan', name: 'Dar Al Arkan', founded: 1994, reputation: 4, listed: true, projects: ['shams_ar_riyadh'] },
    { id: 'emaar_ksa', name: 'Emaar Saudi Arabia', founded: 2016, reputation: 5, listed: true, projects: [] },
    { id: 'nhc', name: 'National Housing Company', founded: 2016, reputation: 4, listed: false, projects: [] }
  ],
  uae: [
    { id: 'emaar_uae', name: 'Emaar Properties', founded: 1997, reputation: 5, listed: true, projects: ['downtown_views'] },
    { id: 'nakheel', name: 'Nakheel', founded: 2000, reputation: 5, listed: false, projects: ['palm_jumeirah_villas'] },
    { id: 'damac', name: 'DAMAC Properties', founded: 2002, reputation: 4, listed: true, projects: [] },
    { id: 'aldar', name: 'Aldar Properties', founded: 2004, reputation: 5, listed: true, projects: [] },
    { id: 'sobha', name: 'Sobha Realty', founded: 1976, reputation: 4, listed: true, projects: [] }
  ]
};

/* ============================================================
   2. COMPOUNDS — 180 real compounds across 8 countries
   ============================================================ */
const COMPOUNDS = {
  /* ------------------------------------------------------------
     EGYPT — ~55 compounds, real Egyptian developers
     ------------------------------------------------------------ */
  egy: [
    // ===== TMG =====
    { id: 'madinaty', name: 'Madinaty', developerId: 'tmg', developer: 'TMG', city: 'New Cairo', loc: 'New Cairo, Suez Road',
      ppmLow: 55000, ppm: 75000, ppmHigh: 95000, delivery: 'ready', launchYear: 2005,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.07, compoundFee: 25,
      amenities: ['schools','malls','hospital','golf','sports_club','metro_link','security'],
      tag: 'Largest fully integrated mega-city in Egypt, 10M+ m² of green space.' },
    { id: 'noor', name: 'Noor City', developerId: 'tmg', developer: 'TMG', city: 'Capital Gardens', loc: 'Opposite New Administrative Capital',
      ppmLow: 45000, ppm: 60000, ppmHigh: 75000, delivery: '2026', launchYear: 2021,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.065, compoundFee: 20,
      amenities: ['smart_city','schools','malls','parks','security'],
      tag: 'Ultra-smart green city near the New Capital.' },
    { id: 'southmed', name: 'SouthMED', developerId: 'tmg', developer: 'TMG', city: 'North Coast', loc: 'El Dabaa / Ras El Hekma',
      ppmLow: 140000, ppm: 180000, ppmHigh: 230000, delivery: '2028', launchYear: 2024,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.09, compoundFee: 40,
      amenities: ['lagoon','marina','golf','private_beach','helipad','luxury_hotels'],
      tag: 'International Mediterranean resort with private marina.' },
    { id: 'celia', name: 'Celia', developerId: 'tmg', developer: 'TMG', city: 'New Administrative Capital', loc: 'Downtown New Capital',
      ppmLow: 38000, ppm: 52000, ppmHigh: 68000, delivery: '2025', launchYear: 2021,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.065, compoundFee: 18,
      amenities: ['parks','schools','security','smart_home'],
      tag: 'First integrated residential district in the New Capital.' },
    { id: 'rehab', name: 'Al Rehab', developerId: 'tmg', developer: 'TMG', city: 'New Cairo', loc: 'Al Rehab City',
      ppmLow: 40000, ppm: 55000, ppmHigh: 72000, delivery: 'ready', launchYear: 1998,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.075, compoundFee: 15,
      amenities: ['schools','malls','hospital','parks','security'],
      tag: 'Pioneer Egyptian gated community, now fully mature.' },
    { id: 'telal_sokhna', name: 'Telal Sokhna', developerId: 'tmg', developer: 'TMG', city: 'Ain Sokhna', loc: 'Ain Sokhna, Red Sea',
      ppmLow: 45000, ppm: 60000, ppmHigh: 78000, delivery: 'ready', launchYear: 2016,
      hap: 3, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 20,
      amenities: ['beach','pool','security','marina'],
      tag: 'Beach chalets by TMG on the Red Sea.' },
    { id: 'fourteen_golf', name: 'Fourteen Golf', developerId: 'tmg', developer: 'TMG', city: 'New Cairo', loc: 'Madinaty Extension',
      ppmLow: 70000, ppm: 92000, ppmHigh: 120000, delivery: '2026', launchYear: 2023,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.075, compoundFee: 35,
      amenities: ['golf','club','schools','parks','security'],
      tag: 'Championship golf villas at the heart of Madinaty.' },

    // ===== Emaar Misr =====
    { id: 'marassi', name: 'Marassi', developerId: 'emaar_misr', developer: 'Emaar Misr', city: 'North Coast', loc: 'Sidi Abdel Rahman',
      ppmLow: 160000, ppm: 210000, ppmHigh: 280000, delivery: 'ready', launchYear: 2008,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.10, compoundFee: 55,
      amenities: ['beach','golf','marina','nightlife','five_star_hotels','security'],
      tag: 'Pinnacle of coastal luxury living in the Middle East.' },
    { id: 'mivida', name: 'Mivida', developerId: 'emaar_misr', developer: 'Emaar Misr', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 110000, ppm: 135000, ppmHigh: 165000, delivery: 'ready', launchYear: 2008,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 30,
      amenities: ['international_schools','downtown','medical_complex','parks','club'],
      tag: 'California-inspired eco-friendly haven.' },
    { id: 'cairogate', name: 'Cairo Gate', developerId: 'emaar_misr', developer: 'Emaar Misr', city: 'Sheikh Zayed', loc: 'Dahshour Highway',
      ppmLow: 95000, ppm: 120000, ppmHigh: 150000, delivery: '2025', launchYear: 2017,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 28,
      amenities: ['boutique_hotel','retail_strip','clubhouse','security'],
      tag: 'Boutique lifestyle community in West Cairo.' },
    { id: 'aeon', name: 'The Aeon', developerId: 'emaar_misr', developer: 'Emaar Misr', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 95000, ppm: 118000, ppmHigh: 148000, delivery: '2026', launchYear: 2023,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 30,
      amenities: ['schools','parks','club','security','pool'],
      tag: 'Emaar Misr\'s newest residential landmark in New Cairo.' },

    // ===== SODIC =====
    { id: 'villette', name: 'Villette', developerId: 'sodic', developer: 'SODIC', city: 'New Cairo', loc: 'Golden Square, 5th Settlement',
      ppmLow: 105000, ppm: 130000, ppmHigh: 160000, delivery: 'ready', launchYear: 2014,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.07, compoundFee: 30,
      amenities: ['sports_club','organic_parks','walkways','security','pools'],
      tag: 'French-designed master-planned neighborhood with active green parks.' },
    { id: 'allegria', name: 'Allegria', developerId: 'sodic', developer: 'SODIC', city: 'Sheikh Zayed', loc: 'SODIC West',
      ppmLow: 120000, ppm: 150000, ppmHigh: 190000, delivery: 'ready', launchYear: 2010,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.075, compoundFee: 35,
      amenities: ['signature_golf','country_club','spa','fine_dining','security'],
      tag: 'Greg Norman signature golf villas.' },
    { id: 'eastown', name: 'Eastown', developerId: 'sodic', developer: 'SODIC', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 80000, ppm: 95000, ppmHigh: 115000, delivery: 'ready', launchYear: 2015,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.075, compoundFee: 22,
      amenities: ['schools','parks','club','pool'],
      tag: 'Urban mixed-use living near AUC campus.' },
    { id: 'westown', name: 'Westown', developerId: 'sodic', developer: 'SODIC', city: 'Sheikh Zayed', loc: 'SODIC West',
      ppmLow: 75000, ppm: 95000, ppmHigh: 115000, delivery: 'ready', launchYear: 2010,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.075, compoundFee: 22,
      amenities: ['schools','parks','club','pool','business_district'],
      tag: 'Urban west Cairo living with SODIC\'s signature design.' },
    { id: 'zed_east', name: 'Zed East', developerId: 'ora', developer: 'ORA', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 85000, ppm: 105000, ppmHigh: 125000, delivery: 'ready', launchYear: 2019,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 28,
      amenities: ['parks','security','club','pool','schools'],
      tag: 'Modern design, premium finishes.' },
    { id: 'june', name: 'June', developerId: 'sodic', developer: 'SODIC', city: 'North Coast', loc: 'Ras El Hekma',
      ppmLow: 100000, ppm: 130000, ppmHigh: 170000, delivery: 'ready', launchYear: 2021,
      hap: 5, hp: 2, rentalYieldAnnPct: 0.085, compoundFee: 45,
      amenities: ['beach','pool','security','marina','spa'],
      tag: 'SODIC\'s flagship North Coast community.' },
    { id: 'vye', name: 'VYE', developerId: 'sodic', developer: 'SODIC', city: 'Sheikh Zayed', loc: 'SODIC West',
      ppmLow: 90000, ppm: 110000, ppmHigh: 135000, delivery: '2025', launchYear: 2022,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.078, compoundFee: 28,
      amenities: ['parks','club','pool','security'],
      tag: 'SODIC\'s newest west Cairo boutique residential development.' },
    { id: 'karmell', name: 'Karmell', developerId: 'sodic', developer: 'SODIC', city: 'Sheikh Zayed', loc: 'SODIC West',
      ppmLow: 100000, ppm: 125000, ppmHigh: 155000, delivery: 'ready', launchYear: 2020,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 30,
      amenities: ['parks','club','schools','security'],
      tag: 'New Cairo\'s premiere tree-lined boutique community.' },
    { id: 'mizar', name: 'Mizar', developerId: 'sodic', developer: 'SODIC', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 70000, ppm: 85000, ppmHigh: 105000, delivery: 'ready', launchYear: 2017,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.078, compoundFee: 22,
      amenities: ['parks','security','club','pool'],
      tag: 'Intimate community living by SODIC.' },
    { id: 'village_gate', name: 'Village Gate', developerId: 'sodic', developer: 'SODIC', city: 'Sheikh Zayed', loc: 'Central Zayed',
      ppmLow: 65000, ppm: 80000, ppmHigh: 95000, delivery: 'ready', launchYear: 2014,
      hap: 2, hp: 1, rentalYieldAnnPct: 0.075, compoundFee: 20,
      amenities: ['parks','club','pool','schools'],
      tag: 'SODIC\'s affordable entry-level community.' },

    // ===== Palm Hills =====
    { id: 'palmhills_nc', name: 'Palm Hills New Cairo', developerId: 'palmhills', developer: 'Palm Hills', city: 'New Cairo', loc: 'Near Middle Ring Road',
      ppmLow: 90000, ppm: 115000, ppmHigh: 140000, delivery: 'ready', launchYear: 2007,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.07, compoundFee: 25,
      amenities: ['palm_hills_club','schools','commercial','parks'],
      tag: 'Iconic modern architectural design.' },
    { id: 'badya', name: 'Badya', developerId: 'palmhills', developer: 'Palm Hills', city: '6th of October', loc: 'Creative City',
      ppmLow: 70000, ppm: 88000, ppmHigh: 110000, delivery: '2025', launchYear: 2019,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 24,
      amenities: ['smart_city','sports_academy','university_hub','parks'],
      tag: 'First cognitive smart city in the Middle East.' },
    { id: 'palmhills_alex', name: 'Palm Hills Alexandria', developerId: 'palmhills', developer: 'Palm Hills', city: 'Alexandria', loc: 'Near Carrefour City Centre',
      ppmLow: 65000, ppm: 82000, ppmHigh: 105000, delivery: 'ready', launchYear: 2016,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 22,
      amenities: ['schools','clubhouse','green_belt','security'],
      tag: 'First modern gated compound in central Alexandria.' },
    { id: 'hacienda_bay', name: 'Hacienda Bay', developerId: 'palmhills', developer: 'Palm Hills', city: 'North Coast', loc: 'Sidi Heneish',
      ppmLow: 100000, ppm: 130000, ppmHigh: 165000, delivery: 'ready', launchYear: 2014,
      hap: 5, hp: 2, rentalYieldAnnPct: 0.09, compoundFee: 45,
      amenities: ['beach','pool','security','marina','club'],
      tag: 'Famous North Coast beach community.' },
    { id: 'hacienda_waters', name: 'Hacienda Waters', developerId: 'palmhills', developer: 'Palm Hills', city: 'North Coast', loc: 'Ras El Hekma',
      ppmLow: 130000, ppm: 165000, ppmHigh: 210000, delivery: '2027', launchYear: 2023,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.095, compoundFee: 50,
      amenities: ['water_park','private_beach','beach_club','luxury_dining'],
      tag: 'Family water entertainment community.' },

    // ===== Mountain View =====
    { id: 'mvic_nc', name: 'Mountain View iCity', developerId: 'mountain_view', developer: 'Mountain View', city: 'New Cairo', loc: 'Near Hyde Park & AUC',
      ppmLow: 80000, ppm: 100000, ppmHigh: 125000, delivery: 'ready', launchYear: 2015,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 26,
      amenities: ['car_free_roads','central_park','smart_home','clubhouse'],
      tag: 'American-style double-decked multi-level neighborhood.' },
    { id: 'mv_ras_elhekma', name: 'Mountain View Ras El Hekma', developerId: 'mountain_view', developer: 'Mountain View', city: 'North Coast', loc: 'Ras El Hekma Bay',
      ppmLow: 120000, ppm: 150000, ppmHigh: 195000, delivery: 'ready', launchYear: 2019,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.09, compoundFee: 45,
      amenities: ['greek_architecture','crystal_lagoons','private_beach','commercial_strip'],
      tag: 'Santorini-inspired island living on Egyptian coast.' },

    // ===== Hyde Park =====
    { id: 'hyde_park_nc', name: 'Hyde Park New Cairo', developerId: 'hyde_park_dev', developer: 'Hyde Park', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 70000, ppm: 88000, ppmHigh: 110000, delivery: 'ready', launchYear: 2016,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.078, compoundFee: 24,
      amenities: ['parks','security','club','pool','schools'],
      tag: 'Green spaces, family-friendly living.' },
    { id: 'hyde_park_west', name: 'Hyde Park West', developerId: 'hyde_park_dev', developer: 'Hyde Park', city: 'Sheikh Zayed', loc: 'SODIC West',
      ppmLow: 75000, ppm: 92000, ppmHigh: 115000, delivery: '2025', launchYear: 2020,
      hap: 3, hp: 2, rentalYieldAnnPct: 0.078, compoundFee: 24,
      amenities: ['parks','security','club','pool','schools','golf'],
      tag: 'Hyde Park\'s west Cairo expansion.' },

    // ===== ORA =====
    { id: 'zed_zayed', name: 'Zed Sheikh Zayed', developerId: 'ora', developer: 'ORA', city: 'Sheikh Zayed', loc: 'Central Zayed Park',
      ppmLow: 110000, ppm: 140000, ppmHigh: 180000, delivery: 'ready', launchYear: 2019,
      hap: 4, hp: 3, rentalYieldAnnPct: 0.085, compoundFee: 32,
      amenities: ['zed_park','sports_complex','luxury_towers','fine_dining','concierge'],
      tag: 'High-rise luxury parkland towers.' },
    { id: 'silversands', name: 'SilverSands', developerId: 'ora', developer: 'ORA', city: 'North Coast', loc: 'Km 243 Alex-Matrouh Road',
      ppmLow: 150000, ppm: 190000, ppmHigh: 250000, delivery: '2026', launchYear: 2023,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.095, compoundFee: 55,
      amenities: ['beachfront','boutique_hotels','lagoons','high_end_dining'],
      tag: 'Egypt\'s answer to Grenada luxury coastal living.' },
    { id: 'oia', name: 'OIA', developerId: 'ora', developer: 'ORA', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 90000, ppm: 110000, ppmHigh: 138000, delivery: '2026', launchYear: 2023,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 28,
      amenities: ['schools','parks','club','pool','security'],
      tag: 'ORA\'s design-led New Cairo community.' },

    // ===== Hassan Allam =====
    { id: 'swanlake_residence', name: 'SwanLake Residence', developerId: 'hassan_allam', developer: 'Hassan Allam', city: 'New Cairo', loc: 'First Settlement, Suez Road',
      ppmLow: 125000, ppm: 155000, ppmHigh: 195000, delivery: 'ready', launchYear: 2017,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.07, compoundFee: 35,
      amenities: ['sports_club','swan_lagoons','jogging_tracks','security'],
      tag: 'Elite family legacy compound with unparalleled finishing standards.' },
    { id: 'swanlake_west', name: 'Swan Lake West', developerId: 'hassan_allam', developer: 'Hassan Allam', city: 'Sheikh Zayed', loc: 'SODIC West',
      ppmLow: 100000, ppm: 125000, ppmHigh: 155000, delivery: '2025', launchYear: 2021,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 30,
      amenities: ['lagoons','parks','club','schools'],
      tag: 'Hassan Allam\'s west Cairo sister to SwanLake.' },

    // ===== Orascom =====
    { id: 'gouna_enclave', name: 'El Gouna Town', developerId: 'orascom', developer: 'Orascom', city: 'Red Sea', loc: 'Hurghada / El Gouna',
      ppmLow: 160000, ppm: 210000, ppmHigh: 290000, delivery: 'ready', launchYear: 1989,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.11, compoundFee: 60,
      amenities: ['private_marinas','international_hospital','golf','airport','schools'],
      tag: 'Fully established European-standard resort town on the Red Sea.' },
    { id: 'owest', name: 'O West', developerId: 'orascom', developer: 'Orascom', city: '6th of October', loc: 'Dahshour Road',
      ppmLow: 75000, ppm: 95000, ppmHigh: 120000, delivery: 'ready', launchYear: 2018,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 24,
      amenities: ['orascom_club','business_district','schools','hospital'],
      tag: 'El Gouna\'s flagship town living brought to West Cairo.' },
    { id: 'makadi', name: 'Makadi Heights', developerId: 'orascom', developer: 'Orascom', city: 'Red Sea', loc: 'Makadi Bay',
      ppmLow: 70000, ppm: 95000, ppmHigh: 130000, delivery: 'ready', launchYear: 2008,
      hap: 4, hp: 3, rentalYieldAnnPct: 0.09, compoundFee: 35,
      amenities: ['beach','pool','marina','security'],
      tag: 'Orascom\'s hillside Red Sea resort community.' },

    // ===== City Edge =====
    { id: 'north_edge_towers', name: 'North Edge Towers', developerId: 'city_edge', developer: 'City Edge', city: 'New Alamein', loc: 'New Alamein Seafront',
      ppmLow: 130000, ppm: 160000, ppmHigh: 210000, delivery: 'ready', launchYear: 2021,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.09, compoundFee: 45,
      amenities: ['sky_pools','sea_view_concierge','mall','private_beach'],
      tag: 'Iconic coastal skyscrapers over the Mediterranean.' },
    { id: 'new_alamein_towers', name: 'New Alamein Towers', developerId: 'city_edge', developer: 'City Edge', city: 'New Alamein', loc: 'Downtown New Alamein',
      ppmLow: 110000, ppm: 140000, ppmHigh: 180000, delivery: 'ready', launchYear: 2020,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.09, compoundFee: 40,
      amenities: ['sea_view','mall','private_beach','concierge'],
      tag: 'The landmark towers of New Alamein.' },
    { id: 'al_maqsad', name: 'Al Maqsad', developerId: 'city_edge', developer: 'City Edge', city: 'New Administrative Capital', loc: 'R7 District',
      ppmLow: 40000, ppm: 52000, ppmHigh: 68000, delivery: 'ready', launchYear: 2019,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.07, compoundFee: 18,
      amenities: ['parks','schools','security','mosque'],
      tag: 'City Edge\'s flagship New Capital residential district.' },
    { id: 'mazarine', name: 'Mazarine', developerId: 'city_edge', developer: 'City Edge', city: 'New Administrative Capital', loc: 'Downtown New Capital',
      ppmLow: 45000, ppm: 58000, ppmHigh: 75000, delivery: '2025', launchYear: 2021,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 20,
      amenities: ['water_features','parks','schools','security'],
      tag: 'Water-themed New Capital community.' },

    // ===== Misr Italia =====
    { id: 'el_patio', name: 'El Patio', developerId: 'misr_italia', developer: 'Misr Italia', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 85000, ppm: 105000, ppmHigh: 130000, delivery: 'ready', launchYear: 2014,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.078, compoundFee: 26,
      amenities: ['parks','security','club','pool','schools'],
      tag: 'Italian-inspired courtyard living.' },
    { id: 'el_patio_oro', name: 'El Patio Oro', developerId: 'misr_italia', developer: 'Misr Italia', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 105000, ppm: 130000, ppmHigh: 160000, delivery: 'ready', launchYear: 2018,
      hap: 5, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 32,
      amenities: ['parks','club','pool','schools','security'],
      tag: 'Upscale Misr Italia Italian-designed community.' },
    { id: 'il_bosco', name: 'IL Bosco', developerId: 'misr_italia', developer: 'Misr Italia', city: 'New Administrative Capital', loc: 'New Capital',
      ppmLow: 38000, ppm: 50000, ppmHigh: 68000, delivery: '2025', launchYear: 2019,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 20,
      amenities: ['forest','parks','schools','security'],
      tag: 'Forest-themed New Capital community.' },
    { id: 'cairo_business_plaza', name: 'Cairo Business Plaza', developerId: 'misr_italia', developer: 'Misr Italia', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 90000, ppm: 110000, ppmHigh: 135000, delivery: 'ready', launchYear: 2016,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.08, compoundFee: 28,
      amenities: ['business_center','shopping','security','concierge'],
      tag: 'Mixed-use business and residential plaza.' },

    // ===== Tatweer Misr =====
    { id: 'il_monte_galala', name: 'Il Monte Galala', developerId: 'tatweer', developer: 'Tatweer Misr', city: 'Ain Sokhna', loc: 'Ain Sokhna, Red Sea',
      ppmLow: 80000, ppm: 105000, ppmHigh: 135000, delivery: 'ready', launchYear: 2017,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.09, compoundFee: 35,
      amenities: ['beach','crystal_lagoon','pool','security','spa'],
      tag: 'Mountain-and-sea Red Sea resort with crystal lagoons.' },
    { id: 'bloomfields', name: 'Bloomfields', developerId: 'tatweer', developer: 'Tatweer Misr', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 75000, ppm: 95000, ppmHigh: 120000, delivery: 'ready', launchYear: 2018,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.078, compoundFee: 24,
      amenities: ['parks','club','pool','schools','security'],
      tag: 'Bloomfields New Cairo residence.' },
    { id: 'salt', name: 'Salt', developerId: 'tatweer', developer: 'Tatweer Misr', city: 'North Coast', loc: 'Ras El Hekma',
      ppmLow: 120000, ppm: 155000, ppmHigh: 195000, delivery: '2026', launchYear: 2022,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.095, compoundFee: 48,
      amenities: ['beach','lagoons','pool','security','spa'],
      tag: 'Salt-inspired Mediterranean resort community.' },

    // ===== La Vista =====
    { id: 'la_vista', name: 'La Vista 1', developerId: 'la_vista', developer: 'La Vista', city: 'Ain Sokhna', loc: 'Ain Sokhna',
      ppmLow: 55000, ppm: 70000, ppmHigh: 92000, delivery: 'ready', launchYear: 2007,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.085, compoundFee: 22,
      amenities: ['beach','pool','security','marina'],
      tag: 'La Vista\'s flagship Red Sea resort community.' },
    { id: 'la_vista_topaz', name: 'La Vista Topaz', developerId: 'la_vista', developer: 'La Vista', city: 'Ain Sokhna', loc: 'Ain Sokhna, Red Sea',
      ppmLow: 65000, ppm: 85000, ppmHigh: 110000, delivery: 'ready', launchYear: 2018,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.09, compoundFee: 28,
      amenities: ['beach','pool','security','marina','spa'],
      tag: 'Upscale La Vista Red Sea community.' },
    { id: 'la_vista_city', name: 'La Vista City', developerId: 'la_vista', developer: 'La Vista', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 70000, ppm: 88000, ppmHigh: 110000, delivery: '2025', launchYear: 2019,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.078, compoundFee: 24,
      amenities: ['parks','club','pool','schools','security'],
      tag: 'La Vista\'s first residential city community.' },

    // ===== Al Futtaim =====
    { id: 'cairo_festival', name: 'Cairo Festival City', developerId: 'al_futtaim', developer: 'Al Futtaim', city: 'New Cairo', loc: 'New Cairo, Ring Road',
      ppmLow: 95000, ppm: 120000, ppmHigh: 150000, delivery: 'ready', launchYear: 2007,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 30,
      amenities: ['mall','schools','hospital','parks','security','club'],
      tag: 'Al Futtaim\'s flagship integrated city with Mall of Egypt nearby.' },
    { id: 'may_fair', name: 'May Fair', developerId: 'al_futtaim', developer: 'Al Futtaim', city: 'Sheikh Zayed', loc: 'Central Zayed',
      ppmLow: 90000, ppm: 115000, ppmHigh: 145000, delivery: 'ready', launchYear: 2015,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.082, compoundFee: 30,
      amenities: ['parks','club','schools','security','mall'],
      tag: 'Al Futtaim\'s West Cairo integrated community.' },
    { id: 'iconic_tower', name: '6ixty Iconic Tower', developerId: 'al_futtaim', developer: 'Al Futtaim', city: 'New Administrative Capital', loc: 'Downtown New Capital',
      ppmLow: 55000, ppm: 72000, ppmHigh: 92000, delivery: '2025', launchYear: 2021,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.08, compoundFee: 25,
      amenities: ['parks','mall','security','concierge','business_center'],
      tag: 'Al Futtaim\'s iconic New Capital tower.' },

    // ===== Madinet Nasr =====
    { id: 'sarai', name: 'Sarai', developerId: 'madinet_nasr', developer: 'MNHD', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 70000, ppm: 88000, ppmHigh: 110000, delivery: 'ready', launchYear: 2017,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.078, compoundFee: 24,
      amenities: ['schools','parks','club','pool','security'],
      tag: 'MNHD\'s flagship New Cairo mega-development.' },
    { id: 'taj_city', name: 'Taj City', developerId: 'madinet_nasr', developer: 'MNHD', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 65000, ppm: 82000, ppmHigh: 102000, delivery: 'ready', launchYear: 2014,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.075, compoundFee: 22,
      amenities: ['schools','parks','club','security'],
      tag: 'MNHD\'s affordable New Cairo community.' },

    // ===== Inertia =====
    { id: 'jefaira', name: 'Jefaira', developerId: 'inertia', developer: 'Inertia', city: 'North Coast', loc: 'Ras El Hekma',
      ppmLow: 95000, ppm: 125000, ppmHigh: 165000, delivery: 'ready', launchYear: 2019,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.09, compoundFee: 45,
      amenities: ['beach','pool','security','spa','club'],
      tag: 'Inertia\'s flagship North Coast lifestyle community.' },
    { id: 'rokn', name: 'Rokn', developerId: 'inertia', developer: 'Inertia', city: 'New Cairo', loc: 'New Cairo, 5th Settlement',
      ppmLow: 75000, ppm: 92000, ppmHigh: 115000, delivery: '2026', launchYear: 2022,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.078, compoundFee: 24,
      amenities: ['parks','club','pool','schools'],
      tag: 'Inertia\'s modern New Cairo community.' },

    // ===== SED (Sawary) =====
    { id: 'sawary', name: 'Sawary Alexandria', developerId: 'sed', developer: 'SED', city: 'Alexandria', loc: 'Mariout Lake',
      ppmLow: 55000, ppm: 70000, ppmHigh: 90000, delivery: '2025', launchYear: 2015,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.07, compoundFee: 20,
      amenities: ['lake_promenade','sports_club','medical_city','malls'],
      tag: 'Alexandria\'s premier planned modern residential district.' },

    /* 👇👇👇 ADD NEW EGYPTIAN COMPOUNDS HERE 👇👇👇 */
  ],

  /* ------------------------------------------------------------
     USA — 20 compounds
     ------------------------------------------------------------ */
  usa: [
    { id: 'hudson_yards', name: 'Hudson Yards Residences', developerId: 'related', developer: 'Related', city: 'New York', loc: 'Manhattan, West Side',
      ppmLow: 22000, ppm: 32000, ppmHigh: 48000, delivery: 'ready', launchYear: 2019,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.042, compoundFee: 3,
      amenities: ['equinox_club','private_dining','vessel_views','doorman','wine_cellar'],
      tag: 'Manhattan\'s most ambitious modern high-rise development.' },
    { id: 'brickell_city_centre', name: 'Reach & Rise Brickell', developerId: 'swire', developer: 'Swire', city: 'Miami', loc: 'Brickell Financial District',
      ppmLow: 9000, ppm: 12500, ppmHigh: 17000, delivery: 'ready', launchYear: 2016,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.065, compoundFee: 2.5,
      amenities: ['deck','concierge','fitness','valet','mall_access'],
      tag: 'Luxury living above Miami\'s top retail hub.' },
    { id: 'estates_at_westwood', name: 'The Estates at Westwood', developerId: 'toll', developer: 'Toll', city: 'Austin', loc: 'Westlake Hills Suburb',
      ppmLow: 4000, ppm: 5200, ppmHigh: 6800, delivery: 'ready', launchYear: 2015,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.05, compoundFee: 1.5,
      amenities: ['gated','tennis','pool','schools'],
      tag: 'Exclusive suburban estate homes in Austin tech corridor.' },
    { id: 'porsche_design_tower', name: 'Porsche Design Tower', developerId: 'dezer', developer: 'Dezer', city: 'Miami', loc: 'Sunny Isles Beach',
      ppmLow: 18000, ppm: 25000, ppmHigh: 35000, delivery: 'ready', launchYear: 2017,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.055, compoundFee: 5,
      amenities: ['car_elevator','plunge_pool','oceanfront','spa'],
      tag: 'Oceanfront condo with car elevator to sky garage.' },
    { id: 'wolf_point', name: 'Wolf Point East', developerId: 'hines', developer: 'Hines', city: 'Chicago', loc: 'River North',
      ppmLow: 6000, ppm: 8000, ppmHigh: 11000, delivery: 'ready', launchYear: 2019,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.055, compoundFee: 2.5,
      amenities: ['parks','gyms','pool','club','riverwalk'],
      tag: 'Riverfront luxury tower.' },
    { id: 'the_century', name: 'The Century', developerId: 'related', developer: 'Related', city: 'Los Angeles', loc: 'Century City',
      ppmLow: 15000, ppm: 20000, ppmHigh: 28000, delivery: 'ready', launchYear: 2009,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.05, compoundFee: 4,
      amenities: ['parks','gyms','pool','spa','dining'],
      tag: 'Iconic LA landmark residences by Robert A.M. Stern.' },
    { id: 'the_independent', name: 'The Independent', developerId: 'aspen', developer: 'Aspen', city: 'Austin', loc: 'Downtown Austin',
      ppmLow: 7000, ppm: 9000, ppmHigh: 12000, delivery: 'ready', launchYear: 2019,
      hap: 3, hp: 2, rentalYieldAnnPct: 0.05, compoundFee: 2,
      amenities: ['parks','gyms','pool','club'],
      tag: 'Austin skyline icon, tallest residential tower.' },
    { id: '44_east_ave', name: '44 East Ave', developerId: 'intracorp', developer: 'Intracorp', city: 'Austin', loc: 'Rainey Street',
      ppmLow: 6500, ppm: 8000, ppmHigh: 11000, delivery: 'ready', launchYear: 2020,
      hap: 3, hp: 2, rentalYieldAnnPct: 0.05, compoundFee: 2,
      amenities: ['parks','gyms','pool','club'],
      tag: 'Rainey Street district luxury.' },
    { id: 'spire_seattle', name: 'Spire', developerId: 'laconia', developer: 'Laconia', city: 'Seattle', loc: 'Belltown',
      ppmLow: 7000, ppm: 9000, ppmHigh: 13000, delivery: 'ready', launchYear: 2021,
      hap: 3, hp: 2, rentalYieldAnnPct: 0.052, compoundFee: 2.5,
      amenities: ['security','gyms','pool','club'],
      tag: 'Belltown luxury high-rise.' },
    { id: 'millennium_tower', name: 'Millennium Tower', developerId: 'tishman', developer: 'Tishman Speyer', city: 'San Francisco', loc: 'Financial District',
      ppmLow: 14000, ppm: 18000, ppmHigh: 24000, delivery: 'ready', launchYear: 2009,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.045, compoundFee: 4,
      amenities: ['parks','gyms','pool','concierge'],
      tag: 'Iconic San Francisco skyline residential tower.' },
    { id: 'the_pierce', name: 'The Pierce', developerId: 'toll', developer: 'Toll', city: 'Boston', loc: 'Fenway',
      ppmLow: 11000, ppm: 14000, ppmHigh: 18000, delivery: 'ready', launchYear: 2019,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.05, compoundFee: 3,
      amenities: ['parks','gyms','pool','concierge'],
      tag: 'Boston Fenway luxury high-rise.' },
    { id: 'the_post_oak', name: 'The Post Oak', developerId: 'hines', developer: 'Hines', city: 'Houston', loc: 'Uptown Houston',
      ppmLow: 7000, ppm: 9000, ppmHigh: 13000, delivery: 'ready', launchYear: 2018,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.055, compoundFee: 2.5,
      amenities: ['parks','gyms','pool','spa'],
      tag: 'Uptown Houston luxury tower.' },
    { id: 'optima_camelview', name: 'Optima Camelview Village', developerId: 'toll', developer: 'Optima', city: 'Scottsdale', loc: 'Scottsdale Waterfront',
      ppmLow: 5000, ppm: 6500, ppmHigh: 8500, delivery: 'ready', launchYear: 2008,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.05, compoundFee: 2,
      amenities: ['parks','pool','gyms','desert_garden'],
      tag: 'Desert-modern Scottsdale village.' },
    { id: 'the_atlantic', name: 'The Atlantic', developerId: 'toll', developer: 'Toll', city: 'Atlanta', loc: 'Atlantic Station',
      ppmLow: 6000, ppm: 8000, ppmHigh: 10000, delivery: 'ready', launchYear: 2010,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.052, compoundFee: 2,
      amenities: ['parks','gyms','pool','mall_access'],
      tag: 'Atlantic Station luxury in Midtown Atlanta.' },
    { id: 'the_kare', name: 'The Karé', developerId: 'toll', developer: 'Toll', city: 'Dallas', loc: 'Uptown Dallas',
      ppmLow: 6000, ppm: 7500, ppmHigh: 9500, delivery: 'ready', launchYear: 2022,
      hap: 3, hp: 2, rentalYieldAnnPct: 0.052, compoundFee: 2,
      amenities: ['gyms','pool','concierge','dining'],
      tag: 'New Uptown Dallas luxury residential.' },
    { id: 'the_coloradan', name: 'The Coloradan', developerId: 'toll', developer: 'East West Partners', city: 'Denver', loc: 'LoDo / Union Station',
      ppmLow: 7000, ppm: 9000, ppmHigh: 12000, delivery: 'ready', launchYear: 2019,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.052, compoundFee: 2.5,
      amenities: ['parks','gyms','pool','dining','concierge'],
      tag: 'Denver LoDo luxury above Union Station.' },
    { id: 'echo_brickell', name: 'Echo Brickell', developerId: 'dezer', developer: 'PMG', city: 'Miami', loc: 'Brickell',
      ppmLow: 12000, ppm: 16000, ppmHigh: 22000, delivery: 'ready', launchYear: 2017,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.06, compoundFee: 4,
      amenities: ['oceanfront','gyms','pool','spa'],
      tag: 'Carlos Ott designed Miami tower.' },
    { id: 'aston_martin_residences', name: 'Aston Martin Residences', developerId: 'dezer', developer: 'G&G Business', city: 'Miami', loc: 'Downtown Miami',
      ppmLow: 12000, ppm: 18000, ppmHigh: 25000, delivery: 'ready', launchYear: 2023,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.055, compoundFee: 5,
      amenities: ['oceanfront','spa','gyms','pool','concierge'],
      tag: 'Aston Martin branded luxury Miami tower.' },

    /* 👇 ADD NEW USA COMPOUNDS HERE 👇 */
  ],

  /* ------------------------------------------------------------
     SAUDI ARABIA — 10 compounds
     ------------------------------------------------------------ */
  sau: [
    { id: 'roshn_sedra', name: 'ROSHN Sedra', developerId: 'roshn', developer: 'ROSHN (PIF)', city: 'Riyadh', loc: 'North Riyadh, Near KSU',
      ppmLow: 5200, ppm: 6800, ppmHigh: 8500, delivery: 'ready', launchYear: 2019,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.07, compoundFee: 6,
      amenities: ['pedestrian_walkways','mosques','sports_hubs','saudi_architecture'],
      tag: 'Landmark national mega-community under Vision 2030.' },
    { id: 'diriyah_residences', name: 'Diriyah Gate Residences', developerId: 'diriyah', developer: 'DGDA', city: 'Riyadh', loc: 'Historic Diriyah',
      ppmLow: 12000, ppm: 16500, ppmHigh: 22000, delivery: '2026', launchYear: 2021,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.06, compoundFee: 12,
      amenities: ['najdi_architecture','fine_dining','museums','luxury_hotels'],
      tag: 'Heritage-inspired ultra-luxury at the birthplace of Saudi State.' },
    { id: 'shams_ar_riyadh', name: 'Shams Ar-Riyadh', developerId: 'dar_arkan', developer: 'Dar Al Arkan', city: 'Riyadh', loc: 'King Khalid Road',
      ppmLow: 5800, ppm: 7200, ppmHigh: 9200, delivery: 'ready', launchYear: 2018,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.068, compoundFee: 8,
      amenities: ['elie_saab_interiors','smart_infrastructure','commercial'],
      tag: 'First smart residential city with co-branded designer villas.' },
    { id: 'emaar_riyadh_gate', name: 'Emaar Riyadh Gate', developerId: 'emaar_ksa', developer: 'Emaar KSA', city: 'Riyadh', loc: 'North Riyadh',
      ppmLow: 5500, ppm: 7000, ppmHigh: 9000, delivery: '2026', launchYear: 2023,
      hap: 4, hp: 3, rentalYieldAnnPct: 0.07, compoundFee: 8,
      amenities: ['parks','mall','schools','mosque','security'],
      tag: 'Emaar\'s flagship KSA community.' },
    { id: 'nhc_riyadh_residential', name: 'NHC Residential District', developerId: 'nhc', developer: 'NHC', city: 'Riyadh', loc: 'North Riyadh',
      ppmLow: 4200, ppm: 5200, ppmHigh: 6800, delivery: 'ready', launchYear: 2019,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.07, compoundFee: 5,
      amenities: ['parks','schools','mosque','security'],
      tag: 'Government-backed affordable housing district.' },
    { id: 'jeddah_tower', name: 'Jeddah Tower Residences', developerId: 'dar_arkan', developer: 'Dar Al Arkan', city: 'Jeddah', loc: 'Jeddah Economic City',
      ppmLow: 12000, ppm: 16000, ppmHigh: 22000, delivery: '2027', launchYear: 2014,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.06, compoundFee: 15,
      amenities: ['sea_view','concierge','spa','gyms','pool'],
      tag: 'World\'s tallest tower (1000m) residences.' },
    { id: 'neom_sindalah', name: 'Sindalah Island Villas', developerId: 'roshn', developer: 'NEOM', city: 'NEOM', loc: 'Sindalah Island, Red Sea',
      ppmLow: 25000, ppm: 35000, ppmHigh: 55000, delivery: '2026', launchYear: 2022,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.08, compoundFee: 25,
      amenities: ['private_island','beach','golf','marina','spa'],
      tag: 'NEOM\'s first luxury island destination.' },
    { id: 'qiddiya_residences', name: 'Qiddiya Entertainment City', developerId: 'roshn', developer: 'Qiddiya', city: 'Riyadh', loc: 'Qiddiya City',
      ppmLow: 5000, ppm: 6500, ppmHigh: 8500, delivery: '2027', launchYear: 2023,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.075, compoundFee: 8,
      amenities: ['theme_parks','sports','golf','cultural_hub','hotels'],
      tag: 'Qiddiya Capital of Play.' },
    { id: 'amala_residences', name: 'AMAALA Residences', developerId: 'roshn', developer: 'AMAALA', city: 'AMAALA', loc: 'Red Sea Coast',
      ppmLow: 18000, ppm: 28000, ppmHigh: 45000, delivery: '2028', launchYear: 2022,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.08, compoundFee: 22,
      amenities: ['private_beach','wellness_resort','marina','spa'],
      tag: 'Wellness and arts-focused Red Sea destination.' },
    { id: 'riyadh_kafd', name: 'KAFD Residential', developerId: 'roshn', developer: 'KAFD', city: 'Riyadh', loc: 'King Abdullah Financial District',
      ppmLow: 9000, ppm: 12000, ppmHigh: 16000, delivery: 'ready', launchYear: 2020,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.065, compoundFee: 12,
      amenities: ['financial_center','parks','gyms','pool','concierge'],
      tag: 'Riyadh\'s financial heart residential district.' },

    /* 👇 ADD NEW SAUDI COMPOUNDS HERE 👇 */
  ],

  /* ------------------------------------------------------------
     UAE — 12 compounds
     ------------------------------------------------------------ */
  uae: [
    { id: 'downtown_views', name: 'Downtown Views II', developerId: 'emaar_uae', developer: 'Emaar', city: 'Dubai', loc: 'Downtown Dubai',
      ppmLow: 22000, ppm: 28000, ppmHigh: 36000, delivery: 'ready', launchYear: 2017,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.072, compoundFee: 15,
      amenities: ['burj_khalifa_view','mall_bridge','infinity_pool','gym'],
      tag: 'Luxury walking distance from Dubai Mall.' },
    { id: 'palm_jumeirah_villas', name: 'Palm Jumeirah Frond Villas', developerId: 'nakheel', developer: 'Nakheel', city: 'Dubai', loc: 'Palm Jumeirah',
      ppmLow: 35000, ppm: 52000, ppmHigh: 75000, delivery: 'ready', launchYear: 2007,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.06, compoundFee: 22,
      amenities: ['private_beach','boat_dock','security','gated_frond'],
      tag: 'World-famous man-made palm island villas.' },
    { id: 'emaar_beachfront', name: 'Emaar Beachfront', developerId: 'emaar_uae', developer: 'Emaar', city: 'Dubai', loc: 'Dubai Harbour',
      ppmLow: 18000, ppm: 24000, ppmHigh: 32000, delivery: 'ready', launchYear: 2020,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.065, compoundFee: 14,
      amenities: ['beach','marina','pool','gym','concierge'],
      tag: 'Dubai Harbour beachfront living.' },
    { id: 'damac_hills', name: 'DAMAC Hills', developerId: 'damac', developer: 'DAMAC', city: 'Dubai', loc: 'Dubailand',
      ppmLow: 7000, ppm: 9500, ppmHigh: 13000, delivery: 'ready', launchYear: 2017,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 8,
      amenities: ['golf','parks','pool','gym','schools'],
      tag: 'DAMAC\'s flagship Trump World Golf Club community.' },
    { id: 'saadiyat_island', name: 'Saadiyat Island Residences', developerId: 'aldar', developer: 'Aldar', city: 'Abu Dhabi', loc: 'Saadiyat Island',
      ppmLow: 14000, ppm: 18000, ppmHigh: 24000, delivery: 'ready', launchYear: 2015,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.065, compoundFee: 12,
      amenities: ['beach','museums','golf','schools','concierge'],
      tag: 'Abu Dhabi\'s cultural island with Louvre and Guggenheim.' },
    { id: 'aldar_reem', name: 'Al Reem Island Residences', developerId: 'aldar', developer: 'Aldar', city: 'Abu Dhabi', loc: 'Al Reem Island',
      ppmLow: 10000, ppm: 13000, ppmHigh: 17000, delivery: 'ready', launchYear: 2010,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.07, compoundFee: 10,
      amenities: ['parks','mall','pool','gym','concierge'],
      tag: 'Abu Dhabi\'s business island residential district.' },
    { id: 'sobha_hartland', name: 'Sobha Hartland', developerId: 'sobha', developer: 'Sobha', city: 'Dubai', loc: 'Mohammed Bin Rashid City',
      ppmLow: 12000, ppm: 16000, ppmHigh: 22000, delivery: 'ready', launchYear: 2017,
      hap: 4, hp: 3, rentalYieldAnnPct: 0.07, compoundFee: 12,
      amenities: ['schools','parks','pool','gym','mall'],
      tag: 'Sobha\'s flagship master community.' },
    { id: 'sobha_hartland_ii', name: 'Sobha Hartland II', developerId: 'sobha', developer: 'Sobha', city: 'Dubai', loc: 'MBR City',
      ppmLow: 14000, ppm: 18000, ppmHigh: 24000, delivery: '2026', launchYear: 2022,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.068, compoundFee: 14,
      amenities: ['waterfront','parks','pool','schools','marina'],
      tag: 'Sobha\'s newest waterfront community.' },
    { id: 'damac_lagoons', name: 'DAMAC Lagoons', developerId: 'damac', developer: 'DAMAC', city: 'Dubai', loc: 'Dubailand',
      ppmLow: 8000, ppm: 11000, ppmHigh: 15000, delivery: '2025', launchYear: 2021,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.075, compoundFee: 10,
      amenities: ['lagoons','beach','pool','gym','parks'],
      tag: 'Mediterranean-themed villas with water lagoons.' },
    { id: 'emaar_valley_uae', name: 'Emaar The Valley', developerId: 'emaar_uae', developer: 'Emaar', city: 'Dubai', loc: 'Dubai-Al Ain Road',
      ppmLow: 7000, ppm: 9500, ppmHigh: 13000, delivery: 'ready', launchYear: 2020,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.075, compoundFee: 8,
      amenities: ['parks','pool','gym','schools','retail'],
      tag: 'Emaar\'s valley-side modern community.' },
    { id: 'aldar_yas_acres', name: 'Yas Acres', developerId: 'aldar', developer: 'Aldar', city: 'Abu Dhabi', loc: 'Yas Island',
      ppmLow: 10000, ppm: 13000, ppmHigh: 17000, delivery: 'ready', launchYear: 2018,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.068, compoundFee: 10,
      amenities: ['golf','beach','schools','mall','pool'],
      tag: 'Yas Island golf community.' },
    { id: 'nakheel_jumeirah_park', name: 'Jumeirah Park Villas', developerId: 'nakheel', developer: 'Nakheel', city: 'Dubai', loc: 'Jumeirah Park',
      ppmLow: 11000, ppm: 14000, ppmHigh: 18000, delivery: 'ready', launchYear: 2010,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.07, compoundFee: 9,
      amenities: ['parks','schools','pool','gym','mall'],
      tag: 'Family villas in central Dubai.' },

    /* 👇 ADD NEW UAE COMPOUNDS HERE 👇 */
  ],

  /* ------------------------------------------------------------
     UK — 8 compounds
     ------------------------------------------------------------ */
  uk: [
    { id: 'one_hyde_park', name: 'One Hyde Park', developer: 'Candy & Candy', city: 'London', loc: 'Knightsbridge',
      ppmLow: 55000, ppm: 75000, ppmHigh: 120000, delivery: 'ready', launchYear: 2011,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.025, compoundFee: 8,
      amenities: ['concierge','spa','pool','gym','mandarin_oriental'],
      tag: 'The world\'s most expensive residential address.' },
    { id: 'battersea_power', name: 'Battersea Power Station', developer: 'BPSDC', city: 'London', loc: 'Nine Elms',
      ppmLow: 14000, ppm: 18000, ppmHigh: 25000, delivery: 'ready', launchYear: 2020,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.035, compoundFee: 5,
      amenities: ['parks','shopping','tube','gym','concierge'],
      tag: 'Grade II listed power station converted to luxury living.' },
    { id: 'nine_elms', name: 'Nine Elms Park', developer: 'Berkeley', city: 'London', loc: 'Nine Elms',
      ppmLow: 12000, ppm: 15000, ppmHigh: 20000, delivery: 'ready', launchYear: 2016,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.035, compoundFee: 4.5,
      amenities: ['park','tube','gym','concierge'],
      tag: 'Thames-side park residential.' },
    { id: 'chelsea_barracks', name: 'Chelsea Barracks', developer: 'Qatari Diar', city: 'London', loc: 'Belgravia',
      ppmLow: 40000, ppm: 55000, ppmHigh: 80000, delivery: 'ready', launchYear: 2020,
      hap: 5, hp: 4, rentalYieldAnnPct: 0.025, compoundFee: 7,
      amenities: ['gardens','spa','concierge','gym','private_club'],
      tag: 'Belgravia\'s most exclusive new residential quarter.' },
    { id: 'southbank_place', name: 'Southbank Place', developer: 'Qatari Diar / Canary Wharf', city: 'London', loc: 'South Bank',
      ppmLow: 16000, ppm: 21000, ppmHigh: 28000, delivery: 'ready', launchYear: 2019,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.032, compoundFee: 5.5,
      amenities: ['river_views','gym','pool','concierge','dining'],
      tag: 'South Bank riverside luxury with London Eye views.' },
    { id: 'deansgate_square', name: 'Deansgate Square', developer: 'Renaker', city: 'Manchester', loc: 'Deansgate',
      ppmLow: 4500, ppm: 5400, ppmHigh: 6500, delivery: 'ready', launchYear: 2019,
      hap: 3, hp: 1, rentalYieldAnnPct: 0.05, compoundFee: 3,
      amenities: ['gym','pool','concierge','parks'],
      tag: 'Manchester\'s tallest residential towers.' },
    { id: 'elizabeth_tower', name: 'Elizabeth Tower', developer: 'Renaker', city: 'Manchester', loc: 'Deansgate',
      ppmLow: 5000, ppm: 6000, ppmHigh: 7200, delivery: 'ready', launchYear: 2021,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.048, compoundFee: 3,
      amenities: ['gym','pool','concierge','sky_garden'],
      tag: 'Manchester\'s newest landmark tower.' },
    { id: 'edinburgh_quarter_mile', name: 'Edinburgh Quartermile', developer: 'Gladedale', city: 'Edinburgh', loc: 'Quartermile',
      ppmLow: 5500, ppm: 6800, ppmHigh: 8500, delivery: 'ready', launchYear: 2012,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.04, compoundFee: 2.5,
      amenities: ['parks','gym','concierge'],
      tag: 'Edinburgh\'s most successful new residential quarter.' },

    /* 👇 ADD NEW UK COMPOUNDS HERE 👇 */
  ],

  /* ------------------------------------------------------------
     CANADA — 4 compounds
     ------------------------------------------------------------ */
  can: [
    { id: 'the_one_toronto', name: 'The One', developer: 'Mizrahi', city: 'Toronto', loc: 'Yorkville / Bloor',
      ppmLow: 12000, ppm: 16000, ppmHigh: 22000, delivery: '2025', launchYear: 2017,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.035, compoundFee: 3,
      amenities: ['concierge','gym','pool','spa'],
      tag: 'Canada\'s tallest residential tower in Yorkville.' },
    { id: 'vancouver_house', name: 'Vancouver House', developer: 'Westbank', city: 'Vancouver', loc: 'Beach District',
      ppmLow: 11000, ppm: 14000, ppmHigh: 19000, delivery: 'ready', launchYear: 2020,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.032, compoundFee: 3,
      amenities: ['concierge','gym','pool','ocean_view'],
      tag: 'Bjarke Ingels-designed Vancouver landmark.' },
    { id: 'shangri_la_toronto', name: 'Shangri-La Toronto', developer: 'Westbank', city: 'Toronto', loc: 'University Ave',
      ppmLow: 10000, ppm: 13000, ppmHigh: 17000, delivery: 'ready', launchYear: 2012,
      hap: 5, hp: 3, rentalYieldAnnPct: 0.035, compoundFee: 3.5,
      amenities: ['concierge','spa','pool','gym'],
      tag: 'Shangri-La branded luxury residences.' },
    { id: 'montreal_quartier', name: 'Quartier des Spectacles', developer: 'Various', city: 'Montreal', loc: 'Downtown',
      ppmLow: 6000, ppm: 8000, ppmHigh: 11000, delivery: 'ready', launchYear: 2016,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.04, compoundFee: 2,
      amenities: ['gym','pool','concierge','parks'],
      tag: 'Montreal\'s cultural district living.' },

    /* 👇 ADD NEW CANADIAN COMPOUNDS HERE 👇 */
  ],

  /* ------------------------------------------------------------
     GERMANY — 4 compounds
     ------------------------------------------------------------ */
  deu: [
    { id: 'upper_west_berlin', name: 'Upper West', developer: 'Various', city: 'Berlin', loc: 'Charlottenburg',
      ppmLow: 9000, ppm: 11000, ppmHigh: 14000, delivery: 'ready', launchYear: 2017,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.03, compoundFee: 3,
      amenities: ['gym','pool','concierge','parks'],
      tag: 'Berlin\'s Charlottenburg luxury tower.' },
    { id: 'eden_tower', name: 'Eden Tower', developer: 'Vivion', city: 'Frankfurt', loc: 'Financial District',
      ppmLow: 10000, ppm: 13000, ppmHigh: 17000, delivery: '2024', launchYear: 2021,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.03, compoundFee: 3.5,
      amenities: ['gym','pool','concierge','sky_garden'],
      tag: 'Frankfurt\'s tallest residential skyscraper.' },
    { id: 'bavaria_park', name: 'Bavaria Park Quartier', developer: 'Instone', city: 'Munich', loc: 'Obersendling',
      ppmLow: 11000, ppm: 14000, ppmHigh: 18000, delivery: 'ready', launchYear: 2020,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.028, compoundFee: 3,
      amenities: ['parks','gym','schools','pool'],
      tag: 'Munich sustainable gated park living.' },
    { id: 'hafen_city', name: 'HafenCity', developer: 'Various', city: 'Hamburg', loc: 'HafenCity',
      ppmLow: 9000, ppm: 11500, ppmHigh: 15000, delivery: 'ready', launchYear: 2010,
      hap: 4, hp: 2, rentalYieldAnnPct: 0.03, compoundFee: 2.5,
      amenities: ['waterfront','parks','gym','schools'],
      tag: 'Hamburg\'s waterfront urban redevelopment district.' },

    /* 👇 ADD NEW GERMAN COMPOUNDS HERE 👇 */
  ]
};

/* ============================================================
   3. LOCAL MARKET — ~40 non-compound properties
   ============================================================ */
const LOCAL_MARKET = {
  egy: [
    { id: 'smouha', name: 'Smouha Central Flat', city: 'Alexandria', loc: 'Smouha (Victor Emanuel)', ppm: 42000, hap: 1, hp: 0, tag: 'Established commercial hub, high demand, cash only.' },
    { id: 'gleem', name: 'Gleem Sea-View Apartment', city: 'Alexandria', loc: 'Gleem Corniche', ppm: 58000, hap: 2, hp: 1, tag: 'Unobstructed Mediterranean sea view high-rise.' },
    { id: 'kafr_elabdo', name: 'Kafr El Abdo Heritage Flat', city: 'Alexandria', loc: 'Kafr El Abdo', ppm: 62000, hap: 3, hp: 1, tag: 'Alexandria\'s classical royal villa neighborhood.' },
    { id: 'sidi_gaber', name: 'Sidi Gaber Apartment', city: 'Alexandria', loc: 'Sidi Gaber', ppm: 45000, hap: 2, hp: 0, tag: 'Central Alexandria, close to the train station.' },
    { id: 'sporting', name: 'Sporting Flat', city: 'Alexandria', loc: 'Sporting', ppm: 52000, hap: 2, hp: 1, tag: 'Historic waterfront district.' },
    { id: 'sidi_bishr', name: 'Sidi Bishr Sea Flat', city: 'Alexandria', loc: 'Sidi Bishr', ppm: 48000, hap: 2, hp: 1, tag: 'Popular public beach area, family friendly.' },
    { id: 'miami', name: 'Miami Beach Apartment', city: 'Alexandria', loc: 'Miami', ppm: 52000, hap: 2, hp: 1, tag: 'Alexandria\'s upscale beach neighborhood.' },
    { id: 'agami', name: 'Agami Apartment', city: 'Alexandria', loc: 'Agami', ppm: 32000, hap: 1, hp: 1, tag: 'Affordable beach-front living in West Alexandria.' },
    { id: 'zamalek', name: 'Zamalek Belle Époque Apartment', city: 'Cairo', loc: 'Zamalek Island', ppm: 95000, hap: 3, hp: 1, tag: 'Historic embassy district with river views.' },
    { id: 'garden_city', name: 'Garden City Apartment', city: 'Cairo', loc: 'Garden City', ppm: 88000, hap: 3, hp: 1, tag: 'Embassy-lined streets, quiet, riverside.' },
    { id: 'maadi_degla', name: 'Maadi Degla Low-Rise', city: 'Cairo', loc: 'Maadi Degla', ppm: 52000, hap: 2, hp: 1, tag: 'Expat favorite, leafy green streets.' },
    { id: 'heliopolis', name: 'Korba Heliopolis Flat', city: 'Cairo', loc: 'Heliopolis, Korba', ppm: 60000, hap: 2, hp: 1, tag: 'Baron-style arcades, lively cafes.' },
    { id: 'dokki', name: 'Dokki Central Flat', city: 'Cairo', loc: 'Dokki, Mossaddak', ppm: 46000, hap: 1, hp: 0, tag: 'Central Cairo, near Cairo University.' },
    { id: 'mohandessin', name: 'Mohandessin Apartment', city: 'Cairo', loc: 'Mohandessin', ppm: 65000, hap: 2, hp: 0, tag: 'Upscale central shopping district.' },
    { id: 'nasrcity', name: 'Nasr City 8th District Flat', city: 'Cairo', loc: 'Nasr City', ppm: 36000, hap: 1, hp: 0, tag: 'Family neighborhood, close to highways.' },
    { id: 'nasr_city_10th', name: 'Nasr City 10th District', city: 'Cairo', loc: 'Nasr City 10th', ppm: 38000, hap: 1, hp: 0, tag: 'Newer Nasr City district, popular with families.' },
    { id: 'mokattam', name: 'Mokattam Apartment', city: 'Cairo', loc: 'Mokattam', ppm: 34000, hap: 1, hp: 1, tag: 'Hilltop Cairo area with panoramic views.' },
    { id: 'shubra', name: 'Shubra Apartment', city: 'Cairo', loc: 'Shubra El Kheima', ppm: 22000, hap: 0, hp: 0, tag: 'Northern Cairo working-class district.' },
    { id: 'ain_shams', name: 'Ain Shams Apartment', city: 'Cairo', loc: 'Ain Shams', ppm: 24000, hap: 0, hp: 0, tag: 'Eastern Cairo working-class district.' },
    { id: 'obour', name: 'Obour City Apartment', city: 'Obour', loc: 'Obour', ppm: 20000, hap: 1, hp: 0, tag: 'Affordable commuter city east of Cairo.' },
    { id: 'shorouk', name: 'El Shorouk Apartment', city: 'El Shorouk', loc: 'El Shorouk', ppm: 26000, hap: 1, hp: 0, tag: 'Affordable New Cairo-adjacent neighborhood.' },
    { id: 'badr', name: 'Badr City Apartment', city: 'Badr', loc: 'Badr City', ppm: 18000, hap: 1, hp: 0, tag: 'Far east Cairo new development.' },
    { id: 'sadat', name: 'Sadat City Apartment', city: 'Sadat City', loc: 'Sadat City', ppm: 16000, hap: 1, hp: 0, tag: 'Industrial city on the desert road to Alexandria.' },
    { id: 'tenth_ramadan', name: '10th of Ramadan Flat', city: '10th of Ramadan', loc: '10th of Ramadan', ppm: 15000, hap: 1, hp: 0, tag: 'Industrial city east of Cairo.' },
    { id: 'sixth_october', name: '6th of October Apartment', city: '6th of October', loc: '6th of October', ppm: 28000, hap: 1, hp: 1, tag: 'West Cairo suburb with malls and schools.' },
    { id: 'sheikh_zayed', name: 'Sheikh Zayed Apartment', city: 'Sheikh Zayed', loc: 'Sheikh Zayed', ppm: 55000, hap: 2, hp: 1, tag: 'West Cairo upscale residential area.' },
    { id: 'new_cairo_5th', name: 'New Cairo 5th Settlement', city: 'New Cairo', loc: '5th Settlement', ppm: 60000, hap: 2, hp: 1, tag: 'Largest new residential district in Egypt.' },
    { id: 'rehab_ready', name: 'Al Rehab Ready Flat', city: 'New Cairo', loc: 'Al Rehab', ppm: 45000, hap: 2, hp: 1, tag: 'Mature gated community with established schools.' },
    { id: 'new_capital_downtown', name: 'New Capital Downtown', city: 'New Administrative Capital', loc: 'Downtown', ppm: 45000, hap: 2, hp: 1, tag: 'Central New Capital residential.' },
    { id: 'alex_mandara', name: 'Mandara Apartment', city: 'Alexandria', loc: 'Mandara', ppm: 28000, hap: 1, hp: 0, tag: 'East Alexandria working-class district.' },
    { id: 'borg_el_arab', name: 'Borg El Arab Apartment', city: 'Borg El Arab', loc: 'Borg El Arab', ppm: 18000, hap: 1, hp: 0, tag: 'New city southwest of Alexandria near the airport.' },

    /* 👇 ADD NEW EGYPT LOCAL PROPERTIES HERE 👇 */
  ],
  usa: [
    { id: 'pilsen_chicago', name: 'Pilsen Brick Multi-Family', city: 'Chicago', loc: 'Pilsen', ppm: 4800, hap: 1, hp: 0, tag: 'Historic brick building, walkable arts district.' },
    { id: 'katy_houston', name: 'Katy Family Home', city: 'Houston', loc: 'Katy, Texas', ppm: 2400, hap: 2, hp: 1, tag: 'Spacious suburban home with large backyard.' },
    { id: 'round_rock', name: 'Round Rock Suburban', city: 'Austin', loc: 'Round Rock', ppm: 3400, hap: 2, hp: 1, tag: 'Austin metro suburb with good schools.' },
    { id: 'mesa_phoenix', name: 'Mesa Family Home', city: 'Phoenix', loc: 'Mesa', ppm: 2800, hap: 2, hp: 1, tag: 'Phoenix suburb single-family home.' },
    { id: 'sandy_springs', name: 'Sandy Springs House', city: 'Atlanta', loc: 'Sandy Springs', ppm: 3600, hap: 2, hp: 1, tag: 'Atlanta suburb home.' },
    { id: 'jersey_city', name: 'Jersey City Apartment', city: 'New York', loc: 'Jersey City', ppm: 8000, hap: 2, hp: 0, tag: 'Manhattan-commuter neighborhood.' },
    { id: 'austin_south_congress', name: 'South Congress Apartment', city: 'Austin', loc: 'South Congress', ppm: 7000, hap: 3, hp: 0, tag: 'Austin hip neighborhood.' },
    { id: 'brooklyn_bushwick', name: 'Bushwick Apartment', city: 'New York', loc: 'Bushwick, Brooklyn', ppm: 9000, hap: 2, hp: 0, tag: 'Brooklyn arts district.' },
    { id: 'la_silver_lake', name: 'Silver Lake Bungalow', city: 'Los Angeles', loc: 'Silver Lake', ppm: 12000, hap: 3, hp: 1, tag: 'LA hip hillside neighborhood.' },
    { id: 'denver_cap_hill', name: 'Cap Hill Apartment', city: 'Denver', loc: 'Capitol Hill', ppm: 5500, hap: 2, hp: 0, tag: 'Denver historic district.' },

    /* 👇 ADD NEW USA LOCAL HERE 👇 */
  ],
  sau: [
    { id: 'olaya_riyadh', name: 'Al Olaya Apartment', city: 'Riyadh', loc: 'Al Olaya', ppm: 7800, hap: 2, hp: 1, tag: 'Heart of modern commercial Riyadh.' },
    { id: 'rawdah_jeddah', name: 'Al Rawdah Apartment', city: 'Jeddah', loc: 'Al Rawdah', ppm: 6200, hap: 2, hp: 1, tag: 'Prestigious Jeddah residential.' },
    { id: 'malqa_riyadh', name: 'Al Malqa Apartment', city: 'Riyadh', loc: 'Al Malqa', ppm: 6800, hap: 2, hp: 1, tag: 'North Riyadh upscale area.' },
    { id: 'shati_jeddah', name: 'Al Shati Sea Apartment', city: 'Jeddah', loc: 'Al Shati', ppm: 8200, hap: 3, hp: 1, tag: 'Jeddah Red Sea waterfront.' },
    { id: 'dammam_corniche', name: 'Dammam Corniche Apartment', city: 'Dammam', loc: 'Corniche', ppm: 5000, hap: 2, hp: 1, tag: 'Eastern Province coastal.' },
    { id: 'makkah_central', name: 'Makkah Central Apartment', city: 'Makkah', loc: 'Central Makkah', ppm: 9500, hap: 2, hp: 0, tag: 'Near Haram, high demand for pilgrimage rentals.' },
    { id: 'madinah_central', name: 'Madinah Central Apartment', city: 'Madinah', loc: 'Central Madinah', ppm: 8500, hap: 2, hp: 0, tag: 'Near Prophet\'s Mosque.' },

    /* 👇 ADD NEW SAUDI LOCAL HERE 👇 */
  ],
  uae: [
    { id: 'dubai_marina', name: 'Dubai Marina Apartment', city: 'Dubai', loc: 'Dubai Marina', ppm: 16000, hap: 3, hp: 1, tag: 'Waterfront high-rise district.' },
    { id: 'dubai_jbr', name: 'JBR Beach Apartment', city: 'Dubai', loc: 'Jumeirah Beach Residence', ppm: 20000, hap: 3, hp: 2, tag: 'Beachfront high-rise district.' },
    { id: 'dubai_jlt', name: 'Jumeirah Lake Towers', city: 'Dubai', loc: 'JLT', ppm: 13000, hap: 2, hp: 1, tag: 'Lakefront high-rise district.' },
    { id: 'abudhabi_corniche', name: 'Abu Dhabi Corniche Apartment', city: 'Abu Dhabi', loc: 'Corniche', ppm: 15000, hap: 3, hp: 1, tag: 'Abu Dhabi waterfront.' },
    { id: 'sharjah_al_majaz', name: 'Al Majaz Apartment', city: 'Sharjah', loc: 'Al Majaz', ppm: 9000, hap: 2, hp: 1, tag: 'Sharjah waterfront with lagoons.' },

    /* 👇 ADD NEW UAE LOCAL HERE 👇 */
  ],
  uk: [
    { id: 'london_shoreditch', name: 'Shoreditch Apartment', city: 'London', loc: 'Shoreditch', ppm: 12000, hap: 3, hp: 0, tag: 'East London creative district.' },
    { id: 'london_camden', name: 'Camden Apartment', city: 'London', loc: 'Camden', ppm: 14000, hap: 3, hp: 0, tag: 'North London market district.' },
    { id: 'manchester_northern_quarter', name: 'Northern Quarter Flat', city: 'Manchester', loc: 'Northern Quarter', ppm: 5000, hap: 3, hp: 0, tag: 'Manchester creative district.' },
    { id: 'edinburgh_newtown', name: 'New Town Apartment', city: 'Edinburgh', loc: 'New Town', ppm: 6500, hap: 3, hp: 0, tag: 'Edinburgh UNESCO heritage district.' },

    /* 👇 ADD NEW UK LOCAL HERE 👇 */
  ],
  can: [
    { id: 'toronto_yorkville', name: 'Yorkville Apartment', city: 'Toronto', loc: 'Yorkville', ppm: 14000, hap: 3, hp: 0, tag: 'Toronto luxury shopping district.' },
    { id: 'toronto_liberty_village', name: 'Liberty Village Loft', city: 'Toronto', loc: 'Liberty Village', ppm: 9000, hap: 3, hp: 0, tag: 'Toronto arts and tech district.' },
    { id: 'vancouver_yaletown', name: 'Yaletown Apartment', city: 'Vancouver', loc: 'Yaletown', ppm: 12000, hap: 3, hp: 0, tag: 'Vancouver heritage warehouse district.' },
    { id: 'montreal_plateau', name: 'Plateau Apartment', city: 'Montreal', loc: 'Plateau Mont-Royal', ppm: 6500, hap: 3, hp: 0, tag: 'Montreal boho district.' },

    /* 👇 ADD NEW CANADIAN LOCAL HERE 👇 */
  ],
  deu: [
    { id: 'berlin_kreuzberg', name: 'Kreuzberg Altbau', city: 'Berlin', loc: 'Kreuzberg', ppm: 7500, hap: 3, hp: 0, tag: 'Berlin multicultural district.' },
    { id: 'munich_schwabing', name: 'Schwabing Apartment', city: 'Munich', loc: 'Schwabing', ppm: 12000, hap: 3, hp: 0, tag: 'Munich student and artistic district.' },
    { id: 'frankfurt_sachsenhausen', name: 'Sachsenhausen Apartment', city: 'Frankfurt', loc: 'Sachsenhausen', ppm: 9000, hap: 3, hp: 0, tag: 'Frankfurt riverside district.' },

    /* 👇 ADD NEW GERMAN LOCAL HERE 👇 */
  ]
};

/* ============================================================
   4. NEIGHBORHOODS — rich area data (safety, schools, transport, etc)
   ============================================================ */
const NEIGHBORHOODS = {
  egy: [
    { id: 'zamalek', city: 'Cairo', name: 'Zamalek', pricePerM2: 95000, safety: 9, schools: 9, transport: 6, nightlife: 8, familyFriendly: 7, demographic: 'upper' },
    { id: 'garden_city', city: 'Cairo', name: 'Garden City', pricePerM2: 88000, safety: 9, schools: 8, transport: 6, nightlife: 5, familyFriendly: 8, demographic: 'upper' },
    { id: 'maadi', city: 'Cairo', name: 'Maadi', pricePerM2: 52000, safety: 8, schools: 8, transport: 7, nightlife: 6, familyFriendly: 9, demographic: 'upper-mid' },
    { id: 'heliopolis', city: 'Cairo', name: 'Heliopolis', pricePerM2: 60000, safety: 8, schools: 8, transport: 8, nightlife: 7, familyFriendly: 8, demographic: 'upper-mid' },
    { id: 'nasr_city', city: 'Cairo', name: 'Nasr City', pricePerM2: 36000, safety: 7, schools: 7, transport: 8, nightlife: 7, familyFriendly: 8, demographic: 'middle' },
    { id: 'mohandessin', city: 'Cairo', name: 'Mohandessin', pricePerM2: 65000, safety: 8, schools: 8, transport: 7, nightlife: 9, familyFriendly: 7, demographic: 'upper-mid' },
    { id: 'dokki', city: 'Cairo', name: 'Dokki', pricePerM2: 46000, safety: 7, schools: 7, transport: 8, nightlife: 7, familyFriendly: 7, demographic: 'middle' },
    { id: 'shubra', city: 'Cairo', name: 'Shubra', pricePerM2: 22000, safety: 5, schools: 5, transport: 7, nightlife: 5, familyFriendly: 7, demographic: 'working' },
    { id: 'new_cairo', city: 'Cairo', name: 'New Cairo', pricePerM2: 60000, safety: 9, schools: 10, transport: 6, nightlife: 7, familyFriendly: 9, demographic: 'upper' },
    { id: 'sheikh_zayed', city: 'Cairo', name: 'Sheikh Zayed', pricePerM2: 55000, safety: 9, schools: 9, transport: 6, nightlife: 7, familyFriendly: 9, demographic: 'upper' },
    { id: 'smouha', city: 'Alexandria', name: 'Smouha', pricePerM2: 42000, safety: 7, schools: 8, transport: 8, nightlife: 7, familyFriendly: 8, demographic: 'middle' },
    { id: 'gleem', city: 'Alexandria', name: 'Gleem', pricePerM2: 58000, safety: 8, schools: 8, transport: 7, nightlife: 7, familyFriendly: 8, demographic: 'upper-mid' },
    { id: 'sidi_gaber', city: 'Alexandria', name: 'Sidi Gaber', pricePerM2: 45000, safety: 7, schools: 7, transport: 9, nightlife: 6, familyFriendly: 8, demographic: 'middle' },
    { id: 'miami', city: 'Alexandria', name: 'Miami', pricePerM2: 52000, safety: 8, schools: 7, transport: 6, nightlife: 6, familyFriendly: 9, demographic: 'upper-mid' },
    { id: 'agami', city: 'Alexandria', name: 'Agami', pricePerM2: 32000, safety: 6, schools: 6, transport: 5, nightlife: 5, familyFriendly: 8, demographic: 'middle' },
    { id: 'sidi_bishr', city: 'Alexandria', name: 'Sidi Bishr', pricePerM2: 48000, safety: 7, schools: 6, transport: 7, nightlife: 5, familyFriendly: 8, demographic: 'middle' },
    /* 👇 ADD NEW NEIGHBORHOODS HERE 👇 */
  ],
  usa: [
    { id: 'manhattan_ues', city: 'New York', name: 'Upper East Side', pricePerM2: 22000, safety: 9, schools: 10, transport: 10, nightlife: 7, familyFriendly: 8, demographic: 'upper' },
    { id: 'manhattan_soho', city: 'New York', name: 'SoHo', pricePerM2: 25000, safety: 8, schools: 8, transport: 10, nightlife: 10, familyFriendly: 6, demographic: 'upper' },
    { id: 'miami_brickell', city: 'Miami', name: 'Brickell', pricePerM2: 12500, safety: 8, schools: 7, transport: 8, nightlife: 10, familyFriendly: 7, demographic: 'upper' },
    { id: 'austin_downtown', city: 'Austin', name: 'Downtown', pricePerM2: 8500, safety: 7, schools: 7, transport: 8, nightlife: 10, familyFriendly: 6, demographic: 'upper-mid' },
    { id: 'seattle_capitol_hill', city: 'Seattle', name: 'Capitol Hill', pricePerM2: 9500, safety: 7, schools: 8, transport: 9, nightlife: 9, familyFriendly: 7, demographic: 'upper-mid' },
    /* 👇 ADD NEW USA NEIGHBORHOODS HERE 👇 */
  ],
  sau: [
    { id: 'riyadh_olaya', city: 'Riyadh', name: 'Al Olaya', pricePerM2: 7800, safety: 9, schools: 9, transport: 6, nightlife: 4, familyFriendly: 8, demographic: 'upper' },
    { id: 'riyadh_malqa', city: 'Riyadh', name: 'Al Malqa', pricePerM2: 6800, safety: 9, schools: 9, transport: 6, nightlife: 4, familyFriendly: 9, demographic: 'upper' },
    { id: 'jeddah_shati', city: 'Jeddah', name: 'Al Shati', pricePerM2: 8200, safety: 9, schools: 8, transport: 6, nightlife: 5, familyFriendly: 8, demographic: 'upper' },
    /* 👇 ADD NEW SAUDI NEIGHBORHOODS HERE 👇 */
  ]
};

/* ============================================================
   5. PROPERTY UNITS — 26 types
   ============================================================ */
const PROPERTY_UNITS = [
  { id: 'studio_s', name: 'Small Studio', area: 40, priceMult: 1.15, maintenanceMult: 0.7 },
  { id: 'studio', name: 'Studio Apartment', area: 55, priceMult: 1.10, maintenanceMult: 0.8 },
  { id: 'studio_l', name: 'Large Studio', area: 70, priceMult: 1.05, maintenanceMult: 0.85 },
  { id: 'br1', name: '1-Bedroom Apartment', area: 85, priceMult: 1.05, maintenanceMult: 0.9 },
  { id: 'br1_l', name: '1-Bedroom (Large)', area: 100, priceMult: 1.03, maintenanceMult: 0.95 },
  { id: 'br2', name: '2-Bedroom Apartment', area: 130, priceMult: 1.00, maintenanceMult: 1.0 },
  { id: 'br2_l', name: '2-Bedroom (Large)', area: 150, priceMult: 0.99, maintenanceMult: 1.05 },
  { id: 'br3', name: '3-Bedroom Apartment', area: 180, priceMult: 0.98, maintenanceMult: 1.1 },
  { id: 'br4', name: '4-Bedroom Apartment', area: 210, priceMult: 0.96, maintenanceMult: 1.15 },
  { id: 'br5', name: '5-Bedroom Apartment', area: 250, priceMult: 0.94, maintenanceMult: 1.2 },
  { id: 'chalet_s', name: 'Coastal Chalet (Small)', area: 100, priceMult: 1.15, maintenanceMult: 1.2 },
  { id: 'chalet_m', name: 'Coastal Chalet (Medium)', area: 130, priceMult: 1.20, maintenanceMult: 1.25 },
  { id: 'chalet_l', name: 'Senior Lagoon Chalet', area: 160, priceMult: 1.25, maintenanceMult: 1.3 },
  { id: 'loft', name: 'Industrial Loft', area: 140, priceMult: 1.10, maintenanceMult: 1.0 },
  { id: 'duplex', name: 'Garden / Roof Duplex', area: 240, priceMult: 1.08, maintenanceMult: 1.2 },
  { id: 'triplex', name: 'Triplex Penthouse', area: 320, priceMult: 1.30, maintenanceMult: 1.4 },
  { id: 'penthouse', name: 'Sky Penthouse w/ Pool', area: 280, priceMult: 1.35, maintenanceMult: 1.4 },
  { id: 'ivilla', name: 'iVilla (Mountain View Style)', area: 230, priceMult: 1.12, maintenanceMult: 1.1 },
  { id: 'townhouse_s', name: 'Townhouse (Small)', area: 180, priceMult: 1.12, maintenanceMult: 1.15 },
  { id: 'townhouse', name: 'Townhouse Middle', area: 220, priceMult: 1.15, maintenanceMult: 1.2 },
  { id: 'townhouse_l', name: 'Townhouse (Large)', area: 260, priceMult: 1.18, maintenanceMult: 1.25 },
  { id: 'twinhouse', name: 'Twin House', area: 290, priceMult: 1.20, maintenanceMult: 1.3 },
  { id: 'standalone_s', name: 'Standalone Villa (Medium)', area: 380, priceMult: 1.35, maintenanceMult: 1.5 },
  { id: 'standalone_l', name: 'Grand Luxury Villa', area: 550, priceMult: 1.50, maintenanceMult: 1.8 },
  { id: 'mansion', name: 'Royal Waterfront Mansion', area: 950, priceMult: 1.85, maintenanceMult: 2.5 },
  { id: 'palace', name: 'Palatial Estate', area: 1500, priceMult: 2.20, maintenanceMult: 3.5 },
  /* 👇 ADD NEW UNIT TYPES HERE 👇 */
];

/* ============================================================
   6. PAYMENT PLANS — 15 options
   ============================================================ */
const PAYMENT_PLANS = [
  { id: 'cash', label: 'Upfront Cash (15% Discount)', downPct: 1.00, years: 0, totalMarkup: 0.85 },
  { id: 'cash_10', label: 'Cash w/ 10% Discount', downPct: 1.00, years: 0, totalMarkup: 0.90 },
  { id: 'cash_5', label: 'Cash w/ 5% Discount', downPct: 1.00, years: 0, totalMarkup: 0.95 },
  { id: 'p2_equal', label: '2-Year Equal Installments', downPct: 0.20, years: 2, totalMarkup: 1.00 },
  { id: 'p3_equal', label: '3-Year Equal Installments', downPct: 0.15, years: 3, totalMarkup: 1.00 },
  { id: 'p4_equal', label: '4-Year Developer Plan', downPct: 0.15, years: 4, totalMarkup: 1.02 },
  { id: 'p5_equal', label: '5-Year Developer Plan', downPct: 0.10, years: 5, totalMarkup: 1.05 },
  { id: 'p6_equal', label: '6-Year Developer Plan', downPct: 0.10, years: 6, totalMarkup: 1.12 },
  { id: 'p7_equal', label: '7-Year Developer Plan', downPct: 0.10, years: 7, totalMarkup: 1.18 },
  { id: 'p8_equal', label: '8-Year Flexible Plan (5% Down)', downPct: 0.05, years: 8, totalMarkup: 1.28 },
  { id: 'p9_equal', label: '9-Year Developer Plan', downPct: 0.05, years: 9, totalMarkup: 1.36 },
  { id: 'p10_equal', label: '10-Year Long Plan', downPct: 0.05, years: 10, totalMarkup: 1.45 },
  { id: 'p12_equal', label: '12-Year Extended Plan', downPct: 0.05, years: 12, totalMarkup: 1.60 },
  { id: 'mortgage_bank_15', label: '15-Year Bank Mortgage (16%)', downPct: 0.20, years: 15, totalMarkup: 1.90 },
  { id: 'mortgage_bank', label: '20-Year Bank Mortgage (18%)', downPct: 0.20, years: 20, totalMarkup: 2.10 },
  { id: 'mortgage_bank_25', label: '25-Year Bank Mortgage (20%)', downPct: 0.15, years: 25, totalMarkup: 2.45 },
  /* 👇 ADD NEW PAYMENT PLANS HERE 👇 */
];

/* ============================================================
   7. LANDS — ~35 plots across countries
   ============================================================ */
const LANDS = [
  // Egypt
  { id: 'land_nc_5th', name: '5th Settlement Plot', city: 'New Cairo', country: 'egy', ppm: 32000, minSize: 500, maxSize: 1200, zoning: 'residential_villas', maxBuildFootprintPct: 0.45 },
  { id: 'land_zayed_green', name: 'Green Belt Land Plot', city: 'Sheikh Zayed', country: 'egy', ppm: 24000, minSize: 800, maxSize: 2500, zoning: 'residential_villas', maxBuildFootprintPct: 0.30 },
  { id: 'land_sahel_bay', name: 'Ras El Hekma Second Line Plot', city: 'North Coast', country: 'egy', ppm: 55000, minSize: 600, maxSize: 3000, zoning: 'resort_chalet', maxBuildFootprintPct: 0.35 },
  { id: 'land_sahel_front', name: 'Ras El Hekma First Line (Sea)', city: 'North Coast', country: 'egy', ppm: 95000, minSize: 800, maxSize: 3000, zoning: 'resort_chalet', maxBuildFootprintPct: 0.30 },
  { id: 'land_oct', name: '6th of October Plot', city: '6th of October', country: 'egy', ppm: 18000, minSize: 400, maxSize: 1500, zoning: 'residential', maxBuildFootprintPct: 0.60 },
  { id: 'land_sokhna', name: 'Ain Sokhna Land', city: 'Ain Sokhna', country: 'egy', ppm: 14000, minSize: 500, maxSize: 2000, zoning: 'resort_chalet', maxBuildFootprintPct: 0.40 },
  { id: 'land_ghardaqa', name: 'Hurghada Land', city: 'Hurghada', country: 'egy', ppm: 10000, minSize: 500, maxSize: 2500, zoning: 'residential', maxBuildFootprintPct: 0.45 },
  { id: 'land_marsa_alam', name: 'Marsa Alam Land', city: 'Marsa Alam', country: 'egy', ppm: 6000, minSize: 800, maxSize: 5000, zoning: 'resort_chalet', maxBuildFootprintPct: 0.30 },
  { id: 'land_new_alamein', name: 'New Alamein Plot', city: 'New Alamein', country: 'egy', ppm: 45000, minSize: 500, maxSize: 2500, zoning: 'residential', maxBuildFootprintPct: 0.40 },
  { id: 'land_new_capital', name: 'New Capital Plot (R7)', city: 'New Administrative Capital', country: 'egy', ppm: 22000, minSize: 500, maxSize: 2000, zoning: 'residential', maxBuildFootprintPct: 0.50 },
  { id: 'land_borg_el_arab', name: 'Borg El Arab Land', city: 'Borg El Arab', country: 'egy', ppm: 8000, minSize: 500, maxSize: 2000, zoning: 'residential', maxBuildFootprintPct: 0.60 },
  { id: 'land_sadat', name: 'Sadat City Land', city: 'Sadat City', country: 'egy', ppm: 6000, minSize: 800, maxSize: 5000, zoning: 'residential', maxBuildFootprintPct: 0.55 },
  { id: 'land_obour', name: 'Obour City Land', city: 'Obour', country: 'egy', ppm: 10000, minSize: 500, maxSize: 1500, zoning: 'residential', maxBuildFootprintPct: 0.60 },
  { id: 'land_shorouk', name: 'El Shorouk Land', city: 'El Shorouk', country: 'egy', ppm: 14000, minSize: 500, maxSize: 2000, zoning: 'residential', maxBuildFootprintPct: 0.55 },
  { id: 'land_badr', name: 'Badr City Land', city: 'Badr', country: 'egy', ppm: 8000, minSize: 500, maxSize: 2000, zoning: 'residential', maxBuildFootprintPct: 0.60 },
  { id: 'land_10th_ramadan', name: '10th of Ramadan Land', city: '10th of Ramadan', country: 'egy', ppm: 7000, minSize: 500, maxSize: 2000, zoning: 'residential', maxBuildFootprintPct: 0.60 },
  { id: 'land_agami', name: 'Agami Seafront Land', city: 'Alexandria', country: 'egy', ppm: 38000, minSize: 400, maxSize: 1500, zoning: 'residential', maxBuildFootprintPct: 0.50 },
  { id: 'land_amreya', name: 'Amreya Land', city: 'Alexandria', country: 'egy', ppm: 12000, minSize: 500, maxSize: 3000, zoning: 'residential', maxBuildFootprintPct: 0.55 },

  // USA
  { id: 'land_tx_austin', name: 'Travis County Suburban Land', city: 'Austin', country: 'usa', ppm: 450, minSize: 4000, maxSize: 20000, zoning: 'single_family', maxBuildFootprintPct: 0.50 },
  { id: 'land_tx_rural', name: 'Texas Rural Land', city: 'Texas', country: 'usa', ppm: 250, minSize: 10000, maxSize: 100000, zoning: 'rural', maxBuildFootprintPct: 0.20 },
  { id: 'land_fl_plot', name: 'Florida Residential Plot', city: 'Florida', country: 'usa', ppm: 600, minSize: 3000, maxSize: 20000, zoning: 'residential', maxBuildFootprintPct: 0.45 },
  { id: 'land_co_mountain', name: 'Colorado Mountain Plot', city: 'Colorado', country: 'usa', ppm: 800, minSize: 5000, maxSize: 50000, zoning: 'rural', maxBuildFootprintPct: 0.15 },
  { id: 'land_nc_plot', name: 'North Carolina Plot', city: 'North Carolina', country: 'usa', ppm: 400, minSize: 5000, maxSize: 40000, zoning: 'residential', maxBuildFootprintPct: 0.40 },
  { id: 'land_az_desert', name: 'Arizona Desert Plot', city: 'Arizona', country: 'usa', ppm: 350, minSize: 5000, maxSize: 40000, zoning: 'rural', maxBuildFootprintPct: 0.25 },
  { id: 'land_ca_hills', name: 'California Hills Plot', city: 'California', country: 'usa', ppm: 1500, minSize: 4000, maxSize: 30000, zoning: 'residential', maxBuildFootprintPct: 0.30 },

  // Saudi Arabia
  { id: 'land_sau_riyadh_n', name: 'Al Narjis Plot', city: 'Riyadh', country: 'sau', ppm: 2800, minSize: 400, maxSize: 1000, zoning: 'residential_villas', maxBuildFootprintPct: 0.60 },
  { id: 'land_sau_riyadh_n2', name: 'Al Malqa Plot', city: 'Riyadh', country: 'sau', ppm: 3200, minSize: 400, maxSize: 1200, zoning: 'residential_villas', maxBuildFootprintPct: 0.55 },
  { id: 'land_sau_jeddah', name: 'Jeddah Obhur Plot', city: 'Jeddah', country: 'sau', ppm: 2400, minSize: 400, maxSize: 1500, zoning: 'residential_villas', maxBuildFootprintPct: 0.60 },
  { id: 'land_sau_dammam', name: 'Dammam Plot', city: 'Dammam', country: 'sau', ppm: 1800, minSize: 400, maxSize: 1200, zoning: 'residential', maxBuildFootprintPct: 0.60 },
  { id: 'land_sau_makkah', name: 'Makkah Plot', city: 'Makkah', country: 'sau', ppm: 5000, minSize: 300, maxSize: 1000, zoning: 'residential', maxBuildFootprintPct: 0.60 },
  { id: 'land_sau_madinah', name: 'Madinah Plot', city: 'Madinah', country: 'sau', ppm: 3500, minSize: 400, maxSize: 1200, zoning: 'residential', maxBuildFootprintPct: 0.60 },

  // UAE
  { id: 'land_uae_dubai_hills', name: 'Dubai Hills Plot', city: 'Dubai', country: 'uae', ppm: 8000, minSize: 500, maxSize: 2000, zoning: 'residential', maxBuildFootprintPct: 0.45 },
  { id: 'land_uae_arabian_ranches', name: 'Arabian Ranches Plot', city: 'Dubai', country: 'uae', ppm: 6500, minSize: 500, maxSize: 2000, zoning: 'residential', maxBuildFootprintPct: 0.50 },
  { id: 'land_uae_yas', name: 'Yas Island Plot', city: 'Abu Dhabi', country: 'uae', ppm: 5500, minSize: 500, maxSize: 1500, zoning: 'residential', maxBuildFootprintPct: 0.45 },

  // UK
  { id: 'land_uk_surrey', name: 'Surrey Plot', city: 'Surrey', country: 'uk', ppm: 3000, minSize: 800, maxSize: 5000, zoning: 'residential', maxBuildFootprintPct: 0.35 },
  { id: 'land_uk_kent', name: 'Kent Plot', city: 'Kent', country: 'uk', ppm: 2400, minSize: 800, maxSize: 4000, zoning: 'residential', maxBuildFootprintPct: 0.35 },

  /* 👇 ADD NEW LANDS HERE 👇 */
];

/* ============================================================
   8. RENOVATION OPTIONS — 8 finishing tiers, 25 upgrades
   ============================================================ */
const RENOVATION_OPTIONS = {
  finishingTiers: [
    { id: 'core_shell', name: 'Core & Shell (Red Brick)', costPerM2: { egy: 0, usa: 0, sau: 0, uae: 0, uk: 0, can: 0, deu: 0 }, valueMultiplier: 1.00, moodBonus: 0 },
    { id: 'semi_finished', name: 'Semi-Finished (Plaster + Wiring)', costPerM2: { egy: 2500, usa: 250, sau: 500, uae: 600, uk: 350, can: 300, deu: 400 }, valueMultiplier: 1.05, moodBonus: 1 },
    { id: 'standard', name: 'Standard Commercial Finish', costPerM2: { egy: 4500, usa: 450, sau: 800, uae: 1000, uk: 600, can: 500, deu: 700 }, valueMultiplier: 1.10, moodBonus: 2 },
    { id: 'premium', name: 'Premium Finish', costPerM2: { egy: 7000, usa: 700, sau: 1200, uae: 1500, uk: 900, can: 800, deu: 1100 }, valueMultiplier: 1.18, moodBonus: 4 },
    { id: 'super_lux', name: 'Super Lux (Porcelain + Modern Paint)', costPerM2: { egy: 9000, usa: 900, sau: 1600, uae: 2000, uk: 1200, can: 1000, deu: 1400 }, valueMultiplier: 1.25, moodBonus: 5 },
    { id: 'luxury', name: 'Luxury (European Imports)', costPerM2: { egy: 14000, usa: 1400, sau: 2400, uae: 3000, uk: 1800, can: 1500, deu: 2100 }, valueMultiplier: 1.35, moodBonus: 7 },
    { id: 'ultra_lux', name: 'Ultra Lux (Spanish Marble + Hidden AC)', costPerM2: { egy: 18000, usa: 1800, sau: 3200, uae: 4000, uk: 2400, can: 2000, deu: 2800 }, valueMultiplier: 1.45, moodBonus: 10 },
    { id: 'palatial', name: 'Italian Designer Marble & Gold Leaf', costPerM2: { egy: 35000, usa: 3500, sau: 6000, uae: 7500, uk: 4500, can: 3800, deu: 5200 }, valueMultiplier: 1.75, moodBonus: 18 },
    { id: 'royal', name: 'Royal Palace Grade (Museum Quality)', costPerM2: { egy: 55000, usa: 5500, sau: 9500, uae: 12000, uk: 7000, can: 6000, deu: 8000 }, valueMultiplier: 2.10, moodBonus: 28 },
    /* 👇 ADD NEW FINISHING TIERS HERE 👇 */
  ],

  upgrades: [
    { id: 'central_ac', name: 'Central VRF Air Conditioning', fixedCost: { egy: 250000, usa: 15000, sau: 35000, uae: 40000, uk: 18000, can: 16000, deu: 20000 }, moodBonus: 4, valueAdd: 1.05 },
    { id: 'split_ac', name: 'Split AC Units (All Rooms)', fixedCost: { egy: 90000, usa: 6000, sau: 12000, uae: 14000, uk: 7000, can: 6000, deu: 8000 }, moodBonus: 2, valueAdd: 1.02 },
    { id: 'smart_home', name: 'KNX Full Home Automation', fixedCost: { egy: 180000, usa: 12000, sau: 25000, uae: 30000, uk: 14000, can: 12000, deu: 15000 }, moodBonus: 3, valueAdd: 1.04 },
    { id: 'security_system', name: 'CCTV + Alarm + Smart Lock', fixedCost: { egy: 60000, usa: 4000, sau: 9000, uae: 10000, uk: 5000, can: 4500, deu: 5500 }, moodBonus: 2, valueAdd: 1.03 },
    { id: 'heated_pool', name: 'Overflow Heated Swimming Pool', fixedCost: { egy: 650000, usa: 45000, sau: 85000, uae: 100000, uk: 55000, can: 48000, deu: 60000 }, moodBonus: 8, valueAdd: 1.12, requiresVilla: true },
    { id: 'small_pool', name: 'Small Plunge Pool', fixedCost: { egy: 250000, usa: 18000, sau: 35000, uae: 40000, uk: 22000, can: 19000, deu: 25000 }, moodBonus: 4, valueAdd: 1.06, requiresVilla: true },
    { id: 'landscaping', name: 'Automated Irrigation Garden & Patio', fixedCost: { egy: 120000, usa: 8000, sau: 18000, uae: 22000, uk: 10000, can: 9000, deu: 11000 }, moodBonus: 4, valueAdd: 1.03 },
    { id: 'solar_power', name: 'On-Grid Rooftop Solar', fixedCost: { egy: 300000, usa: 22000, sau: 40000, uae: 45000, uk: 20000, can: 18000, deu: 22000 }, moodBonus: 2, valueAdd: 1.05, reducesBillsPct: 0.70 },
    { id: 'water_heater_solar', name: 'Solar Water Heater', fixedCost: { egy: 25000, usa: 2500, sau: 4000, uae: 4500, uk: 2000, can: 2000, deu: 2500 }, moodBonus: 1, valueAdd: 1.02, reducesBillsPct: 0.15 },
    { id: 'elevator', name: 'Private Elevator', fixedCost: { egy: 400000, usa: 30000, sau: 55000, uae: 60000, uk: 35000, can: 30000, deu: 40000 }, moodBonus: 3, valueAdd: 1.08, requiresVilla: true },
    { id: 'generator', name: 'Backup Generator', fixedCost: { egy: 80000, usa: 5000, sau: 12000, uae: 14000, uk: 6000, can: 5500, deu: 7000 }, moodBonus: 2, valueAdd: 1.02 },
    { id: 'water_tank', name: 'Underground Water Tank', fixedCost: { egy: 35000, usa: 3000, sau: 5000, uae: 6000, uk: 2500, can: 2500, deu: 3500 }, moodBonus: 1, valueAdd: 1.02 },
    { id: 'home_cinema', name: 'Dedicated Home Cinema Room', fixedCost: { egy: 350000, usa: 25000, sau: 45000, uae: 50000, uk: 28000, can: 24000, deu: 30000 }, moodBonus: 5, valueAdd: 1.04 },
    { id: 'sauna', name: 'Private Sauna & Steam Room', fixedCost: { egy: 200000, usa: 15000, sau: 28000, uae: 32000, uk: 16000, can: 14000, deu: 18000 }, moodBonus: 4, valueAdd: 1.04 },
    { id: 'home_gym', name: 'Home Gym Room', fixedCost: { egy: 150000, usa: 10000, sau: 22000, uae: 25000, uk: 12000, can: 10000, deu: 13000 }, moodBonus: 3, valueAdd: 1.03 },
    { id: 'wine_cellar', name: 'Climate-Controlled Wine Cellar', fixedCost: { egy: 180000, usa: 12000, sau: 25000, uae: 28000, uk: 14000, can: 12000, deu: 15000 }, moodBonus: 3, valueAdd: 1.03 },
    { id: 'home_office', name: 'Built-in Home Office Study', fixedCost: { egy: 60000, usa: 4500, sau: 9000, uae: 10000, uk: 5000, can: 4500, deu: 5500 }, moodBonus: 2, valueAdd: 1.03 },
    { id: 'kitchen_island', name: 'Kitchen Island & Premium Cabinets', fixedCost: { egy: 120000, usa: 8000, sau: 18000, uae: 20000, uk: 10000, can: 9000, deu: 11000 }, moodBonus: 3, valueAdd: 1.04 },
    { id: 'marble_floors', name: 'Marble Flooring Throughout', fixedCost: { egy: 250000, usa: 18000, sau: 40000, uae: 45000, uk: 22000, can: 19000, deu: 24000 }, moodBonus: 4, valueAdd: 1.06 },
    { id: 'hardwood_floors', name: 'Hardwood Flooring Throughout', fixedCost: { egy: 180000, usa: 12000, sau: 28000, uae: 32000, uk: 14000, can: 12000, deu: 16000 }, moodBonus: 3, valueAdd: 1.04 },
    { id: 'roof_garden', name: 'Rooftop Garden & Terrace', fixedCost: { egy: 90000, usa: 6500, sau: 14000, uae: 16000, uk: 8000, can: 7000, deu: 8500 }, moodBonus: 3, valueAdd: 1.03 },
    { id: 'basement_finished', name: 'Finished Basement / Family Room', fixedCost: { egy: 200000, usa: 20000, sau: 40000, uae: 45000, uk: 25000, can: 22000, deu: 28000 }, moodBonus: 3, valueAdd: 1.06, requiresVilla: true },
    { id: 'attic_finished', name: 'Finished Attic / Loft', fixedCost: { egy: 150000, usa: 12000, sau: 28000, uae: 30000, uk: 15000, can: 13000, deu: 16000 }, moodBonus: 2, valueAdd: 1.04 },
    { id: 'guest_house', name: 'Guest House / Granny Flat', fixedCost: { egy: 500000, usa: 40000, sau: 80000, uae: 90000, uk: 45000, can: 40000, deu: 50000 }, moodBonus: 4, valueAdd: 1.10, requiresVilla: true },
    { id: 'fully_furnished', name: 'Fully Furnished Package', fixedCost: { egy: 400000, usa: 35000, sau: 65000, uae: 75000, uk: 40000, can: 35000, deu: 45000 }, moodBonus: 6, valueAdd: 1.08 }
  ]
};

/* ============================================================
   9. FURNITURE CATALOG — by room and tier
   ============================================================ */
const FURNITURE_CATALOG = {
  living: {
    label: 'Living Room',
    tiers: [
      { id: 'basic', name: 'Basic Set', cost: { egy: 25000, usa: 1500, sau: 4000, uae: 5000, uk: 1800, can: 1600, deu: 2000 }, moodBonus: 2, items: ['Fabric sofa', 'Coffee table', 'TV stand', 'Rug'] },
      { id: 'mid', name: 'Mid-Range Set', cost: { egy: 65000, usa: 4500, sau: 12000, uae: 14000, uk: 5000, can: 4500, deu: 5500 }, moodBonus: 4, items: ['Leather sofa', 'Marble coffee table', 'Modern TV unit', 'Wool rug', 'Side tables'] },
      { id: 'premium', name: 'Premium Set', cost: { egy: 180000, usa: 12000, sau: 32000, uae: 38000, uk: 14000, can: 12000, deu: 15000 }, moodBonus: 7, items: ['Italian leather sofa', 'Designer coffee table', 'Designer TV unit', 'Persian rug', 'Accent chairs'] },
      { id: 'luxury', name: 'Designer Luxury', cost: { egy: 500000, usa: 35000, sau: 90000, uae: 105000, uk: 40000, can: 35000, deu: 45000 }, moodBonus: 12, items: ['Minotti / B&B Italia sofa', 'Marble and gold table', 'Custom media wall', 'Silk Persian rug', 'Designer accent chairs'] }
    ]
  },
  bedroom: {
    label: 'Master Bedroom',
    tiers: [
      { id: 'basic', name: 'Basic Set', cost: { egy: 18000, usa: 1200, sau: 3000, uae: 3500, uk: 1400, can: 1200, deu: 1500 }, moodBonus: 1, items: ['Queen bed', 'Basic wardrobe', 'Nightstands', 'Dresser'] },
      { id: 'mid', name: 'Mid-Range Set', cost: { egy: 55000, usa: 4000, sau: 10000, uae: 12000, uk: 4500, can: 4000, deu: 5000 }, moodBonus: 3, items: ['King bed w/ memory foam', 'Sliding wardrobe', 'Bedside tables', 'Dresser + mirror', 'Bench'] },
      { id: 'premium', name: 'Premium Set', cost: { egy: 150000, usa: 10000, sau: 28000, uae: 32000, uk: 12000, can: 10000, deu: 13000 }, moodBonus: 5, items: ['Italian king bed', 'Walk-in closet', 'Designer nightstands', 'Vanity table', 'Seating area'] },
      { id: 'luxury', name: 'Luxury Suite', cost: { egy: 400000, usa: 28000, sau: 75000, uae: 85000, uk: 32000, can: 28000, deu: 36000 }, moodBonus: 9, items: ['Frette bedding', 'Custom walk-in closet', 'Marble vanity', 'Private lounge area', 'Smart lighting'] }
    ]
  },
  dining: {
    label: 'Dining Room',
    tiers: [
      { id: 'basic', name: 'Basic Set', cost: { egy: 15000, usa: 1000, sau: 2500, uae: 3000, uk: 1200, can: 1000, deu: 1300 }, moodBonus: 1, items: ['4-seat table', 'Basic chairs'] },
      { id: 'mid', name: 'Mid-Range Set', cost: { egy: 45000, usa: 3500, sau: 8500, uae: 10000, uk: 3800, can: 3500, deu: 4200 }, moodBonus: 3, items: ['6-seat wooden table', 'Upholstered chairs', 'Sideboard'] },
      { id: 'premium', name: 'Premium Set', cost: { egy: 130000, usa: 9000, sau: 24000, uae: 28000, uk: 10000, can: 9000, deu: 11000 }, moodBonus: 5, items: ['8-seat marble table', 'Italian chairs', 'Buffet + display cabinet'] },
      { id: 'luxury', name: 'Formal Dining Suite', cost: { egy: 350000, usa: 24000, sau: 65000, uae: 75000, uk: 28000, can: 24000, deu: 30000 }, moodBonus: 8, items: ['12-seat custom table', 'Designer chairs', 'Crystal chandelier', 'China cabinet', 'Silver service'] }
    ]
  },
  kitchen: {
    label: 'Kitchen',
    tiers: [
      { id: 'basic', name: 'Basic Kitchen', cost: { egy: 60000, usa: 5000, sau: 12000, uae: 14000, uk: 5500, can: 5000, deu: 6000 }, moodBonus: 2, items: ['Stock cabinets', 'Laminate counters', 'Basic sink'] },
      { id: 'mid', name: 'Mid-Range Kitchen', cost: { egy: 150000, usa: 12000, sau: 32000, uae: 38000, uk: 14000, can: 12000, deu: 15000 }, moodBonus: 4, items: ['Semi-custom cabinets', 'Granite counters', 'Stainless steel appliances'] },
      { id: 'premium', name: 'Premium Kitchen', cost: { egy: 350000, usa: 25000, sau: 68000, uae: 78000, uk: 30000, can: 25000, deu: 32000 }, moodBonus: 7, items: ['Custom wood cabinets', 'Quartz counters', 'Premium appliances', 'Island + bar seating'] },
      { id: 'luxury', name: 'Designer Kitchen', cost: { egy: 850000, usa: 60000, sau: 160000, uae: 185000, uk: 70000, can: 60000, deu: 75000 }, moodBonus: 11, items: ['Bulthaup / Poggenpohl', 'Marble counters', 'Gaggenau appliances', 'Integrated smart fridge', 'Butler pantry'] }
    ]
  },
  kids: {
    label: "Kids' Room",
    tiers: [
      { id: 'basic', name: 'Basic', cost: { egy: 12000, usa: 800, sau: 2000, uae: 2500, uk: 1000, can: 900, deu: 1100 }, moodBonus: 1, items: ['Single bed', 'Small wardrobe', 'Study desk'] },
      { id: 'mid', name: 'Mid', cost: { egy: 35000, usa: 2500, sau: 6000, uae: 7500, uk: 3000, can: 2500, deu: 3200 }, moodBonus: 3, items: ['Bunk or double bed', 'Wardrobe', 'Study desk + chair', 'Toy storage'] },
      { id: 'premium', name: 'Premium', cost: { egy: 90000, usa: 7000, sau: 18000, uae: 22000, uk: 8000, can: 7000, deu: 9000 }, moodBonus: 5, items: ['Custom bed', 'Full wardrobe', 'Ergonomic study setup', 'Play area', 'Smart lighting'] },
      { id: 'luxury', name: 'Luxury', cost: { egy: 220000, usa: 16000, sau: 42000, uae: 50000, uk: 18000, can: 16000, deu: 22000 }, moodBonus: 7, items: ['Theme room', 'Custom furniture', 'Smart entertainment', 'Built-in study', 'Ensuite bath'] }
    ]
  },
  office: {
    label: 'Home Office',
    tiers: [
      { id: 'basic', name: 'Basic', cost: { egy: 10000, usa: 700, sau: 1800, uae: 2000, uk: 900, can: 800, deu: 1000 }, moodBonus: 1, items: ['Desk', 'Chair', 'Shelving'] },
      { id: 'mid', name: 'Mid-Range', cost: { egy: 35000, usa: 2500, sau: 6000, uae: 7000, uk: 3000, can: 2500, deu: 3200 }, moodBonus: 3, items: ['Ergonomic desk', 'Herman Miller chair', 'Bookcase', 'Filing system'] },
      { id: 'premium', name: 'Premium', cost: { egy: 100000, usa: 8000, sau: 20000, uae: 24000, uk: 10000, can: 8000, deu: 11000 }, moodBonus: 5, items: ['Executive desk', 'Designer chair', 'Custom shelving', 'Wine fridge', 'Smart lighting'] },
      { id: 'luxury', name: 'Executive Suite', cost: { egy: 250000, usa: 18000, sau: 45000, uae: 55000, uk: 22000, can: 18000, deu: 24000 }, moodBonus: 8, items: ['Bespoke desk', 'Full leather seating', 'Bookcase wall', 'Bar', 'Private balcony'] }
    ]
  },
  garden: {
    label: 'Garden & Outdoor',
    tiers: [
      { id: 'basic', name: 'Basic', cost: { egy: 15000, usa: 1000, sau: 2500, uae: 3000, uk: 1000, can: 900, deu: 1100 }, moodBonus: 1, items: ['Basic furniture set', 'Plants'] },
      { id: 'mid', name: 'Mid-Range', cost: { egy: 50000, usa: 3500, sau: 9000, uae: 10000, uk: 3500, can: 3500, deu: 4000 }, moodBonus: 3, items: ['Teak outdoor set', 'Umbrella', 'BBQ grill', 'Landscaping'] },
      { id: 'premium', name: 'Premium', cost: { egy: 150000, usa: 10000, sau: 28000, uae: 32000, uk: 11000, can: 10000, deu: 12000 }, moodBonus: 5, items: ['Italian outdoor furniture', 'Pergola', 'Built-in BBQ', 'Garden lighting'] },
      { id: 'luxury', name: 'Luxury Resort', cost: { egy: 400000, usa: 28000, sau: 72000, uae: 85000, uk: 32000, can: 28000, deu: 35000 }, moodBonus: 8, items: ['Designer outdoor lounge', 'Full pergola', 'Fire pit', 'Outdoor kitchen', 'Poolside furniture'] }
    ]
  }
};

/* ============================================================
   10. APPLIANCES CATALOG — by type and tier
   ============================================================ */
const APPLIANCES_CATALOG = {
  fridge: {
    label: 'Refrigerator',
    tiers: [
      { id: 'basic', name: 'Basic Fridge-Freezer', cost: { egy: 25000, usa: 800, sau: 2000, uae: 2500, uk: 700, can: 900, deu: 800 }, life: 10 },
      { id: 'mid', name: 'Mid-Range Fridge', cost: { egy: 60000, usa: 2000, sau: 5000, uae: 6000, uk: 1800, can: 2200, deu: 2000 }, life: 12 },
      { id: 'premium', name: 'French Door Fridge', cost: { egy: 150000, usa: 5000, sau: 12000, uae: 14000, uk: 4500, can: 5500, deu: 5000 }, life: 15 },
      { id: 'luxury', name: 'Smart Designer Fridge', cost: { egy: 350000, usa: 12000, sau: 28000, uae: 32000, uk: 10000, can: 13000, deu: 11000 }, life: 18 }
    ]
  },
  washer: {
    label: 'Washing Machine',
    tiers: [
      { id: 'basic', name: 'Basic Top-Load', cost: { egy: 12000, usa: 500, sau: 1200, uae: 1400, uk: 400, can: 500, deu: 450 }, life: 8 },
      { id: 'mid', name: 'Front-Load Washer', cost: { egy: 30000, usa: 1200, sau: 3000, uae: 3500, uk: 1000, can: 1200, deu: 1000 }, life: 10 },
      { id: 'premium', name: 'Premium Washer-Dryer', cost: { egy: 80000, usa: 2800, sau: 7000, uae: 8500, uk: 2500, can: 3000, deu: 2500 }, life: 12 },
      { id: 'luxury', name: 'Miele Smart Washer', cost: { egy: 180000, usa: 6000, sau: 14000, uae: 18000, uk: 5000, can: 6500, deu: 5500 }, life: 15 }
    ]
  },
  dishwasher: {
    label: 'Dishwasher',
    tiers: [
      { id: 'basic', name: 'Basic Dishwasher', cost: { egy: 15000, usa: 600, sau: 1400, uae: 1700, uk: 500, can: 600, deu: 500 }, life: 8 },
      { id: 'mid', name: 'Mid-Range', cost: { egy: 35000, usa: 1200, sau: 3000, uae: 3500, uk: 1000, can: 1200, deu: 1000 }, life: 10 },
      { id: 'premium', name: 'Premium Quiet', cost: { egy: 90000, usa: 2800, sau: 7000, uae: 8500, uk: 2500, can: 3000, deu: 2500 }, life: 12 },
      { id: 'luxury', name: 'Miele Smart Dishwasher', cost: { egy: 180000, usa: 6500, sau: 15000, uae: 18000, uk: 5500, can: 6500, deu: 6000 }, life: 15 }
    ]
  },
  ac: {
    label: 'Air Conditioner',
    tiers: [
      { id: 'basic', name: 'Window / Basic Split', cost: { egy: 25000, usa: 800, sau: 1500, uae: 1800, uk: 1200, can: 1500, deu: 1400 }, life: 8 },
      { id: 'mid', name: 'Inverter Split AC', cost: { egy: 40000, usa: 1500, sau: 3000, uae: 3500, uk: 2200, can: 2800, deu: 2500 }, life: 10 },
      { id: 'premium', name: 'Premium Inverter Multi', cost: { egy: 90000, usa: 4000, sau: 8000, uae: 9500, uk: 5500, can: 6500, deu: 6000 }, life: 12 },
      { id: 'luxury', name: 'VRF Central AC', cost: { egy: 250000, usa: 15000, sau: 35000, uae: 40000, uk: 18000, can: 16000, deu: 20000 }, life: 15 }
    ]
  },
  oven: {
    label: 'Oven / Stove',
    tiers: [
      { id: 'basic', name: 'Basic Oven', cost: { egy: 8000, usa: 500, sau: 1000, uae: 1200, uk: 400, can: 500, deu: 450 }, life: 10 },
      { id: 'mid', name: 'Built-In Oven', cost: { egy: 25000, usa: 1200, sau: 3000, uae: 3500, uk: 1000, can: 1200, deu: 1000 }, life: 12 },
      { id: 'premium', name: 'Bosch / Siemens', cost: { egy: 60000, usa: 3000, sau: 7000, uae: 8000, uk: 2500, can: 3000, deu: 2500 }, life: 15 },
      { id: 'luxury', name: 'Gaggenau / Wolf Range', cost: { egy: 180000, usa: 8000, sau: 18000, uae: 22000, uk: 7000, can: 8500, deu: 7500 }, life: 20 }
    ]
  },
  microwave: {
    label: 'Microwave',
    tiers: [
      { id: 'basic', name: 'Basic Microwave', cost: { egy: 3000, usa: 200, sau: 400, uae: 500, uk: 150, can: 180, deu: 170 }, life: 8 },
      { id: 'mid', name: 'Convection Microwave', cost: { egy: 8000, usa: 500, sau: 1000, uae: 1200, uk: 400, can: 500, deu: 450 }, life: 10 },
      { id: 'premium', name: 'Premium Combo', cost: { egy: 20000, usa: 1200, sau: 2800, uae: 3200, uk: 1000, can: 1200, deu: 1100 }, life: 12 },
      { id: 'luxury', name: 'Miele Built-In Combo', cost: { egy: 50000, usa: 3000, sau: 7000, uae: 8500, uk: 2500, can: 3000, deu: 2600 }, life: 15 }
    ]
  },
  vacuum: {
    label: 'Vacuum Cleaner',
    tiers: [
      { id: 'basic', name: 'Basic Upright', cost: { egy: 5000, usa: 200, sau: 600, uae: 700, uk: 150, can: 180, deu: 170 }, life: 5 },
      { id: 'mid', name: 'Cordless Vacuum', cost: { egy: 15000, usa: 500, sau: 1500, uae: 1800, uk: 400, can: 500, deu: 450 }, life: 6 },
      { id: 'premium', name: 'Dyson V15', cost: { egy: 45000, usa: 800, sau: 3000, uae: 3500, uk: 600, can: 700, deu: 650 }, life: 8 },
      { id: 'luxury', name: 'Robot Vacuum + Mop', cost: { egy: 60000, usa: 1500, sau: 4500, uae: 5000, uk: 1000, can: 1200, deu: 1100 }, life: 6 }
    ]
  }
};

/* ============================================================
   11. HOUSEHOLD STAFF — detailed catalog
   ============================================================ */
const HOUSEHOLD_STAFF = {
  maid: {
    label: 'Maid',
    variants: [
      { id: 'maid_part', name: 'Maid (part-time, twice a week)', cost: { egy: 4000, usa: 800, sau: 2500, uae: 3000, uk: 700, can: 700, deu: 800 }, hours: '8h/week', type: 'individual' },
      { id: 'maid_full', name: 'Maid (full-time, live-out)', cost: { egy: 8000, usa: 2000, sau: 4000, uae: 4500, uk: 1800, can: 1800, deu: 2000 }, hours: '40h/week', type: 'individual' },
      { id: 'maid_live_in', name: 'Maid (live-in)', cost: { egy: 12000, usa: 2800, sau: 5000, uae: 5500, uk: 2500, can: 2500, deu: 2800 }, hours: 'Full-time', type: 'individual', requiresRoom: true },
      { id: 'maid_agency', name: 'Maid (agency, vetted)', cost: { egy: 14000, usa: 3200, sau: 5500, uae: 6000, uk: 2800, can: 2800, deu: 3200 }, hours: 'Full-time', type: 'agency' }
    ]
  },
  nanny: {
    label: 'Nanny',
    variants: [
      { id: 'nanny_part', name: 'Nanny (part-time)', cost: { egy: 6000, usa: 1200, sau: 3500, uae: 4000, uk: 1000, can: 1200, deu: 1200 }, hours: '20h/week', type: 'individual', requiresChildren: true },
      { id: 'nanny_full', name: 'Nanny (full-time, live-out)', cost: { egy: 12000, usa: 2800, sau: 5000, uae: 5500, uk: 2400, can: 2400, deu: 2600 }, hours: 'Full-time', type: 'individual', requiresChildren: true },
      { id: 'nanny_live_in', name: 'Nanny (live-in)', cost: { egy: 16000, usa: 3500, sau: 6000, uae: 6500, uk: 3000, can: 3000, deu: 3200 }, hours: 'Full-time', type: 'individual', requiresRoom: true, requiresChildren: true },
      { id: 'nanny_agency', name: 'Nanny (agency)', cost: { egy: 18000, usa: 4000, sau: 7000, uae: 7500, uk: 3500, can: 3500, deu: 4000 }, hours: 'Full-time', type: 'agency', requiresChildren: true }
    ]
  },
  driver: {
    label: 'Driver',
    variants: [
      { id: 'driver_part', name: 'Driver (part-time)', cost: { egy: 5000, usa: 1200, sau: 3000, uae: 3500, uk: 1000, can: 1000, deu: 1200 }, hours: '20h/week', type: 'individual' },
      { id: 'driver_full', name: 'Driver (full-time)', cost: { egy: 8000, usa: 2500, sau: 5000, uae: 5500, uk: 2000, can: 2000, deu: 2400 }, hours: 'Full-time', type: 'individual' },
      { id: 'driver_chauffeur', name: 'Chauffeur (executive)', cost: { egy: 14000, usa: 3500, sau: 7000, uae: 8000, uk: 3000, can: 3000, deu: 3500 }, hours: 'Full-time', type: 'agency' }
    ]
  },
  cook: {
    label: 'Cook / Chef',
    variants: [
      { id: 'cook_part', name: 'Cook (part-time)', cost: { egy: 6000, usa: 1500, sau: 3500, uae: 4000, uk: 1200, can: 1200, deu: 1400 }, hours: '25h/week', type: 'individual' },
      { id: 'cook_full', name: 'Cook (full-time)', cost: { egy: 10000, usa: 2800, sau: 5000, uae: 6000, uk: 2400, can: 2400, deu: 2800 }, hours: 'Full-time', type: 'individual' },
      { id: 'chef_private', name: 'Private Chef', cost: { egy: 25000, usa: 5000, sau: 12000, uae: 14000, uk: 4500, can: 4500, deu: 5000 }, hours: 'Full-time', type: 'agency' }
    ]
  },
  gardener: {
    label: 'Gardener',
    variants: [
      { id: 'gardener_part', name: 'Gardener (weekly)', cost: { egy: 3000, usa: 500, sau: 1800, uae: 2000, uk: 400, can: 400, deu: 500 }, hours: '8h/week', type: 'individual', requiresGarden: true },
      { id: 'gardener_full', name: 'Gardener (full-time)', cost: { egy: 6000, usa: 2000, sau: 3500, uae: 4000, uk: 1600, can: 1600, deu: 1800 }, hours: 'Full-time', type: 'individual', requiresGarden: true }
    ]
  },
  security: {
    label: 'Security Guard (Bawab)',
    variants: [
      { id: 'bawab', name: 'Bawab (traditional)', cost: { egy: 4500, usa: 2000, sau: 3000, uae: 3500, uk: 1800, can: 1800, deu: 2000 }, hours: 'Full-time', type: 'individual' },
      { id: 'security_pro', name: 'Professional Security', cost: { egy: 12000, usa: 3000, sau: 5000, uae: 6000, uk: 2500, can: 2500, deu: 2800 }, hours: 'Full-time', type: 'agency' }
    ]
  },
  nurse: {
    label: 'Nurse / Caregiver',
    variants: [
      { id: 'nurse_part', name: 'Nurse (part-time)', cost: { egy: 6000, usa: 1500, sau: 3500, uae: 4000, uk: 1200, can: 1200, deu: 1400 }, hours: '20h/week', type: 'agency' },
      { id: 'nurse_full', name: 'Nurse (full-time)', cost: { egy: 12000, usa: 3500, sau: 6000, uae: 7000, uk: 3000, can: 3000, deu: 3500 }, hours: 'Full-time', type: 'agency' },
      { id: 'nurse_live_in', name: 'Nurse (live-in)', cost: { egy: 16000, usa: 4500, sau: 8000, uae: 9000, uk: 4000, can: 4000, deu: 4500 }, hours: 'Full-time', type: 'agency', requiresRoom: true }
    ]
  },
  tutor: {
    label: 'Private Tutor',
    variants: [
      { id: 'tutor_school', name: 'School Tutor', cost: { egy: 3000, usa: 400, sau: 1200, uae: 1500, uk: 350, can: 350, deu: 400 }, hours: '4h/week', type: 'individual', requiresChildren: true },
      { id: 'tutor_exam', name: 'Exam Prep Tutor', cost: { egy: 6000, usa: 800, sau: 2400, uae: 2800, uk: 700, can: 700, deu: 800 }, hours: '6h/week', type: 'individual', requiresChildren: true },
      { id: 'tutor_elite', name: 'Elite Tutor (Ivy League prep)', cost: { egy: 20000, usa: 3000, sau: 7000, uae: 8000, uk: 2500, can: 2500, deu: 2800 }, hours: '8h/week', type: 'agency', requiresChildren: true }
    ]
  }
};

/* ============================================================
   12. MORTGAGE PRODUCTS — per country
   ============================================================ */
const MORTGAGE_PRODUCTS = {
  egy: [
    { id: 'nbe_mortgage', bank: 'National Bank of Egypt', rate: 0.19, maxTerm: 20, maxLTV: 0.80, minIncome: 15000, fee: 0.02 },
    { id: 'cib_mortgage', bank: 'CIB', rate: 0.18, maxTerm: 20, maxLTV: 0.80, minIncome: 20000, fee: 0.015 },
    { id: 'misr_mortgage', bank: 'Banque Misr', rate: 0.20, maxTerm: 15, maxLTV: 0.75, minIncome: 12000, fee: 0.025 }
  ],
  usa: [
    { id: 'chase_30yr', bank: 'Chase', rate: 0.0675, maxTerm: 30, maxLTV: 0.95, minIncome: 40000, fee: 0.01 },
    { id: 'bofa_30yr', bank: 'Bank of America', rate: 0.069, maxTerm: 30, maxLTV: 0.95, minIncome: 40000, fee: 0.012 },
    { id: 'wells_15yr', bank: 'Wells Fargo', rate: 0.0615, maxTerm: 15, maxLTV: 0.95, minIncome: 40000, fee: 0.01 }
  ],
  sau: [
    { id: 'snb_mortgage', bank: 'Saudi National Bank', rate: 0.04, maxTerm: 25, maxLTV: 0.85, minIncome: 10000, fee: 0.005 },
    { id: 'rajhi_mortgage', bank: 'Al Rajhi Bank', rate: 0.042, maxTerm: 25, maxLTV: 0.85, minIncome: 8000, fee: 0.005 }
  ],
  uae: [
    { id: 'emirates_mortgage', bank: 'Emirates NBD', rate: 0.0425, maxTerm: 25, maxLTV: 0.80, minIncome: 15000, fee: 0.01 },
    { id: 'fab_mortgage', bank: 'First Abu Dhabi Bank', rate: 0.04, maxTerm: 25, maxLTV: 0.80, minIncome: 15000, fee: 0.01 }
  ],
  uk: [
    { id: 'hsbc_uk', bank: 'HSBC UK', rate: 0.048, maxTerm: 30, maxLTV: 0.90, minIncome: 25000, fee: 0.005 },
    { id: 'barclays_uk', bank: 'Barclays', rate: 0.05, maxTerm: 30, maxLTV: 0.90, minIncome: 25000, fee: 0.005 }
  ]
};

/* ============================================================
   13. HOME INSURANCE PRODUCTS — per country
   ============================================================ */
const HOME_INSURANCE_PRODUCTS = {
  egy: [
    { id: 'misr_insurance', name: 'Misr Insurance', annualRate: 0.0025, maxCoverage: 5000000, deductible: 0.01 },
    { id: 'allianz_egy', name: 'Allianz Egypt', annualRate: 0.003, maxCoverage: 10000000, deductible: 0.008 }
  ],
  usa: [
    { id: 'allstate', name: 'Allstate', annualRate: 0.005, maxCoverage: 2000000, deductible: 0.01 },
    { id: 'state_farm', name: 'State Farm', annualRate: 0.0045, maxCoverage: 2000000, deductible: 0.01 }
  ],
  sau: [
    { id: 'bupa_home', name: 'Bupa Arabia', annualRate: 0.002, maxCoverage: 3000000, deductible: 0.01 },
    { id: 'tawuniya', name: 'Tawuniya', annualRate: 0.0022, maxCoverage: 3000000, deductible: 0.01 }
  ],
  uae: [
    { id: 'axa_uae', name: 'AXA UAE', annualRate: 0.0025, maxCoverage: 5000000, deductible: 0.01 },
    { id: 'oman_insurance', name: 'Oman Insurance', annualRate: 0.0023, maxCoverage: 5000000, deductible: 0.01 }
  ],
  uk: [
    { id: 'aviva', name: 'Aviva', annualRate: 0.0015, maxCoverage: 1000000, deductible: 0.015 },
    { id: 'direct_line', name: 'Direct Line', annualRate: 0.0016, maxCoverage: 1000000, deductible: 0.015 }
  ]
};

/* ============================================================
   14. PROPERTY TAX RATES — per country
   ============================================================ */
const PROPERTY_TAX_RATES = {
  egy: { rate: 0.10, appliesTo: 'rental', note: '10% of net rental value after 30% deduction' },
  usa: { rate: 0.012, appliesTo: 'value', note: '0.5%-2.5% of assessed value per state' },
  sau: { rate: 0.025, appliesTo: 'value', note: '2.5% Zakat on property value (if held for trade)' },
  uae: { rate: 0.0, appliesTo: 'rental', note: 'No property tax; 5% VAT on new sales' },
  uk: { rate: 0.015, appliesTo: 'value', note: 'Stamp duty on purchase; council tax annual' }
};

/* ============================================================
   15. CONSTRUCTION STYLES — for self-build lands
   ============================================================ */
const CONSTRUCTION_STYLES = [
  { id: 'modern', name: 'Modern', costMultiplier: 1.00, moodBonus: 4 },
  { id: 'classic', name: 'Classic European', costMultiplier: 1.10, moodBonus: 5 },
  { id: 'mediterranean', name: 'Mediterranean', costMultiplier: 1.15, moodBonus: 6 },
  { id: 'spanish', name: 'Spanish Colonial', costMultiplier: 1.20, moodBonus: 6 },
  { id: 'santorini', name: 'Santorini Cycladic', costMultiplier: 1.25, moodBonus: 8 },
  { id: 'contemporary', name: 'Contemporary', costMultiplier: 1.05, moodBonus: 5 },
  { id: 'islamic_najdi', name: 'Islamic / Najdi', costMultiplier: 1.30, moodBonus: 7 },
  { id: 'victorian', name: 'Victorian', costMultiplier: 1.35, moodBonus: 7 },
  { id: 'colonial', name: 'Colonial', costMultiplier: 1.20, moodBonus: 5 },
  { id: 'ranch', name: 'Ranch Style', costMultiplier: 0.95, moodBonus: 4 },
  { id: 'midcentury', name: 'Mid-Century Modern', costMultiplier: 1.10, moodBonus: 6 },
  { id: 'industrial', name: 'Industrial', costMultiplier: 0.95, moodBonus: 3 },
  { id: 'minimalist', name: 'Minimalist', costMultiplier: 1.00, moodBonus: 4 }
];

/* ============================================================
   16. PROPERTY EVENTS — random events for owned homes
   ============================================================ */
const PROPERTY_EVENTS = [
  { id: 'pipe_burst', title: 'Pipe burst', text: 'A main pipe burst. Emergency plumber needed.',
    effect: { costPct: 0.03, moodPenalty: 3 }, weight: 8 },
  { id: 'neighbor_dispute', title: 'Neighbor dispute', text: 'A neighbor complaint about noise or shared walls.',
    effect: { costPct: 0.005, moodPenalty: 2, requiresApartment: true }, weight: 6 },
  { id: 'rent_hike', title: 'Rent hike opportunity', text: 'Market rents in the area have increased. You could raise the tenant\'s rent.',
    effect: { rentIncreasePct: 0.10, requiresRented: true }, weight: 5 },
  { id: 'vacancy', title: 'Tenant leaves', text: 'Your tenant gave notice. The property will be vacant for 1-3 months.',
    effect: { monthsVacant: 2, requiresRented: true }, weight: 4 },
  { id: 'building_renovation', title: 'Building renovation fee', text: 'The building management is renovating common areas. Your share is due.',
    effect: { costPct: 0.015, requiresApartment: true }, weight: 5 },
  { id: 'fire', title: 'Fire damage', text: 'A small kitchen fire caused damage. Insurance may cover part.',
    effect: { costPct: 0.08, moodPenalty: 6, insuranceCovers: true }, weight: 2 },
  { id: 'flood', title: 'Flood damage', text: 'Heavy rain flooded the ground floor.',
    effect: { costPct: 0.05, moodPenalty: 4, insuranceCovers: true }, weight: 3 },
  { id: 'neighborhood_improvement', title: 'Neighborhood improvement', text: 'A new metro station opened nearby. Property values jumped.',
    effect: { valueIncreasePct: 0.08, moodBonus: 3 }, weight: 4 },
  { id: 'new_construction', title: 'New construction nearby', text: 'A large new project began next door. Noise and traffic, but area value may rise.',
    effect: { valueChangePct: 0.02, moodPenalty: 1 }, weight: 5 },
  { id: 'inheritance_windfall', title: 'Family inheritance', text: 'A relative passed away and left you a share.',
    effect: { cashRewardPct: 0.05 }, weight: 2 },
  { id: 'compound_fee_increase', title: 'Compound fee increase', text: 'The compound management increased monthly fees.',
    effect: { feeIncreasePct: 0.15, requiresCompound: true }, weight: 4 },
  { id: 'structural_problem', title: 'Structural issue', text: 'A structural inspection found an issue requiring repair.',
    effect: { costPct: 0.04, moodPenalty: 4 }, weight: 3 },
  { id: 'renovation_opportunity', title: 'Renovation opportunity', text: 'A contractor offers a discounted renovation that would increase value.',
    effect: { valueIncreasePct: 0.10, costPct: 0.04 }, weight: 4 },
  { id: 'property_tax_hike', title: 'Property tax increase', text: 'The municipality increased property tax.',
    effect: { taxIncreasePct: 0.20 }, weight: 4 },
  { id: 'security_incident', title: 'Security incident', text: 'A break-in occurred in the neighborhood. You decide to upgrade security.',
    effect: { costPct: 0.01, moodPenalty: 3 }, weight: 3 },
  /* 👇 ADD NEW PROPERTY EVENTS HERE 👇 */
];

/* ============================================================
   17. PROPERTY CALCULATORS — pure functions
   ============================================================ */
const PropertyCalculators = {
  calculateUnitPrice(basePpm, unitConfig, planConfig) {
    const rawPrice = basePpm * unitConfig.area * unitConfig.priceMult;
    const finalPrice = rawPrice * planConfig.totalMarkup;
    const downPayment = finalPrice * planConfig.downPct;
    const remainingBalance = finalPrice - downPayment;
    const monthlyInstallment = planConfig.years > 0 ? (remainingBalance / (planConfig.years * 12)) : 0;
    return {
      totalPrice: Math.round(finalPrice),
      downPayment: Math.round(downPayment),
      monthlyInstallment: Math.round(monthlyInstallment),
      maintenanceDeposit: Math.round(rawPrice * REAL_ESTATE_CONFIG.defaultMaintenanceDepositPct)
    };
  },

  calculateMonthlyRent(propertyVal, annualYieldPct = 0.07) {
    return Math.round((propertyVal * annualYieldPct) / 12);
  },

  calculateFinishingCost(area, tierId, country) {
    const tier = RENOVATION_OPTIONS.finishingTiers.find(t => t.id === tierId);
    if (!tier) return 0;
    return Math.round((tier.costPerM2[country] || 0) * area);
  },

  calculateUpgradeCost(upgradeId, country) {
    const upgrade = RENOVATION_OPTIONS.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return 0;
    return upgrade.fixedCost[country] || 0;
  },

  calculateFurnitureCost(categoryId, tierId, country) {
    const cat = FURNITURE_CATALOG[categoryId];
    if (!cat) return 0;
    const tier = cat.tiers.find(t => t.id === tierId);
    return tier ? (tier.cost[country] || 0) : 0;
  },

  calculateApplianceCost(typeId, tierId, country) {
    const app = APPLIANCES_CATALOG[typeId];
    if (!app) return 0;
    const tier = app.tiers.find(t => t.id === tierId);
    return tier ? (tier.cost[country] || 0) : 0;
  },

  calculateStaffAnnualCost(staffId, variantId, country) {
    const staff = HOUSEHOLD_STAFF[staffId];
    if (!staff) return 0;
    const variant = staff.variants.find(v => v.id === variantId);
    return variant ? (variant.cost[country] || 0) * 12 : 0;
  },

  calculateMortgagePayment(principal, annualRate, years) {
    if (years <= 0 || principal <= 0) return 0;
    const monthlyRate = annualRate / 12;
    const monthly = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -years * 12));
    return Math.round(monthly);
  },

  calculateBuildCost(landSize, styleId, country) {
    const style = CONSTRUCTION_STYLES.find(s => s.id === styleId);
    const buildCost = (REAL_ESTATE_CONFIG.buildCostPerM2[country] || 4000) * landSize;
    const multiplier = style ? style.costMultiplier : 1.0;
    return Math.round(buildCost * multiplier);
  }
};

/* ============================================================
   END OF REAL ESTATE DATA
   ============================================================ */
