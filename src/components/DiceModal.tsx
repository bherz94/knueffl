import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../hooks/useLanguage'

const MAX_THROWS = 3
const ANIM_MS = 800
const TICK_MS = 80

interface Props {
  onFinish: (values: number[]) => void
  onClose: () => void
}

function rand(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function DiceModal({ onFinish, onClose }: Props) {
  const { t } = useTranslation()
  const [values, setValues] = useState<number[]>([1, 1, 1, 1, 1])
  const [kept, setKept] = useState<boolean[]>([false, false, false, false, false])
  const [throwsUsed, setThrowsUsed] = useState(0)
  const [rolling, setRolling] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function rollDice() {
    if (rolling || throwsUsed >= MAX_THROWS) return
    const keptSnap = [...kept]
    const valSnap = [...values]
    const finalVals = valSnap.map((v, i) => keptSnap[i] ? v : rand())
    setRolling(true)
    const endTime = Date.now() + ANIM_MS
    function tick() {
      if (Date.now() >= endTime) {
        setValues(finalVals)
        setThrowsUsed(n => n + 1)
        setRolling(false)
      } else {
        setValues(curr => curr.map((v, i) => keptSnap[i] ? v : rand()))
        timerRef.current = setTimeout(tick, TICK_MS)
      }
    }
    timerRef.current = setTimeout(tick, TICK_MS)
  }

  function toggleKept(i: number) {
    if (throwsUsed === 0 || rolling || throwsUsed >= MAX_THROWS) return
    setKept(prev => prev.map((k, idx) => idx === i ? !k : k))
  }

  const hasRolled = throwsUsed > 0
  const isFinished = throwsUsed >= MAX_THROWS
  const canClose = !hasRolled && !rolling

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center"
      onClick={canClose ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            🎲 {t.rollDice}
          </h2>
          <div className="flex items-center gap-2">
            {hasRolled && (
              <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {t.throwNumber(throwsUsed, MAX_THROWS)}
              </span>
            )}
            {canClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Dice */}
        <div className="flex justify-center gap-2">
          {values.map((v, i) => {
            const isKept = kept[i]
            const isAnimating = rolling && !kept[i]
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleKept(i)}
                disabled={!hasRolled || rolling || isFinished}
                className={[
                  'w-14 h-14 rounded-xl text-2xl font-bold transition-all select-none flex items-center justify-center',
                  isKept
                    ? 'bg-indigo-500 dark:bg-indigo-600 text-white scale-105 shadow-md'
                    : isAnimating
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500'
                      : hasRolled
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-2 border-slate-200 dark:border-slate-700',
                ].join(' ')}
              >
                {hasRolled || rolling ? v : '?'}
              </button>
            )
          })}
        </div>

        {hasRolled && !isFinished && !rolling && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 -mt-2">
            {t.keepToggleHint}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {hasRolled && !isFinished && (
            <button
              type="button"
              onClick={() => onFinish(values)}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              {t.finishRolling}
            </button>
          )}
          {isFinished ? (
            <button
              type="button"
              onClick={() => onFinish(values)}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
            >
              ✓ {t.finishRolling}
            </button>
          ) : (
            <button
              type="button"
              onClick={rollDice}
              disabled={rolling}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {hasRolled ? `🎲 ${t.rollAgain}` : `🎲 ${t.rollDice}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
