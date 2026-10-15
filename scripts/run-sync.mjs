import { pathToFileURL } from "node:url";

export function validateRefresh(result) {
  if (result.state === "already-running") return;
  if (result.state !== "complete" || !Array.isArray(result.results))
    throw new Error(
      "Refresh has no enabled sources or returned an invalid result.",
    );
  const failed = result.results.filter((source) => source.state !== "ok");
  if (failed.length)
    throw new Error(
      `Refresh failed for sources: ${failed.map((source) => source.source).join(", ")}`,
    );
}

export function validateSourceHealth(report, now = Date.now()) {
  if (!report.sources?.enabled || !Array.isArray(report.refresh?.sources))
    throw new Error("No enabled sources or deployed source health report.");
  const unhealthy = report.refresh.sources.filter(
    (source) =>
      source.state !== "ok" ||
      !source.lastSuccessfulRun ||
      !Number.isFinite(Date.parse(source.lastSuccessfulRun)) ||
      now - Date.parse(source.lastSuccessfulRun) > 7 * 3600000,
  );
  if (unhealthy.length)
    throw new Error(
      `No recent successful import for: ${unhealthy.map((source) => source.id).join(", ")}`,
    );
}

async function main() {
  const secret = process.env.CRON_SECRET;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!secret || secret.length < 32 || !site)
    throw new Error(
      "Set CRON_SECRET (at least 32 characters) and NEXT_PUBLIC_SITE_URL in the scheduler environment.",
    );
  const origin = new URL(site);
  if (
    origin.protocol !== "https:" ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  )
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS origin.");
  const status = async () => {
    const response = await fetch(new URL("/api/catalogue-status", origin), {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok)
      throw new Error(`Catalogue status returned ${response.status}`);
    return response.json();
  };
  const expected = process.env.EXPECTED_DEPLOYMENT_SHA;
  if (expected) {
    let deployed = false;
    const deadline = Date.now() + 6 * 60000;
    while (Date.now() < deadline) {
      try {
        deployed = (await status()).commit === expected.slice(0, 7);
      } catch {
        /* Retry during deployment. */
      }
      if (deployed) break;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
    if (!deployed)
      throw new Error(
        "Vercel has not published the pushed commit; no refresh was attempted.",
      );
  }
  const response = await fetch(
    new URL("/api/cron/update-opportunities", origin),
    {
      redirect: "error",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(300000),
    },
  );
  if (!response.ok) throw new Error(`Refresh returned ${response.status}`);
  const result = await response.json();
  validateRefresh(result);
  validateSourceHealth(await status());
  console.log(JSON.stringify(result));
  console.log("Every enabled source has a recent successful import.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
