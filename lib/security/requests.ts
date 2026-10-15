import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
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
  return reserveLimits([{ key, max, windowMs }]);
}
type LimitRule = { key: string; max: number; windowMs: number };
async function usageTransaction() {
  for (let attempt = 0; ; attempt++) {
    try {
      return await database().transaction("write");
    } catch (error) {
      // A local SQLite connection cannot wait synchronously for another
      // request's transaction, since that request needs this same event loop.
      if (
        attempt >= 5 ||
        !(error instanceof Error) ||
        !("code" in error) ||
        error.code !== "SQLITE_BUSY"
      )
        throw error;
      await delay(25 * 2 ** attempt);
    }
  }
}
export async function reserveLimits(rules: LimitRule[]) {
  if (!rules.length) throw new Error("At least one usage limit is required.");
  await initDatabase();
  const now = Date.now();
  const hashed = rules.map(({ key }) =>
    createHmac("sha256", process.env.RATE_LIMIT_SECRET || fallback)
      .update(key)
      .digest("hex"),
  );
  // Reserve the connection and site allowances together. A rejected request
  // must not consume either allowance, including when requests arrive together.
  const transaction = await usageTransaction();
  try {
    const existing = await transaction.batch(
      hashed.map((key) => ({
        sql: "SELECT count,reset_at FROM rate_limits WHERE key=?",
        args: [key],
      })),
    );
    let blockedIndex: number | null = null;
    let retryAfter = 0;
    for (let i = 0; i < rules.length; i++) {
      const row = existing[i].rows[0];
      if (
        row &&
        Number(row.reset_at) > now &&
        Number(row.count) >= rules[i].max
      ) {
        const wait = Math.max(
          1,
          Math.ceil((Number(row.reset_at) - now) / 1000),
        );
        if (wait > retryAfter) {
          blockedIndex = i;
          retryAfter = wait;
        }
      }
    }
    if (blockedIndex !== null) {
      await transaction.rollback();
      return { allowed: false, retryAfter, blockedIndex, reservations: [] };
    }
    await transaction.batch([
      ...hashed.map((key, i) => ({
        sql: "INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<=? THEN ? ELSE reset_at END",
        args: [key, now + rules[i].windowMs, now, now, now + rules[i].windowMs],
      })),
      {
        sql: "DELETE FROM rate_limits WHERE reset_at<?",
        args: [now - 86400000],
      },
    ]);
    await transaction.commit();
    return {
      allowed: true,
      retryAfter: 0,
      blockedIndex: null,
      reservations: hashed.map((key, i) => ({
        key,
        resetAt:
          existing[i].rows[0] && Number(existing[i].rows[0].reset_at) > now
            ? Number(existing[i].rows[0].reset_at)
            : now + rules[i].windowMs,
      })),
    };
  } finally {
    transaction.close();
  }
}
export function clientLimitKey(request: Request) {
  // Vercel overwrites this header at its edge. Never trust a forwarded IP
  // automatically when running on an arbitrary host or in local development.
  const header =
    process.env.TRUSTED_IP_HEADER?.trim() ||
    (process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : undefined);
  const candidate = header
    ? request.headers.get(header)?.split(",")[0].trim()
    : undefined;
  const identity = candidate && isIP(candidate) ? candidate : "shared";
  return `review-client:${identity}`;
}
export async function releaseReservation(reservation: {
  key: string;
  resetAt: number;
}) {
  await database().execute({
    sql: "UPDATE rate_limits SET count=MAX(0,count-1) WHERE key=? AND reset_at=?",
    args: [reservation.key, reservation.resetAt],
  });
}
export function reviewLimitMessage(
  blockedIndex: number | null,
  seconds: number,
) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  const wait =
    minutes < 60
      ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
      : `${Math.ceil(minutes / 60)} ${Math.ceil(minutes / 60) === 1 ? "hour" : "hours"}`;
  return blockedIndex === 1
    ? `HIRE Education has reached its daily review limit. Try again in ${wait}.`
    : `This connection has reached its limit of 3 review attempts per hour. Try again in ${wait}.`;
}
export const privateHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
