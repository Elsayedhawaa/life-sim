import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const m = await import('../src/systems/mortalityModel.js');
/* WHO adult mortality rate, probability of dying between 15 and 60 per 1000, both sexes (WHO GHO WHOSIS_000004, 2023 table as mirrored at azenha.ai) */
const WHO = { egy: 114, gbr: 74, usa: 113, tur: 108, deu: 64, jpn: 50 };
for (const [c, target] of Object.entries(WHO)) {
  let surv = 1;
  for (let a = 15; a < 60; a++) { let q = 0; for (const g of ['m', 'f']) q += m.baselineAnnualDeathProb({ player: { age: a, gender: g }, country: c, year: 2026, skills: { fitness: 50 } }) / 2; surv *= 1 - q; }
  const got = (1 - surv) * 1000;
  assert.ok(Math.abs(got - target) / target < 0.08, `${c}: model ${got.toFixed(0)} vs WHO ${target}`);
}
/* no jump at 60: the adult factor blends into the old-age factor */
for (const c of Object.keys(WHO)) assert.ok(Math.abs(m.countryMortalityMultiplier(c, 59) - m.countryMortalityMultiplier(c, 61)) < 0.1, c + ' smooth at 60');
/* a lasting condition on the flat rate adds at most twice the ordinary risk */
const S = { player: { age: 35, gender: 'm' }, country: 'usa', year: 2026, skills: { fitness: 50 }, medical: { conditions: [] } };
const base = m.baselineAnnualDeathProb(S);
const p = m.diseaseAnnualDeathProb(S, { id: 'type1_diabetes', chronic: true, deathRiskPerYear: 0.02, managed: false, sinceYear: 2020 });
assert.ok(p <= 2 * base + 1e-9, 'flat chronic rate capped: ' + p + ' vs ' + base);
/* rare conditions are rarer than the everyday ones */
assert.ok(m.onsetWeight({ id: 'hepatitis_b' }, 40) < m.onsetWeight({ id: 'asthma' }, 40));
console.log('ok v221 mortality matches WHO adult rate');
