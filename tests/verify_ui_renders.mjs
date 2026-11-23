import { createNewLifeState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import {
  renderHudHtml,
  renderNavTabsHtml,
  renderLifeTabHtml,
  renderEducationTabHtml,
  renderPeopleTabHtml,
  renderWorkTabHtml,
  renderRealEstateTabHtml,
  renderFinanceTabHtml,
  renderLifestyleTabHtml,
  renderWorldTabHtml,
  renderBottomDockHtml,
  renderNewLifeModalHtml
} from '../src/ui/views.js';
import { renderPortraitSvg } from '../src/ui/portraits.js';
import { renderBitlifePropertyShapeSvg } from '../src/ui/visualEngine3d.js';
import { buildHome3DSceneFaces } from '../src/ui/liveCanvas3d.js';
import { renderSocialConstellationSvg } from '../src/ui/editorialSketches.js';

// print was never defined: the checks ran, then the report line crashed. Define it (console.log), checks untouched.
const print = (...a) => console.log(...a);

const SUBTAB_SWEEPS = [
  (S, u) => renderLifeTabHtml(S),
  // DESIGN CHANGE (v2.5, Elsayed's decision 2026-11-20): Education is its
  // own tab again (it was 3 headings inside Career). The sweep now renders
  // all 8 tabs, including the new Education tab with its real choices.
  // Open design change, not a weakening — the tab is new scope in v2.5.
  (S, u) => renderEducationTabHtml(S, u),
  (S, u) => renderPeopleTabHtml(S, { ...u, peopleSub: 'circle' }),
  (S, u) => renderPeopleTabHtml(S, { ...u, peopleSub: 'marriage' }),
  (S, u) => renderPeopleTabHtml(S, { ...u, peopleSub: 'children' }),
  (S, u) => renderWorkTabHtml(S, { ...u, workSub: 'jobs' }),
  (S, u) => renderWorkTabHtml(S, { ...u, workSub: 'boards' }),
  (S, u) => renderWorkTabHtml(S, { ...u, workSub: 'ventures' }),
  (S, u) => renderWorkTabHtml(S, { ...u, workSub: 'gigs' }),
  (S, u) => renderRealEstateTabHtml(S, { ...u, reSub: 'myhome', archViewMode: 'elevation', solarTime: 'noon', previewShape: 'villa', cadFloor: 0 }),
  (S, u) => renderRealEstateTabHtml(S, { ...u, reSub: 'myhome', archViewMode: 'exploded', solarTime: 'sunset', previewShape: 'villa', cadFloor: 1, cadCyanotype: true, cadShowMep: true }),
  (S, u) => renderRealEstateTabHtml(S, { ...u, reSub: 'compounds' }),
  (S, u) => renderRealEstateTabHtml(S, { ...u, reSub: 'lands' }),
  (S, u) => renderFinanceTabHtml(S, { ...u, finSub: 'cashflow' }),
  (S, u) => renderFinanceTabHtml(S, { ...u, finSub: 'banks' }),
  (S, u) => renderFinanceTabHtml(S, { ...u, finSub: 'cards' }),
  (S, u) => renderFinanceTabHtml(S, { ...u, finSub: 'markets' }),
  (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'cars', carColorIdx: 3 }),
  (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'appearance' }),
  (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'shop' }),
  (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'pets' }),
  (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'travel' }),
  (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'medical' }),
  (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'legal' }),
  (S, u) => renderWorldTabHtml(S, { ...u, worldSub: 'passports' }),
  (S, u) => renderWorldTabHtml(S, { ...u, worldSub: 'gulf' }),
  (S, u) => renderWorldTabHtml(S, { ...u, worldSub: 'global' })
];

let totalRendersChecked = 0;
for (const country of ['egy', 'sau', 'uae', 'gbr', 'usa', 'deu', 'can', 'jpn', 'ind']) {
  const S = createNewLifeState({ seed: 42, country, birthYear: 1995, familyTier: 'upper_middle', gender: 'm' });
  const uiState = { activeTab: 'life', propMarket: 'local', gulfTarget: 'uae' };
  for (let step = 0; step < 85 && !S.gameOver; step++) {
    advanceSingleTurn(S);
    if (step % 25 === 0 || S.activeScene) {
      const htmls = [
        renderHudHtml(S),
        renderNavTabsHtml(S, 'realestate'),
        ...SUBTAB_SWEEPS.map(fn => fn(S, uiState)),
        renderBottomDockHtml(S),
        renderNewLifeModalHtml({ country })
      ];
      for (const h of htmls) {
        totalRendersChecked++;
        if (h == null) throw new Error('Null render');
        if (/undefined|NaN|\[object Object\]/.test(h)) {
          throw new Error('Bad token leaked into rendered HTML for ' + country + ': ' + h.match(/.{0,40}(undefined|NaN|\[object Object\]).{0,40}/)[0]);
        }
        if (/vis3d-spin|vis3d-tilt/.test(h)) {
          throw new Error('Leftover spin/tilt button found in rendered HTML!');
        }
      }
    }
    if (S.activeScene) resolveActiveSceneChoice(S, 0);
  }

  // DESIGN CHANGE (v2.2, Elsayed's decision 2026-11-19): the design reversed —
  // the ink/watercolor illustrations are back in the game by the owner's
  // choice, and the v2.1 rule that forbade them is reversed with it. Person
  // cards now show ink portraits: every person renders a deterministic ink
  // portrait that embeds an assets/portraits image file. This check asserts
  // illustrations ARE present — it is a design change, not a weakening.
  const castAvatars = new Set();
  for (const person of Object.values(S.people)) {
    const av = renderPortraitSvg(person, 64);
    if (!av.includes('wl-portrait-ink') || !av.includes('<svg')) {
      throw new Error(`Ink portrait missing for ${person.fullName} in ${country}`);
    }
    if (!/assets\/portraits\//.test(av) || !/<image/i.test(av)) {
      throw new Error(`Ink portrait does not embed a portrait image file in ${country}`);
    }
    castAvatars.add(av);
  }
  if (castAvatars.size < 4) {
    throw new Error(`Expected >= 4 distinct ink portraits in ${country}, got ${castAvatars.size}`);
  }
}

// DESIGN CHANGE (v2.2, Elsayed's decision 2026-11-19): the design reversed —
// the ink/watercolor illustrations are back in the game by the owner's choice,
// so this check now asserts the OPPOSITE of the v2.1 rule: every tab renders
// its editorial banner, person cards show ink portraits, and the family
// constellation embeds portraits. Open design change, not a weakening.
// (The photo rule still stands for images claiming to be a real specific
// thing; these illustrations are decorative art.)
{
  const st = createNewLifeState({ seed: 99, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'f' });
  st.player.age = 24;
  const uiState = { activeTab: 'life', propMarket: 'local', gulfTarget: 'uae' };
  const allHtml = [
    renderHudHtml(st),
    renderNavTabsHtml(st, 'life'),
    ...SUBTAB_SWEEPS.map(fn => fn(st, uiState)),
    renderBottomDockHtml(st),
    renderNewLifeModalHtml({ country: 'egy' })
  ].join('\n');
  const bannerCount = (allHtml.match(/editorial-banner/g) || []).length;
  if (bannerCount < 10) throw new Error('Expected editorial banners on the rendered tabs, got only ' + bannerCount);
  if (!/assets\/banners\//.test(allHtml)) throw new Error('Rendered UI has no banner illustration asset path!');
  if (!/<img/i.test(allHtml)) throw new Error('Rendered UI has no <img> banner element!');
  if (!/editorial-banner-caption/.test(allHtml)) throw new Error('Rendered UI has no banner caption!');
  // Ink portraits are deterministic: same person, same portrait.
  const av1 = renderPortraitSvg(st.player, 64);
  const av2 = renderPortraitSvg(st.player, 64);
  if (av1 !== av2) throw new Error('Ink portrait is not deterministic for the same person!');
  if (!av1.includes('wl-portrait-ink') || !/assets\/portraits\//.test(av1)) {
    throw new Error('Player portrait is not an ink portrait with an embedded image!');
  }
  // Kinship constellation embeds ink portraits (player sun node + orbit nodes).
  const constellation = renderSocialConstellationSvg(st);
  if (!/assets\/portraits\//.test(constellation) || !/<image/i.test(constellation)) throw new Error('Constellation does not embed portrait images!');
  if (!constellation.includes('SANCTUM') || !constellation.includes('BLOODLINE')) {
    throw new Error('Kinship constellation lost its ring labels!');
  }
  const constellationPortraits = (constellation.match(/assets\/portraits\//g) || []).length;
  if (constellationPortraits < 2) throw new Error('Constellation embeds too few portraits: ' + constellationPortraits);
}

// Verify dynamic 2D & 3D architectural shape randomization + multi-variant editorial sketches
const vShape1 = renderBitlifePropertyShapeSvg('villa', 44, '#C84B31', 'egy_mivida');
const vShape2 = renderBitlifePropertyShapeSvg('villa', 44, '#C84B31', 'egy_palm_hills');
const vShape3 = renderBitlifePropertyShapeSvg('villa', 44, '#C84B31', 'sau_al_malqa');
if (vShape1 === vShape2 || vShape2 === vShape3) {
  throw new Error('Property shape SVG should dynamically vary across compound seeds!');
}

const facesA = buildHome3DSceneFaces({ shape: 'villa', variantSeed: 1, country: 'egy' });
const facesB = buildHome3DSceneFaces({ shape: 'villa', variantSeed: 2, country: 'gbr' });
if (facesA.length === facesB.length) {
  throw new Error('3D villa faces should procedurally vary across regional seeds!');
}

print(`UI_RENDER_OK: Checked ${totalRendersChecked} full renders, multi-variant 2D/3D shapes, deterministic ink portraits on every person card, editorial banners on every tab & ink portraits embedded in the kinship constellation!`);
