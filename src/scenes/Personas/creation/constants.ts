import type { LanguageId, SopHint } from '@/types/personaCreation'

export const DESCRIPTION_MAX_LENGTH = 500

export const LANGUAGES: { id: LanguageId; label: string }[] = [
  { id: 'pt-BR', label: 'PT-BR' },
  { id: 'es-ES', label: 'ES-ES' },
  { id: 'en-US', label: 'EN-US' },
]

/** Multi-select orientation hints (not binding) */
export const SOP_HINT_OPTIONS: { id: Exclude<SopHint, 'auto'>; label: string }[] = [
  { id: 'faq', label: 'FAQ' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'orderStatus', label: 'Order status' },
  { id: 'handover', label: 'Handover' },
]

export const SOP_MAX_TURNS: Record<Exclude<SopHint, 'auto'>, number> = {
  faq: 5,
  handover: 10,
  orderStatus: 15,
  checkout: 20,
}

export const TRANSACTIONAL_KEYWORDS = [
  'cep',
  'checkout',
  'finalizar compra',
  'cpf',
  'carrinho',
  'pagamento',
  'frete',
  'endereço',
  'pedido',
]

export const DESCRIPTION_PLACEHOLDER =
  'Un cliente quiere cancelar su pedido 321654987321 que ya fue enviado. Debe entregar su CPF cuando el bot lo pida y el bot debe escalar a humano.'

export const TRANSCRIPT_PLACEHOLDER = `User: Olá, qual o status do meu pedido?
Assistant: Claro! Pode informar o número do pedido?
User: 321654987321
Assistant: Seu pedido foi enviado e está a caminho.`
