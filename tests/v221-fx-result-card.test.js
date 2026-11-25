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
console.log('fx result card OK');
