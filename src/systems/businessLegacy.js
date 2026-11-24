import { businessSalvage } from '../data/businessValuation.js';
/* ============================================================================
   World Life 2.11 (W4) — Business Legacy: relocation keep/sell/close,
   remote management, inheritance on death, and the will / heir choice.

   OWNERSHIP: this file owns the per-business legacy mechanics. It does NOT
   own the relocation state machine (that lives in visaMigrationEngine.js,
   which calls into here), the Ventures render (W1, views.js — the
   coordinator wires renderBusinessWillSection / renderWillHeirSection in),
   or the monthly settlement (W1's settleHouseholdMonth — the coordinator
   wires tickRemoteBusinesses(S) into it, one call; see below).

   SHAPE NOTE (v2.10 base + v2.11 contract): the v2.10 base still carries
   ONE business as S.career.business. The v2.11 contract carries a list,
   S.career.businesses[], with S.career.business as a live mirror of
   businesses[0]. Every helper here reads through getBusinesses(S), which
   accepts BOTH shapes, so this file works on the v2.10 base today and on
   the merged v2.11 list tomorrow without changes. A business is never
   kept on a separate list: biz.remote is a flag on the business itself,
   so W1's settlement loop sees remote businesses exactly like local ones.

   REMOTE RULES (coordinator contract, as landed by W1): keeping a
   business after moving abroad sets biz.remote = true and biz.country
   STAYS the origin country. The x0.7 revenue and the monthly manager
   cost are applied by W1's computeBusinessMonth (revMult x0.7, remote
   cost in the P&L) — this file deliberately does NOT cut monthlyRev and
   does NOT charge the wage itself, or the player would be charged
   twice. The manager's wage is recorded here at keep-time
   (biz.remoteManagerWageLocal: highest-paid employee's wage if the
   business has staff, else 15% of monthly revenue) for W1's P&L to read.
   Repeat rate -0.02/month while the player is still abroad is the one
   remote effect W1 does not own: tickRemoteBusinesses(S) below does
   only that, and the coordinator wires it into the monthly settlement
   hook (economyEngine §3, next to W2's monthlyStaffTick). A remote
   business can still be sold or closed at any time afterwards. It is
   NEVER silently sold.

   SALE VALUATION: the money for a sale is ALWAYS paid by Worker 1's
   sellSmallBusiness(S, bizId) (careerEducationEngine.js -> businessEngine
   sellBusiness) — this file never re-implements the valuation formula
   for payment. computeBusinessValuation() below is W1's businessValuation
   itself (0.7 x capital + 2.8 x annual NET profit — revenue minus other
   costs, wages and rent), used ONLY to show the player an estimate in
   the decision text; the amount actually paid is whatever
   sellSmallBusiness credits, read off the cash balance before/after.

   CLOSE / SALVAGE: closing goes through W1's closeBusiness, the game's
   one canonical close path: salvage is 0.5 x capital invested, staff
   are fired through W2's fireAllStaff with country-law severance from
   personal cash, and the player is told in a scene. This file adds no
   second close implementation.

   DEATH / INHERITANCE: transferBusinessesOnDeath(S, continuingChildId)
   runs at the TOP of continueAsChild (healthDirectorEngine.js), BEFORE
   the estate is valued — so a business sold to the estate lands in the
   estate cash and is shared out with everything else. A business with a
   living named heir (biz.heirId, else S.willPlan.primaryHeirId) is
   stashed for delivery; deliverInheritedBusinesses() moves it into the
   continuing child's career.businesses (with a journal line) when the
   heir IS that child, and journals it to the heir otherwise. A business
   with NO living heir is sold at the real valuation and the proceeds go
   to the estate, journalled in both lives. A business NEVER silently
   vanishes on death.
   ========================================================================== */

import { recordJournal, walletMove, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { convertCurrency } from '../data/economy.js';
import { sellSmallBusiness } from './careerEducationEngine.js';
import { businessValuation, closeBusiness as closeBusinessEngine } from './businessEngine.js';

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* The business list, accepting both the v2.10 single-business shape and
   the v2.11 businesses[] shape. Always returns live objects, never copies. */
export function getBusinesses(S) {
  if (!S || !S.career) return [];
  if (Array.isArray(S.career.businesses) && S.career.businesses.length > 0) {
    return S.career.businesses.filter(b => b);
  }
  if (S.career.business) return [S.career.business];
  return [];
}

export function findBusiness(S, bizId) {
  if (!bizId) return null;
  return getBusinesses(S).find(b => b && b.id === bizId) || null;
}

/* Keep the v2.10 mirror (S.career.business) pointing at businesses[0].
   W1 owns the canonical sync; this is the same rule, used after any
   list change made from this file so the old single-business readers
   (ledger, goals, HUD) keep seeing the right business. */
export function syncBusinessListMirror(S) {
  if (!S || !S.career) return;
  const list = getBusinesses(S);
  S.career.business = list.length > 0 ? list[0] : null;
  if (Array.isArray(S.career.businesses)) S.career.businesses = list;
}

export function removeBusinessFromList(S, biz) {
  if (!S || !S.career || !biz) return;
  if (Array.isArray(S.career.businesses)) {
    S.career.businesses = S.career.businesses.filter(b => b && b.id !== biz.id);
  }
  if (S.career.business && S.career.business.id === biz.id) S.career.business = null;
  syncBusinessListMirror(S);
}

/* Estimate ONLY, for display in decision text. This IS W1's
   businessValuation (0.7 x capital + 2.8 x annual NET profit), not a
   second formula — the payment itself always comes from
   sellSmallBusiness. */
export function computeBusinessValuation(biz) {
  if (!biz) return 0;
  return businessValuation(biz);
}

/* Salvage on a close, per W1's canonical close rule: 0.5 x capital. */
export function computeBusinessSalvage(biz) {
  if (!biz) return 0;
  return businessSalvage(biz);
}

/* A local manager's wage: the highest-paid employee's wage when the
   business has staff, else 15% of monthly revenue. Stored on the business
   at keep-time (biz.remoteManagerWageLocal) so the monthly tick charges
   the same figure every month instead of re-deriving it. */
export function remoteManagerWageLocal(S, biz) {
  if (!biz) return 0;
  const staff = Array.isArray(biz.staff) ? biz.staff : [];
  if (staff.length > 0) {
    return Math.max(0, ...staff.map(m => Number(m.wageLocal) || 0));
  }
  return Math.round((Number(biz.monthlyRev) || 0) * 0.15);
}

/* ------------------------------------------------------------------ */
/* Heirs                                                               */
/* ------------------------------------------------------------------ */

/* Eligible heirs, in the order the will offers them:
   living spouse(s), living ADULT children, living parents, living ADULT
   siblings. If NOBODY in those groups is alive and adult, the fallback is
   the eldest living child of any age (the business is held for them until
   they turn 18 — the UI says so). Each entry: { person, relation, adult }.
   Returns [] when nobody is alive in any of those groups — the caller
   must then refuse plainly instead of naming an heir. */
export function listEligibleHeirs(S) {
  if (!S || !S.people) return [];
  const rel = S.relations || {};
  const alive = (id) => (id && S.people[id] && S.people[id].alive ? S.people[id] : null);
  const out = [];
  const seen = new Set();
  const push = (person, relation) => {
    if (!person || seen.has(person.id)) return;
    seen.add(person.id);
    out.push({ person, relation, adult: (Number(person.age) || 0) >= 18 });
  };

  for (const id of (rel.spouseIds || [])) push(alive(id), 'spouse');
  const adultChildren = [];
  const allChildren = [];
  for (const id of (rel.childIds || [])) {
    const ch = alive(id);
    if (!ch) continue;
    allChildren.push(ch);
    if ((Number(ch.age) || 0) >= 18) adultChildren.push(ch);
  }
  adultChildren.sort((a, b) => (Number(b.age) || 0) - (Number(a.age) || 0));
  for (const ch of adultChildren) push(ch, 'child');
  push(alive(rel.fatherId), 'father');
  push(alive(rel.motherId), 'mother');
  for (const id of (rel.siblingIds || [])) {
    const sib = alive(id);
    if (sib && (Number(sib.age) || 0) >= 18) push(sib, 'sibling');
  }

  const adults = out.filter(e => e.adult);
  if (adults.length > 0) return adults;
  /* No living adult in any group: eldest living child, held in trust. */
  allChildren.sort((a, b) => (Number(b.age) || 0) - (Number(a.age) || 0));
  if (allChildren.length > 0) return [{ person: allChildren[0], relation: 'child', adult: false }];
  return [];
}

export function heirDisplayName(S, personId) {
  const p = personId && S.people ? S.people[personId] : null;
  return p ? (p.fullName || p.firstName || 'Unnamed') : null;
}

/* Name the heir for ONE business (from the business card). Also sets the
   will's primary heir, so the business card and the will can never
   disagree: one heir, named in one place, honoured everywhere. Naming an
   heir drafts the will if none is drafted yet. */
export function setBusinessHeir(S, biz, personId) {
  ensureExtendedState(S);
  if (!biz) return { ok: false, msg: 'No business found.' };
  const eligible = listEligibleHeirs(S);
  const match = eligible.find(e => e.person.id === personId);
  if (!match) {
    if (eligible.length === 0) {
      return { ok: false, msg: 'Nobody is eligible to inherit — no living spouse, child, parent or sibling. The business will be sold to the estate instead.' };
    }
    return { ok: false, msg: 'That person cannot inherit this business — choose a living spouse, adult child, parent or adult sibling.' };
  }
  biz.heirId = personId;
  if (!S.willPlan) S.willPlan = { charityPct: 0, primaryHeirId: null, draftedYear: null };
  S.willPlan.primaryHeirId = personId;
  if (!S.willPlan.draftedYear) S.willPlan.draftedYear = S.year;
  const name = match.person.fullName || match.person.firstName;
  recordJournal(
    S,
    `Named ${name} (${match.relation}) as heir to ${biz.name} in your will${match.adult ? '' : ' — held in trust until they turn 18'}.`,
    'milestone'
  );
  return { ok: true, msg: `${name} will inherit ${biz.name}.` };
}

/* Name the will's primary heir (from the will screen). Businesses that
   already name their own heir keep it; businesses with no heir follow
   the will's primary heir at death. */
export function setWillPrimaryHeir(S, personId) {
  ensureExtendedState(S);
  const eligible = listEligibleHeirs(S);
  const match = eligible.find(e => e.person.id === personId);
  if (!match) {
    if (eligible.length === 0) {
      return { ok: false, msg: 'Nobody is eligible to inherit — no living spouse, child, parent or sibling. Without an heir, your businesses will be sold to the estate.' };
    }
    return { ok: false, msg: 'That person cannot be your heir — choose a living spouse, adult child, parent or adult sibling.' };
  }
  if (!S.willPlan) S.willPlan = { charityPct: 0, primaryHeirId: null, draftedYear: null };
  S.willPlan.primaryHeirId = personId;
  if (!S.willPlan.draftedYear) S.willPlan.draftedYear = S.year;
  const name = match.person.fullName || match.person.firstName;
  recordJournal(
    S,
    `Named ${name} (${match.relation}) as the primary heir in your will${match.adult ? '' : ' — held in trust until they turn 18'}.`,
    'milestone'
  );
  return { ok: true, msg: `${name} is now your primary heir.` };
}

/* ------------------------------------------------------------------ */
/* Relocation: keep / sell / close (per business)                      */
/* ------------------------------------------------------------------ */

/* Pure data for the decision UI (and for probes): one entry per business
   the player must decide about before the move completes. `currency` is
   the currency the figures are currently in (biz.figuresCurrency — see
   convertBusinessFiguresCurrency — else the business's country), so the
   decision text never labels player-currency figures as origin money. */
export function buildRelocationBusinessChoices(S) {
  return getBusinesses(S).map(biz => {
    const monthlyProfit = Math.round((Number(biz.monthlyRev) || 0) - (Number(biz.monthlyCost) || 0));
    const staffCount = Array.isArray(biz.staff)
      ? biz.staff.length
      : (typeof biz.employees === 'number' ? biz.employees : 0);
    return {
      biz,
      bizId: biz.id,
      name: biz.name,
      country: biz.country || S.country,
      currency: biz.figuresCurrency || biz.country || S.country,
      monthlyRev: Number(biz.monthlyRev) || 0,
      monthlyCost: Number(biz.monthlyCost) || 0,
      monthlyProfit,
      staffCount,
      valuation: computeBusinessValuation(biz),
      salvage: computeBusinessSalvage(biz),
      remoteManagerWage: remoteManagerWageLocal(S, biz)
    };
  });
}

/* A remote business's books live in ONE currency at a time, tracked on
   biz.figuresCurrency (default: the business's country). W1's settlement
   reads the figures as player currency, so when the player moves, the
   kept business's figures are converted to the new player currency here
   (called from finishPendingRelocation, after the move) — otherwise a
   Cairo café would pay out 200,000 "pounds" a month in London. The
   business itself stays in its origin country; only the books are
   re-denominated, and a later move converts them again from wherever
   they currently are. */
export function convertBusinessFiguresCurrency(S, biz, toCountry) {
  if (!biz || !toCountry) return { ok: false, msg: 'No business or destination.' };
  const from = biz.figuresCurrency || biz.country || S.country;
  if (from === toCountry) {
    biz.figuresCurrency = toCountry;
    return { ok: true, converted: false };
  }
  const conv = (v) => Math.round(convertCurrency(Number(v) || 0, from, toCountry, S.year));
  biz.monthlyRev = conv(biz.monthlyRev);
  biz.monthlyCost = conv(biz.monthlyCost);
  if(biz.enterprise)for(const key of ['price','unitCost','fixed','burn','reserve','pendingStockCost','wipUnitCost','wipPrice','pendingStockUnit'])if(Number.isFinite(biz.enterprise[key]))biz.enterprise[key]=conv(biz.enterprise[key]);
  if(biz.inputs){for(const input of Object.values(biz.inputs.inputs)){input.value=conv(input.value);for(const supplier of input.suppliers)supplier.unit=convertCurrency(supplier.unit,from,toCountry,S.year);for(const order of [input.pending,input.lastReceipt])if(order){order.unit=convertCurrency(order.unit,from,toCountry,S.year);order.cost=conv(order.cost);}}}
  if(biz.catalog){biz.catalog=JSON.parse(JSON.stringify(biz.catalog));const row=r=>{for(const k of ['price','revenue','direct','contribution','invoice'])if(Number.isFinite(r[k]))r[k]=conv(r[k]);};for(const item of biz.catalog.items){for(const k of ['price','basePrice','input','stockValue'])item[k]=conv(item[k]);if(item.pending)for(const k of ['unit','cost'])item.pending[k]=conv(item.pending[k]);if(item.wip)for(const k of ['price','input','totalCost','paid'])item.wip[k]=conv(item.wip[k]);for(const h of item.history||[])row(h);if(item.last)row(item.last);}if(biz.catalog.lastResult){for(const k of ['revenue','inventoryCost','variableCost','directConsumed'])biz.catalog.lastResult[k]=conv(biz.catalog.lastResult[k]);for(const r of biz.catalog.lastResult.rows||[])row(r);}}
  if(biz.growth){for(const entry of biz.growth.history||[])entry.cost=conv(entry.cost);for(const location of biz.growth.locations||[])location.monthly=conv(location.monthly);if(biz.growth.project)biz.growth.project.monthly=conv(biz.growth.project.monthly);}
  if(biz.operating?.history)for(const entry of biz.operating.history)entry.cost=conv(entry.cost);
  if(biz.equipment){for(const l of biz.equipment.lots)for(const key of ['cost','bookValue','monthly'])l[key]=conv(l[key]);if(biz.equipment.distributions)biz.equipment.distributions=conv(biz.equipment.distributions);}
  if(biz.tech?.servers){const s=biz.tech.servers;if(s.cloud)s.cloud.monthly=conv(s.cloud.monthly);for(const r of [...s.racks,...(s.pending?[s.pending]:[])])for(const k of ['cost','bookValue','power','maintenance'])if(Number.isFinite(r[k]))r[k]=conv(r[k]);if(s.backup)s.backup.monthly=conv(s.backup.monthly);if(s.assetDistributions)s.assetDistributions=conv(s.assetDistributions);if(s.last)for(const k of ['rental','power','maintenance','backup','cost'])s.last[k]=conv(s.last[k]);}
  if(biz.tech)for(const key of ['price','cloud','fixed','burn','bookings','capitalRaised','reserve'])if(Number.isFinite(biz.tech[key]))biz.tech[key]=conv(biz.tech[key]);
  biz.capitalInvested = conv(biz.capitalInvested);
  for(const key of ['totalCapitalIn','retainedCash','retainedEarnings','debtLocal','brandValue'])if(Number.isFinite(biz[key]))biz[key]=conv(biz[key]);
  if(biz.manager&&Number.isFinite(biz.manager.wage))biz.manager.wage=conv(biz.manager.wage);
  if(biz.premises&&Number.isFinite(biz.premises.monthlyRentLocal))biz.premises.monthlyRentLocal=conv(biz.premises.monthlyRentLocal);
  const lineSeen=new Set();const convertPL=pl=>{if(!pl)return;if(pl.lines)for(const r of pl.lines){if(lineSeen.has(r))continue;lineSeen.add(r);for(const k of ['price','revenue','direct','contribution','invoice'])if(Number.isFinite(r[k]))r[k]=conv(r[k]);}for(const key of ['revenue','rent','wages','other','remote','manager','costs','profit','tax','net','headOffice','regionalManager','reinvest','harvestOut','safetyCost','cloud','fixed','price','investorDistribution','fundingUsed','unitCost','inventoryCost','variableCost'])if(Number.isFinite(pl[key]))pl[key]=conv(pl[key]);};
  const seen=new Set();for(const pl of [...(biz.history||[]),biz.lastPL])if(pl&&!seen.has(pl)){seen.add(pl);convertPL(pl);}
  for(const eff of [biz._lastRoleEffects,biz._opsAppliedEffects])if(eff)for(const key of ['revenueAdd','costAdd'])if(Number.isFinite(eff[key]))eff[key]=conv(eff[key]);
  if (biz.remoteManagerWageLocal) biz.remoteManagerWageLocal = conv(biz.remoteManagerWageLocal);
  if (Array.isArray(biz.staff)) {
    for (const m of biz.staff) {
      if (m.wageLocal) m.wageLocal = conv(m.wageLocal);
      if(Number.isFinite(m.retirementBalance))m.retirementBalance=conv(m.retirementBalance);
    }
  }
  for(const price of Object.values(biz.prices||{})){
    if(Number.isFinite(price.price))price.price=conv(price.price);
    if(Number.isFinite(price.standard))price.standard=conv(price.standard);
  }
  for(const delivery of biz.pendingDeliveries||[]){
    if(Number.isFinite(delivery.unitCost))delivery.unitCost=conv(delivery.unitCost);
    if(Number.isFinite(delivery.cost))delivery.cost=conv(delivery.cost);
  }
  if(biz.monthEffects)for(const key of ['revenueAdd','costAdd'])if(Number.isFinite(biz.monthEffects[key]))biz.monthEffects[key]=conv(biz.monthEffects[key]);
  biz.figuresCurrency = toCountry;
  return { ok: true, converted: true, from, to: toCountry };
}

/* KEEP — manage from abroad. biz.country stays the origin country.
   monthlyRev is NOT cut here: W1's computeBusinessMonth multiplies
   revenue x0.7 for remote businesses and charges the manager's wage in
   the P&L, so cutting it here would apply the penalty twice. */
export function keepBusinessRemote(S, biz) {
  if (!biz) return { ok: false, msg: 'No business found.' };
  if (biz.remote) return { ok: false, msg: `${biz.name} is already managed from abroad.` };
  const origin = biz.country || S.country;
  biz.remote = true;
  biz.country = origin;
  if (!biz.figuresCurrency) biz.figuresCurrency = origin;
  biz.remoteManagerWageLocal = remoteManagerWageLocal(S, biz);
  biz.remoteSinceYear = S.year;
  biz.remoteSinceMonth = S.month;
  if (!Array.isArray(biz.history)) biz.history = [];
  biz.history.push({ year: S.year, month: S.month, event: 'kept_remote', note: `Kept after moving abroad; revenue x0.7, manager ${formatMoney(biz.remoteManagerWageLocal, origin)}/mo.` });
  recordJournal(
    S,
    `Kept ${biz.name} in ${getCountry(origin).name} and will manage it from abroad — revenue runs at 70% under remote management, with a local manager costing ${formatMoney(biz.remoteManagerWageLocal, origin)} a month.`,
    'money'
  );
  return { ok: true, msg: `Keeping ${biz.name} — managed from abroad at 70% revenue.` };
}

/* Coming home to a remote business's country ends remote management:
   no more manager cost, repeat-rate decay stops, full revenue resumes
   (W1's multiplier no longer applies once remote is false). */
export function restoreBusinessLocal(S, biz) {
  if (!biz || !biz.remote) return { ok: false, msg: 'Not managed remotely.' };
  biz.remote = false;
  biz.remoteManagerWageLocal = 0;
  biz.remoteSinceYear = null;
  biz.remoteSinceMonth = null;
  if (!Array.isArray(biz.history)) biz.history = [];
  biz.history.push({ year: S.year, month: S.month, event: 'returned_local', note: 'Owner back in country — full revenue restored.' });
  recordJournal(S, `Back in ${getCountry(biz.country).name} — you are running ${biz.name} yourself again at full revenue.`, 'money');
  return { ok: true, msg: `Running ${biz.name} yourself again.` };
}

/* SELL — at the real valuation. The money is paid by W1's
   sellSmallBusiness(S, bizId), which removes the business from the list
   and syncs the mirror itself. The amount credited is read off the cash
   balance, never re-derived here. */
export function sellBusinessAtValuation(S, biz) {
  if (!biz) return { ok: false, msg: 'No business found.' };
  const list = getBusinesses(S);
  if (!list.some(b => b.id === biz.id)) return { ok: false, msg: 'That business is no longer yours.' };
  const cashBefore = Number(S.money.cash) || 0;
  const res = sellSmallBusiness(S, biz.id);
  /* Safety net only — sellBusiness already removed it and re-synced. */
  removeBusinessFromList(S, biz);
  syncBusinessListMirror(S);
  if (!res || !res.ok) {
    return { ok: false, msg: (res && res.msg) || 'Could not sell that business.' };
  }
  const amount = Math.round((Number(S.money.cash) || 0) - cashBefore);
  return { ok: true, msg: res.msg, amount };
}

/* CLOSE — through W1's closeBusiness, the game's one canonical close
   path: salvage 0.5 x capital, staff fired through W2's fireAllStaff
   with country-law severance, and the player told in a scene. */
export function closeBusiness(S, biz) {
  if (!biz) return { ok: false, msg: 'No business found.' };
  const list = getBusinesses(S);
  if (!list.some(b => b.id === biz.id)) return { ok: false, msg: 'That business is no longer yours.' };
  /* quietScene (v2.11 merge): the relocation decision scene already
     tells the player — the engine's "Has Closed" scene would say it twice. */
  const res = closeBusinessEngine(S, biz, 'closed before moving abroad', { quietScene: true });
  if (!res || !res.ok) return { ok: false, msg: (res && res.msg) || 'Could not close that business.' };
  return { ok: true, msg: res.msg, amount: res.salvage, salvage: res.salvage, staffFired: res.staffCount };
}

/* Apply ONE relocation decision for ONE business. Called from the
   decision-scene effects (visaMigrationEngine) and from the
   biz-relocate-* button handlers (main.js) — same function, same result.
   Returns the decision applied; the caller advances the chain (next
   business, or finish the relocation). */
export function applyRelocationBusinessDecision(S, bizId, decision) {
  const biz = findBusiness(S, bizId);
  if (!biz) return { ok: false, msg: 'That business is no longer yours.' };
  if (decision === 'keep') return keepBusinessRemote(S, biz);
  if (decision === 'sell') return sellBusinessAtValuation(S, biz);
  if (decision === 'close') return closeBusiness(S, biz);
  return { ok: false, msg: 'Unknown business decision.' };
}

/* Monthly tick for remote businesses. THE COORDINATOR WIRES THIS INTO
   the monthly settlement hook (economyEngine §3, next to W2's
   monthlyStaffTick) — it is NOT called from here, so the settlement
   stays the one place money moves each month. It does ONLY the one
   remote effect W1's P&L does not own: repeat rate -0.02 per month
   while the player is still abroad (no decay while the player is back
   in the business's country — that is visiting). The x0.7 revenue and
   the manager's wage are already in W1's computeBusinessMonth, so
   charging them here too would double-charge the player. No journal
   each month — the repeat-customer rate is visible on the business card. */
export function tickRemoteBusinesses(S) {
  if (!S) return { businesses: 0, repeatRateLost: 0 };
  let count = 0;
  let lost = 0;
  for (const biz of getBusinesses(S)) {
    if (!biz || !biz.remote) continue;
    count += 1;
    if (S.country !== (biz.country || S.country)) {
      /* v2.17: a business run from abroad slowly loses its regulars —
         repeat customers fall 0.02 a month while the owner is away. */
      biz.repeatRate = Math.max(0, (Number(biz.repeatRate ?? 0.5)) - 0.02);
      lost += 1;
    }
  }
  return { businesses: count, repeatRateLost: lost };
}

/* ------------------------------------------------------------------ */
/* Death / inheritance                                                 */
/* ------------------------------------------------------------------ */

/* Resolve one business at death. Returns { heir, heirId } when a living
   heir is named (the business's own heir first, else the will's primary
   heir), or { heir: null } when there is none (dead heir counts as none). */
export function resolveBusinessHeir(S, biz) {
  const heirId = (biz && biz.heirId) || (S.willPlan && S.willPlan.primaryHeirId) || null;
  const heir = heirId && S.people ? S.people[heirId] : null;
  if (heir && heir.alive) return { heir, heirId: heir.id };
  return { heir: null, heirId: null };
}

/* Plain-words preview for the death screen: what will happen to each
   business. No money moves here — the transfer itself happens in
   continueAsChild. */
export function describeBusinessDeathOutcome(S) {
  return getBusinesses(S).map(biz => {
    const { heir } = resolveBusinessHeir(S, biz);
    if (heir) return { biz, heir, text: `Your will names ${heir.fullName || heir.firstName} as heir to ${biz.name}.` };
    return { biz, heir: null, text: `No heir is named for ${biz.name} — it will be sold and the money will go to your estate.` };
  });
}

/* Run at the TOP of continueAsChild, BEFORE the estate is valued, so a
   business sold to the estate is shared out with everything else.
   - Living named heir: the business is taken out of the dead player's
     list and returned in outcome.inherited for delivery (see
     deliverInheritedBusinesses). Nothing is sold, nothing vanishes.
   - No living heir: sold at the real valuation via sellSmallBusiness;
     the proceeds land in the dead player's cash (the estate) and are
     journalled in both lives.
   Returns { inherited: [{biz, heir}], soldToEstate: [{biz, amount}] }. */
export function transferBusinessesOnDeath(S, continuingChildId = null) {
  ensureExtendedState(S);
  const outcome = { inherited: [], soldToEstate: [] };
  const businesses = [...getBusinesses(S)];
  for (const biz of businesses) {
    const { heir } = resolveBusinessHeir(S, biz);
    if (heir) {
      biz.heirId = heir.id;
      removeBusinessFromList(S, biz);
      outcome.inherited.push({ biz, heir });
      recordJournal(
        S,
        `${biz.name} passes to ${heir.fullName || heir.firstName} (${heir.id === continuingChildId ? 'your heir, who continues this life' : 'named heir in your will'}).`,
        'milestone'
      );
    } else {
      const sold = sellBusinessAtValuation(S, biz);
      const amount = sold && sold.ok ? (sold.amount || 0) : 0;
      outcome.soldToEstate.push({ biz, amount });
      recordJournal(
        S,
        `No heir was named for ${biz.name}, so it was sold for ${formatMoney(amount, S.country)} and the money went to your estate.`,
        'money'
      );
    }
  }
  return outcome;
}

/* Deliver the stashed inherited businesses into the continuing child's
   life (called from continueAsChild AFTER nextS exists). A business whose
   heir IS the continuing child moves into nextS.career.businesses with a
   journal line, so the heir actually runs it. A business whose heir is
   someone else is journalled to the continuing child so they are told
   what happened to it — it belongs to that heir now, not to this life. */
export function deliverInheritedBusinesses(nextS, outcome, continuingChildId, deadPlayerGender = 'm') {
  if (!nextS || !outcome) return { delivered: [], toldAbout: [] };
  ensureExtendedState(nextS);
  const delivered = [];
  const toldAbout = [];
  const parentWord = deadPlayerGender === 'f' ? 'mother' : 'father';
  for (const { biz, heir } of (outcome.inherited || [])) {
    if (heir && heir.id === continuingChildId) {
      if (!Array.isArray(nextS.career.businesses)) nextS.career.businesses = [];
      const copy = { ...biz, heirId: heir.id };
      if (Array.isArray(biz.staff)) copy.staff = biz.staff.map(m => ({ ...m }));
      if (Array.isArray(biz.history)) copy.history = [...biz.history];
      nextS.career.businesses.push(copy);
      nextS.career.business = copy;
      delivered.push(copy);
      recordJournal(
        nextS,
        `You inherited ${biz.name} from your ${parentWord} and now run it yourself.`,
        'milestone'
      );
    } else {
      toldAbout.push({ biz, heir });
      recordJournal(
        nextS,
        `${heir.fullName || heir.firstName} inherited ${biz.name} from your ${parentWord}.`,
        'milestone'
      );
    }
  }
  for (const { biz, amount } of (outcome.soldToEstate || [])) {
    recordJournal(
      nextS,
      `No heir was named for ${biz.name}, so it was sold for ${formatMoney(amount, nextS.country)} and the money went to the estate.`,
      'money'
    );
  }
  return { delivered, toldAbout };
}

/* ------------------------------------------------------------------ */
/* Render sections (HTML strings — the coordinator wires them into     */
/* views.js; this file never touches views.js itself)                  */
/* ------------------------------------------------------------------ */

/* Will section for ONE business card (Ventures card). Shows the current
   heir or the plain warning that the business will be sold to the
   estate, plus a Name-your-heir button per eligible person. Buttons use
   the biz-set-heir action (data-person + data-biz) handled in main.js. */
export function renderBusinessWillSection(S, biz) {
  if (!biz) return '';
  const { heir } = resolveBusinessHeir(S, biz);
  const eligible = listEligibleHeirs(S);
  const heirLine = heir
    ? `Heir: <strong>${esc(heir.fullName || heir.firstName)}</strong> — ${esc(biz.name)} passes to them when you die.`
    : `<strong>No heir named</strong> — ${esc(biz.name)} will be sold and the money will go to your estate.`;
  const buttons = eligible.length > 0
    ? eligible.map(e => `
      <button class="btn btn-sm ${heir && heir.id === e.person.id ? 'btn-navy' : ''}" data-action="biz-set-heir" data-biz="${esc(biz.id)}" data-person="${esc(e.person.id)}">
        ${heir && heir.id === e.person.id ? '✓ ' : ''}${esc(e.person.fullName || e.person.firstName)} (${esc(e.relation)}${e.adult ? '' : ', under 18 — held in trust'})
      </button>`).join('')
    : `<span class="muted">Nobody is eligible to inherit — no living spouse, child, parent or sibling.</span>`;
  return `
    <div style="border-top:1px dashed var(--line-soft);padding-top:8px;margin-top:8px">
      <div class="muted" style="margin-bottom:6px"><strong>Will &amp; heir:</strong> ${heirLine}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${buttons}
      </div>
    </div>`;
}

/* Heir section for the will card (Finance tab, next to the charity
   buttons — coordinator wires it in). Same biz-set-heir action, without
   data-biz, so it sets the will's primary heir. */
export function renderWillHeirSection(S) {
  ensureExtendedState(S);
  const primaryId = S.willPlan ? S.willPlan.primaryHeirId : null;
  const primary = primaryId && S.people ? S.people[primaryId] : null;
  const eligible = listEligibleHeirs(S);
  const heirLine = (primary && primary.alive)
    ? `Primary heir: <strong>${esc(primary.fullName || primary.firstName)}</strong> — your businesses pass to them when you die (unless a business names its own heir).`
    : `<strong>No primary heir named</strong> — your businesses will be sold and the money will go to your estate.`;
  const buttons = eligible.length > 0
    ? eligible.map(e => `
      <button class="btn btn-sm ${primary && primary.id === e.person.id ? 'btn-navy' : ''}" data-action="biz-set-heir" data-person="${esc(e.person.id)}">
        ${primary && primary.id === e.person.id ? '✓ ' : ''}${esc(e.person.fullName || e.person.firstName)} (${esc(e.relation)}${e.adult ? '' : ', under 18 — held in trust'})
      </button>`).join('')
    : `<span class="muted">Nobody is eligible to inherit — no living spouse, child, parent or sibling.</span>`;
  return `
    <div style="border-top:1px dashed var(--line-soft);padding-top:8px;margin-top:8px">
      <div class="muted" style="margin-bottom:6px"><strong>Primary heir:</strong> ${heirLine}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${buttons}
      </div>
    </div>`;
}
