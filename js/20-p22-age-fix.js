/* ================= PHASE 22 — HARD AGE-PROGRESSION FIX =================
   Final controller: don't let older wrappers or an orphaned saved event trap the
   player at one age. The normal wrapped yearly ledger runs first; a legacy-chain
   fallback is used only if the age did not change and no decision is pending.
*/
const P22_wrappedYearProgression = P21_ageUpBeforeSetupGate;
const P22_renderBeforeStaleEventRepair = render;
render = function(){
  if(S && S.pending && (!S.ev || !Array.isArray(S.ev.choices) || S.ev.choices.length===0)){
    const orphanId = S.evId;
    S.pending = false;
    if(orphanId && orphanId.startsWith('p20-age-')){
      const n = Number(orphanId.slice('p20-age-'.length));
      if(Number.isFinite(n)){
        S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
        if(!S.p20AgeEventsDone.includes(n)) S.p20AgeEventsDone.push(n);
        S.p20AgeEventResolvedAge = n;
      }
    }
    S.evId = null;
    log('Recovered an unfinished event with no choices, so the life simulation can continue.');
  }
  return P22_renderBeforeStaleEventRepair();
};

ageUp = function(){
  if(!S) return;
  p20Init(S);

  /* Setup requirements should guide the player, never silently consume a year. */
  if(S.pending){
    if(S.ev && Array.isArray(S.ev.choices) && S.ev.choices.length){
      hint('Choose an option in the current event before advancing time.');
      return;
    }
    S.pending = false;
    S.evId = null;
  }
  if(S.age < 18 && !S.school){
    activeTab = 'school';
    render();
    hint('Choose a school in Education first. Then press Age up again.');
    return;
  }
  if(S.age >= 18 && !S.housing){
    activeTab = 'assets';
    render();
    hint('Choose your housing in Real Estate first. Then press Age up again.');
    return;
  }

  /* The parent-request modal is not represented by S.pending. Treat it as a real
     blocker so the fallback cannot misinterpret the modal as a broken age-up. */
  if(S.parentNeed || S.familyNeed){
    activeTab = 'life';
    hint('Please answer the family money request first. You can send any amount or decline, then press Age up again.');
    if(typeof p14ShowParentRequestModal === 'function') p14ShowParentRequestModal();
    else render();
    return;
  }

  const ageBefore = Number(S.age)||6;
  const story = P20_AGE_STORIES[ageBefore];
  S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
  const done = S.p20AgeEventsDone.includes(ageBefore);
  const resolved = S.p20AgeEventResolvedAge === ageBefore;
  const alreadyClosed = !!(story && S.ev && S.ev.title===story.title &&
    (!S.pending) && (!Array.isArray(S.ev.choices) || S.ev.choices.length===0));

  /* Show each age milestone once. A previously closed/saved milestone is treated as done. */
  if(story && !done && !resolved && !alreadyClosed){
    p20RunAgeStory();
    return;
  }
  if(story && (resolved || alreadyClosed) && !done) S.p20AgeEventsDone.push(ageBefore);
  if(story && (done || resolved || alreadyClosed)) S.p20AgeEventResolvedAge = ageBefore;

  const previousAge = S.age;
  let progressionError = null;
  try {
    P22_wrappedYearProgression();
  } catch(e) {
    progressionError = e;
    console.error('Age progression wrapper failed; trying legacy progression chain.', e);
  }

  /* The wrappers may return early on a stale flag. If no actual event is waiting,
     retry through the chain that predates the milestone wrapper. */
  if(S && S.age === previousAge && !S.pending && !S.yearPopup &&
     !(S.age < 18 && !S.school) && !(S.age >= 18 && !S.housing)){
    try {
      S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
      if(story && !S.p20AgeEventsDone.includes(previousAge)) S.p20AgeEventsDone.push(previousAge);
      P20_ageUpBefore();
    } catch(e) {
      console.error('Legacy age progression fallback failed.', e);
      hint('Age progression encountered an error. Your save is preserved; try reloading the game.');
    }
  }

  if(S && S.age !== previousAge){
    S.p21AgeAdvancePending = false;
    if((Number(S.homeComfort)||0) >= 10) fx({happiness:1});
    save();
  } else if(S && S.age === previousAge && !S.pending && !S.yearPopup){
    hint(`The game could not complete the year at age ${previousAge}. Your save is preserved; use Age up again to retry.`);
    if(progressionError) console.error(progressionError);
  }
  if(S && !S.dead) render();
};

/* Existing saves can contain an age-story card that was already answered but was
   saved before its completion marker was written. Reconcile that state on load. */
function p22RepairAgeState(){
  if(!S) return;
  p20Init(S);
  if(S.pending && S.ev && Array.isArray(S.ev.choices) && S.ev.choices.length===0) S.pending=false;
  const id=String(S.evId||'');
  if(id.startsWith('p20-age-') && (!S.pending || !S.ev || !Array.isArray(S.ev.choices) || S.ev.choices.length===0)){
    const a=Number(id.slice('p20-age-'.length));
    if(Number.isFinite(a)){
      S.p20AgeEventsDone=Array.isArray(S.p20AgeEventsDone)?S.p20AgeEventsDone:[];
      if(!S.p20AgeEventsDone.includes(a))S.p20AgeEventsDone.push(a);
      S.p20AgeEventResolvedAge=a;
    }
    S.evId=null;
  }
}
const P22_loadGameBeforeRepair = loadGame;
loadGame = function(){ P22_loadGameBeforeRepair(); p22RepairAgeState(); if(S) render(); };
p22RepairAgeState();

