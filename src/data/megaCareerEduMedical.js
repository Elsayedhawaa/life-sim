/* ============================================================================
   World Life Complete Edition — 100% v1 Career, Edu, Medical, Travel, Law & Marriage
   Preserves all 61 v1 Career Tracks, 557 Companies, 34 Businesses, 42 Part-Time,
   12 Internships, 14 Cash Jobs, 102 Vacations (+Nusuk Hajj/Umrah), 36 Med Tests,
   30 Medications, 28 Surgeries, 5 Fertility Treatments, 17 Activities/Habits,
   11 Crimes, Civil Lawsuits, Licensing Boards (PLAB/USMLE/SCFHS/DHA/Approbation),
   and all 15-Country 7-Era Marriage Profiles (7,875 schema leaves).
   ========================================================================== */

export const V1_CAREER_TRACKS = [
  {
    "id": "business",
    "label": "Business / Finance",
    "requiresDegree": "business",
    "industry": "banking",
    "levels": [
      {
        "level": 0,
        "title": "Junior Analyst",
        "baseSalaryEGP": 72000,
        "requirements": {},
        "desc": "Entry level. Learn the ropes."
      },
      {
        "level": 1,
        "title": "Financial Analyst",
        "baseSalaryEGP": 120000,
        "requirements": {
          "years": 2
        },
        "desc": "Analyze reports, support senior staff."
      },
      {
        "level": 2,
        "title": "Senior Analyst",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 4
        },
        "desc": "Own major accounts."
      },
      {
        "level": 3,
        "title": "Finance Manager",
        "baseSalaryEGP": 280000,
        "requirements": {
          "years": 7
        },
        "desc": "Manage a team."
      },
      {
        "level": 4,
        "title": "CFO",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 12
        },
        "desc": "Chief Financial Officer."
      }
    ]
  },
  {
    "id": "accounting",
    "label": "Accounting / Audit",
    "requiresDegree": "business",
    "industry": "consulting",
    "levels": [
      {
        "level": 0,
        "title": "Junior Accountant",
        "baseSalaryEGP": 84000,
        "requirements": {},
        "desc": "Handle basic bookkeeping."
      },
      {
        "level": 1,
        "title": "Senior Accountant",
        "baseSalaryEGP": 156000,
        "requirements": {
          "years": 2
        },
        "desc": "Manage full-cycle accounting."
      },
      {
        "level": 2,
        "title": "Audit Manager",
        "baseSalaryEGP": 288000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead audit engagements."
      },
      {
        "level": 3,
        "title": "Controller",
        "baseSalaryEGP": 540000,
        "requirements": {
          "years": 9
        },
        "desc": "Own financial reporting."
      },
      {
        "level": 4,
        "title": "Chief Accounting Officer",
        "baseSalaryEGP": 960000,
        "requirements": {
          "years": 14
        },
        "desc": "Top financial officer."
      }
    ]
  },
  {
    "id": "investment",
    "label": "Investment / PE",
    "requiresDegree": "business",
    "industry": "banking",
    "levels": [
      {
        "level": 0,
        "title": "Investment Analyst",
        "baseSalaryEGP": 150000,
        "requirements": {},
        "desc": "Analyze opportunities."
      },
      {
        "level": 1,
        "title": "Associate",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 2
        },
        "desc": "Lead deals."
      },
      {
        "level": 2,
        "title": "VP",
        "baseSalaryEGP": 550000,
        "requirements": {
          "years": 5
        },
        "desc": "Vice President."
      },
      {
        "level": 3,
        "title": "Managing Director",
        "baseSalaryEGP": 1000000,
        "requirements": {
          "years": 9
        },
        "desc": "MD of a fund."
      },
      {
        "level": 4,
        "title": "Partner",
        "baseSalaryEGP": 2200000,
        "requirements": {
          "years": 13
        },
        "desc": "Equity partner."
      }
    ]
  },
  {
    "id": "marketing",
    "label": "Marketing",
    "requiresDegree": "business",
    "industry": "fmcg",
    "levels": [
      {
        "level": 0,
        "title": "Marketing Coordinator",
        "baseSalaryEGP": 80000,
        "requirements": {},
        "desc": "Support marketing team."
      },
      {
        "level": 1,
        "title": "Marketing Specialist",
        "baseSalaryEGP": 150000,
        "requirements": {
          "years": 2
        },
        "desc": "Run campaigns."
      },
      {
        "level": 2,
        "title": "Marketing Manager",
        "baseSalaryEGP": 280000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead team and budget."
      },
      {
        "level": 3,
        "title": "Marketing Director",
        "baseSalaryEGP": 550000,
        "requirements": {
          "years": 9
        },
        "desc": "Own P&L."
      },
      {
        "level": 4,
        "title": "CMO",
        "baseSalaryEGP": 1000000,
        "requirements": {
          "years": 14
        },
        "desc": "Chief Marketing Officer."
      }
    ]
  },
  {
    "id": "sales",
    "label": "Sales",
    "requiresDegree": null,
    "industry": "fmcg",
    "levels": [
      {
        "level": 0,
        "title": "Sales Associate",
        "baseSalaryEGP": 84000,
        "requirements": {},
        "desc": "Learn products and customers."
      },
      {
        "level": 1,
        "title": "Account Executive",
        "baseSalaryEGP": 168000,
        "requirements": {
          "years": 2
        },
        "desc": "Close deals."
      },
      {
        "level": 2,
        "title": "Sales Manager",
        "baseSalaryEGP": 320000,
        "requirements": {
          "years": 4
        },
        "desc": "Manage a sales team."
      },
      {
        "level": 3,
        "title": "Regional Sales Director",
        "baseSalaryEGP": 600000,
        "requirements": {
          "years": 8
        },
        "desc": "Own regional P&L."
      },
      {
        "level": 4,
        "title": "VP of Sales",
        "baseSalaryEGP": 1000000,
        "requirements": {
          "years": 12
        },
        "desc": "Company sales leader."
      }
    ]
  },
  {
    "id": "hr",
    "label": "Human Resources",
    "requiresDegree": "business",
    "industry": "fmcg",
    "levels": [
      {
        "level": 0,
        "title": "HR Assistant",
        "baseSalaryEGP": 70000,
        "requirements": {},
        "desc": "Support HR operations."
      },
      {
        "level": 1,
        "title": "HR Specialist",
        "baseSalaryEGP": 130000,
        "requirements": {
          "years": 2
        },
        "desc": "Handle recruitment."
      },
      {
        "level": 2,
        "title": "HR Manager",
        "baseSalaryEGP": 250000,
        "requirements": {
          "years": 5
        },
        "desc": "Manage HR team."
      },
      {
        "level": 3,
        "title": "HR Director",
        "baseSalaryEGP": 500000,
        "requirements": {
          "years": 9
        },
        "desc": "Direct HR strategy."
      },
      {
        "level": 4,
        "title": "CHRO",
        "baseSalaryEGP": 950000,
        "requirements": {
          "years": 14
        },
        "desc": "Chief People Officer."
      }
    ]
  },
  {
    "id": "consulting",
    "label": "Management Consulting",
    "requiresDegree": "business",
    "industry": "consulting",
    "levels": [
      {
        "level": 0,
        "title": "Business Analyst",
        "baseSalaryEGP": 120000,
        "requirements": {},
        "desc": "Support engagements."
      },
      {
        "level": 1,
        "title": "Consultant",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 2
        },
        "desc": "Lead workstreams."
      },
      {
        "level": 2,
        "title": "Engagement Manager",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 4
        },
        "desc": "Manage client projects."
      },
      {
        "level": 3,
        "title": "Principal",
        "baseSalaryEGP": 840000,
        "requirements": {
          "years": 8
        },
        "desc": "Own client relationships."
      },
      {
        "level": 4,
        "title": "Partner",
        "baseSalaryEGP": 1800000,
        "requirements": {
          "years": 12
        },
        "desc": "Equity partner."
      }
    ]
  },
  {
    "id": "product",
    "label": "Product Management",
    "requiresDegree": "business",
    "industry": "tech",
    "levels": [
      {
        "level": 0,
        "title": "Associate Product Manager",
        "baseSalaryEGP": 180000,
        "requirements": {},
        "desc": "Learn product management."
      },
      {
        "level": 1,
        "title": "Product Manager",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 2
        },
        "desc": "Own a product area."
      },
      {
        "level": 2,
        "title": "Senior PM",
        "baseSalaryEGP": 500000,
        "requirements": {
          "years": 4
        },
        "desc": "Lead product vision."
      },
      {
        "level": 3,
        "title": "Director of Product",
        "baseSalaryEGP": 840000,
        "requirements": {
          "years": 7
        },
        "desc": "Own product strategy."
      },
      {
        "level": 4,
        "title": "VP / CPO",
        "baseSalaryEGP": 1200000,
        "requirements": {
          "years": 12
        },
        "desc": "Chief Product Officer."
      }
    ]
  },
  {
    "id": "medicine",
    "label": "Doctor (GP)",
    "requiresDegree": "medicine",
    "requiresImtyaz": true,
    "industry": "hospitals",
    "levels": [
      {
        "level": 0,
        "title": "Imtyaz (Intern Doctor)",
        "baseSalaryEGP": 42000,
        "requirements": {
          "imtyaz": true
        },
        "desc": "Mandatory 1-year training at government hospital."
      },
      {
        "level": 1,
        "title": "Resident Doctor",
        "baseSalaryEGP": 120000,
        "requirements": {
          "years": 2
        },
        "desc": "Residency training."
      },
      {
        "level": 2,
        "title": "Specialist Doctor",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 5
        },
        "desc": "Full specialist."
      },
      {
        "level": 3,
        "title": "Consultant",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 10
        },
        "desc": "Senior consultant."
      },
      {
        "level": 4,
        "title": "Department Head",
        "baseSalaryEGP": 900000,
        "requirements": {
          "years": 15
        },
        "desc": "Top of medical hierarchy."
      }
    ]
  },
  {
    "id": "surgery",
    "label": "Surgeon",
    "requiresDegree": "medicine",
    "industry": "hospitals",
    "levels": [
      {
        "level": 0,
        "title": "Surgical Resident (Y1)",
        "baseSalaryEGP": 48000,
        "requirements": {},
        "desc": "Surgical residency year 1."
      },
      {
        "level": 1,
        "title": "Surgical Resident (Y3)",
        "baseSalaryEGP": 150000,
        "requirements": {
          "years": 3
        },
        "desc": "Advanced surgical training."
      },
      {
        "level": 2,
        "title": "Attending Surgeon",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 6
        },
        "desc": "Full attending surgeon."
      },
      {
        "level": 3,
        "title": "Senior Surgeon",
        "baseSalaryEGP": 600000,
        "requirements": {
          "years": 11
        },
        "desc": "Senior consultant surgeon."
      },
      {
        "level": 4,
        "title": "Chief of Surgery",
        "baseSalaryEGP": 1200000,
        "requirements": {
          "years": 16
        },
        "desc": "Head of surgery department."
      },
      {
        "level": 5,
        "title": "Professor of Surgery",
        "baseSalaryEGP": 1800000,
        "requirements": {
          "years": 22
        },
        "desc": "Top of surgical field."
      }
    ]
  },
  {
    "id": "pediatrics",
    "label": "Pediatrician",
    "requiresDegree": "medicine",
    "industry": "hospitals",
    "levels": [
      {
        "level": 0,
        "title": "Pediatric Resident",
        "baseSalaryEGP": 48000,
        "requirements": {},
        "desc": "Residency year 1."
      },
      {
        "level": 1,
        "title": "Junior Pediatrician",
        "baseSalaryEGP": 120000,
        "requirements": {
          "years": 3
        },
        "desc": "Post-residency."
      },
      {
        "level": 2,
        "title": "Pediatric Specialist",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 6
        },
        "desc": "Full specialist."
      },
      {
        "level": 3,
        "title": "Consultant Pediatrician",
        "baseSalaryEGP": 450000,
        "requirements": {
          "years": 11
        },
        "desc": "Senior consultant."
      },
      {
        "level": 4,
        "title": "Head of Pediatrics",
        "baseSalaryEGP": 900000,
        "requirements": {
          "years": 16
        },
        "desc": "Department head."
      }
    ]
  },
  {
    "id": "cardiology",
    "label": "Cardiologist",
    "requiresDegree": "medicine",
    "industry": "hospitals",
    "levels": [
      {
        "level": 0,
        "title": "Cardiology Resident",
        "baseSalaryEGP": 48000,
        "requirements": {},
        "desc": "Residency year 1."
      },
      {
        "level": 1,
        "title": "Junior Cardiologist",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 3
        },
        "desc": "Post-residency."
      },
      {
        "level": 2,
        "title": "Cardiology Specialist",
        "baseSalaryEGP": 360000,
        "requirements": {
          "years": 6
        },
        "desc": "Full specialist."
      },
      {
        "level": 3,
        "title": "Consultant Cardiologist",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 11
        },
        "desc": "Senior consultant."
      },
      {
        "level": 4,
        "title": "Chief of Cardiology",
        "baseSalaryEGP": 1400000,
        "requirements": {
          "years": 16
        },
        "desc": "Department head."
      }
    ]
  },
  {
    "id": "nursing",
    "label": "Nursing",
    "requiresDegree": "nursing",
    "industry": "hospitals",
    "levels": [
      {
        "level": 0,
        "title": "Staff Nurse",
        "baseSalaryEGP": 60000,
        "requirements": {},
        "desc": "Direct patient care."
      },
      {
        "level": 1,
        "title": "Senior Nurse",
        "baseSalaryEGP": 96000,
        "requirements": {
          "years": 2
        },
        "desc": "Lead a unit."
      },
      {
        "level": 2,
        "title": "Nurse Manager",
        "baseSalaryEGP": 150000,
        "requirements": {
          "years": 5
        },
        "desc": "Manage nursing team."
      },
      {
        "level": 3,
        "title": "Director of Nursing",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 9
        },
        "desc": "Hospital nursing head."
      }
    ]
  },
  {
    "id": "pharmacy",
    "label": "Pharmacist",
    "requiresDegree": "pharmacy",
    "industry": "pharma",
    "levels": [
      {
        "level": 0,
        "title": "Staff Pharmacist",
        "baseSalaryEGP": 72000,
        "requirements": {},
        "desc": "Dispense and advise."
      },
      {
        "level": 1,
        "title": "Clinical Pharmacist",
        "baseSalaryEGP": 120000,
        "requirements": {
          "years": 2
        },
        "desc": "Hospital or clinical role."
      },
      {
        "level": 2,
        "title": "Pharmacy Manager",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 5
        },
        "desc": "Manage pharmacy."
      },
      {
        "level": 3,
        "title": "Regional Pharmacy Director",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 9
        },
        "desc": "Regional operations."
      }
    ]
  },
  {
    "id": "dentistry",
    "label": "Dentist",
    "requiresDegree": "dentistry",
    "industry": "dental",
    "levels": [
      {
        "level": 0,
        "title": "Associate Dentist",
        "baseSalaryEGP": 96000,
        "requirements": {},
        "desc": "Work at established clinic."
      },
      {
        "level": 1,
        "title": "Senior Dentist",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 3
        },
        "desc": "Lead complex cases."
      },
      {
        "level": 2,
        "title": "Clinic Director",
        "baseSalaryEGP": 320000,
        "requirements": {
          "years": 6
        },
        "desc": "Run a clinic."
      },
      {
        "level": 3,
        "title": "Multi-Clinic Owner",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 10
        },
        "desc": "Own multiple clinics."
      },
      {
        "level": 4,
        "title": "Dental Group CEO",
        "baseSalaryEGP": 800000,
        "requirements": {
          "years": 15
        },
        "desc": "Head of group."
      }
    ]
  },
  {
    "id": "psychology",
    "label": "Clinical Psychologist",
    "requiresDegree": "psychology",
    "industry": "hospitals",
    "levels": [
      {
        "level": 0,
        "title": "Junior Psychologist",
        "baseSalaryEGP": 72000,
        "requirements": {},
        "desc": "Clinical practice."
      },
      {
        "level": 1,
        "title": "Clinical Psychologist",
        "baseSalaryEGP": 120000,
        "requirements": {
          "years": 2
        },
        "desc": "Own case load."
      },
      {
        "level": 2,
        "title": "Senior Psychologist",
        "baseSalaryEGP": 200000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead therapy team."
      },
      {
        "level": 3,
        "title": "Director of Psychology",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 9
        },
        "desc": "Department director."
      },
      {
        "level": 4,
        "title": "Head Psychiatrist",
        "baseSalaryEGP": 500000,
        "requirements": {
          "years": 14
        },
        "desc": "Chief mental health."
      }
    ]
  },
  {
    "id": "veterinary",
    "label": "Veterinarian",
    "requiresDegree": "veterinary",
    "industry": "veterinary",
    "levels": [
      {
        "level": 0,
        "title": "Associate Vet",
        "baseSalaryEGP": 60000,
        "requirements": {},
        "desc": "Work under senior vet."
      },
      {
        "level": 1,
        "title": "Veterinarian",
        "baseSalaryEGP": 108000,
        "requirements": {
          "years": 2
        },
        "desc": "Independent practice."
      },
      {
        "level": 2,
        "title": "Senior Vet",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 5
        },
        "desc": "Complex cases."
      },
      {
        "level": 3,
        "title": "Clinic Owner",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 8
        },
        "desc": "Own a clinic."
      }
    ]
  },
  {
    "id": "physiotherapy",
    "label": "Physiotherapist",
    "requiresDegree": "physiotherapy",
    "industry": "hospitals",
    "levels": [
      {
        "level": 0,
        "title": "Junior Physiotherapist",
        "baseSalaryEGP": 60000,
        "requirements": {},
        "desc": "Basic rehab."
      },
      {
        "level": 1,
        "title": "Physiotherapist",
        "baseSalaryEGP": 108000,
        "requirements": {
          "years": 2
        },
        "desc": "Full practice."
      },
      {
        "level": 2,
        "title": "Senior Physiotherapist",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 5
        },
        "desc": "Complex rehab."
      },
      {
        "level": 3,
        "title": "Rehab Director",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 9
        },
        "desc": "Department head."
      }
    ]
  },
  {
    "id": "law",
    "label": "Lawyer",
    "requiresDegree": "law",
    "industry": "law",
    "levels": [
      {
        "level": 0,
        "title": "Junior Legal Associate",
        "baseSalaryEGP": 96000,
        "requirements": {},
        "desc": "Support partners."
      },
      {
        "level": 1,
        "title": "Legal Associate",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 2
        },
        "desc": "Handle cases."
      },
      {
        "level": 2,
        "title": "Senior Associate",
        "baseSalaryEGP": 360000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead deals."
      },
      {
        "level": 3,
        "title": "Partner",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 9
        },
        "desc": "Equity partner."
      },
      {
        "level": 4,
        "title": "Managing Partner",
        "baseSalaryEGP": 1400000,
        "requirements": {
          "years": 15
        },
        "desc": "Head of firm."
      }
    ]
  },
  {
    "id": "prosecutor",
    "label": "Public Prosecutor / Judge",
    "requiresDegree": "law",
    "industry": "government",
    "levels": [
      {
        "level": 0,
        "title": "Junior Prosecutor",
        "baseSalaryEGP": 72000,
        "requirements": {},
        "desc": "Prosecution assistant."
      },
      {
        "level": 1,
        "title": "Prosecutor",
        "baseSalaryEGP": 144000,
        "requirements": {
          "years": 3
        },
        "desc": "Own cases."
      },
      {
        "level": 2,
        "title": "Senior Prosecutor",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 8
        },
        "desc": "Complex criminal cases."
      },
      {
        "level": 3,
        "title": "Judge",
        "baseSalaryEGP": 500000,
        "requirements": {
          "years": 14
        },
        "desc": "Preside over court."
      },
      {
        "level": 4,
        "title": "Chief Justice",
        "baseSalaryEGP": 800000,
        "requirements": {
          "years": 22
        },
        "desc": "Top judicial rank."
      }
    ]
  },
  {
    "id": "engineering",
    "label": "Engineer",
    "requiresDegree": "engineering",
    "industry": "engineering",
    "levels": [
      {
        "level": 0,
        "title": "Junior Engineer",
        "baseSalaryEGP": 120000,
        "requirements": {},
        "desc": "Support senior engineers."
      },
      {
        "level": 1,
        "title": "Engineer",
        "baseSalaryEGP": 216000,
        "requirements": {
          "years": 2
        },
        "desc": "Own projects."
      },
      {
        "level": 2,
        "title": "Senior Engineer",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead technical work."
      },
      {
        "level": 3,
        "title": "Engineering Manager",
        "baseSalaryEGP": 660000,
        "requirements": {
          "years": 8
        },
        "desc": "Manage a team."
      },
      {
        "level": 4,
        "title": "Engineering Director",
        "baseSalaryEGP": 1100000,
        "requirements": {
          "years": 14
        },
        "desc": "Department head."
      }
    ]
  },
  {
    "id": "architect",
    "label": "Architect",
    "requiresDegree": "architecture",
    "industry": "architecture",
    "levels": [
      {
        "level": 0,
        "title": "Junior Architect",
        "baseSalaryEGP": 96000,
        "requirements": {},
        "desc": "Draft and support."
      },
      {
        "level": 1,
        "title": "Architect",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 2
        },
        "desc": "Own projects."
      },
      {
        "level": 2,
        "title": "Senior Architect",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead design work."
      },
      {
        "level": 3,
        "title": "Principal Architect",
        "baseSalaryEGP": 500000,
        "requirements": {
          "years": 9
        },
        "desc": "Own design direction."
      },
      {
        "level": 4,
        "title": "Partner / Director",
        "baseSalaryEGP": 800000,
        "requirements": {
          "years": 14
        },
        "desc": "Firm partner."
      }
    ]
  },
  {
    "id": "civil_eng",
    "label": "Civil Engineer",
    "requiresDegree": "engineering",
    "industry": "engineering",
    "levels": [
      {
        "level": 0,
        "title": "Junior Civil Engineer",
        "baseSalaryEGP": 120000,
        "requirements": {},
        "desc": "Site supervision."
      },
      {
        "level": 1,
        "title": "Civil Engineer",
        "baseSalaryEGP": 216000,
        "requirements": {
          "years": 2
        },
        "desc": "Own projects."
      },
      {
        "level": 2,
        "title": "Senior Civil Engineer",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead complex builds."
      },
      {
        "level": 3,
        "title": "Project Manager",
        "baseSalaryEGP": 660000,
        "requirements": {
          "years": 8
        },
        "desc": "Manage construction."
      },
      {
        "level": 4,
        "title": "Construction Director",
        "baseSalaryEGP": 1100000,
        "requirements": {
          "years": 14
        },
        "desc": "Company director."
      }
    ]
  },
  {
    "id": "tech",
    "label": "Software / Tech",
    "requiresDegree": "cs",
    "industry": "tech",
    "levels": [
      {
        "level": 0,
        "title": "Junior Developer",
        "baseSalaryEGP": 180000,
        "requirements": {},
        "desc": "Learn the codebase."
      },
      {
        "level": 1,
        "title": "Software Engineer",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 2
        },
        "desc": "Own features."
      },
      {
        "level": 2,
        "title": "Senior Engineer",
        "baseSalaryEGP": 540000,
        "requirements": {
          "years": 5
        },
        "desc": "Architect systems."
      },
      {
        "level": 3,
        "title": "Tech Lead / EM",
        "baseSalaryEGP": 840000,
        "requirements": {
          "years": 8
        },
        "desc": "Lead a team."
      },
      {
        "level": 4,
        "title": "VP Eng / CTO",
        "baseSalaryEGP": 1320000,
        "requirements": {
          "years": 12
        },
        "desc": "Executive level."
      }
    ]
  },
  {
    "id": "analytics",
    "label": "Data Analytics / Business Intelligence",
    "requiresDegree": null,
    "industry": "tech",
    "levels": [
      {
        "level": 0,
        "title": "Junior Data Analyst",
        "baseSalaryEGP": 96000,
        "requirements": {},
        "desc": "Prepare clean data, routine reports and basic analysis."
      },
      {
        "level": 1,
        "title": "Data Analyst",
        "baseSalaryEGP": 160000,
        "requirements": {
          "years": 2
        },
        "desc": "Own recurring analysis, dashboards and stakeholder requests."
      },
      {
        "level": 2,
        "title": "Senior Data Analyst",
        "baseSalaryEGP": 260000,
        "requirements": {
          "years": 5
        },
        "desc": "Own complex analyses, validate metrics and mentor analysts."
      },
      {
        "level": 3,
        "title": "Analytics Manager",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 8
        },
        "desc": "Lead analysts, prioritize reporting and govern business metrics."
      },
      {
        "level": 4,
        "title": "Director of Data & Analytics",
        "baseSalaryEGP": 700000,
        "requirements": {
          "years": 12
        },
        "desc": "Set analytics strategy, quality standards and executive reporting."
      }
    ]
  },
  {
    "id": "data_science",
    "label": "Data Science / ML",
    "requiresDegree": "cs",
    "industry": "tech",
    "levels": [
      {
        "level": 0,
        "title": "Junior Data Scientist",
        "baseSalaryEGP": 240000,
        "requirements": {},
        "desc": "Build models."
      },
      {
        "level": 1,
        "title": "Data Scientist",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 2
        },
        "desc": "Own models end-to-end."
      },
      {
        "level": 2,
        "title": "Senior DS",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 5
        },
        "desc": "Architect ML pipelines."
      },
      {
        "level": 3,
        "title": "Principal DS",
        "baseSalaryEGP": 1000000,
        "requirements": {
          "years": 8
        },
        "desc": "Company-wide ML strategy."
      },
      {
        "level": 4,
        "title": "Head of AI",
        "baseSalaryEGP": 1600000,
        "requirements": {
          "years": 12
        },
        "desc": "AI executive."
      }
    ]
  },
  {
    "id": "cybersecurity",
    "label": "Cybersecurity",
    "requiresDegree": "cs",
    "industry": "tech",
    "levels": [
      {
        "level": 0,
        "title": "SOC Analyst",
        "baseSalaryEGP": 240000,
        "requirements": {},
        "desc": "Monitor security events."
      },
      {
        "level": 1,
        "title": "Security Engineer",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 2
        },
        "desc": "Build defenses."
      },
      {
        "level": 2,
        "title": "Senior Security Engineer",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead security programs."
      },
      {
        "level": 3,
        "title": "Security Architect",
        "baseSalaryEGP": 1000000,
        "requirements": {
          "years": 8
        },
        "desc": "Design enterprise security."
      },
      {
        "level": 4,
        "title": "CISO",
        "baseSalaryEGP": 1600000,
        "requirements": {
          "years": 12
        },
        "desc": "Chief Information Security Officer."
      }
    ]
  },
  {
    "id": "product_design",
    "label": "Product Design (UX)",
    "requiresDegree": null,
    "industry": "tech",
    "levels": [
      {
        "level": 0,
        "title": "Junior UX Designer",
        "baseSalaryEGP": 180000,
        "requirements": {},
        "desc": "Support design team."
      },
      {
        "level": 1,
        "title": "Product Designer",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 2
        },
        "desc": "Own design of a product area."
      },
      {
        "level": 2,
        "title": "Senior Designer",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead design systems."
      },
      {
        "level": 3,
        "title": "Design Director",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 8
        },
        "desc": "Own design vision."
      },
      {
        "level": 4,
        "title": "VP Design / CDO",
        "baseSalaryEGP": 1000000,
        "requirements": {
          "years": 12
        },
        "desc": "Chief Design Officer."
      }
    ]
  },
  {
    "id": "qa_engineering",
    "label": "QA / Testing",
    "requiresDegree": "cs",
    "industry": "tech",
    "levels": [
      {
        "level": 0,
        "title": "QA Engineer",
        "baseSalaryEGP": 120000,
        "requirements": {},
        "desc": "Manual and automated testing."
      },
      {
        "level": 1,
        "title": "Senior QA",
        "baseSalaryEGP": 216000,
        "requirements": {
          "years": 2
        },
        "desc": "Own QA for a product."
      },
      {
        "level": 2,
        "title": "SDET",
        "baseSalaryEGP": 360000,
        "requirements": {
          "years": 5
        },
        "desc": "Build test infrastructure."
      },
      {
        "level": 3,
        "title": "QA Manager",
        "baseSalaryEGP": 600000,
        "requirements": {
          "years": 8
        },
        "desc": "Manage QA team."
      },
      {
        "level": 4,
        "title": "Director of QA",
        "baseSalaryEGP": 960000,
        "requirements": {
          "years": 12
        },
        "desc": "Enterprise QA leader."
      }
    ]
  },
  {
    "id": "teaching",
    "label": "School Teacher",
    "requiresDegree": null,
    "industry": "schools",
    "levels": [
      {
        "level": 0,
        "title": "Junior Teacher",
        "baseSalaryEGP": 60000,
        "requirements": {},
        "desc": "Support lead teacher."
      },
      {
        "level": 1,
        "title": "Teacher",
        "baseSalaryEGP": 96000,
        "requirements": {
          "years": 2
        },
        "desc": "Own class."
      },
      {
        "level": 2,
        "title": "Senior Teacher",
        "baseSalaryEGP": 144000,
        "requirements": {
          "years": 5
        },
        "desc": "Lead subject."
      },
      {
        "level": 3,
        "title": "Head of Department",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 8
        },
        "desc": "Academic leadership."
      }
    ]
  },
  {
    "id": "academia",
    "label": "University / Academia",
    "requiresDegree": null,
    "requiresGPA": 3.5,
    "industry": "universities",
    "academiaOnly": true,
    "levels": [
      {
        "level": 0,
        "title": "Teaching Assistant",
        "baseSalaryEGP": 72000,
        "requirements": {},
        "desc": "Assist professors."
      },
      {
        "level": 1,
        "title": "Assistant Lecturer",
        "baseSalaryEGP": 156000,
        "requirements": {
          "years": 2
        },
        "desc": "Teach small classes."
      },
      {
        "level": 2,
        "title": "Lecturer",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 5
        },
        "desc": "Full lecturer."
      },
      {
        "level": 3,
        "title": "Associate Professor",
        "baseSalaryEGP": 540000,
        "requirements": {
          "years": 10
        },
        "desc": "Senior academic."
      },
      {
        "level": 4,
        "title": "Professor",
        "baseSalaryEGP": 960000,
        "requirements": {
          "years": 15
        },
        "desc": "Full professor."
      }
    ]
  },
  {
    "id": "bpo",
    "label": "Call Center / BPO",
    "requiresDegree": null,
    "industry": "bpo",
    "languageTiers": {
      "en": {
        "label": "English",
        "payMult": 1,
        "requirement": "english_ok"
      },
      "fr": {
        "label": "French",
        "payMult": 2,
        "requirement": "french_b2"
      },
      "de": {
        "label": "German",
        "payMult": 2.5,
        "requirement": "german_b2"
      }
    },
    "levels": [
      {
        "level": 0,
        "title": "Customer Service Agent",
        "baseSalaryEGP": 72000,
        "requirements": {},
        "desc": "Take calls."
      },
      {
        "level": 1,
        "title": "Senior Agent",
        "baseSalaryEGP": 108000,
        "requirements": {
          "years": 2
        },
        "desc": "Complex tickets."
      },
      {
        "level": 2,
        "title": "Team Leader",
        "baseSalaryEGP": 168000,
        "requirements": {
          "years": 4
        },
        "desc": "Lead agents."
      },
      {
        "level": 3,
        "title": "Operations Manager",
        "baseSalaryEGP": 288000,
        "requirements": {
          "years": 6
        },
        "desc": "Manage site."
      },
      {
        "level": 4,
        "title": "Site Director",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 10
        },
        "desc": "Run operation."
      }
    ]
  },
  {
    "id": "hospitality",
    "label": "Hospitality / Hotel",
    "requiresDegree": null,
    "industry": "hotels",
    "levels": [
      {
        "level": 0,
        "title": "Front Desk Agent",
        "baseSalaryEGP": 72000,
        "requirements": {},
        "desc": "Welcome guests."
      },
      {
        "level": 1,
        "title": "Supervisor",
        "baseSalaryEGP": 144000,
        "requirements": {
          "years": 2
        },
        "desc": "Lead shift."
      },
      {
        "level": 2,
        "title": "Assistant Manager",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 5
        },
        "desc": "Support GM."
      },
      {
        "level": 3,
        "title": "Hotel Manager",
        "baseSalaryEGP": 400000,
        "requirements": {
          "years": 8
        },
        "desc": "Run operations."
      },
      {
        "level": 4,
        "title": "General Manager",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 12
        },
        "desc": "Full GM role."
      }
    ]
  },
  {
    "id": "aviation",
    "label": "Pilot / Aviation",
    "requiresDegree": null,
    "industry": "aviation",
    "levels": [
      {
        "level": 0,
        "title": "Cadet Pilot",
        "baseSalaryEGP": 480000,
        "requirements": {},
        "desc": "Trained cadet program."
      },
      {
        "level": 1,
        "title": "First Officer",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 2
        },
        "desc": "Co-pilot."
      },
      {
        "level": 2,
        "title": "Senior First Officer",
        "baseSalaryEGP": 960000,
        "requirements": {
          "years": 5
        },
        "desc": "Experienced FO."
      },
      {
        "level": 3,
        "title": "Captain",
        "baseSalaryEGP": 1440000,
        "requirements": {
          "years": 9
        },
        "desc": "Aircraft commander."
      },
      {
        "level": 4,
        "title": "Senior Captain / Chief Pilot",
        "baseSalaryEGP": 2400000,
        "requirements": {
          "years": 15
        },
        "desc": "Fleet or chief pilot."
      }
    ]
  },
  {
    "id": "media",
    "label": "Media / Journalism",
    "requiresDegree": null,
    "industry": "media",
    "levels": [
      {
        "level": 0,
        "title": "Junior Reporter",
        "baseSalaryEGP": 60000,
        "requirements": {},
        "desc": "Cover small stories."
      },
      {
        "level": 1,
        "title": "Reporter",
        "baseSalaryEGP": 108000,
        "requirements": {
          "years": 2
        },
        "desc": "Own beat."
      },
      {
        "level": 2,
        "title": "Senior Reporter",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 5
        },
        "desc": "Major stories."
      },
      {
        "level": 3,
        "title": "Editor",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 8
        },
        "desc": "Edit section."
      },
      {
        "level": 4,
        "title": "Editor-in-Chief",
        "baseSalaryEGP": 500000,
        "requirements": {
          "years": 13
        },
        "desc": "Top editor."
      }
    ]
  },
  {
    "id": "government",
    "label": "Government / Civil Service",
    "requiresDegree": null,
    "industry": "government",
    "levels": [
      {
        "level": 0,
        "title": "Junior Civil Servant",
        "baseSalaryEGP": 60000,
        "requirements": {},
        "desc": "Entry-level admin."
      },
      {
        "level": 1,
        "title": "Civil Servant",
        "baseSalaryEGP": 108000,
        "requirements": {
          "years": 3
        },
        "desc": "Mid-level admin."
      },
      {
        "level": 2,
        "title": "Senior Officer",
        "baseSalaryEGP": 180000,
        "requirements": {
          "years": 7
        },
        "desc": "Senior civil servant."
      },
      {
        "level": 3,
        "title": "Director",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 12
        },
        "desc": "Department director."
      }
    ]
  },
  {
    "id": "trades",
    "label": "Skilled Trades",
    "requiresDegree": null,
    "industry": "trades",
    "levels": [
      {
        "level": 0,
        "title": "Apprentice",
        "baseSalaryEGP": 60000,
        "requirements": {},
        "desc": "Learn the trade."
      },
      {
        "level": 1,
        "title": "Journeyman",
        "baseSalaryEGP": 96000,
        "requirements": {
          "years": 2
        },
        "desc": "Fully qualified."
      },
      {
        "level": 2,
        "title": "Master",
        "baseSalaryEGP": 144000,
        "requirements": {
          "years": 5
        },
        "desc": "Master craftsman."
      },
      {
        "level": 3,
        "title": "Contractor (self-employed)",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 8
        },
        "desc": "Own clients."
      },
      {
        "level": 4,
        "title": "Contracting Firm Owner",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 13
        },
        "desc": "Crews, tenders and a shop of your own."
      },
      {
        "level": 5,
        "title": "Turnkey Industrial Contractor",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 19
        },
        "desc": "Plants, warehouses and public tenders."
      }
    ]
  },
  {
    "id": "entry",
    "label": "Entry-level / No Degree",
    "requiresDegree": null,
    "industry": "retail",
    "levels": [
      {
        "level": 0,
        "title": "Cashier / Retail Worker",
        "baseSalaryEGP": 48000,
        "requirements": {},
        "desc": "Retail or cafe work."
      },
      {
        "level": 1,
        "title": "Retail Supervisor",
        "baseSalaryEGP": 72000,
        "requirements": {
          "years": 2
        },
        "desc": "Lead a shift."
      },
      {
        "level": 2,
        "title": "Store Manager",
        "baseSalaryEGP": 120000,
        "requirements": {
          "years": 4
        },
        "desc": "Run the store."
      },
      {
        "level": 3,
        "title": "Regional Manager",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 7
        },
        "desc": "Multiple stores."
      },
      {
        "level": 4,
        "title": "Operations Director",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 12
        },
        "desc": "Company operations."
      }
    ]
  },
  {
    "id": "legacy_telegraph_operator",
    "label": "Telegraph & Teleprinter Operations",
    "requiresDegree": null,
    "industry": "legacy_telegraph",
    "availableFrom": 1940,
    "availableUntil": 1999,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Telegraph Operator",
        "baseSalaryEGP": 36000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Senior Telegraph Operator",
        "baseSalaryEGP": 54000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Telegraph Office Supervisor",
        "baseSalaryEGP": 78000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Head Post Engineer",
        "baseSalaryEGP": 110000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "District Telegraph Superintendent",
        "baseSalaryEGP": 150000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_switchboard_operator",
    "label": "Telephone Switchboard Operations",
    "requiresDegree": null,
    "industry": "legacy_switchboard",
    "availableFrom": 1940,
    "availableUntil": 1995,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Switchboard Operator",
        "baseSalaryEGP": 30000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Senior Switchboard Operator",
        "baseSalaryEGP": 42000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Telephone Exchange Supervisor",
        "baseSalaryEGP": 65000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Telephone Exchange Manager",
        "baseSalaryEGP": 92000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Regional Exchange Superintendent",
        "baseSalaryEGP": 124000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_typist",
    "label": "Typing & Stenography",
    "requiresDegree": null,
    "industry": "legacy_typist",
    "availableFrom": 1940,
    "availableUntil": 2010,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Typist / Stenographer",
        "baseSalaryEGP": 33000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Senior Secretary",
        "baseSalaryEGP": 52000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Office Administration Supervisor",
        "baseSalaryEGP": 78000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Chief Secretarial Officer",
        "baseSalaryEGP": 112000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Office Administration Manager",
        "baseSalaryEGP": 150000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_linotype",
    "label": "Traditional Newspaper Typesetting",
    "requiresDegree": null,
    "industry": "legacy_linotype",
    "availableFrom": 1940,
    "availableUntil": 1995,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Linotype Operator",
        "baseSalaryEGP": 38000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Lead Typesetter",
        "baseSalaryEGP": 56000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Print Room Supervisor",
        "baseSalaryEGP": 76000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Composing Room Foreman",
        "baseSalaryEGP": 104000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Print Works Manager",
        "baseSalaryEGP": 140000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_punchcard",
    "label": "Punch-Card Data Processing",
    "requiresDegree": null,
    "industry": "legacy_punchcard",
    "availableFrom": 1950,
    "availableUntil": 1995,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Keypunch Operator",
        "baseSalaryEGP": 35000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Data Processing Clerk",
        "baseSalaryEGP": 48000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Batch Operations Supervisor",
        "baseSalaryEGP": 72000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Data Preparation Room Manager",
        "baseSalaryEGP": 100000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Head of Data Processing",
        "baseSalaryEGP": 135000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_mainframe",
    "label": "Mainframe & Batch Operations",
    "requiresDegree": null,
    "industry": "legacy_mainframe",
    "availableFrom": 1960,
    "availableUntil": 2015,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Computer Operator",
        "baseSalaryEGP": 48000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Mainframe Operations Analyst",
        "baseSalaryEGP": 72000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Data Center Operations Supervisor",
        "baseSalaryEGP": 108000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Mainframe Systems Programmer",
        "baseSalaryEGP": 150000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Head of Computer Operations",
        "baseSalaryEGP": 205000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_video_store",
    "label": "Video Rental & VHS Retail",
    "requiresDegree": null,
    "industry": "legacy_video",
    "availableFrom": 1982,
    "availableUntil": 2015,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Video Rental Clerk",
        "baseSalaryEGP": 30000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Video Store Manager",
        "baseSalaryEGP": 48000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Regional Video Rental Manager",
        "baseSalaryEGP": 72000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Multi-Store Video Manager",
        "baseSalaryEGP": 100000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Franchise Operations Manager",
        "baseSalaryEGP": 132000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_darkroom",
    "label": "Film Processing & Darkroom Photography",
    "requiresDegree": null,
    "industry": "legacy_darkroom",
    "availableFrom": 1940,
    "availableUntil": 2010,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Photo Lab Technician",
        "baseSalaryEGP": 33000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Darkroom Specialist",
        "baseSalaryEGP": 50000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Photo Lab Manager",
        "baseSalaryEGP": 76000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Commercial Photography Director",
        "baseSalaryEGP": 106000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Photo Studio Owner",
        "baseSalaryEGP": 142000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_travel_agent",
    "label": "Travel Agencies & Ticketing",
    "requiresDegree": null,
    "industry": "legacy_travel",
    "availableFrom": 1940,
    "availableUntil": 9999,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Travel Booking Clerk",
        "baseSalaryEGP": 36000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Travel Consultant",
        "baseSalaryEGP": 54000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Agency Manager",
        "baseSalaryEGP": 84000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Agency Operations Director",
        "baseSalaryEGP": 112000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Travel Group Regional Director",
        "baseSalaryEGP": 152000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_radio_tv_repair",
    "label": "Radio & Television Repair",
    "requiresDegree": null,
    "industry": "legacy_repair",
    "availableFrom": 1940,
    "availableUntil": 9999,
    "historicalOccupation": true,
    "levels": [
      {
        "level": 0,
        "title": "Radio / TV Repair Technician",
        "baseSalaryEGP": 42000,
        "requirements": {},
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 1,
        "title": "Senior Electronics Repairer",
        "baseSalaryEGP": 62000,
        "requirements": {
          "years": 3
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 2,
        "title": "Workshop Owner / Manager",
        "baseSalaryEGP": 96000,
        "requirements": {
          "years": 6
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 3,
        "title": "Service Center Network Manager",
        "baseSalaryEGP": 124000,
        "requirements": {
          "years": 9
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      },
      {
        "level": 4,
        "title": "Electronics Engineering Consultant",
        "baseSalaryEGP": 165000,
        "requirements": {
          "years": 12
        },
        "desc": "Historical occupation; the job board shows it only in the years when this work was reasonably common."
      }
    ]
  },
  {
    "id": "legacy_pc_support",
    "label": "Personal Computer Support",
    "requiresDegree": null,
    "industry": "emerging_pc_support",
    "availableFrom": 1977,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Computer Repair Technician",
        "baseSalaryEGP": 180000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Desktop Support Specialist",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "IT Support Manager",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "IT Operations Manager",
        "baseSalaryEGP": 660000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Head of End-User Technology",
        "baseSalaryEGP": 880000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "web_development",
    "label": "Web Development",
    "requiresDegree": null,
    "industry": "emerging_web_dev",
    "availableFrom": 1991,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Web Developer",
        "baseSalaryEGP": 240000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Senior Web Engineer",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Web Engineering Lead",
        "baseSalaryEGP": 660000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Principal Web Engineer",
        "baseSalaryEGP": 900000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Head of Engineering",
        "baseSalaryEGP": 1200000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "mobile_app_development",
    "label": "Mobile App Development",
    "requiresDegree": null,
    "industry": "emerging_mobile_apps",
    "availableFrom": 2008,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Mobile Application Developer",
        "baseSalaryEGP": 300000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Senior Mobile Engineer",
        "baseSalaryEGP": 540000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Mobile Engineering Lead",
        "baseSalaryEGP": 840000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Principal Mobile Engineer",
        "baseSalaryEGP": 1120000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Head of Mobile Product",
        "baseSalaryEGP": 1500000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "renewable_energy",
    "label": "Renewable Energy & Solar Installation",
    "requiresDegree": null,
    "industry": "emerging_renewables",
    "availableFrom": 1973,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Solar Installation Technician",
        "baseSalaryEGP": 180000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Renewable Energy Engineer",
        "baseSalaryEGP": 360000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Clean Energy Project Manager",
        "baseSalaryEGP": 600000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Renewable Program Director",
        "baseSalaryEGP": 820000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Clean Energy Country Manager",
        "baseSalaryEGP": 1100000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "ecommerce_operations",
    "label": "E-commerce & Online Retail Operations",
    "requiresDegree": null,
    "industry": "emerging_ecommerce",
    "availableFrom": 1995,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Online Retail Operations Associate",
        "baseSalaryEGP": 180000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "E-commerce Operations Manager",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Marketplace Director",
        "baseSalaryEGP": 540000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Head of Commerce Operations",
        "baseSalaryEGP": 720000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Chief Operating Officer, Retail",
        "baseSalaryEGP": 980000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "social_media_management",
    "label": "Social Media & Community Management",
    "requiresDegree": null,
    "industry": "emerging_social_media",
    "availableFrom": 2004,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Community Coordinator",
        "baseSalaryEGP": 150000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Social Media Manager",
        "baseSalaryEGP": 270000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Digital Community Director",
        "baseSalaryEGP": 450000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Head of Digital Communications",
        "baseSalaryEGP": 620000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Chief Brand Officer",
        "baseSalaryEGP": 850000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "ai_automation",
    "label": "AI & Automation Specialist",
    "requiresDegree": null,
    "industry": "emerging_ai_automation",
    "availableFrom": 2022,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "AI Automation Analyst",
        "baseSalaryEGP": 360000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "AI Workflow Engineer",
        "baseSalaryEGP": 600000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "AI Automation Lead",
        "baseSalaryEGP": 960000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "AI Solutions Architect",
        "baseSalaryEGP": 1300000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Head of Artificial Intelligence",
        "baseSalaryEGP": 1750000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "data_analyst",
    "label": "Data Analyst & Reporting",
    "requiresDegree": null,
    "industry": "emerging_data_analytics",
    "availableFrom": 2000,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Junior Data Analyst",
        "baseSalaryEGP": 210000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Senior Data Analyst",
        "baseSalaryEGP": 360000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Analytics Manager",
        "baseSalaryEGP": 600000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Head of Business Intelligence",
        "baseSalaryEGP": 820000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Chief Data Officer",
        "baseSalaryEGP": 1150000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "cybersecurity_analyst",
    "label": "Cybersecurity & Security Operations",
    "requiresDegree": null,
    "industry": "emerging_cybersecurity",
    "availableFrom": 1995,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Security Operations Analyst",
        "baseSalaryEGP": 240000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Cybersecurity Engineer",
        "baseSalaryEGP": 420000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Security Architect",
        "baseSalaryEGP": 660000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Security Operations Director",
        "baseSalaryEGP": 900000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Chief Information Security Officer",
        "baseSalaryEGP": 1250000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "cloud_devops_engineer",
    "label": "Cloud & DevOps Engineering",
    "requiresDegree": null,
    "industry": "emerging_cloud_devops",
    "availableFrom": 2006,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Cloud Support Engineer",
        "baseSalaryEGP": 270000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "DevOps Engineer",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Cloud Platform Lead",
        "baseSalaryEGP": 780000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Principal Platform Engineer",
        "baseSalaryEGP": 1050000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Head of Cloud Infrastructure",
        "baseSalaryEGP": 1400000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "digital_content_creator",
    "label": "Digital Video & Content Production",
    "requiresDegree": null,
    "industry": "emerging_content_creator",
    "availableFrom": 2005,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Video Editor / Content Producer",
        "baseSalaryEGP": 120000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Digital Content Producer",
        "baseSalaryEGP": 240000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Content Studio Lead",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Creative Director, Digital Media",
        "baseSalaryEGP": 700000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Content Studio Owner",
        "baseSalaryEGP": 980000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "last_mile_delivery_ops",
    "label": "Last-Mile Delivery & Platform Operations",
    "requiresDegree": null,
    "industry": "emerging_delivery_ops",
    "availableFrom": 2010,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "Dispatch / Delivery Operations Associate",
        "baseSalaryEGP": 120000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "Fleet Operations Supervisor",
        "baseSalaryEGP": 210000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Last-Mile Operations Manager",
        "baseSalaryEGP": 360000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "City Operations Manager",
        "baseSalaryEGP": 500000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "Regional Logistics Director",
        "baseSalaryEGP": 700000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  },
  {
    "id": "ev_technician",
    "label": "Electric Vehicle & Charging Technician",
    "requiresDegree": null,
    "industry": "emerging_ev",
    "availableFrom": 2010,
    "availableUntil": 9999,
    "eraGated": true,
    "levels": [
      {
        "level": 0,
        "title": "EV Service Technician",
        "baseSalaryEGP": 180000,
        "requirements": {},
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 1,
        "title": "EV Diagnostics Specialist",
        "baseSalaryEGP": 300000,
        "requirements": {
          "years": 3
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 2,
        "title": "Charging Infrastructure Lead",
        "baseSalaryEGP": 480000,
        "requirements": {
          "years": 6
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 3,
        "title": "Charging Network Operations Manager",
        "baseSalaryEGP": 660000,
        "requirements": {
          "years": 9
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      },
      {
        "level": 4,
        "title": "EV Service Network Director",
        "baseSalaryEGP": 880000,
        "requirements": {
          "years": 12
        },
        "desc": "Career option appears as the underlying technology or industry becomes commercially established; dates are estimated availability boundaries."
      }
    ]
  }
];
export const V1_COMPANIES_BY_COUNTRY = {
  "che": {
    "fmcg": [
      {
        "name": "Nestlé",
        "country": "che",
        "industry": "fmcg",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1866,
        "availableFrom": 1866,
        "id": "che-fmcg-nestl",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "pharma": [
      {
        "name": "Novartis",
        "country": "che",
        "industry": "pharma",
        "payMult": 1.45,
        "salaryMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1996,
        "availableFrom": 1996,
        "id": "che-pharma-novartis",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Roche",
        "country": "che",
        "industry": "pharma",
        "payMult": 1.45,
        "salaryMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1896,
        "availableFrom": 1896,
        "id": "che-pharma-roche",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "banking": [
      {
        "name": "UBS",
        "country": "che",
        "industry": "banking",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1862,
        "availableFrom": 1862,
        "id": "che-banking-ubs",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Swiss Re",
        "country": "che",
        "industry": "banking",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1863,
        "availableFrom": 1863,
        "id": "che-banking-swiss-re",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Zurich Insurance",
        "country": "che",
        "industry": "banking",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1872,
        "availableFrom": 1872,
        "id": "che-banking-zurich-insurance",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "engineering": [
      {
        "name": "ABB",
        "country": "che",
        "industry": "engineering",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1988,
        "availableFrom": 1988,
        "id": "che-engineering-abb",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "manufacturing": [
      {
        "name": "Swatch",
        "country": "che",
        "industry": "manufacturing",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1983,
        "availableFrom": 1983,
        "id": "che-manufacturing-swatch",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Rolex",
        "country": "che",
        "industry": "manufacturing",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1905,
        "availableFrom": 1905,
        "id": "che-manufacturing-rolex",
        "kind": "company",
        "expansion": "v2.1"
      }
    ]
  },
  "swe": {
    "manufacturing": [
      {
        "name": "Volvo",
        "country": "swe",
        "industry": "manufacturing",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1927,
        "availableFrom": 1927,
        "id": "swe-manufacturing-volvo",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Electrolux",
        "country": "swe",
        "industry": "manufacturing",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1919,
        "availableFrom": 1919,
        "id": "swe-manufacturing-electrolux",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "SKF",
        "country": "swe",
        "industry": "manufacturing",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1907,
        "availableFrom": 1907,
        "id": "swe-manufacturing-skf",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Scania",
        "country": "swe",
        "industry": "manufacturing",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1891,
        "availableFrom": 1891,
        "id": "swe-manufacturing-scania",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Atlas Copco",
        "country": "swe",
        "industry": "manufacturing",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1873,
        "availableFrom": 1873,
        "id": "swe-manufacturing-atlas-copco",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "telecom": [
      {
        "name": "Ericsson",
        "country": "swe",
        "industry": "telecom",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1876,
        "availableFrom": 1876,
        "id": "swe-telecom-ericsson",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "retail": [
      {
        "name": "IKEA",
        "country": "swe",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1943,
        "availableFrom": 1943,
        "id": "swe-retail-ikea",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "H&M",
        "country": "swe",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1947,
        "availableFrom": 1947,
        "id": "swe-retail-h-m",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "tech": [
      {
        "name": "Spotify",
        "country": "swe",
        "industry": "tech",
        "payMult": 1.4,
        "salaryMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 2006,
        "availableFrom": 2006,
        "id": "swe-tech-spotify",
        "kind": "company",
        "expansion": "v2.1"
      }
    ]
  },
  "tur": {
    "aviation": [
      {
        "name": "Turkish Airlines",
        "country": "tur",
        "industry": "aviation",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1933,
        "availableFrom": 1933,
        "id": "tur-aviation-turkish-airlines",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "manufacturing": [
      {
        "name": "Koç Holding",
        "country": "tur",
        "industry": "manufacturing",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1926,
        "availableFrom": 1926,
        "id": "tur-manufacturing-ko-holding",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Sabancı Holding",
        "country": "tur",
        "industry": "manufacturing",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1967,
        "availableFrom": 1967,
        "id": "tur-manufacturing-sabanc-holding",
        "kind": "company",
        "expansion": "v2.1"
      },
      {
        "name": "Arçelik",
        "country": "tur",
        "industry": "manufacturing",
        "payMult": 1.15,
        "salaryMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1955,
        "availableFrom": 1955,
        "id": "tur-manufacturing-ar-elik",
        "kind": "company",
        "expansion": "v2.1"
      }
    ],
    "telecom": [
      {
        "name": "Turkcell",
        "country": "tur",
        "industry": "telecom",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, structured",
        "drama": [],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1994,
        "availableFrom": 1994,
        "id": "tur-telecom-turkcell",
        "kind": "company",
        "expansion": "v2.1"
      }
    ]
  },
  "egy": {
    "energy": [
      {
        "name": "Alexandria Mineral Oils (AMOC)",
        "country": "egy",
        "industry": "energy",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "industrial, structured",
        "drama": [
          "oil price cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1997,
        "availableFrom": 1997,
        "id": "x-co-amoc",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "manufacturing": [
      {
        "name": "Ezz Steel",
        "country": "egy",
        "industry": "manufacturing",
        "payMult": 1.15,
        "salaryMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "industrial, shift-based",
        "drama": [
          "steel price cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1994,
        "availableFrom": 1994,
        "id": "x-co-ezz-steel",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Oriental Weavers",
        "country": "egy",
        "industry": "manufacturing",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "export-driven, family-owned",
        "drama": [
          "export order swings"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1979,
        "availableFrom": 1979,
        "id": "x-co-oriental-weavers",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "GB Auto (Ghabbour)",
        "country": "egy",
        "industry": "manufacturing",
        "payMult": 1.1,
        "salaryMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "industrial, dealer-driven",
        "drama": [
          "car import price shocks"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1960,
        "availableFrom": 1960,
        "id": "x-co-gb-auto",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "El Araby Group",
        "country": "egy",
        "industry": "manufacturing",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "industrial, family-owned",
        "drama": [
          "factory locations"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1964,
        "availableFrom": 1964,
        "id": "x-co-el-araby",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Fresh Electric",
        "country": "egy",
        "industry": "manufacturing",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "industrial, disciplined",
        "drama": [
          "shift work"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1978,
        "availableFrom": 1978,
        "id": "x-co-fresh",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Sidi Kerir Petrochemicals (SIDPEC)",
        "country": "egy",
        "industry": "manufacturing",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "industrial, structured",
        "drama": [
          "petrochemical price cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1997,
        "availableFrom": 1997,
        "id": "x-co-sidpec",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Misr Fertilizers (MOPCO)",
        "country": "egy",
        "industry": "manufacturing",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "industrial, structured",
        "drama": [
          "gas supply swings"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1998,
        "availableFrom": 1998,
        "id": "x-co-mopco",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "construction": [
      {
        "name": "Arab Contractors",
        "country": "egy",
        "industry": "construction",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "state-scale, site-based",
        "drama": [
          "site postings far from home"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1955,
        "availableFrom": 1955,
        "id": "x-co-arab-contractors",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "banking": [
      {
        "name": "Commercial International Bank (CIB)",
        "country": "egy",
        "industry": "banking",
        "salaryMult": 1.35,
        "benefits": [
          "medical insurance",
          "annual bonus",
          "transport allowance"
        ],
        "perks": [
          "gym subsidy",
          "staff loans"
        ],
        "culture": "fast-paced, target-driven",
        "drama": [
          "tough quarterly targets",
          "long hours in month-end close"
        ],
        "retirement": {
          "type": "defined-contribution",
          "employerMatch": 0.08,
          "note": "Private pension fund, employer matches 8% of salary."
        },
        "founded": 1975,
        "availableFrom": 1975,
        "id": "cib",
        "kind": "company",
        "payMult": 1.35,
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "National Bank of Egypt",
        "country": "egy",
        "industry": "banking",
        "salaryMult": 1.1,
        "benefits": [
          "medical insurance",
          "annual bonus",
          "housing allowance"
        ],
        "perks": [
          "staff loans",
          "subsidised canteen"
        ],
        "culture": "stable, hierarchical",
        "drama": [
          "slow promotion",
          "bureaucracy"
        ],
        "retirement": {
          "type": "government pension",
          "employerMatch": 0,
          "note": "State pension scheme."
        },
        "founded": 1898,
        "availableFrom": 1960,
        "id": "nbe",
        "kind": "company",
        "payMult": 1.1,
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "EFG Hermes",
        "country": "egy",
        "industry": "banking",
        "salaryMult": 1.5,
        "benefits": [
          "medical insurance",
          "performance bonus",
          "transport allowance"
        ],
        "perks": [
          "profit share",
          "learning budget"
        ],
        "culture": "elite, high-pressure",
        "drama": [
          "bonus years vary wildly",
          "deal deadlines"
        ],
        "retirement": {
          "type": "defined-contribution",
          "employerMatch": 0.1,
          "note": "Private pension fund, employer matches 10%."
        },
        "founded": 1984,
        "availableFrom": 1984,
        "id": "efg-hermes",
        "kind": "company",
        "payMult": 1.5,
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "CIB (Commercial International Bank)",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "stock",
          "life"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "NBE (National Bank of Egypt)",
        "payMult": 0.95,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Banque Misr",
        "payMult": 0.95,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "QNB Alahli",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "HSBC Egypt",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "bonus",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Emirates NBD Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "AlexBank",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "AAIB (Arab African)",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "ADIB Egypt",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Credit Agricole Egypt",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Bank of Alexandria (Intesa)",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "Mashreq Egypt",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Ahli United Bank Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Amazon Egypt",
        "payMult": 1.6,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "signing"
        ],
        "stability": 0.75,
        "prestige": 5
      },
      {
        "name": "Microsoft Egypt",
        "payMult": 1.55,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Google Egypt",
        "payMult": 1.8,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "signing",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Vodafone Egypt",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "Orange Egypt",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "Etisalat Misr",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Fawry",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Paymob",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.75,
        "prestige": 4
      },
      {
        "name": "Thndr",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.65,
        "prestige": 3
      },
      {
        "name": "Valeo Egypt",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Siemens Egypt",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "pension",
          "wfh"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Dell Egypt",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Oracle Egypt",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "IBM Egypt",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Bosta",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.7,
        "prestige": 3
      },
      {
        "name": "Cisco Egypt",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "VMware Egypt (Broadcom)",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "Luxoft Egypt",
        "payMult": 1.2,
        "benefits": [
          "health",
          "wfh",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Si-Vision",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "bpo": [
      {
        "name": "Vodafone VOIS",
        "payMult": 1,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Teleperformance Egypt",
        "payMult": 1.05,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus",
          "transport"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Concentrix Egypt",
        "payMult": 1.1,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Sutherland Egypt",
        "payMult": 1,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Xceed (Telecom Egypt)",
        "payMult": 0.95,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 3
      },
      {
        "name": "Foundever Egypt",
        "payMult": 1.05,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 3
      },
      {
        "name": "TTEC Egypt",
        "payMult": 1.1,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 3
      },
      {
        "name": "Alorica Egypt",
        "payMult": 1,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 3
      },
      {
        "name": "Majorel Egypt",
        "payMult": 1.05,
        "langTrack": "en",
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 3
      }
    ],
    "consulting": [
      {
        "name": "PwC Egypt",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Deloitte Egypt",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "KPMG Egypt",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "EY Egypt",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Grant Thornton Egypt",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "McKinsey Egypt",
        "payMult": 1.55,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "BCG Egypt",
        "payMult": 1.5,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Bain Egypt",
        "payMult": 1.5,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Accenture Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Strategy& (PwC)",
        "payMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "law": [
      {
        "name": "Matouk Bassiouny & Hennawy",
        "payMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Shalakany Law Office",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Zulficar & Partners",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Baker McKenzie Cairo",
        "payMult": 1.5,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "ADSERO",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Dentons Egypt",
        "payMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Shahid Law Firm",
        "payMult": 1.1,
        "benefits": [
          "health"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "Zaki Hashem & Partners",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Kosheri Rashed & Randa",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Soliman Hashish & Partners",
        "payMult": 1.1,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "engineering": [
      {
        "name": "Orascom Construction",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Hassan Allam Holding",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Elsewedy Electric",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Enppi",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Petrojet",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "Dar Al-Handasah",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Talaat Moustafa Group",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Emaar Misr",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Asec Company",
        "payMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Siemens Egypt",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Schneider Electric Egypt",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "pharma": [
      {
        "name": "Eva Pharma",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Ibnsina Pharma",
        "payMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Hikma Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Pfizer Egypt",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Novartis Egypt",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Amoun Pharmaceutical",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Sanofi Egypt",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "MSD Egypt",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "fmcg": [
      {
        "name": "Juhayna Food Industries",
        "country": "egy",
        "industry": "fmcg",
        "payMult": 1.1,
        "salaryMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "family-owned, brand-driven",
        "drama": [
          "dairy price swings"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1983,
        "availableFrom": 1983,
        "id": "x-co-juhayna",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Edita Food Industries",
        "country": "egy",
        "industry": "fmcg",
        "payMult": 1.15,
        "salaryMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "fast-moving, brand-driven",
        "drama": [
          "snack-market price wars"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1996,
        "availableFrom": 1996,
        "id": "x-co-edita",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Unilever Egypt",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "P&G Egypt",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Nestl\u00e9 Egypt",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Coca-Cola Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "PepsiCo Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "L'Or\u00e9al Egypt",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "retail": [
      {
        "name": "Mansour Group",
        "country": "egy",
        "industry": "retail",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "conglomerate, family-owned",
        "drama": [
          "family politics"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1975,
        "availableFrom": 1975,
        "id": "x-co-mansour",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Spinneys",
        "payMult": 0.9,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 2
      },
      {
        "name": "Carrefour Egypt",
        "payMult": 0.95,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Metro",
        "payMult": 0.9,
        "benefits": [
          "health"
        ],
        "stability": 0.8,
        "prestige": 2
      },
      {
        "name": "Raya Holding",
        "payMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      }
    ],
    "hospitals": [
      {
        "name": "Kasr El Aini (public)",
        "payMult": 0.55,
        "benefits": [
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Dar Al Fouad",
        "payMult": 1.5,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Saudi German Hospital Cairo",
        "payMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Cleopatra Hospital",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "El Salam International",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "As-Salam International",
        "payMult": 1.25,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "57357 Cancer Center",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "Cairo University",
        "payMult": 0.85,
        "benefits": [
          "pension"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "Ain Shams University",
        "payMult": 0.85,
        "benefits": [
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Alexandria University",
        "payMult": 0.85,
        "benefits": [
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "AUC (American University in Cairo)",
        "payMult": 1.8,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "GUC (German University in Cairo)",
        "payMult": 1.4,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "BUE (British University in Egypt)",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "oil_gas": [
      {
        "name": "Enppi (petroleum)",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Petrojet",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "EGPC (Egyptian General Petroleum)",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "Apache Egypt",
        "payMult": 1.4,
        "benefits": [
          "health",
          "bonus",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "telecom": [
      {
        "name": "Vodafone Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "wfh"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "Orange Egypt",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "Etisalat Misr",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Telecom Egypt",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      }
    ],
    "hotels": [
      {
        "name": "Marriott Mena House Cairo",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Four Seasons Cairo at Nile Plaza",
        "payMult": 1.4,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Hilton Cairo Heliopolis",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "The Ritz-Carlton Cairo",
        "payMult": 1.45,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "M\u00f6venpick Resort El Sokhna",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "aviation": [
      {
        "name": "EgyptAir",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension",
          "travel"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Air Cairo",
        "payMult": 1.1,
        "benefits": [
          "health",
          "travel"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Nile Air",
        "payMult": 1.05,
        "benefits": [
          "health",
          "travel"
        ],
        "stability": 0.8,
        "prestige": 3
      },
      {
        "name": "Air Arabia Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "travel"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "media": [
      {
        "name": "MBC Masr",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "CNBC Arabia",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Al-Ahram",
        "payMult": 0.95,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Youm7",
        "payMult": 1,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Mada Masr",
        "payMult": 0.9,
        "benefits": [],
        "stability": 0.7,
        "prestige": 4
      },
      {
        "name": "Al-Masry Al-Youm",
        "payMult": 0.9,
        "benefits": [
          "health"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "ON TV",
        "payMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "government": [
      {
        "name": "Ministry of Finance",
        "payMult": 0.95,
        "benefits": [
          "pension",
          "health"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Ministry of Health",
        "payMult": 0.9,
        "benefits": [
          "pension",
          "health"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Central Bank of Egypt",
        "payMult": 1.15,
        "benefits": [
          "pension",
          "health"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "Ministry of Foreign Affairs",
        "payMult": 0.85,
        "benefits": [
          "pension",
          "health"
        ],
        "stability": 1,
        "prestige": 5
      }
    ],
    "schools": [
      {
        "name": "Cairo American College",
        "payMult": 1.8,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "British International School Cairo",
        "payMult": 1.6,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Modern English School Cairo",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "New Cairo British International",
        "payMult": 1.4,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Deutsche Schule Kairo",
        "payMult": 1.5,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "architecture": [
      {
        "name": "Dar Al-Handasah (Arch.)",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Design Group International",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Momentum Consulting Engineering",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "dental": [
      {
        "name": "Smile Care Clinics",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "DentalPro Group Egypt",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Cairo Dental Center",
        "payMult": 1.1,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 3
      }
    ],
    "veterinary": [
      {
        "name": "Animal Hospital Egypt",
        "payMult": 1.1,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "CVL (Central Vet Lab)",
        "payMult": 0.95,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 3
      }
    ],
    "trades": [
      {
        "name": "Self-employed (electrician)",
        "payMult": 1,
        "benefits": [],
        "stability": 0.7,
        "prestige": 2
      },
      {
        "name": "Self-employed (plumber)",
        "payMult": 1,
        "benefits": [],
        "stability": 0.7,
        "prestige": 2
      },
      {
        "name": "Self-employed (mechanic)",
        "payMult": 1,
        "benefits": [],
        "stability": 0.7,
        "prestige": 2
      }
    ],
    "accounting": [
      {
        "name": "BDO Egypt",
        "payMult": 0.95,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Grant Thornton Egypt",
        "payMult": 0.95,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Egypt Post Telegraph Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "State Telephone Exchange",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Government Office Typing Pool",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Al-Ahram Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "National Data Processing Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Public-Sector Computer Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Neighborhood Video Library",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Local Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Nile Travel Bureau",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Radio & Television Service Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "usa": {
    "healthcare": [
      {
        "name": "Pfizer",
        "country": "usa",
        "industry": "healthcare",
        "salaryMult": 1.5,
        "benefits": [
          "medical insurance",
          "annual bonus"
        ],
        "perks": [
          "learning budget"
        ],
        "culture": "research-driven",
        "drama": [
          "drug trial pressure"
        ],
        "retirement": {
          "type": "401k",
          "employerMatch": 0.09,
          "note": "401(k), employer matches 9%."
        },
        "founded": 1849,
        "availableFrom": 1960,
        "id": "pfizer",
        "kind": "company",
        "payMult": 1.5,
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "manufacturing": [
      {
        "name": "Caterpillar",
        "country": "usa",
        "industry": "manufacturing",
        "payMult": 1.4,
        "salaryMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "industrial, proud",
        "drama": [
          "construction cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1925,
        "availableFrom": 1925,
        "id": "x-co-caterpillar",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "logistics": [
      {
        "name": "FedEx",
        "country": "usa",
        "industry": "logistics",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "operational, shift-based",
        "drama": [
          "peak-season shifts"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1971,
        "availableFrom": 1971,
        "id": "x-co-fedex",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "banking": [
      {
        "name": "JPMorgan Chase",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Goldman Sachs",
        "payMult": 1.55,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Morgan Stanley",
        "payMult": 1.4,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Bank of America",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Citibank",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Wells Fargo",
        "payMult": 1.1,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "US Bank",
        "payMult": 1.05,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "PNC Financial",
        "payMult": 1.08,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Google",
        "payMult": 1.5,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus",
          "meals"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Microsoft",
        "payMult": 1.4,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Amazon",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Apple",
        "payMult": 1.45,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Meta",
        "payMult": 1.55,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.75,
        "prestige": 5
      },
      {
        "name": "OpenAI",
        "payMult": 1.7,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.7,
        "prestige": 5
      },
      {
        "name": "Stripe",
        "payMult": 1.4,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Airbnb",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.75,
        "prestige": 5
      },
      {
        "name": "Adobe",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Salesforce",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Netflix",
        "payMult": 1.5,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.75,
        "prestige": 5
      },
      {
        "name": "Uber",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "IBM",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "law": [
      {
        "name": "Skadden",
        "payMult": 1.6,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Wachtell",
        "payMult": 1.8,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Latham & Watkins",
        "payMult": 1.55,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Kirkland & Ellis",
        "payMult": 1.6,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Davis Polk",
        "payMult": 1.55,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Sullivan & Cromwell",
        "payMult": 1.55,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Cravath",
        "payMult": 1.55,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "consulting": [
      {
        "name": "McKinsey",
        "payMult": 1.5,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "BCG",
        "payMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Bain",
        "payMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Deloitte",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "IBM Consulting",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "EY-Parthenon",
        "payMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "hospitals": [
      {
        "name": "Mayo Clinic",
        "payMult": 1.4,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Johns Hopkins Hospital",
        "payMult": 1.35,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Cleveland Clinic",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Kaiser Permanente",
        "payMult": 1.25,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "UCSF Medical Center",
        "payMult": 1.25,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Mount Sinai Hospital",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Massachusetts General",
        "payMult": 1.25,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "Harvard",
        "payMult": 1.6,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "MIT",
        "payMult": 1.55,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Stanford",
        "payMult": 1.55,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "retail": [
      {
        "name": "H-E-B",
        "country": "usa",
        "industry": "retail",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, Texas-rooted",
        "drama": [
          "storm-season rushes"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1905,
        "availableFrom": 1905,
        "id": "x-co-heb",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Publix Super Markets",
        "country": "usa",
        "industry": "retail",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, employee-owned",
        "drama": [
          "shift work"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1930,
        "availableFrom": 1930,
        "id": "x-co-publix",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Meijer",
        "country": "usa",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, Midwest-rooted",
        "drama": [
          "shift work"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1934,
        "availableFrom": 1934,
        "id": "x-co-meijer",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Wegmans",
        "country": "usa",
        "industry": "retail",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, customer-obsessed",
        "drama": [
          "shift work"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1916,
        "availableFrom": 1916,
        "id": "x-co-wegmans",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Menards",
        "country": "usa",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, hardware-driven",
        "drama": [
          "weekend rushes"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1960,
        "availableFrom": 1960,
        "id": "x-co-menards",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Kroger",
        "country": "usa",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, operational",
        "drama": [
          "shift work"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1883,
        "availableFrom": 1883,
        "id": "x-co-kroger",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Dollar General",
        "country": "usa",
        "industry": "retail",
        "payMult": 0.95,
        "salaryMult": 0.95,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, thin-margin",
        "drama": [
          "thin margins"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1955,
        "availableFrom": 1955,
        "id": "x-co-dollar-general",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Walmart",
        "payMult": 0.9,
        "benefits": [
          "health"
        ],
        "stability": 0.9,
        "prestige": 2
      },
      {
        "name": "Target",
        "payMult": 0.95,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Costco",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 3
      },
      {
        "name": "Amazon (retail)",
        "payMult": 1,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 2
      }
    ],
    "fmcg": [
      {
        "name": "Chick-fil-A",
        "country": "usa",
        "industry": "fmcg",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, customer-facing",
        "drama": [
          "closed Sundays — and proud of it"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1967,
        "availableFrom": 1967,
        "id": "x-co-chickfila",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "P&G",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Unilever",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Coca-Cola",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "PepsiCo",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "engineering": [
      {
        "name": "Bechtel",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Boeing",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Lockheed Martin",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Tesla",
        "payMult": 1.1,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.75,
        "prestige": 4
      }
    ],
    "oil_gas": [
      {
        "name": "ExxonMobil",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Chevron",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "ConocoPhillips",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "telecom": [
      {
        "name": "AT&T",
        "payMult": 1.05,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Verizon",
        "payMult": 1.1,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "T-Mobile",
        "payMult": 1.1,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "hotels": [
      {
        "name": "Marriott International",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Hilton Worldwide",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Hyatt Hotels",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "aviation": [
      {
        "name": "Southwest Airlines",
        "country": "usa",
        "industry": "aviation",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "airline, demanding",
        "drama": [
          "irregular hours"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1967,
        "availableFrom": 1967,
        "id": "x-co-southwest",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Alaska Airlines",
        "country": "usa",
        "industry": "aviation",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "airline, demanding",
        "drama": [
          "irregular hours"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1932,
        "availableFrom": 1932,
        "id": "x-co-alaska-air",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Delta Air Lines",
        "payMult": 1.4,
        "benefits": [
          "health",
          "pension",
          "travel"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "United Airlines",
        "payMult": 1.35,
        "benefits": [
          "health",
          "pension",
          "travel"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "American Airlines",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension",
          "travel"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "media": [
      {
        "name": "CNN",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "New York Times",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "The Atlantic",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Washington Post",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Wall Street Journal",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Disney (Media)",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "stock"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "government": [
      {
        "name": "Federal Government (civil service)",
        "payMult": 0.95,
        "benefits": [
          "health",
          "pension",
          "life"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "State Government",
        "payMult": 0.9,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "City Government",
        "payMult": 0.85,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 3
      }
    ],
    "schools": [
      {
        "name": "Phillips Exeter Academy",
        "payMult": 1.4,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Andover (Phillips Academy)",
        "payMult": 1.4,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Public School District",
        "payMult": 0.85,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 3
      }
    ],
    "accounting": [
      {
        "name": "PwC US",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "KPMG US",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "EY US",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Western Union Telegraph Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Regional Bell Telephone Exchange",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Corporate Typing Pool",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Metropolitan Newspaper Printing Plant",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Corporate Data Processing Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Enterprise Data Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Video Rental Store",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "One-Hour Photo Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Main Street Travel Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Neighborhood Electronics Repair",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "sau": {
    "energy": [
      {
        "name": "Saudi Aramco",
        "country": "sau",
        "industry": "energy",
        "salaryMult": 1.6,
        "benefits": [
          "medical insurance",
          "housing allowance",
          "annual bonus",
          "school fees"
        ],
        "perks": [
          "company housing",
          "flights home"
        ],
        "culture": "prestigious, structured",
        "drama": [
          "strict hierarchy",
          "remote compounds"
        ],
        "retirement": {
          "type": "defined-benefit",
          "employerMatch": 0.12,
          "note": "Company pension, employer contributes 12%."
        },
        "founded": 1933,
        "availableFrom": 1960,
        "id": "aramco",
        "kind": "company",
        "payMult": 1.6,
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "manufacturing": [
      {
        "name": "Zamil Industrial",
        "country": "sau",
        "industry": "manufacturing",
        "payMult": 1.1,
        "salaryMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "industrial, project-based",
        "drama": [
          "project cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1998,
        "availableFrom": 1998,
        "id": "x-co-zamil",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "retail": [
      {
        "name": "Jarir Bookstore",
        "country": "sau",
        "industry": "retail",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, customer-facing",
        "drama": [
          "seasonal rushes"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1974,
        "availableFrom": 1974,
        "id": "x-co-jarir",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Panda Retail Company",
        "country": "sau",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, shift-based",
        "drama": [
          "shift work"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1978,
        "availableFrom": 1978,
        "id": "x-co-panda",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Extra (United Electronics)",
        "country": "sau",
        "industry": "retail",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, customer-facing",
        "drama": [
          "seasonal rushes"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 2003,
        "availableFrom": 2003,
        "id": "x-co-extra",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "fmcg": [
      {
        "name": "Almarai",
        "country": "sau",
        "industry": "fmcg",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, disciplined",
        "drama": [
          "dairy price swings"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1977,
        "availableFrom": 1977,
        "id": "x-co-almarai",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Savola Group",
        "country": "sau",
        "industry": "fmcg",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "conglomerate, disciplined",
        "drama": [
          "food price swings"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1978,
        "availableFrom": 1978,
        "id": "x-co-savola",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Al Faisaliah Group",
        "country": "sau",
        "industry": "fmcg",
        "payMult": 1.1,
        "salaryMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "conglomerate, family-owned",
        "drama": [
          "family politics"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1971,
        "availableFrom": 1971,
        "id": "x-co-faisaliah",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "construction": [
      {
        "name": "Saudi Oger",
        "country": "sau",
        "industry": "construction",
        "payMult": 1.15,
        "salaryMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "project-driven, site-based",
        "drama": [
          "folded in 2017 — wages stopped coming"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1978,
        "availableFrom": 1978,
        "availableTo": 2017,
        "id": "x-co-saudi-oger",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "El Seif Engineering Contracting",
        "country": "sau",
        "industry": "construction",
        "payMult": 1.1,
        "salaryMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "project-driven, site-based",
        "drama": [
          "site postings far from home"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1975,
        "availableFrom": 1975,
        "id": "x-co-elseif",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "oil_gas": [
      {
        "name": "Aramco",
        "payMult": 1.4,
        "benefits": [
          "health",
          "stock",
          "housing",
          "pension"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "SABIC",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Maaden",
        "payMult": 1.2,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "banking": [
      {
        "name": "SNB (Saudi National Bank)",
        "payMult": 1.15,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Al Rajhi Bank",
        "payMult": 1.1,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Riyad Bank",
        "payMult": 1.05,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Alinma Bank",
        "payMult": 1.05,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "telecom": [
      {
        "name": "stc (Saudi Telecom)",
        "country": "sau",
        "industry": "telecom",
        "salaryMult": 1.35,
        "benefits": [
          "medical insurance",
          "annual bonus"
        ],
        "perks": [
          "hybrid working"
        ],
        "culture": "fast, competitive",
        "drama": [
          "reorganisations"
        ],
        "retirement": {
          "type": "defined-contribution",
          "employerMatch": 0.08,
          "note": "Company pension fund."
        },
        "founded": 1998,
        "availableFrom": 1998,
        "id": "stc",
        "kind": "company",
        "payMult": 1.35,
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "STC",
        "payMult": 1.1,
        "benefits": [
          "health",
          "housing",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Mobily",
        "payMult": 1.05,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Zain KSA",
        "payMult": 1,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "hospitals": [
      {
        "name": "King Faisal Hospital",
        "payMult": 1.2,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "King Fahd Medical City",
        "payMult": 1.15,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "schools": [
      {
        "name": "American International School Riyadh",
        "payMult": 1.8,
        "benefits": [
          "health",
          "housing",
          "flights",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "British International School Riyadh",
        "payMult": 1.7,
        "benefits": [
          "health",
          "housing",
          "flights"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Riyadh International School",
        "payMult": 1.6,
        "benefits": [
          "health",
          "housing",
          "flights"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Dhahran British Grammar School",
        "payMult": 1.65,
        "benefits": [
          "health",
          "housing",
          "flights"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Continental School Jeddah",
        "payMult": 1.4,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Jeddah International School",
        "payMult": 1.5,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.95,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Google KSA",
        "payMult": 1.55,
        "benefits": [
          "health",
          "stock",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Microsoft KSA",
        "payMult": 1.45,
        "benefits": [
          "health",
          "stock",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Amazon KSA",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "housing"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Elm",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Mobily",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "engineering": [
      {
        "name": "Saudi Binladin Group",
        "payMult": 1.1,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Bechtel KSA",
        "payMult": 1.25,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Nesma & Partners",
        "payMult": 1.1,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Alfanar",
        "payMult": 1,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 3
      },
      {
        "name": "Diriyah Company",
        "payMult": 1.3,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "KAUST",
        "payMult": 1.8,
        "benefits": [
          "health",
          "housing",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "King Saud University",
        "payMult": 1.1,
        "benefits": [
          "health",
          "housing",
          "pension"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "KFUPM",
        "payMult": 1.2,
        "benefits": [
          "health",
          "housing",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "government": [
      {
        "name": "Ministry of Finance",
        "payMult": 1,
        "benefits": [
          "pension",
          "housing"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Saudi Arabian Monetary Authority",
        "payMult": 1.15,
        "benefits": [
          "pension",
          "housing"
        ],
        "stability": 1,
        "prestige": 5
      }
    ],
    "law": [
      {
        "name": "Al Tamimi & Co (KSA)",
        "payMult": 1.3,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Baker McKenzie KSA",
        "payMult": 1.4,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Zaki Hashem KSA",
        "payMult": 1.1,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "hotels": [
      {
        "name": "Marriott Makkah",
        "payMult": 1.2,
        "benefits": [
          "health",
          "housing",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Four Seasons Riyadh",
        "payMult": 1.4,
        "benefits": [
          "health",
          "housing",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "aviation": [
      {
        "name": "Saudia",
        "payMult": 1.3,
        "benefits": [
          "health",
          "housing",
          "travel"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Flyadeal",
        "payMult": 1.1,
        "benefits": [
          "health",
          "housing",
          "travel"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "media": [
      {
        "name": "MBC Group",
        "payMult": 1.25,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Al Arabiya",
        "payMult": 1.2,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "consulting": [
      {
        "name": "PIF (Public Investment Fund)",
        "payMult": 1.6,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Saudi Post Telegraph Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Commercial Typing Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Local Newspaper Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Government Data Processing Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Enterprise Computer Operations",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Neighborhood Video Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Commercial Photo Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Travel and Hajj Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "gbr": {
    "energy": [
      {
        "name": "BP",
        "country": "gbr",
        "industry": "energy",
        "salaryMult": 1.45,
        "benefits": [
          "medical insurance",
          "annual bonus",
          "pension"
        ],
        "perks": [
          "share scheme"
        ],
        "culture": "corporate, global",
        "drama": [
          "oil price cycles"
        ],
        "retirement": {
          "type": "defined-contribution",
          "employerMatch": 0.1,
          "note": "Workplace pension, employer contributes 10%."
        },
        "founded": 1909,
        "availableFrom": 1960,
        "id": "bp",
        "kind": "company",
        "payMult": 1.45,
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "healthcare": [
      {
        "name": "NHS",
        "country": "gbr",
        "industry": "healthcare",
        "salaryMult": 1,
        "benefits": [
          "medical insurance",
          "pension",
          "annual leave"
        ],
        "perks": [
          "job security"
        ],
        "culture": "public service, stretched",
        "drama": [
          "understaffed wards",
          "slow pay rises"
        ],
        "retirement": {
          "type": "defined-benefit",
          "employerMatch": 0.14,
          "note": "NHS Pension Scheme, defined benefit."
        },
        "founded": 1948,
        "availableFrom": 1960,
        "id": "nhs",
        "kind": "company",
        "payMult": 1,
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "banking": [
      {
        "name": "HSBC",
        "country": "gbr",
        "industry": "banking",
        "salaryMult": 1.4,
        "benefits": [
          "medical insurance",
          "annual bonus",
          "pension"
        ],
        "perks": [
          "hybrid working"
        ],
        "culture": "global, formal",
        "drama": [
          "restructurings"
        ],
        "retirement": {
          "type": "defined-contribution",
          "employerMatch": 0.1,
          "note": "Workplace pension, employer contributes 10%."
        },
        "founded": 1865,
        "availableFrom": 1960,
        "id": "hsbc",
        "kind": "company",
        "payMult": 1.4,
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "HSBC UK",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Barclays",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Lloyds Banking Group",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "NatWest",
        "payMult": 1.1,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Lloyds Bank",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Standard Chartered",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "tech": [
      {
        "name": "DeepMind",
        "payMult": 1.6,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Google UK",
        "payMult": 1.45,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Monzo",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "Revolut",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.75,
        "prestige": 4
      },
      {
        "name": "ARM",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "ARM Holdings",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Deliveroo",
        "payMult": 1.15,
        "benefits": [
          "health",
          "wfh"
        ],
        "stability": 0.75,
        "prestige": 4
      },
      {
        "name": "Wise",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 4
      }
    ],
    "law": [
      {
        "name": "Clifford Chance",
        "payMult": 1.55,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Linklaters",
        "payMult": 1.5,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Freshfields",
        "payMult": 1.5,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Allen & Overy",
        "payMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Slaughter and May",
        "payMult": 1.5,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "consulting": [
      {
        "name": "McKinsey UK",
        "payMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "BCG UK",
        "payMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Bain UK",
        "payMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Capgemini UK",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Oliver Wyman",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "hospitals": [
      {
        "name": "NHS (public)",
        "payMult": 0.85,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Bupa Cromwell Hospital",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "The Harley Street Clinic",
        "payMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "Oxford",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Cambridge",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Imperial College London",
        "payMult": 1.25,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "UCL",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "retail": [
      {
        "name": "Tesco",
        "payMult": 0.9,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 2
      },
      {
        "name": "Sainsbury's",
        "payMult": 0.9,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 2
      },
      {
        "name": "Marks & Spencer",
        "payMult": 0.95,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 3
      }
    ],
    "fmcg": [
      {
        "name": "Unilever UK",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Diageo",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Reckitt",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "engineering": [
      {
        "name": "Rolls-Royce",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "BAE Systems",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Arup",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "hotels": [
      {
        "name": "Claridge's",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "The Savoy",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "meals"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Premier Inn (Whitbread)",
        "payMult": 0.95,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3
      }
    ],
    "media": [
      {
        "name": "BBC",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "The Guardian",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Financial Times",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "aviation": [
      {
        "name": "British Airways",
        "payMult": 1.35,
        "benefits": [
          "health",
          "pension",
          "travel"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Virgin Atlantic",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension",
          "travel"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "easyJet",
        "payMult": 1.15,
        "benefits": [
          "health",
          "travel"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "government": [
      {
        "name": "UK Civil Service",
        "payMult": 0.95,
        "benefits": [
          "pension",
          "health"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Bank of England",
        "payMult": 1.2,
        "benefits": [
          "pension",
          "health",
          "bonus"
        ],
        "stability": 1,
        "prestige": 5
      }
    ],
    "schools": [
      {
        "name": "Eton College",
        "payMult": 1.35,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Harrow School",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "State Secondary School",
        "payMult": 0.85,
        "benefits": [
          "pension"
        ],
        "stability": 1,
        "prestige": 3
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Post Office Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "British Telecom Telephone Exchange",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Commercial Typing Bureau",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Regional Newspaper Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Corporate Computer Operations",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "High Street Video Rental",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "High Street Photo Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Town Travel Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Radio and Television Repair Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "deu": {
    "retail": [
      {
        "name": "ALDI",
        "country": "deu",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, disciplined",
        "drama": [
          "early-morning shifts"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1946,
        "availableFrom": 1946,
        "id": "x-co-aldi",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Lidl",
        "country": "deu",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, disciplined",
        "drama": [
          "early-morning shifts"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1973,
        "availableFrom": 1973,
        "id": "x-co-lidl",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "EDEKA",
        "country": "deu",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, cooperative",
        "drama": [
          "shift work"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1907,
        "availableFrom": 1907,
        "id": "x-co-edeka",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "manufacturing": [
      {
        "name": "BASF",
        "country": "deu",
        "industry": "manufacturing",
        "payMult": 1.45,
        "salaryMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "engineering, precise",
        "drama": [
          "chemical price cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1865,
        "availableFrom": 1865,
        "id": "x-co-basf",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Miele",
        "country": "deu",
        "industry": "manufacturing",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "engineering, proud",
        "drama": [
          "slow decisions"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1899,
        "availableFrom": 1899,
        "id": "x-co-miele",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "TRUMPF",
        "country": "deu",
        "industry": "manufacturing",
        "payMult": 1.4,
        "salaryMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "engineering, precise",
        "drama": [
          "export order swings"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1923,
        "availableFrom": 1923,
        "id": "x-co-trumpf",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Würth Group",
        "country": "deu",
        "industry": "manufacturing",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "family-owned, sales-driven",
        "drama": [
          "sales targets"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1945,
        "availableFrom": 1945,
        "id": "x-co-wuerth",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "ZF Friedrichshafen",
        "country": "deu",
        "industry": "manufacturing",
        "payMult": 1.4,
        "salaryMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "engineering, precise",
        "drama": [
          "auto industry cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1915,
        "availableFrom": 1915,
        "id": "x-co-zf",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Kärcher",
        "country": "deu",
        "industry": "manufacturing",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "family-owned, engineering",
        "drama": [
          "export order swings"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1935,
        "availableFrom": 1935,
        "id": "x-co-kaercher",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Viessmann Group",
        "country": "deu",
        "industry": "manufacturing",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "family-owned, engineering",
        "drama": [
          "heating market cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1917,
        "availableFrom": 1917,
        "id": "x-co-viessmann",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "STIHL",
        "country": "deu",
        "industry": "manufacturing",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "family-owned, engineering",
        "drama": [
          "seasonal demand"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1926,
        "availableFrom": 1926,
        "id": "x-co-stihl",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "banking": [
      {
        "name": "Deutsche Bank",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Commerzbank",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Sparkasse",
        "payMult": 0.95,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "N26",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.75,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "SAP",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Siemens",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Bosch",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Zalando",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "Delivery Hero",
        "payMult": 1.1,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.75,
        "prestige": 4
      },
      {
        "name": "Infineon",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "law": [
      {
        "name": "Freshfields Germany",
        "payMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Hengeler Mueller",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Gleiss Lutz",
        "payMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "hospitals": [
      {
        "name": "Charit\u00e9 Berlin",
        "payMult": 1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "Universit\u00e4tsklinikum Heidelberg",
        "payMult": 1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "Asklepios Klinik",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      }
    ],
    "universities": [
      {
        "name": "TU Munich",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "LMU Munich",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Heidelberg University",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "engineering": [
      {
        "name": "BMW",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "pension",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Mercedes-Benz",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "pension",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Volkswagen",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Airbus",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Bosch",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Audi",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Porsche",
        "payMult": 1.3,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "fmcg": [
      {
        "name": "Henkel",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Beiersdorf (Nivea)",
        "payMult": 1.1,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Adidas",
        "payMult": 1.1,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "government": [
      {
        "name": "German Civil Service",
        "payMult": 0.95,
        "benefits": [
          "pension",
          "health"
        ],
        "stability": 1,
        "prestige": 4
      },
      {
        "name": "Bundesbank",
        "payMult": 1.15,
        "benefits": [
          "pension",
          "health"
        ],
        "stability": 1,
        "prestige": 5
      }
    ],
    "pharma": [
      {
        "name": "Fresenius",
        "country": "deu",
        "industry": "pharma",
        "payMult": 1.4,
        "salaryMult": 1.4,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "research-driven",
        "drama": [
          "regulatory pressure"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1912,
        "availableFrom": 1912,
        "id": "x-co-fresenius",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "BioNTech",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus",
          "stock"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Merck KGaA",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Deutsche Bundespost Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Deutsche Bundespost Telephone Exchange",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Commercial Typing Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Regional Zeitung Printing Plant",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Enterprise Data Processing Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Corporate Rechenzentrum",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Videoverleih Store",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Fotolabor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Reiseb\u00fcro",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Radio-Fernseh-Technik Werkstatt",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "can": {
    "fmcg": [
      {
        "name": "Tim Hortons",
        "country": "can",
        "industry": "fmcg",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, customer-facing",
        "drama": [
          "early-morning shifts"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1964,
        "availableFrom": 1964,
        "id": "x-co-tim-hortons",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "telecom": [
      {
        "name": "Rogers Communications",
        "country": "can",
        "industry": "telecom",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "fast, competitive",
        "drama": [
          "reorganisations"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1960,
        "availableFrom": 1960,
        "id": "x-co-rogers",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Bell Canada",
        "country": "can",
        "industry": "telecom",
        "payMult": 1.3,
        "salaryMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "large, structured",
        "drama": [
          "slow promotion"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1880,
        "availableFrom": 1880,
        "id": "x-co-bell",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "aviation": [
      {
        "name": "WestJet",
        "country": "can",
        "industry": "aviation",
        "payMult": 1.2,
        "salaryMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "airline, demanding",
        "drama": [
          "irregular hours"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1996,
        "availableFrom": 1996,
        "id": "x-co-westjet",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "logistics": [
      {
        "name": "Canadian National Railway",
        "country": "can",
        "industry": "logistics",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "operational, shift-based",
        "drama": [
          "rail shifts"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1919,
        "availableFrom": 1919,
        "id": "x-co-cn-rail",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "energy": [
      {
        "name": "Suncor Energy",
        "country": "can",
        "industry": "energy",
        "payMult": 1.45,
        "salaryMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "industrial, structured",
        "drama": [
          "oil price cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1917,
        "availableFrom": 1917,
        "id": "x-co-suncor",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "manufacturing": [
      {
        "name": "Magna International",
        "country": "can",
        "industry": "manufacturing",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "industrial, project-based",
        "drama": [
          "auto industry cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1957,
        "availableFrom": 1957,
        "id": "x-co-magna",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "retail": [
      {
        "name": "Canadian Tire",
        "country": "can",
        "industry": "retail",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, operational",
        "drama": [
          "seasonal rushes"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1922,
        "availableFrom": 1922,
        "id": "x-co-canadian-tire",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Loblaws",
        "country": "can",
        "industry": "retail",
        "payMult": 1,
        "salaryMult": 1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, shift-based",
        "drama": [
          "shift work"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1919,
        "availableFrom": 1919,
        "id": "x-co-loblaws",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Couche-Tard (Alimentation Couche-Tard)",
        "country": "can",
        "industry": "retail",
        "payMult": 1.1,
        "salaryMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, fast-growing",
        "drama": [
          "acquisition churn"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1980,
        "availableFrom": 1980,
        "id": "x-co-couche-tard",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "banking": [
      {
        "name": "Manulife",
        "country": "can",
        "industry": "banking",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "formal, stable",
        "drama": [
          "slow promotion"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1887,
        "availableFrom": 1887,
        "id": "x-co-manulife",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Sun Life Financial",
        "country": "can",
        "industry": "banking",
        "payMult": 1.35,
        "salaryMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4,
        "perks": [],
        "culture": "formal, stable",
        "drama": [
          "slow promotion"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1865,
        "availableFrom": 1865,
        "id": "x-co-sunlife",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Royal Bank of Canada",
        "country": "can",
        "industry": "banking",
        "salaryMult": 1.4,
        "benefits": [
          "medical insurance",
          "annual bonus",
          "pension"
        ],
        "perks": [
          "hybrid working"
        ],
        "culture": "stable, formal",
        "drama": [
          "slow promotion"
        ],
        "retirement": {
          "type": "defined-contribution",
          "employerMatch": 0.09,
          "note": "Group RRSP / pension, employer contributes 9%."
        },
        "founded": 1864,
        "availableFrom": 1960,
        "id": "rbc",
        "kind": "company",
        "payMult": 1.4,
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "RBC",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "TD Bank",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Scotiabank",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "BMO",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "BMO (Bank of Montreal)",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "CIBC",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Shopify",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Amazon Canada",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Google Canada",
        "payMult": 1.45,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "OpenText",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Constellation Software",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Hootsuite",
        "payMult": 1.1,
        "benefits": [
          "health",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 3
      }
    ],
    "law": [
      {
        "name": "McCarthy T\u00e9trault",
        "payMult": 1.35,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Blake Cassels",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Osler Hoskin",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "hospitals": [
      {
        "name": "Toronto General Hospital",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Vancouver General Hospital",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "University of Toronto",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "UBC",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "McGill",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "engineering": [
      {
        "name": "SNC-Lavalin",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Stantec",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "WSP Global",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Bombardier",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.8,
        "prestige": 4
      }
    ],
    "consulting": [
      {
        "name": "McKinsey Canada",
        "payMult": 1.45,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Deloitte Canada",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Canada \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Canada \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Canada \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Canada \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Canada \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Canada \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Canada \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Canada \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Canada \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Canada \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "aus": {
    "banking": [
      {
        "name": "Commonwealth Bank",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Westpac",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "ANZ",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "NAB",
        "payMult": 1.05,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Atlassian",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "wfh",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Canva",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Google Australia",
        "payMult": 1.45,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Afterpay",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "REA Group",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "hospitals": [
      {
        "name": "Royal Melbourne Hospital",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Royal Prince Alfred Hospital",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "University of Melbourne",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "UNSW",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "ANU",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "engineering": [
      {
        "name": "BHP",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Rio Tinto",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "CIMIC Group",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "mining": [
      {
        "name": "Rio Tinto",
        "payMult": 1.35,
        "benefits": [
          "health",
          "pension",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Fortescue Metals",
        "payMult": 1.3,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Woodside Energy",
        "payMult": 1.25,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Australia \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Australia \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Australia \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Australia \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Australia \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Australia \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Australia \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Australia \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Australia \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Australia \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "uae": {
    "logistics": [
      {
        "name": "DP World",
        "country": "uae",
        "industry": "logistics",
        "salaryMult": 1.3,
        "benefits": [
          "medical insurance",
          "annual bonus"
        ],
        "perks": [
          "transport allowance"
        ],
        "culture": "global, operational",
        "drama": [
          "port shifts"
        ],
        "retirement": {
          "type": "defined-contribution",
          "employerMatch": 0.07,
          "note": "End-of-service benefit plus pension fund."
        },
        "founded": 2005,
        "availableFrom": 2005,
        "id": "dpworld",
        "kind": "company",
        "payMult": 1.3,
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "construction": [
      {
        "name": "Arabtec Construction",
        "country": "uae",
        "industry": "construction",
        "payMult": 1.15,
        "salaryMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "project-driven, site-based",
        "drama": [
          "folded in 2022 — the project pipeline dried up"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1975,
        "availableFrom": 1975,
        "availableTo": 2022,
        "id": "x-co-arabtec",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "retail": [
      {
        "name": "Lulu Group International",
        "country": "uae",
        "industry": "retail",
        "payMult": 1.05,
        "salaryMult": 1.05,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "retail, fast-growing",
        "drama": [
          "hypermarket shifts"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 2000,
        "availableFrom": 2000,
        "id": "x-co-lulu",
        "kind": "company",
        "expansion": "11g"
      },
      {
        "name": "Majid Al Futtaim",
        "country": "uae",
        "industry": "retail",
        "payMult": 1.25,
        "salaryMult": 1.25,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 3,
        "perks": [],
        "culture": "large, mall-driven",
        "drama": [
          "mall footfall cycles"
        ],
        "retirement": {
          "type": "pension",
          "employerMatch": 0,
          "note": "Standard pension for the industry."
        },
        "founded": 1992,
        "availableFrom": 1992,
        "id": "x-co-maf",
        "kind": "company",
        "expansion": "11g"
      }
    ],
    "banking": [
      {
        "name": "Emirates NBD",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "First Abu Dhabi Bank (FAB)",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Mashreq Bank",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Abu Dhabi Commercial Bank (ADCB)",
        "payMult": 1.1,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Mashreq",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "schools": [
      {
        "name": "GEMS Wellington International School",
        "payMult": 1.6,
        "benefits": [
          "health",
          "housing",
          "flights"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Dubai American Academy",
        "payMult": 1.8,
        "benefits": [
          "health",
          "housing",
          "flights",
          "bonus"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Dubai College",
        "payMult": 1.9,
        "benefits": [
          "health",
          "housing",
          "flights"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Repton School Dubai",
        "payMult": 1.7,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "The English College Dubai",
        "payMult": 1.5,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Jumeirah College",
        "payMult": 1.55,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Google UAE",
        "payMult": 1.5,
        "benefits": [
          "health",
          "stock",
          "housing"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Careem",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "housing"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Noon.com",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "housing"
        ],
        "stability": 0.75,
        "prestige": 4
      },
      {
        "name": "Talabat",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "Noon",
        "payMult": 1.1,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "hospitals": [
      {
        "name": "Cleveland Clinic Abu Dhabi",
        "payMult": 1.4,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Mediclinic Dubai",
        "payMult": 1.3,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "NMC Healthcare",
        "payMult": 1.05,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "Aster DM Healthcare",
        "payMult": 1,
        "benefits": [
          "health"
        ],
        "stability": 0.85,
        "prestige": 3
      }
    ],
    "aviation": [
      {
        "name": "Emirates",
        "country": "uae",
        "industry": "aviation",
        "salaryMult": 1.4,
        "benefits": [
          "medical insurance",
          "housing allowance",
          "flight benefits"
        ],
        "perks": [
          "free flights",
          "company housing"
        ],
        "culture": "international, demanding",
        "drama": [
          "irregular hours",
          "strict grooming standards"
        ],
        "retirement": {
          "type": "defined-contribution",
          "employerMatch": 0.08,
          "note": "End-of-service benefit plus pension fund."
        },
        "founded": 1985,
        "availableFrom": 1985,
        "id": "emirates",
        "kind": "company",
        "payMult": 1.4,
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Emirates Airline",
        "payMult": 1.55,
        "benefits": [
          "health",
          "housing",
          "travel"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Etihad Airways",
        "payMult": 1.4,
        "benefits": [
          "health",
          "housing",
          "travel"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Flydubai",
        "payMult": 1.1,
        "benefits": [
          "health",
          "tickets"
        ],
        "stability": 0.85,
        "prestige": 4
      },
      {
        "name": "Air Arabia",
        "payMult": 1.05,
        "benefits": [
          "health",
          "tickets"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "hotels": [
      {
        "name": "Atlantis The Palm",
        "payMult": 1.35,
        "benefits": [
          "health",
          "housing",
          "meals"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Burj Al Arab",
        "payMult": 1.45,
        "benefits": [
          "health",
          "housing",
          "meals"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Emirates Palace",
        "payMult": 1.4,
        "benefits": [
          "health",
          "housing",
          "meals"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "oil_gas": [
      {
        "name": "ADNOC",
        "payMult": 1.35,
        "benefits": [
          "health",
          "housing",
          "stock"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "ENOC",
        "payMult": 1.2,
        "benefits": [
          "health",
          "housing"
        ],
        "stability": 0.95,
        "prestige": 4
      }
    ],
    "law": [
      {
        "name": "Al Tamimi & Co",
        "payMult": 1.35,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Clyde & Co UAE",
        "payMult": 1.3,
        "benefits": [
          "health",
          "housing",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "real_estate": [
      {
        "name": "Aldar Properties",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Damac Properties",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.8,
        "prestige": 4
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Emirates Telegraph Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Business Typing Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Local Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Government Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Enterprise Computer Operations",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "nld": {
    "banking": [
      {
        "name": "ING Bank",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Rabobank",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "ABN AMRO",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "ASML",
        "payMult": 1.4,
        "benefits": [
          "health",
          "stock",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Booking.com",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Adyen",
        "payMult": 1.35,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "TU Delft",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "University of Amsterdam",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Leiden University",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Netherlands \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Netherlands \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Netherlands \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Netherlands \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Netherlands \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Netherlands \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Netherlands \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Netherlands \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Netherlands \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Netherlands \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "fra": {
    "banking": [
      {
        "name": "BNP Paribas",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Soci\u00e9t\u00e9 G\u00e9n\u00e9rale",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Cr\u00e9dit Agricole",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Dassault Syst\u00e8mes",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Mistral AI",
        "payMult": 1.4,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.7,
        "prestige": 5
      },
      {
        "name": "Dataiku",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 4
      }
    ],
    "universities": [
      {
        "name": "Sorbonne",
        "payMult": 1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "\u00c9cole Polytechnique",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Sciences Po",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "France \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "France \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "France \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "France \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "France \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "France \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "France \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "France \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "France \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "France \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "jpn": {
    "banking": [
      {
        "name": "MUFG Bank",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "SMBC",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Mizuho Bank",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Sony",
        "payMult": 1.2,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Toyota",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Rakuten",
        "payMult": 1.15,
        "benefits": [
          "health",
          "stock"
        ],
        "stability": 0.85,
        "prestige": 4
      }
    ],
    "universities": [
      {
        "name": "University of Tokyo",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Kyoto University",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Japan \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Japan \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Japan \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Japan \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Japan \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Japan \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Japan \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Japan \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Japan \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Japan \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "ita": {
    "banking": [
      {
        "name": "Intesa Sanpaolo",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "UniCredit",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Banco BPM",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Bending Spoons",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 4
      },
      {
        "name": "Ferrari",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "Sapienza University",
        "payMult": 1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Bocconi",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Politecnico di Milano",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Italy \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Italy \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Italy \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Italy \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Italy \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Italy \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Italy \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Italy \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Italy \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Italy \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "sgp": {
    "banking": [
      {
        "name": "DBS Bank",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "OCBC Bank",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "UOB",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "tech": [
      {
        "name": "Grab",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Sea Group",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      },
      {
        "name": "Google Singapore",
        "payMult": 1.5,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "NUS",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "NTU",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "SMU",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Singapore \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Singapore \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Singapore \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Singapore \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Singapore \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Singapore \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Singapore \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Singapore \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Singapore \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Singapore \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "bra": {
    "banking": [
      {
        "name": "Ita\u00fa Unibanco",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Bradesco",
        "payMult": 1.1,
        "benefits": [
          "health",
          "bonus",
          "pension"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "Nubank",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      }
    ],
    "tech": [
      {
        "name": "Mercado Libre",
        "payMult": 1.25,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.85,
        "prestige": 5
      },
      {
        "name": "Nubank (tech)",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "USP",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "Unicamp",
        "payMult": 1.1,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "FGV",
        "payMult": 1.15,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "Brazil \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "Brazil \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "Brazil \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "Brazil \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "Brazil \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "Brazil \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "Brazil \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "Brazil \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "Brazil \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "Brazil \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  },
  "ind": {
    "banking": [
      {
        "name": "HDFC Bank",
        "payMult": 1.2,
        "benefits": [
          "health",
          "bonus",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "ICICI Bank",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus",
          "stock"
        ],
        "stability": 0.9,
        "prestige": 5
      },
      {
        "name": "SBI",
        "payMult": 0.9,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 4
      }
    ],
    "tech": [
      {
        "name": "Infosys",
        "payMult": 1,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "TCS",
        "payMult": 0.95,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.95,
        "prestige": 4
      },
      {
        "name": "Wipro",
        "payMult": 0.95,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.9,
        "prestige": 4
      },
      {
        "name": "Flipkart",
        "payMult": 1.3,
        "benefits": [
          "health",
          "stock",
          "wfh"
        ],
        "stability": 0.8,
        "prestige": 5
      }
    ],
    "universities": [
      {
        "name": "IIT Bombay",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "IIT Delhi",
        "payMult": 1.2,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      },
      {
        "name": "NIT Trichy",
        "payMult": 1.05,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 0.95,
        "prestige": 5
      }
    ],
    "hospitals": [
      {
        "name": "AIIMS",
        "payMult": 0.95,
        "benefits": [
          "health",
          "pension"
        ],
        "stability": 1,
        "prestige": 5
      },
      {
        "name": "Apollo Hospitals",
        "payMult": 1.15,
        "benefits": [
          "health",
          "bonus"
        ],
        "stability": 0.9,
        "prestige": 5
      }
    ],
    "legacy_telegraph": [
      {
        "name": "India \u00b7 National Postal / Telegraph Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_switchboard": [
      {
        "name": "India \u00b7 Telephone Exchange Service",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_typist": [
      {
        "name": "India \u00b7 Commercial Typing and Secretarial Office",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_linotype": [
      {
        "name": "India \u00b7 Newspaper Printing Press",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_punchcard": [
      {
        "name": "India \u00b7 Business Data Processing Unit",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_mainframe": [
      {
        "name": "India \u00b7 Enterprise Computer Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_video": [
      {
        "name": "India \u00b7 Video Rental Shop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_darkroom": [
      {
        "name": "India \u00b7 Commercial Photo Processing Lab",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_travel": [
      {
        "name": "India \u00b7 Local Travel and Ticketing Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "legacy_repair": [
      {
        "name": "India \u00b7 Consumer Electronics Repair Workshop",
        "payMult": 1,
        "benefits": [],
        "stability": 0.75,
        "prestige": 2
      }
    ],
    "emerging_pc_support": [
      {
        "name": "Local Computer Repair & Support Firm",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate IT Help Desk",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_web_dev": [
      {
        "name": "Web Design Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_mobile_apps": [
      {
        "name": "Mobile Application Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Digital Product Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_renewables": [
      {
        "name": "Solar Installation Contractor",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Renewable Energy Project Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ecommerce": [
      {
        "name": "Online Retail Company",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Marketplace Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_social_media": [
      {
        "name": "Digital Communications Agency",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Brand Community Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ai_automation": [
      {
        "name": "AI Automation Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Enterprise Digital Transformation Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_data_analytics": [
      {
        "name": "Business Intelligence Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Financial Reporting & Analytics Consultancy",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cybersecurity": [
      {
        "name": "Managed Security Service Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Corporate Security Operations Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_cloud_devops": [
      {
        "name": "Cloud Infrastructure Provider",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Software Platform Operations Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_content_creator": [
      {
        "name": "Digital Video Studio",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "Online Media Production Team",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_delivery_ops": [
      {
        "name": "Courier Dispatch Center",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "E-commerce Fulfillment Operator",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ],
    "emerging_ev": [
      {
        "name": "Automotive Service Network",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      },
      {
        "name": "EV Charging Installer",
        "payMult": 1,
        "benefits": [],
        "stability": 0.72,
        "prestige": 2
      }
    ]
  }
};
export const V1_PARTTIME_JOBS = [
  {
    "id": "barista",
    "label": "Barista / Caf\u00e9 worker",
    "monthlyEGP": 5000,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 15,
    "from": 1960
  },
  {
    "id": "waiter",
    "label": "Restaurant waiter",
    "monthlyEGP": 4500,
    "hoursPerWeek": 25,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 16,
    "tips": true,
    "from": 1960
  },
  {
    "id": "retail",
    "label": "Retail assistant",
    "monthlyEGP": 4500,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 16,
    "from": 1957
  },
  {
    "id": "security",
    "label": "Security guard",
    "monthlyEGP": 4500,
    "hoursPerWeek": 24,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 18,
    "from": 1960
  },
  {
    "id": "delivery",
    "label": "Delivery rider (Talabat)",
    "monthlyEGP": 7000,
    "hoursPerWeek": 30,
    "requiresCar": false,
    "requiresBike": true,
    "affectsGrades": true,
    "minAge": 18,
    "from": 2004
  },
  {
    "id": "uber",
    "label": "Uber / Careem driver",
    "monthlyEGP": 10000,
    "hoursPerWeek": 30,
    "requiresCar": true,
    "affectsGrades": true,
    "minAge": 18,
    "from": 2009
  },
  {
    "id": "tutor",
    "label": "Private tutor",
    "monthlyEGP": 8000,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "requiresSmart": 65,
    "from": 1960
  },
  {
    "id": "translator",
    "label": "Freelance translator",
    "monthlyEGP": 6000,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "requiresEnglish": 7,
    "from": 1960
  },
  {
    "id": "freelance_dev",
    "label": "Freelance developer",
    "monthlyEGP": 12000,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 18,
    "requiresSmart": 70,
    "requiresDegree": "cs",
    "from": 1975
  },
  {
    "id": "content",
    "label": "Content creator",
    "monthlyEGP": 4000,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 16,
    "from": 2005
  },
  {
    "id": "warehouse",
    "label": "Warehouse worker",
    "monthlyEGP": 5000,
    "hoursPerWeek": 30,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 18,
    "from": 1960
  },
  {
    "id": "kitchen_helper",
    "label": "Kitchen helper",
    "monthlyEGP": 4200,
    "hoursPerWeek": 25,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 16,
    "from": 1960
  },
  {
    "id": "call_center_pt",
    "label": "Call center agent (part-time)",
    "monthlyEGP": 5500,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 18,
    "from": 1998
  },
  {
    "id": "receptionist_pt",
    "label": "Receptionist (part-time)",
    "monthlyEGP": 5000,
    "hoursPerWeek": 25,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "from": 1960
  },
  {
    "id": "data_entry",
    "label": "Data entry",
    "monthlyEGP": 4000,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 16,
    "from": 1960
  },
  {
    "id": "photographer_pt",
    "label": "Event photographer",
    "monthlyEGP": 6000,
    "hoursPerWeek": 10,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "requiresSmart": 55,
    "from": 1960
  },
  {
    "id": "graphic_pt",
    "label": "Freelance graphic designer",
    "monthlyEGP": 7000,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "requiresSmart": 60,
    "from": 1985
  },
  {
    "id": "dog_walker",
    "label": "Dog walker",
    "monthlyEGP": 4000,
    "hoursPerWeek": 12,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 16,
    "from": 1985
  },
  {
    "id": "newsboy",
    "label": "Newspaper route boy",
    "monthlyEGP": 2600,
    "hoursPerWeek": 18,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 12,
    "from": 1960,
    "until": 1995
  },
  {
    "id": "tea_boy",
    "label": "Caf\u00e9 tea boy",
    "monthlyEGP": 2400,
    "hoursPerWeek": 30,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 12,
    "from": 1960,
    "until": 1990
  },
  {
    "id": "tailor_apprentice",
    "label": "Tailor's apprentice",
    "monthlyEGP": 2800,
    "hoursPerWeek": 25,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 13,
    "from": 1960,
    "until": 1995
  },
  {
    "id": "market_porter",
    "label": "Market porter",
    "monthlyEGP": 3400,
    "hoursPerWeek": 28,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 14,
    "from": 1960,
    "until": 1998
  },
  {
    "id": "bike_messenger",
    "label": "Bicycle courier",
    "monthlyEGP": 3800,
    "hoursPerWeek": 25,
    "requiresCar": false,
    "requiresBike": true,
    "affectsGrades": true,
    "minAge": 15,
    "from": 1960,
    "until": 2005
  },
  {
    "id": "typist_pt",
    "label": "Typist / shorthand clerk",
    "monthlyEGP": 4200,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 17,
    "requiresSmart": 50,
    "from": 1960,
    "until": 1995
  },
  {
    "id": "punch_card_op",
    "label": "Punch-card operator",
    "monthlyEGP": 4600,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "requiresSmart": 55,
    "from": 1960,
    "until": 1985
  },
  {
    "id": "darkroom_runner",
    "label": "Darkroom runner",
    "monthlyEGP": 3600,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 16,
    "requiresSmart": 45,
    "from": 1960,
    "until": 2002
  },
  {
    "id": "market_stall_helper",
    "label": "Market stall helper",
    "monthlyEGP": 4000,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 15,
    "from": 1960
  },
  {
    "id": "night_cleaner",
    "label": "Night cleaner",
    "monthlyEGP": 5000,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 18,
    "from": 1960
  },
  {
    "id": "phone_repair_helper",
    "label": "Phone repair helper",
    "monthlyEGP": 6000,
    "hoursPerWeek": 18,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 16,
    "from": 1998
  },
  {
    "id": "call_shop_attendant",
    "label": "Call shop attendant",
    "monthlyEGP": 4500,
    "hoursPerWeek": 25,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 16,
    "from": 1995,
    "until": 2012
  },
  {
    "id": "wedding_hall_helper",
    "label": "Wedding hall helper",
    "monthlyEGP": 4500,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 16,
    "from": 1960
  },
  {
    "id": "driving_school_assistant",
    "label": "Driving school assistant",
    "monthlyEGP": 5000,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "from": 1970
  },
  {
    "id": "pharmacy_delivery",
    "label": "Pharmacy delivery",
    "monthlyEGP": 5500,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "requiresBike": true,
    "affectsGrades": true,
    "minAge": 18,
    "from": 1980
  },
  {
    "id": "pastry_packer",
    "label": "Pastry packer",
    "monthlyEGP": 4000,
    "hoursPerWeek": 25,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 15,
    "from": 1960
  },
  {
    "id": "exam_invigilator",
    "label": "Exam invigilator",
    "monthlyEGP": 5000,
    "hoursPerWeek": 12,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "from": 1960
  },
  {
    "id": "language_tutor_online",
    "label": "Language tutor (online)",
    "monthlyEGP": 8000,
    "hoursPerWeek": 12,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "requiresEnglish": 7,
    "from": 2008
  },
  {
    "id": "survey_enumerator",
    "label": "Survey enumerator",
    "monthlyEGP": 4500,
    "hoursPerWeek": 20,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 16,
    "from": 1960
  },
  {
    "id": "event_steward",
    "label": "Event steward",
    "monthlyEGP": 5000,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 18,
    "from": 1980
  },
  {
    "id": "car_park_attendant",
    "label": "Car park attendant",
    "monthlyEGP": 4500,
    "hoursPerWeek": 25,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 18,
    "from": 1970
  },
  {
    "id": "courier_scooter",
    "label": "Courier (scooter)",
    "monthlyEGP": 7000,
    "hoursPerWeek": 30,
    "requiresCar": false,
    "requiresBike": true,
    "affectsGrades": true,
    "minAge": 18,
    "from": 2005
  },
  {
    "id": "farm_harvest_hand",
    "label": "Farm harvest hand",
    "monthlyEGP": 4000,
    "hoursPerWeek": 30,
    "requiresCar": false,
    "affectsGrades": true,
    "minAge": 15,
    "from": 1960
  },
  {
    "id": "library_assistant",
    "label": "Library assistant",
    "monthlyEGP": 3500,
    "hoursPerWeek": 15,
    "requiresCar": false,
    "affectsGrades": false,
    "minAge": 16,
    "from": 1960
  }
];
export const V1_INTERNSHIPS = [
  {
    "id": "bank_intern",
    "label": "Banking intern",
    "company": "CIB",
    "paid": true,
    "monthlyEGP": 6000,
    "months": 3,
    "careerBoost": 0.15,
    "performance": true
  },
  {
    "id": "tech_intern",
    "label": "Tech intern",
    "company": "Microsoft Egypt",
    "paid": true,
    "monthlyEGP": 10000,
    "months": 3,
    "careerBoost": 0.2,
    "performance": true
  },
  {
    "id": "consult_intern",
    "label": "Consulting intern",
    "company": "PwC Egypt",
    "paid": true,
    "monthlyEGP": 8000,
    "months": 3,
    "careerBoost": 0.18,
    "performance": true
  },
  {
    "id": "unpaid_office",
    "label": "Unpaid office intern",
    "company": "Startup",
    "paid": false,
    "monthlyEGP": 0,
    "months": 3,
    "careerBoost": 0.1,
    "performance": true
  },
  {
    "id": "pharma_intern",
    "label": "Pharma intern",
    "company": "Eva Pharma",
    "paid": true,
    "monthlyEGP": 5000,
    "months": 3,
    "careerBoost": 0.12,
    "performance": true
  },
  {
    "id": "hospital_vol",
    "label": "Hospital volunteer",
    "company": "Kasr El Aini",
    "paid": false,
    "monthlyEGP": 0,
    "months": 2,
    "careerBoost": 0.15,
    "performance": true,
    "requiresDegree": "medicine"
  },
  {
    "id": "govt_intern",
    "label": "Government intern",
    "company": "Ministry of Finance",
    "paid": false,
    "monthlyEGP": 0,
    "months": 3,
    "careerBoost": 0.1,
    "performance": true
  },
  {
    "id": "nursing_intern",
    "label": "Nursing shadowing",
    "company": "Dar Al Fouad",
    "paid": true,
    "monthlyEGP": 5000,
    "months": 3,
    "careerBoost": 0.15,
    "performance": true,
    "requiresDegree": "nursing"
  },
  {
    "id": "research_intern",
    "label": "Research assistant",
    "company": "University Lab",
    "paid": true,
    "monthlyEGP": 4000,
    "months": 4,
    "careerBoost": 0.18,
    "performance": true
  },
  {
    "id": "startup_intern",
    "label": "Startup generalist",
    "company": "Fawry / startup",
    "paid": true,
    "monthlyEGP": 6000,
    "months": 3,
    "careerBoost": 0.15,
    "performance": true
  },
  {
    "id": "media_intern",
    "label": "Media intern",
    "company": "MBC Masr",
    "paid": true,
    "monthlyEGP": 5000,
    "months": 3,
    "careerBoost": 0.15,
    "performance": true
  },
  {
    "id": "summer_analyst",
    "label": "Summer analyst (IB)",
    "company": "EFG Hermes",
    "paid": true,
    "monthlyEGP": 15000,
    "months": 2,
    "careerBoost": 0.3,
    "performance": true,
    "requiresDegree": "business"
  }
];
export const V1_BUSINESS_TYPES = [
  {
    "id": "cafe",
    "label": "Caf\u00e9",
    "startupEGP": 800000,
    "monthlyOverheadEGP": 80000,
    "baseRevenueEGP": 200000,
    "maxLevel": 5,
    "staffRoles": [
      "barista",
      "waiter",
      "manager",
      "cleaner"
    ],
    "desc": "Coffee shop in a good location.",
    "from": 1960
  },
  {
    "id": "restaurant",
    "label": "Restaurant",
    "startupEGP": 2000000,
    "monthlyOverheadEGP": 200000,
    "baseRevenueEGP": 500000,
    "maxLevel": 5,
    "staffRoles": [
      "chef",
      "waiter",
      "manager",
      "cleaner",
      "cashier"
    ],
    "desc": "Full-service restaurant.",
    "from": 1960
  },
  {
    "id": "retail_shop",
    "label": "Retail shop",
    "startupEGP": 500000,
    "monthlyOverheadEGP": 62000,
    "baseRevenueEGP": 120000,
    "maxLevel": 5,
    "staffRoles": [
      "cashier",
      "manager",
      "cleaner"
    ],
    "desc": "Small retail store.",
    "from": 1960
  },
  {
    "id": "ecommerce",
    "label": "E-commerce store",
    "startupEGP": 100000,
    "monthlyOverheadEGP": 20000,
    "baseRevenueEGP": 80000,
    "maxLevel": 5,
    "staffRoles": [
      "manager",
      "packager"
    ],
    "desc": "Online store. Low overhead.",
    "from": 1997
  },
  {
    "id": "tutoring_center",
    "label": "Tutoring center",
    "startupEGP": 300000,
    "monthlyOverheadEGP": 40000,
    "baseRevenueEGP": 100000,
    "maxLevel": 5,
    "staffRoles": [
      "teacher",
      "manager"
    ],
    "desc": "After-school tutoring.",
    "from": 1960
  },
  {
    "id": "salon",
    "label": "Salon / barbershop",
    "startupEGP": 600000,
    "monthlyOverheadEGP": 70000,
    "baseRevenueEGP": 180000,
    "maxLevel": 5,
    "staffRoles": [
      "stylist",
      "manager",
      "cleaner"
    ],
    "desc": "Beauty salon or barber.",
    "from": 1960
  },
  {
    "id": "gym",
    "label": "Gym / fitness studio",
    "startupEGP": 2500000,
    "monthlyOverheadEGP": 150000,
    "baseRevenueEGP": 400000,
    "maxLevel": 5,
    "staffRoles": [
      "trainer",
      "manager",
      "cleaner"
    ],
    "desc": "Full gym.",
    "from": 1970
  },
  {
    "id": "pharmacy",
    "label": "Pharmacy",
    "startupEGP": 1500000,
    "monthlyOverheadEGP": 100000,
    "baseRevenueEGP": 250000,
    "maxLevel": 5,
    "staffRoles": [
      "pharmacist",
      "cashier",
      "manager"
    ],
    "requiresDegree": "pharmacy",
    "desc": "Licensed pharmacy.",
    "from": 1960
  },
  {
    "id": "clinic",
    "label": "Medical clinic",
    "startupEGP": 2500000,
    "monthlyOverheadEGP": 180000,
    "baseRevenueEGP": 420000,
    "maxLevel": 6,
    "staffRoles": [
      "doctor",
      "nurse",
      "receptionist",
      "manager"
    ],
    "requiresDegree": "medicine",
    "desc": "A licensed outpatient clinic with your name over the door.",
    "from": 1960
  },
  {
    "id": "dental_clinic",
    "label": "Dental clinic",
    "startupEGP": 2200000,
    "monthlyOverheadEGP": 160000,
    "baseRevenueEGP": 380000,
    "maxLevel": 6,
    "staffRoles": [
      "dentist",
      "nurse",
      "receptionist",
      "manager"
    ],
    "requiresDegree": "dentistry",
    "desc": "Chairs, sterilisation and a waiting room that has to be paid for.",
    "from": 1960
  },
  {
    "id": "vet_clinic",
    "label": "Veterinary clinic",
    "startupEGP": 1400000,
    "monthlyOverheadEGP": 110000,
    "baseRevenueEGP": 240000,
    "maxLevel": 5,
    "staffRoles": [
      "vet",
      "technician",
      "receptionist",
      "manager"
    ],
    "requiresDegree": "veterinary",
    "desc": "Small-animal practice with an operating room.",
    "from": 1960
  },
  {
    "id": "physio_clinic",
    "label": "Physiotherapy clinic",
    "startupEGP": 1200000,
    "monthlyOverheadEGP": 95000,
    "baseRevenueEGP": 220000,
    "maxLevel": 5,
    "staffRoles": [
      "physio",
      "receptionist",
      "manager"
    ],
    "requiresDegree": "physiotherapy",
    "desc": "Treatment beds, equipment and referrals.",
    "from": 1975
  },
  {
    "id": "law_firm",
    "label": "Law firm",
    "startupEGP": 900000,
    "monthlyOverheadEGP": 115000,
    "baseRevenueEGP": 240000,
    "maxLevel": 6,
    "staffRoles": [
      "lawyer",
      "paralegal",
      "receptionist",
      "manager"
    ],
    "requiresDegree": "law",
    "desc": "Your name on the door, a case list and a filing room.",
    "from": 1960
  },
  {
    "id": "accounting_firm",
    "label": "Accounting firm",
    "startupEGP": 700000,
    "monthlyOverheadEGP": 60000,
    "baseRevenueEGP": 180000,
    "maxLevel": 6,
    "staffRoles": [
      "accountant",
      "receptionist",
      "manager"
    ],
    "requiresDegree": "business",
    "desc": "Audits, tax filings and the clients who call in March.",
    "from": 1960
  },
  {
    "id": "architecture_studio",
    "label": "Architecture studio",
    "startupEGP": 600000,
    "monthlyOverheadEGP": 55000,
    "baseRevenueEGP": 170000,
    "maxLevel": 6,
    "staffRoles": [
      "architect",
      "designer",
      "receptionist",
      "manager"
    ],
    "requiresDegree": "architecture",
    "desc": "Models, drawings and a practice of your own.",
    "from": 1960
  },
  {
    "id": "logistics",
    "label": "Logistics company",
    "startupEGP": 3000000,
    "monthlyOverheadEGP": 395000,
    "baseRevenueEGP": 600000,
    "maxLevel": 5,
    "staffRoles": [
      "driver",
      "manager",
      "dispatcher"
    ],
    "desc": "Delivery / transport business.",
    "from": 1960
  },
  {
    "id": "software_startup",
    "label": "Software startup",
    "startupEGP": 500000,
    "monthlyOverheadEGP": 100000,
    "baseRevenueEGP": 150000,
    "maxLevel": 8,
    "staffRoles": [
      "developer",
      "designer",
      "manager"
    ],
    "requiresDegree": "cs",
    "desc": "Tech startup. High risk, high reward.",
    "from": 1985
  },
  {
    "id": "realestate",
    "label": "Real estate agency",
    "startupEGP": 200000,
    "monthlyOverheadEGP": 40000,
    "baseRevenueEGP": 100000,
    "maxLevel": 5,
    "staffRoles": [
      "agent",
      "manager"
    ],
    "desc": "Buy/sell property on commission.",
    "from": 1960
  },
  {
    "id": "consulting",
    "label": "Consulting firm",
    "startupEGP": 200000,
    "monthlyOverheadEGP": 30000,
    "baseRevenueEGP": 120000,
    "maxLevel": 5,
    "staffRoles": [
      "consultant",
      "manager"
    ],
    "requiresDegree": "business",
    "desc": "Business consulting services.",
    "from": 1970
  },
  {
    "id": "bakery",
    "label": "Bakery",
    "startupEGP": 700000,
    "monthlyOverheadEGP": 86000,
    "baseRevenueEGP": 160000,
    "maxLevel": 5,
    "staffRoles": [
      "baker",
      "cashier",
      "manager",
      "cleaner"
    ],
    "desc": "Fresh bakery.",
    "from": 1960
  },
  {
    "id": "bookstore",
    "label": "Bookstore",
    "startupEGP": 400000,
    "monthlyOverheadEGP": 40500,
    "baseRevenueEGP": 90000,
    "maxLevel": 5,
    "staffRoles": [
      "cashier",
      "manager"
    ],
    "desc": "Bookstore with caf\u00e9 corner.",
    "from": 1960
  },
  {
    "id": "car_wash",
    "label": "Car wash / detailing",
    "startupEGP": 350000,
    "monthlyOverheadEGP": 30000,
    "baseRevenueEGP": 100000,
    "maxLevel": 5,
    "staffRoles": [
      "cleaner",
      "manager"
    ],
    "desc": "Car wash and detailing.",
    "from": 1970
  },
  {
    "id": "pet_grooming",
    "label": "Pet grooming",
    "startupEGP": 500000,
    "monthlyOverheadEGP": 45000,
    "baseRevenueEGP": 120000,
    "maxLevel": 5,
    "staffRoles": [
      "stylist",
      "manager",
      "cleaner"
    ],
    "desc": "Pet grooming and boarding.",
    "from": 1995
  },
  {
    "id": "academy",
    "label": "Educational academy",
    "startupEGP": 1200000,
    "monthlyOverheadEGP": 120000,
    "baseRevenueEGP": 280000,
    "maxLevel": 5,
    "staffRoles": [
      "teacher",
      "manager",
      "cleaner"
    ],
    "desc": "Large tutoring academy with staff.",
    "from": 1980
  },
  {
    "id": "gym_franchise",
    "label": "Gym franchise",
    "startupEGP": 5000000,
    "monthlyOverheadEGP": 600000,
    "baseRevenueEGP": 900000,
    "maxLevel": 6,
    "staffRoles": [
      "trainer",
      "manager",
      "cleaner",
      "receptionist"
    ],
    "desc": "Franchised gym chain.",
    "from": 1995
  },
  {
    "id": "fruit_stall",
    "label": "Fruit & vegetable stall",
    "startupEGP": 90000,
    "monthlyOverheadEGP": 15000,
    "baseRevenueEGP": 55000,
    "maxLevel": 4,
    "staffRoles": [
      "cashier",
      "cleaner"
    ],
    "desc": "A crate-and-awning stall on a busy corner.",
    "from": 1960
  },
  {
    "id": "textile_workshop",
    "label": "Textile workshop",
    "startupEGP": 600000,
    "monthlyOverheadEGP": 90000,
    "baseRevenueEGP": 170000,
    "maxLevel": 4,
    "staffRoles": [
      "weaver",
      "manager",
      "cleaner"
    ],
    "desc": "Looms, dyed cotton and a merchant who comes weekly.",
    "from": 1960,
    "until": 1998
  },
  {
    "id": "print_shop",
    "label": "Print & typesetting shop",
    "startupEGP": 450000,
    "monthlyOverheadEGP": 55000,
    "baseRevenueEGP": 130000,
    "maxLevel": 4,
    "staffRoles": [
      "typesetter",
      "manager",
      "cleaner"
    ],
    "desc": "Wedding invitations, shop signs and a newspaper's back pages.",
    "from": 1960,
    "until": 2005
  },
  {
    "id": "radio_repair",
    "label": "Radio & TV repair shop",
    "startupEGP": 200000,
    "monthlyOverheadEGP": 25000,
    "baseRevenueEGP": 75000,
    "maxLevel": 4,
    "staffRoles": [
      "technician",
      "manager"
    ],
    "desc": "Valve sets, aerials and a shelf of spare condensers.",
    "from": 1960,
    "to": 1995,
    "until": 2008
  },
  {
    "id": "photo_studio",
    "label": "Portrait photo studio",
    "startupEGP": 300000,
    "monthlyOverheadEGP": 35000,
    "baseRevenueEGP": 95000,
    "maxLevel": 4,
    "staffRoles": [
      "photographer",
      "manager"
    ],
    "desc": "Formal portraits, ID photos and wedding albums.",
    "from": 1960,
    "until": 2010
  },
  {
    "id": "travel_agency",
    "label": "Travel agency",
    "startupEGP": 350000,
    "monthlyOverheadEGP": 45000,
    "baseRevenueEGP": 110000,
    "maxLevel": 5,
    "staffRoles": [
      "agent",
      "manager"
    ],
    "desc": "Tickets, visas and package tours booked by telephone.",
    "from": 1965
  },
  {
    "id": "video_rental",
    "label": "Video rental shop",
    "startupEGP": 400000,
    "monthlyOverheadEGP": 40000,
    "baseRevenueEGP": 120000,
    "maxLevel": 4,
    "staffRoles": [
      "cashier",
      "manager"
    ],
    "desc": "VHS shelves, a late-fee board and bootleg copies.",
    "from": 1985,
    "to": 2010,
    "until": 2012
  },
  {
    "id": "cyber_cafe",
    "label": "Internet caf\u00e9",
    "startupEGP": 500000,
    "monthlyOverheadEGP": 60000,
    "baseRevenueEGP": 140000,
    "maxLevel": 4,
    "staffRoles": [
      "technician",
      "cashier",
      "manager"
    ],
    "desc": "Dial-up hours sold by the minute, plus counter-strike.",
    "from": 1998,
    "to": 2015,
    "until": 2016
  },
  {
    "id": "mobile_shop",
    "label": "Mobile phone & accessories shop",
    "startupEGP": 700000,
    "monthlyOverheadEGP": 112000,
    "baseRevenueEGP": 190000,
    "maxLevel": 5,
    "staffRoles": [
      "cashier",
      "technician",
      "manager"
    ],
    "desc": "Handsets, recharge cards and cracked-screen repairs.",
    "from": 2002
  }
];
export const V1_CASH_JOBS = [
  {
    "id": "dishwasher",
    "label": "Restaurant dishwasher",
    "dailyRateUSD": 15,
    "riskLevel": 1,
    "desc": "Steady cash under the table."
  },
  {
    "id": "cleaning",
    "label": "Cleaning crew (night)",
    "dailyRateUSD": 20,
    "riskLevel": 1,
    "desc": "Hotel and office cleaning."
  },
  {
    "id": "farm",
    "label": "Farm seasonal work",
    "dailyRateUSD": 18,
    "riskLevel": 1,
    "desc": "Picking fruit and vegetables."
  },
  {
    "id": "nanny",
    "label": "Cash Nanny / Au Pair",
    "dailyRateUSD": 22,
    "riskLevel": 1,
    "desc": "Live-in or daily childcare.",
    "reqSocial": 40
  },
  {
    "id": "carwash",
    "label": "Car wash",
    "dailyRateUSD": 12,
    "riskLevel": 0,
    "desc": "Underpaid but honest."
  },
  {
    "id": "sweatshop",
    "label": "Garment Sweatshop",
    "dailyRateUSD": 10,
    "riskLevel": 2,
    "desc": "Long hours, terrible conditions, low pay."
  },
  {
    "id": "delivery",
    "label": "Delivery rider (cash)",
    "dailyRateUSD": 22,
    "riskLevel": 2,
    "desc": "Bike or moped delivery for cash."
  },
  {
    "id": "construction",
    "label": "Construction laborer",
    "dailyRateUSD": 25,
    "riskLevel": 3,
    "requiresPhysical": true,
    "desc": "Backbreaking work, no questions asked."
  },
  {
    "id": "moving",
    "label": "Moving crew",
    "dailyRateUSD": 26,
    "riskLevel": 2,
    "requiresPhysical": true,
    "desc": "Lifting heavy boxes for cash."
  },
  {
    "id": "unlicensed_taxi",
    "label": "Unlicensed Gypsy Cab",
    "dailyRateUSD": 28,
    "riskLevel": 3,
    "desc": "Driving passengers off the grid."
  },
  {
    "id": "mechanic",
    "label": "Mechanic helper",
    "dailyRateUSD": 22,
    "riskLevel": 2,
    "requiresPhysical": true,
    "desc": "Oil changes, tire swaps."
  },
  {
    "id": "street_vendor",
    "label": "Street vendor",
    "dailyRateUSD": 20,
    "riskLevel": 3,
    "desc": "Sell trinkets to tourists."
  },
  {
    "id": "nightshift",
    "label": "Night shift factory work",
    "dailyRateUSD": 28,
    "riskLevel": 4,
    "requiresPhysical": true,
    "desc": "Heavy machines, no safety net."
  },
  {
    "id": "card_dealer",
    "label": "Underground Casino Dealer",
    "dailyRateUSD": 45,
    "riskLevel": 5,
    "desc": "High pay, high risk of raids & violence.",
    "reqSmarts": 50
  }
];
export const V1_SCHOLARSHIPS = [
  {
    "id": "fulbright",
    "name": "Fulbright Foreign Student Program",
    "country": "usa",
    "coverage": "full",
    "requiresGPA": 3.5,
    "requiresIELTS": 7,
    "acceptanceRate": 0.08,
    "desc": "Full tuition + stipend for US study. J-1 Visa (Must return home 2 yrs)."
  },
  {
    "id": "chevening",
    "name": "Chevening Scholarship (UK)",
    "country": "gbr",
    "coverage": "full",
    "requiresGPA": 3.5,
    "requiresIELTS": 7,
    "requiresWork": 2,
    "acceptanceRate": 0.05,
    "desc": "UK government scholarship. Full funding; recipients are generally expected to return home for two years."
  },
  {
    "id": "daad",
    "name": "DAAD Scholarship (Germany)",
    "country": "deu",
    "coverage": "full",
    "requiresGPA": 3.3,
    "requiresGerman": 3,
    "acceptanceRate": 0.15,
    "desc": "German academic exchange. Full funding + Monthly Stipend."
  },
  {
    "id": "erasmus",
    "name": "Erasmus Mundus (EU)",
    "country": "eu",
    "coverage": "full",
    "requiresGPA": 3.5,
    "requiresIELTS": 7,
    "acceptanceRate": 0.1,
    "desc": "EU multi-country master program. Very prestigious."
  },
  {
    "id": "mext",
    "name": "MEXT (Japan)",
    "country": "jpn",
    "coverage": "full",
    "requiresGPA": 3.5,
    "acceptanceRate": 0.12,
    "desc": "Japanese government scholarship. Includes 1 yr language prep."
  },
  {
    "id": "gates",
    "name": "Gates Cambridge Scholarship",
    "country": "gbr",
    "coverage": "full",
    "requiresGPA": 3.8,
    "acceptanceRate": 0.02,
    "desc": "Full Cambridge funding. Extremely selective."
  },
  {
    "id": "rhodes",
    "name": "Rhodes Scholarship (Oxford)",
    "country": "gbr",
    "coverage": "full",
    "requiresGPA": 3.8,
    "requiresLeadership": true,
    "acceptanceRate": 0.03,
    "desc": "Oxford full scholarship with leadership focus."
  },
  {
    "id": "eiffel",
    "name": "Eiffel Excellence (France)",
    "country": "fra",
    "coverage": "full",
    "requiresGPA": 3.5,
    "requiresFrench": 3,
    "acceptanceRate": 0.1,
    "desc": "French Gov scholarship for Masters/PhD."
  },
  {
    "id": "vanier",
    "name": "Vanier Canada Graduate",
    "country": "can",
    "coverage": "full",
    "requiresGPA": 3.5,
    "acceptanceRate": 0.1,
    "desc": "Canadian doctoral scholarship."
  },
  {
    "id": "sawiris",
    "name": "Sawiris Foundation Scholarship",
    "country": "egy",
    "coverage": "full",
    "requiresGPA": 3.7,
    "reqUni": "auc",
    "acceptanceRate": 0.05,
    "desc": "Full ride to AUC/UChicago for outstanding Egyptian students."
  }
];
export const PROFESSIONAL_LICENSES = [
  {
    "id": "lic_egy_syndicate_med",
    "label": "Egyptian Medical Syndicate + Takleef License",
    "country": "egy",
    "reqDegree": "medicine",
    "feeUsd": 60,
    "minSmarts": 55,
    "passBase": 0.96,
    "unlocksTrack": "medicine"
  },
  {
    "id": "lic_uk_plab",
    "label": "UK PLAB 1 & 2 / UKMLA + GMC Registration",
    "country": "gbr",
    "reqDegree": "medicine",
    "feeUsd": 1950,
    "minSmarts": 72,
    "passBase": 0.68,
    "exemptsUaeDha": true,
    "desc": "Required for IMG doctors practicing in NHS UK; also grants Tier-1 exemption for UAE DHA!"
  },
  {
    "id": "lic_us_usmle",
    "label": "USMLE Step 1 & Step 2 CK (ECFMG Certified)",
    "country": "usa",
    "reqDegree": "medicine",
    "feeUsd": 2650,
    "minSmarts": 78,
    "passBase": 0.58,
    "exemptsUaeDha": true,
    "desc": "Gold-standard US medical board certification for residency & top global hospitals."
  },
  {
    "id": "lic_deu_approbation",
    "label": "German Fachsprachpr\u00fcfung (C1) + Approbation",
    "country": "deu",
    "reqDegree": "medicine",
    "feeUsd": 1100,
    "minSmarts": 70,
    "passBase": 0.64,
    "reqLang": "German B2",
    "desc": "Full German medical license issued at Bundesland level."
  },
  {
    "id": "lic_sau_scfhs",
    "label": "Saudi SCFHS SMLE Prometric + DataFlow PSV",
    "country": "sau",
    "reqDegree": "medicine",
    "feeUsd": 680,
    "minSmarts": 66,
    "passBase": 0.74,
    "desc": "Mandatory Mumaris Plus classification for doctors in Saudi Arabia."
  },
  {
    "id": "lic_uae_dha",
    "label": "UAE DHA / DOH Sheryan Medical License",
    "country": "uae",
    "reqDegree": "medicine",
    "feeUsd": 620,
    "minSmarts": 66,
    "passBase": 0.76,
    "desc": "Mandatory license for Dubai & Abu Dhabi hospitals (auto-passed if holding GMC/USMLE!)."
  },
  {
    "id": "lic_sau_sce",
    "label": "Saudi Council of Engineers (SCE) Accreditation",
    "country": "sau",
    "reqDegree": "engineering",
    "feeUsd": 280,
    "minSmarts": 60,
    "passBase": 0.88,
    "desc": "Required for Engineering Iqama issuance & renewal in Saudi Arabia."
  },
  {
    "id": "lic_pe_chartered",
    "label": "Chartered / Professional Engineer (PE / CEng)",
    "country": "gbr",
    "reqDegree": "engineering",
    "feeUsd": 550,
    "minSmarts": 72,
    "passBase": 0.72,
    "desc": "+18% engineering pay & global visa boost."
  },
  {
    "id": "lic_cfa_cpa",
    "label": "CFA Charter / CPA Public Accounting License",
    "country": "usa",
    "reqDegree": "business",
    "feeUsd": 1400,
    "minSmarts": 74,
    "passBase": 0.62,
    "desc": "+22% finance & banking compensation."
  },
  {
    "id": "lic_bar_exam",
    "label": "National Bar Admission / Legal Practice Roll",
    "country": "local",
    "reqDegree": "law",
    "feeUsd": 650,
    "minSmarts": 70,
    "passBase": 0.7,
    "desc": "Required to practice as senior legal counsel or partner."
  }
];
export const LANGUAGE_EXAMS = [
  {
    "id": "ielts_academic",
    "label": "IELTS Academic / UKVI",
    "lang": "English (C1)",
    "feeUsd": 245,
    "validityYears": 2,
    "minSmartsForBand7": 68
  },
  {
    "id": "toefl_ibt",
    "label": "TOEFL iBT",
    "lang": "English (C1)",
    "feeUsd": 235,
    "validityYears": 2,
    "minSmartsForBand7": 68
  },
  {
    "id": "goethe_b2",
    "label": "Goethe-Zertifikat B2 / TestDaF",
    "lang": "German B2",
    "feeUsd": 260,
    "validityYears": 99,
    "minSmartsForBand7": 70
  },
  {
    "id": "tcf_canada",
    "label": "TCF / TEF French Proficiency (Boosts Canada CRS!)",
    "lang": "French B2",
    "feeUsd": 280,
    "validityYears": 2,
    "minSmartsForBand7": 72
  },
  {
    "id": "jlpt_n2",
    "label": "JLPT N2 Japanese Business Proficiency",
    "lang": "Japanese N2",
    "feeUsd": 120,
    "validityYears": 99,
    "minSmartsForBand7": 74
  }
];

export const V1_MED_TESTS = [
  {
    "id": "bp_check",
    "label": "Blood Pressure Check",
    "costEGP": 100,
    "waitMonths": 0,
    "detects": [
      "hypertension"
    ]
  },
  {
    "id": "cbc",
    "label": "Complete Blood Count",
    "costEGP": 200,
    "waitMonths": 1,
    "detects": [
      "pneumonia",
      "leukemia"
    ]
  },
  {
    "id": "glucose",
    "label": "Blood Glucose",
    "costEGP": 100,
    "waitMonths": 1,
    "detects": [
      "type2_diabetes",
      "type1_diabetes"
    ]
  },
  {
    "id": "hba1c",
    "label": "HbA1c (3-mo sugar)",
    "costEGP": 250,
    "waitMonths": 1,
    "detects": [
      "type2_diabetes",
      "type1_diabetes"
    ]
  },
  {
    "id": "lipid",
    "label": "Lipid Profile",
    "costEGP": 300,
    "waitMonths": 1,
    "detects": [
      "high_cholesterol"
    ]
  },
  {
    "id": "thyroid",
    "label": "Thyroid Panel (TSH, T3, T4)",
    "costEGP": 350,
    "waitMonths": 1,
    "detects": [
      "hypothyroid"
    ]
  },
  {
    "id": "liver",
    "label": "Liver Function",
    "costEGP": 300,
    "waitMonths": 1,
    "detects": [
      "hepatitis_b"
    ]
  },
  {
    "id": "kidney",
    "label": "Kidney Function",
    "costEGP": 300,
    "waitMonths": 1,
    "detects": [
      "ckd"
    ]
  },
  {
    "id": "esr",
    "label": "ESR (inflammation)",
    "costEGP": 200,
    "waitMonths": 1,
    "detects": [
      "arthritis"
    ]
  },
  {
    "id": "h_pylori",
    "label": "H. pylori Test",
    "costEGP": 350,
    "waitMonths": 1,
    "detects": [
      "ulcer"
    ]
  },
  {
    "id": "ecg",
    "label": "ECG / EKG",
    "costEGP": 250,
    "waitMonths": 0,
    "detects": [
      "hypertension",
      "heart_disease",
      "arrhythmia"
    ]
  },
  {
    "id": "echo",
    "label": "Echocardiogram",
    "costEGP": 1800,
    "waitMonths": 1,
    "detects": [
      "heart_disease",
      "congenital_heart"
    ]
  },
  {
    "id": "stress",
    "label": "Stress Test",
    "costEGP": 2200,
    "waitMonths": 1,
    "detects": [
      "heart_disease"
    ]
  },
  {
    "id": "holter",
    "label": "Holter Monitor (24h)",
    "costEGP": 1500,
    "waitMonths": 1,
    "detects": [
      "arrhythmia"
    ]
  },
  {
    "id": "xray_chest",
    "label": "Chest X-ray",
    "costEGP": 400,
    "waitMonths": 1,
    "detects": [
      "pneumonia",
      "lung_cancer"
    ]
  },
  {
    "id": "xray_bone",
    "label": "Bone X-ray",
    "costEGP": 400,
    "waitMonths": 1,
    "detects": [
      "fracture",
      "osteoporosis"
    ]
  },
  {
    "id": "ct_chest",
    "label": "CT Scan (Chest)",
    "costEGP": 2800,
    "waitMonths": 1,
    "detects": [
      "lung_cancer"
    ]
  },
  {
    "id": "ct_brain",
    "label": "CT Scan (Brain)",
    "costEGP": 3000,
    "waitMonths": 1,
    "detects": [
      "head_injury",
      "stroke_recovery"
    ]
  },
  {
    "id": "ct_abdomen",
    "label": "CT Scan (Abdomen)",
    "costEGP": 2800,
    "waitMonths": 1,
    "detects": [
      "kidney_stones"
    ]
  },
  {
    "id": "mri_brain",
    "label": "MRI (Brain)",
    "costEGP": 4500,
    "waitMonths": 2,
    "detects": [
      "epilepsy",
      "stroke_recovery"
    ]
  },
  {
    "id": "ultrasound_abdomen",
    "label": "Abdominal Ultrasound",
    "costEGP": 800,
    "waitMonths": 1,
    "detects": [
      "gallstones",
      "kidney_stones"
    ]
  },
  {
    "id": "ultrasound_pelvic",
    "label": "Pelvic Ultrasound",
    "costEGP": 900,
    "waitMonths": 1,
    "detects": [
      "pcos",
      "fert_endometriosis"
    ],
    "forGender": "f"
  },
  {
    "id": "endoscopy",
    "label": "Endoscopy",
    "costEGP": 2800,
    "waitMonths": 1,
    "detects": [
      "gerd",
      "ulcer"
    ]
  },
  {
    "id": "colonoscopy",
    "label": "Colonoscopy",
    "costEGP": 3800,
    "waitMonths": 2,
    "detects": [
      "colon_cancer",
      "ibs"
    ]
  },
  {
    "id": "biopsy",
    "label": "Tissue Biopsy",
    "costEGP": 2200,
    "waitMonths": 1,
    "detects": [
      "breast_cancer",
      "lung_cancer",
      "colon_cancer"
    ]
  },
  {
    "id": "mammogram",
    "label": "Mammogram",
    "costEGP": 1200,
    "waitMonths": 1,
    "detects": [
      "breast_cancer"
    ],
    "forGender": "f",
    "minAge": 40
  },
  {
    "id": "pap_smear",
    "label": "Pap Smear",
    "costEGP": 500,
    "waitMonths": 1,
    "detects": [
      "cervical_cancer"
    ],
    "forGender": "f",
    "minAge": 21
  },
  {
    "id": "dexa",
    "label": "Bone Density (DEXA)",
    "costEGP": 1500,
    "waitMonths": 1,
    "detects": [
      "osteoporosis"
    ]
  },
  {
    "id": "eye_exam",
    "label": "Eye Exam",
    "costEGP": 500,
    "waitMonths": 0,
    "detects": [
      "cataract",
      "glaucoma"
    ]
  },
  {
    "id": "spirometry",
    "label": "Spirometry (lungs)",
    "costEGP": 900,
    "waitMonths": 0,
    "detects": [
      "asthma",
      "copd"
    ]
  },
  {
    "id": "eeg",
    "label": "EEG (brain waves)",
    "costEGP": 2500,
    "waitMonths": 2,
    "detects": [
      "epilepsy"
    ]
  },
  {
    "id": "bone_marrow",
    "label": "Bone Marrow Biopsy",
    "costEGP": 5000,
    "waitMonths": 2,
    "detects": [
      "leukemia"
    ]
  },
  {
    "id": "semen_analysis",
    "label": "Semen Analysis",
    "costEGP": 500,
    "waitMonths": 1,
    "detects": [
      "fert_male_low_sperm"
    ],
    "forGender": "m"
  },
  {
    "id": "hsg",
    "label": "HSG (tube scan)",
    "costEGP": 1800,
    "waitMonths": 1,
    "detects": [
      "fert_female_tubes"
    ],
    "forGender": "f"
  },
  {
    "id": "hormones",
    "label": "Hormone Panel",
    "costEGP": 900,
    "waitMonths": 1,
    "detects": [
      "pcos",
      "fert_endometriosis"
    ]
  },
  {
    "id": "laparoscopy",
    "label": "Diagnostic Laparoscopy",
    "costEGP": 6500,
    "waitMonths": 2,
    "detects": [
      "fert_endometriosis"
    ],
    "forGender": "f"
  }
];
export const V1_MED_MEDICATIONS = [
  {
    "id": "panadol",
    "label": "Panadol (paracetamol)",
    "monthlyEGP": 60,
    "treats": [
      "migraine",
      "fracture"
    ],
    "effect": "mild"
  },
  {
    "id": "cataflam",
    "label": "Cataflam (diclofenac)",
    "monthlyEGP": 120,
    "treats": [
      "arthritis",
      "migraine",
      "fracture"
    ],
    "effect": "mild"
  },
  {
    "id": "augmentin",
    "label": "Augmentin (amoxicillin)",
    "monthlyEGP": 280,
    "treats": [
      "pneumonia",
      "ulcer"
    ],
    "effect": "mild"
  },
  {
    "id": "zitromax",
    "label": "Zitromax (azithromycin)",
    "monthlyEGP": 220,
    "treats": [
      "pneumonia"
    ],
    "effect": "mild"
  },
  {
    "id": "concor",
    "label": "Concor (bisoprolol)",
    "monthlyEGP": 180,
    "treats": [
      "hypertension",
      "heart_disease",
      "arrhythmia",
      "congenital_heart"
    ],
    "effect": "moderate"
  },
  {
    "id": "co_diovan",
    "label": "Co-Diovan (valsartan)",
    "monthlyEGP": 260,
    "treats": [
      "hypertension",
      "ckd"
    ],
    "effect": "moderate"
  },
  {
    "id": "crestor",
    "label": "Crestor (rosuvastatin)",
    "monthlyEGP": 340,
    "treats": [
      "high_cholesterol",
      "heart_disease",
      "heart_attack",
      "stroke_recovery"
    ],
    "effect": "moderate"
  },
  {
    "id": "atorvastatin",
    "label": "Atorvastatin (generic)",
    "monthlyEGP": 180,
    "treats": [
      "high_cholesterol"
    ],
    "effect": "mild"
  },
  {
    "id": "plavix",
    "label": "Plavix (clopidogrel)",
    "monthlyEGP": 380,
    "treats": [
      "heart_disease",
      "heart_attack",
      "stroke_recovery"
    ],
    "effect": "moderate"
  },
  {
    "id": "glucophage",
    "label": "Glucophage (metformin)",
    "monthlyEGP": 100,
    "treats": [
      "type2_diabetes",
      "pcos"
    ],
    "effect": "moderate"
  },
  {
    "id": "januvia",
    "label": "Januvia (sitagliptin)",
    "monthlyEGP": 620,
    "treats": [
      "type2_diabetes"
    ],
    "effect": "strong"
  },
  {
    "id": "lantus",
    "label": "Lantus (long insulin)",
    "monthlyEGP": 480,
    "treats": [
      "type1_diabetes"
    ],
    "effect": "strong"
  },
  {
    "id": "novorapid",
    "label": "NovoRapid (fast insulin)",
    "monthlyEGP": 420,
    "treats": [
      "type1_diabetes"
    ],
    "effect": "strong"
  },
  {
    "id": "eltroxin",
    "label": "Eltroxin (levothyroxine)",
    "monthlyEGP": 80,
    "treats": [
      "hypothyroid"
    ],
    "effect": "moderate"
  },
  {
    "id": "euthyrox",
    "label": "Euthyrox (levothyroxine)",
    "monthlyEGP": 90,
    "treats": [
      "hypothyroid"
    ],
    "effect": "moderate"
  },
  {
    "id": "zoloft",
    "label": "Zoloft (sertraline)",
    "monthlyEGP": 320,
    "treats": [
      "depression",
      "anxiety",
      "severe_depression"
    ],
    "effect": "slow"
  },
  {
    "id": "prozac",
    "label": "Prozac (fluoxetine)",
    "monthlyEGP": 280,
    "treats": [
      "depression",
      "severe_depression"
    ],
    "effect": "slow"
  },
  {
    "id": "xanax",
    "label": "Xanax (alprazolam)",
    "monthlyEGP": 240,
    "treats": [
      "anxiety",
      "panic_disorder"
    ],
    "effect": "fast",
    "addictive": true
  },
  {
    "id": "depakene",
    "label": "Depakene (sodium valproate)",
    "monthlyEGP": 180,
    "treats": [
      "epilepsy",
      "bipolar"
    ],
    "effect": "moderate"
  },
  {
    "id": "baraclude",
    "label": "Baraclude (entecavir)",
    "monthlyEGP": 900,
    "treats": [
      "hepatitis_b"
    ],
    "effect": "strong"
  },
  {
    "id": "nexium",
    "label": "Nexium (esomeprazole)",
    "monthlyEGP": 260,
    "treats": [
      "gerd",
      "ulcer",
      "ibs"
    ],
    "effect": "moderate"
  },
  {
    "id": "ventolin",
    "label": "Ventolin (salbutamol)",
    "monthlyEGP": 200,
    "treats": [
      "asthma",
      "copd"
    ],
    "effect": "moderate"
  },
  {
    "id": "neurobion",
    "label": "Neurobion (B vitamins)",
    "monthlyEGP": 120,
    "treats": [
      "stroke_recovery"
    ],
    "effect": "mild"
  },
  {
    "id": "vitamin_d",
    "label": "Vitamin D 50000 IU",
    "monthlyEGP": 90,
    "treats": [
      "osteoporosis"
    ],
    "effect": "mild"
  },
  {
    "id": "calcium",
    "label": "Calcium + D3",
    "monthlyEGP": 80,
    "treats": [
      "osteoporosis"
    ],
    "effect": "mild"
  },
  {
    "id": "tamoxifen",
    "label": "Tamoxifen (breast cancer)",
    "monthlyEGP": 800,
    "treats": [
      "breast_cancer"
    ],
    "effect": "strong"
  },
  {
    "id": "imatinib",
    "label": "Imatinib (leukemia)",
    "monthlyEGP": 6500,
    "treats": [
      "leukemia"
    ],
    "effect": "strong"
  },
  {
    "id": "clomid",
    "label": "Clomid (clomiphene)",
    "monthlyEGP": 480,
    "treats": [
      "pcos"
    ],
    "effect": "fertility"
  },
  {
    "id": "timoptic",
    "label": "Timoptic (timolol eye drops)",
    "monthlyEGP": 190,
    "treats": [
      "glaucoma"
    ],
    "effect": "moderate"
  },
  {
    "id": "derovate",
    "label": "Derovate (clobetasol cream)",
    "monthlyEGP": 140,
    "treats": [
      "psoriasis",
      "eczema"
    ],
    "effect": "moderate"
  }
];
export const ALL_SURGERIES = [
  {
    "id": "appendectomy",
    "label": "Appendectomy",
    "baseCostEGP": 25000,
    "recoveryMonths": 1,
    "cures": [
      "appendicitis"
    ]
  },
  {
    "id": "gallbladder",
    "label": "Gallbladder Removal",
    "baseCostEGP": 35000,
    "recoveryMonths": 2,
    "cures": [
      "gallstones"
    ]
  },
  {
    "id": "hernia_repair",
    "label": "Hernia Repair",
    "baseCostEGP": 20000,
    "recoveryMonths": 1,
    "cures": [
      "hernia"
    ]
  },
  {
    "id": "cabg",
    "label": "Coronary Bypass (CABG)",
    "baseCostEGP": 250000,
    "recoveryMonths": 6,
    "cures": [
      "heart_disease",
      "congenital_heart",
      "heart_attack"
    ],
    "partial": true
  },
  {
    "id": "angioplasty",
    "label": "Angioplasty + Stent",
    "baseCostEGP": 120000,
    "recoveryMonths": 3,
    "cures": [
      "heart_disease",
      "heart_attack"
    ],
    "partial": true
  },
  {
    "id": "pacemaker",
    "label": "Pacemaker Implant",
    "baseCostEGP": 180000,
    "recoveryMonths": 3,
    "cures": [
      "arrhythmia"
    ],
    "partial": true
  },
  {
    "id": "tumor_removal",
    "label": "Tumor Removal",
    "baseCostEGP": 150000,
    "recoveryMonths": 4,
    "cures": [
      "colon_cancer",
      "lung_cancer",
      "cervical_cancer"
    ],
    "partial": true
  },
  {
    "id": "mastectomy",
    "label": "Mastectomy",
    "baseCostEGP": 80000,
    "recoveryMonths": 4,
    "cures": [
      "breast_cancer"
    ],
    "partial": true
  },
  {
    "id": "kidney_stone",
    "label": "Kidney Stone Removal",
    "baseCostEGP": 28000,
    "recoveryMonths": 1,
    "cures": [
      "kidney_stones"
    ]
  },
  {
    "id": "fracture_repair",
    "label": "Fracture Repair",
    "baseCostEGP": 18000,
    "recoveryMonths": 2,
    "cures": [
      "fracture"
    ]
  },
  {
    "id": "cataract",
    "label": "Cataract Surgery",
    "baseCostEGP": 18000,
    "recoveryMonths": 1,
    "cures": [
      "cataract"
    ]
  },
  {
    "id": "ovarian_drill",
    "label": "Ovarian Drilling (PCOS)",
    "baseCostEGP": 45000,
    "recoveryMonths": 2,
    "cures": [
      "pcos"
    ]
  },
  {
    "id": "varicocele",
    "label": "Varicocele Repair",
    "baseCostEGP": 30000,
    "recoveryMonths": 2,
    "cures": [
      "fert_male_low_sperm"
    ]
  },
  {
    "id": "tube_surgery",
    "label": "Fallopian Tube Surgery",
    "baseCostEGP": 55000,
    "recoveryMonths": 2,
    "cures": [
      "fert_female_tubes"
    ]
  },
  {
    "id": "endo_surgery",
    "label": "Endometriosis Excision",
    "baseCostEGP": 60000,
    "recoveryMonths": 2,
    "cures": [
      "fert_endometriosis"
    ]
  },
  {
    "id": "lasik",
    "label": "LASIK Eye Surgery",
    "baseCostEGP": 25000,
    "recoveryMonths": 0.5,
    "cures": [
      "myopia"
    ]
  },
  {
    "id": "rhinoplasty",
    "label": "Rhinoplasty (nose)",
    "baseCostEGP": 55000,
    "recoveryMonths": 1,
    "cures": [],
    "cosmetic": true
  },
  {
    "id": "breast_aug",
    "label": "Breast Augmentation",
    "baseCostEGP": 85000,
    "recoveryMonths": 1,
    "cures": [],
    "cosmetic": true
  },
  {
    "id": "lasik_eye",
    "label": "LASIK / Femto-SMILE Laser Vision Correction",
    "baseCostEGP": 28000,
    "recoveryMonths": 0,
    "cures": [
      "myopia"
    ],
    "looksBoost": 2
  },
  {
    "id": "cataract_phaco",
    "label": "Phaco Cataract Lens Implant",
    "baseCostEGP": 32000,
    "recoveryMonths": 1,
    "cures": [
      "cataract"
    ]
  },
  {
    "id": "cholecystectomy",
    "label": "Laparoscopic Gallbladder Removal",
    "baseCostEGP": 42000,
    "recoveryMonths": 1,
    "cures": [
      "gallstones"
    ]
  },
  {
    "id": "lithotripsy",
    "label": "Shockwave Kidney Stone Lithotripsy",
    "baseCostEGP": 26000,
    "recoveryMonths": 0,
    "cures": [
      "kidney_stones"
    ]
  },
  {
    "id": "hernia_mesh",
    "label": "Laparoscopic Hernia Mesh Repair",
    "baseCostEGP": 38000,
    "recoveryMonths": 1,
    "cures": [
      "hernia"
    ]
  },
  {
    "id": "bariatric_sleeve",
    "label": "Gastric Sleeve Metabolic Surgery",
    "baseCostEGP": 95000,
    "recoveryMonths": 1,
    "cures": [
      "type2_diabetes"
    ],
    "partial": true,
    "healthBoost": 8
  },
  {
    "id": "hair_transplant",
    "label": "Follicular Hair Transplant",
    "baseCostEGP": 55000,
    "recoveryMonths": 1,
    "cures": [],
    "looksBoost": 7
  },
  {
    "id": "dental_veneers",
    "label": "Full Ceramic Dental Reconstruction",
    "baseCostEGP": 65000,
    "recoveryMonths": 0,
    "cures": [],
    "looksBoost": 6
  },
  {
    "id": "rhinoplasty",
    "label": "Septo-Rhinoplasty",
    "baseCostEGP": 75000,
    "recoveryMonths": 1,
    "cures": [],
    "looksBoost": 8
  },
  {
    "id": "ivf_icsi_cycle",
    "label": "Advanced ICSI + PGT Genetic IVF Cycle",
    "baseCostEGP": 115000,
    "recoveryMonths": 1,
    "cures": [
      "fert_male_low_sperm",
      "fert_female_tubes",
      "pcos"
    ]
  }
];
export const V1_FERTILITY_TREATMENTS = [
  {
    "id": "fert_consult",
    "label": "Fertility Consultation",
    "costEGP": 1500,
    "successPct": 0,
    "treatsIssues": [],
    "desc": "Initial assessment."
  },
  {
    "id": "iui_cycle",
    "label": "IUI Cycle",
    "costEGP": 8000,
    "successPct": 0.15,
    "treatsIssues": [
      "sperm",
      "age",
      "PCOS"
    ],
    "desc": "Washed sperm placed in uterus."
  },
  {
    "id": "ivf_cycle",
    "label": "IVF Cycle",
    "costEGP": 90000,
    "successPct": 0.35,
    "treatsIssues": [
      "sperm",
      "age",
      "PCOS",
      "tubes"
    ],
    "desc": "Eggs fertilized outside, implanted."
  },
  {
    "id": "icsi_cycle",
    "label": "ICSI Cycle (advanced IVF)",
    "costEGP": 140000,
    "successPct": 0.45,
    "treatsIssues": [
      "sperm",
      "age"
    ],
    "desc": "Direct sperm injection. Best for male factor."
  },
  {
    "id": "clomid_course",
    "label": "Ovulation Induction (Clomid)",
    "costEGP": 6000,
    "successPct": 0.2,
    "treatsIssues": [
      "PCOS"
    ],
    "desc": "Stimulates egg release. For PCOS."
  }
];
export const V1_HEALTH_INSURANCE = [
  {
    "label": "Uninsured (pay all)",
    "country": "egy",
    "premiumAnnualEGP": 0,
    "coveragePct": 0,
    "capEGP": 0,
    "minJobTier": null,
    "desc": "You pay every bill out of pocket.",
    "id": "none",
    "kind": "insurance-plan"
  },
  {
    "label": "Government Health Insurance",
    "country": "egy",
    "premiumAnnualEGP": 1200,
    "coveragePct": 0.4,
    "capEGP": 50000,
    "minJobTier": null,
    "stateSchemeCountries": [
      "egy",
      "gbr"
    ],
    "desc": "Cheap. Very limited coverage. Residents of countries that run a state scheme fall back on it when employer cover ends.",
    "id": "public_govt",
    "kind": "insurance-plan"
  },
  {
    "label": "Employer Basic Plan",
    "country": "egy",
    "premiumAnnualEGP": 0,
    "coveragePct": 0.55,
    "capEGP": 150000,
    "minJobTier": "any",
    "desc": "Free with a job. Partial coverage.",
    "id": "employer_basic",
    "kind": "insurance-plan"
  },
  {
    "label": "Employer Premium Plan",
    "country": "egy",
    "premiumAnnualEGP": 0,
    "coveragePct": 0.8,
    "capEGP": 600000,
    "minJobTier": "mid",
    "desc": "Free with a good job. Strong coverage.",
    "id": "employer_premium",
    "kind": "insurance-plan"
  },
  {
    "label": "Private Basic",
    "country": "egy",
    "premiumAnnualEGP": 6000,
    "coveragePct": 0.6,
    "capEGP": 200000,
    "minJobTier": null,
    "desc": "Self-bought. Moderate coverage.",
    "id": "private_basic",
    "kind": "insurance-plan"
  },
  {
    "label": "Private Standard",
    "country": "egy",
    "premiumAnnualEGP": 18000,
    "coveragePct": 0.8,
    "capEGP": 800000,
    "minJobTier": null,
    "desc": "Good coverage for families.",
    "id": "private_std",
    "kind": "insurance-plan"
  },
  {
    "label": "Private Premium",
    "country": "egy",
    "premiumAnnualEGP": 45000,
    "coveragePct": 0.9,
    "capEGP": 3000000,
    "minJobTier": null,
    "desc": "Top private coverage.",
    "id": "private_prem",
    "kind": "insurance-plan"
  },
  {
    "label": "International Elite",
    "country": "egy",
    "premiumAnnualEGP": 120000,
    "coveragePct": 0.95,
    "capEGP": null,
    "minJobTier": null,
    "desc": "Global coverage, unlimited cap.",
    "id": "international",
    "kind": "insurance-plan"
  },
  {
    "id": "gulf_employer",
    "label": "Gulf Employer Health Cover",
    "country": "sau",
    "premiumAnnualEGP": 0,
    "coveragePct": 0.85,
    "capEGP": 1000000,
    "minJobTier": "any",
    "desc": "Your Gulf employer pays. Good hospitals, but it ends the month your sponsorship ends.",
    "kind": "insurance-plan"
  },
  {
    "id": "us_employer_ppo",
    "label": "US Employer PPO",
    "country": "usa",
    "premiumAnnualEGP": 0,
    "coveragePct": 0.85,
    "capEGP": 5000000,
    "minJobTier": "any",
    "desc": "A good American job\u2019s plan. Strong coverage, but a hospital stay can still cost you thousands.",
    "kind": "insurance-plan"
  },
  {
    "id": "us_marketplace",
    "label": "US Marketplace (ACA) Plan",
    "country": "usa",
    "premiumAnnualEGP": 60000,
    "coveragePct": 0.7,
    "capEGP": 2000000,
    "minJobTier": null,
    "desc": "Bought on the ACA marketplace. Real coverage, real premiums, and a deductible before it pays anything.",
    "kind": "insurance-plan"
  },
  {
    "id": "uk_nhs",
    "label": "NHS (UK)",
    "country": "gbr",
    "premiumAnnualEGP": 0,
    "coveragePct": 0.9,
    "capEGP": null,
    "minJobTier": null,
    "stateSchemeCountries": [
      "gbr"
    ],
    "desc": "Tax-funded. Treatment is free at the point of use \u2014 the price is the waiting list, not the bill.",
    "kind": "insurance-plan"
  },
  {
    "id": "deu_public",
    "label": "German Public Health Insurance (GKV)",
    "country": "deu",
    "premiumAnnualEGP": 24000,
    "coveragePct": 0.9,
    "capEGP": null,
    "minJobTier": null,
    "stateSchemeCountries": [
      "deu"
    ],
    "desc": "Public Krankenkasse, about 14.6% of salary split with your employer. Comprehensive, and it follows you into retirement.",
    "kind": "insurance-plan"
  },
  {
    "id": "can_provincial",
    "label": "Canadian Provincial Health Plan",
    "country": "can",
    "premiumAnnualEGP": 0,
    "coveragePct": 0.9,
    "capEGP": null,
    "minJobTier": null,
    "stateSchemeCountries": [
      "can"
    ],
    "desc": "Provincial cover, tax-funded. Hospital and doctor visits are free; prescriptions and dental are not.",
    "kind": "insurance-plan"
  }
];

export const ALL_VACATIONS = [{"id": "north_coast", "name": "North Coast (Sahel)", "country": "egy", "region": "mena", "baseFlightUSD": 120, "tier": "premium", "days_typical": 7, "best": ["summer"], "safety": 8, "language": "ar", "tag": "Egypt's Riviera. Elite summer spot."}, {"id": "sharm", "name": "Sharm El Sheikh", "country": "egy", "region": "mena", "baseFlightUSD": 180, "tier": "mid", "days_typical": 5, "best": ["winter", "spring"], "safety": 8, "language": "ar", "tag": "Red Sea diving paradise."}, {"id": "dahab", "name": "Dahab", "country": "egy", "region": "mena", "baseFlightUSD": 160, "tier": "budget", "days_typical": 5, "best": ["spring", "autumn"], "safety": 8, "language": "ar", "tag": "Backpacker bliss on the Red Sea."}, {"id": "gouna", "name": "El Gouna", "country": "egy", "region": "mena", "baseFlightUSD": 200, "tier": "luxury", "days_typical": 6, "best": ["spring", "autumn"], "safety": 9, "language": "ar", "tag": "European-style resort town."}, {"id": "hurghada", "name": "Hurghada", "country": "egy", "region": "mena", "baseFlightUSD": 170, "tier": "mid", "days_typical": 5, "best": ["winter", "spring"], "safety": 8, "language": "ar", "tag": "Beaches, diving, nightlife."}, {"id": "alexandria", "name": "Alexandria Weekend", "country": "egy", "region": "mena", "baseFlightUSD": 60, "tier": "budget", "days_typical": 3, "best": ["spring", "autumn"], "safety": 7, "language": "ar", "tag": "Mediterranean charm, Bibliotheca, seafood."}, {"id": "luxor_aswan", "name": "Luxor & Aswan Cruise", "country": "egy", "region": "mena", "baseFlightUSD": 200, "tier": "premium", "days_typical": 5, "best": ["winter"], "safety": 8, "language": "ar", "tag": "Ancient temples, Nile cruise."}, {"id": "home", "name": " (Visit Family)", "country": "egy", "region": "mena", "baseFlightUSD": 180, "tier": "budget", "days_typical": 10, "best": ["any"], "safety": 7, "language": "ar", "tag": "Stay with family, visit old friends, home cooking."}, {"id": "siwa", "name": "Siwa Oasis", "country": "egy", "region": "mena", "baseFlightUSD": 100, "tier": "mid", "days_typical": 4, "best": ["winter", "spring"], "safety": 9, "language": "ar", "tag": "Salt lakes, desert springs, ecolodges."}, {"id": "marsa_alam", "name": "Marsa Alam", "country": "egy", "region": "mena", "baseFlightUSD": 220, "tier": "premium", "days_typical": 6, "best": ["winter", "spring"], "safety": 8, "language": "ar", "tag": "Pristine reefs, dugongs, quiet luxury."}, {"id": "turkey", "name": "Istanbul & Cappadocia", "country": "tur", "region": "mena", "baseFlightUSD": 350, "tier": "mid", "days_typical": 7, "best": ["spring", "autumn"], "safety": 8, "language": "tr", "tag": "Bosphorus, bazaars, hot-air balloons."}, {"id": "antalya", "name": "Antalya Coast", "country": "tur", "region": "mena", "baseFlightUSD": 380, "tier": "mid", "days_typical": 7, "best": ["summer"], "safety": 8, "language": "tr", "tag": "Turkish Riviera, resorts, ruins."}, {"id": "dubai", "name": "Dubai", "country": "uae", "region": "mena", "baseFlightUSD": 300, "tier": "luxury", "days_typical": 4, "best": ["winter"], "safety": 10, "language": "ar", "tag": "Ultra-modern, shopping, skyline."}, {"id": "abudhabi", "name": "Abu Dhabi", "country": "uae", "region": "mena", "baseFlightUSD": 320, "tier": "premium", "days_typical": 3, "best": ["winter"], "safety": 10, "language": "ar", "tag": "Culture, F1, Louvre."}, {"id": "riyadh", "name": "Riyadh", "country": "sau", "region": "mena", "baseFlightUSD": 350, "tier": "premium", "days_typical": 4, "best": ["winter"], "safety": 9, "language": "ar", "tag": "Diriyah, Boulevard, heritage."}, {"id": "jeddah", "name": "Jeddah", "country": "sau", "region": "mena", "baseFlightUSD": 340, "tier": "premium", "days_typical": 3, "best": ["winter"], "safety": 8, "language": "ar", "tag": "Red Sea coast, Al Balad old town."}, {"id": "alula", "name": "AlUla", "country": "sau", "region": "mena", "baseFlightUSD": 450, "tier": "luxury", "days_typical": 4, "best": ["winter"], "safety": 9, "language": "ar", "tag": "Ancient desert tombs, luxury retreats."}, {"id": "beirut", "name": "Beirut", "country": "lbn", "region": "mena", "baseFlightUSD": 280, "tier": "mid", "days_typical": 5, "best": ["spring", "summer"], "safety": 5, "language": "ar", "tag": "Food, nightlife, mountains."}, {"id": "doha", "name": "Doha", "country": "qat", "region": "mena", "baseFlightUSD": 300, "tier": "premium", "days_typical": 3, "best": ["winter"], "safety": 10, "language": "ar", "tag": "Museums, Souq Waqif, modern art."}, {"id": "muscat", "name": "Muscat & Salalah", "country": "omn", "region": "mena", "baseFlightUSD": 380, "tier": "premium", "days_typical": 6, "best": ["winter"], "safety": 10, "language": "ar", "tag": "Mountains, wadis, frankincense."}, {"id": "marrakech", "name": "Marrakech", "country": "mar", "region": "mena", "baseFlightUSD": 500, "tier": "mid", "days_typical": 6, "best": ["spring", "autumn"], "safety": 7, "language": "ar", "tag": "Medina, souks, riads, Atlas mountains."}, {"id": "italy", "name": "Italy (Rome & Florence)", "country": "ita", "region": "europe", "baseFlightUSD": 700, "tier": "premium", "days_typical": 10, "best": ["spring", "autumn"], "safety": 9, "language": "it", "tag": "History, art, food. Eternal."}, {"id": "amalfi", "name": "Amalfi Coast & Capri", "country": "ita", "region": "europe", "baseFlightUSD": 850, "tier": "luxury", "days_typical": 7, "best": ["summer"], "safety": 9, "language": "it", "tag": "Clifftop views, limoncello, yachts."}, {"id": "france", "name": "France (Paris)", "country": "fra", "region": "europe", "baseFlightUSD": 750, "tier": "premium", "days_typical": 7, "best": ["spring", "autumn"], "safety": 8, "language": "fr", "tag": "Romance, cuisine, fashion."}, {"id": "riviera", "name": "French Riviera (Nice, Cannes)", "country": "fra", "region": "europe", "baseFlightUSD": 800, "tier": "luxury", "days_typical": 8, "best": ["summer"], "safety": 8, "language": "fr", "tag": "Glamour, beaches, casinos."}, {"id": "spain", "name": "Spain (Barcelona & Madrid)", "country": "esp", "region": "europe", "baseFlightUSD": 720, "tier": "premium", "days_typical": 8, "best": ["spring", "autumn"], "safety": 9, "language": "es", "tag": "Tapas, Gaud\u00ed, flamenco."}, {"id": "ibiza", "name": "Ibiza", "country": "esp", "region": "europe", "baseFlightUSD": 800, "tier": "luxury", "days_typical": 5, "best": ["summer"], "safety": 8, "language": "es", "tag": "World-class clubs, sunsets, beaches."}, {"id": "greece", "name": "Greece (Athens & Islands)", "country": "grc", "region": "europe", "baseFlightUSD": 680, "tier": "premium", "days_typical": 8, "best": ["summer"], "safety": 9, "language": "el", "tag": "Santorini, Mykonos, ancient ruins."}, {"id": "gbr", "name": "United Kingdom (London)", "country": "gbr", "region": "europe", "baseFlightUSD": 800, "tier": "premium", "days_typical": 7, "best": ["summer"], "safety": 9, "language": "en", "tag": "Royal, pubs, West End, museums."}, {"id": "scotland", "name": "Scottish Highlands", "country": "gbr", "region": "europe", "baseFlightUSD": 850, "tier": "mid", "days_typical": 7, "best": ["summer"], "safety": 10, "language": "en", "tag": "Castles, lochs, whisky."}, {"id": "germany", "name": "Germany (Berlin & Munich)", "country": "deu", "region": "europe", "baseFlightUSD": 780, "tier": "premium", "days_typical": 7, "best": ["summer"], "safety": 9, "language": "de", "tag": "Beer, history, castles, festivals."}, {"id": "switzerland", "name": "Switzerland (Alps)", "country": "che", "region": "europe", "baseFlightUSD": 900, "tier": "luxury", "days_typical": 6, "best": ["summer", "winter"], "safety": 10, "language": "de", "tag": "Alpine luxury, skiing, chocolate."}, {"id": "amsterdam", "name": "Amsterdam", "country": "nld", "region": "europe", "baseFlightUSD": 800, "tier": "premium", "days_typical": 5, "best": ["spring", "summer"], "safety": 9, "language": "nl", "tag": "Canals, bicycles, Van Gogh."}, {"id": "lisbon", "name": "Lisbon & Porto", "country": "prt", "region": "europe", "baseFlightUSD": 750, "tier": "mid", "days_typical": 7, "best": ["spring", "autumn"], "safety": 9, "language": "pt", "tag": "Past\u00e9is, tiles, hills, wine."}, {"id": "vienna", "name": "Vienna & Salzburg", "country": "aut", "region": "europe", "baseFlightUSD": 800, "tier": "premium", "days_typical": 6, "best": ["winter", "spring"], "safety": 10, "language": "de", "tag": "Classical music, palaces, cafes."}, {"id": "prague", "name": "Prague", "country": "cze", "region": "europe", "baseFlightUSD": 700, "tier": "mid", "days_typical": 4, "best": ["spring", "autumn"], "safety": 9, "language": "cs", "tag": "Fairy-tale architecture, cheap beer."}, {"id": "iceland", "name": "Iceland", "country": "nor", "region": "europe", "baseFlightUSD": 1100, "tier": "premium", "days_typical": 8, "best": ["summer", "winter"], "safety": 10, "language": "is", "tag": "Northern lights, geysers, waterfalls."}, {"id": "japan", "name": "Japan (Tokyo & Kyoto)", "country": "jpn", "region": "asia", "baseFlightUSD": 1100, "tier": "premium", "days_typical": 10, "best": ["spring", "autumn"], "safety": 10, "language": "ja", "tag": "Cherry blossoms, sushi, bullet trains."}, {"id": "hokkaido", "name": "Hokkaido", "country": "jpn", "region": "asia", "baseFlightUSD": 1200, "tier": "premium", "days_typical": 7, "best": ["winter"], "safety": 10, "language": "ja", "tag": "World-class powder snow, hot springs."}, {"id": "korea", "name": "South Korea (Seoul)", "country": "kor", "region": "asia", "baseFlightUSD": 1050, "tier": "premium", "days_typical": 7, "best": ["spring", "autumn"], "safety": 10, "language": "ko", "tag": "K-pop, BBQ, palaces, skincare."}, {"id": "thailand", "name": "Thailand (Bangkok & Phuket)", "country": "tha", "region": "asia", "baseFlightUSD": 950, "tier": "mid", "days_typical": 8, "best": ["winter"], "safety": 8, "language": "th", "tag": "Temples, beaches, street food."}, {"id": "chiangmai", "name": "Chiang Mai", "country": "tha", "region": "asia", "baseFlightUSD": 1000, "tier": "budget", "days_typical": 6, "best": ["winter"], "safety": 8, "language": "th", "tag": "Digital nomads, temples, elephants."}, {"id": "maldives", "name": "Maldives (Overwater Villas)", "country": "mdv", "region": "asia", "baseFlightUSD": 1050, "tier": "luxury", "days_typical": 5, "best": ["winter"], "safety": 10, "language": "dv", "tag": "Honeymoon paradise."}, {"id": "bali", "name": "Bali, Indonesia", "country": "idn", "region": "asia", "baseFlightUSD": 1000, "tier": "mid", "days_typical": 8, "best": ["spring", "autumn"], "safety": 8, "language": "id", "tag": "Rice terraces, yoga, surf."}, {"id": "singapore", "name": "Singapore", "country": "sgp", "region": "asia", "baseFlightUSD": 1080, "tier": "premium", "days_typical": 4, "best": ["winter", "spring"], "safety": 10, "language": "en", "tag": "Futuristic, hawker food, clean."}, {"id": "india", "name": "India (Delhi & Agra)", "country": "ind", "region": "asia", "baseFlightUSD": 780, "tier": "budget", "days_typical": 7, "best": ["winter"], "safety": 6, "language": "hi", "tag": "Taj Mahal, colors, spices."}, {"id": "goa", "name": "Goa", "country": "ind", "region": "asia", "baseFlightUSD": 850, "tier": "budget", "days_typical": 6, "best": ["winter"], "safety": 6, "language": "hi", "tag": "Beaches, parties, Portuguese heritage."}, {"id": "vietnam", "name": "Vietnam (Hanoi & Halong)", "country": "vnm", "region": "asia", "baseFlightUSD": 950, "tier": "budget", "days_typical": 10, "best": ["spring", "autumn"], "safety": 8, "language": "vi", "tag": "Pho, karst bays, motorbikes."}, {"id": "philippines", "name": "Philippines (Palawan)", "country": "phl", "region": "asia", "baseFlightUSD": 1100, "tier": "mid", "days_typical": 10, "best": ["winter", "spring"], "safety": 7, "language": "en", "tag": "Pristine beaches, island hopping."}, {"id": "usa_nyc", "name": "New York City", "country": "usa", "region": "north_america", "baseFlightUSD": 1300, "tier": "premium", "days_typical": 5, "best": ["spring", "autumn"], "safety": 8, "language": "en", "tag": "Broadway, Central Park, SoHo."}, {"id": "usa_la", "name": "Los Angeles & San Diego", "country": "usa", "region": "north_america", "baseFlightUSD": 1250, "tier": "premium", "days_typical": 6, "best": ["summer"], "safety": 8, "language": "en", "tag": "Beaches, Hollywood, Disneyland."}, {"id": "usa_vegas", "name": "Las Vegas & Grand Canyon", "country": "usa", "region": "north_america", "baseFlightUSD": 1200, "tier": "premium", "days_typical": 4, "best": ["spring", "autumn"], "safety": 8, "language": "en", "tag": "Strip, shows, desert."}, {"id": "usa_miami", "name": "Miami", "country": "usa", "region": "north_america", "baseFlightUSD": 1100, "tier": "premium", "days_typical": 5, "best": ["winter", "spring"], "safety": 7, "language": "en", "tag": "South Beach, Art Deco, nightlife."}, {"id": "usa_hawaii", "name": "Hawaii (Maui & Oahu)", "country": "usa", "region": "north_america", "baseFlightUSD": 1600, "tier": "luxury", "days_typical": 8, "best": ["summer", "winter"], "safety": 9, "language": "en", "tag": "Volcanoes, surf, luaus."}, {"id": "canada", "name": "Canada (Toronto & Vancouver)", "country": "can", "region": "north_america", "baseFlightUSD": 1250, "tier": "premium", "days_typical": 7, "best": ["summer"], "safety": 10, "language": "en", "tag": "Nature, cities, maple."}, {"id": "mexico", "name": "Mexico (Cancun & Tulum)", "country": "mex", "region": "north_america", "baseFlightUSD": 1100, "tier": "mid", "days_typical": 7, "best": ["winter", "spring"], "safety": 6, "language": "es", "tag": "Cenotes, ruins, all-inclusives."}, {"id": "brazil", "name": "Brazil (Rio de Janeiro)", "country": "bra", "region": "south_america", "baseFlightUSD": 1400, "tier": "mid", "days_typical": 7, "best": ["winter"], "safety": 5, "language": "pt", "tag": "Carnival, Copacabana, Christ the Redeemer."}, {"id": "peru", "name": "Peru (Machu Picchu)", "country": "per", "region": "south_america", "baseFlightUSD": 1500, "tier": "mid", "days_typical": 8, "best": ["summer"], "safety": 6, "language": "es", "tag": "Inca trail, Andes, ceviche."}, {"id": "australia", "name": "Australia (Sydney)", "country": "aus", "region": "oceania", "baseFlightUSD": 1700, "tier": "premium", "days_typical": 8, "best": ["winter"], "safety": 10, "language": "en", "tag": "Opera House, beaches, wildlife."}, {"id": "new_zealand", "name": "New Zealand", "country": "nzl", "region": "oceania", "baseFlightUSD": 1800, "tier": "premium", "days_typical": 12, "best": ["winter"], "safety": 10, "language": "en", "tag": "Fjords, Lord of the Rings, extreme sports."}, {"id": "fiji", "name": "Fiji", "country": "fji", "region": "oceania", "baseFlightUSD": 1900, "tier": "luxury", "days_typical": 7, "best": ["summer"], "safety": 9, "language": "en", "tag": "South Pacific tropical paradise."}, {"id": "south_africa", "name": "South Africa (Cape Town)", "country": "zaf", "region": "africa", "baseFlightUSD": 1150, "tier": "mid", "days_typical": 7, "best": ["winter"], "safety": 6, "language": "en", "tag": "Table Mountain, safari, wine."}, {"id": "kenya", "name": "Kenya Safari", "country": "ken", "region": "africa", "baseFlightUSD": 900, "tier": "premium", "days_typical": 6, "best": ["summer"], "safety": 6, "language": "sw", "tag": "Maasai Mara, migration, wildlife."}, {"id": "tanzania", "name": "Tanzania (Serengeti & Zanzibar)", "country": "tza", "region": "africa", "baseFlightUSD": 950, "tier": "premium", "days_typical": 8, "best": ["summer"], "safety": 6, "language": "sw", "tag": "Safari and spice island beaches."}, {"id": "mauritius", "name": "Mauritius", "country": "mus", "region": "africa", "baseFlightUSD": 1000, "tier": "luxury", "days_typical": 7, "best": ["spring", "autumn"], "safety": 9, "language": "en", "tag": "Indian Ocean resorts, waterfalls."}, {"id": "maldives_honeymoon", "name": "Maldives Honeymoon Package", "country": "mdv", "region": "asia", "baseFlightUSD": 1050, "tier": "luxury", "days_typical": 7, "best": ["winter"], "safety": 10, "language": "dv", "tag": "Curated honeymoon escape."}, {"id": "umrah_makkah", "name": "Umrah Pilgrimage \u2014 Makkah & Madinah (Nusuk)", "country": "sau", "region": "mena", "baseFlightUSD": 420, "packageUsd": 1250, "tier": "spiritual", "days_typical": 8, "safety": 10, "pilgrimage": "umrah", "tag": "Sacred minor pilgrimage to Al-Masjid Al-Haram & Al-Masjid An-Nabawi via Nusuk."}, {"id": "hajj_nusuk_std", "name": "Official Nusuk Hajj Package \u2014 Makkah, Mina & Arafat", "country": "sau", "region": "mena", "baseFlightUSD": 750, "packageUsd": 8900, "domesticSar": 9500, "tier": "spiritual", "days_typical": 14, "safety": 10, "pilgrimage": "hajj", "tag": "Once-in-a-lifetime Fifth Pillar pilgrimage (domestic SAR rate if residing in Saudi Arabia!)."}, {"id": "alula_hegira", "name": "AlUla & Hegra Desert Resort", "country": "sau", "region": "mena", "baseFlightUSD": 290, "tier": "luxury", "days_typical": 4, "safety": 10, "tag": "Sandstone Nabataean tombs & mirrored desert canyon resorts."}, {"id": "abha_asir", "name": "Abha & Soudah Misty Mountains", "country": "sau", "region": "mena", "baseFlightUSD": 220, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Cool summer highland clouds above the Red Sea escarpment."}, {"id": "red_sea_ummahat", "name": "Red Sea St. Regis / Nujuma Overwater Villas", "country": "sau", "region": "mena", "baseFlightUSD": 380, "tier": "ultra", "days_typical": 5, "safety": 10, "tag": "Ultra-luxury coral archipelago on Saudi Arabia's Red Sea."}, {"id": "siwa_oasis", "name": "Siwa Oasis Salt Lakes & Eco-Lodge", "country": "egy", "region": "mena", "baseFlightUSD": 95, "tier": "budget", "days_typical": 5, "safety": 8, "tag": "Candlelit mud-brick lodges, turquoise salt pools & desert stars."}, {"id": "ras_el_hekma_summer", "name": "Ras El Hekma Turquoise Bay", "country": "egy", "region": "mena", "baseFlightUSD": 110, "tier": "luxury", "days_typical": 7, "safety": 9, "tag": "Crystal-white North Coast Mediterranean waters."}, {"id": "el_gouna_kitesurf", "name": "El Gouna Lagoons & Kitesurfing", "country": "egy", "region": "mena", "baseFlightUSD": 140, "tier": "premium", "days_typical": 6, "safety": 9, "tag": "Red Sea lagoon marinas and year-round sun."}, {"id": "hatta_mountains", "name": "Hatta Dam Mountain Kayaking & Glamping", "country": "uae", "region": "mena", "baseFlightUSD": 160, "tier": "mid", "days_typical": 3, "safety": 10, "tag": "Hajar Mountain emerald wadis outside Dubai."}, {"id": "salalah_khareef", "name": "Salalah Khareef Monsoon Waterfalls", "country": "uae", "region": "mena", "baseFlightUSD": 260, "tier": "mid", "days_typical": 5, "safety": 10, "tag": "Lush green summer monsoon cliffs in Dhofar."}, {"id": "kyoto_ryokan", "name": "Kyoto Bamboo Grove & Onsen Ryokan", "country": "jpn", "region": "asia", "baseFlightUSD": 1150, "tier": "premium", "days_typical": 8, "safety": 10, "tag": "Ancient wooden temples, matcha ceremonies & hot springs."}, {"id": "amalfi_positano", "name": "Amalfi Coast & Capri Cliffside", "country": "ita", "region": "europe", "baseFlightUSD": 680, "tier": "luxury", "days_typical": 6, "safety": 9, "tag": "Lemon groves and dramatic Mediterranean coastal roads."}, {"id": "scottish_highlands", "name": "Isle of Skye & Scottish Highlands", "country": "gbr", "region": "europe", "baseFlightUSD": 480, "tier": "mid", "days_typical": 6, "safety": 9, "tag": "Dramatic glens, lochs, and stone castles."}, {"id": "banff_rockies", "name": "Banff & Lake Louise Rockies", "country": "can", "region": "americas", "baseFlightUSD": 780, "tier": "premium", "days_typical": 7, "safety": 10, "tag": "Glacial turquoise lakes beneath snow-capped Canadian peaks."}, {"id": "zermatt_alps", "name": "Swiss Alps Matterhorn Train Retreat", "country": "deu", "region": "europe", "baseFlightUSD": 640, "tier": "luxury", "days_typical": 6, "safety": 10, "tag": "Car-free alpine village beneath the Matterhorn."}, {"id": "zanzibar_spice", "name": "Zanzibar Stone Town & Coral Reefs", "country": "uae", "region": "africa", "baseFlightUSD": 540, "tier": "mid", "days_typical": 6, "safety": 8, "tag": "Indian Ocean dhow sails and spice plantations."}, {"id": "vac_exp_0", "name": "Fayoum Tunis Village Pottery Retreat", "country": "egy", "region": "mena", "baseFlightUSD": 60, "tier": "budget", "days_typical": 5, "safety": 9, "tag": "Curated Fayoum Tunis Village Pottery Retreat escape."}, {"id": "vac_exp_1", "name": "Saint Catherine Sinai Sunrise", "country": "egy", "region": "mena", "baseFlightUSD": 110, "tier": "budget", "days_typical": 5, "safety": 9, "tag": "Curated Saint Catherine Sinai Sunrise escape."}, {"id": "vac_exp_2", "name": "Marsa Alam Wadi El Gemal Diving", "country": "egy", "region": "mena", "baseFlightUSD": 160, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Marsa Alam Wadi El Gemal Diving escape."}, {"id": "vac_exp_3", "name": "Jeddah Al-Balad Historic Coral Houses", "country": "sau", "region": "mena", "baseFlightUSD": 240, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Jeddah Al-Balad Historic Coral Houses escape."}, {"id": "vac_exp_4", "name": "Taif Rose Harvest Highlands", "country": "sau", "region": "mena", "baseFlightUSD": 230, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Taif Rose Harvest Highlands escape."}, {"id": "vac_exp_5", "name": "Sir Bani Yas Wildlife Island", "country": "uae", "region": "mena", "baseFlightUSD": 320, "tier": "luxury", "days_typical": 5, "safety": 9, "tag": "Curated Sir Bani Yas Wildlife Island escape."}, {"id": "vac_exp_6", "name": "Fujairah Snoopy Island Snorkeling", "country": "uae", "region": "mena", "baseFlightUSD": 190, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Fujairah Snoopy Island Snorkeling escape."}, {"id": "vac_exp_7", "name": "Cornwall St Ives Coastal Path", "country": "gbr", "region": "europe", "baseFlightUSD": 420, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Cornwall St Ives Coastal Path escape."}, {"id": "vac_exp_8", "name": "Lake District Windermere", "country": "gbr", "region": "europe", "baseFlightUSD": 430, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Lake District Windermere escape."}, {"id": "vac_exp_9", "name": "Bavarian Neuschwanstein & Garmisch", "country": "deu", "region": "europe", "baseFlightUSD": 520, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Bavarian Neuschwanstein & Garmisch escape."}, {"id": "vac_exp_10", "name": "Black Forest Thermal Spas", "country": "deu", "region": "europe", "baseFlightUSD": 510, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Black Forest Thermal Spas escape."}, {"id": "vac_exp_11", "name": "Grand Canyon & Sedona Red Rocks", "country": "usa", "region": "americas", "baseFlightUSD": 890, "tier": "premium", "days_typical": 5, "safety": 9, "tag": "Curated Grand Canyon & Sedona Red Rocks escape."}, {"id": "vac_exp_12", "name": "Yellowstone Geothermal Geysers", "country": "usa", "region": "americas", "baseFlightUSD": 920, "tier": "premium", "days_typical": 5, "safety": 9, "tag": "Curated Yellowstone Geothermal Geysers escape."}, {"id": "vac_exp_13", "name": "Quebec City Old Ramparts", "country": "can", "region": "americas", "baseFlightUSD": 740, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Quebec City Old Ramparts escape."}, {"id": "vac_exp_14", "name": "Great Barrier Reef Whitsundays", "country": "aus", "region": "oceania", "baseFlightUSD": 1280, "tier": "luxury", "days_typical": 5, "safety": 9, "tag": "Curated Great Barrier Reef Whitsundays escape."}, {"id": "vac_exp_15", "name": "Kerala Backwaters Houseboat", "country": "ind", "region": "asia", "baseFlightUSD": 580, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Kerala Backwaters Houseboat escape."}, {"id": "vac_exp_16", "name": "Udaipur Lake Pichola Palaces", "country": "ind", "region": "asia", "baseFlightUSD": 610, "tier": "premium", "days_typical": 5, "safety": 9, "tag": "Curated Udaipur Lake Pichola Palaces escape."}, {"id": "vac_exp_17", "name": "Iguazu Falls Rainforest", "country": "bra", "region": "americas", "baseFlightUSD": 980, "tier": "premium", "days_typical": 5, "safety": 9, "tag": "Curated Iguazu Falls Rainforest escape."}, {"id": "vac_exp_18", "name": "Granada Alhambra & Andalusia", "country": "fra", "region": "europe", "baseFlightUSD": 590, "tier": "mid", "days_typical": 5, "safety": 9, "tag": "Curated Granada Alhambra & Andalusia escape."}, {"id": "vac_exp_19", "name": "Hokkaido Powder Snow & Sapporo", "country": "jpn", "region": "asia", "baseFlightUSD": 1220, "tier": "premium", "days_typical": 5, "safety": 9, "tag": "Curated Hokkaido Powder Snow & Sapporo escape."}];
export const VAC_AIRFARE_CLASSES = [
  {
    "id": "economy",
    "label": "Economy",
    "mult": 1,
    "comfort": 0,
    "happiness": 0,
    "sos": 0
  },
  {
    "id": "premium",
    "label": "Premium Economy",
    "mult": 1.7,
    "comfort": 2,
    "happiness": 2,
    "sos": 1
  },
  {
    "id": "business",
    "label": "Business Class",
    "mult": 3.5,
    "comfort": 5,
    "happiness": 5,
    "sos": 3
  },
  {
    "id": "first",
    "label": "First Class",
    "mult": 6,
    "comfort": 8,
    "happiness": 10,
    "sos": 5
  },
  {
    "id": "private",
    "label": "Private Jet Charter",
    "mult": 25,
    "comfort": 10,
    "happiness": 15,
    "sos": 10
  }
];
export const VAC_HOTEL_TIERS = [
  {
    "id": "hostel",
    "label": "Hostel / Dorm",
    "mult": 0.2,
    "comfort": 1,
    "happiness": 0,
    "sos": 0,
    "perNightUSD": 25,
    "risks": [
      "noise",
      "shared_bath",
      "theft"
    ]
  },
  {
    "id": "budget",
    "label": "Budget Guesthouse",
    "mult": 0.35,
    "comfort": 2,
    "happiness": 1,
    "sos": 0,
    "perNightUSD": 45,
    "risks": [
      "bad_bed"
    ]
  },
  {
    "id": "airbnb",
    "label": "Airbnb / Apartment",
    "mult": 0.55,
    "comfort": 4,
    "happiness": 3,
    "sos": 1,
    "perNightUSD": 75,
    "risks": [
      "cleaning_fee",
      "weird_host"
    ],
    "from": 2008
  },
  {
    "id": "hotel3",
    "label": "3-Star Hotel",
    "mult": 0.8,
    "comfort": 5,
    "happiness": 3,
    "sos": 1,
    "perNightUSD": 110
  },
  {
    "id": "hotel4",
    "label": "4-Star Hotel",
    "mult": 1.2,
    "comfort": 7,
    "happiness": 5,
    "sos": 2,
    "perNightUSD": 180
  },
  {
    "id": "hotel5",
    "label": "5-Star Luxury Hotel",
    "mult": 2.2,
    "comfort": 9,
    "happiness": 8,
    "sos": 4,
    "perNightUSD": 380
  },
  {
    "id": "resort",
    "label": "Ultra-Luxury Resort / Villa",
    "mult": 3.5,
    "comfort": 10,
    "happiness": 12,
    "sos": 6,
    "perNightUSD": 650
  },
  {
    "id": "overwater",
    "label": "Overwater Bungalow",
    "mult": 5,
    "comfort": 10,
    "happiness": 15,
    "sos": 8,
    "perNightUSD": 1200
  },
  {
    "id": "stay_family",
    "label": "Stay with Family Abroad",
    "mult": 0,
    "comfort": 4,
    "happiness": 4,
    "sos": 1,
    "perNightUSD": 0,
    "requiresFamilyAbroad": true
  },
  {
    "id": "stay_own_home",
    "label": "Stay in your own house",
    "mult": 0,
    "comfort": 6,
    "happiness": 5,
    "sos": 1,
    "perNightUSD": 0,
    "requiresOwnVacantHome": true
  }
];
export const VAC_ACTIVITIES = {
  "egy": [
    {
      "id": "pyramids",
      "label": "Pyramids & Sphinx tour",
      "costUSD": 80,
      "happy": 6,
      "social": 2,
      "hours": 6
    },
    {
      "id": "nile_cruise",
      "label": "Nile dinner cruise",
      "costUSD": 120,
      "happy": 5,
      "social": 3,
      "hours": 3
    },
    {
      "id": "khan",
      "label": "Khan El Khalili bazaar",
      "costUSD": 40,
      "happy": 4,
      "social": 2,
      "hours": 3
    },
    {
      "id": "diving",
      "label": "Scuba diving trip",
      "costUSD": 180,
      "happy": 8,
      "health": 2,
      "hours": 8
    },
    {
      "id": "desert",
      "label": "Desert safari + BBQ",
      "costUSD": 150,
      "happy": 7,
      "social": 3,
      "hours": 6
    },
    {
      "id": "museum",
      "label": "Grand Egyptian Museum",
      "costUSD": 70,
      "happy": 5,
      "smarts": 4,
      "hours": 5
    },
    {
      "id": "kitesurf",
      "label": "Kitesurfing lesson",
      "costUSD": 100,
      "happy": 6,
      "health": 3,
      "hours": 4
    }
  ],
  "home": [
    {
      "id": "family_time",
      "label": "Extended family gathering",
      "costUSD": 0,
      "happy": 8,
      "social": 5,
      "hours": 6
    },
    {
      "id": "old_friends",
      "label": "Meet childhood friends",
      "costUSD": 40,
      "happy": 7,
      "social": 4,
      "hours": 4
    },
    {
      "id": "home_food",
      "label": "Home-cooked feast",
      "costUSD": 20,
      "happy": 6,
      "health": 2,
      "hours": 3
    },
    {
      "id": "cairo_tour",
      "label": "Old Cairo walking tour",
      "costUSD": 50,
      "happy": 5,
      "smarts": 2,
      "hours": 5
    },
    {
      "id": "grandma_time",
      "label": "Time with grandparents",
      "costUSD": 0,
      "happy": 10,
      "social": 2,
      "hours": 8
    }
  ],
  "tur": [
    {
      "id": "hagia",
      "label": "Hagia Sophia & Blue Mosque",
      "costUSD": 80,
      "happy": 5,
      "smarts": 2,
      "hours": 5
    },
    {
      "id": "balloon",
      "label": "Cappadocia hot-air balloon",
      "costUSD": 250,
      "happy": 12,
      "social": 3,
      "hours": 4
    },
    {
      "id": "bosphorus",
      "label": "Bosphorus yacht cruise",
      "costUSD": 120,
      "happy": 6,
      "social": 2,
      "hours": 3
    },
    {
      "id": "bazaar",
      "label": "Grand Bazaar shopping",
      "costUSD": 0,
      "happy": 3,
      "social": 2,
      "hours": 4
    },
    {
      "id": "hammam",
      "label": "Luxury Turkish hammam",
      "costUSD": 150,
      "happy": 7,
      "health": 4,
      "hours": 3
    },
    {
      "id": "ruins",
      "label": "Ephesus ancient ruins",
      "costUSD": 100,
      "happy": 5,
      "smarts": 3,
      "hours": 6
    }
  ],
  "uae": [
    {
      "id": "burj",
      "label": "Burj Khalifa VIP Lounge",
      "costUSD": 150,
      "happy": 8,
      "social": 4,
      "hours": 3
    },
    {
      "id": "desert_uae",
      "label": "Luxury desert dune bashing",
      "costUSD": 200,
      "happy": 9,
      "social": 3,
      "hours": 6
    },
    {
      "id": "mall",
      "label": "Dubai Mall VIP shopper",
      "costUSD": 50,
      "happy": 4,
      "social": 3,
      "hours": 5
    },
    {
      "id": "ferrari",
      "label": "Ferrari World (Abu Dhabi)",
      "costUSD": 110,
      "happy": 7,
      "social": 3,
      "hours": 8
    },
    {
      "id": "ski",
      "label": "Ski Dubai indoor",
      "costUSD": 90,
      "happy": 6,
      "health": 2,
      "hours": 4
    },
    {
      "id": "yacht",
      "label": "Private yacht rental",
      "costUSD": 500,
      "happy": 10,
      "social": 8,
      "hours": 4
    }
  ],
  "sau": [
    {
      "id": "diriyah",
      "label": "At-Turaif & Diriyah Tour",
      "costUSD": 80,
      "happy": 5,
      "smarts": 3,
      "hours": 4
    },
    {
      "id": "edge",
      "label": "Edge of the World trek",
      "costUSD": 120,
      "happy": 8,
      "health": 2,
      "hours": 6
    },
    {
      "id": "boulevard",
      "label": "Boulevard Riyadh City",
      "costUSD": 50,
      "happy": 6,
      "social": 4,
      "hours": 4
    },
    {
      "id": "hegra",
      "label": "Hegra (AlUla) guided tour",
      "costUSD": 150,
      "happy": 9,
      "smarts": 4,
      "hours": 5
    }
  ],
  "ita": [
    {
      "id": "colosseum",
      "label": "Colosseum VIP underground",
      "costUSD": 120,
      "happy": 7,
      "smarts": 4,
      "hours": 4
    },
    {
      "id": "vatican",
      "label": "Vatican early access",
      "costUSD": 150,
      "happy": 8,
      "smarts": 4,
      "hours": 5
    },
    {
      "id": "uffizi",
      "label": "Uffizi Gallery (Florence)",
      "costUSD": 80,
      "happy": 5,
      "smarts": 3,
      "hours": 4
    },
    {
      "id": "gondola",
      "label": "Gondola ride in Venice",
      "costUSD": 120,
      "happy": 8,
      "social": 2,
      "hours": 1
    },
    {
      "id": "wine",
      "label": "Tuscany vineyard tour",
      "costUSD": 200,
      "happy": 7,
      "social": 4,
      "hours": 6
    },
    {
      "id": "pompeii",
      "label": "Pompeii guided day-trip",
      "costUSD": 150,
      "happy": 6,
      "smarts": 3,
      "hours": 8
    },
    {
      "id": "cooking",
      "label": "Pasta making class",
      "costUSD": 100,
      "happy": 7,
      "smarts": 2,
      "hours": 4
    }
  ],
  "fra": [
    {
      "id": "eiffel",
      "label": "Eiffel Tower summit & dine",
      "costUSD": 150,
      "happy": 9,
      "social": 4,
      "hours": 3
    },
    {
      "id": "louvre",
      "label": "Louvre private tour",
      "costUSD": 120,
      "happy": 7,
      "smarts": 4,
      "hours": 4
    },
    {
      "id": "versailles",
      "label": "Versailles Palace",
      "costUSD": 80,
      "happy": 6,
      "smarts": 2,
      "hours": 6
    },
    {
      "id": "riviera",
      "label": "Monaco & Riviera day trip",
      "costUSD": 250,
      "happy": 9,
      "social": 5,
      "hours": 10
    },
    {
      "id": "michelin",
      "label": "3-Star Michelin dinner",
      "costUSD": 450,
      "happy": 12,
      "social": 7,
      "hours": 4
    },
    {
      "id": "wine_bordeaux",
      "label": "Bordeaux wine tasting",
      "costUSD": 180,
      "happy": 7,
      "social": 3,
      "hours": 6
    }
  ],
  "esp": [
    {
      "id": "sagrada",
      "label": "Sagrada Familia skip-line",
      "costUSD": 80,
      "happy": 7,
      "smarts": 3,
      "hours": 3
    },
    {
      "id": "flamenco",
      "label": "Flamenco show + dinner",
      "costUSD": 120,
      "happy": 7,
      "social": 4,
      "hours": 3
    },
    {
      "id": "park_guell",
      "label": "Park G\u00fcell guided tour",
      "costUSD": 90,
      "happy": 5,
      "smarts": 2,
      "hours": 4
    },
    {
      "id": "tapas",
      "label": "Gourmet tapas tour",
      "costUSD": 120,
      "happy": 8,
      "social": 4,
      "hours": 4
    },
    {
      "id": "ibiza_club",
      "label": "VIP Club Table (Ibiza)",
      "costUSD": 500,
      "happy": 10,
      "social": 8,
      "hours": 6
    }
  ],
  "gbr": [
    {
      "id": "tower_london",
      "label": "Tower of London & Jewels",
      "costUSD": 80,
      "happy": 6,
      "smarts": 3,
      "hours": 4
    },
    {
      "id": "west_end",
      "label": "West End premium seats",
      "costUSD": 220,
      "happy": 9,
      "social": 4,
      "hours": 3
    },
    {
      "id": "afternoon_tea",
      "label": "Luxury Afternoon Tea",
      "costUSD": 100,
      "happy": 6,
      "social": 3,
      "hours": 2
    },
    {
      "id": "stonehenge",
      "label": "Stonehenge inner circle",
      "costUSD": 180,
      "happy": 7,
      "smarts": 3,
      "hours": 8
    },
    {
      "id": "highlands",
      "label": "Loch Ness & Glencoe tour",
      "costUSD": 150,
      "happy": 8,
      "smarts": 2,
      "hours": 10
    }
  ],
  "deu": [
    {
      "id": "neuschwanstein",
      "label": "Neuschwanstein Castle",
      "costUSD": 90,
      "happy": 7,
      "smarts": 2,
      "hours": 8
    },
    {
      "id": "beer",
      "label": "Munich beer garden tour",
      "costUSD": 80,
      "happy": 6,
      "social": 5,
      "hours": 4
    },
    {
      "id": "berlin_wall",
      "label": "Berlin Wall & Cold War",
      "costUSD": 50,
      "happy": 5,
      "smarts": 4,
      "hours": 3
    },
    {
      "id": "octoberfest",
      "label": "Oktoberfest VIP Tent",
      "costUSD": 300,
      "happy": 12,
      "social": 8,
      "hours": 8,
      "seasonal": [
        "autumn"
      ]
    }
  ],
  "che": [
    {
      "id": "jungfrau",
      "label": "Jungfraujoch (Top of Europe)",
      "costUSD": 250,
      "happy": 10,
      "health": 2,
      "hours": 10
    },
    {
      "id": "ski_swiss",
      "label": "Private Alps ski lesson",
      "costUSD": 400,
      "happy": 10,
      "health": 5,
      "hours": 6,
      "seasonal": [
        "winter"
      ]
    },
    {
      "id": "chocolate",
      "label": "Swiss chocolate making",
      "costUSD": 120,
      "happy": 7,
      "social": 2,
      "hours": 4
    },
    {
      "id": "glacier",
      "label": "Glacier Express first class",
      "costUSD": 350,
      "happy": 9,
      "smarts": 2,
      "hours": 8
    }
  ],
  "nld": [
    {
      "id": "canal",
      "label": "Amsterdam canal cruise",
      "costUSD": 40,
      "happy": 5,
      "social": 2,
      "hours": 2
    },
    {
      "id": "vangogh",
      "label": "Van Gogh Museum",
      "costUSD": 30,
      "happy": 6,
      "smarts": 4,
      "hours": 3
    },
    {
      "id": "bike",
      "label": "Countryside bike tour",
      "costUSD": 50,
      "happy": 7,
      "health": 3,
      "hours": 4
    }
  ],
  "jpn": [
    {
      "id": "fuji",
      "label": "Mount Fuji private tour",
      "costUSD": 250,
      "happy": 9,
      "smarts": 2,
      "hours": 10
    },
    {
      "id": "sushi",
      "label": "Omakase sushi experience",
      "costUSD": 350,
      "happy": 11,
      "social": 4,
      "hours": 2
    },
    {
      "id": "kyoto",
      "label": "Geisha district walking tour",
      "costUSD": 150,
      "happy": 8,
      "smarts": 3,
      "hours": 4
    },
    {
      "id": "shinkansen",
      "label": "Green Car bullet train",
      "costUSD": 180,
      "happy": 6,
      "smarts": 2,
      "hours": 3
    },
    {
      "id": "onsen",
      "label": "Luxury ryokan onsen",
      "costUSD": 200,
      "happy": 9,
      "health": 5,
      "hours": 4
    },
    {
      "id": "akihabara",
      "label": "Akihabara anime & gaming",
      "costUSD": 80,
      "happy": 7,
      "social": 3,
      "hours": 5
    }
  ],
  "tha": [
    {
      "id": "beach",
      "label": "Phi Phi Islands speedboat",
      "costUSD": 150,
      "happy": 9,
      "social": 3,
      "hours": 8
    },
    {
      "id": "temple_thai",
      "label": "Grand Palace & Emerald Buddha",
      "costUSD": 60,
      "happy": 6,
      "smarts": 3,
      "hours": 4
    },
    {
      "id": "massage",
      "label": "Luxury Thai spa day",
      "costUSD": 120,
      "happy": 8,
      "health": 5,
      "hours": 3
    },
    {
      "id": "street_food",
      "label": "Bangkok midnight food tour",
      "costUSD": 80,
      "happy": 7,
      "social": 3,
      "hours": 4
    },
    {
      "id": "elephants",
      "label": "Ethical elephant sanctuary",
      "costUSD": 120,
      "happy": 10,
      "social": 2,
      "hours": 6
    }
  ],
  "mdv": [
    {
      "id": "diving_mv",
      "label": "Scuba diving with mantas",
      "costUSD": 250,
      "happy": 10,
      "health": 2,
      "hours": 4
    },
    {
      "id": "dolphin",
      "label": "Private sunset yacht",
      "costUSD": 500,
      "happy": 12,
      "social": 5,
      "hours": 3
    },
    {
      "id": "spa_mv",
      "label": "Underwater spa treatment",
      "costUSD": 350,
      "happy": 11,
      "health": 4,
      "hours": 2
    },
    {
      "id": "dinner_mv",
      "label": "Private sandbank dinner",
      "costUSD": 400,
      "happy": 10,
      "social": 6,
      "hours": 3
    }
  ],
  "idn": [
    {
      "id": "rice",
      "label": "Tegallalang rice terraces",
      "costUSD": 40,
      "happy": 6,
      "social": 2,
      "hours": 4
    },
    {
      "id": "ubud",
      "label": "Ubud monkey forest & swing",
      "costUSD": 60,
      "happy": 7,
      "social": 2,
      "hours": 4
    },
    {
      "id": "bali_surf",
      "label": "Private surf lesson",
      "costUSD": 100,
      "happy": 8,
      "health": 4,
      "hours": 3
    },
    {
      "id": "bali_spa",
      "label": "Balinese flower bath spa",
      "costUSD": 150,
      "happy": 9,
      "health": 4,
      "hours": 3
    },
    {
      "id": "volcano",
      "label": "Mount Batur sunrise trek",
      "costUSD": 150,
      "happy": 9,
      "health": 3,
      "hours": 8
    }
  ],
  "sgp": [
    {
      "id": "marina_bay",
      "label": "Marina Bay Sands SkyPark",
      "costUSD": 30,
      "happy": 5,
      "hours": 2
    },
    {
      "id": "universal",
      "label": "Universal Studios VIP",
      "costUSD": 250,
      "happy": 10,
      "social": 4,
      "hours": 8
    },
    {
      "id": "gardens",
      "label": "Gardens by the Bay domes",
      "costUSD": 50,
      "happy": 6,
      "smarts": 2,
      "hours": 4
    },
    {
      "id": "hawker",
      "label": "Michelin hawker food tour",
      "costUSD": 80,
      "happy": 7,
      "social": 3,
      "hours": 3
    },
    {
      "id": "night_safari",
      "label": "Night Safari zoo",
      "costUSD": 60,
      "happy": 7,
      "smarts": 2,
      "hours": 4
    }
  ],
  "ind": [
    {
      "id": "taj",
      "label": "Taj Mahal private sunrise",
      "costUSD": 100,
      "happy": 10,
      "smarts": 3,
      "hours": 5
    },
    {
      "id": "red_fort",
      "label": "Old Delhi rickshaw tour",
      "costUSD": 40,
      "happy": 6,
      "smarts": 2,
      "hours": 4
    },
    {
      "id": "yoga",
      "label": "Rishikesh ashram retreat",
      "costUSD": 150,
      "happy": 8,
      "health": 5,
      "hours": 8
    },
    {
      "id": "safari_ind",
      "label": "Ranthambore tiger safari",
      "costUSD": 300,
      "happy": 9,
      "social": 2,
      "hours": 6
    },
    {
      "id": "goa_party",
      "label": "Goa beach club party",
      "costUSD": 100,
      "happy": 8,
      "social": 5,
      "hours": 6
    }
  ],
  "usa": [
    {
      "id": "statue",
      "label": "Statue of Liberty crown",
      "costUSD": 80,
      "happy": 6,
      "smarts": 3,
      "hours": 4
    },
    {
      "id": "broadway",
      "label": "Broadway premium orchestra",
      "costUSD": 350,
      "happy": 10,
      "social": 4,
      "hours": 3
    },
    {
      "id": "hollywood",
      "label": "Warner Bros studio VIP",
      "costUSD": 150,
      "happy": 8,
      "smarts": 2,
      "hours": 4
    },
    {
      "id": "disney",
      "label": "Disneyland VIP tour",
      "costUSD": 600,
      "happy": 12,
      "social": 5,
      "hours": 10
    },
    {
      "id": "grand_canyon",
      "label": "Grand Canyon helicopter",
      "costUSD": 450,
      "happy": 12,
      "social": 3,
      "hours": 4
    },
    {
      "id": "vegas_show",
      "label": "Cirque du Soleil front row",
      "costUSD": 250,
      "happy": 10,
      "social": 5,
      "hours": 3
    },
    {
      "id": "nba_game",
      "label": "Courtside NBA tickets",
      "costUSD": 800,
      "happy": 11,
      "social": 7,
      "hours": 4
    },
    {
      "id": "helicopter",
      "label": "NYC helicopter night tour",
      "costUSD": 300,
      "happy": 10,
      "social": 4,
      "hours": 2
    }
  ],
  "can": [
    {
      "id": "niagara",
      "label": "Niagara Falls boat tour",
      "costUSD": 120,
      "happy": 8,
      "social": 2,
      "hours": 8
    },
    {
      "id": "banff",
      "label": "Banff & Lake Louise",
      "costUSD": 300,
      "happy": 10,
      "health": 2,
      "hours": 10
    },
    {
      "id": "cn_tower",
      "label": "CN Tower EdgeWalk",
      "costUSD": 200,
      "happy": 8,
      "social": 3,
      "hours": 2
    },
    {
      "id": "ski_whistler",
      "label": "Whistler skiing",
      "costUSD": 250,
      "happy": 9,
      "health": 4,
      "hours": 8,
      "seasonal": [
        "winter"
      ]
    }
  ],
  "aus": [
    {
      "id": "opera",
      "label": "Sydney Opera House show",
      "costUSD": 150,
      "happy": 8,
      "smarts": 3,
      "hours": 3
    },
    {
      "id": "bondi",
      "label": "Bondi Beach surf lesson",
      "costUSD": 90,
      "happy": 7,
      "health": 3,
      "hours": 4
    },
    {
      "id": "harbour",
      "label": "Sydney Harbour bridge climb",
      "costUSD": 250,
      "happy": 10,
      "health": 2,
      "hours": 4
    },
    {
      "id": "blue_mtn",
      "label": "Blue Mountains luxury tour",
      "costUSD": 200,
      "happy": 8,
      "smarts": 2,
      "hours": 10
    },
    {
      "id": "reef",
      "label": "Great Barrier Reef dive",
      "costUSD": 450,
      "happy": 12,
      "health": 2,
      "hours": 8
    }
  ],
  "zaf": [
    {
      "id": "safari_zaf",
      "label": "Kruger private lodge safari",
      "costUSD": 600,
      "happy": 12,
      "social": 3,
      "hours": 10
    },
    {
      "id": "table",
      "label": "Table Mountain cable car",
      "costUSD": 80,
      "happy": 6,
      "health": 2,
      "hours": 3
    },
    {
      "id": "wine_zaf",
      "label": "Stellenbosch gourmet wine",
      "costUSD": 200,
      "happy": 8,
      "social": 4,
      "hours": 8
    },
    {
      "id": "shark",
      "label": "Great White shark cage dive",
      "costUSD": 250,
      "happy": 10,
      "social": 3,
      "hours": 6
    }
  ],
  "ken": [
    {
      "id": "maasai",
      "label": "Maasai Mara migration safari",
      "costUSD": 800,
      "happy": 15,
      "social": 3,
      "hours": 12
    },
    {
      "id": "balloon_ke",
      "label": "Hot air balloon + champagne",
      "costUSD": 550,
      "happy": 13,
      "social": 4,
      "hours": 4
    },
    {
      "id": "giraffe",
      "label": "Giraffe Manor breakfast",
      "costUSD": 200,
      "happy": 10,
      "social": 3,
      "hours": 3
    }
  ],
  "mex": [
    {
      "id": "chichen",
      "label": "Chichen Itza & Cenote",
      "costUSD": 120,
      "happy": 8,
      "smarts": 4,
      "hours": 8
    },
    {
      "id": "tulum",
      "label": "Tulum ruins & beach club",
      "costUSD": 150,
      "happy": 9,
      "social": 4,
      "hours": 8
    },
    {
      "id": "food_mex",
      "label": "Authentic street taco tour",
      "costUSD": 60,
      "happy": 7,
      "social": 3,
      "hours": 3
    }
  ],
  "bra": [
    {
      "id": "christ",
      "label": "Christ the Redeemer train",
      "costUSD": 80,
      "happy": 7,
      "social": 2,
      "hours": 4
    },
    {
      "id": "sugarloaf",
      "label": "Sugarloaf Mountain cable car",
      "costUSD": 70,
      "happy": 7,
      "social": 2,
      "hours": 3
    },
    {
      "id": "carnival",
      "label": "Sambadrome Parade tickets",
      "costUSD": 400,
      "happy": 12,
      "social": 8,
      "hours": 8,
      "seasonal": [
        "winter"
      ]
    },
    {
      "id": "copacabana",
      "label": "Copacabana beach day",
      "costUSD": 30,
      "happy": 6,
      "social": 4,
      "hours": 6
    }
  ]
};
export const V1_VENUES = [{"name": "Abou El Sid", "country": "egy", "city": "Cairo", "venueKind": "restaurant", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "family"], "founded": 2000, "availableFrom": 2000, "availableTo": 9999, "expansion": "11k", "id": "x-venue-abou-el-sid", "kind": "venue"}, {"name": "Abou Tarek", "country": "egy", "city": "Cairo", "venueKind": "restaurant", "priceTier": 1, "quality": 7, "goodFor": ["friends", "family", "solo"], "founded": 1950, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Famous downtown koshary house.", "id": "x-venue-abou-tarek", "kind": "venue"}, {"name": "Caf\u00e9 Riche", "country": "egy", "city": "Cairo", "venueKind": "cafe", "priceTier": 2, "quality": 7, "goodFor": ["friends", "solo", "business"], "founded": 1908, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Downtown literary caf\u00e9, a meeting place for writers and politicians for a century.", "id": "x-venue-cafe-riche", "kind": "venue"}, {"name": "El Fishawy", "country": "egy", "city": "Cairo", "venueKind": "cafe", "priceTier": 1, "quality": 8, "goodFor": ["friends", "solo", "family"], "founded": 1773, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Khan el-Khalili coffeehouse, one of the oldest caf\u00e9s in Cairo.", "id": "x-venue-el-fishawy", "kind": "venue"}, {"name": "Gezira Sporting Club", "country": "egy", "city": "Cairo", "venueKind": "sports-club", "priceTier": 4, "quality": 8, "goodFor": ["friends", "family", "solo"], "founded": 1882, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Members club on Gezira Island: tennis, squash, pool, gardens.", "id": "x-venue-gezira-club", "kind": "venue"}, {"name": "Kempinski Nile Hotel Cairo", "country": "egy", "city": "Cairo", "venueKind": "hotel", "priceTier": 5, "quality": 9, "goodFor": ["date", "family", "business"], "founded": 2010, "availableFrom": 2010, "availableTo": 9999, "expansion": "11k", "id": "x-venue-kempinski-nile", "kind": "venue"}, {"name": "The Ivy", "country": "gbr", "city": "London", "venueKind": "restaurant", "priceTier": 4, "quality": 9, "goodFor": ["date", "business", "friends"], "founded": 1917, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "West End institution; a special-occasion dinner, not a weeknight one.", "id": "x-venue-the-ivy", "kind": "venue"}, {"name": "Costa Coffee", "country": "gbr", "city": "London", "venueKind": "cafe", "priceTier": 2, "quality": 7, "goodFor": ["friends", "solo", "business"], "founded": 1971, "availableFrom": 1971, "availableTo": 9999, "expansion": "11k", "note": "First Costa shop opened in London in 1971.", "id": "x-venue-costa-coffee", "kind": "venue"}, {"name": "Fitness First", "country": "gbr", "city": "London", "venueKind": "gym", "priceTier": 3, "quality": 7, "goodFor": ["solo", "friends"], "founded": 1993, "availableFrom": 1993, "availableTo": 9999, "expansion": "11k", "note": "Chain founded in Bournemouth in 1993.", "id": "x-venue-fitness-first", "kind": "venue"}, {"name": "All England Lawn Tennis Club", "country": "gbr", "city": "London", "venueKind": "sports-club", "priceTier": 5, "quality": 9, "goodFor": ["friends", "family", "solo"], "founded": 1868, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Founded 1868 as a croquet club; Wimbledon tennis from 1877. Membership is famously hard to get.", "id": "x-venue-all-england-club", "kind": "venue"}, {"name": "The Connaught", "country": "gbr", "city": "London", "venueKind": "hotel", "priceTier": 5, "quality": 9, "goodFor": ["date", "business", "family"], "founded": 1815, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Opened 1815 as the Prince of Saxe Coburg Hotel; renamed The Connaught in 1917.", "id": "x-venue-the-connaught", "kind": "venue"}, {"name": "Odeon Leicester Square", "country": "gbr", "city": "London", "venueKind": "cinema", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "family"], "founded": 1937, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "London premiere cinema; red-carpet screenings.", "id": "x-venue-odeon-leicester-sq", "kind": "venue"}, {"name": "Katz's Delicatessen", "country": "usa", "city": "New York", "venueKind": "restaurant", "priceTier": 2, "quality": 8, "goodFor": ["friends", "family", "solo"], "founded": 1888, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Lower East Side deli institution.", "id": "x-venue-katzs", "kind": "venue"}, {"name": "Starbucks", "country": "usa", "city": "Seattle", "venueKind": "cafe", "priceTier": 2, "quality": 7, "goodFor": ["friends", "solo", "business"], "founded": 1971, "availableFrom": 1971, "availableTo": 9999, "expansion": "11k", "note": "First store opened in Seattle in 1971.", "id": "x-venue-starbucks", "kind": "venue"}, {"name": "Gold's Gym", "country": "usa", "city": "Los Angeles", "venueKind": "gym", "priceTier": 3, "quality": 8, "goodFor": ["solo", "friends"], "founded": 1965, "availableFrom": 1965, "availableTo": 9999, "expansion": "11k", "note": "Founded in Venice, California in 1965.", "id": "x-venue-golds-gym", "kind": "venue"}, {"name": "New York Athletic Club", "country": "usa", "city": "New York", "venueKind": "sports-club", "priceTier": 4, "quality": 8, "goodFor": ["friends", "family", "solo"], "founded": 1868, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Private athletic club: pool, gym, squash, dining rooms.", "id": "x-venue-nyac", "kind": "venue"}, {"name": "The Plaza Hotel", "country": "usa", "city": "New York", "venueKind": "hotel", "priceTier": 5, "quality": 9, "goodFor": ["date", "business", "family"], "founded": 1907, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "id": "x-venue-plaza", "kind": "venue"}, {"name": "TCL Chinese Theatre", "country": "usa", "city": "Los Angeles", "venueKind": "cinema", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "family"], "founded": 1927, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Opened 1927 as Grauman's Chinese Theatre; Hollywood premiere house.", "id": "x-venue-tcl-chinese", "kind": "venue"}, {"name": "Schwartz's", "country": "can", "city": "Montreal", "venueKind": "restaurant", "priceTier": 2, "quality": 8, "goodFor": ["friends", "family", "solo"], "founded": 1928, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Montreal smoked-meat deli on Saint-Laurent.", "id": "x-venue-schwartzs", "kind": "venue"}, {"name": "Second Cup Coffee Co.", "country": "can", "city": "Toronto", "venueKind": "cafe", "priceTier": 2, "quality": 7, "goodFor": ["friends", "solo", "business"], "founded": 1975, "availableFrom": 1975, "availableTo": 9999, "expansion": "11k", "note": "Canadian coffee chain founded in Toronto in 1975.", "id": "x-venue-second-cup", "kind": "venue"}, {"name": "GoodLife Fitness", "country": "can", "city": "London, Ontario", "venueKind": "gym", "priceTier": 3, "quality": 7, "goodFor": ["solo", "friends"], "founded": 1979, "availableFrom": 1979, "availableTo": 9999, "expansion": "11k", "note": "Founded in London, Ontario in 1979; Canada's largest gym chain.", "id": "x-venue-goodlife", "kind": "venue"}, {"name": "Fairmont Banff Springs", "country": "can", "city": "Banff", "venueKind": "hotel", "priceTier": 5, "quality": 9, "goodFor": ["date", "family", "business"], "founded": 1888, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Castle in the Rockies; a holiday in itself.", "id": "x-venue-fairmont-banff", "kind": "venue"}, {"name": "TIFF Bell Lightbox", "country": "can", "city": "Toronto", "venueKind": "cinema", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "family"], "founded": 2010, "availableFrom": 2010, "availableTo": 9999, "expansion": "11k", "note": "Toronto International Film Festival home cinema.", "id": "x-venue-tiff-lightbox", "kind": "venue"}, {"name": "Stanley Park", "country": "can", "city": "Vancouver", "venueKind": "park", "priceTier": 1, "quality": 9, "goodFor": ["family", "friends", "solo", "date"], "founded": 1888, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Seawall, beaches and forest in the middle of the city. Free.", "id": "x-venue-stanley-park", "kind": "venue"}, {"name": "Zur Letzten Instanz", "country": "deu", "city": "Berlin", "venueKind": "restaurant", "priceTier": 2, "quality": 8, "goodFor": ["friends", "family", "date"], "founded": 1621, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Berlin's oldest restaurant.", "id": "x-venue-zur-letzten-instanz", "kind": "venue"}, {"name": "Caf\u00e9 Einstein Stammhaus", "country": "deu", "city": "Berlin", "venueKind": "cafe", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "business"], "founded": 1978, "availableFrom": 1978, "availableTo": 9999, "expansion": "11k", "note": "Classic Viennese-style caf\u00e9 on Kurf\u00fcrstenstra\u00dfe.", "id": "x-venue-cafe-einstein", "kind": "venue"}, {"name": "McFIT", "country": "deu", "city": "W\u00fcrzburg", "venueKind": "gym", "priceTier": 2, "quality": 7, "goodFor": ["solo", "friends"], "founded": 1997, "availableFrom": 1997, "availableTo": 9999, "expansion": "11k", "note": "German budget gym chain founded in W\u00fcrzburg in 1997.", "id": "x-venue-mcfit", "kind": "venue"}, {"name": "Hotel Adlon Kempinski", "country": "deu", "city": "Berlin", "venueKind": "hotel", "priceTier": 5, "quality": 9, "goodFor": ["date", "business", "family"], "founded": 1997, "availableFrom": 1997, "availableTo": 9999, "expansion": "11k", "note": "Original Adlon opened 1907 and was destroyed in the war; the hotel was rebuilt and reopened on the same site in 1997.", "id": "x-venue-hotel-adlon", "kind": "venue"}, {"name": "Kino International", "country": "deu", "city": "Berlin", "venueKind": "cinema", "priceTier": 2, "quality": 8, "goodFor": ["date", "friends", "family"], "founded": 1963, "availableFrom": 1963, "availableTo": 9999, "expansion": "11k", "note": "Karl-Marx-Allee premiere cinema, opened 1963.", "id": "x-venue-kino-international", "kind": "venue"}, {"name": "Tiergarten", "country": "deu", "city": "Berlin", "venueKind": "park", "priceTier": 1, "quality": 9, "goodFor": ["family", "friends", "solo", "date"], "founded": 1830, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Landscaped as a public park in the 1830s; Berlin's green heart. Free.", "id": "x-venue-tiergarten", "kind": "venue"}, {"name": "Le Procope", "country": "fra", "city": "Paris", "venueKind": "restaurant", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "business"], "founded": 1686, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Paris's oldest caf\u00e9-restaurant.", "id": "x-venue-le-procope", "kind": "venue"}, {"name": "Caf\u00e9 de Flore", "country": "fra", "city": "Paris", "venueKind": "cafe", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "solo"], "founded": 1887, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Saint-Germain caf\u00e9; writers, philosophers and people-watching.", "id": "x-venue-cafe-de-flore", "kind": "venue"}, {"name": "Racing Club de France", "country": "fra", "city": "Paris", "venueKind": "sports-club", "priceTier": 4, "quality": 8, "goodFor": ["friends", "family", "solo"], "founded": 1882, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Multi-sport members club: tennis, swimming, athletics.", "id": "x-venue-racing-club", "kind": "venue"}, {"name": "H\u00f4tel Ritz Paris", "country": "fra", "city": "Paris", "venueKind": "hotel", "priceTier": 5, "quality": 10, "goodFor": ["date", "business", "family"], "founded": 1898, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Place Vend\u00f4me palace hotel.", "id": "x-venue-ritz-paris", "kind": "venue"}, {"name": "Le Grand Rex", "country": "fra", "city": "Paris", "venueKind": "cinema", "priceTier": 3, "quality": 9, "goodFor": ["date", "friends", "family"], "founded": 1932, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Europe's largest cinema auditorium; premieres and spectacles.", "id": "x-venue-grand-rex", "kind": "venue"}, {"name": "Jardin du Luxembourg", "country": "fra", "city": "Paris", "venueKind": "park", "priceTier": 1, "quality": 9, "goodFor": ["family", "friends", "solo", "date"], "founded": 1612, "availableFrom": 1960, "availableTo": 9999, "expansion": "11k", "note": "Created for Marie de' Medici in 1612; lawns, chairs, ponds, tennis. Free.", "id": "x-venue-luxembourg-gardens", "kind": "venue"}, {"name": "Al Baik", "country": "sau", "city": "Jeddah", "venueKind": "restaurant", "priceTier": 1, "quality": 8, "goodFor": ["friends", "family", "solo"], "founded": 1974, "availableFrom": 1974, "availableTo": 9999, "expansion": "11k", "note": "Beloved Saudi broasted-chicken chain; queues are part of the experience.", "id": "x-venue-al-baik", "kind": "venue"}, {"name": "Barn's Caf\u00e9", "country": "sau", "city": "Jeddah", "venueKind": "cafe", "priceTier": 2, "quality": 7, "goodFor": ["friends", "solo", "business"], "founded": 1992, "availableFrom": 1992, "availableTo": 9999, "expansion": "11k", "note": "First Saudi coffee chain, founded in Jeddah in 1992.", "id": "x-venue-barns-cafe", "kind": "venue"}, {"name": "Fitness Time", "country": "sau", "city": "Riyadh", "venueKind": "gym", "priceTier": 3, "quality": 7, "goodFor": ["solo", "friends"], "founded": 2007, "availableFrom": 2007, "availableTo": 9999, "expansion": "11k", "note": "Saudi gym chain launched in 2007.", "id": "x-venue-fitness-time", "kind": "venue"}, {"name": "Ritz-Carlton Riyadh", "country": "sau", "city": "Riyadh", "venueKind": "hotel", "priceTier": 5, "quality": 9, "goodFor": ["date", "business", "family"], "founded": 2011, "availableFrom": 2011, "availableTo": 9999, "expansion": "11k", "note": "Palace hotel; the address for a big occasion in Riyadh.", "id": "x-venue-ritz-carlton-riyadh", "kind": "venue"}, {"name": "VOX Cinemas Riyadh Park", "country": "sau", "city": "Riyadh", "venueKind": "cinema", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "family"], "founded": 2018, "availableFrom": 2018, "availableTo": 9999, "expansion": "11k", "note": "Opened 2018, among the first cinemas after Saudi Arabia lifted the 35-year cinema ban.", "id": "x-venue-vox-riyadh-park", "kind": "venue"}, {"name": "King Abdullah Park", "country": "sau", "city": "Riyadh", "venueKind": "park", "priceTier": 1, "quality": 8, "goodFor": ["family", "friends", "solo"], "founded": 2013, "availableFrom": 2013, "availableTo": 9999, "expansion": "11k", "note": "Riyadh's big central park: lawns, lake, dancing fountain. Free.", "id": "x-venue-king-abdullah-park", "kind": "venue"}, {"name": "Ravi Restaurant", "country": "uae", "city": "Dubai", "venueKind": "restaurant", "priceTier": 1, "quality": 8, "goodFor": ["friends", "family", "solo"], "founded": 1978, "availableFrom": 1978, "availableTo": 9999, "expansion": "11k", "note": "Satwa Pakistani restaurant; cheap, crowded, loved.", "id": "x-venue-ravi", "kind": "venue"}, {"name": "GymNation", "country": "uae", "city": "Dubai", "venueKind": "gym", "priceTier": 3, "quality": 8, "goodFor": ["solo", "friends"], "founded": 2017, "availableFrom": 2017, "availableTo": 9999, "expansion": "11k", "note": "UAE budget gym chain founded in Dubai in 2017.", "id": "x-venue-gymnation", "kind": "venue"}, {"name": "Dubai Creek Golf & Yacht Club", "country": "uae", "city": "Dubai", "venueKind": "sports-club", "priceTier": 5, "quality": 9, "goodFor": ["friends", "family", "business"], "founded": 1993, "availableFrom": 1993, "availableTo": 9999, "expansion": "11k", "note": "Sail-shaped clubhouse on the Creek: golf, marina, restaurants.", "id": "x-venue-dubai-creek-golf", "kind": "venue"}, {"name": "Jumeirah Beach Hotel", "country": "uae", "city": "Dubai", "venueKind": "hotel", "priceTier": 5, "quality": 9, "goodFor": ["date", "family", "business"], "founded": 1997, "availableFrom": 1997, "availableTo": 9999, "expansion": "11k", "note": "Wave-shaped beach hotel next to the Burj Al Arab.", "id": "x-venue-jumeirah-beach-hotel", "kind": "venue"}, {"name": "VOX Cinemas Mall of the Emirates", "country": "uae", "city": "Dubai", "venueKind": "cinema", "priceTier": 3, "quality": 8, "goodFor": ["date", "friends", "family"], "founded": 2005, "availableFrom": 2005, "availableTo": 9999, "expansion": "11k", "note": "Multiplex in the Mall of the Emirates, which opened in 2005.", "id": "x-venue-vox-moe", "kind": "venue"}, {"name": "Zabeel Park", "country": "uae", "city": "Dubai", "venueKind": "park", "priceTier": 1, "quality": 8, "goodFor": ["family", "friends", "solo"], "founded": 2005, "availableFrom": 2005, "availableTo": 9999, "expansion": "11k", "note": "Dubai's large central park: lawns, lake, jogging track, Friday market. Free.", "id": "x-venue-zabeel-park", "kind": "venue"}];
export const V1_HOLIDAYS = [{"name": "New Year's Day", "country": "egy", "month": 1, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-egy-new-year", "kind": "holiday"}, {"name": "Coptic Christmas", "country": "egy", "month": 1, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 7, "note": "Coptic Orthodox Christmas, 7 January.", "id": "x-hol-egy-coptic-christmas", "kind": "holiday"}, {"name": "January 25 Revolution Day", "country": "egy", "month": 1, "holidayKind": "national", "availableFrom": 2011, "availableTo": 9999, "expansion": "11l", "day": 25, "note": "Marks the 25 January 2011 revolution; did not exist before 2011.", "id": "x-hol-egy-jan25", "kind": "holiday"}, {"name": "Labour Day", "country": "egy", "month": 5, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-egy-labour", "kind": "holiday"}, {"name": "July 23 Revolution Day", "country": "egy", "month": 7, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 23, "note": "Marks the 1952 revolution.", "id": "x-hol-egy-july23", "kind": "holiday"}, {"name": "Armed Forces Day", "country": "egy", "month": 10, "holidayKind": "national", "availableFrom": 1973, "availableTo": 9999, "expansion": "11l", "day": 6, "note": "Marks the 6 October 1973 crossing; first observed 1973.", "id": "x-hol-egy-oct6", "kind": "holiday"}, {"name": "Eid al-Fitr", "country": "egy", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "End of Ramadan (1 Shawwal). Lunar: moves ~11 days earlier each Gregorian year; month is approximate only, never a fixed date.", "id": "x-hol-egy-eid-fitr", "kind": "holiday"}, {"name": "Eid al-Adha", "country": "egy", "month": 6, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "Feast of Sacrifice (10 Dhu al-Hijjah). Lunar: moves every year; month is approximate only.", "id": "x-hol-egy-eid-adha", "kind": "holiday"}, {"name": "Islamic New Year", "country": "egy", "month": 7, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "1 Muharram. Lunar: moves every year; month is approximate only.", "id": "x-hol-egy-islamic-new-year", "kind": "holiday"}, {"name": "New Year's Day", "country": "gbr", "month": 1, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-gbr-new-year", "kind": "holiday"}, {"name": "Good Friday", "country": "gbr", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Friday before Easter Sunday; date moves with Easter.", "id": "x-hol-gbr-good-friday", "kind": "holiday"}, {"name": "Easter Monday", "country": "gbr", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Monday after Easter Sunday; date moves with Easter. England, Wales and Northern Ireland.", "id": "x-hol-gbr-easter-monday", "kind": "holiday"}, {"name": "Early May Bank Holiday", "country": "gbr", "month": 5, "holidayKind": "secular", "availableFrom": 1978, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "First Monday in May; introduced 1978.", "id": "x-hol-gbr-early-may", "kind": "holiday"}, {"name": "Spring Bank Holiday", "country": "gbr", "month": 5, "holidayKind": "secular", "availableFrom": 1971, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Last Monday in May (replaced Whit Monday from 1971).", "id": "x-hol-gbr-spring", "kind": "holiday"}, {"name": "Christmas Day", "country": "gbr", "month": 12, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 25, "id": "x-hol-gbr-christmas", "kind": "holiday"}, {"name": "Boxing Day", "country": "gbr", "month": 12, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 26, "id": "x-hol-gbr-boxing", "kind": "holiday"}, {"name": "New Year's Day", "country": "usa", "month": 1, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-usa-new-year", "kind": "holiday"}, {"name": "Martin Luther King Jr. Day", "country": "usa", "month": 1, "holidayKind": "national", "availableFrom": 1986, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Third Monday in January; first observed as a federal holiday in 1986.", "id": "x-hol-usa-mlk", "kind": "holiday"}, {"name": "Memorial Day", "country": "usa", "month": 5, "holidayKind": "national", "availableFrom": 1971, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Last Monday in May; fixed to the last Monday by the Uniform Monday Holiday Act, effective 1971.", "id": "x-hol-usa-memorial", "kind": "holiday"}, {"name": "Juneteenth", "country": "usa", "month": 6, "holidayKind": "national", "availableFrom": 2021, "availableTo": 9999, "expansion": "11l", "day": 19, "note": "Federal holiday from 2021 (Juneteenth National Independence Day Act). Not a federal holiday before 2021.", "id": "x-hol-usa-juneteenth", "kind": "holiday"}, {"name": "Independence Day", "country": "usa", "month": 7, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 4, "id": "x-hol-usa-independence", "kind": "holiday"}, {"name": "Labor Day", "country": "usa", "month": 9, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "First Monday in September.", "id": "x-hol-usa-labour", "kind": "holiday"}, {"name": "Thanksgiving Day", "country": "usa", "month": 11, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Fourth Thursday in November.", "id": "x-hol-usa-thanksgiving", "kind": "holiday"}, {"name": "Veterans Day", "country": "usa", "month": 11, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 11, "note": "11 November; honours military veterans.", "id": "x-hol-usa-veterans", "kind": "holiday"}, {"name": "Christmas Day", "country": "usa", "month": 12, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 25, "id": "x-hol-usa-christmas", "kind": "holiday"}, {"name": "New Year's Day", "country": "can", "month": 1, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-can-new-year", "kind": "holiday"}, {"name": "Good Friday", "country": "can", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Friday before Easter Sunday; date moves with Easter.", "id": "x-hol-can-good-friday", "kind": "holiday"}, {"name": "Canada Day", "country": "can", "month": 7, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "note": "1 July; called Dominion Day until renamed Canada Day in 1982.", "id": "x-hol-can-canada-day", "kind": "holiday"}, {"name": "Labour Day", "country": "can", "month": 9, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "First Monday in September.", "id": "x-hol-can-labour", "kind": "holiday"}, {"name": "National Day for Truth and Reconciliation", "country": "can", "month": 9, "holidayKind": "national", "availableFrom": 2021, "availableTo": 9999, "expansion": "11l", "day": 30, "note": "30 September; federal statutory holiday from 2021.", "id": "x-hol-can-truth", "kind": "holiday"}, {"name": "Thanksgiving Day", "country": "can", "month": 10, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Second Monday in October.", "id": "x-hol-can-thanksgiving", "kind": "holiday"}, {"name": "Remembrance Day", "country": "can", "month": 11, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 11, "note": "11 November; honours fallen soldiers.", "id": "x-hol-can-remembrance", "kind": "holiday"}, {"name": "Christmas Day", "country": "can", "month": 12, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 25, "id": "x-hol-can-christmas", "kind": "holiday"}, {"name": "New Year's Day", "country": "deu", "month": 1, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-deu-new-year", "kind": "holiday"}, {"name": "Good Friday", "country": "deu", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Karfreitag; Friday before Easter Sunday.", "id": "x-hol-deu-good-friday", "kind": "holiday"}, {"name": "Easter Monday", "country": "deu", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Ostermontag; Monday after Easter Sunday.", "id": "x-hol-deu-easter-monday", "kind": "holiday"}, {"name": "Labour Day", "country": "deu", "month": 5, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "note": "Tag der Arbeit.", "id": "x-hol-deu-labour", "kind": "holiday"}, {"name": "German Unity Day", "country": "deu", "month": 10, "holidayKind": "national", "availableFrom": 1990, "availableTo": 9999, "expansion": "11l", "day": 3, "note": "Tag der Deutschen Einheit; marks reunification on 3 October 1990. Did not exist before 1990.", "id": "x-hol-deu-unity", "kind": "holiday"}, {"name": "Christmas Day", "country": "deu", "month": 12, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 25, "id": "x-hol-deu-christmas", "kind": "holiday"}, {"name": "Second Day of Christmas", "country": "deu", "month": 12, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 26, "note": "Zweiter Weihnachtstag.", "id": "x-hol-deu-second-christmas", "kind": "holiday"}, {"name": "New Year's Day", "country": "fra", "month": 1, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-fra-new-year", "kind": "holiday"}, {"name": "Easter Monday", "country": "fra", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "movable": true, "note": "Lundi de P\u00e2ques; Monday after Easter Sunday.", "id": "x-hol-fra-easter-monday", "kind": "holiday"}, {"name": "Labour Day", "country": "fra", "month": 5, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "note": "F\u00eate du Travail.", "id": "x-hol-fra-labour", "kind": "holiday"}, {"name": "Victory Day", "country": "fra", "month": 5, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 8, "note": "Marks the end of World War II in Europe, 8 May 1945.", "id": "x-hol-fra-victory", "kind": "holiday"}, {"name": "Bastille Day", "country": "fra", "month": 7, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 14, "note": "F\u00eate nationale; 14 July.", "id": "x-hol-fra-bastille", "kind": "holiday"}, {"name": "Assumption of Mary", "country": "fra", "month": 8, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 15, "note": "Assomption, 15 August.", "id": "x-hol-fra-assumption", "kind": "holiday"}, {"name": "All Saints' Day", "country": "fra", "month": 11, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "note": "Toussaint, 1 November.", "id": "x-hol-fra-all-saints", "kind": "holiday"}, {"name": "Armistice Day", "country": "fra", "month": 11, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 11, "note": "Marks the 11 November 1918 armistice.", "id": "x-hol-fra-armistice", "kind": "holiday"}, {"name": "Christmas Day", "country": "fra", "month": 12, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 25, "id": "x-hol-fra-christmas", "kind": "holiday"}, {"name": "Founding Day", "country": "sau", "month": 2, "holidayKind": "national", "availableFrom": 2022, "availableTo": 9999, "expansion": "11l", "day": 22, "note": "Marks the founding of the first Saudi state in 1727; public holiday from 2022.", "id": "x-hol-sau-founding", "kind": "holiday"}, {"name": "Saudi National Day", "country": "sau", "month": 9, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 23, "note": "Marks the unification of the Kingdom in 1932.", "id": "x-hol-sau-national", "kind": "holiday"}, {"name": "Eid al-Fitr", "country": "sau", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "End of Ramadan (1 Shawwal). Lunar: moves every year; month is approximate only.", "id": "x-hol-sau-eid-fitr", "kind": "holiday"}, {"name": "Eid al-Adha", "country": "sau", "month": 6, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "Feast of Sacrifice (10 Dhu al-Hijjah). Lunar: moves every year; month is approximate only.", "id": "x-hol-sau-eid-adha", "kind": "holiday"}, {"name": "Islamic New Year", "country": "sau", "month": 7, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "1 Muharram. Lunar: moves every year; month is approximate only.", "id": "x-hol-sau-islamic-new-year", "kind": "holiday"}, {"name": "New Year's Day", "country": "uae", "month": 1, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-uae-new-year", "kind": "holiday"}, {"name": "Eid al-Fitr", "country": "uae", "month": 4, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "End of Ramadan (1 Shawwal). Lunar: moves every year; month is approximate only.", "id": "x-hol-uae-eid-fitr", "kind": "holiday"}, {"name": "Eid al-Adha", "country": "uae", "month": 6, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "Feast of Sacrifice (10 Dhu al-Hijjah). Lunar: moves every year; month is approximate only.", "id": "x-hol-uae-eid-adha", "kind": "holiday"}, {"name": "Islamic New Year", "country": "uae", "month": 7, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "1 Muharram. Lunar: moves every year; month is approximate only.", "id": "x-hol-uae-islamic-new-year", "kind": "holiday"}, {"name": "Prophet's Birthday", "country": "uae", "month": 9, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "lunar": true, "note": "Mawlid al-Nabi (12 Rabi al-Awwal). Lunar: moves every year; month is approximate only.", "id": "x-hol-uae-mawlid", "kind": "holiday"}, {"name": "Commemoration Day", "country": "uae", "month": 12, "holidayKind": "national", "availableFrom": 2015, "availableTo": 9999, "expansion": "11l", "day": 1, "note": "Honours fallen Emirati soldiers; public holiday from 2015 (observed 1 December).", "id": "x-hol-uae-commemoration", "kind": "holiday"}, {"name": "UAE National Day", "country": "uae", "month": 12, "holidayKind": "national", "availableFrom": 1971, "availableTo": 9999, "expansion": "11l", "day": 2, "note": "Marks the formation of the UAE on 2 December 1971. Did not exist before 1971.", "id": "x-hol-uae-national", "kind": "holiday"}, {"name": "New Year's Day", "country": "ita", "month": 1, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "id": "x-hol-ita-new-year", "kind": "holiday"}, {"name": "Epiphany", "country": "ita", "month": 1, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 6, "id": "x-hol-ita-epiphany", "kind": "holiday"}, {"name": "Liberation Day", "country": "ita", "month": 4, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 25, "note": "Marks the liberation from Nazi occupation in 1945; public holiday from 1949 (before the playable era, so availableFrom is clamped to 1960).", "id": "x-hol-ita-liberation", "kind": "holiday"}, {"name": "Labour Day", "country": "ita", "month": 5, "holidayKind": "secular", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 1, "note": "Festa dei Lavoratori.", "id": "x-hol-ita-labour", "kind": "holiday"}, {"name": "Republic Day", "country": "ita", "month": 6, "holidayKind": "national", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 2, "note": "Festa della Repubblica; marks the 1946 referendum that created the Republic.", "id": "x-hol-ita-republic", "kind": "holiday"}, {"name": "Assumption of Mary", "country": "ita", "month": 8, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 15, "note": "Ferragosto, 15 August.", "id": "x-hol-ita-assumption", "kind": "holiday"}, {"name": "Christmas Day", "country": "ita", "month": 12, "holidayKind": "religious", "availableFrom": 1960, "availableTo": 9999, "expansion": "11l", "day": 25, "id": "x-hol-ita-christmas", "kind": "holiday"}];

export const V1_ACTIVITIES = [
  {
    "id": "jog",
    "group": "body",
    "label": "Go for a run",
    "icon": "fitness",
    "costEgp": 0,
    "repeat": "month",
    "minAge": 4,
    "effects": {
      "health": 2,
      "happiness": 1
    },
    "looks": 1,
    "line": "A run round the block, and your legs feel stronger."
  },
  {
    "id": "gym",
    "group": "body",
    "label": "Gym session",
    "icon": "fitness",
    "costEgp": 900,
    "repeat": "month",
    "minAge": 14,
    "effects": {
      "health": 3,
      "happiness": 1
    },
    "looks": 3,
    "line": "Two hours of weights and the mirror looks different by Friday."
  },
  {
    "id": "swim",
    "group": "body",
    "label": "Swim at the club",
    "icon": "swim",
    "costEgp": 1500,
    "repeat": "month",
    "minAge": 4,
    "effects": {
      "health": 3,
      "social": 1,
      "happiness": 2
    },
    "looks": 2,
    "line": "Lanes, chlorine, and a proper appetite afterwards."
  },
  {
    "id": "read",
    "group": "mind",
    "label": "Read a book",
    "icon": "books",
    "costEgp": 700,
    "repeat": "month",
    "minAge": 3,
    "effects": {
      "smarts": 2,
      "happiness": 1
    },
    "line": "Ninety pages read. Some of it stays."
  },
  {
    "id": "course",
    "group": "mind",
    "label": "Take an evening course",
    "icon": "diploma",
    "costEgp": 6000,
    "repeat": "year",
    "minAge": 16,
    "effects": {
      "smarts": 5,
      "happiness": 1
    },
    "line": "A certificate, some new people, and a thing you can now do."
  },
  {
    "id": "meditate",
    "group": "mind",
    "label": "Meditate",
    "icon": "spa",
    "costEgp": 0,
    "repeat": "month",
    "minAge": 8,
    "effects": {
      "happiness": 2,
      "health": 1,
      "stress": -6
    },
    "line": "Twenty quiet minutes. The noise in your head gets smaller."
  },
  {
    "id": "haircut",
    "group": "looks",
    "label": "Barber / salon",
    "icon": "spa",
    "costEgp": 1200,
    "repeat": "month",
    "minAge": 3,
    "effects": {
      "happiness": 1
    },
    "looks": 4,
    "line": "Fresh cut, and strangers treat you differently for a week."
  },
  {
    "id": "skincare",
    "group": "looks",
    "label": "Skin care routine",
    "icon": "spa",
    "costEgp": 900,
    "repeat": "month",
    "minAge": 12,
    "effects": {},
    "looks": 3,
    "line": "Clean face, no breakouts. It costs a little every month."
  },
  {
    "id": "dentist",
    "group": "looks",
    "label": "Dental checkup",
    "icon": "medical",
    "costEgp": 3500,
    "repeat": "year",
    "minAge": 4,
    "effects": {
      "health": 1,
      "happiness": 1
    },
    "looks": 2,
    "line": "Scale and polish. A smile you do not think about is a smile that works."
  },
  {
    "id": "hangout",
    "group": "social",
    "label": "Hang out with a friend",
    "icon": "handshake",
    "costEgp": 800,
    "repeat": "month",
    "minAge": 5,
    "effects": {
      "social": 3,
      "happiness": 2
    },
    "friend": true,
    "line": "No plan, three hours, and a bond that got the exercise it needed."
  },
  {
    "id": "club",
    "group": "social",
    "label": "Join a local club",
    "icon": "dice",
    "costEgp": 2500,
    "repeat": "year",
    "minAge": 14,
    "effects": {
      "social": 4,
      "happiness": 2
    },
    "line": "A room of strangers who are not strangers by the second Tuesday."
  },
  {
    "id": "volunteer",
    "group": "social",
    "label": "Volunteer",
    "icon": "handshake",
    "costEgp": 0,
    "repeat": "month",
    "minAge": 12,
    "effects": {
      "social": 2,
      "happiness": 3
    },
    "line": "A morning you did not get paid for, and a reason to be up for it."
  },
  {
    "id": "drink",
    "group": "vice",
    "label": "Night out drinking",
    "icon": "drink",
    "costEgp": 3000,
    "repeat": "month",
    "minAge": 21,
    "vice": "alcohol",
    "viceNoun": "a bottle that this country does not sell",
    "effects": {
      "happiness": 4,
      "health": -1,
      "social": 2
    },
    "looks": -1,
    "habit": "alcohol",
    "line": "Two beers become a bottle and a taxi home at two in the morning."
  },
  {
    "id": "smoke",
    "group": "vice",
    "label": "Smoke a pack",
    "icon": "cigarette",
    "costEgp": 1400,
    "repeat": "month",
    "minAge": 16,
    "effects": {
      "happiness": 1,
      "health": -3
    },
    "looks": -2,
    "habit": "smoking",
    "line": "Relief for four minutes, and a smell that stays on your coat."
  },
  {
    "id": "gamble",
    "group": "vice",
    "label": "Bet a day's pay",
    "icon": "party",
    "costEgp": 0,
    "repeat": "month",
    "minAge": 18,
    "vice": "gambling",
    "viceNoun": "money on an illegal table",
    "stake": true,
    "effects": {},
    "habit": "gambling",
    "line": "One day's pay on the table."
  },
  {
    "id": "lottery",
    "group": "vice",
    "label": "Lottery ticket",
    "icon": "ticket",
    "costEgp": 150,
    "repeat": "month",
    "minAge": 18,
    "vice": "lottery",
    "viceNoun": "a lottery ticket no state sells",
    "lottery": true,
    "effects": {
      "happiness": 1
    },
    "line": "A ticket, a number you will think about for six days."
  },
  {
    "id": "party",
    "group": "vice",
    "label": "Party all night",
    "icon": "party",
    "costEgp": 4000,
    "repeat": "month",
    "minAge": 16,
    "effects": {
      "happiness": 6,
      "health": -2,
      "social": 3
    },
    "looks": -1,
    "line": "Music until sunrise and a head that pays for it on Monday."
  }
];
export const V1_HABITS = {
  "alcohol": {
    "label": "Drinking",
    "icon": "drink",
    "activity": "drink",
    "dependencePerUse": 9,
    "fadePerYear": 5,
    "spendAtDependence": 40,
    "spendPayShare": 0.035,
    "healthPerYear": 2,
    "looksPerYear": 1,
    "rehabEgp": 60000,
    "relapseDependence": 45,
    "line": "Another year of drinking. It is on the household budget now."
  },
  "smoking": {
    "label": "Smoking",
    "icon": "cigarette",
    "activity": "smoke",
    "dependencePerUse": 12,
    "fadePerYear": 4,
    "spendAtDependence": 30,
    "spendPayShare": 0.05,
    "healthPerYear": 4,
    "looksPerYear": 2,
    "rehabEgp": 45000,
    "relapseDependence": 55,
    "line": "The pack is a standing cost now, and it shows on your skin and your breath."
  },
  "gambling": {
    "label": "Gambling",
    "icon": "dice",
    "activity": "gamble",
    "dependencePerUse": 8,
    "fadePerYear": 6,
    "spendAtDependence": 35,
    "spendPayShare": 0.08,
    "healthPerYear": 1,
    "looksPerYear": 1,
    "rehabEgp": 55000,
    "relapseDependence": 50,
    "line": "Chasing losses is not a hobby any more; the money goes whether you win or not."
  }
};
export const V1_CRIMES = [
  {
    "id": "shoplift",
    "label": "Shoplift",
    "icon": "shop",
    "minAge": 10,
    "payShare": 0.004,
    "risk": 0.2,
    "years": 0.5,
    "line": "Two things off a shelf and past the till before the assistant looks up."
  },
  {
    "id": "pickpocket",
    "label": "Pick a pocket",
    "icon": "hand",
    "minAge": 12,
    "payShare": 0.006,
    "risk": 0.26,
    "years": 1,
    "line": "A crowded market, a steady hand, and a wallet that is yours by the next corner."
  },
  {
    "id": "bike",
    "label": "Steal a bike",
    "icon": "bike",
    "minAge": 12,
    "payShare": 0.012,
    "risk": 0.24,
    "years": 1,
    "line": "Bolt cutters and ten seconds. Selling it on is the other half of the job."
  },
  {
    "id": "burgle",
    "label": "Burgle a home",
    "icon": "house",
    "minAge": 16,
    "payShare": 0.06,
    "risk": 0.34,
    "years": 3,
    "line": "A house that is not yours, drawings on the fridge that are not yours, and a tin of beans nobody opened."
  },
  {
    "id": "car",
    "label": "Steal a car",
    "icon": "car",
    "minAge": 18,
    "payShare": 0.12,
    "risk": 0.4,
    "years": 5,
    "gate": {
      "key": "smarts",
      "min": 55,
      "why": "you need a head for how a modern car is wired"
    },
    "line": "You are not keeping it. Somebody is paying half its value for papers it will never get."
  },
  {
    "id": "deal",
    "label": "Deal on the corner",
    "icon": "pill",
    "minAge": 16,
    "payShare": 0.1,
    "risk": 0.36,
    "years": 4,
    "gate": {
      "key": "social",
      "min": 45,
      "why": "you need the people who buy and the people who do not talk"
    },
    "line": "A steady little income and a phone that never stops going off."
  },
  {
    "id": "fraud",
    "label": "Run a scam",
    "icon": "card",
    "minAge": 18,
    "payShare": 0.18,
    "risk": 0.3,
    "years": 4,
    "gate": {
      "key": "smarts",
      "min": 60,
      "why": "the paperwork has to survive one look from an auditor"
    },
    "line": "A company that exists on paper and a service nobody receives."
  },
  {
    "id": "hack",
    "label": "Breach a bank",
    "icon": "laptop",
    "minAge": 16,
    "payShare": 0.25,
    "risk": 0.42,
    "years": 6,
    "gate": {
      "key": "smarts",
      "min": 75,
      "why": "this is not something you work out on a borrowed laptop"
    },
    "line": "An account number, a script, and a decimal point in the wrong place for somebody else."
  },
  {
    "id": "assault",
    "label": "Beat someone up",
    "icon": "hand",
    "minAge": 16,
    "payShare": 0,
    "risk": 0.3,
    "years": 4,
    "violent": true,
    "gate": {
      "key": "health",
      "min": 60,
      "why": "you are not in the shape to finish it"
    },
    "line": "There was no plan in it. There was only the moment, and then a lot of moments after."
  },
  {
    "id": "smuggle",
    "label": "Smuggle through customs",
    "icon": "shop",
    "minAge": 20,
    "payShare": 0.2,
    "risk": 0.33,
    "years": 6,
    "gate": {
      "key": "passports",
      "min": 1,
      "why": "you need a passport and a flight to put it through"
    },
    "line": "Taped inside a lining, a boring face at the right angle, and a green corridor."
  },
  {
    "id": "robbery",
    "label": "Armed robbery",
    "icon": "warning",
    "minAge": 20,
    "payShare": 0.3,
    "risk": 0.52,
    "years": 12,
    "violent": true,
    "gate": {
      "key": "health",
      "min": 55,
      "why": "you have to be able to run with it"
    },
    "line": "A shop, a counter, and the rest of your life decided in about ninety seconds."
  }
];
export const V1_CRIME_LAW = {
  "sau": {
    "police": 1.3,
    "severity": 1.45
  },
  "uae": {
    "police": 1.28,
    "severity": 1.3
  },
  "sgp": {
    "police": 1.4,
    "severity": 1.35
  },
  "jpn": {
    "police": 1.35,
    "severity": 1.25
  },
  "egy": {
    "police": 1.1,
    "severity": 1.1
  },
  "bra": {
    "police": 1.15,
    "severity": 1.15
  },
  "ind": {
    "police": 1,
    "severity": 1.05
  },
  "usa": {
    "police": 0.92,
    "severity": 1.15
  },
  "gbr": {
    "police": 0.95,
    "severity": 0.95
  },
  "aus": {
    "police": 0.92,
    "severity": 0.9
  },
  "fra": {
    "police": 0.95,
    "severity": 0.9
  },
  "ita": {
    "police": 0.95,
    "severity": 0.9
  },
  "deu": {
    "police": 0.95,
    "severity": 0.85
  },
  "can": {
    "police": 0.92,
    "severity": 0.85
  },
  "nld": {
    "police": 0.9,
    "severity": 0.75
  }
};
export const CIVIL_LAWSUITS = [
  {
    "id": "sue_employer_wages",
    "label": "Labor Court Claim (Unpaid Wages / End-of-Service Gratuity)",
    "lawyerFeeUsd": 850,
    "winProb": 0.78,
    "awardMonthsPay": 5
  },
  {
    "id": "sue_wrongful_dismissal",
    "label": "Wrongful Termination Compensation Suit",
    "lawyerFeeUsd": 1200,
    "winProb": 0.62,
    "awardMonthsPay": 4
  },
  {
    "id": "sue_landlord_deposit",
    "label": "Tenancy Deposit & Illegal Eviction Claim",
    "lawyerFeeUsd": 450,
    "winProb": 0.74,
    "awardUsd": 3200
  },
  {
    "id": "sue_scam_broker",
    "label": "Fraud & Visa-Broker Restitution Case",
    "lawyerFeeUsd": 600,
    "winProb": 0.52,
    "awardUsd": 4500
  }
];

export const V1_CHILD_NURSERIES = [
  {
    "id": "minimal",
    "label": "Basic nursery",
    "costEGP": 8000,
    "happiness": 1
  },
  {
    "id": "standard",
    "label": "Standard nursery",
    "costEGP": 25000,
    "happiness": 3
  },
  {
    "id": "premium",
    "label": "Premium nursery",
    "costEGP": 70000,
    "happiness": 6
  },
  {
    "id": "luxury",
    "label": "Luxury nursery",
    "costEGP": 200000,
    "happiness": 10
  },
  {
    "id": "organic",
    "label": "Eco-Organic Nursery Suite",
    "costEGP": 380000,
    "happiness": 15
  }
];
export const V1_CHILD_ACTIVITIES = [
  {
    "id": "soccer",
    "category": "sports",
    "label": "Soccer Club",
    "monthlyEGP": 1500,
    "smarts": 0,
    "social": 5,
    "health": 5,
    "happiness": 5
  },
  {
    "id": "swimming",
    "category": "sports",
    "label": "Swimming",
    "monthlyEGP": 2000,
    "smarts": 0,
    "social": 3,
    "health": 8,
    "happiness": 4
  },
  {
    "id": "karate",
    "category": "sports",
    "label": "Martial Arts",
    "monthlyEGP": 1800,
    "smarts": 0,
    "social": 3,
    "health": 5,
    "happiness": 3
  },
  {
    "id": "gymnastics",
    "category": "sports",
    "label": "Gymnastics",
    "monthlyEGP": 2500,
    "smarts": 0,
    "social": 2,
    "health": 5,
    "happiness": 3
  },
  {
    "id": "tennis",
    "category": "sports",
    "label": "Tennis Academy",
    "monthlyEGP": 3500,
    "smarts": 1,
    "social": 3,
    "health": 7,
    "happiness": 5
  },
  {
    "id": "basketball",
    "category": "sports",
    "label": "Basketball Team",
    "monthlyEGP": 1600,
    "smarts": 0,
    "social": 6,
    "health": 6,
    "happiness": 5
  },
  {
    "id": "horse_riding",
    "category": "sports",
    "label": "Equestrian / Horse Riding",
    "monthlyEGP": 6000,
    "smarts": 2,
    "social": 4,
    "health": 6,
    "happiness": 8
  },
  {
    "id": "ballet",
    "category": "art",
    "label": "Ballet Academy",
    "monthlyEGP": 3000,
    "smarts": 1,
    "social": 4,
    "health": 7,
    "happiness": 5
  },
  {
    "id": "piano",
    "category": "music",
    "label": "Piano Lessons",
    "monthlyEGP": 3000,
    "smarts": 5,
    "social": 0,
    "health": 0,
    "happiness": 3
  },
  {
    "id": "guitar",
    "category": "music",
    "label": "Guitar Lessons",
    "monthlyEGP": 2500,
    "smarts": 3,
    "social": 0,
    "health": 0,
    "happiness": 2
  },
  {
    "id": "violin",
    "category": "music",
    "label": "Violin Masterclass",
    "monthlyEGP": 4500,
    "smarts": 7,
    "social": 0,
    "health": 0,
    "happiness": 4
  },
  {
    "id": "vocals",
    "category": "music",
    "label": "Vocal Training",
    "monthlyEGP": 3500,
    "smarts": 2,
    "social": 2,
    "health": 1,
    "happiness": 5
  },
  {
    "id": "art",
    "category": "art",
    "label": "Art Classes",
    "monthlyEGP": 2000,
    "smarts": 3,
    "social": 0,
    "health": 0,
    "happiness": 4
  },
  {
    "id": "pottery",
    "category": "art",
    "label": "Pottery & Sculpture",
    "monthlyEGP": 2200,
    "smarts": 3,
    "social": 1,
    "health": 0,
    "happiness": 4
  },
  {
    "id": "coding",
    "category": "tech",
    "label": "Coding for Kids",
    "monthlyEGP": 4000,
    "smarts": 8,
    "social": 0,
    "health": 0,
    "happiness": 1
  },
  {
    "id": "robotics",
    "category": "tech",
    "label": "Robotics Workshop",
    "monthlyEGP": 5000,
    "smarts": 10,
    "social": 3,
    "health": 0,
    "happiness": 4
  },
  {
    "id": "game_dev",
    "category": "tech",
    "label": "Game Development",
    "monthlyEGP": 4500,
    "smarts": 9,
    "social": 2,
    "health": 0,
    "happiness": 6
  },
  {
    "id": "english_tutoring",
    "category": "tutoring",
    "label": "English Tutoring",
    "monthlyEGP": 2500,
    "smarts": 8,
    "social": 0,
    "health": 0,
    "happiness": 0
  },
  {
    "id": "math_tutoring",
    "category": "tutoring",
    "label": "Math Tutoring",
    "monthlyEGP": 3000,
    "smarts": 8,
    "social": 0,
    "health": 0,
    "happiness": 0
  },
  {
    "id": "physics_tutoring",
    "category": "tutoring",
    "label": "Advanced Physics Tutoring",
    "monthlyEGP": 3500,
    "smarts": 10,
    "social": 0,
    "health": 0,
    "happiness": -1
  },
  {
    "id": "science_club",
    "category": "tutoring",
    "label": "Science Club",
    "monthlyEGP": 1500,
    "smarts": 5,
    "social": 2,
    "health": 0,
    "happiness": 2
  },
  {
    "id": "chess",
    "category": "intellectual",
    "label": "Chess Club",
    "monthlyEGP": 800,
    "smarts": 4,
    "social": 1,
    "health": 0,
    "happiness": 2
  },
  {
    "id": "debate",
    "category": "intellectual",
    "label": "Model UN & Debate Team",
    "monthlyEGP": 2000,
    "smarts": 8,
    "social": 7,
    "health": 0,
    "happiness": 3
  },
  {
    "id": "finance_kids",
    "category": "intellectual",
    "label": "Young Investors Club",
    "monthlyEGP": 3000,
    "smarts": 9,
    "social": 3,
    "health": 0,
    "happiness": 2
  },
  {
    "id": "dance",
    "category": "art",
    "label": "Dance Classes",
    "monthlyEGP": 2000,
    "smarts": 0,
    "social": 3,
    "health": 0,
    "happiness": 4
  },
  {
    "id": "theater",
    "category": "art",
    "label": "Drama & Acting Studio",
    "monthlyEGP": 3200,
    "smarts": 4,
    "social": 8,
    "health": 1,
    "happiness": 6
  },
  {
    "id": "foreign_lang",
    "category": "language",
    "label": "Foreign Language Class",
    "monthlyEGP": 2000,
    "smarts": 6,
    "social": 0,
    "health": 0,
    "happiness": 1
  },
  {
    "id": "summer_local",
    "category": "camp",
    "label": "Local Summer Camp",
    "annualEGP": 15000,
    "smarts": 5,
    "social": 10,
    "health": 0,
    "happiness": 10
  },
  {
    "id": "summer_intl",
    "category": "camp",
    "label": "International Summer Camp",
    "annualEGP": 250000,
    "smarts": 15,
    "social": 20,
    "health": 0,
    "happiness": 20
  },
  {
    "id": "nasa_space_camp",
    "category": "camp",
    "label": "NASA Space Camp USA",
    "annualEGP": 450000,
    "smarts": 25,
    "social": 15,
    "health": 0,
    "happiness": 30
  },
  {
    "id": "scouts",
    "category": "social",
    "label": "Scouts",
    "monthlyEGP": 500,
    "smarts": 2,
    "social": 6,
    "health": 2,
    "happiness": 4
  },
  {
    "id": "reading",
    "category": "intellectual",
    "label": "Book Club",
    "monthlyEGP": 400,
    "smarts": 5,
    "social": 2,
    "health": 0,
    "happiness": 2
  }
];
export const V1_LIFE_GOALS = [
  {
    "id": "buy_home_home",
    "label": "Buy a home in your home country",
    "desc": "Own a home in the country you still think of as home.",
    "reward": "Reduced remittance pressure \u00b7 Ready for return home"
  },
  {
    "id": "return_home",
    "label": "Return home permanently",
    "desc": "Go back for good, ready to live.",
    "reward": "+25 happiness \u00b7 family bonds up"
  },
  {
    "id": "gold_stash",
    "label": "Accumulate 50g of gold",
    "desc": "Build a real gold stash \u2014 bullion (Career/Expat) and/or shopping gold items.",
    "reward": "Family sees you as \"settled\""
  },
  {
    "id": "first_expat_job",
    "label": "Work abroad",
    "desc": "Hold a job outside your home country.",
    "reward": "Expat path open"
  },
  {
    "id": "survive_first_year_gulf",
    "label": "Survive a full year in the Gulf with positive cash",
    "desc": "Stay employed in KSA/UAE for a year without going broke.",
    "reward": "Stability abroad"
  },
  {
    "id": "first_1m",
    "label": "Save 1 million EGP equivalent",
    "desc": "Build savings worth one million in your home-country currency.",
    "reward": "Milestone earned"
  },
  {
    "id": "first_10m",
    "label": "Save 10 million EGP equivalent",
    "desc": "Build savings worth ten million in your home-country currency.",
    "reward": "Family status rises"
  },
  {
    "id": "first_child",
    "label": "Have your first child",
    "desc": "Continue the family line.",
    "reward": "Family bond up"
  },
  {
    "id": "raise_children",
    "label": "Raise 2 children to age 18",
    "desc": "See them grow up.",
    "reward": "Legacy"
  },
  {
    "id": "own_business",
    "label": "Own a profitable business",
    "desc": "Be your own boss.",
    "reward": "Career independence"
  },
  {
    "id": "second_passport",
    "label": "Obtain a second passport",
    "desc": "The Egyptian dream \u2014 a passport that opens doors.",
    "reward": "Ultimate freedom"
  },
  {
    "id": "buy_apartment_cairo",
    "label": "Buy an apartment in Cairo or Alexandria",
    "desc": "The city where you grew up.",
    "reward": "A home in the motherland"
  },
  {
    "id": "visit_family",
    "label": "Return to Egypt to visit family 3 times",
    "desc": "The trips that make the distance worth it.",
    "reward": "Family remains close"
  },
  {
    "id": "career_top",
    "label": "Reach the top of your career track",
    "desc": "Director, Professor, Chief \u2014 the pinnacle.",
    "reward": "Legacy + prestige"
  },
  {
    "id": "pension_ready",
    "label": "Reach age 60 with 1M+ in pension",
    "desc": "Retire with dignity.",
    "reward": "Comfortable retirement"
  }
];
export const V1_ACHIEVEMENTS = [
  {
    "id": "first_job",
    "label": "First Job",
    "icon": "briefcase",
    "desc": "Got your first full-time job."
  },
  {
    "id": "first_promotion",
    "label": "First Promotion",
    "icon": "chart-up",
    "desc": "Promoted for the first time."
  },
  {
    "id": "first_car",
    "label": "First Car",
    "icon": "car",
    "desc": "Got your first car."
  },
  {
    "id": "first_home",
    "label": "First Home",
    "icon": "home",
    "desc": "Owned your first property."
  },
  {
    "id": "married",
    "label": "Married",
    "icon": "ring",
    "desc": "Got married."
  },
  {
    "id": "first_child",
    "label": "First Child",
    "icon": "child",
    "desc": "Had your first child."
  },
  {
    "id": "three_children",
    "label": "Big Family",
    "icon": "family",
    "desc": "Had 3 children."
  },
  {
    "id": "first_million",
    "label": "First Million",
    "icon": "money",
    "desc": "Saved 1M EGP equivalent."
  },
  {
    "id": "ten_million",
    "label": "Ten Million",
    "icon": "wealth",
    "desc": "Saved 10M EGP equivalent."
  },
  {
    "id": "bought_apartment_egy",
    "label": "Home in Egypt",
    "icon": "home",
    "desc": "Bought property back home."
  },
  {
    "id": "returned_home",
    "label": "Returned Home",
    "icon": "flag",
    "desc": "Moved back to your home country."
  },
  {
    "id": "gold_stash",
    "label": "Gold Hoarder",
    "icon": "money",
    "desc": "Accumulated 50g of gold."
  },
  {
    "id": "gone_abroad",
    "label": "Went Abroad",
    "icon": "plane",
    "desc": "Moved to another country for work."
  },
  {
    "id": "worked_in_gulf",
    "label": "Gulf Worker",
    "icon": "flag",
    "desc": "Worked a Gulf sponsorship job."
  },
  {
    "id": "second_passport",
    "label": "Second Passport",
    "icon": "globe",
    "desc": "Obtained citizenship of another country."
  },
  {
    "id": "business_owner",
    "label": "Business Owner",
    "icon": "shop",
    "desc": "Ran a profitable business."
  },
  {
    "id": "ten_countries",
    "label": "World Traveler",
    "icon": "globe",
    "desc": "Visited 10 different countries."
  },
  {
    "id": "helped_family",
    "label": "Family Provider",
    "icon": "family",
    "desc": "Sent 500,000+ EGP home to family."
  },
  {
    "id": "survived_recession",
    "label": "Survived a Recession",
    "icon": "chart-down",
    "desc": "Kept your job through an economic crisis."
  },
  {
    "id": "paid_off_debt",
    "label": "Debt Free",
    "icon": "check",
    "desc": "Paid off all loans and credit cards."
  },
  {
    "id": "expat_5_years",
    "label": "5 Years Abroad",
    "icon": "globe",
    "desc": "Lived abroad for 5 years."
  },
  {
    "id": "expat_10_years",
    "label": "Decade Abroad",
    "icon": "globe",
    "desc": "Lived abroad for 10 years."
  },
  {
    "id": "bought_gold",
    "label": "Gold Buyer",
    "icon": "money",
    "desc": "Bought your first gold."
  },
  {
    "id": "returned_visit",
    "label": "Home for Visit",
    "icon": "plane",
    "desc": "Visited home from abroad."
  },
  {
    "id": "career_top",
    "label": "Top of Your Field",
    "icon": "trophy",
    "desc": "Reached the top of your career track."
  },
  {
    "id": "first_business",
    "label": "First Business",
    "icon": "shop",
    "desc": "Started your first business."
  },
  {
    "id": "marriage_10_years",
    "label": "Ten Years Married",
    "icon": "ring",
    "desc": "Stayed married for 10 years."
  },
  {
    "id": "child_graduating",
    "label": "A Child Graduates",
    "icon": "trophy",
    "desc": "One of your children earned a university degree."
  },
  {
    "id": "business_sold_profit",
    "label": "Sold at a Profit",
    "icon": "money",
    "desc": "Sold a business for more than you put into it."
  },
  {
    "id": "goal_completed",
    "label": "Goal Completed",
    "icon": "check",
    "desc": "Finished one of your life goals."
  }
];
export const FULL_MARRIAGE_PROFILES_7875 = {"egy":{"country":"egy","label":"Egypt","common":{"legal":{"minAgeMale":{"v":18,"src":"Child Law 126/2008, art. 31 bis Civil Status Law 143/1994: no marriage documented before 18 full Gregorian years, both sexes (Girls Not Brides; Qadaya Misr)","modelled":false},"minAgeWithConsent":{"v":null,"src":"Child Law 126/2008: no parental-consent exception; a girl's marriage cannot be documented before 18 even with guardian approval (Qadaya Misr)","modelled":false},"consentRule":{"v":"self","src":"Marriage is a contract between two mutually consenting parties of marriageable age (Springer, The State of Marriage in Egypt)","modelled":false},"guardianApproval":{"v":"customary for the bride (wali, usually the father, present at katb al-kitab); not a legal requirement for an adult woman","src":"Springer, The State of Marriage in Egypt; Egyptian marriage practice (maazoon guides)","modelled":true},"recognizedUnions":{"v":["dating","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood","polygamy"],"src":"Egyptian personal status law: katb al-kitab is the religious contract and the registered civil act; urfi (unregistered) marriage exists socially but is not recognised; cohabitation is not a recognised union (Springer; legal guides)","modelled":false},"cohabitationRecognised":{"v":false,"src":"Marriage is the solely socially accepted form of union in Egypt; cohabitation has no legal standing (Springer, The State of Marriage in Egypt)","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Law 25/1929 art. 11 bis as added by Law 100/1985: husband must declare marital status and existing wives' names/addresses; registrar notifies existing wives by registered mail; wife may seek divorce within one year of learning of the new marriage if she suffers harm (Qadaya Misr; Springer)","modelled":false},"foreignerRequirements":{"v":"Foreigners marry at the Foreign Marriage Office, Ministry of Justice, Lazoughly Square, Cairo; authenticated documents, premarital medical exam, and registration there; a Muslim woman may not marry a non-Muslim man","src":"Ministry of Justice Foreign Marriage Office procedure; GOV.UK family law in Egypt guide","modelled":false},"interfaithRules":{"v":"Muslim man may marry a Christian or Jewish woman; Muslim woman may not marry a non-Muslim man; Coptic Christians marry under church law","src":"Egyptian personal status law by religion (Springer; GOV.UK family law in Egypt)","modelled":false},"prohibitedDegrees":{"v":"Direct blood relatives, siblings, and milk kinship; a woman in idda may not remarry until the waiting period ends","src":"Sharia-based personal status law; GOV.UK family law in Egypt (idda bar)","modelled":false},"religiousLawApplies":{"v":"Personal status follows religion: Muslims under Sharia-based Laws 25/1920, 25/1929, 1/2000; Copts under church law; religious courts abolished by Law 462/1955, family courts from Law 10/2004","src":"Lawzana / GOV.UK family law in Egypt overviews","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"registrationAuthority":{"v":"Licensed maazoon (marriage registrar) for Muslims; church for Copts; Foreign Marriage Office at the Ministry of Justice for mixed/foreign marriages","src":"LegalClarity, Marriage in Egypt; GOV.UK family law in Egypt","modelled":false},"medicalExamRequired":{"v":true,"src":"Law 126/2008 + Health Ministry Decree 338/2008: premarital medical certificate required before the contract; from Feb 2023 the 100 Million Healthy Lives initiative issues QR certificates valid 6 months (Ministry of Health via Arab Press / SceneNow)","modelled":false},"witnessesRequired":{"v":2,"src":"Two adult Muslim male witnesses at katb al-kitab (maazoon guides; Islamic practice)","modelled":false},"documentsRequired":{"v":["national IDs","computerised birth certificates","six personal photos","premarital medical certificate","divorce certificate if previously married (after idda)","death certificate of previous spouse if widowed"],"src":"Maazoon document lists (2026 guides); LegalClarity, Marriage in Egypt","modelled":false},"whoCanRefuse":{"v":"Maazoon refuses if either party is under 18, documents or the medical certificate are missing, or marital status is undisclosed; guardian refusal is social, not legal, for adults","src":"Child Law 126/2008 (age bar); maazoon practice guides","modelled":true},"leadTimeDays":{"v":30,"src":"Modelled: engagement to contract commonly takes months while the apartment and shabka are arranged; registration itself is same-day","modelled":true},"ceremonyTypes":{"v":["katb al-kitab at home or mosque","church wedding","zaffa procession","henna night"],"src":"Egyptian wedding practice (Springer; Egyptian Streets)","modelled":false}},"customs":{"mahr":{"v":{"payer":"groom","prompt":"muqaddam (advance portion, paid before consummation)","deferred":"muakhar (payable on divorce or death)","rangeByClass":{"poor":"symbolic to 5000 EGP","middle":"10000-50000 EGP","rich":"100000+ EGP"},"note":"Often a modest or symbolic figure in the contract; the real negotiation is the shabka and the home"},"src":"Springer, The State of Marriage in Egypt (Singerman 2007 cost components); Islamic Dating Cairo guide","modelled":true},"shabka":{"v":{"payer":"groom","item":"gold jewellery, typically 21-carat bracelets and a gold wedding band","rangeByClass":{"poor":"one gold band","middle":"bracelets + band","rich":"full gold set"},"note":"Presented at the formal engagement (khutouba)"},"src":"Singerman / Rugh marriage-transaction studies (average acceptable shabka in the studied community 500-1500 EGP in the 1990s); Egyptian Streets 2026","modelled":true},"gehaz":{"v":{"payer":"bride's family","item":"trousseau: kitchenware, appliances, linens and household goods","rangeByClass":{"poor":"basic kitchen and bedding","middle":"full kitchen + appliances","rich":"full furnishing including electronics"},"note":"A major burden on the bride's family; items are listed in the qayma (ayma) signed by the groom"},"src":"Egyptian Streets 2026; Singerman 2007; 1Library marriage-transactions study","modelled":true},"bridePrice":{"v":{"exists":false,"note":"No separate bride price; mahr plus shabka serve this role"},"src":"Egyptian marriage cost studies list housing, furniture, shabka, mahr, celebrations and gehaz, with no separate bride-price item (Singerman 2007 via Springer)","modelled":false},"ring":{"v":{"payer":"groom","item":"gold wedding band, part of the shabka; rings exchanged at the engagement","rangeByClass":{"poor":"simple gold band","middle":"gold band + engagement ring","rich":"gold + diamond"}},"src":"Egyptian engagement practice (khutouba / shabka guides)","modelled":true},"gifts":{"v":"Henna night gifts, family gifts to the couple, and cash gifts (nuqta) from guests at the wedding","src":"Egyptian wedding practice","modelled":true},"trousseau":{"v":{"payer":"bride's family","item":"gehaz plus the bride's clothing","rangeByClass":{"poor":"basic clothing and bedding","middle":"full clothing set","rich":"extensive clothing and linens"}},"src":"Singerman 2007 cost components via Springer","modelled":true},"weddingFormats":{"v":["family home / courtyard","local wedding hall","hotel ballroom (4-star / 5-star)","beach resort (North Coast, Sharm, Hurghada, Gouna)","garden wedding","destination wedding abroad"],"src":"Egyptian wedding practice; World Life venue list","modelled":true},"typicalGuestCount":{"v":{"poor":100,"middle":200,"rich":400},"src":"Modelled from Egyptian wedding practice: hall weddings commonly run to hundreds of guests; family-home weddings are small","modelled":true}},"costs":{"cateringPerGuest":{"v":1500,"src":"Modelled 2026 EGP per guest for hall/hotel catering; no published per-guest series found","modelled":true},"photography":{"v":30000,"src":"Modelled 2026 EGP for a wedding photographer; no published price series found","modelled":true},"averageTotal":{"v":800000,"src":"Modelled 2026 EGP for the wedding celebration only, excluding housing (housing is the largest marriage cost in Egypt and is priced separately in the game)","modelled":true},"averageTotalByClass":{"v":{"poor":250000,"middle":800000,"rich":4000000},"src":"Modelled 2026 EGP, celebration only, excluding housing; no published class breakdown found","modelled":true},"currency":{"v":"EGP","src":"Egyptian pound","modelled":false}},"money":{"propertyRegime":{"v":"separate","src":"No community property regime: each spouse keeps their own property; the bride's contributions are protected by the qayma (ayma) list signed by the groom","modelled":false},"prenupEnforceability":{"v":"Contract terms agreed at katb al-kitab (mahr, muakhar, conditions) are enforceable as contract terms; there is no Western-style prenuptial agreement","src":"Springer: katb al-kitab is the juncture at which the parties consensually define, enhance or limit their rights (El Alimi 1992)","modelled":false},"spouseInheritanceShare":{"v":"Muslim shares: widow 1/8 with children, 1/4 without; widower 1/4 with children, 1/2 without; Copts follow church rules","src":"Quranic fixed shares as applied under Egyptian personal status law","modelled":false},"taxEffects":{"v":"No joint filing and no marriage tax benefit","src":"Egyptian income tax: individual filing; no spousal allowance for marriage","modelled":true},"benefits":{"v":"Wife is entitled to maintenance (nafaqa) from the husband; no marriage-specific state benefit","src":"Personal Status Law 25/1920, 25/1929 (maintenance)","modelled":false},"debtLiability":{"v":"separate; the husband alone is liable for household maintenance and the marital home","src":"Sharia-based maintenance duty (Springer)","modelled":false}},"immigration":{"spouseRoute":{"v":{"destination":"egy","eligibility":"foreign spouse of an Egyptian after a registered marriage","requirements":["registered marriage contract","valid passport and residence","premarital medical certificate"],"fee":175,"feeNote":"Ministry of Justice base registration fee LE 175, plus 0.02% of the mahr for Muslim couples (LegalClarity)","processingWeeks":"4-8","refusalAppeal":"registrar refusal appealable to the family court","conditionsAfterArrival":"foreign spouse applies for a residence permit; renewals required","pathToSettlement":"foreign wife of an Egyptian man may acquire citizenship after 2 years of marriage (Nationality Law 26/1975 art. 7, as commonly summarised)"},"src":"LegalClarity, Marriage in Egypt (fee, Foreign Marriage Office); nationality rule modelled, needs verification","modelled":true},"fianceRoute":{"v":{"exists":false,"note":"Egypt has no fiance visa route; couples marry first, then the foreign spouse seeks residence"},"src":"No fiance route in Egyptian immigration practice; marriage is registered first (LegalClarity)","modelled":false},"processingTimeWeeks":{"v":6,"src":"Modelled: registration is same-day once documents are complete; residence processing takes weeks","modelled":true},"refusalAppeal":{"v":"Registrar or residence refusal can be challenged before the family court / administrative court","src":"Modelled from Egyptian court practice; no published appeal timeline found","modelled":true},"conditionsAfterArrival":{"v":"Foreign spouse holds a residence permit tied to the marriage; renewal required; work needs a separate permit","src":"Modelled from Egyptian residence practice; no published conditions list found","modelled":true},"pathToSettlement":{"v":"Long residence on a marriage basis; citizenship for a foreign wife after 2 years of marriage (Nationality Law 26/1975 art. 7, as commonly summarised)","src":"Nationality rule modelled, needs verification","modelled":true}},"divorce":{"process":{"v":"Mandatory Family Dispute Settlement Office first (Law 10/2004), then Family Court; khula typically 3-6 months and the judgment is final and non-appealable; talaq is pronounced before the maazoon and registered","src":"Law 10/2004 (family courts, settlement offices); Law 1/2000 art. 20 (khula final); Lawzana guides","modelled":false},"waitingPeriodDays":{"v":90,"src":"Idda: about 3 months after divorce, 4 months and 10 days for a widow (GOV.UK family law in Egypt; Quran 2:234)","modelled":false},"cost":{"v":{"courtFees":"low","lawyerFees":"varies widely; khula is relatively cheap","note":"Modelled ranges; no published fee schedule found"},"src":"Modelled; no published Egyptian family-court fee schedule found","modelled":true},"assetSplit":{"v":"No community property: each keeps their own; the wife keeps her mahr, deferred mahr (unless khula, where she returns the prompt mahr and waives deferred mahr, idda and muta), and the qayma items she brought","src":"Law 1/2000 art. 20 (khula terms); personal status law","modelled":false},"custodyDefault":{"v":"Mother has custody (hadana) to age 15, then the child chooses; father holds guardianship (wilaya)","src":"Law 25/1929 as amended (custody rules)","modelled":false},"supportDefault":{"v":"Nafaqa during idda; muta compensation of at least 2 years' maintenance if the wife is divorced against her will and without her fault; father pays child support","src":"Law 25/1929 art. 18 bis (muta, at least 2 years); GOV.UK family law in Egypt","modelled":false},"remarriageRules":{"v":"Woman waits idda: 3 months after divorce, 4 months and 10 days after widowhood; man has no waiting period; a woman divorced by triple talaq may not remarry the same husband until an intervening marriage","src":"GOV.UK family law in Egypt; idda rules","modelled":false},"stigma":{"v":"Divorced women face real social stigma, stronger in rural and Upper Egypt; more accepted among urban educated families","src":"Modelled from Egyptian social practice; no survey series found","modelled":true},"familyReaction":{"v":"Family mediation comes first; fathers and brothers are commonly involved; the bride's family may press for reconciliation before any court step","src":"Modelled from Egyptian family practice","modelled":true}},"social":{"familyApprovalWeight":{"v":"very high","src":"Family-introduced marriage (salonat) is common; the fatiha meeting of both families opens every marriage (marriage-transaction studies)","modelled":false},"attitudeInterfaith":{"v":"Muslim-Christian marriage is socially very difficult; a Muslim woman marrying a non-Muslim man is forbidden by law and custom","src":"Egyptian personal status law by religion","modelled":false},"attitudeInterclass":{"v":"strong: families weigh wealth, education and family standing heavily in the match","src":"Modelled from Egyptian marriage practice","modelled":true},"attitudeInterracial":{"v":"moderate: marriage to foreigners is common in tourist areas but judged, especially for women","src":"Modelled from Egyptian social practice","modelled":true},"attitudeAgeGap":{"v":"man older by 5-10 years is normal; a woman older than the man is frowned on","src":"Modelled from Egyptian marriage practice","modelled":true},"attitudeDivorcedPartner":{"v":"divorced women face real difficulty remarrying; divorced men face much less","src":"Modelled from Egyptian social practice","modelled":true},"roleExpectations":{"v":"Man provides the home and income; woman manages the home; among educated urban couples the split is increasingly shared","src":"Modelled from Egyptian family practice; Sharia maintenance duty","modelled":true}}},"eras":{"1960s":{"legal":{"minAgeFemale":{"v":16,"src":"Before Law 126/2008 the minimum age was 18 for men and 16 for women (Law 56/1923; Springer, The State of Marriage in Egypt)","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Polygamy allowed under Sharia (max 4); the 1985 notification rule did not yet exist (Law 100/1985 came later)","modelled":false}},"procedure":{"steps":{"v":[{"id":"fatiha","name":"Qirayet fatiha: families meet and read the opening verse, informal engagement","fee":0,"leadTimeDays":0,"documents":[],"whoCanRefuse":"either family"},{"id":"shabka","name":"Khutouba / shabka: formal engagement party at the bride's home, gold presented","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"agree_terms","name":"Agree mahr (prompt and deferred), apartment, furniture and qayma list","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"katb","name":"Katb al-kitab: contract signed before the maazoon with two witnesses and the bride's guardian","fee":0,"leadTimeDays":1,"documents":["national IDs","birth certificates","photos"],"whoCanRefuse":"maazoon"},{"id":"register","name":"Registration with the civil status office; marriage certificate issued","fee":0,"leadTimeDays":1,"documents":["signed contract"],"whoCanRefuse":"civil status office"},{"id":"wedding","name":"Wedding night (leilit il dukhla) with zaffa procession","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Classic Egyptian procedure before the 2008 medical-exam requirement","modelled":false},"medicalExamRequired":{"v":false,"src":"Premarital medical certificate only became a registration requirement with Law 126/2008","modelled":false}},"customs":{"typicalGuestCount":{"v":{"poor":80,"middle":150,"rich":300},"src":"Modelled: smaller weddings than today","modelled":true}},"costs":{"venues":{"family_home":{"v":600,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":1400,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":3000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":7000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":12000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":2200,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":18000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":160,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":900,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":2400,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":100,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":3,"src":"Modelled 1960s EGP per guest: the 2026 value (1500 EGP) scaled by the game era price series at the era mid-year (1965); no published per-guest series found","modelled":true},"photography":{"v":53,"src":"Modelled 1960s EGP for a wedding photographer: the 2026 value (30000 EGP) scaled by the game era price series at the era mid-year (1965); no published price series found","modelled":true},"averageTotal":{"v":1421,"src":"Modelled 1960s EGP average wedding total (celebration only, excluding housing): the 2026 value (800000 EGP) scaled by the game era price series at the era mid-year (1965)","modelled":true},"averageTotalByClass":{"v":{"poor":444,"middle":1421,"rich":7106},"src":"Modelled 1960s EGP by class: the 2026 values scaled by the game era price series at the era mid-year (1965); no published class breakdown found","modelled":true}},"divorce":{"grounds":{"v":["talaq (husband's unilateral repudiation, pronounced before the maazoon and registered)","tatliq (judicial divorce for harm, Law 25/1929 art. 6 as amended by Law 100/1985)","divorce for polygamy harm (Law 25/1929 art. 11 bis, Law 100/1985)"],"src":"Khula did not exist before Law 1/2000","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":24,"female":19},"src":"Modelled: younger marriage than today; no decade series found","modelled":true}}},"1970s":{"legal":{"minAgeFemale":{"v":16,"src":"Before Law 126/2008 the minimum age was 18 for men and 16 for women (Law 56/1923; Springer)","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Polygamy allowed under Sharia (max 4); the 1985 notification rule did not yet exist","modelled":false}},"procedure":{"steps":{"v":[{"id":"fatiha","name":"Qirayet fatiha: families meet and read the opening verse, informal engagement","fee":0,"leadTimeDays":0,"documents":[],"whoCanRefuse":"either family"},{"id":"shabka","name":"Khutouba / shabka: formal engagement party at the bride's home, gold presented","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"agree_terms","name":"Agree mahr (prompt and deferred), apartment, furniture and qayma list","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"katb","name":"Katb al-kitab: contract signed before the maazoon with two witnesses and the bride's guardian","fee":0,"leadTimeDays":1,"documents":["national IDs","birth certificates","photos"],"whoCanRefuse":"maazoon"},{"id":"register","name":"Registration with the civil status office; marriage certificate issued","fee":0,"leadTimeDays":1,"documents":["signed contract"],"whoCanRefuse":"civil status office"},{"id":"wedding","name":"Wedding night (leilit il dukhla) with zaffa procession","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Classic Egyptian procedure before the 2008 medical-exam requirement","modelled":false},"medicalExamRequired":{"v":false,"src":"Premarital medical certificate only became a registration requirement with Law 126/2008","modelled":false}},"customs":{"typicalGuestCount":{"v":{"poor":80,"middle":150,"rich":300},"src":"Modelled: smaller weddings than today","modelled":true}},"costs":{"venues":{"family_home":{"v":1500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":3500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":7500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":17500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":30000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":5500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":45000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":400,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":2250,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":6000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":250,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":4,"src":"Modelled 1970s EGP per guest: the 2026 value (1500 EGP) scaled by the game era price series at the era mid-year (1975); no published per-guest series found","modelled":true},"photography":{"v":82,"src":"Modelled 1970s EGP for a wedding photographer: the 2026 value (30000 EGP) scaled by the game era price series at the era mid-year (1975); no published price series found","modelled":true},"averageTotal":{"v":2199,"src":"Modelled 1970s EGP average wedding total (celebration only, excluding housing): the 2026 value (800000 EGP) scaled by the game era price series at the era mid-year (1975)","modelled":true},"averageTotalByClass":{"v":{"poor":687,"middle":2199,"rich":10995},"src":"Modelled 1970s EGP by class: the 2026 values scaled by the game era price series at the era mid-year (1975); no published class breakdown found","modelled":true}},"divorce":{"grounds":{"v":["talaq (husband's unilateral repudiation, pronounced before the maazoon and registered)","tatliq (judicial divorce for harm, Law 25/1929 art. 6 as amended by Law 100/1985)","divorce for polygamy harm (Law 25/1929 art. 11 bis, Law 100/1985)"],"src":"Khula did not exist before Law 1/2000","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":25,"female":20},"src":"Modelled: younger marriage than today; no decade series found","modelled":true}}},"1980s":{"legal":{"minAgeFemale":{"v":16,"src":"Before Law 126/2008 the minimum age was 18 for men and 16 for women (Law 56/1923; Springer)","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Law 100/1985 (art. 11 bis Law 25/1929): husband must declare marital status; registrar notifies existing wives; wife may seek divorce within one year of learning of the new marriage (Qadaya Misr; Springer)","modelled":false}},"procedure":{"steps":{"v":[{"id":"fatiha","name":"Qirayet fatiha: families meet and read the opening verse, informal engagement","fee":0,"leadTimeDays":0,"documents":[],"whoCanRefuse":"either family"},{"id":"shabka","name":"Khutouba / shabka: formal engagement party at the bride's home, gold presented","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"agree_terms","name":"Agree mahr (prompt and deferred), apartment, furniture and qayma list","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"katb","name":"Katb al-kitab: contract signed before the maazoon with two witnesses and the bride's guardian","fee":0,"leadTimeDays":1,"documents":["national IDs","birth certificates","photos"],"whoCanRefuse":"maazoon"},{"id":"register","name":"Registration with the civil status office; marriage certificate issued","fee":0,"leadTimeDays":1,"documents":["signed contract"],"whoCanRefuse":"civil status office"},{"id":"wedding","name":"Wedding night (leilit il dukhla) with zaffa procession","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Classic Egyptian procedure before the 2008 medical-exam requirement","modelled":false},"medicalExamRequired":{"v":false,"src":"Premarital medical certificate only became a registration requirement with Law 126/2008","modelled":false}},"costs":{"venues":{"family_home":{"v":4500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":10500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":22500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":52500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":90000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":16500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":135000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":1200,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":6750,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":18000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":750,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":15,"src":"Modelled 1980s EGP per guest: the 2026 value (1500 EGP) scaled by the game era price series at the era mid-year (1985); no published per-guest series found","modelled":true},"photography":{"v":292,"src":"Modelled 1980s EGP for a wedding photographer: the 2026 value (30000 EGP) scaled by the game era price series at the era mid-year (1985); no published price series found","modelled":true},"averageTotal":{"v":7781,"src":"Modelled 1980s EGP average wedding total (celebration only, excluding housing): the 2026 value (800000 EGP) scaled by the game era price series at the era mid-year (1985)","modelled":true},"averageTotalByClass":{"v":{"poor":2432,"middle":7781,"rich":38907},"src":"Modelled 1980s EGP by class: the 2026 values scaled by the game era price series at the era mid-year (1985); no published class breakdown found","modelled":true}},"divorce":{"grounds":{"v":["talaq (husband's unilateral repudiation, pronounced before the maazoon and registered)","tatliq (judicial divorce for harm, Law 25/1929 art. 6 as amended by Law 100/1985)","divorce for polygamy harm (Law 25/1929 art. 11 bis, Law 100/1985)"],"src":"Khula did not exist before Law 1/2000","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":26,"female":21},"src":"Modelled: younger marriage than today; no decade series found","modelled":true}}},"1990s":{"legal":{"minAgeFemale":{"v":16,"src":"Before Law 126/2008 the minimum age was 18 for men and 16 for women (Law 56/1923; Springer)","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Law 100/1985 (art. 11 bis Law 25/1929): husband must declare marital status; registrar notifies existing wives; wife may seek divorce within one year of learning of the new marriage","modelled":false}},"procedure":{"steps":{"v":[{"id":"fatiha","name":"Qirayet fatiha: families meet and read the opening verse, informal engagement","fee":0,"leadTimeDays":0,"documents":[],"whoCanRefuse":"either family"},{"id":"shabka","name":"Khutouba / shabka: formal engagement party at the bride's home, gold presented","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"agree_terms","name":"Agree mahr (prompt and deferred), apartment, furniture and qayma list","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"katb","name":"Katb al-kitab: contract signed before the maazoon with two witnesses and the bride's guardian","fee":0,"leadTimeDays":1,"documents":["national IDs","birth certificates","photos"],"whoCanRefuse":"maazoon"},{"id":"register","name":"Registration with the civil status office; marriage certificate issued","fee":0,"leadTimeDays":1,"documents":["signed contract"],"whoCanRefuse":"civil status office"},{"id":"wedding","name":"Wedding night (leilit il dukhla) with zaffa procession","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Classic Egyptian procedure before the 2008 medical-exam requirement","modelled":false},"medicalExamRequired":{"v":false,"src":"Premarital medical certificate only became a registration requirement with Law 126/2008","modelled":false}},"costs":{"venues":{"family_home":{"v":12000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":28000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":60000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":140000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":240000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":44000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":360000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":3200,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":18000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":48000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":2000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":69,"src":"Modelled 1990s EGP per guest: the 2026 value (1500 EGP) scaled by the game era price series at the era mid-year (1995); no published per-guest series found","modelled":true},"photography":{"v":1376,"src":"Modelled 1990s EGP for a wedding photographer: the 2026 value (30000 EGP) scaled by the game era price series at the era mid-year (1995); no published price series found","modelled":true},"averageTotal":{"v":36696,"src":"Modelled 1990s EGP average wedding total (celebration only, excluding housing): the 2026 value (800000 EGP) scaled by the game era price series at the era mid-year (1995)","modelled":true},"averageTotalByClass":{"v":{"poor":11467,"middle":36696,"rich":183479},"src":"Modelled 1990s EGP by class: the 2026 values scaled by the game era price series at the era mid-year (1995); no published class breakdown found","modelled":true}},"divorce":{"grounds":{"v":["talaq (husband's unilateral repudiation, pronounced before the maazoon and registered)","tatliq (judicial divorce for harm, Law 25/1929 art. 6 as amended by Law 100/1985)","divorce for polygamy harm (Law 25/1929 art. 11 bis, Law 100/1985)"],"src":"Khula did not exist before Law 1/2000","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":27,"female":22},"src":"Modelled: younger marriage than today; no decade series found","modelled":true}}},"2000s":{"legal":{"minAgeFemale":{"v":16,"src":"Band uses the pre-2008 rule (18 men / 16 women); Law 126/2008 raised the age for women to 18 in 2008","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Law 100/1985 (art. 11 bis Law 25/1929): husband must declare marital status; registrar notifies existing wives","modelled":false}},"procedure":{"steps":{"v":[{"id":"fatiha","name":"Qirayet fatiha: families meet and read the opening verse, informal engagement","fee":0,"leadTimeDays":0,"documents":[],"whoCanRefuse":"either family"},{"id":"shabka","name":"Khutouba / shabka: formal engagement party at the bride's home, gold presented","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"agree_terms","name":"Agree mahr (prompt and deferred), apartment, furniture and qayma list","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"katb","name":"Katb al-kitab: contract signed before the maazoon with two witnesses and the bride's guardian","fee":0,"leadTimeDays":1,"documents":["national IDs","birth certificates","photos"],"whoCanRefuse":"maazoon"},{"id":"register","name":"Registration with the civil status office; marriage certificate issued","fee":0,"leadTimeDays":1,"documents":["signed contract"],"whoCanRefuse":"civil status office"},{"id":"wedding","name":"Wedding night (leilit il dukhla) with zaffa procession","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Band uses the classic steps; the medical-exam requirement arrived with Law 126/2008","modelled":false},"medicalExamRequired":{"v":false,"src":"Band uses the pre-2008 position; the exam became a requirement with Law 126/2008","modelled":false}},"costs":{"venues":{"family_home":{"v":30000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":70000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":150000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":350000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":600000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":110000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":900000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":8000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":45000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":120000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":5000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":109,"src":"Modelled 2000s EGP per guest: the 2026 value (1500 EGP) scaled by the game era price series at the era mid-year (2005); no published per-guest series found","modelled":true},"photography":{"v":2174,"src":"Modelled 2000s EGP for a wedding photographer: the 2026 value (30000 EGP) scaled by the game era price series at the era mid-year (2005); no published price series found","modelled":true},"averageTotal":{"v":57973,"src":"Modelled 2000s EGP average wedding total (celebration only, excluding housing): the 2026 value (800000 EGP) scaled by the game era price series at the era mid-year (2005)","modelled":true},"averageTotalByClass":{"v":{"poor":18117,"middle":57973,"rich":289864},"src":"Modelled 2000s EGP by class: the 2026 values scaled by the game era price series at the era mid-year (2005); no published class breakdown found","modelled":true}},"divorce":{"grounds":{"v":["talaq (husband's unilateral repudiation, pronounced before the maazoon and registered)","khula (wife-initiated no-fault divorce, Law 1/2000 art. 20: returns prompt mahr, waives deferred mahr, idda and muta maintenance)","tatliq (judicial divorce for harm, Law 25/1929 art. 6 as amended by Law 100/1985)","divorce for polygamy harm (Law 25/1929 art. 11 bis, Law 100/1985)"],"src":"Khula available from Law 1/2000 art. 20; family courts from Law 10/2004","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":28,"female":23},"src":"Modelled: marriage age rising; no decade series found","modelled":true}}},"2010s":{"legal":{"minAgeFemale":{"v":18,"src":"Child Law 126/2008: minimum 18 for both sexes","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Law 100/1985 (art. 11 bis Law 25/1929): husband must declare marital status; registrar notifies existing wives","modelled":false}},"procedure":{"steps":{"v":[{"id":"fatiha","name":"Qirayet fatiha: families meet and read the opening verse, informal engagement","fee":0,"leadTimeDays":0,"documents":[],"whoCanRefuse":"either family"},{"id":"shabka","name":"Khutouba / shabka: formal engagement party at the bride's home, gold presented","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"agree_terms","name":"Agree mahr (prompt and deferred), apartment, furniture and qayma list","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"medical","name":"Premarital medical examination at an authorised government health centre; certificate required before the contract","fee":0,"leadTimeDays":14,"documents":["national IDs"],"whoCanRefuse":"health centre (certificate only; a result does not block the contract)"},{"id":"katb","name":"Katb al-kitab: contract signed before the maazoon with two witnesses and the bride's guardian","fee":0,"leadTimeDays":1,"documents":["national IDs","birth certificates","photos","premarital medical certificate"],"whoCanRefuse":"maazoon"},{"id":"register","name":"Registration with the civil status office; marriage certificate issued","fee":0,"leadTimeDays":1,"documents":["signed contract"],"whoCanRefuse":"civil status office"},{"id":"wedding","name":"Wedding night (leilit il dukhla) with zaffa procession","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Modern procedure including the premarital medical exam (Law 126/2008)","modelled":false},"medicalExamRequired":{"v":true,"src":"Law 126/2008 + Health Ministry Decree 338/2008","modelled":false}},"costs":{"venues":{"family_home":{"v":90000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":210000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":450000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":1050000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":1800000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":330000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":2700000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":24000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":135000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":360000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":15000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.002, 1970s 0.005, 1980s 0.015, 1990s 0.04, 2000s 0.10, 2010s 0.30). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":295,"src":"Modelled 2010s EGP per guest: the 2026 value (1500 EGP) scaled by the game era price series at the era mid-year (2015); no published per-guest series found","modelled":true},"photography":{"v":5901,"src":"Modelled 2010s EGP for a wedding photographer: the 2026 value (30000 EGP) scaled by the game era price series at the era mid-year (2015); no published price series found","modelled":true},"averageTotal":{"v":157369,"src":"Modelled 2010s EGP average wedding total (celebration only, excluding housing): the 2026 value (800000 EGP) scaled by the game era price series at the era mid-year (2015)","modelled":true},"averageTotalByClass":{"v":{"poor":49178,"middle":157369,"rich":786847},"src":"Modelled 2010s EGP by class: the 2026 values scaled by the game era price series at the era mid-year (2015); no published class breakdown found","modelled":true}},"divorce":{"grounds":{"v":["talaq (husband's unilateral repudiation, pronounced before the maazoon and registered)","khula (wife-initiated no-fault divorce, Law 1/2000 art. 20: returns prompt mahr, waives deferred mahr, idda and muta maintenance)","tatliq (judicial divorce for harm, Law 25/1929 art. 6 as amended by Law 100/1985)","divorce for polygamy harm (Law 25/1929 art. 11 bis, Law 100/1985)"],"src":"Khula (Law 1/2000 art. 20); family courts (Law 10/2004)","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":29,"female":24},"src":"Modelled: marriage age rising; no decade series found","modelled":true}}},"2020s":{"legal":{"minAgeFemale":{"v":18,"src":"Child Law 126/2008: minimum 18 for both sexes","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Law 100/1985 (art. 11 bis Law 25/1929): husband must declare marital status; registrar notifies existing wives","modelled":false}},"procedure":{"steps":{"v":[{"id":"fatiha","name":"Qirayet fatiha: families meet and read the opening verse, informal engagement","fee":0,"leadTimeDays":0,"documents":[],"whoCanRefuse":"either family"},{"id":"shabka","name":"Khutouba / shabka: formal engagement party at the bride's home, gold presented","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"agree_terms","name":"Agree mahr (prompt and deferred), apartment, furniture and qayma list","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"either family"},{"id":"medical","name":"Premarital medical examination at an authorised government health centre; certificate required before the contract","fee":0,"leadTimeDays":14,"documents":["national IDs"],"whoCanRefuse":"health centre (certificate only; a result does not block the contract)"},{"id":"katb","name":"Katb al-kitab: contract signed before the maazoon with two witnesses and the bride's guardian","fee":0,"leadTimeDays":1,"documents":["national IDs","birth certificates","photos","premarital medical certificate"],"whoCanRefuse":"maazoon"},{"id":"register","name":"Registration with the civil status office; marriage certificate issued","fee":0,"leadTimeDays":1,"documents":["signed contract"],"whoCanRefuse":"civil status office"},{"id":"wedding","name":"Wedding night (leilit il dukhla) with zaffa procession","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Modern procedure including the premarital medical exam; from Feb 2023 the exam runs under the 100 Million Healthy Lives initiative with QR certificates valid 6 months","modelled":false},"medicalExamRequired":{"v":true,"src":"Law 126/2008; 100 Million Healthy Lives premarital screening initiative from Feb 2023 (Ministry of Health)","modelled":false}},"costs":{"venues":{"family_home":{"v":300000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"local_hall":{"v":700000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"hotel_4star":{"v":1500000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"hotel_5star":{"v":3500000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"resort":{"v":6000000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"garden":{"v":1100000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"destination":{"v":9000000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"registry":{"v":80000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"restaurant":{"v":450000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"traditional":{"v":1200000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"elopement":{"v":50000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true}}},"divorce":{"grounds":{"v":["talaq (husband's unilateral repudiation, pronounced before the maazoon and registered)","khula (wife-initiated no-fault divorce, Law 1/2000 art. 20: returns prompt mahr, waives deferred mahr, idda and muta maintenance)","tatliq (judicial divorce for harm, Law 25/1929 art. 6 as amended by Law 100/1985)","divorce for polygamy harm (Law 25/1929 art. 11 bis, Law 100/1985)"],"src":"Khula (Law 1/2000 art. 20); family courts (Law 10/2004); draft family-law reform before parliament not enacted as of May 2026","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":30,"female":25},"src":"Modelled: marriage age rising; no decade series found","modelled":true}}}}},"gbr":{"country":"gbr","label":"United Kingdom","common":{"legal":{"minAgeWithConsent":{"v":16,"src":"Before 27 Feb 2023, 16- and 17-year-olds could marry in England and Wales with parental (or court) consent; Scotland allows 16 without consent and Northern Ireland 16 with consent (ONS; Marriage Act 1949 s.2 as then in force)","modelled":false},"consentRule":{"v":"self","src":"Both parties must freely consent; forced marriage is a criminal offence","modelled":false},"guardianApproval":{"v":"not required at 18; required for 16- and 17-year-olds before 27 Feb 2023","src":"Minimum Age Act 2022, in force 27 Feb 2023 (ONS)","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"England and Wales: civil and religious marriage, both recognised; cohabitation is common but has no legal status (no common-law marriage); polygamy is not recognised","modelled":false},"cohabitationRecognised":{"v":false,"src":"Common-law marriage has no legal standing in England and Wales; about 3.5 million cohabiting-couple families counted by ONS in 2024, with no automatic rights on death or separation","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamous marriages may not be performed in the UK; a second marriage while married is void and bigamy under s.57 Offences Against the Person Act 1861 (up to 7 years)","modelled":false},"foreignerRequirements":{"v":"Notice is referred to the Home Office if either party is subject to immigration control; the notice period may extend from 28 to 70 days; a valid immigration status is required to marry","src":"GOV.UK marriage guidance; council notice guides (28 days, 70 days on referral)","modelled":false},"interfaithRules":{"v":"No legal restriction on interfaith marriage; each faith sets its own ceremony rules","src":"England and Wales marriage law imposes no religious test","modelled":false},"prohibitedDegrees":{"v":"Close blood relatives, adoptive relationships, and anyone already married; under-18s since 27 Feb 2023","src":"Marriage Act 1949 as amended; Offences Against the Person Act 1861 s.57 (bigamy)","modelled":false},"religiousLawApplies":{"v":"Civil law governs; a religious ceremony is legally effective only if registered (authorised person or registrar present)","src":"Marriage Act 1949; GOV.UK marriage guidance","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"notice","name":"Give notice at the register office in the district where you live (in person, at least 29 days before the ceremony, within 12 months of it)","fee":46.5,"leadTimeDays":29,"documents":["passport or ID","proof of address","venue details"],"whoCanRefuse":"superintendent registrar / Home Office referral"},{"id":"banns_or_licence","name":"Church of England: banns read on three Sundays, or a licence; other faiths follow their own rites","fee":0,"leadTimeDays":21,"documents":["proof of connection to the parish"],"whoCanRefuse":"parish priest"},{"id":"ceremony","name":"Ceremony: register office, religious building, or approved venue, with two witnesses","fee":62,"leadTimeDays":1,"documents":["notice authority / schedule"],"whoCanRefuse":"registrar"},{"id":"certificate","name":"Marriage certificate issued after the ceremony","fee":12.5,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"GOV.UK: give notice at least 29 days before, 28 clear days displayed, fee 46.50 GBP per person (63 GBP on Home Office referral); register office ceremony 62 GBP; certificate 12.50 GBP (council guides, April 2026 rates)","modelled":false},"registrationAuthority":{"v":"Superintendent Registrar at the local register office; General Register Office keeps the record","src":"GOV.UK marriage guidance","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical examination is required to marry in England and Wales","modelled":false},"witnessesRequired":{"v":2,"src":"At least two witnesses are required at the ceremony (GOV.UK)","modelled":false},"documentsRequired":{"v":["passport or national ID","proof of address","venue details","divorce decree absolute / final order or death certificate if previously married"],"src":"GOV.UK documents to give notice; council notice guides","modelled":false},"whoCanRefuse":{"v":"Registrar refuses if either party is under 18, already married, or the marriage appears to be a sham (Home Office referral and investigation)","src":"Minimum Age Act 2022; sham-marriage referral scheme","modelled":false},"leadTimeDays":{"v":29,"src":"Notice must be given at least 29 days before the ceremony (GOV.UK)","modelled":false},"ceremonyTypes":{"v":["register office","Church of England (banns or licence)","other religious building","approved venue (hotel, barn, stately home)"],"src":"GOV.UK marriage venues; Church of England banns practice","modelled":false}},"customs":{"mahr":{"v":{"exists":true,"note":"Not part of mainstream custom; British Muslim families may agree a mahr privately as part of the marriage contract"},"src":"Modelled from British Muslim marriage practice; no mainstream custom","modelled":true},"shabka":{"v":{"exists":false,"note":"No shabka custom in mainstream UK weddings"},"src":"No shabka custom recorded in UK wedding practice","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz custom in mainstream UK weddings"},"src":"No gehaz custom recorded in UK wedding practice","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price in mainstream UK custom"},"src":"No bride-price custom recorded in UK wedding practice","modelled":false},"ring":{"v":{"payer":"groom","item":"engagement ring (traditionally diamond) and wedding rings exchanged at the ceremony","rangeByClass":{"poor":"under 500 GBP","middle":"1000-2500 GBP","rich":"5000+ GBP"}},"src":"Modelled ranges; no published class breakdown found","modelled":true},"gifts":{"v":"Wedding list (department store or online), cash gifts, and hen do / stag do celebrations","src":"UK wedding practice","modelled":true},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple typically buys a wedding outfit and sets up home together"},"src":"No trousseau custom recorded in UK wedding practice","modelled":false},"weddingFormats":{"v":["register office","church wedding","hotel / barn / stately home","garden wedding","destination wedding abroad"],"src":"UK wedding practice; Hitched survey formats","modelled":true},"typicalGuestCount":{"v":{"poor":30,"middle":80,"rich":150},"src":"Modelled from Hitched survey data (average guest count around 50-70 in 2025, falling over time)","modelled":true}},"costs":{"cateringPerGuest":{"v":100,"src":"Modelled 2026 GBP per guest for venue catering; Hitched reports 272 GBP total spend per guest in 2025 (venue + catering + all)","modelled":true},"photography":{"v":1500,"src":"Modelled 2026 GBP for a wedding photographer; no published price series found","modelled":true},"averageTotal":{"v":21990,"src":"Hitched National Wedding Survey: average UK wedding 21990 GBP in 2025 (2024: 23250 GBP), excluding ring and honeymoon","modelled":false},"averageTotalByClass":{"v":{"poor":8000,"middle":22000,"rich":60000},"src":"Modelled 2026 GBP from the Hitched average of 21990 GBP; no published class breakdown found","modelled":true},"currency":{"v":"GBP","src":"Pound sterling","modelled":false}},"money":{"propertyRegime":{"v":"separate","src":"Each spouse owns their own property; on divorce the court has wide discretion under Matrimonial Causes Act 1973 s.25, starting point 50/50 of matrimonial assets","modelled":false},"prenupEnforceability":{"v":"Not automatically binding, but decisive weight if freely entered into, with full disclosure and understanding, unless unfair (Radmacher v Granatino [2010] UKSC 42); a 2026 government consultation proposes binding qualifying nuptial agreements, not yet law","src":"Radmacher v Granatino [2010]; Osbornes Law 2026; Law Commission 2014 recommendation","modelled":false},"spouseInheritanceShare":{"v":"Intestacy (England and Wales): spouse gets personal possessions plus the first 322000 GBP and half of the rest if there are children; everything if there are no children (statutory legacy 322000 GBP from 2023)","src":"Administration of Estates Act 1925; statutory legacy 322000 GBP from 2023","modelled":false},"taxEffects":{"v":"Marriage allowance: transfer 1260 GBP of personal allowance to a spouse; spouse exemption from inheritance tax; no joint filing","src":"GOV.UK marriage allowance and inheritance tax spouse exemption","modelled":false},"benefits":{"v":"Bereavement Support Payment for a widowed spouse; married couple's allowance only if born before 6 April 1935","src":"GOV.UK bereavement support and married couple's allowance","modelled":false},"debtLiability":{"v":"separate; joint debts are joint liability","src":"England and Wales: no automatic liability for a spouse's debts","modelled":false}},"immigration":{"fianceRoute":{"v":{"route":"Fiance(e) visa","eligibility":"partner of a British citizen or settled person intending to marry within 6 months","requirements":["genuine relationship","sponsor income 29000 GBP since 11 Apr 2024","English A1","marry within 6 months"],"fee":2064,"feeNote":"Fee as for the partner visa from outside the UK; no right to work on a fiance visa","processingWeeks":12,"refusalAppeal":"administrative review / appeal on human-rights grounds","conditionsAfterArrival":"must marry within 6 months, then switch to FLR(M); no work allowed before marriage","pathToSettlement":"switch to partner route, ILR after 5 years on the partner route"},"src":"GOV.UK family visa (fiance route); fee and income rules as for the partner visa (2026 guides)","modelled":true},"processingTimeWeeks":{"v":12,"src":"Standard processing up to 12 weeks for overseas partner applications, 8 weeks inside the UK (2026 guides)","modelled":false},"refusalAppeal":{"v":"Administrative review, or appeal on human-rights grounds where applicable","src":"UK immigration appeal practice","modelled":true},"conditionsAfterArrival":{"v":"33 months initial leave, 30-month extension, ILR after 5 years; English A2 at extension, B1 plus Life in the UK test at settlement","src":"Appendix FM partner route (2026 guides)","modelled":false},"pathToSettlement":{"v":"ILR after 5 years on the partner route, then British citizenship after a further 12 months","src":"Appendix FM settlement rules","modelled":false}},"divorce":{"process":{"v":"Apply online (sole or joint); 20-week reflection period from issue; conditional order; then at least 6 weeks and 1 day before the final order; minimum about 6-7 months; court fee 628 GBP (2026)","src":"Divorce, Dissolution and Separation Act 2020 (in force 6 Apr 2022); GOV.UK; court fee 628 GBP (2026 guides)","modelled":false},"waitingPeriodDays":{"v":182,"src":"20 weeks to the conditional order plus 6 weeks and 1 day to the final order (2020 Act)","modelled":false},"cost":{"v":{"courtFee":628,"note":"Court fee 628 GBP (2026); solicitor costs vary widely and are extra"},"src":"Court fee 628 GBP (2026 guides)","modelled":false},"assetSplit":{"v":"Court discretion under Matrimonial Causes Act 1973 s.25: needs of the parties and children first, starting point 50/50 of matrimonial assets; prenups carry decisive weight if fair (Radmacher)","src":"Matrimonial Causes Act 1973 s.25; Radmacher v Granatino [2010]","modelled":false},"custodyDefault":{"v":"No default: child arrangements by agreement or court order; the child's welfare is paramount (Children Act 1989)","src":"Children Act 1989","modelled":false},"supportDefault":{"v":"Child maintenance via the Child Maintenance Service formula; spousal maintenance is needs-based with a clean break preferred","src":"Child Maintenance Service; Matrimonial Causes Act 1973","modelled":false},"remarriageRules":{"v":"Remarry after the final order; no waiting period; remarrying before the final order is bigamy","src":"Offences Against the Person Act 1861 s.57 (bigamy, up to 7 years)","modelled":false},"stigma":{"v":"Low: divorce is socially accepted; marriage rates in the 20s have fallen about 90% over 50 years","src":"Centre for Social Justice, I DO? The state of marriage in the UK (Feb 2026)","modelled":true},"familyReaction":{"v":"Family support is common; religious families may disapprove but have no legal say","src":"Modelled from UK social practice","modelled":true}},"social":{"familyApprovalWeight":{"v":"low to moderate","src":"The couple decides; a parental blessing is customary, not required","modelled":true},"attitudeInterfaith":{"v":"broadly accepted","src":"Modelled from UK social practice","modelled":true},"attitudeInterclass":{"v":"mild: class background is noticed socially but rarely blocks a match","src":"Modelled from UK social practice","modelled":true},"attitudeInterracial":{"v":"broadly accepted; some resistance in older generations","src":"Modelled from UK social practice","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from UK social practice","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from UK social practice","modelled":true},"roleExpectations":{"v":"Dual-earner norm since the 1980s; housework and childcare increasingly shared; no legal role rules","src":"Modelled from UK social practice","modelled":true}}},"eras":{"1960s":{"legal":{"minAgeMale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent; Scotland 16 without consent (ONS)","modelled":false},"minAgeFemale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false}},"costs":{"venues":{"family_home":{"v":100,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":360,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":720,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":1400,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":1000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":480,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":800,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":20,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":240,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":400,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":60,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":5,"src":"Modelled 1960s GBP per guest: the 2026 value (100 GBP) scaled by the game era price series at the era mid-year (1965); no published per-guest series found","modelled":true},"photography":{"v":71,"src":"Modelled 1960s GBP for a wedding photographer: the 2026 value (1500 GBP) scaled by the game era price series at the era mid-year (1965); no published price series found","modelled":true},"averageTotal":{"v":1046,"src":"Modelled 1960s GBP average wedding total (Hitched 2025 average 21990 GBP, scaled): the 2026 value (21990 GBP) scaled by the game era price series at the era mid-year (1965)","modelled":true},"averageTotalByClass":{"v":{"poor":380,"middle":1046,"rich":2853},"src":"Modelled 1960s GBP by class: the 2026 values scaled by the game era price series at the era mid-year (1965); no published class breakdown found","modelled":true}},"immigration":{"spouseRoute":{"v":{"route":"Appendix FM partner visa (before July 2012: no minimum income requirement)","eligibility":"partner of a British citizen or settled person; genuine relationship","requirements":["genuine relationship","adequate accommodation","English language"],"fee":null,"feeNote":"fee varied by year; no income threshold before 9 July 2012","processingWeeks":12,"refusalAppeal":"appeal on human-rights grounds","conditionsAfterArrival":"probationary period, then settlement","pathToSettlement":"indefinite leave to remain, then citizenship"},"src":"No minimum income requirement before 9 July 2012 (Appendix FM)","modelled":false}},"divorce":{"grounds":{"v":["irretrievable breakdown proved by one of five facts (Matrimonial Causes Act 1973, in force from 1971; before that, the old fault grounds)"],"src":"Divorce Reform Act 1969 (in force 1 Jan 1971) introduced irretrievable breakdown; Matrimonial Causes Act 1973 consolidated it","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":24,"female":22},"src":"Modelled from the ONS long-run trend (2023 mean 34.7 men / 33.0 women); 1960s averages were far lower","modelled":true}}},"1970s":{"legal":{"minAgeMale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false},"minAgeFemale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false}},"costs":{"venues":{"family_home":{"v":250,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":900,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":1800,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":3500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":2500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":1200,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":2000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":50,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":600,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":1000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":150,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":11,"src":"Modelled 1970s GBP per guest: the 2026 value (100 GBP) scaled by the game era price series at the era mid-year (1975); no published per-guest series found","modelled":true},"photography":{"v":165,"src":"Modelled 1970s GBP for a wedding photographer: the 2026 value (1500 GBP) scaled by the game era price series at the era mid-year (1975); no published price series found","modelled":true},"averageTotal":{"v":2412,"src":"Modelled 1970s GBP average wedding total (Hitched 2025 average 21990 GBP, scaled): the 2026 value (21990 GBP) scaled by the game era price series at the era mid-year (1975)","modelled":true},"averageTotalByClass":{"v":{"poor":877,"middle":2412,"rich":6581},"src":"Modelled 1970s GBP by class: the 2026 values scaled by the game era price series at the era mid-year (1975); no published class breakdown found","modelled":true}},"immigration":{"spouseRoute":{"v":{"route":"Appendix FM partner visa (before July 2012: no minimum income requirement)","eligibility":"partner of a British citizen or settled person; genuine relationship","requirements":["genuine relationship","adequate accommodation","English language"],"fee":null,"feeNote":"fee varied by year; no income threshold before 9 July 2012","processingWeeks":12,"refusalAppeal":"appeal on human-rights grounds","conditionsAfterArrival":"probationary period, then settlement","pathToSettlement":"indefinite leave to remain, then citizenship"},"src":"No minimum income requirement before 9 July 2012 (Appendix FM)","modelled":false}},"divorce":{"grounds":{"v":["irretrievable breakdown proved by one of five facts: adultery, unreasonable behaviour, desertion for 2 years, separation for 2 years with consent, separation for 5 years (Matrimonial Causes Act 1973)"],"src":"Divorce Reform Act 1969 / Matrimonial Causes Act 1973: sole ground irretrievable breakdown, proved by five facts","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":25,"female":23},"src":"Modelled from the ONS long-run trend","modelled":true}}},"1980s":{"legal":{"minAgeMale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false},"minAgeFemale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false}},"costs":{"venues":{"family_home":{"v":625,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":2250,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":4500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":8750,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":6250,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":3000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":5000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":125,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":1500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":2500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":375,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":30,"src":"Modelled 1980s GBP per guest: the 2026 value (100 GBP) scaled by the game era price series at the era mid-year (1985); no published per-guest series found","modelled":true},"photography":{"v":455,"src":"Modelled 1980s GBP for a wedding photographer: the 2026 value (1500 GBP) scaled by the game era price series at the era mid-year (1985); no published price series found","modelled":true},"averageTotal":{"v":6675,"src":"Modelled 1980s GBP average wedding total (Hitched 2025 average 21990 GBP, scaled): the 2026 value (21990 GBP) scaled by the game era price series at the era mid-year (1985)","modelled":true},"averageTotalByClass":{"v":{"poor":2428,"middle":6675,"rich":18214},"src":"Modelled 1980s GBP by class: the 2026 values scaled by the game era price series at the era mid-year (1985); no published class breakdown found","modelled":true}},"immigration":{"spouseRoute":{"v":{"route":"Appendix FM partner visa (before July 2012: no minimum income requirement)","eligibility":"partner of a British citizen or settled person; genuine relationship","requirements":["genuine relationship","adequate accommodation","English language"],"fee":null,"feeNote":"fee varied by year; no income threshold before 9 July 2012","processingWeeks":12,"refusalAppeal":"appeal on human-rights grounds","conditionsAfterArrival":"probationary period, then settlement","pathToSettlement":"indefinite leave to remain, then citizenship"},"src":"No minimum income requirement before 9 July 2012 (Appendix FM)","modelled":false}},"divorce":{"grounds":{"v":["irretrievable breakdown proved by one of five facts: adultery, unreasonable behaviour, desertion for 2 years, separation for 2 years with consent, separation for 5 years (Matrimonial Causes Act 1973)"],"src":"Matrimonial Causes Act 1973: sole ground irretrievable breakdown, proved by five facts","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":26,"female":24},"src":"Modelled from the ONS long-run trend","modelled":true}}},"1990s":{"legal":{"minAgeMale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false},"minAgeFemale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false}},"costs":{"venues":{"family_home":{"v":1125,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":4050,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":8100,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":15750,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":11250,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":5400,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":9000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":225,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":2700,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":4500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":675,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":47,"src":"Modelled 1990s GBP per guest: the 2026 value (100 GBP) scaled by the game era price series at the era mid-year (1995); no published per-guest series found","modelled":true},"photography":{"v":707,"src":"Modelled 1990s GBP for a wedding photographer: the 2026 value (1500 GBP) scaled by the game era price series at the era mid-year (1995); no published price series found","modelled":true},"averageTotal":{"v":10358,"src":"Modelled 1990s GBP average wedding total (Hitched 2025 average 21990 GBP, scaled): the 2026 value (21990 GBP) scaled by the game era price series at the era mid-year (1995)","modelled":true},"averageTotalByClass":{"v":{"poor":3768,"middle":10358,"rich":28261},"src":"Modelled 1990s GBP by class: the 2026 values scaled by the game era price series at the era mid-year (1995); no published class breakdown found","modelled":true}},"immigration":{"spouseRoute":{"v":{"route":"Appendix FM partner visa (before July 2012: no minimum income requirement)","eligibility":"partner of a British citizen or settled person; genuine relationship","requirements":["genuine relationship","adequate accommodation","English language"],"fee":null,"feeNote":"fee varied by year; no income threshold before 9 July 2012","processingWeeks":12,"refusalAppeal":"appeal on human-rights grounds","conditionsAfterArrival":"probationary period, then settlement","pathToSettlement":"indefinite leave to remain, then citizenship"},"src":"No minimum income requirement before 9 July 2012 (Appendix FM)","modelled":false}},"divorce":{"grounds":{"v":["irretrievable breakdown proved by one of five facts: adultery, unreasonable behaviour, desertion for 2 years, separation for 2 years with consent, separation for 5 years (Matrimonial Causes Act 1973)"],"src":"Matrimonial Causes Act 1973: sole ground irretrievable breakdown, proved by five facts","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":28,"female":26},"src":"Modelled from the ONS long-run trend","modelled":true}}},"2000s":{"legal":{"minAgeMale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false},"minAgeFemale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent (ONS)","modelled":false}},"costs":{"venues":{"family_home":{"v":1625,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":5850,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":11700,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":22750,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":16250,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":7800,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":13000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":325,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":3900,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":6500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":975,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":56,"src":"Modelled 2000s GBP per guest: the 2026 value (100 GBP) scaled by the game era price series at the era mid-year (2005); no published per-guest series found","modelled":true},"photography":{"v":842,"src":"Modelled 2000s GBP for a wedding photographer: the 2026 value (1500 GBP) scaled by the game era price series at the era mid-year (2005); no published price series found","modelled":true},"averageTotal":{"v":12345,"src":"Modelled 2000s GBP average wedding total (Hitched 2025 average 21990 GBP, scaled): the 2026 value (21990 GBP) scaled by the game era price series at the era mid-year (2005)","modelled":true},"averageTotalByClass":{"v":{"poor":4491,"middle":12345,"rich":33683},"src":"Modelled 2000s GBP by class: the 2026 values scaled by the game era price series at the era mid-year (2005); no published class breakdown found","modelled":true}},"immigration":{"spouseRoute":{"v":{"route":"Appendix FM partner visa (before July 2012: no minimum income requirement)","eligibility":"partner of a British citizen or settled person; genuine relationship","requirements":["genuine relationship","adequate accommodation","English language"],"fee":null,"feeNote":"fee varied by year; no income threshold before 9 July 2012","processingWeeks":12,"refusalAppeal":"appeal on human-rights grounds","conditionsAfterArrival":"probationary period, then settlement","pathToSettlement":"indefinite leave to remain, then citizenship"},"src":"Band uses the pre-July-2012 position; the 18600 GBP threshold arrived 9 July 2012 (Appendix FM)","modelled":false}},"divorce":{"grounds":{"v":["irretrievable breakdown proved by one of five facts: adultery, unreasonable behaviour, desertion for 2 years, separation for 2 years with consent, separation for 5 years (Matrimonial Causes Act 1973)"],"src":"Matrimonial Causes Act 1973: sole ground irretrievable breakdown, proved by five facts","modelled":false}},"money":{"prenupEnforceability":{"v":"Little weight before Radmacher: prenups were generally not enforced (Radmacher v Granatino [2010] UKSC 42 changed this at the end of the decade)","src":"Radmacher v Granatino [2010] UKSC 42","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":30,"female":28},"src":"Modelled from the ONS long-run trend","modelled":true}}},"2010s":{"legal":{"minAgeMale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent; raised to 18 on 27 Feb 2023 (ONS)","modelled":false},"minAgeFemale":{"v":18,"src":"Marriage Act 1949 s.2 (as then in force): 18 without parental consent; 16 with parental consent; raised to 18 on 27 Feb 2023 (ONS)","modelled":false}},"costs":{"venues":{"family_home":{"v":2125,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"local_hall":{"v":7650,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_4star":{"v":15300,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"hotel_5star":{"v":29750,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"resort":{"v":21250,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"garden":{"v":10200,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"destination":{"v":17000,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"registry":{"v":425,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"restaurant":{"v":5100,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"traditional":{"v":8500,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true},"elopement":{"v":1275,"src":"Fallback era snapshot only (v86.58 Phase 3): the 2026 js/08 venue table scaled by a modelled decade factor (1960s 0.04, 1970s 0.10, 1980s 0.25, 1990s 0.45, 2000s 0.65, 2010s 0.85). The live venue price is the 2026 price times the game era price series (wlCountryPriceFactor), handed out by wlMarriageProfile() in js/08c — one source of truth, shared by the profile and the engine; no era venue-price series found","modelled":true}},"cateringPerGuest":{"v":71,"src":"Modelled 2010s GBP per guest: the 2026 value (100 GBP) scaled by the game era price series at the era mid-year (2015); no published per-guest series found","modelled":true},"photography":{"v":1060,"src":"Modelled 2010s GBP for a wedding photographer: the 2026 value (1500 GBP) scaled by the game era price series at the era mid-year (2015); no published price series found","modelled":true},"averageTotal":{"v":15545,"src":"Modelled 2010s GBP average wedding total (Hitched 2025 average 21990 GBP, scaled): the 2026 value (21990 GBP) scaled by the game era price series at the era mid-year (2015)","modelled":true},"averageTotalByClass":{"v":{"poor":5655,"middle":15545,"rich":42415},"src":"Modelled 2010s GBP by class: the 2026 values scaled by the game era price series at the era mid-year (2015); no published class breakdown found","modelled":true}},"immigration":{"spouseRoute":{"v":{"route":"Appendix FM partner visa","eligibility":"partner of a British citizen or settled person; genuine relationship","requirements":["sponsor gross income at least 18600 GBP a year, plus 3800 for a first child and 2400 per additional child","English A1 at first application","adequate accommodation"],"fee":1523,"feeNote":"fee as of the mid-2010s; check current GOV.UK schedule","processingWeeks":12,"refusalAppeal":"administrative review / appeal on human-rights grounds","conditionsAfterArrival":"33 months initial, 30-month extension, ILR after 5 years","pathToSettlement":"ILR after 5 years, then citizenship after 12 months"},"src":"Appendix FM minimum income requirement 18600 GBP (plus 3800 first child, 2400 each other) from 9 July 2012; English A1 (GOV.UK)","modelled":false}},"divorce":{"grounds":{"v":["irretrievable breakdown proved by one of five facts: adultery, unreasonable behaviour, desertion for 2 years, separation for 2 years with consent, separation for 5 years (Matrimonial Causes Act 1973)"],"src":"Matrimonial Causes Act 1973 until the 2020 Act came into force on 6 Apr 2022","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":32,"female":30},"src":"Modelled from the ONS long-run trend (2013 mean 32.5 men / 30.6 women, first marriages)","modelled":true}}},"2020s":{"legal":{"minAgeMale":{"v":18,"src":"Minimum Age Act 2022, in force 27 Feb 2023: 18 in England and Wales, no exceptions (ONS)","modelled":false},"minAgeFemale":{"v":18,"src":"Minimum Age Act 2022, in force 27 Feb 2023: 18 in England and Wales, no exceptions (ONS)","modelled":false},"minAgeWithConsent":{"v":null,"src":"Since 27 Feb 2023 there is no route to marry at 16 or 17 in England and Wales, with or without consent (ONS)","modelled":false}},"costs":{"venues":{"family_home":{"v":2500,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"local_hall":{"v":9000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"hotel_4star":{"v":18000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"hotel_5star":{"v":35000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"resort":{"v":25000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"garden":{"v":12000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"destination":{"v":20000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"registry":{"v":500,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"restaurant":{"v":6000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"traditional":{"v":10000,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true},"elopement":{"v":1500,"src":"World Life js/08-data-marriage.js MARRIAGE_WEDDING_VENUES (modelled estimates per that file, see docs/UNSOURCED-PRICES.md)","modelled":true}}},"immigration":{"spouseRoute":{"v":{"route":"Appendix FM partner visa","eligibility":"partner of a British citizen or settled person; genuine relationship","requirements":["sponsor gross income at least 29000 GBP a year since 11 April 2024 (no extra amount for children)","English A1 at first application, A2 at extension, B1 at settlement","adequate accommodation"],"fee":2064,"feeNote":"Fee 2064 GBP applying from outside the UK, plus Immigration Health Surcharge 1035 GBP per year (GOV.UK, 2026)","processingWeeks":12,"refusalAppeal":"administrative review / appeal on human-rights grounds","conditionsAfterArrival":"33 months initial, 30-month extension, ILR after 5 years; English B1 + Life in the UK test for settlement","pathToSettlement":"ILR after 5 years, then citizenship after 12 months"},"src":"Appendix FM: 29000 GBP sponsor income since 11 Apr 2024 (was 18600 GBP); fee 2064 GBP abroad + Immigration Health Surcharge 1035 GBP/year (GOV.UK, 2026)","modelled":false}},"divorce":{"grounds":{"v":["irretrievable breakdown, stated by one or both spouses; no blame and no facts to prove (Divorce, Dissolution and Separation Act 2020, in force 6 April 2022)"],"src":"Divorce, Dissolution and Separation Act 2020, in force 6 Apr 2022","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":35,"female":33},"src":"ONS Marriages in England and Wales 2023: mean age at first marriage 34.7 men / 33.0 women","modelled":false}}}}},"usa":{"country":"usa","label":"United States","common":{"legal":{"minAgeMale":{"v":18,"src":"General marriage age 18 in all states except Nebraska (19) and Mississippi (21); state tables 2026 (Wikipedia, Marriage age in the United States; FindLaw).","modelled":false},"minAgeFemale":{"v":18,"src":"General marriage age 18 in all states except Nebraska (19) and Mississippi (21); state tables 2026 (Wikipedia, Marriage age in the United States; FindLaw).","modelled":false},"minAgeWithConsent":{"v":16,"src":"Most states that still allow under-18 marriage set the floor at 16 with parental and/or court consent; 18 states ban under-18 marriage outright (2026 state tables). National roll-up, modelled.","modelled":true},"consentRule":{"v":"Parent or guardian consent and/or court approval for under-18s, where the state allows it; 18 states ban under-18 marriage outright.","src":"Most states that still allow under-18 marriage set the floor at 16 with parental and/or court consent; 18 states ban under-18 marriage outright (2026 state tables). National roll-up, modelled.","modelled":false},"guardianApproval":{"v":"The couple themselves; a parent/guardian and/or a judge only for under-18s where allowed.","src":"The couple themselves; a parent/guardian and/or a judge only for under-18s where allowed.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Fixed union-type list for the game; polygamy excluded because bigamy is illegal in every US state.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Fixed union-type list for the game; polygamy excluded because bigamy is illegal in every US state. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Bigamy is illegal in all US states; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"No residence requirement to marry; a marriage licence from the county clerk and valid ID. Marriage alone gives no immigration status.","src":"County clerk licence rules; immigration status is separate from marriage.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"No state restricts marriage by religion.","modelled":false},"prohibitedDegrees":{"v":"First-cousin marriage is allowed in about half the states and banned or restricted in the rest.","src":"State marriage statutes vary on cousin marriage.","modelled":true},"religiousLawApplies":{"v":"Civil law governs; a religious ceremony is legally effective only if performed by an authorised officiant and the licence is filed with the county.","src":"US marriage law (licence + authorised officiant).","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"apply_for_a_marriage_licence_at_the_county_clerk","name":"Apply for a marriage licence at the county clerk","fee":50,"leadTimeDays":0,"documents":["photo ID","birth certificate where required"],"whoCanRefuse":"county clerk if ID or age rules fail"},{"id":"wait_out_any_state_waiting_period","name":"Wait out any state waiting period","fee":0,"leadTimeDays":3,"documents":[],"whoCanRefuse":"none"},{"id":"ceremony_by_an_authorised_officiant","name":"Ceremony by an authorised officiant","fee":0,"leadTimeDays":0,"documents":["licence"],"whoCanRefuse":"officiant"},{"id":"return_the_signed_licence_for_recording","name":"Return the signed licence for recording","fee":0,"leadTimeDays":30,"documents":["signed licence"],"whoCanRefuse":"county clerk if incomplete"}],"src":"Standard county-clerk licence process; fees and waiting periods vary by state, modelled mid-points.","modelled":true},"leadTimeDays":{"v":0,"src":"No waiting period in most states, up to 5 days in some; modelled as 0.","modelled":true},"registrationAuthority":{"v":"County clerk / recorder","src":"Marriage licences are issued and recorded by the county.","modelled":false},"witnessesRequired":{"v":0,"src":"Witnesses required in some states (usually 1-2), none in others; modelled as 0.","modelled":true},"medicalExamRequired":{"v":false,"src":"No US state requires a premarital blood test or medical exam; the last state requirements were repealed by 2019.","modelled":false},"documentsRequired":{"v":["photo ID","birth certificate where required","divorce decree or death certificate if previously married","Social Security number in some states"],"src":"US county-clerk licence requirements.","modelled":false},"whoCanRefuse":{"v":"The county clerk refuses if either party is under the state minimum age, already married, or lacks valid ID; the officiant may refuse to perform the ceremony.","src":"US county-clerk practice.","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the courthouse","religious ceremony by an authorised officiant","outdoor / destination ceremony"],"src":"US wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; engagement and wedding rings are the customary payments"},"src":"Engagement and wedding rings are the main customary payments; no mahr or dowry custom. Ring average from The Knot.","modelled":true},"shabka":{"v":{"exists":false,"note":"No shabka custom; an engagement ring is the customary gift."},"src":"No shabka custom recorded in US wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz custom; the couple furnishes their home together, often with a wedding registry."},"src":"No gehaz custom recorded in US wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in US wedding practice.","modelled":false},"gifts":{"v":"Wedding registry, cash gifts and honeymoon fund.","src":"US wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in US wedding practice.","modelled":false},"ring":{"v":{"payer":"groom","item":"An engagement ring from the proposer, then wedding bands exchanged at the ceremony."},"src":"Common US custom.","modelled":true},"weddingFormats":{"v":["Courthouse ceremony","Garden wedding","Hotel ballroom","Destination wedding","Church wedding"],"src":"Common US wedding formats.","modelled":true},"typicalGuestCount":{"v":117,"src":"The Knot 2026 Real Weddings Study: average wedding $34,200 excluding engagement ring, average 117 guests.","modelled":false}},"costs":{"venues":{"family_home":{"v":3000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"local_hall":{"v":12000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_4star":{"v":25000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_5star":{"v":50000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"resort":{"v":30000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"garden":{"v":15000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"destination":{"v":25000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"registry":{"v":800,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"restaurant":{"v":8000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"traditional":{"v":12000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"elopement":{"v":2000,"src":"Modelled estimate anchored to The Knot 2026 average wedding $34,200; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true}},"cateringPerGuest":{"v":70,"src":"The Knot: catering about $7,000 for 100 guests.","modelled":false},"photography":{"v":2500,"src":"Typical professional photo package $2,000-$3,000; modelled mid-point.","modelled":true},"averageTotal":{"v":34200,"src":"The Knot 2026 Real Weddings Study: average wedding $34,200 excluding engagement ring, average 117 guests.","modelled":false},"currency":{"v":"USD","src":"Local currency (USD).","modelled":false},"averageTotalByClass":{"v":{"poor":12000,"middle":34000,"rich":85000},"src":"Modelled from The Knot 2026 average of $34,200 (median $24,000); no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Varies by state: 9 community-property states, 41 equitable-distribution states.","src":"US family law: 9 community-property states, the rest equitable distribution.","modelled":false},"prenupEnforceability":{"v":true,"src":"Prenups generally enforceable if voluntary, in writing, with full disclosure; Uniform Premarital Agreement Act adopted in most states.","modelled":false},"spouseInheritanceShare":{"v":"Varies by state: a surviving spouse typically takes a large share, or all if there are no children; an elective share protects against disinheritance.","src":"State intestacy and elective-share rules.","modelled":true},"taxEffects":{"v":"Married couples may file jointly; marriage can raise or lower the tax bill (marriage penalty or bonus).","src":"US federal tax: joint filing for married couples.","modelled":false},"benefits":{"v":"Spousal Social Security, employer health cover, inheritance and hospital-visiting rights.","src":"Federal and state spousal benefits.","modelled":false},"debtLiability":{"v":"separate in most states; community-property states (9) share debts incurred during the marriage; joint debts are joint liability.","src":"US community-property vs common-law states.","modelled":false}},"immigration":{"spouseRoute":{"v":{"destination":"usa","name":"CR-1 / IR-1 immigrant visa (already married) or K-1 fiance visa (to marry in the US)","fee":1355,"requirements":["US citizen or permanent-resident petitioner","valid marriage","affidavit of support","medical exam","consular interview"]},"src":"USCIS / State Department spouse and fiance visa categories. | CR-1 government fees about $1,355 plus the medical exam (I-130 $675 paper / $625 online, visa fee $325, USCIS immigrant fee $235), 2026 fee schedule. | CR-1/IR-1 requirements (USCIS / State Department).","modelled":false},"fianceRoute":{"v":{"exists":true,"note":"K-1 — must marry within 90 days; government fees about 2640"},"src":"K-1 fiance visa: enter to marry within 90 days; total government fees about $2,640 including later adjustment of status.","modelled":false},"processingTimeWeeks":{"v":69,"src":"CR-1 typically 16-24 months from filing to visa; modelled mid-point of the low end. (converted from months at 4.33 weeks per month)","modelled":true},"conditionsAfterArrival":{"v":"A CR-1/IR-1 spouse is a permanent resident on entry and may work at once; a K-1 entrant must adjust status first.","src":"CR-1/IR-1 vs K-1 work rights.","modelled":false},"pathToSettlement":{"v":{"residence":"CR-1 gives conditional residence if married under 2 years (remove conditions with Form I-751); IR-1 gives full permanent residence.","citizenshipYears":3},"src":"Immigration Marriage Fraud Amendments 1986; USCIS. | A spouse of a US citizen may naturalise after 3 years as a permanent resident.","modelled":true},"refusalAppeal":{"v":"No direct appeal of a consular visa refusal; the remedy is re-filing, a waiver (Form I-601) where available, or a USCIS appeal if the petition itself was denied.","src":"USCIS / State Department guidance (mendozafirm.com / marcanolegal.com).","modelled":false}},"divorce":{"grounds":{"v":["No-fault (irreconcilable differences) in every state; fault grounds also exist in many states."],"src":"No-fault divorce is available in every US state.","modelled":false},"process":{"v":"File a petition in state court; Serve the other spouse; Agree or litigate property, support and custody; Court issues a divorce decree","src":"Standard US state-court divorce process.","modelled":true},"waitingPeriodDays":{"v":0,"src":"Some states require a separation period of 6-12 months; modelled as 0. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":15000},"src":"A contested divorce commonly costs $15,000 or more; uncontested is far less; modelled.","modelled":true},"assetSplit":{"v":"Equitable distribution in most states; an equal split of community property in the 9 community-property states.","src":"US property-division rules.","modelled":false},"custodyDefault":{"v":"Best interests of the child; joint custody is common.","src":"State custody standard.","modelled":false},"supportDefault":{"v":"Child support by state formula; spousal support based on need, length of marriage and income.","src":"State support rules.","modelled":false},"remarriageRules":{"v":"No waiting period before remarriage","src":"No general waiting period; a few states impose a short remarriage bar after divorce.","modelled":true},"stigma":{"v":"Low; divorce is common and socially accepted.","src":"US social attitudes to divorce.","modelled":true},"familyReaction":{"v":"Family support is common; religious families may disapprove but have no legal say.","src":"Modelled from US family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.45,"src":"Game model estimate: family approval matters but rarely decides.","modelled":true},"attitudeInterfaith":{"v":"Generally accepted.","src":"US social attitudes.","modelled":true},"attitudeInterclass":{"v":"Generally accepted; income gaps are a common source of friction.","src":"US social attitudes.","modelled":true},"attitudeInterracial":{"v":"Legal since Loving v Virginia (1967); socially accepted by most, with regional variation.","src":"Loving v Virginia, 1967.","modelled":false},"attitudeAgeGap":{"v":"Small gaps are normal; large gaps draw comment.","src":"US social attitudes.","modelled":true},"attitudeDivorcedPartner":{"v":"Normal; remarriage after divorce is common.","src":"US social attitudes.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":30,"female":28},"src":"US Census: median age at first marriage about 30 for men, 28 for women (2023).","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; roles are negotiated, not fixed.","src":"US social attitudes.","modelled":true}}},"eras":{"1960s":{"costs":{"cateringPerGuest":{"v":7,"src":"Modelled 1960s USD per guest: the 2026 value (70 USD) scaled by the game era price series at the era mid-year (1965); no published per-guest series found","modelled":true},"photography":{"v":236,"src":"Modelled 1960s USD for a wedding photographer: the 2026 value (2500 USD) scaled by the game era price series at the era mid-year (1965); no published price series found","modelled":true},"averageTotal":{"v":3228,"src":"Modelled 1960s USD average wedding total (The Knot 2026 average 34200 USD, scaled): the 2026 value (34200 USD) scaled by the game era price series at the era mid-year (1965)","modelled":true}},"legal":{"minAgeWithConsent":{"v":16,"src":"Most states allowed 16-17 with consent; several allowed younger with court approval.","modelled":true}},"money":{"prenupEnforceability":{"v":"limited","src":"Before the UPAA (1983) prenups were often unenforceable or viewed with suspicion; outcome varied by state.","modelled":true}},"immigration":{"spouseRoute":{"v":{"destination":"usa","name":"Immediate-relative petition under the Immigration and Nationality Act (1965); no K-1 yet (created 1970).","fee":1355,"requirements":["US citizen or permanent-resident petitioner","valid marriage","affidavit of support","medical exam","consular interview"]},"src":"INA 1965 family preference system. | CR-1 government fees about $1,355 plus the medical exam (I-130 $675 paper / $625 online, visa fee $325, USCIS immigrant fee $235), 2026 fee schedule. | CR-1/IR-1 requirements (USCIS / State Department).","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"No fiance visa route in this era"},"src":"The K-1 fiance visa did not exist yet; it was created in 1970.","modelled":false},"processingTimeWeeks":{"v":69,"src":"CR-1 typically 16-24 months from filing to visa; modelled mid-point of the low end. (converted from months at 4.33 weeks per month)","modelled":true},"pathToSettlement":{"v":{"residence":"CR-1 gives conditional residence if married under 2 years (remove conditions with Form I-751); IR-1 gives full permanent residence.","citizenshipYears":3},"src":"Immigration Marriage Fraud Amendments 1986; USCIS. | A spouse of a US citizen may naturalise after 3 years as a permanent resident.","modelled":true}},"divorce":{"grounds":{"v":["Fault only in most states: adultery, cruelty, desertion. California introduces no-fault in 1969 (effective 1970)."],"src":"Pre-no-fault US divorce law; California Family Law Act 1969.","modelled":false}},"social":{"attitudeInterracial":{"v":"Banned in 16 states until Loving v Virginia (1967).","src":"Loving v Virginia, 1967.","modelled":false},"typicalAgeAtMarriage":{"v":{"male":23,"female":20},"src":"US Census median age at first marriage 1960: men 22.8, women 20.3.","modelled":false}}},"1970s":{"costs":{"cateringPerGuest":{"v":11,"src":"Modelled 1970s USD per guest: the 2026 value (70 USD) scaled by the game era price series at the era mid-year (1975); no published per-guest series found","modelled":true},"photography":{"v":403,"src":"Modelled 1970s USD for a wedding photographer: the 2026 value (2500 USD) scaled by the game era price series at the era mid-year (1975); no published price series found","modelled":true},"averageTotal":{"v":5513,"src":"Modelled 1970s USD average wedding total (The Knot 2026 average 34200 USD, scaled): the 2026 value (34200 USD) scaled by the game era price series at the era mid-year (1975)","modelled":true}},"money":{"prenupEnforceability":{"v":"limited","src":"Prenups still unevenly enforced before the UPAA (1983).","modelled":true}},"divorce":{"grounds":{"v":["No-fault spreads after California (1970); most states are still fault-based at the start of the decade."],"src":"California no-fault 1970; other states follow through the 1970s.","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":23,"female":21},"src":"US Census median age at first marriage 1970: men 23.2, women 21.0.","modelled":false}}},"1980s":{"costs":{"cateringPerGuest":{"v":23,"src":"Modelled 1980s USD per guest: the 2026 value (70 USD) scaled by the game era price series at the era mid-year (1985); no published per-guest series found","modelled":true},"photography":{"v":806,"src":"Modelled 1980s USD for a wedding photographer: the 2026 value (2500 USD) scaled by the game era price series at the era mid-year (1985); no published price series found","modelled":true},"averageTotal":{"v":11019,"src":"Modelled 1980s USD average wedding total (The Knot 2026 average 34200 USD, scaled): the 2026 value (34200 USD) scaled by the game era price series at the era mid-year (1985)","modelled":true}},"money":{"prenupEnforceability":{"v":true,"src":"UPAA (1983) adopted by a growing majority of states; prenups generally enforceable.","modelled":false}},"immigration":{"spouseRoute":{"v":{"destination":"usa","name":"CR-1 / IR-1; Immigration Marriage Fraud Amendments (1986) add 2-year conditional residence for marriages under 2 years.","fee":1355,"requirements":["US citizen or permanent-resident petitioner","valid marriage","affidavit of support","medical exam","consular interview"]},"src":"IMFA 1986. | CR-1 government fees about $1,355 plus the medical exam (I-130 $675 paper / $625 online, visa fee $325, USCIS immigrant fee $235), 2026 fee schedule. | CR-1/IR-1 requirements (USCIS / State Department).","modelled":false},"processingTimeWeeks":{"v":69,"src":"CR-1 typically 16-24 months from filing to visa; modelled mid-point of the low end. (converted from months at 4.33 weeks per month)","modelled":true},"pathToSettlement":{"v":{"residence":"CR-1 gives conditional residence if married under 2 years (remove conditions with Form I-751); IR-1 gives full permanent residence.","citizenshipYears":3},"src":"Immigration Marriage Fraud Amendments 1986; USCIS. | A spouse of a US citizen may naturalise after 3 years as a permanent resident.","modelled":true}},"divorce":{"grounds":{"v":["No-fault available in most states by the mid-1980s."],"src":"No-fault adoption across US states in the 1970s-1980s.","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":25,"female":22},"src":"US Census median age at first marriage 1980: men 24.7, women 22.0.","modelled":false}}},"1990s":{"costs":{"cateringPerGuest":{"v":32,"src":"Modelled 1990s USD per guest: the 2026 value (70 USD) scaled by the game era price series at the era mid-year (1995); no published per-guest series found","modelled":true},"photography":{"v":1141,"src":"Modelled 1990s USD for a wedding photographer: the 2026 value (2500 USD) scaled by the game era price series at the era mid-year (1995); no published price series found","modelled":true},"averageTotal":{"v":15610,"src":"Modelled 1990s USD average wedding total (The Knot 2026 average 34200 USD, scaled): the 2026 value (34200 USD) scaled by the game era price series at the era mid-year (1995)","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":26,"female":24},"src":"US Census median age at first marriage 1990: men 26.1, women 23.9.","modelled":false}}},"2000s":{"costs":{"cateringPerGuest":{"v":41,"src":"Modelled 2000s USD per guest: the 2026 value (70 USD) scaled by the game era price series at the era mid-year (2005); no published per-guest series found","modelled":true},"photography":{"v":1462,"src":"Modelled 2000s USD for a wedding photographer: the 2026 value (2500 USD) scaled by the game era price series at the era mid-year (2005); no published price series found","modelled":true},"averageTotal":{"v":20006,"src":"Modelled 2000s USD average wedding total (The Knot 2026 average 34200 USD, scaled): the 2026 value (34200 USD) scaled by the game era price series at the era mid-year (2005)","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":27,"female":25},"src":"US Census median age at first marriage 2000: men 27.1, women 25.1.","modelled":false}}},"2010s":{"costs":{"cateringPerGuest":{"v":50,"src":"Modelled 2010s USD per guest: the 2026 value (70 USD) scaled by the game era price series at the era mid-year (2015); no published per-guest series found","modelled":true},"photography":{"v":1775,"src":"Modelled 2010s USD for a wedding photographer: the 2026 value (2500 USD) scaled by the game era price series at the era mid-year (2015); no published price series found","modelled":true},"averageTotal":{"v":24280,"src":"Modelled 2010s USD average wedding total (The Knot 2026 average 34200 USD, scaled): the 2026 value (34200 USD) scaled by the game era price series at the era mid-year (2015)","modelled":true}},"legal":{"minAgeWithConsent":{"v":16,"src":"Bans on under-18 marriage begin (first state ban 2018); most states still allow 16-17 with consent.","modelled":true}},"divorce":{"grounds":{"v":["No-fault in all states after New York (2010)."],"src":"New York adopts no-fault divorce, 2010.","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":28,"female":26},"src":"US Census median age at first marriage 2010: men 28.2, women 26.1.","modelled":false}}},"2020s":{"legal":{"minAgeWithConsent":{"v":16,"src":"18 states ban under-18 marriage outright (2026); the rest allow 16-17 with parental and/or court consent.","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":30,"female":28},"src":"US Census: median age at first marriage about 30 for men, 28 for women (2023).","modelled":false}}}}},"sau":{"country":"sau","label":"Saudi Arabia","common":{"legal":{"minAgeMale":{"v":18,"src":"No statutory minimum age before 2019; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeFemale":{"v":18,"src":"No statutory minimum age before 2019; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeWithConsent":{"v":15,"src":"2019 reform: 18 is the minimum, with 15–17 by special court approval.","modelled":false},"consentRule":{"v":"The bride must consent herself; her male guardian (wali) contracts the marriage. A guardian may not contract it without her consent under the 2022 law.","src":"Saudi Personal Status Law, Royal Decree M/73 (2022), in force 18 Jun 2022; Implementing Regulations published 21 Feb 2025.","modelled":false},"guardianApproval":{"v":"The wali (guardian) contracts the marriage; the bride's own consent is required; a court decides under-18 cases.","src":"The wali (guardian) contracts the marriage; the bride's own consent is required; a court decides under-18 cases.","modelled":false},"recognizedUnions":{"v":["dating","engagement","religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood","polygamy"],"src":"Marriage is a religious contract; cohabitation and civil marriage are not recognised.","modelled":false},"cohabitationRecognised":{"v":false,"src":"Marriage is a religious contract; cohabitation and civil marriage are not recognised. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Islamic law permits a Muslim man up to four wives if he can treat them equitably; 2022 law requires court permission for a further marriage, assessing the first wife's rights and the husband's capacity.","modelled":false},"foreignerRequirements":{"v":"A foreigner needs a valid residence permit (iqama) and, for marriage to a Saudi, permission from the authorities; rules are stricter for a Saudi woman marrying a foreigner.","src":"Saudi marriage permission rules for mixed marriages.","modelled":true},"interfaithRules":{"v":"A Muslim man may marry a Muslim, Christian or Jewish woman; a Muslim woman may marry only a Muslim man.","src":"Sharia rules on interfaith marriage.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted.","src":"Sharia kinship rules.","modelled":false},"religiousLawApplies":{"v":"Sharia personal status law governs Muslim marriages","src":"Saudi Personal Status Law, Royal Decree M/73 (2022), in force 18 Jun 2022; Implementing Regulations published 21 Feb 2025.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"agree_the_marriage_contract_aqd_al_zawaj_with_mahr_witnesses_and_guardian","name":"Agree the marriage contract (aqd al-zawaj) with mahr, witnesses and guardian","fee":0,"leadTimeDays":7,"documents":["IDs","family cards"],"whoCanRefuse":"guardian, or the bride herself"},{"id":"medical_screening_before_marriage","name":"Medical screening before marriage","fee":300,"leadTimeDays":3,"documents":["IDs"],"whoCanRefuse":"health authority if screening is refused"},{"id":"contract_concluded_by_a_licensed_ma_zoun_and_registered_with_the_court","name":"Contract concluded by a licensed ma'zoun and registered with the court","fee":500,"leadTimeDays":1,"documents":["marriage contract","witness statements"],"whoCanRefuse":"court if requirements fail"}],"src":"Saudi marriage contract process; fees modelled.","modelled":true},"leadTimeDays":{"v":0,"src":"No fixed waiting period; modelled as 0.","modelled":true},"registrationAuthority":{"v":"Court / ma'zoun (licensed marriage official)","src":"Saudi Personal Status Law, Royal Decree M/73 (2022), in force 18 Jun 2022; Implementing Regulations published 21 Feb 2025.","modelled":false},"witnessesRequired":{"v":2,"src":"At least two adult Muslim male witnesses.","modelled":true},"medicalExamRequired":{"v":true,"src":"Premarital medical screening is mandatory (genetic blood disorders and infectious diseases), booked via the Sehhaty app at accredited hospitals (Ministry of Justice requirements; soulofsaudi.com).","modelled":false},"documentsRequired":{"v":["national ID or iqama and passport","premarital medical screening report from an accredited hospital","bride's guardian (wali) with ID","two male Muslim witnesses who know the bride and her guardian","divorce decree or death certificate if previously married","government approval (tasreeh) for a Saudi marrying a foreign national"],"src":"Saudi Ministry of Justice marriage-contract requirements (work.smartjobbox.com).","modelled":false},"whoCanRefuse":{"v":"The ma'zoun or court refuses if the wali is absent, the medical screening is missing, either party is under 18 without court approval, or a Saudi marrying a foreigner lacks government approval.","src":"Saudi Personal Status Law (Royal Decree M/73, 2022) art. 13; Ministry of Justice requirements.","modelled":false},"ceremonyTypes":{"v":["nikah (marriage contract) before a ma'zoun or at court","milkah (engagement contract)","wedding celebration in a hall (qasr al-afrah)","family majlis reception"],"src":"Saudi wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"id":"mahr","label":"Mahr (dowry from groom to bride)","defaultPayer":"groom","rangeLow":20000,"rangeHigh":150000,"currency":"SAR","note":"Prompt and/or deferred mahr, agreed in the contract; ranges are modelled by class."},"src":"Mahr is a required part of the contract; gold and a large celebration are customary. Ranges modelled.","modelled":true},"shabka":{"v":{"id":"shabka","label":"Gold and jewellery for the bride","defaultPayer":"groom","rangeLow":10000,"rangeHigh":80000,"currency":"SAR","note":"Modelled range by class."},"src":"Mahr is a required part of the contract; gold and a large celebration are customary. Ranges modelled.","modelled":true},"gehaz":{"v":{"exists":false,"note":"No gehaz custom; the groom furnishes the marital home."},"src":"No gehaz custom recorded in Saudi wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price separate from the mahr; the mahr is the groom's payment to the bride."},"src":"No separate bride-price custom; mahr is the payment.","modelled":false},"gifts":{"v":"Gold jewellery and cash gifts from relatives; the groom's family hosts the celebration.","src":"Saudi wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the groom furnishes the home."},"src":"No trousseau custom recorded in Saudi wedding practice.","modelled":false},"ring":{"v":{"payer":"groom","item":"Gold jewellery and a ring from the groom are customary; the engagement (milkah) is the contract itself."},"src":"Saudi custom.","modelled":true},"weddingFormats":{"v":["Family celebration","Wedding hall","Luxury hotel ballroom","Large segregated celebration"],"src":"Common Saudi wedding formats.","modelled":true},"typicalGuestCount":{"v":300,"src":"Large family weddings of several hundred guests are the norm; modelled mid-point.","modelled":true}},"costs":{"venues":{"family_home":{"v":12000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"local_hall":{"v":45000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_4star":{"v":90000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_5star":{"v":180000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"resort":{"v":120000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"garden":{"v":55000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"destination":{"v":100000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"registry":{"v":2000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"restaurant":{"v":30000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"traditional":{"v":50000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"elopement":{"v":6000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true}},"cateringPerGuest":{"v":150,"src":"Typical wedding catering SAR 100-200 per guest; modelled mid-point.","modelled":true},"photography":{"v":8000,"src":"Professional photo and video SAR 5,000-12,000; modelled.","modelled":true},"averageTotal":{"v":150000,"src":"Modelled average for a mid-range Saudi wedding including hall, catering and gold; no published national average found.","modelled":true},"currency":{"v":"SAR","src":"Local currency (SAR).","modelled":false},"averageTotalByClass":{"v":{"poor":60000,"middle":150000,"rich":600000},"src":"Modelled from the average of SAR 150,000; luxury Riyadh/Jeddah weddings SAR 1,500,000–5,000,000+ (The Bridal Tip / Arabian Business).","modelled":true}},"money":{"propertyRegime":{"v":"Separate property: each spouse keeps what is theirs; the wife keeps her mahr and property.","src":"Sharia property rules.","modelled":false},"prenupEnforceability":{"v":"conditions","src":"Conditions written into the marriage contract are enforceable if they do not contradict Sharia; a separate prenup is not a recognised instrument.","modelled":true},"spouseInheritanceShare":{"v":"Sharia shares (fara'id): a wife takes 1/8 if there are children, 1/4 if not; a husband takes 1/4 with children, 1/2 without.","src":"Sharia inheritance rules.","modelled":false},"taxEffects":{"v":"No income tax on individuals; zakat applies to wealth.","src":"Saudi tax rules.","modelled":false},"benefits":{"v":"A husband must maintain (nafaqa) his wife and children: housing, food, clothing.","src":"Sharia maintenance duty.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for their own debts; the husband alone bears the maintenance duty.","src":"Sharia-based maintenance duty.","modelled":false}},"immigration":{"spouseRoute":{"v":{"destination":"sau","name":"Family residence visa (iqama) sponsored by the resident spouse; family visit visa for short stays","fee":2000,"requirements":["sponsor with valid iqama and income","attested marriage certificate","medical exam","passport"]},"src":"Saudi family sponsorship system. | Residence permit fees around SAR 500 per year per dependent plus visa fees; modelled. | Saudi family visa requirements.","modelled":true},"fianceRoute":{"v":{"exists":false,"note":"No fiance visa route in this era"},"src":"No fiance visa: the couple must already be married for family sponsorship.","modelled":false},"processingTimeWeeks":{"v":9,"src":"Family visa processing typically 1-3 months; modelled. (converted from months at 4.33 weeks per month)","modelled":true},"conditionsAfterArrival":{"v":"A sponsored spouse may not work without a separate work permit and sponsor transfer.","src":"Saudi iqama rules.","modelled":false},"pathToSettlement":{"v":{"residence":"Residence (iqama) renewed yearly while the sponsor keeps status; no route to citizenship by marriage alone.","citizenshipYears":null},"src":"Saudi residence rules. | No path to Saudi citizenship through marriage alone; citizenship is by royal grant.","modelled":true},"refusalAppeal":{"v":"No formal appeal of a family visa refusal; fix the cause (sponsor income, unattested certificate, name mismatch) and reapply.","src":"Saudi family visa practice.","modelled":false}},"divorce":{"grounds":{"v":["Talaq (husband pronounces divorce), khula (wife seeks divorce, usually returning the mahr), or court divorce for harm or non-maintenance."],"src":"Saudi Personal Status Law, Royal Decree M/73 (2022), in force 18 Jun 2022; Implementing Regulations published 21 Feb 2025.","modelled":false},"process":{"v":"File with the personal status court; Reconciliation session; Court issues the divorce and orders maintenance, custody and division","src":"Saudi Personal Status Law divorce process.","modelled":true},"waitingPeriodDays":{"v":91,"src":"Waiting period (iddah) of about three months. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":10000},"src":"Court fees are low; lawyer costs vary; modelled.","modelled":true},"assetSplit":{"v":"Separate property: each keeps their own; the wife keeps her mahr and deferred mahr; maintenance and housing may be ordered.","src":"Sharia property and maintenance rules.","modelled":false},"custodyDefault":{"v":"Custody (hadana) usually to the mother for young children; the 2022 law sets custody to age 15, then the child chooses.","src":"Saudi Personal Status Law, Royal Decree M/73 (2022), in force 18 Jun 2022; Implementing Regulations published 21 Feb 2025.","modelled":true},"supportDefault":{"v":"The father pays maintenance (nafaqa) for children and, during iddah, for the wife.","src":"Sharia maintenance rules.","modelled":false},"remarriageRules":{"v":"Must wait 3 months after divorce before remarrying","src":"A divorced woman must complete the iddah (about 3 months) before remarrying.","modelled":true},"stigma":{"v":"Divorce is legal and common, but still carries social weight, more for women.","src":"Saudi social attitudes.","modelled":true},"familyReaction":{"v":"Family mediation comes first; elders commonly press for reconciliation; a divorced woman often returns to her father's home.","src":"Modelled from Saudi family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.9,"src":"Game model estimate: family approval is decisive in most marriages.","modelled":true},"attitudeInterfaith":{"v":"A Muslim woman marrying a non-Muslim man is not permitted; a Muslim man marrying a Christian or Jewish woman is permitted.","src":"Sharia rules.","modelled":false},"attitudeInterclass":{"v":"Class and tribe matter; families prefer matches of similar standing.","src":"Saudi social attitudes.","modelled":true},"attitudeInterracial":{"v":"Nationality matters: marrying a foreigner needs permission and faces family resistance.","src":"Saudi social attitudes.","modelled":true},"attitudeAgeGap":{"v":"Large age gaps are common and accepted, especially for a first wife.","src":"Saudi social attitudes.","modelled":true},"attitudeDivorcedPartner":{"v":"Divorced women face more stigma than divorced men; remarriage is common for both.","src":"Saudi social attitudes.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":28,"female":25},"src":"Game model estimate: median age at first marriage has risen with education and work; modelled.","modelled":true},"roleExpectations":{"v":"Traditional roles are the default: the husband provides, the wife manages the home; working wives are increasingly common.","src":"Saudi social attitudes.","modelled":true}}},"eras":{"1960s":{"costs":{"cateringPerGuest":{"v":22,"src":"Modelled 1960s SAR per guest: the 2026 value (150 SAR) scaled by the game era price series at the era mid-year (1965); no published per-guest series found","modelled":true},"photography":{"v":1176,"src":"Modelled 1960s SAR for a wedding photographer: the 2026 value (8000 SAR) scaled by the game era price series at the era mid-year (1965); no published price series found","modelled":true},"averageTotal":{"v":22059,"src":"Modelled 1960s SAR average wedding total: the 2026 value (150000 SAR) scaled by the game era price series at the era mid-year (1965)","modelled":true}},"legal":{"minAgeMale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeFemale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"consentRule":{"v":"The bride's consent is sought, but the guardian's word carries the most weight; no codified law.","src":"Pre-codification Saudi practice; no statutory minimum age existed.","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":25,"female":18},"src":"Modelled: early marriage was the norm in the 1960s.","modelled":true}}},"1970s":{"costs":{"cateringPerGuest":{"v":50,"src":"Modelled 1970s SAR per guest: the 2026 value (150 SAR) scaled by the game era price series at the era mid-year (1975); no published per-guest series found","modelled":true},"photography":{"v":2667,"src":"Modelled 1970s SAR for a wedding photographer: the 2026 value (8000 SAR) scaled by the game era price series at the era mid-year (1975); no published price series found","modelled":true},"averageTotal":{"v":49998,"src":"Modelled 1970s SAR average wedding total: the 2026 value (150000 SAR) scaled by the game era price series at the era mid-year (1975)","modelled":true}},"legal":{"minAgeMale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeFemale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":25,"female":19},"src":"Modelled: early marriage remained the norm.","modelled":true}}},"1980s":{"costs":{"cateringPerGuest":{"v":75,"src":"Modelled 1980s SAR per guest: the 2026 value (150 SAR) scaled by the game era price series at the era mid-year (1985); no published per-guest series found","modelled":true},"photography":{"v":4021,"src":"Modelled 1980s SAR for a wedding photographer: the 2026 value (8000 SAR) scaled by the game era price series at the era mid-year (1985); no published price series found","modelled":true},"averageTotal":{"v":75396,"src":"Modelled 1980s SAR average wedding total: the 2026 value (150000 SAR) scaled by the game era price series at the era mid-year (1985)","modelled":true}},"legal":{"minAgeMale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeFemale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":26,"female":20},"src":"Modelled.","modelled":true}}},"1990s":{"costs":{"cateringPerGuest":{"v":83,"src":"Modelled 1990s SAR per guest: the 2026 value (150 SAR) scaled by the game era price series at the era mid-year (1995); no published per-guest series found","modelled":true},"photography":{"v":4453,"src":"Modelled 1990s SAR for a wedding photographer: the 2026 value (8000 SAR) scaled by the game era price series at the era mid-year (1995); no published price series found","modelled":true},"averageTotal":{"v":83499,"src":"Modelled 1990s SAR average wedding total: the 2026 value (150000 SAR) scaled by the game era price series at the era mid-year (1995)","modelled":true}},"legal":{"minAgeMale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeFemale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":26,"female":21},"src":"Modelled.","modelled":true}}},"2000s":{"costs":{"cateringPerGuest":{"v":83,"src":"Modelled 2000s SAR per guest: the 2026 value (150 SAR) scaled by the game era price series at the era mid-year (2005); no published per-guest series found","modelled":true},"photography":{"v":4415,"src":"Modelled 2000s SAR for a wedding photographer: the 2026 value (8000 SAR) scaled by the game era price series at the era mid-year (2005); no published price series found","modelled":true},"averageTotal":{"v":82790,"src":"Modelled 2000s SAR average wedding total: the 2026 value (150000 SAR) scaled by the game era price series at the era mid-year (2005)","modelled":true}},"legal":{"minAgeMale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeFemale":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No statutory minimum age before the Dec 2019 reform; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15–17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":27,"female":22},"src":"Modelled.","modelled":true}}},"2010s":{"costs":{"cateringPerGuest":{"v":124,"src":"Modelled 2010s SAR per guest: the 2026 value (150 SAR) scaled by the game era price series at the era mid-year (2015); no published per-guest series found","modelled":true},"photography":{"v":6612,"src":"Modelled 2010s SAR for a wedding photographer: the 2026 value (8000 SAR) scaled by the game era price series at the era mid-year (2015); no published price series found","modelled":true},"averageTotal":{"v":123972,"src":"Modelled 2010s SAR average wedding total: the 2026 value (150000 SAR) scaled by the game era price series at the era mid-year (2015)","modelled":true}},"legal":{"minAgeMale":{"v":18,"src":"No statutory minimum age before 2019; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15-17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeFemale":{"v":18,"src":"No statutory minimum age before 2019; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15-17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeWithConsent":{"v":15,"src":"2019 reform: 18 is the minimum, with 15-17 by special court approval.","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":28,"female":24},"src":"Modelled.","modelled":true}}},"2020s":{"legal":{"minAgeMale":{"v":18,"src":"No statutory minimum age before 2019; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15-17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeFemale":{"v":18,"src":"No statutory minimum age before 2019; Justice Ministry circular Dec 2019 and Shura Council Jan 2019 set 18, with 15-17 by special court approval (Saudi Gazette via Adomonline; The Week, Dec 2019).","modelled":false},"minAgeWithConsent":{"v":15,"src":"2019 reform: 18 is the minimum, with 15-17 by special court approval.","modelled":false},"consentRule":{"v":"The bride must consent herself; her guardian contracts the marriage, but the 2025 Implementing Regulations curtail guardianship abuse (adhl) and forced marriage.","src":"Saudi Personal Status Law, Royal Decree M/73 (2022), in force 18 Jun 2022; Implementing Regulations published 21 Feb 2025.","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Islamic law permits a Muslim man up to four wives if he can treat them equitably; 2022 law requires court permission for a further marriage, assessing the first wife's rights and the husband's capacity. Court permission is required for a further marriage under the 2022 law.","modelled":false}},"divorce":{"grounds":{"v":["Talaq, khula (eased under the 2022 law), or court divorce for harm or non-maintenance."],"src":"Saudi Personal Status Law, Royal Decree M/73 (2022), in force 18 Jun 2022; Implementing Regulations published 21 Feb 2025.","modelled":false},"custodyDefault":{"v":"Custody to the mother until age 15, then the child chooses (2022 law).","src":"Saudi Personal Status Law, Royal Decree M/73 (2022), in force 18 Jun 2022; Implementing Regulations published 21 Feb 2025.","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":28,"female":25},"src":"Game model estimate; modelled.","modelled":true}}}}},"uae":{"country":"uae","label":"United Arab Emirates","common":{"legal":{"minAgeMale":{"v":18,"src":"Federal Decree-Law No. 41 of 2024 on Personal Status, in force 15 Apr 2025: legal capacity for marriage at 18 Gregorian years; under-18 only with court permission (Cabinet Resolution 212 of 2025).","modelled":false},"minAgeFemale":{"v":18,"src":"Federal Decree-Law No. 41 of 2024 on Personal Status, in force 15 Apr 2025: legal capacity for marriage at 18 Gregorian years; under-18 only with court permission (Cabinet Resolution 212 of 2025).","modelled":false},"minAgeWithConsent":{"v":18,"src":"Under 18 only with court permission under the early-marriage rules (Cabinet Resolution 212 of 2025); parental consent alone is not enough.","modelled":false},"consentRule":{"v":"Both spouses must consent freely; for a Muslim marriage a guardian (wali) is also part of the contract, except for a non-UAE Muslim woman whose national law does not require one.","src":"Federal Decree-Law No. 41 of 2024 on Personal Status, in force 15 Apr 2025: legal capacity for marriage at 18 Gregorian years; under-18 only with court permission (Cabinet Resolution 212 of 2025).","modelled":false},"guardianApproval":{"v":"The couple themselves; a guardian for Muslim marriages; a court for under-18 cases.","src":"The couple themselves; a guardian for Muslim marriages; a court for under-18 cases.","modelled":false},"recognizedUnions":{"v":["dating","engagement","religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood","polygamy"],"src":"Marriage is a Sharia contract for Muslims; civil marriage for non-Muslims only arrived in the 2020s.","modelled":false},"cohabitationRecognised":{"v":false,"src":"Marriage is a Sharia contract for Muslims; civil marriage for non-Muslims only arrived in the 2020s. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"UAE Personal Status Law (Sharia) permits a Muslim man up to four wives with equal treatment; a Muslim woman may not marry a non-Muslim man.","modelled":false},"foreignerRequirements":{"v":"A foreigner needs a valid residence visa and, for a Sharia marriage, the guardian and court requirements; non-Muslims may use the civil route or their embassy.","src":"UAE marriage requirements for residents and visitors.","modelled":true},"interfaithRules":{"v":"A Muslim woman may not marry a non-Muslim man; a Muslim man may marry a Muslim, Christian or Jewish woman. Civil marriage has no religious test.","src":"Sharia rules; civil marriage framework.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted.","src":"Sharia kinship rules.","modelled":false},"religiousLawApplies":{"v":"Sharia personal status law governs Muslim marriages; civil personal status law governs non-Muslim marriages","src":"Federal Decree-Law No. 41 of 2024 on Personal Status, in force 15 Apr 2025: legal capacity for marriage at 18 Gregorian years; under-18 only with court permission (Cabinet Resolution 212 of 2025). Federal Decree-Law No. 41 of 2022 on Civil Personal Status (non-Muslims, in force 1 Feb 2023); Abu Dhabi Law No. 14 of 2021 civil marriage from age 18; Dubai civil marriage requires 21.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"premarital_medical_screening_mandatory_for_sharia_marriages","name":"Premarital medical screening (mandatory for Sharia marriages)","fee":500,"leadTimeDays":3,"documents":["IDs","residence visas"],"whoCanRefuse":"health authority"},{"id":"marriage_contract_before_the_sharia_court_or_civil_marriage_application","name":"Marriage contract before the Sharia court, or civil marriage application","fee":1000,"leadTimeDays":7,"documents":["passports","residence visas","guardian consent where required","medical results"],"whoCanRefuse":"court if requirements fail"},{"id":"registration_and_attestation_of_the_marriage_certificate","name":"Registration and attestation of the marriage certificate","fee":500,"leadTimeDays":7,"documents":["marriage certificate"],"whoCanRefuse":"court if documents are incomplete"}],"src":"UAE marriage process; fees modelled.","modelled":true},"leadTimeDays":{"v":0,"src":"No fixed waiting period; modelled as 0.","modelled":true},"registrationAuthority":{"v":"Sharia court, or the Civil Family Court for civil marriage","src":"UAE court system.","modelled":false},"witnessesRequired":{"v":2,"src":"Two witnesses for a Sharia marriage.","modelled":true},"medicalExamRequired":{"v":true,"src":"Premarital medical screening is mandatory for Sharia marriages (Dubai Courts; DHA 2026 standards); genetic testing mandatory where either partner is a UAE national (from Jan 2025).","modelled":false},"documentsRequired":{"v":["passports of both partners","Emirates ID (residents)","premarital medical screening certificate from an approved centre","bride's guardian (wali) with passport or Emirates ID","two male Muslim witnesses with passports or Emirates IDs","agreed mahr amount","divorce or death certificate if previously married"],"src":"Dubai Courts marriage-contract requirements (dubaicourtmarriage.com / marriageindubai.ae).","modelled":false},"whoCanRefuse":{"v":"The Sharia court refuses if the wali is absent, the medical screening is missing, either party is under 18 without court approval, or a Muslim woman is marrying a non-Muslim man.","src":"UAE Personal Status Law (Federal Decree-Law No. 41 of 2024).","modelled":false},"ceremonyTypes":{"v":["nikah before the Sharia court","civil marriage at the Abu Dhabi Judicial Department (non-Muslims, from 2022)","wedding celebration in a hotel ballroom","family majlis reception"],"src":"UAE wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"id":"mahr","label":"Mahr (dowry from groom to bride, Muslim marriages)","defaultPayer":"groom","rangeLow":20000,"rangeHigh":200000,"currency":"AED","note":"Prompt and/or deferred mahr; ranges modelled by class."},"src":"Mahr and gold for Muslim marriages; large hotel celebrations are customary. Ranges modelled.","modelled":true},"shabka":{"v":{"id":"shabka","label":"Gold and jewellery for the bride","defaultPayer":"groom","rangeLow":15000,"rangeHigh":100000,"currency":"AED","note":"Modelled range by class."},"src":"Mahr and gold for Muslim marriages; large hotel celebrations are customary. Ranges modelled.","modelled":true},"gehaz":{"v":{"exists":false,"note":"No gehaz custom; the groom furnishes the marital home."},"src":"No gehaz custom recorded in UAE wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price separate from the mahr."},"src":"No separate bride-price custom; mahr is the payment.","modelled":false},"gifts":{"v":"Gold jewellery and cash gifts from relatives; wedding cash envelopes (noqta).","src":"UAE wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the groom furnishes the home."},"src":"No trousseau custom recorded in UAE wedding practice.","modelled":false},"ring":{"v":{"payer":"groom","item":"Gold jewellery and rings from the groom are customary for Muslim weddings; rings are exchanged in civil and church weddings too."},"src":"UAE custom.","modelled":true},"weddingFormats":{"v":["Hotel ballroom","Resort wedding","Family celebration","Civil ceremony","Church or temple ceremony"],"src":"Common UAE wedding formats.","modelled":true},"typicalGuestCount":{"v":250,"src":"Large hotel weddings of 200-300 guests are the norm; modelled mid-point.","modelled":true}},"costs":{"venues":{"family_home":{"v":12000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"local_hall":{"v":45000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_4star":{"v":90000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_5star":{"v":180000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"resort":{"v":120000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"garden":{"v":55000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"destination":{"v":100000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"registry":{"v":2000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"restaurant":{"v":30000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"traditional":{"v":50000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"elopement":{"v":6000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true}},"cateringPerGuest":{"v":200,"src":"Hotel banquet catering AED 150-250 per guest; modelled mid-point.","modelled":true},"photography":{"v":10000,"src":"Professional photo and video AED 8,000-15,000; modelled.","modelled":true},"averageTotal":{"v":200000,"src":"Modelled average for a mid-range UAE hotel wedding; no published national average found.","modelled":true},"currency":{"v":"AED","src":"Local currency (AED).","modelled":false},"averageTotalByClass":{"v":{"poor":80000,"middle":200000,"rich":600000},"src":"Modelled from the average of AED 200,000; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Separate property: each spouse keeps what is theirs; joint assets are split by agreement or court order.","src":"UAE property rules.","modelled":false},"prenupEnforceability":{"v":true,"src":"A marriage contract or prenuptial agreement is generally enforceable if it is written, agreed and does not contradict public policy; non-Muslims may also register wills and agreements.","modelled":true},"spouseInheritanceShare":{"v":"Sharia shares for Muslims (wife 1/8 with children, 1/4 without); non-Muslims may register a will (DIFC / ADJD) to choose their own split.","src":"Sharia inheritance; UAE wills registration for non-Muslims.","modelled":false},"taxEffects":{"v":"No income tax on individuals; no joint filing.","src":"UAE tax rules.","modelled":false},"benefits":{"v":"A husband must maintain his wife under Sharia; a sponsored spouse gets residence, health cover through the sponsor, and inheritance rights.","src":"UAE family rules.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for their own debts.","src":"UAE property rules.","modelled":false}},"immigration":{"spouseRoute":{"v":{"destination":"uae","name":"Spouse residence visa sponsored by the resident partner","fee":3000,"requirements":["sponsor with valid residence visa and minimum salary (about AED 4,000-10,000)","attested marriage certificate","medical exam","passport"]},"src":"UAE family sponsorship system. | Residence visa fees around AED 2,000-4,000 including medical and Emirates ID; modelled. | UAE family sponsorship requirements; salary threshold is modelled.","modelled":true},"fianceRoute":{"v":{"exists":false,"note":"No fiance visa route in this era"},"src":"No fiance visa: the couple must already be married for spouse sponsorship; a visit visa can be used to marry in the UAE.","modelled":false},"processingTimeWeeks":{"v":4,"src":"Spouse residence visas typically take 2-6 weeks; modelled as 1 month. (converted from months at 4.33 weeks per month)","modelled":true},"conditionsAfterArrival":{"v":"A sponsored spouse may work if the employer obtains a work permit; residence alone does not give work rights.","src":"UAE labour rules.","modelled":false},"pathToSettlement":{"v":{"residence":"Residence visa renewed with the sponsor, usually 2-3 years at a time; long-term Golden Visa routes exist for some professions.","citizenshipYears":null},"src":"UAE residence rules. | No path to UAE citizenship through marriage alone; citizenship is by rare grant.","modelled":true},"refusalAppeal":{"v":"No formal appeal of a family visa refusal; fix the cause (sponsor salary below AED 4,000, unattested certificate, tenancy or fines) and reapply.","src":"UAE family visa practice (wathim.com / familyvisa.ae).","modelled":false}},"divorce":{"grounds":{"v":["Talaq (husband), khula (wife), or court divorce for harm, non-maintenance or desertion; no-fault divorce on the civil track for non-Muslims."],"src":"UAE Personal Status Law; Federal Decree-Law 41 of 2022 civil track.","modelled":false},"process":{"v":"File with the Family Guidance section for reconciliation; Court case if reconciliation fails; Court orders divorce, custody, maintenance and division","src":"UAE divorce process.","modelled":true},"waitingPeriodDays":{"v":91,"src":"Waiting period (iddah) of about three months for Muslim divorces. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":20000},"src":"Court fees are modest; lawyer costs dominate; modelled.","modelled":true},"assetSplit":{"v":"Separate property; the court may divide joint assets and order maintenance; civil-track divorces split assets by agreement or court order.","src":"UAE property and divorce rules.","modelled":true},"custodyDefault":{"v":"Custody continues until the child turns 18, for boys and girls alike (2024 law).","src":"Federal Decree-Law No. 41 of 2024: custody continues until the child turns 18, for boys and girls alike.","modelled":false},"supportDefault":{"v":"The father pays child maintenance; the wife may receive maintenance during iddah and, on the civil track, support by court order.","src":"UAE maintenance rules.","modelled":false},"remarriageRules":{"v":"Must wait 3 months after divorce before remarrying","src":"A divorced Muslim woman must complete the iddah (about 3 months) before remarrying.","modelled":true},"stigma":{"v":"Divorce is legal and increasingly common among expats; still sensitive in Emirati families.","src":"UAE social attitudes.","modelled":true},"familyReaction":{"v":"Family mediation comes first; elders commonly press for reconciliation.","src":"Modelled from UAE family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.7,"src":"Game model estimate: family approval matters a lot for Emiratis, less for expats.","modelled":true},"attitudeInterfaith":{"v":"A Muslim woman marrying a non-Muslim man is not permitted under Sharia; civil marriage gives non-Muslims another route.","src":"Sharia rules; civil framework.","modelled":false},"attitudeInterclass":{"v":"Class and nationality matter; families prefer matches of similar standing.","src":"UAE social attitudes.","modelled":true},"attitudeInterracial":{"v":"Mixed-nationality marriages are common among expats; Emirati families often prefer Emirati matches.","src":"UAE social attitudes.","modelled":true},"attitudeAgeGap":{"v":"Large age gaps are accepted, especially for a first wife.","src":"UAE social attitudes.","modelled":true},"attitudeDivorcedPartner":{"v":"Divorced partners face some stigma in Emirati families; remarriage is normal among expats.","src":"UAE social attitudes.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":30,"female":27},"src":"Game model estimate: later marriage among expats and educated Emiratis; modelled.","modelled":true},"roleExpectations":{"v":"Traditional roles are the default for Emirati families; expat couples usually share earning and home duties.","src":"UAE social attitudes.","modelled":true}}},"eras":{"1960s":{"costs":{"cateringPerGuest":{"v":12,"src":"Modelled 1960s AED per guest: the 2026 value (200 AED) scaled by the game era price series at the era mid-year (1965); no published per-guest series found","modelled":true},"photography":{"v":601,"src":"Modelled 1960s AED for a wedding photographer: the 2026 value (10000 AED) scaled by the game era price series at the era mid-year (1965); no published price series found","modelled":true},"averageTotal":{"v":12023,"src":"Modelled 1960s AED average wedding total: the 2026 value (200000 AED) scaled by the game era price series at the era mid-year (1965)","modelled":true},"currency":{"v":"AED-equivalent (pre-dirham)","src":"Pre-dirham emirate currency (not unified); the UAE dirham begins circulating in 1973, so values for this era are AED-equivalent.","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":26,"female":20},"src":"Modelled: early marriage was the norm before the federation.","modelled":true}}},"1970s":{"costs":{"cateringPerGuest":{"v":20,"src":"Modelled 1970s AED per guest: the 2026 value (200 AED) scaled by the game era price series at the era mid-year (1975); no published per-guest series found","modelled":true},"photography":{"v":980,"src":"Modelled 1970s AED for a wedding photographer: the 2026 value (10000 AED) scaled by the game era price series at the era mid-year (1975); no published price series found","modelled":true},"averageTotal":{"v":19605,"src":"Modelled 1970s AED average wedding total: the 2026 value (200000 AED) scaled by the game era price series at the era mid-year (1975)","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":27,"female":21},"src":"Modelled.","modelled":true}}},"1980s":{"costs":{"cateringPerGuest":{"v":47,"src":"Modelled 1980s AED per guest: the 2026 value (200 AED) scaled by the game era price series at the era mid-year (1985); no published per-guest series found","modelled":true},"photography":{"v":2345,"src":"Modelled 1980s AED for a wedding photographer: the 2026 value (10000 AED) scaled by the game era price series at the era mid-year (1985); no published price series found","modelled":true},"averageTotal":{"v":46894,"src":"Modelled 1980s AED average wedding total: the 2026 value (200000 AED) scaled by the game era price series at the era mid-year (1985)","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":28,"female":22},"src":"Modelled.","modelled":true}}},"1990s":{"costs":{"cateringPerGuest":{"v":95,"src":"Modelled 1990s AED per guest: the 2026 value (200 AED) scaled by the game era price series at the era mid-year (1995); no published per-guest series found","modelled":true},"photography":{"v":4744,"src":"Modelled 1990s AED for a wedding photographer: the 2026 value (10000 AED) scaled by the game era price series at the era mid-year (1995); no published price series found","modelled":true},"averageTotal":{"v":94873,"src":"Modelled 1990s AED average wedding total: the 2026 value (200000 AED) scaled by the game era price series at the era mid-year (1995)","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":28,"female":23},"src":"Modelled.","modelled":true}}},"2000s":{"costs":{"cateringPerGuest":{"v":127,"src":"Modelled 2000s AED per guest: the 2026 value (200 AED) scaled by the game era price series at the era mid-year (2005); no published per-guest series found","modelled":true},"photography":{"v":6352,"src":"Modelled 2000s AED for a wedding photographer: the 2026 value (10000 AED) scaled by the game era price series at the era mid-year (2005); no published price series found","modelled":true},"averageTotal":{"v":127040,"src":"Modelled 2000s AED average wedding total: the 2026 value (200000 AED) scaled by the game era price series at the era mid-year (2005)","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":29,"female":25},"src":"Modelled.","modelled":true}}},"2010s":{"costs":{"cateringPerGuest":{"v":173,"src":"Modelled 2010s AED per guest: the 2026 value (200 AED) scaled by the game era price series at the era mid-year (2015); no published per-guest series found","modelled":true},"photography":{"v":8664,"src":"Modelled 2010s AED for a wedding photographer: the 2026 value (10000 AED) scaled by the game era price series at the era mid-year (2015); no published price series found","modelled":true},"averageTotal":{"v":173271,"src":"Modelled 2010s AED average wedding total: the 2026 value (200000 AED) scaled by the game era price series at the era mid-year (2015)","modelled":true}},"social":{"typicalAgeAtMarriage":{"v":{"male":29,"female":26},"src":"Modelled.","modelled":true}}},"2020s":{"legal":{"minAgeMale":{"v":18,"src":"Federal Decree-Law No. 41 of 2024 on Personal Status, in force 15 Apr 2025: legal capacity for marriage at 18 Gregorian years; under-18 only with court permission (Cabinet Resolution 212 of 2025).","modelled":false},"minAgeFemale":{"v":18,"src":"Federal Decree-Law No. 41 of 2024 on Personal Status, in force 15 Apr 2025: legal capacity for marriage at 18 Gregorian years; under-18 only with court permission (Cabinet Resolution 212 of 2025).","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood","polygamy"],"src":"Federal Decree-Law No. 41 of 2022 on Civil Personal Status (non-Muslims, in force 1 Feb 2023); Abu Dhabi Law No. 14 of 2021 civil marriage from age 18; Dubai civil marriage requires 21. Cohabitation was decriminalised in 2020 (Federal Decree-Law 15 of 2020).","modelled":false},"civilUnionNonMuslimOnly":{"v":true,"src":"Federal Decree-Law No. 41 of 2022 on Civil Personal Status (non-Muslims, in force 1 Feb 2023); Abu Dhabi Law No. 14 of 2021.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Federal Decree-Law No. 41 of 2022 on Civil Personal Status (non-Muslims, in force 1 Feb 2023); Abu Dhabi Law No. 14 of 2021 civil marriage from age 18; Dubai civil marriage requires 21. Cohabitation was decriminalised in 2020 (Federal Decree-Law 15 of 2020). (derived: cohabitation in the union list)","modelled":false}},"divorce":{"grounds":{"v":["Talaq, khula, or court divorce; no-fault divorce on the civil track for non-Muslims (Federal Decree-Law 41 of 2022)."],"src":"Federal Decree-Law 41 of 2022, civil track.","modelled":false},"custodyDefault":{"v":"Custody continues until the child turns 18, for boys and girls alike (2024 law).","src":"Federal Decree-Law No. 41 of 2024: custody continues until the child turns 18, for boys and girls alike.","modelled":false}},"social":{"typicalAgeAtMarriage":{"v":{"male":30,"female":27},"src":"Game model estimate; modelled.","modelled":true}}}}},"deu":{"country":"deu","label":"Germany","common":{"legal":{"minAgeMale":{"v":18,"src":"Germany: 18, no exceptions since the 2017 reform (no marriage under 18).","modelled":false},"minAgeFemale":{"v":18,"src":"Germany: 18, no exceptions since the 2017 reform (no marriage under 18).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2017.","modelled":false},"consentRule":{"v":"No parental consent can authorise an under-18 marriage since 2017.","src":"2017 reform banning marriage under 18.","modelled":false},"guardianApproval":{"v":"The couple themselves decide; no guardian approval is needed for adults.","src":"The couple themselves decide; no guardian approval is needed for adults.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Only a civil ceremony (Standesamt) is legally a marriage; a church wedding alone has no legal effect.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Only a civil ceremony (Standesamt) is legally a marriage; a church wedding alone has no legal effect. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in Germany with a certificate of no impediment (Ehefähigkeitszeugnis) from their home country.","src":"German civil registry rules.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"German law.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted.","src":"German law.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; a church wedding alone has no legal effect (BGB §1310).","src":"BGB §1310; germanysimple.com / 7atc.army.mil marriage guides.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"register_intent","name":"Register intent to marry at the Standesamt (Anmeldung der Eheschliessung)","fee":60,"leadTimeDays":21,"documents":["passport or national ID","birth certificate","certificate of no impediment (Ehefähigkeitszeugnis) for foreigners","sworn translations of foreign documents"],"whoCanRefuse":"registrar (Standesbeamter)"},{"id":"civil_ceremony","name":"Civil ceremony at the Standesamt","fee":70,"leadTimeDays":1,"documents":["ID"],"whoCanRefuse":"registrar"},{"id":"certificate","name":"Marriage certificate issued","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Standesamt procedure (BGB §1310–1312); fees Cologne €40 / Berlin €45 / Hamburg from €74.50 (germanysimple.com).","modelled":true},"leadTimeDays":{"v":21,"src":"2–6 weeks to process once documents are complete; modelled mid-point 21 days (germanysimple.com).","modelled":true},"registrationAuthority":{"v":"Standesamt (civil registry office)","src":"German civil registry rules.","modelled":false},"witnessesRequired":{"v":0,"src":"Witnesses are optional (0–2, 18+, BGB §1312).","modelled":false},"medicalExamRequired":{"v":false,"src":"No premarital medical exam is required in Germany.","modelled":false},"documentsRequired":{"v":["passport or national ID","birth certificate","certificate of no impediment (Ehefähigkeitszeugnis) for foreigners","sworn translations of foreign documents","proof of end of previous marriage if applicable"],"src":"German civil registry document lists (germanysimple.com).","modelled":false},"whoCanRefuse":{"v":"The registrar must refuse an obvious sham marriage (BGB §1310); a marriage is void if either party is under 18 or already married.","src":"BGB §1310/§1314 (sham marriage refusal).","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the Standesamt","church wedding (after the civil ceremony only)","outdoor / castle ceremony (civil, where the Standesamt offers it)"],"src":"German wedding practice; only the Standesamt ceremony is legally a marriage.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; an engagement ring is the customary gift."},"src":"No mahr custom recorded in German wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; an engagement ring is the customary gift."},"src":"No shabka custom recorded in German wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in German wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in German wedding practice.","modelled":false},"gifts":{"v":"Cash gifts and wedding list; Polterabend (smashing porcelain) the night before.","src":"German wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in German wedding practice.","modelled":false},"ring":{"v":{"payer":"both","item":"Plain gold wedding bands exchanged at the ceremony; engagement ring from the proposer."},"src":"German wedding practice.","modelled":true},"weddingFormats":{"v":["Standesamt ceremony","church wedding","Schloss / castle reception","garden party"],"src":"German wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":30,"middle":80,"rich":150},"src":"Modelled from the Bridebook Wedding Report 2026 (average 82 guests).","modelled":true}},"costs":{"venues":{"family_home":{"v":2500,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"local_hall":{"v":10000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_4star":{"v":20000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_5star":{"v":40000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"resort":{"v":28000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"garden":{"v":13000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"destination":{"v":22000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"registry":{"v":500,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"restaurant":{"v":7000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"traditional":{"v":11000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"elopement":{"v":1500,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true}},"cateringPerGuest":{"v":125,"src":"Bund deutscher Hochzeitsplaner: catering €100–150 per guest; mid-point.","modelled":true},"photography":{"v":2500,"src":"German wedding photographer €1,500–3,500; mid-point (Bund deutscher Hochzeitsplaner).","modelled":true},"averageTotal":{"v":17006,"src":"Bridebook Wedding Report 2026: average German wedding €17,006 (2,000+ couples, 82 guests).","modelled":false},"currency":{"v":"EUR","src":"Local currency (EUR).","modelled":false},"averageTotalByClass":{"v":{"poor":6000,"middle":17000,"rich":45000},"src":"Modelled from the Bridebook average of €17,006; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Community of accrued gains (Zugewinngemeinschaft): what each owned before stays theirs; gains during the marriage are shared on divorce.","src":"German Civil Code (BGB) default regime.","modelled":false},"prenupEnforceability":{"v":true,"src":"A marriage contract (Ehevertrag, notarised) is enforceable, subject to court review for unconscionability.","modelled":true},"spouseInheritanceShare":{"v":"Spouse inherits 1/4 alongside children under the default Zugewinngemeinschaft (plus the equalisation gain); 1/2 with no children (BGB §1931).","src":"BGB §1931 (spouse's statutory share).","modelled":false},"taxEffects":{"v":"Joint taxation with income splitting (Ehegattensplitting): the couple is taxed as if each earned half the joint income.","src":"German income tax splitting (Ehegattensplitting).","modelled":false},"benefits":{"v":"Widow's/widower's pension (Witwenrente) from the state pension; survivor benefits from occupational pensions.","src":"German pension survivor benefits.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for their own debts (except household necessities under BGB §1357).","src":"BGB §1357 (household necessities).","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Familiennachzug (Ehegattennachzug)","eligibility":"spouse of a German citizen or resident","requirements":["valid marriage","A1 German language certificate (Goethe/telc/ÖSD)","sponsor with sufficient income and housing (about 12m² per person)","passport"],"fee":175,"feeNote":"National D visa €75 plus residence permit about €100","processingWeeks":"12-52","refusalAppeal":"appeal to the administrative court (Verwaltungsgericht)","conditionsAfterArrival":"residence permit tied to the marriage; full work rights","pathToSettlement":"settlement permit (Niederlassungserlaubnis) after 3 years as spouse of a German national (§28 AufenthG), 5 years otherwise"},"src":"amtsdeutschland.de / newingermany.eu spouse visa guides; AufenthG §28.","modelled":false},"fianceRoute":{"v":{"route":"Visa for marriage (Visum zur Eheschließung)","eligibility":"partner of a German citizen or resident intending to marry in Germany","requirements":["certificate of no impediment","A1 German","proof of wedding date at the Standesamt"],"fee":75,"feeNote":"National visa fee €75","processingWeeks":"8-12","refusalAppeal":"appeal to the administrative court","conditionsAfterArrival":"marry within the visa validity (usually 3–6 months), then apply for the spouse residence permit","pathToSettlement":"switch to the spouse residence permit after the wedding"},"src":"German marriage visa (Visum zur Eheschließung); modelled details.","modelled":true},"processingTimeWeeks":{"v":26,"src":"Spouse visa processing 3–12 months, typically 6 weeks–6 months; modelled mid-point 26 weeks.","modelled":true},"conditionsAfterArrival":{"v":"Residence permit tied to the marriage; full work rights; must live together in Germany.","src":"Familiennachzug conditions (AufenthG).","modelled":false},"pathToSettlement":{"v":"Settlement permit (Niederlassungserlaubnis) after 3 years as spouse of a German national (§28 AufenthG), 5 years otherwise; citizenship after 5 years.","src":"AufenthG §28; German citizenship law.","modelled":false},"refusalAppeal":{"v":"Appeal to the administrative court (Verwaltungsgericht) against a refusal.","src":"German administrative appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault: breakdown of the marriage (Zerrüttung), usually after a 1-year separation (Trennungsjahr)."],"src":"German divorce law.","modelled":false},"process":{"v":"File with the family court after the separation year; Court hears property, support and custody; Court issues the divorce decree","src":"German divorce process.","modelled":true},"waitingPeriodDays":{"v":365,"src":"One year of separation is normally required before divorce. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":5000},"src":"Court and lawyer costs typically several thousand euros; modelled.","modelled":true},"assetSplit":{"v":"Equalisation of accrued gains (Zugewinnausgleich).","src":"German property division.","modelled":false},"custodyDefault":{"v":"Joint parental custody usually continues after divorce.","src":"German custody rules.","modelled":false},"supportDefault":{"v":"Spousal maintenance based on need and marriage length; child support by the Düsseldorf table.","src":"German maintenance rules.","modelled":false},"remarriageRules":{"v":"Remarry as soon as the divorce is final; no waiting period.","src":"German divorce law.","modelled":false},"stigma":{"v":"Low: divorce is socially accepted.","src":"Modelled from German social practice.","modelled":true},"familyReaction":{"v":"Family support is common; relatives have no legal say in the divorce.","src":"Modelled from German family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.3,"src":"Game model estimate: family approval matters little in Germany.","modelled":true},"attitudeInterfaith":{"v":"broadly accepted; some resistance in conservative families","src":"Modelled from German social practice.","modelled":true},"attitudeInterclass":{"v":"mild: class background is noticed but rarely blocks a match","src":"Modelled from German social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted; some resistance in older generations","src":"Modelled from German social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from German social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from German social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":35,"female":33},"src":"Destatis 2023: mean age at first marriage 35.3 men / 32.8 women.","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; housework is increasingly shared.","src":"Modelled from German social practice.","modelled":true}}},"eras":{"1960s":{"costs":{"currency":{"v":"DEM","src":"Deutsche Mark, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = DEM 1.95583).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent (partner 18 or older).","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent (partner 18 or older).","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2017 reform, 16-17 year olds could marry with court consent.","modelled":false}}},"1970s":{"costs":{"currency":{"v":"DEM","src":"Deutsche Mark, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = DEM 1.95583).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2017 reform, 16-17 year olds could marry with court consent.","modelled":false}}},"1980s":{"costs":{"currency":{"v":"DEM","src":"Deutsche Mark, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = DEM 1.95583).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2017 reform, 16-17 year olds could marry with court consent.","modelled":false}}},"1990s":{"costs":{"currency":{"v":"DEM","src":"Deutsche Mark, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = DEM 1.95583).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2017 reform, 16-17 year olds could marry with court consent.","modelled":false}}},"2000s":{"legal":{"minAgeMale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2017: 18 generally, 16 with court consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2017 reform, 16-17 year olds could marry with court consent.","modelled":false}}},"2010s":{"legal":{"minAgeMale":{"v":18,"src":"2017 reform bans marriage under 18 (in force July 2017).","modelled":false},"minAgeFemale":{"v":18,"src":"2017 reform bans marriage under 18 (in force July 2017).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2017.","modelled":false}}},"2020s":{"legal":{"minAgeMale":{"v":18,"src":"2017 reform: no marriage under 18.","modelled":false},"minAgeFemale":{"v":18,"src":"2017 reform: no marriage under 18.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2017.","modelled":false}}}}},"can":{"country":"can","label":"Canada","common":{"legal":{"minAgeMale":{"v":18,"src":"Canada: 18 generally; federal minimum age 16 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Canada: 18 generally; federal minimum age 16 with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Federal minimum age is 16 with parental consent.","modelled":false},"consentRule":{"v":"Parental consent for 16-17 year olds.","src":"Federal minimum age 16; provinces set their own consent rules.","modelled":false},"guardianApproval":{"v":"The couple themselves; a parent and/or a court only for under-18s where allowed.","src":"The couple themselves; a parent and/or a court only for under-18s where allowed.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Civil or religious ceremony by a licensed officiant is legally a marriage; common-law relationships are recognised in most provinces.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Civil or religious ceremony by a licensed officiant is legally a marriage; common-law relationships are recognised in most provinces. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal under the Criminal Code (s.293); a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in Canada with ID and, where required, proof of single status; no residence requirement.","src":"Provincial marriage licence rules.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"Canadian law.","modelled":false},"prohibitedDegrees":{"v":"First-cousin marriage is permitted.","src":"Canadian law.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; a religious ceremony is legally effective only if performed by an authorised officiant and registered.","src":"Canadian marriage law (Civil Marriage Act; provincial officiant rules).","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"marriage_licence","name":"Get a marriage licence from the province or municipality","fee":125,"leadTimeDays":1,"documents":["photo ID","birth certificate","divorce decree if previously married"],"whoCanRefuse":"licence issuer"},{"id":"ceremony","name":"Ceremony by an authorised officiant, with two witnesses","fee":0,"leadTimeDays":1,"documents":["marriage licence"],"whoCanRefuse":"officiant"},{"id":"registration","name":"Marriage registered with the province","fee":0,"leadTimeDays":30,"documents":[],"whoCanRefuse":"none"}],"src":"Canadian provincial licence process (licence about CAD 100–200; valid 3 months). Quebec has no licence — banns published 20 days instead.","modelled":true},"leadTimeDays":{"v":0,"src":"No waiting period in most provinces (Quebec: banns published 20 days); modelled as 0.","modelled":true},"registrationAuthority":{"v":"Provincial/territorial marriage licence issuer and the authorised officiant; Quebec: Directeur de l'état civil (banns)","src":"Canadian provincial marriage rules.","modelled":false},"witnessesRequired":{"v":2,"src":"Two adult witnesses required (Ontario: 18+).","modelled":false},"medicalExamRequired":{"v":false,"src":"No blood test or medical exam is required in any Canadian province.","modelled":false},"documentsRequired":{"v":["photo ID","birth certificate","marriage licence","divorce decree or death certificate if previously married"],"src":"Canadian provincial document lists.","modelled":false},"whoCanRefuse":{"v":"The licence issuer or officiant refuses if either party is under 16, already married, or lacks valid ID; Quebec: the Directeur de l'état civil.","src":"Civil Marriage Act (no one under 16 may marry); provincial rules.","modelled":false},"ceremonyTypes":{"v":["civil ceremony (city hall / authorised officiant)","religious ceremony by an authorised officiant","outdoor / destination ceremony"],"src":"Canadian wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; an engagement ring is the customary gift."},"src":"No mahr custom recorded in Canadian wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; an engagement ring is the customary gift."},"src":"No shabka custom recorded in Canadian wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in Canadian wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in Canadian wedding practice.","modelled":false},"gifts":{"v":"Wedding registry, cash gifts and honeymoon fund.","src":"Canadian wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Canadian wedding practice.","modelled":false},"ring":{"v":{"payer":"groom","item":"Diamond engagement ring from the proposer, then wedding bands exchanged at the ceremony."},"src":"Canadian wedding practice.","modelled":true},"weddingFormats":{"v":["city hall ceremony","church wedding","lakeside lodge reception","backyard / barn wedding","destination wedding"],"src":"Canadian wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":40,"middle":100,"rich":180},"src":"Modelled from Canadian wedding practice; average guest count around 100.","modelled":true}},"costs":{"venues":{"family_home":{"v":4000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"local_hall":{"v":14000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_4star":{"v":28000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_5star":{"v":55000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"resort":{"v":35000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"garden":{"v":17000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"destination":{"v":28000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"registry":{"v":900,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"restaurant":{"v":9000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"traditional":{"v":14000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"elopement":{"v":2200,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true}},"cateringPerGuest":{"v":140,"src":"WeddingWire Canada / The Knot 2025: catering CAD 80–200 per guest; mid-point.","modelled":true},"photography":{"v":4500,"src":"Canadian wedding photographer CAD 3,500–5,500; mid-point.","modelled":true},"averageTotal":{"v":32000,"src":"RBC 2025: average Canadian wedding about CAD 32,000 (range CAD 30,000–42,000, WeddingWire Canada / The Knot 2025).","modelled":false},"currency":{"v":"CAD","src":"Local currency (CAD).","modelled":false},"averageTotalByClass":{"v":{"poor":12000,"middle":32000,"rich":85000},"src":"Modelled from the RBC average of CAD 32,000; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Varies by province: e.g. Ontario equalization of net family property; Quebec partnership of acquests.","src":"Provincial family property law.","modelled":true},"prenupEnforceability":{"v":true,"src":"A marriage contract / domestic contract is generally enforceable if voluntary, in writing and with disclosure.","modelled":true},"spouseInheritanceShare":{"v":"Varies by province: e.g. Ontario — spouse takes a preferential share (first $350,000) plus 1/3 with one child, 1/2 with more; Quebec — spouse inherits with children under the Civil Code.","src":"Ontario Succession Law Reform Act; Quebec Civil Code.","modelled":false},"taxEffects":{"v":"No joint filing; spouses file separately but can split pension income and claim the spousal amount if one earns little.","src":"Canadian income tax rules.","modelled":false},"benefits":{"v":"Survivor's pension under the Canada Pension Plan; spousal benefits under provincial plans.","src":"Canada Pension Plan survivor benefits.","modelled":false},"debtLiability":{"v":"separate; a spouse is not liable for the other's debts unless the debt is joint.","src":"Canadian debt law.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Spousal sponsorship (IRCC)","eligibility":"spouse of a Canadian citizen or permanent resident","requirements":["sponsor 18+, citizen or PR","genuine marriage","3-year undertaking","medical exam","police certificates"],"fee":1205,"feeNote":"CAD 1,205 sponsorship + processing + right of permanent residence fee","processingWeeks":"52-78","refusalAppeal":"appeal to the Immigration Appeal Division (sponsor appeals)","conditionsAfterArrival":"permanent residence on grant; open work permit while waiting (inland)","pathToSettlement":"permanent residence on grant; citizenship after 3 years in Canada in the last 5"},"src":"IRCC spousal sponsorship (canadianimmigrationexperts.ca / immigrationshop.ca).","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"Canada has no fiancé visa; couples marry first (as visitors if needed), then the Canadian spouse sponsors from inside or outside Canada."},"src":"No fiancé visa in Canadian immigration practice.","modelled":false},"processingTimeWeeks":{"v":65,"src":"Outland spousal sponsorship about 12–18 months (IRCC Oct 2026: 18 months); modelled mid-point 65 weeks.","modelled":true},"conditionsAfterArrival":{"v":"Permanent residence on grant; open work permit while an inland application is pending.","src":"IRCC spousal sponsorship conditions.","modelled":false},"pathToSettlement":{"v":"Permanent residence on grant; citizenship after 3 years in Canada in the last 5 years.","src":"IRCC settlement rules.","modelled":false},"refusalAppeal":{"v":"The sponsor appeals to the Immigration Appeal Division (IAD).","src":"IRCC appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault: 1-year separation under the federal Divorce Act; adultery and cruelty are also grounds."],"src":"Divorce Act (Canada).","modelled":false},"process":{"v":"File for divorce in the provincial court; Agree or litigate property, support and parenting; Court issues the divorce order","src":"Canadian divorce process.","modelled":true},"waitingPeriodDays":{"v":365,"src":"One year of separation for a no-fault divorce. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":15000},"src":"Contested divorce commonly CAD 15,000 or more; uncontested far less; modelled.","modelled":true},"assetSplit":{"v":"Equalization of family property (Ontario model); rules vary by province.","src":"Provincial property division.","modelled":true},"custodyDefault":{"v":"Best interests of the child; parenting time and decision-making responsibility are shared where appropriate.","src":"Divorce Act parenting rules.","modelled":false},"supportDefault":{"v":"Child support by federal tables; spousal support by the Spousal Support Advisory Guidelines.","src":"Federal support guidelines.","modelled":false},"remarriageRules":{"v":"Remarry as soon as the divorce is final (after the 31-day appeal period); no waiting period.","src":"Canadian Divorce Act.","modelled":false},"stigma":{"v":"Low: divorce is socially accepted.","src":"Modelled from Canadian social practice.","modelled":true},"familyReaction":{"v":"Family support is common; relatives have no legal say in the divorce.","src":"Modelled from Canadian family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.35,"src":"Game model estimate: family approval matters but rarely decides.","modelled":true},"attitudeInterfaith":{"v":"broadly accepted","src":"Modelled from Canadian social practice.","modelled":true},"attitudeInterclass":{"v":"mild: class background is noticed but rarely blocks a match","src":"Modelled from Canadian social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted","src":"Modelled from Canadian social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from Canadian social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from Canadian social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":31,"female":30},"src":"Statistics Canada 2022: mean age at first marriage 30.8 men / 30.4 women.","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; roles are negotiated, not fixed.","src":"Modelled from Canadian social practice.","modelled":true}}},"eras":{"1960s":{},"1970s":{},"1980s":{},"1990s":{},"2000s":{},"2010s":{},"2020s":{}}},"aus":{"country":"aus","label":"Australia","common":{"legal":{"minAgeMale":{"v":18,"src":"Australia: 18; a court may permit 16-17 in exceptional circumstances.","modelled":false},"minAgeFemale":{"v":18,"src":"Australia: 18; a court may permit 16-17 in exceptional circumstances.","modelled":false},"minAgeWithConsent":{"v":16,"src":"A judge may permit a 16-17 year old to marry in exceptional circumstances, only to a person 18 or older.","modelled":false},"consentRule":{"v":"Court approval for 16-17 year olds in exceptional circumstances.","src":"Marriage Act 1961 (Cth).","modelled":false},"guardianApproval":{"v":"The couple themselves; a parent and/or a court only for under-18s where allowed.","src":"The couple themselves; a parent and/or a court only for under-18s where allowed.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Civil celebrant or religious ceremony is legally a marriage; de facto relationships are recognised.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Civil celebrant or religious ceremony is legally a marriage; de facto relationships are recognised. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal; bigamy is an offence under the Marriage Act.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in Australia with a notice of intended marriage lodged at least one month before, plus ID and proof of single status.","src":"Marriage Act notice requirements.","modelled":false},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"Australian law.","modelled":false},"prohibitedDegrees":{"v":"First-cousin marriage is permitted.","src":"Australian law.","modelled":false},"religiousLawApplies":{"v":"Civil law governs (Marriage Act 1961); religious ceremonies are legally effective only if performed by an authorised celebrant and registered.","src":"Marriage Act 1961 (Cth).","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"notice_of_intended_marriage","name":"Lodge a Notice of Intended Marriage (NOIM) with an authorised celebrant","fee":0,"leadTimeDays":30,"documents":["proof of date and place of birth (birth certificate or passport)","proof that any previous marriage ended"],"whoCanRefuse":"celebrant"},{"id":"ceremony","name":"Ceremony with two witnesses aged 18+","fee":0,"leadTimeDays":1,"documents":["Declaration of No Legal Impediment"],"whoCanRefuse":"celebrant"},{"id":"registration","name":"Celebrant registers the marriage with Births, Deaths and Marriages within 14 days","fee":0,"leadTimeDays":14,"documents":[],"whoCanRefuse":"none"}],"src":"Marriage Act 1961 s42: NOIM at least 1 month and at most 18 months before the wedding (recordinglaw.com / australiasweddingguide.com.au).","modelled":true},"leadTimeDays":{"v":30,"src":"Notice of Intended Marriage must be lodged at least 1 month before the wedding (Marriage Act 1961 s42).","modelled":false},"registrationAuthority":{"v":"Authorised marriage celebrant, registered with Births, Deaths and Marriages","src":"Marriage Act 1961 (Cth).","modelled":false},"witnessesRequired":{"v":2,"src":"Two witnesses aged 18+ must be present.","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in Australia.","modelled":false},"documentsRequired":{"v":["proof of date and place of birth (birth certificate or passport)","proof that any previous marriage ended","Declaration of No Legal Impediment"],"src":"Marriage Act 1961 document requirements.","modelled":false},"whoCanRefuse":{"v":"The celebrant must refuse if either party is under 18 without court approval, already married, or the Notice of Intended Marriage was not lodged at least a month before.","src":"Marriage Act 1961 (Cth).","modelled":false},"ceremonyTypes":{"v":["civil ceremony by an authorised celebrant","religious ceremony by an authorised celebrant","garden / beach / destination ceremony"],"src":"Australian wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; an engagement ring is the customary gift."},"src":"No mahr custom recorded in Australian wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; an engagement ring is the customary gift."},"src":"No shabka custom recorded in Australian wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in Australian wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in Australian wedding practice.","modelled":false},"gifts":{"v":"Wishing well (cash gifts) and wedding registry.","src":"Australian wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Australian wedding practice.","modelled":false},"ring":{"v":{"payer":"groom","item":"Diamond engagement ring from the proposer, then wedding bands."},"src":"Australian wedding practice.","modelled":true},"weddingFormats":{"v":["civil ceremony","church wedding","vineyard / beach reception","backyard wedding","destination wedding"],"src":"Australian wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":40,"middle":100,"rich":180},"src":"Modelled from Australian wedding practice; average guest count around 100.","modelled":true}},"costs":{"venues":{"family_home":{"v":4500,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"local_hall":{"v":13000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_4star":{"v":26000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_5star":{"v":50000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"resort":{"v":32000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"garden":{"v":16000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"destination":{"v":26000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"registry":{"v":900,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"restaurant":{"v":8500,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"traditional":{"v":13000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"elopement":{"v":2000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true}},"cateringPerGuest":{"v":200,"src":"Easy Weddings 2025: catering AUD 140–300+ per guest; mid-point.","modelled":true},"photography":{"v":4000,"src":"Australian wedding photographer about AUD 3,000–5,000; modelled mid-point.","modelled":true},"averageTotal":{"v":35315,"src":"Easy Weddings 2025 Australian Wedding Industry Report: average wedding AUD 35,315 (4,000+ couples).","modelled":false},"currency":{"v":"AUD","src":"Local currency (AUD).","modelled":false},"averageTotalByClass":{"v":{"poor":12000,"middle":35000,"rich":90000},"src":"Modelled from the Easy Weddings average of AUD 35,315; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"No community property: the court divides property at its discretion (just and equitable).","src":"Family Law Act 1975.","modelled":false},"prenupEnforceability":{"v":true,"src":"A binding financial agreement (BFA) is enforceable under the Family Law Act if strict formalities are met.","modelled":true},"spouseInheritanceShare":{"v":"Varies by state: with children, the spouse takes a statutory legacy (around AUD 350,000–600,000 depending on state) plus half of the remainder; everything if there are no children.","src":"Australian state succession law (e.g. NSW Succession Act).","modelled":true},"taxEffects":{"v":"No joint filing; each spouse is taxed separately, with a spouse tax offset in limited cases.","src":"Australian income tax rules.","modelled":false},"benefits":{"v":"Bereavement payment and partner pension from Centrelink; spouse superannuation death benefits.","src":"Australian social security survivor benefits.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for debts in their own name (joint debts are joint liability).","src":"Australian debt law.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Partner visa subclass 820/801 (onshore) or 309/100 (offshore)","eligibility":"spouse or de facto partner (12 months together) of an Australian citizen, PR or eligible NZ citizen","requirements":["genuine and continuing relationship","health examination","police clearances","sponsor's police checks"],"fee":9365,"feeNote":"AUD 9,365 (2025–26; AUD 11,710 from 1 July 2026)","processingWeeks":"26-104","refusalAppeal":"review by the Administrative Review Tribunal","conditionsAfterArrival":"temporary partner visa first (820/309), work and Medicare access","pathToSettlement":"permanent partner visa (801/100) about 2 years later; citizenship after 4 years' residence (1 year as PR)"},"src":"australiapr.au / y-axis.com.au partner visa guides.","modelled":false},"fianceRoute":{"v":{"route":"Prospective Marriage visa (subclass 300)","eligibility":"fiancé(e) of an Australian citizen, PR or eligible NZ citizen","requirements":["genuine intention to marry within 9 months","health examination","police clearances"],"fee":9365,"feeNote":"AUD 9,365 (2025–26)","processingWeeks":"60-104","refusalAppeal":"review by the Administrative Review Tribunal","conditionsAfterArrival":"must marry within 9 months, then apply for the partner visa (820/801)","pathToSettlement":"partner visa after marriage, then permanent residence"},"src":"Subclass 300 Prospective Marriage visa (australiapr.au).","modelled":false},"processingTimeWeeks":{"v":52,"src":"Subclass 820 median 6–12 months, 75% within 13–20 months; modelled mid-point 52 weeks.","modelled":true},"conditionsAfterArrival":{"v":"Temporary partner visa (820/309) with work and Medicare access; permanent visa (801/100) assessed about 2 years later.","src":"Australian partner visa conditions.","modelled":false},"pathToSettlement":{"v":"Permanent partner visa (801/100) about 2 years after lodgement; citizenship after 4 years' residence (1 year as a permanent resident).","src":"Australian partner visa settlement rules.","modelled":false},"refusalAppeal":{"v":"Review by the Administrative Review Tribunal (ART).","src":"Australian migration review practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault: 12 months separation and irretrievable breakdown."],"src":"Family Law Act 1975.","modelled":false},"process":{"v":"File for divorce in the Federal Circuit and Family Court after 12 months separation; Court deals with property, support and children; Divorce order becomes final one month later","src":"Australian divorce process.","modelled":true},"waitingPeriodDays":{"v":365,"src":"Twelve months separation is required. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":15000},"src":"Contested divorce commonly AUD 15,000 or more; modelled.","modelled":true},"assetSplit":{"v":"Court discretion: contributions and future needs decide the split; no fixed 50/50.","src":"Family Law Act property division.","modelled":false},"custodyDefault":{"v":"Best interests of the child; equal shared parental responsibility is the starting point.","src":"Family Law Act parenting rules.","modelled":false},"supportDefault":{"v":"Child support by Services Australia formula; spousal maintenance based on need and capacity.","src":"Australian support rules.","modelled":false},"remarriageRules":{"v":"Remarry after the divorce order becomes final (one month and one day after the order); no further waiting period.","src":"Family Law Act 1975.","modelled":false},"stigma":{"v":"Low: divorce is socially accepted.","src":"Modelled from Australian social practice.","modelled":true},"familyReaction":{"v":"Family support is common; relatives have no legal say in the divorce.","src":"Modelled from Australian family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.35,"src":"Game model estimate: family approval matters but rarely decides.","modelled":true},"attitudeInterfaith":{"v":"broadly accepted","src":"Modelled from Australian social practice.","modelled":true},"attitudeInterclass":{"v":"mild: class is rarely a barrier","src":"Modelled from Australian social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted","src":"Modelled from Australian social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from Australian social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from Australian social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":33,"female":32},"src":"Easy Weddings / ABS: typical groom 33, bride 32.","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; roles are negotiated.","src":"Modelled from Australian social practice.","modelled":true}}},"eras":{"1960s":{"costs":{"currency":{"v":"Australian pound (£A)","src":"Australian pound (£A), the currency in force to February 1966; decimal currency arrives in 1966 at A$2 per Australian pound.","modelled":false}}},"1970s":{},"1980s":{},"1990s":{},"2000s":{},"2010s":{},"2020s":{}}},"nld":{"country":"nld","label":"Netherlands","common":{"legal":{"minAgeMale":{"v":18,"src":"Netherlands: 18, no exceptions since 2015 (under-18 marriage banned).","modelled":false},"minAgeFemale":{"v":18,"src":"Netherlands: 18, no exceptions since 2015 (under-18 marriage banned).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2015.","modelled":false},"consentRule":{"v":"No parental consent can authorise an under-18 marriage since 2015.","src":"2015 reform raising the minimum age to 18.","modelled":false},"guardianApproval":{"v":"The couple themselves decide; no guardian approval is needed for adults.","src":"The couple themselves decide; no guardian approval is needed for adults.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Only a civil ceremony at the town hall is legally a marriage; a church wedding alone has no legal effect. Other registered partnerships exist in law but are not offered in the game.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Only a civil ceremony at the town hall is legally a marriage; a church wedding alone has no legal effect. Other registered partnerships exist in law but are not offered in the game. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in the Netherlands with a declaration of no impediment and ID; the municipality checks the documents.","src":"Dutch municipal marriage rules.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"Dutch law.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted.","src":"Dutch law.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; only the civil marriage at the gemeente is a legal marriage — a religious ceremony alone has no legal effect.","src":"Dutch civil marriage law.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"notice_of_intended_marriage","name":"Give notice of intended marriage at the gemeente (melding voorgenomen huwelijk / ondertrouw)","fee":0,"leadTimeDays":14,"documents":["passport or ID","birth certificate (legalised and translated if foreign)","proof of civil status"],"whoCanRefuse":"registrar"},{"id":"civil_ceremony","name":"Civil ceremony at the town hall, with 2–4 witnesses aged 18+","fee":150,"leadTimeDays":1,"documents":["ID","witness IDs"],"whoCanRefuse":"registrar"},{"id":"certificate","name":"Marriage certificate issued","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Dutch ondertrouw: at least 14 days before, valid 1 year; municipalities ask 6 weeks (Amsterdam); municipality fee about €400 (amsterdamtourism.net / leideninternationalcentre.nl).","modelled":true},"leadTimeDays":{"v":14,"src":"Notice of intended marriage at least 14 days before the ceremony (municipalities ask 6 weeks).","modelled":false},"registrationAuthority":{"v":"Gemeente (municipality) civil registry","src":"Dutch civil registry rules.","modelled":false},"witnessesRequired":{"v":2,"src":"Two to four witnesses, 18+ (free Monday 9am ceremony: 2 witnesses maximum).","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in the Netherlands.","modelled":false},"documentsRequired":{"v":["passport or ID","birth certificate (legalised and translated if foreign)","proof of civil status","IDs of 2–4 witnesses"],"src":"Dutch gemeente document lists.","modelled":false},"whoCanRefuse":{"v":"The registrar refuses if either party is under 18, already married, or the notice was not given at least 14 days before; a sham marriage can be refused.","src":"Dutch civil marriage law.","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the gemeente (free Monday-morning option)","ceremony at an approved external venue","religious ceremony (after the civil one)"],"src":"Dutch wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; an engagement ring is the customary gift."},"src":"No mahr custom recorded in Dutch wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; an engagement ring is the customary gift."},"src":"No shabka custom recorded in Dutch wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in Dutch wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in Dutch wedding practice.","modelled":false},"gifts":{"v":"Cash gifts and wedding list; the couple often asks for money towards the honeymoon.","src":"Dutch wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Dutch wedding practice.","modelled":false},"ring":{"v":{"payer":"both","item":"Wedding bands exchanged at the ceremony; engagement ring from the proposer."},"src":"Dutch wedding practice.","modelled":true},"weddingFormats":{"v":["gemeente ceremony","castle / estate reception","garden wedding","destination wedding"],"src":"Dutch wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":30,"middle":80,"rich":150},"src":"Modelled from Dutch wedding practice (125 guests in the €20,000 worked example, Snappshot).","modelled":true}},"costs":{"venues":{"family_home":{"v":2000,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"local_hall":{"v":8000,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"hotel_4star":{"v":16000,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"hotel_5star":{"v":30000,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"resort":{"v":22000,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"garden":{"v":10000,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"destination":{"v":18000,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"registry":{"v":500,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"restaurant":{"v":5500,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"traditional":{"v":9000,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true},"elopement":{"v":1200,"src":"Modelled estimate anchored to the Benelux 2025 guide (average Dutch wedding EUR 23,675); matches the venue row in js/08.","modelled":true}},"cateringPerGuest":{"v":110,"src":"Dutch wedding catering €75–150 per guest; mid-point (Snappshot / djunes).","modelled":true},"photography":{"v":2500,"src":"Dutch wedding photographer about €1,500–3,500; modelled mid-point.","modelled":true},"averageTotal":{"v":17500,"src":"Snappshot: average Dutch wedding about €15,000; djunes: €10,000–20,000 (mid-point €17,500).","modelled":false},"currency":{"v":"EUR","src":"Local currency (EUR).","modelled":false},"averageTotalByClass":{"v":{"poor":6000,"middle":17500,"rich":45000},"src":"Modelled from the Snappshot/djunes average of about €17,500; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Limited community of property since 1 Jan 2018: pre-marital assets and inheritances stay separate; what is built during the marriage is shared.","src":"Dutch marital property law, 2018 reform.","modelled":false},"prenupEnforceability":{"v":true,"src":"Marital conditions (huwelijkse voorwaarden, notarial deed) are enforceable.","modelled":true},"spouseInheritanceShare":{"v":"Under the statutory division (wettelijke verdeling), the surviving spouse takes the whole estate when there are children; the children receive a non-payable claim.","src":"Dutch Civil Code (statutory division).","modelled":false},"taxEffects":{"v":"Partners are taxed jointly in Box 1 (fiscal partners can allocate income and deductions between them).","src":"Dutch income tax (fiscal partnership).","modelled":false},"benefits":{"v":"Survivor's benefit under the ANW (General Surviving Relatives Act); partner pension from occupational schemes.","src":"Dutch ANW survivor benefits.","modelled":false},"debtLiability":{"v":"shared for debts of the household and debts incurred during the marriage under the community regime; pre-marital debts stay separate.","src":"Dutch community of property rules (limited community since 2018).","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Partner visa (MVV + residence permit, TEV procedure via IND)","eligibility":"spouse of a Dutch citizen or resident","requirements":["sponsor income at least €2,337 gross/month (Jul–Dec 2026)","civic integration exam abroad (basisexamen inburgering) in most cases","both partners 21+ (18 if already married abroad or Turkish national)","adequate housing"],"fee":254,"feeNote":"€254 MVV + residence permit fee","processingWeeks":"12","refusalAppeal":"objection (bezwaar) to the IND, then appeal to the court","conditionsAfterArrival":"residence permit tied to the partner; work allowed","pathToSettlement":"permanent residence after 5 years; citizenship after 5 years (with integration exam)"},"src":"findlawyer.nl / inburgering.org partner visa guides; IND TEV procedure.","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"The Netherlands has no fiancé visa; couples marry first (a visitor visa covers the wedding), then apply for the partner residence permit."},"src":"No fiancé visa in Dutch immigration practice.","modelled":false},"processingTimeWeeks":{"v":12,"src":"Legal decision period 90 days; practice 2–3 months (IND).","modelled":true},"conditionsAfterArrival":{"v":"Residence permit tied to the partner; work allowed; must pass the civic integration exam for renewal.","src":"IND partner permit conditions.","modelled":false},"pathToSettlement":{"v":"Permanent residence after 5 years; Dutch citizenship after 5 years (with the integration exam).","src":"Dutch settlement rules.","modelled":false},"refusalAppeal":{"v":"Objection (bezwaar) to the IND, then appeal to the court.","src":"Dutch immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault: durable disruption of the marriage (duurzame ontwrichting)."],"src":"Dutch divorce law.","modelled":false},"process":{"v":"File a divorce petition with the court; Agree or litigate property, support and children; Court issues the divorce decree and registers it","src":"Dutch divorce process.","modelled":true},"waitingPeriodDays":{"v":0,"src":"No separation period is required. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":5000},"src":"Court and lawyer costs typically several thousand euros; modelled.","modelled":true},"assetSplit":{"v":"Limited community since 2018 (before: full community of property).","src":"Dutch property division.","modelled":false},"custodyDefault":{"v":"Joint parental authority normally continues after divorce.","src":"Dutch custody rules.","modelled":false},"supportDefault":{"v":"Partner alimony for up to 5 years (2020 reform, was 12); child support by court formula.","src":"Dutch alimony reform 2020.","modelled":false},"remarriageRules":{"v":"Remarry as soon as the divorce is registered; no waiting period.","src":"Dutch divorce law.","modelled":false},"stigma":{"v":"Low: divorce is socially accepted.","src":"Modelled from Dutch social practice.","modelled":true},"familyReaction":{"v":"Family support is common; relatives have no legal say in the divorce.","src":"Modelled from Dutch family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.3,"src":"Game model estimate: family approval matters little in the Netherlands.","modelled":true},"attitudeInterfaith":{"v":"broadly accepted","src":"Modelled from Dutch social practice.","modelled":true},"attitudeInterclass":{"v":"mild: class is rarely a barrier","src":"Modelled from Dutch social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted","src":"Modelled from Dutch social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from Dutch social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from Dutch social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":35,"female":33},"src":"Eurostat 2024: mean age at first marriage 35.3 men / 33.0 women.","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; part-time work for both parents is common.","src":"Modelled from Dutch social practice.","modelled":true}}},"eras":{"1960s":{"costs":{"currency":{"v":"NLG","src":"Dutch guilder, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = NLG 2.20371).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2015 reform, 16-17 year olds could marry with parental consent.","modelled":false}},"money":{"propertyRegime":{"v":"Full community of property (before the 2018 reform).","src":"Dutch marital property law before 2018.","modelled":false}}},"1970s":{"costs":{"currency":{"v":"NLG","src":"Dutch guilder, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = NLG 2.20371).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2015 reform, 16-17 year olds could marry with parental consent.","modelled":false}},"money":{"propertyRegime":{"v":"Full community of property (before the 2018 reform).","src":"Dutch marital property law before 2018.","modelled":false}}},"1980s":{"costs":{"currency":{"v":"NLG","src":"Dutch guilder, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = NLG 2.20371).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2015 reform, 16-17 year olds could marry with parental consent.","modelled":false}},"money":{"propertyRegime":{"v":"Full community of property (before the 2018 reform).","src":"Dutch marital property law before 2018.","modelled":false}}},"1990s":{"costs":{"currency":{"v":"NLG","src":"Dutch guilder, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = NLG 2.20371).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2015 reform, 16-17 year olds could marry with parental consent.","modelled":false}},"money":{"propertyRegime":{"v":"Full community of property (before the 2018 reform).","src":"Dutch marital property law before 2018.","modelled":false}}},"2000s":{"legal":{"minAgeMale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2015: 18 generally, 16 with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before the 2015 reform, 16-17 year olds could marry with parental consent.","modelled":false}},"money":{"propertyRegime":{"v":"Full community of property (before the 2018 reform).","src":"Dutch marital property law before 2018.","modelled":false}}},"2010s":{"legal":{"minAgeMale":{"v":18,"src":"2015 reform: no marriage under 18.","modelled":false},"minAgeFemale":{"v":18,"src":"2015 reform: no marriage under 18.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2015.","modelled":false}},"money":{"propertyRegime":{"v":"Full community before 2018; limited community from 1 Jan 2018.","src":"Dutch marital property law, 2018 reform.","modelled":false}}},"2020s":{"money":{"propertyRegime":{"v":"Limited community of property since 1 Jan 2018.","src":"Dutch marital property law, 2018 reform.","modelled":false}}}}},"fra":{"country":"fra","label":"France","common":{"legal":{"minAgeMale":{"v":18,"src":"France: 18, no exceptions since 2006.","modelled":false},"minAgeFemale":{"v":18,"src":"France: 18, no exceptions since 2006.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2006.","modelled":false},"consentRule":{"v":"No parental consent can authorise an under-18 marriage since 2006.","src":"2006 reform (law of 4 April 2006) raising the age to 18 for both sexes.","modelled":false},"guardianApproval":{"v":"The couple themselves decide; no guardian approval is needed for adults.","src":"The couple themselves decide; no guardian approval is needed for adults.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Only a civil ceremony at the mairie is legally a marriage; a religious ceremony alone has no legal effect. PACS exists in law but is not offered in the game.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Only a civil ceremony at the mairie is legally a marriage; a religious ceremony alone has no legal effect. PACS exists in law but is not offered in the game. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in France with ID, proof of single status and a residence certificate; a publication of banns is required.","src":"French civil marriage rules.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"French law.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted.","src":"French law.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; a religious ceremony is forbidden before the civil marriage and has no legal effect on its own.","src":"French Civil Code (marriage at the mairie).","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"file_dossier_banns","name":"File the dossier at the mairie and publish the banns (publication des bans)","fee":0,"leadTimeDays":10,"documents":["birth certificate with parentage (under 3 months old in France, 6 months abroad)","ID","proof of residence","certificate of single status / certificat de coutume for foreigners"],"whoCanRefuse":"mayor / procureur de la République (sham marriage)"},{"id":"civil_ceremony","name":"Civil ceremony at the mairie, with 2–4 witnesses","fee":0,"leadTimeDays":1,"documents":["ID"],"whoCanRefuse":"officier de l'état civil"},{"id":"livret_de_famille","name":"Livret de famille (family record book) issued","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"French mairie procedure: banns at least 10 days before, wedding within 1 year of the banns (hulotteparisienne.fr / kohenavocats.com).","modelled":true},"leadTimeDays":{"v":10,"src":"Publication of banns at least 10 days before the ceremony (French Civil Code).","modelled":false},"registrationAuthority":{"v":"Mairie (town hall) of the commune — officier de l'état civil","src":"French civil registry rules.","modelled":false},"witnessesRequired":{"v":2,"src":"Two to four witnesses required.","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in France (the premarital medical certificate was abolished in 2007).","modelled":false},"documentsRequired":{"v":["birth certificate with parentage (under 3 months old in France, 6 months abroad)","ID","proof of residence","witness list (2–4 witnesses)","certificat de coutume and certificate of single status for foreigners"],"src":"French mairie document lists.","modelled":false},"whoCanRefuse":{"v":"The mayor may refer a suspected sham marriage to the procureur de la République, who can oppose it; a religious ceremony before the civil one is refused.","src":"French Civil Code (sham marriage opposition).","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the mairie","religious ceremony (only after the civil ceremony)","reception at a château / venue"],"src":"French wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; an engagement ring is the customary gift."},"src":"No mahr custom recorded in French wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; an engagement ring is the customary gift."},"src":"No shabka custom recorded in French wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in French wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in French wedding practice.","modelled":false},"gifts":{"v":"Liste de mariage (wedding list) and cash gifts (envelopes); dragées (sugared almonds) for guests.","src":"French wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in French wedding practice.","modelled":false},"ring":{"v":{"payer":"groom","item":"Solitaire engagement ring, then wedding bands (alliances) exchanged at the mairie."},"src":"French wedding practice.","modelled":true},"weddingFormats":{"v":["mairie ceremony","church wedding","château reception","vineyard / garden wedding","destination wedding"],"src":"French wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":40,"middle":100,"rich":180},"src":"Modelled from French wedding practice; average guest count around 100.","modelled":true}},"costs":{"venues":{"family_home":{"v":2500,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"local_hall":{"v":9000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_4star":{"v":18000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_5star":{"v":35000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"resort":{"v":25000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"garden":{"v":12000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"destination":{"v":20000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"registry":{"v":500,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"restaurant":{"v":6000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"traditional":{"v":10000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"elopement":{"v":1500,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true}},"cateringPerGuest":{"v":175,"src":"French wedding catering €100–250 per guest; mid-point (Mariages.net).","modelled":true},"photography":{"v":3750,"src":"French wedding photographer €2,500–5,000 in the regions; mid-point (Mariages.net).","modelled":true},"averageTotal":{"v":19293,"src":"Mariages.net survey (couples married 2025): average French wedding €19,293, excluding rings and honeymoon.","modelled":false},"currency":{"v":"EUR","src":"Local currency (EUR).","modelled":false},"averageTotalByClass":{"v":{"poor":7000,"middle":19500,"rich":50000},"src":"Modelled from the Mariages.net average of €19,293; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Community of acquests (communauté réduite aux acquêts): what is earned during the marriage is shared; pre-marital property stays separate.","src":"French Civil Code default regime.","modelled":false},"prenupEnforceability":{"v":true,"src":"A marriage contract (contrat de mariage, notarial deed) is enforceable.","modelled":true},"spouseInheritanceShare":{"v":"Spouse takes 1/4 in full ownership alongside children (or the usufruct of the whole estate); everything if there are no children or parents.","src":"French Civil Code (spouse's share).","modelled":false},"taxEffects":{"v":"Joint taxation (quotient familial): the household files one return and income is divided by the number of family parts.","src":"French quotient familial.","modelled":false},"benefits":{"v":"Pension de réversion (survivor's pension, 54% of the deceased's pension) plus family benefits.","src":"French survivor's pension.","modelled":false},"debtLiability":{"v":"shared for household debts and debts under the community regime; separate for pre-marital and personal debts.","src":"French community of acquests rules.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"VLS-TS vie privée et familiale (spouse of a French citizen)","eligibility":"spouse of a French citizen","requirements":["valid marriage","visa from the French consulate","validate with OFII within 3 months of arrival","proof of the French spouse's nationality"],"fee":99,"feeNote":"Long-stay visa about €99 plus residence permit tax","processingWeeks":"2-8","refusalAppeal":"appeal to the administrative court (recours contentieux)","conditionsAfterArrival":"full work rights from arrival; multi-year card after 1 year","pathToSettlement":"carte de résident after 3–5 years (A2 French required); citizenship after 4 years of marriage"},"src":"expat-in-france.com / jurilia.fr spouse visa guides.","modelled":false},"fianceRoute":{"v":{"route":"Long-stay visa to marry in France","eligibility":"partner of a French citizen intending to marry in France","requirements":["certificate of no impediment / certificat de coutume","proof of the French partner's nationality","wedding date at the mairie"],"fee":99,"feeNote":"Long-stay visa about €99","processingWeeks":"4-8","refusalAppeal":"appeal to the administrative court","conditionsAfterArrival":"marry within the visa validity, then apply for the VLS-TS vie privée et familiale","pathToSettlement":"spouse residence permit after the wedding"},"src":"French long-stay visa to marry; modelled details.","modelled":true},"processingTimeWeeks":{"v":4,"src":"Consulate processing 2 weeks–2 months for a spouse of a French citizen; modelled mid-point 4 weeks.","modelled":true},"conditionsAfterArrival":{"v":"Full work rights from arrival; validate the VLS-TS with OFII within 3 months; multi-year card after 1 year.","src":"French spouse visa conditions.","modelled":false},"pathToSettlement":{"v":"Carte de résident after 3–5 years (A2 French required); citizenship after 4 years of marriage.","src":"French settlement rules.","modelled":false},"refusalAppeal":{"v":"Appeal to the administrative court (recours contentieux).","src":"French immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["Divorce by mutual consent is the fastest route; fault grounds (faute) still exist."],"src":"French divorce law.","modelled":false},"process":{"v":"File for divorce (mutual consent or contested); Court or notary settles property, support and children; Divorce is recorded at the mairie","src":"French divorce process.","modelled":true},"waitingPeriodDays":{"v":0,"src":"Mutual-consent divorce has no separation period; contested divorce may need 1 year of separation. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":5000},"src":"Notary and lawyer costs typically several thousand euros; modelled.","modelled":true},"assetSplit":{"v":"Community of acquests is split; pre-marital property stays separate.","src":"French property division.","modelled":false},"custodyDefault":{"v":"Joint parental authority (autorité parentale conjointe) is the default.","src":"French custody rules.","modelled":false},"supportDefault":{"v":"Compensatory allowance (prestation compensatoire) for the disadvantaged spouse; child support by court order.","src":"French support rules.","modelled":false},"remarriageRules":{"v":"Remarry as soon as the divorce is final; the old 300-day délai de viduité for women was abolished in 2004 (law 2004-439).","src":"Law 2004-439 (divorce reform, 26 May 2004).","modelled":false},"stigma":{"v":"Low: divorce is socially accepted.","src":"Modelled from French social practice.","modelled":true},"familyReaction":{"v":"Family support is common; relatives have no legal say in the divorce.","src":"Modelled from French family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.4,"src":"Game model estimate: family approval matters somewhat in France.","modelled":true},"attitudeInterfaith":{"v":"broadly accepted; laïcité keeps religion out of the ceremony","src":"Modelled from French social practice.","modelled":true},"attitudeInterclass":{"v":"mild: class background is noticed socially but rarely blocks a match","src":"Modelled from French social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted","src":"Modelled from French social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from French social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from French social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":36,"female":33},"src":"OECD Family Database: mean age at first marriage 36.0 men / 33.3 women.","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; roles are negotiated.","src":"Modelled from French social practice.","modelled":true}}},"eras":{"1960s":{"costs":{"currency":{"v":"FRF","src":"French franc, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = FRF 6.55957).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2006: men 18, women 15 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2006: men 18, women 15 with parental consent.","modelled":false},"minAgeWithConsent":{"v":15,"src":"Before the 2006 reform, girls of 15 could marry with parental consent (modelled; the 2006 law raised the female age to 18).","modelled":true}}},"1970s":{"costs":{"currency":{"v":"FRF","src":"French franc, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = FRF 6.55957).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2006: men 18, women 15 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2006: men 18, women 15 with parental consent.","modelled":false},"minAgeWithConsent":{"v":15,"src":"Before the 2006 reform, girls of 15 could marry with parental consent (modelled).","modelled":true}}},"1980s":{"costs":{"currency":{"v":"FRF","src":"French franc, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = FRF 6.55957).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2006: men 18, women 15 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2006: men 18, women 15 with parental consent.","modelled":false},"minAgeWithConsent":{"v":15,"src":"Before the 2006 reform, girls of 15 could marry with parental consent (modelled).","modelled":true}}},"1990s":{"costs":{"currency":{"v":"FRF","src":"French franc, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = FRF 6.55957).","modelled":false}},"legal":{"minAgeMale":{"v":18,"src":"Before 2006: men 18, women 15 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Before 2006: men 18, women 15 with parental consent.","modelled":false},"minAgeWithConsent":{"v":15,"src":"Before the 2006 reform, girls of 15 could marry with parental consent (modelled).","modelled":true}}},"2000s":{"legal":{"minAgeMale":{"v":18,"src":"2006 reform: 18 for both sexes, no exceptions.","modelled":false},"minAgeFemale":{"v":18,"src":"2006 reform: 18 for both sexes, no exceptions.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2006.","modelled":false}}},"2010s":{"legal":{"minAgeMale":{"v":18,"src":"2006 reform: 18 for both sexes, no exceptions.","modelled":false},"minAgeFemale":{"v":18,"src":"2006 reform: 18 for both sexes, no exceptions.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2006.","modelled":false}}},"2020s":{"legal":{"minAgeMale":{"v":18,"src":"2006 reform: 18 for both sexes, no exceptions.","modelled":false},"minAgeFemale":{"v":18,"src":"2006 reform: 18 for both sexes, no exceptions.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2006.","modelled":false}}}}},"jpn":{"country":"jpn","label":"Japan","common":{"legal":{"minAgeMale":{"v":18,"src":"Japan: 18 for both sexes since 1 April 2022 (age of adulthood lowered from 20).","modelled":false},"minAgeFemale":{"v":18,"src":"Japan: 18 for both sexes since 1 April 2022 (age of adulthood lowered from 20).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since April 2022.","modelled":false},"consentRule":{"v":"No parental consent can authorise an under-18 marriage since April 2022.","src":"2022 Civil Code reform.","modelled":false},"guardianApproval":{"v":"The couple themselves decide; no guardian approval is needed for adults.","src":"The couple themselves decide; no guardian approval is needed for adults.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Only registration at the municipal office (koseki) is legally a marriage; a Shinto or church ceremony alone has no legal effect.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Only registration at the municipal office (koseki) is legally a marriage; a Shinto or church ceremony alone has no legal effect. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in Japan with a certificate of no impediment from their embassy and registration at the municipal office.","src":"Japanese municipal registration rules.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"Japanese law.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted, except for close relatives within three degrees.","src":"Japanese Civil Code kinship rules.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; only the filed kon'in todoke (marriage registration) is a legal marriage — ceremonies have no legal effect.","src":"Japanese Civil Code (marriage by registration).","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"prepare_documents","name":"Prepare the kon'in todoke and documents","fee":0,"leadTimeDays":7,"documents":["kon'in todoke form","koseki tōhon (Japanese partner)","passport and Certificate of No Impediment with Japanese translation (foreign partner)"],"whoCanRefuse":"municipal office if the form is incomplete"},{"id":"file_registration","name":"File the kon'in todoke at the municipal office, signed by two witnesses aged 18+","fee":0,"leadTimeDays":1,"documents":["signed kon'in todoke"],"whoCanRefuse":"none"},{"id":"certificate","name":"Marriage certificate issued (about ¥350)","fee":350,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Japanese marriage registration (kon'in todoke); marriage date is the filing date (japanhandbook.com / joyn.tokyo).","modelled":true},"leadTimeDays":{"v":0,"src":"No waiting period: the marriage is legal on the day the kon'in todoke is filed.","modelled":false},"registrationAuthority":{"v":"Municipal office (city/ward office) — koseki registration","src":"Japanese koseki registration.","modelled":false},"witnessesRequired":{"v":2,"src":"Two witnesses aged 18+ sign the kon'in todoke (any nationality).","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in Japan.","modelled":false},"documentsRequired":{"v":["kon'in todoke (marriage registration form)","koseki tōhon for the Japanese partner","passport and Certificate of No Impediment (with Japanese translation) for the foreign partner","residence card for the foreign partner"],"src":"Japanese municipal office document lists.","modelled":false},"whoCanRefuse":{"v":"The municipal office refuses an incomplete or unsigned kon'in todoke; either party under 18 cannot marry.","src":"Japanese Civil Code (18 for both sexes since 1 Apr 2022).","modelled":false},"ceremonyTypes":{"v":["kon'in todoke filing at the municipal office (the only legal act)","Shinto ceremony at a shrine","Christian-style chapel ceremony","reception (hiroen) at a hotel or venue"],"src":"Japanese wedding practice; ceremonies have no legal effect.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; wedding bands are the customary exchange."},"src":"No mahr custom recorded in Japanese wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; wedding bands are the customary exchange."},"src":"No shabka custom recorded in Japanese wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in Japanese wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in Japanese wedding practice.","modelled":false},"gifts":{"v":"Cash gifts (goshugi) in special envelopes, typically ¥30,000 per guest; the couple gives return gifts (hikidemono).","src":"Japanese wedding practice (Zexy).","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Japanese wedding practice.","modelled":false},"ring":{"v":{"payer":"both","item":"Matching wedding bands; engagement ring (often a diamond) from the groom."},"src":"Japanese wedding practice.","modelled":true},"weddingFormats":{"v":["municipal registration + shrine ceremony","chapel wedding","hotel reception (hiroen)","garden wedding"],"src":"Japanese wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":20,"middle":50,"rich":100},"src":"Zexy 2024 wedding trend survey: average about 52 guests.","modelled":true}},"costs":{"venues":{"family_home":{"v":400000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"local_hall":{"v":1200000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_4star":{"v":2500000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"hotel_5star":{"v":5000000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"resort":{"v":3500000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"garden":{"v":1500000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"destination":{"v":3000000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"registry":{"v":80000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"restaurant":{"v":900000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"traditional":{"v":1300000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true},"elopement":{"v":200000,"src":"Modelled estimate; matches the venue row in js/08 MARRIAGE_WEDDING_VENUES.","modelled":true}},"cateringPerGuest":{"v":30000,"src":"Japanese wedding catering ¥20,000–45,000 per guest all-in; mid-point (Zexy 2024).","modelled":true},"photography":{"v":450000,"src":"Japanese wedding photography ¥300,000–600,000; mid-point.","modelled":true},"averageTotal":{"v":3440000,"src":"Zexy 2024 wedding trend survey: average wedding ¥3.44 million (about 52 guests).","modelled":false},"currency":{"v":"JPY","src":"Local currency (JPY).","modelled":false},"averageTotalByClass":{"v":{"poor":1200000,"middle":3400000,"rich":8000000},"src":"Modelled from the Zexy average of ¥3.44 million; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Separate property: each spouse keeps what is theirs; property built together is divided on divorce.","src":"Japanese Civil Code default regime.","modelled":false},"prenupEnforceability":{"v":"limited","src":"A prenuptial agreement is enforceable as a contract in principle, but the court keeps discretion over property division on divorce.","modelled":true},"spouseInheritanceShare":{"v":"Spouse takes 1/2 alongside children, 2/3 alongside parents, 3/4 alongside siblings (Civil Code).","src":"Japanese Civil Code (spouse's statutory share).","modelled":false},"taxEffects":{"v":"Separate filing; a spouse deduction applies if the spouse earns under the threshold (¥1.03 million for the full deduction).","src":"Japanese spouse deduction.","modelled":false},"benefits":{"v":"Survivors' pension (izoku nenkin) from the national pension and employees' pension.","src":"Japanese survivors' pension.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for their own debts.","src":"Japanese separate property regime.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Spouse of Japanese national — Certificate of Eligibility + spouse visa","eligibility":"spouse of a Japanese national","requirements":["Certificate of Eligibility from Immigration Services Agency","valid marriage (kon'in todoke filed)","passport","proof of the Japanese spouse's koseki"],"fee":0,"feeNote":"No visa fee at most embassies; CoE is free","processingWeeks":"16-28","refusalAppeal":"reapply with a corrected file; no formal appeal of a visa refusal","conditionsAfterArrival":"period of stay 6 months / 1 / 3 / 5 years; full work rights","pathToSettlement":"permanent residence after 3 years married and 1 year in Japan; citizenship after 5 years' residence"},"src":"mailmate.jp / ISA via gyanmirai.com spouse visa guides.","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"Japan has no fiancé visa; couples marry first (by filing the kon'in todoke), then the foreign spouse applies for the spouse visa."},"src":"No fiancé visa in Japanese immigration practice.","modelled":false},"processingTimeWeeks":{"v":20,"src":"Certificate of Eligibility about 107–112 days on average (ISA, May–Jul 2026) plus about 5 working days for the visa; total 4–7 months, modelled 20 weeks.","modelled":true},"conditionsAfterArrival":{"v":"Period of stay 6 months / 1 / 3 / 5 years; full work rights; renew before expiry.","src":"Japanese spouse visa conditions.","modelled":false},"pathToSettlement":{"v":"Permanent residence after 3 years married and 1 year in Japan; citizenship after 5 years' residence.","src":"Japanese settlement rules.","modelled":false},"refusalAppeal":{"v":"No formal appeal of a consular visa refusal; reapply with a corrected file, or challenge a CoE refusal through the Immigration Services Agency.","src":"Japanese immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["Divorce by mutual agreement (kyogi rikon) is the most common route; mediation or court divorce for fault or breakdown."],"src":"Japanese divorce law.","modelled":false},"process":{"v":"Agree the divorce and register it, or file for mediation; Family court mediation if no agreement; Court decides property, support and custody","src":"Japanese divorce process.","modelled":true},"waitingPeriodDays":{"v":0,"src":"No separation period is required for agreed divorce. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":500000},"src":"Agreed divorce costs little; contested divorce with lawyers runs several hundred thousand yen; modelled.","modelled":true},"assetSplit":{"v":"Property built during the marriage is usually split equally.","src":"Japanese property division practice.","modelled":true},"custodyDefault":{"v":"Sole custody was the rule; joint custody became possible under the 2024 amendment (in force 2026).","src":"Japanese custody reform 2024/2026.","modelled":false},"supportDefault":{"v":"Child support by agreement or court order; no fixed national formula.","src":"Japanese support practice.","modelled":true},"remarriageRules":{"v":"Remarry as soon as the divorce is final; the 100-day remarriage ban for women was abolished in 2022 (effective 2024).","src":"Japanese Civil Code reform, Dec 2022 (Nippon.com).","modelled":false},"stigma":{"v":"Moderate: divorce still carries some social stigma, especially for women; more accepted among younger urban couples.","src":"Modelled from Japanese social practice.","modelled":true},"familyReaction":{"v":"Families often press for reconciliation first; the koseki (family register) makes divorce visible, which adds pressure.","src":"Modelled from Japanese family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.6,"src":"Game model estimate: family approval matters in Japan.","modelled":true},"attitudeInterfaith":{"v":"accepted; interfaith marriage is common (often Shinto + Christian-style ceremonies)","src":"Modelled from Japanese social practice.","modelled":true},"attitudeInterclass":{"v":"moderate: family background and education are weighed; 'suitable' matches are preferred","src":"Modelled from Japanese social practice.","modelled":true},"attitudeInterracial":{"v":"mixed: accepted among younger urban couples; older generations may resist","src":"Modelled from Japanese social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; older husband is traditional and unremarkable","src":"Modelled from Japanese social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted, though some families prefer a never-married match","src":"Modelled from Japanese social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":31,"female":29},"src":"MHLW 2024: mean age at first marriage 31.1 men / 29.4 women.","modelled":false},"roleExpectations":{"v":"The husband as breadwinner is still the default expectation, though dual-earner couples are now the majority; the wife typically manages the household budget.","src":"Modelled from Japanese social practice.","modelled":true}}},"eras":{"1960s":{"legal":{"minAgeMale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeFemale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before 2022: men 18, women 16 with parental consent.","modelled":false}},"divorce":{"custodyDefault":{"v":"Sole custody only before the 2024/2026 reform.","src":"Japanese custody law before 2026.","modelled":false}}},"1970s":{"legal":{"minAgeMale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeFemale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before 2022: men 18, women 16 with parental consent.","modelled":false}},"divorce":{"custodyDefault":{"v":"Sole custody only before the 2024/2026 reform.","src":"Japanese custody law before 2026.","modelled":false}}},"1980s":{"legal":{"minAgeMale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeFemale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before 2022: men 18, women 16 with parental consent.","modelled":false}},"divorce":{"custodyDefault":{"v":"Sole custody only before the 2024/2026 reform.","src":"Japanese custody law before 2026.","modelled":false}}},"1990s":{"legal":{"minAgeMale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeFemale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before 2022: men 18, women 16 with parental consent.","modelled":false}},"divorce":{"custodyDefault":{"v":"Sole custody only before the 2024/2026 reform.","src":"Japanese custody law before 2026.","modelled":false}}},"2000s":{"legal":{"minAgeMale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeFemale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before 2022: men 18, women 16 with parental consent.","modelled":false}},"divorce":{"custodyDefault":{"v":"Sole custody only before the 2024/2026 reform.","src":"Japanese custody law before 2026.","modelled":false}}},"2010s":{"legal":{"minAgeMale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeFemale":{"v":20,"src":"Before 2022: age of majority 20; men 18 and women 16 could marry with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"Before 2022: men 18, women 16 with parental consent.","modelled":false}},"divorce":{"custodyDefault":{"v":"Sole custody only before the 2024/2026 reform.","src":"Japanese custody law before 2026.","modelled":false}}},"2020s":{"legal":{"minAgeMale":{"v":18,"src":"Since 1 April 2022: 18 for both sexes.","modelled":false},"minAgeFemale":{"v":18,"src":"Since 1 April 2022: 18 for both sexes.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since April 2022.","modelled":false}},"divorce":{"custodyDefault":{"v":"Joint custody became possible under the 2024 amendment (in force 2026).","src":"Japanese custody reform 2024/2026.","modelled":false}}}}},"ita":{"country":"ita","label":"Italy","common":{"legal":{"minAgeMale":{"v":18,"src":"Italy: 18; 16 with court consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Italy: 18; 16 with court consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"A court may authorise marriage at 16 for serious reasons.","modelled":false},"consentRule":{"v":"Court consent for 16-17 year olds.","src":"Italian Civil Code.","modelled":false},"guardianApproval":{"v":"The couple themselves; a parent and/or a court only for under-18s where allowed.","src":"The couple themselves; a parent and/or a court only for under-18s where allowed.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"A civil ceremony or a concordat religious ceremony is legally a marriage.","modelled":false},"cohabitationRecognised":{"v":true,"src":"A civil ceremony or a concordat religious ceremony is legally a marriage. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in Italy with a certificate of no impediment (nulla osta) from their consulate.","src":"Italian civil marriage rules.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"Italian law.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted with court authorisation in some cases.","src":"Italian Civil Code kinship rules.","modelled":true},"religiousLawApplies":{"v":"Civil law governs; a Catholic (concordat) wedding is legally effective once registered; a civil ceremony at the comune is the standard route.","src":"Italian Civil Code; concordat weddings.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"pubblicazioni","name":"Request the pubblicazioni (banns) at the comune","fee":0,"leadTimeDays":8,"documents":["passport","birth certificate","Nulla Osta / Atto Notorio (certificate of no impediment)","divorce decree or death certificate if previously married"],"whoCanRefuse":"ufficiale di stato civile"},{"id":"civil_ceremony","name":"Civil ceremony at the comune, with two witnesses","fee":200,"leadTimeDays":1,"documents":["ID","interpreter if needed"],"whoCanRefuse":"registrar"},{"id":"certificate","name":"Marriage certificate issued","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Italian civil ceremony: pubblicazioni posted 8 days (residents; waived/shortened for non-resident foreigners); comune fees €200–600 (italianvenues.com / brideswithoutborders.com).","modelled":true},"leadTimeDays":{"v":8,"src":"Pubblicazioni (banns) posted for 8 days for residents; waived or shortened for non-resident foreigners.","modelled":false},"registrationAuthority":{"v":"Comune — Ufficio di Stato Civile","src":"Italian civil registry rules (DPR 396/2000).","modelled":false},"witnessesRequired":{"v":2,"src":"Two adult witnesses of any nationality must attend the civil ceremony.","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in Italy.","modelled":false},"documentsRequired":{"v":["passport","birth certificate","Nulla Osta / Atto Notorio (certificate of no impediment)","divorce decree or death certificate if previously married","apostille and Italian translation where required"],"src":"Italian comune document lists.","modelled":false},"whoCanRefuse":{"v":"The ufficiale di stato civile refuses if documents are missing, either party is under 18 without court approval, or a previous marriage has not ended.","src":"Italian Civil Code (marriage impediments).","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the comune","Catholic (concordat) wedding in church","symbolic ceremony at a villa / castle (not legally binding on its own)"],"src":"Italian wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; wedding bands are the customary exchange."},"src":"No mahr custom recorded in Italian wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; wedding bands are the customary exchange."},"src":"No shabka custom recorded in Italian wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in Italian wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in Italian wedding practice.","modelled":false},"gifts":{"v":"Cash gifts in envelopes (busta) and wedding list; bomboniere (favours) for guests.","src":"Italian wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Italian wedding practice.","modelled":false},"ring":{"v":{"payer":"groom","item":"Engagement ring and fede (wedding bands) exchanged at the ceremony."},"src":"Italian wedding practice.","modelled":true},"weddingFormats":{"v":["comune ceremony","church wedding","villa / castle reception","vineyard wedding","destination wedding"],"src":"Italian wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":50,"middle":100,"rich":200},"src":"Matrimonio.com 2026 Wedding Report: average 97.5 guests.","modelled":true}},"costs":{"venues":{"family_home":{"v":2000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"local_hall":{"v":7000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"hotel_4star":{"v":15000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"hotel_5star":{"v":30000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"resort":{"v":20000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"garden":{"v":9000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"destination":{"v":18000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"registry":{"v":400,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"restaurant":{"v":5000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"traditional":{"v":8000,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true},"elopement":{"v":1200,"src":"Modelled estimate anchored to Weddings Abroad Guide 2026 (exclusive-use Italian villas EUR 3,000-5,500 a day); matches the venue row in js/08.","modelled":true}},"cateringPerGuest":{"v":170,"src":"Italian wedding catering €120–220 per guest (Tuscany/Umbria); mid-point (Matrimonio.com).","modelled":true},"photography":{"v":5000,"src":"Italian wedding photographer €3,000–7,000; mid-point.","modelled":true},"averageTotal":{"v":25970,"src":"Matrimonio.com 2026 Wedding Report: average local wedding €25,970 (3,188 couples married 2025).","modelled":false},"currency":{"v":"EUR","src":"Local currency (EUR).","modelled":false},"averageTotalByClass":{"v":{"poor":9000,"middle":26000,"rich":70000},"src":"Modelled from the Matrimonio.com average of €25,970 (local weddings; destination average €67,000); no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Community of property (comunione dei beni) unless the couple chooses separation of assets.","src":"Italian Civil Code default regime.","modelled":false},"prenupEnforceability":{"v":false,"src":"Italian courts generally do not enforce prenuptial agreements on divorce division (patti prematrimoniali are not recognised).","modelled":true},"spouseInheritanceShare":{"v":"Spouse takes 1/2 with one child, 1/3 with two or more children; 2/3 with no children but surviving parents (Civil Code art. 581–582).","src":"Italian Civil Code art. 581–582.","modelled":false},"taxEffects":{"v":"No joint filing; each spouse is taxed separately on their own income.","src":"Italian income tax rules.","modelled":false},"benefits":{"v":"Pensione di reversibilità (survivor's pension, 60% of the deceased's pension) for the spouse.","src":"Italian survivor's pension.","modelled":false},"debtLiability":{"v":"shared for debts under the community of property regime; separate if the couple chose separation of assets.","src":"Italian comunione dei beni rules.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Ricongiungimento familiare (family reunification, D.Lgs. 286/1998)","eligibility":"spouse of a legal resident (sponsor with 2 years' continuous stay) or of an Italian/EU citizen","requirements":["nulla osta from the Sportello Unico","sponsor income at least €10,651.68/year (sponsor + spouse, 2026)","adequate housing","valid marriage"],"fee":0,"feeNote":"No consular fee for the family visa itself; residence permit costs apply","processingWeeks":"21","refusalAppeal":"appeal to the administrative court (TAR) against a nulla osta refusal","conditionsAfterArrival":"register the permesso di soggiorno within 8 days of arrival; work allowed","pathToSettlement":"long-term EU residence permit after 5 years; citizenship by marriage after 2 years in Italy (1 year with children)"},"src":"movingto.com / ailan.fr family reunification guides; D.Lgs. 286/1998 art. 28–29.","modelled":false},"fianceRoute":{"v":{"route":"Visa for marriage (visto per matrimonio)","eligibility":"partner of an Italian citizen or resident intending to marry in Italy","requirements":["Nulla Osta","wedding date at the comune","proof of accommodation"],"fee":116,"feeNote":"National visa fee about €116","processingWeeks":"4-12","refusalAppeal":"appeal to the administrative court (TAR)","conditionsAfterArrival":"marry within the visa validity, then apply for the family residence permit","pathToSettlement":"family reunification residence permit after the wedding"},"src":"Italian visto per matrimonio; modelled details.","modelled":true},"processingTimeWeeks":{"v":21,"src":"Nulla osta within 150 days by law, then consulate visa within 30 days; modelled 21 weeks.","modelled":true},"conditionsAfterArrival":{"v":"Register the permesso di soggiorno within 8 days of arrival; work allowed; renew before expiry.","src":"Italian residence rules.","modelled":false},"pathToSettlement":{"v":"Long-term EU residence permit after 5 years; citizenship by marriage after 2 years in Italy (1 year with children).","src":"Italian settlement rules.","modelled":false},"refusalAppeal":{"v":"Appeal to the administrative court (TAR) against a nulla osta or visa refusal.","src":"Italian immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["Separation first, then divorce; no-fault after the separation period (divorzio breve, 2015)."],"src":"Italian divorce law.","modelled":false},"process":{"v":"Legal separation (consensual or judicial); Wait the separation period; Court issues the divorce decree","src":"Italian divorce law: Law 898/1970 as amended by Law 55/2015 (divorzio breve) — legal separation first, then the court (Tribunale) issues the divorce decree.","modelled":true},"waitingPeriodDays":{"v":182,"src":"Six months of separation for a consensual divorce, twelve for a judicial one (2015 reform). (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":5000},"src":"Court and lawyer costs typically several thousand euros; modelled.","modelled":true},"assetSplit":{"v":"Community property is split; separate property stays separate.","src":"Italian property division.","modelled":false},"custodyDefault":{"v":"Shared custody (affidamento condiviso) is the default since 2006.","src":"Italian custody law 2006.","modelled":false},"supportDefault":{"v":"Maintenance (assegno di mantenimento) based on need, income and marriage length; child support by court order.","src":"Italian support rules.","modelled":false},"remarriageRules":{"v":"Remarry after the divorce is final; a woman must wait 300 days after divorce (Civil Code art. 89) unless the court waives it.","src":"Italian Civil Code art. 89 (theitalydesk.com).","modelled":false},"stigma":{"v":"Low to moderate: divorce is accepted, though the Catholic Church does not recognise it; stronger stigma in the south and among older generations.","src":"Modelled from Italian social practice.","modelled":true},"familyReaction":{"v":"Family mediation comes first in many families; the Church's position matters to religious relatives but has no legal effect.","src":"Modelled from Italian family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.55,"src":"Game model estimate: family approval matters in Italy.","modelled":true},"attitudeInterfaith":{"v":"accepted; a Catholic marrying a non-Catholic needs a dispensation, which is routinely granted","src":"Modelled from Italian social practice.","modelled":true},"attitudeInterclass":{"v":"moderate: family background matters, especially in the south","src":"Modelled from Italian social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted in the north; more resistance in the south","src":"Modelled from Italian social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from Italian social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted; the Church's position matters to religious families","src":"Modelled from Italian social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":37,"female":34},"src":"Eurostat 2024: mean age at first marriage 36.7 men / 34.2 women.","modelled":false},"roleExpectations":{"v":"Traditional roles persist in the south (man provides, woman manages the home); dual-earner couples are the norm in the north.","src":"Modelled from Italian social practice.","modelled":true}}},"eras":{"1960s":{"costs":{"currency":{"v":"ITL","src":"Italian lira, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = ITL 1936.27).","modelled":false}}},"1970s":{"costs":{"currency":{"v":"ITL","src":"Italian lira, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = ITL 1936.27).","modelled":false}}},"1980s":{"costs":{"currency":{"v":"ITL","src":"Italian lira, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = ITL 1936.27).","modelled":false}}},"1990s":{"costs":{"currency":{"v":"ITL","src":"Italian lira, the currency in force to 2001; the euro replaces it in 2002 (fixed conversion EUR 1 = ITL 1936.27).","modelled":false}}},"2000s":{},"2010s":{},"2020s":{}}},"sgp":{"country":"sgp","label":"Singapore","common":{"legal":{"minAgeMale":{"v":21,"src":"Singapore: 21 without consent; 18 with parental consent; under 18 only with a special marriage licence.","modelled":false},"minAgeFemale":{"v":21,"src":"Singapore: 21 without consent; 18 with parental consent; under 18 only with a special marriage licence.","modelled":false},"minAgeWithConsent":{"v":18,"src":"18-20 with parental consent; under 18 only with a special marriage licence.","modelled":false},"consentRule":{"v":"Parental consent for 18-20 year olds; a special licence for under-18s.","src":"Women's Charter / Administration of Muslim Law Act.","modelled":false},"guardianApproval":{"v":"The couple themselves; a parent and/or a court only for under-18s where allowed.","src":"The couple themselves; a parent and/or a court only for under-18s where allowed.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood","polygamy"],"src":"Civil marriage (ROM) or Muslim marriage (ROMM); polygamy only for Muslim men under the Administration of Muslim Law Act.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Civil marriage (ROM) or Muslim marriage (ROMM); polygamy only for Muslim men under the Administration of Muslim Law Act. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":true,"muslimOnly":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Polygamy is illegal generally; a Muslim man may have up to four wives under the Administration of Muslim Law Act (AMLA). Scope is Muslim-only, so the engine must check religion before offering it.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in Singapore with ID and proof of single status; at least one party must be present for the notice period.","src":"Registry of Marriages rules.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage under civil law; Muslim marriages follow AMLA rules.","src":"Singapore marriage law.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted.","src":"Singapore law.","modelled":false},"religiousLawApplies":{"v":"Civil law governs (Women's Charter); Muslim marriages are registered under ROMM and the Administration of Muslim Law Act.","src":"Women's Charter; Administration of Muslim Law Act.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"notice_of_marriage","name":"File a Notice of Marriage online (marriage.gov.sg)","fee":42,"leadTimeDays":21,"documents":["NRIC or passport","divorce decree or death certificate if previously married","MOM approval letter where it applies"],"whoCanRefuse":"Registry of Marriages"},{"id":"verification_declaration","name":"Verification and declaration appointment","fee":0,"leadTimeDays":7,"documents":["original NRIC/passport"],"whoCanRefuse":"Registry officer"},{"id":"solemnisation","name":"Solemnisation with a licensed solemniser and two witnesses aged 21+","fee":0,"leadTimeDays":1,"documents":["NRIC/passport of both parties and witnesses"],"whoCanRefuse":"solemniser"}],"src":"ROM procedure: Notice of Marriage at least 21 days before, valid 3 months; fee S$42 (citizen/PR) or S$380 (both foreigners) (theaurorawedding.com / rsmediasg.com).","modelled":true},"leadTimeDays":{"v":21,"src":"Notice of Marriage must be filed at least 21 days before the solemnisation (Registry of Marriages).","modelled":false},"registrationAuthority":{"v":"Registry of Marriages (ROM); Registry of Muslim Marriages (ROMM) for Muslim couples","src":"Women's Charter; Administration of Muslim Law Act.","modelled":false},"witnessesRequired":{"v":2,"src":"Two witnesses aged 21+ must be present and sign the marriage register.","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in Singapore.","modelled":false},"documentsRequired":{"v":["NRIC (citizens/PR) or passport (foreigners)","divorce decree (Interim Judgement + Certificate of Making Interim Judgement Final) or death certificate if previously married","MOM approval letter for work-permit holders marrying a citizen/PR"],"src":"Registry of Marriages document lists.","modelled":false},"whoCanRefuse":{"v":"The Registry of Marriages refuses if either party is under 21 without the required consent or court order, already married, or the 21-day notice was not observed.","src":"Women's Charter (marriage requirements).","modelled":false},"ceremonyTypes":{"v":["ROM solemnisation (civil, Women's Charter)","ROMM nikah (Muslim)","banquet reception at a hotel or restaurant","Guo Da Li betrothal ceremony (Chinese custom)"],"src":"Singapore wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"id":"mahr","label":"Mas kahwin (mahr for Muslim marriages)","defaultPayer":"groom","rangeLow":1000,"rangeHigh":10000,"currency":"SGD","note":"Agreed in the nikah contract for Muslim couples; typically a modest cash sum plus gold jewellery."},"src":"Malay Muslim mas kahwin custom; ranges modelled.","modelled":true},"shabka":{"v":{"id":"shabka","label":"Gold jewellery (dulang hantaran / Guo Da Li)","defaultPayer":"groom","rangeLow":2000,"rangeHigh":15000,"currency":"SGD","note":"Gold jewellery is customary in Malay Muslim dulang hantaran and Chinese Guo Da Li betrothal gifts; modelled range."},"src":"Singapore betrothal-gift customs; ranges modelled.","modelled":true},"gehaz":{"v":{"exists":false,"note":"No gehaz custom; couples typically furnish their HDB flat together, with parental help."},"src":"No gehaz custom recorded in Singapore wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"Guo Da Li involves betrothal gifts, not a bride price paid to the family."},"src":"No bride-price custom recorded in Singapore wedding practice.","modelled":false},"gifts":{"v":"Cash gifts in red packets (ang pow); Guo Da Li betrothal gifts for Chinese couples.","src":"Singapore wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Singapore wedding practice.","modelled":false},"ring":{"v":{"payer":"groom","item":"Engagement ring and wedding bands; gold jewellery in Malay and Chinese customs."},"src":"Singapore wedding practice.","modelled":true},"weddingFormats":{"v":["ROM solemnisation","hotel banquet","restaurant reception","garden / void deck celebration","destination wedding"],"src":"Singapore wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":50,"middle":150,"rich":300},"src":"Modelled from Singapore banquet practice (tables of 10; typical 100–300 guests).","modelled":true}},"costs":{"venues":{"family_home":{"v":3000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"local_hall":{"v":15000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"hotel_4star":{"v":30000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"hotel_5star":{"v":50000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"resort":{"v":35000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"garden":{"v":18000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"destination":{"v":25000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"registry":{"v":500,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"restaurant":{"v":12000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"traditional":{"v":16000,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true},"elopement":{"v":2500,"src":"Modelled estimate anchored to SingaporeBrides 2026 (4-star table SGD 1,200-2,000, 5-star SGD 1,400-3,000+, hotel reception SGD 28,000-50,000); matches the venue row in js/08.","modelled":true}},"cateringPerGuest":{"v":175,"src":"Singapore banquet table S$1,000–2,500 per 10 guests (S$100–250 per guest); mid-point (SingSaver / Moneysmart).","modelled":true},"photography":{"v":3750,"src":"Singapore wedding photography S$2,500–5,000+; mid-point.","modelled":true},"averageTotal":{"v":38000,"src":"Typical Singapore wedding S$30,000–50,000; median about S$37,000–40,000 (SingSaver / Moneysmart).","modelled":false},"currency":{"v":"SGD","src":"Local currency (SGD).","modelled":false},"averageTotalByClass":{"v":{"poor":15000,"middle":38000,"rich":100000},"src":"Modelled from the typical S$30,000–50,000 range; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Separate property; the court divides matrimonial assets at its discretion.","src":"Women's Charter property division.","modelled":false},"prenupEnforceability":{"v":true,"src":"A prenuptial agreement is enforceable subject to the court's overriding power over matrimonial assets (TQ v TR [2009]).","modelled":true},"spouseInheritanceShare":{"v":"Under the Intestate Succession Act, the spouse takes 1/2 with children (children share the other 1/2); everything if there are no children or parents. Muslims follow faraid.","src":"Intestate Succession Act; Administration of Muslim Law Act.","modelled":false},"taxEffects":{"v":"Separate assessment by default; married couples may opt for joint assessment.","src":"Singapore income tax rules.","modelled":false},"benefits":{"v":"CPF death benefits and dependants' protection; spouse may claim under the Intestate Succession Act.","src":"Singapore CPF rules.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for their own debts (joint debts are joint liability).","src":"Singapore debt law.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Long-Term Visit Pass (LTVP) via ICA; LTVP+ for spouses of citizens","eligibility":"foreign spouse of a Singapore citizen or permanent resident","requirements":["sponsor is a citizen or PR","Pre-Marriage LTVP Assessment (PMLA) recommended","valid marriage","health screening where required"],"fee":105,"feeNote":"S$45 submission + S$60 issue (+S$30 multiple-journey visa)","processingWeeks":"6-26","refusalAppeal":"appeal to ICA with additional documents; reapply","conditionsAfterArrival":"LTVP is renewable; LTVP+ (spouses of citizens) gives healthcare subsidies and work rights","pathToSettlement":"LTVP+ is the pathway to permanent residence; citizenship after 2 years as PR"},"src":"ICA LTVP guides (sgasiamatch.com / eh-immigration.com).","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"Singapore has no fiancé visa; couples marry first (under a visit pass if needed), then the citizen/PR spouse applies for an LTVP."},"src":"No fiancé visa in Singapore immigration practice.","modelled":false},"processingTimeWeeks":{"v":6,"src":"LTVP processing about 6 weeks with a Pre-Marriage LTVP Assessment (up to 6 months without one).","modelled":true},"conditionsAfterArrival":{"v":"LTVP is renewable; LTVP+ (spouses of citizens) gives healthcare subsidies and work rights.","src":"ICA LTVP conditions.","modelled":false},"pathToSettlement":{"v":"LTVP+ is the pathway to permanent residence; citizenship after 2 years as a permanent resident.","src":"Singapore settlement rules.","modelled":false},"refusalAppeal":{"v":"Appeal to ICA with additional supporting documents; or reapply.","src":"ICA appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault after 3 years of marriage (separation grounds); adultery and unreasonable behaviour are also grounds."],"src":"Women's Charter divorce grounds.","modelled":false},"process":{"v":"File for divorce in the Family Justice Courts (3-year bar unless exceptional hardship); Ancillary matters: property, maintenance, children; Court grants the divorce and issues the final judgment","src":"Singapore divorce law: Women's Charter — the Family Justice Courts grant the divorce on proof of irretrievable breakdown, then deal with property, maintenance and children.","modelled":true},"waitingPeriodDays":{"v":0,"src":"No separation period for fault grounds; 3 years of marriage is normally required before filing. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":10000},"src":"Uncontested divorce from a few thousand dollars; contested far more; modelled.","modelled":true},"assetSplit":{"v":"Court discretion: direct and indirect contributions decide the split.","src":"Women's Charter asset division.","modelled":false},"custodyDefault":{"v":"Joint custody is common; care and control usually goes to one parent.","src":"Singapore custody practice.","modelled":false},"supportDefault":{"v":"Wife and child maintenance by court order; the court can order lump sums or monthly payments.","src":"Women's Charter maintenance.","modelled":false},"remarriageRules":{"v":"Remarry after the divorce is final (interim judgement made final, usually 3 months later); no further waiting period.","src":"Women's Charter divorce procedure.","modelled":false},"stigma":{"v":"Low to moderate: divorce is accepted but still gossiped about; stronger stigma in Malay-Muslim and older Chinese families.","src":"Modelled from Singapore social practice.","modelled":true},"familyReaction":{"v":"Families usually mediate first; elders may press for reconciliation, especially in Malay-Muslim families.","src":"Modelled from Singapore family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.6,"src":"Game model estimate: family approval matters in Singapore.","modelled":true},"attitudeInterfaith":{"v":"mixed: accepted among Chinese and Indian families; Muslim interfaith marriage is restricted by law (a Muslim woman may not marry a non-Muslim man)","src":"Singapore personal law (Muslim interfaith restriction).","modelled":false},"attitudeInterclass":{"v":"moderate: education and income are weighed heavily in matchmaking","src":"Modelled from Singapore social practice.","modelled":true},"attitudeInterracial":{"v":"accepted; interracial marriage is common in Singapore","src":"Modelled from Singapore social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from Singapore social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted; more resistance among older generations","src":"Modelled from Singapore social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":31,"female":30},"src":"Singapore Department of Statistics 2025: median age at first marriage 31.1 men / 29.6 women.","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; domestic helpers are common; the wife typically manages the household.","src":"Modelled from Singapore social practice.","modelled":true}}},"eras":{"1960s":{"costs":{"currency":{"v":"Malaya and British Borneo dollar (M$)","src":"Malaya and British Borneo dollar (M$), the regional currency before the Singapore dollar in 1967 (introduced at par).","modelled":false}}},"1970s":{},"1980s":{},"1990s":{},"2000s":{},"2010s":{},"2020s":{}}},"bra":{"country":"bra","label":"Brazil","common":{"legal":{"minAgeMale":{"v":18,"src":"Brazil: 18; 16 with parental consent.","modelled":false},"minAgeFemale":{"v":18,"src":"Brazil: 18; 16 with parental consent.","modelled":false},"minAgeWithConsent":{"v":16,"src":"16-17 with parental consent.","modelled":false},"consentRule":{"v":"Parental consent for 16-17 year olds.","src":"Brazilian Civil Code.","modelled":false},"guardianApproval":{"v":"The couple themselves; a parent and/or a court only for under-18s where allowed.","src":"The couple themselves; a parent and/or a court only for under-18s where allowed.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Civil marriage, or a religious ceremony with civil effects; a stable union (união estável) is recognised for cohabiting couples.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Civil marriage, or a religious ceremony with civil effects; a stable union (união estável) is recognised for cohabiting couples. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in Brazil with a passport, birth certificate and proof of single status, translated and legalised.","src":"Brazilian civil registry rules.","modelled":true},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"Brazilian law.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage is permitted.","src":"Brazilian law.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; a religious wedding becomes legally effective only once registered at the cartório (within 30 days).","src":"Brazilian Civil Code; Public Records Law.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"habilitacao","name":"Habilitação para o casamento at the cartório (public notice / edital de proclamas)","fee":500,"leadTimeDays":15,"documents":["RG or passport","recent birth certificate","proof of civil status","divorce decree or death certificate if previously married","sworn Portuguese translation and apostille for foreign documents"],"whoCanRefuse":"registrar / public prosecutor"},{"id":"civil_ceremony","name":"Civil ceremony at the cartório, with two adult witnesses","fee":0,"leadTimeDays":1,"documents":["ID","two adult witnesses"],"whoCanRefuse":"registrar"},{"id":"certificate","name":"Marriage certificate issued (valid 90 days from habilitação)","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Brazilian habilitação: edital de proclamas (electronic since the 2022 reform), certificate valid 90 days; civil ceremony R$400–2,000 (alemdosonhoeventos.com.br / expat.com).","modelled":true},"leadTimeDays":{"v":15,"src":"Edital de proclamas notice window (15 days under the classic rule; certificate issued within 5 days under the 2022 reform).","modelled":false},"registrationAuthority":{"v":"Cartório de Registro Civil (civil registry office)","src":"Brazilian Public Records Law.","modelled":false},"witnessesRequired":{"v":2,"src":"Two adult witnesses required (relatives or not).","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in Brazil.","modelled":false},"documentsRequired":{"v":["RG or passport","recent birth certificate (under 3 months)","proof of civil status","divorce decree or death certificate if previously married","apostille and sworn Portuguese translation for foreign documents"],"src":"Brazilian cartório document lists.","modelled":false},"whoCanRefuse":{"v":"The registrar refuses if either party is under 16, already married, or documents are missing; the public prosecutor reviews the habilitação.","src":"Brazilian Civil Code art. 1,517–1,525.","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the cartório","religious ceremony (registered at the cartório within 30 days)","festa reception at a hall / farm / beach"],"src":"Brazilian wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; wedding bands (alianças) are the customary exchange."},"src":"No mahr custom recorded in Brazilian wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; wedding bands are the customary exchange."},"src":"No shabka custom recorded in Brazilian wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in Brazilian wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in Brazilian wedding practice.","modelled":false},"gifts":{"v":"Wedding list (lista de presentes), cash gifts (PIX transfers) and honeymoon fund.","src":"Brazilian wedding practice.","modelled":false},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Brazilian wedding practice.","modelled":false},"ring":{"v":{"payer":"both","item":"Alianças (wedding bands) exchanged at the ceremony; engagement ring from the proposer."},"src":"Brazilian wedding practice.","modelled":true},"weddingFormats":{"v":["cartório ceremony","church wedding","sítio / farm reception","beach wedding","destination wedding"],"src":"Brazilian wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":50,"middle":100,"rich":300},"src":"Brazilian weddings typically run 100–300 guests.","modelled":true}},"costs":{"venues":{"family_home":{"v":3000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"local_hall":{"v":20000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"hotel_4star":{"v":40000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"hotel_5star":{"v":80000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"resort":{"v":60000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"garden":{"v":25000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"destination":{"v":50000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"registry":{"v":800,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"restaurant":{"v":15000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"traditional":{"v":22000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true},"elopement":{"v":3000,"src":"Modelled estimate anchored to published Brazilian wedding costs (venue about USD 4,000 for 100 guests; total USD 8,000-18,000); matches the venue row in js/08.","modelled":true}},"cateringPerGuest":{"v":250,"src":"Brazilian wedding catering R$120–400 per guest; mid-point (dissesim.com).","modelled":true},"photography":{"v":5000,"src":"Brazilian wedding photography about R$3,000–8,000; modelled mid-point.","modelled":true},"averageTotal":{"v":36000,"src":"Average Brazilian wedding about US$6,600 (about R$36,000); full 100-guest weddings R$35,000–120,000 (dissesim.com).","modelled":false},"currency":{"v":"BRL","src":"Local currency (BRL).","modelled":false},"averageTotalByClass":{"v":{"poor":15000,"middle":36000,"rich":120000},"src":"Modelled from the average of about R$36,000; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Partial community (comunhão parcial de bens): what is earned during the marriage is shared; pre-marital property stays separate.","src":"Brazilian Civil Code default regime.","modelled":false},"prenupEnforceability":{"v":true,"src":"A prenuptial agreement (pacto antenupcial, public deed) is enforceable.","modelled":true},"spouseInheritanceShare":{"v":"Under partial community, the spouse takes half of the common property plus an inheritance share equal to a child's share (Civil Code art. 1829).","src":"Brazilian Civil Code art. 1829.","modelled":false},"taxEffects":{"v":"Joint filing is optional; couples may file together or separately, with deductions for a dependent spouse.","src":"Brazilian income tax rules.","modelled":false},"benefits":{"v":"Pensão por morte (survivor's pension) from the INSS for the spouse.","src":"Brazilian INSS survivor benefits.","modelled":false},"debtLiability":{"v":"shared for debts under the partial community regime; separate for pre-marital debts.","src":"Brazilian comunhão parcial rules.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"VITEM XI family reunion visa (Law 13,445/2017)","eligibility":"foreign spouse of a Brazilian citizen or resident","requirements":["valid marriage","passport","criminal record certificate","proof of the Brazilian spouse's status"],"fee":290,"feeNote":"About US$290 consular fee (varies by consulate)","processingWeeks":"4-13","refusalAppeal":"reapply with a corrected file; no formal appeal of a consular refusal","conditionsAfterArrival":"register with the Federal Police within 90 days; CRNM fee R$204.77; work allowed","pathToSettlement":"residence authorisation, then permanent residence; citizenship after 1 year of marriage and residence"},"src":"ribeirocavalcante.com.br / visabrazilservices.com VITEM XI guides; Law 13,445/2017.","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"Brazil has no fiancé visa; couples marry first (a tourist visa covers the wedding), then apply for the VITEM XI family reunion visa."},"src":"No fiancé visa in Brazilian immigration practice.","modelled":false},"processingTimeWeeks":{"v":8,"src":"Consulate processing 30–90 days for VITEM XI; modelled mid-point 8 weeks.","modelled":true},"conditionsAfterArrival":{"v":"Register with the Federal Police within 90 days; work allowed; renew the CRNM before expiry.","src":"Brazilian residence rules.","modelled":false},"pathToSettlement":{"v":"Permanent residence after the family reunion residence; citizenship after 1 year of marriage and residence.","src":"Brazilian settlement rules.","modelled":false},"refusalAppeal":{"v":"No formal appeal of a consular refusal; reapply with a corrected file.","src":"Brazilian immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault divorce since 2010 (Constitutional Amendment 66); direct divorce with no separation period."],"src":"EC 66/2010.","modelled":false},"process":{"v":"File for divorce (consensual or litigated) at the registry office or court; Agree or litigate property, support and children; Divorce is registered","src":"Brazilian divorce process.","modelled":true},"waitingPeriodDays":{"v":0,"src":"No separation period since 2010. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":5000},"src":"Registry divorce costs little; litigated divorce with lawyers runs several thousand reais; modelled.","modelled":true},"assetSplit":{"v":"Partial community is split; pre-marital property stays separate.","src":"Brazilian property division.","modelled":false},"custodyDefault":{"v":"Shared custody (guarda compartilhada) is the default since 2014.","src":"Brazilian custody law 2014.","modelled":false},"supportDefault":{"v":"Alimony (pensão alimentícia) for children and, where needed, for the spouse.","src":"Brazilian support rules.","modelled":false},"remarriageRules":{"v":"Remarry as soon as the divorce is final; no waiting period.","src":"Brazilian divorce law.","modelled":false},"stigma":{"v":"Low: divorce is socially accepted.","src":"Modelled from Brazilian social practice.","modelled":true},"familyReaction":{"v":"Family support is common; relatives have no legal say in the divorce.","src":"Modelled from Brazilian family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.5,"src":"Game model estimate: family approval matters somewhat in Brazil.","modelled":true},"attitudeInterfaith":{"v":"broadly accepted; Catholic + other faiths is common","src":"Modelled from Brazilian social practice.","modelled":true},"attitudeInterclass":{"v":"moderate: class differences are noticed; upward marriage is common but commented on","src":"Modelled from Brazilian social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted; Brazil's mixed heritage makes it common","src":"Modelled from Brazilian social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps are common and draw little comment","src":"Modelled from Brazilian social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from Brazilian social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":32,"female":29},"src":"IBGE 2022: mean age at first marriage 31.5 men / 29.2 women.","modelled":false},"roleExpectations":{"v":"Dual-earner households are common; the woman typically manages the home and children.","src":"Modelled from Brazilian social practice.","modelled":true}}},"eras":{"1960s":{"costs":{"currency":{"v":"Cruzeiro (Cr$)","src":"Cruzeiro (Cr$), the currency in force at the era mid-year (1965); Brazil changes currency again in 1967-1994 (cruzeiro novo, cruzado, cruzado novo, cruzeiro real) before the real in 1994.","modelled":false}}},"1970s":{"costs":{"currency":{"v":"Cruzeiro (Cr$)","src":"Cruzeiro (Cr$), the currency in force at the era mid-year (1975); the cruzado replaces it in 1986, then the cruzado novo, cruzeiro and cruzeiro real before the real in 1994.","modelled":false}}},"1980s":{"costs":{"currency":{"v":"Cruzeiro (Cr$)","src":"Cruzeiro (Cr$) at the era mid-year (1985); the cruzado replaces it in 1986, then the cruzado novo, cruzeiro and cruzeiro real before the real in 1994.","modelled":false}}},"1990s":{},"2000s":{},"2010s":{},"2020s":{}}},"ind":{"country":"ind","label":"India","common":{"legal":{"minAgeMale":{"v":21,"src":"India: 21 for men, 18 for women (Prohibition of Child Marriage Act 2006; Hindu Marriage Act 1955; Special Marriage Act 1954).","modelled":false},"minAgeFemale":{"v":18,"src":"India: 21 for men, 18 for women (Prohibition of Child Marriage Act 2006; Hindu Marriage Act 1955; Special Marriage Act 1954).","modelled":false},"minAgeWithConsent":{"v":null,"src":"No exceptions below the statutory ages.","modelled":false},"consentRule":{"v":"No parental consent can authorise an under-age marriage.","src":"Prohibition of Child Marriage Act 2006.","modelled":false},"guardianApproval":{"v":"The couple themselves decide; no guardian approval is needed for adults.","src":"The couple themselves decide; no guardian approval is needed for adults.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood","polygamy"],"src":"Civil marriage (Special Marriage Act) or religious marriage; polygamy only for Muslim men under Muslim personal law.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Civil marriage (Special Marriage Act) or religious marriage; polygamy only for Muslim men under Muslim personal law. (derived: cohabitation in the union list)","modelled":false},"polygamy":{"v":{"allowed":true,"muslimOnly":true,"maxSpouses":4,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":true,"outcomes":["divorce","major_conflict"]}},"src":"Polygamy is illegal for Hindus, Buddhists, Jains, Sikhs and Christians; a Muslim man may have up to four wives under Muslim personal law. Scope is Muslim-only, so the engine must check religion before offering it.","modelled":false},"foreignerRequirements":{"v":"Foreigners may marry in India under the Special Marriage Act with 30 days notice and ID; a religious ceremony needs the community's own rites.","src":"Special Marriage Act 1954.","modelled":true},"interfaithRules":{"v":"Interfaith marriage is legal under the Special Marriage Act; religious marriages follow each community's rules.","src":"Special Marriage Act 1954.","modelled":false},"prohibitedDegrees":{"v":"Cousin marriage rules vary by community and custom.","src":"Indian personal laws.","modelled":true},"religiousLawApplies":{"v":"Personal law governs by religion (Hindu, Muslim, Christian, Parsi); the secular Special Marriage Act 1954 is open to all.","src":"Indian personal laws; Special Marriage Act 1954.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"notice_of_intended_marriage","name":"Give notice of intended marriage to the Marriage Officer (Special Marriage Act)","fee":150,"leadTimeDays":30,"documents":["age proof (birth certificate / passport / school certificate)","address proof (Aadhaar / voter ID)","affidavits of marital status","passport photos"],"whoCanRefuse":"Marriage Officer"},{"id":"solemnisation","name":"Solemnisation before the Marriage Officer with three witnesses","fee":0,"leadTimeDays":1,"documents":["ID and address proof of 3 witnesses"],"whoCanRefuse":"Marriage Officer"},{"id":"certificate","name":"Marriage certificate issued the same day","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Special Marriage Act 1954: 30-day notice, 3 witnesses, Marriage Officer (blog.shaadi.com / lawbhoomi.com). Hindu Marriage Act registration has no notice period.","modelled":true},"leadTimeDays":{"v":30,"src":"Mandatory 30-day notice period under the Special Marriage Act 1954.","modelled":false},"registrationAuthority":{"v":"Marriage Officer (Sub-Registrar / SDM) under the Special Marriage Act; registrar under the Hindu Marriage Act","src":"Special Marriage Act 1954; Hindu Marriage Act 1955.","modelled":false},"witnessesRequired":{"v":3,"src":"Three adult witnesses required for a court marriage.","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in India.","modelled":false},"documentsRequired":{"v":["age proof (birth certificate, school certificate or passport)","address proof (Aadhaar, voter ID or passport)","affidavits of date of birth, marital status and nationality","passport-size photographs","divorce decree or death certificate if previously married"],"src":"Special Marriage Act document lists.","modelled":false},"whoCanRefuse":{"v":"The Marriage Officer refuses if either party is under age (21 groom / 18 bride), already married, or a valid objection is raised during the 30-day notice.","src":"Special Marriage Act 1954.","modelled":false},"ceremonyTypes":{"v":["court marriage (Special Marriage Act)","Hindu ceremony with pheras + registration","Muslim nikah","Christian church wedding","destination wedding"],"src":"Indian wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"id":"mahr","label":"Mehr (mahr for Muslim marriages)","defaultPayer":"groom","rangeLow":50000,"rangeHigh":500000,"currency":"INR","note":"Agreed in the nikahnamah for Muslim couples; amount varies widely by family."},"src":"Muslim mehr custom; ranges modelled.","modelled":true},"shabka":{"v":{"id":"shabka","label":"Gold jewellery (mangalsutra and bridal gold)","defaultPayer":"groom's family","rangeLow":100000,"rangeHigh":1000000,"currency":"INR","note":"Gold is central to Indian weddings: mangalsutra, bangles and bridal sets, usually from the groom's family; modelled range."},"src":"Indian bridal gold custom; ranges modelled.","modelled":true},"gehaz":{"v":{"payer":"bride's family","item":"trousseau: clothes, jewellery, household goods and appliances for the new home","rangeByClass":{"poor":"basic clothes and household items","middle":"clothes, jewellery and appliances","rich":"extensive trousseau including gold and electronics"},"note":"Dowry (dahej) is illegal under the Dowry Prohibition Act 1961 but gift-giving by the bride's family remains common; modelled."},"src":"Indian trousseau / dowry practice; Dowry Prohibition Act 1961.","modelled":true},"bridePrice":{"v":{"exists":false,"note":"No bride price; dowry (dahej) from the bride's family is the (illegal but persistent) transfer, not a payment to the bride's family."},"src":"No bride-price custom recorded in Indian wedding practice.","modelled":false},"gifts":{"v":"Cash envelopes (shagun), gold and household gifts from relatives; return gifts for guests.","src":"Indian wedding practice.","modelled":false},"trousseau":{"v":{"exists":true,"note":"The bride's trousseau (clothes, jewellery, household goods) is prepared by her family; see gehaz."},"src":"Indian trousseau custom.","modelled":false},"ring":{"v":{"payer":"groom","item":"Engagement ring, wedding bands and the mangalsutra (sacred necklace) tied by the groom."},"src":"Indian wedding practice.","modelled":true},"weddingFormats":{"v":["court marriage","temple / gurdwara / church ceremony","hotel / palace destination wedding","farmhouse reception"],"src":"Indian wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":100,"middle":300,"rich":800},"src":"WeddingWire India 2024: average about 330 guests.","modelled":true}},"costs":{"venues":{"family_home":{"v":50000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"local_hall":{"v":400000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"hotel_4star":{"v":800000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"hotel_5star":{"v":1500000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"resort":{"v":1200000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"garden":{"v":500000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"destination":{"v":1000000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"registry":{"v":10000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"restaurant":{"v":300000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"traditional":{"v":600000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true},"elopement":{"v":100000,"src":"Modelled estimate anchored to WeddingWire India (average venue about INR 6 lakh; total average INR 29.6 lakh) and WedMeGood (INR 39.5 lakh, 2025-26); matches the venue row in js/08.","modelled":true}},"cateringPerGuest":{"v":2500,"src":"Indian wedding catering about ₹2,000–3,000 per guest; modelled mid-point.","modelled":true},"photography":{"v":150000,"src":"Indian wedding photography about ₹100,000–200,000; modelled mid-point.","modelled":true},"averageTotal":{"v":3950000,"src":"WedMeGood 5th Annual Wedding Report 2025: average wedding ₹39.5 lakh (2,000+ couples, Apr 2025–Mar 2026).","modelled":false},"currency":{"v":"INR","src":"Local currency (INR).","modelled":false},"averageTotalByClass":{"v":{"poor":1500000,"middle":3950000,"rich":10000000},"src":"Modelled from the WedMeGood average of ₹39.5 lakh; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Separate property: each spouse keeps what is theirs; no community property regime.","src":"Indian property law.","modelled":false},"prenupEnforceability":{"v":false,"src":"Prenuptial agreements are not generally recognised or enforceable under Indian personal laws.","modelled":true},"spouseInheritanceShare":{"v":"Under the Hindu Succession Act, the widow takes an equal Class I share with the children; Muslims follow Sharia shares; separate property regime.","src":"Hindu Succession Act 1956.","modelled":false},"taxEffects":{"v":"Separate assessment; each spouse files on their own income, with limited clubbing provisions for transfers between spouses.","src":"Indian income tax rules.","modelled":false},"benefits":{"v":"Family pension for government employees' spouses; widow pension schemes vary by state.","src":"Indian pension rules.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for their own debts.","src":"Indian debt law.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Entry (X) visa, X-2 sub-category for foreign spouses","eligibility":"foreign spouse of an Indian citizen or OCI holder","requirements":["registered marriage","valid passport","proof of the Indian spouse's citizenship/OCI","FRRO registration if any single stay exceeds 180 days"],"fee":0,"feeNote":"Visa fee varies by nationality; no single published fee","processingWeeks":"4-8","refusalAppeal":"reapply with a corrected file; no formal appeal of a consular refusal","conditionsAfterArrival":"no right to work on an X visa; FRRO registration for stays over 180 days","pathToSettlement":"OCI after the marriage has subsisted for 2 continuous years; citizenship by registration after 7 years' residence"},"src":"fargoworldwide.com / nrifinancialservices.com Entry (X) visa guides; Citizenship (Amendment) Rules 2026.","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"India has no fiancé visa; couples marry first (under a tourist visa if needed), then the foreign spouse applies for an Entry (X) visa."},"src":"No fiancé visa in Indian immigration practice.","modelled":false},"processingTimeWeeks":{"v":6,"src":"Entry (X) visa processing about 4–8 weeks; modelled mid-point.","modelled":true},"conditionsAfterArrival":{"v":"No right to work on an X visa; FRRO registration if any single stay exceeds 180 days.","src":"Indian Entry (X) visa conditions.","modelled":false},"pathToSettlement":{"v":"OCI after the marriage has subsisted for 2 continuous years; citizenship by registration after 7 years' residence.","src":"Indian OCI / citizenship rules.","modelled":false},"refusalAppeal":{"v":"No formal appeal of a consular refusal; reapply with a corrected file.","src":"Indian immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["Grounds vary by personal law: cruelty, desertion, adultery, mutual consent after 1 year of separation."],"src":"Hindu Marriage Act 1955; Special Marriage Act 1954.","modelled":false},"process":{"v":"File a divorce petition in the family court; Mediation and hearings; Court issues the divorce decree","src":"Indian divorce process.","modelled":true},"waitingPeriodDays":{"v":365,"src":"One year of separation is normally required for mutual-consent divorce. (converted from months at 30.4 days per month)","modelled":true},"cost":{"v":{"estimate":100000},"src":"Mutual-consent divorce costs little; contested divorce with lawyers runs INR 100,000 or more; modelled.","modelled":true},"assetSplit":{"v":"Separate property; the court may order maintenance and residence, but there is no automatic 50/50 split.","src":"Indian property division.","modelled":false},"custodyDefault":{"v":"Best interests of the child; custody is usually awarded to one parent with visitation for the other.","src":"Indian custody rules.","modelled":false},"supportDefault":{"v":"Maintenance under personal law and Section 125 CrPC; child support by court order.","src":"Indian maintenance law.","modelled":false},"remarriageRules":{"v":"Remarry after the divorce decree; a 90-day appeal window applies in practice; no statutory waiting period.","src":"Indian divorce law.","modelled":true},"stigma":{"v":"High: divorced women face real social stigma, stronger in smaller towns and traditional families; more accepted in metros.","src":"Modelled from Indian social practice.","modelled":true},"familyReaction":{"v":"Family mediation comes first; elders commonly press for reconciliation, and a divorced daughter may be expected to return to her parents' home.","src":"Modelled from Indian family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.8,"src":"Game model estimate: family approval usually decides in India.","modelled":true},"attitudeInterfaith":{"v":"difficult: interfaith marriage is legal under the Special Marriage Act but faces strong family and social resistance","src":"Modelled from Indian social practice.","modelled":true},"attitudeInterclass":{"v":"strong: caste and class shape most arranged matches; inter-caste marriage still faces resistance","src":"Modelled from Indian social practice.","modelled":true},"attitudeInterracial":{"v":"difficult: inter-caste and inter-religion matches face more resistance than interracial ones as such","src":"Modelled from Indian social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; an older husband is the norm and expected","src":"Modelled from Indian social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"difficult: a divorced partner faces real stigma, especially a divorced woman","src":"Modelled from Indian social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":23,"female":21},"src":"NFHS: mean age at first marriage 23.4 men / 21.2 women.","modelled":false},"roleExpectations":{"v":"Traditional roles are the default: the husband provides, the wife manages the home and often lives with his parents; urban educated couples increasingly share.","src":"Modelled from Indian social practice.","modelled":true}}},"eras":{"1960s":{},"1970s":{},"1980s":{},"1990s":{},"2000s":{},"2010s":{},"2020s":{}}},"che":{"country":"che","label":"Switzerland","common":{"legal":{"minAgeMale":{"v":18,"src":"Swiss Civil Code art. 96: 18, legal capacity, not already married or in a registered partnership.","modelled":false},"minAgeFemale":{"v":18,"src":"Swiss Civil Code art. 96: 18, legal capacity, not already married or in a registered partnership.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage is registered in practice.","modelled":false},"consentRule":{"v":"Both parties must freely consent; forced marriage is a criminal offence (Art. 181a Swiss Criminal Code).","src":"Swiss Criminal Code art. 181a.","modelled":false},"guardianApproval":{"v":"The couple themselves decide; no guardian approval is needed for adults.","src":"Swiss marriage law.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Only a civil marriage at the Zivilstandsamt is legally recognised; a religious ceremony may follow the civil one.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Cohabitation is common and recognised in the union list; registered partnership was the pre-2022 route (derived: cohabitation in the union list).","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal in Switzerland; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners marry with a certificate of no impediment from their home country and a valid residence permit; documents must be recent (under 6 months) and translated into an official language.","src":"Swiss civil registry rules (legalclarity.org).","modelled":false},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"Swiss law.","modelled":false},"prohibitedDegrees":{"v":"Close blood relatives and anyone already married; under-18s.","src":"Swiss Civil Code.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; only a civil marriage at the Zivilstandsamt is legally recognised (Swiss Civil Code).","src":"Swiss Civil Code.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"marriage_preparation","name":"Marriage preparation procedure at the Zivilstandsamt (documents reviewed)","fee":225,"leadTimeDays":35,"documents":["passport or national ID","birth certificate","certificate of no impediment","residence certificate","divorce decree or death certificate if previously married"],"whoCanRefuse":"civil registrar"},{"id":"civil_ceremony","name":"Civil ceremony at the registry office, with two witnesses aged 18+","fee":150,"leadTimeDays":1,"documents":["ID"],"whoCanRefuse":"registrar"},{"id":"certificate","name":"Marriage certificate and family record book issued (CHF 30 per copy)","fee":30,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Swiss Zivilstandsamt procedure; approval can take up to 5 weeks; ceremony CHF 300–400 (legalclarity.org / mymemories.ch).","modelled":true},"leadTimeDays":{"v":35,"src":"Approval of the marriage preparation procedure can take up to 5 weeks.","modelled":true},"registrationAuthority":{"v":"Zivilstandsamt (civil registry office) of the place of residence","src":"Swiss civil registry rules.","modelled":false},"witnessesRequired":{"v":2,"src":"Two witnesses aged 18+ must attend; they need not be Swiss citizens or residents.","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in Switzerland.","modelled":false},"documentsRequired":{"v":["passport or national ID","birth certificate","certificate of no impediment","residence certificate","divorce decree or death certificate if previously married"],"src":"Swiss civil registry document lists.","modelled":false},"whoCanRefuse":{"v":"The registrar refuses if either party is under 18, already married, or documents are missing.","src":"Swiss Civil Code art. 96.","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the Zivilstandsamt","church wedding (after the civil ceremony)","castle / lakeside reception","mountain wedding"],"src":"Swiss wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; wedding bands are the customary exchange."},"src":"No mahr custom recorded in Swiss wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; wedding bands are the customary exchange."},"src":"No shabka custom recorded in Swiss wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in Swiss wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in Swiss wedding practice.","modelled":false},"gifts":{"v":"Cash gifts and wedding list; the couple often asks for money towards the honeymoon.","src":"Swiss wedding practice.","modelled":true},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Swiss wedding practice.","modelled":false},"ring":{"v":{"payer":"both","item":"Wedding bands exchanged at the ceremony; engagement ring from the proposer."},"src":"Swiss wedding practice.","modelled":true},"weddingFormats":{"v":["Zivilstandsamt ceremony","church wedding (after the civil ceremony)","castle / lakeside reception","mountain wedding"],"src":"Swiss wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":30,"middle":80,"rich":150},"src":"Modelled from Swiss wedding practice.","modelled":true}},"costs":{"venues":{"family_home":{"v":3000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"local_hall":{"v":12000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"hotel_4star":{"v":25000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"hotel_5star":{"v":45000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"resort":{"v":35000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"garden":{"v":15000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"destination":{"v":40000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"registry":{"v":300,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"restaurant":{"v":18000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"traditional":{"v":20000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"elopement":{"v":5000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true}},"cateringPerGuest":{"v":150,"src":"Swiss wedding catering about CHF 120–180 per guest; modelled mid-point.","modelled":true},"photography":{"v":3500,"src":"Swiss wedding photographer about CHF 2,500–4,500; modelled mid-point.","modelled":true},"averageTotal":{"v":35000,"src":"Most couples spend CHF 30,000–40,000 on a Swiss wedding (studyinginswitzerland.com).","modelled":false},"currency":{"v":"CHF","src":"Local currency (CHF).","modelled":false},"averageTotalByClass":{"v":{"poor":10000,"middle":35000,"rich":80000},"src":"Modelled from the CHF 30,000–40,000 range; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Participation in acquired property (Errungenschaftsbeteiligung): pre-marital property stays separate; gains during the marriage are shared.","src":"Swiss Civil Code (default regime).","modelled":false},"prenupEnforceability":{"v":true,"src":"A marriage contract (Ehevertrag, notarised) is enforceable.","modelled":true},"spouseInheritanceShare":{"v":"Spouse takes 1/2 alongside children, 3/4 alongside parents (Swiss Civil Code art. 462); the surviving spouse's statutory share (Pflichtteil) is 1/4.","src":"Swiss Civil Code art. 462.","modelled":false},"taxEffects":{"v":"Joint taxation: married couples are taxed together, with a married couple's deduction.","src":"Swiss joint taxation.","modelled":false},"benefits":{"v":"Widow's/widower's pension (AHV) and occupational pension survivor benefits.","src":"Swiss AHV survivor benefits.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for their own debts (except household necessities).","src":"Swiss Civil Code.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Familiennachzug (family reunification, FNIA/AIG art. 42–47)","eligibility":"spouse of a Swiss citizen, C permit holder, or B permit holder","requirements":["sponsor with a valid permit","adequate housing for the family","sufficient income (no federal threshold; cantonal subsistence rates)","non-EU B permit holders: 3 years' residence first","A1 language or course registration where required"],"fee":100,"feeNote":"Cantonal permit fee about CHF 100; national visa D where required","processingWeeks":"8-16","refusalAppeal":"appeal to the cantonal administrative court, then the Federal Administrative Court","conditionsAfterArrival":"B permit for the spouse; work allowed; health insurance mandatory","pathToSettlement":"C permit after 5 years (10 years for some nationalities); citizenship after 10 years' residence (3 years married to a Swiss citizen)"},"src":"Swiss Foreign Nationals and Integration Act (FNIA/AIG); lawsupport.ch / richmondchambers.ch / permitree.com guides.","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"Switzerland has no fiancé visa; couples marry first (a visitor visa covers the wedding), then the Swiss spouse applies for family reunification."},"src":"No fiancé visa in Swiss immigration practice.","modelled":false},"processingTimeWeeks":{"v":12,"src":"Cantonal approval usually 6–12 weeks; non-EU cases 8–16 weeks in practice.","modelled":true},"conditionsAfterArrival":{"v":"B permit for the spouse; work allowed; health insurance mandatory.","src":"Swiss family reunification conditions.","modelled":false},"pathToSettlement":{"v":"C permit after 5 years (10 years for some nationalities); citizenship after 10 years' residence (3 years married to a Swiss citizen).","src":"Swiss settlement rules.","modelled":false},"refusalAppeal":{"v":"Appeal to the cantonal administrative court, then the Federal Administrative Court.","src":"Swiss immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault: breakdown of the marriage (irretrievable breakdown); divorce by joint petition or unilateral petition after 2 years' separation."],"src":"Swiss Civil Code (divorce).","modelled":false},"process":{"v":"File a divorce petition with the district court; mediation and hearings; court issues the decree.","src":"Swiss divorce process.","modelled":true},"waitingPeriodDays":{"v":730,"src":"Two years' separation for a unilateral divorce petition.","modelled":true},"cost":{"v":{"estimate":10000},"src":"Court and lawyer costs typically about CHF 10,000; modelled.","modelled":true},"assetSplit":{"v":"Participation in acquired property (Errungenschaftsbeteiligung): each keeps pre-marital property; gains during the marriage are shared.","src":"Swiss property division.","modelled":false},"custodyDefault":{"v":"Joint parental authority is the default; custody by best interests of the child.","src":"Swiss custody rules.","modelled":false},"supportDefault":{"v":"Spousal maintenance by need and ability; child support by court order.","src":"Swiss maintenance rules.","modelled":false},"remarriageRules":{"v":"Remarry as soon as the divorce is final; no waiting period.","src":"Swiss divorce law.","modelled":false},"stigma":{"v":"Low: divorce is socially accepted.","src":"Modelled from Swiss social practice.","modelled":true},"familyReaction":{"v":"Family support is common; relatives have no legal say.","src":"Modelled from Swiss family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.3,"src":"Game model estimate.","modelled":true},"attitudeInterfaith":{"v":"broadly accepted","src":"Modelled from Swiss social practice.","modelled":true},"attitudeInterclass":{"v":"mild: class is rarely a barrier","src":"Modelled from Swiss social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted","src":"Modelled from Swiss social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from Swiss social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from Swiss social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":33,"female":31},"src":"Modelled from Swiss Federal Statistical Office trend (mean age at first marriage about 33 men / 31 women).","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; roles are negotiated.","src":"Modelled from Swiss social practice.","modelled":true}}},"eras":{"1960s":{},"1970s":{},"1980s":{},"1990s":{},"2000s":{},"2010s":{},"2020s":{}}},"swe":{"country":"swe","label":"Sweden","common":{"legal":{"minAgeMale":{"v":18,"src":"Swedish Marriage Code: 18, no exceptions or parental-consent workarounds since 2015.","modelled":false},"minAgeFemale":{"v":18,"src":"Swedish Marriage Code: 18, no exceptions or parental-consent workarounds since 2015.","modelled":false},"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2015.","modelled":false},"consentRule":{"v":"Both parties must freely consent; forced marriage is a criminal offence.","src":"Swedish Marriage Code.","modelled":false},"guardianApproval":{"v":"The couple themselves decide; no guardian approval is needed for adults.","src":"Swedish marriage law.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","religious","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Marriage is gender-neutral since 2009; a religious ceremony is legally effective if the community and officiant are authorised by Kammarkollegiet.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Cohabitation (sambo) is very common and recognised in the union list; sambo couples have limited legal rights compared with married couples (derived: cohabitation in the union list).","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal in Sweden; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners marry with a passport and a certificate of no impediment; there is no residency requirement for marrying in Sweden.","src":"Skatteverket marriage guidance (legalclarity.org).","modelled":false},"interfaithRules":{"v":"No legal restriction on interfaith marriage.","src":"Swedish law.","modelled":false},"prohibitedDegrees":{"v":"Parents and children, grandparents and grandchildren, full siblings, and anyone already married; under-18s.","src":"Swedish Marriage Code.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; a religious ceremony is legally effective only if the community and officiant are authorised by Kammarkollegiet.","src":"Swedish Marriage Code; Kammarkollegiet authorisation.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"hindersprovning","name":"Apply for consideration of impediments to marriage (hindersprövning) at Skatteverket (form SKV 7880)","fee":0,"leadTimeDays":28,"documents":["passports or national IDs","Certificate of No Impediment"],"whoCanRefuse":"Skatteverket"},{"id":"ceremony","name":"Civil or religious ceremony with two witnesses aged 18+","fee":500,"leadTimeDays":1,"documents":["Certificate of No Impediment (valid 4 months)","Intyg Vigsel"],"whoCanRefuse":"officiant"},{"id":"registration","name":"Officiant registers the marriage with Skatteverket","fee":0,"leadTimeDays":7,"documents":[],"whoCanRefuse":"none"}],"src":"Skatteverket hindersprövning: free, certificate valid 4 months; civil ceremony SEK 300–1,200 (legalcamp.org / Växjö and Sandviken municipality guides).","modelled":true},"leadTimeDays":{"v":28,"src":"Certificate of no impediment takes 1–8 weeks (about 1 week if both are registered, 8 weeks if neither is a citizen or resident); modelled 28 days.","modelled":true},"registrationAuthority":{"v":"Skatteverket (Swedish Tax Agency) for the impediment check; municipality / authorised officiant for the ceremony","src":"Skatteverket marriage guidance.","modelled":false},"witnessesRequired":{"v":2,"src":"Two witnesses aged 18+ must be present; they need not be Swedish citizens.","modelled":false},"medicalExamRequired":{"v":false,"src":"No medical exam is required to marry in Sweden.","modelled":false},"documentsRequired":{"v":["passports or national IDs","Certificate of No Impediment","completed form SKV 7880"],"src":"Skatteverket document lists.","modelled":false},"whoCanRefuse":{"v":"Skatteverket refuses the impediment check if either party is under 18, closely related, or already married or in a registered partnership.","src":"Swedish Marriage Code (impediments).","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the municipality","church wedding","garden / archipelago reception","winter / Lapland wedding"],"src":"Swedish wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"exists":false,"note":"No mahr custom; wedding bands are the customary exchange."},"src":"No mahr custom recorded in Swedish wedding practice.","modelled":false},"shabka":{"v":{"exists":false,"note":"No shabka/gold-set custom; wedding bands are the customary exchange."},"src":"No shabka custom recorded in Swedish wedding practice.","modelled":false},"gehaz":{"v":{"exists":false,"note":"No gehaz/trousseau custom; the couple furnishes their home together."},"src":"No gehaz custom recorded in Swedish wedding practice.","modelled":false},"bridePrice":{"v":{"exists":false,"note":"No bride price custom."},"src":"No bride-price custom recorded in Swedish wedding practice.","modelled":false},"gifts":{"v":"Cash gifts and wedding list; the couple often asks for money towards the honeymoon.","src":"Swedish wedding practice.","modelled":true},"trousseau":{"v":{"exists":false,"note":"No trousseau custom; the couple sets up home together."},"src":"No trousseau custom recorded in Swedish wedding practice.","modelled":false},"ring":{"v":{"payer":"both","item":"Plain gold wedding bands; the bride traditionally wears two rings (engagement + wedding)."},"src":"Swedish wedding practice.","modelled":true},"weddingFormats":{"v":["civil ceremony at the municipality","church wedding","garden / archipelago reception","winter / Lapland wedding"],"src":"Swedish wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":30,"middle":80,"rich":150},"src":"Modelled from Swedish wedding practice (traditional wedding 50–100 guests, legalcamp.org).","modelled":true}},"costs":{"venues":{"family_home":{"v":15000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"local_hall":{"v":60000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"hotel_4star":{"v":120000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"hotel_5star":{"v":200000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"resort":{"v":180000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"garden":{"v":80000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"destination":{"v":200000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"registry":{"v":500,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"restaurant":{"v":100000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"traditional":{"v":120000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"elopement":{"v":25000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true}},"cateringPerGuest":{"v":1500,"src":"Swedish wedding catering about SEK 1,000–2,000 per guest; modelled mid-point.","modelled":true},"photography":{"v":20000,"src":"Swedish wedding photography about SEK 15,000–25,000; modelled mid-point.","modelled":true},"averageTotal":{"v":200000,"src":"Traditional Swedish wedding (50–100 guests) €15,000–30,000, about SEK 170,000–340,000 (legalcamp.org).","modelled":false},"currency":{"v":"SEK","src":"Local currency (SEK).","modelled":false},"averageTotalByClass":{"v":{"poor":50000,"middle":200000,"rich":500000},"src":"Modelled from the €15,000–30,000 range; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Deferred community property: each spouse keeps their own property during the marriage; it is divided equally at divorce.","src":"Swedish Marriage Code (giftorättsgods).","modelled":false},"prenupEnforceability":{"v":true,"src":"A prenuptial agreement (äktenskapsförord, in writing and registered) is enforceable.","modelled":true},"spouseInheritanceShare":{"v":"The surviving spouse inherits everything if there are no children; with children, the children inherit but the spouse keeps property worth at least 4 price base amounts (basbelopp).","src":"Swedish Inheritance Code (basbelopp rule).","modelled":false},"taxEffects":{"v":"Separate taxation; each spouse is taxed on their own income (no joint filing).","src":"Swedish income tax rules.","modelled":false},"benefits":{"v":"Survivor's pension (efterlevandepension) and adjustment pension (omställningspension) from the Social Insurance Agency.","src":"Swedish survivor benefits.","modelled":false},"debtLiability":{"v":"separate; each spouse is liable only for their own debts (joint debts are joint liability).","src":"Swedish debt law.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Partner residence permit (Migrationsverket)","eligibility":"spouse, registered partner or cohabitant (sambo) of a Swedish citizen, permanent resident or permit holder","requirements":["maintenance requirement: income after tax covers housing plus 1.30× the standard amount (SEK 13,408/month left for a couple, 2026)","housing of sufficient size and standard (kitchen + 1 room for 2 adults, available 1 year)","both partners normally 21+"],"fee":1500,"feeNote":"Application fee SEK 1,500 for an adult","processingWeeks":"17-52","refusalAppeal":"appeal to the Migration Court","conditionsAfterArrival":"2-year residence permit first; full work rights","pathToSettlement":"permanent residence after 3 years (spouse of a Swedish citizen); citizenship after 5 years (3 years if married to a Swede and living together)"},"src":"Migrationsverket partner permit; Aliens Act ch. 5; swedenrelocators.se / smartly.se guides (2026 maintenance requirement).","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"Sweden has no fiancé visa; couples marry first, then the foreign spouse applies for a partner residence permit."},"src":"No fiancé visa in Swedish immigration practice.","modelled":false},"processingTimeWeeks":{"v":35,"src":"Partner permit processing 4–12 months (Swedish citizen sponsor), 6–18 months otherwise; modelled 35 weeks.","modelled":true},"conditionsAfterArrival":{"v":"2-year permit; full work rights; register with Skatteverket for a personnummer.","src":"Migrationsverket partner permit conditions.","modelled":false},"pathToSettlement":{"v":"Permanent residence after 3 years (spouse of a Swedish citizen); citizenship after 5 years (3 years if married to a Swede).","src":"Swedish settlement rules.","modelled":false},"refusalAppeal":{"v":"Appeal to the Migration Court.","src":"Swedish immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault: divorce by joint application, or unilateral application with a 6-month reconsideration period (betänketid) if there are children under 16 or one party objects."],"src":"Swedish Marriage Code (divorce).","modelled":false},"process":{"v":"Apply to the district court (tingsrätt); 6-month reconsideration period where required; court issues the decree.","src":"Swedish divorce process.","modelled":true},"waitingPeriodDays":{"v":180,"src":"Six-month reconsideration period (betänketid) where required.","modelled":true},"cost":{"v":{"estimate":15000},"src":"Court and lawyer costs typically about SEK 15,000; modelled.","modelled":true},"assetSplit":{"v":"Deferred community property (giftorättsgods): each spouse's property is divided equally at divorce, except separate property.","src":"Swedish property division.","modelled":false},"custodyDefault":{"v":"Joint custody is the default; the court decides by best interests of the child.","src":"Swedish custody rules.","modelled":false},"supportDefault":{"v":"Child support by court order; spousal maintenance only in exceptional cases.","src":"Swedish maintenance rules.","modelled":false},"remarriageRules":{"v":"Remarry as soon as the divorce is final; no waiting period.","src":"Swedish divorce law.","modelled":false},"stigma":{"v":"Low: divorce is socially accepted.","src":"Modelled from Swedish social practice.","modelled":true},"familyReaction":{"v":"Family support is common; relatives have no legal say.","src":"Modelled from Swedish family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.25,"src":"Game model estimate.","modelled":true},"attitudeInterfaith":{"v":"broadly accepted","src":"Modelled from Swedish social practice.","modelled":true},"attitudeInterclass":{"v":"mild: class is rarely a barrier","src":"Modelled from Swedish social practice.","modelled":true},"attitudeInterracial":{"v":"broadly accepted","src":"Modelled from Swedish social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; large gaps draw comment","src":"Modelled from Swedish social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"accepted","src":"Modelled from Swedish social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":37,"female":35},"src":"Eurostat 2024: mean age at first marriage 37.4 men / 35.2 women.","modelled":false},"roleExpectations":{"v":"Dual-earner households are the norm; parental leave is shared and housework is expected to be shared.","src":"Modelled from Swedish social practice.","modelled":true}}},"eras":{"1960s":{"legal":{"minAgeWithConsent":{"v":16,"src":"Before 2015, 16- and 17-year-olds could marry with permission from the county administrative board (länsstyrelsen); since 2015 no under-18 marriage.","modelled":false}}},"1970s":{"legal":{"minAgeWithConsent":{"v":16,"src":"Before 2015, 16- and 17-year-olds could marry with permission from the county administrative board (länsstyrelsen); since 2015 no under-18 marriage.","modelled":false}}},"1980s":{"legal":{"minAgeWithConsent":{"v":16,"src":"Before 2015, 16- and 17-year-olds could marry with permission from the county administrative board (länsstyrelsen); since 2015 no under-18 marriage.","modelled":false}}},"1990s":{"legal":{"minAgeWithConsent":{"v":16,"src":"Before 2015, 16- and 17-year-olds could marry with permission from the county administrative board (länsstyrelsen); since 2015 no under-18 marriage.","modelled":false}}},"2000s":{"legal":{"minAgeWithConsent":{"v":16,"src":"Before 2015, 16- and 17-year-olds could marry with permission from the county administrative board (länsstyrelsen); since 2015 no under-18 marriage.","modelled":false}}},"2010s":{"legal":{"minAgeWithConsent":{"v":16,"src":"Before 2015, 16- and 17-year-olds could marry with permission from the county administrative board (länsstyrelsen); since 2015 no under-18 marriage.","modelled":false}}},"2020s":{"legal":{"minAgeWithConsent":{"v":null,"src":"No under-18 marriage since 2015.","modelled":false}}}}},"tur":{"country":"tur","label":"Turkey","common":{"legal":{"minAgeMale":{"v":18,"src":"Turkish Civil Code art. 124 (Law 4721, 2002): 18 for both; 17 with consent, 16 by court decision.","modelled":false},"minAgeFemale":{"v":18,"src":"Turkish Civil Code art. 124 (Law 4721, 2002): 18 for both; 17 with consent, 16 by court decision.","modelled":false},"minAgeWithConsent":{"v":17,"src":"17 with parental consent, 16 with court approval in extraordinary circumstances (Turkish Civil Code art. 124).","modelled":false},"consentRule":{"v":"Both parties must freely consent; forced marriage is not recognised.","src":"Turkish Civil Code.","modelled":false},"guardianApproval":{"v":"The couple themselves decide; no guardian approval is needed for adults (parental consent only for 17-year-olds).","src":"Turkish Civil Code art. 124.","modelled":false},"recognizedUnions":{"v":["dating","cohabitation","engagement","civil","civil_religious","arranged","elopement","marry_for_visa","remarriage_divorce","remarriage_widowhood"],"src":"Only a civil marriage at the belediye is legally recognised; a religious ceremony alone has no legal effect.","modelled":false},"cohabitationRecognised":{"v":true,"src":"Cohabitation is common but has no legal status; the union list includes it (derived: cohabitation in the union list).","modelled":false},"polygamy":{"v":{"allowed":false,"maxSpouses":null,"existingSpouseConsentRequired":false,"spouseLearnsReaction":{"mandatory":false,"outcomes":[]}},"src":"Polygamy is illegal in Turkey; a bigamous marriage is void.","modelled":false},"foreignerRequirements":{"v":"Foreigners marry with a Certificate of No Impediment from their home country (apostilled and translated into Turkish) and a valid passport; no residency requirement.","src":"Turkish marriage regulation (Evlendirme Yönetmeliği); turkpidya.com.","modelled":false},"interfaithRules":{"v":"No legal restriction on interfaith marriage (civil ceremony); religious rules apply only to religious ceremonies.","src":"Turkish Civil Code.","modelled":false},"prohibitedDegrees":{"v":"Close blood relatives, in-laws in the direct line, adoptive relationships, and anyone already married; under-18s without consent.","src":"Turkish Civil Code.","modelled":false},"religiousLawApplies":{"v":"Civil law governs; only a civil marriage at the belediye (municipality) is legally recognised — a religious ceremony alone has no legal effect.","src":"Turkish Civil Code.","modelled":false},"civilUnionNonMuslimOnly":{"v":false,"src":"Civil marriage is not restricted to non-Muslims only (the UAE 2020s era is the exception, where it is).","modelled":false}},"procedure":{"steps":{"v":[{"id":"apply_municipality","name":"Apply at the municipal marriage office (evlendirme dairesi) with documents","fee":1000,"leadTimeDays":3,"documents":["Turkish ID or passport","6 passport photos","health certificate from a state hospital","Certificate of No Impediment (foreigners, apostilled and translated)"],"whoCanRefuse":"marriage officer (nikah memuru)"},{"id":"civil_ceremony","name":"Civil ceremony with two witnesses (not close relatives)","fee":0,"leadTimeDays":1,"documents":["IDs of 2 witnesses (not close relatives)"],"whoCanRefuse":"marriage officer"},{"id":"family_booklet","name":"Family booklet (aile cüzdanı) issued","fee":0,"leadTimeDays":1,"documents":[],"whoCanRefuse":"none"}],"src":"Turkish marriage regulation (Evlendirme Yönetmeliği); municipal fees TL 500–1,000+ (foreigners extra, e.g. Şişli 16,000 TL in 2026) (turkpidya.com / istanbulproperty.com).","modelled":true},"leadTimeDays":{"v":3,"src":"Foreigners must arrive at least 3 days before the wedding for the consulate and registrar steps.","modelled":true},"registrationAuthority":{"v":"Municipal marriage office (evlendirme dairesi) or district registry office (nüfus müdürlüğü)","src":"Turkish marriage regulation.","modelled":false},"witnessesRequired":{"v":2,"src":"Two witnesses who are not close relatives must attend.","modelled":false},"medicalExamRequired":{"v":true,"src":"A health certificate from a state hospital is required under Turkish Civil Code (Tripadvisor / British Embassy guidance; Kuşadası municipality list).","modelled":false},"documentsRequired":{"v":["Turkish ID or passport","6 passport photos","health certificate from a state hospital","Certificate of No Impediment (foreigners, apostilled and translated)","birth certificate translated into Turkish (foreigners)"],"src":"Turkish municipal marriage-office document lists.","modelled":false},"whoCanRefuse":{"v":"The marriage officer refuses if either party is under 18 without consent, already married, the health certificate is missing, or documents are incomplete.","src":"Turkish Civil Code (marriage conditions).","modelled":false},"ceremonyTypes":{"v":["civil ceremony at the belediye","wedding hall (düğün salonu) reception","village wedding","hotel / beach wedding in Antalya or Bodrum"],"src":"Turkish wedding practice.","modelled":false}},"customs":{"mahr":{"v":{"id":"mahr","label":"Mahr / başlık (dowry)","defaultPayer":"groom","rangeLow":50000,"rangeHigh":500000,"currency":"TRY","note":"Mahr is customary in religious marriages; başlık (bride price) persists in some regions. Ranges modelled."},"src":"Turkish mahr / başlık custom; ranges modelled.","modelled":true},"shabka":{"v":{"id":"shabka","label":"Gold jewellery (takı)","defaultPayer":"groom","rangeLow":100000,"rangeHigh":1000000,"currency":"TRY","note":"Gold jewellery pinned on the couple at the wedding (takı töreni) is a major custom; modelled range."},"src":"Turkish takı custom; ranges modelled.","modelled":true},"gehaz":{"v":{"payer":"bride's family","item":"çeyiz (trousseau): household goods, linens, appliances and gold for the new home","rangeByClass":{"poor":"basic household goods","middle":"full household + appliances","rich":"extensive trousseau including gold"},"note":"Çeyiz is prepared by the bride's family; modelled."},"src":"Turkish çeyiz custom.","modelled":true},"bridePrice":{"v":{"exists":true,"note":"Başlık (bride price) is customary in some regions, paid by the groom's family to the bride's family; not a legal requirement."},"src":"Turkish başlık custom (studycountry.com).","modelled":false},"gifts":{"v":"Gold jewellery pinned on the couple (takı) and cash gifts in envelopes; the groom's family pays for the wedding.","src":"Turkish wedding practice (studycountry.com).","modelled":true},"trousseau":{"v":{"exists":true,"note":"Çeyiz (trousseau) is prepared by the bride's family; see gehaz."},"src":"Turkish çeyiz custom.","modelled":false},"ring":{"v":{"payer":"groom","item":"Engagement ring and wedding bands; gold jewellery (takı) is pinned on the couple at the ceremony."},"src":"Turkish wedding practice.","modelled":true},"weddingFormats":{"v":["belediye (municipal) ceremony","wedding hall (düğün salonu) reception","village wedding","hotel / beach wedding in Antalya or Bodrum"],"src":"Turkish wedding practice.","modelled":true},"typicalGuestCount":{"v":{"poor":100,"middle":200,"rich":500},"src":"Modelled from Turkish wedding practice (200-person dinner weddings are typical, studycountry.com).","modelled":true}},"costs":{"venues":{"family_home":{"v":50000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"local_hall":{"v":250000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"hotel_4star":{"v":500000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"hotel_5star":{"v":900000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"resort":{"v":800000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"garden":{"v":300000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"destination":{"v":900000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"registry":{"v":1000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"restaurant":{"v":400000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"traditional":{"v":500000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true},"elopement":{"v":100000,"src":"Modelled from the average wedding cost for this country; no published venue-price series found.","modelled":true}},"cateringPerGuest":{"v":3500,"src":"Turkish wedding catering about TL 2,000–5,000 per guest; modelled mid-point.","modelled":true},"photography":{"v":50000,"src":"Turkish wedding photography about TL 30,000–80,000; modelled mid-point.","modelled":true},"averageTotal":{"v":750000,"src":"Modelled 2026 TRY for a full Turkish wedding; small destination weddings budget a median €8,350 (weddingabroad.group) and full local weddings run higher.","modelled":false},"currency":{"v":"TRY","src":"Local currency (TRY).","modelled":false},"averageTotalByClass":{"v":{"poor":250000,"middle":750000,"rich":2000000},"src":"Modelled from the TRY 750,000 average; no published class breakdown found.","modelled":true}},"money":{"propertyRegime":{"v":"Participation in acquired property: gains during the marriage are shared; pre-marital property stays separate (Turkish Civil Code, default since 2002).","src":"Turkish Civil Code (edinilmiş mallara katılma rejimi).","modelled":false},"prenupEnforceability":{"v":true,"src":"A marriage contract (mal rejimi sözleşmesi, notarised) is enforceable.","modelled":true},"spouseInheritanceShare":{"v":"Spouse takes 1/4 alongside children, 1/2 alongside parents, 3/4 alongside grandparents (Turkish Civil Code art. 499); statutory share (saklı pay) applies.","src":"Turkish Civil Code art. 499.","modelled":false},"taxEffects":{"v":"Separate taxation; each spouse files on their own income.","src":"Turkish income tax rules.","modelled":false},"benefits":{"v":"Survivor's pension (dul/yetim aylığı) from the SGK for the spouse.","src":"Turkish SGK survivor benefits.","modelled":false},"debtLiability":{"v":"shared for household debts; separate for personal debts (Turkish Civil Code).","src":"Turkish Civil Code.","modelled":false}},"immigration":{"spouseRoute":{"v":{"route":"Family residence permit (aile ikamet izni, Law 6458 art. 34–37)","eligibility":"foreign spouse of a Turkish citizen or of a foreigner holding a residence/work permit","requirements":["sponsor income at least the minimum wage, plus 1/3 of the minimum wage per family member","suitable housing","health insurance covering all family members","foreign sponsor must have held a residence permit for at least 1 year"],"fee":964,"feeNote":"Card fee 964 TL (2026) plus the harç for the applicant's nationality","processingWeeks":"13","refusalAppeal":"appeal to the administrative court; reapply with a corrected file","conditionsAfterArrival":"permit for up to 3 years, never longer than the sponsor's own permit; no more than 180 days outside Turkey per year","pathToSettlement":"citizenship after 3 years of genuine marriage to a Turkish citizen"},"src":"Law No. 6458 art. 34–37; tuncaybarcinlawoffice.com / karanfiloglu.av.tr / simplytr.com guides.","modelled":false},"fianceRoute":{"v":{"exists":false,"note":"Turkey has no fiancé visa; couples marry first (a tourist visa covers the wedding), then the foreign spouse applies for a family residence permit."},"src":"No fiancé visa in Turkish immigration practice.","modelled":false},"processingTimeWeeks":{"v":13,"src":"Family residence permit assessment up to 90 days (Law 6458).","modelled":true},"conditionsAfterArrival":{"v":"Up to 3 years at a time; health insurance required; address must be registered.","src":"Law 6458 art. 34–37.","modelled":false},"pathToSettlement":{"v":"Citizenship after 3 years of marriage to a Turkish citizen.","src":"Turkish citizenship law.","modelled":false},"refusalAppeal":{"v":"Appeal to the administrative court; reapply with a corrected file.","src":"Turkish immigration appeal practice.","modelled":false}},"divorce":{"grounds":{"v":["No-fault by mutual agreement (anlaşmalı boşanma) after 1 year of marriage; contested divorce for adultery, violence, desertion or breakdown."],"src":"Turkish Civil Code (divorce).","modelled":false},"process":{"v":"File a divorce petition with the family court; mediation is required before a contested case; court issues the decree.","src":"Turkish divorce process.","modelled":true},"waitingPeriodDays":{"v":365,"src":"One year of marriage before a mutual-agreement divorce.","modelled":true},"cost":{"v":{"estimate":100000},"src":"Court and lawyer costs typically about TL 100,000; modelled.","modelled":true},"assetSplit":{"v":"Participation in acquired property (edinilmiş mallara katılma rejimi): gains during the marriage are shared; pre-marital property stays separate.","src":"Turkish property division.","modelled":false},"custodyDefault":{"v":"Custody by best interests of the child; joint custody possible since 2016.","src":"Turkish custody rules.","modelled":false},"supportDefault":{"v":"Spousal maintenance (nafaka) and child support by court order.","src":"Turkish maintenance rules.","modelled":false},"remarriageRules":{"v":"Remarry as soon as the divorce is final; a woman must wait 300 days after divorce (Turkish Civil Code art. 132) unless the court lifts it or she proves she is not pregnant.","src":"Turkish Civil Code art. 132.","modelled":false},"stigma":{"v":"Moderate: divorce is accepted in cities but still carries stigma in smaller towns and traditional families.","src":"Modelled from Turkish social practice.","modelled":true},"familyReaction":{"v":"Family mediation comes first; elders commonly press for reconciliation.","src":"Modelled from Turkish family practice.","modelled":true}},"social":{"familyApprovalWeight":{"v":0.75,"src":"Game model estimate.","modelled":true},"attitudeInterfaith":{"v":"difficult: interfaith marriage is legal (civil ceremony) but faces family resistance, especially for a Muslim woman marrying a non-Muslim man","src":"Modelled from Turkish social practice.","modelled":true},"attitudeInterclass":{"v":"moderate: family background matters","src":"Modelled from Turkish social practice.","modelled":true},"attitudeInterracial":{"v":"accepted in cities; more resistance in traditional families","src":"Modelled from Turkish social practice.","modelled":true},"attitudeAgeGap":{"v":"accepted; an older husband is the norm","src":"Modelled from Turkish social practice.","modelled":true},"attitudeDivorcedPartner":{"v":"difficult: a divorced partner, especially a divorced woman, faces stigma","src":"Modelled from Turkish social practice.","modelled":true},"typicalAgeAtMarriage":{"v":{"male":29,"female":26},"src":"Modelled from TurkStat (mean age at first marriage about 29 men / 26 women).","modelled":false},"roleExpectations":{"v":"Traditional roles are the default: the husband provides, the wife manages the home; urban educated couples increasingly share.","src":"Modelled from Turkish social practice.","modelled":true}}},"eras":{"1960s":{"legal":{"minAgeFemale":{"v":17,"src":"Turkish Civil Code 1926 (Law 743): 18 for men, 17 for women; the 2002 Civil Code (Law 4721) set 18 for both.","modelled":false}}},"1970s":{"legal":{"minAgeFemale":{"v":17,"src":"Turkish Civil Code 1926 (Law 743): 18 for men, 17 for women; the 2002 Civil Code (Law 4721) set 18 for both.","modelled":false}}},"1980s":{"legal":{"minAgeFemale":{"v":17,"src":"Turkish Civil Code 1926 (Law 743): 18 for men, 17 for women; the 2002 Civil Code (Law 4721) set 18 for both.","modelled":false}}},"1990s":{"legal":{"minAgeFemale":{"v":17,"src":"Turkish Civil Code 1926 (Law 743): 18 for men, 17 for women; the 2002 Civil Code (Law 4721) set 18 for both.","modelled":false}}},"2000s":{"legal":{"minAgeFemale":{"v":17,"src":"Turkish Civil Code 1926 (Law 743): 18 for men, 17 for women; the 2002 Civil Code (Law 4721) set 18 for both.","modelled":false}}},"2010s":{"legal":{"minAgeFemale":{"v":18,"src":"Turkish Civil Code (Law 4721, 2002): 18 for both.","modelled":false}}},"2020s":{"legal":{"minAgeFemale":{"v":18,"src":"Turkish Civil Code (Law 4721, 2002): 18 for both.","modelled":false}}}}}};

export const EXTRA_MODERN_TRACKS = [
  {
    "id": "ai_ml",
    "label": "AI & Machine Learning Research",
    "reqDegrees": [
      "cs",
      "engineering"
    ],
    "payMult": 1.82,
    "visaDemand": 0.98,
    "availableFrom": 2014
  },
  {
    "id": "cybersecurity",
    "label": "Cybersecurity & Cloud Defense",
    "reqDegrees": [
      "cs",
      "engineering"
    ],
    "payMult": 1.62,
    "visaDemand": 0.94,
    "availableFrom": 2005
  },
  {
    "id": "petroleum_energy",
    "label": "Petroleum, LNG & Upstream Energy",
    "reqDegrees": [
      "engineering"
    ],
    "payMult": 1.75,
    "visaDemand": 0.9,
    "availableFrom": 1960
  },
  {
    "id": "renewable_solar",
    "label": "Renewable Solar, Hydrogen & Desalination",
    "reqDegrees": [
      "engineering"
    ],
    "payMult": 1.48,
    "visaDemand": 0.89,
    "availableFrom": 2008
  },
  {
    "id": "islamic_finance",
    "label": "Islamic Banking, Sukuk & Treasury",
    "reqDegrees": [
      "business",
      "law"
    ],
    "payMult": 1.45,
    "visaDemand": 0.78,
    "availableFrom": 1975
  },
  {
    "id": "sovereign_pe",
    "label": "Sovereign Wealth & Private Equity",
    "reqDegrees": [
      "business"
    ],
    "payMult": 1.95,
    "visaDemand": 0.8,
    "availableFrom": 1976
  },
  {
    "id": "urban_masterplan",
    "label": "Mega-Project Architecture & Urban Planning",
    "reqDegrees": [
      "engineering"
    ],
    "payMult": 1.42,
    "visaDemand": 0.86,
    "availableFrom": 1960
  },
  {
    "id": "aviation_pilot",
    "label": "Commercial Airline Pilot & Captaincy",
    "reqDegrees": [
      "engineering",
      "cs"
    ],
    "payMult": 1.88,
    "visaDemand": 0.92,
    "availableFrom": 1960
  },
  {
    "id": "radiology_imaging",
    "label": "Diagnostic & Interventional Radiology",
    "reqDegrees": [
      "medicine"
    ],
    "payMult": 1.78,
    "visaDemand": 0.93,
    "availableFrom": 1970
  },
  {
    "id": "cardiology_surg",
    "label": "Cardiology & Cardiothoracic Surgery",
    "reqDegrees": [
      "medicine"
    ],
    "payMult": 2.05,
    "visaDemand": 0.96,
    "availableFrom": 1965
  },
  {
    "id": "dentistry",
    "label": "Dental & Maxillofacial Practice",
    "reqDegrees": [
      "medicine",
      "pharmacy"
    ],
    "payMult": 1.44,
    "visaDemand": 0.75,
    "availableFrom": 1960
  },
  {
    "id": "biotech_genomics",
    "label": "Biotech, mRNA & Genomics R&D",
    "reqDegrees": [
      "pharmacy",
      "medicine"
    ],
    "payMult": 1.58,
    "visaDemand": 0.91,
    "availableFrom": 1995
  },
  {
    "id": "fintech_product",
    "label": "Fintech Product & Digital Payments",
    "reqDegrees": [
      "cs",
      "business"
    ],
    "payMult": 1.56,
    "visaDemand": 0.85,
    "availableFrom": 2012
  },
  {
    "id": "supply_chain_ports",
    "label": "Maritime Ports, Suez/Jebel Ali & Global Logistics",
    "reqDegrees": [
      "business",
      "engineering"
    ],
    "payMult": 1.32,
    "visaDemand": 0.82,
    "availableFrom": 1960
  },
  {
    "id": "hospitality_luxury",
    "label": "5-Star Resort & Giga-Tourism Management",
    "reqDegrees": [
      "business",
      "education"
    ],
    "payMult": 1.22,
    "visaDemand": 0.78,
    "availableFrom": 1965
  },
  {
    "id": "semiconductor_vlsi",
    "label": "Semiconductor & Chip Design (VLSI)",
    "reqDegrees": [
      "engineering",
      "cs"
    ],
    "payMult": 1.76,
    "visaDemand": 0.95,
    "availableFrom": 1975
  },
  {
    "id": "robotics_automation",
    "label": "Industrial Robotics & Autonomous Systems",
    "reqDegrees": [
      "engineering",
      "cs"
    ],
    "payMult": 1.64,
    "visaDemand": 0.92,
    "availableFrom": 1990
  },
  {
    "id": "quant_risk",
    "label": "Quantitative Risk & Actuarial Science",
    "reqDegrees": [
      "business",
      "cs"
    ],
    "payMult": 1.72,
    "visaDemand": 0.86,
    "availableFrom": 1985
  },
  {
    "id": "international_arb",
    "label": "International Commercial Arbitration (DIFC/LCIA)",
    "reqDegrees": [
      "law"
    ],
    "payMult": 1.74,
    "visaDemand": 0.7,
    "availableFrom": 1980
  },
  {
    "id": "diplomacy_policy",
    "label": "Foreign Service, Policy & Development",
    "reqDegrees": [
      "law",
      "business",
      "education"
    ],
    "payMult": 1.28,
    "visaDemand": 0.6,
    "availableFrom": 1960
  },
  {
    "id": "media_film",
    "label": "Cinema, Broadcast & Streaming Production",
    "reqDegrees": [
      "education",
      "business"
    ],
    "payMult": 1.18,
    "visaDemand": 0.55,
    "availableFrom": 1960
  },
  {
    "id": "telecom_5g",
    "label": "Telecom Core Networks & Subsea Fiber",
    "reqDegrees": [
      "engineering",
      "cs"
    ],
    "payMult": 1.4,
    "visaDemand": 0.84,
    "availableFrom": 1985
  },
  {
    "id": "agritech_food",
    "label": "AgriTech, Food Security & Cold Chain",
    "reqDegrees": [
      "engineering",
      "pharmacy"
    ],
    "payMult": 1.24,
    "visaDemand": 0.76,
    "availableFrom": 1970
  },
  {
    "id": "real_estate_dev",
    "label": "Real Estate Development & Asset Management",
    "reqDegrees": [
      "business",
      "engineering"
    ],
    "payMult": 1.46,
    "visaDemand": 0.7,
    "availableFrom": 1965
  },
  {
    "id": "edtech_curriculum",
    "label": "International Curriculum & EdTech Leadership",
    "reqDegrees": [
      "education"
    ],
    "payMult": 1.14,
    "visaDemand": 0.72,
    "availableFrom": 1995
  },
  {
    "id": "clinical_psych",
    "label": "Clinical Psychology & Behavioral Health",
    "reqDegrees": [
      "medicine",
      "education"
    ],
    "payMult": 1.26,
    "visaDemand": 0.76,
    "availableFrom": 1970
  },
  {
    "id": "automotive_ev",
    "label": "EV Powertrain & Battery Engineering",
    "reqDegrees": [
      "engineering"
    ],
    "payMult": 1.54,
    "visaDemand": 0.9,
    "availableFrom": 2012
  },
  {
    "id": "mining_minerals",
    "label": "Critical Minerals, Gold & Phosphate Mining",
    "reqDegrees": [
      "engineering"
    ],
    "payMult": 1.48,
    "visaDemand": 0.84,
    "availableFrom": 1960
  },
  {
    "id": "ecommerce_growth",
    "label": "Marketplace Operations & Growth",
    "reqDegrees": [
      "business",
      "cs"
    ],
    "payMult": 1.34,
    "visaDemand": 0.74,
    "availableFrom": 2005
  },
  {
    "id": "aerospace_sat",
    "label": "Aerospace & Satellite Systems",
    "reqDegrees": [
      "engineering",
      "cs"
    ],
    "payMult": 1.68,
    "visaDemand": 0.88,
    "availableFrom": 1970
  },
  {
    "id": "sports_medicine",
    "label": "Orthopedic & Pro Sports Rehabilitation",
    "reqDegrees": [
      "medicine"
    ],
    "payMult": 1.52,
    "visaDemand": 0.82,
    "availableFrom": 1980
  }
];
export const EXTRA_REAL_COMPANIES = [
  {
    "id": "co_neom",
    "name": "NEOM",
    "country": "sau",
    "industry": "engineering",
    "salaryMult": 1.45,
    "founded": 2017
  },
  {
    "id": "co_redseaglobal",
    "name": "Red Sea Global",
    "country": "sau",
    "industry": "engineering",
    "salaryMult": 1.38,
    "founded": 2018
  },
  {
    "id": "co_riyadhair",
    "name": "Riyadh Air",
    "country": "sau",
    "industry": "aviation",
    "salaryMult": 1.4,
    "founded": 2023
  },
  {
    "id": "co_humain",
    "name": "HUMAIN AI (PIF)",
    "country": "sau",
    "industry": "software",
    "salaryMult": 1.55,
    "founded": 2025
  },
  {
    "id": "co_acwapower",
    "name": "ACWA Power",
    "country": "sau",
    "industry": "engineering",
    "salaryMult": 1.32,
    "founded": 2004
  },
  {
    "id": "co_maaden",
    "name": "Ma'aden Saudi Arabian Mining",
    "country": "sau",
    "industry": "engineering",
    "salaryMult": 1.3,
    "founded": 1997
  },
  {
    "id": "co_almarai",
    "name": "Almarai",
    "country": "sau",
    "industry": "operations",
    "salaryMult": 1.18,
    "founded": 1977
  },
  {
    "id": "co_tamara",
    "name": "Tamara Fintech",
    "country": "sau",
    "industry": "software",
    "salaryMult": 1.36,
    "founded": 2020
  },
  {
    "id": "co_g42",
    "name": "G42 Group",
    "country": "uae",
    "industry": "software",
    "salaryMult": 1.48,
    "founded": 2018
  },
  {
    "id": "co_mubadala",
    "name": "Mubadala Investment Company",
    "country": "uae",
    "industry": "finance",
    "salaryMult": 1.55,
    "founded": 2002
  },
  {
    "id": "co_dpworld",
    "name": "DP World Jebel Ali",
    "country": "uae",
    "industry": "operations",
    "salaryMult": 1.28,
    "founded": 1972
  },
  {
    "id": "co_tabby",
    "name": "Tabby MENA",
    "country": "uae",
    "industry": "software",
    "salaryMult": 1.35,
    "founded": 2019
  },
  {
    "id": "co_talabat",
    "name": "Talabat HQ Dubai",
    "country": "uae",
    "industry": "software",
    "salaryMult": 1.3,
    "founded": 2004
  },
  {
    "id": "co_masdar",
    "name": "Masdar Clean Energy",
    "country": "uae",
    "industry": "engineering",
    "salaryMult": 1.34,
    "founded": 2006
  },
  {
    "id": "co_paymob",
    "name": "Paymob Egypt",
    "country": "egy",
    "industry": "software",
    "salaryMult": 1.32,
    "founded": 2015
  },
  {
    "id": "co_mnthalan",
    "name": "MNT-Halan",
    "country": "egy",
    "industry": "finance",
    "salaryMult": 1.35,
    "founded": 2017
  },
  {
    "id": "co_thndr",
    "name": "Thndr Investing",
    "country": "egy",
    "industry": "software",
    "salaryMult": 1.28,
    "founded": 2020
  },
  {
    "id": "co_breadfast",
    "name": "Breadfast",
    "country": "egy",
    "industry": "operations",
    "salaryMult": 1.22,
    "founded": 2017
  },
  {
    "id": "co_vezeeta",
    "name": "Vezeeta HealthTech",
    "country": "egy",
    "industry": "software",
    "salaryMult": 1.24,
    "founded": 2012
  },
  {
    "id": "co_siemens_egy",
    "name": "Siemens Mobility Egypt",
    "country": "egy",
    "industry": "engineering",
    "salaryMult": 1.38,
    "founded": 1960
  },
  {
    "id": "co_suez_canal",
    "name": "Suez Canal Authority",
    "country": "egy",
    "industry": "engineering",
    "salaryMult": 1.26,
    "founded": 1956
  },
  {
    "id": "co_nvidia",
    "name": "NVIDIA",
    "country": "usa",
    "industry": "software",
    "salaryMult": 1.75,
    "founded": 1993
  },
  {
    "id": "co_openai",
    "name": "Frontier AI Lab SF",
    "country": "usa",
    "industry": "software",
    "salaryMult": 1.8,
    "founded": 2016
  },
  {
    "id": "co_asml",
    "name": "ASML Veldhoven",
    "country": "nld",
    "industry": "engineering",
    "salaryMult": 1.48,
    "founded": 1984
  },
  {
    "id": "co_revolut_uk",
    "name": "Revolut Canary Wharf",
    "country": "gbr",
    "industry": "finance",
    "salaryMult": 1.42,
    "founded": 2015
  }
];
export const EXTRA_BUSINESSES = [
  {
    "id": "saas_ai_agency",
    "label": "B2B Cloud & AI Automation Studio",
    "capitalUsd2026": 15000,
    "monthlyRevUsd2026": 12500,
    "monthlyCostUsd2026": 6200,
    "reqMajor": "cs",
    "from": 2018,
    "volatility": 0.45,
    "maxLevel": 8
  },
  {
    "id": "diagnostic_lab",
    "label": "Medical Pathology & Radiology Lab",
    "capitalUsd2026": 62000,
    "monthlyRevUsd2026": 19500,
    "monthlyCostUsd2026": 11200,
    "reqMajor": "medicine",
    "from": 1970,
    "volatility": 0.20,
    "maxLevel": 6
  },
  {
    "id": "community_pharmacy",
    "label": "24-Hour Community Pharmacy",
    "capitalUsd2026": 34000,
    "monthlyRevUsd2026": 11800,
    "monthlyCostUsd2026": 8500,
    "reqMajor": "pharmacy",
    "from": 1960,
    "volatility": 0.15,
    "maxLevel": 5
  },
  {
    "id": "solar_epc",
    "label": "Solar Rooftop & Inverter EPC Firm",
    "capitalUsd2026": 42000,
    "monthlyRevUsd2026": 15400,
    "monthlyCostUsd2026": 9800,
    "reqMajor": "engineering",
    "from": 2005,
    "volatility": 0.35,
    "maxLevel": 6
  },
  {
    "id": "prop_brokerage",
    "label": "Compound & Expat Real-Estate Brokerage",
    "capitalUsd2026": 19000,
    "monthlyRevUsd2026": 11200,
    "monthlyCostUsd2026": 6400,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.40,
    "maxLevel": 6
  },
  {
    "id": "exam_academy",
    "label": "IELTS, Qudurat & Tutoring Center",
    "capitalUsd2026": 16000,
    "monthlyRevUsd2026": 8600,
    "monthlyCostUsd2026": 4900,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.20,
    "maxLevel": 5
  },
  {
    "id": "law_chambers",
    "label": "Corporate & Immigration Law Chambers",
    "capitalUsd2026": 24000,
    "monthlyRevUsd2026": 12800,
    "monthlyCostUsd2026": 6900,
    "reqMajor": "law",
    "from": 1960,
    "volatility": 0.20,
    "maxLevel": 6
  },
  {
    "id": "car_rental_fleet",
    "label": "Airport & Executive Car Rental Fleet",
    "capitalUsd2026": 75000,
    "monthlyRevUsd2026": 18500,
    "monthlyCostUsd2026": 11500,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.30,
    "maxLevel": 6
  },
  {
    "id": "roastery_chain",
    "label": "Specialty Coffee Roastery & 3 Kiosks",
    "capitalUsd2026": 48000,
    "monthlyRevUsd2026": 14200,
    "monthlyCostUsd2026": 9100,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.30,
    "maxLevel": 6
  },
  {
    "id": "agro_export",
    "label": "Citrus & Olive Export Trading House",
    "capitalUsd2026": 58000,
    "monthlyRevUsd2026": 17200,
    "monthlyCostUsd2026": 11400,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.45,
    "maxLevel": 5
  },
  {
    "id": "dental_center",
    "label": "Cosmetic & Implant Dental Center",
    "capitalUsd2026": 54000,
    "monthlyRevUsd2026": 17800,
    "monthlyCostUsd2026": 9900,
    "reqMajor": "medicine",
    "from": 1960,
    "volatility": 0.20,
    "maxLevel": 6
  },
  {
    "id": "ev_service_hub",
    "label": "EV & Hybrid Diagnostics Garage",
    "capitalUsd2026": 36000,
    "monthlyRevUsd2026": 11500,
    "monthlyCostUsd2026": 6800,
    "reqMajor": null,
    "from": 2012,
    "volatility": 0.35,
    "maxLevel": 5
  },
  {
    "id": "wedding_planner",
    "label": "Wedding Hall & Event Design Agency",
    "capitalUsd2026": 29000,
    "monthlyRevUsd2026": 10900,
    "monthlyCostUsd2026": 6500,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.35,
    "maxLevel": 5
  },
  {
    "id": "audit_tax_firm",
    "label": "Chartered Tax, Zakat & Audit Practice",
    "capitalUsd2026": 21000,
    "monthlyRevUsd2026": 11400,
    "monthlyCostUsd2026": 6100,
    "reqMajor": "business",
    "from": 1960,
    "volatility": 0.20,
    "maxLevel": 6
  },
  {
    "id": "interior_arch",
    "label": "Turnkey Super-Lux Finishing Studio",
    "capitalUsd2026": 31000,
    "monthlyRevUsd2026": 13600,
    "monthlyCostUsd2026": 8300,
    "reqMajor": "engineering",
    "from": 1960,
    "volatility": 0.35,
    "maxLevel": 5
  },
  {
    "id": "nursery_preschool",
    "label": "Bilingual Montessori Nursery",
    "capitalUsd2026": 39000,
    "monthlyRevUsd2026": 12200,
    "monthlyCostUsd2026": 7400,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.20,
    "maxLevel": 5
  },
  {
    "id": "cold_logistics",
    "label": "Refrigerated Pharma & Food Transport",
    "capitalUsd2026": 68000,
    "monthlyRevUsd2026": 18200,
    "monthlyCostUsd2026": 12400,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.30,
    "maxLevel": 6
  },
  {
    "id": "fashion_atelier",
    "label": "Modest & Couture Fashion Label",
    "capitalUsd2026": 25000,
    "monthlyRevUsd2026": 9800,
    "monthlyCostUsd2026": 5900,
    "reqMajor": null,
    "from": 1960,
    "volatility": 0.40,
    "maxLevel": 5
  }
];
