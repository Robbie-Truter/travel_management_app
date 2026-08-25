import { SupabaseClient } from "@supabase/supabase-js";
import type { FlightRow, FlightSegment } from "../../../../src/db/types.ts";

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

export interface InsertFlightSegmentParams {
    airline: string;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: string;
    arrivalTime: string;
    departureTimezone?: string;
    arrivalTimezone?: string;
}

export interface InsertFlightParams {
    tripId: number;
    userId: string;
    tripCountryId: number;
    destinationId: number;
    segments: InsertFlightSegmentParams[];
    description?: string;
    price?: number;
    currency?: string;
    bookingLink?: string;
    notes?: string;
    isConfirmed?: boolean;
}

// Inserts a flight with one or more segments.
// Validates that destination_id belongs to the given trip_country_id.
export const insertFlight = async function (
    supabase: SupabaseClient,
    params: InsertFlightParams,
): Promise<FlightRow> {
    const {
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
    } = params;

    // Validate destination belongs to the given trip_country_id AND trip,
    // so a mismatched trip/trip_country pair can never be persisted.
    const { data: dest, error: destError } = await supabase
        .from("destinations")
        .select("id, trip_country_id, name")
        .eq("id", destinationId)
        .eq("trip_country_id", tripCountryId)
        .eq("trip_id", tripId)
        .single();

    if (destError || !dest) {
        throw new Error(
            `destination_id ${destinationId} does not belong to trip_country_id ${tripCountryId}.`,
        );
    }

    // Map to the FlightSegment shape stored in JSONB
    const flightSegments: FlightSegment[] = segments.map((s) => ({
        airline: s.airline,
        flightNumber: s.flightNumber,
        departureAirport: s.departureAirport,
        arrivalAirport: s.arrivalAirport,
        departureTime: s.departureTime,
        arrivalTime: s.arrivalTime,
        ...(s.departureTimezone
            ? { departureTimezone: s.departureTimezone }
            : {}),
        ...(s.arrivalTimezone ? { arrivalTimezone: s.arrivalTimezone } : {}),
    }));

    const { data, error } = await supabase
        .from("flights")
        .insert({
            trip_id: tripId,
            user_id: userId,
            trip_country_id: tripCountryId,
            destination_id: destinationId,
            segments: flightSegments,
            description: description ?? null,
            price: price ?? 0,
            currency: currency ?? "USD",
            booking_link: bookingLink ?? null,
            notes: notes ?? null,
            is_confirmed: isConfirmed ?? false,
            created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

    if (error) {
        throw new Error(`Error inserting flight: ${error.message}`);
    }

    return data as FlightRow;
};
