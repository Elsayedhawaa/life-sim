/* A finished life (S.gameOver) must not take new money or story actions. Only reading, navigation,
   the next-generation choice and starting a new life stay open. */
export const DEAD_LIFE_ALLOWED_ACTIONS = new Set([
  'switch-tab','switch-subtab','biz-tab','toggle-theme','open-new-life','close-new-life','continue-as-child',
  'dismiss-turn-result','set-journal-filter','set-ledger-filter','zoom-floorplan','close-room-detail','room-info',
  'estate-review','journal-react','clear-compare','open-study-abroad','set-arch-view','set-cad-floor',
  'toggle-cad-cyan','toggle-cad-mep','set-solar-time','toggle-affordable-only','toggle-job-qual','open-card',
  'compare-listing','compare-shop-item','compare-trip','shop-category','advance-one','fast-forward-year'
]);
export const DEAD_LIFE_MESSAGE = 'This life has ended. Start a new life or continue as a child to take actions.';
export function deadLifeBlocks(S, action) {
  return !!(S && S.gameOver && !DEAD_LIFE_ALLOWED_ACTIONS.has(action));
}
