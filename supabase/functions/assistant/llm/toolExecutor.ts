import { toolRegistry } from "./tools/tools.ts";
import { SupabaseClient } from "@supabase/supabase-js";

export type ToolContext = {
    supabase: SupabaseClient;
    tripIds: number[];
};

export const executeTool = async (
    name: string,
    ctx: ToolContext,
    args: Record<string, unknown>,
): Promise<string> => {
    const tool = toolRegistry[name];

    if (!tool) {
        throw new Error(
            `Gemini requested unavailable tool "${name}". ` +
                `Available tools: ${Object.keys(toolRegistry).join(", ")}`,
        );
    }

    return await tool.execute(ctx, args);
};
