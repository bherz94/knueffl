# Kniffel — Implementation Progress

## TASK 1 — Project Scaffolding ✅
- Vite + React + TypeScript project initialized
- Tailwind CSS v4 installed with `@tailwindcss/vite` plugin
- `vite.config.ts` updated to include Tailwind plugin
- Folder structure created: `src/components/`, `src/hooks/`, `src/i18n/`, `src/types/`, `src/utils/`
- `src/index.css` rewritten with Tailwind v4 `@import "tailwindcss"`, `@custom-variant dark` for class-based dark mode, and `@theme` block with design tokens (colors, font)
- Boilerplate `App.tsx` and `App.css` cleaned up; minimal placeholder `App.tsx` in place
- `npm run build` passes cleanly

## TASK 2 — Internationalization (i18n) ✅
- `src/i18n/types.ts` — explicit `Translations` interface (string fields + typed function signatures)
- `src/i18n/de.ts` — full German translations
- `src/i18n/en.ts` — full English translations (same interface)
- `src/i18n/index.ts` — barrel export
- `src/hooks/useLanguage.tsx` — `LanguageProvider` context + `useTranslation()` hook; default language German
- Build passes cleanly
## TASK 3 — Theme (Light / Dark Mode) ✅
- `src/hooks/useTheme.tsx` — `ThemeProvider` + `useTheme()` hook
- Reads `localStorage` for persisted preference; falls back to `prefers-color-scheme`
- Applies/removes `.dark` class on `<html>` element (Tailwind class-based dark mode via `@custom-variant dark`)
- Both providers wired into `App.tsx` (`ThemeProvider` wrapping `LanguageProvider`)
- Build passes cleanly
## TASK 4 — Player Setup Screen ✅
- `src/components/SetupScreen.tsx` — full setup UI
- Player count segmented control (2–6), plus −/+ buttons
- Name inputs (one per player, max 20 chars, placeholder with player number)
- "Start Game" button disabled until all names filled
- Responsive: 1-column on mobile, 2-column grid on sm+ for name inputs
- App.tsx wired with `view` state ('setup' | 'game'), passes player names on start
- Build passes cleanly
## TASK 5 — Scoreboard Layout ✅
- `src/types/game.ts` — full type definitions: `ScorableCategory`, `AutoCategory`, `CellState`, `Player`, `PlayerScores`, `CategoryMeta`, `UPPER_CATEGORIES`, `LOWER_CATEGORIES`, `makeEmptyScores()`
- `src/utils/scoring.ts` — calculation helpers: upper subtotal, bonus (≥63 → +35), upper total, lower total, grand total
- `src/components/PlayerHeader.tsx` — player avatar (colored initial), name, active indicator dot
- `src/components/AutoCell.tsx` — read-only calculated cell with highlight variant
- `src/components/ScoreCell.tsx` — interactive cell with empty/scored/crossed states; disabled when not active player's turn
- `src/components/SectionHeader.tsx` — full-width section divider row
- `src/components/Scoreboard.tsx` — full table layout with fixed label column (sticky), player column headers, upper + lower section rows, all auto-calculated rows
- Build passes cleanly
## TASK 6 — Game State & Turn Logic ✅
- `src/hooks/useGameState.ts` — manages `players[]`, `currentPlayerIndex`, `isGameOver`
- `score(playerIndex, category, value)` — sets a scored cell, advances turn
- `cross(playerIndex, category)` — sets a crossed cell, advances turn
- Turn advances circularly via modulo; game-over detected when all players have all cells filled
- `reset(names)` — returns to fresh state with new player names
- Build passes cleanly
## TASK 7 — Upper Section Scoring (1s through 6s) ✅
- `src/components/UpperInputPopup.tsx` — modal with 5 buttons (1–5 dice count), score preview (count × die value), confirm/cancel
## TASK 8 — Lower Section: Free Numerical Input ✅
- `src/components/FreeInputPopup.tsx` — modal with numeric input (1–30), Enter key confirms, Escape cancels
## TASK 9 — Cross-Out Mechanic ✅
- `ScoreCell` handles double-tap/double-click detection with 300ms window internally
- Crossed cells show ✕, contribute 0 to totals, are locked
## TASK 10 — Lower Section: Fixed-Score Categories ✅
- Single tap on fixed categories (Full House/Kleine/Große/Kniffel) calls `score()` immediately with fixed points
- `src/hooks/useDoubleTap.ts` helper (also available for other uses)
- `src/components/GameScreen.tsx` orchestrates all input routing and dispatches to correct handler
## TASK 11 — Auto-Calculated Fields ✅
- All calculations live in `src/utils/scoring.ts` and are called inline in Scoreboard render
- Upper subtotal, bonus (35 if ≥63), upper total, lower total, upper total repeated, grand total
- Auto cells are visually distinct (gray background, not clickable) via `AutoCell` component
- Reactive: recalculated on every render from current scores
## TASK 12 — Game End & Winner Screen ✅
- `src/components/GameEndOverlay.tsx` — fixed overlay with trophy, ranked list, placement labels, winner crown + gold highlight, ties share rank, "New Game" button
- Triggered automatically when `state.isGameOver` is true in GameScreen

## TASK 13 — Component Architecture ✅
- `src/components/TopBar.tsx` — language toggle + theme toggle, always visible
- Full component tree: App → TopBar + SetupScreen / GameScreen → Scoreboard → PlayerHeader + SectionHeader + CategoryRow logic + ScoreCell + AutoCell → popups (UpperInputPopup, FreeInputPopup) + GameEndOverlay
- No giant App.tsx; each component has a single focused responsibility
- App.tsx wires view state ('setup' | 'game'), TopBar always rendered

## TASK 14 — Responsive & Device Support ✅
- Scoreboard uses `overflow-x-auto` + `sticky left-0` label column (frozen on scroll)
- `colgroup` assigns 110px to label column, remaining width split equally across player columns
- `table-layout: fixed` ensures equal player column widths at all breakpoints
- All tap targets ≥ 40px height (h-10 = 40px cells, h-11 popup buttons)
- Setup screen grid: 1-col on mobile, 2-col on sm+ for name inputs
- Turn indicator cross-out hint hidden on small screens (`hidden sm:inline`)
- Tested column math: 6 players fit within 1024px landscape (label 110px + 6 × ~152px ≈ 1022px)

## TASK 15 — Numeric-only input on iPad (custom in-modal number pad) ✅
- `src/components/FreeInputPopup.tsx` rewritten: native `<input type="number">` replaced with an on-screen keypad (digits 0–9, clear, backspace) so no OS keyboard is needed — fixes iPad Safari ignoring `inputMode`
- Large read-only display shows the current entry (placeholder `1–30` when empty)
- Keypad buttons styled to match `UpperInputPopup` (h-12 ≥ 44px tap targets, rounded, dark-mode aware)
- Entry capped at 2 digits; leading zeros stripped; validation unchanged (valid 1–30, Confirm disabled until valid)
- Hardware keyboard still works via a window `keydown` listener: `0–9` append, `Backspace` deletes, `Enter` confirms (when valid), `Escape` cancels
- Added i18n keys `clear` / `backspace` to `types.ts`, `en.ts`, `de.ts`
- Build passes cleanly

## TASK 16 — Rotate starting order on New Game ✅
- `src/App.tsx` `handleNewGame` now right-rotates the `players` array by one (previous last player → new index 0) before starting the next game
- New Game now starts a fresh game directly (view stays `game`) instead of returning to setup, matching the spec ("fresh game starts with currentPlayerIndex = 0, which is now the previously-last player")
- Added a `gameNonce` counter used as `key` on `<GameScreen>` so it (and `useGameState`) remounts and re-initializes with the rotated order + `currentPlayerIndex = 0`
- Names travel with each player during rotation (whole string entries are moved); rotation is a no-op for a single player
- Setup screen order unaffected for a brand-new (first) game
- Build passes cleanly

## TASK 17 — Defer Endsumme until game is finished ✅
- `src/components/Scoreboard.tsx`: the Endsumme (grand total) `renderAutoRow` `showFor` predicate changed from per-player `isPlayerDone(p.scores)` to `() => !!isGameOver`
- Endsumme now renders the `—` placeholder (via `AutoCell` null value) for every player until ALL players are done; then all populate at once
- Intermediate auto-cells (upper subtotal, bonus, upper total, lower total) still update live per input — unchanged
- Winner/placements computed only at game end — unaffected
- Removed now-unused `isPlayerDone` import
- Build passes cleanly

## TASK 18 — Editable per-player move history + correction mode ✅
- `src/types/game.ts`: added `MoveEntry` interface (`id, playerIndex, category, kind, value?, timestamp`)
- `src/hooks/useGameState.ts`:
  - `GameState` gained `moveLog: MoveEntry[]`; persisted alongside the existing save; old saves normalized to `moveLog: []`
  - `score`/`cross` now append a move entry (via shared `writeCell` + `advance`); undo reverts the log automatically (history snapshots full state)
  - Added `correctScore`/`correctCross` — write a cell and append a log entry WITHOUT advancing the turn or changing `currentPlayerIndex`; recompute `isGameOver`
  - Added `removeMove(id)` — reverts that move's cell to empty, drops the log entry, sets `isGameOver = false`; undoable
- `src/utils/labels.ts` (new): shared `categoryLabel(t, id)` helper; `Scoreboard` now imports it (removed its local copy)
- `src/components/MoveHistoryModal.tsx` (new): centered modal listing a player's moves newest-first (category label + value or ✕); tapping an entry selects it for correction
- `src/components/Scoreboard.tsx`: added `onHeaderClick` (makes player headers tappable) and `correctingPlayerIndex` props; during correction only the corrected player's empty cells are interactive (`interactiveIndex`); those empty cells get an amber `isCorrectable` highlight
- `src/components/ScoreCell.tsx`: added `isCorrectable` prop + amber correction-target style
- `src/components/GameScreen.tsx`: wired history modal (header tap, virtual dice OFF only) and correction mode — selecting a history entry removes the move and enters correction; an amber banner shows the player being corrected with a cancel button; `commitScore`/correction routing ensures corrections don't advance the turn
- Added i18n keys (`moveHistory`, `moveHistoryFor`, `noMoves`, `tapEntryToCorrect`, `correctionBanner`, `correctionHint`, `cancelCorrection`) to `types.ts`, `en.ts`, `de.ts`
- Only available when virtual dice is OFF (headers not clickable otherwise)
- Build passes cleanly

## TASK 19 — Preserve scroll position + Options menu ✅
- **Part A (scroll):** `src/components/GameScreen.tsx` — added `scrollRef` on the `overflow-auto` container and a `pendingScrollTop` ref; `saveScroll()` captures `scrollTop` at every commit point (`commitScore`, dice auto-score, `handleCross`); a `useLayoutEffect` restores it after the re-render so the view no longer jumps after scoring
- **Part B (Options cogwheel):** `src/components/TopBar.tsx` rewritten — the two inline toggles replaced by a single ⚙️ button opening a popover (closes on outside-click / Escape) with three grouped controls:
  - **Language** (de/en) — consolidates the old language toggle
  - **Light / Dark** — consolidates the old theme toggle
  - **Font size** (S/M/L) — new
- `src/hooks/useFontScale.tsx` (new): `FontScaleProvider` + `useFontScale()`; persists `kniffel-font-scale` to `localStorage` and sets `document.documentElement.style.fontSize` (14/16/18px) so all rem-based text scales app-wide on load
- Provider wired into `App.tsx` (inside Language/Theme providers)
- Added i18n keys `settings`, `fontSize`, `fontSmall`, `fontMedium`, `fontLarge` to `types.ts`, `en.ts`, `de.ts`
- Build passes cleanly

## TASK 20 — Keyboard-driven setup (Tab + Enter to start) ✅
- `src/components/SetupScreen.tsx`:
  - Added `handleNameKeyDown` — `Enter` in any name input calls `handleStart()` when `allFilled`, otherwise no-op (prevents surprising focus jumps)
  - `autoFocus={i === 0}` on the first name input so typing begins immediately on mount
  - Verified natural tab order from the existing DOM order (name 1 → … → name N → virtual dice toggle → Start button) — no explicit `tabindex` needed; player-count controls precede the names so tabbing between names is uninterrupted
  - Mouse/touch behavior unchanged
- Build passes cleanly

## TASK 21 — Correction preserves history position ✅
- Bug: correcting a move re-ordered the history. `removeMove` dropped the log entry and `correctScore`/`correctCross` **appended** a fresh entry with a new `Date.now()` timestamp, so the corrected move jumped to the top (modal sorts newest-first) instead of staying in place.
- `src/hooks/useGameState.ts`:
  - Added `MoveSlot` interface (`index`, `timestamp`) + `insertMove()` helper that splices the replacement entry back at its original log index (falls back to append when no slot)
  - `correctScore`/`correctCross` take an optional `slot`; the new entry reuses the original `timestamp` and is spliced at the original `index`
- `src/components/GameScreen.tsx`:
  - Added `correctionSlot` state; `handleHistorySelect` captures the removed move's `index` + `timestamp` before `removeMove`
  - `commitScore`/`handleCross` pass the slot through and clear it after committing; the cancel-correction button clears it too
- Result: editing e.g. "3× fours" → "3× fives" now replaces the entry in its original position instead of moving it to the end
- Build passes cleanly

## TASK 22 — Cancelling a correction restores the move ✅
- Bug: tapping a history entry calls `removeMove` immediately (empties the cell so it's re-selectable), but the cancel button only cleared the correction UI state — so the removed move was lost and turn counts looked off (the corrected player was short one move).
- `src/components/GameScreen.tsx`:
  - Added `cancelCorrection()` — calls `undo()` (reverts the `removeMove` snapshot, restoring the cell + log entry) then clears `correctingPlayerIndex`/`correctionSlot`; wired to the correction banner's cancel button
  - Disabled the top-bar undo button while a correction is in progress (`correctingPlayerIndex != null`) so the pending removal stays at the top of the history stack for `cancelCorrection` to revert cleanly
- Build passes cleanly

---

## All tasks (1–22) complete ✅
Every task in `requirements.md` is now implemented and the production build passes cleanly.
