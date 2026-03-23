"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  commits: { sha: string; message: string; repo: string; url: string; date: string }[];
  pullRequests: { title: string; state: string; repo: string; url: string; updatedAt: string }[];
  issues: { title: string; state: string; repo: string; url: string; updatedAt: string }[];
}

interface Props {
  activity: Activity;
  loading: boolean;
  totalCount: number;
}

export function ActivityPreview({ activity, loading, totalCount }: Props) {
  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            Cargando actividad de GitHub...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            No se encontró actividad en GitHub para esta fecha.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Actividad detectada
          <Badge variant="secondary" className="text-[10px] font-normal ml-1">
            {totalCount} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Commits */}
        {activity.commits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Commits ({activity.commits.length})
            </div>
            <ul className="space-y-1">
              {activity.commits.slice(0, 8).map((c) => (
                <li
                  key={c.sha}
                  className="text-sm flex items-start gap-2 py-1 px-2 rounded-md hover:bg-secondary/30 transition-colors"
                >
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono shrink-0 mt-0.5"
                  >
                    {c.repo}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {c.message}
                  </span>
                </li>
              ))}
              {activity.commits.length > 8 && (
                <li className="text-xs text-muted-foreground/60 pl-2">
                  ...y {activity.commits.length - 8} más
                </li>
              )}
            </ul>
          </div>
        )}

        {/* PRs */}
        {activity.pullRequests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-chart-2" />
              Pull Requests ({activity.pullRequests.length})
            </div>
            <ul className="space-y-1">
              {activity.pullRequests.slice(0, 5).map((pr) => (
                <li
                  key={pr.url}
                  className="text-sm flex items-start gap-2 py-1 px-2 rounded-md hover:bg-secondary/30 transition-colors"
                >
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono shrink-0 mt-0.5"
                  >
                    {pr.repo}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {pr.title}
                  </span>
                  <Badge
                    variant={pr.state === "open" ? "default" : "secondary"}
                    className="text-[10px] shrink-0 mt-0.5"
                  >
                    {pr.state}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Issues */}
        {activity.issues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-chart-3" />
              Issues ({activity.issues.length})
            </div>
            <ul className="space-y-1">
              {activity.issues.slice(0, 5).map((issue) => (
                <li
                  key={issue.url}
                  className="text-sm flex items-start gap-2 py-1 px-2 rounded-md hover:bg-secondary/30 transition-colors"
                >
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono shrink-0 mt-0.5"
                  >
                    {issue.repo}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {issue.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
