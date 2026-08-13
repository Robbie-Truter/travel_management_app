import { SupabaseClient } from "@supabase/supabase-js";
import type { TripCountryRow } from "../../../../src/db/types.ts";

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
