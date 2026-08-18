import { type Content, GoogleGenAI, type Part } from "@google/genai";
import { executeTool, type ToolContext } from "./toolExecutor.ts";
import { tools } from "./tools/tools.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.5-flash";

export async function generateWithGemini(
    prompt: string,
    historicalMessages: {
        role: "user" | "assistant";
        content: string;
    }[],
    ctx: ToolContext,
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
    }

    // Generation config with function declaration
    const configTools = {
        tools: tools,
    };

    const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
    });

    // Prompt for the model
    const contents: Content[] = [
        ...historicalMessages.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [
                {
                    text: msg.content,
                },
            ],
        })),
        {
            role: "user",
            parts: [
                {
                    text: prompt,
                },
            ],
        },
    ];

    // Limit the number of iterations to prevent infinite loops
    let iterations = 0;
    const MAX_ITERATIONS = 10;

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        // Send request with function declarations
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: contents,
            config: configTools,
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0];

            const { name, args } = functionCall;

            if (!name) {
                throw new Error(
                    "Gemini returned a function call without a name.",
                );
            }

            // Call the function and get the response.
            const toolResponse = await executeTool(name, ctx, args ?? {});

            const modelContent = response.candidates?.[0]?.content;

            if (!modelContent) {
                throw new Error(
                    "Gemini response did not contain model content.",
                );
            }

            contents.push(modelContent);

            const functionResponsePart: Part = {
                functionResponse: {
                    name,
                    response: {
                        result: toolResponse,
                    },
                    id: functionCall.id,
                },
            };

            contents.push({
                role: "user",
                parts: [functionResponsePart],
            });
        } else {
            const text = response.text;

            if (!text) {
                throw new Error("Gemini returned an empty response.");
            }

            return text;
        }
    }

    throw new Error("Gemini exceeded the maximum number of tool calls.");
}
