import type { ReactNode } from 'react'

/** Full-width track inside the main column (persona test + results layout). */
export const CHAT_TRACK_CLASS = 'w-full px-6'

type Props = {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function ChatTestColumnLayout({ title, actions, children }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <header className="sticky top-0 z-10 shrink-0 border-b border-gray-200 bg-background">
        <div className={`${CHAT_TRACK_CLASS} flex h-16 items-center justify-between gap-4`}>
          <div className="min-w-0 flex-1 truncate">{title}</div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        <div className={`${CHAT_TRACK_CLASS} py-6`}>{children}</div>
      </div>
    </div>
  )
}
