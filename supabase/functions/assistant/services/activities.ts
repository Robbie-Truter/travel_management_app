import { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityRow } from "../../../../src/db/types.ts";

export interface InsertActivityParams {
    trip_id: number;
    user_id: string;
    trip_country_id: number;
    destination_id: number;
    name: string;
    date: string;
    type?: string;
    link?: string;
    notes?: string;
    duration?: number;
    cost?: number;
    currency?: string;
    image?: string;
    is_confirmed?: boolean;
    order?: number;
}

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

// Inserts a new activity into Supabase.
export const insertActivity = async function (
    supabase: SupabaseClient,
    params: InsertActivityParams,
): Promise<ActivityRow> {
    const {
        trip_id,
        user_id,
        trip_country_id,
        destination_id,
        name,
        date,
        type,
        link,
        notes,
        duration,
        cost,
        currency,
        image,
        is_confirmed,
        order,
    } = params;

    const { data, error } = await supabase
        .from("activities")
        .insert({
            trip_id,
            user_id,
            trip_country_id,
            destination_id,
            name,
            date,
            type,
            link,
            notes,
            duration,
            cost,
            currency: currency ?? "USD",
            image,
            is_confirmed: is_confirmed ?? false,
            order: order ?? 0,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Error inserting activity: ${error.message}`);
    }

    return data as ActivityRow;
};
