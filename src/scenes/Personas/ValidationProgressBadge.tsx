import { cn } from '@/lib/utils'
import { REQUIRED_VALIDATION_PASSES } from './personaStatus'

type Props = {
  passes: number
  className?: string
}

export function ValidationProgressBadge({ passes, className }: Props) {
  const ready = passes >= REQUIRED_VALIDATION_PASSES

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
        ready
          ? 'bg-green-100 text-green-800'
          : 'border border-amber-300 bg-amber-50 text-amber-900',
        className
      )}
      title={
        ready
          ? 'Ready — use Promote to Active'
          : `${REQUIRED_VALIDATION_PASSES - passes} more consecutive passing test(s) required`
      }
    >
      {passes}/{REQUIRED_VALIDATION_PASSES}
    </span>
  )
}
