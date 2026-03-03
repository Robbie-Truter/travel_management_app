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
    this.version(3)
      .stores({
        trips: "++id, status, startDate, endDate, createdAt",
        flights: "++id, tripId, isConfirmed, departureTime",
      })
      .upgrade(async (trans) => {
        return trans
          .table("flights")
          .toCollection()
          .modify((flight: any) => {
            if (!flight.segments) {
              // Convert old structure to single segment
              flight.segments = [
                {
                  airline: flight.airline,
                  flightNumber: flight.flightNumber,
                  departureAirport: flight.departureAirport,
                  arrivalAirport: flight.arrivalAirport,
                  departureTime: flight.departureTime,
                  arrivalTime: flight.arrivalTime,
                },
              ];

              // Add stops as segments if they exist (though this is more complex,
              // for a simple migration we just take the top level)
              // Actually, let's try to preserve stops if possible.
              if (flight.stops && flight.stops.length > 0) {
                // This is tricky because we don't have intermediate times for stops in the old model
                // We'll just stick to the single segment for legacy data as it's the safest.
              }

              delete flight.airline;
              delete flight.flightNumber;
              delete flight.departureAirport;
              delete flight.arrivalAirport;
              delete flight.departureTime;
              delete flight.arrivalTime;
              delete flight.stops;
            }
          });
      });
  }
}

export const db = new TravelDB();
