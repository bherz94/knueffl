import type { Player } from '../types/game'
import { calcGrandTotal } from '../utils/scoring'
import { resolveAvatar } from '../utils/gameHistory'
import { useTranslation } from '../hooks/useLanguage'
import { PlayerAvatar } from './PlayerAvatar'

interface Props {
  players: Player[]
  onNewGame: () => void
  onChangeSetup: () => void
  onClose: () => void
}

export function GameEndOverlay({ players, onNewGame, onChangeSetup, onClose }: Props) {
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
      <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-700 w-full max-w-sm p-6">
        {/* Header */}
        <div className="relative text-center mb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors text-sm"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{t.gameOver}</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">{t.finalRankings}</p>
        </div>

        {/* Rankings */}
        <div className="space-y-2 mb-6">
          {withPlace.map(({ player, total, originalIndex, place }) => {
            const isFirst = place === 1
            return (
              <div
                key={player.name}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isFirst
                    ? 'bg-secondary-50 dark:bg-secondary-900/20 border-2 border-secondary-400 dark:border-secondary-500'
                    : 'bg-slate-50 dark:bg-zinc-700/50 border border-slate-200 dark:border-zinc-600',
                ].join(' ')}
              >
                <span className={[
                  'text-base font-bold w-8 text-center',
                  isFirst ? 'text-secondary-600 dark:text-secondary-400' : 'text-slate-500 dark:text-zinc-400',
                ].join(' ')}>
                  {t.place(place)}
                </span>
                <PlayerAvatar
                  name={player.name}
                  index={originalIndex}
                  avatar={resolveAvatar(player.profileId, player.avatar)}
                  sizeClass="w-8 h-8"
                  textClass="text-xs"
                />
                <span className={[
                  'flex-1 font-semibold text-sm',
                  isFirst ? 'text-secondary-900 dark:text-secondary-100' : 'text-slate-700 dark:text-zinc-300',
                ].join(' ')}>
                  {player.name}
                  {isFirst && <span className="ml-1">👑</span>}
                </span>
                <span className={[
                  'text-sm font-bold tabular-nums',
                  isFirst ? 'text-secondary-700 dark:text-secondary-300' : 'text-slate-600 dark:text-zinc-400',
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
          className="w-full py-3 rounded-xl bg-primary-600 dark:bg-primary-600 text-white font-semibold text-base shadow-md hover:bg-primary-700 dark:hover:bg-primary-700 transition-all"
        >
          🎲 {t.newGame}
        </button>
        <button
          type="button"
          onClick={onChangeSetup}
          className="w-full mt-3 py-3 rounded-xl bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-base hover:bg-slate-200 dark:hover:bg-zinc-600 transition-all"
        >
          ⚙️ {t.changeSetup}
        </button>
      </div>
    </div>
  )
}
