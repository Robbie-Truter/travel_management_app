import "edge-runtime";
import { withSupabase } from "@supabase/server";
import { generateWithGemini } from "./llm/gemini.ts";
import type { ToolContext } from "./llm/toolExecutor.ts";
import { buildPrompt } from "./llm/buildPrompt.ts";
import {
    addConversationMessage,
    getConversationMessages,
    getOrCreateConversation,
} from "./services/conversations.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

const handler = withSupabase({ auth: "user" }, async (req, ctx) => {
    try {
        const { userClaims } = ctx;

        if (!userClaims) {
            throw new Error("User is not authenticated.");
        }

        // Request body
        const { message, tripIds } = await req.json();

        // Validate that the user is authorised to access the trips
        const { data, error } = await ctx.supabase
            .from("trips")
            .select("id")
            .in("id", tripIds)
            .eq("user_id", userClaims.id);

        if (error || !data || data.length !== tripIds.length) {
            return Response.json({ error: "Unauthorized" }, {
                status: 403,
                headers: corsHeaders,
            });
        }

        // Basic body validation
        if (!Array.isArray(tripIds) || tripIds.length === 0) {
            throw new Error("tripIds must be a non-empty array");
        }

        if (typeof message !== "string") {
            throw new Error("message must be a string");
        }

        // Add conversation messages
        const conversationId = await getOrCreateConversation(
            ctx.supabase,
            tripIds[0],
            userClaims.id,
        );

        // Build prompt for gemini
        const currentPrompt = buildPrompt(message);

        const toolCtx: ToolContext = {
            supabase: ctx.supabase,
            tripIds,
            userId: userClaims.id,
        };

        // Retrieve previous conversation history, if any
        const historicalMessages = await getConversationMessages(
            ctx.supabase,
            conversationId,
        );

        // Get AI response
        const geminiResponse = await generateWithGemini(
            currentPrompt,
            historicalMessages,
            toolCtx,
        );

        await addConversationMessage(
            ctx.supabase,
            conversationId,
            "user",
            message,
        );
        await addConversationMessage(
            ctx.supabase,
            conversationId,
            "assistant",
            geminiResponse,
        );

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
