/* ============================================================================
   World Life — ICAO Doc 9303 Biometric e-Passport, Visa Stamp Booklet & Deeds
   - Gold-foil National Coat of Arms Cover Spine + Biometric Chip [─●─]
   - Polycarbonate Guilloche Security Data Page + 44-char 2-line OCR-B MRZ
   - Facing Visa & Immigration Stamp Ledger (real airport codes, Iqama/Schengen/
     B1-B2 foils, Hajj Nusuk entry stamp, Henley Mobility Score & Military Exit)
   - Supports Dual / Multiple Passports side-by-side!
   ========================================================================== */

import { getCountry, formatMoney } from '../data/countries.js';
import { childPocketMoneyMonthly } from '../systems/economyEngine.js';
import { renderPortraitSvg } from './portraits.js';
import { renderWorldMapHtml } from './worldMap.js';

const PASSPORT_SPECS = {
  egy: { cover: '#183D2C', authority: 'MINISTRY OF INTERIOR · CAIRO', visaFree: 52,  coat: 'eagle', arabicTitle: 'جمهورية مصر العربية' },
  sau: { cover: '#124529', authority: 'JAWAZAT · RIYADH',             visaFree: 89,  coat: 'palmswords', arabicTitle: 'المملكة العربية السعودية' },
  uae: { cover: '#162F4F', authority: 'ICP FEDERAL AUTHORITY · ABU DHABI', visaFree: 185, coat: 'falcon', arabicTitle: 'الإمارات العربية المتحدة' },
  gbr: { cover: '#162438', authority: 'HM PASSPORT OFFICE · LONDON',  visaFree: 190, coat: 'crown' },
  usa: { cover: '#18243A', authority: 'U.S. DEPT OF STATE',           visaFree: 188, coat: 'seal' },
  deu: { cover: '#681D2B', authority: 'BUNDESDRUCKEREI · BERLIN',     visaFree: 194, coat: 'eagle' },
  fra: { cover: '#681D2B', authority: 'RÉPUBLIQUE FRANÇAISE · PARIS', visaFree: 194, coat: 'crest' },
  ita: { cover: '#681D2B', authority: 'MINISTERO DEGLI AFFARI ESTERI',visaFree: 194, coat: 'crest' },
  nld: { cover: '#681D2B', authority: 'KONINKRIJK DER NEDERLANDEN',   visaFree: 193, coat: 'crown' },
  can: { cover: '#192638', authority: 'IRCC · OTTAWA',                visaFree: 188, coat: 'maple' },
  aus: { cover: '#173152', authority: 'DFAT · CANBERRA',              visaFree: 189, coat: 'crest' },
  jpn: { cover: '#8A1C22', authority: 'MINISTRY OF FOREIGN AFFAIRS',  visaFree: 194, coat: 'chrysanthemum' },
  sgp: { cover: '#B02E24', authority: 'ICA · SINGAPORE',              visaFree: 195, coat: 'crest' },
  bra: { cover: '#1B3B61', authority: 'POLÍCIA FEDERAL · BRASÍLIA',   visaFree: 173, coat: 'crest' },
  ind: { cover: '#1A2A3E', authority: 'REPUBLIC OF INDIA · MEA',      visaFree: 62,  coat: 'pillar' }
};

const AIRPORT_CODES = {
  egy: 'CAI · CAIRO INTL',
  sau: 'RUH · KING KHALID',
  uae: 'DXB · DUBAI INTL',
  gbr: 'LHR · HEATHROW T5',
  usa: 'JFK · NEW YORK',
  deu: 'BER · BRANDENBURG',
  fra: 'CDG · PARIS',
  ita: 'FCO · FIUMICINO',
  nld: 'AMS · SCHIPHOL',
  can: 'YYZ · TORONTO',
  aus: 'SYD · KINGSFORD',
  jpn: 'HND · TOKYO HANEDA',
  sgp: 'SIN · CHANGI',
  bra: 'GRU · SÃO PAULO',
  ind: 'DEL · INDIRA GANDHI'
};

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderGoldCoatOfArmsSvg(coat = 'eagle') {
  const gold = '#E8C872';
  if (coat === 'palmswords') {
    return `
      <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
        <line x1="24" y1="8" x2="24" y2="27" stroke="${gold}" stroke-width="2.2"/>
        <path d="M24,10 Q14,8 11,16 M24,10 Q34,8 37,16 M24,13 Q15,14 14,21 M24,13 Q33,14 34,21" fill="none" stroke="${gold}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M10,36 L38,24 M38,36 L10,24" stroke="${gold}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
  if (coat === 'chrysanthemum') {
    return `
      <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
        <circle cx="24" cy="24" r="14" fill="none" stroke="${gold}" stroke-width="1.6"/>
        <circle cx="24" cy="24" r="5" fill="${gold}"/>
        ${Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return `<line x1="24" y1="24" x2="${(24 + Math.cos(a) * 14).toFixed(1)}" y2="${(24 + Math.sin(a) * 14).toFixed(1)}" stroke="${gold}" stroke-width="1.3"/>`;
        }).join('')}
      </svg>
    `;
  }
  // Heraldic Eagle / Falcon / Royal Crest
  return `
    <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
      <path d="M24,7 L29,14 L41,12 L35,25 L38,37 L24,33 L10,37 L13,25 L7,12 L19,14 Z" fill="none" stroke="${gold}" stroke-width="1.6" stroke-linejoin="round"/>
      <rect x="19" y="18" width="10" height="12" rx="2" fill="none" stroke="${gold}" stroke-width="1.5"/>
      <line x1="24" y1="18" x2="24" y2="30" stroke="${gold}" stroke-width="1.2"/>
    </svg>
  `;
}

function buildMrzLines(passCountryCode, player, docNo, issuedYear, expiresYear, seed) {
  const cc = String(passCountryCode || 'EGY').toUpperCase().padEnd(3, '<').slice(0, 3);
  const fam = String(player.familyName || 'CITIZEN').toUpperCase().replace(/[^A-Z]/g, '');
  const giv = String(player.firstName || 'PLAYER').toUpperCase().replace(/[^A-Z]/g, '');
  const line1Body = `P<${cc}${fam}<<${giv}`;
  const line1 = line1Body.padEnd(44, '<').slice(0, 44);

  const yyBirth = String(player.birthYear || 1998).slice(-2);
  const mmBirth = String(((seed % 12) + 1)).padStart(2, '0');
  const ddBirth = String(((seed % 27) + 1)).padStart(2, '0');
  const sex = player.gender === 'f' ? 'F' : 'M';
  const yyExp = String(expiresYear || 2030).slice(-2);
  const cleanDoc = String(docNo).replace(/[^A-Z0-9]/g, '').padEnd(9, '0').slice(0, 9);
  const line2Body = `${cleanDoc}7${cc}${yyBirth}${mmBirth}${ddBirth}4${sex}${yyExp}${mmBirth}${ddBirth}8`;
  const line2 = (line2Body.padEnd(42, '<') + '06').slice(0, 44);
  return [line1, line2];
}

/* v2.13 Worker 3 — compact drawn passport booklet(s): the player's own
   passport as a small book, one per passport held. Drawn HTML/CSS only, no
   image file. Shows the country, the ink portrait, full name, year of
   birth and birthplace, issue/expiry years, and every citizenship held.
   The passport record is { country, issuedYear, expiresYear } — it has NO
   number field, so no number is shown here (none is invented). The full
   ICAO data-page spread with its derived document number still renders
   below, unchanged. */
export function renderPassportVisualHtml(S) {
  const passports = S.legal.passports?.length
    ? S.legal.passports
    : [{ country: S.homeCountry, issuedYear: S.year, expiresYear: S.year + 7 }];
  const citizenshipNames = (S.legal.citizenships || [S.homeCountry])
    .map(c => getCountry(c).name).join(', ');
  const booklets = passports.map(pp => {
    const passCountry = getCountry(pp.country);
    const spec = PASSPORT_SPECS[pp.country] || PASSPORT_SPECS.usa;
    const expired = pp.expiresYear <= S.year;
    let coverColor = spec.cover;
    if (pp.country === 'gbr' && pp.issuedYear < 2020) coverColor = '#681D2B';
    return `
      <div class="wl-passport-visual" style="display:grid;grid-template-columns:150px 1fr;border:1.5px solid rgba(20,20,19,0.34);border-radius:12px;overflow:hidden;margin-bottom:10px;background:#FCF9F2;box-shadow:0 8px 20px -10px rgba(20,20,19,0.18)">
        <div style="background:${coverColor};color:#E8C872;padding:12px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px">
          ${renderGoldCoatOfArmsSvg(spec.coat)}
          <div style="font-size:0.72rem;font-weight:800;letter-spacing:0.06em;color:#F8E6B0">${esc(passCountry.name.toUpperCase())}</div>
          <div style="font-size:0.62rem;letter-spacing:0.16em;font-weight:800;opacity:0.9">PASSPORT</div>
          ${expired ? `<span style="font-size:0.6rem;font-weight:800;padding:2px 7px;border-radius:4px;background:#B42318;color:#FFF">EXPIRED</span>` : ''}
        </div>
        <div style="padding:10px 14px;display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
          <div style="padding:3px;background:#FFF;border:1px solid rgba(20,20,19,0.22);border-radius:10px">
            ${renderPortraitSvg(S.player, 64, { isMilitaryActive: S.legal.military?.status === 'active_duty' })}
          </div>
          <div style="flex:1;min-width:200px">
            <div style="font-size:0.6rem;font-weight:800;color:#7D7569;letter-spacing:0.08em">PASSPORT HOLDER</div>
            <div style="font-size:1rem;font-weight:800">${esc(S.player.fullName || `${S.player.firstName || ''} ${S.player.familyName || ''}`.trim())}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:4px 12px;margin-top:6px;font-size:0.8rem">
              <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">BORN</span><strong>${S.player.birthYear} · ${esc(S.homeCity || '')}</strong></div>
              <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">NATIONALITY</span><strong>${esc(passCountry.adjective)}</strong></div>
              <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">ISSUED → EXPIRES</span><strong class="mono">${pp.issuedYear} → ${pp.expiresYear}</strong></div>
              <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">ISSUING AUTHORITY</span><strong style="font-size:0.72rem">${esc(spec.authority)}</strong></div>
            </div>
            <div style="margin-top:6px;font-size:0.8rem"><span style="font-size:0.6rem;font-weight:800;color:#7D7569">CITIZENSHIPS HELD: </span><strong>${esc(citizenshipNames)}</strong></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  return `
    <div style="margin-bottom:6px">
      <h3 style="margin:0 0 6px;font-size:0.95rem">Your passport${passports.length > 1 ? `s (${passports.length})` : ''}</h3>
      ${booklets}
    </div>
  `;
}

export function renderPassportDocumentHtml(S) {
  const passports = S.legal.passports?.length
    ? S.legal.passports
    : [{ country: S.homeCountry, issuedYear: S.year, expiresYear: S.year + 7 }];

  const hostCountry = getCountry(S.country);
  const res = S.legal.residency;
  const touristVisas = S.legal.touristVisas || [];

  /* Collect authentic passport stamps from residency, Hajj/Umrah, tourist visas & home border */
  const stamps = [];
  stamps.push({
    port: AIRPORT_CODES[S.homeCountry] || 'BORDER CONTROL',
    kind: 'ORIGIN REGISTERED',
    year: S.player.birthYear,
    color: '#1D3557',
    rot: -3
  });
  if (S.country !== S.homeCountry) {
    stamps.push({
      port: AIRPORT_CODES[S.country] || `${hostCountry.flagCode} ENTRY`,
      kind: res.permitName ? res.permitName.slice(0, 22).toUpperCase() : 'ENTRY ADMITTED',
      year: S.year,
      color: '#186A47',
      rot: 2
    });
  }
  if (S.credentials?.hajjCompleted) {
    stamps.push({
      port: 'JED · KING ABDULAZIZ',
      kind: 'NUSUK HAJJ MABROOR',
      year: S.year,
      color: '#124529',
      rot: -2
    });
  } else if ((S.credentials?.umrahCount || 0) > 0) {
    stamps.push({
      port: 'MED · MADINAH INTL',
      kind: `UMRAH PILGRIM (×${S.credentials.umrahCount})`,
      year: S.year,
      color: '#124529',
      rot: 3
    });
  }
  for (const tv of touristVisas.slice(0, 4)) {
    stamps.push({
      port: `${tv.regionLabel.toUpperCase()} CONSULATE`,
      kind: `VISA VALID → ${tv.expiresYear}`,
      year: tv.issuedYear,
      color: '#9A3412',
      rot: -2
    });
  }

  const spreads = passports.map((pp, pIdx) => {
    const passCountry = getCountry(pp.country);
    const spec = PASSPORT_SPECS[pp.country] || PASSPORT_SPECS.usa;
    const expired = pp.expiresYear <= S.year;
    let coverColor = spec.cover;
    if (pp.country === 'gbr' && pp.issuedYear < 2020) {
      coverColor = '#681D2B'; // Pre-Brexit burgundy UK passport!
    }
    const icaoCode = pp.country === 'uae' ? 'ARE' : String(pp.country || 'egy').toUpperCase().slice(0, 3);
    const isBiometric = pp.issuedYear >= 2007;
    const docNo = `${icaoCode.slice(0, 2)}${String(((S.seed + pIdx * 9137) % 8999999) + 1000000)}`;
    const [mrz1, mrz2] = buildMrzLines(icaoCode, S.player, docNo, pp.issuedYear, pp.expiresYear, S.seed + pIdx);

    const milStatus = S.legal.military?.applicable && pp.country === S.homeCountry
      ? (S.legal.military.travelPermitted ? 'EXIT PERMIT CLEARED' : 'CONSCRIPTION EXIT HOLD')
      : null;

    return `
      <div class="passport-spread" style="display:grid;grid-template-columns:180px 1fr;border:1.5px solid rgba(20,20,19,0.34);border-radius:14px;overflow:hidden;margin-bottom:14px;box-shadow:0 10px 26px -10px rgba(20,20,19,0.18);background:#FCF9F2">
        <!-- LEFT PANEL: GOLD-FOIL EMBOSSED NATIONAL E-PASSPORT COVER -->
        <div style="background:${coverColor};color:#E8C872;padding:14px 12px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;border-right:2px solid rgba(0,0,0,0.28)">
          <div>
            <div style="font-size:0.62rem;letter-spacing:0.14em;font-weight:800;opacity:0.9">PASSPORT · جواز سفر</div>
            ${spec.arabicTitle ? `<div style="font-size:0.74rem;font-weight:700;margin-top:2px">${esc(spec.arabicTitle)}</div>` : ''}
            <div style="font-size:0.76rem;font-weight:800;letter-spacing:0.06em;margin-top:2px;color:#F8E6B0">${esc(passCountry.name.toUpperCase())}</div>
          </div>

          <div style="margin:8px 0">
            ${renderGoldCoatOfArmsSvg(spec.coat)}
          </div>

          <div style="width:100%">
            <div style="font-family:'JetBrains Mono',monospace;font-size:0.66rem;padding:3px 6px;border-radius:5px;background:rgba(0,0,0,0.24);color:#F8E6B0;margin-bottom:5px">
              GLOBAL MOBILITY: <strong>${spec.visaFree}</strong> VISA-FREE
            </div>
            ${isBiometric ? `
              <div style="display:inline-flex;align-items:center;gap:4px;border:1.2px solid #E8C872;padding:1px 7px;border-radius:3px;font-size:0.6rem;font-weight:800;letter-spacing:0.08em">
                <span>─●─</span><span>BIOMETRIC ICAO</span>
              </div>
            ` : `<div style="font-size:0.6rem;opacity:0.75">MACHINE READABLE</div>`}
          </div>
        </div>

        <!-- RIGHT PANEL: POLYCARBONATE GUILLOCHE DATA PAGE + MRZ + STAMPS -->
        <div style="display:flex;flex-direction:column;justify-content:space-between;background-image:repeating-radial-gradient(circle at 85% 25%, rgba(29,53,87,0.035) 0, rgba(29,53,87,0.035) 1px, transparent 1px, transparent 9px)">
          <div style="padding:12px 15px">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(20,20,19,0.14);padding-bottom:6px;margin-bottom:10px;flex-wrap:wrap;gap:6px">
              <div class="mono" style="font-size:0.68rem;font-weight:800;letter-spacing:0.08em;color:#524C43">
                TYPE <strong>P</strong> · CODE <strong>${esc(passCountry.flagCode)}</strong> · PASSPORT NO. <strong style="color:#141413">${esc(docNo)}</strong>
              </div>
              <span class="doc-stamp doc-stamp-${expired || res.kind === 'undocumented' ? 'bad' : res.kind === 'grace_period' ? 'warn' : 'good'}">
                ${expired ? 'PASSPORT EXPIRED' : esc((res.permitName || 'CITIZEN').toUpperCase().slice(0, 26))}
              </span>
            </div>

            <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
              <div style="position:relative;padding:3px;background:#FFF;border:1px solid rgba(20,20,19,0.22);border-radius:10px">
                ${renderPortraitSvg(S.player, 68, { isMilitaryActive: S.legal.military.status === 'active_duty' })}
              </div>

              <div style="display:grid;grid-template-columns:repeat(3, minmax(110px, 1fr));gap:6px 12px;flex:1">
                <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">SURNAME / اللقب</span><strong style="font-size:0.82rem">${esc((S.player.familyName || '').toUpperCase())}</strong></div>
                <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">GIVEN NAMES / الاسم</span><strong style="font-size:0.82rem">${esc((S.player.firstName || '').toUpperCase())}</strong></div>
                <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">NATIONALITY</span><strong style="font-size:0.82rem">${esc(passCountry.adjective.toUpperCase())}</strong></div>
                <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">YEAR &amp; PLACE OF BIRTH</span><strong class="mono" style="font-size:0.78rem">${S.player.birthYear} · ${esc(S.homeCity.toUpperCase())}</strong></div>
                <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">DATE OF ISSUE / EXPIRY</span><strong class="mono ${expired ? 'text-bad' : ''}" style="font-size:0.78rem">${pp.issuedYear} → ${pp.expiresYear}</strong></div>
                <div><span style="display:block;font-size:0.6rem;font-weight:800;color:#7D7569">ISSUING AUTHORITY</span><strong style="font-size:0.72rem">${esc(spec.authority)}</strong></div>
              </div>
            </div>

            <!-- VISA FOILS & INKED BORDER ENTRY STAMPS BAR -->
            <div style="margin-top:10px;padding-top:8px;border-top:1px dashed rgba(20,20,19,0.16);display:flex;flex-wrap:wrap;gap:7px;align-items:center">
              <span class="mono" style="font-size:0.64rem;font-weight:800;color:#7D7569">VISAS &amp; STAMPS:</span>
              ${stamps.map(st => `
                <span style="display:inline-flex;flex-direction:column;padding:2px 8px;border:1.4px solid ${st.color};border-radius:5px;color:${st.color};font-family:'JetBrains Mono',monospace;font-size:0.61rem;font-weight:800;transform:rotate(${st.rot}deg);background:rgba(255,255,255,0.65)">
                  <span>${esc(st.port)} · ${st.year}</span>
                  <span style="font-size:0.58rem;opacity:0.86">${esc(st.kind)}</span>
                </span>
              `).join('')}
              ${milStatus ? `
                <span style="padding:2px 7px;border:1.4px dashed ${S.legal.military.travelPermitted ? '#186A47' : '#B42318'};border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:0.61rem;font-weight:800;color:${S.legal.military.travelPermitted ? '#186A47' : '#B42318'}">
                  ${milStatus}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- AUTHENTIC 2-LINE ICAO DOC 9303 MACHINE READABLE ZONE (MRZ) -->
          <div style="background:#F2EDE2;border-top:1px solid rgba(20,20,19,0.16);padding:7px 14px;font-family:'JetBrains Mono',monospace;font-size:0.72rem;letter-spacing:0.09em;line-height:1.35;color:#1F1E1C;overflow-x:auto">
            <div>${esc(mrz1)}</div>
            <div>${esc(mrz2)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  /* v2.13 Worker 3 — drawn world map + compact passport booklet(s) first,
     then the existing ICAO data-page spreads, unchanged. */
  return `${renderWorldMapHtml(S)}${renderPassportVisualHtml(S)}${spreads}`;
}

export function renderMarriageContractHtml(S, contract) {
  if (!contract) return '';
  const cObj = getCountry(contract.country || S.country);
  const isArab = ['egy', 'sau', 'uae'].includes(contract.country);
  const title = isArab ? 'MARRIAGE CONTRACT · وثيقة عقد الزواج' : 'OFFICIAL CERTIFICATE OF MARRIAGE';

  return `
    <div class="doc-contract ${isArab ? 'doc-contract-arab' : ''}">
      <div class="doc-contract-header">
        <span class="doc-kicker">${esc(cObj.name.toUpperCase())} CIVIL &amp; PERSONAL STATUS REGISTRY · ${contract.year}</span>
        <h4>${title}</h4>
      </div>
      <div class="doc-contract-parties">
        <strong>${esc(S.player.fullName)}</strong>
        <span>&amp;</span>
        <strong>${esc(contract.spouseName)}</strong>
      </div>
      <div class="doc-contract-terms">
        <div><span>Ceremony</span><strong>${esc(contract.venueLabel)}</strong></div>
        ${contract.shabkaGrams > 0 ? `<div><span>Gold Shabka</span><strong class="mono">${contract.shabkaGrams}g 21K</strong></div>` : ''}
        ${contract.mahrPrompt > 0 ? `<div><span>Prompt Mahr (مقدم)</span><strong class="mono">${esc(formatMoney(contract.mahrPrompt, contract.country))}</strong></div>` : ''}
        ${contract.mahrDeferred > 0 ? `<div><span>Deferred Mahr (مؤخر)</span><strong class="mono">${esc(formatMoney(contract.mahrDeferred, contract.country))}</strong></div>` : ''}
        ${isArab ? `<div><span>Qa'ima Inventory (قائمة المنقولات)</span><strong>${contract.qaimaSigned ? `Signed (${esc(formatMoney(contract.qaimaValueLocal, contract.country))})` : 'Waived'}</strong></div>` : ''}
        ${!isArab ? `<div><span>Matrimonial Property Regime</span><strong>${contract.prenupSigned ? 'Notarized Prenuptial Agreement' : 'Statutory Equitable Sharing'}</strong></div>` : ''}
      </div>
    </div>
  `;
}

export function renderMonthlyCashflowSlipHtml(S) {
  const sum = S.money.lastMonthSummary || { income: 0, tax: 0, housing: 0, living: 0, debt: 0, support: 0, net: 0 };
  const parts = Array.isArray(sum.incomeParts) ? sum.incomeParts.slice() : [];
  const isMinor = S.player.age < 18;
  // v2.7: minors never run the adult monthly settlement, so their recurring
  // income — pocket money from their parents, paid once a year — would
  // otherwise be invisible here even though it is in their ledger. Show it
  // as its monthly rate, labelled as yearly-paid, so the statement always
  // names where a schoolboy's money comes from.
  let incomeTotal = sum.income;
  if (isMinor) {
    const pm = childPocketMoneyMonthly(S);
    if (pm > 0) {
      parts.unshift({ label: `Pocket money from your parents (${formatMoney(pm, S.country)}/month, paid once a year)`, amount: pm });
      incomeTotal += pm;
    }
  }
  // Minors have no settlement net (no bills are charged to them): the net
  // shown is just their own income for the month.
  const netTotal = isMinor ? incomeTotal : sum.net;
  // v2.7: every income line names its source in plain words — never a bare
  // "(Salary, Enterprise, Rentals, Yields)" lump, and never a bare "salary"
  // for a schoolboy. A minor's only recurring income is pocket money from
  // their parents (paid yearly, see settleChildAllowanceYear); the statement
  // now renders for minors too, instead of hiding the money entirely.
  const incomeRows = parts.length > 0
    ? parts.map(p => `<div class="doc-slip-row"><span>${esc(p.label)}</span><strong class="mono text-good">+${formatMoney(p.amount, S.country)}</strong></div>`).join('')
    : (sum.income > 0
      ? `<div class="doc-slip-row"><span>Total income — see your ledger for the breakdown</span><strong class="mono text-good">+${formatMoney(sum.income, S.country)}</strong></div>`
      : '');
  return `
    <div class="doc-slip">
      <div class="doc-slip-head">
        <span>MONTHLY HOUSEHOLD STATEMENT</span>
        <span class="mono">${S.month}/${S.year}</span>
      </div>
      ${isMinor ? `<div class="muted" style="margin-bottom:6px">You are under 18: your parents cover housing, food and school. The money below is your own — pocket money from your parents, gifts and anything you earned.</div>` : ''}
      ${incomeRows}
      ${incomeTotal > 0 ? `<div class="doc-slip-row"><span>Total income${sum.payrollDeductions > 0 ? ' (payroll deductions already taken)' : ''}</span><strong class="mono text-good">+${formatMoney(incomeTotal, S.country)}</strong></div>` : (isMinor ? `<div class="doc-slip-row muted-row"><span>No income of your own yet</span><span class="mono">0 ${getCountry(S.country).currency}</span></div>` : '')}
      ${sum.payrollDeductions > 0 ? `<div class="doc-slip-row muted-row"><span>Payroll tax &amp; social insurance: already withheld, NOT charged again</span><span class="mono">${formatMoney(sum.payrollDeductions, S.country)}</span></div>` : ''}
      ${sum.businessTax > 0 ? `<div class="doc-slip-row"><span>Business income tax</span><strong class="mono">−${formatMoney(sum.businessTax, S.country)}</strong></div>` : ''}
      ${sum.tax > 0 && sum.payrollDeductions == null ? `<div class="muted">Tax and insurance were already accounted for in this saved statement. Advance a month for the separate payroll and business breakdown.</div>` : ''}
      <div class="doc-slip-row"><span>Housing (Lease / Aqsat / Mortgage / Staff)</span><strong class="mono">−${formatMoney(sum.housing, S.country)}</strong></div>
      <div class="doc-slip-row"><span>Living Basket, Tuition, Insurance &amp; Vehicles</span><strong class="mono">−${formatMoney(sum.living, S.country)}</strong></div>
      ${sum.support > 0 ? `<div class="doc-slip-row"><span>Family Remittances &amp; Expat Dependent Levies</span><strong class="mono">−${formatMoney(sum.support, S.country)}</strong></div>` : ''}
      ${sum.debt > 0 ? `<div class="doc-slip-row"><span>Bank Loans &amp; Split Installments</span><strong class="mono">−${formatMoney(sum.debt, S.country)}</strong></div>` : ''}
      <div class="doc-slip-total">
        <span>Monthly Net Cashflow</span>
        <strong class="mono ${netTotal >= 0 ? 'text-good' : 'text-bad'}">${netTotal >= 0 ? '+' : ''}${formatMoney(netTotal, S.country)}</strong>
      </div>
    </div>
  `;
}
