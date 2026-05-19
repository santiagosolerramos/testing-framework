import type { Conversation } from '@/types'

/** Stable id for the seeded demo session used in "Create persona" flows */
export const SANDBOX_EXAMPLE_SESSION_ID = 'sandbox-example-product-rec'

const now = Date.now()

export const SANDBOX_EXAMPLE_CONVERSATION: Conversation = {
  customerId: 'example-product-rec-customer',
  messages: [
    {
      role: 'USER',
      text: 'Oi! Estou procurando um vinho tinto para um jantar especial.',
      timestamp: now - 120_000,
    },
    {
      role: 'ASSISTANT',
      text: 'Olá! Posso te ajudar com recomendações. Você prefere algo encorpado, como um Cabernet Sauvignon?',
      timestamp: now - 115_000,
    },
    {
      role: 'USER',
      text: 'Sim, Cabernet Sauvignon seria ótimo. Pode adicionar ao carrinho?',
      timestamp: now - 110_000,
    },
    {
      role: 'ASSISTANT',
      text: 'Encontrei o Cabernet Sauvignon Reserva por R$ 89,90. Adicionei ao seu carrinho!',
      timestamp: now - 105_000,
    },
  ],
}

export const SANDBOX_EXAMPLE_LABEL = 'Example: Product recommendation'

export function isSandboxExampleSession(sessionId: string): boolean {
  return sessionId === SANDBOX_EXAMPLE_SESSION_ID
}
