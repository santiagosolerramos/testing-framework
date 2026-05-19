import {
  CheckCircle2Icon,
  MoreVerticalIcon,
  OctagonAlertIcon,
  UserIcon,
  XCircleIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import type { PersonaStatus, TestRunStatus } from '@/types'
import { cn } from '@/lib/utils'
import { PersonaStatusBadge } from './PersonaStatusBadge'

function ExecutionStatusIcon({ status }: { status: TestRunStatus }) {
  switch (status) {
    case 'TEST_RUN_STATUS_RUNNING':
      return <Spinner variant="ring" />
    case 'TEST_RUN_STATUS_FAILED':
      return <XCircleIcon className="h-4 w-4 shrink-0 text-red-500" />
    case 'TEST_RUN_STATUS_PASSED':
      return <CheckCircle2Icon className="h-4 w-4 shrink-0 text-green-500" />
    default:
      return <UserIcon className="h-4 w-4 shrink-0 text-gray-400" />
  }
}

type Props = {
  label: string
  personaStatus: PersonaStatus
  runStatus?: TestRunStatus
  isSelected?: boolean
  onSelect: () => void
  onEdit?: () => void
  onDuplicateToDraft?: () => void
  onDelete?: () => void
  onPromoteToActive?: () => void
  showStatusBadge?: boolean
  trailing?: React.ReactNode
}

export function PersonaSidebarItem({
  label,
  personaStatus,
  runStatus = 'TEST_RUN_STATUS_UNSPECIFIED',
  isSelected,
  onSelect,
  onEdit,
  onDuplicateToDraft,
  onDelete,
  onPromoteToActive,
  showStatusBadge = true,
  trailing,
}: Props) {
  const showMenu = onEdit || onDuplicateToDraft || onDelete || onPromoteToActive

  return (
    <div
      className={cn(
        'group flex w-full items-center justify-between px-3 hover:bg-gray-200',
        isSelected && 'bg-gray-200'
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm text-gray-700"
      >
        <ExecutionStatusIcon status={runStatus} />
        <span className="min-w-0 truncate">{label}</span>
        {showStatusBadge && (
          <PersonaStatusBadge status={personaStatus} className="ml-auto" />
        )}
        {trailing}
      </button>
      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="menu-trigger h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVerticalIcon className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[11.25rem]">
            {onPromoteToActive && (
              <DropdownMenuItem className="cursor-pointer" onClick={onPromoteToActive}>
                Promote to Active
              </DropdownMenuItem>
            )}
            {onDuplicateToDraft && (
              <DropdownMenuItem className="cursor-pointer" onClick={onDuplicateToDraft}>
                Duplicate to draft
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={onDelete}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export function PersonaFolderItem({
  label,
  count,
  onClick,
}: {
  label: string
  count: number
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="ml-2 shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
        {count}
      </span>
    </button>
  )
}

export function PersonaErrorIcon() {
  return <OctagonAlertIcon className="h-4 w-4 shrink-0 text-red-500" />
}
