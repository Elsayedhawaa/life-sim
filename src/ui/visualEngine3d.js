import {STYLE_FLOOR_PLANS} from '../data/styleFloorPlans.js';
import {propertyStyle} from '../data/localPropertyStyles.js';
import {illustratedPlanSvg} from './illustratedPlan.js';
import {renderHomeTypeArt} from './homeTypeArt.js';
import {propertyOutdoorFeatures} from './propertyOutdoor.js';
import {regionalRoomName, homeStyleNote, roomBelongsToHome} from './homeRegionalStyle.js';
/* ============================================================================
   World Life — Sheet A-101 Floor Plan & Drafting Engine (v2.3)
   - Zero cheap 3-box clip-art floorplans; zero pointless spin buttons.
   - A plain-words floor-plan sheet (A-101 / A-102): one plain size line in
     metres, a full-width room list below the drawing (every room, full name,
     total = sum of the listed rooms), and a slim side block (plan name,
     floor, scale, view, time). No grid bubbles, no millimetre strings.
   - Hatched outside walls, 8–12 rooms per home type (foyer, gallery, guest
     WC, salon, dining, majlis, chef kitchen with island, master ensuite,
     bedrooms, stair + lift), with furniture drawn to read as rooms.
   - Archival Vellum (#FCFBF7) vs Classic Prussian Cyanotype (#0B2545) Mode
   - Toggleable MEP Layer (Split-AC Units, LED Ceiling Grid & Switch Loops)
   - North Compass Rose; drawings are layout diagrams, not to scale —
     the room sizes in the list are the real room sizes.
   ========================================================================== */

function escAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function hashShapeSeed(val) {
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

/* 1. PROCEDURAL MULTI-VARIANT ARCHITECTURAL ELEVATION BADGES (11 Archetypes × Seed Variants) */
export function renderBitlifePropertyShapeSvg(shape = 'apartment', size = 52, accent = '#C84B31', variantSeed = 0) {
  const ink = '#1C1917';
  const h = hashShapeSeed(variantSeed);
  const rv = h % 3;
  const wallTones = ['#FFFDF9', '#F6ECDC', '#F3E3D5', '#ECF0F5', '#EFE9DC', '#E8D5C4'];
  const roofAccents = ['#C84B31', '#1D3557', '#855836', '#2C5E4F', '#A97115', '#475569'];
  const wallFill = h === 0 ? '#FFFDF9' : wallTones[h % wallTones.length];
  const wallAlt = h === 0 ? '#EFE9DC' : wallTones[(h + 2) % wallTones.length];
  const dynAccent = (h !== 0 && accent === '#C84B31') ? roofAccents[h % roofAccents.length] : accent;
  const warmWin = (h % 2 === 0) ? '#FDE68A' : '#7DD3FC';
  const treeSvg = (tx, ty) => (h % 3 === 1)
    ? `<ellipse cx="${tx}" cy="${ty - 2}" rx="3.2" ry="7.5" fill="#166534" stroke="${ink}" stroke-width="1.2"/>`
    : `<circle cx="${tx}" cy="${ty}" r="4.6" fill="#15803D" stroke="${ink}" stroke-width="1.3"/>`;

  const shapes = {
    studio: `
      <ellipse cx="32" cy="54" rx="22" ry="2.8" fill="rgba(0,0,0,0.10)"/>
      <rect x="13" y="19" width="38" height="33" rx="2" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      ${rv === 1
        ? `<rect x="11" y="14.5" width="42" height="4.5" fill="${dynAccent}" stroke="${ink}" stroke-width="1.7"/>`
        : `<polygon points="10,19 32,${rv === 2 ? 7.5 : 9.5} 54,19" fill="${dynAccent}" stroke="${ink}" stroke-width="1.9"/>`}
      <rect x="17.5" y="24.5" width="16" height="11.5" rx="1" fill="${warmWin}" stroke="${ink}" stroke-width="1.4"/>
      <line x1="25.5" y1="24.5" x2="25.5" y2="36" stroke="${ink}" stroke-width="1.1"/>
      <rect x="16" y="36" width="19" height="2.4" fill="#D6CFC2" stroke="${ink}" stroke-width="1.1"/>
      <rect x="37.5" y="32" width="8.5" height="20" fill="#78350F" stroke="${ink}" stroke-width="1.5"/>
    `,
    apartment: `
      <ellipse cx="32" cy="54" rx="24" ry="2.8" fill="rgba(0,0,0,0.10)"/>
      <rect x="${rv === 2 ? 15 : 13}" y="8" width="${rv === 2 ? 34 : 38}" height="45" rx="1.5" fill="${wallAlt}" stroke="${ink}" stroke-width="1.9"/>
      ${rv === 1
        ? `<polygon points="11,8 32,2.5 53,8" fill="${dynAccent}" stroke="${ink}" stroke-width="1.6"/>`
        : `<rect x="10.5" y="5.5" width="43" height="3.5" fill="${dynAccent}" stroke="${ink}" stroke-width="1.7"/>`}
      ${[12.5, 22.5, 32.5].map((y, yi) => `
        <rect x="17" y="${y}" width="7.5" height="6" rx="${rv === 1 ? 2.5 : 0}" fill="${(yi + h) % 3 === 0 ? '#FDE68A' : '#BAE6FD'}" stroke="${ink}" stroke-width="1.2"/>
        <rect x="28.2" y="${y}" width="7.5" height="6" rx="${rv === 1 ? 2.5 : 0}" fill="${y === 22.5 ? warmWin : '#BAE6FD'}" stroke="${ink}" stroke-width="1.2"/>
        <rect x="39.5" y="${y}" width="7.5" height="6" rx="${rv === 1 ? 2.5 : 0}" fill="#BAE6FD" stroke="${ink}" stroke-width="1.2"/>
      `).join('')}
      <rect x="25" y="42" width="14" height="2.8" fill="${dynAccent}" stroke="${ink}" stroke-width="1.2"/>
      <rect x="27.5" y="44.8" width="9" height="8.2" fill="#78350F" stroke="${ink}" stroke-width="1.4"/>
    `,
    duplex: `
      <ellipse cx="32" cy="54" rx="25" ry="2.8" fill="rgba(0,0,0,0.10)"/>
      <rect x="9" y="15" width="26" height="37" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="35" y="${rv === 1 ? 19 : 23}" width="20" height="${rv === 1 ? 33 : 29}" fill="${wallAlt}" stroke="${ink}" stroke-width="1.9"/>
      ${rv === 2
        ? `<rect x="7" y="11.5" width="30" height="3.8" fill="${dynAccent}" stroke="${ink}" stroke-width="1.7"/>`
        : `<polygon points="6.5,15 22,5.5 37.5,15" fill="${dynAccent}" stroke="${ink}" stroke-width="1.8"/>`}
      <rect x="13.5" y="19.5" width="17" height="14.5" fill="${warmWin}" stroke="${ink}" stroke-width="1.4"/>
      <line x1="13.5" y1="26.8" x2="30.5" y2="26.8" stroke="${ink}" stroke-width="1.1"/>
      <line x1="22" y1="19.5" x2="22" y2="34" stroke="${ink}" stroke-width="1.1"/>
      <rect x="39.5" y="28.5" width="11" height="9" fill="#BAE6FD" stroke="${ink}" stroke-width="1.3"/>
      <rect x="17.5" y="38.5" width="9" height="13.5" fill="#78350F" stroke="${ink}" stroke-width="1.4"/>
    `,
    penthouse: `
      <ellipse cx="32" cy="54" rx="25" ry="2.8" fill="rgba(0,0,0,0.10)"/>
      <rect x="11" y="28" width="42" height="24" fill="${wallAlt}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="${rv === 1 ? 13 : 16}" y="13" width="${rv === 1 ? 36 : 32}" height="15" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="12.5" y="9.8" width="39" height="3.5" fill="${dynAccent}" stroke="${ink}" stroke-width="1.6"/>
      <rect x="20" y="16.5" width="24" height="11.5" fill="${rv === 2 ? '#FDE68A' : '#38BDF8'}" stroke="${ink}" stroke-width="1.4"/>
      <line x1="11" y1="25.5" x2="53" y2="25.5" stroke="${ink}" stroke-width="1.3" stroke-dasharray="3 2"/>
      <rect x="16" y="34" width="9" height="6" fill="#BAE6FD" stroke="${ink}" stroke-width="1.2"/>
      <rect x="39" y="34" width="9" height="6" fill="${warmWin}" stroke="${ink}" stroke-width="1.2"/>
    `,
    townhouse: `
      <ellipse cx="32" cy="54" rx="26" ry="2.8" fill="rgba(0,0,0,0.10)"/>
      ${rv === 1 ? `
        <rect x="8" y="16" width="19" height="6" fill="${dynAccent}" stroke="${ink}" stroke-width="1.6"/>
        <rect x="27" y="14" width="16" height="8" fill="#1D3557" stroke="${ink}" stroke-width="1.6"/>
        <rect x="43" y="17" width="13" height="5" fill="#64748B" stroke="${ink}" stroke-width="1.6"/>
      ` : `
        <polygon points="7,22 18,10.5 29,22" fill="${dynAccent}" stroke="${ink}" stroke-width="1.7"/>
        <polygon points="24,22 35,10.5 46,22" fill="#1D3557" stroke="${ink}" stroke-width="1.7"/>
        <polygon points="39.5,22 48.5,12 57.5,22" fill="#64748B" stroke="${ink}" stroke-width="1.7"/>
      `}
      <rect x="9" y="22" width="18" height="30" fill="${wallFill}" stroke="${ink}" stroke-width="1.8"/>
      <rect x="27" y="22" width="16" height="30" fill="${wallAlt}" stroke="${ink}" stroke-width="1.8"/>
      <rect x="43" y="22" width="13" height="30" fill="#E2DDD2" stroke="${ink}" stroke-width="1.8"/>
      <rect x="13" y="26.5" width="10" height="7" fill="${warmWin}" stroke="${ink}" stroke-width="1.2"/>
      <rect x="30.5" y="26.5" width="9" height="7" fill="#BAE6FD" stroke="${ink}" stroke-width="1.2"/>
      <rect x="14.5" y="39" width="6.5" height="13" fill="#78350F" stroke="${ink}" stroke-width="1.3"/>
    `,
    twin_house: `
      <ellipse cx="32" cy="54" rx="26" ry="2.8" fill="rgba(0,0,0,0.10)"/>
      <rect x="8" y="20" width="24" height="31" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="32" y="20" width="24" height="31" fill="${wallAlt}" stroke="${ink}" stroke-width="1.9"/>
      ${rv === 1 ? `
        <rect x="6.5" y="15.5" width="25.5" height="4.5" fill="${dynAccent}" stroke="${ink}" stroke-width="1.7"/>
        <rect x="32" y="15.5" width="25.5" height="4.5" fill="${dynAccent}" stroke="${ink}" stroke-width="1.7"/>
      ` : `
        <polygon points="6,20 20,9.5 32,20" fill="${dynAccent}" stroke="${ink}" stroke-width="1.8"/>
        <polygon points="32,20 44,9.5 58,20" fill="${dynAccent}" stroke="${ink}" stroke-width="1.8"/>
      `}
      <line x1="32" y1="11" x2="32" y2="51" stroke="${ink}" stroke-width="2.2"/>
      <rect x="13" y="25.5" width="11" height="8" fill="${warmWin}" stroke="${ink}" stroke-width="1.3"/>
      <rect x="40" y="25.5" width="11" height="8" fill="#7DD3FC" stroke="${ink}" stroke-width="1.3"/>
      <rect x="21" y="38" width="7" height="13" fill="#78350F" stroke="${ink}" stroke-width="1.4"/>
      <rect x="36" y="38" width="7" height="13" fill="#78350F" stroke="${ink}" stroke-width="1.4"/>
    `,
    villa: rv === 1 ? `
      <!-- Variant 1: Stepped Courtyard / Arabesque Flat-Parapet Villa with Barjeel Tower -->
      <ellipse cx="32" cy="54" rx="26" ry="3" fill="rgba(0,0,0,0.12)"/>
      <rect x="10" y="21" width="42" height="29" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="8" y="17" width="46" height="4" fill="${dynAccent}" stroke="${ink}" stroke-width="1.7"/>
      <rect x="38" y="9" width="12" height="12" fill="${wallAlt}" stroke="${ink}" stroke-width="1.7"/>
      <rect x="37" y="7" width="14" height="2.6" fill="${dynAccent}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M15,36 L15,27 A4.5,4.5 0 0,1 24,27 L24,36 Z" fill="${warmWin}" stroke="${ink}" stroke-width="1.3"/>
      <path d="M39,36 L39,27 A4.5,4.5 0 0,1 48,27 L48,36 Z" fill="#7DD3FC" stroke="${ink}" stroke-width="1.3"/>
      <path d="M27.5,50 L27.5,38 A4.5,4.5 0 0,1 36.5,38 L36.5,50 Z" fill="#78350F" stroke="${ink}" stroke-width="1.6"/>
      <ellipse cx="18" cy="53.5" rx="11" ry="3.2" fill="#0EA5E9" stroke="#F8FAFC" stroke-width="1.3"/>
      ${treeSvg(54.5, 43)}
    ` : rv === 2 ? `
      <!-- Variant 2: Asymmetric Twin-Wing Estate Villa with Chimney & Columns -->
      <ellipse cx="32" cy="54" rx="26" ry="3" fill="rgba(0,0,0,0.12)"/>
      <rect x="44" y="9" width="5" height="11" fill="#78350F" stroke="${ink}" stroke-width="1.4"/>
      <polygon points="6,23 26,8 46,23" fill="${dynAccent}" stroke="${ink}" stroke-width="1.9"/>
      <polygon points="36,27 48,17 59,27" fill="${dynAccent}" stroke="${ink}" stroke-width="1.7"/>
      <rect x="9" y="23" width="34" height="27" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="40" y="27" width="16" height="23" fill="${wallAlt}" stroke="${ink}" stroke-width="1.8"/>
      <rect x="13.5" y="28" width="9.5" height="8" fill="${warmWin}" stroke="${ink}" stroke-width="1.3"/>
      <rect x="44" y="31" width="8" height="7" fill="#7DD3FC" stroke="${ink}" stroke-width="1.3"/>
      <rect x="25" y="37" width="8" height="13" fill="#78350F" stroke="${ink}" stroke-width="1.5"/>
      <ellipse cx="47" cy="53.5" rx="10.5" ry="3.2" fill="#0EA5E9" stroke="#F8FAFC" stroke-width="1.3"/>
      ${treeSvg(7.5, 43)}
    ` : `
      <!-- Variant 0: Classic Mediterranean Hipped-Crown Villa -->
      <ellipse cx="32" cy="54" rx="26" ry="3" fill="rgba(0,0,0,0.12)"/>
      <polygon points="7,24 32,7 57,24" fill="${dynAccent}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="11" y="24" width="42" height="26" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="15" y="28.5" width="10.5" height="8.5" fill="${warmWin}" stroke="${ink}" stroke-width="1.4"/>
      <rect x="38.5" y="28.5" width="10.5" height="8.5" fill="#7DD3FC" stroke="${ink}" stroke-width="1.4"/>
      <path d="M27.5,50 L27.5,37.5 A4.5,4.5 0 0,1 36.5,37.5 L36.5,50 Z" fill="#78350F" stroke="${ink}" stroke-width="1.6"/>
      <ellipse cx="47" cy="53.5" rx="11" ry="3.4" fill="#0EA5E9" stroke="#F8FAFC" stroke-width="1.4"/>
      ${treeSvg(9.5, 43)}
    `,
    chalet: `
      ${rv === 1
        ? `<rect x="10" y="19" width="44" height="5" fill="${dynAccent}" stroke="${ink}" stroke-width="1.8"/>`
        : `<polygon points="7,25 32,${rv === 2 ? 6.5 : 9.5} 57,25" fill="${h === 0 ? '#D97706' : dynAccent}" stroke="${ink}" stroke-width="1.9"/>`}
      <rect x="13" y="24" width="38" height="22" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="20" y="29.5" width="24" height="12" fill="${warmWin}" stroke="${ink}" stroke-width="1.4"/>
      <line x1="32" y1="29.5" x2="32" y2="41.5" stroke="${ink}" stroke-width="1.2"/>
      <rect x="10" y="45" width="44" height="3.2" fill="#B45309" stroke="${ink}" stroke-width="1.2"/>
      <path d="M4 53 Q14 48.5 24 53 T44 53 T60 53" fill="none" stroke="#0284C7" stroke-width="2.4"/>
    `,
    mansion: `
      <ellipse cx="32" cy="54" rx="28" ry="3" fill="rgba(0,0,0,0.13)"/>
      ${rv === 1
        ? `<path d="M20,17 A12,11 0 0,1 44,17 Z" fill="#B67D1E" stroke="${ink}" stroke-width="1.9"/>`
        : `<polygon points="17,17 32,5 47,17" fill="${h === 0 ? '#B67D1E' : dynAccent}" stroke="${ink}" stroke-width="1.9"/>`}
      <rect x="4.5" y="22" width="13" height="29" fill="${wallAlt}" stroke="${ink}" stroke-width="1.8"/>
      <rect x="46.5" y="22" width="13" height="29" fill="${wallAlt}" stroke="${ink}" stroke-width="1.8"/>
      <rect x="17.5" y="17" width="29" height="34" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <line x1="22.5" y1="21" x2="22.5" y2="51" stroke="${ink}" stroke-width="1.8"/>
      <line x1="41.5" y1="21" x2="41.5" y2="51" stroke="${ink}" stroke-width="1.8"/>
      <path d="M28,51 L28,36.5 A4,4 0 0,1 36,36.5 L36,51 Z" fill="#B67D1E" stroke="${ink}" stroke-width="1.6"/>
      <ellipse cx="32" cy="54.5" rx="13.5" ry="2.8" fill="#38BDF8" stroke="${ink}" stroke-width="1.2"/>
    `,
    commercial: `
      <ellipse cx="32" cy="54" rx="25" ry="2.8" fill="rgba(0,0,0,0.10)"/>
      <rect x="9" y="12" width="46" height="39" fill="${wallFill}" stroke="${ink}" stroke-width="1.9"/>
      <rect x="7" y="26" width="50" height="4.5" fill="${dynAccent}" stroke="${ink}" stroke-width="1.6"/>
      <rect x="13" y="33" width="22" height="18" fill="${warmWin}" stroke="${ink}" stroke-width="1.4"/>
      <rect x="38" y="35" width="11" height="16" fill="#1E293B" stroke="${ink}" stroke-width="1.4"/>
      <rect x="14" y="16" width="36" height="7" fill="#BAE6FD" stroke="${ink}" stroke-width="1.3"/>
    `,
    land: `
      <polygon points="7,40 32,25 57,40 32,54" fill="${rv === 1 ? '#FEF3C7' : '#DCFCE7'}" stroke="#15803D" stroke-width="1.9"/>
      <polygon points="15,40 32,30 49,40 32,49" fill="none" stroke="#15803D" stroke-width="1.2" stroke-dasharray="3 2"/>
      <line x1="${13 + (h % 28)}" y1="23" x2="${13 + (h % 28)}" y2="39" stroke="${ink}" stroke-width="1.9"/>
      <polygon points="${13 + (h % 28)},23 ${25 + (h % 28)},27 ${13 + (h % 28)},31" fill="${dynAccent}"/>
    `
  };

  return `
    <svg viewBox="0 0 64 60" width="${size}" height="${size}" class="prop-shape-svg" role="img" aria-label="${escAttr(shape)}">
      ${shapes[shape] || shapes.apartment}
    </svg>
  `;
}

/* ============================================================================
   2. FULL AIA SHEET A-101 / A-102 ARCHITECTURAL BLUEPRINT SCHEMATICS
   Shell coordinate space inside Drafting Frame: x in [72..692], y in [78..466]
   ========================================================================== */

const A101_SCHEMATICS = {
  studio: [
    {
      code: 'A-101',
      title: 'URBAN STUDIO RESIDENCE — ARCHITECTURAL PLAN',
      dimsMm: ['8,400', '7,200'],
      baysX: [['A', 150], ['B', 350], ['C', 570]],
      baysY: [['1', 110], ['2', 265], ['3', 420]],
      shell: { x: 150, y: 110, w: 420, h: 310 },
      terrace: { x: 150, y: 420, w: 280, h: 46, label: 'COVERED LOGGIA BALCONY · FFL -0.02' },
      rooms: [
        { no: '101', key: 'foyer',    name: 'ENTRY VESTIBULE', x: 430, y: 330, w: 140, h: 90, m2: 7,  flr: 'tile', door: [495, 420, 'up', 'double'] },
        { no: '102', key: 'bathroom', name: 'FULL BATH & LAUNDRY', x: 430, y: 110, w: 140, h: 115, m2: 9, flr: 'tile', door: [430, 185, 'right'] },
        { no: '103', key: 'kitchen',  name: 'GALLEY KITCHENETTE', x: 430, y: 225, w: 140, h: 105, m2: 9, flr: 'tile', door: [430, 275, 'left'] },
        { no: '104', key: 'living',   name: 'LIVING & DINING SALON', x: 150, y: 255, w: 280, h: 165, m2: 24, flr: 'wood', door: [260, 420, 'sliding'] },
        { no: '105', key: 'bedroom',  name: 'SLEEPING ALCOVE + WRD', x: 150, y: 110, w: 280, h: 145, m2: 16, flr: 'wood', door: [330, 255, 'up'] }
      ],
      core: null
    }
  ],
  apartment: [
    {
      code: 'A-101',
      title: '3-BEDROOM APARTMENT — FLOOR PLAN (SALAMLIK / HARAMLIK ZONING)',
      dimsMm: ['14,800', '10,600'],
      baysX: [['A', 84], ['B', 260], ['C', 416], ['D', 554], ['E', 684]],
      baysY: [['1', 92], ['2', 238], ['3', 292], ['4', 428]],
      shell: { x: 84, y: 92, w: 600, h: 336 },
      terrace: { x: 84, y: 428, w: 332, h: 44, label: 'FRONT RECEPTION TERRACE · 1.60m DEEP' },
      rooms: [
        { no: '101', key: 'foyer',    name: 'FOYER & LOBBY',       x: 416, y: 292, w: 110, h: 136, m2: 12, flr: 'marble', door: [468, 428, 'up', 'double'] },
        { no: '102', key: 'wc',       name: 'GUEST WC',            x: 526, y: 356, w: 74,  h: 72,  m2: 4,  flr: 'tile',   door: [526, 386, 'right'] },
        { no: '103', key: 'corridor', name: 'PRIVATE GALLERY CORRIDOR', x: 84, y: 238, w: 470, h: 54, m2: 14, flr: 'marble', door: [468, 292, 'up'] },
        { no: '104', key: 'living',   name: 'FORMAL RECEPTION & DINING', x: 84, y: 292, w: 332, h: 136, m2: 46, flr: 'marble', door: [210, 428, 'sliding'] },
        { no: '105', key: 'kitchen',  name: 'CHEF KITCHEN & PANTRY', x: 554, y: 238, w: 130, h: 118, m2: 20, flr: 'tile', door: [554, 315, 'right'] },
        { no: '106', key: 'bedroom',  name: 'MASTER SUITE + W.I.C.', x: 84, y: 92, w: 196, h: 146, m2: 28, flr: 'wood', door: [215, 238, 'up'] },
        { no: '107', key: 'bathroom', name: 'MASTER ENSUITE',      x: 280, y: 92,  w: 96,  h: 146, m2: 10, flr: 'tile',   door: [280, 165, 'right'] },
        { no: '108', key: 'kids',     name: 'BEDROOM 02 (KIDS)',   x: 376, y: 92,  w: 138, h: 146, m2: 18, flr: 'wood',   door: [435, 238, 'up'] },
        { no: '109', key: 'office',   name: 'STUDY / BEDROOM 03',  x: 514, y: 92,  w: 170, h: 146, m2: 19, flr: 'wood',   door: [534, 238, 'up'] }
      ],
      core: { x: 600, y: 356, w: 84, h: 72, label: 'STAIR / LIFT' }
    }
  ],
  duplex: [
    {
      code: 'A-101',
      title: 'DOUBLE-HEIGHT DUPLEX — LOWER LEVEL (RECEPTION & SERVICE)',
      dimsMm: ['15,200', '11,000'],
      baysX: [['A', 84], ['B', 294], ['C', 464], ['D', 684]],
      baysY: [['1', 92], ['2', 248], ['3', 428]],
      shell: { x: 84, y: 92, w: 600, h: 336 },
      terrace: { x: 84, y: 428, w: 380, h: 44, label: 'PRIVATE GARDEN VERANDA · FFL -0.05' },
      rooms: [
        { no: '101', key: 'foyer',    name: 'GRAND ENTRY HALL',    x: 294, y: 296, w: 170, h: 132, m2: 18, flr: 'marble', door: [375, 428, 'up', 'double'] },
        { no: '102', key: 'living',   name: '2-STORY DOUBLE-HEIGHT SALON', x: 84, y: 92, w: 210, h: 336, m2: 62, flr: 'marble', door: [180, 428, 'sliding'] },
        { no: '103', key: 'office',   name: 'GUEST MAJLIS / STUDY', x: 464, y: 268, w: 220, h: 160, m2: 28, flr: 'wood', door: [464, 345, 'right'] },
        { no: '104', key: 'kitchen',  name: 'ISLAND CHEF KITCHEN', x: 464, y: 92,  w: 220, h: 176, m2: 30, flr: 'tile',   door: [464, 195, 'right'] },
        { no: '105', key: 'bathroom', name: 'POWDER WC & UTILITY', x: 294, y: 92,  w: 96,  h: 120, m2: 10, flr: 'tile',   door: [340, 212, 'up'] },
        { no: '106', key: 'corridor', name: 'LOWER STAIR HALL', x: 294, y: 212, w: 170, h: 84, m2: 12, flr: 'marble', door: [375, 296, 'up'] }
      ],
      core: { x: 390, y: 92, w: 74, h: 120, label: 'UP 18R →' }
    },
    {
      code: 'A-102',
      title: 'DOUBLE-HEIGHT DUPLEX — UPPER LEVEL (MEZZANINE & SUITES)',
      dimsMm: ['15,200', '11,000'],
      baysX: [['A', 84], ['B', 294], ['C', 464], ['D', 684]],
      baysY: [['1', 92], ['2', 248], ['3', 428]],
      shell: { x: 84, y: 92, w: 600, h: 336 },
      terrace: { x: 294, y: 428, w: 390, h: 40, label: 'UPPER BEDROOM BALCONY' },
      rooms: [
        { no: '201', key: 'void',     name: 'OPEN VOID OVER SALON (BELOW)', x: 84, y: 238, w: 210, h: 190, m2: 0, flr: 'void' },
        { no: '202', key: 'bedroom',  name: 'MASTER ROYAL SUITE + W.I.C.', x: 464, y: 212, w: 220, h: 216, m2: 42, flr: 'wood', door: [464, 280, 'right'] },
        { no: '203', key: 'bathroom', name: 'MASTER SPA ENSUITE', x: 464, y: 92,  w: 220, h: 120, m2: 18, flr: 'tile', door: [540, 212, 'up'] },
        { no: '204', key: 'kids',     name: 'KIDS BEDROOM SUITES (×2)', x: 84, y: 92, w: 210, h: 146, m2: 32, flr: 'wood', door: [294, 165, 'left'] },
        { no: '205', key: 'corridor', name: 'MEZZANINE GALLERY BRIDGE', x: 294, y: 212, w: 170, h: 216, m2: 22, flr: 'wood', door: [375, 428, 'sliding'] },
        { no: '206', key: 'corridor', name: 'UPPER LANDING', x: 294, y: 92, w: 96, h: 120, m2: 10, flr: 'wood', door: [340, 212, 'up'] }
      ],
      core: { x: 390, y: 92, w: 74, h: 120, label: '← DN 18R' }
    }
  ],
  penthouse: [
    {
      code: 'A-101',
      title: 'SKY PENTHOUSE PAVILION — PANORAMIC WRAPAROUND TERRACE PLAN',
      dimsMm: ['18,400', '12,600'],
      baysX: [['A', 84], ['B', 240], ['C', 440], ['D', 684]],
      baysY: [['1', 92], ['2', 246], ['3', 392]],
      shell: { x: 84, y: 92, w: 600, h: 300 },
      terrace: { x: 84, y: 392, w: 600, h: 76, label: '360° SKY ROOF DECK · PLUNGE POOL & PERGOLA LOUNGE', hasPool: true },
      rooms: [
        { no: '101', key: 'living',   name: 'PANORAMIC GREAT SALON & BAR', x: 84, y: 226, w: 356, h: 166, m2: 68, flr: 'marble', door: [250, 392, 'sliding'] },
        { no: '102', key: 'kitchen',  name: 'SHOW KITCHEN & WINE CELLAR',  x: 440, y: 246, w: 244, h: 146, m2: 32, flr: 'marble', door: [440, 315, 'right'] },
        { no: '103', key: 'bedroom',  name: 'MASTER PENTHOUSE WING + W.I.C.', x: 84, y: 92, w: 236, h: 134, m2: 44, flr: 'wood', door: [210, 226, 'up'] },
        { no: '104', key: 'bathroom', name: 'MARBLE HAMMAM & SPA BATH',   x: 320, y: 92,  w: 120, h: 134, m2: 18, flr: 'tile', door: [320, 160, 'right'] },
        { no: '105', key: 'kids',     name: 'VIP GUEST SUITE 02',         x: 440, y: 92,  w: 154, h: 154, m2: 24, flr: 'wood', door: [500, 246, 'up'] }
      ],
      core: { x: 594, y: 92, w: 90, h: 154, label: 'PRIV. LIFT ☒' }
    }
  ],
  townhouse: [
    {
      code: 'A-101',
      title: 'ROW TOWNHOUSE — GROUND FLOOR (COURTYARD & LIVING)',
      dimsMm: ['9,600', '14,200'],
      baysX: [['A', 134], ['B', 334], ['C', 520], ['D', 634]],
      baysY: [['1', 92], ['2', 246], ['3', 424]],
      shell: { x: 134, y: 92, w: 500, h: 332 },
      terrace: { x: 134, y: 424, w: 500, h: 46, label: 'CARPORT FORECOURT & REAR PATIO GARDEN' },
      rooms: [
        { no: '101', key: 'foyer',    name: 'ENTRY HALL & GARAGE VESTIBULE', x: 134, y: 246, w: 166, h: 178, m2: 18, flr: 'tile', door: [210, 424, 'up', 'double'] },
        { no: '102', key: 'living',   name: 'GARDEN SALON & DINING', x: 300, y: 246, w: 334, h: 178, m2: 44, flr: 'wood', door: [460, 424, 'sliding'] },
        { no: '103', key: 'kitchen',  name: 'CLOSED CHEF KITCHEN',   x: 134, y: 92,  w: 220, h: 154, m2: 24, flr: 'tile', door: [250, 246, 'up'] },
        { no: '104', key: 'office',   name: 'STUDY / MAID SUITE',    x: 354, y: 92,  w: 180, h: 154, m2: 18, flr: 'wood', door: [420, 246, 'up'] },
        { no: '105', key: 'bathroom', name: 'POWDER WC',             x: 534, y: 168, w: 100, h: 78,  m2: 6,  flr: 'tile', door: [570, 246, 'up'] }
      ],
      core: { x: 534, y: 92, w: 100, h: 76, label: 'UP 16R →' }
    },
    {
      code: 'A-102',
      title: 'ROW TOWNHOUSE — FIRST FLOOR (3 BEDROOM SUITES)',
      dimsMm: ['9,600', '14,200'],
      baysX: [['A', 134], ['B', 334], ['C', 520], ['D', 634]],
      baysY: [['1', 92], ['2', 246], ['3', 424]],
      shell: { x: 134, y: 92, w: 500, h: 332 },
      terrace: { x: 334, y: 424, w: 300, h: 42, label: 'MASTER FRONT LOGGIA' },
      rooms: [
        { no: '201', key: 'bedroom',  name: 'MASTER SUITE + DRESSING', x: 334, y: 246, w: 300, h: 178, m2: 36, flr: 'wood', door: [470, 424, 'sliding'] },
        { no: '202', key: 'bathroom', name: 'MASTER & FAMILY BATHS',   x: 134, y: 246, w: 200, h: 178, m2: 18, flr: 'tile', door: [334, 320, 'left'] },
        { no: '203', key: 'kids',     name: 'BEDROOM 02 & BEDROOM 03', x: 134, y: 92,  w: 400, h: 154, m2: 38, flr: 'wood', door: [360, 246, 'up'] }
      ],
      core: { x: 534, y: 92, w: 100, h: 154, label: '← DN 16R' }
    }
  ],
  twin_house: [
    {
      code: 'A-101',
      title: 'SEMI-DETACHED TWIN VILLA — GROUND FLOOR (PARTY WALL ON AXIS A)',
      dimsMm: ['13,800', '12,400'],
      baysX: [['A', 94], ['B', 284], ['C', 484], ['D', 684]],
      baysY: [['1', 92], ['2', 252], ['3', 424]],
      shell: { x: 94, y: 92, w: 590, h: 332 },
      terrace: { x: 94, y: 424, w: 590, h: 46, label: '3-SIDE L-GARDEN TERRACE & PERGOLA' },
      rooms: [
        { no: '101', key: 'foyer',    name: 'SIDE GARDEN ENTRANCE LOBBY', x: 484, y: 252, w: 200, h: 172, m2: 22, flr: 'marble', door: [580, 424, 'up', 'double'] },
        { no: '102', key: 'living',   name: 'SALON & 8-SEAT DINING HALL', x: 94,  y: 252, w: 390, h: 172, m2: 52, flr: 'marble', door: [260, 424, 'sliding'] },
        { no: '103', key: 'kitchen',  name: 'CHEF KITCHEN & LAUNDRY',     x: 94,  y: 92,  w: 220, h: 160, m2: 26, flr: 'tile',   door: [210, 252, 'up'] },
        { no: '104', key: 'office',   name: 'GUEST MAJLIS / OFFICE',      x: 314, y: 92,  w: 190, h: 160, m2: 22, flr: 'wood',   door: [410, 252, 'up'] },
        { no: '105', key: 'bathroom', name: 'GUEST WC & NANNY BATH',      x: 504, y: 172, w: 180, h: 80,  m2: 10, flr: 'tile',   door: [560, 252, 'up'] }
      ],
      core: { x: 504, y: 92, w: 180, h: 80, label: 'UP 17R →' }
    },
    {
      code: 'A-102',
      title: 'SEMI-DETACHED TWIN VILLA — FIRST FLOOR (FAMILY LIVING & SUITES)',
      dimsMm: ['13,800', '12,400'],
      baysX: [['A', 94], ['B', 284], ['C', 484], ['D', 684]],
      baysY: [['1', 92], ['2', 252], ['3', 424]],
      shell: { x: 94, y: 92, w: 590, h: 332 },
      terrace: { x: 94, y: 424, w: 390, h: 42, label: 'GARDEN VIEW SUN TERRACE' },
      rooms: [
        { no: '201', key: 'bedroom',  name: 'MASTER SUITE + W.I.C.',   x: 94,  y: 252, w: 290, h: 172, m2: 40, flr: 'wood', door: [220, 424, 'sliding'] },
        { no: '202', key: 'bathroom', name: 'MASTER JACUZZI ENSUITE',  x: 384, y: 252, w: 120, h: 172, m2: 15, flr: 'tile', door: [384, 330, 'left'] },
        { no: '203', key: 'kids',     name: 'SUITES 02 & 03 + LIVING', x: 94,  y: 92,  w: 410, h: 160, m2: 48, flr: 'wood', door: [320, 252, 'up'] },
        { no: '204', key: 'corridor', name: 'UPPER FAMILY HALL',       x: 504, y: 172, w: 180, h: 252, m2: 24, flr: 'wood', door: [504, 290, 'left'] }
      ],
      core: { x: 504, y: 92, w: 180, h: 80, label: '← DN 17R' }
    }
  ],
  villa: [
    {
      code: 'A-101',
      title: 'STANDALONE COMPOUND VILLA — GROUND FLOOR (MAJLIS, SALAMLIK & POOL)',
      dimsMm: ['18,600', '14,400'],
      baysX: [['A', 76], ['B', 246], ['C', 456], ['D', 576], ['E', 692]],
      baysY: [['1', 88], ['2', 236], ['3', 290], ['4', 418]],
      shell: { x: 76, y: 88, w: 616, h: 330 },
      terrace: { x: 76, y: 418, w: 616, h: 56, label: 'TRAVERTINE POOL DECK · 10m LAP POOL & GAZEBO', hasPool: true },
      rooms: [
        { no: '101', key: 'foyer',    name: 'PORTICO FOYER', x: 246, y: 290, w: 110, h: 128, m2: 18, flr: 'marble', door: [300, 418, 'up', 'double'] },
        { no: '102', key: 'office',   name: 'EXTERNAL GUEST MAJLIS',     x: 76,  y: 236, w: 170, h: 182, m2: 38, flr: 'marble', door: [155, 418, 'up'] },
        { no: '103', key: 'wc',       name: 'GUEST WASH & WC',           x: 76,  y: 88,  w: 110, h: 148, m2: 12, flr: 'tile',   door: [130, 236, 'up'] },
        { no: '104', key: 'corridor', name: 'CENTRAL GALLERY AXIS',      x: 246, y: 236, w: 330, h: 54,  m2: 22, flr: 'marble', door: [246, 263, 'left'] },
        { no: '105', key: 'living',   name: 'GRAND RECEPTION & 10P DINING', x: 356, y: 290, w: 336, h: 128, m2: 74, flr: 'marble', door: [520, 418, 'sliding'] },
        { no: '106', key: 'kitchen',  name: 'CHEF ISLAND & GREASE KITCHEN', x: 356, y: 88,  w: 220, h: 148, m2: 36, flr: 'tile',   door: [450, 236, 'up'] },
        { no: '107', key: 'bathroom', name: 'MAID + LAUNDRY + DRIVER',   x: 576, y: 88,  w: 116, h: 202, m2: 24, flr: 'tile',   door: [576, 190, 'right'] }
      ],
      core: { x: 186, y: 88, w: 170, h: 148, label: 'GRAND STAIR + LIFT' }
    },
    {
      code: 'A-102',
      title: 'STANDALONE COMPOUND VILLA — FIRST FLOOR (4 ENSUITE BEDROOM WINGS)',
      dimsMm: ['18,600', '14,400'],
      baysX: [['A', 76], ['B', 246], ['C', 456], ['D', 576], ['E', 692]],
      baysY: [['1', 88], ['2', 236], ['3', 290], ['4', 418]],
      shell: { x: 76, y: 88, w: 616, h: 330 },
      terrace: { x: 356, y: 418, w: 336, h: 44, label: 'MASTER POOL-VIEW PANORAMIC TERRACE' },
      rooms: [
        { no: '201', key: 'bedroom',  name: 'ROYAL MASTER WING + W.I.C.', x: 356, y: 290, w: 336, h: 128, m2: 64, flr: 'wood', door: [510, 418, 'sliding'] },
        { no: '202', key: 'bathroom', name: 'HIS/HERS SPA BATH + SAUNA',  x: 456, y: 88,  w: 236, h: 148, m2: 28, flr: 'tile', door: [560, 236, 'up'] },
        { no: '203', key: 'corridor', name: 'FAMILY PYJAMA LOUNGE',       x: 246, y: 236, w: 446, h: 54,  m2: 30, flr: 'wood', door: [410, 290, 'down'] },
        { no: '204', key: 'kids',     name: 'BEDROOM SUITES 02 & 03',     x: 76,  y: 236, w: 170, h: 182, m2: 46, flr: 'wood', door: [246, 320, 'left'] },
        { no: '205', key: 'office',   name: 'PRIVATE LIBRARY / SUITE 04', x: 76,  y: 88,  w: 110, h: 148, m2: 22, flr: 'wood', door: [130, 236, 'up'] },
        { no: '206', key: 'corridor', name: 'UPPER LANDING', x: 246, y: 290, w: 110, h: 128, m2: 16, flr: 'wood', door: [300, 290, 'up'] }
      ],
      core: { x: 186, y: 88, w: 270, h: 148, label: '← DN GF / UP ROOF →' }
    },
    {
      code: 'A-103',
      title: 'STANDALONE COMPOUND VILLA — ROOF PENTHOUSE, SKY PERGOLA & SOLAR DECK',
      dimsMm: ['18,600', '14,400'],
      baysX: [['A', 76], ['B', 246], ['C', 456], ['D', 576], ['E', 692]],
      baysY: [['1', 88], ['2', 236], ['3', 418]],
      shell: { x: 76, y: 88, w: 616, h: 330 },
      terrace: { x: 76, y: 236, w: 616, h: 182, label: '75% OPEN ROOFTOP TERRACE · BBQ PERGOLA, WATER TANKS & PV SOLAR ARRAY' },
      rooms: [
        { no: '301', key: 'bathroom', name: 'LAUNDRY, IRONING & ROOF WC', x: 456, y: 88, w: 236, h: 148, m2: 26, flr: 'tile', door: [540, 236, 'down'] },
        { no: '302', key: 'office',   name: 'ROOF PENTHOUSE / GYM LOUNGE', x: 76, y: 88, w: 170, h: 148, m2: 28, flr: 'wood', door: [160, 236, 'down'] }
      ],
      core: { x: 246, y: 88, w: 210, h: 148, label: '← DN TO 1F + LIFT OVERRUN' }
    }
  ],
  chalet: [
    {
      code: 'A-101',
      title: 'COASTAL LAGOON / SEAFRONT CHALET — ARCHITECTURAL DECK PLAN',
      dimsMm: ['13,200', '9,800'],
      baysX: [['A', 104], ['B', 304], ['C', 484], ['D', 664]],
      baysY: [['1', 96], ['2', 248], ['3', 396]],
      shell: { x: 104, y: 96, w: 560, h: 300 },
      terrace: { x: 104, y: 396, w: 560, h: 72, label: 'TEAK SUNSET VERANDA · OUTDOOR SHOWER & SEA STEPS' },
      rooms: [
        { no: '101', key: 'living',   name: 'OPEN BREEZE SALON & DINING', x: 104, y: 248, w: 380, h: 148, m2: 42, flr: 'wood', door: [280, 396, 'sliding'] },
        { no: '102', key: 'kitchen',  name: 'OPEN ISLAND BAR KITCHEN',    x: 484, y: 248, w: 180, h: 148, m2: 18, flr: 'tile', door: [570, 396, 'sliding'] },
        { no: '103', key: 'bedroom',  name: 'SEA-VIEW MASTER BEDROOM',    x: 104, y: 96,  w: 200, h: 152, m2: 22, flr: 'wood', door: [204, 248, 'up'] },
        { no: '104', key: 'bathroom', name: 'SAND-WASH BATH & WC',        x: 304, y: 96,  w: 110, h: 152, m2: 10, flr: 'tile', door: [358, 248, 'up'] },
        { no: '105', key: 'kids',     name: 'BUNK & TWIN GUEST CABIN',    x: 414, y: 96,  w: 250, h: 152, m2: 24, flr: 'wood', door: [520, 248, 'up'] }
      ],
      core: null
    }
  ],
  mansion: [
    {
      code: 'A-101',
      title: 'PALATIAL AMBASSADORIAL ESTATE — SYMMETRICAL COURTYARD GROUND PLAN',
      dimsMm: ['28,500', '19,200'],
      baysX: [['A', 68], ['B', 218], ['C', 384], ['D', 550], ['E', 700]],
      baysY: [['1', 86], ['2', 230], ['3', 284], ['4', 414]],
      shell: { x: 68, y: 86, w: 632, h: 328 },
      terrace: { x: 68, y: 414, w: 632, h: 60, label: 'OLYMPIAN INFINITY POOL · SUNKEN FIREPIT & COLONNADE', hasPool: true },
      rooms: [
        { no: '101', key: 'foyer',    name: 'IMPERIAL ROTUNDA DOME HALL', x: 298, y: 230, w: 172, h: 184, m2: 65, flr: 'marble', door: [384, 414, 'up', 'double'] },
        { no: '102', key: 'office',   name: 'WEST WING DIWAN & LIBRARY',  x: 68,  y: 230, w: 230, h: 184, m2: 78, flr: 'wood',   door: [180, 414, 'sliding'] },
        { no: '103', key: 'living',   name: 'EAST BANQUET & BALLROOM',    x: 470, y: 230, w: 230, h: 184, m2: 96, flr: 'marble', door: [580, 414, 'sliding'] },
        { no: '104', key: 'wc',       name: 'VIP CLOAKROOM & ABLUTION',   x: 68,  y: 86,  w: 150, h: 144, m2: 24, flr: 'tile',   door: [140, 230, 'up'] },
        { no: '105', key: 'kitchen',  name: 'COMMERCIAL CATERING & COLD', x: 490, y: 86,  w: 210, h: 144, m2: 58, flr: 'tile',   door: [580, 230, 'up'] },
        { no: '106', key: 'bathroom', name: 'STAFF QUARTERS (4 ROOMS)',   x: 218, y: 86,  w: 120, h: 144, m2: 38, flr: 'tile',   door: [275, 230, 'up'] }
      ],
      core: { x: 338, y: 86, w: 152, h: 144, label: 'TWIN SWEEP STAIR + LIFT' }
    },
    {
      code: 'A-102',
      title: 'PALATIAL AMBASSADORIAL ESTATE — UPPER ROYAL SUITES & CINEMA WING',
      dimsMm: ['28,500', '19,200'],
      baysX: [['A', 68], ['B', 218], ['C', 384], ['D', 550], ['E', 700]],
      baysY: [['1', 86], ['2', 230], ['3', 284], ['4', 414]],
      shell: { x: 68, y: 86, w: 632, h: 328 },
      terrace: { x: 68, y: 414, w: 632, h: 46, label: 'COLONNADED BELVEDERE BALUSTRADE TERRACE' },
      rooms: [
        { no: '201', key: 'bedroom',  name: 'SOVEREIGN MASTER WING + VAULT', x: 430, y: 230, w: 270, h: 184, m2: 110, flr: 'wood', door: [560, 414, 'sliding'] },
        { no: '202', key: 'bathroom', name: 'TURKISH HAMMAM & INDOOR SPA',   x: 490, y: 86,  w: 210, h: 144, m2: 52,  flr: 'tile', door: [580, 230, 'up'] },
        { no: '203', key: 'kids',     name: '4 ROYAL FAMILY SUITES (WEST)',  x: 68,  y: 230, w: 250, h: 184, m2: 120, flr: 'wood', door: [180, 414, 'sliding'] },
        { no: '204', key: 'office',   name: 'PRIVATE 12-SEAT CINEMA & GYM',  x: 68,  y: 86,  w: 270, h: 144, m2: 64,  flr: 'wood', door: [210, 230, 'up'] },
        { no: '205', key: 'corridor', name: 'ROTUNDA GALLERY MEZZANINE',     x: 318, y: 230, w: 112, h: 184, m2: 40,  flr: 'marble', door: [374, 414, 'sliding'] }
      ],
      core: { x: 338, y: 86, w: 152, h: 144, label: '← DN GF / UP ROOF →' }
    },
    {
      code: 'A-103',
      title: 'PALATIAL AMBASSADORIAL ESTATE — ROOF BELVEDERE, HELIPAD & SOLAR DECK',
      dimsMm: ['28,500', '19,200'],
      baysX: [['A', 68], ['B', 218], ['C', 384], ['D', 550], ['E', 700]],
      baysY: [['1', 86], ['2', 230], ['3', 414]],
      shell: { x: 68, y: 86, w: 632, h: 328 },
      terrace: { x: 68, y: 230, w: 632, h: 184, label: 'PANORAMIC SKY MAJLIS DECK · CHILLER PLANT & 18kW SOLAR ARRAY' },
      rooms: [
        { no: '301', key: 'office',   name: 'SKY OBSERVATORY & WINTER GARDEN', x: 68,  y: 86, w: 270, h: 144, m2: 58, flr: 'marble', door: [200, 230, 'down'] },
        { no: '302', key: 'bathroom', name: 'ROOF CATERING PANTRY & WC',      x: 490, y: 86, w: 210, h: 144, m2: 42, flr: 'tile',   door: [580, 230, 'down'] }
      ],
      core: { x: 338, y: 86, w: 152, h: 144, label: '← DN TO 1F + LIFT' }
    }
  ],
  commercial: [
    {
      code: 'A-101',
      title: 'COMMERCIAL FLAGSHIP SHOWROOM / CLINIC — LEASEHOLD FIT-OUT PLAN',
      dimsMm: ['16,000', '11,400'],
      baysX: [['A', 90], ['B', 290], ['C', 490], ['D', 684]],
      baysY: [['1', 92], ['2', 236], ['3', 422]],
      shell: { x: 90, y: 92, w: 594, h: 330 },
      terrace: { x: 90, y: 422, w: 594, h: 46, label: 'DOUBLE-GLAZED ARCADE STOREFRONT & SIDEWALK' },
      rooms: [
        { no: '101', key: 'living',   name: 'PUBLIC SHOWROOM & RECEPTION', x: 90,  y: 236, w: 400, h: 186, m2: 88, flr: 'marble', door: [280, 422, 'up', 'double'] },
        { no: '102', key: 'office',   name: 'EXECUTIVE DIRECTOR SUITE',    x: 490, y: 236, w: 194, h: 186, m2: 34, flr: 'wood',   door: [490, 320, 'right'] },
        { no: '103', key: 'kids',     name: 'BOARDROOM / CONSULTING ROOM', x: 90,  y: 92,  w: 240, h: 144, m2: 32, flr: 'wood',   door: [210, 236, 'up'] },
        { no: '104', key: 'kitchen',  name: 'STAFF PANTRY & SERVER RACK',  x: 330, y: 92,  w: 170, h: 144, m2: 20, flr: 'tile',   door: [410, 236, 'up'] },
        { no: '105', key: 'bathroom', name: 'ADA RESTROOMS (M / F)',       x: 500, y: 92,  w: 184, h: 144, m2: 18, flr: 'tile',   door: [580, 236, 'up'] }
      ],
      core: null
    }
  ],
  land: [
    {
      code: 'C-101',
      title: 'FREEHOLD CADASTRAL TOPOGRAPHIC SURVEY & MUNICIPAL SETBACK PLAN',
      dimsMm: ['25,000', '20,000'],
      baysX: [['A', 90], ['B', 385], ['C', 680]],
      baysY: [['1', 92], ['2', 260], ['3', 428]],
      shell: { x: 90, y: 92, w: 590, h: 336 },
      terrace: { x: 90, y: 428, w: 590, h: 44, label: '12.0m MUNICIPAL ASPHALT ROAD · WATER / HV POWER / FIBER MAIN' },
      rooms: [],
      core: null
    }
  ]
};

export function propertyFloorPlans(shape = 'apartment', country = '', areaM2 = null, totalRooms = null, furnishedRooms = {}) {
  const floors = JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS[shape] || A101_SCHEMATICS[shape] || A101_SCHEMATICS.apartment));
  // Japanese apartment: wet rooms by the entrance, LDK at the rear, bedrooms
  // off a central hall. Numbers and furnishing keys survive save upgrades.
  if (country === 'jpn' && shape === 'apartment') {
    const layout = {
      '101':[504,292,90,136], '102':[594,360,90,68],
      '103':[84,238,420,54], '104':[84,292,300,136],
      '105':[384,292,120,136], '106':[84,92,196,146],
      '107':[594,238,90,122], '108':[280,92,196,146],
      '109':[476,92,208,146]
    };
    for (const room of floors[0].rooms) {
      [room.x,room.y,room.w,room.h] = layout[room.no];
      delete room.door;
    }
    floors[0].core = null;
  }
  if (country === 'uae' && shape === 'apartment') {
    const layout = {'101':[416,292,110,136],'102':[526,356,74,72],'103':[84,238,470,54],'104':[84,292,332,136],'105':[344,292,210,64],'106':[84,92,196,146],'107':[554,238,130,118],'108':[280,92,138,146],'109':[418,92,266,146]};
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = layout[room.no]; delete room.door; }
    // Open kitchen edge next to living/dining, not a universal formal salon.
    const kitchen=floors[0].rooms.find(r=>r.no==='105');kitchen.x=526;kitchen.y=292;kitchen.w=158;kitchen.h=64;
  }
  if (country === 'uae' && shape === 'villa') {
    const layout = {'101':[246,290,110,128],'102':[76,290,170,128],'103':[76,88,110,148],'104':[76,236,280,54],'105':[356,236,336,182],'106':[356,88,220,148],'107':[576,88,116,148]};
    for(const room of floors[0].rooms){[room.x,room.y,room.w,room.h]=layout[room.no];delete room.door;}
  }
  if (country === 'egy' && shape === 'studio') {
    // Compact wet core beside entry, living/dining and sleeping zone opposite.
    const layout = {'101':[430,330,140,90],'102':[430,110,140,105],'103':[430,215,140,115],'104':[150,255,280,165],'105':[150,110,280,145]};
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = layout[room.no]; delete room.door; }
  }
  if (country === 'egy' && shape === 'duplex') {
    // Reception downstairs, family sleeping rooms upstairs. Move the service
    // bay beside the stair, leaving the separate guest study near the entry.
    const layout = {'101':[294,296,170,132],'102':[84,92,210,336],'103':[464,296,220,132],'104':[464,92,220,204],'105':[294,92,96,120],'106':[294,212,170,84]};
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = layout[room.no]; delete room.door; }
  }
  if (country === 'egy' && shape === 'townhouse') {
    // Narrow attached home: entry/reception below, sleeping floor above.
    const layout = {'101':[134,246,166,178],'102':[300,246,334,178],'103':[134,92,240,154],'104':[374,92,160,154],'105':[534,168,100,78]};
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = layout[room.no]; delete room.door; }
  }
  if (country === 'egy' && shape === 'twin_house') {
    // Side-entry semi-detached layout, distinct from the narrow townhouse.
    const layout = {'101':[484,252,200,172],'102':[94,252,390,172],'103':[94,92,240,160],'104':[334,92,170,160],'105':[504,172,180,80]};
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = layout[room.no]; delete room.door; }
  }
  if (country === 'egy' && shape === 'penthouse') {
    const layout = {'101':[84,226,356,166],'102':[440,246,244,146],'103':[84,92,216,134],'104':[300,92,140,134],'105':[440,92,154,154]};
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = layout[room.no]; delete room.door; }
  }
  if (country === 'egy' && shape === 'chalet') {
    const layout = {'101':[104,248,360,148],'102':[464,248,200,148],'103':[104,96,220,152],'104':[324,96,110,152],'105':[434,96,230,152]};
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = layout[room.no]; delete room.door; }
  }
  if (country === 'egy' && shape === 'mansion') {
    const layout = {'101':[298,230,172,184],'102':[68,230,230,184],'103':[470,230,230,184],'104':[68,86,140,144],'105':[490,86,210,144],'106':[208,86,130,144]};
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = layout[room.no]; delete room.door; }
  }
  if (country === 'egy' && shape === 'villa') {
    const ground = {
      '101':[246,290,110,128], '102':[76,236,170,182],
      '103':[76,88,110,148], '104':[246,236,446,54],
      '105':[356,290,336,128], '106':[356,88,220,148],
      '107':[576,88,116,148]
    };
    for (const room of floors[0].rooms) { [room.x,room.y,room.w,room.h] = ground[room.no]; delete room.door; }
    // Two storeys with a usable roof, not a royal suite/servants palace.
    floors[0].terrace.hasPool = false;
    floors[0].terrace.label = 'GARDEN ACCESS TERRACE';
  }
  if (country === 'can' && shape === 'twin_house') {
    // Semi-detached template: shared party wall, entry/stairs and rear kitchen.
    const layout={'101':[484,252,200,172],'102':[94,252,390,172],'103':[94,92,260,160],'104':[354,92,150,160],'105':[504,172,180,80]};
    for(const r of floors[0].rooms){[r.x,r.y,r.w,r.h]=layout[r.no];delete r.door;}
  }
  if (country === 'can' && shape === 'apartment') {
    const layout={'101':[454,292,100,136],'102':[554,362,130,66],'103':[84,238,470,54],'104':[84,292,290,136],'105':[374,292,80,136],'106':[84,92,196,146],'107':[554,238,130,124],'108':[280,92,138,146],'109':[418,92,136,146]};
    for(const r of floors[0].rooms){[r.x,r.y,r.w,r.h]=layout[r.no];delete r.door;}
    floors[0].core=null;
  }
  if (country === 'deu' && shape === 'apartment') {
    const layout={'101':[474,292,80,136],'102':[554,366,130,62],'103':[84,238,470,54],'104':[84,292,300,136],'105':[384,292,90,136],'106':[84,92,196,146],'107':[554,92,130,146],'108':[280,92,138,146],'109':[418,92,136,146]};
    for(const r of floors[0].rooms){[r.x,r.y,r.w,r.h]=layout[r.no];delete r.door;}
    // Bathroom access from the hall beside the entrance.
    const bath=floors[0].rooms.find(r=>r.no==='107');bath.x=554;bath.y=238;bath.w=130;bath.h=128;
    floors[0].core=null;
  }
  if (country === 'usa' && shape === 'apartment') {
    const layout={'101':[454,292,100,136],'102':[554,362,130,66],'103':[84,238,470,54],'104':[84,292,370,136],'105':[554,238,130,124],'106':[84,92,196,146],'107':[554,92,130,146],'108':[280,92,138,146],'109':[418,92,136,146]};
    for(const r of floors[0].rooms){[r.x,r.y,r.w,r.h]=layout[r.no];delete r.door;}
    floors[0].core=null;
  }
  if (country === 'usa' && shape === 'villa') {
    const layout={'101':[246,290,110,128],'102':[76,236,170,182],'103':[76,88,110,148],'104':[246,236,330,54],'105':[356,290,336,128],'106':[356,88,220,148],'107':[576,88,116,202]};
    for(const r of floors[0].rooms){[r.x,r.y,r.w,r.h]=layout[r.no];delete r.door;}
    floors[0].terrace.hasPool=false;
  }
  if (country === 'gbr' && shape === 'townhouse') {
    // Terraced-home template: front sitting room, central stairs, rear kitchen.
    const layout={'101':[134,246,112,178],'102':[246,246,388,178],'103':[134,92,220,154],'104':[354,92,180,154],'105':[534,168,100,78]};
    for(const r of floors[0].rooms){[r.x,r.y,r.w,r.h]=layout[r.no];delete r.door;}
  }
  if (country === 'gbr' && shape === 'apartment') {
    const layout={'101':[450,292,104,136],'102':[554,356,130,72],'103':[84,238,470,54],'104':[84,292,366,136],'105':[554,238,130,118],'106':[84,92,196,146],'107':[554,92,130,146],'108':[280,92,138,146],'109':[418,92,136,146]};
    for(const r of floors[0].rooms){[r.x,r.y,r.w,r.h]=layout[r.no];delete r.door;}
    floors[0].core=null;
  }
  if (country === 'jpn' && shape === 'villa') {
    const ground = {
      '101':[246,290,110,128], '102':[76,290,170,128],
      '103':[76,88,110,148], '104':[76,236,280,54],
      '105':[356,236,336,182], '106':[356,88,220,148],
      '107':[576,88,116,148]
    };
    for (const room of floors[0].rooms) {
      [room.x,room.y,room.w,room.h] = ground[room.no];
      delete room.door;
    }
    floors[0].terrace.hasPool = false;
    floors[0].terrace.label = 'GARDEN TERRACE';
  }
  if (shape === 'apartment' && Number(totalRooms) > 0) {
    const plan = floors[0];
    plan.rooms = plan.rooms.filter(r => roomBelongsToHome(r, shape, totalRooms, furnishedRooms));
    const beds = plan.rooms.filter(r => ['106','108','109'].includes(r.no));
    const jp = country === 'jpn';
    const bedroomWidth = (jp || ['deu','can'].includes(country)) ? 600 : 470;
    beds.forEach((room, i) => { room.x = 84 + bedroomWidth * i / beds.length; room.y = 92; room.w = bedroomWidth / beds.length; room.h = 146; delete room.door; });
    if (!jp && !['deu','can'].includes(country)) { const bath = plan.rooms.find(r => r.no === '107'); bath.x = 554; bath.y = 92; bath.w = 130; bath.h = 146; delete bath.door; }
  }
  if (country === 'sau' && ['apartment','villa','duplex','townhouse','twin_house'].includes(shape)) {
    // Keep guest reception near the entrance, with the family rooms behind.
    // Mirroring the base shell yields a separate saved regional template while
    // retaining room identities and all furnishing purchases.
    for (const floor of floors) {
      const mirrorX = x => floor.shell.x * 2 + floor.shell.w - x;
      for (const room of floor.rooms) {
        room.x = mirrorX(room.x + room.w);
        if (room.door) { room.door[0] = mirrorX(room.door[0]); room.door[2] = ({left:'right',right:'left'})[room.door[2]] || room.door[2]; }
      }
      if (floor.core) floor.core.x = mirrorX(floor.core.x + floor.core.w);
    }
  }
  for (const floor of floors) {
    floor.title = `${String(shape).replace(/_/g, ' ').toUpperCase()} — FICTIONAL HOME LAYOUT`;
    if (floor.core) floor.core.label = 'STAIRS / SHARED ACCESS';
  }
  const rooms = floors.flatMap(f => f.rooms);
  for (const room of rooms) room.name = regionalRoomName(room, country, shape);
  const target = Number(areaM2);
  const total = rooms.reduce((n, r) => n + (r.m2 || 0), 0);
  if (target > 0 && total > 0) {
    // Largest-remainder allocation: displayed room areas equal the deed area.
    const units = Math.round(target * 10);
    const shares = rooms.map(r => ({room:r, raw:units * (r.m2 || 0) / total}));
    let allocated = 0;
    for (const share of shares) { share.units = Math.floor(share.raw); allocated += share.units; }
    const ranked = [...shares].sort((a,b) => (b.raw-b.units)-(a.raw-a.units));
    for (let i=0; i<units-allocated; i++) ranked[i % ranked.length].units++;
    for (const share of shares) share.room.m2 = share.units / 10;
  }
  return floors;
}

function drawSlashDimensionH(x1, x2, y, label, col) {
  const mx = (x1 + x2) / 2;
  return `
    <g stroke="${col}" stroke-width="0.85">
      <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>
      <line x1="${x1}" y1="${y - 5}" x2="${x1}" y2="${y + 5}"/>
      <line x1="${x2}" y1="${y - 5}" x2="${x2}" y2="${y + 5}"/>
      <line x1="${x1 - 3.5}" y1="${y + 3.5}" x2="${x1 + 3.5}" y2="${y - 3.5}" stroke-width="1.3"/>
      <line x1="${x2 - 3.5}" y1="${y + 3.5}" x2="${x2 + 3.5}" y2="${y - 3.5}" stroke-width="1.3"/>
    </g>
    <text x="${mx}" y="${y - 3.5}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.2" font-weight="700" fill="${col}">${label}</text>
  `;
}

function drawSlashDimensionV(x, y1, y2, label, col) {
  const my = (y1 + y2) / 2;
  return `
    <g stroke="${col}" stroke-width="0.85">
      <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>
      <line x1="${x - 5}" y1="${y1}" x2="${x + 5}" y2="${y1}"/>
      <line x1="${x - 5}" y1="${y2}" x2="${x + 5}" y2="${y2}"/>
      <line x1="${x - 3.5}" y1="${y1 + 3.5}" x2="${x + 3.5}" y2="${y1 - 3.5}" stroke-width="1.3"/>
      <line x1="${x - 3.5}" y1="${y2 + 3.5}" x2="${x + 3.5}" y2="${y2 - 3.5}" stroke-width="1.3"/>
    </g>
    <text x="${x - 5}" y="${my}" text-anchor="middle" transform="rotate(-90 ${x - 5} ${my})" font-family="JetBrains Mono, monospace" font-size="8.2" font-weight="700" fill="${col}">${label}</text>
  `;
}

function drawArchDoorSymbol(door, bgHex, lineCol) {
  if (!door) return '';
  const [dx, dy, dir, kind] = door;
  if (kind === 'sliding') {
    return `
      <rect x="${dx - 26}" y="${dy - 3.5}" width="52" height="7" fill="${bgHex}"/>
      <line x1="${dx - 26}" y1="${dy - 1.4}" x2="${dx + 4}" y2="${dy - 1.4}" stroke="${lineCol}" stroke-width="1.6"/>
      <line x1="${dx - 4}" y1="${dy + 1.4}" x2="${dx + 26}" y2="${dy + 1.4}" stroke="${lineCol}" stroke-width="1.6"/>
    `;
  }
  if (kind === 'double') {
    const r = 17;
    return `
      <rect x="${dx - r}" y="${dy - 4}" width="${r * 2}" height="8" fill="${bgHex}"/>
      <line x1="${dx - r}" y1="${dy}" x2="${dx - r}" y2="${dy - r}" stroke="${lineCol}" stroke-width="1.7"/>
      <line x1="${dx + r}" y1="${dy}" x2="${dx + r}" y2="${dy - r}" stroke="${lineCol}" stroke-width="1.7"/>
      <path d="M${dx - r},${dy - r} A${r},${r} 0 0,1 ${dx},${dy}" fill="none" stroke="${lineCol}" stroke-width="0.9" stroke-dasharray="2.5 2"/>
      <path d="M${dx + r},${dy - r} A${r},${r} 0 0,0 ${dx},${dy}" fill="none" stroke="${lineCol}" stroke-width="0.9" stroke-dasharray="2.5 2"/>
    `;
  }
  const r = 18;
  if (dir === 'up') {
    return `
      <rect x="${dx - 2}" y="${dy - 3.5}" width="${r + 4}" height="7" fill="${bgHex}"/>
      <line x1="${dx}" y1="${dy}" x2="${dx}" y2="${dy - r}" stroke="${lineCol}" stroke-width="1.7"/>
      <path d="M${dx},${dy - r} A${r},${r} 0 0,1 ${dx + r},${dy}" fill="none" stroke="${lineCol}" stroke-width="0.9" stroke-dasharray="2.5 2"/>
    `;
  }
  if (dir === 'down') {
    return `
      <rect x="${dx - 2}" y="${dy - 3.5}" width="${r + 4}" height="7" fill="${bgHex}"/>
      <line x1="${dx}" y1="${dy}" x2="${dx}" y2="${dy + r}" stroke="${lineCol}" stroke-width="1.7"/>
      <path d="M${dx},${dy + r} A${r},${r} 0 0,0 ${dx + r},${dy}" fill="none" stroke="${lineCol}" stroke-width="0.9" stroke-dasharray="2.5 2"/>
    `;
  }
  if (dir === 'right') {
    return `
      <rect x="${dx - 3.5}" y="${dy - r - 2}" width="7" height="${r + 4}" fill="${bgHex}"/>
      <line x1="${dx}" y1="${dy}" x2="${dx + r}" y2="${dy}" stroke="${lineCol}" stroke-width="1.7"/>
      <path d="M${dx + r},${dy} A${r},${r} 0 0,0 ${dx},${dy - r}" fill="none" stroke="${lineCol}" stroke-width="0.9" stroke-dasharray="2.5 2"/>
    `;
  }
  return `
    <rect x="${dx - 3.5}" y="${dy - r - 2}" width="7" height="${r + 4}" fill="${bgHex}"/>
    <line x1="${dx}" y1="${dy}" x2="${dx - r}" y2="${dy}" stroke="${lineCol}" stroke-width="1.7"/>
    <path d="M${dx - r},${dy} A${r},${r} 0 0,1 ${dx},${dy - r}" fill="none" stroke="${lineCol}" stroke-width="0.9" stroke-dasharray="2.5 2"/>
  `;
}

/* Scale Architectural CAD Furniture & Plumbing Fixtures per Room Type */
function drawScaleCadFixtures(rm, isFurnished, cyanMode) {
  const { key, x, y, w, h } = rm;
  const st = isFurnished
    ? (cyanMode ? '#86EFAC' : '#15803D')
    : (cyanMode ? 'rgba(186,230,253,0.58)' : '#64748B');
  const fl = isFurnished
    ? (cyanMode ? 'rgba(34,197,94,0.22)' : 'rgba(187,247,208,0.65)')
    : (cyanMode ? 'rgba(14,165,233,0.12)' : 'rgba(226,232,240,0.48)');
  const subBg = cyanMode ? '#0F315C' : '#FFFFFF';

  if (key === 'void' || key === 'corridor') {
    if (key === 'void') {
      return `<line x1="${x + 8}" y1="${y + 8}" x2="${x + w - 8}" y2="${y + h - 8}" stroke="${st}" stroke-width="0.8" stroke-dasharray="4 3"/>
              <line x1="${x + w - 8}" y1="${y + 8}" x2="${x + 8}" y2="${y + h - 8}" stroke="${st}" stroke-width="0.8" stroke-dasharray="4 3"/>`;
    }
    return '';
  }

  if (key === 'foyer') {
    const cx = x + w / 2, cy = y + h * 0.56;
    return `
      <circle cx="${cx}" cy="${cy}" r="${Math.min(18, w * 0.16)}" fill="none" stroke="${st}" stroke-width="0.9"/>
      <polygon points="${cx},${cy - 12} ${cx + 12},${cy} ${cx},${cy + 12} ${cx - 12},${cy}" fill="${fl}" stroke="${st}" stroke-width="0.9"/>
    `;
  }

  if (key === 'wc') {
    return `
      <g transform="translate(${x + 12}, ${y + h - 34})">
        <rect x="0" y="0" width="14" height="6" rx="1" fill="${fl}" stroke="${st}" stroke-width="1.1"/>
        <ellipse cx="7" cy="14" rx="5.5" ry="7.5" fill="${subBg}" stroke="${st}" stroke-width="1.1"/>
        <rect x="26" y="4" width="18" height="12" rx="2" fill="${subBg}" stroke="${st}" stroke-width="1.1"/>
        <circle cx="35" cy="10" r="2" fill="${st}"/>
      </g>
    `;
  }

  if (key === 'living') {
    const sx = x + 16, sy = y + h - 68;
    const diningX = x + w - 98, diningY = y + h - 62;
    return `
      <!-- Living Salon Area Rug, L-Sofa, Armchairs & Coffee Table -->
      <g transform="translate(${sx}, ${sy})">
        <rect x="0" y="0" width="84" height="52" rx="2" fill="none" stroke="${st}" stroke-width="0.8" stroke-dasharray="3 2"/>
        <rect x="4" y="34" width="62" height="15" rx="2" fill="${fl}" stroke="${st}" stroke-width="1.3"/>
        <rect x="4" y="6" width="15" height="43" rx="2" fill="${fl}" stroke="${st}" stroke-width="1.3"/>
        <rect x="27" y="14" width="28" height="13" rx="1.5" fill="${subBg}" stroke="${st}" stroke-width="1.1"/>
        <rect x="68" y="12" width="13" height="15" rx="2" fill="${fl}" stroke="${st}" stroke-width="1.2"/>
      </g>
      ${w >= 240 ? `
        <!-- 8-Chair Formal Dining Table -->
        <g transform="translate(${diningX}, ${diningY})">
          <rect x="12" y="10" width="58" height="28" rx="2" fill="${subBg}" stroke="${st}" stroke-width="1.3"/>
          ${[20, 35, 50, 62].map(cx => `
            <rect x="${cx - 4}" y="3" width="8" height="5" rx="1.5" fill="${fl}" stroke="${st}" stroke-width="1"/>
            <rect x="${cx - 4}" y="40" width="8" height="5" rx="1.5" fill="${fl}" stroke="${st}" stroke-width="1"/>
          `).join('')}
          <rect x="4" y="20" width="6" height="8" rx="1.5" fill="${fl}" stroke="${st}" stroke-width="1"/>
          <rect x="72" y="20" width="6" height="8" rx="1.5" fill="${fl}" stroke="${st}" stroke-width="1"/>
        </g>
      ` : ''}
    `;
  }

  if (key === 'kitchen') {
    const kx = x + w - 94, ky = y + h - 66;
    return `
      <!-- L-Shaped 600mm Countertop, 4-Burner Hob, Double Drainboard Sink, REF & Island -->
      <g transform="translate(${kx}, ${ky})">
        <path d="M0,42 L82,42 L82,0 L62,0 L62,22 L0,22 Z" fill="${fl}" stroke="${st}" stroke-width="1.3"/>
        <!-- 4-Burner Range -->
        <rect x="10" y="24" width="22" height="16" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <circle cx="15.5" cy="28.5" r="2.6" fill="none" stroke="${st}" stroke-width="1"/>
        <circle cx="26.5" cy="28.5" r="2.6" fill="none" stroke="${st}" stroke-width="1"/>
        <circle cx="15.5" cy="35.5" r="2.6" fill="none" stroke="${st}" stroke-width="1"/>
        <circle cx="26.5" cy="35.5" r="2.6" fill="none" stroke="${st}" stroke-width="1"/>
        <!-- Double Stainless Sink -->
        <rect x="38" y="25" width="22" height="14" rx="1" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <line x1="49" y1="25" x2="49" y2="39" stroke="${st}" stroke-width="0.9"/>
        <!-- Fridge (REF) -->
        <rect x="63" y="-18" width="18" height="16" fill="${subBg}" stroke="${st}" stroke-width="1.2"/>
        <text x="72" y="-8" text-anchor="middle" font-size="6.2" font-family="JetBrains Mono, monospace" font-weight="700" fill="${st}">REF</text>
        ${w >= 170 ? `
          <!-- Breakfast Island + 3 Stools -->
          <rect x="8" y="-6" width="42" height="15" rx="1.5" fill="${subBg}" stroke="${st}" stroke-width="1.2"/>
          <circle cx="16" cy="-10" r="2.8" fill="${fl}" stroke="${st}" stroke-width="0.9"/>
          <circle cx="29" cy="-10" r="2.8" fill="${fl}" stroke="${st}" stroke-width="0.9"/>
          <circle cx="42" cy="-10" r="2.8" fill="${fl}" stroke="${st}" stroke-width="0.9"/>
        ` : ''}
      </g>
    `;
  }

  if (key === 'bedroom') {
    const bx = x + 18, by = y + h - 66;
    return `
      <!-- King Bed + Headboard + 4 Pillows + Folded Duvet + Twin Nightstands + W.I.C. Closet -->
      <g transform="translate(${bx}, ${by})">
        <rect x="0" y="2" width="10" height="10" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <rect x="64" y="2" width="10" height="10" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <rect x="12" y="0" width="50" height="54" rx="2" fill="${fl}" stroke="${st}" stroke-width="1.4"/>
        <rect x="12" y="0" width="50" height="4" fill="${st}"/>
        <rect x="16" y="6" width="19" height="9" rx="1.5" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <rect x="39" y="6" width="19" height="9" rx="1.5" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <line x1="12" y1="20" x2="62" y2="20" stroke="${st}" stroke-width="1.1"/>
        ${w >= 190 ? `
          <!-- Walk-in Wardrobe Closet Hatch -->
          <rect x="84" y="6" width="56" height="16" fill="${subBg}" stroke="${st}" stroke-width="1.1"/>
          <line x1="84" y1="14" x2="140" y2="14" stroke="${st}" stroke-width="0.8" stroke-dasharray="2 2"/>
          <text x="112" y="31" text-anchor="middle" font-size="6.5" font-family="JetBrains Mono, monospace" font-weight="700" fill="${st}">W.I.C.</text>
        ` : ''}
      </g>
    `;
  }

  if (key === 'kids') {
    const kx = x + 16, ky = y + h - 60;
    return `
      <!-- Twin Beds + Study Desk + Sliding Wardrobe -->
      <g transform="translate(${kx}, ${ky})">
        <rect x="0" y="4" width="26" height="46" rx="2" fill="${fl}" stroke="${st}" stroke-width="1.3"/>
        <rect x="4" y="8" width="18" height="8" rx="1" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <line x1="0" y1="19" x2="26" y2="19" stroke="${st}" stroke-width="1"/>
        <rect x="34" y="4" width="26" height="46" rx="2" fill="${fl}" stroke="${st}" stroke-width="1.3"/>
        <rect x="38" y="8" width="18" height="8" rx="1" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <line x1="34" y1="19" x2="60" y2="19" stroke="${st}" stroke-width="1"/>
        ${w >= 150 ? `
          <rect x="70" y="16" width="32" height="14" fill="${subBg}" stroke="${st}" stroke-width="1.1"/>
          <circle cx="86" cy="35" r="4" fill="${fl}" stroke="${st}" stroke-width="1"/>
        ` : ''}
      </g>
    `;
  }

  if (key === 'bathroom') {
    const wx = x + 12, wy = y + h - 56;
    return `
      <!-- Walk-In Glass Rain Shower (X Slope Drain) + Vanity + Porcelain Tub / WC -->
      <g transform="translate(${wx}, ${wy})">
        <rect x="0" y="0" width="28" height="28" fill="${subBg}" stroke="${st}" stroke-width="1.2"/>
        <line x1="0" y1="0" x2="28" y2="28" stroke="${st}" stroke-width="0.75"/>
        <line x1="28" y1="0" x2="0" y2="28" stroke="${st}" stroke-width="0.75"/>
        <circle cx="14" cy="14" r="2.4" fill="${subBg}" stroke="${st}" stroke-width="1"/>
        <!-- Vanity Sink -->
        <rect x="34" y="0" width="24" height="13" fill="${fl}" stroke="${st}" stroke-width="1.1"/>
        <ellipse cx="46" cy="6.5" rx="6" ry="4" fill="${subBg}" stroke="${st}" stroke-width="0.9"/>
        <!-- Wall-Hung WC -->
        <rect x="39" y="20" width="14" height="5" fill="${fl}" stroke="${st}" stroke-width="1"/>
        <ellipse cx="46" cy="32" rx="5.5" ry="7" fill="${subBg}" stroke="${st}" stroke-width="1.1"/>
        ${w >= 115 ? `
          <rect x="64" y="2" width="34" height="18" rx="6" fill="${fl}" stroke="${st}" stroke-width="1.2"/>
        ` : ''}
      </g>
    `;
  }

  // Majlis / Executive Study
  const mx = x + 16, my = y + h - 58;
  return `
    <g transform="translate(${mx}, ${my})">
      <path d="M0,0 L76,0 L76,42 L62,42 L62,13 L14,13 L14,42 L0,42 Z" fill="${fl}" stroke="${st}" stroke-width="1.3"/>
      <rect x="24" y="21" width="28" height="14" rx="2" fill="${subBg}" stroke="${st}" stroke-width="1.1"/>
    </g>
  `;
}

/* --- Plain-words dossier helpers (v2.3) --- */
function plainFloorLabel(idx, shape = '') {
  if(shape==='aus_highset'&&idx===0)return 'Raised living floor';
  if(shape==='brownstone')return ['Lower-ground floor','Raised ground floor','First floor','Second floor'][idx]||`Level ${idx+1}`;
  if((['victorian','nld_attic'].includes(shape)&&idx===2)||(shape==='nld_gable'&&idx===3))return 'Attic floor';
  return idx===0?'Ground floor':idx===1?'First floor':idx===2?'Second floor':`Level ${idx+1}`;
}
function plainViewLabel(mode) {
  return mode === 'cutaway' ? 'Inside, roof off' : mode === 'exploded' ? 'Floors pulled apart' : 'From outside';
}
function plainTimeLabel(tod) {
  return tod === 'dawn' ? '6:00 in the morning'
    : tod === 'sunset' ? '6:00 in the evening'
    : tod === 'night' ? '10:00 at night' : '1:00 in the afternoon';
}
/* In-plan room name: full name minus the surveyor datum suffix (never mid-word cuts). */
function planRoomName(rm) {
  return String(rm.name || '').replace(/\s*·\s*FFL.*$/, '').trim();
}
/* Word-wrap the in-plan name so it always fits inside its room (never cut mid-word). */
function roomTagLines(rm) {
  const name = planRoomName(rm);
  const charW = 0.56 * 9.5;
  const firstMax = Math.max(4, Math.floor((rm.w - 44) / charW));
  const restMax = Math.max(4, Math.floor((rm.w - 16) / charW));
  if (name.length <= firstMax) return [name];
  const words = name.split(/\s+/);
  const lines = [];
  let cur = '';
  let limit = firstMax;
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length <= limit) { cur = next; continue; }
    if (cur) lines.push(cur);
    cur = w;
    limit = restMax;
    while (cur.length > restMax) { lines.push(cur.slice(0, restMax)); cur = cur.slice(restMax); }
  }
  if (cur) lines.push(cur);
  return lines;
}
/* Bottom of the room tag (number box + name lines + size line), relative to the room top. */
function roomTagBottom(rm) {
  return 20 + roomTagLines(rm).length * 12;
}
/* Plain terrace label: what the space is, not a surveyor's note. */
function terracePlainLabel(plan) {
  const label = String(plan.terrace?.label || '').toUpperCase();
  if (plan.code === 'A-103' || /ROOF|SKY/.test(label)) return 'Roof terrace';
  if (plan.terrace?.hasPool) return 'Terrace · Pool';
  if (/STOREFRONT/.test(label)) return 'Shop front';
  if (/GARDEN|VERANDA|PATIO/.test(label)) return 'Garden terrace';
  if (/BALCONY|LOGGIA/.test(label)) return 'Balcony';
  return 'Terrace';
}
/* Furnished state: room numbers are the key now; fall back to the old generic
   key only when a save still stores no room numbers at all. */
function isRoomFurnished(furnishedRooms, rm) {
  const fr = furnishedRooms || {};
  const hasNumberKeys = Object.keys(fr).some(k => /^\d+$/.test(k));
  return hasNumberKeys ? !!fr[rm.no] : !!fr[rm.key];
}
/* Shrink a fixture group (about the room's bottom-left corner) just enough that
   it never reaches the room tag at the top of the room. Returns '' when it fits. */
function fixtureScaleTransform(rm, tagBottom) {
  const h = rm.h;
  let fixtureHeight;
  if (rm.key === 'kitchen') fixtureHeight = rm.w >= 170 ? 84 : 66;
  else if (rm.key === 'bathroom') fixtureHeight = 56;
  else if (rm.key === 'wc') fixtureHeight = 34;
  else if (rm.key === 'living') fixtureHeight = 68;
  else if (rm.key === 'bedroom') fixtureHeight = 66;
  else if (rm.key === 'kids') fixtureHeight = 60;
  else if (rm.key === 'office') fixtureHeight = 58;
  else if (rm.key === 'foyer') fixtureHeight = Math.round(0.44 * h + 18);
  else return '';
  const topY = h - fixtureHeight;
  const minTop = tagBottom + 2;
  if (topY >= minTop) return '';
  const s = Math.max(0.55, (h - minTop) / fixtureHeight);
  return `translate(${rm.x} ${rm.y + h}) scale(${s.toFixed(3)}) translate(${-rm.x} ${-(rm.y + h)})`;
}

export function renderArchitecturalFloorplanSvg(
  shape = 'apartment',
  finish = 'standard',
  furnishedRooms = {},
  customAreaM2 = null,
  floorIdx = 0,
  clickablePropId = null,
  cadOptions = {}
) {
  const floors = propertyFloorPlans(shape, cadOptions.country, customAreaM2, cadOptions.totalRooms, furnishedRooms);
  const idx = Math.min(floors.length - 1, Math.max(0, Number(floorIdx) || 0));
  const plan = floors[idx];
  if (plan.terrace) { plan.terrace.hasPool = !!cadOptions.hasPool && idx === 0; if (!cadOptions.hasPool) plan.terrace.label = 'OUTDOOR TERRACE'; }

  const cyanMode = !!cadOptions.cyanotype;
  const showMep = !!cadOptions.showMep;
  const viewMode = cadOptions.viewMode || 'elevation';
  const timeOfDay = cadOptions.timeOfDay || 'noon';

  // Color Theme: Archival Vellum Paper vs Prussian Cyanotype Blueprint
  const paperBg   = cyanMode ? '#0B2545' : '#FCFBF7';
  const cardBg    = cyanMode ? '#0F315C' : '#F6F2E9';
  const inkMain   = cyanMode ? '#F0F9FF' : '#141413';
  const inkSub    = cyanMode ? '#93C5FD' : '#575047';
  const dimBlue   = cyanMode ? '#7DD3FC' : '#1D3557';
  const gridCol   = cyanMode ? 'rgba(125,211,252,0.14)' : 'rgba(28,25,23,0.065)';
  const wallFill  = cyanMode ? '#1E4E8C' : '#292524';
  const colFill   = cyanMode ? '#E0F2FE' : '#141413';

  const sh = plan.shell;
  const finishLabel = String(finish || 'standard').replace(/_/g, ' ').toUpperCase();
  const isRoof = plan.code === 'A-103';
  const floorLabel = plainFloorLabel(idx, shape);
  const viewLabel = plainViewLabel(viewMode);
  const timeLabel = plainTimeLabel(timeOfDay);
  // The sheet itself tints with the time of day (warm morning, bright midday,
  // amber evening, dark night) so the solar controls visibly change the drawing.
  const solarTint = timeOfDay === 'dawn' ? 'rgba(251,191,36,0.10)'
    : timeOfDay === 'sunset' ? 'rgba(249,115,22,0.13)'
    : timeOfDay === 'night' ? 'rgba(15,23,42,0.30)' : 'rgba(255,255,255,0)';
  const sizeLine = (() => {
    const wM = parseFloat(String(plan.dimsMm[0]).replace(/,/g, '')) / 1000;
    const dM = parseFloat(String(plan.dimsMm[1]).replace(/,/g, '')) / 1000;
    return `${wM.toFixed(1)} m wide × ${dM.toFixed(1)} m deep`;
  })();
  const patKey = `${shape}_${idx}_${cyanMode ? 'c' : 'v'}`;

  // Special Cadastral Land Survey Sheet — a plot, not a building: no room list.
  if (shape === 'land') {
    const landW = (parseFloat(String(plan.dimsMm[0]).replace(/,/g, '')) / 1000).toFixed(1);
    const landD = (parseFloat(String(plan.dimsMm[1]).replace(/,/g, '')) / 1000).toFixed(1);
    return `
      <svg viewBox="0 0 920 500" width="100%" role="img" aria-label="${escAttr(plan.title)}" style="background:${paperBg};border:1.5px solid ${inkMain};border-radius:10px;display:block">
        <defs>
          <pattern id="cadSurvGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${gridCol}" stroke-width="0.8"/>
          </pattern>
        </defs>
        <rect width="920" height="500" fill="url(#cadSurvGrid)"/>
        <rect width="920" height="500" fill="${solarTint}"/>
        <rect x="14" y="14" width="712" height="472" fill="none" stroke="${inkMain}" stroke-width="1.6"/>
        ${drawSlashDimensionH(sh.x, sh.x + sh.w, 64, `${landW} m`, dimBlue)}
        ${drawSlashDimensionV(58, sh.y, sh.y + sh.h, `${landD} m`, dimBlue)}
        <rect x="${sh.x}" y="${sh.y}" width="${sh.w}" height="${sh.h}" fill="${cyanMode ? 'rgba(16,185,129,0.12)' : '#F0FDF4'}" stroke="#15803D" stroke-width="2.6"/>
        <rect x="${sh.x + 42}" y="${sh.y + 36}" width="${sh.w - 84}" height="${sh.h - 72}" fill="none" stroke="#B45309" stroke-width="1.5" stroke-dasharray="7 5"/>
        <path d="M${sh.x + 20},${sh.y + 120} Q${sh.x + 280},${sh.y + 70} ${sh.x + sh.w - 20},${sh.y + 150}" fill="none" stroke="rgba(21,128,61,0.35)" stroke-width="1.1"/>
        <path d="M${sh.x + 20},${sh.y + 230} Q${sh.x + 300},${sh.y + 190} ${sh.x + sh.w - 20},${sh.y + 260}" fill="none" stroke="rgba(21,128,61,0.35)" stroke-width="1.1"/>
        <text x="${sh.x + sh.w / 2}" y="${sh.y + sh.h / 2 - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" font-weight="800" fill="#15803D">YOU CAN BUILD ON THIS PART OF THE PLOT (UP TO 60%)</text>
        <text x="${sh.x + sh.w / 2}" y="${sh.y + sh.h / 2 + 14}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="11" fill="${inkSub}">Plot area: ${customAreaM2 || 500} m² · Leave 4.0 m clear at the front, 3.0 m at the sides</text>
        <rect x="${plan.terrace.x}" y="${plan.terrace.y}" width="${plan.terrace.w}" height="${plan.terrace.h}" fill="${cardBg}" stroke="${inkMain}" stroke-width="1.4"/>
        <text x="${plan.terrace.x + plan.terrace.w / 2}" y="${plan.terrace.y + 26}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700" fill="${inkMain}">Street in front — water, power and fibre</text>
        <rect x="736" y="14" width="170" height="472" fill="${cardBg}" stroke="${inkMain}" stroke-width="1.6"/>
        <text x="821" y="42" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="${inkMain}">PLAN C-101</text>
        <text x="821" y="60" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="${inkSub}">Land survey</text>
        <text x="821" y="78" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="${inkSub}">Plot, no building</text>
        <text x="821" y="96" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="${inkSub}">View: ${viewLabel}</text>
        <text x="821" y="112" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="${inkSub}">${timeLabel}</text>
        <text x="821" y="140" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="${inkSub}">${landW} m wide × ${landD} m deep</text>
      </svg>
    `;
  }

  const furnishableSet = new Set(['living', 'kitchen', 'bedroom', 'bathroom', 'kids', 'office']);
  // The room list total is ALWAYS the sum of this floor's listed rooms — never
  // the deed area. The deed area (when one is passed) is shown separately.
  const schedRows = plan.rooms.filter(r => r.m2 > 0);
  const totalPlanM2 = Math.round(schedRows.reduce((s, r) => s + (r.m2 || 0), 0) * 10) / 10;
  const showDeed = customAreaM2 && Number(customAreaM2) !== totalPlanM2;

  // Full-width room list below the drawing (same sheet, same styling).
  const schedTop = 544;
  const titleY = schedTop + 26;
  const deedY = showDeed ? titleY + 20 : null;
  const rowStartY = (deedY ? deedY + 22 : titleY + 22);
  const rowH = 24;
  const lastRowY = rowStartY + (schedRows.length - 1) * rowH;
  const footY = lastRowY + 32;
  const viewBoxH = footY + 22;

  return `
    <svg viewBox="0 0 920 ${viewBoxH}" width="100%" role="img" aria-label="${escAttr(plan.title)}" style="background:${paperBg};border:1.5px solid ${inkMain};border-radius:10px;display:block">
      <defs>
        <pattern id="a101FineGrid_${patKey}" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="${gridCol}" stroke-width="0.7"/>
        </pattern>
        <pattern id="a101Wood_${patKey}" width="18" height="6" patternUnits="userSpaceOnUse">
          <rect width="18" height="6" fill="${cyanMode ? '#0E2D54' : '#FDF9F1'}"/>
          <line x1="0" y1="6" x2="18" y2="6" stroke="${cyanMode ? 'rgba(125,211,252,0.16)' : '#EADEC9'}" stroke-width="0.75"/>
        </pattern>
        <pattern id="a101Tile_${patKey}" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="${cyanMode ? '#0C284B' : '#F8FAFC'}"/>
          <path d="M 12 0 L 0 0 0 12" fill="none" stroke="${cyanMode ? 'rgba(125,211,252,0.20)' : '#E2E8F0'}" stroke-width="0.8"/>
        </pattern>
        <pattern id="a101Marble_${patKey}" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill="${cyanMode ? '#10325E' : '#FFFDF9'}"/>
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="${cyanMode ? 'rgba(186,230,253,0.16)' : '#EDE6D8'}" stroke-width="0.75"/>
        </pattern>
        <pattern id="a101WallHatch_${patKey}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="${wallFill}"/>
          <line x1="0" y1="0" x2="0" y2="6" stroke="${cyanMode ? '#93C5FD' : '#A8A29E'}" stroke-width="1.1"/>
        </pattern>
      </defs>

      <!-- Fine Architectural Drafting Grid & Outer Sheet Border -->
      <rect width="920" height="${viewBoxH}" fill="url(#a101FineGrid_${patKey})"/>
      <rect width="920" height="${viewBoxH}" fill="${solarTint}"/>
      <rect x="12" y="12" width="714" height="512" fill="none" stroke="${inkMain}" stroke-width="1.6"/>
      <rect x="16" y="16" width="706" height="504" fill="none" stroke="${inkMain}" stroke-width="0.6"/>

      <!-- Which floor, which view, what time — plain words at the top of the sheet -->
      <text x="28" y="36" font-family="DM Sans, sans-serif" font-size="10.5" font-weight="800" fill="${inkMain}">${escAttr(floorLabel)} · View: ${viewLabel} · ${timeLabel}</text>

      <!-- Outdoor Terrace / Balcony / Pool Zone — part of the plan, sharing its wall -->
      ${plan.terrace ? `
        <g>
          <rect x="${plan.terrace.x}" y="${plan.terrace.y}" width="${plan.terrace.w}" height="${plan.terrace.h}" fill="url(#a101Tile_${patKey})" stroke="${inkMain}" stroke-width="3.2"/>
          ${plan.terrace.hasPool ? `
            <rect x="${plan.terrace.x + plan.terrace.w - 178}" y="${plan.terrace.y + 8}" width="160" height="${plan.terrace.h - 16}" rx="4" fill="${cyanMode ? '#0284C7' : '#BAE6FD'}" stroke="#0369A1" stroke-width="1.4"/>
            <line x1="${plan.terrace.x + plan.terrace.w - 170}" y1="${plan.terrace.y + plan.terrace.h / 2}" x2="${plan.terrace.x + plan.terrace.w - 26}" y2="${plan.terrace.y + plan.terrace.h / 2}" stroke="#0284C7" stroke-width="0.9" stroke-dasharray="6 4"/>
            <text x="${plan.terrace.x + plan.terrace.w - 98}" y="${plan.terrace.y + plan.terrace.h / 2 + 3}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="7.5" font-weight="800" fill="#0C4A6E">Pool</text>
          ` : ''}
          <text x="${plan.terrace.x + 14}" y="${plan.terrace.y + 18}" font-family="JetBrains Mono, monospace" font-size="8" font-weight="700" fill="${inkSub}">${escAttr(terracePlainLabel(plan))}</text>
        </g>
      ` : ''}

      <!-- Interior Rooms, Flooring, Scale Furniture & Room Tags -->
      ${plan.rooms.map(rm => {
        const isFurn = isRoomFurnished(furnishedRooms, rm);
        const canClick = false;
        const tagLines = roomTagLines(rm);
        const tagBottom = roomTagBottom(rm);
        const fillPat = rm.flr === 'wood' ? `url(#a101Wood_${patKey})`
          : rm.flr === 'tile' ? `url(#a101Tile_${patKey})`
          : rm.flr === 'void' ? (cyanMode ? '#081C36' : '#F1ECE1')
          : `url(#a101Marble_${patKey})`;
        // Bolder furniture: every fixture stroke drawn half a point thicker.
        const fixturesHtml = drawScaleCadFixtures(rm, isFurn, cyanMode)
          .replace(/stroke-width="([\d.]+)"/g, (m, v) => `stroke-width="${Math.min(2.6, parseFloat(v) + 0.5).toFixed(2)}"`);
        const fxTransform = fixtureScaleTransform(rm, tagBottom);
        const roomAttrs = canClick
          ? `data-action="furnish-room" data-pid="${escAttr(clickablePropId)}" data-room="${escAttr(rm.no)}" data-q="luxury" style="cursor:pointer"`
          : `data-action="room-info" data-room="${escAttr(rm.key)}" data-no="${escAttr(rm.no)}" data-name="${escAttr(planRoomName(rm))}" data-m2="${rm.m2 || 0}" data-floor="${escAttr(floorLabel)}" style="cursor:pointer"`;

        return `
          <g ${roomAttrs}>
            <rect x="${rm.x}" y="${rm.y}" width="${rm.w}" height="${rm.h}" fill="${fillPat}" stroke="${inkMain}" stroke-width="3.2"/>
            ${fixturesHtml ? `<g ${fxTransform ? `transform="${fxTransform}"` : ''}>${fixturesHtml}</g>` : ''}

            <!-- Room Tag: number box + name (wrapped to fit the room) + size -->
            <g transform="translate(${rm.x + 8}, ${rm.y + 8})">
              <rect x="0" y="0" width="24" height="12" fill="${isFurn ? '#15803D' : inkMain}"/>
              <text x="12" y="8.8" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" font-weight="800" fill="#FFFFFF">${rm.no}</text>
              ${tagLines.map((ln, li) => `<text x="${li === 0 ? 28 : 0}" y="${9 + li * 12}" font-family="DM Sans, sans-serif" font-size="9.5" font-weight="800" fill="${inkMain}">${escAttr(ln)}</text>`).join('')}
              ${rm.m2 > 0 ? `<text x="0" y="${9 + tagLines.length * 12}" font-family="JetBrains Mono, monospace" font-size="8.5" fill="${isFurn ? (cyanMode ? '#86EFAC' : '#15803D') : inkSub}">${rm.m2} m² · ${isFurn ? '✓ FURNISHED' : (rm.flr || 'marble').toUpperCase()}</text>` : ''}
            </g>

            ${showMep && rm.m2 >= 14 ? `
              <!-- MEP Overlay: Split AC unit below the tag line, so it never covers a room name -->
              <g>
                <rect x="${rm.x + rm.w - 46}" y="${rm.y + tagBottom + 4}" width="38" height="8" fill="#0284C7" opacity="0.88"/>
                <text x="${rm.x + rm.w - 27}" y="${rm.y + tagBottom + 10.2}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="5.8" font-weight="700" fill="#FFFFFF">AC SPLIT</text>
                <circle cx="${rm.x + rm.w / 2}" cy="${rm.y + rm.h / 2}" r="4.5" fill="none" stroke="#D97706" stroke-width="1.1"/>
                <line x1="${rm.x + rm.w / 2 - 6}" y1="${rm.y + rm.h / 2}" x2="${rm.x + rm.w / 2 + 6}" y2="${rm.y + rm.h / 2}" stroke="#D97706" stroke-width="0.9"/>
                <line x1="${rm.x + rm.w / 2}" y1="${rm.y + rm.h / 2 - 6}" x2="${rm.x + rm.w / 2}" y2="${rm.y + rm.h / 2 + 6}" stroke="#D97706" stroke-width="0.9"/>
                <path d="M${rm.x + rm.w / 2},${rm.y + rm.h / 2} Q${rm.x + 20},${rm.y + rm.h - 10} ${rm.x + 12},${rm.y + rm.h - 12}" fill="none" stroke="#D97706" stroke-width="0.85" stroke-dasharray="3 2"/>
              </g>
            ` : ''}
          </g>
        `;
      }).join('')}

      <!-- Vertical Circulation Core: Staircase & Elevator -->
      ${plan.core ? `
        <g>
          <rect x="${plan.core.x}" y="${plan.core.y}" width="${plan.core.w}" height="${plan.core.h}" fill="${cardBg}" stroke="${inkMain}" stroke-width="3.2"/>
          ${Array.from({ length: 8 }, (_, ti) => {
            const tx = plan.core.x + 8 + ti * ((plan.core.w * 0.58) / 8);
            return `<line x1="${tx}" y1="${plan.core.y + 6}" x2="${tx}" y2="${plan.core.y + plan.core.h * 0.56}" stroke="${inkSub}" stroke-width="1.1"/>`;
          }).join('')}
          ${plan.core.w >= 84 ? `
            <rect x="${plan.core.x + plan.core.w - 30}" y="${plan.core.y + 6}" width="24" height="26" fill="none" stroke="${inkMain}" stroke-width="1.3"/>
            <line x1="${plan.core.x + plan.core.w - 30}" y1="${plan.core.y + 6}" x2="${plan.core.x + plan.core.w - 6}" y2="${plan.core.y + 32}" stroke="${inkSub}" stroke-width="0.8"/>
            <line x1="${plan.core.x + plan.core.w - 6}" y1="${plan.core.y + 6}" x2="${plan.core.x + plan.core.w - 30}" y2="${plan.core.y + 32}" stroke="${inkSub}" stroke-width="0.8"/>
          ` : ''}
          <text x="${plan.core.x + plan.core.w / 2}" y="${plan.core.y + plan.core.h - 8}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="7.2" font-weight="800" fill="${dimBlue}">${escAttr(plan.core.label)}</text>
        </g>
      ` : ''}

      <!-- Heavy Hatched Exterior Envelope + Double-Line Glazed Windows -->
      <rect x="${sh.x}" y="${sh.y}" width="${sh.w}" height="${sh.h}" fill="none" stroke="url(#a101WallHatch_${patKey})" stroke-width="7.5"/>
      <rect x="${sh.x - 3.7}" y="${sh.y - 3.7}" width="${sh.w + 7.4}" height="${sh.h + 7.4}" fill="none" stroke="${inkMain}" stroke-width="1.4"/>
      <rect x="${sh.x + 3.7}" y="${sh.y + 3.7}" width="${sh.w - 7.4}" height="${sh.h - 7.4}" fill="none" stroke="${inkMain}" stroke-width="1.2"/>

      <!-- Opening from the plan into the terrace below (a gap in the shared wall) -->
      ${(() => {
        if (!plan.terrace || plan.terrace.y !== sh.y + sh.h) return '';
        const bottomDoor = plan.rooms.find(r => r.door && r.door[1] === sh.y + sh.h);
        if (!bottomDoor) return '';
        return `<rect x="${bottomDoor.door[0] - 22}" y="${sh.y + sh.h - 4.5}" width="44" height="9" fill="${paperBg}"/>`;
      })()}

      <!-- Window Cuts Along the North & South Exterior Walls -->
      ${[sh.x + 48, sh.x + sh.w * 0.44, sh.x + sh.w - 108].map((wx, wi) => `
        <g>
          <rect x="${wx}" y="${sh.y - 3.8}" width="54" height="7.6" fill="${paperBg}" stroke="${inkMain}" stroke-width="1.1"/>
          <line x1="${wx}" y1="${sh.y - 1.2}" x2="${wx + 54}" y2="${sh.y - 1.2}" stroke="#0284C7" stroke-width="1.1"/>
          <line x1="${wx}" y1="${sh.y + 1.2}" x2="${wx + 54}" y2="${sh.y + 1.2}" stroke="#0284C7" stroke-width="1.1"/>
          <polygon points="${wx + 27},${sh.y - 14} ${wx + 35},${sh.y - 9} ${wx + 27},${sh.y - 4} ${wx + 19},${sh.y - 9}" fill="${paperBg}" stroke="${dimBlue}" stroke-width="0.8"/>
          <text x="${wx + 27}" y="${sh.y - 7}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="5.8" font-weight="700" fill="${dimBlue}">W${wi + 1}</text>
        </g>
      `).join('')}

      <!-- Hinged & Sliding Door Symbols (Rendered On Top of Partition Walls) -->
      ${plan.rooms.map(rm => drawArchDoorSymbol(rm.door, paperBg, dimBlue)).join('')}

      <!-- Inside view: the cut line itself, drawn bold across the plan -->
      ${viewMode === 'cutaway' ? `
        <line x1="${sh.x}" y1="${sh.y + Math.round(sh.h * 0.45)}" x2="${sh.x + sh.w}" y2="${sh.y + Math.round(sh.h * 0.45)}" stroke="#C84B31" stroke-width="2.5" stroke-dasharray="12 5"/>
        <text x="${sh.x + 10}" y="${sh.y + Math.round(sh.h * 0.45) - 6}" font-family="DM Sans, sans-serif" font-size="9" font-weight="800" fill="#C84B31" stroke="${paperBg}" stroke-width="3" paint-order="stroke">Cut line — 1.2 m above the floor</text>
      ` : ''}

      <!-- Exploded floors: a ghost outline of the plan, shifted down and right -->
      ${viewMode === 'exploded' ? `
        <rect x="${sh.x + 14}" y="${sh.y + 14}" width="${sh.w}" height="${sh.h}" fill="none" stroke="${dimBlue}" stroke-width="1.2" stroke-dasharray="6 4"/>
      ` : ''}

      <!-- One plain overall size line, in metres (width × depth) -->
      <text x="${sh.x + sh.w / 2}" y="496" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700" fill="${inkSub}">${sizeLine}</text>

      <!-- Bottom Section Marker, in plain words -->
      <g transform="translate(${sh.x + 14}, 505)">
        <circle cx="0" cy="0" r="7" fill="${inkMain}"/>
        <polygon points="-7,0 0,-12 7,0" fill="${inkMain}"/>
        <text x="0" y="2.5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="7" font-weight="800" fill="${paperBg}">A</text>
        <text x="14" y="3" font-family="JetBrains Mono, monospace" font-size="8" font-weight="700" fill="${inkSub}">${isRoof ? 'Roof plan · No cut through the rooms · Diagram only' : 'Cut at 1.2 m above the floor · Diagram only'}</text>
      </g>

      <!-- Slim side block: plan name, floor, scale, view — no room list here any more -->
      <g transform="translate(734, 12)">
        <rect x="0" y="0" width="174" height="512" fill="${cardBg}" stroke="${inkMain}" stroke-width="1.6"/>

        <!-- North Compass Rose -->
        <g transform="translate(87, 38)">
          <circle cx="0" cy="0" r="18" fill="none" stroke="${inkMain}" stroke-width="1.1"/>
          <polygon points="0,-17 4.5,0 0,-3" fill="${inkMain}"/>
          <polygon points="0,-17 -4.5,0 0,-3" fill="none" stroke="${inkMain}" stroke-width="0.9"/>
          <line x1="-18" y1="0" x2="18" y2="0" stroke="${inkMain}" stroke-width="0.7"/>
          <line x1="0" y1="0" x2="0" y2="18" stroke="${inkMain}" stroke-width="0.7"/>
          <text x="0" y="-21" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" font-weight="800" fill="${inkMain}">N</text>
        </g>

        <line x1="0" y1="68" x2="174" y2="68" stroke="${inkMain}" stroke-width="1"/>
        <text x="87" y="86" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="10.5" font-weight="800" fill="${inkMain}">${escAttr(shape.replace(/_/g, ' ').toUpperCase())}</text>
        <text x="87" y="102" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="${inkSub}">Finish: ${escAttr(finishLabel)}</text>
        <text x="87" y="118" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" font-weight="700" fill="${inkMain}">${escAttr(floorLabel)}</text>

        <line x1="0" y1="130" x2="174" y2="130" stroke="${inkMain}" stroke-width="1"/>
        <text x="87" y="150" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8.5" font-weight="700" fill="${dimBlue}">Diagram only</text>
        <text x="12" y="172" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${inkSub}">Plan</text>
        <text x="12" y="198" font-family="JetBrains Mono, monospace" font-size="22" font-weight="800" fill="${inkMain}">${escAttr(plan.code)}</text>

        <line x1="0" y1="214" x2="174" y2="214" stroke="${inkMain}" stroke-width="1"/>
        <text x="12" y="232" font-family="DM Sans, sans-serif" font-size="8.5" font-weight="700" fill="${inkMain}">View: ${viewLabel}</text>
        <text x="12" y="248" font-family="DM Sans, sans-serif" font-size="8.5" fill="${inkSub}">${timeLabel}</text>

        <line x1="0" y1="264" x2="174" y2="264" stroke="${inkMain}" stroke-width="1"/>
        <text x="12" y="282" font-family="DM Sans, sans-serif" font-size="8.5" fill="${inkSub}">Thick dark edge = outside wall</text>
        <text x="12" y="298" font-family="DM Sans, sans-serif" font-size="8.5" fill="${inkSub}">Green tick = furnished room</text>
        ${clickablePropId ? `<text x="12" y="322" font-family="DM Sans, sans-serif" font-size="8.5" font-weight="700" fill="#15803D">Tap a room for details</text>` : ''}

        <text x="12" y="492" font-family="DM Sans, sans-serif" font-size="8.5" fill="${inkSub}">Layout diagram —</text>
        <text x="12" y="506" font-family="DM Sans, sans-serif" font-size="8.5" fill="${inkSub}">not to scale.</text>
      </g>

      <!-- Full-width room list, below the drawing -->
      <rect x="12" y="${schedTop}" width="896" height="${viewBoxH - schedTop - 12}" fill="${cardBg}" stroke="${inkMain}" stroke-width="1.6"/>
      <text x="28" y="${titleY}" font-family="DM Sans, sans-serif" font-size="11" font-weight="800" fill="${inkMain}">Room list — ${escAttr(floorLabel)} · ${totalPlanM2} m² in total</text>
      ${showDeed ? `<text x="28" y="${deedY}" font-family="DM Sans, sans-serif" font-size="8.5" fill="${inkSub}">Deed area: ${customAreaM2} m² — the whole property, not just this floor.</text>` : ''}
      ${schedRows.map((r, ri) => {
        const ry = rowStartY + ri * rowH;
        const furn = isRoomFurnished(furnishedRooms, r);
        return `
          <text x="28" y="${ry}" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700" fill="${furn ? (cyanMode ? '#86EFAC' : '#15803D') : inkMain}">${r.no}</text>
          <text x="76" y="${ry}" font-family="DM Sans, sans-serif" font-size="10" font-weight="700" fill="${furn ? (cyanMode ? '#86EFAC' : '#15803D') : inkMain}">${escAttr(r.name)}${furn ? '  ✓ Furnished' : ''}</text>
          <text x="892" y="${ry}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9.5" fill="${inkSub}">${r.m2} m²</text>
          <line x1="28" y1="${ry + 7}" x2="892" y2="${ry + 7}" stroke="${gridCol}" stroke-width="0.8"/>
        `;
      }).join('')}
      <text x="28" y="${footY}" font-family="DM Sans, sans-serif" font-size="8.5" fill="${inkSub}">Drawings are layout diagrams, not to scale. Room sizes are simulated allocations of the property area.</text>
    </svg>
  `;
}

// Phone-first plan: geometry and room identity stay together; detailed CAD is optional.
export function renderReadableFloorplanHtml(shape = 'apartment', furnishedRooms = {}, floorIdx = 0, propertyId = null, country = '', areaM2 = null, totalRooms = null, outdoorFeatures = {}) {
  const floors = propertyFloorPlans(shape, country, areaM2, totalRooms, furnishedRooms);
  const idx = Math.min(floors.length - 1, Math.max(0, Number(floorIdx) || 0));
  const plan = floors[idx];
  if (shape === 'land') return renderArchitecturalFloorplanSvg(shape);
  const sh = plan.shell;
  const attrs = rm => `data-action="room-info" data-room="${escAttr(rm.key)}" data-no="${escAttr(rm.no)}" data-name="${escAttr(planRoomName(rm))}" data-m2="${rm.m2 || 0}" data-floor="${escAttr(plainFloorLabel(idx, shape))}"`;
  return `<section class="readable-floor" style="border:1px solid #c9c2b5;border-radius:12px;padding:12px;background:#faf5e9;color:#3c3228;min-width:0">
    <h4 style="margin:0 0 4px">${escAttr(plainFloorLabel(idx, shape))}</h4>${idx === 0 ? `<p style="font-size:0.78rem;line-height:1.5;margin:4px 0 8px">${escAttr(outdoorFeatures.styleNote || homeStyleNote(country, shape))}</p>` : ''}
    <p style="font-size:0.78rem;margin:0 0 12px;color:#625b50">Room numbers match the list below. Fictional layout, not to scale.</p>
    ${illustratedPlanSvg(plan, idx, outdoorFeatures, attrs)}
    <p style="font-size:0.74rem;line-height:1.5;color:#89765c">Illustrative furnished layout. Furniture is a preview, not an installed purchase.${idx===0&&(outdoorFeatures.hasPool||outdoorFeatures.hasGarden)?' Outdoor features are on the same plot; outdoor area is not included in the indoor room total.':''}</p>
    <div style="margin-top:10px;display:grid;gap:6px">
      ${plan.rooms.map(rm => `<button type="button" ${attrs(rm)} style="display:flex;align-items:center;gap:10px;text-align:left;width:100%;min-height:48px;padding:10px;border:1px solid #d8d1c5;border-radius:8px;background:#fffdf8;color:#292524;white-space:normal">
        <span style="font-weight:800;color:#a6442f">${escAttr(rm.no)}</span>
        <span style="flex:1;font-size:0.82rem;line-height:1.35;text-transform:capitalize">${escAttr(planRoomName(rm).toLowerCase())}</span>
        <span style="font-size:0.78rem;white-space:nowrap">${rm.m2} m²${isRoomFurnished(furnishedRooms, rm) ? ' ✓' : ''}</span>
      </button>`).join('')}
    </div>
    <p style="font-size:0.74rem;margin:10px 0 0;color:#625b50">${Math.round(plan.rooms.reduce((sum, r) => sum + (r.m2 || 0), 0) * 10) / 10} m² across listed rooms. Use the furnishing controls below to furnish a room.</p>
  </section>`;
}

export function renderAllPropertyFloorsHtml(
  shape = 'apartment',
  finish = 'standard',
  furnishedRooms = {},
  customAreaM2 = null,
  clickablePropId = null,
  cadOptions = {}
) {
  const floors = propertyFloorPlans(shape, cadOptions.country, customAreaM2, cadOptions.totalRooms, furnishedRooms);
  if (floors.length <= 1) {
    return renderArchitecturalFloorplanSvg(shape, finish, furnishedRooms, customAreaM2, 0, clickablePropId, cadOptions);
  }
  // Each floor's room list total is that floor's own room sum — never an
  // equal split of the deed area (the deed area is shown separately per sheet).
  const levelLabels = ['Ground floor (Plan A-101)', 'First floor (Plan A-102)', 'Roof (Plan A-103)'];

  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(430px, 100%), 1fr));gap:12px">
      ${floors.map((fl, fIdx) => `
        <div style="display:flex;flex-direction:column;gap:4px">
          <div class="mono" style="font-size:0.72rem;font-weight:800;color:#524C43;display:flex;justify-content:space-between;padding:0 2px">
            <span>${plainFloorLabel(fIdx, shape)}</span>
            <span>${fIdx + 1} of ${floors.length}</span>
          </div>
          ${renderArchitecturalFloorplanSvg(shape, finish, furnishedRooms, customAreaM2, fIdx, clickablePropId, cadOptions)}
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================================================
   3. ARCHITECTURAL WORKSTATION: 3D DIORAMA + MULTI-FLOOR SHEET SET WIDGET
   ========================================================================== */
export function renderHome3dAndFloorplanHtml(home, opts = {}) {
  const shape = home?.shape || 'apartment';
  const finish = home?.finishing || 'standard';
  const furnishedRooms = home?.furnishedRooms || {};
  const upgrades = home?.upgrades || [];
  const buildPct = home?.buildProgressPct ?? 100;
  const conditionPct = Math.round(home?.conditionPct ?? 100);

  const viewMode = opts.viewMode || (opts.cutaway ? 'cutaway' : 'elevation');
  const timeOfDay = opts.timeOfDay || (opts.nightMode ? 'night' : 'noon');
  const floors = propertyFloorPlans(shape, opts.country || home?.country, home?.areaM2, home?.rooms, furnishedRooms);
  const isMultiFloor = floors.length > 1;
  // Default to -1 ('ALL LEVELS') on multi-story homes so Villa/Duplex/Townhouse ALWAYS display all floors consistently!
  const cadFloor = opts.cadFloor === undefined || opts.cadFloor === null ? -1 : Number(opts.cadFloor);
  const cyanotype = !!opts.cyanotype;
  const showMep = !!opts.showMep;

  const {hasPool,hasGarden} = propertyOutdoorFeatures(home);
  const hasSolar = upgrades.includes('solar');

  const variantSeed = opts.variantSeed || home?.id || home?.name || 0;
  const country = opts.country || home?.country || 'egy';

  const specJson = escAttr(JSON.stringify({
    shape,
    finishing: finish,
    facadeStyle: home?.facadeStyle || null,
    hasExtension: !!home?.hasExtension,
    furnishedRooms,
    buildPct,
    viewMode,
    timeOfDay,
    hasPool,
    hasGarden,
    hasSolar,
    variantSeed,
    country,
    parkedCarColor: opts.parkedCarColor || null
  }));

  // Furnished rooms: count the real rooms of THIS home's own plans.
  const furnishableKeys = ['living', 'kitchen', 'bedroom', 'bathroom', 'kids', 'office'];
  const allHomeRooms = floors.flatMap(f => f.rooms).filter(r => furnishableKeys.includes(r.key));
  const furnishedCount = allHomeRooms.filter(r => isRoomFurnished(furnishedRooms, r)).length;
  const totalFurnishable = allHomeRooms.length;
  const style = propertyStyle(home?.styleId || home?.unitId);
  const shapeName = (style?.name || shape).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return `
    <div class="vis3d-home-wrap">
      <!-- One plain "change view" control (v2.7 item 5): the picture itself
         is the home. How you look at it — from outside or inside, morning
         or night, which floor, drawing style — lives behind this single
         control, in plain words. No technical toolbar on the main view. -->
      <p class="muted" style="font-size:0.82rem;margin:0 0 6px">This is your home as it looks today. The rooms and their sizes are listed below the picture.</p>
      <details style="margin-bottom:8px">
        <summary class="btn btn-sm" style="display:inline-block;cursor:pointer">Change how you see your home</summary>
        <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:8px">
          <div>
            <div class="muted" style="font-size:0.74rem;margin-bottom:4px">See it</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <button type="button" class="btn btn-sm ${viewMode === 'elevation' ? 'btn-navy' : ''}" data-action="set-arch-view" data-mode="elevation">From outside</button>
              <button type="button" class="btn btn-sm ${viewMode === 'cutaway' ? 'btn-navy' : ''}" data-action="set-arch-view" data-mode="cutaway">Inside, with the roof off</button>
              <button type="button" class="btn btn-sm ${viewMode === 'exploded' ? 'btn-navy' : ''}" data-action="set-arch-view" data-mode="exploded">Floors pulled apart</button>
            </div>
          </div>
          <div>
            <div class="muted" style="font-size:0.74rem;margin-bottom:4px">Light</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <button type="button" class="btn btn-sm ${timeOfDay === 'dawn' ? 'btn-navy' : ''}" data-action="set-solar-time" data-tod="dawn">Morning</button>
              <button type="button" class="btn btn-sm ${timeOfDay === 'noon' ? 'btn-navy' : ''}" data-action="set-solar-time" data-tod="noon">Midday</button>
              <button type="button" class="btn btn-sm ${timeOfDay === 'sunset' ? 'btn-navy' : ''}" data-action="set-solar-time" data-tod="sunset">Evening</button>
              <button type="button" class="btn btn-sm ${timeOfDay === 'night' ? 'btn-navy' : ''}" data-action="set-solar-time" data-tod="night">Night</button>
            </div>
          </div>
          ${isMultiFloor ? `
          <div>
            <div class="muted" style="font-size:0.74rem;margin-bottom:4px">Floors</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <button type="button" class="btn btn-sm ${cadFloor === -1 ? 'btn-navy' : ''}" data-action="set-cad-floor" data-fl="-1">All ${floors.length} floors</button>
              ${floors.map((fl, fi) => `
                <button type="button" class="btn btn-sm ${cadFloor === fi ? 'btn-navy' : ''}" data-action="set-cad-floor" data-fl="${fi}">${plainFloorLabel(fi, shape)}</button>
              `).join('')}
            </div>
          </div>
          ` : ''}
          <div>
            <div class="muted" style="font-size:0.74rem;margin-bottom:4px">Drawing style</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <button type="button" class="btn btn-sm ${cyanotype ? 'btn-navy' : ''}" data-action="toggle-cad-cyan">${cyanotype ? 'Blueprint style: on' : 'Blueprint style'}</button>
              <button type="button" class="btn btn-sm ${showMep ? 'btn-navy' : ''}" data-action="toggle-cad-mep">${showMep ? 'Wiring & air conditioning: shown' : 'Show wiring & air conditioning'}</button>
            </div>
          </div>
        </div>
      </details>

      ${style ? `<div style="padding:8px;background:#f6efdf;border-radius:12px;margin-bottom:12px"><img src="assets/homes/${style.art}" alt="${escAttr(style.name)} fictional exterior illustration" style="width:100%;max-height:330px;object-fit:contain"><p class="muted" style="font-size:.8rem;margin:4px">${escAttr(style.name)} · Illustrative exterior, not a photograph or exact address.</p></div>` : `<div class="vis3d-stage">
        <canvas
          data-canvas3d="home"
          data-spec="${specJson}"
          width="680"
          height="284"
          style="width:100%;height:284px;border-radius:10px;border:1.5px solid rgba(28,25,23,0.22);display:block"
          aria-label="A picture of your home"
        ></canvas>
      </div>`}

      <!-- Floor plan heading: what it is, in plain words. The view, light,
           floor and style choices live in the single control above. -->
      <div class="arch-toolbar" style="margin-top:4px">
        <div style="display:flex;align-items:center;gap:10px">
          ${renderHomeTypeArt(shape, country, 92, home?.styleId || home?.unitId)}
          <div>
            <strong style="font-size:0.86rem;letter-spacing:0.01em">${shape === 'land' ? 'Your Land — Plot Plan' : `Your ${shapeName} — Floor Plan`}</strong>
            <div class="muted" style="font-size:0.75rem">
              ${shape === 'land' ? 'Land · Plot, no building' : `${shapeName} · ${floors.length} floor${floors.length > 1 ? 's' : ''}`} · Finish: <strong>${finish.replace(/_/g, ' ')}</strong> · Condition: <strong class="${conditionPct < 70 ? 'text-bad' : 'text-good'}">${conditionPct}%</strong> · Furnished rooms: <strong>${furnishedCount} of ${totalFurnishable}</strong>${home?.areaM2 ? ` · Deed area: ${home.areaM2} m²` : ''}
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:12px">
        ${(isMultiFloor && cadFloor === -1 ? floors.map((_, i) => i) : [Math.max(0, cadFloor)]).map(i => renderReadableFloorplanHtml(shape, furnishedRooms, i, home?.id, country, home?.areaM2, home?.rooms, {hasPool,hasGarden,styleNote:style?.note,placement:home?.outdoorPlacement || style?.outdoorPlacement || (['townhouse','twin_house'].includes(shape)?'front':'rear')})).join('')}
      </div>

      <details style="margin-top:12px"><summary style="cursor:pointer;font-size:0.82rem">Detailed architectural sheets</summary>
        <div style="margin-top:10px">${(isMultiFloor && cadFloor === -1)
          ? renderAllPropertyFloorsHtml(shape, finish, furnishedRooms, home?.areaM2 || null, home?.id || null, { cyanotype, showMep, viewMode, timeOfDay, country, totalRooms: home?.rooms, hasPool })
          : renderArchitecturalFloorplanSvg(shape, finish, furnishedRooms, home?.areaM2 || null, Math.max(0, cadFloor), home?.id || null, { cyanotype, showMep, viewMode, timeOfDay, country, totalRooms: home?.rooms, hasPool })}</div>
      </details>
    </div>
  `;
}

/* 4. STUDIO AUTOMOTIVE WIND-TUNNEL SHOWCASE + GARAGE BADGE */
export function renderCar3dTurntableHtml(car, paintHex = '#1D3557', aeroMode = true) {
  const specJson = escAttr(JSON.stringify({
    body: car?.body || 'sedan',
    carClass: car?.class || 'compact',
    hp: car?.hp || 180,
    modelSeed: car?.id || car?.model || 'car',
    paintHex,
    aeroMode
  }));
  return `
    <div style="display:flex;flex-direction:column;gap:6px">
      <canvas
        data-canvas3d="car"
        data-spec="${specJson}"
        width="340"
        height="168"
        style="width:340px;max-width:100%;height:168px;border-radius:10px;border:1.5px solid rgba(28,25,23,0.2);display:block"
        aria-label="Automotive Engineering &amp; Wind-Tunnel Profile"
      ></canvas>
    </div>
  `;
}

export function renderCarShowroomSvg(car, paintHex = '#1D3557', width = 200) {
  const body = String(car?.body || 'sedan').toLowerCase();
  const h = hashShapeSeed(car?.id || car?.model || car?.brandName || 0);
  const ink = '#18181B';
  const isSport = body === 'coupe' || car?.class === 'hyper' || car?.class === 'sport';
  const bodyPath = body === 'suv'
    ? (h % 2 === 0
      ? 'M18,62 L24,42 L48,24 L132,24 L152,43 L178,46 L182,64 L18,64 Z'
      : 'M16,62 L20,40 L44,23 L138,23 L156,42 L180,45 L184,64 L16,64 Z')
    : body === 'pickup' || body === 'truck'
    ? 'M16,64 L18,45 L58,45 L68,25 L118,25 L132,43 L182,46 L184,64 Z'
    : isSport
    ? (h % 2 === 0
      ? 'M16,64 L28,46 L68,30 L122,30 L176,47 L184,64 Z'
      : 'M14,64 L32,44 L74,29 L126,31 L178,46 L186,64 Z')
    : (h % 2 === 0
      ? 'M16,64 L22,45 L56,28 L124,28 L152,44 L182,47 L184,64 Z'
      : 'M17,64 L24,44 L52,27 L128,27 L154,43 L181,46 L183,64 Z');
  const glassPath = body === 'suv'
    ? 'M52,28 L128,28 L144,43 L42,43 Z'
    : body === 'pickup' || body === 'truck'
    ? 'M72,29 L114,29 L126,43 L66,43 Z'
    : 'M59,32 L121,32 L145,44 L46,44 Z';

  const roofAddon = body === 'suv' && h % 2 === 1
    ? `<rect x="58" y="20.5" width="64" height="2.6" rx="1" fill="#334155" stroke="${ink}" stroke-width="1"/>`
    : isSport && h % 2 === 0
    ? `<polygon points="18,46 12,39 24,40 24,46" fill="${paintHex}" stroke="${ink}" stroke-width="1.3"/>`
    : '';
  const spokeCount = isSport ? 5 : (h % 2 === 0 ? 6 : 8);
  const renderWheel = cx => `
    <circle cx="${cx}" cy="64" r="12.5" fill="#1F2937" stroke="${ink}" stroke-width="1.8"/>
    <circle cx="${cx}" cy="64" r="6.8" fill="#CBD5E1" stroke="${ink}" stroke-width="1"/>
    ${Array.from({ length: spokeCount }, (_, si) => {
      const ang = (si / spokeCount) * Math.PI * 2;
      return `<line x1="${cx}" y1="64" x2="${(cx + Math.cos(ang) * 6.5).toFixed(1)}" y2="${(64 + Math.sin(ang) * 6.5).toFixed(1)}" stroke="${ink}" stroke-width="1.1"/>`;
    }).join('')}
  `;

  return `
    <svg viewBox="0 0 200 84" width="${width}" height="${Math.round(width * 0.42)}" role="img" aria-label="${escAttr((car?.brandName || '') + ' ' + (car?.model || 'Car'))}">
      <ellipse cx="100" cy="70" rx="84" ry="7" fill="rgba(0,0,0,0.12)"/>
      ${roofAddon}
      <path d="${bodyPath}" fill="${paintHex}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>
      <path d="${glassPath}" fill="#BAE6FD" stroke="${ink}" stroke-width="1.4"/>
      <rect x="174" y="49" width="8" height="4.5" rx="1.5" fill="#FEF08A" stroke="${ink}" stroke-width="1"/>
      <rect x="17" y="48" width="6" height="4.5" rx="1" fill="#DC2626" stroke="${ink}" stroke-width="1"/>
      ${renderWheel(52)}
      ${renderWheel(148)}
    </svg>
  `;
}
