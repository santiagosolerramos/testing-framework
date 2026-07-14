import type { RefObject } from 'react'
import { CheckCircle2Icon, LockIcon, SparklesIcon, XCircleIcon } from 'lucide-react'
import type { TestRunStatus } from '@/types'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'
import type { RunEntry } from './runTypes'

const BUBBLE =
  'max-w-[min(85%,36rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-gray-800'

function FrozenBubble({ role, text }: { role: Message['role']; text: string }) {
  const isUser = role === 'USER'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          BUBBLE,
          'border border-dashed border-gray-300/80 bg-gray-50/90 text-gray-700',
          isUser ? 'rounded-tr-md' : 'rounded-tl-md'
        )}
      >
        {text}
      </div>
    </div>
  )
}

function GeneratedBubble({ type, text }: { type: 'user' | 'assistant'; text: string }) {
  const isUser = type === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          BUBBLE,
          isUser
            ? 'rounded-tr-md bg-green-100 ring-2 ring-purple-200 ring-offset-1'
            : 'rounded-tl-md border border-purple-200 bg-white shadow-sm ring-2 ring-purple-300 ring-offset-1'
        )}
      >
        {text}
        {!isUser && (
          <span className="ml-2 text-[10px] font-medium text-purple-600">new</span>
        )}
      </div>
    </div>
  )
}

type Props = {
  inputNMessages: Message[]
  generatedEntries: RunEntry[]
  running?: boolean
  runStatus?: TestRunStatus
  evalPassed?: boolean
  messagesEndRef?: RefObject<HTMLDivElement | null>
}

export function NPlusOneRunView({
  inputNMessages,
  generatedEntries,
  running,
  runStatus,
  evalPassed,
  messagesEndRef,
}: Props) {
  const hasGenerated = generatedEntries.length > 0 || running
  const runFinished =
    runStatus === 'TEST_RUN_STATUS_PASSED' || runStatus === 'TEST_RUN_STATUS_FAILED'

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="rounded-xl border border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2.5">
          <LockIcon className="h-3.5 w-3.5 text-gray-500" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800">Input N · from production</p>
            <p className="text-[10px] text-gray-500">
              Frozen context — not simulated by this test run
            </p>
          </div>
          <span className="shrink-0 rounded bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            read-only
          </span>
        </div>
        <div className="flex flex-col gap-4 px-4 py-4">
          {inputNMessages.map((m, i) => (
            <FrozenBubble key={`input-${i}`} role={m.role} text={m.text} />
          ))}
        </div>
      </section>

      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-purple-200" />
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-purple-800">
          <SparklesIcon className="h-3 w-3" />
          This test run
        </span>
        <div className="h-px flex-1 bg-purple-200" />
      </div>

      <section
        className={cn(
          'rounded-xl border-2 border-dashed transition-colors',
          hasGenerated ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200 bg-white'
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-purple-100 px-4 py-2.5">
          <div>
            <p className="text-xs font-semibold text-purple-900">LLM response under evaluation</p>
            <p className="text-[10px] text-purple-700/80">
              Generated when you click Test — compared against the inherited prod eval
            </p>
          </div>
          {runFinished && evalPassed !== undefined && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                evalPassed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}
            >
              {evalPassed ? (
                <CheckCircle2Icon className="h-3 w-3" />
              ) : (
                <XCircleIcon className="h-3 w-3" />
              )}
              {evalPassed ? 'Eval passed' : 'Eval failed'}
            </span>
          )}
        </div>
        <div className="flex min-h-[5rem] flex-col gap-4 px-4 py-4">
          {!hasGenerated && (
            <p className="py-6 text-center text-xs text-gray-400">
              Run Test to generate the assistant reply for this turn
            </p>
          )}
          {generatedEntries.map((entry, i) => {
            if (entry.type === 'callback') return null
            if (entry.type === 'product') return null
            return (
              <GeneratedBubble
                key={`gen-${i}`}
                type={entry.type === 'user' ? 'user' : 'assistant'}
                text={entry.text}
              />
            )
          })}
          {running && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-md border border-purple-200 bg-white px-4 py-3 shadow-sm">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((n) => (
                    <span
                      key={n}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400"
                      style={{ animationDelay: `${n * 150}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
      {messagesEndRef && <div ref={messagesEndRef} />}
    </div>
  )
}
