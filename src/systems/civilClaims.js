import {walletMove,recordJournal,nextId} from '../core/schema.js';
import {chance,randInt} from '../core/rng.js';
import {convertCurrency} from '../data/economy.js';
// Only an actual recorded loss can become a claim. One case per loss.
export function recordCivilLoss(S,kind,amount,source,opts={}){
 if(!Number.isSafeInteger(amount)||amount<=0)return null;S.legal.civilLosses??=[];
 const loss={id:nextId(S,'loss'),kind,amount,country:S.country,source,at:S.year*12+S.month,evidence:'transaction',status:'open'};if(opts.traceable&&chance(S,.45)){loss.defendant={name:String(opts.defendantName||source),frozenLocal:Math.floor(amount*randInt(S,25,75)/100),country:S.country};}S.legal.civilLosses.push(loss);return loss;
}
export function civilClaimQuote(S,suitId){
 const kind={sue_scam_broker:'broker_fraud',sue_employer_wages:'unpaid_wages',sue_wrongful_dismissal:'wrongful_dismissal',sue_landlord_deposit:'deposit'}[suitId];
 const loss=(S.legal.civilLosses||[]).find(x=>x.kind===kind&&x.status==='open');
 const recoverable=loss?.defendant&&loss.defendant.country===loss.country?Math.max(0,Math.min(Number(loss.amount)||0,Number(loss.defendant.frozenLocal)||0)):0;
 return{loss,available:!!loss,reason:loss?'Documented loss':'No recorded dispute',collectionAvailable:recoverable>0,recoverableLocal:loss?Math.floor(convertCurrency(recoverable,loss.country,S.country,S.year)):0,collectionNote:recoverable>0?'Simulation · Traced funds frozen · Hearing 3 mo · Recovery capped at frozen funds.':'No identified defendant assets in this record. Paid review cannot recover cash in the current model.',amount:loss?Math.round(convertCurrency(loss.amount,loss.country,S.country,S.year)):0};
}
export function fileCivilClaim(S,suit){
 const q=civilClaimQuote(S,suit.id);if(!q.available)return{ok:false,msg:'No recorded dispute. Nothing charged.'};
 const fee=Math.round(convertCurrency(suit.lawyerFeeUsd,'usa',S.country,S.year));if(S.money.cash<fee)return{ok:false,msg:'Not enough cash for counsel.'};
 walletMove(S,-fee,'Civil claim counsel','legal');q.loss.status='filed';q.loss.dueAt=S.year*12+S.month+3;q.loss.suitId=suit.id;q.loss.filedCountry=S.country;q.loss.feePaidLocal=fee;
 return{ok:true,msg:'Filed · Review in 3 months'};
}
export function tickCivilClaims(S){
 for(const loss of S.legal.civilLosses||[]){if(loss.status!=='filed'||S.year*12+S.month<loss.dueAt)continue;
 // No recovery is fabricated when the simulation has no identified defendant/assets.
 const frozen=loss.defendant?.country===loss.country?Math.max(0,Math.min(Number(loss.amount)||0,Number(loss.defendant.frozenLocal)||0)):0;
 if(frozen>0){const recovered=Math.floor(convertCurrency(frozen,loss.country,S.country,S.year));walletMove(S,recovered,'Civil claim: released frozen funds','legal');loss.recovered=frozen;loss.recoveredCountry=loss.country;loss.paidLocal=recovered;loss.paidCountry=S.country;loss.defendant.frozenLocal=0;loss.status='settled';recordJournal(S,`Court released traced funds from the recorded loss. Recovered ${recovered} in current currency; counsel fee remains paid.`,'legal');continue;}
 loss.status='reviewed';loss.recovered=0;
 recordJournal(S,`Counsel reviewed the recorded loss. No identified defendant assets; collection unavailable. No cash recovered.`,'legal');
 }
}
