import type { Player, ScorableCategory, CategoryMeta } from '../types/game'
import { UPPER_CATEGORIES, LOWER_CATEGORIES } from '../types/game'
import {
  calcUpperSubtotal, calcBonus, calcUpperTotal,
  calcLowerTotal, calcGrandTotal,
} from '../utils/scoring'
import { getDiceAutoScore } from '../utils/dice'
import { categoryLabel } from '../utils/labels'
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
  isGameOver?: boolean
  placements?: Record<number, number>
  diceValues?: number[] | null
  onHeaderClick?: (playerIndex: number) => void
  correctingPlayerIndex?: number | null
}

const UPPER_FACE: Record<string, number> = {
  ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6,
}

function categoryHint(t: ReturnType<typeof useTranslation>['t'], meta: CategoryMeta): string | null {
  if (meta.inputKind === 'upper') return t.countAllOf(UPPER_FACE[meta.id])
  if (meta.id === 'fullHouse') return t.fullHousePoints
  if (meta.id === 'smallStraight') return t.smallStraightPoints
  if (meta.id === 'largeStraight') return t.largeStraightPoints
  if (meta.id === 'Knueffl') return t.KnuefflPoints
  if (meta.id === 'chance') return t.allEyes
  if (meta.id === 'threeOfAKind' || meta.id === 'fourOfAKind') return t.allEyes
  return null
}

export function Scoreboard({ players, currentPlayerIndex, activeCellKey, onCellClick, onCross, isGameOver, placements, diceValues, onHeaderClick, correctingPlayerIndex }: Props) {
  const { t } = useTranslation()
  const colSpan = players.length + 1
  const isCorrecting = correctingPlayerIndex != null
  const activeIndex = isGameOver ? -1 : currentPlayerIndex

  const winnerSet: Set<number> = new Set(
    placements
      ? Object.entries(placements).filter(([, p]) => p === 1).map(([i]) => Number(i))
      : []
  )

  // During a correction only the corrected player's empty cells are interactive.
  const interactiveIndex = isCorrecting ? correctingPlayerIndex : currentPlayerIndex

  function handleCellClick(playerIndex: number, meta: CategoryMeta) {
    if (playerIndex !== interactiveIndex) return
    const cell = players[playerIndex].scores[meta.id]
    if (cell.status !== 'empty') return
    onCellClick(playerIndex, meta)
  }

  function handleCellDoubleClick(playerIndex: number, meta: CategoryMeta) {
    if (playerIndex !== interactiveIndex) return
    const cell = players[playerIndex].scores[meta.id]
    if (cell.status !== 'empty') return
    onCross(playerIndex, meta.id)
  }

  function renderCategoryRow(meta: CategoryMeta, zebra: boolean) {
    const hint = categoryHint(t, meta)
    return (
      <tr
        key={meta.id}
        className={zebra ? 'bg-slate-50/50 dark:bg-zinc-800/20' : ''}
      >
        <td className="sticky left-0 z-10 bg-inherit px-3 py-1 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
              {categoryLabel(t, meta.id)}
            </span>
            {hint && (
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                {hint}
              </span>
            )}
          </div>
        </td>

        {players.map((player, pi) => (
          <td key={pi} className={[
            'px-1 py-1 border-b border-slate-100 dark:border-zinc-800',
            pi === activeIndex ? 'bg-primary-50/60 dark:bg-primary-900/10' : '',
          ].join(' ')}>
            <ScoreCell
              cell={player.scores[meta.id]}
              isActive={pi === activeIndex}
              isSelected={activeCellKey === `${pi}-${meta.id}`}
              isViable={
                diceValues != null &&
                pi === activeIndex &&
                player.scores[meta.id].status === 'empty' &&
                getDiceAutoScore(diceValues, meta.id) !== null
              }
              isCorrectable={isCorrecting && pi === correctingPlayerIndex && player.scores[meta.id].status === 'empty'}
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
    showWinner = false,
  ) {
    return (
      <tr className={highlight ? 'bg-primary-50/40 dark:bg-primary-900/10' : 'bg-slate-50 dark:bg-zinc-800/30'}>
        <td className="sticky left-0 z-10 bg-inherit px-3 py-1 border-b border-slate-100 dark:border-zinc-800">
          <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide whitespace-nowrap">
            {label}
          </span>
        </td>
        {players.map((player, pi) => (
          <td key={pi} className={[
            'px-1 py-1 border-b border-slate-100 dark:border-zinc-800',
            pi === activeIndex ? 'bg-primary-50/60 dark:bg-primary-900/10' : '',
          ].join(' ')}>
            <AutoCell
              value={!showFor || showFor(player) ? getValue(player) : null}
              highlight={highlight}
              isWinner={showWinner && winnerSet.has(pi)}
            />
          </td>
        ))}
      </tr>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="mx-auto" style={{ maxWidth: `${110 + players.length * 150}px`, minWidth: '70%' }}>
      <table className="w-full border-collapse min-w-0" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '110px', minWidth: '100px' }} />
          {players.map((_, i) => (
            <col key={i} style={{ width: `${Math.floor(100 / players.length)}%` }} />
          ))}
        </colgroup>

        <thead>
          <tr>
            <th className="sticky left-0 z-20 bg-white dark:bg-zinc-900 px-3 py-2 border-b-2 border-slate-200 dark:border-zinc-700" />
            {players.map((player, i) => (
              <th
                key={i}
                className={[
                  'px-1 py-1 border-b-2 border-slate-200 dark:border-zinc-700',
                  i === activeIndex ? 'bg-primary-50/60 dark:bg-primary-900/10' : 'bg-white dark:bg-zinc-900',
                ].join(' ')}
              >
                {onHeaderClick ? (
                  <button
                    type="button"
                    onClick={() => onHeaderClick(i)}
                    className="w-full rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title={t.moveHistory}
                  >
                    <PlayerHeader
                      name={player.name}
                      isActive={i === activeIndex}
                      index={i}
                      place={placements?.[i]}
                      avatar={player.avatar}
                    />
                  </button>
                ) : (
                  <PlayerHeader
                    name={player.name}
                    isActive={i === activeIndex}
                    index={i}
                    place={placements?.[i]}
                    avatar={player.avatar}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <SectionHeader label={t.upperSection} colSpan={colSpan} />
          {UPPER_CATEGORIES.map((meta, idx) => renderCategoryRow(meta, idx % 2 === 1))}
          {renderAutoRow(t.upperSubtotal, (p) => calcUpperSubtotal(p.scores))}
          {renderAutoRow(t.bonus, (p) => calcBonus(p.scores))}
          {renderAutoRow(t.upperTotal, (p) => calcUpperTotal(p.scores))}

          <SectionHeader label={t.lowerSection} colSpan={colSpan} />
          {LOWER_CATEGORIES.map((meta, idx) => renderCategoryRow(meta, idx % 2 === 1))}
          {renderAutoRow(t.lowerTotal, (p) => calcLowerTotal(p.scores))}
          {renderAutoRow(t.upperTotalRepeated, (p) => calcUpperTotal(p.scores))}
          {renderAutoRow(t.grandTotal, (p) => calcGrandTotal(p.scores), false, () => !!isGameOver, true)}
        </tbody>
      </table>
      </div>
    </div>
  )
}
