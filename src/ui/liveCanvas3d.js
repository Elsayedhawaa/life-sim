/* ============================================================================
   World Life — Isometric Architectural Cutaway & Automotive Studio Engine
   - 1. Precision 30° Axonometric Architectural Diorama for all 11 Property
        Archetypes with 3 Architectural Modes:
          • Exterior Elevation (stone coursing, mashrabiya, palms, pool caustics)
          • 1.20m AFF Section Cutaway (dark poché wall cuts + full room furniture)
          • Exploded Story Stack (floors lifted vertically w/ datum callouts)
        plus Solar Time-of-Day (Dawn 06:00 · Noon 13:00 · Maghrib 18:00 · Night).
   - 2. Studio Automotive Wind-Tunnel & Engineering Showcase.
   (The soul diagram was removed: it only re-drew the four
   numbers already shown as stat bars in the HUD.)
   ========================================================================== */

import { furnishedRoomsWithKeys } from './planRoomLookup.js';

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function shadeHex(hex, factor) {
  if (!hex || String(hex).startsWith('rgb')) return hex || '#CCCCCC';
  const clean = String(hex).replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean.padEnd(6, '8');
  const r = clamp(Math.round(parseInt(full.slice(0, 2), 16) * factor), 0, 255);
  const g = clamp(Math.round(parseInt(full.slice(2, 4), 16) * factor), 0, 255);
  const b = clamp(Math.round(parseInt(full.slice(4, 6), 16) * factor), 0, 255);
  return `rgb(${r},${g},${b})`;
}

/* ============================================================================
   2. PRECISION 30° AXONOMETRIC ARCHITECTURAL DIORAMA & EXPLODED STORY STACK
   ========================================================================== */

const AXO_YAW = 0.68;   // Fixed crisp 39° architectural three-quarter view
const AXO_PITCH = 0.50; // Classic 28.6° axonometric elevation angle

function projectAxo(x, y, z, scale, cx, cy) {
  const cosY = Math.cos(AXO_YAW), sinY = Math.sin(AXO_YAW);
  const rx = x * cosY - z * sinY;
  const rz = x * sinY + z * cosY;

  const cosP = Math.cos(AXO_PITCH), sinP = Math.sin(AXO_PITCH);
  const ry = y * cosP - rz * sinP;
  const depth = y * sinP + rz * cosP;

  return {
    sx: cx + rx * scale,
    sy: cy - ry * scale,
    depth
  };
}

function pushFace(faces, pts3d, baseHex, stroke = 'rgba(28,25,23,0.34)', lightVec = [0.48, 0.76, -0.44], bias = 0, lineWidth = 0.8) {
  if (pts3d.length < 3) return;
  const [a, b, c] = pts3d;
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  const dot = (nx / len) * lightVec[0] + (ny / len) * lightVec[1] + (nz / len) * lightVec[2];
  const factor = clamp(0.62 + (dot + 0.35) * 0.36, 0.52, 1.18);
  faces.push({ pts3d, fill: shadeHex(baseHex, factor), stroke, depthBias: bias, lineWidth });
}

function addPrism(faces, cx, y0, cz, w, h, d, wallHex, topHex, opts = {}) {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const z0 = cz - d / 2, z1 = cz + d / 2;
  const y1 = y0 + h;
  const lv = opts.lightVec || [0.48, 0.76, -0.44];
  const st = opts.stroke === undefined ? 'rgba(28,25,23,0.35)' : opts.stroke;
  const bias = opts.bias || 0;

  pushFace(faces, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], wallHex, st, lv, bias);
  pushFace(faces, [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]], wallHex, st, lv, bias);
  pushFace(faces, [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]], wallHex, st, lv, bias);
  pushFace(faces, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], wallHex, st, lv, bias);
  if (!opts.openTop) {
    pushFace(faces, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], topHex || wallHex, st, lv, bias - 0.3);
  }
}

/* Cutaway Section Wall: 1.2m low front/right walls with dark architectural poché top cap! */
function addSectionShell(faces, cx, y0, cz, w, fullH, d, wallHex, floorHex, lv) {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const z0 = cz - d / 2, z1 = cz + d / 2;
  const cutH = Math.min(fullH * 0.34, 6.2);
  const thick = 2.4;
  const pocheHex = '#292524'; // Classic architectural section cut poché

  // Floor slab + interior flooring surface
  addPrism(faces, cx, y0, cz, w, 1.4, d, '#D6CFC2', floorHex, { lightVec: lv, bias: 2 });

  // Full-height Back Wall (+Z) and Left Wall (-X) so interior reads like an architectural model!
  addPrism(faces, cx, y0 + 1.4, z1 - thick / 2, w, fullH, thick, wallHex, pocheHex, { lightVec: lv });
  addPrism(faces, x0 + thick / 2, y0 + 1.4, cz, thick, fullH, d, wallHex, pocheHex, { lightVec: lv });

  // Low Cutaway Front Wall (-Z) and Right Wall (+X) capped with dark poché!
  addPrism(faces, cx, y0 + 1.4, z0 + thick / 2, w, cutH, thick, wallHex, pocheHex, { lightVec: lv, bias: -1 });
  addPrism(faces, x1 - thick / 2, y0 + 1.4, cz, thick, cutH, d, wallHex, pocheHex, { lightVec: lv, bias: -1 });
}

/* Detailed 3D Interior Room Partitions & Scale Furniture */
function populateFloorInterior3D(faces, cx, yBase, cz, w, d, furnishedRooms = {}, isUpper = false, lv = [0.48, 0.76, -0.44]) {
  const y = yBase + 1.5;
  const poche = '#3F3A36';

  // Interior cross partitions with doorways
  addPrism(faces, cx - w * 0.06, y, cz + d * 0.14, 1.5, 5.5, d * 0.62, '#EFE9DC', poche, { lightVec: lv });
  addPrism(faces, cx + w * 0.18, y, cz - d * 0.04, w * 0.52, 5.5, 1.5, '#EFE9DC', poche, { lightVec: lv });

  if (!isUpper) {
    // 1. Living Salon (Front-Left): Persian Rug + L-Sectional Sofa + Coffee Table + Media Console
    const lx = cx - w * 0.27, lz = cz - d * 0.18;
    const hasLiv = !!furnishedRooms.living;
    pushFace(faces, [
      [lx - 11, y + 0.15, lz - 8], [lx + 11, y + 0.15, lz - 8],
      [lx + 11, y + 0.15, lz + 8], [lx - 11, y + 0.15, lz + 8]
    ], hasLiv ? '#991B1B' : '#D6CFC2', 'rgba(182,125,30,0.6)', lv, 0.8);
    addPrism(faces, lx - 2, y + 0.2, lz + 4.5, 15, 2.8, 4.8, hasLiv ? '#1E3A5F' : '#94A3B8', hasLiv ? '#2B4C7E' : '#CBD5E1', { lightVec: lv });
    addPrism(faces, lx - 7.2, y + 0.2, lz - 0.5, 4.6, 2.8, 12, hasLiv ? '#1E3A5F' : '#94A3B8', hasLiv ? '#2B4C7E' : '#CBD5E1', { lightVec: lv });
    addPrism(faces, lx + 1.5, y + 0.2, lz - 1.2, 7.5, 1.5, 4.5, '#78350F', '#D97706', { lightVec: lv });
    // Dining Table + 4 Chairs
    addPrism(faces, lx + 2, y + 0.2, lz + 15, 11, 2.4, 6.5, '#78350F', '#FEF3C7', { lightVec: lv });

    // 2. Chef Kitchen (Back-Right): L-Counter + Marble Island + Stainless Fridge
    const kx = cx + w * 0.24, kz = cz + d * 0.24;
    const hasKit = !!furnishedRooms.kitchen;
    addPrism(faces, kx, y + 0.2, kz + 5, 18, 3.6, 4.4, '#334155', hasKit ? '#F8FAFC' : '#CBD5E1', { lightVec: lv });
    addPrism(faces, kx + 7, y + 0.2, kz - 1, 4.2, 3.6, 12, '#334155', hasKit ? '#F8FAFC' : '#CBD5E1', { lightVec: lv });
    addPrism(faces, kx - 7.5, y + 0.2, kz + 4.8, 4.4, 7.2, 4.4, '#94A3B8', '#CBD5E1', { lightVec: lv }); // Fridge
    addPrism(faces, kx - 1, y + 0.2, kz - 2.5, 9.5, 3.4, 4.2, '#475569', '#FFFBEB', { lightVec: lv }); // Island

    // 3. Guest Majlis / Study (Front-Right)
    const mx = cx + w * 0.24, mz = cz - d * 0.24;
    addPrism(faces, mx, y + 0.2, mz - 3, 16, 2.4, 4.2, '#92400E', '#D97706', { lightVec: lv });
    addPrism(faces, mx + 6, y + 0.2, mz + 2, 4.2, 2.4, 10, '#92400E', '#D97706', { lightVec: lv });
  } else {
    // Upper Floor: Master Suite (King Bed + Headboard + pillows + Wardrobe) & Kids Suite + Spa Bath
    const bx = cx - w * 0.25, bz = cz + d * 0.14;
    const hasBed = !!furnishedRooms.bedroom;
    addPrism(faces, bx, y + 0.2, bz, 14, 2.6, 16, '#78350F', hasBed ? '#DBEAFE' : '#E2E8F0', { lightVec: lv });
    addPrism(faces, bx, y + 2.8, bz + 6.8, 14, 3.2, 1.8, '#451A03', '#78350F', { lightVec: lv }); // Headboard
    addPrism(faces, bx - 3.2, y + 2.8, bz + 4.2, 4.5, 0.8, 2.8, '#FFFFFF', '#FFFFFF', { lightVec: lv }); // Pillow L
    addPrism(faces, bx + 3.2, y + 2.8, bz + 4.2, 4.5, 0.8, 2.8, '#FFFFFF', '#FFFFFF', { lightVec: lv }); // Pillow R

    // Secondary Suite Twin Beds
    const kx = cx + w * 0.22, kz = cz + d * 0.20;
    addPrism(faces, kx - 4.5, y + 0.2, kz, 6.5, 2.4, 13, '#1E3A8A', '#BFDBFE', { lightVec: lv });
    addPrism(faces, kx + 4.5, y + 0.2, kz, 6.5, 2.4, 13, '#1E3A8A', '#BFDBFE', { lightVec: lv });

    // Porcelain Bathtub & Vanity (Front-Right)
    const wx = cx + w * 0.24, wz = cz - d * 0.22;
    addPrism(faces, wx, y + 0.2, wz, 11, 2.6, 6.2, '#E2E8F0', '#BAE6FD', { lightVec: lv });
  }
}

function addHippedRoof3D(faces, cx, y0, cz, w, h, d, roofHex, lv, bias = -2) {
  addPrism(faces, cx, y0, cz, w + 4, 1.4, d + 4, '#FAF6EE', '#E5DEC9', { lightVec: lv, bias });
  const ew = w + 5, ed = d + 5;
  const x0 = cx - ew / 2, x1 = cx + ew / 2;
  const z0 = cz - ed / 2, z1 = cz + ed / 2;
  const ridge = Math.max(4, (ew - ed * 0.5) / 2);
  const rx0 = ew >= ed ? cx - ridge : cx;
  const rx1 = ew >= ed ? cx + ridge : cx;
  const rz0 = ed > ew ? cz - Math.max(4, (ed - ew * 0.5) / 2) : cz;
  const rz1 = ed > ew ? cz + Math.max(4, (ed - ew * 0.5) / 2) : cz;
  const yt = y0 + 1.4 + h;
  const st = 'rgba(28,25,23,0.42)';

  pushFace(faces, [[x0, y0 + 1.4, z0], [x1, y0 + 1.4, z0], [rx1, yt, rz0], [rx0, yt, rz0]], roofHex, st, lv, bias);
  pushFace(faces, [[x1, y0 + 1.4, z1], [x0, y0 + 1.4, z1], [rx0, yt, rz1], [rx1, yt, rz1]], roofHex, st, lv, bias);
  pushFace(faces, [[x0, y0 + 1.4, z1], [x0, y0 + 1.4, z0], [rx0, yt, rz0], [rx0, yt, rz1]], roofHex, st, lv, bias);
  pushFace(faces, [[x1, y0 + 1.4, z0], [x1, y0 + 1.4, z1], [rx1, yt, rz1], [rx1, yt, rz0]], roofHex, st, lv, bias);
}

function addFacadeWindows(faces, cx, y0, zFront, cols, spanW, winW, winH, glassHex, lv) {
  for (let i = 0; i < cols; i++) {
    const wx = cols === 1 ? cx : (cx - spanW / 2) + (i / (cols - 1)) * spanW;
    // Recessed limestone frame + sill + glass
    addPrism(faces, wx, y0 - 0.8, zFront - 0.5, winW + 1.8, 0.9, 1.4, '#E7E0D0', '#FAF6EE', { lightVec: lv, bias: -0.6 });
    pushFace(faces, [
      [wx - winW / 2, y0, zFront - 0.35],
      [wx + winW / 2, y0, zFront - 0.35],
      [wx + winW / 2, y0 + winH, zFront - 0.35],
      [wx - winW / 2, y0 + winH, zFront - 0.35]
    ], glassHex, '#1C1917', lv, -0.8, 0.9);
    // Mullion crossbars
    pushFace(faces, [
      [wx - 0.3, y0, zFront - 0.42], [wx + 0.3, y0, zFront - 0.42],
      [wx + 0.3, y0 + winH, zFront - 0.42], [wx - 0.3, y0 + winH, zFront - 0.42]
    ], '#FAF6EE', null, lv, -0.9);
  }
}

function hash3DSeed(val) {
  if (val === undefined || val === null || val === 0 || val === '') return 0;
  if (typeof val === 'number' && Number.isFinite(val)) return Math.abs(Math.trunc(val * 2654435761));
  const s = String(val);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function addSteppedParapetRoof3D(faces, cx, y0, cz, w, d, wallHex, trimHex, lv, withWindTower = false) {
  // Stepped Arabesque / Najdi / Cairo limestone parapet crown
  addPrism(faces, cx, y0, cz, w + 2, 2.2, d + 2, wallHex, '#EAE2D3', { lightVec: lv, bias: -2 });
  addPrism(faces, cx, y0 + 2.2, cz, w + 3.2, 1.3, d + 3.2, trimHex, trimHex, { lightVec: lv, bias: -2.2 });
  if (withWindTower) {
    // Traditional Barjeel Windcatcher / Stair-Penthouse Lantern
    addPrism(faces, cx + w * 0.24, y0 + 2.2, cz + d * 0.14, 14, 9.5, 14, wallHex, trimHex, { lightVec: lv, bias: -2.5 });
    addPrism(faces, cx + w * 0.24, y0 + 11.7, cz + d * 0.14, 16, 1.4, 16, trimHex, trimHex, { lightVec: lv, bias: -2.8 });
  }
}

function addDatePalm3D(faces, x, z, h, lv) {
  // Segmented curved trunk
  const segs = 5;
  for (let i = 0; i < segs; i++) {
    const yA = (i / segs) * h * 0.78;
    const segH = (h * 0.78) / segs;
    addPrism(faces, x + i * 0.35, yA, z, 2.6 - i * 0.2, segH + 0.2, 2.6 - i * 0.2, '#78350F', '#92400E', { lightVec: lv });
  }
  const topX = x + 1.5, topY = h * 0.78;
  for (let f = 0; f < 8; f++) {
    const ang = (f / 8) * Math.PI * 2 + 0.25;
    const fx = topX + Math.cos(ang) * 11.5;
    const fz = z + Math.sin(ang) * 11.5;
    const mx = topX + Math.cos(ang) * 5.8;
    const mz = z + Math.sin(ang) * 5.8;
    pushFace(faces, [
      [topX, topY + 1, z],
      [mx - Math.sin(ang) * 2.1, topY + 3.4, mz + Math.cos(ang) * 2.1],
      [fx, topY - 2.6, fz],
      [mx + Math.sin(ang) * 2.1, topY + 3.4, mz - Math.cos(ang) * 2.1]
    ], f % 2 === 0 ? '#15803D' : '#16A34A', 'rgba(20,83,45,0.35)', lv, -1);
  }
}

function addCypressTree3D(faces, x, z, h, lv) {
  addPrism(faces, x, 0, z, 2.2, h * 0.22, 2.2, '#78350F', '#92400E', { lightVec: lv });
  addPrism(faces, x, h * 0.18, z, 6.8, h * 0.34, 6.8, '#14532D', '#166534', { lightVec: lv, bias: -0.6 });
  addPrism(faces, x, h * 0.48, z, 5.2, h * 0.28, 5.2, '#166534', '#15803D', { lightVec: lv, bias: -0.8 });
  addPrism(faces, x, h * 0.72, z, 3.2, h * 0.22, 3.2, '#15803D', '#22C55E', { lightVec: lv, bias: -1.0 });
}

function addBroadCanopyTree3D(faces, x, z, h, lv, autumnTint = false) {
  addPrism(faces, x, 0, z, 2.8, h * 0.38, 2.8, '#78350F', '#92400E', { lightVec: lv });
  const c1 = autumnTint ? '#B45309' : '#15803D';
  const c2 = autumnTint ? '#D97706' : '#22C55E';
  addPrism(faces, x, h * 0.34, z, 13.5, h * 0.36, 13.5, c1, c2, { lightVec: lv, bias: -0.8 });
  addPrism(faces, x + 1.5, h * 0.64, z - 1, 9.5, h * 0.24, 9.5, c1, c2, { lightVec: lv, bias: -1.0 });
}

export function buildHome3DSceneFaces(spec = {}) {
  const faces = [];
  const shape = spec.shape || 'apartment';
  const finish = spec.finishing || 'standard';
  const viewMode = spec.viewMode || (spec.cutaway ? 'cutaway' : 'elevation'); // 'elevation' | 'cutaway' | 'exploded'
  const timeOfDay = spec.timeOfDay || (spec.nightMode ? 'night' : 'noon');
  const buildPct = spec.buildPct ?? 100;
  const vHash = hash3DSeed(spec.variantSeed || 0);
  const country = String(spec.country || 'egy').toLowerCase();
  const isTemperate = ['gbr', 'deu', 'fra', 'nld', 'can', 'usa', 'jpn'].includes(country);
  const isGulfOrMena = ['egy', 'sau', 'uae', 'qat', 'kwt'].includes(country);

  const lightVec = timeOfDay === 'dawn' ? [-0.68, 0.45, -0.55]
    : timeOfDay === 'sunset' ? [0.74, 0.38, -0.54]
    : timeOfDay === 'night' ? [0.25, 0.85, -0.45]
    : [0.48, 0.78, -0.40];

  const isNight = timeOfDay === 'night' || timeOfDay === 'sunset';
  const glassHex = timeOfDay === 'night' ? '#FDE047' : timeOfDay === 'sunset' ? '#FDBA74' : '#7DD3FC';

  /* Furnished rooms are stored by room NUMBER now; the interior furniture
     below still reads the generic keys (living/kitchen/bedroom), so add the
     keys back alongside the numbers for this drawing only. */
  const furnishedRooms = furnishedRoomsWithKeys(spec.furnishedRooms, shape);

  const wallPalettes = {
    core_shell:  { wall: '#B45309', accent: '#78350F', floor: '#A8A29E', roof: '#57534E' },
    semi_finish: { wall: '#D6D3D1', accent: '#A8A29E', floor: '#D6CFC2', roof: '#64748B' },
    standard:    { wall: '#F5EFE4', accent: '#DFD5C3', floor: '#E7DEC8', roof: '#B84A32' },
    super_lux:   { wall: '#FAF7F0', accent: '#E8DFCE', floor: '#F3ECE0', roof: '#C84B31' },
    ultra_lux:   { wall: '#FFFDF9', accent: '#D97706', floor: '#FAF5EB', roof: '#1D3557' },
    royal_smart: { wall: '#FFFDFB', accent: '#B67D1E', floor: '#FEF9EE', roof: '#1E293B' }
  };
  const facadeOverrides = {
    limestone_classic:       { wall: '#FAF5E8', accent: '#DFD3BC', roof: '#B84A32' },
    najdi_sandstone:         { wall: '#DEC3A0', accent: '#B89268', roof: '#855836' },
    mediterranean_terracotta:{ wall: '#F7DFC6', accent: '#E2B48D', roof: '#C84B31' },
    modern_travertine_glass: { wall: '#EAECEF', accent: '#334155', roof: '#1E293B' },
    georgian_heritage_brick: { wall: '#9A3F32', accent: '#F1ECE1', roof: '#27272A' }
  };
  // Seed-driven micro-variation when no manual facadeStyle override is set
  const autoSeedOverrides = [
    {},
    { wall: '#FAF4E6', roof: '#9E3E2A' },
    { wall: '#EFE8DA', roof: '#1D3557' },
    { wall: '#F6E6D2', roof: '#855836' },
    { wall: '#ECEFF3', roof: '#2C5E4F' }
  ];
  const basePal = wallPalettes[finish] || wallPalettes.standard;
  const seedOvr = (!spec.facadeStyle && vHash > 0 && finish !== 'core_shell' && finish !== 'semi_finish')
    ? autoSeedOverrides[vHash % autoSeedOverrides.length]
    : {};
  const ovr = spec.facadeStyle && facadeOverrides[spec.facadeStyle] ? facadeOverrides[spec.facadeStyle] : seedOvr;
  const pal = { ...basePal, ...ovr };

  // Landscaped Cadastral Plot Plinth + Stone Boundary Coping + Driveway + Warm Streetlamps
  const plotLawn = shape === 'chalet' ? '#FDE68A' : (isGulfOrMena && vHash % 3 === 1 ? '#DCFCE7' : '#BBF7D0');
  addPrism(faces, 0, -4.5, 0, 148, 4.5, 118, '#A89F91', plotLawn, { lightVec, bias: 6 });
  addPrism(faces, 0, 0.05, -52, 148, 0.35, 12, '#334155', '#475569', { lightVec, bias: 5 });
  addPrism(faces, -4, 0.1, -30, 16, 0.35, 32, '#D6CFC2', '#EAE2D3', { lightVec, bias: 4.8 });
  // Wrought-iron streetlamps along front sidewalk
  for (const lx of [-58, 56]) {
    addPrism(faces, lx, 0.2, -45, 1.1, 13, 1.1, '#1E293B', '#334155', { lightVec, bias: -0.5 });
    addPrism(faces, lx, 13.2, -45, 2.8, 2.6, 2.8, isNight ? '#FEF08A' : '#E2E8F0', '#FEF9C3', { lightVec, bias: -0.6 });
  }
  // Custom Architectural Wing Extension (+45 m² Annex)
  if (spec.hasExtension && shape !== 'land' && buildPct >= 100) {
    addPrism(faces, -48, 0, 16, 20, 13.5, 28, pal.accent, pal.roof, { lightVec, bias: -0.2 });
    addFacadeWindows(faces, -48, 4, 2, 1, 0, 9, 6.5, glassHex, lightVec);
  }

  if (shape === 'chalet') {
    // Turquoise Mediterranean shoreline
    addPrism(faces, 0, -4.2, -50, 148, 4.4, 22, '#0369A1', '#38BDF8', { lightVec, bias: 4.9 });
  }

  // Cast Ground Shadow (Solar Angle responsive!)
  const shShiftX = timeOfDay === 'dawn' ? 14 : timeOfDay === 'sunset' ? -16 : -6;
  if (shape !== 'land') {
    pushFace(faces, [
      [-44 + shShiftX, 0.14, -22], [44 + shShiftX, 0.14, -22],
      [44 + shShiftX, 0.14, 34], [-44 + shShiftX, 0.14, 34]
    ], 'rgba(15,23,42,0.16)', null, lightVec, 4.5);
  }

  // Active Construction Site State
  if (buildPct < 100) {
    const hDone = Math.max(5, Math.round(36 * (buildPct / 100)));
    addPrism(faces, 0, 0, 6, 76, 3.5, 56, '#78716C', '#A8A29E', { lightVec });
    addPrism(faces, 0, 3.5, 6, 68, hDone, 48, '#B45309', '#9CA3AF', { lightVec });
    for (const [cx, cz] of [[-30, -15], [30, -15], [-30, 27], [30, 27]]) {
      addPrism(faces, cx, 3.5, cz, 2.8, 40, 2.8, '#D6D3D1', '#E5E7EB', { lightVec });
    }
    // Tower Crane
    addPrism(faces, 48, 0, 28, 3.6, 56, 3.6, '#EAB308', '#FACC15', { lightVec });
    addPrism(faces, 22, 53, 28, 66, 2.4, 2.4, '#EAB308', '#FACC15', { lightVec });
    faces.datums = [{ y: hDone + 4, label: `Building — ${buildPct}% done` }];
    return faces;
  }

  if (shape === 'land') {
    for (const [px, pz] of [[-52, -32], [52, -32], [-52, 38], [52, 38]]) {
      addPrism(faces, px, 0, pz, 2.4, 9, 2.4, '#DC2626', '#FEF2F2', { lightVec });
    }
    if (isTemperate) addBroadCanopyTree3D(faces, -56, 36, 26, lightVec, vHash % 2 === 1);
    else addDatePalm3D(faces, -56, 36, 28, lightVec);
    faces.datums = [{ y: 2, label: 'Your plot of land · ground level' }];
    return faces;
  }

  // Dimensions by Archetype
  const isMulti = ['duplex', 'townhouse', 'twin_house', 'villa', 'mansion'].includes(shape);
  const w = shape === 'mansion' ? 92 : shape === 'villa' ? 78 : shape === 'twin_house' ? 84 : shape === 'townhouse' ? 82 : shape === 'studio' ? 52 : 72;
  const d = shape === 'mansion' ? 60 : shape === 'villa' ? 54 : shape === 'studio' ? 42 : 50;
  const gfH = 15;
  const ufH = 14;
  const lift1F = viewMode === 'exploded' ? 22 : 0; // Vertical Exploded Story separation!
  const liftRoof = viewMode === 'exploded' ? (isMulti ? 44 : 22) : 0;
  const useFlatParapet = (country === 'egy' && shape !== 'chalet') || (isGulfOrMena && vHash % 3 === 1) || spec.facadeStyle === 'najdi_sandstone' || spec.facadeStyle === 'modern_travertine_glass';

  const datums = [{ y: 1, label: 'Ground floor · ground level' }];

  if (viewMode === 'cutaway' || viewMode === 'exploded') {
    // Ground Floor Section Cutaway + Full 3D Room Furniture
    addSectionShell(faces, 0, 0, 6, w, gfH, d, pal.wall, pal.floor, lightVec);
    populateFloorInterior3D(faces, 0, 0, 6, w, d, furnishedRooms, false, lightVec);

    if (isMulti) {
      const y1 = gfH + 1.4 + lift1F;
      datums.push({ y: y1, label: 'First floor · 3.4 m up' });
      addSectionShell(faces, 0, y1, 6, w * 0.94, ufH, d * 0.94, pal.wall, pal.floor, lightVec);
      populateFloorInterior3D(faces, 0, y1, 6, w * 0.94, d * 0.94, furnishedRooms, true, lightVec);
    }

    if (viewMode === 'exploded') {
      const yRoof = (isMulti ? gfH + ufH + 2.8 : gfH + 1.4) + liftRoof;
      datums.push({ y: yRoof + 4, label: `Roof · +${isMulti ? '6.80' : '3.60'} m up` });
      if (useFlatParapet) {
        addSteppedParapetRoof3D(faces, 0, yRoof, 6, isMulti ? w * 0.94 : w, isMulti ? d * 0.94 : d, pal.wall, pal.roof, lightVec, true);
      } else {
        addHippedRoof3D(faces, 0, yRoof, 6, isMulti ? w * 0.94 : w, 9, isMulti ? d * 0.94 : d, pal.roof, lightVec, -4);
      }
    }
  } else {
    // Crisp Full Architectural Exterior Elevation per Archetype + Seed Variants!
    if (shape === 'apartment') {
      const twW = vHash % 2 === 1 ? 62 : 66;
      addPrism(faces, 0, 0, 6, twW, 46, 46, pal.wall, pal.accent, { lightVec });
      if (vHash % 3 === 1) {
        addHippedRoof3D(faces, 0, 46, 6, twW, 6.5, 46, pal.roof, lightVec);
      } else {
        addPrism(faces, 0, 46, 6, twW + 4, 2.8, 50, pal.roof, pal.roof, { lightVec });
      }
      for (const fy of [6, 18, 30]) {
        addFacadeWindows(faces, 0, fy, -17, 3, 40, 10, 7.5, glassHex, lightVec);
        const balX = vHash % 2 === 1 ? (fy === 18 ? -12 : 12) : 0;
        addPrism(faces, balX, fy - 1.2, -19.5, 20, 1.2, 5, '#FAF6EE', '#CBD5E1', { lightVec, bias: -1 });
        addPrism(faces, balX, fy, -21.8, 20, 3.0, 0.5, '#7DD3FC', '#E0F2FE', { lightVec, bias: -1.2 });
      }
      addPrism(faces, 0, 0, -18.5, 16, 8.5, 4, '#78350F', pal.roof, { lightVec, bias: -1 });
      datums.push({ y: 48, label: 'Top of the tower · 14.5 m up' });
    } else if (shape === 'penthouse') {
      addPrism(faces, 0, 0, 8, 76, 20, 52, '#E2E8F0', '#CBD5E1', { lightVec });
      const pavX = vHash % 2 === 1 ? 6 : -6;
      addPrism(faces, pavX, 20, 12, 50, 16, 34, pal.wall, pal.accent, { lightVec });
      addPrism(faces, pavX, 36, 12, 56, 2.2, 40, pal.roof, pal.roof, { lightVec });
      addFacadeWindows(faces, pavX, 22, -5, 2, 26, 16, 11, glassHex, lightVec);
      addPrism(faces, pavX > 0 ? -24 : 24, 20.2, -6, 20, 2.4, 16, '#F8FAFC', '#38BDF8', { lightVec, bias: -1 });
      datums.push({ y: 38, label: 'Penthouse terrace · 42 m up' });
    } else if (shape === 'villa' || shape === 'mansion') {
      const mainW = shape === 'mansion' ? 62 : 54;
      addPrism(faces, -6, 0, 8, mainW, 16, 48, pal.wall, pal.accent, { lightVec });
      addPrism(faces, -6, 16, 8, mainW * 0.92, 14, 44, pal.wall, pal.accent, { lightVec });
      if (useFlatParapet) {
        addSteppedParapetRoof3D(faces, -6, 30, 8, mainW * 0.92, 44, pal.wall, pal.roof, lightVec, true);
      } else {
        addHippedRoof3D(faces, -6, 30, 8, mainW * 0.92, 9.5, 44, pal.roof, lightVec);
        if (isTemperate || vHash % 3 === 2) {
          // Heritage brick/stone chimney stack
          addPrism(faces, 10, 32, 18, 4.8, 11, 4.8, '#78350F', '#451A03', { lightVec, bias: -3 });
        }
      }

      // Side Majlis / Wing(s)
      addPrism(faces, 32, 0, 10, 26, 14, 40, pal.accent, pal.wall, { lightVec });
      if (useFlatParapet) {
        addSteppedParapetRoof3D(faces, 32, 14, 10, 26, 40, pal.accent, pal.roof, lightVec, false);
      } else {
        addHippedRoof3D(faces, 32, 14, 10, 26, 6.5, 40, pal.roof, lightVec);
      }
      if (shape === 'mansion') {
        addPrism(faces, -44, 0, 10, 24, 15, 40, pal.accent, pal.wall, { lightVec });
        if (useFlatParapet) {
          addSteppedParapetRoof3D(faces, -44, 15, 10, 24, 40, pal.accent, pal.roof, lightVec, false);
        } else {
          addHippedRoof3D(faces, -44, 15, 10, 24, 6.5, 40, pal.roof, lightVec);
        }
      }

      // Classical Entry Portico Columns + Balcony
      addPrism(faces, -6, 0, -18, 20, 1.8, 8, '#EAE2D3', '#FAF6EE', { lightVec, bias: -0.8 });
      addPrism(faces, -14, 1.8, -20.5, 2.2, 14.2, 2.2, '#FFFDF9', '#EAE2D3', { lightVec, bias: -1 });
      addPrism(faces, 2, 1.8, -20.5, 2.2, 14.2, 2.2, '#FFFDF9', '#EAE2D3', { lightVec, bias: -1 });
      addPrism(faces, -6, 16, -18, 22, 1.6, 8, '#FAF6EE', '#E5DEC9', { lightVec, bias: -1 });

      addFacadeWindows(faces, -6, 4, -16, 2, 30, 11, 8.5, glassHex, lightVec);
      addFacadeWindows(faces, -6, 19, -14, 2, 28, 10, 7.5, glassHex, lightVec);
      addFacadeWindows(faces, 32, 4, -10, 1, 0, 12, 8, glassHex, lightVec);
      datums.push({ y: 40, label: shape === 'mansion' ? 'Mansion roof · 9.8 m up' : 'Villa roof · 8.4 m up' });
    } else if (shape === 'twin_house' || shape === 'townhouse') {
      const units = shape === 'townhouse' ? [-26, 0, 26] : [-20, 20];
      const uw = shape === 'townhouse' ? 25 : 38;
      units.forEach((ux, idx) => {
        const uWall = idx % 2 === 0 ? pal.wall : pal.accent;
        const uRoof = idx === 1 && shape === 'townhouse' ? '#1D3557' : pal.roof;
        addPrism(faces, ux, 0, 8, uw, 27, 46, uWall, uWall, { lightVec });
        if (useFlatParapet) {
          addSteppedParapetRoof3D(faces, ux, 27, 8, uw, 46, uWall, uRoof, lightVec, false);
        } else {
          addHippedRoof3D(faces, ux, 27, 8, uw, 7.5, 46, uRoof, lightVec);
        }
        addFacadeWindows(faces, ux, 4, -15, 1, 0, 11, 8, glassHex, lightVec);
        addFacadeWindows(faces, ux, 16, -15, 1, 0, 11, 7.5, glassHex, lightVec);
      });
      datums.push({ y: 35, label: `${shape.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} roof · 7.6 m up` });
    } else if (shape === 'duplex') {
      addPrism(faces, -10, 0, 8, 48, 30, 46, pal.wall, pal.accent, { lightVec });
      addPrism(faces, 26, 0, 10, 26, 17, 42, pal.accent, pal.wall, { lightVec });
      if (useFlatParapet) {
        addSteppedParapetRoof3D(faces, -10, 30, 8, 48, 46, pal.wall, pal.roof, lightVec, false);
      } else {
        addHippedRoof3D(faces, -10, 30, 8, 48, 8, 46, pal.roof, lightVec);
      }
      addFacadeWindows(faces, -10, 4, -15, 2, 22, 12, 21, glassHex, lightVec);
      addFacadeWindows(faces, 26, 5, -11, 1, 0, 12, 8, glassHex, lightVec);
      datums.push({ y: 38, label: 'Duplex roof · 7.8 m up' });
    } else if (shape === 'chalet') {
      addPrism(faces, 0, 0, 6, 74, 2.4, 54, '#92400E', '#D97706', { lightVec });
      addPrism(faces, 0, 2.4, 10, 58, 17, 40, pal.wall, '#FEF3C7', { lightVec });
      if (vHash % 2 === 1) {
        addSteppedParapetRoof3D(faces, 0, 19.4, 10, 58, 40, pal.wall, '#0284C7', lightVec, false);
      } else {
        addHippedRoof3D(faces, 0, 19.4, 10, 62, 11, 44, '#D97706', lightVec);
      }
      addFacadeWindows(faces, 0, 5, -10, 2, 28, 15, 10, glassHex, lightVec);
      datums.push({ y: 31, label: 'Chalet roof · 6.2 m up' });
    } else if (shape === 'commercial') {
      addPrism(faces, 0, 0, 8, 80, 28, 48, '#F1F5F9', '#CBD5E1', { lightVec });
      addPrism(faces, 0, 13, -17.5, 84, 3.8, 5, pal.roof, pal.roof, { lightVec, bias: -1 });
      addFacadeWindows(faces, 0, 2, -16, 3, 50, 15, 10, '#BAE6FD', lightVec);
      addFacadeWindows(faces, 0, 18, -16, 3, 50, 13, 7, glassHex, lightVec);
      datums.push({ y: 30, label: 'Shop roof · 7.2 m up' });
    } else {
      addPrism(faces, 0, 0, 8, 50, 19, 40, pal.wall, pal.accent, { lightVec });
      if (useFlatParapet) {
        addSteppedParapetRoof3D(faces, 0, 19, 8, 50, 40, pal.wall, pal.roof, lightVec, false);
      } else {
        addHippedRoof3D(faces, 0, 19, 8, 50, 7.5, 40, pal.roof, lightVec);
      }
      addFacadeWindows(faces, 0, 4, -12, 1, 0, 18, 10, glassHex, lightVec);
      datums.push({ y: 27, label: 'Studio roof · 4.8 m up' });
    }
  }

  // Swimming Pool OR Courtyard Stone Fountain (varied by seed & upgrades)
  if (spec.hasPool || shape === 'mansion' || (shape === 'villa' && finish === 'royal_smart')) {
    addPrism(faces, 44, 0.2, -26, 34, 2.0, 22, '#FAF6EE', '#FAF6EE', { lightVec, bias: -0.4 });
    addPrism(faces, 44, 0.5, -26, 29, 1.9, 17, '#0284C7', isNight ? '#38BDF8' : '#0EA5E9', { lightVec, bias: -0.6 });
  } else if (vHash % 3 === 1 && shape !== 'studio') {
    // Octagonal Courtyard Limestone Fountain
    addPrism(faces, 42, 0.2, -26, 14, 2.0, 14, '#EAE2D3', '#FAF6EE', { lightVec, bias: -0.4 });
    addPrism(faces, 42, 0.6, -26, 10, 1.8, 10, '#0284C7', '#38BDF8', { lightVec, bias: -0.5 });
    addPrism(faces, 42, 2.2, -26, 2.4, 3.6, 2.4, '#FAF6EE', '#BAE6FD', { lightVec, bias: -0.6 });
  }

  // Rooftop Photovoltaic Solar Array (when installed & roof visible)
  if (spec.hasSolar && viewMode !== 'cutaway') {
    const sy = viewMode === 'exploded' ? ((isMulti ? gfH + ufH + 2.8 : gfH + 1.4) + liftRoof + 8) : (shape === 'apartment' ? 49 : 34);
    addPrism(faces, -8, sy, 8, 24, 1.1, 14, '#0F172A', '#1E3A8A', { lightVec, bias: -5 });
  }

  // Parked Player Car on Travertine Driveway
  if (spec.parkedCarColor) {
    addPrism(faces, -46, 0.4, -26, 15, 4.0, 26, spec.parkedCarColor, spec.parkedCarColor, { lightVec, bias: -1 });
    addPrism(faces, -46, 4.4, -25, 12.5, 3.2, 14, '#BAE6FD', spec.parkedCarColor, { lightVec, bias: -1.2 });
  }

  // Regional & Seed-Randomized Botanical Landscaping (Date Palms vs Tuscan Cypresses vs Temperate Oaks)
  if (isTemperate) {
    addBroadCanopyTree3D(faces, -58, 34, 26, lightVec, vHash % 3 === 2);
    addCypressTree3D(faces, 58, 34, 27, lightVec);
  } else if (vHash % 3 === 1) {
    addCypressTree3D(faces, -58, 34, 28, lightVec);
    addDatePalm3D(faces, 58, 34, 26, lightVec);
  } else if (vHash % 3 === 2) {
    addDatePalm3D(faces, -58, 34, 27, lightVec);
    addBroadCanopyTree3D(faces, 58, 34, 24, lightVec, false);
  } else {
    addDatePalm3D(faces, -58, 34, 27, lightVec);
    addDatePalm3D(faces, 58, 34, 25, lightVec);
  }

  faces.datums = datums;
  return faces;
}

export function renderArchitecturalDioramaCanvas(canvas, spec = {}) {
  if (!canvas || !canvas.getContext) return;
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? Math.min(2, window.devicePixelRatio) : 1;
  const cssW = canvas.clientWidth || Number(canvas.getAttribute('width')) || 520;
  const cssH = canvas.clientHeight || Number(canvas.getAttribute('height')) || 276;
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }

  const timeOfDay = spec.timeOfDay || (spec.nightMode ? 'night' : 'noon');
  const viewMode = spec.viewMode || (spec.cutaway ? 'cutaway' : 'elevation');
  const vHash = hash3DSeed(spec.variantSeed || 0);
  const built = buildHome3DSceneFaces(spec);
  const faces = Array.isArray(built) ? built : (built.faces || []);
  const datums = built.datums || [];

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);

  // Atmospheric Sky Gradient by Solar Hour
  const grad = ctx.createLinearGradient(0, 0, 0, cssH);
  if (timeOfDay === 'night') {
    grad.addColorStop(0, '#0B132B');
    grad.addColorStop(0.6, '#1C2541');
    grad.addColorStop(1, '#283655');
  } else if (timeOfDay === 'sunset') {
    grad.addColorStop(0, '#3B2F63');
    grad.addColorStop(0.52, '#C85A32');
    grad.addColorStop(1, '#F6C28B');
  } else if (timeOfDay === 'dawn') {
    grad.addColorStop(0, '#7FA6C9');
    grad.addColorStop(0.58, '#E8C5B0');
    grad.addColorStop(1, '#FAF3E6');
  } else {
    grad.addColorStop(0, '#CBE4F9');
    grad.addColorStop(0.58, '#EBF5FC');
    grad.addColorStop(1, '#F8F4EC');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cssW, cssH);

  // Procedural Atmospheric Sky Details (Stars at Night; Watercolor Clouds & Birds by Day)
  if (timeOfDay === 'night') {
    ctx.fillStyle = 'rgba(254, 249, 195, 0.68)';
    for (let s = 0; s < 18; s++) {
      const sx = ((vHash + s * 97) % 940) / 940 * cssW;
      const sy = ((vHash * 3 + s * 53) % 420) / 1000 * cssH;
      ctx.beginPath();
      ctx.arc(sx, sy, (s % 3 === 0) ? 1.3 : 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = timeOfDay === 'sunset' ? 'rgba(254, 215, 170, 0.34)' : 'rgba(255, 255, 255, 0.52)';
    for (let c = 0; c < 3; c++) {
      // Keep the whole cloud inside the canvas on narrow phones.
      const clX = Math.max(36, Math.min(((vHash + c * 280) % 820) / 820 * (cssW * 0.82) + cssW * 0.08, cssW - 42));
      const clY = 22 + ((vHash + c * 17) % 34);
      ctx.beginPath();
      ctx.ellipse(clX, clY, 34, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(clX + 18, clY - 4, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Subtle architectural drafting horizon grid & Solar Arc Curve!
  // On narrow screens the arc's ends run past the left/right edges, so
  // clamp its angles to where the circle meets the canvas edges.
  ctx.strokeStyle = timeOfDay === 'night' ? 'rgba(255,255,255,0.12)' : 'rgba(28,25,23,0.10)';
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  const arcR = cssH * 0.76;
  const edgeCos = (cssW * 0.5) / arcR;
  const arcHalf = edgeCos < 1 ? Math.asin(edgeCos) : Math.PI * 0.38;
  ctx.arc(cssW * 0.5, cssH * 0.88, arcR, Math.PI * 1.5 - arcHalf, Math.PI * 1.5 + arcHalf);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sun / Moon position along the Solar Arc (clamped inside the canvas so
  // the orb never slides off the edge on a narrow phone).
  const sunT = timeOfDay === 'dawn' ? 0.18 : timeOfDay === 'noon' ? 0.50 : timeOfDay === 'sunset' ? 0.82 : 0.76;
  const sunAng = Math.PI * (1.12 + sunT * 0.76);
  const orbX = Math.max(22, Math.min(cssW - 22, cssW * 0.5 + Math.cos(sunAng) * cssH * 0.76));
  const orbY = Math.max(22, Math.min(cssH - 22, cssH * 0.88 + Math.sin(sunAng) * cssH * 0.76));
  ctx.beginPath();
  ctx.arc(orbX, orbY, 20, 0, Math.PI * 2);
  ctx.fillStyle = timeOfDay === 'night' ? 'rgba(254,240,138,0.16)' : 'rgba(251,191,36,0.24)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(orbX, orbY, 10.5, 0, Math.PI * 2);
  ctx.fillStyle = timeOfDay === 'night' ? '#FEF08A' : timeOfDay === 'sunset' ? '#FB923C' : '#FBBF24';
  ctx.fill();

  const scale0 = viewMode === 'exploded'
    ? Math.min(cssW, cssH * 1.85) / 215
    : Math.min(cssW, cssH * 1.78) / 184;
  let scale = scale0;
  let cx = cssW * 0.48;
  let cy = viewMode === 'exploded' ? cssH * 0.79 : cssH * 0.69;

  // Fit the whole diorama inside the canvas. The ground plinth's projected
  // footprint used to run past the bottom edge (and the left edge on phones),
  // so the drawing looked cut off. Shrink only if needed, then shift just
  // enough to bring every face inside the margins.
  const projectBounds = (sc, ox, oy) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const take = (x, y, z) => {
      const q = projectAxo(x, y, z, sc, ox, oy);
      if (q.sx < minX) minX = q.sx;
      if (q.sx > maxX) maxX = q.sx;
      if (q.sy < minY) minY = q.sy;
      if (q.sy > maxY) maxY = q.sy;
    };
    for (const f of faces) for (const p of f.pts3d) take(p[0], p[1], p[2]);
    // In exploded mode the dashed structural axes rise to y=76, above the
    // roof itself: include their tops or they poke out of the canvas top.
    if (viewMode === 'exploded') {
      for (const [ax, az] of [[-36, -18], [36, -18], [-36, 30], [36, 30]]) take(ax, 76, az);
    }
    return { minX, maxX, minY, maxY };
  };
  if (faces.length) {
    let b = projectBounds(scale, cx, cy);
    if (Number.isFinite(b.minX)) {
      const fit = Math.min(1, (cssW - 16) / (b.maxX - b.minX), (cssH - 12) / (b.maxY - b.minY));
      if (fit < 1) {
        scale *= fit;
        b = projectBounds(scale, cx, cy);
      }
      if (b.minX < 8) cx += 8 - b.minX;
      else if (b.maxX > cssW - 8) cx -= b.maxX - (cssW - 8);
      if (b.minY < 6) cy += 6 - b.minY;
      else if (b.maxY > cssH - 6) cy -= b.maxY - (cssH - 6);
    }
  }

  // In Exploded Story Mode, draw vertical dashed structural alignment axes first
  if (viewMode === 'exploded') {
    ctx.strokeStyle = timeOfDay === 'night' ? 'rgba(254,240,138,0.45)' : 'rgba(200,75,49,0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    for (const [ax, az] of [[-36, -18], [36, -18], [-36, 30], [36, 30]]) {
      const pBot = projectAxo(ax, 0, az, scale, cx, cy);
      const pTop = projectAxo(ax, 76, az, scale, cx, cy);
      ctx.beginPath();
      ctx.moveTo(pBot.sx, pBot.sy);
      ctx.lineTo(pTop.sx, pTop.sy);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  const projected = faces.map(f => {
    const pts = f.pts3d.map(p => projectAxo(p[0], p[1], p[2], scale, cx, cy));
    const avgDepth = (pts.reduce((s, p) => s + p.depth, 0) / pts.length) + (f.depthBias || 0);
    return { pts, fill: f.fill, stroke: f.stroke, avgDepth, lw: f.lineWidth || 0.8 };
  });
  projected.sort((a, b) => b.avgDepth - a.avgDepth);

  for (const pf of projected) {
    ctx.beginPath();
    ctx.moveTo(pf.pts[0].sx, pf.pts[0].sy);
    for (let i = 1; i < pf.pts.length; i++) ctx.lineTo(pf.pts[i].sx, pf.pts[i].sy);
    ctx.closePath();
    ctx.fillStyle = pf.fill;
    ctx.fill();
    if (pf.stroke) {
      ctx.strokeStyle = pf.stroke;
      ctx.lineWidth = pf.lw;
      ctx.stroke();
    }
  }

  // Architectural Elevation Datum Callout Leader Lines on Right Side!
  // The box is sized to the measured label text: the longest labels
  // (penthouse terrace, land survey) are wider than the old fixed 160px
  // box and their text used to run past the canvas edge.
  ctx.font = '700 9.5px "JetBrains Mono", monospace';
  for (const dt of datums) {
    const anchor = projectAxo(46, dt.y, -12, scale, cx, cy);
    const labelW = Math.ceil(ctx.measureText(dt.label).width) + 12;
    const boxW = Math.min(labelW, cssW - 16);
    let tx = Math.min(cssW - boxW - 4, Math.max(anchor.sx + 18, cssW * 0.66));
    tx = Math.max(8, tx);
    const boxX = tx - 4;
    const boxY = Math.max(2, Math.min(cssH - 19, anchor.sy - 8));
    // Leader line to whichever box edge faces the anchor.
    const edgeX = (boxX + boxW) < anchor.sx ? boxX + boxW + 2 : boxX - 2;
    ctx.strokeStyle = timeOfDay === 'night' ? 'rgba(248,250,252,0.65)' : 'rgba(28,25,23,0.55)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(anchor.sx, anchor.sy);
    ctx.lineTo(edgeX, boxY + 7.5);
    ctx.stroke();

    ctx.fillStyle = timeOfDay === 'night' ? 'rgba(15,23,42,0.82)' : 'rgba(255,253,249,0.90)';
    ctx.fillRect(boxX, boxY, boxW, 15);
    ctx.strokeStyle = timeOfDay === 'night' ? 'rgba(255,255,255,0.25)' : 'rgba(28,25,23,0.22)';
    ctx.strokeRect(boxX, boxY, boxW, 15);
    ctx.fillStyle = timeOfDay === 'night' ? '#F8FAFC' : '#1C1917';
    ctx.fillText(dt.label, tx + 2, boxY + 11);
  }

  // Top-Left Architectural Stamp Overlay
  const modeLabel = viewMode === 'exploded' ? 'Exploded floors'
    : viewMode === 'cutaway' ? 'Cut at 1.2 m above the floor'
    : 'Elevation';
  ctx.fillStyle = timeOfDay === 'night' ? 'rgba(15,23,42,0.78)' : 'rgba(255,253,249,0.88)';
  ctx.fillRect(10, 10, 244, 20);
  ctx.fillStyle = timeOfDay === 'night' ? '#FDE047' : '#1C1917';
  ctx.font = '700 9.5px "JetBrains Mono", monospace';
  ctx.fillText(`${modeLabel}`, 16, 23);

  ctx.restore();
}

/* ============================================================================
   3. STUDIO AUTOMOTIVE WIND-TUNNEL & ENGINEERING SHOWCASE (NO CHEAP SPIN!)
   ========================================================================== */

export function buildCar3DSceneFaces(carSpec = {}) {
  // Retained & enriched polygon list (>90 faces) for headless geometry verification
  const faces = [];
  const hex = carSpec.paintHex || '#1D3557';
  const body = String(carSpec.body || 'sedan').toLowerCase();
  const hCab = body === 'suv' || body === 'pickup' ? 28 : body === 'coupe' ? 22 : 25;
  const lv = [0.45, 0.80, -0.40];
  addPrism(faces, 0, -3, 0, 104, 3, 56, '#D6CFC2', '#F5F0E6', { lightVec: lv });
  addPrism(faces, 0, 5, 0, 86, 11, 36, hex, hex, { lightVec: lv });
  addPrism(faces, -4, 16, 0, 46, hCab - 15, 31, '#BAE6FD', hex, { lightVec: lv });
  // 4 multi-segment wheel assemblies (>80 faces total)
  for (const [wx, wz] of [[-26, -18], [26, -18], [-26, 18], [26, 18]]) {
    for (let i = 0; i < 20; i++) {
      const a0 = (i / 20) * Math.PI * 2;
      const a1 = ((i + 1) / 20) * Math.PI * 2;
      const r = 7.2;
      pushFace(faces, [
        [wx + Math.cos(a0) * r, 7.2 + Math.sin(a0) * r, wz - 2.4],
        [wx + Math.cos(a1) * r, 7.2 + Math.sin(a1) * r, wz - 2.4],
        [wx + Math.cos(a1) * r, 7.2 + Math.sin(a1) * r, wz + 2.4],
        [wx + Math.cos(a0) * r, 7.2 + Math.sin(a0) * r, wz + 2.4]
      ], '#1F2937', '#111827', lv);
    }
  }
  return faces;
}

export function renderAutomotiveStudioCanvas(canvas, spec = {}) {
  if (!canvas || !canvas.getContext) return;
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? Math.min(2, window.devicePixelRatio) : 1;
  const cssW = canvas.clientWidth || Number(canvas.getAttribute('width')) || 340;
  const cssH = canvas.clientHeight || Number(canvas.getAttribute('height')) || 168;
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);

  const hex = spec.paintHex || '#1D3557';
  const body = String(spec.body || 'sedan').toLowerCase();
  const aero = spec.aeroMode !== false;

  // Architectural Studio Cyclorama Backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, cssH);
  bg.addColorStop(0, '#F8F5EE');
  bg.addColorStop(0.68, '#EDE7DA');
  bg.addColorStop(1, '#DDD4C3');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cssW, cssH);

  // Fine studio millimeter grid
  ctx.strokeStyle = 'rgba(28,25,23,0.06)';
  ctx.lineWidth = 0.7;
  for (let x = 20; x < cssW; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cssH * 0.74); ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, cssH * 0.74);
  ctx.lineTo(cssW, cssH * 0.74);
  ctx.strokeStyle = 'rgba(28,25,23,0.18)';
  ctx.stroke();

  const ox = cssW * 0.5;
  const oy = cssH * 0.74;

  // Soft studio ground contact shadow
  const shGrad = ctx.createRadialGradient(ox, oy + 2, 12, ox, oy + 2, 126);
  shGrad.addColorStop(0, 'rgba(15,23,42,0.34)');
  shGrad.addColorStop(1, 'rgba(15,23,42,0)');
  ctx.fillStyle = shGrad;
  ctx.beginPath();
  ctx.ellipse(ox, oy + 3, 124, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Silhouette coordinates by body class (Crisp vector Bezier automotive studio profile!)
  ctx.save();
  ctx.translate(ox - 125, oy - 78);

  const paintGrad = ctx.createLinearGradient(0, 12, 0, 72);
  paintGrad.addColorStop(0, shadeHex(hex, 1.24));
  paintGrad.addColorStop(0.45, hex);
  paintGrad.addColorStop(0.85, shadeHex(hex, 0.72));
  paintGrad.addColorStop(1, shadeHex(hex, 0.55));

  ctx.beginPath();
  if (body === 'suv') {
    ctx.moveTo(18, 62);
    ctx.quadraticCurveTo(18, 42, 34, 38);
    ctx.lineTo(68, 16);
    ctx.quadraticCurveTo(76, 12, 152, 13);
    ctx.lineTo(184, 34);
    ctx.quadraticCurveTo(226, 37, 234, 48);
    ctx.lineTo(234, 62);
    ctx.closePath();
  } else if (body === 'pickup' || body === 'truck') {
    ctx.moveTo(14, 62);
    ctx.lineTo(16, 38);
    ctx.lineTo(84, 38);
    ctx.lineTo(94, 15);
    ctx.lineTo(158, 15);
    ctx.lineTo(182, 36);
    ctx.quadraticCurveTo(226, 38, 236, 48);
    ctx.lineTo(236, 62);
    ctx.closePath();
  } else if (body === 'coupe' || spec.carClass === 'sport' || spec.carClass === 'hyper') {
    ctx.moveTo(16, 63);
    ctx.quadraticCurveTo(24, 42, 58, 36);
    ctx.quadraticCurveTo(96, 18, 138, 20);
    ctx.lineTo(182, 37);
    ctx.quadraticCurveTo(224, 40, 238, 54);
    ctx.lineTo(236, 63);
    ctx.closePath();
  } else {
    // Executive Sedan / Hatchback
    ctx.moveTo(18, 62);
    ctx.quadraticCurveTo(22, 42, 46, 38);
    ctx.quadraticCurveTo(78, 16, 102, 16);
    ctx.lineTo(148, 17);
    ctx.lineTo(184, 36);
    ctx.quadraticCurveTo(224, 38, 234, 50);
    ctx.lineTo(234, 62);
    ctx.closePath();
  }
  ctx.fillStyle = paintGrad;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#18181B';
  ctx.stroke();

  // Greenhouse Cabin Glass with Sky Specular Reflection
  const glassGrad = ctx.createLinearGradient(70, 16, 170, 42);
  glassGrad.addColorStop(0, '#E0F2FE');
  glassGrad.addColorStop(0.5, '#7DD3FC');
  glassGrad.addColorStop(1, '#1E293B');
  ctx.beginPath();
  if (body === 'suv') {
    ctx.moveTo(73, 18); ctx.lineTo(148, 18); ctx.lineTo(176, 35); ctx.lineTo(48, 36);
  } else if (body === 'pickup' || body === 'truck') {
    ctx.moveTo(98, 19); ctx.lineTo(154, 19); ctx.lineTo(175, 36); ctx.lineTo(92, 36);
  } else {
    ctx.moveTo(86, 21); ctx.lineTo(146, 21); ctx.lineTo(176, 36); ctx.lineTo(62, 36);
  }
  ctx.closePath();
  ctx.fillStyle = glassGrad;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // B-Pillar + Chrome Beltline + Door Seam + Flush Handle
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(124, 19); ctx.lineTo(121, 58); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(34, 42); ctx.lineTo(224, 45); ctx.stroke();

  // LED Matrix DRL Headlight & Crimson Taillight Blade
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(223, 45, 10, 4.5);
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(17, 43, 9, 4.5);

  // Detailed Multi-Spoke Alloy Wheels, Ventilated Brake Rotors & Red Calipers!
  for (const wx of [62, 192]) {
    const wy = 62, wr = body === 'suv' || body === 'pickup' ? 17.5 : 15.8;
    // Wheel arch dark cutout
    ctx.beginPath(); ctx.arc(wx, wy, wr + 2.5, Math.PI, 0); ctx.fillStyle = '#09090B'; ctx.fill();
    // Rubber tire
    ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.fillStyle = '#18181B'; ctx.fill();
    // Brushed alloy rim
    ctx.beginPath(); ctx.arc(wx, wy, wr * 0.68, 0, Math.PI * 2); ctx.fillStyle = '#E2E8F0'; ctx.fill();
    // Brake rotor + crimson Brembo caliper
    ctx.beginPath(); ctx.arc(wx, wy, wr * 0.48, 0, Math.PI * 2); ctx.fillStyle = '#64748B'; ctx.fill();
    ctx.fillStyle = '#C84B31';
    ctx.fillRect(wx - wr * 0.45, wy - 4, 4, 8);
    // 10 Twin-Spokes
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 1.4;
    for (let s = 0; s < 5; s++) {
      const a = (s / 5) * Math.PI * 2 + 0.2;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + Math.cos(a) * wr * 0.66, wy + Math.sin(a) * wr * 0.66);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(wx, wy, 2.8, 0, Math.PI * 2); ctx.fillStyle = '#18181B'; ctx.fill();
  }

  // Aerodynamic Wind-Tunnel Laminar Streamlines & Wheelbase Dimension Line!
  if (aero) {
    ctx.strokeStyle = 'rgba(29, 53, 87, 0.32)';
    ctx.lineWidth = 1.1;
    for (let k = 0; k < 3; k++) {
      const dy = k * 6;
      ctx.beginPath();
      // Start at the canvas edge (not off it) and keep control points
      // inside, so the streamlines never draw past the frame.
      ctx.moveTo(0, 44 - dy);
      ctx.bezierCurveTo(45, 42 - dy, 75, Math.max(2, 6 - dy), 135, Math.max(2, 8 - dy));
      ctx.bezierCurveTo(188, Math.max(2, 10 - dy), 215, Math.max(2, 30 - dy), 260, 34 - dy);
      ctx.stroke();
    }
  }

  // Wheelbase CAD Witness Line underneath
  ctx.strokeStyle = 'rgba(28,25,23,0.45)';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.moveTo(62, 83); ctx.lineTo(192, 83);
  ctx.moveTo(62, 79); ctx.lineTo(62, 87);
  ctx.moveTo(192, 79); ctx.lineTo(192, 87);
  ctx.stroke();
  ctx.fillStyle = '#575047';
  ctx.font = '700 8px "JetBrains Mono", monospace';
  ctx.fillText(`WHEELBASE · ${spec.hp || 180} HP · Cd ${body === 'suv' ? '0.31' : '0.24'}`, 82, 93);

  ctx.restore();
  ctx.restore();
}

/* ============================================================================
   3. LIVE DOM MOUNTER (Drives Architectural Diorama + Car Studio)
   ========================================================================== */



export function mountAllLive3DCanvases() {
  if (typeof document === 'undefined') return;

  // Mount EVERY canvas on the page, not just the first: a dossier and a
  // land-build sheet can both be present, and the second one used to stay
  // blank because querySelector only returns the first match.
  for (const homeCanvas of document.querySelectorAll('canvas[data-canvas3d="home"]')) {
    try {
      const spec = JSON.parse(homeCanvas.dataset.spec || '{}');
      renderArchitecturalDioramaCanvas(homeCanvas, spec);
    } catch (_) {}
  }

  for (const carCanvas of document.querySelectorAll('canvas[data-canvas3d="car"]')) {
    try {
      const spec = JSON.parse(carCanvas.dataset.spec || '{}');
      renderAutomotiveStudioCanvas(carCanvas, spec);
    } catch (_) {}
  }
}
