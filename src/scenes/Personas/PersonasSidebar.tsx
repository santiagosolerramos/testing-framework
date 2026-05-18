import { useState, useCallback } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  CheckCircle2Icon,
  FolderIcon,
  Loader2Icon,
  PlayIcon,
  SearchIcon,
  SquarePenIcon,
  XCircleIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  personasAtom,
  sectionsAtom,
  selectedPersonaIdAtom,
  testRunsAtom,
  personaFormModeAtom,
} from '@/atoms'
import type { TestRunStatus } from '@/types'
import { cn } from '@/lib/utils'
import { mockInvokeAgent } from '@/services/mockAI'

function PersonaStatusIcon({ status }: { status: TestRunStatus }) {
  if (status === 'TEST_RUN_STATUS_PASSED') {
    return <CheckCircle2Icon className="w-4 h-4 text-green-500 flex-shrink-0" />
  }
  if (status === 'TEST_RUN_STATUS_FAILED') {
    return <XCircleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
  }
  if (status === 'TEST_RUN_STATUS_RUNNING') {
    return (
      <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0 inline-block" />
    )
  }
  return (
    <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0 inline-block" />
  )
}

export function PersonasSidebar() {
  const personas = useAtomValue(personasAtom)
  const sections = useAtomValue(sectionsAtom)
  const [selectedId, setSelectedId] = useAtom(selectedPersonaIdAtom)
  const testRuns = useAtomValue(testRunsAtom)
  const setFormMode = useSetAtom(personaFormModeAtom)
  const setTestRuns = useSetAtom(testRunsAtom)
  const [search, setSearch] = useState('')
  const [runningAll, setRunningAll] = useState(false)

  const filtered = personas.filter((p) =>
    p.personaKey.toLowerCase().includes(search.toLowerCase())
  )

  const runAllPersonas = useCallback(async () => {
    setRunningAll(true)
    for (const persona of personas) {
      setTestRuns((prev) => ({
        ...prev,
        [persona.id]: { status: 'TEST_RUN_STATUS_RUNNING' },
      }))
    }
    for (const persona of personas) {
      try {
        await mockInvokeAgent(persona.objectives[0]?.instructions || 'test')
        const passed = Math.random() > 0.2
        const evalResults = persona.evaluation.criteria.map((c, i) => ({
          name: `Evaluation ${i + 1}`,
          passed,
          score: passed ? 1 : 0,
          prompt: c.prompt,
        }))
        setTestRuns((prev) => ({
          ...prev,
          [persona.id]: {
            status: passed ? 'TEST_RUN_STATUS_PASSED' : 'TEST_RUN_STATUS_FAILED',
            evaluationResults: evalResults,
          },
        }))
      } catch {
        setTestRuns((prev) => ({
          ...prev,
          [persona.id]: { status: 'TEST_RUN_STATUS_FAILED' },
        }))
      }
    }
    setRunningAll(false)
  }, [personas, setTestRuns])

  return (
    <div className="pb-1 flex flex-1 min-h-0 flex-col overflow-hidden">
      {/* Create button */}
      <div className="px-3 pt-2 pb-1 flex-shrink-0">
        <Button
          className="w-full justify-start rounded-md px-2 py-2.5 transition-colors duration-500 hover:bg-gray-100 text-gray-600 gap-2.5 h-auto"
          variant="ghost"
          onClick={() => setFormMode('create')}
        >
          <SquarePenIcon className="w-4 h-4 shrink-0" />
          <span className="text-sm">Create New Persona</span>
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9 h-9 text-sm"
            placeholder="Search personas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable list */}
      <ScrollArea className="flex-1 min-h-0">
      <div className="px-3 pt-2 pb-4">
        {/* Sections (folders) */}
        {!search && (
          <div className="mb-1">
            <h3 className="px-2 text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-1 mt-3">
              Custom
            </h3>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className="w-full flex items-center justify-between px-2 py-2 rounded-md text-left transition-colors duration-500 hover:bg-gray-100"
              >
                <span className="flex items-center gap-2.5 text-sm text-gray-700 min-w-0">
                  <FolderIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{section.name}</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 rounded shrink-0 ml-2">
                  {section.personaIds.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Individual personas */}
        <div className="flex flex-col mt-1">
          {filtered.map((persona) => {
            const status = testRuns[persona.id]?.status || 'TEST_RUN_STATUS_UNSPECIFIED'
            const isSelected = selectedId === persona.id
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedId(persona.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-colors duration-500 group min-w-0',
                  isSelected
                    ? 'bg-gray-100 font-medium'
                    : 'hover:bg-gray-100'
                )}
              >
                <PersonaStatusIcon status={status} />
                <span className="text-sm text-gray-700 truncate flex-1 min-w-0">{persona.personaKey}</span>
              </button>
            )
          })}
        </div>
      </div>
      </ScrollArea>

      {/* Run Tests button */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2">
        <Button
          variant="outline"
          className="flex-1 w-full gap-2 text-xs h-8"
          onClick={runAllPersonas}
          disabled={runningAll}
        >
          {runningAll ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
          {runningAll ? 'Running...' : 'Test all personas'}
        </Button>
      </div>
    </div>
  )
}
