import { useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2Icon, FileIcon, PenIcon } from 'lucide-react'
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

  const { fields: evalFields, append: appendEval, remove: removeEval } = useFieldArray({
    control: form.control,
    name: 'evaluations',
  })

  const handleSubmit = useCallback(
    (data: PersonaFormData) => onSubmit(data),
    [onSubmit]
  )

  const addEvaluation = useCallback(() => {
    appendEval({ id: ulid(), maxTurns: 6, prompt: '', threshold: 1 })
  }, [appendEval])

  const title = TITLE_MAP[mode]
  const hasErrors = Object.keys(form.formState.errors).length > 0
  const isUpdate = mode === 'update'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 min-h-0 w-full h-full overflow-x-clip bg-white">

        {/* ── Sticky header ── */}
        <header className="flex w-full items-center justify-between h-16 sticky top-0 bg-background z-10 border-b border-gray-200 px-6">
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
        <div className="bg-background pb-20 px-4 overflow-auto flex-1">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4">
            <div className="flex w-full flex-col items-center gap-6 py-2 px-4">

              {/* ── Step 1: Persona Configuration ── */}
              <div className="w-full flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <StepBadge number={1} />
                  <h3 className="text-lg font-semibold text-foreground">Persona Configuration</h3>
                </div>

                <div className="flex flex-col gap-6 pl-11">
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
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-sm text-muted-foreground">
                          This will be displayed in test results
                        </p>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ── Objectives grid (5 cols: 2 instructions + 2 goal + 1 delete) ── */}
              <div className="w-full pl-11 flex flex-col gap-3">
                {/* Column headers */}
                <div className="grid grid-cols-5 w-full gap-4 items-end">
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-700">Instructions</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Describe how the persona should behave
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-700">Conversation End Condition</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      When should the conversation end
                    </p>
                  </div>
                  <div />
                </div>

                {/* Objectives row */}
                <FormField
                  control={form.control}
                  name="objectives.0.instructions"
                  render={({ field: instructionsField }) => (
                    <FormField
                      control={form.control}
                      name="objectives.0.goal"
                      render={({ field: goalField }) => (
                        <div className="grid grid-cols-5 w-full gap-4 items-start">
                          <div className="col-span-2">
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder={`"You are looking for shampoos. Start the conversation by asking if they are available..."`}
                                  rows={8}
                                  {...instructionsField}
                                  disabled={form.formState.isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </div>
                          <div className="col-span-2">
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder={`"The assistant provides a clear comparison between the first two offered products..."`}
                                  rows={8}
                                  {...goalField}
                                  disabled={form.formState.isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </div>
                          <div className="flex justify-center pt-2">
                            {/* placeholder for delete when multiple objectives */}
                          </div>
                        </div>
                      )}
                    />
                  )}
                />
              </div>

              <Separator className="w-full" />

              {/* ── Step 2: Mock Data ── */}
              <div className="w-full flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <StepBadge number={2} />
                  <h3 className="text-lg font-semibold text-foreground">Mock Data</h3>
                </div>
                <div className="pl-11">
                  <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 w-full hover:bg-muted/50 transition-colors duration-500">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 flex-shrink-0">
                      <FileIcon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-foreground">Mock data</p>
                      <p className="text-sm text-muted-foreground">
                        Mock data is required for tool call evaluations.
                      </p>
                    </div>
                    <div className="flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-200 h-8 w-8"
                      >
                        <PenIcon className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="w-full" />

              {/* ── Step 3: Evaluations ── */}
              <div className="w-full flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StepBadge number={3} />
                    <h3 className="text-lg font-semibold text-foreground">Evaluations</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEvaluation}
                    className="gap-1.5"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add evaluation
                  </Button>
                </div>

                <div className="pl-11 flex flex-col gap-3">
                  {evalFields.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No evaluations yet. Add one to define pass/fail criteria.
                    </p>
                  )}

                  {evalFields.map((evalField, index) => (
                    <div
                      key={evalField.id}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 w-full hover:bg-muted/50 transition-colors duration-500"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                        <span className="text-xs font-bold text-blue-700">{index + 1}</span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm font-semibold text-foreground">
                          Evaluation {index + 1}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`evaluations.${index}.maxTurns`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Max turns <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={50}
                                    className="w-24"
                                    disabled={form.formState.isSubmitting}
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`evaluations.${index}.threshold`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Threshold</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    className="w-24"
                                    disabled={form.formState.isSubmitting}
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">(Minimum)</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`evaluations.${index}.prompt`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prompt</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the success criteria. Output 1 if met, otherwise 0."
                                  rows={3}
                                  {...field}
                                  disabled={form.formState.isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-200 h-8 w-8"
                          onClick={() => removeEval(index)}
                        >
                          <Trash2Icon className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="w-full" />

              {/* ── Error summary ── */}
              {hasErrors && (
                <Alert variant="destructive" className="w-full">
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
              )}

              {/* ── Footer ── */}
              <footer
                className={cn(
                  'flex w-full flex-wrap items-center gap-4 px-4 pb-4',
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
        </div>
      </form>
    </Form>
  )
}
