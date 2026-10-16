# Current paid vacancies and a free teen program

The City of Brampton's careers search UI returns no listing data in HTML, but its
public `https://careers.brampton.ca/sitemap.xml` publishes individual job URLs.
Those pages contain the actual vacancies and redirect to stable canonical job
pages. The new adapter reads a bounded selection of at most 12 recreation jobs,
checking each detail through the existing approved-host, redirect, robots,
timeout and response-size controls. Sitemap dates are not used as posting dates.
The partial selection never marks absent jobs closed.

The careers-linked [City terms](https://www.brampton.ca/EN/Online-Services/Pages/TermsofUse.aspx)
and careers robots were reviewed on October 16, 2026. Public sitemap and job
detail paths are allowed. The collector validates the published Apply now
control but never fetches the disallowed application, talent-community or
services endpoints. Canonical slug, posting title and application identity must
agree. Missing or mismatched details fail the whole source, preserving prior data.

The real isolated import at 2026-10-16T14:49:49.429Z found these open paid postings:

| Posting | Published minimum age | Published hourly rate | Closing date |
| --- | --- | --- | --- |
| Swim Instructor & Lifeguard | 15 | $24.26 | October 19, 2026 |
| Personal Trainer | 18 | $37.73 | November 1, 2026 |
| Aquafit Instructor - Certified | 16 | $37.73 | October 19, 2026 |
| Outdoor Skate Instructor | 15 | $21.09 | November 1, 2026 |
| Fitness Floor Staff | 18 | $22.42 | November 1, 2026 |

These are five postings, not the sum of their advertised position counts.
Required certifications and permitted completion periods remain in each listing;
age alone is not a statement of unconditional eligibility. No grades, posting
dates, start dates or closing times are invented. A positive published vacancy
count plus the matching Apply control establishes open intake; future-vacancy
pools remain unknown. Date-only closing notices are stored separately as
`applicationClosingDate`. They expire after the published Toronto calendar day,
including daylight-saving changes. The precise `applicationDeadline` stays null.

The second new feed is [Hack Club](https://hackclub.com/), whose active email
Join control, worldwide eligibility for ages 13–18, free membership and online
community are stated on its public page. Robots and its linked
[privacy and terms](https://hackclub.com/privacy-and-terms) were reviewed. This is
one open youth-program intake. It does not imply a paid internship, a guaranteed
award, or admission to any separate challenge or event. No signup was submitted.

Both sources default on and use the existing six-hour cadence. The isolated live
import produced six active records. Controlled replay of those just-fetched
responses passed repeat deduplication, the exact six-hour refresh boundary, and
firstSeenAt/lastSeenAt/lastVerifiedAt preservation on repeats, skips and failures.

## Sources still excluded

Unrestricted workspace access now works; previous CONNECT denials are historical.
However, McDonald's actual careers-linked
[September 2023 terms](https://www.mcdonalds.com/ca/en-ca/terms-and-conditions/loyaltyrewards.html)
prohibit launching automated systems such as robots and spiders. Mathnasium's
[Canada terms](https://www.mathnasium.com/ca/terms-of-use) prohibit automated access,
and HigherMe's [terms](https://higherme.com/terms-of-use), linked from Tim Hortons'
hiring flow, prohibit automated collection. These sources have not been enabled.
Job Bank's recorded prohibition also remains in force.

Kumon and JA Central Ontario returned site-level HTTP 403, Megamind HTTP 202 with
no usable page, and Walmart's linked terms redirected to its blocked page. No
challenge was bypassed. Mathnasium's independently hosted, officially linked
Workstream board displayed zero open positions. Toronto's five recreation
postings explicitly describe future-vacancy talent pools; Mississauga's co-op
postings require post-secondary enrolment. None became current high-school
vacancies. No current high-school internship or open summer intake has been
claimed from those findings.

Production completion must be checked against the deployed commit, successful
workflow/import, source health, paid-job API and visible catalogue. Local checks
alone are not evidence of new production listings.
