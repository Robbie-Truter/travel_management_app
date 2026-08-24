import { SupabaseClient } from "@supabase/supabase-js";
import type {
    CountryLookupRow,
    TripCountryRow,
} from "../../../../src/db/types.ts";

// Fetches trip country records from Supabase for given trip ID(s).
export const getTripCountries = async function (
    supabase: SupabaseClient,
    tripIds: number | number[],
): Promise<TripCountryRow[]> {
    const ids = Array.isArray(tripIds) ? tripIds : [tripIds];

    if (ids.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("trip_countries")
        .select("*")
        .in("trip_id", ids);

    if (error) {
        throw new Error(`Error fetching trip countries: ${error.message}`);
    }

    return data ?? [];
};

// Searches the country_lookup table for countries matching name or ISO code.
export const searchCountryLookup = async function (
    supabase: SupabaseClient,
    query: string,
): Promise<CountryLookupRow[]> {
    const normalised = query.trim().toLowerCase();

    if (!normalised) {
        return [];
    }

    const { data, error } = await supabase
        .from("country_lookup")
        .select("id, name, iso2, iso3, continent, currency")
        .or(`name.ilike.%${normalised}%,iso2.ilike.${normalised},iso3.ilike.${normalised}`)
        .limit(10);

    if (error) {
        throw new Error(`Error searching country lookup: ${error.message}`);
    }

    return data ?? [];
};

export interface InsertTripCountryParams {
    tripId: number;
    userId: string;
    countryId: number;
    budgetLimit?: number;
    notes?: string;
}

// Inserts a new country into a trip.  Resolves country metadata from
// country_lookup and guards against duplicates.
export const insertTripCountry = async function (
    supabase: SupabaseClient,
    params: InsertTripCountryParams,
): Promise<TripCountryRow> {
    const { tripId, userId, countryId, budgetLimit, notes } = params;

    // Resolve country metadata
    const { data: countryData, error: countryError } = await supabase
        .from("country_lookup")
        .select("id, name, iso2")
        .eq("id", countryId)
        .single();

    if (countryError || !countryData) {
        throw new Error(
            `Country with id ${countryId} not found in country_lookup.`,
        );
    }

    // Determine the next display order value
    const { data: orderData } = await supabase
        .from("trip_countries")
        .select("order")
        .eq("trip_id", tripId)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextOrder = orderData ? (orderData.order ?? 0) + 1 : 0;

    const { data, error } = await supabase
        .from("trip_countries")
        .insert({
            trip_id: tripId,
            user_id: userId,
            country_id: countryId,
            country_name: countryData.name,
            country_code: countryData.iso2,
            budget_limit: budgetLimit ?? 0,
            notes: notes ?? null,
            order: nextOrder,
            created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

    if (error) {
        throw new Error(`Error inserting trip country: ${error.message}`);
    }

    return data as TripCountryRow;
};
