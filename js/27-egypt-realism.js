/* ==================== EGYPT UNIVERSITY SYSTEM ==================== */

const EGYPT_UNIVERSITIES = {
  national: {
    id: 'national',
    name: 'National University',
    type: 'public',
    location: 'Cairo / Alexandria',
    tuitionEGP: [8000, 15000], // range by faculty
    prestige: 1.0,
    desc: 'State-funded. Very low tuition, competitive admission based on high school grades.',
    facilities: ['Large lecture halls', 'Basic labs', 'Library access', 'Student clubs'],
    hap: 0, hp: 0, smarts: 0
  },
  alex: {
    id: 'alex',
    name: 'Alexandria University',
    type: 'public',
    location: 'Alexandria',
    tuitionEGP: [8000, 15000],
    prestige: 1.0,
    desc: 'Historic state university in Alexandria. Strong in medicine, engineering, and humanities.',
    facilities: ['Historic campus', 'Teaching hospital', 'Research labs', 'Sports complex'],
    hap: 0, hp: 0, smarts: 0
  },
  cairo: {
    id: 'cairo',
    name: 'Cairo University',
    type: 'public',
    location: 'Giza',
    tuitionEGP: [8000, 15000],
    prestige: 1.05,
    desc: 'Egypt\'s flagship public university. Highly competitive, especially for medicine and engineering.',
    facilities: ['Main campus', 'Teaching hospital', 'Central library', 'Student dorms'],
    hap: 0, hp: 0, smarts: 1
  },
  guc: {
    id: 'guc',
    name: 'German University in Cairo',
    type: 'private',
    location: 'New Cairo',
    tuitionEGP: [280000, 440000], // annual, based on ~2 semesters
    prestige: 1.25,
    desc: 'German-accredited degrees. Strong engineering, management, and pharmacy programs.',
    facilities: ['Modern campus', 'German partnership', 'Career services', 'Labs & workshops'],
    hap: 1, hp: 0, smarts: 2
  },
  bue: {
    id: 'bue',
    name: 'British University in Egypt',
    type: 'private',
    location: 'El Sherouk City',
    tuitionEGP: [150000, 350000],
    prestige: 1.25,
    desc: 'UK-validated degrees. Known for dentistry, engineering, and business.',
    facilities: ['UK partnership', 'Dental clinics', 'Engineering labs', 'Student activities'],
    hap: 1, hp: 0, smarts: 2
  },
  aastmt: {
    id: 'aastmt',
    name: 'Arab Academy for Science & Technology',
    type: 'private',
    location: 'Alexandria / Cairo',
    tuitionUSD: [10000, 14000], // per year, two semesters
    prestige: 1.2,
    desc: 'Regional academy with strong maritime, engineering, and IT programs. Fees in USD.',
    facilities: ['Maritime training', 'Engineering labs', 'Regional network', 'Career placement'],
    hap: 1, hp: 0, smarts: 2
  },
  buc: {
    id: 'buc',
    name: 'Badr University in Cairo',
    type: 'private',
    location: 'Badr City',
    tuitionEGP: [100000, 300000],
    prestige: 1.1,
    desc: 'Modern private university. Medicine, dentistry, and engineering programs.',
    facilities: ['New campus', 'Medical labs', 'Sports facilities', 'Student housing'],
    hap: 1, hp: 0, smarts: 1
  },
  auc: {
    id: 'auc',
    name: 'American University in Cairo',
    type: 'private',
    location: 'New Cairo',
    tuitionUSD: [21000, 24000], // per year, Egyptian students
    prestige: 1.5,
    desc: 'US-accredited, liberal arts education. Egypt\'s most prestigious private university.',
    facilities: ['US accreditation', 'Top faculty', 'Research centers', 'Global exchange'],
    hap: 2, hp: 0, smarts: 3
  }
};

// Faculty options per university
const UNIVERSITY_FACULTIES = {
  national: ['Medicine', 'Engineering', 'Business', 'Law', 'Arts', 'Science'],
  alex: ['Medicine', 'Engineering', 'Business', 'Law', 'Arts', 'Science', 'Agriculture'],
  cairo: ['Medicine', 'Engineering', 'Business', 'Law', 'Arts', 'Science', 'Economics'],
  guc: ['Engineering', 'Management', 'Pharmacy & Biotech', 'Law', 'Applied Sciences & Arts'],
  bue: ['Dentistry', 'Engineering', 'Pharmacy', 'Computers & IT', 'Business', 'Nursing'],
  aastmt: ['Engineering', 'Pharmacy', 'Computers & IT', 'Medicine', 'Logistics', 'Fisheries'],
  buc: ['Medicine', 'Dentistry', 'Physical Therapy', 'Engineering', 'Business', 'Arts'],
  auc: ['Engineering', 'Business', 'Humanities', 'Sciences', 'Media', 'Law']
};

function getEgyptUniversityCost(uni, faculty, isInternational) {
  const y = gameYear();
  const index = typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(y) : 1;
  
  if (uni.tuitionEGP) {
    // Base range scaled by price index
    const baseMin = uni.tuitionEGP[0] * index;
    const baseMax = uni.tuitionEGP[1] * index;
    // Medicine/dentistry at top, arts at bottom
    const facTier = { 'Medicine': 1.0, 'Dentistry': 0.95, 'Engineering': 0.85, 
                      'Pharmacy': 0.75, 'Business': 0.65, 'Law': 0.55, 
                      'Arts': 0.45, 'Nursing': 0.4 };
    const tier = facTier[faculty] || 0.6;
    return Math.round(baseMin + (baseMax - baseMin) * tier);
  }
  
  if (uni.tuitionUSD) {
    const baseUSD = uni.tuitionUSD[0] + (uni.tuitionUSD[1] - uni.tuitionUSD[0]) * 
                    ({ 'Medicine': 1.0, 'Engineering': 0.9, 'Business': 0.7, 'Law': 0.7 }[faculty] || 0.6);
    const rate = rateForCountry('egy', y);
    return Math.round(baseUSD * rate * index);
  }
  
  return 10000 * index;
}

function viewEgyptUniversitySelection() {
  if (S.country !== 'egy') return '';
  if (S.age < 18) return '';
  if (S.uni || S.degree) return '';
  
  let html = `<section class="card"><h3>Choose Your University</h3>
    <p class="muted">Egypt has national universities with very low tuition (competitive admission) and private universities with English-language programs and international partnerships. Costs are annual tuition estimates for 2026-2027.</p>`;
  
  // National Universities section
  html += `<h4 style="color:var(--cyan);margin:14px 0 8px">National Universities</h4>`;
  ['national', 'alex', 'cairo'].forEach(id => {
    const uni = EGYPT_UNIVERSITIES[id];
    const costRange = uni.tuitionEGP;
    html += `<details><summary>${uni.name} · ${costRange[0].toLocaleString()}–${costRange[1].toLocaleString()} EGP/year</summary>
      <p class="muted">${uni.desc}</p>
      <p class="muted" style="font-size:.85rem">Facilities: ${uni.facilities.join(' · ')}</p>
      <select id="fac-${id}" style="width:100%;margin:8px 0">
        ${UNIVERSITY_FACULTIES[id].map(f => `<option value="${f}">${f}</option>`).join('')}
      </select>
      <div class="acts">
        <button class="btn" onclick="enrollEgyptUniversity('${id}', document.getElementById('fac-${id}').value, 'self')">Pay tuition myself</button>
        <button class="btn" onclick="enrollEgyptUniversity('${id}', document.getElementById('fac-${id}').value, 'parents')">Ask parents to pay</button>
      </div>
    </details>`;
  });
  
  // Private Universities section
  html += `<h4 style="color:var(--violet);margin:18px 0 8px">Private Universities</h4>`;
  ['guc', 'bue', 'buc', 'aastmt', 'auc'].forEach(id => {
    const uni = EGYPT_UNIVERSITIES[id];
    let costDisplay;
    if (uni.tuitionUSD) {
      costDisplay = `$${uni.tuitionUSD[0].toLocaleString()}–${uni.tuitionUSD[1].toLocaleString()}/year (USD)`;
    } else {
      costDisplay = `${uni.tuitionEGP[0].toLocaleString()}–${uni.tuitionEGP[1].toLocaleString()} EGP/year`;
    }
    
    html += `<details><summary>${uni.name} · ${costDisplay}</summary>
      <p class="muted">${uni.desc}</p>
      <p class="muted" style="font-size:.85rem">Location: ${uni.location} · Facilities: ${uni.facilities.join(' · ')}</p>
      <select id="fac-${id}" style="width:100%;margin:8px 0">
        ${UNIVERSITY_FACULTIES[id].map(f => `<option value="${f}">${f}</option>`).join('')}
      </select>
      <div class="acts">
        <button class="btn" onclick="enrollEgyptUniversity('${id}', document.getElementById('fac-${id}').value, 'self')">Pay tuition myself</button>
        <button class="btn" onclick="enrollEgyptUniversity('${id}', document.getElementById('fac-${id}').value, 'parents')">Ask parents to pay</button>
      </div>
    </details>`;
  });
  
  html += `</section>`;
  return html;
}

function enrollEgyptUniversity(uniId, faculty, funder) {
  const uni = EGYPT_UNIVERSITIES[uniId];
  if (!uni) return hint('University not found.');
  if (S.age < 18) return hint('University enrollment starts at 18.');
  
  const annualCostEGP = getEgyptUniversityCost(uni, faculty, false);
  const annualCostInternal = localCurrencyInternal(annualCostEGP, 'egy', gameYear());
  
  // Check smarts requirement
  const smartsReq = uni.type === 'public' ? 75 : (uniId === 'auc' ? 70 : 55);
  if (S.smarts < smartsReq) {
    return hint(`Admission requires at least ${smartsReq}% smarts for ${uni.name}.`);
  }
  
  // Set up university record
  S.uni = {
    type: uni.type,
    universityId: uniId,
    name: uni.name,
    faculty: faculty,
    year: 0,
    yearsTotal: 4, // default 4-year degree
    annualCostEGP: annualCostEGP,
    annualCostInternal: annualCostInternal,
    pay: funder,
    scholar: false
  };
  
  // Handle parent funding
  if (funder === 'parents') {
    const agreeChance = uni.type === 'public' ? 0.85 : (S.famWealth === 2 ? 0.9 : S.famWealth === 1 ? 0.5 : 0.15);
    if (!parents().length || Math.random() > agreeChance * (0.4 + bestBond() / 200)) {
      S.uni.pay = 'self';
      log(`Your parents could not commit to paying ${uni.name} tuition. You will need to pay it yourself.`);
    }
  }
  
  log(`Enrolled at ${uni.name} — Faculty of ${faculty}. Annual tuition: ${annualCostEGP.toLocaleString()} EGP.`);
  realismNotice('University enrollment', `You are now enrolled at ${uni.name} in the Faculty of ${faculty}. Tuition is ${annualCostEGP.toLocaleString()} EGP/year (${annualCostInternal.toFixed(0)} internal units). Complete 4 years to graduate.`);
  hint();
  render();
}
