import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────

export interface GitHubActivity {
  commits: Commit[];
  pullRequests: PullRequest[];
  issues: Issue[];
}

export interface Commit {
  sha: string;
  message: string;
  repo: string;
  url: string;
  date: string;
}

export interface PullRequest {
  title: string;
  state: string;
  repo: string;
  url: string;
  updatedAt: string;
}

export interface Issue {
  title: string;
  state: string;
  repo: string;
  url: string;
  updatedAt: string;
}

// ─── Token retrieval ─────────────────────────────────────────────────

export async function getGitHubToken(
  userId: string
): Promise<string | null> {
  const account = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.userId, userId),
      eq(accounts.provider, "github")
    ),
  });

  return account?.access_token ?? null;
}

// ─── GitHub API helpers ──────────────────────────────────────────────

const GITHUB_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

export async function getRealGitHubUsername(token: string, fallback: string): Promise<string> {
  // If fallback has no spaces and is not empty, it MIGHT be the real username.
  // But wait! Play it 100% safe: always fetch the profile if the fallback has spaces,
  // or just fetch it and cache it if we suspect it's a generic "Name Surname".
  if (!fallback || fallback.includes(" ")) {
    try {
      const res = await fetch("https://api.github.com/user", { headers: GITHUB_HEADERS(token) });
      const profile = await res.json();
      return profile.login ?? fallback.replace(/\s+/g, "");
    } catch {
      return fallback.replace(/\s+/g, "");
    }
  }
  return fallback;
}

export async function fetchGitHubActivity(
  token: string,
  username: string,
  since: string,
  until: string,
  repoFilter?: string[]
): Promise<GitHubActivity> {
  const headers = GITHUB_HEADERS(token);

  // Formato seguro de fechas para GitHub Search
  const dateQuery = since === until ? since : `${since}..${until}`;

  // ── Commits ──
  const searchUrl = new URL("https://api.github.com/search/commits");
  searchUrl.searchParams.set(
    "q",
    `author:${username.replace(/\s+/g, "")} committer-date:${dateQuery}`
  );
  searchUrl.searchParams.set("per_page", "50");

  console.log(`Buscando commits: ${searchUrl.toString()}`);

  let commits: Commit[] = [];
  try {
    const res = await fetch(searchUrl.toString(), {
      headers: {
        ...headers,
        Accept: "application/vnd.github.cloak-preview+json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      commits = (data.items ?? [])
        .filter((item: Record<string, unknown>) =>
          repoFilter
            ? repoFilter.includes(
                (item.repository as Record<string, string>).name
              )
            : true
        )
        .map((item: Record<string, unknown>) => ({
          sha: item.sha as string,
          message: (
            (item.commit as Record<string, unknown>)
              .message as string
          )
            .split("\n")[0],
          repo: (item.repository as Record<string, string>).name,
          url: item.html_url as string,
          date: (
            (item.commit as Record<string, unknown>)
              .committer as Record<string, string>
          ).date,
        }));
    }
  } catch (error) {
    console.error("Error fetching commits:", error);
  }

  // ── Pull Requests ──
  const prsUrl = new URL("https://api.github.com/search/issues");
  prsUrl.searchParams.set(
    "q",
    `author:${username.replace(/\s+/g, "")} type:pr updated:${dateQuery}`
  );
  prsUrl.searchParams.set("per_page", "20");

  console.log(`Buscando PRs: ${prsUrl.toString()}`);

  let pullRequests: PullRequest[] = [];
  try {
    const res = await fetch(prsUrl.toString(), { headers });
    if (res.ok) {
      const data = await res.json();
      pullRequests = (data.items ?? []).map(
        (item: Record<string, unknown>) => ({
          title: item.title as string,
          state: item.state as string,
          repo: (item.repository_url as string).split("/").pop(),
          url: item.html_url as string,
          updatedAt: item.updated_at as string,
        })
      );
    }
  } catch (error) {
    console.error("Error fetching PRs:", error);
  }

  // ── Issues ──
  const issuesUrl = new URL("https://api.github.com/search/issues");
  issuesUrl.searchParams.set(
    "q",
    `involves:${username.replace(/\s+/g, "")} type:issue updated:${dateQuery}`
  );
  issuesUrl.searchParams.set("per_page", "10");

  console.log(`Buscando Issues: ${issuesUrl.toString()}`);

  let issues: Issue[] = [];
  try {
    const res = await fetch(issuesUrl.toString(), { headers });
    if (res.ok) {
      const data = await res.json();
      issues = (data.items ?? []).map(
        (item: Record<string, unknown>) => ({
          title: item.title as string,
          state: item.state as string,
          repo: (item.repository_url as string).split("/").pop(),
          url: item.html_url as string,
          updatedAt: item.updated_at as string,
        })
      );
    }
  } catch (error) {
    console.error("Error fetching issues:", error);
  }

  return { commits, pullRequests, issues };
}

// ─── User repos (for filter dropdown) ────────────────────────────────

export async function fetchUserRepos(token: string): Promise<string[]> {
  try {
    const res = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=pushed",
      { headers: GITHUB_HEADERS(token) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data as Record<string, string>[]).map((r) => r.name);
  } catch {
    return [];
  }
}
