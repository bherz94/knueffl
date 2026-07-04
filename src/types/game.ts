export type ScorableCategory =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'threeOfAKind' | 'fourOfAKind' | 'fullHouse'
  | 'smallStraight' | 'largeStraight' | 'kniffel' | 'chance'

export type AutoCategory =
  | 'upperSubtotal' | 'bonus' | 'upperTotal'
  | 'lowerTotal' | 'upperTotalRepeated' | 'grandTotal'

export type Category = ScorableCategory | AutoCategory

export type CellState =
  | { status: 'empty' }
  | { status: 'scored'; value: number }
  | { status: 'crossed' }

export type PlayerScores = Record<ScorableCategory, CellState>

export interface Player {
  name: string
  scores: PlayerScores
}

export type InputKind = 'upper' | 'free' | 'fixed'

export interface CategoryMeta {
  id: ScorableCategory
  inputKind: InputKind
  fixedScore?: number
}

export const UPPER_CATEGORIES: CategoryMeta[] = [
  { id: 'ones', inputKind: 'upper' },
  { id: 'twos', inputKind: 'upper' },
  { id: 'threes', inputKind: 'upper' },
  { id: 'fours', inputKind: 'upper' },
  { id: 'fives', inputKind: 'upper' },
  { id: 'sixes', inputKind: 'upper' },
]

export const LOWER_CATEGORIES: CategoryMeta[] = [
  { id: 'threeOfAKind', inputKind: 'free' },
  { id: 'fourOfAKind', inputKind: 'free' },
  { id: 'fullHouse', inputKind: 'fixed', fixedScore: 25 },
  { id: 'smallStraight', inputKind: 'fixed', fixedScore: 30 },
  { id: 'largeStraight', inputKind: 'fixed', fixedScore: 40 },
  { id: 'kniffel', inputKind: 'fixed', fixedScore: 50 },
  { id: 'chance', inputKind: 'free' },
]

export const ALL_SCORABLE: CategoryMeta[] = [...UPPER_CATEGORIES, ...LOWER_CATEGORIES]

export const TOTAL_SCORABLE = ALL_SCORABLE.length // 13

export function makeEmptyScores(): PlayerScores {
  const scores = {} as PlayerScores
  for (const cat of ALL_SCORABLE) {
    scores[cat.id] = { status: 'empty' }
  }
  return scores
}
