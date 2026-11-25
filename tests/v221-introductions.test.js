// Introductions (event 10): the family opens a door to a first real customer, as a real signed order in the player's own contract book.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const { settleContracts } = await import('../src/systems/companyContracts.js');
const mkBiz = () => ({ id: 'bz', name: 'ServiceCo', country: 'usa', figuresCurrency: 'usa', typeId: 'kiosk', staff: [], capitalInvested: 1000, equityOwned: 100, dead: false, enterprise: { capacity: 100, sector: 'education' }, catalog: { items: [{ id: 'item_0', name: 'Course', active: true, price: 100, load: 2, cycle: 1, weight: 1, role: 'core', input: 10 }] } });
const mk = (tier, age = 25) => { const S = createNewLifeState({ seed: 5, country: 'usa', birthYear: 2000, familyTier: tier, gender: 'm' }); ensureExtendedState(S); S.player.age = age; S.year = 2026; S.month = 3; S.money.cash = 10000; return S; };
{ const S = mk('wealthy'); assert.equal(F.offerIntroduction(S), null, 'no company, no introduction'); S.career.businesses = [mkBiz()];
  const o = F.offerIntroduction(S); assert.ok(o && o.customer && o.qty > 0); assert.equal(F.restoreHomeScene(S, { key: 'family_intro' })?.key, 'family_intro', 'survives a reload');
  const cash0 = S.money.cash; const r = F.resolveIntroduction(S, true); assert.ok(r.taken);
  const b = S.career.businesses[0], ord = b.contracts.orders[0]; assert.equal(ord.customer, o.customer); assert.equal(ord.price, 100, 'normal price, no family discount'); assert.equal(ord.total, ord.quantity * 100); assert.equal(ord.escrow, Math.floor(ord.total * 0.3)); assert.equal(S.money.cash, cash0, 'the family adds no money');
  S.month = 6; const st = settleContracts(S, b, 100, 1); assert.ok(st.revenue > 0, 'delivering it earns real revenue'); assert.equal(F.offerIntroduction(S), null, 'only once'); }
{ const S = mk('wealthy'); S.career.businesses = [mkBiz()]; F.offerIntroduction(S); const r = F.resolveIntroduction(S, false); assert.ok(!r.taken); assert.equal(S.career.businesses[0].contracts, undefined, 'declining changes nothing'); assert.equal(F.offerIntroduction(S), null); }
{ const S = mk('middle'); S.career.businesses = [mkBiz()]; assert.equal(F.offerIntroduction(S), null, 'not a fortune family'); const T = mk('wealthy', 17); T.career.businesses = [mkBiz()]; assert.equal(F.offerIntroduction(T), null, 'adults only'); }
console.log('introductions OK');
