const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.5-flash";

export async function generateWithGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            data.error?.message ??
            `Gemini request failed (${response.status})`
        );
    }

    const data = await response.json();

    if (data.error) {
    throw new Error(data.error.message);
}

    const candidate = data.candidates?.[0];

    if (!candidate) {
        throw new Error("Gemini returned no candidates.");
    }

    if (
        candidate.finishReason &&
        candidate.finishReason !== "STOP"
    ) {
        throw new Error(
            `Gemini finished with reason: ${candidate.finishReason}`
        );
    }

    const text = candidate.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }

    return text;
}