import { useCallback } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FlaskConicalIcon, BookOpenIcon, HammerIcon, ListIcon } from 'lucide-react'
import { SandboxSidebar, SandboxContent } from '@/scenes/Sandbox'
import { PersonasSidebar } from '@/scenes/Personas/PersonasSidebar'
import { PersonaRunView } from '@/scenes/Personas/PersonaRunView'
import { ResultsPanel } from '@/scenes/Personas/ResultsPanel'
import { PersonaForm } from '@/scenes/Personas/PersonaForm'
import {
  sidebarTabAtom,
  personaFormModeAtom,
  personasAtom,
  selectedPersonaIdAtom,
} from '@/atoms'
import type { PersonaFormData, SidebarTab } from '@/atoms'
import { cn } from '@/lib/utils'
import { ulid } from 'ulid'
import { personaCreationAtom } from '@/atoms/personaCreation'
import { PersonaCreationFlow } from '@/scenes/Personas/creation/PersonaCreationFlow'

const queryClient = new QueryClient()

/** Tres columnas ~iguales; chat solo un poco más ancho. */
const PERSONAS_GRID =
  'grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)_minmax(0,1fr)]'

function LeftNav() {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center gap-4 border-r border-gray-200 bg-white py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
        <FlaskConicalIcon className="h-4 w-4 text-white" />
      </div>
      <div className="mt-2 flex flex-col items-center gap-3">
        {[
          { icon: ListIcon, label: 'Executions' },
          { icon: BookOpenIcon, label: 'Knowledge' },
          { icon: HammerIcon, label: 'Builder' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            title={label}
            className="flex h-8 w-8 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  )
}

type SidebarPanelProps = { className?: string }

function SidebarPanel({ className }: SidebarPanelProps) {
  const [tab, setTab] = useAtom(sidebarTabAtom)
  return (
    <aside
      className={cn(
        'flex min-w-0 flex-col overflow-hidden border-r border-gray-200 bg-white',
        className
      )}
    >
      <div className="shrink-0 border-b border-gray-200 px-3 py-3">
        <p className="text-sm font-semibold text-gray-900">Agents</p>
      </div>
      <div className="flex shrink-0 gap-1 border-b border-gray-200 px-3 py-2">
        {(['personas', 'chat'] as SidebarTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-500',
              tab === t
                ? 'border border-gray-200 bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            )}
          >
            {t === 'personas' ? 'Personas' : 'Chat'}
          </button>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === 'personas' ? <PersonasSidebar /> : <SandboxSidebar />}
      </div>
    </aside>
  )
}

function PersonaFormOverlay() {
  const [formMode, setFormMode] = useAtom(personaFormModeAtom)
  const [personas, setPersonas] = useAtom(personasAtom)
  const setSelectedId = useSetAtom(selectedPersonaIdAtom)

  const handleFormSubmit = useCallback(
    async (data: PersonaFormData) => {
      if (formMode === 'create') {
        const newPersona = {
          id: ulid(),
          ...data,
          status: 'draft' as const,
          sectionId: data.sectionId ?? 'section-1',
          validationPasses: 0,
          createdAt: Date.now(),
        }
        setPersonas((prev) => [...prev, newPersona])
        setSelectedId(newPersona.id)
      } else if (formMode && formMode !== 'create') {
        setPersonas((prev) =>
          prev.map((p) =>
            p.id === formMode
              ? { ...p, ...data, sectionId: data.sectionId ?? undefined }
              : p
          )
        )
      }
      setFormMode(null)
    },
    [formMode, setPersonas, setSelectedId, setFormMode]
  )

  const handleDelete = useCallback(() => {
    if (!formMode || formMode === 'create') return
    setPersonas((prev) => prev.filter((p) => p.id !== formMode))
    setFormMode(null)
    setSelectedId(null)
  }, [formMode, setPersonas, setFormMode, setSelectedId])

  const existing = personas.find((p) => p.id === formMode)
  const initialData: PersonaFormData | undefined = existing
    ? {
        personaKey: existing.personaKey,
        objectives: existing.objectives,
        evaluation: existing.evaluation,
        fixtureId: existing.fixtureId ?? null,
        sectionId: existing.sectionId ?? 'section-1',
      }
    : undefined

  return (
    <PersonaForm
      mode={formMode === 'create' ? 'create' : 'update'}
      initialData={initialData}
      onSubmit={handleFormSubmit}
      onCancel={() => setFormMode(null)}
      onDelete={formMode !== 'create' ? handleDelete : undefined}
    />
  )
}

function AppShell() {
  const tab = useAtomValue(sidebarTabAtom)
  const formMode = useAtomValue(personaFormModeAtom)
  const creation = useAtomValue(personaCreationAtom)

  const isWizardFullscreen =
    creation?.kind === 'description' || creation?.kind === 'conversation'

  if (isWizardFullscreen) {
    return (
      <div className="flex h-screen overflow-hidden bg-white">
        <LeftNav />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <PersonaCreationFlow />
        </main>
      </div>
    )
  }

  if (formMode !== null) {
    return (
      <div className="flex h-screen overflow-hidden bg-white">
        <LeftNav />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <PersonaFormOverlay />
        </main>
      </div>
    )
  }

  if (tab === 'chat') {
    return (
      <div className="flex h-screen overflow-hidden bg-white">
        <LeftNav />
        <SidebarPanel className="w-64 shrink-0" />
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <SandboxContent />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <LeftNav />
      <div className={cn(PERSONAS_GRID, 'min-w-0')}>
        <SidebarPanel />
        <section className="min-w-0 overflow-hidden border-r border-gray-200">
          <PersonaRunView />
        </section>
        <aside className="min-w-0 overflow-hidden">
          <ResultsPanel />
        </aside>
      </div>
      <PersonaCreationFlow />
    </div>
  )
}

export default function App() {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </JotaiProvider>
  )
}
