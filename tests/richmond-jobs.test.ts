import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  richmondJobLinks,
  richmondJobs,
} from "../lib/opportunities/sources/richmond-jobs";
import { listingSchema } from "../lib/opportunities/types";
import { qualityNotes } from "../lib/opportunities/quality";

const fixture = () =>
  readFile(
    new URL("./fixtures/feeds/richmond-careers.json", import.meta.url),
    "utf8",
  );

test("seven reviewed Richmond Hill vacancies retain factual pay, student eligibility and closing dates without republishing qualification prose", async () => {
  const body = await fixture();
  const data = JSON.parse(body);
  assert.equal(richmondJobLinks(data.search).length, 7);
  const items = richmondJobs(body).map((item) => listingSchema.parse(item));
  assert.deepEqual(
    items.map((item) => item.minimumAge),
    [16, null, null, 15, 15, 15, 15],
  );
  for (const item of items) {
    assert.equal(item.paid, "paid");
    assert.equal(item.applicationStatus, "open");
    assert.equal(item.city, "Richmond Hill");
    assert.equal(
      item.applicationDeadline,
      null,
      "The City publishes only a calendar date; no closing time is invented",
    );
    assert.equal(item.postedDate, null);
    assert.equal(item.applicationUrl, item.sourceUrl);
    assert.deepEqual(qualityNotes(item), []);
    assert.ok(
      !item.eligibility.includes(
        "Shares new ideas and challenges the status quo",
      ),
    );
  }
  const receptionist = items.find(
    (item) => item.title === "Recreation Facility Receptionist",
  )!;
  assert.equal(receptionist.minimumAge, 15);
  assert.match(receptionist.eligibility, /completed Grade 9 mathematics/);
  assert.match(receptionist.eligibility, /experience is an asset/);
  assert.equal(receptionist.applicationClosingDate, "2026-12-18");
  const skating = items.find((item) => item.title === "Skating Instructor")!;
  assert.equal(skating.experienceYears, 1);
  const aquatic = items.find((item) =>
    item.title.includes("Aquatic Employment"),
  )!;
  assert.match(aquatic.description, /One recruiting campaign covering 25/);
  assert.equal(aquatic.applicationClosingDate, "2027-03-01");
  assert.match(aquatic.eligibility, /Bronze Cross/);
  assert.match(aquatic.description, /hiring needs vary by pool/);
});

test("Richmond Hill identities, factual vacancy metadata and qualification hashes fail safely when changed", async () => {
  const data = JSON.parse(await fixture());
  assert.throws(
    () =>
      richmondJobLinks(
        data.search.replaceAll("jobs.richmondhill.ca", "unapproved.example"),
      ),
    /unexpected URL/,
  );
  assert.throws(
    () =>
      richmondJobs(JSON.stringify({ ...data, details: data.details.slice(1) })),
    /incomplete/,
  );
  const qualifications = structuredClone(data);
  qualifications.details[0].body = qualifications.details[0].body.replaceAll(
    "Minimum age 16",
    "Minimum age 19",
  );
  assert.throws(
    () => richmondJobs(JSON.stringify(qualifications)),
    /qualifications changed/,
  );
  const rate = structuredClone(data);
  rate.details[0].body = rate.details[0].body.replaceAll(
    "$17.60 - $17.60",
    "$20.00 - $20.00",
  );
  assert.throws(
    () => richmondJobs(JSON.stringify(rate)),
    /vacancy facts changed/,
  );
  const closed = structuredClone(data);
  closed.details[0].body = closed.details[0].body.replace(
    /Apply now/gi,
    "Applications closed",
  );
  assert.equal(
    richmondJobs(JSON.stringify(closed))[0].applicationStatus,
    "unknown",
  );
  const pool = structuredClone(data);
  pool.details[0].body = pool.details[0].body.replace(
    "</h1>",
    "</h1><p>This job posting is not for an existing vacancy.</p>",
  );
  assert.equal(
    richmondJobs(JSON.stringify(pool))[0].applicationStatus,
    "unknown",
  );
});
