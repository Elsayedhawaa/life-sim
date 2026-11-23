// Shared feature detection for old saves and newly purchased catalog homes.
export function propertyOutdoorFeatures(home = {}) {
  const description = `${home.unitId || ''} ${home.name || ''}`.toLowerCase();
  const upgrades = home.upgrades || [];
  return {
    hasPool: home.hasPool === true || upgrades.includes('pool') || /private pool|with pool|w\/.*pool|twin_villa_pool/.test(description),
    hasGarden: home.hasGarden === true || /garden|courtyard/.test(description)
  };
}
export function renderOutdoorPlanHtml(home = {}, country = '') {
  const {hasPool,hasGarden} = propertyOutdoorFeatures(home);
  if (!hasPool && !hasGarden) return '';
  const dry = ['sau','uae','egy'].includes(country);
  return `<section class="outdoor-plan" style="margin-top:12px;padding:12px;border:1px solid #c9c2b5;border-radius:12px;background:#fcfbf7;color:#292524"><h4 style="margin:0 0 8px">Outdoor space</h4>
    <svg viewBox="0 0 360 170" width="100%" role="img" aria-label="${hasGarden?'Garden':''}${hasGarden&&hasPool?' and ':''}${hasPool?'private pool':''} layout diagram">
      <rect x="4" y="4" width="352" height="162" rx="8" fill="${dry?'#ede4cf':'#e7eddf'}" stroke="#716654" stroke-width="2"/>
      <rect x="18" y="18" width="122" height="62" fill="#f8f4e8" stroke="#716654"/><text x="79" y="53" text-anchor="middle" font-size="14" fill="#292524">Home entrance</text>
      <path d="M79 80V146H336" fill="none" stroke="#c5b493" stroke-width="15"/>
      ${hasGarden?`<g fill="#a0ac7b" stroke="#596548" stroke-width="1.5"><circle cx="174" cy="37" r="19"/><circle cx="218" cy="34" r="17"/><circle cx="36" cy="115" r="16"/><circle cx="310" cy="35" r="19"/></g><text x="180" y="91" font-size="13" text-anchor="middle" fill="#425039">${dry?'Shaded planted garden':'Garden'}</text>`:''}
      ${hasPool?'<rect x="228" y="91" width="106" height="45" rx="5" fill="#aed7db" stroke="#477e88" stroke-width="2"/><path d="M240 106q12-6 24 0t24 0t24 0M240 121q12-6 24 0t24 0t24 0" fill="none" stroke="#6b9fa6"/><text x="281" y="158" text-anchor="middle" font-size="13" fill="#292524">Private pool</text>':''}
    </svg><p style="font-size:0.75rem;line-height:1.5;margin:6px 0 0">Illustrative outdoor layout, not to scale. Outdoor area is not added to the indoor room total.</p></section>`;
}
