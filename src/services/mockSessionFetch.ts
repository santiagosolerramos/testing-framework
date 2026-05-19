import type { Conversation } from '@/types'
import type { ParsedConversationTurn } from '@/types/personaCreation'
import { parseTranscript } from './parseTranscript'
import { ulid } from 'ulid'

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Mock: resolve session from sandbox store or demo production IDs */
export async function fetchSessionTranscript(
  sessionId: string,
  sandboxSessions: Record<string, Conversation>
): Promise<{
  valid: boolean
  error?: string
  turns: ParsedConversationTurn[]
  transcript: string
}> {
  await delay(800 + Math.random() * 400)

  const trimmed = sessionId.trim()
  if (!trimmed) {
    return { valid: false, error: 'Session ID is required.', turns: [], transcript: '' }
  }

  const sandbox = sandboxSessions[trimmed]
  if (sandbox?.messages?.length) {
    const turns: ParsedConversationTurn[] = sandbox.messages.map((m) => ({
      id: ulid(),
      role: m.role === 'USER' ? 'user' : 'bot',
      text: m.text,
      thumb: 'up' as const,
    }))
    const transcript = turns
      .map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.text}`)
      .join('\n')
    return { valid: true, turns, transcript }
  }

  if (/^demo-|prod-/i.test(trimmed)) {
    const transcript = `User: Qual o status do meu pedido?\nAssistant: Claro! Pode informar o número do pedido?\nUser: 321654987321\nAssistant: Seu pedido foi enviado e está a caminho.`
    const parsed = parseTranscript(transcript)
    return { valid: true, turns: parsed.turns, transcript }
  }

  return {
    valid: false,
    error: 'Session not found or does not belong to this business.',
    turns: [],
    transcript: '',
  }
}
