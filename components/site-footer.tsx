export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/40 py-6 mt-auto">
      <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-mono px-4 gap-2">
        <p>© {new Date().getFullYear()} Standup AI. Todos los derechos reservados.</p>
        <p>
          Hecho por <a href="https://github.com/wilsoon77/standup-AI" className="text-foreground hover:text-primary transition-colors font-medium">Wilson</a>
        </p>
      </div>
    </footer>
  );
}
