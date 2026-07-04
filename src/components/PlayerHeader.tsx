interface Props {
  name: string
  isActive: boolean
  index: number
  place?: number
}

const PLAYER_COLORS = [
  'bg-indigo-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500',
]

const PLACE_MEDALS = ['🥇', '🥈', '🥉']

export function PlayerHeader({ name, isActive, index, place }: Props) {
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length]
  return (
    <div
      className={[
        'flex flex-col items-center gap-1 px-1 py-2 rounded-t-lg transition-all',
        isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : '',
      ].join(' ')}
    >
      <div className="relative">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {name.charAt(0).toUpperCase()}
        </div>
        {place !== undefined && (
          <div className={[
            'absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center leading-none',
            place === 1
              ? 'bg-amber-400 text-amber-900'
              : place === 2
                ? 'bg-slate-400 text-white'
                : place === 3
                  ? 'bg-orange-700 text-white'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200',
          ].join(' ')}>
            {place <= 3 ? PLACE_MEDALS[place - 1] : place}
          </div>
        )}
      </div>
      <span className={[
        'text-xs font-semibold text-center leading-tight break-all max-w-[60px]',
        isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300',
      ].join(' ')}>
        {name}
      </span>
      {isActive && place === undefined && (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
      )}
    </div>
  )
}
