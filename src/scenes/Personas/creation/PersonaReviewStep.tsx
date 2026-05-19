import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { ulid } from 'ulid'
import { personasAtom, selectedPersonaIdAtom } from '@/atoms'
import type { Persona } from '@/types'
import type { PersonaWizardDraft } from '@/types/personaCreation'
import { wizardDraftToFormData } from '@/types/personaCreation'
import { PersonaForm } from '../PersonaForm'
import { inferSectionId } from '../personaSections'

type Props = {
  draft: PersonaWizardDraft
  onBack: () => void
  onClose: () => void
  onDone: () => void
}

export function PersonaReviewStep({ draft, onBack, onClose, onDone }: Props) {
  const setPersonas = useSetAtom(personasAtom)
  const setSelectedId = useSetAtom(selectedPersonaIdAtom)

  const save = useCallback(
    (data: ReturnType<typeof wizardDraftToFormData>, asDraft: boolean) => {
      const newPersona: Persona = {
        id: ulid(),
        ...data,
        status: asDraft ? 'draft' : 'active',
        sectionId: data.sectionId ?? inferSectionId(data.fixtureId),
        validationPasses: asDraft ? 0 : undefined,
        createdAt: Date.now(),
      }
      setPersonas((prev) => [...prev, newPersona])
      setSelectedId(newPersona.id)
      onDone()
    },
    [setPersonas, setSelectedId, onDone]
  )

  return (
    <PersonaForm
      mode="create"
      variant="review"
      initialData={wizardDraftToFormData(draft)}
      reviewMeta={{
        sourceFlow: draft.sourceFlow === 'sandbox' ? 'conversation' : draft.sourceFlow,
        isDraft: draft.isDraft,
        mocksComplete: draft.mocksComplete,
        fixtureSummary: draft.fixtureSummary,
        uncoveredCapabilities: draft.uncoveredCapabilities,
      }}
      onSubmit={async (data) => save(data, !draft.mocksComplete)}
      onSaveDraft={async (data) => save(data, true)}
      onCancel={onClose}
      onBack={onBack}
    />
  )
}
