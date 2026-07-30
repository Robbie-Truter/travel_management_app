// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { PostgrestError } from "https://esm.sh/@supabase/supabase-js";

type FetchError = PostgrestError | null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const throwIfError = (...errors: { label: string; error: FetchError }[]) => {
  for (const { label, error } of errors) {
    if (error) {
      throw new Error(`Error fetching ${label}: ${error.message}`);
    }
  }
}

const handler = withSupabase({ auth: "user" }, async (req, ctx) => {
  try {
    // Request body
    const { message, tripIds } = await req.json();

    // Basic body validation
    if (!Array.isArray(tripIds)) {
      throw new Error("tripIds must be an array");
    }

    if (typeof message !== "string") {
      throw new Error("message must be a string");
    }

    // Fetch user defined data concurrently
    const [
      tripsResult,
      activitiesResult,
      flightsResult,
      accommodationsResult,
      documentsResult,
    ] = await Promise.all([
      ctx.supabase.from("trips").select("*").in("id", tripIds),
      ctx.supabase.from("activities").select("*").in("trip_id", tripIds),
      ctx.supabase.from("flights").select("*").in("trip_id", tripIds),
      ctx.supabase.from("accommodations").select("*").in("trip_id", tripIds),
      ctx.supabase.from("documents").select("*").in("trip_id", tripIds),
    ]);

    // Destructure results
    const { data: trips, error: tripsError } = tripsResult;
    const { data: activities, error: activitiesError } = activitiesResult;
    const { data: flights, error: flightsError } = flightsResult;
    const { data: accommodations, error: accommodationsError } = accommodationsResult;
    const { data: documents, error: documentsError } = documentsResult;

    // Error handling
    throwIfError(
      { label: "trips", error: tripsError },
      { label: "activities", error: activitiesError },
      { label: "flights", error: flightsError },
      { label: "accommodations", error: accommodationsError },
      { label: "documents", error: documentsError },
    );

    // Send response
    return Response.json(
      {
        trips,
        activities: activities || [],
        flights: flights || [],
        accommodations: accommodations || [],
        documents: documents || [],
        message,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return Response.json(
      {
        error: error.message,
      },
      { headers: corsHeaders }
    );
  }
});

export default {
  fetch: async (req, connInfo) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    return handler(req, connInfo);
  },
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/assistant' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
