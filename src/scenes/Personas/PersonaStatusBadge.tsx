import type { PersonaStatus } from '@/types'
import { cn } from '@/lib/utils'

type Props = {
  status: PersonaStatus
  className?: string
}

export function PersonaStatusBadge({ status, className }: Props) {
  const isDraft = status === 'draft'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        isDraft
          ? 'border border-gray-300 bg-white text-gray-600'
          : 'border border-transparent bg-green-700 text-white',
        className
      )}
    >
      {isDraft ? 'Draft' : 'Active'}
    </span>
  )
}
