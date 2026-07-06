import type { ScorableCategory } from '../types/game'

export function diceSum(dice: number[]): number {
  return dice.reduce((a, b) => a + b, 0)
}

function faceCounts(dice: number[]): Map<number, number> {
  const m = new Map<number, number>()
  for (const d of dice) m.set(d, (m.get(d) ?? 0) + 1)
  return m
}

function upperDiceScore(dice: number[], face: number): number {
  return dice.filter(d => d === face).length * face
}

function hasThreeOfAKind(dice: number[]): boolean {
  return [...faceCounts(dice).values()].some(c => c >= 3)
}

function hasFourOfAKind(dice: number[]): boolean {
  return [...faceCounts(dice).values()].some(c => c >= 4)
}

function hasFullHouse(dice: number[]): boolean {
  const counts = [...faceCounts(dice).values()].sort()
  return counts.length === 2 && counts[0] === 2 && counts[1] === 3
}

function hasSmallStraight(dice: number[]): boolean {
  const uniq = [...new Set(dice)]
  return (
    [1, 2, 3, 4].every(n => uniq.includes(n)) ||
    [2, 3, 4, 5].every(n => uniq.includes(n)) ||
    [3, 4, 5, 6].every(n => uniq.includes(n))
  )
}

function hasLargeStraight(dice: number[]): boolean {
  const uniq = [...new Set(dice)]
  return (
    [1, 2, 3, 4, 5].every(n => uniq.includes(n)) ||
    [2, 3, 4, 5, 6].every(n => uniq.includes(n))
  )
}

function hasKnueffl(dice: number[]): boolean {
  return new Set(dice).size === 1
}

const UPPER_FACE: Partial<Record<ScorableCategory, number>> = {
  ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6,
}

/** Returns the auto-score for a category given the current dice, or null if the combination is invalid. */
export function getDiceAutoScore(dice: number[], category: ScorableCategory): number | null {
  const face = UPPER_FACE[category]
  if (face !== undefined) {
    const s = upperDiceScore(dice, face)
    return s > 0 ? s : null
  }

  switch (category) {
    case 'threeOfAKind':  return hasThreeOfAKind(dice) ? diceSum(dice) : null
    case 'fourOfAKind':   return hasFourOfAKind(dice)  ? diceSum(dice) : null
    case 'fullHouse':     return hasFullHouse(dice)     ? 25 : null
    case 'smallStraight': return hasSmallStraight(dice) ? 30 : null
    case 'largeStraight': return hasLargeStraight(dice) ? 40 : null
    case 'Knueffl':       return hasKnueffl(dice)       ? 50 : null
    case 'chance':        return diceSum(dice)
    default:              return null
  }
}
