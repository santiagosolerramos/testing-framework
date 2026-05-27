import { useState } from 'react'
import { ExternalLinkIcon } from 'lucide-react'
import { getFixtureById } from '@/fixtures/fixtureRegistry'
import { parseFixtureToolResults } from '@/fixtures/fixtureUtils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FixturePickerDialog } from './FixturePickerDialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fixtureId?: string | null
  onChangeFixture: (fixtureId: string | null) => void
  showMigratedBanner?: boolean
}

export function FixturePanelModal({
  open,
  onOpenChange,
  fixtureId,
  onChangeFixture,
  showMigratedBanner,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const fixture = getFixtureById(fixtureId)
  const toolRows = fixture ? parseFixtureToolResults(fixture) : []

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-[720px]! flex-col gap-4 p-6">
          <DialogHeader>
            <DialogTitle>Fixture</DialogTitle>
            <DialogDescription>
              One fixture per persona. Tool results below are read-only — edit them in the fixture
              library to update every persona that uses this fixture.
            </DialogDescription>
          </DialogHeader>

          {showMigratedBanner && fixture?.isAutoMigrated && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              This fixture was auto-migrated from inline mock data. Review its name in the fixture
              library when you have time.
            </div>
          )}

          {fixture ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {fixture.name}
                  </span>
                  {fixture.isAutoMigrated && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                      Auto-migrated
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{fixture.description}</p>
              </div>

              {toolRows.length === 0 ? (
                <p className="text-sm text-gray-500">
                  This fixture has no external tool results (FAQ-only scenario).
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Tool results (read-only)
                  </p>
                  {toolRows.map((row) => (
                    <div key={row.toolId} className="overflow-hidden rounded-lg border border-gray-200">
                      <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs font-medium text-gray-700">
                        {row.toolId}
                      </div>
                      <pre className="max-h-40 overflow-auto bg-gray-900 p-3 text-xs text-gray-100">
                        {row.resultJson}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="link"
                className="h-auto gap-1.5 p-0 text-purple-700"
                onClick={() => {
                  window.alert(
                    'Fixture library editor (mock): changes here would affect all personas using this fixture.'
                  )
                }}
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Edit in fixture library
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              No fixture assigned. Choose one from the library to run tool-dependent evaluations.
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
              {fixture ? 'Change fixture' : 'Choose fixture'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FixturePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedId={fixtureId}
        onSelect={(id) => onChangeFixture(id)}
      />
    </>
  )
}
