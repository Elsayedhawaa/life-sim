// GAME DESIGN: manager-run year-1 net margin for a bakery, retail shop and bookstore sits near sourced small-business ranges
// (tuned near sourced ranges, not source-verified; sources are blog aggregators, not primary data).
// Bakery net 4-9% retail, 5-15% broader: https://ovenbell.com/blog/bakery-profit-margin ; https://www.hnhcbakery.com/blog/bakery-financial-management-guide
// Retail net 3-8%, healthy 5-12%: https://dojobusiness.com/blogs/news/tool-revenue-retail ; https://www.marginatlas.com/learn/retail-margin
// Bookstore roughly 2% and up: https://legalclarity.org/how-do-bookstores-make-money-revenue-streams-explained/
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const B = await import('../src/systems/businessEngine.js');
const M = await import('../src/systems/businessManager.js');
const { computeBusinessMonthFull } = await import('../src/systems/businessMonthly.js');
function year1(id) {
  const S = createNewLifeState({ country: 'usa', seed: 5, familyTier: 'wealthy', birthYear: 1995 }); ensureExtendedState(S);
  S.year = 2025; S.month = 3; S.player.age = 30; S.money.cash = 1e12;
  const bp = B.listAllBusinessVentures(S).find(b => b.id === id); const ev = B.evaluateBusinessLaunch(S, bp);
  const mgr = M.managerShortlist(S, { country: 'usa', monthlyRev: ev.revLocal, capitalInvested: ev.capitalLocal, staffRoles: [] })[2];
  B.createBusiness(S, id, 'T', { runBy: 'manager', manager: mgr, mode: 'full_time' }); const biz = S.career.businesses.at(-1);
  let rev = 0, net = 0;
  for (let m = 0; m < 12; m++) {
    S.month = (S.month % 12) + 1; if (S.month === 1) S.year++;
    for (const a of [...(biz.managerAsks || [])]) { try { M.answerManagerAsk(S, biz, a.id, true); } catch (e) {} }
    const pl = computeBusinessMonthFull(S, biz); biz.lastPL = null; rev += pl.revenue; net += pl.net;
  }
  return net / rev;
}
const bk = year1('bakery'), rt = year1('retail_shop'), bs = year1('bookstore');
assert.ok(bk > 0.04 && bk < 0.16, 'bakery year-1 net ' + bk.toFixed(3));
assert.ok(rt > 0.03 && rt < 0.13, 'retail shop year-1 net ' + rt.toFixed(3));
assert.ok(bs > 0.01 && bs < 0.12, 'bookstore year-1 net ' + bs.toFixed(3));
console.log('ok v221 small shop margins');
