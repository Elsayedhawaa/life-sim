/* Study abroad from the "After school" decision: destination, university, subject, then who pays. Every option is the real quote from the existing study-abroad rules
   (admission index, English, age, funds), so nothing here promises a place or funding: a choice that cannot go ahead is locked with the quote's own reason. Bachelor study only;
   master's and PhD routes stay in the Passport tab. */
import { queueScene, recordJournal } from '../core/schema.js';
import { COUNTRY_IDS, getCountry, formatMoney } from '../data/countries.js';
import { studyAbroadQuote, ABROAD_SUBJECTS, abroadUniversities } from './studyAbroadPlanning.js';
import { applyStudyAbroad, checkCanCrossBorder } from './visaMigrationEngine.js';
import { presentPostHighSchoolCrossroads } from './careerEducationEngine.js';

const FUNDING = [['self', 'Pay from your own cash and savings'], ['parents', "Ask your living parents' savings to cover it"]];
const q = (S, dest, o) => studyAbroadQuote(S, dest, { level: 'bachelor', ...o });
const border = S => checkCanCrossBorder(S);
const anyOk = (S, dest, o = {}) => border(S).ok && abroadUniversities(S, dest).some(u => (o.uniId ? u.id === o.uniId : true) && ABROAD_SUBJECTS.some(m => (o.majorId ? m === o.majorId : true) && FUNDING.some(([f]) => q(S, dest, { uniId: u.id, majorId: m, funding: f }).ok)));
export const abroadDestinations = S => COUNTRY_IDS.filter(c => c !== S.country && abroadUniversities(S, c).length);
export function studyAbroadOpen(S) { return S.player.age >= 18 && !S.education.university && !S.postgrad?.active && ['graduated_high', 'completed'].includes(S.education.stage); }
const back = { exit: true, label: 'Back to the university choices', effect: st => presentPostHighSchoolCrossroads(st) };
const scene = (S, key, title, text, choices) => queueScene(S, { key: `abroad_${key}_${S.year}`, navigation: true, category: 'career', title, text, choices }, true);

export function presentAbroadDestinations(S) {
  const choices = abroadDestinations(S).map(d => {
    const first = q(S, d, { funding: 'self' }); const ok = anyOk(S, d);
    return { label: `${getCountry(d).name} · ${abroadUniversities(S, d).length} universities`, available: st => anyOk(st, d), lockReason: ok ? '' : `Not possible right now: ${(!border(S).ok && border(S).reason) || first.reason || 'no university, subject and funding combination works'}`, effect: st => presentAbroadUniversities(st, d) };
  });
  choices.push(back);
  scene(S, 'dest', 'Study abroad: where?', 'Game rules, not real admissions: a place needs your secondary score to meet that university\'s index, English, and enough money. Costs are shown before you commit. Master\'s and PhD routes are in the Passport tab.', choices);
}
export function presentAbroadUniversities(S, dest) {
  const choices = abroadUniversities(S, dest).map(u => ({ label: u.name, available: st => anyOk(st, dest, { uniId: u.id }), lockReason: `No subject here works for you now (${(!border(S).ok && border(S).reason) || q(S, dest, { uniId: u.id, funding: 'self' }).reason || 'score, English or funds'}).`, effect: st => presentAbroadSubjects(st, dest, u.id) }));
  choices.push({ exit: true, label: 'Choose a different country', effect: st => presentAbroadDestinations(st) });
  scene(S, 'uni', `Study abroad: ${getCountry(dest).name}`, 'Choose the university.', choices);
}
export function presentAbroadSubjects(S, dest, uniId) {
  const choices = ABROAD_SUBJECTS.map(m => { const base = q(S, dest, { uniId, majorId: m, funding: 'self' }); return { label: base.majorLabel, available: st => anyOk(st, dest, { uniId, majorId: m }), lockReason: (!border(S).ok && border(S).reason) || base.reason || 'Not possible right now.', effect: st => presentAbroadFunding(st, dest, uniId, m) }; });
  choices.push({ exit: true, label: 'Choose a different university', effect: st => presentAbroadUniversities(st, dest) });
  scene(S, 'subject', 'Study abroad: subject', 'Choose the subject.', choices);
}
export function presentAbroadFunding(S, dest, uniId, majorId) {
  const choices = FUNDING.map(([f, label]) => { const x = q(S, dest, { uniId, majorId, funding: f }); return {
    label: `${label} · about ${formatMoney(x.totalPlayer, S.country)} up front (${x.years} years)`, available: st => border(st).ok && q(st, dest, { uniId, majorId, funding: f }).ok, lockReason: (!border(S).ok && border(S).reason) || x.reason || 'Not possible right now.',
    effect: st => { const r = applyStudyAbroad(st, dest, majorId, { uniId, level: 'bachelor', funding: f }); if (!r.ok) recordJournal(st, r.msg || 'The study move could not go ahead.', 'education'); } }; });
  choices.push({ exit: true, label: 'Choose a different subject', effect: st => presentAbroadSubjects(st, dest, uniId) });
  scene(S, 'fund', 'Study abroad: who pays?', 'Nothing is charged until you choose. Living costs continue monthly after the first year.', choices);
}
export function restoreAbroadDecision(S) { const shadow = { ...S, activeScene: null, sceneQueue: [], sceneCounts: {}, titleCounts: {}, cooldowns: {} }; if (!studyAbroadOpen(S)) return null; presentAbroadDestinations(shadow); return shadow.activeScene; }
