// Scope audit: the missed-bill warning also applies to this venture type (shares the settlement loop).
import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { createBusiness } from '../src/systems/businessEngine.js';
function run(takeCatchUp) {
  const S = createNewLifeState({ seed: 31337, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' }); ensureExtendedState(S);
  S.player.age = 34; S.year = 2024; S.month = 6; S.pacing = 'monthly'; S.money.cash = 2000000; S.money.creditScore = 700;
  const r = createBusiness(S, 'tech_founder', '', { mode: 'part_time' }); assert.ok(r.ok, r.msg); const biz = r.biz;
  biz.monthlyRev = 1; biz.monthlyCost = 90000; S.money.cash = 0; S.money.savings = 0;
  const seen = []; let closedAt = null, warnedAt = null;
  for (let m = 0; m < 14; m++) {
    for (let g = 0; g < 6 && S.activeScene; g++) {
      const sc = S.activeScene; let idx = sc.choices.findIndex((c, i) => (takeCatchUp && /catch up/i.test(c.label)) && (!c.available || c.available(S)));
      if (idx < 0) idx = sc.choices.findIndex((c) => !c.available || c.available(S));
      if (idx < 0) break; resolveActiveSceneChoice(S, idx);
    }
    advanceSingleTurn(S);
    const titles = [S.activeScene?.title, ...(S.sceneQueue || []).map((x) => x.title)].filter(Boolean).join('|');
    const j = JSON.stringify(S.journal.slice(0, 6));
    if (warnedAt === null && (/Second Missed Business Payment|Final Warning/i.test(titles) || /missed two months|Final Warning/i.test(j))) warnedAt = m;
    const b = (S.career.businesses || []).find((x) => x.id === biz.id);
    if ((!b || b.dead) && closedAt === null) closedAt = m;
    if (closedAt !== null) break;
  }
  return { warnedAt, closedAt, seen };
}
for (const take of [false, true]) {
  const r = run(take);
  assert.notEqual(r.closedAt, null, 'business eventually closes (take=' + take + ')');
  assert.notEqual(r.warnedAt, null, 'a warning was shown before closure (take=' + take + ')');
  assert.ok(r.warnedAt < r.closedAt, `warning (${r.warnedAt}) came before closure (${r.closedAt}) with catch-up=${take}`);
}
console.log('catchup-warning OK');
