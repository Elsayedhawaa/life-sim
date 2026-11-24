import {walletMove,recordJournal,nextId} from '../core/schema.js';
import {convertCurrency} from '../data/economy.js';
// Only an actual recorded loss can become a claim. One case per loss.
export function recordCivilLoss(S,kind,amount,source){
 if(!(amount>0))return null;S.legal.civilLosses??=[];
 const loss={id:nextId(S,'loss'),kind,amount,country:S.country,source,at:S.year*12+S.month,evidence:'transaction',status:'open'};S.legal.civilLosses.push(loss);return loss;
}
export function civilClaimQuote(S,suitId){
 const kind={sue_scam_broker:'broker_fraud',sue_employer_wages:'unpaid_wages',sue_wrongful_dismissal:'wrongful_dismissal',sue_landlord_deposit:'deposit'}[suitId];
 const loss=(S.legal.civilLosses||[]).find(x=>x.kind===kind&&x.status==='open');
 return{loss,available:!!loss,reason:loss?'Documented loss':'No recorded dispute',collectionAvailable:false,collectionNote:'No identified defendant assets in this record. Paid review cannot recover cash in the current model.',amount:loss?Math.round(convertCurrency(loss.amount,loss.country,S.country,S.year)):0};
}
export function fileCivilClaim(S,suit){
 const q=civilClaimQuote(S,suit.id);if(!q.available)return{ok:false,msg:'No recorded dispute. Nothing charged.'};
 const fee=Math.round(convertCurrency(suit.lawyerFeeUsd,'usa',S.country,S.year));if(S.money.cash<fee)return{ok:false,msg:'Not enough cash for counsel.'};
 walletMove(S,-fee,'Civil claim counsel','legal');q.loss.status='filed';q.loss.dueAt=S.year*12+S.month+3;q.loss.suitId=suit.id;
 return{ok:true,msg:'Filed · Review in 3 months'};
}
export function tickCivilClaims(S){
 for(const loss of S.legal.civilLosses||[]){if(loss.status!=='filed'||S.year*12+S.month<loss.dueAt)continue;
 // No recovery is fabricated when the simulation has no identified defendant/assets.
 loss.status='reviewed';loss.recovered=0;
 recordJournal(S,`Counsel reviewed the recorded loss. No identified defendant assets; collection unavailable. No cash recovered.`,'legal');
 }
}
