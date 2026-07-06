import { useState } from 'react'
import type { PlayerSetup, Profile } from '../types/profile'
import { useTranslation } from '../hooks/useLanguage'
import { ProfilePickerModal } from './ProfilePickerModal'

interface Props {
  onStart: (players: PlayerSetup[], virtualDice: boolean) => void
  initialPlayers?: PlayerSetup[]
  initialVirtualDice?: boolean
}

const MIN_PLAYERS = 2
const MAX_PLAYERS = 6

const emptySlot = (): PlayerSetup => ({ name: '' })

export function SetupScreen({ onStart, initialPlayers, initialVirtualDice }: Props) {
  const { t } = useTranslation()
  const [count, setCount] = useState(initialPlayers?.length ?? 2)
  const [players, setPlayers] = useState<PlayerSetup[]>(
    initialPlayers && initialPlayers.length > 0 ? initialPlayers : [emptySlot(), emptySlot()],
  )
  const [virtualDice, setVirtualDice] = useState(initialVirtualDice ?? false)
  // Slot index whose profile picker is open, or null.
  const [pickerSlot, setPickerSlot] = useState<number | null>(null)

  function setPlayerCount(n: number) {
    const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, n))
    setCount(clamped)
    setPlayers((prev) => {
      const next = [...prev]
      while (next.length < clamped) next.push(emptySlot())
      return next.slice(0, clamped)
    })
  }

  function assignProfile(i: number, profile: Profile) {
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === i ? { name: profile.name, profileId: profile.id, avatar: profile.avatar } : p)),
    )
    setPickerSlot(null)
  }

  function clearSlot(i: number) {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? emptySlot() : p)))
  }

  const allFilled = players.every((p) => p.name.trim().length > 0)

  function handleStart() {
    if (!allFilled) return
    onStart(
      players.map((p) => ({ ...p, name: p.name.trim() })),
      virtualDice,
    )
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

          {/* Player slots — tap to choose a profile */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t.playerName}
            </p>
            <div className="flex flex-col gap-2">
              {players.map((player, i) => {
                const filled = player.name.trim().length > 0
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-7 h-7 flex-shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickerSlot(i)}
                      className={[
                        'flex-1 min-w-0 flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition',
                        filled
                          ? 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'
                          : 'border-dashed border-slate-300 dark:border-slate-600 bg-transparent',
                      ].join(' ')}
                    >
                      {filled ? (
                        <>
                          {player.avatar ? (
                            <img src={player.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 uppercase">
                              {player.name.trim().slice(0, 2)}
                            </span>
                          )}
                          <span className="flex-1 min-w-0 truncate text-left font-semibold text-slate-900 dark:text-slate-100">
                            {player.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-500 text-slate-400 dark:text-slate-500 flex items-center justify-center flex-shrink-0">
                            +
                          </span>
                          <span className="flex-1 min-w-0 text-left text-slate-400 dark:text-slate-500">
                            {t.chooseProfile}
                          </span>
                        </>
                      )}
                    </button>
                    {filled && (
                      <button
                        type="button"
                        onClick={() => clearSlot(i)}
                        aria-label={t.removePlayer}
                        className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Virtual dice toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={virtualDice}
              onChange={(e) => setVirtualDice(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              🎲 {t.virtualDice}
            </span>
          </label>

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

      {pickerSlot != null && (
        <ProfilePickerModal
          onSelect={(profile) => assignProfile(pickerSlot, profile)}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </div>
  )
}
