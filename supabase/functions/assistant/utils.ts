import type { PostgrestError } from "@supabase/supabase-js";
import type {
    AccommodationRow,
    ActivityRow,
    DocumentRow,
    FlightRow,
    TripRow,
} from "../../../src/db/types.ts";

export interface ItineraryContextData {
    trips: TripRow[] | null;
    activities: ActivityRow[] | null;
    flights: FlightRow[] | null;
    accommodations: AccommodationRow[] | null;
    documents: DocumentRow[] | null;
}

export const throwIfError = (
    ...errors: { label: string; error: PostgrestError | null }[]
) => {
    for (const { label, error } of errors) {
        if (error) {
            throw new Error(`Error fetching ${label}: ${error.message}`);
        }
    }
};

export const buildItineraryContext = (data: ItineraryContextData) => {
    const lines: string[] = [];

    if (!data.trips?.length) {
        return "No trips selected.";
    }

    for (const trip of data.trips) {
        lines.push(`# Trip: ${trip.name}`);

        // Activities
        lines.push("\n## Activities");

        const tripActivities = data.activities?.filter((a) =>
            a.trip_id === trip.id
        ) ?? [];

        if (tripActivities.length) {
            for (const activity of tripActivities) {
                lines.push(
                    [
                        "Activity",
                        `- Name: ${activity.name ?? "Unknown"}`,
                        `- Date: ${activity.date ?? "Unknown"}`,
                        `- Type: ${activity.type ?? "Unknown"}`,
                        `- Notes: ${activity.notes ?? "None"}`,
                        `- Cost: ${
                            activity.cost != null
                                ? `${activity.cost} ${activity.currency ?? ""}`
                                    .trim()
                                : "None"
                        }`,
                        `- Confirmed: ${activity.is_confirmed ? "Yes" : "No"}`,
                    ].join("\n"),
                );
            }
        } else {
            lines.push("None");
        }

        // Flights
        lines.push("\n## Flights");

        const tripFlights =
            data.flights?.filter((f) => f.trip_id === trip.id) ?? [];

        if (tripFlights.length) {
            for (const flight of tripFlights) {
                const first = flight.segments?.[0];
                const last = flight.segments?.[flight.segments.length - 1];

                lines.push(
                    [
                        "Flight",
                        `- Name: ${flight.description ?? "Unnamed Flight"}`,
                        `- Airline: ${first?.airline ?? "Unknown"}`,
                        `- Route: ${
                            first && last
                                ? `${first.departureAirport} → ${last.arrivalAirport}`
                                : "Unknown"
                        }`,
                        `- Departure: ${first?.departureTime ?? "Unknown"}`,
                        `- Arrival: ${last?.arrivalTime ?? "Unknown"}`,
                        `- Price: ${
                            flight.price != null
                                ? `${flight.price} ${flight.currency ?? ""}`
                                    .trim()
                                : "Unknown"
                        }`,
                        `- Confirmed: ${flight.is_confirmed ? "Yes" : "No"}`,
                    ].join("\n"),
                );
            }
        } else {
            lines.push("None");
        }

        // Accommodations
        lines.push("\n## Accommodations");

        const tripAccommodations =
            data.accommodations?.filter((a) => a.trip_id === trip.id) ?? [];

        if (tripAccommodations.length) {
            for (const accommodation of tripAccommodations) {
                lines.push(
                    [
                        "Accommodation",
                        `- Name: ${accommodation.name ?? "Unknown"}`,
                        `- Type: ${accommodation.type ?? "Unknown"}`,
                        `- Platform: ${accommodation.platform ?? "Unknown"}`,
                        `- Location: ${accommodation.location ?? "Unknown"}`,
                        `- Check-in: ${accommodation.check_in ?? "Unknown"}`,
                        `- Check-out: ${accommodation.check_out ?? "Unknown"}`,
                        `- Price: ${
                            accommodation.price != null
                                ? `${accommodation.price} ${
                                    accommodation.currency ?? ""
                                }`.trim()
                                : "Unknown"
                        }`,
                        `- Notes: ${accommodation.notes ?? "None"}`,
                        `- Confirmed: ${
                            accommodation.is_confirmed ? "Yes" : "No"
                        }`,
                    ].join("\n"),
                );
            }
        } else {
            lines.push("None");
        }

        lines.push("");
    }

    return lines.join("\n");
};
