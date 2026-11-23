/* v2.12 Worker 4 — Item 5 (honest second-wife label) + Item 7 (wired perks).
   Run from the game dir: node tests/v212-w4-verify.mjs — exits non-zero on any FAIL. */
import { readFileSync } from 'node:fs';
import { createNewLifeState, createPerson, ensureExtendedState } from '../src/core/schema.js';
import { renderPeopleTabHtml, renderWorkTabHtml, renderFinanceTabHtml, renderLifestyleTabHtml } from '../src/ui/views.js';
import { introducePartnerProspect, additionalSpousePath } from '../src/systems/marriageFamilyEngine.js';
import { staffLoanTerms, staffTreatmentEligible } from '../src/systems/careerEducationEngine.js';
import { takeStaffLoan, takePersonalLoan } from '../src/systems/economyEngine.js';
import { treatmentCostLocal, runDiseaseTreatment, isSeriousCondition } from '../src/systems/mortalityModel.js';
import { getMarriageProfile } from '../src/data/visasAndMarriage.js';
import { formatMoney } from '../src/data/countries.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function adultLife({ country = 'egy', gender = 'm', religion = 'muslim' } = {}) {
  const S = createNewLifeState({ seed: 777, country, birthYear: 1990, familyTier: 'middle', gender, religion });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 36;
  S.money.cash = 5_000_000;
  S.money.creditScore = 700;
  S.legal.residency.kind = 'citizen';
  S.insurance = { health: false, auto: false, home: false, employerHealth: false };
  if (S.medical) S.medical.healthInsurance = false;
  return S;
}
function marry(S, spouseGender = 'f') {
  const spouse = createPerson(S, { age: 32, gender: spouseGender, role: 'spouse', relationLabel: spouseGender === 'f' ? 'Wife' : 'Husband' });
  S.people[spouse.id] = spouse;
  S.relations.spouseIds = [spouse.id];
  S.marriage.status = 'married';
  return spouse;
}
function employ(S, track, employer) {
  S.career.employed = true;
  S.career.job = { employer, title: 'Staff', track, level: 2, monthlyGross: 60000, startYear: 2024, monthsInRole: 12, performance: 70, workMode: 'normal', bossId: null };
}

/* ================= Item 5 — honest second-wife label ================= */
console.log('--- item 5: second-wife label ---');
{
  const S = adultLife({ country: 'egy', gender: 'm', religion: 'muslim' });
  const wife = marry(S, 'f');
  const html = strip(renderPeopleTabHtml(S, { peopleSub: 'marriage' }));
  check('5a married egy muslim man: "Meet a second wife" label present (work channel)',
    html.includes('Meet a second wife — through work / social circle'), html.slice(0, 400));
  check('5b married egy muslim man: "Meet a second wife" label present (family channel)',
    html.includes('Meet a second wife — traditional family / Salonat match'));
  check('5c married egy muslim man: law + first wife position stated',
    html.includes('permits a second marriage') && html.includes('can ask for a divorce') && html.includes(wife.firstName),
    html.slice(0, 600));
  check('5d married egy muslim man: engine allows the path',
    additionalSpousePath(S, getMarriageProfile('egy', 2026)).allowed === true);
  const prospect = introducePartnerProspect(S, 'social');
  check('5e married egy muslim man: engine opens a prospect (second wife)', prospect.ok === true, prospect.msg || '');
}
{
  // Single man in Egypt: old labels, no second-wife wording anywhere.
  const S = adultLife({ country: 'egy', gender: 'm', religion: 'muslim' });
  const html = strip(renderPeopleTabHtml(S, { peopleSub: 'marriage' }));
  check('5f single egy man: old labels kept, no second-wife path offered',
    html.includes('Meet Through Work / Social Circle') && html.includes('Traditional Family / Salonat Match') && !html.includes('second wife'));
}
{
  // Polygamy-forbidden 1: married Muslim man in Britain.
  const S = adultLife({ country: 'gbr', gender: 'm', religion: 'muslim' });
  marry(S, 'f');
  const html = strip(renderPeopleTabHtml(S, { peopleSub: 'marriage' }));
  check('5g married gbr muslim man: no second-wife path offered in the render', !html.includes('second wife'));
  check('5h married gbr muslim man: engine refuses a new prospect',
    introducePartnerProspect(S, 'social').ok === false);
  check('5i married gbr muslim man: engine says not allowed',
    additionalSpousePath(S, getMarriageProfile('gbr', 2026)).allowed === false);
}
{
  // Polygamy-forbidden 2: married Muslim woman in Egypt.
  const S = adultLife({ country: 'egy', gender: 'f', religion: 'muslim' });
  marry(S, 'm');
  const html = strip(renderPeopleTabHtml(S, { peopleSub: 'marriage' }));
  check('5j married egy muslim woman: no second-wife path offered in the render', !html.includes('second wife'));
  check('5k married egy muslim woman: engine refuses a new prospect',
    introducePartnerProspect(S, 'social').ok === false);
}

/* ================= Item 7a — staff loan is a real loan ================= */
console.log('--- item 7a: staff loan ---');
{
  const S = adultLife({ country: 'egy', gender: 'm', religion: 'muslim' });
  employ(S, 'finance', 'CIB');
  const terms = staffLoanTerms(S);
  check('7a1 finance job: staff loan eligible', terms.eligible === true);
  check('7a2 staff rate is real and below the standard rate',
    terms.staffRate > 0 && terms.staffRate < terms.standardRate,
    `staff=${terms.staffRate} standard=${terms.standardRate}`);
  const workHtml = strip(renderWorkTabHtml(S, { workSub: 'jobs' }));
  check('7a3 work tab names the real staff rate',
    workHtml.includes('Staff rates on loans') && workHtml.includes(`${(terms.staffRate * 100).toFixed(1)}%`) && workHtml.includes(`${(terms.standardRate * 100).toFixed(1)}%`));
  check('7a4 work tab no longer says "not wired"', !workHtml.includes('not wired'));
  const bankHtml = strip(renderFinanceTabHtml(S, { finSub: 'banks' }));
  check('7a5 bank tab offers a Staff Loan row at the staff rate',
    bankHtml.includes('Staff Loan') && bankHtml.includes(`${(terms.staffRate * 100).toFixed(1)}%`));
  const cashBefore = S.money.cash;
  const res = takeStaffLoan(S, 100000, 3, terms.staffRate);
  check('7a6 staff loan books', res.ok === true, res.msg || '');
  const loan = S.money.loans[0];
  check('7a7 booked loan carries the staff rate (not the standard rate)',
    !!loan && loan.annualRate === terms.staffRate && loan.annualRate < terms.standardRate,
    loan ? `rate=${loan.annualRate}` : 'no loan');
  check('7a8 booked loan is labelled a Staff Loan', !!loan && /Staff Loan/.test(loan.label), loan?.label || '');
  check('7a9 disbursement reached cash', S.money.cash === cashBefore + 100000, `${cashBefore} -> ${S.money.cash}`);
  check('7a10 staff loan monthly payment matches the rate',
    !!loan && loan.monthlyPayment > 0 && loan.monthlyPayment < 100000 * (terms.standardRate / 12) / (1 - Math.pow(1 + terms.standardRate / 12, -36)) + 1,
    loan ? `pay=${loan.monthlyPayment}` : '');
  // A standard loan for the same amount costs more per month.
  const S2 = adultLife({ country: 'egy', gender: 'm', religion: 'muslim' });
  employ(S2, 'finance', 'CIB');
  const std = takePersonalLoan(S2, 100000, 3);
  check('7a11 standard loan for the same amount costs more per month than the staff loan',
    std.ok && S2.money.loans[0].monthlyPayment > loan.monthlyPayment,
    `std=${S2.money.loans[0]?.monthlyPayment} staff=${loan.monthlyPayment}`);
}
{
  // Non-bank job: no staff loan anywhere, and a direct booking is refused.
  const S = adultLife({ country: 'egy', gender: 'm', religion: 'muslim' });
  employ(S, 'software', 'ITWorx');
  check('7a12 software job: staff loan not eligible', staffLoanTerms(S).eligible === false);
  const bankHtml = strip(renderFinanceTabHtml(S, { finSub: 'banks' }));
  check('7a13 software job: bank tab offers no Staff Loan row', !bankHtml.includes('Staff Loan'));
  const res = takeStaffLoan(S, 100000, 3, 0.05);
  check('7a14 software job: direct staff-loan booking refused', res.ok === false, res.msg || '');
}

/* ================= Item 7b — staff hospital treatment ================= */
console.log('--- item 7b: staff hospital treatment ---');
{
  const S = adultLife({ country: 'egy', gender: 'm', religion: 'muslim' });
  employ(S, 'medicine', 'Nile Care Hospital');
  check('7b1 medicine job: staff treatment eligible', staffTreatmentEligible(S) === true);
  const cond = { id: 'heart_disease', label: 'Heart disease', treatmentUsd2026: 8500 };
  check('7b2 heart_disease is a serious condition', isSeriousCondition('heart_disease'));
  const staffCost = treatmentCostLocal(S, cond, 'private');
  // Same life, non-hospital job, no cover at all: the full bill.
  S.career.job.track = 'software';
  const fullCost = treatmentCostLocal(S, cond, 'private');
  check('7b3 staff private bill is about a quarter of the full bill',
    staffCost > 0 && Math.abs(staffCost * 4 - fullCost) <= 2, `staff=${staffCost} full=${fullCost}`);
  check('7b4 without the hospital job the full bill is charged', fullCost > staffCost * 3);
  // Charge path: a real treatment course takes exactly the staff price.
  S.career.job.track = 'medicine';
  const entry = { id: 'heart_disease', label: 'Heart disease', treatmentUsd2026: 8500, treatmentStatus: 'untreated', sinceYear: 2026, managed: false, chronic: true };
  S.medical.conditions = [entry];
  const expected = treatmentCostLocal(S, entry, 'private');
  S.money.cash = expected + 1000;
  const cashBefore = S.money.cash;
  const r = runDiseaseTreatment(S, 'heart_disease', 'private');
  check('7b5 treatment course runs', r.ok === true, r.msg || '');
  check('7b6 treatment course charged exactly the staff price',
    S.money.cash === cashBefore - expected, `charged=${cashBefore - S.money.cash} expected=${expected}`);
  // Medical tab shows the staff price and says so.
  const medHtml = strip(renderLifestyleTabHtml(S, { lifeSub: 'medical' }));
  check('7b7 medical tab shows the staff price on the Treat button',
    medHtml.includes(`Treat (Private) — ${formatMoney(expected, 'egy')}`), medHtml.slice(0, 300));
  check('7b8 medical tab states the staff-treatment rule',
    medHtml.includes('Staff treatment at your own hospital cuts your own private treatment to about a quarter'));
  const workHtml = strip(renderWorkTabHtml(S, { workSub: 'jobs' }));
  check('7b9 work tab states the wired staff-treatment perk',
    workHtml.includes('Staff treatment at your own hospital') && workHtml.includes('about a quarter'));
  check('7b10 work tab no longer says "not wired"', !workHtml.includes('not wired'));
}
{
  // Non-hospital job, no cover: full bill, and no staff wording.
  const S = adultLife({ country: 'egy', gender: 'm', religion: 'muslim' });
  employ(S, 'software', 'ITWorx');
  check('7b11 software job: staff treatment not eligible', staffTreatmentEligible(S) === false);
  const cond = { id: 'heart_disease', label: 'Heart disease', treatmentUsd2026: 8500 };
  const cost = treatmentCostLocal(S, cond, 'private');
  const S2 = adultLife({ country: 'egy', gender: 'm', religion: 'muslim' });
  S2.insurance.health = true; // private policy: the quarter benchmark
  const policyCost = treatmentCostLocal(S2, cond, 'private');
  check('7b12 no cover, no staff: full bill (4x the private-policy price)',
    Math.abs(cost - policyCost * 4) <= 2, `full=${cost} policy=${policyCost}`);
}

/* ================= Item 7 — unwired strings are gone ================= */
console.log('--- item 7: dead perk strings ---');
{
  const viewsSrc = readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8');
  check('7c1 "not wired to the Bank tab yet" is gone', !viewsSrc.includes('not wired to the Bank tab yet'));
  check('7c2 "not wired to the Medical tab yet" is gone', !viewsSrc.includes('not wired to the Medical tab yet'));
  check('7c3 no "not wired" remains in views.js', !/not wired/.test(viewsSrc));
}

console.log(`\nV212-W4: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
