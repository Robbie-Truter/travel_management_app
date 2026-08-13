import { getFlights } from "../../services/flights.ts";
import { buildFlightsContext } from "../../context/flights.ts";
import type { ToolDefinition } from "./types.ts";

// Function definitions for gemini
export const flightsRegistry: Record<string, ToolDefinition> = {
    get_flights: {
        declaration: {
            name: "get_flights",
            description:
                "Returns the user's flights for the currently selected trip(s).",
        },

        execute: async ({ supabase, tripIds }) => {
            const flights = await getFlights(supabase, tripIds);
            return buildFlightsContext(flights);
        },
    },
    /*add_flight: {
        declaration: {
            name: "add_flight",
            description: "Adds a flight to the user's itinerary.",
            parameters: {
                type: "OBJECT",
                properties: {
                    airline: { type: "string" },
                    destination: { type: "string" },
                    departureTime: { type: "string" },
                    arrivalTime: { type: "string" },
                    departureAirport: { type: "string" },
                    arrivalAirport: { type: "string" },
                },
                required: [
                    "airline",
                    "destination",
                    "departureTime",
                    "arrivalTime",
                    "departureAirport",
                    "arrivalAirport",
                ],
            },
        },

        execute: async ({ supabase, tripIds }, args) => {
            return await addFlight(supabase, tripIds, args);
        },
    },*/
};
