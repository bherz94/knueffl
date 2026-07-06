# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A client-only Kniffel (Yahtzee) score-keeping PWA for 2–6 players. React 19 + TypeScript + Vite + Tailwind CSS v4. No backend — all state lives in the browser and persists to `localStorage`. German is the default language.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — type-check (`tsc -b`) then production build; run this to verify changes compile
- `npm run lint` — oxlint
- `npm run preview` — serve the production build

There is no test suite. "Verifying" a change means `npm run build` passes and, when behavior matters, running the dev server.

Production builds are served under the `/knueffl/` base path (GitHub Pages); dev runs at `/`. This is branched on `command` in `vite.config.ts`, which also configures the PWA manifest and Workbox precache.

## Architecture

**View routing** lives in `src/App.tsx` (`AppInner`): a two-value `view` state (`'setup' | 'game'`) — no router. Three context providers wrap the app: `ThemeProvider` → `LanguageProvider` → `FontScaleProvider` (`src/hooks/`), each persisting its own `localStorage` key and applying side effects to `document.documentElement` (`.dark` class, root `font-size`).

**Game state** is owned entirely by `useGameState` (`src/hooks/useGameState.ts`), consumed only by `GameScreen`. Key points:
- The full `GameState` (players, `currentPlayerIndex`, `isGameOver`, `diceValues`, `moveLog`) is snapshotted into a `history[]` array on every mutation — `undo()` just pops it. Because `diceValues` lives in game state, undo restores dice too.
- Persistence: `{ state, history }` → `localStorage['knueffl-game']`. On mount it only rehydrates if the saved players match the requested `playerNames` (same length + names). Saves are normalized for fields added later (`diceValues`, `moveLog`).
- `score`/`cross` mutate a cell **and advance the turn** (via `advance`). `correctScore`/`correctCross` mutate a cell **without advancing** — used by the correction flow. Keep this distinction intact when adding mutations.

**New Game rotation:** `handleNewGame` in `App.tsx` right-rotates the player array (previous last player throws first) and bumps `gameNonce`, which is the `key` on `<GameScreen>` — remounting it re-initializes `useGameState` fresh. Clearing `knueffl-game` before remount prevents the "matching players" rehydration from restoring the old game.

**Move history + correction** (only when virtual dice is OFF): tapping a player header opens `MoveHistoryModal`. Selecting an entry removes that move and enters "correction mode" (`correctingPlayerIndex`), where only that player's empty cells are interactive. Corrections preserve the original entry's log position via a `MoveSlot` (`{ index, timestamp }`) passed to `correctScore`/`correctCross`, so an edited move stays in place instead of jumping to the end of the log.

**Scoring vs. dice logic** are separate pure-function modules:
- `src/utils/scoring.ts` — derived totals (upper subtotal, bonus at ≥63 → +35, grand total, `isPlayerDone`). Auto-cells recompute from `PlayerScores` on every render; nothing is stored.
- `src/utils/dice.ts` — `getDiceAutoScore(dice, category)` returns the score for a category given rolled dice, or `null` if the combination is invalid. Used by virtual-dice mode to auto-fill / disable cells.

**Category model:** `src/types/game.ts` is the single source of truth. `CellState` is a discriminated union (`empty` / `scored` / `crossed`). `CategoryMeta.inputKind` (`upper` | `free` | `fixed`) drives which popup a cell opens in `GameScreen.handleCellClick` — `upper` → `UpperInputPopup`, `free` → `FreeInputPopup`, `fixed` → commit immediately with `fixedScore`.

## i18n

All user-facing strings go through the `Translations` interface in `src/i18n/types.ts`, implemented in `de.ts` and `en.ts`. Adding a string means updating **all three** files (the interface plus both locales) or the build fails. Components read strings via `const { t } = useTranslation()`. Shared category label lookup is `categoryLabel(t, id)` in `src/utils/labels.ts`.

## Progress log

`progress.md` is a running, task-numbered changelog of everything built so far. Append a new numbered task section there when completing a notable change.
