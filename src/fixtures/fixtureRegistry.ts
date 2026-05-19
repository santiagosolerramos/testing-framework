import { MOCK_FIXTURES, type FixtureDefinition } from './mockFixtures'

let extraFixtures: FixtureDefinition[] = []

export function registerFixtures(fixtures: FixtureDefinition[]): void {
  const ids = new Set([...MOCK_FIXTURES, ...extraFixtures].map((f) => f.id))
  for (const f of fixtures) {
    if (!ids.has(f.id)) {
      extraFixtures.push(f)
      ids.add(f.id)
    }
  }
}

export function getAllFixtures(): FixtureDefinition[] {
  return [...MOCK_FIXTURES, ...extraFixtures]
}

export function getFixtureById(id: string | null | undefined): FixtureDefinition | undefined {
  if (!id) return undefined
  return getAllFixtures().find((f) => f.id === id)
}
