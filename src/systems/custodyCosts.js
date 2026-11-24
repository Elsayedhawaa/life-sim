/* Food varies with recorded nights. Housing/utilities do not shrink
   linearly, and court support remains a separate obligation. */
export function childFoodEquivalent(S){return(S.relations.childIds||[]).reduce((n,id)=>{const ch=S.people[id];if(!ch?.alive||ch.age>=19||ch.residenceCountry!==S.country)return n;if(ch.custody)return n+Math.max(0,Math.min(14,ch.custody.playerNightsPer14||0))/14;return n+(!ch.householdWith||ch.householdWith==='player'?1:0);},0);}
