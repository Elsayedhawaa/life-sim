import { getCountry } from '../data/countries.js';
import { eraSalary } from '../data/economy.js';

// One game rule for the admission screen and monthly tuition settlement.
export function familyCoversUniversity(S, annualTuition, country = S.country) {
  if (country !== S.homeCountry || country !== S.country) return false;
  if (annualTuition <= 500) return true;
  if (['wealthy', 'upper_middle'].includes(S.familyTier)) return true;
  if (S.familyTier !== 'middle') return false;
  const midMonthly = eraSalary(getCountry(S.country).annualSalaryTiers2026.mid / 12, S.country, S.year);
  return annualTuition <= midMonthly * 6;
}

export function monthlyUniversityTuition(S) {
  const u = S.education.university;
  if (!u || u.country !== S.country) return 0;
  if (u.fundingSource === 'family') return 0;
  // Older saves did not distinguish family funding from scholarships.
  if (!u.fundingSource && familyCoversUniversity(S, u.annualTuition, u.country)) return 0;
  return Math.round(u.annualTuition * (1 - (u.scholarshipPct || 0)) / 12);
}
