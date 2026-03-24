import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrambleText } from "@/components/scramble-text";
import { InteractiveTerminal } from "@/components/interactive-terminal";

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
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <ScrambleText text="V0.1 — AI Powered" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-mono bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 animate-fade-in-scale">
            <ScrambleText text="Standup " className="text-foreground" /> 
            <span className="text-primary cursor-crosshair"><ScrambleText text="AI" /></span>
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

        {/* Terminal/Code decorative visual now completely interactive 3D */}
        <InteractiveTerminal />
      </main>

      <SiteFooter />
    </div>
  );
}
