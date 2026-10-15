import { NextResponse } from "next/server";
import { authorized, privateHeaders } from "@/lib/security/requests";
import { synchronize } from "@/lib/opportunities/sync";
import { cleanupFiles } from "@/lib/openai/cleanup";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export async function GET(request: Request) {
  if (!authorized(request, process.env.CRON_SECRET))
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  try {
    const result = await synchronize();
    await cleanupFiles();
    return NextResponse.json(result, { headers: privateHeaders });
  } catch {
    return NextResponse.json(
      {
        error:
          "Synchronization could not complete. Existing records have been preserved.",
      },
      { status: 503, headers: privateHeaders },
    );
  }
}
