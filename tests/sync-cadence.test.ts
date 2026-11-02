import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeDatabase } from "../lib/opportunities/db";
import { sourceHealth } from "../lib/opportunities/store";
import { synchronize } from "../lib/opportunities/sync";
import type { SourceConfig } from "../lib/opportunities/types";

const source: SourceConfig = {
  id: "test-retry-cadence",
  name: "TEST FIXTURE ONLY: retry cadence",
  url: "https://example.org/feed.json",
  organization: "Fictional test organization",
  trust: "official",
  adapter: "json",
  intervalHours: 6,
  automationApproved: true,
  approvalNote: "Isolated fixture with an injected response; never collected.",
  completeFeed: true,
  allowedHosts: ["example.org"],
};

test("hourly checks retry a failed due import without resetting the six-hour successful-import interval", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hire-sync-cadence-"));
  process.env.DATABASE_URL = `file:${join(directory, "catalogue.db")}`;
  delete process.env.DATABASE_AUTH_TOKEN;
  const start = Date.parse("2026-11-02T00:17:00Z");
  const hour = 3600000;
  let calls = 0;
  let fail = false;
  const run = (elapsed: number, force = false) =>
    synchronize({
      now: new Date(start + elapsed),
      configured: [source],
      force,
      fetchSource: async () => {
        calls++;
        if (fail) throw new Error("Injected source outage");
        return JSON.stringify({ items: [] });
      },
    });
  try {
    await run(0);
    assert.equal(calls, 1);
    await run(6 * hour - 1);
    assert.equal(calls, 1, "Successful sources are not fetched early");
    fail = true;
    await run(6 * hour);
    assert.equal(calls, 2, "Import becomes due at exactly six hours");
    let health = (await sourceHealth()).find(
      (entry) => entry.source === source.id,
    )!;
    assert.equal(health.state, "failed");
    assert.equal(health.lastSuccessfulRun, new Date(start).toISOString());
    await run(6 * hour + 14 * 60000);
    assert.equal(calls, 2, "Repeated calls respect a short failure backoff");
    fail = false;
    await run(7 * hour);
    assert.equal(
      calls,
      3,
      "Next hourly check retries instead of waiting six more hours",
    );
    health = (await sourceHealth()).find(
      (entry) => entry.source === source.id,
    )!;
    assert.equal(health.state, "ok");
    assert.equal(
      health.lastSuccessfulRun,
      new Date(start + 7 * hour).toISOString(),
    );
    await run(13 * hour - 1);
    assert.equal(calls, 3, "Retry success starts a fresh six-hour interval");
    await run(13 * hour);
    assert.equal(calls, 4);
    fail = true;
    await run(13 * hour + 1000, true);
    assert.equal(
      calls,
      5,
      "Explicit force can recheck a recently imported source",
    );
    fail = false;
    await run(13 * hour + 2000, true);
    assert.equal(calls, 6, "Explicit force can override the failure backoff");
  } finally {
    await closeDatabase();
    await rm(directory, { recursive: true, force: true });
  }
});

test("a source whose first import fails is eligible again after the short backoff", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hire-sync-first-retry-"));
  process.env.DATABASE_URL = `file:${join(directory, "catalogue.db")}`;
  const start = Date.parse("2026-11-02T00:17:00Z");
  let calls = 0;
  const run = (elapsed: number) =>
    synchronize({
      now: new Date(start + elapsed),
      configured: [source],
      fetchSource: async () => {
        calls++;
        if (calls === 1) throw new Error("Injected first-import outage");
        return JSON.stringify({ items: [] });
      },
    });
  try {
    await run(0);
    await run(15 * 60000 - 1);
    assert.equal(calls, 1);
    await run(15 * 60000);
    assert.equal(calls, 2);
    assert.equal(
      (await sourceHealth()).find((entry) => entry.source === source.id)?.state,
      "ok",
    );
  } finally {
    await closeDatabase();
    await rm(directory, { recursive: true, force: true });
  }
});
