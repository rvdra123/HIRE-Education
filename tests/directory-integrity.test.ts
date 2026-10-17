import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { opportunityDirectory } from "../lib/opportunities/directory";

const review = JSON.parse(
  readFileSync(
    new URL("../data/directory-review.json", import.meta.url),
    "utf8",
  ),
) as {
  entries: {
    id: string;
    url: string;
    status: "verified" | "unconfirmed";
    httpStatus: number | null;
    finalUrl: string | null;
    checkedAt: string;
    note: string;
    excerpt: string | null;
  }[];
};

test("directory has unique public destinations and complete review coverage", () => {
  const ids = new Set<string>();
  const destinations = new Set<string>();
  const reviews = new Map(review.entries.map((entry) => [entry.id, entry]));
  assert.equal(reviews.size, review.entries.length, "duplicate review IDs");
  assert.equal(reviews.size, opportunityDirectory.length);
  for (const entry of opportunityDirectory) {
    assert.match(entry.id, /^[\p{Ll}0-9]+(?:-[\p{Ll}0-9]+)*$/u);
    assert(!ids.has(entry.id), `duplicate ID: ${entry.id}`);
    ids.add(entry.id);
    const url = new URL(entry.url);
    assert.equal(url.protocol, "https:");
    assert(!url.username && !url.password && !url.hash);
    assert(!/^(?:localhost|127\.|10\.|192\.168\.)/u.test(url.hostname));
    assert(!destinations.has(url.href), `duplicate destination: ${url.href}`);
    destinations.add(url.href);
    const checked = reviews.get(entry.id);
    assert(checked, `missing review: ${entry.id}`);
    assert.equal(checked.url, entry.url);
    assert.equal(entry.reviewStatus, checked.status);
    assert.equal(entry.reviewedOn, checked.checkedAt.slice(0, 10));
    assert.match(entry.reviewedOn!, /^\d{4}-\d{2}-\d{2}$/u);
    assert(Number.isFinite(Date.parse(checked.checkedAt)));
    assert(checked.note.trim());
  }
});

test("verified directory destinations have evidence and access failures remain unconfirmed", () => {
  for (const entry of review.entries) {
    if (entry.status === "verified") {
      assert.equal(entry.httpStatus, 200, entry.id);
      assert.equal(new URL(entry.finalUrl!).href.split("#")[0], entry.url);
      assert(entry.excerpt?.trim(), `missing primary excerpt: ${entry.id}`);
      assert(!/from404=true|\/errors\/404/u.test(entry.url), entry.id);
    } else {
      assert.equal(entry.status, "unconfirmed");
      assert.match(entry.note, /retained|unavailable|not confirmed/iu);
    }
  }
});
