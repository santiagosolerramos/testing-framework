import { ulid } from 'ulid'
import type { Persona } from '@/types'
import { buildInputNMessages } from './conversationTurns'
import {
  buildNPlusOneTestName,
  getEvaluationById,
  getRedactedInputNSlice,
  type ProdConversation,
} from './mockProdConversations'

export function createNPlusOnePersona(
  conversation: ProdConversation,
  evalId?: string
): Persona {
  const evalMeta = evalId ? getEvaluationById(conversation, evalId) : undefined
  const failureTurnNumber =
    evalMeta?.turnNumber ?? conversation.failureTurnNumber ?? 1
  const inputNMessages =
    conversation.id === 'prod-conv-001'
      ? getRedactedInputNSlice({ ...conversation, failureTurnNumber })
      : buildInputNMessages(conversation.turns, failureTurnNumber)
  const inheritedPrompt =
    evalMeta?.prompt ??
    conversation.inheritedEvalPrompt ??
    'Output 1 if the assistant response meets the production eval criteria, otherwise 0.'
  const evalName = evalMeta?.name ?? conversation.failureEvalName ?? 'Production eval'
  const failureReason = evalMeta?.reason ?? conversation.failureReason ?? ''

  return {
    id: ulid(),
    testKind: 'n-plus-one',
    personaKey: buildNPlusOneTestName(conversation, evalName),
    status: 'draft',
    sectionId: conversation.sectionId,
    validationPasses: 0,
    objectives: [],
    evaluation: {
      maxTurns: 1,
      criteria: [{ id: ulid(), prompt: inheritedPrompt }],
    },
    nPlusOne: {
      prodConversationId: conversation.id,
      agentName: conversation.agentName,
      failureTurnNumber,
      failureEvalName: evalName,
      failureReason,
      inputNMessages,
      inheritedEvalPrompt: inheritedPrompt,
      piiRedacted: (conversation.piiRedactions?.length ?? 0) > 0,
    },
    createdAt: Date.now(),
  }
}
