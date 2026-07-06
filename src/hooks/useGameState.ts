import { useState, useEffect } from 'react'
import type { Player, ScorableCategory, MoveEntry, CellState } from '../types/game'
import { makeEmptyScores } from '../types/game'
import { isPlayerDone } from '../utils/scoring'

export interface GameState {
  gameId: string
  players: Player[]
  currentPlayerIndex: number
  isGameOver: boolean
  diceValues: number[] | null
  moveLog: MoveEntry[]
}

function makeMoveId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Identifies the move being corrected: its `id` (to find & patch prior undo
// snapshots that already contained it) plus where it sat in the log (`index`,
// `timestamp`) so its replacement keeps the same spot instead of being appended.
export interface MoveSlot {
  id: string
  index: number
  timestamp: number
}

function insertMove(moveLog: MoveEntry[], entry: MoveEntry, slot?: MoveSlot): MoveEntry[] {
  if (slot == null || slot.index < 0 || slot.index > moveLog.length) return [...moveLog, entry]
  return [...moveLog.slice(0, slot.index), entry, ...moveLog.slice(slot.index)]
}

const GAME_KEY = 'knueffl-game'

function loadGameState(): { state: GameState; history: GameState[] } | null {
  try {
    const raw = localStorage.getItem(GAME_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed
  } catch {
    return null
  }
}

export function clearGameState() {
  try { localStorage.removeItem(GAME_KEY) } catch {}
}

function makeInitial(playerNames: string[]): GameState {
  return {
    gameId: makeMoveId(),
    players: playerNames.map((name) => ({ name, scores: makeEmptyScores() })),
    currentPlayerIndex: 0,
    isGameOver: false,
    diceValues: null,
    moveLog: [],
  }
}

export function useGameState(playerNames: string[]) {
  const [history, setHistory] = useState<GameState[]>(() => {
    const saved = loadGameState()
    if (!saved) return []
    const match =
      saved.state.players.length === playerNames.length &&
      saved.state.players.every((p, i) => p.name === playerNames[i])
    return match ? saved.history : []
  })

  // Snapshot taken when a correction starts (the pre-removeMove state), used only
  // to cancel that correction. Corrections are deliberately kept OFF the main undo
  // stack (`history`) so `undo` always targets the last real move (score/cross),
  // even if the thing being corrected was several turns back. In-memory only —
  // it mirrors the correction UI state, which also isn't persisted.
  const [pendingCorrection, setPendingCorrection] = useState<GameState | null>(null)

  const [state, setState] = useState<GameState>(() => {
    const saved = loadGameState()
    const initial = makeInitial(playerNames)
    if (!saved) return initial
    const match =
      saved.state.players.length === playerNames.length &&
      saved.state.players.every((p, i) => p.name === playerNames[i])
    if (!match) return initial
    // Normalize saves that predate diceValues / moveLog / gameId fields
    return {
      ...saved.state,
      gameId: saved.state.gameId ?? makeMoveId(),
      diceValues: saved.state.diceValues ?? null,
      moveLog: saved.state.moveLog ?? [],
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(GAME_KEY, JSON.stringify({ state, history }))
    } catch {}
  }, [state, history])

  // NB: state setters are never nested inside another setter's updater. Under
  // StrictMode, React double-invokes updater functions to check purity, so a nested
  // `setHistory(h => [...h, prev])` (a non-idempotent append) would push twice and
  // corrupt the undo stack. These mutators fire from user events, so the closure
  // `state`/`history` are the committed values — safe to read directly and pass to
  // pure updaters / value setters.
  function score(playerIndex: number, category: ScorableCategory, value: number) {
    const players = writeCell(state.players, playerIndex, category, { status: 'scored', value })
    const entry: MoveEntry = { id: makeMoveId(), playerIndex, category, kind: 'scored', value, timestamp: Date.now() }
    setHistory((h) => [...h, state])
    setState(advance(state, players, entry))
  }

  function cross(playerIndex: number, category: ScorableCategory) {
    const players = writeCell(state.players, playerIndex, category, { status: 'crossed' })
    const entry: MoveEntry = { id: makeMoveId(), playerIndex, category, kind: 'crossed', timestamp: Date.now() }
    setHistory((h) => [...h, state])
    setState(advance(state, players, entry))
  }

  // Correction: write a cell for a player WITHOUT advancing the turn (Task 18).
  // `slot` (from the move being corrected) preserves the entry's original position
  // and timestamp so the correction replaces it in place instead of jumping to the end.
  // Corrections do NOT push onto `history` — completing one leaves the undo stack
  // untouched so `undo` still reverts the last real move. The pending-correction
  // buffer (set by removeMove) is cleared once the replacement is written.
  function correctScore(playerIndex: number, category: ScorableCategory, value: number, slot?: MoveSlot) {
    applyCorrection(playerIndex, category, { status: 'scored', value }, 'scored', value, slot)
  }

  function correctCross(playerIndex: number, category: ScorableCategory, slot?: MoveSlot) {
    applyCorrection(playerIndex, category, { status: 'crossed' }, 'crossed', undefined, slot)
  }

  // Shared correction commit: write the new cell (without advancing the turn) and
  // patch the corrected move into every earlier undo snapshot so it survives an undo
  // of any move made after it (see patchSnapshot).
  function applyCorrection(
    playerIndex: number,
    category: ScorableCategory,
    cell: CellState,
    kind: MoveEntry['kind'],
    value: number | undefined,
    slot?: MoveSlot,
  ) {
    const entry: MoveEntry = { id: makeMoveId(), playerIndex, category, kind, value, timestamp: slot?.timestamp ?? Date.now() }
    const players = writeCell(state.players, playerIndex, category, cell)
    const allDone = players.every((p) => isPlayerDone(p.scores))
    setState({ ...state, players, isGameOver: allDone, moveLog: insertMove(state.moveLog, entry, slot) })
    // Rewrite the corrected move in any snapshot that already recorded it, so undoing
    // a later move doesn't resurrect the old (pre-correction) value.
    if (slot) {
      setHistory((h) => h.map((snap) => patchSnapshot(snap, slot.id, playerIndex, category, cell, entry)))
    }
    setPendingCorrection(null)
  }

  // Remove a logged move and revert its cell to empty (starts a correction, Task 18).
  // The pre-removal state goes into the pending-correction buffer (not `history`)
  // so it can be restored on cancel without ever appearing on the undo stack.
  function removeMove(moveId: string) {
    const entry = state.moveLog.find((m) => m.id === moveId)
    if (!entry) return
    const players = writeCell(state.players, entry.playerIndex, entry.category, { status: 'empty' })
    setPendingCorrection(state)
    setState({ ...state, players, isGameOver: false, moveLog: state.moveLog.filter((m) => m.id !== moveId) })
  }

  // Cancel an in-progress correction: restore the state captured by removeMove
  // (original cell value + log entry) and clear the buffer. No-op if none pending.
  function revertCorrection() {
    if (pendingCorrection) setState(pendingCorrection)
    setPendingCorrection(null)
  }

  function writeCell(
    players: Player[],
    playerIndex: number,
    category: ScorableCategory,
    cell: Player['scores'][ScorableCategory],
  ): Player[] {
    return players.map((p, i) =>
      i !== playerIndex ? p : { ...p, scores: { ...p.scores, [category]: cell } },
    )
  }

  // Apply a completed correction to one undo snapshot. Snapshots taken before the
  // corrected move don't contain it (found by id) and are returned untouched.
  // Those that do: clear the move's original cell, write the new cell, and swap the
  // log entry in place — so the snapshot reflects the correction as if it had always
  // been there. Filled-cell count is unchanged, so isGameOver need not be recomputed.
  function patchSnapshot(
    snap: GameState,
    oldMoveId: string,
    playerIndex: number,
    newCategory: ScorableCategory,
    newCell: CellState,
    newEntry: MoveEntry,
  ): GameState {
    const idx = snap.moveLog.findIndex((m) => m.id === oldMoveId)
    if (idx < 0) return snap
    const oldCategory = snap.moveLog[idx].category
    let players = writeCell(snap.players, playerIndex, oldCategory, { status: 'empty' })
    players = writeCell(players, playerIndex, newCategory, newCell)
    const moveLog = [...snap.moveLog.slice(0, idx), newEntry, ...snap.moveLog.slice(idx + 1)]
    return { ...snap, players, moveLog }
  }

  function advance(prev: GameState, players: Player[], entry: MoveEntry): GameState {
    const moveLog = [...prev.moveLog, entry]
    const allDone = players.every((p) => isPlayerDone(p.scores))
    if (allDone) {
      return { gameId: prev.gameId, players, currentPlayerIndex: prev.currentPlayerIndex, isGameOver: true, diceValues: null, moveLog }
    }
    const next = (prev.currentPlayerIndex + 1) % players.length
    return { gameId: prev.gameId, players, currentPlayerIndex: next, isGameOver: false, diceValues: null, moveLog }
  }

  function undo() {
    if (history.length === 0) return
    setState(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
  }

  function setDice(values: number[] | null) {
    setState((prev) => ({ ...prev, diceValues: values }))
  }

  function reset(names: string[]) {
    setHistory([])
    setState(makeInitial(names))
  }

  return { state, score, cross, correctScore, correctCross, removeMove, revertCorrection, undo, setDice, reset, canUndo: history.length > 0 }
}
