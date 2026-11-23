/* ============================================================================
   World Life — Anthropic-Style Fine-Line Pen-and-Ink Editorial Sketch Engine
   Multi-variant seed-randomized vector stipple, cross-hatch & warm watercolor
   vignettes for story scenes, plus Portrait-Embedded 4D Kinship Constellation.
   ========================================================================== */

import { resolveInkPortraitFile } from './portraits.js';

function hashSketchSeed(val) {
  if (typeof val === 'number' && Number.isFinite(val)) return Math.abs(Math.trunc(val));
  const s = String(val ?? '0');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export function renderEditorialSketchSvg(category = 'life', width = 128, height = 84, variantSeed = 0) {
  const ink = '#191816';
  const inkSoft = 'rgba(25, 24, 22, 0.36)';
  const clay = 'rgba(200, 75, 49, 0.22)';
  const sage = 'rgba(44, 94, 79, 0.20)';
  const ochre = 'rgba(169, 113, 21, 0.20)';
  const slate = 'rgba(29, 53, 87, 0.18)';

  const cat = String(category || 'life').toLowerCase();
  const h = hashSketchSeed(variantSeed);
  const v = h % 3; // 3 distinct hand-drawn compositions per category!
  const paperBg = ['#FAF6EE', '#FBF8F1', '#F7F5EE', '#FAF4EC'][h % 4];
  const sunX = 24 + (h % 76);

  let motif = '';
  if (cat === 'education' || cat === 'study') {
    if (v === 0) {
      // Variant 0: Classical archway, stacked folios & open manuscript
      motif = `
        <ellipse cx="64" cy="68" rx="46" ry="7" fill="${ochre}"/>
        <path d="M24,68 L24,30 A22,20 0 0,1 68,30 L68,68" fill="none" stroke="${ink}" stroke-width="1.2"/>
        <path d="M29,68 L29,32 A17,15 0 0,1 63,32 L63,68" fill="none" stroke="${inkSoft}" stroke-width="0.8"/>
        <rect x="64" y="54" width="38" height="7" rx="1" fill="#FAF6EE" stroke="${ink}" stroke-width="1.1"/>
        <rect x="67" y="47" width="34" height="7" rx="1" fill="${clay}" stroke="${ink}" stroke-width="1.1"/>
        <path d="M68,47 Q77,39 85,45 Q93,39 102,47" fill="#FFFDF9" stroke="${ink}" stroke-width="1.1"/>
        <circle cx="46" cy="36" r="6" fill="none" stroke="${ink}" stroke-width="0.9" stroke-dasharray="2 1.5"/>
      `;
    } else if (v === 1) {
      // Variant 1: Brass astrolabe, fountain pen nib & inkwell
      motif = `
        <circle cx="52" cy="42" r="24" fill="${sage}"/>
        <circle cx="52" cy="42" r="20" fill="none" stroke="${ink}" stroke-width="1.15"/>
        <circle cx="52" cy="42" r="12" fill="none" stroke="${ink}" stroke-width="0.85" stroke-dasharray="3 2"/>
        <line x1="32" y1="42" x2="72" y2="42" stroke="${inkSoft}" stroke-width="0.8"/>
        <line x1="52" y1="20" x2="52" y2="64" stroke="${inkSoft}" stroke-width="0.8"/>
        <polygon points="88,18 96,34 92,52 84,52 80,34" fill="#FFFDF9" stroke="${ink}" stroke-width="1.15"/>
        <line x1="88" y1="18" x2="88" y2="36" stroke="${ink}" stroke-width="1"/>
        <circle cx="88" cy="37" r="1.8" fill="#C84B31"/>
        <rect x="81" y="52" width="14" height="14" rx="2" fill="${clay}" stroke="${ink}" stroke-width="1.15"/>
      `;
    } else {
      // Variant 2: University colonnade & graduation scroll with wax seal
      motif = `
        <ellipse cx="64" cy="66" rx="48" ry="6" fill="${slate}"/>
        ${[24, 44, 64].map(cx => `
          <rect x="${cx - 4}" y="24" width="8" height="38" fill="#FFFDF9" stroke="${ink}" stroke-width="1.05"/>
          <path d="M${cx - 4},24 A10,8 0 0,1 ${cx + 16},24" fill="none" stroke="${ink}" stroke-width="1.05"/>
        `).join('')}
        <rect x="68" y="44" width="40" height="12" rx="5" transform="rotate(-14 88 50)" fill="#FFFDF9" stroke="${ink}" stroke-width="1.15"/>
        <circle cx="88" cy="50" r="4.2" fill="#C84B31" stroke="${ink}" stroke-width="0.9"/>
      `;
    }
  } else if (cat === 'work' || cat === 'business') {
    if (v === 0) {
      motif = `
        <ellipse cx="64" cy="70" rx="48" ry="6" fill="${sage}"/>
        <line x1="18" y1="70" x2="110" y2="70" stroke="${ink}" stroke-width="1.1"/>
        <rect x="28" y="24" width="18" height="46" fill="#FAF6EE" stroke="${ink}" stroke-width="1.15"/>
        <line x1="33" y1="26" x2="33" y2="68" stroke="${inkSoft}" stroke-width="0.7"/>
        <line x1="41" y1="26" x2="41" y2="68" stroke="${inkSoft}" stroke-width="0.7"/>
        <rect x="25" y="20" width="24" height="4" fill="${clay}" stroke="${ink}" stroke-width="1.1"/>
        <path d="M54,64 Q74,58 98,24" fill="none" stroke="#C84B31" stroke-width="1.4"/>
        <circle cx="98" cy="24" r="2.5" fill="#C84B31"/>
        <line x1="78" y1="20" x2="68" y2="68" stroke="${ink}" stroke-width="1.2"/>
        <line x1="78" y1="20" x2="88" y2="68" stroke="${ink}" stroke-width="1.2"/>
        <circle cx="78" cy="18" r="3" fill="#FAF6EE" stroke="${ink}" stroke-width="1.1"/>
      `;
    } else if (v === 1) {
      // Executive skyline towers & vintage leather attaché folio
      motif = `
        <rect x="20" y="34" width="20" height="34" fill="${slate}" stroke="${ink}" stroke-width="1.1"/>
        <rect x="42" y="18" width="22" height="50" fill="#FFFDF9" stroke="${ink}" stroke-width="1.15"/>
        <polygon points="42,18 53,10 64,18" fill="${ochre}" stroke="${ink}" stroke-width="1.1"/>
        <rect x="68" y="42" width="38" height="26" rx="3" fill="${clay}" stroke="${ink}" stroke-width="1.2"/>
        <path d="M80,42 L80,36 L94,36 L94,42" fill="none" stroke="${ink}" stroke-width="1.2"/>
        <rect x="84" y="51" width="6" height="5" fill="#FAF6EE" stroke="${ink}" stroke-width="0.9"/>
      `;
    } else {
      // Merchant balance scale & precision gearwheel
      motif = `
        <ellipse cx="64" cy="68" rx="44" ry="5" fill="${ochre}"/>
        <line x1="64" y1="16" x2="64" y2="68" stroke="${ink}" stroke-width="1.3"/>
        <line x1="34" y1="28" x2="94" y2="24" stroke="${ink}" stroke-width="1.2"/>
        <path d="M26,46 Q34,54 42,46 Z" fill="${clay}" stroke="${ink}" stroke-width="1.1"/>
        <line x1="34" y1="28" x2="28" y2="46" stroke="${inkSoft}" stroke-width="0.8"/>
        <line x1="34" y1="28" x2="40" y2="46" stroke="${inkSoft}" stroke-width="0.8"/>
        <path d="M86,42 Q94,50 102,42 Z" fill="${sage}" stroke="${ink}" stroke-width="1.1"/>
        <line x1="94" y1="24" x2="88" y2="42" stroke="${inkSoft}" stroke-width="0.8"/>
        <line x1="94" y1="24" x2="100" y2="42" stroke="${inkSoft}" stroke-width="0.8"/>
      `;
    }
  } else if (cat === 'relationship' || cat === 'marriage' || cat === 'family') {
    if (v === 0) {
      motif = `
        <circle cx="64" cy="42" r="28" fill="${clay}"/>
        <line x1="42" y1="10" x2="42" y2="24" stroke="${ink}" stroke-width="1"/>
        <polygon points="36,24 48,24 51,34 46,48 38,48 33,34" fill="#FFFDF7" stroke="${ink}" stroke-width="1.15"/>
        <circle cx="42" cy="35" r="3" fill="#EAB308" opacity="0.65"/>
        <circle cx="74" cy="48" r="11" fill="none" stroke="${ink}" stroke-width="1.25"/>
        <circle cx="84" cy="48" r="11" fill="none" stroke="#A97115" stroke-width="1.25"/>
        <path d="M22,66 Q56,56 96,26" fill="none" stroke="${ink}" stroke-width="1.1"/>
      `;
    } else if (v === 1) {
      // Arabic brass coffee dallah, twin porcelain cups & date palm frond
      motif = `
        <ellipse cx="64" cy="64" rx="44" ry="8" fill="${ochre}"/>
        <path d="M46,62 L50,32 L62,32 L66,62 Z" fill="#FFFDF7" stroke="${ink}" stroke-width="1.2"/>
        <polygon points="49,32 56,19 63,32" fill="${clay}" stroke="${ink}" stroke-width="1.15"/>
        <path d="M50,38 Q34,36 30,28 Q38,44 48,46" fill="none" stroke="${ink}" stroke-width="1.2"/>
        <path d="M64,36 Q75,36 73,50 Q71,56 65,54" fill="none" stroke="${ink}" stroke-width="1.15"/>
        <path d="M80,54 L90,54 L88,63 L82,63 Z" fill="#FFFDF9" stroke="${ink}" stroke-width="1.1"/>
        <path d="M94,54 L104,54 L102,63 L96,63 Z" fill="${sage}" stroke="${ink}" stroke-width="1.1"/>
      `;
    } else {
      // Courtyard mashrabiya window arch & twin cypresses
      motif = `
        <rect x="38" y="16" width="52" height="52" rx="2" fill="${sage}"/>
        <path d="M46,68 L46,34 A18,16 0 0,1 82,34 L82,68 Z" fill="#FFFDF9" stroke="${ink}" stroke-width="1.2"/>
        <line x1="64" y1="18" x2="64" y2="68" stroke="${inkSoft}" stroke-width="0.8"/>
        <line x1="46" y1="46" x2="82" y2="46" stroke="${inkSoft}" stroke-width="0.8"/>
        <ellipse cx="26" cy="46" rx="6" ry="18" fill="${clay}" stroke="${ink}" stroke-width="1.05"/>
        <ellipse cx="102" cy="46" rx="6" ry="18" fill="${clay}" stroke="${ink}" stroke-width="1.05"/>
      `;
    }
  } else if (cat === 'health' || cat === 'medical') {
    if (v === 0) {
      motif = `
        <ellipse cx="64" cy="44" rx="38" ry="26" fill="${sage}"/>
        <path d="M14,46 L38,46 L45,28 L53,62 L61,20 L69,52 L75,46 L114,46" fill="none" stroke="#186A47" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="61" cy="20" r="2.5" fill="#C84B31"/>
      `;
    } else if (v === 1) {
      // Stethoscope & botanical medicinal sprig
      motif = `
        <circle cx="64" cy="42" r="26" fill="${ochre}"/>
        <path d="M42,22 C42,46 66,46 66,22" fill="none" stroke="${ink}" stroke-width="1.35"/>
        <path d="M54,40 C54,60 84,64 88,46" fill="none" stroke="${ink}" stroke-width="1.35"/>
        <circle cx="88" cy="42" r="6.5" fill="#FFFDF9" stroke="#186A47" stroke-width="1.4"/>
        <circle cx="88" cy="42" r="2.2" fill="#C84B31"/>
      `;
    } else {
      // Apothecary mortar, pestle & cross seal
      motif = `
        <ellipse cx="64" cy="64" rx="40" ry="6" fill="${clay}"/>
        <path d="M40,40 L88,40 Q84,64 64,64 Q44,64 40,40 Z" fill="#FFFDF9" stroke="${ink}" stroke-width="1.25"/>
        <line x1="72" y1="40" x2="84" y2="20" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M26,28 L34,28 M30,24 L30,32" stroke="#186A47" stroke-width="1.8"/>
      `;
    }
  } else if (cat === 'visa' || cat === 'world') {
    if (v === 0) {
      motif = `
        <circle cx="56" cy="43" r="27" fill="${ochre}"/>
        <circle cx="56" cy="43" r="25" fill="none" stroke="${ink}" stroke-width="1.15"/>
        <ellipse cx="56" cy="43" rx="12" ry="25" fill="none" stroke="${ink}" stroke-width="0.9"/>
        <ellipse cx="56" cy="43" rx="25" ry="9" fill="none" stroke="${ink}" stroke-width="0.9"/>
        <path d="M22,58 Q62,12 108,26" fill="none" stroke="#C84B31" stroke-width="1.35" stroke-dasharray="3 2"/>
        <polygon points="108,26 100,23 102,30" fill="#C84B31"/>
      `;
    } else if (v === 1) {
      // Inked consular passport stamp & compass rose
      motif = `
        <rect x="22" y="20" width="52" height="44" rx="4" transform="rotate(-6 48 42)" fill="#FFFDF9" stroke="${ink}" stroke-width="1.2"/>
        <circle cx="48" cy="42" r="14" fill="${clay}" stroke="#C84B31" stroke-width="1.2" stroke-dasharray="3 1.5"/>
        <g transform="translate(94, 42)">
          <circle cx="0" cy="0" r="16" fill="${slate}" stroke="${ink}" stroke-width="1.1"/>
          <polygon points="0,-14 3.5,0 0,14 -3.5,0" fill="${ink}"/>
          <polygon points="-14,0 0,-3.5 14,0 0,3.5" fill="#FAF6EE" stroke="${ink}" stroke-width="0.8"/>
        </g>
      `;
    } else {
      // Felucca / Clipper sail on horizon + meridian sun
      motif = `
        <circle cx="${sunX}" cy="24" r="10" fill="${clay}"/>
        <path d="M56,60 L56,16 L84,54 Z" fill="#FFFDF9" stroke="${ink}" stroke-width="1.2"/>
        <path d="M53,54 L38,54 L53,26 Z" fill="${ochre}" stroke="${ink}" stroke-width="1.05"/>
        <path d="M32,60 L90,60 L82,66 L40,66 Z" fill="${ink}" opacity="0.82"/>
        <path d="M14,70 Q40,66 66,70 T114,70" fill="none" stroke="${inkSoft}" stroke-width="1"/>
      `;
    }
  } else if (cat === 'money' || cat === 'housing') {
    if (v === 0) {
      motif = `
        <rect x="24" y="22" width="80" height="46" rx="2" fill="${ochre}"/>
        <polygon points="20,34 52,14 84,34" fill="#FAF6EE" stroke="${ink}" stroke-width="1.2"/>
        <rect x="26" y="34" width="52" height="34" fill="#FFFDF9" stroke="${ink}" stroke-width="1.2"/>
        <path d="M46,68 L46,48 A6,6 0 0,1 58,48 L58,68" fill="${clay}" stroke="${ink}" stroke-width="1.1"/>
        <circle cx="94" cy="36" r="8" fill="none" stroke="${ink}" stroke-width="1.2"/>
        <line x1="94" y1="44" x2="94" y2="66" stroke="${ink}" stroke-width="1.2"/>
      `;
    } else if (v === 1) {
      // Stacked bullion ingots & architectural blueprint roll
      motif = `
        <ellipse cx="64" cy="64" rx="46" ry="7" fill="${sage}"/>
        <polygon points="24,56 32,44 62,44 68,56" fill="${ochre}" stroke="${ink}" stroke-width="1.2"/>
        <polygon points="36,44 44,32 74,32 80,44" fill="#FFFDF7" stroke="${ink}" stroke-width="1.2"/>
        <rect x="68" y="20" width="36" height="10" rx="5" transform="rotate(24 86 25)" fill="${slate}" stroke="${ink}" stroke-width="1.15"/>
      `;
    } else {
      // Courtyard villa archways & date palm
      motif = `
        <rect x="18" y="30" width="68" height="38" fill="#FFFDF9" stroke="${ink}" stroke-width="1.2"/>
        <rect x="15" y="26" width="74" height="4" fill="${clay}" stroke="${ink}" stroke-width="1.1"/>
        ${[30, 52, 74].map(ax => `<path d="M${ax - 6},68 L${ax - 6},46 A6,6 0 0,1 ${ax + 6},46 L${ax + 6},68" fill="${ochre}" stroke="${ink}" stroke-width="1"/>`).join('')}
        <line x1="100" y1="68" x2="102" y2="30" stroke="${ink}" stroke-width="1.5"/>
        <path d="M102,30 Q90,22 86,32 M102,30 Q114,22 118,32 M102,30 Q96,16 108,18" fill="none" stroke="#186A47" stroke-width="1.3"/>
      `;
    }
  } else {
    if (v === 0) {
      motif = `
        <circle cx="64" cy="42" r="27" fill="${ochre}"/>
        <circle cx="64" cy="42" r="23" fill="none" stroke="${inkSoft}" stroke-width="0.8" stroke-dasharray="2 2"/>
        <polygon points="48,20 80,20 64,42" fill="#FFFDF9" stroke="${ink}" stroke-width="1.2"/>
        <polygon points="64,42 80,64 48,64" fill="${clay}" stroke="${ink}" stroke-width="1.2"/>
        <line x1="44" y1="20" x2="84" y2="20" stroke="${ink}" stroke-width="1.5"/>
        <line x1="44" y1="64" x2="84" y2="64" stroke="${ink}" stroke-width="1.5"/>
      `;
    } else if (v === 1) {
      // Sun dial, bird in flight & botanical branch
      motif = `
        <circle cx="${sunX}" cy="26" r="14" fill="${clay}"/>
        <path d="M18,62 Q64,44 110,60" fill="none" stroke="${ink}" stroke-width="1.2"/>
        <path d="M44,32 Q50,26 56,32 Q62,26 68,32" fill="none" stroke="${ink}" stroke-width="1.15"/>
        <path d="M76,22 Q81,17 86,22 Q91,17 96,22" fill="none" stroke="${ink}" stroke-width="1.05"/>
        <ellipse cx="64" cy="52" rx="18" ry="6" fill="${sage}" stroke="${ink}" stroke-width="1"/>
      `;
    } else {
      // Open journal diary & steaming morning cup
      motif = `
        <ellipse cx="64" cy="64" rx="46" ry="7" fill="${ochre}"/>
        <path d="M22,58 L56,54 L56,24 L22,28 Z" fill="#FFFDF9" stroke="${ink}" stroke-width="1.15"/>
        <path d="M56,54 L90,58 L90,28 L56,24 Z" fill="#FAF6EE" stroke="${ink}" stroke-width="1.15"/>
        <rect x="94" y="44" width="16" height="16" rx="2" fill="${clay}" stroke="${ink}" stroke-width="1.15"/>
        <path d="M100,38 Q97,32 102,26 M105,39 Q102,33 107,27" fill="none" stroke="${inkSoft}" stroke-width="0.9"/>
      `;
    }
  }

  return `
    <svg viewBox="0 0 128 84" width="${width}" height="${height}" class="editorial-sketch-svg" role="img" aria-label="${cat} vignette" style="flex-shrink:0;border-radius:8px;background:${paperBg};border:1px solid rgba(25,24,22,0.14)">
      ${motif}
    </svg>
  `;
}

/* ============================================================================
   4D ORBITAL FAMILY DYNASTY, PROMISES & WASTA SOCIAL CONSTELLATION DIAGRAM
   Now embeds live circular ink portraits for every orbiting person!
   ========================================================================== */
export function renderSocialConstellationSvg(S) {
  const cx = 420, cy = 152;
  const rings = [
    { r: 58, label: 'SANCTUM' },
    { r: 102, label: 'BLOODLINE' },
    { r: 138, label: 'WASTA & WORLD' }
  ];

  const innerIds = [...(S.relations.spouseIds || []), ...(S.relations.partnerId ? [S.relations.partnerId] : []), ...(S.relations.childIds || [])];
  const midIds = [S.relations.fatherId, S.relations.motherId, ...(S.relations.siblingIds || [])].filter(Boolean);
  const outerIds = [...(S.relations.friendIds || []), ...(S.relations.bossId ? [S.relations.bossId] : []), ...(S.relations.inLawIds || [])];

  const turnSpin = ((S.turn || 0) % 24) * 0.04; // Subtle living orbital drift as months advance!
  const seen = new Set();
  const buildOrbit = (ids, radius, phaseOffset) => {
    const valid = [];
    for (const id of ids) {
      if (!id || seen.has(id)) continue;
      const p = S.people[id];
      if (!p || !p.alive) continue;
      seen.add(id);
      valid.push(p);
    }
    return valid.slice(0, 8).map((p, idx) => {
      const ang = phaseOffset + turnSpin + (idx / Math.max(1, valid.length)) * Math.PI * 2;
      return {
        p,
        x: cx + Math.cos(ang) * radius * 2.15,
        y: cy + Math.sin(ang) * radius * 0.88
      };
    });
  };

  const nodes = [
    ...buildOrbit(innerIds, rings[0].r, -Math.PI / 2),
    ...buildOrbit(midIds, rings[1].r, -Math.PI / 4),
    ...buildOrbit(outerIds, rings[2].r, 0.25)
  ];

  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const playerImg = resolveInkPortraitFile(S.player);

  return `
    <svg viewBox="0 0 840 304" width="100%" height="268" role="img" aria-label="4D Kinship &amp; Wasta Social Constellation" style="background:#FAF7F0;border:1px solid rgba(20,20,19,0.16);border-radius:12px;display:block;margin-bottom:12px">
      <defs>
        <radialGradient id="constCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(200,75,49,0.18)"/>
          <stop offset="100%" stop-color="rgba(200,75,49,0)"/>
        </radialGradient>
        <clipPath id="constPlayerClip">
          <circle cx="${cx}" cy="${cy}" r="18"/>
        </clipPath>
        ${nodes.map((nd, idx) => `<clipPath id="constNodeClip_${idx}"><circle cx="0" cy="0" r="13.5"/></clipPath>`).join('')}
      </defs>

      <circle cx="${cx}" cy="${cy}" r="145" fill="url(#constCoreGlow)"/>

      <!-- Concentric Elliptical Kinship Orbits -->
      ${rings.map(rg => `
        <ellipse cx="${cx}" cy="${cy}" rx="${(rg.r * 2.15).toFixed(1)}" ry="${(rg.r * 0.88).toFixed(1)}" fill="none" stroke="rgba(20,20,19,0.10)" stroke-width="0.9" stroke-dasharray="4 3"/>
        <text x="${cx + rg.r * 2.15 - 6}" y="${cy - 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="6.8" font-weight="700" fill="#7D7569">${rg.label}</text>
      `).join('')}

      <!-- Curved Bezier Relationship Filaments -->
      ${nodes.map(nd => {
        const aff = nd.p.rel?.affection ?? 60;
        const res = nd.p.rel?.resentment ?? 0;
        const hasOpenPromise = (nd.p.rel?.promises || []).some(pr => pr.status === 'open');
        const canWasta = ((nd.p.rel?.respect || 0) + (nd.p.rel?.trust || 0)) >= 108 && (nd.p.career?.monthlyIncomeLocal || 0) > 0;
        const stroke = res >= 40 ? '#B42318' : canWasta ? '#A97115' : aff >= 70 ? '#186A47' : '#524C43';
        const sw = (1.0 + (aff / 100) * 1.8).toFixed(2);
        const mx = (cx + nd.x) / 2;
        const my = (cy + nd.y) / 2 - 14;
        return `
          <path d="M${cx},${cy} Q${mx.toFixed(1)},${my.toFixed(1)} ${nd.x.toFixed(1)},${nd.y.toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="0.62" ${hasOpenPromise ? 'stroke-dasharray="4 2"' : ''}/>
        `;
      }).join('')}

      <!-- Player Center Portrait Sun Node -->
      <circle cx="${cx}" cy="${cy}" r="20" fill="#FAF6EE" stroke="#C84B31" stroke-width="2.4"/>
      <image href="assets/portraits/${playerImg}" x="${cx - 18}" y="${cy - 18}" width="36" height="36" clip-path="url(#constPlayerClip)" preserveAspectRatio="xMidYMid slice"/>
      <circle cx="${cx}" cy="${cy}" r="18.5" fill="none" stroke="#C84B31" stroke-width="1.8"/>

      <!-- Orbiting NPC Portrait Nodes -->
      ${nodes.map((nd, idx) => {
        const aff = Math.round(nd.p.rel?.affection ?? 60);
        const res = nd.p.rel?.resentment ?? 0;
        const canWasta = ((nd.p.rel?.respect || 0) + (nd.p.rel?.trust || 0)) >= 108 && (nd.p.career?.monthlyIncomeLocal || 0) > 0;
        const ringCol = res >= 40 ? '#B42318' : canWasta ? '#A97115' : aff >= 70 ? '#186A47' : '#1D3557';
        const pImg = resolveInkPortraitFile(nd.p);
        return `
          <g transform="translate(${nd.x.toFixed(1)}, ${nd.y.toFixed(1)})">
            <circle cx="0" cy="0" r="14.5" fill="#FFFEFA" stroke="${ringCol}" stroke-width="2.1"/>
            <image href="assets/portraits/${pImg}" x="-13.5" y="-13.5" width="27" height="27" clip-path="url(#constNodeClip_${idx})" preserveAspectRatio="xMidYMid slice"/>
            <circle cx="0" cy="0" r="13.8" fill="none" stroke="${ringCol}" stroke-width="1.6"/>
            <rect x="-36" y="16" width="72" height="12" rx="4" fill="rgba(255,254,250,0.94)" stroke="rgba(20,20,19,0.14)" stroke-width="0.7"/>
            <text x="0" y="24.5" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="7.2" font-weight="700" fill="#141413">${esc(nd.p.firstName)} · ${aff}%</text>
          </g>
        `;
      }).join('')}

      <!-- Legend -->
      <g transform="translate(14, 288)" font-family="JetBrains Mono, monospace" font-size="7.2" fill="#524C43">
        <text x="0" y="0">● <tspan fill="#186A47" font-weight="700">Deep Bond (70%+)</tspan>   ● <tspan fill="#A97115" font-weight="700">Wasta Vouch Ready</tspan>   ● <tspan fill="#B42318" font-weight="700">High Resentment</tspan>   ╌╌ Open Promise</text>
      </g>
    </svg>
  `;
}
