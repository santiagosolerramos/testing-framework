import { z } from 'zod'
import type { PersonaFormData } from '@/types'

const PERSONA_KEY_REGEX = /^[a-zA-Z0-9 _-]+$/

const criterionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(1, 'Prompt is required'),
})

export const personaFormSchema = z.object({
  personaKey: z
    .string()
    .min(2, 'Persona name must be at least 2 characters')
    .max(100, 'Persona name must be at most 100 characters')
    .regex(
      PERSONA_KEY_REGEX,
      'Only letters, numbers, spaces, hyphens, and underscores are allowed'
    ),
  objectives: z
    .array(
      z.object({
        instructions: z.string().min(1, 'Instructions are required'),
        goal: z.string().min(1, 'Conversation end condition is required'),
      })
    )
    .min(1, 'At least one objective is required'),
  evaluation: z.object({
    maxTurns: z.number().min(1, 'Must be at least 1').max(100),
    criteria: z.array(criterionSchema).min(1, 'At least one evaluation is required'),
  }),
  fixtureId: z.string().nullable().optional(),
})

export const INITIAL_PERSONA_DATA: PersonaFormData = {
  personaKey: '',
  objectives: [{ instructions: '', goal: '' }],
  evaluation: { maxTurns: 10, criteria: [{ id: 'initial', prompt: '' }] },
  fixtureId: null,
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
