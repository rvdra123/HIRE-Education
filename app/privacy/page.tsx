import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Privacy Policy | HIRE Education",
  description:
    "How HIRE Education handles browser-only resume checking, optional saved progress, and website data.",
};
export default function PrivacyPage() {
  const email = process.env.PRIVACY_CONTACT_EMAIL;
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
                A privacy contact has not been published yet. The site operator
                is responsible for adding a working contact for questions and
                requests.
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
              registration. Hosting and security providers may process standard
              request information, such as IP addresses, timestamps, and browser
              information, under their own retention settings. Loading the
              website and its document-reading software generates normal asset
              requests.
            </li>
            <li>
              <strong>Privacy choice:</strong> we save your accept or decline
              choice in this browser so we do not ask on every visit.
            </li>
            <li>
              <strong>Optional saved progress:</strong> if you accept optional
              storage, bookmarks and application checklist progress are stored
              in your browser’s local storage. They are not uploaded to a HIRE
              Education account or database. Resume contents, job descriptions,
              interview drafts, and resume results are excluded.
            </li>
            <li>
              <strong>Resume checking:</strong> your selected file is read
              locally in your browser. Its name, extracted text, pasted resume,
              target role, posting, and checklist results are not sent to our
              server or an AI provider by this checker.
            </li>
            <li>
              <strong>Public catalogue:</strong> opportunity filters, search
              terms, and page numbers may be sent to our catalogue service to
              return public listings. Do not enter personal documents in public
              search fields.
            </li>
          </ul>
        </section>
        <section id="resume-processing">
          <span id="ai-processing" />
          <h2>Browser-only resume checking</h2>
          <p>
            The free checker uses fixed text rules on your device. It is not an
            AI service and does not require an API key. PDF, DOCX, and TXT files
            are read into page memory; you can inspect and edit the extracted
            text before running the checks. PDF-reading software is served with
            this website. The checker does not upload documents or call a model
            provider.
          </p>
          <p>
            The file name, text, posting, results, and dashboard progress are
            held in page memory, not saved to local storage, a HIRE Education
            database, or an account. They remain available while you edit and
            check again. Use Clear all fields or Clear review to remove them
            from the page. Reloading or leaving the page also clears application
            state. Your browser may manage its own history, caches, extensions,
            or session restoration outside our control.
          </p>
          <p>
            Downloading feedback creates a text file on your device only when
            you choose Download feedback. Using Copy suggestion places the
            selected text in your system clipboard. You control these local
            copies, including on shared or school-managed devices.
          </p>
          <p>
            Leave out your SIN, banking details, date of birth, identification
            documents, exact home address, and unnecessary information about
            other people. The checker does not need these details. Only open
            documents you are entitled to use.
          </p>
          <p>
            Scores measure checklist completion and selected posting-term
            coverage. They do not assess your ability, verify qualifications,
            reproduce an employer’s screening system, check spelling, or predict
            employment. Review the original document and posting yourself.
          </p>
          <p>
            The former server-based resume review endpoint is disabled. Existing
            API keys do not activate an external review flow. If external AI
            processing is introduced later, its provider, purposes, data
            handling, eligibility rules, and a separate choice will be explained
            before any submission.
          </p>
        </section>
        <section>
          <h2>Students and guardian involvement</h2>
          <p>
            The site is designed for high school students. A parent, guardian,
            or trusted school adult can help you decide what belongs in a resume
            and review the feedback. You can use the public guides without
            opening a personal document. External employers and services have
            their own age and permission requirements.
          </p>
        </section>
        <section>
          <h2>Your choices and retention</h2>
          <p>
            Use Privacy settings to change your storage choice at any time.
            Declining optional storage clears this site’s saved bookmarks and
            application checklist data from this browser. The resume checker
            works with either choice and does not save its inputs or results in
            optional storage.
          </p>
          <p>
            Optional browser data remains until you withdraw permission, clear
            it, or the browser removes it. Public opportunity records and
            source-check history may be retained for quality control. Temporary
            request counters from earlier server features may remain until
            routine expiry cleanup; they do not contain resume text.
            Infrastructure logs have separate retention settings controlled by
            the host.
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
            We use document size and complexity limits, server-side secrets for
            protected services, and protected maintenance endpoints. No internet
            service can guarantee complete security. Hosting and database
            providers process information needed to deliver the website and
            public catalogue. Their operations may take place outside Canada.
            The site operator is responsible for reviewing agreements, access
            controls, and retention settings.
          </p>
        </section>
        <section>
          <h2>Access, correction, deletion, and complaints</h2>
          <p>
            Use the privacy contact above for questions or requests. Avoid
            sending a resume, SIN, banking details, or other unnecessary
            personal information. Optional browser information can be removed
            through Privacy settings or your browser. Resume inputs and results
            are not available to us for retrieval or deletion because the
            checker does not send them to us. Delete any downloaded feedback and
            clear clipboard copies on your own device when needed. We will
            explain information we actually hold and the options available under
            applicable law.
          </p>
        </section>
        <section>
          <h2>Changes to this policy</h2>
          <p>
            We will update this page when data handling changes. A new purpose
            involving optional storage or external resume processing will
            require an appropriate new choice before it begins.
          </p>
        </section>
      </main>
    </>
  );
}
