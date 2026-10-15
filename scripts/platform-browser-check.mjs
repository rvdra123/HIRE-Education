import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
const origin = process.env.HIRE_TEST_URL || "http://127.0.0.1:3000";
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
await page.goto(origin, { waitUntil: "networkidle" });
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
assert.equal(await page.locator(".location-pill, .eyebrow").count(), 0);
const learning = page.locator("#certifications");
assert.equal(await learning.locator("article").count(), 6);
await learning
  .getByRole("textbox", { name: "Search free learning" })
  .fill("Python");
assert.ok((await learning.locator("article").count()) > 0);
await learning
  .getByRole("combobox", { name: "Learning provider" })
  .selectOption("Kaggle Learn");
assert.ok(
  (await learning.locator("article").allTextContents()).every((t) =>
    t.includes("Kaggle Learn"),
  ),
);
await learning.getByRole("button", { name: "Clear filters" }).click();
await learning.getByRole("button", { name: /Show 12 more courses/ }).click();
assert.equal(await learning.locator("article").count(), 18);
const practice = page.locator("#interview-practice");
assert.ok((await practice.innerText()).includes("Question 1 of 12"));
await practice
  .getByRole("textbox", { name: "Your practice answer" })
  .fill("TEST FIXTURE: I helped organize a school project.");
await practice.getByRole("button", { name: "Next question" }).click();
await practice.getByRole("button", { name: "Previous", exact: true }).click();
assert.match(
  await practice
    .getByRole("textbox", { name: "Your practice answer" })
    .inputValue(),
  /TEST FIXTURE/,
);
await practice.getByRole("button", { name: "Practise for 60 seconds" }).click();
assert.ok(await practice.getByRole("timer").isVisible());
await practice.getByRole("button", { name: "Stop timer" }).click();
await page.goto(`${origin}/opportunities`, {
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
const directory = page.locator("#employer-directory");
await directory
  .getByRole("textbox", { name: "Search employers and programs" })
  .fill("Cineplex");
assert.equal(await directory.locator(".directory-card").count(), 1);
await directory
  .getByRole("textbox", { name: "Search employers and programs" })
  .fill("");
await directory
  .getByRole("combobox", { name: "Directory category" })
  .selectOption("Volunteering");
assert.ok(
  (await directory.locator(".directory-card").allTextContents()).every((t) =>
    t.includes("Volunteering"),
  ),
);
await page.goto(`${origin}/resume-reviewer`, {
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
await page
  .getByRole("heading", { name: "Your resume review", exact: true })
  .waitFor();
await scan("reviewer-results");
await page.getByRole("button", { name: "Role match", exact: true }).click();
await page
  .getByRole("heading", { name: "How your experience fits the posting" })
  .waitFor();
await page.getByRole("button", { name: /Bullet rewrites/ }).click();
await page.getByRole("button", { name: "Copy suggestion" }).waitFor();
await page.getByRole("button", { name: "Writing & layout" }).click();
await scan("reviewer-writing");
await page.getByRole("button", { name: "Overview", exact: true }).click();
await page.locator(".dashboard-actions input").first().check();
await page.screenshot({
  path: "/tmp/hire-review-dashboard.png",
  fullPage: true,
});
const [feedback] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "Download feedback" }).click(),
]);
assert.match(feedback.suggestedFilename(), /resume-feedback/);
for (const width of [320, 390, 768]) {
  await page.setViewportSize({ width, height: 900 });
  assert.ok(
    (await page.evaluate(() => document.documentElement.scrollWidth)) <= width,
    `Dashboard overflow at ${width}`,
  );
  if (width === 390) {
    await scan("dashboard-mobile");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/hire-dashboard-mobile.png",
      fullPage: true,
    });
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByRole("button", { name: "Clear review", exact: true }).click();
assert.equal(
  await page.getByLabel("Target role", { exact: true }).inputValue(),
  "",
);
await page.unroute("**/api/resume-review");
await page.route("**/api/resume-review", async (route) =>
  route.fulfill({
    status: route.request().method() === "GET" ? 200 : 503,
    json:
      route.request().method() === "GET"
        ? { available: true }
        : {
            error: "TEST FIXTURE: API billing needs attention.",
            code: "AI_BILLING_REQUIRED",
          },
  }),
);
await page.getByRole("button", { name: "Paste resume text" }).click();
await page
  .getByRole("textbox", { name: "Resume text", exact: true })
  .fill(
    "TEST FIXTURE student resume. Helped organize a class project and prepare school event materials. This is fictional test content.",
  );
await page.getByLabel("Target role", { exact: true }).fill("Test role");
await page
  .getByLabel("Job posting or opportunity description")
  .fill(
    "TEST FIXTURE posting: a fictional student role asking for teamwork, communication, and reliability.",
  );
await page.locator(".consent-check input").check();
await page.getByRole("button", { name: "Review my resume" }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "AI_BILLING_REQUIRED" })
  .waitFor();
await page.getByRole("button", { name: "Privacy settings" }).click();
await page.getByRole("button", { name: "Decline optional storage" }).click();
assert.equal(
  await page.evaluate(() =>
    localStorage.getItem("hire-education-application-checklist-v1"),
  ),
  null,
);
await page.goto(`${origin}/privacy`, { waitUntil: "networkidle" });
await scan("privacy");
for (const width of [320, 375, 390, 768, 820, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(origin, { waitUntil: "networkidle" });
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
