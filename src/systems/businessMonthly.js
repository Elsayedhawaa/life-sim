import{settleCompetitionMonth}from'./companyCompetition.js';
import{applyReceivables}from'./companyReceivables.js';
import{computeCompanyMonth}from './companyLifecycle.js';
import{computeTechMonth}from './techStartup.js';
import{tickBusinessSafety}from './businessSafety.js';
/* ============================================================================
   v2.14 — ONE monthly P&L for a business, with everything folded in.
   computeBusinessMonth (businessEngine.js) stays the BASE P&L — it must
   stay base-only, because the worker verify scripts measure against it
   (W3's promised-vs-actual test calls it, then folds manually; W5's
   reinvest test consumes the boost manually). This wrapper is the only
   place the monthly settlement gets its numbers from, so the ledger,
   the business card (lastPL) and the history all see the SAME folded
   numbers — never base in one place and folded in another.

   Fold order (each step is documented where it comes from):
   1. Manager morale moves the team BEFORE the base P&L — exactly the
      way W2's simMonth measures it (moraleDelta applied to staff, then
      the P&L's teamMoraleFactor reads the shifted morale).
   2. Base P&L — manager wage (pl.manager) and the unmanaged
      multiplier are already inside; the wave uses the pre-verdict
      repeat rate (W3: the P&L wave must run before this month's critic /
      competition verdict lands).
   3. Manager skill/policy multiplier on revenue (W2).
   4. Policy variance — ONE extra rand draw, same pattern as W2's
      measurement. Skipped entirely when variance is 0 (no manager),
      so the rng stream is untouched for managerless businesses and
      old test traces are unaffected.
   5. Growth reinvestment is a real cost (W2's costDelta = wage +
      reinvestment; the wage is already pl.manager, so ONLY the
      reinvestment part is added here — adding costDelta whole would
      charge the salary twice).
   6. Per-industry decisions (W3's fold: revenueMult first, then
      deltas; recomputes profit/tax/net).
   7. Franchise royalties are a revenue line (W5).
   8. Reinvest boost (W5): next month's revenue ×boost, one month
      only — consumed here, so a second call in the same month finds
      nothing left to consume.
   9. Harvest cash-out (W2): real money taken out of the business's
      capital — the business is milked, so its capital (and therefore
      its valuation) falls by the same amount. Capped at the capital
      left: you cannot take out more than the business is worth. The
      settlement posts pl.harvestOut as its own income line.
   9.5. v2.17 W2 — the supply chain: buying in bulk cuts the BASE
      other-costs line (captured right after the base P&L, before
      decisions/shocks add to it) for every member of a group, by the
      group's bulk discount. No group -> no discount, nothing changes.
   9.6. v2.17 W2 — group costs, parent only: the head office and the
      regional manager's wage are real P&L lines the parent pays; the
      branches pay nothing for them, they just gain.
   9.7. v2.17 W2 — monthEffects (the W3/W4 contract): biz.monthEffects
      is a plain object stamped by role/operation actions during the
      month. Application order — base revenue (fully folded through
      steps 2–9.6) x revenueMult + revenueAdd; costs += costAdd (into
      pl.other, so the breakdown stays honest); repeatRate +=
      repeatRateDelta in the ONE place W1 established (after the final
      net identity, below); morale += moraleDelta on the staff;
      notes appended to the P&L breakdown. Read once at the top, so a
      second fold call in the same month shows the same effect; the
      object itself is cleared after the month settles (step 11), so
      an effect never lands twice.
   3.5. v2.17 W2 — brand + regional manager move revenue: the fully
      folded revenue so far x brandRevenueMult x regionalManagerMult.
      A new business's brand is exactly 1,000, so its brand mult is
      exactly 1.00 and nothing changes for it; a group has no regional
      manager until it breaks out, so its mult is 1.00 too.
   3.6. v2.17 W2 — the market can turn: one hash roll a month, only
      from the business's second settled month (a new business's first
      month is its opening, and the old exact fold tests measure that
      month). The roll is a hash of (business id, month) — it draws
      nothing from the shared rng stream, so it never shifts the wave
      sequence other systems measure. Under 1.5% a severe month
      (revenue x0.50, something breaks: +25% of monthlyCost); under
      7.5% a slump starts (3 months at revenue x0.75). Guarded like
      the other state-changing bits, so a second call in the same
      month never re-rolls it.
   10. Final identity: profit = revenue − costs; tax from the
      country's own brackets on the folded profit; net = profit − tax.
      The folded pl is the SAME object computeBusinessMonth stored as
      lastPL / history, so the card and the history show folded numbers.
   11. v2.17 W2 — the outcome, once a month (guarded): retained
      earnings += net (months of losses eat the capital — equity =
      capitalInvested + retainedEarnings); brand value moves with the
      month (applyBrandMonth); a losing month wears the team down
      (morale −3 each, managed businesses only — unmanaged ones already
      lose 6 to the unmanaged decay); a business meeting all five
      breakout conditions becomes a group; distress warnings, then
      death (checkDistressAndDeath) — a dead business settles a zero
      P&L from then on (the early return at the top), so the
      settlement never posts for it again.

   State-changing bits (morale, harvest capital) are guarded by
   biz._monthlyFoldMonth so a second call in the same month never
   applies them twice.
   ========================================================================== */

import { rand, clamp } from '../core/rng.js';
import { computeBusinessMonth, computeBusinessTax, businessMonthIndex } from './businessEngine.js';
import { applyManagerEffects } from './businessManager.js';
import { applyDecisionEffects, foldDecisionEffectsIntoPL } from './businessDecisions.js';
import { applyOperationsEffects } from './businessOperations.js';
import { franchiseIncome, reinvestBoost, consumeReinvestBoost } from './businessExits.js';
import { businessIsManaged } from './businessCapacity.js';
import {
  ensureGrowthState, brandRevenueMult, regionalManagerRevenueMult, regionalManagerWage,
  headOfficeCost, supplyChainDiscount, groupBrandValue, applyBrandMonth,
  applyMarketShock, checkDistressAndDeath, breakoutCheck, formGroup, readMonthEffects,
  LOSING_MONTH_MORALE_DROP
} from './businessGrowth.js';

function computeBusinessMonthOperating(S, biz, opts = {}) {
  if (!biz) return null;
  const monthIdx = businessMonthIndex(S);
  const alreadyFoldedThisMonth = biz._monthlyFoldMonth === monthIdx;
  ensureGrowthState(S, biz);
  /* v2.17 W2 — a dead business settles nothing any more: a zero P&L,
     so the settlement posts no lines for it (addIncome ignores 0) and
     the miss/debt chain never touches it again. */
  if (biz.dead) {
    const deadPl = {
      year: S.year, month: S.month, name: biz.name, typeId: biz.typeId,
      revenue: 0, rent: 0, wages: 0, other: 0, remote: 0, manager: 0, costs: 0, profit: 0, tax: 0,
      taxLabel: 'No tax — the business is closed', net: 0, wave: 0, dead: true,
      repeatRate: Number((Number(biz.repeatRate ?? 0.5)).toFixed(3))
    };
    biz.lastPL = deadPl;
    return deadPl;
  }
  if(biz.enterprise)return computeCompanyMonth(S,biz,computeBusinessTax,businessIsManaged(S,biz),opts.worldRevenueMult||1);
  if(biz.tech)return computeTechMonth(S,biz,computeBusinessTax,businessIsManaged(S,biz),opts.worldRevenueMult||1);
  /* v2.17 merge — W4's settlement-resolved operations effects (stock
     deliveries, prices, stock on hand) merge into biz.monthEffects
     BEFORE the snapshot below, so the fold at step 5.5 reads them
     exactly once together with the action-stamped effects. Calling
     foldMonthEffectsIntoPL here as well would apply them twice, so
     it is deliberately NOT called — step 5.5 is the one application.
     opts.ops (e.g. { forceDelivery }) rides through to
     applyOperationsEffects for deterministic testing; real play
     never sets it. */
  applyOperationsEffects(S, biz, opts.ops || {});
  /* v2.17 W2 — the monthEffects for this month, read once up front. */
  const me = readMonthEffects(biz);

  /* 1. Manager morale moves the team before the base P&L. */
  const mfx = applyManagerEffects(S, biz);
  if (mfx.moraleDelta !== 0 && !alreadyFoldedThisMonth) {
    for (const e of (biz.staff || [])) {
      e.morale = clamp(Math.round(Number(e.morale) || 0) + mfx.moraleDelta, 5, 100);
    }
  }

  /* 2. Base P&L. */
  const pl = computeBusinessMonth(S, biz);
  const safeguards=tickBusinessSafety(S,biz);pl.revenue=Math.round(pl.revenue*safeguards.revMult);pl.other+=safeguards.cost;pl.costs+=safeguards.cost;pl.safetyCost=safeguards.cost;pl.safetyNotes=safeguards.notes;
  /* v2.17 W2 — the BASE other-costs line, captured before decisions
     (step 6), shocks (step 3.6) or monthEffects (step 5.5) add to it:
     the supply-chain discount (step 9.5) cuts only this line, never a
     decision's cost or a breakdown. */
  const otherBase = Number(pl.other) || 0;

  /* v2.15 W4 — world events move business revenue: the one multiplier
     input (opts.worldRevenueMult, 1 when nothing is active). It lands on
     revenue here, before the manager/decision folds, so the final net
     identity in step 10 still holds exactly. */
  const worldMult = Number(opts.worldRevenueMult) || 1;
  if (worldMult !== 1) {
    pl.revenue = Math.round(pl.revenue * worldMult);
    pl.worldEventRevenueMult = worldMult;
  }

  /* 3. Manager skill/policy multiplier. */
  if (mfx.revenueMult !== 1) pl.revenue = Math.round(pl.revenue * mfx.revenueMult);

  /* 3.5. v2.17 W2 — brand + regional manager move revenue. A new
     business's brand is exactly 1,000 (mult 1.00); no group means no
     regional manager (mult 1.00). Recorded on the P&L so the card can
     say what the name is worth. */
  const brandMult = brandRevenueMult(S, biz);
  const regionalMult = regionalManagerRevenueMult(S, biz);
  if (brandMult !== 1 || regionalMult !== 1) {
    pl.revenue = Math.round(pl.revenue * brandMult * regionalMult);
  }
  pl.brandRevenueMult = Number(brandMult.toFixed(4));
  pl.regionalManagerMult = Number(regionalMult.toFixed(4));
  pl.groupBrandValue = groupBrandValue(S, biz);

  /* 3.6. v2.17 W2 — the market can turn (guarded: one roll a month). */
  if (!alreadyFoldedThisMonth) {
    applyMarketShock(S, biz, pl);
  }

  /* 4. Policy variance — skipped when 0 (no manager), rng untouched. */
  if (mfx.revenueVariance > 0) {
    pl.revenue = Math.round(pl.revenue * (1 + (rand(S) - 0.5) * 2 * mfx.revenueVariance));
  }

  /* 5. Growth reinvestment is a cost (wage already in pl.manager). */
  if (mfx.reinvestAmount > 0) {
    pl.reinvest = mfx.reinvestAmount;
    pl.costs += mfx.reinvestAmount;
  }

  /* 5.5. v2.17 W2 — monthEffects (W3/W4 contract), here — on the
     business's OWN takings, BEFORE the decision fold (step 6) and
     the reinvest boost (step 8): revenue x revenueMult + revenueAdd;
     costs += costAdd (into pl.other, so the breakdown stays honest);
     notes onto the P&L breakdown. repeatRateDelta and moraleDelta
     land in their own guarded places below (step 10's repeat block,
     step 11). Absent monthEffects = all defaults = no change at all.
     ORDER MATTERS (v2.17 merge fix): the role effects describe what
     the staff did for the business's own sales, so they must land
     before a decision's promised flat amount and before the boost —
     applied after them, the role multiplier scaled the promise (a
     promised +66,996 settled as +67,238) and the flat role add broke
     the reinvest ×1.25 ratio (1.2593). */
  if (me.revenueMult !== 1) pl.revenue = Math.round(pl.revenue * me.revenueMult);
  if (me.revenueAdd !== 0) pl.revenue = Math.max(0, Math.round(pl.revenue + me.revenueAdd));
  if (me.costAdd !== 0) {
    /* v2.20 I3 — ONE cost identity: costs = rent + wages + other +
       remote + manager + reinvest + headOffice + regionalManager −
       staffSavings (− supplyChainSaving). A negative costAdd (staff
       saving money — a tight till, a careful bookkeeper) is its own
       "Staff savings" line, never a floor on other: the old
       max(0, other + delta) kept the full negative delta in costs
       while other stopped at 0, so costs fell BELOW the visible rows
       (kiosk: pl.costs 5,335 vs visible 5,379). A positive costAdd
       lands in other, as before — never floored. */
    if (me.costAdd < 0) {
      pl.staffSavings = (Number(pl.staffSavings) || 0) + (-me.costAdd);
      pl.costs = (Number(pl.costs) || 0) + me.costAdd;
    } else {
      pl.other = (Number(pl.other) || 0) + me.costAdd;
      pl.costs = (Number(pl.costs) || 0) + me.costAdd;
    }
  }
  if (me.notes.length > 0) {
    pl.monthEffectNotes = [...(pl.monthEffectNotes || []), ...me.notes];
    pl.monthEffectsApplied = true;
  } else if (me.revenueMult !== 1 || me.revenueAdd !== 0 || me.costAdd !== 0 || me.repeatRateDelta !== 0 || me.moraleDelta !== 0) {
    pl.monthEffectsApplied = true;
  }

  /* 6. Per-industry decisions (W3's fold, in place). */
  const eff = applyDecisionEffects(S, biz);
  foldDecisionEffectsIntoPL(S, pl, eff);

  /* 7. Franchise royalties are revenue. */
  const fr = franchiseIncome(S, biz);
  if (fr > 0) {
    pl.revenue += fr;
    pl.franchise = fr;
  }

  /* 8. Reinvest boost — consumed here, one month only. */
  const boost = consumeReinvestBoost(S, biz);
  if (boost !== 1) {
    pl.revenue = Math.round(pl.revenue * boost);
    pl.reinvestBoost = boost;
  }

  /* 9. Harvest cash-out comes out of the business's capital. */
  if (mfx.harvestCashOut > 0 && !alreadyFoldedThisMonth) {
    const paid = Math.min(mfx.harvestCashOut, Math.max(0, Math.round(Number(biz.capitalInvested) || 0)));
    if (paid > 0) {
      pl.harvestOut = paid;
      biz.capitalInvested = Math.max(0, Math.round((Number(biz.capitalInvested) || 0) - paid));
    }
  }

  /* 9.5. v2.17 W2 — the supply chain: buying in bulk cuts the base
     other-costs line for every member of a group. No group, no
     discount. The saving is its own P&L line. */
  const bulkDiscount = supplyChainDiscount(S, biz);
  if (bulkDiscount > 0 && otherBase > 0) {
    const saving = Math.round(otherBase * bulkDiscount);
    if (saving > 0) {
      /* v2.20 I3 — the saving is its own subtractive line
         (pl.supplyChainSaving, rendered on the card), NOT a cut to
         pl.other: the old code cut other AND showed no saving row, so
         the saving was invisible; cutting other while ALSO rendering
         the row would double-count it (costs would sit 684 above the
         visible rows). Other stays the real other-costs bill; costs
         fall by the saving, and the identity holds exactly. No floor
         anywhere (the old max(0, …) on both lines could push costs
         below the visible rows when other was already small). */
      pl.costs = (Number(pl.costs) || 0) - saving;
      pl.supplyChainSaving = saving;
      pl.supplyChainDiscount = bulkDiscount;
    }
  }

  /* 9.6. v2.17 W2 — group costs, parent only: the head office and the
     regional manager's wage are real P&L lines. Branches pay nothing
     for them — their parent pays, and they gain the effect. */
  if (biz.group && !biz.isBranch) {
    const hoCost = headOfficeCost(S, biz);
    const rmWage = regionalManagerWage(S, biz);
    if (hoCost > 0) {
      pl.headOffice = hoCost;
      pl.costs += hoCost;
    }
    if (rmWage > 0) {
      pl.regionalManager = rmWage;
      pl.costs += rmWage;
    }
  }

  /* 9.7. (moved) — monthEffects now land at step 5.5, on the
     business's own takings before the decision fold and the reinvest
     boost; see the note there. Nothing applies here any more. */

  /* 10. Final identity on the folded numbers. v2.20 I3 — the total
     alone is clamped at 0: no component is ever floored, so costs stay
     exactly the sum of the rows the card shows. (A negative total
     would need savings larger than every cost line together; the clamp
     is a safety net for that absurd case, not a rounding rule.) */
  pl.costs = Math.max(0, Math.round(Number(pl.costs) || 0));
  pl.profit = pl.revenue - pl.costs;
  const ti = computeBusinessTax(S, pl.profit);
  pl.tax = ti.tax;
  pl.taxLabel = ti.label;
  pl.net = pl.profit - pl.tax;
  /* v2.17 — THE one place biz.repeatRate moves (0..1, 0.5 neutral):
     the share of customers who come back. Good staff pull it up and
     bad staff pull it down ((avgSkill/100 − 0.5) × 0.04); premium
     prices push some customers away (−0.02) and value prices bring
     some back (+0.01); a profitable month brings people back (+0.01)
     and a losing month loses some (−0.02); a decision that landed
     this month moves it by its own repeatRateDelta (critic, competition,
     supplier, contract, co-founder, slices — decided in
     businessDecisions.js, applied here and nowhere else). Guarded by
     the same monthly flag as the other state-changing bits, so a
     second call in the same month never moves it twice. */
  if (!alreadyFoldedThisMonth) {
    const staff = biz.staff || [];
    const avgSkill = staff.length
      ? staff.reduce((s, st) => s + (Number(st.skill) || 0), 0) / staff.length
      : 50;
    let repeatDelta = ((avgSkill / 100) - 0.5) * 0.04;
    const pricingDir = Number(biz.buffs?.pricingDir || 0);
    if (pricingDir === 1) repeatDelta -= 0.02;
    else if (pricingDir === -1) repeatDelta += 0.01;
    if (pl.net > 0) repeatDelta += 0.01;
    else if (pl.net < 0) repeatDelta -= 0.02;
    repeatDelta += Number(eff.repeatRateDelta) || 0;
    /* v2.17 W2 — monthEffects (W3/W4 contract): their repeat-rate
       delta lands here, in this one place, with everything else. */
    repeatDelta += Number(me.repeatRateDelta) || 0;
    biz.repeatRate = clamp((Number(biz.repeatRate ?? 0.5)) + repeatDelta, 0, 1);
  }
  pl.repeatRate = Number((Number(biz.repeatRate ?? 0.5)).toFixed(3));
  biz._monthlyFoldMonth = monthIdx;
  biz.lastPL = pl;
  /* 11. v2.17 W2 — the outcome, once a month (guarded). A losing
     month wears the team down (morale −3 each) — that is the cascade:
     losses -> morale falls -> revenue falls -> more losses. Retained
     earnings move with the net, the brand moves with the month, the
     monthEffects are cleared so they never land twice, a business
     meeting all five breakout conditions becomes a group, and the
     distress check warns twice before it kills. */
  if (!alreadyFoldedThisMonth) {
    biz.retainedEarnings = Math.round((Number(biz.retainedEarnings) || 0) + pl.net);
    const brandDelta = applyBrandMonth(S, biz, pl);
    pl.brandDelta = brandDelta;
    pl.brandValue = Number(biz.brandValue ?? 1000);
    if (me.moraleDelta !== 0) {
      for (const e of (biz.staff || [])) {
        e.morale = clamp(Math.round(Number(e.morale) || 0) + me.moraleDelta, 5, 100);
      }
    }
    if (pl.net < 0 && businessIsManaged(S, biz)) {
      /* A losing month wears the team down — but only for a business
         that is actually being run. An unmanaged business already
         loses 6 morale a month to the unmanaged decay
         (businessCapacity.js owns that number); charging it another
         3 here would double-count the same neglect, and the v214-w1
         check measures the unmanaged −6 exactly. */
      for (const e of (biz.staff || [])) {
        e.morale = clamp(Math.round(Number(e.morale) || 0) - LOSING_MONTH_MORALE_DROP, 5, 100);
      }
    }
    /* v2.17 merge — the staff who work here move the numbers EVERY
       month, not only in the month they were hired. The role
       contribution (what the current staff do for the business) is
       stamped on hire/fire/train/promote and lives in
       biz._lastRoleEffects; it carries over into next month's
       monthEffects, so a chef hired in January still matters in
       February. Without this, monthEffects were cleared here and
       nothing re-stamped them — the role effect lasted exactly one
       month, and the 12-month skill gap W3 measured never showed up
       in the real settlement (v217-verify 5c). Only the role part
       carries over: the operations effects (marketing, overtime,
       stock, prices) are one-month actions and are gone. The morale
       lift does NOT carry over — it lands once, when the staff
       changes (W3's design; their 12-month harness never re-applies
       it) — so _lastRoleEffects.moraleDelta is zeroed here too, or
       the next stamp would subtract a lift that already landed.
       A business that was never stamped (a hand-built record) carries
       nothing, so the W2 (g) exactness test still measures exactly
       what it sets. */
    const roleCarry = biz._lastRoleEffects;
    if (roleCarry && typeof roleCarry === 'object') {
      biz.monthEffects = {
        revenueMult: Number(roleCarry.revenueMult) || 1,
        revenueAdd: Number(roleCarry.revenueAdd) || 0,
        costAdd: Number(roleCarry.costAdd) || 0,
        repeatRateDelta: Number(roleCarry.repeatRateDelta) || 0,
        moraleDelta: 0,
        notes: [...(roleCarry.notes || [])]
      };
      biz._lastRoleEffects = { ...roleCarry, moraleDelta: 0 };
    } else {
      biz.monthEffects = null; /* cleared — an effect lands once, in its month */
      biz._lastRoleEffects = null;
    }
    if (!biz.group && !biz.isBranch) {
      const bc = breakoutCheck(S, biz);
      if (bc.ok) formGroup(S, biz);
    }
    checkDistressAndDeath(S, biz, pl);
  }
  return pl;
}

export function computeBusinessMonthFull(S,biz,opts={}){if(biz?.receivables?.lastMonth===S.year*12+S.month&&biz.lastPL?.receivables)return biz.lastPL;const pl=computeBusinessMonthOperating(S,biz,opts);if(pl)settleCompetitionMonth(S,biz,pl);return pl?applyReceivables(S,biz,pl,computeBusinessTax):pl;}
