import type { Persona } from '@/types'
import { PersonaStatusBadge } from './PersonaStatusBadge'
import { ValidationProgressBadge } from './ValidationProgressBadge'
import { getPersonaStatus, getValidationPasses, isReadyToPromote } from './personaStatus'

export function PersonaLifecycleStatus({ persona }: { persona: Persona }) {
  const status = getPersonaStatus(persona)
  const passes = getValidationPasses(persona)

  if (status === 'active') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-green-800">
        <PersonaStatusBadge status="active" />
        <span className="text-gray-600">Included in automated suite · deploy gate pass rate</span>
      </div>
    )
  }

  const ready = isReadyToPromote(persona)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PersonaStatusBadge status="draft" />
      <ValidationProgressBadge passes={passes} showLabel detailed />
      {ready && (
        <span className="text-xs font-medium text-green-700">Ready to promote</span>
      )}
    </div>
  )
}
