import { useState, useEffect } from 'react'
import type { Player, ScorableCategory } from '../types/game'
import { makeEmptyScores } from '../types/game'
import { isPlayerDone } from '../utils/scoring'

export interface GameState {
  players: Player[]
  currentPlayerIndex: number
  isGameOver: boolean
}

const GAME_KEY = 'knueffl-game'

function loadGameState(): { state: GameState; history: GameState[] } | null {
  try {
    const raw = localStorage.getItem(GAME_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearGameState() {
  try { localStorage.removeItem(GAME_KEY) } catch {}
}

export function useGameState(playerNames: string[]) {
  const initial: GameState = {
    players: playerNames.map((name) => ({ name, scores: makeEmptyScores() })),
    currentPlayerIndex: 0,
    isGameOver: false,
  }

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
    if (!saved) return initial
    const match =
      saved.state.players.length === playerNames.length &&
      saved.state.players.every((p, i) => p.name === playerNames[i])
    return match ? saved.state : initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(GAME_KEY, JSON.stringify({ state, history }))
    } catch {}
  }, [state, history])

  function score(playerIndex: number, category: ScorableCategory, value: number) {
    setState((prev) => {
      const players = prev.players.map((p, i) => {
        if (i !== playerIndex) return p
        return { ...p, scores: { ...p.scores, [category]: { status: 'scored' as const, value } } }
      })
      const next = advance(prev, players)
      setHistory((h) => [...h, prev])
      return next
    })
  }

  function cross(playerIndex: number, category: ScorableCategory) {
    setState((prev) => {
      const players = prev.players.map((p, i) => {
        if (i !== playerIndex) return p
        return { ...p, scores: { ...p.scores, [category]: { status: 'crossed' as const } } }
      })
      const next = advance(prev, players)
      setHistory((h) => [...h, prev])
      return next
    })
  }

  function advance(prev: GameState, players: Player[]): GameState {
    const allDone = players.every((p) => isPlayerDone(p.scores))
    if (allDone) {
      return { players, currentPlayerIndex: prev.currentPlayerIndex, isGameOver: true }
    }
    const next = (prev.currentPlayerIndex + 1) % players.length
    return { players, currentPlayerIndex: next, isGameOver: false }
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setState(prev)
      return h.slice(0, -1)
    })
  }

  function reset(names: string[]) {
    setHistory([])
    setState({
      players: names.map((name) => ({ name, scores: makeEmptyScores() })),
      currentPlayerIndex: 0,
      isGameOver: false,
    })
  }

  return { state, score, cross, undo, reset, canUndo: history.length > 0 }
}
