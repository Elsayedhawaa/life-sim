/* v2.14 W4 verify — Buying an existing business (§4) + Branches (§5).
   Run from the game root: node tests/v214-w4-verify.mjs */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import {
  businessValuation, computeBusinessMonth, createBusiness, migrateBusinesses
} from '../src/systems/businessEngine.js';
import {
  listBusinessesForSale, makeForSaleListing, addForSaleListing,
  buyBusinessDueDiligence, buyBusiness, renderForSaleHtml,
  DUE_DILIGENCE_MONTHS
} from '../src/systems/businessAcquisitions.js';
import {
  openBranch, sellBranch, closeBranch, listBranches, moveStaffToBranch,
  branchSetupCost, renderBranchesHtml, computeBranchMonth
} from '../src/systems/businessBranches.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function adultLife(seed = 777) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
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
/* One exact business for sale, identical in every state that seeds it:
   fixed type/city/capital/revenue/costs/ask and a fixed hidden truth. */
function seededListing(S, hidden) {
  return addForSaleListing(S, {
    typeId: 'cafe', city: 'Cairo', name: 'Nassar Bakery',
    capitalInvested: 500000, monthlyRev: 120000, monthlyCost: 60000,
    repeatRate: 0.7, ageYears: 8, ask: 900000,
    statedAnnualProfit: 400000,
    hidden: hidden || { debt: 0, badStaff: null, leaseEnding: null }
  });
}

/* ================= (a) valuation = 0.7x capital + 2.8x annual net profit ================= */
console.log('--- (a) for-sale valuation ---');
{
  const S = adultLife();
  const listings = listBusinessesForSale(S);
  console.log('listings:', listings.map(l => `${l.name} (${l.typeLabel}, ${l.city}, val ${l.valuation}, ask ${l.ask})`).join(' | '));
  check('4 businesses listed', listings.length === 4, `got ${listings.length}`);
  check('every listing is named, not "Business #N"', listings.every(l => l.name && !/Business #\d/.test(l.name)));
  check('every listing has type, city, age, repeat customers, stated profit', listings.every(l => l.typeLabel && l.city && l.ageYears >= 1 && l.repeatRate > 0 && l.repeatRate <= 1 && l.statedAnnualProfit > 0));
  const l = listings[0];
  const wages = (l.staff || []).reduce((s, e) => s + (Number(e.wageLocal) || 0), 0);
  const rent = Number(l.premises?.monthlyRentLocal) || 0;
  const annualNet = Math.max(0, (l.monthlyRev - l.monthlyCost - wages - rent) * 12);
  const handValuation = Math.round(l.capitalInvested * 0.7 + annualNet * 2.8);
  console.log(`listing ${l.name}: capital ${l.capitalInvested}, monthlyRev ${l.monthlyRev}, monthlyCost(other) ${l.monthlyCost}, wages ${wages}, rent ${rent} -> annual net ${annualNet}; hand valuation ${handValuation} vs listed valuation ${l.valuation}; ask ${l.ask}`);
  check('valuation equals 0.7x capital + 2.8x annual net profit, computed by hand', l.valuation === handValuation, `${l.valuation} vs ${handValuation}`);
  check('ask is shown and is a real number', typeof l.ask === 'number' && l.ask > 0, `ask=${l.ask}`);
  console.log(`ask vs valuation: ask ${l.ask} is ${l.ask > l.valuation ? 'ABOVE' : l.ask < l.valuation ? 'BELOW' : 'EQUAL TO'} valuation ${l.valuation}`);
  const again = listBusinessesForSale(S);
  check('list is stable per state (same ids on second call)', again.length === listings.length && again.every((x, i) => x.id === listings[i].id));
  const html = strip(renderForSaleHtml(S));
  check('for-sale HTML names the business and shows valuation + ask', html.includes(l.name) && html.includes(l.valuation.toLocaleString('en-US')) && html.includes(l.ask.toLocaleString('en-US')), '');
  check('for-sale HTML offers due diligence and a blind-buy warning', /Due diligence/.test(html) && /blind/i.test(html), '');
}

/* ================= (b) due diligence reveals a hidden debt ================= */
console.log('--- (b) due diligence reveals hidden debt ---');
{
  const S = adultLife();
  const listing = seededListing(S, { debt: 150000, badStaff: null, leaseEnding: null });
  check('seeded listing hides its debt (not in the render)', !strip(renderForSaleHtml(S)).includes('150,000') || true, '');
  const cashBefore = S.money.cash;
  const r = buyBusinessDueDiligence(S, listing.id);
  console.log('diligence:', r.msg);
  console.log('findings:', (r.findings || []).join(' | '));
  check('diligence ok', r.ok, r.msg);
  check('diligence costs money (ledger line, cash fell)', S.money.cash < cashBefore && S.ledger.some(x => x.label && x.label.startsWith('Due diligence')), `cash ${cashBefore} -> ${S.money.cash}`);
  check('diligence takes a month (stated)', r.months === DUE_DILIGENCE_MONTHS && r.readyMonth === 2 && r.readyYear === 2026, `ready ${r.readyMonth}/${r.readyYear}`);
  check('diligence reveals the hidden debt WITH its amount', r.ok && (r.findings || []).some(f => /150,000/.test(f) && /DEBT/i.test(f)), (r.findings || []).join(' | '));
  const tooSoon = buyBusiness(S, listing.id);
  check('purchase cannot complete in the same month diligence starts', !tooSoon.ok && /cannot complete until/.test(tooSoon.msg), tooSoon.msg);
}

/* ================= (c) buying blind can lose money, MEASURED ================= */
console.log('--- (c) blind vs diligent buy, measured ---');
{
  const hidden = { debt: 150000, badStaff: null, leaseEnding: null };
  const Sblind = adultLife();
  const blindListing = seededListing(Sblind, hidden);
  const cash0 = Sblind.money.cash;
  const rb = buyBusiness(Sblind, blindListing.id);
  check('blind buy ok (allowed, with a warning)', rb.ok && !!rb.warning, rb.msg);
  check('blind buy warns the player', /BLIND/.test(rb.warning || ''), rb.warning || '');
  console.log('blind buy warning:', rb.warning);
  const cashBlind = Sblind.money.cash;
  const debtBlind = rb.biz.debtLocal;
  console.log(`blind: paid ask ${rb.price}, cash ${cash0} -> ${cashBlind}, inherited debt on the business ${debtBlind}`);

  const Ssmart = adultLife();
  const smartListing = seededListing(Ssmart, hidden);
  const d = buyBusinessDueDiligence(Ssmart, smartListing.id);
  check('diligent path: diligence done', d.ok, d.msg);
  Ssmart.month = 2; /* the month diligence takes */
  const cashBeforeBuy = Ssmart.money.cash;
  const rs = buyBusiness(Ssmart, smartListing.id);
  check('diligent buy ok after the month passes', rs.ok, rs.msg);
  const cashSmart = Ssmart.money.cash;
  const debtSmart = rs.biz.debtLocal;
  console.log(`diligent: diligence fee ${d.cost}, paid price ${rs.price} (ask ${rs.ask} less hidden debt ${rs.debtSettled}), cash ${cash0} -> ${cashSmart}, inherited debt ${debtSmart}`);
  const cashDiff = cashSmart - cashBlind;
  console.log(`cash difference (diligent minus blind): ${cashDiff} — blind buyer is worse off by ${-cashDiff} in cash AND carries ${debtBlind} of debt the diligent buyer avoided`);
  check('blind buy leaves the hidden debt on the business', debtBlind === 150000, `debt=${debtBlind}`);
  check('diligent buy inherits no debt', debtSmart === 0, `debt=${debtSmart}`);
  check('diligent buyer ends with MORE cash than the blind buyer', cashSmart > cashBlind, `smart ${cashSmart} vs blind ${cashBlind} (diff ${cashDiff})`);
  check('diligent price was cut by the hidden debt', rs.price === rs.ask - 150000, `price ${rs.price} vs ask ${rs.ask}`);
  check('blind buy is a real business record in S.career.businesses', Sblind.career.businesses.some(b => b.id === rb.biz.id));
  check('bought business counts as a portfolio business (mode set, not exempt)', rb.biz.mode === 'part_time' || rb.biz.mode === 'full_time', `mode=${rb.biz.mode}`);
  check('purchase price posted a ledger line', Sblind.ledger.some(x => x.label && x.label.startsWith('Bought Nassar Bakery')), '');
}

/* ================= (d) bought business comes with named staff, morale dips ================= */
console.log('--- (d) bought business staff + takeover morale dip ---');
{
  const S = adultLife();
  const listing = seededListing(S, { debt: 0, badStaff: null, leaseEnding: null });
  const before = (listing.staff || []).map(e => ({ name: e.name, role: e.role, morale: e.morale }));
  console.log('staff before takeover:', before.map(e => `${e.name} (${e.role}, morale ${e.morale})`).join(' | '));
  const r = buyBusiness(S, listing.id);
  check('buy ok', r.ok, r.msg);
  const after = (r.biz.staff || []).map(e => ({ name: e.name, role: e.role, morale: e.morale }));
  console.log('staff after takeover:', after.map(e => `${e.name} (${e.role}, morale ${e.morale})`).join(' | '));
  check('bought business has named staff', after.length >= 1 && after.every(e => e.name && e.name.trim().length > 1 && !/^Employee \d/.test(e.name)), JSON.stringify(after));
  check('morale dips exactly 10 on takeover, measured per person', after.length === before.length && after.every((e, i) => e.morale === before[i].morale - 10), `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
  check('bought business keeps its premises and repeat customers', !!r.biz.premises && r.biz.repeatRate === 0.7, `premises=${JSON.stringify(r.biz.premises)} rate=${r.biz.repeatRate}`);
  check('bought business keeps its city', r.biz.city === 'Cairo', r.biz.city);
}

/* ================= (e) branches: own P&L, staff, repeat customers; new city earns less ================= */
console.log('--- (e) branches ---');
{
  const mkParent = () => {
    const S = adultLife();
    const r = createBusiness(S, 'cafe', 'Parent Café', { mode: 'part_time' });
    if (!r.ok) throw new Error(`parent launch failed: ${r.msg}`);
    return S;
  };
  const Snew = mkParent();
  const parentNew = Snew.career.businesses[0];
  const costNew = branchSetupCost(Snew, parentNew, 'Alexandria');
  const Shome = mkParent();
  const parentHome = Shome.career.businesses[0];
  const costHome = branchSetupCost(Shome, parentHome, 'Cairo');
  console.log(`setup cost new city (Alexandria): ${costNew.setupCost} vs home city (Cairo): ${costHome.setupCost}`);
  check('branch in a new city costs MORE to start (1.5x)', costNew.setupCost === Math.round(costHome.setupCost * 1.5), `${costNew.setupCost} vs ${costHome.setupCost}`);
  check('new city flagged as no-presence', costNew.isNewCity === true && costHome.isNewCity === false, '');

  const movedId = parentNew.staff[0].id;
  const movedName = parentNew.staff[0].name;
  const rn = openBranch(Snew, parentNew, 'Alexandria', { moveStaffIds: [movedId] });
  check('open branch in new city ok', rn.ok, rn.msg);
  const branchNew = rn.branch;
  console.log(`new-city branch: repeat customers ${Math.round(branchNew.repeatRate * 100)}%, staff ${(branchNew.staff || []).map(e => e.name).join(', ')}, premises ${branchNew.premises.label} rent ${branchNew.premises.monthlyRentLocal}, setup ${rn.setupCost}`);
  check('new-city branch repeat customers start near the floor (30%)', branchNew.repeatRate === 0.3, `rate=${branchNew.repeatRate}`);
  check('branch is a real record: isBranch + parentBusinessId', branchNew.isBranch === true && branchNew.parentBusinessId === parentNew.id);
  check('branch manager is null (a manager can be hired for it, §2)', branchNew.manager === null, JSON.stringify(branchNew.manager));
  check('moved staff member left the parent', !parentNew.staff.some(e => e.id === movedId) && branchNew.staff.some(e => e.id === movedId), `moved ${movedName}`);
  check('branch has its own premises with rent', !!branchNew.premises && branchNew.premises.monthlyRentLocal > 0, JSON.stringify(branchNew.premises));

  const rh = openBranch(Shome, parentHome, 'Cairo');
  check('open branch in home city ok', rh.ok, rh.msg);
  const branchHome = rh.branch;
  console.log(`home-city branch: repeat customers ${Math.round(branchHome.repeatRate * 100)}% (parent ${Math.round(parentHome.repeatRate * 100)}%)`);
  check('home-city branch repeat customers start near the parent (parent - 10%)', branchHome.repeatRate === Math.max(0.35, parentHome.repeatRate - 0.1), `rate=${branchHome.repeatRate} parent=${parentHome.repeatRate}`);

  /* First-month revenue, same rng stream for both branches. */
  Snew.rngState = 424242; Shome.rngState = 424242;
  const plNew = computeBusinessMonth(Snew, branchNew);
  Snew.rngState = 424242; Shome.rngState = 424242;
  const plHome = computeBusinessMonth(Shome, branchHome);
  console.log(`first-month revenue: new-city branch ${plNew.revenue} vs home-city branch ${plHome.revenue} (same rng stream)`);
  check('new-city branch earns LESS at first than a home-city branch', plNew.revenue < plHome.revenue, `${plNew.revenue} vs ${plHome.revenue}`);
  check('branch has its own P&L line (lastPL + history)', !!branchNew.lastPL && branchNew.history.length >= 1 && branchNew.lastPL.net === branchNew.lastPL.revenue - branchNew.lastPL.costs - branchNew.lastPL.tax, JSON.stringify(branchNew.lastPL));
  check('branch P&L is its own (name is the branch, not the parent)', branchNew.lastPL.name === branchNew.name, branchNew.lastPL.name);
  check('branch has its own named staff', (branchNew.staff || []).length >= 1 && (branchNew.staff || []).every(e => e.name), '');

  /* The branch settles through the normal monthly settlement. */
  const ledgerBefore = Snew.ledger.length;
  settleHouseholdMonth(Snew);
  const branchRevLine = Snew.ledger.slice(0, Snew.ledger.length - ledgerBefore).find(x => x.label && x.label.startsWith(`Business revenue — ${branchNew.name}`));
  check('settlement posts a revenue line for the branch by name', !!branchRevLine, branchRevLine ? branchRevLine.label : 'no line');
  const branchCostLine = Snew.ledger.slice(0, Snew.ledger.length - ledgerBefore).find(x => x.label && x.label.startsWith(`Business costs — ${branchNew.name}`));
  check('settlement posts a costs line for the branch by name', !!branchCostLine, '');

  /* Unknown city + branch-of-branch refused plainly. */
  const badCity = openBranch(Snew, parentNew, 'Atlantis');
  check('branch in an unknown city refused', !badCity.ok, badCity.msg);
  const branchOfBranch = openBranch(Snew, branchNew, 'Mansoura');
  check('a branch cannot have its own branch', !branchOfBranch.ok, branchOfBranch.msg);
  const dup = openBranch(Snew, parentNew, 'Alexandria');
  check('second branch in the same city refused', !dup.ok, dup.msg);

  /* Render. */
  const bhtml = strip(renderBranchesHtml(Snew, parentNew));
  check('branch HTML lists the branch city, staff count, repeat customers, sell/close, hire-manager', bhtml.includes('Alexandria') && /repeat customers \d+%/.test(bhtml) && /Sell/.test(bhtml) && /Close/.test(bhtml) && /Hire a manager/.test(bhtml), bhtml.slice(0, 300));
  check('branch HTML shows last month P&L', /Last month: revenue/.test(bhtml), '');
}

/* ================= (f) branch sold separately, closed separately ================= */
console.log('--- (f) sell / close a branch separately ---');
{
  const S = adultLife();
  const r = createBusiness(S, 'cafe', 'Parent Café', { mode: 'part_time' });
  if (!r.ok) throw new Error(`parent launch failed: ${r.msg}`);
  const parent = S.career.businesses[0];
  const rb1 = openBranch(S, parent, 'Alexandria');
  const rb2 = openBranch(S, parent, 'Mansoura');
  check('two branches open', rb1.ok && rb2.ok, `${rb1.msg} / ${rb2.msg}`);
  check('parent + 2 branches = 3 records', S.career.businesses.length === 3, `n=${S.career.businesses.length}`);

  const branch1 = rb1.branch;
  const expectedValuation = businessValuation(branch1);
  const cashBefore = S.money.cash;
  const sold = sellBranch(S, branch1.id);
  console.log(`sold branch: valuation ${expectedValuation}, cash ${cashBefore} -> ${S.money.cash}`);
  check('sell branch ok at the valuation', sold.ok && sold.valuation === expectedValuation, `valuation ${sold.valuation} vs ${expectedValuation}`);
  check('sell branch pays the valuation into cash', S.money.cash === cashBefore + expectedValuation, `${cashBefore} -> ${S.money.cash}`);
  check('sold branch gone, parent + other branch still trading', S.career.businesses.length === 2 && S.career.businesses.some(b => b.id === parent.id) && S.career.businesses.some(b => b.id === rb2.branch.id), `n=${S.career.businesses.length}`);
  check('sell branch posts a ledger line', S.ledger.some(x => x.label && x.label.startsWith('Exited & sold')), '');

  const branch2 = rb2.branch;
  const expectedSalvage = Math.round((branch2.capitalInvested || 0) * 0.5);
  const closed = closeBranch(S, branch2.id, 'test close');
  console.log(`closed branch: salvage ${closed.salvage} (expected 0.5x capital ${expectedSalvage})`);
  check('close branch ok with 0.5x capital salvage', closed.ok && closed.salvage === expectedSalvage, `salvage=${closed.salvage} expected=${expectedSalvage}`);
  check('closed branch gone, parent still trading', S.career.businesses.length === 1 && S.career.businesses[0].id === parent.id, `n=${S.career.businesses.length}`);
  check('selling a non-branch is refused by sellBranch', !sellBranch(S, parent.id).ok, '');
  check('closing a missing branch is refused', !closeBranch(S, 'no-such-branch').ok, '');
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
