import {
  DatabaseIcon,
  HomeIcon,
  LayersIcon,
  MessageSquareIcon,
  SendIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  id: string
  label: string
  icon: typeof HomeIcon
  active?: boolean
}

type Props = {
  activeNav?: string
  children: React.ReactNode
  onNavSessions?: () => void
}

export function AdminShell({ activeNav = 'sessions', children, onNavSessions }: Props) {
  const nav: NavItem[] = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'sessions', label: 'Sessions', icon: MessageSquareIcon, active: activeNav === 'sessions' },
    { id: 'suites', label: 'Suites', icon: LayersIcon },
    { id: 'sql', label: 'SQL Review', icon: DatabaseIcon },
    { id: 'campaign', label: 'Campaign Load', icon: SendIcon },
  ]

  return (
    <div className="flex h-full min-h-0 w-full bg-[#f4f5f7]">
      <aside className="flex w-[220px] shrink-0 flex-col bg-[#1a1d21] text-gray-300">
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-sm font-semibold tracking-tight text-white">Connectly Admin</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {nav.map(({ id, label, icon: Icon, active }) => (
            <button
              key={id}
              type="button"
              onClick={id === 'sessions' ? onNavSessions : undefined}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-white/10 font-medium text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-md px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
              SS
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">Santiago Soler Ramos</p>
              <p className="truncate text-[10px] text-gray-500">santiagosoler@connectly.ai</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
