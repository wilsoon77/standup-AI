"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface Standup {
  id: string;
  content: string;
  tone: string;
  repos: string | null;
  dateRange: string;
  aiProvider: string | null;
  createdAt: number;
}

interface Props {
  history: Standup[];
}

export function HistoryList({ history }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (history.length === 0) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-12 text-center">
          <div className="space-y-3">
            <div className="text-4xl">📝</div>
            <p className="text-muted-foreground text-sm">
              Aún no has generado ningún standup.
            </p>
            <p className="text-muted-foreground/60 text-xs">
              Ve al dashboard y genera tu primer daily.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 stagger-children">
      {history.map((standup) => {
        const repos = standup.repos ? JSON.parse(standup.repos) : [];
        const isCopied = copiedId === standup.id;

        return (
          <Card
            key={standup.id}
            className="glass border-border/50 hover:border-border/70 transition-colors"
          >
            <CardContent className="py-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">
                    {standup.dateRange}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {standup.tone === "formal"
                      ? "📋 Formal"
                      : standup.tone === "casual"
                        ? "💬 Casual"
                        : "😄 Humor"}
                  </Badge>
                  {standup.aiProvider && standup.aiProvider !== "fallback" && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal"
                    >
                      vía {standup.aiProvider}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(standup.content, standup.id)}
                  className="text-xs cursor-pointer shrink-0"
                >
                  {isCopied ? "✓ Copiado" : "Copiar"}
                </Button>
              </div>

              {/* Content preview */}
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-4">
                {standup.content}
              </p>

              {/* Repos tags */}
              {repos.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {repos.map((repo: string) => (
                    <Badge
                      key={repo}
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {repo}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <p className="text-[10px] text-muted-foreground/50">
                Generado el{" "}
                {new Date(standup.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
