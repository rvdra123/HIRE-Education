import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { sources } from "../lib/opportunities/sources/registry";
import {
  fetchApprovedSource,
  parseSource,
} from "../lib/opportunities/sources/adapters";
import { reviewedPageUrls } from "../lib/opportunities/sources/reviewed-programs";
import { qualityNotes, statusFor } from "../lib/opportunities/quality";

const fixture = async () =>
  JSON.parse(
    await readFile(
      new URL("./fixtures/feeds/reviewed-programs.json", import.meta.url),
      "utf8",
    ),
  );
const selected = sources().filter(
  (source) => source.adapter === "reviewed-programs",
);
const config = (id: string) => selected.find((source) => source.id === id)!;
const envelope = (pages: Record<string, string>, id: string) =>
  JSON.stringify({
    pages: reviewedPageUrls(config(id)).map((url) => ({
      url,
      body: pages[url],
    })),
  });

test("captured official evidence produces fourteen distinct open student opportunities with honest costs and eligibility", async () => {
  const { pages } = await fixture();
  const all = selected.flatMap(
    (source) => parseSource(envelope(pages, source.id), source).items,
  );
  assert.equal(all.length, 14);
  assert.equal(new Set(all.map((item) => item.title)).size, 14);
  for (const item of all) {
    assert.deepEqual(qualityNotes(item), [], item.title);
    assert.equal(item.applicationStatus, "open");
    assert.ok(
      ["active", "expiring-soon"].includes(
        statusFor(item, new Date("2026-10-16T16:00:00Z")),
      ),
    );
    assert.equal(
      item.postedDate,
      null,
      "Collection does not manufacture a posting date",
    );
  }
  const interns = all.filter((item) => item.opportunityType === "internship");
  assert.equal(interns.length, 2);
  assert.equal(interns[0].compensation, "Unpaid");
  assert.equal(
    interns[1].paid,
    "unspecified",
    "Free participation does not imply paid employment",
  );
  assert.deepEqual(interns[1].eligibleGrades, [9, 10, 11, 12]);
  assert.equal(
    all.filter((item) => item.opportunityType === "summer-program").length,
    2,
  );
  assert.equal(
    all.filter((item) => item.opportunityType === "mentorship").length,
    2,
  );
  assert.equal(
    all.filter((item) => item.opportunityType === "career-program").length,
    2,
  );
  const yale = all.find((item) => item.organization === "Yale University")!;
  assert.equal(yale.remote, false);
  assert.deepEqual(yale.eligibleCountries, ["Canada"]);
  assert.match(yale.cost!, /US\$7,500.*US\$100.*travel extra/);
  assert.equal(yale.applicationDeadline, "2027-01-07T04:59:00Z");
  assert.ok(
    qualityNotes({ ...yale, eligibleCountries: [] }).includes(
      "Not suitable for the student catalogue",
    ),
  );
  const contests = all.filter((item) => item.title.startsWith("Canadian "));
  assert.deepEqual(
    contests.map((item) => item.eligibleGrades),
    [
      [9, 10],
      [11, 12],
    ],
  );
  assert.ok(
    contests.every(
      (item) =>
        item.applicationClosingDate === "2026-10-22" &&
        item.applicationDeadline === null,
    ),
  );
});

test("changed prices, closed calendars, removed forms and incomplete pages never renew a reviewed intake", async () => {
  const { pages } = await fixture();
  for (const [id, url, from, to] of [
    [
      "launchx-online-summer",
      "https://www.launchx.com/program/online-entrepreneurship",
      "$7,495",
      "$8,000",
    ],
    [
      "yale-young-global-scholars",
      "https://globalscholars.yale.edu/",
      "THE YYGS APPLICATION IS NOW OPEN",
      "THE YYGS APPLICATION IS NOW CLOSED",
    ],
    [
      "waterloo-math-contests",
      "https://cemc.uwaterloo.ca/contests/csimc",
      "Thursday, October 22, 2026",
      "Ordering closed",
    ],
    [
      "energymag-internship",
      "https://energymag.net/internships/",
      'type="email"',
      'type="hidden"',
    ],
  ]) {
    const changed = { ...pages, [url]: pages[url].replaceAll(from, to) };
    assert.throws(
      () => parseSource(envelope(changed, id), config(id)),
      /facts or intake changed/,
      id,
    );
  }
  const source = config("yale-young-global-scholars");
  const data = JSON.parse(envelope(pages, source.id));
  data.pages.pop();
  assert.throws(() => parseSource(JSON.stringify(data), source), /incomplete/);
  assert.throws(
    () => parseSource(JSON.stringify({ pages: [] }), source),
    /incomplete/,
  );
});

test("mentor availability is checked without importing identities or assuming missing availability is true", async () => {
  const { pages } = await fixture();
  const source = config("coding-coach-mentorship");
  const url = "https://mentors.codingcoach.io/.netlify/functions/mentors";
  assert.equal(parseSource(envelope(pages, source.id), source).items.length, 1);
  const unavailable = {
    ...pages,
    [url]: JSON.stringify({ success: true, data: [{ available: false }, {}] }),
  };
  assert.throws(
    () => parseSource(envelope(unavailable, source.id), source),
    /No available coding mentors/,
  );
  const output = JSON.stringify(
    parseSource(envelope(pages, source.id), source),
  );
  assert.ok(!/auth0Id|approvedMentorships|email_verified/.test(output));
});

test("Microsoft structured learning paths must retain their identity, modules and prerequisites", async () => {
  const { pages } = await fixture();
  const source = config("microsoft-learning-paths");
  const url = source.url;
  for (const change of [
    { title: "Unrelated advanced training" },
    { modules: [] },
    { prerequisites: "Experienced developers only" },
    { metadata: { canonical_url: "https://learn.microsoft.com/unrelated" } },
    { _xrefmap: {} },
  ]) {
    const changed = {
      ...pages,
      [url]: JSON.stringify({ ...JSON.parse(pages[url]), ...change }),
    };
    assert.throws(() => parseSource(envelope(changed, source.id), source));
  }
});

test("Hack Club activity status and date-only schedules are not repurposed as application deadlines", async () => {
  const { pages } = await fixture();
  const source = config("hack-club-project-programs");
  const url = "https://hackclub.com/api/v1/events";
  const items = parseSource(envelope(pages, source.id), source).items;
  assert.equal(items.length, 2);
  assert.equal(items[0].endDateOnly, "2026-11-01");
  assert.equal(items[0].endDate, null);
  assert.equal(items[0].applicationClosingDate, null);
  assert.equal(items[0].applicationDeadline, null);
  assert.equal(
    statusFor(items[0], new Date("2026-11-02T05:00:00Z")),
    "expired",
  );
  const feed = JSON.parse(pages[url]);
  feed.data[0].status = "ended";
  assert.throws(
    () =>
      parseSource(
        envelope({ ...pages, [url]: JSON.stringify(feed) }, source.id),
        source,
      ),
    /status or schedule changed/,
  );
});

test("reviewed collection requests only configured public evidence pages and aborts a failed secondary check", async () => {
  const { pages } = await fixture();
  const source = config("microsoft-learning-paths");
  const calls: string[] = [];
  const body = await fetchApprovedSource(
    source,
    AbortSignal.timeout(1000),
    async (page) => {
      calls.push(page.url);
      assert.ok(source.allowedHosts.includes(new URL(page.url).hostname));
      return pages[page.url];
    },
  );
  assert.deepEqual(calls, [
    source.url,
    ...reviewedPageUrls(source).filter((url) => url !== source.url),
  ]);
  assert.equal(parseSource(body, source).items.length, 2);
  await assert.rejects(
    fetchApprovedSource(source, AbortSignal.timeout(1000), async (page) => {
      if (page.url !== source.url)
        throw new Error("Secondary source unavailable");
      return pages[page.url];
    }),
    /Secondary source unavailable/,
  );
});
