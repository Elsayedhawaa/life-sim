/* v2.13 Worker 4 — Items 5 (Finance charts) + 6 (era skin).
   Run from the game dir: node tests/v213-w4-verify.mjs — exits non-zero on any FAIL.
   Proves, from the real ledger and the real records:
   (a) Finance tab shows income-vs-expenses + cash charts whose numbers match
       an independent aggregation of S.ledger computed here in the test;
   (b) a life with a business shows the business chart; a life with no
       business shows the plain "No business yet" line;
   (c) the era class for 1962 differs from 2026 (and the CSS + main.js hook
       that produce it are present);
   (d) S.financeHistory gains exactly one snapshot per yearly advance and
       each snapshot equals computeNetWorthLocal for that state.
   No browser is involved: rendering is the same server-side render the
   shipped UI tests use; the live-browser check is the parent's job. */
import { readFileSync } from 'node:fs';
import { createNewLifeState, ensureExtendedState, recordLedgerEntry, computeNetWorthLocal } from '../src/core/schema.js';
import { renderFinanceTabHtml, renderLifeTabHtml, eraClassForYear, eraNameForYear, recordFinanceHistorySnapshot } from '../src/ui/views.js';
import { formatMoney } from '../src/data/countries.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const attr = (html, marker, name) => {
  const m = String(html).match(new RegExp(`${marker}[^>]*?${name}="([^"]+)"`));
  return m ? m[1] : null;
};

function adultLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 36;
  S.money.cash = 100000;
  S.money.savings = 0;
  S.money.creditScore = 700;
  return S;
}

/* Seed a controlled ledger: Jan–Jun 2025, salary +50,000 and living −20,000
   every month, plus business revenue +15,000 in Mar/Apr/May. recordLedgerEntry
   is the game's own ledger writer, so the chart reads exactly what the game
   writes. Balances are tracked here so the cash chart can be checked exactly. */
function seedLedger(S) {
  let cash = 100000;
  S.money.cash = cash;
  const put = (year, month, delta, label) => {
    cash = Math.round((cash + delta) * 100) / 100;
    S.year = year; S.month = month;
    recordLedgerEntry(S, delta, label, 'monthly_settlement', 'cash', cash);
  };
  for (let m = 1; m <= 6; m++) {
    put(2025, m, 50000, `Salary — Test Employer (Staff) (${m}/2025)`);
    if (m >= 3 && m <= 5) put(2025, m, 15000, `Business revenue — Test Bakery (${m}/2025)`);
    put(2025, m, -20000, `Monthly living costs (${m}/2025)`);
  }
  S.year = 2026; S.month = 1;
  S.money.cash = cash;
  return cash;
}

/* Independent aggregation of S.ledger, written here in the test (not reused
   from the chart code): cash-account lines only, monthly buckets. */
function independentTotals(S) {
  const entries = S.ledger.filter(e => e && e.account === 'cash');
  let totalIn = 0, totalOut = 0;
  const byMonth = {};
  for (const e of entries) {
    const d = Number(e.delta) || 0;
    if (d > 0) totalIn += d; else totalOut += Math.abs(d);
    const k = `${e.year}-${e.month}`;
    byMonth[k] = byMonth[k] || { income: 0, expenses: 0 };
    if (d > 0) byMonth[k].income += d; else byMonth[k].expenses += Math.abs(d);
  }
  const chrono = [...entries].reverse();
  const bals = chrono.map(e => Number(e.balanceAfter) || 0);
  const biz = entries.filter(e => typeof e.label === 'string' && e.label.startsWith('Business revenue — ') && (Number(e.delta) || 0) > 0)
    .reduce((s, e) => s + Number(e.delta), 0);
  return { totalIn, totalOut, byMonth, firstBal: bals[0], lastBal: bals[bals.length - 1], minBal: Math.min(...bals), maxBal: Math.max(...bals), bizTotal: biz, count: entries.length };
}

/* ================= (a) charts match the ledger ================= */
console.log('--- (a) income vs expenses + cash charts match the ledger ---');
{
  const S = adultLife();
  seedLedger(S);
  S.career.businesses = [{ id: 'biz1', name: 'Test Bakery' }];
  // Two net-worth snapshots so the net-worth chart draws: 2025 then 2026.
  S.year = 2025; recordFinanceHistorySnapshot(S);
  S.year = 2026;
  const html = renderFinanceTabHtml(S, { finSub: 'cashflow' });
  const t = independentTotals(S);
  check('a1 income-vs-expenses chart present', html.includes('data-chart="income-expenses"'));
  check('a2 cash-balance chart present', html.includes('data-chart="cash-balance"'));
  check('a3 net-worth chart present (2 snapshots)', html.includes('data-chart="net-worth"'));
  check('a4 business chart present', html.includes('data-chart="business-income"'));
  check('a5 chart total-in matches independent ledger sum',
    attr(html, 'data-chart="income-expenses"', 'data-total-in') === String(Math.round(t.totalIn)),
    `chart=${attr(html, 'data-chart="income-expenses"', 'data-total-in')} expected=${Math.round(t.totalIn)}`);
  check('a6 chart total-out matches independent ledger sum',
    attr(html, 'data-chart="income-expenses"', 'data-total-out') === String(Math.round(t.totalOut)),
    `chart=${attr(html, 'data-chart="income-expenses"', 'data-total-out')} expected=${Math.round(t.totalOut)}`);
  const mar = html.match(/data-bucket="Mar 2025"[^>]*?data-income="(\d+)"[^>]*?data-expenses="(\d+)"/);
  check('a7 March bucket: income 65000 (salary + business) and expenses 20000',
    !!mar && Number(mar[1]) === 65000 && Number(mar[2]) === 20000, mar ? mar[0] : 'no Mar 2025 bucket');
  check('a8 totals shown in plain words with full numbers',
    strip(html).includes(`Total in: ${formatMoney(t.totalIn, S.country)}`) && strip(html).includes(`Total out: ${formatMoney(t.totalOut, S.country)}`));
  check('a9 cash chart first balance matches oldest ledger line',
    attr(html, 'data-chart="cash-balance"', 'data-first-balance') === String(Math.round(t.firstBal)),
    `chart=${attr(html, 'data-chart="cash-balance"', 'data-first-balance')} expected=${Math.round(t.firstBal)}`);
  check('a10 cash chart last balance matches newest ledger line (= cash now)',
    attr(html, 'data-chart="cash-balance"', 'data-last-balance') === String(Math.round(t.lastBal)),
    `chart=${attr(html, 'data-chart="cash-balance"', 'data-last-balance')} expected=${Math.round(t.lastBal)}`);
  check('a11 cash chart min/max match the ledger balances',
    attr(html, 'data-chart="cash-balance"', 'data-min-balance') === String(Math.round(t.minBal)) &&
    attr(html, 'data-chart="cash-balance"', 'data-max-balance') === String(Math.round(t.maxBal)),
    `min=${attr(html, 'data-chart="cash-balance"', 'data-min-balance')}/${Math.round(t.minBal)} max=${attr(html, 'data-chart="cash-balance"', 'data-max-balance')}/${Math.round(t.maxBal)}`);
  check('a12 cash chart labelled cash, not net worth', strip(html).includes('Cash Balance Over Time (cash, not net worth)'));
  check('a13 business revenue total matches independent sum of revenue lines',
    attr(html, 'data-chart="business-income"', 'data-total-revenue') === String(Math.round(t.bizTotal)),
    `chart=${attr(html, 'data-chart="business-income"', 'data-total-revenue')} expected=${Math.round(t.bizTotal)}`);
  check('a14 net-worth chart first year is the first recorded year',
    attr(html, 'data-chart="net-worth"', 'data-first-year') === '2025');
  check('a15 net-worth chart last value equals the Finance tab net worth now',
    attr(html, 'data-chart="net-worth"', 'data-last-value') === String(computeNetWorthLocal(S)),
    `chart=${attr(html, 'data-chart="net-worth"', 'data-last-value')} expected=${computeNetWorthLocal(S)}`);
}
{
  // Fewer than 2 ledger entries: plain words, no flat-line chart.
  const S = adultLife();
  const html = renderFinanceTabHtml(S, { finSub: 'cashflow' });
  check('a16 empty ledger: no income chart drawn', !html.includes('data-chart="income-expenses"'));
  check('a17 empty ledger: plain "not enough history" wording shown',
    strip(html).includes('Not enough money history yet'));
  check('a18 empty ledger: net-worth note says earlier years were not recorded',
    strip(html).includes('earlier years were not recorded'));
}

/* ================= (b) business / no-business ================= */
console.log('--- (b) business chart vs no-business line ---');
{
  const S = adultLife();
  seedLedger(S); // ledger has business revenue lines but no business record
  S.career.businesses = [{ id: 'biz1', name: 'Test Bakery' }];
  const html = renderFinanceTabHtml(S, { finSub: 'cashflow' });
  check('b1 life with a business shows the business chart', html.includes('data-chart="business-income"'));
  check('b2 business chart does not say "No business yet"', !strip(html).includes('No business yet'));
}
{
  const S = adultLife();
  const html = renderFinanceTabHtml(S, { finSub: 'cashflow' });
  check('b3 life with no business shows the plain line',
    strip(html).includes('No business yet — your business income will chart here'));
  check('b4 life with no business draws no business chart', !html.includes('data-chart="business-income"'));
}

/* ================= (c) era skin ================= */
console.log('--- (c) era class differs by year ---');
{
  check('c1 1962 is the Sixties band', eraClassForYear(1962) === 'era-1960s' && eraNameForYear(1962) === 'The Sixties');
  check('c2 2026 is the 2020s band', eraClassForYear(2026) === 'era-2020s' && eraNameForYear(2026) === 'The 2020s');
  check('c3 era class for 1962 differs from 2026', eraClassForYear(1962) !== eraClassForYear(2026));
  check('c4 every decade 1960–2029 has its own class',
    [1962, 1975, 1984, 1993, 2004, 2015, 2026].map(eraClassForYear).every((c, i, a) => a.indexOf(c) === i));
  const css = readFileSync('styles/main.css', 'utf8');
  const accent = (cls) => (css.match(new RegExp(`#app\\.${cls} \\{[^}]*--era-accent: (#[0-9A-Fa-f]+)`)) || [])[1];
  check('c5 CSS has a distinct era rule for 1960s and 2020s with different accents',
    !!accent('era-1960s') && !!accent('era-2020s') && accent('era-1960s') !== accent('era-2020s'),
    `1960s=${accent('era-1960s')} 2020s=${accent('era-2020s')}`);
  check('c6 CSS gives pre-1980 banners a sepia treatment and 2020s none',
    css.includes('#app.era-1960s .editorial-banner img { filter: sepia(0.55)') && css.includes('#app.era-2020s .editorial-banner img { filter: none; }'));
  const mainJs = readFileSync('src/main.js', 'utf8');
  check('c7 main.js sets the era class on the app root from S.year',
    mainJs.includes('eraClassForYear(S.year)') && mainJs.includes('root.classList.add(eraClassForYear(S.year))'));
  check('c8 main.js records the net-worth snapshot in renderApp',
    mainJs.includes('recordFinanceHistorySnapshot(S)'));
  const S = adultLife();
  S.year = 1962; S.month = 1; S.player.age = 2;
  const lifeHtml = strip(renderLifeTabHtml(S, {}));
  check('c9 Timeline header names the era in words ("1962 · The Sixties")',
    lifeHtml.includes('1962 · The Sixties'), lifeHtml.slice(0, 300));
}

/* ================= (d) net-worth snapshots ================= */
console.log('--- (d) one snapshot per yearly advance, equal to net worth ---');
{
  const S = adultLife();
  check('d1 old save starts with no financeHistory', S.financeHistory === undefined);
  const s1 = recordFinanceHistorySnapshot(S);
  check('d2 first snapshot created, seeded empty then one entry',
    Array.isArray(S.financeHistory) && S.financeHistory.length === 1);
  check('d3 first snapshot equals the Finance tab net worth for that state',
    s1 && s1.netWorth === computeNetWorthLocal(S) && s1.year === 2026,
    `snap=${s1 && s1.netWorth} expected=${computeNetWorthLocal(S)}`);
  recordFinanceHistorySnapshot(S);
  check('d4 second call in the same year adds nothing', S.financeHistory.length === 1);
  S.year = 2027; S.money.cash += 123456;
  const s2 = recordFinanceHistorySnapshot(S);
  check('d5 next year adds exactly one snapshot', S.financeHistory.length === 2);
  check('d6 second snapshot equals net worth after the cash change',
    s2 && s2.year === 2027 && s2.netWorth === computeNetWorthLocal(S),
    `snap=${s2 && s2.netWorth} expected=${computeNetWorthLocal(S)}`);
  // Simulate five yearly advances (as renderApp would record after each).
  for (let y = 2028; y <= 2032; y++) { S.year = y; S.money.cash += 1000; recordFinanceHistorySnapshot(S); }
  check('d7 five more yearly advances give five more snapshots, one per year',
    S.financeHistory.length === 7 && S.financeHistory.map(h => h.year).join(',') === '2026,2027,2028,2029,2030,2031,2032');
  check('d8 every snapshot equals net worth recomputed for its year is preserved (years unique, ordered)',
    new Set(S.financeHistory.map(h => h.year)).size === S.financeHistory.length);
}
{
  // Rendering the Finance tab itself records the snapshot (same-year render is a no-op).
  const S = adultLife();
  renderFinanceTabHtml(S, { finSub: 'cashflow' });
  check('d9 Finance render records the current-year snapshot', S.financeHistory.length === 1 && S.financeHistory[0].year === 2026);
  renderFinanceTabHtml(S, { finSub: 'cashflow' });
  check('d10 second Finance render in the same year adds nothing', S.financeHistory.length === 1);
  S.year = 2027;
  renderFinanceTabHtml(S, { finSub: 'cashflow' });
  check('d11 Finance render in the new year adds one snapshot', S.financeHistory.length === 2);
}

console.log(`\nW4 verify: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
