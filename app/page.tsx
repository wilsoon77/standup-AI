import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-subtle" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

        <div className="container max-w-4xl mx-auto px-4 py-24 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-mono font-medium mb-8 animate-fade-in border border-border">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            V0.1 — AI Powered
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-mono bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 animate-fade-in-scale">
            Standup <span className="text-primary">AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-sans leading-relaxed animate-fade-in" style={{ animationDelay: "100ms" }}>
            Genera reportes de tus reuniones diarias automáticamente leyendo tu actividad de GitHub.
            Copia y pega en Slack o Teams al instante.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <Link href="/generate">
              <Button size="lg" className="h-12 px-8 font-mono font-medium text-sm group">
                <Terminal className="mr-2 h-4 w-4" />
                Empezar a generar
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Terminal/Code decorative visual */}
        <div className="w-full max-w-3xl mx-auto px-4 pb-24 animate-fade-in mt-12" style={{ animationDelay: "300ms" }}>
          <div className="rounded-xl border border-border bg-card/50 glass shadow-2xl overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto text-xs font-mono text-muted-foreground">~/standup-ai/output.md</div>
            </div>
            <div className="p-6 font-mono text-sm text-left text-muted-foreground leading-relaxed">
              <span className="text-primary">➜</span> <span className="text-foreground font-semibold">standup check</span> <span className="opacity-70">--user</span><br />
              <br />
              {'>'} <span className="text-foreground">Ayer:</span><br />
              {'  '}• Implementé el modo oscuro usando next-themes<br />
              {'  '}• Refactoricé el menú de navegación<br />
              <br />
              {'>'} <span className="text-foreground">Hoy:</span><br />
              {'  '}• Revisar el PR de la funcionalidad de historial<br />
              <br />
              {'>'} <span className="text-foreground">Bloqueadores:</span><br />
              {'  '}• Ninguno.
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
