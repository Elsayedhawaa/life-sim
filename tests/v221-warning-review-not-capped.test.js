const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
import assert from'node:assert/strict';
const{createNewLifeState,ensureExtendedState,createPerson}=await import('../src/core/schema.js');
const{advanceSingleTurn,resolveActiveSceneChoice}=await import('../src/core/gameLoop.js');
/* Played defects: (1) the per-life cap of 2 dropped the third formal warning, so the player met two warning scenes and was then told he was dismissed "after three"; (2) annual reviews stopped after the second. */
const mk=(perf)=>{const S=createNewLifeState({country:'egy',seed:3,birthYear:1999});ensureExtendedState(S);S.player.age=25;S.year=2024;S.month=1;S.pacing='monthly';
const boss=createPerson(S,{gender:'f',age:45,role:'colleague',firstName:'Dina'});S.people[boss.id]=boss;S.career.employed=true;S.money.cash=1e7;
S.career.job={id:'j1',employer:'Acme',title:'Analyst',monthlyGross:8000,performance:perf,monthsInRole:5,workMode:'normal',bossId:boss.id};return S};
const run=(S,perf,months)=>{const seen=[];for(let i=0;i<months&&S.career.employed&&!S.gameOver;i++){advanceSingleTurn(S);if(S.career.job)S.career.job.performance=perf;let g=0;while(S.activeScene&&g++<6){seen.push(S.activeScene.baseId);const r=resolveActiveSceneChoice(S,0);if(!r||r.ok===false)S.activeScene=null;}}return seen};
{const S=mk(30);const seen=run(S,30,30);assert.equal(seen.filter(x=>x==='formal_warning').length,3,'all three warnings are shown: '+seen.join());assert.equal(S.career.employed,false,'then dismissed');}
{const S=mk(60);const seen=run(S,60,90);assert.ok(seen.filter(x=>x==='annual_review').length>=5,'reviews keep coming: '+seen.filter(x=>x==='annual_review').length);}
console.log('ok v221 warning review not capped');
