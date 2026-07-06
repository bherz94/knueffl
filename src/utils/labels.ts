import type { ScorableCategory } from '../types/game'
import type { Translations } from '../i18n/types'

export function categoryLabel(t: Translations, id: ScorableCategory): string {
  const map: Record<ScorableCategory, string> = {
    ones: t.ones, twos: t.twos, threes: t.threes,
    fours: t.fours, fives: t.fives, sixes: t.sixes,
    threeOfAKind: t.threeOfAKind, fourOfAKind: t.fourOfAKind,
    fullHouse: t.fullHouse, smallStraight: t.smallStraight,
    largeStraight: t.largeStraight, kniffel: t.kniffel, chance: t.chance,
  }
  return map[id]
}
