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
    'h-14 rounded-xl text-xl font-bold transition-all border-2 bg-white dark:bg-zinc-700 ' +
    'text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-600 ' +
    'hover:border-primary-400 dark:hover:border-primary-600 active:scale-95 select-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-7 w-full max-w-sm border border-slate-200 dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-5 text-center">
          {t.enterScore}
        </h2>

        {/* Read-only entry display */}
        <div className="w-full px-4 py-3 text-center text-3xl font-bold rounded-xl border-2 border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 mb-5 h-16 flex items-center justify-center">
          {raw === '' ? <span className="text-slate-400 dark:text-zinc-500">1–30</span> : raw}
        </div>

        {/* On-screen keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
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
            disabled={!isValid}
            className="flex-1 py-3 rounded-xl bg-primary-600 dark:bg-primary-600 text-white text-base font-semibold disabled:opacity-40 hover:bg-primary-700 dark:hover:bg-primary-700 transition"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
