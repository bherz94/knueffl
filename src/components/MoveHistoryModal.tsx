import type { MoveEntry } from '../types/game'
import { useTranslation } from '../hooks/useLanguage'
import { categoryLabel } from '../utils/labels'
import { PlayerAvatar } from './PlayerAvatar'

interface Props {
  playerName: string
  playerIndex: number
  avatar?: string
  moves: MoveEntry[]
  onSelectEntry: (moveId: string) => void
  onClose: () => void
}

export function MoveHistoryModal({ playerName, playerIndex, avatar, moves, onSelectEntry, onClose }: Props) {
  const { t } = useTranslation()
  // Newest first
  const ordered = [...moves].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-700 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-3 border-b border-slate-200 dark:border-zinc-700">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-zinc-100">
            <PlayerAvatar name={playerName} index={playerIndex} avatar={avatar} sizeClass="w-7 h-7" />
            <span className="min-w-0 truncate">{t.moveHistoryFor(playerName)}</span>
          </h2>
          {ordered.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t.tapEntryToCorrect}</p>
          )}
        </div>

        <div className="overflow-y-auto p-3 flex flex-col gap-2">
          {ordered.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500 text-center py-8">{t.noMoves}</p>
          ) : (
            ordered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectEntry(m.id)}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700/50 hover:border-secondary-400 dark:hover:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors text-left"
              >
                <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  {categoryLabel(t, m.category)}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {m.kind === 'crossed' ? (
                    <span className="text-slate-400 dark:text-zinc-500">✕</span>
                  ) : (
                    m.value
                  )}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-zinc-600 transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}
