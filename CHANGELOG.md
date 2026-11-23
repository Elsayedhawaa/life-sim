# World Life — Changelog

## v2.20 — The Fruit Stall Playtest Fixes (2026-11-22)

Elsayed played v2.19 (2026-11-22 ~05:33 EET) and reported the fruit stall is chaos — the text and buttons feel cheap, no sense in the options or logic, prices feel wrong. His paste (Egypt 2022, employed player, fruit stall) is the spec for this round, and it overrides the v2.20 analysis brief (headhunter cap, redundancy tenure/rate, mentor graft, bigger-loan guard, vacation pay are NOT in this round). One launch makes ONE business; a branch renders only as a branch row, never as a full card; full-time + manager keeps the job; the fruit stall gets fruit-stall decisions; every price reconciles; the header reconciles; the card is a menu.

- **One launch, one business** (src/systems/businessEngine.js, src/ui/views.js, src/main.js): the full-time click never silently resigned the job — it SUCCEEDED and resigned it without saying so, which is why Elsayed believed it failed and clicked part-time too, making two byte-identical "Radwan Fruit" cards. Now a full-time self-run launch while employed is refused in plain words naming the employer and both alternatives (hire a manager and keep the job, or resign first and then launch), and the job stays. A second launch of a type already owned is refused naming the existing business ("Open a second one" confirms it explicitly, and the second business is named "… 2"). Branches render only as rows inside the parent's Premises section — the portfolio, header count and totals read non-branches only. A branch cannot expand, switch mode or be opened from itself. Event-driven launches are gated to part-time self-run.
- **Full-time + manager keeps the job** (src/systems/businessEngine.js, src/ui/views.js): the launch screen now offers the run-by choice ("Run it myself" / "Hire a manager to run it ~wage/mo") with the real manager shortlist inline. Full-time + manager launches, the job stays, and the business costs the owner 0 hours.
- **Fruit-stall decisions, and the whole class** (src/systems/businessDecisions.js): decisions are now per TYPE, not per industry group (a TYPE_OVERRIDES layer over the group fallback). The fruit stall has exactly its 8, at the anchor costs: morning wholesale run 2,500, seasonal fruit 1,800, better corner 4,000, beat spoilage 1,500, regulars' weekly box 1,000, price board / honest scales 500, bicycle delivery 1,800, teach the boy 50% of the wage bill. No menu, no signature dish, no food critic, no cooking competition, no catering, no delivery. All 55 venture types checked (49 decision definitions, was 32): bakery, roastery, software studio (no funding rounds for a consultancy), ecommerce / mobile shop (retail set), textile / print / salon / video / cyber replacements, per-type star roles (22, replacing the regex that made a doctor the star of a vet clinic), big-client replacements, property brokerage / real estate (exactly the 5 agency decisions). The tech trap is fixed: a trading tech business no longer has its revenue cut to 8% by the first "Build the MVP" click (trading businesses default to launched; only the two real startups are pre-revenue). Equity is real now: a co-founder diluting you to 80% cuts the valuation and the sale price to 80% (measured 1,962,800 → 1,570,240). The food "Refresh Menu" and retail "Run a Promotion" run-ops are REMOVED — the Decisions tab holds the real one at one price (the run-op was 65% of revenue, the decision 8%).
- **Prices reconcile** (src/systems/businessEngine.js, src/systems/businessMonthly.js, src/systems/businessManager.js, src/systems/businessStaff.js, src/systems/economyEngine.js, src/ui/views.js): the root cause was monthlyCost collapsing to 100 — createBusiness set 7,600, then seedStartingStaff subtracted the 13,613 wage bill and floored at 100. monthlyCost is OTHER costs only now (floored at 25% of takings); wages are charged from staff. The stall's monthlyCost stays 7,600. Stock: a unit costs 13 to buy and sells for ~26, so 800 units cost 10,400 and the capacity (20,800) matches the revenue (20,900); the kiosk's unit is 13 too (was 3). Manager wages scale to the business (tier-scaled curve): a skill-51 manager asks 6,641/mo (was 12,474); kiosk juniors 5,981–6,806 (was 11,583–12,573). Hiring warns, not refuses, when the wage exceeds last month's net ("Fady asks 6,641/mo and this stall netted 4,401 last month — you will pay ~2,240/mo from your salary"). The launch estimate (6,394) is the same curve at skill 45, and every candidate button charges exactly its shown ask. Portfolio totals equal the sum of the cards (gap was 163, now 0, including head-office / regional-manager / staff-savings / supply-chain-saving rows). Debt follows the real state: a miss gives debt = costs + 5% fee exactly, misses are never reset while debt stands, a profitable month pays it down, and the line names the amount, the missed months and the month it began, with a Repay button (wired in main.js). The launch warning now tests the real comparison (wages + other vs expected part-time-from-home takings, naming all four numbers and the shortfall — the stall warns 13,613 wages + 5,700 other vs 9,029 takings, shortfall 10,284).
- **Header reconciles** (src/systems/businessCapacity.js, src/systems/businessEngine.js, src/ui/views.js): one hour computation from the single allocation walk — Workload 66 hrs/week (job 48 + your businesses 18) · 4h/week free · 2 managed · 0 unmanaged, and 66 + 4 = 70. Hours a business needs but did not get are shown separately as uncovered ("18h/week uncovered — Radwan Fruit — Kiosk Alexandria has nobody running it"). Managed means one thing everywhere (a manager, or the owner with allocated hours ≥ mode hours); the header counts match the card badges (branches are not counted — they have no card, their need is the uncovered line). The branch row reads the allocated hours too ("your week is full — no hours left for it").
- **The card is a menu** (src/ui/views.js, src/systems/businessOperations.js, src/systems/businessGrowth.js): the 11 open sections are gone — the 7-section operating menu holds them (staff + manager → Staff, premises + branches → Premises, loan + exits + group costs → Cash, brand → Marketing, group supply → Suppliers), plus one collapsed Ownership details (will & heir) and one collapsed Decisions details. The ops row (R&D / Team Bonus / Pricing) is gone. "Scale Branch" was a level-up mislabelled — it is "Grow the business" now, never on a branch card. "Exit & Sell" lives in Cash. One hire path for a manager (the Manager section candidate list). Branch offers are deduped per-player by city (59 buttons → 32 on the 3-business state; zero Alexandria offers where a kiosk already stands; a blocked city says why once). Units carry a city and renting checks it (the Alexandria kiosk is offered Alexandria units, never Cairo). Level cap is one number (home 2, rented/owned no cap), stated once in the pill ("Level 1/2" / "Level 1 · no cap" — "Infinity" never prints), and expandBusiness agrees with it.
- **Purge, same grafted state** (seed 777, Egypt, employed, spouse + 2 children, cash 607,000, credit 650, one part-time fruit stall): NEW-registry dead text 34 → 0 (the v2.18 registry stays 0; the one "Move to" occurrence is the live decision "Move to a better corner"). Disabled buttons without a reason stay 0 (total 182 on the full UI; the v2.19-w5 total moves 186 → 181 because the 5 removed second-branch-UI buttons were all disabled on that state).
- **Re-measured on this tree** (tests/v217-distribution.mjs, tests/v219-w3-verify.mjs): distribution over 100 lives, 36 months — failure 8.0% (8 dead of 100 launched), breakout 68.0% (was 9.0% / 70.0% in v2.19; the tech-trap fix and the real other costs moved them). UAE 12 launched / 0 dead / 9 broke out. Egypt portfolio month-1 nets −39,328 / −14,760 / 10,749 / 67,731 / 143,577 (total 167,969) — was −48,960 / 5,164 / 25,063 / 87,661 / 129,672 (total 198,600); the real other costs are now charged, so the nets moved. The v2.17 figures must not be quoted as current.

## v2.19 — The Analysis of v2.18 (2026-11-21)

Elsayed said "Go, start v2.19" (2026-11-21 ~17:27 EET) after the v2.17+v2.18 delivery. Standing rule (2026-11-21 ~03:09 EET): analyse the game every time — find what needs enhancement, what is cringe, what needs updating — and do it, without waiting for him to spell it out. This round is the analysis of v2.18, written the day it shipped: it traces the one open item v2.18 left untraced, exercises the two business-fate branches no measurement had ever reached, confirms the distribution harness runs on real UAE lives, splits the desk's Standing block, re-measures the stale numbers, and runs a fresh third-person critique pass over every tab.

- **The scenes drop, traced** (tests/coherence_suite.mjs): minDistinctScenes68Yr is 146 on v2.18 against 151 on v2.17 — it is life-path drift from v2.18's intended crisis-redundancy mechanism, NOT a scene that stopped firing. Seed-matched diff (seed 777, same lives on both trees): Egypt 160 → 168, Saudi 155 → 171, Britain 156 → 160, USA 151 → 146 — only the USA life fell, the other three rose. The USA life was made redundant 4 times (Netflix in the 1990 Gulf War, sacked in 2004, Salesforce in the 2008 crisis, JPMorgan in 2009 one month after being hired) and ends unemployed from age 41 to 68 (204 employed months, against 542 in v2.17), so it loses employment-gated good-career scenes and gains crisis/redundancy scenes. Across 20 probe lives mean employed months fell 529.5 → 296.4 and job losses rose 0 → 67, while mean distinct scenes actually rose 152.3 → 156.8 — the 151 → 146 is the minimum over just 4 lives, noisy by construction. Three checks prove no scene stopped firing: the event files are byte-identical between trees, the monthly scene roll is unchanged, and all the suspect titles still fire on v2.18 across 20 lives. No game file changed for this; the number stays 146. One related finding, deliberately left unfixed: after its 3rd headhunter scene, that probe life can never be re-offered a job automatically — the pre-existing anti-spam rule (no title queued 3+ times per life, unchanged since v2.17) blocks further headhunter scenes. A real player can still apply manually from the Career tab. Loosening that cap would relax a suite-enforced check, and the one-month redundancy has no tenure protection by design — both are decisions for Elsayed, not scene repairs.
- **F1 and B2, exercised at last** (src/systems/businessFate.js, src/systems/businessLoans.js): the two business-fate branches v2.18 never reached in measurement now execute end to end on crafted lives, with the ledger moves measured. F1, the bank-call loan restructure (credit-820 life, struggling café, 500,000 EGP SME loan): monthly payment 9,436 → 7,077 EGP (exactly ×0.75), term 60 → 90 months (exactly ×1.5), balance untouched at 500,000, credit 820 → 815 (−5); the next settlement charges the restructured 7,077 (balance 500,000 → 495,006, term 90 → 89). Proven on a dead business with a loan too. B2, the bigger-loan offer (credit-820 life, booming café, capital 1,000,000 EGP): the offer is 500,000 EGP (50% of capital), 5.0% APR, 9,436 EGP/mo, 60 months; taking it lands exactly +500,000 in cash (5,000,000 → 5,500,000) and the loan record is real; the next settlement charges 9,436 (balance 500,000 → 492,647, term 60 → 59). The gate holds from below: credit 699 gets no offer. **Correction to the v2.18 log: no business product anywhere requires a score of 800.** The true bars, measured from businessLoanTerms, are Egypt SME 700, USA SBA 700, Saudi Monsha'at 690, fallback 620 (UAE, UK). The old test's credit 680 was below the 700 bar, so takeBusinessLoan refused and the test fell into the no-loan arrears branch — the Restructure choice itself was never executed until this round. No game code needed fixing for either branch. One observation, not a defect, left alone: calling buildBiggerLoanScene directly on a business that already took the bigger loan still returns a scene — unreachable in play because checkBusinessFate will not re-fire it (the loan fate flag is set and the scene is maxPerLife: 1).
- **Distribution, re-run on real UAE lives** (tests/v217-distribution.mjs): the harness already listed the real 'uae' id — the coordinator had fixed it at the v2.18 merge; the 'are' typo survived only in a W4 scratch copy and as the intentional unknown-id fallback test (ventureWageScale('are', 2026) === 1, still passing). Re-run on the current tree (100 lives, 36 months): **failure 9.0% (9 dead of 100 launched), breakout 70.0% (70 broke out)** — both strictly between 0% and 100%. All 100 lives launched. By country (launched/dead/brokeOut): Egypt 13/1/9, USA 13/2/8, Britain 13/0/10, Saudi 13/1/9, UAE 12/0/10, Germany 12/0/9, Canada 12/3/7, Turkey 12/2/8. The UAE figure is now real UAE lives. (The v2.18 log's 88 launched with 10.2%/68.2% was the pre-repricing count; launches rose because the repricing made more ventures viable.)
- **Standing at Work, split** (src/ui/careerMarket.js, renderDashboardHtml only — views.js untouched): the desk's "Your Standing at Work" no longer renders the v2.15 market block as one unit. It now renders three sub-blocks inside the standing section — boss, team, numbers — each once (data-standing), each with its own heading and its own "What would move it:" line carrying the real lever from getPerformanceDashboard, which is unchanged. The record line and promotion-interview score line stay once, below the three blocks. The desk stays 7 sections, each once. The market header still states the country-standard terms once ("What every job here comes with"). The no-manager edge keeps the v2.18 purge decision: a managerless life shows the boss block once with "no manager on record" once and no empty mover line, so it shows 2 mover lines. One pre-existing observation, not a defect, left alone: rendering the Career tab grafts a senior colleague on first render (renderMentorRivalHtml calls ensureSeniorColleague when there is no mentor — in v2.18 too, same line), which moves the team average a point on the grafted life (63% → 62% between a pre-render snapshot and a post-render re-read). The dashboard getter itself is pure.
- **Stale month-1 nets, re-measured** (no game change): the v2.18 brief's Egypt portfolio month-1 nets are v2.14-era and do not reproduce. Same portfolio definition (seed 777, Egypt, age 35, cash 20M, reputation 80; café/retail shop/bakery owner-run part-time + salon/restaurant manager-run full-time; 54 used, 16 free of the 70-hour week), re-measured on the current tree: **−48,960 / 5,164 / 25,063 / 87,661 / 129,672 (total 198,600)**. The brief's old figures (−41,318 / 7,711 / 25,752 / 87,570 / 116,580, total 196,295) must not be quoted again. They match the pristine v2.17 measurement — the v2.18 merge did not move them.
- **Third-person critique pass — 4 label promises fixed, 88 dead-text occurrences cut** (src/systems/completeLifeSystems.js, src/systems/careerActions.js, src/systems/businessDecisions.js, src/systems/healthDirectorEngine.js, src/systems/careerConsequences.js, src/ui/views.js): (1) Postgrad pay: the buttons promise +26% (MSc/MBA) and +42% (Fellowship/PhD) but completion raised pay ×1.22/×1.32 — fixed to 1.26/1.42, measured 30,000 → 37,800 and → 42,600. (2) Work-pace health: the preview promises Health −1/mo (Hard, Overtime) and +1/mo (Coast), but no tick ever applied it, and Overtime's "(+respect)" had no boss-respect move — both now land in the monthly actions tick, measured: Hard 80 → 79 health, +1.2 performance; Overtime 80 → 79, +1.5 performance, boss respect +1; Coast 80 → 81, −1.2 performance. (3) Rare-item fake: the label promises repeat customers −2% but nothing moved repeatRate — fixed, 0.50 → 0.48. (4) Rent pushback: the label promised +8% as the outcome but the effect lands it only 72% of the time (28% the landlord holds +25%) — the label now says "ask for +8% …, but the landlord may still hold at +25%"; the gamble is untouched (200 states: +8% 146×, +25% 54×). Checked and true, left alone: career-work trade-offs, R&D/pricing/launch/sale/clearance numbers, staff travel, wing/build equity, short-term let, tenanted sale, vouch, spouse step-up. Travel "+12/−18" is flat by design with the effect matching. Dead text cut, all on the same grafted state as v2.18 counted: gig risk lines 84 → 0 (the manager warning, "60+ hour weeks", "expect a fine", "Off the books", "High risk: undeclared", "Heavy lifting", night shifts, bicycle delivery — warnings now stated once per card, "Applies to every gig here" / "⚠ … — on: <gig names>", each row keeping only its own risks); education system lines 3 → 0 (national Opens/Cost/Risk printed on both Science and Literary tracks — now once per system, 5 systems each once); Legacy Score reasons 1 block → 0 ("Why your Legacy Score is…" printed twice on the Life tab — the goals card owns it now, the Progress panel keeps the score pill + a pointer line). Disabled buttons without a reason: 0 → 0 (total disabled 186, unchanged). All 12 tracks still have real work with real choices after the merge (every choice on every track resolves with its claimed effect); the "next one arrives with the new month" state is the real monthly arrival — finishing work clears the desk and one tickCareerMonthly brings a new piece with a different id and 4 choices. The two merge guards are NOT weakened (a second job loss in the same year fires 0 reactions, all 4 suppressed) but the player is now told plainly, in words, what they lost: a secondLossNote is recorded, the Career tab shows "You Lost Your Job Twice This Year" naming each lost reaction (no second payment holiday, no second conversation/talk/warning) and the first loss's mortgage choice ("you took the 3-month payment holiday — that choice still stands", the holiday flag still on the property); the journal names the kinds too; the note expires next year. The job-offers guard needed no change — nothing ever promises a second offers list.
- **Test-script update, made openly**: tests/v218-verify.mjs title check now expects 2.19 (was 2.18) with the reason written in the script — the check is version-specific by nature, it asserts the title names the current version. The title on the first screen now says "World Life 2.19 — A Real Life Simulator".
- Measured, all on the merged working copy: shipped tests DATA_OK, UI_RENDER_OK 10,416, coherence 0 defects; v28 78/78, v29 33/33, v210 30/30, v211 154/154, v212 35/35, v213 37/37, v214 59/59, v215 21/21, v216 42/42, v217 43/43, v218 47/47; v219-w2 33/33, v219-w3 22/22, v219-w4 44/44, v219-w5 115/115; v219-verify 41/41; distribution failure 9.0% / breakout 70.0% (both strictly between 0% and 100%); ESM 72 files 0 failures; bundle rebuilds byte-identical twice (md5 e706af8e…); server fallback 200s. Open observations, not defects: minDistinctScenes68Yr stays 146 (traced to drift, see above); the F1/B2 branches are now exercised (see above); the D3 anti-spam cap can leave a long-unemployed life without automatic headhunter re-offers (manual apply still works); the one-month JPMorgan redundancy has no tenure protection by design; the Career-tab mentor graft moves the team average a point on first render (pre-existing since v2.15). Live-browser check still owed (subagents cannot drive the browser): the game loads, the Career tab shows Current Work with the real work card, the business card opens as a menu, the Standing split shows boss/team/numbers, no dead text on the screens checked.

## v2.18 — Career, Real + the Overall Game (2026-11-21)

Elsayed's delegation (2026-11-21 ~03:06 EET, continued): complete improvement and enhancement — especially but not only business and career — bug fixes, unity and connection, readability, unneeded text. v2.17 did the business; this round does the career and the overall game, plus the venture repricing the v2.17 measurement found (the venture table was Egypt-calibrated: a USA cafe earning $5,200 a month with a $13,717-a-month wage bill died in month 2 every time, and the UAE had no viable venture at all).

- **Real work inside the job** (src/systems/careerWork.js, src/systems/careerEducationEngine.js, src/ui/views.js, src/core/gameLoop.js, src/core/main.js): every career track now has real work, not just a ladder — 12 hand-written tracks (medicine, aviation, teaching, law, software, engineering, finance, nursing, sales, hospitality, trades, media), 2 variants each, plus 44 deep-track aliases and a generic fallback for all 83 tracks, chosen from the track's real duties. A pilot flies a real route, a doctor treats a real patient, a teacher teaches a real class, a lawyer argues a real case. Every piece of work is a real choice with the trade-off stated first: take the hard assignment (real deadline, real reward), cut a corner (real short-term gain, real chance of being caught, real damage to the boss's trust), help a colleague (real time cost, real goodwill, real help back later — a favour owed returns +15% on the next hard or difficult attempt), ask for the difficult client (real upside and downside). The outcome moves the performance dashboard's three parts — measured: a hard win moves the boss view 63 → 66 and the numbers 71 → 73 (quality 70 → 74); helping moves the team view 56 → 61; cutting a corner and getting caught drops boss trust 56 → 46 and the boss view 63 → 57; winning a difficult client moves quality by exactly +5. Skill grows by doing: a skill used in real work rises (flying 49 → 54 on a hard win), a skill never used falls slowly (54 → 51 over 6 idle months, floor 20%). The promotion bar is met by real work, not by clicking "Work Hard": each completion adds a stepped-up entry where the promotion check reads it (0 → 2 after two completions). The 16 actions from v2.8 stay — they are the rhythm around the real work, not the whole job. A headhunter call now follows real work: each visible achievement (a project delivered, a client won) raises the approach rate by 2 points, capped at +10% (2 achievements → 12%, 7 → capped 18%), and the offer names the achievement ("Won Engineer of the Year"). Work runs on its own seeded stream, so the main stream never shifts.
- **The career tab as a desk** (src/ui/views.js, src/systems/careerMarket.js): the Career tab is now a desk with 7 sections, each once, each in its place — Current Work (with the real work card wired in), Pay, Contract, Next Promotion, Benefits, Your Standing at Work, What You Can Do. Duplication removed: the boss + performance% header (dashboard only now), the pension in Benefits and in the market pension section (market only now), the next rung + Apply in the ladder and in the actions Promotion block (ladder only now). The old renderPerformanceHtml is deleted — the dashboard's three views already are those numbers. The business card (v2.17) opens section by section: 7 `<details>` sections (Stock, Pricing, Suppliers, Staff, Marketing, Premises, Cash).
- **One source of truth for every number** (src/systems/moneyTruth.js): the same business's last-month net is identical on the business card, the Finance tab and the Timeline (158,529 on the measured state, quiet year; identical again in the crisis year). The same salary net is identical on the Career tab and the Finance tab (21,221 quiet year; 18,051 crisis year, gross 30,000 × 0.95). The payslip reads the settlement's own arithmetic now, so the net on the card IS the net that lands in the ledger.
- **A career failure reaches the rest of the life** (src/systems/careerConsequences.js, src/core/gameLoop.js): losing a job means the mortgage, the spouse, the children and the visa all react, in plain words, through the real systems — the bank writes about the home (pay next month's instalment early: months 120 → 119, cash −15,000; or a 3-month payment holiday the settlement honours), the spouse reacts (tighten the belt together sets frugal, affection 70 → 75), the children are told honestly (trust 70 → 74), the visa is named with its sponsor, permit, expiry and grace months (only where the permit depends on the job — a citizen gets no visa scene). **The world events reach the career**: in a crisis year headhunter calls fall (8% → 3.2% a month; paired 300 months on the same draws: 32 calls quiet vs 0 crisis), pay is frozen (merit rise skipped, 30,000 → 30,000; raise and negotiation refused in plain words; a promotion is deferred, not paid), and redundancy is a real 3%-a-month risk — but only after the game warns the player first, at the start of the crisis year, before anything bad happens ("The War in Ukraine — Your Job Is About to Feel It", pay frozen until the crisis end year). Redundancy pays real severance by law (measured 60,000 for 2 months' pay). **The business fate from v2.17 is verified and one real defect fixed**: the friend's job offer read the friend's employer and job title from the wrong place, so in live play every offer was "Shop Assistant" at "the firm where X works" — it now reads the friend's real career record (Junior Site Engineer at Orascom Construction, 20,000/month).
- **Readability — the second purge, measured the v2.12 way** (src/ui/views.js, src/systems/careerMarket.js, src/ui/careerMarket.js, src/systems/careerEducationEngine.js): disabled buttons without a visible reason 5 → 0 on the same grafted state (total disabled 186). Dead text: business tab 222 → 0, education tab 17 → 0, career tab 154 → 0. The career cuts: the job subheading that repeated the title + employer; the pension note printed twice verbatim; the dashboard lever that restated "no manager on record" when the value line already said so; the take-leave cross-reference that pointed at the contract while the contract pointed back at it; and the job-market listings, which repeated the same three lines on all 35 listings — medical cover, annual leave and sick leave are the same for every job in a country, so they now print once above the market ("What every job here comes with"), and a listing only adds its own leave line when its track experience earns more than the standard (verified: 0 years → nothing, 10 years in Egypt → "30 days a year — above the 21-day standard here"). The pension line stays per listing because its amounts vary with the salary; its filler clause ("the same payslip lines the job card shows") is gone; the "Day-to-day …" boilerplate is gone (no duty text prints nothing).
- **Bug fixes — the named warts**: (a) the yearly-childhood social-energy jump is fixed — a friend never jumps 0 → 12 months silent in one turn; 12 silent months warn first (drifting, warned 1, noticed 0, no scene), the notice comes a full turn later (24 months → noticed, scene queued). Monthly pacing is unchanged (warn 6, notice 12). (b) the remittance total is NOT backfilled — no safe backfill exists, and the code is left alone: a naive sum over the old ledger counts money a Hawala broker stole (the wallet move is written before the scam check, so the line is indistinguishable from a delivered remittance), mixes the Saudi dependent levy into the monthly "family support" line, and the ledger is capped at 400 lines so old sends are gone entirely. Only the two live send paths write the total. (c) the net-worth snapshot is moved out of the render into the yearly advance — a Dec → Jan advance with no render records exactly 1 snapshot for 2027 (value 93,225, the same number Finance reads); 11 more months add none; the next crossing adds exactly 1 for 2028; rendering Finance afterwards adds no duplicate. (d) the index.html title said "World Life 2.5" — it now says "World Life 2.18 — A Real Life Simulator".
- **Venture repricing — a venture is viable where it should be** (src/systems/businessEngine.js, src/systems/businessAcquisitions.js, src/ui/views.js): the venture table is repriced per country by the country's real monthly mid salary against Egypt's (one place, `ventureWageScale`, from the existing era-salary and currency tables — no new conversion table invented). Capital, takings and other costs are all scaled, so the wage-to-takings ratio is the same everywhere as in Egypt. Measured: a USA cafe's takings go from $5,200 to $99,143 against the same $14,685 wage bill (ratio 0.148, Egypt's); a UAE cafe's from 19,097 AED to 275,800 AED against 40,850 AED. All 864 country × venture pairs now have takings above a 3-role wage bill. A USA cafe and a UAE cafe both launch and survive 12 months with sensible play (USA: cash $5M → $4,802,215, 12 settled nets sum +$158,707; UAE: cash → 4,887,459 AED, sum +896,707 AED). Egypt is unchanged (cafe launch figures byte-identical). The launch screen warns in plain words when the wage bill exceeds the takings, naming both numbers ("This business cannot pay its own staff. Your staff cost 14,685 USD a month but this business takes in about 5,200 USD a month — it will lose money unless you change something."). Honest caveat: the absolute takings look large in rich countries (a ~$99k-a-month USA cafe) because the venture is the same relative size as its Egypt original (~14.5 local mid-salaries of takings a month) — a purchasing-power alternative was rejected because no cross-country price-level machinery exists in the game and the round forbids inventing a conversion table.
- **Merge defects found by re-running the shipped tests on the merged tree** (the v2.13 lesson, again): (1) the job-offers scene fired twice in one calendar year — traced live (life 22, Egypt 2023: made redundant, hired, made redundant again, 8 unemployed months twice in one year). It now fires at most once per calendar year. (2) a second job loss in the same calendar year re-fired the identical mortgage/spouse/children/visa scenes (life 1, Saudi 2009, made redundant twice at the same employer). Each reaction kind now fires at most once per calendar year; a repeat loss in the same year is journalled in plain words instead, and the redundancy scene is guarded per employer per year. Trade-off, stated openly: a second job loss in the same year no longer re-offers the mortgage payment holiday — the first loss's choice still stands. Neither defect was fixed by varying a scene title.
- **Test-script fixes, made openly with reasons in the scripts**: v218-w2-verify (79 → 80 checks): the CAREER-WORK-SECTION placeholder check now asserts the placeholder is gone and the real work card renders. v218-w3-verify: the career dead-text check now expects 0 (was "must stay 154"). v28-verify (77 → 78): the listing-benefits check now expects at least 1 per-job benefit (the pension) instead of 3, plus a new check that the market header states the country-standard terms once.
- Measured, all on the merged working copy: shipped tests DATA_OK, UI_RENDER_OK 10,416, coherence 0 defects; v28 78/78, v29 33/33, v210 30/30, v211 154/154, v212 35/35, v213 37/37, v214 59/59, v215 21/21, v216 42/42, v217 43/43; v218-w1 30/30, v218-w2 80/80, v218-w3 19/19, v218-w4 OK; v218-verify 47/47; distribution failure 9.0% / breakout 70.0% (both strictly between 0% and 100%); ESM 72 files 0 failures; bundle rebuilds byte-identical twice (md5 48a1709a…); server fallback 200s. Open observations, not defects: minDistinctScenes68Yr is 146 (was 151 on v2.17) — one life sees 5 fewer distinct scenes; the drop came from the merge, not from the defect guards, and its cause was not traced. The v2.17 business-fate branches not exercised in measurement carry over (the loan-restructure branch needs credit 700; the bigger-loan branch needs score 800). Live-browser check still owed (subagents cannot drive the browser): the game loads, the Career tab shows Current Work with the real work card, the business card opens as a menu, the market header states the country-standard terms once, the venture warning renders on the launch row.

## v2.17 — Business, Real (2026-11-21)

Elsayed's delegation (2026-11-21 ~03:06 EET): business must be real — randomness, a business that can fail or become a big company, branches, a lot of options and details inside the business, reputation deleted, no more static "estimated profit", hire people in real positions with real titles and real effects, operate the business and actually do something.

- **Reputation deleted, everywhere it lived in business** (src/systems/businessEngine.js, businessDecisions.js, businessMonthly.js, src/ui/views.js, src/data/eventsBusiness.js): the field, the render, the gates, the decision text. The franchise gate was reputation 75 (the spec text said 80; the code said 75) — now it needs level 3, at least 12 months trading, at least 6 profitable months in a row, and at least 60% of customers coming back. The level gate now needs months in the business, profitable months in a row, and a team whose average skill is high enough (no staff counts as average). Revenue now moves on the real repeat-customer rate: 50% coming back is neutral, higher lifts revenue by up to 20%, lower cuts it by up to 20%. What replaced reputation is a real number: the share of customers who come back (repeatRate, 0–1, starts at 0.50), moved in exactly one place at the end of each settled month — by staff quality, by prices, by whether the month made money, and by the decisions the player took. The player's own social reputation elsewhere (the header, the part-time gigs) is untouched. Measured: "reputation" in the business systems is 0 outside two deletion comments; "Est. revenue"/"Est. net" is 0; `biz.reputation` is 0.
- **No estimated profit anywhere** (src/ui/views.js): the launch list no longer shows any estimate of revenue or profit. It shows the real inputs — the capital, the rent if rented, the wage bill, the stock cost — and says plainly: "Profit is unknown until the first month settles. The first profit-and-loss lands at the end of this month." Every number on the business card is a real number from a real settlement or a real input the player chose. Measured: "Est." in the business card is 0.
- **A real outcome distribution** (src/systems/businessGrowth.js, tests/v217-distribution.mjs): measured over 100 lives, 36 months each, real settlement — 79 launched, 18 died (22.8%), 44 broke out (55.7%). Both rates are real, neither is 0% or 100%. A business can fail for real reasons the player can see — debts, a bad manager, a market that turns, a decision that backfires, months of losses eating the capital — and a failing business warns in plain words before it dies (a warning at two losing months in a row, a cause and a way out at three). A business can break out for real reasons — good staff, good decisions, a good market, sustained profit. Levels go past 5 (the old ceiling is gone): a broken-out business becomes a group with a head office (real cost, real staff), a regional manager (real salary, real effect on every branch), a supply chain where buying in bulk cuts the per-unit cost for every branch (measured: 21% with three branches including a warehouse), and brand value that grows with profitable months and falls with bad months and moves revenue (starts at 1,000; a month that nets 86,544 adds 1,781; a month that loses 71,684 takes 742). Market shocks are real and seeded by the business and the month, so the same business on the same seed can fail or break out depending on what the player does — twin lives prove it. Honest gaps from the measurement: the venture table's prices are Egypt-calibrated (v2.11), so in high-wage countries most ventures cannot pay their own staff at launch — a USA cafe earning $5,200 a month with a $13,717-a-month wage bill dies in month 2, every time — and the UAE has no venture at all that can cover its wage bill, so 0 of 13 UAE lives launched. The launch screen should warn when the wage bill is bigger than the takings. That repricing is a later round, not this one.
- **Hiring in real positions with real titles and real effects** (src/systems/businessRoles.js, businessStaff.js): every business type hires in its real roles — chef, waiter, cashier, cleaner, driver, marketing, bookkeeper, and the rest of the type's roles (thin types completed, every type hires at least 4 roles). Each role moves a real number in the next month's P&L and the card says what it moves before the player hires: a chef raises food quality (repeat customers + price tolerance), a waiter raises covers, a cashier cuts theft and speeds the till, a driver extends delivery reach, a marketing person brings new customers, a bookkeeper cuts tax mistakes and late fees. Each role can be bad at it: a bad chef loses customers, a dishonest cashier steals (about 4% of hires, from the existing draws), a lazy waiter drives people away. Skill is real: measured over 12 months, a skill-80 chef nets 864,703 against 484,097 for a skill-40 chef in the same role; a skill-80 waiter 795,116 against 506,050; a skill-80 cashier 739,886 against 523,886. Training adds 8 skill at half a month's wage (cap 95); promotion needs skill 60, raises the wage and lifts morale by 10; firing pays severance and the survivors' morale falls by 8. The staff list shows each person's role, wage, skill and what they do — not just a name.
- **Operating the business** (src/systems/businessOperations.js, src/ui/views.js, src/main.js): each business card is now a menu the player opens section by section — Stock, Pricing, Suppliers, Staff, Marketing, Premises, Cash — each a real set of actions with real numbers and real consequences in the next month's P&L, each stating its cost before the player commits. Stock: order with a real cost and quantity; empty shelves lose 45% of sales; overstock wastes money (200 extra units wasted 62,800 exactly). Pricing: set prices per item; 15% above the usual price lifts revenue by 4% per item and costs repeat customers; 15% below does the opposite (all three items high: revenue ×1.04³, repeat customers −0.036 exactly). Suppliers: named suppliers with a real price and real reliability — a cheap one can fail to deliver (nothing arrives, nothing charged, sales fall 45%); a reliable one delivers exactly what was ordered (800 units for 276,000). Staff: the rota — overtime costs 25% of the wage and tires people; a day off costs 2% of the month's sales and lifts morale by 8. Marketing: real channels with real new customers and diminishing returns — the second run of a channel earns exactly half the first, the third a quarter, and the button says so. Premises: maintain, expand, move (25% of monthly revenue plus the rent; repeat customers reset to 30% in a new city). Cash: withdraw, reinvest and pay down debt with real numbers and real tax. Measured by the v2.14 twin-lives method: a decision's promised effect lands exactly in the next month's P&L.
- **Expansion — a store becomes a chain** (src/systems/businessBranches.js, businessGrowth.js): more branch types, each with its own staff, rent, P&L and manager — a second shop, a kiosk, a franchise outlet (the franchisee pays the fit-out and a royalty), a warehouse (which also feeds the supply chain). A broken-out business becomes a group (see above).
- **The business's fate reaches the rest of the life** (src/systems/businessFate.js, src/core/gameLoop.js): a failing business means the bank calls about the loan (restructure, pay three months now, or stall — each with a real credit-score effect), the spouse reacts to the lost income (support or a row, with real costs and affection), a friend offers a real job (a real job record, or current pay ×1.15). A booming business means the spouse wants a bigger house, the bank offers a bigger loan on real terms, a rival tries to copy you (cut prices and keep the customers, or hold prices and lose some). These are real scenes, not random cards — a bank call about a dead business fires when the business dies, not when it wins a lottery.
- **The branch "Hire a manager" wart (v2.14) is fixed** (src/ui/views.js): the branch row no longer shows a signpost button that only opens a toast. It shows that branch's real manager shortlist, with the same hire buttons (skill, tier, wage on the button) as the branch's own card. Measured: hiring from the row puts the manager in that branch and charges exactly the wage.
- Coordinator merge fixes (real defects, found by re-running the shipped tests on the merged tree): (1) W4's suggested fold wiring would have applied the month's effects twice (the reader returns a copy, and the fold applies the snapshot) — the operations effects are now merged before the snapshot, so the fold is the one application. (2) W3's role stamp replaced the whole month-effects object, wiping any operations effect already stamped that month — it is now a delta merge that removes only the previous role contribution. (3) The month-effects fold sat after the decision fold and the reinvest boost, so a promised +66,996 settled as +67,238 and the reinvest ratio came out 1.2593 instead of 1.25 — the fold now runs on the business's own takings before the decision fold and the reinvest boost (v214 back to 59/59). (4) Wiring the operations system into the real settlement made every business burn its starting stock in month 1 and then lose 45% of sales every month after, even businesses the player never opened the menu for — an operations gate (opsEngaged) now means the stock system only runs for a business the player actually operates; a business never operated trades exactly as in v2.14. (5) Role effects lasted one month only (the month-effects object was cleared at settlement and nothing re-stamped them) — the role contribution now carries over from the last stamp into the next month; the morale lift still lands once, when the staff changes. Test-script fixes (openly, reasons written in the scripts): the w4 settle helper double-folded; the v217-verify 4a loop asked for level 6 after 4 expansions (impossible by counting); 5c rebuilt a fresh hand-made business every month so wave noise swamped the role effect; 6b called the wrong function with the wrong arguments and measured nothing.
- Measured, all on the merged working copy: shipped tests DATA_OK, UI_RENDER_OK 10,354, coherence 0; v28 77/77, v29 33/33, v210 30/30, v211 154/154, v212 35/35, v213 37/37, v214 59/59, v215 21/21, v216 42/42; v217-w2 64/64, v217-w3 71/71, v217-w4 75/75, v217-verify 43/43; distribution failure 22.8% / breakout 55.7%; ESM 69 files 0 failures; bundle byte-identical twice (md5 044de67b…); server fallback 200s. Live-browser check still owed (subagents cannot drive the browser): the game loads, a business card opens as a menu, a role hire states its effect, no "Est." and no "reputation" on the business card.

## v2.16 — The Feel: Light & Dark + Achievements That Can Be Earned (2026-11-20)

Elsayed's standing decision from 2026-11-07 was "keep dark AND offer light mode" — but the 2.0 line never had a toggle at all, one warm-parchment light theme with the era skin retinting it. The v2.13 notes also named 5 achievements nobody could ever earn. Both are things he feels every time he opens the game, so this round fixes both.

- **A light/dark toggle, finally** (styles/main.css, src/main.js, src/ui/views.js): a visible Light / Dark control in the header, on every tab, and the same control on the new-life modal — the player chooses their theme before they choose their life. It switches the whole game between a light theme and a real dark theme (warm dark: canvas #1B1815, card #26221D, ink #F2EDE3) — not the light theme with a filter; there is no `filter`/`invert` anywhere in the dark theme and no rule touches an image, so the ink/watercolor illustrations stay exactly as they are in both themes. The era skin composes with the toggle, it is not replaced by it: the toggle is the theme, the era skin is the tint — a 1962 life looks warm and sepia in light mode and warm and dark in dark mode, a 2026 life looks cool in both (dark canvases #241D14 vs #12151A). The choice is saved in localStorage (`world_life_2_theme`) and survives a reload; a new player starts in light mode — the game never opens dark by surprise; a garbage value falls back to light. The Finance charts and the property-market chart redraw in the active theme's colours (chart colours come from CSS variables now, zero hardcoded chart colours left). Measured: the toggle renders on 8/8 tabs in both themes; backgrounds change (1990s shell #E6E9EC → #161B22, card #F6F8F9 → #1E242E); the era class still differs 1962 vs 2026 in dark mode; set dark, reload, still dark. Text contrast passes on all 8 screens in both themes (body text ≥ 4.5:1, button/large text ≥ 3:1 — light body 18.27:1, dark body 13.54:1; the worst passing light value is muted text on the 1970s canvas at 4.59:1).
- **All 30 achievements can now be earned** (src/systems/progressEngine.js): the 5 that were listed as "upcoming" because no state existed to check them against are wired to real state — none removed, total stays 30 → 30. Returned Home: the game now remembers the first time you are seen living outside your home country, and grants it when you move back (deportation home counts — it is a move back home). World Traveler: every "Trip: <name>" ledger line folds into a persistent visited-countries list (names are unique across the 102 vacations, so name → country is exact), plus the home country and every country lived in; the ledger keeps only its last 400 lines, so trips accumulate as they appear. Family Provider: a new lifetime total, recorded at each send in EGP through the game's own currency conversion — one-off wires (a Hawala scam returns before the line, so stolen money never counts) and the monthly standing order (the Saudi dependent levy is a government fee and never counts); grants at 500,000 EGP. Survived a Recession: reads the world-events history — an event is a crisis for you only when it hit your country with businesses earning less (so the 1973/1979 oil booms in Saudi/UAE and the 2014 oil-crash boom elsewhere are correctly not crises there); grants at the first check after the crisis ends if you are still employed and either every check while it ran saw you employed, or your current job's tenure reaches back before the crisis started (the tenure path also covers a crisis that fired and ended inside one 12-month fast-forward, where no check saw it active). Once a crisis ends the verdict is settled — jobless at the end, then re-employed later, does not earn it. Home for Visit: a trip whose destination is your home country, seen while you are living abroad, grants it; a trip home while living at home does not count. All bookkeeping is recorded going forward from real events (same pattern as the existing _hadDebt/_salesSeen fields), inside evaluateProgress only — renders still never write. Grants are dated to the current year/month on first notice, per the v2.13 backfill rule. Two small corrections along the way: the header claimed all 30 pay "~4,150 XP" — the true sum is 4,350 XP (verified from the module); Gold Hoarder was missing from the XP map (it silently took the 100 default) and is now listed explicitly at 100, same effective value. Measured: a new 87-check probe proves every one of the 30 grants when its state is set and does not grant without it (9 countries → no, 10th → yes; 499,999 EGP → no, 500,000 → yes; job started after the crisis → no; jobless at crisis end → no, still no after finding work later; oil boom → no). Real paths exercised, not just state injection: a real SWIFT wire adds its exact EGP value and a large wire grants Family Provider; a real monthly settlement adds one month's remittance; a real vacation home from abroad writes the Trip: line and grants Home for Visit; the 2008 crisis fires in Egypt in Sep 2008 and the grant follows after it ends (Jun 2010). A full-life sweep earns all 30, panel 30/30, level 10 at 4,350 XP. A newborn still earns nothing.
- **Small feel items**: the toggle's state is shown on the new-life modal (same control as the header, same handler, so the two can never drift); the progress panel shows the earned achievements with their dates in both themes and the next milestone is readable in both (its only colour change was the XP bar fill #1B734E → var(--brand-emerald); the panel has zero hardcoded colours left).
- Honest gaps, stated plainly: the remittance total is not backfilled — sends made before this round were never tracked (old ledger lines carry no reliable sender record, and monthly lines mix in the Saudi levy), so Family Provider counts from this round onward; a player on an old save who already sent 500,000+ EGP will need to send more before it grants. Crisis employment is sampled at evaluations (every action/advance); a job lost and regained between two evaluations inside one fast-forward could slip through the sampled path — the tenure path is the exact backstop. The net-worth snapshot is still recorded from renderApp and the Finance tab render rather than inside the yearly advance (v2.13 gap, unchanged).
- Coordinator merge fixes (real defects, found by re-running the shipped tests on the merged tree): (1) W3's contrast script still failed on 4 pairs after W1's theme landed — the fixes are one-line CSS rules, each verified by arithmetic before applying: the era active subtab pill now has white text in light mode (white on the 7 light era accents measures 5.17–17.85:1; in dark mode the later rule at main.css:1366 wins the (1,3,0) specificity tie and keeps the dark #171512 text, measured 5.82–11.95:1 on the dark accents); the dark lock-reason chip now uses secondary ink (7.06:1); the dark document stamps now set their text explicitly (good #6FCB9A at 5.50:1, bad #F08A7D at 4.73:1 — the previous values measured 4.49:1 and 3.57:1). The contrast script's pair model was updated to match the actual CSS rules, with each entry citing the rule it models; thresholds were not weakened. (2) Three :root values darkened by W3 (ink-muted #7D7569 → #6B6257, terracotta #C84B31 → #BC4630, gold #A97115 → #8A5C0E) lift the worst light values from 3.96–4.17:1 to 4.59–5.93:1. (3) My own verify script had three probe bugs (getProgress returns `earned`, not `achievements`; S.progress and S.worldEvents need initialising before being written) — fixed in the probe, not the game; the negative checks were vacuous until the helper was fixed, and were re-run after. v216-verify (coordinator, independent) 42/42; worker verifies w1 80/80, w2 87/87, w3 contrast PASS, w3 modal 12/12; shipped tests on fresh unpack DATA_OK, UI_RENDER_OK 10,354, coherence 0, v215-verify 21/21, v214-verify 59/59, v213-verify 37/37, v212-verify 35/35, v211-verify 150/150, v210-verify 30/30, v29-verify 33/33, v28-verify 77/77; ESM 65 files 0 failures; bundle byte-identical twice (md5 5a170c25…); server fallback 200s.

## v2.15 — The Overall Game, Deeper (2026-11-20)

Elsayed's instruction after the overnight rounds: do the enhancements for the overall game too — real things he can feel and touch. The third-person critique (THIRD-PERSON-CRITIQUE.md) measured v2.13 and found the money real, NPCs alive and failure real, but property a ledger line, career a payslip with no market, friendships that never decay, a static world economy, story threads with no resolved state, and NPC memory thin. This round answers all five.

- **Property: being a landlord, played** (src/systems/propertyLandlord.js, src/data/propertyLandlordData.js): every rented-out property has a named tenant — a real person record in S.people with a job from the employer pool, income ≥1.6× rent, reliability 35–95. Rent is posted by the settlement with the tenant named in the ledger line ("Rent from X — paid by Mina Kamel"). An unreliable tenant is late; arrears accumulate and are caught up. A tenant can lose their job (1.5%/month) — partial rent (40% if reliable), arrears grow, and a scene offers the real choice: give 3 months (the tenant found work in month 3 in the test) or evict under the country's own law (Egypt: Civil Court, 10 months, 2 months' rent = 22,680 EGP; no rent while it runs; the deposit covers arrears, the remainder is returned). Deposits are 1–2 months' rent, held, with their own ledger line; at move-out real damage is listed with real prices and the player chooses keep / return / go to court (small-claims filing fee 30% of a month's rent, 80% win rate on documented damage). Damage events (boiler, roof, plumbing, appliance, wall, window) each carry a real price from the property's value: fix properly, fix cheaply (40%, may break again), or ignore it (condition falls, the tenant grows unhappy, may move out). Lease renewals at 12 months: renew, raise 5%, or sell with the tenant in place (10% discount) — measured over 100 tenants: 33 accepted, 39 negotiated, 28 left. Condition decays −0.6%/month rented (−0.3% otherwise) and the rent falls with it (rent factor 0.55 + 0.5×condition, so condition 40 earns exactly 25% less than condition 90 — measured settled: 8,100 vs 10,800); maintenance is a real action (0.8% of value, +10 condition). Market states Rising/Stable/Falling per country from a 7-year cycle (2 rising / 3 stable / 2 falling, offset per country), recorded monthly, with rent ×1.10/1.00/0.90 and prices ×1.12/1.00/0.88, shown as a real SVG chart from the recorded history. The monthly tick never moves cash — deposits and returns discovered mid-settlement go through pendingMoves and are posted by the settlement's own buckets, so the month still reconciles.
- **Career: a market, not a ladder** (src/systems/careerMarket.js, src/data/careerMarketData.js): a good performer (75%+, 6 months in role, 8%/month, doubled when mentored) is approached by a named recruiter (a real person record) with a named company from the real employer pool and a real offer 12–30% above current pay through the same payslip — every offer carries ≥1 real trade-off (demanding boss, 2-year non-compete, move to another city). Accept hires through the one hireIntoJob path at the exact offered gross; the non-compete really blocks rejoining; decline leaves the job alone; negotiate has three measured outcomes (counter-offer of 90% of the outside offer or an 8% raise, whichever is more; an 8% raise; or a refusal that costs boss respect −3 and spends the offer). The performance dashboard shows the boss's view (the live-blended manager view), the team's view (the live colleague average) and the numbers (quality/attendance from the real records), each with the one thing that would move it most, plus the promotion-interview score broken into its real components (base + the panel's mood 0–20 against the 150 bar). Teamwork finally moves (+1/+2 on stepping up, monthly drift toward the team's live view — the old "nothing moves it yet" line is fixed). Pension auto-enrolment under the country's own rule, accrued in the monthly settlement from the payslip of the pay that actually landed: UK 5% employee + 3% employer (the payslip's pension share is corrected 0.5→0.625 so the line itself reads 5% — the payslip net is unchanged, the share only splits the social-insurance total), US 401(k) 6% as a real cash line with a 3% employer match, Australia 12% super, everyone else the payslip's own pension line; the pot grows at 4%/yr modelled and pays out at retirement as pot/240 a month on top of the state pension (measured: UK pot after 12 months on 40,000/mo gross is 39,111 = employee 24,000 + employer 14,400 + growth 711; retirement pays state pension 8,800/mo + a 163/mo top-up, and the pot is zeroed after payout). Opting out is UK/USA only, with the consequence stated before committing (USA opt-out stops the 401(k) only; Social Security keeps going in). Mentors and rivals: a senior colleague (5+ years older, respect 60+/trust 55+) can become a mentor — advice names the weakest dashboard part and lifts it +2, an introduction is a real 35% shot at an offer now plus doubled headhunter chances while mentored, and the mentor's word is +12 in the promotion interview / +6 at the yearly review (measured twin, same seed: mentored 153 vs unmentored 141 against the 150 bar — mentored promoted, unmentored rejected). A rival spawns when you are in contention for the next rung, drifts in performance, blocks the yearly review when ahead of you, and can be collaborated with (ally, trust +8), raced fairly (+2/+2), or undermined (1-in-3 discovered: boss respect −10; undiscovered: rival −5).
- **Social energy and friendship decay** (src/systems/socialEnergy.js): social energy is a real budget, 10/month, stored on the record and surviving save/load, refilled by the monthly settlement (and the yearly childhood turn). Every relationship action costs energy — call 1, conversation 2, visit 3, gift 2, asking for help 4 — and the cost is stated on the button before the player clicks; the number on the button and the number charged are never two different numbers. When it is gone the game refuses in plain words ("You are out of social energy this month… It comes back at the start of next month"), never a silent dead button. Friendships decay if ignored, driven by a real last-contact record: 6 months silent → "drifting" (a warning on the card naming what would stop the drift, affection thinning −3/year); 12 months → the notice scene "You have not spoken to X in a year" with a real choice — reach out now (a call, exactly 1 energy, affection +12, drift cleared) or let it go (the friendship ends, recorded, affection → 8; a best friend at affection ≥ 80 is journalled as a real loss). Nothing ends silently and nothing is decided after the fact — the warning always comes first, and only "let it go" ends a friendship. Drift applies to friends only, never family, spouse or children. Records with no last-contact field take the newest journal entry naming the person; with no journal evidence they are marked lastContactUnknown and never drift on a guess.
- **Era world events move markets, prices and rates** (src/systems/worldEvents.js, src/data/worldEvents.js): 18 era-locked world events, each with a real date range and a per-country effect — the 1973 and 1979 oil shocks, Japan's bubble bursting (1990), the Gulf War (1990–91), Sweden's banking crisis (1992), the Asian financial crisis (1997), the dot-com crash (2000), September 11 (2001), the 2008 financial crisis, the euro debt crisis (2011), the Egyptian revolution (2011), the 2014 oil price crash, Egypt floating the pound (2016 and 2024), Brexit (2016), Covid (2020), Turkey's lira crisis (2021), the war in Ukraine (2022). When one fires it moves house prices, interest rates, salaries and business revenue in the affected countries, and the player reads about it in the news — a real scene naming the event and what it means for them (the 2008 crisis scene names Lehman, with two plain-words choices), not a silent number change. Firing is date-only and deterministic — no random roll. Interest rates follow the country's real rate for the era (a real central-bank policy-rate table, 18 countries, real anchors — USA 19% in 1981, 0.25% in 2009; Egypt 27% in 2024; Japan ~0% since 2000; Turkey 42% in 2023 — linearly interpolated): a bank mortgage is now priced by amortisation at the real era rate, so the same 1,000,000 mortgage over 15 years costs 18,306/month in 1981 against 6,551/month in 2009. Measured: the same USA house is 181,670 in 2007 against 145,519 in 2009 — an inflation-normalised ratio of exactly 0.750, the crisis factor. Salary through the real settlement falls in event years and the ledger line names the event. Market states: Egypt 2012 Falling, Egypt 2017 Rising, USA 2009 Falling, USA 2026 Stable. The Finance tab gets a "The World & Your Money" panel (market state, central-bank/mortgage/savings rates, active events, the history of events lived through).
- **Story threads close properly, and NPCs remember** (src/systems/threadResolution.js, src/systems/npcMemory.js, src/data/eventsMemory.js): every event chain has an explicit resolved state (S.threadResolutions, with how it ended and when); the chain picker refuses every member of a resolved chain, including the root, so a finished story never re-queues — the Verdant failure mode (Jennifer re-queuing at 13/16/20/26 after being "resolved") is tested for and does not happen here. A thread whose follow-up was due but whose gates never passed for 36 months closes with a stated outcome ("Time moved on — … was never settled, and the moment passed") instead of hanging open. The runtime audit counts 62 follow-up events forming 36 chains, 36/36 with a resolution path, 0 recurring. In 30 lives birth→52: 153 chains started, 146 resolved (143 by choice, 3 by time-out), 0 re-queues of resolved threads. Every person keeps 3–5 event memories on the existing person record (no second store) — what the player did, in words ("You lent me money in 2019", "You missed my wedding") — and a memory is referenced in later text and in later events: 3 new memory events (asking a friend for money, a favour coming back, a broken bond that can heal or end for a stated reason). Measured present vs absent, same event, same seed: a favour remembered → +765 cash; a betrayal remembered → 0 cash and −6 happiness; no memory → +383 cash. The cap is 5 (the oldest small memory drops, defining memories — a broken or kept promise, a betrayal, standing by someone in a crisis, weight ≥ 3 — never drop; the drop is recorded and the card says so). Memories survive save/load. This round also fixed a real defect the audit found: the dad-loan chain's repaid (6 months) and unpaid (18 months) branches could both fire in one life, telling two contradictory endings — the unpaid branch now carries notAfterEvent, and 0 lives in 30 show both endings. The event pool is 571 → 574 (+3 memory events, 0 deleted). Honest gaps, stated plainly: the mentor's doubled headhunter approach rate is code-verified, not statistically measured (the measured mentor effect is the promotion twin test); in yearly childhood pacing a friend can jump 0 → 12 months silent in one turn, so the notice scene itself is the warning there (the 6-month card warning appears in monthly adult pacing); the 5 ungrantable achievements and the light/dark toggle are still open (v2.16). Merge fixes by the coordinator (real defects, found by re-running the shipped tests on the merged tree): (1) v28-verify fell 74 → 70 — the 4 failures were the world-event salary effect, not a regression: the settlement scales the GROSS before tax, so in an event year the ledger credit is the net of the adjusted gross (Egypt 2013: 5,860; UK 2024: 2,875; USA 2024: 5,847 — each recomputed to the pound from the adjusted gross). The test now expects the adjusted gross, openly, with the reason written in the test — and it also checks the ledger line names the event. 77/77 now (74 + 3 new event-naming checks). (2) v211-verify and v212-verify both hard-coded the event pool at 571 — updated to 574, openly, with the reason written in each test. (3) The plain Sell/Flip button sold a tenanted property without settling the deposit, so the deposit stayed in the player's cash — sellOwnedProperty now settles it through the one shared helper (settleDepositOnSale, factored out of sellWithTenant so both paths use it): damage kept, the rest back to the tenant. Proven through the real sale: Mina Kamel's 22,680 deposit, 5,000 damage kept, 17,680 returned, with the ledger line and the journal note. (4) W3's bad edit briefly deleted tickEducationYearly(S) from the yearly branch — restored immediately and confirmed intact by the coordinator (present at gameLoop.js:199 and :237). v215-verify (coordinator, independent) 21/21; worker verifies 57/57, 94/94, 90/90, 50/50, 27/27; shipped tests on fresh unpack DATA_OK, UI_RENDER_OK 10,354, coherence 0, v214-verify 59/59, v213-verify 37/37, v212-verify 35/35, v211-verify 150/150, v210-verify 30/30, v29-verify 33/33, v28-verify 77/77; ESM 65 files 0 failures; bundle byte-identical twice (md5 10e96226…); server fallback 200s.

## v2.14 — Businesses, Properly (2026-11-20)

The direct answer to Elsayed's 18:07 questions. The hard cap is gone — BUSINESS_CAP grep 0, no "X of 3" anywhere; the real limit is management capacity (a business you run yourself costs your hours, full-time ~40h / part-time ~18h, 70h/week ceiling; a business with a manager costs the manager's salary and runs without your hours). A 5-business portfolio measured: 2 manager-run full-time + 3 owner-run part-time, 54/70 owner hours, month-1 nets −41,318 / 7,711 / 25,752 / 87,570 / 116,580, total 196,295. A CEO/manager per business (a person, not a toggle): hire from a real shortlist (named, skill, wage, loyalty); skill 80 vs 40 over 12 months 3,091,457 vs 2,185,926 (+41.4%); policy Growth 2,983,947 > Safe 2,763,878 > Harvest 2,592,654; embezzlement with investigation and lawsuit; promote-from-within vs outside hire; a manager asks for things, quits at low loyalty, is fired with severance under the country's law. Per-industry decisions (at least 3 per industry group, wired to the real P&L): restaurant menu/critic decisions, startup stages and funding rounds, retail stock/supplier/sale, services star hire/pricing/big client, property/logistics fleet/contract — every decision states its cost before committing and the effect lands in the next month's P&L (measured: refresh menu promised +66,996, settled month showed exactly +66,996). Buying an existing business with a real valuation and due diligence (Farouk Tutoring center, valuation 1,858,979, ask 1,894,980, diligence 37,180); branches as real second locations with their own staff, rent and P&L (Alexandria, setup 184,239); exits (trade sale to a named buyer, management buyout, IPO, franchise with a 14,516/month royalty); withdraw vs reinvest with tax (reinvest one month of revenue → next month's revenue exactly ×1.25). Unmanaged businesses decay over 3 months (revenue 124,455 → 100,744 → 71,887; morale 62 → 56 → 50). v214-verify 59/59; shipped tests DATA_OK, UI_RENDER_OK 7,843, coherence 0; ESM 51 files 0 failures; bundle byte-identical twice (md5 e939476a…). (This entry was missing from the changelog and was added by the v2.15 coordinator from the v2.14 progress log and notes.)

## v2.13 — Visualisation & Game Feel (2026-11-20, Overnight Round 5 — the last overnight round)

The audit found the game looks the same everywhere: 17 of 25 screens have one 148px banner as their entire visual identity, 0 levels/XP/achievements, 0 maps, the only chart is the Timeline trajectory, and the UI is identical in 1960 and 2026. This round makes the game look and feel like a game. A progress system (src/systems/progressEngine.js) revives the orphaned V1_ACHIEVEMENTS table (25 → 30 entries, same table — first business, marriage lasting 10 years, a child graduating, a business sold at a profit, a goal completed): 10 levels (0/100/250/450/700/1000/1400/1900/2500/3200 XP), a Timeline panel showing the level, XP to the next level, the next milestone and every earned achievement with the date it was earned; the panel shows the same live Legacy Score and reasons as the goals card (no second score); achievements already true on an old save are dated to when the game first noticed them, never backdated. A stakes dashboard on the Timeline ("What Is At Stake Right Now") lists real stakes from the real records only — open loans, a mortgage, a business losing money, a strained marriage, a parent or child in poor health, an untreated condition, an overdue checkup — each naming the person, the number and what happens if it goes wrong (the real debt chain and the 3-missed-payments business closure); a clean life says plainly "Nothing is at risk right now." The Marriage tab shows the spouse's portrait (the deterministic ink portrait every person card already uses; both wives where polygamy applies; nothing renders when single/divorced/widowed). Travel shows destination imagery in the ink/watercolor style — 12 new illustrations (Europe old town, Asia temple garden, tropical island, desert oasis, mountain lake, North America skyline, safari savanna, Mediterranean coast, plus new-life beginnings, vintage street, modern city, family hearth) mapped to all 102 vacation rows by id with a region fallback; at least two destinations look different. The Passport tab shows a drawn world map (inline SVG, no tiles or CDN — 720×360, capital-city dots coloured from the real records: home, citizen, visited, visa, none, with a legend and counts; a visa alone never counts as a visit, an expired visa colours nothing) and a drawn passport visual per passport held (country-coloured cover, the player's ink portrait, name, birth year and place, nationality, issue → expiry years, full citizenship list; no passport number is shown because the record has no number field — none was invented). The Finance tab gets charts drawn from the real ledger (inline SVG, no libraries): income vs expenses, cash balance (labelled cash, NOT net worth — a cash↔savings transfer writes two lines, so summing every account would double-count), business portfolio income, and net worth over time from new yearly snapshots recorded going forward (never backfilled — the chart says so); chart totals match an independent ledger aggregation (March bucket income 65,000, expenses 20,000). An era skin driven by the game's year: seven decade bands (The Sixties → The 2020s) with their own accent, tints, heading type and banner treatment (pre-1980 banners sepia/muted, 2020s crisp); the Timeline header reads "City, Country · 1962 · The Sixties (Chapter)". The new-life modal shows imagery (banner plus a 4-image choice strip: the chosen country's scene, vintage street vs modern city side by side with the selected era marked, family home captioned with the chosen tier). Illustrations 83 → 95 files (banners 30 → 42, portraits 32, furniture 21); all 83 pre-existing files byte-identical. Honest gaps, stated plainly: 5 old achievements are never auto-granted (returned_home, ten_countries, helped_family, survived_recession, returned_visit — the game keeps no visited-countries list, no cumulative-remittance total and no recession-survival record to check them against, so they are listed as upcoming, never falsely earned); a business sold at a profit is only granted if the engine saw the business alive before the sale (its capital is otherwise unknown — never guessed); the net-worth snapshot is recorded from renderApp and the Finance tab render rather than inside the yearly advance, so a year that passed with zero renders has no snapshot rather than a fabricated one; there is NO light/dark toggle in this copy (a single warm-parchment light theme — the era skin retints that base). Merge fixes by the coordinator (real defects, found by re-running the shipped tests on the merged tree): (1) RENDERS MUST NOT WRITE — the progress panel called evaluateProgress() during render, and granting an achievement writes a journal line, which consumes S.seq; every person created after that render then got an id one higher, and npcBondDriftAndDivorce compares spouse ids as STRINGS ('p_4' > 'p_39' but 'p_4' < 'p_40'), so the bond drift ran for a different partner and the NPC stream shifted — the UAE probe life lost its "A New Baby in the Family" scene and gained different scenes, and the render count fell 7,502 → 7,471. The render call is removed (progress is evaluated on real actions only, via the main.js hooks); the render count is back to 7,502 and the UAE life's scene trace is byte-identical to v2.12 with renders on. (2) A GOAL COMPLETED AT AGE 0 IS NOT AN ACHIEVEMENT — g_family completes on the first advance because a newborn's family already counts as a trusted circle, so the Goal Completed milestone fired for a newborn; refreshGoalsProgress now stamps doneYear/doneAge on the transition, and the achievement requires doneAge >= 1 (a goal done with no stamp, e.g. an old save, is never guessed). (3) 12 media-tool .json sidecars in assets/banners/ deleted before zipping. v213-verify (coordinator, independent) 37/37; worker verifies w1 64/64, w2 52/52, w3 31/31, w4 42/42; shipped tests on fresh unpack DATA_OK, UI_RENDER_OK 7,502, coherence 0, v212-verify 35/35, v211-verify 148/148, v210-verify 30/30; ESM 44 files 0 failures; bundle byte-identical twice (md5 a06d503b…); server fallback 200s.

## v2.12 — Dead-Text Purge & Action Density (2026-11-20, Overnight Round 4)

The audit found the game is text the player reads and cannot touch: Compounds 213/213 and Lands 101/101 dead rows, 206 disabled buttons with no reason, 2 genuinely dead buttons, and 7 screens offering one verb repeated up to 84 times. This round puts an action everywhere the player looks. Compounds and Lands listings each offer Save for this (a real staged goal in the same S.goals array, tracking saved amount vs price, with deposit goals that unlock the buy), Set a goal, Compare (two listings side by side on price, size, location, running costs), and a "View cheaper — only what I can afford" toggle (cash + savings + loan capacity; when nothing fits it names the single cheapest listing and the shortfall). Dead listings fall 28/28 → 0 and 24/24 → 0 in the audit persona's render (the audit's 213/101 counts every data row; the render shows 28 compounds and 24 lands for Egypt, and the actions live in the shared row template so every listing gets them). The Timeline journal gets filter by type (Family/Money/Health/Career/Business/World/Other — unmapped categories fall under an honestly labelled Other, never forced into a wrong type), word search, reactions (Cherish/Proud/Regret, stored on the journal entry so they survive save/load), and jump-to-year. Every disabled button now states why inline in plain words plus what would make it pressable, through one central lockReason helper (src/ui/lockReason.js): disabled buttons without a visible reason fall 206 (audit) → 0 in the re-count, with a 12/12 Buy-button sample naming the shortfall; label-complete buttons (e.g. "needs 93% · you scored 82%") are counted as self-explaining and not duplicated. The 2 genuinely dead buttons are gone: "School years over"/"Starts at 6" is plain text now (no alumni system exists to wire it to), and room-info opens a real room-detail card (number, name, size, floor, what the space is, Close button) on My Home, Compounds preview, and the Lands build-project floor plan. The Marriage tab labels the second-wife path honestly: a married Egyptian Muslim man now sees "Meet a second wife — through work / social circle" and "Meet a second wife — traditional family / Salonat match", with an intro naming his first wife and warning she will learn of it and can ask for divorce (engine helper additionalSpousePath reads the country's own profile per era; no second-wife path where the law forbids it). Both unwired perk strings are wired, not removed: a staff loan at the bank's own 1-year deposit rate with no markup (Egypt 2026: 13.9% staff vs 19.4% standard, same gates and repayment as any loan) and staff hospital treatment at about a quarter of the full private bill (display and charge read the same predicate). Verb diversity: Circle 1→6 verbs (call, visit, gift, ask for help, real conversation — each moves a number or opens a scene; a call is +4 affection, a visit +9, a gift costs real shop money, advice +3 smarts), Children 1→5 (play, teach, take out, homework), Pets 1→5 (feed, play, train, vet), Shop 2→6 (compare, save for later with an affordability reminder, ask the shopkeeper — whose verdict is computed against the category median price), Appearance 1→3 (5 haircuts and 5 outfits, each with a stated price and looks/charisma effect — a Skin Fade is +2 looks, +1 charisma, and the spouse notices), Travel 1→3 (plan it as a real trip plan with papers/money/dates, compare destinations), Cards 2→4 (check limit & benefits, pay with this card — the ledger line names the card — use the perk, once a year at the tier discount: classic 5%, gold 8%, platinum 10%, infinite 12%, islamic 5%). Merge fixes by the coordinator: W6's five muted "Need X more" spans (haircut, outfit, shop Cash, Hajj, travel) now use the central lockReason helper; the Compounds/Lands Buy buttons and the Adopt button, which the workers left without reasons, now carry lockReason spans (206 → 0 would otherwise have stopped at 53); one W3 hunk was dropped because W1 had already removed its button. v212-verify 35/35; worker verifies 42/42, 79/79, 9/9, 40/40, 93/93, 45/45; shipped tests on fresh unpack DATA_OK, UI_RENDER_OK 7,502, coherence 0, v211-verify 148/148, v210-verify 30/30; ESM 42 files 0 failures; bundle byte-identical twice (md5 104b16ce…); server fallback 200s.

## v2.11 — Businesses (2026-11-20, Overnight Round 3)

The audit found businesses thin: one at a time, no employees, no failure, profit landing gross and untaxed, zero business events, volatility and maxLevel decorative, a SaaS agency launchable in 1960, relocation forcing liquidation, the business vanishing on death, the three run actions clickable without limit, and a business running free alongside a full-time job. This round makes them real: up to 3 at once (55 venture types; 52 launchable in 2026, 37 in 1960), each with 3 named starting staff (wages, morale, skill; payroll in the settlement; morale moves revenue ~40% between morale 90 and 30 over a year), a monthly P&L posting revenue, costs (rent + wages + other, broken out) and tax on profit under the country's own brackets — the ledger credit is NET of tax — failure through the debt chain (miss 1 fee, miss 2 warning, miss 3 repossession/closure), volatility and maxLevel read by the monthly calculation, all three tables era-gated, 14 business events (pool 557→571) gated by actual state, premises (home ×0.8 revenue and level-capped at 2, or 4 rented commercial types; condition <60 → ×0.85, <40 → ×0.7; rent reviews stick), keep-or-sell per business on relocation (remote ×0.7 + manager wage + −1 reputation/month unless visited), inheritance to the will's heir or sale to the estate, run-op caps (R&D 12mo, bonus 3mo, pricing 1mo) with industry-varied labels, a business-loan product (Egypt SME 5%, USA SBA 7(a) 9.5%, Saudi Monsha'at 4%, fallback cd1Yr+7.5pp), and a workload model (full-time ~40h, part-time ~18h; over 50h/week → Stretched, stress +5, performance −2/month; full-time launch resigns). The launch list shows honest nets per venture (from-home full-time/part-time and rented full-time) computed from the same constants the P&L charges; part-time other costs scale ×0.75 so 43/52 ventures profit part-time with a full team (was 3/52). Merge fixes: fresh launches now seed 3 named staff (createBusiness left staff: [] — no wages, no morale, nobody to quit); the launch "Est. net" was revenue minus other costs only and the true-cost line double-counted the wage bill (the venture lump already includes wages) — both fixed, wage estimate now the exact seeded role wages. v211-verify 148/148; shipped tests on fresh unpack DATA_OK, UI_RENDER_OK 7,502, coherence 0, v210-verify 30/30; ESM 41 files 0 failures; bundle byte-identical twice (md5 9215a93a…); server fallback 200s.

## v2.10 — Story / Living World (2026-11-20, Overnight Round 2)

The overnight audit proved the game is a feed, not a story: 495 of 524
events (94.5%) fired and were forgotten, no chain ever reached a third
event, follow-ups completed 13% of the time, and in 30 lives no NPC ever
married, had a child, moved, divorced or left home — while the world
froze entirely whenever the player left a decision unanswered. This round
makes the life a story: NPCs live their own lives, choices come back a
second and third time, the life has named chapters, goals are quests with
steps, and the world keeps ticking while the player thinks.

- NPCs live their own lives (src/systems/soulEngine.js): siblings, children,
  nephews, nieces and grandchildren now marry (with a wedding the player
  hears about), have children (the player becomes an uncle, aunt or
  grandparent — the child is a real person who grows up), move city or
  country (for a real reason: a job, a spouse abroad, university — the
  distance changes the relationship), divorce (savings split by that
  country's law), leave home at 18–24 (university, work or marriage, with
  a real goodbye for the player's own child), and change jobs (hired,
  fired, promoted — their income and savings move, visible since v2.9).
  Every change is visible: a journal line, a scene, or a People-tab
  change. NPCs act from their own traits, age, country and era — a
  sibling does not marry at 12, a move abroad needs a real visa path.
  Counted in 30 lives, birth to 52 (seeds 2000–2029): 177 births, 85
  marriages (82 first weddings, 3 second wives where the law allows),
  22 divorces, 203 moves, 39 leaving home, 937 job changes, 45 deaths —
  every one of them visible to the player. The audit's 0/0/0/0/0 is gone.
- Event chains reach a third event (src/data/eventsEverydayFamily.js,
  src/data/eventsMoneyHealthCareer.js, src/systems/eventEngine.js): 524
  events became 557 (+33); chains now run parent → follow-up → reckoning
  (25 events at the third level, e.g. a father asks for a loan, pays it
  back, then pays it back again; a forgotten birthday, a mother going
  quiet, then a repair or a lost closeness). Follow-ups find the player:
  hot stories come back sooner, and no follow-up is blocked by wealth.
  Follow-up completion rose from 13% to 94.7% in the same 30-life method
  (8.47 follow-ups per life). A single knob (0.75) in the event picker
  can turn that down if it ever feels too certain.
- Named chapters (src/systems/storyLibrary.js, src/ui/views.js): the
  "<Month> Chronicle" label and the generic "LIFE CHAPTER & DECISION"
  kicker are gone. The Timeline is headed by the chapter the player is
  actually in — Early Childhood, School Years, First Steps, Building a
  Life, Family Years, The Long Middle, Later Years — with its beats (the
  goals and events of that stage, marked done or still open), and a
  chapter change is written into the journal as a milestone. Decisions
  are kickered "CHAPTER: <NAME> — A DECISION".
- Goals are staged quests, ambitions are tracked (src/ui/views.js,
  src/core/schema.js): each of the 5 goals now has steps with live
  progress on the Timeline (done ✓, current →, locked ○ until the step
  before is done). The ambition picked at birth is shown during life
  with a percentage and a reason, and its ending — achieved or failed,
  with the reason — is journalled once (only two ambitions can fail:
  building a business without a 6-person team by retirement, and a
  family dynasty with no children after 55). The live Legacy Score now
  shows why it is what it is, biggest reason first.
- The freeze is fixed (src/core/gameLoop.js): while a decision waits,
  the world keeps ticking — NPCs age, marry, die, move and have children
  — but the player's own age, year and turn do NOT advance until they
  answer, and the scene is never auto-resolved. Twelve blocked months
  bank one NPC year; 24 blocked calls moved a father's savings from
  100,000 to 178,536 over 2 NPC years while the player stayed exactly
  where they were. One honest limit: NPCs' numeric ages are read from
  the shared calendar, so while the player is frozen their ages do not
  rise — their LIVES advance, not the number.
- Verification (tests/v210-verify.mjs): 30/30 PASS on the merged copy.
  The three shipped tests pass unchanged (DATA_OK, UI_RENDER_OK 7,502
  renders, coherence 0 defects), ESM parse 0 failures across 35 files,
  bundle rebuild byte-identical. Counting note: marriages and divorces
  are counted once per couple — counting both partners doubles every
  wedding, and counting a cleared spouse link without checking the ex
  is alive counts widowhood as divorce (the first harness run did both;
  the corrected counts above are the honest ones).
- NOT in this round (next rounds): businesses (Round 3), dead-text purge
  (Round 4), visualisation (Round 5). No new tabs, countries, companies
  or jobs; no child-death build; mortality untouched (v2.9 proved the
  curve is not broken); no yearly upkeep billing.

## v2.9 — Connections & Visibility (2026-11-20, Overnight Round 1)

The overnight audit proved the game computes things and hides them, and
lies to itself in 11 broken links and 5 missing ones. This round is the
foundation: small, contained wiring fixes so every later round can be
verified against numbers the player can actually see. No new events, no
new businesses, no new tabs, no new systems.

- Mortality probe FIRST (before any other change): the audit flagged 5 of
  8 seeds dying at 29, 46, 49, 53 and 62. A proper probe (60 full lives,
  different seed per life, complete states) says the audit's 5/8 was a
  small-sample artifact: median death age 77 (v2.6 stated 75), 20% reach
  90, 18% die before 55 — the last number matches v2.6's own honest
  caveat about bot lives never booking checkups. The curve is NOT broken
  and the mortality model was NOT changed.
- The ledger is visible at last: Finance → Cashflow now shows the real
  transaction history from S.ledger itself — last 40 lines, newest first,
  date, description, category, signed amount and running balance,
  filterable by type. Any pound in the balance traces back to the line
  that moved it.
- Goals are live: the Timeline shows all 5 goals with progress, and the
  Legacy Score is shown DURING life (the exact death-summary formula),
  not only at death. The ambition goal label now says 6× Annual National
  Salary, matching the rule that marks it done (it wrongly said 10×).
- The blocked account (Sperrkonto/GIC) has a screen: Finance shows its
  balance and monthly release whenever one exists.
- NPC savings are visible: People cards show what each family member
  holds in savings of their own, in plain words.
- Spouse income reaches the household ledger under EVERY split. Under
  the default traditional provider the spouse puts in 25% and keeps 75%
  (it used to contribute 0); shared 50/50 stays 55% in, proportional
  stays 40% in. The ledger line names who earns what, who keeps what,
  and what lands in the shared pot. No double-count: the spouse's own
  savings only grow on what they kept.
- ONE health-insurance flag: S.medical.healthInsurance is the single
  source of truth, synced on hire/resign/toggle. The rule, stated
  plainly: a private policy pays about a quarter of a private bill; any
  other confirmed cover (employer plan, NHS, public system) pays 45%
  off; with no confirmed cover — typical cover in the USA, limited cover
  in Egypt, or unemployed — the bill is charged IN FULL. Being merely
  employed no longer gives a discount (that was the old bug: the charge
  was 45% off while the screen said "charged in full"). The Career tab
  no longer claims employment alone cuts a bill, and minor-condition
  treatment uses the same rule instead of its own old inline discount.
- Marriage goes through the couple record only: the two direct writes
  (a divorce fallback and a widowhood branch) now rebuild and close the
  couple record, so stage history, status and contract stay in sync.
- Dead records dealt with: S.player.career is now a live mirror of the
  real job (it was a stale birth-time copy saying "Seeking Work" — it
  could not be deleted safely because generic person code can read the
  player's career); S.habits is deleted (nothing ever read or wrote it).
- Rented homes resolve: a new shared resolver finds a rented catalogue
  unit (with its real rent and landlord) as well as owned homes, so the
  settlement charges renters correctly instead of silently missing.
- Withheld salary is visible: the Career tab shows a persistent "Salary
  Withheld" card while pay is withheld — what is withheld, why, and
  when it clears.
- Small fixes: both direct cash/savings bypasses of walletMove (FX on
  country move, car-sale proceeds on emigration) now go through
  walletMove; gold in net worth is valued at the live price (a child
  holding gold used to report it at 0 before their first monthly tick).

### Still open (not this round)
- The ambition goal label fix above; the 6× rule itself is unchanged.
- Rounds 2–5 follow in order: story/living world, businesses, dead-text
  purge, visualisation. The child-death design, playtest, Pets edit and
  settlement-net question are still Elsayed's.

## v2.8 — Career Rebuild (2026-11-20)
Elsayed played the Career tab and said it has no detail, no options and no
actions. This round rebuilds the inside of a job — the pay, the contract,
the ladder, the people, the choices — without adding a single new company
name, job title or career track (472 employers and 83 tracks stay as they
are). No new tabs.
- The leftover "Uni, IELTS & Licensing Boards — now live on the Education
  tab" stub is gone from the Career tab, and the two remaining pointers to
  the old Career boards page (Saudi hospital hiring, UK NHS sponsorship)
  now point at the Education tab, where the boards live. No other tab
  carries a "go to another tab" stub.
- The payslip is real now: gross, then every deduction named (income tax
  on the country's real brackets, social insurance, the pension part
  inside it), then overtime pay, then the net — and the net is exactly
  what lands in the household money that month. One number, not two.
  Correction, stated plainly: the old card said a Nile Air Cadet Pilot on
  9,461 EGP a month took home 6,800 (a flat 28%). The real breakdown
  gives 6,400 (tax 2,020, social insurance 1,041). The old figure
  understated what comes off by about 400 EGP a month. The pay itself
  did not change — only the honest breakdown of it.
- The contract is on the card: permanent or fixed-term, probation, notice
  period, the real number of vacation days (the same number a trip
  spends), sick leave, what you get when you leave under that country's
  law, shift hours, base or office, team size, who reports to you.
- The ladder shows every next step with its pay and what it needs (years,
  hours, exams, licence, performance), and where you stand against each
  requirement. Performance is broken into attendance, quality of work,
  teamwork and the manager's view of you, with what raises and lowers
  each. The yearly review is a real meeting with your manager, not a
  silent number change.
- Benefits are the same records the rest of the game sees: the job's
  medical cover is the cover the Medical tab sees, the pension is the
  pension the retirement system sees. A pilot's staff travel is real:
  the flight part of a trip costs a tenth for an employed pilot.
- Actions: work pace with real hours and the country's real overtime
  rate (no more flat +15% everywhere); take on a project, mentor, cover
  a shift — and the manager remembers who stepped up; train and renew
  licences (the same licences the Education tab shows); ask for a raise,
  a better shift, more vacation days, a transfer or a bonus — and a
  refusal says why; transfer to another country is a real move through
  the visa system, with a new sponsored job there, not the same desk;
  vacation, sick, parental and unpaid leave from the real limits, with
  the manager able to say no; promotion is apply, interview as a scene,
  then an offer or a rejection that says why; praise, argue with and ask
  colleagues and your manager for help or a reference — the People tab
  records move; warnings come first (three warnings, then dismissal
  with the country's severance), and resigning means serving your notice
  period, with a reference that depends on how you left.
- Part-time and cash gigs are rebuilt: every gig states the work, who
  pays, how much, how many hours, when, what it needs and what it risks.
  Pay follows the country's real wage for that work, not a flat formula
  (a barista in Egypt in 2026 pays 5,000 EGP, the figure the gig data
  always stated). Gated by age, era, country, skills and visa: a student
  visa allows 20 hours a week, and work beyond it — or undocumented
  work — carries a stated risk of being caught, fined, or sent home.
  The hours come out of study and work: grades and performance fall if
  you overdo it. Skilled adults get real freelance and consulting with
  named clients from the real employer list.
- The job market shows the inside of each listing: what the job involves,
  the ladder it leads to, contract, hours, location, benefits, and every
  requirement with met or not-met and the reason ("needs 2 years'
  experience — you have 0"). The pay shows the full breakdown, not just
  a gross number. Applying is a process: interview as a scene, then an
  offer or a rejection that names your score and your weakest area.
- Trips now spend vacation days: a Sharm trip uses 5 days of your paid
  leave, from the same balance the job card shows.
- Not yet wired, stated plainly: teamwork has no system moving it yet
  (the card says so); countries with only "typical" or "limited" health
  cover show that cover as unconfirmed; allowances are inside the gross
  pay, not listed as separate lines; a transfer means a new sponsored
  job abroad, not the same employer; parental and unpaid leave are taken
  off the money straight away rather than pausing next month's pay; the
  old silent automatic promotion is still there alongside the new manual
  apply-and-interview path; every job offer is permanent full-time with
  the real probation months (no contract-type variety yet); and there is
  still no bicycle in the shops, so gigs that need one stay locked with
  the honest reason.

## v2.7 — Elsayed's Own Playtest Fixes (2026-11-20)
Elsayed played the game himself (Ramy Radwan, Egypt, age 15) and reported
what was wrong. This round fixes his list, in his order. No new features.
- The Strategic Life Blueprint & Compass are gone from the main page. A
  preset adult life plan does not belong on a schoolboy's screen, and no
  replacement preset plan was added.
- Education: Tansik no longer shows a result or the university list at 15.
  Before the exam at 18 there is only a labelled projection ("If you took
  the exam today, you would score about X%") that moves as academic skill
  and effort change. Cutoffs now differ by university and by year, from
  real Ministry of Higher Education figures where they exist (2024
  Medicine 93.2%, Dentistry 92.8%, Pharmacy 91.7%; 2023 Medicine 91.3%),
  with modelled numbers marked as modelled. Scholarships and internships
  show locked with the plain reason until the player meets their gates
  (age, degree, language, work) — no live Apply button before then.
  Tracks follow the school: switching to British, American or French
  means changing school, with the cost, loss and gain stated first.
  Duplicated sections fixed (each renders once). A university choice
  shows who pays and whether it is affordable BEFORE the choice, with
  the real paths (cheaper university, scholarship, loan, work) when not.
- Money: a schoolboy's income is now named — pocket money from parents,
  a real rule by family wealth, shown in the game. The savings balance
  is explained, and "Deposit 50%" says what it does. Egypt is NOT a
  tax-free jurisdiction: the false label is fixed with the real Egyptian
  tax rules (0% on the first 40,000 EGP a year, then 10%–27.5%); only
  the UAE and Saudi Arabia are labelled tax-free.
- Events wired to real systems: the washing-machine "buy a second-hand
  replacement" choice now buys a real second-hand washer from the shop
  catalogue at the shop's price, charged through the ledger, and the
  washer is delivered and owned afterwards. The same wiring was
  spot-checked across other buy/repair event choices (fridge, phones,
  sofa, tyre, kettle, mattress, trainers).
- Real estate: a home you do not own (the parents' home, a rented flat)
  now shows as "where you live" — who owns it and what it costs — with
  no furnishing, customisation or CAD controls. Those belong only to
  homes you own. The CAD view is simplified further: one "Change how
  you see your home" control in plain words, no technical toolbars.

## v2.6 — Budget Is Cheapest + Death Has a Cause (2026-11-20)
- Furnishing: Budget is now the cheapest of all 11 styles. Minimalism is
  expensive, as it should be — it is designer pieces now (Vitra, Cassina,
  B&B Italia, Arper, HAY), 1.30x the Premium tier, about 5.4x Budget for a
  living room. The cheapest option the game suggests when you cannot afford
  a style is Budget.
- Mortality rebuilt from aging and disease, not from a bare death chance.
  Every death now has a specific cause — a named disease and its stage, a
  heart attack, a stroke, a car accident, old age. The median death age in
  test lives rose from about 51 to 75, and about 1 in 4 lives reach 90.
- Aging is lived, not a number: the stairs feel heavy from your late 50s,
  memory starts slipping from your 60s, knees ache, eyesight fades — and
  staying fit genuinely slows the decline. Hit the gym (new buttons in the
  Medical tab) and the decline slows; ignore the signs and it does not.
- Diseases are staged and treated with real odds: cancers are found at
  stage I-IV (regular checkups find them earlier), and treatment can work
  or not — chemotherapy included — depending on the disease, the stage,
  your age and the care you get. Private and public care have real costs
  and honest odds shown before you choose. Dementia (Alzheimer's) and
  prostate cancer are now in the game as real conditions.
- Treatment lives in the Medical tab (Lifestyle → Hospitals, Diagnostics
  & Prescriptions): each serious condition shows its stage and a Treat
  button with the exact cost and the honest chance, and the same treatment
  is offered when a disease is first diagnosed.
- Research behind the numbers: American Cancer Society / SEER cancer
  survival by stage, American Heart Association heart outcomes, US Social
  Security life tables, UN life expectancy — full source list in the
  delivery notes.

## v2.5 — Events That Keep Coming + Education as Its Own Tab (2026-11-20)
- 524 new random events join the game (262 everyday/family/marriage/
  children/friends, 262 money/health/career/school), so a whole life now
  brings roughly 140 pop-ups instead of about 30, about 2 a year, the
  way a life should feel — including follow-up chains where an event
  comes back later, and events started by other people, not only by you.
- Every event only fires when it fits your actual life: no marriage
  events while you are single, no bill-struggle events while you are
  rich, no school events after you graduate, no child events without
  children, no job events without a job — and the same logic for era,
  country, age and everything else.
- Events are wired into the game, not just words: a bad family event
  really lowers how that person feels about you, a money event really
  moves your money, a health event really changes your health.
- Education is its own tab again: choose and change your school (real
  tiers and real prices), pick a track, hire a tutor, study hard, join
  clubs, apply for 12 named scholarships and 14 named internships, and
  apply to universities from the full list for your country with real
  entry cutoffs — and you pick the major yourself, the game no longer
  picks it for you.
- 40 schools were re-tiered correctly: famous private and
  international schools that were wrongly listed as state schools
  (Eton, Harrow, Cairo American College and others) now show their
  real tier, while genuinely free state schools stay state.
- Two things to know: chain delays are measured in calendar months,
  so school chains still work across the game's yearly and monthly
  turns; and university tuition is checked when you enrol, but not
  charged yet — charging it is a new money decision, not taken here.
- v86.63 saves do NOT load in 2.x (different save format).

## v2.4 — Furnishing Prices by Room, Size and Year (2026-11-19)
- Furnishing a room now costs what that room really costs: the price
  comes from the room itself (a kitchen costs more than an office, a
  living room more than a bathroom), scaled by the room's real size in
  square metres, and adjusted to the year you furnish it in — a room
  furnished in 1970 costs 1970 money, one in 2025 costs 2025 money.
  The old flat price for every room is gone.
- There are now 11 furnishing styles to choose from — Budget, Modern,
  Luxury, Vintage, Antique, Ultra, Minimalism, Classic, Scandinavian,
  Industrial and Bohemian — each a real choice with its own look, the
  pieces included for that room, materials and colours, brands, price,
  and what it gives your home (happiness, value, yearly upkeep).
  Minimalism is the cheapest style, because it uses fewer pieces —
  if Budget should be cheapest instead, that is a pricing decision
  still open.
- 21 new ink/watercolor drawings of furnished rooms (one for each
  room, plus a different living-room look for each style) are shown
  with the choices, fully visible in a fixed frame — nothing cropped,
  cut off or stretched, on a computer or a phone.
- The wedding refusal message now adds up: it says the total first,
  then lists the parts inside it (venue, prompt Mahr, remaining home
  setup), and leaves out any part that is zero.
- Tapping a home action (furnish, upgrade, renovate, change the front,
  change a room's use, extend the home) for a home that is not yours
  now refuses plainly and changes nothing, instead of quietly acting
  on your first home.
- The Nile Care Hospital's 1950 founding year is now marked in the
  game as modelled and unverified — the hospital itself is unchanged.
- v86.63 saves do NOT load in 2.x (different save format).

## v2.3 — Property Drawings & Floor Plans Fixed (2026-11-19)
- The floor plans are fixed and readable: every room name in the room
  list is now complete (no more names cut off mid-word), the Apartment
  list shows all 9 rooms including the Study (19 m²), and every list
  total adds up to the rooms shown. Room labels fit inside their rooms,
  rooms no longer overlap each other, and every door sits on a wall.
- The drawings themselves are cleaner and read like a home, not a
  technical document: plain words instead of building jargon, bigger
  readable room labels, furniture you can actually see, the terrace
  joined to the plan instead of floating below it, and the view and
  sunlight controls now visibly change the drawing itself.
- Furnishing a room now works on the room you tap, in the home pictured,
  with a choice of quality and an honest price — and the count shows
  real rooms (a studio has 4, a villa has 10), not a fixed 6.
- The drawings are layout diagrams, not to scale — the room sizes in
  the list are the real sizes. One small strip in the Apartment plan
  (28 × 64, under 1% of the plan) is left as a wall void on purpose.
- v86.63 saves do NOT load in 2.x (different save format).

## v2.2 — Drawings Back + Double-Click to Play (2026-11-19)
- The ink/watercolor illustrations are back (see notes for the full
  list), and the game now opens by double-clicking index.html —
  no local server needed. The game's code is bundled into one file
  (dist/world-life.bundle.js, built from src/ by scripts/build.mjs;
  rebuild with `node scripts/build.mjs`). Saves still use the
  browser's local storage and work from a double-clicked file.
- start-game.command + serve.py are kept as a fallback only.
  Note: a save made by double-clicking and a save made through the
  server live in different browser storage, so the two ways do not
  share saves — pick one way and stick with it.

## v2.1 — Fill the Missing: Clean, Connected, United (2026-11-19)
Elsayed: "i like the new game fill the missing but this time no ai slop
like the new game it suppsed to be clean version connected united".
World Life 2.0 becomes the game going forward; v86.63 stays as data
source and legacy reference. v86.63 saves do NOT load in 2.x (different
save format).

### Filled (data)
- Marriage profiles: 486 fields marked missing → 0, across all 18
  countries, every leaf with a source note. Full researched profiles
  added for Switzerland, Sweden and Turkey. Degraded leaves restored
  from v86.63 (Egypt era steps, polygamy spouse-reactions, UK/US
  spouse-route requirements, step documents).
- Banks: 102 → 129 (111 for the 15 + 18 for che/swe/tur), incl. Arab
  African International Bank; savingsRate on every bank; the two bank
  tables unified into one object.
- Properties: compounds 203, districts 106 (309 total), housing
  catalog 104 → 240, land plots 129, new DEVELOPERS table (54).
- Hospitals 64 → 74 incl. Nile Care Hospital (new, memory-sourced;
  founded year UNVERIFIED — see notes). Universities 103 → 125.
  Schools 95 → 104. Employers 7 countries/173 names → 18
  countries/474 real names, invented fallbacks removed.
- Countries: 15 → 18 (Switzerland, Sweden, Turkey full birth
  countries). Skilled-migration + study-abroad rules added for all
  three (Swiss B→C, Swedish work→PR, Turkish Law 6735/6458).

### Clean (no AI slop)
- All 48 illustration files deleted (21 banners + 27 portraits, 7.8 MB);
  0 real photos sourced this round. Initials avatars replace portraits;
  tab headers render with no image.
- Three shipped tests fixed: they called `print(...)`, which was never
  defined, and crashed on their last line. `print` is now defined
  (console.log); the checks are unchanged.
- Dead code removed (5 dead exports, 3D stubs, decorative sketches,
  soul-manifold tesseract, card/vault SVGs, ink-portrait branches,
  unused banner CSS). "92 tracks or 580+ employers" now computed from
  data (83 tracks, 173 employers in 2026).

### Connected, united
- One couple record (`couples[]`) for dating/engagement/wedding/mahr/
  residence/divorce. Union type comes from the country's own profile
  for the era (Saudi religious any era; UAE pre-2020s religious, 2020s
  religious for a Muslim couple / civil for a non-Muslim couple).
  No country name in code.
- Mahr promised-vs-paid; divorce/widowhood settle only the owed
  remainder. One shared spouse-relocation plan (fee charged once);
  a moved spouse gets a real job, never a converted figure.
- One money ledger (`walletMove` everywhere), one `purchase()`
  choke-point, one monthly settlement, full missed-payment chain
  (late fee → score → warning → repossession/foreclosure).
- One visa state machine (`transitionResidency()`); expiry enforced
  for every visa kind; citizenship is an application, not an
  auto-grant; salary stops when undocumented; renting and new credit
  need valid status. Golden-visa years do NOT count toward PR
  (the game says so plainly).
- One Person record (player in `S.people`), one ageing site, age
  advances on the birth month, one seeded RNG (last `Math.random`
  removed).

### Still open (not this round)
- Photo sourcing: 0 real photos in this build. Banners/portraits are
  gone, not replaced. Sourcing verified real photos is a future round.
- Nile Care Hospital founded year is UNVERIFIED (no public record of
  a standalone "Nile Care Hospital" found).
- `continueAsChild` still discards the old player instead of moving
  them into `S.people`.
- Coherence D3 (recurring Saudi Iqama-expiry scene) is a known flake:
  it appeared once in a worker's first run and on the pristine v2.0
  baseline, then 0 in every later run (5 runs here).
- Mortality curve / life-to-90, child-death decision, playtest, Pets
  edit, settlement-net question — still Elsayed's.
- v86.15 original zip and v86.63 zip untouched.

## v2.0 — Elsayed's upload (2026-11-19)
World Life 2.0 as uploaded (`world-life-2-fixed-launcher-mac.zip`):
ES-module codebase, Mac launcher (start-game.command + serve.py on
port 8765), 15 countries, 1,111 cars, 83 career tracks.

## State-aware events update

- Added 22 globally playable personal and relationship events, including job searching, creative projects, friendships, family conversations, grief, community activities and living abroad.
- Added explicit living-cast requirements to 329 existing random events. Parent, sibling, friend and partner scenes now need those people to exist and be alive.
- Added parent-grief events that require a real deceased parent. Living-parent context no longer returns deceased people.
- Recheck random scenes when the world changes and before a choice runs. Bind new queued scenes to their original people so another friend or partner cannot silently replace them.
- New stories respect age, employment, study, era and country context. Follow-ups wait for their earlier story; relevant new stories have room in the existing event roll without adding more pop-ups.
- Added an automated consistency test suite. Run: npx --yes esbuild@0.28.2 tests/events-consistency.test.js --bundle --platform=node --format=cjs --outfile=/tmp/events-test.cjs && node /tmp/events-test.cjs
- Rebuilt the prebuilt browser bundle. Existing save format and art files are unchanged.
