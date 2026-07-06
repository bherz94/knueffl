import type { Translations } from './types'

const en: Translations = {
  // App
  appTitle: 'Kniffel',

  // Top bar
  language: 'Language',
  theme: 'Theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  settings: 'Settings',
  fontSize: 'Font size',
  fontSmall: 'S',
  fontMedium: 'M',
  fontLarge: 'L',

  // Setup screen
  setupTitle: 'New Game',
  setupSubtitle: 'Set up players',
  playerCount: 'Number of players',
  playerName: 'Name',
  playerNamePlaceholder: (n: number) => `Player ${n}`,
  startGame: 'Start Game',
  addPlayer: 'Add player',
  removePlayer: 'Remove player',

  // Upper section
  upperSection: 'Upper Section',
  ones: 'Ones',
  twos: 'Twos',
  threes: 'Threes',
  fours: 'Fours',
  fives: 'Fives',
  sixes: 'Sixes',
  upperSubtotal: 'Subtotal',
  bonus: 'Bonus (from 63)',
  bonusHint: '+35 points',
  upperTotal: 'Upper total',

  // Lower section
  lowerSection: 'Lower Section',
  threeOfAKind: 'Three of a Kind',
  fourOfAKind: 'Four of a Kind',
  fullHouse: 'Full House',
  fullHousePoints: '25 points',
  smallStraight: 'Small Straight',
  smallStraightPoints: '30 points',
  largeStraight: 'Large Straight',
  largeStraightPoints: '40 points',
  kniffel: 'Kniffel',
  kniffelPoints: '50 points',
  chance: 'Chance',
  lowerTotal: 'Lower total',
  upperTotalRepeated: 'Upper total',
  grandTotal: 'Grand Total',

  // Score cell / input
  howMany: (dieName: string) => `How many ${dieName}?`,
  dieNames: ['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'],
  confirm: 'Confirm',
  cancel: 'Cancel',
  crossOut: 'Cross out',
  crossOutHint: 'Hold to cross out',
  enterScore: 'Enter score (0–30)',
  allEyes: 'Count all pips',
  clear: 'Clear',
  backspace: 'Backspace',

  // Turn indicator
  currentTurn: (name: string) => `${name}'s turn`,
  undo: 'Undo',
  cancelGame: 'Cancel',
  cancelConfirmTitle: 'Cancel game?',
  cancelConfirmMessage: 'All progress will be lost.',
  cancelConfirmYes: 'Yes, cancel',
  cancelConfirmNo: 'Keep playing',

  // Virtual dice
  virtualDice: 'Virtual dice rolling',
  rollDice: 'Roll',
  rollAgain: 'Roll Again',
  finishRolling: 'Done',
  throwNumber: (n: number, max: number) => `Throw ${n}/${max}`,
  keepToggleHint: 'Tap a die to keep it',

  // Game end
  gameOver: 'Game over!',
  finalRankings: 'Final Rankings',
  winner: 'Winner',
  tie: 'Tie',
  newGame: 'New Game',
  place: (n: number) => {
    const map: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' }
    return map[n] ?? `${n}th`
  },
  points: (n: number) => `${n} points`,

  // Game history & high scores
  history: 'History',
  historyTitle: 'History & Leaderboard',
  recentGames: 'Recent Games',
  leaderboard: 'Leaderboard',
  noGamesYet: 'No games played yet.',
  statBestGame: 'Best game',
  statWins: 'Wins',
  statAvg: 'Average',
  gamesPlayedCount: (n: number) => (n === 1 ? '1 game' : `${n} games`),
  winsCount: (n: number) => (n === 1 ? '1 win' : `${n} wins`),
  clearHistory: 'Clear history',
  clearHistoryTitle: 'Clear history?',
  clearHistoryConfirm: 'All saved games and leaderboards will be permanently removed.',
  gameBoardTitle: 'Scorecard',
  viewGameBoard: 'View scorecard',
  showMore: (n: number) => `Show more (${n})`,

  // Move history & correction (Task 18)
  moveHistory: 'Move history',
  moveHistoryFor: (name: string) => `${name} — move history`,
  noMoves: 'No moves yet',
  tapEntryToCorrect: 'Tap an entry to remove it and correct it',
  correctionBanner: (name: string) => `Correcting ${name}`,
  correctionHint: 'Tap an empty cell to enter the correct value',
  cancelCorrection: 'Cancel correction',
}

export default en
