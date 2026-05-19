import { useMemo, useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon, FolderIcon } from 'lucide-react'
import type { Persona, PersonaSection, PersonaStatus } from '@/types'
import { cn } from '@/lib/utils'
import { getPersonaStatus } from './personaStatus'

type RenderPersonaRow = (
  persona: Persona,
  opts?: { hideStatusBadge?: boolean }
) => React.ReactNode

type Props = {
  zoneStatus: PersonaStatus
  title: string
  sections: PersonaSection[]
  personas: Persona[]
  search: string
  renderPersonaRow: RenderPersonaRow
  /** Draft zone: allow toggling visibility of folders with zero personas */
  emptyFolderToggle?: boolean
}

function matchesSearch(persona: Persona, query: string) {
  if (!query) return true
  return persona.personaKey.toLowerCase().includes(query.toLowerCase())
}

function SectionFolder({
  name,
  count,
  defaultOpen,
  children,
}: {
  name: string
  count: number
  defaultOpen: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200/80"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {open ? (
            <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          )}
          <FolderIcon className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">{name}</span>
        </span>
        <span className="ml-2 shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
          {count}
        </span>
      </button>
      {open && children}
    </div>
  )
}

export function PersonaStatusZone({
  zoneStatus,
  title,
  sections,
  personas,
  search,
  renderPersonaRow,
  emptyFolderToggle = false,
}: Props) {
  const [showEmptyFolders, setShowEmptyFolders] = useState(false)

  const inZone = useMemo(
    () =>
      personas
        .filter((p) => getPersonaStatus(p) === zoneStatus && matchesSearch(p, search))
        .sort((a, b) => a.personaKey.localeCompare(b.personaKey)),
    [personas, zoneStatus, search]
  )

  const unfiled = useMemo(() => inZone.filter((p) => !p.sectionId), [inZone])
  const totalCount = inZone.length
  const isDraftZone = zoneStatus === 'draft'
  const revealEmpty = emptyFolderToggle ? showEmptyFolders : false

  if (search && totalCount === 0) return null

  return (
    <section
      className={cn(
        'mb-3 rounded-lg border',
        isDraftZone
          ? 'border-dashed border-gray-300 bg-gray-50/80'
          : 'border-gray-200 bg-white'
      )}
    >
      <h2
        className={cn(
          'border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide',
          isDraftZone
            ? 'border-gray-200 bg-gray-100 text-gray-700'
            : 'border-green-100 bg-green-50 text-green-900'
        )}
      >
        {title}{' '}
        <span className="font-normal text-gray-500">({totalCount})</span>
      </h2>

      {isDraftZone && !search && (
        <div className="flex flex-col gap-1 border-b border-gray-200 px-3 py-1.5">
          <p className="text-[10px] leading-snug text-gray-500">
            Pass manual Test <strong className="font-medium">3×</strong> consecutively, then
            Promote to Active. Active personas are never demoted — duplicate to draft instead.
          </p>
          {emptyFolderToggle && (
            <button
              type="button"
              className="self-start text-[10px] font-medium text-purple-700 hover:text-purple-900"
              onClick={() => setShowEmptyFolders((v) => !v)}
            >
              {showEmptyFolders ? 'Hide empty folders' : 'Show empty folders'}
            </button>
          )}
        </div>
      )}

      <div className="px-1 py-1">
        {sections.map((section) => {
          const inFolder = inZone.filter((p) => p.sectionId === section.id)
          if (inFolder.length === 0 && !revealEmpty) return null

          return (
            <SectionFolder
              key={`${zoneStatus}-${section.id}`}
              name={section.name}
              count={inFolder.length}
              defaultOpen={inFolder.length > 0}
            >
              {inFolder.map((persona) => renderPersonaRow(persona, { hideStatusBadge: true }))}
            </SectionFolder>
          )
        })}

        {unfiled.length > 0 && (
          <div className="mt-1 border-t border-gray-200/80 pt-1">
            <p className="mb-0.5 px-3 text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Unfiled
            </p>
            {unfiled.map((persona) => renderPersonaRow(persona, { hideStatusBadge: true }))}
          </div>
        )}

        {totalCount === 0 && !search && (
          <p className="px-3 py-3 text-center text-xs text-gray-400">
            No {isDraftZone ? 'draft' : 'active'} personas yet
          </p>
        )}
      </div>
    </section>
  )
}
