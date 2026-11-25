#!/usr/bin/env node
/* Rendered checks: friend job offer eligible vs refused, and the lawsuit
   "Nothing to file" lock reason. Engine + rendered-HTML level (no pixels). */
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(String(k), String(v)), removeItem: k => store.delete(k) };
let pass = 0, fail = 0;
const check = (n, ok, d = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { checkBusinessFate } = await import('../src/systems/businessFate.js');
const { resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const { renderLifeTabHtml, renderLifestyleTabHtml } = await import('../src/ui/views.js');
const { getMergedCareerTracks } = await import('../src/systems/careerEducationEngine.js').catch(() => ({}));
function life(seed, track) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S); S.player.age = 34; S.year = 2024; S.month = 6; S.pacing = 'monthly'; S.money.cash = 2000000;
  S.people.fr1 = { id: 'fr1', fullName: 'Omar Adel', alive: true, age: 34, employer: 'Orascom Construction', jobTitle: 'Site Engineer', track, rel: { affection: 68, trust: 60, respect: 60 } };
  S.relations.friendIds = ['fr1'];
  S.career.businesses = [{ id: 'biz_h', name: 'Hawaa Cafe', typeId: 'cafe', country: 'egy', city: 'Cairo', level: 2, maxLevel: 5, monthlyRev: 30000, monthlyCost: 20000, capitalInvested: 500000, repeatRate: .5, mode: 'part_time', staff: [], premises: { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 }, loanId: null, misses: 0, debtLocal: 0, monthsLosing: 12, buffs: {}, lastOpUsed: {}, history: [], remote: false, foundedYear: 2023, foundedMonth: 1, pricingMode: 'balanced', dead: true, deathCause: 'losses', lastPL: { revenue: 10000, costs: 20000, tax: 0, net: -10000 } }];
  return S;
}
function friendScene(S) {
  for (let m = 6; m <= 12 && !(S.activeScene && /Offers You a Job/.test(S.activeScene.title)); m++) {
    S.month = m; checkBusinessFate(S);
    if (S.activeScene && !/Offers You a Job/.test(S.activeScene.title)) resolveActiveSceneChoice(S, 0);
  }
  return S.activeScene && /Offers You a Job/.test(S.activeScene.title) ? S.activeScene : null;
}
// find a track that needs a degree and one that needs none
const tracks = getMergedCareerTracks ? getMergedCareerTracks(2024) : {};
const degTrack = Object.keys(tracks).find(k => (tracks[k].reqDegrees || []).length);
const openTrack = Object.keys(tracks).find(k => !(tracks[k].reqDegrees || []).length);
console.log('degree track', degTrack, 'open track', openTrack);
{ // refused: degree required, player has none
  const S = life(901, degTrack); S.education.degrees = [];
  const sc = friendScene(S);
  check('refused: friend scene opens', !!sc);
  const html = renderLifeTabHtml(S, {});
  check('refused: Take-the-job rendered disabled with a readable degree reason', /data-idx="0" disabled>\s*Take the job/.test(html) && /Requires a degree in [A-Za-z]/.test(html), (html.match(/Requires a degree[^<]*/) || ['no reason'])[0]);
}
{ // eligible: degree held
  const S = life(902, degTrack); S.education.degrees = [...tracks[degTrack].reqDegrees];
  const sc = friendScene(S);
  const html = renderLifeTabHtml(S, {});
  const btn = (html.match(/<button[^>]*>[^<]*Take the job/) || [''])[0];
  check('eligible: Take-the-job rendered and not disabled', !!btn && !/disabled/.test(btn), btn.slice(0, 120));
  const r = resolveActiveSceneChoice(S, 0);
  check('eligible: taking it gives a real job', S.career.job && /Orascom|Site|Engineer|./.test(JSON.stringify(S.career.job)) && !!S.career.job, JSON.stringify(S.career.job || null).slice(0, 100));
}
{ // lawsuit: no claim
  const S = life(903, openTrack); S.activeScene = null;
  const html = renderLifestyleTabHtml ? renderLifestyleTabHtml(S, { lifeSub: 'legal', lifestyleSub: 'legal', sub: 'legal' }) : '';
  check('lawsuit: "Nothing to file" reason rendered next to a disabled file button', /Nothing to file/.test(html) && /data-action="file-lawsuit"[^>]*disabled/.test(html), html.length + ' chars');
}
console.log(`\n${pass} PASS ${fail} FAIL`); process.exit(fail ? 1 : 0);
