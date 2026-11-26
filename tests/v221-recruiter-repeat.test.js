// A firm that approached you does not approach again within 3 years, so one employer cannot phone every year.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {listAvailableJobs,hireIntoJob}=await import('../src/systems/careerEducationEngine.js');
const cm=await import('../src/systems/careerMarket.js');
let worst=99,calls=0;
for(const c of ['deu','usa','egy','jpn']){
  const s=createNewLifeState({country:c,seed:31});ensureExtendedState(s);s.player.age=30;s.year=2030;s.month=1;
  const offer=listAvailableJobs(s).find(j=>j.reqDegrees.length===0);hireIntoJob(s,offer,{allowed:true},{});
  const seen=[];
  for(let m=0;m<12*25;m++){
    s.turn+=1;s.month=(m%12)+1;if(s.month===1&&m)s.year++;
    const job=s.career.job;job.performance=90;job.monthsInRole=24;job.workMode='normal';
    const m0=s.career.market;if(m0?.offer&&s.turn>=m0.offer.expiresTurn)m0.offer=null;
    const r=cm.maybeHeadhunterApproach(s,{chance:0.9});
    if(r&&r.ok!==false&&s.career.market.offer){const o=s.career.market.offer;seen.push({e:o.employer,y:s.year});s.career.market.offer=null;calls++}
  }
  for(let i=0;i<seen.length;i++)for(let j=i+1;j<seen.length;j++)if(seen[i].e===seen[j].e)worst=Math.min(worst,seen[j].y-seen[i].y);
}
assert.ok(calls>0,'recruiters still call');
assert.ok(worst>=3,`the same firm called again after only ${worst} year(s)`);
console.log('PASS v221-recruiter-repeat, calls',calls,'min gap years between the same firm',worst);
