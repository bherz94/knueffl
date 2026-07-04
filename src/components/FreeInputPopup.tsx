import { useState } from 'react'
import { useTranslation } from '../hooks/useLanguage'

interface Props {
  onConfirm: (value: number) => void
  onCancel: () => void
}

export function FreeInputPopup({ onConfirm, onCancel }: Props) {
  const { t } = useTranslation()
  const [raw, setRaw] = useState('')

  const parsed = parseInt(raw, 10)
  const isValid = !isNaN(parsed) && parsed >= 1 && parsed <= 30

  function handleConfirm() {
    if (!isValid) return
    onConfirm(parsed)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && isValid) handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-64 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
          {t.enterScore}
        </h2>

        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={30}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
          placeholder="1–30"
          className="w-full px-4 py-3 text-center text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition mb-4"
        />

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
            disabled={!isValid}
            className="flex-1 py-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
