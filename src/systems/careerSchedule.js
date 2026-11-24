import{contractRuleFor}from'../data/economy.js';
export function partTimeJob(job){return job?.employmentFraction===.45||/^part-time/i.test(job?.title||'');}
export function careerHours(S,mode=S.career?.job?.workMode||'normal'){if(!S.career?.employed||!S.career.job)return 0;if(partTimeJob(S.career.job))return mode==='coast'?16:20;const base=contractRuleFor(S.country).weeklyHours||40;return mode==='hard'?base+10:mode==='overtime'?base+20:mode==='coast'?Math.round(base*.8):base;}
