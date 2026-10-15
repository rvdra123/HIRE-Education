import { NextResponse } from "next/server";
import { queryCatalog } from "@/lib/opportunities/store";
import { calendarRange } from "@/lib/opportunities/time";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const range = calendarRange(params.get("month") || "", params.get("day"));
    return NextResponse.json(
      await queryCatalog(
        {
          page: Number(params.get("page")) || 1,
          location: params.get("location") || "nearby",
          ...(range || {}),
        },
        true,
      ),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Events could not be loaded." },
      { status: 503 },
    );
  }
}
