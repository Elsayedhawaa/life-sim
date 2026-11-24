# Simultaneous product/service catalog, planned next tranche

User request: many specific products and services per business, active at the same time, with real differences in price, direct cost, demand and results. Cafe examples are latte, cappuccino, mocha, americano. This is not fulfilled by the current one-range specification choices.

## Accounting and capacity contract

- One product record per catalog item: active, price, direct-cost quote, stock, pending order/invoice, sold, lost demand, revenue, direct costs and contribution.
- Shared company staff, premises, equipment and location capacity. Every item uses a defined number of capacity points. Sum of allocated points cannot exceed the company capacity.
- Each item has a demand weight and price elasticity. More active lines split a bounded customer pool, not multiply demand without limit. Additional variety may improve coverage by a capped amount only after validation.
- Prices and costs must use the same integer quotes in UI, orders and settlement. Saved order and work-in-progress quotes never change retroactively.
- Stock sectors use item-specific receipts and stock; invoice charged only when delivered. Inventory purchase remains a cash-basis statement line, with per-item sold input consumption shown separately as contribution, never called company accrual profit.
- Services charge direct input cost per completed unit. Construction and crop lines need their own WIP lot, completion date, committed price and input budget.
- Software needs products/plans distinguished from audiences: users belong to products or exclusive plans, free-user hosting still costs money, and audiences cannot be cloned by enabling another paid tier. Monetised quantity and unit price remain exact identities for each line.
- Revenue equals the sum of line quantity times line price. Costs equal shared fixed/payroll/rent plus actual stock invoices and direct-service/WIP spending. Investor distribution and reserve coverage continue from that one statement.
- Product pause stops new orders/production; existing stock and WIP remain visible and continue their explicit disposition, not silently deleted.

## Migration boundary

Do not relabel old aggregate stock as eight invented item lots. Introduce an explicit catalog transition at a clear-stock/no-pending-order/no-WIP boundary, or retain legacy range mode until that condition is met. New companies can start item mode after their niche is chosen. Preserve old settled P&L and history. Currency migration must cover all item quotes, receipts, invoices, WIP, and historical amounts.

## UI

Products: active catalog first, compact item cards showing price, unit input, sold/available or service workload, contribution and pause. Collapsed add-product list grouped by actual niche. Item order quantity and price controls belong to that item. Company statement shows a collapsible line reconciliation. Operations retains supplier/routine/activity choices, with no competing generic price field.

## Initial catalog coverage

- Food: espresso, americano, flat white, latte, cappuccino, mocha, tea, pastry. Lunch/catering need their own food lines rather than coffee labels under every niche.
- Retail: household essentials, gift/stationery, or electronics catalog tied to chosen niche.
- Pharmacy: sealed first-aid kit, adhesive dressings, gauze, thermometer, oral-care kit, personal-care products, care supplies. No invented treatment advice or regulatory clearance.
- Construction: painting, plaster repair, floor installation, bathroom refit, kitchen fitting, accessibility adaptation, extension shell, commercial fit-out. Distinct project duration and capacity.
- Manufacturing: concrete furniture/textile/consumer-goods lines matched to niche, with material costs, production workload and rejects.
- Farming: distinct vegetable/fruit/protected crops with individual growing cycles, crate yields and input budgets.
- Logistics: local parcel, express parcel, timed delivery, bulky item, scheduled trade route, refrigerated consignment, document courier, returns collection. Distinct route workload and handling costs.
- Clinic: standard consultation, extended consultation, follow-up, routine health review, employer assessment, nurse appointment, documented diagnostic appointment, specialist assessment. Simplified licensed-staff gates, no clinical recommendations.
- Education: subject group course, individual tuition, exam cohort, language beginner/intermediate course, adult evening course, employer workshop, assessment session. Student/teaching capacity cannot be double counted.
- Software: niche-specific products/tiers, exclusive customer allocation, support workload, hosting and one-time/subscription/advertising/transaction model preserved.

## Verification before publication

Every line has distinct nonzero values and visible outcomes. Test 2+ simultaneous products in every sector, capacity conservation, no demand cloning, price changes, stock receipts/delays, WIP timing, pause/resume, zero inventory, actual household cash, reserve/distribution, currency conversion, reload and repeated-month guards. Fresh phone flow for each sector plus screenshots of multiple sold item lines and the reconciled company total. Existing broad test failures remain disclosed.

## Linked role-level staffing requirement

Latest user request also requires visible headcount by role and junior/senior tier, missing people and the real output effect. Derive a workload plan from active items and target capacity, not total headcount alone. Each catalog line needs role-work requirements; shared support roles scale with total work/locations. Founder contribution is limited and cannot fill protected professional roles. Show planned/current/missing and bottleneck output before hiring. Distinguish experience tier, wages and effective work capacity; existing staff retain their known experience/skill without silent demotion. Junior workers can contribute under senior supervision where the model needs it, never invent real legal qualification rules. Hiring, training, promotion and payroll must change the same staff records used by settlement. Keep old Team roster usable, not a second competing employee list.

## Verified boundary before implementation

Growth tranche 6cabb44, hosted bundle 8a404986e5b5, all ten hosted phone growth flows verified. Ninety focused files and 81 navigation checks green. Only untracked planning document for this tranche, no catalog implementation or new staffing mechanics yet. The other pre-existing untracked property-catalog-next.md is unrelated and must remain untouched.

## Local groundwork added after growth publish, not wired or shipped

- src/systems/companyCatalogData.js: eight concrete initial lines per sector and niche overrides for lunch/catering, gifts/electronics, textiles/consumer goods, fruit/protected crops. All values are original game assumptions. Software defaults still need niche-specific catalogs before integration.
- src/systems/companyItemLedger.js: pure simultaneous-line subledger with bounded demand, shared capacity, item stock and receipt invoice, direct consumption/contribution, WIP and historical sale quotes. Initial tests pass in all ten sector shapes, but this is not sufficient validation. Resolve capacity reduction during already-reserved WIP correctly, paused WIP, stockout demand, exact WIP spending, multiple completion dates, capacity conservation and funding before integration. Do not call the current test a complete ledger audit.
- src/systems/companyWorkforce.js: tier metadata plus a pure role/workload shortage and bottleneck plan. It is NOT wired into hiring, wages, UI or settlement. Needs stable base-capacity units for software rather than self-referential capacity, sector/niche-role validation, staffing role additions that do not break old staff surfaces, and founder/supervision rules. Current junior/senior work/wage factors are game design assumptions.
- tests/company-item-ledger.test.js and tests/company-workforce.test.js: initial module shape/identity checks only. Existing 90 focused files were last run before adding these unconnected modules. No new build since growth publish, and no live behavior changed by this groundwork.

Next: audit/fix pure ledger; implement catalog transition and action/UI layer; integrate one monthly settlement path without running old aggregate revenue/costs twice; implement niche-specific software audience allocation; wire role/tier hiring and shortage UI to the same staff/payroll; currency migration; full regression and phone test matrix; inspect pixels; publish and verify hosted bundle. The raw user asks remain unfulfilled until these steps land.

Latest groundwork corrections: WIP now advances in proportion to allocated shared capacity, pauses with zero capacity and pays only new progress, retains old sale quote, and finishes already-started jobs even if their line is paused. Tests cover delayed receipt invoice and stockouts too. Capacity-used total is derived from actual per-line work, not clamped to hide oversubscription. Software has niche-specific line names in data now, but audience allocation/income model remains a required integration step. Workforce uses a fixed software base of 1000 work points, not the live capacity result. Re-run its tests when integrating, current numbers are uncalibrated game assumptions. No new game build or publish after growth 6cabb44.

## Integration checkpoint, 07:44 Cairo, NOT PUBLISHED

The previous groundwork-only state is superseded LOCALLY:
- Added src/systems/companyCatalog.js with explicit enable transition (open company, aggregate stock/orders/WIP clear), item activation/pause, price reviews, saved invoices, non-tech monthly settlement, item UI and workforce UI.
- companyLifecycle.js routes catalog companies to the new settlement; retains aggregate old mode for others, suppresses aggregate pricing/orders when catalog enabled.
- techStartup.js uses the pure ledger to split existing billable audience among active lines, adds line service costs in addition to all-user cloud cost. Needs thorough niche/model review, one-time copies and ad/transaction units in particular. Do not call it ready yet.
- main.js catalog action handler and tier passed to existing hireBusinessEmployee; views.js renders catalog/staffing/line reconciliation; operating spec picker hidden in item mode.
- businessStaff.js permits item/support roles and optional tier with real onboarding and recurring wages. Current broad added support list is too permissive and needs per-sector restriction. Default old hires preserve behavior.
- businessLegacy.js attempts catalog currency conversion but likely double-converts aliased last/history/lastResult row objects. MUST audit/fix before shipping.
- workforce per-person productivity is now based on fixed sector baseline rather than upgraded premises, so expanding buildings does not make one worker magically faster. Tests adjusted accordingly. Junior/experienced/senior still model assumptions.
- pure ledger rotates allocation for tiny project demand so the first catalog line cannot permanently monopolise one-unit markets. WIP preserves price/cost/progress and pauses on no capacity. Re-audit demand fractions, low-volume fairness, costs and capacity sums.

Current new file: tests/company-catalog-integration.test.js, ten-sector enable/tier hiring/sales identities passes. Prior pure tests pass. Existing 90 focused suites not yet re-run since integration. Local build completed, latest bundle 4096KB, NOT committed/pushed. Hosted remains growth 6cabb44. Working tree now tracked integration edits plus untracked modules/tests/plan. Preserve unrelated docs/property-catalog-next.md.

Phone script /tmp/life-ui-tests/company-catalog.cjs selects old operating choices then enables catalog, activates four lines, fills shortages with senior hires, orders/settles/reloads. Local food/construction/clinic passed before last small wage/baseline-demand changes. Local screenshots /downloads/catalog-food-items-local.png and catalog-clinic-staff-local.png were inspected: readable at 390px, actual espresso/americano quantities and staffing required/current. NO screenshots sent to parent yet, because accounting/migration and other sectors unverified. Need rerun all nine sectors and software, plus full tests. Branch growth previously hosted is unaffected until publication.

Next immediate safety work: currency alias correctness; per-sector allowed roles; tier wage preview correct across currencies; fixed-base demand independent of expansion; catalog enable cash/stock/WIP migration cases; actual household reserve/distribution identities; old generic last-month quantity/price labels may mislead for mixed items; software audience/line effects and staff requirements; promote/tier details not yet added. Then phone/pixel verification and publish only after real checks. Parent last told integration is local and not ready.
