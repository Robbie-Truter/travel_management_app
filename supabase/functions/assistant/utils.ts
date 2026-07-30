import { PostgrestError } from "https://esm.sh/@supabase/supabase-js";
import type {
    TripRow,
    ActivityRow,
    FlightRow,
    AccommodationRow,
    DocumentRow,
} from "../../../src/db/types.ts";

export interface ItineraryContextData {
    trips: TripRow[] | null;
    activities: ActivityRow[] | null;
    flights: FlightRow[] | null;
    accommodations: AccommodationRow[] | null;
    documents: DocumentRow[] | null;
}

export const throwIfError = (...errors: { label: string; error: PostgrestError | null }[]) => {
    for (const { label, error } of errors) {
        if (error) {
            throw new Error(`Error fetching ${label}: ${error.message}`);
        }
    }
}

export const buildItineraryContext = (data: ItineraryContextData) => {
    const lines: string[] = [];

    lines.push("# Trips");

    if (data.trips && data.trips.length > 0) {
        const tripLines = data.trips.map(trip => `- ${trip.name}`);
        lines.push(tripLines.join("\n"));
    }

    lines.push("\n# Activities");

    if (data.activities && data.activities.length > 0) {
        const activityBlocks = data.activities.map(activity =>
            [
                `- Description: ${activity.name ?? "No description"}`,
                `  Date: ${activity.date ?? "No date"}`,
                `  Type: ${activity.type ?? "No type"}`,
                `  Notes: ${activity.notes ?? "No notes"}`,
                `  Cost: ${activity.cost !== null && activity.cost !== undefined ? `${activity.cost} ${activity.currency ?? ""}`.trim() : "No cost"}`,
                `  Confirmation: ${activity.is_confirmed ? "Confirmed" : "Not confirmed"}`,
            ].join("\n")
        );
        lines.push(activityBlocks.join("\n\n"));
    }

    lines.push("\n# Flights");

    if (data.flights && data.flights.length > 0) {
        const flightBlocks = data.flights.map(flight => {
            const first = flight.segments?.[0];
            const last = flight.segments?.[flight.segments.length - 1];

            return [
                `- Description: ${flight.description ?? "No description"}`,
                `  Airline: ${first?.airline ?? "Unknown Airline"}`,
                `  Route: ${first && last ? `${first.departureAirport} → ${last.arrivalAirport}` : "Unknown Route"}`,
                `  Departure: ${first?.departureTime ?? "No departure time"}`,
                `  Arrival: ${last?.arrivalTime ?? "No arrival time"}`,
                `  Price: ${flight.price !== null && flight.price !== undefined ? `${flight.price} ${flight.currency ?? ""}`.trim() : "No price"}`,
                `  Confirmation: ${flight.is_confirmed ? "Confirmed" : "Not confirmed"}`
            ].join("\n");
        });
        lines.push(flightBlocks.join("\n\n"));
    }

    lines.push("\n# Accommodations");

    if (data.accommodations && data.accommodations.length > 0) {
        const accommodationBlocks = data.accommodations.map(accommodation =>
            [
                `- Name: ${accommodation.name ?? "No name"}`,
                `  Type: ${accommodation.type ?? "No type"}`,
                `  Platform: ${accommodation.platform ?? "No platform"}`,
                `  Location: ${accommodation.location ?? "No location"}`,
                `  Check In: ${accommodation.check_in ?? "No check-in date"}`,
                `  Check Out: ${accommodation.check_out ?? "No check-out date"}`,
                `  Price: ${accommodation.price !== null && accommodation.price !== undefined ? `${accommodation.price} ${accommodation.currency ?? ""}`.trim() : "No price"}`,
                `  Notes: ${accommodation.notes ?? "No notes"}`,
                `  Confirmation: ${accommodation.is_confirmed ? "Confirmed" : "Not confirmed"}`
            ].join("\n")
        );
        lines.push(accommodationBlocks.join("\n\n"));
    }

    return lines.join("\n");
}