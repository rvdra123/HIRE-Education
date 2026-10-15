import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://127.0.0.1:3101/opportunities", {
  waitUntil: "networkidle",
});
await p.getByRole("button", { name: "Accept optional storage" }).click();
assert.equal(
  await p.locator(".listing-grid").first().locator("article").count(),
  24,
);
await p.getByRole("button", { name: "Next", exact: true }).click();
await p.waitForTimeout(350);
assert.equal(
  await p.locator(".listing-grid").first().locator("article").count(),
  5,
);
await p.getByRole("button", { name: "Previous", exact: true }).click();
await p.waitForTimeout(350);
const save = p.locator(".listing-card").first().getByRole("button");
await save.click();
await p.getByRole("button", { name: /Saved \(1\)/ }).click();
await p.waitForTimeout(350);
assert.equal(
  await p.locator(".listing-grid").first().locator("article").count(),
  1,
);
await p.getByRole("button", { name: "Recommended", exact: true }).click();
await p
  .getByRole("link", { name: "TEST FIXTURE Student assistant 1", exact: true })
  .click();
await p.getByRole("heading", { name: "Source and verification" }).waitFor();
assert.ok(
  (await p.locator(".verification-box").innerText()).includes(
    "First found by HIRE",
  ),
);
await p
  .getByRole("link", {
    name: /Check my resume for this opportunity/,
    exact: true,
  })
  .click();
await p.getByLabel("Target role", { exact: true }).waitFor();
assert.equal(
  await p.getByLabel("Target role", { exact: true }).inputValue(),
  "TEST FIXTURE Student assistant 1",
);
assert.match(
  await p.getByLabel("Job posting or opportunity description").inputValue(),
  /communication/,
);
assert.deepEqual(errors, []);
await b.close();
console.log(
  "Isolated catalogue checks passed: 29-record pagination, bookmarks, detail verification dates and reviewer prefill.",
);
