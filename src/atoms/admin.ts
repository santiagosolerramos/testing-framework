import { atom } from 'jotai'

export type AppSection = 'agents' | 'admin' | 'analytics'
export type BusinessId = 'visible1' | 'ikea'

export const appSectionAtom = atom<AppSection>('admin')
export const currentBusinessAtom = atom<BusinessId>('visible1')
export const loadingBusinessAtom = atom<boolean>(false)

/** N+1 guided tour: -1 = closed, 0..n = step index */
export const nPlusOneJourneyStepAtom = atom<number>(0)
export const nPlusOneJourneyOpenAtom = atom<boolean>(true)
