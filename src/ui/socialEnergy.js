/* ============================================================================
   v2.15 W3 — Social energy + drift warnings, rendered.
   The player always sees the number (People tab header), every
   relationship button states its energy cost before the click, and a
   drifting relationship shows a visible warning on the person card that
   names what would stop the drift. Plain words everywhere, no code.
   ========================================================================== */

import { socialEnergy, driftStatusFor, energyCostFor } from '../systems/socialEnergy.js';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* The cost suffix for a relationship button: " (1 energy)" / " (3 energy)".
   Same cost table as the charge itself, so the button never lies. */
export function socialEnergyCostLabel() {
  return ''; /* social energy was removed: buttons show no energy cost */
}

/* The budget, stated on the screen in the People tab header. */
export function renderSocialEnergyHtml() {
  return ''; /* social energy was removed */
}

/* The drifting warning on a person card. Shown while the relationship is
   still alive — never after it breaks — and it always names what stops
   the drift: contact them. */
export function renderDriftWarningHtml(S, p) {
  const d = driftStatusFor(S, p);
  if (!d) return '';
  const when = d.months >= 12 ? 'over a year' : `${d.months} months`;
  const text = d.state === 'noticed'
    ? `You have not spoken to ${p.firstName} in ${when} — the friendship is hanging by a thread. Call or visit to save it, or answer the notice on your Timeline.`
    : `Drifting apart — you have not spoken to ${p.firstName} in ${when}. A call or a visit would stop the drift.`;
  return `<div style="margin-top:8px;padding:7px 10px;border-left:3px solid #B7791F;background:rgba(183,121,31,0.10);border-radius:4px;font-size:0.82rem;line-height:1.45">⚠ ${esc(text)}</div>`;
}
