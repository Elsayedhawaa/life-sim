import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { tickCareerMonthly, getMergedCareerTracks } from '../src/systems/careerEducationEngine.js';
import { promotionEligibility, applyPromotion } from '../src/systems/careerActions.js';
import { PROFESSIONAL_LICENSES } from '../src/data/megaCareerEduMedical.js';
const country = 'egy';
const tracks = getMergedCareerTracks(2042);
let checked = 0, prompted = 0, refused = 0;
function mk(id, t, lvl) {
  const s = createNewLifeState({ country, seed: 9 }); ensureExtendedState(s);
  s.year = 2042; s.month = 1; s.player.age = 40; s.career.employed = true;
  s.career.trackExperience = { [id]: t.rungs[lvl + 1].minExp + 1 };
  s.education.degrees = [...(t.reqDegrees || [])];
  s.career.job = { employer: 'Acme', title: t.rungs[lvl].title, track: id, level: lvl, monthlyGross: 5000, performance: 80, workMode: 'normal', monthsInRole: 11, startYear: 2030, employmentFraction: 1 };
  return s;
}
const pending = (s) => [...(s.activeScene ? [s.activeScene] : []), ...s.sceneQueue].some((x) => /^senior_rung_ready/.test(x.key || ''));
for (const [id, t] of Object.entries(tracks)) {
  if (!t.rungs || t.rungs.length < 5 || !(t.reqDegrees || []).length) continue;
  const lic = PROFESSIONAL_LICENSES.find((l) => (l.country === country || l.country === 'local') && t.reqDegrees.includes(l.reqDegree));
  for (const state of ['none', 'current', 'lapsed']) {
    const s = mk(id, t, 2);
    if (lic && state !== 'none') { s.credentials.licenses = [lic.id]; s.credentials.licenceRenewals = { [lic.id]: { validUntilYear: state === 'current' ? 2045 : 2040 } }; }
    tickCareerMonthly(s);
    const el = promotionEligibility(s);
    assert.equal(s.career.job.level, 2, `${id}/${state}: no automatic senior promotion`);
    if (!el.eligible) refused++;
    if (pending(s)) {
      prompted++;
      assert(el.eligible, `${id}/${state}: prompt shown but Apply would refuse: ${el.missing.join('; ')}`);
      const r = applyPromotion(s); assert(r.ok, `${id}/${state}: Apply must open the interview`);
    }
    checked++;
  }
}
assert(checked > 0 && prompted > 0, 'some licensed states must prompt');
assert(refused > 0, 'some licence states must refuse and not prompt');
console.log(`licence-aware prompt matches Apply in ${checked} states (${prompted} prompted, ${refused} refused without prompt)`);
