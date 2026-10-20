/* ============================================================
   SIGNAL BRIDGES — cross-system harmony layer
   ============================================================
   Loads AFTER all view files, BEFORE 99-boot.js.
   Runs at END of year (after every other system's year hook).
   ============================================================ */

/* ---------- SNAPSHOT MANAGEMENT ---------- */
function ensureSignalSnapshots() {
  if (!S) return;
  if (!S._sigSnap || typeof S._sigSnap !== 'object') S._sigSnap = {};
}

function _sigSnap() {
  if (!S) return null;
  if (!S._sigSnap) ensureSignalSnapshots();
  return S._sigSnap;
}

function _sigRefreshSnapshot() {
  if (!S) return;
  ensureSignalSnapshots();
  const s = S._sigSnap;
  s.health = S.health;
  s.happiness = S.happiness;
  s.smarts = S.smarts;
  s.social = S.social;
  s.wealth = S.wealth;
  s.country = S.country;
  s.housing = S.housing;
  s.job = S.job ? { company: S.job.company, title: S.job.title, level: S.job.level, salary: S.job.salary } : null;
  s.marriage = (S.marriage && S.marriage.status) || 'single';
  s.marriageBond = (S.marriage && S.marriage.partner && S.marriage.partner.bond) || 0;
  s.creditScore = (S.bank && S.bank.score) || 680;
  s.childrenCount = (S.childrenList || []).length;
  s.livingParents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false;
  }).length;
  s.medicalInsurance = (S.medical && S.medical.insurance) || 'none';
  s.brokenCars = (S.cars || []).filter(function(c) { return c.broken; }).length;
  s.stolenCars = (S.cars || []).filter(function(c) { return c.stolen; }).length;
  s.rentedYearlyRent = S.rentedHome ? S.rentedHome.yearlyRent : 0;
  s.hasCareerJob = !!(S.career && S.career.job);
  s.careerPerf = (S.career && S.career.job && S.career.job.performance) || 0;
}

function _sigLog(msg) {
  if (typeof log === 'function') log(msg);
}
function _sigFx(effects) {
  if (typeof fx === 'function') fx(effects);
}

/* ============================================================
   STATE-DIFF DETECTOR
   Runs at END of year, after every other year hook.
   Compares state to last-known snapshot → emits signals.
   ============================================================ */
GameHooks.on('year', function() {
  if (!S) return;
  ensureSignalSnapshots();

  const s = _sigSnap();
  if (typeof s.health !== 'number') {
    _sigRefreshSnapshot();
    return;
  }

  /* ---------- HEALTH ---------- */
  if (S.health < 40 && s.health >= 40) {
    emitSignal('healthCritical', { health: S.health, prev: s.health });
  }
  if (S.health >= 70 && s.health < 40) {
    emitSignal('healthRecovered', { health: S.health, prev: s.health });
  }
  if (S.health > 0 && S.health <= 15) {
    emitSignal('healthNearDeath', { health: S.health });
  }

  /* ---------- CAREER ---------- */
  const currentJob = S.career && S.career.job;
  if (s.job && !currentJob) {
    emitSignal('jobLost', { company: s.job.company, title: s.job.title });
  } else if (!s.job && currentJob) {
    emitSignal('jobStarted', { company: currentJob.company, title: currentJob.title, salary: currentJob.salary });
  } else if (s.job && currentJob) {
    if (currentJob.level > s.job.level) {
      emitSignal('promoted', { oldTitle: s.job.title, newTitle: currentJob.title, salary: currentJob.salary });
    }
    if (s.careerPerf >= 40 && currentJob.performance < 40) {
      emitSignal('performanceWarning', { performance: currentJob.performance });
    }
    if (s.careerPerf >= 20 && currentJob.performance < 20) {
      emitSignal('performanceCritical', { performance: currentJob.performance });
    }
  }

  /* ---------- MARRIAGE ---------- */
  const currentStatus = (S.marriage && S.marriage.status) || 'single';
  const currentBond = (S.marriage && S.marriage.partner && S.marriage.partner.bond) || 0;

  if (s.marriage !== currentStatus) {
    if (currentStatus === 'married') {
      emitSignal('married', { partner: S.marriage.partner });
    } else if (currentStatus === 'engaged') {
      emitSignal('engaged', { partner: S.marriage.partner });
    } else if (currentStatus === 'single' && (s.marriage === 'married' || s.marriage === 'engaged')) {
      const ex = S.marriage && S.marriage.exSpouses && S.marriage.exSpouses.length
        ? S.marriage.exSpouses[S.marriage.exSpouses.length - 1] : null;
      emitSignal('divorce', { ex: ex });
    }
  }

  if (s.marriage === 'married' && currentStatus === 'married') {
    if (currentBond < 30 && s.marriageBond >= 30) {
      emitSignal('marriageStrain', { bond: currentBond });
    }
    if (currentBond > 85 && s.marriageBond <= 85) {
      emitSignal('marriageBliss', { bond: currentBond });
    }
    if (currentBond <= 0 && s.marriageBond > 0) {
      emitSignal('marriageCollapsed', { bond: 0 });
    }
  }

  /* ---------- COUNTRY MOVE ---------- */
  if (s.country && s.country !== S.country) {
    emitSignal('movedCountry', { from: s.country, to: S.country });
  }

  /* ---------- HOUSING CHANGE ---------- */
  if (s.housing && s.housing !== S.housing) {
    emitSignal('housingChanged', { from: s.housing, to: S.housing });
  }

  /* ---------- RENT HIKE ---------- */
  const currentRent = S.rentedHome ? S.rentedHome.yearlyRent : 0;
  if (s.rentedYearlyRent && currentRent > s.rentedYearlyRent * 1.10) {
    const pct = Math.round((currentRent / s.rentedYearlyRent - 1) * 100);
    emitSignal('rentHiked', { oldRent: s.rentedYearlyRent, newRent: currentRent, pct: pct });
  }

  /* ---------- CREDIT SCORE ---------- */
  const currentScore = (S.bank && S.bank.score) || 680;
  if (typeof s.creditScore === 'number' && currentScore < s.creditScore - 20) {
    emitSignal('creditScoreDropped', { from: s.creditScore, to: currentScore });
  }

  /* ---------- PARENT DEATH ---------- */
  const currentLivingParents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false;
  }).length;
  if (typeof s.livingParents === 'number' && currentLivingParents < s.livingParents) {
    const lost = (S.family || []).find(function(m) {
      return (m.role === 'Mother' || m.role === 'Father') && m.alive === false && m.deathYear === gameYear();
    });
    emitSignal('parentDied', { parent: lost || null });
  }

  /* ---------- CHILD BORN ---------- */
  const currentChildren = (S.childrenList || []).length;
  if (typeof s.childrenCount === 'number' && currentChildren > s.childrenCount) {
    const newest = (S.childrenList || [])[currentChildren - 1];
    emitSignal('childBorn', { child: newest, gender: newest ? newest.gender : 'unknown' });
  }

  /* ---------- INSURANCE ---------- */
  const currentInsurance = (S.medical && S.medical.insurance) || 'none';
  if (s.medicalInsurance && s.medicalInsurance !== currentInsurance) {
    emitSignal('insuranceChanged', { from: s.medicalInsurance, to: currentInsurance });
  }

  /* ---------- CAR BROKEN / STOLEN ---------- */
  const currentBroken = (S.cars || []).filter(function(c) { return c.broken; }).length;
  const currentStolen = (S.cars || []).filter(function(c) { return c.stolen; }).length;
  if (typeof s.brokenCars === 'number' && currentBroken > s.brokenCars) {
    const brokenCar = (S.cars || []).find(function(c) { return c.broken; });
    emitSignal('carBroken', { car: brokenCar });
  }
  if (typeof s.stolenCars === 'number' && currentStolen > s.stolenCars) {
    const stolenCar = (S.cars || []).find(function(c) { return c.stolen; });
    emitSignal('carStolen', { car: stolenCar });
  }

  /* ---------- BANKRUPTCY ---------- */
  if (S.wealth < 0 && !s.wasBankrupt) {
    emitSignal('bankrupt', { debt: -S.wealth });
    s.wasBankrupt = true;
  }
  if (S.wealth >= 0) s.wasBankrupt = false;

  /* ---------- STRESS ACCUMULATION ---------- */
  const stressFactors = [];
  if (S.happiness < 30) stressFactors.push('unhappiness');
  if (S.health < 40) stressFactors.push('illness');
  if (S.marriage && S.marriage.status === 'married' && S.marriage.partner && S.marriage.partner.bond < 30) stressFactors.push('marriage');
  if (S.wealth < 0) stressFactors.push('debt');
  if (S.career && S.career.job && S.career.job.performance < 30) stressFactors.push('work');
  if (stressFactors.length >= 3) {
    emitSignal('stressHigh', { factors: stressFactors });
  }

  /* Rebuild snapshot for next year */
  _sigRefreshSnapshot();
});

/* ============================================================
   LISTENERS — cross-system reactions
   ============================================================ */

/* ---------- 1. HEALTH CRITICAL → CAREER + FAMILY ---------- */
onSignal('healthCritical', function(data) {
  if (!S) return;
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, S.career.job.performance - 8);
    _sigLog('🏥 Your illness is hurting your work. Performance dropped.');
  }
  (S.family || []).forEach(function(m) {
    if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
      m.bond = Math.min(100, (m.bond || 70) + 2);
    }
  });
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + 3);
    _sigLog('💬 ' + S.marriage.partner.name + ' is worried about your health.');
  }
});

/* ---------- 2. HEALTH RECOVERED ---------- */
onSignal('healthRecovered', function() {
  if (!S) return;
  _sigFx({ happiness: 5 });
  (S.family || []).forEach(function(m) {
    if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
      m.bond = Math.min(100, (m.bond || 70) + 3);
    }
  });
  _sigLog('💚 Your health has recovered. Family is relieved.');
});

/* ---------- 3. HEALTH NEAR DEATH ---------- */
onSignal('healthNearDeath', function() {
  if (!S) return;
  _sigLog('🚨 Your health is critically low. Seek medical attention NOW.');
  _sigFx({ happiness: -10 });
});

/* ---------- 4. JOB LOST → INSURANCE + FAMILY + MENTAL ---------- */
onSignal('jobLost', function(data) {
  if (!S) return;
  if (S.medical && (S.medical.insurance === 'employer_basic' || S.medical.insurance === 'employer_premium')) {
    S.medical.insurance = 'none';
    _sigLog('🩺 You lost your employer health insurance when you left your job.');
  }
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.max(0, (S.marriage.partner.bond || 70) - 4);
    _sigLog('💬 ' + S.marriage.partner.name + ' is worried about the lost income.');
  }
  (S.family || []).forEach(function(m) {
    if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
      m.bond = Math.min(100, (m.bond || 70) + 1);
    }
  });
  if (S.career) S.career.mood = 'frustrated';
  _sigFx({ happiness: -6 });
});

/* ---------- 5. JOB STARTED ---------- */
onSignal('jobStarted', function() {
  if (!S) return;
  _sigFx({ happiness: 8 });
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + 5);
    _sigLog('🎉 ' + S.marriage.partner.name + ' is proud of you.');
  }
  (S.family || []).forEach(function(m) {
    if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
      m.bond = Math.min(100, (m.bond || 70) + 4);
    }
  });
});

/* ---------- 6. PROMOTED ---------- */
onSignal('promoted', function(data) {
  if (!S) return;
  _sigFx({ happiness: 10, social: 5 });
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + 8);
  }
  (S.childrenList || []).forEach(function(c) {
    c.happiness = Math.min(100, (c.happiness || 70) + 4);
    c.bond = Math.min(100, (c.bond || 55) + 3);
  });
  _sigLog('🎉 You were promoted to ' + data.newTitle + '. Family is proud!');
});

/* ---------- 7. MARRIAGE STRAIN → CHILDREN + HEALTH ---------- */
onSignal('marriageStrain', function() {
  if (!S) return;
  _sigLog('💔 Your marriage is strained. The children are feeling the tension.');
  (S.childrenList || []).forEach(function(c) {
    c.happiness = Math.max(0, (c.happiness || 70) - 5);
    c.bond = Math.max(0, (c.bond || 55) - 3);
    if (!Array.isArray(c.events)) c.events = [];
    c.events.push({ year: gameYear(), event: 'Parents seem tense' });
  });
  _sigFx({ happiness: -5, health: -2 });
});

/* ---------- 8. MARRIAGE BLISS ---------- */
onSignal('marriageBliss', function() {
  if (!S) return;
  _sigFx({ happiness: 5, health: 2 });
  _sigLog('❤️ Your marriage is thriving. You feel great.');
});

/* ---------- 9. MARRIAGE COLLAPSED ---------- */
onSignal('marriageCollapsed', function() {
  if (!S) return;
  _sigLog('🚨 Your marriage is at a breaking point.');
  _sigFx({ happiness: -12, health: -3 });
  (S.childrenList || []).forEach(function(c) {
    c.happiness = Math.max(0, (c.happiness || 70) - 8);
  });
});

/* ---------- 10. DIVORCE ---------- */
onSignal('divorce', function() {
  if (!S) return;
  _sigLog('💔 The divorce is taking a toll on your mental health.');
  _sigFx({ happiness: -8, health: -3 });
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, S.career.job.performance - 12);
    _sigLog('📉 Your work performance is suffering from the divorce.');
  }
  (S.childrenList || []).forEach(function(c) {
    c.happiness = Math.max(0, (c.happiness || 70) - 10);
    c.bond = Math.max(0, (c.bond || 55) - 5);
  });
  (S.family || []).forEach(function(m) {
    if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
      m.bond = Math.min(100, (m.bond || 70) + 3);
    }
  });
});

/* ---------- 11. MARRIED ---------- */
onSignal('married', function() {
  if (!S) return;
  _sigFx({ happiness: 15, social: 10 });
  (S.family || []).forEach(function(m) {
    if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
      m.bond = Math.min(100, (m.bond || 70) + 5);
    }
  });
});

/* ---------- 12. ENGAGED ---------- */
onSignal('engaged', function() {
  if (!S) return;
  _sigFx({ happiness: 10, social: 5 });
});

/* ---------- 13. CHILD BORN ---------- */
onSignal('childBorn', function(data) {
  if (!S) return;
  _sigFx({ happiness: 12 });
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, S.career.job.performance - 3);
    _sigLog('👶 Sleepless nights — work performance slightly affected.');
  }
  (S.childrenList || []).forEach(function(c) {
    if (c !== data.child) c.bond = Math.min(100, (c.bond || 55) + 2);
  });
  (S.family || []).forEach(function(m) {
    if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
      m.bond = Math.min(100, (m.bond || 70) + 6);
    }
  });
});

/* ---------- 14. PARENT DIED ---------- */
onSignal('parentDied', function(data) {
  if (!S) return;
  const name = data.parent ? data.parent.name : 'Your parent';
  _sigLog('🕊 ' + name + ' has passed. Grief weighs on you.');
  _sigFx({ happiness: -20, health: -5 });
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, S.career.job.performance - 20);
    _sigLog('📉 Grief is affecting your work.');
  }
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + 3);
    _sigLog('💬 ' + S.marriage.partner.name + ' supports you through this.');
  }
});

/* ---------- 15. RENT HIKED ---------- */
onSignal('rentHiked', function(data) {
  if (!S) return;
  _sigLog('🏠 Rent went up ' + data.pct + '%.');
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.max(0, (S.marriage.partner.bond || 70) - 2);
  }
  _sigFx({ happiness: -4 });
});

/* ---------- 16. MOVED COUNTRY ---------- */
onSignal('movedCountry', function(data) {
  if (!S) return;
  const fromName = (typeof COUNTRIES !== 'undefined' && COUNTRIES[data.from]) ? COUNTRIES[data.from].name : data.from;
  const toName = (typeof COUNTRIES !== 'undefined' && COUNTRIES[data.to]) ? COUNTRIES[data.to].name : data.to;
  _sigLog('✈️ You moved from ' + fromName + ' to ' + toName + '.');
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.max(0, (S.marriage.partner.bond || 70) - 8);
    _sigLog('💬 ' + S.marriage.partner.name + ' misses home and family.');
  }
  (S.childrenList || []).forEach(function(c) {
    c.happiness = Math.max(0, (c.happiness || 70) - 5);
    if (!Array.isArray(c.events)) c.events = [];
    c.events.push({ year: gameYear(), event: 'Moved to ' + toName });
  });
  _sigFx({ happiness: -3 });
});

/* ---------- 17. CAR BROKEN ---------- */
onSignal('carBroken', function() {
  if (!S) return;
  _sigLog('🚗 Your car is out of commission. Commuting is harder.');
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, S.career.job.performance - 3);
  }
  _sigFx({ happiness: -3 });
});

/* ---------- 18. CAR STOLEN ---------- */
onSignal('carStolen', function() {
  if (!S) return;
  _sigLog('🚨 Your car was stolen. Police report filed.');
  _sigFx({ happiness: -8 });
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, S.career.job.performance - 5);
  }
});

/* ---------- 19. BANKRUPT ---------- */
onSignal('bankrupt', function() {
  if (!S) return;
  _sigLog('💸 You are in serious debt. This affects every part of your life.');
  _sigFx({ happiness: -15, health: -3 });
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, S.career.job.performance - 10);
  }
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.max(0, (S.marriage.partner.bond || 70) - 8);
    _sigLog('💬 ' + S.marriage.partner.name + ' is deeply worried about money.');
  }
  if (S.medical && S.medical.insurance !== 'none' && S.medical.insurance !== 'public_govt') {
    S.medical.insurance = 'none';
    _sigLog('🩺 You can no longer afford private health insurance.');
  }
});

/* ---------- 20. PERFORMANCE WARNING ---------- */
onSignal('performanceWarning', function() {
  if (!S) return;
  _sigLog('⚠️ Your performance at work is slipping. Your boss has noticed.');
  _sigFx({ happiness: -4 });
});

/* ---------- 21. PERFORMANCE CRITICAL ---------- */
onSignal('performanceCritical', function() {
  if (!S) return;
  _sigLog('🚨 You are at risk of being fired.');
  _sigFx({ happiness: -8, health: -2 });
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    S.marriage.partner.bond = Math.max(0, (S.marriage.partner.bond || 70) - 4);
  }
});

/* ---------- 22. CREDIT SCORE DROPPED ---------- */
onSignal('creditScoreDropped', function(data) {
  if (!S) return;
  _sigLog('📉 Your credit score dropped from ' + data.from + ' to ' + data.to + '.');
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false && S.marriage.partner.bond < 60) {
    S.marriage.partner.bond = Math.max(0, S.marriage.partner.bond - 3);
  }
});

/* ---------- 23. INSURANCE CHANGED TO NONE ---------- */
onSignal('insuranceChanged', function(data) {
  if (!S) return;
  if (data.to === 'none') {
    _sigLog('🩺 You no longer have health insurance. Unexpected medical bills will hurt.');
    _sigFx({ happiness: -3 });
  }
});

/* ---------- 24. STRESS HIGH ---------- */
onSignal('stressHigh', function(data) {
  if (!S) return;
  _sigLog('😰 You are under severe stress from: ' + data.factors.join(', ') + '.');
  _sigFx({ happiness: -5, health: -4 });
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, S.career.job.performance - 5);
  }
});

/* ============================================================
   FIRST-RENDER SNAPSHOT
   Ensures a baseline exists before the first year tick.
   ============================================================ */
GameHooks.on('render', function() {
  if (!S) return;
  ensureSignalSnapshots();
  if (typeof S._sigSnap.health !== 'number') {
    _sigRefreshSnapshot();
  }
});

console.log('[World Life] 98-signal-bridges.js loaded — signal bus ready');
