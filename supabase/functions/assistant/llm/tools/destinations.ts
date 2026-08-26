import {
    getDestinations,
    insertDestination,
    deleteDestination,
    searchCityLookup,
} from "../../services/destinations.ts";
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

    search_city_lookup: {
        declaration: {
            name: "search_city_lookup",
            description:
                "Searches the city reference table by city name to find a valid city_lookup_id. " +
                "Optionally scope the search to a specific country using country_id (from search_country_lookup). " +
                "Call this before insert_destination to resolve the correct city_lookup_id.",
            parameters: {
                type: "OBJECT",
                properties: {
                    query: {
                        type: "STRING",
                        description:
                            "City name to search for (e.g. 'Paris', 'Tokyo', 'New York').",
                    },
                    country_id: {
                        type: "NUMBER",
                        description:
                            "Optional country_lookup ID to narrow results to a specific country.",
                    },
                },
                required: ["query"],
            },
        },

        execute: async ({ supabase }, args) => {
            const query = args["query"] as string;
            const countryId = args["country_id"] as number | undefined;

            const results = await searchCityLookup(supabase, query, countryId);

            if (results.length === 0) {
                const scope = countryId ? ` in country_id ${countryId}` : "";
                return `No cities found matching "${query}"${scope}. Try a different spelling or broaden the search.`;
            }

            const lines = results.map((c) =>
                [
                    `- id: ${c.id}`,
                    `name: ${c.city ?? c.city_ascii}`,
                    `country: ${c.country}`,
                    `iso2: ${c.iso2}`,
                    c.admin_name ? `region: ${c.admin_name}` : null,
                    c.capital ? `capital: ${c.capital}` : null,
                ]
                    .filter(Boolean)
                    .join(" | ")
            );

            return `Cities matching "${query}":\n${lines.join("\n")}`;
        },
    },

    insert_destination: {
        declaration: {
            name: "insert_destination",
            description: "Adds a destination to a trip country in the currently selected trip. " +
                "Before calling this you must have: " +
                "(1) called search_country_lookup to get the country_id, " +
                "(2) called get_trip_countries to get the trip_country_id, " +
                "(3) optionally called search_city_lookup to get the city_lookup_id.",
            parameters: {
                type: "OBJECT",
                properties: {
                    trip_country_id: {
                        type: "NUMBER",
                        description:
                            "The trip_countries ID for the country this destination belongs to (from get_trip_countries).",
                    },
                    country_id: {
                        type: "NUMBER",
                        description:
                            "The country_lookup ID for this destination (from search_country_lookup).",
                    },
                    name: {
                        type: "STRING",
                        description:
                            "The display name of the destination (e.g. 'Eiffel Tower', 'Shibuya Crossing').",
                    },
                    city_lookup_id: {
                        type: "NUMBER",
                        description:
                            "Optional city_lookup ID for the city this destination is in (from search_city_lookup).",
                    },
                },
                required: ["trip_country_id", "country_id", "name"],
            },
        },

        execute: async ({ supabase, tripIds, userId }, args) => {
            const tripId = tripIds[0];
            const tripCountryId = args["trip_country_id"] as number;
            const countryId = args["country_id"] as number;
            const name = args["name"] as string;
            const cityLookupId = args["city_lookup_id"] as number | undefined;

            const inserted = await insertDestination(supabase, {
                tripId,
                userId,
                tripCountryId,
                countryId,
                name,
                cityLookupId,
            });

            return (
                `Successfully added destination "${inserted.name}" ` +
                `to trip ${tripId} (trip_country_id: ${inserted.trip_country_id}). ` +
                `Destination ID: ${inserted.id}.`
            );
        },
    },

    delete_destination: {
        declaration: {
            name: "delete_destination",
            description:
                "Removes a destination (and all its linked activities, accommodations, and flights) from the currently selected trip. " +
                "Call get_destinations first to confirm the correct destination_id before deleting. " +
                "This action is irreversible.",
            parameters: {
                type: "OBJECT",
                properties: {
                    destination_id: {
                        type: "NUMBER",
                        description:
                            "The destination ID to delete (from get_destinations).",
                    },
                },
                required: ["destination_id"],
            },
        },

        execute: async ({ supabase, tripIds }, args) => {
            const tripId = tripIds[0];
            const destinationId = args["destination_id"] as number;

            const deleted = await deleteDestination(
                supabase,
                destinationId,
                tripId,
            );

            return (
                `Successfully removed destination "${deleted.name}" ` +
                `(destination_id: ${deleted.id}, trip_country_id: ${deleted.trip_country_id}) ` +
                `from trip ${tripId}. All linked data has been deleted.`
            );
        },
    },
};
