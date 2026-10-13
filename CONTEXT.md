# Lifeline — project map (give this file to the AI first)

Single-page life-simulation game. Plain HTML + CSS + JavaScript, no build tools.
All JS files are classic scripts that share ONE global scope and load in the
numeric order listed in index.html. Order matters: later files patch (override)
functions defined in earlier files.

## Files
- index.html — HTML shell only (start screen, game screen, phone modal) + script tags
- style.css — all styling (dark theme)
- js/01-data.js — game data tables (schools, careers, housing, events, etc.)
- js/02-state.js — state `S`, newGame, helpers, save/load, render()
- js/03-views.js — original tab views (life, school, career, assets)
- js/04-actions.js — original user actions (jobs, housing, items)
- js/05-ageup.js — original yearly `ageUp()`
- js/06-setup.js — start screen / initialisation
- js/07-era-prices.js — 2007+ era prices, inflation, products
- js/08-countries-money.js — countries, currencies, abroad, love
- js/09 … 16 — later feature phases (careers/education, leave/property, realism,
  job market, family/travel, city costs, milestones, bug fixes)

## Rules for editing
1. Only edit the ONE file the task belongs to.
2. If a function is redefined in a later file, the LATER file wins. Search the
   whole project for the function name before changing it.
3. New features: add a new file `js/17-name.js` and a matching <script> tag at
   the end of index.html (before </body>), instead of editing old files.
4. Ask the AI to return only the changed function, not the whole file.
5. Save key: `lifeline_save_v4` (localStorage).
