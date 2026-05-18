import { useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, XIcon, FileIcon, PenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { personaFormSchema, INITIAL_PERSONA_DATA, extractFormErrors } from './form.config'
import type { PersonaFormData } from '@/types'
import { ulid } from 'ulid'
import { cn } from '@/lib/utils'

type Props = {
  initialData?: PersonaFormData
  mode: 'create' | 'update' | 'duplicate'
  onSubmit: (data: PersonaFormData) => Promise<void> | void
  onCancel: () => void
  onDelete?: () => void
}

const TITLE_MAP = {
  create: 'Create persona',
  update: 'Update persona',
  duplicate: 'Duplicate persona',
}

function StepBadge({ number }: { number: number }) {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-700 text-white font-semibold text-sm flex-shrink-0">
      {number}
    </div>
  )
}

export function PersonaForm({ initialData, mode, onSubmit, onCancel, onDelete }: Props) {
  const form = useForm<PersonaFormData>({
    resolver: zodResolver(personaFormSchema),
    defaultValues: initialData || INITIAL_PERSONA_DATA,
  })

  const { fields: criteriaFields, append: appendCriterion, remove: removeCriterion } = useFieldArray({
    control: form.control,
    name: 'evaluation.criteria',
  })

  const handleSubmit = useCallback((data: PersonaFormData) => onSubmit(data), [onSubmit])

  const addCriterion = useCallback(() => {
    appendCriterion({ id: ulid(), prompt: '' })
  }, [appendCriterion])

  const title = TITLE_MAP[mode]
  const isUpdate = mode === 'update'
  const hasErrors = Object.keys(form.formState.errors).length > 0

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col flex-1 min-h-0 w-full h-full bg-white"
      >
        {/* ── Sticky header ── */}
        <header className="flex w-full items-center justify-between h-16 sticky top-0 bg-background z-10 border-b border-gray-200 px-6 flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
              className="bg-purple-700 text-white hover:bg-purple-800"
            >
              {form.formState.isSubmitting ? 'Saving...' : title}
            </Button>
          </div>
        </header>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-4xl px-4 pb-20">

            {/* ════════════════════════════════════════
                Step 1 — Persona Configuration
            ════════════════════════════════════════ */}
            <div className="py-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <StepBadge number={1} />
                <h3 className="text-lg font-semibold text-foreground">Persona Configuration</h3>
              </div>

              <div className="flex flex-col gap-6">
                {/* Persona Name — full width */}
                <FormField
                  control={form.control}
                  name="personaKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Persona Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter persona name"
                          {...field}
                          disabled={form.formState.isSubmitting}
                          className="max-w-2xl"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        This will be displayed in test results
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Instructions — textarea left, example right */}
                <FormField
                  control={form.control}
                  name="objectives.0.instructions"
                  render={({ field }) => (
                    <FormItem className="gap-3">
                      <FormLabel>Instructions</FormLabel>
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-start" style={{ gridTemplateColumns: '3fr 2fr' }}>
                        <FormControl>
                          <Textarea
                            placeholder={`"You are looking for shampoos. Start the conversation by asking if they are available..."`}
                            rows={10}
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <div className="pt-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Example:</p>
                          <p className="text-sm text-muted-foreground italic leading-relaxed">
                            &ldquo;You are looking for shampoos. Start the conversation by asking if
                            they are available. Once the assistant shows you the results, immediately
                            ask it to compare the first two options it presented.&rdquo;
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conversation End Condition — textarea left, example right */}
                <FormField
                  control={form.control}
                  name="objectives.0.goal"
                  render={({ field }) => (
                    <FormItem className="gap-3">
                      <FormLabel>Conversation End Condition</FormLabel>
                      <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '3fr 2fr' }}>
                        <FormControl>
                          <Textarea
                            placeholder={`"The assistant provides a clear comparison between the first two offered products..."`}
                            rows={4}
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <div className="pt-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Example:</p>
                          <p className="text-sm text-muted-foreground italic leading-relaxed">
                            &ldquo;The assistant provides a clear comparison between the first two
                            offered shampoo products, including price and quality differences.&rdquo;
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* ════════════════════════════════════════
                Step 2 — Mock Data
            ════════════════════════════════════════ */}
            <div className="py-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <StepBadge number={2} />
                <h3 className="text-lg font-semibold text-foreground">Mock Data</h3>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <FileIcon className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mock data</p>
                    <p className="text-sm text-muted-foreground">
                      Mock data is required for tool call evaluations.
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="hover:bg-gray-100 h-8 w-8 flex-shrink-0">
                  <PenIcon className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* ════════════════════════════════════════
                Step 3 — Evaluations
            ════════════════════════════════════════ */}
            <div className="py-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StepBadge number={3} />
                  <h3 className="text-lg font-semibold text-foreground">Evaluations</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCriterion}
                  className="gap-1.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add evaluation
                </Button>
              </div>

              {/* Max turns card */}
              <div className="rounded-lg border border-gray-200 p-5 flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="evaluation.maxTurns"
                  render={({ field }) => (
                    <FormItem className="gap-2">
                      <FormLabel>
                        Max turns <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          className="w-24"
                          disabled={form.formState.isSubmitting}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Maximum number of conversation turns before the test stops
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Individual criteria (prompts) */}
              {criteriaFields.map((criterion, index) => (
                <div key={criterion.id} className="flex flex-col gap-1.5">
                  <FormField
                    control={form.control}
                    name={`evaluation.criteria.${index}.prompt`}
                    render={({ field }) => (
                      <FormItem className="gap-1.5">
                        <div className="relative">
                          <FormControl>
                            <Textarea
                              placeholder="Output 1 if the agent meets the criteria, otherwise 0."
                              rows={3}
                              {...field}
                              disabled={form.formState.isSubmitting}
                              className="pr-10"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => removeCriterion(index)}
                            className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Remove criterion"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    Returns 1 if all conditions are met, 0 otherwise
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Error summary */}
            {hasErrors && (
              <div className="py-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    <p className="font-medium mb-1">Please fix the following errors:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {extractFormErrors(form.formState.errors as Record<string, unknown>).map(
                        ({ field, message }) => (
                          <li key={field} className="text-sm">
                            <span className="font-medium capitalize">{field}: </span>
                            {message}
                          </li>
                        )
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Footer — delete button only shows on update */}
            <footer
              className={cn(
                'flex w-full flex-wrap items-center gap-4 py-4',
                isUpdate && onDelete ? 'justify-between' : 'justify-end'
              )}
            >
              {isUpdate && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={form.formState.isSubmitting}
                >
                  Delete persona
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-purple-700 text-white hover:bg-purple-800"
                >
                  {form.formState.isSubmitting ? 'Saving...' : title}
                </Button>
              </div>
            </footer>
          </div>
        </div>
      </form>
    </Form>
  )
}
