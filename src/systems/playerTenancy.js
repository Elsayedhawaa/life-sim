import{walletMove,recordJournal}from'../core/schema.js';
import{chance}from'../core/rng.js';
import{convertCurrency}from'../data/economy.js';
import{recordCivilLoss}from'./civilClaims.js';
// Explicit new leases only. Old setup fees are never reclassified as deposits.
export function closePlayerLease(S,{disputed=false}={}){
 const lease=S.housing.playerLease;if(!lease||lease.status!=='active')return{ok:false,msg:'No refundable deposit on file.'};
 const local=Math.max(0,Math.floor(convertCurrency(lease.deposit,lease.country,S.country,S.year)));
 const arrears=Math.min(local,Math.max(0,Math.floor(Number(lease.rentArrears)||0)));
 const damages=(lease.damage||[]).filter(x=>x.status==='open'&&x.playerCaused&&x.recorded);
 const damageTotal=damages.reduce((n,x)=>n+Math.max(0,Number(x.cost)||0),0);
 const damageDeduction=Math.min(local-arrears,damageTotal);
 lease.deductedForDamage=damageDeduction;lease.inspection={at:S.year*12+S.month,items:damages.map(x=>({...x})),total:damageTotal,deducted:damageDeduction};
 const remaining=local-arrears-damageDeduction;
 if(arrears>0){lease.deductedForRent=arrears;lease.rentArrears-=arrears;recordJournal(S,'Paid rental deposit applied to recorded unpaid rent. No new cash received.','housing');}
 lease.status=disputed?'disputed':'ended';lease.endedAt=S.year*12+S.month;
 if(disputed){const loss=recordCivilLoss(S,'deposit',remaining,lease.landlord,{frozenLocal:remaining,defendantName:lease.landlord});lease.lossId=loss?.id;recordJournal(S,'Your paid rental deposit is disputed. Traced funds are reserved for settlement or a separate paid court claim.','housing');}
 else{if(remaining>0)walletMove(S,remaining,'Refund of paid rental deposit','housing');lease.refundedLocal=remaining;lease.refundCountry=S.country;}
 for(const d of damages)d.status='settled';
 const damageRemainder=Math.max(0,damageTotal-damageDeduction);
 if(damageRemainder>0)lease.rentArrears=(lease.rentArrears||0)+damageRemainder;
 if(lease.rentArrears>0){S.money.loans.push({id:'rentarrears_'+lease.id,label:'Rental liability after deposit',balance:lease.rentArrears,monthlyPayment:Math.max(1,Math.ceil(lease.rentArrears/12)),annualRate:0,remainingMonths:12,country:S.country,missedMonths:0});lease.rentArrears=0;}
 S.housing.leaseHistory??=[];S.housing.leaseHistory.push({...lease});S.housing.playerLease=null;return{ok:true,msg:disputed?'Paid deposit recorded as a dispute.':'Rental deposit returned.'};
}
export function reconcilePlayerLease(S){const l=S.housing?.playerLease;if(l?.status==='active'&&(S.housing.mode!=='rent'||S.housing.currentHomeId!==l.homeId||S.country!==l.country))closePlayerLease(S);}
export function playerDepositValue(S){const l=S.housing?.playerLease;return l?.status==='active'?Math.max(0,convertCurrency(l.deposit,l.country,S.country,S.year)):0;}

export function recordPlayerRentDue(S,amount,available){const l=S.housing?.playerLease;if(!l||l.status!=='active')return{unpaid:0};const due=Math.max(0,Math.round(amount));const unpaid=Math.min(due,Math.max(0,due-Math.max(0,Number(available)||0)));l.rentArrears=(Number(l.rentArrears)||0)+unpaid;l.rentHistory??=[];l.rentHistory.push({year:S.year,month:S.month,due,paid:due-unpaid,unpaid,country:S.country});if(l.rentHistory.length>36)l.rentHistory.shift();return{unpaid};}

export function recordRentalDamage(S,label,cost){const l=S.housing?.playerLease;if(!l||l.status!=='active'||!Number.isSafeInteger(cost)||cost<=0)return null;l.damage??=[];const d={id:'damage_'+l.id+'_'+l.damage.length,label,cost,playerCaused:true,recorded:true,status:'open',at:S.year*12+S.month};l.damage.push(d);return d;}
export function tickPlayerRentalDamage(S){const l=S.housing?.playerLease;if(!l||l.status!=='active'||l.lastDamageTick===S.year*12+S.month)return;l.lastDamageTick=S.year*12+S.month;if(!(l.damage||[]).some(x=>x.status==='open')&&chance(S,.02)){const cost=Math.max(1,Math.round(l.deposit*.15));recordRentalDamage(S,'Accidental broken cupboard door',cost);recordJournal(S,'You broke a cupboard door in your rented home. Repair cost is recorded against your paid deposit; fix it before moving or it appears in the inspection.','housing');}}
export function repairPlayerRentalDamage(S,id){const l=S.housing?.playerLease;const d=l?.damage?.find(x=>x.id===id&&x.status==='open');if(!d)return{ok:false,msg:'No recorded rental damage.'};if(S.money.cash<d.cost)return{ok:false,msg:'Not enough cash for this repair.'};walletMove(S,-d.cost,'Rental damage repair: '+d.label,'housing');d.status='repaired';d.paid=d.cost;return{ok:true,msg:'Recorded damage repaired. No deposit deduction for it.'};}

export function payPlayerRentArrears(S){
 const l=S.housing?.playerLease;const amount=Math.max(0,Math.ceil(Number(l?.rentArrears)||0));
 if(!l||l.status!=='active'||amount<=0)return{ok:false,msg:'No recorded unpaid rent.'};
 if(!Number.isSafeInteger(amount)||!Number.isFinite(S.money.cash)||S.money.cash<amount)return{ok:false,msg:'Not enough cash to clear unpaid rent.'};
 walletMove(S,-amount,'Payment of recorded rental arrears','housing');l.rentArrears=0;l.arrearsPayments??=[];l.arrearsPayments.push({year:S.year,month:S.month,amount,country:S.country});S.money.missedRentMonths=0;
 return{ok:true,msg:'Recorded unpaid rent cleared. Deposit stays refundable.'};
}
