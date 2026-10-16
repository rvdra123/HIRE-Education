# Expanded student opportunity coverage

The October 16 expansion adds 14 distinct opportunities from 11 official public
sources. It preserves the existing five paid City jobs, two volunteer intakes,
Youth Cabinet membership, Hack Club community membership and 16 library events.
There are no seeded production listings or fabricated openings.

The complete isolated live import at `2026-10-16T16:31:39.994Z` passed all 19
enabled sources: 42 internal records, 39 active public records (23 opportunities
and 16 events). The three closed/ended program records remain internal.

| Opportunity type | Current public listings | Additions |
| --- | ---: | --- |
| Job | 5 | Existing paid recreation vacancies retained |
| Volunteer | 2 | Existing official intakes retained |
| Internship | 2 | EnergyMag quarter-time research; building-U student teams |
| Summer program | 2 | LaunchX Online Entrepreneurship 2027; Yale Young Global Scholars 2027 |
| Youth program | 3 | Hack Club Dyad and Snek, alongside community membership |
| Career program | 2 | Microsoft Learn cloud concepts and first C# learning paths |
| Mentorship | 2 | ADPList; Coding Coach |
| Leadership | 2 | Start a Hack Club, alongside Youth Cabinet membership |
| Competition | 3 | Diamond Challenge 2027; Waterloo CIMC and CSMC 2026 |

These are counts at verification time. Source changes, deadlines, stale
verification and failures can remove listings; a filter quota never overrides
publication rules. The catalogue now starts with All locations so school-based,
online and explicitly Canadian-eligible international programs are visible.
Recommended sorting still prioritizes nearby opportunities.

## Evidence and eligibility

`data/reviewed-programs.json` contains original factual summaries and the exact
public evidence needed for each record. The collector fetches all required pages
through the existing approved-host, robots, redirect, byte-limit and timeout
controls. The adapter checks the published intake controls, calendars,
eligibility and prices. A missing page, changed required fact or changed intake
fails that source without renewing its previous records or timestamps. Each
source is partial (`completeFeed: false`); absence does not assert closure.

EnergyMag explicitly offers an unpaid, year-round, quarter-time research
internship for high-school sophomores through seniors with academic requirements.
Its seasonal half-time internship is not imported as a current summer intake.
building-U explicitly recruits grades 9–12 year-round for free remote team
placements of at least three months; pay is not published and remains unknown.
Neither listing is presented as a paid job.

Both summer programs explicitly opened 2027 applications. LaunchX is online,
ages 14–18, July 5–August 6, with a March 31 final deadline. The source's US$7,495
price conflicts with a US$6,495 starting-price FAQ; the listing discloses both and
asks students to confirm. Yale is residential in Connecticut, accepts Canadian
applicants, and has stricter age, grade, graduation and first-time participation
rules. It costs US$7,500 plus the US$100 regular application fee and travel,
with need-based aid and fee waivers available. The October early deadline is
past; the listing uses the published January 6, 2027, 11:59 p.m. Eastern regular
deadline (`2027-01-07T04:59:00Z`). Fees appear on catalogue cards and detail pages.

Diamond Challenge requires 2–4 high-school students aged 14–18 plus an adult
advisor. Virtual pitching is possible, while finalists have travel requirements.
Its January 14, 2027, 5 p.m. EST deadline is source-published. Waterloo's CIMC and
CSMC are separate contests for different grade groups, ordered by schools before
October 22 for November 18, 2026. The published participant charge is C$14;
the linked ordering terms explicitly state that fees are in Canadian dollars.
School fees and official-participant residency/age rules remain visible.

Microsoft Learn serves public structured `LearningPath` documents when the
collector requests JSON. Their canonical URL, title, prerequisites, module count
and module identity are validated, along with the training FAQ's free access
statement. These are beginner career-skills training, not employment or
internships. Cloud subscriptions and exams can cost extra.

ADPList explicitly welcomes students exploring careers and is free to start.
Coding Coach's public frontend API must confirm at least one mentor with
`available: true`; omitted availability is not treated as true. Mentor names,
contact details and personal profiles are not imported or kept in fixtures.
Unpublished minimum ages remain unknown, and minors are directed to confirm
account requirements. Matches and responses are not guaranteed.

Hack Club's documented public Events API must list Dyad and Snek as ongoing,
online and with matching URLs and schedules. Their detail pages must retain the
published participation controls and requirements. Activity start/end dates
remain calendar-only program dates, never inferred application deadlines. A
program expires after its published end day using the existing Toronto calendar
convention. Conditional prizes are not wages. The leadership listing is the
distinct school-club application, rather than a duplicate community signup.

Yale robots requires a ten-second crawl delay. Its five evidence pages remain
sequential under a bounded 75-second source budget. Other sources retain the
45-second default. Individual link checks have a bounded 20-second timeout to
honor crawl delays. No application forms are submitted or authenticated portals
collected. No messages or account registrations are sent.

Indeed was considered for discovery, but no Indeed automated feed is enabled.
The additions above use original program and organization sources. Job Bank,
McDonald's, Mathnasium and HigherMe remain excluded under their reviewed
automation restrictions; no challenge or access control was bypassed.

## Validation

`npm run test:feeds:live -- --coverage` fetches every enabled source into temporary
storage and requires at least two active listings in all nine opportunity types.
It also checks deduplication, the exact six-hour refresh boundary and all three
timestamps on successful repeats, skips and failures using controlled replay of
the just-fetched responses. This does not claim six hours of observed production
scheduler history. Captured source fixtures test changed prices/intake/forms,
incomplete evidence, mentor availability, structured learning paths and activity
expiry. Normal unit, type, lint and production build checks apply before push.

Production verification must separately confirm the deployed commit, successful
protected refresh workflow, all 19 source health states, actual public counts for
each type, preserved prior records/timestamps and browser-visible listings.
