import type { RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RunEntry } from './runTypes'

const BUBBLE_CLASS =
  'max-w-[min(85%,36rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-gray-800'

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className={cn(BUBBLE_CLASS, 'relative rounded-tr-md bg-green-100')}>
        {text}
        <span className="absolute bottom-1.5 right-3 text-[10px] text-gray-400">✓✓</span>
      </div>
    </div>
  )
}

function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className={cn(BUBBLE_CLASS, 'rounded-tl-md border border-gray-200 bg-white shadow-sm')}>
        {text}
      </div>
    </div>
  )
}

function ProductCard({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[min(85%,36rem)] rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-medium text-gray-400">
            IMG
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{price}</p>
          </div>
          <Button size="sm" variant="outline" className="h-8 shrink-0 px-4 text-xs">
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

function CallbackMarker({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="text-[11px] text-gray-400">Callback Timeout · 900s · {label}</span>
    </div>
  )
}

type Props = {
  entries: RunEntry[]
  running?: boolean
  messagesEndRef?: RefObject<HTMLDivElement | null>
}

export function RunMessageList({ entries, running, messagesEndRef }: Props) {
  return (
    <div className="flex w-full flex-col gap-5">
      {entries.map((entry, i) => {
        if (entry.type === 'callback') {
          return <CallbackMarker key={i} label={entry.label} />
        }
        if (entry.type === 'user') {
          return <UserBubble key={i} text={entry.text} />
        }
        if (entry.type === 'product') {
          return <ProductCard key={i} name={entry.name} price={entry.price} />
        }
        return <AssistantBubble key={i} text={entry.text} />
      })}
      {running && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <span className="inline-flex gap-1">
              {[0, 1, 2].map((n) => (
                <span
                  key={n}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: `${n * 150}ms` }}
                />
              ))}
            </span>
          </div>
        </div>
      )}
      {messagesEndRef && <div ref={messagesEndRef} />}
    </div>
  )
}
