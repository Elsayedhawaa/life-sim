import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState,walletMove}from'../src/core/schema.js';
import{resolveActiveSceneChoice}from'../src/core/gameLoop.js';
import{discretionaryLock,atCreditLimit}from'../src/core/discretionary.js';
/* Decision: at the credit limit, optional spending options are disabled with a reason; bills and care stay open. Test is engine-level on synthetic scenes. */
const mk=(baseId,cash,flag=true)=>{const S=createNewLifeState({country:'egy',birthYear:1998,seed:5});ensureExtendedState(S);S.player.age=30;if(!flag)delete S.rules;S.money.creditCap=30000;S.money.cash=cash;
 S.activeScene={key:baseId+'_1',baseId,category:'life',title:'T',text:'x',choices:[
  {label:'Treat yourself',effect:st=>{walletMove(st,-500,'Treat','money');}},
  {label:'Skip it',effect:st=>{st.player.vitals.stress=Math.min(100,st.player.vitals.stress+1);}}]};return S;};
let S=mk('ev_life_new_cafe',-30000);
assert.ok(atCreditLimit(S));
const before=JSON.stringify(S.money);
assert.ok(discretionaryLock(S,S.activeScene,S.activeScene.choices[0]),'costly option locked with a reason');
assert.equal(discretionaryLock(S,S.activeScene,S.activeScene.choices[1]),null,'free option stays open');
assert.equal(JSON.stringify(S.money),before,'probing the cost leaves the real state untouched');
let r=resolveActiveSceneChoice(S,0);assert.equal(r.ok,false);assert.equal(S.money.cash,-30000);assert.ok(S.activeScene);
r=resolveActiveSceneChoice(S,1);assert.ok(r.ok);
S=mk('ev_money_internet_bill',-30000);assert.equal(discretionaryLock(S,S.activeScene,S.activeScene.choices[0]),null,'bills stay open');
S=mk('ev_life_new_cafe',-1000);assert.equal(discretionaryLock(S,S.activeScene,S.activeScene.choices[0]),null,'open while under the limit');
S=mk('ev_life_new_cafe',-30000,false);assert.equal(discretionaryLock(S,S.activeScene,S.activeScene.choices[0]),null,'old save without the flag is unchanged');
/* an effect that edits a person captured by its closure must not touch the live person when probed */
S=mk('ev_friend_new_restaurant',-30000);const pid=Object.keys(S.people).find(k=>k!=='player');const person=S.people[pid];const aff=person.rel?.affection??null;
S.activeScene.choices[0]={label:'Dinner on you',effect:st=>{walletMove(st,-300,'Dinner','money');person.rel=person.rel||{};person.rel.affection=(person.rel.affection||0)+9;}};
assert.ok(discretionaryLock(S,S.activeScene,S.activeScene.choices[0]));
assert.equal(person.rel?.affection??null,aff,'live person unchanged after probing');assert.equal(S.people.player,S.player,'player identity kept');
const v=(await import('node:fs')).readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');
assert.ok(/discretionaryLock\(S, sc, ch\)/.test(v)&&/Credit limit reached/.test(v),'option builder disables the button and shows the reason');
const t=(await import('node:fs')).readFileSync(new URL('../src/ui/turnResult.js',import.meta.url),'utf8');
assert.ok(/credit_limit/.test(t)&&/went unpaid/.test(t),'month-end card has the went-without note');
console.log('ok v221 limit lock');
