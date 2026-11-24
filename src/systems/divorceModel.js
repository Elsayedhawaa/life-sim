/* Simplified game settlement, not any country's family law. */
import {nextId,recordJournal,walletMove,moveBalance} from '../core/schema.js';
import {getCountry,formatMoney} from '../data/countries.js';
import {eraLocalCost,convertCurrency} from '../data/economy.js';
export function recordMarriageAssets(S,couple){
  couple.assetBaseline={year:S.year,country:S.country,liquid:S.money.cash+S.money.savings,
    propertyIds:(S.housing.properties||[]).map(p=>p.id),carIds:(S.cars||[]).map(p=>p.id)};
}
export function divorceChildren(S,spouseId){return(S.relations.childIds||[]).map(id=>S.people[id]).filter(ch=>ch?.alive&&ch.age<18&&(!(ch.parentIds||[]).length||ch.parentIds.includes(spouseId)));}
function payCost(S,amount,label){
  const pull=Math.min(Math.max(0,amount-S.money.cash),Math.max(0,S.money.savings));
  if(pull){moveBalance(S,'savings',-pull,label,'bank');walletMove(S,pull,label,'bank');}
  const paid=Math.min(Math.max(0,S.money.cash),amount);if(paid)walletMove(S,-paid,label,'family');
  const debt=amount-paid;if(debt)S.money.loans.push({id:nextId(S,'loan'),label,balance:debt,monthlyPayment:Math.max(1,Math.ceil(debt/24)),annualRate:0,remainingMonths:24,country:S.country,missedMonths:0,inCollections:true});
}
export function settleGameDivorce(S,spouse,couple,{custody='shared',contested=false,prenup=false}={}){
  S.marriage.divorceOrders??=[];
  const baseline=couple?.assetBaseline;
  const fee=eraLocalCost(getCountry(S.country).monthlyBasket2026.rentModest*(contested?3:1),S.country,S.year);
  payCost(S,fee,'Divorce legal fees (simplified game model)');
  const sold=[];let assetProceeds=0;
  if(!prenup){
    S.housing.properties=(S.housing.properties||[]).filter(p=>{
      if(baseline?.propertyIds?.includes(p.id))return true;
      const value=Math.max(0,Number(p.valueLocal)||convertCurrency(p.nativeValue||0,p.country||S.country,S.country,S.year));
      const debt=p.nativeInstallmentRemaining!=null?convertCurrency(p.nativeInstallmentRemaining,p.country||S.country,S.country,S.year):Number(p.installmentRemaining)||0;
      assetProceeds+=value-debt;sold.push({id:p.id,name:p.name,country:p.country,value,debt,kind:'property'});
      if(S.housing.currentHomeId===p.id){S.housing.mode='rent';S.housing.currentHomeId=null;S.housing.currentHomeName='Post-divorce modest rental';S.housing.monthlyRent=eraLocalCost(getCountry(S.country).monthlyBasket2026.rentModest,S.country,S.year);S.housing.rentIndexedYear=S.year;}
      return false;
    });
    S.cars=(S.cars||[]).filter(car=>{
      if(baseline?.carIds?.includes(car.id))return true;
      const loans=S.money.loans.filter(l=>l.carId===car.id);const debt=loans.reduce((n,l)=>n+(Number(l.balance)||0),0);
      S.money.loans=S.money.loans.filter(l=>l.carId!==car.id);assetProceeds+=(Number(car.valueLocal)||0)-debt;
      sold.push({id:car.id,name:car.name,kind:'car',country:S.country,value:Number(car.valueLocal)||0,debt});return false;
    });
    if(assetProceeds>=0)walletMove(S,assetProceeds,'Marital assets sold, debts cleared (game settlement)','family');else payCost(S,-assetProceeds,'Marital asset sale debt shortfall');
  }
  if(!prenup){
    for(const cd of S.money.certificates||[])walletMove(S,Math.max(0,Number(cd.principal)||0),'Certificate liquidated for game divorce','family');
    S.money.certificates=[];
  }
  const protectedLiquid=baseline?convertCurrency(baseline.liquid,baseline.country,S.country,S.year):0;
  const divisible=prenup?0:Math.max(0,S.money.cash+S.money.savings-protectedLiquid);
  const spouseAward=Math.round(divisible*.5);payCost(S,spouseAward,`Divorce asset award to ${spouse.firstName}`);
  if(spouse.career)spouse.career.savingsLocal=(spouse.career.savingsLocal||0)+convertCurrency(spouseAward,S.country,spouse.residenceCountry||S.country,S.year);
  const children=divorceChildren(S,spouse.id);
  let result=custody;
  if(contested){
    const score=p=>(p?.rel?.trust??65)+(p?.vitals?.health??70)+(p?.traits?.warmth??50);
    result=Math.abs(score(S.player)-score(spouse))<25?'shared':score(S.player)>score(spouse)?'player':'spouse';
  }
  const playerIncome=Math.max(0,S.career.job?.monthlyGross||S.career.monthlyPension||0);
  const spouseIncome=Math.max(0,convertCurrency(spouse.career?.monthlyIncomeLocal||0,spouse.residenceCountry||S.country,S.country,S.year));
  const payer=result==='player'?'spouse':result==='spouse'?'player':playerIncome>=spouseIncome?'player':'spouse';
  const monthly=children.length?Math.round((payer==='player'?playerIncome:spouseIncome)*Math.min(.4,(result==='shared'?.10:.20)+Math.max(0,children.length-1)*.05)):0;
  const order={id:nextId(S,'divorce'),spouseId:spouse.id,year:S.year,month:S.month,country:S.country,legalFees:fee,spouseAward,soldAssets:sold,custody:result,childIds:children.map(c=>c.id),payer,monthlySupport:monthly,arrears:0,contested,baselineKnown:!!baseline};
  S.marriage.divorceOrders.push(order);
  for(const ch of children){ch.custody={orderId:order.id,arrangement:result,otherParentId:spouse.id,playerNightsPer14:result==='shared'?7:result==='player'?11:3};ch.householdWith=result==='spouse'?spouse.id:'player';}
  spouse.householdWith=spouse.id;spouse.maritalStatus='divorced';spouse.spouseIds=(spouse.spouseIds||[]).filter(id=>id!=='player');spouse.role='ex_spouse';spouse.relationLabel='Ex-spouse';
  recordJournal(S,`Simplified game divorce: ${sold.length} marital properties/cars sold, debts cleared first; ${formatMoney(spouseAward,S.country)} awarded to ${spouse.firstName}. Legal fees ${formatMoney(fee,S.country)}. Custody ${result}; ${formatMoney(monthly,S.country)}/month child support from ${payer}. ${baseline?'Recorded premarital assets protected.':'Legacy marriage has no premarital inventory: existing properties/cars treated as shared.'} Not local family law; no automatic fault penalty for infidelity.`,'family');
  return order;
}
export function settleChildSupportMonth(S,available){
  completeSupportReviews(S);
  let outgoing=0,incoming=0;
  for(const order of S.marriage.divorceOrders||[]){
    const alive=order.childIds.filter(id=>S.people[id]?.alive&&S.people[id].age<18);
    order.active=alive.length>0;
    if(!alive.length&&!(order.arrears>0))continue;
    const amount=Math.round(convertCurrency(order.monthlySupport*alive.length/order.childIds.length,order.country,S.country,S.year));
    if(order.payer==='player'){
      const due=amount+Math.round(convertCurrency(order.arrears||0,order.country,S.country,S.year));
      const paid=Math.min(due,Math.max(0,available-outgoing));outgoing+=paid;
      const ex=S.people[order.spouseId];if(ex){ex.career??={};ex.career.savingsLocal=(ex.career.savingsLocal||0)+convertCurrency(paid,S.country,ex.residenceCountry||S.country,S.year);}
      order.arrears=convertCurrency(due-paid,S.country,order.country,S.year);order.lastPaid=paid;
    }else if(S.people[order.spouseId]?.alive){
      const ex=S.people[order.spouseId];ex.career??={};
      const exCountry=ex.residenceCountry||S.country;
      const savings=convertCurrency(Math.max(0,Number(ex.career.savingsLocal)||0),exCountry,S.country,S.year);
      const due=amount+Math.round(convertCurrency(order.arrears||0,order.country,S.country,S.year));
      const paid=Math.min(due,savings);ex.career.savingsLocal=Math.max(0,(Number(ex.career.savingsLocal)||0)-convertCurrency(paid,S.country,exCountry,S.year));incoming+=paid;order.lastPaid=paid;
      order.arrears=convertCurrency(due-paid,S.country,order.country,S.year);
    }
  }
  return{outgoing,incoming};
}

/* Review is requested, not an automatic self-declared income cut. Pending
   review leaves the current obligation and arrears intact until next month.
   Process reference: https://acf.gov/css/parents . Formula remains game-only. */
export function requestSupportReview(S,orderId){
 const o=(S.marriage.divorceOrders||[]).find(x=>x.id===orderId);
 if(!o||!o.childIds.some(id=>S.people[id]?.alive&&S.people[id].age<18))return{ok:false,msg:'No active minor-child support order.'};
 if(o.reviewPending)return{ok:false,msg:'A support review is already pending.'};
 const now=S.year*12+S.month;if(o.lastReviewAt!=null&&now-o.lastReviewAt<6)return{ok:false,msg:'The game allows another review after six months.'};
 o.reviewPending={filedAt:now,dueAt:now+1};recordJournal(S,'Requested support review. Existing monthly support and arrears remain due while current income and parenting arrangements are reviewed. Game review takes one month; this is not a local court timetable.','family');return{ok:true,msg:'Support review filed. Current order stays due pending review.'};
}
export function completeSupportReviews(S){
 const now=S.year*12+S.month;
 for(const o of S.marriage.divorceOrders||[]){if(!o.reviewPending||now<o.reviewPending.dueAt)continue;
  const count=o.childIds.filter(id=>S.people[id]?.alive&&S.people[id].age<18).length;
  const player=Math.max(0,S.career.retired?S.career.monthlyPension||0:S.career.job?.monthlyGross||0);
  const ex=S.people[o.spouseId];const exIncome=Math.max(0,convertCurrency(Number(ex?.career?.monthlyIncomeLocal)||0,ex?.residenceCountry||S.country,S.country,S.year));
  const payer=o.custody==='player'?'spouse':o.custody==='spouse'?'player':player>=exIncome?'player':'spouse';
  if(payer!==o.payer&&o.arrears>0){o.reviewPending=null;o.lastReviewAt=now;recordJournal(S,'Support review requires a separate arrears settlement before changing payer in this game model. Existing arrears and order preserved.','family');continue;}
  const income=payer==='player'?player:exIncome;const rate=Math.min(.4,(o.custody==='shared'?.1:.2)+Math.max(0,count-1)*.05);
  const monthly=count?Math.round(convertCurrency(income*rate,S.country,o.country,S.year)):0;
  const old=o.monthlySupport;o.monthlySupport=monthly*(o.childIds.length/Math.max(1,count));o.payer=payer;o.lastReviewAt=now;o.reviewPending=null;
  o.reviews??=[];o.reviews.push({at:now,oldMonthly:old,newMonthly:o.monthlySupport,arrearsPreserved:o.arrears||0});
  recordJournal(S,`Support review completed: prospective game order ${formatMoney(monthly,o.country)}/month from ${payer}. Prior arrears are unchanged. This simplified income-percentage calculation is not a state guideline.`,'family');
 }
}
