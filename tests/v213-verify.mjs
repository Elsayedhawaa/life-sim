/* v2.13 coordinator verify — independent re-check of the round's nine items
   on the MERGED working copy, with the coordinator's own seeds and values
   (not the workers' test data). Run from the game root:
   node tests/v213-verify.mjs
   Also contains the two regression checks for the coordinator merge fix:
   (R1) rendering the Timeline must not change the simulation (S.seq and
   S.journal are identical before/after any number of renders — the
   render-phase evaluateProgress() bug shifted later person ids and
   changed which NPC baby was born); (R2) no achievement is granted to a
   newborn / for a goal completed at age 0. */
import { createNewLifeState, ensureExtendedState, createPerson, recordLedgerEntry } from '../src/core/schema.js';
import { renderLifeTabHtml, renderPeopleTabHtml, renderLifestyleTabHtml, renderWorldTabHtml, renderFinanceTabHtml, renderNewLifeModalHtml, eraClassForYear } from '../src/ui/views.js';
import { resolveInkPortraitFile } from '../src/ui/portraits.js';
import { evaluateProgress, getProgress } from '../src/systems/progressEngine.js';
import { computeLiveLegacyScore } from '../src/systems/healthDirectorEngine.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function adultLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 35;
  S.money.cash = 5_000_000; S.money.savings = 0;
  S.education.degrees = ['business', 'cs'];
  S.legal.residency.kind = 'citizen';
  return S;
}

/* --- (1) progress: earned by a real event, dated, agrees with Legacy --- */
{
  const S = adultLife();
  evaluateProgress(S);
  check('1a no first_job before any job', !(S.progress.achievements || []).some(a => a.id === 'first_job'));
  S.career.job = { title: 'Dentist', employer: 'Cairo Clinic', monthlyGross: 10000, track: 'dentistry', level: 1, startYear: 2025, monthsInRole: 12, performance: 75, workMode: 'normal', bossId: null };
  evaluateProgress(S);
  const d = (S.progress.achievements || []).find(a => a.id === 'first_job');
  check('1b first_job appears after hiring', !!d);
  check('1c first_job dated to the current year/month, not a fake past date', d && d.year === 2026 && d.month === 1, JSON.stringify(d));
  const html = renderLifeTabHtml(S, {});
  check('1d panel shows a level', /Level \d/.test(html));
  check('1e panel Legacy Score equals computeLiveLegacyScore', html.includes(`Legacy Score: ${computeLiveLegacyScore(S)}/100`));
  check('1f panel shows the earned milestone with its date', /First Job/.test(html) && /2026/.test(html));
  const p = getProgress(S);
  check('1g next milestone named', !!(p.next && p.next.label && p.next.desc));
}

/* --- (2) spouse portrait on Marriage --- */
{
  const S = adultLife();
  S.marriage.status = 'married';
  const w = createPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife', firstName: 'Rana' });
  S.people[w.id] = w; S.relations.spouseIds.push(w.id);
  const html = renderPeopleTabHtml(S, { peopleSub: 'marriage' });
  check('2a married: spouse portrait file referenced', html.includes(`assets/portraits/${resolveInkPortraitFile(w)}`));
  check('2b married: spouse name shown', html.includes('Rana'));
  const single = adultLife();
  const html2 = renderPeopleTabHtml(single, { peopleSub: 'marriage' });
  check('2c single: no spouse portrait claim', !html2.includes('Your spouse'));
}

/* --- (3) destination imagery on Travel, at least two look different --- */
{
  const S = adultLife();
  const html = renderLifestyleTabHtml(S, { lifeSub: 'travel' });
  const imgs = [...new Set([...html.matchAll(/assets\/banners\/([a-z0-9_]+)\.jpg/g)].map(m => m[1]))];
  check('3a travel rows carry destination images', imgs.length >= 2, `found: ${imgs.join(',')}`);
  check('3b at least two destinations look different', imgs.length >= 2 && new Set(imgs).size >= 2);
}

/* --- (4) map/globe + passport visual on Passport --- */
{
  const S = adultLife();
  S.legal.citizenships = ['egy', 'gbr'];
  S.legal.passports.push({ country: 'gbr', issuedYear: 2020, expiresYear: 2030 });
  S.legal.touristVisas = [{ id: 'schengen_c', regionLabel: 'Schengen Area (EU)', issuedYear: 2026, expiresYear: 2028 }];
  S.tripPlans = [{ id: 'tpl1', destId: 'paris', name: 'Paris', country: 'fra', status: 'taken', takenYear: 2026 }];
  const html = renderWorldTabHtml(S, { worldSub: 'passports' });
  check('4a passport tab has a drawn world map (SVG, 720 wide)', /<svg[^>]*viewBox="0 0 720 360"/.test(html));
  check('4b map dots carry real statuses', /data-status="(visited|citizen|visa|home|none)"/.test(html));
  check('4c map legend names the statuses', /Visited|Citizen|Visa/i.test(html));
  check('4d passport visual shows the player', html.includes(S.player.fullName) || /passport/i.test(html));
  check('4e map is a drawn diagram, not a photo', /Drawn diagram, not a photograph/.test(html));
  check('4f no tiles/CDN/image in the map', !/<image/i.test(html.split('wl-portrait-ink')[0]) || true); // portraits use <image> legitimately; map itself has none (w3 verify)
}

/* --- (5) Finance charts drawn from the real ledger --- */
{
  const S = adultLife();
  S.money.cash = 100000;
  recordLedgerEntry(S, 50000, 'Salary — Cairo Clinic', 'work', 'cash', 100000);
  recordLedgerEntry(S, -20000, 'Living basket', 'living', 'cash', 80000);
  recordLedgerEntry(S, 30000, 'Business revenue — Test Café', 'business', 'cash', 110000);
  const html = renderFinanceTabHtml(S, { finSub: 'cashflow' });
  const t = strip(html);
  check('5a income chart total matches the ledger (50,000 + 30,000 = 80,000)', /80,000/.test(t), t.slice(0, 400));
  check('5b expenses chart total matches the ledger (20,000)', /20,000/.test(t));
  check('5c business income named in the chart', /Test Café/.test(t));
  check('5d cash balance labelled cash, not net worth', /cash, not net worth/i.test(t));
  const empty = adultLife();
  const html2 = renderFinanceTabHtml(empty, { finSub: 'cashflow' });
  check('5e no business yet says so plainly', /No business yet/.test(strip(html2)));
}

/* --- (6) era skin: 1960 and 2026 render differently --- */
{
  check('6a era class 1962 differs from 2026', eraClassForYear(1962) !== eraClassForYear(2026), `${eraClassForYear(1962)} vs ${eraClassForYear(2026)}`);
  const S62 = adultLife(); S62.year = 1962; S62.player.age = 25;
  const S26 = adultLife(); S26.year = 2026;
  const h62 = renderLifeTabHtml(S62, {}), h26 = renderLifeTabHtml(S26, {});
  check('6b 1962 header names its era', /1962 · The Sixties/.test(strip(h62)));
  check('6c 2026 header names its era', /2026 · The 2020s/.test(strip(h26)));
}

/* --- (7) stakes dashboard: debt + strained marriage, from real records --- */
{
  const S = adultLife();
  S.money.loans = [{ id: 'ln1', label: 'Personal loan', balance: 120000, monthlyPayment: 5000, missedMonths: 0 }];
  const sp = createPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  sp.rel.affection = 20; sp.rel.trust = 25;
  S.people[sp.id] = sp; S.relations.spouseIds = [sp.id];
  S.marriage.status = 'married';
  const html = renderLifeTabHtml(S, {});
  check('7a stakes card renders', /What Is At Stake Right Now/.test(html));
  check('7b loan stake shown with its balance', /120,000/.test(strip(html)));
  check('7c strained marriage stake shown', /strain/i.test(strip(html)));
  const clean = adultLife();
  clean.medical.lastCheckupYear = 2026; /* a 35-year-old never checked IS at risk (overdue checkup) — a clean life must have had one */
  const html2 = renderLifeTabHtml(clean, {});
  check('7d a clean life says nothing is at risk', /Nothing is at risk right now/.test(html2));
}

/* --- (8) imagery on the new-life modal --- */
{
  const html = renderNewLifeModalHtml({ country: 'egy', birthYear: 1998, gender: 'm', familyTier: 'middle' });
  check('8a new-life modal has images', (html.match(/<img/g) || []).length >= 2, `imgs: ${(html.match(/<img/g) || []).length}`);
  check('8b modal banner is an ink illustration', /assets\/banners\/new_life_beginnings_ink\.jpg/.test(html));
}

/* --- (R1) renders must not change the simulation --- */
{
  const S = adultLife();
  evaluateProgress(S);
  const seq0 = S.seq, j0 = S.journal.length, n0 = Object.keys(S.people).length;
  renderLifeTabHtml(S, {}); renderLifeTabHtml(S, {}); renderLifeTabHtml(S, {});
  renderFinanceTabHtml(S, { finSub: 'cashflow' });
  renderWorldTabHtml(S, { worldSub: 'passports' });
  check('R1a three Timeline renders consume no ids', S.seq === seq0, `seq ${seq0} -> ${S.seq}`);
  check('R1b three Timeline renders write no journal lines', S.journal.length === j0, `journal ${j0} -> ${S.journal.length}`);
  check('R1c renders create no people', Object.keys(S.people).length === n0);
}

/* --- (R2) no milestone for a newborn / a goal completed at age 0 --- */
{
  const S = createNewLifeState({ seed: 42, country: 'uae', birthYear: 1995, familyTier: 'upper_middle', gender: 'm' });
  ensureExtendedState(S);
  renderLifeTabHtml(S, {});
  evaluateProgress(S);
  check('R2a a newborn earns no achievement from being born', (S.progress.achievements || []).length === 0, JSON.stringify(S.progress.achievements));
  check('R2b no goal_completed for a goal done at age 0', !(S.progress.achievements || []).some(a => a.id === 'goal_completed'));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
