/* ============================================================
   MARRIAGE-FOR-VISA — citizenship regularization + fraud detection (v2)
   ============================================================
   Fires when an undocumented player is dating/marrying a citizen.
   Investigation system: real love = safe, sham marriage = detected.
   Divorce within 3 years = PR revoked / Application cancelled.
   NEW: Age Gap & Visa Ban red flags on starting suspicion
   NEW: Sham spouse extortion events
   NEW: The Immigration Interview event
   NEW: "Baby Bonus" massive suspicion drop for having children
   ============================================================ */

function ensureMarryVisaState() {
  if (!S) return;
  if (!S.marriageVisa) {
    S.marriageVisa = {
      available: false,
      citizenSpouseConfirmed: false,
      marriageType: null,
      marriedAbsMonth: null,
      prDeadlineAbsMonth: null,
      suspicionLevel: 0,
      investigationEvents: [],
      childrenAtMarriage: 0,
      interviewDone: false,
      status: 'idle'  /* idle / pending / approved / caught */
    };
  }
}
GameHooks.on('newGame', ensureMarryVisaState);
GameHooks.on('migrate', ensureMarryVisaState);

/* ---------- HELPERS ---------- */
function _mvRate() { return C().rate || 1; }
function _mvLocalEGP(egp) { return Math.round(egp * (_mvRate() / 52.7)); }

function _mvIsCitizen(partner) {
  if (!partner) return false;
  /* Partner counts as citizen of destination if they were met there */
  const partnerCitizenship = partner.citizenship || partner.country || null;
  if (partnerCitizenship === S.country) return true;
  /* Fallback: if undocumented in a country and partner was met there via app/community, they're likely local */
  if (partner.source && ['app', 'mutual', 'work', 'neighbor'].indexOf(partner.source) >= 0) return true;
  /* Marriage system partner comes from dating — assume local to country of dating */
  return !!(S.country && (partner.gender === 'm' || partner.gender === 'f'));
}

/* ---------- TRAIT-BASED WILLINGNESS ---------- */
function _mvWillingnessToMarry(partner) {
  if (!partner) return { willing: false, reason: 'no partner' };
  const traits = partner.traits || (partner.trait ? [partner.trait] : []);
  const bond = partner.bond || 50;
  let score = bond / 100;
  if (traits.indexOf('loyal') >= 0) score += 0.20;
  if (traits.indexOf('romantic') >= 0) score += 0.15;
  if (traits.indexOf('generous') >= 0) score += 0.10;
  if (traits.indexOf('family_oriented') >= 0) score += 0.15;
  if (traits.indexOf('independent') >= 0) score -= 0.15;
  if (traits.indexOf('career_focused') >= 0) score -= 0.10;
  if (traits.indexOf('jealous') >= 0) score += 0.05;
  if (traits.indexOf('insecure') >= 0) score += 0.10;
  score = Math.max(0.05, Math.min(0.95, score));
  return { willing: score > 0.35, chance: score };
}

function _mvConvenienceCost() {
  return _mvLocalEGP(500000); /* Sham marriage agreement cost */
}

function _mvCalculateRedFlags(partner) {
  let startingSuspicion = 0;
  const ageGap = Math.abs(S.age - (partner.age || S.age));
  if (ageGap > 15) startingSuspicion += 0.20;
  else if (ageGap > 10) startingSuspicion += 0.10;

  if (S.visaBans && S.visaBans.length > 0) startingSuspicion += 0.15;
  return startingSuspicion;
}

/* ============================================================
   OFFER: proposed by player or triggered by bond
   ============================================================ */
window.marryVisaOfferLove = function() {
  if (!S.marriage || !S.marriage.partner) { log('❌ No partner.'); return; }
  if (S.marriage.status !== 'dating') { log('❌ Not dating.'); return; }
  const partner = S.marriage.partner;

  if (!_mvIsCitizen(partner)) {
    log('❌ ' + partner.name + ' is not a citizen of ' + C().name + '.');
    return;
  }

  const willing = _mvWillingnessToMarry(partner);
  if (!willing.willing) {
    log('💔 ' + partner.name + ' refused. "I\'m not ready for marriage yet."');
    partner.bond = Math.max(0, (partner.bond || 50) - 8);
    render();
    return;
  }

  if (S.marriage.engagement) { log('❌ Already engaged. Proceed with the normal proposal flow.'); render(); return; }

  S.marriageVisa.available = true;
  S.marriageVisa.citizenSpouseConfirmed = true;
  S.marriageVisa.marriageType = 'love';
  S.marriageVisa.suspicionLevel = _mvCalculateRedFlags(partner);

  log('💍 You proposed to ' + partner.name + '. They said yes!');
  log('💡 Tip: Complete the engagement and wedding normally. Your immigration status will be reviewed after marriage.');
  if (S.marriageVisa.suspicionLevel > 0) {
    log('⚠️ Immigration red flags detected (Age gap or visa history). Initial suspicion: ' + Math.round(S.marriageVisa.suspicionLevel * 100) + '%.');
  }

  S.marriage.engagement = S.marriage.engagement || {
    proposal: 'personal', shabkaTier: 'standard', mahrTier: 'standard', partyTier: 'nice_hall'
  };
  S.marriage.engagement.citizenLoveMarriage = true;
  render();
};

window.marryVisaOfferConvenience = function() {
  if (!S.marriage || !S.marriage.partner) { log('❌ No partner.'); return; }
  if (S.marriage.status !== 'dating') { log('❌ Not dating.'); return; }
  const partner = S.marriage.partner;
  if (!_mvIsCitizen(partner)) { log('❌ ' + partner.name + ' is not a citizen here.'); return; }

  const cost = _mvConvenienceCost();
  if (S.wealth < cost) {
    log('❌ Need ' + money(cost) + ' for a sham marriage agreement.');
    render(); return;
  }
  if (!confirm('Offer ' + partner.name + ' a marriage-of-convenience for citizenship?\n\nCost: ' + money(cost) + '\n\n⚠️ This is illegal. High investigation risk.\n⚠️ Partner may refuse if bond is low.')) return;

  const willing = _mvWillingnessToMarry(partner);
  const convinienceWilling = willing.chance > 0.25 && Math.random() < willing.chance;

  if (!convinienceWilling) {
    log('💔 ' + partner.name + ' was offended. "You think I would do that?!"');
    partner.bond = Math.max(0, (partner.bond || 50) - 25);
    fx({ happiness: -5 });
    render();
    return;
  }

  S.wealth -= cost;
  S.marriageVisa.available = true;
  S.marriageVisa.citizenSpouseConfirmed = true;
  S.marriageVisa.marriageType = 'convenience';
  
  /* High base suspicion + any red flags */
  S.marriageVisa.suspicionLevel = 0.40 + _mvCalculateRedFlags(partner);
  partner.bond = Math.max(0, (partner.bond || 50) - 15);

  log('💍 ' + partner.name + ' agreed to the arrangement. ' + money(cost) + ' paid.');
  log('⚠️ Suspicion level: ' + Math.round(S.marriageVisa.suspicionLevel * 100) + '%. Immigration will be watching.');

  /* Fast-track wedding */
  S.marriage.status = 'married';
  partner.marriedYear = gameYear();
  S.marriage.wedding = {
    venue: 'registry', guests: 'tiny', catering: 'basic',
    photography: 'none', dress: 'simple', decoration: 'minimal',
    music: 'playlist', honeymoon: 'none', planner: 'self',
    totalCost: 0, payer: 'self'
  };
  S.marriage.prenup = null;
  S.marriage.financeModel = 'egalitarian';

  S.marriageVisa.marriedAbsMonth = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
  S.marriageVisa.prDeadlineAbsMonth = S.marriageVisa.marriedAbsMonth + 36;
  S.marriageVisa.childrenAtMarriage = (S.children ? S.children.length : 0);
  S.marriageVisa.status = 'pending';

  emitSignal('convenienceMarriage', { partner: partner.name });
  log('📝 Marriage registered. Immigration will investigate over the next 3 years.');
  render();
};

/* ============================================================
   POST-MARRIAGE INVESTIGATION SYSTEM
   ============================================================ */
window.marryVisaRender = function() {
  if (!S || !S.marriageVisa) return '';
  const mv = S.marriageVisa;
  const isMarried = S.marriage && S.marriage.status === 'married';
  const datingCitizen = S.marriage && S.marriage.partner && S.marriage.status === 'dating' && _mvIsCitizen(S.marriage.partner);

  if (!isUndocumented() && mv.status !== 'pending') return '';

  if (mv.status === 'pending' && isMarried) {
    const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
    const monthsLeft = Math.max(0, (mv.prDeadlineAbsMonth || 0) - currentAbs);
    const suspicion = Math.round(mv.suspicionLevel * 100);
    const susColor = suspicion > 55 ? '#fb7185' : suspicion > 30 ? '#fbbf24' : '#34d399';

    let html = '<div class="card" style="border-color:' + susColor + '">' +
      '<h3 style="color:' + susColor + '">💍 Marriage-Based Immigration</h3>' +
      '<div class="row"><span>Type</span><b>' + (mv.marriageType === 'love' ? '❤️ Love marriage' : '💰 Convenience arrangement') + '</b></div>' +
      '<div class="row"><span>Investigation status</span><b style="color:' + susColor + '">' + suspicion + '% suspicion</b></div>' +
      '<div class="row"><span>PR decision in</span><b>' + monthsLeft + ' month' + (monthsLeft !== 1 ? 's' : '') + '</b></div>' +
      '<div class="row"><span>Spouse</span><b>' + (S.marriage.partner ? S.marriage.partner.name : '—') + ' (bond ' + (S.marriage.partner ? S.marriage.partner.bond : '?') + '%)</b></div>' +
      '</div>';

    /* Case-building actions */
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🛡 Strengthen Your Case</h4>' +
      '<p class="muted small">Each action builds paper trail to prove your marriage is authentic.</p>';

    const actions = [
      { id: 'social_media', label: 'Post couple photos online', costEGP: 0, suspicionCut: 0.03, already: mv.investigationEvents && mv.investigationEvents.some(function(e){return e.type==='social_media';}) },
      { id: 'joint_account', label: 'Open joint bank account', costEGP: 0, suspicionCut: 0.08, already: mv.investigationEvents && mv.investigationEvents.some(function(e){return e.type==='joint_account';}) },
      { id: 'joint_lease', label: 'Sign joint lease', costEGP: 5000, suspicionCut: 0.10, already: mv.investigationEvents && mv.investigationEvents.some(function(e){return e.type==='joint_lease';}) },
      { id: 'language_course', label: 'Take integration classes', costEGP: 8000, suspicionCut: 0.06, already: mv.investigationEvents && mv.investigationEvents.some(function(e){return e.type==='language_course';}) },
      { id: 'life_insurance', label: 'Name spouse on Life Insurance', costEGP: 15000, suspicionCut: 0.08, already: mv.investigationEvents && mv.investigationEvents.some(function(e){return e.type==='life_insurance';}) },
      { id: 'joint_trip', label: 'Take honeymoon trip', costEGP: 30000, suspicionCut: 0.08, already: mv.investigationEvents && mv.investigationEvents.some(function(e){return e.type==='joint_trip';}) },
      { id: 'lawyer', label: 'Hire immigration lawyer', costEGP: 80000, suspicionCut: 0.15, already: mv.investigationEvents && mv.investigationEvents.some(function(e){return e.type==='lawyer';}) }
    ];

    actions.forEach(function(a) {
      if (a.already) {
        html += '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + a.label + '</span><b class="good small">✓ Done</b></div>';
      } else {
        const cost = _mvLocalEGP(a.costEGP);
        const canAfford = S.wealth >= cost;
        html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:6px;font-size:.72rem;' + (canAfford ? '' : 'opacity:.5') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="marryVisaStrengthenCase(\'' + a.id + '\')">' +
          '<div style="display:flex;justify-content:space-between"><b>' + a.label + '</b><span>' + (cost > 0 ? money(cost) : 'Free') + '</span></div>' +
          '<div class="muted small">Suspicion −' + Math.round(a.suspicionCut * 100) + '%</div></button>';
      }
    });
    html += '</div>';

    if (suspicion > 55) {
      html += '<div class="card" style="border-color:#fb7185;background:#fb718515">' +
        '<b style="color:#fb7185;font-size:.85rem">⚠️ High Investigation Risk</b>' +
        '<p class="muted small" style="margin-top:4px">Your case looks like a sham marriage. Officers may show up unannounced. If caught, you will be deported with a 10-year ban.</p>' +
        '</div>';
    }

    return html;
  }

  if (mv.status === 'approved') {
    return '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">✅ Permanent Residency Granted</h3>' +
      '<p class="muted small">Your marriage-based PR was approved. You can now work, sponsor family, and travel freely on your ' + C().name + ' residence permit.</p></div>';
  }

  if (mv.status === 'caught') {
    return '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">🚨 Marriage Fraud Detected</h3>' +
      '<p class="muted small">Your sham marriage was exposed. You have been deported with a 10-year entry ban.</p></div>';
  }

  if (datingCitizen) {
    const willing = _mvWillingnessToMarry(S.marriage.partner);
    return '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">💍 Marriage as a Path</h3>' +
      '<p class="muted small">You are dating ' + S.marriage.partner.name + ', a citizen of ' + C().name + '. Marriage would grant permanent residency.</p>' +
      '<div class="row"><span>Their bond</span><b>' + (S.marriage.partner.bond || 50) + '%</b></div>' +
      '<div class="row"><span>Willingness to marry</span><b class="' + (willing.willing ? 'good' : 'bad') + '">' + (willing.willing ? 'Likely to say yes' : 'Not yet ready') + '</b></div>' +
      '<button class="opt" style="margin-top:8px;width:100%;text-align:left;padding:8px;font-size:.78rem;background:#34d39920;border-color:#34d399" onclick="marryVisaOfferLove()">' +
      '<div><b>❤️ Propose (love marriage)</b></div>' +
      '<div class="muted small">Legal, safe, low investigation risk.</div></button>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:left;padding:8px;font-size:.78rem;border-color:#fb7185;color:#fb7185" onclick="marryVisaOfferConvenience()">' +
      '<div><b>💰 Offer a sham marriage</b></div>' +
      '<div class="muted small">Costs ' + money(_mvConvenienceCost()) + '. High investigation risk.</div></button>' +
      '</div>';
  }

  return '';
};

window.marryVisaStrengthenCase = function(actionId) {
  if (!S || !S.marriageVisa) return;
  const mv = S.marriageVisa;
  if (mv.status !== 'pending') return;

  const actions = {
    social_media:    { costEGP: 0,     cut: 0.03, log: '📸 Posted couple photos online.' },
    joint_account:   { costEGP: 0,     cut: 0.08, log: '💼 Opened joint bank account with your spouse.' },
    joint_lease:     { costEGP: 5000,  cut: 0.10, log: '🏠 Signed a joint lease together.' },
    language_course: { costEGP: 8000,  cut: 0.06, log: '🗣️ Enrolled in integration and language classes.' },
    life_insurance:  { costEGP: 15000, cut: 0.08, log: '📄 Named spouse as life insurance beneficiary.' },
    joint_trip:      { costEGP: 30000, cut: 0.08, log: '✈️ Took a honeymoon trip (photos submitted).' },
    lawyer:          { costEGP: 80000, cut: 0.15, log: '⚖️ Hired an immigration lawyer to build your case.' }
  };
  const action = actions[actionId];
  if (!action) return;
  const cost = _mvLocalEGP(action.costEGP);
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + '.'); render(); return; }

  S.wealth -= cost;
  mv.suspicionLevel = Math.max(0, mv.suspicionLevel - action.cut);
  if (!Array.isArray(mv.investigationEvents)) mv.investigationEvents = [];
  mv.investigationEvents.push({ year: gameYear(), type: actionId });
  log(action.log + ' Suspicion now ' + Math.round(mv.suspicionLevel * 100) + '%.');
  render();
};

/* ============================================================
   YEAR TICK — investigation roll & events
   ============================================================ */
GameHooks.on('year', function() {
  ensureMarryVisaState();
  if (!S || !S.marriageVisa) return;
  const mv = S.marriageVisa;
  if (mv.status !== 'pending') return;
  
  if (!S.marriage || S.marriage.status !== 'married') {
    _marryVisaFailDueToDivorce();
    return;
  }

  const partner = S.marriage.partner;
  if (!partner) return;

  const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
  const monthsMarried = currentAbs - mv.marriedAbsMonth;
  const yearsMarried = Math.floor(monthsMarried / 12);

  /* The Baby Bonus */
  const currentChildren = S.children ? S.children.length : 0;
  if (currentChildren > mv.childrenAtMarriage) {
    if (mv.suspicionLevel > 0.10) {
      log('👶 Having a child with ' + partner.name + ' proves your marriage is authentic to immigration!');
      mv.suspicionLevel = Math.max(0, mv.suspicionLevel - 0.40);
      mv.childrenAtMarriage = currentChildren; /* Prevent multi-trigger for same kid */
    }
  }

  /* Decay */
  const decay = yearsMarried * 0.03;
  const bondBoost = ((partner.bond || 50) - 50) / 500;
  mv.suspicionLevel = Math.max(0, Math.min(1, mv.suspicionLevel + bondBoost - decay));

  /* Sham Spouse Extortion Event */
  if (mv.marriageType === 'convenience' && Math.random() < 0.20) {
    const extortionAmt = _mvLocalEGP(100000 + Math.random() * 100000);
    S.pending = {
      title: '🚨 Spouse Extortion',
      text: partner.name + ' is demanding more money (' + money(extortionAmt) + '). "Pay up, or I withdraw my sponsorship and call immigration."',
      choices: [
        {
          label: 'Pay them (' + money(extortionAmt) + ')',
          effect: function(s) {
            if (s.wealth < extortionAmt) {
              log('❌ You couldn\'t afford their demands. They called immigration.');
              _marryVisaCaught(s, partner.name);
            } else {
              s.wealth -= extortionAmt;
              log('💸 You paid ' + partner.name + ' to keep quiet.');
              fx({ happiness: -10 });
            }
          }
        },
        {
          label: 'Refuse to pay',
          effect: function(s) {
            log('😡 You refused. ' + partner.name + ' stormed out and contacted immigration!');
            s.marriageVisa.suspicionLevel = Math.min(1, s.marriageVisa.suspicionLevel + 0.40);
          }
        }
      ]
    };
    S.evId = 'marriage_extortion';
    return; // Don't process other immigration events this tick
  }

  /* The Immigration Interview Event */
  if (monthsMarried >= 12 && monthsMarried <= 24 && !mv.interviewDone && Math.random() < 0.50) {
    mv.interviewDone = true;
    S.pending = {
      title: '🏢 Immigration Interview',
      text: 'You and ' + partner.name + ' have been called in for your Green Card/PR interview. You will be questioned in separate rooms about your life together.',
      choices: [
        {
          label: 'Prepare rigorously (Stress +20)',
          effect: function(s) {
            fx({ happiness: -10, health: -5 });
            s.examStress = Math.min(100, (s.examStress || 0) + 20);
            if (Math.random() > s.marriageVisa.suspicionLevel - 0.20) {
              log('✅ The interview went flawlessly. Officers were convinced.');
              s.marriageVisa.suspicionLevel = Math.max(0, s.marriageVisa.suspicionLevel - 0.15);
            } else {
              log('⚠️ You tripped up on a few questions, raising suspicions.');
              s.marriageVisa.suspicionLevel += 0.10;
            }
          }
        },
        {
          label: 'Wing it',
          effect: function(s) {
            /* Depends entirely on bond and baseline suspicion */
            const passChance = ((s.marriage.partner.bond || 50) / 100) - s.marriageVisa.suspicionLevel;
            if (Math.random() < passChance) {
              log('✅ You answered naturally and passed.');
              s.marriageVisa.suspicionLevel = Math.max(0, s.marriageVisa.suspicionLevel - 0.05);
            } else {
              log('🚨 You and your spouse gave conflicting answers about your daily life!');
              s.marriageVisa.suspicionLevel += 0.25;
            }
          }
        }
      ]
    };
    S.evId = 'marriage_interview';
    return;
  }

  /* Random Officer Visit */
  const visitChance = mv.suspicionLevel * 0.30;
  if (Math.random() < visitChance) {
    const caught = Math.random() < mv.suspicionLevel;
    if (caught) {
      log('🚨 Immigration officers visited your home. They determined your marriage was fraudulent.');
      _marryVisaCaught(S, partner.name);
      return;
    } else {
      log('🔍 Immigration officers visited. Your case held up this time.');
      mv.suspicionLevel = Math.max(0, mv.suspicionLevel - 0.05);
    }
  }

  /* Final PR decision */
  if (currentAbs >= mv.prDeadlineAbsMonth) {
    const finalRoll = Math.random();
    if (finalRoll > mv.suspicionLevel + 0.15) {
      mv.status = 'approved';
      log('🎉 PR granted based on marriage. You can now work and live freely in ' + C().name + '.');
      if (S.immigration) {
        S.immigration.destination = S.country;
        S.immigration.visaType = 'pr';
        S.immigration.status = 'pr';
        S.immigration.workRights = 'full';
      }
      if (S.studyAbroad && S.studyAbroad.status === 'illegal') {
        S.studyAbroad.status = 'married_citizen';
        S.studyAbroad.regularizedByMarriage = true;
      }
      fx({ happiness: 25 });
      emitSignal('marriageVisaApproved', { partner: partner.name });
    } else {
      log('🚨 PR denied. Investigation concluded your marriage was for immigration purposes.');
      _marryVisaCaught(S, partner.name);
    }
  }
});

function _marryVisaCaught(s, partnerName) {
  s.marriageVisa.status = 'caught';
  if (typeof illegalWorkDeport === 'function') {
    illegalWorkDeport(s, 'marriage_fraud');
  }
  if (!Array.isArray(s.visaBans)) s.visaBans = [];
  s.visaBans.push({ country: s.country, untilAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) + 120 });
  log('🚫 10-year entry ban applied for immigration fraud.');
  fx({ happiness: -30 });
  emitSignal('marriageVisaFailed', { partner: partnerName });
}

function _marryVisaFailDueToDivorce() {
  const mv = S.marriageVisa;
  log('🚨 You divorced before your PR was approved. Application cancelled.');
  mv.status = 'caught';
  
  /* Revert to undocumented */
  if (S.immigration) {
    S.immigration.visaType = 'undocumented';
    S.immigration.status = 'undocumented';
    S.immigration.workRights = 'none';
  }
  if (S.studyAbroad && S.studyAbroad.status === 'married_citizen') {
    S.studyAbroad.status = 'illegal';
    S.studyAbroad.illegalSinceAbsMonth = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
  }
  fx({ happiness: -20 });
  emitSignal('marriageVisaRevoked', {});
}

/* ============================================================
   DIVORCE HANDLER — revoke PR if within 3 years of marriage
   ============================================================ */
onSignal('divorce', function() {
  if (!S || !S.marriageVisa) return;
  const mv = S.marriageVisa;
  
  if (mv.status === 'pending') {
    _marryVisaFailDueToDivorce();
    return;
  }
  
  if (mv.status !== 'approved') return;
  if (!mv.marriedAbsMonth) return;

  const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
  const monthsMarried = currentAbs - mv.marriedAbsMonth;

  if (monthsMarried < 36) {
    log('🚨 Divorced within 3 years of marriage. Marriage-based PR is revoked.');
    mv.status = 'caught';
    if (S.immigration) {
      S.immigration.visaType = 'undocumented';
      S.immigration.status = 'undocumented';
      S.immigration.workRights = 'none';
    }
    if (S.studyAbroad && S.studyAbroad.status === 'married_citizen') {
      S.studyAbroad.status = 'illegal';
      S.studyAbroad.illegalSinceAbsMonth = currentAbs;
    }
    fx({ happiness: -20 });
    emitSignal('marriageVisaRevoked', {});
  }
});

console.log('[World Life] 32-marry-for-visa.js loaded (v2 Expansions applied)');
