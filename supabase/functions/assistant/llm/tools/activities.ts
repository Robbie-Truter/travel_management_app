import type { ToolDefinition } from "./types.ts";
import { buildActivitiesContext } from "../../context/activities.ts";
import { getActivities } from "../../services/activities.ts";
import { insertActivity } from "../../services/activities.ts";

// Function definitions for gemini
export const activitiesRegistry: Record<string, ToolDefinition> = {
    get_activities: {
        declaration: {
            name: "get_activities",
            description:
                "Returns the activities for the currently selected trip(s).",
        },

        execute: async ({ supabase, tripIds }) => {
            const activities = await getActivities(supabase, tripIds);
            return buildActivitiesContext(activities);
        },
    },

    insert_activity: {
        declaration: {
            name: "insert_activity",
            description:
                "Adds an activity to a trip. Before calling this you must have: " +
                "(1) called get_destinations to get destination_id and trip_country_id, " +
                "(2) called get_trip_countries to get the trip_country_id if needed.",
            parameters: {
                type: "OBJECT",
                properties: {
                    trip_id: {
                        type: "NUMBER",
                        description: "The trip ID this activity belongs to.",
                    },
                    trip_country_id: {
                        type: "NUMBER",
                        description:
                            "The trip_country_id this activity belongs to (from get_trip_countries or get_destinations).",
                    },
                    destination_id: {
                        type: "NUMBER",
                        description:
                            "The destination ID this activity is linked to (from get_destinations).",
                    },
                    name: {
                        type: "STRING",
                        description:
                            "The activity name (e.g. 'Eiffel Tower visit').",
                    },
                    date: {
                        type: "STRING",
                        description:
                            "Activity date in ISO 8601 format (e.g. '2025-06-15').",
                    },
                    type: {
                        type: "STRING",
                        description:
                            "Optional activity type (e.g. 'tour', 'museum', 'restaurant').",
                    },
                    link: {
                        type: "STRING",
                        description:
                            "Optional URL for more information about the activity.",
                    },
                    notes: {
                        type: "STRING",
                        description:
                            "Optional free-text notes about the activity.",
                    },
                    duration: {
                        type: "INTEGER",
                        description: "Optional activity duration in minutes.",
                    },
                    cost: {
                        type: "NUMBER",
                        description: "Optional activity cost. Defaults to 0.",
                    },
                    currency: {
                        type: "STRING",
                        description:
                            "Currency code for the cost (e.g. 'USD', 'EUR'). Defaults to 'USD'.",
                    },
                    is_confirmed: {
                        type: "BOOLEAN",
                        description:
                            "Whether the activity is confirmed. Defaults to false.",
                    },
                },
                required: [
                    "trip_id",
                    "trip_country_id",
                    "destination_id",
                    "name",
                    "date",
                ],
            },
        },

        execute: async ({ supabase, tripIds, userId }, args) => {
            const tripId = tripIds[0];
            const tripCountryId = args["trip_country_id"] as number;
            const destinationId = args["destination_id"] as number;
            const name = args["name"] as string;
            const date = args["date"] as string;
            const type = args["type"] as string | undefined;
            const link = args["link"] as string | undefined;
            const notes = args["notes"] as string | undefined;
            const duration = args["duration"] as number | undefined;
            const cost = args["cost"] as number | undefined;
            const currency = args["currency"] as string | undefined;
            const is_confirmed = args["is_confirmed"] as boolean | undefined;

            const inserted = await insertActivity(supabase, {
                trip_id: tripId,
                user_id: userId,
                trip_country_id: tripCountryId,
                destination_id: destinationId,
                name,
                date,
                type,
                link,
                notes,
                duration,
                cost,
                currency,
                is_confirmed,
            });

            return `Successfully added activity "${inserted.name}" to trip ${tripId}. Activity ID: ${inserted.id}.`;
        },
    },
};
