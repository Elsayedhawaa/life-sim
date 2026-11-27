/* Software and tech pay outside the USA. The career tracks price software work as the country's entry wage times a track multiplier (tech 2, software 1.48) times a rung multiplier (up to 7.33). That fits the USA, where a junior developer earns about twice a graduate wage. It does not fit countries where tech pays close to the graduate wage. Published figures (recorded in tests/v221-tech-pay-shape.test.js):
   Italy: junior 25-36k EUR against a 28k entry tier. Germany: junior 42-47k EUR against a 42k entry tier. Japan: typical developer 4M yen at three years' experience against a 3.8M entry tier.
   UK: junior 30-40k GBP, senior 55-65k, tech lead 65-75k, CTO 100k+ against a 28k entry tier (embstalent.co.uk 2025 guide). France: junior 32-46k EUR (vocaneo.com), median junior 45k (fr.talent.com) against a 34k entry tier. Canada: junior 47-64k CAD (glassdoor.ca), all-level software developer median 50 CAD/h and high 79 CAD/h (jobbank.gc.ca) against a 50k entry tier.
   Sweden: software and systems developers median 53,500 SEK a month, P10 39,600, P90 72,600 (SCB 2025 via yrkesstatistik.se/lon/2512/) against a 30k a month (360k a year) entry tier. Australia: entry 80-90k AUD (softwareengineersalary.com), Brisbane junior 60-80k, senior 110-150k, against a 62k entry tier. Netherlands: junior 35-45k EUR, medior 45-65k, senior 70-90k (searchxrecruitment.com) against a 40k entry tier.
   GAME DESIGN (not a real-world figure): for these countries the whole track premium (track multiplier x rung multiplier, minus 1) is multiplied by 0.15 (Italy, Germany, Japan) or 0.2 (UK, France, Canada, Sweden, Australia) or 0.15 (Netherlands). Other countries keep the old shape, as no source was checked for them. Egypt keeps its steep ladder, which matches Egyptian reports (junior 7-12k EGP a month, senior 500k+ a year). */
export const TECH_PAY_TRACKS = ['tech', 'software', 'web_development', 'mobile_app_development', 'cloud_devops_engineer', 'ai_ml', 'ai_automation', 'cybersecurity', 'cybersecurity_analyst'];
export const TECH_PREMIUM_SHARE = { ita: 0.15, deu: 0.15, jpn: 0.15, gbr: 0.2, fra: 0.2, can: 0.2, swe: 0.2, aus: 0.2, nld: 0.15, che: 0.5 };

/* Starting pay of nurses and teachers, from published public pay scales. The tracks price them as the country's generic entry wage times 0.78 (nursing) or 0.88 (teaching) times a rung multiplier, which is far under the published start in the countries below:
   Nurse start: USA 66,030 USD (BLS OEWS May 2024, 10th percentile for registered nurses; the median is 97,550, bls.gov/ooh/healthcare/registered-nurses.htm). UK 31,049 GBP (NHS Agenda for Change band 5 entry, 2025/26, nhsemployers.org/articles/pay-scales-202526). Germany 40,976 EUR a year (TVöD P7 step 2, 3,414.69 a month, mein-tvoed.de/tvoed/p7).
   Teacher start: UK 32,916 GBP (England main pay range minimum, September 2025). Australia 90,177 AUD (NSW public schools new graduate, education.nsw.gov.au/teach-nsw/explore-teaching/salary-of-a-teacher; other states pay less).
   GAME DESIGN: the factor lifts the starting rung to the published figure, then fades to nothing at a rung multiplier of 2.5, so managers and heads are not inflated. Other countries are unchecked and keep the old shape. */
const START_ANCHOR = {
  nursing: { ref: 1, factors: { usa: 66030 / (48000 * 0.78), gbr: 31049 / (28000 * 0.78), deu: 40976 / (42000 * 0.78) } },
  teaching: { ref: 1.18, factors: { gbr: 32916 / (28000 * 0.88 * 1.18), aus: 90177 / (62000 * 0.88 * 1.18) } },
};
/* USA doctors and lawyers, annual targets by rung multiplier (the rung's own multiplier, so the same rung is hit at any era).
   Medicine: intern 71,040 (AAMC PGY-1 mean as of July 2026, via doctorsalaries.org/residency-salary/), resident physician 82,000 (rounded from the AAMC PGY-3 to PGY-6 means of 76,044 to 87,183, same page), specialist 275,930 (BLS physicians and surgeons median, May 2025, bls.gov/ooh/healthcare/physicians-and-surgeons.htm). Rungs above stay on the old line.
   Law: junior 99,760 (BLS OEWS lawyers 25th percentile, May 2024, via factanker.com), senior counsel 159,670 (BLS lawyers median, May 2025, bls.gov/ooh/legal/lawyers.htm). GAME DESIGN: the associate-counsel rung is set to 126,000, the geometric mean of those two. Partner rungs stay on the old line. */
const RUNG_TARGET = {
  medicine: { usa: { 0.72: 71040, 1.35: 82000, 2.55: 275930 }, payMult: 1.52 },
  law: { usa: { 0.85: 99760, 1.45: 126000, 2.35: 159670 }, payMult: 1.2 },
};
function anchorBoost(country, trackId, rungMult) {
  const rt = RUNG_TARGET[trackId];
  const target = rt && rt[country] && rt[country][rungMult];
  if (target) return target / (48000 * rt.payMult * rungMult);
  const a = START_ANCHOR[trackId];
  const f = a && a.factors[country];
  if (!f) return 1;
  const w = Math.max(0, Math.min(1, (2.5 - (rungMult || 1)) / (2.5 - a.ref)));
  return 1 + (f - 1) * w;
}

export function payShape(country, trackId, payMult, rungMult) {
  const raw = (payMult || 1) * (rungMult || 1);
  const boost = anchorBoost(country, trackId, rungMult);
  const share = TECH_PREMIUM_SHARE[country];
  if (share == null || !TECH_PAY_TRACKS.includes(trackId) || raw <= 1) return raw * boost;
  return (1 + (raw - 1) * share) * boost;
}
/* The pay ratio of moving from one rung to another on a track in this country. */
export function payRatio(country, trackId, payMult, fromRungMult, toRungMult) {
  return payShape(country, trackId, payMult, toRungMult) / payShape(country, trackId, payMult, fromRungMult || 1);
}
