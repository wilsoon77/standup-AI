import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getGitHubToken,
  fetchGitHubActivity,
  getRealGitHubUsername,
} from "@/lib/github";
import { generateStreamingStandup } from "@/lib/ai";
import { db } from "@/lib/db";
import { standups } from "@/lib/db/schema";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { RateLimiter, getIP } from "@/lib/rate-limit";

const RequestSchema = z.object({
  date: z.string(),
  tone: z.enum(["formal", "casual", "humor"]),
  repos: z.array(z.string()).optional(),
});

// Permitimos 15 standups generados por usuario cada 24 horas (protege créditos)
const standupLimiter = new RateLimiter(15, 24 * 60 * 60 * 1000);
// Filtro adicional por IP para prevenir abusos agresivos (ej. 30 peticiones/día por IP global)
const ipLimiter = new RateLimiter(30, 24 * 60 * 60 * 1000);

// ─── POST: Generate a new standup ────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req);
    const ipCheck = ipLimiter.check(ip);
    if (!ipCheck.success) {
      return NextResponse.json(
        { error: "Demasiadas peticiones desde esta IP. Intenta mañana." },
        { status: 429 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Rate limit estricto por cuenta de usuario (evita que drenen créditos compartiendo cuenta)
    const { success, limit, remaining } = standupLimiter.check(session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de standups diarios (15/día). Intenta mañana." },
        { status: 429, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } }
      );
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { date, tone, repos } = parsed.data;

    const token = await getGitHubToken(session.user.id);
    if (!token) {
      return NextResponse.json(
        { error: "Token de GitHub no encontrado" },
        { status: 400 }
      );
    }

    const rawUsername = session.user.githubUsername ?? session.user.name ?? "";
    const username = await getRealGitHubUsername(token, rawUsername);

    const activity = await fetchGitHubActivity(
      token,
      username,
      date,
      date,
      repos
    );

    try {
      // Returns a streaming response
      const streamResponse = await generateStreamingStandup(
        activity,
        tone,
        date,
        session.user.id,
        repos
      );
      return streamResponse;
    } catch (e: any) {
      if (e.message.includes("Sin actividad")) {
        return NextResponse.json(
          { error: "No se encontró actividad en GitHub para este periodo." },
          { status: 400 }
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("Standup generation error:", error);
    return NextResponse.json(
      { error: "Error al generar el standup" },
      { status: 500 }
    );
  }
}

// ─── GET: Fetch standup history ──────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const history = await db
      .select()
      .from(standups)
      .where(eq(standups.userId, session.user.id))
      .orderBy(desc(standups.createdAt))
      .limit(50);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Error al obtener historial" },
      { status: 500 }
    );
  }
}
