/**
 * Unified AI Service — Orchestrates Groq (primary) + OpenRouter (fallback)
 * Generates daily standup text from GitHub activity data.
 */

import type { GitHubActivity } from "@/lib/github";
import { callGroq } from "./groq";
import { callOpenRouter } from "./openrouter";

export type Tone = "formal" | "casual" | "humor";

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  formal: `Usa un tono profesional y conciso. Estructura: qué hice, qué haré, bloqueos.
Sin emojis. Directo al punto, como para un equipo corporativo.`,
  casual: `Usa un tono amigable y conversacional. Puedes usar primera persona informal.
Breve, humano, como si lo escribieras tú mismo rápido para tu equipo.`,
  humor: `Usa un tono con humor ligero y autodescriptivo. Puedes añadir un comentario gracioso
sobre algún commit o PR. Incluye 1-2 emojis relevantes. Que sea divertido pero informativo.`,
};

export interface GenerateStandupResult {
  content: string;
  provider: "groq" | "openrouter" | "fallback";
}

export async function generateStandup(
  activity: GitHubActivity,
  tone: Tone,
  date: string,
  username: string
): Promise<GenerateStandupResult> {
  const activitySummary = buildActivitySummary(activity);

  // If no activity, return a canned response
  if (!activitySummary.trim()) {
    return {
      content:
        tone === "humor"
          ? "Hoy no hay commits que reportar... pero estuve pensando mucho (en serio). 🤔"
          : "Sin actividad registrada para el período seleccionado.",
      provider: "fallback",
    };
  }

  const systemPrompt = `Eres un asistente que genera daily standups para desarrolladores de software.
Genera un daily standup en español basado en la actividad de GitHub proporcionada.
${TONE_INSTRUCTIONS[tone]}

El standup debe seguir esta estructura (adáptala al tono):
- ¿Qué hice? (basado en commits y PRs)
- ¿Qué voy a hacer? (inferir próximos pasos lógicos)
- ¿Hay bloqueos? (solo si hay evidencia en los datos, si no, omitir)

Importante: sé concreto con los nombres de repos y tareas reales.
No inventes nada que no esté en la actividad proporcionada.
Responde SOLO con el texto del standup, sin explicaciones adicionales.`;

  const userPrompt = `Fecha: ${date}
Usuario: ${username}

Actividad registrada en GitHub:
${activitySummary}`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];

  // Try Groq first (faster, higher rate limit)
  try {
    const content = await callGroq(messages);
    if (content) {
      return { content, provider: "groq" };
    }
  } catch (error) {
    console.warn("Groq failed, falling back to OpenRouter:", error);
  }

  // Fallback to OpenRouter
  try {
    const content = await callOpenRouter(messages);
    if (content) {
      return { content, provider: "openrouter" };
    }
  } catch (error) {
    console.error("OpenRouter also failed:", error);
  }

  // Both failed
  return {
    content:
      "No se pudo generar el standup en este momento. Por favor, intenta de nuevo en unos minutos.",
    provider: "fallback",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function buildActivitySummary(activity: GitHubActivity): string {
  const lines: string[] = [];

  if (activity.commits.length > 0) {
    lines.push("COMMITS:");
    activity.commits.forEach((c) => {
      lines.push(`  - [${c.repo}] ${c.message}`);
    });
  }

  if (activity.pullRequests.length > 0) {
    lines.push("\nPULL REQUESTS:");
    activity.pullRequests.forEach((pr) => {
      lines.push(`  - [${pr.repo}] ${pr.title} (${pr.state})`);
    });
  }

  if (activity.issues.length > 0) {
    lines.push("\nISSUES INVOLUCRADAS:");
    activity.issues.forEach((i) => {
      lines.push(`  - [${i.repo}] ${i.title} (${i.state})`);
    });
  }

  return lines.join("\n");
}
