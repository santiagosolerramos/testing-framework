import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { ArrowLeftIcon, BookOpenIcon, FlaskConicalIcon } from 'lucide-react'
import {
  appSectionAtom,
  nPlusOneJourneyOpenAtom,
  nPlusOneJourneyStepAtom,
} from '@/atoms/admin'
import { personasAtom, selectedPersonaIdAtom, sidebarTabAtom } from '@/atoms'
import { Button } from '@/components/ui/button'
import { AdminSessionDetail } from './AdminSessionDetail'
import { AdminSessionsList } from './AdminSessionsList'
import { AdminShell } from './AdminShell'
import { createNPlusOnePersona } from './createNPlusOneTest'
import { MOCK_PROD_CONVERSATIONS } from './mockProdConversations'
import { NPlusOneJourneyModal } from './NPlusOneJourneyModal'
import {
  ADMIN_JOURNEY_LAST_STEP,
  getJourneyStep,
} from './nPlusOneJourneySteps'

type View = 'list' | 'detail'
type AdminStep = 'conversation' | 'preview' | 'created'

const DEMO_SESSION_ID = 'prod-conv-puravida'

export function AdminPanel() {
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedEvalId, setSelectedEvalId] = useState<string | null>(null)
  const [step, setStep] = useState<AdminStep>('conversation')
  const [createdTest, setCreatedTest] = useState<{ id: string; name: string } | null>(null)

  const [journeyStep, setJourneyStep] = useAtom(nPlusOneJourneyStepAtom)
  const [journeyOpen, setJourneyOpen] = useAtom(nPlusOneJourneyOpenAtom)

  const setAppSection = useSetAtom(appSectionAtom)
  const setPersonas = useSetAtom(personasAtom)
  const setSelectedPersonaId = useSetAtom(selectedPersonaIdAtom)
  const setSidebarTab = useSetAtom(sidebarTabAtom)

  const conversation = useMemo(
    () => MOCK_PROD_CONVERSATIONS.find((c) => c.id === selectedId) ?? null,
    [selectedId]
  )

  const handleSelectSession = useCallback((id: string) => {
    const conv = MOCK_PROD_CONVERSATIONS.find((c) => c.id === id)
    setSelectedId(id)
    setView('detail')
    setStep('conversation')
    setCreatedTest(null)
    const firstFailed = conv?.evaluations.find((e) => e.status === 'failed')
    setSelectedEvalId(firstFailed?.id ?? conv?.failureEvalId ?? null)
  }, [])

  const handleConfirmCreate = useCallback(() => {
    if (!conversation || !selectedEvalId) return
    const persona = createNPlusOnePersona(conversation, selectedEvalId)
    setPersonas((prev) => [...prev, persona])
    setCreatedTest({ id: persona.id, name: persona.personaKey })
    setStep('created')
    return persona
  }, [conversation, selectedEvalId, setPersonas])

  const openInTestFramework = useCallback(
    (personaId?: string) => {
      const id = personaId ?? createdTest?.id
      if (id) setSelectedPersonaId(id)
      setSidebarTab('personas')
      setAppSection('agents')
    },
    [createdTest, setSelectedPersonaId, setSidebarTab, setAppSection]
  )

  const applyJourneyUi = useCallback(
    (index: number) => {
      const stepDef = getJourneyStep(index)
      if (!stepDef) return

      switch (stepDef.id) {
        case 'intro':
          setView('list')
          setSelectedId(null)
          setStep('conversation')
          break
        case 'sessions':
          setView('list')
          setSelectedId(null)
          setStep('conversation')
          break
        case 'session-detail':
          handleSelectSession(DEMO_SESSION_ID)
          setSelectedEvalId('eval-fallback')
          setStep('conversation')
          break
        case 'pick-eval':
          setView('detail')
          setSelectedId(DEMO_SESSION_ID)
          setStep('conversation')
          setSelectedEvalId('eval-fmt')
          break
        case 'preview-input-n':
          setView('detail')
          setSelectedId(DEMO_SESSION_ID)
          setSelectedEvalId('eval-fallback')
          setStep('preview')
          break
        case 'created': {
          setView('detail')
          setSelectedId(DEMO_SESSION_ID)
          setSelectedEvalId('eval-fallback')
          setStep('created')
          break
        }
        default:
          break
      }
    },
    [handleSelectSession]
  )

  useEffect(() => {
    if (journeyOpen && journeyStep <= ADMIN_JOURNEY_LAST_STEP) {
      applyJourneyUi(journeyStep)
    }
  }, [journeyOpen, journeyStep, applyJourneyUi])

  useEffect(() => {
    if (!journeyOpen || journeyStep !== 5 || createdTest) return
    const conv = MOCK_PROD_CONVERSATIONS.find((c) => c.id === DEMO_SESSION_ID)
    if (!conv) return
    const persona = createNPlusOnePersona(conv, 'eval-fallback')
    setPersonas((prev) => [...prev, persona])
    setCreatedTest({ id: persona.id, name: persona.personaKey })
    setStep('created')
  }, [journeyOpen, journeyStep, createdTest, setPersonas])

  const handleJourneyStepChange = useCallback(
    (next: number) => {
      if (next > ADMIN_JOURNEY_LAST_STEP) {
        let personaId = createdTest?.id
        if (!personaId && conversation && selectedEvalId) {
          const persona = createNPlusOnePersona(conversation, selectedEvalId)
          setPersonas((prev) => [...prev, persona])
          setCreatedTest({ id: persona.id, name: persona.personaKey })
          personaId = persona.id
        }
        setJourneyStep(next)
        setJourneyOpen(true)
        openInTestFramework(personaId)
        return
      }
      setJourneyStep(next)
    },
    [
      conversation,
      createdTest,
      openInTestFramework,
      selectedEvalId,
      setJourneyOpen,
      setJourneyStep,
      setPersonas,
    ]
  )

  const restartJourney = useCallback(() => {
    setCreatedTest(null)
    setJourneyStep(0)
    setJourneyOpen(true)
  }, [setJourneyOpen, setJourneyStep])

  const closeJourney = useCallback(() => {
    setJourneyOpen(false)
  }, [setJourneyOpen])

  const showAdminJourney =
    journeyOpen && journeyStep <= ADMIN_JOURNEY_LAST_STEP

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-gray-600"
          onClick={() => setAppSection('agents')}
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Test framework
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={restartJourney}
          >
            <BookOpenIcon className="h-3.5 w-3.5" />
            Guía N+1
          </Button>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900">
            Prototype · N+1 flow
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <AdminShell activeNav="sessions" onNavSessions={() => setView('list')}>
          {view === 'list' && (
            <AdminSessionsList
              conversations={MOCK_PROD_CONVERSATIONS}
              onSelect={handleSelectSession}
            />
          )}
          {view === 'detail' && conversation && (
            <AdminSessionDetail
              conversation={conversation}
              step={step}
              selectedEvalId={selectedEvalId}
              createdTestName={createdTest?.name}
              onBack={() => setView('list')}
              onSelectEval={setSelectedEvalId}
              onStepChange={setStep}
              onConfirmCreate={handleConfirmCreate}
              onOpenTestFramework={() => openInTestFramework()}
            />
          )}
          {view === 'detail' && !conversation && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white text-gray-500">
              <FlaskConicalIcon className="h-8 w-8 text-gray-300" />
              <p className="text-sm">Session not found</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setView('list')}>
                Back to Sessions
              </Button>
            </div>
          )}
        </AdminShell>
      </div>

      <NPlusOneJourneyModal
        open={showAdminJourney}
        stepIndex={journeyStep}
        onStepChange={handleJourneyStepChange}
        onClose={closeJourney}
      />
    </div>
  )
}
