/* ============================================================
   VIEW: FRIENDSHIP SYSTEM  (Layer 2)
   ============================================================ */

function ensureFriendsState() {
  if (!S) return;
  if (!Array.isArray(S.friends)) S.friends = [];
  if (!S.friendsTab) S.friendsTab = 'list';
  if (typeof S.friendMeetingYear === 'undefined') S.friendMeetingYear = 0;
}
GameHooks.on('newGame', ensureFriendsState);
GameHooks.on('migrate', ensureFriendsState);

function friendSetTab(tab) { S.friendsTab = tab; render(); }
window.friendSetTab = friendSetTab;

/* ---------- MEET A NEW FRIEND ---------- */
window.friendMeet = function(sourceId) {
  const src = FRIEND_SOURCES.find(function(s) { return s.id === sourceId; });
  if (!src) return;
  if (src.requiresSchool && !S.school) { log('❌ Need to be in school.'); render(); return; }
  if (src.requiresUni && !S.uni) { log('❌ Need to be at university.'); render(); return; }
  if (src.requiresJob && !(S.career && S.career.job) && !S.job) { log('❌ Need a job.'); render(); return; }
  if (S.age < src.minAge || S.age > src.maxAge) { log('❌ Not at the right age for this.'); render(); return; }

  if (Math.random() > src.matchChance) {
    log('😔 No luck meeting someone through ' + src.label + ' this year.');
    render(); return;
  }

  const pool = FRIEND_NAMES[S.country] || FRIEND_NAMES.egy;
  const gender = Math.random() < 0.5 ? 'm' : 'f';
  const names = gender === 'm' ? pool.m : pool.f;
  const name = names[Math.floor(Math.random() * names.length)];
  const traitKeys = Object.keys(FRIEND_TRAITS);
  const trait = traitKeys[Math.floor(Math.random() * traitKeys.length)];

  const friend = {
    id: 'f_' + Math.random().toString(36).slice(2, 8),
    name: name,
    gender: gender,
    age: S.age + Math.floor(Math.random() * 6) - 3,
    bond: 40 + Math.floor(Math.random() * 20),
    trait: trait,
    source: src.id,
    sourceLabel: src.label,
    metYear: gameYear(),
    country: S.country,
    contactedThisYear: false,
    alive: true
  };
  S.friends.push(friend);
  log('👋 Met ' + name + ' (' + src.label + '). Bond: ' + friend.bond + '% · ' + FRIEND_TRAITS[trait].label);
  fx({ happiness: 4, social: 3 });
  emitSignal('friendMet', { friend: friend });
  render();
};

/* ---------- DO ACTIVITY ---------- */
window.friendActivity = function(friendId, activityId) {
  const f = S.friends.find(function(x) { return x.id === friendId; });
  if (!f || !f.alive) return;
  if (f.country !== S.country) { log('❌ ' + f.name + ' lives in another country. Use "Visit" or a call.'); render(); return; }
  const act = FRIEND_ACTIVITIES.find(function(a) { return a.id === activityId; });
  if (!act) return;
  const cost = Math.round(act.costEGP * ((C().rate || 1) / 52.7));
  if (S.wealth < cost) { log('❌ Not enough cash for ' + act.label + '.'); render(); return; }

  S.wealth -= cost;
  f.bond = Math.min(100, f.bond + act.bond);
  f.contactedThisYear = true;
  const eff = { happiness: act.happy || 0, social: Math.round(act.bond * 0.3) };
  if (act.health) eff.health = act.health;
  fx(eff);
  log('✨ ' + act.label + ' with ' + f.name + '. Bond +' + act.bond + '.');
  render();
};

/* ---------- GIFT ---------- */
window.friendGift = function(friendId) {
  const f = S.friends.find(function(x) { return x.id === friendId; });
  if (!f || !f.alive) return;
  const cost = Math.round(3000 * ((C().rate || 1) / 52.7));
  if (S.wealth < cost) { log('❌ Not enough cash for a gift.'); render(); return; }
  S.wealth -= cost;
  f.bond = Math.min(100, f.bond + 6);
  f.contactedThisYear = true;
  fx({ happiness: 3, social: 3 });
  log('🎁 Gifted ' + f.name + '. Bond +6.');
  render();
};

/* ---------- CUT TIES ---------- */
window.friendCutTies = function(friendId) {
  const f = S.friends.find(function(x) { return x.id === friendId; });
  if (!f) return;
  if (!confirm('Cut ties with ' + f.name + '? This ends the friendship permanently.')) return;
  S.friends = S.friends.filter(function(x) { return x.id !== friendId; });
  fx({ happiness: -4, social: -3 });
  log('💔 You cut ties with ' + f.name + '.');
  emitSignal('friendLost', { friend: f, reason: 'cut_ties' });
  render();
};

/* ---------- MAIN VIEW ---------- */
function friendsView() {
  ensureFriendsState();
  if (S.age < 6) return '<div class="card"><h3>👥 Friends</h3><p class="muted">Available from age 6+.</p></div>';

  const tabs = [
    ['list', '👥 Friends (' + S.friends.length + ')'],
    ['meet', '➕ Meet Someone'],
    ['events', '📖 Events']
  ];

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#8b5cf615 0%,transparent 100%);border-color:#8b5cf6">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">FRIENDSHIP · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + S.friends.length + ' friend' + (S.friends.length === 1 ? '' : 's') + '</div></div>' +
    '<div style="font-size:2rem">👥</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) {
      return '<button class="pill ' + (S.friendsTab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="friendSetTab(\'' + t[0] + '\')">' + t[1] + '</button>';
    }).join('') +
    '</div></div>';

  if (S.friendsTab === 'list') html += friendsRenderList();
  else if (S.friendsTab === 'meet') html += friendsRenderMeet();
  else if (S.friendsTab === 'events') html += friendsRenderEvents();

  return html;
}

function friendsRenderList() {
  if (S.friends.length === 0) {
    return '<div class="card"><h3>No friends yet</h3><p class="muted small">Use the "Meet Someone" tab to find your first friend.</p></div>';
  }

  /* Sort: local first, then bond desc */
  const sorted = S.friends.slice().sort(function(a, b) {
    const aLocal = a.country === S.country ? 0 : 1;
    const bLocal = b.country === S.country ? 0 : 1;
    if (aLocal !== bLocal) return aLocal - bLocal;
    return b.bond - a.bond;
  });

  let html = '';
  sorted.forEach(function(f) {
    const trait = FRIEND_TRAITS[f.trait] || { label: f.trait, desc: '' };
    const bondColor = f.bond > 70 ? '#34d399' : f.bond > 40 ? '#fbbf24' : '#fb7185';
    const isLocal = f.country === S.country;
    const countryName = (typeof COUNTRIES !== 'undefined' && COUNTRIES[f.country]) ? COUNTRIES[f.country].name : f.country;

    html += '<div class="card" style="padding:10px;border-left:3px solid ' + bondColor + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div><b style="font-size:.95rem">' + f.name + ' <span class="muted small">(age ' + f.age + ')</span></b>' +
      '<div class="muted small">' + f.sourceLabel + ' · met ' + f.metYear + ' · ' + (f.gender === 'm' ? '👦' : '👧') + '</div>' +
      '<div class="muted small" style="color:#8b5cf6">' + trait.label + ' — ' + trait.desc + '</div>' +
      (!isLocal ? '<div class="muted small" style="color:#fbbf24">✈️ Lives in ' + countryName + '</div>' : '') +
      '</div></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin:8px 0 2px"><span>Bond</span><span>' + f.bond + '%</span></div>' +
      '<div style="height:4px;background:#1a1a2a;border-radius:2px;margin-bottom:8px"><div style="height:100%;width:' + f.bond + '%;background:' + bondColor + ';border-radius:2px"></div></div>';

    if (isLocal) {
      html += '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="friendActivity(\'' + f.id + '\',\'call\')">📞 Call</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="friendActivity(\'' + f.id + '\',\'coffee\')">☕ Coffee</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="friendActivity(\'' + f.id + '\',\'dinner\')">🍽 Dinner</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="friendGift(\'' + f.id + '\')">🎁 Gift</button>' +
        '</div>' +
        '<div style="display:flex;gap:4px;margin-top:4px">' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="friendActivity(\'' + f.id + '\',\'sports\')">⚽ Sports</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="friendActivity(\'' + f.id + '\',\'weekend\')">✈️ Weekend</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem;border-color:#fb7185;color:#fb7185" onclick="friendCutTies(\'' + f.id + '\')">💔 Cut ties</button>' +
        '</div>';
    } else {
      html += '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="friendActivity(\'' + f.id + '\',\'facetime\')">📱 Facetime</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="friendActivity(\'' + f.id + '\',\'call\')">📞 Call</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem;border-color:#fb7185;color:#fb7185" onclick="friendCutTies(\'' + f.id + '\')">💔 Cut ties</button>' +
        '</div>';
    }
    html += '</div>';
  });
  return html;
}

function friendsRenderMeet() {
  let html = '<div class="card"><h3>➕ Meet Someone New</h3>' +
    '<p class="muted small">Each source has a different chance of matching. Once per source per year.</p></div>';

  const triedThisYear = S.friendMeetingYear === gameYear();

  FRIEND_SOURCES.forEach(function(src) {
    const blocked = (src.requiresSchool && !S.school) ||
                    (src.requiresUni && !S.uni) ||
                    (src.requiresJob && !(S.career && S.career.job) && !S.job) ||
                    (S.age < src.minAge || S.age > src.maxAge);
    let reason = '';
    if (src.requiresSchool && !S.school) reason = 'Requires school';
    else if (src.requiresUni && !S.uni) reason = 'Requires university';
    else if (src.requiresJob && !(S.career && S.career.job) && !S.job) reason = 'Requires a job';
    else if (S.age < src.minAge || S.age > src.maxAge) reason = 'Age ' + src.minAge + '-' + src.maxAge + ' only';

    html += '<div class="card" style="padding:10px;' + (blocked ? 'opacity:.5' : '') + '">' +
      '<div style="display:flex;justify-content:space-between"><b>' + src.label + '</b><span class="muted small">' + Math.round(src.matchChance * 100) + '% match</span></div>' +
      (blocked ? '<div class="bad small" style="margin-top:4px">' + reason + '</div>' :
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="friendMeet(\'' + src.id + '\')">Try to meet someone</button>') +
      '</div>';
  });

  return html;
}

function friendsRenderEvents() {
  const events = (S.friends || []).flatMap(function(f) {
    return (f.events || []).map(function(ev) { return { year: ev.year, friend: f.name, event: ev.event }; });
  });
  events.sort(function(a, b) { return b.year - a.year; });

  if (!events.length) return '<div class="card"><h3>📖 Friend Events</h3><p class="muted small">No events yet. Make friends and spend time with them.</p></div>';

  let html = '<div class="card"><h3>📖 Recent Events</h3>';
  events.slice(0, 30).forEach(function(ev) {
    html += '<div style="padding:5px 0;border-bottom:1px solid #1a1a2a;font-size:.78rem"><span class="muted mono" style="font-size:.68rem">' + ev.year + '</span> · <b>' + ev.friend + '</b> · ' + ev.event + '</div>';
  });
  html += '</div>';
  return html;
}

/* ---------- YEARLY TICK — bond decay + events + signals ---------- */
GameHooks.on('year', function() {
  ensureFriendsState();
  if (!S) return;
  S.friendMeetingYear = gameYear();

  S.friends.forEach(function(f) {
    if (!f.alive) return;
    f.age++;
    f.contactedThisYear = false;

       /* Bond decay based on trait — but SKIPPED if contacted this year */
    if (!f.contactedThisYear) {
      const traitDef = FRIEND_TRAITS[f.trait] || { bondDecay: 1.0 };
      let decay = 2 * traitDef.bondDecay;
      if (f.country !== S.country) decay *= 2;
      f.bond = Math.max(0, f.bond - Math.round(decay));
    }

    if (!Array.isArray(f.events)) f.events = [];
  });

  /* Random friend event */
  if (S.friends.length && Math.random() < 0.40) {
    const eligible = S.friends.filter(function(f) { return f.alive && f.bond >= 20; });
    if (eligible.length) {
      const f = eligible[Math.floor(Math.random() * eligible.length)];
      const possibleEvents = FRIEND_EVENTS.filter(function(e) {
        if (e.minBond && f.bond < e.minBond) return false;
        if (e.maxBond && f.bond > e.maxBond) return false;
        return true;
      });
      if (possibleEvents.length) {
        const totalW = possibleEvents.reduce(function(s, e) { return s + e.weight; }, 0);
        let roll = Math.random() * totalW;
        for (let i = 0; i < possibleEvents.length; i++) {
          roll -= possibleEvents[i].weight;
          if (roll <= 0) {
            const ev = possibleEvents[i];
            const title = ev.title.replace(/\{name\}/g, f.name);
            log('📖 ' + title);
            if (!Array.isArray(f.events)) f.events = [];
            f.events.push({ year: gameYear(), event: title });

            /* Apply simple effects */
            if (ev.id === 'asks_money' || ev.id === 'wants_loan') {
              const amt = Math.round(5000 * ((C().rate || 1) / 52.7));
              if (S.wealth >= amt) {
                if (confirm(f.name + ' asks for ' + money(amt) + '. Lend it?')) {
                  S.wealth -= amt;
                  f.bond = Math.min(100, f.bond + 8);
                  log('💸 Lent ' + f.name + ' ' + money(amt) + '. Bond +8.');
                } else {
                  f.bond = Math.max(0, f.bond - 5);
                  log('You declined. Bond -5.');
                }
              }
            } else if (ev.id === 'gets_married') {
              f.bond = Math.min(100, f.bond + 5);
              fx({ happiness: 3, social: 3 });
            } else if (ev.id === 'moves_abroad') {
              f.country = ['usa', 'gbr', 'deu', 'can', 'aus', 'sau', 'uae'].filter(function(c) { return c !== S.country; })[0] || 'usa';
              f.bond = Math.max(0, f.bond - 10);
              log('✈️ ' + f.name + ' moved abroad. Long-distance now.');
            } else if (ev.id === 'confides') {
              f.bond = Math.min(100, f.bond + 5);
              fx({ happiness: 2 });
            } else if (ev.id === 'fight') {
              f.bond = Math.max(0, f.bond - 8);
              fx({ happiness: -4 });
            } else if (ev.id === 'job_offer') {
              log('💼 ' + f.name + ' mentioned a job lead. Check Career → Search.');
              fx({ happiness: 3 });
            }
            break;
          }
        }
      }
    }
  }
});

/* ---------- SIGNAL LISTENERS ---------- */
onSignal('marriageStrain', function() {
  S.friends.forEach(function(f) {
    if (f.alive && f.bond >= 50 && f.country === S.country && Math.random() < 0.5) {
      f.bond = Math.min(100, f.bond + 3);
      if (!Array.isArray(f.events)) f.events = [];
      f.events.push({ year: gameYear(), event: 'Checked in on you during a hard time' });
    }
  });
});

onSignal('parentDied', function() {
  S.friends.forEach(function(f) {
    if (f.alive && f.bond >= 40 && f.country === S.country) {
      f.bond = Math.min(100, f.bond + 4);
      if (!Array.isArray(f.events)) f.events = [];
      f.events.push({ year: gameYear(), event: 'Supported you after your parent passed' });
    }
  });
  fx({ happiness: 3 });
});

onSignal('movedCountry', function() {
  S.friends.forEach(function(f) {
    if (f.alive && f.country === S.country) {
      f.bond = Math.max(0, f.bond - 5);
    }
  });
});

onSignal('bankrupt', function() {
  S.friends.forEach(function(f) {
    if (f.alive && f.bond < 30 && Math.random() < 0.4) {
      f.bond = Math.max(0, f.bond - 5);
    }
  });
});

/* ---------- REGISTER TAB ---------- */
GameHooks.registerTab({ id: 'friends', label: '👥 Friends', order: 12, view: friendsView });
