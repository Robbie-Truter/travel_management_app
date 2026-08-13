import type { DestinationWithDetails } from "../services/destinations.ts";

// Builds AI context string from a list of destinations.
export function buildDestinationsContext(
    destinations: DestinationWithDetails[] | null | undefined,
): string {
    if (!destinations || destinations.length === 0) {
        return "No destinations found";
    }

    const lines: string[] = [];

    for (const dest of destinations) {
        const cityInfo = dest.city_lookup?.city ?? "Unknown";
        const countryInfo = dest.trip_countries?.country_name ?? "Unknown";
        lines.push(
            [
                `Destination: ${dest.name}`,
                `- Destination ID: ${dest.id}`,
                `- Trip ID: ${dest.trip_id}`,
                `- Trip Country ID: ${dest.trip_country_id}`,
                `- Order: ${dest.order ?? "N/A"}`,
                `- City: ${cityInfo}`,
                `- Country: ${countryInfo}`,
            ].join("\n"),
        );
    }

    return lines.join("\n\n");
}
