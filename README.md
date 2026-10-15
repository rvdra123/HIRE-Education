# HIRE Education

A career platform for Grades 9–12 students in Brampton, Ontario, Canada. Built with Next.js 15, React, TypeScript, libSQL/SQLite, PDF.js, and Lucide icons. Resume checking runs entirely in the browser without a model API.

## What is implemented

- Four navigation groups in the requested order, a logo extracted from the supplied reference, clearer copy, brighter secondary text, responsive layouts and reduced-motion support.
- Database-backed `/opportunities` catalogue with server-side search, filters, sorting, pagination, bookmarks and detail pages. Public listings must have verified open status, pass student-relevance checks and have a verification within 72 hours.
- Independent source adapters for approved JSON feeds, JSON-LD JobPosting/Event data, and UTC iCalendar feeds. Source permissions and robots.txt are checked before collection. No CAPTCHA or access-control bypass.
- Six-hour job refreshes and daily volunteer/program/event checks. Three distinct timestamps, deduplication, repeat-missing detection, expiry, stale-data handling, bounded link health checks and source health reporting.
- A free browser-only `/resume-reviewer`: PDF/DOCX/TXT reading or pasted text, an editable extraction preview, seven transparent checklist categories, posting-term coverage, fixed wording edits, next steps, and a local feedback download. No account, API key, billing, or review quota. It is explicitly labelled checklist-based feedback, not AI.
- Opportunity → reviewer prefill → educational feedback → official application workflow.
- Brampton events calendar with Toronto-time date filtering, event times, cost and official source/application links.
- Interview practice for retail, food service, recreation and volunteering; four external YouTube education channels.
- Privacy policy and accept/decline controls for optional bookmarks and application checklist storage. Resume text, file names, postings, and results never enter optional storage or leave the checker.

## Important activation status

**The browser resume checker works without external activation.** It does not call OpenAI, Google, or another AI service. The former resume POST endpoint returns 410 before parsing a body or accessing a provider/database, even if old provider keys remain configured. Automatically populated live listings still require approved source feeds and scheduling on the deployed host. The site does not invent current vacancies, event dates, or verification timestamps.

`data/sources.json` records the candidate sources and why each is disabled. An organizational directory is not a confirmed open vacancy. Before enabling a source, obtain a permitted machine-readable feed or confirm automation terms, verify its actual structure, update its URL/adapter/defaults/allowedHosts, and set `automationApproved: true`. Then add its ID to `OPPORTUNITY_SOURCE_IDS`. Source listing facts must come from that source. No production test listings are seeded.

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
- `OPPORTUNITY_SOURCE_IDS`: approved source IDs to collect. Empty means no automated collection.

A server deployment is required for live database queries and periodic opportunity updates. Browser-only resume checking does not need a server or secret. A downloaded HTML preview cannot run background source synchronization.

`deploy/Dockerfile` is a persistent Node deployment example. It is supplied but was not built in this session. Provide environment variables at runtime and mount `/app/data`. A remote libSQL database is an alternative.

## Scheduled updates

Choose ONE scheduler:

1. GitHub Actions: `.github/workflows/refresh-opportunities.yml` runs every six hours once pushed to a repository with Actions enabled. Set repository secrets `HIRE_SITE_URL` and `HIRE_CRON_SECRET` to the deployed site and matching `CRON_SECRET`. Actions schedules are best-effort, and public repositories can have inactivity restrictions.
2. Persistent host: use `deploy/crontab.example`, with the host's real Node path and working directory. `scripts/run-sync.mjs` needs the site URL and secret in its environment.
3. Hosting scheduler: make an authenticated GET to `/api/cron/update-opportunities` every six hours, with `Authorization: Bearer <CRON_SECRET>`.

Each adapter enforces its own 6-, 12- or 24-hour interval. A database lease prevents overlapping refreshes. One failed source does not erase the catalogue. The routine refreshes expiry states and retries failed provider-file deletion. Browser polling only reads the database; it never runs collection.

## Feed contract and data quality

An approved JSON feed returns an array or `{ "items": [...] }` matching `listingSchema` in `lib/opportunities/types.ts`. Required facts include title, organization, description, type, category, location, source URL and application URL. `applicationStatus` must be `open` to be published. Unknown age/grade/compensation is labelled, not guessed. Supply date-times with explicit UTC offsets. ICS supports explicit UTC times; timezone-dependent feeds require an adapted parser and remain unpublished if the start time cannot be established.

`firstSeenAt` is set once per listing. `lastSeenAt` advances when the source actually contains it. `lastVerifiedAt` advances only after a successful, valid source check. Failures preserve all three. A deadline/explicit closed status expires a listing. Two successful complete-feed snapshots missing a record mark it unavailable. An empty/malformed/unrecognized page is treated as a failure rather than erasing records. Three verification failures or verification older than 72 hours hides a record for review. Historical records remain internal.

Link checks are bounded and only visit hosts approved for that source, after robots checks. 404/410 and explicit closure messages hide records; repeated other failures require review. A successful link response alone does not renew a listing's verification date. Deduplication combines normalized title/organization/location/date fingerprints and matching application links; canonical official sources take priority.

## Resume handling

The free checker is implemented in `lib/resume/checker.ts`, `lib/resume/extract.ts`, and `components/resume/`. It uses deterministic text rules, not a local or remote language model. The score measures checklist completion, not resume quality, job eligibility, or hiring probability.

Files are opened locally, not uploaded. PDF.js and its worker are bundled with the site; no CDN receives documents. DOCX parsing extracts document text without executing HTML, macros, or external entities. Limits: 4 MB input, 10 PDF pages, bounded DOCX entry counts and expanded size, 50,000 resume characters, 16,000 posting characters, at least 40 resume words and 12 posting words/60 characters. Scanned/image-only PDFs require the student to paste text instead; OCR, visual layout, spelling, and grammar are outside scope. Students inspect and can correct extraction before analysis.

Seven categories each show every check and the reason it passed or needs review. A category is its percentage of checks passed, rounded to /10. Overall averages those seven scores to /100. Posting coverage reports the exact selected matched/total terms, using a small documented student-role vocabulary and a bounded selection of other posting words. Supported related phrases count, repetition adds no points, and unrecognized terms are not proof of a missing skill. Paid employment, identity, grade, contact information, and numeric achievements are not required to earn points. Wording edits apply fixed introductory-phrase/verb rules without adding experience or numbers.

All inputs, results, and dashboard progress remain only in page memory. Edit and check again retains text on the same page. Clear all fields, Clear review, reload, or leaving the page clears application state. There is no resume storage in local/session storage or a database, and no document/description telemetry. A student-triggered feedback download or clipboard copy creates a local copy under the student's control. Hosting still receives normal page/asset requests.

The old `POST /api/resume-review` returns HTTP 410 and does not parse the body, reserve usage, or invoke a provider. `GET` describes browser mode but the UI does not call it. Dormant provider adapters and their isolated regression tests remain in the repository; environment keys alone cannot enable them. An external AI feature would need a separately designed and disclosed opt-in flow plus applicable provider audience and data-use terms.

## Expanded discovery content

The free-learning directory contains 103 curated courses across eleven providers, with search, topic, provider, level, and credential-type filters and progressive loading. It distinguishes certificates, badges, participation statements, and training completion records. Some deep links use provider catalogues so changing course editions do not create invented URLs. These course details still need a live provider check; no claim of exhaustive coverage or current verification is made.

The opportunities section includes 71 employer, volunteering, program, and event source entries with separate filters and counts. These are official website destinations, not individual open jobs, verified events, or active intakes. They never enter the live-listing database or inherit fabricated timestamps. The live catalogue remains empty until actual verified sources are connected.

Interview practice has 48 questions, 12 each for retail, food service, recreation, and volunteering. Answer drafts stay only in page memory. Previous/next, random questions, a voluntary 60-second timer, progress indicators, fictional examples, and self-checks support practice without pretending to provide AI assessment.

## Internal status

`GET /api/internal/status` with `Authorization: Bearer <ADMIN_SECRET>` returns source health, grouped listing/status counts, today's additions/updates and configuration notes. It is not a public dashboard. Resumes and API keys are never included.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
```

Browser checks use `HIRE_TEST_URL` (default port 3000) and `/usr/bin/chromium` (adjust for your machine). They cover real local analysis, actual PDF/DOCX/TXT extraction, editing/rechecking, clear/reload behavior, invalid files/text, download, no resume API requests or input transmission, no input persistence, privacy controls, catalogue filters, responsive layouts, and axe accessibility scans. Unit tests include scoring consistency, keyword repetition, school-based examples, contact information invariance, factual wording edits, and validation. Legacy provider and catalogue tests use isolated synthetic fixtures, never student documents or public listings.

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
