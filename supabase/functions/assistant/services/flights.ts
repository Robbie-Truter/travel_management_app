import { SupabaseClient } from "@supabase/supabase-js";
import type { FlightRow } from "../../../../src/db/types.ts";

// Fetches flight records from Supabase for given trip ID(s).
export const getFlights = async function (
    supabase: SupabaseClient,
    tripIds: number | number[],
): Promise<FlightRow[]> {
    const ids = Array.isArray(tripIds) ? tripIds : [tripIds];

    if (ids.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("flights")
        .select("*")
        .in("trip_id", ids);

    if (error) {
        throw new Error(`Error fetching flights: ${error.message}`);
    }

    return data ?? [];
};

// Adds a flight to the user's itinerary.
export const addFlight = async function (
    supabase: SupabaseClient,
    tripIds: number[],
    args: Record<string, unknown>,
): Promise<string> {
    const {
        airline,
        destinationId,
        departureTime,
        arrivalTime,
        departureAirport,
        arrivalAirport,
    } = args;

    if (
        typeof airline !== "string" ||
        typeof destinationId !== "number" ||
        typeof departureTime !== "string" ||
        typeof arrivalTime !== "string" ||
        typeof departureAirport !== "string" ||
        typeof arrivalAirport !== "string"
    ) {
        return "Missing or invalid flight information.";
    }

    if (tripIds.length === 0) {
        return "No trip selected.";
    }

    const { error } = await supabase
        .from("flights")
        .insert({
            trip_id: tripIds[0],
            destination_id: destinationId,
            segments: [
                {
                    airline,
                    departureAirport,
                    arrivalAirport,
                    departureTime,
                    arrivalTime,
                },
            ],
        });

    if (error) {
        return `Error adding flight: ${error.message}`;
    }

    return "Flight added successfully.";
};
