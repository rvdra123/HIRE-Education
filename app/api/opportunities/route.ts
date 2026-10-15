import { NextRequest, NextResponse } from "next/server";
import { queryCatalog } from "@/lib/opportunities/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  try {
    const result = await queryCatalog({
      search: (p.get("search") || "").slice(0, 150),
      type: p.get("type") || undefined,
      location: p.get("location") ?? "nearby",
      grade: p.get("grade") || undefined,
      category: p.get("category") || undefined,
      commitment: p.get("commitment") || undefined,
      paid: p.get("paid") || undefined,
      sort: p.get("sort") || "recommended",
      view: p.get("view") || undefined,
      page: Math.min(100000, Math.max(1, parseInt(p.get("page") || "1") || 1)),
      pageSize: Math.min(
        24,
        Math.max(1, parseInt(p.get("pageSize") || "24") || 24),
      ),
      ids: (p.get("ids") || "").split(",").filter(Boolean).slice(0, 200),
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "The catalogue is temporarily unavailable. Please try again shortly.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
