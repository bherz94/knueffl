import { useTranslation } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'
import { effectiveHex } from '../utils/themeColors'
import type { Role } from '../utils/themeColors'

interface Props {
  onClose: () => void
}

export function ColorPickerModal({ onClose }: Props) {
  const { t } = useTranslation()
  const { colorTheme, setCustomColor, resetColors } = useTheme()

  const rows: { role: Role; label: string }[] = [
    { role: 'primary', label: t.colorPrimary },
    { role: 'secondary', label: t.colorSecondary },
    { role: 'neutral', label: t.colorBackground },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-700 flex flex-col"
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
          <div className="text-center mb-2">
            <div className="text-3xl mb-1">🎨</div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{t.customizeColors}</h2>
          </div>
        </div>

        {/* Pickers */}
        <div className="px-5 pb-5 flex flex-col gap-3">
          {rows.map(({ role, label }) => {
            const hex = effectiveHex(colorTheme, role)
            return (
              <label
                key={role}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-700/60 border border-slate-200 dark:border-zinc-600 cursor-pointer"
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-slate-500 dark:text-zinc-400">{hex}</span>
                  <span
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-zinc-500 shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: hex }}
                  >
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => setCustomColor(role, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label={label}
                    />
                  </span>
                </span>
              </label>
            )
          })}

          <button
            type="button"
            onClick={resetColors}
            className="mt-1 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-600 hover:bg-slate-200 dark:hover:bg-zinc-600 transition"
          >
            {t.resetColors}
          </button>
        </div>
      </div>
    </div>
  )
}
