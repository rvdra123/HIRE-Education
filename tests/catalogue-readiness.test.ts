import test from "node:test";
import assert from "node:assert/strict";
import { catalogueReadiness } from "../lib/opportunities/readiness";
import { sources } from "../lib/opportunities/sources/registry";
import type { SourceHealth } from "../lib/opportunities/types";

test("the real disabled sources explain an empty catalogue without blaming a working database", () => {
  const report = catalogueReadiness({
    databaseQuerySucceeded: true,
    environment: { VERCEL: "1", DATABASE_URL: "libsql://example.invalid" },
  });
  assert.equal(report.state, "needs_setup");
  assert.equal(report.database.querySucceeded, true);
  assert.equal(report.sources.candidates, 5);
  assert.equal(report.sources.approved, 0);
  assert.equal(report.sources.enabled, 0);
  assert.equal(report.refresh.lastSuccessfulSync, null);
  assert.ok(
    report.nextSteps.some((step) =>
      step.includes("All candidate sources are currently disabled"),
    ),
  );
});

test("readiness distinguishes serverless local storage, failed queries, source selection, and the first import", () => {
  const source = { ...sources()[0], automationApproved: true };
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
