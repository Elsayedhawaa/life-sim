/* =====================================================================
   77.5 — LIFE TAB STRIP
   Loaded AFTER 77 so this wrapper is the last on viewLife.
   Removes cards that belong in Relationships.
   ===================================================================== */

(function p775Strip() {
  'use strict';

  const _viewLife = viewLife;
  viewLife = function () {
    let html = '';
    try { html = _viewLife.apply(this, arguments); } catch (e) {
      console.error('[p775] viewLife chain failed:', e);
      html = '<section class="card"><h3>Life</h3><p class="muted">Failed to render. See console.</p></section>';
    }
    if (!html) return html;

    const strip = [
      '👨‍👩‍👧‍👦 Extended family',
      '⭐ Social Standing',
      '💍 Marriage expectations',
      '👥 Household staff',
      '🏦 Family Trust Fund',
      '🛂 Your passport and your options'
    ];

    strip.forEach(function (h) {
      const esc = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp('<section class="card"[^>]*>\\s*<h3>' + esc + '[\\s\\S]*?<\\/section>', 'g'), '');
    });

    /* Also strip family business card */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>💼 [^<]*<\/h3>[\s\S]*?Family ownership[\s\S]*?<\/section>/g,
      ''
    );
    return html;
  };

  console.log('[p775] Life tab strip loaded');
})();
