import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mississaugaJobs } from "../lib/opportunities/sources/mississauga-jobs";
import { listingSchema } from "../lib/opportunities/types";
import { qualityNotes, statusFor } from "../lib/opportunities/quality";

const fixture = () =>
  readFile(
    new URL("./fixtures/feeds/mississauga-careers.xml", import.meta.url),
    "utf8",
  );

test("official Mississauga RSS selects the actual part-time vacancy and preserves qualifications without guessing age or currency", async () => {
  const items = mississaugaJobs(await fixture()).map((item) =>
    listingSchema.parse(item),
  );
  assert.equal(
    items.length,
    1,
    "Postsecondary co-ops, personal training and professional roles are excluded",
  );
  const [item] = items;
  assert.equal(item.title, "Fitness Instructor");
  assert.equal(item.applicationStatus, "open");
  assert.equal(item.paid, "paid");
  assert.equal(item.city, "Mississauga");
  assert.match(item.location, /Meadowvale CC/);
  assert.match(item.eligibility, /group exercise qualification/);
  assert.match(item.eligibility, /prior|Experience teaching/);
  assert.equal(item.hours, "up to 24");
  assert.equal(item.minimumAge, null);
  assert.deepEqual(item.eligibleGrades, []);
  assert.match(item.compensation!, /34\.90–39\.89 per hour/);
  assert.match(item.compensation!, /currency not stated/);
  assert.equal(
    item.applicationClosingDate,
    "2026-12-18",
    "Use the source's closing notice, not the RSS feed's separate expiration metadata",
  );
  assert.equal(item.applicationDeadline, null);
  assert.equal(item.postedDate, null);
  assert.equal(item.sourceUrl, item.applicationUrl);
  assert.deepEqual(qualityNotes(item), []);
  assert.equal(
    statusFor(item, new Date("2026-12-19T04:59:59Z")),
    "expiring-soon",
  );
  assert.equal(statusFor(item, new Date("2026-12-19T05:00:00Z")), "expired");
});

test("RSS requires the reviewed role's source identity and actual job requirements", async () => {
  const body = await fixture();
  assert.throws(
    () =>
      mississaugaJobs(
        body.replace("Jobs at City of Mississauga", "Jobs elsewhere"),
      ),
    /identity changed/,
  );
  assert.throws(
    () =>
      mississaugaJobs(
        body.replace(
          "https://jobs.mississauga.ca/job/Mississauga-Fitness-Instructor-ON/",
          "https://unapproved.example/job/Mississauga-Fitness-Instructor-ON/",
        ),
      ),
    /identity changed/,
  );
  assert.throws(
    () =>
      mississaugaJobs(
        body.replace("Group Exercise Certification", "No certification"),
      ),
    /requirements changed/,
  );
  assert.throws(
    () =>
      mississaugaJobs(
        body.replace(
          "Experience teaching multi-level group exercise classes",
          "Completion of a university degree required",
        ),
      ),
    /requirements changed/,
  );
  assert.throws(
    () => mississaugaJobs(body.replace("12/18/2026", "12/32/2026")),
    /Invalid/,
  );
  assert.deepEqual(
    mississaugaJobs(
      body.replace(
        "Fitness Instructor (Mississauga, ON, CA)",
        "Professional Instructor (Mississauga, ON, CA)",
      ),
    ),
    [],
  );
});

test("a future-vacancy or closed notice never becomes open even when fixed positions remain in the feed", async () => {
  const body = await fixture();
  for (const notice of [
    "This job posting is not for an existing vacancy.",
    "Applications are closed.",
    "Talent pool for future vacancies.",
  ]) {
    const changed = body.replace(
      "Effectively plan and lead",
      `${notice} Effectively plan and lead`,
    );
    assert.equal(mississaugaJobs(changed)[0].applicationStatus, "unknown");
  }
  const zero = body.replace("Number of Positions: 5", "Number of Positions: 0");
  assert.notEqual(zero, body);
  assert.equal(mississaugaJobs(zero)[0].applicationStatus, "unknown");
});
