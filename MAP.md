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
1. NEVER add another wrapper (const X_Before = fn; fn = function...). Edit the real function instead.
2. New feature = NEW file js/NN-name.js, added in index.html BEFORE 99-boot.js.
3. New saved data: add the field in migrate so old saves don't crash.
4. Only change the files you are told to. Show full changed functions, not fragments.
5. After every change run:  node test.js 60 lifeline/index.html   (must show no errors)

## ROADMAP
Stage 1  DONE   split into files (behavior identical to original, verified)
Stage 2  NEXT   merge wrapper chains into single clean functions (ageUp, render, migrate, newGame, choose)
Stage 3         js/24-egypt-housing.js: unit types, developer installments with interest, compounds
