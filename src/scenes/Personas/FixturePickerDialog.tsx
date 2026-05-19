import { getAllFixtures } from '@/fixtures/fixtureRegistry'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedId?: string | null
  onSelect: (fixtureId: string) => void
}

export function FixturePickerDialog({ open, onOpenChange, selectedId, onSelect }: Props) {
  const fixtures = getAllFixtures()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fixture library</DialogTitle>
          <DialogDescription>
            Choose one fixture for this persona. Editing mock data happens in the fixture library
            and affects every persona using that fixture.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {fixtures.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                onSelect(f.id)
                onOpenChange(false)
              }}
              className={cn(
                'w-full rounded-lg border p-4 text-left transition-colors',
                selectedId === f.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{f.name}</span>
                {f.isAutoMigrated && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                    Legacy
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{f.description}</p>
              {f.coveredCapabilities.length > 0 && (
                <p className="mt-2 text-xs text-gray-600">
                  Covers: {f.coveredCapabilities.join(', ')}
                </p>
              )}
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}
