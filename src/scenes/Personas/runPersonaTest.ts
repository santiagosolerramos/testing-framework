import { mockInvokeAgent } from '@/services/mockAI'
import type { Persona, TestSuiteRun } from '@/types'

const DEMO_PERSONA_KEY = 'checkout-cep-lookup'

/** Simulated single persona test (suite or draft validation). */
export async function executePersonaTest(persona: Persona): Promise<TestSuiteRun> {
  try {
    await mockInvokeAgent(persona.objectives[0]?.instructions || 'test')
    const passed = persona.personaKey === DEMO_PERSONA_KEY ? true : Math.random() > 0.2
    const evaluationResults = persona.evaluation.criteria.map((c, i) => ({
      name: `Evaluation ${i + 1}`,
      passed,
      score: passed ? 1 : 0,
      prompt: c.prompt,
    }))
    return {
      status: passed ? 'TEST_RUN_STATUS_PASSED' : 'TEST_RUN_STATUS_FAILED',
      evaluationResults,
    }
  } catch {
    return { status: 'TEST_RUN_STATUS_FAILED' }
  }
}
