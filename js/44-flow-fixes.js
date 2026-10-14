/* =====================================================================
   44. FLOW FIXES
   - Random family wealth on new game
   - Random "parents have a plan" event (not always Law)
   - Strip old university block for Egypt
   - Egypt universities now graduate properly with a real major
   - Graduation popup + optional graduation party with cost
   - Medical bill event: parents can pay if you're a minor
   - Family request scale by famWealth (rich family won't beg for 550 EGP)
   - Clearer "family disagreement" event
   Load AFTER 43-clarity-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. RANDOM FAMILY WEALTH ON NEW GAME ============ */
const P44_newGameBefore = newGame;
newGame = function () {
  P44_newGameBefore.apply(this, arguments);
  if (!S) return;
  /* Egypt: 55% poor, 32% comfortable, 13% wealthy */
  if (S.country === 'egy') {
    const r = Math.random();
    S.famWealth = r < 0.55 ? 0 : r < 0.87 ? 1 : 2;
  } else if (S.country === 'ind' || S.country === 'pak' || S.country === 'nga') {
    const r = Math.random();
    S.famWealth = r < 0.6 ? 0 : r < 0.9 ? 1 : 2;
  } else {
    const r = Math.random();
    S.famWealth = r < 0.35 ? 0 : r < 0.75 ? 1 : 2;
  }
  log('Family background: ' + ['Modest', 'Comfortable', 'Wealthy'][S.famWealth] + '.');
};

/* ============ 2. RANDOM "PARENTS HAVE A PLAN" EVENT ============ */
/* Replace the always-Law event with a random major choice */
const P44_majorList = [
  { id: 'law',      label: 'Law',              smarts: 60 },
  { id: 'business', label: 'Business',         smarts: 50 },
  { id: 'medicine', label: 'Medicine',         smarts: 75 },
  { id: 'cs',       label: 'Computer Science', smarts: 60 },
  { id: 'biology',  label: 'Biology',          smarts: 55 }
];

/* Remove the base event, and inject a smarter one */
(function replaceParentPlanEvent() {
  if (typeof EVENTS === 'undefined') return;
  for (let i = EVENTS.length - 1; i >= 0; i--) {
    if (EVENTS[i].id === 'parent_plan') EVENTS.splice(i, 1);
  }
  EVENTS.push({
    id: 'parent_plan',
    min: 18, max: 19,
    ok: function () { return parents().length > 0 && S.diploma && !S.uni && !S.degree; },
    title: 'Your parents have a plan',
    text: function () {
      const choices = P44_majorList.filter(function (m) { return S.smarts >= m.smarts - 10; });
      if (!choices.length) return 'Your parents want you to study a subject at a national university and offer to pay the tuition. They are not sure you qualify.';
      const pick = choices[Math.floor(Math.random() * choices.length)];
      /* Stash it so the choices can use it */
      S.p44ParentPlanMajor = pick.id;
      S.p44ParentPlanLabel = pick.label;
      return 'Your parents want you to study ' + pick.label + ' at a national university. They will pay the tuition if you accept. You can also decline and work with your high school diploma.';
    },
    choices: [
      {
        label: 'Accept their offer (tuition paid)',
        fx: function () {
          const majorId = S.p44ParentPlanMajor || 'law';
          const major = MAJORS[majorId];
          const smartsReq = major ? major.min : 50;
          if (S.smarts < smartsReq) {
            return { happiness: -2, msg: 'You accepted, but your grades were below the entry requirement. Your parents were disappointed.' };
          }
          S.uni = { type: 'national', major: majorId, year: 0, pay: 'parents', scholar: false };
          return { happiness: 5, social: 3, msg: 'You enrolled in ' + (major ? major.name : majorId) + ' at a national university. Your parents pay the tuition.' };
        }
      },
      {
        label: 'No thanks, I will keep my diploma and work',
        fx: function () {
          parents().forEach(function (m) { m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) - 2)); });
          return { happiness: 2, msg: 'You declined and kept your high school diploma. Careers are open in the Career tab.' };
        }
      }
    ]
  });
})();

/* ============ 3. STRIP OLD UNIVERSITY BLOCK FOR EGYPT ============ */
const P44_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P44_viewSchoolBefore();
  if (S && S.country === 'egy' && S.age >= 18 && !S.uni && !S.degree && S.diploma) {
    /* Remove the old "University Options" card and "Who pays tuition?" */
    html = html.replace(/<section class="card"><h3>University Options<\/h3>[\s\S]*?<\/section>/, '');
    html = html.replace(/<section class="card"><h3>Who pays tuition\?<\/h3>[\s\S]*?<\/section>/, '');
    html = html.replace(/<section class="card" style="border:1px solid var\(--cyan\)">\s*<h3>Skip University<\/h3>[\s\S]*?<\/section>/, '');
  }
  return html;
};

/* ============ 4. EGYPT UNI GRADUATION — map faculty to a real major ============ */
const P44_FACULTY_TO_MAJOR = {
  'Medicine': 'medicine',
  'Dentistry': 'medicine',
  'Nursing': 'medicine',
  'Physical Therapy': 'medicine',
  'Engineering': 'cs',
  'Computers & IT': 'cs',
  'Pharmacy': 'biology',
  'Pharmacy & Biotech': 'biology',
  'Science': 'biology',
  'Fisheries': 'biology',
  'Business': 'business',
  'Management': 'business',
  'Economics': 'business',
  'Logistics': 'business',
  'Media': 'business',
  'Applied Sciences & Arts': 'business',
  'Law': 'law',
  'Arts': 'business',
  'Humanities': 'business',
  'Education': 'business',
  'Agriculture': 'biology'
};

/* Override uniYear to handle Egypt-style universities */
const P44_uniYearBefore = uniYear;
uniYear = function (notes, bill) {
  if (S.uni && S.uni.universityId) return p44EgyptUniYear(notes, bill);
  return P44_uniYearBefore.apply(this, arguments);
};

function p44EgyptUniYear(notes, bill) {
  const u = S.uni;
  const yearIdx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  const tuition = Math.round((u.annualCostEGP || 10000) * yearIdx);
  const internal = tuition / (typeof rateNow === 'function' ? rateNow() : 52.7);

  /* Funding */
  if (u.pay === 'parents') {
    if (!parents().length || bestBond() < 20) {
      u.pay = 'self';
      log('Your parents can no longer pay tuition. You must cover it yourself.');
    } else {
      notes.push('parents paid ' + tuition.toLocaleString() + ' EGP tuition');
    }
  }
  if (u.pay === 'self') {
    if (S.wealth < internal) {
      const shortfall = internal - S.wealth;
      S.loan = (S.loan || 0) + shortfall;
      S.wealth = 0;
      notes.push('student loan added ' + money(shortfall));
      log('You took a student loan to cover the shortfall of ' + money(shortfall) + '.');
    } else {
      S.wealth -= internal;
      bill.tuition = (bill.tuition || 0) + internal;
    }
  }

  /* Effort effect on grades */
  const ef = EFFORT[S.effort] || EFFORT.coast;
  const mult = u.type === 'private' ? 1.15 : 1.0;
  const smartsGain = ef.smarts > 0 ? Math.round(ef.smarts * mult) : ef.smarts;
  fx({ smarts: smartsGain, happiness: ef.happiness, social: ef.social + (u.type === 'private' ? 1 : 0) });

  u.year++;
  notes.push('university year ' + u.year + '/' + u.yearsTotal);

  if (u.year >= u.yearsTotal) {
    const majorId = P44_FACULTY_TO_MAJOR[u.faculty] || 'business';
    S.degree = majorId;
    S.masterField = S.masterField || '';
    const gradPopup = {
      majorLabel: u.faculty,
      university: u.universityName || 'University',
      majorId: majorId
    };
    S.uni = null;
    S.p44GraduationPopup = gradPopup;
    fx({ happiness: 10, social: 4 });
    log('You graduated from ' + gradPopup.university + ' — Faculty of ' + gradPopup.majorLabel + '.');
    /* Defer popup to render */
    setTimeout(function () {
      if (typeof p24Popup === 'function') {
        p24Popup('🎓 Graduation!', 'You completed your degree at ' + gradPopup.university + '.\nFaculty of ' + gradPopup.majorLabel + '.\n\nYour career options are now open in the Career tab.');
      }
    }, 300);
  }
}

/* ============ 5. GRADUATION PARTY ============ */
function p44HoldGraduationParty() {
  if (!S || S.age < 18) return hint('Graduation ceremonies are for graduates.');
  if (!S.p44GraduationPopup) return hint('No graduation to celebrate.');
  const egp = Math.round((30000 + Math.random() * 20000) * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1));
  const internal = egp / (typeof rateNow === 'function' ? rateNow() : 52.7);
  if (S.wealth < internal) return hint('You need ' + egp.toLocaleString() + ' EGP for the graduation party.');
  if (!confirm('Hold a graduation party for about ' + egp.toLocaleString() + ' EGP?')) return;
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.graduationParty = (S.bill.graduationParty || 0) + internal;
  const p = S.p44GraduationPopup;
  S.p44GraduationPopup = null;
  fx({ happiness: 10, social: 8 });
  parents().forEach(function (m) { m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) + 5)); });
  log('You held a graduation party for ' + egp.toLocaleString() + ' EGP. Family and friends celebrated with you.');
  if (typeof p24Popup === 'function') p24Popup('Graduation party', 'You celebrated your graduation from ' + p.university + '. Family and friends shared the moment.');
  render();
}
window.p44HoldGraduationParty = p44HoldGraduationParty;

/* Show graduation party button on Education tab until dismissed */
const P44_viewSchoolForParty = viewSchool;
viewSchool = function () {
  let html = P44_viewSchoolForParty();
  if (S && S.p44GraduationPopup) {
    const p = S.p44GraduationPopup;
    const egp = 40000;
    html = '<section class="card" style="border-color:var(--violet)"><h3>🎓 Graduation</h3>' +
      '<p class="muted">You graduated from ' + p.university + ' — Faculty of ' + p.majorLabel + '. Would you like to hold a graduation party?</p>' +
      '<button class="btn" onclick="p44HoldGraduationParty()">Hold graduation party · ~' + egp.toLocaleString() + ' EGP</button>' +
      '<button class="btn" onclick="S.p44GraduationPopup=null;render();">Skip the ceremony</button>' +
      '</section>' + html;
  }
  return html;
};

/* ============ 6. MEDICAL BILL — parents can pay if minor/at home ============ */
const P44_medicalEvent = EVENTS.find(function (e) { return e.id === 'medical'; });
if (P44_medicalEvent) {
  const originalChoices = P44_medicalEvent.choices;
  P44_medicalEvent.choices = [
    originalChoices[0],   /* Pay for treatment */
    originalChoices[1],   /* Skip treatment */
    {
      label: 'Ask parents to pay',
      cost: function () { return 0; },
      fx: function () {
        if (!parents().length || S.age >= 25 || S.housing !== 'parents') {
          return { msg: 'Your parents were not available or you are no longer living with them. You had to handle it yourself.' };
        }
        const bill = (typeof p12MedicalBill === 'function') ? p12MedicalBill() : 5000;
        const internal = bill / (typeof rateNow === 'function' ? rateNow() : 52.7);
        if (S.famWealth >= 1 && Math.random() < 0.7) {
          return { health: 6, msg: 'Your parents covered the bill of ' + Math.round(bill).toLocaleString() + ' EGP. You recovered.' };
        }
        if (S.famWealth === 0 && Math.random() < 0.5) {
          S.wealth -= internal * 0.5;
          return { health: 4, wealth: -internal * 0.5, msg: 'Your parents paid part of the bill; you covered the rest.' };
        }
        return { health: -5, msg: 'Your parents could not afford the bill. You delayed treatment.' };
      }
    }
  ];
}

/* ============ 7. FAMILY REQUESTS SCALE BY FAMILY WEALTH ============ */
/* Rich families don't beg for 550 EGP. Skip requests when family is wealthy AND
   you're a student they are funding. Otherwise scale request size and frequency. */

const P44_generateFamilyNeedBefore = p12GenerateFamilyNeed;
p12GenerateFamilyNeed = function () {
  if (!S) return;
  /* Skip entirely if wealthy family is funding your education */
  if (S.famWealth >= 2 && S.uni && S.uni.pay === 'parents') return;
  if (S.famWealth >= 2 && Math.random() < 0.75) return; /* 75% skip for wealthy families */
  if (S.famWealth === 1 && Math.random() < 0.4) return;
  return P44_generateFamilyNeedBefore.apply(this, arguments);
};

const P44_generateFamilyNeedP14Before = p12GenerateFamilyNeed;
/* Also patch the p14 override */
const P44_p14RequestBefore = (typeof p14GenerateFamilyNeed === 'function') ? p14GenerateFamilyNeed : null;

/* Modify the P20 family call event too */
const P44_callEvent = EVENTS.find(function (e) { return e.id === 'p20-family-call'; });
if (P44_callEvent) {
  P44_callEvent.ok = function () {
    if (!S || !S.family) return false;
    if (S.famWealth >= 2 && S.uni && S.uni.pay === 'parents') return false;
    if (S.famWealth >= 2 && Math.random() < 0.7) return false;
    return S.family.some(function (m) { return m.alive !== false && ['Mother', 'Father', 'Sibling'].indexOf(m.role) !== -1; }) && S.p20CallsAge !== S.age;
  };
}

/* ============ 8. CLEARER FAMILY DISAGREEMENT EVENT ============ */
/* Replace the vague p14-family-drama with clearer choices */
(function replaceFamilyDrama() {
  if (typeof p12PreAgeEvent === 'undefined') return;
  /* The function generates events on the fly, so we override p12PreAgeEvent to inject our own clearer version */
  const P44_preAgeBefore = p12PreAgeEvent;
  p12PreAgeEvent = function () {
    const list = P44_preAgeBefore.apply(this, arguments);
    /* Remove the vague one and add a clearer version */
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] && String(list[i].id || '').indexOf('p14-family-drama') === 0) list.splice(i, 1);
    }
    if (S.age >= 18 && parents().length && Math.random() < 0.25) {
      const m = parents()[Math.floor(Math.random() * parents().length)];
      const askType = Math.random();
      let title, text, choices;

      if (askType < 0.5) {
        /* They want money */
        const amount = Math.round(2000 + Math.random() * 5000 * ((typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1)));
        title = m.name + ' is asking for financial help';
        text = m.name + ' says the household is under pressure and asks if you can send ' + amount.toLocaleString() + ' EGP to help with bills.';
        choices = [
          { label: 'Send the money', fx: function () {
            const internal = amount / (typeof rateNow === 'function' ? rateNow() : 52.7);
            if (S.wealth < internal) return { msg: 'You could not afford it after all.' };
            S.wealth -= internal;
            m.bond = Math.min(100, (Number(m.bond) || 50) + 8);
            return { wealth: -internal, happiness: 1, msg: 'You sent ' + amount.toLocaleString() + ' EGP. Your parent was relieved.' };
          }},
          { label: 'Send a smaller amount', fx: function () {
            const internal = (amount * 0.4) / (typeof rateNow === 'function' ? rateNow() : 52.7);
            if (S.wealth < internal) return { msg: 'Even the smaller amount was too much.' };
            S.wealth -= internal;
            m.bond = Math.min(100, (Number(m.bond) || 50) + 3);
            return { wealth: -internal, msg: 'You sent what you could afford. Your parent understood.' };
          }},
          { label: 'Explain that you cannot help right now', fx: function () {
            m.bond = Math.max(0, (Number(m.bond) || 50) - 4);
            return { happiness: -2, msg: 'Your parent was disappointed but said they understood.' };
          }}
        ];
      } else if (askType < 0.75) {
        /* They want you to visit */
        title = m.name + ' wants you to visit';
        text = m.name + ' says it has been a long time and asks when you will come home. They miss you.';
        choices = [
          { label: 'Promise to visit soon', fx: function () {
            m.bond = Math.min(100, (Number(m.bond) || 50) + 6);
            return { happiness: 3, msg: 'You promised to visit. Your parent was pleased.' };
          }},
          { label: 'Say you are too busy right now', fx: function () {
            m.bond = Math.max(0, (Number(m.bond) || 50) - 5);
            return { happiness: -2, msg: 'Your parent sounded hurt. You have been very busy.' };
          }}
        ];
      } else {
        /* They want you to make a life choice */
        title = m.name + ' is worried about your future';
        text = m.name + ' says the family talks about your career and future a lot. They want to know what your plan is.';
        choices = [
          { label: 'Share your plan and reassure them', fx: function () {
            m.bond = Math.min(100, (Number(m.bond) || 50) + 5);
            return { happiness: 2, smarts: 1, msg: 'You laid out your plan. Your parent felt reassured.' };
          }},
          { label: 'Set a firm boundary — your life, your choices', fx: function () {
            m.bond = Math.max(0, (Number(m.bond) || 50) - 3);
            return { happiness: 2, msg: 'You made it clear you are making your own decisions. It was tense but respectful.' };
          }},
          { label: 'Argue and leave the conversation', fx: function () {
            m.bond = Math.max(0, (Number(m.bond) || 50) - 9);
            return { happiness: -3, social: -1, msg: 'The argument escalated. Everyone went away frustrated.' };
          }}
        ];
      }
      list.push({ id: 'p44-family-' + S.age, title: title, text: text, choices: choices });
    }
    return list;
  };
})();

/* ============ 9. ENGINEERING & MEDICINE JOBS IN EGYPT MARKET ============ */
/* The market already covers cs, medicine, biology, business, law. Engineering
   graduates map to cs (tech) and medicine to medical, so jobs exist. This
   ensures more specialty employers appear. */

const P44_extraEgyptEmployers = [
  'Orascom Construction Engineering',
  'Elsewedy Electric',
  'Hassan Allam Holding',
  'Rowad Modern Engineering',
  'Asec Company for Mining',
  'Petrojet Engineering Services',
  'Enppi Engineering',
  'Egyptian Drilling Company',
  'Misr Italia Properties',
  'Travco Group Hotels',
  'Bavarian Auto Group',
  'AstraZeneca Egypt'
];

const P44_companyListBefore = companyListFor;
companyListFor = function (country) {
  country = country || S.country;
  let list = P44_companyListBefore(country);
  if (country !== 'egy') return list;

  /* Add a few engineering-flavored employers if the player studied engineering-
     mapped majors or is looking at tech/finance */
  if (!S) return list;
  const hasEngineeringPath = S.degree === 'cs' || (S.uni && /Engineering|Computers/i.test(String(S.uni.faculty || '')));
  if (!hasEngineeringPath) return list;

  /* Rename a few random companies to engineering-flavored names */
  const copy = list.slice();
  for (let i = 0; i < 5 && i < copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    if (copy[idx] && !copy[idx].p44Renamed) {
      copy[idx] = Object.assign({}, copy[idx]);
      copy[idx].name = P44_extraEgyptEmployers[Math.floor(Math.random() * P44_extraEgyptEmployers.length)];
      copy[idx].p44Renamed = true;
    }
  }
  return copy;
};

/* ============ 10. RUN ON LOAD ============ */
if (S && S.bill && S.bill.propertyRent) {
  S._p43RentalIncomeNote = (S._p43RentalIncomeNote || 0) + S.bill.propertyRent;
  delete S.bill.propertyRent;
}
