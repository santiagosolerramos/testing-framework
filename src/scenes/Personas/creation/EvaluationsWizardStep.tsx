import { useState } from 'react'
import type { EvalToggles, PersonaWizardDraft } from '@/types/personaCreation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WizardShell } from './WizardShell'
import { cn } from '@/lib/utils'

type Props = {
  draft: PersonaWizardDraft
  onBack: () => void
  onClose: () => void
  onContinue: (toggles: EvalToggles, isSmokeTest: boolean) => void
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
      <input
        type="checkbox"
        className="mt-1"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  )
}

export function EvaluationsWizardStep({ draft, onBack, onClose, onContinue }: Props) {
  const [toggles, setToggles] = useState<EvalToggles>(draft.evalToggles)
  const [isSmokeTest, setIsSmokeTest] = useState(draft.isSmokeTest)

  const setToggle = (key: keyof EvalToggles, value: boolean | string) => {
    setToggles((t) => ({ ...t, [key]: value }))
  }

  return (
    <WizardShell
      title="Evaluations"
      subtitle="Goal completion is always included. Add optional checks below."
      stepLabel="Step 3 of 4"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={() => onContinue(toggles, isSmokeTest)}>
            Continue to review →
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-3 text-sm text-purple-900">
          <p className="font-medium">Goal completion (always on)</p>
          <p className="mt-1 text-purple-800/90">
            Did the bot accomplish: &ldquo;{draft.goal.slice(0, 120)}
            {draft.goal.length > 120 ? '…' : ''}&rdquo;
          </p>
        </div>

        <ToggleRow
          label="KB grounding"
          description="Bot's answer is grounded in the KB, not invented (FAQ)"
          checked={toggles.kbGrounding}
          onChange={(v) => setToggle('kbGrounding', v)}
        />
        <ToggleRow
          label="Handover quality"
          description="Bot collected required info before escalating"
          checked={toggles.handoverQuality}
          onChange={(v) => setToggle('handoverQuality', v)}
        />
        <ToggleRow
          label="Tone / language"
          description="Bot responds in PT-BR and maintains professional tone"
          checked={toggles.toneLanguage}
          onChange={(v) => setToggle('toneLanguage', v)}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="catch-all">Anything else you want to evaluate?</Label>
          <Textarea
            id="catch-all"
            rows={3}
            placeholder="e.g. Bot must mention return policy within 2 turns"
            value={toggles.catchAll}
            onChange={(e) => setToggle('catchAll', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Free text — converted to a structured eval prompt when you save.
          </p>
        </div>

        <label
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
            isSmokeTest ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
          )}
        >
          <input
            type="checkbox"
            checked={isSmokeTest}
            onChange={(e) => setIsSmokeTest(e.target.checked)}
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Smoke-test persona</p>
            <p className="text-xs text-gray-500">
              Auto-fills preset messages from the first user message (required for deterministic
              smoke runs).
            </p>
          </div>
        </label>
      </div>
    </WizardShell>
  )
}
