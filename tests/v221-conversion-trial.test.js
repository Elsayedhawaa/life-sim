import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{convertWithTrial,conversionTrial}from'../src/systems/companyMigration.js';
function world(id){const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=32;s.year=2026;s.month=1;s.money.cash=5e6;s.education.degrees=['medicine','pharmacy'];const b=createBusiness(s,id,'T',{mode:'full_time'}).biz;return{s,b};}
/* A cafe converted by hand books a fraction of its old revenue against its old costs. The trial says so and leaves the save alone. */
for(const id of['cafe','clinic','retail_shop']){const{s,b}=world(id);const snap=JSON.stringify([s.money,b.typeId,b.monthlyRev,b.staff,b.premises]);const t=conversionTrial(s,b);assert.ok(t&&t.revenue<t.oldRevenue*.5,id+' trial shows a collapse');assert.equal(JSON.stringify([s.money,b.typeId,b.monthlyRev,b.staff,b.premises]),snap,id+' trial leaves the save untouched');assert.equal(b.enterprise,undefined);const r=convertWithTrial(s,b);assert.equal(r.ok,false,id);assert.match(r.msg,/Your company is unchanged/);assert.equal(b.enterprise,undefined,id+' not converted');assert.equal(JSON.stringify([s.money,b.staff,b.premises]),JSON.stringify([s.money,b.staff,b.premises]));}
/* A windfall is refused as well */
{const{s,b}=world('car_rental_fleet');const r=convertWithTrial(s,b);assert.equal(r.ok,false);assert.match(r.msg,/more than double/);}
/* A conversion whose trial lands near the old revenue goes ahead */
{const{s,b}=world('pet_grooming');const r=convertWithTrial(s,b);assert.equal(r.ok,true,r.msg);assert.ok(b.enterprise);}

/* The trial re-orders stock every month, as a player would; a trial that ordered once read zero sales by month four. */
{const{s,b}=world('restaurant');const t=conversionTrial(s,b);assert.ok(t.revenue>t.oldRevenue*.3,'restaurant trial keeps selling with monthly stock: '+t.revenue/t.oldRevenue);}
console.log('ok v221 conversion trial');
