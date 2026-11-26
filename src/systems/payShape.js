/* Software and tech pay outside the USA. The career tracks price software work as the country's entry wage times a track multiplier (tech 2, software 1.48) times a rung multiplier (up to 7.33). That fits the USA, where a junior developer earns about twice a graduate wage. It does not fit countries where tech pays close to the graduate wage. Published figures (recorded in tests/v221-tech-pay-shape.test.js):
   Italy: junior 25-36k EUR against a 28k entry tier. Germany: junior 42-47k EUR against a 42k entry tier. Japan: typical developer 4M yen at three years' experience against a 3.8M entry tier.
   GAME DESIGN (not a real-world figure): for these three countries the whole track premium (track multiplier x rung multiplier, minus 1) is multiplied by 0.15. Other countries keep the old shape, as no source was checked for them. Egypt keeps its steep ladder, which matches Egyptian reports (junior 7-12k EGP a month, senior 500k+ a year). */
export const TECH_PAY_TRACKS = ['tech', 'software', 'web_development', 'mobile_app_development', 'cloud_devops_engineer', 'ai_ml', 'ai_automation', 'cybersecurity', 'cybersecurity_analyst'];
export const TECH_PREMIUM_SHARE = { ita: 0.15, deu: 0.15, jpn: 0.15 };

export function payShape(country, trackId, payMult, rungMult) {
  const raw = (payMult || 1) * (rungMult || 1);
  const share = TECH_PREMIUM_SHARE[country];
  if (share == null || !TECH_PAY_TRACKS.includes(trackId) || raw <= 1) return raw;
  return 1 + (raw - 1) * share;
}
/* The pay ratio of moving from one rung to another on a track in this country. */
export function payRatio(country, trackId, payMult, fromRungMult, toRungMult) {
  return payShape(country, trackId, payMult, toRungMult) / payShape(country, trackId, payMult, fromRungMult || 1);
}
