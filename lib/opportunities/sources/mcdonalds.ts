import { load } from "cheerio";
import { z } from "zod";
import type { ListingInput } from "../types";

const origin = "https://careers.mcdonalds.ca";
const job = z.object({
  title: z.string(),
  originalURL: z.string().regex(/^[a-z0-9-]+\/job\/P\d+-\d+-\d+$/),
  locations: z.array(z.object({ city: z.string(), stateAbbr: z.string() })),
  customFields: z.array(z.object({ cfKey: z.string(), value: z.string() })),
});
function searchJobs(body: string) {
  const $ = load(body);
  const script = $("script")
    .toArray()
    .map((el) => $(el).text())
    .find((s) => s.includes("window.__PRELOAD_STATE__ ="));
  const match = script?.match(/window\.__PRELOAD_STATE__\s*=\s*(\{[^\n]+\});/);
  if (!match) throw new Error("McDonald's public search structure changed");
  const state = z
    .object({
      jobSearch: z.object({
        params: z.object({ keyword: z.literal("Brampton") }),
        jobs: z.array(job).max(10),
        totalJob: z.number().int().nonnegative(),
      }),
    })
    .parse(JSON.parse(match[1]));
  return state.jobSearch.jobs.filter(
    (j) =>
      j.locations.length === 1 &&
      j.locations[0].city === "Brampton" &&
      j.locations[0].stateAbbr === "ON" &&
      /crew|cashier|line cook|maintenance/i.test(j.title) &&
      !/manager|supervisor|overnight/i.test(j.title),
  );
}
export function mcdonaldsJobLinks(body: string) {
  return [
    ...new Set(searchJobs(body).map((j) => `${origin}/${j.originalURL}`)),
  ];
}
const envelope = z.object({
  search: z.string(),
  details: z
    .array(z.object({ url: z.string().url(), body: z.string() }))
    .max(10),
});
const posting = z.object({
  "@type": z.literal("JobPosting"),
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  datePosted: z.string().datetime({ offset: true }).optional(),
  validThrough: z.string().datetime({ offset: true }).optional(),
  hiringOrganization: z.object({ name: z.string() }),
  jobLocation: z
    .array(
      z.object({
        address: z.object({
          streetAddress: z.string(),
          addressLocality: z.literal("Brampton"),
          addressRegion: z.literal("ON"),
          addressCountry: z.literal("CA"),
        }),
      }),
    )
    .length(1),
});
export function mcdonaldsListings(body: string): ListingInput[] {
  const data = envelope.parse(JSON.parse(body));
  const jobs = searchJobs(data.search);
  const details = new Map(data.details.map((d) => [d.url, d.body]));
  if (details.size !== data.details.length || details.size !== jobs.length)
    throw new Error("McDonald's detail selection is incomplete");
  return jobs.map((j) => {
    const url = `${origin}/${j.originalURL}`;
    const html = details.get(url);
    if (!html) throw new Error("McDonald's detail page missing");
    const $ = load(html);
    const records = $("script[type='application/ld+json']")
      .toArray()
      .map((el) => JSON.parse($(el).text()))
      .filter((v) => v?.["@type"] === "JobPosting");
    if (records.length !== 1) throw new Error("McDonald's job data changed");
    const ld = posting.parse(records[0]);
    if (ld.url !== url || ld.title !== j.title)
      throw new Error("McDonald's job identity changed");
    const fields = new Map(j.customFields.map((f) => [f.cfKey, f.value]));
    const vacancy = fields.get("cf_job_vacancy") || "";
    const apply = $("#job-details a.apply-button")
      .toArray()
      .some(
        (a) =>
          /^https:\/\/www\.mchire\.com\/co\/[A-Za-z0-9]+\/Job\?job_id=/.test(
            $(a).attr("href") || "",
          ) && /^Apply Now$/i.test($(a).text().trim()),
      );
    const description = load(ld.description).text().replace(/\s+/g, " ").trim();
    const age = fields.get("cf_minimum_age");
    if (age && !/^\d{1,2}$/.test(age))
      throw new Error("McDonald's minimum age changed");
    return {
      title: ld.title,
      organization: ld.hiringOrganization.name,
      description: `${description} Posting type: ${vacancy || "unspecified by employer"}.`,
      opportunityType: "job",
      category: "Restaurant employment",
      location: `${ld.jobLocation[0].address.streetAddress}, Brampton, Ontario`,
      city: "Brampton",
      paid: "paid",
      minimumAge: age ? Number(age) : null,
      eligibility: age
        ? `Minimum age: ${age}. Check other requirements with the employer.`
        : "Check age and eligibility with the employer.",
      commitment:
        /part-time/i.test(j.title) ||
        fields.get("cf_sap_employment_status") === "PT"
          ? "part-time"
          : "unspecified",
      sourceUrl: url,
      applicationUrl: url,
      applicationDeadline: ld.validThrough
        ? new Date(ld.validThrough).toISOString()
        : null,
      postedDate: ld.datePosted ? new Date(ld.datePosted).toISOString() : null,
      // Future-vacancy pools and missing status never become confirmed openings.
      // The employer currently spells this value "Existing Vacany".
      applicationStatus:
        /^Existing Vaca(?:ncy|ny)$/i.test(vacancy) &&
        apply &&
        !/no longer available|applications? (?:are )?closed/i.test(
          $("#job-details").text(),
        )
          ? "open"
          : "unknown",
    };
  });
}
