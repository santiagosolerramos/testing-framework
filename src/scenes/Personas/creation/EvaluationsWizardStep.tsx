import { useMemo, useState } from 'react'
import { PlusIcon, XIcon } from 'lucide-react'
import type { PersonaWizardDraft } from '@/types/personaCreation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WizardShell } from './WizardShell'
import {
  buildPromptForEntry,
  getCatalogEntriesForSop,
  getCatalogEntryById,
  getSopDisplayLabel,
  wrapCustomEvalPrompt,
  type CatalogEvalEntry,
} from '@/services/evaluationCatalog'
import { suggestCatalogEvalIds } from '@/services/evaluationSelection'

type Props = {
  draft: PersonaWizardDraft
  onBack: () => void
  onClose: () => void
  onContinue: (
    selectedCatalogIds: string[],
    customPrompts: Record<string, string>,
    customEvalDescriptions: string[],
    isSmokeTest: boolean
  ) => void
}

type CatalogLine = {
  catalogId: string
  label: string
  description: string
  prompt: string
}

type CustomLine = {
  id: string
  label: string
  checkDescription: string
  prompt: string
}

function entryToLine(entry: CatalogEvalEntry, goal: string): CatalogLine {
  return {
    catalogId: entry.id,
    label: entry.label,
    description: entry.description,
    prompt: buildPromptForEntry(entry, goal),
  }
}

function EvalCard({
  title,
  description,
  prompt,
  onPromptChange,
  onRemove,
  canRemove,
  promptLabel = 'Evaluation prompt',
}: {
  title: string
  description: string
  prompt: string
  onPromptChange: (prompt: string) => void
  onRemove: () => void
  canRemove: boolean
  promptLabel?: string
}) {
  return (
    <div className="rounded-lg border border-purple-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-gray-400 hover:text-gray-700"
            onClick={onRemove}
            aria-label={`Remove ${title}`}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="mt-3">
        <Label className="text-xs text-gray-500">{promptLabel}</Label>
        <Textarea
          className="mt-1 min-h-[72px] font-mono text-xs"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export function EvaluationsWizardStep({ draft, onBack, onClose, onContinue }: Props) {
  const suggestedIds = useMemo(
    () =>
      draft.selectedCatalogEvalIds.length > 0
        ? draft.selectedCatalogEvalIds
        : suggestCatalogEvalIds({
            description: draft.description,
            resolvedSop: draft.resolvedSop,
            sopHints: draft.sopHints,
          }),
    [draft]
  )

  const catalogPool = useMemo(
    () => getCatalogEntriesForSop(draft.resolvedSop === 'auto' ? 'faq' : draft.resolvedSop),
    [draft.resolvedSop]
  )

  const [catalogLines, setCatalogLines] = useState<CatalogLine[]>(() =>
    suggestedIds
      .map((id) => getCatalogEntryById(id))
      .filter((e): e is CatalogEvalEntry => !!e)
      .map((e) => entryToLine(e, draft.goal))
  )

  const [customLines, setCustomLines] = useState<CustomLine[]>(() => {
    if (!draft.evalCatchAll.trim()) return []
    return [
      {
        id: 'custom-initial',
        label: 'Custom check',
        checkDescription: draft.evalCatchAll,
        prompt: wrapCustomEvalPrompt(draft.evalCatchAll),
      },
    ]
  })

  const [addCatalogOpen, setAddCatalogOpen] = useState(false)
  const [addingCustom, setAddingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState({ label: '', checkDescription: '' })

  const usedCatalogIds = new Set(catalogLines.map((l) => l.catalogId))
  const addableFromCatalog = catalogPool.filter((e) => !usedCatalogIds.has(e.id))

  const sopLabel = getSopDisplayLabel(draft.resolvedSop)

  const totalEvals = catalogLines.length + customLines.length

  const handleContinue = () => {
    const ids = catalogLines.map((l) => l.catalogId)
    const customPrompts = Object.fromEntries(catalogLines.map((l) => [l.catalogId, l.prompt]))
    const customEvalDescriptions = customLines.map((l) => l.prompt)
    onContinue(ids, customPrompts, customEvalDescriptions, false)
  }

  return (
    <WizardShell
      title="Evaluations"
      subtitle={`Recommended for ${sopLabel}. These checks are specific to this flow — edit prompts or add more below.`}
      stepLabel="Step 3 of 4"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={handleContinue} disabled={totalEvals === 0}>
            Continue to review →
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{totalEvals} evaluation</span>
          {totalEvals === 1 ? '' : 's'} for <span className="font-medium">{sopLabel}</span>.
          Goal completion is added automatically when tests run.
        </p>

        <div className="space-y-3">
          {catalogLines.map((line) => (
            <EvalCard
              key={line.catalogId}
              title={line.label}
              description={line.description}
              prompt={line.prompt}
              canRemove={totalEvals > 1}
              onPromptChange={(p) =>
                setCatalogLines((prev) =>
                  prev.map((l) => (l.catalogId === line.catalogId ? { ...l, prompt: p } : l))
                )
              }
              onRemove={() =>
                setCatalogLines((prev) => prev.filter((l) => l.catalogId !== line.catalogId))
              }
            />
          ))}

          {customLines.map((line) => (
            <EvalCard
              key={line.id}
              title={line.label}
              description={line.checkDescription}
              prompt={line.prompt}
              promptLabel="Evaluation prompt (auto-generated from your check)"
              canRemove={totalEvals > 1}
              onPromptChange={(p) =>
                setCustomLines((prev) =>
                  prev.map((l) => (l.id === line.id ? { ...l, prompt: p } : l))
                )
              }
              onRemove={() => setCustomLines((prev) => prev.filter((l) => l.id !== line.id))}
            />
          ))}

          {addingCustom && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/80 p-4 space-y-3">
              <p className="text-sm font-medium text-gray-900">Custom evaluation</p>
              <div>
                <Label className="text-xs text-gray-500">Short name (optional)</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Return policy mentioned"
                  value={customDraft.label}
                  onChange={(e) => setCustomDraft((d) => ({ ...d, label: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">What should we validate?</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  placeholder="e.g. Bot must mention return policy within 2 turns"
                  value={customDraft.checkDescription}
                  onChange={(e) =>
                    setCustomDraft((d) => ({ ...d, checkDescription: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!customDraft.checkDescription.trim()}
                  onClick={() => {
                    const desc = customDraft.checkDescription.trim()
                    setCustomLines((prev) => [
                      ...prev,
                      {
                        id: `custom-${Date.now()}`,
                        label: customDraft.label.trim() || 'Custom check',
                        checkDescription: desc,
                        prompt: wrapCustomEvalPrompt(desc),
                      },
                    ])
                    setCustomDraft({ label: '', checkDescription: '' })
                    setAddingCustom(false)
                  }}
                >
                  Add evaluation
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAddingCustom(false)
                    setCustomDraft({ label: '', checkDescription: '' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          {addableFromCatalog.length > 0 && (
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setAddCatalogOpen((v) => !v)
                  setAddingCustom(false)
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Add from {sopLabel} catalog
              </Button>
              {addCatalogOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full min-w-[280px] max-w-md rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {addableFromCatalog.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-gray-50"
                      onClick={() => {
                        setCatalogLines((prev) => [...prev, entryToLine(entry, draft.goal)])
                        setAddCatalogOpen(false)
                      }}
                    >
                      <span className="font-medium text-gray-900">{entry.label}</span>
                      <span className="text-xs text-gray-500">{entry.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!addingCustom && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setAddingCustom(true)
                setAddCatalogOpen(false)
              }}
            >
              <PlusIcon className="h-4 w-4" />
              Add custom evaluation
            </Button>
          )}
        </div>
      </div>
    </WizardShell>
  )
}
