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

export interface Persona {
  id: string
  personaKey: string
  objectives: PersonaObjective[]
  evaluation: PersonaEvaluation
  mockData?: string
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
  mockData?: string
}
