import type { ActivityRow } from "../../../../src/db/types.ts";

// Builds AI context string from a list of trip country records.
export function buildActivitiesContext(
    activities: ActivityRow[] | null | undefined,
): string {
    if (!activities || activities.length === 0) {
        return "No activities found";
    }

    const lines: string[] = [];

    for (const activity of activities) {
        lines.push(
            [
                "Activity",
                `- ID: ${activity.id}`,
                `- Trip ID: ${activity.trip_id}`,
                `- Trip Country ID: ${activity.trip_country_id}`,
                `- Destination ID: ${activity.destination_id ?? "Unknown"}`,
                `- Name: ${activity.name ?? "Unknown"}`,
                `- Date: ${activity.date ?? "Unknown"}`,
                `- Type: ${activity.type ?? "Unknown"}`,
                `- Link: ${activity.link ?? "Unknown"}`,
                `- Notes: ${activity.notes ?? "Unknown"}`,
                `- Duration: ${activity.duration ?? "Unknown"}`,
                `- Price: ${activity.cost ?? "Unknown"}`,
                `- Is confirmed: ${activity.is_confirmed ?? "Unknown"}`,
            ].join("\n"),
        );
    }

    return lines.join("\n\n");
}
