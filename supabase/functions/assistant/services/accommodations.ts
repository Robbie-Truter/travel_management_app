import { SupabaseClient } from "@supabase/supabase-js";
import type { AccommodationRow } from "../../../../src/db/types.ts";

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
