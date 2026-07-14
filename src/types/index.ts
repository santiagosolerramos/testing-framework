export type MessageRole = 'USER' | 'ASSISTANT'

export interface Message {
  role: MessageRole
  text: string
  timestamp: number
}

export interface Conversation {
  customerId: string
  messages: Message[]
  runningVersion?: string
}

export type TestRunStatus =
  | 'TEST_RUN_STATUS_UNSPECIFIED'
  | 'TEST_RUN_STATUS_RUNNING'
  | 'TEST_RUN_STATUS_PASSED'
  | 'TEST_RUN_STATUS_FAILED'

export interface EvaluationResult {
  name: string
  passed: boolean
  score?: number
  prompt: string
}

export interface TestSuiteRun {
  status: TestRunStatus
  evaluationResults?: EvaluationResult[]
  /** N+1: assistant text from the last test run (kept for review after eval) */
  lastAssistantResponse?: string
}

export type TestRunsState = Record<string, TestSuiteRun>

// ─── Persona ──────────────────────────────────────────────────────────────────
export interface PersonaObjective {
  instructions: string
  goal: string
}

/** Single evaluation criterion (a prompt) */
export interface EvaluationCriterion {
  id: string
  prompt: string
}

/** Evaluation config: one maxTurns + N criteria */
export interface PersonaEvaluation {
  maxTurns: number
  criteria: EvaluationCriterion[]
}

export type PersonaStatus = 'active' | 'draft'

/** Full-simulation (default) vs N+1 replay from a prod failure */
export type PersonaTestKind = 'simulation' | 'n-plus-one'

export interface NPlusOneMetadata {
  prodConversationId: string
  agentName: string
  /** 1-based turn number (user+bot pair) where prod eval failed */
  failureTurnNumber: number
  failureEvalName: string
  failureReason: string
  /** Conversation slice used as direct LLM input (through turn N−1) */
  inputNMessages: Message[]
  inheritedEvalPrompt: string
  piiRedacted: boolean
}

export interface Persona {
  id: string
  personaKey: string
  testKind?: PersonaTestKind
  nPlusOne?: NPlusOneMetadata
  objectives: PersonaObjective[]
  evaluation: PersonaEvaluation
  /** Single fixture slot — source of truth for simulated tool results */
  fixtureId?: string | null
  /** @deprecated Migrated to fixtureId on load; not persisted on save */
  mockData?: string
  status?: PersonaStatus
  /** Folder this persona belongs to — same folder id appears under Active and Draft zones */
  sectionId?: string
  /** Consecutive manual test passes while draft (0–3); promotion still manual in MVP */
  validationPasses?: number
  createdAt: number
}

export interface PersonaSection {
  id: string
  name: string
  personaIds: string[]
}

// ─── Form data ────────────────────────────────────────────────────────────────
export interface PersonaFormData {
  personaKey: string
  objectives: PersonaObjective[]
  evaluation: PersonaEvaluation
  fixtureId?: string | null
  sectionId?: string | null
}
