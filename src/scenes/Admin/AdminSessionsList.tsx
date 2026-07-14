import { ChevronRightIcon, XCircleIcon } from 'lucide-react'
import type { ProdConversation } from './mockProdConversations'

type Props = {
  conversations: ProdConversation[]
  onSelect: (id: string) => void
}

export function AdminSessionsList({ conversations, onSelect }: Props) {
  const rows = [...conversations].sort((a, b) => {
    if (a.evalStatus === b.evalStatus) return 0
    return a.evalStatus === 'failed' ? -1 : 1
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Sessions</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Production conversations · open a session to review evals and create N+1 tests
        </p>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Session</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Evals</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((conv) => {
              const failedCount = conv.evaluations.filter((e) => e.status === 'failed').length
              return (
                <tr
                  key={conv.id}
                  className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                  onClick={() => onSelect(conv.id)}
                >
                  <td className="px-6 py-3">
                    <p className="font-mono text-xs text-gray-800">{conv.sessionId.slice(0, 18)}…</p>
                    <p className="mt-0.5 text-xs text-gray-500">{conv.customerLabel}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">WhatsApp</td>
                  <td className="px-4 py-3 text-gray-600">{conv.agentName}</td>
                  <td className="px-4 py-3 text-gray-500">{conv.timestamp}</td>
                  <td className="px-4 py-3">
                    {conv.reviewStatus === 'needs_review' ? (
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                        Needs review
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Reviewed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {conv.evalStatus === 'failed' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                        <XCircleIcon className="h-3.5 w-3.5" />
                        {failedCount} failed
                      </span>
                    ) : (
                      <span className="text-xs text-green-600">Passed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-gray-100 px-6 py-2 text-[10px] text-gray-400">
        Static prototype — data is mocked for N+1 offline test creation demo
      </p>
    </div>
  )
}
