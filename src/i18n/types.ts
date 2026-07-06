export interface Translations {
  // App
  appTitle: string

  // Top bar
  language: string
  theme: string
  themeLight: string
  themeDark: string
  settings: string
  fontSize: string
  fontSmall: string
  fontMedium: string
  fontLarge: string

  // Setup screen
  setupTitle: string
  setupSubtitle: string
  playerCount: string
  playerName: string
  playerNamePlaceholder: (n: number) => string
  startGame: string
  addPlayer: string
  removePlayer: string

  // Upper section
  upperSection: string
  ones: string
  twos: string
  threes: string
  fours: string
  fives: string
  sixes: string
  upperSubtotal: string
  bonus: string
  bonusHint: string
  upperTotal: string

  // Lower section
  lowerSection: string
  threeOfAKind: string
  fourOfAKind: string
  fullHouse: string
  fullHousePoints: string
  smallStraight: string
  smallStraightPoints: string
  largeStraight: string
  largeStraightPoints: string
  kniffel: string
  kniffelPoints: string
  chance: string
  lowerTotal: string
  upperTotalRepeated: string
  grandTotal: string

  // Score cell / input
  howMany: (dieName: string) => string
  dieNames: [string, string, string, string, string, string]
  confirm: string
  cancel: string
  crossOut: string
  crossOutHint: string
  enterScore: string
  allEyes: string
  clear: string
  backspace: string

  // Turn indicator
  currentTurn: (name: string) => string
  undo: string
  cancelGame: string
  cancelConfirmTitle: string
  cancelConfirmMessage: string
  cancelConfirmYes: string
  cancelConfirmNo: string

  // Virtual dice
  virtualDice: string
  rollDice: string
  rollAgain: string
  finishRolling: string
  throwNumber: (n: number, max: number) => string
  keepToggleHint: string

  // Game end
  gameOver: string
  finalRankings: string
  winner: string
  tie: string
  newGame: string
  place: (n: number) => string
  points: (n: number) => string

  // Game history & high scores
  history: string
  historyTitle: string
  recentGames: string
  leaderboard: string
  noGamesYet: string
  statBestGame: string
  statWins: string
  statAvg: string
  gamesPlayedCount: (n: number) => string
  winsCount: (n: number) => string
  clearHistory: string
  clearHistoryTitle: string
  clearHistoryConfirm: string
  gameBoardTitle: string
  viewGameBoard: string
  showMore: (remaining: number) => string

  // Move history & correction (Task 18)
  moveHistory: string
  moveHistoryFor: (name: string) => string
  noMoves: string
  tapEntryToCorrect: string
  correctionBanner: (name: string) => string
  correctionHint: string
  cancelCorrection: string
}
