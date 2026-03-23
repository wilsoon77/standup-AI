import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  fetchGitHubActivity,
  fetchUserRepos,
  getGitHubToken,
  getRealGitHubUsername,
} from "@/lib/github";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const isGuest = !session?.user?.id;

    const { searchParams } = new URL(req.url);
    const since =
      searchParams.get("since") ?? new Date().toISOString().split("T")[0];
    const until = searchParams.get("until") ?? since;
    const tz = searchParams.get("tz") ?? undefined;
    const repos = searchParams.get("repos")?.split(",").filter(Boolean);

    let token: string | null = null;
    let username = "";
    let finalRepos = repos;

    if (!isGuest) {
      token = await getGitHubToken(session.user!.id);
      if (!token) {
        return NextResponse.json(
          { error: "Token de GitHub no encontrado. Intenta cerrar sesión y volver a iniciar." },
          { status: 400 }
        );
      }
      const rawUsername = session.user!.githubUsername ?? session.user!.name ?? "";
      username = await getRealGitHubUsername(token, rawUsername);
    } else {
      token = process.env.GITHUB_GUEST_TOKEN || null;
      if (!repos || repos.length === 0 || !repos[0]) {
        return NextResponse.json({ error: "Falta proporcionar un repositorio." }, { status: 400 });
      }
      
      const repoInput = repos[0].trim();
      const githubUrlMatch = repoInput.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
      if (githubUrlMatch) {
        username = githubUrlMatch[1];
        finalRepos = [githubUrlMatch[2].replace(".git", "")];
      } else if (repoInput.includes("/")) {
        const parts = repoInput.split("/");
        username = parts[0];
        finalRepos = [parts[1]];
      } else {
        return NextResponse.json({ error: "Formato de repositorio inválido." }, { status: 400 });
      }
    }

    const [activity, userRepos] = await Promise.all([
      fetchGitHubActivity(token, username, since, until, finalRepos, isGuest, tz),
      isGuest ? Promise.resolve([]) : fetchUserRepos(token),
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
