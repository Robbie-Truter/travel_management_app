import airlines from "../../../../public/data/airlines.json" with {
    type: "json",
};

export type AirlineLookup = {
    id: string;
    name: string;
    logo: string;
};

export function searchAirlines(query: string): AirlineLookup[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return [];
    }

    return airlines
        .filter((airline) =>
            airline.name.toLowerCase().includes(normalizedQuery) ||
            airline.id.toLowerCase() === normalizedQuery
        )
        .slice(0, 10);
}
