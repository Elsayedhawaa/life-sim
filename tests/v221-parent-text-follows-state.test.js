// Family and friend scenes only mention a parent, or colleagues, when the character has them; the sixty-year estate choice names the real heirs.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState,createPerson}=await import('../src/core/schema.js');
const {EVENTS_EVERYDAY_FAMILY:EV}=await import('../src/data/eventsEverydayFamily.js');
const {collectExtendedLifeScenes}=await import('../src/systems/storyLibrary.js');
const mk=(motherAlive,employed)=>{const S=createNewLifeState({country:'gbr',seed:3,familyTier:'middle'});ensureExtendedState(S);S.year=2040;S.player.age=47;
  if(!motherAlive){const m=S.people[S.relations.motherId];if(m)m.alive=false;S.relations.motherId=null;}
  S.career.employed=employed;S.career.job=employed?{employer:'Test Co',title:'Clerk'}:null;return S;};
const text=(id,S)=>{const e=EV.find(x=>x.id===id);const sc=e.build(S,{});return sc.text;};
const ids=['ev_family_dad_car_breaks','ev_family_will_discussion','ev_family_sib_baby_born','ev_family_dad_health_followup_l2','ev_family_dads_old_friend'];
for(const id of ids){const S=mk(false,true);const t=text(id,S);assert.doesNotMatch(t,/your mother|Your mother/,id+' must not mention a dead mother');}
{const S=mk(true,true);assert.match(text('ev_family_dad_car_breaks',S),/your mother mentions it/);assert.match(text('ev_family_will_discussion',S),/he and your mother are gone/);}
assert.doesNotMatch(text('ev_friend_embarrassing_photo',mk(true,false)),/colleagues/);
assert.match(text('ev_friend_embarrassing_photo',mk(true,true)),/Your colleagues have seen it/);
// sixty-year estate choice
const heirsLabel=(S)=>{let sc=null;collectExtendedLifeScenes(S,(k,fn)=>{if(k==='st_sixty_estate_reflection')sc=fn();});return sc?.choices.map(c=>c.label).find(l=>/^Consolidate/.test(l));};
{const S=mk(true,true);S.player.age=64;S.relations.spouseIds=[];S.relations.childIds=[];const l=heirsLabel(S);assert.match(l,/for your heirs$/);}
console.log('PASS v221-parent-text-follows-state');
