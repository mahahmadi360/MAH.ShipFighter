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

Player 1 locks their fleet, passes the device behind a privacy screen, then Player 2 deploys. During battle, select a target and press **Confirm shot** (or cancel). Red means hit, white means miss. Both hits and misses end the turn. The result stays visible for two seconds, then the game automatically opens the next player’s handoff screen. Miniature boards show only shot histories, never hidden ships. The first player to hit all 17 opposing ship cells wins. A new game requires confirmation.

State is saved to localStorage. Reloading restores behind a privacy screen. This is casual shared-device privacy, not protection from browser developer tools. No backend, accounts, network multiplayer, or game API is used. Optional Google Fonts fall back to local fonts if offline. Static assets must have been loaded before playing without a connection; a service worker is not included.

## GitHub Pages

The included `.github/workflows/pages.yml` builds, tests, and deploys pushes to main/master. In GitHub Settings → Pages, select **GitHub Actions** as the source. The repository name is automatically used as the base href.

## Structure

- `src/engine.ts`: fleet geometry, placement validation, randomized placement and shot resolution.
- `src/main.ts`: standalone Angular UI, pointer-based touch/mouse drag, turn flow and persistence.
- `src/styles.css`: responsive dark theme with blue/red player backgrounds.
- `tests/engine.test.ts`: boundary, overlap, fleet and victory tests.
