import { useState } from 'react'
import { useTranslation } from '../hooks/useLanguage'

interface Props {
  onStart: (players: string[]) => void
  initialNames?: string[]
}

const MIN_PLAYERS = 2
const MAX_PLAYERS = 6

export function SetupScreen({ onStart, initialNames }: Props) {
  const { t } = useTranslation()
  const [count, setCount] = useState(initialNames?.length ?? 2)
  const [names, setNames] = useState<string[]>(initialNames ?? ['', ''])

  function setPlayerCount(n: number) {
    const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, n))
    setCount(clamped)
    setNames((prev) => {
      const next = [...prev]
      while (next.length < clamped) next.push('')
      return next.slice(0, clamped)
    })
  }

  function setName(i: number, value: string) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value.slice(0, 20) : n)))
  }

  const allFilled = names.every((n) => n.trim().length > 0)

  function handleStart() {
    if (!allFilled) return
    onStart(names.map((n) => n.trim()))
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-1">
          🎲 {t.appTitle}
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm">
          {t.setupSubtitle}
        </p>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">

          {/* Player count */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t.playerCount}
            </p>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPlayerCount(count - 1)}
                disabled={count <= MIN_PLAYERS}
                className="w-10 h-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
                aria-label={t.removePlayer}
              >
                −
              </button>

              <div className="flex gap-2 justify-center flex-1">
                {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPlayerCount(n)}
                    className={[
                      'w-9 h-9 rounded-full text-sm font-semibold transition-all',
                      n === count
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md scale-110'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
                    ].join(' ')}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPlayerCount(count + 1)}
                disabled={count >= MAX_PLAYERS}
                className="w-10 h-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
                aria-label={t.addPlayer}
              >
                +
              </button>
            </div>
          </div>

          {/* Player name inputs — single column, always */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t.playerName}
            </p>
            <div className="flex flex-col gap-2">
              {names.map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 flex-shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(i, e.target.value)}
                    placeholder={t.playerNamePlaceholder(i + 1)}
                    maxLength={20}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            type="button"
            onClick={handleStart}
            disabled={!allFilled}
            className="w-full py-3 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-base shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {t.startGame}
          </button>
        </div>
      </div>
    </div>
  )
}
