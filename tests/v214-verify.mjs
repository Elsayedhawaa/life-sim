/* v2.14 verify — Businesses, Properly (INTEGRATION).
   Run from the game root: node tests/v214-verify.mjs
   This is the coordinator's merge proof, not a worker test: every check
   goes through the REAL monthly settlement (settleHouseholdMonth) or the
   REAL Ventures render (renderWorkTabHtml) — no direct calls to the new
   modules' internals except where the spec's contract says so. The
   worker verifies (w1–w5, 351 checks) prove each module on its own;
   this file proves the modules work TOGETHER and the money lands.
   - §0: the hard cap is gone from src/ (grep 0).
   - §1: a 5-business portfolio launches and settles (2 manager-run
     full-time + 3 owner-run part-time); manager wages are in the
     settled P&L and in the ledger's costs line; owner hours 54/70.
   - §2: a per-industry decision's promised effect lands in the NEXT
     month's settled P&L, exactly as promised (twin lives, same seed).
   - §3: reinvest lifts next month's settled revenue by the stated
     boost (twin lives), and the boost is consumed after one use.
   - §4: franchise royalties land in the settled P&L as a revenue line.
   - §5: harvest policy pays cash out of the business's capital through
     the settlement, and the capital falls by the same amount.
   - §6: unmanaged decay through the settlement over 3 months, counted
     and flagged in plain words, with the at-risk banner in the render.
   - §7: buying (with due diligence) + a branch, both settling with
     their own P&L lines.
   - §8: the Ventures render shows the manager, the decisions, the
     exits, the cash and the for-sale list — and no trace of a cap.
   The three shipped tests are NOT run by this harness — run them
   separately. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import { launchSmallBusiness } from '../src/systems/careerEducationEngine.js';
import { managementCapacityInfo, businessIsManaged, OWNER_WEEKLY_HOURS_MAX } from '../src/systems/businessCapacity.js';
import { hireManager, setManagerPolicy } from '../src/systems/businessManager.js';
import { applyDecision } from '../src/systems/businessDecisions.js';
import { listBusinessesForSale, buyBusinessDueDiligence, buyBusiness } from '../src/systems/businessAcquisitions.js';
import { openBranch } from '../src/systems/businessBranches.js';
import { franchiseBusiness, franchiseIncome, reinvestBusinessCash } from '../src/systems/businessExits.js';
import { renderWorkTabHtml } from '../src/ui/views.js';
import fs from 'node:fs';

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
function adultLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.reputation = 80;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function nextMonth(S) { S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; } }
const ledgerLines = (S, re) => (S.ledger || []).filter(l => l.label && re.test(l.label));
const avgMorale = (biz) => { const st = biz.staff || []; if (!st.length) return null; return st.reduce((s, e) => s + (Number(e.morale) || 0), 0) / st.length; };

/* ================= §0 the cap is gone ================= */
console.log('--- §0 cap gone ---');
{
  const files = [];
  for (const dir of ['src/systems', 'src/ui', 'src/core', 'src/data']) {
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) files.push(`${dir}/${f}`);
  }
  files.push('src/main.js');
  const hits = files.filter(f => fs.readFileSync(f, 'utf8').includes('BUSINESS_CAP'));
  check('BUSINESS_CAP: grep 0 across src/', hits.length === 0, hits.join(', '));
  check('capacity ceiling is 70h/week of the owner\'s time', OWNER_WEEKLY_HOURS_MAX === 70, `got ${OWNER_WEEKLY_HOURS_MAX}`);
}

/* ================= §1 five-business portfolio ================= */
console.log('--- §1 five-business portfolio (settlement) ---');
{
  const S = adultLife(); S.money.cash = 20_000_000;
  const r1 = launchSmallBusiness(S, 'cafe', 'Portfolio Café', { mode: 'part_time' });
  const r2 = launchSmallBusiness(S, 'retail_shop', 'Portfolio Shop', { mode: 'part_time' });
  const r3 = launchSmallBusiness(S, 'bakery', 'Portfolio Bakery', { mode: 'part_time' });
  const mgrA = { name: 'Salon Manager', skill: 70, wage: 20000, loyalty: 70, personId: null, policy: 'safe' };
  const mgrB = { name: 'Restaurant Manager', skill: 60, wage: 18000, loyalty: 70, personId: null, policy: 'safe' };
  const r4 = launchSmallBusiness(S, 'salon', 'Portfolio Salon', { mode: 'full_time', manager: mgrA, runBy: 'manager' });
  const r5 = launchSmallBusiness(S, 'restaurant', 'Portfolio Restaurant', { mode: 'full_time', manager: mgrB, runBy: 'manager' });
  check('all five launches ok', r1.ok && r2.ok && r3.ok && r4.ok && r5.ok, [r1, r2, r3, r4, r5].map(r => r.msg).join(' | '));
  check('five businesses held', S.career.businesses.length === 5, `got ${S.career.businesses.length}`);
  const cap = managementCapacityInfo(S);
  check('owner hours 54/week (3 × 18h part-time)', cap.ownerHoursUsed === 54, `got ${cap.ownerHoursUsed}`);
  check('owner hours free 16/week of the 70h week', cap.ownerHoursFree === 16, `got ${cap.ownerHoursFree}`);
  check('all five are managed (none unmanaged), two of them by a manager', cap.managedCount === 5 && cap.unmanagedCount === 0 && S.career.businesses.filter(b => b.manager).length === 2, `managed ${cap.managedCount}, unmanaged ${cap.unmanagedCount}, with-manager ${S.career.businesses.filter(b => b.manager).length}`);
  check('manager-run businesses cost 0 owner hours', S.career.businesses.filter(b => b.manager).every(b => !businessIsManaged(S, b) === false) && cap.ownerHoursUsed === 54);
  settleHouseholdMonth(S);
  const pls = S.career.businesses.map(b => b.lastPL);
  check('every business settled a P&L this month', pls.every(p => p && typeof p.revenue === 'number'), pls.map(p => p && p.revenue).join(', '));
  const salon = S.career.businesses.find(b => b.name === 'Portfolio Salon');
  const rest = S.career.businesses.find(b => b.name === 'Portfolio Restaurant');
  check('settled P&L charges the salon manager wage (20,000)', salon.lastPL.manager === 20000, `got ${salon.lastPL.manager}`);
  check('settled P&L charges the restaurant manager wage (18,000)', rest.lastPL.manager === 18000, `got ${rest.lastPL.manager}`);
  const salonCosts = ledgerLines(S, /^Business costs — Portfolio Salon/);
  check('ledger costs line names the manager wage', salonCosts.length === 1 && /manager/.test(salonCosts[0].label) && /20,000/.test(salonCosts[0].label), salonCosts.map(l => l.label).join(' | '));
  check('ledger costs line moves exactly the P&L costs', salonCosts.length === 1 && salonCosts[0].delta === -salon.lastPL.costs, `delta ${salonCosts[0] && salonCosts[0].delta} vs costs ${salon.lastPL.costs}`);
  const revLine = ledgerLines(S, /^Business revenue — Portfolio Salon/);
  const taxLine = (S.ledger || []).filter(l => l.label && l.label.includes('Portfolio Salon') && l.delta === -salon.lastPL.tax);
  check('P&L net identity holds through the ledger (revenue − costs − tax = net)', revLine.length === 1 && revLine[0].delta === salon.lastPL.revenue && taxLine.length >= 1 && salon.lastPL.net === salon.lastPL.revenue - salon.lastPL.costs - salon.lastPL.tax, `rev ${revLine[0] && revLine[0].delta} costs ${salon.lastPL.costs} tax ${salon.lastPL.tax} net ${salon.lastPL.net}`);
  const totalNet = pls.reduce((s, p) => s + p.net, 0);
  console.log('five-business portfolio, month 1 nets:', pls.map(p => p.net).join(', '), '| total net:', totalNet, '| manager wages/month: 38,000');
  check('portfolio total net is a real number (not NaN)', Number.isFinite(totalNet));
}

/* ================= §2 decision lands as promised ================= */
console.log('--- §2 decision effect in the settled P&L ---');
{
  const A = adultLife(); launchSmallBusiness(A, 'restaurant', 'Twin Restaurant', { mode: 'part_time' });
  const B = adultLife(); launchSmallBusiness(B, 'restaurant', 'Twin Restaurant', { mode: 'part_time' });
  check('twin lives identical before the decision (rng state)', A.rngState === B.rngState, `${A.rngState} vs ${B.rngState}`);
  const ap = applyDecision(B, B.career.businesses[0], 'food_refresh_menu');
  check('refresh menu applies', ap.ok, ap.msg);
  const promised = ap.promisedNumbers && ap.promisedNumbers.revenueDelta;
  console.log('promised revenue delta:', promised, '| promised text:', ap.promised);
  check('applying the decision consumes no random roll (rng state unchanged)', A.rngState === B.rngState, `${A.rngState} vs ${B.rngState}`);
  nextMonth(A); nextMonth(B);
  settleHouseholdMonth(A); settleHouseholdMonth(B);
  const dRev = B.career.businesses[0].lastPL.revenue - A.career.businesses[0].lastPL.revenue;
  console.log('settled revenues: no-decision', A.career.businesses[0].lastPL.revenue, 'with-decision', B.career.businesses[0].lastPL.revenue, 'diff', dRev);
  check('settled revenue differs by exactly the promised amount', dRev === promised, `diff ${dRev} vs promised ${promised}`);
  const bRevLine = ledgerLines(B, /^Business revenue — Twin Restaurant/);
  check('ledger posts the FOLDED revenue (with the decision in it)', bRevLine.length === 1 && bRevLine[0].delta === B.career.businesses[0].lastPL.revenue, `ledger ${bRevLine[0] && bRevLine[0].delta} vs pl ${B.career.businesses[0].lastPL.revenue}`);
}

/* ================= §3 reinvest lifts growth ================= */
console.log('--- §3 reinvest lifts next month\'s growth ---');
{
  const A = adultLife(); launchSmallBusiness(A, 'cafe', 'Reinvest Café', { mode: 'part_time' });
  const B = adultLife(); launchSmallBusiness(B, 'cafe', 'Reinvest Café', { mode: 'part_time' });
  const bizB = B.career.businesses[0];
  const amt = Math.round(Number(bizB.monthlyRev) || 0);
  const ri = reinvestBusinessCash(B, bizB, amt);
  check('reinvest ok (one month of revenue in)', ri.ok, ri.msg);
  console.log('reinvested', amt, '-> boost', ri.boost);
  check('reinvesting one month of revenue gives the max boost (×1.25)', ri.boost === 1.25, `got ${ri.boost}`);
  check('rng stream untouched by reinvesting', A.rngState === B.rngState);
  nextMonth(A); nextMonth(B);
  settleHouseholdMonth(A); settleHouseholdMonth(B);
  const revA = A.career.businesses[0].lastPL.revenue;
  const revB = B.career.businesses[0].lastPL.revenue;
  console.log('settled revenues: no-reinvest', revA, 'reinvested', revB, 'ratio', (revB / revA).toFixed(4));
  check('settled revenue is exactly ×1.25 after reinvesting', revB === Math.round(revA * 1.25), `${revB} vs ${Math.round(revA * 1.25)}`);
  check('boost is consumed after one month', B.career.businesses[0].reinvestBoost === 1, `got ${B.career.businesses[0].reinvestBoost}`);
}

/* ================= §4 franchise income ================= */
console.log('--- §4 franchise income in the settled P&L ---');
{
  const S = adultLife(); launchSmallBusiness(S, 'cafe', 'Franchise Café', { mode: 'part_time' });
  const biz = S.career.businesses[0];
  /* v2.17: the franchise gate is real state now — level 3, 12 months
     trading, 6 profitable months in a row, 60% repeat customers. */
  biz.level = 3; biz.repeatRate = 0.7;
  biz.foundedYear = 2024; biz.foundedMonth = 1;
  biz.history = [{ net: 10000 }, { net: 10000 }, { net: 10000 }, { net: 10000 }, { net: 10000 }, { net: 10000 }];
  const fr = franchiseBusiness(S, biz);
  check('franchise ok (level 3, 24 months, 6 profitable months, 70% repeat customers)', fr.ok, fr.msg);
  const royalty = franchiseIncome(S, biz);
  console.log('franchisee:', fr.franchisee && fr.franchisee.name, '| monthly royalty:', royalty);
  settleHouseholdMonth(S);
  check('settled P&L carries the royalty as a revenue line', biz.lastPL.franchise === royalty && royalty > 0, `pl.franchise ${biz.lastPL.franchise} vs royalty ${royalty}`);
  const revLine = ledgerLines(S, /^Business revenue — Franchise Café/);
  check('ledger revenue line includes the royalty (folded number lands)', revLine.length === 1 && revLine[0].delta === biz.lastPL.revenue, `ledger ${revLine[0] && revLine[0].delta} vs pl ${biz.lastPL.revenue}`);
}

/* ================= §5 harvest cash-out ================= */
console.log('--- §5 harvest policy through the settlement ---');
{
  const S = adultLife(); launchSmallBusiness(S, 'cafe', 'Harvest Café', { mode: 'part_time' });
  const biz = S.career.businesses[0];
  const h = hireManager(S, biz, { name: 'Harvest Manager', skill: 65, wage: 20000, loyalty: 80, personId: null });
  check('harvest manager hired', h.ok, h.msg);
  const pol = setManagerPolicy(S, biz, 'harvest');
  check('policy set to harvest', pol.ok, pol.msg);
  const capBefore = biz.capitalInvested;
  const expected = Math.round((Number(biz.monthlyRev) || 0) * 0.10);
  settleHouseholdMonth(S);
  console.log('harvestOut:', biz.lastPL.harvestOut, '| expected (10% of monthly revenue):', expected, '| capital', capBefore, '->', biz.capitalInvested);
  check('settled P&L records the harvest cash-out (10% of monthly revenue)', biz.lastPL.harvestOut === expected, `got ${biz.lastPL.harvestOut}`);
  const hLine = ledgerLines(S, /^Harvest cash out — Harvest Café/);
  check('ledger posts the harvest cash as income', hLine.length === 1 && hLine[0].delta === expected, hLine.map(l => `${l.label} ${l.delta}`).join(' | '));
  check('the business\'s capital falls by the same amount (milking costs value)', biz.capitalInvested === capBefore - expected, `${capBefore} -> ${biz.capitalInvested}`);
}

/* ================= §6 unmanaged decay ================= */
console.log('--- §6 unmanaged decay (settlement, 3 months) ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Managed Café', { mode: 'full_time' });
  launchSmallBusiness(S, 'retail_shop', 'Unmanaged Shop', { mode: 'full_time' });
  const biz = S.career.businesses.find(b => b.name === 'Unmanaged Shop');
  check('second full-time business is unmanaged (no hours left)', !businessIsManaged(S, biz));
  const revs = [], morales = [], months = [];
  for (let m = 1; m <= 3; m++) {
    S.month = m;
    settleHouseholdMonth(S);
    revs.push(biz.lastPL.revenue);
    morales.push(Math.round(avgMorale(biz)));
    months.push(biz.unmanagedMonths);
    console.log(`month ${m}: revenue ${biz.lastPL.revenue}, avg morale ${Math.round(avgMorale(biz))}, unmanagedMonths ${biz.unmanagedMonths}, atRisk ${biz.atRisk}`);
  }
  check('unmanagedMonths counts 1, 2, 3', months[0] === 1 && months[1] === 2 && months[2] === 3, months.join(', '));
  check('settled revenue falls every unmanaged month', revs[0] > revs[1] && revs[1] > revs[2], revs.join(' -> '));
  check('staff morale falls every unmanaged month', morales[0] > morales[1] && morales[1] > morales[2], morales.join(' -> '));
  check('atRisk is true at month 3', biz.atRisk === true, `atRisk=${biz.atRisk}`);
  const flagLine = (S.journal || []).find(j => j.text && /unmanaged for 3 months/.test(j.text) && j.text.includes('Unmanaged Shop'));
  check('plain-words at-risk journal line exists at month 3', !!flagLine, '');
  check('at-risk line names the way out', !!flagLine && /Hire a manager/.test(flagLine.text), flagLine ? flagLine.text : '');
  const vtext = strip(renderWorkTabHtml(S, { workSub: 'ventures', bizQuery: '' }));
  check('Ventures header flags the at-risk business by name', /At risk/.test(vtext) && vtext.includes('Unmanaged Shop'), '');
}

/* ================= §7 buy + branch ================= */
console.log('--- §7 buying a business + opening a branch ---');
{
  const S = adultLife(); S.money.cash = 20_000_000;
  const listings = listBusinessesForSale(S);
  check('businesses for sale are listed', listings.length >= 1, `got ${listings.length}`);
  const listing = [...listings].sort((a, b) => a.ask - b.ask)[0];
  console.log('cheapest listing:', listing.name, '| ask:', listing.ask, '| valuation:', listing.valuation);
  const dd = buyBusinessDueDiligence(S, listing.id);
  check('due diligence starts (fee + 1 month)', dd.ok, dd.msg);
  console.log('diligence fee:', dd.cost, '| ready:', dd.readyYear, '/', dd.readyMonth);
  nextMonth(S); settleHouseholdMonth(S);
  const bought = buyBusiness(S, listing.id, { mode: 'part_time' });
  check('bought after diligence', bought.ok, bought.msg);
  const biz = bought.biz;
  console.log('bought:', biz.name, '| price:', bought.price, '| staff:', (biz.staff || []).length, '| repeat customers:', `${Math.round((biz.repeatRate ?? 0.5) * 100)}%`);
  check('bought business comes with named staff', (biz.staff || []).length >= 1 && (biz.staff || []).every(e => e.name), '');
  const br = openBranch(S, biz, 'Alexandria');
  check('branch opens in Alexandria', br.ok, br.msg);
  console.log('branch setup cost:', br.setupCost, '| new city:', br.isNewCity);
  nextMonth(S); settleHouseholdMonth(S);
  const branch = S.career.businesses.find(b => b.isBranch && b.city === 'Alexandria');
  check('branch is a real business record with its own P&L', !!branch && !!branch.lastPL && branch.lastPL.revenue > 0, branch ? `rev ${branch.lastPL && branch.lastPL.revenue}` : 'no branch');
  check('bought business settles its own P&L too', !!biz.lastPL && biz.lastPL.revenue > 0, biz.lastPL ? `rev ${biz.lastPL.revenue}` : 'no P&L');
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  /* addIncome appends ' (M/YYYY)' to the label, so the name must be
     matched with that suffix — the branch's label starts with the
     parent's name, and an unanchored match would count it twice. */
  const bRev = ledgerLines(S, new RegExp(`^Business revenue — ${escRe(biz.name)} \\(\\d+/\\d+\\)$`));
  const brRev = branch ? ledgerLines(S, new RegExp(`^Business revenue — ${escRe(branch.name)} \\(\\d+/\\d+\\)$`)) : [];
  check('ledger carries separate revenue lines for the business and its branch', bRev.length === 1 && brRev.length === 1, `business lines ${bRev.length}, branch lines ${brRev.length}`);
}

/* ================= §8 the render ================= */
console.log('--- §8 Ventures render ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Render Café', { mode: 'part_time' });
  const biz = S.career.businesses[0];
  const h = hireManager(S, biz, { name: 'Render Manager', skill: 70, wage: 20000, loyalty: 75, personId: null });
  check('render-life manager hired', h.ok, h.msg);
  settleHouseholdMonth(S);
  const vhtml = renderWorkTabHtml(S, { workSub: 'ventures', bizQuery: '' });
  const vtext = strip(vhtml);
  check('header shows hours used/free, not a cap', /h\/week/.test(vtext) && !/of 3 businesses/.test(vtext), '');
  check('manager section shows the manager by name', vtext.includes('Render Manager'), '');
  check('manager policy buttons shown', /Policy/.test(vtext) && /Growth/.test(vtext) && /Harvest/.test(vtext), '');
  check('P&L table shows the manager wage row', /Manager — Render Manager/.test(vtext), '');
  check('decisions section lists a per-industry decision', vtext.includes('Refresh the menu'), '');
  check('exits section present', /Exits/.test(vtext), '');
  check('cash section present (retained cash)', /Retained cash/.test(vtext), '');
  check('for-sale list present', /for sale/i.test(vtext), '');
  check('no trace of a cap anywhere in the render', !/of 3 businesses/.test(vtext) && !/BUSINESS_CAP/.test(vhtml), '');
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
if (failures.length) { console.log('FAILURES:', failures.join(' | ')); process.exitCode = 1; }
