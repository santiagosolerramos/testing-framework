import { cn } from '@/lib/utils'

type Props = {
  variant?: 'ring'
  className?: string
}

export function Spinner({ variant = 'ring', className }: Props) {
  if (variant === 'ring') {
    return (
      <span
        className={cn(
          'inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500',
          className
        )}
        aria-hidden
      />
    )
  }
  return null
}
