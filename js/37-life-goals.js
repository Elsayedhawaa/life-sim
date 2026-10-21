/* ============================================================
   LIFE GOALS + ACHIEVEMENTS + STORY DASHBOARD
   ============================================================
   Ties all systems together with:
   - Multi-step life goals (across 5+ systems each)
   - Achievements that unlock from any system's signals
   - "Your Story" dashboard showing the whole journey
   ============================================================ */

function ensureLifeGoalsState() {
  if (!S) return;
  if (!S.lifeGoals) S.lifeGoals = { active: [], completed: [], achievements: [] };
  if (!Array.isArray(S.lifeGoals.active)) S.lifeGoals.active = [];
  if (!Array.isArray(S.lifeGoals.completed)) S.lifeGoals.completed = [];
  if (!Array.isArray(S.lifeGoals.achievements)) S.lifeGoals.achievements = [];
}
GameHooks.on('newGame', ensureLifeGoalsState);
GameHooks.on('migrate', ensureLifeGoalsState);

/* ---------- GOAL DEFINITIONS ---------- */
const LIFE_GOAL_TEMPLATES = [
  {
    id: 'buy_home_home',
    label: 'Buy a home in your home country',
    desc: 'Own property where you come from — every Egyptian abroad dreams of this.',
    reward: 'Reduced remittance pressure · Ready for return home',
    check: function() { return (S.ownedHomes || []).some(function(h) { return h.country === (S.homeCountry || 'egy') && h.status !== 'sold'; }); }
  },
  {
    id: 'return_home',
    label: 'Return home permanently',
    desc: 'Go back for good, ready to live.',
    reward: '+25 happiness · family bonds up',
    check: function() { return S.expat && S.expat.passToReturnHome; }
  },
  {
    id: 'gold_stash',
    label: 'Accumulate 50g of gold',
    desc: 'Build a real gold stash — the classic Egyptian inflation hedge.',
    reward: 'Family sees you as "settled"',
    check: function() { return S.expat && S.expat.goldStash && S.expat.goldStash.reduce(function(s, g) { return s + g.grams; }, 0) >= 50; }
  },
  {
    id: 'first_1m',
    label: 'Save 1 million EGP equivalent',
    desc: 'The first million is the hardest. A real Egyptian milestone.',
    reward: 'Achievement unlocked',
    check: function() { return typeof expatWealthInHome === 'function' && expatWealthInHome() >= 1000000; }
  },
  {
    id: 'first_10m',
    label: 'Save 10 million EGP equivalent',
    desc: 'Ten million — generational wealth starts here.',
    reward: 'Family status rises',
    check: function() { return typeof expatWealthInHome === 'function' && expatWealthInHome() >= 10000000; }
  },
  {
    id: 'first_child',
    label: 'Have your first child',
    desc: 'Continue the family line.',
    reward: 'Family bond up',
    check: function() { return (S.childrenList || []).length >= 1; }
  },
  {
    id: 'raise_children',
    label: 'Raise 2 children to age 18',
    desc: 'See them grow up.',
    reward: 'Legacy',
    check: function() { return (S.childrenList || []).filter(function(c) { return c.age >= 18; }).length >= 2; }
  },
  {
    id: 'own_business',
    label: 'Own a profitable business',
    desc: 'Be your own boss.',
    reward: 'Career independence',
    check: function() { return S.career && S.career.businesses && S.career.businesses.some(function(b) { return (b.monthlyProfit || 0) > 0; }); }
  },
  {
    id: 'second_passport',
    label: 'Obtain a second passport',
    desc: 'The Egyptian dream — a passport that opens doors.',
    reward: 'Ultimate freedom',
    check: function() { return S.passports && S.passports.length >= 2; }
  },
  {
    id: 'buy_apartment_cairo',
    label: 'Buy an apartment in Cairo or Alexandria',
    desc: 'The city where you grew up.',
    reward: 'A home in the motherland',
    check: function() {
      return (S.ownedHomes || []).some(function(h) {
        return h.country === 'egy' && h.status !== 'sold' &&
          (h.city === 'Cairo' || h.city === 'Alexandria' || h.city === 'New Cairo');
      });
    }
  },
  {
    id: 'visit_family',
    label: 'Return to Egypt to visit family 3 times',
    desc: 'The trips that make the distance worth it.',
    reward: 'Family remains close',
    check: function() {
      if (!S.vacation || !Array.isArray(S.vacation.history)) return false;
      return S.vacation.history.filter(function(t) { return t.country === 'egy' || t.destId === 'cairo_home'; }).length >= 3;
    }
  },
  {
    id: 'career_top',
    label: 'Reach the top of your career track',
    desc: 'Director, Professor, Chief — the pinnacle.',
    reward: 'Legacy + prestige',
    check: function() {
      if (!S.career || !S.career.job) return false;
      const track = (typeof carTrackById === 'function') ? carTrackById(S.career.job.track) : null;
      return track && S.career.job.level >= track.levels.length - 1;
    }
  },
  {
    id: 'pension_ready',
    label: 'Reach age 60 with 1M+ in pension',
    desc: 'Retire with dignity.',
    reward: 'Comfortable retirement',
    check: function() {
      return S.age >= 60 && S.career && S.career.pension && S.career.pension.accumulated >= 1000000;
    }
  }
];

/* ---------- ACHIEVEMENTS ---------- */
const ACHIEVEMENTS = [
  { id: 'first_job',           label: 'First Job',                icon: '💼', desc: 'Got your first full-time job.' },
  { id: 'first_promotion',     label: 'First Promotion',          icon: '📈', desc: 'Promoted for the first time.' },
  { id: 'first_car',           label: 'First Car',                icon: '🚗', desc: 'Bought your first car.' },
  { id: 'first_home',          label: 'First Home',               icon: '🏠', desc: 'Bought your first property.' },
  { id: 'married',             label: 'Married',                  icon: '💍', desc: 'Got married.' },
  { id: 'first_child',         label: 'First Child',              icon: '👶', desc: 'Had your first child.' },
  { id: 'three_children',      label: 'Big Family',               icon: '👨‍👩‍👧‍👦', desc: 'Had 3 children.' },
  { id: 'first_million',       label: 'First Million',            icon: '💰', desc: 'Saved 1M EGP equivalent.' },
  { id: 'ten_million',         label: 'Ten Million',              icon: '💎', desc: 'Saved 10M EGP equivalent.' },
  { id: 'bought_apartment_egy',label: 'Home in Egypt',            icon: '🏡', desc: 'Bought property back home.' },
  { id: 'returned_home',       label: 'Returned Home',            icon: '🇪🇬', desc: 'Moved back to your home country.' },
  { id: 'gold_stash',          label: 'Gold Hoarder',             icon: '🪙', desc: 'Accumulated 50g of gold.' },
  { id: 'gone_abroad',         label: 'Went Abroad',              icon: '✈️', desc: 'Moved to another country for work.' },
  { id: 'worked_in_gulf',      label: 'Gulf Worker',              icon: '🇸🇦', desc: 'Worked a Gulf sponsorship job.' },
  { id: 'second_passport',     label: 'Second Passport',          icon: '🌐', desc: 'Obtained citizenship of another country.' },
  { id: 'business_owner',      label: 'Business Owner',           icon: '🏪', desc: 'Ran a profitable business.' },
  { id: 'ten_countries',       label: 'World Traveler',           icon: '🌍', desc: 'Visited 10 different countries.' },
  { id: 'helped_family',       label: 'Family Provider',          icon: '👨‍👩‍👧', desc: 'Sent 500,000+ EGP home to family.' },
  { id: 'survived_recession',  label: 'Survived a Recession',     icon: '📉', desc: 'Kept your job through an economic crisis.' },
  { id: 'paid_off_debt',       label: 'Debt Free',                icon: '✅', desc: 'Paid off all loans and credit cards.' },
  { id: 'expat_5_years',       label: '5 Years Abroad',           icon: '🌐', desc: 'Lived abroad for 5 years.' },
  { id: 'expat_10_years',      label: 'Decade Abroad',            icon: '🌐', desc: 'Lived abroad for 10 years.' },
  { id: 'bought_gold',         label: 'Gold Buyer',               icon: '🪙', desc: 'Bought your first gold.' },
  { id: 'returned_visit',      label: 'Home for Visit',           icon: '✈️', desc: 'Visited home from abroad.' },
  { id: 'career_top',          label: 'Top of Your Field',        icon: '🏆', desc: 'Reached the top of your career track.' }
];

/* ---------- STATE CHECKS ---------- */
function lifeGoalsCheckAchievements() {
  if (!S || !S.lifeGoals) return;
  const unlocked = S.lifeGoals.achievements;
  const allAchievements = ACHIEVEMENTS;

  const checks = {
    first_job: !!(S.job || (S.career && S.career.job)),
    first_promotion: !!(S.career && S.career.milestones && S.career.milestones.some(function(m) { return m.id === 'first_promotion'; })),
    first_car: (S.cars && S.cars.length > 0) || (S.carHistory && S.carHistory.length > 0),
    first_home: (S.ownedHomes || []).length > 0,
    married: S.marriage && S.marriage.status === 'married',
    first_child: (S.childrenList || []).length >= 1,
    three_children: (S.childrenList || []).length >= 3,
    first_million: typeof expatWealthInHome === 'function' && expatWealthInHome() >= 1000000,
    ten_million: typeof expatWealthInHome === 'function' && expatWealthInHome() >= 10000000,
    bought_apartment_egy: (S.ownedHomes || []).some(function(h) { return h.country === 'egy' && h.status !== 'sold'; }),
    returned_home: S.expat && S.expat.passToReturnHome,
    gold_stash: S.expat && S.expat.goldStash && S.expat.goldStash.reduce(function(s, g) { return s + g.grams; }, 0) >= 50,
    gone_abroad: S.homeCountry && S.country !== S.homeCountry,
    worked_in_gulf: (S.country === 'sau' || S.country === 'uae') && S.gulfWork && S.gulfWork.active,
    second_passport: S.passports && S.passports.length >= 2,
    business_owner: S.career && S.career.businesses && S.career.businesses.some(function(b) { return (b.monthlyProfit || 0) > 0; }),
    ten_countries: S.vacation && S.vacation.history && (new Set(S.vacation.history.map(function(t) { return t.country; }))).size >= 10,
    helped_family: (S.family || []).some(function(m) { return (m.wealth || 0) >= 500000; }),
    paid_off_debt: (function() {
      if (!S.bank) return false;
      const debt = bankGetTotalDebt ? bankGetTotalDebt() : 0;
      return (S.lifeGoals._hadDebt) && debt === 0;
    })(),
    expat_5_years: S.expat && S.expat.yearsAbroad >= 5,
    expat_10_years: S.expat && S.expat.yearsAbroad >= 10,
    bought_gold: S.expat && S.expat.goldStash && S.expat.goldStash.length > 0,
    returned_visit: S.vacation && S.vacation.history && S.vacation.history.some(function(t) { return t.country === (S.homeCountry || 'egy'); }),
    career_top: (function() {
      if (!S.career || !S.career.job) return false;
      const track = (typeof carTrackById === 'function') ? carTrackById(S.career.job.track) : null;
      return track && S.career.job.level >= track.levels.length - 1;
    })()
  };

  /* Track if player has ever had debt (for debt-free achievement) */
  if (!S.lifeGoals._hadDebt) {
    if (S.bank && bankGetTotalDebt && bankGetTotalDebt() > 0) S.lifeGoals._hadDebt = true;
  }

  /* Unlock new achievements */
  Object.keys(checks).forEach(function(id) {
    if (unlocked.indexOf(id) >= 0) return;
    if (!checks[id]) return;
    const ach = allAchievements.find(function(a) { return a.id === id; });
    if (!ach) return;
    unlocked.push(id);
    log('🏆 Achievement unlocked: ' + ach.label);
    emitSignal('achievementUnlocked', { id: id, label: ach.label });
  });

  /* Check life goals */
  LIFE_GOAL_TEMPLATES.forEach(function(goal) {
    if (S.lifeGoals.completed.indexOf(goal.id) >= 0) return;
    if (!S.lifeGoals.active.some(function(g) { return g.id === goal.id; })) {
      /* Auto-add all goals to active */
      S.lifeGoals.active.push({ id: goal.id, addedYear: gameYear() });
    }
    if (goal.check()) {
      S.lifeGoals.completed.push(goal.id);
      S.lifeGoals.active = S.lifeGoals.active.filter(function(g) { return g.id !== goal.id; });
      log('🎯 GOAL COMPLETE: ' + goal.label);
      fx({ happiness: 12 });
      emitSignal('lifeGoalCompleted', { goalId: goal.id });
    }
  });
}

GameHooks.on('year', function() {
  ensureLifeGoalsState();
  if (!S) return;
  lifeGoalsCheckAchievements();
});

GameHooks.on('render', function() {
  ensureLifeGoalsState();
  if (!S) return;
  /* Also check achievements on every render for fast catches (job start, marriage, etc.) */
  lifeGoalsCheckAchievements();
});

/* ---------- RENDER ---------- */
window.lifeGoalsRender = function() {
  ensureLifeGoalsState();
  if (!S) return '';
  const lg = S.lifeGoals;
  const activeGoals = LIFE_GOAL_TEMPLATES.filter(function(g) {
    return lg.active.some(function(a) { return a.id === g.id; }) || lg.completed.indexOf(g.id) < 0;
  });
  const completedGoals = LIFE_GOAL_TEMPLATES.filter(function(g) {
    return lg.completed.indexOf(g.id) >= 0;
  });
  const achievements = lg.achievements;

  let html = '';

  /* Big picture */
  html += '<div class="card" style="border-color:#8b5cf6;padding:12px;background:linear-gradient(180deg,#8b5cf615 0%,transparent 100%)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">📖 YOUR STORY</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + completedGoals.length + ' goals · ' + achievements.length + ' achievements</div></div>' +
    '<div style="font-size:2rem">📖</div></div>' +
    '</div>';

  /* Active goals */
  if (activeGoals.length > 0) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">🎯 Active Goals</h4>';
    activeGoals.forEach(function(g) {
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-weight:700;font-size:.85rem">' + g.label + '</div>' +
        '<div class="muted small">' + g.desc + '</div>' +
        '<div class="muted small" style="color:#22d3ee;margin-top:2px">💫 ' + g.reward + '</div>' +
        '</div>';
    });
    html += '</div>';
  }

  /* Completed goals */
  if (completedGoals.length > 0) {
    html += '<div class="card" style="border-color:#34d399"><h4 style="color:#34d399;font-size:.85rem">✅ Completed Goals (' + completedGoals.length + ')</h4>';
    completedGoals.forEach(function(g) {
      html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a;font-size:.78rem">' +
        '<b>' + g.label + '</b>' +
        '</div>';
    });
    html += '</div>';
  }

  /* Achievements */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#fbbf24">🏆 Achievements (' + achievements.length + '/' + ACHIEVEMENTS.length + ')</h4>';
  ACHIEVEMENTS.forEach(function(a) {
    const unlocked = achievements.indexOf(a.id) >= 0;
    html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a;' + (unlocked ? '' : 'opacity:.4') + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div><b style="font-size:.82rem">' + a.icon + ' ' + a.label + (unlocked ? ' ✓' : '') + '</b>' +
      '<div class="muted small" style="font-size:.72rem">' + a.desc + '</div></div>' +
      '</div></div>';
  });
  html += '</div>';

  return html;
};

console.log('[World Life] 37-life-goals.js loaded');
