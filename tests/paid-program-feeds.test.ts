import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseSource } from "../lib/opportunities/sources/adapters";
import { mcdonaldsJobLinks } from "../lib/opportunities/sources/mcdonalds";
import { sources, enabledSources } from "../lib/opportunities/sources/registry";
import { statusFor } from "../lib/opportunities/quality";

const config = (id: string) => sources().find((s) => s.id === id)!;
const fixture = (file: string) =>
  readFile(new URL(`./fixtures/feeds/${file}`, import.meta.url), "utf8");

test("employer data distinguishes existing vacancies, unspecified intakes and future-vacancy pools", async () => {
  const source = config("mcdonalds-brampton");
  const body = await fixture("mcdonalds.json");
  const result = parseSource(body, source);
  assert.equal(result.rejected, 0);
  assert.equal(result.complete, false);
  assert.equal(result.items.length, 3);
  const [existing, unspecified, future] = result.items;
  assert.equal(existing.title, "Full-Time Crew Member");
  assert.equal(existing.applicationStatus, "open");
  assert.equal(existing.paid, "paid");
  assert.equal(existing.minimumAge, null);
  assert.equal(existing.compensation, null);
  assert.equal(existing.applicationDeadline, null);
  assert.equal(existing.sourceUrl, existing.applicationUrl);
  assert.equal(unspecified.applicationStatus, "unknown");
  assert.equal(future.applicationStatus, "unknown");
  assert.equal(future.minimumAge, 16);
  assert.equal(future.commitment, "part-time");
  assert.equal(statusFor(future), "needs-review");
  assert.equal(source.automationApproved, false);
  assert.ok(!enabledSources({ OPPORTUNITY_SOURCE_IDS: source.id }).length);
  const data = JSON.parse(body);
  assert.equal(mcdonaldsJobLinks(data.search).length, 3);
  data.details[0].body = data.details[0].body.replaceAll(
    "Apply Now",
    "Learn more",
  );
  assert.equal(
    parseSource(JSON.stringify(data), source).items[0].applicationStatus,
    "unknown",
  );
});

test("paid feed fails safely on unfiltered search, incomplete details, changed identity and unexpected host paths", async () => {
  const source = config("mcdonalds-brampton");
  const body = await fixture("mcdonalds.json");
  const data = JSON.parse(body);
  assert.throws(() =>
    mcdonaldsJobLinks(
      data.search.replace('"keyword":"Brampton"', '"keyword":"Toronto"'),
    ),
  );
  assert.throws(() =>
    mcdonaldsJobLinks(
      data.search.replaceAll(
        "full-time-crew-member/job/",
        "https://unapproved.example/job/",
      ),
    ),
  );
  assert.throws(
    () =>
      parseSource(
        JSON.stringify({ ...data, details: data.details.slice(1) }),
        source,
      ),
    /incomplete/,
  );
  data.details[0].body = data.details[0].body.replace(
    '"title": "Full-Time Crew Member"',
    '"title": "Different role"',
  );
  // Captured JSON-LD formatting can vary; change the serialized value directly.
  data.details[0].body = data.details[0].body.replace(
    '"title":"Full-Time Crew Member"',
    '"title":"Different role"',
  );
  assert.throws(
    () => parseSource(JSON.stringify(data), source),
    /identity changed/,
  );
});

test("program feed preserves published Brampton sessions, grades, fees and Toronto times without inventing open registration", async () => {
  const source = config("skills-ontario-brampton-camps");
  const body = await fixture("skills-camps.html");
  const result = parseSource(body, source);
  assert.equal(result.rejected, 0);
  assert.equal(result.items.length, 2);
  assert.equal(result.complete, false);
  const [first, second] = result.items;
  assert.equal(first.startDate, "2026-07-20T13:00:00.000Z");
  assert.equal(first.endDate, "2026-07-24T20:00:00.000Z");
  assert.equal(second.startDate, "2026-07-27T13:00:00.000Z");
  assert.equal(second.endDate, "2026-07-31T20:00:00.000Z");
  assert.equal(first.opportunityType, "summer-program");
  assert.deepEqual(first.eligibleGrades, [9]);
  assert.match(first.eligibility, /Grades 7-9/);
  assert.match(first.cost!, /\$230 per camper \(plus applicable fees\)/);
  assert.equal(first.applicationStatus, "unknown");
  assert.equal(first.applicationDeadline, null);
  assert.equal(statusFor(first, new Date("2026-10-16T12:00:00Z")), "expired");
  assert.equal(
    statusFor(first, new Date("2026-07-01T12:00:00Z")),
    "needs-review",
  );
  assert.throws(
    () => parseSource(body.replace("for 2026", "for next year"), source),
    /structure changed/,
  );
  assert.throws(
    () => parseSource(body.replace("July 20th", "Unknown date"), source),
    /dates changed/,
  );
  assert.throws(
    () =>
      parseSource(
        body.replaceAll(
          "https://www.eventbrite.com",
          "https://unapproved.example",
        ),
        source,
      ),
    /link changed/,
  );
});
