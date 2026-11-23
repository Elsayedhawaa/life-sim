/* ============================================================================
   v2.12 Worker 3 — ONE central helper for disabled buttons.
   Every disabled button in the game must state, in plain words right next
   to the button (never hidden in a tooltip), WHY it cannot be pressed and
   what would make it pressable (the money needed, the age needed, the
   requirement not yet met). Render sites call lockReason(reason, unlock)
   and place the returned span immediately after the <button disabled>.
   It is a tiny standalone module (no imports) so any render file — views.js
   and the systems renderers (businessLoans, businessPremises) — can use it,
   and so the other v2.12 workers can use it for their own regions.
   ========================================================================== */

/* Local escape (this module imports nothing, so it cannot reuse views.js esc). */
function escLock(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render a visible inline lock reason next to a disabled button.
 * @param {string} reason — why the button cannot be pressed, plain words.
 * @param {string} [whatWouldUnlock] — what would make it pressable, plain
 *   words, e.g. "Need 12,000 EGP more" or "You must be 18 (you are 15)".
 * @returns {string} HTML span, or '' when both inputs are empty.
 */
export function lockReason(reason, whatWouldUnlock) {
  const r = String(reason ?? '').trim();
  const u = String(whatWouldUnlock ?? '').trim();
  if (!r && !u) return '';
  return `<span class="lock-reason">🔒 ${escLock(r)}${u ? ` — ${escLock(u)}` : ''}</span>`;
}
