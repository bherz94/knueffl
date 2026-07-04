import { useState, useEffect } from 'react'
import type { CategoryMeta, ScorableCategory } from '../types/game'
import { useGameState } from '../hooks/useGameState'
import { useTranslation } from '../hooks/useLanguage'
import { calcGrandTotal } from '../utils/scoring'
import { Scoreboard } from './Scoreboard'
import { UpperInputPopup } from './UpperInputPopup'
import { FreeInputPopup } from './FreeInputPopup'
import { GameEndOverlay } from './GameEndOverlay'

interface Props {
  playerNames: string[]
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

export function GameScreen({ playerNames, onNewGame, onCancel }: Props) {
  const { t } = useTranslation()
  const { state, score, cross, undo, canUndo } = useGameState(playerNames)
  const [popup, setPopup] = useState<ActivePopup>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(state.isGameOver)

  useEffect(() => {
    if (state.isGameOver) setOverlayOpen(true)
  }, [state.isGameOver])

  const placements = state.isGameOver ? calcPlacements(state.players) : undefined

  function handleCellClick(playerIndex: number, meta: CategoryMeta) {
    if (meta.inputKind === 'upper') {
      setPopup({ kind: 'upper', playerIndex, meta })
    } else if (meta.inputKind === 'fixed') {
      score(playerIndex, meta.id as ScorableCategory, meta.fixedScore!)
    } else {
      setPopup({ kind: 'free', playerIndex, meta })
    }
  }

  function handleCross(playerIndex: number, category: ScorableCategory) {
    cross(playerIndex, category)
  }

  function closePopup() {
    setPopup(null)
  }

  function handleUpperConfirm(value: number) {
    if (!popup) return
    score(popup.playerIndex, popup.meta.id as ScorableCategory, value)
    closePopup()
  }

  function handleFreeConfirm(value: number) {
    if (!popup) return
    score(popup.playerIndex, popup.meta.id as ScorableCategory, value)
    closePopup()
  }

  const currentPlayer = state.players[state.currentPlayerIndex]

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Turn indicator — shown during play and when reviewing scores after game ends */}
      {(!state.isGameOver || !overlayOpen) && (
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white flex items-center justify-between py-2 px-4 gap-3">
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
          <span className="text-sm font-semibold flex-1 text-center">
            {state.isGameOver
              ? `🏆 ${t.gameOver}`
              : <>🎲 {t.currentTurn(currentPlayer.name)}<span className="ml-2 text-indigo-200 text-xs hidden sm:inline">{t.crossOutHint}</span></>
            }
          </span>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
          >
            ↩ {t.undo}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-2">
        <Scoreboard
          players={state.players}
          currentPlayerIndex={state.currentPlayerIndex}
          activeCellKey={popupCellKey(popup)}
          onCellClick={handleCellClick}
          onCross={handleCross}
          isGameOver={state.isGameOver}
          placements={placements}
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
