import type { FixtureDefinition } from './mockFixtures'

export type FixtureToolPreview = {
  toolId: string
  resultJson: string
}

/** Parse fixture JSON into per-tool read-only preview rows */
export function parseFixtureToolResults(fixture: FixtureDefinition): FixtureToolPreview[] {
  try {
    const parsed = JSON.parse(fixture.mockData) as {
      tools?: Record<string, unknown> | Array<{ name?: string; id?: string; result?: unknown }>
    }
    const tools = parsed.tools
    if (tools && !Array.isArray(tools) && typeof tools === 'object') {
      return Object.entries(tools).map(([toolId, result]) => ({
        toolId,
        resultJson: JSON.stringify(result, null, 2),
      }))
    }
    if (Array.isArray(tools)) {
      return tools.map((entry, i) => ({
        toolId: entry.name || entry.id || `tool_${i + 1}`,
        resultJson: JSON.stringify(entry.result ?? entry, null, 2),
      }))
    }
  } catch {
    /* fall through */
  }
  return []
}

export function legacyFixtureId(personaKey: string): string {
  const slug = personaKey
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48)
  return `legacy_${slug || 'persona'}_mocks`
}

export function createLegacyFixture(personaKey: string, mockData: string): FixtureDefinition {
  return {
    id: legacyFixtureId(personaKey),
    name: legacyFixtureId(personaKey),
    description: `Auto-migrated from inline mock data for persona "${personaKey}"`,
    intents: [],
    coveredCapabilities: ['legacy mock data'],
    internalToolIds: [],
    mockData,
    isLegacy: true,
    isAutoMigrated: true,
  }
}
