"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Pencil,
  RotateCcw,
} from "lucide-react";
import type { ChecklistReview } from "@/lib/resume/checker";

const categories = {
  formatting: [
    "Sections & structure",
    "Checks recognizable headings, line breaks, and student-resume word count. It does not inspect the original visual layout.",
  ],
  content: [
    "Bullet detail",
    "Checks action verbs, task or context words, completed contributions, and bullet length. It cannot verify your claims.",
  ],
  experience: [
    "Experience examples",
    "Looks for an experience section and contribution statements. School, clubs, sport, volunteering, and caring responsibilities count.",
  ],
  skills: [
    "Skills coverage",
    "Looks for a Skills heading and terms from a limited student-role vocabulary, including terms in bullets. It cannot judge proficiency.",
  ],
  ats: [
    "Readable text",
    "Checks extracted text for readable characters, short lines and bullets, and standard headings. It does not run an employer’s ATS.",
  ],
  professionalism: [
    "Writing habits",
    "Checks template placeholders, stock phrases, repeated bullets, pronouns, and capitalization. It does not check spelling or grammar.",
  ],
  jobRelevance: [
    "Posting keywords",
    "The proportion of selected posting terms found in your text. Supported related phrases count. Repetition does not earn extra points.",
  ],
} as const;
type Category = keyof typeof categories;
const sections = [
  "Overview",
  "Posting keywords",
  "Bullet edits",
  "Writing & text",
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
  onEdit,
}: {
  review: ChecklistReview;
  title: string;
  onReset: () => void;
  applicationUrl?: string;
  onEdit: () => void;
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
      "HIRE Education checklist-based resume feedback",
      "Generated on your device using fixed text rules. No AI or provider API is used.",
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
      `\nPosting keyword coverage: ${review.jobMatch.score}/100`,
      review.jobMatch.summary,
      ...review.jobMatch.topChanges,
      "\nBullet rewrites",
      ...review.bulletRewrites.flatMap((item) => [
        `Original: ${item.original}`,
        `Suggested: ${item.suggested}`,
        `Why: ${item.why}`,
      ]),
      "\nWriting & text",
      ...review.grammarIssues,
      ...review.missingSections,
      review.atsFeedback.summary,
      review.atsFeedback.limitations,
      "\nAll checks",
      ...review.checks.map(
        (check) =>
          `${check.passed ? "Passed" : "Review"} | ${categories[check.category][0]} | ${check.label}: ${check.evidence}`,
      ),
      "\nEach category is its percentage of checks passed, rounded to /10. Overall is the seven category scores averaged to /100. Scores measure checklist completion, not resume quality, eligibility, or hiring probability.",
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
          <h2>Your resume checklist results</h2>
          <p>{title}</p>
        </div>
        <button className="btn btn-outline" onClick={download}>
          <Download size={16} />
          Download feedback
        </button>
      </div>
      <div className="local-checker-note">
        <Check size={19} aria-hidden="true" />
        <p>
          <strong>Checklist-based feedback, processed on your device.</strong>{" "}
          Fixed text rules check the pasted or extracted text. Your documents
          have not been sent to HIRE Education or an AI provider.
        </p>
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
            <span>checklist /100</span>
          </div>
        </div>
        <div className="dashboard-summary">
          <h3>
            {review.overallScore >= 80
              ? "Most checklist items passed"
              : review.overallScore >= 60
                ? "Several checks to work through"
                : "Start with the next three steps"}
          </h3>
          <p>{review.summary}</p>
          <p className="small-note">
            Each category is the percentage of its checks passed, rounded to
            /10. The overall score averages the seven categories. A high score
            does not establish job suitability or predict an offer.
          </p>
        </div>
      </div>
      <div className="dashboard-metrics">
        <div>
          <span>Posting keyword coverage</span>
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
            {item === "Bullet edits" && (
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
              <details className="checker-method" key={selected}>
                <summary>View the checks for {categories[selected][0]}</summary>
                <ul
                  className="checker-evidence"
                  aria-label={`Checks for ${categories[selected][0]}`}
                >
                  {review.checks
                    .filter((check) => check.category === selected)
                    .map((check) => (
                      <li key={check.label} data-passed={check.passed}>
                        <span>{check.passed ? "Passed" : "Review"}</span>
                        <div>
                          <strong>{check.label}</strong>
                          <p>{check.evidence}</p>
                        </div>
                      </li>
                    ))}
                </ul>
              </details>
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
        {section === "Posting keywords" && (
          <>
            <section className="dashboard-match">
              <h3>Terms found in your resume</h3>
              <strong>{review.jobMatch.score}/100</strong>
              <p>{review.jobMatch.summary}</p>
              <div className="keyword-groups">
                <div>
                  <h4>Found in your text</h4>
                  <div className="keyword-chips">
                    {review.keywords
                      .filter((keyword) => keyword.matched)
                      .map((keyword) => (
                        <span className="keyword-found" key={keyword.label}>
                          {keyword.label}
                        </span>
                      ))}
                    {!review.keywords.some((keyword) => keyword.matched) && (
                      <p>No selected terms found.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4>Not found by the matcher</h4>
                  <div className="keyword-chips">
                    {review.keywords
                      .filter((keyword) => !keyword.matched)
                      .map((keyword) => (
                        <span key={keyword.label}>{keyword.label}</span>
                      ))}
                    {review.keywords.every((keyword) => keyword.matched) && (
                      <p>All selected terms were found.</p>
                    )}
                  </div>
                </div>
              </div>
              <p className="small-note">
                These terms are selected automatically from a limited vocabulary
                and additional words in the posting. The matcher can miss
                relevant wording or include an unhelpful term. Add a term only
                when it truthfully describes your experience.
              </p>
            </section>
            <div className="review-columns">
              <Points
                title="Examples to review for this role"
                items={review.jobMatch.highlightExperience}
              />
              <Points
                title="Before you apply"
                items={review.jobMatch.topChanges}
              />
            </div>
          </>
        )}
        {section === "Bullet edits" && (
          <>
            <h3>Make your experience easier to understand</h3>
            <p className="small-note">
              These are fixed wording edits, not AI rewrites. They do not add
              achievements, duties, or numbers. Use an edit only if it
              accurately describes what you did. For a stronger bullet, add a
              real task, context, or outcome yourself.
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
                No introductory phrases matched the editing rules. You can still
                improve a bullet by explaining what you did, who it helped, and
                a truthful outcome. Numbers are optional.
              </p>
            )}
          </>
        )}
        {section === "Writing & text" && (
          <>
            <div className="review-columns">
              <Points
                title="Sections to consider"
                items={review.missingSections}
              />
              <Points title="Wording checks" items={review.grammarIssues} />
            </div>
            <section className="dashboard-points">
              <h3>Text readability and limits</h3>
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
        <button className="btn btn-primary" onClick={onEdit}>
          <Pencil size={16} aria-hidden="true" />
          Edit and check again
        </button>
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
