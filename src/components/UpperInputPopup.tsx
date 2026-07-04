import { useState } from 'react'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-72 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
          {t.howMany(dieName)}
        </h2>

        {/* Die face count buttons 1-5 */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelected(n)}
              className={[
                'w-11 h-11 rounded-xl text-base font-bold transition-all border-2',
                selected === n
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 scale-110 shadow-md'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500',
              ].join(' ')}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Score preview */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4 h-5">
          {selected !== null ? `${selected} × ${dieValue} = ${selected * dieValue}` : ''}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected === null}
            className="flex-1 py-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
