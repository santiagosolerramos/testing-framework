import type { LanguageId, SopHint } from '@/types/personaCreation'

/** Step-by-step customer actions from a scenario description (not transcript replay) */
export function buildStepByStepFromDescription(
  description: string,
  language: LanguageId,
  resolvedSop: SopHint
): string {
  const lower = description.toLowerCase()
  const pt = language === 'pt-BR'
  const es = language === 'es-ES'

  if (resolvedSop === 'checkout') {
    const steps: string[] = []
    const add = (n: number, ptText: string, enText: string, esText: string) => {
      const text = pt ? ptText : es ? esText : enText
      steps.push(`${n}. ${text}`)
    }

    add(
      1,
      'Inicie pedindo ajuda para finalizar a compra e concluir o checkout.',
      'Start by asking for help to finish your purchase and complete checkout.',
      'Empiece pidiendo ayuda para finalizar la compra y completar el checkout.'
    )

    if (/cep|zip|postal/i.test(lower)) {
      const cepMatch = description.match(/\d{5}-?\d{3}/)
      const cep = cepMatch?.[0] ?? '01310-100'
      add(
        2,
        `Quando o assistente solicitar o CEP, informe ${cep}.`,
        `When the assistant asks for your ZIP/CEP, provide ${cep}.`,
        `Cuando el asistente pida el CEP, indique ${cep}.`
      )
    } else {
      add(
        2,
        'Quando o assistente solicitar o CEP ou endereço, informe o dado pedido.',
        'When the assistant asks for ZIP/CEP or address, provide the requested data.',
        'Cuando el asistente pida el CEP o la dirección, proporcione el dato solicitado.'
      )
    }

    add(
      3,
      'Confirme o endereço de entrega apresentado pelo assistente.',
      'Confirm the delivery address shown by the assistant.',
      'Confirme la dirección de entrega que muestre el asistente.'
    )

    if (/entrega|frete|delivery|envío/i.test(lower)) {
      const preferNormal = /normal|padrão|standard/i.test(lower) && !/express/i.test(lower)
      add(
        4,
        preferNormal
          ? 'Peça para ver as opções de entrega e escolha a entrega normal.'
          : 'Peça para ver as opções de entrega e escolha a opção desejada.',
        preferNormal
          ? 'Ask to see delivery options and choose standard delivery.'
          : 'Ask to see delivery options and pick your preferred option.',
        preferNormal
          ? 'Pida ver las opciones de envío y elija la entrega normal.'
          : 'Pida ver las opciones de envío y elija la deseada.'
      )
    } else {
      add(
        4,
        'Peça para ver as opções de entrega e selecione uma opção.',
        'Ask to see delivery options and select one.',
        'Pida ver las opciones de envío y seleccione una.'
      )
    }

    if (/pix|cartão|card|boleto|pagamento|payment/i.test(lower)) {
      const method = /pix/i.test(lower)
        ? 'PIX'
        : /cartão|card|crédito|credit/i.test(lower)
          ? pt
            ? 'cartão de crédito'
            : es
              ? 'tarjeta'
              : 'credit card'
          : pt
            ? 'a forma de pagamento indicada no cenário'
            : 'the payment method from your scenario'
      add(
        5,
        `Peça as formas de pagamento disponíveis e selecione ${method}.`,
        `Ask for available payment methods and select ${method}.`,
        `Pida las formas de pago y seleccione ${method}.`
      )
    } else {
      add(
        5,
        'Peça as formas de pagamento e selecione a opção desejada.',
        'Ask for payment methods and select your preferred option.',
        'Pida las formas de pago y seleccione la opción deseada.'
      )
    }

    add(
      6,
      'Revise o resumo do pedido e confirme a finalização.',
      'Review the order summary and confirm checkout completion.',
      'Revise el resumen del pedido y confirme la finalización.'
    )

    return steps.join('\n')
  }

  if (resolvedSop === 'orderStatus') {
    const orderMatch = description.match(/\d{10,}/)
    const order = orderMatch?.[0]
    const lines = pt
      ? [
          '1. Pergunte o status do seu pedido.',
          order
            ? `2. Quando solicitado, informe o número do pedido ${order}.`
            : '2. Quando solicitado, informe o número do pedido.',
          '3. Confirme se a resposta do assistente resolve sua dúvida.',
        ]
      : es
        ? [
            '1. Pregunte el estado de su pedido.',
            order
              ? `2. Cuando lo pidan, indique el número de pedido ${order}.`
              : '2. Cuando lo pidan, indique el número de pedido.',
            '3. Confirme si la respuesta del asistente resuelve su consulta.',
          ]
        : [
            '1. Ask for your order status.',
            order
              ? `2. When asked, provide order number ${order}.`
              : '2. When asked, provide your order number.',
            '3. Confirm the assistant answer resolves your question.',
          ]
    return lines.join('\n')
  }

  if (resolvedSop === 'handover') {
    const lines = pt
      ? [
          '1. Explique sua solicitação ou problema ao assistente.',
          '2. Forneça CPF, número do pedido ou outros dados quando o bot solicitar.',
          '3. Peça explicitamente para falar com um atendente humano se o bot não resolver.',
        ]
      : es
        ? [
            '1. Explique su solicitud o problema al asistente.',
            '2. Proporcione CPF, número de pedido u otros datos cuando el bot lo pida.',
            '3. Pida hablar con un agente humano si el bot no resuelve.',
          ]
        : [
            '1. Explain your request or issue to the assistant.',
            '2. Provide CPF, order number, or other data when the bot asks.',
            '3. Ask to speak with a human agent if the bot cannot resolve it.',
          ]
    return lines.join('\n')
  }

  // FAQ / default
  const snippet =
    description.length > 120 ? `${description.slice(0, 117).trim()}…` : description.trim()
  return pt
    ? `1. Apresente sua dúvida ao assistente: "${snippet}".\n2. Responda perguntas de esclarecimento do bot, se houver.\n3. Confirme se a resposta atende sua necessidade.`
    : es
      ? `1. Plantee su consulta al asistente: "${snippet}".\n2. Responda aclaraciones del bot si las hay.\n3. Confirme si la respuesta satisface su necesidad.`
      : `1. State your question to the assistant: "${snippet}".\n2. Answer any clarifying questions from the bot.\n3. Confirm whether the answer meets your need.`
}

export function inferDescriptionEndGoal(
  description: string,
  language: LanguageId,
  resolvedSop: SopHint
): string {
  const lower = description.toLowerCase()
  const pt = language === 'pt-BR'
  const es = language === 'es-ES'

  if (resolvedSop === 'checkout') {
    if (/pix/i.test(lower)) {
      return pt
        ? 'A conversa deve terminar quando o assistente confirmar o pedido finalizado com PIX e entrega selecionada.'
        : es
          ? 'La conversación debe terminar cuando el asistente confirme el pedido con PIX y envío seleccionado.'
          : 'The conversation should end when the assistant confirms the order with PIX and delivery selected.'
    }
    return pt
      ? 'A conversa deve terminar quando o assistente concluir o checkout (CEP, entrega e pagamento validados).'
      : es
        ? 'La conversación debe terminar cuando el asistente complete el checkout (CEP, envío y pago validados).'
        : 'The conversation should end when the assistant completes checkout (ZIP, delivery, and payment validated).'
  }

  if (resolvedSop === 'handover') {
    return pt
      ? 'A conversa deve terminar quando o assistente escalar para um atendente humano.'
      : es
        ? 'La conversación debe terminar cuando el asistente escale a un agente humano.'
        : 'The conversation should end when the agent escalates to a human.'
  }

  if (resolvedSop === 'orderStatus') {
    return pt
      ? 'A conversa deve terminar quando o assistente informar o status do pedido corretamente.'
      : es
        ? 'La conversación debe terminar cuando el asistente informe el estado del pedido correctamente.'
        : 'The conversation should end when the agent provides the correct order status.'
  }

  return pt
    ? 'A conversa deve terminar quando o assistente responder à pergunta com base na base de conhecimento.'
    : es
      ? 'La conversación debe terminar cuando el asistente responda usando la base de conocimiento.'
      : 'The conversation should end when the agent answers using the knowledge base.'
}
