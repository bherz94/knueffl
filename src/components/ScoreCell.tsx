import { useRef, useState } from 'react'
import type { CellState } from '../types/game'

interface Props {
  cell: CellState
  isActive: boolean
  onSingleClick: () => void
  onDoubleClick: () => void // cross out (long press)
}

const HOLD_MS = 300

export function ScoreCell({ cell, isActive, onSingleClick, onDoubleClick }: Props) {
  const isEmpty = cell.status === 'empty'
  const isCrossed = cell.status === 'crossed'
  const isScored = cell.status === 'scored'

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)
  const [holding, setHolding] = useState(false)

  function startHold() {
    if (!isEmpty) return
    didLongPress.current = false
    setHolding(true)
    holdTimer.current = setTimeout(() => {
      didLongPress.current = true
      setHolding(false)
      onDoubleClick()
    }, HOLD_MS)
  }

  function endHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    setHolding(false)
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
    setHolding(false)
    didLongPress.current = false
  }

  const scored = isScored ? (cell as Extract<CellState, { status: 'scored' }>) : null

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
      className={[
        'h-10 w-full flex items-center justify-center text-sm font-semibold rounded transition-all select-none',
        isEmpty && isActive && !holding
          ? 'bg-white dark:bg-slate-700 border-2 border-indigo-400 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer'
          : '',
        isEmpty && isActive && holding
          ? 'bg-rose-100 dark:bg-rose-900/40 border-2 border-rose-400 dark:border-rose-500 cursor-pointer scale-95'
          : '',
        isEmpty && !isActive
          ? 'bg-white dark:bg-slate-700 border border-dashed border-slate-200 dark:border-slate-600 cursor-default'
          : '',
        isScored
          ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 cursor-default'
          : '',
        isCrossed
          ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 cursor-default'
          : '',
      ].join(' ')}
    >
      {isScored && <span>{scored!.value}</span>}
      {isCrossed && <span className="text-slate-400 dark:text-slate-500 text-base leading-none">✕</span>}
    </button>
  )
}
