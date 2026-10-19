import { createHash } from "node:crypto";
import { load } from "cheerio";
import { z } from "zod";
import reviewed from "@/data/richmond-jobs.json";
import { listingSchema, type ListingInput } from "../types";

const origin = "https://jobs.richmondhill.ca";
const clean = (text: string) =>
  text.normalize("NFKC").replace(/\s+/g, " ").trim();
const records = z
  .array(
    z.object({
      id: z.string().regex(/^\d+$/),
      title: z.string().min(1),
      expectedPositions: z.number().int().positive(),
      qualificationSha256: z.string().regex(/^[a-f0-9]{64}$/),
      facts: z.array(z.string()).min(1),
      listing: listingSchema.omit({ applicationStatus: true }),
    }),
  )
  .parse(reviewed);

/** Select only seven individually reviewed requisitions, never a broad employer inventory. */
export function richmondJobLinks(body: string) {
  const sitemap = load(body, { xml: true });
  if (sitemap("urlset").length !== 1)
    throw new Error("Richmond Hill careers sitemap changed");
  const urls = sitemap("url > loc")
    .toArray()
    .map((element) => sitemap(element).text().trim());
  if (!urls.length || urls.length > 500)
    throw new Error("Richmond Hill careers sitemap is missing or too large");
  const selected: string[] = [];
  const ids = new Set<string>();
  for (const value of urls) {
    const url = new URL(value);
    const id = /^\/job\/[^/]+\/(\d+)\/$/.exec(url.pathname)?.[1];
    if (
      url.origin !== origin ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !id
    )
      throw new Error(
        "Richmond Hill careers sitemap contains an unexpected URL",
      );
    const record = records.find((item) => item.id === id);
    if (!record) continue;
    if (record.listing.sourceUrl !== value || ids.has(id))
      throw new Error("Richmond Hill careers job identity changed");
    selected.push(value);
    ids.add(id);
  }
  return selected;
}

const envelope = z.object({
  search: z.string(),
  details: z
    .array(z.object({ url: z.string().url(), body: z.string() }))
    .max(7),
});

export function richmondJobs(body: string): ListingInput[] {
  const data = envelope.parse(JSON.parse(body));
  const urls = richmondJobLinks(data.search);
  const details = new Map(
    data.details.map((detail) => [detail.url, detail.body]),
  );
  if (details.size !== data.details.length || details.size !== urls.length)
    throw new Error("Richmond Hill careers details are incomplete");
  return urls.map((url) => {
    const html = details.get(url);
    const record = records.find((item) => item.listing.sourceUrl === url)!;
    if (!html) throw new Error("Richmond Hill careers detail is missing");
    const page = load(html);
    if (
      page("link[rel=canonical]").attr("href") !== url ||
      clean(page("h1").text()) !== record.title
    )
      throw new Error("Richmond Hill careers job identity changed");
    const text = clean(page("[itemprop=description]").text());
    const qualifications =
      /Education and Experience\s*(.+?)\s*Leadership Competencies/.exec(
        text,
      )?.[1];
    if (
      !qualifications ||
      createHash("sha256").update(qualifications).digest("hex") !==
        record.qualificationSha256
    )
      throw new Error(
        "Richmond Hill careers qualifications changed and require review",
      );
    const positions = /Number of Positions\s+(\d+)/.exec(text)?.[1];
    if (
      !positions ||
      Number(positions) !== record.expectedPositions ||
      !record.facts.every((fact) => text.includes(clean(fact)))
    )
      throw new Error(
        "Richmond Hill careers vacancy facts changed and require review",
      );
    const apply = page("a")
      .toArray()
      .some((element) => {
        if (!/^Apply now/i.test(clean(page(element).text()))) return false;
        const href = new URL(page(element).attr("href") || "", url);
        return (
          href.origin === origin &&
          /^\/talentcommunity\/apply\/\d+\/$/.test(href.pathname)
        );
      });
    const open =
      apply &&
      Number(positions) > 0 &&
      /Replacement\/New Position\s+(?:New Vacancy|Replacement for Existing Vacancy)/.test(
        text,
      ) &&
      !/talent pool|candidate pool|future vacancies|not (?:for )?an? existing vacancy|no longer available|applications? (?:are )?closed/i.test(
        text,
      );
    // Only original descriptions and factual metadata leave this adapter.
    // The source qualification prose is compared by hash, never republished.
    return { ...record.listing, applicationStatus: open ? "open" : "unknown" };
  });
}
