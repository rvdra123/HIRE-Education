import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import {
  studentResume,
  studentPosting,
  pdfResumeBytes,
  docxResumeBytes,
} from "../tests/fixtures/local-resume.mjs";
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
assert.ok((await practice.innerText()).includes("Question 1 of 24"));
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
await practice
  .getByRole("searchbox", { name: "Search interview questions" })
  .fill("no-such-question-12345");
assert.ok((await practice.innerText()).includes("No questions match these filters"));
await practice.getByRole("button", { name: "Reset interview filters" }).click();
assert.match(
  await practice.getByRole("textbox", { name: "Your practice answer" }).inputValue(),
  /TEST FIXTURE/,
);
await practice.locator(".practice-filters select").first().selectOption("Technology internship");
await practice.getByRole("searchbox", { name: "Search interview questions" }).fill("API key");
assert.ok((await practice.innerText()).includes("Question 1 of 1"));
assert.ok(await practice.getByRole("button", { name: "Next question" }).isDisabled());
await practice.getByRole("button", { name: "Show guidance" }).click();
assert.ok((await practice.locator("#interview-guidance").innerText()).includes("Do not use, copy, share, or test"));
await practice.getByRole("button", { name: "Reset interview filters" }).click();
await practice.getByRole("button", { name: "Practice for 60 seconds" }).click();
assert.ok(await practice.getByRole("timer").isVisible());
await practice.locator(".practice-filters select").nth(1).selectOption("Safety and boundaries");
assert.equal(await practice.getByRole("timer").count(), 0);
assert.ok((await practice.locator(".practice-topic").innerText()).includes("Safety and boundaries"));
await practice.getByRole("button", { name: "Reset interview filters" }).click();
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
const reviewRequests = [];
const sentInputs = [];
const writeRequests = [];
page.on("request", (request) => {
  if (!["GET", "HEAD"].includes(request.method()))
    writeRequests.push(request.url());
  if (request.url().includes("/api/resume-review"))
    reviewRequests.push(request.url());
  const payload = `${request.url()} ${request.postData() || ""}`;
  if (
    payload.includes("Avery") ||
    payload.includes("fictional-resume") ||
    payload.includes("Responsible for organizing materials") ||
    payload.includes("Retail assistant. Help customers")
  )
    sentInputs.push(request.url());
});
// Any accidental call to the old service fails. The checker must still work.
await page.route("**/api/resume-review", (route) => route.abort());
await page.goto(`${origin}/resume-reviewer`, { waitUntil: "networkidle" });
assert.equal(
  await page.getByRole("button", { name: "Check my resume" }).isDisabled(),
  true,
);
await scan("reviewer-local");
await page.setViewportSize({ width: 390, height: 900 });
assert.ok(
  (await page.evaluate(() => document.documentElement.scrollWidth)) <= 390,
);
await scan("reviewer-form-mobile");
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByLabel("Resume text", { exact: true }).fill(studentResume);
await page.getByLabel("Target role", { exact: true }).fill("Retail assistant");
await page
  .getByLabel("Job posting or opportunity description")
  .fill(studentPosting);
await page.getByRole("button", { name: "Check my resume" }).click();
await page
  .getByRole("heading", { name: "Your resume checklist results", exact: true })
  .waitFor();
await scan("reviewer-results");
await page.locator(".checker-method summary").click();
assert.ok(await page.getByLabel("Checks for Sections & structure").isVisible());
await page
  .getByRole("button", { name: "Posting keywords", exact: true })
  .click();
await page
  .getByRole("heading", { name: "Terms found in your resume" })
  .waitFor();
assert.ok((await page.locator(".keyword-found").count()) > 0);
assert.ok(
  (await page.locator(".keyword-chips").allTextContents())
    .join(" ")
    .includes("Cash handling"),
);
await page.getByRole("button", { name: /Bullet edits/ }).click();
await page.getByRole("button", { name: "Copy suggestion" }).first().waitFor();
await page.getByRole("button", { name: "Writing & text" }).click();
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
const feedbackText = readFileSync(await feedback.path(), "utf8");
assert.match(feedbackText, /checklist-based/);
assert.match(feedbackText, /All checks/);
for (const width of [320, 390, 768]) {
  await page.setViewportSize({ width, height: 900 });
  assert.ok(
    (await page.evaluate(() => document.documentElement.scrollWidth)) <= width,
    `Dashboard overflow at ${width}`,
  );
  if (width === 390) {
    await scan("dashboard-mobile");
    await page.screenshot({
      path: "/tmp/hire-dashboard-mobile.png",
      fullPage: true,
    });
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByRole("button", { name: "Edit and check again" }).click();
assert.equal(
  await page.getByLabel("Resume text", { exact: true }).inputValue(),
  studentResume,
);
await page
  .getByLabel("Resume text", { exact: true })
  .fill(`${studentResume}\nCash handling, stocking, cleaning`);
await page.getByRole("button", { name: "Check my resume" }).click();
await page
  .getByRole("heading", { name: "Your resume checklist results", exact: true })
  .waitFor();
await page.getByRole("button", { name: "Clear review", exact: true }).click();
assert.equal(
  await page.getByLabel("Target role", { exact: true }).inputValue(),
  "",
);
assert.equal(
  await page.getByLabel("Resume text", { exact: true }).inputValue(),
  "",
);
assert.equal(
  await page.getByLabel("Job posting or opportunity description").inputValue(),
  "",
);
await page.getByRole("button", { name: "Open a file", exact: true }).click();
for (const [extension, mimeType, data] of [
  ["pdf", "application/pdf", pdfResumeBytes()],
  [
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    docxResumeBytes(),
  ],
  ["txt", "text/plain", new TextEncoder().encode(studentResume)],
]) {
  await page.locator("#resume-file").setInputFiles({
    name: `fictional-resume.${extension}`,
    mimeType,
    buffer: Buffer.from(data),
  });
  await page
    .getByText("Review and edit the extracted text", { exact: true })
    .waitFor();
  const extracted = await page
    .getByLabel("Resume text", { exact: true })
    .inputValue();
  assert.match(extracted, /Example Secondary School/);
  assert.match(extracted, /Education/);
  assert.match(extracted, /Google Sheets/);
  assert.ok(extracted.split("\n").length >= 10);
  await page.getByRole("button", { name: "Clear all fields" }).click();
}
await page.locator("#resume-file").setInputFiles({
  name: "broken.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("Not a PDF"),
});
await page
  .getByRole("alert")
  .filter({ hasText: "could not be read" })
  .waitFor();
await page.getByRole("button", { name: "Paste resume text" }).click();
await page
  .getByLabel("Resume text", { exact: true })
  .fill("Short text that is insufficient for analysis.");
await page.getByLabel("Target role", { exact: true }).fill("Retail assistant");
await page
  .getByLabel("Job posting or opportunity description")
  .fill(studentPosting);
await page.getByRole("button", { name: "Check my resume" }).click();
await page.getByRole("alert").filter({ hasText: "40 words" }).waitFor();
assert.deepEqual(reviewRequests, []);
assert.deepEqual(sentInputs, []);
assert.deepEqual(writeRequests, []);
assert.equal(
  await page.evaluate(() =>
    Object.entries(localStorage).some(([key, value]) =>
      /Avery|Retail assistant|Responsible for organizing/.test(
        `${key} ${value}`,
      ),
    ),
  ),
  false,
);
await page.reload({ waitUntil: "networkidle" });
assert.equal(
  await page.getByLabel("Resume text", { exact: true }).inputValue(),
  "",
);
await page.getByRole("button", { name: "Privacy settings" }).click();
await page.getByRole("button", { name: "Decline optional storage" }).click();
await page.getByLabel("Resume text", { exact: true }).fill(studentResume);
await page.getByLabel("Target role", { exact: true }).fill("Retail assistant");
await page
  .getByLabel("Job posting or opportunity description")
  .fill(studentPosting);
await page.getByRole("button", { name: "Check my resume" }).click();
await page
  .getByRole("heading", { name: "Your resume checklist results", exact: true })
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
