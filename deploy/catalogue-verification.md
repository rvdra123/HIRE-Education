# Catalogue verification — October 15, 2026

The production `https://hire-education.vercel.app/api/catalogue-status` returned
HTTP 200 before these changes. It reported commit `75dc750`, a successful remote
database query, configured refresh authentication, zero approved/enabled sources,
and no successful import. No database or deployment credentials were exposed.

## Connected public sources

| Source ID | Official page | Collection |
| --- | --- | --- |
| `brampton-volunteer` | [City volunteer opportunities](https://www.brampton.ca/EN/City-Hall/Employment/Seasonal/Pages/VolunteerOpportunities.aspx) | One explicitly open intake, source-linked Better Impact application; no separate openings inferred from role descriptions. |
| `brampton-library-volunteer` | [Library volunteering](https://www.bramptonlibrary.ca/your-library/your-support/volunteer) | Youth Program Assistant with an explicit application link; adult role excluded. |
| `brampton-library` | [Library teens](https://www.bramptonlibrary.ca/teens) | Published event cards with complete dates, local start/end times, locations and official event links. Featured selection only. |

These public pages and both sites' robots.txt returned HTTP 200. Their paths are
allowed by robots.txt. City terms of use and the library privacy page were read;
this is bounded six-hour polling with attribution, not a claim of a licensed API,
an exhaustive feed, or a contractual reuse agreement. Robots policy is checked
again on each collection. No restricted APIs, login pages, or access controls are
bypassed. Changed/unrecognized structures fail without deleting prior records.

The live check at `2026-10-15T18:16:39.183Z` imported 18 source records into isolated
temporary storage: one City intake, one Library role and 16 Library events.
All 18 passed publication checks at that time. Repeat import deduplication,
skipping before six hours, refreshing at exactly six hours, and preserving
`firstSeenAt`, `lastSeenAt`, and `lastVerifiedAt` on source failure passed.
The interval checks replayed the fetched responses in temporary storage; they
are not production scheduler run history. No fixtures were seeded into production.

## Observed access failures

All of these additional hosts returned **proxy HTTP CONNECT 403 Forbidden** in
this workspace. They need separate network-policy entries for direct verification:

| Host | Verified request / purpose |
| --- | --- |
| `careers.brampton.ca` | `/` — linked by the City's employment page. Job feed remains disabled. |
| `bramlib.libnet.info` | `/events` — official calendar and event registration host linked by the library. Public teen cards on the library domain remain accessible. |
| `form.jotform.com` | `/261055879728067` — library youth application linked by its public page. |
| `app.betterimpact.com` | `/PublicOrganization/0d2ed46d-cc70-42f1-899e-c562e01d7eb6/1` — City's volunteer application. |
| `careers-peelregion.icims.com` | `/jobs/search` — linked by Peel's careers page. Job feed remains disabled. |
| `api.github.com` | `/repos/rvdra123/HIRE-Education/actions/workflows/refresh-opportunities.yml/runs` — workflow API; prevents CLI dispatch/run-history verification. Public run summaries are readable through `github.com`, as are Git fetch/push operations. |

Other failures must not be called domain-policy blocks:

- `www.jobbank.gc.ca/robots.txt` and the configured student search returned HTTP
  503, with `upstream connect error ... connection timeout`. The domain is in
  the configured allowlist. Job Bank remains disabled without a verified feed.
- `https://www.brampton.ca/EN/residents/Environment/Lists/Events/DispForm.aspx?ID=81`
  returned HTTP 403 `403 FORBIDDEN`. The site's public pages and calendar are
  reachable; this is a specific detail-path denial. No City event records are
  inferred from calendar titles alone.

## Production scheduling

The existing GitHub Actions schedule remains `17 */6 * * *` (UTC). Feed changes
on `main` also trigger the protected importer after it observes the same deployed
commit in catalogue-status. GitHub schedules run from the repository's default
branch, currently `hire-education-launch`; keep the workflow there as well. Its
checkout explicitly selects `main`, so scheduled runs always use production code.
The public site origin defaults to the verified production endpoint, with an
optional `HIRE_SITE_URL` repository variable; an old site-URL secret is not used.
Historical scheduled runs on October 15 failed with exit code 3 before imports.
The runner requires repository secret `HIRE_CRON_SECRET` to
match the already-configured Vercel `CRON_SECRET`. No secret value is committed.
The runner checks every enabled source's health, so HTTP 200 with failed imports
does not appear as success. The status endpoint reports each enabled source's
last attempt, last successful import and item count without raw errors or secrets.

Unsetting `OPPORTUNITY_SOURCE_IDS` selects the three verified defaults. An explicit
empty value disables collection; a comma-separated value overrides the defaults.
The public status endpoint distinguishes configured cadence from scheduler
execution, which must be confirmed using actual runs and production imports.
