/* Static simulation budgets, never institutional fee quotes. Statutory flat
   routes stay flat; other routes use visible programme-cost factors. */
import {eraLocalCost,convertCurrency} from './economy.js';
const flatPublic=new Set(['sau','gbr','deu','nld','fra','bra','swe','tur']);
const factors={medicine:2.4,dentistry:2.2,pharmacy:1.45,engineering:1.2,architecture:1.2,cs:1.1,physiotherapy:1.4,veterinary:1.7,nursing:1.15,psychology:1,business:1,law:1,media:0.9,education:0.8,vocational:0.55};
const internationalUsd={egy:7000,sau:12000,uae:22000,gbr:32000,usa:42000,deu:6000,can:26000,aus:30000,nld:17000,fra:12000,jpn:12000,ita:9000,sgp:28000,bra:9000,ind:6000,che:12000,swe:16000,tur:8000};
export function annualInternationalBudget(S,uni,majorId){
 const dest=uni.country||S.country;
 const factor={engineering:1.15,architecture:1.15,cs:1.1,media:.9,education:.85}[majorId]||1;
 const usd=Math.round(Math.max(internationalUsd[dest]||10000,convertCurrency(uni.annualTuition2026||0,dest,'usa',2026))*factor);
 return Math.round(convertCurrency(eraLocalCost(usd,'usa',S.year),'usa',dest,S.year));
}
export function annualUniversityBudget(S,uni,majorId=null){
 const dest=uni.country||S.country;
 if(Array.isArray(S.legal?.citizenships)&&!S.legal.citizenships.includes(dest))return annualInternationalBudget(S,uni,majorId);
 const factor=majorId && !(uni.sector==='public'&&flatPublic.has(uni.country||S.country)) ? (factors[majorId]??1):1;
 return eraLocalCost(Math.round((uni.annualTuition2026||0)*factor),uni.country||S.country,S.year);
}
export function universityBudgetRange(S,uni,programs){
 const values=programs.map(m=>annualUniversityBudget(S,uni,m.id));
 return values.length?{min:Math.min(...values),max:Math.max(...values)}:{min:annualUniversityBudget(S,uni),max:annualUniversityBudget(S,uni)};
}
