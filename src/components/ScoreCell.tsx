import { useRef, useState } from 'react'
import type { CellState } from '../types/game'

interface Props {
  cell: CellState
  isActive: boolean
  isSelected: boolean
  isViable?: boolean
  isCorrectable?: boolean
  onSingleClick: () => void
  onDoubleClick: () => void
}

const HOLD_MS = 300

export function ScoreCell({ cell, isActive, isSelected, isViable, isCorrectable, onSingleClick, onDoubleClick }: Props) {
  const isEmpty = cell.status === 'empty'
  const isCrossed = cell.status === 'crossed'
  const isScored = cell.status === 'scored'

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)
  const [pressing, setPressing] = useState(false)

  function startHold() {
    if (!isEmpty) return
    didLongPress.current = false
    setPressing(true)
    holdTimer.current = setTimeout(() => {
      didLongPress.current = true
      setPressing(false)
      onDoubleClick()
    }, HOLD_MS)
  }

  function endHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    setPressing(false)
    if (!didLongPress.current && isEmpty) {
      onSingleClick()
    }
    didLongPress.current = false
  }

  function cancelHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    setPressing(false)
    didLongPress.current = false
  }

  const scored = isScored ? (cell as Extract<CellState, { status: 'scored' }>).value : null

  // pressing + !isSelected: animate green→red over HOLD_MS
  // React batches setPressing(false) + parent's isSelected=true in the same flush on quick tap,
  // so the cell goes directly from animation to green with no white flash in between.
  const pressStyle = pressing && !isSelected
    ? { animation: `holdPress ${HOLD_MS}ms linear forwards` }
    : undefined

  function getCellClass() {
    if (isScored) return 'bg-slate-100 dark:bg-slate-600/60 border border-slate-300 dark:border-slate-500 text-slate-800 dark:text-slate-100 cursor-default'
    if (isCrossed) return 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 cursor-default'
    // Correction target: empty cell in the player being corrected (Task 18)
    if (isCorrectable) return 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 dark:border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer'
    if (!isActive) return 'bg-white dark:bg-slate-700 border border-dashed border-slate-200 dark:border-slate-600 cursor-default'
    if (isSelected) return 'bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 dark:border-emerald-400 cursor-pointer'
    if (pressing) return 'border-2 border-emerald-400 dark:border-emerald-500 cursor-pointer'
    if (isViable) return 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 cursor-pointer'
    return 'bg-white dark:bg-slate-700 border-2 border-indigo-400 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer'
  }

  return (
    <button
      type="button"
      disabled={!isEmpty}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={cancelHold}
      onTouchStart={(e) => { e.preventDefault(); startHold() }}
      onTouchEnd={(e) => { e.preventDefault(); endHold() }}
      onTouchCancel={cancelHold}
      onContextMenu={(e) => e.preventDefault()}
      style={pressStyle}
      className={`h-10 w-full flex items-center justify-center text-sm font-semibold rounded select-none ${getCellClass()}`}
    >
      {isScored && <span>{scored}</span>}
      {isCrossed && <span className="text-slate-400 dark:text-slate-500 text-base leading-none">✕</span>}
    </button>
  )
}
