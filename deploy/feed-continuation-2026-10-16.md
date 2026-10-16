# Feed continuation from f6087c4 — October 16, 2026

## Program schedule connected

`skills-ontario-brampton-camps` reads the official public
[Skills Ontario camp schedule](https://skillsontario.com/programs/camp/).
The page and robots.txt returned HTTP 200, and this path is allowed.
Collection uses the existing six-hour scheduler, attribution, bounded responses,
approved hosts and robots checks. Only Brampton rows are imported.

The source publishes two Sheridan College sessions, July 20–24 and July 27–31,
2026, Monday–Friday 9 AM–4 PM. The adapter preserves those Toronto times, the
Grades 7–9 eligibility (Grade 9 in this site's filter), and the published
$230 per camper plus applicable fees. A season year comes from the explicit
schedule introduction, never the current year. Changed dates or links fail safely.

The live isolated check at `2026-10-16T13:30:03.996Z` imported two records and
published zero active listings. Both sessions have ended. A registration link
alone does not confirm availability: application status remains unknown,
`verified` remains false, and `lastVerifiedAt` remains null. Expiry now applies
to all records with a published end date, including programs.

Repeat import deduplication, no collection before six hours, collection at
exactly six hours, and preservation of records/timestamps after collection
failure passed in temporary SQLite storage. No production database was used.
Reproduce the isolated source check with:

```sh
npm run test:feeds:live -- skills-ontario-brampton-camps
```

This source defaults on when `OPPORTUNITY_SOURCE_IDS` is unset. Existing explicit
overrides must add `skills-ontario-brampton-camps`; `.env.example` includes it.

## Paid-job adapter prepared, collection disabled

`mcdonalds-brampton` uses the employer's public
[Brampton keyword search](https://careers.mcdonalds.ca/jobs?keyword=Brampton)
and source-linked public job detail pages. Robots.txt allows these pages.
The search currently returns 30 results, ten on the fetched first page.
This bounded selection is explicitly incomplete; missing records must not be
interpreted as closed jobs. No private APIs are used.

The adapter validates the search keyword, Brampton/ON location, job identity,
public detail URL and JobPosting data. It collects at most ten detail pages,
with the normal host/redirect/robots controls for each. Any failed or mismatched
detail aborts that import so old records are retained.

Only an explicit existing-vacancy field (including the employer's current typo
`Existing Vacany`) plus a published Apply Now control can establish open status.
`Future Vacancy` pools and postings without a vacancy designation remain unknown
and cannot appear in public results. Age and posting dates come from source data;
no wages, deadlines or age eligibility are invented. The source job detail is the
public application destination; the adapter never submits an application.

The site's linked terms page on `www.mcdonalds.com` returned proxy CONNECT 403.
Collection therefore remains **disabled** pending that terms review. Merely
adding the source ID to an environment variable cannot enable an unapproved
source. Captured public search/detail fixtures cover existing, future and
unspecified vacancy status, changed identity, missing details and invalid URLs.

## Other access results

- Brampton careers and robots.txt are now reachable. Its category/search HTML
  contains a JavaScript SAP job component, without job records. Robots disallows
  `/services/` and application-related paths; those endpoints were not collected.
  The source remains disabled pending a verified public feed.
- The old Peel iCIMS URL redirects to the corporate Peel website, rather than
  returning jobs. HTTP 200 on that destination is not a working job feed.
- Job Bank's student search still returned HTTP 503.
- JA Central Ontario returned HTTP 202 with no usable program records.
- Tim Hortons redirected to `www.careers.timhortons.ca`, which returned proxy
  CONNECT 403. No adapter or listings were inferred.
- The existing library teen and volunteer pages now return HTTP 307 without a
  Location header, containing a JavaScript-required redirect/challenge. The full
  live-feed check fails on those two sources; no bypass was attempted. The source
  failure path preserves prior data without refreshing verification timestamps.
  The City volunteer, Youth Cabinet, Summer Company and new camp imports succeeded
  during that full check.

These are workspace observations, not production import or scheduler history.
No deployment or production source selection was changed in this continuation.

## Handoff for the next chat

Work continues from `f6087c4` on branch `continue-feed`. This commit contains the
source adapters, source configuration, captured fixtures, regression tests,
source-selectable isolated live checker, and this verification record.

Validation completed: all 40 tests, TypeScript checking, ESLint, production build,
and the isolated Skills Ontario live import passed. The full live check remains
blocked on the two library challenges described above. No deployment was made.

Next steps: review the McDonald's linked terms before approving that source,
resolve library access through an official feed or permitted public access, and
verify production source selection and import history after deployment. Do not
promote future-vacancy pools, expired camps or challenge pages into open listings.
