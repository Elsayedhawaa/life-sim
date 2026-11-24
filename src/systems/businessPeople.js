import{convertCurrency}from '../data/economy.js';
import{tickEmployeeBenefits}from './businessBenefits.js';
import{hashSeed}from'../core/rng.js';
import{createPerson,recordJournal,walletMove}from'../core/schema.js';
import{personMind,rememberChoice}from'./personMind.js';
// Migrate employee identity without consuming the world's random stream or changing pay.
export function employeePerson(S,biz,emp){
 S.people||={};const id=emp.personId||`person_${emp.id}`;emp.personId=id;
 if(!S.people[id]){const parts=String(emp.name||'Employee').split(' ');const local={...S,rngState:hashSeed(`${S.seed}|${id}`)};
 S.people[id]=createPerson(local,{id,firstName:parts.shift(),familyName:parts.join(' ')||'Staff',gender:emp.gender,nationality:biz.country||S.country,age:25+hashSeed(id)%25,role:'employee',relationLabel:'Employee',jobTitle:emp.role,employer:biz.name});}
 const p=S.people[id];p.career||={};p.career.employer=biz.name;p.career.title=emp.role;p.career.monthlyIncomeLocal=emp.wageLocal;p.career.employed=true;personMind(S,p);return p;
}
export function staffPreference(S,biz,emp){const m=personMind(S,employeePerson(S,biz,emp));return m.ambition>=70?'Career growth':m.family>=65?'Work-life balance':m.thrift>=60?'Stable pay':'Team trust';}
export function tickEmployeeChoice(S,biz,emp){
 const p=employeePerson(S,biz,emp),m=personMind(S,p),now=S.year*12+S.month;
 if(emp.peopleTick===now)return false;
 tickEmployeeBenefits(S,biz,emp);emp.peopleTick=now;
 const threshold=18+Math.floor(m.independence/10);emp.unhappyMonths=emp.morale<threshold?(emp.unhappyMonths||0)+1:0;
 if(emp.unhappyMonths>=3){rememberChoice(S,p,'employment','resigned');p.career.employed=false;p.career.employer=null;return true;}
 if(emp.request&&now>emp.request.expires){emp.morale=Math.max(0,emp.morale-8);rememberChoice(S,p,emp.request.kind,'ignored');emp.request=null;}
 if(!emp.request&&(!emp.lastRequest||now-emp.lastRequest>=6)&&emp.morale<65){const pref=staffPreference(S,biz,emp);const kind=pref==='Career growth'?'training':pref==='Work-life balance'?'rest':'raise';emp.request={kind,created:now,expires:now+3};emp.lastRequest=now;recordJournal(S,`${emp.name} at ${biz.name} asked for ${kind==='raise'?'a pay review':kind==='rest'?'time off':'training'}.`,'career');}
 return false;
}
export function answerEmployeeRequest(S,biz,emp,accept){
 const req=emp?.request;if(!req)return{ok:false,msg:'No request pending.'};
 const p=employeePerson(S,biz,emp);if(accept){if(req.kind==='raise')emp.wageLocal=Math.round(emp.wageLocal*1.1);else if(req.kind==='training')return{ok:false,msg:'Use Train to fund the course.'};else return{ok:false,msg:'Use Day off to set the rota.'};emp.morale=Math.min(100,emp.morale+12);}else emp.morale=Math.max(0,emp.morale-8);
 p.career.monthlyIncomeLocal=emp.wageLocal;rememberChoice(S,p,req.kind,accept?'agreed':'declined');emp.request=null;return{ok:true,msg:accept?'Salary increased 10%.':'Request declined.'};
}

export function fulfillEmployeeRequest(S,biz,emp,kind){if(emp.request?.kind!==kind)return;const p=employeePerson(S,biz,emp);rememberChoice(S,p,kind,'agreed');emp.request=null;emp.morale=Math.min(100,emp.morale+6);}
export function staffActionQuote(S,biz,emp,kind){
 const wage=Math.max(1,Number(emp.wageLocal)||1);return{wage:Math.round(wage*(kind==='raise'?1.1:kind==='cut'?.9:1)),cost:kind==='bonus'?Math.round(wage*.25):0};
}

export function manageEmployee(S,biz,emp,kind){
 if(!biz||!emp||!(biz.staff||[]).includes(emp))return{ok:false,msg:'Employee not found.'};
 const p=employeePerson(S,biz,emp),m=personMind(S,p),q=staffActionQuote(S,biz,emp,kind),now=S.year*12+S.month;
 emp.managementActions||={};if(emp.managementActions[kind]===now)return{ok:false,msg:'Already done this month.'};
 if(kind==='bonus'){const charge=Math.round(convertCurrency(q.cost,biz.figuresCurrency||biz.country||S.country,S.country,S.year));if(S.money.cash<charge)return{ok:false,msg:'Not enough cash.'};walletMove(S,-charge,`Bonus · ${emp.name}`,'business');emp.morale=Math.min(100,emp.morale+10);p.rel.trust=Math.min(100,p.rel.trust+4);}
 else if(kind==='raise'){emp.wageLocal=q.wage;emp.morale=Math.min(100,emp.morale+10);if(emp.request?.kind==='raise')emp.request=null;}
 else if(kind==='cut'){emp.managementActions[kind]=now;if(m.independence>50||p.rel.trust<60){emp.morale=Math.max(0,emp.morale-8);rememberChoice(S,p,'pay-cut','refused');return{ok:false,msg:'Pay cut refused. Salary unchanged.'};}emp.wageLocal=q.wage;emp.morale=Math.max(0,emp.morale-12);}
 else if(kind==='warn'){emp.morale=Math.max(0,emp.morale-(m.independence>60?10:5));p.rel.trust=Math.max(0,p.rel.trust-5);emp.warnings=(emp.warnings||0)+1;}
 else return{ok:false,msg:'Unknown staff action.'};
 emp.managementActions[kind]=now;p.career.monthlyIncomeLocal=emp.wageLocal;rememberChoice(S,p,kind,'applied');recordJournal(S,`${emp.name} · ${kind} at ${biz.name}.`,'career');return{ok:true,msg:kind==='bonus'?'Bonus paid.':kind==='cut'?'Pay cut agreed.':kind==='raise'?'Salary raised 10%.':'Warning recorded. Trust fell.'};
}
