import type { Persona } from '@/types'

export function isNPlusOnePersona(persona: Persona): boolean {
  return persona.testKind === 'n-plus-one'
}
