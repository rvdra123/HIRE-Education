import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeDatabase } from "../lib/opportunities/db";
import { sources } from "../lib/opportunities/sources/registry";
import { parseSource } from "../lib/opportunities/sources/adapters";
import { sourceHealth } from "../lib/opportunities/store";
import { synchronize } from "../lib/opportunities/sync";

test("a recognized careers inventory with no student matches is a successful empty check, not an outage", async () => {
  const source = sources().find((entry) => entry.id === "brampton-careers")!;
  const body = JSON.stringify({
    search:
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://careers.brampton.ca/job/BRAMPTON-Senior-Manager-ON-L6Y4R2/123456/</loc></url></urlset>',
    details: [],
  });
  const parsed = parseSource(body, source);
  assert.equal(parsed.items.length, 0);
  assert.equal(parsed.emptyConfirmed, true);
  assert.equal(
    parsed.complete,
    false,
    "An empty selection does not authorize missing-record deletion",
  );
  const directory = await mkdtemp(join(tmpdir(), "hire-empty-careers-"));
  process.env.DATABASE_URL = `file:${join(directory, "catalogue.db")}`;
  try {
    const result = await synchronize({
      configured: [source],
      fetchSource: async () => body,
    });
    assert.deepEqual(result.results, [
      { source: source.id, state: "ok", added: 0, updated: 0 },
    ]);
    assert.equal(
      (await sourceHealth()).find((entry) => entry.source === source.id)?.state,
      "ok",
    );
    assert.throws(() =>
      parseSource(
        JSON.stringify({ search: "<html>Unavailable</html>", details: [] }),
        source,
      ),
    );
    assert.throws(() =>
      parseSource(
        body.replaceAll("careers.brampton.ca", "example.org"),
        source,
      ),
    );
  } finally {
    await closeDatabase();
    await rm(directory, { recursive: true, force: true });
  }
});
