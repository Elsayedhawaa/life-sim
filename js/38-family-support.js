/* ============================================================
   FAMILY SUPPORT — Pocket money & asking for financial help
   ============================================================ */
function ensureFamilySupportState() {
  if (!S) return;
  if (!S.familySupport) S.familySupport = { lastAskYear: 0, lastGiftYear: 0 };
}
GameHooks.on('newGame', ensureFamilySupportState);
GameHooks.on('migrate', ensureFamilySupportState);

window.getFamilyWealthEGP = function() {
  const tier = S.familyTier || 'middle';
  const map = { poor: 800000, 'lower-mid': 1500000, middle: 3000000, 'upper-mid': 6000000, wealthy: 18000000, ultra: 60000000 };
  return map[tier] || 3000000;
};

/* 1. Yearly Pocket Money */
GameHooks.on('year', function() {
  if (!S || S.age >= 25 || S.age < 16) return; // Between 16 and 24
  if (S.housing && S.housing !== 'parents') return; // Only if living at home
  
  const famWealth = getFamilyWealthEGP();
  const allowanceEGP = Math.round(famWealth * 0.01); // 1% of family wealth
  const allowanceLocal = Math.round(allowanceEGP * ((C().rate || 1) / 52.7));
  
  if (allowanceLocal > 0) {
    S.wealth += allowanceLocal;
    log('👨‍👩‍👧 Parents gave you pocket money: +' + money(allowanceLocal));
  }
});

/* 2. Ask parents for money */
window.askFamilyForMoney = function() {
  if (S.familySupport.lastAskYear === gameYear()) {
    log('❌ You already asked your family for money this year.');
    render();
    return;
  }
  
  const famWealth = getFamilyWealthEGP();
  const maxGiveEGP = Math.round(famWealth * 0.05); // They can give up to 5%
  const maxGiveLocal = Math.round(maxGiveEGP * ((C().rate || 1) / 52.7));
  
  const parents = (S.family || []).filter(function(m) { return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false; });
  if (!parents.length) { log('❌ No living parents to ask.'); render(); return; }
  
  const avgBond = parents.reduce(function(s, p) { return s + (p.bond || 70); }, 0) / parents.length;
  if (avgBond < 30) { log('❌ Your parents are too upset with you right now.'); render(); return; }

  const input = prompt(
    'Ask your parents for money.\n\nMax they can give: ' + money(maxGiveLocal) + '\nCurrent cash: ' + money(S.wealth) + '\n\nHow much?', 
    String(Math.round(maxGiveLocal * 0.5))
  );
  if (!input) return;
  const amt = Math.round(Number(input));
  
  if (amt <= 0 || amt > maxGiveLocal) { log('❌ Invalid amount.'); render(); return; }

  S.familySupport.lastAskYear = gameYear();
  
  if (Math.random() < 0.80) {
    S.wealth += amt;
    log('💸 Parents gave you ' + money(amt) + '.');
    parents.forEach(function(p) { p.bond = Math.max(0, p.bond - 5); });
  } else {
    log('❌ Parents refused. "We don\'t have that kind of money right now."');
    fx({ happiness: -3 });
  }
  render();
};
