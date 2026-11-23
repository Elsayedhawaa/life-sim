/* ============================================================================
   World Life — High-Realism Anatomical Portrait & Bespoke Wardrobe Engine
   - 6 Sculpted Facial Bone Contours (Oval, Chiseled, Heart, Aristocratic, Round, Square)
   - Radial Limbal-Ring Irises, Dual Catchlights, Palpebral Eyelid Creases & Lashes
   - Dorsal Nose Bridge Highlight, Alar Nostrils, Philtrum & Two-Tone Vermilion Lips
   - 8 Hairstyles, 5 Facial Hair Styles, 4 Eyewear Frames, 4 Cultural Headwears,
     and 8 Bespoke Wardrobe Styles — 100% Interactive in Character & Tailor Studio!
   ========================================================================== */

export const SKIN_PALETTES = [
  { id: 0, label: 'Porcelain Warm',    base: '#F7DDD0', hi: '#FFF0E6', mid: '#E8C2AC', shadow: '#CFA084', deep: '#A8765B', lipUpper: '#B96E68', lipLower: '#CF847D' },
  { id: 1, label: 'Mediterranean Fair', base: '#F0C7A5', hi: '#FBE0C9', mid: '#DDA982', shadow: '#C38B62', deep: '#9A6542', lipUpper: '#AD625B', lipLower: '#C4776F' },
  { id: 2, label: 'Nile Olive',         base: '#DFAD80', hi: '#EFC69F', mid: '#C89162', shadow: '#AE7648', deep: '#85532E', lipUpper: '#9B534B', lipLower: '#B3675E' },
  { id: 3, label: 'Arabian Bronze',     base: '#BE8558', hi: '#D49E72', mid: '#A36B40', shadow: '#88532B', deep: '#633919', lipUpper: '#82423B', lipLower: '#99534B' },
  { id: 4, label: 'Deep Nubian Umber',  base: '#855437', hi: '#9D6949', mid: '#6C4126', shadow: '#53301A', deep: '#391F0F', lipUpper: '#5E2E2A', lipLower: '#753D38' }
];

export const HAIR_COLORS = [
  { id: 0, label: 'Espresso Black', main: '#181615', hi: '#3C3532', strand: '#0D0C0B' },
  { id: 1, label: 'Dark Walnut',    main: '#352218', hi: '#5C3F2F', strand: '#22150F' },
  { id: 2, label: 'Warm Chestnut',  main: '#613C24', hi: '#8C5B3C', strand: '#422817' },
  { id: 3, label: 'Golden Honey',   main: '#AF803E', hi: '#D4A862', strand: '#7D5825' },
  { id: 4, label: 'Copper Auburn',  main: '#783225', hi: '#A34B3A', strand: '#4F1E15' },
  { id: 5, label: 'Silver Salt',    main: '#9E9A93', hi: '#D6D2CB', strand: '#6E6A64' }
];

export const IRIS_COLORS = [
  { id: 0, label: 'Deep Espresso', outer: '#241710', inner: '#4A3122' },
  { id: 1, label: 'Warm Amber Hazel', outer: '#3D2B18', inner: '#7C5A2B' },
  { id: 2, label: 'Levantine Olive Green', outer: '#243B2C', inner: '#4F775A' },
  { id: 3, label: 'Aegean Slate Blue', outer: '#1E3448', inner: '#4D7799' },
  { id: 4, label: 'Storm Grey', outer: '#2F353B', inner: '#6C757D' }
];

export const FACE_SHAPES = [
  { id: 0, label: 'Balanced Oval' },
  { id: 1, label: 'Chiseled Angular' },
  { id: 2, label: 'Soft Heart' },
  { id: 3, label: 'Aristocratic Long' },
  { id: 4, label: 'Warm Full' },
  { id: 5, label: 'Strong Square' }
];

export const HAIR_STYLES = [
  { id: 0, label: 'Classic Side-Part' },
  { id: 1, label: 'Textured Curls' },
  { id: 2, label: 'Executive Slick-Back' },
  { id: 3, label: 'Cropped Taper Fade' },
  { id: 4, label: 'Flowing Shoulder Waves' },
  { id: 5, label: 'Silk Chignon Updo' },
  { id: 6, label: 'Editorial Bob' },
  { id: 7, label: 'Parted Long Layers' }
];

export const BEARD_STYLES = [
  { id: 0, label: 'Clean-Shaven' },
  { id: 1, label: 'Designer 5-O’Clock Stubble' },
  { id: 2, label: 'Sculpted Short Beard' },
  { id: 3, label: 'Royal Goatee & Mustache' },
  { id: 4, label: 'Full Distinguished Beard' }
];

export const EYEWEAR_STYLES = [
  { id: 0, label: 'No Eyewear' },
  { id: 1, label: 'Tortoiseshell Intellectual' },
  { id: 2, label: 'Titanium Geometric' },
  { id: 3, label: 'Gold Half-Rim Browline' }
];

export const HEADWEAR_STYLES = [
  { id: 'auto',    label: 'Cultural Default / Natural' },
  { id: 'none',    label: 'Uncovered Hair' },
  { id: 'shemagh', label: 'Saudi Red Shemagh & Agal' },
  { id: 'ghutra',  label: 'Emirati White Ghutra & Agal' },
  { id: 'hijab',   label: 'Draped Silk Hijab' }
];

export const WARDROBE_STYLES = [
  { id: 0, label: 'Savile Row Navy Suit',        jacket: '#1D3044', shirt: '#FAF8F3', tie: '#C84B31', bg: '#EDE8DC', style: 'suit' },
  { id: 1, label: 'Anthropic Clay Cashmere',     jacket: '#9E4733', shirt: '#FAF6EE', tie: null,      bg: '#F2EBE1', style: 'knit' },
  { id: 2, label: 'Mediterranean Linen Blazer',  jacket: '#6B5E4C', shirt: '#FFFDF9', tie: null,      bg: '#EFECE4', style: 'open_blazer' },
  { id: 3, label: 'Crisp Gulf Thobe / Kandura',  jacket: '#FAF9F5', shirt: '#EFECE4', tie: null,      bg: '#E8E4DA', style: 'thobe' },
  { id: 4, label: 'Consultant Medical Coat',     jacket: '#FFFFFF', shirt: '#2A6F97', tie: null,      bg: '#E6EEF0', style: 'doctor' },
  { id: 5, label: 'Founder Obsidian Turtleneck', jacket: '#232220', shirt: '#2E2C2A', tie: null,      bg: '#EAE6DF', style: 'turtleneck' },
  { id: 6, label: 'Cambridge Sage Tweed',        jacket: '#2E493C', shirt: '#FAF8F2', tie: '#A97115', bg: '#E8EFEA', style: 'suit' },
  { id: 7, label: 'Gala Midnight Couture',       jacket: '#171923', shirt: '#FFFDF9', tie: '#B68A28', bg: '#E9E7EE', style: 'gala' }
];

const HIJAB_PALETTES = [
  { main: '#2F4858', fold: '#1D2E3A' },
  { main: '#6E4B3A', fold: '#4A3124' },
  { main: '#2B5744', fold: '#19372B' },
  { main: '#5E4B66', fold: '#3E3045' },
  { main: '#7A2E36', fold: '#511C22' },
  { main: '#262729', fold: '#151618' }
];

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function getFaceContourPath(shapeIdx, gender, isBaby, isChild) {
  if (isBaby) return 'M30,50 C30,33 70,33 70,50 C70,64 61,72 50,72 C39,72 30,64 30,50 Z';
  if (isChild) return 'M30.5,46 C30.5,27 69.5,27 69.5,46 C69.5,58 63,69 50,70.5 C37,69 30.5,58 30.5,46 Z';

  const idx = Number(shapeIdx ?? (gender === 'f' ? 2 : 1)) % 6;
  if (idx === 1) {
    // Chiseled Angular cheekbones + defined jaw
    return 'M29.6,41 C29.6,20.5 70.4,20.5 70.4,41 L69.5,53.5 L61.5,68.8 L54,72.4 L46,72.4 L38.5,68.8 L30.5,53.5 Z';
  }
  if (idx === 2) {
    // Soft Heart / Tapered Chin
    return 'M30.2,42.5 C30.2,21.5 69.8,21.5 69.8,42.5 C69.8,54 64.5,64.5 54.5,71.2 Q50,73.2 45.5,71.2 C35.5,64.5 30.2,54 30.2,42.5 Z';
  }
  if (idx === 3) {
    // Aristocratic Sculpted Long
    return 'M31,41 C31,20 69,20 69,41 C69,55 64.5,66.5 55,72.8 Q50,74.2 45,72.8 C35.5,66.5 31,55 31,41 Z';
  }
  if (idx === 4) {
    // Warm Full
    return 'M29,43 C29,22 71,22 71,43 C71,57.5 64,69.5 50,71.8 C36,69.5 29,57.5 29,43 Z';
  }
  if (idx === 5) {
    // Strong Square Jaw
    return 'M29.5,41.5 C29.5,21 70.5,21 70.5,41.5 L69.8,57.5 C68.5,66.5 63,70.5 56,72 L44,72 C37,70.5 31.5,66.5 30.2,57.5 Z';
  }
  // Balanced Oval
  return 'M30.2,42 C30.2,21.5 69.8,21.5 69.8,42 C69.8,55 64.5,66.5 55,71.5 Q50,73 45,71.5 C35.5,66.5 30.2,55 30.2,42 Z';
}

export const INK_PORTRAIT_ARCHETYPES = [
  { id: 'auto',                label: 'Auto Dynamic Life-Stage Ink Art' },
  { id: 'p_young_man',         label: 'Mediterranean Gentleman' },
  { id: 'p_ym_curly_scholar',  label: 'Curly-Haired Scholar & Glasses' },
  { id: 'p_ym_beard_exec',     label: 'Bearded Executive Blazer' },
  { id: 'p_ym_creative_linen', label: 'Creative Architect in Olive Linen' },
  { id: 'p_ym_western',        label: 'Continental Tweed Gentleman' },
  { id: 'p_ym_east_asian',     label: 'East Asian Minimalist & Glasses' },
  { id: 'p_man_shemagh',       label: 'Saudi Red Shemagh & Agal' },
  { id: 'p_man_ghutra',        label: 'Emirati White Ghutra & Kandura' },
  { id: 'p_gulf_businessman',  label: 'Gulf Businessman, Thobe & Ghutra' },
  { id: 'p_doctor_coat',       label: 'Male Physician & Stethoscope' },
  { id: 'p_young_woman',       label: 'Mediterranean Lady' },
  { id: 'p_young_mother_baby', label: 'Young Mother Holding Her Baby' },
  { id: 'p_yw_curly_artist',   label: 'Curly-Haired Creative Woman' },
  { id: 'p_yw_western',        label: 'Continental Camel-Coat Lady' },
  { id: 'p_european_student',  label: 'Young European Student' },
  { id: 'p_yw_east_asian',     label: 'East Asian Terracotta Cardigan' },
  { id: 'p_woman_hijab',       label: 'Draped Sage Silk Hijab' },
  { id: 'p_yw_hijab_ochre',    label: 'Golden-Ochre Silk Hijab & Blazer' },
  { id: 'p_female_doctor',     label: 'Female Physician & Stethoscope' },
  { id: 'p_teen_boy',          label: 'Adolescent Student (Male)' },
  { id: 'p_teen_girl',         label: 'Adolescent Student (Female)' },
  { id: 'p_mature_man',        label: 'Distinguished Senior Executive' },
  { id: 'p_mm_wali_mustache',  label: 'Traditional Patriarch / Wali' },
  { id: 'p_mature_woman',      label: 'Distinguished Matriarch' },
  { id: 'p_mw_hijab_mother',   label: 'Dignified Mother in Silk Hijab' },
  { id: 'p_elder_sage',        label: 'Silver-Bearded Elder Sage' },
  { id: 'p_elder_grandfather', label: 'Elder Grandfather, Glasses & Galabeya' },
  { id: 'p_elder_woman',       label: 'Beloved Grandmother' },
  { id: 'p_turkish_grandmother', label: 'Turkish Grandmother in Ochre Headscarf' }
];

function hashPersonIdentity(person) {
  const raw = `${person?.id || ''}|${person?.firstName || ''}|${person?.lastName || ''}|${person?.role || ''}|${person?.appearance?.seed ?? 17}`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

const EAST_ASIAN_NATS = new Set(['jpn', 'sgp']);
const WESTERN_NATS = new Set(['usa', 'can', 'gbr', 'deu', 'fra', 'nld', 'aus', 'che', 'swe']);
const GULF_NATS = new Set(['sau', 'uae', 'qat', 'kwt']);

export function resolveInkPortraitFile(person, opts = {}) {
  if (!person) return 'p_young_man.jpg';
  const app = person.appearance || {};
  const age = person.age ?? 25;
  const gender = person.gender || 'm';
  const nat = String(person.nationality || 'egy').toLowerCase();
  const hwPref = app.headwearMode || 'auto';
  const h = hashPersonIdentity(person);

  if (app.inkArchetype && app.inkArchetype !== 'auto') {
    return `${app.inkArchetype}.jpg`;
  }
  if (age <= 4) return 'p_toddler.jpg';
  if (age < 14) return gender === 'f' ? 'p_child_girl.jpg' : 'p_child_boy.jpg';
  if (age < 19) return gender === 'f' ? 'p_teen_girl.jpg' : 'p_teen_boy.jpg';
  if (age >= 66 && gender === 'f' && nat === 'can' && !app.wearsHijab && ['none','auto'].includes(hwPref) && Number(app.skinToneIdx ?? 2) === 4) return 'p_canada_elder_woman.jpg';
  if (age >= 66 && gender === 'm' && nat === 'deu' && ['none','auto'].includes(hwPref) && Number(app.skinToneIdx ?? 0) <= 1 && Number(app.beardStyleIdx) === 2) return 'p_germany_elder_man.jpg';
  if (age >= 66 && gender === 'm' && nat === 'usa' && ['none','auto'].includes(hwPref) && Number(app.skinToneIdx ?? 2) === 4 && !(Number(app.beardStyleIdx)||0)) return 'p_usa_elder_man.jpg';
  if (age >= 66 && gender === 'f' && nat === 'gbr' && !app.wearsHijab && ['none','auto'].includes(hwPref) && Number(app.skinToneIdx ?? 0) <= 1) return 'p_uk_elder_woman.jpg';
  if (age >= 66 && gender === 'm' && nat === 'uae' && (hwPref === 'ghutra' || (hwPref === 'auto' && app.wearsGulfAttire))) return 'p_uae_elder_man.jpg';
  if (age >= 66 && gender === 'm' && nat === 'sau' && (hwPref === 'shemagh' || (hwPref === 'auto' && app.wearsGulfAttire))) return 'p_saudi_elder_man.jpg';
  if (age >= 66 && gender === 'm' && EAST_ASIAN_NATS.has(nat)) return 'p_east_asian_elder.jpg';
  if (age >= 66 && gender === 'f' && nat === 'egy' && app.headwearMode !== 'hijab' && !app.wearsHijab) return 'p_egypt_elder_woman.jpg';
  if (age >= 66 && gender === 'f' && nat === 'tur') return 'p_turkish_grandmother.jpg';
  if (age >= 66) {
    if (gender === 'f') return 'p_elder_woman.jpg';
    const elderMenPool = ['p_elder_sage.jpg', 'p_elder_grandfather.jpg'];
    return elderMenPool[h % elderMenPool.length];
  }

  const wearsHijab = hwPref === 'hijab' || (hwPref === 'auto' && !!app.wearsHijab);
  const wearsShemagh = hwPref === 'shemagh' || (hwPref === 'auto' && !!app.wearsGulfAttire && gender === 'm' && nat === 'sau');
  const wearsGhutra = hwPref === 'ghutra' || (hwPref === 'auto' && !!app.wearsGulfAttire && gender === 'm' && nat !== 'sau');

  const isDoctor = (person.career?.track === 'medicine' && age >= 23) || app.wardrobeIdx === 4;
  if (isDoctor) {
    return gender === 'f' ? 'p_female_doctor.jpg' : 'p_doctor_coat.jpg';
  }
  // Gulf businessman in his 40s — employer, business partner, wealthy relative
  if (gender === 'm' && age >= 35 && age < 56 && GULF_NATS.has(nat)) {
    const gulfPool = nat === 'sau'
      ? ['p_gulf_businessman.jpg', 'p_man_shemagh.jpg', 'p_mature_man.jpg']
      : ['p_gulf_businessman.jpg', 'p_man_ghutra.jpg', 'p_mature_man.jpg'];
    return gulfPool[h % gulfPool.length];
  }
  if (gender === 'm' && wearsShemagh && age < 56) return 'p_man_shemagh.jpg';
  if (gender === 'm' && wearsGhutra && age < 56) return 'p_man_ghutra.jpg';

  // Mature life chapter (45–65): multi-archetype parents, Walis, senior executives & matriarchs
  if (age >= 45) {
    if (gender === 'f') {
      if (wearsHijab) return 'p_mw_hijab_mother.jpg';
      const fMaturePool = ['p_mature_woman.jpg', 'p_mw_hijab_mother.jpg'];
      return EAST_ASIAN_NATS.has(nat) || WESTERN_NATS.has(nat)
        ? 'p_mature_woman.jpg'
        : fMaturePool[h % fMaturePool.length];
    }
    if (wearsShemagh) return h % 2 === 0 ? 'p_man_shemagh.jpg' : 'p_mm_wali_mustache.jpg';
    if (wearsGhutra) return h % 2 === 0 ? 'p_man_ghutra.jpg' : 'p_mature_man.jpg';
    const mMaturePool = ['p_mature_man.jpg', 'p_mm_wali_mustache.jpg'];
    return mMaturePool[h % mMaturePool.length];
  }

  // Young Adults (19–44): rich multi-plate pools + age-band progression for the player
  const ageShift = person.id === 'player' ? Math.floor((age - 19) / 8) : 0;
  if (gender === 'f') {
    if (wearsHijab) {
      const hijabPool = ['p_woman_hijab.jpg', 'p_yw_hijab_ochre.jpg'];
      return hijabPool[(h + ageShift) % hijabPool.length];
    }
    // Young mother (19–35) with a baby in her arms
    if (person.role === 'mother') {
      const momPool = ['p_young_mother_baby.jpg', 'p_young_woman.jpg', 'p_yw_curly_artist.jpg'];
      return momPool[(h + ageShift) % momPool.length];
    }
    if (EAST_ASIAN_NATS.has(nat)) {
      const eaPool = ['p_yw_east_asian.jpg', 'p_yw_east_asian.jpg', 'p_yw_curly_artist.jpg'];
      return eaPool[(h + ageShift) % eaPool.length];
    }
    if (WESTERN_NATS.has(nat)) {
      // Young European student (19–26): classmate, study-abroad friend, young partner
      if (age <= 26) {
        const studentPool = ['p_yw_western.jpg', 'p_european_student.jpg', 'p_young_woman.jpg'];
        return studentPool[(h + ageShift) % studentPool.length];
      }
      const westPool = ['p_yw_western.jpg', 'p_young_woman.jpg', 'p_yw_curly_artist.jpg'];
      return westPool[(h + ageShift) % westPool.length];
    }
    const menaPool = ['p_young_woman.jpg', 'p_yw_curly_artist.jpg', 'p_yw_western.jpg'];
    return menaPool[(h + ageShift) % menaPool.length];
  }

  // Young Adult Male (19–44)
  if (EAST_ASIAN_NATS.has(nat)) {
    const eaMen = ['p_ym_east_asian.jpg', 'p_ym_east_asian.jpg', 'p_ym_curly_scholar.jpg', 'p_ym_beard_exec.jpg'];
    return eaMen[(h + ageShift) % eaMen.length];
  }
  if (WESTERN_NATS.has(nat)) {
    const westMen = ['p_ym_western.jpg', 'p_ym_creative_linen.jpg', 'p_young_man.jpg', 'p_ym_curly_scholar.jpg', 'p_ym_beard_exec.jpg'];
    return westMen[(h + ageShift) % westMen.length];
  }
  const menaMen = ['p_young_man.jpg', 'p_ym_curly_scholar.jpg', 'p_ym_beard_exec.jpg', 'p_ym_creative_linen.jpg'];
  return menaMen[(h + ageShift) % menaMen.length];
}

const PAPER_WASH_TINTS = ['#FAF6EE', '#F6F8F3', '#FBF4E7', '#F9F3EE', '#F3F6F9', '#F8F5EC'];

export function renderPortraitSvg(person, size = 64, opts = {}) {
  if (!person) return '';
  const app = person.appearance || {};
  const age = person.age ?? 25;
  const gender = person.gender || 'm';
  const seed = Number(app.seed || 17);
  const h = hashPersonIdentity(person);
  const uid = `${String(person.id || 'p').replace(/[^a-zA-Z0-9_-]/g, '')}_${size}_${h % 9973}`;

  /* DEFAULT: Hand-Drawn Fine-Line Fountain-Pen Ink & Watercolor Wash Portrait! */
  if (app.portraitMode !== 'vector') {
    const imgFile = resolveInkPortraitFile(person, opts);
    const paperFill = PAPER_WASH_TINTS[h % PAPER_WASH_TINTS.length];
    const warmShift = ((h % 5) - 2) * 2; // subtle -4deg..+4deg organic ink wash warmth
    const deadFilter = !person.alive
      ? 'grayscale(0.95) opacity(0.74)'
      : `contrast(1.03) saturate(${(0.97 + (h % 4) * 0.03).toFixed(2)}) hue-rotate(${warmShift}deg)`;
    const borderCol = (person.rel?.resentment ?? 0) >= 48
      ? '#B42318'
      : opts.isMilitaryActive
      ? '#3D4D35'
      : (person.role === 'spouse' || person.role === 'fiance')
      ? '#A97115'
      : 'rgba(25, 23, 22, 0.28)';

    // Subtle micro-crop framing so even two people sharing a rare archetype plate frame slightly differently
    const zoom = 96 + (h % 3) * 2;
    const off = (100 - zoom) / 2;

    // Contextual corner insignia badge (physician, spouse, military)
    const isDoc = (person.career?.track === 'medicine' && age >= 23) || app.wardrobeIdx === 4;
    const badgeDot = opts.isMilitaryActive
      ? `<circle cx="86" cy="86" r="8" fill="#3D4D35" stroke="#FAF6EE" stroke-width="1.5"/><text x="86" y="89" text-anchor="middle" font-size="8" font-weight="800" fill="#FAF6EE">★</text>`
      : isDoc
      ? `<circle cx="86" cy="86" r="8" fill="#186A47" stroke="#FAF6EE" stroke-width="1.5"/><text x="86" y="89.2" text-anchor="middle" font-size="9" font-weight="800" fill="#FAF6EE">+</text>`
      : person.role === 'spouse'
      ? `<circle cx="86" cy="86" r="7.5" fill="#A97115" stroke="#FAF6EE" stroke-width="1.5"/><circle cx="86" cy="86" r="3.2" fill="none" stroke="#FAF6EE" stroke-width="1.2"/>`
      : '';

    return `<svg class="wl-portrait wl-portrait-ink" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${esc(person.fullName)}" style="filter:${deadFilter};flex-shrink:0">
      <defs>
        <clipPath id="inkClip_${uid}">
          <rect x="3" y="3" width="94" height="94" rx="20"/>
        </clipPath>
      </defs>
      <rect x="3" y="3" width="94" height="94" rx="20" fill="${paperFill}"/>
      <g clip-path="url(#inkClip_${uid})">
        ${renderPortraitSvg({ ...person, appearance: { ...app, portraitMode: 'vector' } }, 100, opts)}
        <image href="assets/portraits/${imgFile}" x="${off}" y="${off}" width="${zoom}" height="${zoom}" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <rect x="3" y="3" width="94" height="94" rx="20" fill="none" stroke="${borderCol}" stroke-width="1.6"/>
      <rect x="6" y="6" width="88" height="88" rx="17" fill="none" stroke="rgba(25,23,22,0.10)" stroke-width="0.75"/>
      ${badgeDot}
    </svg>`;
  }

  const isBaby = age <= 3;
  const isChild = age > 3 && age < 13;
  const isMature = age >= 46 && age < 62;
  const isElder = age >= 62;

  const skin = SKIN_PALETTES[(app.skinToneIdx ?? 2) % SKIN_PALETTES.length];
  const natHair = HAIR_COLORS[(app.hairColorIdx ?? 0) % HAIR_COLORS.length];
  const hair = isElder && app.hairColorIdx === undefined
    ? HAIR_COLORS[5]
    : isElder
    ? { main: '#CBC7C0', hi: '#E6E3DD', strand: '#98938B' }
    : isMature && (app.hairColorIdx ?? 0) < 3
    ? { main: '#4E4A46', hi: '#827C75', strand: '#2E2B29' }
    : natHair;

  const irisSpec = IRIS_COLORS[(app.irisIdx ?? (seed % IRIS_COLORS.length)) % IRIS_COLORS.length];
  const wardrobeIdx = app.wardrobeIdx !== undefined ? Number(app.wardrobeIdx) : (seed % WARDROBE_STYLES.length);
  const ward = WARDROBE_STYLES[wardrobeIdx % WARDROBE_STYLES.length];
  const hijab = HIJAB_PALETTES[seed % HIJAB_PALETTES.length];

  /* Headwear resolution (supports explicit customization OR cultural defaults) */
  const hwPref = app.headwearMode || 'auto';
  const wearsHijab = age >= 13 && (hwPref === 'hijab' || (hwPref === 'auto' && !!app.wearsHijab));
  const wearsShemagh = age >= 14 && (hwPref === 'shemagh' || (hwPref === 'auto' && !!app.wearsGulfAttire && gender === 'm' && person.nationality === 'sau'));
  const wearsGhutra = age >= 14 && (hwPref === 'ghutra' || (hwPref === 'auto' && !!app.wearsGulfAttire && gender === 'm' && person.nationality !== 'sau'));
  const wearsAnyGulfHead = wearsShemagh || wearsGhutra;

  const resentment = person.rel?.resentment ?? 0;
  const affection = person.rel?.affection ?? 65;
  const happiness = person.vitals?.happiness ?? 70;
  const stress = person.vitals?.stress ?? 25;
  const health = person.vitals?.health ?? 80;

  let mood = 'composed';
  if (!person.alive) mood = 'memorial';
  else if (resentment >= 48) mood = 'stern';
  else if (health <= 32 || stress >= 78 || happiness <= 24) mood = 'weary';
  else if (happiness >= 68 && affection >= 62) mood = 'warm';

  const ink = '#191716';
  const bgFill = !person.alive ? '#DFDBD2' : ward.bg;
  const headPath = getFaceContourPath(app.faceShapeIdx, gender, isBaby, isChild);

  /* Attire Resolution */
  const isDoctor = (person.career?.track === 'medicine' && age >= 22 && app.wardrobeIdx === undefined) || ward.style === 'doctor';
  const isMilitary = !!opts.isMilitaryActive;
  const useThobe = (wearsAnyGulfHead && app.wardrobeIdx === undefined) || ward.style === 'thobe';

  let shouldersSvg = '';
  if (isBaby) {
    shouldersSvg = `
      <path d="M23,98 C25,79 75,79 77,98 Z" fill="#F3D999" stroke="${ink}" stroke-width="1.4"/>
      <path d="M35,81 Q50,89 65,81" fill="none" stroke="#FFFDF9" stroke-width="2.5"/>
    `;
  } else if (isMilitary) {
    shouldersSvg = `
      <path d="M12,100 C15,75 33,70 50,70 C67,70 85,75 88,100 Z" fill="#3D4D35" stroke="${ink}" stroke-width="1.4"/>
      <polygon points="42,70 50,85 58,70" fill="#293524"/>
      <rect x="21" y="74" width="10" height="4" rx="1" fill="#B68A28" stroke="${ink}" stroke-width="0.8"/>
      <rect x="69" y="74" width="10" height="4" rx="1" fill="#B68A28" stroke="${ink}" stroke-width="0.8"/>
    `;
  } else if (useThobe) {
    shouldersSvg = `
      <path d="M12,100 C15,75 33,70 50,70 C67,70 85,75 88,100 Z" fill="#FAF9F5" stroke="${ink}" stroke-width="1.4"/>
      <path d="M44.5,70 L44.5,92 L55.5,92 L55.5,70 Z" fill="#EFECE4" stroke="${ink}" stroke-width="1"/>
      <line x1="50" y1="73" x2="50" y2="90" stroke="${ink}" stroke-width="0.9"/>
      <circle cx="50" cy="77" r="0.9" fill="#9A8F7E"/>
      <circle cx="50" cy="83" r="0.9" fill="#9A8F7E"/>
    `;
  } else if (isDoctor) {
    shouldersSvg = `
      <path d="M12,100 C15,75 33,70 50,70 C67,70 85,75 88,100 Z" fill="#FFFFFF" stroke="${ink}" stroke-width="1.4"/>
      <polygon points="41,70 50,90 59,70" fill="#2A6F97"/>
      <path d="M38,70 L45,93 L50,88 M62,70 L55,93 L50,88" fill="none" stroke="#CBD5E1" stroke-width="1.2"/>
      <path d="M34,72 C32,85 40,90 43,94 M66,72 C68,85 60,90 57,94" fill="none" stroke="#334155" stroke-width="1.9"/>
      <circle cx="57" cy="94" r="2.7" fill="#E2E8F0" stroke="${ink}" stroke-width="1.1"/>
    `;
  } else if (ward.style === 'turtleneck' || ward.style === 'knit') {
    shouldersSvg = `
      <path d="M13,100 C16,75 33,70 50,70 C67,70 84,75 87,100 Z" fill="${ward.jacket}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M40.5,69.5 Q50,75 59.5,69.5 L58.5,76 Q50,80.5 41.5,76 Z" fill="${ward.shirt}" stroke="${ink}" stroke-width="1.1"/>
    `;
  } else if (gender === 'f' && app.wardrobeIdx === undefined) {
    shouldersSvg = `
      <path d="M14,100 C17,76 34,71 50,71 C66,71 83,76 86,100 Z" fill="${ward.jacket}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M39,71 Q50,84 61,71" fill="${ward.shirt}" stroke="${ink}" stroke-width="1.1"/>
      ${age >= 18 ? `<path d="M41.5,74.5 Q50,81 58.5,74.5" fill="none" stroke="#D4AF37" stroke-width="1.15"/><circle cx="50" cy="78.2" r="1.4" fill="#FDE68A"/>` : ''}
    `;
  } else {
    shouldersSvg = `
      <path d="M12,100 C15,75 33,70 50,70 C67,70 85,75 88,100 Z" fill="${ward.jacket}" stroke="${ink}" stroke-width="1.4"/>
      <polygon points="40.5,70 50,92 59.5,70" fill="${ward.shirt}"/>
      ${(ward.tie && age >= 19) ? `<polygon points="48.2,74.5 51.8,74.5 52.8,92 50,96 47.2,92" fill="${ward.tie}"/>` : ''}
      <path d="M36.5,70 L45,92 L41,81 M63.5,70 L55,92 L59,81" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
    `;
  }

  /* Hair Style Index Resolution */
  const defaultHairStyle = gender === 'f' ? (4 + (seed % 4)) : (seed % 4);
  const hStyle = Number(app.hairStyleIdx ?? defaultHairStyle) % 8;

  /* Back Hair / Headcloth */
  let backHairSvg = '';
  if (wearsHijab) {
    backHairSvg = `<path d="M23,44 C23,18 77,18 77,44 L81,84 C68,92 32,92 19,84 Z" fill="${hijab.fold}" stroke="${ink}" stroke-width="1.4"/>`;
  } else if (wearsAnyGulfHead) {
    const gFill = wearsShemagh ? `url(#shemagh_${uid})` : '#FFFFFF';
    backHairSvg = `<path d="M21,43 C21,17 79,17 79,43 L84,87 L69,89 L67,56 L33,56 L31,89 L16,87 Z" fill="${gFill}" stroke="${ink}" stroke-width="1.4"/>`;
  } else if (!isBaby && (hStyle === 4 || hStyle === 7)) {
    // Flowing waves or long parted layers behind shoulders
    backHairSvg = `
      <path d="M25,42 C22,18 78,18 75,42 L79,77 C70,82 30,82 21,77 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M27,48 Q24,62 28,75 M73,48 Q76,62 72,75" fill="none" stroke="${hair.hi}" stroke-width="1.1" opacity="0.6"/>
    `;
  } else if (!isBaby && hStyle === 6) {
    // Editorial chin-length bob
    backHairSvg = `<path d="M26,42 C25,20 75,20 74,42 L75,65 C68,70 32,70 25,65 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1.4"/>`;
  }

  /* Neck + Sub-mental Chin Shadow + Anatomical Ears */
  const neckSvg = isBaby ? '' : `
    <path d="M42.5,64 L42.5,75.5 Q50,78.5 57.5,75.5 L57.5,64 Z" fill="${skin.mid}" stroke="${ink}" stroke-width="1.25"/>
    <path d="M42.8,65 Q50,73.5 57.2,65 Z" fill="${skin.deep}" opacity="0.45"/>
  `;
  const earsSvg = (wearsHijab || wearsAnyGulfHead) ? '' : `
    <g>
      <path d="M30.4,43 C26.4,42 26.4,53.2 31,53.8" fill="${skin.mid}" stroke="${ink}" stroke-width="1.35"/>
      <path d="M28.6,45.5 Q27.6,48.8 29.8,51" fill="none" stroke="${skin.deep}" stroke-width="0.95"/>
      <path d="M69.6,43 C73.6,42 73.6,53.2 69,53.8" fill="${skin.mid}" stroke="${ink}" stroke-width="1.35"/>
      <path d="M71.4,45.5 Q72.4,48.8 70.2,51" fill="none" stroke="${skin.deep}" stroke-width="0.95"/>
    </g>
  `;

  /* Sculpted Face Base + Cheekbone Highlights + Jawline Contour */
  const facePlanesSvg = `
    <path d="${headPath}" fill="url(#skinGrad_${uid})" stroke="${ink}" stroke-width="1.5"/>
    ${!isBaby ? `
      <ellipse cx="38" cy="51.5" rx="5.2" ry="3.2" fill="${skin.hi}" opacity="0.28"/>
      <ellipse cx="62" cy="51.5" rx="5.2" ry="3.2" fill="${skin.hi}" opacity="0.28"/>
      <path d="M33,53 Q37,62.5 45,68.5" fill="none" stroke="${skin.shadow}" stroke-width="1.5" opacity="0.35"/>
      <path d="M67,53 Q63,62.5 55,68.5" fill="none" stroke="${skin.shadow}" stroke-width="1.5" opacity="0.35"/>
    ` : ''}
  `;

  /* Detailed Almond Eyes: Palpebral Crease, Limbal Iris, Dual Catchlights & Lashes */
  const eyeY = isBaby ? 50 : isChild ? 47.5 : 44.8;
  const browTilt = mood === 'stern' ? 2.1 : mood === 'weary' ? -1.7 : 0;
  const browLift = mood === 'warm' ? -1.1 : 0;
  const lidOpen = mood === 'weary' ? 2.1 : 2.75;
  const femLash = gender === 'f' && !isBaby;

  const eyesAndBrowsSvg = `
    <!-- Textured Eyebrows -->
    <path d="M34.2,${eyeY - 6 + browLift - browTilt * 0.4} Q40,${eyeY - 8.3 + browLift} 45.8,${eyeY - 5.7 + browLift + browTilt}" fill="none" stroke="${hair.main}" stroke-width="${gender === 'm' && !isChild ? '2.25' : '1.75'}" stroke-linecap="round"/>
    <path d="M65.8,${eyeY - 6 + browLift - browTilt * 0.4} Q60,${eyeY - 8.3 + browLift} 54.2,${eyeY - 5.7 + browLift + browTilt}" fill="none" stroke="${hair.main}" stroke-width="${gender === 'm' && !isChild ? '2.25' : '1.75'}" stroke-linecap="round"/>

    <!-- Upper Eyelid Crease Folds (Palpebral Sulcus) -->
    ${!isBaby ? `
      <path d="M35.5,${eyeY - lidOpen - 1.7} Q40.6,${eyeY - lidOpen - 3.1} 45.4,${eyeY - lidOpen - 1.4}" fill="none" stroke="${skin.deep}" stroke-width="0.7" opacity="0.55"/>
      <path d="M54.6,${eyeY - lidOpen - 1.4} Q59.4,${eyeY - lidOpen - 3.1} 64.5,${eyeY - lidOpen - 1.7}" fill="none" stroke="${skin.deep}" stroke-width="0.7" opacity="0.55"/>
    ` : ''}

    <!-- Left Eye: Sclera + Limbal Ring + Iris + Pupil + Dual Catchlights -->
    <path d="M35.4,${eyeY} Q40.6,${eyeY - lidOpen - 1.25} 45.6,${eyeY} Q40.6,${eyeY + lidOpen} 35.4,${eyeY} Z" fill="#FBF9F6"/>
    <circle cx="40.6" cy="${eyeY - 0.15}" r="2.25" fill="${irisSpec.outer}"/>
    <circle cx="40.6" cy="${eyeY - 0.15}" r="1.75" fill="${irisSpec.inner}"/>
    <circle cx="40.6" cy="${eyeY - 0.15}" r="0.95" fill="#0D0D0D"/>
    <circle cx="41.35" cy="${eyeY - 0.85}" r="0.62" fill="#FFFFFF"/>
    <circle cx="39.9" cy="${eyeY + 0.55}" r="0.28" fill="#FFFFFF" opacity="0.8"/>
    <path d="M35.1,${eyeY + 0.2} Q40.6,${eyeY - lidOpen - 1.45} 45.9,${eyeY + 0.15}" fill="none" stroke="${ink}" stroke-width="${femLash ? '1.75' : '1.35'}" stroke-linecap="round"/>
    ${femLash ? `<path d="M35.1,${eyeY + 0.1} L33.8,${eyeY - 1.1}" stroke="${ink}" stroke-width="1.1" stroke-linecap="round"/>` : ''}
    <path d="M36.4,${eyeY + 0.8} Q40.6,${eyeY + lidOpen + 0.35} 44.8,${eyeY + 0.6}" fill="none" stroke="${skin.deep}" stroke-width="0.75" opacity="0.65"/>

    <!-- Right Eye -->
    <path d="M54.4,${eyeY} Q59.4,${eyeY - lidOpen - 1.25} 64.6,${eyeY} Q59.4,${eyeY + lidOpen} 54.4,${eyeY} Z" fill="#FBF9F6"/>
    <circle cx="59.4" cy="${eyeY - 0.15}" r="2.25" fill="${irisSpec.outer}"/>
    <circle cx="59.4" cy="${eyeY - 0.15}" r="1.75" fill="${irisSpec.inner}"/>
    <circle cx="59.4" cy="${eyeY - 0.15}" r="0.95" fill="#0D0D0D"/>
    <circle cx="60.15" cy="${eyeY - 0.85}" r="0.62" fill="#FFFFFF"/>
    <circle cx="58.7" cy="${eyeY + 0.55}" r="0.28" fill="#FFFFFF" opacity="0.8"/>
    <path d="M54.1,${eyeY + 0.15} Q59.4,${eyeY - lidOpen - 1.45} 64.9,${eyeY + 0.2}" fill="none" stroke="${ink}" stroke-width="${femLash ? '1.75' : '1.35'}" stroke-linecap="round"/>
    ${femLash ? `<path d="M64.9,${eyeY + 0.1} L66.2,${eyeY - 1.1}" stroke="${ink}" stroke-width="1.1" stroke-linecap="round"/>` : ''}
    <path d="M55.2,${eyeY + 0.6} Q59.4,${eyeY + lidOpen + 0.35} 63.6,${eyeY + 0.8}" fill="none" stroke="${skin.deep}" stroke-width="0.75" opacity="0.65"/>
  `;

  /* Sculpted Dorsal Nose Bridge, Alar Wings, Nostrils & Philtrum */
  const noseY = isBaby ? 55 : isChild ? 53.8 : 53.4;
  const noseSvg = isBaby
    ? `<path d="M48.5,${noseY} Q50,${noseY + 1.8} 51.5,${noseY}" fill="none" stroke="${skin.deep}" stroke-width="1.25" stroke-linecap="round"/>`
    : `
      <line x1="49.8" y1="${eyeY + 1.8}" x2="49.7" y2="${noseY - 1.2}" stroke="${skin.hi}" stroke-width="1.1" opacity="0.55" stroke-linecap="round"/>
      <path d="M48.8,${eyeY + 1.6} L48.1,${noseY - 0.8} Q48.2,${noseY + 1.5} 50,${noseY + 1.8} Q51.8,${noseY + 1.5} 52.1,${noseY - 0.2}" fill="none" stroke="${skin.deep}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M46.4,${noseY + 0.5} Q47.6,${noseY + 2.1} 49.2,${noseY + 1.5} M53.6,${noseY + 0.5} Q52.4,${noseY + 2.1} 50.8,${noseY + 1.5}" fill="none" stroke="${ink}" stroke-width="0.95" opacity="0.68" stroke-linecap="round"/>
      <!-- Philtrum grooves -->
      <path d="M49.1,${noseY + 2.4} L48.8,${noseY + 5.6} M50.9,${noseY + 2.4} L51.2,${noseY + 5.6}" fill="none" stroke="${skin.shadow}" stroke-width="0.65" opacity="0.55"/>
    `;

  /* Shaded Two-Tone Vermilion Lips + Specular Lower Lip Highlight */
  const mouthY = isBaby ? 61 : isChild ? 60.5 : 61.2;
  let mouthSvg = '';
  if (mood === 'warm') {
    mouthSvg = `
      <path d="M43.2,${mouthY - 0.3} Q47,${mouthY - 1.7} 50,${mouthY - 0.7} Q53,${mouthY - 1.7} 56.8,${mouthY - 0.3} Q50,${mouthY + 1.4} 43.2,${mouthY - 0.3} Z" fill="${skin.lipUpper}"/>
      <path d="M43.5,${mouthY - 0.2} Q50,${mouthY + 5.0} 56.5,${mouthY - 0.2} Q50,${mouthY + 1.5} 43.5,${mouthY - 0.2} Z" fill="${skin.lipLower}"/>
      <path d="M43.0,${mouthY - 0.4} Q50,${mouthY + 2.6} 57.0,${mouthY - 0.4}" fill="none" stroke="${ink}" stroke-width="1.35" stroke-linecap="round"/>
      <path d="M47.5,${mouthY + 2.5} Q50,${mouthY + 3.2} 52.5,${mouthY + 2.5}" fill="none" stroke="#FFFFFF" stroke-width="0.7" opacity="0.45" stroke-linecap="round"/>
    `;
  } else if (mood === 'stern' || mood === 'weary') {
    mouthSvg = `
      <path d="M44.2,${mouthY + 1.1} Q50,${mouthY - 1.2} 55.8,${mouthY + 1.1}" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M46.5,${mouthY + 2.5} Q50,${mouthY + 3.1} 53.5,${mouthY + 2.5}" fill="none" stroke="${skin.deep}" stroke-width="0.85" opacity="0.55"/>
    `;
  } else {
    mouthSvg = `
      <path d="M44.0,${mouthY} Q47.5,${mouthY - 1.4} 50,${mouthY - 0.5} Q52.5,${mouthY - 1.4} 56.0,${mouthY} Q50,${mouthY + 0.6} 44.0,${mouthY} Z" fill="${skin.lipUpper}" opacity="0.88"/>
      <path d="M44.3,${mouthY + 0.1} Q50,${mouthY + 3.2} 55.7,${mouthY + 0.1} Z" fill="${skin.lipLower}" opacity="0.85"/>
      <path d="M43.8,${mouthY} Q50,${mouthY + 0.9} 56.2,${mouthY}" fill="none" stroke="${ink}" stroke-width="1.25" stroke-linecap="round"/>
      <path d="M48,${mouthY + 1.8} Q50,${mouthY + 2.2} 52,${mouthY + 1.8}" fill="none" stroke="#FFFFFF" stroke-width="0.65" opacity="0.42" stroke-linecap="round"/>
    `;
  }

  /* 5 Facial Hair Styles + 4 Eyewear Styles + Aging Lines */
  const beardMode = app.beardStyleIdx !== undefined
    ? Number(app.beardStyleIdx)
    : (gender === 'm' && age >= 20 && app.beard ? 2 : 0);

  let extrasSvg = '';
  if (gender === 'm' && age >= 18 && !isBaby && beardMode > 0) {
    if (beardMode === 1) {
      // Designer 5-o'clock stubble shadow
      extrasSvg += `<path d="M32.5,52 C33.5,66 41,72 50,72.2 C59,72 66.5,66 67.5,52 C64.5,58 58,60 50,60 C42,60 35.5,58 32.5,52 Z" fill="${hair.main}" opacity="0.22"/>`;
    } else if (beardMode === 3) {
      // Royal Van Dyke Goatee & Mustache
      extrasSvg += `
        <path d="M43.5,${mouthY - 1.7} Q50,${mouthY - 3.6} 56.5,${mouthY - 1.7}" fill="none" stroke="${hair.main}" stroke-width="2.1" stroke-linecap="round"/>
        <path d="M44.5,${mouthY + 3.8} Q50,${mouthY + 11.5} 55.5,${mouthY + 3.8} L53.5,72.2 L46.5,72.2 Z" fill="${hair.main}" opacity="0.88"/>
      `;
    } else if (beardMode === 4) {
      // Full Distinguished Patriarch Beard
      extrasSvg += `
        <path d="M30.8,50 C31.5,69 40,77 50,77.5 C60,77 68.5,69 69.2,50 C66,58 61,63 56,63.5 C55,59 52.5,58 50,58 C47.5,58 45,59 44,63.5 C39,63 34,58 30.8,50 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1"/>
        <path d="M43,${mouthY - 1.8} Q50,${mouthY - 3.8} 57,${mouthY - 1.8}" fill="none" stroke="${hair.main}" stroke-width="2.3" stroke-linecap="round"/>
      `;
    } else {
      // Sculpted Short Beard
      extrasSvg += `
        <path d="M31.5,51 C32.5,66 41,72.5 50,72.8 C59,72.5 67.5,66 68.5,51 C66,58 61,63 56,63.5 C55,59.5 52.5,58.2 50,58.2 C47.5,58.2 45,59.5 44,63.5 C39,63 34,58 31.5,51 Z" fill="${hair.main}" opacity="0.86"/>
        <path d="M43.5,${mouthY - 1.8} Q50,${mouthY - 3.6} 56.5,${mouthY - 1.8}" fill="none" stroke="${hair.main}" stroke-width="2.1" stroke-linecap="round"/>
      `;
    }
  }

  const glassMode = app.eyewearIdx !== undefined ? Number(app.eyewearIdx) : (app.glasses && age >= 8 ? 1 : 0);
  if (glassMode > 0 && age >= 7) {
    if (glassMode === 1) {
      // Tortoiseshell Round Intellectual
      extrasSvg += `
        <circle cx="40.5" cy="${eyeY - 0.2}" r="6.2" fill="rgba(255,255,255,0.12)" stroke="#4A2C18" stroke-width="1.65"/>
        <circle cx="59.5" cy="${eyeY - 0.2}" r="6.2" fill="rgba(255,255,255,0.12)" stroke="#4A2C18" stroke-width="1.65"/>
        <path d="M46.7,${eyeY - 0.8} Q50,${eyeY - 2.2} 53.3,${eyeY - 0.8}" fill="none" stroke="#4A2C18" stroke-width="1.4"/>
      `;
    } else if (glassMode === 3) {
      // Gold Half-Rim Browline
      extrasSvg += `
        <rect x="33.8" y="${eyeY - 4.4}" width="13.4" height="8.6" rx="2.5" fill="rgba(255,255,255,0.10)" stroke="#B68A28" stroke-width="1.1"/>
        <path d="M33.5,${eyeY - 4.4} L47.4,${eyeY - 4.4}" stroke="#181615" stroke-width="2.1" stroke-linecap="round"/>
        <rect x="52.8" y="${eyeY - 4.4}" width="13.4" height="8.6" rx="2.5" fill="rgba(255,255,255,0.10)" stroke="#B68A28" stroke-width="1.1"/>
        <path d="M52.6,${eyeY - 4.4} L66.5,${eyeY - 4.4}" stroke="#181615" stroke-width="2.1" stroke-linecap="round"/>
        <line x1="47.2" y1="${eyeY - 1.5}" x2="52.8" y2="${eyeY - 1.5}" stroke="#B68A28" stroke-width="1.3"/>
      `;
    } else {
      // Titanium Geometric
      extrasSvg += `
        <rect x="33.8" y="${eyeY - 4.4}" width="13.2" height="8.6" rx="2.8" fill="rgba(255,255,255,0.13)" stroke="${ink}" stroke-width="1.3"/>
        <rect x="53.0" y="${eyeY - 4.4}" width="13.2" height="8.6" rx="2.8" fill="rgba(255,255,255,0.13)" stroke="${ink}" stroke-width="1.3"/>
        <path d="M47,${eyeY - 0.8} Q50,${eyeY - 2} 53,${eyeY - 0.8}" fill="none" stroke="${ink}" stroke-width="1.2"/>
      `;
    }
  }

  if (isMature || isElder) {
    const op = isElder ? '0.62' : '0.32';
    extrasSvg += `
      <path d="M39,${eyeY - 11.5} Q50,${eyeY - 13} 61,${eyeY - 11.5}" fill="none" stroke="${skin.deep}" stroke-width="0.9" opacity="${op}"/>
      ${isElder ? `<path d="M41,${eyeY - 14.2} Q50,${eyeY - 15.5} 59,${eyeY - 14.2}" fill="none" stroke="${skin.deep}" stroke-width="0.8" opacity="0.5"/>` : ''}
      <path d="M41.5,${noseY + 0.5} Q38.8,${mouthY - 1} 40.8,${mouthY + 3}" fill="none" stroke="${skin.deep}" stroke-width="0.9" opacity="${op}"/>
      <path d="M58.5,${noseY + 0.5} Q61.2,${mouthY - 1} 59.2,${mouthY + 3}" fill="none" stroke="${skin.deep}" stroke-width="0.9" opacity="${op}"/>
    `;
  }

  /* Crown Hair / Cultural Headwear */
  let crownSvg = '';
  if (isBaby) {
    crownSvg = `<path d="M46,31 Q50,24 54,30 Q51,34 48,33" fill="none" stroke="${hair.main}" stroke-width="2" stroke-linecap="round"/>`;
  } else if (wearsHijab) {
    crownSvg = `
      <path d="M27,43 C28,20 72,20 73,43 C73,57 66,69 50,72.5 C34,69 27,57 27,43 Z" fill="none" stroke="${hijab.main}" stroke-width="5.2"/>
      <path d="M29,35 Q50,24 71,35 L73,26 C64,17 36,17 27,26 Z" fill="${hijab.main}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M25,65 Q50,82 75,65 L78,82 Q50,94 22,82 Z" fill="${hijab.main}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M31,73 Q50,84 69,73" fill="none" stroke="${hijab.fold}" stroke-width="1.2"/>
    `;
  } else if (wearsAnyGulfHead) {
    const topFill = wearsShemagh ? `url(#shemagh_${uid})` : '#FFFFFF';
    crownSvg = `
      <path d="M26,35 Q50,24 74,35 L73,24 C62,16 38,16 27,24 Z" fill="${topFill}" stroke="${ink}" stroke-width="1.4"/>
      <rect x="28" y="21.5" width="44" height="5.2" rx="2.6" fill="#141413" stroke="${ink}" stroke-width="1"/>
      <line x1="30" y1="24" x2="70" y2="24" stroke="#3F3F46" stroke-width="0.8"/>
    `;
  } else if (hStyle === 5) {
    // Silk Chignon Updo
    crownSvg = `
      <circle cx="50" cy="16" r="8.8" fill="${hair.main}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M29.5,41 C30.5,20 69.5,20 70.5,41 C62,30 38,30 29.5,41 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M36,26 Q50,22 64,26" fill="none" stroke="${hair.hi}" stroke-width="1.1" opacity="0.6"/>
    `;
  } else if (hStyle === 1) {
    // Textured Curls
    crownSvg = `
      <path d="M28.5,39 C26.5,22 36.5,17 44.5,20 C50,15.5 57.5,17 63,21 C70,19.5 73.5,27 71.5,39 C62,30 38,30 28.5,39 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M35,24 Q42,20 49,23 M52,22 Q59,19 65,25" fill="none" stroke="${hair.hi}" stroke-width="1.1" opacity="0.6"/>
    `;
  } else if (hStyle === 2) {
    // Executive Slick-Back
    crownSvg = `
      <path d="M29.5,40 C29.5,19 70.5,19 70.5,40 L69,32 Q50,25 31,32 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M36,24 L40,29 M46,21 L48,27 M56,21 L54,27 M64,24 L60,29" stroke="${hair.hi}" stroke-width="0.95" opacity="0.6"/>
    `;
  } else if (hStyle === 3) {
    // Cropped Taper Fade
    crownSvg = `
      <path d="M30,38 C31,22.5 69,22.5 70,38 Q50,28.5 30,38 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1.3"/>
    `;
  } else if (hStyle === 7) {
    // Center-Parted Long Layers
    crownSvg = `
      <path d="M28.5,43 C29.5,19.5 70.5,19.5 71.5,43 C63,32 53,31 50,35 C47,31 37,32 28.5,43 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1.4"/>
      <line x1="50" y1="20.5" x2="50" y2="34" stroke="${skin.mid}" stroke-width="1.1"/>
    `;
  } else {
    // Classic Side-Part / Swept Wave
    crownSvg = `
      <path d="M29,40 C30,19.5 70,19.5 71,40 C63,29.5 42,28.5 29,40 Z" fill="${hair.main}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M38,24.5 Q52,21 64,26.5" fill="none" stroke="${hair.hi}" stroke-width="1.1" opacity="0.6"/>
    `;
  }

  const filterStyle = !person.alive ? ' style="filter:grayscale(0.92);opacity:0.75"' : '';

  return `<svg class="wl-portrait" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${esc(person.fullName)}"${filterStyle}>
    <defs>
      <clipPath id="clip_${uid}">
        <rect x="3" y="3" width="94" height="94" rx="22"/>
      </clipPath>
      <radialGradient id="skinGrad_${uid}" cx="46%" cy="38%" r="64%">
        <stop offset="0%" stop-color="${skin.hi}"/>
        <stop offset="45%" stop-color="${skin.base}"/>
        <stop offset="82%" stop-color="${skin.mid}"/>
        <stop offset="100%" stop-color="${skin.shadow}"/>
      </radialGradient>
      <pattern id="shemagh_${uid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="#FFFFFF"/>
        <rect width="3" height="3" fill="#C83E37" opacity="0.82"/>
        <rect x="3" y="3" width="3" height="3" fill="#C83E37" opacity="0.82"/>
      </pattern>
    </defs>
    <rect x="3" y="3" width="94" height="94" rx="22" fill="${bgFill}"/>
    <circle cx="50" cy="46" r="35" fill="none" stroke="rgba(20,20,19,0.06)" stroke-width="0.85"/>
    <g clip-path="url(#clip_${uid})">
      ${backHairSvg}
      ${shouldersSvg}
      ${neckSvg}
      ${earsSvg}
      ${facePlanesSvg}
      ${eyesAndBrowsSvg}
      ${noseSvg}
      ${mouthSvg}
      ${extrasSvg}
      ${crownSvg}
    </g>
    <rect x="3" y="3" width="94" height="94" rx="22" fill="none" stroke="rgba(20,20,19,0.22)" stroke-width="1.45"/>
  </svg>`;
}
