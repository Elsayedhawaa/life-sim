// Journal job lines use "an" before vowel-initial titles; the school goal does not say the qualification is pending while the player already studies at university.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { withArticle } = await import('../src/systems/soulEngine.js');
for (const [w, e] of [['accountant', 'an accountant'], ['nurse', 'a nurse'], ['engineer', 'an engineer'], ['university lecturer', 'a university lecturer'], ['umpire', 'an umpire'], ['unit manager', 'a unit manager'], ['ice cream seller', 'an ice cream seller']]) assert.equal(withArticle(w), e);
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { renderLifeTabHtml } = await import('../src/ui/views.js');
const S = createNewLifeState({ seed: 3, country: 'tur', birthYear: 2001 }); ensureExtendedState(S);
S.player.age = 18; S.year = 2019; S.education.highSchoolScore = 87; S.education.stage = 'university'; S.education.university = { name: 'Test University', elapsedMonths: 0 };
const strip = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const html = strip(renderLifeTabHtml(S));
assert.ok(/studying at Test University; this goal counts as done at 19/.test(html), 'enrolled player sees the real status');
assert.ok(!/qualification lands at 19/.test(html), 'no pending-qualification wording once enrolled');
console.log('article + goal copy OK');
