import { useMemo, useState } from 'react'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  XCircleIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ProdConversation, ProdEvaluation } from './mockProdConversations'

type Filter = 'all' | 'passed' | 'failed'

type Props = {
  conversation: ProdConversation
  selectedEvalId: string | null
  onSelectEval: (evalId: string) => void
  onCreateFromEval?: (evalId: string) => void
}

function EvalRow({
  evaluation,
  expanded,
  selected,
  onToggle,
  onSelect,
  onCreate,
}: {
  evaluation: ProdEvaluation
  expanded: boolean
  selected: boolean
  onToggle: () => void
  onSelect: () => void
  onCreate?: () => void
}) {
  const failed = evaluation.status === 'failed'
  const canCreate = failed && evaluation.prompt != null && evaluation.turnNumber != null

  return (
    <div
      className={cn(
        'border-b border-gray-100',
        selected && failed && 'bg-purple-50/70 ring-1 ring-inset ring-purple-200',
        failed && 'cursor-pointer hover:bg-gray-50'
      )}
      onClick={failed ? onSelect : undefined}
    >
      <div className="flex w-full items-start gap-2 px-4 py-3 text-left">
        {failed ? (
          <span
            className={cn(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
              selected
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-gray-300 bg-white'
            )}
            aria-hidden
          >
            {selected && <CheckIcon className="h-2.5 w-2.5" />}
          </span>
        ) : (
          <span className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={(e) => {
            e.stopPropagation()
            if (failed) onSelect()
            onToggle()
          }}
        >
          <div className="flex items-start gap-2">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-gray-800">
              {evaluation.name}
            </span>
            {expanded ? (
              <ChevronDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            ) : (
              <ChevronRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {evaluation.turnNumber !== undefined && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                Turn {evaluation.turnNumber}
              </span>
            )}
            {failed ? (
              <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                <XCircleIcon className="h-3 w-3" />
                Fail
              </span>
            ) : (
              <span className="rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                Pass
              </span>
            )}
            {selected && failed && (
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
                Selected for N+1
              </span>
            )}
          </div>
        </button>
      </div>
      {expanded && (evaluation.reason || evaluation.prompt || canCreate) && (
        <div className="space-y-2 border-t border-gray-100 bg-white/80 px-4 py-3 text-xs text-gray-600">
          {evaluation.reason && (
            <p>
              <span className="font-semibold text-gray-700">Reason:</span> {evaluation.reason}
            </p>
          )}
          {evaluation.prompt && (
            <p className="leading-relaxed">
              <span className="font-semibold text-gray-700">Prompt:</span> {evaluation.prompt}
            </p>
          )}
          {canCreate && (
            <Button
              type="button"
              size="sm"
              className={cn(
                'mt-1 h-8 w-full text-xs',
                selected ? 'bg-gray-900 hover:bg-gray-800' : 'bg-purple-700 hover:bg-purple-800'
              )}
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
                onCreate?.()
              }}
            >
              Create offline test · {evaluation.name}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function SessionEvaluationsPanel({
  conversation,
  selectedEvalId,
  onSelectEval,
  onCreateFromEval,
}: Props) {
  const [filter, setFilter] = useState<Filter>('failed')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(
    selectedEvalId ??
      conversation.failureEvalId ??
      conversation.evaluations.find((e) => e.status === 'failed')?.id ??
      null
  )

  const filtered = useMemo(() => {
    let list = conversation.evaluations
    if (filter === 'passed') list = list.filter((e) => e.status === 'passed')
    if (filter === 'failed') list = list.filter((e) => e.status === 'failed')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((e) => e.name.toLowerCase().includes(q))
    }
    return list
  }, [conversation.evaluations, filter, search])

  const failedCount = conversation.evaluations.filter((e) => e.status === 'failed').length

  return (
    <div className="flex min-h-0 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Evaluations ({conversation.evaluations.length})
        </h2>
        <p className="mt-0.5 text-[11px] text-gray-500">
          Pick a failed eval — each can fail on a different turn and creates its own N+1 test.
        </p>
      </div>
      <div className="space-y-2 border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            className="h-8 pl-8 text-xs"
            placeholder="Search evaluations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'passed', 'failed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f}
              {f === 'failed' && failedCount > 0 ? ` (${failedCount})` : ''}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {filtered.map((evaluation) => (
          <EvalRow
            key={evaluation.id}
            evaluation={evaluation}
            expanded={expandedId === evaluation.id}
            selected={selectedEvalId === evaluation.id}
            onToggle={() =>
              setExpandedId((id) => (id === evaluation.id ? null : evaluation.id))
            }
            onSelect={() => {
              onSelectEval(evaluation.id)
              setExpandedId(evaluation.id)
            }}
            onCreate={
              onCreateFromEval ? () => onCreateFromEval(evaluation.id) : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
