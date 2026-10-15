import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { database, initDatabase } from "@/lib/opportunities/db";
const fallback = randomBytes(32).toString("hex");
export function authorized(request: Request, secret: string | undefined) {
  if (!secret || secret.length < 32) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const supplied = Buffer.from(request.headers.get("authorization") || "");
  return (
    expected.length === supplied.length && timingSafeEqual(expected, supplied)
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(request.url);
  const host = request.headers.get("host");
  const allowed = configured
    ? new URL(configured).origin
    : host
      ? `${url.protocol}//${host}`
      : url.origin;
  return origin === allowed;
}
export async function limit(key: string, max: number, windowMs: number) {
  await initDatabase();
  const now = Date.now();
  const hashed = createHmac("sha256", process.env.RATE_LIMIT_SECRET || fallback)
    .update(key)
    .digest("hex");
  const result = await database().execute({
    sql: "INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<=? THEN ? ELSE reset_at END RETURNING count,reset_at",
    args: [hashed, now + windowMs, now, now, now + windowMs],
  });
  await database().execute({
    sql: "DELETE FROM rate_limits WHERE reset_at<?",
    args: [now - 86400000],
  });
  return {
    allowed: Number(result.rows[0].count) <= max,
    retryAfter: Math.max(
      1,
      Math.ceil((Number(result.rows[0].reset_at) - now) / 1000),
    ),
  };
}
export function clientLimitKey(request: Request) {
  const header = process.env.TRUSTED_IP_HEADER;
  const identity = header
    ? request.headers.get(header)?.split(",")[0].trim() || "shared"
    : "shared";
  return `review-client:${identity}`;
}
export const privateHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
