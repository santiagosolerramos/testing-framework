import { ulid } from 'ulid'
import type { Persona, PersonaFormData, PersonaStatus } from '@/types'

/** Mock gate: consecutive manual test passes before promotion is recommended (no auto-promote in MVP). */
export const REQUIRED_VALIDATION_PASSES = 3

/** Legacy personas without status are treated as Active (pre–draft feature seed data). */
export function getPersonaStatus(persona: Persona): PersonaStatus {
  return persona.status ?? 'active'
}

export function isPersonaDraft(persona: Persona): boolean {
  return getPersonaStatus(persona) === 'draft'
}

export function isPersonaActive(persona: Persona): boolean {
  return getPersonaStatus(persona) === 'active'
}

export function setPersonaStatus(
  personas: Persona[],
  personaId: string,
  status: PersonaStatus
): Persona[] {
  return personas.map((p) =>
    p.id === personaId
      ? {
          ...p,
          status,
          ...(status === 'active'
            ? { validationPasses: undefined }
            : { validationPasses: p.validationPasses ?? 0 }),
        }
      : p
  )
}

export function getValidationPasses(persona: Persona): number {
  return persona.validationPasses ?? 0
}

export function isReadyToPromote(persona: Persona): boolean {
  return isPersonaDraft(persona) && getValidationPasses(persona) >= REQUIRED_VALIDATION_PASSES
}

/** Copy an active persona into a new draft row (original stays active). */
export function duplicatePersonaAsDraft(persona: Persona): Persona {
  const copySuffix = ' (copy)'
  const baseKey = persona.personaKey.replace(/\s+\(copy\)$/i, '')
  return {
    ...persona,
    id: ulid(),
    personaKey: `${baseKey}${copySuffix}`,
    status: 'draft',
    validationPasses: 0,
    createdAt: Date.now(),
  }
}

export function recordValidationResult(
  personas: Persona[],
  personaId: string,
  passed: boolean
): Persona[] {
  return personas.map((p) => {
    if (p.id !== personaId || !isPersonaDraft(p)) return p
    const prev = getValidationPasses(p)
    const next = passed ? Math.min(prev + 1, REQUIRED_VALIDATION_PASSES) : 0
    return { ...p, validationPasses: next }
  })
}

export function promoteAllReadyDrafts(personas: Persona[]): Persona[] {
  return personas.map((p) =>
    isReadyToPromote(p)
      ? { ...p, status: 'active' as const, validationPasses: undefined }
      : p
  )
}

export function countReadyToPromote(personas: Persona[]): number {
  return personas.filter(isReadyToPromote).length
}

/** MVP: any saved edit demotes to Draft and resets validation. */
export function applyPersonaFormSave(persona: Persona, data: PersonaFormData): Persona {
  return {
    ...persona,
    ...data,
    sectionId: data.sectionId ?? undefined,
    status: 'draft',
    validationPasses: 0,
  }
}
