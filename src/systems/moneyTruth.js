/* ============================================================================
   World Life 2.0 — v2.18 Worker 2: ONE source of truth for the numbers
   the player sees (spec §2/§3).

   Two numbers used to be computed in more than one place, in more than
   one way, and could disagree on screen:

   (a) A business's last-month net. The business card read
       biz.lastPL.net; the Finance tab showed revenue, costs and tax as
       three separate ledger lines and never stated the net; the Timeline
       never stated it at all. Now every render site reads
       businessLastMonthNet(S, biz), which reads ONLY biz.lastPL — the
       one folded P&L the monthly settlement itself posted (businessMonthly
       computeBusinessMonthFull). No site recomputes revenue − costs −
       tax, so the three sites cannot disagree.

   (b) The salary. The Career tab payslip ran computePayslip on the
       contract gross; the Finance tab showed the net the settlement
       actually paid — which is the gross AFTER the world-event salary
       multiplier and the real overtime rate. In a crisis year the two
       disagreed. Now the payslip reads salaryNetFor(S), which repeats
       the settlement's own arithmetic exactly (same inputs, same
       functions: computeOvertimePay on the job, worldEventEffects
       salary multiplier, computeMonthlyNetPay) — so the net on the
       Career tab IS the net in the Finance tab's salary line.

   Pure reads (except the lazy flag on the job record for the pay
   freeze, which setPayFreeze writes): nothing here moves money.
   ========================================================================== */

import { getCountry, formatMoney } from '../data/countries.js';
import {
  computeMonthlyNetPay,
  computeOvertimePay,
  pensionShareFor,
  EMPLOYER_PENSION_PCT
} from '../data/economy.js';
import { worldEventEffects } from './worldEvents.js';
import { canLegallyEarnSalary } from './economyEngine.js';

/* ------------------------------------------------------------------ */
/* (a) Business last-month net — one read of biz.lastPL.              */
/* ------------------------------------------------------------------ */

/* The business's last settled month, read from the one folded P&L.
   hasPL is false before the first month settles (or for a business
   with no P&L at all) — callers must say "no month settled yet",
   never invent a 0. */
export function businessLastMonthNet(S, biz) {
  if (!biz) return { hasPL: false, net: null, revenue: null, costs: null, tax: null, month: null, year: null, name: '' };
  const pl = biz.lastPL;
  if (!pl || typeof pl.net !== 'number') {
    return { hasPL: false, net: null, revenue: null, costs: null, tax: null, month: null, year: null, name: biz.name || '' };
  }
  return {
    hasPL: true,
    net: Math.round(pl.net),
    revenue: Math.round(pl.revenue || 0),
    costs: Math.round(pl.costs || 0),
    tax: Math.round(pl.tax || 0),
    month: pl.month ?? null,
    year: pl.year ?? null,
    name: biz.name || pl.name || ''
  };
}

/* Every business's last-month net, plus the portfolio total — the
   Finance tab and the Timeline both read this, never a local sum. */
export function businessesLastMonthNet(S) {
  const list = (S?.career?.businesses || []).map((biz) => businessLastMonthNet(S, biz));
  const settled = list.filter((r) => r.hasPL);
  return {
    perBusiness: list,
    settledCount: settled.length,
    totalNet: settled.reduce((t, r) => t + (r.net || 0), 0),
    totalRevenue: settled.reduce((t, r) => t + (r.revenue || 0), 0),
    totalCosts: settled.reduce((t, r) => t + (r.costs || 0), 0),
    totalTax: settled.reduce((t, r) => t + (r.tax || 0), 0)
  };
}

/* One plain-words line per business, for the Finance tab and the
   Timeline — the same words, the same number, both places. */
export function businessNetLine(S, biz) {
  const r = businessLastMonthNet(S, biz);
  if (!r.hasPL) return `${r.name || 'Your business'} — no month settled yet.`;
  const when = r.month ? `${r.month}/${r.year}` : '';
  return `${r.name} — last month ${when ? `(${when}) ` : ''}net ${formatMoney(r.net, S.country)} (revenue ${formatMoney(r.revenue, S.country)} − costs ${formatMoney(r.costs, S.country)} − tax ${formatMoney(r.tax, S.country)})`;
}

/* ------------------------------------------------------------------ */
/* (b) Salary — the settlement's own arithmetic, shared with the      */
/*     Career tab payslip. Mirrors economyEngine settleHouseholdMonth */
/*     §1 line for line: overtime from computeOvertimePay(job), the    */
/*     world-event salary multiplier on the whole gross, then          */
/*     computeMonthlyNetPay. A frozen job's gross does not rise — the  */
/*     freeze itself is enforced where gross changes (the yearly merit */
/*     rise and the raise negotiation); this function only REPORTS it, */
/*     in plain words on the payslip.                                  */
/* ------------------------------------------------------------------ */

export function isPayFrozen(S) {
  const job = S?.career?.job;
  if (!job || !S?.career?.employed) return false;
  return (Number(job.payFrozenUntilYear) || 0) >= (Number(S.year) || 0);
}

export function payFreezeInfo(S) {
  const job = S?.career?.job;
  if (!isPayFrozen(S)) return { frozen: false, untilYear: null, reason: null };
  return {
    frozen: true,
    untilYear: Number(job.payFrozenUntilYear) || null,
    reason: job.payFreezeReason || 'pay is frozen while the crisis lasts'
  };
}

/* The payslip the Career tab shows. In a quiet month this is exactly
   computePayslip(job.monthlyGross, ...) — same overtime, same tax.
   In a crisis month it is the pay that actually lands (gross × the
   world-event salary multiplier), which is what the Finance tab's
   salary line already showed. withheld is true when the employer
   cannot legally pay at all: the net is 0, exactly as the Finance
   tab shows no salary line that month. */
export function salaryNetFor(S) {
  const job = S?.career?.job;
  const empty = {
    hasJob: false, withheld: false, baseGross: 0, overtimePay: 0, gross: 0,
    net: 0, incomeTax: 0, socialSecurity: 0, pensionContribution: 0,
    employerPension: 0, effectiveRate: 0, taxBands: [], socialPct: 0,
    taxFree: false, salaryMult: 1, payFrozen: false, freezeNote: '',
    workMode: 'normal'
  };
  if (!S?.career?.employed || !job) return empty;
  const isCit = (S.legal?.citizenships || []).includes(S.country) || S.legal?.residency?.kind === 'permanent_resident';
  const frozen = isPayFrozen(S);
  const freezeNote = frozen
    ? `Pay is frozen${job.payFrozenUntilYear ? ` until ${job.payFrozenUntilYear}` : ''} — ${job.payFreezeReason || 'the crisis means no rises this year'}. Your gross does not rise while the freeze lasts.`
    : '';
  if (!canLegallyEarnSalary(S)) {
    return { ...empty, hasJob: true, withheld: true, payFrozen: frozen, freezeNote, workMode: job.workMode || 'normal' };
  }
  const wEff = worldEventEffects(S, S.country);
  const salaryMult = wEff.salary || 1;
  const overtimePay = job.workMode === 'overtime' ? computeOvertimePay(job, S.country) : 0;
  const baseGross = Math.max(0, Math.round(Number(job.monthlyGross) || 0));
  const gross = Math.round((baseGross + overtimePay) * salaryMult);
  const pay = computeMonthlyNetPay(gross, S.country, S.year, isCit);
  const net = Math.round(pay.net);
  const incomeTax = Math.round(pay.incomeTax);
  const socialSecurity = Math.max(0, gross - incomeTax - net);
  const pension = pensionShareFor(S.country, isCit);
  return {
    hasJob: true,
    withheld: false,
    baseGross,
    overtimePay,
    gross,
    net,
    incomeTax,
    socialSecurity,
    pensionContribution: Math.round(socialSecurity * pension.share),
    pensionModelled: pension.modelled,
    employerPension: Math.round(gross * (EMPLOYER_PENSION_PCT[S.country] || 0)),
    effectiveRate: pay.effectiveRate,
    taxBands: pay.taxBands,
    socialPct: pay.socialPct,
    taxFree: pay.taxFree,
    salaryMult,
    salaryEventNames: wEff.activeNames || [],
    payFrozen: frozen,
    freezeNote,
    workMode: job.workMode || 'normal'
  };
}

/* The salary line the Finance tab's monthly statement already shows
   (from S.money.lastMonthSummary.incomeParts, written by the
   settlement). The Career tab compares its payslip against THIS —
   same label, same amount, no second computation. Returns null when
   no salary landed last month. */
export function financeSalaryLine(S) {
  const parts = S?.money?.lastMonthSummary?.incomeParts;
  if (!Array.isArray(parts)) return null;
  const part = parts.find((p) => typeof p.label === 'string' && p.label.startsWith('Salary — '));
  if (!part) return null;
  return { label: part.label, amount: Math.round(Number(part.amount) || 0) };
}
