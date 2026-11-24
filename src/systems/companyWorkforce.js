/* Model staffing, not local professional-licensing advice. Same staff records as payroll. */
export const STAFF_TIERS={junior:{label:'Junior',work:.65,wage:.75,skill:35},experienced:{label:'Experienced',work:1,wage:1,skill:60},senior:{label:'Senior',work:1.35,wage:1.4,skill:85}};
export const SECTOR_STAFF={
food:{primary:'barista',support:'cashier',supervisor:'chef',protected:[]},
retail:{primary:'sales',support:'cashier',supervisor:'bookkeeper',protected:[]},
pharmacy:{primary:'pharmacist',support:'technician',supervisor:'pharmacist',protected:['pharmacist']},
construction:{primary:'worker',support:'technician',supervisor:'architect',protected:[]},
manufacturing:{primary:'worker',support:'packager',supervisor:'technician',protected:[]},
farming:{primary:'worker',support:'driver',supervisor:'technician',protected:[]},
logistics:{primary:'driver',support:'dispatcher',supervisor:'technician',protected:['driver']},
clinic:{primary:'doctor',support:'receptionist',supervisor:'nurse',protected:['doctor','nurse']},
education:{primary:'teacher',support:'assistant',supervisor:'teacher',protected:['teacher']},
software:{primary:'developer',support:'support',supervisor:'cto',protected:[]}
};
export function effectiveStaffTier(e){if(STAFF_TIERS[e.tier])return e.tier;return(e.skill||0)>=75?'senior':(e.skill||0)<45?'junior':'experienced';}
/* Every active line gets a weighted fraction of the planned total workload. Role
   shares sum to that total. The support requirement is additional real labour. */
export function workforcePlan(b,rows,plannedCapacity,{managed=true}={}){const sector=b.enterprise?.sector||(b.tech?'software':null),profile=SECTOR_STAFF[sector];if(!profile)return{rows:[],factor:1,bottleneck:null};const staff=b.staff||[],active=rows.filter(r=>r.active||r.wip),totalWeight=active.reduce((a,r)=>a+(r.weight||1),0),target=Math.max(0,plannedCapacity),requirements=new Map();for(const r of active){const role=r.role||profile.primary;requirements.set(role,(requirements.get(role)||0)+target*(r.weight||1)/Math.max(1,totalWeight));}if(active.length){requirements.set(profile.support,(requirements.get(profile.support)||0)+target*.18);if(sector==='software'||target>1000)requirements.set(profile.supervisor,(requirements.get(profile.supervisor)||0)+target*.12);}const perPerson=Math.max(1,(({food:700,retail:260,pharmacy:400,construction:2,manufacturing:300,farming:600,logistics:300,clinic:100,education:35,software:1000}[sector])||target||1)/2),ownerWork=managed&&!b.manager?(b.mode==='full_time'?perPerson*.5:perPerson*.2):0;let remainingOwner=ownerWork;const plans=[];
 for(const[role,work]of requirements){const members=staff.filter(e=>e.role===role),effective=members.reduce((sum,e)=>sum+STAFF_TIERS[effectiveStaffTier(e)].work,0),protectedRole=profile.protected.includes(role),owner=protectedRole?0:Math.min(remainingOwner,work);remainingOwner-=owner;const required=Math.max(0,(work-owner)/perPerson),available=effective,ratio=required?Math.min(1,available/required):1,missing=Math.max(0,Math.ceil(required-available));plans.push({role,requiredWork:work,required:Math.ceil(required),current:members.length,effective:Math.round(effective*100)/100,missing,junior:members.filter(e=>effectiveStaffTier(e)==='junior').length,experienced:members.filter(e=>effectiveStaffTier(e)==='experienced').length,senior:members.filter(e=>effectiveStaffTier(e)==='senior').length,ownerWork:owner,ratio});}
 const bottleneck=plans.reduce((a,r)=>!a||r.ratio<a.ratio?r:a,null);return{rows:plans,factor:bottleneck?.ratio??1,bottleneck:bottleneck?.ratio<1?bottleneck.role:null,perPerson};}
