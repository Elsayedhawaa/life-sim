// A wealthy family's graduate is not handed bottom-of-the-market offers; other tiers keep the old list.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const E = await import('../src/systems/careerEducationEngine.js');
function offers(tier, country, major, seed) {
  const S = createNewLifeState({ seed, country, birthYear: 2000, familyTier: tier }); ensureExtendedState(S);
  S.player.age = 24; S.year = 2024; S.education.stage = 'completed'; S.education.degrees = major ? [major] : []; S.activeScene = null; S.sceneQueue = [];
  E.presentGraduateOrJobSearchOffers(S);
  const sc = S.activeScene || S.sceneQueue[0];
  return sc ? sc.choices.map(c => c.label) : [];
}
const gross = l => { const m = /\(([^)]*?)\/mo gross/.exec(l); return m ? Number(m[1].replace(/[^0-9.]/g, '')) : 0; };
let checked = 0, better = 0;
for (const country of ['usa', 'tur', 'egy', 'gbr']) for (const major of ['computer_science', 'business', 'law']) {
  for (const tier of ['wealthy', 'very_wealthy']) {
    const mid = offers('middle', country, major, 5).filter(l => /\/mo gross/.test(l)).map(gross), rich = offers(tier, country, major, 5).filter(l => /\/mo gross/.test(l)).map(gross);
    if (mid.length < 2 || rich.length < 2) continue;
    checked++;
    assert.ok(rich[1] >= rich[0] * 0.6 - 1, `${tier} ${country} ${major}: the second offer is not bottom pay (${rich})`);
    assert.ok(rich[1] >= mid[1], `${tier} ${country} ${major}: never worse than the middle-tier list`);
    if (rich[1] > mid[1]) better++;
  }
}
assert.ok(checked >= 6 && better >= 1, 'compared across countries and at least one list improved: ' + checked + '/' + better);
console.log('rich offers OK');
