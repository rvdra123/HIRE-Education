import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
process.env.DATABASE_URL = `file:/tmp/hire-test-${randomUUID()}.db`;
import { initDatabase, closeDatabase } from "../lib/opportunities/db";
import {
  saveOpportunity,
  queryCatalog,
  getOpportunity,
  sourceHealth,
} from "../lib/opportunities/store";
import { synchronize } from "../lib/opportunities/sync";
import { listingSchema } from "../lib/opportunities/types";
import { calendarRange } from "../lib/opportunities/time";
import { publicUrl } from "../lib/opportunities/quality";
import type { SourceConfig } from "../lib/opportunities/types";
const source: SourceConfig = {
  id: "test-fixture",
  name: "TEST FIXTURE ONLY",
  url: "https://example.org/feed.json",
  organization: "Fictional test organization",
  trust: "official",
  adapter: "json",
  intervalHours: 6,
  automationApproved: true,
  approvalNote:
    "Test adapter with injected in-memory response; never used in the public catalogue.",
  completeFeed: true,
  allowedHosts: ["example.org"],
};
const item = (n = 1) =>
  listingSchema.parse({
    title: `TEST FIXTURE Student assistant ${n}`,
    organization: "Fictional test organization",
    description:
      "A fictional test listing used only in an isolated test database, never shown on the public website.",
    opportunityType: "job",
    category: "Retail",
    location: "Brampton, Ontario",
    city: "Brampton",
    sourceUrl: "https://example.org/feed.json",
    applicationUrl: `https://example.org/roles/${n}`,
    applicationStatus: "open",
    eligibleGrades: [10, 11, 12],
    paid: "paid",
    applicationDeadline: new Date(Date.now() + 10 * 86400000).toISOString(),
  });
test("catalogue timestamps, deduplication, pagination, visibility, source failures and cron intervals", async () => {
  await initDatabase();
  const now = new Date();
  const first = await saveOpportunity(
    item(),
    source,
    new Date(now.getTime() - 86400000),
  );
  const updated = await saveOpportunity(item(), source, now);
  assert.equal(updated.record.id, first.record.id);
  assert.equal(updated.record.firstSeenAt, first.record.firstSeenAt);
  assert.equal(updated.record.lastSeenAt, now.toISOString());
  assert.equal(updated.record.lastVerifiedAt, now.toISOString());
  for (let n = 2; n <= 29; n++) await saveOpportunity(item(n), source, now);
  const one = await queryCatalog({ location: "nearby", pageSize: 24 });
  const two = await queryCatalog({ page: 2, pageSize: 24 });
  assert.equal(one.total, 29);
  assert.equal(one.items.length, 24);
  assert.equal(two.items.length, 5);
  assert.equal(
    (await queryCatalog({ search: "FIXTURE", grade: "9" })).total,
    0,
  );
  assert.equal((await queryCatalog({ search: "' OR 1=1 --" })).total, 0);
  const closed = await saveOpportunity(
    { ...item(99), applicationStatus: "closed" },
    source,
    now,
  );
  assert.equal(await getOpportunity(closed.record.id), null);
  const uncertain = await saveOpportunity(
    { ...item(100), applicationStatus: "unknown" },
    source,
    now,
  );
  assert.equal(uncertain.record.lastVerifiedAt, null);
  assert.equal(await getOpportunity(uncertain.record.id), null);
  const pastDeadline = await saveOpportunity(
    {
      ...item(101),
      applicationDeadline: new Date(now.getTime() - 86400000).toISOString(),
    },
    source,
    now,
  );
  assert.equal(pastDeadline.record.status, "expired");
  assert.equal(await getOpportunity(pastDeadline.record.id), null);
  const stale = await saveOpportunity(
    item(102),
    source,
    new Date(now.getTime() - 4 * 86400000),
  );
  assert.equal(await getOpportunity(stale.record.id), null);
  let called = 0;
  const validFetch = async () => {
    called++;
    return JSON.stringify({ items: [item()] });
  };
  await synchronize({
    force: true,
    now,
    configured: [source],
    fetchSource: validFetch,
  });
  assert.equal(called, 1);
  await synchronize({
    now: new Date(now.getTime() + 1000),
    configured: [source],
    fetchSource: validFetch,
  });
  assert.equal(called, 1);
  const prior = (await getOpportunity(first.record.id, true))!;
  await synchronize({
    force: true,
    now: new Date(now.getTime() + 2000),
    configured: [source],
    fetchSource: async () => {
      throw new Error("Test source failure");
    },
  });
  const after = (await getOpportunity(first.record.id, true))!;
  assert.equal(after.firstSeenAt, prior.firstSeenAt);
  assert.equal(after.lastSeenAt, prior.lastSeenAt);
  assert.equal(after.lastVerifiedAt, prior.lastVerifiedAt);
  assert.notEqual(after.status, "unavailable");
  assert.equal(
    (await sourceHealth()).find((h) => h.source === source.id)?.state,
    "failed",
  );
  await synchronize({
    force: true,
    configured: [source],
    fetchSource: async () => JSON.stringify({ items: [] }),
  });
  await synchronize({
    force: true,
    configured: [source],
    fetchSource: async () => JSON.stringify({ items: [] }),
  });
  assert.equal(
    (await getOpportunity(first.record.id, true))?.status,
    "unavailable",
  );
  assert.equal(await getOpportunity(first.record.id), null);
  await closeDatabase();
  await rm(process.env.DATABASE_URL!.slice(5), { force: true });
});
test("Toronto calendar boundaries handle daylight saving and reject invalid months", () => {
  assert.equal(calendarRange("2026-10")?.from, "2026-10-01T04:00:00.000Z");
  assert.equal(calendarRange("2026-12")?.from, "2026-12-01T05:00:00.000Z");
  assert.equal(calendarRange("2026-13"), null);
});
test("public source links reject local and literal network addresses", () => {
  for (const value of [
    "http://example.org",
    "https://127.0.0.1",
    "https://10.0.0.1",
    "https://[::1]",
    "https://name:secret@example.org",
  ])
    assert.equal(publicUrl(value), false);
  assert.equal(publicUrl("https://www.brampton.ca/path"), true);
});
