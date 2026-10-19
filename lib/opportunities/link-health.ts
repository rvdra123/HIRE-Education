import "server-only";
import { database } from "./db";
import { persist, sourceHealth } from "./store";
import { fetchApprovedPage } from "./sources/adapters";
import type { Opportunity, SourceConfig } from "./types";
export async function checkListingLinks(
  configured: SourceConfig[],
  now = new Date(),
  budgetMs = 60000,
  fetchPage = fetchApprovedPage,
) {
  const health = await sourceHealth();
  const stopAt = Date.now() + budgetMs;
  const rows = await database().execute({
    sql: "SELECT data FROM opportunities WHERE status IN ('active','expiring-soon') AND COALESCE(json_extract(data,'$.lastLinkCheckedAt'),'')<? ORDER BY COALESCE(json_extract(data,'$.lastLinkCheckedAt'),'') LIMIT 12",
    args: [new Date(now.getTime() - 86400000).toISOString()],
  });
  for (const row of rows.rows) {
    if (Date.now() > stopAt - 20000) break;
    const record = JSON.parse(String(row.data)) as Opportunity;
    const config = configured.find((s) => s.id === record.sourceId);
    if (
      !config ||
      health.find((h) => h.source === config.id)?.state !== "ok" ||
      !config.allowedHosts.includes(new URL(record.applicationUrl).hostname)
    )
      continue;
    try {
      const body = await fetchPage(
        { ...config, url: record.applicationUrl },
        AbortSignal.timeout(20000),
      );
      record.linkFailures = 0;
      if (
        /(?:this (?:job|position|opportunity) (?:is|has been) (?:closed|filled|removed)|applications (?:are|have) (?:now )?(?:closed|ended))/i.test(
          body,
        )
      ) {
        record.status = "expired";
        record.applicationStatus = "closed";
        record.verified = false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      record.linkFailures = (record.linkFailures || 0) + 1;
      if (/HTTP (404|410)/.test(message)) {
        record.status = "unavailable";
        record.verified = false;
      } else if (record.linkFailures >= 3) {
        record.status = "needs-review";
        record.verified = false;
      }
    }
    record.lastLinkCheckedAt = now.toISOString();
    await persist(record);
  }
}
