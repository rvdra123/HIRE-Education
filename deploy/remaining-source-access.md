# Live coverage beyond volunteering

The successful first production import connected volunteer intakes and library
events. It did not activate paid jobs, internships, competitions, or every program
in the separate official-source directory.

The next verified additions are:

- **Youth Cabinet General Membership**: the [City page](https://www.brampton.ca/EN/residents/Youth/Pages/Brampton-Youth-Cabinet.aspx)
  explicitly says membership applications remain open for Brampton youth aged
  14–29 and publishes the Microsoft Forms application link. This is one leadership
  intake. The already-selected executive team is not advertised as open positions.
- **Summer Company intake monitoring**: the [official program page](https://www.brampton.ca/EN/Business/BEC/youth)
  explicitly says applications are closed. The source is checked every six hours,
  but its closed record is not shown in public results. Old application steps and
  dates, and a reference to January 2027, do not establish a new application window.
  No future dates are manufactured.

Both adapters retain the existing timestamp rules. The live test imports real
pages into isolated temporary storage, tests exactly six hours between checks,
and checks timestamp preservation during skips, updates, and failed checks.

## Paid jobs and other programs remain incomplete

The following requests were rejected by the workspace's proxy with **HTTP CONNECT
403 Forbidden**. These are exact hostnames, not assumed failures of their parent
domains:

| Host | Request checked | Intended coverage |
| --- | --- | --- |
| `careers.brampton.ca` | `/` | City student, part-time and seasonal jobs |
| `careers-peelregion.icims.com` | `/jobs/search` | Peel job postings; eligibility still needs checking |
| `careers.mcdonalds.ca` | `/` | Restaurant jobs |
| `careers.timhortons.ca` | `/` | Restaurant jobs |
| `careers.walmart.ca` | `/` | Retail jobs |
| `www.ontario.ca` | `/page/careers-summer-employment-opportunities` | Student employment and government program information |
| `www.jacentralontario.org` | `/` | Youth entrepreneurship programs |
| `www.skillsontario.com` | `/` | Skilled-trades programs and competitions |
| `forms.cloud.microsoft` | `/r/6gGSDdMWSV` | City-published Youth Cabinet application |

Previously observed proxy-denied hosts also remain in the proposal:
`bramlib.libnet.info`, `form.jotform.com`, `app.betterimpact.com`, and
`api.github.com`. See [the original access report](catalogue-verification.md) for
the requests checked. `ontario.ca` is included alongside `www.ontario.ca` for the
official site's canonical links; no blocked request to that apex host is claimed.

Job Bank's availability changed: `/robots.txt` now returns HTTP 200 and specifies a
five-second crawl delay. The configured Brampton student search returned HTTP 200
with an **HTTP Error 500 - Internal Server Error** document, not job results.
`/termsofuseseeker` returned HTTP 503 with an upstream connection timeout. The
homepage is reachable. This is a provider/search problem, not a confirmed domain
policy denial, and no job feed has been enabled from that response.

The Library careers page accepts resumes on an ongoing basis, without a confirmed
current vacancy in its visible content. That is not imported as a paid opening.
Peel's summer-student information describes post-secondary eligibility and the
past 2026 recruitment process; it is not published as a current high-school intake.

## Environment changes still required

[proposed-source-network-access.json](proposed-source-network-access.json)
preserves the existing custom hosts and adds the exact destinations needed for
further source verification. It contains no credentials.

The supported draft update was rejected with `draft_not_editable`: "This draft
cannot be edited in its current state." Reading it again returned the same draft
revision. **Saving was not confirmed and no network change was applied.**
The proposal is preserved as a transferable file so it can be applied from a new
setup chat opened through this environment's settings.

The [environment setup instructions](skill://plugin_connector_1p_ed5feb9070a08191b08c81c47947bc16/setup/references/onboarding.md)
state: "Agent draft saves do not execute scripts, apply changes to the running
environment, or publish it." Access must be retested after the environment
configuration is saved and applied. Allowing a hostname enables verification;
it does not establish reuse terms, student eligibility, or an actual open listing.
Vercel and GitHub refresh secrets do not need to change for these network requests.
