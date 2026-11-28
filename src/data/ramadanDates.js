/* Real Ramadan start (Umm al-Qura calendar, same as published dates, e.g. 13 Apr 2021, 18 Feb 2026) computed with the platform's Islamic calendar. Returns the Gregorian month 1-12 in which Ramadan begins, or 0 if the runtime has no such calendar. */
const cache = {};
export function ramadanStartMonth(year) {
  if (cache[year] != null) return cache[year];
  let res = 0;
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { timeZone: 'UTC', month: 'numeric', day: 'numeric' });
    for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d = new Date(d.getTime() + 864e5)) {
      const p = f.formatToParts(d); const m = p.find(x => x.type === 'month')?.value, dd = p.find(x => x.type === 'day')?.value;
      if (Number(m) === 9 && Number(dd) === 1) { res = d.getUTCMonth() + 1; break; }
    }
  } catch (e) { res = 0; }
  return (cache[year] = res);
}
/* True when this turn is the month Ramadan starts (or any turn of a yearly-paced childhood year, or when the calendar is unavailable). */
export function ramadanBeginsNow(S) {
  if (S.pacing === 'yearly') return true;
  const m = ramadanStartMonth(S.year);
  return !m || m === S.month;
}
