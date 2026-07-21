import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { N_PLUS_ONE_JOURNEY_STEPS } from './nPlusOneJourneySteps'

type Props = {
  open: boolean
  stepIndex: number
  onStepChange: (index: number) => void
  onClose: () => void
  /** Hide back on first step; last step shows "Listo" */
  surface?: 'admin' | 'framework'
}

export function NPlusOneJourneyModal({
  open,
  stepIndex,
  onStepChange,
  onClose,
  surface,
}: Props) {
  const steps = surface
    ? N_PLUS_ONE_JOURNEY_STEPS.filter((s) => s.surface === surface)
    : N_PLUS_ONE_JOURNEY_STEPS

  const step = N_PLUS_ONE_JOURNEY_STEPS[stepIndex]
  if (!step) return null

  const displayIndex = surface
    ? steps.findIndex((s) => s.id === step.id)
    : stepIndex
  const isFirst = stepIndex === 0
  const isLast = stepIndex === N_PLUS_ONE_JOURNEY_STEPS.length - 1

  const globalStepNumber = stepIndex + 1
  const totalSteps = N_PLUS_ONE_JOURNEY_STEPS.length

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[min(90vh,640px)] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-700">
                Guía N+1 · paso {globalStepNumber} de {totalSteps}
              </p>
              <DialogHeader className="space-y-1 p-0 text-left">
                <DialogTitle className="text-lg text-gray-900">{step.title}</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-gray-600">
                  {step.summary}
                </DialogDescription>
              </DialogHeader>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar guía"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-1">
            {N_PLUS_ONE_JOURNEY_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i <= stepIndex ? 'bg-purple-600' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>

        <div className="max-h-[min(50vh,320px)] overflow-auto px-6 py-4">
          <ul className="space-y-2.5">
            {step.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                {bullet}
              </li>
            ))}
          </ul>
          {step.actionHint && (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              <span className="font-semibold">En esta pantalla: </span>
              {step.actionHint}
            </p>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500"
            onClick={onClose}
          >
            Saltar guía
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={isFirst}
              onClick={() => onStepChange(stepIndex - 1)}
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              Atrás
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1 bg-purple-700 hover:bg-purple-800"
              onClick={() => {
                if (isLast) onClose()
                else onStepChange(stepIndex + 1)
              }}
            >
              {isLast ? 'Listo' : 'Siguiente'}
              {!isLast && <ChevronRightIcon className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </DialogFooter>
        {surface && displayIndex >= 0 && (
          <p className="sr-only">
            Paso {displayIndex + 1} de {steps.length} en {surface}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
