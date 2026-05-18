import { atom } from 'jotai'
import type { Conversation, TestSuitesState, Persona, TestSuite } from '@/types'

// ─── Sandbox atoms ───────────────────────────────────────────────────────────
export const sandboxConversationsAtom = atom<Record<string, Conversation>>({})
export const selectedSandboxSessionIdAtom = atom<string | null>(null)
export const sandboxDeleteTargetAtom = atom<string | null>(null)

// ─── Test Suites atoms ───────────────────────────────────────────────────────
export const testSuitesAtom = atom<TestSuitesState>({})
export const personasAtom = atom<Persona[]>([
  {
    id: 'persona-1',
    name: 'Happy Customer',
    description: 'A satisfied customer asking simple questions',
    systemPrompt: 'You are a happy customer looking to track your order.',
    createdAt: Date.now(),
  },
  {
    id: 'persona-2',
    name: 'Frustrated User',
    description: 'An upset user with a billing issue',
    systemPrompt: 'You are a frustrated user who received the wrong item.',
    createdAt: Date.now(),
  },
  {
    id: 'persona-3',
    name: 'Technical User',
    description: 'A tech-savvy user asking detailed questions',
    systemPrompt: 'You are a developer asking about API rate limits.',
    createdAt: Date.now(),
  },
])

export const testSuitesListAtom = atom<TestSuite[]>([
  {
    id: 'suite-1',
    name: 'Customer Support Suite',
    description: 'Tests for common support scenarios',
    personaIds: ['persona-1', 'persona-2'],
    createdAt: Date.now(),
  },
  {
    id: 'suite-2',
    name: 'Edge Cases Suite',
    description: 'Tests for tricky edge cases',
    personaIds: ['persona-2', 'persona-3'],
    createdAt: Date.now(),
  },
])

export const selectedPersonaIdAtom = atom<string | null>(null)
export const selectedTestSuiteIdAtom = atom<string | null>(null)
