import { useState } from 'react'
import { Info, Calendar, SlidersHorizontal, ChevronDown, ArrowUpRight, ArrowRight, ArrowDownRight, Filter, Download, RotateCcw, MoreHorizontal } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { currentBusinessAtom } from '@/atoms/admin'
import { cn } from '@/lib/utils'

type DeltaType = 'up-green' | 'flat-red' | 'down-green'
type TrendDir = 'up' | 'flat' | 'down'

type MetricCard = {
  label: string
  value: number
  pct?: string
  delta: number
  deltaType: DeltaType
  trendLabel: string
  trendDir: TrendDir
  note?: string
}

// ─── Visible_1 data ───────────────────────────────────────────────────────────
const VISIBLE1_TABS = ['Campaigns', 'Inbox', 'Account Overview', 'Agents', 'Enrichment', 'Message Overview', 'Automations', 'Reports', 'Time']

const VISIBLE1_CONVERSATIONS: MetricCard[] = [
  { label: 'Intended',          value: 24, delta: 200, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up' },
  { label: 'Submitted to Meta', value: 24, pct: '100%',   delta: 200, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up' },
  { label: 'Sent',              value: 24, pct: '100%',   delta: 300, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up' },
  { label: 'Delivered',         value: 24, pct: '100%',   delta: 300, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up' },
  { label: 'Read',              value: 21, pct: '87.5%',  delta: 320, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up' },
  { label: 'Engaged',           value: 6,  pct: '28.57%', delta: 0,   deltaType: 'flat-red', trendLabel: 'No change',   trendDir: 'flat' },
]

const VISIBLE1_DISPATCH: MetricCard[] = [
  { label: 'Templates Delivered',   value: 24, delta: 300,  deltaType: 'up-green',   trendLabel: 'Trending up',   trendDir: 'up' },
  { label: 'Audience Input Errors', value: 0,  delta: 0,    deltaType: 'flat-red',   trendLabel: 'No change',     trendDir: 'flat' },
  { label: 'Meta Errors',           value: 0,  delta: -100, deltaType: 'down-green', trendLabel: 'Trending down', trendDir: 'down' },
  { label: 'Marketing Delivered',   value: 0,  delta: 0,    deltaType: 'flat-red',   trendLabel: 'No change',     trendDir: 'flat' },
  { label: 'Not Delivered',         value: 0,  delta: 0,    deltaType: 'flat-red',   trendLabel: 'No change',     trendDir: 'flat' },
]

// ─── IKEA Ads data ────────────────────────────────────────────────────────────
const BUSINESS_ID = '0cccd497-6399-476d-91f6-bdb715ff7a83'

type AdRow = {
  businessId: string
  adId: string
  sessionStart: number
  buttonResp: number
  linkClick: number
  total: number
}

const ADS_DATA: AdRow[] = [
  { businessId: BUSINESS_ID, adId: '120222115404190120', sessionStart: 1902,  buttonResp: 189,  linkClick: 730,  total: 2821  },
  { businessId: BUSINESS_ID, adId: '120222116589720120', sessionStart: 958,   buttonResp: 100,  linkClick: 262,  total: 1320  },
  { businessId: BUSINESS_ID, adId: '120233497260370120', sessionStart: 4281,  buttonResp: 3591, linkClick: 4921, total: 12793 },
  { businessId: BUSINESS_ID, adId: '120233540257470120', sessionStart: 44,    buttonResp: 40,   linkClick: 93,   total: 177   },
  { businessId: BUSINESS_ID, adId: '120241058637480120', sessionStart: 5492,  buttonResp: 1025, linkClick: 401,  total: 6918  },
  { businessId: BUSINESS_ID, adId: '120242454814320120', sessionStart: 3641,  buttonResp: 948,  linkClick: 0,    total: 4589  },
  { businessId: BUSINESS_ID, adId: '120243287720740120', sessionStart: 4165,  buttonResp: 0,    linkClick: 4794, total: 8959  },
  { businessId: BUSINESS_ID, adId: '120244504021100120', sessionStart: 15004, buttonResp: 4006, linkClick: 0,    total: 19010 },
]

const COLS = [
  { key: 'adId',         label: 'Ad ID',                   right: false },
  { key: 'sessionStart', label: 'Session start events',     right: true  },
  { key: 'buttonResp',   label: 'Button response events',   right: true  },
  { key: 'linkClick',    label: 'Link click events',        right: true  },
  { key: 'total',        label: 'Total events reported',    right: true  },
]

function AdsTab() {
  const [adIds, setAdIds] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  function handleSort(key: string) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const rows = [...ADS_DATA].sort((a, b) => {
    if (!sortKey) return 0
    const va = a[sortKey as keyof AdRow]
    const vb = b[sortKey as keyof AdRow]
    if (typeof va === 'number' && typeof vb === 'number') return sortAsc ? va - vb : vb - va
    return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
  })

  return (
    <div className="mx-auto max-w-5xl px-6 py-5">

      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Ad Performance</h2>
          <p className="text-xs text-gray-400 mt-0.5">IKEA_Chile_PRINCIPAL · May 9 – Jun 9, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            Filter
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5 text-gray-400" />
            Export
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {COLS.map(({ key, label, right }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={cn(
                    'cursor-pointer select-none px-4 py-3 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors',
                    right ? 'text-right' : 'text-left'
                  )}
                >
                  <span className="flex items-center gap-1 whitespace-nowrap" style={right ? { justifyContent: 'flex-end' } : {}}>
                    {label}
                    {sortKey === key && (
                      <span className="text-purple-500">{sortAsc ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.adId}
                className={cn(
                  'border-b border-gray-100 last:border-0 transition-colors hover:bg-purple-50/30',
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                )}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.adId}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-800">{row.sessionStart.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-800">{row.buttonResp.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-800">{row.linkClick.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums font-semibold text-gray-900">{row.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2.5">
          <span className="text-xs text-gray-400">{ADS_DATA.length} results</span>
        </div>
      </div>

      {/* Ad Ids input */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-1 text-xs font-semibold text-gray-700">Ad Ids</p>
        <p className="mb-2 text-xs text-gray-400">
          Optionally add the ad ids to track (comma separated, no quotes needed)
        </p>
        <input
          type="text"
          value={adIds}
          onChange={(e) => setAdIds(e.target.value)}
          placeholder="e.g. 120222115404190120, 120233497260370120"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
        />
      </div>
    </div>
  )
}

// ─── IKEA data ────────────────────────────────────────────────────────────────
const IKEA_TABS = ['Campaigns', 'Inbox', 'Account Overview', 'Enrichment', 'Message Overview', 'Automations', 'Reports', 'Time Tracking', 'Ads']

const IKEA_CONVERSATIONS: MetricCard[] = [
  { label: 'Intended',          value: 368692, delta: 877738, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up', note: '(With MMLite: 368659)' },
  { label: 'Submitted to Meta', value: 359704, pct: '97.56%', delta: 856338, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up', note: '(With MMLite: 368659)' },
  { label: 'Sent',              value: 309156, pct: '85.95%', delta: 735986, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up', note: '(With MMLite: 309121)' },
  { label: 'Delivered',         value: 303459, pct: '98.16%', delta: 722421, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up', note: '(With MMLite: 303423)' },
  { label: 'Read',              value: 169083, pct: '55.72%', delta: 402479, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up' },
  { label: 'Engaged',           value: 11067,  pct: '6.55%',  delta: 46013,  deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up' },
]

const IKEA_DISPATCH: MetricCard[] = [
  { label: 'Templates Delivered',   value: 303457, delta: 722417, deltaType: 'up-green', trendLabel: 'Trending up', trendDir: 'up', note: '(With MMLite: 303423)' },
  { label: 'Audience Input Errors', value: 8988,   pct: '2.44%',  delta: 0, deltaType: 'flat-red', trendLabel: 'No change', trendDir: 'flat' },
  { label: 'Meta Errors',           value: 50548,  pct: '14.05%', delta: 0, deltaType: 'flat-red', trendLabel: 'No change', trendDir: 'flat' },
  { label: 'Marketing Delivered',   value: 303423, pct: '99.99%', delta: 0, deltaType: 'flat-red', trendLabel: 'No change', trendDir: 'flat' },
  { label: 'Not Delivered',         value: 5697,   pct: '1.84%',  delta: 0, deltaType: 'flat-red', trendLabel: 'No change', trendDir: 'flat' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function formatNum(n: number) {
  return n.toLocaleString('en-US')
}

function DeltaBadge({ delta, type }: { delta: number; type: DeltaType }) {
  if (type === 'up-green') {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
        <ArrowUpRight className="h-3 w-3" />+{formatNum(delta)}
      </span>
    )
  }
  if (type === 'down-green') {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
        <ArrowDownRight className="h-3 w-3" />{delta}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-red-500">
      <ArrowRight className="h-3 w-3" />{delta}
    </span>
  )
}

function TrendText({ label, dir }: { label: string; dir: TrendDir }) {
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-gray-800">
      {label}
      {dir === 'up'   && <ArrowUpRight className="h-3.5 w-3.5" />}
      {dir === 'flat' && <ArrowRight className="h-3.5 w-3.5" />}
      {dir === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
    </span>
  )
}

function Card({ card }: { card: MetricCard }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          {card.label}
          <Info className="h-3 w-3 text-gray-300" />
        </span>
        <DeltaBadge delta={card.delta} type={card.deltaType} />
      </div>
      <p className="mb-0.5 text-2xl font-bold text-gray-900">{formatNum(card.value)}</p>
      {card.pct
        ? <p className="mb-3 text-xs text-gray-400">{card.pct}</p>
        : <div className="mb-3" />
      }
      <TrendText label={card.trendLabel} dir={card.trendDir} />
      {card.note && <p className="mt-0.5 text-xs text-gray-400">{card.note}</p>}
    </div>
  )
}

// ─── Service Usage data ───────────────────────────────────────────────────────
const CHART_DATES = [
  'May 08','May 10','May 12','May 14','May 16','May 18','May 20',
  'May 22','May 24','May 26','May 28','May 30','Jun 01','Jun 03','Jun 05','Jun 08',
]

const CHART_DATA = CHART_DATES.map((date, i) => ({
  date,
  flowBuilder: i === 12 ? 303000 : i === 13 ? 8000 : i === 14 ? 4000 : 0,
  api:         0,
  delivered:   i === 12 ? 295000 : i === 13 ? 7000 : i === 14 ? 3500 : 0,
  read:        i === 12 ? 155000 : i === 13 ? 4000 : i === 14 ? 2000 : 0,
}))

const FILTER_OPTIONS = [
  { key: 'flowBuilder', label: 'FlowBuilder messages sent', color: '#8b5cf6' },
  { key: 'api',         label: 'API messages sent',          color: '#22d3ee' },
  { key: 'delivered',   label: 'Delivered',                  color: '#3b82f6' },
  { key: 'read',        label: 'Read',                       color: '#f97316' },
  { key: 'engaged',     label: 'Engaged',                    color: '#10b981' },
  { key: 'linkClicks',  label: 'Unique link clicks',         color: '#ec4899' },
  { key: 'errors',      label: 'Errors',                     color: '#ef4444' },
]

const BEST_CAMPAIGNS = [
  { name: '20260601 CI Cyber Junio 11 34', created: 'Jun 1, 2026', sent: '99%', read: '54%', engaged: '8%' },
  { name: '20260601 CI Cyber Junio 11 38', created: 'Jun 1, 2026', sent: '99%', read: '54%', engaged: '8%' },
  { name: '20260601 CI Cyber Junio 11 30', created: 'Jun 1, 2026', sent: '99%', read: '54%', engaged: '8%' },
]

function ServiceUsageSection() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['flowBuilder', 'api'])
  const [filtersOpen, setFiltersOpen] = useState(false)

  function toggleFilter(key: string) {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const visibleLines = FILTER_OPTIONS.filter((f) => activeFilters.includes(f.key))

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Service usage</h2>

      {/* Service DAU card */}
      <div className="mb-5 w-64">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              Service DAU <Info className="h-3 w-3 text-gray-300" />
            </span>
            <span className="flex items-center gap-0.5 rounded-full border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
              <ArrowUpRight className="h-3 w-3" /> +199
            </span>
          </div>
          <p className="mb-2 text-2xl font-bold text-gray-900">422</p>
          <span className="flex items-center gap-1 text-sm font-medium text-gray-800">
            Trending up <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {/* Legend + Filters */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-wrap gap-4">
            {visibleLines.map((f) => (
              <div key={f.key} className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600">{f.label}</span>
                <span className="inline-block h-1 w-8 rounded-full" style={{ backgroundColor: f.color }} />
              </div>
            ))}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Filters <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {filtersOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {FILTER_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFilter(key)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {activeFilters.includes(key)
                      ? <span className="text-purple-600">✓</span>
                      : <span className="w-3" />
                    }
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SVG Line chart */}
        {(() => {
          const W = 900, H = 220, padL = 60, padR = 20, padT = 10, padB = 30
          const innerW = W - padL - padR
          const innerH = H - padT - padB
          const maxVal = 320000
          const yTicks = [0, 75000, 150000, 225000, 300000]
          const n = CHART_DATA.length

          function xPos(i: number) { return padL + (i / (n - 1)) * innerW }
          function yPos(v: number) { return padT + innerH - (v / maxVal) * innerH }

          function makePath(key: string) {
            return CHART_DATA.map((d, i) => {
              const v = d[key as keyof typeof d] as number
              return `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`
            }).join(' ')
          }

          return (
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
              {/* Grid lines */}
              {yTicks.map((t) => (
                <g key={t}>
                  <line x1={padL} x2={W - padR} y1={yPos(t)} y2={yPos(t)} stroke="#f0f0f0" strokeWidth={1} />
                  <text x={padL - 8} y={yPos(t) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
                    {t === 0 ? '0' : `${t / 1000}000`}
                  </text>
                </g>
              ))}
              {/* X axis labels */}
              {CHART_DATA.filter((_, i) => i % 2 === 0).map((d, idx) => {
                const i = idx * 2
                return (
                  <text key={d.date} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#9ca3af">
                    {d.date}
                  </text>
                )
              })}
              {/* Lines */}
              {visibleLines.map((f) => (
                <path key={f.key} d={makePath(f.key)} fill="none" stroke={f.color} strokeWidth={2} />
              ))}
            </svg>
          )
        })()}
      </div>

      {/* Best performing campaigns */}
      <div className="mt-5">
        <div className="mb-1 flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-gray-900">Best performing campaigns</h3>
          <Info className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <p className="mb-3 text-xs text-gray-500">Learn which campaigns had the highest number of engaged users</p>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {BEST_CAMPAIGNS.map((c) => (
            <div key={c.name} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-purple-600 hover:underline cursor-pointer">{c.name}</p>
                <p className="text-xs text-gray-400">Created on {c.created} by</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div><p className="font-medium text-gray-700">Sent</p><p>{c.sent}</p></div>
                  <div><p className="font-medium text-gray-700">Read</p><p>{c.read}</p></div>
                  <div><p className="font-medium text-gray-700">Engaged</p><p>{c.engaged}</p></div>
                </div>
                <button type="button" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  View results
                </button>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('Campaigns')
  const business = useAtomValue(currentBusinessAtom)

  const tabs         = business === 'ikea' ? IKEA_TABS         : VISIBLE1_TABS
  const conversations = business === 'ikea' ? IKEA_CONVERSATIONS : VISIBLE1_CONVERSATIONS
  const dispatch     = business === 'ikea' ? IKEA_DISPATCH     : VISIBLE1_DISPATCH

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* Title */}
      <div className="shrink-0 bg-white">
        <div className="mx-auto max-w-4xl px-6 pt-4 pb-3">
          <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
        </div>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex">
            {tabs.map((tab) => {
              const active = tab === activeTab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'relative px-3 pb-2.5 pt-1 text-sm whitespace-nowrap transition-colors',
                    active ? 'font-medium text-purple-600' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab}
                  {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === 'Ads' && <AdsTab />}
        {activeTab !== 'Ads' && <div className="mx-auto max-w-4xl px-6 py-4">

          {/* Filter row */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                May 9–Jun 9, 2026
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                All Campaigns
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                View past reports
              </button>
              <button type="button" className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700">
                Send Report
              </button>
            </div>
          </div>

          {/* About banner */}
          <div className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              <Info className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              About Dashboard Metrics
            </div>
            <p className="ml-5 text-xs leading-relaxed text-gray-500">
              The aggregate numbers below are highly accurate and suitable for most analytics needs. However, if you need exact counts down
              to the conversation level, please use the Campaign Report (CSV), which is our authoritative source of truth.
            </p>
          </div>

          {/* Conversations */}
          <div className="mb-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Conversations</h2>
            <div className="grid grid-cols-3 gap-3">
              {conversations.map((card) => <Card key={card.label} card={card} />)}
            </div>
          </div>

          {/* Dispatch & delivery quality */}
          <div className="mb-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Dispatch &amp; delivery quality</h2>
            <div className="grid grid-cols-3 gap-3">
              {dispatch.map((card) => <Card key={card.label} card={card} />)}
            </div>
          </div>

          {/* Common Issues + Service Usage — IKEA only */}
          {business === 'ikea' && (
            <div className="mb-5">
              <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
                <div className="mb-4 flex items-center gap-1.5">
                  <h2 className="text-sm font-semibold text-gray-900">Common Issues</h2>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { title: 'Message Undeliverable',   type: 'Meta Error' },
                    { title: 'User has opted out',       type: 'Validation Error' },
                    { title: 'Meta chose not to deliver', type: 'Meta Error' },
                    { title: "User's number is part of an experiment", type: 'Meta Error' },
                    { title: 'Unable to deliver the message. This recipient has chosen to stop receiving marketing messages on WhatsApp from your business.', type: 'Meta Error' },
                  ].map(({ title, type }) => (
                    <div key={title} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-red-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{title}</p>
                        <p className="text-xs text-gray-400">{type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Service Usage — IKEA only */}
          {business === 'ikea' && activeTab === 'Campaigns' && <ServiceUsageSection />}

        </div>}
      </div>
    </div>
  )
}
