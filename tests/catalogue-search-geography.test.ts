import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
const databasePath = `/tmp/hire-search-${randomUUID()}.db`;
process.env.DATABASE_URL = `file:${databasePath}`;
import { initDatabase, closeDatabase } from "../lib/opportunities/db";
import { saveOpportunity, queryCatalog } from "../lib/opportunities/store";
import { listingSchema, type SourceConfig } from "../lib/opportunities/types";

test("live multiword search matches words in any order and GTA filters include member cities without treating all online/Ontario work as local", async () => {
  const source: SourceConfig = {
    id: "search-fixture",
    name: "TEST FIXTURE ONLY",
    organization: "Fictional employer",
    url: "https://example.org/fixture",
    trust: "official",
    adapter: "json",
    intervalHours: 6,
    automationApproved: true,
    completeFeed: false,
    allowedHosts: ["example.org"],
    approvalNote: "Isolated synthetic test data only",
  };
  try {
    await initDatabase();
    const inputs = [
      ["Lifeguard", "Brampton", false],
      ["Library page", "Ajax", false],
      ["Usher", "Richmond Hill", false],
      ["Online assistant", "", true],
      ["Library helper", "Ottawa", false],
    ] as const;
    for (const [index, [title, city, remote]] of inputs.entries())
      await saveOpportunity(
        listingSchema.parse({
          title: `TEST FIXTURE ${title}`,
          organization: "Fictional employer",
          description:
            "Fictional paid student work used only in an isolated test database, never published or imported to production.",
          opportunityType: "job",
          category: "Community",
          city,
          remote,
          location: city ? `${city}, Ontario` : "Online — worldwide",
          paid: "paid",
          sourceUrl: source.url,
          applicationUrl: `https://example.org/fixture/${index}`,
          applicationStatus: "open",
        }),
        source,
      );
    assert.equal(
      (await queryCatalog({ search: "brampton lifeguard" })).total,
      1,
    );
    assert.equal(
      (await queryCatalog({ search: "lifeguard brampton" })).total,
      1,
    );
    assert.equal(
      (await queryCatalog({ search: "lifeguard missingword" })).total,
      0,
    );
    assert.equal((await queryCatalog({ search: "%" })).total, 0);
    assert.equal((await queryCatalog({ search: "' OR 1=1 --" })).total, 0);
    const gta = await queryCatalog({ location: "GTA" });
    assert.deepEqual(
      new Set(gta.items.map((item) => item.city)),
      new Set(["Brampton", "Ajax", "Richmond Hill"]),
    );
    assert.equal((await queryCatalog({ location: "Peel Region" })).total, 1);
    assert.equal((await queryCatalog({ location: "Remote" })).total, 1);
  } finally {
    closeDatabase();
    await rm(databasePath, { force: true });
  }
});
