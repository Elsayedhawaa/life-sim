/* ============================================================================
   World Life Complete Edition — Deep Narrative, Psychological & Cultural Library
   40+ richly authored, context-aware human life scenes (Ages 5 -> 85+) blending
   Alter Ego psychological growth, CK3 trait/value stress ripples, and authentic
   Egypt / Gulf / Europe / North America legal, workplace & family realities.
   ========================================================================== */

import { chance, clamp, pick, randInt } from '../core/rng.js';
import { recordJournal, walletMove, moveBalance, ensureExtendedState, computeNetWorthLocal, LIFE_AMBITIONS } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraLocalCost, eraSalary, convertCurrency } from '../data/economy.js';
import { rememberDeed } from './soulEngine.js';

export function collectExtendedLifeScenes(S, addOnce) {
  ensureExtendedState(S);
  const age = S.player.age;
  const cObj = getCountry(S.country);

  const dad = S.relations.fatherId ? S.people[S.relations.fatherId] : null;
  const mom = S.relations.motherId ? S.people[S.relations.motherId] : null;
  const sib = S.relations.siblingIds.map(id => S.people[id]).find(p => p && p.alive);
  const friend = S.relations.friendIds.map(id => S.people[id]).find(p => p && p.alive);
  const spouse = S.relations.spouseIds.map(id => S.people[id]).find(p => p && p.alive);
  const youngChild = S.relations.childIds.map(id => S.people[id]).find(p => p && p.alive && p.age <= 5);
  const teenChild = S.relations.childIds.map(id => S.people[id]).find(p => p && p.alive && p.age >= 13 && p.age <= 17);
  const adultChild = S.relations.childIds.map(id => S.people[id]).find(p => p && p.alive && p.age >= 23);

  /* ==========================================================================
     1. CHILDHOOD PSYCHOLOGY & FORMATIVE VALUES (Ages 6–12)
     ======================================================================== */
  if (age >= 6 && age <= 12) {
    addOnce('st_first_school_gate', () => ({
      key: 'st_first_school_gate',
      category: 'life',
      title: 'The Iron Gate on Morning One',
      text: `Outside ${S.education.schoolName || 'primary school'}, dozens of children crowd the courtyard noisy and unfamiliar. Your hand slips out of your parent’s grip as the bell rings.`,
      choices: [
        {
          label: 'Walk straight up to the nearest group and introduce yourself (+Charisma)',
          effect: (st) => {
            st.skills.charisma = clamp(st.skills.charisma + 8);
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
            recordJournal(st, `From your very first morning at school, you walked into unfamiliar rooms head-first and made friends fast.`, 'life');
          }
        },
        {
          label: 'Take a front-row desk, observe quietly, and master every lesson (+Smarts, +Creativity)',
          effect: (st) => {
            st.player.vitals.smarts = clamp(st.player.vitals.smarts + 4);
            st.skills.creativity = clamp(st.skills.creativity + 7);
            recordJournal(st, `You took a quiet front-row seat and quickly became the sharpest observer in your class.`, 'career');
          }
        }
      ]
    }));

    addOnce('st_hidden_spark', () => ({
      key: 'st_hidden_spark',
      category: 'life',
      title: 'An Afternoon Obsession',
      text: `Long after homework finishes, one pastime completely absorbs your afternoons until someone has to call you twice for dinner.`,
      choices: [
        {
          label: 'Taking apart electronics, logic puzzles & numbers (+Smarts, +Financial IQ)',
          effect: (st) => {
            st.player.vitals.smarts = clamp(st.player.vitals.smarts + 5);
            st.skills.financialIq = clamp(st.skills.financialIq + 8);
            recordJournal(st, `You spent childhood afternoons taking apart gadgets and solving number puzzles until dusk.`, 'career');
          }
        },
        {
          label: 'Street & club football matches until your legs ache (+Fitness, +Health)',
          effect: (st) => {
            st.skills.fitness = clamp(st.skills.fitness + 10);
            st.player.vitals.health = clamp(st.player.vitals.health + 5);
            recordJournal(st, `Endless neighborhood matches built your stamina, reflexes, and competitive grit early.`, 'health');
          }
        },
        {
          label: 'Sketchbooks, music & storytelling (+Creativity, +Happiness)',
          effect: (st) => {
            st.skills.creativity = clamp(st.skills.creativity + 11);
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
            recordJournal(st, `Sketching and storytelling became your private world throughout childhood.`, 'life');
          }
        }
      ]
    }));

    addOnce('st_lost_wallet_bakery', () => {
      const cashFound = eraLocalCost(cObj.monthlyBasket2026.foodAdult * 0.4, S.country, S.year);
      return {
        key: 'st_lost_wallet_bakery',
        category: 'life',
        title: 'A Thick Wallet Beside the Bakery Step',
        text: `Sent to buy fresh bread, you spot a worn leather wallet stuffed with banknotes (${formatMoney(cashFound, S.country)}) and an ID card belonging to an elderly retired neighbor.`,
        choices: [
          {
            label: 'Walk straight to the neighbor’s building and return every note (+Integrity, +Reputation)',
            effect: (st) => {
              st.values.integrity = clamp(st.values.integrity + 14);
              st.reputation = clamp(st.reputation + 8);
              if (dad && dad.alive) rememberDeed(st, dad, 'proud_moment', 'Returned a neighbor’s lost wallet untouched.', { respect: 12, trust: 10 });
              recordJournal(st, `You returned the lost wallet intact; word of your honesty made your parents beam with pride all week.`, 'life');
            }
          },
          {
            label: `Slip the banknotes (${formatMoney(cashFound, S.country)}) into your pocket and drop the wallet by the curb`,
            effect: (st) => {
              walletMove(st, cashFound, 'Kept cash from found wallet', 'money');
              st.values.integrity = clamp(st.values.integrity - 14);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              recordJournal(st, `You pocketed ${formatMoney(cashFound, st.country)} from the lost wallet and told nobody, though guilt pricked whenever you passed that bakery.`, 'money');
            }
          }
        ]
      };
    });

    if (sib && sib.alive) {
      addOnce('st_sibling_heirloom', () => ({
        key: 'st_sibling_heirloom',
        category: 'family',
        speakerId: sib.id,
        title: 'Porcelain Shards on the Living Room Rug',
        text: `Reaching for a shelf, ${sib.firstName} knocks over a prized crystal centerpiece just as footsteps approach down the hall. Wide-eyed, ${sib.firstName} whispers: "Please don’t say it was me!"`,
        choices: [
          {
            label: `Step forward and share the blame so ${sib.firstName} isn’t punished alone`,
            effect: (st) => {
              st.values.familyDevotion = clamp(st.values.familyDevotion + 10);
              rememberDeed(st, sib, 'supported_crisis', 'Shared the blame over the broken centerpiece.', { affection: 16, trust: 18 });
              recordJournal(st, `You covered for ${sib.firstName} when the crystal centerpiece shattered — sealing an unspoken sibling pact.`, 'relationship');
            }
          },
          {
            label: 'Explain calmly and truthfully how the accident happened',
            effect: (st) => {
              st.values.integrity = clamp(st.values.integrity + 6);
              if (mom && mom.alive) mom.rel.trust = clamp(mom.rel.trust + 6);
              sib.rel.resentment = clamp(sib.rel.resentment + 6);
              recordJournal(st, `You told the truth about the broken crystal; ${sib.firstName} sulked for days, though your parents trusted your word.`, 'family');
            }
          }
        ]
      }));
    }
  }

  /* ==========================================================================
     2. TEENAGE CRUCIBLE & IDENTITY (Ages 13–17)
     ======================================================================== */
  if (age >= 13 && age <= 17) {
    addOnce('st_teen_peer_smoke', () => ({
      key: 'st_teen_peer_smoke',
      category: 'health',
      title: 'Behind the Sports Club Wall',
      text: `After afternoon practice, the loudest clique in your grade lights cigarettes behind the wall and laughs: "Don't tell us you're too scared to cut sixth period with us."`,
      choices: [
        {
          label: 'Laugh it off without preaching and head back to training (+Fitness, +Integrity)',
          effect: (st) => {
            st.skills.fitness = clamp(st.skills.fitness + 6);
            st.values.integrity = clamp(st.values.integrity + 6);
            st.player.vitals.health = clamp(st.player.vitals.health + 3);
            recordJournal(st, `You brushed off peer pressure behind the club wall without losing your cool.`, 'health');
          }
        },
        {
          label: 'Cut class with them for the afternoon thrill (+Charisma, −Health)',
          effect: (st) => {
            st.skills.charisma = clamp(st.skills.charisma + 5);
            st.player.vitals.health = clamp(st.player.vitals.health - 4);
            st.education.academicSkill = clamp(st.education.academicSkill - 2);
            recordJournal(st, `You ditched sixth period with the older crowd, coughing through smoke and narrowly dodging the vice-principal.`, 'life');
          }
        }
      ]
    }));

    addOnce('st_summer_apprentice', () => {
      const summerPay = eraLocalCost(cObj.monthlyBasket2026.foodAdult * 0.9, S.country, S.year);
      return {
        key: 'st_summer_apprentice',
        category: 'career',
        title: 'Six Weeks of Real Summer Work',
        text: `A family acquaintance offers you six weeks helping with inventory, customer ledgers, and errands over the summer break for ${formatMoney(summerPay, S.country)}.`,
        choices: [
          {
            label: `Show up at 8 a.m. sharp every day (+${formatMoney(summerPay, S.country)}, +Financial IQ, +Wasta)`,
            effect: (st) => {
              walletMove(st, summerPay, 'Summer youth apprenticeship', 'money');
              st.skills.financialIq = clamp(st.skills.financialIq + 8);
              st.skills.wasta = clamp(st.skills.wasta + 7);
              recordJournal(st, `Six weeks of honest summer work earned you ${formatMoney(summerPay, st.country)} and a practical eye for how money actually moves.`, 'career');
            }
          },
          {
            label: 'Spend the summer reading, resting & hanging out with friends (+Happiness, −Stress)',
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 10);
              recordJournal(st, `You savored a carefree summer of long evenings with friends before exam years began.`, 'life');
            }
          }
        ]
      };
    });

    addOnce('st_exam_blackout', () => ({
      key: 'st_exam_blackout',
      category: 'career',
      title: 'Blackout Two Nights Before Finals',
      text: `At 10 p.m. on a stifling evening right before final exams, the neighborhood transformer trips — plunging the entire block into pitch darkness and heat.`,
      choices: [
        {
          label: 'Prop a flashlight on the balcony rail and drill past-papers until 2 a.m. (+Academic Skill)',
          effect: (st) => {
            st.education.academicSkill = clamp(st.education.academicSkill + 5);
            st.player.vitals.smarts = clamp(st.player.vitals.smarts + 3);
            st.values.ambitionDrive = clamp(st.values.ambitionDrive + 7);
            recordJournal(st, `Not even a four-hour blackout stopped you — you finished revising on the balcony by flashlight.`, 'career');
          }
        },
        {
          label: 'Close the books early and get a full night’s sleep so your mind is fresh (−Stress)',
          effect: (st) => {
            st.player.vitals.stress = clamp(st.player.vitals.stress - 10);
            st.education.academicSkill = clamp(st.education.academicSkill + 2);
            recordJournal(st, `When the lights went out, you slept deeply and walked into the exam hall calm and rested.`, 'health');
          }
        }
      ]
    }));
  }

  /* ==========================================================================
     3. UNIVERSITY, MILITARY SERVICE & FIRST PAYCHECK (Ages 18–26)
     ======================================================================== */
  if (S.education.university && age >= 19) {
    addOnce('st_uni_mentor_prof', () => ({
      key: 'st_uni_mentor_prof',
      category: 'career',
      title: 'An Unexpected Note on Your Paper',
      text: `A notoriously demanding senior professor at ${S.education.university.name} writes "See me in office hours" across your coursework — then invites you to co-assist on an industry research brief.`,
      choices: [
        {
          label: 'Accept the extra hours & build a strong faculty mentorship (+Smarts, +Wasta, +Reputation)',
          effect: (st) => {
            st.player.vitals.smarts = clamp(st.player.vitals.smarts + 4);
            st.skills.wasta = clamp(st.skills.wasta + 10);
            st.reputation = clamp(st.reputation + 7);
            st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
            recordJournal(st, `Assisting a senior professor at ${st.education.university?.name || 'university'} opened doors and sharpened your analytical edge.`, 'career');
          }
        },
        {
          label: 'Thank them politely and keep focus on your core exams',
          effect: (st) => {
            st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
            recordJournal(st, `You thanked the professor warmly while keeping your schedule manageable.`, 'career');
          }
        }
      ]
    }));
  }

  if (S.legal.military.status === 'active_duty') {
    addOnce('st_military_night_watch', () => ({
      key: 'st_military_night_watch',
      category: 'life',
      title: 'Cold Desert Stars on 2 A.M. Watch',
      text: `Halfway through national military service, you share thermos tea on a freezing 2 a.m. guard shift with engineers, doctors, and tradesmen from across the country — trading stories of what everyone plans to build after discharge.`,
      choices: [
        {
          label: 'Swap numbers and vow to back each other in civilian life (+Wasta, +Fitness, +Happiness)',
          effect: (st) => {
            st.skills.wasta = clamp(st.skills.wasta + 12);
            st.skills.fitness = clamp(st.skills.fitness + 6);
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
            recordJournal(st, `Forged lasting camaraderie during night watch in military service — connections that span every province and profession.`, 'milestone');
          }
        },
        {
          label: 'Keep your head down and count the remaining days quietly',
          effect: (st) => {
            st.player.vitals.stress = clamp(st.player.vitals.stress - 5);
            recordJournal(st, `You served your conscription watch quietly, counting down the weeks to civilian life.`, 'life');
          }
        }
      ]
    }));
  }

  if (S.career.employed && S.career.job && age >= 20 && age <= 29 && [dad, mom].some(p => p && p.alive)) {
    addOnce('st_first_paycheck_ritual', () => {
      const treatCost = Math.min(Math.max(50, Math.round(S.career.job.monthlyGross * 0.2)), Math.max(50, S.money.cash));
      return {
        key: 'st_first_paycheck_ritual',
        category: 'family',
        title: 'Your First Real Salary Hits the Account',
        text: `Seeing your own earned salary (${formatMoney(S.career.job.monthlyGross, S.country)}/mo) land in your account for the first time feels unreal.`,
        choices: [
          {
            label: `Bring groceries/sweets home & take family to dinner (${formatMoney(treatCost, S.country)})`,
            available: () => S.money.cash >= treatCost,
            effect: (st) => {
              walletMove(st, -treatCost, 'First-paycheck family celebration', 'family');
              st.values.familyDevotion = clamp(st.values.familyDevotion + 8);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 9);
              for (const p of [dad, mom].filter(x => x && x.alive)) {
                rememberDeed(st, p, 'gift', 'Honored parents with your very first paycheck.', { affection: 12, respect: 10 });
              }
              recordJournal(st, `You celebrated your first real salary by treating your parents — a moment neither you nor they forgot.`, 'milestone');
            }
          },
          {
            label: 'Move half straight into savings & build an emergency runway (+Financial IQ)',
            effect: (st) => {
              const sv = Math.floor(st.money.cash * 0.4);
              if (sv > 0) {
                // Through the ledger like every other savings move (was a
                // direct cash -= / savings += bypass, invisible to the ledger).
                moveBalance(st, 'savings', sv, 'First-paycheck emergency reserve', 'bank');
                walletMove(st, -sv, 'First-paycheck emergency reserve', 'bank');
              }
              st.skills.financialIq = clamp(st.skills.financialIq + 9);
              recordJournal(st, `From your very first salary, you paid yourself first and started an emergency reserve.`, 'money');
            }
          }
        ]
      };
    });
  }

  /* ==========================================================================
     4. WORKPLACE POLITICS, WASTA, LAYOFFS & ETHICS (Ages 24–58)
     ======================================================================== */
  if (S.career.employed && S.career.job && age >= 24) {
    addOnce('st_wasta_nepotism_hire', () => ({
      key: 'st_wasta_nepotism_hire',
      category: 'career',
      title: 'The Connected Nephew on Your Team',
      text: `A board member’s 23-year-old nephew joins ${S.career.job.employer} on a senior band despite barely knowing the workflow — and management quietly expects you to carry his onboarding.`,
      choices: [
        {
          label: 'Mentor him tactfully & turn his family connection into your own political capital (+Wasta, +Raise)',
          effect: (st) => {
            st.skills.wasta = clamp(st.skills.wasta + 15);
            st.skills.charisma = clamp(st.skills.charisma + 6);
            if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * 1.10);
            if (st.values.integrity >= 75) st.player.vitals.stress = clamp(st.player.vitals.stress + 6); // CK3 value friction!
            recordJournal(st, `You handled the connected new hire with diplomatic finesse, earning executive goodwill and a 10% pay bump.`, 'career');
          }
        },
        {
          label: 'Keep strict professional boundaries — do your own work to perfection and document everything',
          effect: (st) => {
            st.values.integrity = clamp(st.values.integrity + 8);
            if (st.career.job) st.career.job.performance = clamp(st.career.job.performance + 9);
            recordJournal(st, `You refused to babysit the nepotism hire, letting your documented output speak for itself.`, 'career');
          }
        }
      ]
    }));

    addOnce('st_layoff_restructuring', () => ({
      key: 'st_layoff_restructuring',
      category: 'career',
      title: 'Closed-Door Restructuring Meetings',
      text: `Consultants appear on your floor at ${S.career.job.employer} with spreadsheets, and rumors swirl that 15% of roles are on the chopping block next quarter.`,
      choices: [
        {
          label: 'Pitch a revenue-saving client retention plan directly to leadership (+Performance, +Reputation)',
          effect: (st) => {
            const win = (st.player.vitals.smarts + st.skills.charisma) >= 105 || chance(st, 0.72);
            if (win && st.career.job) {
              st.career.job.performance = clamp(st.career.job.performance + 14);
              st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * 1.12);
              st.reputation = clamp(st.reputation + 9);
              recordJournal(st, `While others froze during restructuring at ${st.career.job.employer}, your turnaround pitch secured your team and a 12% raise.`, 'career');
            } else {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 8);
              recordJournal(st, `Survived the restructuring wave at ${st.career.job?.employer || 'work'}, though budgets remained tight.`, 'career');
            }
          }
        },
        {
          label: 'Protect a vulnerable junior teammate on the cut list at your own political expense (+Integrity)',
          effect: (st) => {
            st.values.integrity = clamp(st.values.integrity + 12);
            st.reputation = clamp(st.reputation + 10);
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
            recordJournal(st, `You went to bat for a junior colleague during layoffs and saved their livelihood — everyone on the floor respected you for it.`, 'relationship');
          }
        }
      ]
    }));

    if (age >= 30) {
      addOnce('st_international_summit', () => ({
        key: 'st_international_summit',
        category: 'career',
        title: 'Selected for an International Industry Forum',
        text: `${S.career.job.employer} nominates you to present at a three-day regional industry summit, putting you in the same room as overseas directors and recruiters.`,
        choices: [
          {
            label: 'Deliver a standout keynote & work the room afterwards (+Reputation, +Wasta, +Pay)',
            effect: (st) => {
              st.reputation = clamp(st.reputation + 11);
              st.skills.wasta = clamp(st.skills.wasta + 10);
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * 1.11);
              recordJournal(st, `Your presentation at the international summit drew applause and elevated your standing across the industry.`, 'milestone');
            }
          },
          {
            label: 'Attend the technical sessions and enjoy two quiet evenings exploring the host city (−Stress)',
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress - 12);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              recordJournal(st, `Represented ${st.career.job?.employer || 'your firm'} smoothly and recharged during the trip.`, 'life');
            }
          }
        ]
      }));
    }
  }

  /* ==========================================================================
     5. HOUSING, TRAFFIC, INSURANCE & ECONOMIC REALITIES (Ages 22–68)
     ======================================================================== */
  if (age >= 22) {
    addOnce('st_upstairs_pipe_leak', () => {
      const repairBill = eraLocalCost(cObj.monthlyBasket2026.rentModest * 0.75, S.country, S.year);
      const insured = !!S.insurance?.home;
      return {
        key: 'st_upstairs_pipe_leak',
        category: 'money',
        title: 'Water Spreading Across the Ceiling',
        text: `You wake to steady dripping — a burst pipe from the floor above has soaked your ceiling plaster and hallway paint.${insured ? ' Thankfully, your Home & Contents Insurance covers water damage!' : ` Plumbers quote ${formatMoney(repairBill, S.country)} for immediate repairs.`}`,
        choices: [
          {
            label: insured
              ? 'File a zero-deductible Home Insurance claim & restore everything cleanly'
              : `Split repairs diplomatically with the upstairs neighbor (${formatMoney(Math.round(repairBill * 0.5), S.country)})`,
            available: () => insured || S.money.cash >= Math.round(repairBill * 0.5),
            effect: (st) => {
              if (!insured) walletMove(st, -Math.round(repairBill * 0.5), 'Ceiling plumbing & paint repair share', 'housing');
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, insured ? `Your home insurance policy covered the ceiling water leak without costing a penny.` : `Resolved the upstairs water leak amicably and split the plumber’s bill.`, 'money');
            }
          },
          {
            label: 'Threaten legal action until the neighbor pays every penny',
            effect: (st) => {
              if (chance(st, 0.6)) {
                recordJournal(st, `After a tense confrontation on the landing, the upstairs neighbor covered the plumbing repairs in full.`, 'life');
              } else {
                const pay = Math.min(Math.max(0, st.money.cash), repairBill);
                if (pay > 0) walletMove(st, -pay, 'Emergency ceiling plumbing repair', 'housing');
                st.player.vitals.stress = clamp(st.player.vitals.stress + 8);
                recordJournal(st, `The neighbor stalled for weeks, forcing you to pay the plumber upfront amid bitter building tension.`, 'money');
              }
            }
          }
        ]
      };
    });

    if (S.cars.length > 0) {
      addOnce('st_traffic_fender_bender', () => {
        const car = S.cars[0];
        const fixCost = Math.max(80, Math.round(car.valueLocal * 0.08));
        const insured = !!S.insurance?.auto;
        return {
          key: 'st_traffic_fender_bender',
          category: 'money',
          title: 'Screeching Brakes in Evening Rush Hour',
          text: `In bumper-to-bumper evening traffic, a distracted van clips the rear quarter-panel of your ${car.name}.${insured ? ' Your Comprehensive Auto Insurance covers full agency repairs!' : ` Bodywork & paint run ${formatMoney(fixCost, S.country)}.`}`,
          choices: [
            {
              label: insured
                ? 'Hand it to your Auto Insurer for authorized agency repair (0 out-of-pocket)'
                : `Repair properly at an authorized workshop (${formatMoney(fixCost, S.country)})`,
              available: () => insured || S.money.cash >= fixCost,
              effect: (st) => {
                if (!insured) walletMove(st, -fixCost, `Bodywork repair on ${car.name}`, 'lifestyle');
                car.condition = clamp((car.condition || 85) + 8, 20, 100);
                recordJournal(st, insured ? `Comprehensive auto insurance restored your ${car.name} at zero cost.` : `Paid ${formatMoney(fixCost, st.country)} to restore your ${car.name} to spotless condition.`, 'money');
              }
            },
            {
              label: 'Accept a small roadside cash apology & live with the dent',
              effect: (st) => {
                const cashSettle = Math.round(fixCost * 0.35);
                walletMove(st, cashSettle, 'Roadside bumper settlement', 'money');
                car.valueLocal = Math.round(car.valueLocal * 0.94);
                recordJournal(st, `Settled the traffic scrape on the spot for ${formatMoney(cashSettle, st.country)} rather than spending hours at the station.`, 'life');
              }
            }
          ]
        };
      });
    }

    if (['sau', 'uae'].includes(S.country) && !S.legal.citizenships.includes(S.country) && S.career.employed) {
      addOnce('st_gulf_nationalization_wave', () => ({
        key: 'st_gulf_nationalization_wave',
        category: 'visa',
        title: S.country === 'sau' ? 'Nitaqat Localization Quota Review' : 'Emiratisation Workforce Target Review',
        text: `Ministry labor localization quotas tighten across ${S.city}. HR reviews every expat role to verify specialized skills that justify visa renewal.`,
        choices: [
          {
            label: 'Lead internal training for young national hires & position yourself as indispensable (+Performance, +Wasta)',
            effect: (st) => {
              if (st.career.job) {
                st.career.job.performance = clamp(st.career.job.performance + 12);
                st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * 1.09);
              }
              st.skills.wasta = clamp(st.skills.wasta + 10);
              recordJournal(st, `By mentoring incoming national graduates generously, you became management’s most trusted anchor in ${st.city}.`, 'career');
            }
          },
          {
            label: 'Accelerate personal savings & hedge property back home just in case (+Financial IQ)',
            effect: (st) => {
              st.skills.financialIq = clamp(st.skills.financialIq + 8);
              recordJournal(st, `Tightening Gulf quotas reminded you never to treat employer-sponsored residency as permanent — you boosted your savings discipline.`, 'visa');
            }
          }
        ]
      }));
    }

    if (['deu', 'gbr', 'usa', 'can', 'nld', 'fra', 'aus'].includes(S.country) && S.career.employed) {
      addOnce('st_western_tax_rebate', () => {
        const rebate = Math.round((S.career.job?.monthlyGross || 2500) * 0.55);
        return {
          key: 'st_western_tax_rebate',
          category: 'money',
          title: 'Annual Tax Assessment & Deductibles Notice',
          text: `An official envelope from the revenue authority arrives reviewing your annual withholding, pension deductions, and work-from-home expenses.`,
          choices: [
            {
              label: `Itemize every legal deduction carefully (+${formatMoney(rebate, S.country)} tax refund, +Financial IQ)`,
              effect: (st) => {
                walletMove(st, rebate, 'Annual income tax refund', 'money');
                st.skills.financialIq = clamp(st.skills.financialIq + 6);
                recordJournal(st, `Filing an itemized annual tax return yielded a ${formatMoney(rebate, st.country)} refund.`, 'money');
              }
            },
            {
              label: 'File the standard one-click declaration and save your weekend',
              effect: (st) => {
                const small = Math.round(rebate * 0.4);
                walletMove(st, small, 'Standard tax adjustment refund', 'money');
                recordJournal(st, `Filed your standard annual tax declaration and collected a ${formatMoney(small, st.country)} adjustment.`, 'money');
              }
            }
          ]
        };
      });
    }
  }

  /* ==========================================================================
     6. MARRIAGE, PARENTHOOD, AGING PARENTS & GRANDCHILDREN (Ages 24–85+)
     ======================================================================== */
  if (spouse) {
    addOnce('st_spouse_career_leap', () => ({
      key: 'st_spouse_career_leap',
      category: 'family',
      speakerId: spouse.id,
      title: `${spouse.firstName}’s Big Career Opportunity`,
      text: `${spouse.fullName} comes home glowing — offered a major step-up role (+35% income), though it means heavier evening hours and reorganizing household routines.`,
      choices: [
        {
          label: `Back ${spouse.firstName} 100% and rebalance home duties together (+Affection, +Household Income)`,
          effect: (st) => {
            const base = eraSalary(cObj.annualSalaryTiers2026.entry / 12, st.country, st.year);
            spouse.career.monthlyIncomeLocal = Math.max(Math.round(base * 1.15), Math.round((spouse.career.monthlyIncomeLocal || base) * 1.35));
            rememberDeed(st, spouse, 'supported_crisis', 'Championed their career promotion whole-heartedly.', { affection: 15, trust: 12, respect: 12 });
            recordJournal(st, `With your full backing, ${spouse.firstName} stepped into a senior role earning ${formatMoney(spouse.career.monthlyIncomeLocal, st.country)}/month.`, 'relationship');
          }
        },
        {
          label: 'Ask them to turn it down so home life stays calm and predictable',
          effect: (st) => {
            if (spouse.traits.ambition >= 60) {
              spouse.rel.resentment = clamp(spouse.rel.resentment + 14);
              spouse.rel.affection = clamp(spouse.rel.affection - 6);
            }
            recordJournal(st, `${spouse.firstName} passed on the demanding promotion at your request, though a quiet wistfulness lingered.`, 'relationship');
          }
        }
      ]
    }));

    if (age >= 34) {
      addOnce('st_marriage_anniversary_escape', () => {
        const dinnerCost = eraLocalCost(cObj.monthlyBasket2026.foodAdult * 0.7, S.country, S.year);
        return {
          key: 'st_marriage_anniversary_escape',
          category: 'relationship',
          speakerId: spouse.id,
          title: 'Between Work, Bills, and Years Passing',
          text: `Looking across the dinner table at ${spouse.firstName}, you realize months of errands and responsibilities have crowded out unhurried time for just the two of you.`,
          choices: [
            {
              label: `Plan a surprise anniversary weekend away (${formatMoney(dinnerCost, S.country)})`,
              available: () => S.money.cash >= dinnerCost,
              effect: (st) => {
                walletMove(st, -dinnerCost, `Anniversary getaway with ${spouse.firstName}`, 'family');
                rememberDeed(st, spouse, 'gift', 'Planned a heartfelt anniversary escape.', { affection: 16, trust: 10, resentment: -14 });
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 10);
                st.player.vitals.stress = clamp(st.player.vitals.stress - 10);
                recordJournal(st, `Two unhurried days away with ${spouse.firstName} rekindled the warmth of your earliest years together.`, 'relationship');
              }
            },
            {
              label: 'Leave phones in another room and walk along the waterfront talking until midnight',
              effect: (st) => {
                rememberDeed(st, spouse, 'visited', 'Shared a long, honest midnight walk.', { affection: 10, resentment: -8 });
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
                recordJournal(st, `A quiet midnight walk with ${spouse.firstName} cleared away months of unspoken fatigue.`, 'relationship');
              }
            }
          ]
        };
      });
    }
  }

  if (youngChild) {
    addOnce('st_toddler_3am_fever', () => {
      const erBill = S.insurance?.health ? 0 : eraLocalCost(cObj.healthcare.checkup2026 * 1.5, S.country, S.year);
      return {
        key: 'st_toddler_3am_fever',
        category: 'family',
        speakerId: youngChild.id,
        title: `3 A.M. High Fever (${youngChild.firstName})`,
        text: `Little ${youngChild.firstName} wakes burning with a sudden 39.8°C fever in the middle of the night.`,
        choices: [
          {
            label: `Rush straight to pediatric emergency care (${erBill > 0 ? formatMoney(erBill, S.country) : 'Covered by Insurance'})`,
            available: () => S.money.cash >= erBill || erBill === 0,
            effect: (st) => {
              if (erBill > 0) walletMove(st, -erBill, `Pediatric night ER visit for ${youngChild.firstName}`, 'medical');
              youngChild.vitals.health = clamp(youngChild.vitals.health + 10);
              youngChild.rel.affection = clamp(youngChild.rel.affection + 8);
              recordJournal(st, `Carried ${youngChild.firstName} into the pediatric ER at 3 a.m.; by sunrise the fever broke and they fell asleep on your shoulder.`, 'family');
            }
          },
          {
            label: 'Stay awake applying cool compresses & pediatric antipyretics until morning clinic',
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 7);
              youngChild.vitals.health = clamp(youngChild.vitals.health + 5);
              recordJournal(st, `Stayed up all night beside ${youngChild.firstName}’s bed until the fever eased at dawn.`, 'family');
            }
          }
        ]
      };
    });
  }

  if (teenChild) {
    addOnce('st_teen_child_crossroads', () => ({
      key: 'st_teen_child_crossroads',
      category: 'family',
      speakerId: teenChild.id,
      title: `${teenChild.firstName} Pushes Back on Future Plans`,
      text: `At age ${teenChild.age}, your ${teenChild.relationLabel.toLowerCase()} ${teenChild.firstName} shuts their textbook and says firmly: "I don't want to live a copy of someone else's plan — let me choose my own specialization."`,
      choices: [
        {
          label: `Listen seriously, coach their strengths & give ${teenChild.firstName} real agency (+Trust, +Child Smarts)`,
          effect: (st) => {
            teenChild.vitals.smarts = clamp(teenChild.vitals.smarts + 7);
            teenChild.vitals.happiness = clamp(teenChild.vitals.happiness + 10);
            rememberDeed(st, teenChild, 'supported_crisis', 'Trusted their voice on their future.', { affection: 14, trust: 18, respect: 12 });
            recordJournal(st, `Instead of lecturing ${teenChild.firstName}, you treated them like an emerging adult — their motivation visibly transformed.`, 'family');
          }
        },
        {
          label: 'Insist on strict exam discipline & proven prestige fields first',
          effect: (st) => {
            teenChild.vitals.smarts = clamp(teenChild.vitals.smarts + 4);
            teenChild.rel.resentment = clamp(teenChild.rel.resentment + 12);
            recordJournal(st, `You held a firm traditional line on ${teenChild.firstName}’s studies; grades stayed high, though dinner conversations grew guarded.`, 'family');
          }
        }
      ]
    }));
  }

  const agingParent = [dad, mom].find(p => p && p.alive && p.age >= 64);
  if (agingParent && age >= 32) {
    addOnce('st_aging_parent_dignity', () => {
      const careSetup = eraLocalCost(cObj.monthlyBasket2026.rentModest * 0.9, S.country, S.year);
      return {
        key: 'st_aging_parent_dignity',
        category: 'family',
        speakerId: agingParent.id,
        title: `Protecting ${agingParent.firstName}’s Dignity`,
        text: `Visiting ${agingParent.firstName} (age ${agingParent.age}), you notice how slowly they climb the stairs now — though pride keeps them from ever asking for help.`,
        choices: [
          {
            label: `Arrange home comfort upgrades & medical checkups framed as a gift (${formatMoney(careSetup, S.country)})`,
            available: () => S.money.cash >= careSetup,
            effect: (st) => {
              walletMove(st, -careSetup, `Home care & comfort upgrades for ${agingParent.fullName}`, 'family');
              agingParent.vitals.health = clamp(agingParent.vitals.health + 10);
              st.values.familyDevotion = clamp(st.values.familyDevotion + 12);
              rememberDeed(st, agingParent, 'helped_money', 'Cared for them in old age while honoring their pride.', { affection: 18, respect: 16, trust: 14 });
              recordJournal(st, `You upgraded ${agingParent.firstName}’s home and medical care tactfully without ever wounding their pride.`, 'family');
            }
          },
          {
            label: 'Commit to visiting every Friday to handle heavy errands yourself',
            effect: (st) => {
              rememberDeed(st, agingParent, 'visited', 'Showed up faithfully every week in their later years.', { affection: 14, trust: 12 });
              recordJournal(st, `You made weekly visits to ${agingParent.firstName} non-negotiable, carrying the heavy lifting yourself.`, 'family');
            }
          }
        ]
      };
    });
  }

  if (adultChild) {
    addOnce('st_child_wedding_wali', () => {
      const weddingGift = eraLocalCost(cObj.monthlyBasket2026.rentStandard * 3, S.country, S.year);
      return {
        key: 'st_child_wedding_wali',
        category: 'milestone',
        speakerId: adultChild.id,
        title: `${adultChild.firstName} Brings Someone Home to Meet You`,
        text: `Life comes full circle: your ${adultChild.relationLabel.toLowerCase()} ${adultChild.fullName} (age ${adultChild.age}) introduces the person they hope to marry, looking to you for your blessing.`,
        choices: [
          {
            label: `Give your warm blessing & back their marital home setup (${formatMoney(weddingGift, S.country)})`,
            available: () => S.money.cash >= weddingGift,
            effect: (st) => {
              walletMove(st, -weddingGift, `Wedding & marital home gift for ${adultChild.fullName}`, 'family');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 18);
              rememberDeed(st, adultChild, 'helped_money', 'Blessed their marriage and helped set up their home.', { affection: 22, respect: 18, trust: 18 });
              recordJournal(st, `Stood proudly at ${adultChild.fullName}’s wedding and contributed ${formatMoney(weddingGift, st.country)} to launch their new household!`, 'milestone');
            }
          },
          {
            label: 'Welcome their partner warmly & pass down family wisdom and prayers',
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 14);
              rememberDeed(st, adultChild, 'proud_moment', 'Gave a heartfelt blessing at their wedding.', { affection: 15, respect: 12 });
              recordJournal(st, `Celebrated ${adultChild.fullName}’s marriage surrounded by family and lifelong memories.`, 'milestone');
            }
          }
        ]
      };
    });

    if (adultChild.age >= 26 && age >= 50) {
      addOnce('st_first_grandchild', () => ({
        key: 'st_first_grandchild',
        category: 'milestone',
        speakerId: adultChild.id,
        title: 'A New Generation in Your Arms',
        text: `${adultChild.firstName} places your newborn grandchild gently into your arms at the hospital — tiny fingers curling around your thumb as three generations share one room.`,
        choices: [
          {
            label: 'Whisper a blessing & open a gold/savings nest egg for the baby (+Happiness)',
            effect: (st) => {
              const gift = Math.min(Math.max(0, Math.floor(st.money.cash * 0.05)), eraLocalCost(cObj.monthlyBasket2026.rentStandard, st.country, st.year));
              if (gift > 0) walletMove(st, -gift, `Newborn grandchild gift (${adultChild.firstName}'s baby)`, 'family');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 20);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 15);
              recordJournal(st, `Welcomed your first grandchild into the world — seeing the ${st.player.familyName} line carry forward filled you with deep peace.`, 'milestone');
            }
          }
        ]
      }));
    }
  }

  if (age >= 52 && friend && friend.alive) {
    addOnce('st_old_friend_reunion', () => ({
      key: 'st_old_friend_reunion',
      category: 'relationship',
      speakerId: friend.id,
      title: 'Thirty Years in a Single Afternoon',
      text: `Over coffee with ${friend.fullName} (age ${friend.age}), the two of you laugh until your eyes water remembering who you were at twenty and marveling at every twist since.`,
      choices: [
        {
          label: 'Pick up the check and promise never to let years slip by unvisited again (+Happiness, −Stress)',
          effect: (st) => {
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 11);
            st.player.vitals.stress = clamp(st.player.vitals.stress - 12);
            rememberDeed(st, friend, 'visited', 'Reconnected deeply over decades of shared history.', { affection: 15, trust: 12 });
            recordJournal(st, `Spent an unforgettable afternoon reminiscing with ${friend.fullName} across decades of life.`, 'relationship');
          }
        }
      ]
    }));
  }

  if (age >= 60) {
    addOnce('st_sixty_estate_reflection', () => ({
      key: 'st_sixty_estate_reflection',
      category: 'milestone',
      title: 'Putting Your House & Legacy in Order',
      text: `Crossing ${age}, you sit quietly at your desk reviewing deeds, memories, and what kind of name and estate you want to leave behind.`,
      choices: [
        {
          label: 'Dedicate 10% of future estate to ongoing charity (Sadaqah Jariyah / Endowment) & gather the family',
          effect: (st) => {
            st.willPlan.charityPct = 10;
            st.willPlan.draftedYear = st.year;
            st.reputation = clamp(st.reputation + 12);
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 12);
            st.player.vitals.stress = clamp(st.player.vitals.stress - 14);
            recordJournal(st, `Formalized your estate plan with a 10% charitable endowment and gathered loved ones in harmony.`, 'milestone');
          }
        },
        {
          label: 'Consolidate all assets cleanly for your spouse and children',
          effect: (st) => {
            st.willPlan.charityPct = 0;
            st.willPlan.draftedYear = st.year;
            st.player.vitals.stress = clamp(st.player.vitals.stress - 10);
            recordJournal(st, `Organized every deed and account cleanly so your heirs will face zero legal friction.`, 'milestone');
          }
        }
      ]
    }));
  }
}

/* ============================================================================
   v2.10 — CHAPTERS. A life is not a feed of months; it moves through named
   stages, and each stage ends at a real moment (leaving school, a first
   job, a marriage, a first child, retirement) — never a silent birthday.
   getCurrentChapter(S) is derived from live state on every call, so old
   saves get chapters with no migration. Beats are derived from the same
   live state (goals, education, work, family) — nothing is invented.
   ========================================================================== */

export const LIFE_CHAPTERS = [
  {
    id: 'childhood',
    name: 'Early Childhood',
    meaning: 'You are small, at home, and the world is mostly your family. What happens now shapes what you become.'
  },
  {
    id: 'school',
    name: 'School Years',
    meaning: 'School is your whole world now — lessons, friends, exams. How you do here decides what opens up next.'
  },
  {
    id: 'first_steps',
    name: 'First Steps',
    meaning: 'School is behind you and adult life has started. You are finding your feet — study, work, or both — and nothing is settled yet.'
  },
  {
    id: 'building',
    name: 'Building a Life',
    meaning: 'You are earning, saving, and making your own way. This is the stretch where a steady life gets built, one decision at a time.'
  },
  {
    id: 'family',
    name: 'Family Years',
    meaning: 'You are no longer living only for yourself. A partner, children, or both now shape every choice you make.'
  },
  {
    id: 'long_middle',
    name: 'The Long Middle',
    meaning: 'The children are grown or nearly grown, and the big building years are behind you. Now it is about what the life you built is for.'
  },
  {
    id: 'twilight',
    name: 'Later Years',
    meaning: 'Work is behind you, or nearly so. What matters now is health, family, and what you leave behind.'
  }
];

function chapterBeats(S, id) {
  const age = S.player?.age || 0;
  const hasDegree = (S.education?.degrees || []).length > 0;
  const score = S.education?.highSchoolScore;
  const employed = !!(S.career?.employed || S.career?.job);
  const hasBusiness = !!S.career?.business;
  const married = (S.relations?.spouseIds || []).length > 0;
  const kids = (S.relations?.childIds || []).length;
  const livingKids = (S.relations?.childIds || []).map(k => S.people?.[k]).filter(c => c && c.alive).length;
  const homes = (S.housing?.properties || []).length;
  const closeCircle = Object.values(S.people || {}).filter(p => p && p.alive && p.id !== 'player' && p.rel?.affection >= 75).length;
  const doneGoals = (S.goals || []).filter(g => g.done).map(g => g.label);
  const openGoals = (S.goals || []).filter(g => !g.done).map(g => g.label);
  const beats = [];
  const done = (t) => beats.push({ text: t, state: 'done' });
  const open = (t) => beats.push({ text: t, state: 'open' });
  if (id === 'childhood') {
    done(`Born in ${S.city || 'your home town'} — your family is your whole world`);
    open('Start school at six');
    if (doneGoals.length) done(`${doneGoals.length} life goal${doneGoals.length === 1 ? '' : 's'} already finished`);
    return beats;
  }
  if (id === 'school') {
    done(`In school${S.education?.schoolName ? ` at ${S.education.schoolName}` : ''}`);
    if (score != null) done(`Secondary exams taken — scored ${score}%`);
    else open('Take your secondary exams');
    if (hasDegree) done('A degree already earned');
    else open('Earn a qualification after school');
    if (closeCircle >= 1) done(`${closeCircle} close ${closeCircle === 1 ? 'friend who really knows you' : 'friends who really know you'}`);
    else open('Make a close friend');
    return beats;
  }
  if (id === 'first_steps') {
    if (S.education?.university) done(`Studying ${S.education.university.majorLabel || 'at university'}`);
    else if (hasDegree) done('Finished your degree');
    else if (score != null) done(`Left school with ${score}%`);
    else open('Finish your education');
    if (employed) done(`Working${S.career.job?.title ? ` as ${S.career.job.title}` : ''}`);
    else if (hasBusiness) done('Running your own business');
    else open('Find your first job');
    open('Build savings of your own');
    if (openGoals.length) open(`Next goal: ${openGoals[0]}`);
    return beats;
  }
  if (id === 'building') {
    if (employed) done(`Working${S.career.job?.title ? ` as ${S.career.job.title}` : ''}`);
    if (hasBusiness) done(`Running ${S.career.business.name || 'your business'}${S.career.business.employees ? ` with ${S.career.business.employees} employees` : ''}`);
    if (homes > 0) done(`${homes} ${homes === 1 ? 'home' : 'homes'} owned`);
    else open('Get a home of your own');
    if (closeCircle >= 3) done(`${closeCircle} close bonds — a circle you can rely on`);
    else open(`${closeCircle}/3 close bonds — build a circle you can rely on`);
    if (married) done('Married');
    else open('Marriage is still ahead, if you want it');
    return beats;
  }
  if (id === 'family') {
    if (married) done('Married — a household of your own');
    else open('No partner right now');
    if (livingKids > 0) done(`${livingKids} ${livingKids === 1 ? 'child' : 'children'} growing up`);
    else open('Children are still ahead, if you want them');
    if (homes > 0) done(`${homes} ${homes === 1 ? 'home' : 'homes'} owned for the family`);
    else open('A family home of your own');
    if (age >= 40) open('Plan for the years after the children leave');
    if (doneGoals.length) done(`${doneGoals.length} of ${S.goals.length} life goals finished`);
    return beats;
  }
  if (id === 'long_middle') {
    if (kids > 0) done(`${kids} ${kids === 1 ? 'child' : 'children'} raised — ${livingKids} still close by`);
    if (employed) done(`Still working${S.career.job?.title ? ` as ${S.career.job.title}` : ''}`);
    else if (hasBusiness) done('Still running your business');
    if (homes > 0) done(`${homes} ${homes === 1 ? 'home' : 'homes'} owned`);
    open('Decide what the next stretch of life is for');
    if (S.willPlan?.draftedYear) done('A will is written');
    else open('Write a will while there is time to do it well');
    return beats;
  }
  /* twilight */
  if (S.career?.retired) done('Retired from work');
  if (livingKids > 0) done(`${livingKids} ${livingKids === 1 ? 'child' : 'children'} in your life`);
  if (closeCircle > 0) done(`${closeCircle} close ${closeCircle === 1 ? 'bond' : 'bonds'} still strong`);
  if (S.willPlan?.draftedYear) done('A will is written');
  else open('Write a will — decide what goes to whom');
  open('Look after your health, one year at a time');
  if (doneGoals.length) done(`${doneGoals.length} of ${S.goals.length} life goals finished`);
  return beats;
}

export function getCurrentChapter(S) {
  const age = S.player?.age || 0;
  const married = (S.relations?.spouseIds || []).length > 0;
  const kids = (S.relations?.childIds || []).length;
  const livingKids = (S.relations?.childIds || []).map(k => S.people?.[k]).filter(c => c && c.alive).length;
  const youngKids = (S.relations?.childIds || []).map(k => S.people?.[k]).filter(c => c && c.alive && c.age < 18).length;
  const employed = !!(S.career?.employed || S.career?.job || S.career?.business);
  const retired = !!S.career?.retired;
  const inUniversity = !!S.education?.university;
  const finishedSchool = S.education?.highSchoolScore != null || (S.education?.degrees || []).length > 0 || ['graduated_high', 'university', 'completed'].includes(S.education?.stage);

  let id;
  if (retired || age >= 65) id = 'twilight';
  else if (age < 6) id = 'childhood';
  else if (age < 18 && !finishedSchool) id = 'school';
  else if (age >= 50 && youngKids === 0 && (married || kids > 0 || employed)) id = 'long_middle';
  else if (married || livingKids > 0) id = 'family';
  else if (employed && finishedSchool && !inUniversity) id = 'building';
  else id = 'first_steps';

  const def = LIFE_CHAPTERS.find(c => c.id === id);
  return { id, name: def.name, meaning: def.meaning, beats: chapterBeats(S, id) };
}

/* Mark a chapter change as an event. The first time a chapter is seen it is
   recorded silently (a birth is already journalled); every later change
   writes one milestone journal line saying what the new chapter means.
   Called from the Timeline render — the one place the player sees it. */
export function noteChapterChange(S, chapter) {
  if (!S || !chapter) return false;
  if (S._chapterId === undefined) { S._chapterId = chapter.id; return false; }
  if (S._chapterId === chapter.id) return false;
  S._chapterId = chapter.id;
  recordJournal(S, `A new chapter begins: ${chapter.name}. ${chapter.meaning}`, 'milestone');
  return true;
}

/* ============================================================================
   v2.10 — AMBITIONS. Picked once in the new-life modal, tracked for life.
   state: 'achieved' | 'failed' | 'in_progress'. Only two ambitions can
   fail, and both fail for a plain age reason the player is told:
   - entrepreneur: retired without ever building a company with a team of 6.
   - family_dynasty: past 55 with no children — starting a family is no
     longer realistic. Every other ambition stays open as long as you live.
   ========================================================================== */

export function ambitionStatus(S) {
  const cObj = getCountry(S.country);
  const netWorth = computeNetWorthLocal(S);
  const annualBenchmark = eraSalary(cObj.annualSalaryTiers2026.mid, S.country, S.year);
  const target = Math.max(1, annualBenchmark * 6);
  const age = S.player?.age || 0;
  const label = (S.goals || []).find(g => g.id === 'g_ambition')?.label
    || (LIFE_AMBITIONS[S.ambition] ? LIFE_AMBITIONS[S.ambition].label : 'A Full, Respected Life');
  const goalDone = !!(S.goals || []).find(g => g.id === 'g_ambition')?.done;
  const kids = (S.relations?.childIds || []).length;
  const homes = (S.housing?.properties || []).length;
  const emp = S.career?.business?.employees || 0;

  if (S.ambition === 'global_passport') {
    const abroad = S.country !== S.homeCountry;
    const second = (S.legal?.citizenships || []).length > 1;
    if (goalDone || second) return { label, pct: 100, state: 'achieved', reason: second ? `You hold ${S.legal.citizenships.length} passports.` : 'You are living abroad.', canFail: false, failNote: 'This ambition cannot fail — you can move abroad at any age.' };
    return { label, pct: abroad ? 60 : 0, state: 'in_progress', reason: abroad ? 'You are living abroad — a second passport would finish it.' : 'Still living at home on one passport.', canFail: false, failNote: 'This ambition cannot fail — you can move abroad at any age.' };
  }
  if (S.ambition === 'entrepreneur') {
    if (goalDone || emp >= 6) return { label, pct: 100, state: 'achieved', reason: `Your company employs ${emp} people.`, canFail: false, failNote: '' };
    if (S.career?.retired || age >= 65) return { label, pct: Math.min(100, Math.round((emp / 6) * 100)), state: 'failed', reason: 'You reached retirement without building a company with a team of six.', canFail: true, failNote: 'This ambition fails at retirement if the team is not built.' };
    return { label, pct: Math.min(100, Math.round((emp / 6) * 100)), state: 'in_progress', reason: S.career?.business ? `${emp}/6 employees.` : 'No business yet.', canFail: true, failNote: 'This ambition fails at retirement if the team is not built.' };
  }
  if (S.ambition === 'family_dynasty') {
    if (goalDone || (kids >= 1 && homes >= 1)) return { label, pct: 100, state: 'achieved', reason: `${kids} ${kids === 1 ? 'child' : 'children'} and ${homes} ${homes === 1 ? 'home' : 'homes'} owned.`, canFail: false, failNote: '' };
    if (age >= 55 && kids === 0) return { label, pct: 0, state: 'failed', reason: 'Past 55 with no children — starting a family is no longer realistic.', canFail: true, failNote: 'This ambition fails after 55 if you have no children.' };
    return { label, pct: (kids >= 1 ? 50 : 0) + (homes >= 1 ? 50 : 0), state: 'in_progress', reason: `${kids} ${kids === 1 ? 'child' : 'children'} · ${homes} ${homes === 1 ? 'home' : 'homes'} owned.`, canFail: true, failNote: 'This ambition fails after 55 if you have no children.' };
  }
  /* balanced / career_wealth: net worth of 6x the national annual salary. */
  const pct = Math.min(100, Math.round((netWorth / target) * 100));
  if (goalDone || netWorth >= target) return { label, pct: 100, state: 'achieved', reason: `Net worth ${formatMoney(netWorth, S.country)} reached the target of ${formatMoney(target, S.country)}.`, canFail: false, failNote: 'This ambition cannot fail — it stays open as long as you live.' };
  return { label, pct, state: 'in_progress', reason: `Net worth ${formatMoney(netWorth, S.country)} of ${formatMoney(target, S.country)} needed.`, canFail: false, failNote: 'This ambition cannot fail — it stays open as long as you live.' };
}

/* Write the ambition's ending to the journal once, naming why. */
export function noteAmbitionOutcome(S, status) {
  if (!S || !status || status.state === 'in_progress') return false;
  const key = `ambition:${status.state}`;
  if (S._ambitionOutcomeLogged === key) return false;
  S._ambitionOutcomeLogged = key;
  recordJournal(S, status.state === 'achieved'
    ? `Ambition achieved: ${status.label} — ${status.reason}`
    : `Ambition ended: ${status.label} — ${status.reason}`, 'milestone');
  return true;
}
