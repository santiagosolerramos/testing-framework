import type { SopHint } from '@/types/personaCreation'
import { getCatalogEntriesForSop, type CatalogEvalEntry } from './evaluationCatalog'

const MAX_SUGGESTED = 3

function descriptionMentions(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase()
  return terms.some((t) => lower.includes(t))
}

/** Default catalog ids per SOP when description has no extra signals. */
const SOP_DEFAULT_EVALS: Record<Exclude<SopHint, 'auto'>, string[]> = {
  faq: ['faq-kb-grounding', 'faq-complete-answer'],
  checkout: ['checkout-payment-options', 'checkout-delivery-options'],
  orderStatus: ['order-lookup', 'order-status-accuracy'],
  handover: ['handover-collection', 'handover-escalation'],
}

/** Heuristic pre-selection from description + resolved SOP (mock LLM later). */
export function suggestCatalogEvalIds(input: {
  description: string
  resolvedSop: SopHint
  sopHints: Exclude<SopHint, 'auto'>[]
}): string[] {
  const { description, resolvedSop, sopHints } = input
  const pool = getCatalogEntriesForSop(resolvedSop === 'auto' ? 'faq' : resolvedSop)
  const scores = new Map<string, number>()

  const boost = (id: string, amount: number) => {
    scores.set(id, (scores.get(id) ?? 0) + amount)
  }

  const primarySop = resolvedSop === 'auto' ? sopHints[0] ?? 'faq' : resolvedSop
  for (const id of SOP_DEFAULT_EVALS[primarySop] ?? []) {
    boost(id, 10)
  }

  if (primarySop === 'checkout') {
    if (descriptionMentions(description, ['cep', 'postal', 'endereço', 'endereco'])) {
      boost('checkout-cep', 9)
      boost('checkout-address', 8)
    }
    if (descriptionMentions(description, ['pagamento', 'payment', 'pix', 'cartão', 'cartao', 'boleto'])) {
      boost('checkout-payment-options', 8)
    }
    if (descriptionMentions(description, ['entrega', 'delivery', 'frete', 'envio', 'shipping'])) {
      boost('checkout-delivery-options', 8)
    }
  }

  if (primarySop === 'orderStatus') {
    if (descriptionMentions(description, ['cpf'])) boost('order-lookup', 6)
    if (descriptionMentions(description, ['rastreio', 'tracking', 'enviado'])) {
      boost('order-tracking-detail', 7)
    }
  }

  if (primarySop === 'faq') {
    if (descriptionMentions(description, ['política', 'politica', 'devolução', 'devolucao'])) {
      boost('faq-kb-grounding', 6)
    }
  }

  for (const hint of sopHints) {
    for (const id of SOP_DEFAULT_EVALS[hint] ?? []) {
      boost(id, 3)
    }
  }

  const ranked = pool
    .map((entry) => ({ entry, score: scores.get(entry.id) ?? 0 }))
    .sort((a, b) => b.score - a.score)

  const picked: string[] = []
  for (const { entry, score } of ranked) {
    if (picked.length >= MAX_SUGGESTED) break
    if (score > 0 || picked.length < 2) {
      picked.push(entry.id)
    }
  }

  if (picked.length === 0) {
    return pool.slice(0, Math.min(MAX_SUGGESTED, pool.length)).map((e) => e.id)
  }

  return picked
}

export function partitionCatalogEntries(
  resolvedSop: SopHint,
  _sopHints: Exclude<SopHint, 'auto'>[],
  suggestedIds: string[]
): {
  suggested: CatalogEvalEntry[]
  optional: CatalogEvalEntry[]
} {
  const all = getCatalogEntriesForSop(resolvedSop === 'auto' ? 'faq' : resolvedSop)
  const suggestedSet = new Set(suggestedIds)
  return {
    suggested: all.filter((e) => suggestedSet.has(e.id)),
    optional: all.filter((e) => !suggestedSet.has(e.id)),
  }
}
