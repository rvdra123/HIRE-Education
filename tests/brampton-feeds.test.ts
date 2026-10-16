import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseSource } from "../lib/opportunities/sources/adapters";
import { sources, enabledSources } from "../lib/opportunities/sources/registry";
import { torontoDateTime } from "../lib/opportunities/time";

const source = (id: string) => sources().find((s) => s.id === id)!;
const fixture = (name: string) =>
  readFile(
    new URL(`./fixtures/brampton/${name}.html`, import.meta.url),
    "utf8",
  );

test("captured official teen cards retain exact event dates, links, ages and local times", async () => {
  const config = source("brampton-library");
  const result = parseSource(await fixture("library-teens"), config);
  assert.equal(result.items.length, 6);
  assert.equal(result.rejected, 0);
  assert.equal(result.complete, false);
  const first = result.items[0];
  assert.equal(first.title, "Teen Meetup: Resin Keychains 13-18 years");
  assert.equal(
    first.applicationUrl,
    "https://bramlib.libnet.info/event/17303022",
  );
  assert.equal(first.startDate, "2026-10-15T23:00:00.000Z");
  assert.equal(first.endDate, "2026-10-16T00:00:00.000Z");
  assert.equal(first.minimumAge, 13);
  assert.equal(first.cost, null);
  assert.equal(first.postedDate, null);
  assert.equal(first.applicationDeadline, null);
  assert.equal(first.sourceUrl, config.url);
  const invalid = parseSource(
    (await fixture("library-teens")).replace("October 15, 2026", "October 15"),
    config,
  );
  assert.equal(invalid.items[0].startDate, null);
  assert.equal(invalid.items[0].applicationStatus, "unknown");
  assert.throws(
    () => parseSource("<h1>Directory only</h1>", config),
    /format changed/,
  );
});

test("only the explicitly offered youth library role is imported, without guessed requirements or dates", async () => {
  const config = source("brampton-library-volunteer");
  const body = await fixture("library-volunteer");
  const result = parseSource(body, config);
  assert.equal(result.items.length, 1);
  const item = result.items[0];
  assert.equal(item.title, "Program Assistant");
  assert.equal(item.applicationStatus, "open");
  assert.equal(item.applicationUrl, "https://form.jotform.com/261055879728067");
  assert.equal(item.minimumAge, null);
  assert.equal(item.applicationDeadline, null);
  assert.equal(item.startDate, null);
  assert.deepEqual(item.eligibleGrades, []);
  assert.throws(
    () =>
      parseSource(
        body.replaceAll(
          "Youth Volunteer Opportunities",
          "Adult Volunteer Opportunities",
        ),
        config,
      ),
    /section changed/,
  );
  const closed = parseSource(
    body.replace(
      "Program Assistants support",
      "Applications are closed. Program Assistants support",
    ),
    config,
  );
  assert.equal(closed.items[0].applicationStatus, "unknown");
});

test("the city open intake is one opportunity and its yearless deadline is never manufactured", async () => {
  const config = source("brampton-volunteer");
  const body = await fixture("city-volunteer");
  const result = parseSource(body, config);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].applicationStatus, "open");
  assert.equal(result.items[0].minimumAge, 14);
  assert.match(result.items[0].description, /Apply by November 9/);
  assert.equal(result.items[0].applicationDeadline, null);
  assert.equal(result.items[0].postedDate, null);
  assert.equal(
    parseSource(
      body.replace("intake is now open", "intake is now closed"),
      config,
    ).items[0].applicationStatus,
    "unknown",
  );
});

test("published Toronto wall times handle DST and reject dates that require guessing", () => {
  assert.equal(
    torontoDateTime("October 19, 2026", "4:00PM"),
    "2026-10-19T20:00:00.000Z",
  );
  assert.equal(
    torontoDateTime("November 19, 2026", "4:00PM"),
    "2026-11-19T21:00:00.000Z",
  );
  assert.equal(torontoDateTime("November 1, 2026", "1:30AM"), null);
  assert.equal(torontoDateTime("March 8, 2026", "2:30AM"), null);
  assert.equal(torontoDateTime("February 30, 2026", "4:00PM"), null);
  assert.equal(torontoDateTime("October 19", "4:00PM"), null);
});

test("Youth Cabinet imports only open general membership with the published age and application link", async () => {
  const config = source("brampton-youth-cabinet");
  const body = await fixture("youth-cabinet");
  const result = parseSource(body, config);
  assert.equal(result.items.length, 1);
  const item = result.items[0];
  assert.equal(item.title, "Youth Cabinet General Membership");
  assert.equal(item.opportunityType, "leadership");
  assert.equal(item.applicationStatus, "open");
  assert.equal(
    item.applicationUrl,
    "https://forms.cloud.microsoft/r/6gGSDdMWSV",
  );
  assert.equal(item.minimumAge, 14);
  assert.equal(item.applicationDeadline, null);
  assert.equal(item.startDate, null);
  assert.equal(item.paid, "unspecified");
  assert.deepEqual(item.eligibleGrades, []);
  assert.equal(
    parseSource(body.replace("remain open", "are closed"), config).items[0]
      .applicationStatus,
    "closed",
  );
  assert.throws(
    () =>
      parseSource(
        body
          .replace("remain open", "have no confirmed status")
          .replace("https://forms.cloud.microsoft/r/6gGSDdMWSV", ""),
        config,
      ),
    /application changed/,
  );
});

test("Summer Company closure takes priority over old application steps and incomplete future dates", async () => {
  const config = source("brampton-summer-company");
  const body = await fixture("summer-company");
  const result = parseSource(body, config);
  assert.equal(result.items.length, 1);
  const item = result.items[0];
  assert.equal(item.opportunityType, "summer-program");
  assert.equal(item.applicationStatus, "closed");
  assert.equal(item.minimumAge, 15);
  assert.equal(item.applicationUrl, config.url);
  assert.equal(item.applicationDeadline, null);
  assert.equal(item.startDate, null);
  assert.equal(item.endDate, null);
  assert.equal(item.postedDate, null);
  assert.match(item.description, /Applications are now closed/);
  assert.equal(
    parseSource(
      body.replace("Applications are now closed", "Applications are now open"),
      config,
    ).items[0].applicationStatus,
    "unknown",
    "An open notice without a real application link is not enough",
  );
});

test("only verified adapters default on, explicit source selection/disable is respected, and all run every six hours", () => {
  assert.deepEqual(
    enabledSources({}).map((s) => s.id),
    [
      "brampton-volunteer",
      "brampton-library",
      "brampton-library-volunteer",
      "brampton-youth-cabinet",
      "brampton-summer-company",
      "skills-ontario-brampton-camps",
    ],
  );
  assert.deepEqual(enabledSources({ OPPORTUNITY_SOURCE_IDS: "" }), []);
  assert.deepEqual(
    enabledSources({ OPPORTUNITY_SOURCE_IDS: "job-bank,brampton-library" }).map(
      (s) => s.id,
    ),
    ["brampton-library"],
  );
  assert.ok(sources().every((s) => s.intervalHours === 6));
});
