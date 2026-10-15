"use client";
import { useState } from "react";
import { ArrowRight, Check, Copy, Download, RotateCcw } from "lucide-react";
import type { ResumeReview } from "@/lib/openai/schema";
import { scoreLabel } from "@/lib/openai/schema";

const categories = {
  formatting: [
    "Formatting & readability",
    "Use clear sections, consistent spacing, and a layout that is easy to scan.",
  ],
  content: [
    "Content",
    "Use specific, truthful details that show what you contributed.",
  ],
  experience: [
    "Experience",
    "School projects, clubs, sport, volunteering, and family responsibilities can all provide evidence.",
  ],
  skills: [
    "Skills",
    "Connect the skills you list to examples you can explain in an interview.",
  ],
  ats: [
    "ATS readability",
    "Use readable text and conventional section names. This is a readability estimate, not an employer’s ATS test.",
  ],
  professionalism: [
    "Professionalism",
    "Check spelling, consistency, and whether your wording is appropriate for the role.",
  ],
  jobRelevance: [
    "Relevance to the role",
    "Make the experience and skills most useful for this posting easy to find.",
  ],
} as const;
type Category = keyof typeof categories;
const sections = [
  "Overview",
  "Role match",
  "Bullet rewrites",
  "Writing & layout",
] as const;

function Points({ title, items }: { title: string; items: string[] }) {
  const unique = [...new Set(items)].filter(Boolean);
  return (
    <section className="dashboard-points">
      <h3>{title}</h3>
      {unique.length ? (
        <ul>
          {unique.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No specific issues were identified here.</p>
      )}
    </section>
  );
}
export default function ReviewDashboard({
  review,
  title,
  onReset,
  applicationUrl,
}: {
  review: ResumeReview;
  title: string;
  onReset: () => void;
  applicationUrl?: string;
}) {
  const [section, setSection] = useState<(typeof sections)[number]>("Overview");
  const [selected, setSelected] = useState<Category>("formatting");
  const [completed, setCompleted] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const ordered = (Object.entries(review.scores) as [Category, number][]).sort(
    (a, b) => a[1] - b[1],
  );
  const highest = ordered[ordered.length - 1][1];
  const lowest = ordered[0][1];
  const strongestCount = ordered.filter(
    ([, score]) => score === highest,
  ).length;
  const lowestCount = ordered.filter(([, score]) => score === lowest).length;
  function download() {
    const text = [
      "HIRE Education resume review",
      `Target: ${title}`,
      `Overall: ${review.overallScore}/100`,
      review.summary,
      ...Object.entries(review.scores).map(
        ([key, value]) => `${categories[key as Category][0]}: ${value}/10`,
      ),
      "\nYour next three steps",
      ...review.topActions.map((item, i) => `${i + 1}. ${item}`),
      "\nStrengths",
      ...review.strengths,
      "\nImprovements",
      ...review.improvements,
      `\nRole match: ${review.jobMatch.score}/100`,
      review.jobMatch.summary,
      ...review.jobMatch.topChanges,
      "\nBullet rewrites",
      ...review.bulletRewrites.flatMap((item) => [
        `Original: ${item.original}`,
        `Suggested: ${item.suggested}`,
        `Why: ${item.why}`,
      ]),
      "\nWriting & layout",
      ...review.grammarIssues,
      ...review.missingSections,
      review.atsFeedback.summary,
      review.atsFeedback.limitations,
      "\nScores are educational estimates, not a hiring prediction or an employer’s ATS result.",
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "HIRE-Education-resume-feedback.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="review-dashboard" id="review-results" tabIndex={-1}>
      <div className="dashboard-heading">
        <div>
          <h2>Your resume review</h2>
          <p>{title}</p>
        </div>
        <button className="btn btn-outline" onClick={download}>
          <Download size={16} />
          Download feedback
        </button>
      </div>
      <div className="dashboard-overview">
        <div className="dashboard-score">
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <circle cx="80" cy="80" r="67" className="score-track" />
            <circle
              cx="80"
              cy="80"
              r="67"
              className="score-value"
              style={{
                strokeDasharray: 421,
                strokeDashoffset: 421 * (1 - review.overallScore / 100),
              }}
            />
          </svg>
          <div>
            <strong>{review.overallScore}</strong>
            <span>out of 100</span>
          </div>
        </div>
        <div className="dashboard-summary">
          <h3>{scoreLabel(review.overallScore)}</h3>
          <p>{review.summary}</p>
          <p className="small-note">
            Educational feedback based on this resume and posting. It does not
            predict whether you will be hired.
          </p>
        </div>
      </div>
      <div className="dashboard-metrics">
        <div>
          <span>Match with this role</span>
          <strong>
            {review.jobMatch.score}
            <small>/100</small>
          </strong>
        </div>
        <div>
          <span>Your strongest area</span>
          <strong className="metric-text">
            {strongestCount > 1
              ? `${strongestCount} areas at ${highest}/10`
              : categories[ordered[ordered.length - 1][0]][0]}
          </strong>
        </div>
        <div>
          <span>Lowest category score</span>
          <strong className="metric-text">
            {lowestCount > 1
              ? `${lowestCount} areas at ${lowest}/10`
              : categories[ordered[0][0]][0]}
          </strong>
        </div>
      </div>
      <div className="dashboard-tabs" role="group" aria-label="Review sections">
        {sections.map((item) => (
          <button
            key={item}
            aria-pressed={section === item}
            onClick={() => setSection(item)}
          >
            {item}
            {item === "Bullet rewrites" && (
              <span>{review.bulletRewrites.length}</span>
            )}
          </button>
        ))}
      </div>
      <div className="dashboard-panel" key={section}>
        {section === "Overview" && (
          <>
            <section className="dashboard-breakdown">
              <h3>How your resume scored</h3>
              <div className="dashboard-category-grid">
                {(Object.entries(review.scores) as [Category, number][]).map(
                  ([key, value]) => (
                    <button
                      key={key}
                      className={selected === key ? "selected-category" : ""}
                      aria-pressed={selected === key}
                      onClick={() => setSelected(key)}
                    >
                      <span>
                        {categories[key][0]}
                        <strong>{value}/10</strong>
                      </span>
                      <progress
                        max={10}
                        value={value}
                        aria-label={categories[key][0]}
                      />
                    </button>
                  ),
                )}
              </div>
              <p className="category-explanation">
                <strong>{categories[selected][0]}:</strong>{" "}
                {categories[selected][1]}
              </p>
            </section>
            <section className="dashboard-actions">
              <div>
                <h3>Your next three steps</h3>
                <span>{completed.length} of 3 checked</span>
              </div>
              {review.topActions.map((action, index) => (
                <label key={action}>
                  <input
                    type="checkbox"
                    checked={completed.includes(index)}
                    onChange={() =>
                      setCompleted(
                        completed.includes(index)
                          ? completed.filter((i) => i !== index)
                          : [...completed, index],
                      )
                    }
                  />
                  <span>{action}</span>
                </label>
              ))}
            </section>
            <div className="review-columns">
              <Points
                title="What’s working"
                items={[...review.strengths, ...review.strongestSections]}
              />
              <Points
                title="What to improve"
                items={[...review.improvements, ...review.weaknesses]}
              />
            </div>
          </>
        )}
        {section === "Role match" && (
          <>
            <section className="dashboard-match">
              <h3>How your experience fits the posting</h3>
              <strong>{review.jobMatch.score}/100</strong>
              <p>{review.jobMatch.summary}</p>
            </section>
            <div className="review-columns">
              <Points
                title="Relevant strengths"
                items={review.jobMatch.relevantStrengths}
              />
              <Points
                title="Skills to emphasize"
                items={review.jobMatch.emphasizedSkills}
              />
              <Points
                title="Experience to highlight"
                items={review.jobMatch.highlightExperience}
              />
              <Points
                title="Potential gaps"
                items={review.jobMatch.potentialGaps}
              />
            </div>
            <Points
              title="Changes before you apply"
              items={review.jobMatch.topChanges}
            />
          </>
        )}
        {section === "Bullet rewrites" && (
          <>
            <h3>Make your experience easier to understand</h3>
            <p className="small-note">
              Use a suggestion only when it accurately describes what you did.
            </p>
            {review.bulletRewrites.length ? (
              review.bulletRewrites.map((item, index) => (
                <article className="dashboard-rewrite" key={index}>
                  <div>
                    <span>Original</span>
                    <p>{item.original}</p>
                  </div>
                  <ArrowRight size={18} />
                  <div>
                    <span>Suggested</span>
                    <p>{item.suggested}</p>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(item.suggested);
                          setNotice("Suggested bullet copied.");
                        } catch {
                          setNotice("Select the suggestion text to copy it.");
                        }
                      }}
                    >
                      <Copy size={14} />
                      Copy suggestion
                    </button>
                  </div>
                  <p>
                    <strong>Why it helps:</strong> {item.why}
                  </p>
                </article>
              ))
            ) : (
              <p>
                No supported bullet rewrites were returned. The overview still
                contains your next steps.
              </p>
            )}
          </>
        )}
        {section === "Writing & layout" && (
          <>
            <div className="review-columns">
              <Points
                title="Sections to consider"
                items={review.missingSections}
              />
              <Points
                title="Grammar and wording"
                items={review.grammarIssues}
              />
            </div>
            <section className="dashboard-points">
              <h3>Readability and ATS limitations</h3>
              <p>{review.atsFeedback.summary}</p>
              <Points
                title="Readability concerns"
                items={review.atsFeedback.concerns}
              />
              <p className="small-note">{review.atsFeedback.limitations}</p>
            </section>
          </>
        )}
      </div>
      <div className="review-bottom">
        <button className="btn btn-outline" onClick={onReset}>
          <RotateCcw size={16} />
          Review another resume
        </button>
        <button className="btn btn-outline" onClick={onReset}>
          Clear review
        </button>
        {applicationUrl && (
          <a
            className="btn btn-primary"
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit official application <ArrowRight size={16} />
          </a>
        )}
        <span className="small-note">
          <Check size={14} />
          Results stay in this page until you clear or reload it.
        </span>
      </div>
      <p className="sr-only" role="status">
        {notice}
      </p>
    </div>
  );
}
