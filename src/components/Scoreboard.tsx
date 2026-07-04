import type { Player, ScorableCategory, CategoryMeta } from '../types/game'
import { UPPER_CATEGORIES, LOWER_CATEGORIES } from '../types/game'
import {
  calcUpperSubtotal, calcBonus, calcUpperTotal,
  calcLowerTotal, calcGrandTotal, isPlayerDone,
} from '../utils/scoring'
import { useTranslation } from '../hooks/useLanguage'
import { PlayerHeader } from './PlayerHeader'
import { ScoreCell } from './ScoreCell'
import { AutoCell } from './AutoCell'
import { SectionHeader } from './SectionHeader'

interface Props {
  players: Player[]
  currentPlayerIndex: number
  activeCellKey: string | null
  onCellClick: (playerIndex: number, meta: CategoryMeta) => void
  onCross: (playerIndex: number, category: ScorableCategory) => void
}

function categoryLabel(t: ReturnType<typeof useTranslation>['t'], id: ScorableCategory): string {
  const map: Record<ScorableCategory, string> = {
    ones: t.ones, twos: t.twos, threes: t.threes,
    fours: t.fours, fives: t.fives, sixes: t.sixes,
    threeOfAKind: t.threeOfAKind, fourOfAKind: t.fourOfAKind,
    fullHouse: t.fullHouse, smallStraight: t.smallStraight,
    largeStraight: t.largeStraight, kniffel: t.kniffel, chance: t.chance,
  }
  return map[id]
}

function categoryHint(t: ReturnType<typeof useTranslation>['t'], meta: CategoryMeta): string | null {
  if (meta.inputKind === 'upper') return t.allEyes
  if (meta.id === 'fullHouse') return t.fullHousePoints
  if (meta.id === 'smallStraight') return t.smallStraightPoints
  if (meta.id === 'largeStraight') return t.largeStraightPoints
  if (meta.id === 'kniffel') return t.kniffelPoints
  if (meta.id === 'chance') return t.allEyes
  if (meta.id === 'threeOfAKind' || meta.id === 'fourOfAKind') return t.allEyes
  return null
}

export function Scoreboard({ players, currentPlayerIndex, activeCellKey, onCellClick, onCross }: Props) {
  const { t } = useTranslation()
  const colSpan = players.length + 1

  function handleCellClick(playerIndex: number, meta: CategoryMeta) {
    if (playerIndex !== currentPlayerIndex) return
    const cell = players[playerIndex].scores[meta.id]
    if (cell.status !== 'empty') return
    onCellClick(playerIndex, meta)
  }

  function handleCellDoubleClick(playerIndex: number, meta: CategoryMeta) {
    if (playerIndex !== currentPlayerIndex) return
    const cell = players[playerIndex].scores[meta.id]
    if (cell.status !== 'empty') return
    onCross(playerIndex, meta.id)
  }

  function renderCategoryRow(meta: CategoryMeta, zebra: boolean) {
    const hint = categoryHint(t, meta)
    return (
      <tr
        key={meta.id}
        className={zebra ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}
      >
        {/* Label column */}
        <td className="sticky left-0 z-10 bg-inherit px-3 py-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
              {categoryLabel(t, meta.id)}
            </span>
            {hint && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {hint}
              </span>
            )}
          </div>
        </td>

        {/* Player cells */}
        {players.map((player, pi) => (
          <td key={pi} className={[
            'px-1 py-1 border-b border-slate-100 dark:border-slate-800',
            pi === currentPlayerIndex ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : '',
          ].join(' ')}>
            <ScoreCell
              cell={player.scores[meta.id]}
              isActive={pi === currentPlayerIndex}
              isSelected={activeCellKey === `${pi}-${meta.id}`}
              onSingleClick={() => handleCellClick(pi, meta)}
              onDoubleClick={() => handleCellDoubleClick(pi, meta)}
            />
          </td>
        ))}
      </tr>
    )
  }

  function renderAutoRow(
    label: string,
    getValue: (p: Player) => number,
    highlight = false,
    showFor?: (p: Player) => boolean,
  ) {
    return (
      <tr className={highlight ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : 'bg-slate-50 dark:bg-slate-800/30'}>
        <td className="sticky left-0 z-10 bg-inherit px-3 py-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
            {label}
          </span>
        </td>
        {players.map((player, pi) => (
          <td key={pi} className={[
            'px-1 py-1 border-b border-slate-100 dark:border-slate-800',
            pi === currentPlayerIndex ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : '',
          ].join(' ')}>
            <AutoCell
              value={!showFor || showFor(player) ? getValue(player) : null}
              highlight={highlight}
              isActive={pi === currentPlayerIndex}
            />
          </td>
        ))}
      </tr>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-0" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {/* Label column */}
          <col style={{ width: '110px', minWidth: '100px' }} />
          {/* Player columns — equal width */}
          {players.map((_, i) => (
            <col key={i} style={{ width: `${Math.floor(100 / players.length)}%` }} />
          ))}
        </colgroup>

        <thead>
          <tr>
            <th className="sticky left-0 z-20 bg-white dark:bg-slate-900 px-3 py-2 border-b-2 border-slate-200 dark:border-slate-700" />
            {players.map((player, i) => (
              <th
                key={i}
                className={[
                  'px-1 py-1 border-b-2 border-slate-200 dark:border-slate-700',
                  i === currentPlayerIndex ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : 'bg-white dark:bg-slate-900',
                ].join(' ')}
              >
                <PlayerHeader
                  name={player.name}
                  isActive={i === currentPlayerIndex}
                  index={i}
                />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Upper section */}
          <SectionHeader label={t.upperSection} colSpan={colSpan} />
          {UPPER_CATEGORIES.map((meta, idx) => renderCategoryRow(meta, idx % 2 === 1))}
          {renderAutoRow(t.upperSubtotal, (p) => calcUpperSubtotal(p.scores))}
          {renderAutoRow(t.bonus, (p) => calcBonus(p.scores), true)}
          {renderAutoRow(t.upperTotal, (p) => calcUpperTotal(p.scores), true)}

          {/* Lower section */}
          <SectionHeader label={t.lowerSection} colSpan={colSpan} />
          {LOWER_CATEGORIES.map((meta, idx) => renderCategoryRow(meta, idx % 2 === 1))}
          {renderAutoRow(t.lowerTotal, (p) => calcLowerTotal(p.scores))}
          {renderAutoRow(t.upperTotalRepeated, (p) => calcUpperTotal(p.scores))}
          {renderAutoRow(t.grandTotal, (p) => calcGrandTotal(p.scores), true, (p) => isPlayerDone(p.scores))}
        </tbody>
      </table>
    </div>
  )
}
