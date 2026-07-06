# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A client-only Kniffel (Yahtzee) score-keeping PWA for 2–6 players. React 19 + TypeScript + Vite + Tailwind CSS v4. No backend — all state lives in the browser and persists to `localStorage`. German is the default language. Players can be reusable **profiles** with optional local avatar photos, chosen at setup and carried through the score sheet and game history.

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
- `useGameState(players: PlayerSetup[])` takes the setup list (not bare names); `makeInitial` maps each `PlayerSetup` onto a `Player` carrying `name` + optional `profileId` + `avatar`.
- Persistence: `{ state, history }` → `localStorage['knueffl-game']`. On mount it only rehydrates if the saved players match the requested setups (same length + each `name` **and** `profileId` equal). Saves are normalized for fields added later (`diceValues`, `moveLog`).
- `score`/`cross` mutate a cell **and advance the turn** (via `advance`). `correctScore`/`correctCross` mutate a cell **without advancing** — used by the correction flow. Keep this distinction intact when adding mutations.

**New Game rotation:** `handleNewGame` in `App.tsx` right-rotates the `PlayerSetup[]` array (previous last player throws first) and bumps `gameNonce`, which is the `key` on `<GameScreen>` — remounting it re-initializes `useGameState` fresh. Clearing `knueffl-game` before remount prevents the "matching players" rehydration from restoring the old game.

**Move history + correction** (only when virtual dice is OFF): tapping a player header opens `MoveHistoryModal`. Selecting an entry removes that move and enters "correction mode" (`correctingPlayerIndex`), where only that player's empty cells are interactive. Corrections preserve the original entry's log position via a `MoveSlot` (`{ index, timestamp }`) passed to `correctScore`/`correctCross`, so an edited move stays in place instead of jumping to the end of the log.

**Scoring vs. dice logic** are separate pure-function modules:
- `src/utils/scoring.ts` — derived totals (upper subtotal, bonus at ≥63 → +35, grand total, `isPlayerDone`). Auto-cells recompute from `PlayerScores` on every render; nothing is stored.
- `src/utils/dice.ts` — `getDiceAutoScore(dice, category)` returns the score for a category given rolled dice, or `null` if the combination is invalid. Used by virtual-dice mode to auto-fill / disable cells.

**Category model:** `src/types/game.ts` is the single source of truth. `CellState` is a discriminated union (`empty` / `scored` / `crossed`). `Player` additionally carries optional `profileId?` / `avatar?`. `CategoryMeta.inputKind` (`upper` | `free` | `fixed`) drives which popup a cell opens in `GameScreen.handleCellClick` — `upper` → `UpperInputPopup`, `free` → `FreeInputPopup`, `fixed` → commit immediately with `fixedScore`.

**Player profiles:** `src/types/profile.ts` defines `Profile` (`{ id, name, avatar?, createdAt }`, where `avatar` is a compressed JPEG data-URL) and `PlayerSetup` (`{ name, profileId?, avatar? }`, the shape flowing from setup into a game). `src/utils/profiles.ts` is the `localStorage`-backed CRUD layer (key `knueffl-profiles`: `loadProfiles` / `getProfile` / `upsertProfile` / `removeProfile` / `makeProfileId`) plus `processAvatarFile(file)`, which center-crops an uploaded image to a 128×128 canvas and exports a compressed data URL to keep storage small. The create/edit form offers two source buttons — **Take Photo** (`<input accept="image/*" capture="environment">`, opens the camera on mobile, falls back to a file dialog on desktop) and **Choose Existing** (same input without `capture`) — both feeding `processAvatarFile`; no `getUserMedia`/live-camera UI. `ProfilePickerModal` is **dual-mode**: pass `onSelect` and it's the setup-slot picker (row tap assigns); omit `onSelect` and it's the manager (row tap edits) — the `TopBar` 👤 button opens it this way, reachable in both setup and game views. `SetupScreen` player slots open it in picker mode, and slots can be reordered by drag (pointer-events, not HTML5 drag, so it works on touch). `PlayerAvatar` (`src/components/PlayerAvatar.tsx`) is the shared avatar renderer — profile image when present, else a per-index colored disc showing the first two letters of the name — reused by the score sheet, turn indicator, and history views.

**Live profile edits:** a slot's stored `name`/`avatar` is a cache of its linked profile. `upsertProfile`/`removeProfile` call `emitProfilesChanged()` (a `knueffl-profiles-changed` window `Event`); subscribers via `onProfilesChanged` — `App` (setup list), `SetupScreen` (its slots), and `useGameState` (live `state.players` + every undo `history` snapshot) — re-sync profile-linked slots to the profile's current name/avatar using `syncSlotsToProfiles` (identity-preserving when unchanged; deleted profiles leave slots as-is). So editing a profile during a game updates the score sheet in place. History records stay historical snapshots (not renamed); their avatars already resolve to the current profile image via `resolveAvatar`.

## i18n

All user-facing strings go through the `Translations` interface in `src/i18n/types.ts`, implemented in `de.ts` and `en.ts`. Adding a string means updating **all three** files (the interface plus both locales) or the build fails. Components read strings via `const { t } = useTranslation()`. Shared category label lookup is `categoryLabel(t, id)` in `src/utils/labels.ts`.

## Game history

Finished games are recorded to `localStorage` by `src/utils/gameHistory.ts` (key `knueffl-history`, one lightweight `{name, total, place, profileId?, avatar?}` record per player; full scorecards are stored lazily under per-game `knueffl-board-<id>` keys). `aggregateStats` keys each player's leaderboard identity by `profileId` when present, falling back to lowercased/trimmed **name** for legacy or profile-less records — so history links to a profile rather than relying on name-equality. Avatar resolution prefers the linked profile's *current* avatar (via `getProfile`), then any avatar cached on the record, then the colored-initial fallback. Legacy records without `profileId` must keep working.

## Task docs

Two companion docs track every numbered task and must stay in sync:
- `requirements.md` — the requirement **spec** (what should happen), written when a task is created.
- `progress.md` — the implementation **changelog** (what was actually done), appended on completion.

When adding a task, write its spec to `requirements.md` under a new `## TASK <n>` heading; on completion, append the matching section to `progress.md`. Use the same task number in both.
