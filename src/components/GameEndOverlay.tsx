import type { Player } from '../types/game'
import { calcGrandTotal } from '../utils/scoring'
import { useTranslation } from '../hooks/useLanguage'

interface Props {
  players: Player[]
  onNewGame: () => void
  onClose: () => void
}

const PLAYER_COLORS = [
  'bg-indigo-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500',
]

export function GameEndOverlay({ players, onNewGame, onClose }: Props) {
  const { t } = useTranslation()

  const ranked = players
    .map((p, originalIndex) => ({ player: p, total: calcGrandTotal(p.scores), originalIndex }))
    .sort((a, b) => b.total - a.total)

  // Assign placements (ties share rank)
  let place = 1
  const withPlace = ranked.map((entry, i) => {
    if (i > 0 && entry.total < ranked[i - 1].total) {
      place = i + 1
    }
    return { ...entry, place }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6">
        {/* Header */}
        <div className="relative text-center mb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.gameOver}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.finalRankings}</p>
        </div>

        {/* Rankings */}
        <div className="space-y-2 mb-6">
          {withPlace.map(({ player, total, originalIndex, place }) => {
            const isFirst = place === 1
            const color = PLAYER_COLORS[originalIndex % PLAYER_COLORS.length]
            return (
              <div
                key={player.name}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isFirst
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-500'
                    : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600',
                ].join(' ')}
              >
                <span className={[
                  'text-base font-bold w-8 text-center',
                  isFirst ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400',
                ].join(' ')}>
                  {t.place(place)}
                </span>
                <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className={[
                  'flex-1 font-semibold text-sm',
                  isFirst ? 'text-amber-900 dark:text-amber-100' : 'text-slate-700 dark:text-slate-300',
                ].join(' ')}>
                  {player.name}
                  {isFirst && <span className="ml-1">👑</span>}
                </span>
                <span className={[
                  'text-sm font-bold tabular-nums',
                  isFirst ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400',
                ].join(' ')}>
                  {t.points(total)}
                </span>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onNewGame}
          className="w-full py-3 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-base shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
        >
          🎲 {t.newGame}
        </button>
      </div>
    </div>
  )
}
