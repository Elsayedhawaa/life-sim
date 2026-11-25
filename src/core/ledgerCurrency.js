/* Ledger lines keep the currency they were written in (entry.currency). Readers that add lines together or compare them with today's balance
   use these helpers, so amounts from before a move abroad are converted at that line's year and never summed as if they were one currency. The stored ledger is never changed. */
import { COUNTRIES, getCountry } from '../data/countries.js';
import { convertCurrency } from '../data/economy.js';
const idFor = code => Object.keys(COUNTRIES).find(id => COUNTRIES[id].currency === code) || null;
export function entryCurrencyIsCurrent(S, e) { return !e || !e.currency || e.currency === getCountry(S.country).currency; }
export function entryInCurrent(S, v, e) {
  const n = Number(v) || 0; if (entryCurrencyIsCurrent(S, e)) return n;
  const from = idFor(e.currency); if (!from) return n;
  return Math.round(convertCurrency(n, from, S.country, Number(e.year) || S.year) * 100) / 100;
}
export const entryDelta = (S, e) => entryInCurrent(S, e?.delta, e);
