/* ================= PHASE 27 — EGYPT REALISM EXPANSION ================= */

const EGYPT_UNIS = {
  national: { id: 'national', name: 'Alexandria / Cairo University', tuition: 1500, prestige: 1.0 },
  buc: { id: 'buc', name: 'Badr University in Cairo (BUC)', tuition: 85000, prestige: 1.1 },
  guc: { id: 'guc', name: 'German University in Cairo (GUC)', tuition: 140000, prestige: 1.3 },
  bue: { id: 'bue', name: 'British University in Egypt (BUE)', tuition: 160000, prestige: 1.35 },
  aastmt: { id: 'aastmt', name: 'Arab Academy for Science & Technology', tuition: 120000, prestige: 1.25 }
};

// Patch the viewSchool function to display these specific options if the country is Egypt
const P27_viewSchoolBeforeEgypt = viewSchool;
viewSchool = function() {
  if (S.country !== 'egy') return P27_viewSchoolBeforeEgypt();
  // Override logic to map EGYPT_UNIS into the UI with their specific tuition costs
  // ...
};
const BPO_COMPANIES = ['Sutherland', 'Teleperformance', 'Concentrix', 'Vodafone VOIS'];

const P27_jobEligibleBeforeBPO = jobEligible;
function calculateBPOSalary(basePay, engStat, uniId) {
  let multiplier = 1.0;
  if (engStat > 85) multiplier += 0.3; // Fluent English bonus
  else if (engStat > 65) multiplier += 0.1;
  
  if (uniId === 'guc' || uniId === 'bue') multiplier += 0.15; // Premium degree bonus
  
  return Math.round(basePay * multiplier);
};
const NEW_SIDE_JOBS = [
  { id: 'security', title: 'Night Security Guard', pay: 24000, minAge: 18, smarts: 0, stress: 3, desc: 'Quiet night shifts, but messes with your sleep.' },
  { id: 'uber_own', title: 'Uber Driver (Own Car)', pay: 45000, minAge: 21, smarts: 0, stress: 5, reqAsset: 'car', desc: 'Drive your own car. High wear and tear.' },
  { id: 'uber_family', title: 'Uber Driver (Family Car)', pay: 22000, minAge: 21, smarts: 0, stress: 4, reqAsset: null, desc: 'Split the earnings with your family.' }
];

PART_JOBS.push(...NEW_SIDE_JOBS);
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
      S.wealth = 0; // Wipe remaining debt via bankruptcy/deposit loss
      S.creditCards = { locked: true };
    } else {
      log(`You survived on credit cards this year. High interest will apply.`);
      S.wealth -= Math.round(debt * 0.24); // 24% annual interest rate
    }
  }
};
