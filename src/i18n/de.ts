import type { Translations } from './types'

const de: Translations = {
  // App
  appTitle: 'Knueffl',

  // Top bar
  language: 'Sprache',
  theme: 'Design',
  themeLight: 'Hell',
  themeDark: 'Dunkel',
  settings: 'Einstellungen',
  fontSize: 'Schriftgröße',
  fontSmall: 'S',
  fontMedium: 'M',
  fontLarge: 'L',

  // Setup screen
  setupTitle: 'Neues Spiel',
  setupSubtitle: 'Spieler einrichten',
  playerCount: 'Anzahl Spieler',
  playerName: 'Name',
  playerNamePlaceholder: (n) => `Spieler ${n}`,
  startGame: 'Spiel starten',
  addPlayer: 'Spieler hinzufügen',
  removePlayer: 'Spieler entfernen',
  reorderPlayer: 'Spieler verschieben',

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
  Knueffl: 'Knueffl',
  KnuefflPoints: '50 Punkte',
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
  clear: 'Löschen',
  backspace: 'Rücktaste',

  // Turn indicator
  currentTurn: (name) => `${name} ist dran`,
  undo: 'Rückgängig',
  cancelGame: 'Abbrechen',
  cancelConfirmTitle: 'Spiel abbrechen?',
  cancelConfirmMessage: 'Der aktuelle Fortschritt geht verloren.',
  cancelConfirmYes: 'Ja, abbrechen',
  cancelConfirmNo: 'Weiterspielen',

  // Virtual dice
  virtualDice: 'Virtuelle Würfel',
  rollDice: 'Würfeln',
  rollAgain: 'Nochmal',
  finishRolling: 'Fertig',
  throwNumber: (n, max) => `Wurf ${n}/${max}`,
  keepToggleHint: 'Würfel antippen zum Behalten',

  // Game end
  gameOver: 'Spiel beendet!',
  finalRankings: 'Endstand',
  winner: 'Gewinner',
  tie: 'Gleichstand',
  newGame: 'Neues Spiel',
  place: (n) => `${n}.`,
  points: (n) => `${n} Punkte`,

  // Game history & high scores
  history: 'Verlauf',
  historyTitle: 'Verlauf & Bestenliste',
  recentGames: 'Letzte Spiele',
  leaderboard: 'Bestenliste',
  noGamesYet: 'Noch keine Spiele gespielt.',
  statBestGame: 'Bestes Spiel',
  statWins: 'Siege',
  statAvg: 'Durchschnitt',
  gamesPlayedCount: (n) => (n === 1 ? '1 Spiel' : `${n} Spiele`),
  winsCount: (n) => (n === 1 ? '1 Sieg' : `${n} Siege`),
  clearHistory: 'Verlauf löschen',
  clearHistoryTitle: 'Verlauf löschen?',
  clearHistoryConfirm: 'Alle gespeicherten Spiele und Bestenlisten werden dauerhaft entfernt.',
  gameBoardTitle: 'Spielbrett',
  viewGameBoard: 'Spielbrett ansehen',
  showMore: (n) => `Mehr anzeigen (${n})`,

  // Move history & correction (Task 18)
  moveHistory: 'Spielverlauf',
  moveHistoryFor: (name) => `${name} — Spielverlauf`,
  noMoves: 'Noch keine Züge',
  tapEntryToCorrect: 'Tippe einen Eintrag an, um ihn zu entfernen und zu korrigieren',
  correctionBanner: (name) => `Korrektur für ${name}`,
  correctionHint: 'Tippe eine leere Zelle an, um den korrekten Wert einzugeben',
  cancelCorrection: 'Korrektur abbrechen',

  // Player profiles (Task 37)
  chooseProfile: 'Profil wählen',
  profiles: 'Profile',
  newProfile: 'Neues Profil',
  editProfile: 'Profil bearbeiten',
  deleteProfile: 'Profil löschen',
  deleteProfileConfirm: (name) => `Profil „${name}" wirklich löschen?`,
  profileName: 'Name',
  profileNamePlaceholder: 'Name eingeben',
  takePhoto: 'Foto aufnehmen',
  choosePhoto: 'Foto auswählen',
  removePhoto: 'Foto entfernen',
  noProfilesYet: 'Noch keine Profile. Erstelle ein neues.',
  save: 'Speichern',
  delete: 'Löschen',
  // Manage profiles (Task 41)
  manageProfiles: 'Profile verwalten',
  close: 'Schließen',
  profileInGame: 'im Spiel',
  deletedProfile: 'Gelöscht',
  gameBoardUnavailable: 'Für dieses Spiel ist kein Spielblatt gespeichert.',
  gameBoardError: 'Das Spielblatt konnte nicht angezeigt werden.',
}

export default de
