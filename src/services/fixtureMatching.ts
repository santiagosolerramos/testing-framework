import type { FixtureMatchState, SopHint } from '@/types/personaCreation'
import { getFixtureById, getAllFixtures } from '@/fixtures/fixtureRegistry'
import type { FixtureDefinition } from '@/fixtures/mockFixtures'

export type ParsedIntent = {
  text: string
  entities: string[]
  resolvedSop: SopHint
  requiredCapabilities: string[]
}

function scoreFixture(fixture: FixtureDefinition, text: string, hints: SopHint[]): number {
  const lower = text.toLowerCase()
  let score = 0
  for (const intent of fixture.intents) {
    if (lower.includes(intent.toLowerCase())) score += 2
  }
  if (hints.includes('faq') && fixture.id === 'faq_default') score += 3
  if (hints.includes('handover') && fixture.id === 'handover_default') score += 3
  if (hints.includes('orderStatus') && fixture.id === 'order_status_default') score += 3
  if (hints.includes('checkout') && fixture.id === 'checkout_cep_default') score += 3
  return score
}

export function inferRequiredCapabilities(text: string, sop: SopHint): string[] {
  const lower = text.toLowerCase()
  const caps: string[] = []
  if (sop === 'faq') caps.push('knowledge base answers')
  if (sop === 'handover') caps.push('human handover')
  if (sop === 'orderStatus' || lower.includes('pedido') || lower.includes('order')) {
    caps.push('order lookup', 'delivery tracking')
  }
  if (sop === 'checkout' || lower.includes('cep') || lower.includes('checkout')) {
    caps.push('CEP validation', 'checkout steps')
  }
  return [...new Set(caps)]
}

export function matchFixtures(
  intent: ParsedIntent,
  sopHints: Exclude<SopHint, 'auto'>[]
): FixtureMatchState {
  const hints = sopHints.length ? sopHints : []
  const scored = getAllFixtures()
    .map((f) => ({
      fixture: f,
      confidence: Math.min(0.99, scoreFixture(f, intent.text, hints) / 10 + 0.35),
    }))
    .filter((s) => s.confidence > 0.4)
    .sort((a, b) => b.confidence - a.confidence)

  const required = intent.requiredCapabilities

  const toCandidate = (fixture: FixtureDefinition, confidence: number) => {
    const covered = fixture.coveredCapabilities.filter((c) => required.includes(c))
    const uncovered = required.filter((c) => !fixture.coveredCapabilities.includes(c))
    return {
      fixtureId: fixture.id,
      fixtureName: fixture.name,
      confidence,
      coveredCapabilities: covered.length ? covered : fixture.coveredCapabilities,
      uncoveredCapabilities: uncovered,
      previewJson: fixture.mockData,
    }
  }

  if (required.length === 0) {
    return { kind: 'none', requiredCapabilities: [] }
  }

  if (scored.length === 0) {
    return { kind: 'none', requiredCapabilities: required }
  }

  if (scored.length === 1) {
    const c = toCandidate(scored[0].fixture, scored[0].confidence)
    return {
      kind: 'single',
      match: c,
      selectedFixtureId: c.fixtureId,
      requiredCapabilities: required,
    }
  }

  return {
    kind: 'multiple',
    matches: scored.slice(0, 4).map((s) => toCandidate(s.fixture, s.confidence)),
    selectedFixtureId: null,
    requiredCapabilities: required,
  }
}

export function applyFixtureToDraft(fixtureId: string | null): {
  mocksComplete: boolean
  fixtureSummary: string
  uncovered: string[]
} {
  if (!fixtureId) {
    return {
      mocksComplete: false,
      fixtureSummary: 'No fixture assigned — this persona will not run until resolved.',
      uncovered: [],
    }
  }
  const fixture = getFixtureById(fixtureId)
  if (!fixture) {
    return {
      mocksComplete: false,
      fixtureSummary: 'No fixture assigned.',
      uncovered: [],
    }
  }
  const capCount = fixture.coveredCapabilities.length
  return {
    mocksComplete: true,
    fixtureSummary: `${capCount} capability${capCount === 1 ? '' : 'ies'} covered by ${fixture.name}.`,
    uncovered: [],
  }
}

export function buildFixtureReviewSummary(
  fixtureId: string | null,
  requiredCapabilities: string[]
): { summary: string; uncovered: string[]; mocksComplete: boolean } {
  const fixture = fixtureId ? getFixtureById(fixtureId) : null
  if (!fixture) {
    const uncovered = requiredCapabilities
    return {
      summary:
        uncovered.length > 0
          ? `${uncovered.length} capability without fixture: ${uncovered.join(', ')}.`
          : 'No fixture assigned — save as Draft to complete later.',
      uncovered,
      mocksComplete: requiredCapabilities.length === 0,
    }
  }
  const uncovered = requiredCapabilities.filter((c) => !fixture.coveredCapabilities.includes(c))
  const covered = fixture.coveredCapabilities.filter((c) => requiredCapabilities.includes(c))
  if (uncovered.length > 0) {
    return {
      summary: `${covered.length} covered by ${fixture.name}; ${uncovered.length} without fixture: ${uncovered.join(', ')}.`,
      uncovered,
      mocksComplete: false,
    }
  }
  return {
    summary: `${covered.length || fixture.coveredCapabilities.length} capabilities covered by ${fixture.name}.`,
    uncovered: [],
    mocksComplete: true,
  }
}
