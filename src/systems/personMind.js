import {hashSeed} from '../core/rng.js';
// All roles use this saved record. Traits come from existing people, not rerolls.
export function personMind(S,p){
 if(!p.mind){const v=k=>hashSeed(`${S.seed}|${p.id}|mind|${k}`)%101;const t=p.traits||{};
 p.mind={ambition:t.ambition??v('ambition'),family:t.warmth??v('family'),independence:t.pride??v('independence'),thrift:100-(t.materialism??v('materialism')),adventure:v('adventure'),loyalty:t.reliability??v('loyalty'),wantsChildren:(t.warmth??v('family'))>=35,goal:null,history:[]};}
 return p.mind;
}
export function rememberChoice(S,p,kind,result){const m=personMind(S,p);m.history.unshift({kind,result,at:S.year*12+S.month});m.history=m.history.slice(0,12);m.lastDecision=S.year*12+S.month;}
export function canContactPerson(S,p){const m=personMind(S,p);return !m.noContactUntil||S.year*12+S.month>=m.noContactUntil;}
