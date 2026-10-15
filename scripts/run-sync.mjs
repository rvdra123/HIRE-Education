if (!process.env.CRON_SECRET || !process.env.NEXT_PUBLIC_SITE_URL)
  throw new Error(
    "Set CRON_SECRET and NEXT_PUBLIC_SITE_URL in the scheduler environment.",
  );
const response = await fetch(
  new URL("/api/cron/update-opportunities", process.env.NEXT_PUBLIC_SITE_URL),
  {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    signal: AbortSignal.timeout(300000),
  },
);
if (!response.ok) throw new Error(`Refresh returned ${response.status}`);
console.log(await response.json());
