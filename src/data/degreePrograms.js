/* Country-specific simulation pathways, not university prospectuses.
   Year values are full-time game study years, excluding residency/licensing.
   Ordinary bachelor profiles follow national guidance; specialist routes are
   simplified explicitly and are not a promise a named university teaches it. */
import {MAJORS} from './institutions.js';
const defaultYears={egy:4,sau:4,uae:4,gbr:3,usa:4,deu:3,can:4,aus:3,nld:3,fra:3,jpn:4,ita:3,sgp:4,bra:4,ind:3,che:3,swe:3,tur:4};
const specialist={
 egy:{medicine:5,dentistry:5,pharmacy:5,engineering:5,architecture:5,physiotherapy:5,veterinary:5},
 sau:{medicine:6,dentistry:6,pharmacy:6,engineering:4,architecture:5},
 uae:{medicine:6,dentistry:5,pharmacy:4,engineering:4,architecture:5},
 gbr:{medicine:5,dentistry:5,pharmacy:4,engineering:3,architecture:3,nursing:3},
 usa:{medicine:4,dentistry:4,pharmacy:4,physiotherapy:3,veterinary:4,law:3,architecture:5},
 deu:{medicine:6,dentistry:5,pharmacy:4,law:5},
 can:{medicine:4,dentistry:4,pharmacy:4,physiotherapy:2,veterinary:4,law:3},
 aus:{medicine:6,dentistry:5,pharmacy:4,engineering:4,architecture:3,nursing:3,law:4,physiotherapy:4,veterinary:5},
 nld:{medicine:6,dentistry:6,pharmacy:6,architecture:3,law:3},
 fra:{medicine:6,dentistry:6,pharmacy:6,engineering:5,architecture:5,law:3},
 jpn:{medicine:6,dentistry:6,pharmacy:6,veterinary:6},
 ita:{medicine:6,dentistry:6,pharmacy:5,veterinary:5,architecture:5,law:5,education:5},
 sgp:{medicine:5,dentistry:4,pharmacy:4,law:4,nursing:3},
 bra:{medicine:6,dentistry:5,pharmacy:5,engineering:5,architecture:5,law:5},
 ind:{medicine:6,dentistry:5,pharmacy:4,engineering:4,architecture:5,nursing:4,law:5},
 che:{medicine:6,dentistry:5,pharmacy:5,law:3},
 swe:{medicine:6,dentistry:5,pharmacy:5,engineering:3,architecture:5,law:5},
 tur:{medicine:6,dentistry:5,pharmacy:5,veterinary:5}
};
const names={medicine:'Medicine',dentistry:'Dentistry',pharmacy:'Pharmacy',engineering:'Engineering',architecture:'Architecture',cs:'Computer Science',physiotherapy:'Physiotherapy',veterinary:'Veterinary Medicine',nursing:'Nursing',psychology:'Psychology',business:'Business and Finance',law:'Law',media:'Media and Communication',education:'Education',vocational:'Technical Diploma'};
export function degreeProgramFor(country,majorId,uni=null,year=2026){
 const m=MAJORS.find(x=>x.id===majorId);if(!m)return null;
 let years=majorId==='vocational'?2:(specialist[country]?.[majorId]??defaultYears[country]??m.years);
 if(country==='gbr'&&/St Andrews|Edinburgh|Glasgow/.test(uni?.name||'')&&!['medicine','dentistry','pharmacy','law'].includes(majorId))years=4;
 if(country==='gbr' && majorId==='medicine' && uni?.id==='gbr_ucl')years=6;
 if(country==='egy' && majorId==='medicine')years=year<2018?6:5;
 const graduateEntry=['usa','can'].includes(country)&&['medicine','dentistry','pharmacy','physiotherapy','veterinary','law'].includes(majorId);
 const clinical=['medicine','dentistry','pharmacy','physiotherapy','veterinary','nursing'].includes(majorId);
 return {...m,label:names[majorId]||m.label,years,graduateEntry,level:graduateEntry?'Graduate-entry professional':majorId==='vocational'?'Diploma':clinical||years>=5?'Professional study':'Bachelor',modelled:true,note:graduateEntry?'Requires an earlier degree in this simulation. Professional licensing and residency are separate.':clinical?'Academic study only; internship, supervised practice and licensing can add years.':'Modelled full-time game pathway, not a named course guarantee; actual award and duration vary by institution and programme.'};
}
export function programsForCountry(country,uni=null,year=2026){return MAJORS.map(m=>degreeProgramFor(country,m.id,uni,year));}
