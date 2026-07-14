import { cn } from '@/lib/utils'
import {
  getAssistantsForTurn,
  messagesToTurnPairs,
  type ConversationTurnPair,
} from './conversationTurns'
import type { ProdConversation, ProdTurn } from './mockProdConversations'

function MessageBubble({
  turn,
  dimmed,
  highlight,
}: {
  turn: ProdTurn
  dimmed?: boolean
  highlight?: boolean
}) {
  const isUser = turn.role === 'USER'

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        isUser ? 'items-start' : 'items-end',
        dimmed && 'opacity-40'
      )}
    >
      <div
        className={cn(
          'max-w-[min(92%,28rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-gray-800',
          isUser
            ? 'rounded-tl-md border border-gray-200 bg-white shadow-sm'
            : 'rounded-tr-md bg-[#dcf8c6]',
          highlight && 'ring-2 ring-red-400 ring-offset-2'
        )}
      >
        {turn.text}
        {!isUser && (
          <span className="ml-2 inline text-[10px] text-gray-400">✓✓</span>
        )}
      </div>
      {turn.displayTime && (
        <span
          className={cn(
            'px-1 text-[10px] text-gray-400',
            isUser ? 'text-left' : 'text-right'
          )}
        >
          {turn.displayTime}
        </span>
      )}
    </div>
  )
}

function TurnBlock({
  pair,
  dimmed,
  isFailureTurn,
  isPartialInputN,
  failureEvalName,
}: {
  pair: ConversationTurnPair
  dimmed?: boolean
  isFailureTurn?: boolean
  isPartialInputN?: boolean
  failureEvalName?: string
}) {
  const assistants = getAssistantsForTurn(pair)

  return (
    <div
      className={cn(
        'rounded-lg border border-transparent px-2 py-3',
        isFailureTurn && 'border-red-200 bg-red-50/40',
        isPartialInputN && 'border-dashed border-purple-200 bg-purple-50/20'
      )}
    >
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        Turn {pair.turnNumber}
        {isFailureTurn && (
          <span className="ml-2 text-red-600">
            · failure on bot response
            {failureEvalName ? ` · ${failureEvalName}` : ''}
          </span>
        )}
        {isPartialInputN && (
          <span className="ml-2 text-purple-700">· user only in input N</span>
        )}
      </p>
      <div className="flex flex-col gap-3">
        <MessageBubble turn={pair.user} dimmed={dimmed} />
        {assistants.map((bot, i) => (
          <MessageBubble
            key={i}
            turn={bot}
            dimmed={dimmed}
            highlight={isFailureTurn && i === assistants.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

type Props = {
  conversation: ProdConversation
  /** Overrides conversation.failureTurnNumber — use the selected eval's turn */
  failureTurnNumber?: number
  highlightFailure?: boolean
  showInferences?: boolean
  failureEvalName?: string
}

export function ProdConversationTurns({
  conversation,
  failureTurnNumber,
  highlightFailure = true,
  showInferences = false,
  failureEvalName,
}: Props) {
  const failTurn = failureTurnNumber ?? conversation.failureTurnNumber
  const pairs = messagesToTurnPairs(conversation.turns)

  return (
    <div className="flex flex-col gap-4">
      {showInferences && (
        <p className="text-center text-[11px] italic text-gray-400">
          Inference traces hidden in prototype
        </p>
      )}
      {pairs.map((pair) => {
        const isFailureTurn =
          highlightFailure && failTurn !== undefined && pair.turnNumber === failTurn
        const isAfterFailure =
          highlightFailure && failTurn !== undefined && pair.turnNumber > failTurn
        const isPartialInputN = isFailureTurn

        return (
          <div key={pair.turnNumber}>
            {isAfterFailure && pair.turnNumber === failTurn! + 1 && (
              <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Post-failure · excluded from input N
              </p>
            )}
            <TurnBlock
              pair={pair}
              dimmed={isAfterFailure}
              isFailureTurn={isFailureTurn}
              isPartialInputN={isPartialInputN}
              failureEvalName={failureEvalName}
            />
          </div>
        )
      })}
    </div>
  )
}
