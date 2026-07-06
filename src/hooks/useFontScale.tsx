import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type FontScale = 'sm' | 'md' | 'lg'

const ROOT_PX: Record<FontScale, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
}

const STORAGE_KEY = 'kniffel-font-scale'

interface FontScaleContextValue {
  fontScale: FontScale
  setFontScale: (scale: FontScale) => void
}

const FontScaleContext = createContext<FontScaleContextValue | null>(null)

function getInitialScale(): FontScale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'sm' || stored === 'md' || stored === 'lg') return stored
  return 'md'
}

export function FontScaleProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScale] = useState<FontScale>(getInitialScale)

  useEffect(() => {
    document.documentElement.style.fontSize = ROOT_PX[fontScale]
    localStorage.setItem(STORAGE_KEY, fontScale)
  }, [fontScale])

  return (
    <FontScaleContext.Provider value={{ fontScale, setFontScale }}>
      {children}
    </FontScaleContext.Provider>
  )
}

export function useFontScale() {
  const ctx = useContext(FontScaleContext)
  if (!ctx) throw new Error('useFontScale must be used within FontScaleProvider')
  return ctx
}
