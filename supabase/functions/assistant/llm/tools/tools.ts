import { flightsRegistry } from "./flights.ts";
import type { ToolDefinition } from "./types.ts";

// Combine registries from all tool files
export const toolRegistry: Record<string, ToolDefinition> = {
    ...flightsRegistry,
};

// Formats the tool declarations for Gemini's request structure
export const tools = [
    {
        functionDeclarations: Object.values(toolRegistry).map(
            (tool) => tool.declaration,
        ),
    },
];
