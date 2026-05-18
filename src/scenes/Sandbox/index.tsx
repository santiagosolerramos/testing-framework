import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { ulid } from 'ulid'
import { v4 as uuidv4 } from 'uuid'
import {
  SendHorizonalIcon,
  MoreVerticalIcon,
  TrashIcon,
  CopyIcon,
  SquarePenIcon,
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
} from '@/atoms'
import { mockInvokeAgent } from '@/services/mockAI'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

// ─── Chat message bubble ──────────────────────────────────────────────────────
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'USER'
  return (
    <div className={cn('flex gap-3 items-start', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-gray-900 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-900 rounded-tl-sm'
        )}
      >
        {message.text}
      </div>
    </div>
  )
}

// ─── Conversation item in sidebar ────────────────────────────────────────────
type ConversationItemProps = {
  id: string
  label: string
  isActive: boolean
  onSelect: (id: string) => void
  onCopy: (id: string) => void
  onDelete: (id: string) => void
}

function ConversationItem({
  id,
  label,
  isActive,
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
        'w-full rounded-md transition-colors group hover:bg-gray-200',
        isActive && 'bg-gray-200 font-medium'
      )}
    >
      <div className="flex items-center gap-2 justify-between px-3 py-2">
        <button
          type="button"
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          onClick={handleSelect}
        >
          <div className="text-sm truncate text-gray-700">{label}</div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleStop}
            >
              <MoreVerticalIcon className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={handleStop}>
            <DropdownMenuItem onClick={handleCopy}>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy session ID
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleDelete}>
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
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

  const entries = useMemo(
    () => Object.entries(conversations).reverse(),
    [conversations]
  )

  const handleCopy = useCallback((id: string) => {
    navigator.clipboard.writeText(id).catch(() => {})
  }, [])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-2 pb-2">
        <Button
          className="w-full justify-start rounded-md px-3 py-2 text-gray-600 gap-2 h-auto"
          variant="ghost"
          onClick={handleNewSession}
        >
          <SquarePenIcon className="w-4 h-4 flex-shrink-0" />
          New Conversation
        </Button>
      </div>
      <div className="flex flex-col gap-1 overflow-auto p-2 pt-0 h-full">
        {entries.length === 0 && (
          <div className="text-sm text-gray-400 px-3 py-2 h-full flex items-center justify-center">
            No conversations yet
          </div>
        )}
        {entries.map(([id, conv]) => {
          const last = conv.messages.slice(-1)[0]
          const label = last?.text?.slice(0, 40) || 'Start chatting…'
          return (
            <ConversationItem
              key={id}
              id={id}
              label={label}
              isActive={id === selectedSessionId}
              onSelect={setSelectedSessionId}
              onCopy={handleCopy}
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

  const composerRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [composer, setComposer] = useState('')
  const [thinking, setThinking] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState(false)

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
          [sessionId]: {
            ...current,
            messages: [...(current?.messages || []), userMsg],
          },
        }
      })
      setComposer('')
      setThinking((prev) => ({ ...prev, [sessionId]: true }))

      try {
        const reply = await mockInvokeAgent(composer)
        const assistantMsg: Message = { role: 'ASSISTANT', text: reply, timestamp: Date.now() }
        setConversations((prev) => {
          const { [sessionId]: current, ...rest } = prev
          return {
            ...rest,
            [sessionId]: {
              ...current,
              messages: [...(current?.messages || []), assistantMsg],
            },
          }
        })
      } finally {
        setThinking((prev) => ({ ...prev, [sessionId]: false }))
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
    if (!deleteTarget) return
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
  }, [
    deleteTarget,
    conversations,
    selectedSessionId,
    setConversations,
    setSelectedSessionId,
    setDeleteTarget,
    handleNewSession,
  ])

  const handleCopySession = useCallback(() => {
    if (selectedSessionId) navigator.clipboard.writeText(selectedSessionId).catch(() => {})
  }, [selectedSessionId])

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <span className="font-semibold text-gray-900">Sandbox</span>
        {selectedSessionId && (
          <Button variant="outline" size="sm" onClick={handleCopySession}>
            <CopyIcon className="w-4 h-4 mr-2" />
            Copy Session ID
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        className={cn(
          'flex-1 overflow-auto px-6 pt-6 pb-4 transition-opacity duration-300',
          isEmpty ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {thinking[selectedSessionId || ''] && (
            <div className="flex gap-3 items-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                <span className="inline-block w-4 h-4 rounded-full bg-gray-400 animate-pulse" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div
        className={cn(
          'w-full bg-white/95 backdrop-blur transition-all duration-500 ease-out',
          isEmpty
            ? 'absolute inset-0 flex items-center justify-center'
            : 'sticky bottom-0 border-t border-gray-200'
        )}
      >
        <div className={cn('w-full px-6 py-4', isEmpty && 'max-w-2xl')}>
          {isEmpty && (
            <p className="text-3xl font-light text-gray-800 text-center mb-6">
              Ask me anything
            </p>
          )}
          <div className="relative">
            <textarea
              ref={composerRef}
              className="w-full border border-gray-200 rounded-xl p-4 pr-12 shadow-sm focus:shadow-md focus:outline-none focus:border-gray-300 transition-shadow text-sm"
              placeholder="Ask anything…"
              value={composer}
              onChange={handleComposerChange}
              onKeyDown={handleKeyDown}
              rows={2}
              style={{ resize: 'none', minHeight: '2.75rem', maxHeight: '18rem' }}
            />
            {composer.length > 0 && (
              <Button
                onClick={handleSend}
                className="absolute right-2 bottom-3 h-8 w-8 p-0"
              >
                <SendHorizonalIcon size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Delete dialog */}
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
