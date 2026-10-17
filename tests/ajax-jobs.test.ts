import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ajaxJobLinks, ajaxJobs } from "../lib/opportunities/sources/ajax-jobs";
import { listingSchema } from "../lib/opportunities/types";
import { qualityNotes } from "../lib/opportunities/quality";

const fixture = () =>
  readFile(
    new URL("./fixtures/feeds/ajax-careers.json", import.meta.url),
    "utf8",
  );

test("Ajax imports six existing paid vacancies with source ages, qualifications, seasonal dates and real deadlines", async () => {
  const data = JSON.parse(await fixture());
  const links = ajaxJobLinks(data.search);
  assert.equal(links.length, 6);
  assert.ok(
    links.every((url) =>
      url.startsWith(
        "https://ajax.wd10.myworkdayjobs.com/wday/cxs/ajax/Ajax/job/",
      ),
    ),
  );
  assert.ok(
    links.every((url) => !url.includes("Squash")),
    "The diploma-level squash role and unreviewed professional jobs are excluded",
  );
  const items = ajaxJobs(JSON.stringify(data)).map((item) =>
    listingSchema.parse(item),
  );
  assert.deepEqual(
    items.map((item) => item.minimumAge),
    [16, null, 16, 15, 16, null],
  );
  for (const item of items) {
    assert.equal(item.paid, "paid");
    assert.equal(item.applicationStatus, "open");
    assert.equal(item.city, "Ajax");
    assert.equal(
      item.postedDate,
      null,
      "Relative postedOn and API startDate never become a fabricated timestamp",
    );
    assert.equal(item.startDate, null);
    assert.equal(item.sourceUrl, item.applicationUrl);
    assert.ok(
      item.applicationUrl.startsWith(
        "https://ajax.wd10.myworkdayjobs.com/Ajax/job/",
      ),
    );
    assert.deepEqual(qualityNotes(item), []);
  }
  const camp = items.find(
    (item) => item.title === "2027 Camp Counsellor for March Break Camp",
  )!;
  assert.equal(
    camp.applicationDeadline,
    "2026-10-30T03:59:00.000Z",
    "The human closing notice is Oct 29 at 11:59 p.m., not the API endDate of Oct 30",
  );
  assert.equal(camp.startDateOnly, "2027-03-15");
  assert.equal(camp.endDateOnly, "2027-03-19");
  assert.match(camp.eligibility, /16 or older by March 2, 2027/);
  assert.match(camp.eligibility, /preferred rather than mandatory/);
  assert.equal(
    camp.compensation,
    "$18.75–$19.54 per hour, effective January 1, 2027",
  );
  const lifeguard = items.find((item) => item.title.includes("Lifeguard"))!;
  assert.equal(
    lifeguard.applicationDeadline,
    "2026-11-23T04:59:00.000Z",
    "Toronto's standard-time offset is retained",
  );
  assert.match(lifeguard.compensation!, /pay period not stated/);
  assert.match(lifeguard.eligibility, /National Lifeguard/);
  const arts = items[0];
  assert.match(arts.location, /Grandview Kids/);
  assert.equal(arts.startDateOnly, "2027-01-13");
  const inclusion = items.find((item) => item.title.includes("Inclusion"))!;
  assert.match(inclusion.educationRequirement, /Grade 12/);
  assert.match(
    inclusion.eligibility,
    /Postsecondary study is an asset, not a requirement/,
  );
});

test("Ajax source identities, complete detail selection and reviewed qualification hashes fail safely when changed", async () => {
  const body = await fixture();
  const data = JSON.parse(body);
  assert.throws(
    () =>
      ajaxJobLinks(
        data.search.replaceAll(
          "ajax.wd10.myworkdayjobs.com",
          "unapproved.example",
        ),
      ),
    /unexpected URL/,
  );
  assert.throws(() => ajaxJobLinks("<html>Careers</html>"), /sitemap changed/);
  assert.throws(
    () => ajaxJobs(JSON.stringify({ ...data, details: data.details.slice(1) })),
    /incomplete/,
  );
  const changed = structuredClone(data);
  const first = JSON.parse(changed.details[0].body);
  first.jobPostingInfo.jobDescription =
    first.jobPostingInfo.jobDescription.replace(
      "minimum of 16",
      "minimum of 18",
    );
  assert.notEqual(
    first.jobPostingInfo.jobDescription,
    JSON.parse(data.details[0].body).jobPostingInfo.jobDescription,
  );
  changed.details[0].body = JSON.stringify(first);
  assert.throws(
    () => ajaxJobs(JSON.stringify(changed)),
    /qualifications changed/,
  );
  first.jobPostingInfo = JSON.parse(data.details[0].body).jobPostingInfo;
  first.jobPostingInfo.externalUrl = first.jobPostingInfo.externalUrl.replace(
    "ajax.wd10.myworkdayjobs.com",
    "unapproved.example",
  );
  changed.details[0].body = JSON.stringify(first);
  assert.throws(() => ajaxJobs(JSON.stringify(changed)), /identity changed/);
  const season = structuredClone(data);
  season.details[2].body = season.details[2].body.replaceAll(
    "March 15, 2027",
    "March 15, 2028",
  );
  assert.throws(() => ajaxJobs(JSON.stringify(season)), /season changed/);
});

test("posted and apply flags, fixed vacancies and no-pool notices are all required for an open Ajax listing", async () => {
  const data = JSON.parse(await fixture());
  for (const key of ["posted", "canApply"]) {
    const changed = structuredClone(data);
    const first = JSON.parse(changed.details[0].body);
    first.jobPostingInfo[key] = false;
    changed.details[0].body = JSON.stringify(first);
    assert.equal(
      ajaxJobs(JSON.stringify(changed))[0].applicationStatus,
      "unknown",
    );
  }
  const pool = structuredClone(data);
  const first = JSON.parse(pool.details[0].body);
  first.jobPostingInfo.jobDescription = `<p>This job posting is not for an existing vacancy.</p>${first.jobPostingInfo.jobDescription}`;
  pool.details[0].body = JSON.stringify(first);
  assert.equal(ajaxJobs(JSON.stringify(pool))[0].applicationStatus, "unknown");
  const wrongDate = structuredClone(data);
  wrongDate.details[0].body = wrongDate.details[0].body.replace(
    "October 29, 2026",
    "October 32, 2026",
  );
  assert.throws(
    () => ajaxJobs(JSON.stringify(wrongDate)),
    /vacancy details changed/,
  );
});
