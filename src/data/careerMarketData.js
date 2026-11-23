/* ============================================================================
   World Life 2.0 — v2.15 Worker 2: Career — a market, not a ladder. DATA.
   The pension scheme of each of the 18 countries, the headhunter rates
   and the pension payout rule. Law-named numbers are labelled; the rest
   are the payslip's own pension line (src/data/economy.js), never a
   second invention. Read by src/systems/careerMarket.js.
   ========================================================================== */

/* The pot pays out as a monthly top-up over 20 years (240 months) on top
   of the state pension — the pot divided by 240, rounded. No invented
   money: the top-up is exactly the pot spread over 240 months. */
export const PENSION_PAYOUT_MONTHS = 240;

/* Investment growth on the pot: 4% a year, modelled, applied monthly. */
export const PENSION_GROWTH_ANNUAL = 0.04;

/* Headhunter approach: a good performer (75%+, 6 months in role) has an
   8% chance a month of being approached; a mentor's introduction doubles
   it. An offer stays open 3 months. */
export const HEADHUNTER_MONTHLY_CHANCE = 0.08;
export const HEADHUNTER_MENTORED_MULT = 2;
export const HEADHUNTER_OFFER_MONTHS = 3;
export const HEADHUNTER_APPROACH_COOLDOWN_TURNS = 6;

/* A mentor's word in the promotion interview is worth +12 on the score
   (the interview needs 150); at the yearly review it counts as +6
   effective performance. A rival for the same seat costs −10 when they
   are ahead of you, and is worth +5 when you are ahead. */
export const MENTOR_PROMOTION_BONUS = 12;
export const MENTOR_AUTO_PROMOTION_BOOST = 6;
export const RIVAL_AHEAD_PENALTY = -10;
export const RIVAL_BEHIND_BONUS = 5;

/* The pension scheme of each country. employeeSource / employerSource
   say where the month's money comes from:
   - 'payslip': the payslip's own pension line (a sub-line of social
     insurance, already deducted from pay) / the payslip's employer
     top-up. Nothing new is deducted.
   - the USA adds a real 401(k) on top of the payslip: 6% of gross out
     of the player's cash, matched 3% by the employer (see
     pensionSlipFor in careerMarket.js).
   canOptOut: only the UK (auto-enrolment) and the USA (401(k)) let the
   player opt out — and in the USA opting out stops the 401(k) only;
   Social Security keeps going in, because the law says so. */
export const PENSION_SCHEMES = {
  egy: {
    scheme: 'Egyptian social insurance pension',
    note: 'Part of your social insurance — the pension share of what is already deducted from your pay. The law gives you no opt-out.',
    canOptOut: false
  },
  sau: {
    scheme: 'Saudi GOSI pension',
    note: 'The General Organization for Social Insurance pension, from the share of your pay already deducted. Saudis only — as an expat you pay nothing in.',
    canOptOut: false
  },
  uae: {
    scheme: 'UAE pension (GPSSA for Emiratis)',
    note: 'Emiratis pay into GPSSA. As an expat you pay no pension here — the end-of-service gratuity is the expat payout instead.',
    canOptOut: false
  },
  gbr: {
    scheme: 'UK workplace pension (auto-enrolment)',
    note: '5% of your pay from you, 3% on top from your employer — the legal minimum. You can opt out, but the employer 3% stops too.',
    canOptOut: true
  },
  usa: {
    scheme: 'US 401(k) + Social Security',
    note: '6% of your pay goes into your 401(k) before you see it, your employer matches 3%, and your Social Security share of payroll tax is in the pot too. You can opt out of the 401(k); Social Security you cannot.',
    canOptOut: true
  },
  deu: {
    scheme: 'German state pension',
    note: 'From the pension share of your social insurance, already deducted from your pay. No opt-out.',
    canOptOut: false
  },
  can: {
    scheme: 'Canada Pension Plan',
    note: 'From the pension share of your payroll deductions, already taken from your pay. No opt-out.',
    canOptOut: false
  },
  aus: {
    scheme: 'Australian superannuation',
    note: 'You pay nothing. Your employer pays 12% of your pay on top of your gross, straight into your super. You cannot opt out.',
    canOptOut: false
  },
  nld: {
    scheme: 'Dutch state + occupational pension',
    note: 'From the pension share of your payroll deductions, already taken from your pay. No opt-out.',
    canOptOut: false
  },
  fra: {
    scheme: 'French state pension',
    note: 'From the pension share of your social insurance, already deducted from your pay. No opt-out.',
    canOptOut: false
  },
  jpn: {
    scheme: 'Japanese Employees’ Pension Insurance',
    note: 'From the pension share of your social insurance, already deducted from your pay. No opt-out.',
    canOptOut: false
  },
  ita: {
    scheme: 'Italian INPS pension',
    note: 'From the pension share of your social insurance, already deducted from your pay. No opt-out.',
    canOptOut: false
  },
  sgp: {
    scheme: 'Singapore CPF retirement account',
    note: 'From the retirement share of your CPF contributions, already deducted from your pay. No opt-out.',
    canOptOut: false
  },
  bra: {
    scheme: 'Brazilian INSS pension',
    note: 'From the pension share of your social insurance, already deducted from your pay. No opt-out.',
    canOptOut: false
  },
  ind: {
    scheme: 'Indian EPF pension',
    note: 'From the pension share of your provident-fund deductions, already taken from your pay. No opt-out.',
    canOptOut: false
  },
  che: {
    scheme: 'Swiss AHV + occupational pension (2nd pillar)',
    note: 'From the pension share of your social insurance, already deducted from your pay. No opt-out.',
    canOptOut: false
  },
  swe: {
    scheme: 'Swedish state + occupational pension',
    note: 'From the pension share of your payroll deductions, already taken from your pay. No opt-out.',
    canOptOut: false
  },
  tur: {
    scheme: 'Turkish SGK pension',
    note: 'From the pension share of your social insurance, already deducted from your pay. No opt-out.',
    canOptOut: false
  }
};
