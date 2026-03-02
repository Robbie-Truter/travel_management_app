import type { Table } from "dexie";
import Dexie from "dexie";
import type { Trip, Flight, Accommodation, Activity, Note, Document } from "./types";

export class TravelDB extends Dexie {
  trips!: Table<Trip>;
  flights!: Table<Flight>;
  accommodations!: Table<Accommodation>;
  activities!: Table<Activity>;
  notes!: Table<Note>;
  documents!: Table<Document>;

  constructor() {
    super("TravelPlannerDB");
    this.version(1).stores({
      trips: "++id, status, startDate, endDate, createdAt",
      flights: "++id, tripId, isConfirmed, departureTime",
      accommodations: "++id, tripId, isConfirmed, checkIn",
      activities: "++id, tripId, name, date, isConfirmed, order",
      notes: "++id, tripId, updatedAt",
      documents: "++id, tripId, name, type, createdAt",
    });

    this.version(2)
      .stores({
        trips: "++id, status, startDate, endDate, createdAt",
      })
      .upgrade((trans) => {
        return trans
          .table("trips")
          .toCollection()
          .modify((trip: Trip & { destination?: string }) => {
            if (trip.destination && !trip.destinations) {
              trip.destinations = [trip.destination];
              delete trip.destination;
            } else if (!trip.destinations) {
              trip.destinations = [];
            }
          });
      });
  }
}

export const db = new TravelDB();
