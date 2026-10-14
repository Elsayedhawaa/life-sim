# LIFELINE — PROJECT MAP  (paste this at the start of every AI chat)

Plain HTML/CSS/JS game. No build tools. Open index.html in a browser.
Scripts load IN ORDER from index.html and share one global scope (that order matters).

## Folders
css/style.css                      all styling
js/01-data.js                      data tables (schools, careers, costs, shop items, events)
js/02-state.js                     game state S, helpers, new game, save/migrate basics
js/03-views.js                     original tab screens (life, school, career, assets...)
js/04-actions.js                   original button actions (enroll, apply, buy, pay...)
js/05-ageup.js                     original yearly tick: ageUp()
js/06-setup.js                     start screen
js/07-era-pack.js                  years 2007+, prices by year, phones, cars, family, economy
js/08-countries-abroad-love.js     countries, study abroad, immigration, love
js/09..23-*.js                     later feature layers ("phases"), in order. Newest = highest number
js/90-hooks.js                     GameHooks: the ONLY way new features plug into year/newGame/migrate/render
js/24-egypt-housing.js             Egyptian developer market: compounds, unit types, installment plans, contracts (uses GameHooks only)
js/25+ (new files)                 new features go here, loaded after 90-hooks.js and before 99-boot.js
js/99-boot.js                      starts the game. MUST stay last

## DANGER ZONE (why bugs happen)
Older phases REPLACE earlier functions by wrapping them:
    const P20_ageUpBefore = ageUp;  ageUp = function(){ ...; P20_ageUpBefore(); }
So one function can be defined in many files. Counts (wrapped copies):
    ageUp: 14
    render: 11
    migrate: 9
    newGame: 6
    choose: 5

To find everything that touches a function, search ALL files for its name,
e.g.  grep -n "ageUp" js/*.js

## RULES FOR ANY AI EDIT
1. NEVER add another wrapper (const X_Before = fn; fn = function...).
2. New feature = NEW file js/NN-name.js (NN = 25, 26...), added in index.html AFTER 90-hooks.js and BEFORE 99-boot.js.
3. Plug in with GameHooks.on('year' | 'newGame' | 'migrate' | 'render', fn). New saved data: add the field in a 'migrate' hook so old saves don't crash.
4. Only change the files you are told to. Show full changed functions, not fragments.
5. After every change run:  node test.js 60 lifeline/index.html   (must show no errors)

## ROADMAP
Stage 1  DONE   split into files (behavior identical to original, verified)
Stage 2a DONE   js/90-hooks.js added (freezes the old chain; new features use hooks)
Stage 2b LATER  merge old wrapper chains one function at a time, testing after each. Note: P21's two ageUp wrappers are bypassed by P22 (dead code).
Stage 3  DONE   js/24-egypt-housing.js (tests: node test-egypt.js lifeline/index.html)
Stage 4  IDEAS  rent-vs-buy lessons, bank mortgage vs developer plan comparison, resale market in compounds
