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
