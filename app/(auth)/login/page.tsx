import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Link href="/" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm font-medium z-10 group bg-background/50 glass-subtle px-4 py-2 rounded-full border border-border/50">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Regresar
      </Link>

      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-chart-2/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* Card */}
      <div className="glass rounded-2xl p-10 max-w-md w-full mx-4 text-center space-y-8 animate-fade-in-scale relative z-10">
        {/* Logo / Icon */}
        <div className="flex justify-center -mt-2">
          <Logo className="h-14 w-auto drop-shadow-lg" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight"></h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Genera tu daily standup en segundos a partir de tu actividad en GitHub, con inteligencia artificial.
          </p>
        </div>

        {/* Features */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Commits y PRs
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-chart-2" />
            3 tonos
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-chart-3" />
            Historial
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2.5 gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer h-12 text-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continuar con GitHub
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground/60">
          Solo necesitamos permisos de lectura en tus repositorios.
        </p>
      </div>
    </div>
  );
}
