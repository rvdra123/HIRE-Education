import test from "node:test";
import assert from "node:assert/strict";
import fixture from "./fixtures/feeds/ajax-library.json";
import { sources } from "../lib/opportunities/sources/registry";
import { parseSource } from "../lib/opportunities/sources/adapters";
import { statusFor } from "../lib/opportunities/quality";

const source = sources().find(
  (entry) => entry.id === "ajax-library-paid-pages",
)!;
const envelope = (pages: Record<string, string>) =>
  JSON.stringify({
    pages: Object.entries(pages).map(([url, body]) => ({ url, body })),
  });

test("Ajax Library advertises one posting for three existing vacancies without inventing age or preferred-grade eligibility", () => {
  const [item] = parseSource(envelope(fixture.pages), source).items;
  assert.equal(item.paid, "paid");
  assert.equal(item.applicationStatus, "open");
  assert.equal(item.city, "Ajax");
  assert.equal(item.minimumAge, null);
  assert.deepEqual(
    item.eligibleGrades,
    [],
    "Grade 10 is preferred, not a mandatory grade filter",
  );
  assert.match(item.eligibility, /Grade 10 preferred/);
  assert.match(item.compensation!, /age-18 rate not clarified/);
  assert.equal(item.applicationDeadline, "2026-10-23T21:00:00.000Z");
  assert.equal(item.postedDate, null);
  assert.equal(statusFor(item, new Date("2026-10-23T21:00:00Z")), "expired");
  assert.ok(item.applicationUrl.endsWith(".pdf"));
  assert.equal(parseSource(envelope(fixture.pages), source).items.length, 1);
});

test("a changed public PDF or removed job notice never renews the reviewed Library vacancy", () => {
  const pdf =
    "https://www.ajaxlibrary.ca/sites/default/files/inline-files/Part-Time%20Pages_.pdf";
  const html = "https://www.ajaxlibrary.ca/jobs-volunteers";
  assert.throws(
    () =>
      parseSource(
        envelope({
          ...fixture.pages,
          [pdf]: JSON.stringify({
            documentType: "pdf",
            sha256: "0".repeat(64),
          }),
        }),
        source,
      ),
    /PDF changed/,
  );
  assert.throws(
    () =>
      parseSource(
        envelope({
          ...fixture.pages,
          [html]: fixture.pages[html].replaceAll(
            "Three (3) Vacancies",
            "No vacancies",
          ),
        }),
        source,
      ),
    /facts or intake changed/,
  );
  const incomplete = { ...fixture.pages } as Record<string, string>;
  delete incomplete[pdf];
  assert.throws(() => parseSource(envelope(incomplete), source), /incomplete/);
});
