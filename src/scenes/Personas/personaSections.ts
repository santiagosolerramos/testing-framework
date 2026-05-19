/** Map fixture / flow hints to folder ids (same folders mirrored in Active + Draft zones). */
export function inferSectionId(fixtureId?: string | null): string | undefined {
  if (!fixtureId) return undefined
  if (fixtureId.includes('checkout')) return 'section-2'
  if (fixtureId.includes('product')) return 'section-3'
  return 'section-1'
}
