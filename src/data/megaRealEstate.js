/* ============================================================================
   World Life Complete Edition — 100% v1 Real Estate + 50% Web Expansion
   Includes 230+ Compounds, 40 Unit Types, 111 Land Plots, 38 Payment Plans,
   6 Finishing Tiers, 27 Upgrades, 15 Room Furniture Catalogs, 14 Staff Roles,
   Custom Land-to-Building Development, Bait Al-Watan, Sakan, Sakani & SZHP.
   ========================================================================== */

export const PROPERTY_UNITS = [
  {
    "id": "studio_s",
    "name": "Small Studio",
    "area": 40,
    "rooms": 1,
    "priceMult": 1.15,
    "maintenanceMult": 0.7,
    "shape": "studio"
  },
  {
    "id": "studio",
    "name": "Studio Apartment",
    "area": 55,
    "rooms": 1,
    "priceMult": 1.1,
    "maintenanceMult": 0.8,
    "shape": "studio"
  },
  {
    "id": "studio_l",
    "name": "Large Studio",
    "area": 70,
    "rooms": 2,
    "priceMult": 1.05,
    "maintenanceMult": 0.85,
    "shape": "studio"
  },
  {
    "id": "br1",
    "name": "1-Bedroom Apartment",
    "area": 85,
    "rooms": 2,
    "priceMult": 1.05,
    "maintenanceMult": 0.9,
    "shape": "apartment"
  },
  {
    "id": "br1_l",
    "name": "1-Bedroom (Large)",
    "area": 100,
    "rooms": 2,
    "priceMult": 1.03,
    "maintenanceMult": 0.95,
    "shape": "apartment"
  },
  {
    "id": "br2",
    "name": "2-Bedroom Apartment",
    "area": 130,
    "rooms": 3,
    "priceMult": 1.0,
    "maintenanceMult": 1.0,
    "shape": "apartment"
  },
  {
    "id": "br2_l",
    "name": "2-Bedroom (Large)",
    "area": 150,
    "rooms": 3,
    "priceMult": 0.99,
    "maintenanceMult": 1.05,
    "shape": "apartment"
  },
  {
    "id": "br3",
    "name": "3-Bedroom Apartment",
    "area": 180,
    "rooms": 3,
    "priceMult": 0.98,
    "maintenanceMult": 1.1,
    "shape": "apartment"
  },
  {
    "id": "br4",
    "name": "4-Bedroom Apartment",
    "area": 210,
    "rooms": 4,
    "priceMult": 0.96,
    "maintenanceMult": 1.15,
    "shape": "apartment"
  },
  {
    "id": "br5",
    "name": "5-Bedroom Apartment",
    "area": 250,
    "rooms": 4,
    "priceMult": 0.94,
    "maintenanceMult": 1.2,
    "shape": "apartment"
  },
  {
    "id": "chalet_s",
    "name": "Coastal Chalet (Small)",
    "area": 100,
    "rooms": 2,
    "priceMult": 1.15,
    "maintenanceMult": 1.2,
    "shape": "chalet"
  },
  {
    "id": "chalet_m",
    "name": "Coastal Chalet (Medium)",
    "area": 130,
    "rooms": 3,
    "priceMult": 1.2,
    "maintenanceMult": 1.25,
    "shape": "chalet"
  },
  {
    "id": "chalet_l",
    "name": "Senior Lagoon Chalet",
    "area": 160,
    "rooms": 3,
    "priceMult": 1.25,
    "maintenanceMult": 1.3,
    "shape": "chalet"
  },
  {
    "id": "loft",
    "name": "Industrial Loft",
    "area": 140,
    "rooms": 3,
    "priceMult": 1.1,
    "maintenanceMult": 1.0,
    "shape": "duplex"
  },
  {
    "id": "duplex",
    "name": "Garden / Roof Duplex",
    "area": 240,
    "rooms": 4,
    "priceMult": 1.08,
    "maintenanceMult": 1.2,
    "shape": "penthouse"
  },
  {
    "id": "triplex",
    "name": "Triplex Penthouse",
    "area": 320,
    "rooms": 5,
    "priceMult": 1.3,
    "maintenanceMult": 1.4,
    "shape": "penthouse"
  },
  {
    "id": "penthouse",
    "name": "Sky Penthouse w/ Pool",
    "area": 280,
    "rooms": 4,
    "priceMult": 1.35,
    "maintenanceMult": 1.4,
    "shape": "penthouse"
  },
  {
    "id": "ivilla",
    "name": "iVilla (Mountain View Style)",
    "area": 230,
    "rooms": 4,
    "priceMult": 1.12,
    "maintenanceMult": 1.1,
    "shape": "villa"
  },
  {
    "id": "townhouse_s",
    "name": "Townhouse (Small)",
    "area": 180,
    "rooms": 3,
    "priceMult": 1.12,
    "maintenanceMult": 1.15,
    "shape": "townhouse"
  },
  {
    "id": "townhouse",
    "name": "Townhouse Middle",
    "area": 220,
    "rooms": 4,
    "priceMult": 1.15,
    "maintenanceMult": 1.2,
    "shape": "townhouse"
  },
  {
    "id": "townhouse_l",
    "name": "Townhouse (Large)",
    "area": 260,
    "rooms": 4,
    "priceMult": 1.18,
    "maintenanceMult": 1.25,
    "shape": "townhouse"
  },
  {
    "id": "twinhouse",
    "name": "Twin House",
    "area": 290,
    "rooms": 4,
    "priceMult": 1.2,
    "maintenanceMult": 1.3,
    "shape": "twin_house"
  },
  {
    "id": "standalone_s",
    "name": "Standalone Villa (Medium)",
    "area": 380,
    "rooms": 5,
    "priceMult": 1.35,
    "maintenanceMult": 1.5,
    "shape": "villa"
  },
  {
    "id": "standalone_l",
    "name": "Grand Luxury Villa",
    "area": 550,
    "rooms": 7,
    "priceMult": 1.5,
    "maintenanceMult": 1.8,
    "shape": "villa"
  },
  {
    "id": "mansion",
    "name": "Royal Waterfront Mansion",
    "area": 950,
    "rooms": 7,
    "priceMult": 1.85,
    "maintenanceMult": 2.5,
    "shape": "mansion"
  },
  {
    "id": "palace",
    "name": "Palatial Estate",
    "area": 1500,
    "rooms": 7,
    "priceMult": 2.2,
    "maintenanceMult": 3.5,
    "shape": "mansion"
  },
  {
    "id": "penthouse_duplex",
    "name": "Sky Duplex Penthouse",
    "area": 340,
    "rooms": 4,
    "priceMult": 1.55,
    "maintenanceMult": 1.4,
    "shape": "penthouse"
  },
  {
    "id": "garden_duplex",
    "name": "Ground Garden Duplex",
    "area": 245,
    "rooms": 4,
    "priceMult": 1.25,
    "maintenanceMult": 1.15,
    "shape": "duplex"
  },
  {
    "id": "loft_industrial",
    "name": "Double-Height Loft",
    "area": 110,
    "rooms": 2,
    "priceMult": 1.2,
    "maintenanceMult": 0.95,
    "shape": "duplex"
  },
  {
    "id": "courtyard_riad",
    "name": "Traditional Courtyard House",
    "area": 290,
    "rooms": 5,
    "priceMult": 1.3,
    "maintenanceMult": 1.2,
    "shape": "villa"
  },
  {
    "id": "townhouse_corner",
    "name": "Corner Townhouse + Garden",
    "area": 235,
    "rooms": 4,
    "priceMult": 1.22,
    "maintenanceMult": 1.1,
    "shape": "townhouse"
  },
  {
    "id": "twin_villa_pool",
    "name": "Twin House w/ Private Pool",
    "area": 310,
    "rooms": 4,
    "priceMult": 1.35,
    "maintenanceMult": 1.25,
    "shape": "twin_house"
  },
  {
    "id": "lagoon_chalet",
    "name": "Crystal Lagoon Chalet",
    "area": 125,
    "rooms": 3,
    "priceMult": 1.32,
    "maintenanceMult": 1.1,
    "shape": "chalet"
  },
  {
    "id": "seafront_villa",
    "name": "First-Row Seafront Villa",
    "area": 480,
    "rooms": 6,
    "priceMult": 1.85,
    "maintenanceMult": 1.6,
    "shape": "villa"
  },
  {
    "id": "golf_mansion",
    "name": "Golf Course Signature Mansion",
    "area": 780,
    "rooms": 7,
    "priceMult": 2.1,
    "maintenanceMult": 1.9,
    "shape": "mansion"
  },
  {
    "id": "royal_estate",
    "name": "Gated Royal Compound Palace",
    "area": 1250,
    "rooms": 9,
    "priceMult": 2.6,
    "maintenanceMult": 2.4,
    "shape": "mansion"
  },
  {
    "id": "sakan_social_90",
    "name": "Social Housing Flat (90 m\u00b2)",
    "area": 90,
    "rooms": 3,
    "priceMult": 0.68,
    "maintenanceMult": 0.6,
    "shape": "apartment"
  },
  {
    "id": "medical_clinic_unit",
    "name": "Medical Plaza Clinic Suite",
    "area": 85,
    "rooms": 3,
    "priceMult": 1.45,
    "maintenanceMult": 1.1,
    "shape": "commercial"
  },
  {
    "id": "retail_street_shop",
    "name": "Ground-Floor Retail Strip Shop",
    "area": 70,
    "rooms": 1,
    "priceMult": 1.75,
    "maintenanceMult": 1.2,
    "shape": "commercial"
  },
  {
    "id": "admin_hq_floor",
    "name": "Grade-A Administrative Office",
    "area": 160,
    "rooms": 4,
    "priceMult": 1.5,
    "maintenanceMult": 1.2,
    "shape": "commercial"
  }
];
export const FINISHING_TIERS = [
  {
    "id": "core_shell",
    "label": "Core & Shell (Red Brick / Concrete)",
    "costMult": 0.8,
    "hap": -4,
    "rentMult": 0.0,
    "canLive": false,
    "floorTone": "#9CA3AF",
    "wallTone": "#B45309"
  },
  {
    "id": "semi_finished",
    "label": "Semi-Finished (Conduits & Plaster / Mahara)",
    "costMult": 0.9,
    "hap": -2,
    "rentMult": 0.5,
    "canLive": false,
    "floorTone": "#CBD5E1",
    "wallTone": "#E2E8F0"
  },
  {
    "id": "standard",
    "label": "Standard Finished (Ceramic & Emulsion Paint)",
    "costMult": 1.0,
    "hap": 2,
    "rentMult": 1.0,
    "canLive": true,
    "floorTone": "#E7DFD3",
    "wallTone": "#FAF7F2"
  },
  {
    "id": "super_lux",
    "label": "Super Lux (Porcelain, Gypsum Ceilings & Concealed Light)",
    "costMult": 1.18,
    "hap": 5,
    "rentMult": 1.22,
    "canLive": true,
    "floorTone": "#D9C3A3",
    "wallTone": "#FFFDF9"
  },
  {
    "id": "ultra_super_lux",
    "label": "Ultra Super Lux (Herringbone Parquet, Marble & Central AC)",
    "costMult": 1.38,
    "hap": 9,
    "rentMult": 1.48,
    "canLive": true,
    "floorTone": "#B68D5C",
    "wallTone": "#FDFBF7"
  },
  {
    "id": "royal_smart",
    "label": "Bespoke Smart-Home & Italian Marble",
    "costMult": 1.65,
    "hap": 13,
    "rentMult": 1.75,
    "canLive": true,
    "floorTone": "#EDE8DF",
    "wallTone": "#FFFFFF"
  }
];
export const COMPOUNDS_BY_COUNTRY = {
  "egy": [
    {
      "id": "egy_madinaty",
      "rawId": "madinaty",
      "name": "Madinaty",
      "developer": "TMG",
      "city": "New Cairo",
      "ppm2026": 75000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 25.0,
      "launchYear": 2006,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "schools",
        "malls",
        "hospital",
        "golf",
        "sports_club",
        "metro_link",
        "security"
      ],
      "tag": "Largest fully integrated mega-city in Egypt, 10M+ m\u00b2 of green space."
    },
    {
      "id": "egy_noor",
      "rawId": "noor",
      "name": "Noor City",
      "developer": "TMG",
      "city": "Capital Gardens",
      "ppm2026": 60000,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 20.0,
      "launchYear": 2021,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "smart_city",
        "schools",
        "malls",
        "parks",
        "security"
      ],
      "tag": "Ultra-smart green city near the New Capital."
    },
    {
      "id": "egy_southmed",
      "rawId": "southmed",
      "name": "SouthMED",
      "developer": "TMG",
      "city": "North Coast",
      "ppm2026": 180000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 40.0,
      "launchYear": 2024,
      "delivery": "2028",
      "Coastal": true,
      "amenities": [
        "lagoon",
        "marina",
        "golf",
        "private_beach",
        "helipad",
        "luxury_hotels"
      ],
      "tag": "International Mediterranean resort with private marina."
    },
    {
      "id": "egy_celia",
      "rawId": "celia",
      "name": "Celia",
      "developer": "TMG",
      "city": "New Administrative Capital",
      "ppm2026": 52000,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 18.0,
      "launchYear": 2021,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "parks",
        "schools",
        "security",
        "smart_home"
      ],
      "tag": "First integrated residential district in the New Capital."
    },
    {
      "id": "egy_rehab",
      "rawId": "rehab",
      "name": "Al Rehab",
      "developer": "TMG",
      "city": "New Cairo",
      "ppm2026": 55000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 15.0,
      "launchYear": 1996,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "schools",
        "malls",
        "hospital",
        "parks",
        "security"
      ],
      "tag": "Pioneer Egyptian gated community, now fully mature."
    },
    {
      "id": "egy_telal_sokhna",
      "rawId": "telal_sokhna",
      "name": "Telal Sokhna",
      "developer": "TMG",
      "city": "Ain Sokhna",
      "ppm2026": 60000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 20.0,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "beach",
        "pool",
        "security",
        "marina"
      ],
      "tag": "Beach chalets by TMG on the Red Sea."
    },
    {
      "id": "egy_fourteen_golf",
      "rawId": "fourteen_golf",
      "name": "Fourteen Golf",
      "developer": "TMG",
      "city": "New Cairo",
      "ppm2026": 92000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 35.0,
      "launchYear": 2023,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "golf",
        "club",
        "schools",
        "parks",
        "security"
      ],
      "tag": "Championship golf villas at the heart of Madinaty."
    },
    {
      "id": "egy_al_rabwa",
      "rawId": "al_rabwa",
      "name": "Al Rabwa",
      "developer": "Talaat Moustafa Group",
      "city": "Sheikh Zayed",
      "ppm2026": 125000,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 12.0,
      "launchYear": 1994,
      "delivery": "early development",
      "Coastal": false,
      "amenities": [
        "villas",
        "landscaped_streets",
        "security"
      ],
      "tag": "Early West Cairo residential development. 1994-era prices are modeled; plot servicing, utilities and delivery vary by phase."
    },
    {
      "id": "egy_virginia_beach",
      "rawId": "virginia_beach",
      "name": "Virginia Beach",
      "developer": "Talaat Moustafa Group",
      "city": "North Coast",
      "ppm2026": 115000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 10.0,
      "launchYear": 1994,
      "delivery": "early development",
      "Coastal": true,
      "amenities": [
        "summer_chalets",
        "beach_access",
        "seasonal_services"
      ],
      "tag": "Early North Coast holiday development in TMG\u2019s 1986\u20131994 expansion; seasonal services and exact phase pricing are modeled."
    },
    {
      "id": "egy_may_fair",
      "rawId": "may_fair",
      "name": "May Fair",
      "developer": "Talaat Moustafa Group",
      "city": "El Shorouk",
      "ppm2026": 95000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 8.0,
      "launchYear": 1994,
      "delivery": "early development",
      "Coastal": false,
      "amenities": [
        "low_density_residential",
        "local_services"
      ],
      "tag": "Early east-Cairo suburban residential project; prices, utility connections and delivery timing are modeled."
    },
    {
      "id": "egy_marassi",
      "rawId": "marassi",
      "name": "Marassi",
      "developer": "Emaar Misr",
      "city": "North Coast",
      "ppm2026": 210000,
      "rentalYieldPct": 0.1,
      "compoundFeePerM2": 55.0,
      "launchYear": 2008,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "beach",
        "golf",
        "marina",
        "nightlife",
        "five_star_hotels",
        "security"
      ],
      "tag": "Pinnacle of coastal luxury living in the Middle East."
    },
    {
      "id": "egy_mivida",
      "rawId": "mivida",
      "name": "Mivida",
      "developer": "Emaar Misr",
      "city": "New Cairo",
      "ppm2026": 135000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 30.0,
      "launchYear": 2008,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "international_schools",
        "downtown",
        "medical_complex",
        "parks",
        "club"
      ],
      "tag": "California-inspired eco-friendly haven."
    },
    {
      "id": "egy_cairogate",
      "rawId": "cairogate",
      "name": "Cairo Gate",
      "developer": "Emaar Misr",
      "city": "Sheikh Zayed",
      "ppm2026": 120000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 28.0,
      "launchYear": 2017,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "boutique_hotel",
        "retail_strip",
        "clubhouse",
        "security"
      ],
      "tag": "Boutique lifestyle community in West Cairo."
    },
    {
      "id": "egy_aeon",
      "rawId": "aeon",
      "name": "The Aeon",
      "developer": "Emaar Misr",
      "city": "New Cairo",
      "ppm2026": 118000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 30.0,
      "launchYear": 2023,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "schools",
        "parks",
        "club",
        "security",
        "pool"
      ],
      "tag": "Emaar Misr's newest residential landmark in New Cairo."
    },
    {
      "id": "egy_katameya_heights",
      "rawId": "katameya_heights",
      "name": "Katameya Heights Golf & Tennis Resort",
      "developer": "Katameya Heights Golf & Tennis Resort",
      "city": "Katameya / Eastern Cairo",
      "ppm2026": 278000,
      "rentalYieldPct": 0.055,
      "compoundFeePerM2": 35.0,
      "launchYear": 1994,
      "delivery": "early golf estate",
      "Coastal": false,
      "amenities": [
        "golf_course",
        "clubhouse",
        "tennis",
        "villas",
        "security"
      ],
      "tag": "Early luxury golf estate. Published research reports first-phase villas at roughly USD 258k\u2013430k in 1994; displayed per-m\u00b2 prices model a 200 m\u00b2 villa and are estimates, not a surviving Egyptian price list."
    },
    {
      "id": "egy_beverly_hills",
      "rawId": "beverly_hills",
      "name": "Beverly Hills",
      "developer": "SODIC",
      "city": "Sheikh Zayed",
      "ppm2026": 90000,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 10.0,
      "launchYear": 1997,
      "delivery": "early development",
      "Coastal": false,
      "amenities": [
        "villas",
        "landscaped_streets",
        "security",
        "clubhouse"
      ],
      "tag": "SODIC\u2019s first Beverly Hills development launched in 1997; early phases are modeled separately from later West Cairo infrastructure."
    },
    {
      "id": "egy_villette",
      "rawId": "villette",
      "name": "Villette",
      "developer": "SODIC",
      "city": "New Cairo",
      "ppm2026": 130000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 30.0,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "sports_club",
        "organic_parks",
        "walkways",
        "security",
        "pools"
      ],
      "tag": "French-designed master-planned neighborhood with active green parks."
    },
    {
      "id": "egy_allegria",
      "rawId": "allegria",
      "name": "Allegria",
      "developer": "SODIC",
      "city": "Sheikh Zayed",
      "ppm2026": 150000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 35.0,
      "launchYear": 2010,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "signature_golf",
        "country_club",
        "spa",
        "fine_dining",
        "security"
      ],
      "tag": "Greg Norman signature golf villas."
    },
    {
      "id": "egy_eastown",
      "rawId": "eastown",
      "name": "Eastown",
      "developer": "SODIC",
      "city": "New Cairo",
      "ppm2026": 95000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 22.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "schools",
        "parks",
        "club",
        "pool"
      ],
      "tag": "Urban mixed-use living near AUC campus."
    },
    {
      "id": "egy_westown",
      "rawId": "westown",
      "name": "Westown",
      "developer": "SODIC",
      "city": "Sheikh Zayed",
      "ppm2026": 95000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 22.0,
      "launchYear": 2010,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "schools",
        "parks",
        "club",
        "pool",
        "business_district"
      ],
      "tag": "Urban west Cairo living with SODIC's signature design."
    },
    {
      "id": "egy_zed_east",
      "rawId": "zed_east",
      "name": "Zed East",
      "developer": "ORA",
      "city": "New Cairo",
      "ppm2026": 105000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 28.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "security",
        "club",
        "pool",
        "schools"
      ],
      "tag": "Modern design, premium finishes."
    },
    {
      "id": "egy_june",
      "rawId": "june",
      "name": "June",
      "developer": "SODIC",
      "city": "North Coast",
      "ppm2026": 130000,
      "rentalYieldPct": 0.085,
      "compoundFeePerM2": 45.0,
      "launchYear": 2021,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "beach",
        "pool",
        "security",
        "marina",
        "spa"
      ],
      "tag": "SODIC's flagship North Coast community."
    },
    {
      "id": "egy_vye",
      "rawId": "vye",
      "name": "VYE",
      "developer": "SODIC",
      "city": "Sheikh Zayed",
      "ppm2026": 110000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 28.0,
      "launchYear": 2022,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "parks",
        "club",
        "pool",
        "security"
      ],
      "tag": "SODIC's newest west Cairo boutique residential development."
    },
    {
      "id": "egy_karmell",
      "rawId": "karmell",
      "name": "Karmell",
      "developer": "SODIC",
      "city": "Sheikh Zayed",
      "ppm2026": 125000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 30.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "club",
        "schools",
        "security"
      ],
      "tag": "New Cairo's premiere tree-lined boutique community."
    },
    {
      "id": "egy_mizar",
      "rawId": "mizar",
      "name": "Mizar",
      "developer": "SODIC",
      "city": "New Cairo",
      "ppm2026": 85000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 22.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "security",
        "club",
        "pool"
      ],
      "tag": "Intimate community living by SODIC."
    },
    {
      "id": "egy_village_gate",
      "rawId": "village_gate",
      "name": "Village Gate",
      "developer": "SODIC",
      "city": "Sheikh Zayed",
      "ppm2026": 80000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 20.0,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "club",
        "pool",
        "schools"
      ],
      "tag": "SODIC's affordable entry-level community."
    },
    {
      "id": "egy_palmhills_nc",
      "rawId": "palmhills_nc",
      "name": "Palm Hills New Cairo",
      "developer": "Palm Hills",
      "city": "New Cairo",
      "ppm2026": 115000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 25.0,
      "launchYear": 2007,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "palm_hills_club",
        "schools",
        "commercial",
        "parks"
      ],
      "tag": "Iconic modern architectural design."
    },
    {
      "id": "egy_badya",
      "rawId": "badya",
      "name": "Badya",
      "developer": "Palm Hills",
      "city": "6th of October",
      "ppm2026": 88000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 24.0,
      "launchYear": 2019,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "smart_city",
        "sports_academy",
        "university_hub",
        "parks"
      ],
      "tag": "First cognitive smart city in the Middle East."
    },
    {
      "id": "egy_palmhills_alex",
      "rawId": "palmhills_alex",
      "name": "Palm Hills Alexandria",
      "developer": "Palm Hills",
      "city": "Alexandria",
      "ppm2026": 82000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 22.0,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "schools",
        "clubhouse",
        "green_belt",
        "security"
      ],
      "tag": "First modern gated compound in central Alexandria."
    },
    {
      "id": "egy_hacienda_bay",
      "rawId": "hacienda_bay",
      "name": "Hacienda Bay",
      "developer": "Palm Hills",
      "city": "North Coast",
      "ppm2026": 130000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 45.0,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "beach",
        "pool",
        "security",
        "marina",
        "club"
      ],
      "tag": "Famous North Coast beach community."
    },
    {
      "id": "egy_hacienda_waters",
      "rawId": "hacienda_waters",
      "name": "Hacienda Waters",
      "developer": "Palm Hills",
      "city": "North Coast",
      "ppm2026": 165000,
      "rentalYieldPct": 0.095,
      "compoundFeePerM2": 50.0,
      "launchYear": 2023,
      "delivery": "2027",
      "Coastal": true,
      "amenities": [
        "water_park",
        "private_beach",
        "beach_club",
        "luxury_dining"
      ],
      "tag": "Family water entertainment community."
    },
    {
      "id": "egy_mvic_nc",
      "rawId": "mvic_nc",
      "name": "Mountain View iCity",
      "developer": "Mountain View",
      "city": "New Cairo",
      "ppm2026": 100000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 26.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "car_free_roads",
        "central_park",
        "smart_home",
        "clubhouse"
      ],
      "tag": "American-style double-decked multi-level neighborhood."
    },
    {
      "id": "egy_mv_ras_elhekma",
      "rawId": "mv_ras_elhekma",
      "name": "Mountain View Ras El Hekma",
      "developer": "Mountain View",
      "city": "North Coast",
      "ppm2026": 150000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 45.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "greek_architecture",
        "crystal_lagoons",
        "private_beach",
        "commercial_strip"
      ],
      "tag": "Santorini-inspired island living on Egyptian coast."
    },
    {
      "id": "egy_hyde_park_nc",
      "rawId": "hyde_park_nc",
      "name": "Hyde Park New Cairo",
      "developer": "Hyde Park",
      "city": "New Cairo",
      "ppm2026": 88000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 24.0,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "security",
        "club",
        "pool",
        "schools"
      ],
      "tag": "Green spaces, family-friendly living."
    },
    {
      "id": "egy_hyde_park_west",
      "rawId": "hyde_park_west",
      "name": "Hyde Park West",
      "developer": "Hyde Park",
      "city": "Sheikh Zayed",
      "ppm2026": 92000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 24.0,
      "launchYear": 2020,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "parks",
        "security",
        "club",
        "pool",
        "schools",
        "golf"
      ],
      "tag": "Hyde Park's west Cairo expansion."
    },
    {
      "id": "egy_zed_zayed",
      "rawId": "zed_zayed",
      "name": "Zed Sheikh Zayed",
      "developer": "ORA",
      "city": "Sheikh Zayed",
      "ppm2026": 140000,
      "rentalYieldPct": 0.085,
      "compoundFeePerM2": 32.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "zed_park",
        "sports_complex",
        "luxury_towers",
        "fine_dining",
        "concierge"
      ],
      "tag": "High-rise luxury parkland towers."
    },
    {
      "id": "egy_silversands",
      "rawId": "silversands",
      "name": "SilverSands",
      "developer": "ORA",
      "city": "North Coast",
      "ppm2026": 190000,
      "rentalYieldPct": 0.095,
      "compoundFeePerM2": 55.0,
      "launchYear": 2023,
      "delivery": "2026",
      "Coastal": true,
      "amenities": [
        "beachfront",
        "boutique_hotels",
        "lagoons",
        "high_end_dining"
      ],
      "tag": "Egypt's answer to Grenada luxury coastal living."
    },
    {
      "id": "egy_oia",
      "rawId": "oia",
      "name": "OIA",
      "developer": "ORA",
      "city": "New Cairo",
      "ppm2026": 110000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 28.0,
      "launchYear": 2023,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "schools",
        "parks",
        "club",
        "pool",
        "security"
      ],
      "tag": "ORA's design-led New Cairo community."
    },
    {
      "id": "egy_swanlake_residence",
      "rawId": "swanlake_residence",
      "name": "SwanLake Residence",
      "developer": "Hassan Allam",
      "city": "New Cairo",
      "ppm2026": 155000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 35.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "sports_club",
        "swan_lagoons",
        "jogging_tracks",
        "security"
      ],
      "tag": "Elite family legacy compound with unparalleled finishing standards."
    },
    {
      "id": "egy_swanlake_west",
      "rawId": "swanlake_west",
      "name": "Swan Lake West",
      "developer": "Hassan Allam",
      "city": "Sheikh Zayed",
      "ppm2026": 125000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 30.0,
      "launchYear": 2021,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "lagoons",
        "parks",
        "club",
        "schools"
      ],
      "tag": "Hassan Allam's west Cairo sister to SwanLake."
    },
    {
      "id": "egy_gouna_enclave",
      "rawId": "gouna_enclave",
      "name": "El Gouna Town",
      "developer": "Orascom",
      "city": "Red Sea",
      "ppm2026": 210000,
      "rentalYieldPct": 0.11,
      "compoundFeePerM2": 60.0,
      "launchYear": 1989,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "private_marinas",
        "international_hospital",
        "golf",
        "airport",
        "schools"
      ],
      "tag": "Historical entry prices are a modeled 1994 estimate, not a verified price list. The development began in 1989; amenity availability is phased by the historical simulation."
    },
    {
      "id": "egy_owest",
      "rawId": "owest",
      "name": "O West",
      "developer": "Orascom",
      "city": "6th of October",
      "ppm2026": 95000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 24.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "orascom_club",
        "business_district",
        "schools",
        "hospital"
      ],
      "tag": "El Gouna's flagship town living brought to West Cairo."
    },
    {
      "id": "egy_makadi",
      "rawId": "makadi",
      "name": "Makadi Heights",
      "developer": "Orascom",
      "city": "Red Sea",
      "ppm2026": 95000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 35.0,
      "launchYear": 2008,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "beach",
        "pool",
        "marina",
        "security"
      ],
      "tag": "Orascom's hillside Red Sea resort community."
    },
    {
      "id": "egy_north_edge_towers",
      "rawId": "north_edge_towers",
      "name": "North Edge Towers",
      "developer": "City Edge",
      "city": "New Alamein",
      "ppm2026": 160000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 45.0,
      "launchYear": 2021,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "sky_pools",
        "sea_view_concierge",
        "mall",
        "private_beach"
      ],
      "tag": "Iconic coastal skyscrapers over the Mediterranean."
    },
    {
      "id": "egy_new_alamein_towers",
      "rawId": "new_alamein_towers",
      "name": "New Alamein Towers",
      "developer": "City Edge",
      "city": "New Alamein",
      "ppm2026": 140000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 40.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "sea_view",
        "mall",
        "private_beach",
        "concierge"
      ],
      "tag": "The landmark towers of New Alamein."
    },
    {
      "id": "egy_al_maqsad",
      "rawId": "al_maqsad",
      "name": "Al Maqsad",
      "developer": "City Edge",
      "city": "New Administrative Capital",
      "ppm2026": 52000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 18.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "schools",
        "security",
        "mosque"
      ],
      "tag": "City Edge's flagship New Capital residential district."
    },
    {
      "id": "egy_mazarine",
      "rawId": "mazarine",
      "name": "Mazarine",
      "developer": "City Edge",
      "city": "New Administrative Capital",
      "ppm2026": 58000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 20.0,
      "launchYear": 2021,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "water_features",
        "parks",
        "schools",
        "security"
      ],
      "tag": "Water-themed New Capital community."
    },
    {
      "id": "egy_el_patio",
      "rawId": "el_patio",
      "name": "El Patio",
      "developer": "Misr Italia",
      "city": "New Cairo",
      "ppm2026": 105000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 26.0,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "security",
        "club",
        "pool",
        "schools"
      ],
      "tag": "Italian-inspired courtyard living."
    },
    {
      "id": "egy_el_patio_oro",
      "rawId": "el_patio_oro",
      "name": "El Patio Oro",
      "developer": "Misr Italia",
      "city": "New Cairo",
      "ppm2026": 130000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 32.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "club",
        "pool",
        "schools",
        "security"
      ],
      "tag": "Upscale Misr Italia Italian-designed community."
    },
    {
      "id": "egy_il_bosco",
      "rawId": "il_bosco",
      "name": "IL Bosco",
      "developer": "Misr Italia",
      "city": "New Administrative Capital",
      "ppm2026": 50000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 20.0,
      "launchYear": 2019,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "forest",
        "parks",
        "schools",
        "security"
      ],
      "tag": "Forest-themed New Capital community."
    },
    {
      "id": "egy_cairo_business_plaza",
      "rawId": "cairo_business_plaza",
      "name": "Cairo Business Plaza",
      "developer": "Misr Italia",
      "city": "New Cairo",
      "ppm2026": 110000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 28.0,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "business_center",
        "shopping",
        "security",
        "concierge"
      ],
      "tag": "Mixed-use business and residential plaza."
    },
    {
      "id": "egy_il_monte_galala",
      "rawId": "il_monte_galala",
      "name": "Il Monte Galala",
      "developer": "Tatweer Misr",
      "city": "Ain Sokhna",
      "ppm2026": 105000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 35.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "beach",
        "crystal_lagoon",
        "pool",
        "security",
        "spa"
      ],
      "tag": "Mountain-and-sea Red Sea resort with crystal lagoons."
    },
    {
      "id": "egy_bloomfields",
      "rawId": "bloomfields",
      "name": "Bloomfields",
      "developer": "Tatweer Misr",
      "city": "New Cairo",
      "ppm2026": 95000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 24.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "club",
        "pool",
        "schools",
        "security"
      ],
      "tag": "Bloomfields New Cairo residence."
    },
    {
      "id": "egy_salt",
      "rawId": "salt",
      "name": "Salt",
      "developer": "Tatweer Misr",
      "city": "North Coast",
      "ppm2026": 155000,
      "rentalYieldPct": 0.095,
      "compoundFeePerM2": 48.0,
      "launchYear": 2022,
      "delivery": "2026",
      "Coastal": true,
      "amenities": [
        "beach",
        "lagoons",
        "pool",
        "security",
        "spa"
      ],
      "tag": "Salt-inspired Mediterranean resort community."
    },
    {
      "id": "egy_la_vista",
      "rawId": "la_vista",
      "name": "La Vista 1",
      "developer": "La Vista",
      "city": "Ain Sokhna",
      "ppm2026": 70000,
      "rentalYieldPct": 0.085,
      "compoundFeePerM2": 22.0,
      "launchYear": 2007,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "beach",
        "pool",
        "security",
        "marina"
      ],
      "tag": "La Vista's flagship Red Sea resort community."
    },
    {
      "id": "egy_la_vista_topaz",
      "rawId": "la_vista_topaz",
      "name": "La Vista Topaz",
      "developer": "La Vista",
      "city": "Ain Sokhna",
      "ppm2026": 85000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 28.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "beach",
        "pool",
        "security",
        "marina",
        "spa"
      ],
      "tag": "Upscale La Vista Red Sea community."
    },
    {
      "id": "egy_la_vista_city",
      "rawId": "la_vista_city",
      "name": "La Vista City",
      "developer": "La Vista",
      "city": "New Cairo",
      "ppm2026": 88000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 24.0,
      "launchYear": 2019,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "parks",
        "club",
        "pool",
        "schools",
        "security"
      ],
      "tag": "La Vista's first residential city community."
    },
    {
      "id": "egy_cairo_festival",
      "rawId": "cairo_festival",
      "name": "Cairo Festival City",
      "developer": "Al Futtaim",
      "city": "New Cairo",
      "ppm2026": 120000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 30.0,
      "launchYear": 2007,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "mall",
        "schools",
        "hospital",
        "parks",
        "security",
        "club"
      ],
      "tag": "Al Futtaim's flagship integrated city with Mall of Egypt nearby."
    },
    {
      "id": "egy_iconic_tower",
      "rawId": "iconic_tower",
      "name": "6ixty Iconic Tower",
      "developer": "Al Futtaim",
      "city": "New Administrative Capital",
      "ppm2026": 72000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 25.0,
      "launchYear": 2021,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "parks",
        "mall",
        "security",
        "concierge",
        "business_center"
      ],
      "tag": "Al Futtaim's iconic New Capital tower."
    },
    {
      "id": "egy_sarai",
      "rawId": "sarai",
      "name": "Sarai",
      "developer": "MNHD",
      "city": "New Cairo",
      "ppm2026": 88000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 24.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "schools",
        "parks",
        "club",
        "pool",
        "security"
      ],
      "tag": "MNHD's flagship New Cairo mega-development."
    },
    {
      "id": "egy_taj_city",
      "rawId": "taj_city",
      "name": "Taj City",
      "developer": "MNHD",
      "city": "New Cairo",
      "ppm2026": 82000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 22.0,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "schools",
        "parks",
        "club",
        "security"
      ],
      "tag": "MNHD's affordable New Cairo community."
    },
    {
      "id": "egy_jefaira",
      "rawId": "jefaira",
      "name": "Jefaira",
      "developer": "Inertia",
      "city": "North Coast",
      "ppm2026": 125000,
      "rentalYieldPct": 0.09,
      "compoundFeePerM2": 45.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "beach",
        "pool",
        "security",
        "spa",
        "club"
      ],
      "tag": "Inertia's flagship North Coast lifestyle community."
    },
    {
      "id": "egy_rokn",
      "rawId": "rokn",
      "name": "Rokn",
      "developer": "Inertia",
      "city": "New Cairo",
      "ppm2026": 92000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 24.0,
      "launchYear": 2022,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "parks",
        "club",
        "pool",
        "schools"
      ],
      "tag": "Inertia's modern New Cairo community."
    },
    {
      "id": "egy_sawary",
      "rawId": "sawary",
      "name": "Sawary Alexandria",
      "developer": "SED",
      "city": "Alexandria",
      "ppm2026": 70000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 20.0,
      "launchYear": 2015,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "lake_promenade",
        "sports_club",
        "medical_city",
        "malls"
      ],
      "tag": "Alexandria's premier planned modern residential district."
    },
    {
      "id": "egy_x2-comp-ashgar-city",
      "rawId": "x2-comp-ashgar-city",
      "name": "Ashgar City",
      "developer": "Iwan Developments",
      "city": "6th of October",
      "ppm2026": 48000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x2-comp-joulz",
      "rawId": "x2-comp-joulz",
      "name": "Joulz",
      "developer": "Inertia",
      "city": "Sheikh Zayed",
      "ppm2026": 65000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x2-comp-the-estates",
      "rawId": "x2-comp-the-estates",
      "name": "The Estates",
      "developer": "SODIC",
      "city": "New Zayed",
      "ppm2026": 85000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x2-comp-sun-capital",
      "rawId": "x2-comp-sun-capital",
      "name": "Sun Capital",
      "developer": "Arabia Holding",
      "city": "6th of October",
      "ppm2026": 42000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x2-comp-scenario",
      "rawId": "x2-comp-scenario",
      "name": "Scenario",
      "developer": "Akam Developments",
      "city": "New Administrative Capital",
      "ppm2026": 45000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x2-comp-stone-residence",
      "rawId": "x2-comp-stone-residence",
      "name": "Stone Residence",
      "developer": "ROYA Developments",
      "city": "New Cairo",
      "ppm2026": 68000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x2-comp-zed-west",
      "rawId": "x2-comp-zed-west",
      "name": "Zed West",
      "developer": "Ora Developers",
      "city": "Sheikh Zayed",
      "ppm2026": 72000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x3-comp-chillout-park",
      "rawId": "x3-comp-chillout-park",
      "name": "Mountain View Chillout Park",
      "developer": "Mountain View",
      "city": "6th of October",
      "ppm2026": 55000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x3-comp-vinci",
      "rawId": "x3-comp-vinci",
      "name": "Vinci",
      "developer": "Misr Italia",
      "city": "New Administrative Capital",
      "ppm2026": 48000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x3-comp-sodic-east",
      "rawId": "x3-comp-sodic-east",
      "name": "SODIC East",
      "developer": "SODIC",
      "city": "New Heliopolis",
      "ppm2026": 52000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x3-comp-la-vista-bay",
      "rawId": "x3-comp-la-vista-bay",
      "name": "La Vista Bay",
      "developer": "La Vista",
      "city": "North Coast",
      "ppm2026": 110000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_x3-comp-hacienda-white",
      "rawId": "x3-comp-hacienda-white",
      "name": "Hacienda White",
      "developer": "Palm Hills",
      "city": "North Coast",
      "ppm2026": 125000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "egy_modon_ras_elhekma",
      "rawId": "modon_ras_elhekma",
      "name": "Modon Ras El Hekma Master City",
      "developer": "Modon Holding",
      "city": "Ras El Hekma",
      "ppm2026": 165000,
      "rentalYieldPct": 0.085,
      "compoundFeePerM2": 66.0,
      "launchYear": 2024,
      "delivery": "2028",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Landmark Mediterranean mega-project w/ marinas & 8\u201312yr 5%-down plans.",
      "program": "offplan"
    },
    {
      "id": "egy_mazarine_alamein",
      "rawId": "mazarine_alamein",
      "name": "Mazarine Lagoons New Alamein",
      "developer": "City Edge",
      "city": "New Alamein",
      "ppm2026": 92000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 36.8,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Year-round lagoon living in New Alamein City.",
      "program": "ready"
    },
    {
      "id": "egy_latin_district_alamein",
      "rawId": "latin_district_alamein",
      "name": "The Latin District New Alamein",
      "developer": "SED / City Edge",
      "city": "New Alamein",
      "ppm2026": 68000,
      "rentalYieldPct": 0.072,
      "compoundFeePerM2": 27.2,
      "launchYear": 2021,
      "delivery": "2026",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Classical Mediterranean architecture w/ 7\u201310yr installments.",
      "program": "offplan"
    },
    {
      "id": "egy_r7_new_capital",
      "rawId": "r7_new_capital",
      "name": "R7 Diplomatic Compound",
      "developer": "New Capital Dev",
      "city": "New Admin Capital",
      "ppm2026": 48000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 19.2,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Prime R7 residential district w/ 10-year installments.",
      "program": "ready"
    },
    {
      "id": "egy_r8_green_river",
      "rawId": "r8_green_river",
      "name": "R8 Green River Residence",
      "developer": "NUCA / Private",
      "city": "New Admin Capital",
      "ppm2026": 44000,
      "rentalYieldPct": 0.068,
      "compoundFeePerM2": 17.6,
      "launchYear": 2020,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Overlooking the iconic Green River park corridor.",
      "program": "offplan"
    },
    {
      "id": "egy_bait_al_watan_nc",
      "rawId": "bait_al_watan_nc",
      "name": "Bait Al-Watan Expat District (USD)",
      "developer": "NUCA Ministry of Housing",
      "city": "New Cairo",
      "ppm2026": 42000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 16.8,
      "launchYear": 2012,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Exclusive Egyptian Expat foreign-currency allocation in New Cairo.",
      "program": "expat_only"
    },
    {
      "id": "egy_sakan_masriyeen_oct",
      "rawId": "sakan_masriyeen_oct",
      "name": "Sakan Likull Al-Masriyeen (CBE 3%/8%)",
      "developer": "SHMFF State Housing",
      "city": "New October",
      "ppm2026": 16500,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 6.6,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "State-subsidized 20\u201330yr low-interest mortgage housing for Egyptian citizens.",
      "program": "citizen_subsidy"
    },
    {
      "id": "egy_zayed_dunes_west",
      "rawId": "zayed_dunes_west",
      "name": "Sheikh Zayed New Extension",
      "developer": "ORA / SODIC",
      "city": "New Zayed",
      "ppm2026": 88000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 35.2,
      "launchYear": 2021,
      "delivery": "2027",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Low-density West Cairo villa community.",
      "program": "offplan"
    }
  ],
  "sau": [
    {
      "id": "sau_roshn_sedra",
      "rawId": "roshn_sedra",
      "name": "ROSHN Sedra",
      "developer": "ROSHN (PIF)",
      "city": "Riyadh",
      "ppm2026": 6800,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 6.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "pedestrian_walkways",
        "mosques",
        "sports_hubs",
        "saudi_architecture"
      ],
      "tag": "Landmark national mega-community under Vision 2030."
    },
    {
      "id": "sau_diriyah_residences",
      "rawId": "diriyah_residences",
      "name": "Diriyah Gate Residences",
      "developer": "DGDA",
      "city": "Riyadh",
      "ppm2026": 16500,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2021,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "najdi_architecture",
        "fine_dining",
        "museums",
        "luxury_hotels"
      ],
      "tag": "Heritage-inspired ultra-luxury at the birthplace of Saudi State."
    },
    {
      "id": "sau_shams_ar_riyadh",
      "rawId": "shams_ar_riyadh",
      "name": "Shams Ar-Riyadh",
      "developer": "Dar Al Arkan",
      "city": "Riyadh",
      "ppm2026": 7200,
      "rentalYieldPct": 0.068,
      "compoundFeePerM2": 8.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "elie_saab_interiors",
        "smart_infrastructure",
        "commercial"
      ],
      "tag": "First smart residential city with co-branded designer villas."
    },
    {
      "id": "sau_emaar_riyadh_gate",
      "rawId": "emaar_riyadh_gate",
      "name": "Emaar Riyadh Gate",
      "developer": "Emaar KSA",
      "city": "Riyadh",
      "ppm2026": 7000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 8.0,
      "launchYear": 2023,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "parks",
        "mall",
        "schools",
        "mosque",
        "security"
      ],
      "tag": "Emaar's flagship KSA community."
    },
    {
      "id": "sau_nhc_riyadh_residential",
      "rawId": "nhc_riyadh_residential",
      "name": "NHC Residential District",
      "developer": "NHC",
      "city": "Riyadh",
      "ppm2026": 5200,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 5.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "schools",
        "mosque",
        "security"
      ],
      "tag": "Government-backed affordable housing district."
    },
    {
      "id": "sau_jeddah_tower",
      "rawId": "jeddah_tower",
      "name": "Jeddah Tower Residences",
      "developer": "Dar Al Arkan",
      "city": "Jeddah",
      "ppm2026": 16000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 15.0,
      "launchYear": 2014,
      "delivery": "2027",
      "Coastal": false,
      "amenities": [
        "sea_view",
        "concierge",
        "spa",
        "gyms",
        "pool"
      ],
      "tag": "World's tallest tower (1000m) residences."
    },
    {
      "id": "sau_neom_sindalah",
      "rawId": "neom_sindalah",
      "name": "Sindalah Island Villas",
      "developer": "NEOM",
      "city": "NEOM",
      "ppm2026": 35000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 25.0,
      "launchYear": 2022,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "private_island",
        "beach",
        "golf",
        "marina",
        "spa"
      ],
      "tag": "NEOM's first luxury island destination."
    },
    {
      "id": "sau_qiddiya_residences",
      "rawId": "qiddiya_residences",
      "name": "Qiddiya Entertainment City",
      "developer": "Qiddiya",
      "city": "Riyadh",
      "ppm2026": 6500,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 8.0,
      "launchYear": 2023,
      "delivery": "2027",
      "Coastal": false,
      "amenities": [
        "theme_parks",
        "sports",
        "golf",
        "cultural_hub",
        "hotels"
      ],
      "tag": "Qiddiya Capital of Play."
    },
    {
      "id": "sau_amala_residences",
      "rawId": "amala_residences",
      "name": "AMAALA Residences",
      "developer": "AMAALA",
      "city": "AMAALA",
      "ppm2026": 28000,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 22.0,
      "launchYear": 2022,
      "delivery": "2028",
      "Coastal": false,
      "amenities": [
        "private_beach",
        "wellness_resort",
        "marina",
        "spa"
      ],
      "tag": "Wellness and arts-focused Red Sea destination."
    },
    {
      "id": "sau_riyadh_kafd",
      "rawId": "riyadh_kafd",
      "name": "KAFD Residential",
      "developer": "KAFD",
      "city": "Riyadh",
      "ppm2026": 12000,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 12.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "financial_center",
        "parks",
        "gyms",
        "pool",
        "concierge"
      ],
      "tag": "Riyadh's financial heart residential district."
    },
    {
      "id": "sau_x2-comp-nesaj-town",
      "rawId": "x2-comp-nesaj-town",
      "name": "Nesaj Town",
      "developer": "Retal Urban Development",
      "city": "Riyadh",
      "ppm2026": 9000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "sau_x2-comp-al-arous",
      "rawId": "x2-comp-al-arous",
      "name": "Al Arous",
      "developer": "ROSHN",
      "city": "Jeddah",
      "ppm2026": 8500,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2021,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "sau_x3-comp-roshn-warefa",
      "rawId": "x3-comp-roshn-warefa",
      "name": "ROSHN Warefa",
      "developer": "ROSHN",
      "city": "Riyadh",
      "ppm2026": 9500,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2022,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "sau_sakani_riyadh_north",
      "rawId": "sakani_riyadh_north",
      "name": "Sakani Subsidized Family Villa (REDF)",
      "developer": "NHC / Sakani",
      "city": "Riyadh",
      "ppm2026": 4200,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 1.7,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "150,000 SAR non-refundable state grant + subsidized mortgage for Saudi citizens 20+.",
      "program": "citizen_subsidy"
    },
    {
      "id": "sau_roshn_warefa",
      "rawId": "roshn_warefa",
      "name": "ROSHN Warefa Integrated Community",
      "developer": "ROSHN (PIF)",
      "city": "Riyadh East",
      "ppm2026": 6800,
      "rentalYieldPct": 0.072,
      "compoundFeePerM2": 2.7,
      "launchYear": 2023,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Pedestrian-friendly Salmani architecture neighborhood.",
      "program": "offplan"
    },
    {
      "id": "sau_roshn_alarous",
      "rawId": "roshn_alarous",
      "name": "ROSHN Alarous North Jeddah",
      "developer": "ROSHN (PIF)",
      "city": "Jeddah",
      "ppm2026": 6400,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 2.6,
      "launchYear": 2022,
      "delivery": "2026",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Red Sea coastal master community in North Jeddah.",
      "program": "offplan"
    },
    {
      "id": "sau_king_salman_park_res",
      "rawId": "king_salman_park_res",
      "name": "King Salman Park District Residences",
      "developer": "KSP Foundation",
      "city": "Riyadh",
      "ppm2026": 14500,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 5.8,
      "launchYear": 2023,
      "delivery": "2027",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Ultra-prime parkside towers in the heart of Riyadh.",
      "program": "offplan"
    },
    {
      "id": "sau_kafd_sky_residences",
      "rawId": "kafd_sky_residences",
      "name": "KAFD Executive Sky Residences",
      "developer": "KAFD",
      "city": "Riyadh",
      "ppm2026": 18500,
      "rentalYieldPct": 0.08,
      "compoundFeePerM2": 7.4,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "King Abdullah Financial District luxury residences (4M+ SAR qualifies for Premium Residency!).",
      "program": "ready"
    },
    {
      "id": "sau_khobar_bayfront",
      "rawId": "khobar_bayfront",
      "name": "Al Khobar Corniche Towers",
      "developer": "Retal Urban Dev",
      "city": "Khobar",
      "ppm2026": 7900,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 3.2,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Arabian Gulf seafront living in the Eastern Province.",
      "program": "ready"
    }
  ],
  "uae": [
    {
      "id": "uae_downtown_views",
      "rawId": "downtown_views",
      "name": "Downtown Views II",
      "developer": "Emaar",
      "city": "Dubai",
      "ppm2026": 28000,
      "rentalYieldPct": 0.072,
      "compoundFeePerM2": 15.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "burj_khalifa_view",
        "mall_bridge",
        "infinity_pool",
        "gym"
      ],
      "tag": "Luxury walking distance from Dubai Mall."
    },
    {
      "id": "uae_palm_jumeirah_villas",
      "rawId": "palm_jumeirah_villas",
      "name": "Palm Jumeirah Frond Villas",
      "developer": "Nakheel",
      "city": "Dubai",
      "ppm2026": 52000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 22.0,
      "launchYear": 2007,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "private_beach",
        "boat_dock",
        "security",
        "gated_frond"
      ],
      "tag": "World-famous man-made palm island villas."
    },
    {
      "id": "uae_emaar_beachfront",
      "rawId": "emaar_beachfront",
      "name": "Emaar Beachfront",
      "developer": "Emaar",
      "city": "Dubai",
      "ppm2026": 24000,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 14.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "beach",
        "marina",
        "pool",
        "gym",
        "concierge"
      ],
      "tag": "Dubai Harbour beachfront living."
    },
    {
      "id": "uae_damac_hills",
      "rawId": "damac_hills",
      "name": "DAMAC Hills",
      "developer": "DAMAC",
      "city": "Dubai",
      "ppm2026": 9500,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 8.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "golf",
        "parks",
        "pool",
        "gym",
        "schools"
      ],
      "tag": "DAMAC's flagship Trump World Golf Club community."
    },
    {
      "id": "uae_saadiyat_island",
      "rawId": "saadiyat_island",
      "name": "Saadiyat Island Residences",
      "developer": "Aldar",
      "city": "Abu Dhabi",
      "ppm2026": 18000,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 12.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "beach",
        "museums",
        "golf",
        "schools",
        "concierge"
      ],
      "tag": "Abu Dhabi's cultural island with Louvre and Guggenheim."
    },
    {
      "id": "uae_aldar_reem",
      "rawId": "aldar_reem",
      "name": "Al Reem Island Residences",
      "developer": "Aldar",
      "city": "Abu Dhabi",
      "ppm2026": 13000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 10.0,
      "launchYear": 2010,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "mall",
        "pool",
        "gym",
        "concierge"
      ],
      "tag": "Abu Dhabi's business island residential district."
    },
    {
      "id": "uae_sobha_hartland",
      "rawId": "sobha_hartland",
      "name": "Sobha Hartland",
      "developer": "Sobha",
      "city": "Dubai",
      "ppm2026": 16000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 12.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "schools",
        "parks",
        "pool",
        "gym",
        "mall"
      ],
      "tag": "Sobha's flagship master community."
    },
    {
      "id": "uae_sobha_hartland_ii",
      "rawId": "sobha_hartland_ii",
      "name": "Sobha Hartland II",
      "developer": "Sobha",
      "city": "Dubai",
      "ppm2026": 18000,
      "rentalYieldPct": 0.068,
      "compoundFeePerM2": 14.0,
      "launchYear": 2022,
      "delivery": "2026",
      "Coastal": false,
      "amenities": [
        "waterfront",
        "parks",
        "pool",
        "schools",
        "marina"
      ],
      "tag": "Sobha's newest waterfront community."
    },
    {
      "id": "uae_damac_lagoons",
      "rawId": "damac_lagoons",
      "name": "DAMAC Lagoons",
      "developer": "DAMAC",
      "city": "Dubai",
      "ppm2026": 11000,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 10.0,
      "launchYear": 2021,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "lagoons",
        "beach",
        "pool",
        "gym",
        "parks"
      ],
      "tag": "Mediterranean-themed villas with water lagoons."
    },
    {
      "id": "uae_emaar_valley_uae",
      "rawId": "emaar_valley_uae",
      "name": "Emaar The Valley",
      "developer": "Emaar",
      "city": "Dubai",
      "ppm2026": 9500,
      "rentalYieldPct": 0.075,
      "compoundFeePerM2": 8.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "pool",
        "gym",
        "schools",
        "retail"
      ],
      "tag": "Emaar's valley-side modern community."
    },
    {
      "id": "uae_aldar_yas_acres",
      "rawId": "aldar_yas_acres",
      "name": "Yas Acres",
      "developer": "Aldar",
      "city": "Abu Dhabi",
      "ppm2026": 13000,
      "rentalYieldPct": 0.068,
      "compoundFeePerM2": 10.0,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "golf",
        "beach",
        "schools",
        "mall",
        "pool"
      ],
      "tag": "Yas Island golf community."
    },
    {
      "id": "uae_nakheel_jumeirah_park",
      "rawId": "nakheel_jumeirah_park",
      "name": "Jumeirah Park Villas",
      "developer": "Nakheel",
      "city": "Dubai",
      "ppm2026": 14000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 9.0,
      "launchYear": 2010,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "schools",
        "pool",
        "gym",
        "mall"
      ],
      "tag": "Family villas in central Dubai."
    },
    {
      "id": "uae_x2-comp-emaar-south",
      "rawId": "x2-comp-emaar-south",
      "name": "Emaar South",
      "developer": "Emaar",
      "city": "Dubai",
      "ppm2026": 16000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 12.0,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "uae_x2-comp-tilal-al-ghaf",
      "rawId": "x2-comp-tilal-al-ghaf",
      "name": "Tilal Al Ghaf",
      "developer": "Majid Al Futtaim",
      "city": "Dubai",
      "ppm2026": 20000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "uae_x2-comp-damac-hills-2",
      "rawId": "x2-comp-damac-hills-2",
      "name": "DAMAC Hills 2",
      "developer": "DAMAC",
      "city": "Dubai",
      "ppm2026": 13000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 12.0,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "uae_x2-comp-mudon",
      "rawId": "x2-comp-mudon",
      "name": "Mudon",
      "developer": "Dubai Properties",
      "city": "Dubai",
      "ppm2026": 15000,
      "rentalYieldPct": 0.07,
      "compoundFeePerM2": 12.0,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "uae_x2-comp-saadiyat-lagoons",
      "rawId": "x2-comp-saadiyat-lagoons",
      "name": "Saadiyat Lagoons",
      "developer": "Aldar",
      "city": "Abu Dhabi",
      "ppm2026": 22000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 2023,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "uae_x3-comp-sustainable-city",
      "rawId": "x3-comp-sustainable-city",
      "name": "The Sustainable City",
      "developer": "Diamond Developers",
      "city": "Dubai",
      "ppm2026": 18000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "uae_x3-comp-dubai-hills",
      "rawId": "x3-comp-dubai-hills",
      "name": "Dubai Hills Estate",
      "developer": "Emaar",
      "city": "Dubai",
      "ppm2026": 20000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 12.0,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "uae_x3-comp-jumeirah-golf",
      "rawId": "x3-comp-jumeirah-golf",
      "name": "Jumeirah Golf Estates",
      "developer": "Jumeirah Golf Estates",
      "city": "Dubai",
      "ppm2026": 22000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 2009,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "uae_szhp_emirati_villa",
      "rawId": "szhp_emirati_villa",
      "name": "Sheikh Zayed Housing National Villa",
      "developer": "SZHP Federal",
      "city": "Abu Dhabi / Sharjah",
      "ppm2026": 5500,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 2.2,
      "launchYear": 2000,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Federal housing grant & interest-free loan program for Emirati citizens.",
      "program": "citizen_subsidy"
    },
    {
      "id": "uae_dubai_hills_estate",
      "rawId": "dubai_hills_estate",
      "name": "Dubai Hills Estate Parkside",
      "developer": "Emaar",
      "city": "Dubai",
      "ppm2026": 24500,
      "rentalYieldPct": 0.076,
      "compoundFeePerM2": 9.8,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Championship golf & mall master community (2M+ AED unlocks 10-Yr Golden Visa!).",
      "program": "ready"
    },
    {
      "id": "uae_dubai_creek_harbour",
      "rawId": "dubai_creek_harbour",
      "name": "Dubai Creek Harbour Lagoon Tower",
      "developer": "Emaar",
      "city": "Dubai",
      "ppm2026": 26000,
      "rentalYieldPct": 0.078,
      "compoundFeePerM2": 10.4,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Waterfront skyline towers overlooking Ras Al Khor sanctuary.",
      "program": "ready"
    },
    {
      "id": "uae_saadiyat_cultural",
      "rawId": "saadiyat_cultural",
      "name": "Saadiyat Cultural District Residences",
      "developer": "Aldar",
      "city": "Abu Dhabi",
      "ppm2026": 29500,
      "rentalYieldPct": 0.072,
      "compoundFeePerM2": 11.8,
      "launchYear": 2019,
      "delivery": "2026",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Steps from Louvre Abu Dhabi & white-sand Saadiyat beach.",
      "program": "offplan"
    },
    {
      "id": "uae_yas_acres_golf",
      "rawId": "yas_acres_golf",
      "name": "Yas Acres Family Villas",
      "developer": "Aldar",
      "city": "Abu Dhabi",
      "ppm2026": 18500,
      "rentalYieldPct": 0.074,
      "compoundFeePerM2": 7.4,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Family villa & townhouse community on Yas Island.",
      "program": "ready"
    },
    {
      "id": "uae_palm_jebel_ali",
      "rawId": "palm_jebel_ali",
      "name": "Palm Jebel Ali Frond Villas",
      "developer": "Nakheel",
      "city": "Dubai",
      "ppm2026": 38000,
      "rentalYieldPct": 0.082,
      "compoundFeePerM2": 15.2,
      "launchYear": 2023,
      "delivery": "2028",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Next-generation waterfront luxury island.",
      "program": "offplan"
    }
  ],
  "gbr": [
    {
      "id": "gbr_one_hyde_park",
      "rawId": "one_hyde_park",
      "name": "One Hyde Park",
      "developer": "Candy & Candy",
      "city": "London",
      "ppm2026": 75000,
      "rentalYieldPct": 0.025,
      "compoundFeePerM2": 8.0,
      "launchYear": 2011,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "concierge",
        "spa",
        "pool",
        "gym",
        "mandarin_oriental"
      ],
      "tag": "The world's most expensive residential address."
    },
    {
      "id": "gbr_battersea_power",
      "rawId": "battersea_power",
      "name": "Battersea Power Station",
      "developer": "BPSDC",
      "city": "London",
      "ppm2026": 18000,
      "rentalYieldPct": 0.035,
      "compoundFeePerM2": 5.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "shopping",
        "tube",
        "gym",
        "concierge"
      ],
      "tag": "Grade II listed power station converted to luxury living."
    },
    {
      "id": "gbr_nine_elms",
      "rawId": "nine_elms",
      "name": "Nine Elms Park",
      "developer": "Berkeley",
      "city": "London",
      "ppm2026": 15000,
      "rentalYieldPct": 0.035,
      "compoundFeePerM2": 4.5,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "park",
        "tube",
        "gym",
        "concierge"
      ],
      "tag": "Thames-side park residential."
    },
    {
      "id": "gbr_chelsea_barracks",
      "rawId": "chelsea_barracks",
      "name": "Chelsea Barracks",
      "developer": "Qatari Diar",
      "city": "London",
      "ppm2026": 55000,
      "rentalYieldPct": 0.025,
      "compoundFeePerM2": 7.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "gardens",
        "spa",
        "concierge",
        "gym",
        "private_club"
      ],
      "tag": "Belgravia's most exclusive new residential quarter."
    },
    {
      "id": "gbr_southbank_place",
      "rawId": "southbank_place",
      "name": "Southbank Place",
      "developer": "Qatari Diar / Canary Wharf",
      "city": "London",
      "ppm2026": 21000,
      "rentalYieldPct": 0.032,
      "compoundFeePerM2": 5.5,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "river_views",
        "gym",
        "pool",
        "concierge",
        "dining"
      ],
      "tag": "South Bank riverside luxury with London Eye views."
    },
    {
      "id": "gbr_deansgate_square",
      "rawId": "deansgate_square",
      "name": "Deansgate Square",
      "developer": "Renaker",
      "city": "Manchester",
      "ppm2026": 5400,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 3.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "gym",
        "pool",
        "concierge",
        "parks"
      ],
      "tag": "Manchester's tallest residential towers."
    },
    {
      "id": "gbr_elizabeth_tower",
      "rawId": "elizabeth_tower",
      "name": "Elizabeth Tower",
      "developer": "Renaker",
      "city": "Manchester",
      "ppm2026": 6000,
      "rentalYieldPct": 0.048,
      "compoundFeePerM2": 3.0,
      "launchYear": 2021,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "gym",
        "pool",
        "concierge",
        "sky_garden"
      ],
      "tag": "Manchester's newest landmark tower."
    },
    {
      "id": "gbr_edinburgh_quarter_mile",
      "rawId": "edinburgh_quarter_mile",
      "name": "Edinburgh Quartermile",
      "developer": "Gladedale",
      "city": "Edinburgh",
      "ppm2026": 6800,
      "rentalYieldPct": 0.04,
      "compoundFeePerM2": 2.5,
      "launchYear": 2012,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gym",
        "concierge"
      ],
      "tag": "Edinburgh's most successful new residential quarter."
    },
    {
      "id": "gbr_x2-comp-barking-riverside",
      "rawId": "x2-comp-barking-riverside",
      "name": "Barking Riverside",
      "developer": "Barking Riverside Ltd",
      "city": "London",
      "ppm2026": 6500,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "gbr_x2-comp-greenwich-peninsula",
      "rawId": "x2-comp-greenwich-peninsula",
      "name": "Greenwich Peninsula",
      "developer": "Knight Dragon",
      "city": "London",
      "ppm2026": 11000,
      "rentalYieldPct": 0.04,
      "compoundFeePerM2": 12.0,
      "launchYear": 2000,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "gbr_x2-comp-royal-wharf",
      "rawId": "x2-comp-royal-wharf",
      "name": "Royal Wharf",
      "developer": "Ballymore / Oxley",
      "city": "London",
      "ppm2026": 9500,
      "rentalYieldPct": 0.04,
      "compoundFeePerM2": 12.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "gbr_x2-comp-kidbrooke-village",
      "rawId": "x2-comp-kidbrooke-village",
      "name": "Kidbrooke Village",
      "developer": "Berkeley Group",
      "city": "London",
      "ppm2026": 7500,
      "rentalYieldPct": 0.04,
      "compoundFeePerM2": 12.0,
      "launchYear": 2009,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "gbr_x3-comp-elephant-park",
      "rawId": "x3-comp-elephant-park",
      "name": "Elephant Park",
      "developer": "Lendlease",
      "city": "London",
      "ppm2026": 11000,
      "rentalYieldPct": 0.04,
      "compoundFeePerM2": 12.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "gbr_x3-comp-kings-cross",
      "rawId": "x3-comp-kings-cross",
      "name": "King's Cross",
      "developer": "Argent",
      "city": "London",
      "ppm2026": 13000,
      "rentalYieldPct": 0.04,
      "compoundFeePerM2": 12.0,
      "launchYear": 2008,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "gbr_ancoat_mills",
      "rawId": "ancoat_mills",
      "name": "Ancoats Urban Quarter",
      "developer": "Manchester Life",
      "city": "Manchester",
      "ppm2026": 4800,
      "rentalYieldPct": 0.062,
      "compoundFeePerM2": 1.9,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Converted red-brick canal district in central Manchester.",
      "program": "ready"
    },
    {
      "id": "gbr_edinburgh_new_town",
      "rawId": "edinburgh_new_town",
      "name": "New Town Georgian Terrace",
      "developer": "Heritage Estates",
      "city": "Edinburgh",
      "ppm2026": 6200,
      "rentalYieldPct": 0.052,
      "compoundFeePerM2": 2.5,
      "launchYear": 1960,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Classic stone residence in central Edinburgh.",
      "program": "ready"
    }
  ],
  "usa": [
    {
      "id": "usa_hudson_yards",
      "rawId": "hudson_yards",
      "name": "Hudson Yards Residences",
      "developer": "Related",
      "city": "New York",
      "ppm2026": 32000,
      "rentalYieldPct": 0.042,
      "compoundFeePerM2": 3.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "equinox_club",
        "private_dining",
        "vessel_views",
        "doorman",
        "wine_cellar"
      ],
      "tag": "Manhattan's most ambitious modern high-rise development."
    },
    {
      "id": "usa_brickell_city_centre",
      "rawId": "brickell_city_centre",
      "name": "Reach & Rise Brickell",
      "developer": "Swire",
      "city": "Miami",
      "ppm2026": 12500,
      "rentalYieldPct": 0.065,
      "compoundFeePerM2": 2.5,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "deck",
        "concierge",
        "fitness",
        "valet",
        "mall_access"
      ],
      "tag": "Luxury living above Miami's top retail hub."
    },
    {
      "id": "usa_estates_at_westwood",
      "rawId": "estates_at_westwood",
      "name": "The Estates at Westwood",
      "developer": "Toll",
      "city": "Austin",
      "ppm2026": 5200,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 1.5,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "gated",
        "tennis",
        "pool",
        "schools"
      ],
      "tag": "Exclusive suburban estate homes in Austin tech corridor."
    },
    {
      "id": "usa_porsche_design_tower",
      "rawId": "porsche_design_tower",
      "name": "Porsche Design Tower",
      "developer": "Dezer",
      "city": "Miami",
      "ppm2026": 25000,
      "rentalYieldPct": 0.055,
      "compoundFeePerM2": 5.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "car_elevator",
        "plunge_pool",
        "oceanfront",
        "spa"
      ],
      "tag": "Oceanfront condo with car elevator to sky garage."
    },
    {
      "id": "usa_wolf_point",
      "rawId": "wolf_point",
      "name": "Wolf Point East",
      "developer": "Hines",
      "city": "Chicago",
      "ppm2026": 8000,
      "rentalYieldPct": 0.055,
      "compoundFeePerM2": 2.5,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "club",
        "riverwalk"
      ],
      "tag": "Riverfront luxury tower."
    },
    {
      "id": "usa_the_century",
      "rawId": "the_century",
      "name": "The Century",
      "developer": "Related",
      "city": "Los Angeles",
      "ppm2026": 20000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 4.0,
      "launchYear": 2009,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "spa",
        "dining"
      ],
      "tag": "Iconic LA landmark residences by Robert A.M. Stern."
    },
    {
      "id": "usa_the_independent",
      "rawId": "the_independent",
      "name": "The Independent",
      "developer": "Aspen",
      "city": "Austin",
      "ppm2026": 9000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 2.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "club"
      ],
      "tag": "Austin skyline icon, tallest residential tower."
    },
    {
      "id": "usa_44_east_ave",
      "rawId": "44_east_ave",
      "name": "44 East Ave",
      "developer": "Intracorp",
      "city": "Austin",
      "ppm2026": 8000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 2.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "club"
      ],
      "tag": "Rainey Street district luxury."
    },
    {
      "id": "usa_spire_seattle",
      "rawId": "spire_seattle",
      "name": "Spire",
      "developer": "Laconia",
      "city": "Seattle",
      "ppm2026": 9000,
      "rentalYieldPct": 0.052,
      "compoundFeePerM2": 2.5,
      "launchYear": 2021,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "gyms",
        "pool",
        "club"
      ],
      "tag": "Belltown luxury high-rise."
    },
    {
      "id": "usa_millennium_tower",
      "rawId": "millennium_tower",
      "name": "Millennium Tower",
      "developer": "Tishman Speyer",
      "city": "San Francisco",
      "ppm2026": 18000,
      "rentalYieldPct": 0.045,
      "compoundFeePerM2": 4.0,
      "launchYear": 2009,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "concierge"
      ],
      "tag": "Iconic San Francisco skyline residential tower."
    },
    {
      "id": "usa_the_pierce",
      "rawId": "the_pierce",
      "name": "The Pierce",
      "developer": "Toll",
      "city": "Boston",
      "ppm2026": 14000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 3.0,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "concierge"
      ],
      "tag": "Boston Fenway luxury high-rise."
    },
    {
      "id": "usa_the_post_oak",
      "rawId": "the_post_oak",
      "name": "The Post Oak",
      "developer": "Hines",
      "city": "Houston",
      "ppm2026": 9000,
      "rentalYieldPct": 0.055,
      "compoundFeePerM2": 2.5,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "spa"
      ],
      "tag": "Uptown Houston luxury tower."
    },
    {
      "id": "usa_optima_camelview",
      "rawId": "optima_camelview",
      "name": "Optima Camelview Village",
      "developer": "Optima",
      "city": "Scottsdale",
      "ppm2026": 6500,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 2.0,
      "launchYear": 2008,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "pool",
        "gyms",
        "desert_garden"
      ],
      "tag": "Desert-modern Scottsdale village."
    },
    {
      "id": "usa_the_atlantic",
      "rawId": "the_atlantic",
      "name": "The Atlantic",
      "developer": "Toll",
      "city": "Atlanta",
      "ppm2026": 8000,
      "rentalYieldPct": 0.052,
      "compoundFeePerM2": 2.0,
      "launchYear": 2010,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "mall_access"
      ],
      "tag": "Atlantic Station luxury in Midtown Atlanta."
    },
    {
      "id": "usa_the_kare",
      "rawId": "the_kare",
      "name": "The Kar\u00e9",
      "developer": "Toll",
      "city": "Dallas",
      "ppm2026": 7500,
      "rentalYieldPct": 0.052,
      "compoundFeePerM2": 2.0,
      "launchYear": 2022,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "gyms",
        "pool",
        "concierge",
        "dining"
      ],
      "tag": "New Uptown Dallas luxury residential."
    },
    {
      "id": "usa_the_coloradan",
      "rawId": "the_coloradan",
      "name": "The Coloradan",
      "developer": "East West Partners",
      "city": "Denver",
      "ppm2026": 9000,
      "rentalYieldPct": 0.052,
      "compoundFeePerM2": 2.5,
      "launchYear": 2019,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gyms",
        "pool",
        "dining",
        "concierge"
      ],
      "tag": "Denver LoDo luxury above Union Station."
    },
    {
      "id": "usa_echo_brickell",
      "rawId": "echo_brickell",
      "name": "Echo Brickell",
      "developer": "PMG",
      "city": "Miami",
      "ppm2026": 16000,
      "rentalYieldPct": 0.06,
      "compoundFeePerM2": 4.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "oceanfront",
        "gyms",
        "pool",
        "spa"
      ],
      "tag": "Carlos Ott designed Miami tower."
    },
    {
      "id": "usa_aston_martin_residences",
      "rawId": "aston_martin_residences",
      "name": "Aston Martin Residences",
      "developer": "G&G Business",
      "city": "Miami",
      "ppm2026": 18000,
      "rentalYieldPct": 0.055,
      "compoundFeePerM2": 5.0,
      "launchYear": 2023,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "oceanfront",
        "spa",
        "gyms",
        "pool",
        "concierge"
      ],
      "tag": "Aston Martin branded luxury Miami tower."
    },
    {
      "id": "usa_x2-comp-daybreak",
      "rawId": "x2-comp-daybreak",
      "name": "Daybreak",
      "developer": "Daybreak Communities",
      "city": "South Jordan",
      "ppm2026": 4500,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 2004,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "usa_x2-comp-bridgeland",
      "rawId": "x2-comp-bridgeland",
      "name": "Bridgeland",
      "developer": "Howard Hughes",
      "city": "Cypress",
      "ppm2026": 5000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 2006,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "usa_x3-comp-summerlin",
      "rawId": "x3-comp-summerlin",
      "name": "Summerlin",
      "developer": "Howard Hughes",
      "city": "Las Vegas",
      "ppm2026": 5500,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 1990,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "usa_x3-comp-celebration",
      "rawId": "x3-comp-celebration",
      "name": "Celebration",
      "developer": "Disney",
      "city": "Kissimmee",
      "ppm2026": 5000,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 12.0,
      "launchYear": 1996,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "clubhouse"
      ],
      "tag": ""
    },
    {
      "id": "usa_austin_domain",
      "rawId": "austin_domain",
      "name": "Domain Northside Tech Lofts",
      "developer": "Endeavor",
      "city": "Austin",
      "ppm2026": 5400,
      "rentalYieldPct": 0.058,
      "compoundFeePerM2": 2.2,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Walkable Austin tech-corridor residences.",
      "program": "ready"
    },
    {
      "id": "usa_brooklyn_park_slope",
      "rawId": "brooklyn_park_slope",
      "name": "Park Slope Brownstone",
      "developer": "NYC Historic",
      "city": "New York",
      "ppm2026": 13500,
      "rentalYieldPct": 0.045,
      "compoundFeePerM2": 5.4,
      "launchYear": 1960,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Classic tree-lined Brooklyn brownstone.",
      "program": "ready"
    },
    {
      "id": "usa_irvine_spectrum",
      "rawId": "irvine_spectrum",
      "name": "Irvine Great Park Neighborhoods",
      "developer": "FivePoint",
      "city": "California",
      "ppm2026": 8200,
      "rentalYieldPct": 0.05,
      "compoundFeePerM2": 3.3,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Top-school-district family homes in Southern California.",
      "program": "ready"
    }
  ],
  "deu": [
    {
      "id": "deu_upper_west_berlin",
      "rawId": "upper_west_berlin",
      "name": "Upper West",
      "developer": "Various",
      "city": "Berlin",
      "ppm2026": 11000,
      "rentalYieldPct": 0.03,
      "compoundFeePerM2": 3.0,
      "launchYear": 2017,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "gym",
        "pool",
        "concierge",
        "parks"
      ],
      "tag": "Berlin's Charlottenburg luxury tower."
    },
    {
      "id": "deu_eden_tower",
      "rawId": "eden_tower",
      "name": "Eden Tower",
      "developer": "Vivion",
      "city": "Frankfurt",
      "ppm2026": 13000,
      "rentalYieldPct": 0.03,
      "compoundFeePerM2": 3.5,
      "launchYear": 2021,
      "delivery": "2024",
      "Coastal": false,
      "amenities": [
        "gym",
        "pool",
        "concierge",
        "sky_garden"
      ],
      "tag": "Frankfurt's tallest residential skyscraper."
    },
    {
      "id": "deu_bavaria_park",
      "rawId": "bavaria_park",
      "name": "Bavaria Park Quartier",
      "developer": "Instone",
      "city": "Munich",
      "ppm2026": 14000,
      "rentalYieldPct": 0.028,
      "compoundFeePerM2": 3.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "parks",
        "gym",
        "schools",
        "pool"
      ],
      "tag": "Munich sustainable gated park living."
    },
    {
      "id": "deu_hafen_city",
      "rawId": "hafen_city",
      "name": "HafenCity",
      "developer": "Various",
      "city": "Hamburg",
      "ppm2026": 11500,
      "rentalYieldPct": 0.03,
      "compoundFeePerM2": 2.5,
      "launchYear": 2010,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "waterfront",
        "parks",
        "gym",
        "schools"
      ],
      "tag": "Hamburg's waterfront urban redevelopment district."
    },
    {
      "id": "deu_hafencity_hamburg",
      "rawId": "hafencity_hamburg",
      "name": "HafenCity Elbphilharmonie Quarter",
      "developer": "HafenCity GmbH",
      "city": "Hamburg",
      "ppm2026": 8900,
      "rentalYieldPct": 0.042,
      "compoundFeePerM2": 3.6,
      "launchYear": 2008,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Europe's largest inner-city waterfront regeneration.",
      "program": "ready"
    },
    {
      "id": "deu_schwabing_munich",
      "rawId": "schwabing_munich",
      "name": "Schwabing Classic Altbau",
      "developer": "Bavaria Estates",
      "city": "Munich",
      "ppm2026": 10800,
      "rentalYieldPct": 0.038,
      "compoundFeePerM2": 4.3,
      "launchYear": 1960,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Leafy central Munich residence near Englischer Garten.",
      "program": "ready"
    },
    {
      "id": "deu_prenzlauer_berg",
      "rawId": "prenzlauer_berg",
      "name": "Prenzlauer Berg Courtyard Residence",
      "developer": "Berlin Wohnbau",
      "city": "Berlin",
      "ppm2026": 6600,
      "rentalYieldPct": 0.044,
      "compoundFeePerM2": 2.6,
      "launchYear": 1960,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Restored courtyard apartment in vibrant Berlin.",
      "program": "ready"
    }
  ],
  "can": [
    {
      "id": "can_the_one_toronto",
      "rawId": "the_one_toronto",
      "name": "The One",
      "developer": "Mizrahi",
      "city": "Toronto",
      "ppm2026": 16000,
      "rentalYieldPct": 0.035,
      "compoundFeePerM2": 3.0,
      "launchYear": 2017,
      "delivery": "2025",
      "Coastal": false,
      "amenities": [
        "concierge",
        "gym",
        "pool",
        "spa"
      ],
      "tag": "Canada's tallest residential tower in Yorkville."
    },
    {
      "id": "can_vancouver_house",
      "rawId": "vancouver_house",
      "name": "Vancouver House",
      "developer": "Westbank",
      "city": "Vancouver",
      "ppm2026": 14000,
      "rentalYieldPct": 0.032,
      "compoundFeePerM2": 3.0,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "concierge",
        "gym",
        "pool",
        "ocean_view"
      ],
      "tag": "Bjarke Ingels-designed Vancouver landmark."
    },
    {
      "id": "can_shangri_la_toronto",
      "rawId": "shangri_la_toronto",
      "name": "Shangri-La Toronto",
      "developer": "Westbank",
      "city": "Toronto",
      "ppm2026": 13000,
      "rentalYieldPct": 0.035,
      "compoundFeePerM2": 3.5,
      "launchYear": 2012,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "concierge",
        "spa",
        "pool",
        "gym"
      ],
      "tag": "Shangri-La branded luxury residences."
    },
    {
      "id": "can_montreal_quartier",
      "rawId": "montreal_quartier",
      "name": "Quartier des Spectacles",
      "developer": "Various",
      "city": "Montreal",
      "ppm2026": 8000,
      "rentalYieldPct": 0.04,
      "compoundFeePerM2": 2.0,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "gym",
        "pool",
        "concierge",
        "parks"
      ],
      "tag": "Montreal's cultural district living."
    },
    {
      "id": "can_waterfront_toronto",
      "rawId": "waterfront_toronto",
      "name": "Harbourfront Queens Quay",
      "developer": "Tridel",
      "city": "Toronto",
      "ppm2026": 11200,
      "rentalYieldPct": 0.048,
      "compoundFeePerM2": 4.5,
      "launchYear": 2010,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Lake Ontario waterfront high-rise living.",
      "program": "ready"
    },
    {
      "id": "can_coal_harbour_van",
      "rawId": "coal_harbour_van",
      "name": "Coal Harbour Mountain-View Tower",
      "developer": "Westbank",
      "city": "Vancouver",
      "ppm2026": 14800,
      "rentalYieldPct": 0.044,
      "compoundFeePerM2": 5.9,
      "launchYear": 2006,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Stanley Park & harbour views in downtown Vancouver.",
      "program": "ready"
    }
  ],
  "aus": [
    {
      "id": "aus_barangaroo_sydney",
      "rawId": "barangaroo_sydney",
      "name": "Barangaroo Harbour Residences",
      "developer": "Lendlease",
      "city": "Sydney",
      "ppm2026": 18500,
      "rentalYieldPct": 0.045,
      "compoundFeePerM2": 7.4,
      "launchYear": 2016,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Sydney Harbour architectural waterfront.",
      "program": "ready"
    },
    {
      "id": "aus_south_yarra_melb",
      "rawId": "south_yarra_melb",
      "name": "South Yarra Botanical Terraces",
      "developer": "Mirvac",
      "city": "Melbourne",
      "ppm2026": 10500,
      "rentalYieldPct": 0.048,
      "compoundFeePerM2": 4.2,
      "launchYear": 1980,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Walkable Melbourne suburb beside the Yarra.",
      "program": "ready"
    }
  ],
  "nld": [
    {
      "id": "nld_zuidas_amsterdam",
      "rawId": "zuidas_amsterdam",
      "name": "Zuidas Canal & Park Residences",
      "developer": "AM Development",
      "city": "Amsterdam",
      "ppm2026": 8800,
      "rentalYieldPct": 0.046,
      "compoundFeePerM2": 3.5,
      "launchYear": 2012,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Modern energy-A+ residences in Amsterdam South.",
      "program": "ready"
    }
  ],
  "fra": [
    {
      "id": "fra_boulogne_seine",
      "rawId": "boulogne_seine",
      "name": "Rives de Seine Eco-Quarter",
      "developer": "Bouygues Immobilier",
      "city": "Paris",
      "ppm2026": 10200,
      "rentalYieldPct": 0.042,
      "compoundFeePerM2": 4.1,
      "launchYear": 2013,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Seine-side family apartments bordering Paris.",
      "program": "ready"
    }
  ],
  "jpn": [
    {
      "id": "jpn_minato_azabudai",
      "rawId": "minato_azabudai",
      "name": "Minato-ku Tower Mansion",
      "developer": "Mori Building",
      "city": "Tokyo",
      "ppm2026": 1850000,
      "rentalYieldPct": 0.04,
      "compoundFeePerM2": 740.0,
      "launchYear": 2005,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Earthquake-damped high-rise tower mansion in central Tokyo.",
      "program": "ready"
    }
  ],
  "ita": [
    {
      "id": "ita_porta_nuova_milan",
      "rawId": "porta_nuova_milan",
      "name": "Porta Nuova Bosco District",
      "developer": "COIMA",
      "city": "Milan",
      "ppm2026": 8600,
      "rentalYieldPct": 0.046,
      "compoundFeePerM2": 3.4,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Contemporary green vertical living in Milan.",
      "program": "ready"
    }
  ],
  "sgp": [
    {
      "id": "sgp_tampines_ec",
      "rawId": "tampines_ec",
      "name": "HDB / Executive Condominium",
      "developer": "CDL / HDB",
      "city": "Singapore",
      "ppm2026": 14500,
      "rentalYieldPct": 0.048,
      "compoundFeePerM2": 5.8,
      "launchYear": 1980,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Singapore's iconic integrated MRT-linked residential hub.",
      "program": "ready"
    },
    {
      "id": "sgp_marina_bay_res",
      "rawId": "marina_bay_res",
      "name": "Marina Bay Waterfront Suites",
      "developer": "Keppel / CapitaLand",
      "city": "Singapore",
      "ppm2026": 29000,
      "rentalYieldPct": 0.042,
      "compoundFeePerM2": 11.6,
      "launchYear": 2012,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Prime Marina Bay skyline luxury.",
      "program": "ready"
    }
  ],
  "bra": [
    {
      "id": "bra_itaim_bibi_sp",
      "rawId": "itaim_bibi_sp",
      "name": "Itaim Bibi Jardins Condominium",
      "developer": "Cyrela",
      "city": "S\u00e3o Paulo",
      "ppm2026": 18500,
      "rentalYieldPct": 0.062,
      "compoundFeePerM2": 7.4,
      "launchYear": 1985,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Gated 24h-concierge tower in S\u00e3o Paulo's financial heart.",
      "program": "ready"
    }
  ],
  "ind": [
    {
      "id": "ind_whitefield_blr",
      "rawId": "whitefield_blr",
      "name": "Prestige Lakeside Habitat",
      "developer": "Prestige Group",
      "city": "Bengaluru",
      "ppm2026": 115000,
      "rentalYieldPct": 0.055,
      "compoundFeePerM2": 46.0,
      "launchYear": 2015,
      "delivery": "ready",
      "Coastal": false,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Integrated IT-corridor township in Bengaluru.",
      "program": "ready"
    },
    {
      "id": "ind_bandra_west_mum",
      "rawId": "bandra_west_mum",
      "name": "Bandra Sea-Breeze Residency",
      "developer": "Lodha / Godrej",
      "city": "Mumbai",
      "ppm2026": 380000,
      "rentalYieldPct": 0.045,
      "compoundFeePerM2": 152.0,
      "launchYear": 1995,
      "delivery": "ready",
      "Coastal": true,
      "amenities": [
        "security",
        "parks",
        "clubhouse"
      ],
      "tag": "Upscale coastal Mumbai apartments.",
      "program": "ready"
    }
  ],
  "che": [
    {
      "id": "che_greencity_zurich",
      "rawId": "greencity_zurich",
      "name": "Greencity Zürich",
      "developer": "Losinger Marazzi",
      "city": "Zurich",
      "ppm2026": 18500,
      "rentalYieldPct": 0.032,
      "compoundFeePerM2": 6.5,
      "launchYear": 2013,
      "delivery": "ready",
      "Coastal": false,
      "amenities": ["security", "parks", "clubhouse"],
      "tag": "Zurich South's car-free sustainable quarter."
    },
    {
      "id": "che_circle_airport",
      "rawId": "circle_airport",
      "name": "The Circle",
      "developer": "Flughafen Zürich AG",
      "city": "Zurich",
      "ppm2026": 22000,
      "rentalYieldPct": 0.03,
      "compoundFeePerM2": 8,
      "launchYear": 2020,
      "delivery": "ready",
      "Coastal": false,
      "amenities": ["security", "parks", "clubhouse", "metro_link"],
      "tag": "Offices, hotels and homes at Zurich Airport."
    },
    {
      "id": "che_les_vergers",
      "rawId": "les_vergers",
      "name": "Les Vergers",
      "developer": "Etat de Genève",
      "city": "Meyrin",
      "ppm2026": 14500,
      "rentalYieldPct": 0.032,
      "compoundFeePerM2": 5,
      "launchYear": 2018,
      "delivery": "ready",
      "Coastal": false,
      "amenities": ["schools", "parks", "security"],
      "tag": "Geneva's eco-district at Meyrin."
    }
  ],
  "swe": [
    {
      "id": "swe_hammarby",
      "rawId": "hammarby",
      "name": "Hammarby Sjöstad",
      "developer": "Stockholm City",
      "city": "Stockholm",
      "ppm2026": 105000,
      "rentalYieldPct": 0.028,
      "compoundFeePerM2": 45,
      "launchYear": 1995,
      "delivery": "ready",
      "Coastal": true,
      "amenities": ["parks", "clubhouse", "security"],
      "tag": "Stockholm's waterfront eco-city district."
    },
    {
      "id": "swe_norra_djurgard",
      "rawId": "norra_djurgard",
      "name": "Norra Djurgårdsstaden",
      "developer": "Stockholm City",
      "city": "Stockholm",
      "ppm2026": 115000,
      "rentalYieldPct": 0.027,
      "compoundFeePerM2": 50,
      "launchYear": 2010,
      "delivery": "ready",
      "Coastal": true,
      "amenities": ["parks", "schools", "security"],
      "tag": "Royal Seaport — Stockholm's newest sustainable quarter."
    },
    {
      "id": "swe_vastra_hamnen",
      "rawId": "vastra_hamnen",
      "name": "Västra Hamnen",
      "developer": "Malmö City",
      "city": "Malmö",
      "ppm2026": 75000,
      "rentalYieldPct": 0.03,
      "compoundFeePerM2": 40,
      "launchYear": 2001,
      "delivery": "ready",
      "Coastal": true,
      "amenities": ["parks", "clubhouse", "security"],
      "tag": "Malmö's harbour-front redevelopment, home of the Turning Torso."
    }
  ],
  "tur": [
    {
      "id": "tur_maslak1453",
      "rawId": "maslak1453",
      "name": "Maslak 1453",
      "developer": "Ağaoğlu",
      "city": "Istanbul",
      "ppm2026": 220000,
      "rentalYieldPct": 0.035,
      "compoundFeePerM2": 120,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": ["malls", "schools", "security", "sports_club"],
      "tag": "Istanbul's vast Maslak mega-project."
    },
    {
      "id": "tur_vadistanbul",
      "rawId": "vadistanbul",
      "name": "Vadistanbul",
      "developer": "Artaş Group",
      "city": "Istanbul",
      "ppm2026": 260000,
      "rentalYieldPct": 0.033,
      "compoundFeePerM2": 150,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": false,
      "amenities": ["malls", "parks", "security"],
      "tag": "Forest-side towers above the Sarıyer valley."
    },
    {
      "id": "tur_folkart",
      "rawId": "folkart",
      "name": "Folkart Towers",
      "developer": "Folkart",
      "city": "Izmir",
      "ppm2026": 150000,
      "rentalYieldPct": 0.035,
      "compoundFeePerM2": 100,
      "launchYear": 2014,
      "delivery": "ready",
      "Coastal": true,
      "amenities": ["security", "parks", "clubhouse"],
      "tag": "Izmir Bay's twin-tower landmark."
    }
  ]
};
export const NEIGHBORHOODS_BY_COUNTRY = {
  "egy": [
    {
      "id": "nbh_egy_zamalek",
      "name": "Zamalek",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_garden_city",
      "name": "Garden City",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_maadi",
      "name": "Maadi",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_heliopolis",
      "name": "Heliopolis",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_nasr_city",
      "name": "Nasr City",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_mohandessin",
      "name": "Mohandessin",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_dokki",
      "name": "Dokki",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_shubra",
      "name": "Shubra",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_new_cairo",
      "name": "New Cairo",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_sheikh_zayed",
      "name": "Sheikh Zayed",
      "city": "Cairo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_smouha",
      "name": "Smouha",
      "city": "Alexandria",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_gleem",
      "name": "Gleem",
      "city": "Alexandria",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_sidi_gaber",
      "name": "Sidi Gaber",
      "city": "Alexandria",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_miami",
      "name": "Miami",
      "city": "Alexandria",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_agami",
      "name": "Agami",
      "city": "Alexandria",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_sidi_bishr",
      "name": "Sidi Bishr",
      "city": "Alexandria",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_egy_mokattam",
      "name": "Mokattam",
      "city": "Cairo",
      "ppm2026": 35000,
      "rentPpm2026": 168,
      "tier": "upscale",
      "launchYear": 1960
    }
  ],
  "sau": [
    {
      "id": "nbh_sau_riyadh_olaya",
      "name": "Al Olaya",
      "city": "Riyadh",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_sau_riyadh_malqa",
      "name": "Al Malqa",
      "city": "Riyadh",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_sau_jeddah_shati",
      "name": "Al Shati",
      "city": "Jeddah",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "uae": [
    {
      "id": "nbh_uae_dubai_marina",
      "name": "Dubai Marina",
      "city": "Dubai",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_uae_abu_dhabi_khalidiya",
      "name": "Al Khalidiyah",
      "city": "Abu Dhabi",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_uae_sharjah_al_majaz",
      "name": "Al Majaz",
      "city": "Sharjah",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_uae_jumeirah",
      "name": "Jumeirah",
      "city": "Dubai",
      "ppm2026": 18000,
      "rentPpm2026": 86,
      "tier": "standard",
      "launchYear": 1970
    },
    {
      "id": "nbh_uae_downtown_dubai",
      "name": "Downtown Dubai",
      "city": "Dubai",
      "ppm2026": 24000,
      "rentPpm2026": 115,
      "tier": "upscale",
      "launchYear": 2008
    }
  ],
  "gbr": [
    {
      "id": "nbh_gbr_birmingham_jewellery_quarter",
      "name": "Jewellery Quarter",
      "city": "Birmingham",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_gbr_bristol_bedminster",
      "name": "Bedminster",
      "city": "Bristol",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_gbr_glasgow_west_end",
      "name": "West End",
      "city": "Glasgow",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_gbr_camden",
      "name": "Camden",
      "city": "London",
      "ppm2026": 11000,
      "rentPpm2026": 53,
      "tier": "standard",
      "launchYear": 1960
    },
    {
      "id": "nbh_gbr_notting_hill",
      "name": "Notting Hill",
      "city": "London",
      "ppm2026": 16000,
      "rentPpm2026": 77,
      "tier": "standard",
      "launchYear": 1960
    },
    {
      "id": "nbh_gbr_greenwich",
      "name": "Greenwich",
      "city": "London",
      "ppm2026": 9000,
      "rentPpm2026": 43,
      "tier": "standard",
      "launchYear": 1960
    }
  ],
  "usa": [
    {
      "id": "nbh_usa_manhattan_ues",
      "name": "Upper East Side",
      "city": "New York",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_manhattan_soho",
      "name": "SoHo",
      "city": "New York",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_miami_brickell",
      "name": "Brickell",
      "city": "Miami",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_austin_downtown",
      "name": "Downtown",
      "city": "Austin",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_seattle_capitol_hill",
      "name": "Capitol Hill",
      "city": "Seattle",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_detroit_west_village",
      "name": "West Village",
      "city": "Detroit",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_cleveland_old_brooklyn",
      "name": "Old Brooklyn",
      "city": "Cleveland",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_pittsburgh_brookline",
      "name": "Brookline",
      "city": "Pittsburgh",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_indianapolis_irvington",
      "name": "Irvington",
      "city": "Indianapolis",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_columbus_clintonville",
      "name": "Clintonville",
      "city": "Columbus",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_raleigh_north_hills",
      "name": "North Hills",
      "city": "Raleigh",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_charlotte_noda",
      "name": "NoDa",
      "city": "Charlotte",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_nashville_madison",
      "name": "Madison",
      "city": "Nashville",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_tampa_seminole_heights",
      "name": "Seminole Heights",
      "city": "Tampa",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_orlando_conway",
      "name": "Conway",
      "city": "Orlando",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_jacksonville_riverside",
      "name": "Riverside",
      "city": "Jacksonville",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_minneapolis_longfellow",
      "name": "Longfellow",
      "city": "Minneapolis",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_kansas_city_brookside",
      "name": "Brookside",
      "city": "Kansas City",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_portland_lents",
      "name": "Lents",
      "city": "Portland",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_sacramento_tahoe_park",
      "name": "Tahoe Park",
      "city": "Sacramento",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_philadelphia_fishtown",
      "name": "Fishtown",
      "city": "Philadelphia",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_baltimore_canton",
      "name": "Canton",
      "city": "Baltimore",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_buffalo_elmwood",
      "name": "Elmwood Village",
      "city": "Buffalo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_albuquerque_nob_hill",
      "name": "Nob Hill",
      "city": "Albuquerque",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_las_vegas_summerlin",
      "name": "Summerlin",
      "city": "Las Vegas",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_san_antonio_alamo",
      "name": "Alamo Heights",
      "city": "San Antonio",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_boston_dorchester",
      "name": "Dorchester",
      "city": "Boston",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_dc_silver_spring",
      "name": "Silver Spring",
      "city": "Washington DC",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_oakland_temescal",
      "name": "Temescal",
      "city": "Oakland",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_san_diego_city_heights",
      "name": "City Heights",
      "city": "San Diego",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_milwaukee_bay_view",
      "name": "Bay View",
      "city": "Milwaukee",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_usa_brooklyn_heights",
      "name": "Brooklyn Heights",
      "city": "New York",
      "ppm2026": 14000,
      "rentPpm2026": 67,
      "tier": "standard",
      "launchYear": 1960
    }
  ],
  "deu": [
    {
      "id": "nbh_deu_hamburg_altona",
      "name": "Altona",
      "city": "Hamburg",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_deu_leipzig_plagwitz",
      "name": "Plagwitz",
      "city": "Leipzig",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_deu_cologne_ehrenfeld",
      "name": "Ehrenfeld",
      "city": "Cologne",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_deu_kreuzberg",
      "name": "Kreuzberg",
      "city": "Berlin",
      "ppm2026": 7000,
      "rentPpm2026": 34,
      "tier": "modest",
      "launchYear": 1960
    },
    {
      "id": "nbh_deu_charlottenburg",
      "name": "Charlottenburg",
      "city": "Berlin",
      "ppm2026": 8500,
      "rentPpm2026": 41,
      "tier": "standard",
      "launchYear": 1960
    }
  ],
  "can": [
    {
      "id": "nbh_can_calgary_kensington",
      "name": "Kensington",
      "city": "Calgary",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_can_ottawa_westboro",
      "name": "Westboro",
      "city": "Ottawa",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_can_halifax_north_end",
      "name": "North End",
      "city": "Halifax",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_can_annex",
      "name": "The Annex",
      "city": "Toronto",
      "ppm2026": 12000,
      "rentPpm2026": 58,
      "tier": "standard",
      "launchYear": 1960
    },
    {
      "id": "nbh_can_liberty_village",
      "name": "Liberty Village",
      "city": "Toronto",
      "ppm2026": 10000,
      "rentPpm2026": 48,
      "tier": "standard",
      "launchYear": 2005
    }
  ],
  "aus": [
    {
      "id": "nbh_aus_sydney_parramatta",
      "name": "Parramatta",
      "city": "Sydney",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_aus_melbourne_footscray",
      "name": "Footscray",
      "city": "Melbourne",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_aus_brisbane_woolloongabba",
      "name": "Woolloongabba",
      "city": "Brisbane",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "nld": [
    {
      "id": "nbh_nld_amsterdam_noord",
      "name": "Noord",
      "city": "Amsterdam",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_nld_rotterdam_delfshaven",
      "name": "Delfshaven",
      "city": "Rotterdam",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_nld_eindhoven_woensel",
      "name": "Woensel",
      "city": "Eindhoven",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "fra": [
    {
      "id": "nbh_fra_paris_belleville",
      "name": "Belleville",
      "city": "Paris",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_fra_lyon_villeurbanne",
      "name": "Villeurbanne",
      "city": "Lyon",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_fra_marseille_endoume",
      "name": "Endoume",
      "city": "Marseille",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "jpn": [
    {
      "id": "nbh_jpn_tokyo_katsushika",
      "name": "Katsushika",
      "city": "Tokyo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_jpn_osaka_sakai",
      "name": "Sakai",
      "city": "Osaka",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_jpn_fukuoka_hakata",
      "name": "Hakata",
      "city": "Fukuoka",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "ita": [
    {
      "id": "nbh_ita_milan_navigli",
      "name": "Navigli",
      "city": "Milan",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_ita_turin_san_salvario",
      "name": "San Salvario",
      "city": "Turin",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_ita_bologna_savena",
      "name": "Savena",
      "city": "Bologna",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "sgp": [
    {
      "id": "nbh_sgp_singapore_hougang_private",
      "name": "Hougang",
      "city": "Singapore",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_sgp_singapore_woodlands_private",
      "name": "Woodlands",
      "city": "Singapore",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_sgp_singapore_tiong_bahru_private",
      "name": "Tiong Bahru",
      "city": "Singapore",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "bra": [
    {
      "id": "nbh_bra_sao_paulo_tatuape",
      "name": "Tatuap\u00e9",
      "city": "S\u00e3o Paulo",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_bra_rio_tijuca",
      "name": "Tijuca",
      "city": "Rio de Janeiro",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_bra_curitiba_batel",
      "name": "Batel",
      "city": "Curitiba",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "ind": [
    {
      "id": "nbh_ind_mumbai_thane",
      "name": "Thane",
      "city": "Mumbai Metropolitan Region",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_ind_pune_wakad",
      "name": "Wakad",
      "city": "Pune",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_ind_hyderabad_kondapur",
      "name": "Kondapur",
      "city": "Hyderabad",
      "ppm2026": 25000,
      "rentPpm2026": 120.0,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "che": [
    {
      "id": "nbh_che_kreis4",
      "name": "Kreis 4",
      "city": "Zurich",
      "ppm2026": 16000,
      "rentPpm2026": 77,
      "tier": "standard",
      "launchYear": 1950
    },
    {
      "id": "nbh_che_seefeld",
      "name": "Seefeld",
      "city": "Zurich",
      "ppm2026": 20000,
      "rentPpm2026": 96,
      "tier": "upscale",
      "launchYear": 1950
    },
    {
      "id": "nbh_che_eaux_vives",
      "name": "Eaux-Vives",
      "city": "Geneva",
      "ppm2026": 17000,
      "rentPpm2026": 82,
      "tier": "standard",
      "launchYear": 1950
    }
  ],
  "swe": [
    {
      "id": "nbh_swe_sodermalm",
      "name": "Södermalm",
      "city": "Stockholm",
      "ppm2026": 95000,
      "rentPpm2026": 456,
      "tier": "upscale",
      "launchYear": 1950
    },
    {
      "id": "nbh_swe_ostermalm",
      "name": "Östermalm",
      "city": "Stockholm",
      "ppm2026": 120000,
      "rentPpm2026": 576,
      "tier": "upscale",
      "launchYear": 1950
    },
    {
      "id": "nbh_swe_vasastan",
      "name": "Vasastan",
      "city": "Stockholm",
      "ppm2026": 85000,
      "rentPpm2026": 408,
      "tier": "upscale",
      "launchYear": 1950
    }
  ],
  "tur": [
    {
      "id": "nbh_tur_besiktas",
      "name": "Beşiktaş",
      "city": "Istanbul",
      "ppm2026": 220000,
      "rentPpm2026": 1056,
      "tier": "upscale",
      "launchYear": 1950
    },
    {
      "id": "nbh_tur_nisantasi",
      "name": "Nişantaşı",
      "city": "Istanbul",
      "ppm2026": 260000,
      "rentPpm2026": 1248,
      "tier": "upscale",
      "launchYear": 1950
    },
    {
      "id": "nbh_tur_kadikoy",
      "name": "Kadıköy",
      "city": "Istanbul",
      "ppm2026": 180000,
      "rentPpm2026": 864,
      "tier": "upscale",
      "launchYear": 1950
    }
  ]
};
export const LAND_PLOTS = [
  {
    "id": "land_nc_5th",
    "name": "5th Settlement Plot",
    "country": "egy",
    "city": "New Cairo",
    "ppm2026": 32000,
    "minArea": 500,
    "maxArea": 1200,
    "zoning": "residential_villas",
    "launchYear": 1994
  },
  {
    "id": "land_zayed_green",
    "name": "Green Belt Land Plot",
    "country": "egy",
    "city": "Sheikh Zayed",
    "ppm2026": 24000,
    "minArea": 800,
    "maxArea": 2500,
    "zoning": "residential_villas",
    "launchYear": 2000
  },
  {
    "id": "land_sahel_bay",
    "name": "Ras El Hekma Second Line Plot",
    "country": "egy",
    "city": "North Coast",
    "ppm2026": 55000,
    "minArea": 600,
    "maxArea": 3000,
    "zoning": "resort_chalet",
    "launchYear": 1975
  },
  {
    "id": "land_sahel_front",
    "name": "Ras El Hekma First Line (Sea)",
    "country": "egy",
    "city": "North Coast",
    "ppm2026": 95000,
    "minArea": 800,
    "maxArea": 3000,
    "zoning": "resort_chalet",
    "launchYear": 1975
  },
  {
    "id": "land_oct",
    "name": "6th of October Plot",
    "country": "egy",
    "city": "6th of October",
    "ppm2026": 18000,
    "minArea": 400,
    "maxArea": 1500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_sokhna",
    "name": "Ain Sokhna Land",
    "country": "egy",
    "city": "Ain Sokhna",
    "ppm2026": 14000,
    "minArea": 500,
    "maxArea": 2000,
    "zoning": "resort_chalet",
    "launchYear": 1975
  },
  {
    "id": "land_ghardaqa",
    "name": "Hurghada Land",
    "country": "egy",
    "city": "Hurghada",
    "ppm2026": 10000,
    "minArea": 500,
    "maxArea": 2500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_marsa_alam",
    "name": "Marsa Alam Land",
    "country": "egy",
    "city": "Marsa Alam",
    "ppm2026": 6000,
    "minArea": 800,
    "maxArea": 5000,
    "zoning": "resort_chalet",
    "launchYear": 1975
  },
  {
    "id": "land_new_alamein",
    "name": "New Alamein Plot",
    "country": "egy",
    "city": "New Alamein",
    "ppm2026": 45000,
    "minArea": 500,
    "maxArea": 2500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_new_capital",
    "name": "New Capital Plot (R7)",
    "country": "egy",
    "city": "New Administrative Capital",
    "ppm2026": 22000,
    "minArea": 500,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_borg_el_arab",
    "name": "Borg El Arab Land",
    "country": "egy",
    "city": "Borg El Arab",
    "ppm2026": 8000,
    "minArea": 500,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_sadat",
    "name": "Sadat City Land",
    "country": "egy",
    "city": "Sadat City",
    "ppm2026": 6000,
    "minArea": 800,
    "maxArea": 5000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_obour",
    "name": "Obour City Land",
    "country": "egy",
    "city": "Obour",
    "ppm2026": 10000,
    "minArea": 500,
    "maxArea": 1500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_shorouk",
    "name": "El Shorouk Land",
    "country": "egy",
    "city": "El Shorouk",
    "ppm2026": 14000,
    "minArea": 500,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_badr",
    "name": "Badr City Land",
    "country": "egy",
    "city": "Badr",
    "ppm2026": 8000,
    "minArea": 500,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_10th_ramadan",
    "name": "10th of Ramadan Land",
    "country": "egy",
    "city": "10th of Ramadan",
    "ppm2026": 7000,
    "minArea": 500,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_agami",
    "name": "Agami Seafront Land",
    "country": "egy",
    "city": "Alexandria",
    "ppm2026": 38000,
    "minArea": 400,
    "maxArea": 1500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_amreya",
    "name": "Amreya Land",
    "country": "egy",
    "city": "Alexandria",
    "ppm2026": 12000,
    "minArea": 500,
    "maxArea": 3000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_smouha_alex",
    "name": "Smouha Residential Plot",
    "country": "egy",
    "city": "Alexandria / Smouha",
    "ppm2026": 90000,
    "minArea": 250,
    "maxArea": 1200,
    "zoning": "residential",
    "launchYear": 2017
  },
  {
    "id": "land_tx_austin",
    "name": "Travis County Suburban Land",
    "country": "usa",
    "city": "Austin",
    "ppm2026": 450,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_tx_rural",
    "name": "Texas Rural Land",
    "country": "usa",
    "city": "Texas",
    "ppm2026": 250,
    "minArea": 10000,
    "maxArea": 100000,
    "zoning": "rural",
    "launchYear": 1975
  },
  {
    "id": "land_fl_plot",
    "name": "Florida Residential Plot",
    "country": "usa",
    "city": "Florida",
    "ppm2026": 600,
    "minArea": 3000,
    "maxArea": 20000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_co_mountain",
    "name": "Colorado Mountain Plot",
    "country": "usa",
    "city": "Colorado",
    "ppm2026": 800,
    "minArea": 5000,
    "maxArea": 50000,
    "zoning": "rural",
    "launchYear": 1975
  },
  {
    "id": "land_nc_plot",
    "name": "North Carolina Plot",
    "country": "usa",
    "city": "North Carolina",
    "ppm2026": 400,
    "minArea": 5000,
    "maxArea": 40000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_az_desert",
    "name": "Arizona Desert Plot",
    "country": "usa",
    "city": "Arizona",
    "ppm2026": 350,
    "minArea": 5000,
    "maxArea": 40000,
    "zoning": "rural",
    "launchYear": 1975
  },
  {
    "id": "land_ca_hills",
    "name": "California Hills Plot",
    "country": "usa",
    "city": "California",
    "ppm2026": 1500,
    "minArea": 4000,
    "maxArea": 30000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_sau_riyadh_n",
    "name": "Al Narjis Plot",
    "country": "sau",
    "city": "Riyadh",
    "ppm2026": 2800,
    "minArea": 400,
    "maxArea": 1000,
    "zoning": "residential_villas",
    "launchYear": 1975
  },
  {
    "id": "land_sau_riyadh_n2",
    "name": "Al Malqa Plot",
    "country": "sau",
    "city": "Riyadh",
    "ppm2026": 3200,
    "minArea": 400,
    "maxArea": 1200,
    "zoning": "residential_villas",
    "launchYear": 1975
  },
  {
    "id": "land_sau_jeddah",
    "name": "Jeddah Obhur Plot",
    "country": "sau",
    "city": "Jeddah",
    "ppm2026": 2400,
    "minArea": 400,
    "maxArea": 1500,
    "zoning": "residential_villas",
    "launchYear": 1975
  },
  {
    "id": "land_sau_dammam",
    "name": "Dammam Plot",
    "country": "sau",
    "city": "Dammam",
    "ppm2026": 1800,
    "minArea": 400,
    "maxArea": 1200,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_sau_makkah",
    "name": "Makkah Plot",
    "country": "sau",
    "city": "Makkah",
    "ppm2026": 5000,
    "minArea": 300,
    "maxArea": 1000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_sau_madinah",
    "name": "Madinah Plot",
    "country": "sau",
    "city": "Madinah",
    "ppm2026": 3500,
    "minArea": 400,
    "maxArea": 1200,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_uae_dubai_hills",
    "name": "Dubai Hills Plot",
    "country": "uae",
    "city": "Dubai",
    "ppm2026": 8000,
    "minArea": 500,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_uae_arabian_ranches",
    "name": "Arabian Ranches Plot",
    "country": "uae",
    "city": "Dubai",
    "ppm2026": 6500,
    "minArea": 500,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_uae_yas",
    "name": "Yas Island Plot",
    "country": "uae",
    "city": "Abu Dhabi",
    "ppm2026": 5500,
    "minArea": 500,
    "maxArea": 1500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_uk_surrey",
    "name": "Surrey Plot",
    "country": "gbr",
    "city": "Surrey",
    "ppm2026": 3000,
    "minArea": 800,
    "maxArea": 5000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_uk_kent",
    "name": "Kent Plot",
    "country": "gbr",
    "city": "Kent",
    "ppm2026": 2400,
    "minArea": 800,
    "maxArea": 4000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_mahatet_raml",
    "name": "Mahatet El Raml Plot",
    "country": "egy",
    "city": "Alexandria",
    "ppm2026": 90000,
    "minArea": 120,
    "maxArea": 400,
    "zoning": "mixed_use",
    "launchYear": 1994
  },
  {
    "id": "land_fouad",
    "name": "Fouad Street Plot",
    "country": "egy",
    "city": "Alexandria",
    "ppm2026": 85000,
    "minArea": 150,
    "maxArea": 500,
    "zoning": "mixed_use",
    "launchYear": 1994
  },
  {
    "id": "land_corniche_stanley",
    "name": "Stanley Corniche Plot",
    "country": "egy",
    "city": "Alexandria",
    "ppm2026": 110000,
    "minArea": 200,
    "maxArea": 600,
    "zoning": "residential",
    "launchYear": 1994
  },
  {
    "id": "land_tahrir_edge",
    "name": "Downtown / Tahrir Corridor Plot",
    "country": "egy",
    "city": "Cairo",
    "ppm2026": 70000,
    "minArea": 150,
    "maxArea": 500,
    "zoning": "mixed_use",
    "launchYear": 1994
  },
  {
    "id": "land_zamalek",
    "name": "Zamalek Island Plot",
    "country": "egy",
    "city": "Cairo",
    "ppm2026": 120000,
    "minArea": 200,
    "maxArea": 800,
    "zoning": "residential",
    "launchYear": 1994
  },
  {
    "id": "land_brooklyn_williamsburg",
    "name": "Williamsburg Development Lot",
    "country": "usa",
    "city": "Brooklyn",
    "ppm2026": 18000,
    "minArea": 200,
    "maxArea": 1000,
    "zoning": "residential",
    "launchYear": 1995
  },
  {
    "id": "land_london_shoreditch",
    "name": "Shoreditch Infill Plot",
    "country": "gbr",
    "city": "London",
    "ppm2026": 16000,
    "minArea": 100,
    "maxArea": 400,
    "zoning": "mixed_use",
    "launchYear": 1995
  },
  {
    "id": "land_hs_egy_capital-gardens",
    "name": "Capital Gardens Residential Plot",
    "country": "egy",
    "city": "Capital Gardens",
    "ppm2026": 60000,
    "minArea": 400,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_egy_katameya-eastern-cairo",
    "name": "Katameya / Eastern Cairo Residential Plot",
    "country": "egy",
    "city": "Katameya / Eastern Cairo",
    "ppm2026": 278000,
    "minArea": 400,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_egy_red-sea",
    "name": "Red Sea Residential Plot",
    "country": "egy",
    "city": "Red Sea",
    "ppm2026": 210000,
    "minArea": 500,
    "maxArea": 3000,
    "zoning": "resort_chalet",
    "launchYear": 1975
  },
  {
    "id": "land_hs_egy_new-zayed",
    "name": "New Zayed Residential Plot",
    "country": "egy",
    "city": "New Zayed",
    "ppm2026": 85000,
    "minArea": 400,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_egy_new-heliopolis",
    "name": "New Heliopolis Residential Plot",
    "country": "egy",
    "city": "New Heliopolis",
    "ppm2026": 52000,
    "minArea": 400,
    "maxArea": 2000,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_miami",
    "name": "Miami Residential Plot",
    "country": "usa",
    "city": "Miami",
    "ppm2026": 18000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_seattle",
    "name": "Seattle Residential Plot",
    "country": "usa",
    "city": "Seattle",
    "ppm2026": 9000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_chicago",
    "name": "Chicago Residential Plot",
    "country": "usa",
    "city": "Chicago",
    "ppm2026": 8000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_los-angeles",
    "name": "Los Angeles Residential Plot",
    "country": "usa",
    "city": "Los Angeles",
    "ppm2026": 20000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_san-francisco",
    "name": "San Francisco Residential Plot",
    "country": "usa",
    "city": "San Francisco",
    "ppm2026": 18000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_boston",
    "name": "Boston Residential Plot",
    "country": "usa",
    "city": "Boston",
    "ppm2026": 14000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_houston",
    "name": "Houston Residential Plot",
    "country": "usa",
    "city": "Houston",
    "ppm2026": 9000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_scottsdale",
    "name": "Scottsdale Residential Plot",
    "country": "usa",
    "city": "Scottsdale",
    "ppm2026": 6500,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_atlanta",
    "name": "Atlanta Residential Plot",
    "country": "usa",
    "city": "Atlanta",
    "ppm2026": 8000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_dallas",
    "name": "Dallas Residential Plot",
    "country": "usa",
    "city": "Dallas",
    "ppm2026": 7500,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_denver",
    "name": "Denver Residential Plot",
    "country": "usa",
    "city": "Denver",
    "ppm2026": 9000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_south-jordan",
    "name": "South Jordan Residential Plot",
    "country": "usa",
    "city": "South Jordan",
    "ppm2026": 4500,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_cypress",
    "name": "Cypress Residential Plot",
    "country": "usa",
    "city": "Cypress",
    "ppm2026": 5000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_las-vegas",
    "name": "Las Vegas Residential Plot",
    "country": "usa",
    "city": "Las Vegas",
    "ppm2026": 5500,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_usa_kissimmee",
    "name": "Kissimmee Residential Plot",
    "country": "usa",
    "city": "Kissimmee",
    "ppm2026": 5000,
    "minArea": 4000,
    "maxArea": 20000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_sau_neom",
    "name": "NEOM Residential Plot",
    "country": "sau",
    "city": "NEOM",
    "ppm2026": 35000,
    "minArea": 500,
    "maxArea": 2500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_sau_amaala",
    "name": "AMAALA Residential Plot",
    "country": "sau",
    "city": "AMAALA",
    "ppm2026": 28000,
    "minArea": 500,
    "maxArea": 2500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_deu_berlin",
    "name": "Berlin Residential Plot",
    "country": "deu",
    "city": "Berlin",
    "ppm2026": 11000,
    "minArea": 400,
    "maxArea": 1500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_deu_frankfurt",
    "name": "Frankfurt Residential Plot",
    "country": "deu",
    "city": "Frankfurt",
    "ppm2026": 13000,
    "minArea": 400,
    "maxArea": 1500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_deu_munich",
    "name": "Munich Residential Plot",
    "country": "deu",
    "city": "Munich",
    "ppm2026": 14000,
    "minArea": 400,
    "maxArea": 1500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_deu_hamburg",
    "name": "Hamburg Residential Plot",
    "country": "deu",
    "city": "Hamburg",
    "ppm2026": 11500,
    "minArea": 400,
    "maxArea": 1500,
    "zoning": "residential",
    "launchYear": 1975
  },
  {
    "id": "land_hs_can_toronto",
    "name": "Toronto Residential Plot",
    "country": "can",
    "city": "Toronto",
    "ppm2026": 16000,
    "minArea": 400,
    "maxArea": 2000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_can_vancouver",
    "name": "Vancouver Residential Plot",
    "country": "can",
    "city": "Vancouver",
    "ppm2026": 14000,
    "minArea": 400,
    "maxArea": 2000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_hs_can_montreal",
    "name": "Montreal Residential Plot",
    "country": "can",
    "city": "Montreal",
    "ppm2026": 8000,
    "minArea": 400,
    "maxArea": 2000,
    "zoning": "single_family",
    "launchYear": 1975
  },
  {
    "id": "land_uae_exp_0",
    "name": "UAE Suburban Residential Plot",
    "country": "uae",
    "city": "",
    "ppm2026": 3938,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_uae_exp_1",
    "name": "UAE Prime Corner Villa Plot",
    "country": "uae",
    "city": "",
    "ppm2026": 7088,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_uae_exp_2",
    "name": "UAE Multi-Story Apartment Plot",
    "country": "uae",
    "city": "",
    "ppm2026": 9450,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_uae_exp_3",
    "name": "UAE Commercial Strip Plot",
    "country": "uae",
    "city": "",
    "ppm2026": 11550,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_gbr_exp_0",
    "name": "GBR Suburban Residential Plot",
    "country": "gbr",
    "city": "",
    "ppm2026": 1827,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_gbr_exp_1",
    "name": "GBR Prime Corner Villa Plot",
    "country": "gbr",
    "city": "",
    "ppm2026": 3289,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_gbr_exp_2",
    "name": "GBR Multi-Story Apartment Plot",
    "country": "gbr",
    "city": "",
    "ppm2026": 4385,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_gbr_exp_3",
    "name": "GBR Commercial Strip Plot",
    "country": "gbr",
    "city": "",
    "ppm2026": 5359,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_can_exp_0",
    "name": "CAN Suburban Residential Plot",
    "country": "can",
    "city": "",
    "ppm2026": 2142,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_can_exp_1",
    "name": "CAN Prime Corner Villa Plot",
    "country": "can",
    "city": "",
    "ppm2026": 3856,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_can_exp_2",
    "name": "CAN Multi-Story Apartment Plot",
    "country": "can",
    "city": "",
    "ppm2026": 5141,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_can_exp_3",
    "name": "CAN Commercial Strip Plot",
    "country": "can",
    "city": "",
    "ppm2026": 6283,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_aus_exp_0",
    "name": "AUS Suburban Residential Plot",
    "country": "aus",
    "city": "",
    "ppm2026": 2457,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_aus_exp_1",
    "name": "AUS Prime Corner Villa Plot",
    "country": "aus",
    "city": "",
    "ppm2026": 4423,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_aus_exp_2",
    "name": "AUS Multi-Story Apartment Plot",
    "country": "aus",
    "city": "",
    "ppm2026": 5897,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_aus_exp_3",
    "name": "AUS Commercial Strip Plot",
    "country": "aus",
    "city": "",
    "ppm2026": 7207,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_nld_exp_0",
    "name": "NLD Suburban Residential Plot",
    "country": "nld",
    "city": "",
    "ppm2026": 1953,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_nld_exp_1",
    "name": "NLD Prime Corner Villa Plot",
    "country": "nld",
    "city": "",
    "ppm2026": 3515,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_nld_exp_2",
    "name": "NLD Multi-Story Apartment Plot",
    "country": "nld",
    "city": "",
    "ppm2026": 4687,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_nld_exp_3",
    "name": "NLD Commercial Strip Plot",
    "country": "nld",
    "city": "",
    "ppm2026": 5729,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_fra_exp_0",
    "name": "FRA Suburban Residential Plot",
    "country": "fra",
    "city": "",
    "ppm2026": 2048,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_fra_exp_1",
    "name": "FRA Prime Corner Villa Plot",
    "country": "fra",
    "city": "",
    "ppm2026": 3686,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_fra_exp_2",
    "name": "FRA Multi-Story Apartment Plot",
    "country": "fra",
    "city": "",
    "ppm2026": 4914,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_fra_exp_3",
    "name": "FRA Commercial Strip Plot",
    "country": "fra",
    "city": "",
    "ppm2026": 6006,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_jpn_exp_0",
    "name": "JPN Suburban Residential Plot",
    "country": "jpn",
    "city": "",
    "ppm2026": 299250,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_jpn_exp_1",
    "name": "JPN Prime Corner Villa Plot",
    "country": "jpn",
    "city": "",
    "ppm2026": 538650,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_jpn_exp_2",
    "name": "JPN Multi-Story Apartment Plot",
    "country": "jpn",
    "city": "",
    "ppm2026": 718200,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_jpn_exp_3",
    "name": "JPN Commercial Strip Plot",
    "country": "jpn",
    "city": "",
    "ppm2026": 877800,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_ita_exp_0",
    "name": "ITA Suburban Residential Plot",
    "country": "ita",
    "city": "",
    "ppm2026": 1323,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_ita_exp_1",
    "name": "ITA Prime Corner Villa Plot",
    "country": "ita",
    "city": "",
    "ppm2026": 2381,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_ita_exp_2",
    "name": "ITA Multi-Story Apartment Plot",
    "country": "ita",
    "city": "",
    "ppm2026": 3175,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_ita_exp_3",
    "name": "ITA Commercial Strip Plot",
    "country": "ita",
    "city": "",
    "ppm2026": 3881,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_sgp_exp_0",
    "name": "SGP Suburban Residential Plot",
    "country": "sgp",
    "city": "",
    "ppm2026": 4252,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_sgp_exp_1",
    "name": "SGP Prime Corner Villa Plot",
    "country": "sgp",
    "city": "",
    "ppm2026": 7655,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_sgp_exp_2",
    "name": "SGP Multi-Story Apartment Plot",
    "country": "sgp",
    "city": "",
    "ppm2026": 10206,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_sgp_exp_3",
    "name": "SGP Commercial Strip Plot",
    "country": "sgp",
    "city": "",
    "ppm2026": 12474,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_bra_exp_0",
    "name": "BRA Suburban Residential Plot",
    "country": "bra",
    "city": "",
    "ppm2026": 3087,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_bra_exp_1",
    "name": "BRA Prime Corner Villa Plot",
    "country": "bra",
    "city": "",
    "ppm2026": 5557,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_bra_exp_2",
    "name": "BRA Multi-Story Apartment Plot",
    "country": "bra",
    "city": "",
    "ppm2026": 7409,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_bra_exp_3",
    "name": "BRA Commercial Strip Plot",
    "country": "bra",
    "city": "",
    "ppm2026": 9055,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
  {
    "id": "land_ind_exp_0",
    "name": "IND Suburban Residential Plot",
    "country": "ind",
    "city": "",
    "ppm2026": 26775,
    "minArea": 320,
    "maxArea": 640,
    "zoning": "residential",
    "launchYear": 1965
  },
  {
    "id": "land_ind_exp_1",
    "name": "IND Prime Corner Villa Plot",
    "country": "ind",
    "city": "",
    "ppm2026": 48195,
    "minArea": 600,
    "maxArea": 1200,
    "zoning": "villa",
    "launchYear": 1965
  },
  {
    "id": "land_ind_exp_2",
    "name": "IND Multi-Story Apartment Plot",
    "country": "ind",
    "city": "",
    "ppm2026": 64260,
    "minArea": 750,
    "maxArea": 1500,
    "zoning": "apartment_block",
    "launchYear": 1965
  },
  {
    "id": "land_ind_exp_3",
    "name": "IND Commercial Strip Plot",
    "country": "ind",
    "city": "",
    "ppm2026": 78540,
    "minArea": 500,
    "maxArea": 1000,
    "zoning": "commercial",
    "launchYear": 1965
  },
    {
      "id": "land_che_exp_0",
      "name": "CHE Suburban Residential Plot",
      "country": "che",
      "city": "",
      "ppm2026": 4000,
      "minArea": 500,
      "maxArea": 1200,
      "zoning": "residential",
      "launchYear": 1965
    },
    {
      "id": "land_che_exp_1",
      "name": "CHE Prime Corner Villa Plot",
      "country": "che",
      "city": "",
      "ppm2026": 5320,
      "minArea": 600,
      "maxArea": 1200,
      "zoning": "villa",
      "launchYear": 1965
    },
    {
      "id": "land_che_exp_2",
      "name": "CHE Multi-Story Apartment Plot",
      "country": "che",
      "city": "",
      "ppm2026": 6400,
      "minArea": 750,
      "maxArea": 1500,
      "zoning": "apartment_block",
      "launchYear": 1965
    },
    {
      "id": "land_che_exp_3",
      "name": "CHE Commercial Strip Plot",
      "country": "che",
      "city": "",
      "ppm2026": 7800,
      "minArea": 500,
      "maxArea": 1000,
      "zoning": "commercial",
      "launchYear": 1965
    },
    {
      "id": "land_swe_exp_0",
      "name": "SWE Suburban Residential Plot",
      "country": "swe",
      "city": "",
      "ppm2026": 8000,
      "minArea": 500,
      "maxArea": 1200,
      "zoning": "residential",
      "launchYear": 1965
    },
    {
      "id": "land_swe_exp_1",
      "name": "SWE Prime Corner Villa Plot",
      "country": "swe",
      "city": "",
      "ppm2026": 10640,
      "minArea": 600,
      "maxArea": 1200,
      "zoning": "villa",
      "launchYear": 1965
    },
    {
      "id": "land_swe_exp_2",
      "name": "SWE Multi-Story Apartment Plot",
      "country": "swe",
      "city": "",
      "ppm2026": 12800,
      "minArea": 750,
      "maxArea": 1500,
      "zoning": "apartment_block",
      "launchYear": 1965
    },
    {
      "id": "land_swe_exp_3",
      "name": "SWE Commercial Strip Plot",
      "country": "swe",
      "city": "",
      "ppm2026": 15600,
      "minArea": 500,
      "maxArea": 1000,
      "zoning": "commercial",
      "launchYear": 1965
    },
    {
      "id": "land_tur_exp_0",
      "name": "TUR Suburban Residential Plot",
      "country": "tur",
      "city": "",
      "ppm2026": 80000,
      "minArea": 500,
      "maxArea": 1200,
      "zoning": "residential",
      "launchYear": 1965
    },
    {
      "id": "land_tur_exp_1",
      "name": "TUR Prime Corner Villa Plot",
      "country": "tur",
      "city": "",
      "ppm2026": 106400,
      "minArea": 600,
      "maxArea": 1200,
      "zoning": "villa",
      "launchYear": 1965
    },
    {
      "id": "land_tur_exp_2",
      "name": "TUR Multi-Story Apartment Plot",
      "country": "tur",
      "city": "",
      "ppm2026": 128000,
      "minArea": 750,
      "maxArea": 1500,
      "zoning": "apartment_block",
      "launchYear": 1965
    },
    {
      "id": "land_tur_exp_3",
      "name": "TUR Commercial Strip Plot",
      "country": "tur",
      "city": "",
      "ppm2026": 156000,
      "minArea": 500,
      "maxArea": 1000,
      "zoning": "commercial",
      "launchYear": 1965
    }
];
export const PAYMENT_PLANS = [
  {
    "id": "cash",
    "label": "Upfront Cash (15% Discount)",
    "downPct": 1,
    "years": 0,
    "totalMarkup": 0.85
  },
  {
    "id": "cash_10",
    "label": "Cash w/ 10% Discount",
    "downPct": 1,
    "years": 0,
    "totalMarkup": 0.9
  },
  {
    "id": "cash_5",
    "label": "Cash w/ 5% Discount",
    "downPct": 1,
    "years": 0,
    "totalMarkup": 0.95
  },
  {
    "id": "p2_equal",
    "label": "2-Year Equal Installments",
    "downPct": 0.2,
    "years": 2,
    "totalMarkup": 1
  },
  {
    "id": "p3_equal",
    "label": "3-Year Equal Installments",
    "downPct": 0.15,
    "years": 3,
    "totalMarkup": 1
  },
  {
    "id": "p4_equal",
    "label": "4-Year Developer Plan",
    "downPct": 0.15,
    "years": 4,
    "totalMarkup": 1.02
  },
  {
    "id": "p5_equal",
    "label": "5-Year Developer Plan",
    "downPct": 0.1,
    "years": 5,
    "totalMarkup": 1.05
  },
  {
    "id": "p6_equal",
    "label": "6-Year Developer Plan",
    "downPct": 0.1,
    "years": 6,
    "totalMarkup": 1.12
  },
  {
    "id": "p7_equal",
    "label": "7-Year Developer Plan",
    "downPct": 0.1,
    "years": 7,
    "totalMarkup": 1.18
  },
  {
    "id": "p8_equal",
    "label": "8-Year Flexible Plan (5% Down)",
    "downPct": 0.05,
    "years": 8,
    "totalMarkup": 1.28
  },
  {
    "id": "p9_equal",
    "label": "9-Year Developer Plan",
    "downPct": 0.05,
    "years": 9,
    "totalMarkup": 1.36
  },
  {
    "id": "p10_equal",
    "label": "10-Year Long Plan",
    "downPct": 0.05,
    "years": 10,
    "totalMarkup": 1.45
  },
  {
    "id": "p12_equal",
    "label": "12-Year Extended Plan",
    "downPct": 0.05,
    "years": 12,
    "totalMarkup": 1.6
  },
  {
    "id": "mortgage_bank_15",
    "label": "15-Year Bank Mortgage (16%)",
    "downPct": 0.2,
    "years": 15,
    "totalMarkup": 1.9
  },
  {
    "id": "mortgage_bank",
    "label": "20-Year Bank Mortgage (18%)",
    "downPct": 0.2,
    "years": 20,
    "totalMarkup": 2.1
  },
  {
    "id": "mortgage_bank_25",
    "label": "25-Year Bank Mortgage (20%)",
    "downPct": 0.15,
    "years": 25,
    "totalMarkup": 2.45
  },
  {
    "id": "usa_fha_30",
    "label": "FHA-insured 30-year fixed (3.5% down; insurance estimated)",
    "downPct": 0.035,
    "years": 30,
    "totalMarkup": 1,
    "countries": [
      "usa"
    ],
    "launchYear": 1934,
    "aprModel": "us_mortgage",
    "aprAdd": 0.65,
    "insuranceMode": "fha"
  },
  {
    "id": "usa_fixed_30",
    "label": "Conventional 30-year fixed (20% down)",
    "downPct": 0.2,
    "years": 30,
    "totalMarkup": 1,
    "countries": [
      "usa"
    ],
    "launchYear": 1950,
    "aprModel": "us_mortgage"
  },
  {
    "id": "usa_fixed_15",
    "label": "Conventional 15-year fixed (20% down)",
    "downPct": 0.2,
    "years": 15,
    "totalMarkup": 1,
    "countries": [
      "usa"
    ],
    "launchYear": 1970,
    "aprModel": "us_mortgage"
  },
  {
    "id": "usa_fixed_10",
    "label": "Conventional 10-year fixed (20% down)",
    "downPct": 0.2,
    "years": 10,
    "totalMarkup": 1,
    "countries": [
      "usa"
    ],
    "launchYear": 1970,
    "aprModel": "us_mortgage"
  },
  {
    "id": "egy_mortgage_finance_20",
    "label": "Egypt mortgage-finance scenario (20-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 20,
    "totalMarkup": 1,
    "countries": [
      "egy"
    ],
    "launchYear": 2001,
    "aprModel": "country_mortgage"
  },
  {
    "id": "gbr_residential_mortgage_25",
    "label": "UK residential mortgage (25-year estimated repayment; 10% down)",
    "downPct": 0.1,
    "years": 25,
    "totalMarkup": 1,
    "countries": [
      "gbr"
    ],
    "launchYear": 1950,
    "aprModel": "country_mortgage"
  },
  {
    "id": "can_owner_mortgage_25",
    "label": "Canadian owner-occupier mortgage (25-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 25,
    "totalMarkup": 1,
    "countries": [
      "can"
    ],
    "launchYear": 1954,
    "aprModel": "country_mortgage"
  },
  {
    "id": "deu_annuity_mortgage_25",
    "label": "German annuity mortgage (25-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 25,
    "totalMarkup": 1,
    "countries": [
      "deu"
    ],
    "launchYear": 1950,
    "aprModel": "country_mortgage"
  },
  {
    "id": "aus_home_mortgage_25",
    "label": "Australian home loan (25-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 25,
    "totalMarkup": 1,
    "countries": [
      "aus"
    ],
    "launchYear": 1950,
    "aprModel": "country_mortgage"
  },
  {
    "id": "nld_annuity_mortgage_25",
    "label": "Dutch annuity mortgage (25-year estimated repayment; 10% down)",
    "downPct": 0.1,
    "years": 25,
    "totalMarkup": 1,
    "countries": [
      "nld"
    ],
    "launchYear": 1950,
    "aprModel": "country_mortgage"
  },
  {
    "id": "fra_fixed_mortgage_20",
    "label": "French amortizing home loan (20-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 20,
    "totalMarkup": 1,
    "countries": [
      "fra"
    ],
    "launchYear": 1950,
    "aprModel": "country_mortgage"
  },
  {
    "id": "jpn_home_mortgage_25",
    "label": "Japanese housing loan (25-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 25,
    "totalMarkup": 1,
    "countries": [
      "jpn"
    ],
    "launchYear": 1950,
    "aprModel": "country_mortgage"
  },
  {
    "id": "ita_home_mortgage_20",
    "label": "Italian home loan (20-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 20,
    "totalMarkup": 1,
    "countries": [
      "ita"
    ],
    "launchYear": 1960,
    "aprModel": "country_mortgage"
  },
  {
    "id": "sgp_private_mortgage_25",
    "label": "Singapore private-home loan (25-year estimated repayment; 25% down)",
    "downPct": 0.25,
    "years": 25,
    "totalMarkup": 1,
    "countries": [
      "sgp"
    ],
    "launchYear": 1965,
    "aprModel": "country_mortgage"
  },
  {
    "id": "sau_home_finance_20",
    "label": "Saudi residential home-finance plan (20-year estimated total cost; 20% down)",
    "downPct": 0.2,
    "years": 20,
    "totalMarkup": 1,
    "countries": [
      "sau"
    ],
    "launchYear": 2000,
    "aprModel": "country_mortgage"
  },
  {
    "id": "uae_home_finance_25",
    "label": "UAE residential home-finance plan (25-year estimated total cost; 20% down)",
    "downPct": 0.2,
    "years": 25,
    "totalMarkup": 1,
    "countries": [
      "uae"
    ],
    "launchYear": 2000,
    "aprModel": "country_mortgage"
  },
  {
    "id": "bra_housing_finance_20",
    "label": "Brazil long-term home-finance scenario (20-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 20,
    "totalMarkup": 1,
    "countries": [
      "bra"
    ],
    "launchYear": 1970,
    "aprModel": "country_mortgage"
  },
  {
    "id": "ind_home_loan_20",
    "label": "Indian housing-loan scenario (20-year estimated repayment; 20% down)",
    "downPct": 0.2,
    "years": 20,
    "totalMarkup": 1,
    "countries": [
      "ind"
    ],
    "launchYear": 1970,
    "aprModel": "country_mortgage"
  },
  {
    "id": "cbe_3pct_30y",
    "label": "CBE 3% Social Mortgage (30 Yrs, Egypt Citizen)",
    "downPct": 0.15,
    "years": 30,
    "totalMarkup": 1.48,
    "program": "egy_sakan"
  },
  {
    "id": "cbe_8pct_25y",
    "label": "CBE 8% Middle-Income Mortgage (25 Yrs, Egypt Citizen)",
    "downPct": 0.2,
    "years": 25,
    "totalMarkup": 1.95,
    "program": "egy_middle"
  },
  {
    "id": "sakani_redf_20y",
    "label": "Sakani REDF Subsidized Plan (150k SAR Grant + 20 Yrs)",
    "downPct": 0.05,
    "years": 20,
    "totalMarkup": 1.12,
    "program": "sau_sakani"
  },
  {
    "id": "ras_hekma_12y",
    "label": "Coastal Master Plan (5% Down \u00b7 12 Years)",
    "downPct": 0.05,
    "years": 12,
    "totalMarkup": 1.24,
    "program": "offplan_long"
  }
];
export const HOME_UPGRADES = [
  {
    "id": "central_ac",
    "category": "Climate",
    "name": "VRF Central AC",
    "brands": [
      "Daikin",
      "Mitsubishi Electric",
      "LG",
      "Samsung"
    ],
    "cost": {
      "egy": 250000,
      "usa": 15000,
      "sau": 35000
    },
    "moodBonus": 4,
    "valueAdd": 1.05,
    "energyMultiplier": 1.3,
    "maintenancePerYear": {
      "egy": 12000,
      "usa": 800,
      "sau": 1800
    }
  },
  {
    "id": "ductless_ac",
    "category": "Climate",
    "name": "Ductless Split AC",
    "brands": [
      "Carrier",
      "Trane",
      "Gree"
    ],
    "cost": {
      "egy": 80000,
      "usa": 6000,
      "sau": 12000
    },
    "moodBonus": 2,
    "valueAdd": 1.02,
    "energyMultiplier": 1.15,
    "maintenancePerYear": {
      "egy": 4000,
      "usa": 300,
      "sau": 700
    }
  },
  {
    "id": "fireplace",
    "category": "Climate",
    "name": "Gas Fireplace",
    "brands": [
      "Napoleon",
      "Heat & Glo"
    ],
    "cost": {
      "egy": 120000,
      "usa": 8000,
      "sau": 16000
    },
    "moodBonus": 3,
    "valueAdd": 1.03,
    "energyMultiplier": 1.05,
    "maintenancePerYear": {
      "egy": 3000,
      "usa": 200,
      "sau": 500
    }
  },
  {
    "id": "solar_power",
    "category": "Power",
    "name": "On-Grid Solar System",
    "brands": [
      "JinkoSolar",
      "Canadian Solar",
      "SunPower"
    ],
    "cost": {
      "egy": 350000,
      "usa": 22000,
      "sau": 40000
    },
    "moodBonus": 1,
    "valueAdd": 1.06,
    "energyMultiplier": 0.3,
    "maintenancePerYear": {
      "egy": 8000,
      "usa": 500,
      "sau": 1000
    }
  },
  {
    "id": "generator",
    "category": "Power",
    "name": "Backup Generator",
    "brands": [
      "Caterpillar",
      "Cummins",
      "Perkins"
    ],
    "cost": {
      "egy": 200000,
      "usa": 12000,
      "sau": 25000
    },
    "moodBonus": 2,
    "valueAdd": 1.03,
    "energyMultiplier": 1.1,
    "maintenancePerYear": {
      "egy": 10000,
      "usa": 700,
      "sau": 1500
    }
  },
  {
    "id": "tesla_wall",
    "category": "Power",
    "name": "Home Battery Storage",
    "brands": [
      "Tesla Powerwall",
      "LG RESU",
      "Sonnen"
    ],
    "cost": {
      "egy": 450000,
      "usa": 18000,
      "sau": 55000
    },
    "moodBonus": 2,
    "valueAdd": 1.04,
    "energyMultiplier": 0.85,
    "maintenancePerYear": {
      "egy": 5000,
      "usa": 300,
      "sau": 900
    }
  },
  {
    "id": "water_treatment",
    "category": "Water",
    "name": "Whole-House Water Filtration",
    "brands": [
      "Culligan",
      "Kinetico",
      "3M"
    ],
    "cost": {
      "egy": 90000,
      "usa": 6000,
      "sau": 12000
    },
    "moodBonus": 2,
    "valueAdd": 1.03,
    "energyMultiplier": 1,
    "maintenancePerYear": {
      "egy": 4000,
      "usa": 300,
      "sau": 800
    }
  },
  {
    "id": "water_heater",
    "category": "Water",
    "name": "Tankless Water Heater",
    "brands": [
      "Rinnai",
      "Navien",
      "Bosch"
    ],
    "cost": {
      "egy": 60000,
      "usa": 4000,
      "sau": 9000
    },
    "moodBonus": 1,
    "valueAdd": 1.02,
    "energyMultiplier": 0.9,
    "maintenancePerYear": {
      "egy": 2000,
      "usa": 150,
      "sau": 400
    }
  },
  {
    "id": "smart_security",
    "category": "Security",
    "name": "Smart Security System",
    "brands": [
      "Ring",
      "ADT",
      "Vivint",
      "SimpliSafe"
    ],
    "cost": {
      "egy": 80000,
      "usa": 5000,
      "sau": 12000
    },
    "moodBonus": 3,
    "valueAdd": 1.04,
    "energyMultiplier": 1.02,
    "maintenancePerYear": {
      "egy": 3000,
      "usa": 300,
      "sau": 600
    }
  },
  {
    "id": "panic_room",
    "category": "Security",
    "name": "Steel-Reinforced Panic Room",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 600000,
      "usa": 35000,
      "sau": 70000
    },
    "moodBonus": 1,
    "valueAdd": 1.03,
    "energyMultiplier": 1,
    "maintenancePerYear": {
      "egy": 8000,
      "usa": 500,
      "sau": 1200
    }
  },
  {
    "id": "sauna",
    "category": "Wellness",
    "name": "Finnish Sauna",
    "brands": [
      "Harvia",
      "Helo",
      "Finlandia"
    ],
    "cost": {
      "egy": 250000,
      "usa": 12000,
      "sau": 28000
    },
    "moodBonus": 4,
    "valueAdd": 1.04,
    "energyMultiplier": 1.15,
    "maintenancePerYear": {
      "egy": 6000,
      "usa": 400,
      "sau": 1000
    }
  },
  {
    "id": "jacuzzi",
    "category": "Wellness",
    "name": "Hot Tub / Jacuzzi",
    "brands": [
      "Jacuzzi",
      "Hot Spring",
      "Sundance"
    ],
    "cost": {
      "egy": 180000,
      "usa": 10000,
      "sau": 22000
    },
    "moodBonus": 4,
    "valueAdd": 1.03,
    "energyMultiplier": 1.2,
    "maintenancePerYear": {
      "egy": 5000,
      "usa": 400,
      "sau": 900
    }
  },
  {
    "id": "home_gym",
    "category": "Wellness",
    "name": "Home Gym",
    "brands": [
      "Technogym",
      "Life Fitness",
      "Peloton",
      "NordicTrack"
    ],
    "cost": {
      "egy": 200000,
      "usa": 15000,
      "sau": 35000
    },
    "moodBonus": 3,
    "valueAdd": 1.03,
    "energyMultiplier": 1.1,
    "maintenancePerYear": {
      "egy": 4000,
      "usa": 300,
      "sau": 800
    }
  },
  {
    "id": "massage_room",
    "category": "Wellness",
    "name": "Dedicated Massage Room",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 300000,
      "usa": 18000,
      "sau": 40000
    },
    "moodBonus": 5,
    "valueAdd": 1.04,
    "energyMultiplier": 1.05,
    "maintenancePerYear": {
      "egy": 5000,
      "usa": 400,
      "sau": 1000
    }
  },
  {
    "id": "heated_pool",
    "category": "Leisure",
    "name": "Infinity Heated Pool",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 850000,
      "usa": 45000,
      "sau": 85000
    },
    "moodBonus": 8,
    "valueAdd": 1.12,
    "energyMultiplier": 1.5,
    "maintenancePerYear": {
      "egy": 35000,
      "usa": 2500,
      "sau": 5500
    },
    "requiresVilla": true
  },
  {
    "id": "tennis_court",
    "category": "Leisure",
    "name": "Tennis Court",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 1200000,
      "usa": 60000,
      "sau": 140000
    },
    "moodBonus": 6,
    "valueAdd": 1.1,
    "energyMultiplier": 1,
    "maintenancePerYear": {
      "egy": 20000,
      "usa": 1500,
      "sau": 3500
    },
    "requiresMansion": true
  },
  {
    "id": "bbq_station",
    "category": "Leisure",
    "name": "Outdoor BBQ Station",
    "brands": [
      "Weber",
      "Traeger",
      "Kamado Joe"
    ],
    "cost": {
      "egy": 80000,
      "usa": 6000,
      "sau": 12000
    },
    "moodBonus": 3,
    "valueAdd": 1.02,
    "energyMultiplier": 1,
    "maintenancePerYear": {
      "egy": 2000,
      "usa": 150,
      "sau": 400
    }
  },
  {
    "id": "garden_fountain",
    "category": "Leisure",
    "name": "Garden Fountain & Pond",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 150000,
      "usa": 8000,
      "sau": 18000
    },
    "moodBonus": 3,
    "valueAdd": 1.03,
    "energyMultiplier": 1.05,
    "maintenancePerYear": {
      "egy": 5000,
      "usa": 400,
      "sau": 900
    },
    "requiresGarden": true
  },
  {
    "id": "cinema",
    "category": "Entertainment",
    "name": "Dolby Atmos Home Cinema",
    "brands": [
      "Dolby",
      "Sony",
      "JBL Synthesis"
    ],
    "cost": {
      "egy": 400000,
      "usa": 25000,
      "sau": 50000
    },
    "moodBonus": 6,
    "valueAdd": 1.05,
    "energyMultiplier": 1.1,
    "maintenancePerYear": {
      "egy": 4000,
      "usa": 300,
      "sau": 800
    }
  },
  {
    "id": "game_room",
    "category": "Entertainment",
    "name": "Dedicated Game Room",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 300000,
      "usa": 18000,
      "sau": 40000
    },
    "moodBonus": 5,
    "valueAdd": 1.03,
    "energyMultiplier": 1.15,
    "maintenancePerYear": {
      "egy": 3000,
      "usa": 200,
      "sau": 700
    }
  },
  {
    "id": "music_room",
    "category": "Entertainment",
    "name": "Music Room / Studio",
    "brands": [
      "Yamaha",
      "Steinway",
      "Fender"
    ],
    "cost": {
      "egy": 350000,
      "usa": 20000,
      "sau": 45000
    },
    "moodBonus": 5,
    "valueAdd": 1.03,
    "energyMultiplier": 1.05,
    "maintenancePerYear": {
      "egy": 3000,
      "usa": 200,
      "sau": 600
    }
  },
  {
    "id": "wine_cellar",
    "category": "Entertainment",
    "name": "Climate-Controlled Wine Cellar",
    "brands": [
      "EuroCave",
      "VintageView",
      "Custom"
    ],
    "cost": {
      "egy": 300000,
      "usa": 20000,
      "sau": 45000
    },
    "moodBonus": 3,
    "valueAdd": 1.04,
    "energyMultiplier": 1.1,
    "maintenancePerYear": {
      "egy": 6000,
      "usa": 400,
      "sau": 1000
    },
    "requiresVilla": true
  },
  {
    "id": "library",
    "category": "Entertainment",
    "name": "Home Library",
    "brands": [
      "Custom shelving",
      "Stikwood"
    ],
    "cost": {
      "egy": 220000,
      "usa": 12000,
      "sau": 25000
    },
    "moodBonus": 4,
    "valueAdd": 1.03,
    "energyMultiplier": 1,
    "maintenancePerYear": {
      "egy": 2000,
      "usa": 150,
      "sau": 400
    }
  },
  {
    "id": "prayer_room",
    "category": "Entertainment",
    "name": "Dedicated Prayer Room",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 100000,
      "usa": 5000,
      "sau": 20000
    },
    "moodBonus": 3,
    "valueAdd": 1.02,
    "energyMultiplier": 1,
    "maintenancePerYear": {
      "egy": 1000,
      "usa": 100,
      "sau": 300
    }
  },
  {
    "id": "elevator",
    "category": "Elevated",
    "name": "Private Elevator",
    "brands": [
      "KONE",
      "Otis",
      "Schindler",
      "ThyssenKrupp"
    ],
    "cost": {
      "egy": 800000,
      "usa": 40000,
      "sau": 90000
    },
    "moodBonus": 3,
    "valueAdd": 1.06,
    "energyMultiplier": 1.15,
    "maintenancePerYear": {
      "egy": 25000,
      "usa": 1500,
      "sau": 3500
    },
    "requiresVilla": true
  },
  {
    "id": "helipad",
    "category": "Elevated",
    "name": "Rooftop Helipad",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 1500000,
      "usa": 100000,
      "sau": 200000
    },
    "moodBonus": 5,
    "valueAdd": 1.15,
    "energyMultiplier": 1,
    "maintenancePerYear": {
      "egy": 40000,
      "usa": 3000,
      "sau": 7000
    },
    "requiresMansion": true
  },
  {
    "id": "panic_room_exp",
    "category": "Elevated",
    "name": "Underground Bunker",
    "brands": [
      "Custom"
    ],
    "cost": {
      "egy": 2500000,
      "usa": 150000,
      "sau": 300000
    },
    "moodBonus": 2,
    "valueAdd": 1.12,
    "energyMultiplier": 1.05,
    "maintenancePerYear": {
      "egy": 30000,
      "usa": 2000,
      "sau": 5000
    },
    "requiresMansion": true
  }
];
export const ROOM_FURNITURE_CATALOG = {
  "living": {
    "label": "Living & Reception",
    "icon": "sofa",
    "tiers": [
      {
        "id": "f_liv_1",
        "name": "Budget (IKEA / Home Centre)",
        "brands": [
          "IKEA",
          "Home Centre",
          "Al Araby"
        ],
        "cost": {
          "egy": 60000,
          "usa": 4000,
          "sau": 9000
        },
        "moodBonus": 2,
        "maintenancePerYear": {
          "egy": 2000,
          "usa": 150,
          "sau": 400
        },
        "desc": "Flat-pack sofas, basic 55\" TV, coffee table, rug."
      },
      {
        "id": "f_liv_2",
        "name": "Premium (Ethan Allen / Pottery Barn)",
        "brands": [
          "Ethan Allen",
          "Pottery Barn",
          "Crate & Barrel",
          "Marina Home"
        ],
        "cost": {
          "egy": 250000,
          "usa": 15000,
          "sau": 32000
        },
        "moodBonus": 5,
        "valueAdd": 1.02,
        "maintenancePerYear": {
          "egy": 8000,
          "usa": 600,
          "sau": 1500
        },
        "desc": "Solid wood, 75\" OLED, plush sofas, wool rugs, marble coffee table."
      },
      {
        "id": "f_liv_3",
        "name": "Luxury (Minotti / B&B Italia)",
        "brands": [
          "Minotti",
          "B&B Italia",
          "Poltrona Frau",
          "Cassina"
        ],
        "cost": {
          "egy": 800000,
          "usa": 45000,
          "sau": 95000
        },
        "moodBonus": 10,
        "valueAdd": 1.05,
        "maintenancePerYear": {
          "egy": 20000,
          "usa": 1500,
          "sau": 3500
        },
        "desc": "Italian designer sofas, 85\" 8K TV, custom marble, luxury textiles."
      },
      {
        "id": "f_liv_4",
        "name": "Ultra (Bespoke / Commissioned)",
        "brands": [
          "Bespoke",
          "Fendi Casa",
          "Versace Home"
        ],
        "cost": {
          "egy": 3000000,
          "usa": 180000,
          "sau": 380000
        },
        "moodBonus": 18,
        "valueAdd": 1.12,
        "maintenancePerYear": {
          "egy": 60000,
          "usa": 4500,
          "sau": 10000
        },
        "desc": "Commissioned pieces by world-renowned designers. Museum-grade."
      }
    ]
  },
  "dining": {
    "label": "Dining Room",
    "icon": "dining",
    "tiers": [
      {
        "id": "f_din_1",
        "name": "Budget (IKEA)",
        "brands": [
          "IKEA",
          "Home Centre"
        ],
        "cost": {
          "egy": 30000,
          "usa": 2000,
          "sau": 5000
        },
        "moodBonus": 1,
        "desc": "6-seat wooden table, fabric chairs."
      },
      {
        "id": "f_din_2",
        "name": "Premium (Crate & Barrel)",
        "brands": [
          "Crate & Barrel",
          "Marina Home",
          "Ethan Allen"
        ],
        "cost": {
          "egy": 120000,
          "usa": 8000,
          "sau": 18000
        },
        "moodBonus": 3,
        "valueAdd": 1.01,
        "desc": "8-seat oak table, upholstered chairs, sideboard."
      },
      {
        "id": "f_din_3",
        "name": "Luxury (B&B Italia)",
        "brands": [
          "B&B Italia",
          "Poltrona Frau",
          "Minotti"
        ],
        "cost": {
          "egy": 400000,
          "usa": 25000,
          "sau": 55000
        },
        "moodBonus": 6,
        "valueAdd": 1.03,
        "desc": "10-seat marble table, Italian leather chairs, silver service."
      },
      {
        "id": "f_din_4",
        "name": "Ultra (Bespoke Dining Suite)",
        "brands": [
          "Bespoke",
          "Fendi Casa"
        ],
        "cost": {
          "egy": 1200000,
          "usa": 75000,
          "sau": 160000
        },
        "moodBonus": 12,
        "valueAdd": 1.06,
        "desc": "12-seat custom table, crystal chandelier, full china service."
      }
    ]
  },
  "bedroom": {
    "label": "Master Bedroom",
    "icon": "bed",
    "tiers": [
      {
        "id": "f_bed_1",
        "name": "Budget Set",
        "brands": [
          "IKEA",
          "Home Centre"
        ],
        "cost": {
          "egy": 40000,
          "usa": 2500,
          "sau": 6000
        },
        "moodBonus": 1,
        "desc": "Queen bed, basic wardrobe, nightstands."
      },
      {
        "id": "f_bed_2",
        "name": "Premium Set",
        "brands": [
          "Ethan Allen",
          "Marina Home",
          "Pottery Barn"
        ],
        "cost": {
          "egy": 150000,
          "usa": 10000,
          "sau": 22000
        },
        "moodBonus": 4,
        "valueAdd": 1.02,
        "desc": "King bed with memory foam, sliding wardrobe, seating area."
      },
      {
        "id": "f_bed_3",
        "name": "Luxury Suite",
        "brands": [
          "Frette bedding",
          "Poltrona Frau",
          "Minotti"
        ],
        "cost": {
          "egy": 500000,
          "usa": 30000,
          "sau": 65000
        },
        "moodBonus": 8,
        "valueAdd": 1.04,
        "desc": "Italian king bed, walk-in closet, marble vanity, lounge area."
      },
      {
        "id": "f_bed_4",
        "name": "Presidential Suite",
        "brands": [
          "Bespoke",
          "Frette",
          "Savoir Beds"
        ],
        "cost": {
          "egy": 1500000,
          "usa": 90000,
          "sau": 200000
        },
        "moodBonus": 15,
        "valueAdd": 1.08,
        "desc": "Savoir custom bed, full marble ensuite, private dressing room."
      }
    ]
  },
  "kids": {
    "label": "Kids' Room",
    "icon": "toy",
    "requiresChildren": true,
    "tiers": [
      {
        "id": "f_kid_1",
        "name": "Budget",
        "brands": [
          "IKEA",
          "Home Centre"
        ],
        "cost": {
          "egy": 20000,
          "usa": 1500,
          "sau": 3500
        },
        "moodBonus": 1,
        "desc": "Single bed, small wardrobe, basic desk."
      },
      {
        "id": "f_kid_2",
        "name": "Premium",
        "brands": [
          "Pottery Barn Kids",
          "Land of Nod",
          "Marina Home"
        ],
        "cost": {
          "egy": 80000,
          "usa": 5000,
          "sau": 12000
        },
        "moodBonus": 3,
        "valueAdd": 1.01,
        "desc": "Bunk or twin bed, full wardrobe, study setup, toy storage."
      },
      {
        "id": "f_kid_3",
        "name": "Luxury Theme",
        "brands": [
          "Bespoke",
          "Pottery Barn Kids"
        ],
        "cost": {
          "egy": 250000,
          "usa": 15000,
          "sau": 32000
        },
        "moodBonus": 6,
        "valueAdd": 1.02,
        "desc": "Custom theme room, designer furniture, integrated play area."
      },
      {
        "id": "f_kid_4",
        "name": "Ultra Kids Suite",
        "brands": [
          "Bespoke"
        ],
        "cost": {
          "egy": 700000,
          "usa": 40000,
          "sau": 85000
        },
        "moodBonus": 12,
        "valueAdd": 1.04,
        "desc": "Multi-room suite with playroom, study, ensuite bath."
      }
    ]
  },
  "guest": {
    "label": "Guest Bedroom",
    "icon": "door",
    "tiers": [
      {
        "id": "f_gst_1",
        "name": "Budget",
        "brands": [
          "IKEA",
          "Home Centre"
        ],
        "cost": {
          "egy": 25000,
          "usa": 1500,
          "sau": 4000
        },
        "moodBonus": 1,
        "desc": "Double bed, basic wardrobe, small desk."
      },
      {
        "id": "f_gst_2",
        "name": "Premium",
        "brands": [
          "Ethan Allen",
          "Pottery Barn"
        ],
        "cost": {
          "egy": 90000,
          "usa": 6000,
          "sau": 14000
        },
        "moodBonus": 3,
        "desc": "Queen bed, quality linens, hotel-style amenities."
      },
      {
        "id": "f_gst_3",
        "name": "Luxury Hotel Suite",
        "brands": [
          "Frette",
          "Bespoke"
        ],
        "cost": {
          "egy": 300000,
          "usa": 18000,
          "sau": 38000
        },
        "moodBonus": 5,
        "valueAdd": 1.02,
        "desc": "King bed, marble ensuite, walk-in closet, private balcony."
      }
    ]
  },
  "kitchen": {
    "label": "Kitchen & Appliances",
    "icon": "cooking",
    "tiers": [
      {
        "id": "f_kit_1",
        "name": "Standard Setup",
        "brands": [
          "Bosch",
          "Beko",
          "Siemens basic"
        ],
        "cost": {
          "egy": 60000,
          "usa": 4000,
          "sau": 9000
        },
        "moodBonus": 1,
        "maintenancePerYear": {
          "egy": 3000,
          "usa": 250,
          "sau": 600
        },
        "desc": "Local brand fridge, basic stove, laminate counters."
      },
      {
        "id": "f_kit_2",
        "name": "Smart Kitchen",
        "brands": [
          "Bosch",
          "Siemens",
          "Samsung",
          "LG"
        ],
        "cost": {
          "egy": 200000,
          "usa": 15000,
          "sau": 32000
        },
        "moodBonus": 4,
        "valueAdd": 1.02,
        "maintenancePerYear": {
          "egy": 8000,
          "usa": 600,
          "sau": 1400
        },
        "desc": "Double-door smart fridge, built-in ovens, granite counters."
      },
      {
        "id": "f_kit_3",
        "name": "Chef's Kitchen",
        "brands": [
          "Sub-Zero",
          "Wolf",
          "Gaggenau",
          "Miele"
        ],
        "cost": {
          "egy": 700000,
          "usa": 50000,
          "sau": 105000
        },
        "moodBonus": 8,
        "valueAdd": 1.05,
        "maintenancePerYear": {
          "egy": 20000,
          "usa": 1500,
          "sau": 3500
        },
        "desc": "Sub-Zero & Wolf professional appliances, marble counters, butler pantry."
      },
      {
        "id": "f_kit_4",
        "name": "Professional Chef Kitchen",
        "brands": [
          "Gaggenau",
          "La Cornue",
          "Rational"
        ],
        "cost": {
          "egy": 2000000,
          "usa": 130000,
          "sau": 280000
        },
        "moodBonus": 15,
        "valueAdd": 1.1,
        "maintenancePerYear": {
          "egy": 45000,
          "usa": 3000,
          "sau": 7000
        },
        "desc": "Restaurant-grade equipment, La Cornue range, two islands, walk-in pantry."
      }
    ]
  },
  "bathroom": {
    "label": "Bathrooms",
    "icon": "shower",
    "tiers": [
      {
        "id": "f_bth_1",
        "name": "Standard Fixtures",
        "brands": [
          "Grohe",
          "Roca",
          "Ideal Standard"
        ],
        "cost": {
          "egy": 50000,
          "usa": 4000,
          "sau": 10000
        },
        "moodBonus": 1,
        "maintenancePerYear": {
          "egy": 2000,
          "usa": 150,
          "sau": 400
        },
        "desc": "Standard ceramics, single shower, basic vanity."
      },
      {
        "id": "f_bth_2",
        "name": "Designer Fixtures",
        "brands": [
          "Grohe",
          "Hansgrohe",
          "Kohler",
          "Duravit"
        ],
        "cost": {
          "egy": 180000,
          "usa": 12000,
          "sau": 28000
        },
        "moodBonus": 4,
        "valueAdd": 1.03,
        "maintenancePerYear": {
          "egy": 5000,
          "usa": 400,
          "sau": 1000
        },
        "desc": "Rain shower, freestanding tub, marble tiles, heated floors."
      },
      {
        "id": "f_bth_3",
        "name": "Spa-Grade Bathroom",
        "brands": [
          "Kohler",
          "Duravit",
          "Villeroy & Boch",
          "TOTO"
        ],
        "cost": {
          "egy": 500000,
          "usa": 35000,
          "sau": 75000
        },
        "moodBonus": 8,
        "valueAdd": 1.05,
        "maintenancePerYear": {
          "egy": 12000,
          "usa": 900,
          "sau": 2200
        },
        "desc": "Multi-jet shower, soaking tub, smart toilet, backlit mirrors, onyx tiles."
      },
      {
        "id": "f_bth_4",
        "name": "Marble Spa Suite",
        "brands": [
          "Bespoke",
          "Dornbracht",
          "Gessi"
        ],
        "cost": {
          "egy": 1500000,
          "usa": 90000,
          "sau": 200000
        },
        "moodBonus": 15,
        "valueAdd": 1.1,
        "maintenancePerYear": {
          "egy": 30000,
          "usa": 2000,
          "sau": 5000
        },
        "desc": "Full Italian marble, freestanding stone tub, hammam, steam shower, dual rain heads."
      }
    ]
  },
  "office": {
    "label": "Home Office",
    "icon": "briefcase",
    "tiers": [
      {
        "id": "f_off_1",
        "name": "Basic Desk Setup",
        "brands": [
          "IKEA",
          "Home Centre"
        ],
        "cost": {
          "egy": 20000,
          "usa": 1200,
          "sau": 3000
        },
        "moodBonus": 1,
        "desc": "Simple desk, office chair, bookshelf."
      },
      {
        "id": "f_off_2",
        "name": "Professional Office",
        "brands": [
          "Herman Miller",
          "Steelcase",
          "Autonomous"
        ],
        "cost": {
          "egy": 80000,
          "usa": 6000,
          "sau": 14000
        },
        "moodBonus": 3,
        "valueAdd": 1.01,
        "desc": "Height-adjustable desk, Herman Miller Aeron, ergonomic setup."
      },
      {
        "id": "f_off_3",
        "name": "Executive Office",
        "brands": [
          "Bespoke",
          "Herman Miller",
          "Knoll"
        ],
        "cost": {
          "egy": 250000,
          "usa": 15000,
          "sau": 35000
        },
        "moodBonus": 5,
        "valueAdd": 1.02,
        "desc": "Walnut executive desk, leather chair, custom shelving, video-conference setup."
      },
      {
        "id": "f_off_4",
        "name": "CEO Suite",
        "brands": [
          "Bespoke",
          "Poltrona Frau",
          "Rimadesio"
        ],
        "cost": {
          "egy": 800000,
          "usa": 50000,
          "sau": 105000
        },
        "moodBonus": 10,
        "valueAdd": 1.05,
        "desc": "Full executive suite with meeting area, private lounge, marble accents."
      }
    ]
  },
  "art": {
    "label": "Art & Collectibles",
    "icon": "art",
    "tiers": [
      {
        "id": "f_art_1",
        "name": "Local Gallery Pieces",
        "brands": [
          "Egyptian modern artists",
          "Regional galleries"
        ],
        "cost": {
          "egy": 100000,
          "usa": 6000,
          "sau": 15000
        },
        "moodBonus": 3,
        "valueAdd": 1.02,
        "appreciationRate": 0.06,
        "desc": "Originals by emerging local artists. Appreciates 6% per year."
      },
      {
        "id": "f_art_2",
        "name": "Blue-Chip Artists",
        "brands": [
          "Christie's",
          "Sotheby's",
          "Phillips"
        ],
        "cost": {
          "egy": 800000,
          "usa": 50000,
          "sau": 110000
        },
        "moodBonus": 6,
        "valueAdd": 1.06,
        "appreciationRate": 0.1,
        "desc": "Works by established contemporary artists. Appreciates 10% per year."
      },
      {
        "id": "f_art_3",
        "name": "Museum Masterpieces",
        "brands": [
          "Christie's",
          "Sotheby's"
        ],
        "cost": {
          "egy": 5000000,
          "usa": 300000,
          "sau": 650000
        },
        "moodBonus": 12,
        "valueAdd": 1.15,
        "appreciationRate": 0.15,
        "desc": "Auction-house certified masterpieces. Appreciates 15% per year."
      }
    ]
  },
  "flooring": {
    "label": "Flooring",
    "icon": "wood",
    "tiers": [
      {
        "id": "f_flr_1",
        "name": "Ceramic Tiles",
        "brands": [
          "Cleopatra",
          "Ceramica Cleopatra",
          "Emirates Ceramics"
        ],
        "cost": {
          "egy": 80000,
          "usa": 5000,
          "sau": 12000
        },
        "moodBonus": 1,
        "desc": "Standard ceramic tiles, functional, easy maintenance."
      },
      {
        "id": "f_flr_2",
        "name": "Laminate Wood",
        "brands": [
          "Quick-Step",
          "Pergo",
          "Tarkett"
        ],
        "cost": {
          "egy": 180000,
          "usa": 12000,
          "sau": 28000
        },
        "moodBonus": 3,
        "valueAdd": 1.02,
        "desc": "Wood-look laminate, modern aesthetic, warm feel."
      },
      {
        "id": "f_flr_3",
        "name": "Engineered Wood",
        "brands": [
          "Havwoods",
          "K\u00e4hrs",
          "Bauwerk"
        ],
        "cost": {
          "egy": 400000,
          "usa": 25000,
          "sau": 55000
        },
        "moodBonus": 6,
        "valueAdd": 1.04,
        "desc": "Real wood veneer, premium feel, durable."
      },
      {
        "id": "f_flr_4",
        "name": "Italian Marble / Solid Hardwood",
        "brands": [
          "Marazzi",
          "Florim",
          "Porcelanosa"
        ],
        "cost": {
          "egy": 1200000,
          "usa": 70000,
          "sau": 160000
        },
        "moodBonus": 12,
        "valueAdd": 1.08,
        "desc": "Full Italian marble or solid oak throughout, museum-grade."
      }
    ]
  },
  "walls": {
    "label": "Walls & Paint",
    "icon": "art",
    "tiers": [
      {
        "id": "f_wll_1",
        "name": "Standard Emulsion",
        "brands": [
          "Jotun",
          "Dulux",
          "Sipes"
        ],
        "cost": {
          "egy": 20000,
          "usa": 1500,
          "sau": 3500
        },
        "moodBonus": 0,
        "desc": "Basic flat paint, standard colors."
      },
      {
        "id": "f_wll_2",
        "name": "Designer Paint",
        "brands": [
          "Farrow & Ball",
          "Benjamin Moore",
          "Little Greene"
        ],
        "cost": {
          "egy": 80000,
          "usa": 5000,
          "sau": 12000
        },
        "moodBonus": 2,
        "valueAdd": 1.01,
        "desc": "Premium colors, curated palette, washable finish."
      },
      {
        "id": "f_wll_3",
        "name": "Textured & Wallpaper",
        "brands": [
          "Cole & Son",
          "Arte",
          "\u00c9litis"
        ],
        "cost": {
          "egy": 200000,
          "usa": 12000,
          "sau": 28000
        },
        "moodBonus": 4,
        "valueAdd": 1.03,
        "desc": "Designer wallpaper, plaster textures, custom accent walls."
      },
      {
        "id": "f_wll_4",
        "name": "Bespoke Plaster & Murals",
        "brands": [
          "Bespoke",
          "De Gournay"
        ],
        "cost": {
          "egy": 600000,
          "usa": 35000,
          "sau": 80000
        },
        "moodBonus": 8,
        "valueAdd": 1.05,
        "desc": "Hand-painted murals, Venetian plaster, gold leaf accents."
      }
    ]
  },
  "lighting": {
    "label": "Lighting",
    "icon": "idea",
    "tiers": [
      {
        "id": "f_lgt_1",
        "name": "Basic Fixtures",
        "brands": [
          "IKEA",
          "Home Centre"
        ],
        "cost": {
          "egy": 15000,
          "usa": 1000,
          "sau": 3000
        },
        "moodBonus": 1,
        "desc": "Standard ceiling fixtures, LED bulbs."
      },
      {
        "id": "f_lgt_2",
        "name": "Designer Fixtures",
        "brands": [
          "Tom Dixon",
          "Flos",
          "Artemide"
        ],
        "cost": {
          "egy": 80000,
          "usa": 5000,
          "sau": 12000
        },
        "moodBonus": 3,
        "valueAdd": 1.01,
        "desc": "Designer pendant lights, dimmable, statement pieces."
      },
      {
        "id": "f_lgt_3",
        "name": "Smart Lighting System",
        "brands": [
          "Lutron",
          "Philips Hue",
          "Control4"
        ],
        "cost": {
          "egy": 200000,
          "usa": 12000,
          "sau": 28000
        },
        "moodBonus": 5,
        "valueAdd": 1.03,
        "desc": "Automated scenes, voice control, circadian tuning."
      },
      {
        "id": "f_lgt_4",
        "name": "Museum-Grade Lighting",
        "brands": [
          "Bespoke",
          "Viabizzuno",
          "L&L Luce"
        ],
        "cost": {
          "egy": 500000,
          "usa": 30000,
          "sau": 65000
        },
        "moodBonus": 8,
        "valueAdd": 1.05,
        "desc": "Architectural lighting design, art-grade spots, hidden cove lighting."
      }
    ]
  },
  "curtains": {
    "label": "Curtains & Blinds",
    "icon": "window",
    "tiers": [
      {
        "id": "f_cur_1",
        "name": "Standard Blinds",
        "brands": [
          "IKEA",
          "Local makers"
        ],
        "cost": {
          "egy": 12000,
          "usa": 800,
          "sau": 2500
        },
        "moodBonus": 0,
        "desc": "Roller blinds or basic curtains."
      },
      {
        "id": "f_cur_2",
        "name": "Premium Curtains",
        "brands": [
          "Clarence House",
          "Zimmer + Rohde",
          "Marina Home"
        ],
        "cost": {
          "egy": 60000,
          "usa": 4000,
          "sau": 10000
        },
        "moodBonus": 2,
        "valueAdd": 1.01,
        "desc": "Custom blackout curtains, luxury fabrics, blackout + privacy."
      },
      {
        "id": "f_cur_3",
        "name": "Motorized Smart Blinds",
        "brands": [
          "Somfy",
          "Hunter Douglas",
          "Lutron"
        ],
        "cost": {
          "egy": 180000,
          "usa": 12000,
          "sau": 28000
        },
        "moodBonus": 4,
        "valueAdd": 1.02,
        "desc": "Motorized blinds, app-controlled, scene integration."
      }
    ]
  },
  "rugs": {
    "label": "Rugs & Carpets",
    "icon": "craft",
    "tiers": [
      {
        "id": "f_rug_1",
        "name": "Machine-Made",
        "brands": [
          "IKEA",
          "Home Centre"
        ],
        "cost": {
          "egy": 8000,
          "usa": 600,
          "sau": 1800
        },
        "moodBonus": 0,
        "desc": "Synthetic rugs, basic patterns."
      },
      {
        "id": "f_rug_2",
        "name": "Hand-Tufted Wool",
        "brands": [
          "West Elm",
          "Restoration Hardware"
        ],
        "cost": {
          "egy": 40000,
          "usa": 2500,
          "sau": 6500
        },
        "moodBonus": 2,
        "desc": "Hand-tufted wool rugs, modern patterns."
      },
      {
        "id": "f_rug_3",
        "name": "Hand-Knotted Persian",
        "brands": [
          "Persian workshops",
          "Auction houses"
        ],
        "cost": {
          "egy": 250000,
          "usa": 15000,
          "sau": 35000
        },
        "moodBonus": 4,
        "valueAdd": 1.02,
        "appreciationRate": 0.04,
        "desc": "Genuine hand-knotted Persian rugs. Appreciate 4% per year."
      }
    ]
  },
  "outdoor": {
    "label": "Outdoor & Garden",
    "icon": "tree",
    "requiresGarden": true,
    "tiers": [
      {
        "id": "f_out_1",
        "name": "Basic Outdoor",
        "brands": [
          "IKEA",
          "Home Centre"
        ],
        "cost": {
          "egy": 20000,
          "usa": 1500,
          "sau": 3500
        },
        "moodBonus": 1,
        "desc": "Basic patio furniture, plastic chairs."
      },
      {
        "id": "f_out_2",
        "name": "Premium Teak",
        "brands": [
          "Gloster",
          "Barlow Tyrie",
          "Kettal"
        ],
        "cost": {
          "egy": 120000,
          "usa": 8000,
          "sau": 18000
        },
        "moodBonus": 3,
        "valueAdd": 1.01,
        "desc": "Teak dining set, BBQ grill, outdoor rug, landscaping."
      },
      {
        "id": "f_out_3",
        "name": "Luxury Outdoor Living",
        "brands": [
          "Roda",
          "Paola Lenti",
          "Exteta"
        ],
        "cost": {
          "egy": 400000,
          "usa": 25000,
          "sau": 55000
        },
        "moodBonus": 6,
        "valueAdd": 1.03,
        "desc": "Designer outdoor lounge, pergola, fire pit, outdoor kitchen."
      },
      {
        "id": "f_out_4",
        "name": "Resort-Style Garden",
        "brands": [
          "Bespoke",
          "Custom landscape design"
        ],
        "cost": {
          "egy": 1200000,
          "usa": 70000,
          "sau": 160000
        },
        "moodBonus": 12,
        "valueAdd": 1.08,
        "desc": "Full landscape architecture, koi pond, zen garden, lighting design."
      }
    ]
  }
};
export const HOUSEHOLD_STAFF_CATALOG = {
  "maid": {
    "label": "Cleaning & Housekeeping",
    "icon": "clean",
    "variants": [
      {
        "id": "maid_pt",
        "name": "Part-time Maid (2x/week)",
        "brands": [
          "Individual",
          "Agency: MaidPro Egypt"
        ],
        "cost": {
          "egy": 3000,
          "usa": 400,
          "sau": 1200
        },
        "type": "Hourly",
        "desc": "Cleans common areas twice a week."
      },
      {
        "id": "maid_ft",
        "name": "Full-time Live-out Maid",
        "brands": [
          "Agency",
          "Individual"
        ],
        "cost": {
          "egy": 8000,
          "usa": 2000,
          "sau": 3500
        },
        "type": "Live-out",
        "desc": "Daily cleaning, laundry, basic meal prep."
      },
      {
        "id": "maid_live",
        "name": "Full-time Live-in Maid",
        "brands": [
          "Agency",
          "Filipino/Ethiopian/Nigerian placement"
        ],
        "cost": {
          "egy": 12000,
          "usa": 2800,
          "sau": 5000
        },
        "type": "Live-in",
        "reqVilla": true,
        "desc": "Lives at the home, full housekeeping + childcare support."
      }
    ]
  },
  "nanny": {
    "label": "Childcare",
    "icon": "child",
    "variants": [
      {
        "id": "nan_std",
        "name": "Standard Nanny",
        "brands": [
          "Agency",
          "Individual"
        ],
        "cost": {
          "egy": 10000,
          "usa": 2500,
          "sau": 3000
        },
        "type": "Live-out",
        "reqChild": true,
        "desc": "Supervises children during daytime."
      },
      {
        "id": "nan_elite",
        "name": "Certified Elite Governess",
        "brands": [
          "Norland College",
          "Agency: Elite Nannies"
        ],
        "cost": {
          "egy": 35000,
          "usa": 6000,
          "sau": 9000
        },
        "type": "Live-in",
        "reqChild": true,
        "smartsBonus": true,
        "desc": "Trained governess. Passively +2 smarts to children per year."
      },
      {
        "id": "nan_au_pair",
        "name": "Au Pair",
        "brands": [
          "Aupair.com",
          "Agency"
        ],
        "cost": {
          "egy": 6000,
          "usa": 1500,
          "sau": 2500
        },
        "type": "Live-in",
        "reqChild": true,
        "reqVilla": true,
        "desc": "Young international au pair. Affordable, live-in."
      }
    ]
  },
  "chef": {
    "label": "Culinary",
    "icon": "chef",
    "variants": [
      {
        "id": "chef_std",
        "name": "Family Cook",
        "brands": [
          "Individual",
          "Local chef agencies"
        ],
        "cost": {
          "egy": 15000,
          "usa": 3000,
          "sau": 4000
        },
        "type": "Daily",
        "healthBonus": 1,
        "desc": "Prepares family meals daily."
      },
      {
        "id": "chef_elite",
        "name": "Private Michelin-trained Chef",
        "brands": [
          "Le Cordon Bleu",
          "Institut Paul Bocuse"
        ],
        "cost": {
          "egy": 60000,
          "usa": 10000,
          "sau": 15000
        },
        "type": "Live-in",
        "reqVilla": true,
        "healthBonus": 5,
        "desc": "Michelin-trained chef. +5 health per year from exceptional nutrition."
      }
    ]
  },
  "security": {
    "label": "Security",
    "icon": "shield",
    "variants": [
      {
        "id": "sec_std",
        "name": "Gate Guard (Bawab)",
        "brands": [
          "Local",
          "G4S Egypt"
        ],
        "cost": {
          "egy": 5000,
          "usa": 2000,
          "sau": 2500
        },
        "type": "Live-in",
        "reqVilla": true,
        "desc": "Traditional bawab / gate security."
      },
      {
        "id": "sec_elite",
        "name": "24/7 Armed Security Team",
        "brands": [
          "G4S",
          "Control Risks",
          "Pinkerton"
        ],
        "cost": {
          "egy": 80000,
          "usa": 15000,
          "sau": 25000
        },
        "type": "Shift Team",
        "reqVilla": true,
        "desc": "Rotating armed team. Maximum security."
      }
    ]
  },
  "butler": {
    "label": "Butler & Household Management",
    "icon": "clothes",
    "variants": [
      {
        "id": "btl_std",
        "name": "Household Manager",
        "brands": [
          "Agency",
          "Individual"
        ],
        "cost": {
          "egy": 20000,
          "usa": 3500,
          "sau": 5000
        },
        "type": "Live-out",
        "reqVilla": true,
        "desc": "Manages other staff, schedules, and household operations."
      },
      {
        "id": "btl_elite",
        "name": "English-trained Butler",
        "brands": [
          "Ivor Spencer Butler School",
          "Guild of Professional English Butlers"
        ],
        "cost": {
          "egy": 50000,
          "usa": 8000,
          "sau": 12000
        },
        "type": "Live-in",
        "reqMansion": true,
        "desc": "English-trained butler. Reduces stress, manages all household matters."
      }
    ]
  },
  "chauffeur": {
    "label": "Driver & Chauffeur",
    "icon": "car",
    "variants": [
      {
        "id": "drv_std",
        "name": "Personal Driver",
        "brands": [
          "Individual",
          "Agency"
        ],
        "cost": {
          "egy": 8000,
          "usa": 2500,
          "sau": 4000
        },
        "type": "Live-out",
        "desc": "Daily driver for family errands and commutes."
      },
      {
        "id": "drv_elite",
        "name": "Executive Chauffeur",
        "brands": [
          "Agency: Elite Chauffeurs"
        ],
        "cost": {
          "egy": 20000,
          "usa": 4000,
          "sau": 7000
        },
        "type": "Live-in",
        "reqVilla": true,
        "desc": "Professional chauffeur with luxury vehicle experience."
      }
    ]
  },
  "gardener": {
    "label": "Gardener & Landscaping",
    "icon": "leaf",
    "variants": [
      {
        "id": "grd_std",
        "name": "Weekly Gardener",
        "brands": [
          "Individual",
          "Agency"
        ],
        "cost": {
          "egy": 3000,
          "usa": 500,
          "sau": 1500
        },
        "type": "Part-time",
        "reqGarden": true,
        "desc": "Weekly garden maintenance."
      },
      {
        "id": "grd_ft",
        "name": "Full-time Gardener",
        "brands": [
          "Individual",
          "Agency"
        ],
        "cost": {
          "egy": 7000,
          "usa": 2000,
          "sau": 3500
        },
        "type": "Full-time",
        "reqGarden": true,
        "desc": "Daily garden care, pruning, seasonal plantings."
      }
    ]
  },
  "personal_assistant": {
    "label": "Personal Assistant",
    "icon": "clipboard",
    "variants": [
      {
        "id": "pa_std",
        "name": "Part-time PA",
        "brands": [
          "Individual",
          "Agency"
        ],
        "cost": {
          "egy": 10000,
          "usa": 2000,
          "sau": 3000
        },
        "type": "Part-time",
        "desc": "Handles scheduling and errands 20h/week."
      },
      {
        "id": "pa_elite",
        "name": "Executive Assistant",
        "brands": [
          "Agency: Executive PA"
        ],
        "cost": {
          "egy": 25000,
          "usa": 5000,
          "sau": 8000
        },
        "type": "Full-time",
        "desc": "Full executive assistant. Manages inbox, travel, and business tasks."
      }
    ]
  },
  "tutor": {
    "label": "Tutor",
    "icon": "books",
    "variants": [
      {
        "id": "tut_std",
        "name": "School Subject Tutor",
        "brands": [
          "Local tutors",
          "Agency"
        ],
        "cost": {
          "egy": 4000,
          "usa": 800,
          "sau": 1500
        },
        "type": "Weekly",
        "reqChild": true,
        "desc": "Weekly tutoring in core subjects."
      },
      {
        "id": "tut_elite",
        "name": "Ivy League Admissions Tutor",
        "brands": [
          "Crimson Education",
          "Ivy Coach"
        ],
        "cost": {
          "egy": 30000,
          "usa": 5000,
          "sau": 10000
        },
        "type": "Weekly",
        "reqChild": true,
        "smartsBonus": true,
        "desc": "Prep for elite university admissions. Children +3 smarts/year."
      }
    ]
  },
  "personal_trainer": {
    "label": "Personal Trainer",
    "icon": "fitness",
    "variants": [
      {
        "id": "pt_std",
        "name": "Personal Trainer (2x/week)",
        "brands": [
          "Individual",
          "Agency"
        ],
        "cost": {
          "egy": 5000,
          "usa": 800,
          "sau": 1500
        },
        "type": "Weekly",
        "healthBonus": 1,
        "desc": "Personal training twice a week."
      },
      {
        "id": "pt_elite",
        "name": "Elite Performance Coach",
        "brands": [
          "EXOS",
          "Athletes' Performance"
        ],
        "cost": {
          "egy": 20000,
          "usa": 3500,
          "sau": 6000
        },
        "type": "Weekly",
        "healthBonus": 3,
        "desc": "Elite performance coaching. +3 health per year."
      }
    ]
  },
  "home_nurse": {
    "label": "Home Nursing & Health Visits",
    "icon": "medical",
    "variants": [
      {
        "id": "nurse_visit",
        "name": "Visiting Home Nurse (weekly)",
        "brands": [
          "Licensed local nurse",
          "Home-care agency"
        ],
        "cost": {
          "egy": 9000,
          "usa": 1800,
          "sau": 3500
        },
        "type": "Weekly visits",
        "healthBonus": 1,
        "elderCareBonus": 1,
        "desc": "Checks on household health and helps older relatives manage routine care."
      },
      {
        "id": "nurse_daily",
        "name": "Regular Home-care Nurse",
        "brands": [
          "Licensed home-care agency"
        ],
        "cost": {
          "egy": 26000,
          "usa": 4800,
          "sau": 9000
        },
        "type": "Daily visits",
        "healthBonus": 2,
        "elderCareBonus": 3,
        "desc": "Ongoing practical care for a household member who needs regular support."
      }
    ]
  },
  "family_caregiver": {
    "label": "Family Care Support",
    "icon": "handshake",
    "variants": [
      {
        "id": "elder_companion",
        "name": "Part-time Elder Companion",
        "brands": [
          "Individual",
          "Local care agency"
        ],
        "cost": {
          "egy": 7000,
          "usa": 1400,
          "sau": 2800
        },
        "type": "Daytime visits",
        "elderCareBonus": 2,
        "desc": "Provides company and help with errands for an older parent."
      }
    ]
  },
  "massage_therapist": {
    "label": "Massage Therapist",
    "icon": "spa",
    "variants": [
      {
        "id": "mt_std",
        "name": "On-call Massage Therapist",
        "brands": [
          "Agency",
          "Individual"
        ],
        "cost": {
          "egy": 4000,
          "usa": 800,
          "sau": 1500
        },
        "type": "On-call",
        "healthBonus": 1,
        "moodBonus": 2,
        "desc": "Home massage sessions on request."
      }
    ]
  },
  "pool_cleaner": {
    "label": "Pool Cleaner",
    "icon": "swim",
    "variants": [
      {
        "id": "pc_std",
        "name": "Weekly Pool Service",
        "brands": [
          "Agency",
          "Individual"
        ],
        "cost": {
          "egy": 2000,
          "usa": 400,
          "sau": 900
        },
        "type": "Weekly",
        "reqPool": true,
        "desc": "Weekly pool cleaning and chemical balancing."
      }
    ]
  }
};
export const PROPERTY_DEV_SPECS = {
  "PROJECT_TYPES": [
    {
      "id": "house",
      "label": "Single house",
      "minPlot": 80,
      "maxFloors": 2,
      "unitsPerFloor": 1,
      "footprint": 0.4,
      "buildMonths": 8,
      "desc": "One family house on the plot."
    },
    {
      "id": "villa",
      "label": "Villa",
      "minPlot": 150,
      "maxFloors": 3,
      "unitsPerFloor": 1,
      "footprint": 0.35,
      "buildMonths": 11,
      "desc": "Larger private villa with garden setbacks."
    },
    {
      "id": "townhouse",
      "label": "Townhouse row",
      "minPlot": 100,
      "maxFloors": 3,
      "unitsPerFloor": 1,
      "footprint": 0.5,
      "buildMonths": 10,
      "desc": "Attached townhouse style \u2014 efficient footprint."
    },
    {
      "id": "duplex",
      "label": "Duplex / two units",
      "minPlot": 120,
      "maxFloors": 2,
      "unitsPerFloor": 1,
      "footprint": 0.45,
      "buildMonths": 10,
      "desc": "Two stacked residences \u2014 keep one, rent/sell the other."
    },
    {
      "id": "triplex",
      "label": "Triplex",
      "minPlot": 140,
      "maxFloors": 3,
      "unitsPerFloor": 1,
      "footprint": 0.48,
      "buildMonths": 12,
      "desc": "Three stacked units \u2014 classic income house."
    },
    {
      "id": "small_building",
      "label": "Small apartment building",
      "minPlot": 200,
      "maxFloors": 6,
      "unitsPerFloor": 2,
      "footprint": 0.55,
      "buildMonths": 15,
      "desc": "Walk-up or mid-rise with multiple apartments."
    },
    {
      "id": "urban_midrise",
      "label": "Urban apartment building",
      "minPlot": 220,
      "maxFloors": 10,
      "unitsPerFloor": 2,
      "footprint": 0.65,
      "buildMonths": 18,
      "desc": "Compact urban apartment block. Street width, setbacks, zoning and the actual permit determine how many floors are legal."
    },
    {
      "id": "mid_rise",
      "label": "Mid-rise building",
      "minPlot": 350,
      "maxFloors": 10,
      "unitsPerFloor": 3,
      "footprint": 0.55,
      "buildMonths": 20,
      "desc": "Serious density \u2014 elevator recommended."
    },
    {
      "id": "tower",
      "label": "Residential tower",
      "minPlot": 500,
      "maxFloors": 20,
      "unitsPerFloor": 4,
      "footprint": 0.45,
      "buildMonths": 34,
      "desc": "High-rise (where zoning allows). Long build, high unit count."
    },
    {
      "id": "complex",
      "label": "Building complex",
      "minPlot": 800,
      "maxFloors": 12,
      "unitsPerFloor": 4,
      "footprint": 0.5,
      "buildMonths": 30,
      "desc": "Large plot: multiple blocks / high unit count."
    },
    {
      "id": "mixed_use",
      "label": "Mixed-use (shops + flats)",
      "minPlot": 250,
      "maxFloors": 8,
      "unitsPerFloor": 3,
      "footprint": 0.6,
      "buildMonths": 18,
      "desc": "Ground-floor commercial + residential above \u2014 higher yield potential."
    }
  ],
  "MATERIALS": [
    {
      "id": "mud_brick",
      "label": "Traditional brick / adobe",
      "mult": 0.7,
      "fromYear": 1900,
      "quality": 0.82
    },
    {
      "id": "basic_brick",
      "label": "Brick / block",
      "mult": 0.85,
      "fromYear": 1950,
      "quality": 0.9
    },
    {
      "id": "reinforced",
      "label": "Reinforced concrete",
      "mult": 1,
      "fromYear": 1965,
      "quality": 1
    },
    {
      "id": "steel_frame",
      "label": "Steel frame",
      "mult": 1.25,
      "fromYear": 1985,
      "quality": 1.08
    },
    {
      "id": "precast",
      "label": "Precast panels",
      "mult": 1.15,
      "fromYear": 1995,
      "quality": 1.05
    },
    {
      "id": "premium_composite",
      "label": "Premium composite / cladding",
      "mult": 1.55,
      "fromYear": 2005,
      "quality": 1.15
    },
    {
      "id": "green_mass",
      "label": "High-efficiency / green build",
      "mult": 1.4,
      "fromYear": 2015,
      "quality": 1.12
    }
  ],
  "FINISHES": [
    {
      "id": "shell",
      "label": "Core & shell only",
      "mult": 0.7,
      "fromYear": 1950
    },
    {
      "id": "basic",
      "label": "Basic finish",
      "mult": 0.9,
      "fromYear": 1950
    },
    {
      "id": "standard",
      "label": "Standard finish",
      "mult": 1,
      "fromYear": 1970
    },
    {
      "id": "premium",
      "label": "Premium finish",
      "mult": 1.35,
      "fromYear": 1990
    },
    {
      "id": "luxury",
      "label": "Luxury finish",
      "mult": 1.8,
      "fromYear": 2000
    },
    {
      "id": "ultra",
      "label": "Ultra / turn-key designer",
      "mult": 2.3,
      "fromYear": 2012
    }
  ],
  "DOORS": [
    {
      "id": "wood",
      "label": "Standard wood",
      "addPerUnit": 800,
      "fromYear": 1950
    },
    {
      "id": "metal",
      "label": "Metal entry",
      "addPerUnit": 1400,
      "fromYear": 1970
    },
    {
      "id": "security",
      "label": "Security doors",
      "addPerUnit": 2200,
      "fromYear": 1985
    },
    {
      "id": "fire",
      "label": "Fire-rated doors",
      "addPerUnit": 2800,
      "fromYear": 1995
    },
    {
      "id": "smart",
      "label": "Smart / premium entry",
      "addPerUnit": 6000,
      "fromYear": 2015
    }
  ],
  "FLOORING": [
    {
      "id": "cement",
      "label": "Cement / basic tile",
      "mult": 0.9,
      "fromYear": 1950
    },
    {
      "id": "ceramic",
      "label": "Ceramic tile",
      "mult": 1,
      "fromYear": 1960
    },
    {
      "id": "porcelain",
      "label": "Porcelain",
      "mult": 1.12,
      "fromYear": 1990
    },
    {
      "id": "marble",
      "label": "Marble / stone",
      "mult": 1.25,
      "fromYear": 1980
    },
    {
      "id": "hardwood",
      "label": "Hardwood",
      "mult": 1.3,
      "fromYear": 1975
    },
    {
      "id": "luxury_vinyl",
      "label": "Luxury vinyl / modern",
      "mult": 1.15,
      "fromYear": 2010
    }
  ],
  "ROOFS": [
    {
      "id": "flat_basic",
      "label": "Flat roof basic",
      "mult": 1,
      "fromYear": 1950
    },
    {
      "id": "flat_insulated",
      "label": "Flat insulated + membrane",
      "mult": 1.12,
      "fromYear": 1990
    },
    {
      "id": "pitched",
      "label": "Pitched / tiled",
      "mult": 1.18,
      "fromYear": 1970
    },
    {
      "id": "green_roof",
      "label": "Green / garden roof",
      "mult": 1.35,
      "fromYear": 2010
    }
  ],
  "WINDOWS": [
    {
      "id": "single",
      "label": "Single glaze",
      "mult": 1,
      "fromYear": 1950
    },
    {
      "id": "double",
      "label": "Double glaze",
      "mult": 1.1,
      "fromYear": 1990
    },
    {
      "id": "triple",
      "label": "Triple / acoustic",
      "mult": 1.22,
      "fromYear": 2010
    },
    {
      "id": "curtain",
      "label": "Curtain wall / panoramic",
      "mult": 1.4,
      "fromYear": 2005
    }
  ],
  "PARKING": [
    {
      "id": "street",
      "label": "Street only",
      "mult": 0,
      "slotsMult": 0,
      "fromYear": 1950
    },
    {
      "id": "open",
      "label": "Open courtyard parking",
      "mult": 0.04,
      "slotsMult": 1,
      "fromYear": 1970
    },
    {
      "id": "covered",
      "label": "Covered / carport",
      "mult": 0.08,
      "slotsMult": 1,
      "fromYear": 1985
    },
    {
      "id": "basement",
      "label": "Basement garage",
      "mult": 0.18,
      "slotsMult": 1.2,
      "fromYear": 1995
    },
    {
      "id": "podium",
      "label": "Podium parking",
      "mult": 0.15,
      "slotsMult": 1.3,
      "fromYear": 2005
    }
  ],
  "AMENITIES": [
    {
      "id": "none",
      "label": "No shared amenities",
      "add": 0,
      "fromYear": 1950
    },
    {
      "id": "lobby",
      "label": "Finished lobby",
      "add": 0.03,
      "fromYear": 1985
    },
    {
      "id": "gym",
      "label": "Small gym room",
      "add": 0.04,
      "fromYear": 2005
    },
    {
      "id": "concierge",
      "label": "Concierge desk",
      "add": 0.05,
      "fromYear": 2000
    },
    {
      "id": "pool_shared",
      "label": "Shared pool",
      "add": 0.08,
      "fromYear": 1995
    },
    {
      "id": "full_club",
      "label": "Clubhouse package",
      "add": 0.12,
      "fromYear": 2010
    }
  ],
  "CONTRACTORS": [
    {
      "id": "local_crew",
      "label": "Local crew",
      "mult": 0.88,
      "overrunRisk": 0.34,
      "delayRisk": 0.28,
      "quality": 0.92,
      "fromYear": 1950,
      "desc": "Cheapest quote. Uneven quality, frequent delays and change orders."
    },
    {
      "id": "firm",
      "label": "Established firm",
      "mult": 1,
      "overrunRisk": 0.17,
      "delayRisk": 0.14,
      "quality": 1,
      "fromYear": 1965,
      "desc": "Standard market contractor. Predictable price and schedule."
    },
    {
      "id": "premium",
      "label": "Premium contractor",
      "mult": 1.22,
      "overrunRisk": 0.06,
      "delayRisk": 0.05,
      "quality": 1.1,
      "fromYear": 1985,
      "desc": "Top tier. Costs more, finishes on time, holds value better."
    }
  ],
  "PAY_PLANS": [
    {
      "id": "cash",
      "label": "Pay in full (cash)",
      "downPct": 1,
      "premiumPct": 0,
      "discountPct": 0.02,
      "fromYear": 1950,
      "desc": "Full budget at signing. Contractors knock ~2% off for cash."
    },
    {
      "id": "staged",
      "label": "Staged payments",
      "downPct": 0.3,
      "premiumPct": 0.08,
      "discountPct": 0,
      "fromYear": 1975,
      "desc": "30% down, remainder in yearly progress payments at +8%/yr financing."
    }
  ],
  "COUNTRY_RULES": {
    "egy": {
      "maxFloorsDefault": 12,
      "maxFloorsWithoutElevator": 5,
      "permitPct": 0.06,
      "parkingPerUnit": 0.5,
      "elevatorFromYear": 1975,
      "earthquakeCodeFrom": 1992,
      "note": "Municipal permit + often syndicate engineer stamp. Coastal / heritage zones may block tall builds."
    },
    "usa": {
      "maxFloorsDefault": 8,
      "maxFloorsWithoutElevator": 3,
      "permitPct": 0.1,
      "parkingPerUnit": 1,
      "elevatorFromYear": 1960,
      "earthquakeCodeFrom": 1975,
      "note": "Zoning + building permit. Parking and setbacks enforced by municipality."
    },
    "uk": {
      "maxFloorsDefault": 6,
      "maxFloorsWithoutElevator": 3,
      "permitPct": 0.12,
      "parkingPerUnit": 0.4,
      "elevatorFromYear": 1965,
      "earthquakeCodeFrom": 1980,
      "note": "Planning permission required. Conservation areas restrict height and fa\u00e7ade."
    },
    "sau": {
      "maxFloorsDefault": 10,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.07,
      "parkingPerUnit": 1,
      "elevatorFromYear": 1980,
      "earthquakeCodeFrom": 1990,
      "note": "Baladiya permit. Large projects may need civil defense approval."
    },
    "uae": {
      "maxFloorsDefault": 15,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.08,
      "parkingPerUnit": 1.2,
      "elevatorFromYear": 1985,
      "earthquakeCodeFrom": 1995,
      "note": "DEWA/authority NOCs for utilities. Strict parking ratios in cities."
    },
    "deu": {
      "maxFloorsDefault": 6,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.11,
      "parkingPerUnit": 0.8,
      "elevatorFromYear": 1970,
      "earthquakeCodeFrom": 1985,
      "note": "Baugenehmigung. Energy standards tighten after 2000s."
    },
    "can": {
      "maxFloorsDefault": 8,
      "maxFloorsWithoutElevator": 3,
      "permitPct": 0.1,
      "parkingPerUnit": 1,
      "elevatorFromYear": 1965,
      "earthquakeCodeFrom": 1980,
      "note": "Municipal zoning + building code."
    },
    "che": {
      "maxFloorsDefault": 6,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.10,
      "parkingPerUnit": 0.8,
      "elevatorFromYear": 1970,
      "earthquakeCodeFrom": 1989,
      "note": "Baubewilligung (cantonal building permit). Strict zoning; Minergie energy standards."
    },
    "swe": {
      "maxFloorsDefault": 8,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.09,
      "parkingPerUnit": 0.7,
      "elevatorFromYear": 1970,
      "earthquakeCodeFrom": 1980,
      "note": "Bygglov (building permit) from the municipality. Detailed development plan (detaljplan) governs use."
    },
    "gbr": {
      "maxFloorsDefault": 6,
      "maxFloorsWithoutElevator": 3,
      "permitPct": 0.12,
      "parkingPerUnit": 0.4,
      "elevatorFromYear": 1965,
      "earthquakeCodeFrom": 1980,
      "note": "Planning permission required. Conservation areas restrict height and façade."
    },
    "aus": {
      "maxFloorsDefault": 8,
      "maxFloorsWithoutElevator": 3,
      "permitPct": 0.08,
      "parkingPerUnit": 1,
      "elevatorFromYear": 1970,
      "earthquakeCodeFrom": 1979,
      "note": "Development approval + building permit. National Construction Code standards."
    },
    "nld": {
      "maxFloorsDefault": 6,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.10,
      "parkingPerUnit": 0.7,
      "elevatorFromYear": 1970,
      "earthquakeCodeFrom": 1990,
      "note": "Omgevingsvergunning (environmental permit). Strict energy performance (BENG)."
    },
    "fra": {
      "maxFloorsDefault": 8,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.11,
      "parkingPerUnit": 0.8,
      "elevatorFromYear": 1970,
      "earthquakeCodeFrom": 1992,
      "note": "Permis de construire. PLU zoning governs height and use."
    },
    "jpn": {
      "maxFloorsDefault": 10,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.09,
      "parkingPerUnit": 0.7,
      "elevatorFromYear": 1970,
      "earthquakeCodeFrom": 1981,
      "note": "Building Standards Act; the 1981 seismic code is the key break."
    },
    "ita": {
      "maxFloorsDefault": 6,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.11,
      "parkingPerUnit": 0.7,
      "elevatorFromYear": 1970,
      "earthquakeCodeFrom": 1974,
      "note": "Permesso di costruire. Seismic zones (1974 law) restrict height."
    },
    "sgp": {
      "maxFloorsDefault": 15,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.07,
      "parkingPerUnit": 1,
      "elevatorFromYear": 1985,
      "earthquakeCodeFrom": 1990,
      "note": "URA planning permission + BCA building plan approval."
    },
    "bra": {
      "maxFloorsDefault": 10,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.08,
      "parkingPerUnit": 1,
      "elevatorFromYear": 1975,
      "earthquakeCodeFrom": 1990,
      "note": "Alvará de construção. Municipal master plan (Plano Diretor) governs."
    },
    "ind": {
      "maxFloorsDefault": 10,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.07,
      "parkingPerUnit": 0.8,
      "elevatorFromYear": 1975,
      "earthquakeCodeFrom": 1993,
      "note": "Building plan approval from the municipal corporation. NBC seismic zones."
    },
    "tur": {
      "maxFloorsDefault": 10,
      "maxFloorsWithoutElevator": 4,
      "permitPct": 0.08,
      "parkingPerUnit": 0.7,
      "elevatorFromYear": 1980,
      "earthquakeCodeFrom": 1999,
      "note": "Post-1999 earthquake codes matter for mid/high-rise."
    }
  }
};

/* v2.1: developer registry — v86.63 js/03 (35) + js/11g (10) + che/swe/tur (9). */
export const DEVELOPERS = {
  "egy": [
    {
      "id": "tmg",
      "name": "Talaat Moustafa Group",
      "nameAr": "طلعت مصطفى",
      "country": "egy",
      "city": "",
      "founded": 1967,
      "reputation": 5,
      "listed": true,
      "projects": ["madinaty", "noor", "southmed", "celia", "rehab", "telal_sokhna", "al_rabwa", "virginia_beach", "may_fair"]
    },
    {
      "id": "katameya",
      "name": "Katameya Heights Golf & Tennis Resort",
      "nameAr": "قطامية هايتس",
      "country": "egy",
      "city": "",
      "founded": 1994,
      "reputation": 5,
      "listed": false,
      "projects": ["katameya_heights"]
    },
    {
      "id": "emaar_misr",
      "name": "Emaar Misr",
      "nameAr": "إعمار مصر",
      "country": "egy",
      "city": "",
      "founded": 2005,
      "reputation": 5,
      "listed": true,
      "projects": ["marassi", "mivida", "cairogate", "aeon"]
    },
    {
      "id": "sodic",
      "name": "SODIC",
      "nameAr": "سوديك",
      "country": "egy",
      "city": "",
      "founded": 1996,
      "reputation": 5,
      "listed": true,
      "projects": ["beverly_hills", "villette", "allegria", "eastown", "westown", "zed_east", "june", "vye", "karmell", "mizar", "village_gate"]
    },
    {
      "id": "palmhills",
      "name": "Palm Hills Developments",
      "nameAr": "بالم هيلز",
      "country": "egy",
      "city": "",
      "founded": 1997,
      "reputation": 4,
      "listed": true,
      "projects": ["palmhills_nc", "badya", "palmhills_alex", "hacienda_waters", "hacienda_bay"]
    },
    {
      "id": "mountain_view",
      "name": "Mountain View (DMG)",
      "nameAr": "ماونتن فيو",
      "country": "egy",
      "city": "",
      "founded": 2006,
      "reputation": 4,
      "listed": false,
      "projects": ["mvic_nc", "mv_ras_elhekma"]
    },
    {
      "id": "ora",
      "name": "ORA Developers",
      "nameAr": "أورا",
      "country": "egy",
      "city": "",
      "founded": 2016,
      "reputation": 4,
      "listed": false,
      "projects": ["zed_zayed", "silversands", "oia"]
    },
    {
      "id": "hassan_allam",
      "name": "Hassan Allam Properties",
      "nameAr": "حسن علام",
      "country": "egy",
      "city": "",
      "founded": 2016,
      "reputation": 4,
      "listed": false,
      "projects": ["swanlake_residence", "swanlake_west"]
    },
    {
      "id": "orascom",
      "name": "Orascom Development",
      "nameAr": "أوراسكوم",
      "country": "egy",
      "city": "",
      "founded": 1989,
      "reputation": 5,
      "listed": true,
      "projects": ["gouna_enclave", "owest", "makadi"]
    },
    {
      "id": "city_edge",
      "name": "City Edge Developments",
      "nameAr": "سيتي إيدج",
      "country": "egy",
      "city": "",
      "founded": 2017,
      "reputation": 4,
      "listed": false,
      "projects": ["north_edge_towers", "new_alamein_towers", "al_maqsad", "mazarine"]
    },
    {
      "id": "misr_italia",
      "name": "Misr Italia Properties",
      "nameAr": "مصر إيطاليا",
      "country": "egy",
      "city": "",
      "founded": 1998,
      "reputation": 4,
      "listed": false,
      "projects": ["el_patio", "el_patio_oro", "il_bosco", "cairo_business_plaza"]
    },
    {
      "id": "tatweer",
      "name": "Tatweer Misr",
      "nameAr": "تطوير مصر",
      "country": "egy",
      "city": "",
      "founded": 2014,
      "reputation": 4,
      "listed": false,
      "projects": ["il_monte_galala", "bloomfields", "salt"]
    },
    {
      "id": "la_vista",
      "name": "La Vista Developments",
      "nameAr": "لافيستا",
      "country": "egy",
      "city": "",
      "founded": 2001,
      "reputation": 4,
      "listed": false,
      "projects": ["la_vista", "la_vista_topaz", "la_vista_city"]
    },
    {
      "id": "al_futtaim",
      "name": "Al Futtaim Group",
      "nameAr": "الفطيم",
      "country": "egy",
      "city": "",
      "founded": 1930,
      "reputation": 5,
      "listed": true,
      "projects": ["cairo_festival", "iconic_tower"]
    },
    {
      "id": "madinet_nasr",
      "name": "Madinet Nasr for Housing",
      "nameAr": "مدينة نصر",
      "country": "egy",
      "city": "",
      "founded": 1959,
      "reputation": 4,
      "listed": true,
      "projects": ["sarai", "taj_city"]
    },
    {
      "id": "inertia",
      "name": "Inertia",
      "nameAr": "إنيرشيا",
      "country": "egy",
      "city": "",
      "founded": 2017,
      "reputation": 3,
      "listed": false,
      "projects": ["jefaira", "rokn", "the_hive"]
    },
    {
      "id": "sed",
      "name": "Saudi Egyptian Developers (SED)",
      "nameAr": "سيد",
      "country": "egy",
      "city": "",
      "founded": 2004,
      "reputation": 3,
      "listed": false,
      "projects": ["sawary"]
    },
    {
      "id": "hyde_park_dev",
      "name": "Hyde Park Developments",
      "nameAr": "هايد بارك",
      "country": "egy",
      "city": "",
      "founded": 2007,
      "reputation": 4,
      "listed": false,
      "projects": ["hyde_park_nc", "hyde_park_west"]
    },
    {
      "id": "x-dev-roya",
      "name": "ROYA Developments",
      "country": "egy",
      "city": "Cairo",
      "founded": 2007,
      "reputation": 4,
      "listed": false,
      "projects": ["Stone Park"]
    },
    {
      "id": "x-dev-akam",
      "name": "Akam Developments",
      "country": "egy",
      "city": "New Cairo",
      "founded": 2017,
      "reputation": 4,
      "listed": false,
      "projects": ["Scenario"]
    },
    {
      "id": "x-dev-cred",
      "name": "Cred Developments",
      "country": "egy",
      "city": "New Cairo",
      "founded": 2019,
      "reputation": 3,
      "listed": false,
      "projects": []
    },
    {
      "id": "x-dev-ahly-sabbour",
      "name": "Al Ahly Sabbour",
      "country": "egy",
      "city": "Cairo",
      "founded": 1994,
      "reputation": 4,
      "listed": true,
      "projects": []
    }
  ],
  "usa": [
    {
      "id": "related",
      "name": "Related Companies",
      "country": "usa",
      "city": "",
      "founded": 1972,
      "reputation": 5,
      "listed": false,
      "projects": ["hudson_yards"]
    },
    {
      "id": "toll",
      "name": "Toll Brothers",
      "country": "usa",
      "city": "",
      "founded": 1967,
      "reputation": 5,
      "listed": true,
      "projects": ["estates_at_westwood"]
    },
    {
      "id": "lennar",
      "name": "Lennar",
      "country": "usa",
      "city": "",
      "founded": 1954,
      "reputation": 4,
      "listed": true,
      "projects": []
    },
    {
      "id": "swire",
      "name": "Swire Properties",
      "country": "usa",
      "city": "",
      "founded": 1972,
      "reputation": 5,
      "listed": true,
      "projects": ["brickell_city_centre"]
    },
    {
      "id": "dezer",
      "name": "Dezer Development",
      "country": "usa",
      "city": "",
      "founded": 1980,
      "reputation": 4,
      "listed": false,
      "projects": ["porsche_design_tower"]
    },
    {
      "id": "hines",
      "name": "Hines",
      "country": "usa",
      "city": "",
      "founded": 1957,
      "reputation": 5,
      "listed": false,
      "projects": ["wolf_point"]
    },
    {
      "id": "tishman",
      "name": "Tishman Speyer",
      "country": "usa",
      "city": "",
      "founded": 1978,
      "reputation": 5,
      "listed": false,
      "projects": []
    }
  ],
  "sau": [
    {
      "id": "roshn",
      "name": "ROSHN Group (PIF)",
      "country": "sau",
      "city": "",
      "founded": 2019,
      "reputation": 5,
      "listed": true,
      "projects": ["roshn_sedra"]
    },
    {
      "id": "diriyah",
      "name": "Diriyah Gate Development Authority",
      "country": "sau",
      "city": "",
      "founded": 2017,
      "reputation": 5,
      "listed": false,
      "projects": ["diriyah_residences"]
    },
    {
      "id": "dar_arkan",
      "name": "Dar Al Arkan",
      "country": "sau",
      "city": "",
      "founded": 1994,
      "reputation": 4,
      "listed": true,
      "projects": ["shams_ar_riyadh"]
    },
    {
      "id": "emaar_ksa",
      "name": "Emaar Saudi Arabia",
      "country": "sau",
      "city": "",
      "founded": 2016,
      "reputation": 5,
      "listed": true,
      "projects": []
    },
    {
      "id": "nhc",
      "name": "National Housing Company",
      "country": "sau",
      "city": "",
      "founded": 2016,
      "reputation": 4,
      "listed": false,
      "projects": []
    },
    {
      "id": "x-dev-retal",
      "name": "Retal Urban Development",
      "country": "sau",
      "city": "Riyadh",
      "founded": 2012,
      "reputation": 4,
      "listed": true,
      "projects": ["Nesaj Town"]
    }
  ],
  "uae": [
    {
      "id": "emaar_uae",
      "name": "Emaar Properties",
      "country": "uae",
      "city": "",
      "founded": 1997,
      "reputation": 5,
      "listed": true,
      "projects": ["downtown_views"]
    },
    {
      "id": "nakheel",
      "name": "Nakheel",
      "country": "uae",
      "city": "",
      "founded": 2000,
      "reputation": 5,
      "listed": false,
      "projects": ["palm_jumeirah_villas"]
    },
    {
      "id": "damac",
      "name": "DAMAC Properties",
      "country": "uae",
      "city": "",
      "founded": 2002,
      "reputation": 4,
      "listed": true,
      "projects": []
    },
    {
      "id": "aldar",
      "name": "Aldar Properties",
      "country": "uae",
      "city": "",
      "founded": 2004,
      "reputation": 5,
      "listed": true,
      "projects": []
    },
    {
      "id": "sobha",
      "name": "Sobha Realty",
      "country": "uae",
      "city": "",
      "founded": 1976,
      "reputation": 4,
      "listed": true,
      "projects": []
    },
    {
      "id": "x-dev-azizi",
      "name": "Azizi Developments",
      "country": "uae",
      "city": "Dubai",
      "founded": 2007,
      "reputation": 4,
      "listed": false,
      "projects": ["Azizi Riviera"]
    },
    {
      "id": "x-dev-deyaar",
      "name": "Deyaar Development",
      "country": "uae",
      "city": "Dubai",
      "founded": 2002,
      "reputation": 4,
      "listed": true,
      "projects": ["Mont Rose"]
    },
    {
      "id": "x-dev-union-prop",
      "name": "Union Properties",
      "country": "uae",
      "city": "Dubai",
      "founded": 1987,
      "reputation": 3,
      "listed": true,
      "projects": []
    }
  ],
  "gbr": [
    {
      "id": "x-dev-berkeley",
      "name": "Berkeley Group",
      "country": "gbr",
      "city": "London",
      "founded": 1976,
      "reputation": 5,
      "listed": true,
      "projects": ["Kidbrooke Village"]
    },
    {
      "id": "x-dev-barratt",
      "name": "Barratt Developments",
      "country": "gbr",
      "city": "London",
      "founded": 1958,
      "reputation": 4,
      "listed": true,
      "projects": ["Barratt London"]
    }
  ],
  "che": [
    {
      "id": "che-mobimo",
      "name": "Mobimo",
      "country": "che",
      "city": "Zurich",
      "founded": 1999,
      "reputation": 4,
      "listed": true,
      "projects": []
    },
    {
      "id": "che-allreal",
      "name": "Allreal",
      "country": "che",
      "city": "Zurich",
      "founded": 1999,
      "reputation": 4,
      "listed": true,
      "projects": []
    },
    {
      "id": "che-sps",
      "name": "Swiss Prime Site",
      "country": "che",
      "city": "Zug",
      "founded": 1999,
      "reputation": 4,
      "listed": true,
      "projects": []
    }
  ],
  "swe": [
    {
      "id": "swe-jm",
      "name": "JM",
      "country": "swe",
      "city": "Stockholm",
      "founded": 1945,
      "reputation": 4,
      "listed": true,
      "projects": []
    },
    {
      "id": "swe-skanska",
      "name": "Skanska",
      "country": "swe",
      "city": "Stockholm",
      "founded": 1887,
      "reputation": 5,
      "listed": true,
      "projects": []
    },
    {
      "id": "swe-bonava",
      "name": "Bonava",
      "country": "swe",
      "city": "Stockholm",
      "founded": 2016,
      "reputation": 4,
      "listed": true,
      "projects": []
    }
  ],
  "tur": [
    {
      "id": "tur-emlak-konut",
      "name": "Emlak Konut",
      "country": "tur",
      "city": "Istanbul",
      "founded": 1953,
      "reputation": 4,
      "listed": true,
      "projects": []
    },
    {
      "id": "tur-agaoglu",
      "name": "Ağaoğlu",
      "country": "tur",
      "city": "Istanbul",
      "founded": 1981,
      "reputation": 4,
      "listed": false,
      "projects": []
    },
    {
      "id": "tur-toki",
      "name": "TOKİ",
      "country": "tur",
      "city": "Ankara",
      "founded": 1984,
      "reputation": 3,
      "listed": false,
      "projects": []
    }
  ]
};
