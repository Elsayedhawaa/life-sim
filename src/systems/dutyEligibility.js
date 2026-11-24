/* FAA requires current medical privileges for commercial flying. Employer
   ground-duty pay is a game policy, not a legal entitlement or universal rule.
   https://www.faa.gov/faq/who-must-hold-medical-certificate-1 */
export function flyingDutyStatus(S){
 const j=S.career?.job;if(!j||!(j.track==='aviation'||/pilot/i.test(j.title||'')))return{grounded:false,payFraction:1};
 const l=j.actionState?.licence||{};
 const grounded=(l.medicalDueYear!=null&&l.medicalDueYear<S.year)||(l.simDueYear!=null&&l.simDueYear<S.year);
 return{grounded,payFraction:grounded?.5:1};
}
