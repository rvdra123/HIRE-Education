# Course directory review, October 16–17, 2026

The directory now contains **224 courses and learning paths across 18 providers**, including **121 additions**. All 103 previous IDs remain available. These are online learning options students in GTA/Peel can explore, not local job openings or guaranteed admission for every age.

The new coverage includes current HP LIFE business and career courses, Saylor work-skills and introductory computing courses, Harvard CS50, Microsoft Learn, GitHub Skills, University of Helsinki, McGill Personal Finance Essentials, PMI KICKOFF and Ontario Human Rights Commission training. Current course titles and direct URLs replace many generic catalogue links. The existing CS101 record now uses its actual current title, *Introduction to Programming I*; HP's strategic-planning and cybersecurity records use their current titles.

`data/course-verification.json` contains one evidence record per entry. `lib/certificates.ts` distinguishes:

- `course-verified`: current course facts checked in an official public course page or published course definition.
- `provider-verified`: the official provider/programme is reachable and provides useful learning information, while the named course or its current award still needs confirmation. This includes retained catalogue-based entries and the two Elements of AI courses confirmed by their official programme site.
- `unconfirmed`: retained source whose current course facts could not be checked. The supervisor-awareness provider's robots response prevented a new check.

There are **105 entries with explicit no-cost completion-award evidence**. No-cost awards are not professional licences. Microsoft Learn achievements, GitHub practice exercises, AccessForward employer records, optional edX verification, paid professional exams and paid product/cloud usage are described separately. Unconfirmed legacy course awards no longer display a free-certificate promise. Account age, consent, prerequisites and completion requirements are visible in each course's details.

Official evidence includes Saylor's live **Free Certificate** labels; HP's published required activities, `hasCertificate` fields and free-certificate policy; each CS50 course's FAQ distinguishing its free certificate from paid edX verification; and explicit award language from McGill, PMI, Full Stack Open and Ontario sources.

Important findings:

- LearnFree/GCFGlobal's public course metadata returns HTTP 200, but rendered Excel and interview lessons show maintenance/errors. Its 32 researched series were excluded from this expansion.
- GitHub's *Ship with Quality* requires an organization with a separately enabled product, so it was excluded. Other included exercises identify prerequisites and public-repository/free-plan limits; GitHub's account age policy is linked in the research evidence.
- Semrush requires adult registration and prohibits harvesting service content. No Semrush courses were added.
- McGill announces a November 2, 2026 platform migration. Its card preserves the warning to finish existing work by October 29 because progress will not transfer.
- Helsinki's old Java MOOC is an unmaintained legacy course with no further credit exams. It was researched and excluded; current Python and web courses were preferred.
- HubSpot's rendered course failed during the check. Existing entries stay useful as provider links, with their current individual awards explicitly unconfirmed.

Public HTTPS responses, robots checks, source extracts and representative browser captures are saved outside the repository in `/workspace/youth-expansion-2026-10-16/courses/`. Browser checks fetched HTTPS with the environment's verified proxy trust; no certificate validation was disabled. No accounts were created, paid products started or enrollment forms submitted. A successful public-page check does not verify a learner's later login, assessment completion or certificate issuance.
