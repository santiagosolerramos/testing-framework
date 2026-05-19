import { AlertTriangleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onContinueAsFaq: () => void
  onReclassify: () => void
  onCancel: () => void
}

export function TransactionalWarningDialog({
  open,
  onContinueAsFaq,
  onReclassify,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            Transactional scenario detected
          </DialogTitle>
          <DialogDescription>
            This scenario may trigger a transactional flow (CEP, checkout, CPF, etc.) but is
            marked as FAQ. Continue as FAQ or reclasify to a transactional SOP?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={onContinueAsFaq}>
            Continue as FAQ
          </Button>
          <Button type="button" onClick={onReclassify}>
            Reclassify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
