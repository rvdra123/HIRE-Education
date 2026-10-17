# HIRE Education

A career platform for Grades 9–12 students in Brampton, Peel and the Greater Toronto Area, Ontario, Canada. Built with Next.js 15, React, TypeScript, libSQL/SQLite, PDF.js, and Lucide icons. Resume checking runs entirely in the browser without a model API.

## What is implemented

- Four navigation groups in the requested order, a logo extracted from the supplied reference, clearer copy, brighter secondary text, responsive layouts and reduced-motion support.
- Database-backed `/opportunities` catalogue with server-side search, filters, sorting, pagination, bookmarks and detail pages. Public listings must have verified open status, pass student-relevance checks and have a verification within 72 hours.
- Source adapters for official Brampton volunteer intakes and library teen event cards, approved JSON feeds, JSON-LD JobPosting/Event data, and UTC iCalendar feeds. Robots.txt is checked before collection. No CAPTCHA or access-control bypass.
- Six-hour refresh intervals for jobs, volunteering, programs and events. Three distinct timestamps, deduplication, repeat-missing detection, expiry, stale-data handling, bounded link health checks and source health reporting.
- A free browser-only `/resume-reviewer`: PDF/DOCX/TXT reading or pasted text, an editable extraction preview, seven transparent checklist categories, posting-term coverage, fixed wording edits, next steps, and a local feedback download. No account, API key, billing, or review quota. It is explicitly labelled checklist-based feedback, not AI.
- Opportunity → reviewer prefill → educational feedback → official application workflow.
- Brampton events calendar with Toronto-time date filtering, event times, cost and official source/application links.
- 216 interview practice questions across nine role/interview categories, plus a searchable 147-entry resource library including 41 official-source-linked YouTube channels.
- Privacy policy and accept/decline controls for optional bookmarks and application checklist storage. Resume text, file names, postings, and results never enter optional storage or leave the checker.

## Important activation status

**The browser resume checker works without external activation.** It does not call OpenAI, Google, or another AI service. The former resume POST endpoint returns 410 before parsing a body or accessing a provider/database, even if old provider keys remain configured. Live listings require the shared database, refresh secret, and scheduler on the deployed host. Thirty-one approved public sources default on, with a six-hour cadence. The complete isolated live import on October 17, 2026 found 56 current opportunities (22 paid postings, 13 volunteer intakes and 21 other student programs/intakes) plus 15 library events. These are source-verified records, not advertised position totals. Closed, expired, unknown-intake and stale records remain out of public results. Counts can change as deadlines pass. See [the GTA/Peel expansion review](deploy/gta-youth-database-2026-10-17.md).

`data/sources.json` records source adapters, access checks, and reasons for disabled sources. An organizational directory is not a confirmed open vacancy. The City volunteer intake and Youth Cabinet general membership are each one listing; filled executive positions and role directories do not become openings. Library events are a featured selection, not an exhaustive calendar. Job Bank and McDonald’s remain disabled because their reviewed terms prohibit automated access; Peel still lacks a verified youth feed. City careers now uses its public sitemap and individually checked job pages. Before enabling another source, confirm its automation terms and robots policy, verify its actual structure, and update its adapter and allowed hosts. Source facts must come from that source. No production test listings are seeded. McDonald’s Brampton adapter is implemented and fixture-tested but remains disabled because its reviewed linked terms prohibit automated systems. Future-vacancy pools never become confirmed openings. Library pages can intermittently challenge requests; the full 32-source local import passed; 31 sources are enabled after production verification. Regeneration’s new volunteer feed is withheld because its robots endpoint returned an upstream database error. TRCA’s new feed passed locally but failed the production collector, so it is also withheld; neither reviewed record is seeded into production. Imports retain prior records if a source becomes unavailable. See [expanded student opportunities](deploy/student-coverage-2026-10-16.md), [current paid-feed verification](deploy/live-paid-feeds-2026-10-16.md), [October 16 feed verification](deploy/feed-continuation-2026-10-16.md) and [earlier source verification](deploy/catalogue-verification.md).

## Run

Requires Node.js 24.x.

```sh
npm ci
cp .env.example .env
npm run dev
```

For production:

```sh
npm run build
npm start
```

A localhost URL runs inside the machine hosting the server. It is not a public link. Deploy to a Node-compatible host to share the site.

## Environment and deployment

All server secrets are documented in `.env.example`. Do not put them in chat, source control, public bundles or variables prefixed with `NEXT_PUBLIC_`.

- `OPENAI_API_KEY`, `GEMINI_API_KEY`, and related model variables: not used by the public resume checker. They can be removed from Vercel if no other deployment feature uses them. Legacy adapter source remains dormant for reference, not activation.
- `DATABASE_URL`: defaults to `file:./data/hire.db`. A persistent Node host must mount a persistent `data` directory. For serverless or multiple replicas, use a shared `libsql://` database and `DATABASE_AUTH_TOKEN`; do not rely on ephemeral SQLite files.
- `RATE_LIMIT_SECRET`: retained for protected legacy request helpers. The local resume checker does not depend on it or use server-side usage counters.
- `PRIVACY_CONTACT_EMAIL` and `SITE_OPERATOR_NAME`: publish the real operator and a working privacy contact. Review the privacy policy with a qualified Canadian privacy professional before launch, especially because students may be minors. No policy guarantees immunity from claims.
- `CRON_SECRET` and `ADMIN_SECRET`: different random secrets, each at least 32 characters. Unconfigured/short secrets deny access.
- `TRUSTED_IP_HEADER`: used only by legacy server request helpers. Never trust arbitrary client-supplied IP headers. Browser resume checking has no connection-based allowance.
- `NEXT_PUBLIC_SITE_URL`: final HTTPS origin. Set before the production build for correct social metadata.
- `OPPORTUNITY_SOURCE_IDS`: optional override of approved source IDs. Unset uses the 31 approved defaults. An explicit empty value disables collection. To select all connected sources explicitly: `brampton-careers,brampton-volunteer,brampton-library,brampton-library-volunteer,brampton-youth-cabinet,brampton-summer-company,skills-ontario-brampton-camps,hack-club-community,energymag-internship,building-u-internship,launchx-online-summer,yale-young-global-scholars,diamond-challenge,waterloo-math-contests,microsoft-learning-paths,adplist-mentoring,coding-coach-mentorship,hack-club-leadership,hack-club-project-programs,mississauga-careers,food-banks-mississauga-youth,canadian-cadets-registration,toronto-library-literacy-volunteers,toronto-ltc-youth-volunteers,bgc-peel-youth-intakes,mississauga-current-youth-volunteers,ajax-careers,ajax-library-paid-pages,second-harvest-student-volunteers,toronto-youth-cabinet-working-groups,richmond-hill-youth-jobs`.

A server deployment is required for live database queries and periodic opportunity updates. Browser-only resume checking does not need a server or secret. A downloaded HTML preview cannot run background source synchronization.

`deploy/Dockerfile` is a persistent Node deployment example. It is supplied but was not built in this session. Provide environment variables at runtime and mount `/app/data`. A remote libSQL database is an alternative.

## Scheduled updates

Choose ONE scheduler:

1. GitHub Actions: `.github/workflows/refresh-opportunities.yml` runs every six hours with Actions enabled, and after feed changes reach `main`. It explicitly checks out `main`; the same workflow must be present on the repository's default branch (`hire-education-launch`) for scheduled triggers. On push, it waits for Vercel to serve that commit before importing. Set `HIRE_CRON_SECRET` to match Vercel's `CRON_SECRET`; the public `HIRE_SITE_URL` repository variable optionally overrides `https://hire-education.vercel.app`. The old site-URL secret is no longer used. The runner fails when an enabled source fails, even if the endpoint returns HTTP 200. Actions schedules are best-effort, and public repositories can have inactivity restrictions.
2. Persistent host: use `deploy/crontab.example`, with the host's real Node path and working directory. `scripts/run-sync.mjs` needs the site URL and secret in its environment.
3. Hosting scheduler: make an authenticated GET to `/api/cron/update-opportunities` every six hours, with `Authorization: Bearer <CRON_SECRET>`.

All 31 enabled sources use a six-hour interval. Closed or ended records remain internal. A database lease prevents overlapping refreshes. One failed source does not erase the catalogue. The routine refreshes expiry states and retries failed provider-file deletion. Browser polling only reads the database; it never runs collection.

## Feed contract and data quality

An approved JSON feed returns an array or `{ "items": [...] }` matching `listingSchema` in `lib/opportunities/types.ts`. Required facts include title, organization, description, type, category, location, source URL and application URL. `applicationStatus` must be `open` to be published. Unknown age/grade/compensation is labelled, not guessed. Supply date-times with explicit UTC offsets. Published calendar-only program schedules use `startDateOnly`/`endDateOnly`, without invented times; date-only program ends expire after the Toronto calendar day. International residential programs need explicit source-confirmed Canadian eligibility. The catalogue starts with All locations so these options are visible, while recommended sorting prioritizes nearby listings. ICS supports explicit UTC times; timezone-dependent feeds require an adapted parser and remain unpublished if the start time cannot be established.

`firstSeenAt` is set once per listing. `lastSeenAt` advances when the source actually contains it. `lastVerifiedAt` advances only after a successful, valid source check. Failures preserve all three. A deadline/explicit closed status expires a listing. Two successful complete-feed snapshots missing a record mark it unavailable. An empty/malformed/unrecognized page is treated as a failure rather than erasing records. Three verification failures or verification older than 72 hours hides a record for review. Historical records remain internal.

The library adapter converts complete published local dates/times using `America/Toronto`, including daylight saving, and rejects ambiguous/nonexistent times. Missing years, dates, prices, grades, or requirements stay unknown. The City's yearless "November 9" remains source text with a null structured deadline. Paid careers postings publish a full closing date without a time: `applicationClosingDate` retains that calendar date, while `applicationDeadline` stays null. Display and expiry use the published Toronto day; no source closing time is invented. Public event cards confirm the published schedule; students must check registration availability on the official event page. Youth Cabinet membership uses the explicit current general-membership status, not the filled 2026–2027 executive seats. Summer Company uses its current intake banner: the closed 2026 intake stays internal, and old application steps or incomplete 2027 references never create an open listing or deadline. These partial public pages use `completeFeed: false`; a record leaving a featured selection ages out rather than being declared closed immediately.

Link checks are bounded and only visit hosts approved for that source, after robots checks. 404/410 and explicit closure messages hide records; repeated other failures require review. A successful link response alone does not renew a listing's verification date. Deduplication combines normalized title/organization/location/date fingerprints and matching application links; canonical official sources take priority.

## Resume handling

The free checker is implemented in `lib/resume/checker.ts`, `lib/resume/extract.ts`, and `components/resume/`. It uses deterministic text rules, not a local or remote language model. The score measures checklist completion, not resume quality, job eligibility, or hiring probability.

Files are opened locally, not uploaded. PDF.js and its worker are bundled with the site; no CDN receives documents. DOCX parsing extracts document text without executing HTML, macros, or external entities. Limits: 4 MB input, 10 PDF pages, bounded DOCX entry counts and expanded size, 50,000 resume characters, 16,000 posting characters, at least 40 resume words and 12 posting words/60 characters. Scanned/image-only PDFs require the student to paste text instead; OCR, visual layout, spelling, and grammar are outside scope. Students inspect and can correct extraction before analysis.

Seven categories each show every check and the reason it passed or needs review. A category is its percentage of checks passed, rounded to /10. Overall averages those seven scores to /100. Posting coverage reports the exact selected matched/total terms, using a small documented student-role vocabulary and a bounded selection of other posting words. Supported related phrases count, repetition adds no points, and unrecognized terms are not proof of a missing skill. Paid employment, identity, grade, contact information, and numeric achievements are not required to earn points. Wording edits apply fixed introductory-phrase/verb rules without adding experience or numbers.

All inputs, results, and dashboard progress remain only in page memory. Edit and check again retains text on the same page. Clear all fields, Clear review, reload, or leaving the page clears application state. There is no resume storage in local/session storage or a database, and no document/description telemetry. A student-triggered feedback download or clipboard copy creates a local copy under the student's control. Hosting still receives normal page/asset requests.

The old `POST /api/resume-review` returns HTTP 410 and does not parse the body, reserve usage, or invoke a provider. `GET` describes browser mode but the UI does not call it. Dormant provider adapters and their isolated regression tests remain in the repository; environment keys alone cannot enable them. An external AI feature would need a separately designed and disclosed opt-in flow plus applicable provider audience and data-use terms.

## Expanded discovery content

The free-learning directory contains 224 courses and learning paths across 18 providers. It includes 105 confirmed no-cost completion awards; these are distinguished from paid certification exams and professional licences. Of the entries, 153 have direct course-level evidence, 70 have provider-level evidence, and one retained legacy item is marked unconfirmed. Existing IDs are preserved; stale titles/URLs and broad certificate promises were corrected. Source-checked courses appear first. Search, provider/topic/difficulty/award filters, access notes and progressive loading cover the full library. See [course evidence](docs/course-sources-2026-10-17.md) and `data/course-verification.json`.

The opportunities section includes 218 employer, volunteering, program and event destinations, with geographic filters covering Peel, Toronto, York, Halton and Durham. Of these, 198 official websites/content were checked; 20 existing restricted or unconfirmed destinations are retained with a visible confirmation label. These links never become claimed vacancies or live-listing totals. `data/directory-review.json` records evidence, canonical URLs, dates and limits. GTA filtering includes constituent cities instead of requiring the letters “GTA” in an address.

The resource library has 147 entries across 12 topics: 106 websites and 41 educational/community YouTube channels. Provider/scope/audience/topic/search filters and 12-at-a-time loading keep the library usable. It includes Peel/GTA employment services, school pathways, workplace rights, accommodations, newcomer and community supports, scholarships, financial literacy and safe job searching. Channel identity is established through official organizations’ published links; direct video availability was not verified. General/adult-oriented advice is labelled and must be adapted to Ontario student applications. See [resource evidence](docs/resource-sources-2026-10-17.md).

Interview practice has 216 distinct questions (24 in each of nine categories), with original approaches and explicitly fictional student examples. The original 48 questions are preserved. Role/topic/text filters, jump navigation, previous/next/random, an optional timer and progress help students find relevant practice. Stable question IDs preserve drafts across filters during the visit. Drafts stay only in page memory; reload clears them. No draft is stored or sent for AI analysis. Official interview, human-rights and safety references support the advice.

Global search covers courses, resources and employer/program directories with type filters and progressive results. Live previews show the full matching-opportunity total and link to the complete filtered catalogue. Multiword searches match all words in any order and escape SQL wildcard characters. Keyboard closing restores focus to the search trigger.

## Internal status

`GET /api/catalogue-status` is a safe public setup report. It checks whether
source-health data can be queried, distinguishes local/shared database
configuration, counts approved/enabled sources, and reports whether refresh
authentication is configured and a successful import is recorded. It exposes
no credentials, database addresses, filesystem paths, or raw exceptions. It
cannot verify remote database durability or GitHub Actions configuration/run
history. Read `nextSteps` for the remaining production setup.

`GET /api/internal/status` with `Authorization: Bearer <ADMIN_SECRET>` returns source health, grouped listing/status counts, today's additions/updates and configuration notes. It is not a public dashboard. Resumes and API keys are never included.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run test:feeds:live -- --coverage
npm run build
npm run test:browser
```

Browser checks use `HIRE_TEST_URL` (default port 3000) and `/usr/bin/chromium` (adjust for your machine). They cover real local analysis, actual PDF/DOCX/TXT extraction, editing/rechecking, clear/reload behavior, invalid files/text, download, no resume API requests or input transmission, no input persistence, privacy controls, catalogue filters, responsive layouts, and axe accessibility scans. Unit tests include scoring consistency, keyword repetition, school-based examples, contact information invariance, factual wording edits, and validation. Legacy provider and catalogue tests use isolated synthetic fixtures, never student documents or public listings.

`test:feeds:live` fetches official pages through the normal proxy and robots checks, imports them into a temporary database, and verifies deduplication, the exact six-hour refresh boundary, and all three timestamps on success, skips, and failures. The cadence checks replay the just-fetched responses in isolated storage; they do not claim to observe six hours of production scheduler history. The temporary database is removed after the check. `--coverage` also requires at least two current public listings in each of the nine opportunity-type filters; this is a check of the current source snapshot, not a promise that expired listings will remain visible.

## GitHub Pages

`npm run build:pages` builds a complete static edition into `docs/index.html`.
The ready-built folder is committed for simple branch-based publishing. In
repository **Settings → Pages**, choose **Deploy from a branch**,
**hire-education-launch**, **/docs**, and Save. The expected default URL is
`https://rvdra123.github.io/HIRE-Education/` once GitHub finishes deploying.
The checker is at `#/resume-reviewer` under that address.

This edition includes the browser-only tools, course catalogue, and official
employer/program/event directories. Live database listings and scheduled event
feeds require the server edition. Routes use URL hashes so refreshes and shared
links work under the repository path. `npm run test:pages` verifies the built
site using a strict static server. Rebuild and commit `docs` with later source
changes. See [Pages setup](deploy/github-pages.md).

## Downloadable preview

`npm run build:preview` generates `downloads/HIRE-Education.html` from the same static shell as Pages, with an offline-edition notice. It includes the logo, font, styles, scripts, PDF worker, official-source directories, privacy page, and fully working local checker. Deploy the full Next.js project for server-backed listings and scheduled synchronization.

Cloud workspace-specific configuration and the reserved OpenAI variable mapping are documented in `deploy/cloud-environment.md`.

## Legacy provider integrations

OpenAI and Gemini adapters remain in `lib/ai` and `lib/openai` for reference and regression tests. The public checker never imports them or calls a model. Gemini’s existing student-audience guard remains in place. Do not interpret retained environment variables or adapter tests as an active service.
