"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import {
  reviewSchema,
  scoreLabel,
  type ResumeReview,
} from "@/lib/openai/schema";
type Prefill = {
  title: string;
  description: string;
  kind: string;
  applicationUrl?: string;
};
const labels = {
  formatting: "Formatting & readability",
  content: "Content",
  experience: "Experience",
  skills: "Skills",
  ats: "ATS readability",
  professionalism: "Professionalism",
  jobRelevance: "Job relevance",
};
export default function Reviewer({ prefill }: { prefill?: Prefill }) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [grade, setGrade] = useState("");
  const [kind, setKind] = useState(
    prefill?.kind &&
      [
        "job",
        "volunteer",
        "internship",
        "summer-program",
        "youth-program",
        "career-program",
      ].includes(prefill.kind)
      ? prefill.kind
      : "other",
  );
  const [title, setTitle] = useState(prefill?.title || "");
  const [description, setDescription] = useState(prefill?.description || "");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResumeReview | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/resume-review", { signal: abort.signal })
      .then((r) => r.json())
      .then((d) => setAvailable(d.available === true))
      .catch(() => setAvailable(false));
    return () => abort.abort();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!file || !consent) return;
    if (file.size > 6 * 1024 * 1024 || !/^.+\.(pdf|docx)$/i.test(file.name)) {
      setError("Choose a PDF or DOCX file smaller than 6 MB.");
      return;
    }
    setBusy(true);
    const data = new FormData();
    data.set("resume", file);
    data.set("grade", grade);
    data.set("kind", kind);
    data.set("title", title);
    data.set("description", description);
    data.set("consent", "yes");
    try {
      const response = await fetch("/api/resume-review", {
        method: "POST",
        body: data,
        signal: AbortSignal.timeout(110000),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "The review could not be completed.");
      const parsed = reviewSchema.safeParse(body.review);
      if (!parsed.success)
        throw new Error(
          "The review format could not be read. Please try again.",
        );
      setResult(parsed.data);
      setFile(null);
      setConsent(false);
      requestAnimationFrame(() =>
        document.getElementById("review-results")?.focus(),
      );
    } catch (e) {
      setError(
        e instanceof Error && e.name === "TimeoutError"
          ? "The review took too long. Please try again later."
          : e instanceof Error
            ? e.message
            : "The review could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <div className="review-results" id="review-results" tabIndex={-1}>
        <div className="review-result-top">
          <div>
            <span className="eyebrow">Your resume review</span>
            <h2>{scoreLabel(result.overallScore)} student resume</h2>
            <p>{result.summary}</p>
          </div>
          <div className="overall-score">
            <strong>{result.overallScore}</strong>
            <span>/ 100</span>
          </div>
        </div>
        <p className="notice-box">
          These scores are educational guidance, not an employer’s hiring score,
          an ATS test result, or your chance of getting hired.
        </p>
        <div className="score-grid">
          {Object.entries(result.scores).map(([key, value]) => (
            <div key={key}>
              <div>
                <span>{labels[key as keyof typeof labels]}</span>
                <strong>{value}/10</strong>
              </div>
              <progress
                max={10}
                value={value}
                aria-label={labels[key as keyof typeof labels]}
              />
            </div>
          ))}
        </div>
        <div className="review-columns">
          <Feedback
            title="What’s working"
            items={[...result.strengths, ...result.strongestSections]}
          />
          <Feedback
            title="What you can improve"
            items={[...result.improvements, ...result.weaknesses]}
          />
        </div>
        {result.bulletRewrites.length > 0 && (
          <section className="review-block">
            <h3>Make your bullet points stronger</h3>
            {result.bulletRewrites.map((b, i) => (
              <div className="bullet-rewrite" key={i}>
                <div>
                  <small>Original</small>
                  <p>{b.original}</p>
                </div>
                <ArrowRight size={19} />
                <div>
                  <small>Suggested</small>
                  <p>{b.suggested}</p>
                </div>
                <p className="rewrite-reason">
                  <strong>Why it helps:</strong> {b.why}
                </p>
              </div>
            ))}
          </section>
        )}
        <section className="review-block">
          <div className="match-heading">
            <h3>Match with this opportunity</h3>
            <span>{result.jobMatch.score}/100 educational match</span>
          </div>
          <p>{result.jobMatch.summary}</p>
          <div className="review-columns">
            <Feedback
              title="Relevant strengths"
              items={result.jobMatch.relevantStrengths}
            />
            <Feedback
              title="Skills this role emphasizes"
              items={result.jobMatch.emphasizedSkills}
            />
            <Feedback
              title="Experience to highlight"
              items={result.jobMatch.highlightExperience}
            />
            <Feedback
              title="Potential gaps"
              items={result.jobMatch.potentialGaps}
            />
          </div>
          <Feedback
            title="Top changes before applying"
            items={result.jobMatch.topChanges}
          />
        </section>
        <details className="review-block">
          <summary>Sections, wording, and ATS readability</summary>
          <div className="review-columns">
            <Feedback title="Missing sections" items={result.missingSections} />
            <Feedback
              title="Grammar and wording"
              items={result.grammarIssues}
            />
          </div>
          <h4>ATS readability</h4>
          <p>{result.atsFeedback.summary}</p>
          <Feedback
            title="Readability concerns"
            items={result.atsFeedback.concerns}
          />
          <p>{result.atsFeedback.limitations}</p>
        </details>
        <section className="next-actions">
          <h3>Your next three steps</h3>
          <ol>
            {result.topActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </section>
        <div className="review-bottom">
          <button className="btn btn-outline" onClick={() => setResult(null)}>
            <RotateCcw size={16} />
            Review another resume
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              setResult(null);
              setDescription("");
              setTitle("");
              setError("");
            }}
          >
            <X size={16} />
            Clear review
          </button>
          {prefill?.applicationUrl && (
            <a
              className="btn btn-primary"
              href={prefill.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply on the official website <ArrowRight size={16} />
            </a>
          )}
        </div>
        <p className="small-note">
          This review stays in this page’s memory. HIRE Education does not save
          your resume or review to its database.
        </p>
      </div>
    );
  return (
    <div className="reviewer-layout">
      <form className="reviewer-form" onSubmit={submit}>
        <div className="form-heading">
          <FileCheck2 size={23} />
          <div>
            <h2>Get feedback on your resume</h2>
            <p>
              School projects, clubs, sports, and volunteering all count as
              experience.
            </p>
          </div>
        </div>
        {available === false && (
          <div className="notice-box" role="status">
            <strong>AI reviews are not available yet.</strong>
            <p>
              The service needs to be connected before resumes can be sent. You
              can still use the{" "}
              <Link href="/#resume" prefetch={false}>
                resume and cover letter guides
              </Link>
              .
            </p>
          </div>
        )}
        <fieldset disabled={busy}>
          <label className="upload-field" htmlFor="resume-file">
            <Upload size={26} />
            <strong>{file ? file.name : "Choose your resume"}</strong>
            <span>PDF or DOCX · up to 6 MB · a short student resume</span>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <div className="form-row">
            <label>
              Your grade (optional)
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="">Prefer not to say</option>
                {[9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Opportunity type
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                {[
                  ["job", "Job"],
                  ["volunteer", "Volunteering"],
                  ["internship", "Internship"],
                  ["summer-program", "Summer program"],
                  ["youth-program", "Youth program"],
                  ["career-program", "Career program"],
                  ["other", "Other"],
                ].map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Target role
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={150}
              placeholder="For example, part-time recreation assistant"
            />
          </label>
          <label>
            Job posting or opportunity description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={60}
              maxLength={16000}
              rows={8}
              placeholder="Paste the responsibilities, qualifications, and application requirements."
            />
            <small>
              {description.length.toLocaleString()} / 16,000 characters
            </small>
          </label>
          <div className="review-privacy">
            <ShieldCheck size={20} />
            <p>
              Your resume is used only to generate your review. Avoid including
              information you do not want analyzed. Remove your street address,
              date of birth, SIN, banking details, and other unnecessary
              personal information.
            </p>
          </div>
          <label className="consent-check">
            <input
              type="checkbox"
              checked={consent}
              required
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I agree to send this resume and description to OpenAI for this
              review. I’ve read the{" "}
              <Link
                href="/privacy#ai-processing"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
              >
                AI processing information
              </Link>
              . If I need a parent or guardian’s permission under the service
              rules that apply to me, I have it.
            </span>
          </label>
          <button
            className="btn btn-primary review-submit"
            disabled={busy || available !== true || !file || !consent}
            type="submit"
          >
            {busy ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Reviewing your resume...
              </>
            ) : (
              <>
                Review my resume
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </fieldset>
        {busy && (
          <p role="status">
            This may take about a minute. Keep this page open.
          </p>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
      </form>
      <aside className="review-explainer">
        <h2>What you’ll get</h2>
        {[
          "A score across seven areas",
          "Strengths and specific improvements",
          "Feedback matched to the role",
          "Bullet rewrites using your real experience",
          "Three changes to make before applying",
        ].map((t) => (
          <p key={t}>
            <CheckCircle2 size={17} />
            {t}
          </p>
        ))}
        <hr />
        <h3>What the score means</h3>
        <p>
          It’s a learning tool. It does not reproduce an employer’s screening
          process or predict an offer.
        </p>
        <h3>Your documents</h3>
        <p>
          HIRE Education processes your upload temporarily and does not save its
          content. We request deletion of the provider file after the review,
          with a one-hour automatic expiry as a backup. Provider security-log
          retention may still apply.
        </p>
        <Link href="/privacy" prefetch={false}>
          Read the full privacy policy
        </Link>
      </aside>
    </div>
  );
}
function Feedback({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="feedback-list">
      <h3>{title}</h3>
      {items.length ? (
        <ul>
          {[...new Set(items)].map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No specific issues were identified in this area.</p>
      )}
    </section>
  );
}
