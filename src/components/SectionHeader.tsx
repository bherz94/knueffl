interface Props {
  label: string
  colSpan: number
}

export function SectionHeader({ label, colSpan }: Props) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-2 px-3 text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-950/40 border-b border-primary-200 dark:border-primary-800"
      >
        {label}
      </td>
    </tr>
  )
}
