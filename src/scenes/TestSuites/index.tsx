import { useCallback, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { PlayIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  personasAtom,
  testSuitesListAtom,
  testSuitesAtom,
  selectedTestSuiteIdAtom,
  selectedPersonaIdAtom,
} from '@/atoms'
import { mockInvokeAgent } from '@/services/mockAI'
import { cn } from '@/lib/utils'
import type { TestRunStatus, Persona, TestSuite } from '@/types'

function StatusBadge({ status }: { status: TestRunStatus }) {
  if (status === 'TEST_RUN_STATUS_RUNNING') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Running
      </span>
    )
  }
  if (status === 'TEST_RUN_STATUS_PASSED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
        <CheckCircleIcon className="w-3.5 h-3.5" />
        Passed
      </span>
    )
  }
  if (status === 'TEST_RUN_STATUS_FAILED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
        <XCircleIcon className="w-3.5 h-3.5" />
        Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
      <ClockIcon className="w-3.5 h-3.5" />
      Not run
    </span>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function TestSuitesSidebar() {
  const testSuites = useAtomValue(testSuitesListAtom)
  const [selectedSuiteId, setSelectedSuiteId] = useAtom(selectedTestSuiteIdAtom)
  const setSelectedPersonaId = useSetAtom(selectedPersonaIdAtom)

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedSuiteId(id)
      setSelectedPersonaId(null)
    },
    [setSelectedSuiteId, setSelectedPersonaId]
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-2 pb-2">
        <Button className="w-full justify-start rounded-md px-3 py-2 text-gray-600 gap-2 h-auto" variant="ghost">
          <PlusIcon className="w-4 h-4 flex-shrink-0" />
          New Test Suite
        </Button>
      </div>
      <div className="flex flex-col gap-1 overflow-auto p-2 pt-0 h-full">
        {testSuites.map((suite) => (
          <button
            key={suite.id}
            type="button"
            onClick={() => handleSelect(suite.id)}
            className={cn(
              'w-full text-left rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-200',
              selectedSuiteId === suite.id && 'bg-gray-200 font-medium'
            )}
          >
            <div className="truncate text-gray-800">{suite.name}</div>
            <div className="text-xs text-gray-400 truncate mt-0.5">{suite.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Persona row ──────────────────────────────────────────────────────────────
function PersonaRow({
  persona,
  suiteId,
  status,
  onRun,
  onSelect,
  isSelected,
}: {
  persona: Persona
  suiteId: string
  status: TestRunStatus
  onRun: (suiteId: string, personaId: string) => void
  onSelect: (personaId: string) => void
  isSelected: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 rounded-lg border transition-colors cursor-pointer',
        isSelected ? 'border-gray-400 bg-gray-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
      )}
      onClick={() => onSelect(persona.id)}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{persona.name}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">{persona.description}</div>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <StatusBadge status={status} />
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onRun(suiteId, persona.id)
          }}
          disabled={status === 'TEST_RUN_STATUS_RUNNING'}
        >
          <PlayIcon className="w-3 h-3" />
          Run
        </Button>
      </div>
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────
export function TestSuitesContent() {
  const personas = useAtomValue(personasAtom)
  const testSuitesList = useAtomValue(testSuitesListAtom)
  const [testSuites, setTestSuites] = useAtom(testSuitesAtom)
  const [selectedSuiteId, setSelectedSuiteId] = useAtom(selectedTestSuiteIdAtom)
  const [selectedPersonaId, setSelectedPersonaId] = useAtom(selectedPersonaIdAtom)

  const selectedSuite: TestSuite | undefined = testSuitesList.find((s) => s.id === selectedSuiteId)
  const suitePersonas = selectedSuite
    ? personas.filter((p) => selectedSuite.personaIds.includes(p.id))
    : []

  const getStatus = useCallback(
    (suiteId: string, personaId: string): TestRunStatus =>
      testSuites[suiteId]?.[personaId]?.status || 'TEST_RUN_STATUS_UNSPECIFIED',
    [testSuites]
  )

  const runTest = useCallback(
    async (suiteId: string, personaId: string) => {
      setTestSuites((prev) => ({
        ...prev,
        [suiteId]: {
          ...prev[suiteId],
          [personaId]: { status: 'TEST_RUN_STATUS_RUNNING' },
        },
      }))

      try {
        // Simulate a test run with a mock conversation
        const persona = personas.find((p) => p.id === personaId)
        await mockInvokeAgent(persona?.systemPrompt || 'Test message')
        // Randomly pass or fail for demo purposes
        const passed = Math.random() > 0.3
        setTestSuites((prev) => ({
          ...prev,
          [suiteId]: {
            ...prev[suiteId],
            [personaId]: {
              status: passed ? 'TEST_RUN_STATUS_PASSED' : 'TEST_RUN_STATUS_FAILED',
            },
          },
        }))
      } catch {
        setTestSuites((prev) => ({
          ...prev,
          [suiteId]: {
            ...prev[suiteId],
            [personaId]: { status: 'TEST_RUN_STATUS_FAILED' },
          },
        }))
      }
    },
    [personas, setTestSuites]
  )

  const runAll = useCallback(() => {
    if (!selectedSuite) return
    selectedSuite.personaIds.forEach((personaId) => {
      runTest(selectedSuite.id, personaId)
    })
  }, [selectedSuite, runTest])

  const [_unused, setUnused] = useState(false)
  void _unused
  void setUnused

  if (!selectedSuite) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Select a test suite from the sidebar
      </div>
    )
  }

  const allStatuses = suitePersonas.map((p) => getStatus(selectedSuite.id, p.id))
  const running = allStatuses.some((s) => s === 'TEST_RUN_STATUS_RUNNING')
  const passed = allStatuses.filter((s) => s === 'TEST_RUN_STATUS_PASSED').length
  const failed = allStatuses.filter((s) => s === 'TEST_RUN_STATUS_FAILED').length

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-900">{selectedSuite.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{selectedSuite.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {(passed > 0 || failed > 0) && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600 font-medium">{passed} passed</span>
              {failed > 0 && <span className="text-red-500 font-medium">{failed} failed</span>}
            </div>
          )}
          <Button size="sm" className="gap-1.5" onClick={runAll} disabled={running}>
            <PlayIcon className="w-3.5 h-3.5" />
            Run All
          </Button>
        </div>
      </div>

      {/* Persona list */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {suitePersonas.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No personas in this test suite yet.
            </p>
          )}
          {suitePersonas.map((persona) => (
            <PersonaRow
              key={persona.id}
              persona={persona}
              suiteId={selectedSuite.id}
              status={getStatus(selectedSuite.id, persona.id)}
              onRun={runTest}
              onSelect={setSelectedPersonaId}
              isSelected={selectedPersonaId === persona.id}
            />
          ))}
        </div>
      </div>

      {/* Select a suite CTA */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <span className="text-xs text-gray-400">
            {suitePersonas.length} persona{suitePersonas.length !== 1 ? 's' : ''} in this suite
          </span>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-auto py-1" onClick={() => setSelectedSuiteId(null)}>
            Change suite
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Evaluation panel (right) ────────────────────────────────────────────────
export function EvaluationPanel() {
  const selectedPersonaId = useAtomValue(selectedPersonaIdAtom)
  const personas = useAtomValue(personasAtom)
  const [testSuites] = useAtom(testSuitesAtom)
  const selectedSuiteId = useAtomValue(selectedTestSuiteIdAtom)

  const persona = personas.find((p) => p.id === selectedPersonaId)
  const status =
    selectedSuiteId && selectedPersonaId
      ? testSuites[selectedSuiteId]?.[selectedPersonaId]?.status || 'TEST_RUN_STATUS_UNSPECIFIED'
      : 'TEST_RUN_STATUS_UNSPECIFIED'

  if (!persona) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm px-4 text-center">
        Click a persona to see its evaluation
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-auto">
      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-1">{persona.name}</h3>
        <p className="text-xs text-gray-500">{persona.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Status:</span>
        <StatusBadge status={status} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-700 mb-1">System Prompt</p>
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed border border-gray-100">
          {persona.systemPrompt}
        </div>
      </div>
      {status === 'TEST_RUN_STATUS_PASSED' && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700 mb-1">Test Passed</p>
          <p className="text-xs text-green-600">All assertions met. Agent responded appropriately to this persona.</p>
        </div>
      )}
      {status === 'TEST_RUN_STATUS_FAILED' && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
          <p className="text-xs font-medium text-red-700 mb-1">Test Failed</p>
          <p className="text-xs text-red-600">One or more assertions failed. Review the agent&apos;s response for this persona.</p>
        </div>
      )}
    </div>
  )
}
