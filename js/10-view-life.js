/* ============================================================
   VIEW: LIFE TAB
   ============================================================ */

function lifeView() {
  let status = `${S.age} years old, ${C().name}.`;
  if (S.school && S.age < 18) status += ' In school.';
  if (S.uni) status += ` University: ${S.uni.name} (Year ${S.uni.year + 1} of ${S.uni.yearsTotal}).`;
  if (S.degree) status += ` Degree: ${S.degree}.`;
  if (S.job) status += ` Working at ${S.job.company}.`;
  if (S.spouse) status += ` Married to ${S.spouse.name}.`;
  if (S.children > 0) status += ` ${S.children} child(ren).`;

  return `
    <div class="card">
      <h3>Life</h3>
      <p class="muted small">${status}</p>
    </div>
    <div class="card">
      <h3>Life Log</h3>
      <div style="max-height:320px;overflow-y:auto;font-size:.85rem">
        ${S.log.map(r => `<div style="padding:5px 0;border-bottom:1px solid #1a1a2a"><span class="muted mono" style="font-size:.75rem">Age ${r.age}</span> · ${r.msg}</div>`).join('')}
      </div>
    </div>`;
}

GameHooks.registerTab({ id: 'life', label: 'Life', order: 0, view: lifeView });
