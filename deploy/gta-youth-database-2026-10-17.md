# GTA and Peel youth database expansion

The expansion preserves the existing application, original listing IDs, 103
course IDs, 71 directory entries and 48 interview questions while broadening
coverage across Peel, Toronto, York, Halton and Durham. Online learning and
programs that students in this area can use remain included, with eligibility,
costs and travel conditions shown rather than implied.

## Live opportunities

The complete isolated live import at `2026-10-17T18:11:46.407Z` passed all 32
enabled sources. It produced 75 internal records and 71 current public records:
56 opportunities and 15 library events. Three older closed/ended programs and
one finished event remained internal. Counts are a snapshot, not a quota that
overrides deadlines or verification rules.

| Opportunity type | Current listings |
| --- | ---: |
| Paid jobs | 22 |
| Volunteering | 13 |
| Internships | 2 |
| Summer programs | 2 |
| Youth programs | 4 |
| Career programs | 3 |
| Mentorship | 2 |
| Leadership | 5 |
| Competitions | 3 |

The new paid sources cover Brampton, Mississauga, Ajax, Ajax Public Library and
Richmond Hill. There are 17 new paid postings, not the sum of advertised position
counts. One combined aquatics campaign remains one record. Existing/fixed
vacancies, public application controls and qualification evidence are required.
Future-vacancy talent pools, postsecondary-required co-ops and general inquiries
are excluded. Grade 12 completion, prior experience, certifications, checks and
availability requirements remain visible; a minimum age does not establish
unconditional suitability for every student.

The local additions include Food Banks Mississauga, TRCA Youth Council, Cadets,
Toronto Public Library literacy volunteering, Toronto long-term-care homes,
BGC Peel, six distinct Mississauga volunteer roles, Second Harvest and the
Toronto Youth Cabinet Education Working Group. These are explicit current
application/registration intakes; they do not guarantee a placement or shift.
School approval is required before counting community-service hours.

Three parade roles have distinct duties and source IDs. Their published 2026
closing dates are calendar-only; conflicting training weekdays are disclosed
and no parade date is invented. Yearless Halloween records were excluded. The
TYC form's deadline lacks a year/timezone in the deadline notice, so it remains
source text rather than a fabricated timestamp.

Regeneration's reviewed volunteer intake remains withheld from automated
collection because its public robots endpoint returned HTTP 500 with a database
connection error during the actual collector check. No record is seeded to
substitute for that failure. Its official directory destination remains available
for human confirmation. Job Bank, McDonald's and other sources with reviewed
automation restrictions remain excluded from live collection. JA and Black Boys
Code are useful directory resources but were not enabled when their robots
checks could not establish current automated access.

## Collection and preservation

All 32 enabled sources use the existing six-hour schedule. Official sitemaps,
public RSS, public frontend JSON or reviewed evidence pages use approved-host,
redirect, robots, timeout and streamed byte limits. XML and PDF media types are
negotiated explicitly. No application, authentication, personal profile or
account endpoints are collected, and no forms or messages are submitted.

Ajax and Richmond Hill qualification hashes must match the reviewed source
requirements before original summaries are emitted. Expressive source
qualification prose and images are not republished. Richmond Hill's copyright
limits are documented rather than treated as blanket permission from robots.
The Ajax Library PDF is not executed or parsed on the server: its bounded bytes
must match the SHA-256 of the human-reviewed public document, along with an
explicit open HTML notice. Any edit requires another review. The source's pay
wording omits the rate for exactly age 18; that ambiguity is disclosed.

An unavailable, changed or incomplete source fails conservatively and preserves
existing records and their collection timestamps. Normal successful refreshes
advance lastSeenAt/lastVerifiedAt while preserving firstSeenAt. The live check
replays the just-fetched responses in isolated storage to verify deduplication,
the exact six-hour boundary, and all three timestamps on repeats/skips/failures.
That controlled replay is not a claim of six hours of observed scheduler history.

## Learning, directories, resources and practice

- **224 learning entries, 18 providers:** 121 additions; 105 confirmed no-cost
  completion awards. 153 course-level checks, 70 provider-level checks and one
  retained unconfirmed item are distinguished. Professional exams, completion
  awards and learning-only paths are not conflated. Working course pages were
  checked for HP LIFE, Saylor, Microsoft, Helsinki, GitHub and Harvard CS50.
  Broken maintenance pages, unavailable legacy courses and inappropriate paid
  or adult-only registrations were not added.
- **218 employer/program destinations:** 147 additions and 23 repaired/canonical
  URLs. 198 destinations/content were checked; 20 restricted or unconfirmed
  existing links are visibly labelled. Directory entries never become live
  vacancies or receive invented application status.
- **147 career resources:** 106 websites and 41 educational/community YouTube
  channels across 12 topics. Local employment services, rights, school pathways,
  accommodations, community supports, scholarships, money skills and safe job
  searching are included. Channel identity comes from official publishers'
  linked channels; direct video availability is not asserted. General/adult or
  non-Canadian advice is labelled.
- **216 distinct interview questions:** 24 in each of nine categories, with
  original approaches and fictional school-based examples. Drafts remain only
  in page memory, survive filtering/navigation during a visit, and clear on
  reload. No input is stored or sent for AI analysis.

Source manifests and review notes are in `data/course-verification.json`,
`data/directory-review.json`, `docs/course-sources-2026-10-17.md` and
`docs/resource-sources-2026-10-17.md`. Larger source captures and browser evidence
remain in `/workspace/youth-expansion-2026-10-16/` for review.

Search/filter/progressive loading covers each complete library. Geographic
filters recognize constituent GTA cities. Global search shows all static
matches progressively and links to every matching live opportunity beyond its
six-card preview; live multiword search matches all words in any order. Keyboard
closing restores focus. Source-checked courses and directories appear first.

Production completion requires the deployed commit, successful protected refresh,
healthy enabled sources, actual API counts and browser-visible filters/content.
Build success alone does not establish production availability.
