import { useState } from 'react'
import './index.css'
import { ThemeProvider } from './hooks/useTheme'
import { LanguageProvider } from './hooks/useLanguage'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'
import { TopBar } from './components/TopBar'

type View = 'setup' | 'game'

function AppInner() {
  const [view, setView] = useState<View>('setup')
  const [players, setPlayers] = useState<string[]>([])

  function handleStart(names: string[]) {
    setPlayers(names)
    setView('game')
  }

  function handleNewGame() {
    setView('setup')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <TopBar />
      {view === 'setup' && <SetupScreen onStart={handleStart} initialNames={players.length ? players : undefined} />}
      {view === 'game' && <GameScreen playerNames={players} onNewGame={handleNewGame} />}
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
