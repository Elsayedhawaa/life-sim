/* v2.14 W5 verify — Business exits (§6) + cash (§7).
   Run from the game root: node tests/v214-w5-verify.mjs
   Covers: trade sale (offer/negotiate/accept), management buyout
   (loan path + no-manager refusal), IPO (threshold, forced success and
   forced failure), franchise (threshold, fee + royalty, bad franchisee
   + revoke), withdraw (tax by hand from Egypt brackets), reinvest
   (measured next-month lift), and the no-double-count rule. */
import { createNewLifeState, createPerson, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import { computeBusinessMonth, businessValuation } from '../src/systems/businessEngine.js';
import { computeMonthlyNetPay } from '../src/data/economy.js';
import {
  tradeSaleOffer, negotiateTradeSale, acceptTradeSale,
  managementBuyout, ipoBusiness, ipoThreshold, ipoSuccessChance,
  franchiseBusiness, franchiseIncome, franchiseeGoesBad, revokeFranchise,
  withdrawBusinessCash, reinvestBusinessCash, reinvestBoost, consumeReinvestBoost,
  renderExitsHtml, renderCashHtml,
  IPO_MIN_ANNUAL_REVENUE_LOCAL, IPO_MIN_YEARS,
  FRANCHISE_MIN_LEVEL, FRANCHISE_MIN_MONTHS, FRANCHISE_MIN_PROFITABLE_MONTHS,
  FRANCHISE_MIN_REPEAT_RATE
} from '../src/systems/businessExits.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

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
function mkBiz(id, name, rev, cost, capital, over = {}) {
  return {
    id, typeId: 'cafe', name, country: 'egy', city: 'Cairo', level: 1, maxLevel: 5, volatility: 0.05,
    monthlyRev: rev, monthlyCost: cost, capitalInvested: capital, repeatRate: 0.5, mode: 'full_time',
    staff: [], premises: null, loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: 0, bonus: 0, pricing: 0 }, history: [], heirId: null, remote: false,
    foundedYear: 2022, foundedMonth: 3, ...over
  };
}
function addBiz(S, biz) {
  S.career.businesses = [biz]; S.career.business = biz;
  return biz;
}

/* ================= (a) trade sale ================= */
console.log('--- (a) trade sale ---');
{
  const S = adultLife();
  const biz = addBiz(S, mkBiz('biz_ts', 'Trade Café', 200000, 120000, 500000, {
    repeatRate: 0.8,
    lastPL: { net: 60000 },
    history: [{ net: 40000 }, { net: 60000 }]
  }));
  const valuation = businessValuation(biz);
  const cashBefore = S.money.cash;
  const offer = tradeSaleOffer(S, biz);
  console.log(`valuation ${valuation} | buyer ${offer.buyer} | offer ${offer.offer} (${offer.above ? 'above' : 'below'} valuation)`);
  console.log('reason:', offer.reason);
  check('trade offer from a named buyer', offer.ok && typeof offer.buyer === 'string' && offer.buyer.length > 3, offer.buyer);
  check('offer differs from valuation', offer.offer !== valuation, `${offer.offer} vs ${valuation}`);
  check('reason states above/below + why', /above|below/.test(offer.reason) && /repeat|profit|market/.test(offer.reason), offer.reason);
  const neg = negotiateTradeSale(S, biz);
  console.log(`negotiated counter ${neg.counter} vs offer ${offer.offer}`);
  check('one negotiation round gives a counter differing from the offer', neg.ok && neg.counter !== offer.offer, `${neg.counter} vs ${offer.offer}`);
  const neg2 = negotiateTradeSale(S, biz);
  check('second negotiation round refused', !neg2.ok && /already countered|one round/.test(neg2.msg), neg2.msg);
  const acc = acceptTradeSale(S, biz, neg);
  console.log(`accepted ${acc.amount} | cash ${cashBefore} -> ${S.money.cash}`);
  check('accept lands the counter amount in cash', acc.ok && S.money.cash === cashBefore + acc.amount, `${cashBefore} -> ${S.money.cash}, amount ${acc.amount}`);
  check('business leaves the portfolio', S.career.businesses.length === 0, `n=${S.career.businesses.length}`);
  check('trade-sale ledger line names buyer + amount', S.ledger.some(l => l.label && l.label.includes('Trade sale') && l.label.includes(acc.buyer)), '');
  check('staff transfer recorded (formerBusinesses)', (S.career.formerBusinesses || []).some(f => f.exit === 'trade_sale' && f.buyer === acc.buyer), '');
}

/* ================= (b) management buyout ================= */
console.log('--- (b) management buyout ---');
{
  const S = adultLife();
  const mgrPerson = createPerson(S, { age: 45, gender: 'm', role: 'manager', relationLabel: 'Manager' });
  S.people[mgrPerson.id] = mgrPerson;
  const biz = addBiz(S, mkBiz('biz_mbo', 'MBO Café', 200000, 120000, 500000, {
    repeatRate: 0.8, lastPL: { net: 60000 },
    manager: { name: mgrPerson.fullName, skill: 82, wage: 40000, loyalty: 88, policy: 'growth', hiredYear: 2016, hiredMonth: 1, personId: mgrPerson.id }
  }));
  const valuation = businessValuation(biz);
  const cashBefore = S.money.cash;
  const r = managementBuyout(S, biz);
  console.log(`valuation ${valuation} | MBO price ${r.price} | method ${r.method} | loan ${JSON.stringify(r.loan)} | manager ${r.manager}`);
  check('MBO succeeds with a manager who can afford it (loan path)', r.ok && r.method === 'loan', r.msg);
  check('MBO price cheaper than valuation (85%)', r.ok && r.price === Math.round(valuation * 0.85) && r.price < valuation, `${r.price} vs ${valuation}`);
  check('loan terms stated (amount, 7%, 60 months, monthly payment)', r.ok && r.loan && r.loan.annualRate === 0.07 && r.loan.months === 60 && r.loan.monthlyPayment > 0, JSON.stringify(r.loan));
  check('MBO money lands in cash', r.ok && S.money.cash === cashBefore + r.price, `${cashBefore} -> ${S.money.cash}`);
  check('manager stays as an owner (boughtBy record)', (S.career.formerBusinesses || []).some(f => f.exit === 'management_buyout' && f.boughtBy && f.boughtBy.name === mgrPerson.fullName), '');
  check('manager Person record marked as business owner', S.people[mgrPerson.id].businessOwner === true && S.people[mgrPerson.id].ownsBusiness === 'MBO Café', JSON.stringify(S.people[mgrPerson.id].ownsBusiness));
  check('business leaves the portfolio', S.career.businesses.length === 0);
  // no manager -> plain refusal
  const S2 = adultLife();
  const biz2 = addBiz(S2, mkBiz('biz_mbo2', 'No Manager Café', 200000, 120000, 500000, { repeatRate: 0.8, lastPL: { net: 60000 } }));
  const r2 = managementBuyout(S2, biz2);
  check('no manager: MBO refuses plainly', !r2.ok && /no manager/i.test(r2.msg), r2.msg);
  check('no manager: business stays', S2.career.businesses.length === 1);
  // manager who cannot afford even with a loan -> refusal names the shortfall
  const S3 = adultLife();
  const biz3 = addBiz(S3, mkBiz('biz_mbo3', 'Pricy Café', 200000, 120000, 500000, {
    repeatRate: 0.8, lastPL: { net: 60000 },
    manager: { name: 'New Manager', skill: 50, wage: 5000, loyalty: 50, policy: 'safe', hiredYear: 2026, hiredMonth: 1, personId: null }
  }));
  const r3 = managementBuyout(S3, biz3);
  console.log('unaffordable MBO:', r3.msg);
  check('unaffordable manager: refuses and names the shortfall', !r3.ok && typeof r3.shortfall === 'number' && r3.shortfall > 0 && /short by/.test(r3.msg), r3.msg);
}

/* ================= (c) IPO ================= */
console.log('--- (c) IPO ---');
{
  console.log(`IPO threshold: ${IPO_MIN_ANNUAL_REVENUE_LOCAL.toLocaleString('en-US')} annual revenue (local) + ${IPO_MIN_YEARS} years`);
  const S = adultLife();
  const small = addBiz(S, mkBiz('biz_ipo_small', 'Small Café', 100000, 60000, 300000, { repeatRate: 0.8, foundedYear: 2025, foundedMonth: 6 }));
  const th = ipoThreshold(S, small);
  console.log(`small biz: annual revenue ${th.annualRevenue}, years ${th.years.toFixed(1)}`);
  const rSmall = ipoBusiness(S, small);
  check('below threshold: IPO refuses and states the threshold', !rSmall.ok && /5,000,000/.test(rSmall.msg) && /5 years/.test(rSmall.msg), rSmall.msg);
  check('below threshold: no money charged', S.money.cash === 5_000_000, `cash=${S.money.cash}`);
  // forced success
  const big = mkBiz('biz_ipo_big', 'Big Café Chain', 600000, 300000, 2000000, {
    repeatRate: 0.8, foundedYear: 2020, foundedMonth: 1, lastPL: { net: 200000 }
  });
  addBiz(S, big);
  const valBig = businessValuation(big);
  const cashBefore = S.money.cash;
  const rateBefore = big.repeatRate;
  const rOk = ipoBusiness(S, big, { force: 'success' });
  console.log(`IPO success: valuation ${valBig} | costs ${rOk.costsPaid} | payout ${rOk.payout} | float ${rOk.publicFloat}% | repeatRate ${rateBefore} | cash ${cashBefore}->${S.money.cash}`);
  check('IPO success charges real costs and pays out', rOk.ok && rOk.success && rOk.costsPaid === Math.round(valBig * 0.05) && rOk.payout === Math.round(valBig * 0.25), JSON.stringify(rOk));
  check('IPO success: cash moves by payout minus costs', S.money.cash === cashBefore + rOk.payout - rOk.costsPaid, `${cashBefore} -> ${S.money.cash}`);
  check('IPO success: business continues with 25% public float', S.career.businesses.includes(big) && big.publicFloat === 25, `float=${big.publicFloat}`);
  check('IPO success: repeat rate untouched by the listing', big.repeatRate === rateBefore, `rate=${big.repeatRate}`);
  check('IPO success: ledger lines for payout + both fee stages', S.ledger.some(l => l.label && l.label.startsWith('IPO — sold 25%')) && S.ledger.some(l => l.label && /IPO filing/.test(l.label)) && S.ledger.some(l => l.label && /IPO underwriting/.test(l.label)), '');
  // forced failure
  const big2 = mkBiz('biz_ipo_fail', 'Doomed Chain', 600000, 300000, 2000000, {
    repeatRate: 0.8, foundedYear: 2020, foundedMonth: 1, lastPL: { net: 200000 }
  });
  addBiz(S, big2);
  const cashBefore2 = S.money.cash;
  const rateBefore2 = big2.repeatRate;
  const rFail = ipoBusiness(S, big2, { force: 'fail' });
  console.log(`IPO failure: costs paid ${rFail.costsPaid} (of ${rFail.totalCost} total) | repeatRate ${rateBefore2} | cash ${cashBefore2}->${S.money.cash}`);
  check('IPO failure resolves as failure', rFail.ok && rFail.success === false, JSON.stringify(rFail));
  check('IPO failure: only stage-1 costs lost, cash falls by exactly that', S.money.cash === cashBefore2 - rFail.costsPaid && rFail.costsPaid === Math.round(rFail.totalCost / 2), `${cashBefore2} -> ${S.money.cash}`);
  check('IPO failure: repeat rate untouched by the failed listing', big2.repeatRate === rateBefore2, `rate=${big2.repeatRate}`);
  check('IPO failure: no float, business still yours', big2.publicFloat === 0 && S.career.businesses.includes(big2), '');
  check('IPO chance is a stated number in range', ipoSuccessChance(S, big2) >= 0.3 && ipoSuccessChance(S, big2) <= 0.9, `${ipoSuccessChance(S, big2)}`);
  check('IPO chance rises with repeat customers', ipoSuccessChance(S, { ...big2, repeatRate: 0.9 }) > ipoSuccessChance(S, { ...big2, repeatRate: 0.5 }), `${ipoSuccessChance(S, { ...big2, repeatRate: 0.9 })} vs ${ipoSuccessChance(S, { ...big2, repeatRate: 0.5 })}`);
}

/* ================= (d) franchise ================= */
console.log('--- (d) franchise ---');
{
  console.log(`Franchise threshold: level ${FRANCHISE_MIN_LEVEL} + ${FRANCHISE_MIN_MONTHS} months + ${FRANCHISE_MIN_PROFITABLE_MONTHS} profitable months + ${Math.round(FRANCHISE_MIN_REPEAT_RATE * 100)}% repeat customers`);
  const S = adultLife();
  const small = addBiz(S, mkBiz('biz_fr_small', 'Tiny Café', 200000, 120000, 500000, { repeatRate: 0.5, level: 1 }));
  const rSmall = franchiseBusiness(S, small);
  check('below threshold: franchise refuses and states the real-state threshold', !rSmall.ok && /level 3/.test(rSmall.msg) && /12 months/.test(rSmall.msg) && /6 profitable/.test(rSmall.msg) && /60% repeat/.test(rSmall.msg), rSmall.msg);
  const big = mkBiz('biz_fr_big', 'Proven Café', 200000, 120000, 500000, {
    repeatRate: 0.8, level: 3,
    history: [{ net: 10000 }, { net: 10000 }, { net: 10000 }, { net: 10000 }, { net: 10000 }, { net: 10000 }]
  });
  addBiz(S, big);
  const retainedBefore = big.retainedCash || 0;
  const r = franchiseBusiness(S, big, { name: 'Karim Haddad' });
  console.log(`franchise fee ${r.fee} (retained ${retainedBefore}->${r.retainedCash}) | monthly royalty ${r.monthlyRoyalty} | monthly income ${r.monthlyIncome}`);
  check('franchise above threshold succeeds', r.ok && r.franchisee.name === 'Karim Haddad', r.msg);
  check('franchise fee lands in retained cash, not personal cash', r.retainedCash === retainedBefore + r.fee && S.money.cash === 5_000_000, `retained=${r.retainedCash} cash=${S.money.cash}`);
  check('monthly franchise income is 5% of monthly revenue', r.monthlyRoyalty === Math.round(200000 * 0.05) && franchiseIncome(S, big) === r.monthlyRoyalty, `${franchiseIncome(S, big)}`);
  const rateBefore = big.repeatRate;
  const bad = franchiseeGoesBad(S, big, r.franchisee.id);
  console.log(`bad franchisee: repeatRate ${bad.repeatRateBefore}->${bad.repeatRateAfter} | income still ${franchiseIncome(S, big)}`);
  check('bad franchisee loses 6% repeat customers', bad.ok && bad.repeatRateBefore === rateBefore && bad.repeatRateAfter === 0.74 && big.repeatRate === 0.74, `${rateBefore} -> ${big.repeatRate}`);
  check('bad franchisee still pays until revoked', franchiseIncome(S, big) === r.monthlyRoyalty, `${franchiseIncome(S, big)}`);
  const rev = revokeFranchise(S, big, r.franchisee.id);
  console.log(`revoked: repeatRate ${rev.repeatRateBefore}->${rev.repeatRateAfter} | income ${rev.incomeBefore}->${rev.incomeAfter}`);
  check('revoking stops the franchise income', rev.ok && rev.incomeAfter === 0 && rev.incomeBefore === r.monthlyRoyalty, `${rev.incomeBefore} -> ${rev.incomeAfter}`);
  check('revoking wins back 3% repeat customers at once', rev.ok && rev.repeatRateAfter === 0.77 && big.repeatRate === 0.77, `${rateBefore} -> ${big.repeatRate}`);
  check('revoking a non-franchisee refused', !revokeFranchise(S, big, 'nope').ok, '');
}

/* ================= (e) withdraw — tax by hand ================= */
console.log('--- (e) withdraw (Egypt brackets, by hand) ---');
{
  const S = adultLife();
  const biz = addBiz(S, mkBiz('biz_wd', 'Cash Café', 200000, 120000, 500000, { repeatRate: 0.7 }));
  biz.retainedCash = 120000; // seeded retained cash (NOT P&L money)
  // Hand calculation, Egypt Law 91/2005 as amended (Law 7/2024), 2026 brackets:
  // withdraw 120,000 treated as a month's profit -> annualised x12 = 1,440,000.
  // 0% on first 40,000 = 0; 10% on 15,000 (40k-55k) = 1,500; 15% on 15,000 (55k-70k) = 2,250;
  // 20% on 130,000 (70k-200k) = 26,000; 22.5% on 200,000 (200k-400k) = 45,000;
  // 25% on 800,000 (400k-1.2m) = 200,000; 27.5% on 240,000 (1.2m-1.44m) = 66,000.
  // Annual tax = 340,750 -> monthly = 28,395.83 -> rounded 28,396.
  const expectedTax = 28396;
  const expectedNet = 120000 - expectedTax;
  const cashBefore = S.money.cash;
  const r = withdrawBusinessCash(S, biz, 120000);
  console.log(`withdraw gross ${r.gross} | tax ${r.tax} (hand: ${expectedTax}) | net ${r.net} (hand: ${expectedNet}) | retained after ${r.retainedCashAfter} | cash ${cashBefore}->${S.money.cash}`);
  check('withdraw succeeds', r.ok, r.msg);
  check('withdraw tax matches Egypt brackets computed by hand', r.tax === expectedTax, `got ${r.tax}, hand ${expectedTax}`);
  check('withdraw net = gross - tax', r.net === expectedNet, `got ${r.net}`);
  check('cash rises by exactly the net (gross in, tax out)', S.money.cash === cashBefore + expectedNet, `${cashBefore} -> ${S.money.cash}`);
  check('retained cash falls by the gross', r.retainedCashAfter === 0, `${r.retainedCashAfter}`);
  check('withdraw message states retained cash, NOT the P&L', /retained cash/i.test(r.msg) && /NOT the monthly P&L/i.test(r.msg), r.msg);
  // cross-check against the bracket function itself
  const viaBrackets = Math.round(computeMonthlyNetPay(120000, 'egy', 2026, true).incomeTax);
  check('hand tax also matches computeMonthlyNetPay', viaBrackets === expectedTax, `viaBrackets=${viaBrackets}`);
  // over-withdraw refused
  const r2 = withdrawBusinessCash(S, biz, 1000);
  check('withdrawing more than retained cash is refused', !r2.ok && /only .* in retained cash/.test(r2.msg), r2.msg);
}

/* ================= (f) reinvest — measured lift ================= */
console.log('--- (f) reinvest lifts next month growth (measured) ---');
{
  const S = adultLife();
  const biz = addBiz(S, mkBiz('biz_ri', 'Growth Café', 100000, 40000, 400000, { repeatRate: 0.5, volatility: 0.05 }));
  biz.staff = [];
  const cashBefore = S.money.cash;
  const r = reinvestBusinessCash(S, biz, 200000);
  console.log(`reinvested ${r.amount} | retained ${r.retainedCash} | boost ×${r.boost.toFixed(2)} | cash ${cashBefore}->${S.money.cash}`);
  check('reinvest succeeds', r.ok && r.boost > 1, r.msg);
  check('reinvest moves personal cash into retained cash', S.money.cash === cashBefore - 200000 && r.retainedCash === 200000, `cash=${S.money.cash} retained=${r.retainedCash}`);
  check('reinvestBoost() returns the stored multiplier', reinvestBoost(S, biz) === r.boost, `${reinvestBoost(S, biz)}`);
  check('reinvest message states retained cash, NOT the P&L', /retained cash/i.test(r.msg) && /NOT the monthly P&L/i.test(r.msg), r.msg);
  // Measure the lift: same RNG stream, revenue without the boost vs with it
  // (the coordinator wires reinvestBoost into computeBusinessMonth; here the
  // test folds the exported boost into monthlyRev to measure the effect).
  const seed = S.rngState;
  const plBase = computeBusinessMonth(S, biz);
  S.rngState = seed;
  const boost = consumeReinvestBoost(S, biz);
  const revSaved = biz.monthlyRev;
  biz.monthlyRev = Math.round(revSaved * boost);
  const plBoosted = computeBusinessMonth(S, biz);
  biz.monthlyRev = revSaved;
  console.log(`next-month revenue without boost ${plBase.revenue} vs with boost ${plBoosted.revenue} (boost ×${boost.toFixed(2)})`);
  check('boost is consumed after one use', reinvestBoost(S, biz) === 1, `${reinvestBoost(S, biz)}`);
  check('reinvested revenue is higher by ~the boost', plBoosted.revenue > plBase.revenue && Math.abs(plBoosted.revenue / plBase.revenue - boost) < 0.02, `${plBase.revenue} -> ${plBoosted.revenue}, ratio ${(plBoosted.revenue / plBase.revenue).toFixed(3)} vs ${boost.toFixed(3)}`);
}

/* ================= (g) NO double-count ================= */
console.log('--- (g) no double-count: P&L net + withdraw net, nothing more ---');
{
  const S = adultLife();
  const biz = addBiz(S, mkBiz('biz_dc', 'Clean Café', 200000, 120000, 500000, { repeatRate: 0.7, volatility: 0.05 }));
  biz.retainedCash = 120000;
  const cashBefore = S.money.cash;
  // One month's P&L lands through the settlement (revenue - costs - tax).
  settleHouseholdMonth(S);
  const pl = biz.lastPL;
  const cashAfterPL = S.money.cash;
  const plNet = pl.net;
  console.log(`P&L: revenue ${pl.revenue} - costs ${pl.costs} - tax ${pl.tax} = net ${plNet} | cash ${cashBefore}->${cashAfterPL} (delta ${cashAfterPL - cashBefore}, includes living costs etc — see below)`);
  // Isolate the business part: the settlement also charges living costs, so
  // measure the business lines in the ledger instead of raw cash.
  const bizLines = S.ledger.filter(l => /Business (revenue|costs|tax)/.test(l.label || ''));
  const bizLedgerSum = bizLines.reduce((s, l) => s + l.delta, 0);
  console.log(`business ledger lines sum ${bizLedgerSum} vs P&L net ${plNet}`);
  check('business ledger lines sum to exactly the P&L net', bizLedgerSum === plNet, `${bizLedgerSum} vs ${plNet}`);
  // Now withdraw retained cash.
  const cashBeforeWd = S.money.cash;
  const wd = withdrawBusinessCash(S, biz, 120000);
  console.log(`withdraw: gross ${wd.gross} tax ${wd.tax} net ${wd.net} | cash ${cashBeforeWd}->${S.money.cash}`);
  check('withdraw after P&L moves exactly its net', S.money.cash === cashBeforeWd + wd.net, `${cashBeforeWd} -> ${S.money.cash}`);
  // Total business cash moved = P&L net + withdraw net. Retained cash was
  // seeded (120,000) BEFORE the month, so it is not P&L money — and the
  // P&L did not touch it: retained cash is now 0 only because of the
  // withdrawal, and the P&L net was never added to it.
  check('retained cash untouched by the P&L (only the withdrawal moved it)', biz.retainedCash === 0, `retained=${biz.retainedCash}`);
  const totalBizMoved = bizLedgerSum + wd.net;
  check('total business cash moved = P&L net + withdraw net, not more', totalBizMoved === plNet + wd.net, `${totalBizMoved} vs ${plNet + wd.net}`);
  // Old-save business without retainedCash: withdraw refuses, never crashes.
  const oldBiz = mkBiz('biz_old', 'Old Café', 100000, 50000, 200000, {});
  delete oldBiz.retainedCash;
  addBiz(S, oldBiz);
  const rOld = withdrawBusinessCash(S, oldBiz, 1000);
  check('old-save business (no retainedCash) treated as 0, refuses plainly', !rOld.ok && /only .* in retained cash/.test(rOld.msg), rOld.msg);
}

/* ================= render helpers ================= */
console.log('--- render helpers ---');
{
  const S = adultLife();
  const biz = addBiz(S, mkBiz('biz_rn', 'Render Café', 600000, 300000, 2000000, {
    repeatRate: 0.8, level: 3, foundedYear: 2020, foundedMonth: 1, lastPL: { net: 200000 }
  }));
  biz.retainedCash = 50000;
  const exits = strip(renderExitsHtml(S, biz));
  const cash = strip(renderCashHtml(S, biz));
  check('exits HTML states IPO threshold', /5,000,000/.test(exits) && /5 years/.test(exits), '');
  check('exits HTML states franchise threshold', /level 3/.test(exits) && /60% repeat customers/.test(exits), '');
  check('exits HTML shows valuation + MBO + trade sale', /Valuation/.test(exits) && /Management buyout/.test(exits) && /Trade sale/.test(exits), '');
  check('cash HTML shows retained balance + NOT-the-P&L warning', /50,000/.test(cash) && /NOT.*monthly profit/.test(cash), '');
  check('cash HTML shows withdraw + reinvest controls', /Withdraw/.test(cash) && /Reinvest/.test(cash), '');
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
