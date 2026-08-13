import { getDestinations } from "../../services/destinations.ts";
import { buildDestinationsContext } from "../../context/destinations.ts";
import type { ToolDefinition } from "./types.ts";

// Function definitions for gemini
export const destinationsRegistry: Record<string, ToolDefinition> = {
    get_destinations: {
        declaration: {
            name: "get_destinations",
            description:
                "Returns the destinations for the currently selected trip(s).",
        },

        execute: async ({ supabase, tripIds }) => {
            const destinations = await getDestinations(supabase, tripIds);
            return buildDestinationsContext(destinations);
        },
    },
};
