import { useState, useCallback, useMemo } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpCircleIcon, Loader2Icon, PlayIcon, SearchIcon, SquarePenIcon } from 'lucide-react'
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
import type { Persona } from '@/types'
import { PersonaSidebarItem } from './PersonaSidebarItem'
import { isNPlusOnePersona } from './nPlusOne'
import { PromotePersonaDialog } from './PromotePersonaDialog'
import { PromoteAllReadyDialog } from './PromoteAllReadyDialog'
import { PersonaStatusZone } from './PersonaStatusZone'
import { ValidationProgressBadge } from './ValidationProgressBadge'
import { executePersonaTest } from './runPersonaTest'
import {
  countReadyToPromote,
  duplicatePersonaAsDraft,
  getPersonaStatus,
  getValidationPasses,
  isPersonaActive,
  isPersonaDraft,
  isReadyToPromote,
  promoteAllReadyDrafts,
  recordValidationResult,
  setPersonaStatus,
} from './personaStatus'

const SIDEBAR_GUTTER = 'px-3'

export function PersonasSidebar() {
  const personas = useAtomValue(personasAtom)
  const [, setPersonas] = useAtom(personasAtom)
  const sections = useAtomValue(sectionsAtom)
  const [selectedId, setSelectedId] = useAtom(selectedPersonaIdAtom)
  const testRuns = useAtomValue(testRunsAtom)
  const setCreation = useSetAtom(personaCreationAtom)
  const setTestRuns = useSetAtom(testRunsAtom)
  const [search, setSearch] = useState('')
  const [runningActive, setRunningActive] = useState(false)
  const [runningDraft, setRunningDraft] = useState(false)
  const [promoteTarget, setPromoteTarget] = useState<Persona | null>(null)
  const [promoteAllOpen, setPromoteAllOpen] = useState(false)
  const setFormMode = useSetAtom(personaFormModeAtom)

  const draftPersonas = useMemo(() => personas.filter(isPersonaDraft), [personas])
  const activeRunnableCount = personas.filter(isPersonaActive).length
  const draftRunnableCount = draftPersonas.length
  const readyToPromoteCount = useMemo(() => countReadyToPromote(personas), [personas])

  const isRunningBatch = runningActive || runningDraft

  const runTestForPersona = useCallback(
    async (persona: Persona, trackValidation: boolean) => {
      setTestRuns((prev) => ({
        ...prev,
        [persona.id]: { status: 'TEST_RUN_STATUS_RUNNING' },
      }))
      const result = await executePersonaTest(persona)
      const passed = result.status === 'TEST_RUN_STATUS_PASSED'
      setTestRuns((prev) => ({ ...prev, [persona.id]: result }))
      if (trackValidation) {
        setPersonas((prev) => recordValidationResult(prev, persona.id, passed))
      }
    },
    [setTestRuns, setPersonas]
  )

  const runAllActive = useCallback(async () => {
    setRunningActive(true)
    const runnable = personas.filter(isPersonaActive)
    for (const persona of runnable) {
      await runTestForPersona(persona, false)
    }
    setRunningActive(false)
  }, [personas, runTestForPersona])

  const runAllDraft = useCallback(async () => {
    setRunningDraft(true)
    for (const persona of draftPersonas) {
      await runTestForPersona(persona, true)
    }
    setRunningDraft(false)
  }, [draftPersonas, runTestForPersona])

  const promoteToActive = useCallback(
    (personaId: string) => {
      setPersonas((prev) => setPersonaStatus(prev, personaId, 'active'))
    },
    [setPersonas]
  )

  const promoteAllReady = useCallback(() => {
    setPersonas((prev) => promoteAllReadyDrafts(prev))
  }, [setPersonas])

  const duplicateToDraft = useCallback(
    (persona: Persona) => {
      const copy = duplicatePersonaAsDraft(persona)
      setPersonas((prev) => [...prev, copy])
      setSelectedId(copy.id)
    },
    [setPersonas, setSelectedId]
  )

  const renderPersonaRow = (persona: Persona, opts?: { hideStatusBadge?: boolean }) => {
    const runStatus = testRuns[persona.id]?.status || 'TEST_RUN_STATUS_UNSPECIFIED'
    const personaStatus = getPersonaStatus(persona)
    const isDraft = personaStatus === 'draft'
    const isActive = personaStatus === 'active'
    const canPromote = isDraft && isReadyToPromote(persona)

    return (
      <PersonaSidebarItem
        key={persona.id}
        label={persona.personaKey}
        personaStatus={personaStatus}
        runStatus={runStatus}
        showStatusBadge={!opts?.hideStatusBadge}
        trailing={
          <>
            {isNPlusOnePersona(persona) && (
              <span className="shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-800">
                N+1
              </span>
            )}
            {isDraft ? (
              <ValidationProgressBadge
                passes={getValidationPasses(persona)}
                showLabel
                detailed
              />
            ) : undefined}
          </>
        }
        isSelected={selectedId === persona.id}
        onSelect={() => setSelectedId(persona.id)}
        onEdit={isNPlusOnePersona(persona) ? undefined : () => setFormMode(persona.id)}
        onDuplicateToDraft={isActive ? () => duplicateToDraft(persona) : undefined}
        onPromoteToActive={canPromote ? () => setPromoteTarget(persona) : undefined}
      />
    )
  }

  const hasSearchResults =
    search.length > 0 &&
    personas.some((p) => p.personaKey.toLowerCase().includes(search.toLowerCase()))

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

      <ScrollArea className="min-h-0 flex-1">
        <div className="pb-2">
          <PersonaStatusZone
            zoneStatus="active"
            title="Active"
            sections={sections}
            personas={personas}
            search={search}
            renderPersonaRow={renderPersonaRow}
          />
          <PersonaStatusZone
            zoneStatus="draft"
            title="Draft"
            sections={sections}
            personas={personas}
            search={search}
            renderPersonaRow={renderPersonaRow}
            emptyFolderToggle
          />
          {search && !hasSearchResults && (
            <p className="px-6 py-4 text-center text-sm text-gray-500">No personas match search</p>
          )}
        </div>
      </ScrollArea>

      <div className={cn(SIDEBAR_GUTTER, 'shrink-0 space-y-2 border-t border-gray-200 pb-3 pt-3')}>
        <Button
          variant="outline"
          className="h-8 w-full gap-2 text-xs"
          onClick={runAllActive}
          disabled={isRunningBatch || activeRunnableCount === 0}
        >
          {runningActive ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          {runningActive ? 'Running active…' : `Test all active (${activeRunnableCount})`}
        </Button>

        <Button
          variant="outline"
          className="h-8 w-full gap-2 text-xs"
          onClick={runAllDraft}
          disabled={isRunningBatch || draftRunnableCount === 0}
        >
          {runningDraft ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          {runningDraft ? 'Running drafts…' : `Test all draft (${draftRunnableCount})`}
        </Button>

        <Button
          variant="outline"
          className="h-8 w-full gap-2 text-xs border-purple-200 text-purple-800 hover:bg-purple-50"
          onClick={() => setPromoteAllOpen(true)}
          disabled={readyToPromoteCount === 0 || isRunningBatch}
        >
          <ArrowUpCircleIcon className="h-4 w-4" />
          Promote all ready ({readyToPromoteCount})
        </Button>

        <p className="text-center text-[10px] leading-snug text-gray-500">
          Draft tests update each 0/3→3/3 counter. Run Test all draft up to 3 times, then promote in
          bulk or one by one.
        </p>
      </div>

      <PromotePersonaDialog
        open={!!promoteTarget}
        onOpenChange={(open) => !open && setPromoteTarget(null)}
        personaKey={promoteTarget?.personaKey ?? ''}
        onConfirm={() => {
          if (promoteTarget) promoteToActive(promoteTarget.id)
        }}
      />

      <PromoteAllReadyDialog
        open={promoteAllOpen}
        onOpenChange={setPromoteAllOpen}
        count={readyToPromoteCount}
        onConfirm={promoteAllReady}
      />
    </div>
  )
}
