import type { RunEntry } from './runTypes'

/** Scripted conversation shown for checkout-cep-lookup (matches design reference). */
export const CHECKOUT_CEP_LOOKUP_DEMO: RunEntry[] = [
  {
    type: 'user',
    text: 'Hi! I need help with checkout. Can you look up my postal code (CEP) in Brazil?',
  },
  {
    type: 'assistant',
    text: "Of course! I'd be happy to help you with your CEP lookup. Could you please share your 8-digit postal code?",
  },
  {
    type: 'callback',
    label: 'activity_check',
  },
  {
    type: 'user',
    text: '01310-100',
  },
  {
    type: 'assistant',
    text: 'I found your address in São Paulo — Avenida Paulista. Here is a product you might like:',
  },
  {
    type: 'product',
    name: 'Aspirina 500mg',
    price: 'R$ 12,90',
  },
]
