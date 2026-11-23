/* ============================================================================
   World Life 2.5 — Money / Health / Career / School / University / Gulf events
   Worker B. Every event declares honest gates; every choice moves a real
   number through the game systems (ledger, vitals, skills, reputation,
   relationship metrics, career performance/salary).
   ========================================================================== */

import { chance, clamp, pick, randInt } from '../core/rng.js';
import { recordJournal, walletMove, moveBalance, queueScene } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraLocalCost, eraSalary, convertCurrency } from '../data/economy.js';
import { rememberDeed } from '../systems/soulEngine.js';
/* v2.11 W3 — the "real business plan" choice below CREATES a real
   business via Worker 1's createBusiness in businessEngine.js
   (contract: createBusiness(S, typeId, customName, opts) -> { ok, msg,
   biz }; it charges the startup capital and creates the business in
   S.career.businesses with a P&L — computeBusinessMonth in the same
   file. The old name launchSmallBusiness still exists as a wrapper in
   careerEducationEngine.js and delegates to createBusiness.) The
   first staff come from Worker 2's ensureStaffArray in businessStaff.js
   (named people with real wages from the venture's own roles; the
   startup capital covers their setup, their wages then run through the
   monthly P&L). listAllBusinessVentures picks the cheapest venture the
   player actually qualifies for, so the capital charged is a real number
   from the launch list, not an invented one. */
import { createBusiness, computeBusinessMonth } from '../systems/businessEngine.js';
import { ensureStaffArray } from '../systems/businessStaff.js';
import { listAllBusinessVentures } from '../systems/careerEducationEngine.js';
import { businessesOf, ensureBusinessContract } from '../systems/businessPremises.js';
/* v2.7 — event purchases go through the real shop catalogue (see
   buyShopItemForEvent in economyEngine.js): real item, real price, charged
   through the ledger, and the item exists in the player's possessions after. */
import { cheapestShopItem, shopItemPriceLocal, buyShopItemForEvent } from '../systems/economyEngine.js';

/* Cheapest mobile phone on sale this year (landlines and pagers excluded) —
   the real phone a child or a parent would actually be bought. */
function cheapestMobilePhone(S) {
  return cheapestShopItem(S, it => it.category === 'phone' && !/landline|corded|cordless|pager|telephone/i.test(it.name));
}

/* v2.11 W3 — the cheapest venture this player can actually launch right
   now (no degree they lack — cheapest startup capital first). The side
   business in ev_career_side_business starts here: a
   small job done for a customer, turned into the smallest real business
   it can become. Returns null when nothing is launchable yet (the
   event's choice then says so plainly instead of promising a business
   the launcher would refuse). */
function cheapestLaunchableVenture(S) {
  const all = listAllBusinessVentures(S) || [];
  const ok = all.filter((b) => (!b.reqMajor || (S.education.degrees || []).includes(b.reqMajor)));
  ok.sort((a, b) => (Number(a.capitalUsd2026 || 0)) - (Number(b.capitalUsd2026 || 0)));
  return ok[0] || null;
}
function launchCapitalLocal(S, venture) {
  if (!venture) return 0;
  return Math.round(convertCurrency(Number(venture.capitalUsd2026 || 0), 'usa', S.country, S.year));
}

export const EVENTS_MONEY_HEALTH_CAREER = [
  {
    id: 'ev_money_rent_rise', category: 'money',
    gates: { minAge: 18, housingModes: ['rent'], minRent: 1 },
    build: (S) => {
      const oldRent = Math.round(S.housing.monthlyRent);
      const requested = Math.round(oldRent * 1.08);
      const negotiated = Math.round(oldRent * 1.04);
      const applyRent = (st, rent, note) => {
        st.housing.monthlyRent = rent;
        st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
        recordJournal(st, `${note} Monthly rent is now ${formatMoney(rent, st.country)}. It will be charged in the next monthly settlement, not again today.`, 'housing');
      };
      return {
        key: 'ev_money_rent_rise', category: 'money', title: 'The Renewal Offer',
        text: `The renewal offer for your home in ${S.city} raises monthly rent from ${formatMoney(oldRent, S.country)} to ${formatMoney(requested, S.country)}. There is room to discuss it before the next bill.`,
        choices: [
          { label: `Accept ${formatMoney(requested, S.country)} per month`, effect: st => applyRent(st, requested, 'You accepted the renewal offer.') },
          { label: 'Push for a smaller increase', effect: st => {
            const agreed = chance(st, 0.55) ? negotiated : requested;
            applyRent(st, agreed, agreed === negotiated ? 'The landlord agreed to a smaller increase.' : 'The landlord refused the counteroffer; you kept the home at the quoted rent.');
            st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
          } },
          { label: 'Keep the home for now, but start looking elsewhere', effect: st => {
            applyRent(st, requested, 'You kept the home at the renewal price while looking elsewhere.');
            recordJournal(st, 'No move or deposit has happened yet. Compare actual homes before signing another lease.', 'housing');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_money_electricity_spike',
    category: 'money',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 18, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(900, S.country, S.year);
      const B = eraLocalCost(450, S.country, S.year);
      return {
        key: 'ev_money_electricity_spike',
        category: 'money',
        title: "The Electricity Bill Doubles",
        text: `The electricity bill arrives and it is ${formatMoney(A, S.country)} — nearly double last month. The meter man shrugs: the air conditioning ran all summer, and the tariff went up again in ${S.year}.`,
        choices: [
          {
            label: "Pay it in full and cut back on the air conditioning",
            effect: (st) => {
              walletMove(st, -A, 'Pay it in full and cut back on the air conditioning', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You paid the ${formatMoney(A, S.country)} electricity bill in full and started switching the air conditioning off at night.`, 'money');
            },
          },
          {
            label: "Pay half now and ask for a payment plan",
            effect: (st) => {
              walletMove(st, -B, 'Pay half now and ask for a payment plan', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.money.creditScore = clamp(st.money.creditScore + (-5), 300, 900);
              recordJournal(st, `You paid half the electricity bill and arranged to pay the rest over the next two months.`, 'money');
            },
          },
          {
            label: "Complain at the electricity office",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You spent a morning queuing at the electricity office. Nobody could explain the bill.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_fridge_breaks',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 18, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      // v2.7: a new fridge is the cheapest fridge actually in the shop
      // catalogue, at its real shop price — the old figure was a made-up
      // local number far below any real fridge. The repair stays a service:
      // charged through the ledger with a named line.
      const fridge = cheapestShopItem(S, it => it.category === 'appliances' && it.subcat === 'fridge');
      const A = fridge ? shopItemPriceLocal(S, fridge) : eraLocalCost(2600, S.country, S.year);
      const B = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_money_fridge_breaks',
        category: 'money',
        title: "The Fridge Dies Overnight",
        text: `You open the fridge in the morning and warm air comes out. Everything inside is ruined, and the repairman says the compressor is gone. A new ${fridge ? `${fridge.brand} ${fridge.name}` : 'fridge'} from the shop costs ${formatMoney(A, S.country)}; a repair costs ${formatMoney(B, S.country)} and might last a year.`,
        choices: [
          {
            label: `Buy a new fridge (${formatMoney(A, S.country)})`,
            available: (st) => st.money.cash >= A,
            effect: (st) => {
              const res = fridge
                ? buyShopItemForEvent(st, fridge, { label: `New ${fridge.brand} ${fridge.name} (shop catalogue)` })
                : { ok: false, msg: 'No fridge in the shop catalogue.' };
              if (res.ok) {
                st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
                recordJournal(st, `The old fridge died and you bought a new ${fridge.brand} ${fridge.name} for ${formatMoney(res.priceLocal, S.country)}. It was delivered and is now in your kitchen.`, 'money');
              } else {
                recordJournal(st, `You wanted a new fridge but could not pay for it (${res.msg}). The old fridge is still dead.`, 'money');
              }
            },
          },
          {
            label: "Pay for the repair and hope it holds",
            effect: (st) => {
              walletMove(st, -B, 'Pay for the repair and hope it holds', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You paid ${formatMoney(B, S.country)} to repair the fridge. It hums again, but you do not trust it.`, 'money');
            },
          },
          {
            label: "Borrow a neighbour\u2019s spare fridge for a week",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `With the fridge dead, you borrowed a neighbour’s spare and squeezed your food into it.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_washing_machine',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 18, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(500, S.country, S.year);
      // v2.7: the replacement is a REAL second-hand washer from the shop
      // catalogue — the cheapest washer on sale this year, at half its new
      // shop price — not a made-up number. It is delivered to the home and
      // lands in the player's owned possessions (see the choice effect).
      const washer = cheapestShopItem(S, it => it.category === 'appliances' && it.subcat === 'washing');
      const B = washer ? shopItemPriceLocal(S, washer, { secondHand: true }) : eraLocalCost(1100, S.country, S.year);
      return {
        key: 'ev_money_washing_machine',
        category: 'money',
        title: "The Washing Machine Floods the Kitchen",
        text: `Halfway through a wash the machine stops, the kitchen floor is under water, and the drum will not turn. The repairman quotes ${formatMoney(A, S.country)} to fix it. A second-hand ${washer ? `${washer.brand} ${washer.name}` : 'washing machine'} from the shop costs ${formatMoney(B, S.country)} — half its new shop price — and would be delivered to your home.`,
        choices: [
          {
            label: "Repair it",
            effect: (st) => {
              walletMove(st, -A, 'Repair it', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `The washing machine flooded the kitchen. You paid ${formatMoney(A, S.country)} to have it repaired.`, 'money');
            },
          },
          {
            label: `Buy a second-hand replacement (${formatMoney(B, S.country)})`,
            available: (st) => st.money.cash >= B,
            effect: (st) => {
              const res = washer
                ? buyShopItemForEvent(st, washer, { secondHand: true, label: `Second-hand ${washer.brand} ${washer.name} (shop catalogue)` })
                : { ok: false, msg: 'No washing machine in the shop catalogue.' };
              if (res.ok) {
                st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
                recordJournal(st, `You replaced the dead washing machine with a second-hand ${washer.brand} ${washer.name} for ${formatMoney(res.priceLocal, S.country)}. It was delivered to your home and is now yours.`, 'money');
              } else {
                recordJournal(st, `You wanted a second-hand washing machine but could not pay for it (${res.msg}). The old machine is still dead.`, 'money');
              }
            },
          },
          {
            label: "Wash by hand until payday",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-4));
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              recordJournal(st, `With no money for the repair, you washed everything by hand for two weeks.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_phone_screen',
    category: 'money',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 14, "minYear": 2000, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(600, S.country, S.year);
      const B = eraLocalCost(250, S.country, S.year);
      return {
        key: 'ev_money_phone_screen',
        category: 'money',
        title: "The Phone Screen Shatters",
        text: `The phone slips out of your hand on the pavement in ${S.city} and lands face down. The screen is a spiderweb of cracks. A proper repair costs ${formatMoney(A, S.country)}; a cheap shop will do it for ${formatMoney(B, S.country)}.`,
        choices: [
          {
            label: "Repair it properly",
            effect: (st) => {
              walletMove(st, -A, 'Repair it properly', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You cracked your phone screen and paid ${formatMoney(A, S.country)} for a proper repair.`, 'money');
            },
          },
          {
            label: "Use the cheap shop",
            effect: (st) => {
              walletMove(st, -B, 'Use the cheap shop', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You had the cracked screen replaced at a cheap shop for ${formatMoney(B, S.country)}. It works, mostly.`, 'money');
            },
          },
          {
            label: "Live with the cracks",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You could not afford the repair, so you kept using the phone with a shattered screen.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_car_repair',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 20, "hasCar": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1400, S.country, S.year);
      const B = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_money_car_repair',
        category: 'money',
        title: "The Car Makes a New Noise",
        text: `On the way to work the car starts grinding every time you brake. The mechanic lifts it up, shakes his head, and quotes ${formatMoney(A, S.country)} for brakes and a worn part he says cannot wait.`,
        choices: [
          {
            label: "Pay for the repair now",
            effect: (st) => {
              walletMove(st, -A, 'Pay for the repair now', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `The car needed new brakes. You paid ${formatMoney(A, S.country)} and drove home quietly.`, 'money');
            },
          },
          {
            label: "Ask him to do the brakes only",
            effect: (st) => {
              walletMove(st, -B, 'Ask him to do the brakes only', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You paid ${formatMoney(B, S.country)} for the brakes only and left the other part for later, hoping it holds.`, 'money');
            },
          },
          {
            label: "Leave the car and take the bus for a month",
            effect: (st) => {
              walletMove(st, -B, 'Leave the car and take the bus for a month', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You left the car parked and took the bus for a month while you saved for the ${formatMoney(A, S.country)} repair.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_dentist_bill',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 18, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1800, S.country, S.year);
      const B = eraLocalCost(400, S.country, S.year);
      return {
        key: 'ev_money_dentist_bill',
        category: 'money',
        title: "The Toothache Bill",
        text: `The tooth that has been aching for a week finally forces you to the dentist. He looks, taps it, and says it needs a root canal: ${formatMoney(A, S.country)}, or extraction for ${formatMoney(B, S.country)}.`,
        choices: [
          {
            label: "Pay for the root canal",
            effect: (st) => {
              walletMove(st, -A, 'Pay for the root canal', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} for a root canal and the toothache finally stopped.`, 'money');
            },
          },
          {
            label: "Have the tooth pulled",
            effect: (st) => {
              walletMove(st, -B, 'Have the tooth pulled', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You had the aching tooth pulled for ${formatMoney(B, S.country)}. It is gone, and you miss it.`, 'money');
            },
          },
          {
            label: "Take painkillers and wait",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You could not pay the dentist, so you lived on painkillers and hoped the tooth would settle.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_school_fees_due',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 24, "hasChildren": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3500, S.country, S.year);
      const B = eraLocalCost(1750, S.country, S.year);
      return {
        key: 'ev_money_school_fees_due',
        category: 'money',
        title: "School Fees Are Due on Monday",
        text: `${childName}Name’s school sends the note home: fees of ${formatMoney(A, S.country)} are due on Monday, or ${childName}Name cannot sit the new term. The school office is firm — they have heard every excuse before.`,
        choices: [
          {
            label: "Pay the fees in full",
            effect: (st) => {
              walletMove(st, -A, 'Pay the fees in full', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Pay the fees in full', { affection: (+4) });
              recordJournal(st, `You paid ${childName}Name’s school fees of ${formatMoney(A, S.country)} in full, on time.`, 'money');
            },
          },
          {
            label: "Pay half and beg for a month",
            effect: (st) => {
              walletMove(st, -B, 'Pay half and beg for a month', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You paid half of ${childName}Name’s school fees and asked the school for a month to find the rest.`, 'money');
            },
          },
          {
            label: "Move $childName to a cheaper school",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Move $childName to a cheaper school', { affection: (-6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-4));
              recordJournal(st, `You could not pay the fees, so you moved ${childName}Name to a cheaper school across ${S.city}.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_sibling_loan',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['sib'],"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      const B = eraLocalCost(600, S.country, S.year);
      return {
        key: 'ev_money_sibling_loan',
        category: 'money',
        title: `${sibName} Asks for a Loan`,
        text: `${sibName} calls, embarrassed. The rent is due, the salary is late, and ${formatMoney(A, S.country)} would get through the month. ${sibName} promises to pay it back by the end of next month — and means it, you think.`,
        choices: [
          {
            label: "Lend the money",
            effect: (st) => {
              walletMove(st, -A, 'Lend the money', 'money');
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Lend the money', { affection: (+6) });
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Lend the money', { trust: (+5) });
              recordJournal(st, `You lent ${sibName} ${formatMoney(A, S.country)} to cover the rent. ${sibName} promised to pay it back next month.`, 'money');
            },
          },
          {
            label: "Lend half",
            effect: (st) => {
              walletMove(st, -B, 'Lend half', 'money');
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Lend half', { affection: (+2) });
              recordJournal(st, `You lent ${sibName} ${formatMoney(B, S.country)} — half of what was asked — and said that was all you could spare.`, 'money');
            },
          },
          {
            label: "Say no, you cannot afford it",
            effect: (st) => {
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Say no, you cannot afford it', { affection: (-8) });
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Say no, you cannot afford it', { trust: (-5) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You told ${sibName} you could not lend the money. ${sibName} went quiet and hung up.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_parent_medicine',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(450, S.country, S.year);
      const B = eraLocalCost(225, S.country, S.year);
      return {
        key: 'ev_money_parent_medicine',
        category: 'money',
        title: `${momName} Needs Medicine Money`,
        text: `${momName} calls from the pharmacy. Her blood pressure medicine costs ${formatMoney(A, S.country)} this month and her pension does not stretch. She says not to worry, she will manage — which is exactly how you know she will not.`,
        choices: [
          {
            label: "Send the money right away",
            effect: (st) => {
              walletMove(st, -A, 'Send the money right away', 'money');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Send the money right away', { affection: (+7) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You sent ${momName} ${formatMoney(A, S.country)} for her medicine without a second thought.`, 'money');
            },
          },
          {
            label: "Send half and promise the rest next week",
            effect: (st) => {
              walletMove(st, -B, 'Send half and promise the rest next week', 'money');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Send half and promise the rest next week', { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You sent ${momName} half the medicine money and promised the rest next week.`, 'money');
            },
          },
          {
            label: `Tell her to ask ${dadName} first`,
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Tell her to ask ${dadName} first`, { affection: (-6) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You told ${momName} to ask ${dadName} for the medicine money. She did not call back that evening.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_friend_loan',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 18, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      const B = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_money_friend_loan',
        category: 'money',
        title: "$fr Asks to Borrow Money",
        text: `${frName} meets you for coffee and, after ten minutes of small talk, asks for ${formatMoney(A, S.country)}. A debt is chasing ${frName}, and this would stop the calls. ${frName} swears it will be repaid in three weeks.`,
        choices: [
          {
            label: "Lend it",
            effect: (st) => {
              walletMove(st, -A, 'Lend it', 'money');
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Lend it', { affection: (+5) });
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Lend it', { trust: (+4) });
              recordJournal(st, `You lent ${frName} ${formatMoney(A, S.country)} to stop the debt collectors calling. ${frName} swore it would be back in three weeks.`, 'money');
            },
          },
          {
            label: "Lend a smaller amount",
            effect: (st) => {
              walletMove(st, -B, 'Lend a smaller amount', 'money');
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Lend a smaller amount', { affection: (+1) });
              recordJournal(st, `You lent ${frName} ${formatMoney(B, S.country)} and said honestly that it was the most you could risk.`, 'money');
            },
          },
          {
            label: "Refuse \u2014 you need it yourself",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Refuse — you need it yourself', { affection: (-7) });
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Refuse — you need it yourself', { trust: (-4) });
              recordJournal(st, `You told ${frName} you could not lend the money. The coffee went cold after that.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_card_minimum',
    category: 'money',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 22, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3200, S.country, S.year);
      const B = eraLocalCost(320, S.country, S.year);
      return {
        key: 'ev_money_card_minimum',
        category: 'money',
        title: "The Credit Card Minimum Trap",
        text: `The credit card statement arrives: you owe ${formatMoney(A, S.country)}, and the bank will accept ${formatMoney(B, S.country)} as a minimum payment. The small print says the rest keeps growing at high interest while you pay the minimum.`,
        choices: [
          {
            label: "Pay the full balance",
            effect: (st) => {
              walletMove(st, -A, 'Pay the full balance', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (+8), 300, 900);
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You paid the full credit card balance of ${formatMoney(A, S.country)} and closed the month clean.`, 'money');
            },
          },
          {
            label: "Pay only the minimum",
            effect: (st) => {
              walletMove(st, -B, 'Pay only the minimum', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (-6), 300, 900);
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You paid only the ${formatMoney(B, S.country)} minimum on the card. The rest keeps growing, quietly.`, 'money');
            },
          },
          {
            label: "Pay half and stop using the card",
            effect: (st) => {
              walletMove(st, -B, 'Pay half and stop using the card', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (+2), 300, 900);
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You paid half the card balance and put the card in a drawer until it is cleared.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_overdraft_fee',
    category: 'money',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(180, S.country, S.year);
      const B = eraLocalCost(180, S.country, S.year);
      return {
        key: 'ev_money_overdraft_fee',
        category: 'money',
        title: "An Overdraft Fee Appears",
        text: `You check the bank and find a fee of ${formatMoney(A, S.country)} taken without warning — the account dipped below zero for two days last week. The bank clerk says the fee is automatic and cannot be reversed.`,
        choices: [
          {
            label: "Accept it and top the account up",
            effect: (st) => {
              walletMove(st, -A, 'Accept it and top the account up', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `The bank took a ${formatMoney(A, S.country)} overdraft fee. You topped the account up and moved on.`, 'money');
            },
          },
          {
            label: "Argue with the bank",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You argued with the bank over the ${formatMoney(A, S.country)} fee for an hour. They kept half of it as a "goodwill" refund.`, 'money');
            },
          },
          {
            label: "Close the account and move banks",
            effect: (st) => {
              walletMove(st, -A, 'Close the account and move banks', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You closed the account over the ${formatMoney(A, S.country)} fee and opened a new one at a different bank.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_collector_call',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(4500, S.country, S.year);
      const B = eraLocalCost(900, S.country, S.year);
      return {
        key: 'ev_money_collector_call',
        category: 'money',
        title: "The Debt Collector Calls",
        text: `A firm voice on the phone says you owe ${formatMoney(A, S.country)} on an old instalment plan, and the amount grows every month you ignore it. He wants a payment today, or the file goes to the next stage.`,
        choices: [
          {
            label: "Pay what you can now",
            effect: (st) => {
              walletMove(st, -B, 'Pay what you can now', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              st.money.creditScore = clamp(st.money.creditScore + (+3), 300, 900);
              recordJournal(st, `You paid ${formatMoney(B, S.country)} toward the old debt and agreed a date for the rest.`, 'money');
            },
          },
          {
            label: "Ask for a written statement first",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              recordJournal(st, `You refused to pay on the phone and demanded a written statement of the ${formatMoney(A, S.country)} debt.`, 'money');
            },
          },
          {
            label: "Hang up and ignore it",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.money.creditScore = clamp(st.money.creditScore + (-10), 300, 900);
              recordJournal(st, `You hung up on the debt collector. The calls kept coming, twice a day.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_salary_delayed',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 20, "hasJob": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_money_salary_delayed',
        category: 'money',
        title: "The Salary Is Late",
        text: `Payday comes and goes and nothing lands in the account. Your manager says the company is waiting on a client payment and the salaries will come "in a few days". The rent is due tomorrow.`,
        choices: [
          {
            label: "Wait quietly and stretch what you have",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `Your salary was late and you stretched what little cash you had until it arrived.`, 'money');
            },
          },
          {
            label: "Ask the manager for an advance",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You asked for a salary advance while the company sorted its payments. It was granted, grudgingly.`, 'money');
            },
          },
          {
            label: "Start looking for a steadier employer",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `A late salary pushed you to start looking for an employer who pays on time.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_bonus',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(5000, S.country, S.year);
      return {
        key: 'ev_money_bonus',
        category: 'money',
        title: "A Bonus Lands in Your Account",
        text: `Your manager calls you in: the year went well, and a bonus of ${formatMoney(A, S.country)} is already in your account. It is not a fortune, but it is real money, and it is yours.`,
        choices: [
          {
            label: "Put it straight into savings",
            effect: (st) => {
              moveBalance(st, 'savings', +A, 'Put it straight into savings', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              recordJournal(st, `You put the whole ${formatMoney(A, S.country)} bonus into savings before you could spend it.`, 'money');
            },
          },
          {
            label: "Spend half on something you have wanted",
            effect: (st) => {
              walletMove(st, +A, 'Spend half on something you have wanted', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You spent part of the ${formatMoney(A, S.country)} bonus on something you had wanted for months.`, 'money');
            },
          },
          {
            label: "Use it to clear a debt",
            effect: (st) => {
              walletMove(st, +A, 'Use it to clear a debt', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (+6), 300, 900);
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              recordJournal(st, `You used the ${formatMoney(A, S.country)} bonus to clear an old debt. The weight of it lifted at once.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_tax_refund',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2200, S.country, S.year);
      return {
        key: 'ev_money_tax_refund',
        category: 'money',
        title: "A Tax Refund Arrives",
        text: `A letter from the tax office: you overpaid last year, and ${formatMoney(A, S.country)} is on its way back to you. It is the kind of letter you open twice to make sure you read it right.`,
        choices: [
          {
            label: "Save it",
            effect: (st) => {
              moveBalance(st, 'savings', +A, 'Save it', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `A tax refund of ${formatMoney(A, S.country)} arrived. You saved all of it.`, 'money');
            },
          },
          {
            label: "Treat the family",
            effect: (st) => {
              walletMove(st, +A, 'Treat the family', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+7));
              recordJournal(st, `You spent the ${formatMoney(A, S.country)} tax refund on a proper family meal out — the first in a long while.`, 'money');
            },
          },
          {
            label: "Pay down the card",
            effect: (st) => {
              walletMove(st, +A, 'Pay down the card', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (+5), 300, 900);
              recordJournal(st, `You put the ${formatMoney(A, S.country)} tax refund straight against the credit card balance.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_gamiya_payout',
    category: 'money',
    repeatable: true,
    cooldownYears: 4,
    gates: {"minAge": 22, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(6000, S.country, S.year);
      return {
        key: 'ev_money_gamiya_payout',
        category: 'money',
        title: "Your Gamiya Turn Comes Up",
        text: `It is your month in the gamiya — the savings circle you joined with neighbours and cousins. ${formatMoney(A, S.country)} is handed to you in cash, counted twice, and suddenly the month looks very different.`,
        choices: [
          {
            label: "Put it in savings",
            effect: (st) => {
              moveBalance(st, 'savings', +A, 'Put it in savings', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `Your gamiya turn came up: ${formatMoney(A, S.country)}, saved the same day.`, 'money');
            },
          },
          {
            label: "Pay off the most urgent bill",
            effect: (st) => {
              walletMove(st, +A, 'Pay off the most urgent bill', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              recordJournal(st, `Your gamiya payout of ${formatMoney(A, S.country)} went straight to the most urgent bill on the table.`, 'money');
            },
          },
          {
            label: "Buy something the house needs",
            effect: (st) => {
              walletMove(st, +A, 'Buy something the house needs', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You used the ${formatMoney(A, S.country)} gamiya payout to buy something the house has needed for a year.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_gold_rise',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 25},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(8000, S.country, S.year);
      const B = eraLocalCost(4000, S.country, S.year);
      return {
        key: 'ev_money_gold_rise',
        category: 'money',
        title: "Gold Prices Jump",
        text: `Gold has jumped this month, and the jeweller in ${S.city} offers a good price for the grams you have been holding. Selling now would put ${formatMoney(A, S.country)} in your hand.`,
        choices: [
          {
            label: "Sell the gold",
            effect: (st) => {
              walletMove(st, +A, 'Sell the gold', 'money');
              st.money.goldGrams21k = Math.max(0, (st.money.goldGrams21k || 0) + (-5));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              recordJournal(st, `You sold some gold while the price was high and took ${formatMoney(A, S.country)} in cash.`, 'money');
            },
          },
          {
            label: "Hold on \u2014 it may go higher",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You held the gold, betting the price would climb further.`, 'money');
            },
          },
          {
            label: "Sell half",
            effect: (st) => {
              walletMove(st, +B, 'Sell half', 'money');
              st.money.goldGrams21k = Math.max(0, (st.money.goldGrams21k || 0) + (-2));
              recordJournal(st, `You sold half the gold for ${formatMoney(B, S.country)} and kept the rest for a harder day.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_wedding_gift_cash',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 20},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_money_wedding_gift_cash',
        category: 'money',
        title: "A Wedding Gift of Cash",
        text: `At a cousin’s wedding in ${S.city}, an uncle presses an envelope into your hand: ${formatMoney(A, S.country)}, "for the young ones". It is more than you expected, and it is given with real warmth.`,
        choices: [
          {
            label: "Save it",
            effect: (st) => {
              moveBalance(st, 'savings', +A, 'Save it', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `An uncle gave you ${formatMoney(A, S.country)} at a wedding. You saved it.`, 'money');
            },
          },
          {
            label: "Spend it on the house",
            effect: (st) => {
              walletMove(st, +A, 'Spend it on the house', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You spent the ${formatMoney(A, S.country)} wedding gift on something the house needed.`, 'money');
            },
          },
          {
            label: `Give half to ${momName}`,
            effect: (st) => {
              walletMove(st, +A, `Give half to ${momName}`, 'money');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Give half to ${momName}`, { affection: (+5) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You gave half the wedding gift money to ${momName}. She tried to refuse, then kept it.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_funeral_collection',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(300, S.country, S.year);
      const B = eraLocalCost(150, S.country, S.year);
      return {
        key: 'ev_money_funeral_collection',
        category: 'money',
        title: "A Collection for a Neighbour\u2019s Funeral",
        text: `A neighbour has died, and the building is collecting ${formatMoney(A, S.country)} from each flat for the funeral and the days after. Everyone is giving; the list is going round the door.`,
        choices: [
          {
            label: "Give the full amount",
            effect: (st) => {
              walletMove(st, -A, 'Give the full amount', 'money');
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You gave ${formatMoney(A, S.country)} to the funeral collection for your neighbour.`, 'money');
            },
          },
          {
            label: "Give what you can",
            effect: (st) => {
              walletMove(st, -B, 'Give what you can', 'money');
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You gave ${formatMoney(B, S.country)} to the funeral collection — less than asked, all you could spare.`, 'money');
            },
          },
          {
            label: "Say you will give tomorrow",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              recordJournal(st, `You told the collector you would give tomorrow, and hoped nobody noticed you had not.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_eid_children',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 24, "hasChildren": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1800, S.country, S.year);
      const B = eraLocalCost(900, S.country, S.year);
      return {
        key: 'ev_money_eid_children',
        category: 'money',
        title: "Eid Money for the Children",
        text: `Eid is coming and the children are already counting. The custom is clear: new clothes and Eid money for each child, about ${formatMoney(A, S.country)} in total. The children have not stopped talking about it.`,
        choices: [
          {
            label: "Buy the clothes and give the money",
            effect: (st) => {
              walletMove(st, -A, 'Buy the clothes and give the money', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Buy the clothes and give the money', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You bought Eid clothes and gave the children their Eid money — ${formatMoney(A, S.country)} in total.`, 'money');
            },
          },
          {
            label: "Give the money, skip the new clothes",
            effect: (st) => {
              walletMove(st, -B, 'Give the money, skip the new clothes', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Give the money, skip the new clothes', { affection: (+2) });
              recordJournal(st, `You gave the children Eid money of ${formatMoney(B, S.country)} and told them the old clothes would do one more Eid.`, 'money');
            },
          },
          {
            label: "Ask them to wait until payday",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Ask them to wait until payday', { affection: (-4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You told the children the Eid money would have to wait until payday. Their faces fell.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_ramadan_food',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 22, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2400, S.country, S.year);
      const B = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_money_ramadan_food',
        category: 'money',
        title: "Ramadan Food Costs Climb",
        text: `Ramadan is a week away and the market prices have already climbed. The month’s food — dates, meat, sweets for the family table — will cost about ${formatMoney(A, S.country)} more than a normal month.`,
        choices: [
          {
            label: "Buy properly for the month",
            effect: (st) => {
              walletMove(st, -A, 'Buy properly for the month', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You bought properly for Ramadan: ${formatMoney(A, S.country)} of food for the family table.`, 'money');
            },
          },
          {
            label: "Buy the basics only",
            effect: (st) => {
              walletMove(st, -B, 'Buy the basics only', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You bought only the basics for Ramadan, ${formatMoney(B, S.country)}, and kept the table simple.`, 'money');
            },
          },
          {
            label: `Ask ${momName} to cook at her place instead`,
            effect: (st) => {
              walletMove(st, -B, `Ask ${momName} to cook at her place instead`, 'money');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Ask ${momName} to cook at her place instead`, { affection: (+4) });
              recordJournal(st, `You asked ${momName} to host the family iftars this Ramadan, and brought ${formatMoney(B, S.country)} of food to her kitchen.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_uniform_cost',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 24, "hasChildren": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1400, S.country, S.year);
      const B = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_money_uniform_cost',
        category: 'money',
        title: "New School Uniforms",
        text: `${childName}Name has outgrown everything. The school shop lists the full uniform at ${formatMoney(A, S.country)}, and the shoes alone are ${formatMoney(B, S.country)}. The old uniform is two sizes too small and patched at the knee.`,
        choices: [
          {
            label: "Buy the full uniform",
            effect: (st) => {
              walletMove(st, -A, 'Buy the full uniform', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Buy the full uniform', { affection: (+3) });
              recordJournal(st, `You bought ${childName}Name the full new school uniform for ${formatMoney(A, S.country)}.`, 'money');
            },
          },
          {
            label: "Buy the essentials only",
            effect: (st) => {
              walletMove(st, -B, 'Buy the essentials only', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Buy the essentials only', { affection: (+1) });
              recordJournal(st, `You bought ${childName}Name the essential uniform pieces for ${formatMoney(B, S.country)} and made the rest last.`, 'money');
            },
          },
          {
            label: "Buy second-hand from another parent",
            effect: (st) => {
              walletMove(st, -B, 'Buy second-hand from another parent', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You bought ${childName}Name a second-hand uniform from another parent for ${formatMoney(B, S.country)}.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_ac_bill',
    category: 'money',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1100, S.country, S.year);
      return {
        key: 'ev_money_ac_bill',
        category: 'money',
        title: "The Summer Air Conditioning Bill",
        text: `August in ${S.city} is brutal, and the air conditioning has run day and night. The bill is ${formatMoney(A, S.country)} — the biggest of the year — and there are still three hot weeks left.`,
        choices: [
          {
            label: "Pay it and keep cool",
            effect: (st) => {
              walletMove(st, -A, 'Pay it and keep cool', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You paid the ${formatMoney(A, S.country)} summer electricity bill and kept the air conditioning on.`, 'money');
            },
          },
          {
            label: "Pay it and ration the cooling",
            effect: (st) => {
              walletMove(st, -A, 'Pay it and ration the cooling', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              recordJournal(st, `You paid the bill and started switching the air conditioning off for hours at a time.`, 'money');
            },
          },
          {
            label: "Sleep on the roof like the old days",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You skipped the worst of the bill by sleeping on the roof some nights, the way your grandparents did.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_plumber_leak',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(900, S.country, S.year);
      const B = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_money_plumber_leak',
        category: 'money',
        title: "A Pipe Bursts at Midnight",
        text: `Water is running across the bathroom floor at midnight. The emergency plumber comes, works for two hours, and charges ${formatMoney(A, S.country)}. The pipe, he says, was old before you moved in.`,
        choices: [
          {
            label: "Pay the emergency call-out",
            effect: (st) => {
              walletMove(st, -A, 'Pay the emergency call-out', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `A pipe burst at midnight. The emergency plumber charged ${formatMoney(A, S.country)}.`, 'money');
            },
          },
          {
            label: "Patch it yourself until morning",
            effect: (st) => {
              walletMove(st, -B, 'Patch it yourself until morning', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+1));
              recordJournal(st, `You patched the burst pipe yourself with tape and a bucket, and called a proper plumber in the morning for ${formatMoney(B, S.country)}.`, 'money');
            },
          },
          {
            label: "Ask the landlord to pay",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You told the landlord the burst pipe was his pipe, and his bill. He argued, then paid half.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_stolen_wallet',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 16, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_money_stolen_wallet',
        category: 'money',
        title: "Your Wallet Is Stolen",
        text: `On a crowded bus in ${S.city}, your pocket feels suddenly light. Your wallet is gone — ${formatMoney(A, S.country)} in cash, your ID, and every card. The police station takes a report and shrugs.`,
        choices: [
          {
            label: "Cancel everything and replace the ID",
            effect: (st) => {
              walletMove(st, -A, 'Cancel everything and replace the ID', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-4));
              recordJournal(st, `Your wallet was stolen with ${formatMoney(A, S.country)} inside. You spent the day cancelling cards and replacing your ID.`, 'money');
            },
          },
          {
            label: "Borrow from $fr until payday",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Borrow from $fr until payday', { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `With your wallet stolen, you borrowed from ${frName} to get through the week.`, 'money');
            },
          },
          {
            label: "Report it and wait",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              recordJournal(st, `You reported the stolen wallet and waited, hoping the police or a stranger would find it.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_grocery_inflation',
    category: 'money',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      const B = eraLocalCost(1000, S.country, S.year);
      return {
        key: 'ev_money_grocery_inflation',
        category: 'money',
        title: "The Market Prices Jump Again",
        text: `At the market, the same weekly shop that cost ${formatMoney(B, S.country)} last year now costs ${formatMoney(A, S.country)}. The seller does not even apologise anymore — he just weighs, bags, and names the new price.`,
        choices: [
          {
            label: "Buy the same shop and pay it",
            effect: (st) => {
              walletMove(st, -A, 'Buy the same shop and pay it', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `The weekly shop now costs ${formatMoney(A, S.country)}. You paid it and carried it home.`, 'money');
            },
          },
          {
            label: "Buy less and cook simpler meals",
            effect: (st) => {
              walletMove(st, -B, 'Buy less and cook simpler meals', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              recordJournal(st, `You bought a smaller shop for ${formatMoney(B, S.country)} and cooked simpler meals all week.`, 'money');
            },
          },
          {
            label: "Shop at the cheaper market across town",
            effect: (st) => {
              walletMove(st, -B, 'Shop at the cheaper market across town', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You started shopping at the cheaper market across town, saving on the weekly shop.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_zakat_due',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 25},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      const B = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_money_zakat_due',
        category: 'money',
        title: "Zakat Is Due",
        text: `Ramadan is here, and your zakat is due: ${formatMoney(A, S.country)} on the savings you have held for a year. It is not a bill — it is an obligation, and you know exactly who in the family needs it most.`,
        choices: [
          {
            label: "Pay it in full",
            effect: (st) => {
              walletMove(st, -A, 'Pay it in full', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You paid your zakat of ${formatMoney(A, S.country)} in full, to family who needed it.`, 'money');
            },
          },
          {
            label: "Pay half now, half next month",
            effect: (st) => {
              walletMove(st, -B, 'Pay half now, half next month', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You paid half your zakat now, ${formatMoney(B, S.country)}, and promised the rest next month.`, 'money');
            },
          },
          {
            label: "Give it as food instead of cash",
            effect: (st) => {
              walletMove(st, -A, 'Give it as food instead of cash', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You gave your zakat as food parcels worth ${formatMoney(A, S.country)}, handed out yourself.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_investment_tip',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 25, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(5000, S.country, S.year);
      const B = eraLocalCost(1000, S.country, S.year);
      return {
        key: 'ev_money_investment_tip',
        category: 'money',
        title: "$fr Has a \"Certain\" Investment Tip",
        text: `${frName} corners you with a tip: a stock that "cannot lose", and ${formatMoney(A, S.country)} to get in now before it moves. ${frName} has already put money in, and shows you the chart on a phone like it is proof.`,
        choices: [
          {
            label: "Invest the money",
            effect: (st) => {
              walletMove(st, -A, 'Invest the money', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You put ${formatMoney(A, S.country)} into ${frName}’s "certain" stock tip. Now you check the price every morning.`, 'money');
            },
          },
          {
            label: "Invest a small test amount",
            effect: (st) => {
              walletMove(st, -B, 'Invest a small test amount', 'money');
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              recordJournal(st, `You put a small test amount, ${formatMoney(B, S.country)}, into the tip — enough to learn, not enough to hurt.`, 'money');
            },
          },
          {
            label: "Decline \u2014 you do not gamble on tips",
            effect: (st) => {
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You declined the investment tip. ${frName} called you cautious, and you did not mind.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_bank_certificate',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 25, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(10000, S.country, S.year);
      const B = eraLocalCost(5000, S.country, S.year);
      return {
        key: 'ev_money_bank_certificate',
        category: 'money',
        title: "The Bank Offers a Certificate",
        text: `Your bank calls with an offer: lock ${formatMoney(A, S.country)} away for a year in a certificate and earn a good return. The money would be untouchable until it matures — no early withdrawals.`,
        choices: [
          {
            label: "Lock the money away",
            effect: (st) => {
              moveBalance(st, 'savings', -A, 'Lock the money away', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              recordJournal(st, `You locked ${formatMoney(A, S.country)} into a one-year bank certificate.`, 'money');
            },
          },
          {
            label: "Keep the money free",
            effect: (st) => {
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+1));
              recordJournal(st, `You declined the certificate. You like your money where you can reach it.`, 'money');
            },
          },
          {
            label: "Lock half away",
            effect: (st) => {
              moveBalance(st, 'savings', -B, 'Lock half away', 'money');
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You locked ${formatMoney(B, S.country)} into the certificate and kept the rest free.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_deposit_dispute',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "hasHome": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      const B = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_money_deposit_dispute',
        category: 'money',
        title: "The Old Landlord Keeps the Deposit",
        text: `You moved out a month ago, and the old landlord still has your ${formatMoney(A, S.country)} deposit. He claims the flat was damaged — the stain on the wall was there when you arrived, and you both know it.`,
        choices: [
          {
            label: "Fight for the full deposit",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You fought the old landlord for your ${formatMoney(A, S.country)} deposit, with photos and a written complaint.`, 'money');
            },
          },
          {
            label: "Accept half and walk away",
            effect: (st) => {
              walletMove(st, +B, 'Accept half and walk away', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You accepted half the deposit back, ${formatMoney(B, S.country)}, and walked away from the argument.`, 'money');
            },
          },
          {
            label: "Let it go entirely",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You let the ${formatMoney(A, S.country)} deposit go. The fight would have cost more than the money.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_moving_costs',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2500, S.country, S.year);
      const B = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_money_moving_costs',
        category: 'money',
        title: "Moving Day Costs More Than Planned",
        text: `The movers, the van, the new locks, the cleaning of the old flat — moving day in ${S.city} adds up to ${formatMoney(A, S.country)}, and the van driver wants cash before he unloads a single box.`,
        choices: [
          {
            label: "Pay it all and get it done",
            effect: (st) => {
              walletMove(st, -A, 'Pay it all and get it done', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `Moving day cost ${formatMoney(A, S.country)} in total. You paid it and slept in the new flat that night.`, 'money');
            },
          },
          {
            label: "Move half yourself with friends",
            effect: (st) => {
              walletMove(st, -B, 'Move half yourself with friends', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Move half yourself with friends', { affection: (+3) });
              recordJournal(st, `You moved half the flat yourself with ${frName}’s help, cutting the cost to ${formatMoney(B, S.country)}.`, 'money');
            },
          },
          {
            label: "Delay the move by a month",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You delayed the move by a month to spread the ${formatMoney(A, S.country)} cost across two paydays.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_baby_costs',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'spouse', 'child'],"minAge": 24, "hasChildren": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      const B = eraLocalCost(1000, S.country, S.year);
      return {
        key: 'ev_money_baby_costs',
        category: 'money',
        title: "The Baby Needs Everything at Once",
        text: `The baby has outgrown the clothes, the nappies are nearly gone, and the clinic visit costs ${formatMoney(A, S.country)}. Babies do not wait for payday — everything is needed this week.`,
        choices: [
          {
            label: "Buy everything now",
            effect: (st) => {
              walletMove(st, -A, 'Buy everything now', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Buy everything now', { affection: (+4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You bought everything the baby needed, ${formatMoney(A, S.country)} in total, in one trip.`, 'money');
            },
          },
          {
            label: "Buy the essentials, borrow the rest",
            effect: (st) => {
              walletMove(st, -B, 'Buy the essentials, borrow the rest', 'money');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Buy the essentials, borrow the rest', { affection: (+3) });
              recordJournal(st, `You bought the essentials for ${formatMoney(B, S.country)} and borrowed the baby clothes from ${momName}’s stash.`, 'money');
            },
          },
          {
            label: "Ask $sp to cover it this time",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Ask $sp to cover it this time', { affection: (-2) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You asked ${spName} to cover the baby costs this time. ${spName} paid, without a word.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_child_phone',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 30, "hasChildren": true, "minYear": 2005},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      // v2.7: the phone is a real mobile from the shop catalogue — the
      // cheapest on sale this year — new, or second-hand at half its price.
      const phoneItem = cheapestMobilePhone(S);
      const A = phoneItem ? shopItemPriceLocal(S, phoneItem) : eraLocalCost(3500, S.country, S.year);
      const B = phoneItem ? shopItemPriceLocal(S, phoneItem, { secondHand: true }) : eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_money_child_phone',
        category: 'money',
        title: "$childName Wants a Phone Like Everyone Else",
        text: `${childName}Name comes home from school: everyone in the class has a phone, and the cheapest decent one — a ${phoneItem ? `${phoneItem.brand} ${phoneItem.name}` : 'basic mobile'} from the shop — is ${formatMoney(A, S.country)}. ${childName}Name promises to look after it, to study harder, to never lose it.`,
        choices: [
          {
            label: `Buy the phone (${formatMoney(A, S.country)})`,
            available: (st) => st.money.cash >= A,
            effect: (st) => {
              const res = phoneItem
                ? buyShopItemForEvent(st, phoneItem, { label: `Phone for ${childName}Name (shop catalogue)` })
                : { ok: false, msg: 'No phone in the shop catalogue.' };
              if (res.ok) {
                if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Buy the phone', { affection: (+6) });
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
                recordJournal(st, `You bought ${childName}Name a ${phoneItem.brand} ${phoneItem.name} for ${formatMoney(res.priceLocal, S.country)}. The smile lasted all evening.`, 'money');
              } else {
                recordJournal(st, `You wanted to buy ${childName}Name a phone but could not pay for it (${res.msg}).`, 'money');
              }
            },
          },
          {
            label: `Buy a cheaper second-hand one (${formatMoney(B, S.country)})`,
            available: (st) => st.money.cash >= B,
            effect: (st) => {
              const res = phoneItem
                ? buyShopItemForEvent(st, phoneItem, { secondHand: true, label: `Second-hand phone for ${childName}Name (shop catalogue)` })
                : { ok: false, msg: 'No phone in the shop catalogue.' };
              if (res.ok) {
                if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Buy a cheaper second-hand one', { affection: (+2) });
                recordJournal(st, `You bought ${childName}Name a second-hand ${phoneItem.brand} ${phoneItem.name} for ${formatMoney(res.priceLocal, S.country)}. It is not the newest, but it works.`, 'money');
              } else {
                recordJournal(st, `You wanted a second-hand phone for ${childName}Name but could not pay for it (${res.msg}).`, 'money');
              }
            },
          },
          {
            label: "Say no \u2014 too young, too expensive",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Say no — too young, too expensive', { affection: (-6) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You told ${childName}Name no phone yet. The argument lasted the whole evening.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_child_tutor',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 28, "hasChildren": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_money_child_tutor',
        category: 'money',
        title: "$childName Is Falling Behind in Maths",
        text: `The teacher calls: ${childName}Name is falling behind in maths, and a tutor would help. A good tutor costs ${formatMoney(A, S.country)} a month — money you had not planned to spend.`,
        choices: [
          {
            label: "Hire the tutor",
            effect: (st) => {
              walletMove(st, -A, 'Hire the tutor', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Hire the tutor', { affection: (+4) });
              recordJournal(st, `You hired a maths tutor for ${childName}Name at ${formatMoney(A, S.country)} a month.`, 'money');
            },
          },
          {
            label: "Tutor $childName yourself in the evenings",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Tutor $childName yourself in the evenings', { affection: (+5) });
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+1));
              recordJournal(st, `You decided to tutor ${childName}Name yourself every evening after work.`, 'money');
            },
          },
          {
            label: "Wait and see if it improves",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Wait and see if it improves', { affection: (-3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You decided to wait a term before paying for a tutor for ${childName}Name.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_spouse_sofa',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 26, "relationship": ["married"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      // v2.7: the sofa is a real one from the shop catalogue. The good one
      // is the cheapest real sofa on sale (cushion covers excluded); the
      // cheaper option is the same sofa second-hand at half price.
      const sofa = cheapestShopItem(S, it => /sofa/i.test(it.name) && !/cover|cushion/i.test(it.name));
      const A = sofa ? shopItemPriceLocal(S, sofa) : eraLocalCost(6000, S.country, S.year);
      const B = sofa ? shopItemPriceLocal(S, sofa, { secondHand: true }) : eraLocalCost(3000, S.country, S.year);
      return {
        key: 'ev_money_spouse_sofa',
        category: 'money',
        title: "$sp Wants a New Sofa",
        text: `${spName} has been looking at the sofa — the springs, the stain, the way it sags in the middle — and found a good one, a ${sofa ? `${sofa.brand} ${sofa.name}` : 'new sofa'} from the shop, for ${formatMoney(A, S.country)}. "We sit on it every single day," ${spName} says, which is hard to argue with.`,
        choices: [
          {
            label: `Buy the sofa (${formatMoney(A, S.country)})`,
            available: (st) => st.money.cash >= A,
            effect: (st) => {
              const res = sofa
                ? buyShopItemForEvent(st, sofa, { label: `New ${sofa.brand} ${sofa.name} (shop catalogue)` })
                : { ok: false, msg: 'No sofa in the shop catalogue.' };
              if (res.ok) {
                if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Buy the sofa', { affection: (+5) });
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
                recordJournal(st, `You bought the new ${sofa.brand} ${sofa.name} for ${formatMoney(res.priceLocal, S.country)}. The living room feels like a different room.`, 'money');
              } else {
                recordJournal(st, `You wanted to buy the new sofa but could not pay for it (${res.msg}).`, 'money');
              }
            },
          },
          {
            label: `Buy a cheaper one — second-hand (${formatMoney(B, S.country)})`,
            available: (st) => st.money.cash >= B,
            effect: (st) => {
              const res = sofa
                ? buyShopItemForEvent(st, sofa, { secondHand: true, label: `Second-hand ${sofa.brand} ${sofa.name} (shop catalogue)` })
                : { ok: false, msg: 'No sofa in the shop catalogue.' };
              if (res.ok) {
                if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Buy a cheaper one', { affection: (+2) });
                recordJournal(st, `You bought a second-hand ${sofa.brand} ${sofa.name} for ${formatMoney(res.priceLocal, S.country)}. ${spName} is mostly happy with it.`, 'money');
              } else {
                recordJournal(st, `You wanted a cheaper sofa but could not pay for it (${res.msg}).`, 'money');
              }
            },
          },
          {
            label: "Say the old one has another year in it",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Say the old one has another year in it', { affection: (-5) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You told ${spName} the old sofa has another year in it. ${spName} did not agree.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_spouse_family_gift',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 26, "relationship": ["married"], "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      const B = eraLocalCost(500, S.country, S.year);
      return {
        key: 'ev_money_spouse_family_gift',
        category: 'money',
        title: "A Gift Is Expected for $sp\u2019s Family",
        text: `${spName}’s family is visiting, and custom says you arrive with a proper gift — about ${formatMoney(A, S.country)}. ${spName} is nervous about it: the family notices these things, and remembers.`,
        choices: [
          {
            label: "Buy the proper gift",
            effect: (st) => {
              walletMove(st, -A, 'Buy the proper gift', 'money');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Buy the proper gift', { affection: (+4) });
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You bought a proper gift for ${spName}’s family for ${formatMoney(A, S.country)}. The visit went well.`, 'money');
            },
          },
          {
            label: "Buy something modest",
            effect: (st) => {
              walletMove(st, -B, 'Buy something modest', 'money');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Buy something modest', { affection: (+1) });
              recordJournal(st, `You bought a modest gift for ${formatMoney(B, S.country)}. It was received politely.`, 'money');
            },
          },
          {
            label: "Arrive empty-handed",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Arrive empty-handed', { affection: (-6) });
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              recordJournal(st, `You arrived at ${spName}’s family empty-handed. Nobody said anything. Everyone noticed.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_car_insurance',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "hasCar": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(4500, S.country, S.year);
      const B = eraLocalCost(450, S.country, S.year);
      return {
        key: 'ev_money_car_insurance',
        category: 'money',
        title: "Car Insurance Renewal",
        text: `The car insurance renewal arrives: ${formatMoney(A, S.country)} for the year. Without it you cannot legally drive, and the price has gone up since last year — as it does every year.`,
        choices: [
          {
            label: "Pay it in full",
            effect: (st) => {
              walletMove(st, -A, 'Pay it in full', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You paid the ${formatMoney(A, S.country)} car insurance renewal in full.`, 'money');
            },
          },
          {
            label: "Pay monthly instead",
            effect: (st) => {
              walletMove(st, -B, 'Pay monthly instead', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You switched the car insurance to monthly payments of ${formatMoney(B, S.country)}. It costs more in total, but it spreads.`, 'money');
            },
          },
          {
            label: "Shop around for a cheaper insurer",
            effect: (st) => {
              walletMove(st, -B, 'Shop around for a cheaper insurer', 'money');
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You shopped around and found insurance for ${formatMoney(B, S.country)} — cheaper, with less cover.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_speeding_fine',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "hasCar": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      const B = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_money_speeding_fine',
        category: 'money',
        title: "A Speeding Fine Arrives",
        text: `A letter with a photo of your car, your plate, and a speed you do not remember driving. The fine is ${formatMoney(A, S.country)}, payable within a month, and it carries points on your licence.`,
        choices: [
          {
            label: "Pay the fine at once",
            effect: (st) => {
              walletMove(st, -A, 'Pay the fine at once', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You paid the ${formatMoney(A, S.country)} speeding fine the same day it arrived.`, 'money');
            },
          },
          {
            label: "Pay it late and accept the extra fee",
            effect: (st) => {
              walletMove(st, -B, 'Pay it late and accept the extra fee', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.money.creditScore = clamp(st.money.creditScore + (-3), 300, 900);
              recordJournal(st, `You put the fine aside and paid it late, with the extra fee: ${formatMoney(B, S.country)} in total.`, 'money');
            },
          },
          {
            label: "Contest it",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              recordJournal(st, `You contested the speeding fine. The photo, it turned out, was very clear.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_flat_tyre',
    category: 'money',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 20, "hasCar": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(900, S.country, S.year);
      const B = eraLocalCost(400, S.country, S.year);
      // v2.7: there is no tyre in the 1,293-item shop catalogue, so this
      // cannot go through the shop — instead it is wired to the CAR system:
      // the tyre is fitted to the player's car (condition improves, journal
      // names the car), and the money is charged through the ledger. The
      // choice says so plainly instead of pretending a shop item exists.
      const carName = (S.cars && S.cars[0]) ? S.cars[0].name : 'your car';
      const fitTyre = (st, price, kind) => {
        walletMove(st, -price, `Buy a ${kind} tyre — fitted to ${carName}`, 'money');
        const car = st.cars && st.cars[0];
        if (car) car.condition = clamp((car.condition ?? 95) + (kind === 'new' ? 12 : 6), 20, 100);
        st.player.vitals.stress = clamp(st.player.vitals.stress + (kind === 'new' ? (+2) : (+4)));
        recordJournal(st, `You bought a ${kind} tyre for ${formatMoney(price, S.country)} and had it fitted to your ${carName}.`, 'money');
      };
      return {
        key: 'ev_money_flat_tyre',
        category: 'money',
        title: "A Flat Tyre on the Way Home",
        text: `The steering pulls hard to one side and the tyre is flat on the rim. The nearest tyre shop charges ${formatMoney(A, S.country)} for a new one, ${formatMoney(B, S.country)} for a used one that will last a while. Either way it is fitted to your ${carName} there and then.`,
        choices: [
          {
            label: `Buy a new tyre — fitted to your car (${formatMoney(A, S.country)})`,
            effect: (st) => { fitTyre(st, A, 'new'); },
          },
          {
            label: `Buy a used tyre — fitted to your car (${formatMoney(B, S.country)})`,
            effect: (st) => { fitTyre(st, B, 'used'); },
          },
          {
            label: "Fit the spare and deal with it tomorrow",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You fitted the spare tyre in the dark and promised yourself you would deal with it tomorrow.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_side_hustle',
    category: 'money',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 20, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      const B = eraLocalCost(750, S.country, S.year);
      return {
        key: 'ev_money_side_hustle',
        category: 'money',
        title: "A Weekend Job Offer",
        text: `A neighbour asks if you can do some weekend work — a few hours, cash in hand, ${formatMoney(A, S.country)} for the weekend. It would mean giving up your only free days, but the money is real.`,
        choices: [
          {
            label: "Take the weekend work",
            effect: (st) => {
              walletMove(st, +A, 'Take the weekend work', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You took the weekend work for ${formatMoney(A, S.country)} and gave up your free days to earn it.`, 'money');
            },
          },
          {
            label: "Take one day only",
            effect: (st) => {
              walletMove(st, +B, 'Take one day only', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You worked one day of the weekend job for ${formatMoney(B, S.country)} and kept Sunday for yourself.`, 'money');
            },
          },
          {
            label: "Turn it down \u2014 you need the rest",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You turned down the weekend work. The rest was worth more than the ${formatMoney(A, S.country)}.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_sell_furniture',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1800, S.country, S.year);
      return {
        key: 'ev_money_sell_furniture',
        category: 'money',
        title: "Selling the Old Furniture",
        text: `The old wardrobe and the spare bed have sat unused for a year. A buyer offers ${formatMoney(A, S.country)} for both, cash today, if you can get them down the stairs.`,
        choices: [
          {
            label: "Sell them both",
            effect: (st) => {
              walletMove(st, +A, 'Sell them both', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You sold the old wardrobe and spare bed for ${formatMoney(A, S.country)}. The flat feels bigger already.`, 'money');
            },
          },
          {
            label: "Keep them \u2014 you might need them",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You kept the old furniture. It still sits there, gathering dust.`, 'money');
            },
          },
          {
            label: "Give them to a relative who needs them",
            effect: (st) => {
              walletMove(st, +A, 'Give them to a relative who needs them', 'money');
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You gave the furniture to a relative who needed it, and they insisted on paying ${formatMoney(A, S.country)}.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_sell_old_phone',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 18, "minYear": 2005},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(900, S.country, S.year);
      return {
        key: 'ev_money_sell_old_phone',
        category: 'money',
        title: "Selling Your Old Phone",
        text: `Your old phone still works, and a shop offers ${formatMoney(A, S.country)} for it. It is not much, but it is sitting in a drawer doing nothing, and the money would help this month.`,
        choices: [
          {
            label: "Sell it",
            effect: (st) => {
              walletMove(st, +A, 'Sell it', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You sold your old phone for ${formatMoney(A, S.country)}.`, 'money');
            },
          },
          {
            label: "Keep it as a spare",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You kept the old phone as a spare. It may save you one day.`, 'money');
            },
          },
          {
            label: "Give it to $childName",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Give it to $childName', { affection: (+4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You gave the old phone to ${childName}Name, who acted like it was brand new.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_overtime_pay',
    category: 'money',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1800, S.country, S.year);
      return {
        key: 'ev_money_overtime_pay',
        category: 'money',
        title: "Overtime Pay Arrives",
        text: `The overtime you worked last month finally shows up in the pay: an extra ${formatMoney(A, S.country)}. It was long evenings and a missed weekend, but the number on the slip makes it feel worth it.`,
        choices: [
          {
            label: "Save the overtime money",
            effect: (st) => {
              moveBalance(st, 'savings', +A, 'Save the overtime money', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You saved the entire ${formatMoney(A, S.country)} of overtime pay.`, 'money');
            },
          },
          {
            label: "Spend it on yourself",
            effect: (st) => {
              walletMove(st, +A, 'Spend it on yourself', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You spent the ${formatMoney(A, S.country)} overtime money on yourself, without guilt.`, 'money');
            },
          },
          {
            label: "Give it to the household budget",
            effect: (st) => {
              walletMove(st, +A, 'Give it to the household budget', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You put the ${formatMoney(A, S.country)} overtime pay into the household budget, where it was needed.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_freelance_gig',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true, "minYear": 2005},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      const B = eraLocalCost(4000, S.country, S.year);
      return {
        key: 'ev_money_freelance_gig',
        category: 'money',
        title: "A Freelance Gig on the Side",
        text: `Someone you know from work asks if you can do a small freelance job — a few evenings, ${formatMoney(A, S.country)} when it is done. It is not your job, but it is your skill, and the money is tempting.`,
        choices: [
          {
            label: "Take the gig",
            effect: (st) => {
              walletMove(st, +A, 'Take the gig', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              if (st.skills) st.skills.creativity = clamp(st.skills.creativity + (+2));
              recordJournal(st, `You took the freelance gig for ${formatMoney(A, S.country)} and worked evenings for two weeks to finish it.`, 'money');
            },
          },
          {
            label: "Negotiate a higher fee first",
            effect: (st) => {
              walletMove(st, +B, 'Negotiate a higher fee first', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You negotiated the gig up to ${formatMoney(B, S.country)} before starting. The client agreed.`, 'money');
            },
          },
          {
            label: "Turn it down \u2014 too much on your plate",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You turned down the freelance gig. Your evenings stayed yours.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_inheritance_small',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 30},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(12000, S.country, S.year);
      return {
        key: 'ev_money_inheritance_small',
        category: 'money',
        title: "A Small Inheritance from a Distant Relative",
        text: `A letter from a lawyer: a distant relative you barely knew has left you ${formatMoney(A, S.country)}. It is not a fortune, but it is a real sum, and it arrives with a short note wishing you well.`,
        choices: [
          {
            label: "Save it all",
            effect: (st) => {
              moveBalance(st, 'savings', +A, 'Save it all', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You saved the entire ${formatMoney(A, S.country)} inheritance.`, 'money');
            },
          },
          {
            label: "Pay off a debt with it",
            effect: (st) => {
              walletMove(st, A, 'Inheritance received', 'money');
              let remaining = A;
              for (const loan of st.money.loans || []) {
                const paid = Math.min(remaining, Math.max(0, Number(loan.balance) || 0));
                if (!paid) continue;
                loan.balance -= paid; remaining -= paid;
                walletMove(st, -paid, `Inheritance repayment: ${loan.label || 'loan'}`, 'debt');
              }
              st.money.loans = (st.money.loans || []).filter(loan => loan.balance > 0);
              const paid = A - remaining;
              st.player.vitals.stress = clamp(st.player.vitals.stress - (paid > 0 ? 4 : 0));
              recordJournal(st, paid > 0
                ? `You used ${formatMoney(paid, st.country)} of the inheritance to reduce your loans. The remaining ${formatMoney(remaining, st.country)} stayed in cash.`
                : `You had no outstanding loans, so the ${formatMoney(A, st.country)} inheritance stayed in cash.`, 'money');
            },
          },
          {
            label: `Share it with ${momName} and ${dadName}`,
            effect: (st) => {
              walletMove(st, A, 'Inheritance received', 'money');
              walletMove(st, -Math.round(A / 2), 'Shared half the inheritance with parents', 'family');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Share it with ${momName} and ${dadName}`, { affection: (+5) });
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', `Share it with ${momName} and ${dadName}`, { affection: (+5) });
              recordJournal(st, `You gave half the inheritance (${formatMoney(Math.round(A / 2), st.country)}) to ${momName} and ${dadName}, keeping the rest in cash.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_rent_deposit_new', category: 'money',
    gates: { minAge: 20, wealth: ['poor', 'middle'] },
    build: (S) => ({
      key: 'ev_money_rent_deposit_new', category: 'money', title: 'Before You Sign',
      text: `A rental advert in ${S.city} looks affordable until you add the up-front costs. You have not chosen a home or signed anything yet.`,
      choices: [
        { label: 'Work out a move-in budget before booking a viewing', effect: st => {
          st.skills.financialIq = clamp(st.skills.financialIq + 2);
          recordJournal(st, 'You checked the up-front cost of moving. No money left your account and no lease was signed; actual homes are still available to compare.', 'housing');
        } },
        { label: 'Stay where you are for now', effect: st => {
          st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
          recordJournal(st, 'You put the move on hold. Your home and rent stayed unchanged.', 'housing');
        } },
      ],
    }),
  },
  {
    id: 'ev_money_wedding_contribution',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 26, "relationship": ["married"], "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      const B = eraLocalCost(750, S.country, S.year);
      return {
        key: 'ev_money_wedding_contribution',
        category: 'money',
        title: "A Cousin\u2019s Wedding Needs a Contribution",
        text: `The family is collecting for a cousin’s wedding, and your share is ${formatMoney(A, S.country)}. Everyone is giving; the list is read out loud at the gathering, and your name is on it.`,
        choices: [
          {
            label: "Pay your share",
            effect: (st) => {
              walletMove(st, -A, 'Pay your share', 'money');
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You paid your ${formatMoney(A, S.country)} share toward your cousin’s wedding.`, 'money');
            },
          },
          {
            label: "Pay half and apologise",
            effect: (st) => {
              walletMove(st, -B, 'Pay half and apologise', 'money');
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You paid half your share, ${formatMoney(B, S.country)}, and apologised for the rest.`, 'money');
            },
          },
          {
            label: "Skip it this time",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You skipped the wedding contribution. The family noticed, and said nothing.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_utility_reconnection',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(400, S.country, S.year);
      const B = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_money_utility_reconnection',
        category: 'money',
        title: "The Gas Is Cut Off",
        text: `You come home to a cold stove and a notice on the door: the gas was cut off for a missed bill. Reconnection costs ${formatMoney(A, S.country)}, plus the bill itself of ${formatMoney(B, S.country)}.`,
        choices: [
          {
            label: "Pay both and reconnect today",
            effect: (st) => {
              walletMove(st, -A, 'Pay both and reconnect today', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You paid the bill and the ${formatMoney(A, S.country)} reconnection fee and got the gas back the same day.`, 'money');
            },
          },
          {
            label: "Pay the bill, argue the fee",
            effect: (st) => {
              walletMove(st, -B, 'Pay the bill, argue the fee', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You paid the gas bill of ${formatMoney(B, S.country)} and argued the reconnection fee for an hour.`, 'money');
            },
          },
          {
            label: `Cook at ${momName}\u2019s until it is sorted`,
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Cook at ${momName}’s until it is sorted`, { affection: (+2) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `With the gas cut off, you ate at ${momName}’s for three days while you sorted the bill.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_school_trip_fee',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 26, "hasChildren": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(900, S.country, S.year);
      return {
        key: 'ev_money_school_trip_fee',
        category: 'money',
        title: "$childName\u2019s School Trip",
        text: `${childName}Name comes home waving a letter: the class trip costs ${formatMoney(A, S.country)}, and everyone is going. ${childName}Name has already told friends you said yes — which you have not, yet.`,
        choices: [
          {
            label: "Pay for the trip",
            effect: (st) => {
              walletMove(st, -A, 'Pay for the trip', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Pay for the trip', { affection: (+5) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} for ${childName}Name’s school trip. The bag is already packed.`, 'money');
            },
          },
          {
            label: "Pay, but ask $childName to earn half",
            effect: (st) => {
              walletMove(st, -A, 'Pay, but ask $childName to earn half', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Pay, but ask $childName to earn half', { affection: (+2) });
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+1));
              recordJournal(st, `You paid for the trip and asked ${childName}Name to earn half of it back with chores.`, 'money');
            },
          },
          {
            label: "Say no \u2014 the money is not there",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Say no — the money is not there', { affection: (-5) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You told ${childName}Name the school trip was too expensive this year. ${childName}Name cried.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_haircut_price',
    category: 'money',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['mom'],"minAge": 16, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(150, S.country, S.year);
      const B = eraLocalCost(60, S.country, S.year);
      return {
        key: 'ev_money_haircut_price',
        category: 'money',
        title: "The Barber Puts His Prices Up",
        text: `Your usual barber has new prices on the wall: a cut now costs ${formatMoney(A, S.country)}, double what it was. He shrugs — rent, electricity, everything has gone up, and his chair is still full.`,
        choices: [
          {
            label: "Pay the new price",
            effect: (st) => {
              walletMove(st, -A, 'Pay the new price', 'money');
              st.player.vitals.looks = clamp(st.player.vitals.looks + (+2));
              recordJournal(st, `You paid the barber’s new price of ${formatMoney(A, S.country)}. The cut is good, as always.`, 'money');
            },
          },
          {
            label: "Find a cheaper barber",
            effect: (st) => {
              walletMove(st, -B, 'Find a cheaper barber', 'money');
              st.player.vitals.looks = clamp(st.player.vitals.looks + (-1));
              recordJournal(st, `You found a cheaper barber for ${formatMoney(B, S.country)}. The cut is fine, mostly.`, 'money');
            },
          },
          {
            label: `Ask ${momName} to cut it at home`,
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Ask ${momName} to cut it at home`, { affection: (+2) });
              st.player.vitals.looks = clamp(st.player.vitals.looks + (-2));
              recordJournal(st, `You asked ${momName} to cut your hair at home. It is shorter on one side.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_internet_bill',
    category: 'money',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 18, "minYear": 2000, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(600, S.country, S.year);
      const B = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_money_internet_bill',
        category: 'money',
        title: "The Internet Bill Jumps",
        text: `The internet provider has raised the monthly bill to ${formatMoney(A, S.country)}, and the connection has been slower all month. The contract still has six months to run.`,
        choices: [
          {
            label: "Pay it and complain",
            effect: (st) => {
              walletMove(st, -A, 'Pay it and complain', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You paid the ${formatMoney(A, S.country)} internet bill and filed a complaint about the slow connection.`, 'money');
            },
          },
          {
            label: "Downgrade to the cheaper package",
            effect: (st) => {
              walletMove(st, -B, 'Downgrade to the cheaper package', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You downgraded to the cheaper internet package at ${formatMoney(B, S.country)} a month. It is slower, but it works.`, 'money');
            },
          },
          {
            label: "Cancel and use phone data",
            effect: (st) => {
              walletMove(st, -B, 'Cancel and use phone data', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You cancelled the home internet and lived on phone data for ${formatMoney(B, S.country)} a month.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_pet_vet',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 20, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      const B = eraLocalCost(500, S.country, S.year);
      return {
        key: 'ev_money_pet_vet',
        category: 'money',
        title: "The Cat Needs the Vet",
        text: `The cat has not eaten in two days and hides under the bed. The vet says it is an infection: treatment costs ${formatMoney(A, S.country)}, and the cat needs medicine for a week.`,
        choices: [
          {
            label: "Pay for the treatment",
            effect: (st) => {
              walletMove(st, -A, 'Pay for the treatment', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} for the cat’s treatment. By the weekend it was eating again.`, 'money');
            },
          },
          {
            label: "Pay for the medicine only",
            effect: (st) => {
              walletMove(st, -B, 'Pay for the medicine only', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `You paid ${formatMoney(B, S.country)} for the medicine only and nursed the cat at home.`, 'money');
            },
          },
          {
            label: "Wait and hope it passes",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You waited, hoping the cat would get better on its own. It did not, for three long days.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_broken_glasses',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 16, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      const B = eraLocalCost(400, S.country, S.year);
      return {
        key: 'ev_money_broken_glasses',
        category: 'money',
        title: "Your Glasses Break",
        text: `Your glasses snap at the hinge while you are putting them on. Without them the world is a blur, and a new pair costs ${formatMoney(A, S.country)}. The optician can repair them for ${formatMoney(B, S.country)}, but it will take a week.`,
        choices: [
          {
            label: "Buy a new pair",
            effect: (st) => {
              walletMove(st, -A, 'Buy a new pair', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You bought new glasses for ${formatMoney(A, S.country)} and could see properly again the same day.`, 'money');
            },
          },
          {
            label: "Repair the old pair",
            effect: (st) => {
              walletMove(st, -B, 'Repair the old pair', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You paid ${formatMoney(B, S.country)} to repair the old glasses and spent a week squinting without them.`, 'money');
            },
          },
          {
            label: "Tape them together",
            effect: (st) => {
              st.player.vitals.looks = clamp(st.player.vitals.looks + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You taped the broken glasses together. They hold, just about.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_landlord_repairs',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 20, "hasHome": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      return {
        key: 'ev_money_landlord_repairs',
        category: 'money',
        title: "The Ceiling Leaks and the Landlord Shrugs",
        text: `A brown stain spreads across the ceiling after every rain, and now it drips. The landlord says it is "just the weather" and offers nothing. A roofer quotes ${formatMoney(A, S.country)} to fix it properly.`,
        choices: [
          {
            label: "Pay the roofer yourself",
            effect: (st) => {
              walletMove(st, -A, 'Pay the roofer yourself', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} for the roofer yourself, because the landlord would not.`, 'money');
            },
          },
          {
            label: "Put a bucket under it and wait",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You put a bucket under the leak and waited for the landlord to act. He did not.`, 'money');
            },
          },
          {
            label: "Withhold the repair cost from the rent",
            effect: (st) => {
              walletMove(st, -A, 'Withhold the repair cost from the rent', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              recordJournal(st, `You paid for the repair and took ${formatMoney(A, S.country)} off the next rent. The landlord was furious.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_birthday_gift_spouse',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 26, "relationship": ["married"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2500, S.country, S.year);
      const B = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_money_birthday_gift_spouse',
        category: 'money',
        title: "$sp\u2019s Birthday Is Coming",
        text: `${spName}’s birthday is next week, and you have not bought anything yet. A proper gift — the one ${spName} has mentioned twice — costs ${formatMoney(A, S.country)}. A smaller one costs ${formatMoney(B, S.country)}.`,
        choices: [
          {
            label: "Buy the proper gift",
            effect: (st) => {
              walletMove(st, -A, 'Buy the proper gift', 'money');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Buy the proper gift', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You bought ${spName} the birthday gift that was wanted, for ${formatMoney(A, S.country)}.`, 'money');
            },
          },
          {
            label: "Buy the smaller gift",
            effect: (st) => {
              walletMove(st, -B, 'Buy the smaller gift', 'money');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Buy the smaller gift', { affection: (+2) });
              recordJournal(st, `You bought ${spName} a smaller birthday gift for ${formatMoney(B, S.country)}. It was liked, if not loved.`, 'money');
            },
          },
          {
            label: "Cook a special dinner instead",
            effect: (st) => {
              walletMove(st, -B, 'Cook a special dinner instead', 'money');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Cook a special dinner instead', { affection: (+4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You cooked ${spName} a special birthday dinner for ${formatMoney(B, S.country)} instead of buying a gift.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_loan_offer',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(20000, S.country, S.year);
      const B = eraLocalCost(10000, S.country, S.year);
      return {
        key: 'ev_money_loan_offer',
        category: 'money',
        title: "The Bank Offers You a Personal Loan",
        text: `Your bank calls: you are pre-approved for a personal loan of ${formatMoney(A, S.country)}, cash in your account tomorrow, repayable over a year. The interest is high, but the money would solve this month’s problems at once.`,
        choices: [
          {
            label: "Take the loan",
            effect: (st) => {
              walletMove(st, +A, 'Take the loan', 'money');
              st.money.loans.push({ id: 'loan_' + st.turn, label: 'Take the loan', balance: A, monthlyPayment: Math.round(A / 12), annualRate: 0.18, remainingMonths: 12, country: st.country });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              st.money.creditScore = clamp(st.money.creditScore + (-4), 300, 900);
              recordJournal(st, `You took a personal loan of ${formatMoney(A, S.country)} from the bank. The money landed the next day.`, 'money');
            },
          },
          {
            label: "Take half the loan",
            effect: (st) => {
              walletMove(st, +B, 'Take half the loan', 'money');
              st.money.loans.push({ id: 'loan_' + st.turn, label: 'Take half the loan', balance: B, monthlyPayment: Math.round(B / 12), annualRate: 0.18, remainingMonths: 12, country: st.country });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You took half the offered loan, ${formatMoney(B, S.country)}, and left the rest.`, 'money');
            },
          },
          {
            label: "Refuse \u2014 debt is not the answer",
            effect: (st) => {
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You refused the bank’s loan offer. The problems stayed, but so did your freedom from it.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_payday_loan_shop',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 24, "wealth": ["poor"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(5000, S.country, S.year);
      const B = eraLocalCost(2000, S.country, S.year);
      return {
        key: 'ev_money_payday_loan_shop',
        category: 'money',
        title: "The Loan Shop on the Corner",
        text: `The loan shop on the corner offers cash today: borrow ${formatMoney(A, S.country)}, pay back ${formatMoney(B, S.country)} in a month. The man behind the counter is friendly, the terms are printed small, and the interest is brutal.`,
        choices: [
          {
            label: "Borrow the money",
            effect: (st) => {
              walletMove(st, +A, 'Borrow the money', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              st.money.creditScore = clamp(st.money.creditScore + (-8), 300, 900);
              recordJournal(st, `You borrowed ${formatMoney(A, S.country)} from the loan shop. The repayment of ${formatMoney(B, S.country)} is due in a month.`, 'money');
            },
          },
          {
            label: "Borrow only what you must",
            effect: (st) => {
              walletMove(st, +B, 'Borrow only what you must', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You borrowed a smaller amount, ${formatMoney(B, S.country)}, from the loan shop — only what you truly needed.`, 'money');
            },
          },
          {
            label: "Walk away",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              recordJournal(st, `You walked away from the loan shop. The month would be hard, but the debt would have been harder.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_common_cold',
    category: 'health',
    repeatable: true,
    cooldownYears: 1,
    gates: {"minAge": 5},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(120, S.country, S.year);
      return {
        key: 'ev_health_common_cold',
        category: 'health',
        title: "A Heavy Cold",
        text: `You wake up with a blocked nose, a sore throat, and a head full of cotton wool. It is an ordinary cold, but it makes the whole day feel twice as long.`,
        choices: [
          {
            label: "Rest at home and drink soup",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `A heavy cold kept you in bed for two days. The soup helped.`, 'health');
            },
          },
          {
            label: "Push through the day anyway",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You pushed through the cold and felt worse by evening.`, 'health');
            },
          },
          {
            label: "Buy cold medicine",
            effect: (st) => {
              walletMove(st, -A, 'Buy cold medicine', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You bought cold medicine for ${formatMoney(A, S.country)} and slept it off.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_flu',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 8},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(500, S.country, S.year);
      return {
        key: 'ev_health_flu',
        category: 'health',
        title: "Flu Knocks You Flat",
        text: `It starts as a shiver and becomes a fever, aching joints, and a bed you cannot leave. The flu has you properly this time — three days, at least.`,
        choices: [
          {
            label: "Stay in bed and recover",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `The flu kept you in bed for three days. You came out of it slowly.`, 'health');
            },
          },
          {
            label: "See a doctor",
            effect: (st) => {
              walletMove(st, -A, 'See a doctor', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You saw a doctor about the flu and paid ${formatMoney(A, S.country)} for the visit and medicine.`, 'health');
            },
          },
          {
            label: "Work through it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-8));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-4));
              recordJournal(st, `You worked through the flu and paid for it with a week of feeling terrible.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_toothache',
    category: 'health',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 10},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(400, S.country, S.year);
      return {
        key: 'ev_health_toothache',
        category: 'health',
        title: "A Toothache at Night",
        text: `The tooth starts aching just as you try to sleep, and by midnight it is throbbing. Nothing helps — not the cold water, not the painkillers, not pressing your cheek.`,
        choices: [
          {
            label: "See the dentist in the morning",
            effect: (st) => {
              walletMove(st, -A, 'See the dentist in the morning', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You saw the dentist in the morning and paid ${formatMoney(A, S.country)} to fix the aching tooth.`, 'health');
            },
          },
          {
            label: "Take painkillers and wait",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You lived on painkillers for a week, hoping the toothache would pass. It did not.`, 'health');
            },
          },
          {
            label: "Rinse with salt water and cloves",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You treated the toothache the old way — salt water and cloves — and it eased a little.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_back_pain',
    category: 'health',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 28, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(900, S.country, S.year);
      return {
        key: 'ev_health_back_pain',
        category: 'health',
        title: "Your Back Gives Out",
        text: `You bend to lift a box at work and something in your lower back gives a sharp warning. Standing straight hurts. Sitting hurts. Everything hurts.`,
        choices: [
          {
            label: "See a physiotherapist",
            effect: (st) => {
              walletMove(st, -A, 'See a physiotherapist', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You saw a physiotherapist about your back and paid ${formatMoney(A, S.country)} for the sessions.`, 'health');
            },
          },
          {
            label: "Rest and heat packs",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You rested your back with heat packs for a week and moved carefully.`, 'health');
            },
          },
          {
            label: "Keep working through it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-3));
              recordJournal(st, `You kept working with a bad back, and it got worse every day.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_gym_injury',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 18},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_health_gym_injury',
        category: 'health',
        title: "A Gym Injury",
        text: `You push for one more rep and feel something pull in your shoulder. The pain is sharp, then dull, then constant. The trainer says to stop, rest, and ice it.`,
        choices: [
          {
            label: "Rest it properly for two weeks",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You rested the pulled shoulder for two weeks. It healed clean.`, 'health');
            },
          },
          {
            label: "Keep training through the pain",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You kept training through the shoulder injury, and it turned into a month-long problem.`, 'health');
            },
          },
          {
            label: "See a sports doctor",
            effect: (st) => {
              walletMove(st, -A, 'See a sports doctor', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You saw a sports doctor about the shoulder and paid ${formatMoney(A, S.country)} for treatment.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_eye_test',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 12},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      const B = eraLocalCost(400, S.country, S.year);
      return {
        key: 'ev_health_eye_test',
        category: 'health',
        title: "Your Eyes Are Getting Worse",
        text: `The board at school, the road signs, the small print — everything far away has gone soft at the edges. The eye test confirms it: you need glasses now.`,
        choices: [
          {
            label: "Buy proper glasses",
            effect: (st) => {
              walletMove(st, -A, 'Buy proper glasses', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.looks = clamp(st.player.vitals.looks + (+1));
              recordJournal(st, `You bought proper glasses for ${formatMoney(A, S.country)}. The world came back into focus.`, 'health');
            },
          },
          {
            label: "Buy the cheapest pair",
            effect: (st) => {
              walletMove(st, -B, 'Buy the cheapest pair', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You bought the cheapest glasses for ${formatMoney(B, S.country)}. They work, though they pinch.`, 'health');
            },
          },
          {
            label: "Squint and carry on",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You carried on squinting without glasses, and the headaches started.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_checkup',
    category: 'health',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 30},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(600, S.country, S.year);
      return {
        key: 'ev_health_checkup',
        category: 'health',
        title: "A Routine Check-Up",
        text: `At a routine check-up the doctor takes your blood pressure, listens to your heart, and orders blood tests. "Everything looks fine," she says, "but watch the salt, and walk more."`,
        choices: [
          {
            label: "Follow the advice \u2014 walk daily",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+3));
              recordJournal(st, `You started walking every day after the check-up. Your blood pressure thanked you.`, 'health');
            },
          },
          {
            label: "Book the follow-up blood tests",
            effect: (st) => {
              walletMove(st, -A, 'Book the follow-up blood tests', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} for the follow-up blood tests. Everything came back normal.`, 'health');
            },
          },
          {
            label: "Ignore the advice",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You ignored the doctor’s advice about salt and walking. It was easier.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_blood_pressure',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 35},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_health_blood_pressure',
        category: 'health',
        title: "High Blood Pressure",
        text: `The nurse takes your blood pressure twice, frowns, and takes it a third time. It is high — properly high — and the doctor wants you on tablets and a lower-salt diet.`,
        choices: [
          {
            label: "Take the tablets and change your diet",
            effect: (st) => {
              walletMove(st, -A, 'Take the tablets and change your diet', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You started blood pressure tablets, ${formatMoney(A, S.country)} a month, and cut the salt.`, 'health');
            },
          },
          {
            label: "Take the tablets, keep eating as before",
            effect: (st) => {
              walletMove(st, -A, 'Take the tablets, keep eating as before', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You took the blood pressure tablets but changed nothing about your food.`, 'health');
            },
          },
          {
            label: "Refuse the tablets \u2014 you feel fine",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You refused the blood pressure tablets. You felt fine, which is what worried the doctor.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_food_poisoning',
    category: 'health',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 10},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(350, S.country, S.year);
      return {
        key: 'ev_health_food_poisoning',
        category: 'health',
        title: "Food Poisoning",
        text: `The meal that tasted fine at lunch turns on you by evening: stomach cramps, fever, and a night spent by the bathroom. Something in it was off, and your body knows it.`,
        choices: [
          {
            label: "Rest and drink fluids",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `Food poisoning kept you in bed for two days. Fluids and rest saw you through.`, 'health');
            },
          },
          {
            label: "Go to the clinic",
            effect: (st) => {
              walletMove(st, -A, 'Go to the clinic', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You went to the clinic for the food poisoning and paid ${formatMoney(A, S.country)} for treatment.`, 'health');
            },
          },
          {
            label: "Eat nothing for a day",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You ate nothing for a day after the food poisoning, until your stomach settled.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_sprained_ankle',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 12},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(400, S.country, S.year);
      return {
        key: 'ev_health_sprained_ankle',
        category: 'health',
        title: "A Sprained Ankle",
        text: `You come down wrong on a step and your ankle folds under you. It swells fast, turns purple, and will not take your weight. The walk home takes three times as long.`,
        choices: [
          {
            label: "Rest it and ice it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You rested the sprained ankle with ice for a week. It healed slowly.`, 'health');
            },
          },
          {
            label: "See a doctor and get a bandage",
            effect: (st) => {
              walletMove(st, -A, 'See a doctor and get a bandage', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              recordJournal(st, `You saw a doctor about the ankle and paid ${formatMoney(A, S.country)} for a proper bandage and advice.`, 'health');
            },
          },
          {
            label: "Walk it off",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You tried to walk off the sprained ankle. It swelled worse and took a month.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_migraine',
    category: 'health',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 16},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(250, S.country, S.year);
      return {
        key: 'ev_health_migraine',
        category: 'health',
        title: "A Migraine That Blinds One Eye",
        text: `The light starts to hurt, then the shapes appear at the edge of your sight, then the pain arrives like a hammer. A migraine — the kind that ends the day entirely.`,
        choices: [
          {
            label: "Lie in a dark room",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You lay in a dark, quiet room until the migraine passed.`, 'health');
            },
          },
          {
            label: "Take migraine medicine",
            effect: (st) => {
              walletMove(st, -A, 'Take migraine medicine', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You took migraine medicine, ${formatMoney(A, S.country)}, and the pain eased within the hour.`, 'health');
            },
          },
          {
            label: "Keep going through it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              recordJournal(st, `You tried to keep going through the migraine. The day was a waste.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_insomnia',
    category: 'health',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 20},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_health_insomnia',
        category: 'health',
        title: "You Cannot Sleep",
        text: `Night after night, sleep will not come. You lie awake while the house is quiet, thinking about money, work, and tomorrow, and by morning you are exhausted before the day begins.`,
        choices: [
          {
            label: "Fix your sleep routine",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              recordJournal(st, `You fixed your sleep routine — no screens, same hour every night — and the sleep came back.`, 'health');
            },
          },
          {
            label: "Take sleeping tablets",
            effect: (st) => {
              walletMove(st, -A, 'Take sleeping tablets', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You took sleeping tablets, ${formatMoney(A, S.country)}, and slept properly for the first time in weeks.`, 'health');
            },
          },
          {
            label: "Live on coffee",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You lived on coffee through the sleepless weeks, and felt worse every day.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_anxiety',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 18},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_health_anxiety',
        category: 'health',
        title: "Anxiety That Will Not Leave",
        text: `Your chest feels tight for no clear reason, your heart races in quiet rooms, and small worries grow into big ones before you can stop them. It has been weeks now, and it is not passing.`,
        choices: [
          {
            label: "See a therapist",
            effect: (st) => {
              walletMove(st, -A, 'See a therapist', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You saw a therapist about the anxiety and paid ${formatMoney(A, S.country)} a session. Talking helped more than you expected.`, 'health');
            },
          },
          {
            label: `Talk to ${momName} about it`,
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Talk to ${momName} about it`, { affection: (+4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You told ${momName} about the anxiety. She listened, properly, for an hour.`, 'health');
            },
          },
          {
            label: "Keep it to yourself",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-4));
              recordJournal(st, `You kept the anxiety to yourself. It grew quietly, in the dark.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_low_mood',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 20},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_health_low_mood',
        category: 'health',
        title: "A Low Mood That Lingers",
        text: `For weeks now, nothing has felt quite worth doing. Food tastes flat, sleep is heavy, and the things that used to make you laugh barely register. It is not sadness exactly — it is emptiness.`,
        choices: [
          {
            label: "See a doctor about it",
            effect: (st) => {
              walletMove(st, -A, 'See a doctor about it', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You saw a doctor about the low mood and paid ${formatMoney(A, S.country)}. Getting help was the hardest part.`, 'health');
            },
          },
          {
            label: "Lean on $fr",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Lean on $fr', { affection: (+5) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You leaned on ${frName} through the low weeks. ${frName} showed up, every time.`, 'health');
            },
          },
          {
            label: "Wait for it to pass",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-5));
              recordJournal(st, `You waited for the low mood to pass on its own. It took months.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_skin_rash',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 10},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(200, S.country, S.year);
      const B = eraLocalCost(600, S.country, S.year);
      return {
        key: 'ev_health_skin_rash',
        category: 'health',
        title: "A Rash That Spreads",
        text: `A red, itchy rash appears on your arms and spreads over two days. It burns, it itches, and scratching only makes it angrier. The pharmacist takes one look and knows what it is.`,
        choices: [
          {
            label: "Buy the cream the pharmacist suggests",
            effect: (st) => {
              walletMove(st, -A, 'Buy the cream the pharmacist suggests', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You bought the cream for ${formatMoney(A, S.country)} and the rash faded within days.`, 'health');
            },
          },
          {
            label: "See a skin doctor",
            effect: (st) => {
              walletMove(st, -B, 'See a skin doctor', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              recordJournal(st, `You saw a skin doctor and paid ${formatMoney(B, S.country)} for the visit and treatment.`, 'health');
            },
          },
          {
            label: "Ignore it and hope",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You ignored the rash. It spread, then finally faded on its own.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_hair_loss',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 28},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2500, S.country, S.year);
      return {
        key: 'ev_health_hair_loss',
        category: 'health',
        title: "Your Hair Is Thinning",
        text: `The hairline has moved back, and the shower drain tells the rest of the story. It is happening faster than you expected, and every mirror reminds you.`,
        choices: [
          {
            label: "Accept it and shave it off",
            effect: (st) => {
              st.player.vitals.looks = clamp(st.player.vitals.looks + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You shaved your thinning hair off and owned the look. It suited you.`, 'health');
            },
          },
          {
            label: "Try a hair treatment",
            effect: (st) => {
              walletMove(st, -A, 'Try a hair treatment', 'health');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} for a hair treatment. It helped a little, for a while.`, 'health');
            },
          },
          {
            label: "Wear a cap everywhere",
            effect: (st) => {
              st.player.vitals.looks = clamp(st.player.vitals.looks + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You started wearing a cap everywhere, even indoors.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_weight_gain',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 25},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      const B = eraLocalCost(500, S.country, S.year);
      return {
        key: 'ev_health_weight_gain',
        category: 'health',
        title: "The Weight Has Crept Up",
        text: `Your trousers do not fit the way they did, and the scale confirms what the mirror has been saying. Ten kilos, gained slowly, one takeaway at a time.`,
        choices: [
          {
            label: "Start cooking at home and walking",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+4));
              recordJournal(st, `You started cooking at home and walking daily. The weight began to come off.`, 'health');
            },
          },
          {
            label: "Join a gym",
            effect: (st) => {
              walletMove(st, -A, 'Join a gym', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+5));
              recordJournal(st, `You joined a gym for ${formatMoney(A, S.country)} a month and went three times a week.`, 'health');
            },
          },
          {
            label: "Buy bigger clothes",
            effect: (st) => {
              walletMove(st, -B, 'Buy bigger clothes', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You bought bigger clothes for ${formatMoney(B, S.country)} and carried on as before.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_smoking_cough',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 25},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_health_smoking_cough',
        category: 'health',
        title: "The Smoker\u2019s Cough",
        text: `The cough has been there for months now — first thing in the morning, every morning. Your chest rattles, and climbing stairs leaves you short of breath.`,
        choices: [
          {
            label: "Quit smoking now",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You quit smoking. The first month was hard; the cough faded by the third.`, 'health');
            },
          },
          {
            label: "Cut down to half",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You cut your smoking in half. The cough eased, a little.`, 'health');
            },
          },
          {
            label: "Carry on as before",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You carried on smoking. The cough stayed, and got worse.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_knee_pain',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 40},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(600, S.country, S.year);
      return {
        key: 'ev_health_knee_pain',
        category: 'health',
        title: "Your Knee Aches on the Stairs",
        text: `Going down stairs has become a negotiation. The knee clicks, aches, and sometimes gives a sharp protest halfway down. The doctor says it is wear and tear, and weight, and age.`,
        choices: [
          {
            label: "Lose weight and strengthen the leg",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You strengthened the leg and lost weight. The knee thanked you within months.`, 'health');
            },
          },
          {
            label: "Get a knee support and painkillers",
            effect: (st) => {
              walletMove(st, -A, 'Get a knee support and painkillers', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You bought a knee support and painkillers for ${formatMoney(A, S.country)} and carried on.`, 'health');
            },
          },
          {
            label: "Avoid stairs entirely",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You started avoiding stairs entirely, and your world got smaller.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_vitamin_deficiency',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 20},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(350, S.country, S.year);
      return {
        key: 'ev_health_vitamin_deficiency',
        category: 'health',
        title: "Always Tired, Always Pale",
        text: `You are tired no matter how much you sleep, and your nails break, and your hair is dull. A blood test shows it plainly: low iron, low vitamin D — your diet has been running on empty.`,
        choices: [
          {
            label: "Take supplements and eat better",
            effect: (st) => {
              walletMove(st, -A, 'Take supplements and eat better', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You started supplements, ${formatMoney(A, S.country)} a month, and ate properly. The energy came back.`, 'health');
            },
          },
          {
            label: "Take the supplements only",
            effect: (st) => {
              walletMove(st, -A, 'Take the supplements only', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You took the supplements for ${formatMoney(A, S.country)} a month but changed nothing about your food.`, 'health');
            },
          },
          {
            label: "Ignore the blood test",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You ignored the blood test results. The tiredness stayed.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_broken_arm',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 10, "maxAge": 60},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      return {
        key: 'ev_health_broken_arm',
        category: 'health',
        title: "A Broken Arm",
        text: `You fall hard — a wrong step, a slippery floor — and the arm bends where it should not. The hospital confirms it: a clean break, a cast for six weeks, and no lifting anything.`,
        choices: [
          {
            label: "Rest and follow the doctor\u2019s orders",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You broke your arm and wore the cast for six weeks, doing as the doctor said.`, 'health');
            },
          },
          {
            label: "Pay for a private clinic to set it faster",
            effect: (st) => {
              walletMove(st, -A, 'Pay for a private clinic to set it faster', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} at a private clinic to have the arm set properly and quickly.`, 'health');
            },
          },
          {
            label: "Try to work through the cast",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-8));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-3));
              recordJournal(st, `You tried to work through the broken arm. The cast made everything twice as hard.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_appendicitis',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 12, "maxAge": 45},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(15000, S.country, S.year);
      return {
        key: 'ev_health_appendicitis',
        category: 'health',
        title: "Appendicitis \u2014 Straight to Surgery",
        text: `The stomach pain starts dull and becomes sharp, low on the right side, and the doctor does not hesitate: appendicitis, surgery tonight, or it bursts. There is no time to think.`,
        choices: [
          {
            label: "Have the surgery at once",
            effect: (st) => {
              walletMove(st, -A, 'Have the surgery at once', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You had emergency appendix surgery, costing ${formatMoney(A, S.country)}. It saved you — and emptied your savings.`, 'health');
            },
          },
          {
            label: "Have the surgery at the public hospital",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-7));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You had the appendix surgery at the public hospital. The wait was long, but the surgeon was good.`, 'health');
            },
          },
          {
            label: "Wait one more night",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-12));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              recordJournal(st, `You waited one more night with the appendicitis. By morning, the pain was unbearable.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_fever_virus',
    category: 'health',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 5, "minYear": 2020},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(450, S.country, S.year);
      return {
        key: 'ev_health_fever_virus',
        category: 'health',
        title: "A Fever That Spreads Through the House",
        text: `A fever, a cough, and a test that comes back positive — the virus is going through the whole house, one person at a time. You are next, and the week is written off.`,
        choices: [
          {
            label: "Isolate and rest properly",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You isolated with the virus and rested properly for a week.`, 'health');
            },
          },
          {
            label: "Keep going to work",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-3));
              recordJournal(st, `You kept going to work with the virus and spread it to two colleagues.`, 'health');
            },
          },
          {
            label: "See a doctor for medicine",
            effect: (st) => {
              walletMove(st, -A, 'See a doctor for medicine', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You saw a doctor about the virus and paid ${formatMoney(A, S.country)} for medicine and advice.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_child_fever',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'child'],"minAge": 25, "hasChildren": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(900, S.country, S.year);
      return {
        key: 'ev_health_child_fever',
        category: 'health',
        title: "$childName Has a High Fever",
        text: `${childName}Name is burning up at 2 a.m., flushed and shivering, and the thermometer reads a number that frightens you. The clinic is closed; the hospital is twenty minutes away.`,
        choices: [
          {
            label: "Take $childName to the hospital now",
            effect: (st) => {
              walletMove(st, -A, 'Take $childName to the hospital now', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Take $childName to the hospital now', { affection: (+4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You took ${childName}Name to the hospital at 2 a.m. and paid ${formatMoney(A, S.country)}. The fever broke by morning.`, 'health');
            },
          },
          {
            label: "Cool $childName down at home and watch",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              recordJournal(st, `You cooled ${childName}Name down with wet cloths and watched through the night, terrified.`, 'health');
            },
          },
          {
            label: `Call ${momName} for advice`,
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Call ${momName} for advice`, { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You called ${momName} at 2 a.m. about ${childName}Name’s fever. She talked you through it, calmly.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_parent_falls',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 30},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      const B = eraLocalCost(600, S.country, S.year);
      return {
        key: 'ev_health_parent_falls',
        category: 'health',
        title: `${dadName} Falls at Home`,
        text: `${momName} calls, shaken: ${dadName} fell in the bathroom and cannot get up on his own. He says he is fine, but his wrist is swelling and he will not admit how much it hurts.`,
        choices: [
          {
            label: "Take him to the hospital",
            effect: (st) => {
              walletMove(st, -A, 'Take him to the hospital', 'health');
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', 'Take him to the hospital', { affection: (+5) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You took ${dadName} to the hospital after his fall and paid ${formatMoney(A, S.country)}. His wrist was sprained, not broken.`, 'health');
            },
          },
          {
            label: "Bring a doctor to the house",
            effect: (st) => {
              walletMove(st, -B, 'Bring a doctor to the house', 'health');
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', 'Bring a doctor to the house', { affection: (+4) });
              recordJournal(st, `You brought a doctor to the house for ${dadName}, ${formatMoney(B, S.country)}, rather than moving him.`, 'health');
            },
          },
          {
            label: "Let him rest at home",
            effect: (st) => {
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', 'Let him rest at home', { affection: (-3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You let ${dadName} rest at home after the fall. He hid the pain for a week.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_spouse_sick',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 26, "relationship": ["married"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_health_spouse_sick',
        category: 'health',
        title: "$sp Is Ill in Bed",
        text: `${spName} has been in bed for three days with a fever that will not break, too weak to eat properly. The house has gone quiet, and everything — cooking, cleaning, the children — is on you.`,
        choices: [
          {
            label: "Look after $sp properly",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Look after $sp properly', { affection: (+7) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              recordJournal(st, `You looked after ${spName} through the illness — food, medicine, and patience.`, 'health');
            },
          },
          {
            label: "Take $sp to the doctor",
            effect: (st) => {
              walletMove(st, -A, 'Take $sp to the doctor', 'health');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Take $sp to the doctor', { affection: (+6) });
              recordJournal(st, `You took ${spName} to the doctor and paid ${formatMoney(A, S.country)}. The medicine worked within days.`, 'health');
            },
          },
          {
            label: "Carry on as normal and hope",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Carry on as normal and hope', { affection: (-6) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You carried on as normal while ${spName} lay ill. ${spName} noticed.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_gym_membership',
    category: 'health',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 18},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_health_gym_membership',
        category: 'health',
        title: "A Gym Opens Near Your Home",
        text: `A new gym opens two streets away, and the opening offer is ${formatMoney(A, S.country)} a month — half price for the first year. The equipment is new, the trainers are keen, and it is close enough that you have no excuse.`,
        choices: [
          {
            label: "Join and go three times a week",
            effect: (st) => {
              walletMove(st, -A, 'Join and go three times a week', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+6));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `You joined the gym for ${formatMoney(A, S.country)} a month and went three times a week. Your body changed.`, 'health');
            },
          },
          {
            label: "Join and go when you feel like it",
            effect: (st) => {
              walletMove(st, -A, 'Join and go when you feel like it', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+2));
              recordJournal(st, `You joined the gym but went when you felt like it — about twice a month.`, 'health');
            },
          },
          {
            label: "Skip it \u2014 you can exercise at home",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+1));
              recordJournal(st, `You skipped the gym and exercised at home instead. It cost nothing, and it worked, mostly.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_running_habit',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 16},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_health_running_habit',
        category: 'health',
        title: "You Start Running in the Mornings",
        text: `A neighbour who runs every morning asks if you want to join. The first run is humiliating — two streets and you are gasping — but the air is cool and the streets are empty.`,
        choices: [
          {
            label: "Keep running every morning",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+5));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You started running every morning. Within months you could run for an hour.`, 'health');
            },
          },
          {
            label: "Run at weekends only",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+2));
              recordJournal(st, `You ran at weekends only. It was enough to feel the difference.`, 'health');
            },
          },
          {
            label: "Give up after a week",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You gave up running after a week. The mornings stayed in bed.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_yoga_class',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 20},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(500, S.country, S.year);
      const B = eraLocalCost(150, S.country, S.year);
      return {
        key: 'ev_health_yoga_class',
        category: 'health',
        title: "A Yoga Class at the Community Centre",
        text: `The community centre offers a yoga class for ${formatMoney(A, S.country)} a month. The teacher is patient, the room is quiet, and your back — which has ached for years — is the reason you are considering it.`,
        choices: [
          {
            label: "Join the class",
            effect: (st) => {
              walletMove(st, -A, 'Join the class', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+3));
              recordJournal(st, `You joined the yoga class for ${formatMoney(A, S.country)} a month. Your back loosened within weeks.`, 'health');
            },
          },
          {
            label: "Try one session",
            effect: (st) => {
              walletMove(st, -B, 'Try one session', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You tried one yoga session for ${formatMoney(B, S.country)}. It was harder than it looked.`, 'health');
            },
          },
          {
            label: "Stretch at home instead",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You stretched at home instead of joining the class. It helped, a little.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_meditation',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 22},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_health_meditation',
        category: 'health',
        title: "Learning to Sit Still",
        text: `A friend who meditates swears by it: ten minutes a day, breathing, nothing else. You have tried before and lasted two minutes. This time, something about the offer is different — a free group, every evening.`,
        choices: [
          {
            label: "Join the group and practise daily",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You joined the meditation group and practised daily. The noise in your head quieted.`, 'health');
            },
          },
          {
            label: "Try it alone at home",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You tried meditating alone at home. Some days it worked, some days it did not.`, 'health');
            },
          },
          {
            label: "Decide it is not for you",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You decided meditation was not for you, and went back to your own ways.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_therapy_first',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 22},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1000, S.country, S.year);
      const B = eraLocalCost(1000, S.country, S.year);
      return {
        key: 'ev_health_therapy_first',
        category: 'health',
        title: "Your First Therapy Session",
        text: `You sit in a small room with a therapist who asks, simply, how you are — and means it. The hour passes faster than you expected, and you leave feeling lighter than you have in months.`,
        choices: [
          {
            label: "Book weekly sessions",
            effect: (st) => {
              walletMove(st, -A, 'Book weekly sessions', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You booked weekly therapy sessions at ${formatMoney(A, S.country)} each. It became the best money you spent.`, 'health');
            },
          },
          {
            label: "Go once a month",
            effect: (st) => {
              walletMove(st, -B, 'Go once a month', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You went to therapy once a month, ${formatMoney(B, S.country)} a session, and took it slowly.`, 'health');
            },
          },
          {
            label: "Decide once was enough",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You went to therapy once and decided it was enough for now.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_dental_check',
    category: 'health',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 12},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(900, S.country, S.year);
      const B = eraLocalCost(450, S.country, S.year);
      return {
        key: 'ev_health_dental_check',
        category: 'health',
        title: "A Routine Dental Check",
        text: `The dentist finds two small cavities and a tooth that needs a filling: ${formatMoney(A, S.country)} in total. "Small now," she says, "expensive later, if you leave them."`,
        choices: [
          {
            label: "Get the fillings now",
            effect: (st) => {
              walletMove(st, -A, 'Get the fillings now', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} for the fillings at the dental check. Small now, not expensive later.`, 'health');
            },
          },
          {
            label: "Get one filling, leave the other",
            effect: (st) => {
              walletMove(st, -B, 'Get one filling, leave the other', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You paid ${formatMoney(B, S.country)} for one filling and left the other for later.`, 'health');
            },
          },
          {
            label: "Leave both",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You left both cavities. They did not get better on their own.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_lasik',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 22},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(25000, S.country, S.year);
      const B = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_health_lasik',
        category: 'health',
        title: "Laser Eye Surgery",
        text: `You have worn glasses for years, and the clinic offers laser surgery for ${formatMoney(A, S.country)} — twenty minutes, and no more glasses. The surgeon is honest about the risks, and about the odds.`,
        choices: [
          {
            label: "Have the surgery",
            effect: (st) => {
              walletMove(st, -A, 'Have the surgery', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.looks = clamp(st.player.vitals.looks + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You had laser eye surgery for ${formatMoney(A, S.country)}. You woke up the next morning and could see the ceiling clearly.`, 'health');
            },
          },
          {
            label: "Wait and think about it",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You decided to think about the laser surgery for another year.`, 'health');
            },
          },
          {
            label: "Stick with glasses",
            effect: (st) => {
              walletMove(st, -B, 'Stick with glasses', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You stuck with glasses and bought a new pair for ${formatMoney(B, S.country)} instead.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_braces_adult',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 20, "maxAge": 45},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(18000, S.country, S.year);
      const B = eraLocalCost(22000, S.country, S.year);
      return {
        key: 'ev_health_braces_adult',
        category: 'health',
        title: "Braces as an Adult",
        text: `Your teeth have always crowded at the front, and the orthodontist says braces would fix them in eighteen months for ${formatMoney(A, S.country)}. It is a long time to wear metal on your teeth as an adult.`,
        choices: [
          {
            label: "Get the braces",
            effect: (st) => {
              walletMove(st, -A, 'Get the braces', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.looks = clamp(st.player.vitals.looks + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You got braces as an adult for ${formatMoney(A, S.country)}. Eighteen months later, your smile was different.`, 'health');
            },
          },
          {
            label: "Get clear aligners instead",
            effect: (st) => {
              walletMove(st, -B, 'Get clear aligners instead', 'health');
              st.player.vitals.looks = clamp(st.player.vitals.looks + (+3));
              recordJournal(st, `You chose clear aligners for ${formatMoney(B, S.country)} instead of metal braces.`, 'health');
            },
          },
          {
            label: "Leave your teeth as they are",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You left your teeth as they are. They have served you fine so far.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_vaccination',
    category: 'health',
    repeatable: true,
    cooldownYears: 4,
    gates: {"minAge": 5},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_health_vaccination',
        category: 'health',
        title: "Vaccination Day",
        text: `The clinic sends the reminder: a vaccination is due. It is quick, it stings for a second, and it protects you for years. The nurse has a sticker ready, whatever your age.`,
        choices: [
          {
            label: "Get the vaccination",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You got the vaccination on time. The sting lasted a second.`, 'health');
            },
          },
          {
            label: "Delay it a month",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You delayed the vaccination by a month, then forgot about it for two.`, 'health');
            },
          },
          {
            label: "Skip it entirely",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You skipped the vaccination. Nothing happened — this time.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_allergy_season',
    category: 'health',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 10},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(250, S.country, S.year);
      return {
        key: 'ev_health_allergy_season',
        category: 'health',
        title: "Allergy Season Arrives",
        text: `Every spring the same thing: streaming eyes, endless sneezing, and a nose that will not stop running. The pollen count is high, and your body reacts like it is under attack.`,
        choices: [
          {
            label: "Take allergy medicine daily",
            effect: (st) => {
              walletMove(st, -A, 'Take allergy medicine daily', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You took allergy medicine daily, ${formatMoney(A, S.country)} a month, and the spring became bearable.`, 'health');
            },
          },
          {
            label: "Stay indoors on bad days",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You stayed indoors on the worst pollen days. The spring passed you by.`, 'health');
            },
          },
          {
            label: "Suffer through it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You suffered through allergy season without medicine. It was a long spring.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_sunburn',
    category: 'health',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 12},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(200, S.country, S.year);
      return {
        key: 'ev_health_sunburn',
        category: 'health',
        title: "A Bad Sunburn",
        text: `A day at the beach without sunscreen leaves your shoulders red, blistered, and painful to touch. Even a shirt hurts. The pharmacist shakes her head — she has seen this all summer.`,
        choices: [
          {
            label: "Treat it properly with cream",
            effect: (st) => {
              walletMove(st, -A, 'Treat it properly with cream', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You treated the sunburn properly with cream for ${formatMoney(A, S.country)}. It peeled, then healed.`, 'health');
            },
          },
          {
            label: "Stay out of the sun for a week",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You stayed out of the sun for a week while the burn healed.`, 'health');
            },
          },
          {
            label: "Go back to the beach anyway",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You went back to the beach with the sunburn still raw. It got worse.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_stomach_ulcer',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 30, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(400, S.country, S.year);
      const B = eraLocalCost(150, S.country, S.year);
      return {
        key: 'ev_health_stomach_ulcer',
        category: 'health',
        title: "A Burning Pain After Meals",
        text: `After every meal, a burning pain sits under your ribs. The doctor says it is an ulcer — stress, coffee, and eating at odd hours. The treatment is tablets, and a calmer life.`,
        choices: [
          {
            label: "Take the treatment and slow down",
            effect: (st) => {
              walletMove(st, -A, 'Take the treatment and slow down', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `You took the ulcer treatment, ${formatMoney(A, S.country)} a month, and slowed your life down. The pain faded.`, 'health');
            },
          },
          {
            label: "Take the tablets only",
            effect: (st) => {
              walletMove(st, -A, 'Take the tablets only', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You took the ulcer tablets but changed nothing else about your life.`, 'health');
            },
          },
          {
            label: "Live on antacids",
            effect: (st) => {
              walletMove(st, -B, 'Live on antacids', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              recordJournal(st, `You lived on antacids, ${formatMoney(B, S.country)} a month, and carried on exactly as before.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_hearing_test',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 45},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(12000, S.country, S.year);
      const B = eraLocalCost(4000, S.country, S.year);
      return {
        key: 'ev_health_hearing_test',
        category: 'health',
        title: "You Keep Asking People to Repeat Themselves",
        text: `It has crept up slowly: the television is louder, people mumble, and you keep asking "what?" in restaurants. A hearing test shows a real loss in one ear.`,
        choices: [
          {
            label: "Get a hearing aid",
            effect: (st) => {
              walletMove(st, -A, 'Get a hearing aid', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You got a hearing aid for ${formatMoney(A, S.country)}. Conversations came back.`, 'health');
            },
          },
          {
            label: "Get a cheaper aid",
            effect: (st) => {
              walletMove(st, -B, 'Get a cheaper aid', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You bought a cheaper hearing aid for ${formatMoney(B, S.country)}. It helps, when it works.`, 'health');
            },
          },
          {
            label: "Pretend you heard",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You started pretending you had heard, nodding along to conversations you missed.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_diabetes_scare',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 35},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(350, S.country, S.year);
      return {
        key: 'ev_health_diabetes_scare',
        category: 'health',
        title: "The Blood Sugar Warning",
        text: `The blood test comes back with a warning: your blood sugar is high, on the edge of diabetes. The doctor is blunt — this is the moment to change, while changing still works.`,
        choices: [
          {
            label: "Change your diet and walk daily",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+3));
              recordJournal(st, `You changed your diet and walked daily after the blood sugar warning. The numbers fell.`, 'health');
            },
          },
          {
            label: "Take the medicine the doctor suggests",
            effect: (st) => {
              walletMove(st, -A, 'Take the medicine the doctor suggests', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              recordJournal(st, `You took the medicine for ${formatMoney(A, S.country)} a month and kept your life the same.`, 'health');
            },
          },
          {
            label: "Ignore the warning",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You ignored the blood sugar warning. The doctor wrote it in your file.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_cholesterol',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 40},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_health_cholesterol',
        category: 'health',
        title: "High Cholesterol at the Check-Up",
        text: `The cholesterol number on the lab report is circled in red. The doctor talks about fried food, about walking, about statins — and about your father, who had his first heart problem at your age.`,
        choices: [
          {
            label: "Take statins and eat better",
            effect: (st) => {
              walletMove(st, -A, 'Take statins and eat better', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You started statins, ${formatMoney(A, S.country)} a month, and ate better. The number came down.`, 'health');
            },
          },
          {
            label: "Change the diet only",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You changed your diet and skipped the statins. The number moved, slowly.`, 'health');
            },
          },
          {
            label: "Do nothing for now",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You did nothing about the cholesterol. The number stayed circled in red.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_heart_scare',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 45, "maxAge": 75},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(8000, S.country, S.year);
      return {
        key: 'ev_health_heart_scare',
        category: 'health',
        title: "Chest Pain in the Night",
        text: `You wake at 3 a.m. with a tightness in your chest and pain running down your arm. It could be nothing. It could be everything. The hospital is ten minutes away, and every minute is a decision.`,
        choices: [
          {
            label: "Go to the emergency room at once",
            effect: (st) => {
              walletMove(st, -A, 'Go to the emergency room at once', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You went to the emergency room with chest pain and paid ${formatMoney(A, S.country)}. It was angina — a warning, caught in time.`, 'health');
            },
          },
          {
            label: "Wait until morning",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-8));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              recordJournal(st, `You waited until morning with the chest pain. The doctor’s face said everything.`, 'health');
            },
          },
          {
            label: "Call $sp to decide with you",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Call $sp to decide with you', { affection: (+3) });
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You woke ${spName} at 3 a.m. with the chest pain. ${spName} drove you to the hospital without a word.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_cancer_screening',
    category: 'health',
    repeatable: true,
    cooldownYears: 4,
    gates: {"minAge": 40},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_health_cancer_screening',
        category: 'health',
        title: "A Screening Appointment",
        text: `The letter invites you for a cancer screening — routine, free, and easy to ignore. The clinic is busy, the appointment is awkward to reach, and most people put it off.`,
        choices: [
          {
            label: "Go to the screening",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You went to the cancer screening. Everything was clear, and the worry lifted.`, 'health');
            },
          },
          {
            label: "Book it, then cancel twice",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You booked the screening and cancelled it twice. It is still on your list.`, 'health');
            },
          },
          {
            label: "Ignore the letter",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You ignored the screening letter. It went in a drawer with the others.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_quit_sugar',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 25},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_health_quit_sugar',
        category: 'health',
        title: "Giving Up Sugar",
        text: `Your teeth, your weight, your energy — everything points the same way. You decide to give up sugar for a month: no sweets, no soft drinks, no sugar in tea.`,
        choices: [
          {
            label: "Stick to it for the full month",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+2));
              recordJournal(st, `You gave up sugar for a full month. Your energy steadied and your teeth thanked you.`, 'health');
            },
          },
          {
            label: "Last two weeks",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You gave up sugar for two weeks, then had a piece of cake at a wedding.`, 'health');
            },
          },
          {
            label: "Give up after three days",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You gave up sugar after three days. The tea without it was unbearable.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_swimming',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 16},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(600, S.country, S.year);
      const B = eraLocalCost(100, S.country, S.year);
      return {
        key: 'ev_health_swimming',
        category: 'health',
        title: "Swimming at the Local Pool",
        text: `The local pool offers a monthly pass for ${formatMoney(A, S.country)}. The water is warm, the lanes are quiet in the mornings, and your joints — which hate running — love the water.`,
        choices: [
          {
            label: "Swim three times a week",
            effect: (st) => {
              walletMove(st, -A, 'Swim three times a week', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+5));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `You swam three times a week on the ${formatMoney(A, S.country)} monthly pass. Your joints and your mood improved.`, 'health');
            },
          },
          {
            label: "Swim at weekends",
            effect: (st) => {
              walletMove(st, -B, 'Swim at weekends', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+2));
              recordJournal(st, `You swam at weekends for ${formatMoney(B, S.country)} a session. It was enough to feel stronger.`, 'health');
            },
          },
          {
            label: "Skip it \u2014 the pool is too far",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              recordJournal(st, `You skipped the pool. It was too far, or so you told yourself.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_sleep_apnea',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 40},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(5000, S.country, S.year);
      return {
        key: 'ev_health_sleep_apnea',
        category: 'health',
        title: "You Stop Breathing in Your Sleep",
        text: `${spName} tells you, quietly, that you stop breathing in your sleep — long pauses, then a gasp. It has been happening for months. A sleep study would confirm it, and a machine would fix it.`,
        choices: [
          {
            label: "Do the sleep study",
            effect: (st) => {
              walletMove(st, -A, 'Do the sleep study', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You did the sleep study for ${formatMoney(A, S.country)}. The machine changed your nights — and your days.`, 'health');
            },
          },
          {
            label: "Sleep on your side and lose weight",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You slept on your side and lost weight to ease the sleep apnoea. It helped, some.`, 'health');
            },
          },
          {
            label: "Dismiss it \u2014 everyone snores",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You dismissed the sleep apnoea. ${spName} lay awake listening, night after night.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_pregnancy_check',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 22, "maxAge": 42, "gender": ["f"], "relationship": ["married"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_health_pregnancy_check',
        category: 'health',
        title: "The Pregnancy Test",
        text: `The test sits on the bathroom shelf, and the two lines are clear. You are pregnant. The joy and the fear arrive together — the clinic, the costs, the nine months ahead.`,
        choices: [
          {
            label: "Book the first clinic visit",
            effect: (st) => {
              walletMove(st, -A, 'Book the first clinic visit', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You booked the first pregnancy clinic visit for ${formatMoney(A, S.country)}. The scan showed a healthy heartbeat.`, 'health');
            },
          },
          {
            label: "Tell $sp first, then decide together",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Tell $sp first, then decide together', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You told ${spName} about the pregnancy first. You decided everything together after that.`, 'health');
            },
          },
          {
            label: "Wait a few weeks before telling anyone",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You waited a few weeks before telling anyone about the pregnancy. The secret was heavy.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_mental_health_day',
    category: 'health',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 20, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_health_mental_health_day',
        category: 'health',
        title: "A Day to Breathe",
        text: `You have not stopped in months, and your body is keeping score: headaches, a short temper, sleep that does not rest you. One day off — a real day off — is the only thing that sounds right.`,
        choices: [
          {
            label: "Take the day off and rest",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-7));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You took a real day off and rested. It was not enough, but it was a start.`, 'health');
            },
          },
          {
            label: "Take a half day",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You took a half day off. It helped, a little.`, 'health');
            },
          },
          {
            label: "Keep working \u2014 there is too much to do",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You kept working through the exhaustion. The headaches stayed.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_old_age_aches',
    category: 'health',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 60},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(200, S.country, S.year);
      return {
        key: 'ev_health_old_age_aches',
        category: 'health',
        title: "The Morning Aches",
        text: `Mornings are slower now. Your knees complain on the stairs, your hands are stiff until midday, and getting out of bed is a small project. It is not illness — it is age, arriving quietly.`,
        choices: [
          {
            label: "Start gentle morning stretches",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+2));
              recordJournal(st, `You started gentle morning stretches. The stiffness eased within weeks.`, 'health');
            },
          },
          {
            label: "Take painkillers every morning",
            effect: (st) => {
              walletMove(st, -A, 'Take painkillers every morning', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You took painkillers every morning for ${formatMoney(A, S.country)} a month, and carried on.`, 'health');
            },
          },
          {
            label: "Accept it and slow down",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You accepted the morning aches and slowed your days down to match.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_health_dentist_child',
    category: 'health',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 28, "hasChildren": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(600, S.country, S.year);
      const B = eraLocalCost(200, S.country, S.year);
      return {
        key: 'ev_health_dentist_child',
        category: 'health',
        title: "$childName Is Afraid of the Dentist",
        text: `${childName}Name needs a filling, and is terrified of the dentist — crying at the mention of the chair, the light, the sound. The appointment is tomorrow, and ${childName}Name is begging not to go.`,
        choices: [
          {
            label: "Go with $childName and hold their hand",
            effect: (st) => {
              walletMove(st, -A, 'Go with $childName and hold their hand', 'health');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Go with $childName and hold their hand', { affection: (+6) });
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You took ${childName}Name to the dentist and held their hand through the filling, ${formatMoney(A, S.country)}.`, 'health');
            },
          },
          {
            label: "Promise a treat afterwards",
            effect: (st) => {
              walletMove(st, -B, 'Promise a treat afterwards', 'health');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Promise a treat afterwards', { affection: (+4) });
              recordJournal(st, `You promised ${childName}Name a treat after the dentist, ${formatMoney(B, S.country)}, and it worked.`, 'health');
            },
          },
          {
            label: "Cancel the appointment",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Cancel the appointment', { affection: (-2) });
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You cancelled ${childName}Name’s dental appointment. The tooth got worse.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_boss_praise',
    category: 'career',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['boss'],"minAge": 20, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_boss_praise',
        category: 'career',
        title: "The Boss Notices Your Work",
        text: `${bossName} stops by your desk after the meeting and says, plainly, that your work on the project was excellent. No audience, no ceremony — just a real compliment, from the person whose opinion matters.`,
        choices: [
          {
            label: `Thank ${bossName} and ask what is next`,
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `${bossName} praised your work on the project, and you asked what was next.`, 'career');
            },
          },
          {
            label: "Accept it quietly and keep going",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You accepted ${bossName}’s praise quietly and went back to work.`, 'career');
            },
          },
          {
            label: "Tell your colleagues about it",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+1));
              recordJournal(st, `You told your colleagues about ${bossName}’s praise. It sounded like boasting, even to you.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_boss_criticism',
    category: 'career',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['boss'],"minAge": 20, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_boss_criticism',
        category: 'career',
        title: "A Public Correction",
        text: `In the meeting, ${bossName} corrects your numbers in front of everyone — and is right. The room goes quiet, and you can feel every eye on you while you fix the slide.`,
        choices: [
          {
            label: "Take it on the chin and fix it",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You took the public correction, fixed the numbers, and moved on.`, 'career');
            },
          },
          {
            label: "Argue back in the meeting",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You argued back with ${bossName} in the meeting. The room went very quiet.`, 'career');
            },
          },
          {
            label: `Ask ${bossName} privately what went wrong`,
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You asked ${bossName} privately what went wrong with the numbers, and learned from it.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_promotion_chance',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_promotion_chance',
        category: 'career',
        title: "A Senior Role Opens Up",
        text: `A senior role opens in your department, and your name is on the shortlist. The interview is next week, and the other candidate has been there longer. This is the moment you have been working toward.`,
        choices: [
          {
            label: "Prepare hard for the interview",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You prepared hard for the senior role interview — every project, every number, ready.`, 'career');
            },
          },
          {
            label: "Apply and hope for the best",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You applied for the senior role and hoped your record would speak for itself.`, 'career');
            },
          },
          {
            label: "Decide you are not ready yet",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You decided you were not ready for the senior role, and let the moment pass.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_passed_over',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_passed_over',
        category: 'career',
        title: "Passed Over for Promotion",
        text: `The promotion goes to someone else — someone with less experience, but a louder voice in meetings. ${bossName} says "next time", and means it, or does not. The sting is real either way.`,
        choices: [
          {
            label: `Ask ${bossName} what you need to do differently`,
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You asked ${bossName} what you needed to do differently to win the next promotion.`, 'career');
            },
          },
          {
            label: "Start looking elsewhere",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `Passed over for promotion, you started looking for an employer who would see your work.`, 'career');
            },
          },
          {
            label: "Work twice as hard to prove them wrong",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You worked twice as hard after being passed over, determined to prove them wrong.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_credit_stolen',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_credit_stolen',
        category: 'career',
        title: "A Colleague Takes Credit for Your Work",
        text: `In the presentation, a colleague presents your idea as their own — your slides, your numbers, your words. ${bossName} nods, impressed. Nobody in the room knows it was yours.`,
        choices: [
          {
            label: "Speak up in the meeting",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You spoke up in the meeting and claimed your own work, calmly and clearly.`, 'career');
            },
          },
          {
            label: `Tell ${bossName} privately afterwards`,
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              recordJournal(st, `You told ${bossName} privately that the idea was yours, with the drafts to prove it.`, 'career');
            },
          },
          {
            label: "Say nothing and let it go",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-4));
              recordJournal(st, `You said nothing while a colleague took credit for your work. It ate at you for weeks.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_colleague_quits',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_colleague_quits',
        category: 'career',
        title: "Your Closest Colleague Quits",
        text: `The colleague you eat lunch with, who covers for you and knows how the place really works, hands in their notice. Their workload lands on the team — which means, mostly, on you.`,
        choices: [
          {
            label: "Offer to take on their work",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You offered to take on your colleague’s work after they quit. The team noticed.`, 'career');
            },
          },
          {
            label: `Ask ${bossName} how the work will be shared`,
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You asked ${bossName} how the work would be shared after your colleague left.`, 'career');
            },
          },
          {
            label: "Use the gap to ask for a raise",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+5) / 100));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `With your colleague gone and the work on you, you asked for a raise — and got it.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_new_manager',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_new_manager',
        category: 'career',
        title: "A New Manager Arrives",
        text: `A new manager arrives from outside, with new rules, new meetings, and opinions about how everything should be done. The old ways — your ways — are suddenly "the problem".`,
        choices: [
          {
            label: "Win the new manager over",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You won the new manager over by showing, not telling, how the work gets done.`, 'career');
            },
          },
          {
            label: "Keep your head down",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You kept your head down while the new manager settled in.`, 'career');
            },
          },
          {
            label: "Push back on the new rules",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You pushed back on the new manager’s rules in the first week. It did not go well.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_overtime_ask',
    category: 'career',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['boss'],"minAge": 20, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_career_overtime_ask',
        category: 'career',
        title: "Asked to Work the Weekend",
        text: `${bossName} asks you to work the weekend — a deadline, a client, an emergency that is somehow always an emergency. Your plans are already made, and your family is expecting you.`,
        choices: [
          {
            label: "Work the weekend",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              walletMove(st, +A, 'Work the weekend', 'career');
              recordJournal(st, `You worked the weekend for ${bossName} and were paid ${formatMoney(A, S.country)} in overtime.`, 'career');
            },
          },
          {
            label: "Work Saturday only",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You worked Saturday only, and kept Sunday for your family.`, 'career');
            },
          },
          {
            label: "Refuse \u2014 your weekend is yours",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You refused the weekend work. ${bossName} did not hide the disappointment.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_client_win',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(8000, S.country, S.year);
      return {
        key: 'ev_career_client_win',
        category: 'career',
        title: "You Win the Big Client",
        text: `The client you have chased for months signs. The room erupts, ${bossName} shakes your hand twice, and your name is on the deal. It is the biggest win of your career so far.`,
        choices: [
          {
            label: "Celebrate with the team",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You won the big client, and celebrated with the team who helped you get there.`, 'career');
            },
          },
          {
            label: "Ask for a bonus on the deal",
            effect: (st) => {
              walletMove(st, +A, 'Ask for a bonus on the deal', 'career');
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked for a bonus on the client win, ${formatMoney(A, S.country)}, and got it.`, 'career');
            },
          },
          {
            label: "Stay humble and move to the next deal",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You stayed humble after the big win and moved straight to the next deal.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_client_loss',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_client_loss',
        category: 'career',
        title: "You Lose a Client",
        text: `The client you managed for two years leaves — a competitor offered less, or the relationship soured, or nobody knows. ${bossName} wants to know what happened, and the answer is not comfortable.`,
        choices: [
          {
            label: "Own it and explain honestly",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You owned the lost client and explained honestly what went wrong.`, 'career');
            },
          },
          {
            label: "Blame the pricing",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              recordJournal(st, `You blamed the pricing for the lost client. ${bossName} was not convinced.`, 'career');
            },
          },
          {
            label: "Win them back with a new offer",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You went back to the lost client with a new offer, and won them back.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_deadline_crunch',
    category: 'career',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['boss'],"minAge": 20, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_deadline_crunch',
        category: 'career',
        title: "The Deadline Moves Forward",
        text: `The deadline moves forward by two weeks, with no change to the work. The team looks at each other, then at you. Someone has to say how this gets done.`,
        choices: [
          {
            label: "Lead the team through it",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              recordJournal(st, `You led the team through the moved deadline, and delivered on time.`, 'career');
            },
          },
          {
            label: "Work late every night",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              recordJournal(st, `You worked late every night to meet the moved deadline. It cost you sleep and patience.`, 'career');
            },
          },
          {
            label: `Tell ${bossName} it cannot be done well`,
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-1));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You told ${bossName} the moved deadline could not be met well. ${bossName} listened, and moved it back a week.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_presentation',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_presentation',
        category: 'career',
        title: "Presenting to the Whole Company",
        text: `You are asked to present your project to the whole company — fifty people, the directors in the front row, and a projector that has failed before. Your hands are already sweating.`,
        choices: [
          {
            label: "Rehearse until it is perfect",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You rehearsed the presentation until it was perfect, and delivered it without a stumble.`, 'career');
            },
          },
          {
            label: "Wing it \u2014 you know the work",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You winged the presentation, trusting that you knew the work. Mostly, you did.`, 'career');
            },
          },
          {
            label: "Ask a colleague to present with you",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked a colleague to present with you, and the two of you carried it together.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_training_course',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      return {
        key: 'ev_career_training_course',
        category: 'career',
        title: "A Training Course Is Offered",
        text: `The company offers a training course — three days, a real certificate, and skills that would make you worth more anywhere. It costs ${formatMoney(A, S.country)}, and the company will pay half if you commit to staying a year.`,
        choices: [
          {
            label: "Take the course and pay your half",
            effect: (st) => {
              walletMove(st, -A, 'Take the course and pay your half', 'career');
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+5));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You took the training course, paying ${formatMoney(A, S.country)}, and came back with a certificate and new skills.`, 'career');
            },
          },
          {
            label: "Ask the company to pay it all",
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              recordJournal(st, `You asked the company to pay the full training course. They agreed, with conditions.`, 'career');
            },
          },
          {
            label: "Skip it \u2014 you are too busy",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-1));
              recordJournal(st, `You skipped the training course. You were too busy, and it showed later.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_headhunter',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 26, "hasJob": true, "minYear": 2000},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(9000, S.country, S.year);
      return {
        key: 'ev_career_headhunter',
        category: 'career',
        title: "A Headhunter Calls",
        text: `A headhunter calls out of nowhere: a rival company wants you, the salary is ${formatMoney(A, S.country)} a month, and the role is a step up. They want an answer this week.`,
        choices: [
          {
            label: "Take the new job",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+15) / 100));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You took the rival company’s offer — a step up, at ${formatMoney(A, S.country)} a month.`, 'career');
            },
          },
          {
            label: "Use the offer to negotiate where you are",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+8) / 100));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You used the headhunter’s offer to negotiate a raise where you are. It worked.`, 'career');
            },
          },
          {
            label: "Turn it down \u2014 you like your team",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You turned down the headhunter’s offer. Your team was worth more than the money.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_raise_denied',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_raise_denied',
        category: 'career',
        title: "The Raise Request Is Refused",
        text: `You ask for a raise, with your numbers ready, and ${bossName} listens carefully — then says no. Budgets, timing, next year. The words are kind. The answer is still no.`,
        choices: [
          {
            label: "Accept it and keep working",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `Your raise was refused. You accepted it and kept working.`, 'career');
            },
          },
          {
            label: "Ask what it would take to get one",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You asked ${bossName} exactly what it would take to earn the raise. Now you know the target.`, 'career');
            },
          },
          {
            label: "Start interviewing elsewhere",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `After the refused raise, you started interviewing elsewhere, quietly.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_raise_granted',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_career_raise_granted',
        category: 'career',
        title: "The Raise Comes Through",
        text: `${bossName} calls you in with good news: your salary rises by ${formatMoney(A, S.country)} a month, backdated to last month. It is not a fortune, but it is recognition — and it changes the monthly maths.`,
        choices: [
          {
            label: "Save the extra money",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+5) / 100));
              moveBalance(st, 'savings', +A, 'Save the extra money', 'career');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `Your raise of ${formatMoney(A, S.country)} a month went straight into savings.`, 'career');
            },
          },
          {
            label: "Spend a little to celebrate",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+5) / 100));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You celebrated the raise of ${formatMoney(A, S.country)} a month with a proper dinner out.`, 'career');
            },
          },
          {
            label: "Use it to pay down debt",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+5) / 100));
              st.money.creditScore = clamp(st.money.creditScore + (+4), 300, 900);
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `You used the raise to pay down debt, ${formatMoney(A, S.country)} a month at a time.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_layoff_rumour',
    category: 'career',
    repeatable: true,
    cooldownYears: 3,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_layoff_rumour',
        category: 'career',
        title: "Rumours of Layoffs",
        text: `The rumour runs through the office like a cold draught: layoffs are coming, a list exists, and nobody knows whose name is on it. People stop talking when ${bossName} walks past.`,
        choices: [
          {
            label: "Work visibly harder",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `With layoffs rumoured, you worked visibly harder — early, late, and on everything.`, 'career');
            },
          },
          {
            label: "Update your CV quietly",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You updated your CV quietly while the layoff rumours spread.`, 'career');
            },
          },
          {
            label: `Ask ${bossName} directly`,
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You asked ${bossName} directly about the layoff rumours. ${bossName} would not confirm or deny.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_restructure',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 26, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(20000, S.country, S.year);
      return {
        key: 'ev_career_restructure',
        category: 'career',
        title: "The Company Restructures",
        text: `The restructure is announced: departments merge, roles change, and your job — as you know it — will not exist in its current form. Everyone is asked to reapply for their own job.`,
        choices: [
          {
            label: "Reapply and fight for your place",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You reapplied for your own job in the restructure, and kept it.`, 'career');
            },
          },
          {
            label: "Take the voluntary package",
            effect: (st) => {
              walletMove(st, +A, 'Take the voluntary package', 'career');
              st.career.job = null; st.career.employed = false; st.career.unemployedMonths = 0;
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You took the voluntary package of ${formatMoney(A, S.country)} and left the company in the restructure.`, 'career');
            },
          },
          {
            label: "Apply for a different role inside",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You applied for a different role inside the restructured company, and got it.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_new_software',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true, "minYear": 1995},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_new_software',
        category: 'career',
        title: "New Software, New Rules",
        text: `The company replaces the system everyone knows with a new one. Training is two days, the manual is a hundred pages, and the old shortcuts are gone. Half the office is lost.`,
        choices: [
          {
            label: "Master the new system first",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You mastered the new system first, and became the person everyone asked for help.`, 'career');
            },
          },
          {
            label: "Learn it slowly, as needed",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You learned the new system slowly, as the work demanded it.`, 'career');
            },
          },
          {
            label: "Complain about it with everyone",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You complained about the new system with everyone. It changed nothing.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_remote_work',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true, "minYear": 2010},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_remote_work',
        category: 'career',
        title: "Working from Home",
        text: `The company offers two days a week from home. No commute, no office noise — but also no one watching you work, and a fridge that is always two steps away.`,
        choices: [
          {
            label: "Take the home days and stay disciplined",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You took the work-from-home days and stayed disciplined. Your life got better.`, 'career');
            },
          },
          {
            label: "Take the home days and relax into them",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You took the home days and relaxed into them. The work got slower.`, 'career');
            },
          },
          {
            label: "Stay in the office full time",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You stayed in the office full time. The visibility was worth the commute.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_relocation_offer',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 26, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_relocation_offer',
        category: 'career',
        title: "A Transfer to Another City",
        text: `The company offers a transfer to another city — a bigger role, a higher salary, and a life somewhere new. Your family, your friends, and your home are all here.`,
        choices: [
          {
            label: "Take the transfer",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+12) / 100));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You took the transfer to another city — a bigger role, a new life.`, 'career');
            },
          },
          {
            label: "Negotiate to stay and get the role",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+6) / 100));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You negotiated to stay in ${S.city} and take the bigger role from here.`, 'career');
            },
          },
          {
            label: "Turn it down for your family",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You turned down the transfer. Your family and your home were worth more.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_business_trip',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_business_trip',
        category: 'career',
        title: "A Business Trip Abroad",
        text: `The company sends you abroad for a week — flights, a hotel, meetings in a city you have never seen. It is work, but it is also a window into a different life.`,
        choices: [
          {
            label: "Work hard and impress the clients",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You worked hard on the business trip abroad and impressed the clients.`, 'career');
            },
          },
          {
            label: "Enjoy the city in the evenings",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              recordJournal(st, `You enjoyed the city in the evenings after the meetings, and came home rested.`, 'career');
            },
          },
          {
            label: "Complain about the travel",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You complained about the travel on the business trip. Nobody was sympathetic.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_mentor',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_mentor',
        category: 'career',
        title: "A Senior Colleague Takes You Under Their Wing",
        text: `A senior colleague — twenty years in, respected by everyone — starts stopping by your desk, sharing how things really work, and introducing you to the right people. Mentors like this are rare.`,
        choices: [
          {
            label: "Learn everything you can",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You learned everything you could from your mentor, and your work showed it.`, 'career');
            },
          },
          {
            label: "Ask them to recommend you for promotion",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              recordJournal(st, `You asked your mentor to recommend you for promotion. They did, gladly.`, 'career');
            },
          },
          {
            label: "Keep your distance \u2014 you work alone",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You kept your distance from the mentor. You work alone, or so you told yourself.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_train_intern',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 28, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_train_intern',
        category: 'career',
        title: "You Are Asked to Train the Intern",
        text: `A new intern arrives — young, nervous, and assigned to you. You are asked to train them, on top of your own work, with no extra time and no extra pay.`,
        choices: [
          {
            label: "Train them properly",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You trained the intern properly, and they became genuinely useful within weeks.`, 'career');
            },
          },
          {
            label: "Give them the boring work",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You gave the intern the boring work and kept the real work for yourself.`, 'career');
            },
          },
          {
            label: "Refuse \u2014 it is not your job",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              recordJournal(st, `You refused to train the intern. ${bossName} remembered that.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_coworker_conflict',
    category: 'career',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_coworker_conflict',
        category: 'career',
        title: "A Row with a Colleague",
        text: `A disagreement over who should have done a task turns into a real row — raised voices, in front of the team, over something small that somehow became big.`,
        choices: [
          {
            label: "Apologise first",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You apologised first after the row with your colleague. The air cleared by lunchtime.`, 'career');
            },
          },
          {
            label: `Let ${bossName} sort it out`,
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-1));
              recordJournal(st, `You let ${bossName} sort out the row with your colleague. It took a week.`, 'career');
            },
          },
          {
            label: "Hold the grudge",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You held the grudge after the row. The office felt colder for months.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_hr_complaint',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_hr_complaint',
        category: 'career',
        title: "A Complaint Reaches HR",
        text: `A colleague files a complaint with HR — and your name is in it. The details are exaggerated, you believe, but HR takes every complaint seriously, and now there is a file with your name on it.`,
        choices: [
          {
            label: "Cooperate fully and tell the truth",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You cooperated fully with HR and told the truth. The complaint was not upheld.`, 'career');
            },
          },
          {
            label: "Hire no one, say little",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              recordJournal(st, `You said little to HR about the complaint, and waited. The waiting was the worst part.`, 'career');
            },
          },
          {
            label: "File a counter-complaint",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              recordJournal(st, `You filed a counter-complaint. The office split into sides.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_whistleblow',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 28, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_whistleblow',
        category: 'career',
        title: "You See Something Wrong",
        text: `You find the numbers do not add up — money moving where it should not, signed off by someone senior. Reporting it could end a career: theirs, or yours.`,
        choices: [
          {
            label: "Report it through the proper channel",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              recordJournal(st, `You reported the wrongdoing through the proper channel. It was investigated, quietly.`, 'career');
            },
          },
          {
            label: "Tell a trusted colleague first",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You told a trusted colleague about what you found, and asked for advice.`, 'career');
            },
          },
          {
            label: "Say nothing \u2014 it is not your fight",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You said nothing about what you found. It stayed with you, though.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_award',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 26, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(5000, S.country, S.year);
      return {
        key: 'ev_career_award',
        category: 'career',
        title: "Employee of the Year",
        text: `At the company gathering, your name is called: Employee of the Year. A certificate, a small bonus of ${formatMoney(A, S.country)}, and a round of applause from people who have watched you work all year.`,
        choices: [
          {
            label: "Accept it graciously",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You won Employee of the Year, and accepted it graciously in front of the whole company.`, 'career');
            },
          },
          {
            label: "Take the bonus and keep working",
            effect: (st) => {
              walletMove(st, +A, 'Take the bonus and keep working', 'career');
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              recordJournal(st, `You took the ${formatMoney(A, S.country)} bonus for Employee of the Year and went straight back to work.`, 'career');
            },
          },
          {
            label: "Share the credit with your team",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+6));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You shared the Employee of the Year credit with your team. They will not forget it.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_burnout',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 26, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_burnout',
        category: 'career',
        title: "Burnout Catches Up with You",
        text: `You have been running on empty for months — late nights, no weekends, a phone that never stops. Now even small tasks feel impossible, and your body is refusing to cooperate.`,
        choices: [
          {
            label: "Take two weeks off, properly",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-10));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-2));
              recordJournal(st, `You took two weeks off, properly, and came back able to think again.`, 'career');
            },
          },
          {
            label: `Ask ${bossName} to cut your load`,
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+1));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked ${bossName} to cut your workload. ${bossName} agreed — and meant it.`, 'career');
            },
          },
          {
            label: "Push through it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-8));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-4));
              recordJournal(st, `You pushed through the burnout. Your body pushed back harder.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_retirement_plan',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 55, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      return {
        key: 'ev_career_retirement_plan',
        category: 'career',
        title: "Planning for Retirement",
        text: `The company pension adviser sits you down with the numbers: if you keep saving at this rate, you retire at 62 with ${formatMoney(A, S.country)} a month. If you save more, sooner. The numbers are not comforting.`,
        choices: [
          {
            label: "Increase your pension savings",
            effect: (st) => {
              moveBalance(st, 'savings', -A, 'Increase your pension savings', 'career');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              recordJournal(st, `You increased your pension savings by ${formatMoney(A, S.country)} a month, for the retirement you want.`, 'career');
            },
          },
          {
            label: "Keep saving as you are",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You kept your pension savings as they are, and hoped the numbers would work out.`, 'career');
            },
          },
          {
            label: "Plan to work until 70",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You decided to work until 70. The thought tired you before you finished saying it.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_night_shift',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2500, S.country, S.year);
      return {
        key: 'ev_career_night_shift',
        category: 'career',
        title: "Offered the Night Shift",
        text: `The night shift pays ${formatMoney(A, S.country)} more a month, and nobody wants it. The hours would turn your life upside down — sleeping while the world is awake, awake while it sleeps.`,
        choices: [
          {
            label: "Take the night shift",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+10) / 100));
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You took the night shift for the extra ${formatMoney(A, S.country)} a month. The money was real; so was the exhaustion.`, 'career');
            },
          },
          {
            label: "Take it for three months only",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+10) / 100));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You took the night shift for three months only, to save the extra pay.`, 'career');
            },
          },
          {
            label: "Turn it down",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You turned down the night shift. Your sleep was worth more than the money.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_side_business',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 28, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(6000, S.country, S.year);
      /* v2.11 W3 — the real-business choice names its price up front:
         the cheapest launchable venture's startup capital. */
      const venture = cheapestLaunchableVenture(S);
      const capLocal = launchCapitalLocal(S, venture);
      return {
        key: 'ev_career_side_business',
        category: 'career',
        title: "A Side Business Idea",
        text: `A customer asks if you do this work privately — and offers ${formatMoney(A, S.country)} for a small job on the side. It could be the start of your own business, or a distraction that costs you your job.`,
        choices: [
          {
            label: "Take the side job carefully",
            effect: (st) => {
              walletMove(st, +A, 'Take the side job carefully', 'career');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You took the side job for ${formatMoney(A, S.country)}, carefully, in your own time.`, 'career');
            },
          },
          {
            label: `Turn it into a real business plan${venture ? ` (needs ${formatMoney(capLocal, S.country)} to start)` : ` (needs reputation 58 to register a company — yours is ${Math.round(Number(S.reputation ?? 55))})`}`,
            effect: (st) => {
              /* v2.11 W3 — this choice CREATES a real business in
                 S.career.businesses (staff + P&L), via Worker 1's
                 createBusiness in businessEngine.js. It no longer just
                 pays cash and writes a journal line. The launcher
                 charges the startup capital itself and refuses when the
                 player cannot afford it (cap of 3 businesses, degree
                 and reputation locks included); the refusal below is
                 plain about the amount, and the player still keeps the
                 paid side-job money instead of losing the whole idea.
                 The new business starts part-time — the player keeps
                 their job — with 2 named staff (Worker 2's
                 ensureStaffArray, setup covered by the startup
                 capital, wages then paid through the monthly P&L) and
                 a first computed P&L, so it is a trading business the
                 moment the choice is made, not a journal line. */
              const v = cheapestLaunchableVenture(st);
              const cap = launchCapitalLocal(st, v);
              const sidePay = eraLocalCost(6000, st.country, st.year);
              if (!v) {
                walletMove(st, +sidePay, 'Take the side job carefully', 'career');
                recordJournal(st, `You tried to turn the side job into a real business, but registering a company needs reputation 58 and yours is ${Math.round(Number(st.reputation ?? 55))} — no venture would take you yet. You took the paid job instead and kept building your name.`, 'career');
                return;
              }
              /* v2.20 I1 — the event launch goes through the same
                 explicit gate as the launch screen: part-time, run by
                 the player. A full-time launch would need a manager
                 or a resignation first, and this choice offers
                 neither, so it never asks for one. */
              const res = createBusiness(st, v.id, `${st.player.familyName} ${v.label.split(' ')[0]}`, { mode: 'part_time', runBy: 'self' });
              if (!res || !res.ok) {
                const cashBefore = st.money.cash;
                walletMove(st, +sidePay, 'Take the side job carefully', 'career');
                st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
                recordJournal(st, `You costed turning the side job into a real ${v.label} business: it needs ${formatMoney(cap, st.country)} to start${res && res.msg ? ` — ${res.msg}` : `, and you have ${formatMoney(cashBefore, st.country)}`}. The plan stays on paper for now; you took the paid side job instead.`, 'career');
                return;
              }
              const biz = res.biz || (businessesOf(st).length ? businessesOf(st)[businessesOf(st).length - 1] : st.career.business);
              if (biz) {
                ensureBusinessContract(st, biz);
                if (!Array.isArray(biz.staff) || biz.staff.length === 0) {
                  biz.employees = 2;
                  ensureStaffArray(st, biz);
                }
                try { computeBusinessMonth(st, biz); } catch (_) { /* P&L fills in at the next settlement if this fails */ }
              }
              walletMove(st, +sidePay, `First paying client — ${biz ? biz.name : v.label}`, 'career');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+4));
              recordJournal(st, biz
                ? `You turned the side job into a real business: ${biz.name} (${v.label}) is registered, with ${(biz.staff || []).length} staff and a monthly profit-and-loss, after ${formatMoney(cap, st.country)} of startup capital. The customer who started it paid ${formatMoney(sidePay, st.country)} for the first job.`
                : `You turned the side job into a real business plan for a ${v.label} venture.`, 'career');
            },
          },
          {
            label: "Decline \u2014 your job comes first",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You declined the side job. Your job comes first, and you meant it.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_idea_stolen_boss',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_idea_stolen_boss',
        category: 'career',
        title: `${bossName} Presents Your Idea as Their Own`,
        text: `${bossName} presents your idea to the directors — your words, almost exactly — and takes the praise. Nobody in the room knows it was yours. ${bossName} thanks you afterwards, privately, "for the help".`,
        choices: [
          {
            label: `Confront ${bossName} privately`,
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You confronted ${bossName} privately about the stolen idea. ${bossName} apologised, and never did it again.`, 'career');
            },
          },
          {
            label: "Document your ideas from now on",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You started documenting every idea in writing, with dates, so it could never happen again.`, 'career');
            },
          },
          {
            label: "Let it go \u2014 the idea was good for the team",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You let ${bossName} take the credit for your idea. It was good for the team, you told yourself.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_office_party',
    category: 'career',
    repeatable: true,
    cooldownYears: 3,
    gates: { requiredPeople: ['boss'],"minAge": 20, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_office_party',
        category: 'career',
        title: "The Office Party",
        text: `The annual office party: music, food, and colleagues you only ever see at their desks, suddenly dancing. ${bossName} is there, the directors are there, and someone has brought a karaoke machine.`,
        choices: [
          {
            label: "Go and enjoy yourself",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You went to the office party and enjoyed yourself properly. People saw a different side of you.`, 'career');
            },
          },
          {
            label: "Go, but stay professional",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You went to the office party and stayed professional. It was pleasant, and safe.`, 'career');
            },
          },
          {
            label: "Skip it entirely",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You skipped the office party. Nobody mentioned it, but a few people noticed.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_mistake_costly',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(10000, S.country, S.year);
      return {
        key: 'ev_career_mistake_costly',
        category: 'career',
        title: "A Costly Mistake",
        text: `You send the wrong file to the client — the old prices, not the new ones — and the client signs on the wrong numbers. The mistake costs the company ${formatMoney(A, S.country)}, and ${bossName} wants an explanation.`,
        choices: [
          {
            label: "Own the mistake at once",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You owned the costly mistake at once, and fixed it before the client noticed the worst of it.`, 'career');
            },
          },
          {
            label: "Fix it quietly and say nothing",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You fixed the mistake quietly and said nothing. The worry stayed with you for weeks.`, 'career');
            },
          },
          {
            label: "Blame the system",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              recordJournal(st, `You blamed the system for the costly mistake. ${bossName} did not accept that.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_new_job_offer',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(11000, S.country, S.year);
      return {
        key: 'ev_career_new_job_offer',
        category: 'career',
        title: "A Better Job Offer",
        text: `A company you admire offers you a role: better title, better pay — ${formatMoney(A, S.country)} a month — and a team you would love. The only problem is leaving the team you already love.`,
        choices: [
          {
            label: "Accept the offer",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+12) / 100));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You accepted the better job offer at ${formatMoney(A, S.country)} a month, and left your old team with real sadness.`, 'career');
            },
          },
          {
            label: "Ask your current employer to match it",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+7) / 100));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked your employer to match the offer. They did — almost.`, 'career');
            },
          },
          {
            label: "Stay where you are",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You stayed where you are, despite the better offer. Loyalty won.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_fired_warning',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_fired_warning',
        category: 'career',
        title: "A Formal Warning",
        text: `${bossName} calls you in with a letter: a formal warning about your performance. One more, and you are out. The letter is cold, official, and it sits in your file from today.`,
        choices: [
          {
            label: "Work harder than ever",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You worked harder than ever after the formal warning, determined to clear your name.`, 'career');
            },
          },
          {
            label: "Ask for a clear plan to improve",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked for a clear plan to improve after the warning, with targets you could hit.`, 'career');
            },
          },
          {
            label: "Start job hunting that night",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You started job hunting the night of the formal warning.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_fired',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(15000, S.country, S.year);
      return {
        key: 'ev_career_fired',
        category: 'career',
        title: "You Are Let Go",
        text: `${bossName} asks you to sit down, and the words come slowly: the company is cutting costs, and your role is gone. You have a month’s pay of ${formatMoney(A, S.country)}, a reference, and a desk to clear by Friday.`,
        choices: [
          {
            label: "Take the package and start again",
            effect: (st) => {
              walletMove(st, +A, 'Take the package and start again', 'career');
              st.career.job = null; st.career.employed = false; st.career.unemployedMonths = 0;
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-5));
              recordJournal(st, `You were let go, took the ${formatMoney(A, S.country)} package, and started again.`, 'career');
            },
          },
          {
            label: "Ask for a different role",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked for a different role after being let go. There was none to give.`, 'career');
            },
          },
          {
            label: "Fight it \u2014 the decision was unfair",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+9));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              recordJournal(st, `You fought the dismissal, arguing it was unfair. The fight took months.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_interview_panel',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_interview_panel',
        category: 'career',
        title: "Sitting on the Interview Panel",
        text: `You are asked to sit on the interview panel for a new hire — the first time you have been on this side of the table. The candidates are nervous, and their futures are partly in your hands.`,
        choices: [
          {
            label: "Judge fairly and kindly",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              recordJournal(st, `You sat on the interview panel and judged fairly and kindly. The hire was a good one.`, 'career');
            },
          },
          {
            label: "Push for the strongest candidate",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You pushed the panel for the strongest candidate, and won the argument.`, 'career');
            },
          },
          {
            label: "Let the others decide",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You let the others on the panel decide the hire. It was easier.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_union_meeting',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(150, S.country, S.year);
      return {
        key: 'ev_career_union_meeting',
        category: 'career',
        title: "A Union Meeting at Lunch",
        text: `A union organiser holds a meeting at lunch: pay, hours, conditions. Joining costs ${formatMoney(A, S.country)} a month, and the company does not love unions. Half your colleagues are already members.`,
        choices: [
          {
            label: "Join the union",
            effect: (st) => {
              walletMove(st, -A, 'Join the union', 'career');
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You joined the union for ${formatMoney(A, S.country)} a month. It felt like having someone in your corner.`, 'career');
            },
          },
          {
            label: "Attend but do not join yet",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You attended the union meeting but did not join yet. You wanted to think.`, 'career');
            },
          },
          {
            label: "Stay away entirely",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You stayed away from the union meeting entirely. The company noticed, and so did your colleagues.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_strike_day',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_career_strike_day',
        category: 'career',
        title: "A Strike Day",
        text: `The union calls a strike day: no work, a picket line, and a day’s pay lost — ${formatMoney(A, S.country)}. Crossing the line means working while your colleagues stand outside in the cold.`,
        choices: [
          {
            label: "Join the strike",
            effect: (st) => {
              walletMove(st, -A, 'Join the strike', 'career');
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You joined the strike and lost a day’s pay, ${formatMoney(A, S.country)}, standing with your colleagues.`, 'career');
            },
          },
          {
            label: "Work from home that day",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+1));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You worked from home on the strike day. Your colleagues noticed.`, 'career');
            },
          },
          {
            label: "Take a sick day instead",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You took a sick day on the strike day, to avoid choosing. It felt worse than choosing.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_conference',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 26, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(5000, S.country, S.year);
      return {
        key: 'ev_career_conference',
        category: 'career',
        title: "A Conference in Another City",
        text: `The company sends you to a conference: two days of talks, new ideas, and people from your field from everywhere. The ticket costs ${formatMoney(A, S.country)}, and the company is paying.`,
        choices: [
          {
            label: "Go and learn everything",
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+4));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You went to the conference and learned everything you could. The ideas stayed with you.`, 'career');
            },
          },
          {
            label: "Go and network hard",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+5));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              recordJournal(st, `You networked hard at the conference and came home with a pocket full of contacts.`, 'career');
            },
          },
          {
            label: "Skip it \u2014 too much work at the office",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-1));
              recordJournal(st, `You skipped the conference. The work at the office did not wait.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_promotion_celebration',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 26, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      return {
        key: 'ev_career_promotion_celebration',
        category: 'career',
        title: "Your Promotion Is Announced",
        text: `Your name is read out in the meeting: you are promoted, with a new title and a raise of ${formatMoney(A, S.country)} a month. Your colleagues applaud, and ${bossName} shakes your hand like it was always going to be you.`,
        choices: [
          {
            label: "Celebrate with the team",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+8) / 100));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+7));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              recordJournal(st, `Your promotion was announced, with a raise of ${formatMoney(A, S.country)} a month, and you celebrated with the team.`, 'career');
            },
          },
          {
            label: `Thank ${bossName} privately`,
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+8) / 100));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You thanked ${bossName} privately for the promotion. ${bossName} said you had earned it.`, 'career');
            },
          },
          {
            label: "Start planning your first moves",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+8) / 100));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              recordJournal(st, `You started planning your first moves in the new role before the applause had faded.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_work_friendship',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 20, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_work_friendship',
        category: 'career',
        title: "A Real Friendship at Work",
        text: `A colleague you barely knew becomes a real friend — lunches, honest talk, someone who covers for you and tells you the truth. Work feels different with a friend in it.`,
        choices: [
          {
            label: "Invest in the friendship",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Invest in the friendship', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `A colleague became a real friend, and you invested in the friendship properly.`, 'career');
            },
          },
          {
            label: "Keep it professional",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You kept the work friendship professional, and it stayed pleasant.`, 'career');
            },
          },
          {
            label: "Pull back \u2014 work is work",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You pulled back from the work friendship. Work is work, you told yourself.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_office_romance',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true, "relationship": ["single"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_office_romance',
        category: 'career',
        title: "A Spark with a Colleague",
        text: `A colleague — the one who makes you laugh in meetings — asks if you want coffee after work. It is not quite a date, and it is not quite not one. The office will notice, whatever you do.`,
        choices: [
          {
            label: "Say yes to coffee",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You said yes to coffee with the colleague. It went well. Very well.`, 'career');
            },
          },
          {
            label: "Keep it friendly, nothing more",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You kept it friendly with the colleague, nothing more. For now.`, 'career');
            },
          },
          {
            label: "Say no \u2014 never mix work and love",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You said no to coffee with the colleague. Work and love do not mix, you decided.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_boss_leaves',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_boss_leaves',
        category: 'career',
        title: `${bossName} Leaves the Company`,
        text: `${bossName} announces they are leaving — a better offer, a new city, a new life. The team is stunned. ${bossName} was the reason half of you stayed, and now the future of the department is an open question.`,
        choices: [
          {
            label: `Ask ${bossName} to take you along`,
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You asked ${bossName} to take you along to the new company. ${bossName} promised to try.`, 'career');
            },
          },
          {
            label: "Step up and lead the team",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You stepped up to lead the team after ${bossName} left. It was frightening, and it worked.`, 'career');
            },
          },
          {
            label: "Wait and see who replaces them",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You waited to see who would replace ${bossName}. The waiting was the hard part.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_new_hire_rival',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_new_hire_rival',
        category: 'career',
        title: "A Brilliant New Hire Arrives",
        text: `A brilliant new hire arrives — younger, faster, and fluent in everything new. Suddenly your experience feels old, and your desk feels like the past. The new hire is friendly, which somehow makes it worse.`,
        choices: [
          {
            label: "Learn from them",
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+4));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You learned from the brilliant new hire, and your own work got sharper.`, 'career');
            },
          },
          {
            label: "Compete with them",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You competed with the new hire, openly, and pushed yourself harder.`, 'career');
            },
          },
          {
            label: "Feel threatened and pull back",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You felt threatened by the new hire and pulled back. Your work showed it.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_salary_review',
    category: 'career',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['boss'],"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_career_salary_review',
        category: 'career',
        title: "The Annual Salary Review",
        text: `The annual review arrives: your salary is reviewed against the market, your performance, and the budget. The number ${bossName} offers is ${formatMoney(A, S.country)} a month more — less than you hoped, more than nothing.`,
        choices: [
          {
            label: "Accept the offer",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+4) / 100));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You accepted the salary review offer of ${formatMoney(A, S.country)} a month more.`, 'career');
            },
          },
          {
            label: "Negotiate for more",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+7) / 100));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You negotiated the salary review up from ${formatMoney(A, S.country)}. ${bossName} respected the pushback.`, 'career');
            },
          },
          {
            label: "Reject it and look elsewhere",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-1));
              recordJournal(st, `You rejected the salary review offer and started looking elsewhere.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_overtime_burn',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(6000, S.country, S.year);
      return {
        key: 'ev_career_overtime_burn',
        category: 'career',
        title: "Three Months of Overtime",
        text: `Three months of late nights, and the overtime pay is ${formatMoney(A, S.country)} — but your health, your sleep, and your family have all paid for it too. The money is in the account. The question is what it cost.`,
        choices: [
          {
            label: "Bank the money and rest now",
            effect: (st) => {
              walletMove(st, +A, 'Bank the money and rest now', 'career');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `You banked the ${formatMoney(A, S.country)} of overtime pay and finally rested.`, 'career');
            },
          },
          {
            label: "Keep going \u2014 the money is too good",
            effect: (st) => {
              walletMove(st, +A, 'Keep going — the money is too good', 'career');
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You kept going with the overtime. The money was too good to stop.`, 'career');
            },
          },
          {
            label: "Ask for time off instead of pay",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-6));
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You asked for time off instead of overtime pay, and took a proper break.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_client_dinner',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 26, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_client_dinner',
        category: 'career',
        title: "Dinner with the Client",
        text: `The client invites you to dinner — a proper restaurant, the kind with no prices on the menu. It is business, but it is also a test: how you carry yourself when nobody is watching the clock.`,
        choices: [
          {
            label: "Be yourself and listen well",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You were yourself at the client dinner, and listened well. The client noticed.`, 'career');
            },
          },
          {
            label: "Pitch hard over dessert",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You pitched hard over dessert at the client dinner. The client signed the next week.`, 'career');
            },
          },
          {
            label: "Drink too much",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-4));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-3));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You drank too much at the client dinner. ${bossName} heard about it the next morning.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_language_course',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(4000, S.country, S.year);
      return {
        key: 'ev_career_language_course',
        category: 'career',
        title: "A Language Course for Work",
        text: `Work offers a language course — ${formatMoney(A, S.country)} for the year, evenings after work. The language would open doors: clients, postings abroad, a different career entirely.`,
        choices: [
          {
            label: "Enrol and study seriously",
            effect: (st) => {
              walletMove(st, -A, 'Enrol and study seriously', 'career');
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+5));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              recordJournal(st, `You enrolled in the language course for ${formatMoney(A, S.country)} and studied seriously. A new door opened.`, 'career');
            },
          },
          {
            label: "Enrol and coast",
            effect: (st) => {
              walletMove(st, -A, 'Enrol and coast', 'career');
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+1));
              recordJournal(st, `You enrolled in the language course but coasted. The certificate still helped.`, 'career');
            },
          },
          {
            label: "Skip it \u2014 evenings are yours",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You skipped the language course. Your evenings stayed yours.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_pension_gap',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 50, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2500, S.country, S.year);
      return {
        key: 'ev_career_pension_gap',
        category: 'career',
        title: "The Pension Gap",
        text: `The pension statement arrives, and the gap is plain: at this rate, retirement will be tight. You have fifteen years to close it — or to accept a smaller life later.`,
        choices: [
          {
            label: "Raise your contributions now",
            effect: (st) => {
              moveBalance(st, 'savings', -A, 'Raise your contributions now', 'career');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+3));
              recordJournal(st, `You raised your pension contributions by ${formatMoney(A, S.country)} a month to close the gap.`, 'career');
            },
          },
          {
            label: "Plan to sell property later",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You planned to sell property later to cover the pension gap. It was a plan, of sorts.`, 'career');
            },
          },
          {
            label: "Ignore the statement",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You ignored the pension statement. The gap did not go away.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_early_retirement',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 55, "hasJob": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(60000, S.country, S.year);
      const B = eraLocalCost(75000, S.country, S.year);
      return {
        key: 'ev_career_early_retirement',
        category: 'career',
        title: "An Early Retirement Offer",
        text: `The company offers early retirement: leave now, with a lump sum of ${formatMoney(A, S.country)} and a pension starting early. It is generous — and it is also the company saying goodbye, politely, on paper.`,
        choices: [
          {
            label: "Take the early retirement",
            effect: (st) => {
              walletMove(st, +A, 'Take the early retirement', 'career');
              st.career.job = null; st.career.employed = false; st.career.unemployedMonths = 0;
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You took the early retirement offer of ${formatMoney(A, S.country)} and left work on your own terms.`, 'career');
            },
          },
          {
            label: "Stay and work five more years",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              recordJournal(st, `You stayed and worked five more years instead of taking the early retirement.`, 'career');
            },
          },
          {
            label: "Negotiate a better package",
            effect: (st) => {
              walletMove(st, +B, 'Negotiate a better package', 'career');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You negotiated the early retirement package up to ${formatMoney(B, S.country)} before deciding.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_first_exam',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 7, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_first_exam',
        category: 'school',
        title: "Your First Big Exam",
        text: `The first big exam is tomorrow, and the whole class is nervous. Your teacher says it is just a test of what you know — but everyone knows it decides who sits where next term.`,
        choices: [
          {
            label: "Study hard tonight",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You studied hard the night before your first big exam, and it showed.`, 'school');
            },
          },
          {
            label: "Revise a little, then sleep early",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You revised a little, then slept early before the exam. It was the right call.`, 'school');
            },
          },
          {
            label: "Do not study at all",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You did not study for the exam at all. The paper was harder than you expected.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_bully',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 8, "maxAge": 16, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_bully',
        category: 'school',
        title: "The Bully in the Corridor",
        text: `A bigger boy waits for you in the corridor every day now — shoves, insults, taking your lunch money. You have told no one, because telling feels like losing.`,
        choices: [
          {
            label: "Tell a teacher",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Tell a teacher', { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You told a teacher about the bully. The corridor got safer within a week.`, 'school');
            },
          },
          {
            label: `Tell ${momName} and ${dadName}`,
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Tell ${momName} and ${dadName}`, { affection: (+4) });
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', `Tell ${momName} and ${dadName}`, { affection: (+4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You told ${momName} and ${dadName} about the bully. They went to the school the next morning.`, 'school');
            },
          },
          {
            label: "Fight back",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              recordJournal(st, `You fought the bully in the corridor. It stopped — but so did something else.`, 'school');
            },
          },
          {
            label: "Keep quiet and endure it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-5));
              recordJournal(st, `You kept quiet about the bully and endured it. It went on for months.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_best_friend_fight',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['friend'],"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_best_friend_fight',
        category: 'school',
        title: "A Fight with Your Best Friend",
        text: `Your best friend says something cruel in front of everyone, and you say something crueller back. Now you are not speaking, the class has picked sides, and the silence is worse than the row.`,
        choices: [
          {
            label: "Apologise first",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Apologise first', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You apologised first to your best friend. The friendship survived, stronger.`, 'school');
            },
          },
          {
            label: "Wait for them to apologise",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Wait for them to apologise', { affection: (-3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You waited for your best friend to apologise. The silence lasted two weeks.`, 'school');
            },
          },
          {
            label: "Find a new best friend",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Find a new best friend', { affection: (-6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You found a new best friend after the fight. The old one still stings.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_teacher_praise',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 7, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_teacher_praise',
        category: 'school',
        title: "The Teacher Praises You in Front of the Class",
        text: `Your teacher holds up your work and reads it to the class — the best essay, the neatest sums, the answer nobody else got. The class claps, and your face burns with pride.`,
        choices: [
          {
            label: "Work even harder",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `The teacher praised your work in front of the class, and you worked even harder after it.`, 'school');
            },
          },
          {
            label: "Enjoy the moment",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              recordJournal(st, `You enjoyed the praise, properly, and let it carry you through the week.`, 'school');
            },
          },
          {
            label: "Hide from the attention",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You hid from the attention after the praise. Being noticed felt strange.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_teacher_scold',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 7, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_teacher_scold',
        category: 'school',
        title: "Scolded in Front of Everyone",
        text: `Your homework is not done, and the teacher makes an example of you — in front of the whole class, with your name said slowly. The shame sits in your chest all day.`,
        choices: [
          {
            label: "Do the homework properly from now on",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You did your homework properly from then on, after being scolded in front of the class.`, 'school');
            },
          },
          {
            label: "Apologise to the teacher",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You apologised to the teacher after the scolding. It was accepted, quietly.`, 'school');
            },
          },
          {
            label: "Decide the teacher hates you",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You decided the teacher hated you after the scolding, and stopped trying in that subject.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_cheating_temptation',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 12, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_cheating_temptation',
        category: 'school',
        title: "The Answers Are Right There",
        text: `During the exam, the boy next to you slides his paper where you can see it — every answer, clear as day. The teacher is looking the other way. One glance and you pass.`,
        choices: [
          {
            label: "Look away and do your own work",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You looked away from the answers during the exam and did your own work.`, 'school');
            },
          },
          {
            label: "Copy the answers",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              recordJournal(st, `You copied the answers in the exam. You passed — and felt sick about it for weeks.`, 'school');
            },
          },
          {
            label: "Report the boy afterwards",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You reported the cheating after the exam. The boy did not speak to you again.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_homework_pile',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_homework_pile',
        category: 'school',
        title: "A Mountain of Homework",
        text: `Three subjects, all due tomorrow, and you have not started any of them. The evening stretches ahead — homework, or everything else you would rather do.`,
        choices: [
          {
            label: "Do it all, properly",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              recordJournal(st, `You did the whole mountain of homework, properly, and finished after midnight.`, 'school');
            },
          },
          {
            label: "Do half and hope",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You did half the homework and hoped the teacher would not notice. The teacher noticed.`, 'school');
            },
          },
          {
            label: "Copy it from a friend",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You copied the homework from a friend. It was done, and you had learned nothing.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_trip',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_trip',
        category: 'school',
        title: "The School Trip",
        text: `The school trip is announced — a whole day away, a bus, a museum or a beach, and freedom from the classroom. Everyone is talking about it, and the permission slip is in your bag.`,
        choices: [
          {
            label: "Go on the trip",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Go on the trip', { affection: (+3) });
              recordJournal(st, `You went on the school trip, and it was the best day of the term.`, 'school');
            },
          },
          {
            label: "Stay behind and study",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You stayed behind to study while the class went on the trip. The quiet was useful, and lonely.`, 'school');
            },
          },
          {
            label: "Lose the permission slip",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You lost the permission slip for the school trip, and watched the bus leave without you.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_sports_day',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_sports_day',
        category: 'school',
        title: "Sports Day",
        text: `Sports day: the whole school on the field, races, cheering, and your event — the one you have been dreading, or the one you have been waiting for all year.`,
        choices: [
          {
            label: "Run your hardest and win",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You ran your hardest on sports day — and won. The whole school cheered.`, 'school');
            },
          },
          {
            label: "Take part and enjoy it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You took part in sports day and enjoyed it, win or lose.`, 'school');
            },
          },
          {
            label: "Hide at the back",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You hid at the back on sports day, and hoped nobody would pick you.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_club_join',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 10, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_club_join',
        category: 'school',
        title: "Joining a School Club",
        text: `The school offers clubs: football, art, science, drama, music. The sign-up sheet is on the wall, and the football captain is already asking if you are in.`,
        choices: [
          {
            label: "Join the football team",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+4));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Join the football team', { affection: (+3) });
              recordJournal(st, `You joined the school football team. Practice twice a week, matches on Saturdays.`, 'school');
            },
          },
          {
            label: "Join the science club",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              recordJournal(st, `You joined the science club, and spent afternoons building things that sometimes worked.`, 'school');
            },
          },
          {
            label: "Join the drama club",
            effect: (st) => {
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You joined the drama club, and discovered you loved being on stage.`, 'school');
            },
          },
          {
            label: "Join nothing \u2014 focus on lessons",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You joined no club, and focused on your lessons instead.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_crush',
    category: 'school',
    repeatable: true,
    cooldownYears: 3,
    gates: { requiredPeople: ['friend'],"minAge": 12, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_crush',
        category: 'school',
        title: "A Crush in Class",
        text: `Someone in your class makes your heart beat faster — the way they laugh, the way they answer in lessons. You have never told anyone, and the secret is getting heavy.`,
        choices: [
          {
            label: "Tell them how you feel",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You told your crush how you felt. The answer was kind, whatever it was.`, 'school');
            },
          },
          {
            label: "Tell your best friend instead",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Tell your best friend instead', { affection: (+3) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You told your best friend about the crush. The secret was lighter after that.`, 'school');
            },
          },
          {
            label: "Keep it secret forever",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You kept the crush secret forever. Some days, you still wonder.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_detention',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['mom'],"minAge": 10, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_detention',
        category: 'school',
        title: "Detention After School",
        text: `You are kept back after school — detention, for talking in class, or for the homework, or for the thing you did not quite do. The classroom is empty, the clock is loud, and ${momName} will ask where you were.`,
        choices: [
          {
            label: "Serve it quietly and learn",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You served the detention quietly, and learned from it.`, 'school');
            },
          },
          {
            label: "Argue that it was unfair",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You argued the detention was unfair. It was not, and the teacher knew it.`, 'school');
            },
          },
          {
            label: `Hide it from ${momName}`,
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Hide it from ${momName}`, { trust: (-3) });
              recordJournal(st, `You hid the detention from ${momName}. She found out anyway, from another parent.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_lost_book',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'friend'],"minAge": 7, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_school_lost_book',
        category: 'school',
        title: "You Lose Your School Books",
        text: `Your school books are gone — left on the bus, or in the playground, or somewhere you cannot remember. The teacher wants them tomorrow, and replacing them costs ${formatMoney(A, S.country)}.`,
        choices: [
          {
            label: `Tell ${momName} and replace them`,
            effect: (st) => {
              walletMove(st, -A, `Tell ${momName} and replace them`, 'school');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Tell ${momName} and replace them`, { affection: (+2) });
              recordJournal(st, `You told ${momName} about the lost books and replaced them for ${formatMoney(A, S.country)}.`, 'school');
            },
          },
          {
            label: "Borrow a friend\u2019s books",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Borrow a friend’s books', { affection: (+2) });
              st.education.academicSkill = clamp(st.education.academicSkill + (-1));
              recordJournal(st, `You borrowed a friend’s books after losing yours, and copied what you needed.`, 'school');
            },
          },
          {
            label: "Say nothing and hope",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You said nothing about the lost books, and hoped the teacher would forget. The teacher did not.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_new_uniform',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 7, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      const B = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_school_new_uniform',
        category: 'school',
        title: "Outgrowing the Uniform",
        text: `The uniform does not fit anymore — the sleeves stop at your wrists, the trousers at your ankles. A new one costs ${formatMoney(A, S.country)}, and ${momName} has been putting it off for a month.`,
        choices: [
          {
            label: "Get the new uniform",
            effect: (st) => {
              walletMove(st, -A, 'Get the new uniform', 'school');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              st.player.vitals.looks = clamp(st.player.vitals.looks + (+1));
              recordJournal(st, `You got a new school uniform for ${formatMoney(A, S.country)}. It fit, finally.`, 'school');
            },
          },
          {
            label: "Wear the old one one more term",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You wore the old uniform one more term, sleeves short and all.`, 'school');
            },
          },
          {
            label: "Get a second-hand one",
            effect: (st) => {
              walletMove(st, -B, 'Get a second-hand one', 'school');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `You got a second-hand uniform for ${formatMoney(B, S.country)}. It fit, and nobody could tell.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_fees_rise',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 7, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      return {
        key: 'ev_school_fees_rise',
        category: 'school',
        title: "School Fees Go Up",
        text: `The school writes to your parents: fees rise next term, to ${formatMoney(A, S.country)}. ${momName} reads the letter twice, then puts it down without a word. The money has to come from somewhere.`,
        choices: [
          {
            label: "Your parents pay it \u2014 you study harder",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Your parents pay it — you study harder', { affection: (+3) });
              recordJournal(st, `The school fees went up, your parents paid them, and you studied harder to be worth it.`, 'school');
            },
          },
          {
            label: "Take extra chores to help",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Take extra chores to help', { affection: (+4) });
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', 'Take extra chores to help', { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You took on extra chores at home to help with the higher school fees.`, 'school');
            },
          },
          {
            label: "Ask to move to a cheaper school",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You asked to move to a cheaper school when the fees went up. ${momName} refused.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_tutor_offer',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 12, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_school_tutor_offer',
        category: 'school',
        title: "A Tutor Is Offered",
        text: `Your teacher suggests a tutor — two evenings a week, ${formatMoney(A, S.country)} a month — to push your grades from good to excellent. Your parents are willing, if you are.`,
        choices: [
          {
            label: "Take the tutor",
            effect: (st) => {
              walletMove(st, -A, 'Take the tutor', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+6));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              recordJournal(st, `You took the tutor, two evenings a week for ${formatMoney(A, S.country)} a month, and your grades climbed.`, 'school');
            },
          },
          {
            label: "Study alone instead",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You studied alone instead of taking the tutor, and your grades climbed anyway.`, 'school');
            },
          },
          {
            label: "Refuse \u2014 you are doing fine",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-1));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `You refused the tutor. You were doing fine, you said, and mostly you were.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_grade_drop',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['mom'],"minAge": 10, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_grade_drop',
        category: 'school',
        title: "Your Grades Slip",
        text: `The report card is worse than last term — two grades down, and a note from the teacher asking what has changed. ${momName} reads it in silence, then looks at you.`,
        choices: [
          {
            label: "Study hard to fix it",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `Your grades slipped, and you studied hard to fix them before the next report.`, 'school');
            },
          },
          {
            label: "Ask the teacher for help",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked the teacher for help after your grades slipped, and got it.`, 'school');
            },
          },
          {
            label: "Blame the teacher",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-3));
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Blame the teacher', { affection: (-3) });
              recordJournal(st, `You blamed the teacher for your slipping grades. ${momName} did not believe you.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_grade_rise',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'friend'],"minAge": 10, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_grade_rise',
        category: 'school',
        title: "Your Grades Jump",
        text: `The report card is the best you have ever had — top of the class in two subjects, and a note from the teacher saying you have real talent. ${momName} shows it to everyone who visits.`,
        choices: [
          {
            label: "Keep pushing \u2014 aim for the top",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `Your grades jumped to the top of the class, and you kept pushing for more.`, 'school');
            },
          },
          {
            label: "Enjoy it and relax a little",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              st.education.academicSkill = clamp(st.education.academicSkill + (+1));
              recordJournal(st, `You enjoyed the best report card you ever had, and relaxed a little. You had earned it.`, 'school');
            },
          },
          {
            label: "Help a friend catch up",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Help a friend catch up', { affection: (+4) });
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              recordJournal(st, `You helped a friend catch up after your own grades jumped. Teaching it made you understand it better.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_science_fair',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 10, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(500, S.country, S.year);
      const B = eraLocalCost(150, S.country, S.year);
      return {
        key: 'ev_school_science_fair',
        category: 'school',
        title: "The Science Fair",
        text: `The science fair is coming, and your project — a small machine, a real experiment — could actually win. It needs ${formatMoney(A, S.country)} of materials, and three weekends of work.`,
        choices: [
          {
            label: "Build it properly",
            effect: (st) => {
              walletMove(st, -A, 'Build it properly', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You built your science fair project properly, for ${formatMoney(A, S.country)}, and it won second place.`, 'school');
            },
          },
          {
            label: "Build a simpler version",
            effect: (st) => {
              walletMove(st, -B, 'Build a simpler version', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              recordJournal(st, `You built a simpler science fair project for ${formatMoney(B, S.country)}. It worked, mostly.`, 'school');
            },
          },
          {
            label: "Skip the fair this year",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You skipped the science fair this year. The weekends stayed free.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_art_competition',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_art_competition',
        category: 'school',
        title: "The Art Competition",
        text: `The school holds an art competition, and your drawing — the one you worked on for weeks — is chosen for the wall. The prize is small, but the wall is in the main hall, where everyone sees it.`,
        choices: [
          {
            label: "Enter the competition",
            effect: (st) => {
              if (st.skills) st.skills.creativity = clamp(st.skills.creativity + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You entered the art competition, and your drawing hung in the main hall.`, 'school');
            },
          },
          {
            label: "Help a friend with theirs",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Help a friend with theirs', { affection: (+3) });
              if (st.skills) st.skills.creativity = clamp(st.skills.creativity + (+2));
              recordJournal(st, `You helped a friend with their art competition entry, and yours never got finished.`, 'school');
            },
          },
          {
            label: "Decide art is not serious",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              if (st.skills) st.skills.creativity = clamp(st.skills.creativity + (-1));
              recordJournal(st, `You decided art was not serious, and skipped the competition.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_music_lesson',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_school_music_lesson',
        category: 'school',
        title: "Music Lessons",
        text: `The school offers music lessons — an instrument, a teacher, ${formatMoney(A, S.country)} a month. You have always wanted to play, and the teacher says you have a good ear.`,
        choices: [
          {
            label: "Take the lessons",
            effect: (st) => {
              walletMove(st, -A, 'Take the lessons', 'school');
              if (st.skills) st.skills.creativity = clamp(st.skills.creativity + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You took music lessons for ${formatMoney(A, S.country)} a month, and learned to play properly.`, 'school');
            },
          },
          {
            label: "Borrow an instrument and teach yourself",
            effect: (st) => {
              if (st.skills) st.skills.creativity = clamp(st.skills.creativity + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You borrowed an instrument and taught yourself to play, slowly.`, 'school');
            },
          },
          {
            label: "Skip it \u2014 too expensive",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You skipped the music lessons. ${formatMoney(A, S.country)} a month was too much.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_language_exam',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 14, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_language_exam',
        category: 'school',
        title: "The English Exam",
        text: `The English exam decides a lot: which stream, which school, which future. You have studied for months, and the paper is tomorrow. The whole house is quiet for you.`,
        choices: [
          {
            label: "Revise all night",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You revised all night for the English exam, and walked in tired but ready.`, 'school');
            },
          },
          {
            label: "Revise, then sleep well",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You revised, then slept well before the English exam. It was the right call.`, 'school');
            },
          },
          {
            label: "Trust what you know",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You trusted what you knew for the English exam, and slept like a baby.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_national_exam',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 16, "maxAge": 18, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_national_exam',
        category: 'school',
        title: "The National Exam Year",
        text: `This is the year that decides everything: the national exam, the score, the university. Your teachers say it plainly — this score follows you. The pressure is in every room of the house.`,
        choices: [
          {
            label: "Study hard every day",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+6));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You studied hard every day in the national exam year, and the score showed it.`, 'school');
            },
          },
          {
            label: "Study hard, but protect your sleep",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You studied hard in the exam year but protected your sleep. It paid off.`, 'school');
            },
          },
          {
            label: "Crack under the pressure",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              recordJournal(st, `You cracked under the pressure of the national exam year, and the score suffered.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_friend_moves',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_friend_moves',
        category: 'school',
        title: "Your Best Friend Moves Away",
        text: `Your best friend’s family is moving — another city, another school, far away. The last day is Friday, and neither of you knows what to say about it.`,
        choices: [
          {
            label: "Promise to stay in touch",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Promise to stay in touch', { affection: (+4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You promised your best friend you would stay in touch after the move, and meant it.`, 'school');
            },
          },
          {
            label: "Spend the last week together",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Spend the last week together', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You spent the last week together before your best friend moved away. It was not enough.`, 'school');
            },
          },
          {
            label: "Pull away early \u2014 it hurts less",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Pull away early — it hurts less', { affection: (-5) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-4));
              recordJournal(st, `You pulled away early from your best friend before the move. It hurt anyway.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_new_student',
    category: 'school',
    repeatable: true,
    cooldownYears: 3,
    gates: { requiredPeople: ['friend'],"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_new_student',
        category: 'school',
        title: "A New Student Arrives",
        text: `A new student arrives in your class — shy, from another country, sitting alone at lunch. The teacher asks if someone will show them around. Nobody volunteers. Yet.`,
        choices: [
          {
            label: "Show them around",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Show them around', { affection: (+5) });
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You showed the new student around the school, and gained a friend from another country.`, 'school');
            },
          },
          {
            label: "Say hello, nothing more",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `You said hello to the new student, nothing more. It was a start.`, 'school');
            },
          },
          {
            label: "Ignore them like everyone else",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You ignored the new student like everyone else. They ate lunch alone.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_teacher_inspires',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 10, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_teacher_inspires',
        category: 'school',
        title: "A Teacher Who Believes in You",
        text: `One teacher sees something in you that nobody else has named — a talent, a way of thinking — and says so, plainly, after class. "You should take this seriously," they say. "You could go far with it."`,
        choices: [
          {
            label: "Take it seriously",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `A teacher told you that you could go far, and you took it seriously from that day.`, 'school');
            },
          },
          {
            label: "Thank them and carry on",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You thanked the teacher who believed in you, and carried on — a little taller.`, 'school');
            },
          },
          {
            label: "Dismiss it \u2014 teachers say that to everyone",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-1));
              recordJournal(st, `You dismissed the teacher’s belief in you. Teachers say that to everyone, you thought.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_playground_fight',
    category: 'school',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 8, "maxAge": 15, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_playground_fight',
        category: 'school',
        title: "A Fight in the Playground",
        text: `Words turn to shoves in the playground, and before you know it you are in a fight — fists, shouting, teachers running over. Both of you are sent to the headteacher’s office.`,
        choices: [
          {
            label: "Apologise and make peace",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You apologised after the playground fight, and made peace with the other boy.`, 'school');
            },
          },
          {
            label: "Accept the punishment silently",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-1));
              recordJournal(st, `You accepted the punishment for the playground fight in silence.`, 'school');
            },
          },
          {
            label: "Blame the other boy entirely",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You blamed the other boy entirely for the playground fight. The headteacher did not believe you.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_library_discovery',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_library_discovery',
        category: 'school',
        title: "A Book That Changes Everything",
        text: `In the school library, you find a book — by chance, on a shelf you never look at — and it opens a world you did not know existed. You read it in three days, then read it again.`,
        choices: [
          {
            label: "Read everything by that author",
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+5));
              if (st.skills) st.skills.creativity = clamp(st.skills.creativity + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You found a book in the school library that changed everything, and read everything by that author.`, 'school');
            },
          },
          {
            label: "Join the library club",
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Join the library club', { affection: (+2) });
              recordJournal(st, `You joined the library club after the book that changed everything.`, 'school');
            },
          },
          {
            label: "Put it back and forget it",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You put the book back on the shelf and forgot about it. Mostly.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_exam_cheat_caught',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 12, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_exam_cheat_caught',
        category: 'school',
        title: "Caught Cheating in an Exam",
        text: `The teacher’s hand lands on your desk, and the small paper in your palm is suddenly the whole world. Caught cheating, in front of the class, with the exam still running.`,
        choices: [
          {
            label: "Admit it at once",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You admitted cheating in the exam at once, and took the punishment.`, 'school');
            },
          },
          {
            label: "Deny it",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              recordJournal(st, `You denied cheating in the exam. The paper was in your hand. Nobody believed you.`, 'school');
            },
          },
          {
            label: "Cry and promise never again",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You cried, and promised never to cheat again. The teacher believed you — this time.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_sports_injury',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_sports_injury',
        category: 'school',
        title: "Injured in a School Match",
        text: `In the school match, a tackle goes wrong and your knee twists. You are carried off, and the match goes on without you. The doctor says two weeks off sport, at least.`,
        choices: [
          {
            label: "Rest and recover properly",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You rested the knee properly after the school match injury, and came back stronger.`, 'school');
            },
          },
          {
            label: "Play again too soon",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You played again too soon after the injury, and the knee got worse.`, 'school');
            },
          },
          {
            label: "Quit the team",
            effect: (st) => {
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (-3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You quit the team after the injury. The matches went on without you.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_graduation_party',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 17, "maxAge": 18, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_graduation_party',
        category: 'school',
        title: "The School Leavers\u2019 Party",
        text: `The last day of school ends with a party — music, photographs, shirts signed by everyone, and the strange feeling that a whole chapter is closing tonight.`,
        choices: [
          {
            label: "Go and celebrate properly",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+7));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Go and celebrate properly', { affection: (+4) });
              recordJournal(st, `You went to the school leavers’ party and celebrated properly, with everyone.`, 'school');
            },
          },
          {
            label: "Go briefly, then leave early",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You went to the leavers’ party briefly, then left early. It was enough.`, 'school');
            },
          },
          {
            label: "Skip it \u2014 you hate goodbyes",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Skip it — you hate goodbyes', { affection: (-2) });
              recordJournal(st, `You skipped the leavers’ party. You hate goodbyes.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_headteacher_call',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_headteacher_call',
        category: 'school',
        title: "The Headteacher Calls Your Parents In",
        text: `A letter arrives for ${momName} and ${dadName}: the headteacher wants to see them. About you. The house goes quiet, and ${momName} reads the letter three times.`,
        choices: [
          {
            label: "Go with them and face it",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Go with them and face it', { affection: (+2) });
              recordJournal(st, `You went with ${momName} and ${dadName} to the headteacher, and faced whatever it was.`, 'school');
            },
          },
          {
            label: "Let them go alone",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Let them go alone', { affection: (-2) });
              recordJournal(st, `You let ${momName} and ${dadName} go to the headteacher alone, and waited at home, terrified.`, 'school');
            },
          },
          {
            label: "Lie about what the letter says",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Lie about what the letter says', { trust: (-5) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You lied about what the headteacher’s letter said. ${momName} found out the truth at the school gate.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_talent_show',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 8, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_talent_show',
        category: 'school',
        title: "The School Talent Show",
        text: `The talent show is announced, and your friends are signing you up — for singing, or playing, or the act you do that makes everyone laugh. The stage, the lights, the whole school watching.`,
        choices: [
          {
            label: "Perform on stage",
            effect: (st) => {
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You performed in the school talent show, on stage, in front of everyone. It went brilliantly.`, 'school');
            },
          },
          {
            label: "Perform, but nervously",
            effect: (st) => {
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You performed in the talent show, nervously, and got through it. The applause was real.`, 'school');
            },
          },
          {
            label: "Refuse to perform",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You refused to perform in the talent show. The stage stayed empty for you.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_lunch_money',
    category: 'school',
    repeatable: true,
    cooldownYears: 3,
    gates: { requiredPeople: ['mom', 'friend'],"minAge": 7, "maxAge": 15, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_lunch_money',
        category: 'school',
        title: "Lunch Money Runs Out",
        text: `Your lunch money runs out on Wednesday, and there are two days left in the week. The canteen does not give credit, and your friends are sharing — but not quite enough.`,
        choices: [
          {
            label: `Tell ${momName} honestly`,
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Tell ${momName} honestly`, { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You told ${momName} the lunch money had run out. She gave you more, and a lecture.`, 'school');
            },
          },
          {
            label: "Share with a friend",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Share with a friend', { affection: (+3) });
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              recordJournal(st, `You shared lunch with a friend for two days, and went a little hungry.`, 'school');
            },
          },
          {
            label: "Go without lunch",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You went without lunch for two days. The afternoons were very long.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_school_bus_breakdown',
    category: 'school',
    repeatable: true,
    cooldownYears: 3,
    gates: { requiredPeople: ['friend'],"minAge": 7, "maxAge": 17, "education": ["inSchool"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_school_bus_breakdown',
        category: 'school',
        title: "The School Bus Breaks Down",
        text: `The school bus breaks down halfway there, in the heat, with forty children on board. The driver shrugs, the teacher phones the school, and everyone waits on the side of the road.`,
        choices: [
          {
            label: "Wait patiently with your friends",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Wait patiently with your friends', { affection: (+2) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `You waited patiently with your friends while the school bus was fixed.`, 'school');
            },
          },
          {
            label: "Walk the rest of the way",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You walked the rest of the way to school after the bus broke down.`, 'school');
            },
          },
          {
            label: "Complain loudly",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You complained loudly about the broken bus. It changed nothing.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_first_lecture',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_first_lecture',
        category: 'school',
        title: "Your First University Lecture",
        text: `The lecture hall holds three hundred students, and the professor speaks for two hours without notes. You take pages of notes, understand half of them, and realise university is nothing like school.`,
        choices: [
          {
            label: "Study the notes that night",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              recordJournal(st, `You studied your first lecture notes that night, and the fog began to clear.`, 'school');
            },
          },
          {
            label: "Find a study group",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Find a study group', { affection: (+3) });
              recordJournal(st, `You found a study group after your first lecture, and learned together.`, 'school');
            },
          },
          {
            label: "Skip the next lecture",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You skipped the next lecture after the first one overwhelmed you.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_roommate',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['friend'],"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_roommate',
        category: 'school',
        title: "The Roommate Problem",
        text: `Your roommate plays music until 3 a.m., leaves dishes everywhere, and borrows your things without asking. You share a room the size of a cupboard, and there is nowhere to hide.`,
        choices: [
          {
            label: "Talk to them honestly",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Talk to them honestly', { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You talked honestly to your roommate about the noise and the mess. It got better.`, 'school');
            },
          },
          {
            label: "Ask to change rooms",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `You asked to change rooms at university. The new roommate was quieter. Mostly.`, 'school');
            },
          },
          {
            label: "Endure it in silence",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              st.education.academicSkill = clamp(st.education.academicSkill + (-2));
              recordJournal(st, `You endured the roommate in silence, and your sleep and your grades paid for it.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_exam_season',
    category: 'school',
    repeatable: true,
    cooldownYears: 1,
    gates: { requiredPeople: ['friend'],"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_exam_season',
        category: 'school',
        title: "Exam Season at University",
        text: `Exam season: the library is full at midnight, the coffee is terrible, and everyone is revising like their life depends on it — because, in a way, it does.`,
        choices: [
          {
            label: "Revise in the library every day",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+6));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You revised in the library every day of exam season, and the results showed it.`, 'school');
            },
          },
          {
            label: "Revise with friends",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Revise with friends', { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You revised with friends through exam season. It was harder, and better.`, 'school');
            },
          },
          {
            label: "Cram the night before",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              recordJournal(st, `You crammed the night before each exam. It worked, just barely, every time.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_professor_notice',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 19, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_professor_notice',
        category: 'school',
        title: "A Professor Notices Your Work",
        text: `Your professor stops you after class: your essay was the best in the group, and they want you to consider research, or a scholarship, or simply aiming higher than you have been.`,
        choices: [
          {
            label: "Take their advice seriously",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `A professor noticed your work and told you to aim higher. You did.`, 'school');
            },
          },
          {
            label: "Ask them to supervise your thesis",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You asked the professor to supervise your thesis. They agreed.`, 'school');
            },
          },
          {
            label: "Thank them and carry on",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You thanked the professor and carried on. The words stayed with you.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_group_project',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: {"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_group_project',
        category: 'school',
        title: "The Group Project from Hell",
        text: `Your group project has four members, and two of them have done nothing. The deadline is Friday, the presentation is yours to give, and the grade is shared — fairly or not.`,
        choices: [
          {
            label: "Do the missing work yourself",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              recordJournal(st, `You did the missing group work yourself, and the project passed.`, 'school');
            },
          },
          {
            label: "Confront the free riders",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You confronted the free riders in your group project. They did half the work, late.`, 'school');
            },
          },
          {
            label: "Tell the professor",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You told the professor about the free riders. The group never forgave you, but the grade was fair.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_scholarship_apply',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 18, "maxAge": 25, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_scholarship_apply',
        category: 'school',
        title: "A Scholarship Opens for Applications",
        text: `A named scholarship opens: full tuition for a year, for students with top grades and a real story. The application needs an essay, references, and a deadline in two weeks.`,
        choices: [
          {
            label: "Apply with everything you have",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You applied for the scholarship with everything you had — essay, references, and hope.`, 'school');
            },
          },
          {
            label: "Apply, but half-heartedly",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+1));
              recordJournal(st, `You applied for the scholarship half-heartedly, and the essay showed it.`, 'school');
            },
          },
          {
            label: "Decide you will not win anyway",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You decided you would not win the scholarship anyway, and did not apply.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_scholarship_win',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 18, "maxAge": 25, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(8000, S.country, S.year);
      return {
        key: 'ev_uni_scholarship_win',
        category: 'school',
        title: "You Win the Scholarship",
        text: `The letter arrives: you have won the scholarship. A year of tuition, paid — ${formatMoney(A, S.country)} you will never have to find. Your parents cry. You try not to.`,
        choices: [
          {
            label: "Celebrate with your family",
            effect: (st) => {
              walletMove(st, +A, 'Celebrate with your family', 'school');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+7));
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Celebrate with your family', { affection: (+5) });
              recordJournal(st, `You won the scholarship — ${formatMoney(A, S.country)} of tuition paid — and celebrated with your family.`, 'school');
            },
          },
          {
            label: "Save the money it frees up",
            effect: (st) => {
              moveBalance(st, 'savings', +A, 'Save the money it frees up', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `You saved the ${formatMoney(A, S.country)} the scholarship freed up, for the years ahead.`, 'school');
            },
          },
          {
            label: "Work less and study more",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `With the scholarship covering tuition, you worked less and studied more.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_parttime_job',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      const B = eraLocalCost(600, S.country, S.year);
      return {
        key: 'ev_uni_parttime_job',
        category: 'school',
        title: "A Part-Time Job at University",
        text: `A café near campus needs weekend staff: ${formatMoney(A, S.country)} a month, cash, flexible hours. It would pay for food and books — and take the weekends you use for studying.`,
        choices: [
          {
            label: "Take the caf\u00e9 job",
            effect: (st) => {
              walletMove(st, +A, 'Take the café job', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.education.academicSkill = clamp(st.education.academicSkill + (-2));
              recordJournal(st, `You took the part-time café job at university for ${formatMoney(A, S.country)} a month, and paid for your own food.`, 'school');
            },
          },
          {
            label: "Take it, but only Sundays",
            effect: (st) => {
              walletMove(st, +B, 'Take it, but only Sundays', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You took the café job on Sundays only, for ${formatMoney(B, S.country)} a month, and kept Saturdays for study.`, 'school');
            },
          },
          {
            label: "Turn it down \u2014 study comes first",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You turned down the part-time job. Study came first, and your parents covered the rest.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_student_loan',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(15000, S.country, S.year);
      const B = eraLocalCost(7000, S.country, S.year);
      return {
        key: 'ev_uni_student_loan',
        category: 'school',
        title: "The Student Loan Decision",
        text: `Tuition is due, and the student loan would cover it: ${formatMoney(A, S.country)} a year, repayable after you graduate, with interest. It is the only way in — or the start of years of debt.`,
        choices: [
          {
            label: "Take the loan",
            effect: (st) => {
              walletMove(st, +A, 'Take the loan', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.money.creditScore = clamp(st.money.creditScore + (-2), 300, 900);
              recordJournal(st, `You took the student loan of ${formatMoney(A, S.country)} a year to pay for tuition.`, 'school');
            },
          },
          {
            label: "Take a smaller loan and work",
            effect: (st) => {
              walletMove(st, +B, 'Take a smaller loan and work', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You took a smaller student loan, ${formatMoney(B, S.country)}, and worked to cover the rest.`, 'school');
            },
          },
          {
            label: "Refuse the loan and find another way",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You refused the student loan and found another way to pay — family, work, and worry.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_thesis',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 21, "maxAge": 27, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_thesis',
        category: 'school',
        title: "The Thesis Deadline",
        text: `The thesis is due in a month, and you have written half of it. The library closes at midnight, your supervisor wants a draft by Friday, and the words will not come.`,
        choices: [
          {
            label: "Write every day, no excuses",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+6));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You wrote your thesis every day for a month, and submitted it on time.`, 'school');
            },
          },
          {
            label: "Ask for an extension",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You asked for a thesis extension, and got two more weeks. It saved the work.`, 'school');
            },
          },
          {
            label: "Rush it in the last week",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              recordJournal(st, `You rushed the thesis in the last week. It was submitted, barely.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_exchange',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 19, "maxAge": 25, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(12000, S.country, S.year);
      const B = eraLocalCost(5000, S.country, S.year);
      return {
        key: 'ev_uni_exchange',
        category: 'school',
        title: "A Semester Abroad",
        text: `The university offers a semester abroad — a partner university, a new country, a term that counts toward your degree. It costs ${formatMoney(A, S.country)}, and it would change how you see the world.`,
        choices: [
          {
            label: "Go abroad for the semester",
            effect: (st) => {
              walletMove(st, -A, 'Go abroad for the semester', 'school');
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You spent a semester abroad for ${formatMoney(A, S.country)}, and came back a different person.`, 'school');
            },
          },
          {
            label: "Apply for funding first",
            effect: (st) => {
              walletMove(st, -B, 'Apply for funding first', 'school');
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              recordJournal(st, `You applied for funding for the semester abroad, and went for ${formatMoney(B, S.country)} instead.`, 'school');
            },
          },
          {
            label: "Stay home \u2014 too expensive",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You stayed home instead of the semester abroad. ${formatMoney(A, S.country)} was too much.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_club_society',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_club_society',
        category: 'school',
        title: "Joining a University Society",
        text: `The societies fair is chaos: hundreds of stalls, free pens, and everyone trying to recruit you. The debating society, the football club, the photography group — all of them want you.`,
        choices: [
          {
            label: "Join the debating society",
            effect: (st) => {
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Join the debating society', { affection: (+3) });
              recordJournal(st, `You joined the debating society, and learned to argue properly.`, 'school');
            },
          },
          {
            label: "Join the football club",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+3));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+4));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Join the football club', { affection: (+3) });
              recordJournal(st, `You joined the university football club, and played every weekend.`, 'school');
            },
          },
          {
            label: "Join nothing \u2014 focus on the degree",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              recordJournal(st, `You joined no society, and focused on the degree. It was quieter.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_failed_exam',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      return {
        key: 'ev_uni_failed_exam',
        category: 'school',
        title: "You Fail an Exam",
        text: `The results are posted, and your name is on the wrong list: you failed. The module must be retaken, the fee is ${formatMoney(A, S.country)}, and the shame is worse than the money.`,
        choices: [
          {
            label: "Retake it and pass",
            effect: (st) => {
              walletMove(st, -A, 'Retake it and pass', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You failed an exam, paid ${formatMoney(A, S.country)} to retake it, and passed the second time.`, 'school');
            },
          },
          {
            label: "Study twice as hard",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You studied twice as hard after failing the exam, and never failed again.`, 'school');
            },
          },
          {
            label: "Consider dropping out",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-5));
              recordJournal(st, `You considered dropping out after failing the exam. The thought stayed for weeks.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_plagiarism_accusation',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_plagiarism_accusation',
        category: 'school',
        title: "Accused of Plagiarism",
        text: `Your essay is flagged: too similar to a source, the software says. You know you wrote it yourself — badly cited, maybe, but yours. The hearing is next week, and your degree is on the line.`,
        choices: [
          {
            label: "Defend yourself with your drafts",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You defended yourself against the plagiarism accusation with your drafts, and were cleared.`, 'school');
            },
          },
          {
            label: "Accept the penalty quietly",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You accepted the plagiarism penalty quietly, though you believed it was unfair.`, 'school');
            },
          },
          {
            label: "Ask the professor to speak for you",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You asked your professor to speak for you at the hearing. They did.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_internship',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 19, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(4000, S.country, S.year);
      const B = eraLocalCost(2500, S.country, S.year);
      return {
        key: 'ev_uni_internship',
        category: 'school',
        title: "An Internship Offer",
        text: `A company offers you an internship — three months, real work, ${formatMoney(A, S.country)} a month, and a foot in the door of the career you want. It clashes with your summer plans.`,
        choices: [
          {
            label: "Take the internship",
            effect: (st) => {
              walletMove(st, +A, 'Take the internship', 'school');
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              recordJournal(st, `You took the internship for ${formatMoney(A, S.country)} a month, and it became the first line on your CV.`, 'school');
            },
          },
          {
            label: "Take it, but negotiate the hours",
            effect: (st) => {
              walletMove(st, +B, 'Take it, but negotiate the hours', 'school');
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              recordJournal(st, `You negotiated the internship hours down and took it for ${formatMoney(B, S.country)} a month.`, 'school');
            },
          },
          {
            label: "Turn it down for the summer",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You turned down the internship for the summer. The rest was worth it, you decided.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_dorm_party',
    category: 'school',
    repeatable: true,
    cooldownYears: 2,
    gates: { requiredPeople: ['friend'],"minAge": 18, "maxAge": 25, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_dorm_party',
        category: 'school',
        title: "A Party in the Dorms",
        text: `The dorm party is legendary: music, everyone you know, and the kind of night people talk about for years. Your exam is on Monday. The party is tonight.`,
        choices: [
          {
            label: "Go and enjoy it",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Go and enjoy it', { affection: (+4) });
              st.education.academicSkill = clamp(st.education.academicSkill + (-2));
              recordJournal(st, `You went to the dorm party and enjoyed it properly, exam or no exam.`, 'school');
            },
          },
          {
            label: "Go for an hour, then study",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              st.education.academicSkill = clamp(st.education.academicSkill + (+1));
              recordJournal(st, `You went to the dorm party for an hour, then went back to study. The best of both.`, 'school');
            },
          },
          {
            label: "Stay in and study",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You stayed in and studied while the dorm party raged down the hall.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_love',
    category: 'school',
    repeatable: true,
    cooldownYears: 3,
    gates: {"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_love',
        category: 'school',
        title: "Love at University",
        text: `Someone in your seminar — the one who always has the interesting question — asks you for coffee. Your heart does something unfamiliar, and the whole campus suddenly looks different.`,
        choices: [
          {
            label: "Say yes to coffee",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+7));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You said yes to coffee with the person from your seminar. It became something real.`, 'school');
            },
          },
          {
            label: "Say yes, but keep it casual",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You said yes to coffee, but kept it casual. For now.`, 'school');
            },
          },
          {
            label: "Say no \u2014 the degree comes first",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You said no to coffee. The degree came first.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_money_tight',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      const B = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_uni_money_tight',
        category: 'school',
        title: "Money Runs Out Before the Month Ends",
        text: `It is the 20th, and your money is gone — food, books, and the bus have eaten it all. There are ten days left in the month, and your account is empty.`,
        choices: [
          {
            label: `Ask ${momName} and ${dadName} for help`,
            effect: (st) => {
              walletMove(st, +A, `Ask ${momName} and ${dadName} for help`, 'school');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', `Ask ${momName} and ${dadName} for help`, { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You asked ${momName} and ${dadName} for help when the money ran out, and they sent ${formatMoney(A, S.country)}.`, 'school');
            },
          },
          {
            label: "Live on bread and tea",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You lived on bread and tea for ten days when the money ran out.`, 'school');
            },
          },
          {
            label: "Find emergency work",
            effect: (st) => {
              walletMove(st, +B, 'Find emergency work', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.education.academicSkill = clamp(st.education.academicSkill + (-1));
              recordJournal(st, `You found emergency work for ${formatMoney(B, S.country)} when the money ran out at university.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_professor_argument',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 19, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_professor_argument',
        category: 'school',
        title: "An Argument with a Professor",
        text: `You challenge the professor in the seminar — the theory is wrong, you say, and you have the evidence. The room goes silent. The professor looks at you for a long moment.`,
        choices: [
          {
            label: "Stand your ground, politely",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              recordJournal(st, `You stood your ground with the professor, politely, and earned their respect.`, 'school');
            },
          },
          {
            label: "Back down at once",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You backed down at once in the argument with the professor. The moment passed.`, 'school');
            },
          },
          {
            label: "Write a proper paper about it",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              recordJournal(st, `You wrote a proper paper about the argument with the professor. It was published in the student journal.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_graduation',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 21, "maxAge": 28, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(8000, S.country, S.year);
      return {
        key: 'ev_uni_graduation',
        category: 'school',
        title: "Graduation Day",
        text: `The gown, the cap, the hall full of families, your name called out — graduation day. ${momName} is crying, ${dadName} is filming everything, and four years of work end in a single walk across a stage.`,
        choices: [
          {
            label: "Celebrate with your family",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+8));
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Celebrate with your family', { affection: (+5) });
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', 'Celebrate with your family', { affection: (+5) });
              recordJournal(st, `You graduated, and celebrated with your family — ${momName} crying, ${dadName} filming everything.`, 'school');
            },
          },
          {
            label: "Start job hunting the next day",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You started job hunting the day after graduation. The real world was waiting.`, 'school');
            },
          },
          {
            label: "Take a month to travel first",
            effect: (st) => {
              walletMove(st, -A, 'Take a month to travel first', 'school');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You took a month to travel after graduation, for ${formatMoney(A, S.country)}, before the real world began.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_cheating_ring',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      return {
        key: 'ev_uni_cheating_ring',
        category: 'school',
        title: "An Exam Answers Group",
        text: `A group chat is selling exam answers for ${formatMoney(A, S.country)} — the real ones, they claim, from someone inside. Everyone is talking about it, and a few have already paid.`,
        choices: [
          {
            label: "Report the group",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You reported the exam answers group. The university investigated.`, 'school');
            },
          },
          {
            label: "Ignore it completely",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You ignored the exam answers group completely, and studied instead.`, 'school');
            },
          },
          {
            label: "Pay for the answers",
            effect: (st) => {
              walletMove(st, -A, 'Pay for the answers', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-4));
              recordJournal(st, `You paid ${formatMoney(A, S.country)} for the exam answers. They were wrong — and you knew it the moment you saw them.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_mental_health',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_mental_health',
        category: 'school',
        title: "University Counselling",
        text: `The pressure has built for months — deadlines, money, being far from home — and the university offers free counselling. The first session is just talking, but the waiting list is long.`,
        choices: [
          {
            label: "Book the counselling",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You booked university counselling, and the talking helped more than you expected.`, 'school');
            },
          },
          {
            label: "Talk to a friend instead",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Talk to a friend instead', { affection: (+4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You talked to a friend instead of the counsellor, and it helped.`, 'school');
            },
          },
          {
            label: "Push through alone",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You pushed through alone at university. It took months longer than it needed to.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_housing_deposit',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 18, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(4000, S.country, S.year);
      const B = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_uni_housing_deposit',
        category: 'school',
        title: "The Student Flat Deposit",
        text: `The student flat you want needs a deposit of ${formatMoney(A, S.country)}, paid today, or it goes to someone else. Your parents can help, or you can find it yourself — but the clock is ticking.`,
        choices: [
          {
            label: "Pay the deposit yourself",
            effect: (st) => {
              walletMove(st, -A, 'Pay the deposit yourself', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You paid the ${formatMoney(A, S.country)} student flat deposit yourself, from your savings.`, 'school');
            },
          },
          {
            label: "Ask your parents to cover it",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Ask your parents to cover it', { affection: (+2) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You asked your parents to cover the ${formatMoney(A, S.country)} flat deposit. They did, without a word.`, 'school');
            },
          },
          {
            label: "Take a cheaper flat instead",
            effect: (st) => {
              walletMove(st, -B, 'Take a cheaper flat instead', 'school');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You took a cheaper student flat for ${formatMoney(B, S.country)} deposit instead. It was smaller, and further away.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_research_assistant',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 20, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2500, S.country, S.year);
      const B = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_uni_research_assistant',
        category: 'school',
        title: "Research Assistant Work",
        text: `A professor offers you research assistant work: ${formatMoney(A, S.country)} a month, real research, and your name on a paper if it goes well. It is ten hours a week, on top of your studies.`,
        choices: [
          {
            label: "Take the research work",
            effect: (st) => {
              walletMove(st, +A, 'Take the research work', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You took the research assistant work for ${formatMoney(A, S.country)} a month, and your name went on a paper.`, 'school');
            },
          },
          {
            label: "Take it, but only five hours",
            effect: (st) => {
              walletMove(st, +B, 'Take it, but only five hours', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              recordJournal(st, `You took the research work for five hours a week, ${formatMoney(B, S.country)} a month, and kept your studies first.`, 'school');
            },
          },
          {
            label: "Turn it down \u2014 too much",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You turned down the research assistant work. It was too much, on top of everything.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_language_abroad',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 19, "maxAge": 25, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(9000, S.country, S.year);
      const B = eraLocalCost(4500, S.country, S.year);
      return {
        key: 'ev_uni_language_abroad',
        category: 'school',
        title: "A Language Summer Abroad",
        text: `A summer language course abroad: six weeks, a host family, and a language you will actually speak. It costs ${formatMoney(A, S.country)}, and it would change your CV — and your life.`,
        choices: [
          {
            label: "Go for the summer",
            effect: (st) => {
              walletMove(st, -A, 'Go for the summer', 'school');
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You spent the summer abroad learning the language, for ${formatMoney(A, S.country)}, and came back fluent enough to dream in it.`, 'school');
            },
          },
          {
            label: "Go for three weeks only",
            effect: (st) => {
              walletMove(st, -B, 'Go for three weeks only', 'school');
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+3));
              recordJournal(st, `You went abroad for three weeks of the language course, ${formatMoney(B, S.country)}, and learned enough to get by.`, 'school');
            },
          },
          {
            label: "Study the language at home",
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You studied the language at home instead, for free, and learned it slowly.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_final_year_panic',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 21, "maxAge": 27, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_final_year_panic',
        category: 'school',
        title: "Final Year Panic",
        text: `Final year, and suddenly everything counts: the dissertation, the exams, the job market, the future. Everyone around you seems to have a plan. You do not — not yet.`,
        choices: [
          {
            label: "Make a plan and follow it",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You made a plan for your final year and followed it, day by day. It worked.`, 'school');
            },
          },
          {
            label: "Ask your professor for guidance",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked your professor for guidance in your final year, and got a plan.`, 'school');
            },
          },
          {
            label: "Panic quietly and work harder",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You panicked quietly in your final year, and worked harder than ever.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_alumni_network',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 22, "maxAge": 28, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_alumni_network',
        category: 'school',
        title: "An Alumni Event",
        text: `The university holds an alumni event: graduates who now run companies, hospitals, and ministries, all in one room, all willing to talk to a student who asks good questions.`,
        choices: [
          {
            label: "Go and ask good questions",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + (+2));
              recordJournal(st, `You went to the alumni event and asked good questions. Two graduates remembered your name.`, 'school');
            },
          },
          {
            label: "Go and collect business cards",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You went to the alumni event and collected business cards from everyone.`, 'school');
            },
          },
          {
            label: "Skip it \u2014 networking is not you",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You skipped the alumni event. Networking was not you, you decided.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_dorm_flood',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 18, "maxAge": 25, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      return {
        key: 'ev_uni_dorm_flood',
        category: 'school',
        title: "The Dorm Floods",
        text: `A pipe bursts above your dorm room at 2 a.m., and your books, your laptop, and your clothes are soaked. The university offers a temporary room — and a form to claim ${formatMoney(A, S.country)} for the damage.`,
        choices: [
          {
            label: "Claim the compensation",
            effect: (st) => {
              walletMove(st, +A, 'Claim the compensation', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You claimed ${formatMoney(A, S.country)} in compensation for the flooded dorm room, and replaced what was ruined.`, 'school');
            },
          },
          {
            label: "Move to the temporary room",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You moved to the temporary room after the flood, and lived out of a bag for a month.`, 'school');
            },
          },
          {
            label: "Borrow what you need",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Borrow what you need', { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You borrowed what you needed after the dorm flood, from friends who had spares.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_sports_team',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 18, "maxAge": 25, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_uni_sports_team',
        category: 'school',
        title: "Making the University Team",
        text: `Trials for the university team: a hundred students, twenty places, and you. The coach watches everything — the speed, the passing, the way you handle losing a drill.`,
        choices: [
          {
            label: "Make the team",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Make the team', { affection: (+3) });
              recordJournal(st, `You made the university team, and played every match of the season.`, 'school');
            },
          },
          {
            label: "Make the reserves",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (+2));
              recordJournal(st, `You made the university reserves, and played when someone was injured.`, 'school');
            },
          },
          {
            label: "Miss out \u2014 try again next year",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You missed out on the university team, and promised yourself you would try again next year.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_uni_tutoring_side',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 19, "maxAge": 26, "education": ["inUni"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      const B = eraLocalCost(1000, S.country, S.year);
      return {
        key: 'ev_uni_tutoring_side',
        category: 'school',
        title: "Tutoring School Students",
        text: `A family offers you ${formatMoney(A, S.country)} a month to tutor their child in the evenings — your best subject, two hours a week, and money that would cover your food.`,
        choices: [
          {
            label: "Take the tutoring work",
            effect: (st) => {
              walletMove(st, +A, 'Take the tutoring work', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You tutored a school student for ${formatMoney(A, S.country)} a month, and found you were good at teaching.`, 'school');
            },
          },
          {
            label: "Take one student only",
            effect: (st) => {
              walletMove(st, +B, 'Take one student only', 'school');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You tutored one student for ${formatMoney(B, S.country)} a month, and kept your evenings mostly free.`, 'school');
            },
          },
          {
            label: "Turn it down \u2014 study first",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              recordJournal(st, `You turned down the tutoring work. Study came first.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_iqama_renewal',
    category: 'life',
    repeatable: false,
    gates: {"minAge": 22, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_gulf_iqama_renewal',
        category: 'life',
        title: "Iqama Renewal Time",
        text: `Your Iqama expires next month, and the renewal needs your sponsor’s signature, a medical check, and a fee of ${formatMoney(A, S.country)}. Without it, you cannot work, bank, or legally stay.`,
        choices: [
          {
            label: "Renew it at once",
            effect: (st) => {
              walletMove(st, -A, 'Renew it at once', 'life');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You renewed your Iqama at once for ${formatMoney(A, S.country)}, with the medical check and your sponsor’s signature.`, 'life');
            },
          },
          {
            label: "Ask your sponsor to pay the fee",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You asked your sponsor to pay the ${formatMoney(A, S.country)} Iqama renewal fee. It took two weeks of asking.`, 'life');
            },
          },
          {
            label: "Delay it a week",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You delayed the Iqama renewal by a week. The deadline did not move.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_sponsor_trouble',
    category: 'life',
    repeatable: false,
    gates: {"minAge": 22, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_gulf_sponsor_trouble',
        category: 'life',
        title: "Trouble with the Sponsor",
        text: `Your sponsor — your kafeel — has stopped answering your calls, and your paperwork needs his signature this week. Without it, nothing moves: no renewal, no exit, no transfer.`,
        choices: [
          {
            label: "Go to his office and wait",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You went to your sponsor’s office and waited all day for the signature. You got it.`, 'life');
            },
          },
          {
            label: "Ask a colleague to intervene",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You asked a colleague to intervene with your sponsor. The signature came the next day.`, 'life');
            },
          },
          {
            label: "Complain to the labour office",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You complained to the labour office about your sponsor. The process was slow, but it moved.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_pay_gap',
    category: 'life',
    repeatable: false,
    gates: {"minAge": 24, "hasJob": true, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_gulf_pay_gap',
        category: 'life',
        title: "The Nationality Pay Gap",
        text: `At lunch, a colleague from another country mentions their salary — for the same job, the same hours — and it is nearly double yours. The difference is the passport, and everyone knows it.`,
        choices: [
          {
            label: "Ask HR about the gap",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You asked HR about the nationality pay gap, calmly, with the numbers. HR had no good answer.`, 'life');
            },
          },
          {
            label: "Use it to negotiate",
            effect: (st) => {
              if (st.career.job) st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * (1 + (+6) / 100));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You used the pay gap to negotiate a raise, and got part of the difference.`, 'life');
            },
          },
          {
            label: "Accept it and focus on saving",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You accepted the pay gap and focused on saving what you earned, passport or not.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_homesick',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad', 'friend'],"minAge": 20, "abroad": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3500, S.country, S.year);
      return {
        key: 'ev_gulf_homesick',
        category: 'life',
        title: "Homesickness in the Gulf",
        text: `It is Eid, and you are far from home — the family table, the noise, ${momName}’s cooking, all of it a phone call away and a world away. The flat is quiet, and the homesickness is physical.`,
        choices: [
          {
            label: "Call home and talk for an hour",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Call home and talk for an hour', { affection: (+4) });
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', 'Call home and talk for an hour', { affection: (+3) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `Homesick in the Gulf, you called home and talked for an hour. It helped, and it hurt.`, 'life');
            },
          },
          {
            label: "Book a flight home",
            effect: (st) => {
              walletMove(st, -A, 'Book a flight home', 'life');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You booked a flight home for ${formatMoney(A, S.country)}, homesick and done waiting.`, 'life');
            },
          },
          {
            label: "Spend Eid with friends here",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Spend Eid with friends here', { affection: (+4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You spent Eid with friends in the Gulf, and made a new kind of family table.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_remittance_pressure',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'dad'],"minAge": 22, "abroad": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      const B = eraLocalCost(1000, S.country, S.year);
      return {
        key: 'ev_gulf_remittance_pressure',
        category: 'money',
        title: "The Family Needs More Money Home",
        text: `The family back home calls: prices have risen, the house needs repairs, and the monthly money you send — ${formatMoney(A, S.country)} — is not enough anymore. They need more, and they are too proud to say how much.`,
        choices: [
          {
            label: "Send more money home",
            effect: (st) => {
              walletMove(st, -B, 'Send more money home', 'money');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Send more money home', { affection: (+5) });
              if (ctx.dad) rememberDeed(st, ctx.dad, 'event', 'Send more money home', { affection: (+4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You sent ${formatMoney(B, S.country)} more home to the family, on top of the usual ${formatMoney(A, S.country)}.`, 'money');
            },
          },
          {
            label: "Send the same and explain why",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Send the same and explain why', { affection: (+1) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You sent the same money home and explained, honestly, why you could not send more.`, 'money');
            },
          },
          {
            label: "Cut your own spending to send more",
            effect: (st) => {
              walletMove(st, -B, 'Cut your own spending to send more', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Cut your own spending to send more', { affection: (+6) });
              recordJournal(st, `You cut your own spending to send more money home, and lived on less for a month.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_end_service',
    category: 'life',
    repeatable: false,
    gates: {"minAge": 30, "hasJob": true, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(25000, S.country, S.year);
      const B = eraLocalCost(18000, S.country, S.year);
      return {
        key: 'ev_gulf_end_service',
        category: 'life',
        title: "End of Service \u2014 The Gratuity",
        text: `Your contract ends, and the end-of-service gratuity is due: ${formatMoney(A, S.country)}, calculated on your years here. It is the money that makes the whole Gulf years worth it — if it is paid in full, and on time.`,
        choices: [
          {
            label: "Collect it in full",
            effect: (st) => {
              walletMove(st, +A, 'Collect it in full', 'life');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You collected your end-of-service gratuity of ${formatMoney(A, S.country)} in full, on time.`, 'life');
            },
          },
          {
            label: "Fight for the full amount",
            effect: (st) => {
              walletMove(st, +B, 'Fight for the full amount', 'life');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              recordJournal(st, `You fought for the full gratuity and got ${formatMoney(B, S.country)} — most of it, after a long argument.`, 'life');
            },
          },
          {
            label: "Accept what they offer",
            effect: (st) => {
              walletMove(st, +B, 'Accept what they offer', 'life');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You accepted what the company offered for end of service, ${formatMoney(B, S.country)}, and moved on.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_ramadan_hours',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_gulf_ramadan_hours',
        category: 'life',
        title: "Ramadan Working Hours",
        text: `Ramadan arrives, and the working hours shorten — six hours instead of eight, and the office empties early. But the workload does not shorten, and the deadline does not move.`,
        choices: [
          {
            label: "Work the shorter hours and cope",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You worked the shorter Ramadan hours and coped with the same workload.`, 'life');
            },
          },
          {
            label: "Work late anyway to finish",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You worked late through Ramadan anyway, to finish the work.`, 'life');
            },
          },
          {
            label: "Ask for the work to be spread out",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You asked for the work to be spread out during Ramadan. ${bossName} agreed.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_heat',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 20, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_gulf_heat',
        category: 'health',
        title: "The August Heat",
        text: `August in the Gulf: 48 degrees, humidity that feels like a wall, and a walk to the car that leaves you soaked. The heat is not weather here — it is a condition of life.`,
        choices: [
          {
            label: "Stay indoors and hydrate",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You stayed indoors through the August heat and drank water all day. It was the only way.`, 'health');
            },
          },
          {
            label: "Work outside anyway",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You worked outside in the August heat, and paid for it with dizziness and a headache.`, 'health');
            },
          },
          {
            label: "Escape to the mall every evening",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              walletMove(st, -A, 'Escape to the mall every evening', 'health');
              recordJournal(st, `You escaped to the mall every evening of the heat, spending ${formatMoney(A, S.country)} on food and air conditioning.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_compound_life',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 24, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_gulf_compound_life',
        category: 'life',
        title: "Life in the Compound",
        text: `The compound is a small world: a pool, a shop, neighbours from everywhere, and a kind of peace you never had back home. But it is also a bubble, and the real city is outside the gate.`,
        choices: [
          {
            label: "Embrace compound life",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Embrace compound life', { affection: (+4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You embraced compound life — the pool, the neighbours, the peace of it.`, 'life');
            },
          },
          {
            label: "Explore the real city",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `You explored the real city outside the compound gate, and found a different Gulf.`, 'life');
            },
          },
          {
            label: "Feel trapped by the walls",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You felt trapped by the compound walls, and started counting the days to your next trip home.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_driver_maid',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 28, "hasJob": true, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(5000, S.country, S.year);
      const B = eraLocalCost(2500, S.country, S.year);
      return {
        key: 'ev_gulf_driver_maid',
        category: 'money',
        title: "Hiring a Driver and a Maid",
        text: `Everyone here has a driver and a maid, and the agencies are full of them. A driver costs ${formatMoney(A, S.country)} a month, a maid ${formatMoney(B, S.country)} — and your life would change completely. Your salary says maybe; your pride says no.`,
        choices: [
          {
            label: "Hire both",
            effect: (st) => {
              walletMove(st, -A, 'Hire both', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You hired a driver and a maid in the Gulf, ${formatMoney(A, S.country)} a month together, and your life changed.`, 'money');
            },
          },
          {
            label: "Hire the maid only",
            effect: (st) => {
              walletMove(st, -B, 'Hire the maid only', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You hired a maid only, for ${formatMoney(B, S.country)} a month, and kept driving yourself.`, 'money');
            },
          },
          {
            label: "Do everything yourself",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              st.player.vitals.health = clamp(st.player.vitals.health + (+1));
              recordJournal(st, `You did everything yourself in the Gulf — no driver, no maid — and kept the money.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_visa_renewal_abroad',
    category: 'life',
    repeatable: false,
    gates: {"minAge": 24, "abroad": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      const B = eraLocalCost(2500, S.country, S.year);
      return {
        key: 'ev_gulf_visa_renewal_abroad',
        category: 'life',
        title: "The Visa Renewal Queue",
        text: `Your visa renewal means a morning at the government office: a queue that does not move, forms in triplicate, and a fee of ${formatMoney(A, S.country)}. Everyone in the queue has the same tired look.`,
        choices: [
          {
            label: "Pay the fee and renew",
            effect: (st) => {
              walletMove(st, -A, 'Pay the fee and renew', 'life');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You paid the ${formatMoney(A, S.country)} visa renewal fee and queued all morning to renew it.`, 'life');
            },
          },
          {
            label: "Pay an agent to do it",
            effect: (st) => {
              walletMove(st, -B, 'Pay an agent to do it', 'life');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              recordJournal(st, `You paid an agent ${formatMoney(B, S.country)} to handle the visa renewal. It was done in a day.`, 'life');
            },
          },
          {
            label: "Let it lapse a week",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+7));
              st.money.creditScore = clamp(st.money.creditScore + (-5), 300, 900);
              recordJournal(st, `You let the visa lapse a week. The fine and the fear were worse than the queue.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_school_abroad_kids',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 30, "hasChildren": true, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(40000, S.country, S.year);
      const B = eraLocalCost(20000, S.country, S.year);
      return {
        key: 'ev_gulf_school_abroad_kids',
        category: 'money',
        title: "International School Fees Abroad",
        text: `The children’s international school abroad costs ${formatMoney(A, S.country)} a year — more than your first salary back home, for one child, for one year. The company pays half, if you ask properly.`,
        choices: [
          {
            label: "Pay the fees in full",
            effect: (st) => {
              walletMove(st, -A, 'Pay the fees in full', 'money');
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Pay the fees in full', { affection: (+4) });
              recordJournal(st, `You paid the children’s international school fees abroad, ${formatMoney(A, S.country)} a year, in full.`, 'money');
            },
          },
          {
            label: "Ask the company to cover more",
            effect: (st) => {
              walletMove(st, -B, 'Ask the company to cover more', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked the company to cover more of the school fees, and they agreed to ${formatMoney(B, S.country)}.`, 'money');
            },
          },
          {
            label: "Move the children to a cheaper school",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Move the children to a cheaper school', { affection: (-4) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You moved the children to a cheaper school abroad. They hated the first month.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_golden_visa',
    category: 'life',
    repeatable: false,
    gates: {"minAge": 30, "hasJob": true, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(8000, S.country, S.year);
      return {
        key: 'ev_gulf_golden_visa',
        category: 'life',
        title: "The Golden Visa Offer",
        text: `The government offers a golden visa: ten years, no sponsor, for people with your salary and your record. The application costs ${formatMoney(A, S.country)}, and the freedom it buys is hard to put a price on.`,
        choices: [
          {
            label: "Apply for the golden visa",
            effect: (st) => {
              walletMove(st, -A, 'Apply for the golden visa', 'life');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You applied for the golden visa for ${formatMoney(A, S.country)}, and the freedom from sponsorship was worth every coin.`, 'life');
            },
          },
          {
            label: "Wait \u2014 your sponsor is fine",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You waited on the golden visa. Your sponsor was fine, and ${formatMoney(A, S.country)} was a lot.`, 'life');
            },
          },
          {
            label: "Apply, but only if the company pays",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You asked the company to pay for the golden visa. They said they would think about it.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_job_loss_grace',
    category: 'life',
    repeatable: false,
    gates: {"minAge": 26, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_gulf_job_loss_grace',
        category: 'life',
        title: "Losing the Job Abroad",
        text: `The company lets you go, and the clock starts: a short grace period to find a new sponsor, or leave the country. Your whole life here — the flat, the car, the children’s school — hangs on weeks.`,
        choices: [
          {
            label: "Find a new sponsor fast",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You found a new sponsor within weeks of losing the job, and stayed.`, 'life');
            },
          },
          {
            label: "Go home and start again",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You went home after losing the Gulf job, and started again from nothing.`, 'life');
            },
          },
          {
            label: "Stay and look for work illegally",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+9));
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              recordJournal(st, `You stayed after losing the job and looked for work without a sponsor. Every knock on the door frightened you.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_currency_remit',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 24, "abroad": true, "wealth": ["poor", "middle"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(3000, S.country, S.year);
      return {
        key: 'ev_gulf_currency_remit',
        category: 'money',
        title: "The Exchange Rate Moves",
        text: `The exchange rate moves in your favour this month: the money you send home is suddenly worth ${formatMoney(A, S.country)} more. Your family back home feels rich — and you feel like the years abroad are finally paying.`,
        choices: [
          {
            label: "Send extra home now",
            effect: (st) => {
              walletMove(st, -A, 'Send extra home now', 'money');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Send extra home now', { affection: (+4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You sent extra money home while the exchange rate was good, ${formatMoney(A, S.country)} more than usual.`, 'money');
            },
          },
          {
            label: "Save the difference",
            effect: (st) => {
              moveBalance(st, 'savings', +A, 'Save the difference', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You saved the ${formatMoney(A, S.country)} difference from the good exchange rate, for yourself.`, 'money');
            },
          },
          {
            label: "Send the usual amount",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Send the usual amount', { affection: (+1) });
              recordJournal(st, `You sent the usual amount home, despite the good rate. The family understood.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_friend_deported',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 26, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      return {
        key: 'ev_gulf_friend_deported',
        category: 'life',
        title: "A Friend Is Deported",
        text: `A friend you have known for years is deported — a paperwork mistake, a sponsor who vanished, a flight home with one bag. The whole expat community goes quiet, because it could have been any of you.`,
        choices: [
          {
            label: "Help them pack and say goodbye",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Help them pack and say goodbye', { affection: (+5) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You helped your deported friend pack, and said goodbye at the airport.`, 'life');
            },
          },
          {
            label: "Send money to help them start again",
            effect: (st) => {
              walletMove(st, -A, 'Send money to help them start again', 'life');
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Send money to help them start again', { affection: (+6) });
              recordJournal(st, `You sent ${formatMoney(A, S.country)} to your deported friend, to help them start again back home.`, 'life');
            },
          },
          {
            label: "Check your own papers that night",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              if (st.skills) st.skills.financialIq = clamp(st.skills.financialIq + (+2));
              recordJournal(st, `You checked your own papers the night your friend was deported, twice, and then once more.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_newcomer_help',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 28, "abroad": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2500, S.country, S.year);
      return {
        key: 'ev_gulf_newcomer_help',
        category: 'life',
        title: "A Newcomer Arrives from Home",
        text: `A young man from your hometown arrives in the Gulf with one bag, no job, and your phone number. Someone helped you when you arrived. Now it is your turn — or is it?`,
        choices: [
          {
            label: "Help him find work",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Help him find work', { affection: (+5) });
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You helped the newcomer from home find work in the Gulf, the way someone once helped you.`, 'life');
            },
          },
          {
            label: "Lend him money for a month",
            effect: (st) => {
              walletMove(st, -A, 'Lend him money for a month', 'life');
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Lend him money for a month', { affection: (+4) });
              recordJournal(st, `You lent the newcomer ${formatMoney(A, S.country)} for his first month in the Gulf.`, 'life');
            },
          },
          {
            label: "Wish him luck and move on",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-2));
              recordJournal(st, `You wished the newcomer luck and moved on. Your own life was full enough.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_umrah_trip',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 25, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(4000, S.country, S.year);
      const B = eraLocalCost(9000, S.country, S.year);
      return {
        key: 'ev_gulf_umrah_trip',
        category: 'life',
        title: "Umrah from the Gulf",
        text: `From the Gulf, Umrah is a short drive — a weekend, a hotel, and the Haram. The trip costs ${formatMoney(A, S.country)}, and the spiritual pull of it has been growing for months.`,
        choices: [
          {
            label: "Go for Umrah",
            effect: (st) => {
              walletMove(st, -A, 'Go for Umrah', 'life');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+8));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-6));
              recordJournal(st, `You went for Umrah from the Gulf, ${formatMoney(A, S.country)}, and came back changed.`, 'life');
            },
          },
          {
            label: "Go with your family",
            effect: (st) => {
              walletMove(st, -B, 'Go with your family', 'life');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+7));
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Go with your family', { affection: (+4) });
              recordJournal(st, `You went for Umrah with your family, ${formatMoney(B, S.country)}, and shared the whole journey.`, 'life');
            },
          },
          {
            label: "Put it off until next year",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You put Umrah off until next year. The pull stayed.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_car_abroad',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 26, "hasJob": true, "abroad": true, "countries": ["sau", "uae"]},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(30000, S.country, S.year);
      const B = eraLocalCost(8000, S.country, S.year);
      return {
        key: 'ev_gulf_car_abroad',
        category: 'money',
        title: "Buying a Car Abroad",
        text: `In the Gulf, a car is not a luxury — it is a necessity, and the prices are half what they are back home. A good used car costs ${formatMoney(A, S.country)}, and the dealer will finance it.`,
        choices: [
          {
            label: "Buy the car with cash",
            effect: (st) => {
              walletMove(st, -A, 'Buy the car with cash', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You bought a car in the Gulf for ${formatMoney(A, S.country)}, cash, and drove it home the same day.`, 'money');
            },
          },
          {
            label: "Buy it on finance",
            effect: (st) => {
              walletMove(st, -B, 'Buy it on finance', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You bought the car on finance in the Gulf, ${formatMoney(B, S.country)} down, and monthly payments after.`, 'money');
            },
          },
          {
            label: "Keep taking taxis",
            effect: (st) => {
              walletMove(st, -B, 'Keep taking taxis', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You kept taking taxis in the Gulf, ${formatMoney(B, S.country)} a month, and put off buying a car.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_gulf_eid_abroad',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['mom', 'friend'],"minAge": 22, "abroad": true},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_gulf_eid_abroad',
        category: 'life',
        title: "Eid Far from Home",
        text: `Eid abroad is different: the prayers are the same, but the house is quiet, the family is a phone screen, and the food is never quite ${momName}’s. The expat community gathers, and it helps — a little.`,
        choices: [
          {
            label: "Join the expat Eid gathering",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Join the expat Eid gathering', { affection: (+4) });
              recordJournal(st, `You joined the expat Eid gathering abroad, and it felt almost like home.`, 'life');
            },
          },
          {
            label: "Call home all day",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Call home all day', { affection: (+4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You called home all day on Eid abroad, and heard every voice you missed.`, 'life');
            },
          },
          {
            label: "Work through Eid",
            effect: (st) => {
              walletMove(st, +A, 'Work through Eid', 'life');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You worked through Eid abroad for ${formatMoney(A, S.country)} in holiday pay. The money did not help.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_friend_repays',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 20, "afterEvent": "ev_money_friend_loan", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      return {
        key: 'ev_back_friend_repays',
        category: 'money',
        title: "$fr Pays You Back",
        text: `Three months later than promised, ${frName} arrives with the money — all of it, counted out, with an apology and a meal. The debt is closed, and the friendship is intact.`,
        choices: [
          {
            label: "Accept it graciously",
            effect: (st) => {
              walletMove(st, +A, 'Accept it graciously', 'money');
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Accept it graciously', { affection: (+5) });
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Accept it graciously', { trust: (+6) });
              recordJournal(st, `${frName} paid you back the loan, late but in full, with a meal and an apology.`, 'money');
            },
          },
          {
            label: "Accept it, but say it was too late",
            effect: (st) => {
              walletMove(st, +A, 'Accept it, but say it was too late', 'money');
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Accept it, but say it was too late', { affection: (+1) });
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Accept it, but say it was too late', { trust: (+2) });
              recordJournal(st, `You accepted ${frName}’s late repayment, and said plainly that it had been too late.`, 'money');
            },
          },
          {
            label: "Tell $fr to keep it as a gift",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Tell $fr to keep it as a gift', { affection: (+7) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You told ${frName} to keep the repaid money as a gift. ${frName} refused, then accepted.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_sibling_repays',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['sib'],"minAge": 20, "afterEvent": "ev_money_sibling_loan", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1200, S.country, S.year);
      const B = eraLocalCost(600, S.country, S.year);
      return {
        key: 'ev_back_sibling_repays',
        category: 'money',
        title: `${sibName} Pays You Back`,
        text: `${sibName} turns up with an envelope: the loan, repaid in full, a month late but complete. ${sibName} is proud — and a little embarrassed that it took this long.`,
        choices: [
          {
            label: "Accept it and say nothing",
            effect: (st) => {
              walletMove(st, +A, 'Accept it and say nothing', 'money');
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Accept it and say nothing', { affection: (+5) });
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Accept it and say nothing', { trust: (+5) });
              recordJournal(st, `${sibName} paid you back the loan in full, a month late. You said nothing, and it was enough.`, 'money');
            },
          },
          {
            label: "Accept half and forgive the rest",
            effect: (st) => {
              walletMove(st, +B, 'Accept half and forgive the rest', 'money');
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Accept half and forgive the rest', { affection: (+7) });
              recordJournal(st, `You accepted half the repayment from ${sibName} and forgave the rest. Family is family.`, 'money');
            },
          },
          {
            label: "Refuse it \u2014 keep it for yourself",
            effect: (st) => {
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Refuse it — keep it for yourself', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You refused ${sibName}’s repayment and told them to keep it. ${sibName} hugged you.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_collector_returns',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "afterEvent": "ev_money_collector_call", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(4500, S.country, S.year);
      const B = eraLocalCost(900, S.country, S.year);
      return {
        key: 'ev_back_collector_returns',
        category: 'money',
        title: "The Debt Collector Returns",
        text: `The collector is back — the same voice, the same file, and now the amount is ${formatMoney(A, S.country)}, grown with interest and fees. He says this is the last chance before the file goes further.`,
        choices: [
          {
            label: "Pay it off in full now",
            effect: (st) => {
              walletMove(st, -A, 'Pay it off in full now', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (+6), 300, 900);
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-5));
              recordJournal(st, `You paid off the old debt in full, ${formatMoney(A, S.country)}, and the collector closed the file.`, 'money');
            },
          },
          {
            label: "Agree a final payment plan",
            effect: (st) => {
              walletMove(st, -B, 'Agree a final payment plan', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You agreed a final payment plan for the debt, ${formatMoney(B, S.country)} now and the rest monthly.`, 'money');
            },
          },
          {
            label: "Refuse to deal with him",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.money.creditScore = clamp(st.money.creditScore + (-8), 300, 900);
              recordJournal(st, `You refused to deal with the debt collector again. The file went further.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_mother_promise',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 24, "afterEvent": "ev_money_parent_medicine", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(600, S.country, S.year);
      const B = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_back_mother_promise',
        category: 'life',
        title: `${momName} Remembers the Medicine Money`,
        text: `${momName} calls — not to ask for anything, but to tell you she is better, the medicine worked, and she has been telling the neighbours about her child who sends money without being asked twice.`,
        choices: [
          {
            label: "Visit her and bring food",
            effect: (st) => {
              walletMove(st, -A, 'Visit her and bring food', 'life');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Visit her and bring food', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `You visited ${momName} after her recovery and brought food, ${formatMoney(A, S.country)} worth, for the whole family.`, 'life');
            },
          },
          {
            label: "Send her a little extra",
            effect: (st) => {
              walletMove(st, -B, 'Send her a little extra', 'life');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Send her a little extra', { affection: (+5) });
              recordJournal(st, `You sent ${momName} a little extra, ${formatMoney(B, S.country)}, after hearing she was better.`, 'life');
            },
          },
          {
            label: "Say you are glad, and carry on",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Say you are glad, and carry on', { affection: (+3) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You told ${momName} you were glad she was better, and carried on with your day.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_tutor_results',
    category: 'school',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 12, "maxAge": 17, "education": ["inSchool"], "afterEvent": "ev_school_tutor_offer", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_back_tutor_results',
        category: 'school',
        title: "The Tutor\u2019s Results Show",
        text: `A term after the tutor started, the results arrive: your maths grade has jumped two levels, and the teacher asks what changed. The tutor smiles like they already know.`,
        choices: [
          {
            label: "Keep the tutor for another term",
            effect: (st) => {
              walletMove(st, -A, 'Keep the tutor for another term', 'school');
              st.education.academicSkill = clamp(st.education.academicSkill + (+4));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You kept the tutor for another term after the grades jumped, ${formatMoney(A, S.country)} a month.`, 'school');
            },
          },
          {
            label: "Stop the tutor \u2014 you can do it alone now",
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You stopped the tutor after the grades jumped, confident you could do it alone now.`, 'school');
            },
          },
          {
            label: "Thank the tutor properly",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Thank the tutor properly', { affection: (+2) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You thanked the tutor properly for the two-grade jump, with a gift and a letter.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_gym_shoulder',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 18, "afterEvent": "ev_health_gym_injury", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_back_gym_shoulder',
        category: 'health',
        title: "The Shoulder Comes Back",
        text: `The shoulder you injured at the gym is back — the same pull, the same pain, the first time you lift heavy again. The trainer looks at you and says the words you already know.`,
        choices: [
          {
            label: "Rest it again, properly this time",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `The gym shoulder injury came back, and you rested it properly this time.`, 'health');
            },
          },
          {
            label: "See the sports doctor again",
            effect: (st) => {
              walletMove(st, -A, 'See the sports doctor again', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You saw the sports doctor again about the shoulder, ${formatMoney(A, S.country)}, and got a real recovery plan.`, 'health');
            },
          },
          {
            label: "Quit heavy lifting for good",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              if (st.skills) st.skills.fitness = clamp(st.skills.fitness + (-2));
              recordJournal(st, `You quit heavy lifting for good after the shoulder came back, and switched to swimming.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_boss_remembers',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true, "afterEvent": "ev_career_boss_praise", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_back_boss_remembers',
        category: 'career',
        title: `${bossName} Brings Up Your Old Win`,
        text: `Months after the praise, ${bossName} brings up your old project win in a meeting — as an example of how the work should be done. Your name, in front of everyone, attached to the standard.`,
        choices: [
          {
            label: "Build on it \u2014 ask for more responsibility",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+5));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              recordJournal(st, `${bossName} brought up your old win as the standard, and you asked for more responsibility.`, 'career');
            },
          },
          {
            label: "Enjoy the recognition",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You enjoyed the recognition when ${bossName} brought up your old win in the meeting.`, 'career');
            },
          },
          {
            label: "Stay quiet and let it pass",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              recordJournal(st, `You stayed quiet when ${bossName} brought up your old win. The moment passed, but the respect stayed.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_child_thanks',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['child'],"minAge": 28, "hasChildren": true, "afterEvent": "ev_money_child_phone", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_back_child_thanks',
        category: 'life',
        title: "$childName Thanks You for the Phone",
        text: `Months later, ${childName}Name comes to you — not asking for anything, just saying thank you for the phone, and for trusting them with it. It is a small moment, and it lands hard.`,
        choices: [
          {
            label: "Hug them and say you are proud",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Hug them and say you are proud', { affection: (+6) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+5));
              recordJournal(st, `${childName}Name thanked you for the phone, months later, out of nowhere. You hugged them.`, 'life');
            },
          },
          {
            label: "Use it to talk about responsibility",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Use it to talk about responsibility', { affection: (+3) });
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+1));
              recordJournal(st, `You used ${childName}Name’s thanks to talk about responsibility, and they listened.`, 'life');
            },
          },
          {
            label: "Say it was nothing",
            effect: (st) => {
              if (ctx.child) rememberDeed(st, ctx.child, 'event', 'Say it was nothing', { affection: (+2) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You said the phone was nothing. ${childName}Name knew it was not.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_spouse_sofa_later',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 26, "relationship": ["married"], "afterEvent": "ev_money_spouse_sofa", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(400, S.country, S.year);
      return {
        key: 'ev_back_spouse_sofa_later',
        category: 'life',
        title: "The Sofa, Six Months Later",
        text: `Six months after the sofa arrived, ${spName} is sitting on it with tea, and says — out of nowhere — that it was the best thing you bought together. The living room is where the family lives now.`,
        choices: [
          {
            label: "Agree \u2014 it was worth it",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Agree — it was worth it', { affection: (+4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `Six months later, ${spName} said the new sofa was the best thing you bought together. You agreed.`, 'life');
            },
          },
          {
            label: "Say the old one would have done",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Say the old one would have done', { affection: (-2) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You said the old sofa would have done, six months later. ${spName} laughed, then stopped.`, 'life');
            },
          },
          {
            label: "Buy matching cushions",
            effect: (st) => {
              walletMove(st, -A, 'Buy matching cushions', 'life');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Buy matching cushions', { affection: (+3) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You bought matching cushions for the sofa, ${formatMoney(A, S.country)}, and ${spName} was delighted.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_loan_shop_returns',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 24, "afterEvent": "ev_money_payday_loan_shop", "afterEventMinTurns": 3},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2000, S.country, S.year);
      const B = eraLocalCost(6000, S.country, S.year);
      return {
        key: 'ev_back_loan_shop_returns',
        category: 'money',
        title: "The Loan Shop Wants Its Money",
        text: `A month after the loan shop, the repayment is due: ${formatMoney(B, S.country)}, and the man behind the counter is less friendly now. The interest has done its work, and the amount is bigger than you remembered.`,
        choices: [
          {
            label: "Pay it in full",
            effect: (st) => {
              walletMove(st, -B, 'Pay it in full', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-4));
              st.money.creditScore = clamp(st.money.creditScore + (+3), 300, 900);
              recordJournal(st, `You paid the loan shop back in full, ${formatMoney(B, S.country)}, and never went back.`, 'money');
            },
          },
          {
            label: "Pay half and extend it",
            effect: (st) => {
              walletMove(st, -A, 'Pay half and extend it', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.money.creditScore = clamp(st.money.creditScore + (-4), 300, 900);
              recordJournal(st, `You paid half the loan shop debt, ${formatMoney(A, S.country)}, and extended the rest — with more interest.`, 'money');
            },
          },
          {
            label: "Borrow from $fr to pay it",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Borrow from $fr to pay it', { affection: (-2) });
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You borrowed from ${frName} to pay the loan shop back. One debt replaced another.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_colleague_credit_later',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 22, "hasJob": true, "afterEvent": "ev_career_credit_stolen", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_back_colleague_credit_later',
        category: 'career',
        title: "The Colleague Does It Again",
        text: `The same colleague takes credit for someone else’s work — and this time, the whole team sees it happen. People look at you, because you were the first one it happened to.`,
        choices: [
          {
            label: "Speak up for the other person",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+5));
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You spoke up when the colleague took credit again — this time for someone else. The team remembered.`, 'career');
            },
          },
          {
            label: "Tell the new victim what happened to you",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Tell the new victim what happened to you', { affection: (+2) });
              recordJournal(st, `You told the new victim what the colleague had done to you, and how you handled it.`, 'career');
            },
          },
          {
            label: "Stay out of it this time",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-1));
              recordJournal(st, `You stayed out of it when the colleague did it again. It was not your fight anymore.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_school_bully_later',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 9, "maxAge": 17, "education": ["inSchool"], "afterEvent": "ev_school_bully", "afterEventMinTurns": 12},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_back_school_bully_later',
        category: 'school',
        title: "The Bully Apologises",
        text: `Years later — or so it feels — the bully finds you after school and apologises. Awkwardly, badly, but sincerely. His own life, it turns out, was harder than yours.`,
        choices: [
          {
            label: "Accept the apology",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+2));
              recordJournal(st, `The bully apologised, years after the corridor. You accepted it, and meant it.`, 'school');
            },
          },
          {
            label: "Forgive, but keep your distance",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-1));
              recordJournal(st, `You forgave the bully, but kept your distance. Some things do not go back.`, 'school');
            },
          },
          {
            label: "Refuse the apology",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You refused the bully’s apology. Some wounds do not close on request.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_uni_scholarship_later',
    category: 'school',
    repeatable: false,
    gates: {"minAge": 19, "maxAge": 26, "education": ["inUni"], "afterEvent": "ev_uni_scholarship_win", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_back_uni_scholarship_later',
        category: 'school',
        title: "The Scholarship Office Checks In",
        text: `A year after you won the scholarship, the office checks in: your grades, your plans, and whether you would speak to the next year’s applicants. They want your story.`,
        choices: [
          {
            label: "Speak to the new applicants",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              if (st.skills) st.skills.charisma = clamp(st.skills.charisma + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You spoke to the new scholarship applicants about winning yours, and what it changed.`, 'school');
            },
          },
          {
            label: "Write a letter instead",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You wrote a letter to the new scholarship applicants instead of speaking. It was read aloud.`, 'school');
            },
          },
          {
            label: "Decline \u2014 you are too busy",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-1));
              recordJournal(st, `You declined to speak to the new scholarship applicants. You were too busy.`, 'school');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_gulf_sponsor_later',
    category: 'life',
    repeatable: false,
    gates: {"minAge": 24, "abroad": true, "countries": ["sau", "uae"], "afterEvent": "ev_gulf_sponsor_trouble", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_back_gulf_sponsor_later',
        category: 'life',
        title: "The Sponsor Asks a Favour",
        text: `The sponsor who once ignored your calls now asks you a favour — a relative needs a job, a signature, a word in the right ear. The power has shifted, quietly, and you both know it.`,
        choices: [
          {
            label: "Help him \u2014 generously",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You helped your sponsor with his favour, generously, and the relationship changed.`, 'life');
            },
          },
          {
            label: "Help, but make him wait a little",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+1));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+1));
              recordJournal(st, `You helped your sponsor, but made him wait a little first. He understood.`, 'life');
            },
          },
          {
            label: "Refuse \u2014 you owe him nothing",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              recordJournal(st, `You refused your sponsor’s favour. You owed him nothing, you said.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_health_checkup_later',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 32, "afterEvent": "ev_health_checkup", "afterEventMinTurns": 12},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const dadName = ctx.dad ? ctx.dad.firstName : 'your father';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(600, S.country, S.year);
      return {
        key: 'ev_back_health_checkup_later',
        category: 'health',
        title: "The Follow-Up Check-Up",
        text: `A year after the check-up, the doctor sees you again — and the numbers tell the story of what you did with the advice. The blood pressure, the weight, the walking: all of it is in the file.`,
        choices: [
          {
            label: "Show the improvement",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `The follow-up check-up showed real improvement — the walking, the salt, all of it worked.`, 'health');
            },
          },
          {
            label: "Admit you did nothing",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You admitted at the follow-up that you had done nothing with the advice. The doctor was kind about it.`, 'health');
            },
          },
          {
            label: "Book the tests you skipped",
            effect: (st) => {
              walletMove(st, -A, 'Book the tests you skipped', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You booked the follow-up tests you had skipped, ${formatMoney(A, S.country)}, and faced the numbers.`, 'health');
            },
          },
        ],
      };
    },
  },
  /* ============ v2.10 — THIRD-LEVEL FOLLOW-UPS (ev_back_* chains) ============
     Level-2 events: each follows a level-1 follow-up, so the chain
     reaches a third event. Gates stay minimal on purpose: the follow-up
     is the point of the chain, so only the gate that keeps the story
     honest is kept (married, hasChildren, hasJob, abroad, or an age
     bound where the story needs one). No wealth gates. */
  {
    id: 'ev_back_friend_repays_l2',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['friend'],"minAge": 20, "afterEvent": "ev_back_friend_repays", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const frName = ctx.friend ? ctx.friend.firstName : 'a friend';
      const A = eraLocalCost(1500, S.country, S.year);
      const B = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_back_friend_repays_l2',
        category: 'money',
        title: `${frName} Has a Small Idea`,
        text: `${frName} has a small idea — a market stall, a delivery round, something of their own — and they want you in for a little money. They paid you back once, on time and in full, and they are counting on that counting for something.`,
        choices: [
          {
            label: "Put in a little and back the idea",
            effect: (st) => {
              walletMove(st, -A, 'Back the friend’s small idea', 'money');
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Back the friend’s small idea', { affection: (+8) });
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Back the friend’s small idea', { trust: (+6) });
              recordJournal(st, `You put money into ${frName}’s small idea — a market stall, a delivery round, something of their own.`, 'money');
            },
          },
          {
            label: "Lend a smaller sum, with a date",
            effect: (st) => {
              walletMove(st, -B, 'Lend a smaller sum, with a date', 'money');
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Lend a smaller sum, with a date', { affection: (+4) });
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Lend a smaller sum, with a date', { trust: (+4) });
              recordJournal(st, `You lent ${frName} a smaller sum for their idea, with a repayment date written down.`, 'money');
            },
          },
          {
            label: "Say no — the last loan was the last",
            effect: (st) => {
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Say no — the last loan was the last', { affection: (-6) });
              if (ctx.friend) rememberDeed(st, ctx.friend, 'event', 'Say no — the last loan was the last', { trust: (-4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You said no to ${frName}’s idea — the last loan was the last, you told them.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_sibling_repays_l2',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['sib'],"minAge": 20, "afterEvent": "ev_back_sibling_repays", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const sibName = ctx.sib ? ctx.sib.firstName : 'your sibling';
      const A = eraLocalCost(2500, S.country, S.year);
      const B = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_back_sibling_repays_l2',
        category: 'money',
        title: `${sibName} Proved It — And Asks for More`,
        text: `${sibName} paid the last loan back in full, and now they are asking for a bigger one: a course deposit, the thing that could change what they earn. They know what they are asking. They paid last time, and they are asking you to remember that.`,
        choices: [
          {
            label: "Lend the full amount for the course",
            effect: (st) => {
              walletMove(st, -A, 'Lend the full amount for the course', 'money');
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Lend the full amount for the course', { affection: (+10) });
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Lend the full amount for the course', { trust: (+8) });
              recordJournal(st, `You lent ${sibName} the full course deposit — they paid the last loan back, and you remembered it.`, 'money');
            },
          },
          {
            label: "Lend half and ask them to save the rest",
            effect: (st) => {
              walletMove(st, -B, 'Lend half and ask them to save the rest', 'money');
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Lend half and ask them to save the rest', { affection: (+6) });
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Lend half and ask them to save the rest', { trust: (+5) });
              recordJournal(st, `You lent ${sibName} half the course deposit and asked them to save the rest.`, 'money');
            },
          },
          {
            label: "Say the last loan was the last",
            effect: (st) => {
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Say the last loan was the last', { affection: (-8) });
              if (ctx.sib) rememberDeed(st, ctx.sib, 'event', 'Say the last loan was the last', { trust: (-5) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              recordJournal(st, `You told ${sibName} the last loan was the last, even though they had paid it back.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_collector_returns_l2',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "afterEvent": "ev_back_collector_returns", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const A = eraLocalCost(5200, S.country, S.year);
      return {
        key: 'ev_back_collector_returns_l2',
        category: 'money',
        title: "A Letter About the Debt",
        text: `A letter arrives about the old debt: the file has gone further, and the amount is now ${formatMoney(A, S.country)} with the fees on top. The letter names a date. After that date, it is no longer a phone call — it is a court.`,
        choices: [
          {
            label: "Settle it before the date",
            effect: (st) => {
              walletMove(st, -A, 'Settle it before the date', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (+8), 300, 900);
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-6));
              recordJournal(st, `You settled the old debt in full, ${formatMoney(A, S.country)}, before the date in the letter.`, 'money');
            },
          },
          {
            label: "Fight it — the fees are not fair",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.money.creditScore = clamp(st.money.creditScore + (-4), 300, 900);
              recordJournal(st, `You decided to fight the old debt, arguing the fees were not fair. The fight will take months.`, 'money');
            },
          },
          {
            label: "Ignore the letter",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+8));
              st.money.creditScore = clamp(st.money.creditScore + (-10), 300, 900);
              recordJournal(st, `You ignored the letter about the old debt. The date in it passed.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_mother_promise_l2',
    category: 'life',
    repeatable: false,
    gates: { requiredPeople: ['mom'],"minAge": 24, "afterEvent": "ev_back_mother_promise", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const momName = ctx.mom ? ctx.mom.firstName : 'your mother';
      const A = eraLocalCost(700, S.country, S.year);
      return {
        key: 'ev_back_mother_promise_l2',
        category: 'life',
        title: `${momName} Wants Everyone Together`,
        text: `${momName} has told the whole family about the medicine money, and now she wants everyone together — a gathering at home, all of you at one table, because she is better and she wants to see it with her own eyes.`,
        choices: [
          {
            label: "Go home for the gathering",
            effect: (st) => {
              walletMove(st, -A, 'Go home for the gathering', 'life');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Go home for the gathering', { affection: (+10) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You went home for the gathering ${momName} wanted, all the family at one table.`, 'life');
            },
          },
          {
            label: "Send money for the food",
            effect: (st) => {
              walletMove(st, -A, 'Send money for the food', 'life');
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Send money for the food', { affection: (+5) });
              recordJournal(st, `You sent money for the food at ${momName}’s gathering, but you could not be there yourself.`, 'life');
            },
          },
          {
            label: "Promise to visit soon",
            effect: (st) => {
              if (ctx.mom) rememberDeed(st, ctx.mom, 'event', 'Promise to visit soon', { affection: (+3) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `You promised ${momName} you would visit soon, and meant to.`, 'life');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_boss_remembers_l2',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 22, "hasJob": true, "afterEvent": "ev_back_boss_remembers", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_back_boss_remembers_l2',
        category: 'career',
        title: `${bossName} Has a Bigger Assignment for You`,
        text: `${bossName} has remembered your old win one too many times — and now there is a reason: a bigger assignment, more responsibility, the kind of work that gets noticed. It comes with longer days and no promise of a raise yet.`,
        choices: [
          {
            label: "Take it — this is how you move up",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+4));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              recordJournal(st, `You took the bigger assignment ${bossName} offered — longer days, more responsibility, no raise promised yet.`, 'career');
            },
          },
          {
            label: "Ask for the raise first, then take it",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+2));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You asked ${bossName} for the raise first, and then took the bigger assignment.`, 'career');
            },
          },
          {
            label: "Turn it down — you have enough on your plate",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You turned down the bigger assignment from ${bossName} — you have enough on your plate.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_colleague_credit_later_l2',
    category: 'career',
    repeatable: false,
    gates: {"minAge": 22, "hasJob": true, "afterEvent": "ev_back_colleague_credit_later", "afterEventMinTurns": 3},
    build: (S, ctx) => {
      return {
        key: 'ev_back_colleague_credit_later_l2',
        category: 'career',
        title: "The Manager Asks You to Speak Up",
        text: `The colleague has done it again, and this time the manager saw it too. Now the manager is asking you — quietly, after the meeting — to say on the record what happened the first time. Your word would settle it.`,
        choices: [
          {
            label: "Speak up plainly, on the record",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You spoke up on the record about the colleague taking credit — your word settled it.`, 'career');
            },
          },
          {
            label: "Let the manager handle it",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+1));
              recordJournal(st, `You let the manager handle the colleague taking credit, and stayed out of it.`, 'career');
            },
          },
          {
            label: "Say nothing — it is not your fight",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You said nothing when the manager asked about the colleague — it is not your fight, you told yourself.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_gym_shoulder_l2',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 18, "afterEvent": "ev_back_gym_shoulder", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const A = eraLocalCost(900, S.country, S.year);
      return {
        key: 'ev_back_gym_shoulder_l2',
        category: 'health',
        title: "The Trainer Gives You a Verdict",
        text: `The trainer has watched you favour the shoulder for weeks, and now he gives you the verdict straight: physio, properly, or stop lifting heavy for good. There is no third option that ends well.`,
        choices: [
          {
            label: "Pay for physio, properly",
            effect: (st) => {
              walletMove(st, -A, 'Pay for physio, properly', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              recordJournal(st, `You paid for physio for the shoulder, properly this time, ${formatMoney(A, S.country)}.`, 'health');
            },
          },
          {
            label: "Switch to lighter training",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You switched to lighter training to spare the shoulder.`, 'health');
            },
          },
          {
            label: "Push through it",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You pushed through the shoulder pain at the gym, against the trainer’s advice.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_health_checkup_later_l2',
    category: 'health',
    repeatable: false,
    gates: {"minAge": 32, "afterEvent": "ev_back_health_checkup_later", "afterEventMinTurns": 12},
    build: (S, ctx) => {
      const A = eraLocalCost(1500, S.country, S.year);
      const B = eraLocalCost(800, S.country, S.year);
      return {
        key: 'ev_back_health_checkup_later_l2',
        category: 'health',
        title: "The Numbers, a Year On",
        text: `A year after the last check-up, the doctor has the new numbers in front of her — and they tell the story of the year you actually lived. Some of them are better. One of them is not, and she is not going to let it pass twice.`,
        choices: [
          {
            label: "Follow the plan properly this time",
            effect: (st) => {
              walletMove(st, -A, 'Follow the plan properly this time', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You followed the doctor’s plan properly this time, ${formatMoney(A, S.country)} on the food and the walking and the rest.`, 'health');
            },
          },
          {
            label: "Book the tests she wants",
            effect: (st) => {
              walletMove(st, -B, 'Book the tests she wants', 'health');
              st.player.vitals.health = clamp(st.player.vitals.health + (+2));
              recordJournal(st, `You booked the tests the doctor wanted, ${formatMoney(B, S.country)}, and faced the numbers.`, 'health');
            },
          },
          {
            label: "Admit you did nothing with the advice",
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + (-2));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              recordJournal(st, `You admitted at the check-up that you had done nothing with the advice, again. The doctor was kind about it.`, 'health');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_loan_shop_returns_l2',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 24, "afterEvent": "ev_back_loan_shop_returns", "afterEventMinTurns": 3},
    build: (S, ctx) => {
      const A = eraLocalCost(3000, S.country, S.year);
      const B = eraLocalCost(1000, S.country, S.year);
      return {
        key: 'ev_back_loan_shop_returns_l2',
        category: 'money',
        title: "The Loan Shop Offers You More",
        text: `The man at the loan shop is smiling now: because you paid last time, he will lend you more — ${formatMoney(A, S.country)}, today, no questions. The interest is in the small print, and he is not reading it out loud.`,
        choices: [
          {
            label: "Take the bigger loan",
            effect: (st) => {
              walletMove(st, +A, 'Take the bigger loan', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (-6), 300, 900);
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              recordJournal(st, `You took the bigger loan from the loan shop, ${formatMoney(A, S.country)}, no questions asked.`, 'money');
            },
          },
          {
            label: "Refuse and walk away",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You refused the bigger loan from the loan shop and walked away.`, 'money');
            },
          },
          {
            label: "Take a smaller one, just to get through the month",
            effect: (st) => {
              walletMove(st, +B, 'Take a smaller one, just to get through the month', 'money');
              st.money.creditScore = clamp(st.money.creditScore + (-3), 300, 900);
              recordJournal(st, `You took a smaller loan from the loan shop, ${formatMoney(B, S.country)}, just to get through the month.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_back_spouse_sofa_later_l2',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['spouse'],"minAge": 26, "relationship": ["married"], "afterEvent": "ev_back_spouse_sofa_later", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const A = eraLocalCost(6000, S.country, S.year);
      const B = eraLocalCost(1500, S.country, S.year);
      return {
        key: 'ev_back_spouse_sofa_later_l2',
        category: 'money',
        title: `${spName} Wants the Whole Room Redone`,
        text: `The sofa was the best thing you bought together — ${spName} said so herself. And now the rest of the room looks wrong next to it. She has a plan for the whole room, and a list, and she has already measured the walls.`,
        choices: [
          {
            label: "Redo the room, properly",
            effect: (st) => {
              walletMove(st, -A, 'Redo the room, properly', 'money');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Redo the room, properly', { affection: (+10) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+4));
              recordJournal(st, `You redid the whole living room to match the sofa, ${formatMoney(A, S.country)}, because ${spName} had already measured the walls.`, 'money');
            },
          },
          {
            label: "Buy one matching piece",
            effect: (st) => {
              walletMove(st, -B, 'Buy one matching piece', 'money');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Buy one matching piece', { affection: (+5) });
              recordJournal(st, `You bought one matching piece for the living room, a start on ${spName}’s plan.`, 'money');
            },
          },
          {
            label: "Say the sofa is enough",
            effect: (st) => {
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Say the sofa is enough', { affection: (-4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You told ${spName} the sofa is enough, and the room stayed as it was.`, 'money');
            },
          },
        ],
      };
    },
  },
  /* ============ v2.10 — NEW CHAINS (one-offs that begged for a follow-up) ============ */
  {
    id: 'ev_career_promotion_celebration_l1',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 26, "hasJob": true, "afterEvent": "ev_career_promotion_celebration", "afterEventMinTurns": 3},
    build: (S, ctx) => {
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      return {
        key: 'ev_career_promotion_celebration_l1',
        category: 'career',
        title: "The New Role’s First Hard Month",
        text: `The applause has faded, and the new role is real now: longer hours, harder calls, and a colleague who thinks the job should have been theirs. ${bossName} is watching to see what you do with it.`,
        choices: [
          {
            label: "Put in the hours and prove it",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+6));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+6));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You put in the hours in the new role to prove the promotion was earned.`, 'career');
            },
          },
          {
            label: "Ask for a clear handover",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (+3));
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+2));
              recordJournal(st, `You asked ${bossName} for a clear handover in the new role, instead of guessing your way through it.`, 'career');
            },
          },
          {
            label: "Coast on the title",
            effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 50) + (-4));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-3));
              recordJournal(st, `You coasted on the new title for a month, and the work noticed.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_career_fired_l1',
    category: 'career',
    repeatable: false,
    gates: { requiredPeople: ['boss'],"minAge": 24, "afterEvent": "ev_career_fired", "afterEventMinTurns": 3},
    build: (S, ctx) => {
      const bossName = ctx.boss ? ctx.boss.firstName : 'your boss';
      const A = eraLocalCost(2500, S.country, S.year);
      return {
        key: 'ev_career_fired_l1',
        category: 'career',
        title: "Weeks After Being Let Go",
        text: `It has been weeks since you were let go. The severance is thinning, the job hunt is real, and one thing matters more than you thought: what ${bossName} will say when a new employer calls for a reference.`,
        choices: [
          {
            label: "Call your old boss about the reference",
            effect: (st) => {
              st.reputation = clamp((st.reputation == null ? 55 : st.reputation) + (+3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              recordJournal(st, `You called ${bossName} about the reference, weeks after being let go. They said they would speak well of you.`, 'career');
            },
          },
          {
            label: "Take stopgap work for now",
            effect: (st) => {
              walletMove(st, +A, 'Take stopgap work for now', 'career');
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-1));
              recordJournal(st, `You took stopgap work for ${formatMoney(A, S.country)} while the real job hunt goes on.`, 'career');
            },
          },
          {
            label: "Lean on savings and keep looking",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+5));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `You leaned on your savings and kept looking for the right job, weeks after being let go.`, 'career');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_funeral_collection_l1',
    category: 'money',
    repeatable: false,
    gates: {"minAge": 22, "afterEvent": "ev_money_funeral_collection", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const A = eraLocalCost(1200, S.country, S.year);
      return {
        key: 'ev_money_funeral_collection_l1',
        category: 'money',
        title: "The Family Gathers Again",
        text: `Months after the funeral, the family gathers again — and who paid for what is still on everyone’s mind. The collection covered it, but nobody has said out loud who gave what, and the silence is doing its own damage.`,
        choices: [
          {
            label: "Host the gathering yourself",
            effect: (st) => {
              walletMove(st, -A, 'Host the gathering yourself', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `Months after the funeral, you hosted the family gathering yourself, ${formatMoney(A, S.country)} on the food and the house.`, 'money');
            },
          },
          {
            label: "Call everyone and settle the costs openly",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+3));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+2));
              recordJournal(st, `You called the family together and settled the funeral costs openly, so nobody would carry the silence any longer.`, 'money');
            },
          },
          {
            label: "Let it pass without a word",
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + (+2));
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-2));
              recordJournal(st, `The family gathered again after the funeral, and you let the question of who paid pass without a word.`, 'money');
            },
          },
        ],
      };
    },
  },
  {
    id: 'ev_money_baby_costs_l1',
    category: 'money',
    repeatable: false,
    gates: { requiredPeople: ['spouse', 'child'],"minAge": 24, "hasChildren": true, "afterEvent": "ev_money_baby_costs", "afterEventMinTurns": 6},
    build: (S, ctx) => {
      const childName = ctx.child ? ctx.child.firstName : 'your child';
      const spName = ctx.spouse ? ctx.spouse.firstName : 'your partner';
      const A = eraLocalCost(900, S.country, S.year);
      const B = eraLocalCost(300, S.country, S.year);
      return {
        key: 'ev_money_baby_costs_l1',
        category: 'money',
        title: `${childName} Turns One`,
        text: `${childName} is nearly one, and everyone expects a first birthday — a small party, a cake, family crowding into the flat. It is the kind of day that costs money you had not planned to spend, and the kind you will remember anyway.`,
        choices: [
          {
            label: "Throw a proper little party",
            effect: (st) => {
              walletMove(st, -A, 'Throw a proper little party', 'money');
              if (ctx.spouse) rememberDeed(st, ctx.spouse, 'event', 'Throw a proper little party', { affection: (+4) });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+6));
              recordJournal(st, `You threw ${childName} a proper little first birthday party, ${formatMoney(A, S.country)}, with the family crowding in.`, 'money');
            },
          },
          {
            label: "Keep it to family and a cake",
            effect: (st) => {
              walletMove(st, -B, 'Keep it to family and a cake', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (+3));
              recordJournal(st, `You kept ${childName}’s first birthday to family and a cake, ${formatMoney(B, S.country)}.`, 'money');
            },
          },
          {
            label: "Skip it — money is tight",
            effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + (-3));
              st.player.vitals.stress = clamp(st.player.vitals.stress + (-2));
              recordJournal(st, `You skipped ${childName}’s first birthday party — money is tight, and the day passed quietly.`, 'money');
            },
          },
        ],
      };
    },
  },
];
