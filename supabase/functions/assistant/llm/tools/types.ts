import { type ToolContext } from "../toolExecutor.ts";

export type FunctionDeclaration = {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
};

export type ToolDefinition = {
    declaration: FunctionDeclaration;
    execute: (
        ctx: ToolContext,
        args: Record<string, unknown>,
    ) => Promise<string>;
};
