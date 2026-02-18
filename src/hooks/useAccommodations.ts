import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import type { Accommodation } from '@/db/types'

export function useAccommodations(tripId: number) {
  const accommodations = useLiveQuery(
    () => db.accommodations.where('tripId').equals(tripId).sortBy('checkIn'),
    [tripId]
  )

  const addAccommodation = async (acc: Omit<Accommodation, 'id' | 'createdAt'>) => {
    return db.accommodations.add({ ...acc, createdAt: new Date().toISOString() })
  }

  const updateAccommodation = async (id: number, changes: Partial<Accommodation>) => {
    return db.accommodations.update(id, changes)
  }

  const deleteAccommodation = async (id: number) => {
    return db.accommodations.delete(id)
  }

  const confirmAccommodation = async (id: number) => {
    return db.accommodations.update(id, { isConfirmed: true })
  }

  return {
    accommodations: accommodations ?? [],
    addAccommodation,
    updateAccommodation,
    deleteAccommodation,
    confirmAccommodation,
  }
}
