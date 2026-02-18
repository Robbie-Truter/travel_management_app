import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import type { Flight } from '@/db/types'

export function useFlights(tripId: number) {
  const flights = useLiveQuery(
    () => db.flights.where('tripId').equals(tripId).sortBy('departureTime'),
    [tripId]
  )

  const addFlight = async (flight: Omit<Flight, 'id' | 'createdAt'>) => {
    return db.flights.add({ ...flight, createdAt: new Date().toISOString() })
  }

  const updateFlight = async (id: number, changes: Partial<Flight>) => {
    return db.flights.update(id, changes)
  }

  const deleteFlight = async (id: number) => {
    return db.flights.delete(id)
  }

  const confirmFlight = async (id: number) => {
    return db.flights.update(id, { isConfirmed: true })
  }

  return { flights: flights ?? [], addFlight, updateFlight, deleteFlight, confirmFlight }
}
