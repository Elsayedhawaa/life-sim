// A work skill is shown as words, never as an internal id.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { workSkillLabel, CAREER_WORK_TEMPLATES } = await import('../src/systems/careerWork.js');
assert.equal(workSkillLabel('craft_general'), 'General work');
assert.equal(workSkillLabel('craft_hospitality'), 'Hospitality work');
const t = Object.values(CAREER_WORK_TEMPLATES)[0]; assert.equal(workSkillLabel(t.skillId), t.skillLabel);
assert.ok(!/craft_|_/.test(workSkillLabel('craft_general')));
console.log('PASS v221-skill-label');
