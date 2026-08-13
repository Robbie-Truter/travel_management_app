import { getTripCountries } from "../../services/tripCountries.ts";
import { buildTripCountriesContext } from "../../context/tripCountries.ts";
import type { ToolDefinition } from "./types.ts";

// Function definitions for gemini
export const tripCountriesRegistry: Record<string, ToolDefinition> = {
    get_trip_countries: {
        declaration: {
            name: "get_trip_countries",
            description:
                "Returns the countries for the currently selected trip(s).",
        },

        execute: async ({ supabase, tripIds }) => {
            const tripCountries = await getTripCountries(supabase, tripIds);
            return buildTripCountriesContext(tripCountries);
        },
    },
};
