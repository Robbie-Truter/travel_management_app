import type { Table } from 'dexie'
import Dexie from 'dexie'
import type { Trip, Flight, Accommodation, Activity, Note } from './types'

export class TravelDB extends Dexie {
  trips!: Table<Trip>
  flights!: Table<Flight>
  accommodations!: Table<Accommodation>
  activities!: Table<Activity>
  notes!: Table<Note>

  constructor() {
    super('TravelPlannerDB')
    this.version(1).stores({
      trips: '++id, status, startDate, endDate, createdAt',
      flights: '++id, tripId, isConfirmed, departureTime',
      accommodations: '++id, tripId, isConfirmed, checkIn',
      activities: '++id, tripId, name, date, isConfirmed, order',
      notes: '++id, tripId, updatedAt',
    })
  }
}

export const db = new TravelDB()
