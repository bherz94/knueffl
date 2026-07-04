# Kniffel Web App — Requirements & Tasks

## Overview
A modern, responsive Kniffel (Yahtzee) scorekeeper web app built with React, Vite, and Tailwind CSS. One shared scoreboard with all players (2–6) shown side by side in columns. Players roll physical dice and enter their scores manually.

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
  - Kniffel (50 Punkte)
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
- Kniffel: single tap marks the cell with 50 points
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

- No backend, no persistence across sessions (in-memory only)
- No dice rolling animation or digital dice — players roll physical dice
- No undo functionality
- No multi-game tracking (one game per session)
