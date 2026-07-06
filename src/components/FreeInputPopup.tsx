import { useCallback, useEffect, useState } from 'react'
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

  const handleConfirm = useCallback(() => {
    if (isNaN(parsed) || parsed < 1 || parsed > 30) return
    onConfirm(parsed)
  }, [parsed, onConfirm])

  const appendDigit = useCallback((digit: string) => {
    setRaw((prev) => {
      const next = (prev + digit).replace(/^0+(?=\d)/, '')
      // Never let the entry exceed the valid range's width (max 30 → 2 digits)
      if (next.length > 2) return prev
      return next
    })
  }, [])

  const backspace = useCallback(() => {
    setRaw((prev) => prev.slice(0, -1))
  }, [])

  const clear = useCallback(() => {
    setRaw('')
  }, [])

  // Hardware keyboard support (desktop): mirror the on-screen keypad.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        appendDigit(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        backspace()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [appendDigit, backspace, handleConfirm, onCancel])

  const keypadBtn =
    'h-12 rounded-xl text-lg font-bold transition-all border-2 bg-white dark:bg-slate-700 ' +
    'text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 ' +
    'hover:border-indigo-400 dark:hover:border-indigo-500 active:scale-95 select-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-72 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
          {t.enterScore}
        </h2>

        {/* Read-only entry display */}
        <div className="w-full px-4 py-3 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 mb-4 h-14 flex items-center justify-center">
          {raw === '' ? <span className="text-slate-400 dark:text-slate-500">1–30</span> : raw}
        </div>

        {/* On-screen keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" onClick={() => appendDigit(d)} className={keypadBtn}>
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={clear}
            className={keypadBtn + ' text-sm'}
            aria-label={t.clear}
          >
            {t.clear}
          </button>
          <button type="button" onClick={() => appendDigit('0')} className={keypadBtn}>
            0
          </button>
          <button
            type="button"
            onClick={backspace}
            className={keypadBtn + ' text-xl'}
            aria-label={t.backspace}
          >
            ⌫
          </button>
        </div>

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
