import { createNewLifeState, ensureExtendedState, walletMove } from  '../src/core/schema.js';
import { renderFinanceTabHtml, renderLifeTabHtml, renderPeopleTabHtml, renderWorkTabHtml } from  '../src/ui/views.js';
import { computeLiveLegacyScore, buildLegacySummary } from  '../src/systems/healthDirectorEngine.js';

const fail = (msg) => { console.error('FAIL: ' + msg); process.exitCode = 1; };
const check = (name, cond, extra = '') => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' :: ' + extra : ''));
  if (!cond) process.exitCode = 1;
};
const has = (html, s) => html.includes(s);

// --- shared adult state ---
const S = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1995, familyTier: 'upper_middle', gender: 'm' });
ensureExtendedState(S);
S.year = 2013; S.player.age = 18; // adult state: birthYear 1995, game year 2013
console.log('age=' + S.player.age + ' goals=' + S.goals.length + ' goalIds=' + S.goals.map(g => g.id).join(','));

// --- ITEM 1: ledger visible ---
walletMove(S, 5000, 'Test salary from Nile Care Hospital', 'career');
walletMove(S, -1200, 'Test rent payment', 'housing');
const fin = renderFinanceTabHtml(S, { finSub: 'cashflow', ledgerFilter: 'all' });
check('1 ledger: salary label renders', has(fin, 'Test salary from Nile Care Hospital'));
check('1 ledger: rent label renders', has(fin, 'Test rent payment'));
check('1 ledger: section header', has(fin, 'Transaction History'));
check('1 ledger: running balance label', has(fin, 'Balance:'));
check('1 ledger: salary amount +5,000', /\+[^<]*5,000/.test(fin), (fin.match(/\+[^<]{0,20}5,000/) || ['?'])[0]);
check('1 ledger: rent amount -1,200', /−[^<]*1,200/.test(fin), (fin.match(/−[^<]{0,20}1,200/) || ['?'])[0]);
const finWork = renderFinanceTabHtml(S, { finSub: 'cashflow', ledgerFilter: 'work' });
check('1 filter work: salary shown', has(finWork, 'Test salary from Nile Care Hospital'));
check('1 filter work: rent hidden', !has(finWork, 'Test rent payment'));
const finHome = renderFinanceTabHtml(S, { finSub: 'cashflow', ledgerFilter: 'home' });
check('1 filter home: rent shown', has(finHome, 'Test rent payment'));
check('1 filter home: salary hidden', !has(finHome, 'Test salary from Nile Care Hospital'));

// --- ITEM 2: goals live + legacy score ---
const life = renderLifeTabHtml(S);
for (const g of S.goals) check('2 goal renders: ' + g.id, has(life, g.label.replace(/&/g, '&amp;')));
check('2 goals header with count', /Life Goals \(\d\/5 done\)/.test(life), (life.match(/Life Goals \(\d\/5 done\)/) || ['?'])[0]);
const m = life.match(/Legacy Score: (\d+)\/100/);
check('2 live legacy score renders', !!m, m ? m[0] : 'missing');
check('2 live score == death-summary score', computeLiveLegacyScore(S) === buildLegacySummary(S).score, 'live=' + computeLiveLegacyScore(S) + ' summary=' + buildLegacySummary(S).score);

// --- ITEM 3: blocked account ---
S.legal.blockedAccount = { kind: 'German Sperrkonto', country: 'deu', balanceLocal: 12324, balanceInPlayerLocal: 12324, monthlyReleaseLocal: 1027 };
const fin2 = renderFinanceTabHtml(S, { finSub: 'cashflow', ledgerFilter: 'all' });
check('3 blocked: kind renders', has(fin2, 'German Sperrkonto'));
check('3 blocked: balance 12,324 renders', has(fin2, '12,324'));
check('3 blocked: monthly release 1,027 renders', has(fin2, '1,027'));
check('3 blocked: header renders', has(fin2, 'Blocked Account'));
const S2 = createNewLifeState({ seed: 7, country: 'egy', birthYear: 1995, familyTier: 'middle', gender: 'f' });
ensureExtendedState(S2);
check('3 blocked: absent when no account', !has(renderFinanceTabHtml(S2, { finSub: 'cashflow' }), 'Blocked Account'));

// --- ITEM 4: NPC savings ---
const dad = S.people[S.relations.fatherId];
dad.career.savingsLocal = 250000;
const people = renderPeopleTabHtml(S, { peopleSub: 'circle' });
check('4 NPC savings: father line renders', has(people, 'Holds about'), (people.match(/Holds about[^<]{0,40}/) || ['?'])[0]);
check('4 NPC savings: amount 250,000 renders', has(people, '250,000'));
const mom = S.people[S.relations.motherId];
mom.career.savingsLocal = 0;
const people2 = renderPeopleTabHtml(S, { peopleSub: 'circle' });
check('4 NPC savings: zero savings says so', has(people2, 'No savings put aside'));

// --- ITEM 10: withheld salary ---
S.money._salaryWithheldNoted = true;
S.career.employed = true;
S.career.job = { title: 'Junior Doctor', employer: 'Nile Care Hospital', monthlyGross: 9000, workMode: 'normal', monthsInRole: 3, startYear: S.year, performance: 70 };
let work;
try {
  work = renderWorkTabHtml(S, { workSub: 'jobs' });
} catch (e) {
  console.log('work render with job threw: ' + e.message + ' — retrying jobless');
  S.career.job = null; S.career.employed = false;
  work = renderWorkTabHtml(S, { workSub: 'jobs' });
}
check('10 withheld: indicator header', has(work, 'Salary Withheld'));
check('10 withheld: reason (work authorisation)', has(work, 'work authorisation'));
check('10 withheld: clears condition', has(work, 'regularised'));
check('10 withheld: amount 9,000 renders', has(work, '9,000'));
S.money._salaryWithheldNoted = false;
check('10 withheld: absent when pay flows', !has(renderWorkTabHtml(S, { workSub: 'jobs' }), 'Salary Withheld'));

console.log(process.exitCode ? 'VERIFY DONE WITH FAILURES' : 'ALL WORKER-A CHECKS PASS');
