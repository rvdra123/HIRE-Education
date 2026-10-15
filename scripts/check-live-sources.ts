// Live official pages, isolated temporary storage. Never uses a production DB.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { enabledSources } from "../lib/opportunities/sources/registry";
import { fetchApprovedSource } from "../lib/opportunities/sources/adapters";

async function main() {
  const directory = await mkdtemp(join(tmpdir(), "hire-live-feeds-"));
  process.env.DATABASE_URL = `file:${join(directory, "catalogue.db")}`;
  delete process.env.DATABASE_AUTH_TOKEN;
  const { synchronize } = await import("../lib/opportunities/sync");
  const { database, closeDatabase } = await import("../lib/opportunities/db");
  const configured = enabledSources({});
  const bodies = new Map<string, string>();
  const records = async () =>
    (
      await database().execute("SELECT data FROM opportunities ORDER BY id")
    ).rows.map((r) => JSON.parse(String(r.data)));
  try {
    const now = new Date();
    const first = await synchronize({
      configured,
      now,
      fetchSource: async (source, signal) => {
        const body = await fetchApprovedSource(source, signal);
        bodies.set(source.id, body);
        return body;
      },
    });
    assert.equal(first.results.length, configured.length);
    assert.ok(
      first.results.every((r) => (r as { state: string }).state === "ok"),
      JSON.stringify(first),
    );
    const before = await records();
    assert.ok(
      before.length > 2,
      "Live imports must include both volunteer intakes and actual events",
    );
    assert.ok(
      before.every(
        (r) =>
          r.firstSeenAt === now.toISOString() &&
          r.lastSeenAt === now.toISOString() &&
          r.lastVerifiedAt === now.toISOString(),
      ),
    );
    let fetched = 0;
    const replay = async (source: (typeof configured)[number]) => {
      fetched++;
      return bodies.get(source.id)!;
    };
    await synchronize({
      configured,
      now: new Date(now.getTime() + 6 * 3600000 - 1),
      fetchSource: replay,
    });
    assert.equal(fetched, 0, "No fetch before six hours");
    (await records()).forEach((r, i) => {
      assert.equal(r.firstSeenAt, before[i].firstSeenAt);
      assert.equal(r.lastSeenAt, before[i].lastSeenAt);
      assert.equal(r.lastVerifiedAt, before[i].lastVerifiedAt);
    });
    const next = new Date(now.getTime() + 6 * 3600000);
    await synchronize({ configured, now: next, fetchSource: replay });
    assert.equal(
      fetched,
      configured.length,
      "Every enabled feed is due at exactly six hours",
    );
    const after = await records();
    assert.equal(after.length, before.length, "Repeat import must deduplicate");
    after.forEach((r, i) => {
      assert.equal(r.id, before[i].id);
      assert.equal(r.firstSeenAt, before[i].firstSeenAt);
      assert.equal(r.lastSeenAt, next.toISOString());
      assert.equal(r.lastVerifiedAt, next.toISOString());
    });
    await synchronize({
      configured,
      now: new Date(next.getTime() + 6 * 3600000),
      fetchSource: async () => {
        throw new Error("Isolated failure check");
      },
    });
    const failed = await records();
    failed.forEach((r, i) => {
      assert.equal(r.firstSeenAt, after[i].firstSeenAt);
      assert.equal(r.lastSeenAt, after[i].lastSeenAt);
      assert.equal(r.lastVerifiedAt, after[i].lastVerifiedAt);
    });
    console.log(
      JSON.stringify(
        {
          checkedAt: now.toISOString(),
          liveImport: first,
          records: before.length,
          active: before.filter(
            (r) => r.status === "active" || r.status === "expiring-soon",
          ).length,
          sixHourBoundary:
            "passed in isolated storage using the just-fetched source responses",
          timestampPreservation:
            "passed for repeat import, skipped refresh and failed refresh",
        },
        null,
        2,
      ),
    );
  } finally {
    await closeDatabase();
    await rm(directory, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
