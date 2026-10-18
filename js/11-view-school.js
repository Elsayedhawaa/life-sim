/* ============================================================
   VIEW: EDUCATION TAB + enrollUniversity
   ============================================================ */

function schoolView() {
  if (S.age < 6) return `<div class="card"><h3>Education</h3><p class="muted">Not yet in school.</p></div>`;

  if (S.age < 18) {
    const cur = S.school ? (C().schools.find(x=>x.id===S.school)||{name:S.school}).name : 'Not enrolled';
    return `<div class="card"><h3>School</h3><p class="muted small">Current: <b style="color:#e8e8f2">${cur}</b></p>${S.thanaweyaScore ? `<p class="small" style="margin-top:8px">Thanaweya score: <b class="gold">${S.thanaweyaScore.toFixed(1)}%</b></p>` : ''}</div>`;
  }

  if (S.age >= 18 && S.age <= 22 && !S.uni && !S.degree) {
    const score = S.thanaweyaScore || 0;
    return `<div class="card">
      <h3>University (tansik)</h3>
      <p class="muted small">Your thanaweya score: <b class="gold">${score.toFixed(1)}%</b></p>
      <h4>Options</h4>
      ${C().universities.map(u => {
        const eligible = score >= u.cutoff;
        const affordable = u.type === 'public' || S.wealth >= u.tuition;
        return `<div class="row"><span>${u.name} <span class="muted small">· ${u.type}</span></span><span><b class="mono">${u.tuition === 0 ? 'free' : money(u.tuition) + '/yr'}</b>${eligible ? `<button class="opt" style="margin-top:4px;padding:6px" onclick="enrollUniversity('${u.id}')" ${!affordable?'disabled':''}>${affordable?'Enroll':'Cannot afford'}</button>` : `<span class="bad small" style="display:block;margin-top:4px">Needs ${u.cutoff}% (you have ${score.toFixed(0)}%)</span>`}</span></div>`;
      }).join('')}
    </div>`;
  }

  if (S.uni) {
    return `<div class="card"><h3>${S.uni.name}</h3><p class="muted small">${S.uni.major} · Year ${S.uni.year + 1} of ${S.uni.yearsTotal}. Tuition: ${money(S.uni.tuition)}/year.</p></div>`;
  }

  if (S.degree) {
    return `<div class="card"><h3>Graduated</h3><p class="muted small">Degree: <b>${S.degree}</b>. Career unlocked.</p></div>`;
  }

  return `<div class="card"><h3>Education</h3><p class="muted">—</p></div>`;
}

function enrollUniversity(uniId) {
  const uni = C().universities.find(u => u.id === uniId);
  if (!uni) return;
  if (!S.thanaweyaScore || S.thanaweyaScore < uni.cutoff) {
    log(`Rejected by ${uni.name} — thanaweya score too low.`);
    render(); return;
  }
  if (S.wealth < uni.tuition && uni.type === 'private') {
    log(`Cannot afford ${uni.name}. Tuition: ${money(uni.tuition)}/year.`);
    render(); return;
  }
  const majors = ['engineering', 'business', 'law', 'cs', 'medicine', 'biology'];
  const chosen = prompt(`Choose your major:\n${majors.join(', ')}`);
  if (!chosen) return;
  const major = chosen.toLowerCase().trim();
  if (!majors.includes(major)) {
    log('Invalid major. Enrollment cancelled. Try: ' + majors.join(', '));
    render(); return;
  }
  S.uni = {
    id: uni.id, name: uni.name, type: uni.type,
    tuition: uni.tuition, year: 0, yearsTotal: 4, major,
  };
  if (uni.type === 'private') S.wealth -= uni.tuition;
  log(`Enrolled at ${uni.name} in ${major}. Tuition: ${money(uni.tuition)}/year.`);
  render();
}

window.enrollUniversity = enrollUniversity;
GameHooks.registerTab({ id: 'school', label: 'Education', order: 1, view: schoolView });
