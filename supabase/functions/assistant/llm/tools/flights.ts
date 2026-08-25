import { getFlights, insertFlight } from "../../services/flights.ts";
import { searchAirports } from "../../services/airport.ts";
import { type AirlineLookup, searchAirlines } from "../../services/airlines.ts";
import { type AirportLookup } from "../../services/airport.ts";
import { buildFlightsContext } from "../../context/flights.ts";
import type { ToolDefinition } from "./types.ts";

// Resolves an airport argument to a canonical lookup record, enforcing a real
// 3-letter IATA code that exists in the reference data.
const resolveAirport = (raw: string, field: string): AirportLookup => {
    const iata = raw.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(iata)) {
        throw new Error(
            `${field} "${raw}" is not a valid IATA code (expected 3 letters, e.g. 'CDG').`,
        );
    }

    const airport = searchAirports(iata).find((a) => a.iata === iata);

    if (!airport) {
        throw new Error(
            `${field} "${iata}" was not found in the airport reference data. Call search_airports first.`,
        );
    }

    return airport;
};

// Resolves an airline argument to a canonical lookup record by exact id match.
const resolveAirline = (raw: string, field: string): AirlineLookup => {
    const id = raw.trim().toLowerCase();
    const airline = searchAirlines(id).find((a) => a.id.toLowerCase() === id);

    if (!airline) {
        throw new Error(
            `${field} "${raw}" was not found in the airline reference data. Call search_airlines first.`,
        );
    }

    return airline;
};

// Parses an ISO 8601 datetime or throws with a segment-scoped message.
const parseSegmentDatetime = (
    value: string,
    field: string,
    label: string,
): number => {
    const ms = Date.parse(value);

    if (Number.isNaN(ms)) {
        throw new Error(
            `${label}: ${field} "${value}" is not a valid ISO 8601 datetime.`,
        );
    }

    return ms;
};

// Function definitions for gemini
export const flightsRegistry: Record<string, ToolDefinition> = {
    get_flights: {
        declaration: {
            name: "get_flights",
            description:
                "Returns the user's flights for the currently selected trip(s).",
        },

        execute: async ({ supabase, tripIds }) => {
            const flights = await getFlights(supabase, tripIds);
            return buildFlightsContext(flights);
        },
    },

    search_airports: {
        declaration: {
            name: "search_airports",
            description:
                "Searches the airport reference list by IATA code, airport name, or city name. " +
                "Returns IATA codes and timezone info needed for insert_flight. " +
                "Call this for both the departure and arrival airports before inserting a flight.",
            parameters: {
                type: "OBJECT",
                properties: {
                    query: {
                        type: "STRING",
                        description:
                            "IATA code (e.g. 'CDG'), airport name, or city name to search for.",
                    },
                },
                required: ["query"],
            },
        },

        execute: (_ctx, args) => {
            const query = args["query"] as string;
            const results = searchAirports(query);

            if (results.length === 0) {
                return Promise.resolve(
                    `No airports found matching "${query}". Try a different spelling or IATA code.`,
                );
            }

            const lines = results.map((a) =>
                [
                    `- iata: ${a.iata}`,
                    `name: ${a.name}`,
                    `city: ${a.city}`,
                    `country: ${a.country}`,
                    a.tz ? `tz: ${a.tz}` : null,
                ]
                    .filter(Boolean)
                    .join(" | ")
            );

            return Promise.resolve(
                `Airports matching "${query}":\n${lines.join("\n")}`,
            );
        },
    },

    search_airlines: {
        declaration: {
            name: "search_airlines",
            description:
                "Searches the airline reference list by airline name or IATA code. " +
                "Returns the airline id/code needed for the flight segment. " +
                "Call this before inserting a flight to get the correct airline identifier.",
            parameters: {
                type: "OBJECT",
                properties: {
                    query: {
                        type: "STRING",
                        description:
                            "Airline name (e.g. 'Air France') or IATA code (e.g. 'AF') to search for.",
                    },
                },
                required: ["query"],
            },
        },

        execute: (_ctx, args) => {
            const query = args["query"] as string;
            const results = searchAirlines(query);

            if (results.length === 0) {
                return Promise.resolve(
                    `No airlines found matching "${query}". Try a different spelling or code.`,
                );
            }

            const lines = results.map((a) => `- id: ${a.id} | name: ${a.name}`);

            return Promise.resolve(
                `Airlines matching "${query}":\n${lines.join("\n")}`,
            );
        },
    },

    insert_flight: {
        declaration: {
            name: "insert_flight",
            description:
                "Adds a flight (with one or more segments) to a trip destination. " +
                "Before calling this you must have: " +
                "(1) called get_destinations to get destination_id and trip_country_id — a destination must already exist for the trip country, " +
                "(2) called search_airports for departure and arrival airports to get IATA codes and timezones, " +
                "(3) called search_airlines to get the airline id.",
            parameters: {
                type: "OBJECT",
                properties: {
                    trip_country_id: {
                        type: "NUMBER",
                        description:
                            "The trip_countries ID this flight belongs to (from get_destinations or get_trip_countries).",
                    },
                    destination_id: {
                        type: "NUMBER",
                        description:
                            "The destination ID this flight is linked to (from get_destinations). " +
                            "The destination must belong to the specified trip_country_id.",
                    },
                    segments: {
                        type: "ARRAY",
                        description:
                            "One or more flight segments. Use multiple segments for connecting flights.",
                        items: {
                            type: "OBJECT",
                            properties: {
                                airline: {
                                    type: "STRING",
                                    description:
                                        "Airline id/code from search_airlines (e.g. 'AF').",
                                },
                                flight_number: {
                                    type: "STRING",
                                    description:
                                        "Flight number (e.g. 'AF123').",
                                },
                                departure_airport: {
                                    type: "STRING",
                                    description:
                                        "Departure IATA code from search_airports (e.g. 'CDG').",
                                },
                                arrival_airport: {
                                    type: "STRING",
                                    description:
                                        "Arrival IATA code from search_airports (e.g. 'NRT').",
                                },
                                departure_time: {
                                    type: "STRING",
                                    description:
                                        "Departure datetime in ISO 8601 format (e.g. '2025-06-15T10:30:00').",
                                },
                                arrival_time: {
                                    type: "STRING",
                                    description:
                                        "Arrival datetime in ISO 8601 format (e.g. '2025-06-16T06:45:00').",
                                },
                                departure_timezone: {
                                    type: "STRING",
                                    description:
                                        "Timezone of departure airport from search_airports tz field (e.g. 'Europe/Paris'). Recommended.",
                                },
                                arrival_timezone: {
                                    type: "STRING",
                                    description:
                                        "Timezone of arrival airport from search_airports tz field (e.g. 'Asia/Tokyo'). Recommended.",
                                },
                            },
                            required: [
                                "airline",
                                "departure_airport",
                                "arrival_airport",
                                "departure_time",
                                "arrival_time",
                            ],
                        },
                    },
                    description: {
                        type: "STRING",
                        description:
                            "Optional short description or label for this flight (e.g. 'Outbound to Tokyo').",
                    },
                    price: {
                        type: "NUMBER",
                        description:
                            "Optional total flight price. Defaults to 0.",
                    },
                    currency: {
                        type: "STRING",
                        description:
                            "Currency code for the price (e.g. 'USD', 'EUR'). Defaults to 'USD'.",
                    },
                    booking_link: {
                        type: "STRING",
                        description:
                            "Optional URL for the booking confirmation.",
                    },
                    notes: {
                        type: "STRING",
                        description:
                            "Optional free-text notes about the flight.",
                    },
                    is_confirmed: {
                        type: "BOOLEAN",
                        description:
                            "Whether the flight is confirmed/booked. Defaults to false.",
                    },
                },
                required: [
                    "trip_country_id",
                    "destination_id",
                    "segments",
                ],
            },
        },

        execute: async ({ supabase, tripIds, userId }, args) => {
            const tripId = tripIds[0];
            const tripCountryId = args["trip_country_id"] as number;
            const destinationId = args["destination_id"] as number;
            const rawSegments = args["segments"] as Record<string, unknown>[];
            const description = args["description"] as string | undefined;
            const price = args["price"] as number | undefined;
            const currency = args["currency"] as string | undefined;
            const bookingLink = args["booking_link"] as string | undefined;
            const notes = args["notes"] as string | undefined;
            const isConfirmed = args["is_confirmed"] as boolean | undefined;

            if (!Array.isArray(rawSegments) || rawSegments.length === 0) {
                throw new Error("At least one flight segment is required.");
            }

            const segments = rawSegments.map((s, i) => {
                const label = `Segment ${i + 1}`;
                if (
                    typeof s["airline"] !== "string" ||
                    typeof s["departure_airport"] !== "string" ||
                    typeof s["arrival_airport"] !== "string" ||
                    typeof s["departure_time"] !== "string" ||
                    typeof s["arrival_time"] !== "string"
                ) {
                    throw new Error(
                        `${label} is missing required fields.`,
                    );
                }

                const departureAirport = resolveAirport(
                    s["departure_airport"],
                    `${label} departure_airport`,
                );
                const arrivalAirport = resolveAirport(
                    s["arrival_airport"],
                    `${label} arrival_airport`,
                );
                const airline = resolveAirline(
                    s["airline"],
                    `${label} airline`,
                );

                const departureTime = s["departure_time"];
                const arrivalTime = s["arrival_time"];
                const departureMs = parseSegmentDatetime(
                    departureTime,
                    "departure_time",
                    label,
                );
                const arrivalMs = parseSegmentDatetime(
                    arrivalTime,
                    "arrival_time",
                    label,
                );

                if (arrivalMs < departureMs) {
                    throw new Error(
                        `${label}: arrival_time (${arrivalTime}) is before departure_time (${departureTime}).`,
                    );
                }

                return {
                    airline: airline.id,
                    flightNumber: (s["flight_number"] as string | undefined)?.trim() ?? "",
                    departureAirport: departureAirport.iata,
                    arrivalAirport: arrivalAirport.iata,
                    departureTime,
                    arrivalTime,
                    departureTimezone: s["departure_timezone"] as
                        | string
                        | undefined,
                    arrivalTimezone: s["arrival_timezone"] as
                        | string
                        | undefined,
                };
            });

            const inserted = await insertFlight(supabase, {
                tripId,
                userId,
                tripCountryId,
                destinationId,
                segments,
                description,
                price,
                currency,
                bookingLink,
                notes,
                isConfirmed,
            });

            const first = inserted.segments?.[0];
            const last = inserted.segments?.[inserted.segments.length - 1];
            const route = first && last
                ? `${first.departureAirport} → ${last.arrivalAirport}`
                : "unknown route";

            return (
                `Successfully added flight "${
                    inserted.description ?? route
                }" ` +
                `(${inserted.segments.length} segment(s), ${route}) ` +
                `to destination ${destinationId}. Flight ID: ${inserted.id}.`
            );
        },
    },
};
