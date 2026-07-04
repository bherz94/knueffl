import { useRef } from 'react'
import type { CellState } from '../types/game'

interface Props {
  cell: CellState
  isActive: boolean
  onSingleClick: () => void
  onDoubleClick: () => void
}

export function ScoreCell({ cell, isActive, onSingleClick, onDoubleClick }: Props) {
  const isEmpty = cell.status === 'empty'
  const isCrossed = cell.status === 'crossed'
  const isScored = cell.status === 'scored'

  const lastTap = useRef<number>(0)
  const singleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleClick() {
    if (!isEmpty) return
    const now = Date.now()
    const gap = now - lastTap.current
    lastTap.current = now

    if (gap < 300) {
      // double tap/click
      if (singleTimer.current) {
        clearTimeout(singleTimer.current)
        singleTimer.current = null
      }
      onDoubleClick()
    } else {
      // wait briefly in case a second tap follows
      singleTimer.current = setTimeout(() => {
        singleTimer.current = null
        onSingleClick()
      }, 300)
    }
  }

  const scored = isScored ? (cell as Extract<CellState, { status: 'scored' }>) : null

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isEmpty}
      className={[
        'h-10 w-full flex items-center justify-center text-sm font-semibold rounded transition-all select-none',
        isEmpty && isActive
          ? 'bg-white dark:bg-slate-700 border-2 border-indigo-400 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer'
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
