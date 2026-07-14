import { atom } from 'jotai'

export type AppSection = 'agents' | 'admin' | 'analytics'
export type BusinessId = 'visible1' | 'ikea'

export const appSectionAtom = atom<AppSection>('analytics')
export const currentBusinessAtom = atom<BusinessId>('visible1')
export const loadingBusinessAtom = atom<boolean>(false)
