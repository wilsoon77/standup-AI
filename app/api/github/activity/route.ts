import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  fetchGitHubActivity,
  fetchUserRepos,
  getGitHubToken,
} from "@/lib/github";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const since =
      searchParams.get("since") ?? new Date().toISOString().split("T")[0];
    const until = searchParams.get("until") ?? since;
    const repos = searchParams.get("repos")?.split(",").filter(Boolean);

    const token = await getGitHubToken(session.user.id);
    if (!token) {
      return NextResponse.json(
        { error: "Token de GitHub no encontrado. Intenta cerrar sesión y volver a iniciar." },
        { status: 400 }
      );
    }

    const username = session.user.githubUsername ?? session.user.name ?? "";

    const [activity, userRepos] = await Promise.all([
      fetchGitHubActivity(token, username, since, until, repos),
      fetchUserRepos(token),
    ]);

    return NextResponse.json({ activity, repos: userRepos });
  } catch (error) {
    console.error("GitHub activity error:", error);
    return NextResponse.json(
      { error: "Error al obtener actividad de GitHub" },
      { status: 500 }
    );
  }
}
