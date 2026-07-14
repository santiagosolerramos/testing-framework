import { ShieldCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { countConversationTurns, messagesToTurnPairs } from './conversationTurns'
import type { ProdConversation } from './mockProdConversations'
import { getRedactedInputNSlice } from './mockProdConversations'

type Props = {
  conversation: ProdConversation
  evalName?: string
  inheritedPrompt?: string
  /** Selected failed eval's turn — drives the input N slice */
  failureTurnNumber?: number
  onConfirm: () => void
  onBack: () => void
}

export function NPlusOnePreview({
  conversation,
  evalName,
  inheritedPrompt,
  failureTurnNumber,
  onConfirm,
  onBack,
}: Props) {
  const failTurn = failureTurnNumber ?? conversation.failureTurnNumber
  const inputN = getRedactedInputNSlice(conversation, failTurn)
  const inputTurnCount = countConversationTurns(
    inputN.map((m, i) => ({ ...m, timestamp: i }))
  )
  const hasPii = (conversation.piiRedactions?.length ?? 0) > 0

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-5">
      <h3 className="text-sm font-semibold text-gray-900">Preview input N</h3>
      <p className="mt-1 text-xs text-gray-600">
        Slice is built from the <strong>selected</strong> failed eval
        {evalName ? (
          <>
            {' '}
            (<code className="text-[11px]">{evalName}</code>
            {failTurn !== undefined ? <> · turn {failTurn}</> : null})
          </>
        ) : null}
        . Complete user+bot turns before that turn, plus the user message on the failure turn only.
      </p>

      {hasPii && (
        <div className="mt-4 flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div className="min-w-0 text-xs text-emerald-900">
            <p className="font-semibold">PII redacted before save</p>
            <ul className="mt-1 space-y-0.5 text-emerald-800/90">
              {conversation.piiRedactions!.map((r) => (
                <li key={r.field}>
                  <span className="font-medium">{r.field}:</span>{' '}
                  <span className="line-through opacity-70">{r.original}</span>
                  {' → '}
                  <code className="rounded bg-white/60 px-1">{r.redacted}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg border-2 border-dashed border-purple-300 bg-white p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-purple-700">
          Input N · {inputTurnCount} complete turn{inputTurnCount === 1 ? '' : 's'}
          {failTurn !== undefined && (
            <span className="font-normal normal-case text-gray-500">
              {' '}
              (through user on turn {failTurn})
            </span>
          )}
        </p>
        <div className="flex flex-col gap-4">
          {messagesToTurnPairs(inputN.map((m, i) => ({ ...m, timestamp: i }))).map((pair) => (
            <div key={pair.turnNumber} className="rounded-lg border border-gray-200 bg-gray-50/80 p-3">
              <p className="mb-2 text-[10px] font-semibold text-gray-500">Turn {pair.turnNumber}</p>
              <div className="flex flex-col gap-2 text-sm">
                <p>
                  <span className="text-[10px] font-semibold uppercase text-gray-400">User · </span>
                  {pair.user.text}
                </p>
                {pair.assistant && (
                  <p>
                    <span className="text-[10px] font-semibold uppercase text-gray-400">Bot · </span>
                    {(Array.isArray(pair.assistant) ? pair.assistant : [pair.assistant])
                      .map((a) => a.text)
                      .join(' ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-gray-200 bg-white px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          Inherited evaluation (from selected prod fail)
          {evalName && (
            <span className="ml-2 font-mono normal-case text-purple-700">{evalName}</span>
          )}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          {inheritedPrompt ?? conversation.inheritedEvalPrompt}
        </p>
        <p className="mt-2 text-[11px] text-gray-500">
          Same criterion and threshold as the failed production eval — no recalibration needed.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          className="bg-purple-700 hover:bg-purple-800"
          onClick={onConfirm}
        >
          Confirm and create test
          {evalName ? ` · ${evalName}` : ''}
        </Button>
        <Button type="button" variant="outline" onClick={onBack}>
          Back to conversation
        </Button>
      </div>
    </div>
  )
}
