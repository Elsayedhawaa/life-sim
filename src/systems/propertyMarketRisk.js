import{hashSeed}from'../core/rng.js';
/* Fictional seeded market scenarios, not national forecasts. A shared
   country-year shock prevents rerolling by buying another property. */
export function propertyMarketYear(S,country){
 const roll=(hashSeed(`${S.seed}|housing|${country}|${S.year}`)%10000)/10000;
 const realChange=roll<.12?-.14:roll<.30?-.05:roll<.80?.015:.07;
 return{realChange,label:realChange<-.1?'housing downturn':realChange<0?'soft housing market':realChange>.05?'strong housing market':'steady housing market'};
}
