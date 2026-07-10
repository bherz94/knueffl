interface Props {
  value: number | null
  highlight?: boolean
  isWinner?: boolean
}

export function AutoCell({ value, highlight = false, isWinner = false }: Props) {
  return (
    <div
      className={[
        'h-10 flex items-center justify-center text-sm font-semibold rounded transition-colors',
        isWinner
          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
          : highlight
            ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200'
            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400',
      ].join(' ')}
    >
      {value !== null ? value : '—'}
    </div>
  )
}
