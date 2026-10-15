import { saveOpportunity } from "../lib/opportunities/store";
import { listingSchema, type SourceConfig } from "../lib/opportunities/types";
import { closeDatabase } from "../lib/opportunities/db";
const source: SourceConfig = {
  id: "browser-test-fixture",
  name: "TEST FIXTURE ONLY",
  url: "https://example.org/test-feed",
  organization: "Fictional browser-test organization",
  trust: "official",
  adapter: "json",
  intervalHours: 6,
  automationApproved: true,
  approvalNote: "Isolated browser test only.",
  completeFeed: true,
  allowedHosts: ["example.org"],
};
async function main() {
  if (!process.env.DATABASE_URL?.includes("/tmp/hire-browser-"))
    throw new Error(
      "Browser fixtures require an isolated temporary test database.",
    );
  for (let n = 1; n <= 29; n++) {
    await saveOpportunity(
      listingSchema.parse({
        title: `TEST FIXTURE Student assistant ${n}`,
        organization: "Fictional browser-test organization",
        description:
          "This is fictional test data in an isolated browser-test database. It is never seeded into the production catalogue. The sample student role asks for communication, teamwork and reliable availability.",
        opportunityType: "job",
        category: "Retail",
        city: "Brampton",
        location: "Brampton, Ontario",
        sourceUrl: source.url,
        applicationUrl: `https://example.org/test-role/${n}`,
        applicationStatus: "open",
        paid: "paid",
        eligibleGrades: [10, 11, 12],
        skills: ["Communication", "Teamwork"],
        applicationDeadline: new Date(
          Date.now() + (n === 1 ? 2 : 10) * 86400000,
        ).toISOString(),
      }),
      source,
    );
  }
  await saveOpportunity(
    listingSchema.parse({
      title: "TEST FIXTURE Youth workshop",
      organization: "Fictional browser-test organization",
      description:
        "This fictional workshop exists solely for calendar testing in the isolated test database. No real event is being advertised.",
      opportunityType: "event",
      category: "Career skills",
      city: "Brampton",
      location: "Brampton, Ontario",
      sourceUrl: source.url,
      applicationUrl: "https://example.org/test-event",
      applicationStatus: "open",
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 90000000).toISOString(),
      cost: "Free (test fixture only)",
    }),
    source,
  );
  await closeDatabase();
  console.log(
    "Isolated browser fixtures created. No production records were changed.",
  );
}
main();
