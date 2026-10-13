/* =====================================================================
   5. YEARLY AGE UP TICK
   ===================================================================== */
function ageUp(){
  if (S.pending) return hint('Make your choice first.');
  if (S.age < 18 && !S.school){ go('school'); return hint('Pick a school first.'); }
  if (S.age >= 18 && !S.housing){ go('assets'); return hint('Choose housing in Real Estate first.'); }
  hint();

  S.age++; S.actions=2; S.worked=false; S.promoTried=false; S.income=0; S.expenses=0;
  const notes = [], bill = {};
  const wasStudying = S.age<=18 || !!S.uni;
  if (S.age>=18){   // rents follow wages (set by the Era Pack each year)
    const rise = S.rentWorld ? (S.rentRise||0) : .02+Math.random()*.05;
    if (!S.rentWorld) S.rentIndex*=1+rise;
    if (S.housing && homeInfo() && !homeInfo().own) notes.push(`rent ${rise>=0?'rose':'fell'} ${Math.abs(Math.round(rise*100))}%`);
  }
  S.promo = Math.random()<.6 ? pick(PROMOS) : null;   // this year's store sale

  // School year (ages 7-18). Parents pay the fees, so nothing is charged to you.
  if (S.age <= 18){
    const sc=SCHOOLS[S.school]||SCHOOLS.national, ef=EFFORT[S.effort];
    fx({smarts:Math.round(ef.smarts>0?ef.smarts*sc.mult:ef.smarts), happiness:ef.happiness, social:ef.social+sc.social});
    if (S.effort==='skip') S.skips++;
  }
  if (S.age===18){
    S.diploma = S.skips<5;
    log(S.diploma?'Graduated high school! University is optional: you can also start working.':'Left school without a diploma.');
  }

  if (S.uni) uniYear(notes, bill);

  // Part-time work
  if (S.part){
    if (!wasStudying){ S.part=null; log('Your part-time job ended with your studies.'); }
    else { const st=S.part.stress+(S.effort==='hard'?2:0); S.income+=S.part.pay; fx({happiness:-st, health:-1, smarts:-1}); }
  }

  // Career: salary, schedule stress, performance, forced retirement
  if (S.job){
    const lvlData = TRACKS[S.job.trackId].levels[S.job.level];
    let extraPerf = 0, extraStress = 0;
    if (S.schedule === 'over'){ extraPerf = 8; extraStress = 4; }
    else if (S.schedule === 'crunch'){ extraPerf = 18; extraStress = 9; }

    S.job.perf = clamp(S.job.perf + extraPerf - 2);
    fx({happiness: -(lvlData.stress + extraStress), health: extraStress > 5 ? -2 : 0});
    S.income += S.job.salary; S.lastSalary = S.job.salary;
    S.job.years++;

    if (S.job.perf < 10){
      log(`Fired from ${S.job.title} due to poor performance!`);
      S.job = null;
    } else if (S.age >= RETIRE_FORCED){ retireNow(true); }
  }
  if (S.retired) S.income += S.pension;

  // Owned properties: condition decay, mortgage, tenants (value changes come from the Era Pack's housing market)
  S.ownedHomes.forEach(h => {
    const cat = HOUSING_CATALOG.find(c=>c.id===h.catId);
    h.cond = clamp(h.cond - 3);
    h.value = Math.round(h.value * 1.03);
    if (h.balance > 0){
      h.balance = Math.round(h.balance * (1+(h.rate||.05)));
      const pmt = Math.min(h.balance, h.pay || (cat ? cat.pay : Math.round(h.value*.04)));
      h.balance -= pmt;
      bill.mortgage = (bill.mortgage||0) + pmt;
    }
    if (h.status === 'rent'){
      const rentCollected = Math.round(h.rentInc * S.rentIndex * (h.cond / 100));
      S.income += rentCollected;
      notes.push(`tenants paid ${money(rentCollected)}`);
    }
  });

  // Items you own: aging, breakdowns, yearly benefits, insurance
  itemsYear(bill);

  // Shop installments and bank loans: interest, then the yearly payment
  S.shopLoans.forEach(l => { const p=Math.min(l.bal,l.pmt); l.bal-=p; bill.installments=(bill.installments||0)+p; });
  S.shopLoans = S.shopLoans.filter(l => l.bal > 0);
  S.loans.forEach(l => { l.bal=Math.round(l.bal*(1+l.rate)); const p=Math.min(l.bal,l.pmt); l.bal-=p; bill.bankLoans=(bill.bankLoans||0)+p; });
  S.loans = S.loans.filter(l => l.bal > 0);

  // Living costs (adults)
  if (S.age>=18){
    const hi = homeInfo(), fd=FOOD[S.food], tr=TRANSPORT[S.transport];
    bill.groceries = Math.round(fd.cost*(S.housing==='parents'?.4:1));
    bill.phone = PHONE;
    bill.transport = tr.cost;
    if (S.insured) bill.insurance = Math.round(INSURANCE*(S.pr||1));
    fx({health:fd.hp, happiness:fd.hap+tr.hap});

    if (S.housing==='parents'){ if (S.famWealth<1) bill.familyContribution = Math.round(1500*(S.pr||1)); }
    else if (hi){
      fx({happiness:hi.cat.hap, health:hi.cat.hp});
      bill.utilities = hi.cat.util;
      if (hi.own){ bill.propertyTax = Math.round(hi.own.value*PROP_TAX); if (hi.own.cond<40) fx({happiness:-2}); }
      else bill.rent = rentCost(hi.cat);
    }

    bill.payrollTax = Math.round(S.income * PAYROLL);
    bill.incomeTax = incomeTax(Math.max(0, S.income));

    if (S.loan>0){   // student loan: 5% interest, repay up to 10% of income
      S.loan = Math.round(S.loan * 1.05);
      const r = Math.min(S.loan, Math.round(S.income * .10));
      S.loan -= r;
      bill.studentLoan = r;
    }
  }

  bill.children = familyYear();
  const cf = comfort(S.housing); if (cf.hap||cf.hp||cf.sm) fx({happiness:cf.hap, health:cf.hp, smarts:cf.sm});   // furnished home comfort
  S.expenses = Object.values(bill).reduce((a,b)=>a+b,0);
  S.bill = bill;
  S.wealth += S.income - S.expenses;
  if (S.age<18) S.wealth = Math.max(0, S.wealth);   // parents absorb any shortfall

  if (S.age>=18) notes.push(`earned ${money(S.income)}, spent ${money(S.expenses)}`);
  if (S.wealth<0 && S.age>=18){ fx({happiness:-3}); notes.push('debt is weighing on you'); }
  if (S.age>50) fx({health:-Math.ceil((S.age-50)/8)});
  if (notes.length) log(notes.join('; ')+'.');

  const pool = EVENTS.filter(e=>S.age>=e.min && S.age<=e.max && e.id!==S.lastEvent && (!e.ok || e.ok()));
  if (pool.length && Math.random()<.8){
    const e = pool[Math.floor(Math.random()*pool.length)];
    S.lastEvent=e.id; S.ev=e; S.evId=e.id; S.pending=true; activeTab='life';
  } else S.ev={title:'A quiet year',text:'Nothing major happened. Life went on.',choices:[]};

  checkDeath(); render();
}

function checkDeath(){ if(S) S.dead=false; }

