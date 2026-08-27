import airports from "../../../../public/data/airports.json" with {
    type: "json",
};

export type AirportLookup = {
    iata: string;
    name: string;
    city: string;
    country: string;
    lat?: number;
    lng?: number;
    tz?: string;
};

export function searchAirports(query: string): AirportLookup[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return [];
    }

    return airports
        .filter((airport) =>
            airport.iata.toLowerCase() === normalizedQuery ||
            airport.name.toLowerCase().includes(normalizedQuery) ||
            airport.city.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, 10);
}
