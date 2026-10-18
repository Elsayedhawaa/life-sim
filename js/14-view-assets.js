/* ============================================================
   VIEW: ASSETS TAB
   ============================================================ */

function assetsView() {
  if (S.age < 18) return `<div class="card"><h3>Assets</h3><p class="muted">Available from age 18.</p></div>`;

  const canAffordRent = S.wealth >= C().prices.rent;
  const expenses = S.housing === 'parents'
    ? Math.round(C().prices.phone * 0.5 + C().prices.transport * 0.25)
    : C().prices.food + C().prices.phone + C().prices.transport + (S.housing === 'rented' ? C().prices.rent : 0);
  const net = (S.job ? S.job.salary : 0) - expenses;

  return `<div class="card">
    <h3>Housing</h3>
    <p class="muted small">Current: <b>${S.housing === 'parents' ? 'Living with parents' : S.housing === 'rented' ? 'Renting' : 'Owned'}</b></p>
    ${S.housing === 'parents' ? `<button class="opt" style="margin-top:8px" onclick="S.housing='rented';log('Rented an apartment: '+money(C().prices.rent)+'/year.');render()" ${!canAffordRent ? 'disabled' : ''}>Rent an apartment (${money(C().prices.rent)}/yr)${!canAffordRent ? ' — cannot afford' : ''}</button>` : `<button class="opt" style="margin-top:8px" onclick="S.housing='parents';log('Moved back to parents.');render()">Move back to parents</button>`}
  </div>
  <div class="card">
    <h3>Wealth</h3>
    <div class="row"><span>Cash</span><b class="mono ${S.wealth < 0 ? 'bad' : ''}">${money(S.wealth)}</b></div>
    <div class="row"><span>Annual income</span><b class="mono good">${money(S.job ? S.job.salary : 0)}</b></div>
    <div class="row"><span>Annual expenses</span><b class="mono bad">${money(expenses)}</b></div>
    <div class="row"><span>Net per year</span><b class="mono ${net >= 0 ? 'good' : 'bad'}">${money(net)}</b></div>
  </div>
  <div class="card">
    <p class="muted small">Compounds, cars, banking, marriage, immigration systems will appear here in future updates. This is a foundation.</p>
  </div>`;
}

GameHooks.registerTab({ id: 'assets', label: 'Assets', order: 4, view: assetsView });
