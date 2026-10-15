import test, { after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { closeDatabase } from "../lib/opportunities/db";
import {
  clientLimitKey,
  reserveLimits,
  releaseReservation,
  reviewLimitMessage,
} from "../lib/security/requests";

const dbPath = `/tmp/hire-limits-test-${randomUUID()}.db`;
process.env.DATABASE_URL = `file:${dbPath}`;
process.env.RATE_LIMIT_SECRET =
  "test-fixture-rate-limit-secret-not-a-credential";
after(async () => {
  await closeDatabase();
  for (const suffix of ["", "-wal", "-shm"]) {
    await rm(`${dbPath}${suffix}`, { force: true });
  }
});

test("Vercel connections use the platform IP and other hosts ignore untrusted IP headers", () => {
  const previousVercel = process.env.VERCEL;
  const previousHeader = process.env.TRUSTED_IP_HEADER;
  const request = (headers: Record<string, string>) =>
    new Request("https://example.org/api/resume-review", { headers });
  try {
    delete process.env.VERCEL;
    delete process.env.TRUSTED_IP_HEADER;
    assert.equal(
      clientLimitKey(request({ "x-vercel-forwarded-for": "192.0.2.1" })),
      "review-client:shared",
    );
    process.env.VERCEL = "1";
    const first = clientLimitKey(
      request({
        "x-vercel-forwarded-for": "192.0.2.1",
        "x-forwarded-for": "198.51.100.9",
      }),
    );
    const second = clientLimitKey(
      request({ "x-vercel-forwarded-for": "192.0.2.2" }),
    );
    assert.equal(first, "review-client:192.0.2.1");
    assert.notEqual(first, second);
    assert.equal(
      clientLimitKey(request({ "x-vercel-forwarded-for": "2001:db8::1" })),
      "review-client:2001:db8::1",
    );
    assert.equal(
      clientLimitKey(request({ "x-forwarded-for": "198.51.100.9" })),
      "review-client:shared",
    );
    assert.equal(
      clientLimitKey(request({ "x-vercel-forwarded-for": "invalid" })),
      "review-client:shared",
    );
    process.env.TRUSTED_IP_HEADER = "x-host-verified-ip";
    assert.equal(
      clientLimitKey(
        request({
          "x-host-verified-ip": "203.0.113.1, 192.0.2.1",
          "x-vercel-forwarded-for": "192.0.2.1",
        }),
      ),
      "review-client:203.0.113.1",
    );
  } finally {
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
    if (previousHeader === undefined) delete process.env.TRUSTED_IP_HEADER;
    else process.env.TRUSTED_IP_HEADER = previousHeader;
  }
});

test("blocked connections do not use the shared budget, and blocked site requests do not use connection allowances", async (t) => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  const budget = { key: "test-budget", max: 3, windowMs: 60000 };
  const rules = (key: string) => [{ key, max: 1, windowMs: 3600000 }, budget];
  assert.equal((await reserveLimits(rules("test-connection-a"))).allowed, true);
  for (let i = 0; i < 4; i++) {
    const blocked = await reserveLimits(rules("test-connection-a"));
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.blockedIndex, 0);
    assert.ok(blocked.retryAfter > 0 && blocked.retryAfter <= 3600);
  }
  assert.equal((await reserveLimits(rules("test-connection-b"))).allowed, true);
  assert.equal((await reserveLimits(rules("test-connection-c"))).allowed, true);
  const full = await reserveLimits(rules("test-connection-d"));
  assert.equal(full.allowed, false);
  assert.equal(full.blockedIndex, 1);
  assert.equal(full.retryAfter, 60);

  // The short test budget expires first. D must retain its unused hourly slot.
  now += 60001;
  assert.equal((await reserveLimits(rules("test-connection-d"))).allowed, true);
});

test("simultaneous requests cannot reserve more than the connection allowance", async () => {
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      reserveLimits([
        { key: "test-concurrent-client", max: 3, windowMs: 3600000 },
        { key: "test-concurrent-budget", max: 60, windowMs: 86400000 },
      ]),
    ),
  );
  assert.equal(results.filter((result) => result.allowed).length, 3);
});

test("limit errors distinguish the connection allowance and daily allowance with wait times", () => {
  assert.match(reviewLimitMessage(0, 65), /3 review attempts per hour/);
  assert.match(reviewLimitMessage(0, 65), /2 minutes/);
  assert.match(reviewLimitMessage(1, 3601), /daily review limit/);
  assert.match(reviewLimitMessage(1, 3601), /2 hours/);
});

test("a failed service call can return its hourly reservation without resetting the site budget", async () => {
  const rules = [
    { key: "test-refund-client", max: 1, windowMs: 3600000 },
    { key: "test-refund-site", max: 2, windowMs: 86400000 },
  ];
  const first = await reserveLimits(rules);
  assert.equal(first.allowed, true);
  await releaseReservation(first.reservations[0]);
  const second = await reserveLimits(rules);
  assert.equal(second.allowed, true);
  await releaseReservation(second.reservations[0]);
  const third = await reserveLimits(rules);
  assert.equal(third.allowed, false);
  assert.equal(third.blockedIndex, 1);
});
