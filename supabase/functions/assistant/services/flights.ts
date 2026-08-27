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

// Deletes a flight by its ID, scoped to the given trip for safety.
export const deleteFlight = async function (
    supabase: SupabaseClient,
    flightId: number,
    tripId: number,
): Promise<FlightRow> {
    // Fetch first so we can return a useful confirmation message.
    const { data: existing, error: fetchError } = await supabase
        .from("flights")
        .select("*")
        .eq("id", flightId)
        .eq("trip_id", tripId)
        .single();

    if (fetchError || !existing) {
        throw new Error(
            `flight_id ${flightId} does not belong to trip ${tripId} or does not exist.`,
        );
    }

    const { error } = await supabase
        .from("flights")
        .delete()
        .eq("id", flightId)
        .eq("trip_id", tripId);

    if (error) {
        throw new Error(`Error deleting flight: ${error.message}`);
    }

    return existing as FlightRow;
};

export interface UpdateFlightParams {
    tripCountryId?: number;
    destinationId?: number;
    description?: string;
    segments?: InsertFlightSegmentParams[];
    price?: number;
    currency?: string;
    bookingLink?: string;
    notes?: string;
    isConfirmed?: boolean;
}

// Partially updates a flight record. Only provided fields are changed.
// If segments are supplied they fully replace the existing segments array.
export const updateFlight = async function (
    supabase: SupabaseClient,
    flightId: number,
    tripId: number,
    params: UpdateFlightParams,
): Promise<FlightRow> {
    // Verify the flight belongs to this trip before updating.
    const { data: existing, error: fetchError } = await supabase
        .from("flights")
        .select("*")
        .eq("id", flightId)
        .eq("trip_id", tripId)
        .single();

    if (fetchError || !existing) {
        throw new Error(
            `flight_id ${flightId} does not belong to trip ${tripId} or does not exist.`,
        );
    }

    const patch: Record<string, unknown> = {};

    const finalTripCountryId = params.tripCountryId !== undefined
        ? params.tripCountryId
        : existing.trip_country_id;
    const finalDestinationId = params.destinationId !== undefined
        ? params.destinationId
        : existing.destination_id;

    if (
        params.tripCountryId !== undefined || params.destinationId !== undefined
    ) {
        if (finalDestinationId) {
            // Validate destination belongs to the trip_country_id AND trip
            const { data: dest, error: destError } = await supabase
                .from("destinations")
                .select("id, trip_country_id, name")
                .eq("id", finalDestinationId)
                .eq("trip_country_id", finalTripCountryId)
                .eq("trip_id", tripId)
                .single();

            if (destError || !dest) {
                throw new Error(
                    `destination_id ${finalDestinationId} does not belong to trip_country_id ${finalTripCountryId} for trip ${tripId}.`,
                );
            }
        }
    }

    if (params.tripCountryId !== undefined) {
        patch.trip_country_id = params.tripCountryId;
    }
    if (params.destinationId !== undefined) {
        patch.destination_id = params.destinationId;
    }
    if (params.description !== undefined) {
        patch.description = params.description;
    }
    if (params.price !== undefined) patch.price = params.price;
    if (params.currency !== undefined) patch.currency = params.currency;
    if (params.bookingLink !== undefined) {
        patch.booking_link = params.bookingLink;
    }
    if (params.notes !== undefined) patch.notes = params.notes;
    if (params.isConfirmed !== undefined) {
        patch.is_confirmed = params.isConfirmed;
    }

    if (params.segments !== undefined && params.segments.length > 0) {
        patch.segments = params.segments.map((s) => ({
            airline: s.airline,
            flightNumber: s.flightNumber,
            departureAirport: s.departureAirport,
            arrivalAirport: s.arrivalAirport,
            departureTime: s.departureTime,
            arrivalTime: s.arrivalTime,
            ...(s.departureTimezone
                ? { departureTimezone: s.departureTimezone }
                : {}),
            ...(s.arrivalTimezone
                ? { arrivalTimezone: s.arrivalTimezone }
                : {}),
        })) as FlightSegment[];
    }

    if (Object.keys(patch).length === 0) {
        return existing as FlightRow;
    }

    const { data, error } = await supabase
        .from("flights")
        .update(patch)
        .eq("id", flightId)
        .eq("trip_id", tripId)
        .select("*")
        .single();

    if (error) {
        throw new Error(`Error updating flight: ${error.message}`);
    }

    return data as FlightRow;
};
