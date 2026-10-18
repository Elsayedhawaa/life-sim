/* ============================================================
   VIEW: CAREER TAB + applyForJob + quitJob
   ============================================================ */

function careerView() {
  if (S.age < 18) return `<div class="card"><h3>Career</h3><p class="muted">Available from age 18.</p></div>`;

  if (S.job) {
    return `<div class="card">
      <h3>${S.job.title}</h3>
      <p class="muted small">${S.job.company}</p>
      <div class="row"><span>Salary</span><b class="mono good">${money(S.job.salary)}/year</b></div>
      <div class="row"><span>Level</span><b>${(S.job.level||0)+1}/5</b></div>
      <div class="row"><span>Tenure</span><b>${S.job.years} year(s)</b></div>
      <button class="opt" style="margin-top:10px" onclick="quitJob()">Resign</button>
    </div>`;
  }

  const studying = !!S.uni;
  return `<div class="card">
    <h3>Job Market</h3>
    ${studying ? `<p class="bad small" style="margin-bottom:10px">You cannot work full-time while studying at ${S.uni.name}. Finish university first.</p>` : `<p class="muted small">Choose a job to apply. Each application passes 3 rounds or gets rejected.</p>`}
    ${C().jobs.map(j => {
      const eligible = S.age >= j.minAge && (!j.degree || S.degree === j.degree) && !studying;
      let reason = '';
      if (S.age < j.minAge) reason = `Age ${j.minAge}+`;
      else if (j.degree && S.degree !== j.degree) reason = `Needs ${j.degree} degree`;
      else if (studying) reason = 'Finish university first';
      return `<div class="row"><span>${j.title} <span class="muted small">· ${j.company}</span></span><span><b class="mono">${money(j.salary)}/yr</b>${eligible ? `<button class="opt" style="margin-top:4px;padding:6px" onclick="applyForJob('${j.id}')">Apply</button>` : `<span class="bad small" style="display:block;margin-top:4px">${reason}</span>`}</span></div>`;
    }).join('')}
  </div>`;
}

function applyForJob(jobId) {
  const job = C().jobs.find(j => j.id === jobId);
  if (!job) return;
  if (S.age < job.minAge) return;
  if (job.degree && S.degree !== job.degree) return;
  if (S.job) return;
  if (S.uni) {
    log(`Cannot work full-time while studying at ${S.uni.name}. Finish university first.`);
    render(); return;
  }
  const chance = 0.25 + (S.smarts / 200) + (S.social / 400) + ((S.uni || S.degree) ? 0.15 : 0);
  if (Math.random() < chance) {
    S.job = {
      id: job.id, title: job.title, company: job.company,
      salary: job.salary, level: 0, years: 0,
    };
    log(`Hired at ${job.company} as ${job.title}! Salary ${money(job.salary)}/year.`);
    S.happiness = clamp(S.happiness + 5, 0, 100);
  } else {
    log(`Rejected by ${job.company} for ${job.title}.`);
    S.happiness = clamp(S.happiness - 2, 0, 100);
  }
  render();
}

function quitJob() {
  if (!S.job) return;
  log(`Resigned from ${S.job.company}.`);
  S.job = null;
  render();
}

window.applyForJob = applyForJob;
window.quitJob = quitJob;
GameHooks.registerTab({ id: 'career', label: 'Career', order: 2, view: careerView });
