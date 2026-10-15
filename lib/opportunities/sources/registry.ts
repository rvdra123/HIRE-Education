import type { SourceConfig } from "../types";
import configuredSources from "@/data/sources.json";
export const officialDirectories = [
  {
    id: "brampton",
    name: "City of Brampton careers",
    url: "https://www.brampton.ca/EN/City-Hall/Employment/Pages/Welcome.aspx",
    group: "Jobs",
  },
  {
    id: "brampton-volunteer",
    name: "City of Brampton volunteering",
    url: "https://www.brampton.ca/EN/City-Hall/Employment/Volunteer-Opportunities/Pages/Welcome.aspx",
    group: "Volunteering",
  },
  {
    id: "library",
    name: "Brampton Library",
    url: "https://www.bramptonlibrary.ca/",
    group: "Events & volunteering",
  },
  {
    id: "peel",
    name: "Region of Peel",
    url: "https://www.peelregion.ca/",
    group: "Jobs & youth programs",
  },
  {
    id: "job-bank",
    name: "Government of Canada Job Bank",
    url: "https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=student&locationstring=Brampton%2C+ON",
    group: "Jobs",
  },
  {
    id: "volunteer-mbc",
    name: "Volunteer MBC",
    url: "https://volunteermbc.org/",
    group: "Volunteering",
  },
  {
    id: "ontario-summer",
    name: "Ontario summer employment",
    url: "https://www.ontario.ca/page/careers-summer-employment-opportunities",
    group: "Summer programs",
  },
  {
    id: "ja",
    name: "JA Central Ontario",
    url: "https://www.jacentralontario.org/",
    group: "Business programs",
  },
  {
    id: "sheridan",
    name: "Sheridan College",
    url: "https://www.sheridancollege.ca/",
    group: "Career events",
  },
];
export function sources(): SourceConfig[] {
  return configuredSources as SourceConfig[];
}
export function enabledSources(
  environment: Record<string, string | undefined> = process.env,
  configured = sources(),
) {
  const ids = (
    environment.OPPORTUNITY_SOURCE_IDS ??
    configured
      .filter((source) => source.enabledByDefault)
      .map((source) => source.id)
      .join(",")
  )
    .split(",")
    .map((x) => x.trim());
  return configured.filter((x) => ids.includes(x.id) && x.automationApproved);
}
