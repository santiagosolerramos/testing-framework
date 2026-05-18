import { useAtomValue } from 'jotai'
import { CheckCircle2Icon, ChevronDownIcon, ChevronUpIcon, XCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { personasAtom, selectedPersonaIdAtom, testRunsAtom } from '@/atoms'

export function ResultsPanel() {
  const personas = useAtomValue(personasAtom)
  const selectedId = useAtomValue(selectedPersonaIdAtom)
  const testRuns = useAtomValue(testRunsAtom)
  const [infoOpen, setInfoOpen] = useState(true)

  const persona = personas.find((p) => p.id === selectedId)
  const run = selectedId ? testRuns[selectedId] : undefined

  if (!persona) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-gray-400 px-4 text-center">
        Select a persona to see results
      </div>
    )
  }

  const passedCount = run?.evaluationResults?.filter((r) => r.passed).length ?? 0
  const objectives = persona.objectives[0]
  const criteriaCount = persona.evaluation.criteria.length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-base text-gray-900">Results</h2>
        {run && (
          <span className={`text-xs font-medium ${run.status === 'TEST_RUN_STATUS_PASSED' ? 'text-green-600' : run.status === 'TEST_RUN_STATUS_RUNNING' ? 'text-blue-500' : 'text-red-500'}`}>
            {run.status === 'TEST_RUN_STATUS_RUNNING' ? 'Running...' : run.status === 'TEST_RUN_STATUS_PASSED' ? 'Passed' : 'Failed'}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {/* Persona Information accordion */}
        <div className="border-b border-gray-100">
          <button
            type="button"
            onClick={() => setInfoOpen((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-800">Persona Information</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 truncate max-w-[120px]">{persona.personaKey}</span>
              {infoOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </div>
          </button>

          {infoOpen && (
            <div className="px-6 pb-5 flex flex-col gap-5">
              {/* Objectives */}
              {objectives && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Objectives</p>
                  <div className="border-l-4 border-blue-400 pl-4 flex flex-col gap-2">
                    {objectives.goal && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-medium">Goal: </span>{objectives.goal}
                      </p>
                    )}
                    {objectives.instructions && (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {objectives.instructions}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Configuration */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Configuration</p>
                <p className="text-sm text-gray-700">
                  Max Turns: {persona.evaluation.maxTurns}
                  {criteriaCount > 0 && <span className="ml-4">Evaluations: {criteriaCount}</span>}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Run results */}
        {!run && (
          <div className="px-6 py-8 text-sm text-gray-400 text-center">
            Run this persona to see evaluation results.
          </div>
        )}

        {run && run.status !== 'TEST_RUN_STATUS_RUNNING' && (
          <div className="px-6 py-5 flex flex-col gap-4">
            {passedCount > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-800">Passed</span>
                <span className="text-sm text-gray-500">{passedCount}</span>
              </div>
            )}

            {run.evaluationResults?.map((evalResult, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2">
                    {evalResult.passed ? (
                      <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-800">{evalResult.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>Score</span>
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="px-4 py-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Prompt</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{evalResult.prompt}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Threshold</p>
                    <p className="text-sm text-gray-500">1 (Minimum)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
