# HIRE Education

A career platform for Grades 9–12 students in Brampton, Ontario, Canada. Built with Next.js 15, React, TypeScript, libSQL/SQLite, the official OpenAI SDK and Responses API, and Lucide icons.

## What is implemented

- Four navigation groups in the requested order, a logo extracted from the supplied reference, clearer copy, brighter secondary text, responsive layouts and reduced-motion support.
- Database-backed `/opportunities` catalogue with server-side search, filters, sorting, pagination, bookmarks and detail pages. Public listings must have verified open status, pass student-relevance checks and have a verification within 72 hours.
- Independent source adapters for approved JSON feeds, JSON-LD JobPosting/Event data, and UTC iCalendar feeds. Source permissions and robots.txt are checked before collection. No CAPTCHA or access-control bypass.
- Six-hour job refreshes and daily volunteer/program/event checks. Three distinct timestamps, deduplication, repeat-missing detection, expiry, stale-data handling, bounded link health checks and source health reporting.
- A real `/resume-reviewer` interface and protected server implementation using PDF/DOCX uploads, OpenAI Files, Responses structured output, schema validation, seven scores, job matching, bullet rewrites and three next steps. No local scoring substitute is presented as AI.
- Opportunity → reviewer prefill → educational feedback → official application workflow.
- Brampton events calendar with Toronto-time date filtering, event times, cost and official source/application links.
- Interview practice for retail, food service, recreation and volunteering; four external YouTube education channels.
- Privacy policy, accept/decline controls for optional local storage, separate per-review AI agreement, and a setting to withdraw storage permission.

## Important activation status

**The code is implemented; live AI and an automatically populated catalogue are not activated in this workspace.** There are no configured API credentials or approved source feeds, no deployed scheduler/public URL, and outbound access to the official source sites and OpenAI is restricted. The site accurately displays unconfigured states and does not invent current listings, event dates, verification dates or AI results.

`data/sources.json` records the candidate sources and why each is disabled. An organizational directory is not a confirmed open vacancy. Before enabling a source, obtain a permitted machine-readable feed or confirm automation terms, verify its actual structure, update its URL/adapter/defaults/allowedHosts, and set `automationApproved: true`. Then add its ID to `OPPORTUNITY_SOURCE_IDS`. Source listing facts must come from that source. No production test listings are seeded.

## Run

Requires Node.js 20.9+ (Node.js 24 recommended).

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

- `OPENAI_API_KEY`: actual server-side OpenAI API key. `OPENAI_MODEL` defaults to the file-capable `gpt-4.1-mini`; confirm model access on your account.
- `DATABASE_URL`: defaults to `file:./data/hire.db`. A persistent Node host must mount a persistent `data` directory. For serverless or multiple replicas, use a shared `libsql://` database and `DATABASE_AUTH_TOKEN`; do not rely on ephemeral SQLite files.
- `RATE_LIMIT_SECRET`: stable random secret of at least 32 characters. The AI reviewer remains unavailable until this, an API key and a privacy contact are configured.
- `PRIVACY_CONTACT_EMAIL` and `SITE_OPERATOR_NAME`: publish the real operator and a working privacy contact. Review the privacy policy with a qualified Canadian privacy professional before launch, especially because students may be minors. No policy guarantees immunity from claims.
- `CRON_SECRET` and `ADMIN_SECRET`: different random secrets, each at least 32 characters. Unconfigured/short secrets deny access.
- `TRUSTED_IP_HEADER`: Vercel is detected using its system variable `VERCEL=1` and automatically uses its platform-overwritten `x-vercel-forwarded-for` header. On other hosts, only set a header your hosting provider overwrites. Do not trust arbitrary client-supplied IP headers. Without a valid trusted IP, the reviewer uses a conservative shared limit. Connections on the same school or home network can share a public IP and therefore an hourly allowance.
- `NEXT_PUBLIC_SITE_URL`: final HTTPS origin. Set before the production build for correct social metadata and same-origin upload checks.
- `OPPORTUNITY_SOURCE_IDS`: approved source IDs to collect. Empty means no automated collection.

A server deployment is required for AI, database queries and periodic updates. A downloaded HTML file cannot run background synchronization or keep an API key secure. The offline preview therefore labels those features as unavailable.

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

Maximum upload: 6 MB, PDF or DOCX, with extension, MIME and signature checks. DOCX decompression is bounded and only document XML is extracted. PDF passwords are rejected. Files are handled in memory, never saved as student documents in the database. API requests require a same-origin browser request and separate consent. The server uses stable keyed request counters (three review attempts/hour per connection and a shared daily budget of 60 by default). Both allowances are reserved together in a database transaction, so rejected requests do not spend either allowance and concurrent requests cannot exceed them. Provider failures still count as attempts to bound API spending. Responses distinguish connection and site limits and include a wait time and `Retry-After`. If hosting limits need adjustment, edit `lib/security/requests.ts` and the route intentionally.

Uploads go to OpenAI with `purpose: user_data` and a one-hour expiry. `store:false` is set on Responses. File deletion is attempted after success or failure and retried by scheduled cleanup. Only provider file IDs, not contents, enter the cleanup queue. Provider security/abuse retention may still apply; no zero-retention promise is made. Results live only in the page's memory. Prompts separate untrusted document/description data from instructions and prohibit fabricated achievements. Numeric rewrite additions are rejected; DOCX originals must occur in the actual extracted text. This reduces, but cannot eliminate, model mistakes. Scores are educational, never a hiring probability or real ATS result.

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

Browser checks require the app on port 3000 and use `/usr/bin/chromium` (adjust for your machine). They cover consent/withdrawal, persistence, download, search, calendar, filters, mobile layouts and unconfigured AI. The successful AI results UI is tested with a clearly isolated browser mock; no real OpenAI call was possible without credentials. Unit tests use isolated temporary databases and injected provider/source fixtures, never public listings.

## Downloadable preview

`npm run build:preview` generates `downloads/HIRE-Education.html`, with the logo, font, styles and scripts embedded. Its lightweight local navigation includes the catalogue, calendar, privacy page and reviewer UI, with server features explicitly unavailable. It is for reviewing the design and local tools, not deploying the live services. Deploy the full Next.js project for production.

Cloud workspace-specific configuration and the reserved OpenAI variable mapping are documented in `deploy/cloud-environment.md`.
