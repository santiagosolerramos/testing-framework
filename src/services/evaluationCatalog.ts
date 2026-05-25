import { ulid } from 'ulid'
import type { EvaluationCriterion } from '@/types'
import type { SopHint } from '@/types/personaCreation'

export type CatalogEvalEntry = {
  id: string
  /** SOPs this eval applies to; use `*` for all flows */
  sops: SopHint[] | '*'
  label: string
  description: string
  /** Prompt template; `{goal}` is replaced when building criteria */
  promptTemplate: string
}

export const EVALUATION_CATALOG: CatalogEvalEntry[] = [
  // ─── FAQ ───────────────────────────────────────────────────────────────────
  {
    id: 'faq-kb-grounding',
    sops: ['faq'],
    label: 'KB grounding',
    description: "Assistant's answer is grounded in the knowledge base, not invented.",
    promptTemplate:
      "Output 1 if the assistant's answer is grounded in the knowledge base and not invented, otherwise 0.",
  },
  {
    id: 'faq-complete-answer',
    sops: ['faq'],
    label: 'Complete answer',
    description: 'Assistant fully answers the customer question without deflecting.',
    promptTemplate:
      'Output 1 if the assistant directly answers the customer question without unnecessary deflection, otherwise 0.',
  },
  // ─── Checkout ────────────────────────────────────────────────────────────
  {
    id: 'checkout-payment-options',
    sops: ['checkout'],
    label: 'Payment options shared',
    description: 'Assistant presents the expected payment methods (e.g. card, PIX, boleto).',
    promptTemplate:
      'Output 1 if the assistant clearly shares the expected payment options available for checkout, otherwise 0.',
  },
  {
    id: 'checkout-delivery-options',
    sops: ['checkout'],
    label: 'Delivery options shown',
    description: 'Assistant shows delivery or shipping options before payment.',
    promptTemplate:
      'Output 1 if the assistant presents delivery or shipping options to the customer, otherwise 0.',
  },
  {
    id: 'checkout-cep',
    sops: ['checkout'],
    label: 'CEP validation',
    description: 'Assistant asks for and validates a Brazilian postal code (CEP).',
    promptTemplate:
      'Output 1 if the assistant asks for and validates a Brazilian CEP (8 digits), otherwise 0.',
  },
  {
    id: 'checkout-address',
    sops: ['checkout'],
    label: 'Address confirmation',
    description: 'Assistant confirms delivery address after CEP lookup.',
    promptTemplate:
      'Output 1 if the assistant confirms the delivery address returned from CEP lookup, otherwise 0.',
  },
  // ─── Order status ──────────────────────────────────────────────────────────
  {
    id: 'order-lookup',
    sops: ['orderStatus'],
    label: 'Order identifier collected',
    description: 'Assistant requests order number or CPF before looking up status.',
    promptTemplate:
      'Output 1 if the assistant asks for order number or CPF before providing status, otherwise 0.',
  },
  {
    id: 'order-status-accuracy',
    sops: ['orderStatus'],
    label: 'Order status accuracy',
    description: 'Status returned matches lookup results (not hallucinated).',
    promptTemplate:
      'Output 1 if the assistant provides a specific order status grounded in lookup results, otherwise 0.',
  },
  {
    id: 'order-tracking-detail',
    sops: ['orderStatus'],
    label: 'Tracking / delivery detail',
    description: 'Assistant includes relevant tracking or delivery timing when available.',
    promptTemplate:
      'Output 1 if the assistant shares tracking or delivery timing details when available, otherwise 0.',
  },
  // ─── Handover ──────────────────────────────────────────────────────────────
  {
    id: 'handover-collection',
    sops: ['handover'],
    label: 'Handover information collection',
    description: 'Assistant collects required details before escalating to a human.',
    promptTemplate:
      'Output 1 if the assistant collected required information before escalating to a human, otherwise 0.',
  },
  {
    id: 'handover-escalation',
    sops: ['handover'],
    label: 'Clean escalation',
    description: 'Assistant escalates clearly without looping or refusing help.',
    promptTemplate:
      'Output 1 if the assistant escalates to a human agent with a clear handoff message, otherwise 0.',
  },
]

const SOP_LABEL: Record<Exclude<SopHint, 'auto'>, string> = {
  faq: 'FAQ',
  checkout: 'Checkout',
  orderStatus: 'Order status',
  handover: 'Handover',
}

export function getSopDisplayLabel(sop: SopHint): string {
  if (sop === 'auto') return 'General'
  return SOP_LABEL[sop] ?? sop
}

export function entryAppliesToSop(entry: CatalogEvalEntry, sop: SopHint): boolean {
  if (entry.sops === '*') return true
  return entry.sops.includes(sop)
}

/** Only evals owned by this SOP (excludes universal entries). Used in description wizard. */
export function getCatalogEntriesForSop(sop: SopHint): CatalogEvalEntry[] {
  if (sop === 'auto') {
    return EVALUATION_CATALOG.filter((e) => e.sops !== '*')
  }
  return EVALUATION_CATALOG.filter((e) => e.sops !== '*' && entryAppliesToSop(e, sop))
}

/** @deprecated Use getCatalogEntriesForSop — union with hints */
export function getCatalogForContext(
  resolvedSop: SopHint,
  sopHints: Exclude<SopHint, 'auto'>[]
): CatalogEvalEntry[] {
  const sops = new Set<SopHint>([resolvedSop, ...sopHints])
  const seen = new Set<string>()
  const out: CatalogEvalEntry[] = []
  for (const entry of EVALUATION_CATALOG) {
    if (seen.has(entry.id) || entry.sops === '*') continue
    const applies = [...sops].some((s) => entryAppliesToSop(entry, s))
    if (applies) {
      seen.add(entry.id)
      out.push(entry)
    }
  }
  return out
}

export function getCatalogEntryById(id: string): CatalogEvalEntry | undefined {
  return EVALUATION_CATALOG.find((e) => e.id === id)
}

export function buildGoalCompletionCriterion(goal: string): EvaluationCriterion {
  return {
    id: ulid(),
    prompt: `Output 1 if the assistant accomplishes the goal: "${goal.slice(0, 160)}", otherwise 0.`,
  }
}

export function buildPromptForEntry(entry: CatalogEvalEntry, goal: string): string {
  return entry.promptTemplate.replace(/\{goal\}/g, goal.slice(0, 160))
}

export function wrapCustomEvalPrompt(userText: string): string {
  const t = userText.trim()
  if (!t) return ''
  if (/^output\s+1/i.test(t)) return t
  return `Output 1 if the following is satisfied: ${t}, otherwise 0.`
}

export function buildCriteriaFromCatalog(
  goal: string,
  selectedCatalogIds: string[],
  customPrompts?: Record<string, string>,
  additionalCustomPrompts?: string[]
): EvaluationCriterion[] {
  const criteria: EvaluationCriterion[] = [buildGoalCompletionCriterion(goal)]

  for (const id of selectedCatalogIds) {
    const entry = getCatalogEntryById(id)
    if (!entry) continue
    criteria.push({
      id: ulid(),
      prompt: customPrompts?.[id] ?? buildPromptForEntry(entry, goal),
    })
  }

  for (const raw of additionalCustomPrompts ?? []) {
    const prompt = wrapCustomEvalPrompt(raw)
    if (prompt) {
      criteria.push({ id: ulid(), prompt })
    }
  }

  return criteria
}
