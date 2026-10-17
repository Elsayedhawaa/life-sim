/* ================= viewMatters SAFETY STUB =================
   Guarantees the Matters tab never crashes render(), even if P23 in
   12-final.js failed to execute. When 12-final.js loads normally, its
   `function viewMatters(){...}` overrides this stub. When it doesn't,
   the stub gives a graceful fallback instead of a hard crash. */
(function(){
  if (typeof window.viewMatters === 'function') return;
  window.viewMatters = function(){
    var _sec = (typeof SEC === 'function') ? SEC : function(t,b){return '<section class="card"><h3>'+(t||'Active Matters')+'</h3>'+(b||'')+'</section>';};
    var _pr  = (typeof PR  === 'function') ? PR  : function(b){return '<p>'+(b||'')+'</p>';};
    var _B   = (typeof B   === 'function') ? B   : function(l,d,a,dis){return '<button class="btn" onclick="'+a+'" '+(dis?'disabled':'')+'>'+l+'</button>';};
    var _money = (typeof money === 'function') ? money : function(v){return String(v);};
    var _cur   = (typeof C === 'function') ? function(){return C().cur;} : function(){return '$';};
    var _unaff = (typeof unaffordable === 'function') ? unaffordable : function(){return false;};
    if (!S) return _sec('Active Matters','Start a life to see pending decisions.');
    if (typeof p23Init === 'function') p23Init(S);
    var html = _sec('Active Matters', _pr('This is the central place for decisions that need a response.'));
    var has = false;
    if (S.pending && S.ev && Array.isArray(S.ev.choices) && S.ev.choices.length) {
      has = true;
      var btns = S.ev.choices.map(function(c,i){ var no=_unaff(c); return '<button class="btn" '+(no?'disabled':'')+' onclick="choose('+i+')">'+(c.label||('Option '+(i+1)))+(no?'<small>Not enough cash</small>':'')+'</button>'; }).join('');
      html += _sec(S.ev.title||'A decision is waiting', _pr(S.ev.text||'Choose how to respond.') + btns);
    }
    if (S.parentNeed || S.familyNeed) {
      has = true;
      var r = (typeof p14RequestState === 'function') ? p14RequestState() : null;
      if (r) {
        html += _sec(r.name+' asks for help',
          _pr('They need help with '+r.reason+'. Suggested amount: '+_money(r.amountInternal)+'. You may send less or decline.') +
          '<label for="p14-family-request-amount" class="muted">Amount to send ('+_cur()+')</label>' +
          '<input id="p14-family-request-amount" type="number" min="0" value="'+Math.round(r.amountPlayer||0)+'" style="width:100%;margin:8px 0 12px">' +
          _B('Send chosen amount','Only the amount you choose is transferred.','p14RespondFamilyNeed(true)') +
          _B('Decline for now','Protect your budget; the relationship may be strained.','p14RespondFamilyNeed(false)')
        );
      }
    }
    if (Array.isArray(S.p23Matters) && S.p23Matters.length) {
      for (var i=0;i<S.p23Matters.length;i++){ var m=S.p23Matters[i]; if(!m.resolved){ has = true; html += _sec(m.title||'Pending matter', _pr(m.text||'Respond to this matter.')); } }
    }
    if (!has) html += _sec('Nothing needs a response right now', _pr('New matters appear as your life and family change.'));
    return html;
  };
})();
