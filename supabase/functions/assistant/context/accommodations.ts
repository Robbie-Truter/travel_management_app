import type { AccommodationRow } from "../../../../src/db/types.ts";

// Builds AI context string from a list of trip country records.
export function buildAccommodationsContext(
    accommodations: AccommodationRow[] | null | undefined,
): string {
    if (!accommodations || accommodations.length === 0) {
        return "No accommodations found";
    }

    const lines: string[] = [];

    for (const accommodation of accommodations) {
        lines.push(
            [
                "Accommodation",
                `- ID: ${accommodation.id}`,
                `- Trip ID: ${accommodation.trip_id}`,
                `- Trip Country ID: ${accommodation.trip_country_id}`,
                `- Name: ${accommodation.name ?? "Unknown"}`,
                `- Location: ${accommodation.location ?? "Unknown"}`,
                `- Type: ${accommodation.type ?? "Unknown"}`,
                `- Platform: ${accommodation.platform ?? "Unknown"}`,
                `- Check-in: ${accommodation.check_in ?? "Unknown"}`,
                `- Check-out: ${accommodation.check_out ?? "Unknown"}`,
                `- Price: ${accommodation.price ?? "Unknown"}`,
                `- Currency: ${accommodation.currency ?? "Unknown"}`,
                `- Booking link: ${accommodation.booking_link ?? "Unknown"}`,
                `- Notes: ${accommodation.notes ?? "Unknown"}`,
                `- Is confirmed: ${accommodation.is_confirmed ?? "Unknown"}`,
            ].join("\n"),
        );
    }

    return lines.join("\n\n");
}
