/* v2.12 Worker 1 verify — Compounds/Lands actions for non-rich players +
   the 2 genuinely dead buttons. Run from the game root:
   node tests/v212-w1-verify.mjs
   The three shipped tests (DATA_OK / UI_RENDER_OK / coherence 0 defects)
   are NOT run by this harness — run them separately. */
import { readFileSync } from 'node:fs';
import { createNewLifeState, createPerson, ensureExtendedState, createSaveGoal, liquidFundsLocal } from '../src/core/schema.js';
import { refreshGoalsProgress } from '../src/core/gameLoop.js';
import { renderRealEstateTabHtml, renderEducationTabHtml, renderLifeTabHtml, loanCapacityLocal, affordableFundsLocal } from '../src/ui/views.js';
import { goalStageProgress } from '../src/ui/views.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};

/* Audit persona: ordinary employed married adult, 30, 2 children, Egypt.
   Cash 607,000 — the audit's figure, below every down payment, so every
   Buy button is disabled (baseline: Compounds 28/28 dead, Lands 24/24). */
function auditPersona() {
  const S = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 30;
  S.money.cash = 607000; S.money.savings = 0;
  S.career.employed = true;
  S.career.job = { monthlyGross: 32000, employer: 'Nile Care Hospital', title: 'Accountant' };
  const spouse = createPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id];
  for (const [age, g] of [[6, 'f'], [4, 'm']]) {
    const ch = createPerson(S, { age, gender: g, role: 'child', relationLabel: g === 'f' ? 'Daughter' : 'Son' });
    S.people[ch.id] = ch; S.relations.childIds.push(ch.id);
  }
  return S;
}

const ui = { activeTab: 'realestate', propMarket: 'local', gulfTarget: 'uae', reUnitId: 'apt_m', reFinishId: 'standard', rePlanId: 'cash', reQuery: '' };

/* Audit method, at listing-row granularity: split the render into
   listing rows; a row is dead when it holds zero enabled, non-navigation
   buttons. (Baseline measured with this same method on the v2.11 base:
   Compounds 28/28 dead, Lands 24/24 dead.) */
function countDeadListings(html, buyAction) {
  const rows = String(html).split('<div class="item-row">').slice(1);
  const listings = rows.filter(r => r.includes(`data-action="${buyAction}"`));
  let dead = 0;
  for (const r of listings) {
    const btns = [...r.matchAll(/<button[^>]*>/g)].map(m => m[0]);
    const enabled = btns.filter(b => !/disabled/.test(b) && /data-action=/.test(b));
    if (enabled.length === 0) dead++;
  }
  return { total: listings.length, dead, live: listings.length - dead };
}

console.log('--- §1 Compounds / Lands dead listings ---');
{
  const S = auditPersona();
  const comp = renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds' });
  const lands = renderRealEstateTabHtml(S, { ...ui, reSub: 'lands' });
  const c = countDeadListings(comp, 'buy-compound-unit');
  const l = countDeadListings(lands, 'buy-land');
  console.log(`compounds dead: ${c.dead}/${c.total} (baseline 28/28) | lands dead: ${l.dead}/${l.total} (baseline 24/24)`);
  check('compounds: 0 dead listings', c.total === 28 && c.dead === 0, JSON.stringify(c));
  check('lands: 0 dead listings', l.total === 24 && l.dead === 0, JSON.stringify(l));
  check('compounds: every row offers save-for-this', (comp.match(/data-action="save-for-listing"/g) || []).length === 56, `got ${(comp.match(/data-action="save-for-listing"/g) || []).length}`);
  check('lands: every row offers save-for-this', (lands.match(/data-action="save-for-listing"/g) || []).length === 48, `got ${(lands.match(/data-action="save-for-listing"/g) || []).length}`);
  check('compounds: every row offers compare', (comp.match(/data-action="compare-listing"/g) || []).length === 28, `got ${(comp.match(/data-action="compare-listing"/g) || []).length}`);
  check('lands: every row offers compare', (lands.match(/data-action="compare-listing"/g) || []).length === 24, `got ${(lands.match(/data-action="compare-listing"/g) || []).length}`);
  check('compounds: view-cheaper toggle present', /data-action="toggle-affordable-only"/.test(comp) && /View cheaper/.test(comp));
  check('lands: view-cheaper toggle present', /data-action="toggle-affordable-only"/.test(lands) && /View cheaper/.test(lands));
  check('compounds: within-reach count shown', /within reach/.test(comp));
}

console.log('--- §2 save-for-this creates a staged goal that tracks progress ---');
{
  const S = auditPersona();
  const before = S.goals.length;
  const res = createSaveGoal(S, { kind: 'compound', refId: 'madinaty', label: 'Madinaty', target: 5000000 });
  check('save goal created', res.ok && S.goals.length === before + 1, res.msg || '');
  const g = S.goals.find(x => x.id === 'g_save_compound_madinaty');
  check('save goal is in S.goals with target + stages', !!g && g.target === 5000000 && g.stages.length === 3 && g.kind === 'save_property', JSON.stringify(g && { target: g.target, stages: g.stages.length }));
  check('save goal reuses the staged-goal shape (label + check keys)', !!g && g.stages.every(st => st.label && st.check), '');
  // Progress tracks live liquid funds: 607,000 of 5,000,000 = 12%.
  const stages = goalStageProgress(S, g);
  check('stages read live funds (none done at 12%)', stages.every(st => st.state !== 'done') && stages[0].state === 'current', JSON.stringify(stages.map(s => s.state)));
  S.money.savings = 2000000; // liquid now 2,607,000 — over half
  const stages2 = goalStageProgress(S, g);
  check('stages advance as savings grow (quarter + half done)', stages2[0].state === 'done' && stages2[1].state === 'done' && stages2[2].state === 'current', JSON.stringify(stages2.map(s => s.state)));
  check('duplicate save-for-this refused, no second goal', !createSaveGoal(S, { kind: 'compound', refId: 'madinaty', label: 'Madinaty', target: 5000000 }).ok && S.goals.filter(x => x.id === 'g_save_compound_madinaty').length === 1);
  // Deposit goal is a separate staged goal with the deposit as target.
  const dep = createSaveGoal(S, { kind: 'compound', refId: 'madinaty', label: 'Madinaty', target: 500000, deposit: true });
  check('set-a-goal creates a deposit goal', dep.ok && S.goals.some(x => x.id === 'g_save_deposit_compound_madinaty' && x.target === 500000), dep.msg || '');
  // Goal completes when liquid funds reach the target.
  S.money.cash = 5000000; S.money.savings = 0;
  refreshGoalsProgress(S);
  check('save goal marked done when funds reach the price', g.done === true, `done=${g.done} liquid=${liquidFundsLocal(S)}`);
  // The goal shows on the Timeline goals card.
  const life = renderLifeTabHtml(S);
  check('save goal renders on the Timeline goals card', life.includes('Save for Madinaty') && life.includes('Life Goals'));
}

console.log('--- §3 view-cheaper filters to affordable listings ---');
{
  const S = auditPersona();
  const funds = affordableFundsLocal(S);
  const cap = loanCapacityLocal(S);
  console.log(`affordable funds: ${funds} (liquid ${liquidFundsLocal(S)} + loan capacity ${cap})`);
  check('loan capacity is a real number from the bank loan scale', Number.isFinite(cap) && cap >= 0, `cap=${cap}`);
  const comp = renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds', reAffordableOnly: true });
  const c = countDeadListings(comp, 'buy-compound-unit');
  check('view-cheaper shows fewer listings than the full catalogue', c.total < 28, `shown=${c.total}`);
  check('view-cheaper still shows 0 dead listings', c.dead === 0, JSON.stringify(c));
  // Every shown listing's down payment fits the affordable funds: read the
  // down payment off each row's save-for-this button (one per row) and
  // check it. When NOTHING fits, the filter names the single cheapest
  // listing instead — that one row honestly exceeds the funds.
  const compRows = String(comp).split('<div class="item-row">').slice(1)
    .filter(r => r.includes('data-action="buy-compound-unit"'));
  const downs = compRows.map(r => Number((r.match(/data-down="(\d+)"/) || [0, 0])[1]));
  check('every shown compound down payment fits affordable funds (or is the named cheapest)', downs.length === c.total && (downs.every(d => d <= funds) || (downs.length === 1 && /Nothing is within reach yet/.test(comp))), `downs=${downs.join(',')} funds=${funds}`);
  const lands = renderRealEstateTabHtml(S, { ...ui, reSub: 'lands', reAffordableOnly: true });
  const l = countDeadListings(lands, 'buy-land');
  const landRows = String(lands).split('<div class="item-row">').slice(1)
    .filter(r => r.includes('data-action="buy-land"'));
  const prices = landRows.map(r => Number((r.match(/data-full="(\d+)"/) || [0, 0])[1]));
  check('every shown land price fits affordable funds (or is the named cheapest)', l.total <= 24 && l.dead === 0 && prices.length === l.total && (prices.every(p => p <= funds) || (prices.length === 1 && /Nothing is within reach yet/.test(lands))), `shown=${l.total} prices=${prices.join(',')} funds=${funds}`);
  // Turning the filter off restores the full catalogue.
  const compAll = renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds', reAffordableOnly: false });
  check('filter off restores all 28 compounds', countDeadListings(compAll, 'buy-compound-unit').total === 28);
  // Mid-wealth player: the filter really filters — several shown, all fitting.
  const rich = auditPersona();
  rich.money.cash = 2000000; rich.money.savings = 0;
  const richFunds = affordableFundsLocal(rich);
  const richComp = renderRealEstateTabHtml(rich, { ...ui, reSub: 'compounds', reAffordableOnly: true });
  const richRows = String(richComp).split('<div class="item-row">').slice(1)
    .filter(r => r.includes('data-action="buy-compound-unit"'));
  const richDowns = richRows.map(r => Number((r.match(/data-down="(\d+)"/) || [0, 0])[1]));
  console.log(`rich persona: funds ${richFunds}, shown ${richRows.length} of 28`);
  check('rich view-cheaper shows several but not all listings', richRows.length > 1 && richRows.length < 28, `shown=${richRows.length}`);
  check('rich view-cheaper: every shown down payment fits funds', richDowns.length === richRows.length && richDowns.every(d => d <= richFunds), `max down=${Math.max(...richDowns)} funds=${richFunds}`);
  check('rich view-cheaper shows no cheapest-fallback note', !/Nothing is within reach yet/.test(richComp));
}

console.log('--- §4 compare renders two listings side by side ---');
{
  const S = auditPersona();
  const compHtml = renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds' });
  const firstTwo = [...compHtml.matchAll(/data-action="compare-listing" data-kind="compound" data-ref="([^"]+)"/g)].map(m => m[1]).slice(0, 2);
  check('two compound refs found to compare', firstTwo.length === 2, firstTwo.join(','));
  const compared = renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds', reCompare: firstTwo.map(r => `compound:${r}`) });
  check('compare table renders', /Comparing two listings/.test(compared));
  const landHtml = renderRealEstateTabHtml(S, { ...ui, reSub: 'lands' });
  const landRef = [...landHtml.matchAll(/data-action="compare-listing" data-kind="land" data-ref="([^"]+)"/g)].map(m => m[1])[0];
  const mixed = renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds', reCompare: [`compound:${firstTwo[0]}`, `land:${landRef}`] });
  check('compare table shows price, size, location, running costs', /Price/.test(mixed) && /Size/.test(mixed) && /Location/.test(mixed) && /Running cost/.test(mixed) && /m²/.test(mixed));
  check('compare table names both listings', mixed.includes('Comparing two listings') && /Clear compare/.test(mixed));
  check('compare toggle marks a selected listing', /✓ Comparing/.test(compared));
  const cleared = renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds', reCompare: [] });
  check('empty compare selection renders no table', !/Comparing two listings/.test(cleared));
}

console.log('--- §5 dead buttons: school + room-info ---');
{
  const viewsSrc = readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8');
  const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const engineSrc = readFileSync(new URL('../src/ui/visualEngine3d.js', import.meta.url), 'utf8');
  // (a) School years over: no <button> may carry that text any more.
  check('no disabled "School years over" button', !/>School years over<\/button>/.test(viewsSrc), `matches=${(viewsSrc.match(/>School years over<\/button>/g) || []).length}`);
  check('no disabled "Starts at 6" button', !/>Starts at 6<\/button>/.test(viewsSrc), `matches=${(viewsSrc.match(/>Starts at 6<\/button>/g) || []).length}`);
  const S = auditPersona();
  const edu = renderEducationTabHtml(S, {});
  check('education render at 18+ has 0 disabled school buttons', (edu.match(/<button[^>]*disabled[^>]*>/g) || []).filter(b => /School years over|Starts at 6/.test(b)).length === 0);
  check('education render still says school years are over (plain text)', (edu.match(/School years over/g) || []).length === 12);
  // (b) room-info: the handler must open a real detail, not an info toast.
  check('room-info handler opens a room detail record', /action === 'room-info'/.test(mainSrc) && /uiState\.roomDetail\s*=/.test(mainSrc));
  check('room-info info-only toast is gone', !/roomInfoMessage\(btn\.dataset\.room/.test(mainSrc));
  check('room-info buttons carry the detail data', /data-name=/.test(engineSrc) && /data-m2=/.test(engineSrc) && /data-floor=/.test(engineSrc));
  check('room detail card renders with a close action', /data-action="close-room-detail"/.test(viewsSrc) && /Room \$\{esc\(d\.no/.test(viewsSrc));
  // Render the detail card: My Home with a selected hallway room. The
  // player owns the villa, so the floor plan (and the card under it) renders.
  const S2 = auditPersona();
  S2.housing.mode = 'owned';
  S2.housing.currentHomeId = 'prop_test';
  S2.housing.currentHomeName = 'Test Villa';
  S2.housing.properties = [{ id: 'prop_test', name: 'Test Villa', country: 'egy', city: 'Cairo', shape: 'villa', areaM2: 200, finishing: 'standard', rooms: 4, furnishedRooms: {}, upgrades: [], valueLocal: 1000000, conditionPct: 100 }];
  const myHome = renderRealEstateTabHtml(S2, { ...ui, reSub: 'myhome', roomDetail: { key: 'corridor', no: '103', name: 'Private Gallery Corridor', m2: 14, floor: 'Ground floor' } });
  check('room detail card shows number, name, size and floor', /Room 103 — Private Gallery Corridor/.test(myHome) && /14 m²/.test(myHome) && /Ground floor/.test(myHome) && /hallway/.test(myHome));
}

console.log(`\nv212-w1-verify: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
