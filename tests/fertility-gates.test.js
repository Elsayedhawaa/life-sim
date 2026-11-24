import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {undergoSurgeryOrFertility,fertilityCostLocal} from '../src/systems/completeLifeSystems.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.player.age=30;s.player.gender='m';s.money.cash=1e8;s.people.sp={id:'sp',firstName:'Partner',age:30,gender:'f',alive:true,residenceCountry:'gbr'};s.relations.spouseIds=['sp'];return s;}
for(const change of [s=>s.people.sp.alive=false,s=>s.people.sp.residenceCountry='egy',s=>s.marriage.pregnancy={motherId:'sp'},s=>s.player.age=15,s=>s.people.sp.age=50,s=>s.people.sp.gender='m']){const s=setup();change(s);const cash=s.money.cash;assert.equal(undergoSurgeryOrFertility(s,'ivf','ivf').ok,false);assert.equal(s.money.cash,cash);}
const s=setup();let cash=s.money.cash;assert.equal(undergoSurgeryOrFertility(s,'bogus','ivf').ok,false);assert.equal(s.money.cash,cash);assert.equal(undergoSurgeryOrFertility(s,'ivf','unknown').ok,false);assert.equal(s.money.cash,cash);assert.ok(undergoSurgeryOrFertility(s,'ivf','ivf').ok);assert.ok(s.money.cash<cash);cash=s.money.cash;assert.equal(undergoSurgeryOrFertility(s,'ivf','ivf').ok,false);assert.equal(s.money.cash,cash);console.log('Fertility eligibility, unknown-input and monthly repeat guards leave cash untouched when refused.');

const {V1_FERTILITY_TREATMENTS}=await import('../src/data/megaCareerEduMedical.js');
for(const ft of V1_FERTILITY_TREATMENTS){const x=setup(),before=x.money.cash;assert.ok(undergoSurgeryOrFertility(x,'ivf',ft.id).ok);assert.equal(before-x.money.cash,fertilityCostLocal(x,ft));if(ft.successPct===0)assert.equal(x.marriage.pregnancy,null);}
console.log('All5fertility choices debit their own quoted cost; consultation cannot conceive.');
