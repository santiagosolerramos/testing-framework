import { useState } from 'react'
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import type { ParsedConversationTurn, PersonaWizardDraft } from '@/types/personaCreation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { WizardShell } from './WizardShell'
import { cn } from '@/lib/utils'

type Props = {
  draft: PersonaWizardDraft
  onBack: () => void
  onClose: () => void
  onContinue: (turns: ParsedConversationTurn[]) => void
}

export function ThumbsConversationStep({ draft, onBack, onClose, onContinue }: Props) {
  const [turns, setTurns] = useState<ParsedConversationTurn[]>(
    draft.conversationTurns || []
  )
  const [editingId, setEditingId] = useState<string | null>(null)

  const updateTurn = (id: string, patch: Partial<ParsedConversationTurn>) => {
    setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const botTurns = turns.filter((t) => t.role === 'bot')

  return (
    <WizardShell
      title="Review bot turns"
      subtitle="Thumbs up = expected behavior. Thumbs down = flag an exception."
      stepLabel="Step 2 of 4"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={() => onContinue(turns)}>
            Continue →
          </Button>
        </div>
      }
    >
      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
        <p className="font-medium text-gray-900">Inferred goal</p>
        <p className="mt-1">{draft.goal}</p>
        {draft.detectedEntities.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            Entities: {draft.detectedEntities.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {turns.map((turn) => (
          <div
            key={turn.id}
            className={cn(
              'flex gap-3 rounded-lg border p-3',
              turn.role === 'user' ? 'border-gray-100 bg-white' : 'border-gray-200 bg-gray-50'
            )}
          >
            <span className="w-20 shrink-0 text-xs font-semibold uppercase text-gray-500">
              {turn.role === 'user' ? 'User' : 'Bot'}
            </span>
            <p className="min-w-0 flex-1 text-sm text-gray-800">{turn.text}</p>
            {turn.role === 'bot' && (
              <div className="flex shrink-0 flex-col items-end gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn('h-8 w-8', turn.thumb === 'up' && 'bg-green-100 text-green-700')}
                    onClick={() => {
                      updateTurn(turn.id, { thumb: 'up', correction: undefined })
                      setEditingId(null)
                    }}
                  >
                    <ThumbsUpIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn('h-8 w-8', turn.thumb === 'down' && 'bg-red-100 text-red-700')}
                    onClick={() => {
                      updateTurn(turn.id, { thumb: 'down' })
                      setEditingId(turn.id)
                    }}
                  >
                    <ThumbsDownIcon className="h-4 w-4" />
                  </Button>
                </div>
                {turn.thumb === 'down' && editingId === turn.id && (
                  <Textarea
                    rows={2}
                    className="w-48 text-xs"
                    placeholder="What should happen instead?"
                    value={turn.correction || ''}
                    onChange={(e) => updateTurn(turn.id, { correction: e.target.value })}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {botTurns.length === 0 && (
        <p className="text-sm text-gray-500">No bot turns detected in this conversation.</p>
      )}
    </WizardShell>
  )
}
