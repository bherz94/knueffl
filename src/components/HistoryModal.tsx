import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../hooks/useLanguage'
import {
  loadHistory,
  aggregateStats,
  rankBy,
  clearHistory,
  seedDebugHistory,
  recordHasBoard,
  resolveAvatar,
  isProfileDeleted,
  type GameRecord,
  type LeaderboardMetric,
} from '../utils/gameHistory'
import { loadProfiles } from '../utils/profiles'
import { HistoryBoardModal } from './HistoryBoardModal'
import { PlayerAvatar } from './PlayerAvatar'

interface Props {
  onClose: () => void
}

type Tab = 'games' | 'leaderboard'

// Recent Games are revealed in batches so a large history opens instantly (Task 30).
const GAMES_PAGE = 30

const PLAYER_COLORS = [
  'bg-teal-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500',
]

// Stable color index per name so a player's fallback disc looks the same across
// cards. Matches the palette order used by <PlayerAvatar>.
function colorIndexForName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return Math.abs(hash) % PLAYER_COLORS.length
}

export function HistoryModal({ onClose }: Props) {
  const { t, language } = useTranslation()
  const [tab, setTab] = useState<Tab>('games')
  const [metric, setMetric] = useState<LeaderboardMetric>('bestGame')
  const [confirmClear, setConfirmClear] = useState(false)
  // Selected past game whose full scorecard is being viewed (Task 29).
  const [boardRecord, setBoardRecord] = useState<GameRecord | null>(null)
  // Snapshot once on open; a manual clear bumps this to re-read.
  const [nonce, setNonce] = useState(0)
  const records = useMemo<GameRecord[]>(() => loadHistory(), [nonce])
  // Preloaded once so avatar resolution across many rows never re-reads storage.
  const profilesMap = useMemo(() => new Map(loadProfiles().map((p) => [p.id, p])), [nonce])
  // Ids of profiles that still exist — for flagging deleted-profile results (Task 44).
  const existingIds = useMemo(() => new Set(profilesMap.keys()), [profilesMap])
  // How many game cards are currently rendered (Task 30). Reset on re-read.
  const [visibleCount, setVisibleCount] = useState(GAMES_PAGE)
  useEffect(() => setVisibleCount(GAMES_PAGE), [nonce])

  // Lock background scrolling while this modal is open (restored on close/unmount).
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const games = useMemo(() => [...records].sort((a, b) => b.finishedAt - a.finishedAt), [records])
  const visibleGames = useMemo(() => games.slice(0, visibleCount), [games, visibleCount])
  const ranked = useMemo(() => rankBy(aggregateStats(records), metric), [records, metric])
  // For the Best-game metric, look up each player's winning game to open it (Task 34).
  const recordsById = useMemo(() => new Map(records.map((r) => [r.id, r])), [records])

  const locale = language === 'de' ? 'de-DE' : 'en-GB'
  // One formatter instance per locale, reused across all cards (Task 31).
  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  )
  const fmtDate = (ms: number) => dateFmt.format(ms)

  const metricValue = (s: { bestGame: number; wins: number; avgScore: number }) =>
    metric === 'bestGame' ? s.bestGame : metric === 'wins' ? s.wins : s.avgScore

  function handleClear() {
    clearHistory()
    setNonce((n) => n + 1)
    setConfirmClear(false)
  }

  const metricTabs: { key: LeaderboardMetric; label: string }[] = [
    { key: 'bestGame', label: t.statBestGame },
    { key: 'wins', label: t.statWins },
    { key: 'avgScore', label: t.statAvg },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-700 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors text-sm"
            aria-label={t.cancel}
          >
            ✕
          </button>
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">🏆</div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{t.historyTitle}</h2>
          </div>

          {/* Top tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-700/60">
            {(['games', 'leaderboard'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={[
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition',
                  tab === key
                    ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-500 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200',
                ].join(' ')}
              >
                {key === 'games' ? t.recentGames : t.leaderboard}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-4 pb-2 flex flex-col gap-3">
          {records.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500 text-center py-10">{t.noGamesYet}</p>
          ) : tab === 'games' ? (
            <>
            {visibleGames.map((g) => {
              // Only games with a stored scorecard (lazy blob or legacy inline) open a board.
              const hasBoard = recordHasBoard(g)
              return (
              <button
                key={g.id}
                type="button"
                disabled={!hasBoard}
                onClick={() => hasBoard && setBoardRecord(g)}
                title={hasBoard ? t.viewGameBoard : undefined}
                className={[
                  'w-full text-left rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/40 p-3 transition-colors',
                  hasBoard ? 'hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer' : 'cursor-default',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                    {fmtDate(g.finishedAt)}
                  </span>
                  {hasBoard && <span className="text-slate-300 dark:text-zinc-500 text-sm">›</span>}
                </div>
                <div className="flex flex-col gap-1">
                  {g.results.map((r, i) => {
                    const isFirst = r.place === 1
                    // A deleted profile renders as the "Deleted" label with the colored-initial fallback.
                    const deleted = isProfileDeleted(r.profileId, existingIds)
                    const displayName = deleted ? t.deletedProfile : r.name
                    return (
                      <div
                        key={`${r.name}-${i}`}
                        className={[
                          'flex items-center gap-2 px-2 py-1.5 rounded-lg',
                          isFirst ? 'bg-amber-50 dark:bg-amber-900/20' : '',
                        ].join(' ')}
                      >
                        <span className={[
                          'text-xs font-bold w-6 text-center',
                          isFirst ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-500',
                        ].join(' ')}>
                          {t.place(r.place)}
                        </span>
                        <PlayerAvatar
                          name={displayName}
                          index={colorIndexForName(displayName)}
                          avatar={deleted ? undefined : resolveAvatar(r.profileId, r.avatar, profilesMap)}
                          sizeClass="w-6 h-6"
                          textClass="text-[10px]"
                        />
                        <span className={[
                          'flex-1 text-sm font-medium truncate',
                          deleted ? 'italic text-slate-400 dark:text-zinc-500' : 'text-slate-700 dark:text-zinc-200',
                        ].join(' ')}>
                          {displayName}{isFirst && ' 👑'}
                        </span>
                        <span className="text-sm font-bold tabular-nums text-slate-600 dark:text-zinc-300">
                          {t.points(r.total)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </button>
              )
            })}
            {visibleCount < games.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + GAMES_PAGE)}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 text-slate-600 dark:text-zinc-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
              >
                {t.showMore(games.length - visibleCount)}
              </button>
            )}
            </>
          ) : (
            <>
              {/* Metric sub-tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-700/60">
                {metricTabs.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMetric(key)}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-xs font-semibold transition',
                      metric === key
                        ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-500 shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {ranked.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500 text-center py-8">{t.noGamesYet}</p>
              ) : (
                ranked.map((s, i) => {
                  const rank = i + 1
                  const value = metricValue(s)
                  // On the Best-game metric each row points at one specific game;
                  // make it clickable when that game still has a viewable board (Task 34).
                  const bestRecord =
                    metric === 'bestGame' && s.bestGameId ? recordsById.get(s.bestGameId) : undefined
                  const openable = !!bestRecord && recordHasBoard(bestRecord)
                  return (
                    <button
                      key={s.key}
                      type="button"
                      disabled={!openable}
                      onClick={() => openable && setBoardRecord(bestRecord!)}
                      title={openable ? t.viewGameBoard : undefined}
                      className={[
                        'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors',
                        rank === 1
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-500/50'
                          : 'bg-slate-50 dark:bg-zinc-700/40 border-slate-200 dark:border-zinc-600',
                        openable
                          ? rank === 1
                            ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer'
                            : 'hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer'
                          : 'cursor-default',
                      ].join(' ')}
                    >
                      <span className={[
                        'text-sm font-bold w-6 text-center',
                        rank === 1 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-500',
                      ].join(' ')}>
                        {rank}
                      </span>
                      <PlayerAvatar
                        name={s.name}
                        index={colorIndexForName(s.name)}
                        avatar={resolveAvatar(s.profileId, s.avatar, profilesMap)}
                        sizeClass="w-8 h-8"
                        textClass="text-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-700 dark:text-zinc-200 truncate">{s.name}</div>
                        <div className="text-xs text-slate-400 dark:text-zinc-500">{t.gamesPlayedCount(s.gamesPlayed)}</div>
                      </div>
                      <span className="text-base font-bold tabular-nums text-slate-800 dark:text-zinc-100">
                        {metric === 'wins' ? value : t.points(value)}
                      </span>
                      {openable && <span className="text-slate-300 dark:text-zinc-500 text-sm">›</span>}
                    </button>
                  )
                })
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 pt-3 flex flex-col gap-2">
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                seedDebugHistory()
                setNonce((n) => n + 1)
              }}
              className="w-full py-2 rounded-xl border border-dashed border-amber-400 dark:border-amber-500/60 text-amber-600 dark:text-amber-400 font-medium text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              🐞 Seed 10 debug games (2–6 players)
            </button>
          )}
          {records.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-zinc-600 text-slate-500 dark:text-zinc-400 font-medium text-xs hover:bg-slate-50 dark:hover:bg-zinc-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              {t.clearHistory}
            </button>
          )}
        </div>

        {/* Full-scorecard view of a selected past game (Task 29) */}
        {boardRecord && (
          <HistoryBoardModal record={boardRecord} onClose={() => setBoardRecord(null)} />
        )}

        {/* Clear-history confirmation */}
        {confirmClear && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
            onClick={() => setConfirmClear(false)}
          >
            <div
              className="w-full max-w-xs bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-700 p-6 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🗑️</div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{t.clearHistoryTitle}</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{t.clearHistoryConfirm}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-zinc-600 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
                >
                  {t.clearHistory}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
