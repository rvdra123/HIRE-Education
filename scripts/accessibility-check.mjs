import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
async function scan(state) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  console.log(
    state,
    violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  );
  assert.equal(violations.length, 0, `${state}: accessibility issues`);
}
await scan("Default page and resume");
await page.getByRole("tab", { name: /Before you apply/ }).click();
await scan("Application checklist");
await page.getByRole("button", { name: "More filters" }).click();
await page.getByRole("button", { name: /Learn it. Earn it./ }).click();
await page.getByRole("button", { name: "Search all resources" }).click();
await scan("Global search dialog");
await page.keyboard.press("Escape");
await page.setViewportSize({ width: 568, height: 320 });
await page.getByRole("button", { name: "Open navigation" }).click();
await scan("Landscape mobile navigation");
const nav = await page
  .locator("#mobile-navigation")
  .evaluate((el) => ({ height: el.clientHeight, scroll: el.scrollHeight }));
assert.ok(nav.height <= 248);
assert.ok(nav.scroll > nav.height);
await page.getByRole("button", { name: "Close navigation" }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/hire-phone-final.png" });
await scan("Mobile page");
await browser.close();
