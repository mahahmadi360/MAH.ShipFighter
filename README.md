# Ship Fighter

A frontend-only Angular 21 pass-and-play naval game for two players on one device. Inspired by the project structure of MAH.Sudoku.

## Run

Use Node.js 22.12+ (or 24) and npm.

```sh
npm ci
npm start
```

Open http://localhost:4200. `npm test` runs the game engine tests; `npm run build` outputs the static app to `dist/`.

## Rules

Each player has a 10×10 ocean and five ships of lengths **5, 4, 3, 3, 2** (17 cells). Drag ships on the board. Tap a placed ship to rotate around its first cell. Alternatively tap a ship to select/rotate it, then tap an empty cell to move it. Invalid moves leave the previous position unchanged; ships may touch but cannot overlap or leave the grid.

Player 1 locks their fleet, passes the device behind a privacy screen, then Player 2 deploys. During battle, select a target and press **Confirm shot** (or cancel). Red means hit, white means miss. Both hits and misses end the turn. Both targeting grids stay visible: side by side on wide screens (900px and above), stacked on phones. Confirming a shot immediately changes turns, enlarging the next player’s grid. The shared confirmation button stays between the grids. Grids show only shot histories, never hidden ships. SVG explosion and wave icons distinguish hits and misses. Hits play a recorded explosion; misses play a water splash. Gentle sea ambience loops in the background. Audio unlocks on the first game interaction; the header sound button mutes all audio and remembers that choice. Samples are embedded in JavaScript to work on localhost and subpath deployments without missing audio URLs. The first player to hit all 17 opposing ship cells wins. A new game requires confirmation.

State is saved to localStorage. Reloading restores the game; fleet setup stays behind a privacy screen. This is casual shared-device privacy, not protection from browser developer tools. No backend, accounts, network multiplayer, or game API is used. After the first successful online load, the production Angular service worker caches the complete game, including its embedded audio, for offline play.

## GitHub Pages

The included `.github/workflows/pages.yml` builds, tests, and deploys pushes to main/master. In GitHub Settings → Pages, select **GitHub Actions** as the source. The repository name is automatically used as the base href.

## Structure

- `src/engine.ts`: fleet geometry, placement validation, randomized placement and shot resolution.
- `src/main.ts`: standalone Angular UI, pointer-based touch/mouse drag, turn flow and persistence.
- `src/styles.css`: responsive dark theme with blue/red player backgrounds.
- `tests/engine.test.ts`: boundary, overlap, fleet and victory tests.

## Install on a phone

Open the HTTPS site in Chrome on Android and choose **Install app** from the menu, or use the header download icon when Chrome offers installation. On iPhone use Safari → Share → Add to Home Screen. The manifest uses relative start URL and scope so GitHub Pages subpaths work. The app includes 192/512 PNG icons, a maskable launcher icon, Apple touch icon and SVG favicon.

The service worker is enabled for production builds only. For local production testing use `npm run build`, then serve `dist/` over localhost. `npm start` runs development mode. When a new version is ready, an update button appears; updating reloads the app, preserving the saved game.
