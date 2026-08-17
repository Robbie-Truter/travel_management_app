import type { SupabaseClient } from "@supabase/supabase-js";

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
