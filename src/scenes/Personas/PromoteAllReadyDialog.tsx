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
  count: number
  onConfirm: () => void
}

export function PromoteAllReadyDialog({ open, onOpenChange, count, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Promote {count} personas to Active</DialogTitle>
          <DialogDescription>
            {count} draft persona{count === 1 ? '' : 's'} completed{' '}
            {REQUIRED_VALIDATION_PASSES}/{REQUIRED_VALIDATION_PASSES} validation runs and will count
            toward the deploy gate pass rate. Continue?
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
            Promote all ({count})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
