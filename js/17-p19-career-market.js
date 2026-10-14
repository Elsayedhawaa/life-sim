/* ================= PHASE 19 — STABLE FULL CAREER MARKET & FINAL POLISH ================= */

/* Cache the entire vacancy set once per country and in-game year, including all majors.
   Sorting is recalculated for the player's current degree, so choosing / graduating in a
   different field never leaves the board ranked for a previous major. Sponsorship flags
   do not re-roll every time the Career tab is opened. */
const P19_companyListBeforeStableMarket = (typeof P15_companyListBeforeMajorMerge === 'function') ? P15_companyListBeforeMajorMerge : companyListFor;
companyListFor = function(country = S ? S.country : 'usa') {
  if (!S) return P19_companyListBeforeStableMarket(country);
  p12InitState(S);
  const year = gameYear();
  const rawKey = `p19-raw-${country}-${year}`;
  S.p19RawJobBoards = S.p19RawJobBoards || {};
  if (!Array.isArray(S.p19RawJobBoards[rawKey])) {
    let base = [];
    try { base = P19_companyListBeforeStableMarket(country) || []; } catch (_) { base = []; }
    const merged = Array.isArray(base) ? base.slice() : [];
    const seen = new Set(merged.map(p => p.id));
    for (const major of Object.keys(P15_DEGREE_JOBS || {})) {
      for (const post of (p15DegreePosts(country, major) || [])) {
        if (!seen.has(post.id)) { merged.push(post); seen.add(post.id); }
      }
    }
    S.p19RawJobBoards[rawKey] = merged;
  }
  const merged = S.p19RawJobBoards[rawKey].slice();
  const degree = S.degree;
  const masterMap = {finance:'business',accounting:'business',mba:'business',analytics:'business',data:'cs',computer:'cs',law:'law',health:'biology',biology:'biology'};
  const master = masterMap[String(S.masterField || '').toLowerCase()] || null;
  const score = post => {
    if (degree && post.p15DegreeMajor === degree) return 120;
    if (degree && ((post.degree === degree) || (post.degrees || []).includes(degree))) return 110;
    if (degree && p15RoleTrackRelevant(post, degree)) return 100;
    if (master && post.p15DegreeMajor === master) return 80;
    if (master && ((post.degree === master) || (post.degrees || []).includes(master))) return 70;
    if (!post.degree && !(post.degrees || []).length && !post.p15DegreeMajor) return 30;
    return 10;
  };
  merged.sort((a,b) => score(b) - score(a));
  S.jobBoards[`${country}-${year}`] = merged;
  return merged;
};

/* Family requests and relationship cards must identify both the relationship and the name. */
const P19_viewFamilyBeforeRelationshipContext = viewFamily;
viewFamily = function() {
  let html = P19_viewFamilyBeforeRelationshipContext();
  if (S && Array.isArray(S.family)) {
    for (const m of S.family) {
      if (!m || !m.name) continue;
      const rel = p17Relation(m, true);
      const name = String(m.name);
      html = html.replaceAll(`${name} asked for help with`, `${rel} asked for help with`)
                 .replaceAll(`${name} needs help with`, `${rel} needs help with`)
                 .replaceAll(`${name} needs help`, `${rel} needs help`)
                 .replaceAll(`${name}’s request`, `${rel}’s request`)
                 .replaceAll(`${name}'s request`, `${rel}'s request`);
    }
  }
  return html;
};

/* Work is one main employment status at a time: a local job, a remote USD contract,
   or the informal survival route when no valid work status exists — never stacked pay. */
const P19_renderBeforeSingleWorkStatus = render;
render = function() {
  if (S) {
    if (S.undocumentedWork) {
      S.job = null; S.part = null; S.remote = null; S.remoteJob = null;
    } else if (S.job) {
      S.part = null; S.remote = null; S.remoteJob = null;
    }
  }
  const result = P19_renderBeforeSingleWorkStatus();
  if (S && activeTab === 'world') {
    try { p18TripDestinationChanged(); } catch (_) { try { p12RefreshTripQuote(); } catch (_) {} }
  }
  return result;
};


