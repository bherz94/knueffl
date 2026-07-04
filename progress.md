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
