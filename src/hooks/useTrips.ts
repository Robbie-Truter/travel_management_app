import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import type { Trip } from '@/db/types'

export function useTrips() {
  const trips = useLiveQuery(() => db.trips.orderBy('createdAt').reverse().toArray(), [])

  const addTrip = async (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return db.trips.add({ ...trip, createdAt: now, updatedAt: now })
  }

  const updateTrip = async (id: number, changes: Partial<Trip>) => {
    return db.trips.update(id, { ...changes, updatedAt: new Date().toISOString() })
  }

  const deleteTrip = async (id: number) => {
    await Promise.all([
      db.trips.delete(id),
      db.flights.where('tripId').equals(id).delete(),
      db.accommodations.where('tripId').equals(id).delete(),
      db.activities.where('tripId').equals(id).delete(),
      db.notes.where('tripId').equals(id).delete(),
    ])
  }

  const getTrip = async (id: number) => db.trips.get(id)

  return { trips: trips ?? [], addTrip, updateTrip, deleteTrip, getTrip }
}

export function useTrip(id: number | undefined) {
  const trip = useLiveQuery(() => (id ? db.trips.get(id) : undefined), [id])
  return trip
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return { theme, toggleTheme }
}
