import {hasCurrentLanguage} from '../data/languageQualifications.js';
import {annualUniversityBudget,annualInternationalBudget} from '../data/universityCosts.js';
/* Static full-time overseas game routes, not admission or immigration advice. */
import {getUniversitiesFor,MAJORS} from '../data/institutions.js';
import {degreeProgramFor} from '../data/degreePrograms.js';
import {eraLocalCost,convertCurrency} from '../data/economy.js';
import {STUDY_ABROAD_PIPELINES} from '../data/visasAndMarriage.js';
import {uniSupportsMajor,tansikCutoffFor} from './careerEducationEngine.js';
import {familyEducationFunds} from './educationFunding.js';
export const ABROAD_LEVELS=[{id:'bachelor',label:'Bachelor'},{id:'masters',label:"Master's"},{id:'phd',label:'PhD'}];
export const ABROAD_SUBJECTS=['cs','engineering','business','psychology','law','media','architecture','education'];
// USD-equivalent illustrative international tuition budgets, not fee quotes.
const annualUsd={egy:7000,sau:12000,uae:22000,gbr:32000,usa:42000,deu:6000,can:26000,aus:30000,nld:17000,fra:12000,jpn:12000,ita:9000,sgp:28000,bra:9000,ind:6000,che:12000,swe:16000,tur:8000};
const livingUsd={egy:5000,sau:9000,uae:15000,gbr:17000,usa:19000,deu:13000,can:16000,aus:18000,nld:15000,fra:13000,jpn:12000,ita:11000,sgp:18000,bra:7000,ind:5000,che:24000,swe:14000,tur:7000};
export function abroadUniversities(S,dest){return getUniversitiesFor(dest,S.year);}
export function abroadLanguageReady(S){return ['gbr','usa','can','aus'].includes(S.homeCountry)||hasCurrentLanguage(S,/English.*(Fluent|IELTS|TOEFL|C1|C2|B2)/i);}
export function studyAwardKey(S,dest,level){return `${S.year}:${dest}:${level}`;}
export function studyAbroadQuote(S,dest,opts={}){
 const level=opts.level||'bachelor',majorId=opts.majorId||'cs',funding=opts.funding||'self';
 const unis=abroadUniversities(S,dest),uni=unis.find(u=>u.id===opts.uniId)||(!opts.uniId?unis[0]:null);
 const major=MAJORS.find(m=>m.id===majorId),pipe=STUDY_ABROAD_PIPELINES[dest];
 let reason='';
 if(!annualUsd[dest]||!uni)reason='Choose an available destination university.';
 else if(!ABROAD_LEVELS.some(x=>x.id===level)||!ABROAD_SUBJECTS.includes(majorId)||!uniSupportsMajor(uni.name,majorId))reason='Choose a supported game subject at this university.';
 else if(!['self','parents','scholarship'].includes(funding))reason='Choose a funding route.';
 else if(S.player.age<18||!['graduated_high','completed'].includes(S.education.stage))reason='Finish secondary school before studying abroad.';
 else if(S.education.university||S.postgrad?.active)reason='Finish or withdraw from your current course first.';
 else if(S.pendingRelocation)reason='Finish your pending move first.';
 else if(dest===S.country)reason='Choose a different country.';
 else if(level!=='bachelor'&&!S.education.degrees.length)reason="Complete a bachelor's degree first.";
 else if(level==='phd'&&!S.postgrad?.completed?.some(p=>p.tier==='masters_mba'))reason="Complete a master's degree before PhD study.";
 else if(level!=='bachelor'&&S.postgrad?.completed?.some(p=>p.tier===(level==='phd'?'fellowship_phd':'masters_mba')))reason='You already hold this postgraduate game credential.';
 else if(level==='bachelor'&&S.education.degrees.includes(majorId))reason='You already hold this undergraduate credential.';
 else if(!abroadLanguageReady(S))reason='These modelled routes use English. Obtain a recorded English qualification or fluent English first.';
 else if(level==='bachelor'&&(S.education.highSchoolScore??0)<tansikCutoffFor(dest,uni,majorId,S.year).cutoff)reason='Your secondary score is below this game admission index.';
 const years=level==='bachelor'?(degreeProgramFor(dest,majorId,uni,S.year)?.years||3):level==='masters'?2:3;
 const citizen=!!S.legal?.citizenships?.includes(dest);
 const annualDest=citizen&&uni?annualUniversityBudget({...S,country:dest},uni,majorId):uni?annualInternationalBudget(S,uni,majorId):0;
 const livingDest=Math.round(convertCurrency(eraLocalCost(livingUsd[dest]||12000,'usa',S.year),'usa',dest,S.year));
 const award=S.education.studyAwards?.[studyAwardKey(S,dest,level)];
 const scholarshipPct=funding==='scholarship'&&award?.awarded?1:0;
 if(!reason&&funding==='scholarship'&&!scholarshipPct)reason='Win the overseas game tuition award for this country and level first.';
 const tuitionDest=Math.round(annualDest*(1-scholarshipPct)*(level==='bachelor'?1:years));
 // Maintenance is escrow only where this game models a blocked account.
 const blockedDest=!citizen&&pipe?.blockedAccountKind?livingDest:0;
 const costsDest=Math.round(convertCurrency(eraLocalCost(citizen?850:1500,'usa',S.year),'usa',dest,S.year));
 const totalDest=tuitionDest+blockedDest+costsDest;
 const totalPlayer=Math.round(convertCurrency(totalDest,dest,S.country,S.year));
 const proofPlayer=Math.round(convertCurrency(tuitionDest+livingDest+costsDest,dest,S.country,S.year));
 const available=funding==='parents'?familyEducationFunds(S):Math.max(0,S.money.cash)+Math.max(0,S.money.savings);
 if(!reason&&available<Math.max(totalPlayer,proofPlayer))reason=funding==='parents'?'Living parents do not have enough savings for sponsorship and the first-year living buffer.':'Cash and savings do not cover the upfront cost plus first-year living buffer.';
 return {ok:!reason,reason,dest,uni,majorId,majorLabel:major?.label||majorId,level,funding,years,annualDest,livingDest,blockedDest,costsDest,tuitionDest,totalDest,totalPlayer,proofPlayer,available,scholarshipPct,citizen,feeStatus:citizen?'Citizen domestic game fee':'International game fee',visaRequired:!citizen,visaName:pipe?.visaName||'Modelled student residence permit'};
}
