import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ENABLED_EVALUATION_TYPES,
  EVALUATION_TYPE_CONFIG,
} from './evaluation/constants'
import { EvaluationTypeBadge } from './evaluation/EvaluationTypeBadge'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (prompt: string) => void
}

export function EvaluationFormModal({ open, onOpenChange, onSave }: Props) {
  const [prompt, setPrompt] = useState('')

  const handleSave = () => {
    if (!prompt.trim()) return
    onSave(prompt.trim())
    setPrompt('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto p-6 sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add evaluation</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2">
              {ENABLED_EVALUATION_TYPES.map((t) => (
                <EvaluationTypeBadge key={t} type={t} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Only {EVALUATION_TYPE_CONFIG.score.label.toLowerCase()} evaluations are enabled.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="eval-prompt">Prompt</Label>
            <Textarea
              id="eval-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Output 1 if the agent meets the criteria, otherwise 0."
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!prompt.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
