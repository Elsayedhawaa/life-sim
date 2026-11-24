import{rand}from'../core/rng.js';
export function staffingRequirement(biz){const id=biz.typeId||'';return /pharmacy/.test(id)?'pharmacist':/dental/.test(id)?'dentist':/vet_/.test(id)?'vet':/physio/.test(id)?'physio':/clinic/.test(id)?'doctor':/law_/.test(id)?'lawyer':null;}
export function tickBusinessSafety(S,biz,opts={}){
 const now=S.year*12+S.month;if(biz.safetyMonth===now)return biz.safetyEffect;
 const team=biz.staff||[],cleaner=team.filter(e=>e.role==='cleaner').reduce((n,e)=>Math.max(n,e.skill||0),0),security=team.filter(e=>e.role==='security').reduce((n,e)=>Math.max(n,e.skill||0),0);
 biz.hygiene=Math.max(0,Math.min(100,(biz.hygiene??80)-4+cleaner*.12));biz.safety=Math.min(95,45+security*.6);
 let cost=0;const notes=[];let revMult=1;
 if(biz.hygiene<35){revMult*=.85;notes.push('Poor hygiene reduced sales 15%.');if(S.month%3===0){cost+=Math.round(biz.monthlyRev*.04);notes.push('Game hygiene inspection fine.');}}
 const theft=opts.forceTheft??(rand(S)<.04*(1-security/120));if(theft){cost+=Math.round(biz.monthlyRev*.05*(1-security/120));notes.push('Robbery loss. Security reduced exposure, not eliminated it.');}
 const required=staffingRequirement(biz);if(required&&!team.some(e=>e.role===required)){revMult*=.7;notes.push(`Missing ${required}: service capacity reduced 30%. Game staffing rule, not a licensing determination.`);}
 biz.safetyMonth=now;return biz.safetyEffect={cost,revMult,notes};
}
