import { useAtomValue } from 'jotai'
import { CheckCircle2Icon, ChevronDownIcon } from 'lucide-react'
import { personasAtom, selectedPersonaIdAtom, testRunsAtom } from '@/atoms'

export function ResultsPanel() {
  const personas = useAtomValue(personasAtom)
  const selectedId = useAtomValue(selectedPersonaIdAtom)
  const testRuns = useAtomValue(testRunsAtom)

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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200">
        <h2 className="font-semibold text-sm text-gray-900">Results</h2>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">
        {/* Persona info */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Persona Information</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-700">{persona.personaKey}</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* No run yet */}
        {!run && (
          <p className="text-xs text-gray-400">Run this persona to see results.</p>
        )}

        {/* Passed count */}
        {run && (
          <>
            {passedCount > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-800">Passed</span>
                <span className="text-sm text-gray-500">{passedCount}</span>
              </div>
            )}

            {/* Evaluation results */}
            {run.evaluationResults?.map((evalResult, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2Icon
                      className={evalResult.passed ? 'w-4 h-4 text-green-500' : 'w-4 h-4 text-red-400'}
                    />
                    <span className="text-sm font-medium text-gray-800">{evalResult.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>Score</span>
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="px-4 py-3 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Prompt</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{evalResult.prompt}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Threshold</p>
                    <p className="text-xs text-gray-500">{evalResult.threshold} (Minimum)</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
