import { NextResponse } from "next/server";
import { authorized, privateHeaders } from "@/lib/security/requests";
import { database, initDatabase } from "@/lib/opportunities/db";
import { sources } from "@/lib/opportunities/sources/registry";
import { sourceHealth } from "@/lib/opportunities/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!authorized(request, process.env.ADMIN_SECRET))
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  await initDatabase();
  const counts = await database().execute(
    "SELECT type,status,COUNT(*) AS count FROM opportunities GROUP BY type,status",
  );
  const today = new Date().toISOString().slice(0, 10);
  const changes = await database().execute({
    sql: "SELECT SUM(first_seen_at>=?) AS addedToday,SUM(last_seen_at>=?) AS seenToday FROM opportunities",
    args: [today, today],
  });
  return NextResponse.json(
    {
      counts: counts.rows,
      changes: changes.rows[0],
      sources: await sourceHealth(),
      configuredSources: sources().map((s) => ({
        id: s.id,
        name: s.name,
        approved: s.automationApproved,
        cadenceHours: s.intervalHours,
        note: s.approvalNote,
      })),
    },
    { headers: privateHeaders },
  );
}
