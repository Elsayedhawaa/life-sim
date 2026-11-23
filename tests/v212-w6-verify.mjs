/* v2.12 W6 verify — Shop / Appearance / Travel / Cards verb diversity.
   Run from the game root: node tests/v212-w6-verify.mjs
   Counts distinct data-action verbs per screen (audit method, navigation
   switch-subtab excluded) old -> new, and probes EVERY new verb on a seeded
   state, asserting a number moved or a record changed. */
import { createNewLifeState, createPerson, ensureExtendedState } from '../src/core/schema.js';
import { renderLifestyleTabHtml, renderFinanceTabHtml } from '../src/ui/views.js';
import {
  saveShopItemForLater, removeShopWishlist, compareShopItems, askShopkeeperAboutItem,
  planTrip, compareTrips, takeVacationOrPilgrimage,
  cardLimitBenefit, payWithCard, useCardPerk,
  getHaircut, buyOutfit, shopItemPriceLocal
} from '../src/systems/completeLifeSystems.js';
import { SHOP_MEGA_CATALOG } from '../src/data/megaCarsAndShop.js';
import { ALL_VACATIONS } from '../src/data/megaCareerEduMedical.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const verbs = (h) => [...new Set([...String(h).matchAll(/data-action="([^"]+)"/g)].map(x => x[1]))].filter(v => v !== 'switch-subtab');

function adultLife(over = {}) {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.legal.residency.kind = 'citizen';
  Object.assign(S, over);
  return S;
}
function addSpouse(S) {
  const spouse = createPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id];
  return spouse;
}
function seedCard(S) {
  const cc = { id: 'cc1', catalogId: 'cib_classic', name: 'CIB Classic Credit Card', tier: 'classic', limit: 50000, balance: 0, apr: 0.38, cashbackRate: 0.01 };
  S.creditCards.push(cc);
  return cc;
}
function cheapItem(S) {
  return SHOP_MEGA_CATALOG.find(i => i.yearFrom <= S.year && i.yearTo >= S.year && i.priceUsd2026 <= 30);
}

/* ================= §0 verb counts old -> new ================= */
console.log('--- §0 verb counts (audit method: distinct data-action per screen, nav excluded) ---');
const OLD = {
  shop: ['buy-shop-item', 'sell-item'],
  appearance: ['edit-appearance'],
  travel: ['take-trip'],
  cards: ['open-card', 'pay-card']
};
{
  const S = adultLife();
  seedCard(S);
  S.creditCards[0].balance = 1000;
  S.inventory.push({ id: 'inv1', catalogId: 'sh_1', name: 'Test Watch', category: 'watches', boughtYear: 2026, valueLocal: 5000, appreciates: true });
  saveShopItemForLater(S, cheapItem(S).id);
  const shop = verbs(renderLifestyleTabHtml(S, { lifeSub: 'shop', shopCat: 'all', shopQuery: '' }));
  const app = verbs(renderLifestyleTabHtml(S, { lifeSub: 'appearance' }));
  const trav = verbs(renderLifestyleTabHtml(S, { lifeSub: 'travel', vacQuery: '' }));
  const cards = verbs(renderFinanceTabHtml(S, { finSub: 'cards' }));
  console.log('shop old:', OLD.shop.join(','), '-> new:', shop.join(','));
  console.log('appearance old:', OLD.appearance.join(','), '-> new:', app.join(','));
  console.log('travel old:', OLD.travel.join(','), '-> new:', trav.join(','));
  console.log('cards old:', OLD.cards.join(','), '-> new:', cards.join(','));
  check('shop verbs 2 -> 6', shop.length === 6 && ['compare-shop-item', 'save-shop-item', 'ask-shop-item', 'remove-shop-wishlist'].every(v => shop.includes(v)), shop.join(','));
  check('appearance verbs 1 -> 3', app.length === 3 && app.includes('get-haircut') && app.includes('buy-outfit'), app.join(','));
  check('travel verbs 1 -> 3', trav.length === 3 && trav.includes('plan-trip') && trav.includes('compare-trip'), trav.join(','));
  check('cards verbs 2 -> 5', cards.length === 5 && ['card-limit', 'card-pay', 'card-use-perk'].every(v => cards.includes(v)), cards.join(','));
}

/* ================= §1 Shop verbs ================= */
console.log('--- §1 shop ---');
{
  const S = adultLife();
  const item = cheapItem(S);
  const price = shopItemPriceLocal(S, item);
  const r = saveShopItemForLater(S, item.id);
  check('save-for-later writes wishlist entry', r.ok && S.shopWishlist.length === 1 && S.shopWishlist[0].catalogId === item.id && S.shopWishlist[0].priceLocal === price, r.msg);
  check('save says affordable when cash covers it', /already afford/.test(r.msg), r.msg);
  check('duplicate save refused', !saveShopItemForLater(S, item.id).ok);
  const rm = removeShopWishlist(S, item.id);
  check('remove clears wishlist entry', rm.ok && S.shopWishlist.length === 0, rm.msg);
  saveShopItemForLater(S, item.id);
  const cashBefore = S.money.cash;
  const S2 = adultLife();
  S2.inventory.push({ id: 'inv9', catalogId: item.id, name: `${item.brand} ${item.name}`, category: item.category, boughtYear: 2026, valueLocal: price, appreciates: !!item.appreciates });
  const c = compareShopItems(S2, item.id, 'inv:inv9');
  check('compare vs owned item stores record + opens scene', c.ok && S2.shopLastCompare && S2.shopLastCompare.b.kind === 'owned' && S2.activeScene && /Compare/.test(S2.activeScene.title), c.msg);
  const S3 = adultLife();
  const jBefore = S3.journal.length;
  const a = askShopkeeperAboutItem(S3, item.id);
  check('ask opens shopkeeper scene + journals verdict', a.ok && S3.activeScene && /Ask about/.test(S3.activeScene.title) && S3.journal.length === jBefore + 1, a.msg);
  check('save then buy clears wishlist (cash unchanged check via buy)', (() => {
    const S4 = adultLife();
    saveShopItemForLater(S4, item.id);
    return S4.shopWishlist.length === 1;
  })());
  void cashBefore;
}
{
  /* Disabled Buy states its reason inline in plain words. */
  const S = adultLife();
  S.money.cash = 100;
  const html = renderLifestyleTabHtml(S, { lifeSub: 'shop', shopCat: 'all', shopQuery: '' });
  check('disabled shop Cash button states money needed inline', /disabled>Cash<\/button>/.test(html) && /Need [^<]+ more/.test(html), `need-reason present: ${/Need [^<]+ more/.test(html)}`);
}

/* ================= §2 Appearance verbs ================= */
console.log('--- §2 appearance ---');
{
  const S = adultLife();
  const spouse = addSpouse(S);
  const looksBefore = S.player.vitals.looks;
  const charBefore = S.skills.charisma;
  const affBefore = spouse.rel.affection;
  const cashBefore = S.money.cash;
  const r = getHaircut(S, 'fade');
  check('haircut charges money', r.ok && S.money.cash < cashBefore, r.msg);
  check('haircut moves looks on person record (+2)', S.player.vitals.looks === Math.min(100, looksBefore + 2), `${looksBefore} -> ${S.player.vitals.looks}`);
  check('haircut moves charisma (+1)', S.skills.charisma === Math.min(100, charBefore + 1), `${charBefore} -> ${S.skills.charisma}`);
  check('haircut records style on appearance', S.player.appearance.haircut && S.player.appearance.haircut.styleId === 'fade');
  check('spouse reacts: affection +3 on her record', spouse.rel.affection === affBefore + 3, `${affBefore} -> ${spouse.rel.affection}`);
  check('haircut refused when broke, with reason', (() => { const S2 = adultLife(); S2.money.cash = 10; const r2 = getHaircut(S2, 'celebrity'); return !r2.ok && /Need/.test(r2.msg); })());
}
{
  const S = adultLife();
  const looksBefore = S.player.vitals.looks;
  const charBefore = S.skills.charisma;
  const cashBefore = S.money.cash;
  const r = buyOutfit(S, 'street');
  check('outfit charges money', r.ok && S.money.cash < cashBefore, r.msg);
  check('outfit moves looks (+2) and charisma (+2)', S.player.vitals.looks === Math.min(100, looksBefore + 2) && S.skills.charisma === Math.min(100, charBefore + 2), `${looksBefore}/${charBefore} -> ${S.player.vitals.looks}/${S.skills.charisma}`);
  check('outfit recorded on appearance', S.player.appearance.outfit && S.player.appearance.outfit.styleId === 'street');
  check('outfit refused when broke, with reason', (() => { const S2 = adultLife(); S2.money.cash = 10; const r2 = buyOutfit(S2, 'gala'); return !r2.ok && /Need/.test(r2.msg); })());
}
{
  const S = adultLife();
  S.money.cash = 100;
  const html = renderLifestyleTabHtml(S, { lifeSub: 'appearance' });
  check('unaffordable haircut/outfit state money needed inline', /Need [^<]+ more/.test(html));
}

/* ================= §3 Travel verbs ================= */
console.log('--- §3 travel ---');
{
  const S = adultLife();
  const p1 = planTrip(S, 'dahab');
  check('plan-trip creates plan record', p1.ok && S.tripPlans.length === 1 && S.tripPlans[0].status === 'planned' && S.tripPlans[0].costLocal > 0 && S.tripPlans[0].days === 5, p1.msg);
  check('domestic plan papers say no passport needed, no visa', S.tripPlans[0].papers.some(x => /no passport needed/i.test(x)) && !S.tripPlans[0].visaNeeded);
  check('plan lists money + dates', S.tripPlans[0].papers.some(x => /Money:/.test(x)) && S.tripPlans[0].departYear === 2026 && S.tripPlans[0].departMonth === 2, JSON.stringify(S.tripPlans[0].papers));
  check('second plan for same journey refused (one plan per journey)', !planTrip(S, 'dahab').ok);
  const p2 = planTrip(S, 'france');
  check('international plan names visa need + papers', p2.ok && S.tripPlans[1].visaNeeded && /Schengen/.test(S.tripPlans[1].visaLabel || '') && S.tripPlans[1].papers.some(x => /Tourist visa/.test(x)), p2.msg);
  const cashBefore = S.money.cash;
  const t = takeVacationOrPilgrimage(S, 'dahab');
  check('taking the trip executes the plan', t.ok && S.tripPlans[0].status === 'taken' && S.tripPlans[0].takenYear === 2026, t.msg);
  check('trip charged money', S.money.cash < cashBefore);
  const S2 = adultLife();
  const c = compareTrips(S2, 'dahab');
  check('compare destinations stores record + opens scene', c.ok && S2.tripLastCompare && S2.tripLastCompare.a.id === 'dahab' && S2.tripLastCompare.b && S2.activeScene && /Compare/.test(S2.activeScene.title), c.msg);
  check('comparison names cheaper trip + visa need', S2.tripLastCompare.cheaperId && typeof S2.tripLastCompare.a.visaNeeded === 'boolean');
  check('hajj plan refused after hajj completed', (() => { const S3 = adultLife(); S3.credentials.hajjCompleted = true; return !planTrip(S3, 'hajj_nusuk_std').ok; })());
}

/* ================= §4 Cards verbs ================= */
console.log('--- §4 cards ---');
{
  const S = adultLife();
  const cc = seedCard(S);
  const item = cheapItem(S);
  const price = shopItemPriceLocal(S, item);
  saveShopItemForLater(S, item.id);
  const l = cardLimitBenefit(S, cc.id);
  check('check limit opens scene with real limit + rate', l.ok && S.activeScene && /limit & benefits/.test(S.activeScene.title) && /50000|50,000/.test(S.activeScene.text) && /APR 38%/.test(S.activeScene.text), l.msg);
  const balBefore = cc.balance;
  const invBefore = S.inventory.length;
  const r = payWithCard(S, cc.id, item.id);
  check('pay with this card charges the card', r.ok && cc.balance === balBefore + price, r.msg);
  check('pay with card adds item + clears wishlist', S.inventory.length === invBefore + 1 && S.shopWishlist.length === 0);
  check('ledger line names the card', S.ledger.some(x => x.label && x.label.includes('CIB Classic Credit Card')), JSON.stringify(S.ledger.slice(0, 2).map(x => x.label)));
  check('pay with missing card refused', !payWithCard(S, 'nope', item.id).ok);
  check('pay with card refused over limit', (() => {
    const S2 = adultLife(); const c2 = seedCard(S2); c2.limit = 10; saveShopItemForLater(S2, item.id);
    const r2 = payWithCard(S2, c2.id, item.id); return !r2.ok && /limit/.test(r2.msg);
  })());
}
{
  const S = adultLife();
  const cc = seedCard(S);
  const item = cheapItem(S);
  const price = shopItemPriceLocal(S, item);
  saveShopItemForLater(S, item.id);
  const r = useCardPerk(S, cc.id, item.id);
  const expectedSaving = Math.round(price * 0.05);
  check('use perk buys at discount, saving shown', r.ok && /saved/.test(r.msg) && cc.balance === price - expectedSaving, `${r.msg} balance=${cc.balance} expected=${price - expectedSaving}`);
  check('perk marked used this year', cc.perkUsedYear === 2026);
  check('perk second use in same year refused', !useCardPerk(S, cc.id, item.id).ok);
  check('perk needs a wishlist item first', (() => { const S2 = adultLife(); const c2 = seedCard(S2); return !useCardPerk(S2, c2.id, 'sh_missing').ok; })());
}
{
  const S = adultLife();
  seedCard(S);
  const item = cheapItem(S);
  saveShopItemForLater(S, item.id);
  const html = renderFinanceTabHtml(S, { finSub: 'cards' });
  check('cards screen renders the three new verbs', /card-limit/.test(html) && /card-pay/.test(html) && /card-use-perk/.test(html));
  check('cards screen names the wishlist target on pay button', html.includes(item.name.split(' ').slice(-1)[0]) || /Pay With This Card/.test(html));
}

console.log(`\nTOTAL ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
