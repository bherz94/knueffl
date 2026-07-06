import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'
import { useFontScale } from '../hooks/useFontScale'
import type { FontScale } from '../hooks/useFontScale'

export function TopBar() {
  const { t, language, setLanguage } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { fontScale, setFontScale } = useFontScale()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the popover on outside click / Escape
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const fontOptions: { key: FontScale; label: string }[] = [
    { key: 'sm', label: t.fontSmall },
    { key: 'md', label: t.fontMedium },
    { key: 'lg', label: t.fontLarge },
  ]

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">🎲 {t.appTitle}</span>

      <div className="relative" ref={menuRef}>
        {/* Options cogwheel */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
          title={t.settings}
          aria-label={t.settings}
          aria-haspopup="true"
          aria-expanded={open}
        >
          ⚙️
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 z-50 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-3 flex flex-col gap-4">
            {/* Language */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t.language}</span>
              <div className="flex gap-2">
                {(['de', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-sm font-semibold border transition',
                      language === lang
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600',
                    ].join(' ')}
                  >
                    {lang === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t.theme}</span>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { if (theme !== mode) toggleTheme() }}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-sm font-semibold border transition',
                      theme === mode
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600',
                    ].join(' ')}
                  >
                    {mode === 'light' ? `☀️ ${t.themeLight}` : `🌙 ${t.themeDark}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t.fontSize}</span>
              <div className="flex gap-2">
                {fontOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFontScale(opt.key)}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-sm font-semibold border transition',
                      fontScale === opt.key
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
