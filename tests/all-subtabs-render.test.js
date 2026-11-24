import assert from 'node:assert/strict';
import {COUNTRY_IDS} from '../src/data/countries.js';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import * as v from '../src/ui/views.js';
const tabs=[['renderPeopleTabHtml','peopleSub',['circle','marriage','children']],['renderWorkTabHtml','workSub',['jobs','ventures','gigs']],['renderRealEstateTabHtml','reSub',['myhome','compounds','lands']],['renderFinanceTabHtml','finSub',['cashflow','banks','cards','markets']],['renderLifestyleTabHtml','lifeSub',['cars','appearance','shop','pets','travel','medical','legal']],['renderWorldTabHtml','worldSub',['passports','gulf','global']]];
let n=0;for(const country of COUNTRY_IDS)for(const age of [5,15,18,30,65]){const s=createNewLifeState({country,seed:77});ensureExtendedState(s);s.player.age=age;s.year=2026;for(const [fn,key,subs]of tabs)for(const sub of subs){const h=v[fn](s,{[key]:sub});assert.ok(h.length>40);assert.ok(!/\bNaN\b|undefined|\[object Object\]/.test(h),country+'/'+age+'/'+sub);n++;}}console.log(n+'country/stage/subtab renders pass. Render coverage only, not action coverage.');
