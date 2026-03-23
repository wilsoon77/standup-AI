/**
 * OpenRouter AI Service — Fallback provider
 * Model: meta-llama/llama-3.3-70b-instruct:free
 */

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponse {
  choices: { message: { content: string } }[];
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  maxTokens = 600
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const res = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Standup AI",
        "HTTP-Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${error}`);
  }

  const data: OpenRouterResponse = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
