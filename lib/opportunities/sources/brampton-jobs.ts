import { load } from "cheerio";
import { z } from "zod";
import type { ListingInput } from "../types";

const origin = "https://careers.brampton.ca";
const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const identity = (value: string) =>
  decodeURIComponent(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const selected =
  /swim-instructor|lifeguard|outdoor-skate-instructor|aquafit-instructor|personal-trainer|fitness-floor-staff/i;

export function bramptonJobLinks(body: string) {
  const $ = load(body, { xml: true });
  if ($("urlset").length !== 1) throw new Error("City careers sitemap changed");
  const links = $("url > loc")
    .toArray()
    .map((el) => $(el).text().trim());
  if (!links.length || links.length > 1000)
    throw new Error("City careers sitemap is missing or too large");
  for (const link of links) {
    const url = new URL(link);
    if (
      url.origin !== origin ||
      !/^\/job\/BRAMPTON-[^/]+\/\d+\/$/.test(url.pathname)
    )
      throw new Error("City careers sitemap contains an unexpected job URL");
  }
  // A bounded recreation selection; absence from it never establishes closure.
  return [
    ...new Set(links.filter((link) => selected.test(new URL(link).pathname))),
  ].slice(0, 12);
}

const envelope = z.object({
  search: z.string(),
  details: z
    .array(z.object({ url: z.string().url(), body: z.string() }))
    .max(12),
});

export function bramptonJobs(body: string): ListingInput[] {
  const data = envelope.parse(JSON.parse(body));
  const links = bramptonJobLinks(data.search);
  const details = new Map(
    data.details.map((detail) => [detail.url, detail.body]),
  );
  if (details.size !== data.details.length || details.size !== links.length)
    throw new Error("City careers detail selection is incomplete");
  return links.map((link) => {
    const html = details.get(link);
    if (!html) throw new Error("City careers detail page missing");
    const $ = load(html);
    const title = clean($("[itemprop=title]").text());
    const canonical = new URL(
      $("link[rel=canonical]").attr("href") || "",
      origin,
    );
    const path = /^\/job\/([^/]+)\/(\d+)-en_US\/$/.exec(canonical.pathname);
    const expectedTitle = new URL(link).pathname
      .split("/")[2]
      .replace(/^BRAMPTON-/, "")
      .replace(/-ON-[A-Z0-9]+$/, "");
    if (
      canonical.origin !== origin ||
      !path ||
      !title ||
      identity(title) !== identity(expectedTitle) ||
      identity(path[1]) !== identity(title)
    )
      throw new Error("City careers job identity changed");
    const descriptions = $("[itemprop=description]");
    const text = clean(descriptions.text());
    const summary = clean(descriptions.first().text());
    const rate = /Hourly Rate:\s*(\$\d+(?:\.\d{2})?)/i.exec(summary)?.[1];
    const age = /Minimum (\d{1,2}) years of age/i.exec(text)?.[1];
    const date = /Closing Date:\s*(\d{2})\/(\d{2})\/(\d{4})/i.exec(summary);
    const qualifications = descriptions
      .find("ul")
      .toArray()
      .map((el) => clean($(el).text()))
      .filter((s) => /Minimum \d{1,2} years of age/i.test(s));
    const count = /Number of Positions:\s*(\d+)/i.exec(summary)?.[1];
    const hours = /Hours of Work:\s*(.+?)\s*Location:/i.exec(summary)?.[1];
    if (
      !rate ||
      !age ||
      !date ||
      !count ||
      !hours ||
      qualifications.length !== 1 ||
      !/Part Time \(PT\)/.test(summary) ||
      !/Division:\s*Recreation/.test(summary)
    )
      throw new Error("City careers job requirements changed");
    const closing = z.iso.date().parse(`${date[3]}-${date[1]}-${date[2]}`);
    const apply = $("a")
      .toArray()
      .some((el) => {
        const url = new URL($(el).attr("href") || "", origin);
        return (
          /^Apply now$/i.test(clean($(el).text())) &&
          url.origin === origin &&
          url.pathname === `/talentcommunity/apply/${path[2]}/`
        );
      });
    // Link to the public detail, never collect the disallowed application path.
    const open =
      apply &&
      Number(count) > 0 &&
      !/talent pool|future vacanc|no longer available|applications? (?:are )?closed/i.test(
        text,
      );
    return {
      title,
      organization: "City of Brampton",
      description: `Paid part-time recreation position in Brampton. The City advertises ${count} positions at ${rate} per hour. Minimum age: ${age}. Closing date: ${closing}; the source does not publish a closing time. Required qualifications and permitted certification completion periods: ${qualifications[0]} Check the official posting for duties and the full hiring conditions.`,
      opportunityType: "job",
      category: "Recreation and instruction",
      location: "Brampton, Ontario",
      city: "Brampton",
      paid: "paid",
      compensation: `${rate} per hour`,
      minimumAge: Number(age),
      eligibility: qualifications[0],
      commitment: "part-time",
      hours,
      sourceUrl: canonical.href,
      applicationUrl: canonical.href,
      applicationClosingDate: closing,
      applicationStatus: open ? "open" : "unknown",
    };
  });
}
