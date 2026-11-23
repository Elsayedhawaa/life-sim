/* Static simulation budgets, never institutional fee quotes. Statutory flat
   routes stay flat; other routes use visible programme-cost factors. */
import {eraLocalCost} from './economy.js';
const flatPublic=new Set(['sau','gbr','deu','nld','fra','bra','swe','tur']);
const factors={medicine:2.4,dentistry:2.2,pharmacy:1.45,engineering:1.2,architecture:1.2,cs:1.1,physiotherapy:1.4,veterinary:1.7,nursing:1.15,psychology:1,business:1,law:1,media:0.9,education:0.8,vocational:0.55};
export function annualUniversityBudget(S,uni,majorId=null){
 const factor=majorId && !(uni.sector==='public'&&flatPublic.has(uni.country||S.country)) ? (factors[majorId]??1):1;
 return eraLocalCost(Math.round((uni.annualTuition2026||0)*factor),uni.country||S.country,S.year);
}
export function universityBudgetRange(S,uni,programs){
 const values=programs.map(m=>annualUniversityBudget(S,uni,m.id));
 return values.length?{min:Math.min(...values),max:Math.max(...values)}:{min:annualUniversityBudget(S,uni),max:annualUniversityBudget(S,uni)};
}
