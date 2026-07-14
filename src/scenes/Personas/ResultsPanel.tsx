import { useAtomValue } from 'jotai'
import { CheckCircle2Icon, ChevronDownIcon, ChevronUpIcon, XCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { personasAtom, selectedPersonaIdAtom, testRunsAtom } from '@/atoms'
import { cn } from '@/lib/utils'
import { PersonaLifecycleStatus } from './PersonaLifecycleStatus'
import { isNPlusOnePersona } from './nPlusOne'

function parseNumberedObjectives(instructions: string): string[] {
  const lines = instructions.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.every((l) => /^\d+\)/.test(l))) return lines
  return lines.map((line, i) => `${i + 1}) ${line.replace(/^\d+\)\s*/, '')}`)
}

export function ResultsPanel() {
  const personas = useAtomValue(personasAtom)
  const selectedId = useAtomValue(selectedPersonaIdAtom)
  const testRuns = useAtomValue(testRunsAtom)
  const [infoOpen, setInfoOpen] = useState(true)
  const [expandedEval, setExpandedEval] = useState<number | null>(null)

  const persona = personas.find((p) => p.id === selectedId)
  const run = selectedId ? testRuns[selectedId] : undefined

  if (!persona) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-xs text-gray-400">
        Select a persona to see results
      </div>
    )
  }

  const passedCount = run?.evaluationResults?.filter((r) => r.passed).length ?? 0
  const isNPlusOne = isNPlusOnePersona(persona)
  const nPlusOne = persona.nPlusOne
  const objectives = persona.objectives[0]
  const criteriaCount = persona.evaluation.criteria.length
  const objectiveLines = objectives?.instructions
    ? parseNumberedObjectives(objectives.instructions)
    : []

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-16 w-full flex-shrink-0 items-center justify-between border-b border-gray-200 px-6">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-base font-semibold text-gray-900">Results</h2>
          <PersonaLifecycleStatus persona={persona} />
        </div>
        {run && run.status !== 'TEST_RUN_STATUS_RUNNING' && (
          <span
            className={cn(
              'text-xs font-medium',
              run.status === 'TEST_RUN_STATUS_PASSED' ? 'text-green-600' : 'text-red-500'
            )}
          >
            {run.status === 'TEST_RUN_STATUS_PASSED' ? 'Passed' : 'Failed'}
          </span>
        )}
      </header>

      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-100">
          <button
            type="button"
            onClick={() => setInfoOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-sm font-semibold text-gray-800">Persona Information</span>
            <div className="flex items-center gap-2">
              <span className="max-w-[120px] truncate text-xs text-gray-500">{persona.personaKey}</span>
              {infoOpen ? (
                <ChevronUpIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
              )}
            </div>
          </button>

          {infoOpen && (
            <div className="flex flex-col gap-5 px-6 pb-5">
              {isNPlusOne && nPlusOne && (
                <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-800">
                    N+1 test · prod replay
                  </p>
                  <dl className="space-y-2 text-sm text-gray-700">
                    <div>
                      <dt className="text-xs text-gray-500">Source conversation</dt>
                      <dd className="font-mono text-xs">{nPlusOne.prodConversationId}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Agent</dt>
                      <dd>{nPlusOne.agentName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Failure turn</dt>
                      <dd>Turn {nPlusOne.failureTurnNumber} — {nPlusOne.failureEvalName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Input N</dt>
                      <dd>
                        {nPlusOne.inputNMessages.length} messages · input through turn{' '}
                        {nPlusOne.failureTurnNumber} user (frozen prod context)
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {!isNPlusOne && objectives && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Objectives
                  </p>
                  <div className="flex flex-col gap-2 border-l-4 border-blue-400 pl-4">
                    {objectives.goal && (
                      <p className="text-sm leading-relaxed text-gray-700">
                        <span className="font-medium">Goal: </span>
                        {objectives.goal}
                      </p>
                    )}
                    {objectiveLines.map((line) => (
                      <p key={line} className="text-sm leading-relaxed text-gray-600">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {isNPlusOne && nPlusOne && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Inherited evaluation
                  </p>
                  <p className="border-l-4 border-purple-400 pl-4 text-sm leading-relaxed text-gray-700">
                    {nPlusOne.inheritedEvalPrompt}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Same criterion as failed production eval — no recalibration.
                  </p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Configuration
                </p>
                <p className="text-sm text-gray-700">
                  Max Turns: {persona.evaluation.maxTurns}
                  {criteriaCount > 0 && (
                    <span className="ml-4">Evaluations: {criteriaCount}</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {!run && (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            Run this persona to see evaluation results.
          </div>
        )}

        {run && run.status !== 'TEST_RUN_STATUS_RUNNING' && (
          <div className="flex flex-col gap-3 px-6 py-5">
            {passedCount > 0 && (
              <div className="flex items-center gap-2 pb-1">
                <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-800">Passed</span>
                <span className="text-sm text-gray-500">{passedCount}</span>
              </div>
            )}

            {run.evaluationResults?.map((evalResult, i) => {
              const isOpen = expandedEval === i
              return (
                <div key={i} className="overflow-hidden rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setExpandedEval(isOpen ? null : i)}
                    className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      {evalResult.passed ? (
                        <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-sm font-semibold text-gray-800">{evalResult.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>Score</span>
                      {isOpen ? (
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4">
                      <div>
                        <p className="mb-1.5 text-xs font-semibold text-gray-700">Prompt</p>
                        <p className="text-sm leading-relaxed text-gray-500">{evalResult.prompt}</p>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-semibold text-gray-700">Threshold</p>
                        <p className="text-sm text-gray-500">1 (Minimum)</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
