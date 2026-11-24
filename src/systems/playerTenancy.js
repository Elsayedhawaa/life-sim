import{walletMove,recordJournal}from'../core/schema.js';
import{convertCurrency}from'../data/economy.js';
import{recordCivilLoss}from'./civilClaims.js';
// Explicit new leases only. Old setup fees are never reclassified as deposits.
export function closePlayerLease(S,{disputed=false}={}){
 const lease=S.housing.playerLease;if(!lease||lease.status!=='active')return{ok:false,msg:'No refundable deposit on file.'};
 const local=Math.max(0,Math.floor(convertCurrency(lease.deposit,lease.country,S.country,S.year)));
 const arrears=Math.min(local,Math.max(0,Math.floor(Number(lease.rentArrears)||0)));
 const remaining=local-arrears;
 if(arrears>0){lease.deductedForRent=arrears;lease.rentArrears-=arrears;recordJournal(S,'Paid rental deposit applied to recorded unpaid rent. No new cash received.','housing');}
 lease.status=disputed?'disputed':'ended';lease.endedAt=S.year*12+S.month;
 if(disputed){const loss=recordCivilLoss(S,'deposit',remaining,lease.landlord,{frozenLocal:remaining,defendantName:lease.landlord});lease.lossId=loss?.id;recordJournal(S,'Your paid rental deposit is disputed. Traced funds are reserved for settlement or a separate paid court claim.','housing');}
 else{if(remaining>0)walletMove(S,remaining,'Refund of paid rental deposit','housing');lease.refundedLocal=remaining;lease.refundCountry=S.country;}
 if(lease.rentArrears>0){S.money.loans.push({id:'rentarrears_'+lease.id,label:'Unpaid rent after deposit',balance:lease.rentArrears,monthlyPayment:Math.max(1,Math.ceil(lease.rentArrears/12)),annualRate:0,remainingMonths:12,country:S.country,missedMonths:0});lease.rentArrears=0;}
 S.housing.leaseHistory??=[];S.housing.leaseHistory.push({...lease});S.housing.playerLease=null;return{ok:true,msg:disputed?'Paid deposit recorded as a dispute.':'Rental deposit returned.'};
}
export function reconcilePlayerLease(S){const l=S.housing?.playerLease;if(l?.status==='active'&&(S.housing.mode!=='rent'||S.housing.currentHomeId!==l.homeId||S.country!==l.country))closePlayerLease(S);}
export function playerDepositValue(S){const l=S.housing?.playerLease;return l?.status==='active'?Math.max(0,convertCurrency(l.deposit,l.country,S.country,S.year)):0;}

export function recordPlayerRentDue(S,amount,available){const l=S.housing?.playerLease;if(!l||l.status!=='active')return{unpaid:0};const due=Math.max(0,Math.round(amount));const unpaid=Math.min(due,Math.max(0,due-Math.max(0,Number(available)||0)));l.rentArrears=(Number(l.rentArrears)||0)+unpaid;l.rentHistory??=[];l.rentHistory.push({year:S.year,month:S.month,due,paid:due-unpaid,unpaid,country:S.country});if(l.rentHistory.length>36)l.rentHistory.shift();return{unpaid};}
