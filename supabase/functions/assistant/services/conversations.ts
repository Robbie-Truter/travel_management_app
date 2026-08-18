import type { SupabaseClient } from "@supabase/supabase-js";

// Adds a single message to a conversation via the RPC function.
export async function addConversationMessage(
    supabase: SupabaseClient,
    conversationId: number,
    role: "user" | "assistant",
    content: string,
): Promise<void> {
    const { error } = await supabase.rpc("add_conversation_message", {
        p_conversation_id: conversationId,
        p_role: role,
        p_content: content,
    });

    if (error) {
        throw new Error(`Error adding conversation message: ${error.message}`);
    }
}

// Fetches the messages of a conversation in chronological order.
export async function getConversationMessages(
    supabase: SupabaseClient,
    conversationId: number,
): Promise<
    Array<{
        role: "user" | "assistant";
        content: string;
    }>
> {
    const { data, error } = await supabase
        .from("conversation_messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(
            `Error fetching conversation messages: ${error.message}`,
        );
    }

    return data ?? [];
}

// Finds the conversation id for a trip, or null if none exists.
const getConversation = async (
    supabase: SupabaseClient,
    tripId: number,
): Promise<number | null> => {
    const { data, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("trip_id", tripId)
        .maybeSingle();

    if (error) {
        throw new Error(`Error fetching conversation: ${error.message}`);
    }

    return data?.id ?? null;
};

// Resolves the conversation for a trip, creating it if it doesn't exist yet.
export const getOrCreateConversation = async (
    supabase: SupabaseClient,
    tripId: number,
    userId: string,
): Promise<number> => {
    const conversationId = await getConversation(supabase, tripId);

    if (conversationId !== null) {
        return conversationId;
    }

    return insertConversation(supabase, tripId, userId);
};

// Creates a new conversation for a trip and returns its id.
const insertConversation = async (
    supabase: SupabaseClient,
    tripId: number,
    userId: string,
): Promise<number> => {
    const { data, error } = await supabase
        .from("conversations")
        .insert({
            trip_id: tripId,
            user_id: userId,
        })
        .select("id")
        .single();

    if (error) {
        throw new Error(`Error inserting conversation: ${error.message}`);
    }

    if (!data?.id) {
        throw new Error(`Error inserting conversation`);
    }

    return data.id;
};
