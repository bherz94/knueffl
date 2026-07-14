import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  applyColorTheme,
  resolveSpec,
  effectiveHex,
  DEFAULT_PRESET_ID,
  PRESETS,
} from '../utils/themeColors'
import type { ColorTheme, Role } from '../utils/themeColors'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  colorTheme: ColorTheme
  setPreset: (id: string) => void
  setCustomColor: (role: Role, hex: string) => void
  resetColors: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const COLORS_KEY = 'Knueffl-colors'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('Knueffl-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialColorTheme(): ColorTheme {
  try {
    const raw = localStorage.getItem(COLORS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ColorTheme
      if (parsed && typeof parsed.preset === 'string') return parsed
    }
  } catch {
    /* ignore malformed storage */
  }
  return { preset: DEFAULT_PRESET_ID }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [colorTheme, setColorTheme] = useState<ColorTheme>(getInitialColorTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('Knueffl-theme', theme)
  }, [theme])

  useEffect(() => {
    applyColorTheme(resolveSpec(colorTheme))
    localStorage.setItem(COLORS_KEY, JSON.stringify(colorTheme))
  }, [colorTheme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const setPreset = (id: string) => {
    if (PRESETS.some((p) => p.id === id)) setColorTheme({ preset: id })
  }

  // Editing any picker switches to a custom theme, seeding every role from the
  // colors currently in effect so untouched roles keep their look.
  const setCustomColor = (role: Role, hex: string) => {
    setColorTheme((prev) => {
      const base: Partial<Record<Role, string>> =
        prev.preset === 'custom'
          ? { ...prev.custom }
          : {
              primary: effectiveHex(prev, 'primary'),
              secondary: effectiveHex(prev, 'secondary'),
              neutral: effectiveHex(prev, 'neutral'),
            }
      base[role] = hex
      return { preset: 'custom', custom: base }
    })
  }

  const resetColors = () => setColorTheme({ preset: DEFAULT_PRESET_ID })

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, colorTheme, setPreset, setCustomColor, resetColors }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
