import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {createBusiness,migrateBusinesses,computeBusinessMonth} from '../src/systems/businessEngine.js';
import {convertBusinessFiguresCurrency} from '../src/systems/businessLegacy.js';
import {openBranchOfType,branchTypeSetupCost} from '../src/systems/businessBranches.js';
import {listCommercialPremises} from '../src/systems/businessPremises.js';
import {convertCurrency} from '../src/data/economy.js';
import {roleWageLocal} from '../src/systems/businessStaff.js';
for(const destination of ['usa','gbr','egy']){
 const s=createNewLifeState({country:'egy',seed:24});ensureExtendedState(s);s.year=2026;s.player.age=30;s.money.cash=1e7;assert(createBusiness(s,'cafe','Remote Cafe',{mode:'full_time'}).ok);const parent=s.career.businesses[0];s.country=destination;s.city=destination==='egy'?'Cairo':'Abroad';convertBusinessFiguresCurrency(s,parent,destination);s.money.cash=1e7;
 const quote=branchTypeSetupCost(s,parent,'Alexandria','shop');const rent=listCommercialPremises(s,'Alexandria','egy',destination).find(u=>u.unitId==='comm_shop');const before=s.money.cash;const r=openBranchOfType(s,parent,'Alexandria','shop');assert(r.ok);const b=r.branch;assert.equal(b.figuresCurrency,destination);assert.equal(b.premises.monthlyRentLocal,rent.monthlyRentLocal);assert.equal(b.monthlyRev,Math.round(parent.monthlyRev*.45));assert.equal(before-s.money.cash,quote.setupCost+rent.monthlyRentLocal);
 for(const e of b.staff)assert.equal(e.wageLocal,Math.round(convertCurrency(roleWageLocal(s,e.role,'egy'),'egy',destination,s.year)));
 const reload=JSON.parse(JSON.stringify(s));migrateBusinesses(reload);const rb=reload.career.businesses.find(x=>x.id===b.id);assert.equal(rb.figuresCurrency,destination);assert.equal(rb.premises.monthlyRentLocal,rent.monthlyRentLocal);const pl=computeBusinessMonth(reload,rb);assert.equal(pl.rent,rent.monthlyRentLocal);assert(Number.isFinite(pl.net));
}
console.log('Remote branches inherit parent books, exact rent/setup wallet charge, native starter wage conversion, monthly rent and reload pass');
