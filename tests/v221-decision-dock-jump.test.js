// With an open decision, the bottom dock on another tab offers a button that jumps to the Timeline decision.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { renderBottomDockHtml } = await import('../src/ui/views.js');
const S = createNewLifeState({ country: 'usa', seed: 2 }); ensureExtendedState(S);
S.activeScene = { id: 'x', title: 'T', choices: [] };
const other = renderBottomDockHtml(S, 'work');
assert.ok(/data-action="switch-tab" data-tab="life"/.test(other) && !/disabled/.test(other.split('advance-main-btn')[1].split('</button>')[0]), 'jump button on another tab');
assert.ok(/decision is waiting/i.test(other));
const life = renderBottomDockHtml(S, 'life');
assert.ok(/data-action="advance-one" disabled/.test(life), 'disabled on the Timeline tab itself');
S.activeScene = null;
assert.ok(/data-action="advance-one"\s*>/.test(renderBottomDockHtml(S, 'work')), 'normal advance when nothing is open');
console.log('ok v221 decision dock jump');
