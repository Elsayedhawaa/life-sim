import{hashSeed,clamp}from'../core/rng.js';import{recordJournal,walletMove,getCoupleForSpouse}from'../core/schema.js';import{eraLocalCost}from'../data/economy.js';import{getCountry}from'../data/countries.js';
export function relationshipAction(S,spouseId,action){
 const sp=S.people[spouseId];if(!sp?.alive||!S.relations.spouseIds.includes(spouseId))return{ok:false,msg:'No active marriage.'};
 const r=sp.relationshipProgress??={stage:'together'};
 if(action==='separate'){if(r.stage==='separated')return{ok:false,msg:'Already separated.'};r.stage='separated';r.separatedBy='player';r.separatedAt=S.year*12+S.month;sp.householdWith=sp.id;S.marriage.tryingForBaby=false;recordJournal(S,`You and ${sp.firstName} separated. Shared income stopped.`,'family');return{ok:true,msg:'Separated'};}
 if(action==='counsel'){const key=S.year*12+S.month;if(r.lastCounsel===key)return{ok:false,msg:'Next session available next month.'};const fee=eraLocalCost(getCountry(S.country).healthcare.checkup2026,S.country,S.year);if(S.money.cash<fee)return{ok:false,msg:'Not enough cash for counselling.'};walletMove(S,-fee,'Couple counselling','family');r.lastCounsel=key;r.sessions=(r.sessions||0)+1;sp.rel.trust=clamp(sp.rel.trust+8);sp.rel.affection=clamp(sp.rel.affection+5);return{ok:true,msg:'Counselling completed · Trust +8'};}
 if(action==='reconcile'){if(r.stage!=='separated'||r.courtCase)return{ok:false,msg:'No reconciliation available.'};if(sp.rel.trust<60||sp.rel.affection<55)return{ok:false,msg:'Partner is not ready. Trust 60 and affection 55 required.'};r.stage='together';sp.householdWith='player';r.affair=null;recordJournal(S,`You and ${sp.firstName} agreed to reconcile.`,'family');return{ok:true,msg:'Reconciled'};}
 if(action==='discuss'){if(!r.affair||r.affair.status!=='discovered')return{ok:false,msg:'No confirmed affair to discuss.'};r.affair.status='discussed';sp.rel.trust=clamp(sp.rel.trust-20);S.player.vitals.happiness=clamp(S.player.vitals.happiness-12);recordJournal(S,`${sp.firstName} admitted the affair. You chose to discuss what comes next.`,'family');return{ok:true,msg:'Affair discussed · Trust −20'};}
 return{ok:false,msg:'Action unavailable.'};
}
export function fileFamilyCase(S,spouseId,mode,options){
 const sp=S.people[spouseId];if(!sp)return{ok:false,msg:'Spouse not found.'};const r=sp.relationshipProgress??={stage:'together'};if(r.courtCase)return{ok:false,msg:'Case already filed.'};
 relationshipAction(S,spouseId,'separate');const now=S.year*12+S.month;r.courtCase={filedAt:now,stage:'filed',dueAt:now+(options.contested?6:3),mode,options:{...options,staged:false,courtApproved:true}};
 const couple=getCoupleForSpouse(S,spouseId);if(couple)couple.separationAt=now;
 recordJournal(S,`Divorce case filed. ${options.contested?'Contested hearing in 6 months.':'Agreement review in 3 months.'}`,'family');return{ok:true,msg:'Case filed · Settlement pending'};
}
export function tickRelationshipProgression(S){
 const ready=[];const now=S.year*12+S.month;
 for(const id of S.relations.spouseIds||[]){const sp=S.people[id];if(!sp?.alive)continue;const r=sp.relationshipProgress??={stage:'together'};
 if(r.stage==='together'&&!r.affair&&sp.rel.trust<50&&sp.rel.affection<50&&r.lastEventYear!==S.year){r.lastEventYear=S.year;const roll=hashSeed(`${S.seed}|relationship|${id}|${S.year}`)%100;if(roll<4){r.affair={startedAt:now,status:'hidden'};}}
 if(r.affair?.status==='hidden'&&now-r.affair.startedAt>=2){r.affair.status='discovered';sp.rel.trust=clamp(sp.rel.trust-15);recordJournal(S,`You learned that ${sp.firstName} has been having an affair.`,'family');}
 if(r.courtCase){const c=r.courtCase;if(now>=c.dueAt)ready.push({spouseId:id,...c});else if(now>c.filedAt)c.stage=c.options.contested?'hearing pending':'agreement review';}
 }
 return ready;
}
