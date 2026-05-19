import {
  FlagIcon,
  GitForkIcon,
  PickaxeIcon,
  ScaleIcon,
  SearchIcon,
  type LucideIcon,
} from 'lucide-react'

export type EvaluationType =
  | 'endingReason'
  | 'inferenceValue'
  | 'toolCall'
  | 'routing'
  | 'score'

export const EVALUATION_TYPE_CONFIG: Record<
  EvaluationType,
  { label: string; icon: LucideIcon; iconClassName: string }
> = {
  endingReason: {
    label: 'Ending reason',
    icon: FlagIcon,
    iconClassName: 'bg-amber-50 text-amber-500',
  },
  inferenceValue: {
    label: 'Inference value',
    icon: ScaleIcon,
    iconClassName: 'bg-green-50 text-green-500',
  },
  toolCall: {
    label: 'Tool call',
    icon: PickaxeIcon,
    iconClassName: 'bg-orange-50 text-orange-500',
  },
  routing: {
    label: 'Routing',
    icon: GitForkIcon,
    iconClassName: 'bg-blue-50 text-blue-500',
  },
  score: {
    label: 'Score',
    icon: SearchIcon,
    iconClassName: 'bg-purple-50 text-purple-500',
  },
}

/** Only score is enabled in the product today. */
export const ENABLED_EVALUATION_TYPES: EvaluationType[] = ['score']
