# World Life

Life simulation game source, starting from the supplied v2.20 source archive.

## Run

Open `index.html` in your browser. `dist/world-life.bundle.js` is prebuilt, so Node.js and a build step are not needed to play.

**Art and other assets are not included in this repository.** Keep the assets from your original full game folder. The full v2.20 ZIP was about 43 MB; this repository starts from the lean source archive instead.

## Put an update into your existing game folder

1. Make a backup copy of your full game folder first.
2. Download and extract this repository using GitHub's **Code > Download ZIP**.
3. Copy the contents of the extracted `world-life-main` folder into your existing full game folder. Merge folders and replace matching files. Do not delete or replace the whole game folder: keep its existing art/assets.
4. Open `index.html` from the same game folder in the same browser as before.

The source, CSS and prebuilt bundle are updated together. Keep the same location and browser to avoid switching to a different browser save location. Do not clear browser storage.

## Development

Edit files in `src/` and `styles/`. To rebuild after a JavaScript change, install Node.js and run:

```sh
node scripts/build.mjs
```

The build uses the pinned esbuild version in that script and downloads it through npx when needed. Do not edit the generated bundle by hand.

## Imported update history

The original source is followed by separate result-card, habits and money update commits. Their supplied prebuilt bundles are preserved.
