const PLAYER_COLORS = [
  'bg-teal-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500',
]

interface Props {
  name: string
  index: number
  avatar?: string
  /** Tailwind size classes, e.g. 'w-8 h-8'. Text sizing is passed via textClass. */
  sizeClass?: string
  textClass?: string
  className?: string
}

/**
 * Circular player avatar: renders the profile image when present, otherwise a
 * colored disc with the name's initial. Shared by the scoreboard header and the
 * turn indicator so both stay in sync.
 */
export function PlayerAvatar({
  name,
  index,
  avatar,
  sizeClass = 'w-8 h-8',
  textClass = 'text-xs',
  className = '',
}: Props) {
  const base = `${sizeClass} rounded-full flex-shrink-0 ${className}`
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${base} object-cover`}
      />
    )
  }
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length]
  return (
    <div className={`${base} ${color} flex items-center justify-center text-white ${textClass} font-bold uppercase`}>
      {name.trim().slice(0, 2)}
    </div>
  )
}
