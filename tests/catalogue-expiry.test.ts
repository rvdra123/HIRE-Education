import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { closeDatabase } from "../lib/opportunities/db";
import {
  getOpportunity,
  queryCatalog,
  saveOpportunity,
} from "../lib/opportunities/store";
import {
  listingSchema,
  type ListingInput,
  type SourceConfig,
} from "../lib/opportunities/types";

const source: SourceConfig = {
  id: "expiry-fixture",
  name: "Isolated expiry fixture",
  url: "https://example.org/feed.json",
  organization: "Fictional test organization",
  trust: "official",
  adapter: "json",
  intervalHours: 6,
  automationApproved: true,
  approvalNote: "In-memory fixtures in an isolated database, never imported publicly.",
  completeFeed: true,
  allowedHosts: ["example.org"],
};

function listing(id: number, values: Partial<ListingInput> = {}) {
  return listingSchema.parse({
    title: `TEST FIXTURE Student assistant ${id}`,
    organization: source.organization,
    description:
      "A fictional listing for isolated expiry tests, never shown on the public website.",
    opportunityType: "job",
    category: "Retail",
    location: "Brampton, Ontario",
    city: "Brampton",
    sourceUrl: source.url,
    applicationUrl: `https://example.org/jobs/${id}`,
    applicationStatus: "open",
    eligibleGrades: [10, 11, 12],
    paid: "paid",
    ...values,
  });
}

async function isolated(run: () => Promise<void>) {
  const dbPath = `/tmp/hire-expiry-test-${randomUUID()}.db`;
  process.env.DATABASE_URL = `file:${dbPath}`;
  try {
    await run();
  } finally {
    await closeDatabase();
    await rm(dbPath, { force: true });
  }
}

const boundaries: {
  name: string;
  values: Partial<ListingInput>;
  expires: string;
}[] = [
  {
    name: "application deadline with an explicit non-UTC offset",
    values: { applicationDeadline: "2026-11-02T12:00:00-05:00" },
    expires: "2026-11-02T17:00:00Z",
  },
  {
    name: "program end timestamp",
    values: {
      opportunityType: "youth-program",
      endDate: "2026-11-02T12:00:00-05:00",
    },
    expires: "2026-11-02T17:00:00Z",
  },
  {
    name: "event with a published end time",
    values: {
      opportunityType: "event",
      startDate: "2026-11-02T10:00:00-05:00",
      endDate: "2026-11-02T12:00:00-05:00",
    },
    expires: "2026-11-02T17:00:00Z",
  },
  {
    name: "event with no published end time",
    values: {
      opportunityType: "event",
      startDate: "2026-11-02T12:00:00-05:00",
    },
    expires: "2026-11-02T17:00:00Z",
  },
  {
    name: "date-only closing notice on Toronto's spring DST transition",
    values: { applicationClosingDate: "2026-03-08" },
    expires: "2026-03-09T04:00:00Z",
  },
  {
    name: "date-only closing notice on Toronto's fall DST transition",
    values: { applicationClosingDate: "2026-11-01" },
    expires: "2026-11-02T05:00:00Z",
  },
  {
    name: "date-only program end on Toronto's fall DST transition",
    values: {
      opportunityType: "youth-program",
      endDateOnly: "2026-11-01",
    },
    expires: "2026-11-02T05:00:00Z",
  },
];

for (const scenario of boundaries) {
  test(`public reads immediately hide an expired ${scenario.name} without a refresh`, async () => {
    await isolated(async () => {
      const expires = new Date(scenario.expires);
      const before = new Date(expires.getTime() - 1);
      const { record } = await saveOpportunity(
        listing(1, scenario.values),
        source,
        before,
      );
      const events = record.opportunityType === "event";
      const stored = await getOpportunity(record.id, true, before);
      assert.equal((await queryCatalog({}, events, before)).total, 1);
      assert.ok(await getOpportunity(record.id, false, before));
      assert.equal((await queryCatalog({}, events, expires)).total, 0);
      assert.equal(await getOpportunity(record.id, false, expires), null);
      // Public reads must not mutate imported records or their verification time.
      assert.deepEqual(await getOpportunity(record.id, true, expires), stored);
    });
  });
}

test("read-time expiry applies before catalogue counts, pagination and saved-list filters", async () => {
  await isolated(async () => {
    const imported = new Date("2026-11-02T14:00:00Z");
    const now = new Date("2026-11-02T16:00:00Z");
    const expired = await saveOpportunity(
      listing(1, { applicationDeadline: "2026-11-02T15:00:00Z" }),
      source,
      imported,
    );
    const future = await saveOpportunity(
      listing(2, { applicationDeadline: "2026-11-03T15:00:00Z" }),
      source,
      imported,
    );
    const undated = await saveOpportunity(listing(3), source, imported);
    await saveOpportunity(
      listing(4),
      source,
      new Date(now.getTime() - 73 * 3600000),
    );
    const firstPage = await queryCatalog({ pageSize: 1, page: 1 }, false, now);
    const secondPage = await queryCatalog({ pageSize: 1, page: 2 }, false, now);
    assert.equal(firstPage.total, 2);
    assert.equal(secondPage.total, 2);
    assert.equal(firstPage.items.length, 1);
    assert.equal(secondPage.items.length, 1);
    assert.deepEqual(
      new Set([...firstPage.items, ...secondPage.items].map((item) => item.id)),
      new Set([future.record.id, undated.record.id]),
    );
    assert.equal(
      (
        await queryCatalog(
          { view: "saved", ids: [expired.record.id, future.record.id] },
          false,
          now,
        )
      ).total,
      1,
    );
    assert.ok(await getOpportunity(future.record.id, false, now));
    assert.ok(await getOpportunity(undated.record.id, false, now));
  });
});
