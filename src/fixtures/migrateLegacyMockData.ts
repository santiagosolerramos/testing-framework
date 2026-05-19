import type { Persona } from '@/types'
import { createLegacyFixture } from './fixtureUtils'
import { MOCK_FIXTURES, type FixtureDefinition } from './mockFixtures'
import { registerFixtures } from './fixtureRegistry'

export function migrateLegacyPersonas(personas: Persona[]): {
  personas: Persona[]
  fixtures: FixtureDefinition[]
} {
  const newFixtures: FixtureDefinition[] = []
  const migrated = personas.map((p) => {
    if (p.fixtureId) {
      const { mockData: _removed, ...rest } = p
      return rest
    }
    if (!p.mockData?.trim()) {
      const { mockData: _removed, ...rest } = p
      return rest
    }
    const legacy = createLegacyFixture(p.personaKey, p.mockData)
    newFixtures.push(legacy)
    const { mockData: _removed, ...rest } = p
    return { ...rest, fixtureId: legacy.id }
  })
  if (newFixtures.length > 0) {
    registerFixtures(newFixtures)
  }
  return { personas: migrated, fixtures: [...MOCK_FIXTURES, ...newFixtures] }
}
