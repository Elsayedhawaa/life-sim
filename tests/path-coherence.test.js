// Full-path checker: runs seeded lives through the real engine and checks each shown scene
// against the saved state at that moment. Coverage limits: only the claim types listed in CHECKS.
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{advanceSingleTurn,resolveActiveSceneChoice}from'../src/core/gameLoop.js';
const SEEDS=+process.env.SEEDS||12, COUNTRIES=['egy','gbr','usa','tur','deu','jpn'];
const found=new Map();let SCENES=0;const seen=new Set();
const flag=(kind,id,detail,s)=>{const k=kind+'|'+id;if(!found.has(k))found.set(k,{kind,id,detail,year:s.year,n:0});found.get(k).n++;};
const DEATHISH=/\b(died|death|funeral|passed away|late |estate|inherit|grie|bereave|memorial|widow)/i;
for(let seed=1;seed<=SEEDS;seed++){
 const s=createNewLifeState({country:COUNTRIES[seed%COUNTRIES.length],seed:seed*7+3});ensureExtendedState(s);
 for(let i=0;i<1100&&!s.gameOver;i++){
  if(!s.activeScene){advanceSingleTurn(s);continue;}
  SCENES++;const a=s.activeScene,id=a.eventId||a.baseId||a.key,text=(a.title||'')+' '+(a.text||'');
  const major=/death|died|funeral|estate|inherit|bereave/i.test(id+a.title)||DEATHISH.test(text);
  // 1 participants exist and are alive
  for(const pid of Object.values(a.eventParticipantIds||{}).flat()){const p=s.people[pid];
   if(!p)flag('participant-missing',id,pid,s);
   else if(p.alive===false&&!major)flag('participant-dead',id,p.relationLabel,s);}
  // 2 labelled people alive
  for(const l of a.people||[])if(l.name&&!major){const p=Object.values(s.people).find(x=>x.firstName===l.name&&x.alive===false);if(p&&!Object.values(s.people).some(x=>x.firstName===l.name&&x.alive))flag('label-dead',id,l.label,s);}
  // 3 dead person named in text
  if(!major)for(const p of Object.values(s.people))if(p.alive===false&&p.firstName&&p.firstName.length>2&&new RegExp('\\b'+p.firstName+'\\b').test(text)&&!Object.values(s.people).some(x=>x!==p&&x.alive&&x.firstName===p.firstName))flag('dead-named',id,p.relationLabel,s);
  // 4 state claims
  const job=s.career?.job;
  if(!job&&/\byour (boss|manager|employer)\b|\byour (current )?job\b|\byour (monthly )?salary\b/i.test(text)&&!major)flag('job-claim-no-job',id,'',s);
  if(!(s.cars||[]).length&&/\byour (car|vehicle)\b/i.test(text))flag('car-claim-no-car',id,'',s);
  const hasPartner=Object.values(s.people).some(p=>p.alive&&/spouse|partner|wife|husband|fianc/i.test(p.role+p.relationLabel));
  if(!hasPartner&&/\byour (wife|husband|spouse|fianc)/i.test(text))flag('partner-claim-no-partner',id,'',s);
  if(/undefined|NaN|\[object|\{\w+\}/.test(text))flag('text-leak',id,text.match(/undefined|NaN|\[object|\{\w+\}/)[0],s);
  const idx=(i+seed)%Math.max(1,(a.choices||[]).length);
  const snap=()=>JSON.stringify([s.money,s.ledger?.length,s.eventOutcomes,s.career,s.legal,s.housing,s.player.vitals,s.reputation,s.skills,s.values,s.journal?.length,s.journal?.[0]?.id,Object.values(s.people).map(p=>[p.alive,p.rel?.affection,p.rel?.trust,p.rel?.resentment]),s.sceneQueue?.length,s.facts]);
  const before=snap();
  try{resolveActiveSceneChoice(s,idx);}catch(e){flag('choice-throws',id,String(e.message).slice(0,80)+' @'+String(e.stack).split('\n')[1].trim().slice(0,90),s);s.activeScene=null;}
  if(snap()===before&&!/^(continue|understood|ok|close)|unchanged|hold out/i.test(a.choices?.[idx]?.label||'')&&(a.choices?.[idx]?.available?.(s)!==false))flag('choice-does-nothing',id+'#'+idx,(a.choices?.[idx]?.label||'').slice(0,50),s);
  if(s.activeScene)s.activeScene=null;
 }
}
const rows=[...found.values()].sort((x,y)=>y.n-x.n);
for(const r of rows)console.log(r.kind.padEnd(26),r.id.padEnd(40),r.n,r.detail);
console.log("findings",rows.length,"scenes",SCENES);
if(rows.length)process.exit(1);
