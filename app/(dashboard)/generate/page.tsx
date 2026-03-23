import { auth } from "@/lib/auth";
import { StandupForm } from "@/components/standup-form";

export default async function GeneratePage() {
  const session = await auth();
  const isGuest = !session;

  const githubUsername =
    session?.user?.githubUsername ?? session?.user?.name ?? "";

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-mono">
          Generar standup
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          {isGuest 
            ? "Ingresa un repositorio público de GitHub para explorar la herramienta libremente."
            : `Hola, ${session.user?.name?.split(" ")[0]}. Selecciona tu configuración para generar el reporte.`}
        </p>
      </div>
      <StandupForm username={githubUsername} isGuest={isGuest} />
    </div>
  );
}
