import { useState, useEffect } from 'react'
import './index.css'
import { ThemeProvider } from './hooks/useTheme'
import { LanguageProvider } from './hooks/useLanguage'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'
import { TopBar } from './components/TopBar'
import { clearGameState } from './hooks/useGameState'

type View = 'setup' | 'game'

const APP_KEY = 'knueffl-app'

function loadAppState(): { view: View; players: string[] } | null {
  try {
    const raw = localStorage.getItem(APP_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function AppInner() {
  const savedApp = loadAppState()
  const [view, setView] = useState<View>(savedApp?.view ?? 'setup')
  const [players, setPlayers] = useState<string[]>(savedApp?.players ?? [])

  useEffect(() => {
    try {
      localStorage.setItem(APP_KEY, JSON.stringify({ view, players }))
    } catch {}
  }, [view, players])

  function handleStart(names: string[]) {
    clearGameState()
    setPlayers(names)
    setView('game')
  }

  function handleNewGame() {
    clearGameState()
    setView('setup')
  }

  function handleCancel() {
    clearGameState()
    setView('setup')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <TopBar />
      {view === 'setup' && <SetupScreen onStart={handleStart} initialNames={players.length ? players : undefined} />}
      {view === 'game' && <GameScreen playerNames={players} onNewGame={handleNewGame} onCancel={handleCancel} />}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </ThemeProvider>
  )
}
