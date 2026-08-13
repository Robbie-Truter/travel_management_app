import "edge-runtime";
import { withSupabase } from "@supabase/server";
import { generateWithGemini } from "./llm/gemini.ts";
import type { ToolContext } from "./llm/toolExecutor.ts";
import { buildPrompt } from "./llm/prompt.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

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

        // Build prompt for gemini
        const prompt = buildPrompt(message);

        const toolCtx: ToolContext = {
            supabase: ctx.supabase,
            tripIds,
        };

        // Get AI response
        const geminiResponse = await generateWithGemini(prompt, toolCtx);

        return Response.json(
            {
                response: geminiResponse,
            },
            { headers: corsHeaders },
        );
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "An unexpected error occurred.";

        return Response.json(
            {
                error: message,
            },
            {
                status: 500,
                headers: corsHeaders,
            },
        );
    }
});

export default {
    fetch: (req: Request) => {
        if (req.method === "OPTIONS") {
            return new Response("ok", { headers: corsHeaders });
        }

        return handler(req);
    },
};
