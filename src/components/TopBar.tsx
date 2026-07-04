import { useTranslation } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'

export function TopBar() {
  const { t, language, setLanguage } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">🎲 {t.appTitle}</span>

      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
          title={t.language}
        >
          {language === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
          title={t.theme}
          aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
