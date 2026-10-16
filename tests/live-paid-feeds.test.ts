import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { sources, enabledSources } from "../lib/opportunities/sources/registry";
import {
  fetchApprovedSource,
  parseSource,
} from "../lib/opportunities/sources/adapters";
import { bramptonJobLinks } from "../lib/opportunities/sources/brampton-jobs";
import { qualityNotes, statusFor } from "../lib/opportunities/quality";
import { displayDateOnly } from "../lib/format";

const source = (id: string) => sources().find((s) => s.id === id)!;
const fixture = (name: string) =>
  readFile(new URL(`./fixtures/feeds/${name}`, import.meta.url), "utf8");

test("City sitemap yields real paid vacancies with exact wages, ages, qualifications and date-only closing notices", async () => {
  const result = parseSource(
    await fixture("brampton-careers.json"),
    source("brampton-careers"),
  );
  assert.equal(result.rejected, 0);
  assert.equal(result.complete, false);
  assert.equal(result.items.length, 5);
  assert.deepEqual(
    result.items.map((r) => r.minimumAge),
    [15, 18, 16, 15, 18],
  );
  assert.deepEqual(
    result.items.map((r) => r.compensation),
    [
      "$24.26 per hour",
      "$37.73 per hour",
      "$37.73 per hour",
      "$21.09 per hour",
      "$22.42 per hour",
    ],
  );
  for (const item of result.items) {
    assert.equal(item.applicationStatus, "open");
    assert.equal(item.paid, "paid");
    assert.equal(
      item.applicationDeadline,
      null,
      "A date-only notice does not invent a closing time",
    );
    assert.equal(
      item.postedDate,
      null,
      "Sitemap lastmod is not a source posting date",
    );
    assert.equal(item.sourceUrl, item.applicationUrl);
    assert.match(
      item.applicationUrl,
      /^https:\/\/careers\.brampton\.ca\/job\/.+\/\d+-en_US\/$/,
    );
    assert.deepEqual(qualityNotes(item), []);
  }
  assert.match(result.items[0].eligibility, /National Lifeguard/);
  assert.match(result.items[1].eligibility, /Certified Personal Trainer/);
  assert.equal(result.items[0].applicationClosingDate, "2026-10-19");
});

test("City details require matching public identity, complete selection, positive vacancies and a published Apply control", async () => {
  const body = await fixture("brampton-careers.json");
  const config = source("brampton-careers");
  const data = JSON.parse(body);
  assert.throws(
    () =>
      bramptonJobLinks(
        data.search.replaceAll(
          "careers.brampton.ca/job/",
          "unapproved.example/job/",
        ),
      ),
    /unexpected/,
  );
  assert.throws(
    () => bramptonJobLinks("<html>Search jobs</html>"),
    /sitemap changed/,
  );
  assert.throws(
    () =>
      parseSource(
        JSON.stringify({ ...data, details: data.details.slice(1) }),
        config,
      ),
    /incomplete/,
  );
  for (const [from, to] of [
    ["Apply now", "Learn more"],
    ["20<br>", "0<br>"],
    [
      "Number of Positions:</strong> 20",
      "Number of Positions:</strong> Talent pool for future vacancies",
    ],
  ]) {
    const changed = structuredClone(data);
    changed.details[0].body = changed.details[0].body.replaceAll(from, to);
    if (to.includes("Talent pool"))
      assert.throws(
        () => parseSource(JSON.stringify(changed), config),
        /requirements changed/,
      );
    else
      assert.equal(
        parseSource(JSON.stringify(changed), config).items[0].applicationStatus,
        "unknown",
      );
  }
  data.details[0].body = data.details[0].body.replace(
    'href="https://careers.brampton.ca/job/Swim-Instructor-',
    'href="https://unapproved.example/job/Swim-Instructor-',
  );
  assert.throws(
    () => parseSource(JSON.stringify(data), config),
    /identity changed/,
  );
});

test("City collection follows only selected sitemap details through the approved-page collector", async () => {
  const data = JSON.parse(await fixture("brampton-careers.json"));
  const config = source("brampton-careers");
  const calls: string[] = [];
  const body = await fetchApprovedSource(
    config,
    AbortSignal.timeout(1000),
    async (page) => {
      calls.push(page.url);
      if (page.url === config.url) return data.search;
      const detail = data.details.find(
        (d: { url: string }) => d.url === page.url,
      );
      assert.ok(detail);
      return detail.body;
    },
  );
  assert.deepEqual(calls, [config.url, ...bramptonJobLinks(data.search)]);
  assert.equal(parseSource(body, config).items.length, 5);
  await assert.rejects(
    fetchApprovedSource(config, AbortSignal.timeout(1000), async (page) => {
      if (page.url === config.url) return data.search;
      throw new Error("Selected detail unavailable");
    }),
    /Selected detail unavailable/,
  );
});

test("calendar-only closing dates expire after the Toronto closing day, including DST changes", async () => {
  const item = parseSource(
    await fixture("brampton-careers.json"),
    source("brampton-careers"),
  ).items[0];
  assert.equal(
    statusFor(item, new Date("2026-10-20T03:59:59Z")),
    "expiring-soon",
  );
  assert.equal(statusFor(item, new Date("2026-10-20T04:00:00Z")), "expired");
  const november = { ...item, applicationClosingDate: "2026-11-01" };
  assert.equal(
    statusFor(november, new Date("2026-11-02T04:59:59Z")),
    "expiring-soon",
  );
  assert.equal(
    statusFor(november, new Date("2026-11-02T05:00:00Z")),
    "expired",
  );
  assert.match(displayDateOnly("2026-11-01", true), /Nov 1, 2026/);
});

test("Hack Club imports only its explicit free worldwide teen community intake", async () => {
  const body = await fixture("hack-club-community.html");
  const config = source("hack-club-community");
  const result = parseSource(body, config);
  assert.equal(result.rejected, 0);
  assert.equal(result.items.length, 1);
  const item = result.items[0];
  assert.equal(item.applicationStatus, "open");
  assert.equal(item.opportunityType, "youth-program");
  assert.equal(item.remote, true);
  assert.equal(item.cost, "Free");
  assert.equal(item.minimumAge, 13);
  assert.match(item.eligibility, /13–18/);
  assert.deepEqual(qualityNotes(item), []);
  assert.equal(item.applicationDeadline, null);
  assert.equal(item.startDate, null);
  assert.equal(item.paid, "unspecified");
  assert.throws(
    () => parseSource(body.replaceAll("Join!", "Closed"), config),
    /intake changed/,
  );
  assert.throws(
    () => parseSource(body.replaceAll("13–18", "19–25"), config),
    /intake changed/,
  );
  assert.ok(
    !enabledSources({ OPPORTUNITY_SOURCE_IDS: "mcdonalds-brampton,job-bank" })
      .length,
  );
});
