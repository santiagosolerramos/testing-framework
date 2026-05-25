import { cn } from '@/lib/utils'
import { REQUIRED_VALIDATION_PASSES } from './personaStatus'

type Props = {
  passes: number
  className?: string
  /** Shows "Validating" label */
  showLabel?: boolean
  /** Full phrase: "2/3 pasadas consecutivas" */
  detailed?: boolean
}

export function ValidationProgressBadge({
  passes,
  className,
  showLabel,
  detailed,
}: Props) {
  const ready = passes >= REQUIRED_VALIDATION_PASSES

  const countText = detailed
    ? `${passes}/${REQUIRED_VALIDATION_PASSES} pasadas consecutivas`
    : `${passes}/${REQUIRED_VALIDATION_PASSES}`

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold',
        ready
          ? 'bg-green-100 text-green-800'
          : 'border border-amber-300 bg-amber-50 text-amber-900',
        className
      )}
      title={
        ready
          ? 'Listo para promover a Active'
          : `Validating — faltan ${REQUIRED_VALIDATION_PASSES - passes} pasadas consecutivas`
      }
    >
      {showLabel && !ready && (
        <span className="uppercase tracking-wide text-amber-800/80">Validating</span>
      )}
      {showLabel && ready && (
        <span className="uppercase tracking-wide text-green-800/80">Validated</span>
      )}
      <span className="tabular-nums">{countText}</span>
    </span>
  )
}
