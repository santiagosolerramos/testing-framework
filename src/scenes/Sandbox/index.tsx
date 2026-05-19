import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ulid } from 'ulid'
import { v4 as uuidv4 } from 'uuid'
import {
  SendHorizonalIcon,
  MoreVerticalIcon,
  TrashIcon,
  CopyIcon,
  SquarePenIcon,
  UserPlusIcon,
  Loader2Icon,
  SparklesIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  sandboxConversationsAtom,
  selectedSandboxSessionIdAtom,
  sandboxDeleteTargetAtom,
  sandboxReviewPersonaIdAtom,
  personasAtom,
  deployedVersionAtom,
  runningVersionAtom,
} from '@/atoms'
import { mockInvokeAgent } from '@/services/mockAI'
import { createDraftFromSandboxSession } from '@/services/sandboxPersonaCreation'
import { wizardDraftToFormData } from '@/types/personaCreation'
import {
  isSandboxExampleSession,
  SANDBOX_EXAMPLE_LABEL,
  SANDBOX_EXAMPLE_SESSION_ID,
} from './sandboxExampleSession'
import { SandboxPersonaReviewOverlay } from './SandboxPersonaReviewOverlay'
import { inferSectionId } from '@/scenes/Personas/personaSections'
import { cn } from '@/lib/utils'
import type { Message, Persona } from '@/types'

// ─── Chat message bubble ──────────────────────────────────────────────────────
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'USER'
  return (
    <div className={cn('flex gap-4 items-start', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'text-xs rounded-lg p-2 relative max-w-[70%]',
          isUser
            ? 'bg-green-100 text-gray-800'
            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
        )}
      >
        {message.text}
        {isUser && (
          <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">✓✓</span>
        )}
      </div>
    </div>
  )
}

// ─── Conversation item in sidebar ────────────────────────────────────────────
type ConversationItemProps = {
  id: string
  label: string
  isActive: boolean
  allowDelete?: boolean
  isExample?: boolean
  onSelect: (id: string) => void
  onCopy: (id: string) => void
  onDelete: (id: string) => void
}

function ConversationItem({
  id,
  label,
  isActive,
  allowDelete = true,
  isExample = false,
  onSelect,
  onCopy,
  onDelete,
}: ConversationItemProps) {
  const handleSelect = useCallback(() => onSelect(id), [onSelect, id])
  const handleStop = useCallback((e: React.MouseEvent) => e.stopPropagation(), [])
  const handleCopy = useCallback(() => onCopy(id), [onCopy, id])
  const handleDelete = useCallback(() => onDelete(id), [onDelete, id])

  return (
    <div
      className={cn(
        'w-full rounded-md transition-colors duration-500 group hover:bg-gray-200 hover:text-gray-900',
        isActive && 'bg-gray-200 font-medium'
      )}
    >
      <div className="flex items-center gap-2 justify-between px-3 py-2">
        <button
          type="button"
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          onClick={handleSelect}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            {isExample && <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-purple-600" />}
            <span className="truncate text-sm text-gray-700">{label}</span>
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleStop}
            >
              <MoreVerticalIcon className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={handleStop}>
            <DropdownMenuItem className="cursor-pointer" onClick={handleCopy}>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy session ID
            </DropdownMenuItem>
            {allowDelete && (
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleDelete}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function SandboxSidebar() {
  const [conversations, setConversations] = useAtom(sandboxConversationsAtom)
  const [selectedSessionId, setSelectedSessionId] = useAtom(selectedSandboxSessionIdAtom)
  const setDeleteTarget = useSetAtom(sandboxDeleteTargetAtom)

  const handleNewSession = useCallback(() => {
    const newSessionId = ulid()
    const newCustomerId = uuidv4()
    setSelectedSessionId(newSessionId)
    setConversations((prev) => ({
      ...prev,
      [newSessionId]: { customerId: newCustomerId, messages: [] },
    }))
  }, [setSelectedSessionId, setConversations])

  useEffect(() => {
    if (selectedSessionId && !conversations[selectedSessionId]) {
      setSelectedSessionId(null)
    }
  }, [selectedSessionId, conversations, setSelectedSessionId])

  const entries = useMemo(() => {
    const all = Object.entries(conversations)
    const example = all.find(([id]) => isSandboxExampleSession(id))
    const rest = all.filter(([id]) => !isSandboxExampleSession(id)).reverse()
    return example ? [example, ...rest] : rest
  }, [conversations])

  const handleCopy = useCallback((id: string) => {
    navigator.clipboard.writeText(id).catch(() => {})
  }, [])

  return (
    <div className="pb-1 flex flex-1 min-h-0 flex-col overflow-hidden">
      <div className="px-2 pb-2 flex-shrink-0">
        <Button
          className="w-full justify-start rounded-md px-3 py-2 transition-colors duration-500 hover:bg-gray-100 hover:text-gray-900 text-gray-600 gap-2 h-auto"
          variant="ghost"
          onClick={handleNewSession}
        >
          <SquarePenIcon className="w-4 h-4 shrink-0" />
          <span className="text-sm">New Conversation</span>
        </Button>
      </div>
      <div className="flex flex-col gap-1 overflow-auto p-2 pt-0 flex-1 min-h-0">
        {entries.length === 0 && (
          <div className="text-sm text-muted-foreground px-3 py-2 h-full flex items-center justify-center">
            No conversations yet
          </div>
        )}
        {entries.map(([id, conv]) => {
          const last = conv.messages.slice(-1)[0]
          const label = isSandboxExampleSession(id)
            ? SANDBOX_EXAMPLE_LABEL
            : last?.text?.slice(0, 40) || 'Start chatting'
          return (
            <ConversationItem
              key={id}
              id={id}
              label={label}
              isActive={id === selectedSessionId}
              onSelect={setSelectedSessionId}
              onCopy={handleCopy}
              allowDelete={!isSandboxExampleSession(id)}
              isExample={isSandboxExampleSession(id)}
              onDelete={setDeleteTarget}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────
export function SandboxContent() {
  const [conversations, setConversations] = useAtom(sandboxConversationsAtom)
  const [selectedSessionId, setSelectedSessionId] = useAtom(selectedSandboxSessionIdAtom)
  const [deleteTarget, setDeleteTarget] = useAtom(sandboxDeleteTargetAtom)
  const setPersonas = useSetAtom(personasAtom)
  const setReviewPersonaId = useSetAtom(sandboxReviewPersonaIdAtom)
  const deployedVersion = useAtomValue(deployedVersionAtom)
  const runningVersion = useAtomValue(runningVersionAtom)

  const composerRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [composer, setComposer] = useState('')
  const [thinkingBySession, setThinkingBySession] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreatingPersona, setIsCreatingPersona] = useState(false)
  const [createPersonaError, setCreatePersonaError] = useState<string | null>(null)

  const messages = useMemo<Message[]>(() => {
    if (!selectedSessionId) return []
    return conversations[selectedSessionId]?.messages || []
  }, [conversations, selectedSessionId])

  const isEmpty = messages.length === 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, selectedSessionId])

  useEffect(() => {
    if (selectedSessionId) composerRef.current?.focus()
  }, [selectedSessionId])

  const handleNewSession = useCallback((): [string, string] => {
    const newSessionId = ulid()
    const newCustomerId = uuidv4()
    setSelectedSessionId(newSessionId)
    setConversations((prev) => ({
      ...prev,
      [newSessionId]: { customerId: newCustomerId, messages: [] },
    }))
    setComposer('')
    composerRef.current?.focus()
    return [newSessionId, newCustomerId]
  }, [setSelectedSessionId, setConversations])

  const sendMessage = useCallback(
    async (sessionId: string) => {
      if (!composer.trim()) return
      const userMsg: Message = { role: 'USER', text: composer, timestamp: Date.now() }
      setConversations((prev) => {
        const { [sessionId]: current, ...rest } = prev
        return {
          ...rest,
          [sessionId]: { ...current, messages: [...(current?.messages || []), userMsg] },
        }
      })
      setComposer('')
      setThinkingBySession((prev) => ({ ...prev, [sessionId]: true }))
      try {
        const reply = await mockInvokeAgent(composer)
        // Split into multiple short bubbles
        const sentences = reply.match(/[^.!?]+[.!?]+/g) || [reply]
        for (const sentence of sentences.slice(0, 3)) {
          await new Promise((r) => setTimeout(r, 180))
          const assistantMsg: Message = { role: 'ASSISTANT', text: sentence.trim(), timestamp: Date.now() }
          setConversations((prev) => {
            const { [sessionId]: current, ...rest } = prev
            return {
              ...rest,
              [sessionId]: { ...current, messages: [...(current?.messages || []), assistantMsg] },
            }
          })
        }
      } finally {
        setThinkingBySession((prev) => ({ ...prev, [sessionId]: false }))
        composerRef.current?.focus()
      }
    },
    [composer, setConversations]
  )

  const handleSend = useCallback(() => {
    if (selectedSessionId) {
      sendMessage(selectedSessionId)
    } else {
      const [newId] = handleNewSession()
      sendMessage(newId)
    }
  }, [selectedSessionId, sendMessage, handleNewSession])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleComposerChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComposer(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight + 2}px`
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || isSandboxExampleSession(deleteTarget)) return
    setIsDeleting(true)
    try {
      setConversations((prev) => {
        const { [deleteTarget]: _removed, ...rest } = prev
        return rest
      })
      if (selectedSessionId === deleteTarget) {
        const remaining = Object.keys(conversations).filter((k) => k !== deleteTarget)
        if (remaining.length > 0) {
          setSelectedSessionId(remaining[0])
        } else {
          handleNewSession()
        }
      }
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, conversations, selectedSessionId, setConversations, setSelectedSessionId, setDeleteTarget, handleNewSession])

  const handleCopySession = useCallback(() => {
    if (selectedSessionId) navigator.clipboard.writeText(selectedSessionId).catch(() => {})
  }, [selectedSessionId])

  const handleCreatePersonaFromSession = useCallback(async () => {
    if (!selectedSessionId || messages.length === 0 || isCreatingPersona) return
    setIsCreatingPersona(true)
    setCreatePersonaError(null)
    try {
      const { draft, error } = await createDraftFromSandboxSession(
        selectedSessionId,
        conversations
      )
      if (error || !draft) {
        setCreatePersonaError(error || 'Could not create persona from this session.')
        return
      }
      const id = ulid()
      const formData = wizardDraftToFormData(draft)
      const newPersona: Persona = {
        id,
        ...formData,
        status: 'draft',
        sectionId: inferSectionId(formData.fixtureId),
        validationPasses: 0,
        createdAt: Date.now(),
      }
      setPersonas((prev) => [...prev, newPersona])
      setReviewPersonaId(id)
    } finally {
      setIsCreatingPersona(false)
    }
  }, [selectedSessionId, messages.length, isCreatingPersona, conversations, setPersonas, setReviewPersonaId])

  const handleSelectExample = useCallback(() => {
    setSelectedSessionId(SANDBOX_EXAMPLE_SESSION_ID)
  }, [setSelectedSessionId])

  return (
    <div className="relative flex flex-col flex-1 min-h-0 w-full h-full overflow-x-clip bg-white">
      {/* ── Header ── */}
      <div className="flex items-center border-b border-gray-200 px-6 bg-white sticky top-0 z-[5] h-16 flex-shrink-0">
        <span className="font-semibold text-base text-foreground flex-1">Chat</span>
        <div className="flex items-center gap-2">
          {selectedSessionId && messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-purple-200 text-purple-700"
              disabled={isCreatingPersona}
              onClick={handleCreatePersonaFromSession}
            >
              {isCreatingPersona ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlusIcon className="h-4 w-4" />
              )}
              Create persona from session
            </Button>
          )}
          {selectedSessionId && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500" onClick={handleCopySession}>
              <CopyIcon className="w-4 h-4" />
              Copy Session ID
            </Button>
          )}
        </div>
      </div>

      {/* ── Version banner (green = deployed) ── */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-4 border-b border-green-200 bg-green-50 px-4 py-2">
        <span className="text-sm font-medium text-green-800">Running: {runningVersion}</span>
        <span className="text-sm text-green-600">Deployed: {deployedVersion}</span>
        <span className="text-xs text-green-700">
          Sandbox MVP: product recommendation only · fixture{' '}
          <code className="rounded bg-green-100 px-1">product_recommendation_default</code>
        </span>
        {!isSandboxExampleSession(selectedSessionId || '') && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="ml-auto h-auto gap-1 p-0 text-green-800"
            onClick={handleSelectExample}
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            Open example conversation
          </Button>
        )}
      </div>

      {createPersonaError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {createPersonaError}
        </div>
      )}

      {/* ── Messages — opacity-0 when empty ── */}
      <div
        className={cn(
          'flex-1 overflow-auto px-24 pt-16 pb-4 transition-opacity duration-500',
          isEmpty ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <div className="flex flex-col gap-4">
          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}
          {thinkingBySession[selectedSessionId || ''] && (
            <div className="flex gap-4 items-start">
              <div className="text-xs text-gray-900 rounded-lg p-2 relative">
                <span className="inline-flex items-center justify-center w-4 h-4">
                  <span className="inline-block w-4 h-4 rounded-full bg-gray-500 animate-pulse" />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input: absolute center when empty, sticky bottom when has messages ── */}
      <div
        className={cn(
          'w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-500 ease-out',
          isEmpty
            ? 'absolute inset-0 flex items-center justify-center border-t-0'
            : 'sticky bottom-0 border-t border-gray-200'
        )}
        style={{
          borderTopWidth: isEmpty ? '0px' : '1px',
          borderTopColor: isEmpty ? 'transparent' : undefined,
        }}
      >
        <div className={cn('w-full px-24 py-4 transition-all duration-500', isEmpty ? 'max-w-3xl' : '')}>
          {/* Title fades in when empty */}
          <div
            className={cn(
              'transition-all duration-500 overflow-hidden',
              isEmpty ? 'mb-6 max-h-20 opacity-100' : 'mb-0 max-h-0 opacity-0'
            )}
          >
            <p className="text-3xl font-normal text-foreground text-center">Ask me anything</p>
          </div>
          <div className="relative">
            <textarea
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              ref={composerRef}
              className="w-full border border-gray-200 rounded-xl p-4 pr-12 shadow-sm focus:shadow-md focus:outline-none transition-shadow text-sm"
              value={composer}
              onChange={handleComposerChange}
              rows={2}
              style={{ resize: 'none', minHeight: '2.75rem', maxHeight: '18rem' }}
            />
            {composer.length > 0 && (
              <Button
                disabled={composer.length === 0}
                onClick={handleSend}
                className="absolute right-2 bottom-3 h-8 w-8 p-0"
              >
                <SendHorizonalIcon size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {isCreatingPersona && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm">
          <Loader2Icon className="h-10 w-10 animate-spin text-purple-700" />
          <p className="text-sm font-medium text-gray-800">Creating persona from session…</p>
          <p className="text-xs text-gray-500">Extracting goal, evaluations, and product rec fixture</p>
        </div>
      )}

      <SandboxPersonaReviewOverlay />

      {/* ── Delete dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
