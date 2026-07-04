import type { Translations } from './types'

const de: Translations = {
  // App
  appTitle: 'Kniffel',

  // Top bar
  language: 'Sprache',
  theme: 'Design',
  themeLight: 'Hell',
  themeDark: 'Dunkel',

  // Setup screen
  setupTitle: 'Neues Spiel',
  setupSubtitle: 'Spieler einrichten',
  playerCount: 'Anzahl Spieler',
  playerName: 'Name',
  playerNamePlaceholder: (n) => `Spieler ${n}`,
  startGame: 'Spiel starten',
  addPlayer: 'Spieler hinzufügen',
  removePlayer: 'Spieler entfernen',

  // Upper section
  upperSection: 'Oberer Teil',
  ones: 'Einser',
  twos: 'Zweier',
  threes: 'Dreier',
  fours: 'Vierer',
  fives: 'Fünfer',
  sixes: 'Sechser',
  upperSubtotal: 'Gesamt',
  bonus: 'Bonus (ab 63)',
  bonusHint: '+35 Punkte',
  upperTotal: 'Gesamt oben',

  // Lower section
  lowerSection: 'Unterer Teil',
  threeOfAKind: 'Dreierpasch',
  fourOfAKind: 'Viererpasch',
  fullHouse: 'Full House',
  fullHousePoints: '25 Punkte',
  smallStraight: 'Kleine Straße',
  smallStraightPoints: '30 Punkte',
  largeStraight: 'Große Straße',
  largeStraightPoints: '40 Punkte',
  kniffel: 'Kniffel',
  kniffelPoints: '50 Punkte',
  chance: 'Chance',
  lowerTotal: 'Gesamt unten',
  upperTotalRepeated: 'Gesamt oben',
  grandTotal: 'Endsumme',

  // Score cell / input
  howMany: (dieName) => `Wie viele ${dieName}?`,
  dieNames: ['Einser', 'Zweier', 'Dreier', 'Vierer', 'Fünfer', 'Sechser'],
  confirm: 'Bestätigen',
  cancel: 'Abbrechen',
  crossOut: 'Streichen',
  crossOutHint: 'Gedrückt halten zum Streichen',
  enterScore: 'Punkte eingeben (0–30)',
  allEyes: 'Alle Augen zählen',

  // Turn indicator
  currentTurn: (name) => `${name} ist dran`,
  undo: 'Rückgängig',

  // Game end
  gameOver: 'Spiel beendet!',
  finalRankings: 'Endstand',
  winner: 'Gewinner',
  tie: 'Gleichstand',
  newGame: 'Neues Spiel',
  place: (n) => `${n}.`,
  points: (n) => `${n} Punkte`,
}

export default de
