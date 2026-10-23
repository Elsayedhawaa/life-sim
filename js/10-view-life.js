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

  /* Group log by year-month */
  const isMonthlyPace = (typeof isMonthly === 'function' && isMonthly());
  const grouped = [];
  let lastKey = null;
  (S.log || []).forEach(function(entry) {
    const key = isMonthlyPace
      ? (entry.year || '') + '-' + (entry.month || '')
      : String(entry.year || entry.age || '');
    if (key !== lastKey) {
      grouped.push({ type: 'header', key: key, entry: entry });
      lastKey = key;
    }
    grouped.push({ type: 'entry', entry: entry });
  });

  function headerLabel(entry) {
    if (isMonthlyPace && entry.month) {
      return monthName(entry.month) + ' ' + (entry.year || '');
    }
    if (isMonthlyPace) return 'Age ' + entry.age + ' · ' + (entry.year || '');
    return 'Age ' + entry.age + (entry.year ? ' · ' + entry.year : '');
  }
  const happinessPanel = (typeof happinessBreakdownHtml === 'function') ? happinessBreakdownHtml() : '';
  return `
  ${happinessPanel}
    <div class="card">  
      <h3>Life Log</h3>
      <div style="max-height:400px;overflow-y:auto;font-size:.85rem">
        ${grouped.map(function(g) {
          if (g.type === 'header') {
            return '<div style="margin-top:10px;margin-bottom:4px;font-size:.72rem;color:#8b5cf6;letter-spacing:.06em;font-weight:700;border-bottom:1px solid #25253a;padding-bottom:3px">' + headerLabel(g.entry) + '</div>';
          }
          const r = g.entry;
          return '<div style="padding:4px 0;border-bottom:1px solid #1a1a2a"><span class="muted mono" style="font-size:.7rem">' + (r.month && isMonthlyPace ? monthName(r.month).slice(0,3) + ' ' + (r.year || '') : 'Age ' + r.age) + '</span> · ' + r.msg + '</div>';
        }).join('')}
      </div>
    </div>
    ${(typeof lifeGoalsRender === 'function') ? lifeGoalsRender() : ''}
  `;
}

GameHooks.registerTab({ id: 'life', label: 'Life', order: 0, view: lifeView });
