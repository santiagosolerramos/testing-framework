import { useState, useCallback } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FolderIcon, Loader2Icon, PlayIcon, SearchIcon, SquarePenIcon } from 'lucide-react'
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
import { personaCreationAtom } from '@/atoms/personaCreation'
import { cn } from '@/lib/utils'
import { mockInvokeAgent } from '@/services/mockAI'
import { PersonaSidebarItem } from './PersonaSidebarItem'

const SIDEBAR_GUTTER = 'px-3'

export function PersonasSidebar() {
  const personas = useAtomValue(personasAtom)
  const sections = useAtomValue(sectionsAtom)
  const [selectedId, setSelectedId] = useAtom(selectedPersonaIdAtom)
  const testRuns = useAtomValue(testRunsAtom)
  const setFormMode = useSetAtom(personaFormModeAtom)
  const setCreation = useSetAtom(personaCreationAtom)
  const setTestRuns = useSetAtom(testRunsAtom)
  const [search, setSearch] = useState('')
  const [runningAll, setRunningAll] = useState(false)

  const filtered = personas.filter((p) =>
    p.personaKey.toLowerCase().includes(search.toLowerCase())
  )

  const runAllPersonas = useCallback(async () => {
    setRunningAll(true)
    const runnable = personas.filter((p) => p.status !== 'draft')
    for (const persona of runnable) {
      setTestRuns((prev) => ({
        ...prev,
        [persona.id]: { status: 'TEST_RUN_STATUS_RUNNING' },
      }))
    }
    for (const persona of runnable) {
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className={cn(SIDEBAR_GUTTER, 'shrink-0 pt-2')}>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2.5 py-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setCreation({ kind: 'entry-modal' })}
        >
          <SquarePenIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm">Create New Persona</span>
        </Button>
      </div>

      <div className={cn(SIDEBAR_GUTTER, 'shrink-0 pb-2 pt-2')}>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="h-9 pl-9 text-sm"
            placeholder="Search personas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3">
        <div className="pb-2">
          {!search && (
            <>
              <h3 className="mb-1 mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Custom
              </h3>
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex w-full items-center justify-between px-3 hover:bg-gray-200"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2.5 py-2 text-left text-sm text-gray-700"
                  >
                    <FolderIcon className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{section.name}</span>
                  </button>
                  <span className="ml-2 shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                    {section.personaIds.length}
                  </span>
                </div>
              ))}
            </>
          )}

          <div className={cn(!search && 'mt-1')}>
            {filtered.map((persona) => {
              const status = testRuns[persona.id]?.status || 'TEST_RUN_STATUS_UNSPECIFIED'
              return (
                <PersonaSidebarItem
                  key={persona.id}
                  label={persona.personaKey}
                  status={status}
                  isDraft={persona.status === 'draft'}
                  isSelected={selectedId === persona.id}
                  onSelect={() => setSelectedId(persona.id)}
                  onDuplicate={() => setFormMode(persona.id)}
                />
              )
            })}
          </div>
        </div>
      </ScrollArea>

      <div className={cn(SIDEBAR_GUTTER, 'shrink-0 border-t border-gray-200 pb-3 pt-3')}>
        <Button
          variant="outline"
          className="h-8 w-full gap-2 text-xs"
          onClick={runAllPersonas}
          disabled={runningAll}
        >
          {runningAll ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          {runningAll ? 'Running...' : 'Test all personas'}
        </Button>
      </div>
    </div>
  )
}
