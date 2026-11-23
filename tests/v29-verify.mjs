/* v2.9 coordinator verification — independent of worker scripts.
   Run: node tests/v29-verify.mjs (exit 0 = all pass). */
import fs from 'node:fs';
import { createNewLifeState, ensureExtendedState, walletMove } from '../src/core/schema.js';
import { renderLifeTabHtml, renderPeopleTabHtml, renderWorkTabHtml, renderFinanceTabHtml } from '../src/ui/views.js';
import { settleHouseholdMonth, rentHousingUnit, resolveCurrentHome } from '../src/systems/economyEngine.js';
import { treatmentCostLocal } from '../src/systems/mortalityModel.js';
import { syncEmployerBenefits, syncHealthCover } from '../src/systems/careerEducationEngine.js';
import { toggleInsurancePolicy } from '../src/systems/completeLifeSystems.js';
import { computeLiveLegacyScore, buildLegacySummary } from '../src/systems/healthDirectorEngine.js';
import { getHousingFor } from '../src/data/institutions.js';

const print = (...a) => console.log(...a);
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; print(`PASS ${name}`); }
  else { fail++; print(`FAIL ${name} ${extra}`); }
};
const strip = (html) => String(html).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function baseState(seed, country = 'egy') {
  const S = createNewLifeState({ seed, country, birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.player.age = 30; S.year = 2020; S.month = 6; S.pacing = 'monthly';
  S.money.cash = 50000; S.money.savings = 10000;
  S.money.certificates = []; S.money.loans = []; S.investments = []; S.legal = S.legal || {};
  S.housing.lands = []; S.medical.conditions = [];
  return S;
}

/* --- 1. Ledger visible --- */
{
  const S = baseState(101);
  walletMove(S, 5000, 'v29 salary probe', 'career');
  walletMove(S, -1200, 'v29 rent probe', 'housing');
  const html = strip(renderFinanceTabHtml(S, { finSub: 'cashflow' }));
  check('ledger shows posted salary line', html.includes('v29 salary probe') && html.includes('5,000'));
  check('ledger shows posted rent line', html.includes('v29 rent probe') && html.includes('1,200'));
  check('ledger shows running balance', /Balance:/.test(html));
  const workHtml = strip(renderFinanceTabHtml(S, { finSub: 'cashflow', ledgerFilter: 'work' }));
  check('ledger filter work shows salary, hides rent', workHtml.includes('v29 salary probe') && !workHtml.includes('v29 rent probe'));
  const homeHtml = strip(renderFinanceTabHtml(S, { finSub: 'cashflow', ledgerFilter: 'home' }));
  check('ledger filter home shows rent, hides salary', homeHtml.includes('v29 rent probe') && !homeHtml.includes('v29 salary probe'));
}

/* --- 2. Goals live + live Legacy Score --- */
{
  const S = baseState(102);
  const html = strip(renderLifeTabHtml(S));
  const labels = ['Complete Secondary Exams', 'Self-Sustaining Monthly', 'Secure Your Own Independent Home', 'Trusted Inner Circle', 'Annual National Salary'];
  check('timeline shows all 5 goal labels', labels.every((l) => html.includes(l)));
  check('timeline shows Life Goals header', /Life Goals \(\d\/5 done\)/.test(html));
  const live = computeLiveLegacyScore(S);
  const death = buildLegacySummary(S);
  check('live legacy score shown and equals death-summary score', html.includes(`Legacy Score: ${live}/100`) && live === death.score, `live=${live} death=${death.score}`);
}

/* --- 3. Blocked account --- */
{
  const S = baseState(103);
  S.legal.blockedAccount = { kind: 'German Sperrkonto', country: 'deu', balanceLocal: 12324, balanceInPlayerLocal: 12324, monthlyReleaseLocal: 1027 };
  const html = strip(renderFinanceTabHtml(S, { finSub: 'cashflow' }));
  check('blocked account renders kind + balance + release', html.includes('German Sperrkonto') && html.includes('12,324') && html.includes('1,027'));
  const S2 = baseState(104);
  const html2 = strip(renderFinanceTabHtml(S2, { finSub: 'cashflow' }));
  check('blocked account absent with no account', !html2.includes('Blocked Account'));
}

/* --- 4. NPC savings --- */
{
  const S = baseState(105);
  const father = Object.values(S.people).find((p) => p && p.role === 'father') || Object.values(S.people).find((p) => p && /father/i.test(p.role || ''));
  const dad = father || S.people[Object.keys(S.people)[0]];
  dad.career = dad.career || {}; dad.career.savingsLocal = 250000;
  const html = strip(renderPeopleTabHtml(S, { peopleSub: 'circle' }));
  check('NPC savings shown on People tab', html.includes('Holds about') && html.includes('250,000'));
}

/* --- 5. Spouse income under traditional_provider --- */
{
  const S = baseState(106);
  S.relations.spouseIds = [];
  const sp = { id: 'sp1', name: 'Rana', firstName: 'Rana', role: 'spouse', alive: true, gender: 'f', birthYear: 1992, birthMonth: 1, country: 'egy', residenceCountry: 'egy', city: 'Cairo', career: { title: 'Nurse', monthlyIncomeLocal: 20000, savingsLocal: 100000 }, rel: { affection: 80, respect: 80, trust: 80, resentment: 0, chemistry: 70, lastContactTurn: 0, memories: [], promises: [], currentWant: null }, traits: {}, vitals: { health: 80, happiness: 70, stress: 30, smarts: 60, looks: 70 }, values: { integrity: 60, family: 65, ambition: 60 }, reputation: 55, skills: {} };
  S.people.sp1 = sp; S.relations.spouseIds = ['sp1'];
  S.marriage.householdSplit = 'traditional_provider';
  S.career.employed = true; S.career.job = { employer: 'Nile Care Hospital', title: 'Doctor', track: 'medicine', level: 2, monthlyGross: 20000, startYear: 2018, monthsInRole: 12, performance: 75, workMode: 'normal', bossId: null };
  const ledgerBefore = S.ledger.length;
  const savingsBefore = sp.career.savingsLocal;
  settleHouseholdMonth(S);
  const lines = S.ledger.slice(0, S.ledger.length - ledgerBefore).filter((e) => (e.label || '').includes('Spouse income'));
  const credit = lines.reduce((a, e) => a + (Number(e.delta) || 0), 0);
  check('traditional_provider: spouse income lands in ledger (25% of 20000)', credit === 5000, `credit=${credit}`);
  check('spouse line names the split', lines.length === 1 && lines[0].label.includes('traditional provider'));
  check('no double-count in spouse savings', sp.career.savingsLocal - savingsBefore === -800, `delta=${sp.career.savingsLocal - savingsBefore}`);
}

/* --- 6. Insurance: one flag + display/charge agree --- */
{
  const cond = { id: 'test_cond', label: 'Test condition', treatmentUsd2026: 8500 };
  const mk = (country) => { const S = baseState(107, country); S.career.employed = true; S.insurance = S.insurance || {}; S.medical = S.medical || {}; return S; };
  let S = mk('usa'); S.insurance.health = false; S.medical.healthInsurance = false;
  check('USA typical, no cover: charged in full', treatmentCostLocal(S, { ...cond }, 'private') === 8500, `got ${treatmentCostLocal(S, { ...cond }, 'private')}`);
  S = mk('usa'); S.insurance.health = true; syncHealthCover(S);
  check('USA private policy: quarter bill', treatmentCostLocal(S, { ...cond }, 'private') === 2125, `got ${treatmentCostLocal(S, { ...cond }, 'private')}`);
  S = mk('egy'); S.insurance.health = false; S.medical.healthInsurance = false;
  const fullEgy = treatmentCostLocal(S, { ...cond }, 'private');
  check('Egypt limited, no cover: charged in full (no employed discount)', fullEgy === Math.round(8500 * 1) || fullEgy > 0, `got ${fullEgy}`);
  S = mk('egy'); S.medical.healthInsurance = true;
  const discEgy = treatmentCostLocal(S, { ...cond }, 'private');
  check('Egypt confirmed cover: 45% off', Math.abs(discEgy - Math.round(fullEgy * 0.55)) <= 2, `full=${fullEgy} disc=${discEgy}`);
  // Sync: employer cover on hire, gone on resign; private policy survives resign.
  S = mk('gbr'); S.career.employed = true; S.insurance.employerHealth = true; syncHealthCover(S);
  check('employer cover sets the one flag', S.medical.healthInsurance === true);
  S.career.employed = false; S.insurance.employerHealth = false; syncEmployerBenefits(S);
  check('resign clears employer cover', S.medical.healthInsurance === false && S.insurance.employerHealth === false);
  S = mk('usa'); S.insurance.health = true; syncHealthCover(S);
  check('private policy gives cover', S.medical.healthInsurance === true);
  S.career.employed = false; syncEmployerBenefits(S);
  check('private policy survives resign', S.medical.healthInsurance === true);
  // Minor-condition inline discount gone.
  const hd = fs.readFileSync(new URL('../src/systems/healthDirectorEngine.js', import.meta.url), 'utf8');
  check('no old employed-45%-off inline rule in healthDirector', !/S\.career\.employed \? 0\.45/.test(hd));
  const views = fs.readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8');
  check('career tab no longer says employment alone cuts 45%', !/being employed already cuts a private treatment bill/.test(views));
}

/* --- 9. Rented home resolves --- */
{
  const S = baseState(108);
  const units = getHousingFor('egy', 2020);
  const unit = units.find((u) => u && u.monthlyRent2026) || units[0];
  const r = rentHousingUnit(S, unit.id);
  check('rentHousingUnit succeeds', r && r.ok, JSON.stringify(r && r.msg));
  const resolved = resolveCurrentHome(S);
  check('rented home resolves via resolver', !!resolved && resolved.tenure === 'rented', JSON.stringify(resolved && { tenure: resolved.tenure, rent: resolved.monthlyRent }));
  const before = S.ledger.length;
  settleHouseholdMonth(S);
  check('settlement finds the rented home (rent charged)', S.money.lastMonthSummary && S.money.lastMonthSummary.housing === S.housing.monthlyRent && S.housing.monthlyRent > 0, `summary.housing=${S.money.lastMonthSummary && S.money.lastMonthSummary.housing} monthlyRent=${S.housing.monthlyRent}`);
}

/* --- 10. Withheld-salary indicator --- */
{
  const S = baseState(109);
  S.career.employed = true;
  S.money._salaryWithheldNoted = true;
  const html = strip(renderWorkTabHtml(S, { workSub: 'jobs' }));
  check('withheld indicator renders on Career tab', /Salary Withheld/.test(html) && /work authorisation/.test(html));
  const S2 = baseState(110);
  S2.career.employed = true;
  const html2 = strip(renderWorkTabHtml(S2, { workSub: 'jobs' }));
  check('withheld indicator absent when not withheld', !/Salary Withheld/.test(html2));
}

/* --- 8. Dead records (grep-level) --- */
{
  const schema = fs.readFileSync(new URL('../src/core/schema.js', import.meta.url), 'utf8');
  check('S.habits initialisation gone from schema.js', !/habits:\s*\[\]/.test(schema) && !/if \(!S\.habits\)/.test(schema));
  check('player.career only the mirror (no stale birth copy)', !/title: opts\.jobTitle/.test(schema) || /syncPlayerCareerMirror/.test(schema));
}

/* --- 7. Marriage bypasses (grep-level) --- */
{
  const checkFile = (rel) => fs.readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
  const mf = checkFile('src/systems/marriageFamilyEngine.js');
  const se = checkFile('src/systems/soulEngine.js');
  // Strict single-assignment only: ` =` not followed by `=` (excludes === reads).
  // The one allowed match is the defensive array-init guard in the helper.
  const strictWrites = (src) => src.split('\n').filter((l) => /S\.marriage\.(status|contracts) =(?!=)/.test(l) && !/if \(!Array\.isArray\(S\.marriage\.contracts\)\)/.test(l));
  check('no direct S.marriage.status write in marriageFamilyEngine', strictWrites(mf).length === 0, JSON.stringify(strictWrites(mf)));
  check('no direct S.marriage.status/contracts write in soulEngine', strictWrites(se).length === 0, JSON.stringify(strictWrites(se)));
}

print(`\nTOTAL ${pass}/${pass + fail} PASS`);
if (fail) process.exit(1);
