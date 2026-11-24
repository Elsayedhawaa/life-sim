import{walletMove,recordJournal}from'../core/schema.js';
import{convertCurrency}from'../data/economy.js';
import{recordCivilLoss}from'./civilClaims.js';
// Explicit new leases only. Old setup fees are never reclassified as deposits.
export function closePlayerLease(S,{disputed=false}={}){
 const lease=S.housing.playerLease;if(!lease||lease.status!=='active')return{ok:false,msg:'No refundable deposit on file.'};
 const local=Math.max(0,Math.floor(convertCurrency(lease.deposit,lease.country,S.country,S.year)));
 lease.status=disputed?'disputed':'ended';lease.endedAt=S.year*12+S.month;
 if(disputed){const loss=recordCivilLoss(S,'deposit',local,lease.landlord,{frozenLocal:local,defendantName:lease.landlord});lease.lossId=loss?.id;recordJournal(S,'Your paid rental deposit is disputed. Traced funds are reserved for settlement or a separate paid court claim.','housing');}
 else{if(local>0)walletMove(S,local,'Refund of paid rental deposit','housing');lease.refundedLocal=local;lease.refundCountry=S.country;}
 S.housing.leaseHistory??=[];S.housing.leaseHistory.push({...lease});S.housing.playerLease=null;return{ok:true,msg:disputed?'Paid deposit recorded as a dispute.':'Rental deposit returned.'};
}
export function reconcilePlayerLease(S){const l=S.housing?.playerLease;if(l?.status==='active'&&(S.housing.mode!=='rent'||S.housing.currentHomeId!==l.homeId||S.country!==l.country))closePlayerLease(S);}
export function playerDepositValue(S){const l=S.housing?.playerLease;return l?.status==='active'?Math.max(0,convertCurrency(l.deposit,l.country,S.country,S.year)):0;}
