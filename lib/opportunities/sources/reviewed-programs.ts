import { load } from "cheerio";
import { z } from "zod";
import definitions from "@/data/reviewed-programs.json";
import { listingSchema, type ListingInput, type SourceConfig } from "../types";

const evidence = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("pdf-sha256"),
    url: z.string().url(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  z.object({
    kind: z.literal("html"),
    url: z.string().url(),
    text: z.array(z.string().min(1)).min(1),
    links: z.array(z.string()).default([]),
    selectors: z.array(z.string()).default([]),
  }),
  z.object({ kind: z.literal("coding-coach"), url: z.string().url() }),
  z.object({
    kind: z.literal("microsoft-path"),
    url: z.string().url(),
    title: z.string(),
    moduleCount: z.number().int().min(1).max(40),
    prerequisites: z.string(),
    firstModuleUrl: z.string().url(),
  }),
  z.object({
    kind: z.literal("hack-club"),
    url: z.string().url(),
    slug: z.string(),
    programUrl: z.string().url(),
    start: z.iso.date(),
    end: z.iso.date(),
  }),
]);
const records = z
  .array(
    z.object({
      id: z.string(),
      sourceId: z.string(),
      listing: listingSchema.omit({ applicationStatus: true }),
      evidence: z.array(evidence).min(1),
    }),
  )
  .parse(definitions);
const envelope = z.object({
  pages: z.array(z.object({ url: z.string().url(), body: z.string() })).max(8),
});
const normalise = (value: string) =>
  value
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
const linkIdentity = (value: string, base: string) => {
  const url = new URL(value, base);
  if (url.username || url.password)
    throw new Error("Unexpected evidence URL credentials");
  return `${url.protocol}//${url.host}${url.pathname}`
    .replace(/\/$/, "")
    .toLowerCase();
};

export function reviewedPageUrls(source: SourceConfig) {
  const selected = records.filter((record) => record.sourceId === source.id);
  if (!selected.length) throw new Error("No reviewed programs for this source");
  const urls = [
    ...new Set(
      selected.flatMap((record) => record.evidence.map((item) => item.url)),
    ),
  ];
  if (urls.length > 8 || !urls.includes(source.url))
    throw new Error("Invalid reviewed page selection");
  return urls;
}

export function reviewedPrograms(
  body: string,
  source: SourceConfig,
): ListingInput[] {
  const data = envelope.parse(JSON.parse(body));
  const pages = new Map(data.pages.map((page) => [page.url, page.body]));
  const required = reviewedPageUrls(source);
  if (
    pages.size !== data.pages.length ||
    pages.size !== required.length ||
    required.some((url) => !pages.has(url))
  )
    throw new Error("Reviewed program evidence is incomplete");
  return records
    .filter((record) => record.sourceId === source.id)
    .map((record) => {
      for (const check of record.evidence) {
        const html = pages.get(check.url)!;
        if (check.kind === "pdf-sha256") {
          const document = z
            .object({ documentType: z.literal("pdf"), sha256: z.string() })
            .parse(JSON.parse(html));
          if (document.sha256 !== check.sha256)
            throw new Error(
              "Reviewed PDF changed; program facts need a new review",
            );
        } else if (check.kind === "microsoft-path") {
          // Learn serves its public structured document when JSON is requested.
          const path = z
            .object({
              schema: z.literal("LearningPath"),
              title: z.string(),
              prerequisites: z.string(),
              modules: z.array(z.string()).min(1).max(40),
              metadata: z.object({ canonical_url: z.string().url() }),
              _xrefmap: z.record(
                z.string(),
                z.object({ href: z.string().optional() }),
              ),
            })
            .parse(JSON.parse(html));
          const prerequisites = load(path.prerequisites).text();
          if (
            normalise(path.title) !== normalise(check.title) ||
            linkIdentity(path.metadata.canonical_url, check.url) !==
              linkIdentity(check.url, check.url) ||
            new Set(path.modules).size !== check.moduleCount ||
            !normalise(prerequisites).includes(
              normalise(check.prerequisites),
            ) ||
            !path.modules.some((module) => {
              const href = path._xrefmap[module]?.href;
              return (
                href &&
                linkIdentity(href, check.url) ===
                  linkIdentity(check.firstModuleUrl, check.url)
              );
            })
          )
            throw new Error(
              "Microsoft learning path identity or requirements changed",
            );
        } else if (check.kind === "coding-coach") {
          // Only availability is inspected. Mentor identities and contact details are never stored.
          const mentors = z
            .object({
              success: z.literal(true),
              data: z
                .array(z.object({ available: z.boolean().optional() }))
                .max(100),
            })
            .parse(JSON.parse(html));
          if (!mentors.data.some((mentor) => mentor.available === true))
            throw new Error("No available coding mentors confirmed");
        } else if (check.kind === "hack-club") {
          const feed = z
            .object({
              data: z
                .array(
                  z.object({
                    slug: z.string(),
                    url: z.string().url().nullable(),
                    status: z.string(),
                    format: z.string().nullable(),
                    startDate: z.string().nullable(),
                    endDate: z.string().nullable(),
                  }),
                )
                .max(1000),
            })
            .parse(JSON.parse(html));
          const program = feed.data.find((item) => item.slug === check.slug);
          if (
            !program ||
            !program.url ||
            program.status !== "ongoing" ||
            program.format !== "online" ||
            linkIdentity(program.url, check.url) !==
              linkIdentity(check.programUrl, check.url) ||
            program.startDate !== check.start ||
            program.endDate !== check.end
          )
            throw new Error("Hack Club program status or schedule changed");
        } else {
          const $ = load(html);
          $("script,style,noscript").remove();
          const text = normalise($("body").text());
          if (
            check.text.some((value) => !text.includes(normalise(value))) ||
            check.selectors.some((selector) => !$(selector).length)
          )
            throw new Error(
              `Reviewed program facts or intake changed: ${record.id}`,
            );
          const links = $("a[href]")
            .toArray()
            .map((element) => $(element).attr("href")!);
          if (
            check.links.some(
              (expected) =>
                !links.some((actual) => {
                  try {
                    return (
                      linkIdentity(actual, check.url) ===
                      linkIdentity(expected, check.url)
                    );
                  } catch {
                    return false;
                  }
                }),
            )
          )
            throw new Error(`Reviewed application link changed: ${record.id}`);
        }
      }
      for (const url of [
        record.listing.sourceUrl,
        record.listing.applicationUrl,
      ])
        if (!source.allowedHosts.includes(new URL(url).hostname))
          throw new Error("Program listing host is not approved");
      // Curated factual summaries are published only while every live evidence check passes.
      return { ...record.listing, applicationStatus: "open" };
    });
}
