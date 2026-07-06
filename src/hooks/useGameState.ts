import { useState, useEffect } from 'react'
import type { Player, ScorableCategory, MoveEntry } from '../types/game'
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

// Identifies where a corrected move originally sat, so its replacement keeps the same
// spot in the log (index) and ordering (timestamp) instead of being appended.
export interface MoveSlot {
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

  function score(playerIndex: number, category: ScorableCategory, value: number) {
    setState((prev) => {
      const players = writeCell(prev.players, playerIndex, category, { status: 'scored', value })
      const entry: MoveEntry = { id: makeMoveId(), playerIndex, category, kind: 'scored', value, timestamp: Date.now() }
      const next = advance(prev, players, entry)
      setHistory((h) => [...h, prev])
      return next
    })
  }

  function cross(playerIndex: number, category: ScorableCategory) {
    setState((prev) => {
      const players = writeCell(prev.players, playerIndex, category, { status: 'crossed' })
      const entry: MoveEntry = { id: makeMoveId(), playerIndex, category, kind: 'crossed', timestamp: Date.now() }
      const next = advance(prev, players, entry)
      setHistory((h) => [...h, prev])
      return next
    })
  }

  // Correction: write a cell for a player WITHOUT advancing the turn (Task 18).
  // `slot` (from the move being corrected) preserves the entry's original position
  // and timestamp so the correction replaces it in place instead of jumping to the end.
  function correctScore(playerIndex: number, category: ScorableCategory, value: number, slot?: MoveSlot) {
    setState((prev) => {
      const players = writeCell(prev.players, playerIndex, category, { status: 'scored', value })
      const entry: MoveEntry = { id: makeMoveId(), playerIndex, category, kind: 'scored', value, timestamp: slot?.timestamp ?? Date.now() }
      const allDone = players.every((p) => isPlayerDone(p.scores))
      setHistory((h) => [...h, prev])
      return { ...prev, players, isGameOver: allDone, moveLog: insertMove(prev.moveLog, entry, slot) }
    })
  }

  function correctCross(playerIndex: number, category: ScorableCategory, slot?: MoveSlot) {
    setState((prev) => {
      const players = writeCell(prev.players, playerIndex, category, { status: 'crossed' })
      const entry: MoveEntry = { id: makeMoveId(), playerIndex, category, kind: 'crossed', timestamp: slot?.timestamp ?? Date.now() }
      const allDone = players.every((p) => isPlayerDone(p.scores))
      setHistory((h) => [...h, prev])
      return { ...prev, players, isGameOver: allDone, moveLog: insertMove(prev.moveLog, entry, slot) }
    })
  }

  // Remove a logged move and revert its cell to empty (starts a correction, Task 18).
  function removeMove(moveId: string) {
    setState((prev) => {
      const entry = prev.moveLog.find((m) => m.id === moveId)
      if (!entry) return prev
      const players = writeCell(prev.players, entry.playerIndex, entry.category, { status: 'empty' })
      setHistory((h) => [...h, prev])
      return {
        ...prev,
        players,
        isGameOver: false,
        moveLog: prev.moveLog.filter((m) => m.id !== moveId),
      }
    })
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
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setState(prev)
      return h.slice(0, -1)
    })
  }

  function setDice(values: number[] | null) {
    setState((prev) => ({ ...prev, diceValues: values }))
  }

  function reset(names: string[]) {
    setHistory([])
    setState(makeInitial(names))
  }

  return { state, score, cross, correctScore, correctCross, removeMove, undo, setDice, reset, canUndo: history.length > 0 }
}
