import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import DetailActions from "@/components/opportunities/DetailActions";
import { getOpportunity } from "@/lib/opportunities/store";
import { displayDate, displayTime } from "@/lib/format";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const item = await getOpportunity((await params).id);
  return {
    title: item
      ? `${item.title} at ${item.organization} | HIRE Education`
      : "Opportunity unavailable | HIRE Education",
    description: item?.description.slice(0, 155),
  };
}
export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const item = await getOpportunity((await params).id);
  if (!item) notFound();
  const details = [
    ["Organization", item.organization],
    ["Location", item.remote ? "Remote" : item.location],
    ["Opportunity type", item.opportunityType.replaceAll("-", " ")],
    ["Compensation", item.compensation || item.paid],
    [
      "Minimum age",
      item.minimumAge === null
        ? "Not stated. Confirm with the organization."
        : `${item.minimumAge}+`,
    ],
    [
      "Eligible grades",
      item.eligibleGrades.length
        ? item.eligibleGrades.join(", ")
        : "Not stated. Check eligibility.",
    ],
    ["Commitment", item.hours || item.commitment],
    [
      "Application deadline",
      item.applicationDeadline
        ? displayDate(item.applicationDeadline, true)
        : "Not stated",
    ],
    [
      "Start",
      item.startDate
        ? displayTime(item.startDate)
        : "Confirm with the organization",
    ],
    ["End", item.endDate ? displayTime(item.endDate) : "Not stated"],
    [
      "Originally posted",
      item.postedDate ? displayDate(item.postedDate, true) : "Not stated",
    ],
    ["Cost", item.cost || "Not stated. Confirm before registering."],
  ];
  return (
    <>
      <SiteHeader />
      <main className="container feature-page detail-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/" prefetch={false}>
            Home
          </Link>
          <span>/</span>
          <Link href="/opportunities" prefetch={false}>
            Opportunities
          </Link>
          <span>/</span>
          <span>Details</span>
        </nav>
        <div className="page-heading">
          <span className="status-pill">
            {item.status === "expiring-soon"
              ? "Closing soon"
              : "Applications listed as open"}
          </span>
          <h1>{item.title}</h1>
          <p>
            {item.organization} · {item.location}
          </p>
        </div>
        <div className="detail-layout">
          <article>
            <h2>About this opportunity</h2>
            <p className="preserve-lines">{item.description}</p>
            <h2>Who can apply</h2>
            <p>{item.eligibility}</p>
            {item.skills.length > 0 && (
              <>
                <h2>Skills you could develop</h2>
                <div className="listing-tags">
                  {item.skills.map((s) => (
                    <span className="badge" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
            <h2>How to apply</h2>
            <p>
              Read the original posting for complete requirements and follow the
              organization’s application instructions.
            </p>
            <a
              className="btn btn-primary"
              href={item.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply on the official website ↗
            </a>
            <p className="small-note">
              This opens the organization’s application page in a new tab.
            </p>
            <div className="resume-connect">
              <h2>Check your resume for this opportunity</h2>
              <p>
                Bring this posting into the reviewer to get feedback using the
                experience you already have.
              </p>
              <a
                className="btn btn-outline"
                href={`/resume-reviewer?opportunity=${item.id}`}
              >
                Check my resume for this opportunity →
              </a>
            </div>
            <DetailActions id={item.id} />
          </article>
          <aside>
            <dl className="detail-facts">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="verification-box">
              <h3>Source and verification</h3>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.sourceName} ↗
              </a>
              <dl>
                <dt>First found by HIRE</dt>
                <dd>{displayDate(item.firstSeenAt, true)}</dd>
                <dt>Last seen at the source</dt>
                <dd>{displayDate(item.lastSeenAt, true)}</dd>
                <dt>Last successfully verified</dt>
                <dd>{displayDate(item.lastVerifiedAt, true)}</dd>
              </dl>
            </div>
          </aside>
        </div>
        <p className="catalogue-notice">
          Opportunity availability, deadlines, eligibility, and requirements may
          change. Always confirm details with the organization before applying.
        </p>
      </main>
    </>
  );
}
