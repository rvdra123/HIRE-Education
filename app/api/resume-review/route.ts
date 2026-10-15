import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
export function GET() {
  return NextResponse.json(
    { available: true, mode: "browser-checklist", acceptsUploads: false },
    { headers },
  );
}
// Stale clients cannot invoke the former provider flow. No body is parsed.
export function POST() {
  return NextResponse.json(
    {
      error:
        "Resume checking now runs on your device. Reload the reviewer page to use the free checker.",
      code: "USE_BROWSER_CHECKER",
    },
    { status: 410, headers },
  );
}
