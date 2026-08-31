import { SupabaseClient } from "@supabase/supabase-js";
import type { AccommodationRow } from "../../../../src/db/types.ts";

export interface UpdateAccommodationParams {
    id: number;
    trip_country_id?: number;
    destination_id?: number;
    name?: string;
    type?: "hotel" | "airbnb" | "hostel" | "resort" | "other";
    platform?:
        | "booking.com"
        | "airbnb"
        | "expedia"
        | "agoda"
        | "trip.com"
        | "hotels.com"
        | "direct"
        | "other";
    location?: string;
    check_in?: string;
    check_out?: string;
    check_in_after?: string;
    check_out_before?: string;
    price?: number;
    currency?: string;
    booking_link?: string;
    notes?: string;
    is_confirmed?: boolean;
}

// Fetches accomodation records from Supabase for given trip ID(s).
export const getAccommodations = async function (
    supabase: SupabaseClient,
    tripIds: number | number[],
): Promise<AccommodationRow[]> {
    const ids = Array.isArray(tripIds) ? tripIds : [tripIds];

    if (ids.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("accommodations")
        .select(`*`)
        .in("trip_id", ids)
        .order("check_in", { ascending: true });

    if (error) {
        throw new Error(`Error fetching accommodations: ${error.message}`);
    }

    return (data as AccommodationRow[]) ?? [];
};

export interface InsertAccommodationParams {
    tripId: number;
    userId: string;
    tripCountryId?: number;
    destinationId?: number;
    name: string;
    type: string;
    platform?: string;
    location: string;
    checkIn: string;
    checkOut: string;
    checkInAfter?: string;
    checkOutBefore?: string;
    price?: number;
    currency?: string;
    bookingLink?: string;
    notes?: string;
    isConfirmed?: boolean;
}

// Inserts a new accommodation record for a trip.
export const insertAccommodation = async function (
    supabase: SupabaseClient,
    params: InsertAccommodationParams,
): Promise<AccommodationRow> {
    const {
        tripId,
        userId,
        tripCountryId,
        destinationId,
        name,
        type,
        platform,
        location,
        checkIn,
        checkOut,
        checkInAfter,
        checkOutBefore,
        price,
        currency,
        bookingLink,
        notes,
        isConfirmed,
    } = params;

    const { data, error } = await supabase
        .from("accommodations")
        .insert({
            trip_id: tripId,
            user_id: userId,
            trip_country_id: tripCountryId ?? null,
            destination_id: destinationId ?? null,
            name,
            type: type ?? "hotel",
            platform: platform ?? null,
            location,
            check_in: checkIn,
            check_out: checkOut,
            check_in_after: checkInAfter ?? null,
            check_out_before: checkOutBefore ?? null,
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
        throw new Error(`Error inserting accommodation: ${error.message}`);
    }

    return data as AccommodationRow;
};

export const deleteAccommodation = async function (
    supabase: SupabaseClient,
    id: number,
): Promise<AccommodationRow> {
    const { data, error } = await supabase
        .from("accommodations")
        .delete()
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        throw new Error(`Error deleting accommodation: ${error.message}`);
    }

    return data as AccommodationRow;
};

export const updateAccommodation = async function (
    supabase: SupabaseClient,
    params: UpdateAccommodationParams,
): Promise<AccommodationRow> {
    const { id } = params;

    const patch: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
        if (key !== "id" && value !== undefined) {
            patch[key] = value;
        }
    }

    if (Object.keys(patch).length === 0) {
        // Fetch existing record and return it if no fields were passed to update
        const { data: existing, error: fetchError } = await supabase
            .from("accommodations")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !existing) {
            throw new Error(`Accommodation with id ${id} not found.`);
        }
        return existing as AccommodationRow;
    }

    const { data, error } = await supabase
        .from("accommodations")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        throw new Error(`Error updating accommodation: ${error.message}`);
    }

    return data as AccommodationRow;
};
