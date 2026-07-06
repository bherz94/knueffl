import { useState, useEffect } from 'react'
import './index.css'
import { ThemeProvider } from './hooks/useTheme'
import { LanguageProvider } from './hooks/useLanguage'
import { FontScaleProvider } from './hooks/useFontScale'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'
import { TopBar } from './components/TopBar'
import { clearGameState } from './hooks/useGameState'
import type { PlayerSetup } from './types/profile'

type View = 'setup' | 'game'

const APP_KEY = 'knueffl-app'

// Normalize a persisted `players` blob into PlayerSetup[]. Older builds saved
// `string[]`; map those (and any stray shapes) into `{ name }` slots.
function normalizePlayers(raw: unknown): PlayerSetup[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((p): PlayerSetup | null => {
      if (typeof p === 'string') return { name: p }
      if (p && typeof p === 'object' && typeof (p as PlayerSetup).name === 'string') {
        const { name, profileId, avatar } = p as PlayerSetup
        return { name, profileId, avatar }
      }
      return null
    })
    .filter((p): p is PlayerSetup => p !== null)
}

function loadAppState(): { view: View; players: PlayerSetup[]; virtualDice: boolean } | null {
  try {
    const raw = localStorage.getItem(APP_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      view: parsed.view === 'game' ? 'game' : 'setup',
      players: normalizePlayers(parsed.players),
      virtualDice: !!parsed.virtualDice,
    }
  } catch {
    return null
  }
}

function AppInner() {
  const savedApp = loadAppState()
  const [view, setView] = useState<View>(savedApp?.view ?? 'setup')
  const [players, setPlayers] = useState<PlayerSetup[]>(savedApp?.players ?? [])
  const [virtualDice, setVirtualDice] = useState<boolean>(savedApp?.virtualDice ?? false)
  // Bumped on New Game to force a fresh GameScreen (and useGameState) mount
  const [gameNonce, setGameNonce] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(APP_KEY, JSON.stringify({ view, players, virtualDice }))
    } catch {}
  }, [view, players, virtualDice])

  function handleStart(setups: PlayerSetup[], vd: boolean) {
    clearGameState()
    setPlayers(setups)
    setVirtualDice(vd)
    setView('game')
  }

  function handleNewGame() {
    clearGameState()
    // Right-rotate the player order by one: previous last player throws first.
    setPlayers((prev) =>
      prev.length > 1 ? [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)] : prev
    )
    setGameNonce((n) => n + 1)
    setView('game')
  }

  function handleCancel() {
    clearGameState()
    setView('setup')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <TopBar />
      {view === 'setup' && (
        <SetupScreen
          onStart={handleStart}
          initialPlayers={players.length ? players : undefined}
          initialVirtualDice={virtualDice}
        />
      )}
      {view === 'game' && (
        <GameScreen
          key={gameNonce}
          players={players}
          virtualDice={virtualDice}
          onNewGame={handleNewGame}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FontScaleProvider>
          <AppInner />
        </FontScaleProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
