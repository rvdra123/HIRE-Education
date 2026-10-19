import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateRefresh, validateSourceHealth } from "../scripts/run-sync.mjs";

test("scheduler treats partial source failures and unconfigured feeds as failures even with HTTP 200", () => {
  validateRefresh({
    state: "complete",
    results: [{ source: "official", state: "ok" }],
  });
  validateRefresh({ state: "complete", results: [] }); // Not due yet.
  assert.throws(() =>
    validateRefresh({ state: "awaiting-approved-sources", results: [] }),
  );
  assert.throws(
    () =>
      validateRefresh({
        state: "complete",
        results: [{ source: "official", state: "failed" }],
      }),
    /official/,
  );
  const now = Date.parse("2026-10-15T18:00:00Z");
  const report = {
    sources: { enabled: 1 },
    refresh: {
      sources: [
        {
          id: "official",
          state: "ok",
          lastSuccessfulRun: "2026-10-15T12:00:00Z",
        },
      ],
    },
  };
  validateSourceHealth(report, now);
  assert.throws(
    () => validateSourceHealth(report, now + 2 * 3600000),
    /official/,
  );
  assert.throws(() => validateSourceHealth({ sources: { enabled: 0 } }, now));
});

test("deployment import and scheduled refresh use the same six-hour workflow and safe runner", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/refresh-opportunities.yml", import.meta.url),
    "utf8",
  );
  assert.match(workflow, /cron: "17 \*\/6 \* \* \*"/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /ref: main/);
  assert.match(workflow, /EXPECTED_DEPLOYMENT_SHA/);
  assert.match(workflow, /node scripts\/run-sync\.mjs/);
});
