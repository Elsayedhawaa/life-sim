/* v2.12 W5 verify — Circle / Children / Pets verbs (Overnight Round 4, item 6).
   Run from the game root: node tests/v212-w5-verify.mjs
   Counts distinct gameplay verbs per screen old -> new (audit method:
   distinct data-action values in a real render, nav switch-subtab excluded)
   and probes EVERY new verb on a seeded state, asserting a number moved
   or a record changed. The three shipped tests are NOT run by this harness. */
import { createNewLifeState, createPerson, ensureExtendedState } from '../src/core/schema.js';
import { resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { callPerson, visitPerson, openGiftScene, openAskHelpScene, openConversationScene, visitTripCostLocal, giftableShopItems } from '../src/systems/soulEngine.js';
import { playWithChild, teachChild, takeChildOut, helpChildWithHomework, childOutingCostLocal } from '../src/systems/marriageFamilyEngine.js';
import { adoptCompanionPet, feedPet, playWithPet, trainPet, takePetToVet, petFeedCostLocal, petVetCostLocal } from '../src/systems/completeLifeSystems.js';
import { SHOP_MEGA_CATALOG } from '../src/data/megaCarsAndShop.js';
import { renderPeopleTabHtml, renderLifestyleTabHtml } from '../src/ui/views.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const verbsIn = (html) => {
  const m = [...String(html).matchAll(/data-action="([^"]+)"/g)].map(x => x[1]);
  const counts = m.reduce((a, v) => (a[v] = (a[v] || 0) + 1, a), {});
  delete counts['switch-subtab'];
  return counts;
};
/* Resolve a queued scene by a choice whose label contains `needle`. */
function resolveChoice(S, needle) {
  const sc = S.activeScene;
  if (!sc) return { ok: false, msg: 'no active scene' };
  const visible = sc.choices.filter(c => typeof c.available !== 'function' || c.available(S));
  const idx = visible.findIndex(c => String(typeof c.label === 'function' ? c.label(S) : c.label).includes(needle));
  if (idx < 0) return { ok: false, msg: `no choice matching "${needle}" in: ${visible.map(c => c.label).join(' | ')}` };
  return resolveActiveSceneChoice(S, idx);
}

function adultLife(over = {}) {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.player.vitals.happiness = 50; S.player.vitals.stress = 50; S.player.vitals.smarts = 70;
  S.money.cash = 5_000_000;
  S.legal.residency.kind = 'citizen';
  Object.assign(S, over);
  return S;
}
function addPerson(S, opts, rel = {}) {
  const p = createPerson(S, opts);
  Object.assign(p.rel, { affection: 50, trust: 50, respect: 50, resentment: 10 }, rel);
  p.career.savingsLocal = 0; p.career.monthlyIncomeLocal = 0;
  S.people[p.id] = p;
  return p;
}

/* ================= §0 verb counts old -> new ================= */
console.log('--- §0 verb counts (audit method) ---');
{
  const S = adultLife();
  const spouse = addPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  spouse.residenceCountry = 'egy'; spouse.city = 'Cairo'; spouse.career.savingsLocal = 500000; spouse.career.monthlyIncomeLocal = 20000;
  S.relations.spouseIds = [spouse.id];
  const friend = addPerson(S, { age: 34, gender: 'm', role: 'friend', relationLabel: 'Friend' });
  friend.residenceCountry = 'gbr'; friend.city = 'London'; friend.career.savingsLocal = 800000; friend.career.monthlyIncomeLocal = 40000;
  S.relations.friendIds = [friend.id];
  const kid = addPerson(S, { age: 10, gender: 'f', role: 'child', relationLabel: 'Daughter' });
  kid.residenceCountry = 'egy'; kid.city = 'Cairo';
  S.relations.childIds = [kid.id];
  const toddler = addPerson(S, { age: 3, gender: 'm', role: 'child', relationLabel: 'Son' });
  toddler.residenceCountry = 'egy'; toddler.city = 'Cairo';
  S.relations.childIds.push(toddler.id);
  adoptCompanionPet(S, 'cat_mau');
  adoptCompanionPet(S, 'dog_golden');

  const circle = verbsIn(renderPeopleTabHtml(S, { peopleSub: 'circle' }));
  const children = verbsIn(renderPeopleTabHtml(S, { peopleSub: 'children' }));
  const pets = verbsIn(renderLifestyleTabHtml(S, { lifeSub: 'pets' }));
  console.log('Circle verbs:', JSON.stringify(circle));
  console.log('Children verbs:', JSON.stringify(children));
  console.log('Pets verbs:', JSON.stringify(pets));
  check('Circle 1 -> 6 gameplay verbs', Object.keys(circle).length === 6, `got ${Object.keys(circle).length}`);
  for (const v of ['npc-interact', 'npc-call', 'npc-visit', 'npc-gift', 'npc-ask-help', 'npc-talk']) check(`Circle offers ${v}`, !!circle[v]);
  check('Children 1 -> 5 gameplay verbs', Object.keys(children).length === 5, `got ${Object.keys(children).length}`);
  for (const v of ['child-program', 'child-play', 'child-teach', 'child-outing', 'child-homework']) check(`Children offers ${v}`, !!children[v]);
  check('Pets 1 -> 5 gameplay verbs', Object.keys(pets).length === 5, `got ${Object.keys(pets).length}`);
  for (const v of ['adopt-pet', 'pet-feed', 'pet-play', 'pet-train', 'pet-vet']) check(`Pets offers ${v}`, !!pets[v]);

  const circleTxt = strip(renderPeopleTabHtml(S, { peopleSub: 'circle' }));
  check('Circle shows a plain lock reason for the toddler (phone)', circleTxt.includes('Too young to talk on the phone'));
  const lowSmarts = adultLife();
  lowSmarts.player.vitals.smarts = 30;
  const k2 = addPerson(lowSmarts, { age: 10, gender: 'f', role: 'child', relationLabel: 'Daughter' });
  lowSmarts.relations.childIds = [k2.id];
  const childTxt = strip(renderPeopleTabHtml(lowSmarts, { peopleSub: 'children' }));
  check('Children shows a plain lock reason for Teach (smarts 30%)', childTxt.includes('Teach needs your Smarts at 50%+ (yours: 30%)'));
  const petsTxt = strip(renderLifestyleTabHtml(S, { lifeSub: 'pets' }));
  check('Pets shows pet condition numbers', /Health: \d+%/.test(petsTxt) && /Obedience: \d+%/.test(petsTxt));
}

/* ================= §1 Circle: Call ================= */
console.log('--- §1 Circle: Call ---');
{
  const S = adultLife();
  const spouse = addPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  spouse.residenceCountry = 'egy'; spouse.city = 'Cairo';
  const aff0 = spouse.rel.affection, trust0 = spouse.rel.trust, j0 = S.journal.length;
  const r = callPerson(S, spouse.id);
  check('call ok, returns the person speaking in their own words', r.ok && typeof r.msg === 'string' && r.msg.length > 5, r.msg);
  check('call moves affection +4', spouse.rel.affection === aff0 + 4, `${aff0} -> ${spouse.rel.affection}`);
  check('call moves trust +2', spouse.rel.trust === trust0 + 2, `${trust0} -> ${spouse.rel.trust}`);
  check('call writes a journal line', S.journal.length === j0 + 1);
  const r2 = callPerson(S, spouse.id);
  check('second call same month refused (time cost)', !r2.ok && /already called/.test(r2.msg), r2.msg);
  const baby = addPerson(S, { age: 2, gender: 'f', role: 'child', relationLabel: 'Daughter' });
  const rb = callPerson(S, baby.id);
  check('call to a 2-year-old refused with a plain reason', !rb.ok && /too young to talk on the phone/.test(rb.msg), rb.msg);
}

/* ================= §2 Circle: Visit ================= */
console.log('--- §2 Circle: Visit ---');
{
  const S = adultLife();
  const spouse = addPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  spouse.residenceCountry = 'egy'; spouse.city = 'Cairo';
  const aff0 = spouse.rel.affection, cash0 = S.money.cash;
  const r = visitPerson(S, spouse.id);
  check('same-city visit ok', r.ok, r.msg);
  check('visit moves affection +9 (bigger than a call)', spouse.rel.affection === aff0 + 9, `${aff0} -> ${spouse.rel.affection}`);
  check('same-city visit costs nothing', S.money.cash === cash0);
  const friend = addPerson(S, { age: 34, gender: 'm', role: 'friend', relationLabel: 'Friend' });
  friend.residenceCountry = 'gbr'; friend.city = 'London';
  const fare = visitTripCostLocal(S, friend).cost;
  check('abroad visit has a real trip cost', fare > 0, `fare ${fare}`);
  const cash1 = S.money.cash, aff1 = friend.rel.affection;
  const r2 = visitPerson(S, friend.id);
  check('abroad visit ok', r2.ok, r2.msg);
  check('abroad visit charges the fare', S.money.cash === cash1 - fare, `${cash1} -> ${S.money.cash}`);
  check('abroad visit moves affection', friend.rel.affection === aff1 + 9);
  const poor = adultLife(); poor.money.cash = 10;
  const far = addPerson(poor, { age: 34, gender: 'm', role: 'friend', relationLabel: 'Friend' });
  far.residenceCountry = 'gbr'; far.city = 'London';
  const r3 = visitPerson(poor, far.id);
  check('visit abroad refused when broke, reason names the fare', !r3.ok && /costs/.test(r3.msg) && /you hold/.test(r3.msg), r3.msg);
}

/* ================= §3 Circle: Give a gift ================= */
console.log('--- §3 Circle: Give a gift ---');
{
  const S = adultLife();
  const spouse = addPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  spouse.residenceCountry = 'egy'; spouse.city = 'Cairo';
  const gifts = giftableShopItems(S);
  check('giftable items are real shop rows', gifts.length > 0 && gifts.every(g => SHOP_MEGA_CATALOG.some(s => s.id === g.id)));
  const r = openGiftScene(S, spouse.id);
  check('gift opens a scene', r.ok && !!S.activeScene, r.msg);
  check('gift scene is spoken by the person', S.activeScene.speakerId === spouse.id);
  const firstLabel = S.activeScene.choices[0].label;
  const cash0 = S.money.cash, aff0 = spouse.rel.affection, j0 = S.journal.length;
  const rr = resolveActiveSceneChoice(S, 0);
  check('gift choice resolves', rr.ok);
  check('gift costs cash', S.money.cash < cash0, `${cash0} -> ${S.money.cash}`);
  check('gift moves affection', spouse.rel.affection > aff0, `${aff0} -> ${spouse.rel.affection}`);
  const itemNamed = firstLabel.replace('Buy the ', '').split(' — ')[0];
  check('gift journal names the shop item', S.journal.length > j0 && S.journal[0].text.includes(itemNamed), S.journal[0]?.text);
  // cash instead: the choice labelled with cash
  const S2 = adultLife();
  const sp2 = addPerson(S2, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  sp2.residenceCountry = 'egy'; sp2.city = 'Cairo';
  openGiftScene(S2, sp2.id);
  const sav0 = sp2.career.savingsLocal, cash2 = S2.money.cash;
  const rc = resolveChoice(S2, 'in cash instead');
  check('cash-gift choice resolves', rc.ok, rc.msg);
  check('cash gift moves money to their savings', sp2.career.savingsLocal > sav0 && S2.money.cash < cash2);
  const poor = adultLife(); poor.money.cash = 0;
  const sp3 = addPerson(poor, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  const rp = openGiftScene(poor, sp3.id);
  check('gift refused when broke, reason names the money', !rp.ok && /cannot afford/.test(rp.msg), rp.msg);
}

/* ================= §4 Circle: Ask for help ================= */
console.log('--- §4 Circle: Ask for help ---');
{
  const S = adultLife();
  const spouse = addPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' }, { affection: 90, trust: 90, resentment: 0 });
  spouse.residenceCountry = 'egy'; spouse.city = 'Cairo';
  spouse.career.savingsLocal = 5_000_000; spouse.career.monthlyIncomeLocal = 20000;
  spouse.traits.warmth = 80; spouse.traits.materialism = 20;
  const r = openAskHelpScene(S, spouse.id);
  check('ask-for-help opens a scene', r.ok && !!S.activeScene, r.msg);
  const cash0 = S.money.cash, sav0 = spouse.career.savingsLocal;
  const rm = resolveChoice(S, 'Ask for money');
  check('money choice resolves', rm.ok, rm.msg);
  check('money help moves cash to you', S.money.cash > cash0, `${cash0} -> ${S.money.cash}`);
  check('money help comes out of THEIR savings', spouse.career.savingsLocal < sav0, `${sav0} -> ${spouse.career.savingsLocal}`);
  // advice choice
  const S2 = adultLife();
  const sp2 = addPerson(S2, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' }, { affection: 70, trust: 70, resentment: 0 });
  sp2.residenceCountry = 'egy'; sp2.city = 'Cairo';
  openAskHelpScene(S2, sp2.id);
  const sm0 = S2.player.vitals.smarts;
  const ra = resolveChoice(S2, 'Ask for advice');
  check('advice choice resolves', ra.ok, ra.msg);
  check('advice moves your smarts +3', S2.player.vitals.smarts === sm0 + 3, `${sm0} -> ${S2.player.vitals.smarts}`);
  // refusal says why: no savings at all
  const S3 = adultLife();
  const father = addPerson(S3, { age: 60, gender: 'm', role: 'father', relationLabel: 'Father' }, { affection: 80, trust: 80, resentment: 0 });
  father.residenceCountry = 'egy'; father.city = 'Cairo'; father.career.savingsLocal = 0;
  openAskHelpScene(S3, father.id);
  const j0 = S3.journal.length;
  resolveChoice(S3, 'Ask for money');
  const refusal = S3.journal.slice(0, S3.journal.length - j0).map(j => j.text).join(' ');
  check('money refusal says why in the journal', /could not help with money/.test(refusal) && /spare savings/.test(refusal), refusal);
  // gates
  const kid = addPerson(S3, { age: 10, gender: 'm', role: 'child', relationLabel: 'Son' });
  const rg = openAskHelpScene(S3, kid.id);
  check('ask-for-help refused for a child, plain reason', !rg.ok && /too young/.test(rg.msg), rg.msg);
}

/* ================= §5 Circle: Real conversation ================= */
console.log('--- §5 Circle: Real conversation ---');
{
  const S = adultLife();
  const spouse = addPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  spouse.residenceCountry = 'egy'; spouse.city = 'Cairo'; spouse.career.monthlyIncomeLocal = 20000;
  const r = openConversationScene(S, spouse.id);
  check('conversation opens a scene', r.ok && !!S.activeScene, r.msg);
  check('conversation scene has trait/history choices', S.activeScene.choices.length >= 3, `${S.activeScene.choices.length} choices`);
  const aff0 = spouse.rel.affection, j0 = S.journal.length;
  const rc = resolveChoice(S, 'Share your own news');
  check('conversation choice resolves', rc.ok, rc.msg);
  check('conversation moves affection', spouse.rel.affection > aff0, `${aff0} -> ${spouse.rel.affection}`);
  check('conversation writes a journal line', S.journal.length > j0);
  // apology choice only appears with resentment, and clears it
  const S2 = adultLife();
  const sp2 = addPerson(S2, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' }, { affection: 50, trust: 50, resentment: 40 });
  sp2.residenceCountry = 'egy'; sp2.city = 'Cairo';
  openConversationScene(S2, sp2.id);
  const ra = resolveChoice(S2, 'Apologise for an old slight');
  check('apology choice resolves', ra.ok, ra.msg);
  check('apology lowers resentment', sp2.rel.resentment < 40, `40 -> ${sp2.rel.resentment}`);
  // gate: will not talk at resentment 80+
  const S3 = adultLife();
  const sp3 = addPerson(S3, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' }, { resentment: 90 });
  const rg = openConversationScene(S3, sp3.id);
  check('conversation refused at resentment 90, plain reason', !rg.ok && /will not talk/.test(rg.msg), rg.msg);
}

/* ================= §6 Children ================= */
console.log('--- §6 Children ---');
{
  const S = adultLife();
  const kid = addPerson(S, { age: 10, gender: 'f', role: 'child', relationLabel: 'Daughter' });
  kid.residenceCountry = 'egy'; kid.city = 'Cairo';
  S.relations.childIds = [kid.id];
  const hap0 = kid.vitals.happiness;
  const rp = playWithChild(S, kid.id);
  check('play ok', rp.ok, rp.msg);
  check('play moves child happiness +6', kid.vitals.happiness === hap0 + 6, `${hap0} -> ${kid.vitals.happiness}`);
  const rp2 = playWithChild(S, kid.id);
  check('second play same month refused (time cost)', !rp2.ok && /already had your full attention/.test(rp2.msg), rp2.msg);
  const sm0 = kid.vitals.smarts;
  const rt = teachChild(S, kid.id);
  check('teach ok', rt.ok, rt.msg);
  check('teach moves child smarts +5', kid.vitals.smarts === sm0 + 5, `${sm0} -> ${kid.vitals.smarts}`);
  const S2 = adultLife(); S2.player.vitals.smarts = 30;
  const k2 = addPerson(S2, { age: 10, gender: 'f', role: 'child', relationLabel: 'Daughter' });
  const rt2 = teachChild(S2, k2.id);
  check('teach refused when your smarts are 30%, reason names 50%', !rt2.ok && /50%/.test(rt2.msg) && /30%/.test(rt2.msg), rt2.msg);
  const cost = childOutingCostLocal(S);
  const cash0 = S.money.cash, hap1 = kid.vitals.happiness;
  const ro = takeChildOut(S, kid.id);
  check('outing ok', ro.ok, ro.msg);
  check('outing costs money', S.money.cash === cash0 - cost, `${cash0} -> ${S.money.cash}`);
  check('outing moves child happiness +8', kid.vitals.happiness === hap1 + 8, `${hap1} -> ${kid.vitals.happiness}`);
  const toddler = addPerson(S, { age: 3, gender: 'm', role: 'child', relationLabel: 'Son' });
  const ro2 = takeChildOut(S, toddler.id);
  check('outing refused for a 3-year-old, plain reason', !ro2.ok && /too young for outings/.test(ro2.msg), ro2.msg);
  const sm1 = kid.vitals.smarts;
  const rh = helpChildWithHomework(S, kid.id);
  check('homework ok', rh.ok, rh.msg);
  check('homework moves child smarts +4', kid.vitals.smarts === sm1 + 4, `${sm1} -> ${kid.vitals.smarts}`);
  check('homework records the help on the child', kid.homeworkHelped === 1, `homeworkHelped ${kid.homeworkHelped}`);
  const rh2 = helpChildWithHomework(S, toddler.id);
  check('homework refused before school, plain reason', !rh2.ok && /not in school yet/.test(rh2.msg), rh2.msg);
  const adult = addPerson(S, { age: 20, gender: 'm', role: 'child', relationLabel: 'Son' });
  const rh3 = helpChildWithHomework(S, adult.id);
  check('homework refused after school, plain reason', !rh3.ok && /finished school/.test(rh3.msg), rh3.msg);
}

/* ================= §7 Pets ================= */
console.log('--- §7 Pets ---');
{
  const S = adultLife();
  const ra = adoptCompanionPet(S, 'cat_mau');
  check('adopt cat ok', ra.ok, ra.msg);
  const pt = S.pets[0];
  check('adopted pet carries condition numbers', pt.health === 80 && pt.happiness === 75 && pt.obedience === 45, JSON.stringify(pt));
  const feedCost = petFeedCostLocal(S, pt);
  const cash0 = S.money.cash, h0 = pt.health, hap0 = pt.happiness;
  const rf = feedPet(S, pt.id);
  check('feed ok', rf.ok, rf.msg);
  check('feed costs money', S.money.cash === cash0 - feedCost, `${cash0} -> ${S.money.cash}`);
  check('feed moves pet health +6', pt.health === h0 + 6, `${h0} -> ${pt.health}`);
  check('feed moves pet happiness +4', pt.happiness === hap0 + 4, `${hap0} -> ${pt.happiness}`);
  const hap1 = pt.happiness;
  const rpl = playWithPet(S, pt.id);
  check('pet play ok', rpl.ok, rpl.msg);
  check('pet play moves happiness +8', pt.happiness === hap1 + 8, `${hap1} -> ${pt.happiness}`);
  const rpl2 = playWithPet(S, pt.id);
  check('second pet play same month refused (time cost)', !rpl2.ok && /already had your full attention/.test(rpl2.msg), rpl2.msg);
  const ob0 = pt.obedience;
  const rt = trainPet(S, pt.id);
  check('train ok', rt.ok, rt.msg);
  check('train moves obedience +8', pt.obedience === ob0 + 8, `${ob0} -> ${pt.obedience}`);
  pt.health = 50;
  const vetCost = petVetCostLocal(S, pt);
  const cash1 = S.money.cash;
  const rv = takePetToVet(S, pt.id);
  check('vet ok', rv.ok, rv.msg);
  check('vet costs money', S.money.cash === cash1 - vetCost, `${cash1} -> ${S.money.cash}`);
  check('vet moves pet health +20', pt.health === 70, `50 -> ${pt.health}`);
  pt.health = 96;
  const rv2 = takePetToVet(S, pt.id);
  check('vet refused in perfect health, plain reason', !rv2.ok && /perfect health/.test(rv2.msg), rv2.msg);
  const poor = adultLife();
  adoptCompanionPet(poor, 'cat_mau');
  poor.money.cash = 0;
  const rf2 = feedPet(poor, poor.pets[0].id);
  check('feed refused when broke, reason names the money', !rf2.ok && /you hold/.test(rf2.msg), rf2.msg);
}

console.log(`\n=== v212-w5: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
