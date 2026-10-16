import { z } from "zod";
export const opportunityTypes = [
  "job",
  "volunteer",
  "internship",
  "summer-program",
  "youth-program",
  "mentorship",
  "leadership",
  "competition",
  "career-program",
  "event",
] as const;
export const listingSchema = z.object({
  title: z.string().min(4).max(180),
  organization: z.string().min(2).max(180),
  description: z.string().min(30).max(12000),
  opportunityType: z.enum(opportunityTypes),
  category: z.string().max(100),
  location: z.string().min(2).max(180),
  city: z.string().max(100).default(""),
  province: z.string().default("Ontario"),
  country: z.string().default("Canada"),
  remote: z.boolean().default(false),
  hybrid: z.boolean().default(false),
  paid: z
    .enum(["paid", "volunteer", "stipend", "unspecified"])
    .default("unspecified"),
  compensation: z.string().max(500).nullable().default(null),
  minimumAge: z.number().int().min(0).max(100).nullable().default(null),
  eligibleGrades: z.array(z.number().int().min(9).max(12)).default([]),
  eligibility: z
    .string()
    .max(2000)
    .default("Check eligibility with the organization."),
  skills: z.array(z.string().max(80)).max(25).default([]),
  hours: z.string().max(300).nullable().default(null),
  commitment: z
    .enum([
      "one-time",
      "short-term",
      "ongoing",
      "summer",
      "part-time",
      "unspecified",
    ])
    .default("unspecified"),
  applicationDeadline: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .default(null),
  startDate: z.string().datetime({ offset: true }).nullable().default(null),
  endDate: z.string().datetime({ offset: true }).nullable().default(null),
  postedDate: z.string().datetime({ offset: true }).nullable().default(null),
  sourceUrl: z.string().url(),
  applicationUrl: z.string().url(),
  applicationStatus: z.enum(["open", "closed", "unknown"]).default("unknown"),
  educationRequirement: z.string().max(500).default(""),
  experienceYears: z.number().min(0).max(50).nullable().default(null),
  cost: z.string().max(300).nullable().default(null),
});
export type ListingInput = z.input<typeof listingSchema>;
export type NormalizedListing = z.output<typeof listingSchema>;
export type OpportunityStatus =
  "active" | "expiring-soon" | "expired" | "unavailable" | "needs-review";
export type Opportunity = NormalizedListing & {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceType: SourceTrust;
  verified: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  lastVerifiedAt: string | null;
  status: OpportunityStatus;
  fingerprint: string;
  missingCount: number;
  verificationFailures: number;
  qualityNotes: string[];
  lastLinkCheckedAt?: string;
  linkFailures?: number;
};
export type SourceTrust =
  "government" | "official" | "reputable-organization" | "aggregator";
export type SourceConfig = {
  id: string;
  name: string;
  url: string;
  organization: string;
  trust: SourceTrust;
  adapter:
    | "json"
    | "jsonld"
    | "mcdonalds-jobs"
    | "skills-ontario-camps"
    | "ics"
    | "brampton-library-events"
    | "brampton-library-volunteer"
    | "brampton-volunteer"
    | "brampton-youth-cabinet"
    | "brampton-summer-company";
  intervalHours: 6 | 12 | 24;
  automationApproved: boolean;
  enabledByDefault?: boolean;
  approvalNote: string;
  completeFeed: boolean;
  allowedHosts: string[];
  defaults?: Partial<ListingInput>;
};
export type SourceResult = {
  items: NormalizedListing[];
  complete: boolean;
  rejected: number;
};
export type SourceHealth = {
  source: string;
  name: string;
  lastRun: string | null;
  lastSuccessfulRun: string | null;
  itemsFound: number;
  itemsAdded: number;
  itemsUpdated: number;
  error: string | null;
  state: "disabled" | "ok" | "failed" | "running";
};
