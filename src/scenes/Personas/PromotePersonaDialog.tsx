import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { REQUIRED_VALIDATION_PASSES } from './personaStatus'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  personaKey: string
  onConfirm: () => void
}

export function PromotePersonaDialog({ open, onOpenChange, personaKey, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Promote to Active</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="font-medium text-foreground">{personaKey}</strong> completed{' '}
                {REQUIRED_VALIDATION_PASSES}/{REQUIRED_VALIDATION_PASSES} consecutive passing tests
                and will count toward the deploy gate pass rate.
              </p>
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-900">
                This persona will run in automated suite tests after promotion.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-purple-700 hover:bg-purple-800"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Promote to Active
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
