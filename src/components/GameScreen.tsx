import { useState } from 'react'
import type { CategoryMeta, ScorableCategory } from '../types/game'
import { useGameState } from '../hooks/useGameState'
import { useTranslation } from '../hooks/useLanguage'
import { Scoreboard } from './Scoreboard'
import { UpperInputPopup } from './UpperInputPopup'
import { FreeInputPopup } from './FreeInputPopup'
import { GameEndOverlay } from './GameEndOverlay'

interface Props {
  playerNames: string[]
  onNewGame: () => void
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

export function GameScreen({ playerNames, onNewGame }: Props) {
  const { t } = useTranslation()
  const { state, score, cross, undo, canUndo } = useGameState(playerNames)
  const [popup, setPopup] = useState<ActivePopup>(null)

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
      {/* Turn indicator */}
      {!state.isGameOver && (
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white flex items-center justify-between py-2 px-4 gap-3">
          <span className="text-sm font-semibold flex-1 text-center">
            🎲 {t.currentTurn(currentPlayer.name)}
            <span className="ml-2 text-indigo-200 text-xs hidden sm:inline">{t.crossOutHint}</span>
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

      {/* Game over */}
      {state.isGameOver && (
        <GameEndOverlay players={state.players} onNewGame={onNewGame} />
      )}
    </div>
  )
}
