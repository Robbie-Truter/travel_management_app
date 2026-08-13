import type { ToolDefinition } from "./types.ts";
import { buildActivitiesContext } from "../../context/activities.ts";
import { getActivities } from "../../services/activities.ts";

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
};
