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
  timezoneOffset: z.string().optional(),
  tone: z.enum(["formal", "casual", "humor"]),
  repos: z.array(z.string()).optional(),
  isGuest: z.boolean().optional(),
});

// Permitimos 15 standups generados por usuario cada 24 horas (protege créditos)
const standupLimiter = new RateLimiter(15, 24 * 60 * 60 * 1000);
// Filtro estricto por IP para invitados (solo 3 peticiones/día)
const guestIpLimiter = new RateLimiter(3, 24 * 60 * 60 * 1000);
// Filtro IP global anti-abuso (30 peticiones/día)
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
    const isGuestUser = !session?.user?.id;

    if (isGuestUser) {
      // Bloqueo más agresivo para invitados (evitar consumo de la API gratis)
      // COMENTADO PARA PRUEBAS:
      /*
      const guestCheck = guestIpLimiter.check(ip);
      if (!guestCheck.success) {
        return NextResponse.json(
          { error: "Los usuarios invitados solo pueden generar 3 standups diarios por red. Inicia sesión en GitHub para más límite." },
          { status: 429 }
        );
      }
      */
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { date, tone, repos, isGuest, timezoneOffset } = parsed.data;

    // Reject if client claims to be guest but session exists, or vice-versa manually bypass
    if (isGuestUser && !isGuest) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let token: string | null = null;
    let username = "";
    let formattedRepos = repos;

    if (!isGuestUser) {
      // Flujo de usuario autenticado
      
      // COMENTADO PARA PRUEBAS:
      /*
      const { success, limit, remaining } = standupLimiter.check(session.user!.id);
      if (!success) {
        return NextResponse.json(
          { error: "Has alcanzado el límite de standups diarios (15/día). Intenta mañana." },
          { status: 429, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } }
        );
      }
      */

      token = await getGitHubToken(session.user!.id);
      if (!token) {
        return NextResponse.json({ error: "Token de GitHub no encontrado" }, { status: 400 });
      }

      const rawUsername = session.user!.githubUsername ?? session.user!.name ?? "";
      username = await getRealGitHubUsername(token, rawUsername);
    } else {
      // Flujo de usuario INVITADO
      if (!repos || repos.length === 0 || !repos[0]) {
        return NextResponse.json({ error: "Los invitados deben ingresar la URL de un repositorio público." }, { status: 400 });
      }

      const repoInput = repos[0].trim();
      const githubUrlMatch = repoInput.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
      
      if (githubUrlMatch) {
        username = githubUrlMatch[1];
        formattedRepos = [githubUrlMatch[2].replace(".git", "")];
      } else if (repoInput.includes("/")) {
        const parts = repoInput.split("/");
        username = parts[0];
        formattedRepos = [parts[1]];
      } else {
        return NextResponse.json({ error: "Formato inválido. Usa 'usuario/repo' o una URL de GitHub." }, { status: 400 });
      }

      // Opsional: Usar token de servidor si está configurado para evitar rate limit de GitHub de 60/hr
      token = process.env.GITHUB_GUEST_TOKEN || null;
    }

    const activity = await fetchGitHubActivity(
      token,
      username,
      date,
      date,
      formattedRepos,
      isGuestUser,
      timezoneOffset
    );

    try {
      // Returns a streaming response
      const streamResponse = await generateStreamingStandup(
        activity,
        tone,
        date,
        isGuestUser ? "GUEST" : session.user!.id,
        formattedRepos,
        isGuestUser // Flag to know if we should save to DB
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
