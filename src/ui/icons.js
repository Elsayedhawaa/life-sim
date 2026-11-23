/* ============================================================================
   World Life Complete Edition — Crafted Duotone Editorial Game Icon Set
   Layered two-tone architectural & editorial vector icons (warm accents + ink).
   ========================================================================== */

const PATHS = {
  life: `
    <path d="M6.5 2.5H19.5V19.5H6.5A2.5 2.5 0 0 1 4 17V5A2.5 2.5 0 0 1 6.5 2.5Z" fill="currentColor" fill-opacity="0.14"/>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2.5H20v19H6.5A2.5 2.5 0 0 1 4 19V5A2.5 2.5 0 0 1 6.5 2.5z"/>
    <path d="M8.5 7h7.5M8.5 10.5h6M8.5 14h4"/>
  `,
  people: `
    <circle cx="9" cy="8" r="3.3" fill="currentColor" fill-opacity="0.18"/>
    <circle cx="17" cy="9" r="2.5" fill="currentColor" fill-opacity="0.12"/>
    <circle cx="9" cy="8" r="3.3"/><path d="M2.8 20c.7-3.5 2.9-5.3 6.2-5.3s5.5 1.8 6.2 5.3"/>
    <circle cx="17" cy="9" r="2.5"/><path d="M15.5 20c.5-2.4 1.9-3.9 4.2-4.2"/>
  `,
  work: `
    <rect x="3" y="7" width="18" height="13" rx="2.2" fill="currentColor" fill-opacity="0.14"/>
    <rect x="3" y="7" width="18" height="13" rx="2.2"/>
    <path d="M8.5 7V5a1.8 1.8 0 0 1 1.8-1.8h3.4A1.8 1.8 0 0 1 15.5 5v2"/>
    <path d="M3 12.2h18"/><rect x="10.5" y="10.8" width="3" height="2.8" rx="0.6" fill="currentColor"/>
  `,
  realestate: `
    <polygon points="12 3 21 10 19 10 19 20 5 20 5 10 3 10" fill="currentColor" fill-opacity="0.15"/>
    <path d="M2.5 10.5L12 3l9.5 7.5"/><path d="M5 9.5V20h14V9.5"/>
    <rect x="9.5" y="13.5" width="5" height="6.5"/><path d="M8.5 9.5h7"/>
  `,
  wealth: `
    <polygon points="12 3.5 20.5 9.5 18.5 9.5 18.5 19.5 5.5 19.5 5.5 9.5 3.5 9.5" fill="currentColor" fill-opacity="0.15"/>
    <path d="M3 9.5L12 3.5l9 6"/><path d="M5.5 9.5V19.5h13V9.5"/><path d="M9.5 19.5v-5h5v5"/>
  `,
  finance: `
    <polygon points="12 2.8 21 8 3 8" fill="currentColor" fill-opacity="0.18"/>
    <polygon points="12 2.8 21 8 3 8"/><path d="M3 20.2h18M4.5 17.5h15"/>
    <path d="M6.5 8v9.5M10.2 8v9.5M13.8 8v9.5M17.5 8v9.5"/>
  `,
  lifestyle: `
    <path d="M5.8 7.5h12.4l1.4 12.5H4.4L5.8 7.5z" fill="currentColor" fill-opacity="0.15"/>
    <path d="M5.8 7.5h12.4l1.4 12.5H4.4L5.8 7.5z"/>
    <path d="M8.8 7.5V5.4a3.2 3.2 0 0 1 6.4 0v2.1"/><circle cx="9.2" cy="11" r="0.8"/><circle cx="14.8" cy="11" r="0.8"/>
  `,
  world: `
    <circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.13"/>
    <circle cx="12" cy="12" r="9"/><path d="M3.2 12h17.6"/><path d="M4.8 7.5h14.4M4.8 16.5h14.4"/>
    <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>
  `,
  plus: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.16"/><path d="M12 6.5v11M6.5 12h11"/>',
  fastforward: '<polygon points="4.5 5.5 12.5 12 4.5 18.5 4.5 5.5" fill="currentColor" fill-opacity="0.2"/><polygon points="4.5 5.5 12.5 12 4.5 18.5 4.5 5.5"/><polygon points="12.5 5.5 20.5 12 12.5 18.5 12.5 5.5" fill="currentColor" fill-opacity="0.2"/><polygon points="12.5 5.5 20.5 12 12.5 18.5 12.5 5.5"/>',
  heart: '<path d="M12 20.5S3.5 15 3.5 9.3A4.6 4.6 0 0 1 8.1 4.7c1.6 0 3 .8 3.9 2.1.9-1.3 2.3-2.1 3.9-2.1a4.6 4.6 0 0 1 4.6 4.6C20.5 15 12 20.5 12 20.5z" fill="#C84B31" fill-opacity="0.2"/><path d="M12 20.5S3.5 15 3.5 9.3A4.6 4.6 0 0 1 8.1 4.7c1.6 0 3 .8 3.9 2.1.9-1.3 2.3-2.1 3.9-2.1a4.6 4.6 0 0 1 4.6 4.6C20.5 15 12 20.5 12 20.5z"/>',
  ring: '<circle cx="12" cy="14.2" r="5.8" fill="#B67D1E" fill-opacity="0.15"/><circle cx="12" cy="14.2" r="5.8"/><polygon points="9.2 8.4 12 3.8 14.8 8.4" fill="#7DD3FC" fill-opacity="0.45"/><polygon points="9.2 8.4 12 3.8 14.8 8.4"/>',
  gold: '<polygon points="3.5 17.5 6.5 10.5 12.5 10.5 14.8 17.5" fill="#FBBF24" fill-opacity="0.35"/><polygon points="9.5 17.5 11.8 10.5 17.8 10.5 20.5 17.5" fill="#F59E0B" fill-opacity="0.35"/><polygon points="3.5 17.5 6.5 10.5 12.5 10.5 14.8 17.5"/><polygon points="9.5 17.5 11.8 10.5 17.8 10.5 20.5 17.5"/><path d="M2.5 20h19"/>',
  passport: '<rect x="5" y="2.8" width="14" height="18.4" rx="2" fill="#1D3557" fill-opacity="0.15"/><rect x="5" y="2.8" width="14" height="18.4" rx="2"/><circle cx="12" cy="10.2" r="3.2"/><path d="M8.8 10.2h6.4M12 7v6.4M8.5 17h7"/>',
  plane: '<path d="M21 3.8L3 10.8l7.2 2.6L13 20.2l2.6-6.2L21 3.8z" fill="currentColor" fill-opacity="0.16"/><path d="M21 3.8L3 10.8l7.2 2.6L13 20.2l2.6-6.2L21 3.8z"/>',
  graduation: '<polygon points="2 9.5 12 4.8 22 9.5 12 14.2" fill="currentColor" fill-opacity="0.18"/><polygon points="2 9.5 12 4.8 22 9.5 12 14.2"/><path d="M6 11.6V17c0 1.6 2.7 3 6 3s6-1.4 6-3v-5.4M22 9.5v6"/>',
  hospital: '<rect x="4" y="3" width="16" height="18" rx="2.2" fill="#1B734E" fill-opacity="0.12"/><rect x="4" y="3" width="16" height="18" rx="2.2"/><path d="M12 7.8v8.4M7.8 12h8.4"/>',
  car: '<path d="M5 13l1.8-4.6A2 2 0 0 1 8.7 7h6.6a2 2 0 0 1 1.9 1.4L19 13" fill="#7DD3FC" fill-opacity="0.28"/><rect x="2.8" y="13" width="18.4" height="5" rx="1.6" fill="currentColor" fill-opacity="0.16"/><path d="M5 13l1.8-4.6A2 2 0 0 1 8.7 7h6.6a2 2 0 0 1 1.9 1.4L19 13"/><rect x="2.8" y="13" width="18.4" height="5" rx="1.6"/><circle cx="7.2" cy="18.2" r="1.8"/><circle cx="16.8" cy="18.2" r="1.8"/>',
  gavel: '<path d="M13.8 3.8l6.4 6.4-2.8 2.8-6.4-6.4 2.8-2.8z" fill="currentColor" fill-opacity="0.18"/><path d="M13.8 3.8l6.4 6.4-2.8 2.8-6.4-6.4 2.8-2.8z"/><path d="M4.8 19.2l7.6-7.6M3 21h8.5"/>',
  cube3d: '<polygon points="12 2.2 21 7.2 12 12.2 3 7.2" fill="#C84B31" fill-opacity="0.22"/><polygon points="3 7.2 12 12.2 12 21.8 3 16.8" fill="#1D3557" fill-opacity="0.15"/><polygon points="12 2.2 21 7.2 21 16.8 12 21.8 3 16.8 3 7.2"/><polyline points="3 7.2 12 12.2 21 7.2"/><line x1="12" y1="12.2" x2="12" y2="21.8"/>',
  paw: '<circle cx="12" cy="15.5" r="3.6" fill="currentColor" fill-opacity="0.18"/><circle cx="12" cy="15.5" r="3.6"/><circle cx="6.5" cy="10.5" r="1.7"/><circle cx="10" cy="7.5" r="1.7"/><circle cx="14" cy="7.5" r="1.7"/><circle cx="17.5" cy="10.5" r="1.7"/>',
  check: '<path d="M4.5 12.5L9.5 17.5 19.5 6.5"/>',
  alert: '<polygon points="12 3.8 21.2 20 2.8 20" fill="#B42318" fill-opacity="0.15"/><polygon points="12 3.8 21.2 20 2.8 20"/><path d="M12 9.8v4.6M12 17.4h.01"/>',
  spark: '<path d="M12 2.8l2.3 6.5 6.5 2.3-6.5 2.3L12 20.4l-2.3-6.5-6.5-2.3 6.5-2.3L12 2.8z" fill="#B67D1E" fill-opacity="0.24"/><path d="M12 2.8l2.3 6.5 6.5 2.3-6.5 2.3L12 20.4l-2.3-6.5-6.5-2.3 6.5-2.3L12 2.8z"/>',
  shield: '<path d="M12 2.8l7.2 3v5.7c0 4.7-3.1 8-7.2 9.7-4.1-1.7-7.2-5-7.2-9.7V5.8l7.2-3z" fill="#1B734E" fill-opacity="0.16"/><path d="M12 2.8l7.2 3v5.7c0 4.7-3.1 8-7.2 9.7-4.1-1.7-7.2-5-7.2-9.7V5.8l7.2-3z"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4.5h-4.5"/>',
  gift: '<rect x="4" y="10" width="16" height="10" rx="1.6" fill="#C84B31" fill-opacity="0.16"/><rect x="4" y="10" width="16" height="10" rx="1.6"/><path d="M12 10v10M3 10h18"/><path d="M12 10c-2 0-4.5-1-4.5-3S9.5 4.5 12 7c2.5-2.5 4.5-2 4.5 0S14 10 12 10z"/>'
};

export function icon(name, size = 18, extraClass = '') {
  const inner = PATHS[name] || PATHS.spark;
  const cls = extraClass ? ` class="wl-icon ${extraClass}"` : ' class="wl-icon"';
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
