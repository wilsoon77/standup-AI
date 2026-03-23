import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HistoryList } from "@/components/history-list";

async function getHistory() {
  const { db } = await import("@/lib/db");
  const { standups } = await import("@/lib/db/schema");
  const { desc, eq } = await import("drizzle-orm");
  const session = await auth();

  if (!session?.user?.id) return [];

  const results = await db
    .select()
    .from(standups)
    .where(eq(standups.userId, session.user.id))
    .orderBy(desc(standups.createdAt))
    .limit(50);

  // Convert Date objects to numbers for serialization
  return results.map((r) => ({
    ...r,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt),
  }));
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const history = await getHistory();

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historial</h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Tus standups generados anteriormente. Puedes copiar cualquiera.
        </p>
      </div>
      <HistoryList history={history} />
    </div>
  );
}
