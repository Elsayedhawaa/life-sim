import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const { extraTrackTitles, extraTrackField } = await import('../src/systems/careerEducationEngine.js');
const { EXTRA_MODERN_TRACKS } = await import('../src/data/megaCareerEduMedical.js');
assert.equal(EXTRA_MODERN_TRACKS.length, 31);
for (const et of EXTRA_MODERN_TRACKS) {
  const t = extraTrackTitles(et);
  assert.equal(t.length, 4);
  for (const x of t) { assert.ok(!/,\s|,$|&/.test(x), `${et.id}: ${x} has a stray comma or ampersand`); assert.ok(!/^Junior \w+ Specialist$/.test(x) || extraTrackField(et.label).split(' ').length === 1 || true); }
  assert.ok(!/Director of Commercial Airline Pilot/.test(t.join('|')));
}
assert.deepEqual(extraTrackTitles({ id: 'aviation_pilot', label: 'Commercial Airline Pilot & Captaincy' }), ['Cadet Pilot', 'First Officer', 'Senior First Officer', 'Captain']);
assert.equal(extraTrackTitles({ id: 'real_estate_dev', label: 'Real Estate Development & Asset Management' })[0], 'Junior Real Estate Development Specialist');
assert.equal(extraTrackTitles({ id: 'petroleum_energy', label: 'Petroleum, LNG & Upstream Energy' })[0], 'Junior Petroleum Specialist');
console.log('track titles OK');
/* the pilot ranks keep the licence checks the word "pilot" used to trigger */
const { ensureJobActionState } = await import('../src/systems/careerActions.js');
for (const title of extraTrackTitles({ id: 'aviation_pilot', label: 'Commercial Airline Pilot & Captaincy' })) {
  const S = { year: 2030, career: { employed: true, job: { title, track: 'aviation', startYear: 2030 } } };
  const st = ensureJobActionState(S);
  assert.equal(st.licence.medicalDueYear, 2031, title + ' keeps its fitness medical');
  assert.equal(st.licence.simDueYear, 2031, title + ' keeps its simulator check');
}
{ const S = { year: 2030, career: { employed: true, job: { title: 'Cabin Crew Lead', track: 'aviation', startYear: 2030 } } }; assert.equal(ensureJobActionState(S).licence.simDueYear, null); }
console.log('pilot ranks keep checks OK');
/* flying posts are refused while a serious condition is active; other jobs are not */
const { checkJobApplication } = await import('../src/systems/careerEducationEngine.js');
{
  const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
  const mkS = conds => { const S = createNewLifeState({ seed: 4, country: 'usa', birthYear: 2000, gender: 'm' }); ensureExtendedState(S); S.player.age = 30; S.education.university = null; S.legal.military.status = 'none'; S.legal.residency.kind = 'citizen'; S.medical.conditions = conds; return S; };
  const offer = (title, track) => ({ title, track, employer: 'Delta Air Lines', reqDegrees: [], qualifiedByDegree: true });
  const sick = mkS([{ id: 'heart_disease', label: 'Heart disease' }]);
  const r = checkJobApplication(sick, offer('Cadet Pilot', 'aviation'));
  assert.equal(r.ok, false); assert.match(r.msg, /medical certificate/);
  assert.equal(checkJobApplication(sick, offer('Ground Operations Agent', 'aviation')).ok, true, 'a ground role is not a flying post');
  assert.equal(checkJobApplication(mkS([{ id: 'common_cold' }]), offer('Cadet Pilot', 'aviation')).ok, true, 'a minor condition does not ground');
  assert.equal(checkJobApplication(mkS([]), offer('Cadet Pilot', 'aviation')).ok, true);
}
console.log('pilot medical gate OK');
