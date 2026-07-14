import { useState } from 'react'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FlaskConicalIcon,
  InboxIcon,
  PlusIcon,
  StickyNoteIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProdConversation } from './mockProdConversations'
import { countConversationTurns, getEvaluationById } from './mockProdConversations'
import { NPlusOnePreview } from './NPlusOnePreview'
import { ProdConversationTurns } from './ProdConversationTurns'
import { SessionEvaluationsPanel } from './SessionEvaluationsPanel'

type AdminStep = 'conversation' | 'preview' | 'created'

type Props = {
  conversation: ProdConversation
  step: AdminStep
  selectedEvalId: string | null
  createdTestName?: string
  onBack: () => void
  onSelectEval: (evalId: string) => void
  onStepChange: (step: AdminStep) => void
  onConfirmCreate: () => void
  onOpenTestFramework: () => void
}

export function AdminSessionDetail({
  conversation,
  step,
  selectedEvalId,
  createdTestName,
  onBack,
  onSelectEval,
  onStepChange,
  onConfirmCreate,
  onOpenTestFramework,
}: Props) {
  const [showInferences, setShowInferences] = useState(false)

  const selectedEval = selectedEvalId
    ? getEvaluationById(conversation, selectedEvalId)
    : undefined
  const canCreate =
    conversation.hasTurnLevelEval &&
    conversation.evalStatus === 'failed' &&
    selectedEval?.status === 'failed' &&
    selectedEval.prompt != null

  if (step === 'created') {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-white p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <FlaskConicalIcon className="h-7 w-7 text-green-700" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Offline test created</h2>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          <strong>{createdTestName}</strong> was added as a draft N+1 test. Inherited eval from{' '}
          <code className="text-xs">{selectedEval?.name ?? conversation.failureEvalName}</code>.
        </p>
        <div className="mt-6 flex gap-2">
          <Button
            type="button"
            className="bg-purple-700 hover:bg-purple-800"
            onClick={onOpenTestFramework}
          >
            Open in test framework
          </Button>
          <Button type="button" variant="outline" onClick={() => onStepChange('conversation')}>
            Back to session
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Back to sessions"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <nav className="ml-1 flex min-w-0 items-center gap-1 text-sm text-gray-500">
            <button type="button" onClick={onBack} className="hover:text-gray-800 hover:underline">
              Sessions
            </button>
            <span>/</span>
            <span className="truncate font-mono text-xs text-gray-800">{conversation.sessionId}</span>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-xs text-gray-500">
          <button type="button" className="hover:text-gray-800">
            DD Logs
          </button>
          <button type="button" className="flex items-center gap-1 hover:text-gray-800">
            <InboxIcon className="h-3.5 w-3.5" />
            Inbox
          </button>
          <button type="button" className="flex items-center gap-1 hover:text-gray-800">
            <DownloadIcon className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </header>

      {/* Action bar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {conversation.reviewStatus === 'needs_review' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
              <TriangleAlertIcon className="h-3.5 w-3.5" />
              Needs Review
            </span>
          )}
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <PlusIcon className="h-3.5 w-3.5" />
            Tag
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <StickyNoteIcon className="h-3.5 w-3.5" />
            Add Notes
          </Button>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
            Discard
          </Button>
          <Button type="button" size="sm" className="h-8 bg-purple-700 text-xs hover:bg-purple-800">
            Save
          </Button>
        </div>
      </div>

      {step === 'preview' ? (
        <div className="min-h-0 flex-1 overflow-auto p-6">
          <NPlusOnePreview
            conversation={conversation}
            evalName={selectedEval?.name}
            inheritedPrompt={selectedEval?.prompt}
            onConfirm={onConfirmCreate}
            onBack={() => onStepChange('conversation')}
          />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)]">
          {/* Conversation */}
          <div className="flex min-h-0 flex-col border-r border-gray-200">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Conversation ({countConversationTurns(conversation.turns)} turns)
              </h2>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-500">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={showInferences}
                  onChange={(e) => setShowInferences(e.target.checked)}
                />
                Show inferences
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-[#e5ddd5]/30 px-4 py-5">
              <ProdConversationTurns
                conversation={conversation}
                showInferences={showInferences}
              />
            </div>
            <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-4">
              {selectedEval?.status === 'failed' && (
                <div className="mb-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-900">
                  <span className="font-semibold">{selectedEval.name}</span>
                  {selectedEval.turnNumber !== undefined && (
                    <> · failed at turn {selectedEval.turnNumber}</>
                  )}
                  {selectedEval.reason && (
                    <p className="mt-1 text-red-800/90">{selectedEval.reason}</p>
                  )}
                </div>
              )}
              {!conversation.hasTurnLevelEval && (
                <div className="mb-3 flex items-start gap-2 text-xs text-gray-600">
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  Session-level eval only — cannot create N+1 test without turn attribution.
                </div>
              )}
              {!selectedEvalId && conversation.hasTurnLevelEval && (
                <p className="mb-2 text-xs text-gray-500">
                  Select a failed eval on the right to enable test creation.
                </p>
              )}
              <Button
                type="button"
                size="sm"
                className={cn('w-full sm:w-auto', canCreate && 'bg-gray-900 hover:bg-gray-800')}
                disabled={!canCreate}
                onClick={() => onStepChange('preview')}
              >
                Create offline test
              </Button>
            </div>
          </div>

          <SessionEvaluationsPanel
            conversation={conversation}
            selectedEvalId={selectedEvalId}
            onSelectEval={onSelectEval}
          />
        </div>
      )}
    </div>
  )
}
