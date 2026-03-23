/**
 * Groq AI Service — Primary provider (ultra-fast inference)
 * Model: llama-3.3-70b-versatile
 * Free tier: 14,400 requests/day
 */

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqResponse {
  choices: { message: { content: string } }[];
}

export async function callGroq(
  messages: GroqMessage[],
  maxTokens = 600
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Groq API error (${res.status}): ${error}`);
  }

  const data: GroqResponse = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
