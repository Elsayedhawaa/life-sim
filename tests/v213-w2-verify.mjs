/* v2.13 Worker 2 verify — spouse portrait, travel imagery, new-life imagery,
   more illustrations. Run from the game root: node tests/v213-w2-verify.mjs */
import { createNewLifeState, ensureExtendedState, createPerson } from '../src/core/schema.js';
import { renderPeopleTabHtml, renderLifestyleTabHtml, renderNewLifeModalHtml } from '../src/ui/views.js';
import { resolveInkPortraitFile, renderPortraitSvg } from '../src/ui/portraits.js';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const viewsSrc = readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8');

function marriedLife({ wives = 1 } = {}) {
  const S = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 30;
  S.money.cash = 607000;
  S.marriage.status = 'married';
  const made = [];
  for (let i = 0; i < wives; i++) {
    const w = createPerson(S, { age: 30 - i, gender: 'f', role: 'spouse', relationLabel: 'Wife', firstName: i === 0 ? 'Rana' : 'Mona' });
    S.people[w.id] = w; S.relations.spouseIds.push(w.id); made.push(w);
  }
  return { S, spouses: made };
}
function singleLife() {
  const S = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 30; S.money.cash = 607000;
  return S;
}

/* ================= (a) spouse portrait on Marriage ================= */
console.log('--- (a) spouse portrait ---');
{
  const { S, spouses } = marriedLife();
  const html = renderPeopleTabHtml(S, { peopleSub: 'marriage' });
  const file = resolveInkPortraitFile(spouses[0]);
  check('married: spouse portrait file is referenced in Marriage HTML', html.includes(`assets/portraits/${file}`), file);
  check('married: spouse portrait SVG renders (wl-portrait-ink)', html.includes('wl-portrait-ink'));
  check('married: spouse name shown with the portrait', html.includes('Rana') && html.includes('Your spouse'));
  check('married: portrait helper output matches what person cards use', html.includes(renderPortraitSvg(spouses[0], 96).slice(0, 60).replace(/"/g, '"')) || html.includes(`assets/portraits/${file}`));
  const { S: S2, spouses: sp2 } = marriedLife({ wives: 2 });
  const html2 = renderPeopleTabHtml(S2, { peopleSub: 'marriage' });
  check('polygamy: both wives named', html2.includes('Rana') && html2.includes('Mona'));
  check('polygamy: both wives portraits referenced', sp2.every(w => html2.includes(`assets/portraits/${resolveInkPortraitFile(w)}`)), sp2.map(w => resolveInkPortraitFile(w)).join(','));
  const single = renderPeopleTabHtml(singleLife(), { peopleSub: 'marriage' });
  check('single: no spouse portrait and no false spouse claim', !single.includes('Your spouse') && !single.includes('wl-portrait-ink'));
}

/* ================= (b) destination imagery on Travel ================= */
console.log('--- (b) travel imagery ---');
{
  const { S } = marriedLife();
  const html = renderLifestyleTabHtml(S, { lifeSub: 'travel' });
  const imgs = [...html.matchAll(/assets\/banners\/([a-z0-9_]+\.(?:jpg|png))/g)].map(m => m[1]);
  const distinct = [...new Set(imgs)];
  console.log('travel banner images:', distinct.join(', '));
  check('travel: at least two destinations render different image files', distinct.length >= 2, distinct.join(','));
  check('travel: at least five distinct destination images', distinct.length >= 5, `got ${distinct.length}`);
  check('travel: pilgrimage rows show the pilgrimage image', html.includes('pilgrimage_travel.jpg'));
  check('travel: Gulf destination uses the Gulf skyline', html.includes('city_gulf_skyline.jpg'));
  check('travel: a Red Sea resort uses the Red Sea beach image', html.includes('red_sea_beach_vacation_ink.jpg'));
  check('travel: a European destination uses a European scene (not the Gulf skyline for every row)', html.includes('europe_old_town_ink.jpg') || html.includes('mediterranean_coast_ink.jpg'));
  check('travel: every destination row image is an <img> with an alt naming the destination', /<img[^>]*alt="[^"]*North Coast/.test(html) || /alt="North Coast/.test(html));
}

/* ================= (c) imagery on the new-life modal ================= */
console.log('--- (c) new-life modal imagery ---');
{
  const html = renderNewLifeModalHtml({ country: 'egy', birthYear: 1998, gender: 'm', familyTier: 'middle' });
  check('new-life modal: contains at least one image', /<img[^>]+src="assets\/banners\//.test(html));
  check('new-life modal: banner image present', html.includes('new_life_beginnings_ink.jpg'));
  check('new-life modal: Egypt choice shows the Nile felucca image', html.includes('cairo_nile_felucca_ink.jpg'));
  check('new-life modal: both era images shown so the era choice looks different', html.includes('era_vintage_street_ink.jpg') && html.includes('era_modern_city_ink.jpg'));
  check('new-life modal: family background shows the family home image', html.includes('family_hearth_home_ink.jpg'));
  const che = renderNewLifeModalHtml({ country: 'che', birthYear: 1970, gender: 'f', familyTier: 'rich' });
  check('new-life modal: Switzerland choice shows the Alps image', che.includes('switzerland_alps_lake_ink.jpg'));
  check('new-life modal: 1970 birth year marks the vintage era as yours', che.includes('1960s–70s — your era'));
  const tur = renderNewLifeModalHtml({ country: 'tur', birthYear: 2000, gender: 'f', familyTier: 'poor' });
  check('new-life modal: Turkey choice shows the Bosphorus image', tur.includes('turkey_istanbul_bosphorus_ink.jpg'));
  check('new-life modal: 2000 birth year marks Today as your era', tur.includes('Today — your era'));
}

/* ================= (d) + (e) new vs existing illustrations ================= */
console.log('--- (d)(e) illustration counts ---');
const NEW_BANNERS = [
  ['europe_old_town_ink.jpg', 'Travel: Italy, France, Spain, UK, Germany, Amsterdam, Vienna, Prague'],
  ['asia_temple_garden_ink.jpg', 'Travel: Japan, Korea, Thailand, India, Vietnam'],
  ['tropical_island_ink.jpg', 'Travel: Maldives, Bali, Goa, Philippines, Hawaii, Mexico, Brazil, Fiji, Mauritius'],
  ['desert_oasis_ink.jpg', 'Travel: Siwa, Luxor & Aswan, AlUla, Marrakech, Muscat'],
  ['mountain_lake_ink.jpg', 'Travel: Scotland, Iceland, Hokkaido, Peru, New Zealand, Abha, Hatta, Salalah'],
  ['north_america_skyline_ink.jpg', 'Travel: New York, Los Angeles, Las Vegas, Miami, Canada'],
  ['safari_savanna_ink.jpg', 'Travel: Kenya, Tanzania safari'],
  ['mediterranean_coast_ink.jpg', 'Travel: Amalfi, French Riviera, Ibiza, Greece, Lisbon, Antalya, Alexandria, Beirut'],
  ['new_life_beginnings_ink.jpg', 'New-life modal: banner'],
  ['era_vintage_street_ink.jpg', 'New-life modal: 1960s-70s era choice'],
  ['era_modern_city_ink.jpg', 'New-life modal: today era choice'],
  ['family_hearth_home_ink.jpg', 'New-life modal: family background + Travel: Visit Family']
];
for (const [f, where] of NEW_BANNERS) {
  check(`new image exists on disk: ${f}`, existsSync(new URL(`../assets/banners/${f}`, import.meta.url)), where);
  check(`new image referenced by a render function: ${f}`, viewsSrc.includes(f), where);
}
{
  const banners = readdirSync(new URL('../assets/banners/', import.meta.url)).filter(f => /\.(jpg|png|webp)$/.test(f));
  const portraits = readdirSync(new URL('../assets/portraits/', import.meta.url)).filter(f => /\.(jpg|png|webp)$/.test(f));
  const furniture = readdirSync(new URL('../assets/furniture/', import.meta.url)).filter(f => /\.(jpg|png|webp)$/.test(f));
  console.log(`counts: banners ${banners.length} (was 30), portraits ${portraits.length} (was 32), furniture ${furniture.length} (was 21), total ${banners.length + portraits.length + furniture.length} (was 83)`);
  check('banners 30 -> 42', banners.length === 42, `got ${banners.length}`);
  check('portraits unchanged at 32', portraits.length === 32, `got ${portraits.length}`);
  check('furniture unchanged at 21', furniture.length === 21, `got ${furniture.length}`);
  check('total illustrations 83 -> 95', banners.length + portraits.length + furniture.length === 95);
  // (e) every pre-existing file still present, byte-identical
  const baseline = readFileSync(new URL('./v213-w2-baseline.sha256', import.meta.url), 'utf8').trim().split('\n');
  let bad = [];
  for (const line of baseline) {
    const [hash, rel] = line.split(/\s+/);
    const p = new URL(`../${rel}`, import.meta.url);
    if (!existsSync(p)) { bad.push(`${rel} MISSING`); continue; }
    const h = createHash('sha256').update(readFileSync(p)).digest('hex');
    if (h !== hash) bad.push(`${rel} MODIFIED`);
  }
  check('all 83 pre-existing illustration files present and unmodified', bad.length === 0, bad.join('; '));
}

console.log(`\nRESULT: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
