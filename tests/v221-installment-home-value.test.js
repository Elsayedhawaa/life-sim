import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { buyCompoundOrDistrictUnit } = await import('../src/systems/completeLifeSystems.js');
const { PAYMENT_PLANS, PROPERTY_UNITS, FINISHING_TIERS } = await import('../src/data/megaRealEstate.js');
const unit = PROPERTY_UNITS.find(u => !u.countries || u.countries.includes('egy'));
const fin = FINISHING_TIERS.find(f => f.canLive);
const buy = planId => { const s = createNewLifeState({ country: 'egy', seed: 5 }); ensureExtendedState(s); s.player.age = 30; s.year = 2026; s.money.cash = 1e12; const r = buyCompoundOrDistrictUnit(s, { country: 'egy', devId: 'egy_celia', unitId: unit.id, finishId: fin.id, planId }); assert.ok(r.ok, r.msg); return r.prop; };
const plan = PAYMENT_PLANS.find(p => p.years === 10 && (p.totalMarkup || 1) > 1 && !p.countries);
assert.ok(plan, 'a developer 10-year plan with a mark-up exists');
const cash = buy('cash'), inst = buy(plan.id);
const base = cash.nativeValue / 0.85;                       // cash plan is the 15% discount on base price
assert.ok(Math.abs(inst.nativeValue - base) / base < 0.01, `instalment home is worth its base price, not the marked-up one (${inst.nativeValue} vs ${base})`);
const total = Math.round(base * plan.totalMarkup);
const down = Math.max(0.05, plan.downPct ?? 0.10) * total;
assert.ok(Math.abs(inst.nativeInstallmentRemaining - (total - down)) / total < 0.01, 'the debt still carries the mark-up');
assert.ok(inst.nativeMonthlyRent < cash.nativeMonthlyRent * 1.2, 'rent follows the market value, not the marked-up price');
console.log('ok v221 instalment home value');
