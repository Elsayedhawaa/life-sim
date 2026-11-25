import { wageFactor } from '../data/economy.js';
/* Era-index a working NPC's monthly income by the game's own wage index
   (price level x real-wage drift, the same index eraSalary uses for new jobs).
   career.incomeIndexYear = the year the stored income is denominated in.
   Idempotent: running twice in one year changes nothing. Retired, jobless,
   business-paid and payroll-paid people are untouched (no income revival).
   Legacy saves: parents' income was set at the player's birth year; other
   people get no back-pay (stamped to the current year). */
export function indexNpcIncome(S, p) {
  const c = p?.career;
  if (!c || !p.alive || p.id === 'player') return false;
  const income = Number(c.monthlyIncomeLocal) || 0;
  if (income <= 0 || c.title === 'Retired' || c.retiredYear || c.npcCompanyPayroll || c.businessEmployeeId) return false;
  if (!(p.age < 63)) return false;
  const country = p.residenceCountry || S.country;
  if (c.incomeIndexYear == null) {
    const parent = p.role === 'father' || p.role === 'mother';
    c.incomeIndexYear = parent && Number.isFinite(S.player?.birthYear) ? S.player.birthYear : S.year;
  }
  if (c.incomeIndexYear >= S.year) return false;
  const a = wageFactor(country, c.incomeIndexYear), b = wageFactor(country, S.year);
  if (!(a > 0) || !(b > 0)) { c.incomeIndexYear = S.year; return false; }
  c.monthlyIncomeLocal = Math.max(1, Math.round(income * (b / a)));
  c.incomeIndexYear = S.year;
  return true;
}
