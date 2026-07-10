import { useEffect, useState } from 'react'
import { useTranslation } from '../hooks/useLanguage'

interface Props {
  dieIndex: number // 0-5 → values 1-6
  onConfirm: (count: number) => void
  onCancel: () => void
}

export function UpperInputPopup({ dieIndex, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number | null>(null)
  const dieValue = dieIndex + 1
  const dieName = t.dieNames[dieIndex]

  function handleConfirm() {
    if (selected === null || selected < 1) return
    onConfirm(selected * dieValue)
  }

  // Desktop keyboard entry: digits 1–5 pick the die count, Enter confirms, Escape cancels.
  // e.g. on "Dreier" pressing 3 then Enter commits 3 × 3 = 9.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= '1' && e.key <= '5') {
        setSelected(Number(e.key))
        e.preventDefault()
      } else if (e.key === 'Enter') {
        if (selected !== null && selected >= 1) onConfirm(selected * dieValue)
        e.preventDefault()
      } else if (e.key === 'Escape') {
        onCancel()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, dieValue, onConfirm, onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-7 w-full max-w-sm border border-slate-200 dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-5 text-center">
          {t.howMany(dieName)}
        </h2>

        {/* Die face count buttons 1-5 */}
        <div className="flex justify-center gap-2.5 mb-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelected(n)}
              className={[
                'flex-1 aspect-square rounded-xl text-lg font-bold transition-all border-2',
                selected === n
                  ? 'bg-teal-600 dark:bg-teal-600 text-white border-teal-600 dark:border-teal-600 scale-110 shadow-md'
                  : 'bg-white dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-600 hover:border-teal-400 dark:hover:border-teal-600',
              ].join(' ')}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Score preview */}
        <p className="text-center text-base text-slate-500 dark:text-zinc-400 mb-5 h-6">
          {selected !== null ? `${selected} × ${dieValue} = ${selected * dieValue}` : ''}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-zinc-600 text-slate-600 dark:text-zinc-400 text-base font-semibold hover:bg-slate-50 dark:hover:bg-zinc-700 transition"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected === null}
            className="flex-1 py-3 rounded-xl bg-teal-600 dark:bg-teal-600 text-white text-base font-semibold disabled:opacity-40 hover:bg-teal-700 dark:hover:bg-teal-700 transition"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
