import test from "node:test";
import assert from "node:assert/strict";
import { catalogueReadiness } from "../lib/opportunities/readiness";
import { sources } from "../lib/opportunities/sources/registry";
import type { SourceHealth } from "../lib/opportunities/types";

test("verified real sources default on without blaming a working database", () => {
  const report = catalogueReadiness({
    databaseQuerySucceeded: true,
    environment: { VERCEL: "1", DATABASE_URL: "libsql://example.invalid" },
  });
  assert.equal(report.state, "needs_setup");
  assert.equal(report.database.querySucceeded, true);
  assert.equal(report.sources.candidates, 36);
  assert.equal(report.sources.approved, 31);
  assert.equal(report.sources.enabled, 31);
  assert.equal(report.refresh.lastSuccessfulSync, null);
  assert.ok(report.nextSteps.some((step) => step.includes("CRON_SECRET")));
});

test("readiness distinguishes serverless local storage, failed queries, source selection, and the first import", () => {
  const source = {
    ...sources()[0],
    automationApproved: true,
    enabledByDefault: false,
  };
  const environment = {
    VERCEL: "1",
    OPPORTUNITY_SOURCE_IDS: source.id,
    CRON_SECRET: "a".repeat(32),
  };
  const local = catalogueReadiness({
    databaseQuerySucceeded: true,
    environment,
    configuredSources: [source],
  });
  assert.equal(local.database.sharedStorageRequired, true);
  const pending = catalogueReadiness({
    databaseQuerySucceeded: true,
    environment: { ...environment, DATABASE_URL: "libsql://example.invalid" },
    configuredSources: [source],
  });
  assert.equal(pending.state, "awaiting_first_import");
  assert.equal(
    pending.refresh.schedulerExecution,
    "not_verified_by_this_report",
  );
  const unselected = catalogueReadiness({
    databaseQuerySucceeded: true,
    environment: { DATABASE_URL: "libsql://example.invalid" },
    configuredSources: [source],
  });
  assert.ok(
    unselected.nextSteps.some((step) =>
      step.includes("Set OPPORTUNITY_SOURCE_IDS"),
    ),
  );
  const failed = catalogueReadiness({
    databaseQuerySucceeded: false,
    environment: {},
    configuredSources: [source],
  });
  assert.equal(failed.database.querySucceeded, false);
  assert.ok(
    failed.nextSteps.some((step) => step.includes("DATABASE_AUTH_TOKEN")),
  );
});

test("a successful import does not claim the scheduler is verified or expose credentials and addresses", () => {
  const source = { ...sources()[0], automationApproved: true };
  const health: SourceHealth = {
    source: source.id,
    name: source.name,
    lastRun: "2026-10-15T16:00:00Z",
    lastSuccessfulRun: "2026-10-15T16:00:00Z",
    itemsFound: 2,
    itemsAdded: 2,
    itemsUpdated: 0,
    error: null,
    state: "ok",
  };
  const environment = {
    VERCEL: "1",
    DATABASE_URL: "libsql://private-database.example.invalid",
    DATABASE_AUTH_TOKEN: "PRIVATE_DATABASE_TOKEN",
    CRON_SECRET: "PRIVATE_CRON_VALUE_".repeat(3),
    VERCEL_TOKEN: "PRIVATE_VERCEL_TOKEN",
    OPPORTUNITY_SOURCE_IDS: source.id,
    VERCEL_GIT_COMMIT_SHA: "a".repeat(40),
  };
  const report = catalogueReadiness({
    databaseQuerySucceeded: true,
    environment,
    configuredSources: [source],
    health: [health],
    now: new Date("2026-10-15T22:00:00Z"),
  });
  assert.equal(report.state, "has_refreshed");
  assert.equal(report.refresh.lastSuccessfulSync, health.lastSuccessfulRun);
  assert.equal(
    report.refresh.schedulerExecution,
    "not_verified_by_this_report",
  );
  assert.equal(report.commit, "aaaaaaa");
  for (const secret of [
    environment.DATABASE_URL,
    environment.DATABASE_AUTH_TOKEN,
    environment.CRON_SECRET,
    environment.VERCEL_TOKEN,
  ])
    assert.ok(!JSON.stringify(report).includes(secret));
  const disabled = catalogueReadiness({
    databaseQuerySucceeded: true,
    environment,
    configuredSources: [{ ...source, automationApproved: false }],
    health: [health],
  });
  assert.equal(disabled.sources.enabled, 0);
  assert.equal(disabled.refresh.lastSuccessfulSync, null);
});

test("readiness identifies all overdue sources at the seven-hour boundary", () => {
  const source = {
    ...sources()[0],
    automationApproved: true,
    enabledByDefault: true,
    intervalHours: 6,
  };
  const health: SourceHealth = {
    source: source.id,
    name: source.name,
    lastRun: "2026-10-15T16:00:00Z",
    lastSuccessfulRun: "2026-10-15T16:00:00Z",
    itemsFound: 2,
    itemsAdded: 2,
    itemsUpdated: 0,
    error: null,
    state: "ok",
  };
  const options = {
    databaseQuerySucceeded: true,
    environment: { CRON_SECRET: "a".repeat(32) },
    configuredSources: [source],
    health: [health],
  };
  const current = catalogueReadiness({
    ...options,
    now: new Date("2026-10-15T22:59:59.999Z"),
  });
  assert.equal(current.state, "has_refreshed");
  assert.deepEqual(current.refresh.overdueSourceIds, []);
  assert.equal(current.refresh.sources[0].overdue, false);
  const overdue = catalogueReadiness({
    ...options,
    now: new Date("2026-10-15T23:00:00Z"),
  });
  assert.equal(overdue.state, "refresh_overdue");
  assert.deepEqual(overdue.refresh.overdueSourceIds, [source.id]);
  assert.equal(overdue.refresh.sources[0].overdue, true);
  assert.ok(overdue.nextSteps.some((step) => step.includes("HIRE_SITE_URL")));
});

test("one recent import cannot conceal stale or never-imported enabled sources", () => {
  const configuredSources = ["recent", "stale", "never"].map((id) => ({
    ...sources()[0],
    id,
    automationApproved: true,
    enabledByDefault: true,
    intervalHours: 6,
  }));
  const health: SourceHealth[] = [
    ["recent", "2026-10-15T22:00:00Z"],
    ["stale", "2026-10-14T16:00:00Z"],
  ].map(([source, lastSuccessfulRun]) => ({
    source,
    name: source,
    lastRun: lastSuccessfulRun,
    lastSuccessfulRun,
    itemsFound: 1,
    itemsAdded: 1,
    itemsUpdated: 0,
    error: null,
    state: "ok",
  }));
  const report = catalogueReadiness({
    databaseQuerySucceeded: true,
    environment: { CRON_SECRET: "a".repeat(32) },
    configuredSources,
    health,
    now: new Date("2026-10-15T23:00:00Z"),
  });
  assert.equal(report.state, "refresh_overdue");
  assert.equal(report.refresh.lastSuccessfulSync, "2026-10-15T22:00:00Z");
  assert.deepEqual(report.refresh.overdueSourceIds, ["stale", "never"]);
  assert.equal(report.refresh.sources[0].overdue, false);
  assert.equal(report.refresh.sources[2].state, "awaiting_first_import");
});
