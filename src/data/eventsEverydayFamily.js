import {checkSocialEnergy,spendSocialEnergy,noteSocialContact} from '../systems/socialEnergy.js';
/* ============================================================================
   World Life 2.0 — v2.5 Events (Part 1): Everyday life & family
   ~250 NEW random events: everyday small-life, family, married life,
   children, friends, NPC-initiated, and follow-up chains.
   Every event declares honest gates (the "appropriate" rule) and every
   choice moves a real number through the game's own systems: vitals,
   skills, values, reputation, the money ledger, or a relationship
   metric on the person record (rememberDeed / direct rel changes).
   Money amounts go through eraLocalCost — never hardcoded 2026 prices.
   "Voice" here is living TEXT dialogue, never audio.
   ========================================================================== */

import { chance, clamp, pick, randInt } from '../core/rng.js';
import { recordJournal, walletMove, moveBalance, queueScene } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraLocalCost } from '../data/economy.js';
import { rememberDeed } from '../systems/soulEngine.js';
/* v2.7 — event purchases go through the real shop catalogue (see
   buyShopItemForEvent in economyEngine.js): real item, real price, charged
   through the ledger, and the item exists in the player's possessions after. */
import { cheapestShopItem, shopItemPriceLocal, buyShopItemForEvent } from '../systems/economyEngine.js';

/* Cheapest mobile phone on sale this year (landlines and pagers excluded). */
function cheapestMobilePhone(S) {
  return cheapestShopItem(S, it => it.category === 'phone' && !/landline|corded|cordless|pager|telephone/i.test(it.name));
}

/* Live people for this life: ctx wins when the engine passes it, S is the
   fallback. Every build reads people through here so a missing person never
   crashes the text — names fall back to a plain role word. */
function live(S, ctx) {
  const c = ctx || {};
  const rel = (S && S.relations) || {};
  const people = (S && S.people) || {};
  const byId = (id) => (id && people[id]?.alive ? people[id] : null);
  const firstAlive = (ids) => (Array.isArray(ids) ? ids.map(byId).find((p) => p && p.alive) : null) || null;
  const kids = (rel.childIds || []).map(byId).filter((p) => p && p.alive);
  return {
    spouse: c.spouse || firstAlive(rel.spouseIds) || c.partner || byId(rel.partnerId),
    mom: c.mom || byId(rel.motherId),
    dad: c.dad || byId(rel.fatherId),
    sib: c.sib || firstAlive(rel.siblingIds),
    friend: c.friend || firstAlive(rel.friendIds),
    child: c.child || kids[0] || null,
    youngChild: c.youngChild || kids.find((p) => p.age <= 8) || null,
    teen: c.teen || kids.find((p) => p.age >= 13 && p.age <= 19) || null,
    adultChild: c.adultChild || kids.find((p) => p.age >= 20) || null,
  };
}

function nm(p, fb) { return (p && p.firstName) || fb; }
/* Year-adjusted local cost for a 2026-denominated amount. */
function cost(st, base2026) { return eraLocalCost(base2026, st.country, st.year); }
function money(st, base2026) { return formatMoney(cost(st, base2026), st.country); }

export const EVENTS_EVERYDAY_FAMILY = [
  /* ============================ EVERYDAY LIFE ============================ */
  {
    id: 'ev_life_found_wallet',
    category: 'life',
    gates: { minAge: 12, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const found = cost(S, randInt(S, 60, 260));
      return {
        key: 'ev_life_found_wallet', category: 'life',
        title: 'A Wallet on the Pavement',
        text: `Walking home through ${S.city}, you spot a worn leather wallet on the pavement. Inside is ${formatMoney(found, S.country)} in cash and an ID card with a photo of an older man. No one nearby is looking for it.`,
        choices: [
          { label: 'Hand it in at the nearest police station', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.values.integrity = clamp(st.values.integrity + 6);
              st.reputation = clamp(st.reputation + 3);
              recordJournal(st, `You found a wallet with ${formatMoney(found, st.country)} in ${st.city} and handed it in untouched.`, 'life');
          } },
          { label: 'Keep the cash, throw the wallet away', effect: (st) => {
              walletMove(st, found, 'Cash found in a lost wallet', 'money');
              st.values.integrity = clamp(st.values.integrity - 8);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `You kept ${formatMoney(found, st.country)} from a wallet you found on the street in ${st.city}.`, 'life');
          } },
          { label: 'Track the owner down yourself and return it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              st.values.integrity = clamp(st.values.integrity + 4);
              st.reputation = clamp(st.reputation + 5);
              st.skills.charisma = clamp(st.skills.charisma + 3);
              recordJournal(st, `You tracked down the owner of a lost wallet in ${st.city} and returned every note. He shook your hand for a long time.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_stray_cat',
    category: 'life',
    gates: { minAge: 6, maxAge: 75 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const food = cost(S, 25);
      return {
        key: 'ev_life_stray_cat', category: 'life',
        title: 'The Cat at the Door',
        text: `A thin ginger cat has started waiting outside your door in ${S.city} every evening, meowing hopefully. It is clearly hungry, and it flinches when you move too fast.`,
        choices: [
          { label: `Leave out food (${money(S, 25)})`, effect: (st) => {
              walletMove(st, -food, 'Food for a stray cat', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You started feeding the thin ginger cat that waits outside your door in ${st.city}.`, 'life');
          } },
          { label: 'Shoo it away and ignore it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              st.values.integrity = clamp(st.values.integrity - 2);
              recordJournal(st, `You shooed away the hungry cat at your door in ${st.city}. It did not come back.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_power_cut',
    category: 'life',
    gates: { minAge: 10, maxAge: 85, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_power_cut', category: 'life',
        title: 'The Lights Go Out',
        text: `Halfway through dinner the whole street in ${S.city} goes dark. The fridge hums to a stop, the television dies mid-sentence, and through the window you can see neighbours stepping onto their balconies with candles.`,
        choices: [
          { label: 'Light candles and make an evening of it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              recordJournal(st, `A power cut darkened your street in ${st.city}; you lit candles and made a quiet evening of it.`, 'life');
          } },
          { label: 'Sit in the dark, annoyed, waiting for it to return', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              recordJournal(st, `You sat in the dark through a power cut in ${st.city}, irritated at every wasted hour.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_loud_neighbour',
    category: 'life',
    gates: { minAge: 18, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_loud_neighbour', category: 'life',
        title: 'Music Through the Wall',
        text: `It is past midnight and the flat next door is playing music loud enough to shake your wall. You have an early start tomorrow, and the bass has now been going for two hours.`,
        choices: [
          { label: 'Knock and ask them to turn it down, politely', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.skills.charisma = clamp(st.skills.charisma + 3);
              recordJournal(st, `You knocked next door at midnight and asked politely for the music to come down. They apologised and turned it off.`, 'life');
          } },
          { label: 'Bang on the wall and shout', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              st.reputation = clamp(st.reputation - 3);
              recordJournal(st, `You lost your temper with the noisy neighbours and shouted through the wall. The music stopped, but the hallway is frosty now.`, 'life');
          } },
          { label: 'Put in earplugs and endure it', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `You endured a night of loud music from next door with earplugs in, and woke up exhausted.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_broken_kettle',
    category: 'life',
    gates: { minAge: 18, maxAge: 85, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      // v2.7: the kettle is the cheapest kettle actually in the shop
      // catalogue, at its real shop price.
      const kettle = cheapestShopItem(S, it => /kettle/i.test(it.name));
      const price = kettle ? shopItemPriceLocal(S, kettle) : cost(S, 180);
      return {
        key: 'ev_life_broken_kettle', category: 'life',
        title: 'The Kettle Gives Up',
        text: `Your kettle clicks, sputters, and dies halfway through boiling. No morning tea or coffee until it is replaced, and the shops in ${S.city} sell a ${kettle ? `${kettle.brand} ${kettle.name}` : 'decent kettle'} for ${formatMoney(price, S.country)}.`,
        choices: [
          { label: `Buy a new kettle (${formatMoney(price, S.country)})`, available: (st) => st.money.cash >= price, effect: (st) => {
              const res = kettle
                ? buyShopItemForEvent(st, kettle, { label: `New ${kettle.brand} ${kettle.name} (shop catalogue)` })
                : { ok: false, msg: 'No kettle in the shop catalogue.' };
              if (res.ok) {
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
                recordJournal(st, `Your old kettle died, so you bought a new ${kettle.brand} ${kettle.name} for ${formatMoney(res.priceLocal, st.country)}. It is now in your kitchen.`, 'life');
              } else {
                recordJournal(st, `You wanted a new kettle but could not pay for it (${res.msg}).`, 'life');
              }
          } },
          { label: 'Boil water in a pot on the stove instead', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Rather than replace the broken kettle, you started boiling water in a pot like your grandparents did.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_puncture',
    category: 'life',
    gates: { minAge: 12, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const fix = cost(S, 40);
      return {
        key: 'ev_life_puncture', category: 'life',
        title: 'A Flat Tyre on the Way Home',
        text: `Halfway home across ${S.city} your bicycle tyre goes soft, then flat. You are still a long walk from home, and a repair stand by the roadside will patch it for ${formatMoney(fix, S.country)}.`,
        choices: [
          { label: `Pay for the patch (${formatMoney(fix, S.country)})`, effect: (st) => {
              walletMove(st, -fix, 'Bicycle puncture repair', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You paid ${formatMoney(fix, st.country)} to patch a flat bicycle tyre on the way home.`, 'life');
          } },
          { label: 'Walk the bike all the way home', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You walked your bicycle with a flat tyre all the way home across ${st.city}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_rain_soaked',
    category: 'life',
    gates: { minAge: 16, maxAge: 70, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_rain_soaked', category: 'life',
        title: 'Caught in the Rain',
        text: `The sky over ${S.city} opens without warning on your way to work. By the time you reach the office your shirt is soaked through, your shoes squelch, and your hair is plastered to your forehead.`,
        choices: [
          { label: 'Laugh it off and dry out at your desk', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) + 2);
              recordJournal(st, `You arrived at work soaked through by sudden rain in ${st.city} and laughed it off.`, 'life');
          } },
          { label: 'Go home, change, and arrive late', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 1);
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) - 4);
              recordJournal(st, `You went home to change out of rain-soaked clothes and arrived late to work.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_cracked_phone',
    category: 'life',
    gates: { minAge: 14, maxAge: 70, minYear: 2007 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const repair = cost(S, 450);
      return {
        key: 'ev_life_cracked_phone', category: 'life',
        title: 'The Phone Hits the Pavement',
        text: `Your phone slips out of your hand on a busy street in ${S.city} and lands face-down. When you pick it up, a spiderweb of cracks runs across the screen. It still works, but every swipe catches your thumb. A repair shop quotes ${formatMoney(repair, S.country)}.`,
        choices: [
          { label: `Pay for the screen repair (${formatMoney(repair, S.country)})`, effect: (st) => {
              walletMove(st, -repair, 'Phone screen repair', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You paid ${formatMoney(repair, st.country)} to fix your cracked phone screen.`, 'life');
          } },
          { label: 'Live with the cracked screen', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You kept using your phone with a cracked screen rather than pay for the repair.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_lost_keys',
    category: 'life',
    gates: { minAge: 18, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const locksmith = cost(S, 220);
      return {
        key: 'ev_life_lost_keys', category: 'life',
        title: 'Locked Out',
        text: `You reach your front door in ${S.city} and pat your pockets. Nothing. Your keys are gone — left at work, or dropped somewhere on the way home. A locksmith can open the door for ${formatMoney(locksmith, S.country)}, or you could wait until someone else gets home.`,
        choices: [
          { label: `Call the locksmith (${formatMoney(locksmith, S.country)})`, effect: (st) => {
              walletMove(st, -locksmith, 'Locksmith call-out', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You lost your keys and paid ${formatMoney(locksmith, st.country)} for a locksmith to open your door.`, 'life');
          } },
          { label: 'Wait on the step until someone comes home', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Locked out without your keys, you waited on the step for hours until someone came home.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_washing_flood',
    category: 'life',
    gates: { minAge: 18, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const repair = cost(S, 600);
      return {
        key: 'ev_life_washing_flood', category: 'life',
        title: 'Water Across the Kitchen Floor',
        text: `The washing machine hose has come loose and water is spreading across your kitchen floor in ${S.city}. Towels are already soaked through and the water is heading for the hallway. A repairman can fix the hose and pump for ${formatMoney(repair, S.country)}.`,
        choices: [
          { label: `Call the repairman (${formatMoney(repair, S.country)})`, effect: (st) => {
              walletMove(st, -repair, 'Washing machine repair', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `Your washing machine flooded the kitchen; you paid ${formatMoney(repair, st.country)} to have it fixed.`, 'life');
          } },
          { label: 'Mop it up and fix the hose yourself', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.skills.creativity = clamp(st.skills.creativity + 2);
              recordJournal(st, `You mopped up the flooded kitchen and fixed the washing machine hose yourself with a wrench and patience.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_fridge_breaks',
    category: 'life',
    gates: { minAge: 20, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const repair = cost(S, 900);
      return {
        key: 'ev_life_fridge_breaks', category: 'life',
        title: 'The Fridge Goes Warm',
        text: `You open the fridge and the air inside is warm. The motor has died overnight, and a week's worth of food in ${S.city} is already starting to turn. A repairman quotes ${formatMoney(repair, S.country)} — or the fridge is old enough that a new one makes more sense.`,
        choices: [
          { label: `Pay for the repair (${formatMoney(repair, S.country)})`, effect: (st) => {
              walletMove(st, -repair, 'Fridge repair', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `Your fridge died overnight; you paid ${formatMoney(repair, st.country)} to repair it before the food spoiled.`, 'life');
          } },
          { label: 'Throw the food out and eat out until you decide', effect: (st) => {
              walletMove(st, -cost(st, 300), 'Takeaway meals while the fridge is broken', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `With the fridge dead, you threw out a week of food and ate out for days while you decided what to do.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_leaky_tap',
    category: 'life',
    gates: { minAge: 20, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const plumber = cost(S, 250);
      return {
        key: 'ev_life_leaky_tap', category: 'life',
        title: 'Drip, Drip, All Night',
        text: `The bathroom tap in your home in ${S.city} has started dripping — one drop every few seconds, loud enough to hear from bed. It has been going on for a week, and the water bill will notice. A plumber will fix it for ${formatMoney(plumber, S.country)}.`,
        choices: [
          { label: `Call the plumber (${formatMoney(plumber, S.country)})`, effect: (st) => {
              walletMove(st, -plumber, 'Plumber — leaking tap', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You finally called a plumber to fix the tap that had been dripping all night for a week.`, 'life');
          } },
          { label: 'Tighten it yourself and hope it holds', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              st.skills.creativity = clamp(st.skills.creativity + 2);
              recordJournal(st, `You tightened the dripping tap yourself. It still drips, but slower.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_internet_down',
    category: 'life',
    gates: { minAge: 16, maxAge: 70, minYear: 2000, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_internet_down', category: 'life',
        title: 'The Internet Dies Before a Deadline',
        text: `Your internet connection drops in the middle of a work task, right when a deadline is looming. The router blinks red, your phone hotspot is slow, and the provider says the outage could last hours.`,
        choices: [
          { label: 'Work from a café with Wi-Fi', effect: (st) => {
              walletMove(st, -cost(st, 60), 'Café Wi-Fi and coffee', 'money');
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `When your internet died before a deadline, you finished the work from a café in ${st.city}.`, 'life');
          } },
          { label: 'Wait it out and miss the deadline', effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) - 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              recordJournal(st, `Your internet died before a work deadline and you waited it out — the deadline passed.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_old_photos',
    category: 'life',
    gates: { requiredPeople: ['mom'], minAge: 28, maxAge: 85 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_old_photos', category: 'life',
        title: 'A Box of Old Photographs',
        text: `While clearing a cupboard you find a box of old photographs — your parents young and laughing, a street in ${S.city} that looks nothing like it does now, yourself as a small child holding a toy you had forgotten. You sit on the floor for an hour, going through them one by one.`,
        choices: [
          { label: 'Show them to your family over tea', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Shared old family photographs together.', { affection: 5, trust: 3 });
              recordJournal(st, `You found a box of old family photographs and spent the evening showing them around over tea.`, 'life');
          } },
          { label: 'Put the box away, it hurts a little to look', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You found a box of old photographs and put it back in the cupboard without going through it.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_bad_haircut',
    category: 'life',
    gates: { minAge: 12, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const fix = cost(S, 120);
      return {
        key: 'ev_life_bad_haircut', category: 'life',
        title: 'The Haircut That Went Wrong',
        text: `You asked for a trim at a new barber in ${S.city}. What you got is uneven on one side and far shorter than you asked for on the other. You stare at the mirror, unsure whether to say something.`,
        choices: [
          { label: 'Say so, and ask them to fix it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.skills.charisma = clamp(st.skills.charisma + 3);
              recordJournal(st, `A barber in ${st.city} cut your hair badly; you spoke up and they fixed it as best they could.`, 'life');
          } },
          { label: `Pay and go to another barber to repair it (${formatMoney(fix, S.country)})`, effect: (st) => {
              walletMove(st, -fix, 'Corrective haircut', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You paid a second barber to repair a bad haircut in ${st.city}.`, 'life');
          } },
          { label: 'Wear a hat for two weeks', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `After a terrible haircut, you wore a hat everywhere for two weeks.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_new_shoes_blister',
    category: 'life',
    gates: { minAge: 12, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_new_shoes_blister', category: 'life',
        title: 'New Shoes, Raw Heels',
        text: `Your new shoes looked perfect in the shop. By midday walking around ${S.city} they have rubbed both heels raw, and every step stings. You still have hours of walking ahead of you.`,
        choices: [
          { label: 'Buy plasters and push through', effect: (st) => {
              walletMove(st, -cost(st, 15), 'Plasters for blistered heels', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `Your new shoes rubbed your heels raw walking around ${st.city}; you bought plasters and pushed through.`, 'life');
          } },
          { label: 'Take a taxi home and rest your feet', effect: (st) => {
              walletMove(st, -cost(st, 50), 'Taxi home with sore feet', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `New shoes left your heels raw, so you took a taxi home and rested your feet.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_fake_watch',
    category: 'life',
    gates: { minAge: 16, maxAge: 60, wealth: ['poor', 'middle'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const price = cost(S, 150);
      return {
        key: 'ev_life_fake_watch', category: 'life',
        title: 'A Watch That Is Too Cheap to Be Real',
        text: `A street vendor in ${S.city} holds up a gleaming watch and whispers a price far below the shop price — ${formatMoney(price, S.country)}. He swears it is genuine, but the weight feels wrong in your hand and the second hand ticks too loudly.`,
        choices: [
          { label: `Buy it — a bargain is a bargain (${formatMoney(price, S.country)})`, effect: (st) => {
              walletMove(st, -price, 'Street watch that turned out fake', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `You bought a "genuine" watch from a street vendor in ${st.city}. It stopped working the next day.`, 'life');
          } },
          { label: 'Walk away — it is clearly fake', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.skills.financialIq = clamp(st.skills.financialIq + 3);
              recordJournal(st, `A street vendor tried to sell you a fake watch in ${st.city}; you walked away.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_taxi_overcharge',
    category: 'life',
    gates: { minAge: 16, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const over = cost(S, 80);
      return {
        key: 'ev_life_taxi_overcharge', category: 'life',
        title: 'The Meter That Runs Too Fast',
        text: `Your taxi across ${S.city} takes a strange, long route, and the fare comes to far more than the trip usually costs. The driver shrugs and says traffic was bad. You know the shortcut he skipped.`,
        choices: [
          { label: 'Argue the fare down', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              walletMove(st, -cost(st, 40), 'Taxi fare after arguing it down', 'money');
              recordJournal(st, `A taxi driver in ${st.city} tried to overcharge you; you argued the fare down.`, 'life');
          } },
          { label: `Pay it and get out (${formatMoney(over, S.country)} extra)`, effect: (st) => {
              walletMove(st, -over, 'Overcharged taxi fare', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `You paid an overcharged taxi fare in ${st.city} rather than argue about it.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_bus_breakdown',
    category: 'life',
    gates: { minAge: 14, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_bus_breakdown', category: 'life',
        title: 'The Bus Gives Up Halfway',
        text: `The bus you take every day across ${S.city} shudders, coughs out a cloud of smoke, and stops dead in traffic. The driver opens the doors and waves everyone off. You are still miles from where you need to be.`,
        choices: [
          { label: 'Walk the rest of the way', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `Your bus broke down halfway across ${st.city}; you walked the rest of the way.`, 'life');
          } },
          { label: 'Share a taxi with two strangers from the bus', effect: (st) => {
              walletMove(st, -cost(st, 35), 'Shared taxi after bus breakdown', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `When your bus broke down, you shared a taxi with two strangers and arrived laughing.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_queue_jumper',
    category: 'life',
    gates: { minAge: 12, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_queue_jumper', category: 'life',
        title: 'Someone Pushes In',
        text: `You have been queuing at the bakery in ${S.city} for ten minutes when a man walks straight to the front and starts ordering as if the queue does not exist. Everyone behind him exchanges looks.`,
        choices: [
          { label: 'Speak up — the queue starts back here', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              st.skills.charisma = clamp(st.skills.charisma + 3);
              st.reputation = clamp(st.reputation + 2);
              recordJournal(st, `You spoke up when someone pushed into the bakery queue in ${st.city}. He stepped back, muttering.`, 'life');
          } },
          { label: 'Let it go, it is not worth a scene', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 1);
              recordJournal(st, `You let a queue-jumper go ahead of you at the bakery in ${st.city}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_stranger_directions',
    category: 'life',
    gates: { minAge: 14, maxAge: 80 },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_stranger_directions', category: 'life',
        title: 'A Stranger Asks the Way',
        text: `A lost-looking visitor stops you on a street in ${S.city}, holding a crumpled map. They are looking for the old market square and their phone has no signal. You know the shortcut.`,
        choices: [
          { label: 'Walk them there yourself', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.values.integrity = clamp(st.values.integrity + 3);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `You walked a lost visitor to the market square in ${st.city} instead of just pointing.`, 'life');
          } },
          { label: 'Point the way and carry on', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You pointed a lost visitor toward the market square in ${st.city}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_beggar_asks',
    category: 'life',
    gates: { minAge: 16, maxAge: 80, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const give = cost(S, 30);
      return {
        key: 'ev_life_beggar_asks', category: 'life',
        title: 'A Hand Held Out',
        text: `Outside the market in ${S.city}, an elderly man with tired eyes holds out his hand and asks quietly for help. His clothes are thin and his shoes are coming apart. People walk past without looking.`,
        choices: [
          { label: `Give him ${formatMoney(give, S.country)}`, effect: (st) => {
              walletMove(st, -give, 'Given to a man begging outside the market', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.values.integrity = clamp(st.values.integrity + 3);
              recordJournal(st, `You gave ${formatMoney(give, st.country)} to an elderly man begging outside the market in ${st.city}.`, 'life');
          } },
          { label: 'Buy him a hot meal instead', effect: (st) => {
              walletMove(st, -cost(st, 70), 'Hot meal for a hungry stranger', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.values.integrity = clamp(st.values.integrity + 4);
              recordJournal(st, `You bought a hot meal for a hungry elderly man outside the market in ${st.city}.`, 'life');
          } },
          { label: 'Walk past like everyone else', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              st.values.integrity = clamp(st.values.integrity - 3);
              recordJournal(st, `You walked past an elderly man asking for help outside the market in ${st.city}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_cafe_closes',
    category: 'life',
    gates: { minAge: 18, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_cafe_closes', category: 'life',
        title: 'Your Café Closes Down',
        text: `The little café where you have sat a hundred mornings has a sign in the window: closed, for good. The owner is standing inside, packing cups into boxes, and he waves when he sees you.`,
        choices: [
          { label: 'Go in and wish him well', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `Your favourite café in ${st.city} closed down; you went in to wish the owner well.`, 'life');
          } },
          { label: 'Walk on — cafés come and go', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `Your favourite café in ${st.city} closed down and you walked straight past.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_new_cafe',
    category: 'life',
    gates: { minAge: 18, maxAge: 75 },
    repeatable: true, cooldownYears: 4,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const coffee = cost(S, 45);
      return {
        key: 'ev_life_new_cafe', category: 'life',
        title: 'A New Place Opens',
        text: `A new café has opened on your street in ${S.city}, all fresh paint and the smell of baking bread. A chalkboard outside promises the best coffee in the neighbourhood. It is busy already.`,
        choices: [
          { label: `Try it — coffee and a pastry (${formatMoney(coffee, S.country)})`, effect: (st) => {
              walletMove(st, -coffee, 'Coffee at a new café', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You tried the new café on your street in ${st.city}. The coffee was worth the queue.`, 'life');
          } },
          { label: 'Stick with your usual place', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 1);
              recordJournal(st, `A new café opened on your street in ${st.city}, but you stuck with your usual place.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_gym_offer',
    category: 'life',
    gates: { minAge: 18, maxAge: 55, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const month = cost(S, 300);
      return {
        key: 'ev_life_gym_offer', category: 'life',
        title: 'A Gym Membership Offer',
        text: `A gym near your work in ${S.city} is offering a founding-member rate: ${formatMoney(month, S.country)} a month, no joining fee, if you sign up this week. You have been meaning to get fitter for a year.`,
        choices: [
          { label: `Join the gym (${formatMoney(month, S.country)}/month)`, effect: (st) => {
              walletMove(st, -month, 'First gym membership payment', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + 4);
              st.skills.fitness = clamp(st.skills.fitness + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You joined a gym near work in ${st.city} for ${formatMoney(month, st.country)} a month.`, 'life');
          } },
          { label: 'Turn it down — you will exercise at home', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 1);
              st.skills.financialIq = clamp(st.skills.financialIq + 2);
              recordJournal(st, `You turned down a gym offer in ${st.city} and decided to exercise at home instead.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_twisted_ankle',
    category: 'life',
    gates: { minAge: 18, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_twisted_ankle', category: 'life',
        title: 'A Misstep on the Morning Run',
        text: `Out for a morning run in ${S.city}, your foot catches on an uneven paving stone and your ankle twists hard. You can still walk, but every step sends a sharp pain up your leg.`,
        choices: [
          { label: 'Rest it properly for a week', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You twisted your ankle on a morning run in ${st.city} and rested it properly for a week.`, 'life');
          } },
          { label: 'Push through the pain and keep running', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 7);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `You twisted your ankle running in ${st.city} and kept running on it anyway. It swelled badly.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_cooking_fail',
    category: 'life',
    gates: { minAge: 18, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const wasted = cost(S, 120);
      return {
        key: 'ev_life_cooking_fail', category: 'life',
        title: 'Dinner, Ruined',
        text: `You tried a new recipe tonight and it has gone badly wrong — the sauce has split, the rice is burnt at the bottom, and the kitchen smells of smoke. Dinner is in the pot, but nobody would call it dinner.`,
        choices: [
          { label: 'Order takeaway and laugh about it', effect: (st) => {
              walletMove(st, -cost(st, 150), 'Takeaway after a ruined dinner', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You ruined dinner trying a new recipe and ordered takeaway instead.`, 'life');
          } },
          { label: 'Eat it anyway — waste not', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 2);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `You ate the burnt dinner you had ruined rather than waste the food.`, 'life');
          } },
          { label: 'Salvage what you can and learn from it', effect: (st) => {
              st.skills.creativity = clamp(st.skills.creativity + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You salvaged half of a ruined dinner and worked out exactly where the recipe went wrong.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_cooking_win',
    category: 'life',
    gates: { requiredPeople: ['friend'], minAge: 18, maxAge: 80, hasHome: true },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_cooking_win', category: 'life',
        title: 'The Dish That Actually Worked',
        text: `Tonight everything in the kitchen went right. The dish you have been practising for months came out exactly as you imagined it — the smell alone fills the whole flat in ${S.city}, and the first bite makes you close your eyes.`,
        choices: [
          { label: 'Write the recipe down before you forget it', effect: (st) => {
              st.skills.creativity = clamp(st.skills.creativity + 5);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You finally cooked your signature dish perfectly and wrote the recipe down.`, 'life');
          } },
          { label: 'Invite someone over to taste it tomorrow', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.skills.charisma = clamp(st.skills.charisma + 3);
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Cooked them your best dish yet.', { affection: 5, trust: 3 });
              recordJournal(st, `You cooked your best dish yet and invited ${p.friend ? nm(p.friend, 'a friend') : 'a friend'} over to taste it.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_dying_plant',
    category: 'life',
    gates: { minAge: 20, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const plant = cost(S, 90);
      return {
        key: 'ev_life_dying_plant', category: 'life',
        title: 'The Plant on the Windowsill',
        text: `The plant on your windowsill in ${S.city} is drooping badly, its leaves yellow at the edges. You have been forgetting to water it for weeks, and it is clearly giving up.`,
        choices: [
          { label: 'Nurse it back — water, light, patience', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You nursed your drooping windowsill plant back to health with steady watering.`, 'life');
          } },
          { label: `Replace it with a new one (${formatMoney(plant, S.country)})`, effect: (st) => {
              walletMove(st, -plant, 'Replacement house plant', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `Your windowsill plant died, so you bought a new one for ${formatMoney(plant, st.country)}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_wrong_parcel',
    category: 'life',
    gates: { minAge: 18, maxAge: 75, minYear: 1995 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_wrong_parcel', category: 'life',
        title: 'A Parcel for the Wrong Flat',
        text: `The courier leaves a parcel at your door in ${S.city} — but the name on it is your neighbour's, two floors up. Inside, by the weight of it, is something they have clearly been waiting for.`,
        choices: [
          { label: 'Carry it up to them', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.values.integrity = clamp(st.values.integrity + 3);
              st.reputation = clamp(st.reputation + 2);
              recordJournal(st, `A parcel for your neighbour was left at your door; you carried it up to them.`, 'life');
          } },
          { label: 'Leave it by their door without a word', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.values.integrity = clamp(st.values.integrity + 2);
              recordJournal(st, `You left your neighbour's misdelivered parcel by their door.`, 'life');
          } },
          { label: 'Keep it — finders keepers', effect: (st) => {
              st.values.integrity = clamp(st.values.integrity - 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `A parcel for your neighbour was left at your door, and you kept it.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_lost_parcel',
    category: 'life',
    gates: { minAge: 18, maxAge: 75, minYear: 1995 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const value = cost(S, 400);
      return {
        key: 'ev_life_lost_parcel', category: 'life',
        title: 'The Parcel That Never Arrived',
        text: `A parcel you ordered weeks ago — worth about ${formatMoney(value, S.country)} — still has not arrived. The tracking page has not moved in ten days, and the seller says it was definitely posted.`,
        choices: [
          { label: 'Chase the seller for a refund', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              walletMove(st, value, 'Refund for a lost parcel', 'money');
              recordJournal(st, `A parcel worth ${formatMoney(value, st.country)} never arrived; you chased the seller and got a refund.`, 'life');
          } },
          { label: 'Give up on it and order again', effect: (st) => {
              walletMove(st, -value, 'Re-ordered a lost parcel', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your parcel never arrived, so you gave up chasing it and ordered the same thing again.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_subscription_renewal',
    category: 'life',
    gates: { minAge: 18, maxAge: 70, minYear: 2010, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const fee = cost(S, 120);
      return {
        key: 'ev_life_subscription_renewal', category: 'life',
        title: 'A Subscription You Forgot About',
        text: `Your bank statement shows a charge of ${formatMoney(fee, S.country)} for a streaming service you signed up for months ago and barely use. It renews every month, quietly, in the background.`,
        choices: [
          { label: 'Cancel it right now', effect: (st) => {
              st.skills.financialIq = clamp(st.skills.financialIq + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You spotted a forgotten subscription charging ${formatMoney(fee, st.country)} a month and cancelled it.`, 'life');
          } },
          { label: 'Keep it — you might use it one day', effect: (st) => {
              walletMove(st, -fee, 'Monthly streaming subscription', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You kept paying ${formatMoney(fee, st.country)} a month for a streaming service you barely use.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_card_swallowed',
    category: 'life',
    gates: { minAge: 18, maxAge: 75, minYear: 1990 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_card_swallowed', category: 'life',
        title: 'The ATM Keeps Your Card',
        text: `You type your PIN wrong three times at an ATM in ${S.city} and the machine swallows your bank card with a final clunk. Your money is inside the bank, but your card is inside the machine, and the branch is already closed.`,
        choices: [
          { label: 'Go into the branch tomorrow and get a replacement', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              st.skills.financialIq = clamp(st.skills.financialIq + 2);
              recordJournal(st, `An ATM in ${st.city} swallowed your bank card after three wrong PINs; you got a replacement the next day.`, 'life');
          } },
          { label: 'Live on cash in your pocket until it is sorted', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `With your card stuck in an ATM, you lived on pocket cash for days.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_wallet_stolen',
    category: 'life',
    gates: { minAge: 16, maxAge: 75 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const lost = cost(S, 200);
      return {
        key: 'ev_life_wallet_stolen', category: 'life',
        title: 'Your Pocket Feels Light',
        text: `On a crowded street in ${S.city} you reach for your wallet — and it is gone. Your pocket was picked clean in the crowd. Inside was about ${formatMoney(lost, S.country)} in cash, your ID, and your bank cards.`,
        choices: [
          { label: 'Report it to the police and cancel everything', effect: (st) => {
              walletMove(st, -lost, 'Cash stolen by a pickpocket', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              recordJournal(st, `A pickpocket took your wallet in ${st.city}; you lost ${formatMoney(lost, st.country)} and spent the day cancelling cards.`, 'life');
          } },
          { label: 'Just cancel the cards and move on', effect: (st) => {
              walletMove(st, -lost, 'Cash stolen by a pickpocket', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `A pickpocket took your wallet in ${st.city}; you cancelled the cards and tried to move on.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_pickpocket_caught',
    category: 'life',
    gates: { minAge: 16, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_pickpocket_caught', category: 'life',
        title: 'A Hand in Your Pocket',
        text: `On a packed bus in ${S.city} you feel a hand slide into your coat pocket. You turn and catch a young man with his fingers on your wallet, frozen mid-theft, eyes wide.`,
        choices: [
          { label: 'Grab his wrist and shout for the driver', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              st.reputation = clamp(st.reputation + 4);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `You caught a pickpocket with his hand in your pocket on a bus in ${st.city} and shouted for the driver.`, 'life');
          } },
          { label: 'Let him go with a warning', effect: (st) => {
              st.values.integrity = clamp(st.values.integrity + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You caught a pickpocket on a bus in ${st.city} and let him go with a warning.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_heatwave_ac',
    category: 'life',
    gates: { minAge: 20, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const repair = cost(S, 500);
      return {
        key: 'ev_life_heatwave_ac', category: 'life',
        title: 'The Hottest Week, No Cooling',
        text: `A heatwave has settled over ${S.city} and your air conditioning has chosen this exact week to die. Inside the flat it is hotter than outside, the fan just pushes warm air around, and sleep is impossible. A technician can come for ${formatMoney(repair, S.country)}.`,
        choices: [
          { label: `Get the AC fixed now (${formatMoney(repair, S.country)})`, effect: (st) => {
              walletMove(st, -repair, 'Air conditioning repair in a heatwave', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              recordJournal(st, `Your air conditioning died in a heatwave; you paid ${formatMoney(repair, st.country)} to fix it.`, 'life');
          } },
          { label: 'Endure it with cold showers and wet towels', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              recordJournal(st, `Your air conditioning died in a heatwave and you endured it with cold showers and wet towels.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_cold_snap_heater',
    category: 'life',
    gates: { minAge: 20, maxAge: 80, hasHome: true, excludeCountries: ['sau', 'uae'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const repair = cost(S, 350);
      return {
        key: 'ev_life_cold_snap_heater', category: 'life',
        title: 'The Heater Quits in the Cold',
        text: `A cold snap has hit ${S.city} and your heater has stopped working. You can see your breath in the living room, the pipes are at risk, and every blanket in the house is already on the bed. A repairman can come for ${formatMoney(repair, S.country)}.`,
        choices: [
          { label: `Call the repairman (${formatMoney(repair, S.country)})`, effect: (st) => {
              walletMove(st, -repair, 'Heater repair in a cold snap', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `Your heater quit in a cold snap; you paid ${formatMoney(repair, st.country)} to fix it.`, 'life');
          } },
          { label: 'Layer up and wait for the cold to pass', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `Your heater quit in a cold snap and you layered up and waited it out, shivering.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_mosquito_night',
    category: 'life',
    gates: { minAge: 10, maxAge: 80 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_mosquito_night', category: 'life',
        title: 'One Mosquito, All Night',
        text: `A single mosquito has got into your bedroom in ${S.city}. It whines past your ear, you swat at the dark, it comes back. By 3 a.m. you have three bites on your arm and no sleep.`,
        choices: [
          { label: 'Get up, hunt it down, and win', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `A mosquito kept you awake half the night in ${st.city}; you got up and hunted it down.`, 'life');
          } },
          { label: 'Pull the blanket over your head and suffer', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `A mosquito whined around your ear all night in ${st.city} and you barely slept.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_toothache',
    category: 'life',
    gates: { minAge: 16, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dentist = cost(S, 400);
      return {
        key: 'ev_life_toothache', category: 'life',
        title: 'A Tooth That Will Not Let You Sleep',
        text: `A back tooth has started throbbing, sharp and deep, and it is worse at night. Cold water makes it sing. A dentist in ${S.city} can see you tomorrow for ${formatMoney(dentist, S.country)} — or you could wait and hope it settles.`,
        choices: [
          { label: `See the dentist tomorrow (${formatMoney(dentist, S.country)})`, effect: (st) => {
              walletMove(st, -dentist, 'Dentist — aching tooth', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              recordJournal(st, `A throbbing tooth drove you to the dentist in ${st.city}; you paid ${formatMoney(dentist, st.country)} and the pain stopped.`, 'life');
          } },
          { label: 'Wait it out with painkillers', effect: (st) => {
              walletMove(st, -cost(st, 30), 'Painkillers for a toothache', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `You tried to wait out a bad toothache with painkillers. It did not settle.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_headache_pharmacy',
    category: 'life',
    gates: { minAge: 16, maxAge: 80 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_headache_pharmacy', category: 'life',
        title: 'A Headache That Will Not Shift',
        text: `A dull headache has been sitting behind your eyes since lunchtime in ${S.city}. Screens make it worse, light makes it worse, and you still have things to do today.`,
        choices: [
          { label: 'Take painkillers and a proper rest', effect: (st) => {
              walletMove(st, -cost(st, 20), 'Painkillers', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `A stubborn headache sent you to the pharmacy; you rested and it finally lifted.`, 'life');
          } },
          { label: 'Push through it', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `You pushed through a bad headache all day in ${st.city} and felt worse for it.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_stained_shirt',
    category: 'life',
    gates: { minAge: 18, maxAge: 65, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_stained_shirt', category: 'life',
        title: 'Coffee on Your Shirt Before a Meeting',
        text: `You are about to walk into an important meeting when you look down: a coffee stain, right in the middle of your shirt, from the cup you grabbed on the way in. There is no time to go home and change.`,
        choices: [
          { label: 'Own it with a joke and carry on', effect: (st) => {
              st.skills.charisma = clamp(st.skills.charisma + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) + 2);
              recordJournal(st, `You walked into a meeting with a coffee stain on your shirt and joked about it. Nobody cared.`, 'life');
          } },
          { label: 'Hide behind your jacket all meeting', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You spent a whole meeting hiding a coffee stain under your jacket.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_alarm_fails_work',
    category: 'life',
    gates: { minAge: 18, maxAge: 65, hasJob: true },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_alarm_fails_work', category: 'life',
        title: 'The Alarm That Never Rang',
        text: `You wake up in a panic: sunlight is already pouring through the window, your alarm never rang, and you are an hour late for work. Your phone shows the alarm was set — but on silent.`,
        choices: [
          { label: 'Rush in, apologise, and work through lunch', effect: (st) => {
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `Your alarm never rang and you rushed into work an hour late, apologising and working through lunch.`, 'life');
          } },
          { label: 'Call in and say you are unwell', effect: (st) => {
              st.values.integrity = clamp(st.values.integrity - 5);
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) - 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `Your alarm never rang, so you called in sick rather than admit you had overslept.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_oversleep_weekend',
    category: 'life',
    gates: { minAge: 18, maxAge: 70 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_oversleep_weekend', category: 'life',
        title: 'Sleeping Until Noon',
        text: `You wake up on a Saturday to find it is already noon. The whole morning is gone — the market is closing, the sun is high, and you have slept through the best part of the day in ${S.city}.`,
        choices: [
          { label: 'Enjoy it — you clearly needed the sleep', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You slept until noon on a Saturday and decided you had clearly needed it.`, 'life');
          } },
          { label: 'Feel guilty and rush to do everything at once', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You slept until noon on a Saturday and spent the rest of the day rushing to catch up.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_dream_home',
    category: 'life',
    gates: { requiredPeople: ['mom'], minAge: 25, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_dream_home', category: 'life',
        title: 'A Dream About the Old House',
        text: `Last night you dreamt you were a child again, walking through the rooms of your childhood home in ${S.city}. You woke up with the smell of your mother's cooking in your nose and a strange ache in your chest.`,
        choices: [
          { label: 'Call your mother and tell her about it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Called to share a dream about the old house.', { affection: 6, trust: 4 });
              recordJournal(st, `You dreamt of your childhood home and called your mother to tell her about it.`, 'life');
          } },
          { label: 'Shake it off and get on with the day', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 1);
              recordJournal(st, `You dreamt of your childhood home and shook it off before breakfast.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_old_song',
    category: 'life',
    gates: { minAge: 25, maxAge: 80 },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_old_song', category: 'life',
        title: 'A Song From Years Ago',
        text: `A song comes on the radio in ${S.city} that you have not heard in years — one from when you were young, tied to a summer and people you barely think about any more. For a moment you are right back there.`,
        choices: [
          { label: 'Turn it up and let the memory sit', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `An old song on the radio took you straight back to a summer from years ago.`, 'life');
          } },
          { label: 'Change the station — the past is the past', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `An old song came on the radio and you changed the station.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_lottery_win_small',
    category: 'life',
    gates: { minAge: 18, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const ticket = cost(S, 20);
      const win = cost(S, 300);
      return {
        key: 'ev_life_lottery_win_small', category: 'life',
        title: 'A Small Win',
        text: `On a whim you buy a lottery ticket at a kiosk in ${S.city} for ${formatMoney(ticket, S.country)}. That evening you check the numbers — and you have actually won something: ${formatMoney(win, S.country)}. Not life-changing, but real.`,
        choices: [
          { label: 'Pocket the win and buy another ticket', effect: (st) => {
              walletMove(st, win - ticket, 'Small lottery win, minus a new ticket', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You won ${formatMoney(win, st.country)} on a lottery ticket in ${st.city} and bought another one with the excitement.`, 'life');
          } },
          { label: 'Pocket the win and stop while you are ahead', effect: (st) => {
              walletMove(st, win - ticket, 'Small lottery win', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.skills.financialIq = clamp(st.skills.financialIq + 2);
              recordJournal(st, `You won ${formatMoney(win, st.country)} on a lottery ticket and stopped while you were ahead.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_lottery_nothing',
    category: 'life',
    gates: { minAge: 18, maxAge: 80 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const ticket = cost(S, 20);
      return {
        key: 'ev_life_lottery_nothing', category: 'life',
        title: 'Numbers That Mean Nothing',
        text: `You buy a lottery ticket in ${S.city} for ${formatMoney(ticket, S.country)} and spend the evening half-dreaming about what you would do with a fortune. The draw comes: not a single number matches.`,
        choices: [
          { label: 'Laugh it off — it was only a ticket', effect: (st) => {
              walletMove(st, -ticket, 'Lottery ticket', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `You bought a lottery ticket in ${st.city} and matched nothing at all.`, 'life');
          } },
          { label: 'Buy another — your luck has to turn', effect: (st) => {
              walletMove(st, -ticket * 2, 'Two lottery tickets', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              st.skills.financialIq = clamp(st.skills.financialIq - 2);
              recordJournal(st, `Your lottery ticket lost, so you bought two more. They lost too.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_charity_door',
    category: 'life',
    gates: { minAge: 18, maxAge: 75 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const give = cost(S, 50);
      return {
        key: 'ev_life_charity_door', category: 'life',
        title: 'A Collector at the Door',
        text: `A young volunteer knocks on your door in ${S.city}, collecting for a children's hospital. She is polite, tired, and clearly on her fiftieth door of the day. She asks if you can spare anything at all.`,
        choices: [
          { label: `Give ${formatMoney(give, S.country)}`, effect: (st) => {
              walletMove(st, -give, 'Donation to a children\'s hospital collection', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.values.integrity = clamp(st.values.integrity + 3);
              recordJournal(st, `You gave ${formatMoney(give, st.country)} to a volunteer collecting for a children's hospital.`, 'life');
          } },
          { label: 'Say sorry, not today', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You turned away a volunteer collecting for a children's hospital at your door.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_blood_donation',
    category: 'life',
    gates: { minAge: 18, maxAge: 60, minYear: 1980 },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_blood_donation', category: 'life',
        title: 'The Blood Donation Van',
        text: `A blood donation van is parked outside the community centre in ${S.city}, with a small queue and a nurse calling for donors. The hospital is short this month, she says, and one donation can help three people.`,
        choices: [
          { label: 'Roll up your sleeve and donate', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.values.integrity = clamp(st.values.integrity + 4);
              st.reputation = clamp(st.reputation + 3);
              recordJournal(st, `You gave blood at the donation van in ${st.city}. The nurse said the hospital was short this month.`, 'life');
          } },
          { label: 'Walk past — needles are not for you', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `You walked past the blood donation van in ${st.city}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_voting_day',
    category: 'life',
    gates: { minAge: 18, maxAge: 85, minYear: 1970 },
    repeatable: true, cooldownYears: 4,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_voting_day', category: 'life',
        title: 'Election Day',
        text: `It is election day in ${getCountry(S.country).name}. Posters cover every wall in ${S.city}, and the polling station at the school has a steady queue. Your name is on the roll, and the ballot is waiting.`,
        choices: [
          { label: 'Go and vote', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.values.integrity = clamp(st.values.integrity + 2);
              st.reputation = clamp(st.reputation + 2);
              recordJournal(st, `You queued at the school in ${st.city} and voted on election day.`, 'life');
          } },
          { label: 'Stay home — it changes nothing', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              st.values.integrity = clamp(st.values.integrity - 2);
              recordJournal(st, `You stayed home on election day and did not vote.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_local_match',
    category: 'life',
    gates: { minAge: 12, maxAge: 70 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const ticket = cost(S, 30);
      return {
        key: 'ev_life_local_match', category: 'life',
        title: 'The Neighbourhood Match',
        text: `Your local team is playing a derby at the ground near your home in ${S.city}, and the whole street is buzzing. Tickets at the gate are ${formatMoney(ticket, S.country)}, and the crowd is already singing.`,
        choices: [
          { label: `Go and cheer them on (${formatMoney(ticket, S.country)})`, effect: (st) => {
              walletMove(st, -ticket, 'Ticket to the local football match', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You went to the neighbourhood derby in ${st.city} and sang with the crowd.`, 'life');
          } },
          { label: 'Listen to it from your window', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 1);
              recordJournal(st, `You listened to the neighbourhood derby from your window in ${st.city}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_street_festival',
    category: 'life',
    gates: { minAge: 12, maxAge: 75 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spend = cost(S, 80);
      return {
        key: 'ev_life_street_festival', category: 'life',
        title: 'A Festival in Your Street',
        text: `Your street in ${S.city} is closed to cars today for a festival — stalls selling food, children running between tables, music from a speaker tied to a lamppost. The smell of grilling meat drifts through the whole neighbourhood.`,
        choices: [
          { label: `Spend the afternoon there (${formatMoney(spend, S.country)})`, effect: (st) => {
              walletMove(st, -spend, 'Street festival food and stalls', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You spent the afternoon at the street festival in ${st.city}, eating from the stalls and talking to neighbours.`, 'life');
          } },
          { label: 'Watch from your balcony', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You watched the street festival in ${st.city} from your balcony.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_birthday_forgotten',
    category: 'life',
    gates: { minAge: 16, maxAge: 80 },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_birthday_forgotten', category: 'life',
        title: 'A Birthday Nobody Mentioned',
        text: `It is your birthday, and by evening nobody has mentioned it. No call, no message, no cake. You check your phone again, just in case. Nothing. The day is nearly over.`,
        choices: [
          { label: 'Treat yourself — a good dinner, on your own terms', effect: (st) => {
              walletMove(st, -cost(st, 150), 'Birthday dinner for yourself', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `Nobody remembered your birthday, so you took yourself out for a good dinner.`, 'life');
          } },
          { label: 'Sit with the sting and say nothing', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `Nobody remembered your birthday this year, and you said nothing about it.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_birthday_surprise',
    category: 'life',
    gates: { requiredPeople: ['mom'], minAge: 16, maxAge: 80 },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_birthday_surprise', category: 'life',
        title: 'A Birthday Surprise',
        text: `You walk through your front door in ${S.city} and the lights are off — then they snap on, and a room full of people shouts your name. There is a cake, there are balloons, and ${p.mom ? nm(p.mom, 'your mother') : 'your mother'} is already filming.`,
        choices: [
          { label: 'Laugh, hug everyone, and enjoy it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              if (p.mom) rememberDeed(st, p.mom, 'gift', 'Threw a surprise birthday party.', { affection: 8, trust: 4 });
              recordJournal(st, `Your family threw you a surprise birthday party at home in ${st.city}.`, 'life');
          } },
          { label: 'Play along, though surprises make you nervous', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your family threw you a surprise birthday party. You smiled through it, though surprises make you nervous.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_first_grey_hair',
    category: 'life',
    gates: { minAge: 35, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_first_grey_hair', category: 'life',
        title: 'The First Grey Hair',
        text: `You catch yourself in the mirror this morning and there it is — a single grey hair, right at the front, catching the light. You pull it out, then immediately wonder if that was the right thing to do.`,
        choices: [
          { label: 'Laugh — it was bound to happen', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You found your first grey hair in the mirror and laughed about it.`, 'life');
          } },
          { label: 'Stare at it for a while, feeling older', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You found your first grey hair and spent a long time staring at it in the mirror.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_reading_glasses',
    category: 'life',
    gates: { minAge: 40, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const glasses = cost(S, 250);
      return {
        key: 'ev_life_reading_glasses', category: 'life',
        title: 'The Print Keeps Getting Smaller',
        text: `You have started holding menus and newspapers at arm's length to read them, and it is not working any more. The optician in ${S.city} says you need reading glasses — ${formatMoney(glasses, S.country)} for a decent pair.`,
        choices: [
          { label: `Buy the reading glasses (${formatMoney(glasses, S.country)})`, effect: (st) => {
              walletMove(st, -glasses, 'Reading glasses', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health + 2);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You finally admitted you need reading glasses and bought a pair for ${formatMoney(glasses, st.country)}.`, 'life');
          } },
          { label: 'Keep squinting — glasses are for old people', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You refused reading glasses and kept squinting at menus at arm's length.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_bad_mattress',
    category: 'life',
    gates: { minAge: 35, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      // v2.7: the mattress is the cheapest real mattress in the shop
      // catalogue (covers and protectors excluded), at its real shop price.
      const mattressItem = cheapestShopItem(S, it => /mattress/i.test(it.name) && !/cover|protector/i.test(it.name));
      const mattress = mattressItem ? shopItemPriceLocal(S, mattressItem) : cost(S, 1500);
      return {
        key: 'ev_life_bad_mattress', category: 'life',
        title: 'Waking Up With a Bad Back',
        text: `You have woken up with a stiff, aching back three mornings in a row. Your mattress in ${S.city} has a dip in the middle you can feel with your hand, and it is older than you want to admit. A decent replacement — a ${mattressItem ? `${mattressItem.brand} ${mattressItem.name}` : 'new mattress'} from the shop — costs ${formatMoney(mattress, S.country)}.`,
        choices: [
          { label: `Buy a new mattress (${formatMoney(mattress, S.country)})`, available: (st) => st.money.cash >= mattress, effect: (st) => {
              const res = mattressItem
                ? buyShopItemForEvent(st, mattressItem, { label: `New ${mattressItem.brand} ${mattressItem.name} (shop catalogue)` })
                : { ok: false, msg: 'No mattress in the shop catalogue.' };
              if (res.ok) {
                st.player.vitals.health = clamp(st.player.vitals.health + 5);
                st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
                recordJournal(st, `Your old mattress was wrecking your back, so you bought a new ${mattressItem.brand} ${mattressItem.name} for ${formatMoney(res.priceLocal, st.country)}. It is now on your bed.`, 'life');
              } else {
                recordJournal(st, `You wanted a new mattress but could not pay for it (${res.msg}).`, 'life');
              }
          } },
          { label: 'Flip it over and hope for the best', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your mattress was wrecking your back; you flipped it over and hoped for the best.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_neighbour_food',
    category: 'life',
    gates: { minAge: 18, maxAge: 80, hasHome: true },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_neighbour_food', category: 'life',
        title: 'A Plate From Next Door',
        text: `Your neighbour knocks and holds out a plate of food, still warm, covered in foil. "We made too much," she says, though the portion looks deliberate. It smells wonderful.`,
        choices: [
          { label: 'Accept gratefully and eat it tonight', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.reputation = clamp(st.reputation + 2);
              recordJournal(st, `Your neighbour brought over a plate of food, still warm, just because.`, 'life');
          } },
          { label: 'Accept — and return the plate tomorrow full of something of yours', effect: (st) => {
              walletMove(st, -cost(st, 60), 'Food to return the neighbour\'s kindness', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.reputation = clamp(st.reputation + 4);
              recordJournal(st, `Your neighbour brought you food, so you returned the plate full of something you had cooked.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_lift_stuck',
    category: 'life',
    gates: { minAge: 18, maxAge: 70, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_lift_stuck', category: 'life',
        title: 'Stuck Between Floors',
        text: `The lift in your building in ${S.city} jerks, groans, and stops between floors. The lights flicker but stay on. You are alone in the small metal box, and the emergency button is right there.`,
        choices: [
          { label: 'Press the alarm and wait calmly', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `You got stuck in the lift between floors and waited calmly for the alarm to bring help.`, 'life');
          } },
          { label: 'Pry at the doors and shout for help', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 7);
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              recordJournal(st, `You got stuck in the lift and panicked, prying at the doors and shouting until someone heard.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_water_cut',
    category: 'life',
    gates: { requiredPeople: ['friend'], minAge: 18, maxAge: 80, hasHome: true },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_water_cut', category: 'life',
        title: 'No Water Today',
        text: `You turn on the tap in the morning and nothing comes out — not a drop. A notice in the building says the water is cut for repairs all day. The bottles you have will need to last until evening.`,
        choices: [
          { label: 'Buy bottled water and manage carefully', effect: (st) => {
              walletMove(st, -cost(st, 40), 'Bottled water during a water cut', 'money');
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `The water was cut all day in your building; you bought bottled water and managed carefully.`, 'life');
          } },
          { label: 'Shower at a friend\'s place and wait it out', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Let you shower at their place during a water cut.', { affection: 4, trust: 4 });
              recordJournal(st, `With the water cut all day, you showered at ${p.friend ? nm(p.friend, 'a friend') + '\'s' : 'a friend\'s'} place.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_street_works',
    category: 'life',
    gates: { minAge: 18, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_street_works', category: 'life',
        title: 'The Street Is Torn Up',
        text: `Roadworks have torn up your whole street in ${S.city} — jackhammers from 7 a.m., dust on every windowsill, and your car parked three streets away. The sign says three weeks. It has already been two.`,
        choices: [
          { label: 'Complain to the council office', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `Roadworks tore up your street for weeks; you went to the council office to complain.`, 'life');
          } },
          { label: 'Endure it — the street needs the work', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Roadworks tore up your street for weeks and you endured the dust and the noise.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_old_neighbour_moves',
    category: 'life',
    gates: { minAge: 25, maxAge: 80, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_old_neighbour_moves', category: 'life',
        title: 'The Old Neighbour Moves Away',
        text: `The elderly neighbour who has lived across the hall for as long as you can remember is moving away to live with her daughter. She knocks on your door with a small box of her things she wants you to have, and tears in her eyes.`,
        choices: [
          { label: 'Help her carry boxes and say a proper goodbye', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.values.integrity = clamp(st.values.integrity + 3);
              st.reputation = clamp(st.reputation + 3);
              recordJournal(st, `Your elderly neighbour moved away to live with her daughter; you helped her carry boxes and said a proper goodbye.`, 'life');
          } },
          { label: 'Wave from your doorway and let her go', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `Your elderly neighbour moved away and you only waved from your doorway.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_new_year_resolution',
    category: 'life',
    gates: { minAge: 18, maxAge: 70 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_new_year_resolution', category: 'life',
        title: 'A Resolution for the New Year',
        text: `The new year has begun in ${S.city}, and everyone is talking about resolutions. Yours has been the same for three years running — and you have never kept it past February. This year feels different. Or does it?`,
        choices: [
          { label: 'Commit properly this time — daily walks and less spending', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 3);
              st.skills.financialIq = clamp(st.skills.financialIq + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You made a proper New Year resolution: daily walks and less spending — and meant it this time.`, 'life');
          } },
          { label: 'Skip resolutions — they never stick', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 1);
              recordJournal(st, `You skipped New Year resolutions entirely this year.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_winter_holiday_lights',
    category: 'life',
    gates: { minAge: 12, maxAge: 80, countries: ['gbr', 'usa', 'can', 'deu', 'fra', 'ita', 'nld', 'che', 'swe', 'aus'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_winter_holiday_lights', category: 'life',
        title: 'Lights in the Winter Dark',
        text: `The high street in ${S.city} has put up its winter lights, and the shop windows are full of decorations. Families are out in coats and scarves, and the smell of roasted chestnuts drifts from a stall on the corner.`,
        choices: [
          { label: 'Walk the lit street and take it in', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You walked the winter-lit high street in ${st.city} and took in the decorations.`, 'life');
          } },
          { label: 'Stay in — the cold is not worth it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.player.vitals.health = clamp(st.player.vitals.health + 1);
              recordJournal(st, `You stayed in while the winter lights went up on the high street in ${st.city}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_ramadan_prep',
    category: 'life',
    gates: { requiredPeople: ['mom'], minAge: 14, maxAge: 80, countries: ['egy', 'sau', 'uae'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_ramadan_prep', category: 'life',
        title: 'Lanterns Before Ramadan',
        text: `Ramadan is days away in ${S.city}, and the streets are filling with lanterns and lights. Your mother is already planning the first iftar, and the shops are packed with dates, drinks, and decorations.`,
        choices: [
          { label: 'Help your mother prepare the first iftar', effect: (st) => {
              walletMove(st, -cost(st, 200), 'Food for the first iftar', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Helped prepare the first iftar of Ramadan.', { affection: 8, trust: 5 });
              recordJournal(st, `You helped your mother prepare the first iftar of Ramadan in ${st.city}.`, 'life');
          } },
          { label: 'Buy lanterns for the house', effect: (st) => {
              walletMove(st, -cost(st, 150), 'Ramadan lanterns', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You bought lanterns to decorate the house for Ramadan in ${st.city}.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_found_old_letter',
    category: 'life',
    gates: { minAge: 25, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_found_old_letter', category: 'life',
        title: 'A Letter You Never Sent',
        text: `Inside an old school book you find a letter you wrote years ago and never sent — to a friend you lost touch with, full of plans you both made and never kept. The handwriting looks like a stranger's.`,
        choices: [
          { label: 'Try to find them and send it now, years late', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.skills.charisma = clamp(st.skills.charisma + 3);
              recordJournal(st, `You found a letter you wrote years ago and never sent — and decided to track the friend down and send it now.`, 'life');
          } },
          { label: 'Fold it away and keep it as a memory', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 1);
              recordJournal(st, `You found an old letter you never sent and folded it away again.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_childhood_toy',
    category: 'life',
    gates: { minAge: 25, maxAge: 80 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_childhood_toy', category: 'life',
        title: 'A Toy From Childhood',
        text: `At the back of a cupboard you find a toy from your childhood — worn, missing a piece, but unmistakable. You used to carry it everywhere. Holding it now, you can almost hear the house you grew up in.`,
        choices: [
          { label: 'Keep it on a shelf where you can see it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You found a worn toy from your childhood and put it on a shelf where you can see it.`, 'life');
          } },
          { label: 'Throw it away — you are not a child any more', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `You found a toy from your childhood and threw it away.`, 'life');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_life_dog_barking',
    category: 'life',
    gates: { minAge: 18, maxAge: 80, hasHome: true },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_life_dog_barking', category: 'life',
        title: 'A Dog That Barks All Night',
        text: `The neighbour's dog has been barking since midnight, sharp and endless. You have work in the morning, and every time it stops you hold your breath — then it starts again.`,
        choices: [
          { label: 'Talk to the neighbour about it tomorrow, calmly', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              st.skills.charisma = clamp(st.skills.charisma + 3);
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              recordJournal(st, `The neighbour's dog barked all night; you spoke to them calmly about it the next day.`, 'life');
          } },
          { label: 'Suffer in silence and buy earplugs', effect: (st) => {
              walletMove(st, -cost(st, 20), 'Earplugs', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `The neighbour's dog barked all night and you suffered in silence with earplugs.`, 'life');
          } },
        ],
      };
    },
  },
  /* ============================ FAMILY ============================ */
  {
    id: 'ev_family_dad_loan_request',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 22, maxAge: 65, wealth: ['poor', 'middle'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const ask = cost(S, 1500);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_loan_request', category: 'family',
        title: `${dadName} Asks for Help`,
        text: `${dadName} calls you in the evening, and it takes him a while to get to the point. The shop has had a bad month, a supplier needs paying, and he is short ${formatMoney(ask, S.country)}. He hates asking — you can hear it in his voice.`,
        choices: [
          { label: `Lend him ${formatMoney(ask, S.country)}`, effect: (st) => {
              walletMove(st, -ask, `Loan to ${dadName}`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'helped_money', `Lent ${dadName} ${formatMoney(ask, st.country)} when his shop was short.`, { affection: 10, trust: 8, respect: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `Your father asked to borrow ${formatMoney(ask, st.country)} for his shop, and you lent it to him without hesitation.`, 'family');
          } },
          { label: 'Say you cannot spare it right now', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'refused_help', 'Could not lend money when his shop was short.', { affection: -8, trust: -6, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `Your father asked to borrow money for his shop and you had to say you could not spare it. He said he understood.`, 'family');
          } },
          { label: `Lend half — ${formatMoney(Math.round(ask / 2), S.country)}`, effect: (st) => {
              walletMove(st, -Math.round(ask / 2), `Part-loan to ${dadName}`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'helped_money', 'Lent half of what he asked for.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `Your father asked to borrow ${formatMoney(ask, st.country)}; you lent him half.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_loan_repaid',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 22, afterEvent: 'ev_family_dad_loan_request', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const back = cost(S, 1500);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_loan_repaid', category: 'family',
        title: `${dadName} Pays You Back`,
        text: `${dadName} comes to your door with an envelope. The shop had a good month, he says, and he is returning the money you lent him — every note of it, plus a little extra "for the trouble". He looks ten years younger.`,
        choices: [
          { label: 'Take it back and thank him', effect: (st) => {
              walletMove(st, back, `Loan repaid by ${dadName}`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'kept_promise', 'Repaid the loan in full.', { affection: 8, trust: 10, respect: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `Your father came to your door and repaid the money you had lent him, in full.`, 'family');
          } },
          { label: 'Refuse the extra — take only what you lent', effect: (st) => {
              walletMove(st, back, `Loan repaid by ${dadName}`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'kept_promise', 'Repaid the loan; you refused the extra.', { affection: 10, trust: 8, respect: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `Your father repaid your loan with a little extra; you took only what you had lent.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_loan_unpaid',
    category: 'family',
    /* v2.15 W5 — mutually exclusive with the repaid branch: once your
       father has repaid the loan, the unpaid-loan story cannot also
       happen. The engine's resolved-chain refusal is the second lock. */
    gates: { requiredPeople: ['dad'], minAge: 22, afterEvent: 'ev_family_dad_loan_request', afterEventMinTurns: 18, notAfterEvent: 'ev_family_dad_loan_repaid' },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_loan_unpaid', category: 'family',
        title: 'The Loan Is Still Unpaid',
        text: `It has been over a year since you lent ${dadName} money for his shop, and he has not mentioned it since. He changes the subject whenever money comes up. The silence between you is starting to feel heavier than the money itself.`,
        choices: [
          { label: 'Tell him to forget it — family comes first', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'helped_money', 'Forgave the unpaid loan.', { affection: 8, trust: 6, resentment: -8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You told your father to forget the money you had lent him. The relief on his face was worth more than the loan.`, 'family');
          } },
          { label: 'Ask him plainly when he can pay it back', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'broke_promise', 'Pressed him about the unpaid loan.', { affection: -6, trust: -4, resentment: 8 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `You asked your father plainly when he could repay the loan. The conversation went cold.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_call_more',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 18, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_call_more', category: 'family',
        title: `${momName} Misses Your Voice`,
        text: `${momName} calls you on a quiet evening. She does not ask for anything — she just wants to talk. After a while she says, softly, "You don't call as much as you used to. I worry when I don't hear from you."`,
        choices: [
          { label: 'Promise to call every week — and mean it', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'kept_promise', 'Promised to call every week.', { affection: 10, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `Your mother said she misses your voice; you promised to call every week.`, 'family');
          } },
          { label: 'Say you have just been busy — it is nothing personal', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Brushed off her wish for more calls.', { affection: -6, trust: -4, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your mother said she misses your voice; you told her you had just been busy.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_birthday_forgot',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 18, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_birthday_forgot', category: 'family',
        title: `You Forgot ${momName}'s Birthday`,
        text: `You are scrolling through your phone in the evening when you see the date — and your stomach drops. It was ${momName}'s birthday today, and you did not call, did not send anything, did not even remember until now.`,
        choices: [
          { label: 'Call her right now and apologise properly', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Forgot her birthday, then called to apologise.', { affection: -3, trust: 2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You forgot your mother's birthday and called late in the evening to apologise. She said it was fine. It was not quite fine.`, 'family');
          } },
          { label: 'Send a gift tomorrow and pretend you planned it', effect: (st) => {
              walletMove(st, -cost(st, 300), 'Late birthday gift for mother', 'money');
              if (p.mom) rememberDeed(st, p.mom, 'gift', 'Sent a late birthday gift.', { affection: 4, trust: 2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You forgot your mother's birthday and sent a gift the next day, pretending you had planned it.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_favourite_meal',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 10, maxAge: 70 },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_favourite_meal', category: 'family',
        title: `${momName}'s Cooking`,
        text: `${momName} has spent the whole afternoon in the kitchen making your favourite meal — the one she only cooks when she wants to say something without words. The smell reaches you from the hallway, and the table is already set.`,
        choices: [
          { label: 'Sit down and eat like you mean it', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              st.player.vitals.health = clamp(st.player.vitals.health + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              if (p.mom) rememberDeed(st, p.mom, 'gift', 'Cooked your favourite meal.', { affection: 8, trust: 4 });
              recordJournal(st, `Your mother cooked your favourite meal and you sat down and ate like you meant it.`, 'family');
          } },
          { label: 'Eat quickly — you have somewhere to be', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Rushed through a meal she spent hours cooking.', { affection: -5, trust: -3, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your mother cooked your favourite meal and you ate it in a hurry, on your way out.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_health_scare',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 25, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_dad_health_scare', category: 'family',
        title: `A Call About ${dadName}`,
        text: `${momName} calls you, her voice tight: ${dadName} felt a pain in his chest this afternoon and is at the hospital for tests. The doctors say it might be nothing — or it might not be. She is trying not to cry on the phone.`,
        choices: [
          { label: 'Drop everything and go to the hospital', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Came to the hospital at once.', { affection: 10, trust: 8 });
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Came to the hospital at once.', { affection: 8, trust: 6 });
              recordJournal(st, `Your father was taken to hospital with chest pain; you dropped everything and went straight there.`, 'family');
          } },
          { label: 'Wait for the test results before going', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 7);
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Waited for test results instead of coming.', { affection: -6, trust: -5, resentment: 5 });
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Waited instead of coming to the hospital.', { affection: -5, trust: -4 });
              recordJournal(st, `Your father was taken to hospital with chest pain and you waited for the test results before going.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_health_followup',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 25, afterEvent: 'ev_family_dad_health_scare', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_health_followup', category: 'family',
        title: `${dadName}'s Test Results`,
        text: `The hospital calls with ${dadName}'s test results. The doctors found nothing urgent — a warning, they call it — but he must change how he eats, how he works, and how much he worries. He is already arguing that he feels fine.`,
        choices: [
          { label: 'Sit him down and make a real plan with him', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Made a health plan with him after the scare.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `Your father's tests came back clear but with a warning; you sat down and made a real health plan with him.`, 'family');
          } },
          { label: 'Let it go — he says he feels fine', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Let the health warning slide.', { affection: -3, trust: -3 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your father's tests came back with a warning, but he said he felt fine and you let it go.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_retires',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 30, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_retires', category: 'family',
        title: `${dadName}'s Last Day at Work`,
        text: `${dadName} has worked for decades, and today is his last day. His colleagues gave him a small party and a gift he did not want to talk about. Tonight he sits at home, quiet, unsure what a man does with himself when there is no work to go to.`,
        choices: [
          { label: 'Take him out to celebrate properly', effect: (st) => {
              walletMove(st, -cost(st, 400), 'Dinner to celebrate father\'s retirement', 'money');
              if (p.dad) rememberDeed(st, p.dad, 'proud_moment', 'Celebrated his retirement properly.', { affection: 10, trust: 6, respect: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `Your father retired after decades of work; you took him out to celebrate properly.`, 'family');
          } },
          { label: 'Help him plan what comes next — a hobby, a routine', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Helped him plan life after retirement.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `Your father retired and did not know what to do with himself; you helped him plan what comes next.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_wants_grandkids',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 25, maxAge: 45, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_wants_grandkids', category: 'family',
        title: `${momName} Asks About Grandchildren`,
        text: `Over tea, ${momName} looks at you and then at your spouse, and asks the question she has been holding back for a year: "So... when will I have a grandchild to hold?" She tries to make it sound like a joke. It does not quite land as one.`,
        choices: [
          { label: 'Tell her honestly — you are not ready yet', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'broke_promise', 'Said grandchildren are not coming yet.', { affection: -4, trust: 2, resentment: 3 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `Your mother asked about grandchildren over tea; you told her honestly that you are not ready yet.`, 'family');
          } },
          { label: 'Smile and say "soon, God willing"', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'kept_promise', 'Said grandchildren are coming soon.', { affection: 5, trust: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `Your mother asked about grandchildren; you smiled and said soon, God willing.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_tuition',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 22, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const fee = cost(S, 2000);
      return {
        key: 'ev_family_sib_tuition', category: 'family',
        title: `${sibName} Needs Tuition Money`,
        text: `${sibName} has been accepted into a good programme, but the fees are more than the family can manage this year — ${formatMoney(fee, S.country)} for the first term alone. They are too proud to ask directly, so your mother asks for them.`,
        choices: [
          { label: `Pay the first term (${formatMoney(fee, S.country)})`, effect: (st) => {
              walletMove(st, -fee, `Tuition for ${sibName}`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Paid their first term of tuition.', { affection: 12, trust: 10, respect: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You paid ${formatMoney(fee, st.country)} for ${sibName}'s first term of tuition.`, 'family');
          } },
          { label: 'Say the family will have to find another way', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'refused_help', 'Would not help with tuition fees.', { affection: -10, trust: -8, resentment: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${sibName} needed tuition money and you said the family would have to find another way.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_borrow_car',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, maxAge: 60, hasCar: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      return {
        key: 'ev_family_sib_borrow_car', category: 'family',
        title: `${sibName} Wants the Car for the Weekend`,
        text: `${sibName} calls: they have a trip planned for the weekend and their own car is in the garage. Can they borrow yours? They promise to bring it back with a full tank and not a scratch — a promise they have made before.`,
        choices: [
          { label: 'Hand over the keys', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Lent them the car for the weekend.', { affection: 6, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You lent your car to ${sibName} for the weekend.`, 'family');
          } },
          { label: 'Say no — you need it yourself', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'refused_help', 'Would not lend the car.', { affection: -5, trust: -4, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `You said no when ${sibName} asked to borrow your car for the weekend.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_engaged',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 18, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      return {
        key: 'ev_family_sib_engaged', category: 'family',
        title: `${sibName} Is Getting Engaged`,
        text: `${sibName} arrives at the family home beaming, barely able to get the words out: they are engaged. The ring is shown around the table three times, your mother is already crying, and your father is asking about the other family.`,
        choices: [
          { label: 'Celebrate properly — dinner on you tonight', effect: (st) => {
              walletMove(st, -cost(st, 300), 'Celebration dinner for sibling\'s engagement', 'money');
              if (p.sib) rememberDeed(st, p.sib, 'proud_moment', 'Celebrated their engagement properly.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${sibName} announced their engagement at the family home; you took everyone out to celebrate.`, 'family');
          } },
          { label: 'Congratulate them warmly and ask about the plans', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'proud_moment', 'Shared in their engagement news.', { affection: 7, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `${sibName} announced their engagement; you congratulated them and asked all about the plans.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_wedding',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 18, afterEvent: 'ev_family_sib_engaged', afterEventMinTurns: 12 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const gift = cost(S, 500);
      return {
        key: 'ev_family_sib_wedding', category: 'family',
        title: `${sibName}'s Wedding Day`,
        text: `The day has come: ${sibName} is getting married. The hall is full, the music is loud, and your mother has been crying since the morning. As the eldest present, people keep looking to you — and the gift you bring matters.`,
        choices: [
          { label: `Give a generous wedding gift (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, `Wedding gift for ${sibName}`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'gift', 'Gave a generous wedding gift.', { affection: 12, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `You gave ${sibName} a generous wedding gift of ${formatMoney(gift, st.country)} on their wedding day.`, 'family');
          } },
          { label: 'Give a modest gift and your full presence', effect: (st) => {
              walletMove(st, -cost(st, 150), `Wedding gift for ${sibName}`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'gift', 'Gave a modest wedding gift and stayed all night.', { affection: 7, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You gave ${sibName} a modest wedding gift and stayed dancing until the end of the night.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_lost_job',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 22, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const help = cost(S, 800);
      return {
        key: 'ev_family_sib_lost_job', category: 'family',
        title: `${sibName} Lost Their Job`,
        text: `${sibName} calls you late at night. They have been let go — no warning, no severance worth speaking of — and the rent is due next week. They are trying to sound calm, but their voice keeps breaking.`,
        choices: [
          { label: `Cover their rent this month (${formatMoney(help, S.country)})`, effect: (st) => {
              walletMove(st, -help, `Helped ${sibName} after job loss`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Covered their rent after they lost their job.', { affection: 12, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${sibName} lost their job; you covered their rent for the month.`, 'family');
          } },
          { label: 'Help them rewrite their CV and look for work', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'supported_crisis', 'Helped rewrite their CV after job loss.', { affection: 7, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `${sibName} lost their job; you sat down and helped them rewrite their CV and look for work.`, 'family');
          } },
          { label: 'Tell them to sort it out themselves', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'refused_help', 'Turned them away after they lost their job.', { affection: -12, trust: -10, resentment: 12 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `${sibName} lost their job and asked for help; you told them to sort it out themselves.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_moves_abroad',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      return {
        key: 'ev_family_sib_moves_abroad', category: 'family',
        title: `${sibName} Is Moving Abroad`,
        text: `${sibName} has accepted a job in another country and is leaving next month. The family gathers for a farewell dinner, and everyone is proud — but the house will feel emptier, and your mother is already counting the time zones.`,
        choices: [
          { label: 'Help them pack and plan the move', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'supported_crisis', 'Helped them pack for the move abroad.', { affection: 9, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${sibName} is moving abroad for work; you helped them pack and plan the move.`, 'family');
          } },
          { label: 'Tell them plainly you wish they were staying', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'supported_crisis', 'Said honestly they will be missed.', { affection: 6, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${sibName} is moving abroad; you told them plainly you wish they were staying.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_parents_argue',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 14, maxAge: 50 },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_parents_argue', category: 'family',
        title: 'Your Parents Are Arguing Again',
        text: `You can hear ${momName} and ${dadName} arguing in the next room — about money, as usual, voices rising and falling. The door is closed, but the house feels small tonight, and both of them will want you to agree with them later.`,
        choices: [
          { label: 'Step in and calm them both down', effect: (st) => {
              st.skills.charisma = clamp(st.skills.charisma + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Stepped in to calm a row.', { affection: 5, trust: 4 });
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Stepped in to calm a row.', { affection: 5, trust: 4 });
              recordJournal(st, `Your parents were arguing about money; you stepped in and calmed them both down.`, 'family');
          } },
          { label: 'Stay out of it and let them sort it out', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your parents were arguing in the next room and you stayed out of it.`, 'family');
          } },
          { label: 'Take your mother\'s side', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Took her side in a row.', { affection: 6, trust: 4 });
              if (p.dad) rememberDeed(st, p.dad, 'insulted', 'Took sides against him in a row.', { affection: -8, trust: -5, resentment: 8 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `Your parents were arguing and you took your mother's side. Your father did not forget it.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_parents_anniversary',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 16, maxAge: 70 },
    repeatable: true, cooldownYears: 4,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_parents_anniversary', category: 'family',
        title: `Your Parents' Anniversary`,
        text: `Today is ${momName} and ${dadName}'s wedding anniversary. They never make a fuss about it themselves, but they notice who remembers. A small gift and a phone call would mean more to them than they would ever say.`,
        choices: [
          { label: 'Take them both out for dinner', effect: (st) => {
              walletMove(st, -cost(st, 350), 'Anniversary dinner for parents', 'money');
              if (p.mom) rememberDeed(st, p.mom, 'gift', 'Took them out for their anniversary.', { affection: 8, trust: 5 });
              if (p.dad) rememberDeed(st, p.dad, 'gift', 'Took them out for their anniversary.', { affection: 8, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `You took your parents out for dinner on their wedding anniversary.`, 'family');
          } },
          { label: 'Call and wish them well', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Called on their anniversary.', { affection: 4, trust: 3 });
              if (p.dad) rememberDeed(st, p.dad, 'visited', 'Called on their anniversary.', { affection: 4, trust: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You called your parents to wish them a happy wedding anniversary.`, 'family');
          } },
          { label: 'Forget it entirely', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Forgot their wedding anniversary.', { affection: -5, trust: -3, resentment: 4 });
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Forgot their wedding anniversary.', { affection: -5, trust: -3, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You forgot your parents' wedding anniversary entirely.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dads_old_friend',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 20, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dads_old_friend', category: 'family',
        title: `${dadName}'s Old Friend Visits`,
        text: `${dadName}'s oldest friend — a man you have not seen in years — turns up at the house unannounced, full of stories about the two of them as young men. He looks at you and says, "You have your father's face, but your mother's temper, I hope."`,
        choices: [
          { label: 'Sit with them and listen to the old stories', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              if (p.dad) rememberDeed(st, p.dad, 'visited', 'Sat with his old friend and listened.', { affection: 6, trust: 4 });
              recordJournal(st, `Your father's oldest friend visited, and you sat with them listening to stories from when they were young.`, 'family');
          } },
          { label: 'Say hello and slip away', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Slipped away when his old friend visited.', { affection: -3, trust: -2 });
              recordJournal(st, `Your father's oldest friend visited; you said hello and slipped away.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_aunt_visits',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 16, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_aunt_visits', category: 'family',
        title: 'Your Aunt Arrives From Abroad',
        text: `Your aunt — ${momName}'s sister, who lives abroad — has arrived for a two-week visit, suitcases full of gifts and opinions. Within an hour she has commented on your weight, your job, your hair, and whether you are married yet.`,
        choices: [
          { label: 'Take it in good humour and enjoy her visit', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Was kind to her sister during the visit.', { affection: 5, trust: 3 });
              recordJournal(st, `Your aunt arrived from abroad for two weeks, full of gifts and opinions; you took it all in good humour.`, 'family');
          } },
          { label: 'Avoid her for the whole two weeks', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Avoided her sister the whole visit.', { affection: -4, trust: -3, resentment: 3 });
              recordJournal(st, `Your aunt visited from abroad and you avoided her for the whole two weeks.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_photo_day',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 10, maxAge: 60 },
    repeatable: true, cooldownYears: 4,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_photo_day', category: 'family',
        title: 'The Family Photograph',
        text: `${momName} has decided the family needs a proper photograph — everyone in their best clothes, standing in front of the house, no excuses. She has been planning it for a week, and today is the day.`,
        choices: [
          { label: 'Dress up and smile properly', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              if (p.mom) rememberDeed(st, p.mom, 'proud_moment', 'Posed properly for the family photograph.', { affection: 6, trust: 4 });
              recordJournal(st, `Your mother organised a proper family photograph in front of the house, and you dressed up and smiled.`, 'family');
          } },
          { label: 'Refuse — you hate photographs', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Refused to pose for the family photograph.', { affection: -5, trust: -3, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your mother wanted a proper family photograph and you refused to pose for it.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dinner_money_row',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 18, maxAge: 60, wealth: ['poor', 'middle'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dinner_money_row', category: 'family',
        title: 'A Row Over Money at Dinner',
        text: `Dinner turns sour when ${dadName} starts on about money — who earns what, who spends what, who is not pulling their weight. The words get sharper, the plates go quiet, and everyone is looking at you.`,
        choices: [
          { label: 'Stay calm and change the subject', effect: (st) => {
              st.skills.charisma = clamp(st.skills.charisma + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Calmed a dinner row about money.', { affection: 4, trust: 3 });
              recordJournal(st, `Dinner turned into a row about money; you stayed calm and changed the subject.`, 'family');
          } },
          { label: 'Answer back — you earn your share', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'insulted', 'Answered back in a row about money.', { affection: -9, trust: -6, resentment: 9 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `Dinner turned into a row about money and you answered your father back. The evening ended in silence.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_teaches_drive',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 16, maxAge: 20, hasCar: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_teaches_drive', category: 'family',
        title: `${dadName} Teaches You to Drive`,
        text: `${dadName} takes you to an empty stretch of road on the edge of ${S.city}, slides over, and says, "Your turn." His hands hover near the wheel the whole time, and he brakes with his feet on the floor every time you get close to anything.`,
        choices: [
          { label: 'Listen carefully and drive slowly', effect: (st) => {
              st.skills.charisma = clamp(st.skills.charisma + 2);
              if (p.dad) rememberDeed(st, p.dad, 'proud_moment', 'Listened and drove carefully in the first lesson.', { affection: 8, trust: 7, respect: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `Your father took you to an empty road and taught you to drive for the first time.`, 'family');
          } },
          { label: 'Show off a little — you have watched him for years', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 2);
              if (p.dad) rememberDeed(st, p.dad, 'insulted', 'Showed off in the first driving lesson.', { affection: -4, trust: -6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `Your father taught you to drive and you tried to show off. He grabbed the wheel twice.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_recipe',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 14, maxAge: 50 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_recipe', category: 'family',
        title: `${momName} Teaches You the Family Recipe`,
        text: `${momName} calls you into the kitchen and, for the first time, shows you how she makes the dish you grew up eating — no measurements, just handfuls and pinches and "you will know when it is ready". She watches your hands closely.`,
        choices: [
          { label: 'Learn it properly and write it down', effect: (st) => {
              st.skills.creativity = clamp(st.skills.creativity + 6);
              if (p.mom) rememberDeed(st, p.mom, 'proud_moment', 'Learned the family recipe properly.', { affection: 9, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `Your mother taught you the family recipe, handfuls and pinches, and you wrote it down.`, 'family');
          } },
          { label: 'Watch, but do not really pay attention', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Did not bother learning the family recipe.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `Your mother tried to teach you the family recipe and you barely paid attention.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_move_back_home',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 18, maxAge: 30 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_move_back_home', category: 'family',
        title: `${momName} Asks You to Move Back Home`,
        text: `${momName} asks, over the phone, whether you would think about moving back home for a while. The house feels empty, she says, and your old room is still your room. She does not say she is lonely. She does not have to.`,
        choices: [
          { label: 'Move back for a while — she needs you', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Moved back home when she asked.', { affection: 12, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `Your mother asked you to move back home for a while, and you did.`, 'family');
          } },
          { label: 'Say you love your own place too much to leave', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Refused to move back home.', { affection: -6, trust: -4, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your mother asked you to move back home and you said you loved your own place too much.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_parents_down_payment',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 22, maxAge: 40, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      const gift = cost(S, 5000);
      return {
        key: 'ev_family_parents_down_payment', category: 'family',
        title: `${dadName} Offers Help With a Home`,
        text: `${dadName} sits you down after dinner and says something he has clearly rehearsed: he and your mother have saved ${formatMoney(gift, S.country)}, and they want it to go toward a home of your own. "Take it," he says. "That is what it is for."`,
        choices: [
          { label: `Accept it with thanks (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, gift, `Gift from parents toward a home`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'helped_money', 'Accepted their gift toward a home.', { affection: 10, trust: 8 });
              if (p.mom) rememberDeed(st, p.mom, 'helped_money', 'Accepted their gift toward a home.', { affection: 10, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `Your parents gave you ${formatMoney(gift, st.country)} toward a home of your own.`, 'family');
          } },
          { label: 'Refuse — you want to do it yourself', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'proud_moment', 'Refused the gift, wanting to do it alone.', { affection: 5, trust: 6, respect: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your parents offered ${formatMoney(gift, st.country)} toward a home; you refused, wanting to do it yourself.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_car_breaks',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 20, maxAge: 55, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      const fix = cost(S, 700);
      return {
        key: 'ev_family_dad_car_breaks', category: 'family',
        title: `${dadName}'s Car Breaks Down`,
        text: `${dadName}'s old car has broken down again, and the garage wants ${formatMoney(fix, S.country)} to fix it. He is too proud to ask for help, but your mother mentions it — twice — in one phone call.`,
        choices: [
          { label: `Pay for the repair (${formatMoney(fix, S.country)})`, effect: (st) => {
              walletMove(st, -fix, `Repair for ${dadName}'s car`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'helped_money', 'Paid to repair his car.', { affection: 10, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `Your father's car broke down; you paid ${formatMoney(fix, st.country)} to repair it.`, 'family');
          } },
          { label: 'Lend him your car until his is fixed', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'helped_money', 'Lent their car while his was broken.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `Your father's car broke down, so you lent him yours until it was fixed.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_falls_ill',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 25, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const dadName = nm(p.dad, 'your father');
      const bill = cost(S, 1200);
      return {
        key: 'ev_family_mom_falls_ill', category: 'family',
        title: `${momName} Is in Hospital`,
        text: `${dadName} calls you in the morning: ${momName} collapsed at home and is in hospital. The doctors are running tests, and nobody will say anything definite yet. He sounds like a man holding himself together with both hands.`,
        choices: [
          { label: 'Go to the hospital and stay with her', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Came to the hospital and stayed.', { affection: 12, trust: 10 });
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Came to the hospital and stayed.', { affection: 8, trust: 6 });
              recordJournal(st, `Your mother collapsed at home and was taken to hospital; you went straight there and stayed.`, 'family');
          } },
          { label: `Pay for the best care available (${formatMoney(bill, S.country)})`, effect: (st) => {
              walletMove(st, -bill, `Hospital care for ${momName}`, 'money');
              if (p.mom) rememberDeed(st, p.mom, 'helped_money', 'Paid for the best hospital care.', { affection: 10, trust: 8 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `Your mother was taken to hospital; you paid ${formatMoney(bill, st.country)} for the best care available.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_recovery',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 25, afterEvent: 'ev_family_mom_falls_ill', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_recovery', category: 'family',
        title: `${momName} Is Coming Home`,
        text: `${momName} is well enough to come home from the hospital, but she is weak, and the doctors have given her a long list of things she must and must not do. She is already arguing that she can manage the housework herself. She cannot.`,
        choices: [
          { label: 'Arrange help at home for her recovery', effect: (st) => {
              walletMove(st, -cost(st, 500), 'Home help during mother\'s recovery', 'money');
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Arranged help at home during recovery.', { affection: 10, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `Your mother came home from hospital weak; you arranged help at home for her recovery.`, 'family');
          } },
          { label: 'Visit every day yourself instead', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Visited every day during recovery.', { affection: 12, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your mother came home from hospital; you visited every day to look after her yourself.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_birthday_gift',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 16, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      const gift = cost(S, 350);
      return {
        key: 'ev_family_dad_birthday_gift', category: 'family',
        title: `A Gift for ${dadName}`,
        text: `It is ${dadName}'s birthday, and you have no idea what to get the man who says he wants nothing. He already has everything he needs, he insists — which is what he says every year, right before he unwraps something with genuine delight.`,
        choices: [
          { label: `Buy him something good (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, `Birthday gift for ${dadName}`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'gift', 'Gave a proper birthday gift.', { affection: 9, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You bought your father a proper birthday gift for ${formatMoney(gift, st.country)}; he pretended he did not want it and loved it.`, 'family');
          } },
          { label: 'Give him a card and a long phone call', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'gift', 'Called with a birthday card.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You gave your father a card and a long birthday phone call.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_borrows_money',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const loan = cost(S, 1000);
      return {
        key: 'ev_family_sib_borrows_money', category: 'family',
        title: `${sibName} Borrows Money`,
        text: `${sibName} needs ${formatMoney(loan, S.country)} to get through the month — a bill came early, a payment came late, it happens. They promise to pay it back by next month, and they sound like they mean it.`,
        choices: [
          { label: `Lend it (${formatMoney(loan, S.country)})`, effect: (st) => {
              walletMove(st, -loan, `Loan to ${sibName}`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Lent money to get through the month.', { affection: 9, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You lent ${sibName} ${formatMoney(loan, st.country)} to get through the month.`, 'family');
          } },
          { label: 'Say no — you have your own bills', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'refused_help', 'Refused a short-term loan.', { affection: -8, trust: -7, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${sibName} asked to borrow money for the month and you said no.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_money_never_back',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, afterEvent: 'ev_family_sib_borrows_money', afterEventMinTurns: 12 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      return {
        key: 'ev_family_sib_money_never_back', category: 'family',
        title: 'The Money Never Came Back',
        text: `It has been a year since you lent ${sibName} money, and there has been no mention of paying it back — no message, no awkward joke, nothing. They have just bought themselves something expensive, and you saw it with your own eyes.`,
        choices: [
          { label: 'Ask for it back, directly', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'broke_promise', 'Pressed them about the money they never repaid.', { affection: -7, trust: -5, resentment: 9 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `A year after lending ${sibName} money, you asked for it back directly. The conversation was ugly.`, 'family');
          } },
          { label: 'Let it go — it is only money, they are family', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Forgave the loan that was never repaid.', { affection: 6, trust: 4, resentment: -6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You decided to let go of the money ${sibName} never paid back. Family is family.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_baby_born',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const gift = cost(S, 250);
      return {
        key: 'ev_family_sib_baby_born', category: 'family',
        title: `You Are an Aunt or Uncle Now`,
        text: `${sibName} calls you from the hospital, exhausted and glowing: the baby has arrived, healthy and loud. Your mother is already on her way with soup, and the whole family is talking at once. You are an aunt or uncle now.`,
        choices: [
          { label: `Visit with a gift for the baby (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, 'Gift for a newborn niece/nephew', 'money');
              if (p.sib) rememberDeed(st, p.sib, 'gift', 'Came to the hospital with a gift for the baby.', { affection: 11, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              recordJournal(st, `${sibName} had a baby; you visited the hospital with a gift and held your niece or nephew for the first time.`, 'family');
          } },
          { label: 'Call with congratulations and visit later', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'visited', 'Called to congratulate them on the baby.', { affection: 5, trust: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `${sibName} had a baby; you called with congratulations and promised to visit soon.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_parents_sell_home',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 35, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_parents_sell_home', category: 'family',
        title: 'Your Parents Are Selling the Family Home',
        text: `${momName} and ${dadName} have decided to sell the house you grew up in. It is too big for them now, they say, and the stairs are getting hard. The estate agent has already been round, and strangers will soon be walking through your childhood bedroom.`,
        choices: [
          { label: 'Help them find a smaller, comfortable place', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Helped them find a smaller home.', { affection: 8, trust: 6 });
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Helped them find a smaller home.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `Your parents decided to sell the family home; you helped them find a smaller, comfortable place.`, 'family');
          } },
          { label: 'Beg them not to sell it — it is your childhood', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'insulted', 'Begged them not to sell the house.', { affection: -4, trust: -3, resentment: 4 });
              if (p.dad) rememberDeed(st, p.dad, 'insulted', 'Begged them not to sell the house.', { affection: -4, trust: -3, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `Your parents decided to sell the family home and you begged them not to. They sold it anyway.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_parents_move_in',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 40, maxAge: 75, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_parents_move_in', category: 'family',
        title: 'Your Parents Ask to Move In With You',
        text: `${momName} and ${dadName} are finding it harder to manage on their own, and they ask — carefully, as if expecting a no — whether they could move in with you. There is a spare room, and they would not be any trouble, they promise.`,
        choices: [
          { label: 'Welcome them in — it is their right', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Welcomed them to move in.', { affection: 12, trust: 10 });
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Welcomed them to move in.', { affection: 12, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your parents asked to move in with you, and you welcomed them.`, 'family');
          } },
          { label: 'Help them find a place nearby instead', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Helped find a place nearby instead.', { affection: 5, trust: 4 });
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Helped find a place nearby instead.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `Your parents asked to move in; you helped them find a place nearby instead.`, 'family');
          } },
          { label: 'Say the house is too small — they will have to manage', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'refused_help', 'Refused to let them move in.', { affection: -10, trust: -8, resentment: 10 });
              if (p.dad) rememberDeed(st, p.dad, 'refused_help', 'Refused to let them move in.', { affection: -10, trust: -8, resentment: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              recordJournal(st, `Your parents asked to move in with you and you said the house was too small.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_vs_spouse_cooking',
    category: 'family',
    gates: { requiredPeople: ['mom', 'spouse'], minAge: 22, maxAge: 65, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_family_mom_vs_spouse_cooking', category: 'family',
        title: 'Two Cooks, One Kitchen',
        text: `${momName} is visiting, and she has taken over the kitchen — rearranging ${spName}'s cupboards, correcting their technique, tasting the sauce and adding "just a little more salt". ${spName} is smiling, but the smile is getting thinner by the minute.`,
        choices: [
          { label: 'Step in gently and give your spouse the kitchen back', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Stood up for them in their own kitchen.', { affection: 8, trust: 7 });
              if (p.mom) rememberDeed(st, p.mom, 'insulted', 'Took their side over yours in the kitchen.', { affection: -4, trust: -3, resentment: 4 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your mother took over your spouse's kitchen; you stepped in gently and gave the kitchen back.`, 'family');
          } },
          { label: 'Let your mother cook — her food is better anyway', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'proud_moment', 'Let her cook in your kitchen.', { affection: 6, trust: 4 });
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Let your mother take over their kitchen.', { affection: -6, trust: -5, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your mother took over the kitchen and you let her; your spouse went quiet for the rest of the evening.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_disapproves_career',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 18, maxAge: 32, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_disapproves_career', category: 'family',
        title: `${dadName} Disapproves of Your Job`,
        text: `Over dinner, ${dadName} says what he has been thinking for months: your job is not a real career, it will not last, and you should have studied something proper. He says it as if he is only trying to help. It does not feel like help.`,
        choices: [
          { label: 'Defend your choice calmly and lay out your plan', effect: (st) => {
              st.skills.charisma = clamp(st.skills.charisma + 4);
              if (p.dad) rememberDeed(st, p.dad, 'insulted', 'Defended their career choice against him.', { affection: -3, trust: 2, respect: 5 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your father said your job was not a real career; you defended your choice calmly and laid out your plan.`, 'family');
          } },
          { label: 'Let it slide — he will come round eventually', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your father dismissed your job as not a real career, and you let it slide.`, 'family');
          } },
          { label: 'Shout back — he has no idea what your work is', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'insulted', 'Shouted at him over their career.', { affection: -10, trust: -7, resentment: 10 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              recordJournal(st, `Your father dismissed your job and you shouted back. Dinner ended early.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_proud_promotion',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 22, maxAge: 60, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_proud_promotion', category: 'family',
        title: `${dadName} Brags About You`,
        text: `You overhear ${dadName} on the phone with a relative, telling them about your promotion — exaggerating the title slightly, inflating the salary considerably, and sounding prouder than you have ever heard him. He does not know you are listening.`,
        choices: [
          { label: 'Let him brag — it clearly makes him happy', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'proud_moment', 'Let him brag about the promotion.', { affection: 8, trust: 5, respect: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `You overheard your father bragging about your promotion on the phone, and let him.`, 'family');
          } },
          { label: 'Correct him gently — the title is not quite that grand', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'insulted', 'Corrected his bragging about the promotion.', { affection: -3, trust: -2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `You overheard your father bragging about your promotion and corrected him. He went quiet.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_weight_worry',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 25, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_weight_worry', category: 'family',
        title: `${momName} Worries About Your Health`,
        text: `${momName} looks at you over lunch and says it plainly: you have put on weight, you look tired, and she is worried about you. She says it with love, but it still stings — and part of you knows she is not wrong.`,
        choices: [
          { label: 'Take it seriously and start eating better', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 4);
              st.skills.fitness = clamp(st.skills.fitness + 3);
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Took her health worry seriously.', { affection: 6, trust: 5 });
              recordJournal(st, `Your mother worried aloud about your weight and your tiredness; you took it seriously and started eating better.`, 'family');
          } },
          { label: 'Brush it off — mothers always worry', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Brushed off her worry about their health.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `Your mother worried about your weight and your health; you brushed it off.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_eid_gathering',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 12, maxAge: 80, countries: ['egy', 'sau', 'uae'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_eid_gathering', category: 'family',
        title: 'Eid at the Family Home',
        text: `It is Eid, and the whole family is gathering at your parents' home in ${S.city}. ${momName} has been cooking since dawn, the house is full of cousins and noise, and the elders are handing out money to the children. Your place at the table is waiting.`,
        choices: [
          { label: 'Go and stay the whole day', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Came for the whole Eid day.', { affection: 8, trust: 5 });
              if (p.dad) rememberDeed(st, p.dad, 'visited', 'Came for the whole Eid day.', { affection: 8, trust: 5 });
              recordJournal(st, `You spent the whole Eid day at your parents' home in ${st.city}, with the whole family.`, 'family');
          } },
          { label: 'Visit briefly, then go home', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Came for Eid, but only briefly.', { affection: 3, trust: 2, resentment: 2 });
              recordJournal(st, `You visited your parents briefly for Eid, then went home early.`, 'family');
          } },
          { label: 'Skip it this year — you have too much on', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Skipped Eid at the family home.', { affection: -8, trust: -5, resentment: 7 });
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Skipped Eid at the family home.', { affection: -8, trust: -5, resentment: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `You skipped Eid at your parents' home this year. Your mother did not hide her disappointment.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_christmas_gathering',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 12, maxAge: 80, countries: ['gbr', 'usa', 'can', 'deu', 'fra', 'ita', 'nld', 'che', 'swe', 'aus'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_christmas_gathering', category: 'family',
        title: 'Christmas at the Family Home',
        text: `It is Christmas, and the family is gathering at your parents' home in ${S.city}. The tree is up, ${momName} has been cooking since morning, and the house smells of roast and pine. Your place at the table is waiting.`,
        choices: [
          { label: 'Go and stay the whole day', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Came for the whole Christmas day.', { affection: 8, trust: 5 });
              if (p.dad) rememberDeed(st, p.dad, 'visited', 'Came for the whole Christmas day.', { affection: 8, trust: 5 });
              recordJournal(st, `You spent the whole Christmas day at your parents' home in ${st.city}, with the whole family.`, 'family');
          } },
          { label: 'Visit briefly, then go home', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Came for Christmas, but only briefly.', { affection: 3, trust: 2, resentment: 2 });
              recordJournal(st, `You visited your parents briefly for Christmas, then went home early.`, 'family');
          } },
          { label: 'Skip it this year — you have too much on', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Skipped Christmas at the family home.', { affection: -8, trust: -5, resentment: 7 });
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Skipped Christmas at the family home.', { affection: -8, trust: -5, resentment: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `You skipped Christmas at your parents' home this year. Your mother did not hide her disappointment.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_will_discussion',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 45, maxAge: 75 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_will_discussion', category: 'family',
        title: `${dadName} Wants to Talk About the Will`,
        text: `${dadName} asks you to sit down after dinner. He wants to talk about the will — who gets the house, who gets the land, what happens when he and your mother are gone. It is a conversation he has been putting off for years, and it is not easy for anyone at the table.`,
        choices: [
          { label: 'Listen carefully and write everything down', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Listened properly about the will.', { affection: 8, trust: 10, respect: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `Your father sat you down to talk about the will; you listened carefully and wrote everything down.`, 'family');
          } },
          { label: 'Say you do not want to talk about it yet', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Refused to talk about the will.', { affection: -5, trust: -6, resentment: 4 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your father wanted to talk about the will and you said you did not want to talk about it yet.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_cousin_job_referral',
    category: 'family',
    gates: { minAge: 22, maxAge: 60, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_family_cousin_job_referral', category: 'family',
        title: 'A Cousin Asks for a Referral',
        text: `A cousin you barely see calls you out of the blue: they have applied for a job at a company like yours and want you to put in a good word. You have never worked with them, you do not know how good they are, and your name would be attached to it.`,
        choices: [
          { label: 'Put in a good word — family helps family', effect: (st) => {
              st.reputation = clamp(st.reputation + 2);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) - 2);
              recordJournal(st, `A cousin asked you to refer them for a job; you put in a good word, family helping family.`, 'family');
          } },
          { label: 'Say you cannot vouch for work you have not seen', effect: (st) => {
              st.reputation = clamp(st.reputation + 1);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `A cousin asked for a job referral and you said you could not vouch for work you had not seen.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_cousin_stay',
    category: 'family',
    gates: { minAge: 20, maxAge: 60, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      return {
        key: 'ev_family_cousin_stay', category: 'family',
        title: 'A Cousin Needs a Place to Stay',
        text: `A cousin from another city calls: they have a job interview in ${S.city} next week and nowhere to stay. Could they sleep on your sofa for a few nights? They promise to be no trouble — cousins always promise that.`,
        choices: [
          { label: 'Offer the sofa for the week', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `A cousin from another city stayed on your sofa for a week while they interviewed for jobs in ${st.city}.`, 'family');
          } },
          { label: 'Suggest a cheap hotel instead', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `A cousin asked to stay on your sofa; you suggested a cheap hotel instead.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_uncle_investment',
    category: 'family',
    gates: { minAge: 25, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const ask = cost(S, 3000);
      return {
        key: 'ev_family_uncle_investment', category: 'family',
        title: 'An Uncle With a Business Idea',
        text: `Your uncle has a business idea — a shop, in a good spot, guaranteed to make money, he says. He needs partners, and he is offering you a share for ${formatMoney(ask, S.country)}. He has had three ideas like this before. Two of them failed quietly.`,
        choices: [
          { label: `Invest ${formatMoney(ask, S.country)} — trust him`, effect: (st) => {
              walletMove(st, -ask, `Investment in uncle's shop`, 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `Your uncle pitched a shop idea and you invested ${formatMoney(ask, st.country)} in it.`, 'family');
          } },
          { label: 'Ask to see the numbers first', effect: (st) => {
              st.skills.financialIq = clamp(st.skills.financialIq + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `Your uncle pitched a shop idea; you asked to see the numbers before putting money in.`, 'family');
          } },
          { label: 'Say no — you have seen his last two ideas', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `Your uncle pitched another shop idea and you said no, remembering his last two.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_aunt_gossip',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 18, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_aunt_gossip', category: 'family',
        title: 'Your Aunt Is Talking About You',
        text: `Word gets back to you: your aunt has been telling the family that you have changed, that you think you are too good for them now, that you never visit. None of it is quite true — but she has said it to enough people that it is starting to stick.`,
        choices: [
          { label: 'Confront her calmly and ask what she meant', effect: (st) => {
              st.skills.charisma = clamp(st.skills.charisma + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Handled the aunt\'s gossip calmly.', { affection: 4, trust: 3 });
              recordJournal(st, `Your aunt had been gossiping about you to the family; you confronted her calmly and asked what she meant.`, 'family');
          } },
          { label: 'Ignore it — gossip dies on its own', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              st.reputation = clamp(st.reputation - 2);
              recordJournal(st, `Your aunt gossiped about you to the family and you ignored it.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_grandmother_visit',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 8, maxAge: 20 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_grandmother_visit', category: 'family',
        title: 'Grandmother Comes to Stay',
        text: `Your grandmother has come to stay for a week, and the house changes with her in it. She wakes early, prays, cooks too much food, and tells you stories about ${momName} as a little girl that make your mother cover her face.`,
        choices: [
          { label: 'Spend every evening listening to her stories', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Spent the week with grandmother, listening.', { affection: 6, trust: 4 });
              recordJournal(st, `Your grandmother came to stay for a week; you spent every evening listening to her stories.`, 'family');
          } },
          { label: 'Be polite but keep to your own room', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Kept to their room while grandmother visited.', { affection: -4, trust: -3 });
              recordJournal(st, `Your grandmother came to stay and you were polite but kept to your room.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_coast_trip',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 12, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      const trip = cost(S, 800);
      return {
        key: 'ev_family_coast_trip', category: 'family',
        title: 'A Family Trip to the Coast',
        text: `${dadName} suggests it out of nowhere: a few days at the coast, the whole family, like when you were small. The sea air, the long lunches, the children running on the sand. It would cost about ${formatMoney(trip, S.country)} all in.`,
        choices: [
          { label: `Say yes and pay your share (${formatMoney(trip, S.country)})`, effect: (st) => {
              walletMove(st, -trip, 'Family trip to the coast', 'money');
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 5);
              if (p.dad) rememberDeed(st, p.dad, 'proud_moment', 'Joined the family coast trip.', { affection: 8, trust: 5 });
              if (p.mom) rememberDeed(st, p.mom, 'proud_moment', 'Joined the family coast trip.', { affection: 8, trust: 5 });
              recordJournal(st, `Your father suggested a family trip to the coast; you said yes and paid your share.`, 'family');
          } },
          { label: 'Say you cannot get the time off', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Skipped the family coast trip.', { affection: -5, trust: -3, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `Your father suggested a family trip to the coast and you said you could not get the time off.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_breaks_thing',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 8, maxAge: 16 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      return {
        key: 'ev_family_sib_breaks_thing', category: 'family',
        title: `${sibName} Broke Your Favourite Thing`,
        text: `You come home to find your favourite possession — the one you saved up for, the one nobody was supposed to touch — in pieces on the floor. ${sibName} is standing over it, already starting to explain. Your parents are listening from the next room.`,
        choices: [
          { label: 'Shout — then demand they replace it', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'insulted', 'Shouted at them for breaking a favourite thing.', { affection: -8, trust: -5, resentment: 8 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `${sibName} broke your favourite possession and you shouted at them.`, 'family');
          } },
          { label: 'Forgive them — it was an accident', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'kept_promise', 'Forgave them for breaking a favourite thing.', { affection: 8, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${sibName} broke your favourite possession by accident, and you forgave them.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_covers_you',
    category: 'family',
    gates: { requiredPeople: ['mom', 'sib'], minAge: 8, maxAge: 18 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_sib_covers_you', category: 'family',
        title: `${sibName} Covers for You`,
        text: `${momName} is asking where you were last night, and the truth would mean trouble. Before you can answer, ${sibName} jumps in with a smooth lie — you were at their friend's house, studying, all evening — and looks at you to play along.`,
        choices: [
          { label: 'Play along with the lie', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'supported_crisis', 'Covered for you with their mother.', { affection: 10, trust: 10 });
              st.values.integrity = clamp(st.values.integrity - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `${sibName} covered for you when your mother asked where you had been, and you played along.`, 'family');
          } },
          { label: 'Tell the truth — do not drag them into it', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'kept_promise', 'Told the truth instead of letting them lie.', { affection: 6, trust: 8, respect: 5 });
              st.values.integrity = clamp(st.values.integrity + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${sibName} tried to cover for you with your mother, but you told the truth instead.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sneaking_out',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 13, maxAge: 17 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_sneaking_out', category: 'family',
        title: 'Caught Sneaking Back In',
        text: `You are climbing back through your bedroom window at 2 a.m. when the light clicks on. ${dadName} is sitting on your bed, fully dressed, waiting. He does not shout. He just says, "Sit down. We are going to talk about this."`,
        choices: [
          { label: 'Apologise honestly and take the punishment', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'kept_promise', 'Owned up honestly after sneaking out.', { affection: 5, trust: 8, respect: 6 });
              st.values.integrity = clamp(st.values.integrity + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `Your father caught you sneaking back in at 2 a.m.; you apologised honestly and took the punishment.`, 'family');
          } },
          { label: 'Lie and say you could not sleep, so you went for a walk', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'broke_promise', 'Lied about sneaking out.', { affection: -5, trust: -8, resentment: 5 });
              st.values.integrity = clamp(st.values.integrity - 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `Your father caught you sneaking back in at 2 a.m. and you lied about it. He did not believe you.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_finds_diary',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 12, maxAge: 16 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_finds_diary', category: 'family',
        title: `${momName} Read Your Diary`,
        text: `You come home to find your diary open on your bed — and ${momName} sitting beside it, her face a mix of worry and guilt. She has read things you never meant anyone to read, and now she wants to talk about them.`,
        choices: [
          { label: 'Shout that it was private and storm out', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'insulted', 'Shouted at her for reading their diary.', { affection: -8, trust: -6, resentment: 8 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `Your mother read your diary; you shouted that it was private and stormed out.`, 'family');
          } },
          { label: 'Talk to her — she is worried, not spying', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Talked honestly after she read the diary.', { affection: 7, trust: 9 });
              st.skills.charisma = clamp(st.skills.charisma + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `Your mother read your diary; instead of shouting, you sat down and talked to her about it.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_grounded',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 10, maxAge: 16 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_grounded', category: 'family',
        title: 'Grounded for Two Weeks',
        text: `${dadName} has grounded you for two weeks — no going out, no friends over, home straight after school. The reason, he says, is the state of your grades and your attitude. Your friends are going to the park tomorrow, and you already know you will miss it.`,
        choices: [
          { label: 'Accept it and use the time to study', effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + 4);
              st.education.academicSkill = clamp(st.education.academicSkill + 5);
              if (p.dad) rememberDeed(st, p.dad, 'kept_promise', 'Accepted being grounded and studied.', { affection: 4, trust: 6, respect: 5 });
              recordJournal(st, `Your father grounded you for two weeks; you accepted it and used the time to study.`, 'family');
          } },
          { label: 'Sneak out anyway — they will never know', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.values.integrity = clamp(st.values.integrity - 5);
              if (p.dad) rememberDeed(st, p.dad, 'broke_promise', 'Snuck out while grounded.', { affection: -5, trust: -8 });
              recordJournal(st, `Grounded for two weeks, you snuck out anyway to meet your friends.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_babysit_niece',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, maxAge: 55 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      return {
        key: 'ev_family_sib_babysit_niece', category: 'family',
        title: `${sibName} Asks You to Babysit`,
        text: `${sibName} calls with a favour: they have a wedding to go to on Saturday, and they need someone to watch the kids for the evening. "You are their favourite," they say, which is almost certainly not true — but the kids do like you.`,
        choices: [
          { label: 'Say yes — an evening with the kids', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'supported_crisis', 'Babysat the kids for an evening.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You babysat ${sibName}'s kids for an evening so they could go to a wedding.`, 'family');
          } },
          { label: 'Say no — Saturday is your only free night', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'refused_help', 'Would not babysit the kids.', { affection: -5, trust: -4, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${sibName} asked you to babysit the kids on Saturday and you said no.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_abroad_call',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 20, maxAge: 70, abroad: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_mom_abroad_call', category: 'family',
        title: `${momName} Calls From Home`,
        text: `It is late where you are and early back home when ${momName} calls. She asks about the weather, the food, whether you are eating properly — then, quietly, when you are coming home. She does not say she misses you. The whole call says it.`,
        choices: [
          { label: 'Talk for an hour — tell her everything', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Talked for an hour from abroad.', { affection: 10, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              recordJournal(st, `Your mother called from home while you live abroad; you talked for an hour and told her everything.`, 'family');
          } },
          { label: 'Keep it short — you have an early start', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Kept the call from abroad short.', { affection: -5, trust: -3, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your mother called from home and you kept it short; you had an early start.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_parcel_abroad',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 20, maxAge: 65, abroad: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      const momName = nm(p.mom, 'your mother');
      return {
        key: 'ev_family_dad_parcel_abroad', category: 'family',
        title: 'A Parcel From Home',
        text: `A parcel arrives from home, sent by ${momName} and ${dadName}: food from home, packed carefully, a little note in your mother's handwriting, and something small your father added without telling her. It smells like your childhood kitchen.`,
        choices: [
          { label: 'Call them immediately to thank them', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'gift', 'Called to thank them for the parcel.', { affection: 8, trust: 5 });
              if (p.dad) rememberDeed(st, p.dad, 'gift', 'Called to thank them for the parcel.', { affection: 8, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `Your parents sent you a parcel of food from home while you live abroad; you called them straight away to thank them.`, 'family');
          } },
          { label: 'Eat it all and forget to call', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Never called to thank them for the parcel.', { affection: -4, trust: -3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `Your parents sent you a parcel from home; you ate it all and forgot to call and thank them.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_parents_visit_abroad',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 22, maxAge: 65, abroad: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const dadName = nm(p.dad, 'your father');
      const visitCost = cost(S, 600);
      return {
        key: 'ev_family_parents_visit_abroad', category: 'family',
        title: 'Your Parents Want to Visit You Abroad',
        text: `${momName} and ${dadName} want to visit you — to see where you live, meet your friends, see your life with their own eyes. They have never flown before, and the idea of the airport terrifies your mother. The tickets and the paperwork would fall to you.`,
        choices: [
          { label: `Arrange the visit — tickets and paperwork (${formatMoney(visitCost, S.country)})`, effect: (st) => {
              walletMove(st, -visitCost, 'Parents\' visit — tickets and paperwork', 'money');
              if (p.mom) rememberDeed(st, p.mom, 'visited', 'Arranged their first visit abroad.', { affection: 12, trust: 8 });
              if (p.dad) rememberDeed(st, p.dad, 'visited', 'Arranged their first visit abroad.', { affection: 12, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              recordJournal(st, `You arranged for your parents to visit you abroad — their first time flying.`, 'family');
          } },
          { label: 'Put it off — the paperwork is too much right now', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Put off their visit abroad.', { affection: -6, trust: -4, resentment: 5 });
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Put off their visit abroad.', { affection: -6, trust: -4, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `Your parents wanted to visit you abroad and you put it off; the paperwork felt like too much.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_new_phone',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 20, maxAge: 60, minYear: 2005, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      // v2.7: the phone is the cheapest mobile actually in the shop
      // catalogue this year, at its real shop price — and it is hers
      // afterwards (the gift is recorded on her record, as before).
      const phoneItem = cheapestMobilePhone(S);
      const phone = phoneItem ? shopItemPriceLocal(S, phoneItem) : cost(S, 600);
      return {
        key: 'ev_family_mom_new_phone', category: 'family',
        title: `${momName} Wants a New Phone`,
        text: `${momName}'s phone is so old the battery dies by noon, and she can barely see the screen. She has been hinting for weeks — showing you her friends' phones, mentioning how cheap they are now — without ever quite asking you to buy her one. A ${phoneItem ? `${phoneItem.brand} ${phoneItem.name}` : 'good new phone'} from the shop costs ${formatMoney(phone, S.country)}.`,
        choices: [
          { label: `Buy her a good new phone (${formatMoney(phone, S.country)})`, available: (st) => st.money.cash >= phone, effect: (st) => {
              const res = phoneItem
                ? buyShopItemForEvent(st, phoneItem, { label: `New phone for ${momName} (shop catalogue)` })
                : { ok: false, msg: 'No phone in the shop catalogue.' };
              if (res.ok) {
                if (p.mom) rememberDeed(st, p.mom, 'gift', 'Bought her a new phone.', { affection: 10, trust: 7 });
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
                recordJournal(st, `You bought your mother a new ${phoneItem.brand} ${phoneItem.name} for ${formatMoney(res.priceLocal, st.country)}; she shows it to everyone.`, 'family');
              } else {
                recordJournal(st, `You wanted to buy your mother a new phone but could not pay for it (${res.msg}).`, 'family');
              }
          } },
          { label: 'Give her your old phone when you upgrade', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'gift', 'Gave her your old phone.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You gave your mother your old phone when you upgraded, instead of buying her a new one.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_debt_collector',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 20, maxAge: 60, wealth: ['poor', 'middle'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_debt_collector', category: 'family',
        title: 'A Man Asking About Your Father\'s Debt',
        text: `A stern man comes to the family home asking for ${dadName} — about a debt, he says, from a loan taken months ago. Your father is not home, and the man is writing down the address and looking at the house like he is measuring it.`,
        choices: [
          { label: 'Tell him to come back when your father is home', effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `A debt collector came to the family home asking for your father; you told him to come back when he was home.`, 'family');
          } },
          { label: 'Ask your father plainly what he owes, that night', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'broke_promise', 'Confronted him about the debt collector.', { affection: -4, trust: -3, resentment: 5 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.skills.financialIq = clamp(st.skills.financialIq + 3);
              recordJournal(st, `A debt collector came asking for your father; that night you asked him plainly what he owes.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_neighbour_dispute',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 25, maxAge: 70, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_neighbour_dispute', category: 'family',
        title: 'Your Parents\' Neighbour Dispute',
        text: `Your parents are in a bitter dispute with their neighbours over a shared wall and a tree that drops leaves into the wrong garden. It has gone on for months, and now they want you — the one with the calm head — to come and settle it.`,
        choices: [
          { label: 'Go and mediate properly', effect: (st) => {
              st.skills.charisma = clamp(st.skills.charisma + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Mediated the neighbour dispute.', { affection: 7, trust: 6 });
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Mediated the neighbour dispute.', { affection: 7, trust: 6 });
              recordJournal(st, `Your parents were feuding with their neighbours over a wall; you went and mediated it.`, 'family');
          } },
          { label: 'Stay out of it — it is their dispute', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Would not help with the neighbour dispute.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `Your parents were feuding with their neighbours and asked you to settle it; you stayed out of it.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_lends_car',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 18, maxAge: 35, hasCar: false },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_lends_car', category: 'family',
        title: `${dadName} Lends You His Car`,
        text: `${dadName} tosses you his car keys: his old car is yours to use for the month while he is away. "Bring it back with fuel in it," he says, "and in one piece." It is not a new car, but it is freedom with four wheels.`,
        choices: [
          { label: 'Use it carefully and return it spotless', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'kept_promise', 'Borrowed his car and returned it spotless.', { affection: 8, trust: 9, respect: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `Your father lent you his car for a month; you used it carefully and returned it spotless, with a full tank.`, 'family');
          } },
          { label: 'Drive it everywhere, hard', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'broke_promise', 'Drove his car hard and returned it dirty.', { affection: -5, trust: -7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              recordJournal(st, `Your father lent you his car for a month; you drove it hard and returned it dirty with an empty tank.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_checkup',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 30, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const check = cost(S, 300);
      return {
        key: 'ev_family_mom_checkup', category: 'family',
        title: `${momName}'s Check-Up`,
        text: `${momName} has been putting off a medical check-up for a year — she says she feels fine, and doctors only find trouble. You have booked her an appointment anyway, and now you have to convince her to actually go.`,
        choices: [
          { label: `Pay for the check-up and take her yourself (${formatMoney(check, S.country)})`, effect: (st) => {
              walletMove(st, -check, `Medical check-up for ${momName}`, 'money');
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Took her to her check-up.', { affection: 8, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You booked your mother a medical check-up, paid for it, and took her yourself.`, 'family');
          } },
          { label: 'Let her put it off — she says she feels fine', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Let her skip her check-up.', { affection: -3, trust: -3 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your mother kept putting off a medical check-up, and you let her.`, 'family');
          } },
        ],
      };
    },
  },
  /* ============================ MARRIED LIFE ============================ */
  {
    id: 'ev_marriage_forgot_anniversary',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 20, maxAge: 75, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_forgot_anniversary', category: 'marriage',
        title: 'You Forgot the Anniversary',
        text: `You wake up to a silence that feels wrong. Then it hits you: today is your wedding anniversary, and you have bought nothing, planned nothing, and ${spName} is sitting at the kitchen table with a card in front of them — from you, last year.`,
        choices: [
          { label: 'Apologise and make today count anyway', effect: (st) => {
              walletMove(st, -cost(st, 300), 'Last-minute anniversary dinner', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Forgot the anniversary, then tried to make up for it.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `You forgot your wedding anniversary; you apologised and took ${spName} out to make the day count anyway.`, 'marriage');
          } },
          { label: 'Pretend you remembered all along — bluff it', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Forgot the anniversary and bluffed about it.', { affection: -9, trust: -8, resentment: 8 });
              st.values.integrity = clamp(st.values.integrity - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `You forgot your wedding anniversary and tried to bluff your way through it. ${spName} was not fooled.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_anniversary_dinner',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 20, maxAge: 75, relationship: ['married'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const dinner = cost(S, 350);
      return {
        key: 'ev_marriage_anniversary_dinner', category: 'marriage',
        title: 'An Anniversary Worth Marking',
        text: `Your wedding anniversary is coming up, and ${spName} has been dropping hints about the restaurant you went to on your first anniversary. A table there costs about ${formatMoney(dinner, S.country)} for two — and it books out fast.`,
        choices: [
          { label: `Book the table (${formatMoney(dinner, S.country)})`, effect: (st) => {
              walletMove(st, -dinner, 'Anniversary dinner', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Booked the anniversary restaurant.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `You booked your old anniversary restaurant for two and spent the evening remembering how you got here.`, 'marriage');
          } },
          { label: 'Cook something special at home instead', effect: (st) => {
              walletMove(st, -cost(st, 120), 'Anniversary dinner at home', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Cooked a special anniversary dinner at home.', { affection: 7, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `For your anniversary you cooked something special at home for ${spName} instead of going out.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_birthday',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 20, maxAge: 75, relationship: ['married'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const gift = cost(S, 400);
      return {
        key: 'ev_marriage_spouse_birthday', category: 'marriage',
        title: `${spName}'s Birthday`,
        text: `It is ${spName}'s birthday tomorrow. They have mentioned, three times now, a thing they saw in a shop window — and they have also said, twice, that they want nothing at all. Both statements were probably true.`,
        choices: [
          { label: `Buy the thing from the shop window (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, `Birthday gift for ${spName}`, 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Bought the birthday gift they had been hinting at.', { affection: 11, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `You bought ${spName} the birthday gift they had been hinting at for weeks.`, 'marriage');
          } },
          { label: 'Give a card and a quiet day together', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Gave a card and a quiet birthday together.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `For ${spName}'s birthday you gave a card and spent a quiet day together.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_baby_question',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 38, relationship: ['married'], hasChildren: false },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_baby_question', category: 'marriage',
        title: `${spName} Asks About a Baby`,
        text: `One evening, out of nowhere, ${spName} says it: "I think I want a baby. Not someday — soon." They watch your face carefully. It is the biggest question in a marriage, asked in the smallest voice.`,
        choices: [
          { label: 'Say yes — let us try', effect: (st) => {
              st.marriage.tryingForBaby = true;
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed to try for a baby.', { affection: 12, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${spName} asked about having a baby, and you said yes — let us try.`, 'marriage');
          } },
          { label: 'Say not yet — the timing is wrong', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Said it is not yet time for a baby.', { affection: -6, trust: -4, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${spName} asked about having a baby and you said the timing is wrong.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_baby_question_followup',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 38, relationship: ['married'], afterEvent: 'ev_marriage_baby_question', afterEventMinTurns: 12 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_baby_question_followup', category: 'marriage',
        title: `${spName} Raises It Again`,
        text: `A year has passed since ${spName} first asked about a baby, and they are asking again — more directly this time. "I meant it last year," they say. "I still mean it. I need to know where you stand."`,
        choices: [
          { label: 'Say yes this time — let us try', effect: (st) => {
              st.marriage.tryingForBaby = true;
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed to try for a baby, a year later.', { affection: 10, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `${spName} asked about a baby again, a year later, and this time you said yes.`, 'marriage');
          } },
          { label: 'Say no, firmly — you are sure', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Refused a baby a second time.', { affection: -10, trust: -8, resentment: 12 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              recordJournal(st, `${spName} asked about a baby a second time and you said no, firmly. The silence afterwards was long.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_bigger_home',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 60, relationship: ['married'], hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_bigger_home', category: 'marriage',
        title: `${spName} Wants a Bigger Home`,
        text: `${spName} has started leaving property listings open on the kitchen table — bigger flats, a garden, a spare room. "We are outgrowing this place," they say, as if it is obvious. Moving would cost far more than either of you has saved.`,
        choices: [
          { label: 'Agree to start looking — slowly, properly', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed to start looking for a bigger home.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${spName} wants a bigger home; you agreed to start looking, slowly and properly.`, 'marriage');
          } },
          { label: 'Say this home is fine — moving is a fantasy', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Dismissed the idea of a bigger home.', { affection: -7, trust: -5, resentment: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName} wants a bigger home and you said this one is fine. They stopped leaving listings on the table.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_big_purchase',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const spent = cost(S, 900);
      return {
        key: 'ev_marriage_spouse_big_purchase', category: 'marriage',
        title: `${spName} Bought Something Expensive`,
        text: `You check the bank and there it is: ${formatMoney(spent, S.country)} gone, on something ${spName} bought without mentioning it. When you ask, they say they have wanted it for ages — and they thought you would say no, so they did not ask.`,
        choices: [
          { label: 'Let it go — it is their money too', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Let an expensive purchase go.', { affection: 6, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${spName} spent ${formatMoney(spent, st.country)} without telling you; you let it go.`, 'marriage');
          } },
          { label: 'Confront them — big spending needs a conversation', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'insulted', 'Confronted them over the big purchase.', { affection: -8, trust: -6, resentment: 8 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `${spName} spent ${formatMoney(spent, st.country)} without telling you, and you confronted them about it.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_gift_for_spouse',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 75, relationship: ['married'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const gift = cost(S, 250);
      return {
        key: 'ev_marriage_gift_for_spouse', category: 'marriage',
        title: 'A Gift for No Reason',
        text: `You pass a shop in ${S.city} and see something that is so clearly ${spName} that you stop walking. It costs ${formatMoney(gift, S.country)}, and there is no occasion at all — which is exactly the point.`,
        choices: [
          { label: `Buy it and surprise them tonight (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, `Surprise gift for ${spName}`, 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Bought a surprise gift for no reason.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `You bought ${spName} a surprise gift for no reason at all.`, 'marriage');
          } },
          { label: 'Admire it and keep walking', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `You saw something perfect for ${spName} in a shop window and kept walking.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_cooking',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 75, relationship: ['married'] },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_cooking', category: 'marriage',
        title: `${spName} Tries a New Recipe`,
        text: `${spName} has decided to try a complicated new recipe tonight, and the kitchen looks like a battlefield. There is flour on the floor, three pots on the stove, and a look of fierce concentration on their face. Dinner will be either wonderful or inedible.`,
        choices: [
          { label: 'Help, taste, and encourage them', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Helped with the new recipe and encouraged them.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.skills.creativity = clamp(st.skills.creativity + 2);
              recordJournal(st, `${spName} tried a complicated new recipe; you helped, tasted, and encouraged them. It turned out well.`, 'marriage');
          } },
          { label: 'Watch from the doorway and stay out of the way', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Watched from the doorway instead of helping.', { affection: -3, trust: -2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${spName} tried a new recipe and you watched from the doorway, staying out of the way.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_money_row',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 70, relationship: ['married'], wealth: ['poor', 'middle'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_money_row', category: 'marriage',
        title: 'A Row About Money',
        text: `It starts over a bill, as it always does. ${spName} says you spend without thinking; you say they worry about every note. Voices rise, old grievances come out, and suddenly you are not arguing about the bill any more — you are arguing about everything.`,
        choices: [
          { label: 'Stop, breathe, and talk about the numbers properly', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Calmed a row about money and talked numbers.', { affection: 5, trust: 7 });
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              st.skills.financialIq = clamp(st.skills.financialIq + 3);
              recordJournal(st, `You and ${spName} had a row about money; you stopped, breathed, and talked about the numbers properly.`, 'marriage');
          } },
          { label: 'Say the cruel thing you have been holding back', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'insulted', 'Said something cruel in a row about money.', { affection: -14, trust: -10, resentment: 14 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 7);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 6);
              recordJournal(st, `You and ${spName} had a row about money and you said the cruel thing you had been holding back.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_money_row_makeup',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, relationship: ['married'], afterEvent: 'ev_marriage_money_row', afterEventMinTurns: 3 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_money_row_makeup', category: 'marriage',
        title: 'After the Row About Money',
        text: `It has been days since the row about money, and the house is still quiet. ${spName} is being polite, not warm. Somebody has to break the silence first, and the longer it goes on, the heavier it gets.`,
        choices: [
          { label: 'Apologise properly and mean it', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Apologised properly after the money row.', { affection: 10, trust: 9, resentment: -10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              recordJournal(st, `After days of silence following the row about money, you apologised properly to ${spName} and meant it.`, 'marriage');
          } },
          { label: 'Wait for them to apologise first', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Waited for an apology instead of giving one.', { affection: -6, trust: -5, resentment: 6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `After the row about money, you waited for ${spName} to apologise first. The silence went on.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_inlaws_visit',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 70, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_inlaws_visit', category: 'marriage',
        title: 'Your In-Laws Are Coming to Stay',
        text: `${spName}'s parents are coming to stay for a week. They are kind people, truly — but they rearrange your kitchen, comment on your cooking, and ask, every morning, when the two of you are going to "sort out" the spare room.`,
        choices: [
          { label: 'Welcome them warmly and make space', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Welcomed their parents warmly for a week.', { affection: 9, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your in-laws came to stay for a week; you welcomed them warmly and made space.`, 'marriage');
          } },
          { label: 'Be polite, but count the days', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Counted the days while their parents stayed.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your in-laws came to stay for a week; you were polite, but you counted the days.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_mother_in_law_lovely',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 70, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_mother_in_law_lovely', category: 'marriage',
        title: 'A Kind Word From Your Mother-in-Law',
        text: `${spName}'s mother takes you aside while you are washing up together and says, quietly, that she is glad her child married you. She has never said anything like that before. She squeezes your hand and goes back to the dishes like nothing happened.`,
        choices: [
          { label: 'Thank her — it means more than she knows', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'proud_moment', 'Was kind to their mother, who praised you.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `Your mother-in-law told you quietly that she is glad her child married you.`, 'marriage');
          } },
          { label: 'Brush it off awkwardly', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.values.familyDevotion = clamp(st.values.familyDevotion - 2);
              recordJournal(st, `Your mother-in-law said she is glad her child married you, and you brushed it off awkwardly.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_family_abroad',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 65, relationship: ['married'], abroad: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_family_abroad', category: 'marriage',
        title: `${spName} Misses Home`,
        text: `${spName} has been quiet all evening, scrolling through photos of home — their family, their old street, food you cannot get here. "I miss them," they say finally. "I miss all of it. I know we chose this life, but some days it feels very far away."`,
        choices: [
          { label: 'Plan a trip home together, properly', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Planned a trip home when they were homesick.', { affection: 11, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${spName} was homesick for their family abroad; you sat down and planned a trip home together.`, 'marriage');
          } },
          { label: 'Remind them why you moved in the first place', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Dismissed their homesickness with practical reasons.', { affection: -7, trust: -5, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${spName} was homesick and you reminded them why you moved. It did not help.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_loses_job',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_loses_job', category: 'marriage',
        title: `${spName} Lost Their Job`,
        text: `${spName} comes home early, sits down, and says it in one breath: they have been let go. The company is cutting staff, it is not about their work, but that does not pay the bills. They are trying very hard not to cry in front of you.`,
        choices: [
          { label: 'Hold them and say you will get through it together', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Held them and promised to get through the job loss together.', { affection: 12, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${spName} lost their job; you held them and said you would get through it together.`, 'marriage');
          } },
          { label: 'Ask what happened — and what the plan is', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Asked about the plan after the job loss.', { affection: 3, trust: 4 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `${spName} lost their job and you asked what happened and what the plan is.`, 'marriage');
          } },
          { label: 'Panic about the money out loud', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'insulted', 'Panicked about money the day they lost their job.', { affection: -10, trust: -8, resentment: 10 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 7);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              recordJournal(st, `${spName} lost their job and you panicked about the money out loud, in front of them.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_promotion',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_promotion', category: 'marriage',
        title: `${spName} Got Promoted`,
        text: `${spName} bursts through the door with news they can barely contain: they got the promotion. The raise, the title, the recognition they have worked toward for years. They are looking at you, waiting for your reaction.`,
        choices: [
          { label: 'Celebrate like it is your own win', effect: (st) => {
              walletMove(st, -cost(st, 250), 'Celebration for spouse\'s promotion', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'proud_moment', 'Celebrated their promotion like it was shared.', { affection: 12, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              recordJournal(st, `${spName} got promoted; you celebrated like it was your own win.`, 'marriage');
          } },
          { label: 'Congratulate them — and quietly compare it to your own career', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'proud_moment', 'Congratulated them on the promotion.', { affection: 3, trust: 2, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${spName} got promoted; you congratulated them, then quietly compared it to your own career.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_wants_car',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'], hasCar: false },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_wants_car', category: 'marriage',
        title: `${spName} Wants a Car`,
        text: `${spName} has been taking the bus everywhere for a year, and today they say it plainly: they want a car of their own. Not a fancy one — just something reliable, something that means they are not waiting in the rain for a bus that never comes.`,
        choices: [
          { label: 'Start saving together for a modest car', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed to start saving for a car together.', { affection: 9, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.skills.financialIq = clamp(st.skills.financialIq + 2);
              recordJournal(st, `${spName} wants a car of their own; you agreed to start saving together for a modest one.`, 'marriage');
          } },
          { label: 'Say a car is a luxury you cannot afford yet', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Said a car is a luxury they cannot afford.', { affection: -6, trust: -4, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${spName} wants a car and you said it is a luxury you cannot afford yet.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_holiday',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'], wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const trip = cost(S, 1500);
      return {
        key: 'ev_marriage_spouse_holiday', category: 'marriage',
        title: `${spName} Suggests a Holiday`,
        text: `${spName} slides a holiday brochure across the table: a week by the sea, just the two of you, no work, no family, no obligations. It would cost about ${formatMoney(trip, S.country)}, and you have not had a proper break in a long time.`,
        choices: [
          { label: `Book it (${formatMoney(trip, S.country)})`, effect: (st) => {
              walletMove(st, -trip, 'Holiday for two by the sea', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Booked a holiday for just the two of them.', { affection: 12, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 9);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 6);
              recordJournal(st, `You and ${spName} booked a week by the sea, just the two of you.`, 'marriage');
          } },
          { label: 'Say the money should stay saved', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Said the holiday money should stay saved.', { affection: -6, trust: -4, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName} suggested a holiday by the sea and you said the money should stay saved.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_working_late',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'], hasJob: true },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_working_late', category: 'marriage',
        title: 'Home Late Again',
        text: `It is past 10 p.m. when you get home, and ${spName} is sitting in the dark living room, dinner gone cold on the table. This is the third late night this week, and they are not angry — which is worse. They are just tired of eating alone.`,
        choices: [
          { label: 'Apologise and promise to protect your evenings', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Apologised for the late nights and promised to protect evenings.', { affection: 7, trust: 7, resentment: -6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You came home late for the third night in a row; you apologised to ${spName} and promised to protect your evenings.`, 'marriage');
          } },
          { label: 'Say the work has to come first right now', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Said work has to come first.', { affection: -8, trust: -6, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `You came home late again and told ${spName} the work has to come first right now.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_date_night',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 75, relationship: ['married'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const night = cost(S, 200);
      return {
        key: 'ev_marriage_date_night', category: 'marriage',
        title: 'A Night Out, Just the Two of You',
        text: `It has been months since you and ${spName} went out alone — no family, no errands, no phones on the table. Tonight the table is free, the evening is open, and ${spName} is already dressed and waiting by the door.`,
        choices: [
          { label: `Go out — dinner and a walk (${formatMoney(night, S.country)})`, effect: (st) => {
              walletMove(st, -night, 'Date night dinner', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Went out for a proper date night.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              recordJournal(st, `You and ${spName} went out for a proper date night, just the two of you, for the first time in months.`, 'marriage');
          } },
          { label: 'Stay in — a quiet night at home is enough', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Spent a quiet night at home together.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You and ${spName} spent a quiet night at home together instead of going out.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_phone_jealousy',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 65, relationship: ['married'], minYear: 2005 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_phone_jealousy', category: 'marriage',
        title: `${spName} Reads Your Messages`,
        text: `You come back from the kitchen to find ${spName} holding your phone, scrolling through your messages. Their face is tight. "Who is this?" they ask, holding up a conversation with a colleague — friendly, frequent, and completely innocent, but it does not look that way at a glance.`,
        choices: [
          { label: 'Explain calmly — it is only a colleague', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Explained the messages calmly and honestly.', { affection: 4, trust: 6, resentment: -4 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${spName} read your messages and questioned a conversation with a colleague; you explained it calmly.`, 'marriage');
          } },
          { label: 'Explode — your phone is private', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'insulted', 'Exploded when they read the messages.', { affection: -10, trust: -9, resentment: 10 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              recordJournal(st, `${spName} read your messages and you exploded about your privacy. The argument lasted hours.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_old_flame',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 25, maxAge: 60, relationship: ['married'], minYear: 2000 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_old_flame', category: 'marriage',
        title: 'A Message From Someone You Used to Know',
        text: `A message arrives from someone you were once close to — before ${spName}, before all of this. They are in town, they say, and it would be good to catch up over coffee. Just coffee. Just an old friend. You stare at the message for a long time.`,
        choices: [
          { label: 'Tell your spouse and go together, openly', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Told them about the old flame\'s message, openly.', { affection: 6, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.values.integrity = clamp(st.values.integrity + 4);
              recordJournal(st, `An old flame messaged you out of the blue; you told ${spName} and went for coffee together, openly.`, 'marriage');
          } },
          { label: 'Go alone and say nothing', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Met an old flame secretly.', { affection: -8, trust: -12, resentment: 8 });
              st.values.integrity = clamp(st.values.integrity - 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              recordJournal(st, `An old flame messaged you; you went for coffee alone and said nothing to ${spName}.`, 'marriage');
          } },
          { label: 'Do not reply at all', effect: (st) => {
              st.values.integrity = clamp(st.values.integrity + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `An old flame messaged you out of the blue, and you did not reply.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_house_both_names',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'], hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_house_both_names', category: 'marriage',
        title: `${spName} Asks About the House Papers`,
        text: `${spName} asks, carefully, whether the house should be in both your names. They have paid toward it for years, they say, and it would feel right. It is a practical question — and also a question about trust.`,
        choices: [
          { label: 'Agree — put both names on the papers', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Put both names on the house papers.', { affection: 11, trust: 12 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `${spName} asked for the house to be in both names; you agreed and started the paperwork.`, 'marriage');
          } },
          { label: 'Say no — the house stays in your name', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Refused to put both names on the house.', { affection: -12, trust: -12, resentment: 14 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `${spName} asked for the house to be in both names and you said no.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_move_country',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 55, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_move_country', category: 'marriage',
        title: `${spName} Wants to Move Countries`,
        text: `${spName} has been offered — or is dreaming of — a life in another country: better work, better schools, a fresh start. "Think about it," they say. "Really think about it." Moving would mean leaving everything you both know.`,
        choices: [
          { label: 'Take it seriously and look into it together', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Took the idea of moving countries seriously.', { affection: 8, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${spName} raised the idea of moving to another country; you took it seriously and looked into it together.`, 'marriage');
          } },
          { label: 'Dismiss it — home is home', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Dismissed the idea of moving countries.', { affection: -8, trust: -6, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName} raised moving to another country and you dismissed it. Home is home, you said.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_alone_time',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 70, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_alone_time', category: 'marriage',
        title: `${spName} Needs Space`,
        text: `${spName} says something honest tonight: they love you, but they need some time alone — an evening to themselves, a walk, a room of their own for a while. It is not about you, they insist. It is about breathing.`,
        choices: [
          { label: 'Give them the space, gladly', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Gave them space when they asked for it.', { affection: 8, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${spName} asked for some time alone; you gave them the space, gladly.`, 'marriage');
          } },
          { label: 'Take it personally — what did you do wrong?', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Took their need for space personally.', { affection: -6, trust: -5, resentment: 6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName} asked for some time alone and you took it personally.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_ill',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 75, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_ill', category: 'marriage',
        title: `${spName} Is Unwell`,
        text: `${spName} is in bed with a fever, shivering under two blankets, too ill to get up. The house needs running, the food needs cooking, and somebody has to look after both of you today.`,
        choices: [
          { label: 'Look after them properly — soup, medicine, rest', effect: (st) => {
              walletMove(st, -cost(st, 80), 'Medicine and soup for an ill spouse', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Nursed them through a fever.', { affection: 11, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${spName} was ill with a fever; you looked after them properly — soup, medicine, rest.`, 'marriage');
          } },
          { label: 'Leave medicine by the bed and carry on with your day', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Left medicine by the bed and carried on.', { affection: -7, trust: -6, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${spName} was ill with a fever; you left medicine by the bed and carried on with your day.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_you_ill_spouse_cares',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 75, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_you_ill_spouse_cares', category: 'marriage',
        title: 'Fever, and a Hand on Your Forehead',
        text: `You wake up burning with fever, your whole body aching. ${spName} is already there — a cold cloth on your forehead, medicine and water on the bedside table, and no complaint at all about the plans they have cancelled.`,
        choices: [
          { label: 'Let them care for you and thank them properly', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 4);
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Cared for them through a fever.', { affection: 8, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You were ill with a fever and ${spName} looked after you all day without a word of complaint.`, 'marriage');
          } },
          { label: 'Insist you are fine and push them away', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 3);
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Pushed them away while ill.', { affection: -5, trust: -4, resentment: 4 });
              recordJournal(st, `You were ill with a fever and insisted you were fine, pushing ${spName} away.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_work_party',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'], hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_work_party', category: 'marriage',
        title: 'The Work Party — Plus One',
        text: `Your workplace is holding a party, and you can bring a plus-one. ${spName} is trying on outfits and asking what your colleagues are like, whether they will like them, whether they should come at all. You can tell they want to be there.`,
        choices: [
          { label: 'Take them — and introduce them proudly', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'proud_moment', 'Took them to the work party and introduced them proudly.', { affection: 9, trust: 7 });
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You took ${spName} to your work party and introduced them proudly to your colleagues.`, 'marriage');
          } },
          { label: 'Go alone — work people and home people do not mix', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Left them home from the work party.', { affection: -6, trust: -5, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You went to your work party alone and left ${spName} at home.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_wedding_album',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 30, maxAge: 80, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_wedding_album', category: 'marriage',
        title: 'The Wedding Album',
        text: `You find the wedding album at the back of a cupboard — the two of you impossibly young, your parents younger still, a day that feels both yesterday and a lifetime ago. ${spName} comes in and sits beside you, and you turn the pages together.`,
        choices: [
          { label: 'Spend the evening remembering it all', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'proud_moment', 'Looked through the wedding album together.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You found the wedding album and spent the evening turning the pages with ${spName}.`, 'marriage');
          } },
          { label: 'Close it — that was a long time ago', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Closed the wedding album without looking.', { affection: -4, trust: -3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You found the wedding album and closed it without looking through it.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_first_meeting_memory',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 25, maxAge: 80, relationship: ['married'] },
    repeatable: true, cooldownYears: 3,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_first_meeting_memory', category: 'marriage',
        title: 'Do You Remember When We Met?',
        text: `Out of nowhere, ${spName} says: "Do you remember the first time we met?" They remember the details — what you were wearing, what you said, the exact place. They are testing whether you remember it too.`,
        choices: [
          { label: 'Remember it — every detail', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'proud_moment', 'Remembered their first meeting in detail.', { affection: 9, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `${spName} asked if you remember the first time you met; you remembered every detail.`, 'marriage');
          } },
          { label: 'Admit you have forgotten the details', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Forgot the details of their first meeting.', { affection: -5, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${spName} asked if you remember the first time you met, and you admitted you had forgotten the details.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_renew_vows',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 40, maxAge: 80, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const ceremonyCost = cost(S, 800);
      return {
        key: 'ev_marriage_renew_vows', category: 'marriage',
        title: `${spName} Suggests Renewing Your Vows`,
        text: `${spName} brings it up over breakfast: after everything you have been through together, would you renew your vows? A small ceremony, family close by, no fuss — just the two of you saying it again, properly, knowing what you know now.`,
        choices: [
          { label: `Say yes — a small ceremony (${formatMoney(ceremonyCost, S.country)})`, effect: (st) => {
              walletMove(st, -ceremonyCost, 'Vow renewal ceremony', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'proud_moment', 'Renewed their vows together.', { affection: 14, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 9);
              recordJournal(st, `You and ${spName} renewed your vows in a small ceremony with family close by.`, 'marriage');
          } },
          { label: 'Say the first vows still count', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Said the first vows still count.', { affection: 4, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${spName} suggested renewing your vows; you said the first ones still count.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_separate_account',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_separate_account', category: 'marriage',
        title: `${spName} Wants Their Own Account`,
        text: `${spName} says they would like a bank account of their own — just a small one, for their own spending, without having to discuss every purchase. They say it is about independence, not secrecy. It still stings a little.`,
        choices: [
          { label: 'Agree — everyone needs some independence', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed to a separate account of their own.', { affection: 7, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${spName} wanted a bank account of their own; you agreed — everyone needs some independence.`, 'marriage');
          } },
          { label: 'Refuse — married money is shared money', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Refused a separate account.', { affection: -8, trust: -9, resentment: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName} wanted a bank account of their own and you refused; married money is shared money, you said.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_spending_habit',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'], wealth: ['middle', 'upper_middle'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_spending_habit', category: 'marriage',
        title: 'The Shopping Bags Keep Coming',
        text: `There is another shopping bag by the door, and another parcel on the table. ${spName} has been shopping a lot lately — small things, mostly, but they add up, and the month is not over yet. You have noticed. They have noticed you noticing.`,
        choices: [
          { label: 'Talk about a monthly budget together', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Sat down and agreed a monthly budget together.', { affection: 5, trust: 7 });
              st.skills.financialIq = clamp(st.skills.financialIq + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `${spName} had been shopping a lot; you sat down and agreed a monthly budget together.`, 'marriage');
          } },
          { label: 'Scold them for wasting money', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'insulted', 'Scolded them for their shopping.', { affection: -9, trust: -6, resentment: 9 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `${spName} had been shopping a lot and you scolded them for wasting money.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_quit_smoking',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 25, maxAge: 65, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_quit_smoking', category: 'marriage',
        title: `${spName} Wants to Quit Smoking`,
        text: `${spName} stubs out a cigarette and says it plainly: they want to quit. They have tried before and failed, and this time they want your help — not lectures, just help. They are already irritable at the thought of it.`,
        choices: [
          { label: 'Support them — patience, no lectures', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Supported them quitting smoking, patiently.', { affection: 9, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${spName} decided to quit smoking; you supported them with patience and no lectures.`, 'marriage');
          } },
          { label: 'Lecture them about how bad it is', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'insulted', 'Lectured them about smoking.', { affection: -7, trust: -5, resentment: 7 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${spName} wanted to quit smoking and you lectured them about how bad it is.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_couples_therapy',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 25, maxAge: 70, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const session = cost(S, 500);
      return {
        key: 'ev_marriage_couples_therapy', category: 'marriage',
        title: `${spName} Suggests Talking to Someone`,
        text: `${spName} says it carefully: maybe the two of you should talk to someone — a counsellor, a few sessions, just to learn how to hear each other again. They say it is not about blame. It is about not drifting further apart.`,
        choices: [
          { label: `Agree to try it (${formatMoney(session, S.country)} a session)`, effect: (st) => {
              walletMove(st, -session, 'Couples counselling session', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed to couples counselling.', { affection: 9, trust: 10, resentment: -6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `${spName} suggested couples counselling; you agreed to try it.`, 'marriage');
          } },
          { label: 'Refuse — strangers do not belong in a marriage', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Refused couples counselling.', { affection: -8, trust: -7, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName} suggested couples counselling and you refused; strangers do not belong in a marriage, you said.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_chores_row',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 70, relationship: ['married'] },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_chores_row', category: 'marriage',
        title: 'Who Does What Around the House',
        text: `The row starts over a sink full of dishes and ends with a list of everything each of you has done — and not done — for the last month. ${spName} says they do everything; you say that is not fair; the dishes sit there, unwashed, as evidence.`,
        choices: [
          { label: 'Do the dishes now, then split the chores fairly', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Did the dishes and agreed a fair split of chores.', { affection: 7, trust: 6, resentment: -5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You and ${spName} argued over who does the housework; you did the dishes and split the chores fairly.`, 'marriage');
          } },
          { label: 'Walk out and leave the dishes where they are', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Walked out of a row about chores.', { affection: -7, trust: -5, resentment: 7 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `You and ${spName} argued over the housework and you walked out, leaving the dishes in the sink.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_bad_day_meal',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 70, relationship: ['married'], hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_bad_day_meal', category: 'marriage',
        title: 'Your Favourite Meal After a Bad Day',
        text: `You come home after a terrible day at work, and the smell hits you before you open the door: ${spName} has cooked your favourite meal, the one that takes hours. They heard about your day from your message this morning, and they did this without being asked.`,
        choices: [
          { label: 'Thank them properly — it means everything', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Cooked your favourite meal after a bad day.', { affection: 11, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 5);
              recordJournal(st, `After a terrible day at work, you came home to find ${spName} had cooked your favourite meal.`, 'marriage');
          } },
          { label: 'Eat in silence, too tired to talk', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Ate in silence after they cooked a favourite meal.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `After a bad day, ${spName} cooked your favourite meal and you ate it in silence, too tired to talk.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_surprise_work',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'], hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_surprise_work', category: 'marriage',
        title: `${spName} Surprises You at Work`,
        text: `${spName} turns up at your workplace at lunchtime with food from your favourite place and a smile. Your colleagues are watching, charmed. You had no idea they were coming, and for a moment the whole hard week feels lighter.`,
        choices: [
          { label: 'Take the lunch break together, properly', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Surprised you at work with lunch.', { affection: 10, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) + 2);
              recordJournal(st, `${spName} surprised you at work with lunch from your favourite place.`, 'marriage');
          } },
          { label: 'Feel embarrassed and rush them out', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'insulted', 'Was embarrassed and rushed them out of the office.', { affection: -8, trust: -6, resentment: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName} surprised you at work with lunch and you felt embarrassed and rushed them out.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_forgot_birthday',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 75, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_forgot_birthday', category: 'marriage',
        title: `${spName} Forgot Your Birthday`,
        text: `Your birthday has come and gone, and ${spName} did not mention it — not a card, not a cake, not even a "happy birthday" over coffee. They look genuinely horrified when they realise, which somehow makes it both better and worse.`,
        choices: [
          { label: 'Forgive them — they clearly feel terrible', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Forgave them for forgetting the birthday.', { affection: 6, trust: 6, resentment: -4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${spName} forgot your birthday; you forgave them — they clearly felt terrible.`, 'marriage');
          } },
          { label: 'Let them feel it for a while', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Let them feel it after forgetting the birthday.', { affection: -6, trust: -4, resentment: 6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName} forgot your birthday and you let them feel it for a while.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_friends_over',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 70, relationship: ['married'], hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_friends_over', category: 'marriage',
        title: `${spName} Wants Friends Over`,
        text: `${spName} wants to invite friends over for dinner on Friday — a full table, music, the good plates. You love your friends, but the house needs cleaning, the shopping needs doing, and Friday is already busy.`,
        choices: [
          { label: 'Say yes — a full house is a happy house', effect: (st) => {
              walletMove(st, -cost(st, 250), 'Dinner for friends at home', 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'gift', 'Said yes to friends over for dinner.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `${spName} wanted friends over for dinner; you said yes, and the house was full on Friday.`, 'marriage');
          } },
          { label: 'Say not this week — it is too much', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Said no to friends over for dinner.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${spName} wanted friends over for dinner and you said not this week.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_asks_ex',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 60, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_asks_ex', category: 'marriage',
        title: `${spName} Asks About Your Past`,
        text: `Late at night, ${spName} asks about someone from before them — a name they heard from a friend, a story half-told. "Were you serious about them?" they ask. "Do you ever think about them?" The room is very quiet.`,
        choices: [
          { label: 'Answer honestly — the past is the past', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Answered honestly about their past.', { affection: 5, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.values.integrity = clamp(st.values.integrity + 3);
              recordJournal(st, `${spName} asked about someone from your past; you answered honestly.`, 'marriage');
          } },
          { label: 'Dodge the question — it does not matter now', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Dodged questions about their past.', { affection: -4, trust: -7, resentment: 4 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${spName} asked about someone from your past and you dodged the question.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_ex_contacts',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 60, relationship: ['married'], minYear: 2000 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_ex_contacts', category: 'marriage',
        title: `${spName}'s Ex Gets in Touch`,
        text: `${spName}'s former partner has sent a message out of nowhere — friendly, casual, asking how life is. ${spName} shows you the message themselves, phone held out, watching your face. "I have not replied," they say. "I wanted you to see it first."`,
        choices: [
          { label: 'Thank them for showing you — and trust them', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Showed the ex\'s message openly.', { affection: 8, trust: 11 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${spName}'s former partner got in touch; ${spName} showed you the message before replying. You thanked them and trusted them.`, 'marriage');
          } },
          { label: 'Tell them to block the number', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'insulted', 'Ordered them to block their ex.', { affection: -6, trust: -7, resentment: 6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${spName}'s former partner got in touch and you told them to block the number.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_honeymoon_memory',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 25, maxAge: 80, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_honeymoon_memory', category: 'marriage',
        title: 'Remembering the Honeymoon',
        text: `A photo from your honeymoon pops up on your phone — the two of you sunburnt and laughing, somewhere far from home, with no bills and no responsibilities. ${spName} looks at it over your shoulder and says, "We should go back. One day."`,
        choices: [
          { label: 'Promise you will go back one day', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Promised to go back to the honeymoon place one day.', { affection: 7, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `A honeymoon photo popped up; you and ${spName} promised each other you would go back one day.`, 'marriage');
          } },
          { label: 'Laugh — that life is long gone', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Laughed off the honeymoon memory.', { affection: -3, trust: -2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `A honeymoon photo popped up and you laughed — that life is long gone, you said.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_adoption',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 26, maxAge: 45, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_adoption', category: 'marriage',
        title: `${spName} Raises Adoption`,
        text: `${spName} has been reading about adoption — children waiting for a home, the long process, the checks, the waiting lists. "There are children who need a family," they say. "And we could be one." It is not a small idea, and they know it.`,
        choices: [
          { label: 'Take it seriously and learn about the process', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Took the adoption idea seriously.', { affection: 9, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.values.familyDevotion = clamp(st.values.familyDevotion + 4);
              recordJournal(st, `${spName} raised the idea of adoption; you took it seriously and started learning about the process.`, 'marriage');
          } },
          { label: 'Say you are not ready for that step', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Said they are not ready for adoption.', { affection: -5, trust: -4, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${spName} raised adoption and you said you are not ready for that step.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_parents_money',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 65, relationship: ['married'], wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const ask = cost(S, 1000);
      return {
        key: 'ev_marriage_spouse_parents_money', category: 'marriage',
        title: `${spName}'s Parents Need Money`,
        text: `${spName}'s parents are short on money this month — a bill, a repair, something they did not plan for. ${spName} asks whether you could help with ${formatMoney(ask, S.country)}. It is your shared money, and it is also their family.`,
        choices: [
          { label: `Help them (${formatMoney(ask, S.country)})`, effect: (st) => {
              walletMove(st, -ask, `Help for ${spName}'s parents`, 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'helped_money', 'Helped their parents with money.', { affection: 11, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${spName}'s parents needed money; you helped with ${formatMoney(ask, st.country)} from the shared account.`, 'marriage');
          } },
          { label: 'Say the budget does not allow it this month', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'refused_help', 'Refused to help their parents with money.', { affection: -8, trust: -7, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${spName}'s parents needed money and you said the budget does not allow it this month.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_study_again',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 25, maxAge: 42, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_study_again', category: 'marriage',
        title: `${spName} Wants to Study Again`,
        text: `${spName} has found a course — a qualification that could change their career — but it means evening classes for two years, less money coming in, and a lot of late nights. They have the application open on the laptop, waiting for your answer.`,
        choices: [
          { label: 'Support them — you will manage the money together', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Supported them going back to study.', { affection: 11, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${spName} wanted to study again for a new qualification; you supported them and said you would manage the money together.`, 'marriage');
          } },
          { label: 'Say the timing is bad — maybe in a few years', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Said the timing is bad for studying again.', { affection: -7, trust: -5, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${spName} wanted to study again and you said the timing is bad.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_driving',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 24, maxAge: 60, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      return {
        key: 'ev_marriage_spouse_driving', category: 'marriage',
        title: `${spName} Wants Driving Lessons`,
        text: `${spName} has decided it is time to learn to drive. Lessons in ${S.city} are not cheap, and they are nervous — but they are tired of depending on buses and on you for every trip across town.`,
        choices: [
          { label: 'Pay for the lessons and encourage them', effect: (st) => {
              walletMove(st, -cost(st, 600), `Driving lessons for ${spName}`, 'money');
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Paid for driving lessons and encouraged them.', { affection: 9, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You paid for driving lessons for ${spName} and encouraged them through the nerves.`, 'marriage');
          } },
          { label: 'Teach them yourself, for free', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Taught them to drive personally.', { affection: 6, trust: 5 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You decided to teach ${spName} to drive yourself, for free. It tested both of your patience.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_spouse_flirt_friend',
    category: 'marriage',
    gates: { requiredPeople: ['spouse', 'friend'], minAge: 24, maxAge: 60, relationship: ['married'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your spouse');
      const frName = nm(p.friend, 'a friend of yours');
      return {
        key: 'ev_marriage_spouse_flirt_friend', category: 'marriage',
        title: 'A Friend Flirts With Your Spouse',
        text: `At a gathering, you watch ${frName} flirt openly with ${spName} — lingering compliments, a hand on their arm, a look that lasts too long. ${spName} laughs it off and moves away, but they noticed it too, and so did you.`,
        choices: [
          { label: 'Have a quiet word with your friend later', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Had a word with the friend who flirted.', { affection: 6, trust: 8 });
              if (p.friend) rememberDeed(st, p.friend, 'insulted', 'Warned them off flirting with the spouse.', { affection: -8, trust: -7, resentment: 6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `A friend flirted openly with ${spName} at a gathering; you had a quiet word with them later.`, 'marriage');
          } },
          { label: 'Ignore it — it was probably nothing', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Ignored a friend flirting with them.', { affection: -4, trust: -4, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `A friend flirted with ${spName} at a gathering and you ignored it.`, 'marriage');
          } },
        ],
      };
    },
  },
  /* ============================ CHILDREN ============================ */
  {
    id: 'ev_child_first_word',
    category: 'children',
    gates: { requiredPeople: ['child', 'youngChild'], minAge: 22, maxAge: 45, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.youngChild || p.child, 'your little one');
      return {
        key: 'ev_child_first_word', category: 'children',
        title: `${chName}'s First Word`,
        text: `Your youngest, ${chName}, has been babbling for weeks — and then, clear as anything, out comes a real word. You freeze. Your spouse freezes. Then everyone is talking at once, trying to get them to say it again.`,
        choices: [
          { label: 'Cheer, clap, and say it back a hundred times', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 5); }
              recordJournal(st, `${chName} said their first real word today, and the whole house celebrated.`, 'children');
          } },
          { label: 'Smile quietly and write it down in the baby book', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 4); }
              recordJournal(st, `${chName} said their first real word today; you wrote it down in the baby book.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_first_school_day',
    category: 'children',
    gates: { requiredPeople: ['child', 'youngChild'], minAge: 24, maxAge: 50, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.youngChild || p.child, 'your child');
      return {
        key: 'ev_child_first_school_day', category: 'children',
        title: `${chName}'s First Day of School`,
        text: `This morning ${chName} puts on a school uniform for the first time, backpack bigger than their back, lunchbox clutched tight. At the school gate in ${S.city} they look back at you once — brave, terrified, and very small.`,
        choices: [
          { label: 'Walk them in and stay until they settle', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.rel.trust = clamp(p.child.rel.trust + 7); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 5); }
              recordJournal(st, `You walked ${chName} into school on their first day and stayed until they settled.`, 'children');
          } },
          { label: 'Drop them at the gate with a quick hug', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 3); }
              recordJournal(st, `You dropped ${chName} at the school gate on their first day with a quick hug.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_bad_grades',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 60, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_bad_grades', category: 'children',
        title: `${chName} Brings Home Bad Grades`,
        text: `${chName} comes home with a report card that is hard to look at — low marks in almost everything, and a note from the teacher asking to meet you. They are waiting for the shouting to start.`,
        choices: [
          { label: 'Sit down calmly and work out what is going wrong', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 7); p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.vitals.smarts = clamp(p.child.vitals.smarts + 3); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} brought home bad grades; you sat down calmly and worked out what was going wrong.`, 'children');
          } },
          { label: 'Shout — and take away their free time until marks improve', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 9); p.child.rel.trust = clamp(p.child.rel.trust - 6); p.child.rel.resentment = clamp(p.child.rel.resentment + 9); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 6); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `${chName} brought home bad grades and you shouted, taking away their free time until the marks improve.`, 'children');
          } },
          { label: 'Hire a tutor to help them catch up', effect: (st) => {
              walletMove(st, -cost(st, 500), `Tutor for ${chName}`, 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 5); p.child.vitals.smarts = clamp(p.child.vitals.smarts + 6); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${chName} brought home bad grades, so you hired a tutor to help them catch up.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_top_marks',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 60, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_top_marks', category: 'children',
        title: `${chName} Tops the Class`,
        text: `${chName} bursts through the door waving a report card: top marks in the class, and the teacher has written a note saying how proud they are. They are glowing, waiting for you to notice.`,
        choices: [
          { label: 'Celebrate properly — dinner out, their choice', effect: (st) => {
              walletMove(st, -cost(st, 200), 'Celebration dinner for top marks', 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 10); p.child.rel.respect = clamp(p.child.rel.respect + 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 8); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${chName} topped the class; you took them out for dinner, their choice, to celebrate.`, 'children');
          } },
          { label: 'Praise them warmly and pin the report on the fridge', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 7); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 5); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `${chName} topped the class; you praised them warmly and pinned the report on the fridge.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_wants_bicycle',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 26, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      const bike = cost(S, 400);
      return {
        key: 'ev_child_wants_bicycle', category: 'children',
        title: `${chName} Wants a Bicycle`,
        text: `${chName} has been asking for a bicycle for months — every friend has one, they say, and they have even picked the colour. A decent one costs ${formatMoney(bike, S.country)}, and they have been saving their pocket money toward it for weeks.`,
        choices: [
          { label: `Buy the bicycle (${formatMoney(bike, S.country)})`, effect: (st) => {
              walletMove(st, -bike, `Bicycle for ${chName}`, 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 11); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 9); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `You bought ${chName} the bicycle they had been asking for, for ${formatMoney(bike, st.country)}.`, 'children');
          } },
          { label: 'Make them save the rest themselves first', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 3); p.child.rel.respect = clamp(p.child.rel.respect + 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} wanted a bicycle; you made them save the rest of the money themselves first.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_wants_phone',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 30, maxAge: 55, hasChildren: true, minYear: 2007 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      // v2.7: the first phone is the cheapest mobile in the shop catalogue
      // this year, at its real shop price.
      const phoneItem = cheapestMobilePhone(S);
      const phone = phoneItem ? shopItemPriceLocal(S, phoneItem) : cost(S, 500);
      return {
        key: 'ev_child_wants_phone', category: 'children',
        title: `${chName} Wants a Phone`,
        text: `${chName} says everyone at school has a phone now, and they are the only one without one. They have a whole speech prepared about safety, homework, and how all their friends' parents said yes. A basic one — a ${phoneItem ? `${phoneItem.brand} ${phoneItem.name}` : 'basic mobile'} from the shop — costs ${formatMoney(phone, S.country)}.`,
        choices: [
          { label: `Buy a basic phone with strict rules (${formatMoney(phone, S.country)})`, available: (st) => st.money.cash >= phone, effect: (st) => {
              const res = phoneItem
                ? buyShopItemForEvent(st, phoneItem, { label: `First phone for ${chName} (shop catalogue)` })
                : { ok: false, msg: 'No phone in the shop catalogue.' };
              if (res.ok) {
                if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.rel.trust = clamp(p.child.rel.trust + 5); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 6); }
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
                recordJournal(st, `You bought ${chName} their first phone, a ${phoneItem.brand} ${phoneItem.name} for ${formatMoney(res.priceLocal, st.country)}, with strict rules about when it can be used.`, 'children');
              } else {
                recordJournal(st, `You wanted to buy ${chName} a first phone but could not pay for it (${res.msg}).`, 'children');
              }
          } },
          { label: 'Say no — they are too young for a phone', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 6); p.child.rel.resentment = clamp(p.child.rel.resentment + 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} wanted a phone like everyone at school; you said they are too young.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_wants_trainers',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 26, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      // v2.7: the trainers are real sneakers from the shop catalogue — the
      // logo pair everyone wears (Nike Air Max), and the cheaper plain pair
      // (New Balance 574) — each at its real shop price.
      const logoShoes = cheapestShopItem(S, it => it.brand === 'Nike' && /air max/i.test(it.name));
      const plainShoes = cheapestShopItem(S, it => /sneakers/i.test(it.name) && !(it.brand === 'Nike' && /air max/i.test(it.name)));
      const shoes = logoShoes ? shopItemPriceLocal(S, logoShoes) : cost(S, 350);
      const plainPrice = plainShoes ? shopItemPriceLocal(S, plainShoes) : cost(S, 150);
      return {
        key: 'ev_child_wants_trainers', category: 'children',
        title: `${chName} Wants the Expensive Trainers`,
        text: `${chName} has their heart set on a pair of trainers that cost ${formatMoney(shoes, S.country)} — the ones all their friends wear, the ones with the logo. Their current shoes are perfectly fine, which you have pointed out. Twice.`,
        choices: [
          { label: `Buy the trainers (${formatMoney(shoes, S.country)})`, available: (st) => st.money.cash >= shoes, effect: (st) => {
              const res = logoShoes
                ? buyShopItemForEvent(st, logoShoes, { label: `Trainers for ${chName} (shop catalogue)` })
                : { ok: false, msg: 'No trainers in the shop catalogue.' };
              if (res.ok) {
                if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 7); }
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
                recordJournal(st, `You bought ${chName} the expensive trainers they had been begging for — ${logoShoes.brand} ${logoShoes.name} for ${formatMoney(res.priceLocal, st.country)}.`, 'children');
              } else {
                recordJournal(st, `You wanted the expensive trainers for ${chName} but could not pay for them (${res.msg}).`, 'children');
              }
          } },
          { label: `Buy good shoes without the logo (${formatMoney(plainPrice, S.country)})`, available: (st) => st.money.cash >= plainPrice, effect: (st) => {
              const res = plainShoes
                ? buyShopItemForEvent(st, plainShoes, { label: `Shoes for ${chName} (shop catalogue)` })
                : { ok: false, msg: 'No shoes in the shop catalogue.' };
              if (res.ok) {
                if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 3); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 2); }
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
                recordJournal(st, `${chName} wanted the expensive logo trainers; you bought ${plainShoes.brand} ${plainShoes.name} without the logo instead, for ${formatMoney(res.priceLocal, st.country)}.`, 'children');
              } else {
                recordJournal(st, `You wanted plain shoes for ${chName} but could not pay for them (${res.msg}).`, 'children');
              }
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_falls_bike',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 26, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_falls_bike', category: 'children',
        title: `${chName} Falls Off the Bike`,
        text: `${chName} comes home with a grazed knee, a torn sleeve, and tears held back by sheer willpower. They fell off their bike trying to go too fast down the hill near your home, and the knee is bleeding more than it should.`,
        choices: [
          { label: 'Clean it up gently and praise their bravery', effect: (st) => {
              walletMove(st, -cost(st, 20), 'Bandages and antiseptic', 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.rel.trust = clamp(p.child.rel.trust + 7); p.child.vitals.health = clamp(p.child.vitals.health + 2); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${chName} fell off their bike and grazed their knee; you cleaned it up gently and praised their bravery.`, 'children');
          } },
          { label: 'Scold them for riding too fast', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 6); p.child.rel.trust = clamp(p.child.rel.trust - 4); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 5); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} fell off their bike and you scolded them for riding too fast, before cleaning the graze.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_fever_night',
    category: 'children',
    gates: { requiredPeople: ['child', 'youngChild'], minAge: 24, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.youngChild || p.child, 'your child');
      return {
        key: 'ev_child_fever_night', category: 'children',
        title: 'A Fever in the Night',
        text: `At 2 a.m. you wake to crying: ${chName} is burning with fever, their forehead hot to the touch. You sit up with them through the night, cool cloths and medicine, watching the thermometer and willing the number to come down.`,
        choices: [
          { label: 'Stay up all night with them', effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 9); p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.vitals.health = clamp(p.child.vitals.health + 3); }
              recordJournal(st, `${chName} burned with fever all night; you stayed up with them until it broke.`, 'children');
          } },
          { label: 'Give medicine and check every hour', effect: (st) => {
              walletMove(st, -cost(st, 25), 'Fever medicine for child', 'money');
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 5); p.child.vitals.health = clamp(p.child.vitals.health + 2); }
              recordJournal(st, `${chName} had a fever in the night; you gave medicine and checked on them every hour.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_refuses_vegetables',
    category: 'children',
    gates: { requiredPeople: ['child', 'youngChild'], minAge: 24, maxAge: 50, hasChildren: true },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.youngChild || p.child, 'your child');
      return {
        key: 'ev_child_refuses_vegetables', category: 'children',
        title: `${chName} Refuses to Eat Vegetables`,
        text: `Dinner is on the table and ${chName} has pushed the vegetables to the very edge of the plate, as far from the rest of the food as physics allows. They are not eating them. They have announced this fact with great dignity.`,
        choices: [
          { label: 'Make it a game — one bite, then a story', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 6); p.child.vitals.health = clamp(p.child.vitals.health + 2); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${chName} refused to eat their vegetables, so you turned it into a game — one bite, then a story.`, 'children');
          } },
          { label: 'Insist — no pudding until the plate is clear', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 4); p.child.rel.resentment = clamp(p.child.rel.resentment + 5); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 3); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} refused their vegetables; you insisted — no pudding until the plate is clear.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_draws_wall',
    category: 'children',
    gates: { requiredPeople: ['child', 'youngChild'], minAge: 24, maxAge: 45, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.youngChild || p.child, 'your child');
      const paint = cost(S, 150);
      return {
        key: 'ev_child_draws_wall', category: 'children',
        title: `${chName} Drew on the Wall`,
        text: `You walk into the living room and stop: ${chName} has drawn a large, colourful mural across the freshly painted wall — a house, a sun, a dog with five legs — in crayon, in permanent marker, and in what appears to be jam. They look very proud of it.`,
        choices: [
          { label: 'Laugh, photograph it, then repaint together', effect: (st) => {
              walletMove(st, -paint, 'Paint to cover a crayon mural', 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 5); p.child.vitals.smarts = clamp(p.child.vitals.smarts + 2); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${chName} drew a mural across the living room wall; you photographed it, laughed, and repainted the wall together.`, 'children');
          } },
          { label: 'Scold them — walls are not paper', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 7); p.child.rel.trust = clamp(p.child.rel.trust - 5); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 5); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${chName} drew all over the living room wall and you scolded them for it.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_where_babies',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 26, maxAge: 50, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_where_babies', category: 'children',
        title: `${chName} Asks Where Babies Come From`,
        text: `In the car, out of nowhere, ${chName} asks where babies come from. They are watching you in the mirror, waiting for a real answer — not a story about a stork, and not a change of subject.`,
        choices: [
          { label: 'Answer honestly, simply, and calmly', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 9); p.child.rel.affection = clamp(p.child.rel.affection + 5); p.child.vitals.smarts = clamp(p.child.vitals.smarts + 2); }
              st.skills.charisma = clamp(st.skills.charisma + 3);
              recordJournal(st, `${chName} asked where babies come from, and you answered honestly, simply, and calmly.`, 'children');
          } },
          { label: 'Dodge it — "Ask your mother/father"', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust - 5); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} asked where babies come from and you dodged the question.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_wants_pet',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 26, maxAge: 50, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_wants_pet', category: 'children',
        title: `${chName} Wants a Pet`,
        text: `${chName} has been begging for a pet for weeks — a cat, a dog, anything with fur. They have drawn up a rota for feeding it, walking it, cleaning up after it, and they promise, absolutely promise, that they will do all of it themselves.`,
        choices: [
          { label: 'Say not yet — a pet is a big responsibility', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 4); p.child.rel.resentment = clamp(p.child.rel.resentment + 4); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} begged for a pet; you said not yet — a pet is a big responsibility.`, 'children');
          } },
          { label: 'Agree — but only if they keep their promises', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 9); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 8); p.child.rel.respect = clamp(p.child.rel.respect + 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${chName} begged for a pet and you agreed — but only if they keep every promise on their rota.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_bullied',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_bullied', category: 'children',
        title: `${chName} Is Being Bullied`,
        text: `${chName} comes home quiet, with a torn bag and a bruise they will not explain. After a long time they tell you: older children at school have been picking on them for weeks — mocking them, taking their things, waiting by the gate.`,
        choices: [
          { label: 'Go to the school and demand action', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 10); p.child.rel.trust = clamp(p.child.rel.trust + 11); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 3); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `${chName} told you they were being bullied at school; you went to the school and demanded action.`, 'children');
          } },
          { label: 'Teach them to stand up for themselves', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 6); p.child.rel.respect = clamp(p.child.rel.respect + 5); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 2); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${chName} was being bullied at school; you taught them how to stand up for themselves.`, 'children');
          } },
          { label: 'Tell them to ignore it — bullies get bored', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 8); p.child.rel.trust = clamp(p.child.rel.trust - 9); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 7); p.child.rel.resentment = clamp(p.child.rel.resentment + 8); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} was being bullied at school and you told them to ignore it.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_bullied_followup',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true, afterEvent: 'ev_child_bullied', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_bullied_followup', category: 'children',
        title: 'How Is School Now?',
        text: `Weeks after ${chName} told you about the bullying, you ask how school is going now. They hesitate — then say it has stopped. The older children leave them alone now. Whether it was the school, or something they did themselves, the gate is no longer a place to fear.`,
        choices: [
          { label: 'Tell them how proud you are of how they handled it', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 9); p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 6); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `The bullying at school has stopped; you told ${chName} how proud you are of how they handled it.`, 'children');
          } },
          { label: 'Just nod — it is over, no need to dwell on it', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 2); p.child.rel.trust = clamp(p.child.rel.trust + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `The bullying has stopped; you nodded and moved on without dwelling on it.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_bullies_other',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_bullies_other', category: 'children',
        title: 'The School Calls About Your Child',
        text: `The school calls: ${chName} has been bullying another child — teasing them in front of the class, taking their things. The teacher is calm but firm. "We need to deal with this together," she says. Your child is waiting at home, dreading your arrival.`,
        choices: [
          { label: 'Talk to them seriously — and make them apologise', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 5); p.child.rel.respect = clamp(p.child.rel.respect + 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 2); }
              st.values.integrity = clamp(st.values.integrity + 4);
              recordJournal(st, `The school called: ${chName} had been bullying another child. You talked to them seriously and made them apologise.`, 'children');
          } },
          { label: 'Dismiss it — children are children', effect: (st) => {
              if (p.child) { p.child.rel.respect = clamp(p.child.rel.respect - 6); p.child.rel.trust = clamp(p.child.rel.trust - 3); }
              st.values.integrity = clamp(st.values.integrity - 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `The school called about ${chName} bullying another child, and you dismissed it — children are children, you said.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_wins_race',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_wins_race', category: 'children',
        title: `${chName} Wins the School Race`,
        text: `At the school sports day, ${chName} wins their race — arms pumping, face set, crossing the line first while the crowd cheers. They scan the stands for you immediately, medal already around their neck, beaming.`,
        choices: [
          { label: 'Cheer louder than anyone and hug them after', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 10); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 9); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              recordJournal(st, `${chName} won their race at sports day; you cheered louder than anyone and hugged them after.`, 'children');
          } },
          { label: 'Clap politely from the stands', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 3); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${chName} won their race at sports day; you clapped politely from the stands.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_loses_race',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_loses_race', category: 'children',
        title: `${chName} Comes Last`,
        text: `At the school sports day, ${chName} comes last in their race — well behind, red-faced, fighting tears as the other children celebrate. They walk toward you slowly, staring at the ground, waiting for disappointment.`,
        choices: [
          { label: 'Hug them and praise the effort, not the result', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 9); p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${chName} came last in their race at sports day; you hugged them and praised the effort, not the result.`, 'children');
          } },
          { label: 'Tell them to train harder next time', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 5); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 5); p.child.rel.resentment = clamp(p.child.rel.resentment + 5); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 1);
              recordJournal(st, `${chName} came last in their race and you told them to train harder next time.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teacher_praise',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_teacher_praise', category: 'children',
        title: 'A Call From the Teacher — Good News',
        text: `${chName}'s teacher calls you — not to complain, but to say something rare: your child helped a struggling classmate all term, patiently, without being asked. "You should be proud," she says. "Most children would not bother."`,
        choices: [
          { label: 'Tell your child you heard — and how proud you are', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 9); p.child.rel.respect = clamp(p.child.rel.respect + 7); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 6); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${chName}'s teacher called to say they had helped a struggling classmate all term; you told them how proud you are.`, 'children');
          } },
          { label: 'Smile and keep it to yourself', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 2); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${chName}'s teacher called with praise; you smiled and kept it to yourself.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teacher_trouble',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_teacher_trouble', category: 'children',
        title: 'A Call From the Teacher — Trouble',
        text: `${chName}'s teacher calls: your child has been disruptive in class for weeks — talking back, skipping homework, distracting others. She asks you to come in for a meeting. Your child is already in their room, door closed.`,
        choices: [
          { label: 'Go to the meeting and face it together', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 6); p.child.rel.respect = clamp(p.child.rel.respect + 5); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${chName}'s teacher called about disruptive behaviour; you went to the meeting and faced it together.`, 'children');
          } },
          { label: 'Ground them without hearing their side', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 8); p.child.rel.trust = clamp(p.child.rel.trust - 7); p.child.rel.resentment = clamp(p.child.rel.resentment + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 5); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${chName}'s teacher called about trouble in class; you grounded them without hearing their side.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_pocket_money_rise',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      const rise = cost(S, 40);
      return {
        key: 'ev_child_pocket_money_rise', category: 'children',
        title: `${chName} Asks for More Pocket Money`,
        text: `${chName} has come with a case: everything costs more now, their friends get more, and the current amount — they have worked it out to the note — is not enough. They have even written the numbers down. It is a surprisingly good argument.`,
        choices: [
          { label: `Agree to a small rise (${formatMoney(rise, S.country)} more)`, effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 7); p.child.rel.trust = clamp(p.child.rel.trust + 5); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${chName} made a case for more pocket money, and you agreed to a small rise.`, 'children');
          } },
          { label: 'Say no — learn to manage what you have', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 4); p.child.rel.resentment = clamp(p.child.rel.resentment + 4); }
              st.skills.financialIq = clamp(st.skills.financialIq + 1);
              recordJournal(st, `${chName} asked for more pocket money and you said no — learn to manage what you have.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_spends_all_sweets',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 26, maxAge: 50, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_spends_all_sweets', category: 'children',
        title: `${chName} Spends Everything on Sweets`,
        text: `${chName} got their pocket money this morning and has already spent all of it — on sweets, in one shop, in one go. Now they are asking for more, because there is a toy they want, and the money is gone.`,
        choices: [
          { label: 'No more — the lesson is the point', effect: (st) => {
              if (p.child) { p.child.rel.respect = clamp(p.child.rel.respect + 4); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 3); }
              st.skills.financialIq = clamp(st.skills.financialIq + 1);
              recordJournal(st, `${chName} spent all their pocket money on sweets in one go and asked for more; you said no — the lesson is the point.`, 'children');
          } },
          { label: 'Give them a little extra, just this once', effect: (st) => {
              walletMove(st, -cost(st, 30), 'Extra pocket money for child', 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 4); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 3); }
              recordJournal(st, `${chName} spent all their pocket money on sweets; you gave them a little extra, just this once.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_saves_for_toy',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 26, maxAge: 50, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_saves_for_toy', category: 'children',
        title: `${chName} Saves for a Toy`,
        text: `${chName} has been saving pocket money for weeks in a jar on their shelf — coins counted every night, nothing spent — and today they finally have enough for the toy they have wanted all year. They count it out on the table, proud as anything.`,
        choices: [
          { label: 'Take them to buy it today, and match their savings', effect: (st) => {
              walletMove(st, -cost(st, 100), 'Matched child\'s savings for a toy', 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 10); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 9); p.child.rel.respect = clamp(p.child.rel.respect + 5); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `${chName} saved for weeks for a toy; you took them to buy it and matched their savings.`, 'children');
          } },
          { label: 'Let them buy it with their own money alone', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 6); p.child.rel.respect = clamp(p.child.rel.respect + 7); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 7); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `${chName} saved for weeks and bought the toy with their own money alone.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teen_party',
    category: 'children',
    gates: { requiredPeople: ['child', 'teen'], minAge: 35, maxAge: 60, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.teen || p.child, 'your teenager');
      return {
        key: 'ev_child_teen_party', category: 'children',
        title: `${chName} Wants to Go to a Party`,
        text: `${chName} wants to go to a party on Friday night — at a house you do not know, with friends you have only half-met, until late. They say everyone is going, and that you are the only parent who would say no.`,
        choices: [
          { label: 'Say yes — with a time to be home and a phone call', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 7); p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 5); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} wanted to go to a party; you said yes, with a time to be home and a phone call.`, 'children');
          } },
          { label: 'Say no — you do not know the house or the people', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 7); p.child.rel.resentment = clamp(p.child.rel.resentment + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 5); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} wanted to go to a party and you said no — you do not know the house or the people.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teen_party_followup',
    category: 'children',
    gates: { requiredPeople: ['child', 'teen'], minAge: 35, maxAge: 60, hasChildren: true, afterEvent: 'ev_child_teen_party', afterEventMinTurns: 3 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.teen || p.child, 'your teenager');
      return {
        key: 'ev_child_teen_party_followup', category: 'children',
        title: 'Friday Night, After the Party',
        text: `It is past midnight on Friday and ${chName} has just come home from the party — on time, as agreed, smelling of music and other people's perfume. They are buzzing, full of stories, and they actually tell you about the night instead of disappearing upstairs.`,
        choices: [
          { label: 'Listen to the stories and thank them for keeping their word', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.rel.trust = clamp(p.child.rel.trust + 9); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `${chName} came home from the party on time and told you all about the night.`, 'children');
          } },
          { label: 'Send them straight to bed — it is late', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} came home from the party on time, buzzing with stories, and you sent them straight to bed.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teen_door_slam',
    category: 'children',
    gates: { requiredPeople: ['child', 'teen'], minAge: 35, maxAge: 60, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.teen || p.child, 'your teenager');
      return {
        key: 'ev_child_teen_door_slam', category: 'children',
        title: `${chName} Slams the Door`,
        text: `A row about nothing — a comment about their room, their phone, their attitude — ends with ${chName} storming upstairs and slamming their bedroom door so hard the pictures shake. The house goes silent. You can hear music start behind the door.`,
        choices: [
          { label: 'Give them an hour, then knock gently', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 5); p.child.rel.trust = clamp(p.child.rel.trust + 6); p.child.rel.resentment = clamp(p.child.rel.resentment - 5); }
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `${chName} slammed their door after a row; you gave them an hour, then knocked gently.`, 'children');
          } },
          { label: 'Shout through the door that slamming is not allowed', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 7); p.child.rel.resentment = clamp(p.child.rel.resentment + 8); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `${chName} slammed their door and you shouted through it that slamming is not allowed.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teen_university',
    category: 'children',
    gates: { requiredPeople: ['child', 'teen'], minAge: 38, maxAge: 62, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.teen || p.child, 'your teenager');
      return {
        key: 'ev_child_teen_university', category: 'children',
        title: `${chName} Asks About University`,
        text: `${chName} sits down with you, serious in a way you rarely see: they want to talk about university — what to study, where to go, whether the family can afford it. They have a list of courses and a list of fears, and they want your honest opinion.`,
        choices: [
          { label: 'Talk it through properly — courses, costs, all of it', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.rel.trust = clamp(p.child.rel.trust + 9); p.child.vitals.smarts = clamp(p.child.vitals.smarts + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${chName} wanted to talk about university; you talked it through properly — courses, costs, all of it.`, 'children');
          } },
          { label: 'Tell them to study something safe and practical', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 4); p.child.rel.resentment = clamp(p.child.rel.resentment + 5); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} asked about university and you told them to study something safe and practical.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teen_first_job',
    category: 'children',
    gates: { requiredPeople: ['child', 'teen'], minAge: 38, maxAge: 62, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.teen || p.child, 'your teenager');
      return {
        key: 'ev_child_teen_first_job', category: 'children',
        title: `${chName}'s First Weekend Job`,
        text: `${chName} has got their first job — weekends at a shop in ${S.city}, small pay, real hours. They come home from the first shift exhausted and proud, already talking about what they will buy with their first wages.`,
        choices: [
          { label: 'Celebrate it — their first real pay', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 7); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `${chName} got their first weekend job at a shop in ${st.city}; you celebrated their first real pay.`, 'children');
          } },
          { label: 'Warn them not to let work hurt their studies', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 2); p.child.rel.respect = clamp(p.child.rel.respect + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${chName} got their first weekend job; you warned them not to let work hurt their studies.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teen_cigarettes',
    category: 'children',
    gates: { requiredPeople: ['child', 'teen'], minAge: 38, maxAge: 62, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.teen || p.child, 'your teenager');
      return {
        key: 'ev_child_teen_cigarettes', category: 'children',
        title: 'Cigarettes in Their Jacket',
        text: `You are hanging up ${chName}'s jacket when a packet of cigarettes falls out of the pocket. They are standing in the doorway, caught, waiting to see what you will do. The packet is half empty.`,
        choices: [
          { label: 'Talk calmly about health — and ask why they started', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.rel.affection = clamp(p.child.rel.affection + 4); p.child.vitals.health = clamp(p.child.vitals.health + 2); }
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `You found cigarettes in ${chName}'s jacket; you talked calmly about health and asked why they started.`, 'children');
          } },
          { label: 'Shout and ground them for a month', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 9); p.child.rel.trust = clamp(p.child.rel.trust - 8); p.child.rel.resentment = clamp(p.child.rel.resentment + 10); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `You found cigarettes in ${chName}'s jacket and shouted, grounding them for a month.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teen_driving_lessons',
    category: 'children',
    gates: { requiredPeople: ['child', 'teen'], minAge: 40, maxAge: 65, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.teen || p.child, 'your teenager');
      const lessons = cost(S, 600);
      return {
        key: 'ev_child_teen_driving_lessons', category: 'children',
        title: `${chName} Wants Driving Lessons`,
        text: `${chName} has reached the age for driving lessons and is asking — carefully, because they know what it costs — whether you will pay. Lessons in ${S.city} run about ${formatMoney(lessons, S.country)} for a course, and all their friends are already learning.`,
        choices: [
          { label: `Pay for the lessons (${formatMoney(lessons, S.country)})`, effect: (st) => {
              walletMove(st, -lessons, `Driving lessons for ${chName}`, 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 10); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 7); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You paid ${formatMoney(lessons, st.country)} for driving lessons for ${chName}.`, 'children');
          } },
          { label: 'Split the cost — they pay half from their job', effect: (st) => {
              walletMove(st, -Math.round(lessons / 2), `Half of driving lessons for ${chName}`, 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 6); p.child.rel.respect = clamp(p.child.rel.respect + 5); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You split the cost of driving lessons with ${chName}; they paid half from their weekend job.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_adult_deposit_help',
    category: 'children',
    gates: { requiredPeople: ['child', 'adultChild'], minAge: 45, maxAge: 70, hasChildren: true, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.adultChild || p.child, 'your child');
      const help = cost(S, 4000);
      return {
        key: 'ev_child_adult_deposit_help', category: 'children',
        title: `${chName} Asks for Help With a Deposit`,
        text: `${chName} has found a place of their own and needs a deposit — ${formatMoney(help, S.country)} — to secure it. They have saved what they can, but it is not enough, and the landlord will not wait. They hate asking. They are asking anyway.`,
        choices: [
          { label: `Help with the deposit (${formatMoney(help, S.country)})`, effect: (st) => {
              walletMove(st, -help, `Deposit help for ${chName}`, 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 12); p.child.rel.trust = clamp(p.child.rel.trust + 10); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You helped ${chName} with ${formatMoney(help, st.country)} toward the deposit on their first place.`, 'children');
          } },
          { label: 'Say you cannot — they will have to wait and save', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 8); p.child.rel.trust = clamp(p.child.rel.trust - 6); p.child.rel.resentment = clamp(p.child.rel.resentment + 8); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${chName} asked for help with a deposit and you said you cannot — they will have to wait and save.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_adult_moves_out',
    category: 'children',
    gates: { requiredPeople: ['adultChild'], minAge: 45, maxAge: 70, hasChildren: true, adultChildHome:'home' },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const child=p.adultChild;
      const chName = nm(child, 'your child');
      return {
        key: 'ev_child_adult_moves_out', category: 'children',
        title: `${chName} Moves Out`,
        text: `The boxes are by the door, the room is suddenly empty, and ${chName} is standing in the hallway with their keys, ready to go. They are moving to a separate household. This does not transfer or buy a property.`,
        choices: [
          { label: 'Help them carry the boxes and hug them at the door', effect: (st) => {
              if(child){child.leftHome=true;child.householdWith=child.id;}
              if (child) { child.rel.affection = clamp(child.rel.affection + 10); child.rel.trust = clamp(child.rel.trust + 8); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} moved out into a place of their own; you helped carry the boxes and hugged them at the door.`, 'children');
          } },
          { label: 'Let them go with a wave — do not make it a scene', effect: (st) => {
              if(child){child.leftHome=true;child.householdWith=child.id;}
              if (child) { child.rel.affection = clamp(child.rel.affection + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${chName} moved out; you let them go with a wave, not wanting to make a scene.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_adult_moves_back',
    category: 'children',
    gates: { requiredPeople: ['adultChild'], minAge: 48, maxAge: 72, hasChildren: true, hasHome: true, adultChildHome:'away' },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const child=p.adultChild;
      const chName = nm(child, 'your child');
      return {
        key: 'ev_child_adult_moves_back', category: 'children',
        title: `${chName} Asks to Move Back Home`,
        text: `${chName} is at the door with a suitcase: they ask whether they can stay with you for a while. They would join your household; no property title changes.`,
        choices: [
          { label: 'Welcome them back — home is always home', effect: (st) => {
              if(child){child.leftHome=false;child.householdWith='player';child.residenceCountry=st.country;child.city=st.city;}
              if (child) { child.rel.affection = clamp(child.rel.affection + 11); child.rel.trust = clamp(child.rel.trust + 9); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} moved back into your household.`, 'children');
          } },
          { label: 'Say no — they need to stand on their own feet', effect: (st) => {
              if (child) { child.rel.affection = clamp(child.rel.affection - 11); child.rel.trust = clamp(child.rel.trust - 9); child.rel.resentment = clamp(child.rel.resentment + 11); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              recordJournal(st, `${chName} asked to move back home and you said no — they need to stand on their own feet.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_adult_engaged',
    category: 'children',
    gates: { requiredPeople: ['child', 'adultChild'], minAge: 45, maxAge: 72, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.adultChild || p.child, 'your child');
      return {
        key: 'ev_child_adult_engaged', category: 'children',
        title: `${chName} Is Getting Engaged`,
        text: `${chName} arrives with news they can barely hold in: they are engaged. They show you the ring, tell you how it happened, and ask — with a look that is half excitement and half nerves — what you think of the person they have chosen.`,
        choices: [
          { label: 'Embrace them and welcome their partner into the family', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 12); p.child.rel.trust = clamp(p.child.rel.trust + 9); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              recordJournal(st, `${chName} announced their engagement; you embraced them and welcomed their partner into the family.`, 'children');
          } },
          { label: 'Ask careful questions — are they sure?', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 4); p.child.rel.trust = clamp(p.child.rel.trust - 3); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${chName} announced their engagement and you asked careful questions — are they sure?`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_asks_grandparents_far',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true, abroad: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_asks_grandparents_far', category: 'children',
        title: `${chName} Asks Why Grandparents Live So Far`,
        text: `${chName} asks, on a video call with their grandparents, why they live so far away — why the grandparents are on a screen and not in the next room, like their friends' grandparents are. The grandparents smile, but the question hangs in the air after the call ends.`,
        choices: [
          { label: 'Explain honestly — work, life, the choices you made', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.rel.affection = clamp(p.child.rel.affection + 5); p.child.vitals.smarts = clamp(p.child.vitals.smarts + 2); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} asked why their grandparents live so far away; you explained honestly — work, life, the choices you made.`, 'children');
          } },
          { label: 'Change the subject quickly', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust - 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${chName} asked why their grandparents live so far away and you changed the subject.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_language_fading',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 30, maxAge: 55, hasChildren: true, abroad: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_language_fading', category: 'children',
        title: `${chName} Is Losing Your Language`,
        text: `You notice it in a phone call with their grandmother: ${chName} is struggling to find the words in your home language, switching to the language of school halfway through every sentence. The grandmother pretends not to notice. You notice.`,
        choices: [
          { label: 'Speak only your home language with them at home', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 4); p.child.vitals.smarts = clamp(p.child.vitals.smarts + 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${chName} was losing your home language; you decided to speak only that language with them at home.`, 'children');
          } },
          { label: 'Let it go — their future is here, in this language', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 2); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${chName} was losing your home language, and you let it go — their future is here.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_birthday_party',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      const party = cost(S, 500);
      return {
        key: 'ev_child_birthday_party', category: 'children',
        title: `${chName} Wants a Big Birthday Party`,
        text: `${chName} wants a big birthday party this year — friends, cake, decorations, the works — like the parties their classmates have. It would cost about ${formatMoney(party, S.country)}, and they have already invited half the class in their head.`,
        choices: [
          { label: `Throw the big party (${formatMoney(party, S.country)})`, effect: (st) => {
              walletMove(st, -party, `Birthday party for ${chName}`, 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 11); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 10); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `You threw ${chName} the big birthday party they wanted, with friends, cake and decorations.`, 'children');
          } },
          { label: 'A small family party instead', effect: (st) => {
              walletMove(st, -cost(st, 150), 'Small birthday party for child', 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 5); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You threw ${chName} a small family birthday party instead of the big one they wanted.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_breaks_vase',
    category: 'children',
    gates: { requiredPeople: ['child', 'youngChild'], minAge: 24, maxAge: 50, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.youngChild || p.child, 'your child');
      return {
        key: 'ev_child_breaks_vase', category: 'children',
        title: `${chName} Breaks the Vase`,
        text: `There is a crash from the living room: ${chName} has knocked over your favourite vase, and it is in pieces on the floor. They are standing frozen, waiting for the shouting, their eyes already filling with tears.`,
        choices: [
          { label: 'Say it is only a thing — are you hurt?', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 9); p.child.rel.trust = clamp(p.child.rel.trust + 8); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${chName} broke your favourite vase; you said it is only a thing, and asked if they were hurt.`, 'children');
          } },
          { label: 'Shout — that vase mattered to you', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 8); p.child.rel.trust = clamp(p.child.rel.trust - 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 6); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${chName} broke your favourite vase and you shouted. They cried for an hour.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_hides_report',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 30, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_hides_report', category: 'children',
        title: `${chName} Hid the Report Card`,
        text: `You find the school report card hidden under ${chName}'s mattress — bad marks, a teacher's note, and a signature line that has been practised in your handwriting. They have been hiding it for a week, hoping you would never ask.`,
        choices: [
          { label: 'Talk about why they felt they had to hide it', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 9); p.child.rel.affection = clamp(p.child.rel.affection + 5); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You found ${chName}'s report card hidden under the mattress; you talked about why they felt they had to hide it.`, 'children');
          } },
          { label: 'Punish the hiding, not the marks', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 6); p.child.rel.trust = clamp(p.child.rel.trust - 5); p.child.rel.resentment = clamp(p.child.rel.resentment + 6); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You found ${chName}'s report card hidden under the mattress and punished the hiding, not the marks.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_wants_change_school',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 30, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_wants_change_school', category: 'children',
        title: `${chName} Wants to Change Schools`,
        text: `${chName} says they hate their school — the teachers, the children, all of it — and they want to move. They cannot quite say why, only that every morning feels heavy, and they dread the walk to the gate.`,
        choices: [
          { label: 'Listen properly and visit other schools together', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 9); p.child.rel.trust = clamp(p.child.rel.trust + 9); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${chName} wanted to change schools; you listened properly and visited other schools together.`, 'children');
          } },
          { label: 'Tell them to stick it out — every school is the same', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 6); p.child.rel.trust = clamp(p.child.rel.trust - 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 5); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${chName} wanted to change schools and you told them to stick it out.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_nightmare',
    category: 'children',
    gates: { requiredPeople: ['child', 'youngChild'], minAge: 24, maxAge: 45, hasChildren: true },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.youngChild || p.child, 'your child');
      return {
        key: 'ev_child_nightmare', category: 'children',
        title: `${chName} Has a Nightmare`,
        text: `At 3 a.m. ${chName} appears at your bedroom door, small and shaking, holding their blanket: a bad dream, a monster, a dark hallway. They ask, in a whisper, if they can sleep in your bed tonight. Just tonight.`,
        choices: [
          { label: 'Let them in — they will be small for such a short time', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              recordJournal(st, `${chName} had a nightmare and asked to sleep in your bed; you let them in.`, 'children');
          } },
          { label: 'Walk them back and sit with them until they sleep', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 6); p.child.rel.trust = clamp(p.child.rel.trust + 7); }
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              recordJournal(st, `${chName} had a nightmare; you walked them back to bed and sat with them until they slept.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_friends_parents_divorce',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 30, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_friends_parents_divorce', category: 'children',
        title: `${chName} Asks About Divorce`,
        text: `${chName}'s best friend's parents are getting divorced, and your child has come home with questions — worried, confused, and underneath it all, one question they are scared to ask: could it happen to us?`,
        choices: [
          { label: 'Answer honestly and reassure them', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 9); p.child.rel.affection = clamp(p.child.rel.affection + 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${chName}'s best friend's parents are divorcing; your child asked if it could happen to you, and you answered honestly.`, 'children');
          } },
          { label: 'Say it is grown-up business, not for children', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust - 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} asked about their friend's parents divorcing and you said it is grown-up business.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_learn_instrument',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      const lessons = cost(S, 400);
      return {
        key: 'ev_child_learn_instrument', category: 'children',
        title: `${chName} Wants to Learn an Instrument`,
        text: `${chName} has fallen in love with an instrument — they heard it played at school, and now they practise on an imaginary keyboard at the dinner table. Lessons cost about ${formatMoney(lessons, S.country)} a term, and they would need to practise every day.`,
        choices: [
          { label: `Sign them up for lessons (${formatMoney(lessons, S.country)} a term)`, effect: (st) => {
              walletMove(st, -lessons, `Music lessons for ${chName}`, 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 9); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 8); p.child.vitals.smarts = clamp(p.child.vitals.smarts + 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You signed ${chName} up for music lessons after they fell in love with an instrument at school.`, 'children');
          } },
          { label: 'Say lessons are too expensive right now', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 4); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 4); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${chName} wanted to learn an instrument and you said lessons are too expensive right now.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_caught_lying',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_caught_lying', category: 'children',
        title: `${chName} Lies to You`,
        text: `You know for certain that ${chName} is lying to you — about where they were, about the homework, about the broken thing. They are looking you in the eye and saying it anyway, and you can see them deciding whether to hold the lie or let it go.`,
        choices: [
          { label: 'Give them a way out — the truth, no shouting', effect: (st) => {
              if (p.child) { p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.rel.affection = clamp(p.child.rel.affection + 4); }
              st.values.integrity = clamp(st.values.integrity + 3);
              recordJournal(st, `${chName} lied to you; you gave them a way out — the truth, no shouting — and they took it.`, 'children');
          } },
          { label: 'Catch them in it and punish the lie', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 6); p.child.rel.trust = clamp(p.child.rel.trust - 7); p.child.rel.resentment = clamp(p.child.rel.resentment + 6); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You caught ${chName} lying and punished the lie.`, 'children');
          } },
        ],
      };
    },
  },
  /* ============================ FRIENDS ============================ */
  {
    id: 'ev_friend_asks_loan',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 65, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const ask = cost(S, 1200);
      return {
        key: 'ev_friend_asks_loan', category: 'friends',
        title: `${frName} Asks to Borrow Money`,
        text: `${frName} calls you, embarrassed: they are short on rent this month and need ${formatMoney(ask, S.country)} to get through. They promise to pay it back on payday, and they sound like they have already asked everyone else.`,
        choices: [
          { label: `Lend it (${formatMoney(ask, S.country)})`, effect: (st) => {
              walletMove(st, -ask, `Loan to ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Lent money to cover their rent.', { affection: 10, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${frName} was short on rent; you lent them ${formatMoney(ask, st.country)} to get through the month.`, 'friends');
          } },
          { label: 'Say you cannot spare it right now', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'refused_help', 'Refused a loan for their rent.', { affection: -8, trust: -7, resentment: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${frName} asked to borrow money for rent and you said you could not spare it.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_loan_repaid',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, afterEvent: 'ev_friend_asks_loan', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const back = cost(S, 1200);
      return {
        key: 'ev_friend_loan_repaid', category: 'friends',
        title: `${frName} Pays You Back`,
        text: `${frName} turns up with the money you lent them, in cash, counted twice — plus a small gift on top, "for the trouble". They look relieved, and a little proud, to be able to hand it over.`,
        choices: [
          { label: 'Take it back gladly', effect: (st) => {
              walletMove(st, back, `Loan repaid by ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Repaid the loan in full.', { affection: 9, trust: 11 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `${frName} paid back the money you had lent them, in full.`, 'friends');
          } },
          { label: 'Refuse the gift on top — the money is enough', effect: (st) => {
              walletMove(st, back, `Loan repaid by ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Repaid the loan; you refused the extra gift.', { affection: 10, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${frName} repaid your loan with a gift on top; you took only the money.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_best_man',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 18, maxAge: 55 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_best_man', category: 'friends',
        title: `${frName} Asks You to Stand Beside Them`,
        text: `${frName} asks you the question with a nervous grin: will you be their best man — or maid of honour — at their wedding? It means a speech, a suit or dress, and standing beside them on the biggest day of their life.`,
        choices: [
          { label: 'Say yes — of course', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'proud_moment', 'Agreed to be best man / maid of honour.', { affection: 12, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${frName} asked you to be their best man / maid of honour; you said yes, of course.`, 'friends');
          } },
          { label: 'Say yes, but dread the speech already', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'proud_moment', 'Agreed, dreading the speech.', { affection: 8, trust: 7 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${frName} asked you to be their best man / maid of honour; you said yes, already dreading the speech.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_wedding_invite',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const gift = cost(S, 300);
      return {
        key: 'ev_friend_wedding_invite', category: 'friends',
        title: `An Invitation to ${frName}'s Wedding`,
        text: `An invitation arrives in the post: ${frName} is getting married, and you are invited. The venue is beautiful, the date is set, and there is a small card asking about dietary requirements — this is really happening.`,
        choices: [
          { label: `Go, with a proper gift (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, `Wedding gift for ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Came to the wedding with a proper gift.', { affection: 10, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `You went to ${frName}'s wedding with a proper gift and danced until late.`, 'friends');
          } },
          { label: 'Go, but keep the gift modest', effect: (st) => {
              walletMove(st, -cost(st, 100), `Wedding gift for ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Came to the wedding.', { affection: 7, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You went to ${frName}'s wedding with a modest gift.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_engaged_first',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 55 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_engaged_first', category: 'friends',
        title: `${frName} Tells You First`,
        text: `${frName} calls you late at night, voice shaking with excitement: they are engaged. You are the first person they have told — before their parents, before anyone. They want you to know before the world does.`,
        choices: [
          { label: 'Celebrate with them properly', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'proud_moment', 'Was the first to hear the engagement news.', { affection: 11, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${frName} called late at night: they are engaged, and you were the first person they told.`, 'friends');
          } },
          { label: 'Ask if they are sure — it seems fast', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'insulted', 'Questioned the engagement instead of celebrating.', { affection: -6, trust: -5, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${frName} told you first that they are engaged, and you asked if they are sure.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_loses_job_depressed',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 22, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_loses_job_depressed', category: 'friends',
        title: `${frName} Has Lost Their Job`,
        text: `${frName} has lost their job and is taking it badly — not answering messages, not leaving the house, saying they feel like a failure. You have known them long enough to know when "I'm fine" means the opposite.`,
        choices: [
          { label: 'Go round, sit with them, and listen', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Came round and listened after the job loss.', { affection: 12, trust: 11 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${frName} lost their job and was taking it badly; you went round, sat with them, and listened.`, 'friends');
          } },
          { label: 'Send a message saying you are there if they need you', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Sent a message after the job loss.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} lost their job; you sent a message saying you are there if they need you.`, 'friends');
          } },
          { label: 'Give them space — they will come round', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Gave them space after the job loss.', { affection: -5, trust: -5, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} lost their job and you gave them space, assuming they would come round.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_dream_job',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 22, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_dream_job', category: 'friends',
        title: `${frName} Lands the Dream Job`,
        text: `${frName} calls you, barely able to speak: they got it — the job they have wanted for years, the one they interviewed for three times, the one they were sure they had lost. They want to celebrate tonight, and you are the first call.`,
        choices: [
          { label: 'Take them out to celebrate', effect: (st) => {
              walletMove(st, -cost(st, 250), 'Celebration for friend\'s dream job', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'proud_moment', 'Celebrated the dream job properly.', { affection: 11, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${frName} landed their dream job; you took them out to celebrate.`, 'friends');
          } },
          { label: 'Congratulate them warmly over the phone', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'proud_moment', 'Congratulated them on the dream job.', { affection: 6, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${frName} landed their dream job; you congratulated them warmly over the phone.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_moves_abroad',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_moves_abroad', category: 'friends',
        title: `${frName} Is Moving Abroad`,
        text: `${frName} tells you over coffee: they have accepted a job in another country and are leaving in a month. You are happy for them and gutted at the same time — the friendship will not end, but the easy coffees and the late-night calls will.`,
        choices: [
          { label: 'Throw them a proper farewell', effect: (st) => {
              walletMove(st, -cost(st, 200), 'Farewell for a friend moving abroad', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'proud_moment', 'Threw a proper farewell before the move.', { affection: 10, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${frName} is moving abroad for work; you threw them a proper farewell.`, 'friends');
          } },
          { label: 'Say you will keep in touch — and mean it', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Promised to keep in touch after the move.', { affection: 7, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${frName} is moving abroad; you promised to keep in touch — and meant it.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_moves_back',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_moves_back', category: 'friends',
        title: `${frName} Is Moving Back Home`,
        text: `After years abroad, ${frName} is moving back. They call you from the airport, jet-lagged and laughing: they are home, they have missed everything, and they want to meet for coffee tomorrow like no time has passed at all.`,
        choices: [
          { label: 'Meet them tomorrow — coffee, like old times', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'visited', 'Met them the day after they moved back.', { affection: 10, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              recordJournal(st, `${frName} moved back after years abroad; you met for coffee the next day, like old times.`, 'friends');
          } },
          { label: 'Say you will catch up soon — life is busy', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Put off meeting them after they moved back.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} moved back after years abroad and you said you would catch up soon.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_job_referral',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 22, maxAge: 60, hasJob: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_job_referral', category: 'friends',
        title: `${frName} Asks for a Referral`,
        text: `${frName} has applied for a job at your company and asks if you will refer them. You know their work well — they are good, and the team would like them — but a referral puts your name on the line.`,
        choices: [
          { label: 'Refer them — you would vouch for their work', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Referred them for a job.', { affection: 10, trust: 10 });
              if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 60) + 3);
              st.reputation = clamp(st.reputation + 3);
              recordJournal(st, `${frName} applied for a job at your company; you referred them, glad to vouch for their work.`, 'friends');
          } },
          { label: 'Say you would rather not mix work and friendship', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'refused_help', 'Would not refer them for the job.', { affection: -6, trust: -6, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} asked for a job referral and you said you would rather not mix work and friendship.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_business_invest',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const ask = cost(S, 2500);
      return {
        key: 'ev_friend_business_invest', category: 'friends',
        title: `${frName} Starts a Business`,
        text: `${frName} has quit their job to start a business — a real plan, real customers already waiting, and a gap in the funding of ${formatMoney(ask, S.country)}. They are offering you a share if you come in now. They believe in this completely. So do you, mostly.`,
        choices: [
          { label: `Invest ${formatMoney(ask, S.country)}`, effect: (st) => {
              walletMove(st, -ask, `Investment in ${frName}'s business`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Invested in their new business.', { affection: 10, trust: 9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${frName} started a business and you invested ${formatMoney(ask, st.country)} in it.`, 'friends');
          } },
          { label: 'Cheer them on, but keep your money out of it', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Cheered them on, but did not invest.', { affection: 4, trust: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} started a business; you cheered them on, but kept your money out of it.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_birthday_forgot',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 18, maxAge: 70 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_birthday_forgot', category: 'friends',
        title: `You Forgot ${frName}'s Birthday`,
        text: `You see the photos online — ${frName}'s birthday, a cake, friends gathered — and you were not there, because you forgot. Completely. They have not said anything, which somehow makes it worse.`,
        choices: [
          { label: 'Call now, apologise, and take them out', effect: (st) => {
              walletMove(st, -cost(st, 150), 'Belated birthday dinner for a friend', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Forgot the birthday, then made it up.', { affection: -2, trust: 2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `You forgot ${frName}'s birthday; you called, apologised, and took them out to make up for it.`, 'friends');
          } },
          { label: 'Send a message and hope they do not mind', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Forgot the birthday and sent a message.', { affection: -6, trust: -4, resentment: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You forgot ${frName}'s birthday and sent a message, hoping they would not mind.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_birthday_party',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 18, maxAge: 70 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const gift = cost(S, 200);
      return {
        key: 'ev_friend_birthday_party', category: 'friends',
        title: `${frName}'s Birthday Party`,
        text: `${frName} is having a birthday party — a proper one, at their place, with music and food and people you have not seen in years. The invitation says to bring nothing, but you know better than to arrive empty-handed.`,
        choices: [
          { label: `Go, with a good gift (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, `Birthday gift for ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Came to the birthday party with a good gift.', { affection: 9, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `You went to ${frName}'s birthday party with a good gift and stayed until late.`, 'friends');
          } },
          { label: 'Go, with just a card', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Came to the birthday party with a card.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You went to ${frName}'s birthday party with just a card.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_found_online',
    category: 'friends',
    gates: { minAge: 25, maxAge: 65, minYear: 2005 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'an old school friend');
      return {
        key: 'ev_friend_found_online', category: 'friends',
        title: 'An Old Friend Finds You Online',
        text: `A message arrives from someone you have not spoken to in fifteen years — a school friend, now living in another city, who found you online. "Is this really you?" they write. "Do you remember the time we got in trouble for..." — and suddenly you do remember. All of it.`,
        choices: [
          { label: 'Reply properly and reconnect', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              st.skills.charisma = clamp(st.skills.charisma + 3);
              recordJournal(st, `An old school friend found you online after fifteen years; you replied properly and reconnected.`, 'friends');
          } },
          { label: 'Leave it on read — some doors stay closed', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `An old school friend found you online after fifteen years, and you left the message on read.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_politics_row',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, maxAge: 70 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_politics_row', category: 'friends',
        title: 'A Row About Politics',
        text: `Over dinner, ${frName} says something about politics that you fundamentally disagree with — and instead of letting it go, you answer. The conversation heats up fast, voices rise, and the rest of the table goes quiet.`,
        choices: [
          { label: 'Agree to disagree and change the subject', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Agreed to disagree over politics.', { affection: 3, trust: 4 });
              st.skills.charisma = clamp(st.skills.charisma + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `You and ${frName} had a row about politics over dinner; you agreed to disagree and changed the subject.`, 'friends');
          } },
          { label: 'Push it — they need to hear why they are wrong', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'insulted', 'Pushed a political row too far.', { affection: -9, trust: -7, resentment: 9 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `You and ${frName} had a row about politics and you pushed it too far.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_money_owed_row',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const owed = cost(S, 300);
      return {
        key: 'ev_friend_money_owed_row', category: 'friends',
        title: `${frName} Owes You Money`,
        text: `${frName} borrowed ${formatMoney(owed, S.country)} from you months ago — for a bill, they said, just until payday. Payday came and went, twice, and they have not mentioned it. You saw them post photos from a night out last week.`,
        choices: [
          { label: 'Ask for it back, plainly', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'broke_promise', 'Asked plainly for the money back.', { affection: -5, trust: -4, resentment: 6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${frName} owed you ${formatMoney(owed, st.country)} for months; you asked for it back, plainly.`, 'friends');
          } },
          { label: 'Let it go — the friendship is worth more', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Forgave a debt of money owed.', { affection: 6, trust: 5, resentment: -5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} owed you ${formatMoney(owed, st.country)} and you let it go — the friendship is worth more.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_stay_over',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 60, hasHome: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_stay_over', category: 'friends',
        title: `${frName} Needs a Sofa for the Night`,
        text: `${frName} calls late: they have missed the last bus, their phone is dying, and they are stranded across town. Could they crash on your sofa tonight? They promise to be gone before you wake up — a promise nobody ever keeps.`,
        choices: [
          { label: 'Say yes — make up the sofa', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Gave them the sofa for the night.', { affection: 8, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${frName} missed the last bus and needed a sofa for the night; you made it up for them.`, 'friends');
          } },
          { label: 'Send them money for a taxi instead', effect: (st) => {
              walletMove(st, -cost(st, 60), 'Taxi fare for a stranded friend', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Sent taxi money instead of a sofa.', { affection: 4, trust: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} missed the last bus; you sent money for a taxi instead of offering the sofa.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_borrow_car',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 60, hasCar: true },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_borrow_car', category: 'friends',
        title: `${frName} Asks to Borrow Your Car`,
        text: `${frName} needs to move a wardrobe across town this weekend and asks if they can borrow your car. They promise to bring it back with fuel and in one piece — and they have borrowed it twice before without incident.`,
        choices: [
          { label: 'Lend them the car', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Lent them the car for the weekend.', { affection: 7, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You lent your car to ${frName} for the weekend so they could move a wardrobe.`, 'friends');
          } },
          { label: 'Offer to drive them yourself instead', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Drove them instead of lending the car.', { affection: 6, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} wanted to borrow your car; you offered to drive them yourself instead.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_crashes_car',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, hasCar: true, afterEvent: 'ev_friend_borrow_car', afterEventMinTurns: 3 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const repair = cost(S, 800);
      return {
        key: 'ev_friend_crashes_car', category: 'friends',
        title: `${frName} Scratched Your Car`,
        text: `${frName} brings your car back with a long scratch down the passenger door and a dent you cannot miss. They are already apologising before they have even turned the engine off — it was a narrow street, a parked van, a moment of bad luck.`,
        choices: [
          { label: 'Forgive them — accidents happen', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Forgave the scratch on the car.', { affection: 8, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${frName} brought your car back with a scratch down the door; you forgave them — accidents happen.`, 'friends');
          } },
          { label: `Ask them to pay for the repair (${formatMoney(repair, S.country)})`, effect: (st) => {
              walletMove(st, repair, `Car repair paid by ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Paid for the car repair.', { affection: 4, trust: 6, resentment: -3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} scratched your car; they paid ${formatMoney(repair, st.country)} for the repair.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_car_breaks',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_car_breaks', category: 'friends',
        title: `${frName}'s Car Breaks Down`,
        text: `${frName} calls you from the side of the road: their car has died, smoke coming from under the bonnet, and they are stranded miles from home. You are the first person they thought to call.`,
        choices: [
          { label: 'Drive out and help them sort it', effect: (st) => {
              walletMove(st, -cost(st, 50), 'Fuel to rescue a stranded friend', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Drove out to rescue them when their car died.', { affection: 10, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${frName}'s car broke down miles from home; you drove out and helped them sort it.`, 'friends');
          } },
          { label: 'Talk them through calling a tow truck', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Talked them through calling a tow truck.', { affection: 4, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName}'s car broke down; you talked them through calling a tow truck from home.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_holiday_invite',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 22, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const share = cost(S, 900);
      return {
        key: 'ev_friend_holiday_invite', category: 'friends',
        title: `${frName} Invites You on Holiday`,
        text: `${frName} has found a place by the sea — a few days, a group of friends, sun and long dinners — and they want you to come. Your share would be about ${formatMoney(share, S.country)}, and the dates are sooner than you expected.`,
        choices: [
          { label: `Say yes — book it (${formatMoney(share, S.country)})`, effect: (st) => {
              walletMove(st, -share, 'Holiday with friends by the sea', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Came on the holiday by the sea.', { affection: 10, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 9);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 6);
              recordJournal(st, `${frName} invited you on a holiday by the sea with friends; you said yes and booked it.`, 'friends');
          } },
          { label: 'Say you cannot afford it this time', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Could not afford the holiday.', { affection: -3, trust: -2, resentment: 2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${frName} invited you on a holiday by the sea and you said you could not afford it this time.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_football_match',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 16, maxAge: 65 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const ticket = cost(S, 60);
      return {
        key: 'ev_friend_football_match', category: 'friends',
        title: `${frName} Invites You to the Match`,
        text: `${frName} has a spare ticket for the big match this weekend and offers it to you first. Your team is playing, the stadium will be full, and the ticket costs ${formatMoney(ticket, S.country)} — face value, no markup, friend's price.`,
        choices: [
          { label: `Take the ticket (${formatMoney(ticket, S.country)})`, effect: (st) => {
              walletMove(st, -ticket, 'Football match ticket', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Went to the match together.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `${frName} offered you a spare ticket to the big match; you went together and sang with the crowd.`, 'friends');
          } },
          { label: 'Pass — you have other plans', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Turned down the match ticket.', { affection: -2, trust: -1 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} offered you a spare ticket to the big match and you passed.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_bet_challenge',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 18, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const stake = cost(S, 100);
      return {
        key: 'ev_friend_bet_challenge', category: 'friends',
        title: `${frName} Challenges You to a Bet`,
        text: `${frName} is convinced their team will win on Sunday, and they want to bet on it — ${formatMoney(stake, S.country)}, winner takes all, loser cooks dinner. They are grinning like they have already won.`,
        choices: [
          { label: `Take the bet (${formatMoney(stake, S.country)})`, effect: (st) => {
              if (chance(st, 0.5)) {
                walletMove(st, stake, `Won a bet against ${frName}`, 'money');
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
                recordJournal(st, `You took ${frName}'s bet on the match — and won ${formatMoney(stake, st.country)}.`, 'friends');
              } else {
                walletMove(st, -stake, `Lost a bet to ${frName}`, 'money');
                st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
                recordJournal(st, `You took ${frName}'s bet on the match — and lost ${formatMoney(stake, st.country)}.`, 'friends');
              }
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Took a friendly bet on the match.', { affection: 4, trust: 3 });
          } },
          { label: 'Decline — you do not bet with friends', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Declined a bet, keeping friendship clean of money.', { affection: 3, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} challenged you to a bet on the match and you declined — you do not bet with friends.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_divorce_secret',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_divorce_secret', category: 'friends',
        title: `${frName} Tells You a Secret`,
        text: `${frName} asks you to meet somewhere quiet, then tells you something they have told no one: their marriage is over. The papers are being drawn up, the house will be sold, and they have not told their own family yet. They need you to know — and to say nothing.`,
        choices: [
          { label: 'Keep the secret and be there for them', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Kept their divorce secret and stood by them.', { affection: 11, trust: 12 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${frName} told you in confidence that their marriage is over; you kept the secret and stood by them.`, 'friends');
          } },
          { label: 'Tell them to be honest with their family now', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Advised them to be honest with their family.', { affection: 5, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} told you their marriage is over; you told them to be honest with their family now.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_keeps_secret',
    category: 'friends',
    gates: { requiredPeople: ['spouse', 'friend'], minAge: 20, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_keeps_secret', category: 'friends',
        title: `${frName} Asks You to Keep a Secret`,
        text: `${frName} tells you something in confidence — something that would change how people see them if it got out — and makes you promise not to tell anyone. Not your spouse, not your family, no one. The secret is heavy, and now it is yours too.`,
        choices: [
          { label: 'Keep it — a promise is a promise', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Kept a heavy secret, as promised.', { affection: 9, trust: 12 });
              st.values.integrity = clamp(st.values.integrity + 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${frName} told you a secret in confidence; you kept it, as promised.`, 'friends');
          } },
          { label: 'Tell your spouse — secrets in a marriage are worse', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'broke_promise', 'Told their secret to their spouse.', { affection: -10, trust: -12, resentment: 10 });
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Shared a friend\'s secret honestly.', { affection: 3, trust: 5 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${frName} asked you to keep a secret; you told your spouse instead.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_stops_replying',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 65, minYear: 2005 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_stops_replying', category: 'friends',
        title: `${frName} Has Stopped Replying`,
        text: `Your messages to ${frName} have gone unanswered for weeks — read, but not replied to. No row, no falling out, nothing you can point to. Just silence, and the growing feeling that you have done something wrong without knowing what.`,
        choices: [
          { label: 'Go and knock on their door', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Came to the door after weeks of silence.', { affection: 8, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `${frName} stopped replying to your messages for weeks; you went and knocked on their door.`, 'friends');
          } },
          { label: 'Ask them directly what is wrong', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Asked directly what is wrong.', { affection: 5, trust: 6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${frName} stopped replying; you asked them directly what is wrong.`, 'friends');
          } },
          { label: 'Let it go — if they wanted to talk, they would', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Let the friendship go silent.', { affection: -8, trust: -7, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${frName} stopped replying to your messages and you let it go.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_apologises_row',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, afterEvent: 'ev_friend_politics_row', afterEventMinTurns: 3 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_apologises_row', category: 'friends',
        title: `${frName} Apologises`,
        text: `${frName} turns up at your door with coffee and an apology: the row got out of hand, they said things they did not mean, and the friendship matters more than being right. They look embarrassed, and hopeful, all at once.`,
        choices: [
          { label: 'Accept it — the friendship matters more', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Accepted the apology after the row.', { affection: 10, trust: 9, resentment: -9 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `${frName} came to apologise after the row; you accepted it — the friendship matters more.`, 'friends');
          } },
          { label: 'Accept, but keep your distance for a while', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Accepted the apology, but kept distance.', { affection: 4, trust: 4, resentment: -3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName} apologised after the row; you accepted, but kept your distance for a while.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_childhood_visit',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a childhood friend');
      return {
        key: 'ev_friend_childhood_visit', category: 'friends',
        title: 'A Childhood Friend Turns Up',
        text: `There is a knock at the door, and standing there is a friend from your childhood — someone you have not seen in years, in town for one night only, who looked up your address on a whim. They are older, greyer, and exactly the same when they grin.`,
        choices: [
          { label: 'Spend the whole evening catching up', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'visited', 'Spent the whole evening catching up after years apart.', { affection: 11, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              recordJournal(st, `A childhood friend turned up at your door after years apart; you spent the whole evening catching up.`, 'friends');
          } },
          { label: 'Chat briefly — you have an early start', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'visited', 'Chatted briefly at the door.', { affection: 3, trust: 2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `A childhood friend turned up after years apart; you chatted briefly at the door.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_help_moving',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 55 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_help_moving', category: 'friends',
        title: `${frName} Is Moving House`,
        text: `${frName} is moving house on Saturday and needs hands — boxes, a sofa down three flights of stairs, a van that is smaller than they thought. They ask if you will help. Saturday is your only day off this week.`,
        choices: [
          { label: 'Give up your Saturday and help', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Gave up a Saturday to help them move house.', { affection: 11, trust: 10 });
              st.player.vitals.health = clamp(st.player.vitals.health + 2);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `${frName} was moving house on Saturday; you gave up your day off and helped carry everything.`, 'friends');
          } },
          { label: 'Say you cannot — your weekend is already gone', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'refused_help', 'Would not help them move house.', { affection: -6, trust: -5, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} asked for help moving house on Saturday and you said you cannot.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_parent_dies',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, maxAge: 65 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_parent_dies', category: 'friends',
        title: `${frName} Loses a Parent`,
        text: `${frName} calls you, voice hollow: their father has died. The funeral is in three days, and they are the one holding the family together — making calls, signing papers, being strong for their mother while falling apart inside.`,
        choices: [
          { label: 'Go to the funeral and stand beside them', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Came to the funeral and stood beside them.', { affection: 13, trust: 12 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${frName}'s father died; you went to the funeral and stood beside them.`, 'friends');
          } },
          { label: 'Help with the practical things — food, calls, driving', effect: (st) => {
              walletMove(st, -cost(st, 200), 'Food and help for a grieving friend\'s family', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Helped with the practical things after the death.', { affection: 12, trust: 11 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName}'s father died; you helped with the practical things — food, calls, driving.`, 'friends');
          } },
          { label: 'Send condolences and keep your distance', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Sent condolences and kept distance after the death.', { affection: -7, trust: -6, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${frName}'s father died; you sent condolences and kept your distance.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_becomes_parent',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const gift = cost(S, 200);
      return {
        key: 'ev_friend_becomes_parent', category: 'friends',
        title: `${frName} Has a Baby`,
        text: `${frName} sends you a photo from the hospital: a tiny, red, furious baby, and a parent who looks exhausted and happier than you have ever seen them. "Come and meet them," the message says, "whenever you are ready."`,
        choices: [
          { label: `Visit with a gift for the baby (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, 'Gift for a friend\'s new baby', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Visited the new baby with a gift.', { affection: 10, trust: 7 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${frName} had a baby; you visited the hospital with a gift and held the new arrival.`, 'friends');
          } },
          { label: 'Send congratulations and visit next week', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'visited', 'Sent congratulations on the baby.', { affection: 5, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${frName} had a baby; you sent congratulations and promised to visit next week.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_godparent',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, maxAge: 60 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_godparent', category: 'friends',
        title: `${frName} Asks You to Be Godparent`,
        text: `${frName} asks you, formally, over dinner: will you be godparent to their child? It is an honour, and a responsibility — someone the child can turn to, someone who will be there for the big moments and the ordinary ones.`,
        choices: [
          { label: 'Accept — it is an honour', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'proud_moment', 'Accepted being godparent to their child.', { affection: 12, trust: 11 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              st.values.familyDevotion = clamp(st.values.familyDevotion + 3);
              recordJournal(st, `${frName} asked you to be godparent to their child, and you accepted.`, 'friends');
          } },
          { label: 'Decline gently — you are not ready for that role', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'refused_help', 'Declined being godparent.', { affection: -7, trust: -6, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${frName} asked you to be godparent to their child and you declined, gently.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_business_fails',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 28, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const help = cost(S, 600);
      return {
        key: 'ev_friend_business_fails', category: 'friends',
        title: `${frName}'s Business Fails`,
        text: `${frName}'s business has failed. The shop is closing, the debts are real, and they have lost not just money but the thing they built their days around for years. They are ashamed to tell people — but they told you.`,
        choices: [
          { label: `Help with ${formatMoney(help, S.country)} to cover the worst bills`, effect: (st) => {
              walletMove(st, -help, `Help for ${frName} after business failure`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Helped cover bills after the business failed.', { affection: 12, trust: 11 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${frName}'s business failed; you helped with ${formatMoney(help, st.country)} to cover the worst bills.`, 'friends');
          } },
          { label: 'Help them plan what comes next', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Helped plan what comes next after the business failed.', { affection: 9, trust: 8 });
              st.skills.financialIq = clamp(st.skills.financialIq + 2);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `${frName}'s business failed; you sat down and helped them plan what comes next.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_borrows_disappears',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 60, wealth: ['middle', 'upper_middle', 'wealthy'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const loan = cost(S, 1500);
      return {
        key: 'ev_friend_borrows_disappears', category: 'friends',
        title: `${frName} Borrows Money — Then Vanishes`,
        text: `${frName} borrows ${formatMoney(loan, S.country)} from you for an emergency, promises to pay it back in a month — and then disappears. No calls, no messages, no sign of them. The month passes, then another, and the friendship starts to feel like a price you paid.`,
        choices: [
          { label: 'Write it off and write them off too', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'broke_promise', 'Borrowed money and vanished.', { affection: -15, trust: -15, resentment: 12 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `${frName} borrowed ${formatMoney(loan, st.country)} and vanished; you wrote off the money and the friendship.`, 'friends');
          } },
          { label: 'Keep trying to reach them — something might be wrong', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Kept trying to reach them after they vanished.', { affection: 3, trust: 4 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${frName} borrowed money and vanished; you kept trying to reach them, worried something was wrong.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_disappears_resurface',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, afterEvent: 'ev_friend_borrows_disappears', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const owed = cost(S, 1500);
      return {
        key: 'ev_friend_disappears_resurface', category: 'friends',
        title: `${frName} Resurfaces`,
        text: `Out of nowhere, ${frName} is standing at your door — thinner, older, and ashamed. They apologise for disappearing: things fell apart, they were too embarrassed to face you, and they have come to pay back the ${formatMoney(owed, S.country)} they owe you. Every note of it.`,
        choices: [
          { label: 'Take the money and forgive them', effect: (st) => {
              walletMove(st, owed, `Loan repaid by ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Came back and repaid the loan.', { affection: 10, trust: 11, resentment: -10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `${frName} resurfaced after a year away and paid back the ${formatMoney(owed, st.country)} they owed you. You forgave them.`, 'friends');
          } },
          { label: 'Refuse the money — the friendship is what mattered', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Came back to repay; you refused the money.', { affection: 13, trust: 12, resentment: -12 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${frName} resurfaced to repay what they owed; you refused the money — the friendship is what mattered.`, 'friends');
          } },
          { label: 'Tell them it is too late — the friendship is over', effect: (st) => {
              walletMove(st, owed, `Loan repaid by ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'broke_promise', 'Came back too late; the friendship is over.', { affection: -10, trust: -8, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `${frName} resurfaced to repay the money; you took it and told them the friendship is over.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_introduces_someone',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 40, relationship: ['single'] },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_introduces_someone', category: 'friends',
        title: `${frName} Wants to Set You Up`,
        text: `${frName} has someone in mind for you — a friend of theirs, kind, funny, single — and they want to arrange a dinner, just the four of you, "no pressure". They have been planning this for weeks, and they are very pleased with themselves.`,
        choices: [
          { label: 'Say yes — what is the worst that could happen?', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Agreed to be set up on a date.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `${frName} wanted to set you up with a friend of theirs; you said yes to dinner.`, 'friends');
          } },
          { label: 'Say no — you are not looking right now', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Refused to be set up.', { affection: -2, trust: -1 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} wanted to set you up with someone and you said you are not looking right now.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_new_restaurant',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 65 },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const meal = cost(S, 120);
      return {
        key: 'ev_friend_new_restaurant', category: 'friends',
        title: `${frName} Found a New Restaurant`,
        text: `${frName} is raving about a new restaurant in ${S.city} — small, crowded, no booking, and the best food they have had in years. They want to take you there this weekend, before everyone else discovers it.`,
        choices: [
          { label: `Go — dinner on you this time (${formatMoney(meal, S.country)})`, effect: (st) => {
              walletMove(st, -meal, 'Dinner at a new restaurant with a friend', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Went to the new restaurant together.', { affection: 7, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `${frName} found a new restaurant in ${st.city}; you went together and it lived up to the praise.`, 'friends');
          } },
          { label: 'Say you will try it another time', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Put off the new restaurant.', { affection: -2, trust: -1 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} wanted to take you to a new restaurant and you said another time.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_join_gym',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 55 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      const month = cost(S, 250);
      return {
        key: 'ev_friend_join_gym', category: 'friends',
        title: `${frName} Wants a Gym Partner`,
        text: `${frName} has joined a gym and wants you to join too — a training partner, someone to keep them honest on the days they want to quit. The membership is ${formatMoney(month, S.country)} a month, and they have already told the gym you are coming.`,
        choices: [
          { label: `Join with them (${formatMoney(month, S.country)}/month)`, effect: (st) => {
              walletMove(st, -month, 'Gym membership with a friend', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Joined the gym as their training partner.', { affection: 8, trust: 7 });
              st.player.vitals.health = clamp(st.player.vitals.health + 4);
              st.skills.fitness = clamp(st.skills.fitness + 6);
              recordJournal(st, `You joined the gym with ${frName} as their training partner.`, 'friends');
          } },
          { label: 'Decline — the gym is not for you', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Declined to join the gym.', { affection: -3, trust: -2 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} wanted you to join the gym as their training partner and you declined.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_embarrassing_photo',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 18, maxAge: 50, minYear: 2010 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_embarrassing_photo', category: 'friends',
        title: `${frName} Posted an Embarrassing Photo of You`,
        text: `${frName} has posted a photo of you online from last night — mid-laugh, eyes half closed, hair everywhere — and it already has dozens of likes and comments. Your colleagues have seen it. Your family has seen it. It is, objectively, a terrible photo.`,
        choices: [
          { label: 'Laugh it off — it is actually funny', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Laughed off the embarrassing photo.', { affection: 6, trust: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              st.reputation = clamp(st.reputation - 1);
              recordJournal(st, `${frName} posted an embarrassing photo of you online; you laughed it off.`, 'friends');
          } },
          { label: 'Ask them to take it down, now', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'insulted', 'Demanded the photo be taken down.', { affection: -5, trust: -4, resentment: 4 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              st.reputation = clamp(st.reputation + 1);
              recordJournal(st, `${frName} posted an embarrassing photo of you online and you asked them to take it down, now.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_airport_lift',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, maxAge: 65, hasCar: true },
    repeatable: true, cooldownYears: 2,
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'a close friend');
      return {
        key: 'ev_friend_airport_lift', category: 'friends',
        title: `${frName} Needs a Lift to the Airport`,
        text: `${frName} has a flight at dawn and asks if you will drive them to the airport. It means getting up at 4 a.m., in the dark, in the cold — and they know it, which is why they are asking so sweetly.`,
        choices: [
          { label: 'Set the alarm for 4 a.m. and do it', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Drove them to the airport at dawn.', { affection: 9, trust: 8 });
              st.player.vitals.health = clamp(st.player.vitals.health - 1);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You got up at 4 a.m. to drive ${frName} to the airport for a dawn flight.`, 'friends');
          } },
          { label: 'Tell them to take a taxi — 4 a.m. is too early', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'refused_help', 'Would not drive them to the airport.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `${frName} asked for a lift to the airport at dawn and you told them to take a taxi.`, 'friends');
          } },
        ],
      };
    },
  },
  /* ================= v2.10 — THIRD-LEVEL FOLLOW-UPS =================
     Level-2 events: each follows a level-1 follow-up, so the chain
     reaches a third event (choice -> consequence -> reckoning). Gates
     stay minimal on purpose: the follow-up is the point of the chain,
     so only the gate that keeps the story honest is kept (married,
     hasChildren, hasCar, or an age bound where the story needs one).
     No wealth gates, no maxAge except where age is the story. */
  {
    id: 'ev_family_dad_loan_repaid_l2',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 22, afterEvent: 'ev_family_dad_loan_repaid', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      const invest = cost(S, 3000);
      const half = Math.round(invest / 2);
      return {
        key: 'ev_family_dad_loan_repaid_l2', category: 'family',
        title: `${dadName} Wants You in the Shop`,
        text: `The shop is doing better than it has in years, and ${dadName} has an idea: he wants to expand into the empty unit next door, and he wants you in on it — a share of the shop, your name over the door with his, the money you once lent him turned into something that lasts.`,
        choices: [
          { label: `Put in ${formatMoney(invest, S.country)} for a share of the shop`, effect: (st) => {
              walletMove(st, -invest, `Share in ${dadName}'s shop`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'helped_money', 'Bought a share in his shop.', { affection: 10, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You bought a share in your father's shop as it expanded into the unit next door.`, 'family');
          } },
          { label: `Lend him the expansion money instead (${formatMoney(half, S.country)})`, effect: (st) => {
              walletMove(st, -half, `Expansion loan for ${dadName}'s shop`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'helped_money', 'Lent the money to expand the shop.', { affection: 6, trust: 8 });
              recordJournal(st, `You lent your father the money to expand his shop into the unit next door.`, 'family');
          } },
          { label: 'Say the shop is his, not yours', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'refused_help', 'Would not join the shop expansion.', { affection: -4, trust: -3, resentment: 3 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 1);
              recordJournal(st, `Your father asked you to buy into the shop expansion and you said no — the shop is his, not yours.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_loan_unpaid_l2',
    category: 'family',
    gates: { requiredPeople: ['mom', 'dad'], minAge: 22, afterEvent: 'ev_family_dad_loan_unpaid', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      return {
        key: 'ev_family_dad_loan_unpaid_l2', category: 'family',
        title: 'The Silence at Family Meals',
        text: `${dadName} has stopped coming to family meals. He says the shop keeps him late, but your mother says he is embarrassed — the unpaid loan sits between you at every table, even when he is not there.`,
        choices: [
          { label: 'Go to the shop and clear the air with him', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Cleared the air about the unpaid loan.', { affection: 10, trust: 6, resentment: -10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You went to your father's shop and cleared the air about the unpaid loan. He came back to family meals.`, 'family');
          } },
          { label: 'Ask your mother to talk to him for you', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Asked her to speak to father about the loan.', { affection: 4, trust: 3 });
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Let mother mediate about the loan.', { affection: 3, resentment: -4 });
              recordJournal(st, `You asked your mother to talk to your father about the unpaid loan.`, 'family');
          } },
          { label: 'Leave it — he will come round on his own', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Left the silence about the loan to fester.', { affection: -6, trust: -4, resentment: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
              recordJournal(st, `Your father stopped coming to family meals over the unpaid loan, and you left it alone.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_dad_health_followup_l2',
    category: 'family',
    gates: { requiredPeople: ['dad'], minAge: 25, afterEvent: 'ev_family_dad_health_followup', afterEventMinTurns: 12 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const dadName = nm(p.dad, 'your father');
      const checkup = cost(S, 1200);
      return {
        key: 'ev_family_dad_health_followup_l2', category: 'family',
        title: 'A Year After the Warning',
        text: `It has been a year since the doctors warned ${dadName} to change how he lives. Some of it stuck — he walks in the mornings now, and your mother watches his plate like a guard. Some of it did not, and he still works too late and eats whatever is put in front of him.`,
        choices: [
          { label: `Pay for a full check-up to see where he stands (${formatMoney(checkup, S.country)})`, effect: (st) => {
              walletMove(st, -checkup, `Full check-up for ${dadName}`, 'money');
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Paid for a full check-up a year after the warning.', { affection: 8, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `A year after the doctors warned your father, you paid for a full check-up to see where he stands.`, 'family');
          } },
          { label: 'Walk with him every week from now on', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'supported_crisis', 'Started walking with him every week.', { affection: 10, trust: 6 });
              st.player.vitals.health = clamp(st.player.vitals.health + 2);
              recordJournal(st, `You started walking with your father every week, a year after the doctors warned him.`, 'family');
          } },
          { label: 'Leave him to it — he is a grown man', effect: (st) => {
              if (p.dad) rememberDeed(st, p.dad, 'neglected', 'Left him to the health warning alone.', { affection: -4, trust: -3 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `A year after the doctors warned your father, you left him to it — he is a grown man, you said.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_wedding_l2',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 18, afterEvent: 'ev_family_sib_wedding', afterEventMinTurns: 12 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const deposit = cost(S, 4000);
      const half = Math.round(deposit / 2);
      return {
        key: 'ev_family_sib_wedding_l2', category: 'family',
        title: `${sibName} Needs a Deposit`,
        text: `A year into married life, ${sibName} calls with a plan: a small flat has come up near the family, and the deposit is just out of reach. They are asking the family to help — and they are asking you first.`,
        choices: [
          { label: `Help with the full deposit (${formatMoney(deposit, S.country)})`, effect: (st) => {
              walletMove(st, -deposit, `Deposit help for ${sibName}'s flat`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Helped with the deposit on their first flat.', { affection: 12, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${sibName} asked for help with the deposit on a flat a year after their wedding; you paid it in full.`, 'family');
          } },
          { label: `Pay half and ask them to save the rest (${formatMoney(half, S.country)})`, effect: (st) => {
              walletMove(st, -half, `Half the deposit for ${sibName}'s flat`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Paid half the flat deposit.', { affection: 7, trust: 6 });
              recordJournal(st, `You paid half the deposit on ${sibName}'s first flat and asked them to save the rest.`, 'family');
          } },
          { label: 'Say you cannot — the money is not there', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'refused_help', 'Could not help with the flat deposit.', { affection: -6, trust: -5, resentment: 5 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `${sibName} asked for help with a flat deposit and you had to say you could not.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_recovery_l2',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 25, afterEvent: 'ev_family_mom_recovery', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const help = cost(S, 900);
      return {
        key: 'ev_family_mom_recovery_l2', category: 'family',
        title: `${momName} Is Overdoing It Again`,
        text: `${momName} is back on her feet — and back to doing everything: the cooking, the cleaning, the stairs taken two at a time. The doctor's list is still on the fridge, and she is ignoring most of it.`,
        choices: [
          { label: `Pay for help at home twice a week (${formatMoney(help, S.country)})`, effect: (st) => {
              walletMove(st, -help, `Home help for ${momName}`, 'money');
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Paid for help at home so she could rest.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `Your mother was overdoing it again after her illness, so you paid for help at home twice a week.`, 'family');
          } },
          { label: 'Visit every week and do the heavy work yourself', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Came every week to do the heavy work.', { affection: 12, trust: 8 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You started visiting your mother every week to do the heavy work yourself, so she would rest.`, 'family');
          } },
          { label: 'Tell her plainly to slow down', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Told her to slow down and left it at that.', { affection: -3, trust: -2 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 2);
              recordJournal(st, `Your mother was overdoing it again after her illness and you told her plainly to slow down.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_money_never_back_l2',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, afterEvent: 'ev_family_sib_money_never_back', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const ask = cost(S, 1000);
      const half = Math.round(ask / 2);
      return {
        key: 'ev_family_sib_money_never_back_l2', category: 'family',
        title: `${sibName} Asks Again`,
        text: `${sibName} is asking to borrow money again — the same amount, the same easy smile, no mention of the last loan, which never came back. They say this time is different. They said that last time too.`,
        choices: [
          { label: 'Refuse plainly — the last loan is still unpaid', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'refused_help', 'Refused a second loan while the first is unpaid.', { affection: -8, trust: -6, resentment: 10 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `${sibName} asked to borrow money again while the last loan is still unpaid, and you refused plainly.`, 'family');
          } },
          { label: `Lend a smaller sum, with a date written down (${formatMoney(half, S.country)})`, effect: (st) => {
              walletMove(st, -half, `Second loan to ${sibName}, with a date`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Lent a smaller sum, with a date written down.', { affection: 2, trust: 2 });
              recordJournal(st, `You lent ${sibName} a smaller sum this time, with a repayment date written down.`, 'family');
          } },
          { label: `Lend it and say nothing (${formatMoney(ask, S.country)})`, effect: (st) => {
              walletMove(st, -ask, `Second loan to ${sibName}`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Lent again and said nothing about the first loan.', { affection: 4, trust: -4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You lent ${sibName} money again and said nothing about the loan that never came back.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_baby_question_followup_l2',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, maxAge: 38, relationship: ['married'], afterEvent: 'ev_marriage_baby_question_followup', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your partner');
      return {
        key: 'ev_marriage_baby_question_followup_l2', category: 'marriage',
        title: `${spName} Wants a Decision`,
        text: `${spName} has stopped asking around the question. They want a decision — not someday, but now: are you trying for a baby, or are you waiting? They say they can live with either answer, but not with another year of not knowing.`,
        choices: [
          { label: 'Agree — you will try for a baby', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed to try for a baby.', { affection: 12, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `You and ${spName} finally decided: you will try for a baby.`, 'marriage');
          } },
          { label: 'Agree to wait one more year, and mean it', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed to wait one more year, and meant it.', { affection: 6, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `You and ${spName} agreed to wait one more year before trying for a baby — and you meant it.`, 'marriage');
          } },
          { label: 'Say you are not ready and you do not know when you will be', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'broke_promise', 'Said they are not ready, with no date in sight.', { affection: -10, trust: -6, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              recordJournal(st, `You told ${spName} you are not ready for a baby and you do not know when you will be.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_marriage_money_row_makeup_l2',
    category: 'marriage',
    gates: { requiredPeople: ['spouse'], minAge: 22, relationship: ['married'], afterEvent: 'ev_marriage_money_row_makeup', afterEventMinTurns: 3 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const spName = nm(p.spouse, 'your partner');
      return {
        key: 'ev_marriage_money_row_makeup_l2', category: 'marriage',
        title: 'The Budget Talk',
        text: `The row is over, but the money problem that caused it is still sitting at the kitchen table. ${spName} puts a notebook down between you: if you are going to stop fighting about money, you need a plan you both agree on.`,
        choices: [
          { label: 'Sit down and make a joint budget', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'supported_crisis', 'Made a joint budget after the money row.', { affection: 10, trust: 10 });
              st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `After the row about money, you and ${spName} sat down and made a joint budget you both agreed on.`, 'marriage');
          } },
          { label: 'Agree a simple rule — no big spending without telling each other', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'kept_promise', 'Agreed a rule: no big spending without telling each other.', { affection: 6, trust: 8 });
              recordJournal(st, `You and ${spName} agreed a simple money rule after the row: no big spending without telling each other.`, 'marriage');
          } },
          { label: 'Say budgets are not the problem', effect: (st) => {
              if (p.spouse) rememberDeed(st, p.spouse, 'neglected', 'Refused to make a money plan after the row.', { affection: -6, trust: -5, resentment: 6 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `You told ${spName} budgets are not the problem, and the money talk ended there.`, 'marriage');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_bullied_followup_l2',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 28, maxAge: 55, hasChildren: true, afterEvent: 'ev_child_bullied_followup', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      return {
        key: 'ev_child_bullied_followup_l2', category: 'children',
        title: `${chName} Stands Up for Someone Else`,
        text: `${chName} comes home with a story: another child was being picked on at school, and this time ${chName} was the one who stepped in. They are proud — and a little scared of what happens tomorrow.`,
        choices: [
          { label: 'Tell them you are proud — that is what courage looks like', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 10); p.child.rel.trust = clamp(p.child.rel.trust + 8); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 6); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `${chName} stood up for another child being picked on at school, and you told them how proud you are.`, 'children');
          } },
          { label: 'Go to the school and make sure they are protected', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.rel.trust = clamp(p.child.rel.trust + 6); }
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `You went to the school to make sure ${chName} is protected after they stood up for another child.`, 'children');
          } },
          { label: 'Tell them to stay out of other people\'s fights', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 6); p.child.rel.trust = clamp(p.child.rel.trust - 5); p.child.vitals.happiness = clamp(p.child.vitals.happiness - 3); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `You told ${chName} to stay out of other people's fights after they stood up for a child at school.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_teen_party_followup_l2',
    category: 'children',
    gates: { requiredPeople: ['child'], minAge: 35, maxAge: 60, hasChildren: true, afterEvent: 'ev_child_teen_party_followup', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const chName = nm(p.child, 'your child');
      const trip = cost(S, 800);
      return {
        key: 'ev_child_teen_party_followup_l2', category: 'children',
        title: `${chName} Wants a Later Curfew`,
        text: `The party went well, and now ${chName} wants more: a later curfew on Fridays, and a weekend trip with friends to the coast. They have a whole speech ready about trust.`,
        choices: [
          { label: 'Allow the later curfew, with rules', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 8); p.child.rel.trust = clamp(p.child.rel.trust + 10); }
              recordJournal(st, `You allowed ${chName} a later curfew on Fridays, with rules they agreed to.`, 'children');
          } },
          { label: `Allow the trip, and pay for their share (${formatMoney(trip, S.country)})`, effect: (st) => {
              walletMove(st, -trip, `Weekend trip for ${chName}`, 'money');
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection + 12); p.child.rel.trust = clamp(p.child.rel.trust + 6); p.child.vitals.happiness = clamp(p.child.vitals.happiness + 8); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You let ${chName} go on the weekend trip with friends and paid for their share.`, 'children');
          } },
          { label: 'Refuse both — not yet', effect: (st) => {
              if (p.child) { p.child.rel.affection = clamp(p.child.rel.affection - 8); p.child.rel.trust = clamp(p.child.rel.trust - 6); p.child.rel.resentment = clamp(p.child.rel.resentment + 6); }
              recordJournal(st, `You refused ${chName} both the later curfew and the weekend trip — not yet, you said.`, 'children');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_loan_repaid_l2',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, afterEvent: 'ev_friend_loan_repaid', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'your friend');
      const rent = cost(S, 1500);
      return {
        key: 'ev_friend_loan_repaid_l2', category: 'friends',
        title: `${frName} Asks You to Vouch for Them`,
        text: `${frName} has found a flat they want, and the landlord wants a guarantor — someone with a steady income to sign that the rent will be paid. They are asking you, because you are the person they trust most.`,
        choices: [
          { label: 'Sign as their guarantor', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Signed as their guarantor for a flat.', { affection: 10, trust: 12 });
              st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
              recordJournal(st, `You signed as ${frName}'s guarantor so they could take the flat they wanted.`, 'friends');
          } },
          { label: `Offer a month's rent instead of signing (${formatMoney(rent, S.country)})`, effect: (st) => {
              walletMove(st, -rent, `A month's rent for ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Paid a month of rent instead of signing.', { affection: 8, trust: 6 });
              recordJournal(st, `You paid a month of rent for ${frName} instead of signing as their guarantor.`, 'friends');
          } },
          { label: 'Say you cannot put your name on it', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'refused_help', 'Would not sign as their guarantor.', { affection: -6, trust: -5, resentment: 5 });
              recordJournal(st, `${frName} asked you to sign as their guarantor for a flat, and you said you could not put your name on it.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_crashes_car_l2',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, hasCar: true, afterEvent: 'ev_friend_crashes_car', afterEventMinTurns: 3 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'your friend');
      const bill = cost(S, 1800);
      const half = Math.round(bill / 2);
      return {
        key: 'ev_friend_crashes_car_l2', category: 'friends',
        title: 'The Repair Bill Arrives',
        text: `The garage has sent the bill for the scratch and the dent ${frName} left in your car, and it is more than either of you expected. ${frName} is waiting to hear what you want to do.`,
        choices: [
          { label: `Ask them to pay the full bill (${formatMoney(bill, S.country)})`, effect: (st) => {
              walletMove(st, bill, `Car repair paid by ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Paid the full repair bill.', { affection: -2, trust: 2 });
              recordJournal(st, `${frName} paid the full repair bill for the car they scratched.`, 'friends');
          } },
          { label: `Split it — friends share the bad luck (${formatMoney(half, S.country)} from them)`, effect: (st) => {
              walletMove(st, half, `Half the car repair paid by ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Split the repair bill.', { affection: 6, trust: 6 });
              recordJournal(st, `You split the car repair bill with ${frName} — friends share the bad luck.`, 'friends');
          } },
          { label: `Pay it yourself and let it go (${formatMoney(bill, S.country)})`, effect: (st) => {
              walletMove(st, -bill, 'Car repair after a friend scratched it', 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Paid the repair yourself and let it go.', { affection: 10, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `You paid the car repair yourself after ${frName} scratched it, and let it go.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_apologises_row_l2',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 25, afterEvent: 'ev_friend_apologises_row', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'your friend');
      const trip = cost(S, 1200);
      return {
        key: 'ev_friend_apologises_row_l2', category: 'friends',
        title: `${frName} Has a Plan`,
        text: `The friendship is mended, and ${frName} has a plan: a weekend trip, just the two of you, to the place you used to talk about when you were younger. They have already looked up the prices.`,
        choices: [
          { label: `Go — book it and get out of the city (${formatMoney(trip, S.country)})`, effect: (st) => {
              walletMove(st, -trip, `Weekend trip with ${frName}`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'gift', 'Went on the weekend trip after the row.', { affection: 12, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 5);
              recordJournal(st, `After the row and the apology, you and ${frName} took the weekend trip you used to talk about.`, 'friends');
          } },
          { label: 'Say yes to the idea, but not this month', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'kept_promise', 'Said yes to the trip, but not this month.', { affection: 5, trust: 4 });
              recordJournal(st, `You said yes to the weekend trip with ${frName}, but not this month.`, 'friends');
          } },
          { label: 'Keep it to coffee for now', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'neglected', 'Kept it to coffee after the apology.', { affection: -3, trust: -2 });
              recordJournal(st, `After ${frName} apologised, you kept it to coffee for now.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_friend_disappears_resurface_l2',
    category: 'friends',
    gates: { requiredPeople: ['friend'], minAge: 20, afterEvent: 'ev_friend_disappears_resurface', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const frName = nm(p.friend, 'your friend');
      const rent = cost(S, 1200);
      return {
        key: 'ev_friend_disappears_resurface_l2', category: 'friends',
        title: `${frName} Needs Work`,
        text: `${frName} is back for good — or so they say — and now they need work. They are asking if you know anyone hiring, anyone at all. They will take anything that pays.`,
        choices: [
          { label: 'Ask around for them properly', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'supported_crisis', 'Asked around for work for them.', { affection: 10, trust: 8 });
              st.skills.charisma = clamp(st.skills.charisma + 2);
              recordJournal(st, `You asked around properly for work for ${frName} after they came back.`, 'friends');
          } },
          { label: `Lend them a month's rent while they look (${formatMoney(rent, S.country)})`, effect: (st) => {
              walletMove(st, -rent, `A month's rent for ${frName} while they look for work`, 'money');
              if (p.friend) rememberDeed(st, p.friend, 'helped_money', 'Lent a month of rent while they looked for work.', { affection: 12, trust: 6 });
              recordJournal(st, `You lent ${frName} a month of rent while they looked for work.`, 'friends');
          } },
          { label: 'Wish them luck and keep your distance', effect: (st) => {
              if (p.friend) rememberDeed(st, p.friend, 'refused_help', 'Kept their distance after they came back.', { affection: -8, trust: -6, resentment: 6 });
              recordJournal(st, `${frName} came back and asked for help finding work; you wished them luck and kept your distance.`, 'friends');
          } },
        ],
      };
    },
  },
  /* ============ v2.10 — NEW CHAINS (one-offs that begged for a follow-up) ============ */
  {
    id: 'ev_family_mom_birthday_forgot_l1',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 18, afterEvent: 'ev_family_mom_birthday_forgot', afterEventMinTurns: 3 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const gift = cost(S, 500);
      return {
        key: 'ev_family_mom_birthday_forgot_l1', category: 'family',
        title: `${momName} Has Gone Quiet`,
        text: `Since her birthday passed without a call from you, ${momName} has gone quiet. Her answers are short. She does not call in the evenings any more. When you do speak, she is polite — and that is worse than anger.`,
        choices: [
          { label: 'Call her and ask plainly what is wrong', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'supported_crisis', 'Called and asked plainly what was wrong.', { affection: 6, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              recordJournal(st, `Your mother had gone quiet since you forgot her birthday; you called and asked plainly what was wrong.`, 'family');
          } },
          { label: `Send a real gift and go to see her (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, `Gift and visit for ${momName}`, 'money');
              if (p.mom) rememberDeed(st, p.mom, 'gift', 'Came to see her with a real gift.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `Your mother had gone quiet since the forgotten birthday; you went to see her with a real gift.`, 'family');
          } },
          { label: 'Carry on as normal — she will come round', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Carried on as normal while she went quiet.', { affection: -8, trust: -6, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
              recordJournal(st, `Your mother went quiet after you forgot her birthday, and you carried on as normal.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_mom_birthday_forgot_l2',
    category: 'family',
    gates: { requiredPeople: ['mom'], minAge: 18, afterEvent: 'ev_family_mom_birthday_forgot_l1', afterEventMinTurns: 3 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const momName = nm(p.mom, 'your mother');
      const dayOut = cost(S, 800);
      return {
        key: 'ev_family_mom_birthday_forgot_l2', category: 'family',
        title: 'Repair It, or Lose the Closeness',
        text: `${momName} finally says it straight: forgetting her birthday hurt, and the quiet since then hurt more. She is not angry — she is waiting to see whether her child still comes back when it matters.`,
        choices: [
          { label: 'Apologise properly and promise a call every week — and keep it', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'kept_promise', 'Apologised properly and promised a weekly call.', { affection: 14, trust: 10, resentment: -10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `You apologised properly to your mother for the forgotten birthday and promised a call every week — and you meant it.`, 'family');
          } },
          { label: `Take her out for the day, just the two of you (${formatMoney(dayOut, S.country)})`, effect: (st) => {
              walletMove(st, -dayOut, `A day out with ${momName}`, 'money');
              if (p.mom) rememberDeed(st, p.mom, 'gift', 'Took her out for the day, just the two of them.', { affection: 12, trust: 8, resentment: -6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You took your mother out for the day, just the two of you, after the forgotten birthday.`, 'family');
          } },
          { label: 'Let it drift — she will get over it', effect: (st) => {
              if (p.mom) rememberDeed(st, p.mom, 'neglected', 'Let the hurt drift until the closeness went.', { affection: -14, trust: -10, resentment: 12 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 5);
              recordJournal(st, `You let it drift after forgetting your mother's birthday, and the closeness between you went with it.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_moves_abroad_l1',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, afterEvent: 'ev_family_sib_moves_abroad', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const flight = cost(S, 2500);
      const visit = cost(S, 3500);
      return {
        key: 'ev_family_sib_moves_abroad_l1', category: 'family',
        title: `${sibName} Is Homesick`,
        text: `${sibName} calls from abroad, late at night their time. The job is fine, the flat is fine — but they miss home in a way they did not expect. They are asking whether they should come back, or stick it out.`,
        choices: [
          { label: `Pay for their flight home for a visit (${formatMoney(flight, S.country)})`, effect: (st) => {
              walletMove(st, -flight, `Flight home for ${sibName}`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Paid for their flight home when they were homesick.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `${sibName} was homesick abroad; you paid for their flight home for a visit.`, 'family');
          } },
          { label: 'Tell them to stick it out — the first year is the hardest', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'supported_crisis', 'Told them to stick it out through the first year.', { affection: 5, trust: 6 });
              recordJournal(st, `You told ${sibName} to stick it out abroad — the first year is the hardest.`, 'family');
          } },
          { label: `Go and visit them instead (${formatMoney(visit, S.country)})`, effect: (st) => {
              walletMove(st, -visit, `Visit to ${sibName} abroad`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'visited', 'Flew out to visit them abroad.', { affection: 12, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `Instead of bringing ${sibName} home, you flew out to visit them abroad.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_family_sib_baby_born_l1',
    category: 'family',
    gates: { requiredPeople: ['sib'], minAge: 20, afterEvent: 'ev_family_sib_baby_born', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const sibName = nm(p.sib, 'your sibling');
      const gift = cost(S, 600);
      const money = cost(S, 400);
      return {
        key: 'ev_family_sib_baby_born_l1', category: 'family',
        title: 'Meeting the Baby Properly',
        text: `The baby is a few months old now, and ${sibName} wants you to meet them properly — not a quick visit, but a real afternoon, holding the baby while ${sibName} finally gets some sleep.`,
        choices: [
          { label: `Go and bring a proper gift (${formatMoney(gift, S.country)})`, effect: (st) => {
              walletMove(st, -gift, `Gift for ${sibName}'s baby`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'gift', 'Came with a proper gift to meet the baby.', { affection: 10, trust: 6 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
              recordJournal(st, `You went to meet ${sibName}'s baby properly, with a real gift, and held them while ${sibName} rested.`, 'family');
          } },
          { label: 'Offer to babysit one day a week', effect: (st) => {
              if (p.sib) rememberDeed(st, p.sib, 'supported_crisis', 'Offered to babysit one day a week.', { affection: 12, trust: 10 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You offered to babysit ${sibName}'s baby one day a week.`, 'family');
          } },
          { label: `Send money and your love from a distance (${formatMoney(money, S.country)})`, effect: (st) => {
              walletMove(st, -money, `Money for ${sibName}'s baby`, 'money');
              if (p.sib) rememberDeed(st, p.sib, 'helped_money', 'Sent money for the baby from a distance.', { affection: 4, trust: 2 });
              recordJournal(st, `You sent money for ${sibName}'s baby and your love from a distance.`, 'family');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_child_adult_moves_out_l1',
    category: 'children',
    gates: { requiredPeople: ['adultChild'], minAge: 45, maxAge: 70, hasChildren: true, adultChildHome:'away', afterEvent: 'ev_child_adult_moves_out', afterEventMinTurns: 6 },
    build: (S, ctx) => {
      const p = live(S, ctx);
      const child=p.adultChild;
      const chName = nm(child, 'your child');
      const dinner = cost(S, 300);
      return {
        key: 'ev_child_adult_moves_out_l1', category: 'children',
        title: 'The Empty Room',
        text: `${chName} has moved out. Their old room is available. You could invite them over, call, or use the space differently.`,
        choices: [
          { label: `Invite them for dinner (${formatMoney(dinner, S.country)}) · 2 energy`, available:()=>S.money.cash>=dinner&&checkSocialEnergy(S,2).ok, effect: (st) => {
              if(st.money.cash<dinner||!checkSocialEnergy(st,2).ok)return;spendSocialEnergy(st,2);if(child)noteSocialContact(st,child);
              walletMove(st, -dinner, `Dinner with ${chName}`, 'money');
              if (child) { child.rel.affection = clamp(child.rel.affection + 10); child.rel.trust = clamp(child.rel.trust + 6); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
              recordJournal(st, `You invited ${chName} for dinner after the move. No recurring dinner or cost was scheduled.`, 'children');
          } },
          { label: 'Call to catch up · 1 energy', available:()=>checkSocialEnergy(S,1).ok, effect: (st) => {
              if(!checkSocialEnergy(st,1).ok)return;spendSocialEnergy(st,1);if(child)noteSocialContact(st,child);
              if (child) { child.rel.affection = clamp(child.rel.affection + 8); child.rel.trust = clamp(child.rel.trust + 6); }
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
              recordJournal(st, `You called ${chName} to catch up after the move.`, 'children');
          } },
          { label: 'Turn the room into something useful', effect: (st) => {
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
              recordJournal(st, `You turned ${chName}'s old room into something useful, months after they moved out.`, 'children');
          } },
        ],
      };
    },
  },
];








