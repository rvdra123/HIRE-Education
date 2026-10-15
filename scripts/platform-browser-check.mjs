import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Decline optional storage" }).click();
assert.equal(
  await page.evaluate(() => localStorage.getItem("hire-privacy-choice-v1")),
  "denied",
);
await page.getByRole("tab", { name: /Before you apply/ }).click();
await page
  .locator("#application-panel-checklist input")
  .first()
  .check({ force: true });
assert.equal(
  await page.evaluate(() =>
    localStorage.getItem("hire-education-application-checklist-v1"),
  ),
  null,
);
await page.getByRole("button", { name: "Privacy settings" }).click();
await page.getByRole("button", { name: "Accept optional storage" }).click();
await page
  .locator("#application-panel-checklist input")
  .first()
  .check({ force: true });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("tab", { name: /Before you apply/ }).click();
assert.equal(
  await page.locator("#application-panel-checklist input").first().isChecked(),
  true,
);
await page.getByRole("tab", { name: "Resume guide" }).click();
const [download] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "Download editable template" }).click(),
]);
assert.match(download.suggestedFilename(), /Resume-Template/);
await page.getByRole("button", { name: "Search all resources" }).click();
await page
  .getByRole("textbox", { name: "Search all resources" })
  .fill("cover letter");
await page
  .locator(".search-result")
  .filter({ hasText: "Cover letter guide" })
  .click();
assert.equal(
  await page
    .getByRole("tab", { name: "Cover letters" })
    .getAttribute("aria-selected"),
  "true",
);
await page.getByRole("button", { name: "Show guidance" }).click();
assert.equal(
  await page
    .getByRole("heading", { name: "Fictional student example" })
    .isVisible(),
  true,
);
await page.screenshot({
  path: "/tmp/hire-platform-desktop.png",
  fullPage: true,
});
async function scan(label) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  writeFileSync(
    `/tmp/hire-a11y-${label}.json`,
    JSON.stringify(result.violations, null, 2),
  );
  console.log(
    label,
    result.violations.map((v) => ({ id: v.id, nodes: v.nodes.length })),
  );
  assert.equal(result.violations.length, 0, `Accessibility: ${label}`);
}
await scan("home");
await page.goto("http://127.0.0.1:3000/opportunities", {
  waitUntil: "networkidle",
});
await page.getByRole("button", { name: "Filters", exact: true }).click();
await page
  .getByRole("textbox", { name: "Search jobs, volunteering, internships" })
  .fill("retail");
await page.waitForTimeout(400);
assert.ok(
  await page
    .getByRole("heading", { name: "No opportunities match these filters." })
    .isVisible(),
);
await page.getByRole("button", { name: "Clear filters" }).first().click();
await page.getByRole("button", { name: "Next month" }).click();
await page.locator(".calendar-days button").first().click();
await scan("catalogue");
await page.goto("http://127.0.0.1:3000/resume-reviewer", {
  waitUntil: "networkidle",
});
assert.equal(
  await page.getByRole("button", { name: "Review my resume" }).isDisabled(),
  true,
);
await scan("reviewer-unconfigured");
const fixture = {
  overallScore: 80,
  summary:
    "Test fixture only. Your school experience provides useful evidence.",
  scores: {
    formatting: 8,
    content: 8,
    experience: 8,
    skills: 8,
    ats: 8,
    professionalism: 8,
    jobRelevance: 8,
  },
  strongestSections: ["Experience"],
  strengths: ["Specific school project examples."],
  weaknesses: ["Some wording is vague."],
  improvements: ["Explain your contribution."],
  missingSections: [],
  grammarIssues: [],
  bulletRewrites: [
    {
      original: "Helped with a school event.",
      suggested: "Supported setup and registration at a school event.",
      why: "Uses clear actions without invented results.",
    },
  ],
  atsFeedback: {
    summary: "Use plain headings.",
    concerns: [],
    limitations: "Not a real employer ATS test.",
  },
  jobMatch: {
    score: 78,
    summary: "Relevant student experience.",
    relevantStrengths: ["Teamwork"],
    emphasizedSkills: ["Communication"],
    highlightExperience: ["School project"],
    potentialGaps: ["Availability is not stated."],
    topChanges: ["State your real availability."],
  },
  topActions: [
    "Tailor the skills.",
    "Proofread the dates.",
    "Check the employer requirements.",
  ],
};
await page.route("**/api/resume-review", async (route) =>
  route.fulfill({
    json:
      route.request().method() === "GET"
        ? { available: true }
        : { review: fixture },
  }),
);
await page.reload({ waitUntil: "networkidle" });
await page.locator("#resume-file").setInputFiles({
  name: "test-resume.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\nTEST FIXTURE\n%%EOF"),
});
await page.getByLabel("Target role", { exact: true }).fill("Retail assistant");
await page
  .getByLabel("Job posting or opportunity description")
  .fill(
    "A fictional test posting asking for communication, teamwork, reliability and weekend availability.",
  );
await page.locator(".consent-check input").check();
await page.getByRole("button", { name: "Review my resume" }).click();
await page.getByRole("heading", { name: "Strong student resume" }).waitFor();
await scan("reviewer-results");
await page.getByRole("button", { name: "Clear review", exact: true }).click();
assert.equal(
  await page.getByLabel("Target role", { exact: true }).inputValue(),
  "",
);
await page.getByRole("button", { name: "Privacy settings" }).click();
await page.getByRole("button", { name: "Decline optional storage" }).click();
assert.equal(
  await page.evaluate(() =>
    localStorage.getItem("hire-education-application-checklist-v1"),
  ),
  null,
);
await page.goto("http://127.0.0.1:3000/privacy", { waitUntil: "networkidle" });
await scan("privacy");
for (const width of [320, 375, 390, 768, 820, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const scroll = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  assert.ok(scroll <= width, `Overflow at ${width}: ${scroll}`);
  if (width === 390) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Certificates", exact: true })
      .click();
    await page.screenshot({
      path: "/tmp/hire-platform-mobile.png",
      fullPage: true,
    });
    await scan("mobile");
  }
}
assert.deepEqual(errors, []);
await browser.close();
console.log("Platform browser checks passed.");
