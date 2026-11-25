// A move abroad converts balances: the result card never subtracts amounts in different currencies, and a real cost in the same turn stays visible.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState, walletMove } = await import('../src/core/schema.js');
const { snapshotTurn, buildTurnResult, renderTurnResultCardHtml } = await import('../src/ui/turnResult.js');
const { convertCurrency } = await import('../src/data/economy.js');
const { executeCountryRelocation } = await import('../src/systems/visaMigrationEngine.js');
const S = createNewLifeState({ seed: 4, country: 'egy', birthYear: 1990, gender: 'm' }); ensureExtendedState(S); S.year = 2016; S.player.age = 30; S.money.cash = 97e6; S.money.savings = 1e6;
const before = snapshotTurn(S); const cash0 = S.money.cash;
executeCountryRelocation(S, 'gbr', { kind: 'citizen', permitName: 'x', expiresYear: 2030, expiresMonth: 1 });
assert.equal(S.country, 'gbr'); const conv = convertCurrency(cash0, 'egy', 'gbr', 2016);
const r = buildTurnResult(S, before, 'choice');
assert.ok(Math.abs(r.cashDelta) < conv * 0.02, `no fake loss: ${r.cashDelta} vs balance ${conv}`);
assert.ok(r.moneyLines.every(l => !/Currency conversion/.test(l.label)), 'conversion is not a spend line');
assert.ok(r.fxLines.length >= 1 && /became/.test(r.fxLines[0]));
const html = renderTurnResultCardHtml(S, { turnResult: r }); assert.match(html, /Currency conversion \(not a cost\)/); assert.ok(!/−9\d\.\dM GBP/.test(html));
{ const b2 = snapshotTurn(S); walletMove(S, -1000, 'A real cost', 'lifestyle'); const r2 = buildTurnResult(S, b2, 'choice'); assert.equal(r2.cashDelta, -1000); assert.deepEqual(r2.fxLines, []); }
{ /* Finance tab: the income/expense chart totals and the Money In/Out filters leave pure conversion out; the audit row stays and shows no signed amount */
  const { renderFinanceTabHtml } = await import('../src/ui/views.js'); const T = createNewLifeState({ seed: 5, country: 'egy', birthYear: 1990, gender: 'm' }); ensureExtendedState(T); T.year = 2016; T.player.age = 30; T.money.cash = 97e6;
  walletMove(T, 5000, 'A real wage', 'career'); walletMove(T, -2000, 'A real cost', 'lifestyle'); T.country = 'egy';
  const { executeCountryRelocation: move } = await import('../src/systems/visaMigrationEngine.js'); move(T, 'gbr', { kind: 'citizen', permitName: 'x', expiresYear: 2030, expiresMonth: 1 }); walletMove(T, -700, 'A cost in GBP', 'lifestyle');
  assert.ok(T.ledger.some(e => e.category === 'fx'), 'conversion is still in the ledger');
  const html = renderFinanceTabHtml(T, { finSub: 'cashflow' }); const out = Number(/data-total-out="(\d+)"/.exec(html)?.[1]), inn = Number(/data-total-in="(\d+)"/.exec(html)?.[1]);
  assert.ok(out >= 700 && out < 2700, `expenses are real costs only, not a 90M conversion: ${out}`); assert.ok(inn >= 300 && inn < 5000, `income excludes the conversion: ${inn}`);
  assert.match(html, /Currency conversion/); assert.match(html, /became/);
  const outHtml = renderFinanceTabHtml(T, { finSub: 'cashflow', ledgerFilter: 'out' }); assert.ok(!/Currency conversion, cash/.test(outHtml), 'not under Money Out');
}
{ /* a real cost paid before the move, in the same turn, is converted to today's currency, not shown at its old number */
  const U = createNewLifeState({ seed: 6, country: 'egy', birthYear: 1990, gender: 'm' }); ensureExtendedState(U); U.year = 2016; U.player.age = 30; U.money.cash = 97e6;
  const b = snapshotTurn(U); walletMove(U, -270841, 'Tuition', 'education');
  executeCountryRelocation(U, 'gbr', { kind: 'citizen', permitName: 'x', expiresYear: 2030, expiresMonth: 1 });
  const r3 = buildTurnResult(U, b, 'choice'); const line = r3.moneyLines.find(l => /^Tuition/.test(l.label)); const want = -Math.round(convertCurrency(270841, 'egy', 'gbr', 2016));
  assert.ok(line, 'tuition line present'); assert.ok(Math.abs(line.delta - want) <= 2, `converted: ${line.delta} vs ${want}`); assert.match(line.label, /paid in EGP, shown in GBP/);
  assert.ok(Math.abs(r3.cashDelta - want) / Math.abs(want) < 0.02, 'cash change is the real cost in the new currency');
  const { renderFinanceTabHtml } = await import('../src/ui/views.js'); const h = renderFinanceTabHtml(U, { finSub: 'cashflow' }); const o = Number(/data-total-out="(\d+)"/.exec(h)?.[1]);
  assert.ok(o < 100000, `expenses are in one currency (about ${-want} GBP), not 270,841 plus: ${o}`);
  assert.equal(U.ledger.find(e => e.label === 'Tuition').delta, -270841, 'stored history untouched'); assert.equal(U.ledger.find(e => e.label === 'Tuition').currency, 'EGP'); }
{ const W = createNewLifeState({ seed: 7, country: 'egy', birthYear: 1990, gender: 'm' }); ensureExtendedState(W); W.year = 2016; W.player.age = 30; W.money.cash = 5e6; W.money.savings = 1e6;
  executeCountryRelocation(W, 'gbr', { kind: 'citizen', permitName: 'x', expiresYear: 2030, expiresMonth: 1 }); const fx = W.ledger.filter(e => e.category === 'fx'); assert.ok(fx.length >= 1); assert.ok(fx.every(e => e.currency === 'GBP'), 'conversion balance is in the new currency'); }
console.log('fx result card OK');
