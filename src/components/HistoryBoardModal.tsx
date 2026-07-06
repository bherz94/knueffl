import { useEffect, useMemo } from 'react'
import { useTranslation } from '../hooks/useLanguage'
import type { Player } from '../types/game'
import { getGameBoard, type GameRecord } from '../utils/gameHistory'
import { Scoreboard } from './Scoreboard'

interface Props {
  record: GameRecord
  onClose: () => void
}

// Read-only view of a finished game's full scorecard (Task 29). It reuses the
// live Scoreboard, but with currentPlayerIndex = -1 and no-op handlers so no
// cell is active/interactive — you can only look, not edit. Players are shown
// in finishing order (winner first) with their placement medals.
export function HistoryBoardModal({ record, onClose }: Props) {
  const { t, language } = useTranslation()

  // Lock background scrolling while open (restored on close/unmount).
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Scorecards are loaded lazily from the per-game blob only now, on open (Task 33).
  const players = useMemo<Player[]>(() => {
    const boards = getGameBoard(record)
    if (!boards) return []
    return record.results.map((r, i) => ({ name: r.name, scores: boards[i] }))
  }, [record])
  const placements = useMemo<Record<number, number>>(() => {
    const map: Record<number, number> = {}
    record.results.forEach((r, i) => { map[i] = r.place })
    return map
  }, [record])

  const locale = language === 'de' ? 'de-DE' : 'en-GB'
  const dateLabel = new Date(record.finishedAt).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 pb-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
            aria-label={t.cancel}
          >
            ✕
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.gameBoardTitle}</h2>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{dateLabel}</div>
          </div>
        </div>

        {/* Body — the read-only scorecard */}
        <div className="overflow-auto px-2 pb-4">
          <Scoreboard
            players={players}
            currentPlayerIndex={-1}
            activeCellKey={null}
            onCellClick={() => {}}
            onCross={() => {}}
            isGameOver
            placements={placements}
          />
        </div>
      </div>
    </div>
  )
}
