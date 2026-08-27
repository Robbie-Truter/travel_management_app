import type { FlightRow } from "../../../../src/db/types.ts";

// Builds AI context string from a list of flight records.
export function buildFlightsContext(
    flights: FlightRow[] | null | undefined,
): string {
    if (!flights || flights.length === 0) {
        return "No flights found";
    }

    const lines: string[] = [];

    for (const flight of flights) {
        const first = flight.segments?.[0];
        const last = flight.segments?.[flight.segments.length - 1];

        lines.push(
            [
                "Flight",
                `ID: ${flight.id}`,
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
                        ? `${flight.price} ${flight.currency ?? ""}`.trim()
                        : "Unknown"
                }`,
                `- Notes: ${flight.notes ?? "None"}`,
                `- Confirmed: ${flight.is_confirmed ? "Yes" : "No"}`,
            ].join("\n"),
        );
    }

    return lines.join("\n\n");
}
