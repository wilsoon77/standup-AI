import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export async function SiteHeader() {
  const session = await auth();
  const isGuest = !session;
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full glass-subtle border-b border-white/5 dark:border-white/10 dark:bg-background/80 bg-background/60 backdrop-blur-md">
      <nav className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center group cursor-pointer">
            {/* Isotipo para versión móvil (oculto en pantallas sm o mayores) */}
            <img 
              src="/icon-standupAI.svg" 
              alt="Standup AI" 
              className="h-8 w-8 object-contain block sm:hidden transition-transform group-hover:scale-105 drop-shadow-sm" 
            />
            {/* Logo completo para versión de escritorio (oculto en móviles) */}
            <Logo className="h-10 w-auto hidden sm:block transition-transform group-hover:scale-105 drop-shadow-sm" />
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/generate">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Generar
              </Button>
            </Link>
            {!isGuest && (
              <Link href="/history">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Historial
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* User Menu / Guest Login / Theme Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isGuest ? (
            <Link href="/login">
              <Button size="sm" className="h-8 pr-4 pl-3 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95">
                Iniciar sesión
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 px-2 h-9 cursor-pointer rounded-md hover:bg-accent transition-colors"
              >
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                  <AvatarFallback className="text-[10px] bg-secondary">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {user?.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/login" });
                    }}
                    className="w-full"
                  >
                    <button
                      type="submit"
                      className="w-full text-left text-sm cursor-pointer"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
    </header>
  );
}
