interface Props {
  label: string
  colSpan: number
}

export function SectionHeader({ label, colSpan }: Props) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-2 px-3 text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-b border-teal-200 dark:border-teal-800"
      >
        {label}
      </td>
    </tr>
  )
}
