import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {hireIntoJob,listAvailableJobs,tickCareerMonthly,getMergedCareerTracks,usdMonthlyPayToLocal,marketMonthlyGross} from '../src/systems/careerEducationEngine.js';
const C=['egy','sau','uae','gbr','usa','deu','can','aus','nld','fra','jpn','ita','sgp','bra','ind','che','swe','tur'];
const out=[];
for(const c of C){
  const s=createNewLifeState({country:c,seed:41});ensureExtendedState(s);s.player.age=24;s.year=2026;s.month=1;
  const offer=listAvailableJobs(s).find(j=>j.reqDegrees.length===0);
  hireIntoJob(s,offer,{allowed:true},{});
  const job=s.career.job,track=getMergedCareerTracks(s.year)[job.track];
  for(let m=0;m<12*20;m++){
    s.month=(m%12)+1;if(s.month===1&&m)s.year++;
    job.performance=60;job.workMode='coast';s.career.trackExperience[job.track]=0;job.payFrozenUntilYear=s.year<2031?2031:0;
    tickCareerMonthly(s);
    if(s.career.job!==job)break;
  }
  const rung=track.rungs.find(r=>r.level===job.level);const listed=listAvailableJobs(s).find(j=>j.track===job.track);
  const base=track.rungs.find(r=>r.level===listed.level);
  const market=listed.monthlyGross*rung.mult/base.mult;
  const ratio=job.monthlyGross/market;out.push(c+':'+ratio.toFixed(2));
  assert.ok(ratio>=0.85,`${c}: after 20 years pay is ${ratio.toFixed(2)} of the market reference`);
  assert.ok(ratio<=1.10*1.01,`${c}: pay ran above the merit ceiling (${ratio.toFixed(2)})`);
}
/* a family-company post written in US dollars sits on the country's own market line, not at 65,000 of the local currency */
for(const c of C){const post=usdMonthlyPayToLocal(c,2026,65e3/12),mk=marketMonthlyGross(c,2026,'business',1);assert.ok(post/mk>0.9&&post/mk<1.2,`${c} family post ${post} vs market ${mk}`);}
console.log('Long-career pay tracks the market reference in all 18 countries, with no runaway above the merit ceiling; family-company posts price on the same line. '+out.join(' '));
{
  /* the technical review line: market reference explained once per job, not every year */
  const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
  const s=createNewLifeState({country:'usa',seed:41});ensureExtendedState(s);s.player.age=24;s.year=2026;s.month=1;
  const offer=listAvailableJobs(s).find(j=>j.reqDegrees.length===0);hireIntoJob(s,offer,{allowed:true},{});const job=s.career.job;
  for(let m=0;m<12*8;m++){s.month=(m%12)+1;if(s.month===1&&m)s.year++;job.performance=60;job.workMode='coast';s.career.trackExperience[job.track]=0;tickCareerMonthly(s);}
  const lines=s.journal.filter(j=>/Annual pay review/.test(j.text));
  assert.ok(lines.length>=5,'several reviews happened');
  assert.equal(lines.filter(j=>/market reference for this role/.test(j.text)).length,1,'the market-reference explanation is written once');
  assert.ok(lines.every(j=>!/Game market reference/.test(j.text)),'the old technical sentence is gone');
  console.log('PASS pay review wording');
}
