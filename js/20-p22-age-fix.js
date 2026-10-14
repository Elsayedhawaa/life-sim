/* ================= PHASE 22 — HARD AGE-PROGRESSION FIX =================
   Final controller: prevents older wrappers, orphaned events, or corrupt 
   university data from trapping the player at one age.
*/

/* ---------- SAFE UNIVERSTIY YEAR GUARD ---------- */
if (typeof uniYear === 'function') {
  const P22_rawUniYear = uniYear;
  uniYear = function() {
    if (!S || !S.uni) return;

    // Safety fallback for missing effort settings
    if (!S.effort || typeof EFFORT === 'undefined' || !EFFORT[S.effort]) {
      S.effort = 'norm';
      if (typeof EFFORT !== 'undefined' && !EFFORT['norm']) {
        EFFORT['norm'] = { label: 'Normal effort', mult: 1.0 };
      }
    }

    // Safety fallback for unrecognized or custom university majors
    if (typeof MAJORS !== 'undefined') {
      const currentMajorKey = S.uni.major || 'general';
      if (!MAJORS[currentMajorKey]) {
        MAJORS[currentMajorKey] = {
          name: S.uni.faculty || S.uni.universityName || 'General Studies',
          mult: 1.0,
          min: 50,
          years: S.uni.yearsTotal || 4
        };
      }
      S.uni.major = currentMajorKey;
    }

    // Execute progression safely
    try {
      P22_rawUniYear();
    } catch (err) {
      console.warn('Recovered from uniYear calculation error:', err);
      if (S.uni) {
        S.uni.year = (Number(S.uni.year) || 1) + 1;
        const maxYears = Number(S.uni.yearsTotal) || 4;
        if (S.uni.year > maxYears) {
          S.degree = S.uni.major || 'degree';
          S.uni = null;
          log('Graduated from university!');
        }
      }
    }
  };
}

/* ---------- AGE PROGRESSION CONTROLLER ---------- */
const P22_wrappedYearProgression = typeof P21_ageUpBeforeSetupGate === 'function' 
  ? P21_ageUpBeforeSetupGate 
  : (typeof ageUp === 'function' ? ageUp : function(){});

const P22_renderBeforeStaleEventRepair = typeof render === 'function' ? render : function(){};

render = function(){
  if(S && S.pending && (!S.ev || !Array.isArray(S.ev.choices) || S.ev.choices.length === 0)){
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
  if(typeof p20Init === 'function') p20Init(S);

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

  if(S.parentNeed || S.familyNeed){
    activeTab = 'life';
    hint('Please answer the family money request first. You can send any amount or decline, then press Age up again.');
    if(typeof p14ShowParentRequestModal === 'function') p14ShowParentRequestModal();
    else render();
    return;
  }

  const ageBefore = Number(S.age) || 6;
  const story = (typeof P20_AGE_STORIES !== 'undefined') ? P20_AGE_STORIES[ageBefore] : null;
  S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
  const done = S.p20AgeEventsDone.includes(ageBefore);
  const resolved = S.p20AgeEventResolvedAge === ageBefore;
  const alreadyClosed = !!(story && S.ev && S.ev.title === story.title &&
    (!S.pending) && (!Array.isArray(S.ev.choices) || S.ev.choices.length === 0));

  /* Show each age milestone once. */
  if(story && !done && !resolved && !alreadyClosed){
    if(typeof p20RunAgeStory === 'function') p20RunAgeStory();
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
    console.error('Age progression wrapper failed; attempting safe legacy chain.', e);
  }

  /* Fallback execution if age did not increment */
  if(S && S.age === previousAge && !S.pending && !S.yearPopup &&
     !(S.age < 18 && !S.school) && !(S.age >= 18 && !S.housing)){
    try {
      S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
      if(story && !S.p20AgeEventsDone.includes(previousAge)) S.p20AgeEventsDone.push(previousAge);
      if(typeof P20_ageUpBefore === 'function') P20_ageUpBefore();
    } catch(e) {
      console.error('Legacy age progression fallback failed.', e);
      hint('Age progression encountered an error. Your save is preserved; try reloading the game.');
    }
  }

  if(S && S.age !== previousAge){
    S.p21AgeAdvancePending = false;
    if((Number(S.homeComfort) || 0) >= 10 && typeof fx === 'function') fx({ happiness: 1 });
    if(typeof save === 'function') save();
  } else if(S && S.age === previousAge && !S.pending && !S.yearPopup){
    hint(`The game could not complete the year at age ${previousAge}. Your save is preserved; use Age up again to retry.`);
    if(progressionError) console.error(progressionError);
  }
  if(S && !S.dead && typeof render === 'function') render();
};

/* Reconcile state on load */
function p22RepairAgeState(){
  if(!S) return;
  if(typeof p20Init === 'function') p20Init(S);
  if(S.pending && S.ev && Array.isArray(S.ev.choices) && S.ev.choices.length === 0) S.pending = false;
  const id = String(S.evId || '');
  if(id.startsWith('p20-age-') && (!S.pending || !S.ev || !Array.isArray(S.ev.choices) || S.ev.choices.length === 0)){
    const a = Number(id.slice('p20-age-'.length));
    if(Number.isFinite(a)){
      S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
      if(!S.p20AgeEventsDone.includes(a)) S.p20AgeEventsDone.push(a);
      S.p20AgeEventResolvedAge = a;
    }
    S.evId = null;
  }
}

const P22_loadGameBeforeRepair = typeof loadGame === 'function' ? loadGame : function(){};
loadGame = function(){ 
  P22_loadGameBeforeRepair(); 
  p22RepairAgeState(); 
  if(S && typeof render === 'function') render(); 
};

p22RepairAgeState();
