import { SupabaseClient } from "@supabase/supabase-js";
import type {
    CityLookupRow,
    DestinationRow,
    TripCountryRow,
} from "../../../../src/db/types.ts";

export interface DestinationWithDetails extends DestinationRow {
    trip_countries?: TripCountryRow | null;
    city_lookup?: CityLookupRow | null;
}

// Fetches destination records from Supabase for given trip ID(s).
export const getDestinations = async function (
    supabase: SupabaseClient,
    tripIds: number | number[],
): Promise<DestinationWithDetails[]> {
    const ids = Array.isArray(tripIds) ? tripIds : [tripIds];

    if (ids.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("destinations")
        .select(`
        *,
        country_lookup:country_id (
            id,
            name,
            iso2
        )
    `)
        .in("trip_id", ids)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true });
    if (error) {
        throw new Error(`Error fetching destinations: ${error.message}`);
    }

    return (data as DestinationWithDetails[]) ?? [];
};

// Searches city_lookup by city name, optionally scoped to a country.
export const searchCityLookup = async function (
    supabase: SupabaseClient,
    query: string,
    countryId?: number,
): Promise<CityLookupRow[]> {
    const normalised = query.trim().toLowerCase();

    if (!normalised) {
        return [];
    }

    let builder = supabase
        .from("city_lookup")
        .select("id, city, city_ascii, country, iso2, admin_name, capital, country_id, lat, lng")
        .or(`city.ilike.%${normalised}%,city_ascii.ilike.%${normalised}%`);

    if (countryId !== undefined) {
        builder = builder.eq("country_id", countryId);
    }

    const { data, error } = await builder.limit(10);

    if (error) {
        throw new Error(`Error searching city lookup: ${error.message}`);
    }

    return (data as CityLookupRow[]) ?? [];
};

export interface InsertDestinationParams {
    tripId: number;
    userId: string;
    tripCountryId: number;
    countryId: number;
    name: string;
    cityLookupId?: number;
}

// Inserts a new destination into a trip country.
// Validates the trip_country_id belongs to the trip and auto-computes order.
export const insertDestination = async function (
    supabase: SupabaseClient,
    params: InsertDestinationParams,
): Promise<DestinationRow> {
    const { tripId, userId, tripCountryId, countryId, name, cityLookupId } =
        params;

    // Validate trip_country_id belongs to the given trip and country
    const { data: tripCountry, error: tcError } = await supabase
        .from("trip_countries")
        .select("id, country_id, country_name, country_code")
        .eq("id", tripCountryId)
        .eq("trip_id", tripId)
        .eq("country_id", countryId)
        .single();

    if (tcError || !tripCountry) {
        throw new Error(
            `trip_country_id ${tripCountryId} does not belong to trip ${tripId} with country_id ${countryId}.`,
        );
    }

    // Determine next display order within this trip country
    const { data: orderData } = await supabase
        .from("destinations")
        .select("order")
        .eq("trip_country_id", tripCountryId)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextOrder = orderData ? (orderData.order ?? 0) + 1 : 0;

    const { data, error } = await supabase
        .from("destinations")
        .insert({
            trip_id: tripId,
            user_id: userId,
            trip_country_id: tripCountryId,
            country_id: countryId,
            name,
            city_lookup_id: cityLookupId ?? null,
            order: nextOrder,
            created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

    if (error) {
        throw new Error(`Error inserting destination: ${error.message}`);
    }

    return data as DestinationRow;
};
