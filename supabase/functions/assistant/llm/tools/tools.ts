import { flightsRegistry } from "./flights.ts";
import { tripCountriesRegistry } from "./tripCountries.ts";
import { destinationsRegistry } from "./destinations.ts";
import type { ToolDefinition } from "./types.ts";

// Combine registries from all tool files
export const toolRegistry: Record<string, ToolDefinition> = {
    ...flightsRegistry,
    ...tripCountriesRegistry,
    ...destinationsRegistry,
};

// Formats the tool declarations for Gemini's request structure
export const tools = [
    {
        functionDeclarations: Object.values(toolRegistry).map(
            (tool) => tool.declaration,
        ),
    },
];
