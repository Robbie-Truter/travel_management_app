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
