import { useMemo, useState } from 'react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  XCircleIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ProdConversation, ProdEvaluation } from './mockProdConversations'

type Filter = 'all' | 'passed' | 'failed'

type Props = {
  conversation: ProdConversation
  selectedEvalId: string | null
  onSelectEval: (evalId: string) => void
}

function EvalRow({
  evaluation,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  evaluation: ProdEvaluation
  expanded: boolean
  selected: boolean
  onToggle: () => void
  onSelect: () => void
}) {
  const failed = evaluation.status === 'failed'

  return (
    <div
      className={cn(
        'border-b border-gray-100',
        selected && failed && 'bg-red-50/60',
        failed && 'cursor-pointer hover:bg-gray-50'
      )}
      onClick={failed ? onSelect : undefined}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
      >
        {expanded ? (
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-400" />
        )}
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-gray-800">
          {evaluation.name}
        </span>
        {failed ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
            <XCircleIcon className="h-3 w-3" />
            Fail
          </span>
        ) : (
          <span className="shrink-0 rounded border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
            Pass
          </span>
        )}
      </button>
      {expanded && (evaluation.reason || evaluation.prompt) && (
        <div className="space-y-2 border-t border-gray-100 bg-gray-50/80 px-4 py-3 text-xs text-gray-600">
          {evaluation.turnNumber !== undefined && (
            <p>
              <span className="font-semibold text-gray-700">Turn:</span> {evaluation.turnNumber}
            </p>
          )}
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
          {failed && selected && (
            <p className="font-medium text-purple-800">
              Selected for N+1 test · use Create offline test below
            </p>
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
}: Props) {
  const [filter, setFilter] = useState<Filter>('failed')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(
    conversation.failureEvalId ?? conversation.evaluations.find((e) => e.status === 'failed')?.id ?? null
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
            onSelect={() => onSelectEval(evaluation.id)}
          />
        ))}
      </div>
    </div>
  )
}
