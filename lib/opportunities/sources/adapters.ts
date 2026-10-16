import robotsParser from "robots-parser";
import { XMLParser } from "fast-xml-parser";
import { serverFetch, boundedText } from "@/lib/security/fetch";
import {
  listingSchema,
  type SourceConfig,
  type SourceResult,
  type NormalizedListing,
} from "../types";
import { publicUrl } from "../quality";
import { bramptonListings } from "./brampton";
import { mcdonaldsJobLinks, mcdonaldsListings } from "./mcdonalds";
import { skillsOntarioCamps } from "./skills-ontario";
import { bramptonJobLinks, bramptonJobs } from "./brampton-jobs";
import { hackClubCommunity } from "./hack-club";
const agent = "HIREEducationBot";
function permitted(url: string, source: SourceConfig) {
  const u = new URL(url);
  if (!publicUrl(url) || !source.allowedHosts.includes(u.hostname))
    throw new Error("Source host is not approved");
  return u;
}
async function get(url: string, source: SourceConfig, signal: AbortSignal) {
  let current = url;
  for (let i = 0; i < 4; i++) {
    permitted(current, source);
    const response = await serverFetch(current, {
      signal,
      redirect: "manual",
      headers: {
        "User-Agent": `${agent}/1.0 (student opportunity directory)`,
        Accept: "application/json,text/calendar,text/html,text/plain",
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const next = response.headers.get("location");
      await response.body?.cancel();
      if (!next) throw new Error("Invalid source redirect");
      current = new URL(next, current).href;
      continue;
    }
    return response;
  }
  throw new Error("Too many source redirects");
}
export async function fetchApprovedPage(
  source: SourceConfig,
  signal: AbortSignal,
) {
  if (!source.automationApproved)
    throw new Error("Source permission has not been approved");
  const u = permitted(source.url, source);
  const robotsUrl = `${u.origin}/robots.txt`;
  const robotsResponse = await get(robotsUrl, source, signal);
  let robots = "";
  if (robotsResponse.status === 404) {
    await robotsResponse.body?.cancel();
  } else {
    if (!robotsResponse.ok)
      throw new Error("Could not confirm automated access");
    robots = await boundedText(robotsResponse, 200_000);
  }
  const policy = robotsParser(robotsUrl, robots);
  if (policy.isAllowed(source.url, agent) === false)
    throw new Error("Automated access is disallowed by robots.txt");
  const delay = policy.getCrawlDelay(agent);
  if (delay && delay > 0)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(delay, 10) * 1000),
    );
  if (delay && delay > 10)
    throw new Error("Source crawl delay requires a slower adapter");
  const response = await get(source.url, source, signal);
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  return boundedText(response);
}
export async function fetchApprovedSource(
  source: SourceConfig,
  signal: AbortSignal,
  fetchPage = fetchApprovedPage,
) {
  if (!source.automationApproved)
    throw new Error("Source permission has not been approved");
  const body = await fetchPage(source, signal);
  if (
    source.adapter !== "mcdonalds-jobs" &&
    source.adapter !== "brampton-careers-sitemap"
  )
    return body;
  // A bounded first-page selection, never a complete employer inventory.
  // Each detail page goes through the same host, redirect and robots checks.
  const details: { url: string; body: string }[] = [];
  const links =
    source.adapter === "mcdonalds-jobs"
      ? mcdonaldsJobLinks(body)
      : bramptonJobLinks(body);
  for (const url of links) {
    details.push({
      url,
      body: await fetchPage({ ...source, url, adapter: "jsonld" }, signal),
    });
  }
  return JSON.stringify({ search: body, details });
}
const text = (value: unknown) =>
  typeof value === "string"
    ? value
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
const date = (v: unknown) => {
  const s = text(v);
  if (!s) return null;
  const n = Date.parse(s);
  return Number.isNaN(n) ? null : new Date(n).toISOString();
};
function jsonLdItems(html: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    if (o["@type"] === "JobPosting" || o["@type"] === "Event") out.push(o);
    if (o["@graph"]) walk(o["@graph"]);
    if (o.itemListElement) walk(o.itemListElement);
    if (o.item) walk(o.item);
  };
  for (const match of html.matchAll(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      walk(JSON.parse(match[1]));
    } catch {
      /* Non-JSON scripts cannot become listings. */
    }
  }
  return out;
}
function object(v: unknown) {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}
function jobFromLd(v: Record<string, unknown>, source: SourceConfig): unknown {
  const employer = object(v.hiringOrganization);
  const venue = object(
    Array.isArray(v.jobLocation)
      ? v.jobLocation[0]
      : v.jobLocation || v.location,
  );
  const address = object(venue.address);
  const start = date(v.startDate);
  const deadline = date(v.validThrough);
  const event = v["@type"] === "Event";
  const end = date(v.endDate);
  const url = text(v.url);
  const explicitClosed = /EventCancelled|EventPostponed/.test(
    text(v.eventStatus),
  );
  return {
    ...source.defaults,
    title: text(v.title || v.name),
    organization:
      text(employer.name || object(v.organizer).name) || source.organization,
    description: text(v.description),
    opportunityType: event ? "event" : "job",
    category: event ? "Youth events" : "General employment",
    location:
      [text(address.addressLocality), text(address.addressRegion)]
        .filter(Boolean)
        .join(", ") ||
      source.defaults?.location ||
      "",
    city: text(address.addressLocality),
    province: text(address.addressRegion) || "Ontario",
    country: text(address.addressCountry) || "Canada",
    remote: v.jobLocationType === "TELECOMMUTE",
    paid: event ? "unspecified" : "paid",
    compensation: v.baseSalary
      ? JSON.stringify(v.baseSalary).slice(0, 500)
      : null,
    sourceUrl: source.url,
    applicationUrl: url,
    applicationDeadline: deadline,
    startDate: start,
    endDate: end,
    postedDate: date(v.datePosted),
    educationRequirement: text(v.educationRequirements),
    applicationStatus: explicitClosed
      ? "closed"
      : event && start && url
        ? "open"
        : deadline && Date.parse(deadline) > Date.now() && url
          ? "open"
          : "unknown",
    cost: text(object(v.offers).price) || null,
  };
}
function icsItems(body: string, source: SourceConfig): unknown[] {
  const unfolded = body.replace(/\r?\n[ \t]/g, "");
  const items: unknown[] = [];
  const unescape = (s: string) =>
    s.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1");
  for (const match of unfolded.matchAll(
    /BEGIN:VEVENT\r?\n([\s\S]*?)END:VEVENT/g,
  )) {
    const fields: Record<string, string> = {};
    for (const line of match[1].split(/\r?\n/)) {
      const colon = line.indexOf(":");
      if (colon < 0) continue;
      const key = line.slice(0, colon);
      if (/TZID=/i.test(key)) continue;
      fields[key.split(";")[0]] = unescape(line.slice(colon + 1));
    }
    const parseIcs = (s: string | undefined) => {
      if (!s) return null;
      if (/^\d{8}T\d{6}Z$/.test(s))
        return date(
          `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`,
        );
      return null;
    };
    const start = parseIcs(fields.DTSTART);
    items.push({
      ...source.defaults,
      title: fields.SUMMARY,
      organization: source.organization,
      description: fields.DESCRIPTION,
      opportunityType: "event",
      category: "Youth events",
      location: fields.LOCATION || source.defaults?.location,
      sourceUrl: source.url,
      applicationUrl: fields.URL,
      startDate: start,
      endDate: parseIcs(fields.DTEND),
      applicationStatus:
        fields.STATUS === "CANCELLED"
          ? "closed"
          : start && fields.URL
            ? "open"
            : "unknown",
    });
  }
  return items;
}
export function parseSource(body: string, source: SourceConfig): SourceResult {
  let raw: unknown[];
  if (source.adapter === "json") {
    const parsed = JSON.parse(body);
    raw = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.items)
        ? parsed.items
        : [];
    if (!Array.isArray(parsed) && !Array.isArray(parsed.items))
      throw new Error("Feed format changed");
  } else if (source.adapter === "mcdonalds-jobs") raw = mcdonaldsListings(body);
  else if (source.adapter === "brampton-careers-sitemap")
    raw = bramptonJobs(body);
  else if (source.adapter === "hack-club-community")
    raw = hackClubCommunity(body, source);
  else if (source.adapter === "skills-ontario-camps")
    raw = skillsOntarioCamps(body, source);
  else if (source.adapter.startsWith("brampton-"))
    raw = bramptonListings(body, source);
  else if (source.adapter === "ics") raw = icsItems(body, source);
  else raw = jsonLdItems(body).map((v) => jobFromLd(v, source));
  if (raw.length > 5000) throw new Error("Source item limit exceeded");
  const items: NormalizedListing[] = [];
  let rejected = 0;
  for (const value of raw) {
    const result = listingSchema.safeParse({
      ...source.defaults,
      ...object(value),
    });
    if (result.success) items.push(result.data);
    else rejected++;
  }
  return { items, complete: source.completeFeed && rejected === 0, rejected };
}
// XML feeds can be transformed by an approved source-specific adapter without rendering HTML.
export const xmlParser = new XMLParser({
  ignoreAttributes: false,
  processEntities: false,
});
