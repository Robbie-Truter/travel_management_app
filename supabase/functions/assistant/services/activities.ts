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

    const required = {
        trip_id,
        user_id,
        trip_country_id,
        destination_id,
        name,
        date,
    };
    for (const [key, value] of Object.entries(required)) {
        if (value === undefined || value === null || value === "") {
            throw new Error(
                `Missing required field "${key}" for insert_activity.`,
            );
        }
    }

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

// Deletes an activity by its ID, scoped to the given trip for safety.
export const deleteActivity = async function (
    supabase: SupabaseClient,
    activityId: number,
    tripId: number,
): Promise<ActivityRow> {
    // Fetch first so we can return a useful confirmation message.
    const { data: existing, error: fetchError } = await supabase
        .from("activities")
        .select("*")
        .eq("id", activityId)
        .eq("trip_id", tripId)
        .single();

    if (fetchError || !existing) {
        throw new Error(
            `activity_id ${activityId} does not belong to trip ${tripId} or does not exist.`,
        );
    }

    const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId)
        .eq("trip_id", tripId);

    if (error) {
        throw new Error(`Error deleting activity: ${error.message}`);
    }

    return existing as ActivityRow;
};

export interface UpdateActivityParams {
    name?: string;
    date?: string;
    type?: string;
    link?: string;
    notes?: string;
    duration?: number;
    cost?: number;
    currency?: string;
    is_confirmed?: boolean;
}

// Partially updates an activity record. Only provided fields are changed.
export const updateActivity = async function (
    supabase: SupabaseClient,
    activityId: number,
    tripId: number,
    params: UpdateActivityParams,
): Promise<ActivityRow> {
    // Verify the activity belongs to this trip before updating.
    const { data: existing, error: fetchError } = await supabase
        .from("activities")
        .select("*")
        .eq("id", activityId)
        .eq("trip_id", tripId)
        .single();

    if (fetchError || !existing) {
        throw new Error(
            `activity_id ${activityId} does not belong to trip ${tripId} or does not exist.`,
        );
    }

    const patch: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            patch[key] = value;
        }
    }

    if (Object.keys(patch).length === 0) {
        return existing as ActivityRow;
    }

    const { data, error } = await supabase
        .from("activities")
        .update(patch)
        .eq("id", activityId)
        .eq("trip_id", tripId)
        .select("*")
        .single();

    if (error) {
        throw new Error(`Error updating activity: ${error.message}`);
    }

    return data as ActivityRow;
};
