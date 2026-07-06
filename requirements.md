# Knueffl Web App — Requirements & Tasks

## Overview
A modern, responsive Knueffl (Yahtzee) scorekeeper web app built with React, Vite, and Tailwind CSS. One shared scoreboard with all players (2–6) shown side by side in columns. Players roll physical dice and enter their scores manually.

---

## TASK 1 — Project Scaffolding

- Initialize a Vite project with React and TypeScript
- Install and configure latest Tailwind CSS (v4)
- Set up folder structure: `src/components/`, `src/hooks/`, `src/i18n/`, `src/types/`, `src/utils/`
- Configure dark mode support in Tailwind (class-based toggle)
- Add base global styles (font, background, color tokens for light/dark)
- No routing library needed — single-page app with view state managed in React

---

## TASK 2 — Internationalization (i18n)

- Create translation files for German (`de.ts`) and English (`en.ts`)
- Translations must cover: all category labels, UI labels (setup, bonus, total, cross out hint, winner screen, placement labels, language toggle, theme toggle)
- Build a lightweight `useTranslation` hook that reads current language from context
- Add a `LanguageContext` provider at the app root
- Language switch button visible at all times (top bar)
- Default language: German (game is German-origin)

---

## TASK 3 — Theme (Light / Dark Mode)

- Add a `ThemeContext` provider at the app root
- Toggle button in top bar (sun/moon icon)
- Persist preference to `localStorage`
- All components must respect the active theme via Tailwind dark-mode classes
- Define a cohesive color palette: primary accent, surface, text, muted, border — for both modes

---

## TASK 4 — Player Setup Screen

- Shown before the game starts
- Player count selector: 2 to 6 (increment/decrement or segmented control)
- One text input per player for their name (required, max ~20 chars)
- "Start Game" button — disabled until all names are filled
- Responsive: inputs stack nicely on phone, side by side on tablet
- After confirmation, transition to the scoreboard view

---

## TASK 5 — Scoreboard Layout

- Horizontal table: first column = category labels, subsequent columns = one per player
- Upper section rows (in order):
  - Einser (1s), Zweier (2s), Dreier (3s), Vierer (4s), Fünfer (5s), Sechser (6s)
  - Gesamt (upper subtotal — auto-calculated)
  - Bonus bei 63 oder mehr: +35 (auto-calculated, shown as 35 or 0/blank)
  - Gesamt oberer Teil (auto-calculated)
- Lower section rows (in order):
  - Dreierpasch, Viererpasch
  - Full House (25 Punkte)
  - Kleine Straße (30 Punkte)
  - Große Straße (40 Punkte)
  - Knueffl (50 Punkte)
  - Chance
  - Gesamt unterer Teil (auto-calculated)
  - Gesamt oberer Teil (repeated — auto-calculated, same value as above)
  - Endsumme (auto-calculated)
- Section headers visually separate upper and lower parts
- Player names shown in column headers; active player column subtly highlighted
- Layout must fit 6 player columns + label column on an iPad (landscape) without horizontal scroll
- On phone: horizontal scroll allowed, but label column is sticky (frozen)

---

## TASK 6 — Game State & Turn Logic

- Track whose turn it is (current player index)
- A player's turn ends when they enter a score in any unfilled cell
- Turn advances to next player automatically after scoring
- Track which cells are filled (scored or crossed out) per player
- Game ends when every player has filled every scoreable cell (18 cells each)
- Game state lives in a top-level context or hook; no external state library needed

---

## TASK 7 — Upper Section Scoring (1s through 6s)

- Single tap/click on an empty cell opens a popup/modal
- Popup title: "Wie viele [die face]er?" (e.g. "Wie viele Einser?")
- Input: select or stepper from 0 to 5 (number of matching dice)
- Selecting 0 is not valid here — use double-tap to cross out (see Task 9)
- Confirm button calculates and saves score: count × die value (e.g. 3 × 1 = 3)
- Score is displayed in the cell
- Once filled, cell is no longer tappable (except cross-out — see Task 9)

---

## TASK 8 — Lower Section: Free Numerical Input (Dreierpasch, Viererpasch, Chance)

- Single tap/click on an empty cell opens an inline input or small popup
- Accepts integers 1–30 only (validation enforced, no letters)
- Entering a value saves it to the cell and closes input
- Entering nothing / cancelling does nothing
- Double-tap crosses out instead (see Task 9)

---

## TASK 9 — Cross-Out Mechanic (Double Tap / Double Click)

- Any unfilled, non-auto-calculated cell can be crossed out by double-tapping (mobile) or double-clicking (desktop)
- Crossed-out cells display a visual ✕ or strikethrough and contribute 0 to totals
- Crossed-out cells count as filled (turn advances, cell is locked)
- Timing window for double-tap detection: ~300ms between taps

---

## TASK 10 — Lower Section: Fixed-Score Categories

- Full House: single tap marks the cell with 25 points
- Kleine Straße: single tap marks the cell with 30 points
- Große Straße: single tap marks the cell with 40 points
- Knueffl: single tap marks the cell with 50 points
- No input needed — just one tap to confirm, double-tap to cross out
- Consider a brief confirmation tap animation to distinguish from accidental touches
- Once tapped, cell is locked

---

## TASK 11 — Auto-Calculated Fields

All the following update reactively whenever any cell value changes:

- **Gesamt (upper subtotal):** sum of all 6 upper section scores (crossed-out = 0)
- **Bonus:** 35 if Gesamt ≥ 63, else 0 (show "35" or "—")
- **Gesamt oberer Teil:** Gesamt + Bonus
- **Gesamt unterer Teil:** sum of all 7 lower section scores
- **Gesamt oberer Teil (repeated row):** same value as above
- **Endsumme:** Gesamt oberer Teil + Gesamt unterer Teil

Auto-calculated cells are visually distinct (different background, not tappable).

---

## TASK 12 — Game End & Winner Screen

- Triggers when all players have filled all 18 scoreable cells
- Overlay or dedicated view showing final rankings
- Players ranked by Endsumme descending
- Placement labels: 1st / 2nd / 3rd etc. (translated)
- Winner visually highlighted (trophy icon, accent color)
- Ties handled: shared placement (e.g. two players tied for 2nd)
- "New Game" button resets everything and returns to setup screen

---

## TASK 13 — Component Architecture

Split the UI into focused components (no giant App.tsx):

- `App` — providers, view routing (setup vs. scoreboard vs. game-end)
- `TopBar` — language toggle, theme toggle, app title
- `SetupScreen` — player count + name inputs + start button
- `Scoreboard` — outer layout, composes all section components
- `SectionHeader` — visual divider between upper/lower
- `CategoryRow` — one row: label + one `ScoreCell` per player
- `ScoreCell` — handles tap, double-tap, displays value/cross/blank
- `UpperInputPopup` — die-count stepper for 1–6 categories
- `FreeInputPopup` — numeric input for Dreierpasch/Viererpasch/Chance
- `AutoCell` — read-only calculated cell
- `PlayerHeader` — player name + active indicator
- `GameEndOverlay` — rankings and winner display

---

## TASK 14 — Responsive & Device Support

- **iPad (primary):** all 6 player columns + label column visible at once in landscape; tested at 1024×768
- **Phone:** label column sticky/frozen; player columns horizontally scrollable; tap targets ≥ 44px
- **Desktop:** comfortable at 1280px+; popups centered
- Font sizes and spacing scale appropriately across breakpoints
- No native scrollbars visible on iPad in landscape for the main table

---

## Non-Goals (explicit exclusions)

- No backend, no persistence across sessions (in-memory only) — *superseded: game state now persists to `localStorage` (see `useGameState`)*
- No dice rolling animation or digital dice — players roll physical dice — *superseded: optional virtual dice mode added*
- No undo functionality — *superseded: undo implemented*
- No multi-game tracking (one game per session)

---

# Enhancements — Round 2

These build on the shipped app. Devices in use: Pixel 10 (works), iPad and iPhone (issues below).

## TASK 15 — Numeric-only input on iPad ("alle Augen zählen" cells)

**Problem:** `FreeInputPopup` (Dreierpasch, Viererpasch, Chance — only reachable when virtual dice is OFF) uses `<input type="number" inputMode="numeric">`. iPhone/Android honor `inputMode` and show a number pad, but **iPad Safari ignores `inputMode`/`pattern` and always shows the full alphanumeric keyboard** (known WebKit behavior, no attribute fixes it).

**Fix — custom in-modal number pad (no OS keyboard):**
- Replace the text `<input>` in `FreeInputPopup` with an on-screen keypad rendered inside the modal, matching the button style of `UpperInputPopup`.
- Keypad: digits `0–9`, a backspace/delete key, and a clear key; a large read-only display of the current entry.
- Keep existing validation: valid range 1–30; Confirm disabled until valid.
- Keep Cancel/Confirm buttons. No reliance on any native keyboard, so behavior is identical on every device.
- **Desktop hardware keyboard still works:** while the modal is open, capture key events so physical number keys (`0–9`) append digits, `Backspace` deletes, `Enter` confirms (when valid), and `Escape` cancels — mirroring the on-screen keypad.
- Verify tap targets ≥ 44px (iPad/touch requirement from Task 14).

## TASK 16 — Rotate starting order on New Game

- On "New Game", rotate the player order by one so a different player throws first each game.
- Mapping requested: previous last player → new first (index 0); previous player 1 → index 1; previous player 2 → index 2; etc. (i.e. right-rotate the player list by 1).
- Names, and any per-player settings, travel with the player during rotation.
- Applies to the "New Game" action from the game-end state (`onNewGame`); the fresh game starts with `currentPlayerIndex = 0`, which is now the previously-last player.
- Setup screen order is unaffected for a brand-new (first) game.

## TASK 17 — Defer Endsumme until game is finished

- While the game is in progress, the **Endsumme** (grand total, `calcGrandTotal`) must NOT be shown — display a placeholder (e.g. `—`) in each player's Endsumme cell.
- The intermediate auto-cells stay live: **Gesamt (upper subtotal)**, **Bonus**, **Gesamt oberer Teil**, **Gesamt unterer Teil** continue to update per input.
- Only once **all** players have filled all 18 cells (`state.isGameOver`) does the Endsumme populate for everyone at once.
- Winner screen / placements are computed only at game end, so they are unaffected.
- Implementation touch point: the Endsumme `AutoCell` in `Scoreboard` should receive `isGameOver` and render the placeholder until true.

## TASK 18 — Editable per-player move history (virtual dice OFF)

**Goal:** make it easy to spot and fix a mis-entry (e.g. "4× 3" recorded where "4× 2" was meant, or a value put in the wrong category entirely) even several turns later.

**Move log (state):**
- Add an ordered move log to game state, persisted alongside the existing save. Each entry: `{ id, playerIndex, category, kind: 'scored' | 'crossed', value?, timestamp }`.
- Append an entry on every `score` and `cross`. Undo must also revert the log.

**Per-player history modal:**
- Only available when virtual dice is OFF.
- Tapping a player's name / column header opens a **centered modal** listing that player's moves, newest first, each showing the category label and its value (or ✕ for crossed-out).

**Correcting an entry (handles wrong-cell mistakes):**
- Tapping a history entry **removes** that move and reverts its cell to empty. If the game had ended, `isGameOver` reverts to false.
- The modal closes and the app enters a **correction mode** bound to that player: the scoreboard highlights that player's empty cells, and a banner/badge indicates a correction is in progress (with a way to cancel it).
- The user then taps the correct cell (any empty cell in that player's column) and enters a fresh value via the normal input flow. This is why a simple pre-filled edit popup is insufficient — the fix may need a different category.
- A correction **does not advance the turn** and does not change `currentPlayerIndex`; it writes the new value, appends/updates the move log, and exits correction mode.
- All derived totals (subtotals, bonus, Endsumme) recompute automatically from the corrected cell.

## TASK 19 — Preserve scroll position + Options menu

**Part A — keep scroll position after scoring:**
- On the phone/tablet the main table scrolls (the `overflow-auto` container in `GameScreen`). After entering a score, the view currently jumps (to bottom), losing the user's place.
- Capture the scroll container's `scrollTop` when an input is committed and restore it after the cell updates and the popup closes, so the user stays exactly where they were.

**Part B — Options cogwheel (top bar):**
- Add a settings/cogwheel button in `TopBar` opening a submenu/popover containing:
  - **Language** (de/en) — consolidates the existing language toggle.
  - **Light / Dark mode** — consolidates the existing theme toggle.
  - **Font size** — a base font-size / scale control (e.g. S / M / L) that sets the app's root font size so all text scales.
- All three preferences persist to `localStorage` and apply app-wide on load.

## TASK 20 — Keyboard-driven setup (Tab + Enter to start)

- Support a keyboard-only flow on `SetupScreen`: type player 1's name → `Tab` → type player 2's name → `Enter` starts the game.
- Pressing `Enter` in any name input triggers Start when all names are filled (same guard as the button, `allFilled`); if not all names are filled, `Enter` does nothing (or moves focus to the next empty field — implementer's choice, prefer just no-op to avoid surprises).
- Auto-focus the player 1 name input on mount so typing can begin immediately.
- Natural tab order: name 1 → name 2 → … → (virtual dice toggle) → Start button. Verify the DOM order produces this without explicit `tabindex`.
- Mouse/touch behavior is unchanged.

## TASK 21 — Correction preserves history position

- When a move is corrected via the move-history flow (Task 18), the corrected entry must stay in its **original position** in the history instead of jumping to the end.
- Root cause to avoid: `removeMove` drops the original log entry and the correction appends a fresh entry with a new timestamp, so (with the modal sorting newest-first) the edited move surfaces at the top.
- Capture the removed move's original log index and timestamp, and splice the replacement entry back at that index reusing the original timestamp. Fall back to appending when no original position is known.
- Example: editing "3× fours" → "3× fives" replaces the entry in place; the surrounding move order is unchanged.

## TASK 22 — Cancelling a correction restores the move

- Cancelling an in-progress correction must fully restore the original move (cell value **and** its log entry), leaving the game exactly as it was before the correction started.
- Root cause to avoid: selecting a history entry immediately removes the move (empties the cell so it's re-selectable); if cancel only clears the correction UI state, that removed move is lost and the player ends up one move short.
- On cancel, revert the pending removal (e.g. via the existing undo snapshot) and then clear the correction state.
- While a correction is in progress, the top-bar undo button must be disabled so the pending removal stays at the top of the undo stack and can be reverted cleanly.

## TASK 23 — Game history + high-score leaderboard

Give players a persistent record of past games and a cross-game leaderboard, all client-side.

**Storage:**
- Persist finished games to `localStorage` under a dedicated key (records are tiny; derived stats are computed, not stored). No backend — history is per-browser/device. (Cross-device sync would be a separate, larger effort.)
- A finished-game record holds: a stable game id, a finished-at timestamp, the virtual-dice flag, and the ranked results (`name`, `total`, `place`).
- Record a game when it ends; if the end is reverted via undo, remove the record. Recording must be idempotent (reload / post-game correction must not create duplicates) — dedupe by the game id.

**Access:**
- A dedicated 🏆 button in the `TopBar` (alongside ⚙️) opens a History/Leaderboard modal. Reachable from both the setup and game views.

**Recent Games tab:**
- List past games newest-first, each showing its timestamp (localized to the active language) and the full ranking (place · name · points), consistent with the game-end overlay.

**Leaderboard tab:**
- Aggregate players across all games, matching identity **case-insensitively** (display name uses the most recent casing seen).
- Switchable metrics (tabs): **Best single game**, **Wins** (1st-place finishes), **Average score**. Show games-played as secondary context per player.

**Housekeeping:**
- Provide a confirm-guarded "Clear history" action.
- All user-facing strings go through i18n (de + en).

## TASK 24 — Keyboard entry in the upper-section popup (desktop)

- Support a keyboard-only flow in the upper-section count popup (`UpperInputPopup`): with the popup open, typing a digit **1–5** selects that die count, and **Enter** confirms.
- Example: click **Dreier** → popup opens → press `3` → press `Enter` commits 3 × 3 = 9.
- **Escape** cancels the popup (same as the Cancel button / backdrop click).
- Enter is a no-op while no count is selected (mirrors the disabled Confirm button). Digits outside 1–5 are ignored.
- Mouse/touch behavior is unchanged.

## TASK 25 — Cap the History/Leaderboard modal height

- The "Verlauf & Bestenliste" (History/Leaderboard) modal must be capped at **80% of the viewport height**; when its content exceeds that, the body scrolls while the header (tabs) and footer stay fixed.

## TASK 26 — Lock background scroll under the History modal

- While the History/Leaderboard modal is open, the page behind it must not scroll — only the modal's own body scrolls. Restore normal page scrolling when it closes.
- Scope to the History modal only; the score-input popups (upper/free) are unaffected.

## TASK 27 — Styled "Clear history" confirmation

- Replace the native `window.confirm` for "Clear history" with an in-app confirmation dialog styled to match the app (same visual language as the cancel-game confirm: rounded card, title + message, Cancel + destructive red confirm buttons; backdrop/Cancel dismisses without clearing).
- Confirming clears the history and refreshes the modal; cancelling leaves data untouched.

## TASK 28 — Dev-only "seed debug games" button

- Provide a debug button (in the History modal footer) that writes sample history: 10 two-player games between "Player 1" and "Player 2" (giving each player 10 games), spread over the past ~10 days.
- Each player's game has 0–2 random categories crossed out (scored 0); remaining categories get plausible values, and the grand total is computed with the real scoring logic. Records append to any existing history and the modal refreshes.
- Must only be available in local dev — excluded from production builds (gate on `import.meta.env.DEV`).

## TASK 29 — View the full scorecard of a past game

- In the History modal's "Recent Games" tab, tapping a game card opens a **read-only** view of that game's completed scorecard (all players' filled-in cells, subtotals, bonus, totals, and final placements/medals).
- The view is purely for looking back: **no** undo, no move-history, and no cell editing/correction are possible.
- Persist each finished game's full per-player `PlayerScores` in the history record so the board can be reconstructed. Older records saved before this change (which lack per-player scores) simply aren't clickable.
- Dev-seeded debug games also store their scores so they're viewable.
- All user-facing strings go through i18n (de + en).

## TASK 30 — Paginate the Recent Games list

- The History modal's "Recent Games" tab must not render all past games at once. Show the most recent ~30 and reveal more in batches via a "Show more" action (batch size ~30), so a large history (700+ games) opens without a long render stall.
- Newest-first ordering and the per-game card contents are unchanged. The Leaderboard tab is unaffected.

## TASK 31 — Reuse a single date formatter in the History modal

- Replace the per-card `Date.toLocaleString(...)` in the History modal with a single memoized `Intl.DateTimeFormat` instance (keyed on the active locale), used via `.format(ms)`. Constructing a formatter per card is a measurable cost across hundreds of games.
- Output format is unchanged (dd.mm.yyyy hh:mm, localized). Apply the same pattern in the read-only board view for consistency.

## TASK 32 — Compact scorecard encoding (DEFERRED / optional)

- Optionally store each persisted scorecard as a fixed-order array of 13 numbers (e.g. `-1` = crossed, otherwise the scored value) instead of 13 `{status, value}` objects, shrinking the on-disk footprint ~5–8× and speeding parse/stringify.
- **Status: not implemented.** Superseded for performance by TASK 33 (lazy per-game scorecards), which stops loading scorecards during list rendering entirely. TASK 32's remaining value is delaying the ~5 MB `localStorage` quota, which is not a concern at current volumes. The two compose (a compact array can be stored under the per-game key) if footprint ever becomes pressing.

## TASK 33 — Lazy-load past-game scorecards

- Stop storing full per-player scorecards inline in the `knueffl-history` list. Persist each finished game's scorecards under a separate per-game key (`knueffl-board-<id>`) and load them only when that game's board is opened. This keeps `loadHistory()` (called on every modal open and on every record mutation) parsing only lightweight `{name, total, place}` records.
- `recordGame` splits scorecards out of the record: it writes the board blob under the per-game key and marks the light record with a `hasBoard` flag. `removeRecord` and `clearHistory` must also delete the associated board key(s).
- Backward compatible: records written earlier that still carry inline `scores` remain viewable (fall back to inline scores when no per-game board key exists). The "clickable" detection in the list uses `hasBoard` OR legacy inline scores.
- Dev-seeded games use the same per-game-key storage.

## TASK 34 — Open the winning game from the "Best game" leaderboard

- On the History modal's **Leaderboard** tab, only the **Best single game** metric points at one specific game per player. Make each row on that metric clickable: tapping a player opens the read-only board (`HistoryBoardModal`, Task 29) for the exact game where they achieved that best single-game total.
- The other two metrics (**Wins**, **Average score**) aggregate across many games — there is no single game to open — so their rows stay non-interactive.
- Only rows whose best game still has a viewable board (`recordHasBoard`) are clickable; if the winning game predates stored scorecards, the row is inert (no chevron/hover affordance).
- Track the source game for each player's best single game in `aggregateStats` (e.g. a `bestGameId` on `PlayerStats`), updated whenever a new personal-best total is seen. Ties keep the first-seen game.
- Reuse the existing `HistoryBoardModal` / `boardRecord` state — the board opens exactly as it does from Recent Games (same read-only view, medals, date header).
- No new user-facing strings expected (reuses `viewGameBoard`).

## TASK 35 — Undo skips history corrections (targets the last real move)

**Bug:** completing a move-history correction (Task 18) left the game corrupted after one undo. A correction pushed **two** snapshots onto the undo stack — one from `removeMove` (cell emptied, log entry dropped) and one from the `correctScore`/`correctCross` that replaced it. So pressing undo first restored the broken intermediate "move removed, cell empty" state (never mind that it was 4 turns ago), and it took a second undo to fully back out. The last *real* move never got undone.

**Fix:** corrections must not live on the main undo stack at all. `undo` should always revert the **last real move** (a `score`/`cross` that advanced the turn), regardless of any corrections made to older entries.
- Keep the pre-`removeMove` snapshot in a separate in-memory buffer (not `history`), used solely to cancel a correction.
- `correctScore`/`correctCross` no longer snapshot into `history`; on completion they clear the pending-correction buffer.
- Cancelling a correction restores from that buffer (was previously implemented by calling `undo()`, which relied on the removal sitting at the top of the undo stack — the Task 22 constraint). The buffer is in-memory only, matching the correction UI state, which also isn't persisted.
- Net effect: making a correction leaves `canUndo` / the undo stack untouched; undo continues to step back through real moves only.
- **Corrections must survive undo of later moves.** Because each undo snapshot captures state *before* a real move, a snapshot taken after the corrected move still holds the move's pre-correction cell value. Undoing a later move would otherwise resurrect the old value (e.g. correct P1's `3×6`→`3×5`, then undo P1's later Full House → the Full House is correctly removed but the sixes cell springs back to `18`). Fix: when a correction commits, patch every undo snapshot that already recorded the corrected move (matched by move id) — clear the move's original cell, write the new cell, and swap the log entry in place — so the correction reads as if it had always been there. Snapshots predating the move are untouched.
- **No nested state setters (StrictMode double-push).** `score`/`cross` pushed the undo snapshot via `setHistory(h => [...h, prev])` *inside* the `setState` updater; `undo` called `setState` inside the `setHistory` updater. React StrictMode (dev) double-invokes updater functions to check purity, and a nested non-idempotent append runs twice — so **every move pushed its snapshot to the undo stack twice**. A single undo still looked correct (it pops a real snapshot), but pressing undo repeatedly revealed the doubles as an every-other "does nothing / then works" pattern. Fix: never call a state setter inside another setter's updater. These mutators run from user events, so the closure `state`/`history`/`pendingCorrection` are the committed values — read them directly and pass to pure updaters or value setters.

## Player profiles (TASK 36–39)

Reusable player profiles so a game is set up by picking known people (with optional avatar photos) instead of retyping names, and so history is tied to a stable identity rather than name-equality. Split into four tasks, each implemented in a fresh context and logged to `progress.md`.

## TASK 36 — Player profiles foundation (types + storage)

- Introduce a `Profile` model — `{ id, name, avatar?, createdAt }`, where `avatar` is a compressed data-URL string (or undefined) — in `src/types/profile.ts`.
- Add a `localStorage`-backed CRUD module `src/utils/profiles.ts` under key `knueffl-profiles`: `loadProfiles`, `saveProfiles`, `getProfile`, `upsertProfile`, `removeProfile`, `makeProfileId` (UUID with the same fallback as `makeMoveId`). Follow the defensive `try/catch` + `JSON.parse`/`Array.isArray` pattern used by `gameHistory.ts`.
- Provide an avatar helper `processAvatarFile(file): Promise<string>` that rejects non-images, loads the image, center-crops to a square onto a ~128×128 canvas, and exports a compressed data URL (`image/jpeg`, ~0.8) so `localStorage` stays small.
- Additively add optional `profileId?` / `avatar?` to `Player` (`src/types/game.ts`) and to `GameResult` (`src/utils/gameHistory.ts`). Foundation only — no UI wiring, no aggregation changes in this task.

## TASK 37 — Wire profiles into game creation (setup + picker)

- On the setup screen, tapping a player slot opens a profile picker that lists saved profiles (avatar thumbnail + name) as selectable rows, and can create / edit / delete profiles. Creating or editing supports an optional local photo upload (`<input type="file" accept="image/*">` → `processAvatarFile`) with a live preview and a remove-photo action. Selecting a profile assigns it (name + profileId + avatar) to that slot.
- Setup slots show the chosen profile's avatar + name, or an empty "choose profile" placeholder; a filled slot can be cleared. Player-count controls and the virtual-dice toggle are unchanged; Start remains gated on every slot having a non-empty name.
- Introduce `PlayerSetup = { name; profileId?; avatar? }` and change `onStart` to pass `PlayerSetup[]`. Thread this through `App` (state becomes `PlayerSetup[]`, migrating any legacy persisted `string[]` defensively; New-Game right-rotation operates on the setups), `GameScreen`, and `useGameState` (`makeInitial` maps each setup onto a `Player` carrying name + profileId + avatar; the rehydration "matching players" check compares both name and profileId).
- All new user-facing strings go through the `Translations` interface and both locales.

## TASK 38 — Render player avatars on the score sheet

- Each player's avatar image appears on the score sheet in place of the colored initial disc; when no avatar is set, keep the existing per-player colored disc as the fallback. The place-medal badge overlay, active styling, and name label are preserved.
- Thread `avatar` from `Player` through `Scoreboard` into `PlayerHeader`. Optionally show the current player's small avatar in the turn indicator. A shared avatar-with-initial-fallback component may be extracted to avoid duplication. No new strings (avatars are images).

## TASK 39 — Profile-based history identity + avatars in history views

- History identity is keyed by `profileId` when present, falling back to lowercased/trimmed name for legacy / profile-less records — so entries link to a profile rather than relying on name-equality. `aggregateStats` gains `profileId?` on `PlayerStats`; all existing metrics (`gamesPlayed`, `wins`, `bestGame`, `bestGameId`, `avgScore`) and `rankBy` are unchanged. Old name-keyed and new profile-keyed records for the same person are intentionally not merged.
- Avatars are shown wherever a name appears in history: Recent Games rows, Leaderboard rows, the read-only board view, the move-history header, and the game-end rankings. Avatar resolution prefers the linked profile's **current** avatar (via `getProfile`), falling back to any avatar cached on the record, else the colored-initial fallback.
- Backward compatible: legacy records without `profileId` aggregate by name and render the initial fallback with no crashes or missing-avatar errors.

## TASK 40 — Drag-and-drop reordering of players on the setup screen

- Players can be reordered on the setup screen before starting, so turn order can be arranged up front. Reordering mutates the `PlayerSetup[]` order; the slot number badges and per-slot profile assignments follow the new order.
- Use native pointer events (works on touch and mouse — the app is a mobile-first PWA where HTML5 drag is unreliable on touch), no new dependencies. A per-row grip handle initiates the drag; the row being dragged is visually highlighted, and the handle disables touch scrolling while dragging. Player-count controls and Start-gating are unaffected. The handle carries an accessible label (`reorderPlayer`, added to both locales).

## TASK 41 — Manage profiles (edit name/avatar) anytime, live-updating the game

Give players a dedicated way to edit their saved accounts (profiles) — changing the **name and/or avatar** — that is reachable at any time, including **during a running game**, and that immediately updates everywhere the profile is currently in use.

**Entry point (global):**
- Add a 👤 button to the `TopBar` (next to 🏆 and ⚙️), present in both the setup and game views, that opens a profile **management** modal.
- The management modal lists all saved profiles and lets the user create, edit (name + photo), and delete them. Editing/creating reuses the existing avatar upload flow (`processAvatarFile`, live preview, remove-photo). No "select/assign to a slot" behavior in this mode — tapping a profile opens its editor.

**Reuse, not duplication:**
- Extend `ProfilePickerModal` to serve both roles: when an `onSelect` handler is passed it stays the setup-slot **picker** (tap a row = assign); when `onSelect` is omitted it is the **manager** (tap a row = edit). The create/edit form and delete-confirm flow are shared. Header and footer labels adapt (`manageProfiles` / `close`).

**Live propagation (the key requirement):**
- Saving an edit must update, in place and without a reload, every slot that references that profile by `profileId`:
  - the in-progress game's players (score sheet column headers + turn indicator),
  - the setup screen's player slots (if visible),
  - the app-level setup list used for New Game rotation.
- A slot's stored `name`/`avatar` is treated as a cache of its linked profile; whenever the profile store changes, any slot carrying that `profileId` re-syncs to the profile's **current** name + avatar. Slots without a `profileId`, or whose profile was deleted, keep their last-known values unchanged (deleting a profile does not remove a player from a live game).
- Mechanism: `upsertProfile`/`removeProfile` broadcast a lightweight change event; `App`, `SetupScreen`, and `useGameState` subscribe and re-sync their profile-linked slots (including the game's undo-history snapshots, so undo stays consistent with the edited identity). Reference identity is preserved when nothing changed to avoid needless re-renders/persist writes.
- History records remain historical snapshots (past games are not retroactively renamed); avatars in history already resolve to the profile's current image via `resolveAvatar`.

**i18n:** all new strings (`manageProfiles`, `close`) go through `types.ts` + `de.ts` + `en.ts`.

## TASK 42 — Custom "Take Photo" / "Choose Existing" avatar buttons

Replace the single "📷 Upload photo" control in the profile create/edit form with **two distinct, app-styled buttons** so the user explicitly chooses the source of the avatar image instead of relying on the browser's native action sheet:

- **📷 Take Photo** — opens the device camera directly on mobile (`<input type="file" accept="image/*" capture="environment">`). On desktop (no camera exposed to `capture`) it degrades gracefully to a normal file dialog.
- **🖼️ Choose Existing** — opens the photo library / file picker (`<input type="file" accept="image/*">`, no `capture`).

Both feed the **existing** `handleFile` → `processAvatarFile` pipeline (center-crop → compressed data-URL → live preview → linked on save); no change to storage, cropping, or the remove-photo affordance. No `getUserMedia`/in-app live-camera UI — this stays a native-picker feature so it works offline in the PWA with no camera-permission plumbing.

**i18n:** retire the now-unused `uploadPhoto` string; add `takePhoto` and `choosePhoto` across `types.ts` + `de.ts` + `en.ts`.

## TASK 43 — Cleaner profile rows; move delete into the edit modal

Declutter the profile list in `ProfilePickerModal` and relocate deletion.

- **Rows show only the entry** (avatar + name) — remove the per-row ✏️ (edit) and 🗑️ (delete) buttons in **both** modes.
- **Tap behavior unchanged per mode:** manage mode (no `onSelect`, from the 👤 TopBar button) → tapping a row opens that profile's editor; picker mode (setup-slot, `onSelect` present) → tapping a row still **assigns** the profile to the slot. (Editing/deleting is a management action, done via the 👤 popup, not the setup picker.)
- **Delete lives in the edit modal:** add a 🗑️ button in the **top-right of the create/edit form header**, shown **only when editing an existing profile** (`draft.id` set), not when creating a new one. Tapping it opens the existing delete-confirm overlay; confirming deletes via `removeProfile` and returns to the **refreshed** list (`setDraft(null)`, reload profiles). The existing `confirmDelete` overlay + `doDelete` are reused.
- No new i18n strings required (reuse `deleteProfile`, `deleteProfileConfirm`, `delete`, `cancel`). Live-propagation (Task 41) is unchanged.

## TASK 44 — Deleted profiles: show "deleted" in game history, drop from leaderboards

When a profile is deleted, past games must still render but its identity is shown as removed, and it must no longer appear in the high-score leaderboards.

- **i18n:** add `deletedProfile` — DE `„Gelöscht"`, EN `"Deleted"` (types + de + en).
- **Detection helper** in `src/utils/gameHistory.ts`: a result's profile counts as deleted when it carries a `profileId` for which no `Profile` currently exists. Add a helper (e.g. `existingProfileIds(): Set<string>` and/or `isProfileDeleted(profileId, ids?)`) that callers can use; preload the id set once per render to avoid per-row `localStorage` reads. Legacy/profile-less results (no `profileId`) are never "deleted".
- **Game-history detail views** (`HistoryModal` per-game result rows and `HistoryBoardModal`): where a result's profile was deleted, display the `deletedProfile` label instead of the cached `name`, and render the colored-initial fallback avatar (do **not** show a stale cached photo for a deleted profile).
- **Leaderboards** (`aggregateStats` / `rankBy`, the 🏆 stats view): exclude results whose linked profile was deleted, so a deleted profile no longer shows up in any leaderboard and its games stop contributing to its own aggregate. Records without a `profileId` are unaffected.

## TASK 45 — Dev seeding: predefined profiles linked to the seeded game scores

Make the dev-only debug seeding produce **real profiles** linked to the fabricated games, so the profile-linked history/leaderboard/deleted-profile behavior can be exercised without hand-creating accounts.

- In `seedDebugHistory` (dev-only, `src/utils/gameHistory.ts`): first ensure a small fixed roster of predefined profiles exists (e.g. ~6 named players) via `upsertProfile` using **stable ids**, so repeated seeding does not duplicate them. No avatars needed (colored-initial fallback is fine).
- Each seeded game picks a random subset (2–6) of these profiles; every `GameResult` carries the profile's `profileId` and `name` (and `avatar` if the profile has one) so seeded history links to real, editable/deletable profiles — letting Task 44's "deleted" and leaderboard-exclusion behavior be tested by deleting a seeded profile.
- Keep it strictly dev-only (still gated behind `import.meta.env.DEV` at the call site) and self-contained in `gameHistory.ts` (or a small helper it calls).
