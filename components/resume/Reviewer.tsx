"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { checkResume, type ChecklistReview } from "@/lib/resume/checker";
import ReviewDashboard from "./ReviewDashboard";
type Prefill = {
  title: string;
  description: string;
  kind: string;
  applicationUrl?: string;
};

export default function Reviewer({ prefill }: { prefill?: Prefill }) {
  const [mode, setMode] = useState<"file" | "text">("text");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState(prefill?.title || "");
  const [description, setDescription] = useState(prefill?.description || "");
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ChecklistReview | null>(null);
  const operation = useRef(0);
  const wordCount = resumeText.match(/\S+/g)?.length || 0;
  async function openFile(file?: File) {
    const id = ++operation.current;
    setError("");
    setFileName("");
    setResumeText("");
    if (!file) return;
    setReading(true);
    try {
      const { readResumeFile } = await import("@/lib/resume/extract");
      const text = await readResumeFile(file);
      if (id !== operation.current) return;
      setResumeText(text);
      setFileName(file.name);
    } catch (error) {
      if (id !== operation.current) return;
      setError(
        error instanceof Error
          ? error.message
          : "This file could not be read. Paste your resume text instead.",
      );
    } finally {
      if (id === operation.current) setReading(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    try {
      setResult(checkResume({ resume: resumeText, description }));
      requestAnimationFrame(() =>
        document.getElementById("review-results")?.focus(),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The text could not be checked. Review the fields and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function clear() {
    operation.current++;
    setResult(null);
    setResumeText("");
    setFileName("");
    setError("");
    setReading(false);
    setTitle(prefill?.title || "");
    setDescription(prefill?.description || "");
    requestAnimationFrame(() =>
      document.getElementById("resume-text")?.focus(),
    );
  }
  if (result)
    return (
      <ReviewDashboard
        review={result}
        title={title}
        applicationUrl={prefill?.applicationUrl}
        onReset={clear}
        onEdit={() => {
          setResult(null);
          requestAnimationFrame(() =>
            document.getElementById("resume-text")?.focus(),
          );
        }}
      />
    );
  return (
    <div className="reviewer-layout">
      <form className="reviewer-form" onSubmit={submit}>
        <div className="form-heading">
          <FileCheck2 size={23} aria-hidden="true" />
          <div>
            <h2>Check your resume against a posting</h2>
            <p>
              School projects, clubs, sports, and volunteering all count as
              experience.
            </p>
          </div>
        </div>
        <div className="local-checker-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            <strong>Free and processed on this device.</strong> Your resume and
            posting stay in this page. No account, API key, or daily review
            limit.
          </p>
        </div>
        <fieldset disabled={busy || reading}>
          <div
            className="resume-input-tabs"
            role="group"
            aria-label="Resume input method"
          >
            <button
              type="button"
              aria-pressed={mode === "text"}
              onClick={() => setMode("text")}
            >
              Paste resume text
            </button>
            <button
              type="button"
              aria-pressed={mode === "file"}
              onClick={() => setMode("file")}
            >
              Open a file
            </button>
          </div>
          {mode === "file" && (
            <label className="upload-field" htmlFor="resume-file">
              <Upload size={26} aria-hidden="true" />
              <strong>{fileName || "Choose a resume from your device"}</strong>
              <span>PDF, DOCX, or TXT · up to 4 MB · read locally</span>
              <input
                id="resume-file"
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(event) => {
                  void openFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          )}
          <label htmlFor="resume-text">
            {fileName ? "Review and edit the extracted text" : "Resume text"}
          </label>
          <textarea
            id="resume-text"
            aria-label="Resume text"
            rows={12}
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            required
            maxLength={50000}
            placeholder={
              "Paste your resume with headings and line breaks.\n\nEducation\nYour school and expected graduation\n\nProjects or Volunteering\n• What you did and who it helped\n\nSkills\nRelevant skills you can explain"
            }
            aria-describedby="resume-text-help"
          />
          <p className="small-note" id="resume-text-help">
            {wordCount} words · {resumeText.length.toLocaleString()} / 50,000
            characters. Use at least 40 words.{" "}
            {fileName
              ? "Check that headings, bullets, and reading order were extracted correctly. "
              : ""}
            Visual layout and spelling are not checked.
          </p>
          <label>
            Target role
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
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
              onChange={(event) => setDescription(event.target.value)}
              required
              minLength={60}
              maxLength={16000}
              rows={7}
              placeholder="Paste the responsibilities, skills, and qualifications from the posting."
            />
            <small>
              {description.length.toLocaleString()} / 16,000 characters. At
              least 12 words and 60 characters.
            </small>
          </label>
          <button
            className="btn btn-primary review-submit"
            disabled={busy || reading || !resumeText.trim()}
            type="submit"
          >
            {busy ? (
              <>
                <LoaderCircle className="spin" size={18} aria-hidden="true" />
                Checking your resume...
              </>
            ) : (
              <>
                Check my resume
                <ArrowRight size={17} aria-hidden="true" />
              </>
            )}
          </button>
          <button type="button" className="checker-clear" onClick={clear}>
            Clear all fields
          </button>
        </fieldset>
        {reading && (
          <p role="status">
            <LoaderCircle className="spin" size={16} aria-hidden="true" />{" "}
            Reading the file on your device...
          </p>
        )}
        {error && (
          <div className="form-error" role="alert">
            <p>{error}</p>
          </div>
        )}
      </form>
      <aside className="review-explainer">
        <h2>What the checker covers</h2>
        {[
          "Sections and readable text",
          "Posting keywords and related phrases",
          "Action verbs and bullet detail",
          "Common wording and template leftovers",
          "A checklist of changes before you apply",
        ].map((text) => (
          <p key={text}>
            <CheckCircle2 size={17} aria-hidden="true" />
            {text}
          </p>
        ))}
        <hr />
        <h3>How to read the score</h3>
        <p>
          This is checklist-based feedback from fixed text rules. It is not an
          AI review, a real employer’s screening score, or a prediction of being
          hired. You can inspect every check in the dashboard.
        </p>
        <h3>Your documents stay here</h3>
        <p>
          The checker does not send your resume, file name, posting, or results
          to HIRE Education or an AI provider. It does not save them in browser
          storage. Reload the page or clear the fields to remove them. A
          feedback download is saved only when you choose it.
        </p>
        <p>
          Leave out your SIN, date of birth, banking details, and exact home
          address. They are not needed for these checks.
        </p>
        <Link href="/privacy#resume-processing" prefetch={false}>
          Read how resume checking handles your data
        </Link>
      </aside>
    </div>
  );
}
