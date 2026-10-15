import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
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
await page.screenshot({ path: "/tmp/hire-desktop.png", fullPage: true });
assert.match(await page.title(), /Brampton/);
assert.equal(await page.locator("h1").count(), 1);
// Global search covers official resources as well as guides.
await page.getByRole("button", { name: "Search all resources" }).click();
await page
  .getByRole("textbox", { name: "Search all resources", exact: true })
  .fill("resume");
assert.ok((await page.locator(".search-result").count()) > 0);
await page.keyboard.press("Escape");
assert.equal(await page.getByRole("dialog").count(), 0);
await page.getByRole("button", { name: "Search all resources" }).click();
await page
  .getByRole("textbox", { name: "Search all resources", exact: true })
  .fill("cover letter");
await page
  .locator(".search-result")
  .filter({ hasText: "Write a cover letter" })
  .click();
assert.equal(
  await page
    .getByRole("tab", { name: "Cover letters" })
    .getAttribute("aria-selected"),
  "true",
);
await page.getByRole("tab", { name: "Resume guide" }).click();
// Source category switching and empty state recovery.
await page.getByRole("button", { name: "Student jobs", exact: true }).click();
await page
  .getByRole("textbox", { name: "Search opportunities" })
  .fill("nothingmatchesxyz");
await page.getByRole("heading", { name: "No matches just yet." }).waitFor();
await page
  .locator("#opportunities")
  .getByRole("button", { name: "Clear filters" })
  .last()
  .click();
assert.ok((await page.locator("#opportunities article").count()) > 0);
// Bookmark survives a full page load.
const bookmark = page
  .locator("#opportunities article")
  .first()
  .getByRole("button");
await bookmark.click();
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Student jobs", exact: true }).click();
assert.equal(
  await page
    .locator("#opportunities article")
    .first()
    .getByRole("button")
    .getAttribute("aria-pressed"),
  "true",
);
// Learning category filters produce matching cards.
await page.getByRole("button", { name: "Marketing", exact: true }).click();
assert.match(
  await page.locator("#certifications article").first().innerText(),
  /HubSpot/,
);
await page
  .locator("#certifications")
  .getByRole("button", { name: "Clear filters" })
  .click();
// Editable file is a real browser download.
const [download] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "Download editable template" }).click(),
]);
assert.match(download.suggestedFilename(), /Resume-Template\.txt/);
// Application checklist state persists locally.
await page.getByRole("tab", { name: /Before you apply/ }).click();
const first = page
  .locator("#application-panel-checklist input[type=checkbox]")
  .first();
await first.check({ force: true });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("tab", { name: /Before you apply/ }).click();
assert.equal(
  await page
    .locator("#application-panel-checklist input[type=checkbox]")
    .first()
    .isChecked(),
  true,
);
await page.getByRole("button", { name: "Reset checklist" }).click();
assert.equal(
  await page.locator("#application-panel-checklist input:checked").count(),
  0,
);
await page.getByRole("tab", { name: "Cover letters" }).click();
assert.ok(
  await page
    .getByRole("button", { name: "Download cover letter template" })
    .isVisible(),
);
// Skills, library and FAQ are usable.
await page.locator("#skills details").first().locator("summary").click();
assert.ok((await page.locator("#skills details[open]").count()) > 0);
await page
  .getByRole("button", { name: "Local & community", exact: true })
  .click();
assert.ok((await page.locator("#resources").innerText()).includes("Brampton"));
// All on-page links point to real anchors (including collapsed targets).
const broken = await page
  .locator('a[href^="#"]')
  .evaluateAll((links) =>
    links
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && h !== "#" && !document.getElementById(h.slice(1))),
  );
assert.deepEqual([...new Set(broken)], [], "Broken anchors");
const axe = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  .analyze();
writeFileSync("/tmp/hire-axe.json", JSON.stringify(axe.violations, null, 2));
assert.equal(
  axe.violations.length,
  0,
  "Accessibility violations; see /tmp/hire-axe.json",
);
console.log(
  "Accessibility violations:",
  JSON.stringify(
    axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      examples: v.nodes
        .slice(0, 2)
        .map((n) => ({ html: n.html, summary: n.failureSummary })),
    })),
    null,
    2,
  ),
);
// Responsive widths and mobile navigation.
for (const width of [320, 375, 390, 768, 820, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: innerWidth,
  }));
  assert.ok(
    dimensions.scroll <= width,
    `Horizontal overflow at ${width}: ${dimensions.scroll}`,
  );
  const tabBounds = await page
    .locator('#opportunities [aria-label="Opportunity type"] button')
    .evaluateAll((els) =>
      els.map((el) => ({
        left: el.getBoundingClientRect().left,
        right: el.getBoundingClientRect().right,
      })),
    );
  assert.ok(
    tabBounds.every((b) => b.left >= 0 && b.right <= width),
    `Opportunity filter is clipped at ${width}`,
  );
  const heroWidth = await page
    .locator(".hero-content")
    .evaluate((el) => el.getBoundingClientRect().width);
  assert.ok(heroWidth <= width, `Hero content is cropped at ${width}`);
  if (width === 390) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Opportunities", exact: true })
      .click();
    assert.equal(
      await page.getByRole("navigation", { name: "Mobile navigation" }).count(),
      0,
    );
    await page.screenshot({ path: "/tmp/hire-mobile.png", fullPage: true });
  }
}
assert.deepEqual(errors, [], "Browser errors");
console.log(
  "Browser checks passed: search, filters, bookmarks, downloads, checklist persistence, anchors, mobile navigation, 7 responsive widths.",
);
await browser.close();
