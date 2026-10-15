import { NextResponse } from "next/server";
import { sourceHealth } from "@/lib/opportunities/store";
import { catalogueReadiness } from "@/lib/opportunities/readiness";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// This public report returns only counts, booleans, timestamps, and setup steps.
// It never returns credentials, database addresses, file paths, or raw errors.
export async function GET() {
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  try {
    const health = await sourceHealth();
    return NextResponse.json(
      catalogueReadiness({ databaseQuerySucceeded: true, health }),
      { headers },
    );
  } catch {
    return NextResponse.json(
      catalogueReadiness({ databaseQuerySucceeded: false }),
      { headers },
    );
  }
}
