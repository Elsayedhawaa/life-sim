/* Sibling-owned companies. A working adult sibling whose real job title points to a field the game has a business for may found one from their own savings,
   once. It reuses the genuine owned-business model: the company is built by the same createBusiness the player uses (on a copy of the world that holds only the
   sibling's cash), a paid manager runs it because the sibling keeps their job, and the existing monthly NPC company settlement pays its profit into the sibling's savings.
   Conservation: their savings fall by exactly what the launch cost (capital plus the manager's first month); the company then carries that value in its own books.
   Numbers I chose (not instructed): from 28, at most 15% of savings goes into start-up capital, only when savings are at least 6x what the launch costs, one company per
   sibling, and a yearly deterministic chance of 1 in 6 once eligible. A title that names no clear field founds nothing. */
import { cloneWorld } from '../core/cloneWorld.js';
import { recordJournal, nextId } from '../core/schema.js';
import { formatMoney } from '../data/countries.js';
import { convertCurrency } from '../data/economy.js';
import { createBusiness, findVentureRow, evaluateBusinessLaunch } from './businessEngine.js';
import { managerShortlist } from './businessManager.js';

export const SIBLING_FIELDS = [
  [/accountant|auditor|bookkeep/i, 'accounting_firm'], [/lawyer|solicitor|attorney|advocate|legal counsel/i, 'law_firm'], [/pharmacist/i, 'community_pharmacy'],
  [/dentist/i, 'dental_clinic'], [/physician|doctor|surgeon|medical officer/i, 'clinic'], [/architect/i, 'architecture_studio'], [/teacher|lecturer|tutor/i, 'tutoring_center'],
  [/software|developer|programmer|data engineer/i, 'software_studio'], [/civil engineer|site engineer|construction/i, 'contracting'], [/veterinar/i, 'vet_clinic'],
  [/physiotherap/i, 'physio_clinic'], [/consultant|project manager/i, 'consulting']
];
export const siblingFieldFor = title => { const t = String(title || ''); const hit = SIBLING_FIELDS.find(([re]) => re.test(t)); return hit ? hit[1] : null; };
const h01 = (S, id, salt) => { let h = 2166136261; for (const ch of `${S.seed ?? 0}|${id}|${salt}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 100000) / 100000; };
const CAP = 0.15, SAFETY = 6, MIN_AGE = 28, YEARLY_ODDS = 1 / 6;

export function syncSiblingCompanies(S) {
  if (!S.familyFortune || S.month !== 3) return 0; /* a yearly look, in March */
  let n = 0;
  for (const id of S.relations?.siblingIds || []) {
    const p = S.people?.[id]; if (!p?.alive || (p.age ?? 0) < MIN_AGE || !p.career) continue;
    const c = p.career; if ((p.ownedBusinesses || []).length || c.siblingCompanyYear || c.title === 'Retired' || !(Number(c.monthlyIncomeLocal) > 0)) continue;
    const typeId = siblingFieldFor(c.title); if (!typeId) continue;
    if (h01(S, id, S.year) >= YEARLY_ODDS) continue;
    const r = foundSiblingCompany(S, id, typeId); if (r.ok) n++;
  }
  return n;
}

export function foundSiblingCompany(S, id, typeId) {
  const p = S.people[id], c = p.career, here = p.residenceCountry || S.country, savings = Number(c.savingsLocal) || 0;
  let shadow; try { shadow = cloneWorld(S); } catch (e) { return { ok: false, msg: 'World copy failed.' }; }
  shadow.country = here; shadow.player.age = p.age; shadow.money.savings = 0; shadow.career.businesses = []; shadow.career.business = null; shadow.career.employed = true; shadow.career.job = { weeklyHours: 40, hoursPerWeek: 40, employer: c.employer || 'their employer' };
  shadow.player.familyName = p.lastName || p.familyName || shadow.player.familyName; shadow.education.degrees = [...(p.education?.degrees || [])];
  const bp = findVentureRow(shadow, typeId); if (!bp) return { ok: false, msg: 'No such business.' };
  if (bp.reqMajor && !shadow.education.degrees.includes(bp.reqMajor)) shadow.education.degrees.push(bp.reqMajor); /* the job title that picked this field already implies the licence the venture asks for */
  shadow.money.cash = 1e15; const ev = evaluateBusinessLaunch(shadow, bp); const cap = ev.capitalLocal || 0;
  if (!(cap > 0) || cap > savings * CAP || savings < (cap + (ev.managerWageEstimateLocal || 0)) * SAFETY) return { ok: false, msg: 'Savings do not support it.' };
  const start = Math.round(cap * 3) + (ev.managerWageEstimateLocal || 0) * 2; shadow.money.cash = start;
  const made = createBusiness(shadow, typeId, `${p.lastName || shadow.player.familyName} ${bp.label.split(' ')[0]}`, { runBy: 'manager', manager: managerShortlist(shadow, { country: shadow.country, monthlyRev: ev.revLocal, capitalInvested: ev.capitalLocal, staff: [], mode: 'part_time', manager: null })[0] });
  if (!made.ok) return made;
  const biz = shadow.career.businesses[shadow.career.businesses.length - 1]; if (!biz) return { ok: false, msg: 'No company created.' };
  const spent = start - shadow.money.cash; if (!(spent > 0) || spent > savings * CAP + (ev.managerWageEstimateLocal || 0) * 2 + 1) return { ok: false, msg: 'Cost out of range.' };
  biz.id = nextId(S, 'biz'); /* the copy's counter is not the world's: take a fresh id so nothing can collide later */
  c.savingsLocal = Math.round((savings - spent) * 100) / 100; c.siblingCompanyYear = S.year;
  p.ownedBusinesses = [...(p.ownedBusinesses || []), biz];
  recordJournal(S, `${p.firstName || 'Your sibling'} opened ${biz.name}, a ${bp.label.toLowerCase()}, with ${formatMoney(spent, here)} of their own savings. It is run by a paid manager, and they keep their job.`, 'family');
  return { ok: true, biz, spent };
}
export function siblingCompanyLine(S, id) {
  const p = S.people?.[id]; const b = (p?.ownedBusinesses || []).find(x => !x.dead); if (!b) return '';
  return `Owns ${b.name}, run by a paid manager.`;
}
