/* ============================================================================
   World Life 2.0 — Education extras (v2.5): school tracks, named scholarships,
   named internships and school/university clubs.

   Scholarship grade and language bars are taken from the old game's
   EDU_SCHOLARSHIPS table (13-data-education.js) wherever it had them.
   Anything marked "modelled" below has no bar in the old game and uses a
   plainly-labelled estimate instead of an invented "real" number.
   Internship pay: the old game stored monthly pay in EGP; the USD figures
   here are converted from those EGP figures at ~48 EGP/USD (modelled).
   Club effects are modelled (small happiness/smarts/health gains).
   ========================================================================== */

/* School tracks by country — the real streams a pupil picks at secondary
   level. Countries without a distinct national stream get the generic
   national / international / vocational set. */
export const SCHOOL_TRACKS = {
  egy: [
    { id: 'egy_science', label: 'Thanaweya Amma — Science', desc: 'Physics, chemistry, biology and maths. The road to medicine, engineering and pharmacy.' },
    { id: 'egy_literary', label: 'Thanaweya Amma — Literary', desc: 'History, geography, languages and philosophy. The road to law, business and media.' },
    { id: 'egy_stem', label: 'STEM School Track', desc: 'Science, technology, engineering and maths in English at a STEM school. Very competitive entry.' },
    { id: 'egy_igcse', label: 'British IGCSE / A-Levels', desc: 'Cambridge IGCSE then A-Levels at a British-curriculum school.' },
    { id: 'egy_american', label: 'American Diploma', desc: 'US high-school diploma with SAT / ACT at an American-curriculum school.' },
    { id: 'egy_french', label: 'French Baccalaureate', desc: 'Baccalauréat at a French-language school such as Sainte-Famille or Saint-Marc.' }
  ],
  sau: [
    { id: 'sau_science', label: 'Tawjihi — Science Path', desc: 'Science stream plus Qudurat and Tahsili tests for university admission.' },
    { id: 'sau_literary', label: 'Tawjihi — Literary Path', desc: 'Humanities stream plus Qudurat and Tahsili tests.' },
    { id: 'sau_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma at an international school.' },
    { id: 'sau_american', label: 'American Diploma', desc: 'US diploma with SAT at an American-curriculum school.' }
  ],
  uae: [
    { id: 'uae_science', label: 'UAE Ministry — Science', desc: 'EmSAT science stream for federal university admission.' },
    { id: 'uae_arts', label: 'UAE Ministry — Arts', desc: 'EmSAT arts and humanities stream.' },
    { id: 'uae_alevels', label: 'British A-Levels', desc: 'GCSEs then A-Levels at a British-curriculum school.' },
    { id: 'uae_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma at an international school.' },
    { id: 'uae_american', label: 'American Diploma', desc: 'US diploma with SAT / AP at an American-curriculum school.' }
  ],
  gbr: [
    { id: 'gbr_alevel_science', label: 'A-Levels — Sciences', desc: 'Maths, further maths, physics, chemistry or biology. The road to medicine, engineering and computing.' },
    { id: 'gbr_alevel_humanities', label: 'A-Levels — Humanities', desc: 'History, English, economics, politics or languages.' },
    { id: 'gbr_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma instead of A-Levels.' },
    { id: 'gbr_btec', label: 'BTEC Vocational', desc: 'Practical vocational qualifications alongside or instead of A-Levels.' }
  ],
  usa: [
    { id: 'usa_ap', label: 'AP / Honours', desc: 'Advanced Placement and honours classes, aiming for a high GPA and SAT score.' },
    { id: 'usa_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma programme.' },
    { id: 'usa_standard', label: 'Standard Diploma', desc: 'Regular college-prep diploma.' },
    { id: 'usa_cte', label: 'Career & Technical (CTE)', desc: 'Vocational and technical training alongside the diploma.' }
  ],
  deu: [
    { id: 'deu_gymnasium', label: 'Gymnasium — Abitur', desc: 'Academic Gymnasium leading to the Abitur, the university entrance exam.' },
    { id: 'deu_realschule', label: 'Realschule', desc: 'Intermediate school; can lead on to Fachabitur and applied universities.' },
    { id: 'deu_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma at an international school.' }
  ],
  can: [
    { id: 'can_university', label: 'University Preparation (OSSD)', desc: 'University-stream courses under the provincial diploma.' },
    { id: 'can_college', label: 'College Preparation', desc: 'College-stream courses, more applied.' },
    { id: 'can_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma programme.' },
    { id: 'can_french', label: 'French Immersion', desc: 'Bilingual French-immersion stream.' }
  ],
  aus: [
    { id: 'aus_atar_science', label: 'ATAR — Sciences', desc: 'HSC / VCE science and maths subjects for a high ATAR.' },
    { id: 'aus_atar_humanities', label: 'ATAR — Humanities', desc: 'HSC / VCE humanities subjects for a high ATAR.' },
    { id: 'aus_vet', label: 'Vocational (VET)', desc: 'Vocational training subjects alongside the senior certificate.' },
    { id: 'aus_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma programme.' }
  ],
  nld: [
    { id: 'nld_vwo', label: 'VWO — Pre-University', desc: 'The highest Dutch stream, leading directly to research universities.' },
    { id: 'nld_havo', label: 'HAVO — Applied Sciences', desc: 'Senior general secondary, leading to universities of applied sciences.' },
    { id: 'nld_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma at an international school.' }
  ],
  fra: [
    { id: 'fra_bac_general_science', label: 'Bac Général — Scientifique', desc: 'Maths, physics-chemistry and life sciences specialities.' },
    { id: 'fra_bac_general_letters', label: 'Bac Général — Lettres & Sciences Humaines', desc: 'Humanities, languages, history-geography and philosophy.' },
    { id: 'fra_bac_techno', label: 'Bac Technologique', desc: 'Technological baccalaureate (STMG, STI2D and others).' },
    { id: 'fra_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma at an international school.' }
  ],
  jpn: [
    { id: 'jpn_general', label: 'General Course', desc: 'Standard academic course aiming at the Common University Entrance Exam.' },
    { id: 'jpn_science', label: 'Science & Maths Course', desc: 'Advanced science and maths (Super Science High School style).' },
    { id: 'jpn_vocational', label: 'Vocational Course', desc: 'Commercial, industrial or agricultural vocational course.' }
  ],
  ita: [
    { id: 'ita_liceo_classico', label: 'Liceo Classico', desc: 'Latin, Greek and humanities — the classic route to law and letters.' },
    { id: 'ita_liceo_scientifico', label: 'Liceo Scientifico', desc: 'Maths and sciences — the route to medicine, engineering and computing.' },
    { id: 'ita_tecnico', label: 'Istituto Tecnico', desc: 'Technical institute (economic or technological).' },
    { id: 'ita_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma at an international school.' }
  ],
  sgp: [
    { id: 'sgp_science', label: 'GCE A-Levels — Science', desc: 'H2 maths, physics, chemistry or biology.' },
    { id: 'sgp_arts', label: 'GCE A-Levels — Arts', desc: 'H2 humanities, economics and languages.' },
    { id: 'sgp_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma programme.' },
    { id: 'sgp_poly', label: 'Polytechnic Diploma', desc: 'Applied diploma route instead of A-Levels.' }
  ],
  bra: [
    { id: 'bra_general', label: 'Ensino Médio — General', desc: 'General secondary aiming at the ENEM exam.' },
    { id: 'bra_tecnico', label: 'Ensino Técnico', desc: 'Technical secondary (integrated with a trade qualification).' }
  ],
  ind: [
    { id: 'ind_science', label: 'CBSE — Science (PCM/PCB)', desc: 'Physics, chemistry, maths or biology. The road to JEE / NEET.' },
    { id: 'ind_commerce', label: 'CBSE — Commerce', desc: 'Accountancy, business studies and economics.' },
    { id: 'ind_humanities', label: 'CBSE — Humanities', desc: 'History, political science, geography and languages.' }
  ],
  che: [
    { id: 'che_gymnasium', label: 'Gymnasium — Matura', desc: 'Cantonal Gymnasium leading to the Matura, the university entrance certificate.' },
    { id: 'che_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma at an international school.' },
    { id: 'che_vocational', label: 'Vocational (EFZ)', desc: 'Swiss dual apprenticeship route with a federal certificate.' }
  ],
  swe: [
    { id: 'swe_natural', label: 'Naturvetenskapsprogrammet', desc: 'Natural science programme — maths, physics, chemistry and biology.' },
    { id: 'swe_social', label: 'Samhällsvetenskapsprogrammet', desc: 'Social science programme — history, civics and languages.' },
    { id: 'swe_economics', label: 'Ekonomiprogrammet', desc: 'Economics programme — business, law and enterprise.' },
    { id: 'swe_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma programme.' }
  ],
  tur: [
    { id: 'tur_science', label: 'Fen Lisesi — Science', desc: 'Science high school track, aiming at the YKS exam for medicine and engineering.' },
    { id: 'tur_anadolu', label: 'Anadolu Lisesi — General', desc: 'Anatolian high school, general academic track with a foreign language.' },
    { id: 'tur_social', label: 'Sosyal Bilimler Lisesi', desc: 'Social sciences high school — history, literature and languages.' },
    { id: 'tur_ib', label: 'International Baccalaureate (IB)', desc: 'IB Diploma at an international school.' }
  ]
};

/* ============================================================================
   TANSIK (Egypt) — real national minimums + modelled per-university spread.
   (v2.7) Elsayed played at 15 and saw the SAME cutoff table at every public
   university (Medicine 91% at Cairo, Alexandria, Ain Shams, Mansoura, ...).
   In real life the cutoffs differ by university and move every year.

   REAL figures (Ministry of Higher Education announcements, reported by
   Ahram Online and CairoScene):
   - 2024 (2024/25 year): Medicine 93.2, Dentistry 92.8, Pharmacy 91.7,
     Physiotherapy 92.2, Engineering 88.65.
   - 2023: Medicine 91.3, Dentistry ~91.0, Pharmacy 89.51, Physiotherapy
     90.12, Engineering 85.0.
   MODELLED (labelled as such in the UI): everything else — other years,
   other majors, and the gap BETWEEN universities. The national minimum is
   the floor; each university sits a little above or below it. In real life
   Mansoura, Alexandria and Cairo sit highest and regional universities
   lowest (top faculties in Cairo/Alexandria sit slightly above regional
   ones); the exact per-university figure here is an estimate, not a
   published number. Yearly movement is a small deterministic drift so the
   table is never identical two years running.
   ========================================================================== */
export const EGY_TANSIK_REAL = {
  2024: { medicine: 93.2, dentistry: 92.8, pharmacy: 91.7, physiotherapy: 92.2, engineering: 88.65 },
  2023: { medicine: 91.3, dentistry: 91.0, pharmacy: 89.51, physiotherapy: 90.12, engineering: 85.0 }
};

/* Per-university spread vs the national minimum, in percentage points.
   MODELLED (see note above). Matched by substring on the university name. */
export const EGY_TANSIK_UNI_DELTA = {
  mansoura: 0.5,
  alexandria: 0.3,
  cairo: 0.2,
  zagazig: 0.1,
  'ain shams': 0.0,
  tanta: -0.4,
  helwan: -0.7,
  assiut: -1.1,
  menoufia: -1.4
};

/* ============================================================================
   SCHOOL SYSTEMS (v2.7) — what each track really is. A track follows the
   SCHOOL, not the pupil's whim: Thanaweya Amma is taught at national
   schools, IGCSE/A-Levels at British-curriculum schools, the American
   Diploma at American-curriculum schools, and so on. Switching systems
   means changing school — with a real cost, a real loss and a real gain —
   never a free button. Every system states its benefit in plain words.
   ========================================================================== */
export const TRACK_SYSTEM_INFO = {
 national:{label:'National system',schoolNoun:'national school',benefit:'Local secondary-school pathway.',cost:'School fees are shown in Schools.',risk:'Your final game score affects available university choices.'},
 british:{label:'British curriculum',schoolNoun:'British-curriculum school',benefit:'GCSE/IGCSE and A-Level pathway.',cost:'School fees are shown in Schools.',risk:'Changing curriculum can reset your current track.'},
 american:{label:'American curriculum',schoolNoun:'American-curriculum school',benefit:'US-style secondary diploma pathway.',cost:'School fees are shown in Schools.',risk:'Test and qualification details are simplified.'},
 french:{label:'French curriculum',schoolNoun:'French-language school',benefit:'French-language secondary pathway.',cost:'School fees are shown in Schools.',risk:'Changing curriculum can reset your current track.'},
 german:{label:'German curriculum',schoolNoun:'German school',benefit:'German-language secondary pathway.',cost:'School fees are shown in Schools.',risk:'School qualification details are simplified.'},
 ib:{label:'International Baccalaureate',schoolNoun:'IB school',benefit:'International secondary-diploma pathway.',cost:'School fees are shown in Schools.',risk:'Real subject and qualification requirements are not fully simulated.'},
 stem:{label:'STEM school',schoolNoun:'STEM school',benefit:'Science, technology, engineering and maths focus.',cost:'School fees are shown in Schools.',risk:'School entry requirements are simplified.'},
 vocational:{label:'Vocational stream',schoolNoun:'technical school',benefit:'Applied and technical subjects.',cost:'School fees are shown in Schools.',risk:'Real trade qualifications are not fully simulated.'},
 international:{label:'International curriculum',schoolNoun:'international school',benefit:'International-school pathway.',cost:'School fees are shown in Schools.',risk:'Confirm your game track after changing schools.'}
};

/* Named scholarships. Bars from the old game's EDU_SCHOLARSHIPS table:
   requiresGPA / requiresIELTS / requiresGerman / requiresFrench / requiresWork /
   acceptanceRate are the old game's numbers, kept as-is. minScore is the
   same bar expressed on this game's 0–100 exam scale (GPA x 25, modelled
   conversion, noted here). level: 'undergrad' = before a first degree,
   'postgrad' = needs a completed degree, 'any' = either stage.
   Australia Awards and Türkiye Burslari were not in the old game: their
   bars are modelled estimates, labelled as such. */
export const SCHOLARSHIPS = [
  { id: 'fulbright', name: 'Fulbright Foreign Student Program', country: 'usa', coverage: 'full', level: 'postgrad', requiresGPA: 3.5, minScore: 88, requiresIELTS: 7.0, acceptanceRate: 0.08, desc: 'Full tuition plus a living stipend for study in the USA. J-1 visa: you are expected to return home for two years after.' },
  { id: 'chevening', name: 'Chevening Scholarship (UK)', country: 'gbr', coverage: 'full', level: 'postgrad', requiresGPA: 3.5, minScore: 88, requiresIELTS: 7.0, requiresWork: 2, acceptanceRate: 0.05, desc: 'UK government scholarship. Full funding for a one-year master’s; recipients are generally expected to return home for two years.' },
  { id: 'daad', name: 'DAAD Scholarship (Germany)', country: 'deu', coverage: 'full', level: 'postgrad', requiresGPA: 3.3, minScore: 83, requiresGerman: 3, acceptanceRate: 0.15, desc: 'German academic exchange. Full funding plus a monthly stipend.' },
  { id: 'erasmus', name: 'Erasmus Mundus (EU)', country: 'eu', coverage: 'full', level: 'postgrad', requiresGPA: 3.5, minScore: 88, requiresIELTS: 7.0, acceptanceRate: 0.10, desc: 'EU multi-country master’s programme, studying in two or three European countries. Very prestigious.' },
  { id: 'mext', name: 'MEXT (Japan)', country: 'jpn', coverage: 'full', level: 'any', requiresGPA: 3.5, minScore: 88, acceptanceRate: 0.12, desc: 'Japanese government scholarship. Includes one year of language preparation before the degree.' },
  { id: 'gates', name: 'Gates Cambridge Scholarship', country: 'gbr', coverage: 'full', level: 'postgrad', requiresGPA: 3.8, minScore: 95, acceptanceRate: 0.02, desc: 'Full Cambridge funding. Extremely selective.' },
  { id: 'rhodes', name: 'Rhodes Scholarship (Oxford)', country: 'gbr', coverage: 'full', level: 'postgrad', requiresGPA: 3.8, minScore: 95, requiresLeadership: true, acceptanceRate: 0.03, desc: 'Oxford full scholarship with a leadership focus.' },
  { id: 'eiffel', name: 'Eiffel Excellence (France)', country: 'fra', coverage: 'full', level: 'postgrad', requiresGPA: 3.5, minScore: 88, requiresFrench: 3, acceptanceRate: 0.10, desc: 'French government scholarship for master’s and PhD study.' },
  { id: 'vanier', name: 'Vanier Canada Graduate Scholarship', country: 'can', coverage: 'full', level: 'postgrad', requiresGPA: 3.5, minScore: 88, acceptanceRate: 0.10, desc: 'Canadian doctoral scholarship.' },
  { id: 'sawiris', name: 'Sawiris Foundation Scholarship', country: 'egy', coverage: 'full', level: 'undergrad', requiresGPA: 3.7, minScore: 93, reqUni: 'auc', acceptanceRate: 0.05, desc: 'Full ride to the American University in Cairo (or a top US university) for outstanding Egyptian students.' },
  { id: 'australia_awards', name: 'Australia Awards Scholarship', country: 'aus', coverage: 'full', level: 'any', requiresGPA: 3.0, minScore: 75, requiresIELTS: 6.5, acceptanceRate: 0.12, modelled: true, desc: 'Australian government scholarship. Full tuition, living costs and airfare. Bars are modelled estimates, not the old game’s numbers.' },
  { id: 'turkiye_burslari', name: 'Türkiye Burslari Scholarship', country: 'tur', coverage: 'full', level: 'any', requiresGPA: 3.0, minScore: 75, acceptanceRate: 0.15, modelled: true, desc: 'Turkish government scholarship. Full tuition, stipend, housing and a free year of Turkish language. Bars are modelled estimates, not the old game’s numbers.' }
];

/* Named internships. Company, pay and length come from the old game's
   EDU_INTERNSHIPS table; monthly pay was stored there in EGP and is
   converted here to USD at ~48 EGP/USD (modelled). requiresMajor uses
   this game's MAJORS ids. The last three are real, well-known programmes
   whose pay is a modelled estimate, labelled as such. */
export const INTERNSHIPS = [
  { id: 'cib_intern', label: 'CIB Summer Internship', company: 'Commercial International Bank (CIB)', country: 'egy', paid: true, monthlyPayUsd2026: 146, months: 3, requiresMajor: ['business'] },
  { id: 'ms_intern', label: 'Microsoft Egypt Intern', company: 'Microsoft', country: 'egy', paid: true, monthlyPayUsd2026: 250, months: 3, requiresMajor: ['cs', 'engineering'] },
  { id: 'pwc_intern', label: 'PwC Audit Intern', company: 'PwC', country: 'egy', paid: true, monthlyPayUsd2026: 167, months: 3, requiresMajor: ['business'] },
  { id: 'vodafone_intern', label: 'Vodafone Marketing Intern', company: 'Vodafone', country: 'egy', paid: true, monthlyPayUsd2026: 125, months: 3, requiresMajor: ['business', 'media'] },
  { id: 'eva_intern', label: 'Eva Pharma R&D Intern', company: 'Eva Pharma', country: 'egy', paid: true, monthlyPayUsd2026: 104, months: 3, requiresMajor: ['pharmacy', 'medicine', 'veterinary'] },
  { id: 'oracle_intern', label: 'Oracle Software Intern', company: 'Oracle', country: 'egy', paid: true, monthlyPayUsd2026: 208, months: 3, requiresMajor: ['cs'] },
  { id: 'un_intern', label: 'UN Agencies Intern (Cairo)', company: 'United Nations', country: 'egy', paid: true, monthlyPayUsd2026: 313, months: 6, requiresMajor: ['business', 'law', 'education'] },
  { id: 'mcit_intern', label: 'MCIT NTI Training', company: 'Egypt Ministry of Communications (MCIT)', country: 'egy', paid: true, monthlyPayUsd2026: 63, months: 3, requiresMajor: ['cs', 'engineering'] },
  { id: 'unpaid_ngo', label: 'NGO Volunteer Internship', company: 'Various NGOs', country: 'egy', paid: false, monthlyPayUsd2026: 0, months: 2, requiresMajor: [] },
  { id: 'law_firm', label: 'Matouk Bassiouny Law Clerk', company: 'Matouk Bassiouny & Hennawy', country: 'egy', paid: true, monthlyPayUsd2026: 104, months: 3, requiresMajor: ['law'] },
  { id: 'hospital_imtyaz', label: 'Imtyaz (Medical Internship)', company: 'Public Hospital', country: 'egy', paid: true, monthlyPayUsd2026: 73, months: 12, requiresMajor: ['medicine', 'dentistry', 'nursing', 'physiotherapy', 'pharmacy'] },
  { id: 'google_intern', label: 'Google Software Engineering Intern', company: 'Google', country: 'usa', paid: true, monthlyPayUsd2026: 7000, months: 3, requiresMajor: ['cs', 'engineering'], modelled: true },
  { id: 'goldman_intern', label: 'Goldman Sachs Summer Analyst', company: 'Goldman Sachs', country: 'usa', paid: true, monthlyPayUsd2026: 5500, months: 3, requiresMajor: ['business'], modelled: true },
  { id: 'airbus_intern', label: 'Airbus Engineering Intern', company: 'Airbus', country: 'deu', paid: true, monthlyPayUsd2026: 1800, months: 6, requiresMajor: ['engineering', 'architecture'], modelled: true }
];

/* Clubs. School clubs are open at ages 6–17, university clubs while
   enrolled at university. Effects are modelled: small, lasting gains to
   happiness, smarts, health or friendships, applied when joining. */
export const CLUBS = [
  { id: 'football', label: 'Football Team', level: 'school', desc: 'School football squad, training twice a week and weekend matches.', effects: { health: 4, happiness: 3 } },
  { id: 'music', label: 'Music Club', level: 'school', desc: 'Choir, orchestra or band practice after school.', effects: { happiness: 4, smarts: 1 } },
  { id: 'debate', label: 'Debate Club', level: 'school', desc: 'Weekly debates and public-speaking practice.', effects: { smarts: 3, happiness: 2 } },
  { id: 'art', label: 'Art Club', level: 'school', desc: 'Drawing, painting and crafts after school.', effects: { happiness: 4, smarts: 1 } },
  { id: 'coding', label: 'Coding Club', level: 'school', desc: 'Programming, robots and maths puzzles with the computer teacher.', effects: { smarts: 4, happiness: 1 } },
  { id: 'scouts', label: 'Scouts', level: 'school', desc: 'Camping, knots, first aid and weekend hikes.', effects: { health: 3, happiness: 3 } },
  { id: 'chess', label: 'Chess Club', level: 'school', desc: 'Tournaments against other schools.', effects: { smarts: 3, happiness: 1 } },
  { id: 'drama', label: 'Drama & Theatre', level: 'school', desc: 'School plays and drama workshops.', effects: { happiness: 4, smarts: 1 } },
  { id: 'student_union', label: 'Student Union', level: 'university', desc: 'Run for office and organise campus life.', effects: { smarts: 2, happiness: 4 } },
  { id: 'uni_debate', label: 'Debate Team', level: 'university', desc: 'Competitive university debating.', effects: { smarts: 3, happiness: 2 } },
  { id: 'model_un', label: 'Model UN (MUN)', level: 'university', desc: 'Simulate the United Nations and argue world politics.', effects: { smarts: 3, happiness: 3 } },
  { id: 'enactus', label: 'Enactus (Entrepreneurship)', level: 'university', desc: 'Student social-enterprise projects.', effects: { smarts: 3, happiness: 2 } },
  { id: 'sports_team', label: 'University Sports Team', level: 'university', desc: 'Competitive university sport.', effects: { health: 4, happiness: 3 } },
  { id: 'music_band', label: 'University Music Band', level: 'university', desc: 'Campus band, gigs and rehearsals.', effects: { happiness: 4 } },
  { id: 'theater', label: 'Theater Club', level: 'university', desc: 'University theatre productions.', effects: { happiness: 4 } },
  { id: 'student_paper', label: 'Student Newspaper', level: 'university', desc: 'Write and edit the campus paper.', effects: { smarts: 3, happiness: 1 } },
  { id: 'uni_coding', label: 'Coding / GDSC Club', level: 'university', desc: 'Google Developer Student Club: apps, hackathons, talks.', effects: { smarts: 4, happiness: 1 } },
  { id: 'robotics', label: 'Robotics Team', level: 'university', desc: 'Build robots and compete nationally.', effects: { smarts: 4, happiness: 2 } },
  { id: 'photography', label: 'Photography Club', level: 'university', desc: 'Photo walks, darkroom and exhibitions.', effects: { happiness: 3 } },
  { id: 'volunteering', label: 'Volunteering', level: 'university', desc: 'Community service and charity work.', effects: { happiness: 4 } },
  { id: 'uni_chess', label: 'Chess Club', level: 'university', desc: 'University chess tournaments.', effects: { smarts: 3, happiness: 1 } },
  { id: 'language_club', label: 'Language Exchange Club', level: 'university', desc: 'Practise foreign languages with native speakers.', effects: { smarts: 3, happiness: 2 } }
];
