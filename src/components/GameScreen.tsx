import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import type { CategoryMeta, ScorableCategory } from '../types/game'
import { useGameState } from '../hooks/useGameState'
import type { MoveSlot } from '../hooks/useGameState'
import { useTranslation } from '../hooks/useLanguage'
import { calcGrandTotal } from '../utils/scoring'
import { getDiceAutoScore } from '../utils/dice'
import { recordGame, removeRecord } from '../utils/gameHistory'
import { Scoreboard } from './Scoreboard'
import { UpperInputPopup } from './UpperInputPopup'
import { FreeInputPopup } from './FreeInputPopup'
import { GameEndOverlay } from './GameEndOverlay'
import { DiceModal } from './DiceModal'
import { MoveHistoryModal } from './MoveHistoryModal'

interface Props {
  playerNames: string[]
  virtualDice: boolean
  onNewGame: () => void
  onCancel: () => void
}

type ActivePopup =
  | { kind: 'upper'; playerIndex: number; meta: CategoryMeta }
  | { kind: 'free'; playerIndex: number; meta: CategoryMeta }
  | null

const UPPER_ID_TO_INDEX: Record<string, number> = {
  ones: 0, twos: 1, threes: 2, fours: 3, fives: 4, sixes: 5,
}

function popupCellKey(popup: ActivePopup): string | null {
  if (!popup) return null
  return `${popup.playerIndex}-${popup.meta.id}`
}

function calcPlacements(players: { name: string; scores: Parameters<typeof calcGrandTotal>[0] }[]): Record<number, number> {
  const ranked = players
    .map((p, i) => ({ i, total: calcGrandTotal(p.scores) }))
    .sort((a, b) => b.total - a.total)
  let place = 1
  const result: Record<number, number> = {}
  ranked.forEach((entry, idx) => {
    if (idx > 0 && entry.total < ranked[idx - 1].total) place = idx + 1
    result[entry.i] = place
  })
  return result
}

export function GameScreen({ playerNames, virtualDice, onNewGame, onCancel }: Props) {
  const { t } = useTranslation()
  const { state, score, cross, correctScore, correctCross, removeMove, revertCorrection, undo, setDice, canUndo } = useGameState(playerNames)
  const [popup, setPopup] = useState<ActivePopup>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(state.isGameOver)
  const [diceModalOpen, setDiceModalOpen] = useState(false)
  // Task 18: move-history modal + correction mode (virtual dice OFF only)
  const [historyPlayer, setHistoryPlayer] = useState<number | null>(null)
  const [correctingPlayerIndex, setCorrectingPlayerIndex] = useState<number | null>(null)
  // Original position/timestamp of the move being corrected, so its replacement
  // stays in place in the history instead of jumping to the end.
  const [correctionSlot, setCorrectionSlot] = useState<MoveSlot | null>(null)
  // Task 19: preserve scroll position of the main table across scoring
  const scrollRef = useRef<HTMLDivElement>(null)
  const pendingScrollTop = useRef<number | null>(null)

  function saveScroll() {
    pendingScrollTop.current = scrollRef.current?.scrollTop ?? null
  }

  useLayoutEffect(() => {
    if (pendingScrollTop.current != null && scrollRef.current) {
      scrollRef.current.scrollTop = pendingScrollTop.current
    }
    pendingScrollTop.current = null
  })

  // diceValues lives in game state so undo restores them automatically
  const diceValues = state.diceValues

  useEffect(() => {
    if (state.isGameOver) {
      setOverlayOpen(true)
      const placement = calcPlacements(state.players)
      recordGame({
        id: state.gameId,
        finishedAt: Date.now(),
        virtualDice,
        results: state.players
          .map((p, i) => ({ name: p.name, total: calcGrandTotal(p.scores), place: placement[i], scores: p.scores }))
          .sort((a, b) => a.place - b.place),
      })
    } else {
      // Game un-finished via undo — drop the record we may have written.
      removeRecord(state.gameId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isGameOver])

  // Auto-open dice modal on mount when no dice have been rolled yet
  useEffect(() => {
    if (virtualDice && !state.isGameOver && diceValues === null) setDiceModalOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When player index changes, open dice modal only if no dice were restored by undo
  const prevPlayerIndex = useRef(state.currentPlayerIndex)
  useEffect(() => {
    if (prevPlayerIndex.current === state.currentPlayerIndex) return
    prevPlayerIndex.current = state.currentPlayerIndex
    if (virtualDice && !state.isGameOver && state.diceValues === null) setDiceModalOpen(true)
  })

  const placements = state.isGameOver ? calcPlacements(state.players) : undefined

  // A correction writes the cell without advancing the turn (Task 18).
  function commitScore(playerIndex: number, category: ScorableCategory, value: number) {
    saveScroll()
    if (correctingPlayerIndex != null) {
      correctScore(playerIndex, category, value, correctionSlot ?? undefined)
      setCorrectingPlayerIndex(null)
      setCorrectionSlot(null)
    } else {
      score(playerIndex, category, value)
    }
  }

  function handleCellClick(playerIndex: number, meta: CategoryMeta) {
    if (diceValues) {
      const autoScore = getDiceAutoScore(diceValues, meta.id as ScorableCategory)
      if (autoScore !== null) {
        saveScroll()
        score(playerIndex, meta.id as ScorableCategory, autoScore)
      }
      // null = combination invalid with these dice → do nothing
      return
    }
    if (meta.inputKind === 'upper') {
      setPopup({ kind: 'upper', playerIndex, meta })
    } else if (meta.inputKind === 'fixed') {
      commitScore(playerIndex, meta.id as ScorableCategory, meta.fixedScore!)
    } else {
      setPopup({ kind: 'free', playerIndex, meta })
    }
  }

  function handleCross(playerIndex: number, category: ScorableCategory) {
    saveScroll()
    if (correctingPlayerIndex != null) {
      correctCross(playerIndex, category, correctionSlot ?? undefined)
      setCorrectingPlayerIndex(null)
      setCorrectionSlot(null)
    } else {
      cross(playerIndex, category)
    }
  }

  function closePopup() {
    setPopup(null)
  }

  function handleUpperConfirm(value: number) {
    if (!popup) return
    commitScore(popup.playerIndex, popup.meta.id as ScorableCategory, value)
    closePopup()
  }

  function handleFreeConfirm(value: number) {
    if (!popup) return
    commitScore(popup.playerIndex, popup.meta.id as ScorableCategory, value)
    closePopup()
  }

  // Cancelling a correction reverts the removeMove that started it (Task 18/22),
  // so the original move isn't lost. removeMove buffered the pre-removal state off
  // the main undo stack; revertCorrection restores the cell + log entry from it.
  function cancelCorrection() {
    revertCorrection()
    setCorrectingPlayerIndex(null)
    setCorrectionSlot(null)
  }

  function handleHistorySelect(moveId: string) {
    const player = historyPlayer
    const index = state.moveLog.findIndex((m) => m.id === moveId)
    const original = index >= 0 ? state.moveLog[index] : null
    removeMove(moveId)
    setHistoryPlayer(null)
    setCorrectingPlayerIndex(player)
    setCorrectionSlot(original ? { id: original.id, index, timestamp: original.timestamp } : null)
  }

  function handleDiceFinish(values: number[]) {
    setDice(values)
    setDiceModalOpen(false)
  }

  const currentPlayer = state.players[state.currentPlayerIndex]

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Turn indicator */}
      {(!state.isGameOver || !overlayOpen) && (
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white flex items-center justify-between py-2 px-4 gap-3">
          {/* Left button */}
          {state.isGameOver ? (
            <button
              type="button"
              onClick={onNewGame}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              🎲 {t.newGame}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              ✕ {t.cancelGame}
            </button>
          )}

          {/* Center */}
          <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
            {state.isGameOver ? (
              <span className="text-sm font-semibold">🏆 {t.gameOver}</span>
            ) : virtualDice ? (
              <button
                type="button"
                onClick={() => setDiceModalOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                🎲 {currentPlayer.name}
              </button>
            ) : (
              <span className="text-sm font-semibold text-center">
                🎲 {t.currentTurn(currentPlayer.name)}
                <span className="ml-2 text-indigo-200 text-xs hidden sm:inline">{t.crossOutHint}</span>
              </span>
            )}
          </div>

          {/* Right: undo */}
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo || correctingPlayerIndex != null}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
          >
            ↩ {t.undo}
          </button>
        </div>
      )}

      {/* Correction banner (Task 18) */}
      {correctingPlayerIndex != null && (
        <div className="bg-amber-500 dark:bg-amber-600 text-white flex items-center justify-between py-2 px-4 gap-3">
          <span className="text-sm font-semibold min-w-0">
            ✏️ {t.correctionBanner(state.players[correctingPlayerIndex]?.name ?? '')}
            <span className="ml-2 text-amber-100 text-xs hidden sm:inline">{t.correctionHint}</span>
          </span>
          <button
            type="button"
            onClick={cancelCorrection}
            className="flex-shrink-0 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors"
          >
            ✕ {t.cancelCorrection}
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-auto p-2">
        <Scoreboard
          players={state.players}
          currentPlayerIndex={state.currentPlayerIndex}
          activeCellKey={popupCellKey(popup)}
          onCellClick={handleCellClick}
          onCross={handleCross}
          isGameOver={state.isGameOver}
          placements={placements}
          diceValues={diceValues}
          onHeaderClick={!virtualDice ? (i) => setHistoryPlayer(i) : undefined}
          correctingPlayerIndex={correctingPlayerIndex}
        />
      </div>

      {/* Popups */}
      {popup?.kind === 'upper' && (
        <UpperInputPopup
          dieIndex={UPPER_ID_TO_INDEX[popup.meta.id] ?? 0}
          onConfirm={handleUpperConfirm}
          onCancel={closePopup}
        />
      )}
      {popup?.kind === 'free' && (
        <FreeInputPopup
          onConfirm={handleFreeConfirm}
          onCancel={closePopup}
        />
      )}

      {/* Game over overlay */}
      {state.isGameOver && overlayOpen && (
        <GameEndOverlay
          players={state.players}
          onNewGame={onNewGame}
          onClose={() => setOverlayOpen(false)}
        />
      )}

      {/* Floating dice result pill — fixed bottom-center, always visible while scrolling */}
      {diceValues && !state.isGameOver && !diceModalOpen && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-indigo-700 dark:bg-indigo-800 rounded-full px-3 py-1.5 shadow-xl">
          {diceValues.map((v, i) => (
            <span
              key={i}
              className="w-8 h-8 rounded-lg bg-white text-slate-800 text-sm font-bold flex items-center justify-center"
            >
              {v}
            </span>
          ))}
        </div>
      )}

      {/* Dice modal */}
      {diceModalOpen && (
        <DiceModal
          onFinish={handleDiceFinish}
          onClose={() => setDiceModalOpen(false)}
        />
      )}

      {/* Move-history modal (Task 18) */}
      {historyPlayer != null && (
        <MoveHistoryModal
          playerName={state.players[historyPlayer]?.name ?? ''}
          moves={state.moveLog.filter((m) => m.playerIndex === historyPlayer)}
          onSelectEntry={handleHistorySelect}
          onClose={() => setHistoryPlayer(null)}
        />
      )}

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.cancelConfirmTitle}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.cancelConfirmMessage}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                {t.cancelConfirmNo}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
              >
                {t.cancelConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
