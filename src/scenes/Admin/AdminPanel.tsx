import { useCallback, useMemo, useState } from 'react'
import { useSetAtom } from 'jotai'
import { ArrowLeftIcon, FlaskConicalIcon } from 'lucide-react'
import { appSectionAtom } from '@/atoms/admin'
import { personasAtom, selectedPersonaIdAtom, sidebarTabAtom } from '@/atoms'
import { Button } from '@/components/ui/button'
import { AdminSessionDetail } from './AdminSessionDetail'
import { AdminSessionsList } from './AdminSessionsList'
import { AdminShell } from './AdminShell'
import { createNPlusOnePersona } from './createNPlusOneTest'
import { MOCK_PROD_CONVERSATIONS } from './mockProdConversations'

type View = 'list' | 'detail'
type AdminStep = 'conversation' | 'preview' | 'created'

export function AdminPanel() {
  const [view, setView] = useState<View>('detail')
  const [selectedId, setSelectedId] = useState<string | null>('prod-conv-puravida')
  const [selectedEvalId, setSelectedEvalId] = useState<string | null>('eval-fallback')
  const [step, setStep] = useState<AdminStep>('conversation')
  const [createdTest, setCreatedTest] = useState<{ id: string; name: string } | null>(null)

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
  }, [conversation, selectedEvalId, setPersonas])

  const openInTestFramework = useCallback(() => {
    if (createdTest) setSelectedPersonaId(createdTest.id)
    setSidebarTab('personas')
    setAppSection('agents')
  }, [createdTest, setSelectedPersonaId, setSidebarTab, setAppSection])

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
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900">
          Prototype · N+1 flow
        </span>
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
              onOpenTestFramework={openInTestFramework}
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
    </div>
  )
}
