import { ulid } from 'ulid'
import type { ParsedConversationTurn } from '@/types/personaCreation'

export type TranscriptParseResult = {
  turns: ParsedConversationTurn[]
  valid: boolean
  warning?: string
}

const LINE_RE =
  /^(user|usuario|usuário|assistant|bot|assistente)\s*:\s*(.+)$/i

export function parseTranscript(text: string): TranscriptParseResult {
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return { turns: [], valid: false, warning: 'Transcript is empty.' }
  }

  const turns: ParsedConversationTurn[] = []

  for (const line of lines) {
    const m = line.match(LINE_RE)
    if (m) {
      const role = /user|usuario|usuário/i.test(m[1]) ? 'user' : 'bot'
      turns.push({ id: ulid(), role, text: m[2].trim(), thumb: 'up' })
    } else if (turns.length > 0) {
      turns[turns.length - 1].text += ` ${line}`
    }
  }

  if (turns.length < 2) {
    return {
      turns,
      valid: false,
      warning: 'Could not detect at least two turns. Use User: / Assistant: format.',
    }
  }

  let alternationBreaks = 0
  for (let i = 1; i < turns.length; i++) {
    if (turns[i].role === turns[i - 1].role) alternationBreaks++
  }

  const valid = alternationBreaks <= Math.floor(turns.length / 3)

  return {
    turns,
    valid,
    warning: valid
      ? undefined
      : 'Turns may not alternate correctly. Review before continuing.',
  }
}

export function turnsToTranscript(turns: ParsedConversationTurn[]): string {
  return turns
    .map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.text}`)
    .join('\n')
}
