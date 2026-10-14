/* ================= PHASE 27 — EGYPT REALISM EXPANSION ================= */

const EGYPT_UNIS = {
  national: { id: 'national', name: 'Alexandria / Cairo University', tuition: 1500, prestige: 1.0 },
  buc: { id: 'buc', name: 'Badr University in Cairo (BUC)', tuition: 85000, prestige: 1.1 },
  guc: { id: 'guc', name: 'German University in Cairo (GUC)', tuition: 140000, prestige: 1.3 },
  bue: { id: 'bue', name: 'British University in Egypt (BUE)', tuition: 160000, prestige: 1.35 },
  aastmt: { id: 'aastmt', name: 'Arab Academy for Science & Technology', tuition: 120000, prestige: 1.25 }
};

/* Egypt university UI is handled in 29-egypt-universities.js.
   Do NOT wrap viewSchool here — it previously returned undefined for Egypt
   and blanked the Education tab. */

const BPO_COMPANIES = ['Sutherland', 'Teleperformance', 'Concentrix', 'Vodafone VOIS'];

const P27_jobEligibleBeforeBPO = jobEligible;

function calculateBPOSalary(basePay, engStat, uniId) {
  let multiplier = 1.0;
  if (engStat > 85) multiplier += 0.3;       // Fluent English bonus
  else if (engStat > 65) multiplier += 0.1;
  if (uniId === 'guc' || uniId === 'bue') multiplier += 0.15; // Premium degree bonus
  return Math.round(basePay * multiplier);
}

/* ---------------------------------------------------------------------
   Egypt-specific side jobs.
   Values are 2026 EGYPTIAN POUNDS per year. We convert them into the
   same internal-USD scale the base PART_JOBS use, so they render at
   realistic EGP amounts instead of being multiplied twice.
   We use a getter so the pay recalculates for whatever year the game
   is currently in, without double-conversion.
--------------------------------------------------------------------- */
const EGY_PART_RATE_2026 = 52.7;

const NEW_SIDE_JOBS_EGP = [
  { id: 'security',    title: 'Night Security Guard',     egp2026: 72000,  minAge: 18, smarts: 0, stress: 3, desc: 'Quiet night shifts, but messes with your sleep.' },
  { id: 'uber_own',    title: 'Uber Driver (Own Car)',    egp2026: 132000, minAge: 21, smarts: 0, stress: 5, reqAsset: 'car', desc: 'Drive your own car. Fuel, maintenance and wear are on you.' },
  { id: 'uber_family', title: 'Uber Driver (Family Car)', egp2026: 78000,  minAge: 21, smarts: 0, stress: 4, reqAsset: null, desc: 'Share the car and split earnings with your family.' }
];

function p27EgpSideJobPayInternal(egp2026) {
  const y = (typeof gameYear === 'function') ? gameYear() : 2026;
  /* Use the Egypt-specific price index so real wages fall behind inflation,
     matching the P14 wage-index behaviour. */
  const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(y) : 1;
  const egpThisYear = egp2026 * idx;
  return egpThisYear / EGY_PART_RATE_2026;   // internal USD units
}

NEW_SIDE_JOBS_EGP.forEach(j => {
  const job = {
    id: j.id,
    title: j.title,
    minAge: j.minAge,
    smarts: j.smarts,
    stress: j.stress,
    desc: j.desc,
    reqAsset: j.reqAsset,
    isEgyptOnly: true,
    _egp2026: j.egp2026
  };
  /* Define `pay` as a getter so it recalculates for the current year. */
  Object.defineProperty(job, 'pay', {
    get() { return Math.round(p27EgpSideJobPayInternal(job._egp2026)); },
    enumerable: true,
    configurable: true
  });
  PART_JOBS.push(job);
});

/* ---------------------------------------------------------------------
   Eviction / credit check on age-up.
--------------------------------------------------------------------- */
const P27_ageUpBeforeEviction = ageUp;
ageUp = function() {
  P27_ageUpBeforeEviction();

  if (!S || S.age < 18) return;

  // Credit Card & Eviction Check
  if (S.wealth < 0) {
    let debt = Math.abs(S.wealth);
    let creditLimit = (S.income || 0) * 1.5; // Limit is 1.5x annual income

    if (debt > creditLimit && S.housing !== 'parents') {
      log(`Eviction! You missed your rent payments and maxed out your credit. The landlord ended your lease and kept your deposit.`);
      S.housing = 'parents';
      fx({ happiness: -15, stress: 10 });
      S.wealth = 0; // Wipe remaining debt via bankruptcy / deposit loss
      S.creditCards = { locked: true };
    } else {
      log(`You survived on credit cards this year. High interest will apply.`);
      S.wealth -= Math.round(debt * 0.24); // 24% annual interest rate
    }
  }
};
