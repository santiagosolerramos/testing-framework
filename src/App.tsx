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

const queryClient = new QueryClient()

// ─── Left icon nav ────────────────────────────────────────────────────────────
function LeftNav() {
  return (
    <div className="w-12 flex-shrink-0 border-r border-gray-200 flex flex-col items-center py-3 gap-4 bg-white">
      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
        <FlaskConicalIcon className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col items-center gap-3 mt-2">
        {[
          { icon: ListIcon, label: 'Executions' },
          { icon: BookOpenIcon, label: 'Knowledge' },
          { icon: HammerIcon, label: 'Builder' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            title={label}
            className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Sidebar panel ────────────────────────────────────────────────────────────
function SidebarPanel() {
  const [tab, setTab] = useAtom(sidebarTabAtom)
  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden bg-white">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">Agents</p>
      </div>
      {/* Tabs — pill style */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-200 flex-shrink-0">
        {(['personas', 'chat'] as SidebarTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors duration-500',
              tab === t
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
          >
            {t === 'personas' ? 'Personas' : 'Chat'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 pt-1">
        {tab === 'personas' ? <PersonasSidebar /> : <SandboxSidebar />}
      </div>
    </div>
  )
}

// ─── Main area ────────────────────────────────────────────────────────────────
function MainArea() {
  const tab = useAtomValue(sidebarTabAtom)
  const [formMode, setFormMode] = useAtom(personaFormModeAtom)
  const [personas, setPersonas] = useAtom(personasAtom)
  const setSelectedId = useSetAtom(selectedPersonaIdAtom)

  const handleFormSubmit = useCallback(
    async (data: PersonaFormData) => {
      if (formMode === 'create') {
        const newPersona = { id: ulid(), ...data, createdAt: Date.now() }
        setPersonas((prev) => [...prev, newPersona])
        setSelectedId(newPersona.id)
      } else if (formMode && formMode !== 'create') {
        setPersonas((prev) => prev.map((p) => (p.id === formMode ? { ...p, ...data } : p)))
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

  // Form overlay (full width, no panels)
  if (formMode !== null) {
    const existing = personas.find((p) => p.id === formMode)
    const initialData: PersonaFormData | undefined = existing
      ? {
          personaKey: existing.personaKey,
          objectives: existing.objectives,
          evaluation: existing.evaluation,
          mockData: existing.mockData,
        }
      : undefined

    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <PersonaForm
          mode={formMode === 'create' ? 'create' : 'update'}
          initialData={initialData}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormMode(null)}
          onDelete={formMode !== 'create' ? handleDelete : undefined}
        />
      </div>
    )
  }

  if (tab === 'chat') {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
        <SandboxContent />
      </div>
    )
  }

  // Personas: fixed results panel on the right
  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 overflow-hidden">
        <PersonaRunView />
      </div>
      <div className="w-[30%] min-w-[280px] max-w-[420px] flex-shrink-0 border-l border-gray-200 overflow-hidden">
        <ResultsPanel />
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function AppShell() {
  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <LeftNav />
      <SidebarPanel />
      <main className="flex flex-1 min-h-0 overflow-hidden">
        <MainArea />
      </main>
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
