export type MessageRole = 'USER' | 'ASSISTANT'

export interface Message {
  role: MessageRole
  text: string
  timestamp: number
  // For agent messages that come as multiple bubbles
  bubbles?: string[]
}

export interface CallbackEvent {
  type: 'callback_timeout'
  label: string // e.g. "activity_check"
  seconds: number
}

export interface ConversationEntry {
  message?: Message
  callbackEvent?: CallbackEvent
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
  threshold: number
}

export interface TestSuiteRun {
  status: TestRunStatus
  evaluationResults?: EvaluationResult[]
  startedAt?: number
  finishedAt?: number
}

// Shape: { [personaId]: TestSuiteRun }
export type TestRunsState = Record<string, TestSuiteRun>

// ─── Persona (matches PersonaFormData) ───────────────────────────────────────
export interface PersonaObjective {
  instructions: string
  goal: string
}

export interface PersonaEvaluation {
  id: string
  maxTurns: number
  prompt: string
  threshold: number
}

export interface Persona {
  id: string
  personaKey: string // display name
  objectives: PersonaObjective[]
  evaluations: PersonaEvaluation[]
  mockData?: string // JSON string
  createdAt: number
}

// ─── Section (folder grouping personas) ──────────────────────────────────────
export interface PersonaSection {
  id: string
  name: string
  personaIds: string[]
}

// ─── PersonaFormData (what react-hook-form uses) ─────────────────────────────
export interface PersonaFormData {
  personaKey: string
  objectives: PersonaObjective[]
  evaluations: PersonaEvaluation[]
  mockData?: string
}
