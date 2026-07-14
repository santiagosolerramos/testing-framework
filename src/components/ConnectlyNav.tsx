import { useState, useRef, useEffect } from 'react'
import {
  Home, Inbox, Send, BarChart2, RefreshCw, Users, Tag, UserPlus, Users2, Bot,
  Plus, ChevronDown, ClipboardList, Flag, ArrowLeftRight, Settings, LogOut,
  X, Check, Copy, Clock, Trash2, Sparkles,
} from 'lucide-react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { appSectionAtom, currentBusinessAtom, loadingBusinessAtom } from '@/atoms/admin'
import type { AppSection, BusinessId } from '@/atoms/admin'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  section?: AppSection
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS: Record<BusinessId, NavItem[]> = {
  visible1: [
    { id: 'home',         label: 'Home',          icon: Home },
    { id: 'inbox',        label: 'Inbox',         icon: Inbox },
    { id: 'campaigns',    label: 'Campaigns',     icon: Send },
    { id: 'analytics',   label: 'Analytics',     icon: BarChart2, section: 'analytics' },
    { id: 'automations', label: 'Automations',   icon: RefreshCw },
    { id: 'audiences',   label: 'Audiences',     icon: Users },
    { id: 'tools',       label: 'Tools',         icon: Tag },
    { id: 'signup',      label: 'Sign up units', icon: UserPlus },
    { id: 'teams',       label: 'Teams',         icon: Users2 },
    { id: 'agents',      label: 'Agents',        icon: Bot, section: 'agents' },
  ],
  ikea: [
    { id: 'home',        label: 'Home',          icon: Home },
    { id: 'inbox',       label: 'Inbox',         icon: Inbox },
    { id: 'campaigns',   label: 'Campaigns',     icon: Send },
    { id: 'analytics',   label: 'Analytics',     icon: BarChart2, section: 'analytics' },
    { id: 'automations', label: 'Automations',   icon: RefreshCw },
    { id: 'audiences',   label: 'Audiences',     icon: Users },
    { id: 'tools',       label: 'Tools',         icon: Tag },
    { id: 'sofia-ai',    label: 'Sofia AI',      icon: Sparkles },
    { id: 'signup',      label: 'Sign up units', icon: UserPlus },
    { id: 'teams',       label: 'Teams',         icon: Users2 },
  ],
}

const BUSINESS_NAMES: Record<BusinessId, string> = {
  visible1: 'Visible_1',
  ikea: 'IKEA_Chile_PRINCIPAL',
}

const ADMIN_BUSINESSES = [
  { id: 'hush',    name: 'Hush Puppies Perú',        avatar: 'H', bg: 'bg-gray-100 text-gray-600' },
  { id: 'juan',    name: 'JUAN LUIS from Connectly', avatar: 'J', bg: 'bg-green-500 text-white' },
  { id: 'latam',   name: 'Latam Fintech Hub',         avatar: 'L', bg: 'bg-blue-400 text-white' },
  { id: 'jumia',   name: 'Jumia_Egypt',               avatar: 'J', bg: 'bg-pink-400 text-white' },
  { id: 'gourmet', name: 'Gourmetchile',               avatar: 'G', bg: 'bg-teal-500 text-white' },
  { id: 'taager',  name: 'taager',                     avatar: 'T', bg: 'bg-rose-400 text-white' },
]

const MAIN_BUSINESSES = [
  { id: 'visible1', name: 'Visible_1',  avatar: 'V', bg: 'bg-blue-600 text-white' },
  { id: 'connectly', name: 'Connectly', avatar: 'C', bg: 'bg-purple-600 text-white' },
]

const RECENT_BUSINESSES = [
  { id: 'canonical', name: 'Connectly AI Canonical', avatar: 'A', bg: 'bg-teal-500 text-white' },
  { id: 'aibot',     name: 'Canonical AI Bot',        avatar: 'B', bg: 'bg-green-500 text-white' },
  { id: 'row',       name: 'Connectly ROW',            avatar: 'R', bg: 'bg-gray-900 text-white' },
]

const TARGET_UUID = '0cccd497-6399-476d-91f6-bdb715ff7a83'

// ─── Logo ─────────────────────────────────────────────────────────────────────
export function ConnectlyLogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/testing-framework/logo.png"
      alt="Connectly"
      className={className ?? 'h-full w-full object-contain'}
    />
  )
}

// ─── Switch Business Modal ────────────────────────────────────────────────────
const IKEA_BIZ = { id: 'ikea', name: 'IKEA_Chile_PRINCIPAL', avatar: 'I', bg: 'bg-gray-100 text-gray-700' }

function BizRow({
  name, avatar, bg, active, showCheck, onSelect, onCopy, onDelete,
}: {
  name: string; avatar: string; bg: string; active?: boolean; showCheck?: boolean
  onSelect: () => void; onCopy?: () => void; onDelete?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors mb-1',
        active ? 'border-l-4 border-amber-400 bg-amber-50' : 'border-l-4 border-transparent hover:bg-gray-50'
      )}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold', bg)}>
        {avatar}
      </div>
      <span className={cn('flex-1 text-left', active ? 'text-gray-900' : 'text-gray-500')}>{name}</span>
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {showCheck !== undefined && (
          active
            ? <Check className="h-3.5 w-3.5 text-gray-400" />
            : <span className="inline-block h-3.5 w-3.5 rounded-full border border-gray-300" />
        )}
        {onCopy   && <Copy   className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500" onClick={onCopy} />}
        {onDelete && <Trash2 className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500" onClick={onDelete} />}
      </div>
    </button>
  )
}

function SwitchBusinessModal({
  onClose,
  onSwitch,
}: {
  onClose: () => void
  onSwitch: (biz: BusinessId) => void
}) {
  // ikeaSelected: once IKEA is selected from search it becomes the active top row
  const [ikeaSelected, setIkeaSelected] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const showIkeaResult = search.trim() === TARGET_UUID
  const selected = ikeaSelected ? 'ikea' : 'visible1'

  // Top row: IKEA replaces Visible_1 when selected
  const topBiz = ikeaSelected ? IKEA_BIZ : MAIN_BUSINESSES[0]
  // Recent: when IKEA selected, Visible_1 appears first in recent
  const recentList = ikeaSelected
    ? [MAIN_BUSINESSES[0], ...RECENT_BUSINESSES.slice(0, 2)]
    : RECENT_BUSINESSES

  function handleSelectIkea() {
    setIkeaSelected(true)
    setSearch('')
  }

  function handleSwitch() {
    if (selected === 'ikea') onSwitch('ikea')
    else onClose()
  }

  useEffect(() => {
    if (adminOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [adminOpen])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 flex w-[460px] max-h-[88vh] flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-base font-semibold text-gray-900">Switch Business</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">

          {/* Active / top business */}
          <BizRow
            name={topBiz.name} avatar={topBiz.avatar} bg={topBiz.bg}
            active showCheck
            onSelect={() => {}}
            onCopy={() => {}}
          />

          {/* Connectly (always second) */}
          <BizRow
            name="Connectly" avatar="C" bg="bg-purple-600 text-white"
            active={false} showCheck
            onSelect={() => {}}
            onCopy={() => {}}
          />

          {/* RECENT */}
          <div className="mt-2 mb-1 flex items-center gap-1.5 px-2">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Recent</span>
          </div>
          {recentList.map((biz) => (
            <BizRow
              key={biz.id} name={biz.name} avatar={biz.avatar} bg={biz.bg}
              active={false}
              onSelect={() => {}}
              onCopy={() => {}}
            />
          ))}

          {/* Admin Businesses */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setAdminOpen((v) => !v)}
              className="flex w-full items-center gap-1.5 px-2 py-2 text-sm font-semibold text-gray-900 hover:text-gray-600"
            >
              Admin Businesses
              <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', adminOpen && 'rotate-180')} />
            </button>

            {adminOpen && (
              <div>
                <div className="max-h-52 overflow-y-auto pr-1">
                  {ADMIN_BUSINESSES.map((biz) => (
                    <BizRow
                      key={biz.id} name={biz.name} avatar={biz.avatar} bg={biz.bg}
                      active={false}
                      onSelect={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>

                {/* Search */}
                <div className="relative mt-2 mb-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or business' Id"
                    className="w-full rounded-xl border border-purple-400 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-300"
                  />
                  {showIkeaResult && !ikeaSelected && (
                    <div className="absolute left-0 right-0 bottom-full z-50 mb-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                      <button
                        type="button"
                        onClick={handleSelectIkea}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                      >
                        IKEA_Chile_PRINCIPAL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSwitch}
            className={cn(
              'rounded-xl px-5 py-2 text-sm font-medium text-white transition-colors',
              selected === 'ikea' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-300 cursor-default'
            )}
          >
            Switch business
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ConnectlyNav ─────────────────────────────────────────────────────────────
export function ConnectlyNav() {
  const [section, setSection] = useAtom(appSectionAtom)
  const currentBusiness = useAtomValue(currentBusinessAtom)
  const setCurrentBusiness = useSetAtom(currentBusinessAtom)
  const setLoadingBusiness = useSetAtom(loadingBusinessAtom)

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [switchBusinessOpen, setSwitchBusinessOpen] = useState(false)

  const navItems = NAV_ITEMS[currentBusiness]
  const businessName = BUSINESS_NAMES[currentBusiness]

  const activeNavId =
    section === 'analytics' ? 'analytics'
    : section === 'agents'  ? 'agents'
    : undefined

  function handleSwitch(biz: BusinessId) {
    setSwitchBusinessOpen(false)
    setUserMenuOpen(false)
    setLoadingBusiness(true)
    setTimeout(() => {
      setCurrentBusiness(biz)
      setLoadingBusiness(false)
    }, 1800)
  }

  return (
    <>
      <div className="flex w-56 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex items-center px-4 pt-4 pb-3">
          <ConnectlyLogoIcon className="h-8 w-8 object-contain" />
        </div>

        {/* Create new campaign */}
        <div className="px-3 pb-3">
          <button
            type="button"
            className="flex w-full items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            Create new campaign
          </button>
        </div>

        {/* Let's get started */}
        <div className="mx-2 mb-3 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2 hover:bg-gray-100">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Flag className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium leading-tight text-gray-800">Let's get started</p>
            <p className="text-xs text-gray-400">0% done</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
          {navItems.map(({ id, label, icon: Icon, section: itemSection }) => {
            const active = id === activeNavId
            return (
              <button
                key={id}
                type="button"
                onClick={() => { if (itemSection) setSection(itemSection) }}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors',
                  active ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-purple-600" />}
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-purple-600' : 'text-gray-400')} />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="relative shrink-0 border-t border-gray-100 px-3 py-3">
          <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-400">
            <ClipboardList className="h-3.5 w-3.5 shrink-0" />
            <span>0.713.0</span>
          </div>

          {/* User popup */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">V</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{businessName}</p>
                  <p className="truncate text-xs text-gray-500">Santiago Soler</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setUserMenuOpen(false); setSwitchBusinessOpen(true) }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0 text-gray-400" />
                Switch Business
              </button>
              {([{ icon: Settings, label: 'Settings' }, { icon: LogOut, label: 'Logout' }] as const).map(({ icon: Icon, label }) => (
                <button key={label} type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                  <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* User trigger */}
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-md p-1 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">V</div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold leading-tight text-gray-900">{businessName}</p>
              <p className="truncate text-xs leading-tight text-gray-500">Santiago Soler</p>
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform', userMenuOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {switchBusinessOpen && (
        <SwitchBusinessModal onClose={() => setSwitchBusinessOpen(false)} onSwitch={handleSwitch} />
      )}
    </>
  )
}
