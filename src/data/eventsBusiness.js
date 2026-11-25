/* ============================================================================
   World Life 2.0 — v2.11 W3: Business events (eventsBusiness.js)
   14 random events that only ever fire for a business the player actually
   has, gated by that business's real state (see the gates in
   eventEngine.js: hasBusiness / minEmployees / hasPremises /
   minBusinessAgeMonths / minRepeatRate / belowMaxLevel).

   Every choice moves the business's numbers — monthly revenue, monthly
   costs, repeat rate, staff (wages, morale, headcount), premises
   condition, or cash through the ledger — never just a journal line.
   Effects only ever touch v2.11 contract fields (monthlyRev,
   monthlyCost, repeatRate, staff[], premises.conditionPct) plus the
   player's cash and vitals, so they work on a business created by the
   v2.11 launcher and degrade honestly on a pre-v2.11 business (headcount
   only, no staff array: morale effects fall back to the repeat rate).

   Which business an event is about: build() picks it deterministically
   (first business matching the event's needs — most staff, oldest,
   first with premises, first below max level) and the choice effects
   re-pick it with the SAME selector, so the business named in the text
   is the business the choice changes.
   ========================================================================== */

import { chance, clamp, randInt } from '../core/rng.js';
import { recordJournal, walletMove } from '../core/schema.js';
import { formatMoney } from '../data/countries.js';
import {
  businessesOf, bizStaffList, bizStaffCount, bizAgeMonths,
} from '../systems/businessPremises.js';

/* --- deterministic business pickers (shared by build and effects) --- */
function firstBiz(S) { return businessesOf(S)[0] || null; }
function firstStaffedBiz(S) {
  const list = businessesOf(S).filter((b) => bizStaffCount(b) > 0);
  if (!list.length) return null;
  return list.slice().sort((a, b) => bizStaffCount(b) - bizStaffCount(a))[0];
}
function firstPremisesBiz(S) {
  return businessesOf(S).find((b) => b && b.premises) || null;
}
function firstOldBiz(S) {
  const list = businessesOf(S);
  if (!list.length) return null;
  return list.slice().sort((a, b) => bizAgeMonths(S, b) - bizAgeMonths(S, a))[0];
}
function firstBelowMaxBiz(S) {
  return businessesOf(S).find((b) => (Number(b.level || 1)) < (Number(b.maxLevel || 5))) || null;
}
function keyEmployee(biz) {
  const staff = bizStaffList(biz);
  if (!staff.length) return null;
  return staff.slice().sort((a, b) => (Number(b.skill || 0)) - (Number(a.skill || 0)))[0];
}
function keyEmployeeName(biz) {
  const emp = keyEmployee(biz);
  return emp ? (emp.name || 'your best employee') : 'your longest-serving employee';
}
/* Remove one employee: from the staff array when it exists, else from
   the old headcount. Returns the removed person (or null). */
function removeEmployee(biz, emp) {
  if (Array.isArray(biz.staff) && biz.staff.length) {
    const idx = emp ? biz.staff.indexOf(emp) : 0;
    const gone = biz.staff.splice(Math.max(0, idx), 1)[0] || null;
    return gone;
  }
  if (typeof biz.employees === 'number' && biz.employees > 0) {
    biz.employees -= 1;
    return null;
  }
  return null;
}
/* Morale for the whole team: staff morale when there is a team, else
   the repeat-customer rate as the visible stand-in. */
function shiftTeamMorale(biz, delta) {
  const staff = bizStaffList(biz);
  if (staff.length) {
    for (const m of staff) m.morale = clamp(Number(m.morale ?? 60) + delta);
  } else {
    biz.repeatRate = clamp((Number(biz.repeatRate ?? 0.5)) + Math.round(delta / 3) / 100, 0, 1);
  }
}
function shiftRevenue(biz, mult) {
  biz.monthlyRev = Math.max(1, Math.round(Number(biz.monthlyRev || 0) * mult));
}
function shiftCost(biz, mult) {
  biz.monthlyCost = Math.max(1, Math.round(Number(biz.monthlyCost || 0) * mult));
}
function shiftRepeatRate(biz, delta) {
  biz.repeatRate = clamp((Number(biz.repeatRate ?? 0.5)) + delta, 0, 1);
}
function revOf(biz) { return Math.max(1, Number(biz.monthlyRev || 0)); }
function costOf(biz) { return Math.max(1, Number(biz.monthlyCost || 0)); }

export const BUSINESS_EVENTS = [
  {
    id: 'ev_biz_big_client',
    category: 'business',
    repeatable: true,
    cooldownYears: 2,
    gates: { minAge: 19, hasBusiness: true, minRepeatRate: 0.55 },
    build: (S, ctx) => {
      const biz = firstBiz(S);
      const fee = Math.round(revOf(biz) * 1.0);
      return {
        key: 'ev_biz_big_client', category: 'business',
        title: `A Big Client Comes to ${biz.name}`,
        text: `A large customer has been watching ${biz.name} for months. Now they want a standing order — worth about ${formatMoney(fee, S.country)} a month, every month, if you can handle the volume. They are also talking to two other firms.`,
        choices: [
          {
            label: 'Sign them — take the volume',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRevenue(b, 1.15); shiftRepeatRate(b, 0.05);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `${b.name} signed a big standing client — monthly revenue up 15%, and more customers come back. The extra work is relentless.`, 'business');
            },
          },
          {
            label: `Negotiate hard — ask for ${formatMoney(fee, S.country)} up front as well`,
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              if (chance(st, 0.6)) {
                walletMove(st, fee, `Signing fee from a big client — ${b.name}`, 'business');
                shiftRevenue(b, 1.25); shiftRepeatRate(b, 0.04);
                recordJournal(st, `You held out and the big client paid a ${formatMoney(fee, st.country)} signing fee to ${b.name} — and revenue up 25%.`, 'business');
              } else {
                shiftRepeatRate(b, -0.03);
                st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
                recordJournal(st, `You pushed the big client too hard and they signed with a rival instead. ${b.name} lost the deal.`, 'business');
              }
            },
          },
          {
            label: 'Turn them down — you are not ready for that volume',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRepeatRate(b, 0.02);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You turned down the big client — ${b.name} is not ready for that volume yet, and saying so honestly earned respect.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_supplier_fails',
    category: 'business',
    repeatable: true,
    cooldownYears: 2,
    gates: { minAge: 19, hasBusiness: true },
    build: (S, ctx) => {
      const biz = firstBiz(S);
      const rush = Math.round(costOf(biz) * 0.9);
      return {
        key: 'ev_biz_supplier_fails', category: 'business',
        title: `Your Main Supplier Has Gone Bust`,
        text: `The supplier ${biz.name} depends on has gone bust overnight — the phones are dead, the warehouse is locked, and your next delivery is not coming. Your shelves and your schedule both have a hole in them.`,
        choices: [
          {
            label: `Pay a rush supplier ${formatMoney(rush, S.country)} to cover the gap`,
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              const amt = Math.round(costOf(b) * 0.9);
              if (st.money.cash < amt) {
                shiftRevenue(b, 0.9); shiftRepeatRate(b, -0.04);
                recordJournal(st, `You could not afford the rush supplier (${formatMoney(amt, st.country)}), so ${b.name} ran short for a month — revenue down, customers annoyed.`, 'business');
                return;
              }
              walletMove(st, -amt, `Rush supplier cover — ${b.name}`, 'business');
              recordJournal(st, `You paid ${formatMoney(amt, st.country)} to a rush supplier to keep ${b.name} stocked after your main supplier went bust.`, 'business');
            },
          },
          {
            label: 'Find a new regular supplier, even if it costs more',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftCost(b, 1.1); shiftRepeatRate(b, -0.02);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              recordJournal(st, `You found a new supplier for ${b.name}, but their prices are 10% higher — monthly costs up for good.`, 'business');
            },
          },
          {
            label: 'Absorb it — sell what you have and wait',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRevenue(b, 0.9); shiftRepeatRate(b, -0.04);
              recordJournal(st, `With no supplier, ${b.name} sold what it had and waited. Revenue down 10%, and some customers went elsewhere.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_key_employee_quits',
    category: 'business',
    repeatable: true,
    cooldownYears: 3,
    gates: { minAge: 19, hasBusiness: true, minEmployees: 2 },
    build: (S, ctx) => {
      const biz = firstStaffedBiz(S);
      const empName = keyEmployeeName(biz);
      const emp = keyEmployee(biz);
      const counter = emp ? Math.round(Number(emp.wageLocal || costOf(biz) * 0.3) * 2) : Math.round(revOf(biz) * 0.25);
      return {
        key: 'ev_biz_key_employee_quits', category: 'business',
        title: `${empName} Is Leaving ${biz.name}`,
        text: `${empName}, the person who holds ${biz.name} together — the one customers ask for by name — has been offered a job elsewhere, for more money. They are giving you one chance to keep them.`,
        choices: [
          {
            label: `Counter-offer — pay ${formatMoney(counter, S.country)} to keep them`,
            effect: (st) => {
              const b = firstStaffedBiz(st); if (!b) return;
              const e = keyEmployee(b);
              const name = keyEmployeeName(b);
              const amt = e ? Math.round(Number(e.wageLocal || costOf(b) * 0.3) * 2) : Math.round(revOf(b) * 0.25);
              if (st.money.cash < amt) {
                removeEmployee(b, e); shiftRevenue(b, 0.92); shiftTeamMorale(b, -10);
                recordJournal(st, `You could not afford the counter-offer (${formatMoney(amt, st.country)}), so ${name} left ${b.name}. The team felt it.`, 'business');
                return;
              }
              walletMove(st, -amt, `Counter-offer to keep a key employee — ${b.name}`, 'business');
              if (e) { e.wageLocal = Math.round(Number(e.wageLocal || 0) * 1.2); e.morale = clamp(Number(e.morale ?? 60) + 10); }
              shiftTeamMorale(b, 5);
              recordJournal(st, `You paid ${formatMoney(amt, st.country)} to keep ${keyEmployeeName(b)} at ${b.name} — with a 20% raise. The team noticed.`, 'business');
            },
          },
          {
            label: 'Let them go — nobody is irreplaceable',
            effect: (st) => {
              const b = firstStaffedBiz(st); if (!b) return;
              const e = keyEmployee(b);
              const name = keyEmployeeName(b);
              removeEmployee(b, e); shiftRevenue(b, 0.92); shiftTeamMorale(b, -10);
              recordJournal(st, `${name} left ${b.name}. Revenue down 8% — the customers who asked for them by name stopped coming as often.`, 'business');
            },
          },
          {
            label: 'Promote someone from inside to fill the gap',
            effect: (st) => {
              const b = firstStaffedBiz(st); if (!b) return;
              const e = keyEmployee(b);
              const name = keyEmployeeName(b);
              removeEmployee(b, e);
              const rest = bizStaffList(b);
              if (rest.length) {
                const promoted = rest.slice().sort((a, c) => (Number(a.skill || 0)) - (Number(c.skill || 0)))[0];
                promoted.skill = clamp(Number(promoted.skill || 50) + 10);
                promoted.morale = clamp(Number(promoted.morale ?? 60) + 8);
              }
              shiftRevenue(b, 0.97); shiftTeamMorale(b, 4);
              recordJournal(st, `${name} left ${b.name}, and you promoted from inside instead of hiring outside. The team took it well; revenue dipped only slightly.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_competitor_next_door',
    category: 'business',
    repeatable: true,
    cooldownYears: 2,
    gates: { minAge: 19, hasBusiness: true },
    build: (S, ctx) => {
      const biz = firstBiz(S);
      const invest = Math.round(Number(biz.capitalInvested || revOf(biz) * 6) * 0.2);
      return {
        key: 'ev_biz_competitor_next_door', category: 'business',
        title: `A Competitor Opens Next Door to ${biz.name}`,
        text: `A rival has opened right next door to ${biz.name} — same street, same customers, shiny new sign, opening discounts. Your regulars are already drifting across to look.`,
        choices: [
          {
            label: 'Start a price war — undercut them',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRevenue(b, 0.92); shiftRepeatRate(b, 0.03);
              recordJournal(st, `You undercut the new rival next door to ${b.name}. Revenue down 8% on thinner margins, but you kept your customers.`, 'business');
            },
          },
          {
            label: `Spend ${formatMoney(invest, S.country)} making yours clearly better`,
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              const amt = Math.round(Number(b.capitalInvested || revOf(b) * 6) * 0.2);
              if (st.money.cash < amt) {
                shiftRevenue(b, 0.88); shiftRepeatRate(b, -0.05);
                recordJournal(st, `You could not afford to out-spend the rival (${formatMoney(amt, st.country)}), so ${b.name} lost ground — revenue down 12%.`, 'business');
                return;
              }
              walletMove(st, -amt, `Outfitting to beat a new competitor — ${b.name}`, 'business');
              shiftRevenue(b, 1.05); shiftRepeatRate(b, 0.08);
              recordJournal(st, `You spent ${formatMoney(amt, st.country)} making ${b.name} clearly better than the rival next door. Revenue up 5%, and more customers come back.`, 'business');
            },
          },
          {
            label: 'Ignore them — your regulars will stay',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRevenue(b, 0.88); shiftRepeatRate(b, -0.05);
              recordJournal(st, `You ignored the competitor next door to ${b.name}. They did not ignore you — revenue down 12%, and customers stop coming back.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_tax_inspection',
    category: 'business',
    repeatable: true,
    cooldownYears: 3,
    gates: { minAge: 19, hasBusiness: true, minBusinessAgeMonths: 12 },
    build: (S, ctx) => {
      const biz = firstOldBiz(S);
      const accountant = Math.round(revOf(biz) * 0.12);
      const fine = Math.round(revOf(biz) * 3);
      return {
        key: 'ev_biz_tax_inspection', category: 'business',
        title: `The Tax Office Is Inspecting ${biz.name}`,
        text: `A letter from the tax office: ${biz.name} is being inspected. They want the books, the receipts, the payroll — everything, from the last year. Your records are mostly in order. Mostly.`,
        choices: [
          {
            label: 'Cooperate fully and hand over everything',
            effect: (st) => {
              const b = firstOldBiz(st); if (!b) return;
              const fee = Math.round(revOf(b) * 0.08);
              if (st.money.cash < fee) {
                st.player.vitals.stress = clamp(st.player.vitals.stress + 10);
                recordJournal(st, `The tax inspection of ${b.name} dragged on because you could not pay for help with the paperwork. It ended clean, but it cost you months of worry.`, 'business');
                return;
              }
              walletMove(st, -fee, `Tax inspection paperwork — ${b.name}`, 'business');
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `You cooperated fully with the tax inspection of ${b.name}. It cost ${formatMoney(fee, st.country)} in paperwork and time, and ended clean.`, 'business');
            },
          },
          {
            label: `Hire an accountant for ${formatMoney(accountant, S.country)} to handle it`,
            effect: (st) => {
              const b = firstOldBiz(st); if (!b) return;
              const amt = Math.round(revOf(b) * 0.12);
              if (st.money.cash < amt) {
                st.player.vitals.stress = clamp(st.player.vitals.stress + 8);
                recordJournal(st, `You wanted an accountant for the tax inspection of ${b.name} but could not afford one (${formatMoney(amt, st.country)}), so you faced the inspectors alone.`, 'business');
                return;
              }
              walletMove(st, -amt, `Accountant for a tax inspection — ${b.name}`, 'business');
              shiftRepeatRate(b, 0.02);
              recordJournal(st, `Your accountant handled the tax inspection of ${b.name} for ${formatMoney(amt, st.country)}. Clean books, clean result.`, 'business');
            },
          },
          {
            label: 'Hide the messy records and hope they do not look',
            effect: (st) => {
              const b = firstOldBiz(st); if (!b) return;
              if (chance(st, 0.5)) {
                const amt = Math.round(revOf(b) * 3);
                walletMove(st, -amt, `Tax fine after an inspection — ${b.name}`, 'business');
                shiftRepeatRate(b, -0.1);
                st.player.vitals.stress = clamp(st.player.vitals.stress + 10);
                recordJournal(st, `The inspectors found the hidden records at ${b.name} and fined you ${formatMoney(amt, st.country)}. Customers stay away after that.`, 'business');
              } else {
                st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
                recordJournal(st, `You hid the messy records and the inspectors never looked twice at ${b.name}. You got away with it — this time.`, 'business');
              }
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_expand_chance',
    category: 'business',
    repeatable: true,
    cooldownYears: 3,
    gates: { minAge: 19, hasBusiness: true, belowMaxLevel: true },
    build: (S, ctx) => {
      const biz = firstBelowMaxBiz(S);
      const expandCost = Math.round(Number(biz.capitalInvested || revOf(biz) * 6) * 0.55);
      const cheapCost = Math.round(Number(biz.capitalInvested || revOf(biz) * 6) * 0.4);
      return {
        key: 'ev_biz_expand_chance', category: 'business',
        title: `The Unit Next to ${biz.name} Is Free`,
        text: `The unit next door to ${biz.name} has come free — same footfall, no new landlord to learn, and the owner will do a deal this month only. It is the obvious way to grow, if you have the money.`,
        choices: [
          {
            label: `Expand now — ${formatMoney(expandCost, S.country)}`,
            effect: (st) => {
              const b = firstBelowMaxBiz(st); if (!b) return;
              const amt = Math.round(Number(b.capitalInvested || revOf(b) * 6) * 0.55);
              if (st.money.cash < amt) {
                recordJournal(st, `You wanted to expand ${b.name} into the free unit next door, but ${formatMoney(amt, st.country)} was more than you had. The unit went to someone else.`, 'business');
                return;
              }
              walletMove(st, -amt, `Expanded ${b.name} into the next unit`, 'business');
              b.level = Math.min(Number(b.maxLevel || 5), Number(b.level || 1) + 1);
              b.capitalInvested = Number(b.capitalInvested || 0) + amt;
              shiftRevenue(b, 1.42); shiftCost(b, 1.32); shiftRepeatRate(b, 0.06);
              recordJournal(st, `You expanded ${b.name} into the unit next door for ${formatMoney(amt, st.country)} — level ${b.level}, revenue up 42%.`, 'business');
            },
          },
          {
            label: 'Negotiate — try to get it cheaper',
            effect: (st) => {
              const b = firstBelowMaxBiz(st); if (!b) return;
              const amt = Math.round(Number(b.capitalInvested || revOf(b) * 6) * 0.4);
              if (chance(st, 0.5)) {
                if (st.money.cash < amt) {
                  recordJournal(st, `The owner of the next unit agreed a cheaper price for ${b.name}, but you still could not pay ${formatMoney(amt, st.country)}. The deal died.`, 'business');
                  return;
                }
                walletMove(st, -amt, `Expanded ${b.name} into the next unit (negotiated)`, 'business');
                b.level = Math.min(Number(b.maxLevel || 5), Number(b.level || 1) + 1);
                b.capitalInvested = Number(b.capitalInvested || 0) + amt;
                shiftRevenue(b, 1.42); shiftCost(b, 1.32); shiftRepeatRate(b, 0.06);
                recordJournal(st, `You talked the owner down and expanded ${b.name} for ${formatMoney(amt, st.country)} — level ${b.level}, revenue up 42%.`, 'business');
              } else {
                recordJournal(st, `You tried to talk the owner down on the unit next to ${b.name}. They sold it to someone else while you were haggling.`, 'business');
              }
            },
          },
          {
            label: 'Leave it — the business is big enough for now',
            effect: (st) => {
              const b = firstBelowMaxBiz(st); if (!b) return;
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You let the free unit next to ${b.name} go. The business is big enough for now.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_fire_flood',
    category: 'business',
    repeatable: true,
    cooldownYears: 4,
    gates: { minAge: 19, hasBusiness: true, hasPremises: true },
    build: (S, ctx) => {
      const biz = firstPremisesBiz(S);
      const repair = Math.round(Number(biz.capitalInvested || revOf(biz) * 6) * 0.15);
      const loss = Math.round(revOf(biz) * 0.2);
      return {
        key: 'ev_biz_fire_flood', category: 'business',
        title: `Fire at ${biz.name}`,
        text: `A fire broke out at ${biz.name} overnight — faulty wiring, the fire crew says. The stock is soaked, the fittings are blackened, and the premises will not trade properly until it is fixed. You lost about ${formatMoney(loss, S.country)} of stock in the night.`,
        choices: [
          {
            label: `Pay ${formatMoney(repair, S.country)} and repair it properly`,
            effect: (st) => {
              const b = firstPremisesBiz(st); if (!b) return;
              const amt = Math.round(Number(b.capitalInvested || revOf(b) * 6) * 0.15);
              const stockLoss = Math.round(revOf(b) * 0.2);
              walletMove(st, -stockLoss, `Stock lost in a fire — ${b.name}`, 'business');
              if (st.money.cash < amt) {
                b.premises.conditionPct = Math.max(5, Math.round(Number(b.premises.conditionPct ?? 90) - 30));
                shiftRevenue(b, 0.9); shiftRepeatRate(b, -0.03);
                recordJournal(st, `You could not afford the full repair (${formatMoney(amt, st.country)}) after the fire at ${b.name}, so it trades damaged — condition down, revenue down 10%.`, 'business');
                return;
              }
              walletMove(st, -amt, `Fire repairs — ${b.name}`, 'business');
              b.premises.conditionPct = 90;
              recordJournal(st, `You paid ${formatMoney(amt, st.country)} to repair ${b.name} after the fire. Condition back to 90%, and it trades properly again.`, 'business');
            },
          },
          {
            label: 'Patch it up cheaply and keep trading',
            effect: (st) => {
              const b = firstPremisesBiz(st); if (!b) return;
              const stockLoss = Math.round(revOf(b) * 0.2);
              const patch = Math.round(Number(b.capitalInvested || revOf(b) * 6) * 0.05);
              walletMove(st, -stockLoss, `Stock lost in a fire — ${b.name}`, 'business');
              if (st.money.cash >= patch) {
                walletMove(st, -patch, `Patch-up repairs after a fire — ${b.name}`, 'business');
                b.premises.conditionPct = Math.max(5, Math.min(60, Math.round(Number(b.premises.conditionPct ?? 90) - 15)));
              } else {
                b.premises.conditionPct = Math.max(5, Math.round(Number(b.premises.conditionPct ?? 90) - 30));
              }
              shiftRepeatRate(b, -0.03);
              recordJournal(st, `You patched up ${b.name} cheaply after the fire. It trades, but customers can see the damage.`, 'business');
            },
          },
          {
            label: 'Trade damaged and take the hit',
            effect: (st) => {
              const b = firstPremisesBiz(st); if (!b) return;
              const stockLoss = Math.round(revOf(b) * 0.2);
              walletMove(st, -stockLoss, `Stock lost in a fire — ${b.name}`, 'business');
              b.premises.conditionPct = Math.max(5, Math.round(Number(b.premises.conditionPct ?? 90) - 30));
              shiftRevenue(b, 0.9); shiftRepeatRate(b, -0.03);
              recordJournal(st, `You left ${b.name} damaged after the fire and kept trading. Revenue down 10% — the place looks it.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_loyal_advocate',
    category: 'business',
    repeatable: true,
    cooldownYears: 2,
    gates: { minAge: 19, hasBusiness: true, minRepeatRate: 0.6 },
    build: (S, ctx) => {
      const biz = firstBiz(S);
      return {
        key: 'ev_biz_loyal_advocate', category: 'business',
        title: `A Regular Becomes ${biz.name}'s Loudest Fan`,
        text: `One of your regulars has started bringing friends — then friends of friends. They post about ${biz.name}, defend it in arguments, and tell everyone it is the best. Word of mouth like this cannot be bought.`,
        choices: [
          {
            label: 'Thank them publicly — make them the face of the place',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRevenue(b, 1.08); shiftRepeatRate(b, 0.08);
              recordJournal(st, `You thanked your loudest regular publicly, and ${b.name} gained a following. Revenue up 8%, and more customers come back.`, 'business');
            },
          },
          {
            label: 'Give them a standing discount for bringing people in',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              const disc = Math.round(revOf(b) * 0.02);
              walletMove(st, -disc, `Standing discount for a loyal advocate — ${b.name}`, 'business');
              shiftRevenue(b, 1.05); shiftRepeatRate(b, 0.06);
              recordJournal(st, `You gave your best regular a standing discount at ${b.name}. They brought even more people in.`, 'business');
            },
          },
          {
            label: 'Enjoy it quietly — do nothing different',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRevenue(b, 1.05);
              recordJournal(st, `Word of mouth kept growing for ${b.name} on its own. Revenue up 5%.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_bad_review',
    category: 'business',
    repeatable: true,
    cooldownYears: 2,
    gates: { minAge: 19, hasBusiness: true },
    build: (S, ctx) => {
      const biz = firstBiz(S);
      const comp = Math.round(revOf(biz) * 0.1);
      return {
        key: 'ev_biz_bad_review', category: 'business',
        title: `A Bad Review of ${biz.name} Is Going Around`,
        text: `A furious customer has posted a long, detailed bad review of ${biz.name} — and it is being shared. Some of it is unfair, some of it is not. People are reading it before they decide to come.`,
        choices: [
          {
            label: 'Reply publicly, calmly, and own the fair part',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRepeatRate(b, 0.02);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `You replied to the bad review of ${b.name} calmly and owned the fair part. People respected the honesty.`, 'business');
            },
          },
          {
            label: `Compensate the customer — ${formatMoney(comp, S.country)} and an apology`,
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              const amt = Math.round(revOf(b) * 0.1);
              if (st.money.cash < amt) {
                shiftRepeatRate(b, -0.06); shiftRevenue(b, 0.95);
                recordJournal(st, `You wanted to compensate the angry customer of ${b.name} but could not afford ${formatMoney(amt, st.country)}. The review kept spreading.`, 'business');
                return;
              }
              walletMove(st, -amt, `Compensation after a bad review — ${b.name}`, 'business');
              shiftRepeatRate(b, 0.04);
              recordJournal(st, `You compensated the customer and apologised. They updated the review of ${b.name} — and so did the people sharing it.`, 'business');
            },
          },
          {
            label: 'Ignore it — reviews blow over',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRepeatRate(b, -0.06); shiftRevenue(b, 0.95);
              recordJournal(st, `You ignored the bad review of ${b.name}. It did not blow over — revenue down 5%, and customers stop coming back.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_supplier_cash_discount',
    category: 'business',
    repeatable: true,
    cooldownYears: 2,
    gates: { minAge: 19, hasBusiness: true },
    build: (S, ctx) => {
      const biz = firstBiz(S);
      const upfront = Math.round(costOf(biz) * 3 * 0.85);
      return {
        key: 'ev_biz_supplier_cash_discount', category: 'business',
        title: `A Supplier Offers a Deal for Cash Up Front`,
        text: `Your supplier will sell you three months of stock for ${formatMoney(upfront, S.country)} in cash, today — 15% off the usual price, because they need the money themselves. It is a real saving, if you can spare the cash.`,
        choices: [
          {
            label: `Pay ${formatMoney(upfront, S.country)} now and take the discount`,
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              const amt = Math.round(costOf(b) * 3 * 0.85);
              if (st.money.cash < amt) {
                recordJournal(st, `The supplier's cash discount would have saved ${b.name} real money, but ${formatMoney(amt, st.country)} up front was more than you had.`, 'business');
                return;
              }
              walletMove(st, -amt, `Three months of stock, cash up front — ${b.name}`, 'business');
              shiftCost(b, 0.95);
              recordJournal(st, `You paid ${formatMoney(amt, st.country)} up front for three months of stock at ${b.name}. Monthly costs down 5% — the supplier now treats you as a serious customer.`, 'business');
            },
          },
          {
            label: 'Negotiate — push for 20% off instead',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              if (chance(st, 0.5)) {
                const amt = Math.round(costOf(b) * 3 * 0.8);
                if (st.money.cash < amt) {
                  recordJournal(st, `The supplier agreed 20% off for ${b.name}, but you could not pay ${formatMoney(amt, st.country)} up front. The offer lapsed.`, 'business');
                  return;
                }
                walletMove(st, -amt, `Three months of stock, cash up front (negotiated) — ${b.name}`, 'business');
                shiftCost(b, 0.92);
                recordJournal(st, `You talked the supplier to 20% off and paid ${formatMoney(amt, st.country)} up front for ${b.name}. Monthly costs down 8%.`, 'business');
              } else {
                shiftCost(b, 1.03);
                recordJournal(st, `You pushed for 20% off and the supplier walked away from ${b.name} — and put their prices up 3% for the trouble.`, 'business');
              }
            },
          },
          {
            label: 'Decline — keep the cash for something else',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              recordJournal(st, `You turned down the supplier's cash discount for ${b.name}. The cash stayed in your pocket; the saving stayed on the table.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_employee_raise',
    category: 'business',
    repeatable: true,
    cooldownYears: 2,
    gates: { minAge: 19, hasBusiness: true, minEmployees: 1 },
    build: (S, ctx) => {
      const biz = firstStaffedBiz(S);
      const empName = keyEmployeeName(biz);
      return {
        key: 'ev_biz_employee_raise', category: 'business',
        title: `${empName} Asks for a Raise`,
        text: `${empName} has come to you at ${biz.name} and asked, plainly, for more money. They say the work has grown, the hours have grown, and other places are paying more. They are not threatening to leave — yet.`,
        choices: [
          {
            label: 'Grant it — a 15% raise',
            effect: (st) => {
              const b = firstStaffedBiz(st); if (!b) return;
              const e = keyEmployee(b);
              if (e) { e.wageLocal = Math.round(Number(e.wageLocal || 0) * 1.15); e.morale = clamp(Number(e.morale ?? 60) + 15); }
              else { shiftCost(b, 1.05); }
              shiftTeamMorale(b, 5); shiftRepeatRate(b, 0.01);
              recordJournal(st, `You gave ${keyEmployeeName(b)} a 15% raise at ${b.name}. The whole team heard about it.`, 'business');
            },
          },
          {
            label: 'Refuse — the business cannot afford it',
            effect: (st) => {
              const b = firstStaffedBiz(st); if (!b) return;
              const name = keyEmployeeName(b);
              shiftTeamMorale(b, -15);
              if (chance(st, 0.35)) {
                const e = keyEmployee(b);
                removeEmployee(b, e); shiftRevenue(b, 0.95);
                recordJournal(st, `You refused ${name} a raise at ${b.name}. They handed in their notice a week later.`, 'business');
              } else {
                recordJournal(st, `You refused ${name} a raise at ${b.name}. They stayed — unhappily.`, 'business');
              }
            },
          },
          {
            label: 'Meet halfway — a 7% raise now, review in six months',
            effect: (st) => {
              const b = firstStaffedBiz(st); if (!b) return;
              const e = keyEmployee(b);
              if (e) { e.wageLocal = Math.round(Number(e.wageLocal || 0) * 1.07); e.morale = clamp(Number(e.morale ?? 60) + 5); }
              else { shiftCost(b, 1.02); }
              shiftTeamMorale(b, 2);
              recordJournal(st, `You met ${keyEmployeeName(b)} halfway at ${b.name}: 7% now, review in six months. They accepted.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_festival_rush',
    category: 'business',
    repeatable: true,
    cooldownYears: 2,
    gates: { minAge: 19, hasBusiness: true },
    build: (S, ctx) => {
      const biz = firstBiz(S);
      const takings = Math.round(revOf(biz) * 1.5);
      const tempCost = Math.round(revOf(biz) * 0.5);
      return {
        key: 'ev_biz_festival_rush', category: 'business',
        title: `A Festival Is Bringing a Rush to your city`,
        text: `A big local festival is coming to your city this week — crowds, visitors, and money to be made, right past the door of ${biz.name}. Everyone else on the street is staying open late. The question is whether you can handle the rush.`,
        choices: [
          {
            label: `Open extra hours and take the rush — about ${formatMoney(takings, S.country)} extra`,
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              const amt = Math.round(revOf(b) * 1.5);
              walletMove(st, amt, `Festival week takings — ${b.name}`, 'business');
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              shiftRepeatRate(b, 0.03);
              recordJournal(st, `You opened extra hours for the festival and ${b.name} took about ${formatMoney(amt, st.country)} extra. Exhausting — and worth it.`, 'business');
            },
          },
          {
            label: `Hire temporary help for ${formatMoney(tempCost, S.country)} and take even more`,
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              const amt = Math.round(revOf(b) * 0.5);
              if (st.money.cash < amt) {
                const takings = Math.round(revOf(b) * 1.5);
                walletMove(st, takings, `Festival week takings — ${b.name}`, 'business');
                st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
                recordJournal(st, `You could not afford temporary help (${formatMoney(amt, st.country)}), so you worked the festival rush at ${b.name} yourself — and still took the extra takings.`, 'business');
                return;
              }
              walletMove(st, -amt, `Temporary festival staff — ${b.name}`, 'business');
              walletMove(st, Math.round(revOf(b) * 2), `Festival week takings with extra staff — ${b.name}`, 'business');
              shiftRepeatRate(b, 0.04);
              recordJournal(st, `Temporary help let ${b.name} serve the whole festival crowd — double a normal month's takings, after the wages.`, 'business');
            },
          },
          {
            label: 'Close early — the rush is not worth the chaos',
            effect: (st) => {
              const b = firstBiz(st); if (!b) return;
              shiftRepeatRate(b, -0.02);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You closed ${b.name} early during the festival. The street was packed; your regulars noticed you were not there.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_break_in',
    category: 'business',
    repeatable: true,
    cooldownYears: 3,
    gates: { minAge: 19, hasBusiness: true, hasPremises: true },
    build: (S, ctx) => {
      const biz = firstPremisesBiz(S);
      const loss = Math.round(revOf(biz) * 0.08);
      const security = Math.round(Number(biz.capitalInvested || revOf(biz) * 6) * 0.05);
      return {
        key: 'ev_biz_break_in', category: 'business',
        title: `A Break-In at ${biz.name}`,
        text: `You arrived at ${biz.name} to find the back door forced and the place turned over. About ${formatMoney(loss, S.country)} of stock and cash is gone, and the premises itself is damaged. The police took a statement and left.`,
        choices: [
          {
            label: 'Report it properly and claim what you can',
            effect: (st) => {
              const b = firstPremisesBiz(st); if (!b) return;
              const amt = Math.round(revOf(b) * 0.08);
              walletMove(st, -amt, `Stock and cash stolen in a break-in — ${b.name}`, 'business');
              b.premises.conditionPct = Math.max(5, Math.round(Number(b.premises.conditionPct ?? 90) - 10));
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              recordJournal(st, `A break-in at ${b.name} cost about ${formatMoney(amt, st.country)} in stock and cash, and left the premises damaged. The police have a report number and nothing else.`, 'business');
            },
          },
          {
            label: `Spend ${formatMoney(security, S.country)} on proper security — shutters, alarms, a safe`,
            effect: (st) => {
              const b = firstPremisesBiz(st); if (!b) return;
              const amt = Math.round(Number(b.capitalInvested || revOf(b) * 6) * 0.05);
              const lossAmt = Math.round(revOf(b) * 0.08);
              walletMove(st, -lossAmt, `Stock and cash stolen in a break-in — ${b.name}`, 'business');
              if (st.money.cash < amt) {
                b.premises.conditionPct = Math.max(5, Math.round(Number(b.premises.conditionPct ?? 90) - 10));
                recordJournal(st, `After the break-in at ${b.name} you wanted proper security (${formatMoney(amt, st.country)}) but could not pay for it yet.`, 'business');
                return;
              }
              walletMove(st, -amt, `Security upgrade after a break-in — ${b.name}`, 'business');
              b.premises.secured = true;
              b.premises.conditionPct = Math.max(5, Math.round(Number(b.premises.conditionPct ?? 90) - 5));
              shiftRepeatRate(b, 0.02);
              recordJournal(st, `After the break-in you spent ${formatMoney(amt, st.country)} securing ${b.name} — shutters, alarms, a safe. Customers noticed.`, 'business');
            },
          },
          {
            label: 'Absorb the loss and carry on',
            effect: (st) => {
              const b = firstPremisesBiz(st); if (!b) return;
              const amt = Math.round(revOf(b) * 0.08);
              walletMove(st, -amt, `Stock and cash stolen in a break-in — ${b.name}`, 'business');
              b.premises.conditionPct = Math.max(5, Math.round(Number(b.premises.conditionPct ?? 90) - 10));
              shiftRepeatRate(b, -0.02);
              recordJournal(st, `You absorbed the break-in at ${b.name} without a fuss — ${formatMoney(amt, st.country)} gone, premises damaged, no changes made.`, 'business');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_biz_new_regulation',
    category: 'business',
    repeatable: true,
    cooldownYears: 3,
    gates: { minAge: 19, hasBusiness: true, minBusinessAgeMonths: 6 },
    build: (S, ctx) => {
      const biz = firstOldBiz(S);
      const comply = Math.round(revOf(biz) * 0.2);
      const fine = Math.round(revOf(biz) * 2);
      return {
        key: 'ev_biz_new_regulation', category: 'business',
        title: `A New Regulation Hits ${biz.name}`,
        text: `A new regulation has come in — new licences, new safety checks, new paperwork — and every business like ${biz.name} has to comply. The cost lands this month, and the inspectors will be checking.`,
        choices: [
          {
            label: `Comply properly — ${formatMoney(comply, S.country)} now, costs up 8%`,
            effect: (st) => {
              const b = firstOldBiz(st); if (!b) return;
              const amt = Math.round(revOf(b) * 0.2);
              if (st.money.cash < amt) {
                shiftCost(b, 1.15);
                st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
                recordJournal(st, `You could not pay the ${formatMoney(amt, st.country)} to comply with the new regulation at ${b.name} cleanly — the work was done late and badly, and costs rose 15%.`, 'business');
                return;
              }
              walletMove(st, -amt, `Compliance with a new regulation — ${b.name}`, 'business');
              shiftCost(b, 1.08);
              recordJournal(st, `You complied with the new regulation at ${b.name} properly: ${formatMoney(amt, st.country)} now, and monthly costs up 8% for good.`, 'business');
            },
          },
          {
            label: 'Delay it — lobby with other owners for more time',
            effect: (st) => {
              const b = firstOldBiz(st); if (!b) return;
              if (chance(st, 0.5)) {
                shiftCost(b, 1.04);
                recordJournal(st, `You and the other owners bought ${b.name} more time on the new regulation — costs up only 4% in the end.`, 'business');
              } else {
                shiftCost(b, 1.15);
                st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
                recordJournal(st, `The delay campaign failed and ${b.name} had to comply in a rush — costs up 15%.`, 'business');
              }
            },
          },
          {
            label: 'Cut corners and hope nobody checks',
            effect: (st) => {
              const b = firstOldBiz(st); if (!b) return;
              if (chance(st, 0.4)) {
                const amt = Math.round(revOf(b) * 2);
                walletMove(st, -amt, `Fine for cutting corners on a new regulation — ${b.name}`, 'business');
                shiftRepeatRate(b, -0.08);
                st.player.vitals.stress = clamp(st.player.vitals.stress + 8);
                recordJournal(st, `The inspectors caught ${b.name} cutting corners on the new regulation: a ${formatMoney(amt, st.country)} fine and a damaged name.`, 'business');
              } else {
                st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
                recordJournal(st, `You cut corners on the new regulation at ${b.name} and nobody checked. The worry stayed with you.`, 'business');
              }
            },
          },
        ],
      };
    },
  },
];
