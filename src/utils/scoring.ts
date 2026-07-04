import type { PlayerScores, CellState } from '../types/game'
import { UPPER_CATEGORIES, LOWER_CATEGORIES } from '../types/game'

function cellValue(cell: CellState): number {
  return cell.status === 'scored' ? cell.value : 0
}

export function calcUpperSubtotal(scores: PlayerScores): number {
  return UPPER_CATEGORIES.reduce((sum, cat) => sum + cellValue(scores[cat.id]), 0)
}

export function calcBonus(scores: PlayerScores): number {
  return calcUpperSubtotal(scores) >= 63 ? 35 : 0
}

export function calcUpperTotal(scores: PlayerScores): number {
  return calcUpperSubtotal(scores) + calcBonus(scores)
}

export function calcLowerTotal(scores: PlayerScores): number {
  return LOWER_CATEGORIES.reduce((sum, cat) => sum + cellValue(scores[cat.id]), 0)
}

export function calcGrandTotal(scores: PlayerScores): number {
  return calcUpperTotal(scores) + calcLowerTotal(scores)
}

export function isCellFilled(cell: CellState): boolean {
  return cell.status !== 'empty'
}

export function isPlayerDone(scores: PlayerScores): boolean {
  return Object.values(scores).every(isCellFilled)
}
