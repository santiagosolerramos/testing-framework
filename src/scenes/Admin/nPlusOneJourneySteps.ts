export type JourneySurface = 'admin' | 'framework'

export type NPlusOneJourneyStep = {
  id: string
  surface: JourneySurface
  title: string
  summary: string
  bullets: string[]
  actionHint?: string
}

export const N_PLUS_ONE_JOURNEY_STEPS: NPlusOneJourneyStep[] = [
  {
    id: 'intro',
    surface: 'admin',
    title: 'N+1 offline tests',
    summary:
      'Cuando una conversación real falla en producción, no necesitas simular desde cero. Reproduces el fallo: tomas el contexto previo como input, y evalúas la nueva respuesta del LLM con el mismo criterio que falló en prod.',
    bullets: [
      'Sin instrucciones de usuario simulado ni mock data que predecir.',
      'El test se arma en minutos desde el Admin Panel.',
      'Cierra el loop: fallo en prod → test de regresión → deploy seguro.',
    ],
  },
  {
    id: 'sessions',
    surface: 'admin',
    title: 'Paso 1 · Sesiones fallidas',
    summary:
      'En Sessions ves conversaciones recientes de producción. El foco está en las que fallaron evals — ahí es donde tiene sentido crear un N+1.',
    bullets: [
      'Badge rojo = evals fallidas en esa sesión.',
      'Needs review = aún no revisada por el equipo.',
      'Abre una sesión para ver el transcript completo.',
    ],
    actionHint: 'A continuación abrimos la sesión demo de Puravida.',
  },
  {
    id: 'session-detail',
    surface: 'admin',
    title: 'Paso 2 · Conversación y evals',
    summary:
      'La conversación se muestra por turns (usuario + bot). A la derecha están todas las evals de prod — passed y failed.',
    bullets: [
      'Cada turn agrupa un mensaje del usuario y la respuesta del bot.',
      'El turn del fallo se marca en rojo cuando eliges una eval.',
      'Lo posterior al fallo no entra en el input N.',
    ],
  },
  {
    id: 'pick-eval',
    surface: 'admin',
    title: 'Paso 3 · Elegir qué test crear',
    summary:
      'Una misma sesión puede tener varias evals fallidas en turns distintos. Eliges cuál convertir en offline test — el slice de input N y la eval heredada siguen esa selección.',
    bullets: [
      'Cada eval muestra en qué turn falló (ej. turn 2 vs turn 3).',
      'Al cambiar de eval, el highlight en la conversación se mueve.',
      'Solo evals failed con turn-level granularity habilitan N+1.',
    ],
    actionHint: 'Prueba cambiar entre adhoc.formatting_errors (turn 2) y reliability.fallback (turn 3).',
  },
  {
    id: 'preview-input-n',
    surface: 'admin',
    title: 'Paso 4 · Preview del input N',
    summary:
      'Antes de guardar, ves exactamente qué contexto se usará: turns completos hasta el fallo, más solo el mensaje del usuario en el turn del fallo. Los datos sensibles se redactan.',
    bullets: [
      'El último mensaje del slice debe ser del usuario.',
      'La eval heredada es la misma de prod — sin recalibrar.',
      'Confirmas y el test queda como draft en el test framework.',
    ],
    actionHint: 'Revisa el slice y la eval heredada antes de confirmar.',
  },
  {
    id: 'created',
    surface: 'admin',
    title: 'Paso 5 · Test creado',
    summary:
      'El offline test N+1 aparece en el agente correspondiente como draft. Tiene trazabilidad a la sesión de prod y hereda el criterio que falló.',
    bullets: [
      'No tiene profile, goal ni user instructions simuladas.',
      'Input N = contexto directo al LLM.',
      'Listo para correr en el siguiente ciclo o manualmente.',
    ],
    actionHint: 'Siguiente: abrimos el test framework con este persona seleccionado.',
  },
  {
    id: 'framework-input',
    surface: 'framework',
    title: 'Paso 6 · Input N vs respuesta del LLM',
    summary:
      'En el test framework el input N de producción queda fijo (read-only). Al dar Test solo se genera y evalúa la siguiente respuesta del bot — no se re-simula la conversación.',
    bullets: [
      'Zona gris = input N congelado de prod.',
      'Zona morada = respuesta nueva de este test run.',
      'La eval compara solo esa respuesta contra el criterio heredado.',
    ],
    actionHint: 'Pulsa Test y revisa que la respuesta quede visible después del run.',
  },
  {
    id: 'done',
    surface: 'framework',
    title: 'Paso 7 · Regresión lista',
    summary:
      'Si el test pasa, el fix probablemente resolvió el fallo original. Si falla, el bug sigue. El test queda en el suite para detectar regresiones antes de prod.',
    bullets: [
      'Draft: valida 3× y promueve a Active.',
      'Trazabilidad completa: prod session → N+1 test → resultado.',
      'Puedes reabrir esta guía desde Admin Panel cuando quieras.',
    ],
  },
]

export const ADMIN_JOURNEY_LAST_STEP = N_PLUS_ONE_JOURNEY_STEPS.reduce(
  (last, step, index) => (step.surface === 'admin' ? index : last),
  0
)

export function getJourneyStep(index: number): NPlusOneJourneyStep | undefined {
  return N_PLUS_ONE_JOURNEY_STEPS[index]
}
