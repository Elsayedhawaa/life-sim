/* ============================================================
   VIEW: FAMILY TAB
   ============================================================ */

function familyView() {
  return `
    <div class="card">
      <h3>Family</h3>
      ${S.family.map(m => `
        <div class="row"><span><b>${m.name}</b> · ${m.role}</span><span class="muted small">age ${m.age} · bond ${m.bond}%</span></div>
      `).join('')}
      ${S.children > 0 ? `<div class="row" style="margin-top:8px"><span>Children</span><b>${S.children}</b></div>` : ''}
    </div>`;
}

GameHooks.registerTab({ id: 'family', label: 'Family', order: 3, view: familyView });
