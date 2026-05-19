import {
  FileTextIcon,
  FlaskConicalIcon,
  MessageSquareIcon,
  PenLineIcon,
} from 'lucide-react'
import { useSetAtom } from 'jotai'
import { personaFormModeAtom, sidebarTabAtom } from '@/atoms'
import { personaCreationAtom } from '@/atoms/personaCreation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const OPTIONS = [
  {
    id: 'description' as const,
    title: 'From description',
    description:
      'Describe the scenario in plain language. We match fixtures for mock data (transactional + FAQ/Handover).',
    icon: FileTextIcon,
  },
  {
    id: 'conversation' as const,
    title: 'From conversation',
    description: 'Session ID from logs or paste a User/Assistant transcript (FAQ/Handover MVP).',
    icon: MessageSquareIcon,
  },
  {
    id: 'sandbox' as const,
    title: 'From Sandbox',
    description: 'Chat live with the agent, then create a persona from that session.',
    icon: FlaskConicalIcon,
  },
  {
    id: 'manual' as const,
    title: 'Manual',
    description: 'Full control — profile, goal, evaluations, and mock data by hand.',
    icon: PenLineIcon,
  },
]

export function CreatePersonaEntryModal({ open, onOpenChange }: Props) {
  const setCreation = useSetAtom(personaCreationAtom)
  const setFormMode = useSetAtom(personaFormModeAtom)
  const setTab = useSetAtom(sidebarTabAtom)

  const handlePick = (id: (typeof OPTIONS)[number]['id']) => {
    onOpenChange(false)
    if (id === 'manual') {
      setCreation(null)
      setFormMode('create')
      return
    }
    if (id === 'description') {
      setCreation({ kind: 'description' })
      return
    }
    if (id === 'sandbox') {
      setCreation({ kind: 'sandbox-active' })
      setTab('chat')
      return
    }
    setCreation({ kind: 'conversation', preloadedSessionId: null })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create persona</DialogTitle>
          <DialogDescription>
            All paths converge on Review &amp; Save with the same persona JSON. Fixture library
            handles mock data — we never invent it silently.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {OPTIONS.map(({ id, title, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handlePick(id)}
              className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-50/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{description}</p>
              </div>
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}
