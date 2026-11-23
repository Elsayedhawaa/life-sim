/* ============================================================================
   World Life 2.0 — Normalized World Institutions, Housing, Careers & Cars
   Compiled cleanly across all 15 countries with era launch-year gates.
   ========================================================================== */

export const MAJORS = [
  { id: "medicine", label: "Medicine & Surgery (MBBS)", years: 6, minExam: 91, rigor: 9, tracks: ["medicine"] },
  { id: "dentistry", label: "Oral & Dental Medicine (BDS)", years: 5, minExam: 89, rigor: 8, tracks: ["dentistry"] },
  { id: "pharmacy", label: "Pharmacy & Clinical Biotech", years: 5, minExam: 86, rigor: 8, tracks: ["pharma"] },
  { id: "engineering", label: "Civil, Electrical & Mechanical Engineering", years: 5, minExam: 84, rigor: 8, tracks: ["engineering"] },
  { id: "architecture", label: "Architecture & Urban Design", years: 5, minExam: 82, rigor: 8, tracks: ["architecture", "engineering"] },
  { id: "cs", label: "Computer Science, AI & Cybersecurity", years: 4, minExam: 80, rigor: 8, tracks: ["software", "data"] },
  { id: "physiotherapy", label: "Physical Therapy & Rehabilitation", years: 5, minExam: 78, rigor: 7, tracks: ["physiotherapy"] },
  { id: "veterinary", label: "Veterinary Medicine", years: 5, minExam: 75, rigor: 7, tracks: ["veterinary"] },
  { id: "nursing", label: "Nursing & Critical Care (BSN)", years: 4, minExam: 72, rigor: 7, tracks: ["nursing"] },
  { id: "psychology", label: "Clinical Psychology & Behavioral Science", years: 4, minExam: 68, rigor: 6, tracks: ["psychology"] },
  { id: "business", label: "Finance, Accounting & Business", years: 4, minExam: 66, rigor: 5, tracks: ["finance", "operations"] },
  { id: "law", label: "Law & Jurisprudence (LLB)", years: 4, minExam: 64, rigor: 6, tracks: ["law"] },
  { id: "media", label: "Journalism, Media & Digital Comms", years: 4, minExam: 62, rigor: 5, tracks: ["media"] },
  { id: "education", label: "Education, Arts & Languages", years: 4, minExam: 60, rigor: 4, tracks: ["teaching", "bpo"] },
  { id: "vocational", label: "Technical & Trade Diploma", years: 2, minExam: 45, rigor: 4, tracks: ["trades", "retail"] }
];

export const CAREER_TRACKS = {
  "software": {
    "label": "Software & Cloud Engineering",
    "reqDegrees": [
      "cs",
      "engineering"
    ],
    "payMult": 1.48,
    "remoteFriendly": true,
    "visaDemand": 0.95,
    "rungs": [
      {
        "level": 0,
        "title": "Junior Software Engineer",
        "minExp": 0,
        "mult": 1.0
      },
      {
        "level": 1,
        "title": "Software Engineer II",
        "minExp": 2,
        "mult": 1.55
      },
      {
        "level": 2,
        "title": "Senior Software Engineer",
        "minExp": 5,
        "mult": 2.35
      },
      {
        "level": 3,
        "title": "Staff / Engineering Manager",
        "minExp": 9,
        "mult": 3.3
      },
      {
        "level": 4,
        "title": "VP of Engineering / CTO",
        "minExp": 14,
        "mult": 5.1
      }
    ]
  },
  "medicine": {
    "label": "Hospital Medicine",
    "reqDegrees": [
      "medicine"
    ],
    "payMult": 1.52,
    "remoteFriendly": false,
    "visaDemand": 0.92,
    "rungs": [
      {
        "level": 0,
        "title": "House Officer / Resident Intern",
        "minExp": 0,
        "mult": 0.72
      },
      {
        "level": 1,
        "title": "Resident Physician",
        "minExp": 2,
        "mult": 1.35
      },
      {
        "level": 2,
        "title": "Specialist Physician",
        "minExp": 6,
        "mult": 2.55
      },
      {
        "level": 3,
        "title": "Senior Consultant",
        "minExp": 11,
        "mult": 4.1
      },
      {
        "level": 4,
        "title": "Head of Department",
        "minExp": 16,
        "mult": 5.6
      }
    ]
  },
  "engineering": {
    "label": "Construction, Energy & Industrial Engineering",
    "reqDegrees": [
      "engineering"
    ],
    "payMult": 1.25,
    "remoteFriendly": false,
    "visaDemand": 0.88,
    "rungs": [
      {
        "level": 0,
        "title": "Site / Graduate Engineer",
        "minExp": 0,
        "mult": 0.95
      },
      {
        "level": 1,
        "title": "Project Engineer",
        "minExp": 3,
        "mult": 1.48
      },
      {
        "level": 2,
        "title": "Senior Project Manager",
        "minExp": 6,
        "mult": 2.25
      },
      {
        "level": 3,
        "title": "Engineering Director",
        "minExp": 11,
        "mult": 3.35
      },
      {
        "level": 4,
        "title": "Regional Operations VP",
        "minExp": 16,
        "mult": 4.8
      }
    ]
  },
  "finance": {
    "label": "Banking, Audit & Corporate Finance",
    "reqDegrees": [
      "business",
      "cs"
    ],
    "payMult": 1.28,
    "remoteFriendly": false,
    "visaDemand": 0.72,
    "rungs": [
      {
        "level": 0,
        "title": "Junior Analyst / Teller",
        "minExp": 0,
        "mult": 0.95
      },
      {
        "level": 1,
        "title": "Financial Analyst",
        "minExp": 2,
        "mult": 1.5
      },
      {
        "level": 2,
        "title": "Relationship / Finance Manager",
        "minExp": 5,
        "mult": 2.3
      },
      {
        "level": 3,
        "title": "Associate Director",
        "minExp": 10,
        "mult": 3.5
      },
      {
        "level": 4,
        "title": "Managing Director / CFO",
        "minExp": 15,
        "mult": 5.4
      }
    ]
  },
  "pharma": {
    "label": "Pharmaceuticals & Clinical Research",
    "reqDegrees": [
      "pharmacy",
      "medicine"
    ],
    "payMult": 1.18,
    "remoteFriendly": false,
    "visaDemand": 0.76,
    "rungs": [
      {
        "level": 0,
        "title": "Community / QA Pharmacist",
        "minExp": 0,
        "mult": 0.9
      },
      {
        "level": 1,
        "title": "Medical Rep / Senior Pharmacist",
        "minExp": 2,
        "mult": 1.4
      },
      {
        "level": 2,
        "title": "Regulatory & Clinical Lead",
        "minExp": 5,
        "mult": 2.1
      },
      {
        "level": 3,
        "title": "Regional Pharma Manager",
        "minExp": 9,
        "mult": 3.05
      },
      {
        "level": 4,
        "title": "Commercial Pharma Director",
        "minExp": 14,
        "mult": 4.3
      }
    ]
  },
  "law": {
    "label": "Legal Practice & Corporate Counsel",
    "reqDegrees": [
      "law"
    ],
    "payMult": 1.2,
    "remoteFriendly": false,
    "visaDemand": 0.45,
    "rungs": [
      {
        "level": 0,
        "title": "Trainee / Junior Associate",
        "minExp": 0,
        "mult": 0.85
      },
      {
        "level": 1,
        "title": "Associate Counsel",
        "minExp": 3,
        "mult": 1.45
      },
      {
        "level": 2,
        "title": "Senior Legal Counsel",
        "minExp": 6,
        "mult": 2.35
      },
      {
        "level": 3,
        "title": "Junior Partner",
        "minExp": 11,
        "mult": 3.7
      },
      {
        "level": 4,
        "title": "Managing Partner",
        "minExp": 16,
        "mult": 5.5
      }
    ]
  },
  "teaching": {
    "label": "Education & Academia",
    "reqDegrees": [
      "education",
      "business",
      "cs",
      "engineering"
    ],
    "payMult": 0.88,
    "remoteFriendly": false,
    "visaDemand": 0.68,
    "rungs": [
      {
        "level": 0,
        "title": "Assistant Teacher",
        "minExp": 0,
        "mult": 0.85
      },
      {
        "level": 1,
        "title": "Classroom Subject Teacher",
        "minExp": 2,
        "mult": 1.18
      },
      {
        "level": 2,
        "title": "Senior International Teacher",
        "minExp": 5,
        "mult": 1.65
      },
      {
        "level": 3,
        "title": "Head of Department",
        "minExp": 9,
        "mult": 2.15
      },
      {
        "level": 4,
        "title": "School Principal",
        "minExp": 14,
        "mult": 2.95
      }
    ]
  },
  "bpo": {
    "label": "Multilingual Support & Operations",
    "reqDegrees": [],
    "payMult": 0.92,
    "remoteFriendly": true,
    "visaDemand": 0.3,
    "rungs": [
      {
        "level": 0,
        "title": "Customer Advisor",
        "minExp": 0,
        "mult": 0.95
      },
      {
        "level": 1,
        "title": "Senior Bilingual Specialist",
        "minExp": 2,
        "mult": 1.35
      },
      {
        "level": 2,
        "title": "Operations Team Lead",
        "minExp": 4,
        "mult": 1.8
      },
      {
        "level": 3,
        "title": "Account Operations Manager",
        "minExp": 7,
        "mult": 2.45
      },
      {
        "level": 4,
        "title": "Site Operations Director",
        "minExp": 12,
        "mult": 3.4
      }
    ]
  },
  "trades": {
    "label": "Skilled Trades, Retail & Logistics",
    "reqDegrees": [],
    "payMult": 0.78,
    "remoteFriendly": false,
    "visaDemand": 0.55,
    "rungs": [
      {
        "level": 0,
        "title": "Apprentice / Store Associate",
        "minExp": 0,
        "mult": 0.8
      },
      {
        "level": 1,
        "title": "Technician / Shift Supervisor",
        "minExp": 2,
        "mult": 1.15
      },
      {
        "level": 2,
        "title": "Master Technician / Branch Manager",
        "minExp": 5,
        "mult": 1.6
      },
      {
        "level": 3,
        "title": "Regional Fleet / District Lead",
        "minExp": 9,
        "mult": 2.2
      },
      {
        "level": 4,
        "title": "Operations General Manager",
        "minExp": 14,
        "mult": 2.9
      }
    ]
  }
};

export const EMPLOYERS = {
  "egy": {
    "software": [
      "Fawry",
      "Vodafone Intelligent Solutions (VOIS)",
      "Instabug",
      "Valeo Cairo"
    ],
    "medicine": [
      "Kasr Al Ainy Teaching Hospital",
      "Dar Al Fouad Hospital",
      "As-Salam International"
    ],
    "engineering": [
      "Orascom Construction",
      "Hassan Allam Holding",
      "Elsewedy Electric",
      "Arab Contractors"
    ],
    "finance": [
      "CIB Egypt",
      "National Bank of Egypt",
      "EFG Hermes",
      "PwC Cairo"
    ],
    "pharma": [
      "Eva Pharma",
      "Ibnsina Pharma",
      "EIPICO"
    ],
    "law": [
      "Matouk Bassiouny",
      "Zulficar & Partners",
      "Shalakany Law Office"
    ],
    "teaching": [
      "Cairo British International School",
      "Alsson School",
      "Ministry Directorate"
    ],
    "bpo": [
      "Concentrix Cairo",
      "Teleperformance Egypt",
      "VOIS"
    ],
    "trades": [
      "Spinneys Egypt",
      "B.TECH",
      "Aramex Cairo"
    ]
  },
  "sau": {
    "software": [
      "STC Solutions",
      "Elm Company",
      "Saudi Aramco Digital",
      "Lean Business Services"
    ],
    "medicine": [
      "King Faisal Specialist Hospital",
      "Dr. Sulaiman Al Habib Group",
      "Ministry of Health KSA"
    ],
    "engineering": [
      "Saudi Aramco",
      "SABIC",
      "ROSHN Group",
      "Saudi Binladin / Nesma"
    ],
    "finance": [
      "Saudi National Bank (SNB)",
      "Al Rajhi Bank",
      "Public Investment Fund (PIF) Advisory"
    ],
    "pharma": [
      "SPIMACO",
      "Nahdi Medical",
      "Jamjoom Pharma"
    ],
    "law": [
      "Al Tamimi & Co Riyadh",
      "Khoshaim & Associates"
    ],
    "teaching": [
      "Riyadh International Schools",
      "King Saud Prep Academy"
    ],
    "bpo": [
      "CCC by STC",
      "Emdad"
    ],
    "trades": [
      "Panda Retail",
      "Jarir Bookstore",
      "SAPTCO"
    ]
  },
  "uae": {
    "software": [
      "Careem",
      "Noon Tech",
      "Emirates Group IT",
      "G42 Abu Dhabi"
    ],
    "medicine": [
      "Cleveland Clinic Abu Dhabi",
      "Mediclinic City Hospital Dubai",
      "Rashid Hospital"
    ],
    "engineering": [
      "ADNOC",
      "Emaar Properties",
      "Nakheel",
      "AECOM Middle East"
    ],
    "finance": [
      "Emirates NBD",
      "First Abu Dhabi Bank (FAB)",
      "DIFC Partners"
    ],
    "pharma": [
      "Julphar",
      "Life Pharmacy Group"
    ],
    "law": [
      "Al Tamimi & Co Dubai",
      "Clifford Chance DIFC"
    ],
    "teaching": [
      "GEMS World Academy",
      "Dubai College"
    ],
    "bpo": [
      "Webhelp Dubai",
      "dnata Customer Ops"
    ],
    "trades": [
      "Majid Al Futtaim Retail",
      "Lulu Hypermarket",
      "Aramex Dubai"
    ]
  },
  "gbr": {
    "software": [
      "DeepMind London",
      "Monzo Tech",
      "Revolut",
      "ARM Cambridge"
    ],
    "medicine": [
      "NHS Guy's & St Thomas'",
      "Manchester Royal Infirmary",
      "Bupa Cromwell"
    ],
    "engineering": [
      "Rolls-Royce plc",
      "Arup",
      "Balfour Beatty"
    ],
    "finance": [
      "Barclays",
      "HSBC Canary Wharf",
      "Deloitte UK"
    ],
    "pharma": [
      "AstraZeneca Cambridge",
      "GSK"
    ],
    "law": [
      "Linklaters",
      "Slaughter and May"
    ],
    "teaching": [
      "Westminster Academy",
      "Manchester Grammar"
    ],
    "bpo": [
      "Capita",
      "Sky Customer Group"
    ],
    "trades": [
      "Tesco plc",
      "John Lewis",
      "Royal Mail"
    ]
  },
  "usa": {
    "software": [
      "Google",
      "Microsoft",
      "Stripe",
      "Apple"
    ],
    "medicine": [
      "Mayo Clinic",
      "Mount Sinai Hospital",
      "Mass General"
    ],
    "engineering": [
      "Bechtel",
      "GE Vernova",
      "Texas Instruments"
    ],
    "finance": [
      "JPMorgan Chase",
      "Goldman Sachs",
      "Fidelity"
    ],
    "pharma": [
      "Pfizer",
      "Moderna",
      "Eli Lilly"
    ],
    "law": [
      "Cravath, Swaine & Moore",
      "Latham & Watkins"
    ],
    "teaching": [
      "City Unified School District",
      "Phillips Academy"
    ],
    "bpo": [
      "Concentrix US",
      "Delta Customer Care"
    ],
    "trades": [
      "Costco Wholesale",
      "UPS Logistics",
      "Home Depot"
    ]
  },
  "deu": {
    "software": [
      "SAP",
      "Zalando Tech Berlin",
      "N26 Engineering"
    ],
    "medicine": [
      "Charit\u00e9 Berlin",
      "LMU Klinikum Munich"
    ],
    "engineering": [
      "Siemens",
      "BMW Group",
      "Bosch",
      "BASF"
    ],
    "finance": [
      "Deutsche Bank",
      "Allianz Munich"
    ],
    "pharma": [
      "BioNTech",
      "Bayer"
    ],
    "law": [
      "Hengeler Mueller",
      "Freshfields Frankfurt"
    ],
    "teaching": [
      "Berlin International School",
      "St\u00e4dtisches Gymnasium"
    ],
    "bpo": [
      "Telekom Service",
      "Majorel Berlin"
    ],
    "trades": [
      "REWE Group",
      "DHL Deutsche Post"
    ]
  },
  "can": {
    "software": [
      "Shopify",
      "Cohere Toronto",
      "OpenText"
    ],
    "medicine": [
      "Toronto General Hospital (UHN)",
      "Vancouver General"
    ],
    "engineering": [
      "WSP Global",
      "AtkinsR\u00e9alis",
      "Enbridge"
    ],
    "finance": [
      "Royal Bank of Canada (RBC)",
      "TD Bank",
      "Brookfield"
    ],
    "pharma": [
      "Apotex",
      "Shoppers Drug Health"
    ],
    "law": [
      "McCarthy T\u00e9trault",
      "Blake, Cassels & Graydon"
    ],
    "teaching": [
      "Toronto District School Board",
      "Upper Canada Prep"
    ],
    "bpo": [
      "TELUS Digital",
      "TD Contact Operations"
    ],
    "trades": [
      "Loblaw Companies",
      "Canadian Tire",
      "CN Rail"
    ]
  },
  "aus": {
    "software": [
      "Atlassian",
      "Canva",
      "Google Australia",
      "Afterpay"
    ],
    "medicine": [
      "Royal Melbourne Hospital",
      "Royal Prince Alfred Hospital",
      "St Vincent's Hospital Melbourne"
    ],
    "engineering": [
      "BHP",
      "Rio Tinto",
      "CIMIC Group"
    ],
    "finance": [
      "Commonwealth Bank",
      "Westpac",
      "ANZ",
      "NAB"
    ],
    "pharma": [
      "CSL",
      "Mayne Pharma",
      "Aspen Pharmacare Australia"
    ],
    "law": [
      "King & Wood Mallesons",
      "Allens",
      "Herbert Smith Freehills"
    ],
    "teaching": [
      "University of Melbourne",
      "UNSW",
      "ANU"
    ],
    "bpo": [
      "Probe Group",
      "Concentrix Australia",
      "Datacom"
    ],
    "trades": [
      "Woolworths",
      "Coles",
      "Bunnings"
    ]
  },
  "nld": {
    "software": [
      "ASML",
      "Booking.com",
      "Adyen"
    ],
    "medicine": [
      "Amsterdam UMC",
      "Erasmus MC",
      "UMC Utrecht"
    ],
    "engineering": [
      "ASML",
      "Philips",
      "Shell",
      "Boskalis"
    ],
    "finance": [
      "ING Bank",
      "Rabobank",
      "ABN AMRO"
    ],
    "pharma": [
      "DSM-Firmenich",
      "Janssen Netherlands",
      "Teva Netherlands"
    ],
    "law": [
      "De Brauw Blackstone Westbroek",
      "NautaDutilh",
      "Loyens & Loeff"
    ],
    "teaching": [
      "TU Delft",
      "University of Amsterdam",
      "Leiden University"
    ],
    "bpo": [
      "Teleperformance Netherlands",
      "Concentrix Netherlands",
      "Randstad"
    ],
    "trades": [
      "Albert Heijn",
      "Jumbo",
      "Bol.com"
    ]
  },
  "fra": {
    "software": [
      "Dassault Systèmes",
      "Mistral AI",
      "Dataiku"
    ],
    "medicine": [
      "AP-HP",
      "Institut Gustave Roussy",
      "Hôpital Necker"
    ],
    "engineering": [
      "Airbus",
      "Safran",
      "Vinci"
    ],
    "finance": [
      "BNP Paribas",
      "Société Générale",
      "Crédit Agricole"
    ],
    "pharma": [
      "Sanofi",
      "Servier",
      "Ipsen"
    ],
    "law": [
      "Gide Loyrette Nouel",
      "Bredin Prat",
      "Darrois Villey"
    ],
    "teaching": [
      "Sorbonne",
      "École Polytechnique",
      "Sciences Po"
    ],
    "bpo": [
      "Teleperformance France",
      "Webhelp",
      "Majorel France"
    ],
    "trades": [
      "Carrefour",
      "Leclerc",
      "Decathlon"
    ]
  },
  "jpn": {
    "software": [
      "Sony",
      "Rakuten",
      "Nintendo"
    ],
    "medicine": [
      "University of Tokyo Hospital",
      "Keio University Hospital",
      "St. Luke's International Hospital"
    ],
    "engineering": [
      "Toyota",
      "Hitachi",
      "Mitsubishi Heavy Industries"
    ],
    "finance": [
      "MUFG Bank",
      "SMBC",
      "Mizuho Bank"
    ],
    "pharma": [
      "Takeda",
      "Astellas",
      "Daiichi Sankyo"
    ],
    "law": [
      "Nishimura & Asahi",
      "Mori Hamada & Matsumoto",
      "Anderson Mori & Tomotsune"
    ],
    "teaching": [
      "University of Tokyo",
      "Kyoto University",
      "Waseda University"
    ],
    "bpo": [
      "Transcosmos",
      "Bellsystem24",
      "Relia"
    ],
    "trades": [
      "Aeon",
      "Seven & i Holdings",
      "Lawson"
    ]
  },
  "ita": {
    "software": [
      "Bending Spoons",
      "Ferrari",
      "Engineering Ingegneria Informatica"
    ],
    "medicine": [
      "Policlinico Gemelli",
      "Ospedale San Raffaele",
      "Policlinico di Milano"
    ],
    "engineering": [
      "Leonardo",
      "Fincantieri",
      "Prysmian"
    ],
    "finance": [
      "Intesa Sanpaolo",
      "UniCredit",
      "Banco BPM"
    ],
    "pharma": [
      "Angelini Pharma",
      "Menarini",
      "Recordati"
    ],
    "law": [
      "BonelliErede",
      "Gianni & Origoni",
      "Legance"
    ],
    "teaching": [
      "Sapienza University",
      "Bocconi",
      "Politecnico di Milano"
    ],
    "bpo": [
      "Comdata",
      "Covisian",
      "Transcom Italy"
    ],
    "trades": [
      "Coop Italia",
      "Esselunga",
      "Poste Italiane"
    ]
  },
  "sgp": {
    "software": [
      "Grab",
      "Sea Group",
      "Google Singapore"
    ],
    "medicine": [
      "Singapore General Hospital",
      "Tan Tock Seng Hospital",
      "National University Hospital"
    ],
    "engineering": [
      "ST Engineering",
      "Keppel",
      "Sembcorp"
    ],
    "finance": [
      "DBS Bank",
      "OCBC Bank",
      "UOB"
    ],
    "pharma": [
      "GSK Singapore",
      "MSD Singapore",
      "Novartis Singapore"
    ],
    "law": [
      "Allen & Gledhill",
      "WongPartnership",
      "Rajah & Tann"
    ],
    "teaching": [
      "NUS",
      "NTU",
      "SMU"
    ],
    "bpo": [
      "Concentrix Singapore",
      "Teleperformance Singapore",
      "TDCX"
    ],
    "trades": [
      "FairPrice",
      "Sheng Siong",
      "Singtel"
    ]
  },
  "bra": {
    "software": [
      "Mercado Libre",
      "Nubank",
      "iFood"
    ],
    "medicine": [
      "Hospital das Clínicas São Paulo",
      "Hospital Sírio-Libanês",
      "Hospital Albert Einstein"
    ],
    "engineering": [
      "Petrobras",
      "Vale",
      "Embraer"
    ],
    "finance": [
      "Itaú Unibanco",
      "Bradesco",
      "Banco do Brasil"
    ],
    "pharma": [
      "EMS Pharma",
      "Eurofarma",
      "Aché Laboratórios"
    ],
    "law": [
      "Machado Meyer",
      "Mattos Filho",
      "Pinheiro Neto"
    ],
    "teaching": [
      "USP",
      "Unicamp",
      "FGV"
    ],
    "bpo": [
      "Atento Brasil",
      "Teleperformance Brasil",
      "Concentrix Brasil"
    ],
    "trades": [
      "Magazine Luiza",
      "GPA",
      "Lojas Renner"
    ]
  },
  "ind": {
    "software": [
      "Infosys",
      "TCS",
      "Wipro",
      "Flipkart"
    ],
    "medicine": [
      "AIIMS",
      "Apollo Hospitals",
      "Fortis Healthcare"
    ],
    "engineering": [
      "Larsen & Toubro",
      "Tata Steel",
      "Mahindra & Mahindra"
    ],
    "finance": [
      "HDFC Bank",
      "ICICI Bank",
      "SBI"
    ],
    "pharma": [
      "Sun Pharma",
      "Dr. Reddy's",
      "Cipla"
    ],
    "law": [
      "Cyril Amarchand Mangaldas",
      "Shardul Amarchand Mangaldas",
      "AZB & Partners"
    ],
    "teaching": [
      "IIT Bombay",
      "IIT Delhi",
      "University of Delhi"
    ],
    "bpo": [
      "Genpact",
      "WNS Global Services",
      "Teleperformance India"
    ],
    "trades": [
      "Reliance Retail",
      "DMart",
      "Tata Motors"
    ]
  },
  "che": {
    "software": [
      "Google Zurich",
      "Avaloq",
      "Swisscom"
    ],
    "medicine": [
      "University Hospital Zurich",
      "Geneva University Hospitals",
      "Inselspital Bern"
    ],
    "engineering": [
      "ABB",
      "Stadler Rail",
      "Schindler"
    ],
    "finance": [
      "UBS",
      "Zürcher Kantonalbank",
      "Julius Baer"
    ],
    "pharma": [
      "Novartis",
      "Roche",
      "Lonza"
    ],
    "law": [
      "Lenz & Staehelin",
      "Homburger",
      "Bär & Karrer"
    ],
    "teaching": [
      "ETH Zurich",
      "University of Zurich",
      "EPFL"
    ],
    "bpo": [
      "Swisscom",
      "Adecco Switzerland",
      "Manpower Switzerland"
    ],
    "trades": [
      "Migros",
      "Coop Switzerland",
      "Swiss Post"
    ]
  },
  "swe": {
    "software": [
      "Spotify",
      "Klarna",
      "Ericsson"
    ],
    "medicine": [
      "Karolinska University Hospital",
      "Sahlgrenska University Hospital",
      "Uppsala University Hospital"
    ],
    "engineering": [
      "Volvo Group",
      "Scania",
      "SKF"
    ],
    "finance": [
      "SEB",
      "Handelsbanken",
      "Swedbank"
    ],
    "pharma": [
      "AstraZeneca Sweden",
      "Pfizer Sweden",
      "Octapharma"
    ],
    "law": [
      "Mannheimer Swartling",
      "Vinge",
      "Roschier"
    ],
    "teaching": [
      "Uppsala University",
      "Lund University",
      "KTH Royal Institute of Technology"
    ],
    "bpo": [
      "Transcom",
      "Teleperformance Sweden",
      "Concentrix Sweden"
    ],
    "trades": [
      "ICA Gruppen",
      "H&M",
      "IKEA"
    ]
  },
  "tur": {
    "software": [
      "Turkcell",
      "Trendyol",
      "Getir"
    ],
    "medicine": [
      "Hacettepe University Hospital",
      "Koç University Hospital",
      "Acıbadem"
    ],
    "engineering": [
      "Turkish Airlines Technic",
      "ASELSAN",
      "TUSAŞ"
    ],
    "finance": [
      "Ziraat Bankası",
      "Türkiye İş Bankası",
      "Garanti BBVA"
    ],
    "pharma": [
      "Abdi İbrahim",
      "Bilim İlaç",
      "Nobel İlaç"
    ],
    "law": [
      "Hergüner Bilgen Özeke",
      "Gün + Partners",
      "Moral & Partners"
    ],
    "teaching": [
      "Istanbul University",
      "Middle East Technical University",
      "Boğaziçi University"
    ],
    "bpo": [
      "Turkcell Global Bilgi",
      "Teleperformance Turkey",
      "Concentrix Turkey"
    ],
    "trades": [
      "Migros Turkey",
      "BİM",
      "Arçelik"
    ]
  }
};

export const BUSINESS_TYPES = [
  {
    "id": "cafe",
    "label": "Specialty Caf\u00e9 & Bakery",
    "capitalUsd2026": 18000,
    "monthlyRevUsd2026": 5200,
    "monthlyCostUsd2026": 3600,
    "volatility": 0.25,
    "reqMajor": null,
    "from": 1960,
    "maxLevel": 5
  },
  {
    "id": "retail",
    "label": "Electronics & Trading Shop",
    "capitalUsd2026": 28000,
    "monthlyRevUsd2026": 8400,
    "monthlyCostUsd2026": 5900,
    "volatility": 0.3,
    "reqMajor": null,
    "from": 1960,
    "maxLevel": 5
  },
  {
    "id": "software_studio",
    "label": "Software & Digital Consultancy",
    "capitalUsd2026": 12000,
    "monthlyRevUsd2026": 9500,
    "monthlyCostUsd2026": 5200,
    "volatility": 0.38,
    "reqMajor": "cs",
    "from": 1990,
    "maxLevel": 8
  },
  {
    "id": "clinic",
    "label": "Private Specialist Clinic",
    "capitalUsd2026": 45000,
    "monthlyRevUsd2026": 14500,
    "monthlyCostUsd2026": 8200,
    "volatility": 0.18,
    "reqMajor": "medicine",
    "from": 1960,
    "maxLevel": 6
  },
  {
    "id": "contracting",
    "label": "Interior Finishing & Contracting Firm",
    "capitalUsd2026": 38000,
    "monthlyRevUsd2026": 13000,
    "monthlyCostUsd2026": 8600,
    "volatility": 0.35,
    "reqMajor": "engineering",
    "from": 1960,
    "maxLevel": 6
  }
];

export const CARS_CATALOG = [
  {
    "id": "fiat_128",
    "name": "Fiat 128",
    "tier": "economy",
    "priceUsd2026": 6500,
    "monthlyUpkeepUsd2026": 75,
    "yearFrom": 1969,
    "yearTo": 1998,
    "prestige": 2,
    "reliability": 68
  },
  {
    "id": "peugeot_504",
    "name": "Peugeot 504",
    "tier": "standard",
    "priceUsd2026": 11000,
    "monthlyUpkeepUsd2026": 95,
    "yearFrom": 1968,
    "yearTo": 1995,
    "prestige": 4,
    "reliability": 84
  },
  {
    "id": "merc_w123",
    "name": "Mercedes-Benz 200 (W123)",
    "tier": "luxury",
    "priceUsd2026": 28000,
    "monthlyUpkeepUsd2026": 180,
    "yearFrom": 1976,
    "yearTo": 1986,
    "prestige": 8,
    "reliability": 90
  },
  {
    "id": "corolla_classic",
    "name": "Toyota Corolla (E90/E120)",
    "tier": "standard",
    "priceUsd2026": 15500,
    "monthlyUpkeepUsd2026": 85,
    "yearFrom": 1987,
    "yearTo": 2007,
    "prestige": 5,
    "reliability": 95
  },
  {
    "id": "hyundai_verna",
    "name": "Hyundai Verna / Accent",
    "tier": "economy",
    "priceUsd2026": 11500,
    "monthlyUpkeepUsd2026": 75,
    "yearFrom": 1999,
    "yearTo": 2019,
    "prestige": 3,
    "reliability": 82
  },
  {
    "id": "nissan_sunny",
    "name": "Nissan Sunny / Sentra",
    "tier": "economy",
    "priceUsd2026": 14000,
    "monthlyUpkeepUsd2026": 85,
    "yearFrom": 1995,
    "yearTo": 2099,
    "prestige": 3,
    "reliability": 84
  },
  {
    "id": "corolla_modern",
    "name": "Toyota Corolla",
    "tier": "standard",
    "priceUsd2026": 23000,
    "monthlyUpkeepUsd2026": 110,
    "yearFrom": 2008,
    "yearTo": 2099,
    "prestige": 5,
    "reliability": 96
  },
  {
    "id": "vw_golf",
    "name": "Volkswagen Golf",
    "tier": "standard",
    "priceUsd2026": 27000,
    "monthlyUpkeepUsd2026": 140,
    "yearFrom": 1974,
    "yearTo": 2099,
    "prestige": 6,
    "reliability": 84
  },
  {
    "id": "camry",
    "name": "Toyota Camry",
    "tier": "standard",
    "priceUsd2026": 29500,
    "monthlyUpkeepUsd2026": 125,
    "yearFrom": 1983,
    "yearTo": 2099,
    "prestige": 6,
    "reliability": 95
  },
  {
    "id": "land_cruiser",
    "name": "Toyota Land Cruiser",
    "tier": "luxury",
    "priceUsd2026": 78000,
    "monthlyUpkeepUsd2026": 290,
    "yearFrom": 1980,
    "yearTo": 2099,
    "prestige": 9,
    "reliability": 97
  },
  {
    "id": "nissan_patrol",
    "name": "Nissan Patrol",
    "tier": "luxury",
    "priceUsd2026": 72000,
    "monthlyUpkeepUsd2026": 280,
    "yearFrom": 1980,
    "yearTo": 2099,
    "prestige": 9,
    "reliability": 91
  },
  {
    "id": "bmw_3",
    "name": "BMW 3-Series",
    "tier": "luxury",
    "priceUsd2026": 48000,
    "monthlyUpkeepUsd2026": 260,
    "yearFrom": 1975,
    "yearTo": 2099,
    "prestige": 8,
    "reliability": 78
  },
  {
    "id": "merc_e",
    "name": "Mercedes-Benz E-Class",
    "tier": "luxury",
    "priceUsd2026": 66000,
    "monthlyUpkeepUsd2026": 320,
    "yearFrom": 1985,
    "yearTo": 2099,
    "prestige": 9,
    "reliability": 82
  },
  {
    "id": "tesla_3",
    "name": "Tesla Model 3",
    "tier": "luxury",
    "priceUsd2026": 42000,
    "monthlyUpkeepUsd2026": 130,
    "yearFrom": 2018,
    "yearTo": 2099,
    "prestige": 7,
    "reliability": 83
  },
  {
    "id": "porsche_911",
    "name": "Porsche 911 Carrera",
    "tier": "executive",
    "priceUsd2026": 128000,
    "monthlyUpkeepUsd2026": 580,
    "yearFrom": 1965,
    "yearTo": 2099,
    "prestige": 10,
    "reliability": 86
  }
];

export const BANKS = {
  "egy": [
    {
      "id": "cib",
      "name": "Commercial International Bank",
      "shortName": "CIB",
      "founded": 1975,
      "reputation": 5,
      "savingsRate": 0.025,
      "type": "commercial"
    },
    {
      "id": "nbe",
      "name": "National Bank of Egypt",
      "shortName": "NBE",
      "founded": 1898,
      "reputation": 4,
      "savingsRate": 0.03,
      "type": "state"
    },
    {
      "id": "banque_misr",
      "name": "Banque Misr",
      "shortName": "BM",
      "founded": 1920,
      "reputation": 4,
      "savingsRate": 0.03,
      "type": "state"
    },
    {
      "id": "qnb",
      "name": "QNB Alahli",
      "shortName": "QNB",
      "founded": 1978,
      "reputation": 4,
      "savingsRate": 0.022,
      "type": "commercial"
    },
    {
      "id": "hsbc_egy",
      "name": "HSBC Egypt",
      "shortName": "HSBC",
      "founded": 1982,
      "reputation": 5,
      "savingsRate": 0.01,
      "type": "international"
    },
    {
      "id": "emirates_nbd_egy",
      "name": "Emirates NBD Egypt",
      "shortName": "ENBD",
      "founded": 1977,
      "reputation": 4,
      "savingsRate": 0.02,
      "type": "commercial"
    },
    {
      "id": "banque_du_caire",
      "name": "Banque du Caire",
      "shortName": "BdC",
      "founded": 1952,
      "reputation": 4,
      "savingsRate": 0.028,
      "type": "state"
    },
    {
      "id": "fab_misr",
      "name": "FABMISR",
      "shortName": "FABMISR",
      "founded": 2022,
      "reputation": 4,
      "savingsRate": 0.022,
      "type": "commercial"
    },
    {
      "id": "alexbank",
      "name": "Alexbank (Intesa Sanpaolo)",
      "shortName": "Alexbank",
      "founded": 1957,
      "reputation": 4,
      "savingsRate": 0.02,
      "type": "commercial"
    },
    {
      "id": "aaib",
      "name": "Arab African International Bank",
      "shortName": "AAIB",
      "founded": 1964,
      "reputation": 5,
      "savingsRate": 0.025,
      "type": "commercial"
    },
    {
      "id": "adib_egy",
      "name": "Abu Dhabi Islamic Bank Egypt",
      "shortName": "ADIB",
      "founded": 2007,
      "reputation": 4,
      "savingsRate": 0.024,
      "type": "islamic"
    },
    {
      "id": "credit_agricole",
      "name": "Crédit Agricole Egypt",
      "shortName": "CA Egypt",
      "founded": 2006,
      "reputation": 4,
      "savingsRate": 0.018,
      "type": "international"
    },
    {
      "id": "telda",
      "name": "Telda FinTech",
      "shortName": "Telda",
      "founded": 2021,
      "reputation": 3,
      "savingsRate": 0,
      "type": "neobank"
    },
    {
      "id": "nasser_social",
      "name": "Nasser Social Bank",
      "shortName": "Nasser Social",
      "founded": 1971,
      "reputation": 3,
      "savingsRate": 0.018,
      "type": "state"
    }
  ],
  "sau": [
    {
      "id": "snb",
      "name": "Saudi National Bank",
      "shortName": "SNB",
      "founded": 1953,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "state"
    },
    {
      "id": "al_rajhi",
      "name": "Al Rajhi Bank",
      "shortName": "Al Rajhi",
      "founded": 1957,
      "reputation": 5,
      "savingsRate": 0.02,
      "type": "islamic"
    },
    {
      "id": "riyad",
      "name": "Riyad Bank",
      "shortName": "Riyad",
      "founded": 1957,
      "reputation": 4,
      "savingsRate": 0.018,
      "type": "commercial"
    },
    {
      "id": "sabb",
      "name": "Saudi Awwal Bank",
      "shortName": "SAB",
      "founded": 1978,
      "reputation": 5,
      "savingsRate": 0.016,
      "type": "commercial"
    },
    {
      "id": "alinma",
      "name": "Alinma Bank",
      "shortName": "Alinma",
      "founded": 2006,
      "reputation": 5,
      "savingsRate": 0.022,
      "type": "islamic"
    },
    {
      "id": "aljazira",
      "name": "Bank AlJazira",
      "shortName": "AlJazira",
      "founded": 1975,
      "reputation": 4,
      "savingsRate": 0.018,
      "type": "islamic"
    },
    {
      "id": "stc_bank",
      "name": "STC Bank",
      "shortName": "STC Bank",
      "founded": 2020,
      "reputation": 4,
      "savingsRate": 0.025,
      "type": "neobank"
    }
  ],
  "uae": [
    {
      "id": "emirates_nbd",
      "name": "Emirates NBD",
      "shortName": "ENBD",
      "founded": 1963,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "fab",
      "name": "First Abu Dhabi Bank",
      "shortName": "FAB",
      "founded": 2017,
      "reputation": 5,
      "savingsRate": 0.018,
      "type": "commercial"
    },
    {
      "id": "adcb",
      "name": "Abu Dhabi Commercial Bank",
      "shortName": "ADCB",
      "founded": 1985,
      "reputation": 4,
      "savingsRate": 0.014,
      "type": "commercial"
    },
    {
      "id": "dib",
      "name": "Dubai Islamic Bank",
      "shortName": "DIB",
      "founded": 1975,
      "reputation": 5,
      "savingsRate": 0.022,
      "type": "islamic"
    },
    {
      "id": "mashreq",
      "name": "Mashreq Bank",
      "shortName": "Mashreq",
      "founded": 1967,
      "reputation": 4,
      "savingsRate": 0.02,
      "type": "commercial"
    },
    {
      "id": "wio",
      "name": "Wio Bank",
      "shortName": "Wio",
      "founded": 2022,
      "reputation": 4,
      "savingsRate": 0.05,
      "type": "neobank"
    },
    {
      "id": "cbd",
      "name": "Commercial Bank of Dubai",
      "shortName": "CBD",
      "founded": 1969,
      "reputation": 4,
      "savingsRate": 0.016,
      "type": "commercial"
    },
    {
      "id": "rakbank",
      "name": "RAKBANK",
      "shortName": "RAKBANK",
      "founded": 1976,
      "reputation": 4,
      "savingsRate": 0.018,
      "type": "commercial"
    }
  ],
  "gbr": [
    {
      "id": "hsbc_uk",
      "name": "HSBC UK",
      "shortName": "HSBC",
      "founded": 1865,
      "reputation": 5,
      "savingsRate": 0.02,
      "type": "commercial"
    },
    {
      "id": "barclays",
      "name": "Barclays Bank",
      "shortName": "Barclays",
      "founded": 1690,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "lloyds",
      "name": "Lloyds Bank",
      "shortName": "Lloyds",
      "founded": 1765,
      "reputation": 4,
      "savingsRate": 0.014,
      "type": "commercial"
    },
    {
      "id": "natwest",
      "name": "NatWest",
      "shortName": "NatWest",
      "founded": 1968,
      "reputation": 4,
      "savingsRate": 0.018,
      "type": "commercial"
    },
    {
      "id": "monzo",
      "name": "Monzo Bank",
      "shortName": "Monzo",
      "founded": 2015,
      "reputation": 5,
      "savingsRate": 0.041,
      "type": "neobank"
    },
    {
      "id": "starling",
      "name": "Starling Bank",
      "shortName": "Starling",
      "founded": 2014,
      "reputation": 5,
      "savingsRate": 0.032,
      "type": "neobank"
    },
    {
      "id": "santander_uk",
      "name": "Santander UK",
      "shortName": "Santander",
      "founded": 2010,
      "reputation": 4,
      "savingsRate": 0.016,
      "type": "commercial"
    },
    {
      "id": "nationwide",
      "name": "Nationwide Building Society",
      "shortName": "Nationwide",
      "founded": 1884,
      "reputation": 5,
      "savingsRate": 0.019,
      "type": "building_society"
    }
  ],
  "usa": [
    {
      "id": "chase",
      "name": "JPMorgan Chase Bank",
      "shortName": "Chase",
      "founded": 1799,
      "reputation": 5,
      "savingsRate": 0.0001,
      "type": "commercial"
    },
    {
      "id": "bofa",
      "name": "Bank of America",
      "shortName": "BofA",
      "founded": 1784,
      "reputation": 5,
      "savingsRate": 0.0001,
      "type": "commercial"
    },
    {
      "id": "wells",
      "name": "Wells Fargo Bank",
      "shortName": "Wells",
      "founded": 1852,
      "reputation": 4,
      "savingsRate": 0.0001,
      "type": "commercial"
    },
    {
      "id": "citi",
      "name": "Citibank",
      "shortName": "Citi",
      "founded": 1812,
      "reputation": 4,
      "savingsRate": 0.0005,
      "type": "commercial"
    },
    {
      "id": "ally",
      "name": "Ally Bank",
      "shortName": "Ally",
      "founded": 1919,
      "reputation": 5,
      "savingsRate": 0.0425,
      "type": "neobank"
    },
    {
      "id": "capital_one",
      "name": "Capital One",
      "shortName": "CapOne",
      "founded": 1994,
      "reputation": 4,
      "savingsRate": 0.0415,
      "type": "commercial"
    },
    {
      "id": "marcus",
      "name": "Marcus by Goldman Sachs",
      "shortName": "Marcus",
      "founded": 2016,
      "reputation": 5,
      "savingsRate": 0.044,
      "type": "neobank"
    },
    {
      "id": "schwab",
      "name": "Charles Schwab Bank",
      "shortName": "Schwab",
      "founded": 1971,
      "reputation": 5,
      "savingsRate": 0.0045,
      "type": "wealth"
    },
    {
      "id": "fidelity",
      "name": "Fidelity Cash Management",
      "shortName": "Fidelity",
      "founded": 1946,
      "reputation": 5,
      "savingsRate": 0.048,
      "type": "wealth"
    },
    {
      "id": "amex",
      "name": "American Express",
      "shortName": "Amex",
      "founded": 1850,
      "reputation": 5,
      "savingsRate": 0.0001,
      "type": "commercial"
    },
    {
      "id": "discover",
      "name": "Discover Financial Services",
      "shortName": "Discover",
      "founded": 1985,
      "reputation": 4,
      "savingsRate": 0.04,
      "type": "commercial"
    }
  ],
  "deu": [
    {
      "id": "db",
      "name": "Deutsche Bank",
      "shortName": "DB",
      "founded": 1870,
      "reputation": 5,
      "savingsRate": 0.005,
      "type": "commercial"
    },
    {
      "id": "commerzbank",
      "name": "Commerzbank",
      "shortName": "Commerzbank",
      "founded": 1870,
      "reputation": 4,
      "savingsRate": 0.005,
      "type": "commercial"
    },
    {
      "id": "sparkasse",
      "name": "Sparkasse",
      "shortName": "Sparkasse",
      "founded": 1778,
      "reputation": 5,
      "savingsRate": 0.001,
      "type": "state"
    },
    {
      "id": "n26",
      "name": "N26",
      "shortName": "N26",
      "founded": 2013,
      "reputation": 4,
      "savingsRate": 0.022,
      "type": "neobank"
    },
    {
      "id": "dkb",
      "name": "DKB",
      "shortName": "DKB",
      "founded": 1990,
      "reputation": 4,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "ing_diba",
      "name": "ING-DiBa",
      "shortName": "ING",
      "founded": 1965,
      "reputation": 5,
      "savingsRate": 0.035,
      "type": "commercial"
    }
  ],
  "can": [
    {
      "id": "rbc",
      "name": "Royal Bank of Canada",
      "shortName": "RBC",
      "founded": 1864,
      "reputation": 5,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "td",
      "name": "TD Bank",
      "shortName": "TD",
      "founded": 1955,
      "reputation": 5,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "scotiabank",
      "name": "Scotiabank",
      "shortName": "Scotiabank",
      "founded": 1832,
      "reputation": 5,
      "savingsRate": 0.012,
      "type": "commercial"
    },
    {
      "id": "bmo",
      "name": "Bank of Montreal",
      "shortName": "BMO",
      "founded": 1817,
      "reputation": 4,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "cibc",
      "name": "CIBC",
      "shortName": "CIBC",
      "founded": 1961,
      "reputation": 4,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "tangerine",
      "name": "Tangerine",
      "shortName": "Tangerine",
      "founded": 1997,
      "reputation": 4,
      "savingsRate": 0.04,
      "type": "neobank"
    },
    {
      "id": "simplii",
      "name": "Simplii Financial",
      "shortName": "Simplii",
      "founded": 2017,
      "reputation": 4,
      "savingsRate": 0.035,
      "type": "neobank"
    }
  ],
  "aus": [
    {
      "id": "cba",
      "name": "Commonwealth Bank",
      "shortName": "CommBank",
      "founded": 1911,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "westpac",
      "name": "Westpac",
      "shortName": "Westpac",
      "founded": 1817,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "anz",
      "name": "ANZ Bank",
      "shortName": "ANZ",
      "founded": 1835,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "nab",
      "name": "National Australia Bank",
      "shortName": "NAB",
      "founded": 1858,
      "reputation": 4,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "macquarie",
      "name": "Macquarie Bank",
      "shortName": "Macquarie",
      "founded": 1969,
      "reputation": 4,
      "savingsRate": 0.045,
      "type": "wealth"
    },
    {
      "id": "ing_aus",
      "name": "ING Australia",
      "shortName": "ING",
      "founded": 1999,
      "reputation": 4,
      "savingsRate": 0.05,
      "type": "commercial"
    },
    {
      "id": "ubank",
      "name": "UBank",
      "shortName": "UBank",
      "founded": 2008,
      "reputation": 4,
      "savingsRate": 0.045,
      "type": "neobank"
    }
  ],
  "nld": [
    {
      "id": "ing_nl",
      "name": "ING Bank",
      "shortName": "ING",
      "founded": 1991,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "rabobank",
      "name": "Rabobank",
      "shortName": "Rabobank",
      "founded": 1898,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "abn_amro",
      "name": "ABN AMRO",
      "shortName": "ABN AMRO",
      "founded": 1991,
      "reputation": 4,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "bunq",
      "name": "bunq",
      "shortName": "bunq",
      "founded": 2012,
      "reputation": 4,
      "savingsRate": 0.024,
      "type": "neobank"
    },
    {
      "id": "sns_bank",
      "name": "SNS Bank",
      "shortName": "SNS",
      "founded": 1817,
      "reputation": 4,
      "savingsRate": 0.017,
      "type": "commercial"
    }
  ],
  "fra": [
    {
      "id": "bnpp",
      "name": "BNP Paribas",
      "shortName": "BNPP",
      "founded": 2000,
      "reputation": 5,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "socgen",
      "name": "Soci\u00e9t\u00e9 G\u00e9n\u00e9rale",
      "shortName": "SocGen",
      "founded": 1864,
      "reputation": 5,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "credit_agricole_fra",
      "name": "Cr\u00e9dit Agricole",
      "shortName": "Cr\u00e9dit Agricole",
      "founded": 1894,
      "reputation": 5,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "bpce",
      "name": "Groupe BPCE",
      "shortName": "BPCE",
      "founded": 2009,
      "reputation": 4,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "boursobank",
      "name": "BoursoBank",
      "shortName": "BoursoBank",
      "founded": 1995,
      "reputation": 4,
      "savingsRate": 0.025,
      "type": "neobank"
    },
    {
      "id": "hello_bank",
      "name": "Hello bank!",
      "shortName": "Hello bank!",
      "founded": 2013,
      "reputation": 4,
      "savingsRate": 0.02,
      "type": "neobank"
    }
  ],
  "jpn": [
    {
      "id": "mufg",
      "name": "MUFG Bank",
      "shortName": "MUFG",
      "founded": 2006,
      "reputation": 5,
      "savingsRate": 1e-05,
      "type": "commercial"
    },
    {
      "id": "smbc",
      "name": "SMBC",
      "shortName": "SMBC",
      "founded": 2001,
      "reputation": 5,
      "savingsRate": 1e-05,
      "type": "commercial"
    },
    {
      "id": "mizuho",
      "name": "Mizuho Bank",
      "shortName": "Mizuho",
      "founded": 2002,
      "reputation": 5,
      "savingsRate": 1e-05,
      "type": "commercial"
    },
    {
      "id": "jp_post",
      "name": "Japan Post Bank",
      "shortName": "JP Post",
      "founded": 2006,
      "reputation": 5,
      "savingsRate": 1e-05,
      "type": "state"
    },
    {
      "id": "rakuten_bank",
      "name": "Rakuten Bank",
      "shortName": "Rakuten",
      "founded": 2001,
      "reputation": 4,
      "savingsRate": 0.0002,
      "type": "neobank"
    },
    {
      "id": "sbi_sumishin",
      "name": "SBI Sumishin Net Bank",
      "shortName": "SBI Sumishin",
      "founded": 2007,
      "reputation": 4,
      "savingsRate": 0.0001,
      "type": "neobank"
    }
  ],
  "ita": [
    {
      "id": "isp",
      "name": "Intesa Sanpaolo",
      "shortName": "ISP",
      "founded": 2007,
      "reputation": 5,
      "savingsRate": 0.005,
      "type": "commercial"
    },
    {
      "id": "unicredit",
      "name": "UniCredit",
      "shortName": "UniCredit",
      "founded": 1998,
      "reputation": 5,
      "savingsRate": 0.005,
      "type": "commercial"
    },
    {
      "id": "cdp",
      "name": "Cassa Depositi e Prestiti",
      "shortName": "CDP",
      "founded": 1850,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "state"
    },
    {
      "id": "bpm",
      "name": "Banco BPM",
      "shortName": "BPM",
      "founded": 2017,
      "reputation": 4,
      "savingsRate": 0.005,
      "type": "commercial"
    },
    {
      "id": "illimity",
      "name": "illimity Bank",
      "shortName": "illimity",
      "founded": 2018,
      "reputation": 4,
      "savingsRate": 0.03,
      "type": "neobank"
    },
    {
      "id": "fineco",
      "name": "FinecoBank",
      "shortName": "Fineco",
      "founded": 1999,
      "reputation": 4,
      "savingsRate": 0.01,
      "type": "wealth"
    }
  ],
  "sgp": [
    {
      "id": "dbs",
      "name": "DBS Bank",
      "shortName": "DBS",
      "founded": 1968,
      "reputation": 5,
      "savingsRate": 0.0005,
      "type": "commercial"
    },
    {
      "id": "ocbc",
      "name": "OCBC Bank",
      "shortName": "OCBC",
      "founded": 1932,
      "reputation": 5,
      "savingsRate": 0.0005,
      "type": "commercial"
    },
    {
      "id": "uob",
      "name": "UOB",
      "shortName": "UOB",
      "founded": 1935,
      "reputation": 5,
      "savingsRate": 0.0005,
      "type": "commercial"
    },
    {
      "id": "scb_sgp",
      "name": "Standard Chartered",
      "shortName": "SCB",
      "founded": 1859,
      "reputation": 4,
      "savingsRate": 0.001,
      "type": "international"
    },
    {
      "id": "citi_sgp",
      "name": "Citibank Singapore",
      "shortName": "Citi",
      "founded": 1902,
      "reputation": 4,
      "savingsRate": 0.001,
      "type": "international"
    },
    {
      "id": "trust_bank",
      "name": "Trust Bank",
      "shortName": "Trust",
      "founded": 2022,
      "reputation": 4,
      "savingsRate": 0.02,
      "type": "neobank"
    }
  ],
  "bra": [
    {
      "id": "itau",
      "name": "Ita\u00fa Unibanco",
      "shortName": "Ita\u00fa",
      "founded": 1945,
      "reputation": 5,
      "savingsRate": 0.06,
      "type": "commercial"
    },
    {
      "id": "bradesco",
      "name": "Banco Bradesco",
      "shortName": "Bradesco",
      "founded": 1943,
      "reputation": 5,
      "savingsRate": 0.06,
      "type": "commercial"
    },
    {
      "id": "bb",
      "name": "Banco do Brasil",
      "shortName": "BB",
      "founded": 1808,
      "reputation": 5,
      "savingsRate": 0.06,
      "type": "state"
    },
    {
      "id": "caixa",
      "name": "Caixa Econ\u00f4mica Federal",
      "shortName": "Caixa",
      "founded": 1861,
      "reputation": 5,
      "savingsRate": 0.06,
      "type": "state"
    },
    {
      "id": "nubank",
      "name": "Nubank",
      "shortName": "Nubank",
      "founded": 2013,
      "reputation": 5,
      "savingsRate": 0.1,
      "type": "neobank"
    },
    {
      "id": "inter",
      "name": "Banco Inter",
      "shortName": "Inter",
      "founded": 1994,
      "reputation": 4,
      "savingsRate": 0.09,
      "type": "neobank"
    },
    {
      "id": "c6",
      "name": "C6 Bank",
      "shortName": "C6",
      "founded": 2018,
      "reputation": 4,
      "savingsRate": 0.095,
      "type": "neobank"
    }
  ],
  "ind": [
    {
      "id": "sbi",
      "name": "State Bank of India",
      "shortName": "SBI",
      "founded": 1955,
      "reputation": 5,
      "savingsRate": 0.027,
      "type": "state"
    },
    {
      "id": "hdfc",
      "name": "HDFC Bank",
      "shortName": "HDFC",
      "founded": 1994,
      "reputation": 5,
      "savingsRate": 0.03,
      "type": "commercial"
    },
    {
      "id": "icici",
      "name": "ICICI Bank",
      "shortName": "ICICI",
      "founded": 1994,
      "reputation": 5,
      "savingsRate": 0.03,
      "type": "commercial"
    },
    {
      "id": "axis",
      "name": "Axis Bank",
      "shortName": "Axis",
      "founded": 1993,
      "reputation": 4,
      "savingsRate": 0.03,
      "type": "commercial"
    },
    {
      "id": "kotak",
      "name": "Kotak Mahindra Bank",
      "shortName": "Kotak",
      "founded": 1985,
      "reputation": 4,
      "savingsRate": 0.035,
      "type": "commercial"
    },
    {
      "id": "jupiter",
      "name": "Jupiter",
      "shortName": "Jupiter",
      "founded": 2019,
      "reputation": 3,
      "savingsRate": 0.04,
      "type": "neobank"
    },
    {
      "id": "fi_money",
      "name": "Fi Money",
      "shortName": "Fi",
      "founded": 2019,
      "reputation": 3,
      "savingsRate": 0.035,
      "type": "neobank"
    }
  ],
  "che": [
    {
      "id": "ubs",
      "name": "UBS",
      "shortName": "UBS",
      "founded": 1862,
      "reputation": 5,
      "savingsRate": 0.008,
      "type": "commercial"
    },
    {
      "id": "zkb",
      "name": "Zürcher Kantonalbank",
      "shortName": "ZKB",
      "founded": 1870,
      "reputation": 4,
      "savingsRate": 0.012,
      "type": "state"
    },
    {
      "id": "raiffeisen_ch",
      "name": "Raiffeisen Schweiz",
      "shortName": "Raiffeisen",
      "founded": 1902,
      "reputation": 4,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "postfinance",
      "name": "PostFinance",
      "shortName": "PostFinance",
      "founded": 1906,
      "reputation": 4,
      "savingsRate": 0.005,
      "type": "commercial"
    },
    {
      "id": "julius_baer",
      "name": "Julius Baer",
      "shortName": "Julius Baer",
      "founded": 1890,
      "reputation": 5,
      "savingsRate": 0.006,
      "type": "wealth"
    },
    {
      "id": "pictet",
      "name": "Pictet",
      "shortName": "Pictet",
      "founded": 1805,
      "reputation": 5,
      "savingsRate": 0.004,
      "type": "wealth"
    }
  ],
  "swe": [
    {
      "id": "seb",
      "name": "Skandinaviska Enskilda Banken (SEB)",
      "shortName": "SEB",
      "founded": 1856,
      "reputation": 5,
      "savingsRate": 0.015,
      "type": "commercial"
    },
    {
      "id": "handelsbanken",
      "name": "Svenska Handelsbanken",
      "shortName": "Handelsbanken",
      "founded": 1871,
      "reputation": 5,
      "savingsRate": 0.012,
      "type": "commercial"
    },
    {
      "id": "swedbank",
      "name": "Swedbank",
      "shortName": "Swedbank",
      "founded": 1820,
      "reputation": 4,
      "savingsRate": 0.012,
      "type": "commercial"
    },
    {
      "id": "nordea_se",
      "name": "Nordea",
      "shortName": "Nordea",
      "founded": 1997,
      "reputation": 5,
      "savingsRate": 0.01,
      "type": "commercial"
    },
    {
      "id": "sbab",
      "name": "SBAB Bank",
      "shortName": "SBAB",
      "founded": 1985,
      "reputation": 4,
      "savingsRate": 0.018,
      "type": "commercial"
    },
    {
      "id": "lansforsakringar",
      "name": "Länsförsäkringar Bank",
      "shortName": "Länsförsäkringar",
      "founded": 1996,
      "reputation": 4,
      "savingsRate": 0.015,
      "type": "commercial"
    }
  ],
  "tur": [
    {
      "id": "ziraat",
      "name": "Ziraat Bankası",
      "shortName": "Ziraat",
      "founded": 1863,
      "reputation": 4,
      "savingsRate": 0.25,
      "type": "state"
    },
    {
      "id": "isbank",
      "name": "Türkiye İş Bankası",
      "shortName": "İşbank",
      "founded": 1924,
      "reputation": 5,
      "savingsRate": 0.24,
      "type": "commercial"
    },
    {
      "id": "garanti",
      "name": "Garanti BBVA",
      "shortName": "Garanti BBVA",
      "founded": 1946,
      "reputation": 5,
      "savingsRate": 0.24,
      "type": "commercial"
    },
    {
      "id": "akbank",
      "name": "Akbank",
      "shortName": "Akbank",
      "founded": 1948,
      "reputation": 5,
      "savingsRate": 0.24,
      "type": "commercial"
    },
    {
      "id": "yapi_kredi",
      "name": "Yapı Kredi",
      "shortName": "Yapı Kredi",
      "founded": 1944,
      "reputation": 4,
      "savingsRate": 0.23,
      "type": "commercial"
    },
    {
      "id": "halkbank",
      "name": "Halkbank",
      "shortName": "Halkbank",
      "founded": 1933,
      "reputation": 4,
      "savingsRate": 0.22,
      "type": "state"
    }
  ]
};

export const UNIVERSITIES = {
  "egy": [
    {
      "id": "egy_cairo",
      "name": "Cairo University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 78,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_alex",
      "name": "Alexandria University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 75,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_ain",
      "name": "Ain Shams University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 72,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_auc",
      "name": "American University in Cairo",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 600000,
      "cutoff": 60,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_guc",
      "name": "German University in Cairo",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 300000,
      "cutoff": 60,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_bue",
      "name": "British University in Egypt",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 250000,
      "cutoff": 58,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_aastmt",
      "name": "Arab Academy for Science & Tech",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 200000,
      "cutoff": 55,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_miu",
      "name": "Misr International University",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 200000,
      "cutoff": 55,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_msa",
      "name": "Modern Sciences and Arts University",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 220000,
      "cutoff": 56,
      "prestige": 7,
      "founded": 1996,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_must",
      "name": "Misr University for Science and Technology",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 220000,
      "cutoff": 55,
      "prestige": 7,
      "founded": 1996,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "egy_october",
      "name": "6 October University",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 190000,
      "cutoff": 55,
      "prestige": 7,
      "founded": 1996,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-mansoura",
      "name": "Mansoura University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 69,
      "prestige": 7,
      "founded": 1972,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-tanta",
      "name": "Tanta University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 69,
      "prestige": 6,
      "founded": 1972,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-zagazig",
      "name": "Zagazig University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 69,
      "prestige": 6,
      "founded": 1974,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-helwan",
      "name": "Helwan University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 69,
      "prestige": 6,
      "founded": 1975,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-assiut",
      "name": "Assiut University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 74,
      "prestige": 7,
      "founded": 1957,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-menoufia",
      "name": "Menoufia University",
      "country": "egy",
      "sector": "public",
      "annualTuition2026": 3000,
      "cutoff": 69,
      "prestige": 6,
      "founded": 1976,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-nile",
      "name": "Nile University",
      "country": "egy",
      "sector": "private",
      "annualTuition2026": 502470,
      "cutoff": 74,
      "prestige": 8,
      "founded": 2006,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "sau": [
    {
      "id": "sau_ksu",
      "name": "King Saud University",
      "country": "sau",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 75,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Domestic public-study game budget, not a fee quote. Evening, international and specialist programmes may charge fees."
    },
    {
      "id": "sau_kfupm",
      "name": "KFUPM",
      "country": "sau",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 85,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Domestic public-study game budget, not a fee quote. Evening, international and specialist programmes may charge fees."
    },
    {
      "id": "sau_kaust",
      "name": "KAUST",
      "country": "sau",
      "sector": "private",
      "annualTuition2026": 80000,
      "cutoff": 90,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate.",
      "undergraduate": false
    },
    {
      "id": "x-uni-kau",
      "name": "King Abdulaziz University",
      "country": "sau",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 69,
      "prestige": 8,
      "founded": 1967,
      "feeBasis": "Domestic public-study game budget, not a fee quote. Evening, international and specialist programmes may charge fees."
    }
  ],
  "uae": [
    {
      "id": "uae_uaeu",
      "name": "UAE University",
      "country": "uae",
      "sector": "public",
      "annualTuition2026": 20000,
      "cutoff": 70,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "uae_aus",
      "name": "American University of Sharjah",
      "country": "uae",
      "sector": "private",
      "annualTuition2026": 95000,
      "cutoff": 75,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "uae_nyuad",
      "name": "NYU Abu Dhabi",
      "country": "uae",
      "sector": "private",
      "annualTuition2026": 220000,
      "cutoff": 92,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "uae_khalifa",
      "name": "Khalifa University",
      "country": "uae",
      "sector": "independent",
      "annualTuition2026": 95000,
      "cutoff": 85,
      "prestige": 9,
      "founded": 2007,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate.",
      "sectorLabel": "Independent non-profit"
    }
  ],
  "gbr": [
    {
      "id": "gbr_ucl",
      "name": "UCL",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 80,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "gbr_imperial",
      "name": "Imperial College",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 88,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "gbr_oxbridge",
      "name": "University of Oxford",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 95,
      "prestige": 9,
      "founded": 1096,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "x3-uni-st-andrews",
      "name": "University of St Andrews",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 80,
      "prestige": 9,
      "founded": 1413,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "x3-uni-warwick",
      "name": "University of Warwick",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1965,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "x-uni-edinburgh",
      "name": "University of Edinburgh",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 83,
      "prestige": 10,
      "founded": 1582,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "x-uni-manchester",
      "name": "University of Manchester",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1824,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "x-uni-kings",
      "name": "King's College London",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 80,
      "prestige": 9,
      "founded": 1829,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "x-uni-bristol",
      "name": "University of Bristol",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1909,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "x-uni-durham",
      "name": "Durham University",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1832,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    },
    {
      "id": "x-uni-glasgow",
      "name": "University of Glasgow",
      "country": "gbr",
      "sector": "public",
      "annualTuition2026": 9790,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1451,
      "feeBasis": "England home-fee cap reference for 2026/27, used as a simplified game budget. Other UK nations, residency and years have different rules; not a university quote.",
      "sectorLabel": "Publicly funded, independent"
    }
  ],
  "usa": [
    {
      "id": "usa_state",
      "name": "Fictional State University",
      "country": "usa",
      "sector": "public",
      "annualTuition2026": 15000,
      "cutoff": 60,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate.",
      "fictional": true
    },
    {
      "id": "usa_uc_berkeley",
      "name": "UC Berkeley",
      "country": "usa",
      "sector": "public",
      "annualTuition2026": 15000,
      "cutoff": 85,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "usa_harvard",
      "name": "Harvard",
      "country": "usa",
      "sector": "private",
      "annualTuition2026": 60000,
      "cutoff": 90,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "usa_mit",
      "name": "MIT",
      "country": "usa",
      "sector": "private",
      "annualTuition2026": 62000,
      "cutoff": 92,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "usa_stanford",
      "name": "Stanford",
      "country": "usa",
      "sector": "private",
      "annualTuition2026": 62000,
      "cutoff": 90,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x3-uni-michigan",
      "name": "University of Michigan",
      "country": "usa",
      "sector": "public",
      "annualTuition2026": 15000,
      "cutoff": 85,
      "prestige": 9,
      "founded": 1817,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x3-uni-texas-austin",
      "name": "University of Texas at Austin",
      "country": "usa",
      "sector": "public",
      "annualTuition2026": 15000,
      "cutoff": 80,
      "prestige": 9,
      "founded": 1883,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-yale",
      "name": "Yale University",
      "country": "usa",
      "sector": "private",
      "annualTuition2026": 62000,
      "cutoff": 90,
      "prestige": 10,
      "founded": 1701,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-princeton",
      "name": "Princeton University",
      "country": "usa",
      "sector": "private",
      "annualTuition2026": 60000,
      "cutoff": 90,
      "prestige": 10,
      "founded": 1746,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-columbia",
      "name": "Columbia University",
      "country": "usa",
      "sector": "private",
      "annualTuition2026": 65000,
      "cutoff": 87,
      "prestige": 10,
      "founded": 1754,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-ucla",
      "name": "University of California, Los Angeles (UCLA)",
      "country": "usa",
      "sector": "public",
      "annualTuition2026": 15000,
      "cutoff": 83,
      "prestige": 9,
      "founded": 1919,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-nyu",
      "name": "New York University (NYU)",
      "country": "usa",
      "sector": "private",
      "annualTuition2026": 58000,
      "cutoff": 83,
      "prestige": 9,
      "founded": 1831,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-chicago",
      "name": "University of Chicago",
      "country": "usa",
      "sector": "private",
      "annualTuition2026": 62000,
      "cutoff": 87,
      "prestige": 10,
      "founded": 1890,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "deu": [
    {
      "id": "deu_tum",
      "name": "TU Munich",
      "country": "deu",
      "sector": "public",
      "annualTuition2026": 600,
      "cutoff": 80,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "deu_heidelberg",
      "name": "Heidelberg University",
      "country": "deu",
      "sector": "public",
      "annualTuition2026": 600,
      "cutoff": 82,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "deu_lmu",
      "name": "LMU Munich",
      "country": "deu",
      "sector": "public",
      "annualTuition2026": 600,
      "cutoff": 80,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x3-uni-hamburg",
      "name": "University of Hamburg",
      "country": "deu",
      "sector": "public",
      "annualTuition2026": 600,
      "cutoff": 69,
      "prestige": 8,
      "founded": 1919,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-rwth",
      "name": "RWTH Aachen University",
      "country": "deu",
      "sector": "public",
      "annualTuition2026": 600,
      "cutoff": 74,
      "prestige": 9,
      "founded": 1870,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-freiburg",
      "name": "University of Freiburg",
      "country": "deu",
      "sector": "public",
      "annualTuition2026": 600,
      "cutoff": 69,
      "prestige": 9,
      "founded": 1457,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-bonn",
      "name": "University of Bonn",
      "country": "deu",
      "sector": "public",
      "annualTuition2026": 600,
      "cutoff": 69,
      "prestige": 9,
      "founded": 1818,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "can": [
    {
      "id": "can_mcgill",
      "name": "McGill University",
      "country": "can",
      "sector": "public",
      "annualTuition2026": 8500,
      "cutoff": 80,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "can_ubc",
      "name": "UBC",
      "country": "can",
      "sector": "public",
      "annualTuition2026": 8500,
      "cutoff": 82,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "can_uoft",
      "name": "University of Toronto",
      "country": "can",
      "sector": "public",
      "annualTuition2026": 8500,
      "cutoff": 85,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x3-uni-queens",
      "name": "Queen's University",
      "country": "can",
      "sector": "public",
      "annualTuition2026": 8500,
      "cutoff": 76,
      "prestige": 8,
      "founded": 1841,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-waterloo",
      "name": "University of Waterloo",
      "country": "can",
      "sector": "public",
      "annualTuition2026": 8500,
      "cutoff": 80,
      "prestige": 9,
      "founded": 1957,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-alberta",
      "name": "University of Alberta",
      "country": "can",
      "sector": "public",
      "annualTuition2026": 8500,
      "cutoff": 76,
      "prestige": 8,
      "founded": 1908,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-mcmaster",
      "name": "McMaster University",
      "country": "can",
      "sector": "public",
      "annualTuition2026": 8500,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1887,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "aus": [
    {
      "id": "aus_unsw",
      "name": "UNSW",
      "country": "aus",
      "sector": "public",
      "annualTuition2026": 10000,
      "cutoff": 75,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "aus_usyd",
      "name": "University of Sydney",
      "country": "aus",
      "sector": "public",
      "annualTuition2026": 10000,
      "cutoff": 80,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "aus_unimelb",
      "name": "University of Melbourne",
      "country": "aus",
      "sector": "public",
      "annualTuition2026": 10000,
      "cutoff": 82,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "anu",
      "name": "Australian National University",
      "country": "aus",
      "sector": "public",
      "annualTuition2026": 10000,
      "cutoff": 80,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-queensland",
      "name": "University of Queensland",
      "country": "aus",
      "sector": "public",
      "annualTuition2026": 10000,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1909,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "nld": [
    {
      "id": "nld_leiden",
      "name": "Leiden University",
      "country": "nld",
      "sector": "public",
      "annualTuition2026": 2694,
      "cutoff": 75,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "2026/27 statutory-fee reference for eligible EEA/Swiss/Surinam students, used as a game budget. Institutional/non-EEA fees and second degrees differ."
    },
    {
      "id": "nld_amsterdam",
      "name": "University of Amsterdam",
      "country": "nld",
      "sector": "public",
      "annualTuition2026": 2694,
      "cutoff": 78,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "2026/27 statutory-fee reference for eligible EEA/Swiss/Surinam students, used as a game budget. Institutional/non-EEA fees and second degrees differ."
    },
    {
      "id": "nld_delft",
      "name": "TU Delft",
      "country": "nld",
      "sector": "public",
      "annualTuition2026": 2694,
      "cutoff": 82,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "2026/27 statutory-fee reference for eligible EEA/Swiss/Surinam students, used as a game budget. Institutional/non-EEA fees and second degrees differ."
    },
    {
      "id": "x-uni-utrecht",
      "name": "Utrecht University",
      "country": "nld",
      "sector": "public",
      "annualTuition2026": 2694,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1636,
      "feeBasis": "2026/27 statutory-fee reference for eligible EEA/Swiss/Surinam students, used as a game budget. Institutional/non-EEA fees and second degrees differ."
    }
  ],
  "fra": [
    {
      "id": "fra_sorbonne",
      "name": "Sorbonne Université",
      "country": "fra",
      "sector": "public",
      "annualTuition2026": 178,
      "cutoff": 75,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Public Licence registration-fee reference used as a game budget. CVEC, international differentiated fees, exemptions and specialist-school charges are not simulated."
    },
    {
      "id": "fra_polytechnique",
      "name": "École Polytechnique",
      "country": "fra",
      "sector": "public",
      "annualTuition2026": 178,
      "cutoff": 92,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Public Licence registration-fee reference used as a game budget. CVEC, international differentiated fees, exemptions and specialist-school charges are not simulated."
    },
    {
      "id": "fra_hec",
      "name": "HEC Paris",
      "country": "fra",
      "sector": "private",
      "annualTuition2026": 25000,
      "cutoff": 88,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x3-uni-lyon",
      "name": "University of Lyon",
      "country": "fra",
      "sector": "public",
      "annualTuition2026": 178,
      "cutoff": 69,
      "prestige": 7,
      "founded": 1559,
      "feeBasis": "Public Licence registration-fee reference used as a game budget. CVEC, international differentiated fees, exemptions and specialist-school charges are not simulated."
    },
    {
      "id": "x-uni-sciences-po",
      "name": "Sciences Po",
      "country": "fra",
      "sector": "independent",
      "sectorLabel": "Public institute / private foundation",
      "annualTuition2026": 12880,
      "cutoff": 80,
      "prestige": 9,
      "founded": 1872,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-ens",
      "name": "École Normale Supérieure (ENS)",
      "country": "fra",
      "sector": "public",
      "annualTuition2026": 178,
      "cutoff": 85,
      "prestige": 10,
      "founded": 1794,
      "feeBasis": "Public Licence registration-fee reference used as a game budget. CVEC, international differentiated fees, exemptions and specialist-school charges are not simulated."
    },
    {
      "id": "x-uni-strasbourg",
      "name": "University of Strasbourg",
      "country": "fra",
      "sector": "public",
      "annualTuition2026": 178,
      "cutoff": 69,
      "prestige": 8,
      "founded": 1538,
      "feeBasis": "Public Licence registration-fee reference used as a game budget. CVEC, international differentiated fees, exemptions and specialist-school charges are not simulated."
    }
  ],
  "jpn": [
    {
      "id": "jpn_tokyo",
      "name": "University of Tokyo",
      "country": "jpn",
      "sector": "public",
      "annualTuition2026": 550000,
      "cutoff": 92,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "jpn_kyoto",
      "name": "Kyoto University",
      "country": "jpn",
      "sector": "public",
      "annualTuition2026": 550000,
      "cutoff": 88,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "jpn_waseda",
      "name": "Waseda University",
      "country": "jpn",
      "sector": "private",
      "annualTuition2026": 1200000,
      "cutoff": 80,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-osaka",
      "name": "Osaka University",
      "country": "jpn",
      "sector": "public",
      "annualTuition2026": 550000,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1931,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "ita": [
    {
      "id": "ita_sapienza",
      "name": "Sapienza University",
      "country": "ita",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 75,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "ita_polimi",
      "name": "Politecnico di Milano",
      "country": "ita",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 82,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "ita_bocconi",
      "name": "Bocconi University",
      "country": "ita",
      "sector": "private",
      "annualTuition2026": 14000,
      "cutoff": 85,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-bologna",
      "name": "University of Bologna",
      "country": "ita",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 69,
      "prestige": 8,
      "founded": 1088,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "x-uni-milan",
      "name": "University of Milan",
      "country": "ita",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 69,
      "prestige": 8,
      "founded": 1924,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "sgp": [
    {
      "id": "sgp_nus",
      "name": "NUS",
      "country": "sgp",
      "sector": "public",
      "annualTuition2026": 10000,
      "cutoff": 90,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Rounded local subsidised-course game budget. Tuition Grant eligibility, programme-specific fees and service bonds are not simulated.",
      "sectorLabel": "Autonomous university"
    },
    {
      "id": "sgp_ntu",
      "name": "NTU",
      "country": "sgp",
      "sector": "public",
      "annualTuition2026": 10000,
      "cutoff": 88,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Rounded local subsidised-course game budget. Tuition Grant eligibility, programme-specific fees and service bonds are not simulated.",
      "sectorLabel": "Autonomous university"
    },
    {
      "id": "sgp_smu",
      "name": "SMU",
      "country": "sgp",
      "sector": "public",
      "annualTuition2026": 10000,
      "cutoff": 85,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Rounded local subsidised-course game budget. Tuition Grant eligibility, programme-specific fees and service bonds are not simulated.",
      "sectorLabel": "Autonomous university"
    }
  ],
  "bra": [
    {
      "id": "bra_usp",
      "name": "USP",
      "country": "bra",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 85,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "bra_unicamp",
      "name": "Unicamp",
      "country": "bra",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 82,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "bra_fgv",
      "name": "FGV",
      "country": "bra",
      "sector": "private",
      "annualTuition2026": 40000,
      "cutoff": 80,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "ind": [
    {
      "id": "ind_iit",
      "name": "Fictional Institute of Technology",
      "country": "ind",
      "sector": "public",
      "annualTuition2026": 150000,
      "cutoff": 95,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate.",
      "fictional": true
    },
    {
      "id": "ind_nit",
      "name": "Fictional National Technology Institute",
      "country": "ind",
      "sector": "public",
      "annualTuition2026": 150000,
      "cutoff": 88,
      "prestige": 9,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate.",
      "fictional": true
    },
    {
      "id": "ind_private_uni",
      "name": "Fictional Private University",
      "country": "ind",
      "sector": "private",
      "annualTuition2026": 400000,
      "cutoff": 60,
      "prestige": 7,
      "founded": 1950,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate.",
      "fictional": true
    }
  ],
  "che": [
    {
      "id": "che_eth",
      "name": "ETH Zurich",
      "country": "che",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 88,
      "prestige": 10,
      "founded": 1855,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "che_zurich",
      "name": "University of Zurich",
      "country": "che",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 83,
      "prestige": 9,
      "founded": 1833,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "che_geneva",
      "name": "University of Geneva",
      "country": "che",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 82,
      "prestige": 9,
      "founded": 1559,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "che_epfl",
      "name": "EPFL",
      "country": "che",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 85,
      "prestige": 10,
      "founded": 1853,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "che_basel",
      "name": "University of Basel",
      "country": "che",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 80,
      "prestige": 8,
      "founded": 1460,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "che_bern",
      "name": "University of Bern",
      "country": "che",
      "sector": "public",
      "annualTuition2026": 2000,
      "cutoff": 78,
      "prestige": 8,
      "founded": 1834,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ],
  "swe": [
    {
      "id": "swe_uppsala",
      "name": "Uppsala University",
      "country": "swe",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 78,
      "prestige": 9,
      "founded": 1477,
      "feeBasis": "No tuition in the domestic/EU game pathway. Non-EU tuition, exceptions and residence-based eligibility are not simulated."
    },
    {
      "id": "swe_lund",
      "name": "Lund University",
      "country": "swe",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 80,
      "prestige": 9,
      "founded": 1666,
      "feeBasis": "No tuition in the domestic/EU game pathway. Non-EU tuition, exceptions and residence-based eligibility are not simulated."
    },
    {
      "id": "swe_stockholm",
      "name": "Stockholm University",
      "country": "swe",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 76,
      "prestige": 8,
      "founded": 1878,
      "feeBasis": "No tuition in the domestic/EU game pathway. Non-EU tuition, exceptions and residence-based eligibility are not simulated."
    },
    {
      "id": "swe_kth",
      "name": "KTH Royal Institute of Technology",
      "country": "swe",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 82,
      "prestige": 9,
      "founded": 1827,
      "feeBasis": "No tuition in the domestic/EU game pathway. Non-EU tuition, exceptions and residence-based eligibility are not simulated."
    },
    {
      "id": "swe_karolinska",
      "name": "Karolinska Institutet",
      "country": "swe",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 88,
      "prestige": 10,
      "founded": 1810,
      "feeBasis": "No tuition in the domestic/EU game pathway. Non-EU tuition, exceptions and residence-based eligibility are not simulated."
    },
    {
      "id": "swe_gothenburg",
      "name": "University of Gothenburg",
      "country": "swe",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 74,
      "prestige": 8,
      "founded": 1891,
      "feeBasis": "No tuition in the domestic/EU game pathway. Non-EU tuition, exceptions and residence-based eligibility are not simulated."
    },
    {
      "id": "swe_chalmers",
      "name": "Chalmers University of Technology",
      "country": "swe",
      "sector": "independent",
      "annualTuition2026": 0,
      "cutoff": 80,
      "prestige": 8,
      "founded": 1829,
      "feeBasis": "No tuition in the domestic/EU game pathway. Non-EU tuition, exceptions and residence-based eligibility are not simulated.",
      "sectorLabel": "Foundation university"
    }
  ],
  "tur": [
    {
      "id": "tur_istanbul",
      "name": "Istanbul University",
      "country": "tur",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 75,
      "prestige": 8,
      "founded": 1453,
      "feeBasis": "Domestic public-study game budget, not a fee quote. Evening, international and specialist programmes may charge fees."
    },
    {
      "id": "tur_metu",
      "name": "Middle East Technical University",
      "country": "tur",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 85,
      "prestige": 9,
      "founded": 1956,
      "feeBasis": "Domestic public-study game budget, not a fee quote. Evening, international and specialist programmes may charge fees."
    },
    {
      "id": "tur_bogazici",
      "name": "Boğaziçi University",
      "country": "tur",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 88,
      "prestige": 10,
      "founded": 1863,
      "feeBasis": "Domestic public-study game budget, not a fee quote. Evening, international and specialist programmes may charge fees."
    },
    {
      "id": "tur_ankara",
      "name": "Ankara University",
      "country": "tur",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 72,
      "prestige": 7,
      "founded": 1946,
      "feeBasis": "Domestic public-study game budget, not a fee quote. Evening, international and specialist programmes may charge fees."
    },
    {
      "id": "tur_itu",
      "name": "Istanbul Technical University",
      "country": "tur",
      "sector": "public",
      "annualTuition2026": 0,
      "cutoff": 83,
      "prestige": 9,
      "founded": 1773,
      "feeBasis": "Domestic public-study game budget, not a fee quote. Evening, international and specialist programmes may charge fees."
    },
    {
      "id": "tur_koc",
      "name": "Koç University",
      "country": "tur",
      "sector": "private",
      "annualTuition2026": 1100000,
      "cutoff": 90,
      "prestige": 10,
      "founded": 1993,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "tur_sabanci",
      "name": "Sabancı University",
      "country": "tur",
      "sector": "private",
      "annualTuition2026": 950000,
      "cutoff": 88,
      "prestige": 9,
      "founded": 1996,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    },
    {
      "id": "tur_bilkent",
      "name": "Bilkent University",
      "country": "tur",
      "sector": "private",
      "annualTuition2026": 850000,
      "cutoff": 86,
      "prestige": 9,
      "founded": 1984,
      "feeBasis": "Estimated game budget for a local undergraduate, not an institutional fee quote. Fees vary by course and residency; living costs are separate."
    }
  ]
};

export const SCHOOLS = {
  "egy": [
    {
      "id": "x-sch-egy-tawfikia",
      "name": "Tawfikia Secondary School",
      "country": "egy",
      "city": "Cairo",
      "tier": "state",
      "annualTuition2026": 500,
      "academicBoost": 1.0,
      "founded": 1880
    },
    {
      "id": "x-sch-egy-saidia",
      "name": "El Saidiya Secondary School",
      "country": "egy",
      "city": "Giza",
      "tier": "state",
      "annualTuition2026": 500,
      "academicBoost": 1.0,
      "founded": 1908
    },
    {
      "id": "x-sch-egy-alazhar",
      "name": "Al-Azhar Institute",
      "country": "egy",
      "city": "Cairo",
      "tier": "state",
      "annualTuition2026": 500,
      "academicBoost": 1.0,
      "founded": 970
    },
    {
      "id": "x-sch-egy-sainte-famille",
      "name": "Coll\u00e8ge de la Sainte Famille",
      "country": "egy",
      "city": "Cairo",
      "tier": "private",
      "annualTuition2026": 120000,
      "academicBoost": 1.55,
      "founded": 1879
    },
    {
      "id": "x-sch-egy-saint-marc",
      "name": "Coll\u00e8ge Saint-Marc",
      "country": "egy",
      "city": "Alexandria",
      "tier": "private",
      "annualTuition2026": 100000,
      "academicBoost": 1.55,
      "founded": 1928
    },
    {
      "id": "x-sch-egy-ramses",
      "name": "Ramses College for Girls",
      "country": "egy",
      "city": "Cairo",
      "tier": "private",
      "annualTuition2026": 90000,
      "academicBoost": 1.0,
      "founded": 1908
    },
    {
      "id": "x-sch-egy-cac",
      "name": "Cairo American College",
      "country": "egy",
      "city": "Cairo",
      "tier": "international",
      "annualTuition2026": 350000,
      "academicBoost": 1.55,
      "founded": 1945
    },
    {
      "id": "x-sch-egy-bisc",
      "name": "British International School Cairo",
      "country": "egy",
      "city": "Cairo",
      "tier": "international",
      "annualTuition2026": 300000,
      "academicBoost": 1.55,
      "founded": 1976
    },
    {
      "id": "x-sch-egy-ais",
      "name": "American International School in Egypt",
      "country": "egy",
      "city": "Cairo",
      "tier": "international",
      "annualTuition2026": 320000,
      "academicBoost": 1.55,
      "founded": 1990
    },
    {
      "id": "x-sch-egy-mes",
      "name": "Modern English School Cairo",
      "country": "egy",
      "city": "Cairo",
      "tier": "international",
      "annualTuition2026": 280000,
      "academicBoost": 1.55,
      "founded": 1990
    },
    {
      "id": "x-sch-egy-deo",
      "name": "German School Cairo (DEO)",
      "country": "egy",
      "city": "Cairo",
      "tier": "international",
      "annualTuition2026": 200000,
      "academicBoost": 1.55,
      "founded": 1873
    },
    {
      "id": "egy_priv_sch",
      "name": "Egypt Private Academy",
      "country": "egy",
      "city": "",
      "tier": "private",
      "annualTuition2026": 38000,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "egy_intl_sch",
      "name": "Egypt International School (IB/IGCSE)",
      "country": "egy",
      "city": "",
      "tier": "international",
      "annualTuition2026": 240000,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "sau": [
    {
      "id": "x-sch-sau-dhahran-ahliyya",
      "name": "Dhahran Ahliyya Schools",
      "country": "sau",
      "city": "Dhahran",
      "tier": "private",
      "annualTuition2026": 45000,
      "academicBoost": 1.55,
      "founded": 1977
    },
    {
      "id": "x-sch-sau-aisr",
      "name": "American International School \u2013 Riyadh",
      "country": "sau",
      "city": "Riyadh",
      "tier": "international",
      "annualTuition2026": 95000,
      "academicBoost": 1.55,
      "founded": 1963
    },
    {
      "id": "x-sch-sau-bisr",
      "name": "British International School Riyadh",
      "country": "sau",
      "city": "Riyadh",
      "tier": "international",
      "annualTuition2026": 85000,
      "academicBoost": 1.55,
      "founded": 1979
    },
    {
      "id": "sau_priv_sch",
      "name": "Saudi Arabia Private Academy",
      "country": "sau",
      "city": "",
      "tier": "private",
      "annualTuition2026": 22000,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "sau_intl_sch",
      "name": "Saudi Arabia International School (IB/IGCSE)",
      "country": "sau",
      "city": "",
      "tier": "international",
      "annualTuition2026": 52000,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "uae": [
    {
      "id": "x-sch-uae-dubai-college",
      "name": "Dubai College",
      "country": "uae",
      "city": "Dubai",
      "tier": "private",
      "annualTuition2026": 95000,
      "academicBoost": 1.55,
      "founded": 1978
    },
    {
      "id": "x-sch-uae-jumeirah-college",
      "name": "Jumeirah College",
      "country": "uae",
      "city": "Dubai",
      "tier": "private",
      "annualTuition2026": 90000,
      "academicBoost": 1.55,
      "founded": 1999
    },
    {
      "id": "x-sch-uae-asd",
      "name": "American School of Dubai",
      "country": "uae",
      "city": "Dubai",
      "tier": "international",
      "annualTuition2026": 100000,
      "academicBoost": 1.55,
      "founded": 1966
    },
    {
      "id": "x-sch-uae-dia",
      "name": "Dubai International Academy",
      "country": "uae",
      "city": "Dubai",
      "tier": "international",
      "annualTuition2026": 85000,
      "academicBoost": 1.55,
      "founded": 2005
    },
    {
      "id": "x-sch-uae-gems-world",
      "name": "GEMS World Academy Dubai",
      "country": "uae",
      "city": "Dubai",
      "tier": "international",
      "annualTuition2026": 110000,
      "academicBoost": 1.55,
      "founded": 2008
    },
    {
      "id": "uae_priv_sch",
      "name": "United Arab Emirates Private Academy",
      "country": "uae",
      "city": "",
      "tier": "private",
      "annualTuition2026": 22000,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "uae_intl_sch",
      "name": "United Arab Emirates International School (IB/IGCSE)",
      "country": "uae",
      "city": "",
      "tier": "international",
      "annualTuition2026": 52000,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "gbr": [
    {
      "id": "x-sch-gbr-latymer",
      "name": "The Latymer School",
      "country": "gbr",
      "city": "London",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.0,
      "founded": 1624
    },
    {
      "id": "x-sch-gbr-qe-barnet",
      "name": "Queen Elizabeth's School, Barnet",
      "country": "gbr",
      "city": "London",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.55,
      "founded": 1573
    },
    {
      "id": "x-sch-gbr-eton",
      "name": "Eton College",
      "country": "gbr",
      "city": "Windsor",
      "tier": "private",
      "annualTuition2026": 52000,
      "academicBoost": 1.55,
      "founded": 1440
    },
    {
      "id": "x-sch-gbr-harrow",
      "name": "Harrow School",
      "country": "gbr",
      "city": "London",
      "tier": "private",
      "annualTuition2026": 48000,
      "academicBoost": 1.55,
      "founded": 1572
    },
    {
      "id": "x-sch-gbr-westminster",
      "name": "Westminster School",
      "country": "gbr",
      "city": "London",
      "tier": "private",
      "annualTuition2026": 42000,
      "academicBoost": 1.55,
      "founded": 1560
    },
    {
      "id": "x-sch-gbr-winchester",
      "name": "Winchester College",
      "country": "gbr",
      "city": "Winchester",
      "tier": "private",
      "annualTuition2026": 48000,
      "academicBoost": 1.55,
      "founded": 1382
    },
    {
      "id": "x-sch-gbr-asl",
      "name": "American School in London",
      "country": "gbr",
      "city": "London",
      "tier": "international",
      "annualTuition2026": 38000,
      "academicBoost": 1.55,
      "founded": 1951
    },
    {
      "id": "x-sch-gbr-southbank",
      "name": "Southbank International School",
      "country": "gbr",
      "city": "London",
      "tier": "international",
      "annualTuition2026": 30000,
      "academicBoost": 1.55,
      "founded": 1979
    },
    {
      "id": "gbr_priv_sch",
      "name": "United Kingdom Private Academy",
      "country": "gbr",
      "city": "",
      "tier": "private",
      "annualTuition2026": 4290,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "gbr_intl_sch",
      "name": "United Kingdom International School (IB/IGCSE)",
      "country": "gbr",
      "city": "",
      "tier": "international",
      "annualTuition2026": 11310,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "usa": [
    {
      "id": "x-sch-usa-bronx-science",
      "name": "The Bronx High School of Science",
      "country": "usa",
      "city": "New York",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.55,
      "founded": 1938
    },
    {
      "id": "x-sch-usa-stuyvesant",
      "name": "Stuyvesant High School",
      "country": "usa",
      "city": "New York",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.55,
      "founded": 1904
    },
    {
      "id": "x-sch-usa-tjhsst",
      "name": "Thomas Jefferson High School for Science and Technology",
      "country": "usa",
      "city": "Alexandria",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.55,
      "founded": 1985
    },
    {
      "id": "x-sch-usa-exeter",
      "name": "Phillips Exeter Academy",
      "country": "usa",
      "city": "Exeter",
      "tier": "private",
      "annualTuition2026": 65000,
      "academicBoost": 1.55,
      "founded": 1781
    },
    {
      "id": "x-sch-usa-andover",
      "name": "Phillips Academy Andover",
      "country": "usa",
      "city": "Andover",
      "tier": "private",
      "annualTuition2026": 65000,
      "academicBoost": 1.55,
      "founded": 1778
    },
    {
      "id": "x-sch-usa-dalton",
      "name": "The Dalton School",
      "country": "usa",
      "city": "New York",
      "tier": "private",
      "annualTuition2026": 60000,
      "academicBoost": 1.55,
      "founded": 1919
    },
    {
      "id": "x-sch-usa-unis",
      "name": "United Nations International School",
      "country": "usa",
      "city": "New York",
      "tier": "international",
      "annualTuition2026": 52000,
      "academicBoost": 1.55,
      "founded": 1947
    },
    {
      "id": "x-sch-usa-lycee-ny",
      "name": "Lyc\u00e9e Fran\u00e7ais de New York",
      "country": "usa",
      "city": "New York",
      "tier": "international",
      "annualTuition2026": 45000,
      "academicBoost": 1.55,
      "founded": 1935
    },
    {
      "id": "usa_priv_sch",
      "name": "United States Private Academy",
      "country": "usa",
      "city": "",
      "tier": "private",
      "annualTuition2026": 5500,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "usa_intl_sch",
      "name": "United States International School (IB/IGCSE)",
      "country": "usa",
      "city": "",
      "tier": "international",
      "annualTuition2026": 14500,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "deu": [
    {
      "id": "x-sch-deu-wilhelms",
      "name": "Wilhelmsgymnasium M\u00fcnchen",
      "country": "deu",
      "city": "Munich",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.0,
      "founded": 1849
    },
    {
      "id": "x-sch-deu-carolinum",
      "name": "Gymnasium Carolinum Osnabr\u00fcck",
      "country": "deu",
      "city": "Osnabr\u00fcck",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.0,
      "founded": 804
    },
    {
      "id": "x-sch-deu-lessing",
      "name": "Lessing-Gymnasium Frankfurt",
      "country": "deu",
      "city": "Frankfurt",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.0,
      "founded": 1519
    },
    {
      "id": "x-sch-deu-salem",
      "name": "Schule Schloss Salem",
      "country": "deu",
      "city": "Salem",
      "tier": "private",
      "annualTuition2026": 42000,
      "academicBoost": 1.55,
      "founded": 1920
    },
    {
      "id": "x-sch-deu-birklehof",
      "name": "Schule Birklehof",
      "country": "deu",
      "city": "Hinterzarten",
      "tier": "private",
      "annualTuition2026": 38000,
      "academicBoost": 1.55,
      "founded": 1932
    },
    {
      "id": "x-sch-deu-bbis",
      "name": "Berlin Brandenburg International School",
      "country": "deu",
      "city": "Berlin",
      "tier": "international",
      "annualTuition2026": 22000,
      "academicBoost": 1.55,
      "founded": 1990
    },
    {
      "id": "x-sch-deu-ish",
      "name": "International School of Hamburg",
      "country": "deu",
      "city": "Hamburg",
      "tier": "international",
      "annualTuition2026": 20000,
      "academicBoost": 1.55,
      "founded": 1957
    },
    {
      "id": "deu_priv_sch",
      "name": "Germany Private Academy",
      "country": "deu",
      "city": "",
      "tier": "private",
      "annualTuition2026": 5060,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "deu_intl_sch",
      "name": "Germany International School (IB/IGCSE)",
      "country": "deu",
      "city": "",
      "tier": "international",
      "annualTuition2026": 13340,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "can": [
    {
      "id": "x-sch-can-earl-haig",
      "name": "Earl Haig Secondary School",
      "country": "can",
      "city": "Toronto",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.0,
      "founded": 1929
    },
    {
      "id": "x-sch-can-garneau",
      "name": "Marc Garneau Collegiate Institute",
      "country": "can",
      "city": "Toronto",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.0,
      "founded": 1972
    },
    {
      "id": "x-sch-can-ucc",
      "name": "Upper Canada College",
      "country": "can",
      "city": "Toronto",
      "tier": "private",
      "annualTuition2026": 38000,
      "academicBoost": 1.55,
      "founded": 1829
    },
    {
      "id": "x-sch-can-stgeorges",
      "name": "St. George's School",
      "country": "can",
      "city": "Vancouver",
      "tier": "private",
      "annualTuition2026": 32000,
      "academicBoost": 1.55,
      "founded": 1930
    },
    {
      "id": "x-sch-can-tfs",
      "name": "Toronto French School",
      "country": "can",
      "city": "Toronto",
      "tier": "international",
      "annualTuition2026": 36000,
      "academicBoost": 1.55,
      "founded": 1962
    },
    {
      "id": "x-sch-can-mulgrave",
      "name": "Mulgrave School",
      "country": "can",
      "city": "Vancouver",
      "tier": "international",
      "annualTuition2026": 34000,
      "academicBoost": 1.55,
      "founded": 1993
    },
    {
      "id": "can_priv_sch",
      "name": "Canada Private Academy",
      "country": "can",
      "city": "",
      "tier": "private",
      "annualTuition2026": 7425,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "can_intl_sch",
      "name": "Canada International School (IB/IGCSE)",
      "country": "can",
      "city": "",
      "tier": "international",
      "annualTuition2026": 19575,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "aus": [
    {
      "id": "aus_state_sch",
      "name": "Australia Public School",
      "country": "aus",
      "city": "",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.05,
      "founded": 1900
    },
    {
      "id": "aus_priv_sch",
      "name": "Australia Private Academy",
      "country": "aus",
      "city": "",
      "tier": "private",
      "annualTuition2026": 8250,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "aus_intl_sch",
      "name": "Australia International School (IB/IGCSE)",
      "country": "aus",
      "city": "",
      "tier": "international",
      "annualTuition2026": 21750,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "nld": [
    {
      "id": "nld_state_sch",
      "name": "Netherlands Public School",
      "country": "nld",
      "city": "",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.05,
      "founded": 1900
    },
    {
      "id": "nld_priv_sch",
      "name": "Netherlands Private Academy",
      "country": "nld",
      "city": "",
      "tier": "private",
      "annualTuition2026": 5060,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "nld_intl_sch",
      "name": "Netherlands International School (IB/IGCSE)",
      "country": "nld",
      "city": "",
      "tier": "international",
      "annualTuition2026": 13340,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "fra": [
    {
      "id": "x-sch-fra-louis-le-grand",
      "name": "Lyc\u00e9e Louis-le-Grand",
      "country": "fra",
      "city": "Paris",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.55,
      "founded": 1563
    },
    {
      "id": "x-sch-fra-henri-iv",
      "name": "Lyc\u00e9e Henri-IV",
      "country": "fra",
      "city": "Paris",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.55,
      "founded": 1796
    },
    {
      "id": "x-sch-fra-janson",
      "name": "Lyc\u00e9e Janson-de-Sailly",
      "country": "fra",
      "city": "Paris",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.55,
      "founded": 1884
    },
    {
      "id": "x-sch-fra-franklin",
      "name": "Lyc\u00e9e Saint-Louis-de-Gonzague",
      "country": "fra",
      "city": "Paris",
      "tier": "private",
      "annualTuition2026": 12000,
      "academicBoost": 1.55,
      "founded": 1894
    },
    {
      "id": "x-sch-fra-ginette",
      "name": "Lyc\u00e9e Sainte-Genevi\u00e8ve",
      "country": "fra",
      "city": "Versailles",
      "tier": "private",
      "annualTuition2026": 10000,
      "academicBoost": 1.55,
      "founded": 1854
    },
    {
      "id": "x-sch-fra-isp",
      "name": "International School of Paris",
      "country": "fra",
      "city": "Paris",
      "tier": "international",
      "annualTuition2026": 32000,
      "academicBoost": 1.55,
      "founded": 1964
    },
    {
      "id": "x-sch-fra-lycee-intl",
      "name": "Lyc\u00e9e International de Saint-Germain-en-Laye",
      "country": "fra",
      "city": "Saint-Germain-en-Laye",
      "tier": "state",
      "annualTuition2026": 8000,
      "academicBoost": 1.55,
      "founded": 1952
    },
    {
      "id": "fra_priv_sch",
      "name": "France Private Academy",
      "country": "fra",
      "city": "",
      "tier": "private",
      "annualTuition2026": 5060,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "fra_intl_sch",
      "name": "France International School (IB/IGCSE)",
      "country": "fra",
      "city": "",
      "tier": "international",
      "annualTuition2026": 13340,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "jpn": [
    {
      "id": "jpn_state_sch",
      "name": "Japan Public School",
      "country": "jpn",
      "city": "",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.05,
      "founded": 1900
    },
    {
      "id": "jpn_priv_sch",
      "name": "Japan Private Academy",
      "country": "jpn",
      "city": "",
      "tier": "private",
      "annualTuition2026": 825000,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "jpn_intl_sch",
      "name": "Japan International School (IB/IGCSE)",
      "country": "jpn",
      "city": "",
      "tier": "international",
      "annualTuition2026": 2175000,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "ita": [
    {
      "id": "x-sch-ita-azeglio",
      "name": "Liceo Classico Massimo d'Azeglio",
      "country": "ita",
      "city": "Turin",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.0,
      "founded": 1831
    },
    {
      "id": "x-sch-ita-manzoni",
      "name": "Liceo Classico Alessandro Manzoni",
      "country": "ita",
      "city": "Milan",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.0,
      "founded": 1884
    },
    {
      "id": "x-sch-ita-leone-xiii",
      "name": "Istituto Leone XIII",
      "country": "ita",
      "city": "Milan",
      "tier": "private",
      "annualTuition2026": 12000,
      "academicBoost": 1.0,
      "founded": 1893
    },
    {
      "id": "x-sch-ita-st-stephens",
      "name": "St. Stephen's School, Rome",
      "country": "ita",
      "city": "Rome",
      "tier": "international",
      "annualTuition2026": 32000,
      "academicBoost": 1.55,
      "founded": 1964
    },
    {
      "id": "ita_priv_sch",
      "name": "Italy Private Academy",
      "country": "ita",
      "city": "",
      "tier": "private",
      "annualTuition2026": 5060,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "ita_intl_sch",
      "name": "Italy International School (IB/IGCSE)",
      "country": "ita",
      "city": "",
      "tier": "international",
      "annualTuition2026": 13340,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "sgp": [
    {
      "id": "sgp_state_sch",
      "name": "Singapore Public School",
      "country": "sgp",
      "city": "",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.05,
      "founded": 1900
    },
    {
      "id": "sgp_priv_sch",
      "name": "Singapore Private Academy",
      "country": "sgp",
      "city": "",
      "tier": "private",
      "annualTuition2026": 7425,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "sgp_intl_sch",
      "name": "Singapore International School (IB/IGCSE)",
      "country": "sgp",
      "city": "",
      "tier": "international",
      "annualTuition2026": 19575,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "bra": [
    {
      "id": "bra_state_sch",
      "name": "Brazil Public School",
      "country": "bra",
      "city": "",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.05,
      "founded": 1900
    },
    {
      "id": "bra_priv_sch",
      "name": "Brazil Private Academy",
      "country": "bra",
      "city": "",
      "tier": "private",
      "annualTuition2026": 27775,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "bra_intl_sch",
      "name": "Brazil International School (IB/IGCSE)",
      "country": "bra",
      "city": "",
      "tier": "international",
      "annualTuition2026": 73225,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "ind": [
    {
      "id": "ind_state_sch",
      "name": "India Public School",
      "country": "ind",
      "city": "",
      "tier": "state",
      "annualTuition2026": 0,
      "academicBoost": 1.05,
      "founded": 1900
    },
    {
      "id": "ind_priv_sch",
      "name": "India Private Academy",
      "country": "ind",
      "city": "",
      "tier": "private",
      "annualTuition2026": 459250,
      "academicBoost": 1.32,
      "founded": 1955
    },
    {
      "id": "ind_intl_sch",
      "name": "India International School (IB/IGCSE)",
      "country": "ind",
      "city": "",
      "tier": "international",
      "annualTuition2026": 1210750,
      "academicBoost": 1.58,
      "founded": 1978
    }
  ],
  "che": [
    {
      "id": "che_isg",
      "name": "International School of Geneva",
      "country": "che",
      "city": "Geneva",
      "tier": "international",
      "annualTuition2026": 30000,
      "academicBoost": 1.58,
      "founded": 1924
    },
    {
      "id": "che_zis",
      "name": "Zurich International School",
      "country": "che",
      "city": "Zurich",
      "tier": "international",
      "annualTuition2026": 32000,
      "academicBoost": 1.58,
      "founded": 1963
    },
    {
      "id": "che_lfz",
      "name": "Lycée Français de Zurich",
      "country": "che",
      "city": "Zurich",
      "tier": "private",
      "annualTuition2026": 25000,
      "academicBoost": 1.32,
      "founded": 1955
    }
  ],
  "swe": [
    {
      "id": "swe_sis",
      "name": "Stockholm International School",
      "country": "swe",
      "city": "Stockholm",
      "tier": "international",
      "annualTuition2026": 120000,
      "academicBoost": 1.58,
      "founded": 1951
    },
    {
      "id": "swe_ies",
      "name": "Internationella Engelska Skolan",
      "country": "swe",
      "city": "Stockholm",
      "tier": "private",
      "annualTuition2026": 0,
      "academicBoost": 1.32,
      "founded": 1993
    },
    {
      "id": "swe_sshl",
      "name": "Sigtunaskolan Humanistiska Läroverket",
      "country": "swe",
      "city": "Sigtuna",
      "tier": "private",
      "annualTuition2026": 150000,
      "academicBoost": 1.32,
      "founded": 1924
    }
  ],
  "tur": [
    {
      "id": "tur_robert",
      "name": "Robert College",
      "country": "tur",
      "city": "Istanbul",
      "tier": "private",
      "annualTuition2026": 1200000,
      "academicBoost": 1.58,
      "founded": 1863
    },
    {
      "id": "tur_koc_school",
      "name": "Koç School",
      "country": "tur",
      "city": "Istanbul",
      "tier": "private",
      "annualTuition2026": 1100000,
      "academicBoost": 1.58,
      "founded": 1988
    },
    {
      "id": "tur_iics",
      "name": "Istanbul International Community School",
      "country": "tur",
      "city": "Istanbul",
      "tier": "international",
      "annualTuition2026": 900000,
      "academicBoost": 1.58,
      "founded": 1911
    }
  ]
};

export const HOSPITALS = {
  "egy": [
    {
      "id": "x3-hosp-nasser-institute",
      "name": "Nasser Institute Hospital",
      "country": "egy",
      "city": "Cairo",
      "sector": "public",
      "quality": 70,
      "costMult": 0.35,
      "founded": 1986
    },
    {
      "id": "x3-hosp-aswan-heart",
      "name": "Magdi Yacoub Heart Foundation \u2014 Aswan Heart Centre",
      "country": "egy",
      "city": "Aswan",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 2009
    },
    {
      "id": "x-hosp-kasr-alainy",
      "name": "Kasr Al-Ainy Hospital",
      "country": "egy",
      "city": "Cairo",
      "sector": "public",
      "quality": 60,
      "costMult": 0.35,
      "founded": 1827
    },
    {
      "id": "x-hosp-ain-shams",
      "name": "Ain Shams University Hospitals",
      "country": "egy",
      "city": "Cairo",
      "sector": "public",
      "quality": 70,
      "costMult": 0.35,
      "founded": 1950
    },
    {
      "id": "x-hosp-dar-al-fouad",
      "name": "Dar Al Fouad Hospital",
      "country": "egy",
      "city": "6th of October City",
      "sector": "private",
      "quality": 90,
      "costMult": 1.35,
      "founded": 1999
    },
    {
      "id": "x-hosp-cleopatra",
      "name": "Cleopatra Hospital",
      "country": "egy",
      "city": "Cairo",
      "sector": "private",
      "quality": 80,
      "costMult": 1.35,
      "founded": 1984
    },
    {
      "id": "x-hosp-57357",
      "name": "Children\u2019s Cancer Hospital 57357",
      "country": "egy",
      "city": "Cairo",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 2007
    },
    {
      "id": "x-hosp-salam-intl",
      "name": "As-Salam International Hospital",
      "country": "egy",
      "city": "Cairo",
      "sector": "private",
      "quality": 80,
      "costMult": 1.35,
      "founded": 1982
    },
    {
      "id": "x-hosp-nile-care",
      "name": "Nile Care Hospital",
      "country": "egy",
      "city": "Cairo",
      "sector": "private",
      "quality": 78,
      "costMult": 1.35,
      "founded": 1950,
      "foundedModelled": true,
      "foundedSrc": "Unverified — no hospital by the exact name 'Nile Care Hospital' found (closest real ones: Nile Hospital Hurghada, opened 2005; Nile Badrawi Hospital Cairo, established 1985); 1950 is a modelled year for the game's fictional hospital."
    }
  ],
  "sau": [
    {
      "id": "x3-hosp-king-khalid",
      "name": "King Khalid University Hospital",
      "country": "sau",
      "city": "Riyadh",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1982
    },
    {
      "id": "x-hosp-kfsh",
      "name": "King Faisal Specialist Hospital",
      "country": "sau",
      "city": "Riyadh",
      "sector": "public",
      "quality": 100,
      "costMult": 0.35,
      "founded": 1975
    },
    {
      "id": "x-hosp-kfmc",
      "name": "King Fahad Medical City",
      "country": "sau",
      "city": "Riyadh",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1984
    },
    {
      "id": "x-hosp-alhabib-olaya",
      "name": "Dr. Sulaiman Al Habib Hospital \u2013 Olaya",
      "country": "sau",
      "city": "Riyadh",
      "sector": "private",
      "quality": 90,
      "costMult": 1.35,
      "founded": 1995
    },
    {
      "id": "x-hosp-saudi-german-jeddah",
      "name": "Saudi German Hospital",
      "country": "sau",
      "city": "Jeddah",
      "sector": "private",
      "quality": 80,
      "costMult": 1.35,
      "founded": 1988
    }
  ],
  "uae": [
    {
      "id": "x3-hosp-rashid",
      "name": "Rashid Hospital",
      "country": "uae",
      "city": "Dubai",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1973
    },
    {
      "id": "x-hosp-cleveland-abu-dhabi",
      "name": "Cleveland Clinic Abu Dhabi",
      "country": "uae",
      "city": "Abu Dhabi",
      "sector": "private",
      "quality": 100,
      "costMult": 1.35,
      "founded": 2015
    },
    {
      "id": "x-hosp-american-dubai",
      "name": "American Hospital Dubai",
      "country": "uae",
      "city": "Dubai",
      "sector": "private",
      "quality": 90,
      "costMult": 1.35,
      "founded": 1996
    },
    {
      "id": "x-hosp-mediclinic-city",
      "name": "Mediclinic City Hospital",
      "country": "uae",
      "city": "Dubai",
      "sector": "private",
      "quality": 80,
      "costMult": 1.35,
      "founded": 2008
    },
    {
      "id": "x-hosp-ssmc",
      "name": "Sheikh Shakhbout Medical City",
      "country": "uae",
      "city": "Abu Dhabi",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 2019
    }
  ],
  "gbr": [
    {
      "id": "x3-hosp-kings-college",
      "name": "King's College Hospital",
      "country": "gbr",
      "city": "London",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1840
    },
    {
      "id": "x3-hosp-addenbrookes",
      "name": "Addenbrooke's Hospital",
      "country": "gbr",
      "city": "Cambridge",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1766
    },
    {
      "id": "x-hosp-st-thomas",
      "name": "St Thomas\u2019 Hospital",
      "country": "gbr",
      "city": "London",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1173
    },
    {
      "id": "x-hosp-guys",
      "name": "Guy\u2019s Hospital",
      "country": "gbr",
      "city": "London",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1721
    },
    {
      "id": "x-hosp-gosh",
      "name": "Great Ormond Street Hospital",
      "country": "gbr",
      "city": "London",
      "sector": "public",
      "quality": 100,
      "costMult": 0.35,
      "founded": 1852
    },
    {
      "id": "x-hosp-royal-london",
      "name": "The Royal London Hospital",
      "country": "gbr",
      "city": "London",
      "sector": "public",
      "quality": 70,
      "costMult": 0.35,
      "founded": 1740
    },
    {
      "id": "x-hosp-king-edward-vii",
      "name": "King Edward VII\u2019s Hospital",
      "country": "gbr",
      "city": "London",
      "sector": "private",
      "quality": 90,
      "costMult": 1.35,
      "founded": 1899
    }
  ],
  "usa": [
    {
      "id": "x3-hosp-brigham",
      "name": "Brigham and Women's Hospital",
      "country": "usa",
      "city": "Boston",
      "sector": "private",
      "quality": 100,
      "costMult": 1.35,
      "founded": 1980
    },
    {
      "id": "x3-hosp-nyp",
      "name": "NewYork-Presbyterian Hospital",
      "country": "usa",
      "city": "New York",
      "sector": "private",
      "quality": 100,
      "costMult": 1.35,
      "founded": 1998
    },
    {
      "id": "x-hosp-mayo",
      "name": "Mayo Clinic",
      "country": "usa",
      "city": "Rochester",
      "sector": "private",
      "quality": 100,
      "costMult": 1.35,
      "founded": 1889
    },
    {
      "id": "x-hosp-cleveland",
      "name": "Cleveland Clinic",
      "country": "usa",
      "city": "Cleveland",
      "sector": "private",
      "quality": 100,
      "costMult": 1.35,
      "founded": 1921
    },
    {
      "id": "x-hosp-hopkins",
      "name": "The Johns Hopkins Hospital",
      "country": "usa",
      "city": "Baltimore",
      "sector": "private",
      "quality": 100,
      "costMult": 1.35,
      "founded": 1889
    },
    {
      "id": "x-hosp-mass-general",
      "name": "Massachusetts General Hospital",
      "country": "usa",
      "city": "Boston",
      "sector": "private",
      "quality": 100,
      "costMult": 1.35,
      "founded": 1811
    },
    {
      "id": "x-hosp-mount-sinai",
      "name": "Mount Sinai Hospital",
      "country": "usa",
      "city": "New York",
      "sector": "private",
      "quality": 90,
      "costMult": 1.35,
      "founded": 1852
    },
    {
      "id": "x-hosp-ucsf",
      "name": "UCSF Medical Center",
      "country": "usa",
      "city": "San Francisco",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1864
    }
  ],
  "deu": [
    {
      "id": "x-hosp-charite",
      "name": "Charit\u00e9 \u2013 Universit\u00e4tsmedizin Berlin",
      "country": "deu",
      "city": "Berlin",
      "sector": "public",
      "quality": 100,
      "costMult": 0.35,
      "founded": 1710
    },
    {
      "id": "x-hosp-uke",
      "name": "University Medical Center Hamburg-Eppendorf (UKE)",
      "country": "deu",
      "city": "Hamburg",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1889
    },
    {
      "id": "x-hosp-rechts-der-isar",
      "name": "Klinikum rechts der Isar",
      "country": "deu",
      "city": "Munich",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1834
    },
    {
      "id": "x-hosp-cologne",
      "name": "University Hospital Cologne",
      "country": "deu",
      "city": "Cologne",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1908
    },
    {
      "id": "x-hosp-schoen-bad-aibling",
      "name": "Sch\u00f6n Klinik Bad Aibling",
      "country": "deu",
      "city": "Bad Aibling",
      "sector": "private",
      "quality": 80,
      "costMult": 1.35,
      "founded": 1985
    }
  ],
  "can": [
    {
      "id": "x-hosp-toronto-general",
      "name": "Toronto General Hospital",
      "country": "can",
      "city": "Toronto",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1819
    },
    {
      "id": "x-hosp-sickkids",
      "name": "The Hospital for Sick Children (SickKids)",
      "country": "can",
      "city": "Toronto",
      "sector": "public",
      "quality": 100,
      "costMult": 0.35,
      "founded": 1875
    },
    {
      "id": "x-hosp-vancouver-general",
      "name": "Vancouver General Hospital",
      "country": "can",
      "city": "Vancouver",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1902
    },
    {
      "id": "x-hosp-montreal-general",
      "name": "Montreal General Hospital",
      "country": "can",
      "city": "Montreal",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1821
    },
    {
      "id": "x-hosp-shouldice",
      "name": "Shouldice Hospital",
      "country": "can",
      "city": "Thornhill",
      "sector": "private",
      "quality": 80,
      "costMult": 1.35,
      "founded": 1945
    }
  ],
  "aus": [
    {
      "id": "aus_pub_hosp",
      "name": "Australia General Teaching Hospital",
      "country": "aus",
      "city": "",
      "sector": "public",
      "quality": 76,
      "costMult": 0.25,
      "founded": 1920
    },
    {
      "id": "aus_priv_hosp",
      "name": "Australia Specialist Medical Center",
      "country": "aus",
      "city": "",
      "sector": "private",
      "quality": 91,
      "costMult": 1.4,
      "founded": 1975
    }
  ],
  "nld": [
    {
      "id": "x-hosp-amsterdam-umc",
      "name": "Amsterdam UMC",
      "country": "nld",
      "city": "Amsterdam",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1983
    },
    {
      "id": "x-hosp-erasmus-mc",
      "name": "Erasmus MC",
      "country": "nld",
      "city": "Rotterdam",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 2002
    },
    {
      "id": "x-hosp-bergman",
      "name": "Bergman Clinics",
      "country": "nld",
      "city": "Amsterdam",
      "sector": "private",
      "quality": 80,
      "costMult": 1.35,
      "founded": 1988
    }
  ],
  "fra": [
    {
      "id": "x3-hosp-cochin",
      "name": "H\u00f4pital Cochin",
      "country": "fra",
      "city": "Paris",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1780
    },
    {
      "id": "x-hosp-pitie-salpetriere",
      "name": "Piti\u00e9-Salp\u00eatri\u00e8re Hospital",
      "country": "fra",
      "city": "Paris",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1656
    },
    {
      "id": "x-hosp-necker",
      "name": "H\u00f4pital Necker-Enfants malades",
      "country": "fra",
      "city": "Paris",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1802
    },
    {
      "id": "x-hosp-saint-louis",
      "name": "H\u00f4pital Saint-Louis",
      "country": "fra",
      "city": "Paris",
      "sector": "public",
      "quality": 80,
      "costMult": 0.35,
      "founded": 1607
    },
    {
      "id": "x-hosp-gustave-roussy",
      "name": "Institut Gustave Roussy",
      "country": "fra",
      "city": "Villejuif",
      "sector": "public",
      "quality": 100,
      "costMult": 0.35,
      "founded": 1926
    },
    {
      "id": "x-hosp-americain-paris",
      "name": "H\u00f4pital Am\u00e9ricain de Paris",
      "country": "fra",
      "city": "Neuilly-sur-Seine",
      "sector": "private",
      "quality": 90,
      "costMult": 1.35,
      "founded": 1906
    }
  ],
  "jpn": [
    {
      "id": "jpn_pub_hosp",
      "name": "Japan General Teaching Hospital",
      "country": "jpn",
      "city": "",
      "sector": "public",
      "quality": 76,
      "costMult": 0.25,
      "founded": 1920
    },
    {
      "id": "jpn_priv_hosp",
      "name": "Japan Specialist Medical Center",
      "country": "jpn",
      "city": "",
      "sector": "private",
      "quality": 91,
      "costMult": 1.4,
      "founded": 1975
    }
  ],
  "ita": [
    {
      "id": "x-hosp-policlinico-milano",
      "name": "Fondazione IRCCS Ca\u2019 Granda Ospedale Maggiore Policlinico",
      "country": "ita",
      "city": "Milan",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1456
    },
    {
      "id": "x-hosp-san-raffaele",
      "name": "IRCCS Ospedale San Raffaele",
      "country": "ita",
      "city": "Milan",
      "sector": "private",
      "quality": 90,
      "costMult": 1.35,
      "founded": 1971
    }
  ],
  "sgp": [
    {
      "id": "x3-hosp-sgh",
      "name": "Singapore General Hospital",
      "country": "sgp",
      "city": "Singapore",
      "sector": "public",
      "quality": 90,
      "costMult": 0.35,
      "founded": 1821
    },
    {
      "id": "sgp_priv_hosp",
      "name": "Singapore Specialist Medical Center",
      "country": "sgp",
      "city": "",
      "sector": "private",
      "quality": 91,
      "costMult": 1.4,
      "founded": 1975
    }
  ],
  "bra": [
    {
      "id": "bra_pub_hosp",
      "name": "Brazil General Teaching Hospital",
      "country": "bra",
      "city": "",
      "sector": "public",
      "quality": 76,
      "costMult": 0.25,
      "founded": 1920
    },
    {
      "id": "bra_priv_hosp",
      "name": "Brazil Specialist Medical Center",
      "country": "bra",
      "city": "",
      "sector": "private",
      "quality": 91,
      "costMult": 1.4,
      "founded": 1975
    }
  ],
  "ind": [
    {
      "id": "ind_pub_hosp",
      "name": "India General Teaching Hospital",
      "country": "ind",
      "city": "",
      "sector": "public",
      "quality": 76,
      "costMult": 0.25,
      "founded": 1920
    },
    {
      "id": "ind_priv_hosp",
      "name": "India Specialist Medical Center",
      "country": "ind",
      "city": "",
      "sector": "private",
      "quality": 91,
      "costMult": 1.4,
      "founded": 1975
    }
  ],
  "che": [
    {
      "id": "che_usz",
      "name": "University Hospital Zurich",
      "country": "che",
      "city": "Zurich",
      "sector": "public",
      "quality": 92,
      "costMult": 1.4,
      "founded": 1833
    },
    {
      "id": "che_hug",
      "name": "Geneva University Hospitals",
      "country": "che",
      "city": "Geneva",
      "sector": "public",
      "quality": 90,
      "costMult": 1.4,
      "founded": 1995
    },
    {
      "id": "che_insel",
      "name": "Inselspital Bern",
      "country": "che",
      "city": "Bern",
      "sector": "public",
      "quality": 91,
      "costMult": 1.4,
      "founded": 1354
    }
  ],
  "swe": [
    {
      "id": "swe_karolinska_hosp",
      "name": "Karolinska University Hospital",
      "country": "swe",
      "city": "Stockholm",
      "sector": "public",
      "quality": 92,
      "costMult": 1.35,
      "founded": 1940
    },
    {
      "id": "swe_sahlgrenska",
      "name": "Sahlgrenska University Hospital",
      "country": "swe",
      "city": "Gothenburg",
      "sector": "public",
      "quality": 90,
      "costMult": 1.35,
      "founded": 1782
    },
    {
      "id": "swe_akademiska",
      "name": "Uppsala University Hospital",
      "country": "swe",
      "city": "Uppsala",
      "sector": "public",
      "quality": 88,
      "costMult": 1.35,
      "founded": 1708
    }
  ],
  "tur": [
    {
      "id": "tur_hacettepe",
      "name": "Hacettepe University Hospital",
      "country": "tur",
      "city": "Ankara",
      "sector": "public",
      "quality": 85,
      "costMult": 0.35,
      "founded": 1966
    },
    {
      "id": "tur_koc_hosp",
      "name": "Koç University Hospital",
      "country": "tur",
      "city": "Istanbul",
      "sector": "private",
      "quality": 88,
      "costMult": 1.35,
      "founded": 2014
    },
    {
      "id": "tur_acibadem",
      "name": "Acıbadem Maslak Hospital",
      "country": "tur",
      "city": "Istanbul",
      "sector": "private",
      "quality": 87,
      "costMult": 1.35,
      "founded": 1991
    }
  ]
};

export const MEDICAL_CONDITIONS = [
  {
    "id": "anxiety",
    "label": "Anxiety Disorder",
    "category": "mental",
    "severity": "mild",
    "chronic": true,
    "annualHealthHit": 2,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 350,
    "desc": "Persistent worry. Manageable with therapy."
  },
  {
    "id": "depression",
    "label": "Depression",
    "category": "mental",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 8,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Persistent sadness. Therapy helps greatly."
  },
  {
    "id": "severe_depression",
    "label": "Severe Depression",
    "category": "mental",
    "severity": "severe",
    "chronic": true,
    "annualHealthHit": 6,
    "annualHappinessHit": 15,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 8500,
    "desc": "Deep depression. Urgent treatment needed."
  },
  {
    "id": "panic_disorder",
    "label": "Panic Disorder",
    "category": "mental",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 2,
    "annualHappinessHit": 6,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Panic attacks. Manageable with meds."
  },
  {
    "id": "bipolar",
    "label": "Bipolar Disorder",
    "category": "mental",
    "severity": "severe",
    "chronic": true,
    "annualHealthHit": 4,
    "annualHappinessHit": 10,
    "deathRiskPerYear": 0.005,
    "treatmentUsd2026": 8500,
    "desc": "Mood swings between mania and depression. Long treatment."
  },
  {
    "id": "hypertension",
    "label": "Hypertension (High BP)",
    "category": "cardio",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 1,
    "deathRiskPerYear": 0.01,
    "treatmentUsd2026": 1800,
    "desc": "Chronic high blood pressure. Often silent."
  },
  {
    "id": "high_cholesterol",
    "label": "High Cholesterol",
    "category": "cardio",
    "severity": "mild",
    "chronic": false,
    "annualHealthHit": 2,
    "annualHappinessHit": 0,
    "deathRiskPerYear": 0.005,
    "treatmentUsd2026": 350,
    "desc": "Elevated LDL. Increases heart risk."
  },
  {
    "id": "heart_disease",
    "label": "Coronary Heart Disease",
    "category": "cardio",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 8,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.06,
    "treatmentUsd2026": 8500,
    "desc": "Blocked arteries. Can be fatal."
  },
  {
    "id": "arrhythmia",
    "label": "Cardiac Arrhythmia",
    "category": "cardio",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 4,
    "annualHappinessHit": 3,
    "deathRiskPerYear": 0.02,
    "treatmentUsd2026": 1800,
    "desc": "Irregular heartbeat. Monitor closely."
  },
  {
    "id": "heart_attack",
    "label": "Post Heart Attack",
    "category": "cardio",
    "severity": "critical",
    "chronic": false,
    "annualHealthHit": 10,
    "annualHappinessHit": 8,
    "deathRiskPerYear": 0.08,
    "treatmentUsd2026": 8500,
    "desc": "Had a heart attack. High risk of another."
  },
  {
    "id": "asthma",
    "label": "Asthma",
    "category": "respiratory",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 2,
    "deathRiskPerYear": 0.005,
    "treatmentUsd2026": 1800,
    "desc": "Breathing difficulty. Manageable."
  },
  {
    "id": "copd",
    "label": "COPD",
    "category": "respiratory",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 6,
    "annualHappinessHit": 4,
    "deathRiskPerYear": 0.03,
    "treatmentUsd2026": 8500,
    "desc": "Chronic lung disease. Progressive."
  },
  {
    "id": "pneumonia",
    "label": "Pneumonia",
    "category": "respiratory",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 5,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.02,
    "treatmentUsd2026": 8500,
    "desc": "Lung infection. Curable with antibiotics."
  },
  {
    "id": "type2_diabetes",
    "label": "Type 2 Diabetes",
    "category": "endocrine",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 4,
    "annualHappinessHit": 1,
    "deathRiskPerYear": 0.01,
    "treatmentUsd2026": 1800,
    "desc": "Chronic blood sugar issue. Manageable."
  },
  {
    "id": "type1_diabetes",
    "label": "Type 1 Diabetes",
    "category": "endocrine",
    "severity": "severe",
    "chronic": true,
    "annualHealthHit": 5,
    "annualHappinessHit": 2,
    "deathRiskPerYear": 0.02,
    "treatmentUsd2026": 8500,
    "desc": "Insulin-dependent. Lifelong management."
  },
  {
    "id": "hypothyroid",
    "label": "Hypothyroidism",
    "category": "endocrine",
    "severity": "mild",
    "chronic": true,
    "annualHealthHit": 2,
    "annualHappinessHit": 2,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 350,
    "desc": "Low thyroid. Easy to treat."
  },
  {
    "id": "pcos",
    "label": "PCOS (Polycystic Ovary)",
    "category": "fertility_f",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 2,
    "annualHappinessHit": 4,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Hormonal imbalance. Affects fertility."
  },
  {
    "id": "ibs",
    "label": "Irritable Bowel Syndrome",
    "category": "digestive",
    "severity": "mild",
    "chronic": false,
    "annualHealthHit": 1,
    "annualHappinessHit": 3,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 350,
    "desc": "Chronic stomach discomfort. Diet helps."
  },
  {
    "id": "gerd",
    "label": "Severe Acid Reflux (GERD)",
    "category": "digestive",
    "severity": "mild",
    "chronic": false,
    "annualHealthHit": 2,
    "annualHappinessHit": 2,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 350,
    "desc": "Acid reflux. Manageable with meds."
  },
  {
    "id": "ulcer",
    "label": "Stomach Ulcer",
    "category": "digestive",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 4,
    "deathRiskPerYear": 0.005,
    "treatmentUsd2026": 1800,
    "desc": "Painful stomach sore. Curable with antibiotics."
  },
  {
    "id": "gallstones",
    "label": "Gallstones",
    "category": "digestive",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 3,
    "deathRiskPerYear": 0.01,
    "treatmentUsd2026": 1800,
    "desc": "Stones in gallbladder. Often removed."
  },
  {
    "id": "hepatitis_b",
    "label": "Hepatitis B",
    "category": "digestive",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 5,
    "annualHappinessHit": 4,
    "deathRiskPerYear": 0.02,
    "treatmentUsd2026": 8500,
    "desc": "Chronic liver infection. Managed, not cured."
  },
  {
    "id": "appendicitis",
    "label": "Appendicitis",
    "category": "digestive",
    "severity": "critical",
    "chronic": false,
    "annualHealthHit": 10,
    "annualHappinessHit": 6,
    "deathRiskPerYear": 0.05,
    "treatmentUsd2026": 8500,
    "desc": "Inflamed appendix. Ruptures without urgent surgery."
  },
  {
    "id": "hernia",
    "label": "Hernia",
    "category": "digestive",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 2,
    "annualHappinessHit": 2,
    "deathRiskPerYear": 0.005,
    "treatmentUsd2026": 1800,
    "desc": "Weak abdominal wall bulge. Curable with surgery."
  },
  {
    "id": "arthritis",
    "label": "Rheumatoid Arthritis",
    "category": "autoimmune",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 4,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Autoimmune joint pain. Manageable."
  },
  {
    "id": "osteoporosis",
    "label": "Osteoporosis",
    "category": "bone",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 1,
    "deathRiskPerYear": 0.005,
    "treatmentUsd2026": 1800,
    "desc": "Weak bones. Higher fracture risk."
  },
  {
    "id": "migraine",
    "label": "Chronic Migraine",
    "category": "neuro",
    "severity": "mild",
    "chronic": false,
    "annualHealthHit": 1,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 350,
    "desc": "Recurring severe headaches."
  },
  {
    "id": "epilepsy",
    "label": "Epilepsy",
    "category": "neuro",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 4,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.015,
    "treatmentUsd2026": 8500,
    "desc": "Seizures. Controllable with medication."
  },
  {
    "id": "stroke_recovery",
    "label": "Stroke Recovery",
    "category": "neuro",
    "severity": "critical",
    "chronic": false,
    "annualHealthHit": 8,
    "annualHappinessHit": 10,
    "deathRiskPerYear": 0.08,
    "treatmentUsd2026": 8500,
    "desc": "Recovering from stroke. High risk of recurrence."
  },
  {
    "id": "breast_cancer",
    "label": "Breast Cancer",
    "category": "cancer",
    "severity": "critical",
    "chronic": false,
    "annualHealthHit": 12,
    "annualHappinessHit": 15,
    "deathRiskPerYear": 0.15,
    "treatmentUsd2026": 8500,
    "desc": "Requires urgent treatment."
  },
  {
    "id": "cervical_cancer",
    "label": "Cervical Cancer",
    "category": "cancer",
    "severity": "critical",
    "chronic": false,
    "annualHealthHit": 11,
    "annualHappinessHit": 14,
    "deathRiskPerYear": 0.16,
    "treatmentUsd2026": 8500,
    "desc": "Usually found by routine screening. Treatable if caught early."
  },
  {
    "id": "lung_cancer",
    "label": "Lung Cancer",
    "category": "cancer",
    "severity": "critical",
    "chronic": false,
    "annualHealthHit": 15,
    "annualHappinessHit": 18,
    "deathRiskPerYear": 0.25,
    "treatmentUsd2026": 8500,
    "desc": "Aggressive. Treatment essential."
  },
  {
    "id": "colon_cancer",
    "label": "Colon Cancer",
    "category": "cancer",
    "severity": "critical",
    "chronic": false,
    "annualHealthHit": 12,
    "annualHappinessHit": 15,
    "deathRiskPerYear": 0.18,
    "treatmentUsd2026": 8500,
    "desc": "Treatable if caught early."
  },
  {
    "id": "leukemia",
    "label": "Leukemia",
    "category": "cancer",
    "severity": "critical",
    "chronic": false,
    "annualHealthHit": 15,
    "annualHappinessHit": 20,
    "deathRiskPerYear": 0.3,
    "treatmentUsd2026": 8500,
    "desc": "Blood cancer. Chemo essential."
  },
  {
    "id": "kidney_stones",
    "label": "Kidney Stones",
    "category": "kidney",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.005,
    "treatmentUsd2026": 1800,
    "desc": "Painful stones. Often removed."
  },
  {
    "id": "ckd",
    "label": "Chronic Kidney Disease",
    "category": "kidney",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 7,
    "annualHappinessHit": 6,
    "deathRiskPerYear": 0.05,
    "treatmentUsd2026": 8500,
    "desc": "Declining kidney function. Managed."
  },
  {
    "id": "cataract",
    "label": "Cataract",
    "category": "eye",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 1,
    "annualHappinessHit": 3,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Cloudy lens. Curable with surgery."
  },
  {
    "id": "glaucoma",
    "label": "Glaucoma",
    "category": "eye",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 2,
    "annualHappinessHit": 3,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 8500,
    "desc": "Eye pressure. Can cause blindness if untreated."
  },
  {
    "id": "myopia",
    "label": "Myopia (Nearsightedness)",
    "category": "eye",
    "severity": "mild",
    "chronic": false,
    "annualHealthHit": 0,
    "annualHappinessHit": 2,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 350,
    "desc": "Blurry distance vision. Glasses manage it; LASIK cures it."
  },
  {
    "id": "psoriasis",
    "label": "Psoriasis",
    "category": "skin",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 2,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Chronic skin condition. Kept down with treatment."
  },
  {
    "id": "eczema",
    "label": "Eczema",
    "category": "skin",
    "severity": "mild",
    "chronic": false,
    "annualHealthHit": 1,
    "annualHappinessHit": 3,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 350,
    "desc": "Itchy skin. Managed with creams."
  },
  {
    "id": "fert_male_low_sperm",
    "label": "Male Factor Infertility",
    "category": "fertility_m",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 0,
    "annualHappinessHit": 4,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Low sperm count. Surgery or ICSI helps."
  },
  {
    "id": "fert_female_tubes",
    "label": "Blocked Fallopian Tubes",
    "category": "fertility_f",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 0,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Tubes blocked. Surgery or IVF needed."
  },
  {
    "id": "fert_endometriosis",
    "label": "Endometriosis",
    "category": "fertility_f",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 2,
    "annualHappinessHit": 4,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Uterine tissue growth. Affects fertility."
  },
  {
    "id": "fracture",
    "label": "Bone Fracture",
    "category": "bone",
    "severity": "moderate",
    "chronic": true,
    "annualHealthHit": 3,
    "annualHappinessHit": 3,
    "deathRiskPerYear": 0.0,
    "treatmentUsd2026": 1800,
    "desc": "Broken bone. Heals in 6-12 weeks."
  },
  {
    "id": "head_injury",
    "label": "Head Injury",
    "category": "neuro",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 6,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.05,
    "treatmentUsd2026": 8500,
    "desc": "Brain trauma. Needs observation."
  },
  {
    "id": "congenital_heart",
    "label": "Congenital Heart Defect",
    "category": "cardio",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 5,
    "annualHappinessHit": 3,
    "deathRiskPerYear": 0.03,
    "treatmentUsd2026": 8500,
    "desc": "Born with it. Surgery can fix."
  },
  {
    "id": "dementia",
    "label": "Alzheimer's Disease",
    "category": "mental",
    "severity": "severe",
    "chronic": true,
    "annualHealthHit": 4,
    "annualHappinessHit": 4,
    "deathRiskPerYear": 0.10,
    "treatmentUsd2026": 8500,
    "desc": "Progressive memory loss. No cure — management only, it slows the decline."
  },
  {
    "id": "prostate_cancer",
    "label": "Prostate Cancer",
    "category": "cancer",
    "severity": "severe",
    "chronic": false,
    "annualHealthHit": 6,
    "annualHappinessHit": 5,
    "deathRiskPerYear": 0.05,
    "treatmentUsd2026": 8500,
    "desc": "Slow-growing in most men, dangerous when it spreads. Stage decides everything."
  }
];

export const HOUSING_CATALOG = {
  "egy": [
    {
      "id": "std_egy_0",
      "name": "Shubra / Ain Shams",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 75,
      "rooms": 2,
      "tier": "modest",
      "price2026": 1800000,
      "monthlyRent2026": 5500,
      "monthlyService2026": 275,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_egy_1",
      "name": "Nasr City / Dokki",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 4200000,
      "monthlyRent2026": 12000,
      "monthlyService2026": 600,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_egy_2",
      "name": "Maadi / Heliopolis",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 240,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 9500000,
      "monthlyRent2026": 26000,
      "monthlyService2026": 1300,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "std_egy_3",
      "name": "Smouha",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 3900000,
      "monthlyRent2026": 10500,
      "monthlyService2026": 525,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "comp_egy_madinaty",
      "name": "Madinaty (New Cairo)",
      "country": "egy",
      "city": "New Cairo",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 10125000,
      "monthlyRent2026": 59063,
      "monthlyService2026": 3375,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 2006,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_egy_noor",
      "name": "Noor City (Capital Gardens)",
      "country": "egy",
      "city": "Capital Gardens",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 8100000,
      "monthlyRent2026": 43875,
      "monthlyService2026": 2700,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 2021,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_egy_southmed",
      "name": "SouthMED (North Coast)",
      "country": "egy",
      "city": "North Coast",
      "kind": "compound_apt",
      "areaM2": 120,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 21600000,
      "monthlyRent2026": 162000,
      "monthlyService2026": 4800,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 2024,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_egy_celia",
      "name": "Celia (New Administrative Capital)",
      "country": "egy",
      "city": "New Administrative Capital",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 7020000,
      "monthlyRent2026": 38025,
      "monthlyService2026": 2430,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 2021,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_egy_rehab",
      "name": "Al Rehab (New Cairo)",
      "country": "egy",
      "city": "New Cairo",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 7425000,
      "monthlyRent2026": 46406,
      "monthlyService2026": 2025,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 1996,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_egy_telal_sokhna",
      "name": "Telal Sokhna (Ain Sokhna)",
      "country": "egy",
      "city": "Ain Sokhna",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 8100000,
      "monthlyRent2026": 54000,
      "monthlyService2026": 2700,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 2016,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_egy_fourteen_golf",
      "name": "Fourteen Golf (New Cairo)",
      "country": "egy",
      "city": "New Cairo",
      "kind": "compound_apt",
      "areaM2": 120,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 11040000,
      "monthlyRent2026": 69000,
      "monthlyService2026": 4200,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 2023,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_egy_al_rabwa",
      "name": "Al Rabwa (Sheikh Zayed)",
      "country": "egy",
      "city": "Sheikh Zayed",
      "kind": "compound_apt",
      "areaM2": 120,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 15000000,
      "monthlyRent2026": 81250,
      "monthlyService2026": 1440,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 1994,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_egy_virginia_beach",
      "name": "Virginia Beach (North Coast)",
      "country": "egy",
      "city": "North Coast",
      "kind": "compound_apt",
      "areaM2": 120,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 13800000,
      "monthlyRent2026": 80500,
      "monthlyService2026": 1200,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 1994,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_egy_may_fair",
      "name": "May Fair (El Shorouk)",
      "country": "egy",
      "city": "El Shorouk",
      "kind": "compound_apt",
      "areaM2": 120,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 11400000,
      "monthlyRent2026": 57000,
      "monthlyService2026": 960,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 7,
      "launchYear": 1994,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "lm_mahatet_el_raml",
      "name": "Mahatet El Raml Central Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 7920000,
      "monthlyRent2026": 23100,
      "monthlyService2026": 1155,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_fouad_street",
      "name": "Fouad Street Heritage Apartment",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 9520000,
      "monthlyRent2026": 27767,
      "monthlyService2026": 1388,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_saad_zaghloul",
      "name": "Saad Zaghloul Square Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 7150000,
      "monthlyRent2026": 20854,
      "monthlyService2026": 1043,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_corniche_stanley",
      "name": "Stanley Corniche Sea-View",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 11900000,
      "monthlyRent2026": 34708,
      "monthlyService2026": 1735,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_tahrir_downtown",
      "name": "Midan El Tahrir Area Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 6050000,
      "monthlyRent2026": 17646,
      "monthlyService2026": 882,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_downtown_talaat_harb",
      "name": "Talaat Harb / Downtown Heritage",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 5280000,
      "monthlyRent2026": 15400,
      "monthlyService2026": 770,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_heliopolis_korba",
      "name": "Heliopolis Korba Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 6820000,
      "monthlyRent2026": 19892,
      "monthlyService2026": 995,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_fifth_settlement_apt",
      "name": "Fifth Settlement Apartment",
      "country": "egy",
      "city": "New Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 3520000,
      "monthlyRent2026": 10267,
      "monthlyService2026": 513,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_ibrahimia_old",
      "name": "Ibrahimia Older-Building Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2080000,
      "monthlyRent2026": 6067,
      "monthlyService2026": 303,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_camp_caesar_old",
      "name": "Camp Caesar Older Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 3740000,
      "monthlyRent2026": 10908,
      "monthlyService2026": 545,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_cleopatra_old",
      "name": "Cleopatra Tram-Corridor Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2400000,
      "monthlyRent2026": 7000,
      "monthlyService2026": 350,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_gleem",
      "name": "Gleem Sea-View Apartment",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 6380000,
      "monthlyRent2026": 18608,
      "monthlyService2026": 930,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_kafr_elabdo",
      "name": "Kafr El Abdo Heritage Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 8680000,
      "monthlyRent2026": 25317,
      "monthlyService2026": 1266,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_sidi_gaber",
      "name": "Sidi Gaber Apartment",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 4950000,
      "monthlyRent2026": 14438,
      "monthlyService2026": 722,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_sporting",
      "name": "Sporting Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 5720000,
      "monthlyRent2026": 16683,
      "monthlyService2026": 834,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_sidi_bishr",
      "name": "Sidi Bishr Sea Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 5280000,
      "monthlyRent2026": 15400,
      "monthlyService2026": 770,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_miami",
      "name": "Miami Beach Apartment",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 5720000,
      "monthlyRent2026": 16683,
      "monthlyService2026": 834,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_agami",
      "name": "Agami Apartment",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2560000,
      "monthlyRent2026": 7467,
      "monthlyService2026": 373,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_zamalek",
      "name": "Zamalek Belle Époque Apartment",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 13300000,
      "monthlyRent2026": 38792,
      "monthlyService2026": 1940,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_garden_city",
      "name": "Garden City Apartment",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 12320000,
      "monthlyRent2026": 35933,
      "monthlyService2026": 1797,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_maadi_degla",
      "name": "Maadi Degla Low-Rise",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 5720000,
      "monthlyRent2026": 16683,
      "monthlyService2026": 834,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_heliopolis",
      "name": "Korba Heliopolis Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 6600000,
      "monthlyRent2026": 19250,
      "monthlyService2026": 962,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_dokki",
      "name": "Dokki Central Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 3680000,
      "monthlyRent2026": 10733,
      "monthlyService2026": 537,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_mohandessin",
      "name": "Mohandessin Apartment",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 7150000,
      "monthlyRent2026": 20854,
      "monthlyService2026": 1043,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_nasrcity",
      "name": "Nasr City 8th District Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2880000,
      "monthlyRent2026": 8400,
      "monthlyService2026": 420,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_nasr_city_10th",
      "name": "Nasr City 10th District",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 3040000,
      "monthlyRent2026": 8867,
      "monthlyService2026": 443,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_mokattam",
      "name": "Mokattam Apartment",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2720000,
      "monthlyRent2026": 7933,
      "monthlyService2026": 397,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_shubra",
      "name": "Shubra Apartment",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 2420000,
      "monthlyRent2026": 7058,
      "monthlyService2026": 353,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_ain_shams",
      "name": "Ain Shams Apartment",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 2640000,
      "monthlyRent2026": 7700,
      "monthlyService2026": 385,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_obour",
      "name": "Obour City Apartment",
      "country": "egy",
      "city": "Obour",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 1600000,
      "monthlyRent2026": 4667,
      "monthlyService2026": 233,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_shorouk",
      "name": "El Shorouk Apartment",
      "country": "egy",
      "city": "El Shorouk",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2080000,
      "monthlyRent2026": 6067,
      "monthlyService2026": 303,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_badr",
      "name": "Badr City Apartment",
      "country": "egy",
      "city": "Badr",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 1440000,
      "monthlyRent2026": 4200,
      "monthlyService2026": 210,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_sadat",
      "name": "Sadat City Apartment",
      "country": "egy",
      "city": "Sadat City",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 1280000,
      "monthlyRent2026": 3733,
      "monthlyService2026": 187,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_tenth_ramadan",
      "name": "10th of Ramadan Flat",
      "country": "egy",
      "city": "10th of Ramadan",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 1200000,
      "monthlyRent2026": 3500,
      "monthlyService2026": 175,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_sixth_october",
      "name": "6th of October Apartment",
      "country": "egy",
      "city": "6th of October",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2240000,
      "monthlyRent2026": 6533,
      "monthlyService2026": 327,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_sheikh_zayed",
      "name": "Sheikh Zayed Apartment",
      "country": "egy",
      "city": "Sheikh Zayed",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 6050000,
      "monthlyRent2026": 17646,
      "monthlyService2026": 882,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_new_cairo_5th",
      "name": "New Cairo 5th Settlement",
      "country": "egy",
      "city": "New Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 6600000,
      "monthlyRent2026": 19250,
      "monthlyService2026": 962,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_rehab_ready",
      "name": "Al Rehab Ready Flat",
      "country": "egy",
      "city": "New Cairo",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 4950000,
      "monthlyRent2026": 14438,
      "monthlyService2026": 722,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_new_capital_downtown",
      "name": "New Capital Downtown",
      "country": "egy",
      "city": "New Administrative Capital",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 4950000,
      "monthlyRent2026": 14438,
      "monthlyService2026": 722,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_alex_mandara",
      "name": "Mandara Apartment",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2240000,
      "monthlyRent2026": 6533,
      "monthlyService2026": 327,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_borg_el_arab",
      "name": "Borg El Arab Apartment",
      "country": "egy",
      "city": "Borg El Arab",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 1440000,
      "monthlyRent2026": 4200,
      "monthlyService2026": 210,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "prop_11h-katameya-dunes",
      "name": "Katameya Dunes — Villa",
      "country": "egy",
      "city": "New Cairo",
      "kind": "villa",
      "areaM2": 380,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 36100000,
      "monthlyRent2026": 105292,
      "monthlyService2026": 5265,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2010,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11h-uptown-cairo",
      "name": "Uptown Cairo — Apartment",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 170,
      "rooms": 3,
      "tier": "standard",
      "price2026": 11050000,
      "monthlyRent2026": 32229,
      "monthlyService2026": 1611,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2008,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-marassi-bay",
      "name": "Marassi Bay — Chalet",
      "country": "egy",
      "city": "North Coast",
      "kind": "apartment",
      "areaM2": 150,
      "rooms": 3,
      "tier": "standard",
      "price2026": 18000000,
      "monthlyRent2026": 52500,
      "monthlyService2026": 2625,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2008,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-sidi-heneish",
      "name": "Sidi Heneish — Villa",
      "country": "egy",
      "city": "North Coast",
      "kind": "villa",
      "areaM2": 420,
      "rooms": 5,
      "tier": "upscale",
      "price2026": 54600000,
      "monthlyRent2026": 159250,
      "monthlyService2026": 7962,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2010,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11h-madinaty-b12",
      "name": "Madinaty B12 — Apartment",
      "country": "egy",
      "city": "New Cairo",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 6240000,
      "monthlyRent2026": 18200,
      "monthlyService2026": 910,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2008,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-rehab-city",
      "name": "Al Rehab City — Apartment",
      "country": "egy",
      "city": "New Cairo",
      "kind": "apartment",
      "areaM2": 120,
      "rooms": 2,
      "tier": "standard",
      "price2026": 5040000,
      "monthlyRent2026": 14700,
      "monthlyService2026": 735,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2005,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-helio-lake",
      "name": "Heliopolis Lake View — Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 3,
      "tier": "standard",
      "price2026": 7700000,
      "monthlyRent2026": 22458,
      "monthlyService2026": 1123,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-zamalek-gezira",
      "name": "Zamalek Gezira St — Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 180,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 20700000,
      "monthlyRent2026": 60375,
      "monthlyService2026": 3019,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11h-smouha-villa",
      "name": "Smouha — Villa",
      "country": "egy",
      "city": "Alexandria",
      "kind": "villa",
      "areaM2": 400,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 34000000,
      "monthlyRent2026": 99167,
      "monthlyService2026": 4958,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11h-mansheya",
      "name": "Alexandria Mansheya — Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 5850000,
      "monthlyRent2026": 17063,
      "monthlyService2026": 853,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-helwan",
      "name": "Cairo Helwan — Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 120,
      "rooms": 2,
      "tier": "standard",
      "price2026": 3600000,
      "monthlyRent2026": 10500,
      "monthlyService2026": 525,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-abbassia",
      "name": "Cairo Abbassia — Flat",
      "country": "egy",
      "city": "Cairo",
      "kind": "apartment",
      "areaM2": 120,
      "rooms": 3,
      "tier": "standard",
      "price2026": 5400000,
      "monthlyRent2026": 15750,
      "monthlyService2026": 788,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-new-maadi",
      "name": "Cairo New Maadi — Villa",
      "country": "egy",
      "city": "Cairo",
      "kind": "villa",
      "areaM2": 320,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 27200000,
      "monthlyRent2026": 79333,
      "monthlyService2026": 3967,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11o-agouza",
      "name": "Giza Agouza — Flat",
      "country": "egy",
      "city": "Giza",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 7150000,
      "monthlyRent2026": 20854,
      "monthlyService2026": 1043,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-zizenia",
      "name": "Alexandria Zizenia — Flat",
      "country": "egy",
      "city": "Alexandria",
      "kind": "apartment",
      "areaM2": 150,
      "rooms": 3,
      "tier": "standard",
      "price2026": 10500000,
      "monthlyRent2026": 30625,
      "monthlyService2026": 1531,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-sakala",
      "name": "Hurghada Sakala — Chalet",
      "country": "egy",
      "city": "Hurghada",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 3850000,
      "monthlyRent2026": 11229,
      "monthlyService2026": 561,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2005,
      "prestige": 6,
      "happinessBoost": 3
    }
  ],
  "sau": [
    {
      "id": "std_sau_0",
      "name": "Al Malaz Apartment",
      "country": "sau",
      "city": "Riyadh",
      "kind": "apartment",
      "areaM2": 75,
      "rooms": 2,
      "tier": "modest",
      "price2026": 480000,
      "monthlyRent2026": 2600,
      "monthlyService2026": 130,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_sau_1",
      "name": "Al Narjis Family Flat",
      "country": "sau",
      "city": "Riyadh",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 920000,
      "monthlyRent2026": 4800,
      "monthlyService2026": 240,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_sau_2",
      "name": "Al Malqa Duplex Villa",
      "country": "sau",
      "city": "Riyadh",
      "kind": "villa",
      "areaM2": 240,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 2400000,
      "monthlyRent2026": 10500,
      "monthlyService2026": 525,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "std_sau_3",
      "name": "Al Rawdah Apartment",
      "country": "sau",
      "city": "Jeddah",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 850000,
      "monthlyRent2026": 4400,
      "monthlyService2026": 220,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "comp_sau_roshn_sedra",
      "name": "ROSHN Sedra (Riyadh)",
      "country": "sau",
      "city": "Riyadh",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 918000,
      "monthlyRent2026": 5355,
      "monthlyService2026": 810,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2019,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_sau_diriyah_residences",
      "name": "Diriyah Gate Residences (Riyadh)",
      "country": "sau",
      "city": "Riyadh",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2227500,
      "monthlyRent2026": 11138,
      "monthlyService2026": 1620,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2021,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_sau_shams_ar_riyadh",
      "name": "Shams Ar-Riyadh (Riyadh)",
      "country": "sau",
      "city": "Riyadh",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 972000,
      "monthlyRent2026": 5508,
      "monthlyService2026": 1080,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2018,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_sau_emaar_riyadh_gate",
      "name": "Emaar Riyadh Gate (Riyadh)",
      "country": "sau",
      "city": "Riyadh",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 945000,
      "monthlyRent2026": 5512,
      "monthlyService2026": 1080,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2023,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_sau_nhc_riyadh_residential",
      "name": "NHC Residential District (Riyadh)",
      "country": "sau",
      "city": "Riyadh",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 702000,
      "monthlyRent2026": 4095,
      "monthlyService2026": 675,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2019,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_sau_jeddah_tower",
      "name": "Jeddah Tower Residences (Jeddah)",
      "country": "sau",
      "city": "Jeddah",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2160000,
      "monthlyRent2026": 10800,
      "monthlyService2026": 2025,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2014,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_sau_neom_sindalah",
      "name": "Sindalah Island Villas (NEOM)",
      "country": "sau",
      "city": "NEOM",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 4725000,
      "monthlyRent2026": 31500,
      "monthlyService2026": 3375,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2022,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_sau_qiddiya_residences",
      "name": "Qiddiya Entertainment City (Riyadh)",
      "country": "sau",
      "city": "Riyadh",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 877500,
      "monthlyRent2026": 5484,
      "monthlyService2026": 1080,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2023,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_sau_amala_residences",
      "name": "AMAALA Residences (AMAALA)",
      "country": "sau",
      "city": "AMAALA",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 3780000,
      "monthlyRent2026": 25200,
      "monthlyService2026": 2970,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2022,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_sau_riyadh_kafd",
      "name": "KAFD Residential (Riyadh)",
      "country": "sau",
      "city": "Riyadh",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1620000,
      "monthlyRent2026": 8775,
      "monthlyService2026": 1620,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2020,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "lm_olaya_riyadh",
      "name": "Al Olaya Apartment",
      "country": "sau",
      "city": "Riyadh",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 858000,
      "monthlyRent2026": 2503,
      "monthlyService2026": 125,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_malqa_riyadh",
      "name": "Al Malqa Apartment",
      "country": "sau",
      "city": "Riyadh",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 748000,
      "monthlyRent2026": 2182,
      "monthlyService2026": 109,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_shati_jeddah",
      "name": "Al Shati Sea Apartment",
      "country": "sau",
      "city": "Jeddah",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1148000,
      "monthlyRent2026": 3348,
      "monthlyService2026": 167,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_dammam_corniche",
      "name": "Dammam Corniche Apartment",
      "country": "sau",
      "city": "Dammam",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 550000,
      "monthlyRent2026": 1604,
      "monthlyService2026": 80,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_makkah_central",
      "name": "Makkah Central Apartment",
      "country": "sau",
      "city": "Makkah",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1045000,
      "monthlyRent2026": 3048,
      "monthlyService2026": 152,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_madinah_central",
      "name": "Madinah Central Apartment",
      "country": "sau",
      "city": "Madinah",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 935000,
      "monthlyRent2026": 2727,
      "monthlyService2026": 136,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-malqa",
      "name": "Riyadh Al Malqa — Villa",
      "country": "sau",
      "city": "Riyadh",
      "kind": "villa",
      "areaM2": 420,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 4200000,
      "monthlyRent2026": 12250,
      "monthlyService2026": 612,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2000,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11h-rawdah",
      "name": "Jeddah Al Rawdah — Family Apartment",
      "country": "sau",
      "city": "Jeddah",
      "kind": "apartment",
      "areaM2": 160,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1088000,
      "monthlyRent2026": 3173,
      "monthlyService2026": 159,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2000,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-sulimaniyah",
      "name": "Riyadh Al Sulimaniyah — Flat",
      "country": "sau",
      "city": "Riyadh",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1190000,
      "monthlyRent2026": 3471,
      "monthlyService2026": 174,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2000,
      "prestige": 6,
      "happinessBoost": 3
    }
  ],
  "uae": [
    {
      "id": "std_uae_0",
      "name": "Al Nahda Studio/1BR",
      "country": "uae",
      "city": "Sharjah/Dubai",
      "kind": "apartment",
      "areaM2": 75,
      "rooms": 2,
      "tier": "modest",
      "price2026": 620000,
      "monthlyRent2026": 4500,
      "monthlyService2026": 225,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_uae_1",
      "name": "Jumeirah Village Circle 2BR",
      "country": "uae",
      "city": "Dubai",
      "kind": "villa",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1350000,
      "monthlyRent2026": 7800,
      "monthlyService2026": 390,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_uae_2",
      "name": "Dubai Marina Residence",
      "country": "uae",
      "city": "Dubai",
      "kind": "apartment",
      "areaM2": 240,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 2900000,
      "monthlyRent2026": 16500,
      "monthlyService2026": 825,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "std_uae_3",
      "name": "Al Reem Island Flat",
      "country": "uae",
      "city": "Abu Dhabi",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1450000,
      "monthlyRent2026": 8200,
      "monthlyService2026": 410,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "comp_uae_downtown_views",
      "name": "Downtown Views II (Dubai)",
      "country": "uae",
      "city": "Dubai",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 3780000,
      "monthlyRent2026": 22680,
      "monthlyService2026": 2025,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2017,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_uae_palm_jumeirah_villas",
      "name": "Palm Jumeirah Frond Villas (Dubai)",
      "country": "uae",
      "city": "Dubai",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 7020000,
      "monthlyRent2026": 35100,
      "monthlyService2026": 2970,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2007,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_uae_emaar_beachfront",
      "name": "Emaar Beachfront (Dubai)",
      "country": "uae",
      "city": "Dubai",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 3240000,
      "monthlyRent2026": 17550,
      "monthlyService2026": 1890,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2020,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_uae_damac_hills",
      "name": "DAMAC Hills (Dubai)",
      "country": "uae",
      "city": "Dubai",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1282500,
      "monthlyRent2026": 8016,
      "monthlyService2026": 1080,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2017,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_uae_saadiyat_island",
      "name": "Saadiyat Island Residences (Abu Dhabi)",
      "country": "uae",
      "city": "Abu Dhabi",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2430000,
      "monthlyRent2026": 13162,
      "monthlyService2026": 1620,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2015,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_uae_aldar_reem",
      "name": "Al Reem Island Residences (Abu Dhabi)",
      "country": "uae",
      "city": "Abu Dhabi",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1755000,
      "monthlyRent2026": 10238,
      "monthlyService2026": 1350,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2010,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_uae_sobha_hartland",
      "name": "Sobha Hartland (Dubai)",
      "country": "uae",
      "city": "Dubai",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2160000,
      "monthlyRent2026": 12600,
      "monthlyService2026": 1620,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2017,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_uae_sobha_hartland_ii",
      "name": "Sobha Hartland II (Dubai)",
      "country": "uae",
      "city": "Dubai",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2430000,
      "monthlyRent2026": 13770,
      "monthlyService2026": 1890,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2022,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_uae_damac_lagoons",
      "name": "DAMAC Lagoons (Dubai)",
      "country": "uae",
      "city": "Dubai",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1485000,
      "monthlyRent2026": 9281,
      "monthlyService2026": 1350,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2021,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_uae_emaar_valley_uae",
      "name": "Emaar The Valley (Dubai)",
      "country": "uae",
      "city": "Dubai",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1282500,
      "monthlyRent2026": 8016,
      "monthlyService2026": 1080,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2020,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "lm_dubai_jlt",
      "name": "Jumeirah Lake Towers",
      "country": "uae",
      "city": "Dubai",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1430000,
      "monthlyRent2026": 4171,
      "monthlyService2026": 209,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_abudhabi_corniche",
      "name": "Abu Dhabi Corniche Apartment",
      "country": "uae",
      "city": "Abu Dhabi",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 2100000,
      "monthlyRent2026": 6125,
      "monthlyService2026": 306,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_sharjah_al_majaz",
      "name": "Al Majaz Apartment",
      "country": "uae",
      "city": "Sharjah",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 990000,
      "monthlyRent2026": 2888,
      "monthlyService2026": 144,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-business-bay",
      "name": "Dubai Business Bay — Apartment",
      "country": "uae",
      "city": "Dubai",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 2,
      "tier": "standard",
      "price2026": 2340000,
      "monthlyRent2026": 6825,
      "monthlyService2026": 341,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2008,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-arjan",
      "name": "Dubai Arjan — Apartment",
      "country": "uae",
      "city": "Dubai",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1320000,
      "monthlyRent2026": 3850,
      "monthlyService2026": 192,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2010,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-yas-island",
      "name": "Abu Dhabi Yas Island — Apartment",
      "country": "uae",
      "city": "Abu Dhabi",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 3,
      "tier": "standard",
      "price2026": 2100000,
      "monthlyRent2026": 6125,
      "monthlyService2026": 306,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2010,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-al-barsha",
      "name": "Dubai Al Barsha — Apartment",
      "country": "uae",
      "city": "Dubai",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1690000,
      "monthlyRent2026": 4929,
      "monthlyService2026": 246,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2005,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-deira",
      "name": "Dubai Deira — Flat",
      "country": "uae",
      "city": "Dubai",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1210000,
      "monthlyRent2026": 3529,
      "monthlyService2026": 176,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2005,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-jbr",
      "name": "Dubai Jumeirah Beach Residence — Apartment",
      "country": "uae",
      "city": "Dubai",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 2,
      "tier": "standard",
      "price2026": 2600000,
      "monthlyRent2026": 7583,
      "monthlyService2026": 379,
      "offPlanAvailable": true,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2007,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-khalidiyah",
      "name": "Abu Dhabi Al Khalidiyah — Flat",
      "country": "uae",
      "city": "Abu Dhabi",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1820000,
      "monthlyRent2026": 5308,
      "monthlyService2026": 265,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2005,
      "prestige": 6,
      "happinessBoost": 3
    }
  ],
  "gbr": [
    {
      "id": "std_gbr_0",
      "name": "Zone 3 Studio Flat",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 75,
      "rooms": 2,
      "tier": "modest",
      "price2026": 285000,
      "monthlyRent2026": 1150,
      "monthlyService2026": 58,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_gbr_1",
      "name": "Manchester Deansgate 2BR",
      "country": "gbr",
      "city": "Manchester",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 310000,
      "monthlyRent2026": 1350,
      "monthlyService2026": 68,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_gbr_2",
      "name": "Kensington / Canary Wharf 2BR",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 240,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 780000,
      "monthlyRent2026": 2900,
      "monthlyService2026": 145,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "comp_gbr_one_hyde_park",
      "name": "One Hyde Park (London)",
      "country": "gbr",
      "city": "London",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 10125000,
      "monthlyRent2026": 21094,
      "monthlyService2026": 1080,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2011,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_gbr_battersea_power",
      "name": "Battersea Power Station (London)",
      "country": "gbr",
      "city": "London",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2430000,
      "monthlyRent2026": 7088,
      "monthlyService2026": 675,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2020,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_gbr_nine_elms",
      "name": "Nine Elms Park (London)",
      "country": "gbr",
      "city": "London",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2025000,
      "monthlyRent2026": 5906,
      "monthlyService2026": 608,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2016,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_gbr_chelsea_barracks",
      "name": "Chelsea Barracks (London)",
      "country": "gbr",
      "city": "London",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 7425000,
      "monthlyRent2026": 15469,
      "monthlyService2026": 945,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2020,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_gbr_southbank_place",
      "name": "Southbank Place (London)",
      "country": "gbr",
      "city": "London",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2835000,
      "monthlyRent2026": 7560,
      "monthlyService2026": 742,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2019,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_gbr_deansgate_square",
      "name": "Deansgate Square (Manchester)",
      "country": "gbr",
      "city": "Manchester",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 729000,
      "monthlyRent2026": 3038,
      "monthlyService2026": 405,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2019,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_gbr_elizabeth_tower",
      "name": "Elizabeth Tower (Manchester)",
      "country": "gbr",
      "city": "Manchester",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 810000,
      "monthlyRent2026": 3240,
      "monthlyService2026": 405,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2021,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_gbr_edinburgh_quarter_mile",
      "name": "Edinburgh Quartermile (Edinburgh)",
      "country": "gbr",
      "city": "Edinburgh",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 918000,
      "monthlyRent2026": 3060,
      "monthlyService2026": 338,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2012,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "lm_london_shoreditch",
      "name": "Shoreditch Warehouse Flat",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1960000,
      "monthlyRent2026": 5717,
      "monthlyService2026": 286,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_london_hackney",
      "name": "Hackney Period Conversion",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1210000,
      "monthlyRent2026": 3529,
      "monthlyService2026": 176,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_london_peckham",
      "name": "Peckham Apartment",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1045000,
      "monthlyRent2026": 3048,
      "monthlyService2026": 152,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_london_canary_wharf",
      "name": "Canary Wharf Tower Flat",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1430000,
      "monthlyRent2026": 4171,
      "monthlyService2026": 209,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_london_notting_hill",
      "name": "Notting Hill Garden Flat",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 2520000,
      "monthlyRent2026": 7350,
      "monthlyService2026": 368,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_london_shoreditch_apt",
      "name": "Shoreditch Apartment",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1680000,
      "monthlyRent2026": 4900,
      "monthlyService2026": 245,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_london_camden",
      "name": "Camden Apartment",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1960000,
      "monthlyRent2026": 5717,
      "monthlyService2026": 286,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_manchester_northern_quarter",
      "name": "Northern Quarter Flat",
      "country": "gbr",
      "city": "Manchester",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 700000,
      "monthlyRent2026": 2042,
      "monthlyService2026": 102,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_edinburgh_newtown",
      "name": "New Town Apartment",
      "country": "gbr",
      "city": "Edinburgh",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 910000,
      "monthlyRent2026": 2654,
      "monthlyService2026": 133,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-brixton",
      "name": "London Brixton — Flat",
      "country": "gbr",
      "city": "London",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1045000,
      "monthlyRent2026": 3048,
      "monthlyService2026": 152,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-didsbury",
      "name": "Manchester Didsbury — House",
      "country": "gbr",
      "city": "Manchester",
      "kind": "villa",
      "areaM2": 160,
      "rooms": 3,
      "tier": "standard",
      "price2026": 832000,
      "monthlyRent2026": 2427,
      "monthlyService2026": 121,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-hyde-park-leeds",
      "name": "Leeds Hyde Park — Flat",
      "country": "gbr",
      "city": "Leeds",
      "kind": "apartment",
      "areaM2": 100,
      "rooms": 2,
      "tier": "standard",
      "price2026": 380000,
      "monthlyRent2026": 1108,
      "monthlyService2026": 55,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-headingley",
      "name": "Leeds Headingley — House",
      "country": "gbr",
      "city": "Leeds",
      "kind": "villa",
      "areaM2": 150,
      "rooms": 3,
      "tier": "standard",
      "price2026": 675000,
      "monthlyRent2026": 1969,
      "monthlyService2026": 98,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-stockbridge",
      "name": "Edinburgh Stockbridge — Flat",
      "country": "gbr",
      "city": "Edinburgh",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 880000,
      "monthlyRent2026": 2567,
      "monthlyService2026": 128,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    }
  ],
  "usa": [
    {
      "id": "std_usa_0",
      "name": "Queens / Austin 1BR",
      "country": "usa",
      "city": "Austin",
      "kind": "apartment",
      "areaM2": 75,
      "rooms": 2,
      "tier": "modest",
      "price2026": 290000,
      "monthlyRent2026": 1450,
      "monthlyService2026": 72,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_usa_1",
      "name": "Suburban Family Townhouse",
      "country": "usa",
      "city": "Chicago",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 465000,
      "monthlyRent2026": 2250,
      "monthlyService2026": 112,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_usa_2",
      "name": "Brooklyn / Bay Area Condo",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 240,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 1150000,
      "monthlyRent2026": 4100,
      "monthlyService2026": 205,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "comp_usa_hudson_yards",
      "name": "Hudson Yards Residences (New York)",
      "country": "usa",
      "city": "New York",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 4320000,
      "monthlyRent2026": 15120,
      "monthlyService2026": 405,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2019,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_usa_brickell_city_centre",
      "name": "Reach & Rise Brickell (Miami)",
      "country": "usa",
      "city": "Miami",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1687500,
      "monthlyRent2026": 9141,
      "monthlyService2026": 338,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2016,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_usa_estates_at_westwood",
      "name": "The Estates at Westwood (Austin)",
      "country": "usa",
      "city": "Austin",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 702000,
      "monthlyRent2026": 2925,
      "monthlyService2026": 202,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2015,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_usa_porsche_design_tower",
      "name": "Porsche Design Tower (Miami)",
      "country": "usa",
      "city": "Miami",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 3375000,
      "monthlyRent2026": 15469,
      "monthlyService2026": 675,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2017,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_usa_wolf_point",
      "name": "Wolf Point East (Chicago)",
      "country": "usa",
      "city": "Chicago",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1080000,
      "monthlyRent2026": 4950,
      "monthlyService2026": 338,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2019,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_usa_the_century",
      "name": "The Century (Los Angeles)",
      "country": "usa",
      "city": "Los Angeles",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2700000,
      "monthlyRent2026": 11250,
      "monthlyService2026": 540,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2009,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_usa_the_independent",
      "name": "The Independent (Austin)",
      "country": "usa",
      "city": "Austin",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1215000,
      "monthlyRent2026": 5062,
      "monthlyService2026": 270,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2019,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_usa_44_east_ave",
      "name": "44 East Ave (Austin)",
      "country": "usa",
      "city": "Austin",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1080000,
      "monthlyRent2026": 4500,
      "monthlyService2026": 270,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2020,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_usa_spire_seattle",
      "name": "Spire (Seattle)",
      "country": "usa",
      "city": "Seattle",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1215000,
      "monthlyRent2026": 5265,
      "monthlyService2026": 338,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2021,
      "prestige": 8,
      "happinessBoost": 3
    },
    {
      "id": "comp_usa_millennium_tower",
      "name": "Millennium Tower (San Francisco)",
      "country": "usa",
      "city": "San Francisco",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2430000,
      "monthlyRent2026": 9112,
      "monthlyService2026": 540,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2009,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "lm_brooklyn_williamsburg",
      "name": "Williamsburg Waterfront Loft",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1960000,
      "monthlyRent2026": 5717,
      "monthlyService2026": 286,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_brooklyn_park_slope",
      "name": "Park Slope Brownstone Floor",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 2240000,
      "monthlyRent2026": 6533,
      "monthlyService2026": 327,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_queens_astoria",
      "name": "Astoria Apartment",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 935000,
      "monthlyRent2026": 2727,
      "monthlyService2026": 136,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_manhattan_chelsea",
      "name": "Chelsea Loft",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 2800000,
      "monthlyRent2026": 8167,
      "monthlyService2026": 408,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_austin_east",
      "name": "East Austin Bungalow",
      "country": "usa",
      "city": "Austin",
      "kind": "villa",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 715000,
      "monthlyRent2026": 2085,
      "monthlyService2026": 104,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_miami_wynwood",
      "name": "Wynwood Studio",
      "country": "usa",
      "city": "Miami",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 825000,
      "monthlyRent2026": 2406,
      "monthlyService2026": 120,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_seattle_capitol_hill",
      "name": "Capitol Hill Apartment",
      "country": "usa",
      "city": "Seattle",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1045000,
      "monthlyRent2026": 3048,
      "monthlyService2026": 152,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_pilsen_chicago",
      "name": "Pilsen Brick Multi-Family",
      "country": "usa",
      "city": "Chicago",
      "kind": "apartment",
      "areaM2": 80,
      "rooms": 2,
      "tier": "modest",
      "price2026": 384000,
      "monthlyRent2026": 1120,
      "monthlyService2026": 56,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "lm_katy_houston",
      "name": "Katy Family Home",
      "country": "usa",
      "city": "Houston",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 264000,
      "monthlyRent2026": 770,
      "monthlyService2026": 38,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_round_rock",
      "name": "Round Rock Suburban",
      "country": "usa",
      "city": "Austin",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 374000,
      "monthlyRent2026": 1091,
      "monthlyService2026": 55,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_mesa_phoenix",
      "name": "Mesa Family Home",
      "country": "usa",
      "city": "Phoenix",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 308000,
      "monthlyRent2026": 898,
      "monthlyService2026": 45,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_sandy_springs",
      "name": "Sandy Springs House",
      "country": "usa",
      "city": "Atlanta",
      "kind": "villa",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 396000,
      "monthlyRent2026": 1155,
      "monthlyService2026": 58,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_jersey_city",
      "name": "Jersey City Apartment",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 880000,
      "monthlyRent2026": 2567,
      "monthlyService2026": 128,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_austin_south_congress",
      "name": "South Congress Apartment",
      "country": "usa",
      "city": "Austin",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 980000,
      "monthlyRent2026": 2858,
      "monthlyService2026": 143,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_brooklyn_bushwick",
      "name": "Bushwick Apartment",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 990000,
      "monthlyRent2026": 2888,
      "monthlyService2026": 144,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_denver_cap_hill",
      "name": "Cap Hill Apartment",
      "country": "usa",
      "city": "Denver",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 3,
      "tier": "standard",
      "price2026": 605000,
      "monthlyRent2026": 1765,
      "monthlyService2026": 88,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-williamsburg",
      "name": "Brooklyn Williamsburg — Bedford Loft",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1820000,
      "monthlyRent2026": 5308,
      "monthlyService2026": 265,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-silver-lake",
      "name": "Los Angeles Silver Lake — House",
      "country": "usa",
      "city": "Los Angeles",
      "kind": "villa",
      "areaM2": 200,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2200000,
      "monthlyRent2026": 6417,
      "monthlyService2026": 321,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11h-capitol-hill",
      "name": "Seattle Capitol Hill — House",
      "country": "usa",
      "city": "Seattle",
      "kind": "villa",
      "areaM2": 190,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1615000,
      "monthlyRent2026": 4710,
      "monthlyService2026": 236,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11h-soma",
      "name": "San Francisco SoMa — Loft",
      "country": "usa",
      "city": "San Francisco",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1950000,
      "monthlyRent2026": 5688,
      "monthlyService2026": 284,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-midtown-atl",
      "name": "Atlanta Midtown — Flat",
      "country": "usa",
      "city": "Atlanta",
      "kind": "apartment",
      "areaM2": 120,
      "rooms": 2,
      "tier": "standard",
      "price2026": 540000,
      "monthlyRent2026": 1575,
      "monthlyService2026": 79,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-south-end",
      "name": "Boston South End — Flat",
      "country": "usa",
      "city": "Boston",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1560000,
      "monthlyRent2026": 4550,
      "monthlyService2026": 228,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-lic",
      "name": "New York Long Island City — Flat",
      "country": "usa",
      "city": "New York",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1210000,
      "monthlyRent2026": 3529,
      "monthlyService2026": 176,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-lincoln-park",
      "name": "Chicago Lincoln Park — House",
      "country": "usa",
      "city": "Chicago",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1890000,
      "monthlyRent2026": 5512,
      "monthlyService2026": 276,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11o-coral-gables",
      "name": "Miami Coral Gables — House",
      "country": "usa",
      "city": "Miami",
      "kind": "villa",
      "areaM2": 220,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2200000,
      "monthlyRent2026": 6417,
      "monthlyService2026": 321,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "prop_11o-beacon-hill",
      "name": "Boston Beacon Hill — Flat",
      "country": "usa",
      "city": "Boston",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1375000,
      "monthlyRent2026": 4010,
      "monthlyService2026": 200,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    }
  ],
  "deu": [
    {
      "id": "std_deu_0",
      "name": "Wedding / Neuk\u00f6lln Altbau 1BR",
      "country": "deu",
      "city": "Berlin",
      "kind": "apartment",
      "areaM2": 75,
      "rooms": 2,
      "tier": "modest",
      "price2026": 240000,
      "monthlyRent2026": 850,
      "monthlyService2026": 42,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_deu_1",
      "name": "Charlottenburg / Munich 3-Zimmer",
      "country": "deu",
      "city": "Munich",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 520000,
      "monthlyRent2026": 1450,
      "monthlyService2026": 72,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_deu_2",
      "name": "Bogenhausen Townhouse",
      "country": "deu",
      "city": "Munich",
      "kind": "apartment",
      "areaM2": 240,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 1050000,
      "monthlyRent2026": 2500,
      "monthlyService2026": 125,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "comp_deu_upper_west_berlin",
      "name": "Upper West (Berlin)",
      "country": "deu",
      "city": "Berlin",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1485000,
      "monthlyRent2026": 3712,
      "monthlyService2026": 405,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2017,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_deu_eden_tower",
      "name": "Eden Tower (Frankfurt)",
      "country": "deu",
      "city": "Frankfurt",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1755000,
      "monthlyRent2026": 4388,
      "monthlyService2026": 472,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2021,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_deu_bavaria_park",
      "name": "Bavaria Park Quartier (Munich)",
      "country": "deu",
      "city": "Munich",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1890000,
      "monthlyRent2026": 4410,
      "monthlyService2026": 405,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2020,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_deu_hafen_city",
      "name": "HafenCity (Hamburg)",
      "country": "deu",
      "city": "Hamburg",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1552500,
      "monthlyRent2026": 3881,
      "monthlyService2026": 338,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2010,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "lm_berlin_kreuzberg",
      "name": "Kreuzberg Altbau",
      "country": "deu",
      "city": "Berlin",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1050000,
      "monthlyRent2026": 3062,
      "monthlyService2026": 153,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_frankfurt_sachsenhausen",
      "name": "Sachsenhausen Apartment",
      "country": "deu",
      "city": "Frankfurt",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1260000,
      "monthlyRent2026": 3675,
      "monthlyService2026": 184,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-schwabing",
      "name": "Munich Schwabing — Flat",
      "country": "deu",
      "city": "Munich",
      "kind": "apartment",
      "areaM2": 120,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1320000,
      "monthlyRent2026": 3850,
      "monthlyService2026": 192,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-ehrenfeld",
      "name": "Cologne Ehrenfeld — Flat",
      "country": "deu",
      "city": "Cologne",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 660000,
      "monthlyRent2026": 1925,
      "monthlyService2026": 96,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-lehel",
      "name": "Munich Lehel — Flat",
      "country": "deu",
      "city": "Munich",
      "kind": "apartment",
      "areaM2": 110,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1320000,
      "monthlyRent2026": 3850,
      "monthlyService2026": 192,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    }
  ],
  "can": [
    {
      "id": "std_can_0",
      "name": "Scarborough Basement/Studio",
      "country": "can",
      "city": "Toronto",
      "kind": "apartment",
      "areaM2": 75,
      "rooms": 2,
      "tier": "modest",
      "price2026": 440000,
      "monthlyRent2026": 1600,
      "monthlyService2026": 80,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_can_1",
      "name": "Midtown Condo 2BR",
      "country": "can",
      "city": "Toronto",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 760000,
      "monthlyRent2026": 2450,
      "monthlyService2026": 122,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_can_2",
      "name": "Kitsilano Family Home",
      "country": "can",
      "city": "Vancouver",
      "kind": "villa",
      "areaM2": 240,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 1550000,
      "monthlyRent2026": 3900,
      "monthlyService2026": 195,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    },
    {
      "id": "comp_can_the_one_toronto",
      "name": "The One (Toronto)",
      "country": "can",
      "city": "Toronto",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 2160000,
      "monthlyRent2026": 6300,
      "monthlyService2026": 405,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2017,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_can_vancouver_house",
      "name": "Vancouver House (Vancouver)",
      "country": "can",
      "city": "Vancouver",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1890000,
      "monthlyRent2026": 5040,
      "monthlyService2026": 405,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2020,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "comp_can_shangri_la_toronto",
      "name": "Shangri-La Toronto (Toronto)",
      "country": "can",
      "city": "Toronto",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1755000,
      "monthlyRent2026": 5119,
      "monthlyService2026": 472,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2012,
      "prestige": 8,
      "happinessBoost": 5
    },
    {
      "id": "comp_can_montreal_quartier",
      "name": "Quartier des Spectacles (Montreal)",
      "country": "can",
      "city": "Montreal",
      "kind": "compound_apt",
      "areaM2": 135,
      "rooms": 3,
      "tier": "upscale",
      "price2026": 1080000,
      "monthlyRent2026": 3600,
      "monthlyService2026": 270,
      "offPlanAvailable": true,
      "downPaymentPct": 0.1,
      "installmentYears": 4,
      "launchYear": 2016,
      "prestige": 8,
      "happinessBoost": 4
    },
    {
      "id": "lm_toronto_yorkville",
      "name": "Yorkville Apartment",
      "country": "can",
      "city": "Toronto",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1960000,
      "monthlyRent2026": 5717,
      "monthlyService2026": 286,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_vancouver_yaletown",
      "name": "Yaletown Apartment",
      "country": "can",
      "city": "Vancouver",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 1680000,
      "monthlyRent2026": 4900,
      "monthlyService2026": 245,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "lm_montreal_plateau",
      "name": "Plateau Apartment",
      "country": "can",
      "city": "Montreal",
      "kind": "apartment",
      "areaM2": 140,
      "rooms": 4,
      "tier": "standard",
      "price2026": 910000,
      "monthlyRent2026": 2654,
      "monthlyService2026": 133,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11h-liberty",
      "name": "Toronto Liberty Village — Warehouse Loft",
      "country": "can",
      "city": "Toronto",
      "kind": "apartment",
      "areaM2": 120,
      "rooms": 2,
      "tier": "standard",
      "price2026": 1140000,
      "monthlyRent2026": 3325,
      "monthlyService2026": 166,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 2005,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-mile-end",
      "name": "Montreal Mile End — Flat",
      "country": "can",
      "city": "Montreal",
      "kind": "apartment",
      "areaM2": 105,
      "rooms": 2,
      "tier": "standard",
      "price2026": 787500,
      "monthlyRent2026": 2297,
      "monthlyService2026": 115,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "prop_11o-beltline",
      "name": "Calgary Beltline — Flat",
      "country": "can",
      "city": "Calgary",
      "kind": "apartment",
      "areaM2": 105,
      "rooms": 2,
      "tier": "standard",
      "price2026": 682500,
      "monthlyRent2026": 1991,
      "monthlyService2026": 100,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1960,
      "prestige": 6,
      "happinessBoost": 3
    }
  ],
  "aus": [
    {
      "id": "std_aus_modest",
      "name": "Australia Modest Apartment",
      "country": "aus",
      "city": "Australia",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 315000,
      "monthlyRent2026": 1800,
      "monthlyService2026": 90,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_aus_standard",
      "name": "Australia Standard Apartment",
      "country": "aus",
      "city": "Australia",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 562500,
      "monthlyRent2026": 2625,
      "monthlyService2026": 131,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_aus_upscale",
      "name": "Australia Upscale Residence",
      "country": "aus",
      "city": "Australia",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 1125000,
      "monthlyRent2026": 5000,
      "monthlyService2026": 250,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "nld": [
    {
      "id": "std_nld_modest",
      "name": "Netherlands Modest Apartment",
      "country": "nld",
      "city": "Netherlands",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 176400,
      "monthlyRent2026": 900,
      "monthlyService2026": 45,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_nld_standard",
      "name": "Netherlands Standard Apartment",
      "country": "nld",
      "city": "Netherlands",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 315000,
      "monthlyRent2026": 1312,
      "monthlyService2026": 66,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_nld_upscale",
      "name": "Netherlands Upscale Residence",
      "country": "nld",
      "city": "Netherlands",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 630000,
      "monthlyRent2026": 2500,
      "monthlyService2026": 125,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "fra": [
    {
      "id": "std_fra_modest",
      "name": "France Modest Apartment",
      "country": "fra",
      "city": "France",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 163800,
      "monthlyRent2026": 780,
      "monthlyService2026": 39,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_fra_standard",
      "name": "France Standard Apartment",
      "country": "fra",
      "city": "France",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 292500,
      "monthlyRent2026": 1138,
      "monthlyService2026": 57,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_fra_upscale",
      "name": "France Upscale Residence",
      "country": "fra",
      "city": "France",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 585000,
      "monthlyRent2026": 2167,
      "monthlyService2026": 108,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "jpn": [
    {
      "id": "std_jpn_modest",
      "name": "Japan Modest Apartment",
      "country": "jpn",
      "city": "Japan",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 18900000,
      "monthlyRent2026": 72000,
      "monthlyService2026": 3600,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_jpn_standard",
      "name": "Japan Standard Apartment",
      "country": "jpn",
      "city": "Japan",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 33750000,
      "monthlyRent2026": 105000,
      "monthlyService2026": 5250,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_jpn_upscale",
      "name": "Japan Upscale Residence",
      "country": "jpn",
      "city": "Japan",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 67500000,
      "monthlyRent2026": 200000,
      "monthlyService2026": 10000,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "ita": [
    {
      "id": "std_ita_modest",
      "name": "Italy Modest Apartment",
      "country": "ita",
      "city": "Italy",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 126000,
      "monthlyRent2026": 600,
      "monthlyService2026": 30,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_ita_standard",
      "name": "Italy Standard Apartment",
      "country": "ita",
      "city": "Italy",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 225000,
      "monthlyRent2026": 875,
      "monthlyService2026": 44,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_ita_upscale",
      "name": "Italy Upscale Residence",
      "country": "ita",
      "city": "Italy",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 450000,
      "monthlyRent2026": 1667,
      "monthlyService2026": 83,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "sgp": [
    {
      "id": "std_sgp_modest",
      "name": "Singapore Modest Apartment",
      "country": "sgp",
      "city": "Singapore",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 294000,
      "monthlyRent2026": 2160,
      "monthlyService2026": 108,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_sgp_standard",
      "name": "Singapore Standard Apartment",
      "country": "sgp",
      "city": "Singapore",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 525000,
      "monthlyRent2026": 3150,
      "monthlyService2026": 158,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_sgp_upscale",
      "name": "Singapore Upscale Residence",
      "country": "sgp",
      "city": "Singapore",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 1050000,
      "monthlyRent2026": 6000,
      "monthlyService2026": 300,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "bra": [
    {
      "id": "std_bra_modest",
      "name": "Brazil Modest Apartment",
      "country": "bra",
      "city": "Brazil",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 201600,
      "monthlyRent2026": 1440,
      "monthlyService2026": 72,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_bra_standard",
      "name": "Brazil Standard Apartment",
      "country": "bra",
      "city": "Brazil",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 360000,
      "monthlyRent2026": 2100,
      "monthlyService2026": 105,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_bra_upscale",
      "name": "Brazil Upscale Residence",
      "country": "bra",
      "city": "Brazil",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 720000,
      "monthlyRent2026": 4000,
      "monthlyService2026": 200,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "ind": [
    {
      "id": "std_ind_modest",
      "name": "India Modest Apartment",
      "country": "ind",
      "city": "India",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 2520000,
      "monthlyRent2026": 14400,
      "monthlyService2026": 720,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_ind_standard",
      "name": "India Standard Apartment",
      "country": "ind",
      "city": "India",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 4500000,
      "monthlyRent2026": 21000,
      "monthlyService2026": 1050,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_ind_upscale",
      "name": "India Upscale Residence",
      "country": "ind",
      "city": "India",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 9000000,
      "monthlyRent2026": 40000,
      "monthlyService2026": 2000,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "che": [
    {
      "id": "std_che_modest",
      "name": "Switzerland Modest Apartment",
      "country": "che",
      "city": "Zurich",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 650000,
      "monthlyRent2026": 1800,
      "monthlyService2026": 90,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_che_standard",
      "name": "Switzerland Standard Apartment",
      "country": "che",
      "city": "Zurich",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 1150000,
      "monthlyRent2026": 3000,
      "monthlyService2026": 150,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_che_upscale",
      "name": "Switzerland Upscale Residence",
      "country": "che",
      "city": "Zurich",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 2500000,
      "monthlyRent2026": 6000,
      "monthlyService2026": 300,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "swe": [
    {
      "id": "std_swe_modest",
      "name": "Sweden Modest Apartment",
      "country": "swe",
      "city": "Stockholm",
      "kind": "apartment",
      "areaM2": 65,
      "rooms": 2,
      "tier": "modest",
      "price2026": 3250000,
      "monthlyRent2026": 12000,
      "monthlyService2026": 600,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_swe_standard",
      "name": "Sweden Standard Apartment",
      "country": "swe",
      "city": "Stockholm",
      "kind": "apartment",
      "areaM2": 115,
      "rooms": 3,
      "tier": "standard",
      "price2026": 5750000,
      "monthlyRent2026": 18000,
      "monthlyService2026": 900,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_swe_upscale",
      "name": "Sweden Upscale Residence",
      "country": "swe",
      "city": "Stockholm",
      "kind": "villa",
      "areaM2": 210,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 12000000,
      "monthlyRent2026": 32000,
      "monthlyService2026": 1600,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ],
  "tur": [
    {
      "id": "std_tur_modest",
      "name": "Turkey Modest Apartment",
      "country": "tur",
      "city": "Istanbul",
      "kind": "apartment",
      "areaM2": 75,
      "rooms": 2,
      "tier": "modest",
      "price2026": 7500000,
      "monthlyRent2026": 30000,
      "monthlyService2026": 1500,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 4,
      "happinessBoost": 1
    },
    {
      "id": "std_tur_standard",
      "name": "Turkey Standard Apartment",
      "country": "tur",
      "city": "Istanbul",
      "kind": "apartment",
      "areaM2": 130,
      "rooms": 3,
      "tier": "standard",
      "price2026": 15000000,
      "monthlyRent2026": 55000,
      "monthlyService2026": 2750,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 6,
      "happinessBoost": 3
    },
    {
      "id": "std_tur_upscale",
      "name": "Turkey Upscale Residence",
      "country": "tur",
      "city": "Istanbul",
      "kind": "villa",
      "areaM2": 240,
      "rooms": 4,
      "tier": "upscale",
      "price2026": 35000000,
      "monthlyRent2026": 110000,
      "monthlyService2026": 5500,
      "offPlanAvailable": false,
      "downPaymentPct": 0.2,
      "installmentYears": 20,
      "launchYear": 1950,
      "prestige": 9,
      "happinessBoost": 5
    }
  ]
};

export function getSchoolsFor(countryId, year) {
  // v2.1: no silent wrong-country fallback — an unknown country returns [] (all 18
  // birth countries have real rows; Egypt's schools must never stand in for another country).
  const list = SCHOOLS[countryId] || [];
  const avail = list.filter(s => (s.founded || 1900) <= year);
  return avail.length ? avail : list.slice(0, 2);
}

export function getUniversitiesFor(countryId, year) {
  // v2.1: no silent wrong-country fallback (see getSchoolsFor).
  const list = UNIVERSITIES[countryId] || [];
  return list.filter(u => u.undergraduate !== false && (u.founded || 1900) <= year);
}

export function getBanksFor(countryId, year) {
  // v2.1: no silent wrong-country fallback (see getSchoolsFor).
  const list = BANKS[countryId] || [];
  const avail = list.filter(b => (b.founded || 1900) <= year);
  return avail.length ? avail : list.slice(0, 2);
}

export function getHousingFor(countryId, year) {
  // v2.1: no silent wrong-country fallback (see getSchoolsFor).
  const list = HOUSING_CATALOG[countryId] || [];
  const avail = list.filter(h => (h.launchYear || 1900) <= year);
  return avail.length ? avail : list.slice(0, 3);
}

export function getHospitalsFor(countryId, year) {
  // v2.1: no silent wrong-country fallback (see getSchoolsFor).
  const list = HOSPITALS[countryId] || [];
  const avail = list.filter(h => (h.founded || 1900) <= year);
  return avail.length ? avail : list;
}

export function getCarsForYear(year) {
  return CARS_CATALOG.filter(c => year >= c.yearFrom && year <= c.yearTo);
}

export function getEmployersFor(countryId, trackId) {
  const byCountry = EMPLOYERS[countryId];
  if (byCountry && byCountry[trackId] && byCountry[trackId].length) return byCountry[trackId];
  // v2.1: no invented fallback names — the old "<CC> National Group" / "Continental <Track>
  // Partners" strings were explicitly filtered as slop by the career engine. All 18 birth
  // countries now have real EMPLOYERS rows; an unknown country returns [].
  return [];
}

// Legacy duplicated IDs resolve to the same institution, without rewriting existing enrolments.
export const UNIVERSITY_ID_ALIASES = {"x-uni-kfupm": "sau_kfupm", "x-uni-lmu": "deu_lmu", "x-uni-ubc": "can_ubc", "x-uni-unsw": "aus_unsw", "x-uni-ntu": "sgp_ntu", "x-uni-smu": "sgp_smu"};
export function canonicalUniversityId(id) { return UNIVERSITY_ID_ALIASES[id] || id; }
export function universitySectorLabel(u) { return u.sectorLabel || (u.sector === 'public' ? 'Public' : u.sector === 'private' ? 'Private' : 'Independent'); }
