/* =====================================================================
   31. VIEWSCHOOL SAFETY NET
   If any wrapper in the chain returns undefined/empty, fall back to a
   guaranteed-valid school screen so the game can never lock the player out.
   Load AFTER 29/30 and BEFORE 99-boot.js
   ===================================================================== */

function p31BaseSchoolFallback() {
  if (!S) return '';
  const efforts = Object.entries(EFFORT).map(([k, e]) =>
    `<button class="btn ${S.effort === k ? 'sel' : ''}" onclick="pickEffort('${k}')">${e.label}</button>`
  ).join('');
  const effortCard = `<section class="card"><h3>Effort this year</h3>
    <p class="muted">Applied when you age up.${S.age < 18 ? ' Years skipped: ' + S.skips + '.' : ''}</p>
    ${efforts}</section>`;

  // Under 18 → school picker
  if (S.age < 18) {
    const schools = Object.entries(SCHOOLS).map(([k, s]) => {
      const why = (typeof schoolBlock === 'function') ? schoolBlock(k) : '';
      const cost = s.cost ? (typeof money === 'function' ? money(s.cost) : s.cost) + '/yr, paid by parents' : 'Free';
      return `<button class="btn ${S.school === k ? 'sel' : ''}" ${why ? 'disabled' : ''} onclick="pickSchool('${k}')">${s.name} · ${cost}<small>${why || s.desc}</small></button>`;
    }).join('');
    return `<section class="card"><h3>School</h3>
      <p class="muted">Family status: <b>${FAMILY[S.famWealth]}</b>. Pick a school before you age up.</p>
      ${schools}</section>` + effortCard;
  }

  // Enrolled at university
  if (S.uni) {
    const u = S.uni;
    const name = u.universityName || (u.universityId && typeof EGYPT_UNIVERSITIES !== 'undefined' && EGYPT_UNIVERSITIES[u.universityId] ? EGYPT_UNIVERSITIES[u.universityId].name : null) || (UNIS[u.type] ? UNIS[u.type].name : 'University');
    const faculty = u.faculty || (u.major && MAJORS[u.major] ? MAJORS[u.major].name : null) || 'your program';
    const yearsTotal = u.yearsTotal || (u.major && MAJORS[u.major] ? MAJORS[u.major].years : 4);
    const costDisplay = u.annualCostEGP ? u.annualCostEGP.toLocaleString() + ' EGP/yr' : (u.annualCostInternal ? (typeof money === 'function' ? money(u.annualCostInternal) : u.annualCostInternal) + '/yr' : '');
    return `<section class="card"><h3>${faculty} · ${name}</h3>
      <p class="muted">Year ${u.year} of ${yearsTotal}. ${costDisplay ? 'Tuition: ' + costDisplay + '.' : ''} Student loan: ${typeof money === 'function' ? money(S.loan || 0) : S.loan || 0}.</p>
      <button class="btn" onclick="dropOut()">Drop out</button></section>` + effortCard;
  }

  // Graduated
  if (S.degree) {
    const name = MAJORS[S.degree] ? MAJORS[S.degree].name : S.degree;
    return `<section class="card"><h3>Graduate</h3>
      <p class="muted">Degree: <b>${name}</b>. Higher career levels unlocked!</p></section>`;
  }

  // No diploma
  if (!S.diploma) {
    return `<section class="card"><h3>No diploma</h3>
      <p class="muted">You left school without a diploma.</p></section>`;
  }

  // Diploma, not enrolled → Egypt gets the Egypt UI, others get the standard UI
  if (S.country === 'egy' && typeof viewEgyptUniversitySelection === 'function') {
    const egyptUI = viewEgyptUniversitySelection();
    if (egyptUI) return egyptUI + effortCard;
  }

  // Standard (non-Egypt) university picker
  const skipUniCard = `<section class="card" style="border:1px solid var(--cyan)">
    <h3>Skip University</h3>
    <p class="muted">University is optional. You can work with your high school diploma instead.</p>
    <button class="btn" style="text-align:center;background:var(--violet);color:#fff;font-weight:700;margin-top:8px" onclick="go('career')">Skip University & View Jobs</button>
  </section>`;
  const payBtns = Object.entries(PAYERS).map(([k, p]) =>
    `<button class="btn ${S.payPref === k ? 'sel' : ''}" onclick="setPay('${k}')">${p.label}<small>${p.desc}</small></button>`
  ).join('');
  const majors = Object.entries(MAJORS).map(([k, m]) => `<div style="margin-top:12px"><b>${m.name}</b> <span class="muted">· ${m.years} yrs · Req Smarts ${m.min}%</span>
    <div class="acts" style="margin-top:6px">
      <button class="btn" onclick="enrollUni('national','${k}')">National · ${typeof money === 'function' ? money(UNIS.national.tuition) : UNIS.national.tuition}/yr</button>
      <button class="btn" onclick="enrollUni('private','${k}')">Private · ${typeof money === 'function' ? money(UNIS.private.tuition) : UNIS.private.tuition}/yr</button>
    </div></div>`).join('');

  return skipUniCard
    + `<section class="card"><h3>Who pays tuition?</h3>${payBtns}</section>`
    + `<section class="card"><h3>University Options</h3>${majors}</section>`
    + effortCard;
}

/* Final safety wrapper: if the whole chain returns empty/undefined, use the fallback. */
const P31_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let out;
  try {
    out = P31_viewSchoolBefore();
  } catch (e) {
    console.error('viewSchool chain threw, using fallback:', e);
    out = '';
  }
  if (out == null || String(out).trim() === '') {
    console.warn('viewSchool returned empty — using safety fallback.');
    out = p31BaseSchoolFallback();
  }
  return out;
};
