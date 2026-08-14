import type { ToolDefinition } from "./types.ts";
import { buildAccommodationsContext } from "../../context/accommodations.ts";
import { getAccommodations } from "../../services/accommodations.ts";

// Function definitions for gemini
export const accommodationsRegistry: Record<string, ToolDefinition> = {
    get_accommodations: {
        declaration: {
            name: "get_accommodations",
            description:
                "Returns the accommodations for the currently selected trip(s).",
        },

        execute: async ({ supabase, tripIds }) => {
            const accommodations = await getAccommodations(supabase, tripIds);
            return buildAccommodationsContext(accommodations);
        },
    },
};
