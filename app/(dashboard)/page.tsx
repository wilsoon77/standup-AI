import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StandupForm } from "@/components/standup-form";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const githubUsername =
    session.user?.githubUsername ?? session.user?.name ?? "";

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Generar standup
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Hola, {session.user?.name?.split(" ")[0]}. Selecciona la fecha y el
          tono para generar tu daily.
        </p>
      </div>
      <StandupForm username={githubUsername} />
    </div>
  );
}
