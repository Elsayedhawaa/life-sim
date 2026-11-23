# Original archive migration audit

Source: `World-Life-2.20-PlaytestFixes.zip`, the full archive supplied on November 23, 2026.

- Original archive: 238 regular files, plus directory entries.
- Present in this repository: 238 of 238 original file paths.
- Byte-for-byte unchanged: 218.
- Updated intentionally: 20.
- Missing or excluded: 0.
- Restored 95 art assets, 60 original test/baseline files and 3 fonts.
- No audio files exist in this source archive.
- Largest restored asset is under 1 MB; art assets total about 38.65 MiB.

The manifest records original and current SHA-256 hashes for every original file. Additional files are new game fixes, tests and documentation, not replacements for omitted archive files.

## Updated original files

These files retain the later bug fixes and phone improvements rather than overwrite them with the original archive version.

- `styles/main.css`: 6088a5d Improve phone first-run setup and missing art fallbacks
- `src/ui/documents.js`: 44ad6b1 Fix money calculations and financial displays
- `src/ui/portraits.js`: 6088a5d Improve phone first-run setup and missing art fallbacks
- `src/ui/views.js`: 6088a5d Improve phone first-run setup and missing art fallbacks
- `src/core/gameLoop.js`: 2565721 Restore education and friendship decisions after save reload
- `src/core/schema.js`: 9125ba5 Track social contact by calendar across yearly and monthly life stages
- `src/systems/completeLifeSystems.js`: 44ad6b1 Fix money calculations and financial displays
- `src/systems/eventEngine.js`: 8a88529 Make rental and inheritance event outcomes match real finances
- `src/systems/socialEnergy.js`: 9125ba5 Track social contact by calendar across yearly and monthly life stages
- `src/systems/storyLibrary.js`: 77d2682 Make life events follow the player and living relationships
- `src/systems/careerEducationEngine.js`: aaeb19d Make education modelling clear and respect character religion in quick actions
- `src/systems/economyEngine.js`: 3c284c2 Unify university funding promises with monthly tuition charges
- `src/data/eventsEverydayFamily.js`: 77d2682 Make life events follow the player and living relationships
- `src/data/institutions.js`: aaeb19d Make education modelling clear and respect character religion in quick actions
- `src/data/eventsMoneyHealthCareer.js`: 8a88529 Make rental and inheritance event outcomes match real finances
- `src/main.js`: 6088a5d Improve phone first-run setup and missing art fallbacks
- `scripts/build.mjs`: 061c9f0 Version hosted assets so phone browsers receive updated builds
- `dist/world-life.bundle.js`: 9125ba5 Track social contact by calendar across yearly and monthly life stages
- `CHANGELOG.md`: 8a88529 Make rental and inheritance event outcomes match real finances
- `index.html`: 9125ba5 Track social contact by calendar across yearly and monthly life stages
