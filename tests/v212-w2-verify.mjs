/* v2.12 Worker 2 verify — Timeline journal: filter, search, react, jump-to-year.
   Run from the game root: node tests/v212-w2-verify.mjs
   The three shipped tests (DATA_OK / UI_RENDER_OK / coherence 0 defects) are
   NOT run by this harness — run them separately. */
import { createNewLifeState, ensureExtendedState, setJournalReaction, JOURNAL_REACTIONS } from '../src/core/schema.js';
import { renderLifeTabHtml, applyJournalFilters, journalFilterCategory, JOURNAL_FILTER_TYPES } from '../src/ui/views.js';
import '../src/main.js';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function seededLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.legal.residency.kind = 'citizen';
  // Seeded journal: distinctive texts, spread across types and years.
  // (Newest first, as recordJournal stores them.)
  S.journal = [
    { id: 'j1', year: 2024, age: 34, category: 'money', text: 'Opened a savings account with a ZEBRA deposit of 50000.' },
    { id: 'j2', year: 2024, age: 34, category: 'family', text: 'My sister Sara visited us in Cairo for the weekend.' },
    { id: 'j8', year: 2024, age: 34, category: 'visa', text: 'Renewed my residence permit without trouble.' },
    { id: 'j3', year: 2023, age: 33, category: 'health', text: 'Annual checkup came back clear.' },
    { id: 'j4', year: 2023, age: 33, category: 'career', text: 'Promoted to senior analyst at the bank.' },
    { id: 'j5', year: 2022, age: 32, category: 'business', text: 'The corner cafe made its first profit.' },
    { id: 'j6', year: 2022, age: 32, category: 'world', text: 'Received a work visa for the United Kingdom.' },
    { id: 'j7', year: 2022, age: 32, category: 'milestone', text: 'Bought a small flat near the river.' }
  ];
  return S;
}
const render = (S, ui = {}) => strip(renderLifeTabHtml(S, ui));
const html = (S, ui = {}) => renderLifeTabHtml(S, ui);

/* ================= category mapping (no silent mislabelling) ================= */
console.log('--- mapping ---');
check('money maps to money', journalFilterCategory({ category: 'money' }) === 'money');
check('bank maps to money', journalFilterCategory({ category: 'bank' }) === 'money');
check('family maps to family', journalFilterCategory({ category: 'family' }) === 'family');
check('relationship maps to family', journalFilterCategory({ category: 'relationship' }) === 'family');
check('marriage maps to family', journalFilterCategory({ category: 'marriage' }) === 'family');
check('children maps to family', journalFilterCategory({ category: 'children' }) === 'family');
check('health maps to health', journalFilterCategory({ category: 'health' }) === 'health');
check('career maps to career', journalFilterCategory({ category: 'career' }) === 'career');
check('school maps to career', journalFilterCategory({ category: 'school' }) === 'career');
check('work maps to career', journalFilterCategory({ category: 'work' }) === 'career');
check('business maps to business', journalFilterCategory({ category: 'business' }) === 'business');
check('world maps to world', journalFilterCategory({ category: 'world' }) === 'world');
check('visa maps to world', journalFilterCategory({ category: 'visa' }) === 'world');
check('milestone is NOT forced into a type — it is Other', journalFilterCategory({ category: 'milestone' }) === 'other');
check('life is Other, not mislabelled', journalFilterCategory({ category: 'life' }) === 'other');
check('missing category is Other, not mislabelled', journalFilterCategory({}) === 'other');
check('filter list covers all six spec types plus All and Other',
  ['all', 'family', 'money', 'health', 'career', 'business', 'world', 'other'].every(id => JOURNAL_FILTER_TYPES.some(f => f.id === id)),
  JOURNAL_FILTER_TYPES.map(f => f.id).join(','));
check('reactions are plain words, no emoji', JOURNAL_REACTIONS.length === 3 && JOURNAL_REACTIONS.every(r => /^[A-Za-z]+$/.test(r)), JOURNAL_REACTIONS.join(','));

/* ================= (a) type filter ================= */
console.log('--- (a) type filter ---');
{
  const S = seededLife();
  const money = render(S, { journalType: 'money' });
  check('money filter shows the money entry', money.includes('ZEBRA deposit'));
  check('money filter hides the family entry', !money.includes('sister Sara visited'));
  check('money filter hides the health entry', !money.includes('Annual checkup'));
  check('money filter hides the career entry', !money.includes('Promoted to senior analyst'));
  check('money filter hides the business entry', !money.includes('corner cafe made'));
  check('money filter hides the world entry', !money.includes('work visa for the United Kingdom'));
  check('money filter states how many are shown', /1 of \d+ moments shown/.test(money), money.match(/\d+ of \d+ moments shown/)?.[0] || '');
  const fam = render(S, { journalType: 'family' });
  check('family filter shows the family entry', fam.includes('sister Sara visited'));
  check('family filter hides the money entry', !fam.includes('ZEBRA deposit'));
  const world = render(S, { journalType: 'world' });
  check('world filter shows both world entries (world + visa categories)', world.includes('work visa for the United Kingdom') && world.includes('Renewed my residence permit'));
  check('world filter hides the money entry', !world.includes('ZEBRA deposit'));
  const other = render(S, { journalType: 'other' });
  check('other filter shows the milestone entry', other.includes('small flat near the river'));
  check('other filter hides the money entry', !other.includes('ZEBRA deposit'));
  const biz = render(S, { journalType: 'business' });
  check('business filter shows the business entry', biz.includes('corner cafe made'));
  check('business filter hides the career entry', !biz.includes('Promoted to senior analyst'));
  const all = render(S, {});
  check('no filter shows every seeded entry', ['ZEBRA deposit', 'sister Sara visited', 'Annual checkup', 'Promoted to senior analyst', 'corner cafe made', 'work visa for the United Kingdom', 'small flat near the river', 'Renewed my residence permit'].every(t => all.includes(t)));
  // pure-function level: filter really filters
  check('applyJournalFilters money returns 1 of 8', applyJournalFilters(S.journal, { type: 'money' }).length === 1);
  check('applyJournalFilters world returns 2 of 8', applyJournalFilters(S.journal, { type: 'world' }).length === 2);
}

/* ================= (b) word search ================= */
console.log('--- (b) word search ---');
{
  const S = seededLife();
  const zebra = render(S, { journalQuery: 'zebra' });
  check('search "zebra" finds the ZEBRA entry (case-insensitive)', zebra.includes('ZEBRA deposit'));
  check('search "zebra" hides the family entry', !zebra.includes('sister Sara visited'));
  check('search "zebra" hides the health entry', !zebra.includes('Annual checkup'));
  const cafe = render(S, { journalQuery: 'cafe' });
  check('search "cafe" finds the cafe entry', cafe.includes('corner cafe made'));
  check('search "cafe" hides the money entry', !cafe.includes('ZEBRA deposit'));
  const none = render(S, { journalQuery: 'qqqxxy' });
  check('search with no match says so plainly', none.includes('No moments match this filter yet'));
  check('search with no match shows no seeded entry', !['ZEBRA deposit', 'sister Sara visited', 'Annual checkup'].some(t => none.includes(t)));
  check('applyJournalFilters search returns 1 of 8', applyJournalFilters(S.journal, { query: 'ZEBRA' }).length === 1);
  // search box keeps the typed word (value attribute)
  check('search input keeps the typed word', html(S, { journalQuery: 'zebra' }).includes('value="zebra"'));
}

/* ================= (c) react ================= */
console.log('--- (c) react ---');
{
  const S = seededLife();
  const r = setJournalReaction(S, 'j1', 'Cherish');
  check('react Cherish ok', r.ok, r.msg);
  check('reaction stored ON the entry in S.journal', S.journal.find(e => e.id === 'j1').reaction === 'Cherish');
  const shown = render(S, {});
  check('render shows the stored reaction', shown.includes('You felt: Cherish'));
  const r2 = setJournalReaction(S, 'j2', 'Proud');
  check('react Proud on a second entry ok', r2.ok);
  check('second entry keeps its own reaction', S.journal.find(e => e.id === 'j2').reaction === 'Proud');
  check('first entry reaction untouched by the second', S.journal.find(e => e.id === 'j1').reaction === 'Cherish');
  // persistence shape: the reaction is a plain field on the entry, so JSON save/load keeps it
  const reloaded = JSON.parse(JSON.stringify(S));
  check('reaction survives a JSON save/load round-trip', reloaded.journal.find(e => e.id === 'j1').reaction === 'Cherish');
  const toggle = setJournalReaction(S, 'j1', 'Cherish');
  check('clicking the same reaction again clears it', toggle.ok && !S.journal.find(e => e.id === 'j1').reaction);
  check('render no longer shows a cleared reaction', !render(S, {}).includes('You felt: Cherish'));
  const bad = setJournalReaction(S, 'j1', 'Love it!!');
  check('an invented reaction is refused, not stored', !bad.ok && !S.journal.find(e => e.id === 'j1').reaction);
  const missing = setJournalReaction(S, 'no-such-id', 'Cherish');
  check('reacting to a missing entry is refused', !missing.ok);
  // every entry renders reaction buttons for all three reactions
  const h = html(S, {});
  check('each entry renders Cherish/Proud/Regret buttons', ['data-reaction="Cherish"', 'data-reaction="Proud"', 'data-reaction="Regret"'].every(s => h.includes(s)));
  check('reaction buttons carry the entry id', h.includes('data-action="journal-react" data-id="j1"'));
  check('reaction buttons carry no emoji', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(h.match(/journal-react[\s\S]{0,400}/)?.[0] || ''));
}

/* ================= (d) jump-to-year ================= */
console.log('--- (d) jump-to-year ---');
{
  const S = seededLife();
  const y2023 = render(S, { journalYear: '2023' });
  check('year 2023 shows the 2023 health entry', y2023.includes('Annual checkup'));
  check('year 2023 shows the 2023 career entry', y2023.includes('Promoted to senior analyst'));
  check('year 2023 hides the 2024 money entry', !y2023.includes('ZEBRA deposit'));
  check('year 2023 hides the 2022 business entry', !y2023.includes('corner cafe made'));
  const y2022 = render(S, { journalYear: '2022' });
  check('year 2022 shows all three 2022 entries', ['corner cafe made', 'work visa for the United Kingdom', 'small flat near the river'].every(t => y2022.includes(t)));
  check('year 2022 hides the 2024 entries', !y2022.includes('ZEBRA deposit') && !y2022.includes('sister Sara visited'));
  const y2024 = render(S, { journalYear: 2024 });
  check('year works as a number too', y2024.includes('ZEBRA deposit') && !y2024.includes('Annual checkup'));
  const h = html(S, {});
  check('year control lists every year present (2024, 2023, 2022)', ['value="2024"', 'value="2023"', 'value="2022"'].every(s => h.includes(s)));
  check('year control is a real select, not a dead label', h.includes('<select data-filter="journalYear"'));
  check('applyJournalFilters year returns 2 of 8 for 2023', applyJournalFilters(S.journal, { year: 2023 }).length === 2);
  // combined: type + year + search all apply together
  const combo = render(S, { journalType: 'money', journalYear: '2024', journalQuery: 'zebra' });
  check('type + year + search together still find the entry', combo.includes('ZEBRA deposit'));
  const comboMiss = render(S, { journalType: 'money', journalYear: '2023' });
  check('type + year that match nothing say so plainly', comboMiss.includes('No moments match this filter yet') && !comboMiss.includes('ZEBRA deposit'));
}

/* ================= wiring: handlers + controls exist ================= */
console.log('--- wiring ---');
{
  const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const viewsSrc = readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8');
  check('main.js handles set-journal-filter', mainSrc.includes("action === 'set-journal-filter'"));
  check('main.js handles journal-react', mainSrc.includes("action === 'journal-react'"));
  check('main.js passes uiState into the Timeline render', mainSrc.includes('renderLifeTabHtml(S, uiState)'));
  check('main.js seeds journal uiState defaults', mainSrc.includes("journalType: 'all'") && mainSrc.includes("journalQuery: ''") && mainSrc.includes("journalYear: 'all'"));
  check('views render has the search input wired to the generic input listener', viewsSrc.includes('data-filter="journalQuery"'));
  check('views render has the year select wired to the generic change listener', viewsSrc.includes('data-filter="journalYear"'));
  check('views render has filter buttons', viewsSrc.includes('data-action="set-journal-filter"'));
  check('views render has reaction buttons', viewsSrc.includes('data-action="journal-react"'));
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
