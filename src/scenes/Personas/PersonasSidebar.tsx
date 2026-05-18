import { useState, useCallback } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  CheckCircle2Icon,
  FolderIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  XCircleIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { ulid } from 'ulid'

function PersonaStatusIcon({ status }: { status: TestRunStatus }) {
  if (status === 'TEST_RUN_STATUS_PASSED') {
    return <CheckCircle2Icon className="w-4 h-4 text-green-500 flex-shrink-0" />
  }
  if (status === 'TEST_RUN_STATUS_FAILED') {
    return <XCircleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
  }
  if (status === 'TEST_RUN_STATUS_RUNNING') {
    return <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0 inline-block" />
  }
  return <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0 inline-block" />
}

export function PersonasSidebar() {
  const personas = useAtomValue(personasAtom)
  const sections = useAtomValue(sectionsAtom)
  const [selectedId, setSelectedId] = useAtom(selectedPersonaIdAtom)
  const testRuns = useAtomValue(testRunsAtom)
  const setFormMode = useSetAtom(personaFormModeAtom)
  const setTestRuns = useSetAtom(testRunsAtom)
  const [search, setSearch] = useState('')
const filtered = personas.filter((p) =>
    p.personaKey.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSection = useCallback((_id: string) => {
    // expand/collapse sections — UI feature to implement
  }, [])

  const runAllPersonas = useCallback(async () => {
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
        const evalResults = persona.evaluations.map((e, i) => ({
          name: `Evaluation ${i + 1}`,
          passed,
          score: passed ? 1 : 0,
          prompt: e.prompt,
          threshold: e.threshold,
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
  }, [personas, setTestRuns])

  const runOnePersona = useCallback(
    async (personaId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const persona = personas.find((p) => p.id === personaId)
      if (!persona) return
      setTestRuns((prev) => ({ ...prev, [personaId]: { status: 'TEST_RUN_STATUS_RUNNING' } }))
      try {
        await mockInvokeAgent(persona.objectives[0]?.instructions || 'test')
        const passed = Math.random() > 0.2
        const evalResults = persona.evaluations.map((e, i) => ({
          name: `Evaluation ${i + 1}`,
          passed,
          score: passed ? 1 : 0,
          prompt: e.prompt,
          threshold: e.threshold,
        }))
        setTestRuns((prev) => ({
          ...prev,
          [personaId]: {
            status: passed ? 'TEST_RUN_STATUS_PASSED' : 'TEST_RUN_STATUS_FAILED',
            evaluationResults: evalResults,
          },
        }))
      } catch {
        setTestRuns((prev) => ({ ...prev, [personaId]: { status: 'TEST_RUN_STATUS_FAILED' } }))
      }
    },
    [personas, setTestRuns]
  )

  void ulid // suppress unused warning

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Create + Search */}
      <div className="px-3 pb-2 flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-8 text-gray-600 text-xs px-2"
          onClick={() => setFormMode('create')}
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Create New Persona
        </Button>
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            className="w-full h-7 pl-7 pr-3 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:border-gray-300"
            placeholder="Search personas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-2">
        {/* Sections (folders) */}
        {!search && (
          <div className="mb-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase px-2 py-1 tracking-wide">
              Custom
            </p>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 text-left"
              >
                <span className="flex items-center gap-2 text-xs text-gray-700">
                  <FolderIcon className="w-3.5 h-3.5 text-gray-400" />
                  {section.name}
                </span>
                <span className="text-[10px] text-gray-400">{section.personaIds.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Individual personas */}
        <div className="flex flex-col gap-0.5">
          {filtered.map((persona) => {
            const status = testRuns[persona.id]?.status || 'TEST_RUN_STATUS_UNSPECIFIED'
            const isSelected = selectedId === persona.id
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedId(persona.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded text-left group transition-colors',
                  isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'
                )}
              >
                <span className="flex items-center gap-2 flex-1 min-w-0">
                  <PersonaStatusIcon status={status} />
                  <span className="text-xs text-gray-800 truncate">{persona.personaKey}</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => runOnePersona(persona.id, e)}
                  className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200',
                    status === 'TEST_RUN_STATUS_RUNNING' && 'pointer-events-none'
                  )}
                  title="Run"
                >
                  <PlayIcon className="w-3 h-3 text-gray-500" />
                </button>
              </button>
            )
          })}
        </div>
      </div>

      {/* Test all personas */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-8 text-gray-600 text-xs"
          onClick={runAllPersonas}
        >
          <PlayIcon className="w-3.5 h-3.5" />
          Test all personas
        </Button>
      </div>
    </div>
  )
}
