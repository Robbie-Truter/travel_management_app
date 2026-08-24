import {
    getTripCountries,
    insertTripCountry,
    searchCountryLookup,
} from "../../services/tripCountries.ts";
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

    search_country_lookup: {
        declaration: {
            name: "search_country_lookup",
            description:
                "Searches the country reference table by name or ISO code to find a valid country_id. " +
                "Call this before insert_trip_country to resolve the correct country_id.",
            parameters: {
                type: "OBJECT",
                properties: {
                    query: {
                        type: "STRING",
                        description:
                            "Country name or ISO 2/3 code to search for (e.g. 'France', 'FR', 'FRA').",
                    },
                },
                required: ["query"],
            },
        },

        execute: async ({ supabase }, args) => {
            const query = args["query"] as string;
            const results = await searchCountryLookup(supabase, query);

            if (results.length === 0) {
                return `No countries found matching "${query}". Try a different spelling or ISO code.`;
            }

            const lines = results.map((c) =>
                `- id: ${c.id} | name: ${c.name} | iso2: ${c.iso2}${c.iso3 ? ` | iso3: ${c.iso3}` : ""}${c.continent ? ` | continent: ${c.continent}` : ""}`
            );

            return `Countries matching "${query}":\n${lines.join("\n")}`;
        },
    },

    insert_trip_country: {
        declaration: {
            name: "insert_trip_country",
            description:
                "Adds a country to the currently selected trip. " +
                "You must call search_country_lookup first to obtain the correct country_id. " +
                "Only one trip may be active when calling this tool.",
            parameters: {
                type: "OBJECT",
                properties: {
                    country_id: {
                        type: "NUMBER",
                        description:
                            "The country_lookup ID obtained from search_country_lookup.",
                    },
                    budget_limit: {
                        type: "NUMBER",
                        description:
                            "Optional budget limit for this country in the trip's base currency. Defaults to 0.",
                    },
                    notes: {
                        type: "STRING",
                        description:
                            "Optional free-text notes about this country in the trip.",
                    },
                },
                required: ["country_id"],
            },
        },

        execute: async ({ supabase, tripIds, userId }, args) => {
            const tripId = tripIds[0];
            const countryId = args["country_id"] as number;
            const budgetLimit = args["budget_limit"] as number | undefined;
            const notes = args["notes"] as string | undefined;

            const inserted = await insertTripCountry(supabase, {
                tripId,
                userId,
                countryId,
                budgetLimit,
                notes,
            });

            return (
                `Successfully added country "${inserted.country_name}" (${inserted.country_code}) ` +
                `to trip ${tripId}. Trip-Country ID: ${inserted.id}.`
            );
        },
    },
};
