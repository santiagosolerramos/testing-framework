import { useCallback, useEffect, useRef, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { CopyIcon, SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { personasAtom, selectedPersonaIdAtom, testRunsAtom, personaFormModeAtom } from '@/atoms'
import { mockInvokeAgent } from '@/services/mockAI'
import type { Message } from '@/types'

interface RunEntry {
  type: 'user' | 'assistant' | 'callback'
  text?: string
  label?: string
}

export function PersonaRunView() {
  const personas = useAtomValue(personasAtom)
  const selectedId = useAtomValue(selectedPersonaIdAtom)
  const setTestRuns = useSetAtom(testRunsAtom)
  const setFormMode = useSetAtom(personaFormModeAtom)
  const [sessionId] = useState(() => `session-${Math.random().toString(36).slice(2, 9)}`)
  const [entries, setEntries] = useState<RunEntry[]>([])
  const [running, setRunning] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const persona = personas.find((p) => p.id === selectedId)

  // Reset conversation when persona changes
  useEffect(() => {
    setEntries([])
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  const runPersona = useCallback(async () => {
    if (!persona || running) return
    setRunning(true)
    setEntries([])
    setTestRuns((prev) => ({ ...prev, [persona.id]: { status: 'TEST_RUN_STATUS_RUNNING' } }))

    const instructions = persona.objectives[0]?.instructions || ''
    // Simulate a multi-turn conversation
    const turns = [
      instructions.slice(0, 80) + (instructions.length > 80 ? '...' : ''),
    ]

    try {
      for (const turn of turns) {
        setEntries((prev) => [...prev, { type: 'user', text: turn }])
        // Simulate callback event
        if (Math.random() > 0.5) {
          await new Promise((r) => setTimeout(r, 400))
          setEntries((prev) => [...prev, { type: 'callback', label: 'activity_check' }])
        }
        const reply = await mockInvokeAgent(turn)
        // Agent replies as multiple short bubbles
        const sentences = reply.match(/[^.!?]+[.!?]+/g) || [reply]
        for (const sentence of sentences.slice(0, 3)) {
          await new Promise((r) => setTimeout(r, 200))
          setEntries((prev) => [...prev, { type: 'assistant', text: sentence.trim() }])
        }
      }

      const passed = Math.random() > 0.2
      const evalResults = persona.evaluation.criteria.map((c, i) => ({
        name: `Evaluation ${i + 1}`,
        passed,
        score: passed ? 1 : 0,
        prompt: c.prompt,
      }))
      setTestRuns((prev) => ({
        ...prev,
        [persona.id]: {
          status: passed ? 'TEST_RUN_STATUS_PASSED' : 'TEST_RUN_STATUS_FAILED',
          evaluationResults: evalResults,
        },
      }))
    } catch {
      setTestRuns((prev) => ({ ...prev, [persona.id]: { status: 'TEST_RUN_STATUS_FAILED' } }))
    } finally {
      setRunning(false)
    }
  }, [persona, running, setTestRuns])

  const copySession = useCallback(() => {
    navigator.clipboard.writeText(sessionId).catch(() => {})
  }, [sessionId])

  if (!persona) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
        Select a persona from the sidebar
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0">
        <h2 className="font-semibold text-gray-900 text-sm">{persona.personaKey}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-gray-500" onClick={copySession}>
            <CopyIcon className="w-3.5 h-3.5" />
            Session ID
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFormMode(persona.id)}>
            <SettingsIcon className="w-4 h-4 text-gray-500" />
          </Button>
          <Button
            size="sm"
            className="bg-purple-700 hover:bg-purple-800 h-7 text-xs"
            onClick={runPersona}
            disabled={running}
          >
            {running ? 'Running…' : 'Test'}
          </Button>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-auto px-16 py-8">
        {entries.length === 0 && !running && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <path d="M12 11V7"/>
                <path d="M8 7h8"/>
                <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none"/>
                <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">No test results yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">test your persona to see a simulated conversation and get performance feedback.</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          {entries.map((entry, i) => {
            if (entry.type === 'callback') {
              return (
                <div key={i} className="flex justify-center">
                  <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                    Callback Timeout · 900s · {entry.label}
                  </span>
                </div>
              )
            }
            if (entry.type === 'user') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[65%] bg-green-100 text-gray-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
                    {entry.text}
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className="flex justify-start">
                <div className="max-w-[65%] bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm">
                  {entry.text}
                </div>
              </div>
            )
          })}
          {running && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

// Suppress unused import warning
void (null as unknown as Message)
