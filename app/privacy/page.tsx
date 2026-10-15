import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import { reviewConfiguration } from "@/lib/ai/config";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Privacy Policy | HIRE Education",
  description:
    "How HIRE Education handles optional browser storage, resume reviews, and website data.",
};
export default function PrivacyPage() {
  const email = process.env.PRIVACY_CONTACT_EMAIL;
  const ai = reviewConfiguration();
  return (
    <>
      <SiteHeader />
      <main className="container feature-page policy-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/" prefetch={false}>
            Home
          </Link>
          <span>/</span>
          <span>Privacy policy</span>
        </nav>
        <div className="page-heading">
          <h1>Privacy policy</h1>
          <p>
            Last updated October 15, 2026. This policy describes the features
            currently implemented by{" "}
            {process.env.SITE_OPERATOR_NAME || "HIRE Education"}.
          </p>
        </div>
        <section>
          <h2>Who we are</h2>
          <p>
            HIRE Education provides career information for high school students
            in Brampton, Ontario, Canada. We do not run the external employers,
            programs, or platforms linked from this site.
          </p>
          <p>
            {email ? (
              <>
                Privacy contact: <a href={`mailto:${email}`}>{email}</a>.
              </>
            ) : (
              <>
                A privacy contact has not been configured yet. The operator must
                publish a working privacy contact before making resume analysis
                publicly available.
              </>
            )}
          </p>
        </section>
        <section>
          <h2>Information used by this website</h2>
          <ul>
            <li>
              <strong>Browsing:</strong> our application does not use
              advertising trackers, third-party analytics, or account
              registration. Our hosting and security providers may process
              standard request information, such as IP addresses, timestamps,
              and browser information, under their own retention settings.
            </li>
            <li>
              <strong>Privacy choice:</strong> we save your accept or decline
              choice in this browser so we do not ask on every visit.
            </li>
            <li>
              <strong>Optional saved progress:</strong> if you accept optional
              storage, bookmarks and checklist progress are stored in your
              browser’s local storage. They are not uploaded to a HIRE Education
              account or database.
            </li>
            <li>
              <strong>Resume reviews:</strong> the file, selected grade if
              provided, opportunity type, target title, and pasted description
              are sent to our server and then to {ai.providerName} only after
              your separate agreement for that review.
            </li>
            <li>
              <strong>Abuse prevention:</strong> we keep temporary usage
              counters and, when a trusted hosting IP header is available, a
              keyed hash of that identifier. We do not store raw IP addresses in
              the application’s rate-limit table. Infrastructure logs are
              separate.
            </li>
          </ul>
        </section>
        <section id="ai-processing">
          <h2>AI resume processing</h2>
          <p>
            Your resume is used only to generate your review. Avoid including
            information you do not want analyzed. Remove your home address, date
            of birth, SIN, banking details, identification documents, and any
            information about other people that you do not have permission to
            share.
          </p>
          <p>
            We process uploads in memory, without writing resume contents to
            disk or our database. DOCX files are converted to plain text. PDFs
            are passed to the configured AI provider for analysis. The target
            description and resume are treated as untrusted data, and the
            reviewer is instructed not to follow instructions contained in them.
          </p>
          {ai.provider === "openai" ? (
            <p>
              We send the document or its extracted text directly in an OpenAI
              Responses API request with the storage option set to false. We do
              not create a separate uploaded file in the provider’s Files
              service. This is not a promise of zero provider retention: OpenAI
              may retain security and abuse-monitoring information under its API
              data policies. Processing may take place outside Canada.
            </p>
          ) : (
            <div className="notice-box">
              <p>
                Google Gemini has been selected, but student processing is
                currently disabled until its service terms and permitted
                audience are confirmed. Guardian consent does not override a
                provider’s age or service restrictions.
              </p>
              <p>
                If an eligible Google service is activated, resume text or a PDF
                would be sent directly to Google’s API without creating a
                separate provider file. Unpaid Google API services may use
                submitted content and generated responses to improve products
                and may involve human review. Confidential, sensitive, and
                identifying information should not be submitted. Paid-service
                data handling can differ. No promise of zero provider retention
                is made.
              </p>
              <p>
                See{" "}
                <a
                  href="https://ai.google.dev/gemini-api/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google’s current Gemini API terms
                </a>{" "}
                and{" "}
                <a
                  href="https://ai.google.dev/gemini-api/docs/usage-policies"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  usage policies
                </a>
                . Processing may take place outside Canada.
              </p>
            </div>
          )}
          <p>
            Review results stay in this page’s memory and are not saved to your
            browser’s optional storage or our database. Closing or reloading the
            page clears the displayed review. We do not use your submissions to
            train our own AI model, sell resumes, or use them for advertising.
          </p>
          <p>
            Read{" "}
            <a
              href={
                ai.provider === "openai"
                  ? "https://openai.com/policies/privacy-policy/"
                  : "https://policies.google.com/privacy"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {ai.provider === "openai"
                ? "OpenAI’s privacy policy"
                : "Google’s privacy policy"}
            </a>{" "}
            and{" "}
            <a
              href={
                ai.provider === "openai"
                  ? "https://platform.openai.com/docs/guides/your-data"
                  : "https://ai.google.dev/gemini-api/terms"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              API data controls documentation
            </a>{" "}
            for its current practices. AI feedback can be incomplete or
            incorrect. Scores are educational guidance and do not predict
            employment or reproduce a real employer’s screening system.
          </p>
        </section>
        <section>
          <h2>Students and guardian involvement</h2>
          <p>
            The site is designed for high school students. Do not submit
            personal documents for someone else without their permission.
            Students who need a parent or guardian’s permission under applicable
            law or service rules should obtain it before using AI analysis. A
            parent, guardian, or trusted school adult can help review what you
            share. Students can use the public guides without submitting a
            resume.
          </p>
        </section>
        <section>
          <h2>Your choices</h2>
          <p>
            Use the Privacy settings button to change your choice at any time.
            Declining optional storage clears this site’s saved bookmarks and
            checklist data from this browser. Basic browsing and AI-review
            consent are separate. You can clear stored information through your
            browser settings, and you may stop using the AI reviewer without
            losing access to the guides.
          </p>
          <p>
            Optional browser data remains until you withdraw permission, clear
            it, or the browser removes it. Application rate-limit counters are
            removed after their window has expired and a later request performs
            cleanup, normally within about two days while the site is in use.
            Provider security retention can differ from our in-memory
            processing. Public opportunity records and source-check history may
            be retained for quality control.
          </p>
        </section>
        <section>
          <h2>External websites and videos</h2>
          <p>
            External application, learning, and YouTube links open the
            provider’s website. We do not embed YouTube players or load their
            tracking scripts. Once you follow a link, the provider’s privacy and
            account rules apply. Check age requirements and privacy settings
            before creating an account.
          </p>
        </section>
        <section>
          <h2>Security and service providers</h2>
          <p>
            We use upload validation, size limits, server-side secrets, request
            limits, and protected maintenance endpoints. No internet service can
            guarantee complete security. Hosting, database, and AI providers
            process information needed to deliver the service. The operator must
            review their agreements, access controls, retention settings, and
            cross-border processing before public launch.
          </p>
        </section>
        <section>
          <h2>Access, correction, deletion, and complaints</h2>
          <p>
            Contact the privacy address above with a question or request. Avoid
            sending a resume, SIN, banking details, or other unnecessary
            personal information in your message. Browser-only information can
            be deleted using Privacy settings or your browser. We cannot
            retrieve a review that was never stored, and provider-held
            information may be subject to the provider’s own request process. We
            will explain the information we actually hold and the options
            available under applicable law.
          </p>
        </section>
        <section>
          <h2>Changes to this policy</h2>
          <p>
            We will update this page when our data handling changes. A new
            purpose involving optional storage or resume processing will require
            an appropriate new choice before that processing begins.
          </p>
        </section>
      </main>
    </>
  );
}
