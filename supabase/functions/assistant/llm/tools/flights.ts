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
};
