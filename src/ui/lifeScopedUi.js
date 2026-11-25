/* Filters and searches that describe one life's records. A new life (or the next generation) starts with none of them applied,
   so the journal and ledger never open already narrowed by the last life's search. */
export const LIFE_SCOPED_UI_DEFAULTS = { journalType: 'all', journalQuery: '', journalYear: 'all', ledgerFilter: 'all', jobQuery: '', jobOnlyQualified: false, bizQuery: '' };
export function resetLifeScopedUi(uiState) {
  if (!uiState) return uiState;
  for (const [k, v] of Object.entries(LIFE_SCOPED_UI_DEFAULTS)) uiState[k] = v;
  return uiState;
}
