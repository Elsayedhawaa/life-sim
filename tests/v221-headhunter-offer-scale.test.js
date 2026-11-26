// A recruiter's offer pays for the title it names: your pay x the promotion rung step x the 12-30% employer-change premium. It no longer takes the market pay of your experience rung, which could be 2-3x your pay.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {advanceSingleTurn,resolveActiveSceneChoice}=await import('../src/core/gameLoop.js');
const {maybeHeadhunterApproach}=await import('../src/systems/careerMarket.js');
const {getMergedCareerTracks}=await import('../src/systems/careerEducationEngine.js');
const C=['egy','sau','uae','gbr','usa','deu','can','aus','nld','fra','jpn','ita','sgp','bra','ind','che','swe','tur'];
let r=5;const rnd=()=>(r=(r*1103515245+12345)&0x7fffffff)/0x7fffffff;
let n=0,worst=0;const t0=Date.now();
for(let seed=1;seed<=18&&Date.now()-t0<60000;seed++){
  const s=createNewLifeState({country:C[seed%18],seed:seed*53+3,familyTier:'middle'});ensureExtendedState(s);let last=-1;
  for(let i=0;i<2500&&!s.gameOver;i++){
    if(s.career?.employed&&s.career.job&&s.year!==last){last=s.year;
      const c=JSON.parse(JSON.stringify({...s,activeScene:null}));const j=c.career.job;const res=maybeHeadhunterApproach(c,{force:true,ignorePerformance:true});
      const o=c.career.market?.offer;
      if(res.ok&&o){n++;const rungs=getMergedCareerTracks(c.year)[j.track].rungs;const cur=rungs.find(q=>q.level===j.level),nx=rungs.find(q=>q.level===o.level);
        const step=cur&&nx?Math.max(1,nx.mult/cur.mult):1;const ratio=o.monthlyGross/(j.monthlyGross*step);worst=Math.max(worst,ratio);
        assert.ok(ratio<=1.31,`offer ${o.monthlyGross} vs pay ${j.monthlyGross} x rung step ${step.toFixed(2)} is ${ratio.toFixed(2)}x (max 1.30)`);}
    }
    if(!s.activeScene){advanceSingleTurn(s);continue}
    try{resolveActiveSceneChoice(s,Math.floor(rnd()*(s.activeScene.choices?.length||1)))}catch(e){s.activeScene=null}
  }}
assert.ok(n>=40,'enough offers checked ('+n+')');
console.log('PASS v221-headhunter-offer-scale',n,'offers, worst premium',worst.toFixed(2));
