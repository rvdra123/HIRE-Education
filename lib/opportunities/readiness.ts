import "server-only";
import type { SourceConfig, SourceHealth } from "./types";
import { enabledSources, sources } from "./sources/registry";

export function catalogueReadiness({
  databaseQuerySucceeded,
  health = [],
  environment = process.env,
  configuredSources = sources(),
}: {
  databaseQuerySucceeded: boolean;
  health?: SourceHealth[];
  environment?: Record<string, string | undefined>;
  configuredSources?: SourceConfig[];
}) {
  const approved = configuredSources.filter(
    (source) => source.automationApproved,
  );
  const enabled = enabledSources(environment, configuredSources);
  const enabledIds = new Set(enabled.map((source) => source.id));
  const remoteStorage = /^(?:libsql|https?|wss?):\/\//i.test(
    environment.DATABASE_URL || "",
  );
  const sharedStorageRequired = environment.VERCEL === "1" && !remoteStorage;
  const refreshSecretConfigured = (environment.CRON_SECRET || "").length >= 32;
  const lastSuccessfulSync =
    health
      .filter((entry) => enabledIds.has(entry.source))
      .map((entry) => entry.lastSuccessfulRun)
      .filter(
        (value): value is string =>
          !!value && Number.isFinite(Date.parse(value)),
      )
      .sort()
      .at(-1) || null;
  const nextSteps: string[] = [];
  if (!databaseQuerySucceeded)
    nextSteps.push(
      "Check DATABASE_URL and DATABASE_AUTH_TOKEN in the Vercel project's environment variables. The database status query did not complete.",
    );
  if (sharedStorageRequired)
    nextSteps.push(
      "Connect a persistent shared database, such as Turso/libSQL. A local SQLite file is not a persistent production database on Vercel.",
    );
  if (!approved.length)
    nextSteps.push(
      "Connect and verify real opportunity and event feeds in the project code. All candidate sources are currently disabled; adding an environment variable alone will not enable them.",
    );
  else if (!enabled.length)
    nextSteps.push(
      `Set OPPORTUNITY_SOURCE_IDS to the verified source IDs you want to collect. Available approved IDs: ${approved.map((source) => source.id).join(", ")}.`,
    );
  if (!refreshSecretConfigured)
    nextSteps.push(
      "Set a private CRON_SECRET of at least 32 characters in Vercel, then save the same value as the GitHub repository secret HIRE_CRON_SECRET. Keep the value out of chat and source control.",
    );
  if (!lastSuccessfulSync)
    nextSteps.push(
      "After the database, feeds, and refresh secret are configured, run the Refresh student opportunity catalogue workflow in GitHub Actions for the first import.",
    );
  else
    nextSteps.push(
      "Check GitHub Actions to confirm that scheduled six-hour refreshes are running. This public report cannot inspect the scheduler's settings or run history.",
    );
  const sha = environment.VERCEL_GIT_COMMIT_SHA || "";
  return {
    state:
      !databaseQuerySucceeded ||
      sharedStorageRequired ||
      !enabled.length ||
      !refreshSecretConfigured
        ? "needs_setup"
        : lastSuccessfulSync
          ? "has_refreshed"
          : "awaiting_first_import",
    commit: /^[a-f0-9]{40}$/i.test(sha) ? sha.slice(0, 7) : null,
    database: {
      querySucceeded: databaseQuerySucceeded,
      storageType: remoteStorage ? "remote" : "local",
      sharedStorageRequired,
    },
    sources: {
      candidates: configuredSources.length,
      approved: approved.length,
      enabled: enabled.length,
      enabledIds: enabled.map((source) => source.id),
    },
    refresh: {
      authenticationConfigured: refreshSecretConfigured,
      lastSuccessfulSync,
      schedulerExecution: "not_verified_by_this_report",
      configuredCadenceHours: [
        ...new Set(enabled.map((source) => source.intervalHours)),
      ].sort((a, b) => a - b),
      sources: enabled.map((source) => {
        const entry = health.find((item) => item.source === source.id);
        return {
          id: source.id,
          state: entry?.state || "awaiting_first_import",
          lastRun: entry?.lastRun || null,
          lastSuccessfulRun: entry?.lastSuccessfulRun || null,
          itemsFound: entry?.itemsFound || 0,
        };
      }),
    },
    nextSteps,
  };
}
