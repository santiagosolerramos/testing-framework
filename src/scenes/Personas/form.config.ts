import { z } from 'zod'
import type { PersonaFormData } from '@/types'

const criterionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(1, 'Prompt is required'),
})

export const personaFormSchema = z.object({
  personaKey: z.string().min(1, 'Persona name is required'),
  objectives: z
    .array(
      z.object({
        instructions: z.string().min(1, 'Instructions are required'),
        goal: z.string().min(1, 'Conversation end condition is required'),
      })
    )
    .min(1),
  evaluation: z.object({
    maxTurns: z.number().min(1, 'Must be at least 1').max(100),
    criteria: z.array(criterionSchema),
  }),
  mockData: z.string().optional(),
})

export const INITIAL_PERSONA_DATA: PersonaFormData = {
  personaKey: '',
  objectives: [{ instructions: '', goal: '' }],
  evaluation: { maxTurns: 6, criteria: [] },
  mockData: undefined,
}

export function extractFormErrors(
  errors: Record<string, unknown>
): { field: string; message: string }[] {
  const result: { field: string; message: string }[] = []
  function traverse(obj: Record<string, unknown>, prefix = '') {
    for (const [key, val] of Object.entries(obj)) {
      const field = prefix ? `${prefix}.${key}` : key
      if (val && typeof val === 'object') {
        if ('message' in val) {
          result.push({ field, message: String((val as { message: string }).message) })
        } else {
          traverse(val as Record<string, unknown>, field)
        }
      }
    }
  }
  traverse(errors)
  return result
}
