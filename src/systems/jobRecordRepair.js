/* One-time, player-chosen repair of an old job record that an earlier version wrote with placeholder text
   ("Junior University Student" at "the firm where <friend> works", on a track that has no career ladder).
   The game cannot know what that job really was, so it NEVER rewrites it on its own: the player is shown exactly what is recorded and chooses
   to (a) say which kind of work it is, from real tracks they could be hired into (their pay and employer text stay as recorded), (b) end the record (the pay stops),
   or (c) leave it. Nothing is touched until they choose, and the question is asked once. */
import { checkJobApplication, getMergedCareerTracks } from './careerEducationEngine.js';
import { recordJournal, queueScene } from '../core/schema.js';
import { formatMoney } from '../data/countries.js';

const PLACEHOLDER_EMPLOYER = /^the firm where .+ works$/i;
const PLACEHOLDER_TITLE = /^(junior )?(infant|primary school|secondary student|university student|student|unemployed|seeking work|retired|homemaker)/i;
export function brokenJobRecord(S) {
  const j = S?.career?.job; if (!S?.career?.employed || !j || !(Number(j.monthlyGross) > 0)) return false;
  const tracks = getMergedCareerTracks(S.year);
  return PLACEHOLDER_EMPLOYER.test(String(j.employer || '')) || (PLACEHOLDER_TITLE.test(String(j.title || '')) && !tracks[j.track]);
}
/* Game rule (my own judgment, not sourced data): a few core tracks carry no era date in the catalogue but are plainly modern roles. For THIS list only they are not offered before these years. */
const MODERN_ONLY_FROM = { data_science: 2010, analytics: 2005, product_design: 2005, product: 2000, cybersecurity: 2000 };
function candidateTracks(S) {
  const j = S.career.job, tracks = getMergedCareerTracks(S.year), out = [];
  for (const [id, t] of Object.entries(tracks)) {
    const title = t.rungs?.[0]?.title; if (!title) continue; if (MODERN_ONLY_FROM[id] && S.year < MODERN_ONLY_FROM[id]) continue;
    const app = { employer: j.employer, title, track: id, level: 0, monthlyGross: j.monthlyGross, reqDegrees: t.reqDegrees || [], qualifiedByDegree: (t.reqDegrees || []).length === 0 || (t.reqDegrees || []).some(d => (S.education?.degrees || []).includes(d)) };
    let ok = false; try { ok = !!checkJobApplication(S, app).ok; } catch (_) { ok = false; }
    if (ok && app.qualifiedByDegree) out.push({ id, label: t.label || id, title });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}
const describe = S => { const j = S.career.job; return `${j.title} at ${j.employer}, ${formatMoney(j.monthlyGross, S.country)} a month`; };
function pickScene(S) {
  const cands = candidateTracks(S);
  const choices = cands.map(c => ({ label: `${c.label} (starts as ${c.title})`, effect: st => {
    const j = st.career.job; if (!j || st.jobRecordRepair?.answered) return;
    const before = describe(st); const fr = String(j.employer || '').match(/^the firm where (.+) works$/i);
    j.track = c.id; j.level = 0; j.title = c.title; j.monthsInRole = j.monthsInRole || 0;
    if (fr) j.employer = `Employer not recorded (you were referred by ${fr[1]})`;
    st.jobRecordRepair = { answered: 'chose', track: c.id, year: st.year }; st.jobRecordRepair.pending = false;
    recordJournal(st, `You told the game what this job is: ${c.title} (${c.label}). Your pay, start date and contract stay as recorded. The placeholder employer name was replaced with \"not recorded\", because the game does not know who it was (was: ${before}).`, 'career');
  } }));
  choices.push({ label: 'Back', exit: true, effect: st => { const sc = buildScene(st, 'back'); if (sc) queueScene(st, sc, true); } });
  return { key: 'job_record_repair_pick', baseId: 'job_record_repair_pick', category: 'career', navigation: true, title: 'What kind of work is this job?', text: `Recorded: ${describe(S)}. Pick the kind of work it really is. Only jobs you could actually be hired into are listed. Your pay, start date and contract stay exactly as recorded. The made-up employer name is replaced with \"not recorded\", not with a guessed company.`, choices };
}
export function buildScene(S, again = '') {
  if (!brokenJobRecord(S) || S.jobRecordRepair?.answered) return null;
  const j = S.career.job;
  return { key: again ? `job_record_repair_${again}_${S.year}_${S.month}` : 'job_record_repair', baseId: again ? `job_record_repair_${again}` : 'job_record_repair', navigation: !!again, maxPerLife: 3, category: 'career', title: 'Your job record looks wrong',
    text: `Your save says you work as "${j.title}" at "${j.employer}", paid ${formatMoney(j.monthlyGross, S.country)} a month. An old version of the game wrote that record, and it is not a real job or employer. The game cannot know what your job really is, so it will not guess. You decide.`,
    choices: [
      { label: 'Say what kind of work it is', exit: false, effect: st => { const sc = pickScene(st); if (sc.choices.length > 1) queueScene(st, sc, true); else recordJournal(st, 'No job you could be hired into right now could be offered as a match. The record is unchanged.', 'career'); } },
      { label: 'Remove this job record (the pay stops)', effect: st => { const jj = st.career.job; if (!jj || st.jobRecordRepair?.answered) return; const d = describe(st); st.career.job = null; st.career.employed = false; st.jobRecordRepair = { answered: 'removed', year: st.year }; recordJournal(st, `You removed the old job record (${d}). The pay from it stopped.`, 'career'); } },
      { label: 'Keep it as it is', effect: st => { st.jobRecordRepair = { answered: 'kept', year: st.year }; } }
    ] };
}
export function offerJobRecordRepair(S) {
  if (S.jobRecordRepair?.answered || S.activeScene) return false;
  const sc = buildScene(S); if (!sc) return false;
  S.jobRecordRepair = { ...(S.jobRecordRepair || {}), pending: true };
  return queueScene(S, sc, false);
}
export function restoreJobRecordRepairScene(S, saved) {
  if (!saved) return null;
  if (saved.key === 'job_record_repair') return buildScene(S);
  if (/^job_record_repair_back_/.test(saved.key)) return buildScene(S, 'back');
  if (saved.key === 'job_record_repair_pick') return brokenJobRecord(S) && !S.jobRecordRepair?.answered ? pickScene(S) : null;
  return null;
}
