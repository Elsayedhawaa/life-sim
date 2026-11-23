// Fictional deed allocations. Areas are m², never measured real listings.
export function propertyAreas(p={}){
 const indoor=Number(p.indoorM2||p.areaM2||p.area)||0;const shape=p.shape||'apartment';const text=(p.name||'').toLowerCase();const apartment=['studio','apartment','penthouse','duplex'].includes(shape);const two=/villa|double|duplex|colonial|cottage|family|court_two/.test(shape);const levels=/terrace_three|victorian|nld_attic/.test(shape)?3:shape==='brownstone'||shape==='nld_gable'?4:two?2:1;
 const garden=Number(p.gardenM2??((p.hasGarden||/garden/.test(text))?Math.round(indoor*(apartment?.4:['sgp','nld'].includes(p.country)?.55:.85)):0));
 const pool=Number(p.poolM2??(p.hasPool?Math.max(18,Math.min(40,Math.round(indoor*.1))):0));
 const terrace=Number(p.terraceM2??(shape==='penthouse'?Math.round(indoor*.28):/balcony|veranda/.test(text)?8:0));
 const courtyard=Number(p.courtyardM2??(/court/.test(shape)?Math.round(indoor*.22):0));const parking=Number(p.parkingM2||0);
 const footprint=Number(p.footprintM2)||Math.round(indoor/levels);const groundOutdoor=garden+pool+courtyard+parking+(shape==='penthouse'?0:terrace);
 return {indoorM2:indoor,footprintM2:footprint,gardenM2:garden,poolM2:pool,terraceM2:terrace,courtyardM2:courtyard,parkingM2:parking,outdoorM2:garden+pool+terrace+courtyard+parking,plotM2:apartment?(garden?footprint+groundOutdoor:null):footprint+groundOutdoor};
}
export function pricedPropertyArea(p){const a=propertyAreas(p);return a.indoorM2+a.gardenM2*.3+a.poolM2*.75+a.terraceM2*.35+a.courtyardM2*.25+a.parkingM2*.3;}
export function outdoorAnnualBudget(p,ppm){const a=propertyAreas(p);return Math.round(ppm*(a.gardenM2*.001+a.poolM2*.008+a.terraceM2*.0006+a.courtyardM2*.0006+a.parkingM2*.0004));}
export function outdoorAreaSummary(p){const a=propertyAreas(p);return [['Garden',a.gardenM2],['Pool water',a.poolM2],['Terrace',a.terraceM2],['Courtyard',a.courtyardM2],['Parking',a.parkingM2]].filter(x=>x[1]>0).map(x=>`${x[0]} ${x[1]} m²`).join(' · ');}
