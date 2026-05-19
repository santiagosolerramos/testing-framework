import { useState } from 'react'
import type { PersonaWizardDraft } from '@/types/personaCreation'
import { getFixtureById } from '@/fixtures/fixtureRegistry'
import { Button } from '@/components/ui/button'
import { WizardShell } from './WizardShell'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  draft: PersonaWizardDraft
  onBack: () => void
  onClose: () => void
  onContinue: (fixtureId: string | null) => void
}

function PreviewDialog({
  open,
  onOpenChange,
  json,
  title,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  json: string
  title: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <pre className="max-h-80 overflow-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">
          {json}
        </pre>
      </DialogContent>
    </Dialog>
  )
}

export function FixtureMatchStep({ draft, onBack, onClose, onContinue }: Props) {
  const match = draft.fixtureMatch
  const [selectedId, setSelectedId] = useState<string | null>(
    match.kind === 'single'
      ? match.selectedFixtureId
      : match.kind === 'multiple'
        ? match.selectedFixtureId
        : null
  )
  const [previewJson, setPreviewJson] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState('')

  const openPreview = (id: string) => {
    const f = getFixtureById(id)
    if (f) {
      setPreviewJson(f.mockData)
      setPreviewTitle(f.name)
    }
  }

  const required = match.requiredCapabilities

  if (match.kind === 'single') {
    const m = match.match
    return (
      <WizardShell
        title="Data for this scenario"
        subtitle="Matched against the fixture library"
        stepLabel="Step 2 of 4"
        onClose={onClose}
        footer={
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="button" onClick={() => onContinue(m.fixtureId)}>
              Continue →
            </Button>
          </div>
        }
      >
        <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p>
            We&apos;ll use fixture <strong>{m.fixtureName}</strong> (covers{' '}
            {m.coveredCapabilities.join(', ')}).
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => openPreview(m.fixtureId)}>
            Preview
          </Button>
        </div>
        <PreviewDialog
          open={!!previewJson}
          onOpenChange={() => setPreviewJson(null)}
          json={previewJson || ''}
          title={previewTitle}
        />
      </WizardShell>
    )
  }

  if (match.kind === 'multiple') {
    return (
      <WizardShell
        title="Choose fixture"
        subtitle="Multiple fixtures match this scenario"
        stepLabel="Step 2 of 4"
        onClose={onClose}
        footer={
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="button" disabled={!selectedId} onClick={() => onContinue(selectedId)}>
              Continue →
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {match.matches.map((m) => (
            <button
              key={m.fixtureId}
              type="button"
              onClick={() => setSelectedId(m.fixtureId)}
              className={`w-full rounded-lg border p-4 text-left text-sm ${
                selectedId === m.fixtureId
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{m.fixtureName}</span>
                <span className="text-xs text-gray-500">{Math.round(m.confidence * 100)}% match</span>
              </div>
              <p className="mt-1 text-gray-600">Covers: {m.coveredCapabilities.join(', ')}</p>
              <Button
                type="button"
                variant="link"
                className="mt-1 h-auto p-0 text-purple-700"
                onClick={(e) => {
                  e.stopPropagation()
                  openPreview(m.fixtureId)
                }}
              >
                Preview
              </Button>
            </button>
          ))}
        </div>
        <PreviewDialog
          open={!!previewJson}
          onOpenChange={() => setPreviewJson(null)}
          json={previewJson || ''}
          title={previewTitle}
        />
      </WizardShell>
    )
  }

  return (
    <WizardShell
      title="No fixture match"
      subtitle="Save as Draft and assign a fixture later from the library"
      stepLabel="Step 2 of 4"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button type="button" variant="outline" onClick={() => onContinue(null)}>
            Continue as Draft →
          </Button>
        </div>
      }
    >
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>
          No fixture matches this scenario
          {required.length > 0 && <> (needs: {required.join(', ')})</>}.
        </p>
        <p className="mt-2">
          Create a fixture in the fixture library, then assign it on Review &amp; Save or from the
          persona form.
        </p>
      </div>
    </WizardShell>
  )
}
