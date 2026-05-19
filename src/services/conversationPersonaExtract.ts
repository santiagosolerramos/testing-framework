import type { LanguageId, ParsedConversationTurn } from '@/types/personaCreation'

/** Step-by-step user actions (not transcript replay, not bot behavior) */
export function buildStepByStepInstructions(
  turns: ParsedConversationTurn[],
  language: LanguageId = 'pt-BR'
): string {
  const userTurns = turns.filter((t) => t.role === 'user' && t.text.trim())
  if (userTurns.length === 0) {
    return language === 'pt-BR'
      ? '1. Inicie a conversa com sua solicitação ao assistente.'
      : '1. Start the conversation with your request to the assistant.'
  }

  const steps = userTurns.map((turn, i) => userMessageToStep(turn.text, i + 1, turns, language))
  return steps.join('\n')
}

/** When the test conversation should end — agent outcome, not first user line */
export function inferConversationEndGoal(
  turns: ParsedConversationTurn[],
  language: LanguageId = 'pt-BR'
): string {
  const allText = turns.map((t) => t.text).join(' ').toLowerCase()
  const lastBot = [...turns].reverse().find((t) => t.role === 'bot')?.text.toLowerCase() || ''

  const pt = language === 'pt-BR'

  if (/adicion(ei|ar|ado).*carrinho|carrinho|add.*cart/i.test(lastBot + allText)) {
    return pt
      ? 'A conversa deve terminar quando o agente adicionar o produto recomendado ao carrinho.'
      : 'The conversation should end when the agent adds the recommended product to the cart.'
  }

  if (/recomend|sugir|encontrei|opções|opciones/i.test(lastBot + allText)) {
    return pt
      ? 'A conversa deve terminar quando o agente apresentar uma recomendação de produto relevante à solicitação.'
      : 'The conversation should end when the agent presents a relevant product recommendation.'
  }

  if (/humano|escalar|atendente|handover/i.test(allText)) {
    return pt
      ? 'A conversa deve terminar quando o agente escalar para um atendente humano.'
      : 'The conversation should end when the agent escalates to a human agent.'
  }

  if (/pedido|order|status|enviado|entrega/i.test(allText)) {
    return pt
      ? 'A conversa deve terminar quando o agente informar o status do pedido corretamente.'
      : 'The conversation should end when the agent provides the correct order status.'
  }

  if (/cep|endereço|checkout|frete/i.test(allText)) {
    return pt
      ? 'A conversa deve terminar quando o agente validar o CEP ou concluir o passo de checkout solicitado.'
      : 'The conversation should end when the agent validates the CEP or completes the requested checkout step.'
  }

  if (/faq|dúvida|pergunta|horário|política/i.test(allText)) {
    return pt
      ? 'A conversa deve terminar quando o agente responder à pergunta com base na base de conhecimento.'
      : 'The conversation should end when the agent answers the question using the knowledge base.'
  }

  return pt
    ? 'A conversa deve terminar quando o agente resolver a solicitação do usuário de forma completa.'
    : 'The conversation should end when the agent fully resolves the user request.'
}

function userMessageToStep(
  text: string,
  stepNum: number,
  allTurns: ParsedConversationTurn[],
  language: LanguageId
): string {
  const t = text.trim()
  const lower = t.toLowerCase()
  const pt = language === 'pt-BR'
  const turnIndex = allTurns.findIndex((x) => x.role === 'user' && x.text.trim() === t)
  const priorBot =
    turnIndex > 0
      ? [...allTurns.slice(0, turnIndex)].reverse().find((x) => x.role === 'bot')?.text.toLowerCase()
      : ''

  // Opening intent / search
  if (
    stepNum === 1 ||
    /procurando|buscando|quero|preciso|gostaria|looking for|searching/i.test(lower)
  ) {
    if (/vinho|wine|produto|product|shampoo|cabernet/i.test(lower)) {
      const topic = extractTopicPhrase(t, pt)
      return pt
        ? `${stepNum}. Diga que está procurando ${topic}.`
        : `${stepNum}. Say that you are looking for ${topic}.`
    }
    return pt
      ? `${stepNum}. Apresente sua solicitação inicial ao assistente (o que você precisa).`
      : `${stepNum}. State your initial request to the assistant (what you need).`
  }

  // Confirm preference after bot suggestion
  if (
    /^sim\b|claro|perfeito|ótimo|otimo|seria ótimo|would be great|yes,/i.test(lower) ||
    (/cabernet|malbec|merlot|opción|opção/i.test(lower) && /sim|yes|ótimo/i.test(lower))
  ) {
    if (/carrinho|adicionar|add/i.test(lower)) {
      return pt
        ? `${stepNum}. Confirme a preferência e peça para adicionar ao carrinho.`
        : `${stepNum}. Confirm your preference and ask to add it to the cart.`
    }
    return pt
        ? `${stepNum}. Confirme a preferência indicada pelo assistente (ex.: tipo de produto sugerido).`
        : `${stepNum}. Confirm the preference suggested by the assistant (e.g. product type).`
  }

  // Explicit cart / checkout action
  if (/carrinho|adicionar|add to cart|colocar no carrinho/i.test(lower)) {
    return pt
      ? `${stepNum}. Peça para adicionar a recomendação ao carrinho.`
      : `${stepNum}. Ask to add the recommendation to the cart.`
  }

  // Provide data when asked
  if (/cpf|pedido|número|numero|cep|\d{5,}/i.test(lower)) {
    return pt
      ? `${stepNum}. Informe os dados solicitados pelo bot (ex.: CPF, número do pedido ou CEP).`
      : `${stepNum}. Provide the data requested by the bot (e.g. CPF, order number, or ZIP).`
  }

  // Follow-up on bot topic
  if (priorBot && /prefere|qual|which|informe|pode/i.test(priorBot)) {
    return pt
      ? `${stepNum}. Responda à pergunta do assistente de forma natural.`
      : `${stepNum}. Answer the assistant's question naturally.`
  }

  return pt
    ? `${stepNum}. ${imperativeFromUserLine(t)}`
    : `${stepNum}. ${imperativeFromUserLine(t)}`
}

function extractTopicPhrase(text: string, pt: boolean): string {
  const lower = text.toLowerCase()
  if (/vinho tinto/i.test(lower)) {
    return pt ? 'um vinho tinto para um jantar especial' : 'a red wine for a special dinner'
  }
  if (/vinho/i.test(lower)) {
    return pt ? 'um vinho adequado à ocasião' : 'a suitable wine'
  }
  if (/produto|product/i.test(lower)) {
    return pt ? 'um produto adequado à sua necessidade' : 'a product that fits your needs'
  }
  const cleaned = text.replace(/^(oi|olá|ola|hi|hello)[!,.\s]*/i, '').trim()
  return cleaned.length > 80 ? `${cleaned.slice(0, 77)}…` : cleaned
}

function imperativeFromUserLine(text: string): string {
  const cleaned = text.replace(/^(oi|olá|ola)[!,.\s]*/i, '').trim()
  if (!cleaned) return 'Continue a conversa conforme o fluxo esperado.'
  return `Diga ao assistente: "${cleaned}"`
}
