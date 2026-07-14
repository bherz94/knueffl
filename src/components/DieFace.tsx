// Pip face for a die value (1–6), rendered on a 3×3 grid
// (index 0=top-left … 8=bottom-right). Shared by the dice modal and the
// floating dice pill so both show real dice faces rather than numbers.
const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

interface Props {
  value: number
  pipClass: string
  sizeClass?: string
  pipSizeClass?: string
}

export function DieFace({ value, pipClass, sizeClass = 'w-9 h-9', pipSizeClass = 'w-2 h-2' }: Props) {
  const active = new Set(PIP_LAYOUT[value] ?? [])
  return (
    <div className={`grid grid-cols-3 grid-rows-3 gap-0.5 ${sizeClass}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="flex items-center justify-center">
          {active.has(i) && <span className={`${pipSizeClass} rounded-full ${pipClass}`} />}
        </span>
      ))}
    </div>
  )
}
