import type { TripCountryRow } from "../../../../src/db/types.ts";

// Builds AI context string from a list of trip country records.
export function buildTripCountriesContext(
    tripCountries: TripCountryRow[] | null | undefined,
): string {
    if (!tripCountries || tripCountries.length === 0) {
        return "No countries found";
    }

    const lines: string[] = [];

    for (const country of tripCountries) {
        lines.push(
            [
                "Country",
                `- Trip-Country ID: ${country.id}`,
                `- Country ID: ${country.country_id}`,
                `- Country Name: ${country.country_name ?? "Unknown"}`,
                `- Country Code: ${country.country_code ?? "Unknown"}`,
            ].join("\n"),
        );
    }

    return lines.join("\n\n");
}
