import { ulid } from 'ulid'
import type {
  EvalToggles,
  LanguageId,
  ParsedConversationTurn,
  PersonaWizardDraft,
  SopHint,
} from '@/types/personaCreation'
import { isFaqOrHandoverOnly } from '@/types/personaCreation'
import { SOP_MAX_TURNS, TRANSACTIONAL_KEYWORDS } from '@/scenes/Personas/creation/constants'
import {
  applyFixtureToDraft,
  buildFixtureReviewSummary,
  inferRequiredCapabilities,
  matchFixtures,
  type ParsedIntent,
} from '@/services/fixtureMatching'
import { turnsToTranscript } from '@/services/parseTranscript'
import {
  buildCriteriaFromCatalog,
  buildGoalCompletionCriterion,
} from '@/services/evaluationCatalog'
import { suggestCatalogEvalIds } from '@/services/evaluationSelection'
import {
  buildStepByStepInstructions,
  inferConversationEndGoal,
} from '@/services/conversationPersonaExtract'
import {
  buildStepByStepFromDescription,
  inferDescriptionEndGoal,
} from '@/services/descriptionPersonaExtract'
import { CHECKOUT_DEMO_DESCRIPTION } from '@/scenes/Personas/creation/constants'

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 60) || 'generated_persona'
  )
}

function detectSop(text: string, hints: Exclude<SopHint, 'auto'>[]): SopHint {
  if (hints.length === 1) return hints[0]
  if (hints.includes('checkout')) return 'checkout'
  if (hints.includes('orderStatus')) return 'orderStatus'
  if (hints.includes('handover')) return 'handover'
  if (hints.includes('faq')) return 'faq'

  const lower = text.toLowerCase()
  if (lower.includes('checkout') || lower.includes('cep') || lower.includes('carrinho')) {
    return 'checkout'
  }
  if (lower.includes('pedido') || lower.includes('order')) return 'orderStatus'
  if (lower.includes('humano') || lower.includes('escalar')) return 'handover'
  return 'faq'
}

function inferEntities(text: string): string[] {
  const entities: string[] = []
  if (/\d{10,}/.test(text)) entities.push('order_number')
  if (/\bcpf\b/i.test(text)) entities.push('CPF')
  if (/\bcep\b/i.test(text)) entities.push('CEP')
  return entities
}

function detectTransactionalMismatch(text: string, sop: SopHint): boolean {
  if (sop !== 'faq') return false
  const lower = text.toLowerCase()
  return TRANSACTIONAL_KEYWORDS.some((kw) => lower.includes(kw))
}

export function buildCriteriaFromToggles(
  goal: string,
  toggles: EvalToggles,
  turns?: ParsedConversationTurn[]
): PersonaWizardDraft['criteria'] {
  const criteria = [buildGoalCompletionCriterion(goal)]

  if (toggles.kbGrounding) {
    criteria.push({
      id: ulid(),
      prompt:
        "Output 1 if the assistant's answer is grounded in the knowledge base and not invented, otherwise 0.",
    })
  }
  if (toggles.handoverQuality) {
    criteria.push({
      id: ulid(),
      prompt:
        'Output 1 if the assistant collected required information before escalating to a human, otherwise 0.',
    })
  }
  if (toggles.toneLanguage) {
    criteria.push({
      id: ulid(),
      prompt:
        'Output 1 if the assistant responds in PT-BR and maintains a professional tone, otherwise 0.',
    })
  }

  const downTurns = turns?.filter((t) => t.role === 'bot' && t.thumb === 'down') || []
  for (const t of downTurns) {
    criteria.push({
      id: ulid(),
      prompt: `Output 0 if the assistant responds like: "${t.text.slice(0, 80)}". Expected instead: ${t.correction || 'different behavior'}.`,
    })
  }

  if (toggles.catchAll.trim()) {
    criteria.push({
      id: ulid(),
      prompt: `Output 1 if the following is satisfied: ${toggles.catchAll.trim()}, otherwise 0.`,
    })
  }

  return criteria
}

function defaultTogglesForSop(sop: SopHint): EvalToggles {
  return {
    kbGrounding: sop === 'faq',
    handoverQuality: sop === 'handover',
    toneLanguage: true,
    catchAll: '',
  }
}

export type GenerateFromDescriptionInput = {
  description: string
  language: LanguageId
  sopHints: Exclude<SopHint, 'auto'>[]
}

export type GenerateResult = {
  draft: PersonaWizardDraft
  transactionalWarning: boolean
}

export async function generatePersonaFromDescription(
  input: GenerateFromDescriptionInput
): Promise<GenerateResult> {
  await delay(2800 + Math.random() * 1200)

  const resolvedSop = detectSop(input.description, input.sopHints)
  const transactionalWarning = detectTransactionalMismatch(input.description, resolvedSop)
  const entities = inferEntities(input.description)
  const requiredCapabilities = inferRequiredCapabilities(input.description, resolvedSop)
  const maxTurns = SOP_MAX_TURNS[resolvedSop === 'auto' ? 'faq' : resolvedSop] ?? 10

  const goal = inferDescriptionEndGoal(input.description, input.language, resolvedSop)

  const profile = buildStepByStepFromDescription(
    input.description,
    input.language,
    resolvedSop
  )

  const isCheckoutDemo =
    input.sopHints.includes('checkout') &&
    input.description.trim() === CHECKOUT_DEMO_DESCRIPTION.trim()
  const personaKey = isCheckoutDemo
    ? 'checkout_demo_cep_pix'
    : slugify(input.description.slice(0, 40))

  const parsedIntent: ParsedIntent = {
    text: input.description,
    entities,
    resolvedSop,
    requiredCapabilities,
  }

  const fixtureMatch = matchFixtures(parsedIntent, input.sopHints)
  const selectedFixtureId =
    fixtureMatch.kind === 'single'
      ? fixtureMatch.selectedFixtureId
      : fixtureMatch.kind === 'multiple'
        ? null
        : null

  const toggles = defaultTogglesForSop(resolvedSop)
  const selectedCatalogEvalIds = suggestCatalogEvalIds({
    description: input.description,
    resolvedSop,
    sopHints: input.sopHints,
  })
  const criteria = buildCriteriaFromCatalog(goal, selectedCatalogEvalIds)
  const review = buildFixtureReviewSummary(selectedFixtureId, requiredCapabilities)

  const draft: PersonaWizardDraft = {
    personaKey,
    description: input.description,
    profile,
    goal,
    language: input.language,
    sopHints: input.sopHints,
    resolvedSop,
    detectedEntities: entities,
    maxTurns,
    criteria,
    selectedCatalogEvalIds,
    evalCatchAll: '',
    evalToggles: toggles,
    fixtureMatch,
    selectedFixtureId,
    mocksComplete: isFaqOrHandoverOnly(resolvedSop)
      ? true
      : review.mocksComplete,
    fixtureSummary: isFaqOrHandoverOnly(resolvedSop)
      ? 'No external data required for this scenario.'
      : review.summary,
    uncoveredCapabilities: review.uncovered,
    isDraft: !isFaqOrHandoverOnly(resolvedSop) && !review.mocksComplete,
    isSmokeTest: false,
    presetMessages: input.description.split(/[.!?]/)[0]?.trim() || '',
    sourceFlow: 'description',
  }

  return { draft, transactionalWarning }
}

export async function generatePersonaFromConversation(input: {
  turns: ParsedConversationTurn[]
  language: LanguageId
}): Promise<GenerateResult> {
  await delay(3200 + Math.random() * 1500)

  const transcript = turnsToTranscript(input.turns)
  const userLines = input.turns.filter((t) => t.role === 'user').map((t) => t.text)
  const goal = inferConversationEndGoal(input.turns, input.language)
  const profile = buildStepByStepInstructions(input.turns, input.language)

  const resolvedSop = detectSop(transcript, [])
  const transactionalWarning = detectTransactionalMismatch(transcript, resolvedSop)
  const entities = inferEntities(transcript)
  const requiredCapabilities = inferRequiredCapabilities(transcript, resolvedSop)

  const parsedIntent: ParsedIntent = {
    text: transcript,
    entities,
    resolvedSop,
    requiredCapabilities,
  }

  const fixtureMatch = matchFixtures(parsedIntent, [])
  const selectedFixtureId =
    fixtureMatch.kind === 'single' ? fixtureMatch.selectedFixtureId : null

  const toggles = defaultTogglesForSop(resolvedSop)
  const criteria = buildCriteriaFromToggles(goal, toggles, input.turns)

  const strictFaqHandover = isFaqOrHandoverOnly(resolvedSop)
  const review = buildFixtureReviewSummary(
    strictFaqHandover ? (requiredCapabilities.length === 0 ? 'faq_default' : selectedFixtureId) : selectedFixtureId,
    requiredCapabilities
  )

  const mocksComplete = strictFaqHandover
    ? true
    : review.mocksComplete

  const draft: PersonaWizardDraft = {
    personaKey: slugify(profile.split('\n')[0]?.slice(0, 50) || goal.slice(0, 40)),
    description: transcript.slice(0, 500),
    profile,
    goal,
    language: input.language,
    sopHints: [],
    resolvedSop,
    detectedEntities: entities,
    maxTurns: SOP_MAX_TURNS[resolvedSop === 'auto' ? 'faq' : resolvedSop] ?? 10,
    criteria,
    selectedCatalogEvalIds: [],
    evalCatchAll: '',
    evalToggles: toggles,
    fixtureMatch,
    selectedFixtureId: strictFaqHandover ? selectedFixtureId ?? 'faq_default' : selectedFixtureId,
    mocksComplete,
    fixtureSummary: strictFaqHandover
      ? 'FAQ / Handover — no external data required.'
      : review.summary,
    uncoveredCapabilities: review.uncovered,
    isDraft: !mocksComplete,
    isSmokeTest: false,
    presetMessages: userLines[0] || '',
    sourceFlow: 'conversation',
    conversationTurns: input.turns,
  }

  return { draft, transactionalWarning }
}

export function finalizeDraftWithFixture(
  draft: PersonaWizardDraft,
  fixtureId: string | null
): PersonaWizardDraft {
  const applied = applyFixtureToDraft(fixtureId)
  const required = draft.fixtureMatch.requiredCapabilities
  const review = buildFixtureReviewSummary(fixtureId, required)
  return {
    ...draft,
    selectedFixtureId: fixtureId,
    mocksComplete: applied.mocksComplete && review.mocksComplete,
    fixtureSummary: review.summary,
    uncoveredCapabilities: review.uncovered,
    isDraft: !(applied.mocksComplete && review.mocksComplete),
  }
}

export function finalizeDraftWithEvaluations(
  draft: PersonaWizardDraft,
  selectedCatalogEvalIds: string[],
  customEvalPrompts: string[],
  isSmokeTest: boolean,
  catalogPromptOverrides?: Record<string, string>
): PersonaWizardDraft {
  let criteria = buildCriteriaFromCatalog(
    draft.goal,
    selectedCatalogEvalIds,
    catalogPromptOverrides,
    customEvalPrompts
  )
  if (draft.conversationTurns?.length) {
    const thumbCriteria = buildCriteriaFromToggles(draft.goal, draft.evalToggles, draft.conversationTurns)
    const extra = thumbCriteria.slice(1)
    criteria = [...criteria, ...extra]
  }
  const firstUser =
    draft.conversationTurns?.find((t) => t.role === 'user')?.text ||
    draft.description.split(/[.!?]/)[0]?.trim() ||
    ''

  return {
    ...draft,
    selectedCatalogEvalIds,
    evalCatchAll: '',
    criteria,
    isSmokeTest,
    presetMessages: isSmokeTest ? firstUser : draft.presetMessages,
  }
}
