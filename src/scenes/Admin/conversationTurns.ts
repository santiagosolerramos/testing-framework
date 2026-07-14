import type { Message } from '@/types'
import type { ProdTurn } from './mockProdConversations'

/** One turn = user message + optional bot response(s) in the same exchange */
export type ConversationTurnPair = {
  turnNumber: number
  user: ProdTurn
  assistant?: ProdTurn | ProdTurn[]
}

/** Group flat prod messages into user+bot turns */
export function messagesToTurnPairs(messages: ProdTurn[]): ConversationTurnPair[] {
  const pairs: ConversationTurnPair[] = []
  let i = 0

  while (i < messages.length) {
    if (messages[i].role !== 'USER') {
      i++
      continue
    }
    const user = messages[i]
    i++
    const assistants: ProdTurn[] = []
    while (i < messages.length && messages[i].role === 'ASSISTANT') {
      assistants.push(messages[i])
      i++
    }
    pairs.push({
      turnNumber: pairs.length + 1,
      user,
      assistant:
        assistants.length === 0
          ? undefined
          : assistants.length === 1
            ? assistants[0]
            : assistants,
    })
  }

  return pairs
}

export function flattenTurnPair(pair: ConversationTurnPair): ProdTurn[] {
  const out: ProdTurn[] = [pair.user]
  if (!pair.assistant) return out
  if (Array.isArray(pair.assistant)) out.push(...pair.assistant)
  else out.push(pair.assistant)
  return out
}

export function countConversationTurns(messages: ProdTurn[]): number {
  return messagesToTurnPairs(messages).length
}

/**
 * Input N: complete turns before failureTurnNumber, plus user-only on the failure turn.
 * failureTurnNumber is 1-based (the turn whose bot response failed in prod).
 */
export function buildInputNMessages(
  messages: ProdTurn[],
  failureTurnNumber: number
): Message[] {
  const pairs = messagesToTurnPairs(messages)
  const out: Message[] = []

  for (const pair of pairs) {
    if (pair.turnNumber < failureTurnNumber) {
      out.push(...flattenTurnPair(pair))
    } else if (pair.turnNumber === failureTurnNumber) {
      out.push(pair.user)
      break
    }
  }

  return out
}

export function getAssistantsForTurn(pair: ConversationTurnPair): ProdTurn[] {
  if (!pair.assistant) return []
  return Array.isArray(pair.assistant) ? pair.assistant : [pair.assistant]
}
