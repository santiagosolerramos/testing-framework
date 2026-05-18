import { useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2Icon, FileIcon, PencilIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { personaFormSchema, INITIAL_PERSONA_DATA, extractFormErrors } from './form.config'
import type { PersonaFormData } from '@/types'
import { ulid } from 'ulid'

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting} className="bg-purple-700 hover:bg-purple-800">
              {form.formState.isSubmitting ? 'Saving...' : title}
            </Button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto py-8 px-6 flex flex-col gap-8">

            {/* ── Step 1: Persona Configuration ── */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <StepBadge number={1} />
                <h2 className="text-lg font-semibold text-gray-900">Persona Configuration</h2>
              </div>

              <div className="flex flex-col gap-6 pl-11">
                <FormField
                  control={form.control}
                  name="personaKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Persona Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter persona name" {...field} disabled={form.formState.isSubmitting} />
                      </FormControl>
                      <p className="text-xs text-gray-500">This will be displayed in test results</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="objectives.0.instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter instructions"
                            rows={8}
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-2 pt-6">
                    <p className="text-sm text-gray-500">
                      <strong>Example:</strong>
                    </p>
                    <p className="text-sm text-gray-400 italic">
                      &ldquo;You are looking for shampoos. Start the conversation by asking if they
                      are available. Once the assistant shows you the results, immediately ask it to
                      compare the first two options it presented.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="objectives.0.goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conversation End Condition</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter conversation end condition"
                            rows={4}
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-2 pt-6">
                    <p className="text-sm text-gray-500">
                      <strong>Example:</strong>
                    </p>
                    <p className="text-sm text-gray-400 italic">
                      &ldquo;The assistant provides a clear comparison between the first two offered
                      shampoo products, including price and quality differences.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* ── Step 2: Mock Data ── */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <StepBadge number={2} />
                <h2 className="text-lg font-semibold text-gray-900">Mock Data</h2>
              </div>

              <div className="pl-11">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileIcon className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Mock data</p>
                      <p className="text-xs text-gray-400">Mock data is required for tool call evaluations.</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <PencilIcon className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            </section>

            <Separator />

            {/* ── Step 3: Evaluations ── */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StepBadge number={3} />
                  <h2 className="text-lg font-semibold text-gray-900">Evaluations</h2>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addEvaluation} className="gap-1.5">
                  <PlusIcon className="w-4 h-4" />
                  Add evaluation
                </Button>
              </div>

              <div className="pl-11 flex flex-col gap-4">
                {evalFields.length === 0 && (
                  <p className="text-sm text-gray-400">No evaluations yet. Add one to define pass/fail criteria.</p>
                )}
                {evalFields.map((evalField, index) => (
                  <div key={evalField.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Evaluation {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={() => removeEval(index)}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`evaluations.${index}.maxTurns`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Max turns <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number" min={1} max={50} className="w-24"
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
                      name={`evaluations.${index}.prompt`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the success criteria. Output 1 if met, otherwise 0."
                              rows={4}
                              {...field}
                              disabled={form.formState.isSubmitting}
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
                              type="number" min={0} max={1} step={0.1} className="w-24"
                              disabled={form.formState.isSubmitting}
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-400">(Minimum)</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Error summary */}
            {hasErrors && (
              <Alert variant="destructive">
                <AlertDescription>
                  <p className="font-medium mb-1">Please fix the following errors:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {extractFormErrors(form.formState.errors as Record<string, unknown>).map(({ field, message }) => (
                      <li key={field} className="text-sm">
                        <span className="font-medium capitalize">{field}: </span>
                        {message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Delete button */}
            {mode === 'update' && onDelete && (
              <div className="flex justify-start pb-4">
                <Button type="button" variant="destructive" onClick={onDelete} disabled={form.formState.isSubmitting}>
                  Delete persona
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
