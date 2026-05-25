import type { Conversation } from '@/types'
import type { PersonaWizardDraft } from '@/types/personaCreation'
import { SANDBOX_PRODUCT_REC_FIXTURE_ID } from '@/scenes/Sandbox/constants'
import { fetchSessionTranscript } from '@/services/mockSessionFetch'
import {
  buildCriteriaFromToggles,
  finalizeDraftWithFixture,
} from '@/services/personaGeneration'
import { applyFixtureToDraft } from '@/services/fixtureMatching'
import {
  buildStepByStepInstructions,
  inferConversationEndGoal,
} from '@/services/conversationPersonaExtract'

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 60) || 'sandbox_persona'
  )
}

/** Sandbox MVP: always product recommendation fixture, draft for user validation */
export async function createDraftFromSandboxSession(
  sessionId: string,
  conversations: Record<string, Conversation>
): Promise<{ draft: PersonaWizardDraft | null; error?: string }> {
  await delay(1800 + Math.random() * 800)

  const session = await fetchSessionTranscript(sessionId, conversations)
  if (!session.valid || session.turns.length < 2) {
    return {
      draft: null,
      error: session.error || 'Need at least two turns in this session to create a persona.',
    }
  }

  const transcript = session.transcript
  const userLines = session.turns.filter((t) => t.role === 'user').map((t) => t.text)
  const language = 'pt-BR' as const
  const goal = inferConversationEndGoal(session.turns, language)
  const profile = buildStepByStepInstructions(session.turns, language)

  const toggles = {
    kbGrounding: false,
    handoverQuality: false,
    toneLanguage: true,
    catchAll: '',
  }

  const criteria = buildCriteriaFromToggles(goal, toggles, session.turns)
  const fixtureId = SANDBOX_PRODUCT_REC_FIXTURE_ID
  const applied = applyFixtureToDraft(fixtureId)

  const base: PersonaWizardDraft = {
    personaKey: slugify(
      goal.includes('carrinho') ? 'product_rec_add_to_cart' : profile.slice(0, 40)
    ),
    description: transcript.slice(0, 500),
    profile,
    goal,
    language: 'pt-BR',
    sopHints: [],
    resolvedSop: 'faq',
    detectedEntities: [],
    maxTurns: 8,
    criteria,
    selectedCatalogEvalIds: [],
    evalCatchAll: '',
    evalToggles: toggles,
    fixtureMatch: { kind: 'none', requiredCapabilities: [] },
    selectedFixtureId: fixtureId,
    mocksComplete: true,
    fixtureSummary: applied.fixtureSummary,
    uncoveredCapabilities: [],
    isDraft: true,
    isSmokeTest: false,
    presetMessages: userLines[0] || '',
    sourceFlow: 'sandbox',
    conversationTurns: session.turns,
    sessionId,
  }

  return { draft: finalizeDraftWithFixture(base, fixtureId) }
}

export type SandboxPersonaCreateResult = {
  personaId: string
  draft: PersonaWizardDraft
}
