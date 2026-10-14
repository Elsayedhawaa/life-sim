/* =====================================================================
   29. EGYPT UNIVERSITY SYSTEM — named universities with real 2026 prices
   Replaces the generic national/private university UI for Egypt only.
   Load AFTER 27-egypt-realism.js and BEFORE 99-boot.js
   ===================================================================== */

const EGYPT_UNIVERSITIES = {
  alex: {
    id: 'alex',
    name: 'Alexandria University',
    type: 'public',
    location: 'Alexandria',
    tuitionEGP: [8000, 15000],
    prestige: 1.0,
    desc: 'Historic state university in Alexandria. Strong in medicine, engineering, and humanities. Very low tuition, competitive admission.',
    facilities: ['Historic campus', 'Teaching hospital', 'Research labs', 'Sports complex'],
    smartsReq: 75
  },
  cairo: {
    id: 'cairo',
    name: 'Cairo University',
    type: 'public',
    location: 'Giza',
    tuitionEGP: [8000, 15000],
    prestige: 1.05,
    desc: "Egypt's flagship public university. Highly competitive, especially for medicine and engineering.",
    facilities: ['Main campus', 'Teaching hospital', 'Central library', 'Student dorms'],
    smartsReq: 78
  },
  ain: {
    id: 'ain',
    name: 'Ain Shams University',
    type: 'public',
    location: 'Cairo (Abbassia)',
    tuitionEGP: [8000, 14000],
    prestige: 1.0,
    desc: 'One of Egypt\'s oldest public universities. Broad range of faculties across Greater Cairo.',
    facilities: ['Multiple faculties', 'Teaching hospital', 'Libraries', 'Sports facilities'],
    smartsReq: 72
  },
  guc: {
    id: 'guc',
    name: 'German University in Cairo (GUC)',
    type: 'private',
    location: 'New Cairo',
    tuitionEGP: [280000, 440000],
    prestige: 1.25,
    desc: 'German-accredited degrees. Strong engineering, management, and pharmacy programs. Taught in English.',
    facilities: ['Modern campus', 'German partnership', 'Career services', 'Labs & workshops'],
    smartsReq: 60
  },
  bue: {
    id: 'bue',
    name: 'British University in Egypt (BUE)',
    type: 'private',
    location: 'El Sherouk City',
    tuitionEGP: [150000, 350000],
    prestige: 1.25,
    desc: 'UK-validated degrees. Known for dentistry, engineering, and business. English-language instruction.',
    facilities: ['UK partnership', 'Dental clinics', 'Engineering labs', 'Student activities'],
    smartsReq: 58
  },
  aastmt: {
    id: 'aastmt',
    name: 'Arab Academy for Science & Technology (AASTMT)',
    type: 'private',
    location: 'Alexandria / Cairo',
    tuitionUSD: [10000, 14000],
    prestige: 1.2,
    desc: 'Regional academy with strong maritime, engineering, and IT programs. Fees charged in USD.',
    facilities: ['Maritime training', 'Engineering labs', 'Regional network', 'Career placement'],
    smartsReq: 58
  },
  buc: {
    id: 'buc',
    name: 'Badr University in Cairo (BUC)',
    type: 'private',
    location: 'Badr City',
    tuitionEGP: [100000, 300000],
    prestige: 1.1,
    desc: 'Modern private university with medicine, dentistry, and engineering programs.',
    facilities: ['New campus', 'Medical labs', 'Sports facilities', 'Student housing'],
    smartsReq: 55
  },
  auc: {
    id: 'auc',
    name: 'American University in Cairo (AUC)',
    type: 'private',
    location: 'New Cairo',
    tuitionUSD: [21000, 24000],
    prestige: 1.5,
    desc: "US-accredited liberal arts education. Egypt's most prestigious private university. Taught in English.",
    facilities: ['US accreditation', 'Top faculty', 'Research centers', 'Global exchange'],
    smartsReq: 72
  }
};

const UNIVERSITY_FACULTIES = {
  alex:  ['Medicine', 'Engineering', 'Business', 'Law', 'Arts', 'Science', 'Agriculture'],
  cairo: ['Medicine', 'Engineering', 'Business', 'Law', 'Arts', 'Science', 'Economics'],
  ain:   ['Medicine', 'Engineering', 'Business', 'Law', 'Arts', 'Science', 'Education'],
  guc:   ['Engineering', 'Management', 'Pharmacy & Biotech', 'Law', 'Applied Sciences & Arts'],
  bue:   ['Dentistry', 'Engineering', 'Pharmacy', 'Computers & IT', 'Business', 'Nursing'],
  aastmt:['Engineering', 'Pharmacy', 'Computers & IT', 'Medicine', 'Logistics', 'Fisheries'],
  buc:   ['Medicine', 'Dentistry', 'Physical Therapy', 'Engineering', 'Business', 'Arts'],
  auc:   ['Engineering', 'Business', 'Humanities', 'Sciences', 'Media', 'Law']
};

function getEgyptUniversityCost(uni, faculty) {
  const y = gameYear();
  const index = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(y) : 1;
  const facTier = {
    'Medicine': 1.0, 'Dentistry': 0.95, 'Physical Therapy': 0.85,
    'Engineering': 0.85, 'Pharmacy': 0.78, 'Pharmacy & Biotech': 0.78,
    'Computers & IT': 0.72, 'Business': 0.65, 'Management': 0.65,
    'Economics': 0.62, 'Law': 0.55, 'Science': 0.58,
    'Arts': 0.45, 'Humanities': 0.50, 'Nursing': 0.40,
    'Agriculture': 0.45, 'Education': 0.42, 'Media': 0.55,
    'Applied Sciences & Arts': 0.60, 'Logistics': 0.62, 'Fisheries': 0.55
  };
  const tier = facTier[faculty] || 0.6;

  if (uni.tuitionEGP) {
    const baseMin = uni.tuitionEGP[0] * index;
    const baseMax = uni.tuitionEGP[1] * index;
    return Math.round(baseMin + (baseMax - baseMin) * tier);
  }
  if (uni.tuitionUSD) {
    const baseUSD = uni.tuitionUSD[0] + (uni.tuitionUSD[1] - uni.tuitionUSD[0]) * tier;
    const rate = rateForCountry('egy', y);
    return Math.round(baseUSD * rate * index);
  }
  return Math.round(10000 * index);
}

function viewEgyptUniversitySelection() {
  if (!S || S.country !== 'egy') return '';
  if (S.age < 18) return '';
  if (S.uni || S.degree) return '';

  let html = `<section class="card">
    <h3>🏛️ Choose Your University</h3>
    <p class="muted">Egypt has public universities with very low tuition (competitive admission based on high-school grades) and private universities with English-language programs. Prices are 2026-2027 estimates.</p>
    <h4 style="color:var(--cyan);margin:16px 0 4px">Public Universities</h4>`;

  ['cairo', 'alex', 'ain'].forEach(id => {
    const u = EGYPT_UNIVERSITIES[id];
    const range = `${u.tuitionEGP[0].toLocaleString()}–${u.tuitionEGP[1].toLocaleString()} EGP/year`;
    html += `
      <div class="uni-card">
        <div class="uni-header">
          <span class="uni-name">${u.name}</span>
          <span class="uni-price">${range}</span>
        </div>
        <p class="uni-desc">${u.desc}</p>
        <div class="uni-tags">
          <span class="uni-tag">${u.location}</span>
          <span class="uni-tag">Smarts ${u.smartsReq}%+</span>
          ${u.facilities.map(f => `<span class="uni-tag">${f}</span>`).join('')}
        </div>
        <label class="muted" style="font-size:.78rem">Faculty</label>
        <select id="fac-${id}">
          ${UNIVERSITY_FACULTIES[id].map(f => `<option value="${f}">${f}</option>`).join('')}
        </select>
        <div class="acts">
          <button class="btn" onclick="enrollEgyptUniversity('${id}', document.getElementById('fac-${id}').value, 'self')">Self-funded</button>
          <button class="btn" onclick="enrollEgyptUniversity('${id}', document.getElementById('fac-${id}').value, 'parents')">Ask parents</button>
        </div>
      </div>`;
  });

  html += `<h4 style="color:var(--violet);margin:20px 0 4px">Private Universities</h4>`;

  ['auc', 'guc', 'bue', 'aastmt', 'buc'].forEach(id => {
    const u = EGYPT_UNIVERSITIES[id];
    let range;
    if (u.tuitionUSD) {
      range = `$${u.tuitionUSD[0].toLocaleString()}–${u.tuitionUSD[1].toLocaleString()}/yr`;
    } else {
      range = `${u.tuitionEGP[0].toLocaleString()}–${u.tuitionEGP[1].toLocaleString()} EGP/yr`;
    }
    html += `
      <div class="uni-card">
        <div class="uni-header">
          <span class="uni-name">${u.name}</span>
          <span class="uni-price">${range}</span>
        </div>
        <p class="uni-desc">${u.desc}</p>
        <div class="uni-tags">
          <span class="uni-tag">${u.location}</span>
          <span class="uni-tag">Smarts ${u.smartsReq}%+</span>
          ${u.facilities.map(f => `<span class="uni-tag">${f}</span>`).join('')}
        </div>
        <label class="muted" style="font-size:.78rem">Faculty</label>
        <select id="fac-${id}">
          ${UNIVERSITY_FACULTIES[id].map(f => `<option value="${f}">${f}</option>`).join('')}
        </select>
        <div class="acts">
          <button class="btn" onclick="enrollEgyptUniversity('${id}', document.getElementById('fac-${id}').value, 'self')">Self-funded</button>
          <button class="btn" onclick="enrollEgyptUniversity('${id}', document.getElementById('fac-${id}').value, 'parents')">Ask parents</button>
        </div>
      </div>`;
  });

  html += `</section>`;
  return html;
}

function enrollEgyptUniversity(uniId, faculty, funder) {
  const uni = EGYPT_UNIVERSITIES[uniId];
  if (!uni) return hint('University not found.');
  if (S.age < 18) return hint('University enrollment starts at 18.');
  if (S.uni || S.degree) return hint('You are already enrolled or graduated.');

  if (S.smarts < uni.smartsReq) {
    return hint(`${uni.name} requires at least ${uni.smartsReq}% smarts. Yours: ${Math.round(S.smarts)}%.`);
  }

  const annualCostEGP = getEgyptUniversityCost(uni, faculty);
  const annualCostInternal = localCurrencyInternal(annualCostEGP, 'egy', gameYear());

  const yearsTotal = (faculty === 'Medicine' || faculty === 'Dentistry') ? 6 :
                     (faculty === 'Engineering' || faculty === 'Pharmacy' || faculty === 'Pharmacy & Biotech') ? 5 : 4;

  S.uni = {
    type: uni.type,
    universityId: uniId,
    universityName: uni.name,
    faculty: faculty,
    year: 0,
    yearsTotal: yearsTotal,
    annualCostEGP: annualCostEGP,
    annualCostInternal: annualCostInternal,
    pay: funder,
    scholar: false
  };

  if (funder === 'parents') {
    const fw = Math.max(0, Math.min(2, S.famWealth || 0));
    let chance;
    if (uni.type === 'public') chance = 0.9;
    else if (fw === 2) chance = 0.85;
    else if (fw === 1) chance = 0.40;
    else chance = 0.08;
    chance *= (0.4 + bestBond() / 200);
    if (!parents().length || Math.random() > chance) {
      S.uni.pay = 'self';
      log(`Your parents could not commit to paying ${uni.name} tuition. You will fund it yourself.`);
      realismNotice('Family cannot fund tuition', `Your parents cannot cover ${uni.name} (${annualCostEGP.toLocaleString()} EGP/year). You will need to pay it yourself or take a loan.`);
    } else {
      log(`Your parents agreed to pay ${uni.name} tuition (${annualCostEGP.toLocaleString()} EGP/year).`);
    }
  }

  log(`Enrolled at ${uni.name} — Faculty of ${faculty}. Annual tuition: ${annualCostEGP.toLocaleString()} EGP. Degree length: ${yearsTotal} years.`);
  realismNotice('University enrollment confirmed', `You are enrolled at ${uni.name} in the Faculty of ${faculty}. Tuition is ${annualCostEGP.toLocaleString()} EGP/year. Complete ${yearsTotal} years to graduate.`);
  hint();
  render();
}

/* Override the university section of viewSchool for Egypt */
const P29_viewSchoolBefore = viewSchool;
viewSchool = function() {
  if (!S || S.country !== 'egy') return P29_viewSchoolBefore();
  if (S.age < 18) return P29_viewSchoolBefore();
  if (S.uni || S.degree) return P29_viewSchoolBefore();
  if (!S.diploma) return P29_viewSchoolBefore();

  /* Replace the university options block with our Egypt-specific one */
  let base = P29_viewSchoolBefore();
  /* Strip the old generic university section if present, then append ours */
  return base + viewEgyptUniversitySelection();
};
