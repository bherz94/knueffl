# Knueffl — Implementation Progress

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
- Single tap on fixed categories (Full House/Kleine/Große/Knueffl) calls `score()` immediately with fixed points
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
- `src/hooks/useFontScale.tsx` (new): `FontScaleProvider` + `useFontScale()`; persists `Knueffl-font-scale` to `localStorage` and sets `document.documentElement.style.fontSize` (14/16/18px) so all rem-based text scales app-wide on load
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

---

## TASK 23 — Game history + high-score leaderboard ✅
Persistent record of finished games plus a cross-game leaderboard, all client-side in `localStorage` (new `knueffl-history` key — data is tiny and derived stats need no separate storage).
- `src/hooks/useGameState.ts`: added a stable `gameId` to `GameState` (generated in `makeInitial`, carried through `advance`, backfilled in the rehydration normalizer). Used to dedupe records across reloads/corrections.
- `src/utils/gameHistory.ts` (new): `GameRecord` model + `loadHistory`/`recordGame` (upsert by id, preserves `finishedAt`)/`removeRecord`/`clearHistory`; `aggregateStats` folds players case-insensitively (display name = most recent casing) into games played / wins / best game / average; `rankBy(metric)` for the leaderboard tabs.
- `src/components/GameScreen.tsx`: on `isGameOver → true` records the finished game (ranked results via `calcPlacements` + `calcGrandTotal`); on `→ false` (undo) removes it.
- `src/components/HistoryModal.tsx` (new): 🏆 overlay with two tabs — Recent Games (timestamped, ranked cards) and Leaderboard (Best game / Wins / Average sub-tabs, games-played as context). Includes a confirm-guarded Clear history action.
- `src/components/TopBar.tsx`: added a 🏆 button (next to ⚙️) opening the modal — reachable from both setup and game views.
- i18n strings added to `types.ts`, `de.ts`, `en.ts`. Build + lint pass.

---

## TASK 24 — Keyboard entry in the upper-section popup (desktop) ✅
Desktop users can now score upper-section cells without the mouse.
- `src/components/UpperInputPopup.tsx`: added a `keydown` listener — digits `1`–`5` set the selected count, `Enter` confirms (no-op when nothing selected, mirroring the disabled Confirm button), `Escape` cancels. The effect depends on `selected` so Enter reads the freshly-picked count.
- Example: click **Dreier** → press `3` → `Enter` commits 3 × 3 = 9. Mouse/touch flow unchanged.
- Build passes cleanly.

---

## TASK 25 — Cap the History/Leaderboard modal height ✅
- `src/components/HistoryModal.tsx`: lowered the container cap from `max-h-[85vh]` to `max-h-[80vh]`. The scrolling body (`overflow-y-auto`, a flex child that can shrink below content) keeps the header tabs and footer fixed while the list scrolls when content exceeds 80% of the viewport.
- Build passes cleanly.

---

## TASK 26 — Lock background scroll under the History modal ✅
- `src/components/HistoryModal.tsx`: on mount, set `document.body.style.overflow = 'hidden'`; a cleanup restores the previous value on close/unmount. The page behind stays put while the modal's own body still scrolls. Scoped to this modal only — the score-input popups are untouched.
- Build passes cleanly.

---

## TASK 27 — Styled "Clear history" confirmation ✅
- `src/components/HistoryModal.tsx`: dropped `window.confirm` in favor of a `confirmClear` state driving an in-app dialog (z-[60], rounded card, 🗑️ + title + message, Cancel + destructive red confirm) matching the cancel-game confirm. Backdrop/Cancel dismisses; confirm clears history and bumps the read nonce.
- i18n: added `clearHistoryTitle`; repurposed `clearHistoryConfirm` as the dialog's explanatory body (types + de + en).
- Build + lint pass.

---

## TASK 28 — Dev-only "seed debug games" button ✅
- `src/utils/gameHistory.ts`: added `seedDebugHistory()` — 10 two-player games (Player 1 vs Player 2) spread over the past ~10 days. Each player's card is built by `randomScores()` (0–2 random categories crossed → 0, rest given plausible per-category values), total via `calcGrandTotal`, ranked into results; records appended to existing history. Helpers: `randInt`, `makeId`, `plausibleScore`.
- `src/components/HistoryModal.tsx`: footer shows a dashed amber "🐞 Seed 10 debug games" button guarded by `import.meta.env.DEV`, so it's dead-code-eliminated from production builds (the `seedDebugHistory` reference tree-shakes out). Clicking seeds and refreshes via the read nonce. Label is hardcoded (dev tool, not i18n).
- Build + lint pass.

---

## TASK 29 — View the full scorecard of a past game ✅
Tapping a game in the History modal's "Recent Games" tab now opens that game's completed board, read-only.
- `src/utils/gameHistory.ts`: added optional `scores?: PlayerScores` to `GameResult` so a finished game's full per-player scorecard is persisted. `seedDebugHistory` now keeps the generated `randomScores()` on each result (so debug games are viewable too). Records written before this change lack `scores` and stay non-clickable.
- `src/components/GameScreen.tsx`: the `recordGame` call now includes `scores: p.scores` per player.
- `src/components/HistoryBoardModal.tsx` (new): a read-only board viewer. Reconstructs `Player[]` + a placement map from the record and renders the live `Scoreboard` with `currentPlayerIndex={-1}`, `isGameOver`, and no-op `onCellClick`/`onCross` — so no cell is active or editable and there's no undo/move-history/correction. Players show in finishing order (winner first) with medals; header shows the game's date. Locks background scroll while open.
- `src/components/HistoryModal.tsx`: each game card is now a `<button>`, enabled only when every result has stored `scores` (`hasBoard`); clicking sets `boardRecord`, which renders `HistoryBoardModal` (z-[55], above the history list). A `›` chevron hints at clickability.
- i18n: added `gameBoardTitle` + `viewGameBoard` (types + de + en).
- Build + lint pass.

---

## TASK 30 — Paginate the Recent Games list ✅
The History modal no longer renders all past games at once, fixing the open-time stall at 700+ games.
- `src/components/HistoryModal.tsx`: added `GAMES_PAGE = 30` and a `visibleCount` state; the games tab renders `games.slice(0, visibleCount)`. A "Show more (N)" button appends another batch. `visibleCount` resets to one page whenever the history is re-read (clear/seed, via `nonce`).
- i18n: added `showMore(remaining)` (types + de + en).
- Build + lint pass.

## TASK 31 — Reuse a single date formatter ✅
- `src/components/HistoryModal.tsx`: replaced the per-card `new Date(ms).toLocaleString(...)` (which builds an `Intl` formatter on every call) with one `useMemo`'d `Intl.DateTimeFormat` keyed on `locale`, called via `.format(ms)`. Same output. Removes hundreds of formatter constructions per render.
- Build + lint pass.

## TASK 32 — Compact scorecard encoding ⏸️ DEFERRED
Not implemented. Superseded for performance by Task 33 (lazy per-game scorecards), which stops loading scorecards during list rendering entirely; Task 32's only remaining value is `localStorage` footprint, not a concern at current volumes. Task spec kept in requirements.md as a documented future option that composes with Task 33.

## TASK 33 — Lazy-load past-game scorecards ✅
Scorecards no longer live inline in the history list, so `loadHistory()` (called on every modal open and every record mutation) parses only lightweight `{name, total, place}` records.
- `src/utils/gameHistory.ts`:
  - Per-game blobs stored under `knueffl-board-<id>` via `saveGameBoard` / `loadGameBoard` / `removeGameBoard`.
  - `recordGame` splits scorecards out: writes the blob, strips `scores` from the list record, and sets a `hasBoard` flag. `removeRecord` and `clearHistory` also delete the associated board key(s).
  - `getGameBoard(record)` returns scorecards in results order, preferring the lazy blob and falling back to legacy inline `scores`. `recordHasBoard(record)` reports whether a board is viewable (flag or legacy inline).
  - `seedDebugHistory` writes boards under the per-game key and sets `hasBoard`.
- `src/components/HistoryBoardModal.tsx`: loads scorecards via `getGameBoard(record)` on open instead of reading inline `r.scores`.
- `src/components/HistoryModal.tsx`: clickability now uses `recordHasBoard(g)`.
- Backward compatible: pre-Task-33 records with inline scores stay viewable. `GameResult.scores` remains as the transport into `recordGame` and the legacy fallback.
- Build + lint pass.

## TASK 34 — Open the winning game from the "Best game" leaderboard ✅
On the Leaderboard tab's **Best single game** metric, each player row now opens the exact game where they set that best total.
- `src/utils/gameHistory.ts`: added `bestGameId?: string` to `PlayerStats`. `aggregateStats` records the source game id whenever a player sets a new personal-best single-game total (strictly greater, so a tie keeps the first/older game). It flows through the final map via the existing rest-spread.
- `src/components/HistoryModal.tsx`: memoized a `recordsById` lookup. On the `bestGame` metric each leaderboard row is now a `<button>`, enabled only when the winning game still has a viewable board (`recordHasBoard`); clicking sets `boardRecord`, reusing the same `HistoryBoardModal` (read-only, medals, date header) as Recent Games. Rows show a `›` chevron + hover affordance when openable. The **Wins** and **Average score** metrics aggregate many games, so their rows stay inert (`div`-like button, disabled). No new i18n strings — reuses `viewGameBoard`.
- Build + lint pass.

## TASK 35 — Undo skips history corrections (targets the last real move) ✅
Fixed the undo corruption after editing a move-history entry.
- **Root cause:** a completed correction pushed two snapshots onto the undo `history` stack — `removeMove` (empties the cell + drops the log entry) and the `correctScore`/`correctCross` replacement. Undo then restored the broken intermediate "move-removed, cell-empty" state instead of the last real move, and needed a second undo to fully back out.
- `src/hooks/useGameState.ts`: added an in-memory `pendingCorrection` buffer (via `setPendingCorrection`, off the main undo stack). `removeMove` now stashes the pre-removal state there instead of into `history`. `correctScore`/`correctCross` no longer snapshot into `history` and clear the buffer on completion. New `revertCorrection()` restores from the buffer (no-op if empty). So corrections never touch `canUndo`/`history` — `undo` always reverts the last real `score`/`cross`.
- `src/components/GameScreen.tsx`: `cancelCorrection` now calls `revertCorrection()` instead of `undo()` (the old approach depended on the removal sitting atop the undo stack — the Task 22 constraint, now obsolete). The undo button stays disabled while a correction is in progress (still sensible UX; no longer load-bearing).
- Build + lint pass.

### TASK 35 follow-up — corrections must survive undo of later moves
The first pass (buffer off the undo stack) stopped the double-undo corruption but not this: correcting an old move, then undoing a *later* real move, resurrected the pre-correction value. Each undo snapshot is taken *before* a real move, so snapshots after the corrected move still carried its old cell value.
- `src/hooks/useGameState.ts`: `MoveSlot` now carries the corrected move's `id`. `correctScore`/`correctCross` funnel through a shared `applyCorrection`, which — after writing the new cell — patches every undo snapshot via `patchSnapshot`: for any snapshot whose `moveLog` already contains the corrected move (matched by id), it clears the move's original cell, writes the new cell, and swaps the log entry in place. Snapshots predating the move are left alone. Filled-cell count is unchanged, so `isGameOver` isn't recomputed.
- `src/components/GameScreen.tsx`: `handleHistorySelect` includes `id: original.id` in the correction slot.
- Verified against the reported repro (P1 3×1/3×6/FH, P2 3×3/3×5): correcting 3×6→3×5 then undoing removes the Full House while the 3×5 correction stays put.
- Build + lint pass.

### TASK 35 follow-up 2 — every-other undo (StrictMode double-push)
Pressing undo repeatedly skipped every other press ("undo → nothing → undo → nothing"). Root cause was pre-existing, not the correction work: `score`/`cross` pushed the undo snapshot with `setHistory(h => [...h, prev])` *inside* the `setState` updater, and `undo` nested `setState` inside the `setHistory` updater. React StrictMode double-invokes updater functions in dev; the nested non-idempotent append therefore ran twice, so every move landed on the undo stack **twice**. A single undo still looked right, which is why it went unnoticed until repeated undo was tried.
- `src/hooks/useGameState.ts`: removed all nested state setters. `score`/`cross`/`removeMove`/`applyCorrection`/`undo`/`revertCorrection` now read the committed closure `state`/`history`/`pendingCorrection` (safe — these fire from user events) and call each setter once at the top level with a pure updater or a value. Bound `pendingCorrection` back so `revertCorrection` can read it directly instead of via a setter callback.
- Build + lint pass.

## TASK 36 — Player profiles foundation (types + storage) ✅
Task 1 of the 4-task player-profiles feature. Foundation data model + storage only; no UI wiring.
- `src/types/profile.ts` (new): `Profile` interface `{ id: string; name: string; avatar?: string; createdAt: number }`. `avatar` is a compressed JPEG data URL or undefined.
- `src/utils/profiles.ts` (new): localStorage-backed CRUD under `knueffl-profiles`, following the defensive try/catch + `JSON.parse`/`Array.isArray` pattern from `gameHistory.ts`. Exports `loadProfiles`, `saveProfiles`, `getProfile`, `upsertProfile` (insert-or-replace by id), `removeProfile`, and `makeProfileId` (`crypto.randomUUID` with the same timestamp+random fallback as `makeMoveId`). Also `processAvatarFile(file)`: rejects non-image files, loads the image via an object URL, center-crops the largest square, draws it downscaled onto a 128×128 canvas, exports `toDataURL('image/jpeg', 0.8)`, and revokes the object URL on both success and error.
- `src/types/game.ts`: added optional `profileId?: string` and `avatar?: string` to the `Player` interface (additive only; `makeEmptyScores` untouched).
- `src/utils/gameHistory.ts`: added optional `profileId?: string` and `avatar?: string` to the `GameResult` interface (additive only; `aggregateStats`/`recordGame` unchanged).
- No UI touched (SetupScreen/App/GameScreen untouched).
- Build + lint pass.

## TASK 37 — Wire profiles into game creation (setup + picker) ✅
Task 2 of the 4-task player-profiles feature. Setup now picks saved profiles per slot instead of typing raw names, and profile identity flows through game state.
- `src/types/profile.ts`: added `PlayerSetup { name; profileId?; avatar? }` — one configured setup slot.
- `src/components/ProfilePickerModal.tsx` (new): modal styled after `MoveHistoryModal` (fixed inset overlay, backdrop blur, rounded card, dark-mode classes). Two views — a selectable profile list (avatar thumbnail or name-initial disc + name; per-row edit/delete buttons) and a create/edit form (name input + `<input type="file" accept="image/*">` piped through `processAvatarFile` with live preview and remove-photo). Selecting a profile fires `onSelect(profile)` and closes. Create/edit persist via `upsertProfile` (preserving `createdAt` on edit); delete goes through a nested confirm overlay → `removeProfile`. All CRUD re-reads via `loadProfiles`.
- `src/components/SetupScreen.tsx`: `onStart` is now `(players: PlayerSetup[], virtualDice: boolean) => void`; `initialNames` → `initialPlayers`. Each row is a tappable "slot" showing the chosen profile's avatar + name, or a dashed "choose profile" placeholder; tapping opens `ProfilePickerModal` for that slot index, and selecting assigns `{ name, profileId, avatar }`. A ✕ clears a filled slot. +/- count controls and the virtual-dice toggle are unchanged. Start stays disabled until every slot has a non-empty name.
- `src/App.tsx`: `players` state is now `PlayerSetup[]`. `loadAppState` normalizes defensively via `normalizePlayers` — a persisted `string[]` (or stray shapes) maps to `{ name }` slots, so old saves still load. `handleStart`, `handleNewGame` right-rotation, and the initial-players prop all operate on `PlayerSetup[]`; setups are passed to `<GameScreen players=…>`.
- `src/hooks/useGameState.ts` + `src/components/GameScreen.tsx`: `playerNames: string[]` → `players: PlayerSetup[]`. `makeInitial` maps each setup onto a `Player` carrying `name` + `profileId` + `avatar`. New `playersMatch(saved, players)` gates rehydration on same length AND every `name` === and `profileId` ===. `reset` takes `PlayerSetup[]`. GameScreen also records `profileId`/`avatar` into `recordGame` results (fields already on `GameResult`).
- i18n keys added (types.ts + de.ts + en.ts): `chooseProfile`, `profiles`, `newProfile`, `editProfile`, `deleteProfile`, `deleteProfileConfirm(name)`, `profileName`, `profileNamePlaceholder`, `uploadPhoto`, `removePhoto`, `noProfilesYet`, `save`, `delete`.
- Existing game/undo/correction logic untouched. Build + lint pass.

## TASK 38 — Render player avatars on the score sheet ✅
Task 3 of the 4-task player-profiles feature. Player avatars now show on the scoreboard and turn indicator.
- `src/components/PlayerAvatar.tsx` (new): shared presentational component. Renders the profile image as a circular `object-cover` `<img>` when `avatar` is present, otherwise falls back to the colored name-initial disc (the `PLAYER_COLORS` palette, moved here from `PlayerHeader`). Configurable `sizeClass`/`textClass`/`className` so it serves both the 32px header disc and the smaller turn-indicator badge.
- `src/components/PlayerHeader.tsx`: added optional `avatar?: string` prop; replaced the inline colored-initial disc with `<PlayerAvatar>`. Place-medal badge overlay, active styling, and name label are unchanged.
- `src/components/Scoreboard.tsx`: passes `player.avatar` into both `PlayerHeader` usages (the header-click button branch and the plain branch).
- `src/components/GameScreen.tsx`: turn indicator now shows the current player's small avatar (`w-6 h-6`, `ring-1 ring-white/40`) next to the name in both the virtual-dice button branch and the plain `currentTurn` branch; skipped gracefully when no avatar.
- No new i18n strings (avatars are images). Build + lint pass.

## TASK 39 — Profile-based history identity + avatars in history views ✅
Task 4 (final) of the 4-task player-profiles feature. Leaderboard/history now identifies recurring players by profile and shows their avatars everywhere a name appears.
- `src/utils/gameHistory.ts`: `PlayerStats` gained `profileId?` and `avatar?` (most-recent cached avatar). `aggregateStats` now keys each player by `r.profileId` when present, else the lowercased/trimmed name (legacy/profile-less records aggregate exactly as before). Display `name` still tracks the most-recent casing; `profileId`/`avatar` track the most-recent non-empty values. Old name-keyed and new profile-keyed records for the same real person are intentionally NOT merged. `gamesPlayed`/`wins`/`bestGame`/`bestGameId`/`avgScore` and `rankBy` are unchanged. New helper `resolveAvatar(profileId, fallbackAvatar, profiles?)`: prefers the linked profile's CURRENT avatar via `getProfile` (or a preloaded map), then any avatar cached on the record/result, else `undefined` so `<PlayerAvatar>`'s colored-initial fallback renders. The optional `profiles` map avoids re-reading localStorage per row.
- `src/components/HistoryModal.tsx`: preloads a `profilesMap` (`loadProfiles`, memoized on the read nonce). Replaced the inline colored discs in BOTH the recent-games rows and the leaderboard rows with `<PlayerAvatar>`, avatar resolved via `resolveAvatar(..., profilesMap)`. `colorForName` → `colorIndexForName` (returns a palette index matching `PlayerAvatar`).
- `src/components/HistoryBoardModal.tsx`: the reconstructed `Player[]` now carries `profileId` and a `resolveAvatar`-resolved `avatar`, so the reused `Scoreboard`/`PlayerHeader` render each player's avatar in the column headers.
- `src/components/MoveHistoryModal.tsx`: new `playerIndex` + optional `avatar` props; the `moveHistoryFor` header now shows a `<PlayerAvatar>` beside the name. `src/components/GameScreen.tsx` threads `playerIndex={historyPlayer}` and `avatar={state.players[historyPlayer]?.avatar}`.
- `src/components/GameEndOverlay.tsx`: rankings rows use `<PlayerAvatar>` with `resolveAvatar(player.profileId, player.avatar)`; removed the now-unused local `PLAYER_COLORS`.
- Backward compatible: legacy records with no `profileId` aggregate by name and render the initial fallback (no crashes/missing-avatar errors).
- No new i18n strings (avatars are images). Build + lint pass. This completes the 4-task player-profiles feature.

## TASK 40 — Drag-and-drop reordering of players on the setup screen ✅
Players can now be reordered on `SetupScreen` before starting, so turn order can be arranged up front. Implemented with pointer events (works on touch and mouse — the app is a mobile-first PWA where HTML5 drag is unreliable), no new dependencies.
- `src/components/SetupScreen.tsx`: each player row now has a grip handle (`⠿`) on the left. `onPointerDown` on the handle captures the pointer (`setPointerCapture`) and sets `dragIndex`; `onPointerMove` computes the hovered slot via `slotForY` (comparing `clientY` against each row's mid-point using a `rowRefs` array) and live-reorders the `PlayerSetup[]` via `reorder(from, to)` (splice out, splice in), updating `dragIndex` so the drag follows; `onPointerUp`/`onPointerCancel` release capture and clear `dragIndex`. The handle uses `touch-none select-none cursor-grab`; the dragged row gets an opacity/ring/shadow highlight. Slot number badges (`{i + 1}`) reflect the new order automatically, and per-slot profile assignment moves with the row.
- i18n: added `reorderPlayer` (types + de + en) for the handle's `aria-label`.
- Build + lint pass.

## TASK 41 — Manage profiles (edit name/avatar) anytime, live-updating the game ✅
Profiles (player "accounts") can now be edited — name and/or avatar — from a dedicated global entry point reachable in both the setup and game views, and saving an edit updates every place the profile is currently in use **without a reload**.
- `src/utils/profiles.ts`:
  - `upsertProfile`/`removeProfile` now `emitProfilesChanged()` after a successful write (remove only fires when something was actually removed).
  - Added a lightweight change bus: `emitProfilesChanged()` dispatches a `knueffl-profiles-changed` window `Event`; `onProfilesChanged(handler)` subscribes and returns an unsubscribe.
  - Added `syncSlotToProfile(slot)` / `syncSlotsToProfiles(slots)`: given a name/avatar-carrying slot (`PlayerSetup` **or** `Player` — generic over `{ name; profileId?; avatar? }`), re-sync to the linked profile's **current** name + avatar via `getProfile`. Slots with no `profileId`, or whose profile was deleted, are returned unchanged (deleting a profile does not evict a player from a live game). Both return the same reference when nothing changed, so subscribers can skip needless re-renders / persistence writes.
- `src/components/ProfilePickerModal.tsx`: `onSelect` is now **optional**. With `onSelect` → the existing setup-slot **picker** (row tap assigns). Without it → **manager** mode (`managing = !onSelect`): the header reads `manageProfiles`, tapping a profile row opens its editor (the redundant per-row ✏️ is hidden in this mode), and the footer button reads `close`. The create/edit form (name + `processAvatarFile` upload, live preview, remove-photo) and the delete-confirm flow are shared unchanged; saving/deleting goes through `upsertProfile`/`removeProfile`, which now broadcast the change.
- `src/components/TopBar.tsx`: added a 👤 button (before 🏆/⚙️) that opens `<ProfilePickerModal onClose=… />` with no `onSelect` → management mode. Present in both setup and game views since `TopBar` is always rendered.
- **Live propagation subscribers** (all via `onProfilesChanged`, cleaned up on unmount):
  - `src/App.tsx`: re-syncs the app-level `players` setup list (used for New Game rotation).
  - `src/components/SetupScreen.tsx`: re-syncs its local `players` slots so the setup screen reflects edits immediately.
  - `src/hooks/useGameState.ts`: re-syncs the live game's `state.players` (score sheet headers + turn indicator) **and** every undo `history` snapshot's players (so undo stays consistent with the edited identity). Uses top-level functional updaters that preserve references when unchanged (respecting the no-nested-setters rule). Patching `state` also flows into the `knueffl-game` persistence effect.
- History views are intentionally **not** retroactively renamed (records are historical snapshots); avatars there already resolve to the profile's current image via `resolveAvatar` (Task 39).
- i18n: added `manageProfiles`, `close` (types + de + en).
- Build + lint pass.

## TASK 42 — Custom "Take Photo" / "Choose Existing" avatar buttons ✅
The profile create/edit form now offers two explicit, app-styled source buttons instead of the single "📷 Upload photo" control that deferred to the browser's native action sheet.
- `src/components/ProfilePickerModal.tsx`: the avatar row's upload area now renders two `<label>`-wrapped hidden `<input type="file" accept="image/*">` buttons side by side (`flex flex-wrap gap-2`):
  - **📷 Take Photo** — its input carries `capture="environment"`, so mobile opens the camera directly; desktop (no camera exposed to `capture`) falls back to a normal file dialog.
  - **🖼️ Choose Existing** — no `capture`, so it opens the photo library / file picker.
  - Both reuse the existing `handleFile` → `processAvatarFile` pipeline unchanged (center-crop → compressed data-URL → live preview → linked on save). The remove-photo affordance is untouched.
- No `getUserMedia`/in-app live-camera UI — this stays a native-picker feature, so it works offline in the PWA with no camera-permission plumbing.
- i18n: retired the now-unused `uploadPhoto`; added `takePhoto` / `choosePhoto` (types + de + en). DE: „Foto aufnehmen" / „Foto auswählen".
- Build + lint pass.

## TASK 43 — Cleaner profile rows; delete moved into the edit modal ✅
Profile list rows in `ProfilePickerModal` are now just the entry (avatar + name), and deletion happens inside the edit form instead of on every row.
- `src/components/ProfilePickerModal.tsx`:
  - **List rows:** dropped the per-row ✏️ (edit) and 🗑️ (delete) buttons in both modes; each row is now a single full-width `<button>` (avatar + name) with a hover state. Tap behavior is unchanged per mode — picker mode (`onSelect` present) still **assigns** the profile to the slot; manage mode (no `onSelect`, from the 👤 TopBar button) still opens the editor via `startEdit`. `aria-label` is `editProfile` (manage) / `chooseProfile` (picker).
  - **Edit form header:** now a `flex justify-between` row; when editing an existing profile (`draft.id` set) it shows a 🗑️ delete button in the **top-right** that opens the existing `confirmDelete` overlay for that profile. Creating a new profile (`draft.id === null`) shows no delete button.
  - `doDelete` now also `setDraft(null)` so confirming a delete from the edit form returns to the refreshed list (profiles reloaded via `setProfiles(loadProfiles())`). The shared `confirmDelete` overlay + `doDelete` are otherwise unchanged.
- Net effect: editing/deleting is a management action reached through the 👤 popup (row-tap → edit → 🗑️); the setup-slot picker stays a clean assign-on-tap list. No i18n or live-propagation (Task 41) changes.
- Build + lint pass.

## TASK 44 — Deleted profiles: "Deleted" in game history, dropped from leaderboards ✅
When a linked profile is deleted, past games still render but the player's identity shows as removed, and the profile no longer appears in the 🏆 leaderboards.
- `src/utils/gameHistory.ts`:
  - Added `existingProfileIds(): Set<string>` (ids of currently-saved profiles) and `isProfileDeleted(profileId, ids?)` — true only when a `profileId` is present but no longer resolves to a saved profile; profile-less/legacy results are never "deleted". `ids` can be preloaded to avoid per-row `localStorage` reads. Imports `loadProfiles` alongside `getProfile`.
  - `aggregateStats` now preloads `existingProfileIds()` and `continue`s past any result whose profile was deleted, so deleted profiles drop out of every leaderboard (`rankBy`) and their games stop contributing to their own aggregate. Records without a `profileId` are unaffected.
- `src/components/HistoryModal.tsx`: per-game result rows now compute `deleted = isProfileDeleted(r.profileId, existingIds)` (new `existingIds` memo derived from the existing `profilesMap`). Deleted rows render the `deletedProfile` label (italic, muted) with the colored-initial fallback avatar (`avatar={undefined}`) instead of a stale cached photo; the avatar's name/color index also use the display label.
- `src/components/HistoryBoardModal.tsx`: the read-only scorecard's player mapping applies the same rule — deleted → `t.deletedProfile` + fallback avatar; memo dep now includes `t`.
- Leaderboard rows themselves need no change (deleted entries are already excluded upstream in `aggregateStats`).
- i18n: added `deletedProfile` (types + de + en) — DE „Gelöscht", EN „Deleted".
- Build + lint pass.

## TASK 45 — Dev seeding: predefined profiles linked to the seeded games ✅
The dev-only debug seeding now creates real, linked profiles instead of throwaway "Player N" names, so profile-driven history / leaderboard / deleted-profile behavior (Task 44) can be exercised end-to-end.
- `src/utils/gameHistory.ts`:
  - Added a fixed `DEBUG_PROFILES` roster (6 named players: Anna, Ben, Clara, David, Emma, Felix) with **stable ids** (`debug-anna` …).
  - `ensureDebugProfiles()` upserts each by id (idempotent — repeated seeding never duplicates them) and returns the current roster. Imports `upsertProfile` alongside `getProfile`/`loadProfiles`.
  - `seedDebugHistory()` now draws each game's 2–6 players from a shuffled subset of the roster; every `GameResult` carries the profile's `profileId`, `name`, and `avatar`, so seeded history links to real, editable/deletable profiles. Deleting a seeded profile via the 👤 manager now demonstrates Task 44's "Deleted" label + leaderboard exclusion. Still dev-only (gated behind `import.meta.env.DEV` at the `HistoryModal` seed-button call site).
- No new dependencies, no i18n changes; the seed button label is unchanged.
- Build + lint pass.

## TASK 46 — Allow each profile only once per game (setup screen) ✅
A profile can no longer be assigned to two player slots in the same game.
- `src/components/ProfilePickerModal.tsx`: added optional `disabledProfileIds?: string[]` prop and a `disabled` `Set` built from it. In the profile list, rows whose id is disabled render as a `disabled` button (dimmed via `disabled:opacity-40`/`cursor-not-allowed`, hover suppressed) with a muted uppercase `profileInGame` badge on the right; the name span became `flex-1 min-w-0 truncate` to seat the badge. Manager mode (no `onSelect`) passes no ids, so it's unchanged.
- `src/components/SetupScreen.tsx`: the `<ProfilePickerModal>` now receives `disabledProfileIds` = the `profileId`s of all slots except the one being edited (filtered to slots that actually have a `profileId`). The slot's own profile stays selectable.
- i18n: added `profileInGame` (types + de + en) — DE „im Spiel", EN „in game".
- Build passes (`npm run build`).

## TASK 47 — Prebuilt color themes + custom color picker

- `src/index.css`: replaced the dead `@theme` color tokens with full 11-stop `--color-primary-*` (teal) and `--color-secondary-*` (amber) ramps, making `bg-primary-*` / `text-secondary-*` etc. valid utilities whose defaults match the original palette.
- Refactored all accent utilities across `src/**/*.tsx` (171 occurrences): `teal-*` → `primary-*` (126), `amber-*` → `secondary-*` (45), including the player-disc color arrays in `PlayerAvatar.tsx` / `HistoryModal.tsx` (so discs now follow the theme).
- New `src/utils/themeColors.ts`: `hexToOklch` (sRGB→OKLab, no deps), `buildRamp`, reference L/C curves, `PRESETS` (teal/indigo/rose), `applyColorTheme` (sets/clears inline `--color-primary-*`, `--color-secondary-*`, and both `--color-slate-*`+`--color-zinc-*` for neutral tint), plus `resolveSpec`/`effectiveHex` helpers. Default preset applies zero overrides → current look untouched.
- `src/hooks/useTheme.tsx`: extended the provider with `colorTheme` state, persistence to `Knueffl-colors`, and `setPreset` / `setCustomColor` (switches to `custom`, seeding all roles) / `resetColors`; applies the resolved spec on mount and on change.
- UI: added a **Colors** section (3 preset swatch chips + Customize button) to the settings popover in `src/components/TopBar.tsx`, and a new `src/components/ColorPickerModal.tsx` with primary/secondary/background native color inputs + reset.
- i18n: added `colors`, `colorPreset`, `themeTeal/Indigo/Rose`, `customizeColors`, `colorPrimary/Secondary/Background`, `resetColors` to `types.ts`, `de.ts`, `en.ts`.
- Verified: `npm run build` and `npm run lint` pass; generated CSS emits `var(--color-primary-*)`; OKLCH hue extraction confirmed correct for every preset color.

## TASK 48 — Virtual dice: block scoring before rolling + clearer path back to the dice window

- `src/components/GameScreen.tsx`:
  - `handleCellClick` and `handleCross` now early-return when `virtualDice && !diceValues`, opening the dice modal instead of scoring/crossing — closes the hole where dismissing the dice modal let you enter scores manually before rolling.
  - Turn-indicator center control (virtual mode) restyled as an explicit pill button: pre-roll it renders a pulsing white `<name> · Roll` CTA, post-roll a translucent pill with the player's name.
  - The floating dice-result pill is now a `<button>` that reopens the dice window, with ring/hover/active feedback and a trailing 🎲 icon.
- No new i18n strings (reused `t.rollDice`). Build + lint pass.

## TASK 49 — Virtual dice: committed throw can't be redone

- `src/components/DiceModal.tsx`: added an optional `committedDice` prop. When set, the modal renders a locked, read-only view (dice faces + `diceLockedHint` + Close only) with no roll/keep controls — so reopening the window can't redo the throw.
- `src/components/GameScreen.tsx`: passes `committedDice={diceValues}` to `DiceModal`; since `advance` resets `diceValues` to null on turn change, locked mode applies only within an already-rolled turn and the next player still rolls fresh.
- i18n: added `diceLockedHint` to `types.ts`, `de.ts`, `en.ts`. Build + lint pass.

## TASK 50 — Virtual dice: pause & resume the throw (supersedes TASK 49's lock)

Replaced TASK 49's read-only "locked" reopen with a resumable throw so the player can peek at the board mid-turn and continue their remaining throws.

- `src/hooks/useGameState.ts`: added `diceThrowsUsed` + `diceKept` to `GameState` (initialised in `makeInitial`, reset in both `advance` branches, defaulted in the load-normaliser). Replaced `setDice` with `updateThrow(values, kept, throwsUsed)`, which keeps `diceValues` in sync with the latest dice and persists progress.
- `src/components/DiceModal.tsx`: reworked into a resumable component — props `initialValues`/`initialKept`/`initialThrowsUsed` seed it, `onChange` persists after every roll and keep-toggle. Closing is allowed whenever not mid-animation (`canClose = !rolling`); removed the locked/`committedDice` view. Throws still cap at `MAX_THROWS` (3), so reopening can't redo a spent throw.
- `src/components/GameScreen.tsx`: passes the persisted throw into `DiceModal` and wires `onChange={updateThrow}`; removed `handleDiceFinish`.
- i18n: removed the now-unused `diceLockedHint` from all three locale files.
- Build + lint pass.

## TASK 51 — Floating dice pill: real dice faces + held indicator

- Extracted the pip renderer into a shared `src/components/DieFace.tsx` (now with optional `sizeClass`/`pipSizeClass`); `DiceModal` imports it instead of defining its own copy.
- `src/components/GameScreen.tsx`: the floating dice pill now renders `DieFace` tiles instead of numbers, and highlights held dice (`state.diceKept[i]`) with the same primary-fill/white-pip treatment used for kept dice in the modal (non-held = white tile, dark pips).
- Build + lint pass.
