import type { Table } from "dexie";
import Dexie from "dexie";
import type { Trip, Flight, Accommodation, Activity, Note, Document, Destination } from "./types";

export class TravelDB extends Dexie {
  trips!: Table<Trip>;
  destinations!: Table<Destination>;
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
        // Define a type for the legacy flight record
        interface LegacyFlight extends Flight {
          airline?: string;
          flightNumber?: string;
          departureAirport?: string;
          arrivalAirport?: string;
          departureTime?: string;
          arrivalTime?: string;
          stops?: unknown[];
        }

        return trans
          .table("flights")
          .toCollection()
          .modify((flight: LegacyFlight) => {
            if (!flight.segments) {
              // Convert old structure to single segment
              flight.segments = [
                {
                  airline: flight.airline ?? "",
                  flightNumber: flight.flightNumber ?? "",
                  departureAirport: flight.departureAirport ?? "",
                  arrivalAirport: flight.arrivalAirport ?? "",
                  departureTime: flight.departureTime ?? "",
                  arrivalTime: flight.arrivalTime ?? "",
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
    this.version(4)
      .stores({
        flights: "++id, tripId, country, isConfirmed, departureTime",
        accommodations: "++id, tripId, country, isConfirmed, checkIn",
        activities: "++id, tripId, country, name, date, isConfirmed, order",
      })
      .upgrade(async (trans) => {
        const flights = await trans.table("flights").toArray();
        const accs = await trans.table("accommodations").toArray();
        const acts = await trans.table("activities").toArray();
        const trips = await trans.table("trips").toArray();

        const tripMap = new Map(trips.map((t) => [t.id, t]));

        for (const f of flights) {
          if (!f.country) {
            const trip = tripMap.get(f.tripId);
            if (trip?.destinations?.[0]) {
              await trans.table("flights").update(f.id, { country: trip.destinations[0] });
            }
          }
        }

        for (const a of accs) {
          if (!a.country) {
            const trip = tripMap.get(a.tripId);
            if (trip?.destinations?.[0]) {
              await trans.table("accommodations").update(a.id, { country: trip.destinations[0] });
            }
          }
        }

        for (const a of acts) {
          if (!a.country) {
            const trip = tripMap.get(a.tripId);
            if (trip?.destinations?.[0]) {
              await trans.table("activities").update(a.id, { country: trip.destinations[0] });
            }
          }
        }
      });

    this.version(5).stores({
      destinations: "++id, tripId, country, name",
    });
  }
}

export const db = new TravelDB();
