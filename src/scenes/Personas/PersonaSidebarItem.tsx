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
import type { TestRunStatus } from '@/types'
import { cn } from '@/lib/utils'

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
  status?: TestRunStatus
  isDraft?: boolean
  isSelected?: boolean
  onSelect: () => void
  onDuplicate?: () => void
  onDelete?: () => void
}

export function PersonaSidebarItem({
  label,
  status = 'TEST_RUN_STATUS_UNSPECIFIED',
  isDraft,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: Props) {
  const showMenu = onDuplicate || onDelete

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
        className="flex min-w-0 flex-1 items-center gap-2.5 py-2 text-left text-sm text-gray-700"
      >
        <ExecutionStatusIcon status={status} />
        <span className="truncate">{label}</span>
        {isDraft && (
          <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
            Draft
          </span>
        )}
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
            {onDuplicate && (
              <DropdownMenuItem className="cursor-pointer" onClick={onDuplicate}>
                Duplicate
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

/** Folder row — same horizontal padding, no rounded-md */
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

// Error state icon (for future TEST_RUN_STATUS_ERROR)
export function PersonaErrorIcon() {
  return <OctagonAlertIcon className="h-4 w-4 shrink-0 text-red-500" />
}
