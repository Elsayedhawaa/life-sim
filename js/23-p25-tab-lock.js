/* ================= PHASE 25 — TAB LOCK / RENDER REDIRECT FIX =================
   A prior UI cleanup redirected every render to Active Matters, even when no family
   request existed. This made the Education tab unreachable and trapped the player at
   age 6. Only route to Active Matters when a real request is awaiting an answer.
   If there is no live request, leave navigation completely alone.
*/
p14ShowParentRequestModal = function(){
  const el = document.getElementById('p14-parent-request-modal');
  const needsResponse = !!(S && (S.parentNeed || S.familyNeed));
  if (!needsResponse) {
    if (el) el.remove();
    return;
  }
  /* Active Matters renders family requests inline, so no blocking overlay is needed. */
  if (el) el.remove();
  if (activeTab !== 'matters') {
    activeTab = 'matters';
    render();
  }
};

/* Existing saves may already have JSON nulls from the old NaN ledger bug. Repair the
   financial state during load so a previously affected save does not stay corrupted. */
const P25_migrateBeforeFinancialRepair = migrate;
migrate = function(o){
  const r = P25_migrateBeforeFinancialRepair(o);
  if (!r) return r;
  let repaired = false;
  for (const key of ['wealth','income','expenses','loan','nest','savings','invest','pension','lastSalary']) {
    const value = r[key];
    if (value == null || !Number.isFinite(Number(value))) {
      r[key] = 0;
      repaired = true;
    } else if (typeof value !== 'number') r[key] = Number(value);
  }
  if (!r.bill || typeof r.bill !== 'object' || Array.isArray(r.bill)) { r.bill = {}; repaired = true; }
  for (const key of Object.keys(r.bill)) {
    const value = r.bill[key];
    if (value == null || !Number.isFinite(Number(value))) { r.bill[key] = 0; repaired = true; }
    else if (typeof value !== 'number') r.bill[key] = Number(value);
  }
  if (r.yearPopup && typeof r.yearPopup === 'object') {
    for (const key of ['income','expenses']) {
      if (r.yearPopup[key] == null || !Number.isFinite(Number(r.yearPopup[key]))) { r.yearPopup[key] = 0; repaired = true; }
      else r.yearPopup[key] = Number(r.yearPopup[key]);
    }
  }
  if (repaired && Array.isArray(r.logRows)) {
    r.logRows.unshift({age:Number(r.age)||6,t:'Save repair: repaired invalid financial ledger values from an older version. Any balance that had already become invalid was reset to zero because its original value could not be recovered.'});
    r.logRows = r.logRows.slice(0,200);
  }
  return r;
};

buildStart();

