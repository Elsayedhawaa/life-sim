// Study-abroad "who pays?" copy matches the real cost structure: escrow only where modelled, otherwise living is charged monthly from arrival.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const SA = await import('../src/systems/studyAbroadScenes.js');
const P = await import('../src/systems/studyAbroadPlanning.js');
const S = createNewLifeState({ seed: 4, country: 'egy', birthYear: 1998, familyTier: 'very_wealthy', gender: 'm' }); ensureExtendedState(S); S.year = 2016; S.month = 9; S.player.age = 18; S.education.stage = 'graduated_high'; S.education.highSchoolScore = 95; S.money.cash = 5e9; S.education.languages = ['English (Fluent)']; S.legal.passports.forEach(p => { p.expiresYear = 2040; });
let withEsc = 0, without = 0;
for (const dest of ['gbr', 'deu', 'can', 'usa', 'uae']) {
  let uni; try { uni = P.abroadUniversities(S, dest)[0]; } catch { continue; } if (!uni) continue;
  const uid = uni.id || uni.uniId, major = (P.ABROAD_SUBJECTS || [])[0] || 'computer_science';
  S.activeScene = null; S.sceneQueue = []; try { SA.presentAbroadFunding(S, dest, uid, major); } catch { continue; } const sc = S.activeScene || S.sceneQueue[0]; if (!sc) continue;
  const t = sc.text || sc.body || ''; assert.ok(!/Living costs continue monthly after the first year/.test(t), 'old wording gone');
  if (/living-cost escrow/.test(t)) withEsc++; else { assert.match(t, /Living costs are charged monthly from the month you arrive/); without++; }
  assert.match(t, /After the first year, tuition is charged again/);
}
assert.ok(withEsc > 0 && without > 0, 'both an escrow and a non-escrow destination were checked');
console.log('PASS v221-abroad-funding-copy', withEsc, without);
