interface Props {
  label: string
  colSpan: number
}

export function SectionHeader({ label, colSpan }: Props) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-2 px-3 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-800"
      >
        {label}
      </td>
    </tr>
  )
}
