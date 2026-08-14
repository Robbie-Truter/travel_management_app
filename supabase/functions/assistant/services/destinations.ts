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
