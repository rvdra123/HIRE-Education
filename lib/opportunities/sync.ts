import "server-only";
import { fingerprint } from "./quality";
import { checkListingLinks } from "./link-health";
import { database, initDatabase } from "./db";
import { enabledSources, sources } from "./sources/registry";
import { fetchApprovedSource, parseSource } from "./sources/adapters";
import {
  expireAndAge,
  reconcileMissing,
  recordSourceFailure,
  saveOpportunity,
  setSourceHealth,
  sourceHealth,
} from "./store";
import type { SourceConfig } from "./types";
export async function synchronize({
  force = false,
  now = new Date(),
  fetchSource = fetchApprovedSource,
  configured = enabledSources(),
}: {
  force?: boolean;
  now?: Date;
  fetchSource?: typeof fetchApprovedSource;
  configured?: SourceConfig[];
} = {}) {
  await initDatabase();
  const lock = await database().execute({
    sql: "INSERT INTO locks(name,expires_at) VALUES('catalog-sync',?) ON CONFLICT(name) DO UPDATE SET expires_at=excluded.expires_at WHERE locks.expires_at<? RETURNING name",
    args: [Date.now() + 10 * 60_000, Date.now()],
  });
  if (!lock.rows.length) return { state: "already-running", results: [] };
  const results: unknown[] = [];
  const budgetEnds = Date.now() + 240000;
  try {
    await expireAndAge(now);
    const previous = await sourceHealth();
    for (const config of sources().filter(
      (x) => !configured.some((s) => s.id === x.id),
    )) {
      const old = previous.find((x) => x.source === config.id);
      if (!old)
        await setSourceHealth({
          source: config.id,
          name: config.name,
          lastRun: null,
          lastSuccessfulRun: null,
          itemsFound: 0,
          itemsAdded: 0,
          itemsUpdated: 0,
          error: config.approvalNote,
          state: "disabled",
        });
    }
    const ordered = [...configured].sort(
      (a, b) =>
        Date.parse(
          previous.find((s) => s.source === a.id)?.lastRun || "1970-01-01",
        ) -
        Date.parse(
          previous.find((s) => s.source === b.id)?.lastRun || "1970-01-01",
        ),
    );
    for (const source of ordered) {
      if (Date.now() > budgetEnds - 15000) break;
      const old = previous.find((x) => x.source === source.id);
      if (
        !force &&
        old?.lastRun &&
        Date.parse(old.lastRun) > now.getTime() - source.intervalHours * 3600000
      )
        continue;
      let added = 0,
        updated = 0;
      try {
        const body = await fetchSource(
          source,
          AbortSignal.timeout(
            Math.min(
              (source.collectionTimeoutSeconds || 45) * 1000,
              budgetEnds - Date.now(),
            ),
          ),
        );
        const parsed = parseSource(body, source);
        if (
          !parsed.items.length &&
          !(
            parsed.complete &&
            (source.adapter === "json" || body.includes("BEGIN:VCALENDAR"))
          )
        )
          throw new Error(
            "No usable listings found; existing records retained for review",
          );
        const seen: string[] = [];
        const unique = [
          ...new Map(
            parsed.items.map((item) => [fingerprint(item), item]),
          ).values(),
        ];
        for (let i = 0; i < unique.length; i += 8) {
          if (Date.now() > budgetEnds)
            throw new Error(
              "Refresh budget reached; remaining sources will be retried.",
            );
          const batch = await Promise.all(
            unique
              .slice(i, i + 8)
              .map((item) => saveOpportunity(item, source, now)),
          );
          for (const result of batch) {
            seen.push(result.record.id);
            if (result.added) added++;
            else updated++;
          }
        }
        if (parsed.complete) await reconcileMissing(source, seen, now);
        await setSourceHealth({
          source: source.id,
          name: source.name,
          lastRun: now.toISOString(),
          lastSuccessfulRun: now.toISOString(),
          itemsFound: parsed.items.length,
          itemsAdded: added,
          itemsUpdated: updated,
          error: parsed.rejected
            ? `${parsed.rejected} records did not pass validation`
            : null,
          state: "ok",
        });
        results.push({ source: source.id, state: "ok", added, updated });
      } catch {
        await recordSourceFailure(source.id);
        await setSourceHealth({
          source: source.id,
          name: source.name,
          lastRun: now.toISOString(),
          lastSuccessfulRun: old?.lastSuccessfulRun || null,
          itemsFound: old?.itemsFound || 0,
          itemsAdded: 0,
          itemsUpdated: 0,
          error:
            "Source could not be checked. Last successful records retained; repeated failures require review.",
          state: "failed",
        });
        results.push({ source: source.id, state: "failed" });
      }
    }
    if (fetchSource === fetchApprovedSource)
      try {
        await checkListingLinks(
          configured,
          now,
          Math.max(0, budgetEnds - Date.now()),
        );
      } catch {
        /* Listing data stays intact if link maintenance is unavailable. */
      }
    return {
      state: configured.length ? "complete" : "awaiting-approved-sources",
      results,
    };
  } finally {
    await database().execute("DELETE FROM locks WHERE name='catalog-sync'");
  }
}
