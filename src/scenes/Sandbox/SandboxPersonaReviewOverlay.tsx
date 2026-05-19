import { useAtom, useAtomValue } from 'jotai'
import { personasAtom, sandboxReviewPersonaIdAtom } from '@/atoms'
import { getFixtureById } from '@/fixtures/fixtureRegistry'
import { PersonaForm } from '@/scenes/Personas/PersonaForm'
import type { PersonaFormData } from '@/types'

export function SandboxPersonaReviewOverlay() {
  const personaId = useAtomValue(sandboxReviewPersonaIdAtom)
  const [personas, setPersonas] = useAtom(personasAtom)
  const [, setReviewPersonaId] = useAtom(sandboxReviewPersonaIdAtom)

  if (!personaId) return null

  const persona = personas.find((p) => p.id === personaId)
  if (!persona) return null

  const fixture = getFixtureById(persona.fixtureId)
  const initialData: PersonaFormData = {
    personaKey: persona.personaKey,
    objectives: persona.objectives,
    evaluation: persona.evaluation,
    fixtureId: persona.fixtureId ?? null,
  }

  const close = () => setReviewPersonaId(null)

  const update = (data: PersonaFormData, status: 'draft' | 'active') => {
    setPersonas((prev) =>
      prev.map((p) =>
        p.id === personaId
          ? { ...p, ...data, status, sectionId: data.sectionId ?? p.sectionId }
          : p
      )
    )
    close()
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white">
      <PersonaForm
        mode="update"
        variant="review"
        initialData={initialData}
        reviewMeta={{
          sourceFlow: 'conversation',
          isDraft: persona.status === 'draft',
          mocksComplete: !!persona.fixtureId,
          fixtureSummary: fixture
            ? `Sandbox MVP — ${fixture.name} (product recommendation).`
            : 'No fixture assigned.',
          uncoveredCapabilities: [],
        }}
        onSubmit={async (data) => update(data, 'active')}
        onSaveDraft={async (data) => update(data, 'draft')}
        onCancel={close}
        onBack={close}
      />
    </div>
  )
}
