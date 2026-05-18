import React from 'react'
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import { MessageSquareIcon, FlaskConicalIcon } from 'lucide-react'
import { SandboxSidebar, SandboxContent } from '@/scenes/Sandbox'
import { TestSuitesSidebar, TestSuitesContent, EvaluationPanel } from '@/scenes/TestSuites'
import { cn } from '@/lib/utils'

const queryClient = new QueryClient()

function AppLayout({
  sidebar,
  content,
  rightPanel,
}: {
  sidebar: React.ReactNode
  content: React.ReactNode
  rightPanel?: React.ReactNode
}) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden">
        <nav className="flex border-b border-gray-200">
          <NavLink
            to="/sandbox"
            className={({ isActive }) =>
              cn(
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2',
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )
            }
          >
            <MessageSquareIcon className="w-3.5 h-3.5" />
            Sandbox
          </NavLink>
          <NavLink
            to="/test-suites"
            className={({ isActive }) =>
              cn(
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2',
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )
            }
          >
            <FlaskConicalIcon className="w-3.5 h-3.5" />
            Test Suites
          </NavLink>
        </nav>
        <div className="flex-1 overflow-hidden pt-2">{sidebar}</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">{content}</main>

      {/* Right panel */}
      {rightPanel && (
        <aside className="w-72 flex-shrink-0 border-l border-gray-200 overflow-hidden">
          {rightPanel}
        </aside>
      )}
    </div>
  )
}

function App() {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <div className="h-screen flex flex-col overflow-hidden">
            {/* Top bar */}
            <header className="flex-shrink-0 h-12 border-b border-gray-200 flex items-center px-4 gap-3">
              <div className="flex items-center gap-2">
                <FlaskConicalIcon className="w-5 h-5 text-gray-700" />
                <span className="font-semibold text-sm text-gray-900">Agent Test Framework</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                mock mode
              </span>
            </header>

            <div className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<Navigate to="/sandbox" replace />} />
                <Route
                  path="/sandbox"
                  element={
                    <AppLayout
                      sidebar={<SandboxSidebar />}
                      content={<SandboxContent />}
                    />
                  }
                />
                <Route
                  path="/test-suites"
                  element={
                    <AppLayout
                      sidebar={<TestSuitesSidebar />}
                      content={<TestSuitesContent />}
                      rightPanel={<EvaluationPanel />}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/sandbox" replace />} />
              </Routes>
            </div>
          </div>
        </HashRouter>
      </QueryClientProvider>
    </JotaiProvider>
  )
}

export default App
