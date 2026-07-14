import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'
import { useFontScale } from '../hooks/useFontScale'
import type { FontScale } from '../hooks/useFontScale'
import { HistoryModal } from './HistoryModal'
import { ProfilePickerModal } from './ProfilePickerModal'
import { ColorPickerModal } from './ColorPickerModal'
import { PRESETS } from '../utils/themeColors'

export function TopBar() {
  const { t, language, setLanguage } = useTranslation()
  const { theme, toggleTheme, colorTheme, setPreset } = useTheme()
  const { fontScale, setFontScale } = useFontScale()
  const [open, setOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [profilesOpen, setProfilesOpen] = useState(false)
  const [colorsOpen, setColorsOpen] = useState(false)
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
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-700 shadow-sm">
      <span className="text-base font-bold text-primary-600 dark:text-primary-500">🎲 {t.appTitle}</span>

      <div className="flex items-center gap-2">
        {/* Manage profiles */}
        <button
          type="button"
          onClick={() => setProfilesOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700"
          title={t.manageProfiles}
          aria-label={t.manageProfiles}
        >
          👤
        </button>

        {/* History & high scores */}
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700"
          title={t.history}
          aria-label={t.history}
        >
          🏆
        </button>

      <div className="relative" ref={menuRef}>
        {/* Options cogwheel */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700"
          title={t.settings}
          aria-label={t.settings}
          aria-haspopup="true"
          aria-expanded={open}
        >
          ⚙️
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 z-50 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xl p-3 flex flex-col gap-4">
            {/* Language */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{t.language}</span>
              <div className="flex gap-2">
                {(['de', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-sm font-semibold border transition',
                      language === lang
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-600 hover:bg-slate-200 dark:hover:bg-zinc-600',
                    ].join(' ')}
                  >
                    {lang === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{t.theme}</span>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { if (theme !== mode) toggleTheme() }}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-sm font-semibold border transition',
                      theme === mode
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-600 hover:bg-slate-200 dark:hover:bg-zinc-600',
                    ].join(' ')}
                  >
                    {mode === 'light' ? `☀️ ${t.themeLight}` : `🌙 ${t.themeDark}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{t.colors}</span>
              <div className="flex gap-2">
                {PRESETS.map((preset) => {
                  const active = colorTheme.preset === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPreset(preset.id)}
                      title={presetLabel(preset.id)}
                      aria-label={presetLabel(preset.id)}
                      className={[
                        'flex-1 h-9 rounded-lg border-2 transition flex items-center justify-center',
                        active
                          ? 'border-slate-800 dark:border-white'
                          : 'border-slate-200 dark:border-zinc-600 hover:border-slate-400 dark:hover:border-zinc-400',
                      ].join(' ')}
                      style={{ backgroundColor: preset.swatch }}
                    >
                      {active && <span className="text-white text-sm drop-shadow">✓</span>}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => { setColorsOpen(true); setOpen(false) }}
                className={[
                  'py-1.5 rounded-lg text-sm font-semibold border transition',
                  colorTheme.preset === 'custom'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-600 hover:bg-slate-200 dark:hover:bg-zinc-600',
                ].join(' ')}
              >
                🎨 {t.customizeColors}
              </button>
            </div>

            {/* Font size */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{t.fontSize}</span>
              <div className="flex gap-2">
                {fontOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFontScale(opt.key)}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-sm font-semibold border transition',
                      fontScale === opt.key
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-600 hover:bg-slate-200 dark:hover:bg-zinc-600',
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
      </div>

      {historyOpen && <HistoryModal onClose={() => setHistoryOpen(false)} />}
      {/* No onSelect → management mode (edit/create/delete). Edits propagate live. */}
      {profilesOpen && <ProfilePickerModal onClose={() => setProfilesOpen(false)} />}
      {colorsOpen && <ColorPickerModal onClose={() => setColorsOpen(false)} />}
    </header>
  )

  function presetLabel(id: string): string {
    if (id === 'indigo') return t.themeIndigo
    if (id === 'rose') return t.themeRose
    return t.themeTeal
  }
}
