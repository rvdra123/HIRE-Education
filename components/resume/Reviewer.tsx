"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { reviewSchema, type ResumeReview } from "@/lib/openai/schema";
import ReviewDashboard from "./ReviewDashboard";
type Prefill = {
  title: string;
  description: string;
  kind: string;
  applicationUrl?: string;
};
export default function Reviewer({ prefill }: { prefill?: Prefill }) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [availabilityCode, setAvailabilityCode] = useState("");
  const [providerName, setProviderName] = useState(
    "the configured AI provider",
  );
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"file" | "text">("file");
  const [resumeText, setResumeText] = useState("");
  const [errorCode, setErrorCode] = useState("");
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
      .then((d) => {
        setAvailable(d.available === true);
        setProviderName(
          d.providerName === "Google Gemini"
            ? "Google Gemini"
            : d.providerName === "OpenAI"
              ? "OpenAI"
              : "the configured AI provider",
        );
        setAvailabilityCode(typeof d.code === "string" ? d.code : "");
      })
      .catch(() => setAvailable(false));
    return () => abort.abort();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setErrorCode("");
    if (
      !consent ||
      (mode === "file" && !file) ||
      (mode === "text" && resumeText.trim().length < 80)
    )
      return;
    if (
      mode === "file" &&
      file &&
      (file.size > 4 * 1024 * 1024 || !/^.+\.(pdf|docx)$/i.test(file.name))
    ) {
      setError("Choose a PDF or DOCX file smaller than 4 MB.");
      return;
    }
    setBusy(true);
    const data = new FormData();
    if (mode === "file" && file) data.set("resume", file);
    else data.set("resumeText", resumeText.trim());
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
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setErrorCode(typeof body?.code === "string" ? body.code : "");
        throw new Error(
          response.status === 413
            ? "This upload exceeds the hosting limit. Use a file under 4 MB or paste your resume text."
            : body?.error ||
                "The reviewer is temporarily unavailable. Please try again later.",
        );
      }
      const parsed = reviewSchema.safeParse(body?.review);
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
      <ReviewDashboard
        review={result}
        title={title}
        applicationUrl={prefill?.applicationUrl}
        onReset={() => {
          setResult(null);
          setFile(null);
          setResumeText("");
          setConsent(false);
          setError("");
          setErrorCode("");
          setTitle(prefill?.title || "");
          setDescription(prefill?.description || "");
        }}
      />
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
            {availabilityCode && (
              <small>Support code: {availabilityCode}</small>
            )}
          </div>
        </div>
        {available === false && (
          <div className="notice-box" role="status">
            <strong>AI reviews are not available yet.</strong>
            <p>
              {availabilityCode === "GEMINI_STUDENT_ELIGIBILITY_UNCONFIRMED"
                ? "Google AI reviews are disabled while we confirm that its service terms permit this student audience. "
                : "The service needs to be connected before resumes can be sent. "}
              You can still use the{" "}
              <Link href="/#resume" prefetch={false}>
                resume and cover letter guides
              </Link>
              .
            </p>
          </div>
        )}
        <fieldset disabled={busy}>
          <div
            className="resume-input-tabs"
            role="group"
            aria-label="Resume input method"
          >
            <button
              type="button"
              aria-pressed={mode === "file"}
              onClick={() => setMode("file")}
            >
              Upload file
            </button>
            <button
              type="button"
              aria-pressed={mode === "text"}
              onClick={() => setMode("text")}
            >
              Paste resume text
            </button>
          </div>
          {mode === "file" ? (
            <label className="upload-field" htmlFor="resume-file">
              <Upload size={26} />
              <strong>{file ? file.name : "Choose your resume"}</strong>
              <span>PDF or DOCX · up to 4 MB · a short student resume</span>
              <input
                id="resume-file"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          ) : (
            <label>
              Resume text
              <textarea
                aria-label="Resume text"
                rows={10}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
                minLength={80}
                maxLength={50000}
                placeholder="Paste your resume here. Remove your home address, phone number, and other details you do not want analysed."
              />
              <span className="small-note">
                {resumeText.length.toLocaleString()} / 50,000 characters. Text
                mode reviews content; it cannot judge your original document
                layout.
              </span>
            </label>
          )}
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
              I agree to send this resume and description to {providerName} for
              this review. I’ve read the{" "}
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
            disabled={
              busy ||
              available !== true ||
              (mode === "file" ? !file : resumeText.trim().length < 80) ||
              !consent
            }
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
          <div className="review-progress" role="status">
            <div className="review-progress-track">
              <span />
            </div>
            <strong>Reviewing your experience and the role requirements</strong>
            <p>
              This usually takes about a minute. Your dashboard will appear here
              when the review is ready.
            </p>
          </div>
        )}
        {error && (
          <div className="form-error" role="alert">
            <p>{error}</p>
            {errorCode && <small>Support code: {errorCode}</small>}
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
          HIRE Education processes your resume in memory and sends it directly
          for analysis, without creating a separate provider file. We do not
          save your resume or results. The selected provider’s API data-use and
          retention rules still apply.
        </p>
        {providerName === "Google Gemini" && (
          <p className="notice-box">
            Google’s unpaid API services can have different data-use terms,
            including use of submitted content to improve products. Student
            access remains disabled until permitted use and data handling are
            confirmed.
          </p>
        )}
        <Link href="/privacy" prefetch={false}>
          Read the full privacy policy
        </Link>
      </aside>
    </div>
  );
}
