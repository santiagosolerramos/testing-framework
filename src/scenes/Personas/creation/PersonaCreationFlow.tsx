import { useAtom } from 'jotai'
import { personaCreationAtom } from '@/atoms/personaCreation'
import { CreatePersonaEntryModal } from './CreatePersonaEntryModal'
import { DescriptionWizard } from './DescriptionWizard'
import { ConversationWizard } from './ConversationWizard'

export function PersonaCreationFlow() {
  const [creation, setCreation] = useAtom(personaCreationAtom)

  const close = () => setCreation(null)

  if (creation?.kind === 'description') {
    return <DescriptionWizard onClose={close} />
  }

  if (creation?.kind === 'conversation') {
    return (
      <ConversationWizard
        onClose={close}
        preloadedSessionId={creation.preloadedSessionId}
      />
    )
  }

  return (
    <CreatePersonaEntryModal
      open={creation?.kind === 'entry-modal'}
      onOpenChange={(open) => {
        if (!open) setCreation(null)
        else setCreation({ kind: 'entry-modal' })
      }}
    />
  )
}
