// Money moved between relatives (a father's loan, a sibling's tuition or wedding or job loss, a parents' down payment) is sized by wages, not goods prices.
import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync(new URL('../src/data/eventsEverydayFamily.js',import.meta.url),'utf8');
for (const k of ['ev_family_dad_loan_request','ev_family_sib_tuition','ev_family_sib_wedding','ev_family_sib_lost_job','ev_family_parents_down_payment']) {
  const i=s.indexOf("key: '"+k+"'"); assert.ok(i>0,k);
  const head=s.slice(Math.max(0,i-1500),i);
  assert.ok(/stakeCost\(S, \d+\)/.test(head),k+' amount uses stakeCost');
}
assert.ok(/stakeCost\(S, 1500\)/.test(s.slice(s.indexOf("const back = loanFromOutcome"),s.indexOf("const back = loanFromOutcome")+200)),'loan repayment fallback matches');
console.log('PASS v221-family-transfers-wage-scale (source-level)');
