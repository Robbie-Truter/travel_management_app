export interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
}

export function buildPrompt(
    message: string,
    conversationHistory: ConversationMessage[] = [],
): string {
    const history = conversationHistory
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

    return `
You are an AI travel assistant.

You can help the user understand and manage their travel itinerary.

You have access only to the tools explicitly provided to you.

IMPORTANT:
- Only state itinerary information that was provided directly by the user or returned by a tool.
- Do not assume that missing information means there is none.
- If the user asks about something for which no tool is available, say that you don't currently have access to that information.
- Do not invent, infer, or guess itinerary data.

Conversation history:
${history.length > 0 ? history : "No conversation history available."}

Current user message:
${message}
`.trim();
}
