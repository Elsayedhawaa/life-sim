/* ============================================================
   WORLD LIFE — DATA: LIFESTYLE (EXPANDED & DETAILED)
   ============================================================
   Pure data. Uses LIFE_ prefix to avoid collision.
   All prices stored in each country's NATIVE currency — no conversion.
   Includes expanded countries: Egypt (egy), USA (usa), Saudi Arabia (sau),
   UAE (uae), United Kingdom (uk), and Germany (deu).
   ============================================================ */

/* ---------- PLANS PER COUNTRY ---------- */
const LIFE_PLANS = {
  egy: {
    currency: 'EGP',
    phone: [
      { id: 'prepaid',          label: 'Prepaid Pay-As-You-Go',   monthly: 150,   perks: 'Basic calls + 5GB emergency data' },
      { id: 'basic',            label: 'Basic Postpaid',          monthly: 400,   perks: '30GB data + local minutes' },
      { id: 'mid',              label: 'Mid Postpaid (WE/Vodafone)', monthly: 800, perks: '60GB + unlimited social media' },
      { id: 'premium',          label: 'Red/VIP Postpaid',        monthly: 1500,  perks: '120GB + free roaming + family line' },
      { id: 'ultra',            label: 'Executive Unlimited',     monthly: 3000,  perks: 'Unlimited 5G + global roaming + concierge' }
    ],
    internet: [
      { id: 'basic',            label: 'ADSL 30GB (14 Mbps)',     monthly: 350,   perks: 'Throttled after quota' },
      { id: 'standard',         label: 'Fiber 140GB (30 Mbps)',   monthly: 700,   perks: 'Good for single user' },
      { id: 'premium',          label: 'Fiber 250GB (70 Mbps)',   monthly: 1500,  perks: 'Multiple HD streams' },
      { id: 'unlimited',        label: 'Fiber 600GB (100 Mbps)',  monthly: 2500,  perks: 'Gaming + 4K streaming' },
      { id: 'gigabit',          label: 'Dedicated Compound Fiber (200 Mbps)', monthly: 4500, perks: 'SLA guarantee + static IP' }
    ],
    utilities: [
      { id: 'low',              label: 'Low usage (Fan only)',    monthly: 500,   perks: 'Basic light + gas' },
      { id: 'standard',         label: 'Standard (1 AC unit)',    monthly: 1200,  perks: 'Moderate summertime AC' },
      { id: 'high',             label: 'High (ACs often)',        monthly: 2500,  perks: 'Multiple ACs running daily' },
      { id: 'luxury',           label: 'Luxury (AC 24/7 + Pool)', monthly: 5000,  perks: 'Central climate control + water pumps' },
      { id: 'compound_villa',   label: 'Estate Compound Power',   monthly: 12000, perks: 'Garden sprinklers + outdoor heating + backup generator' }
    ],
    food: [
      { id: 'survival',         label: 'Survival (Bread/Beans)',  monthly: 2500,  perks: 'Strict ration market food' },
      { id: 'budget',           label: 'Local Baladi Markets',    monthly: 5000,  perks: 'Fresh vegetables + local meats' },
      { id: 'standard',         label: 'Hyperone / Carrefour',    monthly: 10000, perks: 'Standard grocery basket' },
      { id: 'premium',          label: 'Gourmet / Seoudi Market', monthly: 20000, perks: 'Imported cheese, organic meat & seafood' },
      { id: 'luxury',           label: 'Imported Gourmet & Chef', monthly: 42000, perks: 'Exotic imports, wagyu beef, organic delivery' }
    ],
    dining: [
      { id: 'rare',             label: 'Street Food Only (Koshary/Ful)', monthly: 300 },
      { id: 'sometimes',        label: 'Casual Cafes & Fast Food',       monthly: 1500 },
      { id: 'often',            label: 'Regular Restaurants (3x/wk)',    monthly: 4500 },
      { id: 'fine_dining',      label: 'Upscale Dining & Malls',         monthly: 12000 },
      { id: 'exclusive',        label: 'Elite Clubs & Michelin Chefs',   monthly: 28000 }
    ],
    transport: [
      { id: 'public',           label: 'Metro & Microbus',               monthly: 500 },
      { id: 'mixed',            label: 'Metro + Occasional Uber',        monthly: 2000 },
      { id: 'uber',             label: 'Mostly Uber / Careem',           monthly: 5500 },
      { id: 'own_car',          label: 'Economy Car (Fuel + Maint)',     monthly: 9000 },
      { id: 'luxury_car',       label: 'Luxury SUV + Private Driver',    monthly: 24000 }
    ],
    clothing: [
      { id: 'budget',           label: 'Local Markets (Wekalat El Balah)', monthly: 600 },
      { id: 'standard',         label: 'High Street (Zara, H&M)',         monthly: 2500 },
      { id: 'premium',          label: 'Premium Brands (Massimo Dutti)',   monthly: 8000 },
      { id: 'luxury',           label: 'Designer Malls (First Mall/City Center)', monthly: 25000 },
      { id: 'haute_couture',    label: 'Custom Tailors & European Boutiques', monthly: 75000 }
    ],
    entertainment: [
      { id: 'frugal',           label: 'Home TV & Local Park Walks',     monthly: 400 },
      { id: 'standard',         label: 'Movies, Malls & Coffee Shops',   monthly: 1800 },
      { id: 'active',           label: 'Nightlife, Concerts & Sports',   monthly: 5000 },
      { id: 'luxury',           label: 'VIP Lounges & Gouna Weekends',   monthly: 15000 },
      { id: 'jetset',           label: 'Private Yacht Charters & Parties', monthly: 40000 }
    ],
    personal_care: [
      { id: 'basic',            label: 'Self-Care & Local Barber',       monthly: 250 },
      { id: 'standard',         label: 'Neighborhood Salon / Grooming',  monthly: 900 },
      { id: 'premium',          label: 'High-End Salon & Skincare',      monthly: 2800 },
      { id: 'luxury',           label: 'Monthly Spa & Aesthetics Clinic',monthly: 8000 }
    ],
    domestic_staff: [
      { id: 'none',             label: 'Do It Yourself',                 monthly: 0 },
      { id: 'cleaner',          label: 'Part-Time Housekeeper (1x/wk)',  monthly: 1800 },
      { id: 'full_maid',        label: 'Live-In Housekeeper / Maid',     monthly: 6000 },
      { id: 'maid_and_driver',  label: 'Live-in Maid + Private Driver',  monthly: 14000 },
      { id: 'full_estate_team', label: 'Chef, Nanny, Driver, Bawab & Maid', monthly: 35000 }
    ],
    healthcare_insurance: [
      { id: 'public',           label: 'Public Health System (Basic)',   monthly: 300 },
      { id: 'private_copay',    label: 'Standard Syndicate/Corporate Ins', monthly: 1200 },
      { id: 'premium_private',  label: 'Top Private Hospital Network (MetLife/Bupa)', monthly: 3800 },
      { id: 'vip_concierge',    label: 'VIP Global Medical Insurance',   monthly: 12000 }
    ]
  },

  usa: {
    currency: 'USD',
    phone: [
      { id: 'prepaid',          label: 'MVNO Prepaid (Mint/Visible)',    monthly: 30,   perks: 'Unlimited talk/text + 15GB' },
      { id: 'basic',            label: 'Basic Postpaid (AT&T/Verizon)',  monthly: 55,   perks: 'Unlimited LTE' },
      { id: 'mid',              label: 'Mid Postpaid 5G',                monthly: 85,   perks: 'Unlimited 5G UW + Hotspot' },
      { id: 'premium',          label: 'Unlimited Premium + Int Roaming', monthly: 125,  perks: 'International data + perks' },
      { id: 'ultra',            label: 'Executive Multi-Line VIP',       monthly: 220,  perks: 'Priority network access everywhere' }
    ],
    internet: [
      { id: 'basic',            label: 'Basic Broadband (100 Mbps)',     monthly: 50 },
      { id: 'standard',         label: 'Standard Cable (300 Mbps)',      monthly: 80 },
      { id: 'premium',          label: 'Fiber Gigabit (1 Gbps)',         monthly: 120 },
      { id: 'unlimited',        label: 'Fiber 2.5 Gbps + Mesh System',   monthly: 180 },
      { id: 'gigabit',          label: 'Dedicated Symmetric 5 Gbps',     monthly: 320 }
    ],
    utilities: [
      { id: 'low',              label: 'Studio / Minimal Usage',         monthly: 120 },
      { id: 'standard',         label: 'Standard Apartment (Electric/Gas)',monthly: 250 },
      { id: 'high',             label: 'Single Family Home (HVAC)',      monthly: 480 },
      { id: 'luxury',           label: 'Large Home + Pool + AC 24/7',    monthly: 850 },
      { id: 'compound_villa',   label: 'Mansion Estate Heating/Cooling', monthly: 1800 }
    ],
    food: [
      { id: 'survival',         label: 'Discount Groceries (ALDI/Walmart)', monthly: 250 },
      { id: 'budget',           label: 'Standard Supermarket (Kroger)',  monthly: 500 },
      { id: 'standard',         label: 'Mid-Tier Groceries (Trader Joes)', monthly: 900 },
      { id: 'premium',          label: 'Organic & Specialty (Whole Foods)', monthly: 1650 },
      { id: 'luxury',           label: 'Erewhon / Artisanal Fresh Direct', monthly: 3200 }
    ],
    dining: [
      { id: 'rare',             label: 'Fast Food & Food Trucks',        monthly: 60 },
      { id: 'sometimes',        label: 'Casual Takeout & Diner',         monthly: 220 },
      { id: 'often',            label: 'Sit-down Restaurants (2-3x/wk)', monthly: 550 },
      { id: 'fine_dining',      label: 'Upscale Steakhouses & Sushi',    monthly: 1400 },
      { id: 'exclusive',        label: 'Michelin Star Tasting Menus',    monthly: 3600 }
    ],
    transport: [
      { id: 'public',           label: 'City Subway & Bus Pass',         monthly: 120 },
      { id: 'mixed',            label: 'Public Transit + Weekend Rideshare', monthly: 350 },
      { id: 'uber',             label: 'Daily Uber/Lyft Commute',        monthly: 700 },
      { id: 'own_car',          label: 'Sedan (Loan + Gas + Insurance)', monthly: 1100 },
      { id: 'luxury_car',       label: 'Luxury Vehicle + Private Chauffeur', monthly: 3200 }
    ],
    clothing: [
      { id: 'budget',           label: 'Thrift Stores & Target',         monthly: 60 },
      { id: 'standard',         label: 'Nordstrom Rack / Gap / Uniqlo',  monthly: 220 },
      { id: 'premium',          label: 'Premium Brands (Theory, Lululemon)', monthly: 650 },
      { id: 'luxury',           label: 'Fifth Ave Designers (Gucci, Prada)', monthly: 2000 },
      { id: 'haute_couture',    label: 'Bespoke Custom & Runway Fashion', monthly: 6000 }
    ],
    entertainment: [
      { id: 'frugal',           label: 'Streaming at Home',              monthly: 40 },
      { id: 'standard',         label: 'Bars, Cinema & Bowling',         monthly: 200 },
      { id: 'active',           label: 'Concerts, Sports Games & Clubs', monthly: 550 },
      { id: 'luxury',           label: 'VIP Box Seats & Music Festivals', monthly: 1600 },
      { id: 'jetset',           label: 'Gala Access & Private Members Club', monthly: 4500 }
    ],
    personal_care: [
      { id: 'basic',            label: 'Supercuts & Basic Toiletries',   monthly: 35 },
      { id: 'standard',         label: 'Stylist Barber / Hair Salon',    monthly: 120 },
      { id: 'premium',          label: 'Upscale Salon & Grooming Products', monthly: 320 },
      { id: 'luxury',           label: 'MedSpa, Botulinum & Dermatologist', monthly: 900 }
    ],
    domestic_staff: [
      { id: 'none',             label: 'Do It Yourself',                 monthly: 0 },
      { id: 'cleaner',          label: 'Bi-weekly Maid Service',         monthly: 250 },
      { id: 'full_maid',        label: 'Weekly Deep Clean & Laundry',    monthly: 850 },
      { id: 'maid_and_driver',  label: 'Full-Time Private Housekeeper',  monthly: 3200 },
      { id: 'full_estate_team', label: 'Personal Chef, Butler & Estate Mgr', monthly: 9500 }
    ],
    healthcare_insurance: [
      { id: 'public',           label: 'High Deductible Plan (HDHP)',    monthly: 150 },
      { id: 'private_copay',    label: 'Standard PPO Plan (Silver/Gold)', monthly: 400 },
      { id: 'premium_private',  label: 'Low Deductible Premium Platinum', monthly: 850 },
      { id: 'vip_concierge',    label: 'Concierge Medicine Retainer',    monthly: 2500 }
    ]
  },

  sau: {
    currency: 'SAR',
    phone: [
      { id: 'prepaid',          label: 'STC Sawa Prepaid',               monthly: 60 },
      { id: 'basic',            label: 'STC Mawtara 2 (Basic)',          monthly: 130 },
      { id: 'mid',              label: 'STC Mawtara 3 (Unlimited Data)', monthly: 260 },
      { id: 'premium',          label: 'STC Mawtara 4 (VIP + Roaming)',  monthly: 520 },
      { id: 'ultra',            label: 'Mawtara Black Executive',        monthly: 950 }
    ],
    internet: [
      { id: 'basic',            label: 'Fiber 100 Mbps',                 monthly: 230 },
      { id: 'standard',         label: 'Fiber 300 Mbps',                 monthly: 380 },
      { id: 'premium',          label: 'Fiber 500 Mbps + TV',            monthly: 600 },
      { id: 'unlimited',        label: 'Fiber 1 Gbps Gigabit',           monthly: 900 },
      { id: 'gigabit',          label: 'VIP Dedicated Villa Fiber',      monthly: 1500 }
    ],
    utilities: [
      { id: 'low',              label: 'Low usage (Winter)',             monthly: 350 },
      { id: 'standard',         label: 'Standard Apartment AC',          monthly: 800 },
      { id: 'high',             label: 'Villa Heavy AC Usage',           monthly: 1600 },
      { id: 'luxury',           label: 'Large Villa AC 24/7 + Pool',     monthly: 3200 },
      { id: 'compound_villa',   label: 'Palace Estate Utilities',        monthly: 7000 }
    ],
    food: [
      { id: 'survival',         label: 'Budget Local Grocery (Panda)',   monthly: 1000 },
      { id: 'budget',           label: 'Standard Hypermarket (Lulu)',    monthly: 2200 },
      { id: 'standard',         label: 'Danube / Tamimi Markets',        monthly: 4500 },
      { id: 'premium',          label: 'Imported Specialty & Organic',   monthly: 9000 },
      { id: 'luxury',           label: 'Gourmet Imports & Private Supply', monthly: 19000 }
    ],
    dining: [
      { id: 'rare',             label: 'Fast Food & Cafeterias',         monthly: 100 },
      { id: 'sometimes',        label: 'Casual Mall Dining & Cafes',     monthly: 450 },
      { id: 'often',            label: 'Regular Restaurants (3x/wk)',    monthly: 1300 },
      { id: 'fine_dining',      label: 'Boulevard & Upscale Dining',     monthly: 3500 },
      { id: 'exclusive',        label: 'Exclusive Riyadh Season Dining', monthly: 9500 }
    ],
    transport: [
      { id: 'public',           label: 'Riyadh Bus / Metro',             monthly: 200 },
      { id: 'mixed',            label: 'Public Transport + Careem',      monthly: 650 },
      { id: 'uber',             label: 'Daily Uber / Careem VIP',        monthly: 1600 },
      { id: 'own_car',          label: 'Own Car (Fuel + Insurance)',     monthly: 1200 },
      { id: 'luxury_car',       label: 'Luxury SUV + Chauffeur',         monthly: 4500 }
    ],
    clothing: [
      { id: 'budget',           label: 'Mass Market Brands',             monthly: 200 },
      { id: 'standard',         label: 'Mid-Tier Mall Brands (Zara)',    monthly: 650 },
      { id: 'premium',          label: 'Premium Brands (Polo, Boss)',    monthly: 1900 },
      { id: 'luxury',           label: 'Luxury Fashion (Centria Mall)',  monthly: 5500 },
      { id: 'haute_couture',    label: 'Custom Abayas/Thobes & Designers', monthly: 18000 }
    ],
    entertainment: [
      { id: 'frugal',           label: 'Home Entertainment',             monthly: 100 },
      { id: 'standard',         label: 'Cinema, Cafes & Malls',          monthly: 450 },
      { id: 'active',           label: 'Events, Theme Parks & Sports',   monthly: 1300 },
      { id: 'luxury',           label: 'Riyadh Season VIP Tickets',      monthly: 3800 },
      { id: 'jetset',           label: 'Red Sea Resort & Chalet Rentals', monthly: 11000 }
    ],
    personal_care: [
      { id: 'basic',            label: 'Local Barber Shop',              monthly: 100 },
      { id: 'standard',         label: 'Grooming Salon',                 monthly: 320 },
      { id: 'premium',          label: 'Spa & Wellness Center',          monthly: 850 },
      { id: 'luxury',           label: 'VIP Skincare & Aesthetic Spa',   monthly: 2400 }
    ],
    domestic_staff: [
      { id: 'none',             label: 'Do It Yourself',                 monthly: 0 },
      { id: 'cleaner',          label: 'Hourly Cleaning Service',        monthly: 600 },
      { id: 'full_maid',        label: 'Live-In Housemaid',              monthly: 2000 },
      { id: 'maid_and_driver',  label: 'Housemaid + Private Driver',     monthly: 4800 },
      { id: 'full_estate_team', label: 'Full Staff (Maid, Driver, Chef, Guard)', monthly: 12500 }
    ],
    healthcare_insurance: [
      { id: 'public',           label: 'MOH Public System',              monthly: 150 },
      { id: 'private_copay',    label: 'Cooperative Insurance (Class B)', monthly: 500 },
      { id: 'premium_private',  label: 'Class A Private Insurance (Tawuniya)', monthly: 1500 },
      { id: 'vip_concierge',    label: 'VIP VIP Platinum Medical Care',  monthly: 4200 }
    ]
  },

  uae: {
    currency: 'AED',
    phone: [
      { id: 'prepaid',          label: 'etisalat / du Prepaid',          monthly: 65 },
      { id: 'basic',            label: 'Power Plan 125',                 monthly: 130 },
      { id: 'mid',              label: 'Power Plan 260 (Unlimited)',     monthly: 270 },
      { id: 'premium',          label: 'VIP Gold Postpaid',              monthly: 580 },
      { id: 'ultra',            label: 'Emirates First Class Mobile',    monthly: 1100 }
    ],
    internet: [
      { id: 'basic',            label: 'e& Fiber 250 Mbps',              monthly: 380 },
      { id: 'standard',         label: 'e& Fiber 500 Mbps',              monthly: 550 },
      { id: 'premium',          label: 'e& Fiber 1 Gbps Ultra',          monthly: 850 },
      { id: 'unlimited',        label: 'Home Wireless 5G + TV',          monthly: 1200 },
      { id: 'gigabit',          label: 'Exclusive Villa Fiber Dedicated', monthly: 2000 }
    ],
    utilities: [
      { id: 'low',              label: 'Studio / DEWA Low Tier',         monthly: 400 },
      { id: 'standard',         label: '1BR Apartment DEWA + Empower',   monthly: 900 },
      { id: 'high',             label: '2BR/3BR Heavy Chiller Usage',    monthly: 1800 },
      { id: 'luxury',           label: 'Dubai Marina Penthouse Utilities', monthly: 3800 },
      { id: 'compound_villa',   label: 'Palm Jumeirah Villa DEWA',       monthly: 8500 }
    ],
    food: [
      { id: 'survival',         label: 'Budget Groceries (Viva / Nesto)', monthly: 1100 },
      { id: 'budget',           label: 'Standard Supermarket (Carrefour)', monthly: 2400 },
      { id: 'standard',         label: 'Spinneys / Waitrose',            monthly: 5200 },
      { id: 'premium',          label: 'Organic Foods & Cafe / Marks & Spencer', monthly: 10000 },
      { id: 'luxury',           label: 'Fine Imported Pantry & Caviar',  monthly: 22000 }
    ],
    dining: [
      { id: 'rare',             label: 'Cafeteria & Local Eats',         monthly: 150 },
      { id: 'sometimes',        label: 'Casual Dining (DIFC / Malls)',   monthly: 600 },
      { id: 'often',            label: 'Trendy Restaurants (3x/wk)',     monthly: 1800 },
      { id: 'fine_dining',      label: 'High-End DIFC & Beach Clubs',    monthly: 4500 },
      { id: 'exclusive',        label: 'Michelin Star & Private Chefs',  monthly: 12000 }
    ],
    transport: [
      { id: 'public',           label: 'Dubai Metro Nol Card',           monthly: 220 },
      { id: 'mixed',            label: 'Metro + Careem Taxi',            monthly: 750 },
      { id: 'uber',             label: 'Careem / Uber Black Daily',      monthly: 2000 },
      { id: 'own_car',          label: 'Sedan (Fuel + Salik + Maint)',   monthly: 1500 },
      { id: 'luxury_car',       label: 'Supercar / SUV + Chauffeur',     monthly: 6000 }
    ],
    clothing: [
      { id: 'budget',           label: 'Outlet Mall & Value Fashion',    monthly: 220 },
      { id: 'standard',         label: 'High Street (Zara, Mango)',      monthly: 750 },
      { id: 'premium',          label: 'Premium Brands (COS, Sandro)',   monthly: 2300 },
      { id: 'luxury',           label: 'Fashion Avenue (Dubai Mall)',    monthly: 7000 },
      { id: 'haute_couture',    label: 'Exclusive Designer Couture',     monthly: 24000 }
    ],
    entertainment: [
      { id: 'frugal',           label: 'Beach Days & Home TV',           monthly: 150 },
      { id: 'standard',         label: 'Cinema, Lounges & Malls',        monthly: 550 },
      { id: 'active',           label: 'Beach Clubs & Nightlife',        monthly: 1800 },
      { id: 'luxury',           label: 'VIP Table Reservation at Clubs', monthly: 5000 },
      { id: 'jetset',           label: 'Yacht Parties & Helicopter Tours', monthly: 15000 }
    ],
    personal_care: [
      { id: 'basic',            label: 'Local Grooming',                 monthly: 120 },
      { id: 'standard',         label: 'City Barber / Salon',            monthly: 380 },
      { id: 'premium',          label: 'High-End Salon & Spa',           monthly: 1100 },
      { id: 'luxury',           label: 'Jumeirah Aesthetics & MedSpa',   monthly: 3200 }
    ],
    domestic_staff: [
      { id: 'none',             label: 'Do It Yourself',                 monthly: 0 },
      { id: 'cleaner',          label: 'Hourly Cleaning (Justlife)',     monthly: 700 },
      { id: 'full_maid',        label: 'Live-In Domestic Maid',          monthly: 2800 },
      { id: 'maid_and_driver',  label: 'Maid + Private Chauffeur',       monthly: 6500 },
      { id: 'full_estate_team', label: 'Villa Staff (Chef, Nanny, Driver, Maid)', monthly: 16000 }
    ],
    healthcare_insurance: [
      { id: 'public',           label: 'Basic Essential Benefit Plan',   monthly: 200 },
      { id: 'private_copay',    label: 'Comprehensive UAE Health Ins',   monthly: 650 },
      { id: 'premium_private',  label: 'Worldwide Private Medical Cover', monthly: 1800 },
      { id: 'vip_concierge',    label: 'VIP Royal Medical Coverage',     monthly: 5500 }
    ]
  },

  uk: {
    currency: 'GBP',
    phone: [
      { id: 'prepaid',          label: 'Giffgaff / SIM Only',            monthly: 12 },
      { id: 'basic',            label: 'O2 / EE Basic Contract',         monthly: 25 },
      { id: 'mid',              label: 'EE Unlimited 5G Data',           monthly: 45 },
      { id: 'premium',          label: 'Vodafone VIP Unlimited',         monthly: 75 },
      { id: 'ultra',            label: 'Global Roaming Executive',       monthly: 130 }
    ],
    internet: [
      { id: 'basic',            label: 'Standard Fiber (60 Mbps)',       monthly: 28 },
      { id: 'standard',         label: 'Superfast Fiber (150 Mbps)',     monthly: 42 },
      { id: 'premium',          label: 'Virgin Media Gigabit (1 Gbps)',  monthly: 65 },
      { id: 'unlimited',        label: 'Hyperoptic 1 Gbps + TV Pass',    monthly: 95 },
      { id: 'gigabit',          label: 'Dedicated London Fiber',         monthly: 180 }
    ],
    utilities: [
      { id: 'low',              label: '1BR Flat Energy + Water',        monthly: 120 },
      { id: 'standard',         label: '2BR Flat (Council Tax + Gas)',   monthly: 240 },
      { id: 'high',             label: 'Terraced House Heating',         monthly: 420 },
      { id: 'luxury',           label: 'Detached Home Heating 24/7',     monthly: 750 },
      { id: 'compound_villa',   label: 'Kensington Townhouse Utilities', monthly: 1600 }
    ],
    food: [
      { id: 'survival',         label: 'Discount Supermarket (Lidl/Aldi)', monthly: 160 },
      { id: 'budget',           label: 'Standard Groceries (Tesco/Sainsburys)', monthly: 320 },
      { id: 'standard',         label: 'Mid-Upper (Waitrose/M&S)',       monthly: 600 },
      { id: 'premium',          label: 'Organic & Whole Foods UK',       monthly: 1100 },
      { id: 'luxury',           label: 'Harrods Food Hall & Fortnum',    monthly: 2400 }
    ],
    dining: [
      { id: 'rare',             label: 'Fish & Chips / Pub Grub',        monthly: 45 },
      { id: 'sometimes',        label: 'Casual Restaurants & High St',   monthly: 160 },
      { id: 'often',            label: 'Dining Out (2-3x/wk)',           monthly: 420 },
      { id: 'fine_dining',      label: 'Mayfair Upscale Restaurants',    monthly: 1100 },
      { id: 'exclusive',        label: 'Michelin 3-Star Tasting Menus',  monthly: 2800 }
    ],
    transport: [
      { id: 'public',           label: 'London Underground Zones 1-3',   monthly: 180 },
      { id: 'mixed',            label: 'Tube + Occasional Black Cab',    monthly: 380 },
      { id: 'uber',             label: 'Uber / Black Cab Commute',       monthly: 800 },
      { id: 'own_car',          label: 'Car (Ulez + Fuel + Insurance)',  monthly: 650 },
      { id: 'luxury_car',       label: 'Chauffeur Driven Executive Car', monthly: 2400 }
    ],
    clothing: [
      { id: 'budget',           label: 'Primark & ASOS Sale',            monthly: 45 },
      { id: 'standard',         label: 'High Street (Zara, COS, Reiss)', monthly: 180 },
      { id: 'premium',          label: 'Premium Brands (Selfridges)',    monthly: 500 },
      { id: 'luxury',           label: 'Bond Street Designer Brands',    monthly: 1600 },
      { id: 'haute_couture',    label: 'Savile Row Bespoke Tailoring',   monthly: 4800 }
    ],
    entertainment: [
      { id: 'frugal',           label: 'Pub Drinks & Streaming',         monthly: 40 },
      { id: 'standard',         label: 'West End Shows & Gigs',          monthly: 180 },
      { id: 'active',           label: 'Concerts, Football Tickets & Clubs', monthly: 450 },
      { id: 'luxury',           label: 'VIP Box Seats & Premier League', monthly: 1200 },
      { id: 'jetset',           label: 'Private Members Club (Annabel’s)', monthly: 3500 }
    ],
    personal_care: [
      { id: 'basic',            label: 'Local Barber / Hairdressers',    monthly: 25 },
      { id: 'standard',         label: 'City Salon & Haircut',           monthly: 85 },
      { id: 'premium',          label: 'Sloane Square Salon & Spa',      monthly: 240 },
      { id: 'luxury',           label: 'Harrods Wellness Clinic & Spa',  monthly: 750 }
    ],
    domestic_staff: [
      { id: 'none',             label: 'Do It Yourself',                 monthly: 0 },
      { id: 'cleaner',          label: 'Weekly Domestic Cleaner',        monthly: 200 },
      { id: 'full_maid',        label: 'Full-Time Housekeeper',          monthly: 1800 },
      { id: 'maid_and_driver',  label: 'Housekeeper + Driver',           monthly: 4200 },
      { id: 'full_estate_team', label: 'Butler, Chef, Nanny & Housekeeper', monthly: 9800 }
    ],
    healthcare_insurance: [
      { id: 'public',           label: 'NHS Free Coverage (Tax Funded)', monthly: 0 },
      { id: 'private_copay',    label: 'Bupa / AXA Private Insurance',   monthly: 120 },
      { id: 'premium_private',  label: 'Harley Street Comprehensive',    monthly: 380 },
      { id: 'vip_concierge',    label: 'Private Harley Street Doctor Retainer', monthly: 1200 }
    ]
  },

  deu: {
    currency: 'EUR',
    phone: [
      { id: 'prepaid',          label: 'ALDI Talk Prepaid',              monthly: 10 },
      { id: 'basic',            label: 'Vodafone / O2 Basic',            monthly: 22 },
      { id: 'mid',              label: 'Telekom MagentaMobil M',         monthly: 40 },
      { id: 'premium',          label: 'Telekom Unlimited 5G',           monthly: 75 },
      { id: 'ultra',            label: 'VIP Business Roaming',           monthly: 120 }
    ],
    internet: [
      { id: 'basic',            label: 'DSL 50 Mbps',                    monthly: 30 },
      { id: 'standard',         label: 'DSL / Cable 250 Mbps',           monthly: 45 },
      { id: 'premium',          label: 'Glasfaser Fiber 1 Gbps',         monthly: 75 },
      { id: 'unlimited',        label: 'High-Speed Fiber + TV Package',  monthly: 110 },
      { id: 'gigabit',          label: 'Dedicated Business Fiber',       monthly: 200 }
    ],
    utilities: [
      { id: 'low',              label: '1-Zimmer-Wohnung Warmmiete Extra', monthly: 110 },
      { id: 'standard',         label: 'Standard Utility (Strom + Heizung)', monthly: 220 },
      { id: 'high',             label: 'Haus Heating & Energy',          monthly: 390 },
      { id: 'luxury',           label: 'Einfamilienhaus Full Climate',   monthly: 680 },
      { id: 'compound_villa',   label: 'Villa Estate Heating & Power',   monthly: 1400 }
    ],
    food: [
      { id: 'survival',         label: 'Discounter (Lidl, Penny, Aldi)', monthly: 150 },
      { id: 'budget',           label: 'Supermarkt (REWE, Edeka)',       monthly: 300 },
      { id: 'standard',         label: 'Bio-Markt (Denns, Alnatura)',    monthly: 550 },
      { id: 'premium',          label: 'Feinkost & Organic Specialty',   monthly: 1000 },
      { id: 'luxury',           label: 'KaDeWe Feinkostabteilung Gourmet', monthly: 2200 }
    ],
    dining: [
      { id: 'rare',             label: 'Döner & Imbiss',                 monthly: 35 },
      { id: 'sometimes',        label: 'Casual Restaurants & Brauhaus',  monthly: 140 },
      { id: 'often',            label: 'Dining Out Regularly (2-3x/wk)', monthly: 380 },
      { id: 'fine_dining',      label: 'Upscale Restaurants & Bars',     monthly: 950 },
      { id: 'exclusive',        label: 'Michelin Star Fine Dining',      monthly: 2400 }
    ],
    transport: [
      { id: 'public',           label: 'Deutschlandticket (49€ Ticket)',  monthly: 49 },
      { id: 'mixed',            label: 'ÖPNV + Occasional Taxi / ShareNow', monthly: 180 },
      { id: 'uber',             label: 'Daily Taxi / FreeNow Commute',   monthly: 600 },
      { id: 'own_car',          label: 'Own Car (TÜV + Benzin + Vers.)', monthly: 550 },
      { id: 'luxury_car',       label: 'BMW / Audi + Driver Service',    monthly: 2200 }
    ],
    clothing: [
      { id: 'budget',           label: 'C&A, Zalando Outlet',            monthly: 40 },
      { id: 'standard',         label: 'Massimo Dutti, Peek & Cloppenburg', monthly: 150 },
      { id: 'premium',          label: 'Premium Brands (Hugo Boss)',     monthly: 420 },
      { id: 'luxury',           label: 'Designer Outlets (Kurfürstendamm)', monthly: 1400 },
      { id: 'haute_couture',    label: 'Custom Tailored European Suits', monthly: 4200 }
    ],
    entertainment: [
      { id: 'frugal',           label: 'Kino, Streaming & Parks',        monthly: 30 },
      { id: 'standard',         label: 'Bars, Concerts & Events',        monthly: 140 },
      { id: 'active',           label: 'Nightclubs (Berghain) & Festivals', monthly: 380 },
      { id: 'luxury',           label: 'VIP Opera & Symphony Subscriptions', monthly: 1000 },
      { id: 'jetset',           label: 'Private Club & Resort Memberships', monthly: 3000 }
    ],
    personal_care: [
      { id: 'basic',            label: 'Friseur / Local Barber',         monthly: 20 },
      { id: 'standard',         label: 'Salon Haircut & Cosmetics',      monthly: 70 },
      { id: 'premium',          label: 'High-End Day Spa & Skincare',    monthly: 200 },
      { id: 'luxury',           label: 'Medical Aesthetics Clinic',      monthly: 650 }
    ],
    domestic_staff: [
      { id: 'none',             label: 'Do It Yourself',                 monthly: 0 },
      { id: 'cleaner',          label: 'Putzhilfe (Cleaning Lady 1x/wk)',monthly: 180 },
      { id: 'full_maid',        label: 'Haushälterin (Housekeeper)',     monthly: 1600 },
      { id: 'maid_and_driver',  label: 'Haushälterin + Chauffeur',       monthly: 3800 },
      { id: 'full_estate_team', label: 'Full Personal Staff',            monthly: 8800 }
    ],
    healthcare_insurance: [
      { id: 'public',           label: 'Gesetzliche Krankenversicherung (GKV)', monthly: 0 },
      { id: 'private_copay',    label: 'GKV + Private Zusatzversicherung', monthly: 90 },
      { id: 'premium_private',  label: 'Private Krankenversicherung (PKV)', monthly: 450 },
      { id: 'vip_concierge',    label: 'Chefarzt Treatment Retainer',    monthly: 1400 }
    ]
  }
};

/* ---------- SUBSCRIPTIONS ---------- */
/* Prices per country. Effects given on annual basis. Scaled down to prevent stat inflation over 10+ years. */
const LIFE_SUBSCRIPTIONS = [
  // Video Streaming
  { id: 'netflix',          label: 'Netflix 4K Premium',     category: 'streaming',   prices: { egy: 300,  usa: 23,  sau: 60,  uae: 65,  uk: 18,  deu: 20  }, happiness: 1 },
  { id: 'spotify',          label: 'Spotify Premium',        category: 'music',       prices: { egy: 120,  usa: 12,  sau: 25,  uae: 25,  uk: 12,  deu: 11  }, happiness: 1 },
  { id: 'youtube',          label: 'YouTube Premium',        category: 'streaming',   prices: { egy: 180,  usa: 14,  sau: 30,  uae: 32,  uk: 13,  deu: 13  }, happiness: 1 },
  { id: 'amazon',           label: 'Amazon Prime',           category: 'streaming',   prices: { egy: 150,  usa: 15,  sau: 30,  uae: 30,  uk: 9,   deu: 9   }, happiness: 1 },
  { id: 'disney',           label: 'Disney+ Bundle',         category: 'streaming',   prices: { egy: 250,  usa: 18,  sau: 40,  uae: 42,  uk: 11,  deu: 12  }, happiness: 1 },
  { id: 'shahid',           label: 'Shahid VIP Ultimate',    category: 'streaming',   prices: { egy: 250,  usa: 10,  sau: 40,  uae: 40,  uk: 8,   deu: 9   }, happiness: 1 },
  { id: 'osn_plus',         label: 'OSN+ (HBO Content)',     category: 'streaming',   prices: { egy: 280,  usa: 12,  sau: 45,  uae: 45,  uk: 10,  deu: 10  }, happiness: 1 },
  { id: 'apple_tv',         label: 'Apple TV+ / One',        category: 'streaming',   prices: { egy: 200,  usa: 10,  sau: 30,  uae: 30,  uk: 9,   deu: 10  }, happiness: 1 },
  
  // Music & Audio
  { id: 'anghami',          label: 'Anghami Plus',           category: 'music',       prices: { egy: 100,  usa: 8,   sau: 20,  uae: 20,  uk: 7,   deu: 7   }, happiness: 1 },
  { id: 'apple_music',      label: 'Apple Music Family',     category: 'music',       prices: { egy: 160,  usa: 17,  sau: 35,  uae: 35,  uk: 17,  deu: 17  }, happiness: 1 },
  { id: 'audible',          label: 'Audible Audiobooks',     category: 'info',        prices: { egy: 250,  usa: 15,  sau: 45,  uae: 45,  uk: 8,   deu: 10  }, happiness: 1, smarts: 1 },

  // AI & Productivity
  { id: 'chatgpt_plus',     label: 'ChatGPT Plus / AI',      category: 'productivity',prices: { egy: 1000, usa: 20,  sau: 75,  uae: 75,  uk: 16,  deu: 19  }, happiness: 1, smarts: 1 },
  { id: 'icloud_storage',   label: 'iCloud+ 2TB Storage',    category: 'tech',        prices: { egy: 500,  usa: 10,  sau: 40,  uae: 40,  uk: 9,   deu: 10  }, happiness: 1 },
  { id: 'microsoft_365',    label: 'Microsoft 365 Family',   category: 'productivity',prices: { egy: 400,  usa: 10,  sau: 35,  uae: 35,  uk: 8,   deu: 10  }, smarts: 1 },

  // Gaming
  { id: 'ps_plus',          label: 'PlayStation Plus Premium', category: 'gaming',    prices: { egy: 800,  usa: 18,  sau: 65,  uae: 65,  uk: 14,  deu: 16  }, happiness: 1 },
  { id: 'xbox_gamepass',    label: 'Xbox Game Pass Ultimate', category: 'gaming',     prices: { egy: 700,  usa: 17,  sau: 60,  uae: 60,  uk: 13,  deu: 15  }, happiness: 1 },

  // Health, Fitness & Wellness
  { id: 'gym',              label: 'Local Commercial Gym',   category: 'health',      prices: { egy: 1200, usa: 60,  sau: 300, uae: 350, uk: 45,  deu: 40  }, happiness: 1, health: 2 },
  { id: 'crossfit_box',     label: 'CrossFit / Boutique Gym',category: 'health',      prices: { egy: 3500, usa: 180, sau: 800, uae: 850, uk: 140, deu: 120 }, happiness: 1, health: 3 },
  { id: 'luxury_club',      label: 'Country Club / Gold Gym VIP', category: 'health', prices: { egy: 12000,usa: 450, sau: 2200,uae: 2500,uk: 350, deu: 300 }, happiness: 2, health: 2, social: 1 },
  { id: 'spa',              label: 'Monthly Spa Massage',    category: 'wellness',    prices: { egy: 2500, usa: 120, sau: 450, uae: 500, uk: 90,  deu: 85  }, happiness: 2, health: 1 },
  { id: 'yoga',             label: 'Pilates / Yoga Studio',  category: 'health',      prices: { egy: 2000, usa: 150, sau: 600, uae: 650, uk: 110, deu: 95  }, happiness: 1, health: 2 },
  { id: 'meditation',       label: 'Headspace / Calm App',   category: 'wellness',    prices: { egy: 200,  usa: 13,  sau: 35,  uae: 35,  uk: 10,  deu: 11  }, happiness: 1, health: 1 },
  { id: 'personal_trainer', label: 'Private Personal Trainer', category: 'health',    prices: { egy: 8000, usa: 500, sau: 2500,uae: 2800,uk: 400, deu: 380 }, happiness: 1, health: 4 },

  // Delivery & Food Passes
  { id: 'talabat_pro',      label: 'Talabat Pro / Food Pass',category: 'delivery',    prices: { egy: 120,  usa: 10,  sau: 30,  uae: 30,  uk: 7,   deu: 8   }, happiness: 1 },

  // Education & News
  { id: 'news',             label: 'Financial Times / NYT',  category: 'info',        prices: { egy: 400,  usa: 25,  sau: 90,  uae: 90,  uk: 20,  deu: 22  }, happiness: 1, smarts: 1 },
  { id: 'coursera_plus',    label: 'Coursera Plus Learning', category: 'education',   prices: { egy: 1800, usa: 50,  sau: 190, uae: 190, uk: 40,  deu: 45  }, happiness: 1, smarts: 2 }
];

/* ---------- PRESETS ---------- */
const LIFE_PRESETS = {
  frugal: {
    label: 'Frugal / Bare Minimum',
    description: 'Every coin counts. Strict essential living.',
    phone: 'prepaid',
    internet: 'basic',
    utilities: 'low',
    food: 'survival',
    dining: 'rare',
    transport: 'public',
    clothing: 'budget',
    entertainment: 'frugal',
    personal_care: 'basic',
    domestic_staff: 'none',
    healthcare_insurance: 'public',
    subscriptions: []
  },
  budget_conscious: {
    label: 'Budget Conscious',
    description: 'Smart spender, student or early career baseline.',
    phone: 'basic',
    internet: 'standard',
    utilities: 'standard',
    food: 'budget',
    dining: 'sometimes',
    transport: 'mixed',
    clothing: 'standard',
    entertainment: 'standard',
    personal_care: 'standard',
    domestic_staff: 'none',
    healthcare_insurance: 'public',
    subscriptions: ['spotify', 'talabat_pro']
  },
  standard: {
    label: 'Standard Comfort',
    description: 'Middle-class balanced lifestyle.',
    phone: 'mid',
    internet: 'premium',
    utilities: 'standard',
    food: 'standard',
    dining: 'often',
    transport: 'own_car',
    clothing: 'standard',
    entertainment: 'active',
    personal_care: 'standard',
    domestic_staff: 'cleaner',
    healthcare_insurance: 'private_copay',
    subscriptions: ['netflix', 'spotify', 'chatgpt_plus', 'gym']
  },
  comfortable: {
    label: 'Upper Middle Class',
    description: 'High quality of life with plenty of perks.',
    phone: 'premium',
    internet: 'unlimited',
    utilities: 'high',
    food: 'premium',
    dining: 'fine_dining',
    transport: 'own_car',
    clothing: 'premium',
    entertainment: 'active',
    personal_care: 'premium',
    domestic_staff: 'full_maid',
    healthcare_insurance: 'premium_private',
    subscriptions: ['netflix', 'spotify', 'youtube', 'amazon', 'chatgpt_plus', 'gym', 'spa', 'talabat_pro']
  },
  affluent: {
    label: 'Affluent Executive',
    description: 'Luxury accommodations, top staff, fine dining.',
    phone: 'ultra',
    internet: 'gigabit',
    utilities: 'luxury',
    food: 'luxury',
    dining: 'fine_dining',
    transport: 'luxury_car',
    clothing: 'luxury',
    entertainment: 'luxury',
    personal_care: 'luxury',
    domestic_staff: 'maid_and_driver',
    healthcare_insurance: 'premium_private',
    subscriptions: ['netflix', 'spotify', 'youtube', 'amazon', 'disney', 'chatgpt_plus', 'luxury_club', 'spa', 'personal_trainer', 'coursera_plus']
  },
  ultra_wealthy: {
    label: 'Billionaire / Elite Estate',
    description: 'Money is no object. Total luxury, full estate team.',
    phone: 'ultra',
    internet: 'gigabit',
    utilities: 'compound_villa',
    food: 'luxury',
    dining: 'exclusive',
    transport: 'luxury_car',
    clothing: 'haute_couture',
    entertainment: 'jetset',
    personal_care: 'luxury',
    domestic_staff: 'full_estate_team',
    healthcare_insurance: 'vip_concierge',
    subscriptions: ['netflix', 'spotify', 'youtube', 'amazon', 'disney', 'shahid', 'osn_plus', 'chatgpt_plus', 'ps_plus', 'luxury_club', 'spa', 'yoga', 'personal_trainer', 'news']
  }
};
