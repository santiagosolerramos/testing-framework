import { useMemo, useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { personasAtom, sandboxReviewPersonaIdAtom } from '@/atoms'
import { getFixtureById } from '@/fixtures/fixtureRegistry'
import { EditActivePersonaDialog } from '@/scenes/Personas/EditActivePersonaDialog'
import { PersonaForm } from '@/scenes/Personas/PersonaForm'
import { applyPersonaFormSave, isPersonaActive } from '@/scenes/Personas/personaStatus'
import type { PersonaFormData } from '@/types'

export function SandboxPersonaReviewOverlay() {
  const personaId = useAtomValue(sandboxReviewPersonaIdAtom)
  const [personas, setPersonas] = useAtom(personasAtom)
  const [, setReviewPersonaId] = useAtom(sandboxReviewPersonaIdAtom)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingData, setPendingData] = useState<PersonaFormData | null>(null)

  const persona = personaId ? personas.find((p) => p.id === personaId) : undefined
  const wasActiveOnOpen = useMemo(
    () => (persona ? isPersonaActive(persona) : false),
    [persona?.id, persona?.status]
  )

  if (!personaId || !persona) return null

  const fixture = getFixtureById(persona.fixtureId)
  const initialData: PersonaFormData = {
    personaKey: persona.personaKey,
    objectives: persona.objectives,
    evaluation: persona.evaluation,
    fixtureId: persona.fixtureId ?? null,
    sectionId: persona.sectionId ?? 'section-1',
  }

  const close = () => setReviewPersonaId(null)

  const commitSave = (data: PersonaFormData) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === personaId ? applyPersonaFormSave(p, data) : p))
    )
    setPendingData(null)
    setConfirmOpen(false)
    close()
  }

  const save = (data: PersonaFormData) => {
    if (wasActiveOnOpen) {
      setPendingData(data)
      setConfirmOpen(true)
      return
    }
    commitSave(data)
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white">
      <PersonaForm
        mode="update"
        variant="review"
        initialData={initialData}
        editRevertWarning={wasActiveOnOpen}
        reviewMeta={{
          sourceFlow: 'conversation',
          isDraft: true,
          mocksComplete: !!persona.fixtureId,
          fixtureSummary: fixture
            ? `Sandbox MVP — ${fixture.name} (product recommendation).`
            : 'No fixture assigned.',
          uncoveredCapabilities: [],
        }}
        onSubmit={save}
        onSaveDraft={save}
        onCancel={close}
        onBack={close}
      />
      <EditActivePersonaDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmOpen(false)
            setPendingData(null)
          }
        }}
        personaKey={persona.personaKey}
        onConfirm={() => pendingData && commitSave(pendingData)}
      />
    </div>
  )
}
