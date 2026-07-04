interface Props {
  value: number | null
  highlight?: boolean
  isActive?: boolean
  isWinner?: boolean
}

export function AutoCell({ value, highlight = false, isActive = false, isWinner = false }: Props) {
  return (
    <div
      className={[
        'h-10 flex items-center justify-center text-sm font-semibold rounded transition-colors',
        isWinner
          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
          : highlight
            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        isActive ? 'ring-1 ring-indigo-400 dark:ring-indigo-500' : '',
      ].join(' ')}
    >
      {value !== null ? value : '—'}
    </div>
  )
}
