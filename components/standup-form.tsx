"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ActivityPreview } from "./activity-preview";

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function getTimezoneOffset() {
  const tzo = -new Date().getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num: number) => {
    const norm = Math.floor(Math.abs(num));
    return (norm < 10 ? '0' : '') + norm;
  };
  return dif + pad(tzo / 60) + ':' + pad(tzo % 60);
}

type Tone = "formal" | "casual" | "humor";

interface Activity {
  commits: { sha: string; message: string; repo: string; url: string; date: string }[];
  pullRequests: { title: string; state: string; repo: string; url: string; updatedAt: string }[];
  issues: { title: string; state: string; repo: string; url: string; updatedAt: string }[];
}

interface Props {
  username: string;
  isGuest?: boolean;
}

export function StandupForm({ username, isGuest }: Props) {
  const [tone, setTone] = useState<Tone>("casual");
  const [date, setDate] = useState(getLocalDateString());
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [guestRepoUrl, setGuestRepoUrl] = useState("");
  const [availableRepos, setAvailableRepos] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);

  // Fetch activity preview when date changes
  const fetchPreview = useCallback(async () => {
    if (isGuest && !guestRepoUrl.trim()) {
      setActivity(null);
      return;
    }
    
    setLoadingPreview(true);
    try {
      const params = new URLSearchParams({ 
        since: date, 
        until: date, 
        tz: getTimezoneOffset() 
      });
      
      if (isGuest) {
        params.set("repos", guestRepoUrl.trim());
      } else if (selectedRepos.length > 0) {
        params.set("repos", selectedRepos.join(","));
      }

      const res = await fetch(`/api/github/activity?${params}`);
      if (!res.ok) throw new Error();
      
      const data = await res.json();
      setActivity(data.activity ?? null);
      if (!isGuest) setAvailableRepos(data.repos ?? []);
    } catch {
      setActivity(null);
    } finally {
      setLoadingPreview(false);
    }
  }, [date, selectedRepos, isGuest, guestRepoUrl]);

  // Fetch automatically for logged-in users whenever dependencies change
  useEffect(() => {
    if (!isGuest) fetchPreview();
  }, [fetchPreview, isGuest]);

  // Fetch with debouncing for guests, so typing the URL doesn't spam the API
  useEffect(() => {
    if (!isGuest || !guestRepoUrl.trim()) return;

    const timer = setTimeout(() => {
      fetchPreview();
    }, 800);

    return () => clearTimeout(timer);
  }, [guestRepoUrl, isGuest, fetchPreview]);

  async function handleGenerate() {
    setLoading(true);
    setResult("");
    setProvider("");

    // Auto-scroll to the bottom card
    setTimeout(() => {
      document.getElementById("result-section")?.scrollIntoView({ 
        behavior: "smooth", 
        block: "end" 
      });
    }, 100);

    try {
      const payloadRepos = isGuest 
        ? (guestRepoUrl.trim() ? [guestRepoUrl.trim()] : undefined)
        : (selectedRepos.length > 0 ? selectedRepos : undefined);

      const res = await fetch("/api/standup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          timezoneOffset: getTimezoneOffset(),
          tone,
          repos: payloadRepos,
          isGuest,
        }),
      });

      if (!res.ok) {
        // Handle normal JSON errors from the server 
        const errorData = await res.json().catch(() => null);
        setResult(`Error: ${errorData?.error || "Ocurrió un error inesperado al generar."}`);
        setLoading(false);
        return;
      }

      setProvider("Groq / OpenRouter"); 

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo leer el stream");

      const decoder = new TextDecoder();
      let streamText = "";
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Separar en pedazos muy pequeños para forzar visualización de streaming
          // incluso si la API de Groq responde en 200 milisegundos.
          const chars = chunk.split("");
          for (let i = 0; i < chars.length; i += 2) {
             streamText += chars.slice(i, i + 2).join("");
             setResult(streamText);
             // Ligera pausa visual (approx 60fps)
             await new Promise(r => setTimeout(r, 10)); 
          }
        }
        
        if (done) break;
      }
    } catch {
      setResult("Ocurrió un error al contactar al servidor o leer el texto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleRepo(repo: string) {
    setSelectedRepos((prev) =>
      prev.includes(repo) ? prev.filter((r) => r !== repo) : [...prev, repo]
    );
    setResult(""); // Clear old result
  }

  const totalActivity =
    (activity?.commits.length ?? 0) +
    (activity?.pullRequests.length ?? 0) +
    (activity?.issues.length ?? 0);

  return (
    <div className="space-y-6 stagger-children">
      {/* ─── Configuration Card ──────────────────────────────── */}
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
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
            </svg>
            Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Date picker */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setResult("");
              }}
              className="w-full border border-border/50 rounded-lg px-3 py-2.5 text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>

          {/* Tone selector */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Tono</label>
            <Select 
              value={tone} 
              onValueChange={(v) => {
                setTone(v as Tone);
                setResult("");
              }}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="humor">Con humor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Repo filter */}
          {isGuest ? (
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Repositorio (URL o usuario/repo)</label>
              <input
                type="text"
                placeholder="Ejemplo: microsoft/react o https://github.com/..."
                value={guestRepoUrl}
                onChange={(e) => {
                  setGuestRepoUrl(e.target.value);
                  setResult("");
                }}
                className="w-full border border-border/50 rounded-lg px-3 py-2.5 text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
          ) : availableRepos.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Filtrar por repos{" "}
                <span className="text-muted-foreground/60">(opcional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableRepos.slice(0, 15).map((repo) => (
                  <Badge
                    key={repo}
                    variant={
                      selectedRepos.includes(repo) ? "default" : "secondary"
                    }
                    className={`cursor-pointer text-xs transition-all ${selectedRepos.includes(repo)
                        ? "gradient-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent"
                      }`}
                    onClick={() => toggleRepo(repo)}
                  >
                    {repo}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-medium h-11 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                Generar standup
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ─── Activity Preview ────────────────────────────────── */}
      {activity && (
        <ActivityPreview
          activity={activity}
          loading={loadingPreview}
          totalCount={totalActivity}
        />
      )}

      {/* ─── Result Card ─────────────────────────────────────── */}
      {(result || loading) && (
        <Card id="result-section" className="glass border-border/50 animate-fade-in-scale">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">
                Tu standup
              </CardTitle>
              {provider && provider !== "fallback" && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-normal"
                >
                  vía {provider}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs cursor-pointer gap-1.5"
            >
              {copied ? (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  ¡Copiado!
                </>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copiar
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={8}
              className="resize-none font-mono text-sm bg-secondary/30 border-border/30"
            />
            <p className="text-[11px] text-muted-foreground/60 mt-2">
              Puedes editar el texto antes de copiarlo.
            </p>
            {isGuest && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>
                  <strong>¿Resultó útil?</strong> Regístrate con GitHub para guardar tu historial, auto-descubrir tus repositorios y omitir URLs manuales.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
