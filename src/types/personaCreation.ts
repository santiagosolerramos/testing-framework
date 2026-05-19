import type { EvaluationCriterion, PersonaFormData } from '@/types'

export type SopHint =
  | 'auto'
  | 'faq'
  | 'checkout'
  | 'orderStatus'
  | 'handover'

export type PersonaStatus = 'active' | 'draft'

export type LanguageId = 'pt-BR' | 'es-ES' | 'en-US'

export interface FixtureMatchCandidate {
  fixtureId: string
  fixtureName: string
  confidence: number
  coveredCapabilities: string[]
  uncoveredCapabilities: string[]
  previewJson: string
}

export type FixtureMatchState =
  | { kind: 'none'; requiredCapabilities: string[] }
  | {
      kind: 'single'
      match: FixtureMatchCandidate
      selectedFixtureId: string
      requiredCapabilities: string[]
    }
  | {
      kind: 'multiple'
      matches: FixtureMatchCandidate[]
      selectedFixtureId: string | null
      requiredCapabilities: string[]
    }

export interface EvalToggles {
  kbGrounding: boolean
  handoverQuality: boolean
  toneLanguage: boolean
  catchAll: string
}

export interface ParsedConversationTurn {
  id: string
  role: 'user' | 'bot'
  text: string
  thumb: 'up' | 'down'
  correction?: string
}

export interface PersonaWizardDraft {
  personaKey: string
  description: string
  profile: string
  goal: string
  language: LanguageId
  sopHints: Exclude<SopHint, 'auto'>[]
  resolvedSop: SopHint
  detectedEntities: string[]
  maxTurns: number
  criteria: EvaluationCriterion[]
  evalToggles: EvalToggles
  fixtureMatch: FixtureMatchState
  selectedFixtureId: string | null
  mocksComplete: boolean
  fixtureSummary: string
  uncoveredCapabilities: string[]
  isDraft: boolean
  isSmokeTest: boolean
  presetMessages: string
  sourceFlow: 'description' | 'conversation' | 'sandbox'
  conversationTurns?: ParsedConversationTurn[]
  sessionId?: string
}

export type DescriptionWizardStep =
  | 'describe'
  | 'generating'
  | 'transactional-warning'
  | 'fixtures'
  | 'evaluations'
  | 'review'

export type ConversationWizardStep =
  | 'input'
  | 'extracting'
  | 'thumbs'
  | 'transactional-warning'
  | 'fixtures'
  | 'review'

export type ConversationInputTab = 'session' | 'paste'

export type PersonaCreationState =
  | null
  | { kind: 'entry-modal' }
  | { kind: 'description' }
  | {
      kind: 'conversation'
      preloadedSessionId?: string | null
    }
  | { kind: 'sandbox-active' }

export function wizardDraftToFormData(draft: PersonaWizardDraft): PersonaFormData {
  return {
    personaKey: draft.personaKey,
    objectives: [{ instructions: draft.profile, goal: draft.goal }],
    evaluation: { maxTurns: draft.maxTurns, criteria: draft.criteria },
    fixtureId: draft.selectedFixtureId,
  }
}

export function isFaqOrHandoverOnly(sop: SopHint): boolean {
  return sop === 'faq' || sop === 'handover'
}
