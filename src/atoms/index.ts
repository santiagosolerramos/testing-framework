import { atom } from 'jotai'
import type { Conversation, TestRunsState, Persona, PersonaSection } from '@/types'
import { migrateLegacyPersonas } from '@/fixtures/migrateLegacyMockData'
import {
  SANDBOX_EXAMPLE_CONVERSATION,
  SANDBOX_EXAMPLE_SESSION_ID,
} from '@/scenes/Sandbox/sandboxExampleSession'

// ─── Sandbox / Chat atoms ────────────────────────────────────────────────────
export const sandboxConversationsAtom = atom<Record<string, Conversation>>({
  [SANDBOX_EXAMPLE_SESSION_ID]: SANDBOX_EXAMPLE_CONVERSATION,
})
export const selectedSandboxSessionIdAtom = atom<string | null>(SANDBOX_EXAMPLE_SESSION_ID)
/** When set, Sandbox shows Review & Save overlay for this draft persona id */
export const sandboxReviewPersonaIdAtom = atom<string | null>(null)
export const sandboxDeleteTargetAtom = atom<string | null>(null)
export const deployedVersionAtom = atom<string>('1.12 (v74)')
export const runningVersionAtom = atom<string>('0.0 (v1)')

// ─── Personas atoms ──────────────────────────────────────────────────────────
const SEED_PERSONAS: Persona[] = [
  {
    id: 'persona-1',
    status: 'active',
    sectionId: 'section-1',
    personaKey: 'Proactively adding to cart',
    objectives: [
      {
        instructions:
          "You are a customer of the store:\nName: Evino\nDescription: Evino - Clube de vinhos e loja online.\n\nGreet the assistant and ask it to add cabernet sauvignon wine to your cart.",
        goal: 'The assistant proactively adds a product to the cart.',
      },
    ],
    evaluation: {
      maxTurns: 6,
      criteria: [
        {
          id: 'c-1',
          prompt:
            'Output 1 if the assistant shows a product and adds it to the cart, otherwise 0.',
        },
      ],
    },
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'persona-2',
    status: 'active',
    sectionId: 'section-1',
    personaKey: 'Searching for a search term mapping',
    objectives: [
      {
        instructions: 'Search for "red wine" and verify search results appear.',
        goal: 'Search results are shown.',
      },
    ],
    evaluation: {
      maxTurns: 4,
      criteria: [
        { id: 'c-2', prompt: 'Output 1 if search results are displayed, otherwise 0.' },
      ],
    },
    createdAt: Date.now() - 72000000,
  },
  {
    id: 'persona-3',
    status: 'active',
    sectionId: 'section-3',
    personaKey: 'User adding multiple different products to cart',
    objectives: [
      {
        instructions: 'Add 3 different products to the cart.',
        goal: 'All 3 products are in the cart.',
      },
    ],
    evaluation: {
      maxTurns: 8,
      criteria: [
        { id: 'c-3', prompt: 'Output 1 if 3 different products are in cart, otherwise 0.' },
      ],
    },
    createdAt: Date.now() - 60000000,
  },
  {
    id: 'persona-4',
    status: 'active',
    sectionId: 'section-3',
    personaKey: 'User adding product then changing quantity',
    objectives: [
      {
        instructions: 'Add a product then change its quantity to 3.',
        goal: 'Quantity is updated to 3.',
      },
    ],
    evaluation: {
      maxTurns: 6,
      criteria: [
        { id: 'c-4', prompt: 'Output 1 if quantity is correctly updated, otherwise 0.' },
      ],
    },
    createdAt: Date.now() - 50000000,
  },
  {
    id: 'persona-checkout-cep',
    status: 'active',
    sectionId: 'section-2',
    personaKey: 'checkout-cep-lookup',
    objectives: [
      {
        instructions:
          '1) Start by expressing your interest in completing a checkout and ask if the assistant can look up your postal code (CEP) in Brazil.\n2) Tell the assistant you are looking for help validating your delivery address before placing an order.\n3) Provide a valid 8-digit CEP when prompted and confirm the address details returned.',
        goal: 'The assistant successfully looks up the CEP and confirms the delivery address.',
      },
    ],
    evaluation: {
      maxTurns: 6,
      criteria: [
        {
          id: 'c-cep-1',
          prompt:
            'Output 1 if the assistant asks for and validates a Brazilian CEP, otherwise 0.',
        },
        {
          id: 'c-cep-2',
          prompt:
            'Output 1 if the assistant confirms the address and offers a relevant product, otherwise 0.',
        },
      ],
    },
    fixtureId: 'checkout_cep_default',
    createdAt: Date.now() - 45000000,
  },
  {
    id: 'persona-5',
    status: 'active',
    sectionId: 'section-3',
    personaKey: 'User seeking a product recommendation',
    objectives: [
      {
        instructions: 'Ask for a wine recommendation for a dinner party.',
        goal: 'A specific product is recommended.',
      },
    ],
    evaluation: {
      maxTurns: 5,
      criteria: [
        { id: 'c-5', prompt: 'Output 1 if a clear recommendation is made, otherwise 0.' },
      ],
    },
    createdAt: Date.now() - 40000000,
  },
  {
    id: 'persona-draft-checkout',
    status: 'draft',
    sectionId: 'section-2',
    validationPasses: 2,
    personaKey: 'Draft — checkout CEP validation',
    objectives: [
      {
        instructions:
          'Ask the assistant to validate your CEP before checkout. Provide 01310-100 when asked.',
        goal: 'Assistant validates CEP and confirms address.',
      },
    ],
    evaluation: {
      maxTurns: 6,
      criteria: [
        {
          id: 'c-draft-cep',
          prompt: 'Output 1 if CEP is validated, otherwise 0.',
        },
      ],
    },
    fixtureId: 'checkout_cep_default',
    createdAt: Date.now() - 3600000,
  },
]

const { personas: MIGRATED_PERSONAS } = migrateLegacyPersonas(SEED_PERSONAS)
export const personasAtom = atom<Persona[]>(MIGRATED_PERSONAS)

export const sectionsAtom = atom<PersonaSection[]>([
  {
    id: 'section-1',
    name: 'casos_de_uso_fixtures',
    personaIds: [],
  },
  {
    id: 'section-2',
    name: 'checkout_agentic_fixtures',
    personaIds: [],
  },
  {
    id: 'section-3',
    name: 'product_recommendation_fixtures',
    personaIds: [],
  },
])

export const selectedPersonaIdAtom = atom<string | null>('persona-checkout-cep')
export const testRunsAtom = atom<TestRunsState>({
  'persona-checkout-cep': {
    status: 'TEST_RUN_STATUS_PASSED',
    evaluationResults: [
      {
        name: 'Evaluation 1',
        passed: true,
        score: 1,
        prompt:
          'Output 1 if the assistant asks for and validates a Brazilian CEP, otherwise 0.',
      },
      {
        name: 'Evaluation 2',
        passed: true,
        score: 1,
        prompt:
          'Output 1 if the assistant confirms the address and offers a relevant product, otherwise 0.',
      },
    ],
  },
})

// ─── UI state ────────────────────────────────────────────────────────────────
export type { PersonaFormData } from '@/types'
export type SidebarTab = 'personas' | 'chat'
export const sidebarTabAtom = atom<SidebarTab>('personas')

export type PersonaFormMode = null | 'create' | string
export const personaFormModeAtom = atom<PersonaFormMode>(null)

export { appSectionAtom } from './admin'
export type { AppSection } from './admin'
