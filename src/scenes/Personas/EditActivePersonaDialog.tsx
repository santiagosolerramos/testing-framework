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

export function EditActivePersonaDialog({
  open,
  onOpenChange,
  personaKey,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update persona</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="font-medium text-foreground">{personaKey}</strong> is{' '}
                <strong className="font-medium text-foreground">Active</strong> and counts toward
                the deploy gate pass rate.
              </p>
              <p>
                Saving will move it back to <strong className="font-medium">Draft</strong> and reset
                validation to 0/{REQUIRED_VALIDATION_PASSES}. You will need{' '}
                {REQUIRED_VALIDATION_PASSES} consecutive passing manual tests before promoting
                again.
              </p>
              <p className="font-medium text-foreground">Continue?</p>
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
            Update persona
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
