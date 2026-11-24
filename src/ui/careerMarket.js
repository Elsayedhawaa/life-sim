/* ============================================================================
   World Life 2.0 — v2.15 Worker 2: Career — a market, not a ladder (UI)
   Renders the career-market sections inside the Career tab's current-job
   card: the performance dashboard, an open headhunter offer, the pension
   pot, and mentor / rival. Plain words everywhere, no code in the UI.
   Every button states its cost and effect before the player commits.
   All numbers come from src/systems/careerMarket.js — this file draws,
   it never computes.
   ========================================================================== */

import { getCountry, formatMoney } from '../data/countries.js';
import { computePayslip } from '../data/economy.js';
import {
  getPerformanceDashboard,
  ensureCareerMarket,
  ensurePension,
  pensionMonthPreview,
  seniorColleagueCandidates,
  ensureSeniorColleague
} from '../systems/careerMarket.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* v2.19 W4 — the dashboard is split into the desk's own sections:
   boss, team, numbers — each once (data-standing), each with the one
   thing that would move it, labelled so. The three levers come from
   getPerformanceDashboard, unchanged; this function only draws them
   as three blocks instead of three lines in one div. The record line
   and the promotion-interview line still belong to the whole dashboard,
   so they stay once, below the three blocks. With no manager the
   boss lever is empty by the v2.18 purge (the value line already says
   "no manager on record") — no empty mover line is printed. */
function renderDashboardHtml(S) {
  const dash = getPerformanceDashboard(S);
  if (!dash) return '';
  const promo = dash.promo;
  const promoLine = promo
    ? `<div style="margin-top:6px">Promotion interview score: <strong class="mono">${promo.min}–${promo.max} / ${promo.threshold}</strong> <span class="muted">— your performance ${promo.performance} + your manager's respect ${promo.bossRespect} + stepping up ${promo.steppedUpBonus} + reference ${promo.refBonus}${promo.mentorBonus ? ` + mentor's word ${promo.mentorBonus}` : ''}${promo.rivalTerm ? ` + rival ${promo.rivalTerm > 0 ? '+' : ''}${promo.rivalTerm}` : ''} + the panel's mood (0–20). ${promo.min >= promo.threshold ? 'You clear the bar even on a bad day.' : promo.max >= promo.threshold ? 'You clear the bar on a good day — lift one part and it stops being luck.' : 'You do not clear the bar yet — lift the weakest part below.'}</span></div>`
    : '';
  return `
    <div style="margin-top:12px">
      <strong>Performance dashboard — what the numbers are made of</strong>
      <span class="muted"> — no more guessing why a promotion did not come.</span>
      <div style="margin-top:6px;font-size:0.86rem">
        <div data-standing="boss" style="margin-top:8px">
          <strong>What your manager thinks <span class="mono">${dash.bossView.value}%</span></strong>
          ${dash.bossView.boss ? `<div class="muted">— ${esc(dash.bossView.boss.name)} (affection ${dash.bossView.boss.affection}, respect ${dash.bossView.boss.respect}, trust ${dash.bossView.boss.trust})</div>` : '<div class="muted">— no manager on record</div>'}
          ${dash.bossView.lever ? `<div class="muted">What would move it: ${esc(dash.bossView.lever)}</div>` : ''}
        </div>
        <div data-standing="team" style="margin-top:8px">
          <strong>What the team thinks <span class="mono">${dash.teamView.value == null ? '—' : `${dash.teamView.value}%`}</span></strong>
          <div class="muted">— ${dash.teamView.colleagueCount} colleague(s) on record</div>
          <div class="muted">What would move it: ${esc(dash.teamView.lever)}</div>
        </div>
        <div data-standing="numbers" style="margin-top:8px">
          <strong>What the numbers say <span class="mono">${dash.numbers.value}%</span></strong>
          <div class="muted">— quality ${dash.numbers.quality}%, attendance ${dash.numbers.attendance}%</div>
          <div class="muted">What would move it: ${esc(dash.numbers.lever)}</div>
        </div>
        <div class="muted" style="margin-top:4px">On your record: stepped up ${dash.record.steppedUp} time(s), ${dash.record.training} course(s), pace ${esc(dash.record.workMode)}.</div>
        ${promoLine}
      </div>
    </div>
  `;
}

function renderOfferHtml(S) {
  const m = ensureCareerMarket(S);
  const offer = m.offer;
  if (!offer) return '';
  const job = S.career.job;
  const isCit = S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident';
  const slip = computePayslip(offer.monthlyGross, S.country, S.year, isCit, 'normal');
  const currentSlip = job ? computePayslip(job.monthlyGross, S.country, S.year, isCit, job.workMode) : null;
  const raise = currentSlip ? offer.monthlyGross - job.monthlyGross : 0;
  return `
    <div style="margin-top:12px">
      <strong>A recruiter called — a real offer is open</strong>
      <span class="muted"> — it stays open for 3 months, then they hire someone else.</span>
      <div style="margin-top:6px;font-size:0.86rem">
        <div><strong>${esc(offer.recruiterName)}</strong>, a recruiter, wants you for <strong>${esc(offer.title)}</strong> at <strong>${esc(offer.employer)}</strong>.</div>
        ${offer.achievementLabel ? `<div style="margin-top:4px">They called because of your <strong>${esc(offer.achievementLabel)}</strong> — visible work brings the calls.</div>` : ''}
        <div style="margin-top:4px">Pay: gross <strong class="mono">${esc(formatMoney(offer.monthlyGross, S.country))}</strong>/mo (${raise > 0 ? `+${esc(formatMoney(raise, S.country))}/mo over your ${esc(formatMoney(job.monthlyGross, S.country))}` : 'no raise'}) — net <strong class="mono text-good">${esc(formatMoney(slip.net, S.country))}</strong>/mo after tax and social insurance${currentSlip ? ` (you take home ${esc(formatMoney(currentSlip.net, S.country))} now)` : ''}.</div>
        <div style="margin-top:4px">The trade-offs, stated plainly:</div>
        ${offer.tradeoffs.map(t => `<div class="muted" style="margin-left:12px">• ${esc(t.text)}</div>`).join('')}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
        <button class="btn btn-primary btn-sm" data-action="cm-offer-accept">Accept — move to ${esc(offer.employer)}</button>
        <button class="btn btn-sm" data-action="cm-offer-negotiate">Use it to negotiate where you are</button>
        <button class="btn btn-sm" data-action="cm-offer-decline">Decline</button>
      </div>
      <div class="muted" style="margin-top:4px">• <strong>Accept:</strong> you resign from ${esc(job ? job.employer : 'your job')} (gratuity and notice as usual) and start at ${esc(offer.employer)} at the offered pay, exactly. ${offer.city !== S.city ? 'You move for the role. ' : ''}${offer.hasNonCompete ? `You sign the 2-year non-compete with ${esc(job ? job.employer : 'your old employer')}.` : ''}<br>• <strong>Negotiate:</strong> you show the offer to your manager. A strong record gets most of it matched; a weak one gets refused — and the offer is spent either way.<br>• <strong>Decline:</strong> the offer goes away, nothing else changes.</div>
    </div>
  `;
}

function renderPensionHtml(S) {
  const job = S?.career?.job;
  if (!job) return '';
  const preview = pensionMonthPreview(S);
  const pen = preview.pen;
  const scheme = preview.scheme;
  const history = (pen.history || []).slice(-6).reverse();
  const historyLine = history.length
    ? history.map(h => `${h.month}/${h.year}: you ${esc(formatMoney(h.employee, S.country))} + employer ${esc(formatMoney(h.employer, S.country))}${h.growth ? ` + growth ${esc(formatMoney(h.growth, S.country))}` : ''} → pot ${esc(formatMoney(h.pot, S.country))}`).join('<br>')
    : 'Nothing in yet — the first contribution lands at the end of this month.';
  const optOutLine = !scheme.canOptOut
    ? `<div class="muted" style="margin-top:4px">${esc(scheme.note)}</div>`
    : pen.optedOut
    ? `<div style="margin-top:6px"><button class="btn btn-sm" data-action="cm-pension-optin">Opt back into the pension</button> <span class="muted">Contributions from you and your employer start again next month.</span></div>`
    : `<div style="margin-top:6px"><button class="btn btn-sm" data-action="cm-pension-optout">Opt out of the pension</button> <span class="muted">${S.country === 'usa' ? 'You keep the 6% of your pay in your pocket and your employer stops matching 3% — Social Security stays separate. 401(k) deposits stop.' : `Your employer stops paying ${esc(formatMoney(preview.employer, S.country))}/month and you stop paying ${esc(formatMoney(preview.employee, S.country))}/month. What is already in your pot stays yours.`}</span></div>`;
  return `
    <div style="margin-top:12px">
      <strong>Pension — ${esc(scheme.scheme)}</strong>
      <div style="margin-top:6px;font-size:0.86rem">
        <div>Your pot: <strong class="mono">${esc(formatMoney(pen.pot, S.country))}</strong> <span class="muted">— you put in ${esc(formatMoney(pen.employeeTotal, S.country))} so far, your employer put in ${esc(formatMoney(pen.employerTotal, S.country))}, investment growth added ${esc(formatMoney(pen.growthTotal, S.country))} (${pen.monthsContributed} month(s) of contributions). At retirement this pot pays about <strong>${esc(formatMoney(preview.monthlyTopUp, S.country))}/mo</strong> on top of your state pension.</span></div>
        <div style="margin-top:4px">This month: you <strong class="mono">${esc(formatMoney(preview.employee, S.country))}</strong>${preview.cashOut > 0 ? ` (of which ${esc(formatMoney(preview.cashOut, S.country))} is your 401(k), taken from your account before you see it)` : ''} + employer <strong class="mono">${esc(formatMoney(preview.employer, S.country))}</strong>${pen.optedOut ? ' — you opted out, so only the part the law requires still goes in.' : ''}</div>
        ${pen.paidOut ? `<div style="margin-top:4px">Paid out at retirement: your pot of <strong>${esc(formatMoney(pen.paidOut.pot, S.country))}</strong> became <strong>${esc(formatMoney(pen.paidOut.monthlyTopUp, S.country))}/mo</strong> on top of your state pension.</div>` : ''}
        <div class="muted" style="margin-top:4px">${historyLine}</div>
      </div>
      ${optOutLine}
    </div>
  `;
}

function renderMentorRivalHtml(S) {
  const m = ensureCareerMarket(S);
  const job = S?.career?.job;
  if (!job) return '';
  let mentorHtml = '';
  if (m.mentor) {
    const mentor = S.people[m.mentor.personId];
    if (mentor && mentor.alive) {
      mentorHtml = `
        <div style="margin-top:6px"><strong>Your mentor: ${esc(mentor.fullName)}</strong> <span class="muted">— since ${m.mentor.sinceYear}, ${m.mentor.introductions} introduction(s) so far. Their word is worth +12 in a promotion interview and +6 at the yearly review.</span>
          <span style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
            <button class="btn btn-sm" data-action="cm-mentor-advice">Ask for advice</button>
            <button class="btn btn-sm" data-action="cm-mentor-intro">Ask for an introduction</button>
          </span>
          <div class="muted" style="margin-top:4px">• <strong>Advice:</strong> they tell you plainly which part of your record is weakest and what to do — that part rises 2 points, performance +1. Once every 3 months.<br>• <strong>Introduction:</strong> they put your name forward with hiring managers they know — a real chance of an offer now, and headhunters call twice as often while they are in your corner. Once every 6 months.</div>
        </div>`;
    }
  } else {
    const candidates = seniorColleagueCandidates(S);
    const senior = candidates.length ? candidates[0] : ensureSeniorColleague(S);
    if (senior) {
      const ready = senior.rel.respect >= 60 && senior.rel.trust >= 55;
      mentorHtml = `
        <div style="margin-top:6px"><strong>No mentor yet.</strong> <span class="muted">— ${esc(senior.fullName)}, a senior colleague (${senior.age}, ${esc(senior.jobTitle || 'senior')}), could mentor you. Their respect for you is ${Math.round(senior.rel.respect)}% (needs 60%) and trust ${Math.round(senior.rel.trust)}% (needs 55%)${ready ? ' — they would say yes.' : ' — build the relationship first (praise them, help them, ask for their help).'}</span>
          <span style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
            <button class="btn btn-sm" data-action="cm-mentor-ask" data-pid="${esc(senior.id)}">Ask ${esc(senior.firstName)} to mentor you</button>
          </span>
          <div class="muted" style="margin-top:4px">A mentor gives real advice, a real introduction to hiring managers, and their word counts in a promotion interview (+12) and at the yearly review (+6).</div>
        </div>`;
    }
  }
  let rivalHtml = '';
  if (m.rival) {
    const rival = S.people[m.rival.personId];
    if (rival && rival.alive) {
      const ahead = m.rival.performance > (job.performance ?? 0);
      rivalHtml = `
        <div style="margin-top:8px"><strong>Your rival: ${esc(rival.fullName)}</strong> <span class="muted">— ${m.rival.stance === 'ally' ? 'an ally now, not a rival' : 'after the same next rung as you'} · their performance ${Math.round(m.rival.performance)}% against your ${Math.round(job.performance ?? 0)}% ${ahead ? '— they are ahead of you, and that costs you 10 points in a promotion interview' : '— you are ahead, worth +5 in a promotion interview'}. Relationship: affection ${Math.round(rival.rel.affection)}, respect ${Math.round(rival.rel.respect)}, trust ${Math.round(rival.rel.trust)}.</span>
          <span style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
            <button class="btn btn-sm" data-action="cm-rival-collaborate">Work with them</button>
            <button class="btn btn-sm" data-action="cm-rival-compete">Race them, fairly</button>
            <button class="btn btn-sm" data-action="cm-rival-undermine">Undermine them</button>
          </span>
          <div class="muted" style="margin-top:4px">• <strong>Work with them:</strong> trust +8, they become an ally and stop undercutting you; the team rates you better.<br>• <strong>Race them:</strong> your performance +2 and stress +3 — but they push back just as hard (+2).<br>• <strong>Undermine them:</strong> 1-in-3 your manager hears about it (respect −10, and they know). If it works, their standing slips 5 points and your promotion odds rise.</div>
        </div>`;
    }
  } else {
    rivalHtml = `<div class="muted" style="margin-top:8px">No rival at work right now — one appears when you are in contention for the next rung (65%+ performance, 6 months in role).</div>`;
  }
  return `
    <div style="margin-top:12px">
      <strong>Mentor &amp; rival</strong>
      ${mentorHtml}
      ${rivalHtml}
    </div>
  `;
}

/* The career-market sections, dropped into the Career tab's current-job
   card after Benefits and before the action buttons. */
export function renderCareerMarketHtml(S) {
  if (!S?.career?.employed || !S.career.job) return '';
  return `
    ${renderDashboardHtml(S)}
    ${renderOfferHtml(S)}
    ${renderPensionHtml(S)}
    ${renderMentorRivalHtml(S)}
  `;
}
