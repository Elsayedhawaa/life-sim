import {clamp} from '../core/rng.js';
import {recordJournal,queueScene,setCoupleStage,getCoupleForPartner,newCoupleRecord,syncCoupleToLegacy} from '../core/schema.js';
import {checkSocialEnergy,spendSocialEnergy,noteSocialContact} from './socialEnergy.js';
import {recordMemory} from './npcMemory.js';

const now = S => S.year * 12 + S.month;
export function courtshipState(S,p) {
  // Old saves start here, with no invented history of neglect.
  return p.courtship ||= {startedAt:now(S),lastTimeAt:now(S),deferrals:0,history:[],serial:0};
}
function active(S,p){return p?.alive&&S.relations.partnerId===p.id&&!S.marriage.engagement;}
export function courtshipSceneCurrent(S,scene){const d=scene?.courtshipDecision;return !d||!!(active(S,S.people[d.id])&&S.people[d.id].courtship?.pending?.serial===d.serial);}
export function courtshipMonthsApart(S,p){const r=courtshipState(S,p);const contact=Number.isFinite(p.rel.lastContactYear)&&Number.isFinite(p.rel.lastContactMonth)?p.rel.lastContactYear*12+p.rel.lastContactMonth:r.lastTimeAt;return Math.max(0,now(S)-Math.max(r.lastTimeAt,contact));}
function clearDecision(S,id){S.sceneQueue=(S.sceneQueue||[]).filter(s=>s.courtshipDecision?.id!==id);if(S.activeScene?.courtshipDecision?.id===id)S.activeScene=null;}
function note(S,p,kind){const r=courtshipState(S,p);r.history.push({kind,at:now(S)});}
function endCourtship(S,p,reason){
  const r=courtshipState(S,p);if(!active(S,p))return;
  const couple=getCoupleForPartner(S,p.id);if(couple){setCoupleStage(S,couple,'ended');couple.endedReason=reason;}
  S.relations.partnerId=null;S.marriage.status=S.relations.spouseIds.length?'married':'single';
  p.role='ex_partner';p.relationLabel='Former Partner';p.householdWith=p.id;
  clearDecision(S,p.id);
  r.endedAt=now(S);r.endedReason=reason;r.pending=null;note(S,p,reason);
  recordMemory(S,p,'courtship_ended',reason==='stopped_waiting'?'Ended courtship after months apart.':'You ended the courtship.',{weight:3});
  recordJournal(S,reason==='stopped_waiting'?`${p.firstName} ended the relationship. You had not made time for each other in ${courtshipMonthsApart(S,p)} months.`:`You told ${p.firstName} you did not want to continue seeing each other.`,'relationship');
}
export function buildCourtshipEnding(S,id,at){
 const p=S.people[id],r=p?.courtship;if(!p||r?.endedAt!==at||r.endedReason!=='stopped_waiting'||r.endingRead)return null;
 return{key:`courtship_end_${id}_${at}`,courtshipEnding:{id,at},category:'relationship',title:`${p.firstName} Has Moved On`,text:`${p.firstName}: "I do not want to keep waiting for plans that never happen. We should stop seeing each other."`,choices:[{label:'Read the message',effect:st=>{const c=st.people[id]?.courtship;if(c?.endedAt===at)c.endingRead=true;}}]};
}
export function courtshipAction(S,id,kind,serial=null){
  const p=S.people[id];if(!active(S,p))return{ok:false,msg:'This courtship is no longer active.'};
  const r=courtshipState(S,p);if(serial!==null&&r.pending?.serial!==serial)return{ok:false,msg:'This conversation has ended.'};
  if(kind==='time'){
    if(r.lastPlannedAt===now(S))return{ok:false,msg:'You already made time together this month.'};
    const e=checkSocialEnergy(S,3);if(!e.ok)return e;spendSocialEnergy(S,3);noteSocialContact(S,p);
    clearDecision(S,p.id);
    r.lastTimeAt=now(S);r.lastPlannedAt=now(S);r.deferrals=0;r.warningAt=null;r.pending=null;
    p.rel.affection=clamp(p.rel.affection+5);p.rel.trust=clamp(p.rel.trust+3);note(S,p,'made_time');
    recordMemory(S,p,'courtship_time','You kept time free to see each other.',{weight:1});
    recordJournal(S,`You kept an evening free for ${p.firstName}.`,'relationship');
    return{ok:true,msg:'Made time together · 3 energy'};
  }
  if(kind==='end'){endCourtship(S,p,'player_ended');return{ok:true,msg:'Courtship ended'};}
  if(kind!=='later')return{ok:false,msg:'Choice unavailable.'};
  if(r.lastDeferredAt===now(S))return{ok:false,msg:'You already answered this month.'};
  clearDecision(S,p.id);
  r.lastDeferredAt=now(S);r.deferrals++;r.pending=null;r.nextAskAt=now(S)+3;
  p.rel.trust=clamp(p.rel.trust-3);note(S,p,S.career.employed&&S.career.job?'work_first':'deferred');
  if(S.career.employed&&S.career.job){S.career.job.performance=clamp((S.career.job.performance||0)+2);S.player.vitals.stress=clamp(S.player.vitals.stress+3);}
  recordJournal(S,S.career.employed?`You told ${p.firstName} work came first for now. No date was set.`:`You told ${p.firstName} you were not ready to make plans.`,'relationship');
  return{ok:true,msg:S.career.employed&&S.career.job?'Work first · performance +2, stress +3. No plans made.':'Not now. No plans made.'};
}
export function buildCourtshipScene(S,id,serial){
  const p=S.people[id];if(!active(S,p))return null;const r=courtshipState(S,p),pending=r.pending;
  if(!pending||pending.serial!==serial)return null;
  const months=courtshipMonthsApart(S,p),final=pending.kind==='boundary';
  return{key:`courtship_${id}_${serial}`,baseId:`courtship_${id}_${serial}`,courtshipDecision:{id,serial},category:'relationship',title:final?`${p.firstName}: Make a Plan`:`A Message from ${p.firstName}`,
    text:final?`${months} months without time together. ${p.firstName}: "I want a relationship where we actually see each other. If nothing changes, I am moving on."`:`${p.firstName}: "Are we going to see each other this month?" It has been ${months} months since you last made time.`,
    choices:[{label:'Keep an evening free · 3 energy',available:()=>checkSocialEnergy(S,3).ok,effect:st=>courtshipAction(st,id,'time',serial)},
      {label:S.career.employed&&S.career.job?'Take extra work · performance +2, stress +3':'Not ready to make plans',effect:st=>courtshipAction(st,id,'later',serial)},
      {label:'End the courtship',effect:st=>courtshipAction(st,id,'end',serial)}]};
}
export function restoreCourtshipScene(S,saved){const e=saved?.courtshipEnding;if(e)return buildCourtshipEnding(S,e.id,e.at);const d=saved?.courtshipDecision;return d?buildCourtshipScene(S,d.id,d.serial):null;}
export function tickCourtship(S){
  const p=S.people[S.relations.partnerId];if(!active(S,p))return;const r=courtshipState(S,p),n=now(S),months=courtshipMonthsApart(S,p);
  if(months<3||p.relationLabel==='Live-In Partner'){r.warningAt=null;r.pending=null;clearDecision(S,p.id);return;}
  if(r.warningAt!=null&&n-r.warningAt>=3&&months>=9){endCourtship(S,p,'stopped_waiting');queueScene(S,buildCourtshipEnding(S,p.id,n));return;}
  if(r.pending||n<(r.nextAskAt||0))return;
  const kind=months>=6?'boundary':'plans';r.pending={kind,serial:++r.serial};
  const scene=buildCourtshipScene(S,p.id,r.serial);
  if(queueScene(S,scene)){if(kind==='boundary'&&r.warningAt==null)r.warningAt=n;r.nextAskAt=n+3;}
  else r.pending=null;
}
export function reconnectCourtship(S,id){
  const p=S.people[id],r=p?.courtship;
  if(!p?.alive||p.role!=='ex_partner'||!r||S.relations.partnerId||S.marriage.engagement||S.relations.spouseIds.length)return{ok:false,msg:'No reconnection available.'};
  if(now(S)-r.endedAt<6)return{ok:false,msg:'Give each other time. Six months apart first.'};
  const married=p.maritalStatus==='married'||(p.spouseIds||[]).some(s=>S.people[s]?.alive);
  if(married)return{ok:false,msg:`${p.firstName} has married. They are not available.`};
  if(r.lastReconnectAt!=null&&now(S)-r.lastReconnectAt<12)return{ok:false,msg:'They already answered. Give them space.'};
  const e=checkSocialEnergy(S,2);if(!e.ok)return e;spendSocialEnergy(S,2);r.lastReconnectAt=now(S);
  if(p.rel.trust<60||p.rel.affection<60||r.deferrals>=2){
    recordJournal(S,`${p.firstName}: "I do not want to start this again."`,'relationship');note(S,p,'reconnect_declined');return{ok:true,msg:'They do not want to start again.'};
  }
  p.role='partner';p.relationLabel='Romantic Partner';r.lastTimeAt=now(S);r.warningAt=null;r.pending=null;r.deferrals=0;r.nextAskAt=now(S)+3;
  const c=newCoupleRecord(S,'player',id,{stage:'dating',country:S.country});S.marriage.couples.push(c);syncCoupleToLegacy(S,c);noteSocialContact(S,p);note(S,p,'reconnected');
  recordJournal(S,`${p.firstName} agreed to meet again. You are seeing each other, not engaged.`,'relationship');return{ok:true,msg:'Agreed to meet again · 2 energy'};
}
