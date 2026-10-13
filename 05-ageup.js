/* =====================================================================
   5. YEARLY AGE UP TICK
   ===================================================================== */
function ageUp(){
  if (S.pending) return typeof hint === 'function' ? hint('Make your choice first.') : alert('Make your choice first.');
  if (S.age < 18 && !S.school){ if (typeof go === 'function') go('school'); return typeof hint === 'function' ? hint('Pick a school first.') : alert('Pick a school first.'); }
  if (S.age >= 18 && !S.housing){ if (typeof go === 'function') go('assets'); return typeof hint === 'function' ? hint('Choose housing in Real Estate first.') : alert('Choose housing in Real Estate first.'); }
  if (typeof hint === 'function') hint();

  S.age++; S.actions=2; S.worked=false; S.promoTried=false; S.income=0; S.expenses=0;
  const notes = [], bill = {};
  const wasStudying = S.age<=18 || !!S.uni;
  if (S.age>=18){   // rents follow wages (set by the Era Pack each year)
    const rise = S.rentWorld ? (S.rentRise||0) : .02+Math.random()*.05;
    if (!S.rentWorld) S.rentIndex*=1+rise;
    if (S.housing && typeof homeInfo === 'function' && homeInfo() && !homeInfo().own) notes.push(`rent ${rise>=0?'rose':'fell'} ${Math.abs(Math.round(rise*100))}%`);
  }
  if (typeof PROMOS !== 'undefined' && Array.isArray(PROMOS)) {
    S.promo = Math.random()<.6 ? pick(PROMOS) : null;   // this year's store sale
  }

  // School year (ages 7-18). Parents pay the fees, so nothing is charged to you.
  if (S.age <= 18){
    const sc = (typeof SCHOOLS !== 'undefined' && SCHOOLS[S.school]) || (typeof SCHOOLS !== 'undefined' ? SCHOOLS.national : {mult:1, social:0});
    const ef = (typeof EFFORT !== 'undefined' && EFFORT[S.effort]) || {smarts:0, happiness:0, social:0};
    if (typeof fx === 'function') fx({smarts:Math.round(ef.smarts>0?ef.smarts*sc.mult:ef.smarts), happiness:ef.happiness, social:ef.social+sc.social});
    if (S.effort==='skip') S.skips = (S.skips || 0) + 1;
  }
  if (S.age===18){
    S.diploma = (S.skips||0)<5;
    if (typeof log === 'function') log(S.diploma?'Graduated high school! University is optional: you can also start working.':'Left school without a diploma.');
  }

  if (S.uni && typeof uniYear === 'function') uniYear(notes, bill);

  // Part-time work
  if (S.part){
    if (!wasStudying){ S.part=null; if (typeof log === 'function') log('Your part-time job ended with your studies.'); }
    else { const st=S.part.stress+(S.effort==='hard'?2:0); S.income+=S.part.pay; if (typeof fx === 'function') fx({happiness:-st, health:-1, smarts:-1}); }
  }

  // Career: salary, schedule stress, performance, forced retirement
  if (S.job && typeof TRACKS !== 'undefined' && TRACKS[S.job.trackId]){
    const lvlData = TRACKS[S.job.trackId].levels[S.job.level];
    let extraPerf = 0, extraStress = 0;
    if (S.schedule === 'over'){ extraPerf = 8; extraStress = 4; }
    else if (S.schedule === 'crunch'){ extraPerf = 18; extraStress = 9; }

    if (typeof clamp === 'function') S.job.perf = clamp(S.job.perf + extraPerf - 2);
    if (typeof fx === 'function') fx({happiness: -(lvlData.stress + extraStress), health: extraStress > 5 ? -2 : 0});
    S.income += S.job.salary; S.lastSalary = S.job.salary;
    S.job.years++;

    if (S.job.perf < 10){
      if (typeof log === 'function') log(`Fired from ${S.job.title} due to poor performance!`);
      S.job = null;
    } else if (typeof RETIRE_FORCED !== 'undefined' && S.age >= RETIRE_FORCED && typeof retireNow === 'function'){ retireNow(true); }
  }
  if (S.retired) S.income += (S.pension || 0);

  // Owned properties: condition decay, mortgage, tenants
  if (Array.isArray(S.ownedHomes)) {
    S.ownedHomes.forEach(h => {
      const cat = typeof HOUSING_CATALOG !== 'undefined' ? HOUSING_CATALOG.find(c=>c.id===h.catId) : null;
      if (typeof clamp === 'function') h.cond = clamp(h.cond - 3);
      h.value = Math.round(h.value * 1.03);
      if (h.balance > 0){
        h.balance = Math.round(h.balance * (1+(h.rate||.05)));
        const pmt = Math.min(h.balance, h.pay || (cat ? cat.pay : Math.round(h.value*.04)));
        h.balance -= pmt;
        bill.mortgage = (bill.mortgage||0) + pmt;
      }
      if (h.status === 'rent'){
        const rentCollected = Math.round(h.rentInc * (S.rentIndex||1) * (h.cond / 100));
        S.income += rentCollected;
        notes.push(`tenants paid ${typeof money === 'function' ? money(rentCollected) : rentCollected}`);
      }
    });
  }

  // Items you own: aging, breakdowns, yearly benefits, insurance
  if (typeof itemsYear === 'function') itemsYear(bill);

  // Shop installments and bank loans: interest, then the yearly payment
  if (Array.isArray(S.shopLoans)) {
    S.shopLoans.forEach(l => { const p=Math.min(l.bal,l.pmt); l.bal-=p; bill.installments=(bill.installments||0)+p; });
    S.shopLoans = S.shopLoans.filter(l => l.bal > 0);
  }
  if (Array.isArray(S.loans)) {
    S.loans.forEach(l => { l.bal=Math.round(l.bal*(1+l.rate)); const p=Math.min(l.bal,l.pmt); l.bal-=p; bill.bankLoans=(bill.bankLoans||0)+p; });
    S.loans = S.loans.filter(l => l.bal > 0);
  }

  // Living costs (adults)
  if (S.age>=18){
    const hi = typeof homeInfo === 'function' ? homeInfo() : null;
    const fd = (typeof FOOD !== 'undefined' && FOOD[S.food]) || {cost:0, hp:0, hap:0};
    const tr = (typeof TRANSPORT !== 'undefined' && TRANSPORT[S.transport]) || {cost:0, hap:0};
    
    bill.groceries = Math.round(fd.cost*(S.housing==='parents'?.4:1));
    if (typeof PHONE !== 'undefined') bill.phone = PHONE;
    bill.transport = tr.cost;
    if (S.insured && typeof INSURANCE !== 'undefined') bill.insurance = Math.round(INSURANCE*(S.pr||1));
    if (typeof fx === 'function') fx({health:fd.hp, happiness:fd.hap+tr.hap});

    if (S.housing==='parents'){ if (S.famWealth<1) bill.familyContribution = Math.round(1500*(S.pr||1)); }
    else if (hi){
      if (typeof fx === 'function') fx({happiness:hi.cat.hap, health:hi.cat.hp});
      bill.utilities = hi.cat.util;
      if (hi.own){ 
        if (typeof PROP_TAX !== 'undefined') bill.propertyTax = Math.round(hi.own.value*PROP_TAX); 
        if (hi.own.cond<40 && typeof fx === 'function') fx({happiness:-2}); 
      }
      else if (typeof rentCost === 'function') bill.rent = rentCost(hi.cat);
    }

    if (typeof PAYROLL !== 'undefined') bill.payrollTax = Math.round(S.income * PAYROLL);
    if (typeof incomeTax === 'function') bill.incomeTax = incomeTax(Math.max(0, S.income));

    if (S.loan>0){   // student loan: 5% interest, repay up to 10% of income
      S.loan = Math.round(S.loan * 1.05);
      const r = Math.min(S.loan, Math.round(S.income * .10));
      S.loan -= r;
      bill.studentLoan = r;
    }
  }

  if (typeof familyYear === 'function') bill.children = familyYear();
  if (typeof comfort === 'function') {
    const cf = comfort(S.housing); 
    if (cf && (cf.hap||cf.hp||cf.sm) && typeof fx === 'function') fx({happiness:cf.hap, health:cf.hp, smarts:cf.sm});
  }

  S.expenses = Object.values(bill).reduce((a,b)=>a+b,0);
  S.bill = bill;
  S.wealth += S.income - S.expenses;
  if (S.age<18) S.wealth = Math.max(0, S.wealth);   // parents absorb any shortfall

  if (S.age>=18 && typeof money === 'function') notes.push(`earned ${money(S.income)}, spent ${money(S.expenses)}`);
  if (S.wealth<0 && S.age>=18){ if (typeof fx === 'function') fx({happiness:-3}); notes.push('debt is weighing on you'); }
  if (S.age>50 && typeof fx === 'function') fx({health:-Math.ceil((S.age-50)/8)});
  if (notes.length && typeof log === 'function') log(notes.join('; ')+'.');

  // Trigger family events
  checkFamilyEvents();

  // Random lifecycle events
  if (typeof EVENTS !== 'undefined' && Array.isArray(EVENTS)) {
    const pool = EVENTS.filter(e=>S.age>=e.min && S.age<=e.max && e.id!==S.lastEvent && (!e.ok || e.ok()));
    if (pool.length && Math.random()<.8){
      const e = pool[Math.floor(Math.random()*pool.length)];
      S.lastEvent=e.id; S.ev=e; S.evId=e.id; S.pending=true; activeTab='life';
    } else S.ev={title:'A quiet year',text:'Nothing major happened. Life went on.',choices:[]};
  }

  checkDeath(); 
  if (typeof render === 'function') render();
}

function checkDeath(){ if(S) S.dead=false; }

/* ==========================================
   FAMILY & CAREGIVING EVENTS GENERATOR
   ========================================== */
function checkFamilyEvents() {
  if (!S || !Array.isArray(S.family)) return;

  S.pendingRequests = S.pendingRequests || [];

  const elderlyParents = S.family.filter(m => m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father') && typeof m.age === 'number' && m.age >= 65);
  const siblings = S.family.filter(m => m && m.alive !== false && m.role === 'Sibling');

  if (elderlyParents.length > 0) {
    if (Math.random() < 0.25) {
      const nurseCost = Math.round((S.country === 'egy' ? 120000 : 12000) * (S.pr || 1));
      const siblingAgrees = siblings.length > 0 && Math.random() > 0.4;
      const shareCost = siblingAgrees ? Math.round(nurseCost / 2) : nurseCost;

      const alreadyAsked = S.pendingRequests.some(r => r.type === 'PARENT_CARE');
      if (!alreadyAsked) {
        S.pendingRequests.push({
          id: Date.now(),
          type: 'PARENT_CARE',
          title: 'Elderly Parents Care & Health',
          description: `Your aging parent(s) require home care and medical support (${typeof money === 'function' ? money(nurseCost) : nurseCost}/yr). ${
            siblings.length > 0 
              ? (siblingAgrees ? 'Your sibling agreed to split the cost 50/50 with you.' : 'Your sibling refused to help pay.') 
              : 'You have no siblings to share this expense with.'
          }`,
          cost: shareCost,
          timeCostHours: 5,
          siblingPaid: siblingAgrees
        });

        if (typeof log === 'function') {
          log(`⚠️ Family Notice: Your parents need home care. Check the Requests section.`);
        }
      }
    }
  }
}
