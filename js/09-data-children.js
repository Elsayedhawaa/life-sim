/* ============================================================
   WORLD LIFE — DATA: CHILDREN (EXPANDED)
   ============================================================
   Pure data. Pregnancy, birth, schools, activities, events, 
   healthcare, part-time jobs, milestones, and quirks.
   All costs in EGP base (multiplied by C().rate for other countries).
   ============================================================ */

/* ---------- BABY NAMES (Comprehensive Global Expansion) ---------- */
const CHILDREN_BABY_NAMES = {
  egy: {
    m: ['Mohamed','Ahmed','Youssef','Omar','Ali','Hassan','Mostafa','Karim','Adam','Ziad','Hamza','Samir','Tarek','Amr','Khaled','Mahmoud','Ibrahim','Yousef','Ismail','Adham','Marwan','Seif','Fares','Malek','Yehia','Hazem','Aziz','Nour','Anas','Rakan','Basel','Laith','Ammar','Amir','Bilal','Moustafa','Sherif','Hossam','Ramadan','Bahaa','Essam','Wael','Tamer','Ramy','Zaki','Badr','Mounir','Ashraf','Gamal','Naguib'],
    f: ['Mariam','Fatima','Aisha','Khadija','Zainab','Sara','Noor','Layla','Hana','Salma','Nada','Rana','Aya','Yasmin','Farida','Habiba','Malak','Jana','Lina','Nourhan','Yara','Dalia','Dina','Shaimaa','Rania','Sherine','Hoda','Mona','Amira','Reem','Maysa','Nabila','Heba','Shatha','Arwa','Aseel','Lubna','Ghada','Radwa','Nouran','Samar','Noha','Omnia','Doaa','Menna','Rawan','Joudy','Habiba','Basant']
  },
  usa: {
    m: ['Michael','David','James','Daniel','Ryan','Ethan','Noah','Liam','Jacob','Matthew','Alexander','Benjamin','Lucas','Henry','Jack','Mason','Logan','Elijah','Caleb','Gabriel','Jackson','Aiden','Oliver','Evelyn','Logan','Wyatt','Sebastian','Owen','Theodore','Mateo','Levi','Julian','Asher','Leo','Grayson','Lincoln','Ezra','Maverick','Hudson','Charles'],
    f: ['Emily','Sarah','Jessica','Ashley','Olivia','Emma','Sophia','Ava','Mia','Isabella','Amelia','Grace','Chloe','Lily','Hannah','Zoe','Harper','Evelyn','Abigail','Madison','Ella','Scarlett','Victoria','Aria','Penelope','Layla','Riley','Zoey','Nora','Hazel','Ellie','Aurora','Stella','Savannah','Brooklyn','Bella','Claire','Skylar','Lucy']
  },
  gbr: {
    m: ['Oliver','George','Arthur','Noah','Muhammad','Leo','Oscar','Harry','Archie','Jack','Charlie','Thomas','Henry','Dua','Mason','Freddie','Theodore','Lucas','Joshua','Alexander','James','Elijah','Edward','Harrison','Logan','Toby','Sebastian','Caleb'],
    f: ['Olivia','Amelia','Isla','Ava','Mia','Ivy','Lily','Florence','Freya','Grace','Willow','Rosie','Sophia','Isabella','Daisy','Sienna','Phoebe','Millie','Eva','Evie','Ada','Harper','Matilda','Maya','Elsie','Bella','Luna','Emilia']
  },
  deu: {
    m: ['Noah','Matteo','Elias','Leon','Paul','Finn','Luca','Louis','Ben','Henry','Emil','Felix','Liam','Theodor','Oskar','Milan','Paul','Jonathan','David','Julian','Lukas','Maximilian','Alexander','Elias','Jonas','Noah','Mats'],
    f: ['Emilia','Hannah','Emma','Sophia','Mila','Mia','Lina','Ella','Klara','Leonie','Lea','Clara','Luisa','Johanna','Greta','Charlotte','Frieda','Antonia','Malin','Nele','Romy','Amelie','Elena','Victoria','Mathilda','Ida']
  },
  can: {
    m: ['Noah','Liam','Jackson','Lucas','Oliver','Benjamin','Elijah','Ethan','Logan','Mason','William','James','Lucas','Alexander','Caleb','Owen','Gabriel','Theo','Leo','Thomas','Isaac','Samuel','Hunter','Connor'],
    f: ['Olivia','Emma','Charlotte','Amelia','Sophia','Ava','Mia','Evelyn','Harper','Luna','Camila','Gianna','Elizabeth','Aria','Ella','Scarlett','Mila','Aria','Chloe','Penelope','Layla','Riley','Zoey','Nora']
  },
  aus: {
    m: ['Oliver','Noah','Jack','William','Leo','Lucas','Thomas','Henry','Charlie','James','Mason','Elijah','Archie','Ethan','Lachlan','Hunter','Hudson','Logan','Cooper','Theodore','Samuel','Lucas','Benjamin'],
    f: ['Isla','Olivia','Charlotte','Amelia','Mia','Ava','Grace','Chloe','Harper','Matilda','Lily','Evelyn','Hannah','Zoe','Sienna','Mia','Ruby','Sophie','Willow','Lucy','Freya','Ella','Penelope','Evie']
  },
  uae: {
    m: ['Mohammed','Hamdan','Zayed','Khalifa','Rashid','Saeed','Buti','Mansoor','Sultan','Hazza','Tahnoun','Ali','Omar','Abdulla','Thani','Fahad','Nasser','Saif','Juma','Marwan','Maktoum','Buti','Eisa'],
    f: ['Fatima','Maryam','Shamma','Maitha','Latifa','Salama','Hind','Alya','Meera','Reem','Amna','Sheikha','Hissa','Noora','Ayesha','Wadha','Moaza','Rawdha','Shaikha','Hanan','Mitha','Alyazia']
  },
     sau: {
    m: ['Mohammed','Abdullah','Faisal','Khalid','Fahad','Saud','Turki','Nasser','Omar','Salman','Yousef','Majed','Bandar','Sultan','Rakan','Talal','Mishal','Nawaf','Bader','Waleed','Hamza','Ibrahim','Yazeed','Muath'],
    f: ['Noura','Hessa','Reem','Layan','Sara','Maha','Abeer','Jawaher','Lama','Ghada','Amal','Dana','Razan','Joud','Malak','Sultana','Munira','Aljohara','Lulwa','Raghad','Hind','Moudi','Shahad','Wasmiya']
  },
  jpn: {
    m: ['Ren','Haruto','Minato','Yuto','Sota','Haruki','Itsuki','Ryusei','Asahi','Taiga','Ren','Kaito','Daiki','Hiroto','Kenta','Shota','Takumi','Riku','Naoki','Kenji','Yuki','Kazuki','Sora','Kouta'],
    f: ['Himari','Hina','Riku','Mei','Yui','Akari','Sakura','Kanna','Koharu','Rin','Aoi','Mio','Yuna','Sara','Riko','Nana','Hana','Miku','Chiaki','Emi','Mai','Ayaka','Yuka','Misaki','Kaho']
  },
  ind: {
    m: ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Reyansh','Ayaan','Krishna','Ishaan','Dhruv','Kabir','Rudra','Advik','Darsh','Aarnav','Atharv','Kian','Riaan','Shaurya','Tanmay','Yuvraj','Samarth','Pranav'],
    f: ['Saanvi','Aanya','Aadhya','Diya','Pari','Ananya','Prisha','Rhea','Navya','Meera','Ahana','Myra','Kiara','Isha','Shanaya','Avani','Rashi','Tanya','Nisha','Kavya','Pooja','Anika','Diya','Suhana']
  }
};

/* ---------- MATERNITY HOSPITALS ---------- */
const CHILDREN_MATERNITY_HOSPITALS = [
  { id: 'home',    label: 'Home Birth (midwife)',         costEGP: 15000,   healthRisk: 0.20, comfort: 4,  desc: 'At home with a midwife. Cheaper but riskier.' },
  { id: 'public',  label: 'Public Hospital',              costEGP: 5000,    healthRisk: 0.15, comfort: 2,  desc: 'Affordable. Crowded, basic care.' },
  { id: 'private', label: 'Private Clinic',               costEGP: 40000,   healthRisk: 0.05, comfort: 6,  desc: 'Modern private hospital. Good care.' },
  { id: 'elite',   label: 'Elite Maternity Hospital',    costEGP: 200000,  healthRisk: 0.02, comfort: 10, desc: 'Five-star. Personal doctor, suite.' },
  { id: 'vip_suite',label: 'VIP Presidential Suite Hospital',costEGP: 500000, healthRisk: 0.01, comfort: 14, desc: 'Ultimate luxury with specialized 24/7 neonatal team.' }
];

/* ---------- PREGNANCY COMPLICATIONS ---------- */
const CHILDREN_PREGNANCY_COMPLICATIONS = [
  { id: 'morning_sickness',    chance: 0.40, costEGP: 2000,  motherHealthHit: 3,  desc: 'Morning sickness through pregnancy.' },
  { id: 'gestational_diabetes', chance: 0.08, costEGP: 8000, motherHealthHit: 8,  desc: 'Gestational diabetes. Needs monitoring.' },
  { id: 'pre_eclampsia',        chance: 0.04, costEGP: 15000, motherHealthHit: 12, desc: 'Pre-eclampsia. Dangerous.' },
  { id: 'premature_labor',      chance: 0.06, costEGP: 25000, motherHealthHit: 10, desc: 'Premature labor. NICU risk.' },
  { id: 'miscarriage',          chance: 0.10, costEGP: 5000,  motherHealthHit: 8,  desc: 'Miscarriage. Heartbreaking.' },
  { id: 'hyperemesis',          chance: 0.05, costEGP: 12000, motherHealthHit: 7,  desc: 'Severe persistent nausea and vomiting requiring IV fluids.' },
  { id: 'placenta_previa',      chance: 0.03, costEGP: 30000, motherHealthHit: 14, desc: 'Placenta blocking cervix requiring bed rest and specialized care.' },
  { id: 'fetal_growth_restrict',chance: 0.04, costEGP: 18000, motherHealthHit: 6,  desc: 'Baby not growing at expected rate, needs frequent scans.' }
];

/* ---------- BIRTH OUTCOMES ---------- */
const CHILDREN_BIRTH_OUTCOMES = [
  { id: 'normal',      chance: 0.55, extraCostEGP: 0,     healthImpact: 0,   desc: 'Normal vaginal birth.' },
  { id: 'c_section',   chance: 0.28, extraCostEGP: 40000, healthImpact: -2,  desc: 'C-section. Longer recovery.' },
  { id: 'premature',   chance: 0.07, extraCostEGP: 80000, healthImpact: -10, desc: 'Premature birth. NICU.' },
  { id: 'twins',       chance: 0.03, extraCostEGP: 60000, healthImpact: -3,  desc: 'Twins! Double the joy and cost.' },
  { id: 'triplets',    chance: 0.01, extraCostEGP: 150000,healthImpact: -7,  desc: 'Triplets! Extreme parenting challenge.' },
  { id: 'breech_birth',chance: 0.06, extraCostEGP: 55000, healthImpact: -4,  desc: 'Complicated breech delivery requiring emergency surgical intervention.' }
];

/* ---------- EXPENSE TIERS BY AGE ---------- */
const CHILDREN_EXPENSE_TIERS = {
  infant: {
    label: 'Infant (0-2)',
    basic:    { label: 'Basic',      monthlyEGP: 5000,  desc: 'Local formula, cloth diapers, hand-me-downs.' },
    standard: { label: 'Standard',   monthlyEGP: 12000, desc: 'Brand formula, Pampers, basic toys.' },
    premium:  { label: 'Premium',    monthlyEGP: 25000, desc: 'Imported formula, premium diapers, good clothes.' },
    luxury:   { label: 'Luxury',     monthlyEGP: 60000, desc: 'All imported, nanny included.' },
    elite:    { label: 'Elite',      monthlyEGP: 120000,desc: 'Full-time private wet nurse, organic imports, baby spa.' }
  },
  toddler: {
    label: 'Toddler (2-5)',
    basic:    { label: 'Basic',      monthlyEGP: 4000,  desc: 'Home meals, cheap clothes.' },
    standard: { label: 'Standard',   monthlyEGP: 10000, desc: 'Good food, quality clothes, toys.' },
    premium:  { label: 'Premium',    monthlyEGP: 22000, desc: 'Everything good quality, activities.' },
    luxury:   { label: 'Luxury',     monthlyEGP: 55000, desc: 'The best money can buy.' },
    elite:    { label: 'Elite',      monthlyEGP: 110000,desc: 'Private Montessori coach, custom wardrobe.' }
  },
  child: {
    label: 'Child (6-12)',
    basic:    { label: 'Basic',      monthlyEGP: 5000,  desc: 'Basic needs.' },
    standard: { label: 'Standard',   monthlyEGP: 12000, desc: 'Good life.' },
    premium:  { label: 'Premium',    monthlyEGP: 25000, desc: 'Everything premium.' },
    luxury:   { label: 'Luxury',     monthlyEGP: 60000, desc: 'Elite lifestyle.' },
    elite:    { label: 'Elite',      monthlyEGP: 130000,desc: 'Designer clothes, private driver, personal tutor.' }
  },
  teen: {
    label: 'Teen (13-18)',
    basic:    { label: 'Basic',      monthlyEGP: 6000,  desc: 'Basic teen needs.' },
    standard: { label: 'Standard',   monthlyEGP: 15000, desc: 'Phone, clothes, outings.' },
    premium:  { label: 'Premium',    monthlyEGP: 30000, desc: 'New iPhone, trendy clothes.' },
    luxury:   { label: 'Luxury',     monthlyEGP: 75000, desc: 'Everything they want.' },
    elite:    { label: 'Elite',      monthlyEGP: 160000,desc: 'Luxury allowance, sports car at 18, VIP travel.' }
  }
};

/* ---------- SCHOOL TIERS (REAL EGYPTIAN & GLOBAL PRICES) ---------- */
const CHILDREN_SCHOOLS = [
  { id: 'public',        tier: 'public',        label: 'Public School',                annualEGP: 500,    quality: 3,  desc: 'Free government school. Crowded, 50+ per class.' },
  { id: 'azhar',         tier: 'public',        label: 'Al-Azhar Institute',           annualEGP: 800,    quality: 4,  desc: 'Traditional religious & national curriculum.' },
  { id: 'language',      tier: 'national',      label: 'Language School',              annualEGP: 25000,  quality: 5,  desc: 'Egyptian curriculum + better English.' },
  { id: 'private',       tier: 'private',       label: 'Private National School',      annualEGP: 60000,  quality: 7,  desc: 'Good private Egyptian school.' },
  { id: 'private_top',   tier: 'private',       label: 'Top Private National School',  annualEGP: 120000, quality: 8,  desc: 'Best private Egyptian schools (e.g. Collège).' },
  { id: 'semi_intl',     tier: 'international', label: 'Semi-International School',    annualEGP: 180000, quality: 8,  desc: 'Mixed curriculum with enhanced foreign faculty.' },
  { id: 'igcse',         tier: 'international', label: 'British IGCSE School',          annualEGP: 280000, quality: 9,  desc: 'IGCSE curriculum. High quality.' },
  { id: 'american',      tier: 'international', label: 'American Diploma School',       annualEGP: 320000, quality: 9,  desc: 'American diploma. High quality.' },
  { id: 'ib',            tier: 'international', label: 'IB International School',       annualEGP: 420000, quality: 10, desc: 'IB diploma. Elite worldwide education.' },
  { id: 'boarding_elite',tier: 'international', label: 'Exclusive Swiss Boarding School', annualEGP: 1200000,quality: 10, desc: 'Ultra-elite international boarding school in Europe.' }
];

/* ---------- NURSERY SETUP (one-time, before birth) ---------- */
const CHILDREN_NURSERY_TIERS = [
  { id: 'minimal',  label: 'Basic nursery',    costEGP: 8000,    happiness: 1 },
  { id: 'standard', label: 'Standard nursery', costEGP: 25000, happiness: 3 },
  { id: 'premium',  label: 'Premium nursery',  costEGP: 70000, happiness: 6 },
  { id: 'luxury',   label: 'Luxury nursery',   costEGP: 200000, happiness: 10 },
  { id: 'organic',  label: 'Eco-Organic Nursery Suite', costEGP: 380000, happiness: 15 }
];

/* ---------- BABY CLOTHES (one-time, before birth) ---------- */
const CHILDREN_CLOTHES_TIERS = [
  { id: 'basic',    label: 'Basic set',    costEGP: 3000,  happiness: 0 },
  { id: 'standard', label: 'Standard set', costEGP: 10000, happiness: 2 },
  { id: 'premium',  label: 'Premium set',  costEGP: 30000, happiness: 4 },
  { id: 'luxury',   label: 'Luxury set',   costEGP: 80000, happiness: 6 },
  { id: 'designer', label: 'Designer Couture Baby Wardrobe', costEGP: 220000, happiness: 10 }
];

/* ---------- CHILD ACTIVITIES ---------- */
const CHILDREN_ACTIVITIES = [
  { id: 'soccer',          category: 'sports',      label: 'Soccer Club',              monthlyEGP: 1500, smarts: 0,  social: 5,  health: 5,  happiness: 5 },
  { id: 'swimming',        category: 'sports',      label: 'Swimming',                 monthlyEGP: 2000, smarts: 0,  social: 3,  health: 8,  happiness: 4 },
  { id: 'karate',          category: 'sports',      label: 'Martial Arts',             monthlyEGP: 1800, smarts: 0,  social: 3,  health: 5,  happiness: 3 },
  { id: 'gymnastics',      category: 'sports',      label: 'Gymnastics',               monthlyEGP: 2500, smarts: 0,  social: 2,  health: 5,  happiness: 3 },
  { id: 'tennis',          category: 'sports',      label: 'Tennis Academy',           monthlyEGP: 3500, smarts: 1,  social: 3,  health: 7,  happiness: 5 },
  { id: 'basketball',      category: 'sports',      label: 'Basketball Team',          monthlyEGP: 1600, smarts: 0,  social: 6,  health: 6,  happiness: 5 },
  { id: 'horse_riding',    category: 'sports',      label: 'Equestrian / Horse Riding',monthlyEGP: 6000, smarts: 2,  social: 4,  health: 6,  happiness: 8 },
  { id: 'ballet',          category: 'art',         label: 'Ballet Academy',           monthlyEGP: 3000, smarts: 1,  social: 4,  health: 7,  happiness: 5 },
  { id: 'piano',           category: 'music',       label: 'Piano Lessons',            monthlyEGP: 3000, smarts: 5,  social: 0,  health: 0,  happiness: 3 },
  { id: 'guitar',          category: 'music',       label: 'Guitar Lessons',           monthlyEGP: 2500, smarts: 3,  social: 0,  health: 0,  happiness: 2 },
  { id: 'violin',          category: 'music',       label: 'Violin Masterclass',       monthlyEGP: 4500, smarts: 7,  social: 0,  health: 0,  happiness: 4 },
  { id: 'vocals',          category: 'music',       label: 'Vocal Training',           monthlyEGP: 3500, smarts: 2,  social: 2,  health: 1,  happiness: 5 },
  { id: 'art',             category: 'art',         label: 'Art Classes',              monthlyEGP: 2000, smarts: 3,  social: 0,  health: 0,  happiness: 4 },
  { id: 'pottery',         category: 'art',         label: 'Pottery & Sculpture',      monthlyEGP: 2200, smarts: 3,  social: 1,  health: 0,  happiness: 4 },
  { id: 'coding',          category: 'tech',        label: 'Coding for Kids',          monthlyEGP: 4000, smarts: 8,  social: 0,  health: 0,  happiness: 1 },
  { id: 'robotics',        category: 'tech',        label: 'Robotics Workshop',        monthlyEGP: 5000, smarts: 10, social: 3,  health: 0,  happiness: 4 },
  { id: 'game_dev',        category: 'tech',        label: 'Game Development',         monthlyEGP: 4500, smarts: 9,  social: 2,  health: 0,  happiness: 6 },
  { id: 'english_tutoring',category: 'tutoring',    label: 'English Tutoring',         monthlyEGP: 2500, smarts: 8,  social: 0,  health: 0,  happiness: 0 },
  { id: 'math_tutoring',   category: 'tutoring',    label: 'Math Tutoring',            monthlyEGP: 3000, smarts: 8,  social: 0,  health: 0,  happiness: 0 },
  { id: 'physics_tutoring',category: 'tutoring',    label: 'Advanced Physics Tutoring',monthlyEGP: 3500, smarts: 10, social: 0,  health: 0,  happiness: -1 },
  { id: 'science_club',    category: 'tutoring',    label: 'Science Club',             monthlyEGP: 1500, smarts: 5,  social: 2,  health: 0,  happiness: 2 },
  { id: 'chess',           category: 'intellectual',label: 'Chess Club',               monthlyEGP: 800,  smarts: 4,  social: 1,  health: 0,  happiness: 2 },
  { id: 'debate',          category: 'intellectual',label: 'Model UN & Debate Team',   monthlyEGP: 2000, smarts: 8,  social: 7,  health: 0,  happiness: 3 },
  { id: 'finance_kids',    category: 'intellectual',label: 'Young Investors Club',     monthlyEGP: 3000, smarts: 9,  social: 3,  health: 0,  happiness: 2 },
  { id: 'dance',           category: 'art',         label: 'Dance Classes',            monthlyEGP: 2000, smarts: 0,  social: 3,  health: 0,  happiness: 4 },
  { id: 'theater',         category: 'art',         label: 'Drama & Acting Studio',    monthlyEGP: 3200, smarts: 4,  social: 8,  health: 1,  happiness: 6 },
  { id: 'foreign_lang',    category: 'language',    label: 'Foreign Language Class',   monthlyEGP: 2000, smarts: 6,  social: 0,  health: 0,  happiness: 1 },
  { id: 'summer_local',    category: 'camp',        label: 'Local Summer Camp',        annualEGP: 15000, smarts: 5,  social: 10, health: 0,  happiness: 10 },
  { id: 'summer_intl',     category: 'camp',        label: 'International Summer Camp',annualEGP: 250000, smarts: 15, social: 20, health: 0, happiness: 20 },
  { id: 'nasa_space_camp', category: 'camp',        label: 'NASA Space Camp USA',      annualEGP: 450000, smarts: 25, social: 15, health: 0, happiness: 30 },
  { id: 'scouts',          category: 'social',      label: 'Scouts',                   monthlyEGP: 500,  smarts: 2,  social: 6,  health: 2,  happiness: 4 },
  { id: 'reading',         category: 'intellectual',label: 'Book Club',                monthlyEGP: 400,  smarts: 5,  social: 2,  health: 0,  happiness: 2 }
];

/* ---------- CHILD MILESTONES (fire automatically) ---------- */
const CHILDREN_MILESTONES = [
  { id: 'first_smile',       ageYears: 0, desc: 'First smile.' },
  { id: 'first_word',        ageYears: 1, desc: 'First word.' },
  { id: 'first_step',        ageYears: 1, desc: 'First steps.' },
  { id: 'potty_trained',     ageYears: 2, desc: 'Potty trained.' },
  { id: 'started_kg',        ageYears: 4, desc: 'Started kindergarten.' },
  { id: 'first_day_school',  ageYears: 6, desc: 'First day of primary school.' },
  { id: 'lost_first_tooth',  ageYears: 7, desc: 'Lost first baby tooth.' },
  { id: 'best_friend_made',  ageYears: 8, desc: 'Made a lifelong best friend.' },
  { id: 'middle_school',     ageYears: 11, desc: 'Entered middle school.' },
  { id: 'first_phone',       ageYears: 11, desc: 'Got first phone.' },
  { id: 'started_puberty',   ageYears: 12, desc: 'Started puberty.' },
  { id: 'first_crush',       ageYears: 13, desc: 'First crush.' },
  { id: 'high_school',       ageYears: 14, desc: 'Started high school.' },
  { id: 'first_job_summer',  ageYears: 16, desc: 'Worked a summer job.' },
  { id: 'drivers_license',   ageYears: 18, desc: 'Got driver license.' },
  { id: 'graduated_school',  ageYears: 18, desc: 'Graduated high school.' },
  { id: 'started_college',   ageYears: 18, desc: 'Started university.' },
  { id: 'first_serious_rel', ageYears: 20, desc: 'Entered first serious relationship.' },
  { id: 'first_job',         ageYears: 22, desc: 'Started full-time career.' },
  { id: 'moved_out',         ageYears: 22, desc: 'Moved out into own apartment.' },
  { id: 'engaged',           ageYears: 24, desc: 'Got engaged.' },
  { id: 'married',           ageYears: 25, desc: 'Got married.' },
  { id: 'first_grandchild',  ageYears: 50, desc: 'Made you a grandparent!' }
];

/* ---------- CHILD EVENTS (random during childhood) ---------- */
const CHILDREN_EVENTS = [
  { id: 'first_friend',      ageMin: 4,  ageMax: 10, weight: 10, title: 'First Best Friend',            text: '{name} made a best friend at school.', happiness: +5, social: +3 },
  { id: 'honor_student',     ageMin: 8,  ageMax: 18, weight:  8, title: '{name} Made Honor Roll',        text: '{name} got top grades this term.',    smarts: +5, happiness: +3 },
  { id: 'school_fight',      ageMin: 8,  ageMax: 16, weight:  6, title: '{name} Got in a Fight',         text: 'A fight at school. Teacher called.',  happiness: -5, bond: -3, choice: true },
  { id: 'grades_drop',       ageMin: 12, ageMax: 18, weight:  8, title: '{name} Grades Dropping',        text: 'Grades are slipping. Needs attention.', smarts: -3, choice: true },
  { id: 'sports_talent',     ageMin: 8,  ageMax: 16, weight:  5, title: 'Sports Talent Found',           text: '{name} shows real athletic talent!',  social: +5, health: +5, happiness: +5 },
  { id: 'teen_rebellion',    ageMin: 14, ageMax: 18, weight:  6, title: '{name} Rebelling',               text: 'Testing boundaries. Arguing at home.', bond: -5, choice: true },
  { id: 'wants_phone',       ageMin: 11, ageMax: 15, weight:  8, title: '{name} Wants a Phone',          text: 'Everyone has one but them.',            choice: true },
  { id: 'first_crush',       ageMin: 12, ageMax: 17, weight:  7, title: '{name} Has a Crush',            text: 'First crush. Very shy about it.',     happiness: +4 },
  { id: 'smoking_caught',    ageMin: 14, ageMax: 18, weight:  4, title: 'Caught Smoking',                text: 'Found cigarettes in their bag.',        happiness: -5, choice: true },
  { id: 'bullying',          ageMin: 8,  ageMax: 16, weight:  4, title: 'Being Bullied',                 text: '{name} is being bullied at school.',    happiness: -8, choice: true },
  { id: 'honor_roll_top',    ageMin: 14, ageMax: 18, weight:  5, title: '{name} Top of Class',           text: 'Valedictorian candidate.',              smarts: +8, happiness: +8 },
  { id: 'sports_championship',ageMin: 10,ageMax: 18, weight:  5, title: 'Won Championship',              text: '{name} won a tournament.',              social: +8, happiness: +10 },
  { id: 'asked_to_party',    ageMin: 14, ageMax: 18, weight:  6, title: 'Asked to a Party',              text: 'First big party invite.',               choice: true },
  { id: 'first_heartbreak',  ageMin: 14, ageMax: 18, weight:  5, title: 'First Heartbreak',              text: 'First breakup. Devastated.',          happiness: -6, choice: true },
  { id: 'wants_new_phone',   ageMin: 13, ageMax: 18, weight:  7, title: 'Wants a New Phone',             text: 'Current phone is "ancient."',           choice: true },
  { id: 'bullied_others',    ageMin: 10, ageMax: 16, weight:  3, title: 'Bullied Another Child',         text: 'Caught being mean to a classmate.',     bond: -8, choice: true },
  { id: 'spending_addiction',ageMin: 15, ageMax: 18, weight:  3, title: 'Overspending',                  text: 'Allowance disappears instantly.',       choice: true },
  { id: 'pet_request',       ageMin: 6,  ageMax: 14, weight:  7, title: 'Wants a Pet',                   text: '{name} desperately wants a dog or cat.',choice: true },
  { id: 'science_fair_win',  ageMin: 9,  ageMax: 17, weight:  4, title: 'Science Fair Winner',           text: '{name} won 1st place at the science fair!', smarts: +7, happiness: +7 },
  { id: 'minor_accident',    ageMin: 4,  ageMax: 16, weight:  5, title: 'Playground Injury',             text: '{name} broke a bone playing sports.',  health: -5, happiness: -4 },
  { id: 'art_exhibition',    ageMin: 7,  ageMax: 18, weight:  4, title: 'Artwork Featured',              text: '{name}\'s painting is displayed in a gallery.', happiness: +6, smarts: +3 },
  { id: 'coding_hackathon',  ageMin: 12, ageMax: 18, weight:  3, title: 'Hackathon Victory',             text: '{name} won a youth coding competition.', smarts: +8, happiness: +8 },
  { id: 'peer_pressure_drugs',ageMin: 15, ageMax: 18, weight: 2, title: 'Dangerous Peer Pressure',       text: 'Offered illegal substances at a gathering.', happiness: -10, choice: true },
  { id: 'secret_job',        ageMin: 16, ageMax: 18, weight:  4, title: 'Secret Part-Time Job',          text: '{name} started working at a cafe behind your back.', smarts: +4, bond: -2 }
];

/* ---------- CHILD TRAITS (develop over time) ---------- */
const CHILDREN_TRAITS = [
  { id: 'curious',      label: 'Curious',      smartBias: 1 },
  { id: 'shy',          label: 'Shy',          socialBias: -1 },
  { id: 'outgoing',     label: 'Outgoing',     socialBias: 1 },
  { id: 'stubborn',     label: 'Stubborn',     bondBias: -1 },
  { id: 'kind',         label: 'Kind',         bondBias: 1 },
  { id: 'sporty',       label: 'Sporty',       healthBias: 1 },
  { id: 'bookish',      label: 'Bookish',      smartBias: 1 },
  { id: 'artistic',     label: 'Artistic',     happinessBias: 1 },
  { id: 'rebellious',   label: 'Rebellious',   bondBias: -1 },
  { id: 'sensitive',    label: 'Sensitive',    happinessBias: -1 },
  { id: 'ambitious',    label: 'Ambitious',    smartBias: 2 },
  { id: 'athletic',     label: 'Athletic',     healthBias: 2 },
  { id: 'creative',     label: 'Creative',     happinessBias: 1 },
  { id: 'anxious',      label: 'Anxious',      happinessBias: -2 },
  { id: 'charismatic',  label: 'Charismatic',  socialBias: 2 },
  { id: 'diligent',     label: 'Diligent',     smartBias: 1, bondBias: 1 }
];

/* ---------- CHILDREN FETAL HEALTH ---------- */
const CHILDREN_FETAL_HEALTH = [
  { roll: [0.00, 0.70], label: 'Healthy',      health: 100 },
  { roll: [0.70, 0.88], label: 'Minor issue', health: 85 },
  { roll: [0.88, 0.96], label: 'Some concern',health: 70 },
  { roll: [0.96, 0.99], label: 'Serious',      health: 50 },
  { roll: [0.99, 1.00], label: 'Critical High-Risk', health: 30 }
];
