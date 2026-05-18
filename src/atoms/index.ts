import { atom } from 'jotai'
import type { Conversation, TestRunsState, Persona, PersonaSection } from '@/types'

// ─── Sandbox / Chat atoms ────────────────────────────────────────────────────
export const sandboxConversationsAtom = atom<Record<string, Conversation>>({})
export const selectedSandboxSessionIdAtom = atom<string | null>(null)
export const sandboxDeleteTargetAtom = atom<string | null>(null)
export const deployedVersionAtom = atom<string>('1.12 (v74)')
export const runningVersionAtom = atom<string>('0.0 (v1)')

// ─── Personas atoms ──────────────────────────────────────────────────────────
const SEED_PERSONAS: Persona[] = [
  {
    id: 'persona-1',
    personaKey: 'Proactively adding to cart',
    objectives: [
      {
        instructions:
          "You are a customer of the store:\nName: Evino\nDescription: Evino - Clube de vinhos e loja online com seleção exclusiva de vinhos nacionais e importados.\n\nGreet the assistant and ask it to add cabernet sauvignon wine to your cart.",
        goal: 'The assistant proactively adds a product to the cart.',
      },
    ],
    evaluations: [
      {
        id: 'eval-1',
        maxTurns: 6,
        prompt:
          'Success criteria are either the assistant showing a single product and adding it to the cart in a single turn OR the assistant showing multiple products, the user selecting one, and the assistant adding it to the cart. Output 1 if the criteria are met, otherwise 0.',
        threshold: 1,
      },
    ],
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'persona-2',
    personaKey: 'Searching for a search term mapping',
    objectives: [{ instructions: 'Search for "red wine" and verify search results appear.', goal: 'Search results are shown.' }],
    evaluations: [{ id: 'eval-2', maxTurns: 4, prompt: 'Output 1 if search results are displayed, otherwise 0.', threshold: 1 }],
    createdAt: Date.now() - 72000000,
  },
  {
    id: 'persona-3',
    personaKey: 'User adding multiple different products to cart',
    objectives: [{ instructions: 'Add 3 different products to the cart.', goal: 'All 3 products are in the cart.' }],
    evaluations: [{ id: 'eval-3', maxTurns: 8, prompt: 'Output 1 if 3 different products are in cart.', threshold: 1 }],
    createdAt: Date.now() - 60000000,
  },
  {
    id: 'persona-4',
    personaKey: 'User adding product then changing quantity',
    objectives: [{ instructions: 'Add a product then change its quantity to 3.', goal: 'Quantity is updated to 3.' }],
    evaluations: [{ id: 'eval-4', maxTurns: 6, prompt: 'Output 1 if quantity is correctly updated.', threshold: 1 }],
    createdAt: Date.now() - 50000000,
  },
  {
    id: 'persona-5',
    personaKey: 'User seeking a product recommendation',
    objectives: [{ instructions: 'Ask for a wine recommendation for a dinner party.', goal: 'A specific product is recommended.' }],
    evaluations: [{ id: 'eval-5', maxTurns: 5, prompt: 'Output 1 if a clear recommendation is made.', threshold: 1 }],
    createdAt: Date.now() - 40000000,
  },
]

export const personasAtom = atom<Persona[]>(SEED_PERSONAS)

export const sectionsAtom = atom<PersonaSection[]>([
  { id: 'section-1', name: 'casos_de_uso_fixtures', personaIds: Array.from({ length: 16 }, (_, i) => `fixture-${i}`) },
  { id: 'section-2', name: 'checkout_agentic_fixtures', personaIds: Array.from({ length: 7 }, (_, i) => `checkout-${i}`) },
  { id: 'section-3', name: 'product_recommendation_fixtures', personaIds: Array.from({ length: 16 }, (_, i) => `prod-${i}`) },
])

export const selectedPersonaIdAtom = atom<string | null>('persona-1')
export const testRunsAtom = atom<TestRunsState>({
  'persona-1': {
    status: 'TEST_RUN_STATUS_PASSED',
    evaluationResults: [
      {
        name: 'Evaluation 1',
        passed: true,
        score: 1,
        prompt:
          'Success criteria are either the assistant showing a single product and adding it to the cart in a single turn OR the assistant showing multiple products, the user selecting one, and the assistant adding it to the cart. Output 1 if the criteria are met, otherwise 0.',
        threshold: 1,
      },
    ],
  },
})

// ─── UI state ────────────────────────────────────────────────────────────────
export type { PersonaFormData } from '@/types'
export type SidebarTab = 'personas' | 'chat'
export const sidebarTabAtom = atom<SidebarTab>('personas')

// Persona form navigation: null = list, 'create' = new, personaId = edit
export type PersonaFormMode = null | 'create' | string
export const personaFormModeAtom = atom<PersonaFormMode>(null)
