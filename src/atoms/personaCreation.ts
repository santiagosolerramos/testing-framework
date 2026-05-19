import { atom } from 'jotai'
import type { PersonaCreationState } from '@/types/personaCreation'

export const personaCreationAtom = atom<PersonaCreationState>(null)
