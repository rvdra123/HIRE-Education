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

const sourceIds = [
  "regeneration-brampton-volunteer",
  "food-banks-mississauga-youth",
  "trca-youth-council",
  "canadian-cadets-registration",
  "toronto-library-literacy-volunteers",
  "toronto-ltc-youth-volunteers",
  "bgc-peel-youth-intakes",
  "mississauga-current-youth-volunteers",
];
const fixture = async (): Promise<{ pages: Record<string, string> }> =>
  JSON.parse(
    await readFile(
      new URL("./fixtures/feeds/local-youth-programs.json", import.meta.url),
      "utf8",
    ),
  );
const config = (id: string) => {
  const source = sources().find((entry) => entry.id === id);
  assert.ok(source, `Local source ${id} must be registered`);
  return source;
};
const envelope = (pages: Record<string, string>, id: string) =>
  JSON.stringify({
    pages: reviewedPageUrls(config(id)).map((url) => ({
      url,
      body: pages[url],
    })),
  });
const allItems = (pages: Record<string, string>) =>
  sourceIds.flatMap((id) => parseSource(envelope(pages, id), config(id)).items);

test("current local evidence produces fifteen distinct student intakes with honest eligibility and fees", async () => {
  const { pages } = await fixture();
  const items = allItems(pages);
  assert.equal(items.length, 15);
  assert.equal(new Set(items.map((item) => item.title)).size, 15);
  for (const item of items) {
    assert.deepEqual(qualityNotes(item), [], item.title);
    assert.equal(item.applicationStatus, "open");
    assert.ok(
      ["active", "expiring-soon"].includes(
        statusFor(item, new Date("2026-10-17T16:00:00Z")),
      ),
    );
    assert.equal(
      item.postedDate,
      null,
      "Collection never invents a publication date",
    );
  }
  assert.equal(
    items.filter((item) => item.opportunityType === "volunteer").length,
    11,
  );
  assert.equal(
    items.filter((item) => item.opportunityType === "leadership").length,
    2,
  );
  assert.equal(
    items.filter((item) => item.opportunityType === "career-program").length,
    1,
  );
  assert.equal(
    items.filter((item) => item.opportunityType === "youth-program").length,
    1,
  );
  for (const sourceId of [
    "toronto-library-literacy-volunteers",
    "toronto-ltc-youth-volunteers",
  ]) {
    const item = items.find(
      (entry) => entry.sourceUrl === config(sourceId).url,
    )!;
    assert.equal(
      item.minimumAge,
      null,
      "Teen eligibility does not manufacture a numerical age",
    );
  }
  const employment = items.find(
    (item) => item.title === "BGC Peel — youth employment-readiness workshops",
  )!;
  assert.equal(employment.minimumAge, null);
  assert.equal(employment.paid, "unspecified");
  assert.equal(employment.compensation, null);
  assert.match(employment.cost!, /Confirm workshop fees/);
  const keystone = items.find((item) => item.title.includes("Keystone"))!;
  assert.equal(keystone.minimumAge, 14);
  assert.match(keystone.cost!, /\$20.*membership.*cost extra/);
  const cadets = items.find((item) =>
    item.title.startsWith("Canadian Cadet Program"),
  )!;
  assert.equal(cadets.cost, null, "This evidence does not publish a cost");
  assert.equal(cadets.minimumAge, 12);
});

test("published closing dates remain calendar-only and yearless event details never become schedules", async () => {
  const { pages } = await fixture();
  const items = allItems(pages);
  const parade = items.filter((item) =>
    item.title.includes("Santa Claus Parade"),
  );
  assert.equal(parade.length, 3);
  for (const item of parade) {
    assert.equal(item.applicationClosingDate, "2026-11-03");
    assert.equal(item.applicationDeadline, null);
    assert.equal(statusFor(item, new Date("2026-11-04T05:00:00Z")), "expired");
    assert.match(item.description, /weekday labels conflict/);
  }
  for (const item of items) {
    assert.equal(item.startDate, null);
    assert.equal(item.endDate, null);
    assert.equal(item.startDateOnly, null);
    assert.equal(item.endDateOnly, null);
  }
  assert.equal(
    items.some((item) => /Halloween|Cawthra/.test(item.title)),
    false,
    "Yearless museum events were not turned into current opportunities",
  );
  assert.equal(items.filter((item) => item.applicationClosingDate).length, 3);
});

test("closed intake text, changed membership fees and removed public application controls fail verification", async () => {
  const { pages } = await fixture();
  const mutations = [
    [
      "regeneration-brampton-volunteer",
      config("regeneration-brampton-volunteer").url,
      "Opportunities Available",
      "Volunteer intake closed",
    ],
    [
      "food-banks-mississauga-youth",
      config("food-banks-mississauga-youth").url,
      "Start the application process today!",
      "Applications closed",
    ],
    [
      "toronto-library-literacy-volunteers",
      config("toronto-library-literacy-volunteers").url,
      "This location is currently only accepting limited applications for the 6:45 pm session.",
      "This branch is not accepting applications.",
    ],
    [
      "bgc-peel-youth-intakes",
      "https://www.bgcpeel.org/programs/membership-portal/",
      "$20.00",
      "$30.00",
    ],
  ];
  for (const [id, url, from, to] of mutations) {
    assert.ok(
      pages[url].includes(from),
      `${id} fixture must contain the changed evidence`,
    );
    assert.throws(
      () =>
        parseSource(
          envelope({ ...pages, [url]: pages[url].replaceAll(from, to) }, id),
          config(id),
        ),
      /facts or intake changed/,
      id,
    );
  }
  const id = "mississauga-current-youth-volunteers";
  const url = reviewedPageUrls(config(id)).find((value) =>
    value.includes("gviGuid=b3994048"),
  )!;
  const changed = pages[url].replaceAll(
    "/Application/LoggedInApplicationRedirect",
    "/NoApplicationAvailable",
  );
  assert.throws(
    () => parseSource(envelope({ ...pages, [url]: changed }, id), config(id)),
    /facts or intake changed/,
  );
  const search = config(id).url;
  assert.throws(
    () =>
      parseSource(
        envelope(
          {
            ...pages,
            [search]: pages[search].replaceAll(
              "gviGuid=b3994048-df3d-47ec-a6ff-21b26d5a73db",
              "gviGuid=removed-position",
            ),
          },
          id,
        ),
        config(id),
      ),
    /facts or intake changed/,
  );
});

test("bounded public collection preserves complete evidence and never visits application paths", async () => {
  const { pages } = await fixture();
  const source = config("mississauga-current-youth-volunteers");
  const calls: string[] = [];
  const body = await fetchApprovedSource(
    source,
    AbortSignal.timeout(1000),
    async (page) => {
      calls.push(page.url);
      assert.equal(new URL(page.url).hostname, "app.betterimpact.com");
      assert.ok(new URL(page.url).pathname.startsWith("/PublicEnterprise/"));
      assert.ok(!new URL(page.url).pathname.startsWith("/Application/"));
      return pages[page.url];
    },
  );
  assert.equal(calls.length, 7);
  assert.equal(new Set(calls).size, 7);
  assert.equal(parseSource(body, source).items.length, 6);
  const incomplete = JSON.parse(body);
  incomplete.pages.pop();
  assert.throws(
    () => parseSource(JSON.stringify(incomplete), source),
    /incomplete/,
  );
  await assert.rejects(
    fetchApprovedSource(source, AbortSignal.timeout(1000), async (page) => {
      if (page.url !== source.url) throw new Error("Public role unavailable");
      return pages[page.url];
    }),
    /Public role unavailable/,
  );
});
