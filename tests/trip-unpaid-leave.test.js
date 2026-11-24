import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {ALL_VACATIONS} from '../src/data/megaCareerEduMedical.js';
import {computeMonthlyNetPay} from '../src/data/economy.js';
import {takeVacationOrPilgrimage,tripCostLocal} from '../src/systems/completeLifeSystems.js';
const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.player.age=30;s.year=2026;s.money.cash=1e8;s.career.employed=true;s.career.job={employer:'Test',title:'Test',track:'software',monthlyGross:3000,leave:{year:2026,annualDays:20,usedDays:19},monthsInRole:12};s.legal.passports[0].expiresYear=2036;
const dest=ALL_VACATIONS.find(d=>!d.pilgrimage&&d.country==='gbr');assert.ok(dest);const days=dest.days_typical||5,cost=tripCostLocal(s,dest),cash=s.money.cash;assert.ok(takeVacationOrPilgrimage(s,dest.id).ok);const loss=Math.round(computeMonthlyNetPay(3000,'gbr',2026,true).net/30*Math.max(0,days-1));assert.equal(cash-s.money.cash,cost+loss);const next=s.money.cash;assert.ok(takeVacationOrPilgrimage(s,dest.id).ok);assert.equal(next-s.money.cash,cost+Math.round(computeMonthlyNetPay(3000,'gbr',2026,true).net/30*days));console.log('Trips beyond paid leave debit only newly unpaid days, in addition to quoted travel cost.');
