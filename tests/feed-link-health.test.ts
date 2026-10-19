import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
process.env.DATABASE_URL = `file:/tmp/hire-link-health-${randomUUID()}.db`;
import { closeDatabase, initDatabase } from "../lib/opportunities/db";
import { checkListingLinks } from "../lib/opportunities/link-health";
import {
  getOpportunity,
  saveOpportunity,
  setSourceHealth,
} from "../lib/opportunities/store";
import { parseSource } from "../lib/opportunities/sources/adapters";
import { sources } from "../lib/opportunities/sources/registry";

test("employer detail link checks keep listing timestamps and never require a search response", async () => {
  const source = {
    ...sources().find((s) => s.id === "mcdonalds-brampton")!,
    automationApproved: true,
  };
  const fixture = await readFile(
    new URL("./fixtures/feeds/mcdonalds.json", import.meta.url),
    "utf8",
  );
  const detail = JSON.parse(fixture).details[0];
  const now = new Date();
  try {
    await initDatabase();
    const { record } = await saveOpportunity(
      parseSource(fixture, source).items[0],
      source,
      now,
    );
    assert.equal(record.status, "active");
    await setSourceHealth({
      source: source.id,
      name: source.name,
      lastRun: now.toISOString(),
      lastSuccessfulRun: now.toISOString(),
      itemsFound: 1,
      itemsAdded: 1,
      itemsUpdated: 0,
      error: null,
      state: "ok",
    });
    let calls = 0;
    const checked = new Date(now.getTime() + 4 * 3600000);
    await checkListingLinks([source], checked, 60000, async (page) => {
      calls++;
      assert.equal(page.url, detail.url);
      return detail.body;
    });
    assert.equal(calls, 1);
    const after = (await getOpportunity(record.id, true))!;
    assert.equal(after.status, "active");
    assert.equal(after.linkFailures, 0);
    assert.equal(after.lastLinkCheckedAt, checked.toISOString());
    for (const key of ["firstSeenAt", "lastSeenAt", "lastVerifiedAt"] as const)
      assert.equal(after[key], record[key]);
    await checkListingLinks(
      [source],
      new Date(checked.getTime() + 25 * 3600000),
      60000,
      async () => {
        throw new Error("Source returned HTTP 403");
      },
    );
    const failed = (await getOpportunity(record.id, true))!;
    assert.equal(failed.linkFailures, 1);
    for (const key of ["firstSeenAt", "lastSeenAt", "lastVerifiedAt"] as const)
      assert.equal(failed[key], record[key]);
  } finally {
    await closeDatabase();
    await rm(process.env.DATABASE_URL!.slice(5), { force: true });
  }
});
