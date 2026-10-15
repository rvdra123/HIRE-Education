import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Reviewer from "@/components/resume/Reviewer";
import { getOpportunity } from "@/lib/opportunities/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Student AI Resume Reviewer | HIRE Education",
  description:
    "Get feedback on your high school resume against a job or volunteer opportunity.",
  robots: { index: false, follow: true },
};
export default async function ResumeReviewerPage({
  searchParams,
}: {
  searchParams: Promise<{ opportunity?: string }>;
}) {
  const params = await searchParams;
  let opportunity = null;
  try {
    if (params.opportunity)
      opportunity = await getOpportunity(params.opportunity);
  } catch {
    /* The reviewer can still be used with a pasted description. */
  }
  return (
    <>
      <SiteHeader />
      <main className="container feature-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/" prefetch={false}>
            Home
          </Link>
          <span>/</span>
          <Link href="/#resume" prefetch={false}>
            Resume & cover letter
          </Link>
          <span>/</span>
          <span>Resume reviewer</span>
        </nav>
        <div className="page-heading">
          <h1>AI resume reviewer for high school students</h1>
          <p>
            Upload your resume and the role you’re interested in. Get clear
            feedback on what’s working and what to improve.
          </p>
        </div>
        <Reviewer
          prefill={
            opportunity
              ? {
                  title: opportunity.title,
                  description: `${opportunity.description}\n\nEligibility: ${opportunity.eligibility}\nSkills: ${opportunity.skills.join(", ")}\nCommitment: ${opportunity.hours || opportunity.commitment}`,
                  kind: opportunity.opportunityType,
                  applicationUrl: opportunity.applicationUrl,
                }
              : undefined
          }
        />
        <Link
          className="text-link return-link"
          href="/#resume"
          prefetch={false}
        >
          Return to the resume and cover letter guides
        </Link>
      </main>
    </>
  );
}
