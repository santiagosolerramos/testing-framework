import type { Message } from '@/types'
import { buildInputNMessages, countConversationTurns, messagesToTurnPairs } from './conversationTurns'

export type ProdEvalStatus = 'passed' | 'failed'

export type ProdTurn = Message & {
  /** Display timestamp e.g. 28/05/2024, 08:06:54 */
  displayTime?: string
}

export type PiiRedaction = {
  field: string
  original: string
  redacted: string
}

export type ProdEvaluation = {
  id: string
  name: string
  status: ProdEvalStatus
  /** 1-based turn (user+bot pair) */
  turnNumber?: number
  prompt?: string
  reason?: string
}

export type SessionReviewStatus = 'needs_review' | 'reviewed'

export type ProdConversation = {
  id: string
  /** Full session UUID shown in breadcrumb */
  sessionId: string
  agentName: string
  customerLabel: string
  timestamp: string
  evalStatus: ProdEvalStatus
  reviewStatus?: SessionReviewStatus
  /** Turn-level eval required to enable "Create offline test" */
  hasTurnLevelEval: boolean
  /** 1-based turn (user+bot pair) where the prod eval failed */
  failureTurnNumber?: number
  /** Eval slug tied to the primary failure (for N+1 inherit) */
  failureEvalId?: string
  failureEvalName?: string
  failureReason?: string
  inheritedEvalPrompt?: string
  sectionId: string
  turns: ProdTurn[]
  evaluations: ProdEvaluation[]
  piiRedactions?: PiiRedaction[]
}

const CHECKOUT_TURNS: ProdTurn[] = [
  {
    role: 'USER',
    text: 'Oi, quero finalizar minha compra. Meu CEP é 01310-100 e meu email é maria.silva@email.com.',
    timestamp: 1,
  },
  {
    role: 'ASSISTANT',
    text: 'Olá Maria! Vou ajudar com o checkout. Para confirmar o endereço, pode informar seu CPF?',
    timestamp: 2,
  },
  {
    role: 'USER',
    text: 'Claro, é 123.456.789-00.',
    timestamp: 3,
  },
  {
    role: 'ASSISTANT',
    text: 'Perfeito! Encontrei sua região. Temos um Malbec reserva disponível — quer adicionar ao carrinho?',
    timestamp: 4,
  },
  {
    role: 'ASSISTANT',
    text: 'Posso também calcular o frete assim que você confirmar o endereço completo.',
    timestamp: 5,
  },
]

const REDACTED_CHECKOUT_TURNS: ProdTurn[] = [
  {
    role: 'USER',
    text: 'Oi, quero finalizar minha compra. Meu CEP é {{CEP_SYNTH}} e meu email é {{EMAIL_SYNTH}}.',
    timestamp: 1,
  },
  {
    role: 'ASSISTANT',
    text: 'Olá! Vou ajudar com o checkout. Para confirmar o endereço, pode informar seu CPF?',
    timestamp: 2,
  },
  {
    role: 'USER',
    text: 'Claro, é {{CPF_SYNTH}}.',
    timestamp: 3,
  },
]

const PURAVIDA_TURNS: ProdTurn[] = [
  {
    role: 'USER',
    text: 'Bom dia! O pedido foi feito dia 19/05',
    timestamp: 1,
    displayTime: '28/05/2024, 08:06:54',
  },
  {
    role: 'ASSISTANT',
    text: 'Olá, é um prazer receber o seu contato aqui na Puravida.',
    timestamp: 2,
    displayTime: '28/05/2024, 08:06:59',
  },
  {
    role: 'USER',
    text: 'Os 7 dias úteis já passaram',
    timestamp: 3,
    displayTime: '28/05/2024, 08:07:12',
  },
  {
    role: 'ASSISTANT',
    text: 'Entendo sua preocupação. Vou verificar o status do seu pedido agora.',
    timestamp: 4,
    displayTime: '28/05/2024, 08:07:18',
  },
  {
    role: 'USER',
    text: 'Preciso saber quando chega',
    timestamp: 5,
    displayTime: '28/05/2024, 08:07:35',
  },
  {
    role: 'ASSISTANT',
    text: 'Peço desculpas, mas não tenho informações específicas sobre esse pedido no momento.',
    timestamp: 6,
    displayTime: '28/05/2024, 08:07:42',
  },
]

const PURAVIDA_EVALS: ProdEvaluation[] = [
  {
    id: 'eval-fmt',
    name: 'adhoc.formatting_errors',
    status: 'failed',
    turnNumber: 2,
    reason:
      'Turn 2 bot reply used broken markdown when acknowledging the delivery-delay concern.',
    prompt: 'Output 1 if the assistant response has no formatting errors, otherwise 0.',
  },
  {
    id: 'eval-faq',
    name: 'faq_incomplete_answer',
    status: 'failed',
    turnNumber: 3,
    reason: 'Answer did not include shipping ETA or tracking link when order status was requested.',
    prompt:
      'Output 1 if the assistant provides a complete answer including order status or next steps, otherwise 0.',
  },
  {
    id: 'eval-fallback',
    name: 'reliability.fallback',
    status: 'failed',
    turnNumber: 3,
    reason:
      'Assistant used a generic fallback instead of looking up order status with available customer context.',
    prompt:
      'Output 1 if the assistant resolves the order-status request without a generic fallback, otherwise 0.',
  },
  { id: 'eval-tone', name: 'tone.professional', status: 'passed', turnNumber: 1 },
  { id: 'eval-lang', name: 'language.portuguese', status: 'passed', turnNumber: 1 },
  { id: 'eval-greet', name: 'greeting.warm', status: 'passed', turnNumber: 1 },
]

export const MOCK_PROD_CONVERSATIONS: ProdConversation[] = [
  {
    id: 'prod-conv-puravida',
    sessionId: '019e6eb1-ebe5-5263-b7d1-27339368e6c2',
    agentName: 'puravida_support',
    customerLabel: 'Puravida · WhatsApp',
    timestamp: '28/05/2024, 08:06',
    evalStatus: 'failed',
    reviewStatus: 'needs_review',
    hasTurnLevelEval: true,
    failureTurnNumber: 3,
    failureEvalId: 'eval-fallback',
    failureEvalName: 'reliability.fallback',
    failureReason: PURAVIDA_EVALS[2].reason!,
    inheritedEvalPrompt: PURAVIDA_EVALS[2].prompt!,
    sectionId: 'section-1',
    turns: PURAVIDA_TURNS,
    evaluations: PURAVIDA_EVALS,
  },
  {
    id: 'prod-conv-001',
    sessionId: 'a8f2c91d-4b2e-4f10-9c3a-checkout001',
    agentName: 'checkout_agentic_fixtures',
    customerLabel: 'Maria S. · WhatsApp',
    timestamp: 'Today, 10:42 AM',
    evalStatus: 'failed',
    reviewStatus: 'needs_review',
    hasTurnLevelEval: true,
    failureTurnNumber: 2,
    failureEvalId: 'eval-cep',
    failureEvalName: 'checkout.cep_validation',
    failureReason:
      'Assistant offered a product before validating the Brazilian CEP and confirming the delivery address.',
    inheritedEvalPrompt:
      'Output 1 if the assistant asks for and validates a Brazilian CEP before recommending products, otherwise 0.',
    sectionId: 'section-2',
    turns: CHECKOUT_TURNS,
    evaluations: [
      {
        id: 'eval-cep',
        name: 'checkout.cep_validation',
        status: 'failed',
        turnNumber: 2,
        reason:
          'Assistant offered a product before validating the Brazilian CEP and confirming the delivery address.',
        prompt:
          'Output 1 if the assistant asks for and validates a Brazilian CEP before recommending products, otherwise 0.',
      },
      { id: 'eval-greet-co', name: 'greeting.warm', status: 'passed', turnNumber: 1 },
    ],
    piiRedactions: [
      { field: 'CEP', original: '01310-100', redacted: '{{CEP_SYNTH}}' },
      { field: 'Email', original: 'maria.silva@email.com', redacted: '{{EMAIL_SYNTH}}' },
      { field: 'CPF', original: '123.456.789-00', redacted: '{{CPF_SYNTH}}' },
      { field: 'Name', original: 'Maria', redacted: '{{NAME_SYNTH}}' },
    ],
  },
  {
    id: 'prod-conv-002',
    sessionId: 'b21c8e4a-1f2d-4a90-b8e1-sess0002',
    agentName: 'casos_de_uso_fixtures',
    customerLabel: 'João P. · WhatsApp',
    timestamp: 'Today, 9:15 AM',
    evalStatus: 'passed',
    reviewStatus: 'reviewed',
    hasTurnLevelEval: true,
    sectionId: 'section-1',
    evaluations: [
      { id: 'eval-cart', name: 'cart.add_product', status: 'passed', turnNumber: 1 },
    ],
    turns: [
      {
        role: 'USER',
        text: 'Adiciona um cabernet sauvignon no carrinho por favor.',
        timestamp: 1,
      },
      {
        role: 'ASSISTANT',
        text: 'Claro! Adicionei o Cabernet Sauvignon Reserva ao seu carrinho. Posso ajudar com mais alguma coisa?',
        timestamp: 2,
      },
    ],
  },
  {
    id: 'prod-conv-003',
    sessionId: 'c9d4f1a2-8b3c-4d5e-9f0a-sess0003',
    agentName: 'product_recommendation_fixtures',
    customerLabel: 'Ana L. · WhatsApp',
    timestamp: 'Yesterday, 6:30 PM',
    evalStatus: 'failed',
    reviewStatus: 'needs_review',
    hasTurnLevelEval: true,
    failureTurnNumber: 1,
    failureEvalId: 'eval-rec',
    failureEvalName: 'recommendation.specific_sku',
    failureReason:
      'Assistant gave a generic category suggestion instead of naming a specific product SKU.',
    inheritedEvalPrompt:
      'Output 1 if a clear, specific product recommendation is made, otherwise 0.',
    sectionId: 'section-3',
    evaluations: [
      {
        id: 'eval-rec',
        name: 'recommendation.specific_sku',
        status: 'failed',
        turnNumber: 1,
        reason:
          'Assistant gave a generic category suggestion instead of naming a specific product SKU.',
        prompt: 'Output 1 if a clear, specific product recommendation is made, otherwise 0.',
      },
    ],
    turns: [
      {
        role: 'USER',
        text: 'Preciso de uma indicação de vinho para um jantar com amigos.',
        timestamp: 1,
      },
      {
        role: 'ASSISTANT',
        text: 'Temos ótimos tintos na loja! Você prefere algo mais encorpado ou leve?',
        timestamp: 2,
      },
      {
        role: 'ASSISTANT',
        text: 'Posso listar as categorias disponíveis se quiser.',
        timestamp: 3,
      },
    ],
  },
  {
    id: 'prod-conv-004',
    sessionId: 'd44e9a1b-6c7d-4e8f-a0b1-sess0004',
    agentName: 'checkout_agentic_fixtures',
    customerLabel: 'Pedro M. · WhatsApp',
    timestamp: 'Yesterday, 2:11 PM',
    evalStatus: 'failed',
    reviewStatus: 'reviewed',
    hasTurnLevelEval: false,
    failureReason: 'Session-level eval failed — no turn attribution available.',
    sectionId: 'section-2',
    evaluations: [
      {
        id: 'eval-session',
        name: 'session.overall_quality',
        status: 'failed',
        reason: 'Session-level eval failed — no turn attribution available.',
      },
    ],
    turns: [
      { role: 'USER', text: 'Qual o status do meu pedido?', timestamp: 1 },
      {
        role: 'ASSISTANT',
        text: 'Não consegui localizar seu pedido. Pode informar o número?',
        timestamp: 2,
      },
    ],
  },
  {
    id: 'prod-conv-005',
    sessionId: 'e77a3c2d-9e0f-4a1b-8c2d-sess0005',
    agentName: 'casos_de_uso_fixtures',
    customerLabel: 'Lucia R. · WhatsApp',
    timestamp: 'May 24, 4:55 PM',
    evalStatus: 'failed',
    reviewStatus: 'needs_review',
    hasTurnLevelEval: true,
    failureTurnNumber: 1,
    failureEvalId: 'eval-search',
    failureEvalName: 'search.results_displayed',
    failureReason: 'Search returned zero results without suggesting an alternative query.',
    inheritedEvalPrompt: 'Output 1 if search results are displayed, otherwise 0.',
    sectionId: 'section-1',
    evaluations: [
      {
        id: 'eval-search',
        name: 'search.results_displayed',
        status: 'failed',
        turnNumber: 1,
        reason: 'Search returned zero results without suggesting an alternative query.',
        prompt: 'Output 1 if search results are displayed, otherwise 0.',
      },
    ],
    turns: [
      { role: 'USER', text: 'Busca vinho tinto seco barato', timestamp: 1 },
      {
        role: 'ASSISTANT',
        text: 'Não encontrei resultados para essa busca.',
        timestamp: 2,
      },
    ],
  },
]

export function getInputNSlice(
  conversation: ProdConversation,
  failureTurnNumber?: number
): Message[] {
  const failTurn = failureTurnNumber ?? conversation.failureTurnNumber
  if (failTurn === undefined) return []
  return buildInputNMessages(conversation.turns, failTurn)
}

/** Redacted messages for the N slice (checkout demo uses synthetic tokens). */
export function getRedactedInputNSlice(
  conversation: ProdConversation,
  failureTurnNumber?: number
): Message[] {
  const failTurn = failureTurnNumber ?? conversation.failureTurnNumber ?? 1
  if (conversation.id === 'prod-conv-001') {
    return buildInputNMessages(REDACTED_CHECKOUT_TURNS, failTurn)
  }
  return buildInputNMessages(conversation.turns, failTurn)
}

export { countConversationTurns, messagesToTurnPairs }

export function buildNPlusOneTestName(conversation: ProdConversation, evalSlug?: string): string {
  const slug = evalSlug ?? conversation.failureEvalName
  if (slug) return `n+1 — ${slug}`
  return `n+1 — ${conversation.sessionId.slice(0, 8)}`
}

export function getEvaluationById(
  conversation: ProdConversation,
  evalId: string
): ProdEvaluation | undefined {
  return conversation.evaluations.find((e) => e.id === evalId)
}
