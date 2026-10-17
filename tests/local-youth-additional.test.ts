import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { sources } from "../lib/opportunities/sources/registry";
import { parseSource } from "../lib/opportunities/sources/adapters";
import { reviewedPageUrls } from "../lib/opportunities/sources/reviewed-programs";
import { qualityNotes, statusFor } from "../lib/opportunities/quality";

const ids = [
  "second-harvest-student-volunteers",
  "toronto-youth-cabinet-working-groups",
];
const fixture = async (): Promise<{ pages: Record<string, string> }> =>
  JSON.parse(
    await readFile(
      new URL("./fixtures/feeds/local-youth-additional.json", import.meta.url),
      "utf8",
    ),
  );
const config = (id: string) => {
  const source = sources().find((item) => item.id === id);
  assert.ok(source, `${id} must be registered`);
  return source;
};
const envelope = (pages: Record<string, string>, id: string) =>
  JSON.stringify({
    pages: reviewedPageUrls(config(id)).map((url) => ({
      url,
      body: pages[url],
    })),
  });

test("student food-rescue and a current education working group have explicit live intake evidence", async () => {
  const { pages } = await fixture();
  const items = ids.flatMap(
    (id) => parseSource(envelope(pages, id), config(id)).items,
  );
  assert.equal(items.length, 2);
  for (const item of items) {
    assert.deepEqual(qualityNotes(item), []);
    assert.equal(item.applicationStatus, "open");
    assert.equal(statusFor(item, new Date("2026-10-17T16:00:00Z")), "active");
    assert.equal(item.applicationDeadline, null);
    assert.equal(item.applicationClosingDate, null);
    assert.equal(
      item.cost,
      null,
      "No published price is not a free-price claim",
    );
    assert.equal(item.postedDate, null);
  }
  const food = items.find((item) => item.opportunityType === "volunteer")!;
  assert.equal(food.minimumAge, 16);
  assert.match(food.description, /does not guarantee a placement or shift/);
  assert.match(food.eligibility, /19.*excluded/);
  const education = items.find(
    (item) => item.opportunityType === "leadership",
  )!;
  assert.equal(education.minimumAge, 14);
  assert.match(education.title, /2026–27/);
  assert.match(education.description, /October 30th @ 11:59 PM/);
  assert.equal(new URL(education.applicationUrl).hostname, "docs.google.com");
});

test("closed or removed current form and roster conditions cannot renew the applications", async () => {
  const { pages } = await fixture();
  const id = "toronto-youth-cabinet-working-groups";
  const form = reviewedPageUrls(config(id)).find(
    (url) => new URL(url).hostname === "docs.google.com",
  )!;
  assert.throws(
    () =>
      parseSource(
        envelope(
          {
            ...pages,
            [form]: pages[form].replaceAll("formResponse", "formClosed"),
          },
          id,
        ),
        config(id),
      ),
    /facts or intake changed/,
  );
  assert.throws(
    () =>
      parseSource(
        envelope(
          {
            ...pages,
            [config(id).url]: pages[config(id).url].replaceAll(
              "Now Open",
              "Applications Closed",
            ),
          },
          id,
        ),
        config(id),
      ),
    /facts or intake changed/,
  );
  const food = "second-harvest-student-volunteers",
    url = config(food).url;
  assert.throws(
    () =>
      parseSource(
        envelope(
          {
            ...pages,
            [url]: pages[url].replaceAll(
              "Students must be a minimum age of 16 years old",
              "Students must be a minimum age of 19 years old",
            ),
          },
          food,
        ),
        config(food),
      ),
    /facts or intake changed/,
  );
});
