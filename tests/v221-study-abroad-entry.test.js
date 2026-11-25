// The "After school" decision offers study abroad through the existing rules: every option is the real quote, locked with its own reason when it cannot go ahead.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { presentPostHighSchoolCrossroads, restoreEducationDecision } = await import('../src/systems/careerEducationEngine.js');
const { resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const mk = (cash, english) => { const S = createNewLifeState({ seed: 4, country: 'egy', birthYear: 1998, familyTier: 'very_wealthy', gender: 'm' }); ensureExtendedState(S); S.year = 2016; S.month = 9; S.player.age = 18; S.education.stage = 'graduated_high'; S.education.highSchoolScore = 95; S.money.cash = cash; S.money.savings = 0; S.player.vitals.smarts = 80; if (english) S.education.languages = ['English (Fluent)']; S.legal.passports.forEach(p => { p.expiresYear = 2040; }); return S; };
const open = S => { S.activeScene = null; S.sceneQueue = []; presentPostHighSchoolCrossroads(S); if (!S.activeScene && S.sceneQueue.length) S.activeScene = S.sceneQueue.shift(); };
const pick = (S, re) => { const i = S.activeScene.choices.findIndex(c => re.test(c.label)); assert.ok(i >= 0, String(re)); const c = S.activeScene.choices[i]; return { i, c, ok: typeof c.available !== 'function' || c.available(S) }; };
const go = (S, re) => { const p = pick(S, re); assert.ok(p.ok, `${re} available`); assert.ok(resolveActiveSceneChoice(S, p.i).ok); if (!S.activeScene && S.sceneQueue.length) S.activeScene = S.sceneQueue.shift(); };
{ /* no English: the entry is there, every destination is locked with the real reason, nothing is promised */
  const S = mk(5e9, false); open(S); const e = pick(S, /^Study abroad/); assert.ok(e.ok); assert.ok(!/free|fund(s|ed)? you/i.test(e.c.label)); go(S, /^Study abroad/);
  assert.match(S.activeScene.key, /^abroad_dest_/); const g = S.activeScene.choices.filter(c => !c.exit); assert.ok(g.length > 5); assert.ok(g.every(c => c.available(S) === false), 'English is required'); assert.match(g[0].lockReason, /English/);
  const before = S.money.cash; const r = restoreEducationDecision(S, { key: S.activeScene.key }); assert.ok(r && /^abroad_dest_/.test(r.key), 'restores after reload'); assert.equal(S.money.cash, before); }
{ /* with English and money: walk destination, university, subject and funding; it charges once and enrols abroad */
  const S = mk(5e9, true); open(S); go(S, /^Study abroad/);
  const g = S.activeScene.choices.filter(c => !c.exit && c.available(S)); assert.ok(g.length >= 1, 'some destination works'); const dest = g[0].label.split(' · ')[0]; go(S, new RegExp('^' + dest));
  const u = S.activeScene.choices.find(c => !c.exit && c.available(S)); go(S, new RegExp('^' + u.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const m = S.activeScene.choices.find(c => !c.exit && c.available(S)); go(S, new RegExp('^' + m.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(S.activeScene.key, /^abroad_fund_/); const cash = S.money.cash; go(S, /^Pay from your own/);
  assert.ok(S.education.university && S.education.university.international, 'enrolled abroad'); assert.ok(S.money.cash < cash, 'charged once'); assert.notEqual(S.country, 'egy'); }
{ /* an expired passport locks every destination with the passport's own reason, so the scene never offers what the move would refuse */
  const S = mk(5e9, true); S.legal.passports.forEach(p => { p.expiresYear = 2010; }); open(S); go(S, /^Study abroad/); const g = S.activeScene.choices.filter(c => !c.exit); assert.ok(g.every(c => c.available(S) === false)); assert.match(g[0].lockReason, /passport/i); }
{ /* too poor: the funding choice is locked with the quote's reason and nothing is charged */
  const S = mk(5e9, true); const SA = await import('../src/systems/studyAbroadScenes.js'); const { abroadUniversities } = await import('../src/systems/studyAbroadPlanning.js');
  const dest = 'gbr', u = abroadUniversities(S, dest)[0]; S.money.cash = 10; S.activeScene = null; S.sceneQueue = []; SA.presentAbroadFunding(S, dest, u.id, 'cs'); if (!S.activeScene && S.sceneQueue.length) S.activeScene = S.sceneQueue.shift();
  const own = pick(S, /^Pay from your own/); assert.equal(own.ok, false); assert.match(own.c.lockReason, /Cash and savings/); assert.ok(!S.education.university); }
{ /* a university student or a postgrad is not offered it */
  const S = mk(5e9, true); S.education.stage = 'university'; S.education.university = { id: 'x' }; assert.equal((await import('../src/systems/studyAbroadScenes.js')).studyAbroadOpen(S), false); }
console.log('study abroad entry OK');
