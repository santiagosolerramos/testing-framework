import { useEffect, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertTriangleIcon, Loader2Icon } from 'lucide-react'
import { sandboxConversationsAtom } from '@/atoms'
import { personaCreationAtom } from '@/atoms/personaCreation'
import type { LanguageId, ParsedConversationTurn, PersonaWizardDraft } from '@/types/personaCreation'
import { isFaqOrHandoverOnly } from '@/types/personaCreation'
import {
  buildCriteriaFromToggles,
  finalizeDraftWithFixture,
  generatePersonaFromConversation,
} from '@/services/personaGeneration'
import { fetchSessionTranscript } from '@/services/mockSessionFetch'
import { parseTranscript } from '@/services/parseTranscript'
import { LANGUAGES, TRANSCRIPT_PLACEHOLDER } from './constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { WizardShell } from './WizardShell'
import { ThumbsConversationStep } from './ThumbsConversationStep'
import { FixtureMatchStep } from './FixtureMatchStep'
import { TransactionalWarningDialog } from './TransactionalWarningDialog'
import { PersonaReviewStep } from './PersonaReviewStep'

type Tab = 'session' | 'paste'

type Props = {
  onClose: () => void
  preloadedSessionId?: string | null
}

export function ConversationWizard({ onClose, preloadedSessionId }: Props) {
  const setCreation = useSetAtom(personaCreationAtom)
  const sandboxSessions = useAtomValue(sandboxConversationsAtom)
  const [tab, setTab] = useState<Tab>(preloadedSessionId ? 'session' : 'session')
  const [sessionId, setSessionId] = useState(preloadedSessionId || '')
  const [pastedTranscript, setPastedTranscript] = useState('')
  const [language, setLanguage] = useState<LanguageId>('pt-BR')
  const [parseWarning, setParseWarning] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [step, setStep] = useState<
    'input' | 'extracting' | 'thumbs' | 'transactional-warning' | 'fixtures' | 'review'
  >('input')
  const [draft, setDraft] = useState<PersonaWizardDraft | null>(null)
  const [pendingDraft, setPendingDraft] = useState<PersonaWizardDraft | null>(null)

  useEffect(() => {
    if (preloadedSessionId) {
      setSessionId(preloadedSessionId)
      setTab('session')
    }
  }, [preloadedSessionId])

  const resolveInput = async (): Promise<ParsedConversationTurn[] | null> => {
    if (tab === 'session') {
      const res = await fetchSessionTranscript(sessionId, sandboxSessions)
      if (!res.valid) {
        setSessionError(res.error || 'Invalid session')
        return null
      }
      setSessionError(null)
      return res.turns
    }
    const parsed = parseTranscript(pastedTranscript)
    setParseWarning(parsed.warning || null)
    if (!parsed.valid && parsed.turns.length < 2) return null
    return parsed.turns
  }

  const handleExtract = async () => {
    setStep('extracting')
    const inputTurns = await resolveInput()
    if (!inputTurns?.length) {
      setStep('input')
      return
    }
    const result = await generatePersonaFromConversation({ turns: inputTurns, language })
    if (result.transactionalWarning) {
      setPendingDraft(result.draft)
      setStep('transactional-warning')
      return
    }
    setDraft(result.draft)
    setStep('thumbs')
  }

  const needsFixtureStep = (d: PersonaWizardDraft) =>
    !isFaqOrHandoverOnly(d.resolvedSop) || !d.mocksComplete

  const goReviewOrFixtures = (d: PersonaWizardDraft) => {
    if (needsFixtureStep(d)) {
      setDraft(d)
      setStep('fixtures')
    } else {
      setDraft(d)
      setStep('review')
    }
  }

  if (step === 'extracting') {
    return (
      <WizardShell title="Extracting persona" stepLabel="Step 2 of 4" onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Loader2Icon className="h-10 w-10 animate-spin text-purple-700" />
          <p className="text-sm text-gray-600">
            Building profile, goal, and evaluations from the conversation…
          </p>
        </div>
      </WizardShell>
    )
  }

  if (step === 'transactional-warning' && pendingDraft) {
    return (
      <TransactionalWarningDialog
        open
        onCancel={onClose}
        onContinueAsFaq={() => {
          setDraft({ ...pendingDraft, resolvedSop: 'faq' })
          setStep('thumbs')
          setPendingDraft(null)
        }}
        onReclassify={() => {
          setDraft({ ...pendingDraft, resolvedSop: 'checkout' })
          setStep('thumbs')
          setPendingDraft(null)
        }}
      />
    )
  }

  if (step === 'thumbs' && draft) {
    return (
      <ThumbsConversationStep
        draft={draft}
        onBack={() => setStep('input')}
        onClose={onClose}
        onContinue={(updatedTurns) => {
          const criteria = buildCriteriaFromToggles(
            draft.goal,
            draft.evalToggles,
            updatedTurns
          )
          const next = { ...draft, conversationTurns: updatedTurns, criteria }
          setDraft(next)
          goReviewOrFixtures(next)
        }}
      />
    )
  }

  if (step === 'fixtures' && draft) {
    return (
      <FixtureMatchStep
        draft={draft}
        onBack={() => setStep('thumbs')}
        onClose={onClose}
        onContinue={(fixtureId) => {
          const next = finalizeDraftWithFixture(draft, fixtureId)
          setDraft(next)
          setStep('review')
        }}
      />
    )
  }

  if (step === 'review' && draft) {
    return (
      <PersonaReviewStep
        draft={draft}
        onBack={() => (needsFixtureStep(draft) ? setStep('fixtures') : setStep('thumbs'))}
        onClose={onClose}
        onDone={() => setCreation(null)}
      />
    )
  }

  const canContinue =
    tab === 'session' ? sessionId.trim().length > 0 : pastedTranscript.trim().length > 0

  return (
    <WizardShell
      title="From conversation"
      subtitle="FAQ and Handover flows (MVP). Transactional only when a fixture matches."
      stepLabel="Step 1 of 4"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button type="button" onClick={handleExtract} disabled={!canContinue}>
            Continue →
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {(['session', 'paste'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium',
              tab === t
                ? 'border-b-2 border-purple-700 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t === 'session' ? 'From Session ID' : 'Paste transcript'}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <Label>Language</Label>
        <select
          className="h-10 max-w-xs rounded-md border border-gray-200 px-3 text-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageId)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {tab === 'session' && (
        <div className="space-y-2">
          <Label htmlFor="session-id">Session ID</Label>
          <Input
            id="session-id"
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value)
              setSessionError(null)
            }}
            placeholder="Paste session ID from production logs or Sandbox"
          />
          {sessionError && (
            <p className="text-sm text-red-600">{sessionError}</p>
          )}
          <p className="text-xs text-gray-500">
            Mock: use a Sandbox session ID, or <code className="text-gray-700">demo-abc</code> /{' '}
            <code className="text-gray-700">prod-xyz</code> for a sample transcript.
          </p>
        </div>
      )}

      {tab === 'paste' && (
        <div className="space-y-2">
          <Label htmlFor="transcript">Transcript</Label>
          <Textarea
            id="transcript"
            rows={12}
            value={pastedTranscript}
            onChange={(e) => {
              setPastedTranscript(e.target.value)
              const p = parseTranscript(e.target.value)
              setParseWarning(p.warning || null)
            }}
            placeholder={TRANSCRIPT_PLACEHOLDER}
          />
          {parseWarning && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{parseWarning}</span>
            </div>
          )}
        </div>
      )}
    </WizardShell>
  )
}
