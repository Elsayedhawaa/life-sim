import assert from'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const{createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const B=await import('../src/systems/businessEngine.js');
const M=await import('../src/systems/businessManager.js');
const{computeBusinessMonthFull}=await import('../src/systems/businessMonthly.js');
// GAME DESIGN (mine, unsourced): in new lives, profit and a manager's monthly pull stop raising repeat customers at 0.8; staff skill and decisions still can. Old lives keep the old behaviour.
function run(capOn){const S=createNewLifeState({country:'egy',seed:1,familyTier:'wealthy',birthYear:1995});ensureExtendedState(S);S.rules.repeatCap=capOn;S.year=2025;S.month=3;S.player.age=30;S.money.cash=1e13;S.education.degrees.push('cs');
const bp=B.listAllBusinessVentures(S).find(b=>b.id==='gym');const ev=B.evaluateBusinessLaunch(S,bp);const sl=M.managerShortlist(S,{country:'egy',monthlyRev:ev.revLocal,capitalInvested:ev.capitalLocal,staffRoles:[]});
B.createBusiness(S,'gym','T',{runBy:'manager',manager:sl[2]||sl[0],mode:'full_time'});const biz=S.career.businesses.at(-1);let at12=0,at24=0;
for(let m=0;m<24;m++){S.month=(S.month%12)+1;if(S.month===1)S.year++;for(const a of[...(biz.managerAsks||[])]){try{M.answerManagerAsk(S,biz,a.id,true)}catch(e){}}computeBusinessMonthFull(S,biz);biz.lastPL=null;if(m===11)at12=biz.repeatRate;}
at24=biz.repeatRate;return{at12,at24};}
const on=run(true),off=run(false);
assert.ok(off.at24>=0.97,'old lives still ratchet to full: '+off.at24);
assert.ok(on.at24<0.95,'new lives stay under 0.95 at 24 months: '+on.at24);
assert.ok(on.at12<off.at12+1e-9&&on.at24<off.at24,'cap lowers it');
console.log('ok v221 repeat cap',JSON.stringify({on,off}));
