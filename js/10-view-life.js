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
     const lifeStoryPanel = (typeof lifeStoryHtml === 'function') ? lifeStoryHtml() : '';
     const realityPanel = (typeof realityCheckHtml === 'function') ? realityCheckHtml() : '';
     const familyTreePanel = (typeof familyTreeSummaryHtml === 'function') ? familyTreeSummaryHtml() : '';
     const householdPanel = (typeof householdBreakdownHtml === 'function') ? householdBreakdownHtml() : '';
  return `
    ${lifeStoryPanel}
    ${familyTreePanel}
     ${householdPanel}
  ${happinessPanel}
    <div class="card">  
      <h3>Life Log</h3>
      <div style="max-height:400px;overflow-y:auto;font-size:.85rem">
        ${grouped.map(function(g) {
                    if (g.type === 'header') {
            return '<div style="margin-top:10px;margin-bottom:4px;font-size:.72rem;color:#8b5cf6;letter-spacing:.06em;font-weight:700;border-bottom:1px solid #25253a;padding-bottom:3px">' + headerLabel(g.entry) + '</div>';
          }
          const r = g.entry;
          if (r.isReflection) {
            return '<div style="padding:8px 10px;margin:4px 0;border-left:3px solid #8b5cf6;background:#8b5cf60a;border-radius:4px;font-style:italic;color:#c4b5fd;font-size:.82rem"><span class="muted mono" style="font-size:.62rem;color:#8b5cf6;font-style:normal">' + (r.month && isMonthlyPace ? monthName(r.month).slice(0,3) + ' ' + (r.year || '') : 'Age ' + r.age) + ' · 💭 thought</span><br>' + r.msg + '</div>';
          }
          var isMoment = r.msg && r.msg.indexOf('📌') === 0;
          if (isMoment) {
            return '<div style="padding:6px 10px;margin:2px 0;border-left:3px solid #fbbf24;background:#fbbf2410;border-radius:4px;font-size:.85rem"><span class="muted mono" style="font-size:.62rem;color:#fbbf24">' + (r.month && isMonthlyPace ? monthName(r.month).slice(0,3) + ' ' + (r.year || '') : 'Age ' + r.age) + '</span><br>' + r.msg + '</div>';
          }
                     var isWhisper = r.msg && r.msg.indexOf('🌫') === 0;
          if (isWhisper) {
            return '<div style="padding:5px 10px;margin:3px 0;font-style:italic;color:#a5b4fc;font-size:.8rem;border-left:2px solid #6366f1;background:#6366f108;border-radius:3px"><span class="muted mono" style="font-size:.6rem;font-style:normal">' + (r.month && isMonthlyPace ? monthName(r.month).slice(0,3) + ' ' + (r.year || '') : 'Age ' + r.age) + '</span> ' + r.msg.replace('🌫 ', '') + '</div>';
          }
          var isResolve = r.msg && r.msg.indexOf('🌤') === 0;
          if (isResolve) {
            return '<div style="padding:4px 10px;margin:2px 0;font-style:italic;color:#86efac;font-size:.78rem"><span class="muted mono" style="font-size:.6rem;font-style:normal">' + (r.month && isMonthlyPace ? monthName(r.month).slice(0,3) + ' ' + (r.year || '') : 'Age ' + r.age) + '</span> ' + r.msg.replace('🌤 ', '') + '</div>';
          }
          return '<div style="padding:4px 0;border-bottom:1px solid #1a1a2a"><span class="muted mono" style="font-size:.7rem">' + (r.month && isMonthlyPace ? monthName(r.month).slice(0,3) + ' ' + (r.year || '') : 'Age ' + r.age) + '</span> · ' + r.msg + '</div>';
        }).join('')}
      </div>
    </div>
    ${(typeof lifeGoalsRender === 'function') ? lifeGoalsRender() : ''}
  `;
}

GameHooks.registerTab({ id: 'life', label: 'Life', order: 0, view: lifeView });
/* ============================================================
   LIFE STORY — the narrative view of your whole life
   ============================================================ */
function lifeStoryHtml() {
  if (!S) return '';
  if (S.age < 20) return '';

  var chapter = getChapter();
  var moments = getMoments ? getMoments() : [];
  var recentMoments = moments.slice(0, 6);

  var html = '<div class="card" style="border-color:' + chapter.color + ';background:linear-gradient(180deg,' + chapter.color + '10 0%,transparent 100%)">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700;color:' + chapter.color + '">📖 YOUR STORY</div>' +
    '<div style="font-size:1.05rem;font-weight:700;margin-top:2px">' + chapter.name + '</div>' +
    '<div class="muted small" style="margin-top:2px">' + chapter.note + '</div></div>' +
    '<div style="font-size:1.8rem">📖</div></div>';

  /* Highlights line */
  var stats = [];
  if (moments.length > 0) stats.push(moments.length + ' moment' + (moments.length > 1 ? 's' : ''));
  if ((S.reflections || []).length > 0) stats.push((S.reflections || []).length + ' reflection' + ((S.reflections || []).length > 1 ? 's' : ''));
  if (stats.length > 0) {
    html += '<div class="muted small" style="margin-top:8px;color:#888">' + stats.join(' · ') + '</div>';
  }
  html += '</div>';

  /* Recent moments */
  if (recentMoments.length > 0) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">📌 Moments That Stayed</h3>';
    recentMoments.forEach(function(m) {
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="font-weight:700;font-size:.9rem">' + m.icon + ' ' + m.title + '</div>' +
        '<span class="muted mono small" style="font-size:.7rem">' + m.year + ' · age ' + m.age + '</span></div>' +
        (m.description ? '<div class="muted small" style="margin-top:3px;font-style:italic">' + m.description + '</div>' : '') +
        '</div>';
    });
    html += '</div>';
  }

  /* Latest reflection */
  var refl = S.reflections || [];
  if (refl.length > 0) {
    var lastRefl = refl[refl.length - 1];
    html += '<div class="card" style="border-color:#8b5cf6;background:#8b5cf608">' +
      '<h3 style="color:#8b5cf6">💭 A Recent Thought</h3>' +
      '<div style="font-style:italic;color:#c4b5fd;font-size:.9rem;line-height:1.5">' + lastRefl.text + '</div>' +
      '<div class="muted small" style="margin-top:6px;color:#8b5cf6">' + lastRefl.year + ' · age ' + lastRefl.age + '</div>' +
      '</div>';
  }

  /* Chapter timeline */
  if (S.age >= 25) {
    var passedChapters = CHAPTERS.filter(function(c) { return c.maxAge < S.age; });
    if (passedChapters.length > 0) {
      html += '<div class="card"><h3>📚 Chapters So Far</h3>';
      passedChapters.forEach(function(c) {
        html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a;display:flex;justify-content:space-between;align-items:center">' +
          '<div><div style="font-weight:700;color:' + c.color + ';font-size:.85rem">' + c.name + '</div>' +
          '<div class="muted small">' + c.note + '</div></div>' +
          '<span class="muted mono small">ended age ' + c.maxAge + '</span></div>';
      });
      html += '</div>';
    }
  }

  return html;
}
window.lifeStoryHtml = lifeStoryHtml;
/* ============================================================
   SESSION 8: REALITY CHECK — where you live and why it's hard
   ============================================================ */
function realityCheckHtml() {
  if (!S) return '';
  var country = S.country;
  var prof = econProfile ? econProfile(country) : null;
  if (!prof) return '';

  var diff = econDifficulty(country);
  var diffColor = diff >= 7 ? '#fb7185' : diff >= 5 ? '#fbbf24' : '#34d399';
  var struggles = econStruggles(country);
  var cName = COUNTRIES[country] ? COUNTRIES[country].name : country;
  var flag = COUNTRIES[country] ? COUNTRIES[country].flag : '🌍';

  var html = '<div class="card" style="border-color:' + diffColor + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700;color:' + diffColor + '">REALITY CHECK · ' + flag + ' ' + cName.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1rem;margin-top:2px">Difficulty: ' + diff + '/10</div></div>' +
    '<div style="font-size:1.6rem">' + (diff >= 7 ? '🔥' : diff >= 5 ? '⚡' : '✓') + '</div></div>';

  if (struggles.length > 0) {
    html += '<div style="margin-top:8px;font-size:.75rem;color:#888">Real challenges here:</div>';
    struggles.forEach(function(s) {
      html += '<div style="padding:4px 0;font-size:.78rem;color:#e8e8f2">' + s.icon + ' ' + s.text + '</div>';
    });
  }

  /* Reference points */
  html += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #252a3a">' +
    '<div class="muted small" style="font-size:.7rem;letter-spacing:.04em;font-weight:700;margin-bottom:4px">REFERENCE PRICES (' + gameYear() + ')</div>';

  var refs = [
    { label: 'Monthly food (basic)', value: econPriceMonthly('food', country, gameYear()) },
    { label: 'Monthly transport', value: econPriceMonthly('transport', country, gameYear()) },
    { label: '2BR rent / year (mid area)', value: econRent('br2', country, gameYear()) }
  ];

  refs.forEach(function(r) {
    html += '<div class="row" style="padding:3px 0;font-size:.75rem"><span>' + r.label + '</span><b class="mono">' + money(r.value) + '</b></div>';
  });

  html += '</div></div>';
  return html;
}
window.realityCheckHtml = realityCheckHtml;
/* ============================================================
   SESSION 10: FAMILY TREE SUMMARY — one glance at everyone
   ============================================================ */
function familyTreeSummaryHtml() {
  if (!S) return '';

  var sections = [];

  /* Spouse */
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    var p = S.marriage.partner;
    sections.push({
      label: '💍 Spouse',
      people: [{ name: p.name, age: p.age, role: p.career ? (p.career.title || 'Working') : 'Homemaker', bond: p.bond || 70 }]
    });
  }

  /* Parents */
  var parents = (S.family || []).filter(function(m) { return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false; });
  if (parents.length) {
    sections.push({
      label: '👨‍👩‍👧 Parents',
      people: parents.map(function(m) { return { name: m.name, age: m.age, role: m.role, bond: m.bond || 70 }; })
    });
  }

  /* Siblings + their families */
  if (typeof getSiblingFamilyTree === 'function') {
    var sibTree = getSiblingFamilyTree().filter(function(s) { return s.sibling.alive !== false; });
    if (sibTree.length) {
      var sibPeople = [];
      sibTree.forEach(function(s) {
        sibPeople.push({ name: s.sibling.name, age: s.sibling.age, role: s.sibling.role || 'Sibling', bond: s.sibling.bond || 70 });
        if (s.spouse) sibPeople.push({ name: s.spouse.name, age: s.spouse.age, role: 'spouse of ' + s.sibling.name, bond: 60, muted: true });
        (s.children || []).forEach(function(nc) {
          sibPeople.push({ name: nc.name, age: nc.age, role: 'niece/nephew of ' + s.sibling.name, bond: 60, muted: true });
        });
      });
      sections.push({ label: '👫 Siblings & Their Families', people: sibPeople });
    }
  }

  /* In-laws */
  if (typeof getInLaws === 'function') {
    var il = getInLaws().filter(function(m) { return m.alive !== false; });
    if (il.length) {
      sections.push({
        label: '👨‍👩‍👧 In-Laws',
        people: il.map(function(m) { return { name: m.name, age: m.age, role: m.role, bond: m.bond || 50 }; })
      });
    }
  }

  /* Children */
  var kids = (S.childrenList || []).filter(function(c) { return !c.movedOut; });
  if (kids.length) {
    var kidPeople = [];
    kids.forEach(function(c) {
      kidPeople.push({ name: c.name, age: c.age, role: c.age >= 18 && c.career ? c.career.title : (c.age >= 6 ? 'Student' : 'Child'), bond: c.bond || 55 });
      if (c.spouse) kidPeople.push({ name: c.spouse.name, age: c.spouse.age, role: 'spouse of ' + c.name, bond: 60, muted: true });
    });
    sections.push({ label: '👨‍👧 Your Children', people: kidPeople });
  }

  /* Grandchildren */
  if (typeof getAllGrandchildren === 'function') {
    var gcs = getAllGrandchildren();
    if (gcs.length) {
      sections.push({
        label: '👶 Grandchildren',
        people: gcs.map(function(gc) { return { name: gc.name, age: gc.age, role: 'grandchild', bond: gc.bond || 70 }; })
      });
    }
  }

  if (sections.length === 0) return '';

  var totalPeople = sections.reduce(function(s, x) { return s + x.people.length; }, 0);

  var html = '<div class="card" style="border-color:#8b5cf6"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="color:#8b5cf6">👪 Your Family</h3><span class="muted small">' + totalPeople + ' people</span></div>';
  sections.forEach(function(sec) {
    html += '<div style="margin-top:10px"><div class="muted small" style="letter-spacing:.06em;font-weight:700;color:#8b5cf6">' + sec.label + '</div>';
    sec.people.forEach(function(person) {
      var color = person.muted ? '#666' : (person.bond > 70 ? '#34d399' : person.bond > 40 ? '#fbbf24' : '#fb7185');
      html += '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:.78rem">' +
        '<span style="color:' + (person.muted ? '#888' : '#e8e8f2') + '">' + person.name + ' <span class="muted" style="font-size:.7rem">(' + person.role + ', age ' + person.age + ')</span></span>' +
        '<span class="mono" style="color:' + color + ';font-size:.7rem">' + person.bond + '%</span>' +
        '</div>';
    });
    html += '</div>';
  });
  html += '</div>';
  return html;
}
window.familyTreeSummaryHtml = familyTreeSummaryHtml;
