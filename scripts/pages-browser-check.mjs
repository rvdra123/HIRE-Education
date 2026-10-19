import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  studentPosting,
  pdfResumeBytes,
} from "../tests/fixtures/local-resume.mjs";

const html = readFileSync("docs/index.html");
const server = createServer((request, response) => {
  if (
    !["/HIRE-Education/", "/HIRE-Education/index.html"].includes(request.url)
  ) {
    response.writeHead(404).end();
    return;
  }
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(html);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/HIRE-Education/`;
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [],
    apiRequests = [],
    writes = [],
    badResponses = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/api/")) apiRequests.push(request.url());
    if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      badResponses.push(`${response.status()}: ${response.url()}`);
  });
  const scan = async (name) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      results.violations.map((item) => item.id),
      [],
      `Accessibility: ${name}`,
    );
    console.log(`${name}: accessibility passed`);
  };
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Decline optional storage" }).click();
  await scan("Pages homepage");
  const links = await page.locator('a[href^="/"]').count();
  assert.equal(links, 0, "Internal links must stay under the repository path");
  await page.getByRole("button", { name: "Search all resources" }).click();
  await page
    .getByRole("textbox", { name: "Search all resources" })
    .fill("resume checker");
  await page.getByRole("link", { name: /Free resume checker/ }).waitFor();
  await page.keyboard.press("Escape");
  await page
    .getByRole("link", { name: "Browse opportunities", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Student opportunities in Peel and the GTA",
      exact: true,
    })
    .waitFor();
  assert.ok(page.url().startsWith(base));
  assert.match(page.url(), /#\/opportunities$/);
  const directory = page.locator("#employer-directory");
  await directory
    .getByRole("textbox", { name: "Search employers and programs" })
    .fill("Cineplex");
  assert.equal(await directory.locator("article").count(), 1);
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("heading", {
      name: "Student opportunities in Peel and the GTA",
      exact: true,
    })
    .waitFor();
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Certificates", exact: true })
    .click();
  await page.locator("#certifications").waitFor();
  assert.match(page.url(), /section=certifications/);
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Resume & cover letter", exact: true })
    .click();
  await page.getByRole("link", { name: "Open resume reviewer" }).click();
  await page
    .getByRole("heading", {
      name: "Free resume checker for high school students",
      exact: true,
    })
    .waitFor();
  assert.match(page.url(), /#\/resume-reviewer$/);
  await page.getByRole("button", { name: "Open a file", exact: true }).click();
  await page
    .locator("#resume-file")
    .setInputFiles({
      name: "fictional-student-resume.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdfResumeBytes()),
    });
  await page
    .getByText("Review and edit the extracted text", { exact: true })
    .waitFor();
  assert.match(
    await page.getByLabel("Resume text", { exact: true }).inputValue(),
    /Example Secondary School/,
  );
  await page
    .getByLabel("Target role", { exact: true })
    .fill("Retail assistant");
  await page
    .getByLabel("Job posting or opportunity description")
    .fill(studentPosting);
  await page.getByRole("button", { name: "Check my resume" }).click();
  await page
    .getByRole("heading", {
      name: "Your resume checklist results",
      exact: true,
    })
    .waitFor();
  await scan("Pages local resume results");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      (await page.evaluate(() => document.documentElement.scrollWidth)) <=
        width,
      `Pages overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}#/privacy?section=resume-processing`, {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("heading", { name: "Browser-only resume checking", exact: true })
    .waitFor();
  await scan("Pages privacy policy");
  await page.goBack({ waitUntil: "networkidle" });
  await page
    .getByRole("heading", {
      name: "Free resume checker for high school students",
      exact: true,
    })
    .waitFor();
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page.getByLabel("Resume text", { exact: true }).inputValue(),
    "",
  );
  assert.deepEqual(apiRequests, []);
  assert.deepEqual(writes, []);
  assert.deepEqual(badResponses, []);
  assert.deepEqual(errors, []);
  console.log(
    "GitHub Pages navigation, refresh, search, PDF reading, local analysis, privacy, and responsive checks passed.",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
