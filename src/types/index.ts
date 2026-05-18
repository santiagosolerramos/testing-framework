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

export interface TestSuiteRun {
  status: TestRunStatus
  passedCount?: number
  failedCount?: number
  totalCount?: number
  startedAt?: number
  finishedAt?: number
}

// testSuitesAtom shape: { [testSuiteId]: { [personaId]: TestSuiteRun } }
export type TestSuitesState = Record<string, Record<string, TestSuiteRun>>

export interface Persona {
  id: string
  name: string
  description: string
  systemPrompt: string
  createdAt: number
}

export interface TestSuite {
  id: string
  name: string
  description: string
  personaIds: string[]
  createdAt: number
}
