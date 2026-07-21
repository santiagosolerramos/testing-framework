import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { CopyIcon, SettingsIcon } from 'lucide-react'
import { nPlusOneJourneyOpenAtom, nPlusOneJourneyStepAtom } from '@/atoms/admin'
import { ADMIN_JOURNEY_LAST_STEP } from '@/scenes/Admin/nPlusOneJourneySteps'
import { NPlusOneJourneyModal } from '@/scenes/Admin/NPlusOneJourneyModal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChatTestColumnLayout } from '@/components/layout/ChatTestColumnLayout'
import { personasAtom, selectedPersonaIdAtom, testRunsAtom, personaFormModeAtom } from '@/atoms'
import { mockInvokeAgent } from '@/services/mockAI'
import { CHECKOUT_CEP_LOOKUP_DEMO } from './demoConversations'
import { RunMessageList } from './RunMessageList'
import { NPlusOneRunView } from './NPlusOneRunView'
import { PersonaLifecycleStatus } from './PersonaLifecycleStatus'
import { PromotePersonaDialog } from './PromotePersonaDialog'
import { ValidationProgressBadge } from './ValidationProgressBadge'
import {
  duplicatePersonaAsDraft,
  getPersonaStatus,
  getValidationPasses,
  isReadyToPromote,
  recordValidationResult,
  REQUIRED_VALIDATION_PASSES,
  setPersonaStatus,
} from './personaStatus'
import type { RunEntry } from './runTypes'
import { isNPlusOnePersona } from './nPlusOne'

const DEMO_PERSONA_KEY = 'checkout-cep-lookup'

function getDemoEntriesForPersona(personaKey: string, hasPassedRun: boolean): RunEntry[] {
  if (personaKey === DEMO_PERSONA_KEY && hasPassedRun) {
    return CHECKOUT_CEP_LOOKUP_DEMO
  }
  return []
}

async function playScriptedRun(
  script: RunEntry[],
  setEntries: Dispatch<SetStateAction<RunEntry[]>>
) {
  setEntries([])
  for (const entry of script) {
    await new Promise((r) => setTimeout(r, entry.type === 'callback' ? 400 : 350))
    setEntries((prev) => [...prev, entry])
  }
}

export function PersonaRunView() {
  const personas = useAtomValue(personasAtom)
  const [, setPersonas] = useAtom(personasAtom)
  const setSelectedId = useSetAtom(selectedPersonaIdAtom)
  const selectedId = useAtomValue(selectedPersonaIdAtom)
  const testRuns = useAtomValue(testRunsAtom)
  const setTestRuns = useSetAtom(testRunsAtom)
  const setFormMode = useSetAtom(personaFormModeAtom)
  const [sessionId] = useState(() => `session-${Math.random().toString(36).slice(2, 9)}`)
  const [entries, setEntries] = useState<RunEntry[]>([])
  const [generatedEntries, setGeneratedEntries] = useState<RunEntry[]>([])
  const [running, setRunning] = useState(false)
  const [promoteOpen, setPromoteOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [journeyStep, setJourneyStep] = useAtom(nPlusOneJourneyStepAtom)
  const [journeyOpen, setJourneyOpen] = useAtom(nPlusOneJourneyOpenAtom)

  const persona = personas.find((p) => p.id === selectedId)
  const run = selectedId ? testRuns[selectedId] : undefined
  const hasPassedRun = run?.status === 'TEST_RUN_STATUS_PASSED'
  const isNPlusOne = persona ? isNPlusOnePersona(persona) : false
  const inputNMessages = persona?.nPlusOne?.inputNMessages ?? []
  const showFrameworkJourney =
    journeyOpen && isNPlusOne && journeyStep > ADMIN_JOURNEY_LAST_STEP

  // Reset N+1 generated output only when switching personas; hydrate last run from testRuns.
  useEffect(() => {
    if (!selectedId) {
      setGeneratedEntries([])
      return
    }
    const saved = testRuns[selectedId]?.lastAssistantResponse
    setGeneratedEntries(saved ? [{ type: 'assistant', text: saved }] : [])
  }, [selectedId])

  useEffect(() => {
    if (!persona) {
      setEntries([])
      return
    }
    if (isNPlusOne) {
      setEntries([])
      return
    }
    setEntries(getDemoEntriesForPersona(persona.personaKey, hasPassedRun))
  }, [selectedId, persona?.id, hasPassedRun, isNPlusOne])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length, generatedEntries.length, running])

  const runPersona = useCallback(async () => {
    if (!persona || running) return
    setRunning(true)
    setTestRuns((prev) => ({ ...prev, [persona.id]: { status: 'TEST_RUN_STATUS_RUNNING' } }))

    try {
      if (isNPlusOne && persona.nPlusOne) {
        setGeneratedEntries([])
        const lastUser = [...persona.nPlusOne.inputNMessages]
          .reverse()
          .find((m) => m.role === 'USER')
        const prompt = lastUser?.text ?? ''
        const reply = await mockInvokeAgent(prompt)
        const sentences = (reply.match(/[^.!?]+[.!?]+/g) || [reply])
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 2)
        const assistantText =
          sentences.length > 0 ? sentences.join(' ') : reply
        await new Promise((r) => setTimeout(r, 400))
        setGeneratedEntries([{ type: 'assistant', text: assistantText }])

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
            lastAssistantResponse: assistantText,
          },
        }))
        if (getPersonaStatus(persona) === 'draft') {
          setPersonas((prev) => recordValidationResult(prev, persona.id, passed))
        }
        return
      } else if (persona.personaKey === DEMO_PERSONA_KEY) {
        setEntries([])
        await playScriptedRun(CHECKOUT_CEP_LOOKUP_DEMO, setEntries)
      } else {
        setEntries([])
        const instructions = persona.objectives[0]?.instructions || ''
        const turn = instructions.slice(0, 80) + (instructions.length > 80 ? '...' : '')
        setEntries([{ type: 'user', text: turn }])
        if (Math.random() > 0.5) {
          await new Promise((r) => setTimeout(r, 400))
          setEntries((prev) => [...prev, { type: 'callback', label: 'activity_check' }])
        }
        const reply = await mockInvokeAgent(turn)
        const sentences = reply.match(/[^.!?]+[.!?]+/g) || [reply]
        for (const sentence of sentences.slice(0, 3)) {
          await new Promise((r) => setTimeout(r, 200))
          setEntries((prev) => [...prev, { type: 'assistant', text: sentence.trim() }])
        }
      }

      const passed = persona.personaKey === DEMO_PERSONA_KEY ? true : Math.random() > 0.2
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
      if (getPersonaStatus(persona) === 'draft') {
        setPersonas((prev) => recordValidationResult(prev, persona.id, passed))
      }
    } catch {
      setTestRuns((prev) => ({ ...prev, [persona.id]: { status: 'TEST_RUN_STATUS_FAILED' } }))
      if (getPersonaStatus(persona) === 'draft') {
        setPersonas((prev) => recordValidationResult(prev, persona.id, false))
      }
    } finally {
      setRunning(false)
    }
  }, [persona, running, isNPlusOne, setTestRuns, setPersonas])

  const copySession = useCallback(() => {
    navigator.clipboard.writeText(sessionId).catch(() => {})
  }, [sessionId])

  if (!persona) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        Select a persona from the sidebar
      </div>
    )
  }

  const showEmpty = !isNPlusOne && entries.length === 0 && !running
  const personaStatus = getPersonaStatus(persona)
  const isDraft = personaStatus === 'draft'
  const validationPasses = getValidationPasses(persona)
  const readyToPromote = isReadyToPromote(persona)

  return (
    <>
      <ChatTestColumnLayout
        title={
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="truncate text-base font-semibold text-gray-900">{persona.personaKey}</h2>
            <PersonaLifecycleStatus persona={persona} />
          </div>
        }
        actions={
          <>
            {isDraft ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={!readyToPromote}
                title={
                  readyToPromote
                    ? undefined
                    : `Complete ${REQUIRED_VALIDATION_PASSES} consecutive passing tests first (${validationPasses}/${REQUIRED_VALIDATION_PASSES})`
                }
                onClick={() => readyToPromote && setPromoteOpen(true)}
              >
                Promote to Active
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  const copy = duplicatePersonaAsDraft(persona)
                  setPersonas((prev) => [...prev, copy])
                  setSelectedId(copy.id)
                }}
              >
                Duplicate to draft
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-gray-500"
              onClick={copySession}
            >
              <CopyIcon className="h-3.5 w-3.5" />
              Session ID
            </Button>
            {!isNPlusOne && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Update persona"
                onClick={() => setFormMode(persona.id)}
              >
                <SettingsIcon className="h-4 w-4 text-gray-500" />
              </Button>
            )}
            <Button
              size="sm"
              className="h-7 bg-purple-700 text-xs hover:bg-purple-800"
              onClick={runPersona}
              disabled={running}
            >
              {running ? 'Running…' : 'Test'}
            </Button>
          </>
        }
      >
        {isNPlusOne && persona.nPlusOne && (
          <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-950">
            <p className="font-medium">N+1 offline test</p>
            <p className="mt-1 text-xs text-purple-900/90">
              Input N ({inputNMessages.length} messages from prod) stays fixed.{' '}
              <strong>Test</strong> only generates the next bot response to evaluate — it does not
              re-run the conversation.
            </p>
          </div>
        )}
        {isDraft && !isNPlusOne && (
          <div
            className={cn(
              'mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm',
              readyToPromote
                ? 'border-green-200 bg-green-50 text-green-900'
                : 'border-amber-200 bg-amber-50 text-amber-950'
            )}
          >
            <div>
              <p className="font-medium">Validating</p>
              <p className="mt-0.5 text-xs opacity-90">
                <strong>
                  {validationPasses}/{REQUIRED_VALIDATION_PASSES} pasadas consecutivas
                </strong>
                . Run <strong>Test</strong> until you reach {REQUIRED_VALIDATION_PASSES}, then{' '}
                <strong>Promote to Active</strong>. A failed run resets the counter.
              </p>
            </div>
            <ValidationProgressBadge passes={validationPasses} showLabel detailed className="text-xs" />
          </div>
        )}
        {isNPlusOne && persona.nPlusOne ? (
          <NPlusOneRunView
            inputNMessages={inputNMessages}
            generatedEntries={generatedEntries}
            running={running}
            runStatus={run?.status}
            evalPassed={run?.evaluationResults?.[0]?.passed}
            messagesEndRef={messagesEndRef}
          />
        ) : showEmpty ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M12 11V7" />
                <path d="M8 7h8" />
                <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" />
                <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">No test results yet</p>
              <p className="mt-1 max-w-sm text-xs text-gray-400">
                Test your persona to see a simulated conversation and get performance feedback.
              </p>
            </div>
          </div>
        ) : (
          <RunMessageList entries={entries} running={running} messagesEndRef={messagesEndRef} />
        )}
      </ChatTestColumnLayout>
      <PromotePersonaDialog
        open={promoteOpen && readyToPromote}
        onOpenChange={setPromoteOpen}
        personaKey={persona.personaKey}
        onConfirm={() => setPersonas((prev) => setPersonaStatus(prev, persona.id, 'active'))}
      />
      <NPlusOneJourneyModal
        open={showFrameworkJourney}
        stepIndex={journeyStep}
        onStepChange={(next) => {
          setJourneyStep(next)
          if (next > ADMIN_JOURNEY_LAST_STEP + 1) {
            setJourneyOpen(false)
          }
        }}
        onClose={() => setJourneyOpen(false)}
      />
    </>
  )
}
