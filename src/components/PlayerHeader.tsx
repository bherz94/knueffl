interface Props {
  name: string
  isActive: boolean
  index: number
}

const PLAYER_COLORS = [
  'bg-indigo-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500',
]

export function PlayerHeader({ name, isActive, index }: Props) {
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length]
  return (
    <div
      className={[
        'flex flex-col items-center gap-1 px-1 py-2 rounded-t-lg transition-all',
        isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : '',
      ].join(' ')}
    >
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {name.charAt(0).toUpperCase()}
      </div>
      <span className={[
        'text-xs font-semibold text-center leading-tight break-all max-w-[60px]',
        isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300',
      ].join(' ')}>
        {name}
      </span>
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
      )}
    </div>
  )
}
