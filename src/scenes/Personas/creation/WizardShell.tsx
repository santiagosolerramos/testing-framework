import type { ReactNode } from 'react'
import { ArrowLeftIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  title: string
  subtitle?: string
  stepLabel?: string
  onBack?: () => void
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function WizardShell({
  title,
  subtitle,
  stepLabel,
  onBack,
  onClose,
  children,
  footer,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-6">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stepLabel && <span className="text-xs text-gray-400">{stepLabel}</span>}
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-2xl px-6 py-8">{children}</div>
      </div>
      {footer && (
        <footer className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">{footer}</footer>
      )}
    </div>
  )
}
