import { cn } from '@/lib/utils'
import { EVALUATION_TYPE_CONFIG, type EvaluationType } from './constants'

export function EvaluationTypeBadge({ type }: { type: EvaluationType }) {
  const { icon: Icon, iconClassName, label } = EVALUATION_TYPE_CONFIG[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
        iconClassName
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
