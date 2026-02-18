import { db } from '@/db/database'
import type { Trip, Flight, Accommodation, Activity, Note } from '@/db/types'

export async function exportTripAsJSON(tripId: number): Promise<void> {
  const trip = await db.trips.get(tripId)
  if (!trip) throw new Error('Trip not found')

  const [flights, accommodations, activities, notes] = await Promise.all([
    db.flights.where('tripId').equals(tripId).toArray(),
    db.accommodations.where('tripId').equals(tripId).toArray(),
    db.activities.where('tripId').equals(tripId).toArray(),
    db.notes.where('tripId').equals(tripId).toArray(),
  ])

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    trip,
    flights,
    accommodations,
    activities,
    notes,
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${trip.name.replace(/\s+/g, '_')}_export.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importTripFromJSON(file: File): Promise<number> {
  const text = await file.text()
  const data = JSON.parse(text)

  if (!data.version || !data.trip) {
    throw new Error('Invalid export file format')
  }

  const { trip, flights, accommodations, activities, notes } = data as {
    trip: Trip
    flights: Flight[]
    accommodations: Accommodation[]
    activities: Activity[]
    notes: Note[]
  }

  // Remove old id so a new one is assigned
  const { id: _tripId, ...tripData } = trip
  const newTripId = await db.trips.add({
    ...tripData,
    name: `${tripData.name} (imported)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const idMap = { [_tripId ?? 0]: newTripId }

  await Promise.all([
    ...flights.map(({ id: _id, ...f }) => db.flights.add({ ...f, tripId: idMap[f.tripId] ?? newTripId })),
    ...accommodations.map(({ id: _id, ...a }) => db.accommodations.add({ ...a, tripId: idMap[a.tripId] ?? newTripId })),
    ...activities.map(({ id: _id, ...a }) => db.activities.add({ ...a, tripId: idMap[a.tripId] ?? newTripId })),
    ...notes.map(({ id: _id, ...n }) => db.notes.add({ ...n, tripId: idMap[n.tripId] ?? newTripId })),
  ])

  return newTripId as number
}
