// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = withSupabase({ auth: "user" }, async (req, ctx) => {
  try {
    const { data: trips, error: tripsError } = await ctx.supabase
      .from("trips")
      .select("id, name");

    const {
      data: { user },
      error: userError,
    } = await ctx.supabase.auth.getUser();

    return Response.json(
      {
        user: user?.email || null,
        trips,
        error: tripsError || userError,
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
