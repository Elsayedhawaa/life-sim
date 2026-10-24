/* ============================================================
   WORLD LIFE — DATA: CAREER (v2 — expanded)
   ============================================================
   Pure data. Uses CAR_ prefix to avoid collisions.
   All salaries in EGP base (multiplied by C().rate in the view
   for other countries).

   File grows by adding companies/tracks/events to the existing
   arrays. Do not change variable names or shapes.
   ============================================================ */
/* ============================================================
   SESSION 9: CAREER BRANCH OPTIONS (EXPANDED)
   When a player reaches `branchAtLevel`, they must choose a specialty.
   Each choice either keeps them on the current track (generalist path)
   or switches them to a specialist track with its own salary ladder.
   ============================================================ */
const CAR_BRANCH_OPTIONS = {
  medicine: {
    branchAtLevel: 2,
    question: 'You have completed your core medical training (Internship + Residency). The next step is specialization. Choose carefully — this shapes your entire medical career.',
    options: [
      { trackId: 'surgery', label: '🔪 Surgery', desc: 'Highest prestige, highest pay, brutal hours. 5 more years of training.' },
      { trackId: 'pediatrics', label: '👶 Pediatrics', desc: 'Children\'s medicine. Respected and steady. Better work-life balance.' },
      { trackId: 'cardiology', label: '❤️ Cardiology', desc: 'Heart specialist. High pay and demand. Competitive entry.' },
      { trackId: 'neurology', label: '🧠 Neurology', desc: 'Brain and nervous system. Intellectually demanding, high prestige.' },
      { trackId: 'psychiatry', label: '🛋️ Psychiatry', desc: 'Mental health. Excellent work-life balance and private practice potential.' },
      { trackId: 'dermatology', label: '🧴 Dermatology', desc: 'Skin specialist. Exceptional work-life balance, highly lucrative.' },
      { trackId: 'anesthesiology', label: '💉 Anesthesiology', desc: 'Critical care in the OR. High pay, high pressure, exact science.' },
      { trackId: 'emergency', label: '🚑 Emergency Medicine', desc: 'High adrenaline, shift work. Great pay but heavy burnout risk.' },
      { trackId: 'medicine', label: '🩺 General Medicine', desc: 'Stay on the general practitioner path. Consultant → Department Head.' }
    ]
  },
  business: {
    branchAtLevel: 1,
    question: 'Your business foundation is complete. Which functional track will you pursue for the rest of your career?',
    options: [
      { trackId: 'accounting', label: '🧮 Accounting / Audit', desc: 'Numbers-driven. CPA / ACCA path. Stable.' },
      { trackId: 'investment', label: '📈 Investment / PE', desc: 'High-stakes finance. Big bonuses, high risk.' },
      { trackId: 'finance', label: '🏦 Corporate Finance', desc: 'Manage company money. Path to CFO. Stable and lucrative.' },
      { trackId: 'marketing', label: '📣 Marketing', desc: 'Brand, campaigns, growth. Creative track.' },
      { trackId: 'sales', label: '🤝 Sales / B2B', desc: 'Revenue driver. Heavy commission, high pressure, massive upside.' },
      { trackId: 'hr', label: '👥 Human Resources', desc: 'People management and hiring. Slower ladder.' },
      { trackId: 'supply_chain', label: '📦 Supply Chain & Ops', desc: 'Logistics and operations. High demand in global trade.' },
      { trackId: 'real_estate', label: '🏢 Real Estate & Property', desc: 'Commercial and residential development. Boom or bust potential.' },
      { trackId: 'consulting', label: '💼 Management Consulting', desc: 'Strategy for top firms. Heavy travel.' },
      { trackId: 'product', label: '🎯 Product Management', desc: 'Tech product leadership. High ceiling.' },
      { trackId: 'entrepreneurship', label: '🚀 Startup Founder', desc: 'Build from scratch. Highest risk, unlimited ceiling.' }
    ]
  },
  tech: {
    branchAtLevel: 2,
    question: 'You have proven yourself as a software engineer. Choose a specialization for the next decade:',
    options: [
      { trackId: 'data_science', label: '🧠 Data Science / AI', desc: 'Highest demand. Build the ML models everyone wants.' },
      { trackId: 'cybersecurity', label: '🛡 Cybersecurity', desc: 'Defend systems. Sky-high comp, high stress.' },
      { trackId: 'devops', label: '☁️ Cloud / DevOps', desc: 'Infrastructure and scaling. Very high pay, on-call nights.' },
      { trackId: 'systems_arch', label: '🏗 Systems Architecture', desc: 'Design massive systems. Very senior, high compensation.' },
      { trackId: 'mobile_dev', label: '📱 Mobile Development', desc: 'iOS/Android specialist. Highly visible consumer products.' },
      { trackId: 'game_dev', label: '🎮 Game Development', desc: 'Passion-driven. Fun products but notorious for crunch culture.' },
      { trackId: 'product_design', label: '🎨 Product Design (UX)', desc: 'Design leadership. Better work-life than engineering.' },
      { trackId: 'qa_engineering', label: '🧪 QA / Testing', desc: 'Quality engineering. Underrated stability.' },
      { trackId: 'tech', label: '💻 Full-Stack / General', desc: 'Stay as a generalist. Path to Staff Engineer or CTO.' }
    ]
  },
  engineering: {
    branchAtLevel: 2,
    question: 'Engineering foundation is done. Which branch will you commit to?',
    options: [
      { trackId: 'civil_eng', label: '🏗 Civil Engineering', desc: 'Infrastructure and construction. Heavy onsite work.' },
      { trackId: 'architect', label: '🏛 Architecture', desc: 'Building design and urban planning. Highly competitive.' },
      { trackId: 'electrical', label: '⚡ Electrical Engineering', desc: 'Power grids, electronics, and hardware.' },
      { trackId: 'chemical', label: '🧪 Chemical / Process', desc: 'Oil, gas, and pharma. Very high pay, industrial locations.' },
      { trackId: 'aerospace', label: '🚀 Aerospace Engineering', desc: 'Planes, rockets, satellites. Niche, high-security clearance often required.' },
      { trackId: 'biomedical', label: '🧬 Biomedical Engineering', desc: 'Prosthetics and medical devices. Merging tech and healthcare.' },
      { trackId: 'engineering', label: '⚙ General / Mechanical', desc: 'Broad engineering. Consultancy or management.' }
    ]
  },
  law: {
    branchAtLevel: 2,
    question: 'Your legal training is complete. Choose your path:',
    options: [
      { trackId: 'prosecutor', label: '⚖ Public Prosecutor / Judge', desc: 'Government legal track. Stable, highly respected.' },
      { trackId: 'law', label: '💼 Corporate Law', desc: 'Big-firm practice. Extreme hours, massive partner payouts.' },
      { trackId: 'criminal_defense', label: '🛡️ Criminal Defense', desc: 'Defend the accused. High stress, unpredictable income.' },
      { trackId: 'family_law', label: '👨‍👩‍👧 Family Law', desc: 'Divorce, custody, estates. Emotionally taxing, steady client base.' },
      { trackId: 'ip_law', label: '💡 Intellectual Property', desc: 'Patents and trademarks. Very lucrative, great work-life balance.' }
    ]
  },
  academia: {
    branchAtLevel: 2,
    question: 'You have earned your stripes as an assistant researcher. Where do you focus your academic career?',
    options: [
      { trackId: 'research', label: '🔬 Research Heavy', desc: 'Publish or perish. Pursue grants and Nobel ambitions.' },
      { trackId: 'administration', label: '🏛️ University Admin', desc: 'Path to Dean or University President. Highly political.' },
      { trackId: 'academia', label: '📚 Teaching Professor', desc: 'Focus on lecturing and students. Stable, lower stress.' }
    ]
  },
  media: {
    branchAtLevel: 1,
    question: 'You have broken into the media industry. Which path will you carve out?',
    options: [
      { trackId: 'journalism', label: '📰 Journalism', desc: 'Investigative reporting. Poor pay early on, high prestige later.' },
      { trackId: 'production', label: '🎬 Film & TV Production', desc: 'Behind the camera. Gig-based, networking heavy, chaotic.' },
      { trackId: 'pr', label: '🎙️ Public Relations', desc: 'Spin and corporate comms. High pay, managing crisis.' },
      { trackId: 'broadcasting', label: '📻 Broadcasting & On-Air', desc: 'TV/Radio personality. High visibility, image-conscious.' },
      { trackId: 'media', label: '📱 Content Creation', desc: 'Go independent. High risk, massive audience potential.' }
    ]
  },
  aviation: {
    branchAtLevel: 2,
    question: 'You have mastered the basics of flight and aviation operations. What is your ultimate goal?',
    options: [
      { trackId: 'commercial_pilot', label: '✈️ Commercial Pilot', desc: 'Fly the big jets. Heavy travel, massive seniority pay.' },
      { trackId: 'cargo_pilot', label: '📦 Cargo Pilot', desc: 'Fly freight globally. Night shifts, less passenger drama.' },
      { trackId: 'atc', label: '📡 Air Traffic Control', desc: 'High stress, mandatory retirement age, excellent government pay.' },
      { trackId: 'aviation', label: '🧳 Airline Management', desc: 'Corporate side of aviation. Route planning and fleet operations.' }
    ]
  },
  military: {
    branchAtLevel: 2,
    question: 'You have completed basic and junior officer training. Choose your warfare community:',
    options: [
      { trackId: 'infantry', label: '⚔️ Infantry / Combat', desc: 'Frontline leadership. Physically demanding, high risk.' },
      { trackId: 'intelligence', label: '👁️ Intelligence', desc: 'Analysis and covert ops. Strategic impact, highly classified.' },
      { trackId: 'logistics', label: '🚛 Logistics & Supply', desc: 'Keep the military moving. Highly transferable to civilian life.' },
      { trackId: 'military', label: '🎖️ General Staff', desc: 'Path to general/admiral. Highly political, administrative.' }
    ]
  },
  hospitality: {
    branchAtLevel: 1,
    question: 'You know the basics of service and operations. Where will you specialize in hospitality?',
    options: [
      { trackId: 'culinary', label: '🍳 Culinary Arts / Chef', desc: 'Kitchen leadership. Long hours, hot environment, creative.' },
      { trackId: 'hotel_mgmt', label: '🏨 Hotel Management', desc: 'Run resorts and properties. Corporate ladder, customer-facing.' },
      { trackId: 'events', label: '🎪 Event Planning', desc: 'Weddings, corporate summits. High stress, project-based.' }
    ]
  },
  government: {
    branchAtLevel: 2,
    question: 'You have navigated the lower ranks of public service. Choose your bureaucratic path:',
    options: [
      { trackId: 'diplomacy', label: '🌍 Foreign Service / Diplomat', desc: 'Represent the country abroad. High prestige, constant relocation.' },
      { trackId: 'policy', label: '📜 Policy Advisor', desc: 'Draft legislation and advise politicians. Behind the scenes power.' },
      { trackId: 'public_admin', label: '🏢 City/State Administration', desc: 'Manage municipal operations. Stable pension, local impact.' }
    ]
  }
};
/* ============================================================
   1. COMPANIES BY COUNTRY & INDUSTRY
   ============================================================
   payMult: multiplier on track base salary
   benefits: array of benefit IDs (see CAR_BENEFITS)
   stability: 0-1 (higher = safer from layoffs)
   prestige: 1-5 (resume boost)
   ============================================================ */

const CAR_COMPANIES = {
  /* ============================================================
     EGYPT — 23 industries (was 11)
     ============================================================ */
  egy: {
    banking: [
      { name: 'CIB (Commercial International Bank)', payMult: 1.20, benefits: ['health','bonus','stock','life'], stability: 0.95, prestige: 5 },
      { name: 'NBE (National Bank of Egypt)',        payMult: 0.95, benefits: ['health','bonus','pension'], stability: 1.00, prestige: 4 },
      { name: 'Banque Misr',                          payMult: 0.95, benefits: ['health','pension'], stability: 1.00, prestige: 4 },
      { name: 'QNB Alahli',                           payMult: 1.10, benefits: ['health','bonus'], stability: 0.90, prestige: 4 },
      { name: 'HSBC Egypt',                           payMult: 1.35, benefits: ['health','stock','bonus','wfh'], stability: 0.85, prestige: 5 },
      { name: 'Emirates NBD Egypt',                   payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'AlexBank',                             payMult: 1.05, benefits: ['health','bonus'], stability: 0.90, prestige: 4 },
      { name: 'AAIB (Arab African)',                  payMult: 1.10, benefits: ['health','bonus','stock'], stability: 0.90, prestige: 4 },
      { name: 'ADIB Egypt',                           payMult: 1.05, benefits: ['health','bonus'], stability: 0.90, prestige: 4 },
      { name: 'Credit Agricole Egypt',                payMult: 1.10, benefits: ['health','bonus'], stability: 0.90, prestige: 4 }
    ],
    tech: [
      { name: 'Amazon Egypt',                         payMult: 1.60, benefits: ['health','stock','wfh','signing'], stability: 0.75, prestige: 5 },
      { name: 'Microsoft Egypt',                      payMult: 1.55, benefits: ['health','stock','wfh','pension'], stability: 0.90, prestige: 5 },
      { name: 'Google Egypt',                         payMult: 1.80, benefits: ['health','stock','wfh','signing','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Vodafone Egypt',                       payMult: 1.10, benefits: ['health','bonus','wfh'], stability: 0.95, prestige: 4 },
      { name: 'Orange Egypt',                         payMult: 1.05, benefits: ['health','bonus'], stability: 0.95, prestige: 4 },
      { name: 'Etisalat Egypt (WE)',                  payMult: 1.05, benefits: ['health','bonus','pension'], stability: 1.00, prestige: 4 },
      { name: 'Fawry',                                payMult: 1.20, benefits: ['health','stock','bonus'], stability: 0.85, prestige: 4 },
      { name: 'Paymob',                               payMult: 1.25, benefits: ['health','stock','wfh'], stability: 0.75, prestige: 4 },
      { name: 'Thndr',                                payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.65, prestige: 3 },
      { name: 'Valeo Egypt',                          payMult: 1.20, benefits: ['health','bonus','wfh'], stability: 0.85, prestige: 4 },
      { name: 'Siemens Egypt',                        payMult: 1.30, benefits: ['health','stock','pension','wfh'], stability: 0.90, prestige: 5 },
      { name: 'Dell Egypt',                           payMult: 1.25, benefits: ['health','stock','wfh'], stability: 0.85, prestige: 4 },
      { name: 'Oracle Egypt',                         payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.90, prestige: 4 },
      { name: 'IBM Egypt',                            payMult: 1.35, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'Bosta',                                payMult: 1.20, benefits: ['health','stock','wfh'], stability: 0.70, prestige: 3 }
    ],
    bpo: [
      { name: 'Vodafone VOIS',                        payMult: 1.00, langTrack: 'en',  benefits: ['health','bonus'], stability: 0.90, prestige: 4 },
      { name: 'Teleperformance Egypt',                payMult: 1.05, langTrack: 'en',  benefits: ['health','bonus','transport'], stability: 0.85, prestige: 3 },
      { name: 'Concentrix Egypt',                     payMult: 1.10, langTrack: 'en',  benefits: ['health','bonus'], stability: 0.85, prestige: 3 },
      { name: 'Sutherland Egypt',                     payMult: 1.00, langTrack: 'en',  benefits: ['health','bonus'], stability: 0.85, prestige: 3 },
      { name: 'Xceed (Telecom Egypt)',                payMult: 0.95, langTrack: 'en',  benefits: ['health','bonus','pension'], stability: 0.95, prestige: 3 },
      { name: 'Foundever Egypt',                      payMult: 1.05, langTrack: 'en',  benefits: ['health','bonus'], stability: 0.80, prestige: 3 },
      { name: 'TTEC Egypt',                           payMult: 1.10, langTrack: 'en',  benefits: ['health','bonus'], stability: 0.80, prestige: 3 },
      { name: 'Alorica Egypt',                        payMult: 1.00, langTrack: 'en',  benefits: ['health','bonus'], stability: 0.80, prestige: 3 },
      { name: 'Majorel Egypt',                        payMult: 1.05, langTrack: 'en',  benefits: ['health','bonus'], stability: 0.80, prestige: 3 }
    ],
    consulting: [
      { name: 'PwC Egypt',                            payMult: 1.30, benefits: ['health','bonus','wfh'], stability: 0.85, prestige: 5 },
      { name: 'Deloitte Egypt',                       payMult: 1.30, benefits: ['health','bonus','wfh'], stability: 0.85, prestige: 5 },
      { name: 'KPMG Egypt',                           payMult: 1.25, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'EY Egypt',                             payMult: 1.25, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Grant Thornton Egypt',                 payMult: 1.10, benefits: ['health','bonus'], stability: 0.80, prestige: 4 },
      { name: 'McKinsey Egypt',                       payMult: 1.55, benefits: ['health','bonus','wfh'], stability: 0.80, prestige: 5 },
      { name: 'BCG Egypt',                            payMult: 1.50, benefits: ['health','bonus','wfh'], stability: 0.80, prestige: 5 },
      { name: 'Bain Egypt',                           payMult: 1.50, benefits: ['health','bonus'], stability: 0.80, prestige: 5 }
    ],
    law: [
      { name: 'Matouk Bassiouny & Hennawy',           payMult: 1.35, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Shalakany Law Office',                 payMult: 1.30, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Zulficar & Partners',                  payMult: 1.30, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Baker McKenzie Cairo',                 payMult: 1.50, benefits: ['health','bonus','wfh'], stability: 0.85, prestige: 5 },
      { name: 'ADSERO',                               payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'Dentons Egypt',                        payMult: 1.40, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Shahid Law Firm',                      payMult: 1.10, benefits: ['health'], stability: 0.80, prestige: 4 },
      { name: 'Zaki Hashem & Partners',               payMult: 1.20, benefits: ['health','bonus'], stability: 0.85, prestige: 5 }
    ],
    engineering: [
      { name: 'Orascom Construction',                 payMult: 1.10, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Hassan Allam Holding',                 payMult: 1.05, benefits: ['health','bonus'], stability: 0.90, prestige: 4 },
      { name: 'Elsewedy Electric',                    payMult: 1.05, benefits: ['health','bonus'], stability: 0.90, prestige: 4 },
      { name: 'Enppi',                                payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'Petrojet',                             payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 4 },
      { name: 'Dar Al-Handasah',                      payMult: 1.25, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Talaat Moustafa Group',                payMult: 1.05, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'Emaar Misr',                           payMult: 1.10, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'Asec Company',                         payMult: 1.00, benefits: ['health','bonus'], stability: 0.85, prestige: 4 }
    ],
    pharma: [
      { name: 'Eva Pharma',                           payMult: 1.10, benefits: ['health','bonus'], stability: 0.90, prestige: 4 },
      { name: 'Ibnsina Pharma',                       payMult: 1.00, benefits: ['health','bonus'], stability: 0.85, prestige: 3 },
      { name: 'Hikma Egypt',                          payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'Pfizer Egypt',                         payMult: 1.30, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Novartis Egypt',                       payMult: 1.25, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Amoun Pharmaceutical',                 payMult: 1.10, benefits: ['health','bonus'], stability: 0.90, prestige: 4 }
    ],
    fmcg: [
      { name: 'Unilever Egypt',                       payMult: 1.25, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'P&G Egypt',                            payMult: 1.30, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Nestlé Egypt',                         payMult: 1.20, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Coca-Cola Egypt',                      payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'PepsiCo Egypt',                        payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: "L'Oréal Egypt",                        payMult: 1.20, benefits: ['health','bonus'], stability: 0.85, prestige: 5 }
    ],
    retail: [
      { name: 'Spinneys',                             payMult: 0.90, benefits: ['health'], stability: 0.85, prestige: 2 },
      { name: 'Carrefour Egypt',                      payMult: 0.95, benefits: ['health','bonus'], stability: 0.85, prestige: 3 },
      { name: 'Metro',                                payMult: 0.90, benefits: ['health'], stability: 0.80, prestige: 2 },
      { name: 'Raya Holding',                         payMult: 1.00, benefits: ['health','bonus'], stability: 0.85, prestige: 3 }
    ],
    hospitals: [
      { name: 'Kasr El Aini (public)',                payMult: 0.55, benefits: ['pension'], stability: 1.00, prestige: 4 },
      { name: 'Dar Al Fouad',                         payMult: 1.50, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Saudi German Hospital Cairo',          payMult: 1.45, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Cleopatra Hospital',                   payMult: 1.30, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'El Salam International',               payMult: 1.20, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'As-Salam International',               payMult: 1.25, benefits: ['health'], stability: 0.85, prestige: 4 },
      { name: '57357 Cancer Center',                  payMult: 1.15, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    universities: [
      { name: 'Cairo University',                     payMult: 0.85, benefits: ['pension'], stability: 1.00, prestige: 5 },
      { name: 'Ain Shams University',                 payMult: 0.85, benefits: ['pension'], stability: 1.00, prestige: 4 },
      { name: 'Alexandria University',                payMult: 0.85, benefits: ['pension'], stability: 1.00, prestige: 4 },
      { name: 'AUC (American University in Cairo)',   payMult: 1.80, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'GUC (German University in Cairo)',     payMult: 1.40, benefits: ['health','pension'], stability: 0.90, prestige: 5 },
      { name: 'BUE (British University in Egypt)',    payMult: 1.30, benefits: ['health','pension'], stability: 0.90, prestige: 4 }
    ],
    oil_gas: [
      { name: 'Enppi (petroleum)',                    payMult: 1.20, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'Petrojet',                             payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 4 },
      { name: 'EGPC (Egyptian General Petroleum)',    payMult: 1.10, benefits: ['health','bonus','pension'], stability: 1.00, prestige: 5 },
      { name: 'Apache Egypt',                         payMult: 1.40, benefits: ['health','bonus','housing'], stability: 0.85, prestige: 5 }
    ],
    telecom: [
      { name: 'Vodafone Egypt',                       payMult: 1.15, benefits: ['health','bonus','wfh'], stability: 0.95, prestige: 4 },
      { name: 'Orange Egypt',                         payMult: 1.10, benefits: ['health','bonus'], stability: 0.95, prestige: 4 },
      { name: 'Etisalat (WE)',                        payMult: 1.10, benefits: ['health','bonus','pension'], stability: 1.00, prestige: 4 },
      { name: 'Telecom Egypt',                        payMult: 1.05, benefits: ['health','bonus','pension'], stability: 1.00, prestige: 4 }
    ],
    /* ===== NEW INDUSTRIES ===== */
    hotels: [
      { name: 'Marriott Mena House Cairo',            payMult: 1.20, benefits: ['health','bonus','meals'], stability: 0.90, prestige: 5 },
      { name: 'Four Seasons Cairo at Nile Plaza',     payMult: 1.40, benefits: ['health','bonus','meals'], stability: 0.90, prestige: 5 },
      { name: 'Hilton Cairo Heliopolis',              payMult: 1.15, benefits: ['health','bonus','meals'], stability: 0.90, prestige: 4 },
      { name: 'The Ritz-Carlton Cairo',               payMult: 1.45, benefits: ['health','bonus','meals'], stability: 0.85, prestige: 5 },
      { name: 'Mövenpick Resort El Sokhna',           payMult: 1.20, benefits: ['health','bonus','meals'], stability: 0.85, prestige: 4 }
    ],
    aviation: [
      { name: 'EgyptAir',                             payMult: 1.30, benefits: ['health','pension','travel'], stability: 0.95, prestige: 5 },
      { name: 'Air Cairo',                            payMult: 1.10, benefits: ['health','travel'], stability: 0.85, prestige: 4 },
      { name: 'Nile Air',                             payMult: 1.05, benefits: ['health','travel'], stability: 0.80, prestige: 3 },
      { name: 'Air Arabia Egypt',                     payMult: 1.15, benefits: ['health','travel'], stability: 0.85, prestige: 4 }
    ],
    media: [
      { name: 'MBC Masr',                             payMult: 1.20, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'CNBC Arabia',                          payMult: 1.30, benefits: ['health','bonus'], stability: 0.80, prestige: 5 },
      { name: 'Al-Ahram',                             payMult: 0.95, benefits: ['health','pension'], stability: 1.00, prestige: 4 },
      { name: 'Youm7',                                payMult: 1.00, benefits: ['health'], stability: 0.85, prestige: 3 },
      { name: 'Mada Masr',                            payMult: 0.90, benefits: [], stability: 0.70, prestige: 4 }
    ],
    government: [
      { name: 'Ministry of Finance',                  payMult: 0.95, benefits: ['pension','health'], stability: 1.00, prestige: 4 },
      { name: 'Ministry of Health',                   payMult: 0.90, benefits: ['pension','health'], stability: 1.00, prestige: 4 },
      { name: 'Central Bank of Egypt',                payMult: 1.15, benefits: ['pension','health'], stability: 1.00, prestige: 5 },
      { name: 'Ministry of Foreign Affairs',          payMult: 0.85, benefits: ['pension','health'], stability: 1.00, prestige: 5 }
    ],
    schools: [
      { name: 'Cairo American College',               payMult: 1.80, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'British International School Cairo',   payMult: 1.60, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Modern English School Cairo',          payMult: 1.30, benefits: ['health','pension'], stability: 0.90, prestige: 4 },
      { name: 'New Cairo British International',      payMult: 1.40, benefits: ['health','pension'], stability: 0.90, prestige: 4 },
      { name: 'Deutsche Schule Kairo',                payMult: 1.50, benefits: ['health','pension'], stability: 0.90, prestige: 5 }
    ],
    architecture: [
      { name: 'Dar Al-Handasah (Arch.)',              payMult: 1.30, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Design Group International',           payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'Momentum Consulting Engineering',      payMult: 1.10, benefits: ['health','bonus'], stability: 0.85, prestige: 4 }
    ],
    dental: [
      { name: 'Smile Care Clinics',                   payMult: 1.20, benefits: ['health','bonus'], stability: 0.85, prestige: 4 },
      { name: 'DentalPro Group Egypt',                payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 3 },
      { name: 'Cairo Dental Center',                  payMult: 1.10, benefits: ['health'], stability: 0.85, prestige: 3 }
    ],
    veterinary: [
      { name: 'Animal Hospital Egypt',                payMult: 1.10, benefits: ['health'], stability: 0.85, prestige: 3 },
      { name: 'CVL (Central Vet Lab)',                payMult: 0.95, benefits: ['health','pension'], stability: 0.90, prestige: 3 }
    ],
    trades: [
      { name: 'Self-employed (electrician)',          payMult: 1.00, benefits: [], stability: 0.70, prestige: 2 },
      { name: 'Self-employed (plumber)',              payMult: 1.00, benefits: [], stability: 0.70, prestige: 2 },
      { name: 'Self-employed (mechanic)',             payMult: 1.00, benefits: [], stability: 0.70, prestige: 2 }
    ]
  },

  /* ============================================================
     USA — 16 industries
     ============================================================ */
  usa: {
    banking: [
      { name: 'JPMorgan Chase',                       payMult: 1.30, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Goldman Sachs',                        payMult: 1.55, benefits: ['health','stock','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Morgan Stanley',                       payMult: 1.40, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Bank of America',                      payMult: 1.15, benefits: ['health','stock'], stability: 0.90, prestige: 4 },
      { name: 'Citibank',                             payMult: 1.20, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 4 }
    ],
    tech: [
      { name: 'Google',                               payMult: 1.50, benefits: ['health','stock','wfh','bonus','meals'], stability: 0.85, prestige: 5 },
      { name: 'Microsoft',                            payMult: 1.40, benefits: ['health','stock','wfh','bonus'], stability: 0.95, prestige: 5 },
      { name: 'Amazon',                               payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 },
      { name: 'Apple',                                payMult: 1.45, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Meta',                                 payMult: 1.55, benefits: ['health','stock','wfh','bonus'], stability: 0.75, prestige: 5 },
      { name: 'OpenAI',                               payMult: 1.70, benefits: ['health','stock','wfh','bonus'], stability: 0.70, prestige: 5 },
      { name: 'Stripe',                               payMult: 1.40, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 },
      { name: 'Airbnb',                               payMult: 1.35, benefits: ['health','stock','wfh'], stability: 0.75, prestige: 5 }
    ],
    law: [
      { name: 'Skadden',                              payMult: 1.60, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Wachtell',                             payMult: 1.80, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Latham & Watkins',                     payMult: 1.55, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Kirkland & Ellis',                     payMult: 1.60, benefits: ['health','bonus'], stability: 0.85, prestige: 5 }
    ],
    consulting: [
      { name: 'McKinsey',                             payMult: 1.50, benefits: ['health','bonus'], stability: 0.80, prestige: 5 },
      { name: 'BCG',                                  payMult: 1.45, benefits: ['health','bonus'], stability: 0.80, prestige: 5 },
      { name: 'Bain',                                 payMult: 1.45, benefits: ['health','bonus'], stability: 0.80, prestige: 5 },
      { name: 'Deloitte',                             payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 5 }
    ],
    hospitals: [
      { name: 'Mayo Clinic',                          payMult: 1.40, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Johns Hopkins Hospital',               payMult: 1.35, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Cleveland Clinic',                     payMult: 1.30, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Kaiser Permanente',                    payMult: 1.25, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    universities: [
      { name: 'Harvard',                              payMult: 1.60, benefits: ['health','pension','bonus'], stability: 0.95, prestige: 5 },
      { name: 'MIT',                                  payMult: 1.55, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Stanford',                             payMult: 1.55, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    retail: [
      { name: 'Walmart',                              payMult: 0.90, benefits: ['health'], stability: 0.90, prestige: 2 },
      { name: 'Target',                               payMult: 0.95, benefits: ['health','bonus'], stability: 0.85, prestige: 3 },
      { name: 'Costco',                               payMult: 1.05, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 3 },
      { name: 'Amazon (retail)',                      payMult: 1.00, benefits: ['health'], stability: 0.85, prestige: 2 }
    ],
    fmcg: [
      { name: 'P&G',                                  payMult: 1.25, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Unilever',                             payMult: 1.20, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Coca-Cola',                            payMult: 1.15, benefits: ['health','stock'], stability: 0.90, prestige: 4 },
      { name: 'PepsiCo',                              payMult: 1.15, benefits: ['health','stock'], stability: 0.90, prestige: 4 }
    ],
    engineering: [
      { name: 'Bechtel',                              payMult: 1.25, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Boeing',                               payMult: 1.20, benefits: ['health','stock','pension'], stability: 0.85, prestige: 5 },
      { name: 'Lockheed Martin',                      payMult: 1.20, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'Tesla',                                payMult: 1.10, benefits: ['health','stock'], stability: 0.75, prestige: 4 }
    ],
    oil_gas: [
      { name: 'ExxonMobil',                           payMult: 1.35, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'Chevron',                              payMult: 1.30, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'ConocoPhillips',                       payMult: 1.25, benefits: ['health','stock','pension'], stability: 0.85, prestige: 4 }
    ],
    telecom: [
      { name: 'AT&T',                                 payMult: 1.05, benefits: ['health','stock','pension'], stability: 0.90, prestige: 4 },
      { name: 'Verizon',                              payMult: 1.10, benefits: ['health','stock','pension'], stability: 0.90, prestige: 4 },
      { name: 'T-Mobile',                             payMult: 1.10, benefits: ['health','stock'], stability: 0.85, prestige: 4 }
    ],
    hotels: [
      { name: 'Marriott International',               payMult: 1.20, benefits: ['health','bonus','meals'], stability: 0.90, prestige: 5 },
      { name: 'Hilton Worldwide',                     payMult: 1.20, benefits: ['health','bonus','meals'], stability: 0.90, prestige: 5 },
      { name: 'Hyatt Hotels',                         payMult: 1.15, benefits: ['health','bonus','meals'], stability: 0.85, prestige: 4 }
    ],
    aviation: [
      { name: 'Delta Air Lines',                      payMult: 1.40, benefits: ['health','pension','travel'], stability: 0.90, prestige: 5 },
      { name: 'United Airlines',                      payMult: 1.35, benefits: ['health','pension','travel'], stability: 0.90, prestige: 5 },
      { name: 'American Airlines',                    payMult: 1.30, benefits: ['health','pension','travel'], stability: 0.90, prestige: 5 }
    ],
    media: [
      { name: 'CNN',                                  payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'New York Times',                       payMult: 1.20, benefits: ['health','bonus'], stability: 0.85, prestige: 5 },
      { name: 'The Atlantic',                         payMult: 1.10, benefits: ['health','bonus'], stability: 0.80, prestige: 5 }
    ],
    government: [
      { name: 'Federal Government (civil service)',   payMult: 0.95, benefits: ['health','pension','life'], stability: 1.00, prestige: 4 },
      { name: 'State Government',                     payMult: 0.90, benefits: ['health','pension'], stability: 1.00, prestige: 4 },
      { name: 'City Government',                      payMult: 0.85, benefits: ['health','pension'], stability: 1.00, prestige: 3 }
    ],
    schools: [
      { name: 'Phillips Exeter Academy',              payMult: 1.40, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Andover (Phillips Academy)',           payMult: 1.40, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Public School District',               payMult: 0.85, benefits: ['health','pension'], stability: 1.00, prestige: 3 }
    ]
  },

  /* ============================================================
     SAUDI ARABIA
     ============================================================ */
  sau: {
    oil_gas: [
      { name: 'Aramco',                               payMult: 1.40, benefits: ['health','stock','housing','pension'], stability: 1.00, prestige: 5 },
      { name: 'SABIC',                                payMult: 1.25, benefits: ['health','stock','housing'], stability: 0.90, prestige: 5 },
      { name: 'Maaden',                               payMult: 1.20, benefits: ['health','housing'], stability: 0.90, prestige: 4 }
    ],
    banking: [
      { name: 'SNB (Saudi National Bank)',            payMult: 1.15, benefits: ['health','housing','bonus'], stability: 0.95, prestige: 5 },
      { name: 'Al Rajhi Bank',                        payMult: 1.10, benefits: ['health','housing','bonus'], stability: 0.95, prestige: 5 },
      { name: 'Riyad Bank',                           payMult: 1.05, benefits: ['health','housing'], stability: 0.90, prestige: 4 }
    ],
    telecom: [
      { name: 'STC',                                  payMult: 1.10, benefits: ['health','housing','stock'], stability: 0.90, prestige: 5 },
      { name: 'Mobily',                               payMult: 1.05, benefits: ['health','housing'], stability: 0.85, prestige: 4 },
      { name: 'Zain KSA',                             payMult: 1.00, benefits: ['health','housing'], stability: 0.85, prestige: 4 }
    ],
    hospitals: [
      { name: 'King Faisal Hospital',                 payMult: 1.20, benefits: ['health','housing'], stability: 0.95, prestige: 5 },
      { name: 'King Fahd Medical City',               payMult: 1.15, benefits: ['health','housing'], stability: 0.95, prestige: 5 }
    ],
         schools: [
      { name: 'American International School Riyadh',   payMult: 1.80, benefits: ['health','housing','flights','bonus'], stability: 0.95, prestige: 5 },
      { name: 'British International School Riyadh',    payMult: 1.70, benefits: ['health','housing','flights'], stability: 0.95, prestige: 5 },
      { name: 'Riyadh International School',            payMult: 1.60, benefits: ['health','housing','flights'], stability: 0.95, prestige: 5 },
      { name: 'Dhahran British Grammar School',         payMult: 1.65, benefits: ['health','housing','flights'], stability: 0.90, prestige: 5 },
      { name: 'Continental School Jeddah',              payMult: 1.40, benefits: ['health','housing'],          stability: 0.90, prestige: 4 },
      { name: 'Jeddah International School',            payMult: 1.50, benefits: ['health','housing'],          stability: 0.95, prestige: 4 }
    ],
    tech: [
      { name: 'Google KSA',                           payMult: 1.55, benefits: ['health','stock','housing'], stability: 0.85, prestige: 5 },
      { name: 'Microsoft KSA',                        payMult: 1.45, benefits: ['health','stock','housing'], stability: 0.90, prestige: 5 },
      { name: 'Amazon KSA',                           payMult: 1.30, benefits: ['health','stock','housing'], stability: 0.80, prestige: 5 }
    ],
    engineering: [
      { name: 'Saudi Binladin Group',                 payMult: 1.10, benefits: ['health','housing'], stability: 0.85, prestige: 4 },
      { name: 'Bechtel KSA',                          payMult: 1.25, benefits: ['health','housing'], stability: 0.90, prestige: 5 },
      { name: 'Nesma & Partners',                     payMult: 1.10, benefits: ['health','housing'], stability: 0.85, prestige: 4 }
    ],
    universities: [
      { name: 'KAUST',                                payMult: 1.80, benefits: ['health','housing','pension'], stability: 0.95, prestige: 5 },
      { name: 'King Saud University',                 payMult: 1.10, benefits: ['health','housing','pension'], stability: 1.00, prestige: 5 },
      { name: 'KFUPM',                                payMult: 1.20, benefits: ['health','housing','pension'], stability: 0.95, prestige: 5 }
    ],
    government: [
      { name: 'Ministry of Finance',                  payMult: 1.00, benefits: ['pension','housing'], stability: 1.00, prestige: 4 },
      { name: 'Saudi Arabian Monetary Authority',     payMult: 1.15, benefits: ['pension','housing'], stability: 1.00, prestige: 5 }
    ],
    law: [
      { name: 'Al Tamimi & Co (KSA)',                 payMult: 1.30, benefits: ['health','housing','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Baker McKenzie KSA',                   payMult: 1.40, benefits: ['health','housing','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Zaki Hashem KSA',                      payMult: 1.10, benefits: ['health','housing'], stability: 0.85, prestige: 4 }
    ],
    hotels: [
      { name: 'Marriott Makkah',                      payMult: 1.20, benefits: ['health','housing','meals'], stability: 0.90, prestige: 5 },
      { name: 'Four Seasons Riyadh',                  payMult: 1.40, benefits: ['health','housing','meals'], stability: 0.90, prestige: 5 }
    ],
    aviation: [
      { name: 'Saudia',                               payMult: 1.30, benefits: ['health','housing','travel'], stability: 0.95, prestige: 5 },
      { name: 'Flyadeal',                             payMult: 1.10, benefits: ['health','housing','travel'], stability: 0.85, prestige: 4 }
    ],
    media: [
      { name: 'MBC Group',                            payMult: 1.25, benefits: ['health','housing','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Al Arabiya',                           payMult: 1.20, benefits: ['health','housing'], stability: 0.85, prestige: 5 }
    ]
  },

  /* ============================================================
     UK
     ============================================================ */
  gbr: {
    banking: [
      { name: 'HSBC UK',                              payMult: 1.20, benefits: ['health','stock','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Barclays',                             payMult: 1.15, benefits: ['health','stock','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Lloyds Banking Group',                 payMult: 1.05, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 4 },
      { name: 'NatWest',                              payMult: 1.10, benefits: ['health','stock','pension'], stability: 0.90, prestige: 4 }
    ],
    tech: [
      { name: 'DeepMind',                             payMult: 1.60, benefits: ['health','stock','wfh','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Google UK',                            payMult: 1.45, benefits: ['health','stock','wfh','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Monzo',                                payMult: 1.20, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 4 },
      { name: 'Revolut',                              payMult: 1.25, benefits: ['health','stock','wfh'], stability: 0.75, prestige: 4 },
      { name: 'ARM',                                  payMult: 1.20, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 }
    ],
    law: [
      { name: 'Clifford Chance',                      payMult: 1.55, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Linklaters',                           payMult: 1.50, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Freshfields',                          payMult: 1.50, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Allen & Overy',                        payMult: 1.45, benefits: ['health','bonus'], stability: 0.85, prestige: 5 }
    ],
    consulting: [
      { name: 'McKinsey UK',                          payMult: 1.45, benefits: ['health','bonus'], stability: 0.80, prestige: 5 },
      { name: 'BCG UK',                               payMult: 1.40, benefits: ['health','bonus'], stability: 0.80, prestige: 5 },
      { name: 'Bain UK',                              payMult: 1.40, benefits: ['health','bonus'], stability: 0.80, prestige: 5 }
    ],
    hospitals: [
      { name: 'NHS (public)',                         payMult: 0.85, benefits: ['health','pension'], stability: 1.00, prestige: 4 },
      { name: 'Bupa Cromwell Hospital',               payMult: 1.30, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'The Harley Street Clinic',             payMult: 1.35, benefits: ['health','bonus'], stability: 0.90, prestige: 5 }
    ],
    universities: [
      { name: 'Oxford',                               payMult: 1.30, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Cambridge',                            payMult: 1.30, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Imperial College London',              payMult: 1.25, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'UCL',                                  payMult: 1.20, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    retail: [
      { name: 'Tesco',                                payMult: 0.90, benefits: ['health','pension'], stability: 0.90, prestige: 2 },
      { name: 'Sainsbury\'s',                         payMult: 0.90, benefits: ['health','pension'], stability: 0.90, prestige: 2 },
      { name: 'Marks & Spencer',                      payMult: 0.95, benefits: ['health','pension'], stability: 0.90, prestige: 3 }
    ],
    fmcg: [
      { name: 'Unilever UK',                          payMult: 1.25, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Diageo',                               payMult: 1.20, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Reckitt',                              payMult: 1.20, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 }
    ],
    engineering: [
      { name: 'Rolls-Royce',                          payMult: 1.15, benefits: ['health','pension','stock'], stability: 0.90, prestige: 5 },
      { name: 'BAE Systems',                          payMult: 1.15, benefits: ['health','pension'], stability: 0.90, prestige: 5 },
      { name: 'Arup',                                 payMult: 1.10, benefits: ['health','pension'], stability: 0.90, prestige: 5 }
    ],
    hotels: [
      { name: 'Claridge\'s',                          payMult: 1.25, benefits: ['health','bonus','meals'], stability: 0.90, prestige: 5 },
      { name: 'The Savoy',                            payMult: 1.20, benefits: ['health','bonus','meals'], stability: 0.90, prestige: 5 },
      { name: 'Premier Inn (Whitbread)',              payMult: 0.95, benefits: ['health','bonus'], stability: 0.90, prestige: 3 }
    ],
    media: [
      { name: 'BBC',                                  payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'The Guardian',                         payMult: 1.05, benefits: ['health','pension'], stability: 0.90, prestige: 5 },
      { name: 'Financial Times',                      payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 }
    ],
    aviation: [
      { name: 'British Airways',                      payMult: 1.35, benefits: ['health','pension','travel'], stability: 0.90, prestige: 5 },
      { name: 'Virgin Atlantic',                      payMult: 1.30, benefits: ['health','pension','travel'], stability: 0.85, prestige: 5 },
      { name: 'easyJet',                              payMult: 1.15, benefits: ['health','travel'], stability: 0.85, prestige: 4 }
    ],
    government: [
      { name: 'UK Civil Service',                     payMult: 0.95, benefits: ['pension','health'], stability: 1.00, prestige: 4 },
      { name: 'Bank of England',                      payMult: 1.20, benefits: ['pension','health','bonus'], stability: 1.00, prestige: 5 }
    ],
    schools: [
      { name: 'Eton College',                         payMult: 1.35, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Harrow School',                        payMult: 1.30, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'State Secondary School',               payMult: 0.85, benefits: ['pension'], stability: 1.00, prestige: 3 }
    ]
  },

  /* ============================================================
     GERMANY
     ============================================================ */
  deu: {
    banking: [
      { name: 'Deutsche Bank',                        payMult: 1.20, benefits: ['health','bonus','pension'], stability: 0.85, prestige: 5 },
      { name: 'Commerzbank',                          payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.85, prestige: 4 },
      { name: 'Sparkasse',                            payMult: 0.95, benefits: ['health','pension'], stability: 1.00, prestige: 4 },
      { name: 'N26',                                  payMult: 1.15, benefits: ['health','stock','wfh'], stability: 0.75, prestige: 4 }
    ],
    tech: [
      { name: 'SAP',                                  payMult: 1.30, benefits: ['health','stock','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'Siemens',                              payMult: 1.20, benefits: ['health','stock','pension'], stability: 0.95, prestige: 5 },
      { name: 'Bosch',                                payMult: 1.15, benefits: ['health','pension','bonus'], stability: 0.95, prestige: 5 },
      { name: 'Zalando',                              payMult: 1.20, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 4 }
    ],
    law: [
      { name: 'Freshfields Germany',                  payMult: 1.35, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Hengeler Mueller',                     payMult: 1.30, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Gleiss Lutz',                          payMult: 1.25, benefits: ['health','bonus'], stability: 0.90, prestige: 5 }
    ],
    hospitals: [
      { name: 'Charité Berlin',                       payMult: 1.00, benefits: ['health','pension'], stability: 1.00, prestige: 5 },
      { name: 'Universitätsklinikum Heidelberg',      payMult: 1.00, benefits: ['health','pension'], stability: 1.00, prestige: 5 },
      { name: 'Asklepios Klinik',                     payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 4 }
    ],
    universities: [
      { name: 'TU Munich',                            payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'LMU Munich',                           payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Heidelberg University',                payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    engineering: [
      { name: 'BMW',                                  payMult: 1.20, benefits: ['health','stock','pension','bonus'], stability: 0.95, prestige: 5 },
      { name: 'Mercedes-Benz',                        payMult: 1.20, benefits: ['health','stock','pension','bonus'], stability: 0.95, prestige: 5 },
      { name: 'Volkswagen',                           payMult: 1.15, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'Airbus',                               payMult: 1.15, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 }
    ],
    fmcg: [
      { name: 'Henkel',                               payMult: 1.15, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'Beiersdorf (Nivea)',                   payMult: 1.10, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'Adidas',                               payMult: 1.10, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 }
    ],
    government: [
      { name: 'German Civil Service',                 payMult: 0.95, benefits: ['pension','health'], stability: 1.00, prestige: 4 },
      { name: 'Bundesbank',                           payMult: 1.15, benefits: ['pension','health'], stability: 1.00, prestige: 5 }
    ]
  },

  /* ============================================================
     CANADA
     ============================================================ */
  can: {
    banking: [
      { name: 'RBC',                                  payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'TD Bank',                              payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'Scotiabank',                           payMult: 1.05, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 4 },
      { name: 'BMO',                                  payMult: 1.05, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 4 }
    ],
    tech: [
      { name: 'Shopify',                              payMult: 1.35, benefits: ['health','stock','wfh','bonus'], stability: 0.80, prestige: 5 },
      { name: 'Amazon Canada',                        payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 },
      { name: 'Google Canada',                        payMult: 1.45, benefits: ['health','stock','wfh'], stability: 0.85, prestige: 5 },
      { name: 'OpenText',                             payMult: 1.15, benefits: ['health','stock','wfh'], stability: 0.90, prestige: 4 }
    ],
    law: [
      { name: 'McCarthy Tétrault',                    payMult: 1.35, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Blake Cassels',                        payMult: 1.30, benefits: ['health','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Osler Hoskin',                         payMult: 1.30, benefits: ['health','bonus'], stability: 0.90, prestige: 5 }
    ],
    hospitals: [
      { name: 'Toronto General Hospital',             payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Vancouver General Hospital',           payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    universities: [
      { name: 'University of Toronto',                payMult: 1.15, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'UBC',                                  payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'McGill',                               payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    engineering: [
      { name: 'SNC-Lavalin',                          payMult: 1.15, benefits: ['health','pension'], stability: 0.90, prestige: 4 },
      { name: 'Stantec',                              payMult: 1.10, benefits: ['health','pension'], stability: 0.90, prestige: 4 }
    ],
    consulting: [
      { name: 'McKinsey Canada',                      payMult: 1.45, benefits: ['health','bonus'], stability: 0.80, prestige: 5 },
      { name: 'Deloitte Canada',                      payMult: 1.15, benefits: ['health','bonus'], stability: 0.85, prestige: 5 }
    ]
  },

  /* ============================================================
     AUSTRALIA
     ============================================================ */
  aus: {
    banking: [
      { name: 'Commonwealth Bank',                    payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'Westpac',                              payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'ANZ',                                  payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'NAB',                                  payMult: 1.05, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 4 }
    ],
    tech: [
      { name: 'Atlassian',                            payMult: 1.35, benefits: ['health','stock','wfh','bonus'], stability: 0.85, prestige: 5 },
      { name: 'Canva',                                payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 },
      { name: 'Google Australia',                     payMult: 1.45, benefits: ['health','stock','wfh'], stability: 0.85, prestige: 5 }
    ],
    hospitals: [
      { name: 'Royal Melbourne Hospital',             payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Royal Prince Alfred Hospital',         payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    universities: [
      { name: 'University of Melbourne',              payMult: 1.15, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'UNSW',                                 payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'ANU',                                  payMult: 1.15, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    engineering: [
      { name: 'BHP',                                  payMult: 1.30, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'Rio Tinto',                            payMult: 1.25, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'CIMIC Group',                          payMult: 1.15, benefits: ['health','pension'], stability: 0.85, prestige: 4 }
    ]
  },

  /* ============================================================
     UAE
     ============================================================ */
  uae: {
    banking: [
      { name: 'Emirates NBD',                         payMult: 1.20, benefits: ['health','bonus','housing'], stability: 0.90, prestige: 5 },
      { name: 'First Abu Dhabi Bank (FAB)',           payMult: 1.20, benefits: ['health','bonus','housing'], stability: 0.90, prestige: 5 },
      { name: 'Mashreq Bank',                         payMult: 1.15, benefits: ['health','bonus','housing'], stability: 0.85, prestige: 4 }
    ],
         schools: [
      { name: 'GEMS Wellington International School',   payMult: 1.60, benefits: ['health','housing','flights'], stability: 0.95, prestige: 5 },
      { name: 'Dubai American Academy',                 payMult: 1.80, benefits: ['health','housing','flights','bonus'], stability: 0.95, prestige: 5 },
      { name: 'Dubai College',                          payMult: 1.90, benefits: ['health','housing','flights'], stability: 0.95, prestige: 5 },
      { name: 'Repton School Dubai',                    payMult: 1.70, benefits: ['health','housing'],          stability: 0.95, prestige: 5 },
      { name: 'The English College Dubai',              payMult: 1.50, benefits: ['health','housing'],          stability: 0.90, prestige: 4 },
      { name: 'Jumeirah College',                       payMult: 1.55, benefits: ['health','housing'],          stability: 0.90, prestige: 4 }
    ],
    tech: [
      { name: 'Google UAE',                           payMult: 1.50, benefits: ['health','stock','housing'], stability: 0.85, prestige: 5 },
      { name: 'Careem',                               payMult: 1.30, benefits: ['health','stock','housing'], stability: 0.80, prestige: 5 },
      { name: 'Noon.com',                             payMult: 1.25, benefits: ['health','stock','housing'], stability: 0.75, prestige: 4 }
    ],
    hospitals: [
      { name: 'Cleveland Clinic Abu Dhabi',           payMult: 1.40, benefits: ['health','housing'], stability: 0.90, prestige: 5 },
      { name: 'Mediclinic Dubai',                     payMult: 1.30, benefits: ['health','housing'], stability: 0.90, prestige: 5 }
    ],
    aviation: [
      { name: 'Emirates Airline',                     payMult: 1.55, benefits: ['health','housing','travel'], stability: 0.90, prestige: 5 },
      { name: 'Etihad Airways',                       payMult: 1.40, benefits: ['health','housing','travel'], stability: 0.85, prestige: 5 }
    ],
    hotels: [
      { name: 'Atlantis The Palm',                    payMult: 1.35, benefits: ['health','housing','meals'], stability: 0.85, prestige: 5 },
      { name: 'Burj Al Arab',                         payMult: 1.45, benefits: ['health','housing','meals'], stability: 0.85, prestige: 5 },
      { name: 'Emirates Palace',                      payMult: 1.40, benefits: ['health','housing','meals'], stability: 0.85, prestige: 5 }
    ],
    oil_gas: [
      { name: 'ADNOC',                                payMult: 1.35, benefits: ['health','housing','stock'], stability: 1.00, prestige: 5 },
      { name: 'ENOC',                                 payMult: 1.20, benefits: ['health','housing'], stability: 0.95, prestige: 4 }
    ],
    law: [
      { name: 'Al Tamimi & Co',                       payMult: 1.35, benefits: ['health','housing','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Clyde & Co UAE',                       payMult: 1.30, benefits: ['health','housing','bonus'], stability: 0.90, prestige: 5 }
    ]
  },

  /* ============================================================
     NETHERLANDS
     ============================================================ */
  nld: {
    banking: [
      { name: 'ING Bank',                             payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'Rabobank',                             payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 4 },
      { name: 'ABN AMRO',                             payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 4 }
    ],
    tech: [
      { name: 'ASML',                                 payMult: 1.40, benefits: ['health','stock','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'Booking.com',                          payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.85, prestige: 5 },
      { name: 'Adyen',                                payMult: 1.35, benefits: ['health','stock','bonus'], stability: 0.85, prestige: 5 }
    ],
    universities: [
      { name: 'TU Delft',                             payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'University of Amsterdam',              payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Leiden University',                    payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ]
  },

  /* ============================================================
     FRANCE
     ============================================================ */
  fra: {
    banking: [
      { name: 'BNP Paribas',                          payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Société Générale',                     payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Crédit Agricole',                      payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 4 }
    ],
    tech: [
      { name: 'Dassault Systèmes',                    payMult: 1.20, benefits: ['health','stock','bonus'], stability: 0.90, prestige: 5 },
      { name: 'Mistral AI',                           payMult: 1.40, benefits: ['health','stock','wfh'], stability: 0.70, prestige: 5 },
      { name: 'Dataiku',                              payMult: 1.25, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 4 }
    ],
    universities: [
      { name: 'Sorbonne',                             payMult: 1.00, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'École Polytechnique',                  payMult: 1.15, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Sciences Po',                          payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ]
  },

  /* ============================================================
     JAPAN
     ============================================================ */
  jpn: {
    banking: [
      { name: 'MUFG Bank',                            payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'SMBC',                                 payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'Mizuho Bank',                          payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 4 }
    ],
    tech: [
      { name: 'Sony',                                 payMult: 1.20, benefits: ['health','stock','pension'], stability: 0.90, prestige: 5 },
      { name: 'Toyota',                               payMult: 1.15, benefits: ['health','stock','pension'], stability: 0.95, prestige: 5 },
      { name: 'Rakuten',                              payMult: 1.15, benefits: ['health','stock'], stability: 0.85, prestige: 4 }
    ],
    universities: [
      { name: 'University of Tokyo',                  payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Kyoto University',                     payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ]
  },

  /* ============================================================
     ITALY
     ============================================================ */
  ita: {
    banking: [
      { name: 'Intesa Sanpaolo',                      payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'UniCredit',                            payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Banco BPM',                            payMult: 1.05, benefits: ['health','pension'], stability: 0.90, prestige: 4 }
    ],
    tech: [
      { name: 'Bending Spoons',                       payMult: 1.25, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 4 },
      { name: 'Ferrari',                              payMult: 1.20, benefits: ['health','bonus','stock'], stability: 0.90, prestige: 5 }
    ],
    universities: [
      { name: 'Sapienza University',                  payMult: 1.00, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Bocconi',                              payMult: 1.20, benefits: ['health','pension'], stability: 0.90, prestige: 5 },
      { name: 'Politecnico di Milano',                payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ]
  },

  /* ============================================================
     SINGAPORE
     ============================================================ */
  sgp: {
    banking: [
      { name: 'DBS Bank',                             payMult: 1.20, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'OCBC Bank',                            payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 },
      { name: 'UOB',                                  payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.95, prestige: 5 }
    ],
    tech: [
      { name: 'Grab',                                 payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 },
      { name: 'Sea Group',                            payMult: 1.25, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 },
      { name: 'Google Singapore',                     payMult: 1.50, benefits: ['health','stock','wfh'], stability: 0.85, prestige: 5 }
    ],
    universities: [
      { name: 'NUS',                                  payMult: 1.20, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'NTU',                                  payMult: 1.15, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'SMU',                                  payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ]
  },

  /* ============================================================
     BRAZIL
     ============================================================ */
  bra: {
    banking: [
      { name: 'Itaú Unibanco',                        payMult: 1.15, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Bradesco',                             payMult: 1.10, benefits: ['health','bonus','pension'], stability: 0.90, prestige: 5 },
      { name: 'Nubank',                               payMult: 1.25, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 }
    ],
    tech: [
      { name: 'Mercado Libre',                        payMult: 1.25, benefits: ['health','stock','wfh'], stability: 0.85, prestige: 5 },
      { name: 'Nubank (tech)',                        payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 }
    ],
    universities: [
      { name: 'USP',                                  payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'Unicamp',                              payMult: 1.10, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'FGV',                                  payMult: 1.15, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ]
  },

  /* ============================================================
     INDIA
     ============================================================ */
  ind: {
    banking: [
      { name: 'HDFC Bank',                            payMult: 1.20, benefits: ['health','bonus','stock'], stability: 0.90, prestige: 5 },
      { name: 'ICICI Bank',                           payMult: 1.15, benefits: ['health','bonus','stock'], stability: 0.90, prestige: 5 },
      { name: 'SBI',                                  payMult: 0.90, benefits: ['health','pension'], stability: 1.00, prestige: 4 }
    ],
    tech: [
      { name: 'Infosys',                              payMult: 1.00, benefits: ['health','stock','wfh'], stability: 0.90, prestige: 4 },
      { name: 'TCS',                                  payMult: 0.95, benefits: ['health','stock','wfh'], stability: 0.95, prestige: 4 },
      { name: 'Wipro',                                payMult: 0.95, benefits: ['health','stock','wfh'], stability: 0.90, prestige: 4 },
      { name: 'Flipkart',                             payMult: 1.30, benefits: ['health','stock','wfh'], stability: 0.80, prestige: 5 }
    ],
    universities: [
      { name: 'IIT Bombay',                           payMult: 1.20, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'IIT Delhi',                            payMult: 1.20, benefits: ['health','pension'], stability: 0.95, prestige: 5 },
      { name: 'NIT Trichy',                           payMult: 1.05, benefits: ['health','pension'], stability: 0.95, prestige: 5 }
    ],
    hospitals: [
      { name: 'AIIMS',                                payMult: 0.95, benefits: ['health','pension'], stability: 1.00, prestige: 5 },
      { name: 'Apollo Hospitals',                     payMult: 1.15, benefits: ['health','bonus'], stability: 0.90, prestige: 5 }
    ]
  }
};

/* ============================================================
   2. CAREER TRACKS (40 tracks — 5 to 6 levels each)
   ============================================================ */

const CAR_TRACKS = [
  /* ===== BUSINESS FAMILY ===== */
  {
    id: 'business',
    label: 'Business / Finance',
    requiresDegree: 'business',
    industry: 'banking',
    levels: [
      { level: 0, title: 'Junior Analyst',         baseSalaryEGP: 96000,   requirements: {}, desc: 'Entry level. Learn the ropes.' },
      { level: 1, title: 'Financial Analyst',      baseSalaryEGP: 180000,  requirements: { years: 2 }, desc: 'Analyze reports, support senior staff.' },
      { level: 2, title: 'Senior Analyst',         baseSalaryEGP: 300000,  requirements: { years: 4 }, desc: 'Own major accounts.' },
      { level: 3, title: 'Finance Manager',        baseSalaryEGP: 550000,  requirements: { years: 7 }, desc: 'Manage a team.' },
      { level: 4, title: 'CFO',                    baseSalaryEGP: 1200000, requirements: { years: 12 }, desc: 'Chief Financial Officer.' }
    ]
  },
  {
    id: 'accounting',
    label: 'Accounting / Audit',
    requiresDegree: 'business',
    industry: 'consulting',
    levels: [
      { level: 0, title: 'Junior Accountant',      baseSalaryEGP: 84000,   requirements: {}, desc: 'Handle basic bookkeeping.' },
      { level: 1, title: 'Senior Accountant',      baseSalaryEGP: 156000,  requirements: { years: 2 }, desc: 'Manage full-cycle accounting.' },
      { level: 2, title: 'Audit Manager',          baseSalaryEGP: 288000,  requirements: { years: 5 }, desc: 'Lead audit engagements.' },
      { level: 3, title: 'Controller',             baseSalaryEGP: 540000,  requirements: { years: 9 }, desc: 'Own financial reporting.' },
      { level: 4, title: 'Chief Accounting Officer', baseSalaryEGP: 960000, requirements: { years: 14 }, desc: 'Top financial officer.' }
    ]
  },
  {
    id: 'investment',
    label: 'Investment / PE',
    requiresDegree: 'business',
    industry: 'banking',
    levels: [
      { level: 0, title: 'Investment Analyst',     baseSalaryEGP: 150000,  requirements: {}, desc: 'Analyze opportunities.' },
      { level: 1, title: 'Associate',              baseSalaryEGP: 300000,  requirements: { years: 2 }, desc: 'Lead deals.' },
      { level: 2, title: 'VP',                     baseSalaryEGP: 550000,  requirements: { years: 5 }, desc: 'Vice President.' },
      { level: 3, title: 'Managing Director',      baseSalaryEGP: 1000000, requirements: { years: 9 }, desc: 'MD of a fund.' },
      { level: 4, title: 'Partner',                baseSalaryEGP: 2200000, requirements: { years: 13 }, desc: 'Equity partner.' }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    requiresDegree: 'business',
    industry: 'fmcg',
    levels: [
      { level: 0, title: 'Marketing Coordinator',  baseSalaryEGP: 80000,   requirements: {}, desc: 'Support marketing team.' },
      { level: 1, title: 'Marketing Specialist',   baseSalaryEGP: 150000,  requirements: { years: 2 }, desc: 'Run campaigns.' },
      { level: 2, title: 'Marketing Manager',      baseSalaryEGP: 280000,  requirements: { years: 5 }, desc: 'Lead team and budget.' },
      { level: 3, title: 'Marketing Director',     baseSalaryEGP: 550000,  requirements: { years: 9 }, desc: 'Own P&L.' },
      { level: 4, title: 'CMO',                    baseSalaryEGP: 1000000, requirements: { years: 14 }, desc: 'Chief Marketing Officer.' }
    ]
  },
  {
    id: 'sales',
    label: 'Sales',
    requiresDegree: null,
    industry: 'fmcg',
    levels: [
      { level: 0, title: 'Sales Associate',        baseSalaryEGP: 84000,   requirements: {}, desc: 'Learn products and customers.' },
      { level: 1, title: 'Account Executive',      baseSalaryEGP: 168000,  requirements: { years: 2 }, desc: 'Close deals.' },
      { level: 2, title: 'Sales Manager',          baseSalaryEGP: 320000,  requirements: { years: 4 }, desc: 'Manage a sales team.' },
      { level: 3, title: 'Regional Sales Director', baseSalaryEGP: 600000, requirements: { years: 8 }, desc: 'Own regional P&L.' },
      { level: 4, title: 'VP of Sales',            baseSalaryEGP: 1000000, requirements: { years: 12 }, desc: 'Company sales leader.' }
    ]
  },
  {
    id: 'hr',
    label: 'Human Resources',
    requiresDegree: 'business',
    industry: 'fmcg',
    levels: [
      { level: 0, title: 'HR Assistant',           baseSalaryEGP: 70000,   requirements: {}, desc: 'Support HR operations.' },
      { level: 1, title: 'HR Specialist',          baseSalaryEGP: 130000,  requirements: { years: 2 }, desc: 'Handle recruitment.' },
      { level: 2, title: 'HR Manager',             baseSalaryEGP: 250000,  requirements: { years: 5 }, desc: 'Manage HR team.' },
      { level: 3, title: 'HR Director',            baseSalaryEGP: 500000,  requirements: { years: 9 }, desc: 'Direct HR strategy.' },
      { level: 4, title: 'CHRO',                   baseSalaryEGP: 950000,  requirements: { years: 14 }, desc: 'Chief People Officer.' }
    ]
  },
  {
    id: 'consulting',
    label: 'Management Consulting',
    requiresDegree: 'business',
    industry: 'consulting',
    levels: [
      { level: 0, title: 'Business Analyst',       baseSalaryEGP: 120000,  requirements: {}, desc: 'Support engagements.' },
      { level: 1, title: 'Consultant',             baseSalaryEGP: 240000,  requirements: { years: 2 }, desc: 'Lead workstreams.' },
      { level: 2, title: 'Engagement Manager',     baseSalaryEGP: 420000,  requirements: { years: 4 }, desc: 'Manage client projects.' },
      { level: 3, title: 'Principal',              baseSalaryEGP: 840000,  requirements: { years: 8 }, desc: 'Own client relationships.' },
      { level: 4, title: 'Partner',                baseSalaryEGP: 1800000, requirements: { years: 12 }, desc: 'Equity partner.' }
    ]
  },
  {
    id: 'product',
    label: 'Product Management',
    requiresDegree: 'business',
    industry: 'tech',
    levels: [
      { level: 0, title: 'Associate Product Manager', baseSalaryEGP: 180000, requirements: {}, desc: 'Learn product management.' },
      { level: 1, title: 'Product Manager',           baseSalaryEGP: 300000, requirements: { years: 2 }, desc: 'Own a product area.' },
      { level: 2, title: 'Senior PM',                 baseSalaryEGP: 500000, requirements: { years: 4 }, desc: 'Lead product vision.' },
      { level: 3, title: 'Director of Product',       baseSalaryEGP: 840000, requirements: { years: 7 }, desc: 'Own product strategy.' },
      { level: 4, title: 'VP / CPO',                  baseSalaryEGP: 1200000, requirements: { years: 12 }, desc: 'Chief Product Officer.' }
    ]
  },

  /* ===== MEDICAL FAMILY ===== */
  {
    id: 'medicine',
    label: 'Doctor (GP)',
    requiresDegree: 'medicine',
    requiresImtyaz: true,
    industry: 'hospitals',
    levels: [
      { level: 0, title: 'Imtyaz (Intern Doctor)', baseSalaryEGP: 42000,   requirements: { imtyaz: true }, desc: 'Mandatory 1-year training at government hospital.' },
      { level: 1, title: 'Resident Doctor',        baseSalaryEGP: 120000,  requirements: { years: 2 }, desc: 'Residency training.' },
      { level: 2, title: 'Specialist Doctor',      baseSalaryEGP: 240000,  requirements: { years: 5 }, desc: 'Full specialist.' },
      { level: 3, title: 'Consultant',             baseSalaryEGP: 480000,  requirements: { years: 10 }, desc: 'Senior consultant.' },
      { level: 4, title: 'Department Head',        baseSalaryEGP: 900000,  requirements: { years: 15 }, desc: 'Top of medical hierarchy.' }
    ]
  },
  {
    id: 'surgery',
    label: 'Surgeon',
    requiresDegree: 'medicine',
    industry: 'hospitals',
    levels: [
      { level: 0, title: 'Surgical Resident (Y1)', baseSalaryEGP: 48000,   requirements: {}, desc: 'Surgical residency year 1.' },
      { level: 1, title: 'Surgical Resident (Y3)', baseSalaryEGP: 150000,  requirements: { years: 3 }, desc: 'Advanced surgical training.' },
      { level: 2, title: 'Attending Surgeon',      baseSalaryEGP: 300000,  requirements: { years: 6 }, desc: 'Full attending surgeon.' },
      { level: 3, title: 'Senior Surgeon',         baseSalaryEGP: 600000,  requirements: { years: 11 }, desc: 'Senior consultant surgeon.' },
      { level: 4, title: 'Chief of Surgery',       baseSalaryEGP: 1200000, requirements: { years: 16 }, desc: 'Head of surgery department.' },
      { level: 5, title: 'Professor of Surgery',   baseSalaryEGP: 1800000, requirements: { years: 22 }, desc: 'Top of surgical field.' }
    ]
  },
  {
    id: 'pediatrics',
    label: 'Pediatrician',
    requiresDegree: 'medicine',
    industry: 'hospitals',
    levels: [
      { level: 0, title: 'Pediatric Resident',     baseSalaryEGP: 48000,   requirements: {}, desc: 'Residency year 1.' },
      { level: 1, title: 'Junior Pediatrician',    baseSalaryEGP: 120000,  requirements: { years: 3 }, desc: 'Post-residency.' },
      { level: 2, title: 'Pediatric Specialist',   baseSalaryEGP: 240000,  requirements: { years: 6 }, desc: 'Full specialist.' },
      { level: 3, title: 'Consultant Pediatrician', baseSalaryEGP: 450000, requirements: { years: 11 }, desc: 'Senior consultant.' },
      { level: 4, title: 'Head of Pediatrics',     baseSalaryEGP: 900000,  requirements: { years: 16 }, desc: 'Department head.' }
    ]
  },
  {
    id: 'cardiology',
    label: 'Cardiologist',
    requiresDegree: 'medicine',
    industry: 'hospitals',
    levels: [
      { level: 0, title: 'Cardiology Resident',    baseSalaryEGP: 48000,   requirements: {}, desc: 'Residency year 1.' },
      { level: 1, title: 'Junior Cardiologist',    baseSalaryEGP: 180000,  requirements: { years: 3 }, desc: 'Post-residency.' },
      { level: 2, title: 'Cardiology Specialist',  baseSalaryEGP: 360000,  requirements: { years: 6 }, desc: 'Full specialist.' },
      { level: 3, title: 'Consultant Cardiologist', baseSalaryEGP: 720000, requirements: { years: 11 }, desc: 'Senior consultant.' },
      { level: 4, title: 'Chief of Cardiology',    baseSalaryEGP: 1400000, requirements: { years: 16 }, desc: 'Department head.' }
    ]
  },
  {
    id: 'nursing',
    label: 'Nursing',
    requiresDegree: 'nursing',
    industry: 'hospitals',
    levels: [
      { level: 0, title: 'Staff Nurse',            baseSalaryEGP: 60000,   requirements: {}, desc: 'Direct patient care.' },
      { level: 1, title: 'Senior Nurse',           baseSalaryEGP: 96000,   requirements: { years: 2 }, desc: 'Lead a unit.' },
      { level: 2, title: 'Nurse Manager',          baseSalaryEGP: 150000,  requirements: { years: 5 }, desc: 'Manage nursing team.' },
      { level: 3, title: 'Director of Nursing',    baseSalaryEGP: 240000,  requirements: { years: 9 }, desc: 'Hospital nursing head.' }
    ]
  },
  {
    id: 'pharmacy',
    label: 'Pharmacist',
    requiresDegree: 'pharmacy',
    industry: 'pharma',
    levels: [
      { level: 0, title: 'Staff Pharmacist',       baseSalaryEGP: 72000,   requirements: {}, desc: 'Dispense and advise.' },
      { level: 1, title: 'Clinical Pharmacist',    baseSalaryEGP: 120000,  requirements: { years: 2 }, desc: 'Hospital or clinical role.' },
      { level: 2, title: 'Pharmacy Manager',       baseSalaryEGP: 180000,  requirements: { years: 5 }, desc: 'Manage pharmacy.' },
      { level: 3, title: 'Regional Pharmacy Director', baseSalaryEGP: 240000, requirements: { years: 9 }, desc: 'Regional operations.' }
    ]
  },
  {
    id: 'dentistry',
    label: 'Dentist',
    requiresDegree: 'dentistry',
    industry: 'dental',
    levels: [
      { level: 0, title: 'Associate Dentist',      baseSalaryEGP: 96000,   requirements: {}, desc: 'Work at established clinic.' },
      { level: 1, title: 'Senior Dentist',         baseSalaryEGP: 180000,  requirements: { years: 3 }, desc: 'Lead complex cases.' },
      { level: 2, title: 'Clinic Director',        baseSalaryEGP: 320000,  requirements: { years: 6 }, desc: 'Run a clinic.' },
      { level: 3, title: 'Multi-Clinic Owner',     baseSalaryEGP: 480000,  requirements: { years: 10 }, desc: 'Own multiple clinics.' },
      { level: 4, title: 'Dental Group CEO',       baseSalaryEGP: 800000,  requirements: { years: 15 }, desc: 'Head of group.' }
    ]
  },
  {
    id: 'psychology',
    label: 'Clinical Psychologist',
    requiresDegree: 'psychology',
    industry: 'hospitals',
    levels: [
      { level: 0, title: 'Junior Psychologist',    baseSalaryEGP: 72000,   requirements: {}, desc: 'Clinical practice.' },
      { level: 1, title: 'Clinical Psychologist',  baseSalaryEGP: 120000,  requirements: { years: 2 }, desc: 'Own case load.' },
      { level: 2, title: 'Senior Psychologist',    baseSalaryEGP: 200000,  requirements: { years: 5 }, desc: 'Lead therapy team.' },
      { level: 3, title: 'Director of Psychology', baseSalaryEGP: 300000,  requirements: { years: 9 }, desc: 'Department director.' },
      { level: 4, title: 'Head Psychiatrist',      baseSalaryEGP: 500000,  requirements: { years: 14 }, desc: 'Chief mental health.' }
    ]
  },
  {
    id: 'veterinary',
    label: 'Veterinarian',
    requiresDegree: 'veterinary',
    industry: 'veterinary',
    levels: [
      { level: 0, title: 'Associate Vet',          baseSalaryEGP: 60000,   requirements: {}, desc: 'Work under senior vet.' },
      { level: 1, title: 'Veterinarian',           baseSalaryEGP: 108000,  requirements: { years: 2 }, desc: 'Independent practice.' },
      { level: 2, title: 'Senior Vet',             baseSalaryEGP: 180000,  requirements: { years: 5 }, desc: 'Complex cases.' },
      { level: 3, title: 'Clinic Owner',           baseSalaryEGP: 300000,  requirements: { years: 8 }, desc: 'Own a clinic.' }
    ]
  },
  {
    id: 'physiotherapy',
    label: 'Physiotherapist',
    requiresDegree: 'physiotherapy',
    industry: 'hospitals',
    levels: [
      { level: 0, title: 'Junior Physiotherapist', baseSalaryEGP: 60000,   requirements: {}, desc: 'Basic rehab.' },
      { level: 1, title: 'Physiotherapist',        baseSalaryEGP: 108000,  requirements: { years: 2 }, desc: 'Full practice.' },
      { level: 2, title: 'Senior Physiotherapist', baseSalaryEGP: 180000,  requirements: { years: 5 }, desc: 'Complex rehab.' },
      { level: 3, title: 'Rehab Director',         baseSalaryEGP: 300000,  requirements: { years: 9 }, desc: 'Department head.' }
    ]
  },

  /* ===== LAW FAMILY ===== */
  {
    id: 'law',
    label: 'Lawyer',
    requiresDegree: 'law',
    industry: 'law',
    levels: [
      { level: 0, title: 'Junior Legal Associate', baseSalaryEGP: 96000,   requirements: {}, desc: 'Support partners.' },
      { level: 1, title: 'Legal Associate',        baseSalaryEGP: 180000,  requirements: { years: 2 }, desc: 'Handle cases.' },
      { level: 2, title: 'Senior Associate',       baseSalaryEGP: 360000,  requirements: { years: 5 }, desc: 'Lead deals.' },
      { level: 3, title: 'Partner',                baseSalaryEGP: 720000,  requirements: { years: 9 }, desc: 'Equity partner.' },
      { level: 4, title: 'Managing Partner',       baseSalaryEGP: 1400000, requirements: { years: 15 }, desc: 'Head of firm.' }
    ]
  },
  {
    id: 'prosecutor',
    label: 'Public Prosecutor / Judge',
    requiresDegree: 'law',
    industry: 'government',
    levels: [
      { level: 0, title: 'Junior Prosecutor',      baseSalaryEGP: 72000,   requirements: {}, desc: 'Prosecution assistant.' },
      { level: 1, title: 'Prosecutor',             baseSalaryEGP: 144000,  requirements: { years: 3 }, desc: 'Own cases.' },
      { level: 2, title: 'Senior Prosecutor',      baseSalaryEGP: 300000,  requirements: { years: 8 }, desc: 'Complex criminal cases.' },
      { level: 3, title: 'Judge',                  baseSalaryEGP: 500000,  requirements: { years: 14 }, desc: 'Preside over court.' },
      { level: 4, title: 'Chief Justice',          baseSalaryEGP: 800000,  requirements: { years: 22 }, desc: 'Top judicial rank.' }
    ]
  },

  /* ===== ENGINEERING FAMILY ===== */
  {
    id: 'engineering',
    label: 'Engineer',
    requiresDegree: 'engineering',
    industry: 'engineering',
    levels: [
      { level: 0, title: 'Junior Engineer',        baseSalaryEGP: 120000,  requirements: {}, desc: 'Support senior engineers.' },
      { level: 1, title: 'Engineer',               baseSalaryEGP: 216000,  requirements: { years: 2 }, desc: 'Own projects.' },
      { level: 2, title: 'Senior Engineer',        baseSalaryEGP: 420000,  requirements: { years: 5 }, desc: 'Lead technical work.' },
      { level: 3, title: 'Engineering Manager',    baseSalaryEGP: 660000,  requirements: { years: 8 }, desc: 'Manage a team.' },
      { level: 4, title: 'Engineering Director',   baseSalaryEGP: 1100000, requirements: { years: 14 }, desc: 'Department head.' }
    ]
  },
  {
    id: 'architect',
    label: 'Architect',
    requiresDegree: 'architecture',
    industry: 'architecture',
    levels: [
      { level: 0, title: 'Junior Architect',       baseSalaryEGP: 96000,   requirements: {}, desc: 'Draft and support.' },
      { level: 1, title: 'Architect',              baseSalaryEGP: 180000,  requirements: { years: 2 }, desc: 'Own projects.' },
      { level: 2, title: 'Senior Architect',       baseSalaryEGP: 300000,  requirements: { years: 5 }, desc: 'Lead design work.' },
      { level: 3, title: 'Principal Architect',    baseSalaryEGP: 500000,  requirements: { years: 9 }, desc: 'Own design direction.' },
      { level: 4, title: 'Partner / Director',     baseSalaryEGP: 800000,  requirements: { years: 14 }, desc: 'Firm partner.' }
    ]
  },
  {
    id: 'civil_eng',
    label: 'Civil Engineer',
    requiresDegree: 'engineering',
    industry: 'engineering',
    levels: [
      { level: 0, title: 'Junior Civil Engineer',  baseSalaryEGP: 120000,  requirements: {}, desc: 'Site supervision.' },
      { level: 1, title: 'Civil Engineer',         baseSalaryEGP: 216000,  requirements: { years: 2 }, desc: 'Own projects.' },
      { level: 2, title: 'Senior Civil Engineer',  baseSalaryEGP: 420000,  requirements: { years: 5 }, desc: 'Lead complex builds.' },
      { level: 3, title: 'Project Manager',        baseSalaryEGP: 660000,  requirements: { years: 8 }, desc: 'Manage construction.' },
      { level: 4, title: 'Construction Director',  baseSalaryEGP: 1100000, requirements: { years: 14 }, desc: 'Company director.' }
    ]
  },

  /* ===== TECH FAMILY ===== */
  {
    id: 'tech',
    label: 'Software / Tech',
    requiresDegree: 'cs',
    industry: 'tech',
    levels: [
      { level: 0, title: 'Junior Developer',       baseSalaryEGP: 180000,  requirements: {}, desc: 'Learn the codebase.' },
      { level: 1, title: 'Software Engineer',      baseSalaryEGP: 300000,  requirements: { years: 2 }, desc: 'Own features.' },
      { level: 2, title: 'Senior Engineer',        baseSalaryEGP: 540000,  requirements: { years: 5 }, desc: 'Architect systems.' },
      { level: 3, title: 'Tech Lead / EM',         baseSalaryEGP: 840000,  requirements: { years: 8 }, desc: 'Lead a team.' },
      { level: 4, title: 'VP Eng / CTO',           baseSalaryEGP: 1320000, requirements: { years: 12 }, desc: 'Executive level.' }
    ]
  },
  {
    id: 'data_science',
    label: 'Data Science / ML',
    requiresDegree: 'cs',
    industry: 'tech',
    levels: [
      { level: 0, title: 'Junior Data Scientist',  baseSalaryEGP: 240000,  requirements: {}, desc: 'Build models.' },
      { level: 1, title: 'Data Scientist',         baseSalaryEGP: 420000,  requirements: { years: 2 }, desc: 'Own models end-to-end.' },
      { level: 2, title: 'Senior DS',              baseSalaryEGP: 720000,  requirements: { years: 5 }, desc: 'Architect ML pipelines.' },
      { level: 3, title: 'Principal DS',           baseSalaryEGP: 1000000, requirements: { years: 8 }, desc: 'Company-wide ML strategy.' },
      { level: 4, title: 'Head of AI',             baseSalaryEGP: 1600000, requirements: { years: 12 }, desc: 'AI executive.' }
    ]
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    requiresDegree: 'cs',
    industry: 'tech',
    levels: [
      { level: 0, title: 'SOC Analyst',            baseSalaryEGP: 240000,  requirements: {}, desc: 'Monitor security events.' },
      { level: 1, title: 'Security Engineer',      baseSalaryEGP: 420000,  requirements: { years: 2 }, desc: 'Build defenses.' },
      { level: 2, title: 'Senior Security Engineer', baseSalaryEGP: 720000, requirements: { years: 5 }, desc: 'Lead security programs.' },
      { level: 3, title: 'Security Architect',     baseSalaryEGP: 1000000, requirements: { years: 8 }, desc: 'Design enterprise security.' },
      { level: 4, title: 'CISO',                   baseSalaryEGP: 1600000, requirements: { years: 12 }, desc: 'Chief Information Security Officer.' }
    ]
  },
  {
    id: 'product_design',
    label: 'Product Design (UX)',
    requiresDegree: null,
    industry: 'tech',
    levels: [
      { level: 0, title: 'Junior UX Designer',     baseSalaryEGP: 180000,  requirements: {}, desc: 'Support design team.' },
      { level: 1, title: 'Product Designer',       baseSalaryEGP: 300000,  requirements: { years: 2 }, desc: 'Own design of a product area.' },
      { level: 2, title: 'Senior Designer',        baseSalaryEGP: 480000,  requirements: { years: 5 }, desc: 'Lead design systems.' },
      { level: 3, title: 'Design Director',        baseSalaryEGP: 720000,  requirements: { years: 8 }, desc: 'Own design vision.' },
      { level: 4, title: 'VP Design / CDO',        baseSalaryEGP: 1000000, requirements: { years: 12 }, desc: 'Chief Design Officer.' }
    ]
  },
  {
    id: 'qa_engineering',
    label: 'QA / Testing',
    requiresDegree: 'cs',
    industry: 'tech',
    levels: [
      { level: 0, title: 'QA Engineer',            baseSalaryEGP: 120000,  requirements: {}, desc: 'Manual and automated testing.' },
      { level: 1, title: 'Senior QA',              baseSalaryEGP: 216000,  requirements: { years: 2 }, desc: 'Own QA for a product.' },
      { level: 2, title: 'SDET',                   baseSalaryEGP: 360000,  requirements: { years: 5 }, desc: 'Build test infrastructure.' },
      { level: 3, title: 'QA Manager',             baseSalaryEGP: 600000,  requirements: { years: 8 }, desc: 'Manage QA team.' },
      { level: 4, title: 'Director of QA',         baseSalaryEGP: 960000,  requirements: { years: 12 }, desc: 'Enterprise QA leader.' }
    ]
  },

  /* ===== EDUCATION ===== */
  {
    id: 'teaching',
    label: 'School Teacher',
    requiresDegree: null,
    industry: 'schools',
    levels: [
      { level: 0, title: 'Junior Teacher',         baseSalaryEGP: 60000,   requirements: {}, desc: 'Support lead teacher.' },
      { level: 1, title: 'Teacher',                baseSalaryEGP: 96000,   requirements: { years: 2 }, desc: 'Own class.' },
      { level: 2, title: 'Senior Teacher',         baseSalaryEGP: 144000,  requirements: { years: 5 }, desc: 'Lead subject.' },
      { level: 3, title: 'Head of Department',     baseSalaryEGP: 240000,  requirements: { years: 8 }, desc: 'Academic leadership.' }
    ]
  },
  {
    id: 'academia',
    label: 'University / Academia',
    requiresDegree: null,
    requiresGPA: 3.5,
    industry: 'universities',
    academiaOnly: true,
    levels: [
      { level: 0, title: 'Teaching Assistant',     baseSalaryEGP: 72000,   requirements: {}, desc: 'Assist professors.' },
      { level: 1, title: 'Assistant Lecturer',     baseSalaryEGP: 156000,  requirements: { years: 2 }, desc: 'Teach small classes.' },
      { level: 2, title: 'Lecturer',               baseSalaryEGP: 300000,  requirements: { years: 5 }, desc: 'Full lecturer.' },
      { level: 3, title: 'Associate Professor',    baseSalaryEGP: 540000,  requirements: { years: 10 }, desc: 'Senior academic.' },
      { level: 4, title: 'Professor',              baseSalaryEGP: 960000,  requirements: { years: 15 }, desc: 'Full professor.' }
    ]
  },

  /* ===== OTHER ===== */
    {
    id: 'bpo',
    label: 'Call Center / BPO',
    requiresDegree: null,
    industry: 'bpo',
    languageTiers: {
      en:    { label: 'English',  payMult: 1.00, requirement: 'english_ok' },
      fr:    { label: 'French',   payMult: 2.00, requirement: 'french_b2' },
      de:    { label: 'German',   payMult: 2.50, requirement: 'german_b2' },
      nl:    { label: 'Dutch',    payMult: 2.20, requirement: 'dutch_b2' }
    },
    levels: [
      { level: 0, title: 'Customer Service Agent', baseSalaryEGP: 72000,  requirements: {}, desc: 'Take calls.' },
      { level: 1, title: 'Senior Agent',           baseSalaryEGP: 108000, requirements: { years: 2 },  desc: 'Complex tickets.' },
      { level: 2, title: 'Team Leader',            baseSalaryEGP: 168000, requirements: { years: 4 },  desc: 'Lead agents.' },
      { level: 3, title: 'Operations Manager',     baseSalaryEGP: 288000, requirements: { years: 6 },  desc: 'Manage site.' },
      { level: 4, title: 'Site Director',          baseSalaryEGP: 480000, requirements: { years: 10 }, desc: 'Run operation.' }
    ]
  },
  {
    id: 'hospitality',
    label: 'Hospitality / Hotel',
    requiresDegree: null,
    industry: 'hotels',
    levels: [
      { level: 0, title: 'Front Desk Agent',       baseSalaryEGP: 72000,   requirements: {}, desc: 'Welcome guests.' },
      { level: 1, title: 'Supervisor',             baseSalaryEGP: 144000,  requirements: { years: 2 }, desc: 'Lead shift.' },
      { level: 2, title: 'Assistant Manager',      baseSalaryEGP: 240000,  requirements: { years: 5 }, desc: 'Support GM.' },
      { level: 3, title: 'Hotel Manager',          baseSalaryEGP: 400000,  requirements: { years: 8 }, desc: 'Run operations.' },
      { level: 4, title: 'General Manager',        baseSalaryEGP: 720000,  requirements: { years: 12 }, desc: 'Full GM role.' }
    ]
  },
  {
    id: 'aviation',
    label: 'Pilot / Aviation',
    requiresDegree: null,
    industry: 'aviation',
    levels: [
      { level: 0, title: 'Cadet Pilot',            baseSalaryEGP: 480000,  requirements: {}, desc: 'Trained cadet program.' },
      { level: 1, title: 'First Officer',          baseSalaryEGP: 720000,  requirements: { years: 2 }, desc: 'Co-pilot.' },
      { level: 2, title: 'Senior First Officer',   baseSalaryEGP: 960000,  requirements: { years: 5 }, desc: 'Experienced FO.' },
      { level: 3, title: 'Captain',                baseSalaryEGP: 1440000, requirements: { years: 9 }, desc: 'Aircraft commander.' },
      { level: 4, title: 'Senior Captain / Chief Pilot', baseSalaryEGP: 2400000, requirements: { years: 15 }, desc: 'Fleet or chief pilot.' }
    ]
  },
  {
    id: 'media',
    label: 'Media / Journalism',
    requiresDegree: null,
    industry: 'media',
    levels: [
      { level: 0, title: 'Junior Reporter',        baseSalaryEGP: 60000,   requirements: {}, desc: 'Cover small stories.' },
      { level: 1, title: 'Reporter',               baseSalaryEGP: 108000,  requirements: { years: 2 }, desc: 'Own beat.' },
      { level: 2, title: 'Senior Reporter',        baseSalaryEGP: 180000,  requirements: { years: 5 }, desc: 'Major stories.' },
      { level: 3, title: 'Editor',                 baseSalaryEGP: 300000,  requirements: { years: 8 }, desc: 'Edit section.' },
      { level: 4, title: 'Editor-in-Chief',        baseSalaryEGP: 500000,  requirements: { years: 13 }, desc: 'Top editor.' }
    ]
  },
  {
    id: 'government',
    label: 'Government / Civil Service',
    requiresDegree: null,
    industry: 'government',
    levels: [
      { level: 0, title: 'Junior Civil Servant',   baseSalaryEGP: 60000,   requirements: {}, desc: 'Entry-level admin.' },
      { level: 1, title: 'Civil Servant',          baseSalaryEGP: 108000,  requirements: { years: 3 }, desc: 'Mid-level admin.' },
      { level: 2, title: 'Senior Officer',         baseSalaryEGP: 180000,  requirements: { years: 7 }, desc: 'Senior civil servant.' },
      { level: 3, title: 'Director',               baseSalaryEGP: 300000,  requirements: { years: 12 }, desc: 'Department director.' }
    ]
  },
  {
    id: 'trades',
    label: 'Skilled Trades',
    requiresDegree: null,
    industry: 'trades',
    levels: [
      { level: 0, title: 'Apprentice',             baseSalaryEGP: 60000,   requirements: {}, desc: 'Learn the trade.' },
      { level: 1, title: 'Journeyman',             baseSalaryEGP: 96000,   requirements: { years: 2 }, desc: 'Fully qualified.' },
      { level: 2, title: 'Master',                 baseSalaryEGP: 144000,  requirements: { years: 5 }, desc: 'Master craftsman.' },
      { level: 3, title: 'Contractor (self-employed)', baseSalaryEGP: 240000, requirements: { years: 8 }, desc: 'Own clients.' }
    ]
  },
  {
    id: 'entry',
    label: 'Entry-level / No Degree',
    requiresDegree: null,
    industry: 'retail',
    levels: [
      { level: 0, title: 'Cashier / Retail Worker', baseSalaryEGP: 48000,  requirements: {}, desc: 'Retail or cafe work.' },
      { level: 1, title: 'Retail Supervisor',      baseSalaryEGP: 72000,   requirements: { years: 2 }, desc: 'Lead a shift.' },
      { level: 2, title: 'Store Manager',          baseSalaryEGP: 120000,  requirements: { years: 4 }, desc: 'Run the store.' },
      { level: 3, title: 'Regional Manager',       baseSalaryEGP: 240000,  requirements: { years: 7 }, desc: 'Multiple stores.' },
      { level: 4, title: 'Operations Director',    baseSalaryEGP: 480000,  requirements: { years: 12 }, desc: 'Company operations.' }
    ]
  }
];

/* ============================================================
   3. PART-TIME JOBS (18)
   ============================================================ */

const CAR_PARTTIME = [
  { id: 'barista',         label: 'Barista / Café worker',      monthlyEGP: 5000,  hoursPerWeek: 20, requiresCar: false, affectsGrades: true,  minAge: 15 },
  { id: 'waiter',          label: 'Restaurant waiter',           monthlyEGP: 4500,  hoursPerWeek: 25, requiresCar: false, affectsGrades: true,  minAge: 16, tips: true },
  { id: 'retail',          label: 'Retail assistant',            monthlyEGP: 4500,  hoursPerWeek: 20, requiresCar: false, affectsGrades: true,  minAge: 16 },
  { id: 'security',        label: 'Security guard',              monthlyEGP: 4500,  hoursPerWeek: 24, requiresCar: false, affectsGrades: true,  minAge: 18 },
  { id: 'delivery',        label: 'Delivery rider (Talabat)',    monthlyEGP: 7000,  hoursPerWeek: 30, requiresCar: false, requiresBike: true, affectsGrades: true, minAge: 18 },
  { id: 'uber',            label: 'Uber / Careem driver',        monthlyEGP: 10000, hoursPerWeek: 30, requiresCar: true,  affectsGrades: true,  minAge: 18 },
  { id: 'tutor',           label: 'Private tutor',               monthlyEGP: 8000,  hoursPerWeek: 15, requiresCar: false, affectsGrades: false, minAge: 18, requiresSmart: 65 },
  { id: 'translator',      label: 'Freelance translator',        monthlyEGP: 6000,  hoursPerWeek: 15, requiresCar: false, affectsGrades: false, minAge: 18, requiresEnglish: 7.0 },
  { id: 'freelance_dev',   label: 'Freelance developer',         monthlyEGP: 12000, hoursPerWeek: 20, requiresCar: false, affectsGrades: true,  minAge: 18, requiresDegree: 'cs' },
  { id: 'content',         label: 'Content creator',             monthlyEGP: 4000,  hoursPerWeek: 15, requiresCar: false, affectsGrades: false, minAge: 16 },
  { id: 'warehouse',       label: 'Warehouse worker',            monthlyEGP: 5000,  hoursPerWeek: 30, requiresCar: false, affectsGrades: true,  minAge: 18 },
  { id: 'kitchen_helper',  label: 'Kitchen helper',              monthlyEGP: 4200,  hoursPerWeek: 25, requiresCar: false, affectsGrades: true,  minAge: 16 },
  { id: 'call_center_pt',  label: 'Call center agent (part-time)', monthlyEGP: 5500, hoursPerWeek: 20, requiresCar: false, affectsGrades: true,  minAge: 18 },
  { id: 'receptionist_pt', label: 'Receptionist (part-time)',    monthlyEGP: 5000,  hoursPerWeek: 25, requiresCar: false, affectsGrades: false, minAge: 18 },
  { id: 'data_entry',      label: 'Data entry',                  monthlyEGP: 4000,  hoursPerWeek: 15, requiresCar: false, affectsGrades: false, minAge: 16 },
  { id: 'photographer_pt', label: 'Event photographer',          monthlyEGP: 6000,  hoursPerWeek: 10, requiresCar: false, affectsGrades: false, minAge: 18, requiresSmart: 55 },
  { id: 'graphic_pt',      label: 'Freelance graphic designer',  monthlyEGP: 7000,  hoursPerWeek: 15, requiresCar: false, affectsGrades: false, minAge: 18, requiresSmart: 60 },
  { id: 'dog_walker',      label: 'Dog walker',                  monthlyEGP: 4000,  hoursPerWeek: 12, requiresCar: false, affectsGrades: false, minAge: 16 }
];

/* ============================================================
   4. INTERNSHIPS (12)
   ============================================================ */

const CAR_INTERNSHIPS = [
  { id: 'bank_intern',      label: 'Banking intern',          company: 'CIB',              paid: true,  monthlyEGP: 6000,  months: 3, careerBoost: 0.15, performance: true },
  { id: 'tech_intern',      label: 'Tech intern',             company: 'Microsoft Egypt',  paid: true,  monthlyEGP: 10000, months: 3, careerBoost: 0.20, performance: true },
  { id: 'consult_intern',   label: 'Consulting intern',       company: 'PwC Egypt',        paid: true,  monthlyEGP: 8000,  months: 3, careerBoost: 0.18, performance: true },
  { id: 'unpaid_office',    label: 'Unpaid office intern',    company: 'Startup',          paid: false, monthlyEGP: 0,     months: 3, careerBoost: 0.10, performance: true },
  { id: 'pharma_intern',    label: 'Pharma intern',           company: 'Eva Pharma',       paid: true,  monthlyEGP: 5000,  months: 3, careerBoost: 0.12, performance: true },
  { id: 'hospital_vol',     label: 'Hospital volunteer',      company: 'Kasr El Aini',     paid: false, monthlyEGP: 0,     months: 2, careerBoost: 0.15, performance: true, requiresDegree: 'medicine' },
  { id: 'govt_intern',      label: 'Government intern',       company: 'Ministry of Finance', paid: false, monthlyEGP: 0,  months: 3, careerBoost: 0.10, performance: true },
  { id: 'nursing_intern',   label: 'Nursing shadowing',       company: 'Dar Al Fouad',     paid: true,  monthlyEGP: 5000,  months: 3, careerBoost: 0.15, performance: true, requiresDegree: 'nursing' },
  { id: 'research_intern',  label: 'Research assistant',      company: 'University Lab',   paid: true,  monthlyEGP: 4000,  months: 4, careerBoost: 0.18, performance: true },
  { id: 'startup_intern',   label: 'Startup generalist',      company: 'Fawry / startup',  paid: true,  monthlyEGP: 6000,  months: 3, careerBoost: 0.15, performance: true },
  { id: 'media_intern',     label: 'Media intern',            company: 'MBC Masr',         paid: true,  monthlyEGP: 5000,  months: 3, careerBoost: 0.15, performance: true },
  { id: 'summer_analyst',   label: 'Summer analyst (IB)',     company: 'EFG Hermes',       paid: true,  monthlyEGP: 15000, months: 2, careerBoost: 0.30, performance: true, requiresDegree: 'business' }
];

/* ============================================================
   5. BUSINESS TYPES (18)
   ============================================================ */

const CAR_BUSINESS_TYPES = [
  { id: 'cafe',             label: 'Café',                 startupEGP: 800000,  monthlyOverheadEGP: 80000,  baseRevenueEGP: 200000, maxLevel: 5, staffRoles: ['barista','waiter','manager','cleaner'], desc: 'Coffee shop in a good location.' },
  { id: 'restaurant',       label: 'Restaurant',           startupEGP: 2000000, monthlyOverheadEGP: 200000, baseRevenueEGP: 500000, maxLevel: 5, staffRoles: ['chef','waiter','manager','cleaner','cashier'], desc: 'Full-service restaurant.' },
  { id: 'retail_shop',      label: 'Retail shop',          startupEGP: 500000,  monthlyOverheadEGP: 50000,  baseRevenueEGP: 120000, maxLevel: 5, staffRoles: ['cashier','manager','cleaner'], desc: 'Small retail store.' },
  { id: 'ecommerce',        label: 'E-commerce store',     startupEGP: 100000,  monthlyOverheadEGP: 20000,  baseRevenueEGP: 80000,  maxLevel: 5, staffRoles: ['manager','packager'], desc: 'Online store. Low overhead.' },
  { id: 'tutoring_center',  label: 'Tutoring center',      startupEGP: 300000,  monthlyOverheadEGP: 40000,  baseRevenueEGP: 100000, maxLevel: 5, staffRoles: ['teacher','manager'], desc: 'After-school tutoring.' },
  { id: 'salon',            label: 'Salon / barbershop',   startupEGP: 600000,  monthlyOverheadEGP: 70000,  baseRevenueEGP: 180000, maxLevel: 5, staffRoles: ['stylist','manager','cleaner'], desc: 'Beauty salon or barber.' },
  { id: 'gym',              label: 'Gym / fitness studio', startupEGP: 2500000, monthlyOverheadEGP: 150000, baseRevenueEGP: 400000, maxLevel: 5, staffRoles: ['trainer','manager','cleaner'], desc: 'Full gym.' },
  { id: 'pharmacy',         label: 'Pharmacy',             startupEGP: 1500000, monthlyOverheadEGP: 100000, baseRevenueEGP: 250000, maxLevel: 5, staffRoles: ['pharmacist','cashier','manager'], requiresDegree: 'medicine', desc: 'Licensed pharmacy.' },
  { id: 'logistics',        label: 'Logistics company',    startupEGP: 3000000, monthlyOverheadEGP: 200000, baseRevenueEGP: 600000, maxLevel: 5, staffRoles: ['driver','manager','dispatcher'], desc: 'Delivery / transport business.' },
  { id: 'software_startup', label: 'Software startup',     startupEGP: 500000,  monthlyOverheadEGP: 100000, baseRevenueEGP: 150000, maxLevel: 8, staffRoles: ['developer','designer','manager'], requiresDegree: 'cs', desc: 'Tech startup. High risk, high reward.' },
  { id: 'realestate',       label: 'Real estate agency',   startupEGP: 200000,  monthlyOverheadEGP: 40000,  baseRevenueEGP: 100000, maxLevel: 5, staffRoles: ['agent','manager'], desc: 'Buy/sell property on commission.' },
  { id: 'consulting',       label: 'Consulting firm',      startupEGP: 200000,  monthlyOverheadEGP: 30000,  baseRevenueEGP: 120000, maxLevel: 5, staffRoles: ['consultant','manager'], requiresDegree: 'business', desc: 'Business consulting services.' },
  { id: 'bakery',           label: 'Bakery',               startupEGP: 700000,  monthlyOverheadEGP: 60000,  baseRevenueEGP: 160000, maxLevel: 5, staffRoles: ['baker','cashier','manager','cleaner'], desc: 'Fresh bakery.' },
  { id: 'bookstore',        label: 'Bookstore',            startupEGP: 400000,  monthlyOverheadEGP: 35000,  baseRevenueEGP: 90000,  maxLevel: 5, staffRoles: ['cashier','manager'], desc: 'Bookstore with café corner.' },
  { id: 'car_wash',         label: 'Car wash / detailing', startupEGP: 350000,  monthlyOverheadEGP: 30000,  baseRevenueEGP: 100000, maxLevel: 5, staffRoles: ['cleaner','manager'], desc: 'Car wash and detailing.' },
  { id: 'pet_grooming',     label: 'Pet grooming',         startupEGP: 500000,  monthlyOverheadEGP: 45000,  baseRevenueEGP: 120000, maxLevel: 5, staffRoles: ['stylist','manager','cleaner'], desc: 'Pet grooming and boarding.' },
  { id: 'academy',          label: 'Educational academy',  startupEGP: 1200000, monthlyOverheadEGP: 120000, baseRevenueEGP: 280000, maxLevel: 5, staffRoles: ['teacher','manager','cleaner'], desc: 'Large tutoring academy with staff.' },
  { id: 'gym_franchise',    label: 'Gym franchise',        startupEGP: 5000000, monthlyOverheadEGP: 350000, baseRevenueEGP: 900000, maxLevel: 6, staffRoles: ['trainer','manager','cleaner','receptionist'], desc: 'Franchised gym chain.' }
];

/* ============================================================
   6. STAFF SALARIES (26 roles)
   ============================================================ */

const CAR_STAFF_SALARIES = {
  barista:        { monthlyEGP: 5000,  skill: 1 },
  waiter:         { monthlyEGP: 4500,  skill: 1 },
  chef:           { monthlyEGP: 12000, skill: 2 },
  manager:        { monthlyEGP: 15000, skill: 3 },
  cleaner:        { monthlyEGP: 4000,  skill: 1 },
  cashier:        { monthlyEGP: 5000,  skill: 1 },
  packager:       { monthlyEGP: 4000,  skill: 1 },
  teacher:        { monthlyEGP: 7000,  skill: 2 },
  stylist:        { monthlyEGP: 7000,  skill: 2 },
  trainer:        { monthlyEGP: 10000, skill: 2 },
  pharmacist:     { monthlyEGP: 12000, skill: 3 },
  driver:         { monthlyEGP: 8000,  skill: 1 },
  dispatcher:     { monthlyEGP: 8000,  skill: 2 },
  developer:      { monthlyEGP: 18000, skill: 3 },
  designer:       { monthlyEGP: 14000, skill: 2 },
  agent:          { monthlyEGP: 7000,  skill: 2 },
  consultant:     { monthlyEGP: 15000, skill: 3 },
  receptionist:   { monthlyEGP: 5000,  skill: 1 },
  accountant:     { monthlyEGP: 12000, skill: 3 },
  hr_specialist:  { monthlyEGP: 10000, skill: 2 },
  marketing_mgr:  { monthlyEGP: 15000, skill: 3 },
  security_guard: { monthlyEGP: 5500,  skill: 1 },
  janitor:        { monthlyEGP: 3500,  skill: 1 },
  baker:          { monthlyEGP: 7000,  skill: 2 },
  sales_associate: { monthlyEGP: 6000, skill: 1 },
  ops_manager:    { monthlyEGP: 18000, skill: 3 }
};

/* ============================================================
   7. INTERVIEW ROUNDS (unchanged from v1)
   ============================================================ */

const CAR_INTERVIEW_ROUNDS = [
  {
    id: 'screening',
    label: 'Round 1: HR Screening',
    weight: 'smarts',
    threshold: 0.55,
    passMessages: [
      'The HR representative liked your energy. Moving to the next round.',
      'Basic qualifications check out. Phone interview scheduled.',
      'Your CV caught their attention. On to round 2.'
    ],
    failMessages: [
      'We regret to inform you that we are moving forward with other candidates.',
      'Your CV didn\'t match what we are looking for at this time.',
      'After reviewing your application, we have decided to pursue other options.'
    ]
  },
  {
    id: 'phone',
    label: 'Round 2: Phone Interview',
    weight: 'social',
    threshold: 0.60,
    passMessages: [
      'Excellent phone interview! They want to meet you in person.',
      'Great communication skills. Final round scheduled.',
      'The hiring manager was impressed. See you in person.'
    ],
    failMessages: [
      'The hiring manager had concerns about your experience level.',
      'We were looking for someone with more direct experience.',
      'Thank you for your time. We have chosen another candidate.'
    ]
  },
  {
    id: 'final',
    label: 'Round 3: Final Interview',
    weight: 'composite',
    threshold: 0.65,
    passMessages: [
      'Congratulations! You got the job!',
      'They love you. Offer letter on its way.',
      'You are hired! Welcome to the team.'
    ],
    failMessages: [
      'You made it to the final round, but they chose another candidate with slightly more experience.',
      'It was very close, but we went in a different direction.',
      'The team liked you, but the position was filled internally.'
    ]
  }
];

/* ============================================================
   8. JOB EVENTS (28 work drama events)
   ============================================================ */

const CAR_JOB_EVENTS = [
  { id: 'competitor_offer',  weight: 8,  label: 'Competitor offer',        text: 'A competitor wants to hire you for {bump}% more.',              choice: true, minTenure: 1, minPerformance: 65 },
  { id: 'bonus',             weight: 12, label: 'Annual bonus',             text: 'You received a bonus of {amount}.',                              choice: false },
  { id: 'promotion_offer',   weight: 5,  label: 'Promotion offer',          text: 'Your manager wants to promote you.',                             choice: true },
  { id: 'meeting_conflict',  weight: 6,  label: 'Conflict with boss',       text: 'Your manager publicly criticized your work.',                    choice: true },
  { id: 'project_success',   weight: 8,  label: 'Project success',          text: 'Your project delivered strong results.',                         choice: false },
  { id: 'project_fail',      weight: 5,  label: 'Project failure',          text: 'A major project failed under your watch.',                       choice: false },
  { id: 'layoff_rumor',      weight: 6,  label: 'Layoff rumors',            text: 'Rumors about layoffs are spreading.',                            choice: false },
  { id: 'headhunter_call',   weight: 4,  label: 'Headhunter call',          text: 'A recruiter is interested in your profile.',                     choice: true },
  { id: 'mentor',            weight: 5,  label: 'Mentor relationship',      text: 'A senior colleague becomes your mentor.',                        choice: false, requiresNoMentor: true },
  { id: 'burnout_warning',   weight: 6,  label: 'Burnout',                  text: 'You are exhausted. Signs of burnout.',                           choice: true },
  { id: 'overtime_request',  weight: 10, label: 'Overtime requested',       text: 'Your team needs you to work late this month.',                   choice: true },
  { id: 'company_merger',    weight: 3,  label: 'Company merger announced', text: 'Your company is being acquired. Uncertainty ahead.',              choice: false },
  { id: 'coworker_friend',   weight: 6,  label: 'New work friend',          text: 'A coworker becomes a close friend.',                             choice: false },
  { id: 'coworker_conflict', weight: 5,  label: 'Coworker conflict',        text: 'A coworker is undermining you.',                                 choice: true },
  { id: 'salary_delay',      weight: 4,  label: 'Salary delay',             text: 'Salaries are delayed this month.',                              choice: false },
  { id: 'training_offer',    weight: 5,  label: 'Training opportunity',     text: 'Company offers to pay for a professional course.',               choice: true },
  { id: 'overtime_pay',      weight: 7,  label: 'Overtime pay bonus',       text: 'You earned extra this month from overtime.',                     choice: false },
  { id: 'team_offsite',      weight: 5,  label: 'Team offsite',             text: 'The team is going on a retreat.',                                choice: false },
  { id: 'remote_work_offer', weight: 4,  label: 'Remote work offer',        text: 'Your manager offers 2-3 days remote work per week.',             choice: true },
  { id: 'client_travel',     weight: 4,  label: 'Client site travel',       text: 'You are asked to travel to a client site abroad.',               choice: true },
  { id: 'office_party_drama',weight: 4,  label: 'Office party drama',       text: 'Something happened at the office party that everyone is talking about.', choice: false },
  { id: 'promotion_rejected',weight: 4,  label: 'Promotion rejected',       text: 'You were passed over for a promotion.',                          choice: false },
  { id: 'raise_negotiation_win', weight: 3, label: 'Raise negotiation win', text: 'You negotiated a raise successfully.',                           choice: false },
  { id: 'raise_negotiation_lose', weight: 3, label: 'Raise negotiation failed', text: 'Your raise request was denied.',                             choice: false },
  { id: 'stock_vest',        weight: 3,  label: 'Stock vesting',            text: 'Your company stock vested.',                                     choice: false },
  { id: 'coworker_wedding',  weight: 3,  label: 'Coworker wedding invite',  text: 'A coworker invites you to their wedding.',                       choice: true },
  { id: 'whistleblower',     weight: 2,  label: 'Whistleblower dilemma',    text: 'You discovered misconduct. Do you report it?',                   choice: true },
  { id: 'hr_complaint',      weight: 3,  label: 'HR complaint filed',       text: 'A complaint was filed against you. HR wants to talk.',           choice: false }
];

/* ============================================================
   9. GLOBAL EVENTS (7 macro events)
   ============================================================ */

const CAR_GLOBAL_EVENTS = [
  { year: 2008, id: 'recession',      label: 'Global Financial Crisis',   layoffChance: 0.20, salaryHit: 0.10 },
  { year: 2011, id: 'arab_spring',    label: 'Arab Spring',               layoffChance: 0.15, salaryHit: 0.12 },
  { year: 2014, id: 'oil_crash',      label: 'Oil price crash',           layoffChance: 0.15, salaryHit: 0.08 },
  { year: 2020, id: 'covid',          label: 'COVID-19 pandemic',         layoffChance: 0.25, salaryHit: 0.15 },
  { year: 2021, id: 'covid_recovery', label: 'Post-COVID recovery',       layoffChance: 0.05, salaryHit: 0.02 },
  { year: 2022, id: 'recession2',     label: 'Post-COVID recession',      layoffChance: 0.15, salaryHit: 0.08 },
  { year: 2026, id: 'inflation',      label: 'High inflation environment', layoffChance: 0.10, salaryHit: 0.05 }
];

/* ============================================================
   10. BENEFITS (14 benefits)
   ============================================================ */

const CAR_BENEFITS = {
  health:    { label: 'Private health insurance',     value: 'Full health coverage. Reduces medical out-of-pocket.' },
  dental:    { label: 'Dental coverage',              value: 'Routine dental care covered.' },
  vision:    { label: 'Vision coverage',              value: 'Eye exams and glasses covered.' },
  stock:     { label: 'Stock options / RSUs',         value: 'Equity in the company. Grows with company value.' },
  bonus:     { label: 'Annual bonus',                 value: 'Performance bonus up to 20% of salary.' },
  pension:   { label: 'Pension contribution',         value: 'Employer matches pension contributions.' },
  life:      { label: 'Life insurance',               value: 'Term life insurance provided.' },
  wfh:       { label: 'Remote work allowed',          value: 'Work from home 2-3 days per week.' },
  signing:   { label: 'Signing bonus',                value: 'One-time bonus on joining.' },
  transport: { label: 'Company transport',            value: 'Free bus / transport allowance.' },
  housing:   { label: 'Housing allowance',            value: 'Monthly housing contribution (Gulf companies).' },
  gym:       { label: 'Gym membership',               value: 'Company gym or gym stipend.' },
  meals:     { label: 'Meal allowance',               value: 'Free meals or meal stipend.' },
  travel:    { label: 'Travel benefits',              value: 'Free or discounted airline tickets.' }
};
/* Fix flat EGP base salary for foreign countries */
window.CAR_COUNTRY_MULT = {
  egy: 1.0, sau: 3.5, uae: 3.5, kwt: 3.5, qat: 3.5,
  usa: 10.0, gbr: 8.0, deu: 8.0, can: 8.5, aus: 9.0, nld: 8.0, fra: 7.5, jpn: 8.0, sgp: 9.0, ita: 6.0
};
/* ============================================================
   END OF CAREER DATA
   ============================================================ */
/* ============================================================
   SESSION 9B: LIVING JOB MARKET (MASSIVELY EXPANDED)
   Company meta, sector crises, interview depth, expansion
   ============================================================ */

/* ---------- COMPANY METADATA ---------- */
/* Behavioral personality per company. Missing companies fall back to defaults. */
const COMPANY_META = {
  /* ===== EGYPT ===== */
  'CIB (Commercial International Bank)': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008', 'egp_crisis_2023'], founded: 1975, culture: 'prestigious' },
  'NBE (National Bank of Egypt)': { sector: 'banking', growth: 'stable', crisisVulnerable: ['egp_crisis_2023'], founded: 1898, culture: 'bureaucratic' },
  'Banque Misr': { sector: 'banking', growth: 'stable', crisisVulnerable: ['egp_crisis_2023'], founded: 1920, culture: 'bureaucratic' },
  'QNB Alahli': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1978, culture: 'strict' },
  'HSBC Egypt': { sector: 'banking', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 1982, culture: 'prestigious' },
  'Emirates NBD Egypt': { sector: 'banking', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 2005, culture: 'strict' },
  'Amazon Egypt': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 1994, culture: 'demanding' },
  'Microsoft Egypt': { sector: 'tech', growth: 'stable', crisisVulnerable: ['tech_winter_2022'], founded: 1975, culture: 'prestigious' },
  'Google Egypt': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 1998, culture: 'prestigious' },
  'Vodafone Egypt': { sector: 'tech', growth: 'stable', crisisVulnerable: [], founded: 1998, culture: 'flexible' },
  'Fawry': { sector: 'tech', growth: 'risky', crisisVulnerable: ['tech_winter_2022'], founded: 2008, culture: 'demanding' },
  'Paymob': { sector: 'tech', growth: 'risky', crisisVulnerable: ['tech_winter_2022'], founded: 2015, culture: 'demanding' },
  'Thndr': { sector: 'tech', growth: 'risky', crisisVulnerable: ['tech_winter_2022'], founded: 2019, culture: 'demanding' },
  'Oracle Egypt': { sector: 'tech', growth: 'stable', crisisVulnerable: ['tech_winter_2022'], founded: 1977, culture: 'strict' },
  'IBM Egypt': { sector: 'tech', growth: 'stable', crisisVulnerable: ['tech_winter_2022'], founded: 1911, culture: 'prestigious' },
  'Bosta': { sector: 'tech', growth: 'risky', crisisVulnerable: ['tech_winter_2022'], founded: 2016, culture: 'demanding' },
  'PwC Egypt': { sector: 'consulting', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1998, culture: 'demanding' },
  'Deloitte Egypt': { sector: 'consulting', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1998, culture: 'demanding' },
  'KPMG Egypt': { sector: 'consulting', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1998, culture: 'strict' },
  'EY Egypt': { sector: 'consulting', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1998, culture: 'demanding' },
  'McKinsey Egypt': { sector: 'consulting', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 1926, culture: 'prestigious' },
  'BCG Egypt': { sector: 'consulting', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 1963, culture: 'prestigious' },
  'Bain Egypt': { sector: 'consulting', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 1973, culture: 'prestigious' },
  'Matouk Bassiouny & Hennawy': { sector: 'law', growth: 'stable', crisisVulnerable: ['egp_crisis_2023'], founded: 2001, culture: 'prestigious' },
  'Shalakany Law Office': { sector: 'law', growth: 'stable', crisisVulnerable: [], founded: 1939, culture: 'prestigious' },
  'Zulficar & Partners': { sector: 'law', growth: 'stable', crisisVulnerable: [], founded: 1989, culture: 'prestigious' },
  'Baker McKenzie Cairo': { sector: 'law', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1949, culture: 'prestigious' },
  'Orascom Construction': { sector: 'engineering', growth: 'cyclical', crisisVulnerable: ['oil_crash_2014', 'egp_crisis_2023'], founded: 1950, culture: 'demanding' },
  'Hassan Allam Holding': { sector: 'engineering', growth: 'cyclical', crisisVulnerable: ['egp_crisis_2023'], founded: 1970, culture: 'strict' },
  'Elsewedy Electric': { sector: 'engineering', growth: 'cyclical', crisisVulnerable: ['egp_crisis_2023'], founded: 1938, culture: 'stable' },
  'Kasr El Aini (public)': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 1837, culture: 'bureaucratic' },
  'Dar Al Fouad': { sector: 'hospitals', growth: 'growth', crisisVulnerable: [], founded: 1998, culture: 'prestigious' },
  'Saudi German Hospital Cairo': { sector: 'hospitals', growth: 'growth', crisisVulnerable: [], founded: 2013, culture: 'prestigious' },
  '57357 Cancer Center': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 2007, culture: 'missionary' },
  'MBC Masr': { sector: 'media', growth: 'cyclical', crisisVulnerable: ['ai_disruption_2026'], founded: 2012, culture: 'creative' },
  'CNBC Arabia': { sector: 'media', growth: 'stable', crisisVulnerable: ['ai_disruption_2026'], founded: 2003, culture: 'prestigious' },
  'Al-Ahram': { sector: 'media', growth: 'stable', crisisVulnerable: ['egp_crisis_2023', 'ai_disruption_2026'], founded: 1875, culture: 'bureaucratic' },
  'Youm7': { sector: 'media', growth: 'cyclical', crisisVulnerable: ['ai_disruption_2026'], founded: 2007, culture: 'creative' },
  'Mada Masr': { sector: 'media', growth: 'stable', crisisVulnerable: [], founded: 2013, culture: 'missionary' },
  'Eva Pharma': { sector: 'pharma', growth: 'growth', crisisVulnerable: ['egp_crisis_2023'], founded: 1997, culture: 'stable' },
  'Hikma Egypt': { sector: 'pharma', growth: 'stable', crisisVulnerable: [], founded: 1978, culture: 'stable' },
  'Pfizer Egypt': { sector: 'pharma', growth: 'stable', crisisVulnerable: [], founded: 1849, culture: 'prestigious' },
  'Novartis Egypt': { sector: 'pharma', growth: 'stable', crisisVulnerable: [], founded: 1996, culture: 'prestigious' },
  'Amoun Pharmaceutical': { sector: 'pharma', growth: 'stable', crisisVulnerable: [], founded: 1986, culture: 'stable' },
  'Cairo American College': { sector: 'schools', growth: 'stable', crisisVulnerable: [], founded: 1945, culture: 'prestigious' },
  'British International School Cairo': { sector: 'schools', growth: 'stable', crisisVulnerable: [], founded: 1976, culture: 'prestigious' },
  'AUC (American University in Cairo)': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 1919, culture: 'prestigious' },
  'GUC (German University in Cairo)': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 2002, culture: 'prestigious' },
  'Vodafone VOIS': { sector: 'bpo', growth: 'stable', crisisVulnerable: ['ai_disruption_2026'], founded: 2008, culture: 'flexible' },
  'Teleperformance Egypt': { sector: 'bpo', growth: 'cyclical', crisisVulnerable: ['ai_disruption_2026'], founded: 2005, culture: 'strict' },
  'Concentrix Egypt': { sector: 'bpo', growth: 'cyclical', crisisVulnerable: ['ai_disruption_2026'], founded: 2015, culture: 'strict' },
  'Xceed (Telecom Egypt)': { sector: 'bpo', growth: 'stable', crisisVulnerable: ['ai_disruption_2026'], founded: 2003, culture: 'bureaucratic' },

  /* ===== USA ===== */
  'JPMorgan Chase': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1799, culture: 'prestigious' },
  'Goldman Sachs': { sector: 'banking', growth: 'cyclical', crisisVulnerable: ['financial_2008'], founded: 1869, culture: 'prestigious' },
  'Morgan Stanley': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1935, culture: 'prestigious' },
  'Bank of America': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1784, culture: 'bureaucratic' },
  'Citibank': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1812, culture: 'strict' },
  'Google': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 1998, culture: 'prestigious' },
  'Microsoft': { sector: 'tech', growth: 'stable', crisisVulnerable: ['tech_winter_2022'], founded: 1975, culture: 'stable' },
  'Amazon': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 1994, culture: 'demanding' },
  'Apple': { sector: 'tech', growth: 'stable', crisisVulnerable: [], founded: 1976, culture: 'prestigious' },
  'Meta': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 2004, culture: 'demanding' },
  'OpenAI': { sector: 'tech', growth: 'risky', crisisVulnerable: [], founded: 2015, culture: 'demanding' },
  'Stripe': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 2010, culture: 'demanding' },
  'Airbnb': { sector: 'tech', growth: 'cyclical', crisisVulnerable: ['covid_2020', 'tech_winter_2022'], founded: 2008, culture: 'flexible' },
  'Nvidia': { sector: 'tech', growth: 'growth', crisisVulnerable: [], founded: 1993, culture: 'demanding' },
  'McKinsey': { sector: 'consulting', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 1926, culture: 'prestigious' },
  'BCG': { sector: 'consulting', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 1963, culture: 'prestigious' },
  'Bain': { sector: 'consulting', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 1973, culture: 'prestigious' },
  'Deloitte': { sector: 'consulting', growth: 'stable', crisisVulnerable: [], founded: 1845, culture: 'demanding' },
  'Accenture': { sector: 'consulting', growth: 'stable', crisisVulnerable: [], founded: 1989, culture: 'bureaucratic' },
  'Skadden': { sector: 'law', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1948, culture: 'prestigious' },
  'Wachtell': { sector: 'law', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1965, culture: 'prestigious' },
  'Latham & Watkins': { sector: 'law', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1934, culture: 'demanding' },
  'Kirkland & Ellis': { sector: 'law', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1909, culture: 'demanding' },
  'Mayo Clinic': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 1864, culture: 'missionary' },
  'Johns Hopkins Hospital': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 1889, culture: 'prestigious' },
  'Cleveland Clinic': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 1921, culture: 'prestigious' },
  'Kaiser Permanente': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 1945, culture: 'bureaucratic' },
  'CNN': { sector: 'media', growth: 'cyclical', crisisVulnerable: ['ai_disruption_2026'], founded: 1980, culture: 'demanding' },
  'New York Times': { sector: 'media', growth: 'stable', crisisVulnerable: ['ai_disruption_2026'], founded: 1851, culture: 'prestigious' },
  'The Atlantic': { sector: 'media', growth: 'stable', crisisVulnerable: ['ai_disruption_2026'], founded: 1857, culture: 'missionary' },
  'Harvard': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 1636, culture: 'prestigious' },
  'MIT': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 1861, culture: 'prestigious' },
  'Stanford': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 1885, culture: 'prestigious' },

  /* ===== UK ===== */
  'Barclays': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1690, culture: 'prestigious' },
  'HSBC UK': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1865, culture: 'bureaucratic' },
  'DeepMind': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 2010, culture: 'prestigious' },
  'Google UK': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 2003, culture: 'prestigious' },
  'Monzo': { sector: 'tech', growth: 'risky', crisisVulnerable: ['tech_winter_2022'], founded: 2015, culture: 'demanding' },
  'Revolut': { sector: 'tech', growth: 'risky', crisisVulnerable: ['tech_winter_2022'], founded: 2015, culture: 'demanding' },
  'Clifford Chance': { sector: 'law', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1987, culture: 'prestigious' },
  'Linklaters': { sector: 'law', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1838, culture: 'prestigious' },
  'NHS (public)': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 1948, culture: 'bureaucratic' },
  'AstraZeneca': { sector: 'pharma', growth: 'growth', crisisVulnerable: [], founded: 1999, culture: 'stable' },
  'BBC': { sector: 'media', growth: 'stable', crisisVulnerable: ['ai_disruption_2026'], founded: 1922, culture: 'bureaucratic' },
  'Eton College': { sector: 'schools', growth: 'stable', crisisVulnerable: [], founded: 1440, culture: 'prestigious' },
  'Oxford University': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 1096, culture: 'prestigious' },

  /* ===== SAUDI ARABIA ===== */
  'Aramco': { sector: 'oil_gas', growth: 'cyclical', crisisVulnerable: ['oil_crash_2014'], founded: 1933, culture: 'prestigious' },
  'SABIC': { sector: 'oil_gas', growth: 'cyclical', crisisVulnerable: ['oil_crash_2014'], founded: 1976, culture: 'prestigious' },
  'Al Rajhi Bank': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1957, culture: 'stable' },
  'SNB (Saudi National Bank)': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1953, culture: 'bureaucratic' },
  'STC': { sector: 'tech', growth: 'stable', crisisVulnerable: [], founded: 1998, culture: 'stable' },
  'Neom': { sector: 'engineering', growth: 'risky', crisisVulnerable: ['oil_crash_2014'], founded: 2017, culture: 'demanding' },
  'Saudia Airlines': { sector: 'aviation', growth: 'stable', crisisVulnerable: ['covid_2020'], founded: 1945, culture: 'bureaucratic' },
  'KAUST': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 2009, culture: 'prestigious' },

  /* ===== UAE ===== */
  'Emirates Airline': { sector: 'aviation', growth: 'cyclical', crisisVulnerable: ['covid_2020'], founded: 1985, culture: 'prestigious' },
  'Etihad Airways': { sector: 'aviation', growth: 'cyclical', crisisVulnerable: ['covid_2020'], founded: 2003, culture: 'demanding' },
  'Emirates NBD': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1963, culture: 'strict' },
  'FAB (First Abu Dhabi Bank)': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 2017, culture: 'prestigious' },
  'Emaar Properties': { sector: 'real_estate', growth: 'cyclical', crisisVulnerable: ['financial_2008', 'covid_2020'], founded: 1997, culture: 'demanding' },
  'DP World': { sector: 'logistics', growth: 'stable', crisisVulnerable: ['supply_chain_2021'], founded: 2005, culture: 'prestigious' },
  'Careem': { sector: 'tech', growth: 'risky', crisisVulnerable: ['tech_winter_2022'], founded: 2012, culture: 'demanding' },
  'Cleveland Clinic Abu Dhabi': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 2015, culture: 'prestigious' },

  /* ===== GERMANY ===== */
  'SAP': { sector: 'tech', growth: 'stable', crisisVulnerable: [], founded: 1972, culture: 'stable' },
  'Siemens': { sector: 'engineering', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1847, culture: 'prestigious' },
  'BMW': { sector: 'engineering', growth: 'cyclical', crisisVulnerable: ['financial_2008', 'supply_chain_2021'], founded: 1916, culture: 'stable' },
  'Mercedes-Benz': { sector: 'engineering', growth: 'cyclical', crisisVulnerable: ['financial_2008', 'supply_chain_2021'], founded: 1926, culture: 'stable' },
  'Volkswagen': { sector: 'engineering', growth: 'cyclical', crisisVulnerable: ['financial_2008'], founded: 1937, culture: 'bureaucratic' },
  'Deutsche Bank': { sector: 'banking', growth: 'risky', crisisVulnerable: ['financial_2008'], founded: 1870, culture: 'demanding' },
  'Allianz': { sector: 'insurance', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1890, culture: 'stable' },
  'Bayer': { sector: 'pharma', growth: 'stable', crisisVulnerable: [], founded: 1863, culture: 'bureaucratic' },

  /* ===== CANADA ===== */
  'Shopify': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 2006, culture: 'demanding' },
  'RBC': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1864, culture: 'prestigious' },
  'TD Bank': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1955, culture: 'stable' },
  'Air Canada': { sector: 'aviation', growth: 'cyclical', crisisVulnerable: ['covid_2020'], founded: 1937, culture: 'bureaucratic' },
  'University of Toronto': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 1827, culture: 'prestigious' },
  'UHN (University Health Network)': { sector: 'hospitals', growth: 'stable', crisisVulnerable: [], founded: 1999, culture: 'prestigious' },
  'CBC': { sector: 'media', growth: 'stable', crisisVulnerable: ['ai_disruption_2026'], founded: 1936, culture: 'bureaucratic' },

  /* ===== AUSTRALIA ===== */
  'Commonwealth Bank': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 1911, culture: 'stable' },
  'Macquarie Group': { sector: 'banking', growth: 'growth', crisisVulnerable: ['financial_2008'], founded: 1969, culture: 'demanding' },
  'BHP': { sector: 'mining', growth: 'cyclical', crisisVulnerable: ['oil_crash_2014'], founded: 1885, culture: 'prestigious' },
  'Atlassian': { sector: 'tech', growth: 'growth', crisisVulnerable: ['tech_winter_2022'], founded: 2002, culture: 'flexible' },
  'Qantas': { sector: 'aviation', growth: 'cyclical', crisisVulnerable: ['covid_2020'], founded: 1920, culture: 'prestigious' },
  'University of Melbourne': { sector: 'universities', growth: 'stable', crisisVulnerable: [], founded: 1853, culture: 'prestigious' },

  /* ===== FRANCE & JAPAN ===== */
  'L\'Oréal': { sector: 'consumer', growth: 'stable', crisisVulnerable: [], founded: 1909, culture: 'prestigious' },
  'BNP Paribas': { sector: 'banking', growth: 'stable', crisisVulnerable: ['financial_2008'], founded: 2000, culture: 'bureaucratic' },
  'TotalEnergies': { sector: 'oil_gas', growth: 'cyclical', crisisVulnerable: ['oil_crash_2014'], founded: 1924, culture: 'stable' },
  'Toyota': { sector: 'engineering', growth: 'stable', crisisVulnerable: ['supply_chain_2021'], founded: 1937, culture: 'strict' },
  'Sony': { sector: 'tech', growth: 'stable', crisisVulnerable: ['tech_winter_2022'], founded: 1946, culture: 'creative' },
  'SoftBank': { sector: 'finance', growth: 'risky', crisisVulnerable: ['tech_winter_2022'], founded: 1981, culture: 'demanding' }
};
window.COMPANY_META = COMPANY_META;

/* ---------- SECTOR CRISES ---------- */
/* Fires in specific year ranges. Layoffs hit industries that depend on the sector. */
const SECTOR_CRISES = [
  { id: 'dot_com_hangover', label: '2001 Post-Dot-Com Crash', year: 2001, yearEnd: 2003, severity: 0.6,
    desc: 'The internet bubble burst. Tech companies are shuttering. Consultants are being let go across the board.',
    industries: ['tech', 'consulting', 'media'] },
  { id: 'financial_2008', label: '2008 Global Financial Crisis', year: 2008, yearEnd: 2010, severity: 0.85,
    desc: 'Lehman Brothers collapsed. Banks are failing. Credit markets are frozen. Hiring has stopped across finance, real estate, and consulting.',
    industries: ['banking', 'consulting', 'law', 'engineering', 'real_estate'] },
  { id: 'euro_debt_2010', label: '2010 European Debt Crisis', year: 2010, yearEnd: 2012, severity: 0.5,
    desc: 'Sovereign debt crises in Greece, Italy, and Spain have rippled outward. Banks and governments are enacting strict austerity measures.',
    industries: ['banking', 'government', 'engineering'] },
  { id: 'arab_spring_2011', label: '2011 Arab Spring', year: 2011, yearEnd: 2013, severity: 0.6,
    desc: 'Political upheaval across the Middle East. Tourism has collapsed. Investors are fleeing.',
    industries: ['hotels', 'aviation', 'media', 'retail', 'real_estate'] },
  { id: 'oil_crash_2014', label: '2014 Oil Price Crash', year: 2014, yearEnd: 2016, severity: 0.7,
    desc: 'Oil fell from $115 to $30. Gulf projects are being cancelled. Energy companies are cutting staff.',
    industries: ['oil_gas', 'engineering', 'mining'] },
  { id: 'egp_float_2016', label: '2016 EGP Float', year: 2016, yearEnd: 2017, severity: 0.4,
    desc: 'The Egyptian pound was floated and lost half its value overnight. Everything imported doubled in price.',
    industries: ['retail', 'manufacturing', 'hotels'] },
  { id: 'covid_2020', label: '2020 COVID-19 Pandemic', year: 2020, yearEnd: 2021, severity: 0.9,
    desc: 'Lockdowns. Travel stopped. Hotels empty. Airlines grounded. Millions of jobs gone in months.',
    industries: ['hotels', 'aviation', 'retail', 'restaurants', 'media'] },
  { id: 'covid_recovery_2021', label: 'Post-COVID Recovery', year: 2021, yearEnd: 2022, severity: -0.5,
    desc: 'Hiring is back. Companies cannot find workers. Salaries are climbing.',
    industries: ['tech', 'ecommerce', 'hotels', 'aviation', 'logistics'] },
  { id: 'supply_chain_2021', label: '2021 Supply Chain Crisis', year: 2021, yearEnd: 2023, severity: 0.5,
    desc: 'Global logistics are broken. Microchip shortages have halted manufacturing and automotive assembly worldwide.',
    industries: ['manufacturing', 'engineering', 'logistics', 'retail'] },
  { id: 'tech_winter_2022', label: '2022 Tech Winter', year: 2022, yearEnd: 2024, severity: 0.85,
    desc: 'Meta, Google, Amazon, Twitter all announcing mass layoffs. 200,000+ tech jobs gone in months.',
    industries: ['tech', 'bpo', 'consulting'] },
  { id: 'egp_crisis_2023', label: '2023 EGP Devaluation', year: 2023, yearEnd: 2025, severity: 0.7,
    desc: 'The Egyptian pound lost another 70% in months. Prices tripled. Most people\'s real income has halved.',
    industries: ['banking', 'retail', 'manufacturing', 'media', 'engineering'] },
  { id: 'ai_disruption_2026', label: '2026 AI Disruption', year: 2026, yearEnd: 2030, severity: 0.75,
    desc: 'AI has replaced junior roles. Customer service, copywriters, paralegals — all affected. Companies are restructuring around AI.',
    industries: ['bpo', 'media', 'consulting', 'law', 'tech'] },
  { id: 'cre_collapse_2027', label: '2027 Commercial Real Estate Collapse', year: 2027, yearEnd: 2029, severity: 0.65,
    desc: 'Post-pandemic remote work finally broke the office market. Major commercial defaults are hurting regional banks and developers.',
    industries: ['real_estate', 'banking', 'engineering', 'law'] }
];
window.SECTOR_CRISES = SECTOR_CRISES;

/* ---------- INTERVIEW REJECTION REASONS ---------- */
const INTERVIEW_REJECTION_REASONS = {
  screening: [
    { id: 'thin_cv', check: function(s) { return (s.career && s.career.cv && (s.career.cv.experience || 0) < 1); },
      text: 'Your CV was too thin. They wanted at least 1-2 years of experience.' },
    { id: 'no_degree', check: function(s) { return !s.degree && !s.uni; },
      text: 'You had no university degree. Most applicants for this role do.' },
    { id: 'job_hopper', check: function(s) { return (s.career && s.career.jobHistory && s.career.jobHistory.filter(h => (h.to - h.from) < 1).length > 2); },
      text: 'Your resume showed too many short stints. They labeled you a "job hopper."' },
    { id: 'weak_english', check: function(s) {
        var ielts = (s.languageScores && s.languageScores.ielts) || 0;
        return ielts < 6.5 && s.smarts < 65;
      },
      text: 'Your English was not strong enough for this role\'s requirements.' },
    { id: 'gap_in_resume', check: function(s) { return (s.career && s.career.jobHistory && s.career.jobHistory.some(function(h) { return (gameYear() - h.to) > 2; })); },
      text: 'The gap in your work history raised concerns. They moved on.' }
  ],
  phone: [
    { id: 'poor_communication', check: function(s) { return s.social < 40; },
      text: 'You struggled to articulate your experience clearly on the phone.' },
    { id: 'low_energy', check: function(s) { return s.social < 45 && s.happiness < 40; },
      text: 'The recruiter felt you lacked enthusiasm for the role. "Low energy."' },
    { id: 'unprepared', check: function(s) { return s.smarts < 45; },
      text: 'Your answers did not demonstrate the required technical depth.' },
    { id: 'salary_expectations', check: function(s) { return (s.wealth > 100000 && (!s.career || !s.career.job)); },
      text: 'Your salary expectations were wildly out of sync with their budget.' },
    { id: 'salary_early', check: function(s) { return s.social < 55 && s.smarts > 60; },
      text: 'You brought up salary and benefits too early. They were not impressed.' }
  ],
  final: [
    { id: 'culture_fit', check: function(s) { return s.social < 50; },
      text: 'The panel felt you would not fit the team culture. "Personality mismatch."' },
    { id: 'arrogant', check: function(s) { return s.social < 35 && s.smarts > 75; },
      text: 'The interviewers found you difficult to work with. "Brilliant, but abrasive."' },
    { id: 'failed_case_study', check: function(s) { return s.smarts < 55; },
      text: 'You completely fumbled the technical case study / whiteboard assignment.' },
    { id: 'overqualified', check: function(s) { return (s.career && s.career.cv && (s.career.cv.experience || 0) > 10) && s.age > 45; },
      text: 'They thought you were overqualified. "You would be bored here."' },
    { id: 'better_candidate', check: function(s) { return (s.smarts < 65) && (s.social < 65); },
      text: 'Another candidate had more direct experience in exactly this field.' },
    { id: 'reference_check', check: function(s) { return (s.career && s.career.network && s.career.network.references && s.career.network.references.length === 0); },
      text: 'The reference check was weak. You had no strong professional references.' }
  ]
};
window.INTERVIEW_REJECTION_REASONS = INTERVIEW_REJECTION_REASONS;

/* ---------- NEW COMPANIES — Over 100+ added to existing pools ---------- */
(function session9BExpansion() {
  if (typeof CAR_COMPANIES === 'undefined') return;
  var additions = {
    egy: {
      banking: [
        { name: 'Bank of Alexandria (Intesa)', payMult: 1.05, benefits: ['health', 'bonus', 'pension'], stability: 0.95, prestige: 4 },
        { name: 'Mashreq Egypt', payMult: 1.10, benefits: ['health', 'bonus', 'stock'], stability: 0.90, prestige: 4 },
        { name: 'Ahli United Bank Egypt', payMult: 1.15, benefits: ['health', 'bonus', 'housing'], stability: 0.90, prestige: 4 }
      ],
      tech: [
        { name: 'Cisco Egypt', payMult: 1.35, benefits: ['health', 'stock', 'wfh', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'VMware Egypt (Broadcom)', payMult: 1.30, benefits: ['health', 'stock', 'wfh'], stability: 0.80, prestige: 4 },
        { name: 'Luxoft Egypt', payMult: 1.20, benefits: ['health', 'wfh', 'bonus'], stability: 0.85, prestige: 4 },
        { name: 'Si-Vision', payMult: 1.25, benefits: ['health', 'stock', 'bonus'], stability: 0.85, prestige: 4 }
      ],
      consulting: [
        { name: 'Accenture Egypt', payMult: 1.15, benefits: ['health', 'bonus', 'wfh'], stability: 0.90, prestige: 4 },
        { name: 'Strategy& (PwC)', payMult: 1.40, benefits: ['health', 'bonus'], stability: 0.85, prestige: 5 }
      ],
      accounting: [
        { name: 'BDO Egypt', payMult: 0.95, benefits: ['health', 'bonus'], stability: 0.85, prestige: 3 },
        { name: 'Grant Thornton Egypt', payMult: 0.95, benefits: ['health', 'bonus'], stability: 0.85, prestige: 3 }
      ],
      law: [
        { name: 'Kosheri Rashed & Randa', payMult: 1.25, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Soliman Hashish & Partners', payMult: 1.10, benefits: ['health'], stability: 0.85, prestige: 4 }
      ],
      engineering: [
        { name: 'Siemens Egypt', payMult: 1.30, benefits: ['health', 'stock', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Schneider Electric Egypt', payMult: 1.20, benefits: ['health', 'bonus'], stability: 0.90, prestige: 4 }
      ],
      pharma: [
        { name: 'Sanofi Egypt', payMult: 1.25, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'MSD Egypt', payMult: 1.25, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 }
      ],
      media: [
        { name: 'Al-Masry Al-Youm', payMult: 0.90, benefits: ['health'], stability: 0.80, prestige: 4 },
        { name: 'ON TV', payMult: 1.00, benefits: ['health', 'bonus'], stability: 0.85, prestige: 4 }
      ],
      schools: [
        { name: 'Modern English School Cairo', payMult: 1.30, benefits: ['health', 'pension'], stability: 0.90, prestige: 4 },
        { name: 'New Cairo British International', payMult: 1.40, benefits: ['health', 'pension'], stability: 0.90, prestige: 4 }
      ],
      bpo: [
        { name: 'Sutherland Egypt', payMult: 1.00, benefits: ['health', 'bonus'], stability: 0.85, prestige: 3 },
        { name: 'TTEC Egypt', payMult: 1.10, benefits: ['health', 'bonus'], stability: 0.80, prestige: 3 }
      ]
    },
    usa: {
      banking: [
        { name: 'Wells Fargo', payMult: 1.10, benefits: ['health', 'stock', 'pension'], stability: 0.95, prestige: 5 },
        { name: 'US Bank', payMult: 1.05, benefits: ['health', 'stock', 'pension'], stability: 0.95, prestige: 4 },
        { name: 'PNC Financial', payMult: 1.08, benefits: ['health', 'stock', 'pension'], stability: 0.90, prestige: 4 }
      ],
      tech: [
        { name: 'Adobe', payMult: 1.35, benefits: ['health', 'stock', 'wfh', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Salesforce', payMult: 1.30, benefits: ['health', 'stock', 'wfh'], stability: 0.85, prestige: 5 },
        { name: 'Netflix', payMult: 1.50, benefits: ['health', 'stock', 'wfh'], stability: 0.75, prestige: 5 },
        { name: 'Uber', payMult: 1.25, benefits: ['health', 'stock', 'wfh'], stability: 0.80, prestige: 5 },
        { name: 'IBM', payMult: 1.15, benefits: ['health', 'stock', 'pension'], stability: 0.90, prestige: 5 }
      ],
      consulting: [
        { name: 'IBM Consulting', payMult: 1.15, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'EY-Parthenon', payMult: 1.35, benefits: ['health', 'bonus'], stability: 0.85, prestige: 5 }
      ],
      accounting: [
        { name: 'PwC US', payMult: 1.10, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'KPMG US', payMult: 1.10, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'EY US', payMult: 1.10, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 }
      ],
      hospitals: [
        { name: 'UCSF Medical Center', payMult: 1.25, benefits: ['health', 'pension'], stability: 0.95, prestige: 5 },
        { name: 'Mount Sinai Hospital', payMult: 1.20, benefits: ['health', 'pension'], stability: 0.95, prestige: 5 },
        { name: 'Massachusetts General', payMult: 1.25, benefits: ['health', 'pension'], stability: 0.95, prestige: 5 }
      ],
      law: [
        { name: 'Davis Polk', payMult: 1.55, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Sullivan & Cromwell', payMult: 1.55, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Cravath', payMult: 1.55, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 }
      ],
      media: [
        { name: 'Washington Post', payMult: 1.10, benefits: ['health', 'bonus'], stability: 0.85, prestige: 5 },
        { name: 'Wall Street Journal', payMult: 1.15, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Disney (Media)', payMult: 1.20, benefits: ['health', 'bonus', 'stock'], stability: 0.85, prestige: 5 }
      ]
    },
    gbr: {
      banking: [
        { name: 'Lloyds Bank', payMult: 1.05, benefits: ['health', 'pension', 'bonus'], stability: 0.90, prestige: 4 },
        { name: 'NatWest', payMult: 1.05, benefits: ['health', 'pension', 'bonus'], stability: 0.90, prestige: 4 },
        { name: 'Standard Chartered', payMult: 1.15, benefits: ['health', 'pension', 'bonus'], stability: 0.85, prestige: 5 }
      ],
      tech: [
        { name: 'ARM Holdings', payMult: 1.35, benefits: ['health', 'stock', 'pension'], stability: 0.90, prestige: 5 },
        { name: 'Deliveroo', payMult: 1.15, benefits: ['health', 'wfh'], stability: 0.75, prestige: 4 },
        { name: 'Wise', payMult: 1.20, benefits: ['health', 'stock', 'wfh'], stability: 0.80, prestige: 4 }
      ],
      consulting: [
        { name: 'Capgemini UK', payMult: 1.05, benefits: ['health', 'pension'], stability: 0.85, prestige: 4 },
        { name: 'Oliver Wyman', payMult: 1.30, benefits: ['health', 'bonus'], stability: 0.85, prestige: 5 }
      ],
      law: [
        { name: 'Slaughter and May', payMult: 1.50, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Allen & Overy', payMult: 1.45, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Freshfields', payMult: 1.45, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 }
      ],
      engineering: [
        { name: 'Rolls-Royce', payMult: 1.15, benefits: ['health', 'pension'], stability: 0.85, prestige: 5 },
        { name: 'BAE Systems', payMult: 1.15, benefits: ['health', 'pension'], stability: 0.95, prestige: 5 },
        { name: 'Arup', payMult: 1.10, benefits: ['health', 'pension'], stability: 0.90, prestige: 4 }
      ]
    },
    sau: {
      banking: [
        { name: 'Riyad Bank', payMult: 1.05, benefits: ['health', 'housing', 'bonus'], stability: 0.90, prestige: 4 },
        { name: 'Alinma Bank', payMult: 1.05, benefits: ['health', 'housing'], stability: 0.90, prestige: 4 }
      ],
      engineering: [
        { name: 'Saudi Binladin Group', payMult: 1.05, benefits: ['health', 'housing'], stability: 0.80, prestige: 4 },
        { name: 'Alfanar', payMult: 1.00, benefits: ['health'], stability: 0.85, prestige: 3 },
        { name: 'Diriyah Company', payMult: 1.30, benefits: ['health', 'housing', 'bonus'], stability: 0.95, prestige: 5 }
      ],
      tech: [
        { name: 'Elm', payMult: 1.25, benefits: ['health', 'bonus'], stability: 0.95, prestige: 5 },
        { name: 'Mobily', payMult: 1.15, benefits: ['health', 'bonus'], stability: 0.90, prestige: 4 }
      ],
      consulting: [
        { name: 'PIF (Public Investment Fund)', payMult: 1.60, benefits: ['health', 'housing', 'bonus'], stability: 0.95, prestige: 5 }
      ]
    },
    uae: {
      banking: [
        { name: 'Abu Dhabi Commercial Bank (ADCB)', payMult: 1.10, benefits: ['health', 'housing', 'bonus'], stability: 0.90, prestige: 4 },
        { name: 'Mashreq', payMult: 1.10, benefits: ['health', 'bonus'], stability: 0.85, prestige: 4 }
      ],
      real_estate: [
        { name: 'Aldar Properties', payMult: 1.20, benefits: ['health', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Damac Properties', payMult: 1.15, benefits: ['health', 'bonus'], stability: 0.80, prestige: 4 }
      ],
      aviation: [
        { name: 'Flydubai', payMult: 1.10, benefits: ['health', 'tickets'], stability: 0.85, prestige: 4 },
        { name: 'Air Arabia', payMult: 1.05, benefits: ['health', 'tickets'], stability: 0.85, prestige: 4 }
      ],
      tech: [
        { name: 'Talabat', payMult: 1.15, benefits: ['health', 'bonus'], stability: 0.80, prestige: 4 },
        { name: 'Noon', payMult: 1.10, benefits: ['health'], stability: 0.85, prestige: 4 }
      ],
      hospitals: [
        { name: 'NMC Healthcare', payMult: 1.05, benefits: ['health', 'housing'], stability: 0.80, prestige: 4 },
        { name: 'Aster DM Healthcare', payMult: 1.00, benefits: ['health'], stability: 0.85, prestige: 3 }
      ]
    },
    can: {
      banking: [
        { name: 'Scotiabank', payMult: 1.05, benefits: ['health', 'pension', 'bonus'], stability: 0.95, prestige: 4 },
        { name: 'BMO (Bank of Montreal)', payMult: 1.05, benefits: ['health', 'pension', 'bonus'], stability: 0.95, prestige: 4 },
        { name: 'CIBC', payMult: 1.05, benefits: ['health', 'pension'], stability: 0.95, prestige: 4 }
      ],
      tech: [
        { name: 'Constellation Software', payMult: 1.20, benefits: ['health', 'stock'], stability: 0.90, prestige: 4 },
        { name: 'OpenText', payMult: 1.15, benefits: ['health', 'stock'], stability: 0.85, prestige: 4 },
        { name: 'Hootsuite', payMult: 1.10, benefits: ['health', 'wfh'], stability: 0.80, prestige: 3 }
      ],
      engineering: [
        { name: 'WSP Global', payMult: 1.10, benefits: ['health', 'pension'], stability: 0.90, prestige: 4 },
        { name: 'SNC-Lavalin', payMult: 1.10, benefits: ['health', 'pension'], stability: 0.85, prestige: 4 },
        { name: 'Bombardier', payMult: 1.15, benefits: ['health', 'pension'], stability: 0.80, prestige: 4 }
      ]
    },
    aus: {
      banking: [
        { name: 'Westpac', payMult: 1.10, benefits: ['health', 'pension', 'bonus'], stability: 0.95, prestige: 5 },
        { name: 'ANZ', payMult: 1.10, benefits: ['health', 'pension', 'bonus'], stability: 0.95, prestige: 5 },
        { name: 'NAB', payMult: 1.10, benefits: ['health', 'pension'], stability: 0.95, prestige: 5 }
      ],
      tech: [
        { name: 'Canva', payMult: 1.40, benefits: ['health', 'stock', 'wfh'], stability: 0.85, prestige: 5 },
        { name: 'Afterpay', payMult: 1.25, benefits: ['health', 'stock'], stability: 0.80, prestige: 4 },
        { name: 'REA Group', payMult: 1.20, benefits: ['health', 'bonus'], stability: 0.90, prestige: 4 }
      ],
      mining: [
        { name: 'Rio Tinto', payMult: 1.35, benefits: ['health', 'pension', 'bonus'], stability: 0.85, prestige: 5 },
        { name: 'Fortescue Metals', payMult: 1.30, benefits: ['health', 'bonus'], stability: 0.85, prestige: 5 },
        { name: 'Woodside Energy', payMult: 1.25, benefits: ['health', 'pension'], stability: 0.85, prestige: 4 }
      ]
    },
    deu: {
      tech: [
        { name: 'Zalando', payMult: 1.15, benefits: ['health', 'stock', 'wfh'], stability: 0.85, prestige: 4 },
        { name: 'Delivery Hero', payMult: 1.10, benefits: ['health', 'stock'], stability: 0.75, prestige: 4 },
        { name: 'Infineon', payMult: 1.25, benefits: ['health', 'bonus', 'pension'], stability: 0.90, prestige: 5 }
      ],
      engineering: [
        { name: 'Bosch', payMult: 1.20, benefits: ['health', 'pension', 'bonus'], stability: 0.95, prestige: 5 },
        { name: 'Audi', payMult: 1.20, benefits: ['health', 'pension', 'bonus'], stability: 0.90, prestige: 5 },
        { name: 'Porsche', payMult: 1.30, benefits: ['health', 'pension', 'bonus'], stability: 0.90, prestige: 5 }
      ],
      pharma: [
        { name: 'BioNTech', payMult: 1.30, benefits: ['health', 'bonus', 'stock'], stability: 0.85, prestige: 5 },
        { name: 'Merck KGaA', payMult: 1.20, benefits: ['health', 'pension'], stability: 0.95, prestige: 5 }
      ]
    }
  };

  Object.keys(additions).forEach(function(country) {
    Object.keys(additions[country]).forEach(function(industry) {
      if (!CAR_COMPANIES[country]) CAR_COMPANIES[country] = {};
      if (!CAR_COMPANIES[country][industry]) CAR_COMPANIES[country][industry] = [];
      additions[country][industry].forEach(function(company) {
        var exists = CAR_COMPANIES[country][industry].some(function(c) { return c.name === company.name; });
        if (!exists) CAR_COMPANIES[country][industry].push(company);
      });
    });
  });
})();
