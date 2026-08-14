import { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityRow } from "../../../../src/db/types.ts";

// Fetches activity records from Supabase for given trip ID(s).
export const getActivities = async function (
    supabase: SupabaseClient,
    tripIds: number | number[],
): Promise<ActivityRow[]> {
    const ids = Array.isArray(tripIds) ? tripIds : [tripIds];

    if (ids.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("activities")
        .select(`*`)
        .in("trip_id", ids)
        .order("date", { ascending: true });
    if (error) {
        throw new Error(`Error fetching activities: ${error.message}`);
    }

    return (data as ActivityRow[]) ?? [];
};
