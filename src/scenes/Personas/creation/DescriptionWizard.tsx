import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { Loader2Icon } from 'lucide-react'
import { personaCreationAtom } from '@/atoms/personaCreation'
import type { LanguageId, PersonaWizardDraft, SopHint } from '@/types/personaCreation'
import { isFaqOrHandoverOnly } from '@/types/personaCreation'
import {
  finalizeDraftWithEvaluations,
  finalizeDraftWithFixture,
  generatePersonaFromDescription,
} from '@/services/personaGeneration'
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_PLACEHOLDER,
  LANGUAGES,
  SOP_HINT_OPTIONS,
} from './constants'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WizardShell } from './WizardShell'
import { FixtureMatchStep } from './FixtureMatchStep'
import { EvaluationsWizardStep } from './EvaluationsWizardStep'
import { TransactionalWarningDialog } from './TransactionalWarningDialog'
import { PersonaReviewStep } from './PersonaReviewStep'
import { cn } from '@/lib/utils'

type Props = { onClose: () => void }

type Step =
  | 'describe'
  | 'generating'
  | 'transactional-warning'
  | 'fixtures'
  | 'evaluations'
  | 'review'

export function DescriptionWizard({ onClose }: Props) {
  const setCreation = useSetAtom(personaCreationAtom)
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState<LanguageId>('pt-BR')
  const [sopHints, setSopHints] = useState<Exclude<SopHint, 'auto'>[]>([])
  const [step, setStep] = useState<Step>('describe')
  const [draft, setDraft] = useState<PersonaWizardDraft | null>(null)
  const [pendingDraft, setPendingDraft] = useState<PersonaWizardDraft | null>(null)

  const toggleHint = (id: Exclude<SopHint, 'auto'>) => {
    setSopHints((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    )
  }

  const needsFixtureStep = (d: PersonaWizardDraft) =>
    !isFaqOrHandoverOnly(d.resolvedSop) || d.fixtureMatch.kind !== 'none'

  const goAfterGeneration = (d: PersonaWizardDraft) => {
    if (isFaqOrHandoverOnly(d.resolvedSop) && d.fixtureMatch.kind === 'none') {
      setDraft(d)
      setStep('evaluations')
      return
    }
    setDraft(d)
    setStep('fixtures')
  }

  const handleGenerate = async () => {
    if (!description.trim()) return
    setStep('generating')
    const result = await generatePersonaFromDescription({
      description: description.trim(),
      language,
      sopHints,
    })
    if (result.transactionalWarning) {
      setPendingDraft(result.draft)
      setStep('transactional-warning')
      return
    }
    goAfterGeneration(result.draft)
  }

  if (step === 'generating') {
    return (
      <WizardShell title="Matching your scenario" stepLabel="Step 2 of 4" onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Loader2Icon className="h-10 w-10 animate-spin text-purple-700" />
          <p className="text-sm text-gray-600">
            Parsing intent and matching against the fixture library…
          </p>
          <p className="text-xs text-gray-400">Usually 3–5 seconds</p>
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
          goAfterGeneration({ ...pendingDraft, resolvedSop: 'faq' })
          setPendingDraft(null)
        }}
        onReclassify={() => {
          goAfterGeneration({ ...pendingDraft, resolvedSop: 'checkout' })
          setPendingDraft(null)
        }}
      />
    )
  }

  if (step === 'fixtures' && draft) {
    return (
      <FixtureMatchStep
        draft={draft}
        onBack={() => setStep('describe')}
        onClose={onClose}
        onContinue={(fixtureId) => {
          const next = finalizeDraftWithFixture(draft, fixtureId)
          setDraft(next)
          setStep('evaluations')
        }}
      />
    )
  }

  if (step === 'evaluations' && draft) {
    return (
      <EvaluationsWizardStep
        draft={draft}
        onBack={() => (needsFixtureStep(draft) ? setStep('fixtures') : setStep('describe'))}
        onClose={onClose}
        onContinue={(toggles, isSmokeTest) => {
          setDraft(finalizeDraftWithEvaluations(draft, toggles, isSmokeTest))
          setStep('review')
        }}
      />
    )
  }

  if (step === 'review' && draft) {
    return (
      <PersonaReviewStep
        draft={draft}
        onBack={() => setStep('evaluations')}
        onClose={onClose}
        onDone={() => setCreation(null)}
      />
    )
  }

  return (
    <WizardShell
      title="From description"
      subtitle="Describe what you want to test"
      stepLabel="Step 1 of 4"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!description.trim() || description.length > DESCRIPTION_MAX_LENGTH}
          >
            Generate persona →
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="desc">What do you want to test?</Label>
            <span
              className={cn(
                'text-xs',
                description.length > DESCRIPTION_MAX_LENGTH ? 'text-red-600' : 'text-gray-400'
              )}
            >
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id="desc"
            rows={8}
            maxLength={DESCRIPTION_MAX_LENGTH}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={DESCRIPTION_PLACEHOLDER}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Language</Label>
          <select
            className="h-10 rounded-md border border-gray-200 px-3 text-sm"
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

        <div className="flex flex-col gap-2">
          <Label className="text-gray-500">Flow hints (optional)</Label>
          <p className="text-xs text-gray-400">
            Orientation only — a persona can cover multiple flows (e.g. order status + handover).
          </p>
          <div className="flex flex-wrap gap-2">
            {SOP_HINT_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleHint(s.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  sopHints.includes(s.id)
                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </WizardShell>
  )
}
